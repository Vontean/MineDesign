import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';
import { Window } from 'happy-dom';
import { startService, ROOT } from '../src/backend/service.mjs';

// 在 App 的 DOM 边界验证恢复行为，文件与访问授权仍走真实服务。
const bundled=await build({entryPoints:[path.join(ROOT,'src/frontend/app.mjs')],bundle:true,write:false,format:'iife',platform:'browser',define:{__MDN_VERSION__:'"test"'},plugins:[{name:'test-host',setup(b){
  b.onResolve({filter:/^@modelcontextprotocol\/ext-apps$/},()=>({path:'host',namespace:'test'}));
  b.onResolve({filter:/^\.\/virtual\.mjs$/},()=>({path:'bridge',namespace:'test'}));
  b.onLoad({filter:/.*/,namespace:'test'},({path})=>({contents:path==='host'?`export class App { async connect(){} async close(){window.testClosed=true} addEventListener(){} getHostContext(){return {}} async callServerTool(input){return window.testTransport(input)} }`:`export function createBridge(){return window.testBridge}`,loader:'js'}));
}}]});
const html=(await fs.readFile(path.join(ROOT,'src/frontend/app.html'),'utf8')).replace(/<script[\s\S]*?<\/script>/g,'');
async function until(check){const deadline=Date.now()+3000;while(!check()){if(Date.now()>deadline)assert.fail('App did not reach expected state');await new Promise(r=>setTimeout(r,10));}}
async function harness(record,service,{build,shell}={}){
  const win=new Window({url:'https://minedesign.test/'});
  const calls=[];
  win.document.write(html);
  // 嵌入宿主，测试公开的工具响应与用户可见的加载结果。
  Object.defineProperty(win,'parent',{value:{},configurable:true});
  win.MINEDESIGN_CONFIG={documents:[record],...(build?{build}:{})};
  let broken=false;
  win.testTransport=async({name,arguments:args})=>{
    calls.push({name,args});
    if(name==='minedesign_open_document')return {structuredContent:{document:await service.open(args.path,args.kind)}};
    if(name==='minedesign_annotations')return {structuredContent:{annotations:await service.annotations(args.id,args.annotations)}};
    if(name==='minedesign_shell')return {structuredContent:shell(args.build)};
    throw new Error('Unexpected tool '+name);
  };
  win.testBridge={async html(editorPath){
    if(broken)throw new Error(`${editorPath} 读取失败（404）`);
    const response=await service.proxy({path:editorPath});
    if(response.status!==200)throw new Error(`HTTP ${response.status}`);
    return '<p>作品已打开</p>';
  }};
  win.eval(bundled.outputFiles[0].text);
  return {win,calls,breakLoading(value){broken=value;},async ready(){
    const frame=win.document.getElementById('editor');
    await until(()=>!frame.hidden);
    win.dispatchEvent(new win.MessageEvent('message',{source:frame.contentWindow,data:{type:'editor:ready',canEdit:true}}));
  },close:()=>win.happyDOM.close()};
}

test('cached App reopens a stable document after service restart instead of using its stale grant',async()=>{
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-loading-'));
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(tmp,'studio'),{recursive:true});
  const oldService=await startService({workspace:tmp});
  const cached=await oldService.open('studio');
  await oldService.close();
  const service=await startService({workspace:tmp});
  let ui;
  try{
    assert.equal((await service.proxy({path:cached.editorPath})).status,404);
    ui=await harness(cached,service);
    await ui.ready();
    await until(()=>ui.win.document.getElementById('viewport-state').hidden);
    const current=service.documents()[0];
    assert.notEqual(current.editorPath,cached.editorPath);
    assert.equal(current.id,cached.id);
    assert.ok(ui.calls.some(c=>c.name==='minedesign_open_document'&&c.args.path===cached.path));
    assert.match(ui.win.document.getElementById('editor').srcdoc,/作品已打开/);
    assert.equal(ui.win.document.getElementById('viewport-state').hidden,true);
  }finally{if(ui)await ui.close();await service.close();await fs.rm(tmp,{recursive:true,force:true});}
});

test('load failure stays in the viewport; retry reopens the document and preserves feedback',async()=>{
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-error-'));
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(tmp,'studio'),{recursive:true});
  const service=await startService({workspace:tmp});
  const doc=await service.open('studio');
  const noteFile=path.join(ROOT,'.local/annotations',`${doc.id}.json`);
  let ui;
  try{
    await service.annotations(doc.id,[{id:'kept',label:'标题',text:'保留这条意见'}]);
    ui=await harness(doc,service);
    const d=ui.win.document;
    await ui.ready();
    await until(()=>d.getElementById('viewport-state').hidden);
    ui.breakLoading(true);
    d.getElementById('documents').dispatchEvent(new ui.win.Event('change'));
    await until(()=>d.getElementById('viewport-state').dataset.state==='error');
    assert.equal(d.querySelector('header #retry'),null);
    assert.equal(d.querySelector('header [role=status]'),null);
    assert.equal(d.getElementById('editor').hidden,true);
    assert.ok(d.querySelector('.viewport #retry'));
    assert.ok(d.querySelector('#state-illustration [data-illustration="document-unavailable"] svg'));
    assert.match(d.getElementById('error-detail').textContent,/404/);
    assert.equal(d.querySelector('#viewport-state details').open,false);
    assert.equal(d.getElementById('annotate').disabled,true);
    assert.equal(d.getElementById('send').disabled,true);
    assert.match(d.getElementById('annotation-list').textContent,/保留这条意见/);
    ui.breakLoading(false);
    d.getElementById('retry').click();
    assert.equal(d.getElementById('viewport-state').dataset.state,'loading');
    assert.ok(d.querySelector('#state-illustration [data-illustration="document-loading"]'));
    assert.equal(d.querySelector('header [role=status]'),null);
    assert.equal(d.getElementById('retry').hidden,true);
    await ui.ready();
    await until(()=>d.getElementById('viewport-state').hidden);
    assert.equal(d.getElementById('viewport-state').hidden,true);
    assert.equal(ui.calls.filter(c=>c.name==='minedesign_open_document').length,3);
    assert.match(d.getElementById('annotation-list').textContent,/保留这条意见/);
  }finally{if(ui)await ui.close();await service.close();await fs.rm(noteFile,{force:true});await fs.rm(tmp,{recursive:true,force:true});}
});

test('open shell swaps in a new build in place and keeps the view state',async()=>{
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-shell-'));
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(tmp,'studio'),{recursive:true});
  const service=await startService({workspace:tmp});
  const doc=await service.open('studio');
  let latest='old',ui;
  try{
    ui=await harness(doc,service,{build:'old',shell:build=>build===latest?{build}:{build:latest,html:'<!doctype html><p id="new-shell">新外壳</p>'}});
    const d=ui.win.document;
    await ui.ready();
    await until(()=>d.getElementById('viewport-state').hidden);
    d.getElementById('message').value='整体更紧凑';
    // 相同构建只轮询，不替换
    await until(()=>ui.calls.some(c=>c.name==='minedesign_shell'));
    assert.equal(d.getElementById('new-shell'),null);
    latest='new';
    await until(()=>d.getElementById('new-shell'));
    assert.equal(ui.win.testClosed,true);
    assert.deepEqual(JSON.parse(ui.win.sessionStorage.getItem('minedesign:shell-carry')),{id:doc.id,message:'整体更紧凑'});
  }finally{if(ui)await ui.close();await service.close();await fs.rm(tmp,{recursive:true,force:true});}
});

test('design feedback lives in the editor panel: drafts are pushed in, editor actions are saved here',async()=>{
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-feedback-'));
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(tmp,'studio'),{recursive:true});
  const service=await startService({workspace:tmp});
  const doc=await service.open('studio');
  const noteFile=path.join(ROOT,'.local/annotations',`${doc.id}.json`);
  let ui;
  try{
    await service.annotations(doc.id,[{id:'keep',label:'标题',text:'保留'},{id:'drop',label:'按钮',text:'删除这条'}]);
    ui=await harness(doc,service);
    const d=ui.win.document,frame=d.getElementById('editor');
    await until(()=>!frame.hidden);
    const sent=[];frame.contentWindow.postMessage=data=>sent.push(data);
    await ui.ready();
    await until(()=>sent.some(m=>m.type==='editor:feedback'));
    assert.equal(d.body.dataset.feedback,'editor');
    assert.deepEqual(sent.findLast(m=>m.type==='editor:feedback').items.map(i=>[i.n,i.label,i.text]),[[1,'标题','保留'],[2,'按钮','删除这条']]);
    // 编辑器面板里的删除由外壳保存，再推送新的草稿
    ui.win.dispatchEvent(new ui.win.MessageEvent('message',{source:frame.contentWindow,data:{type:'editor:feedback-action',action:'remove',id:'drop'}}));
    await until(()=>sent.findLast(m=>m.type==='editor:feedback').items.length===1);
    assert.deepEqual((await service.annotations(doc.id)).map(n=>n.id),['keep']);
    // 顶栏开关请求编辑器开关右侧面板，按钮状态跟随编辑器回报
    ui.win.dispatchEvent(new ui.win.MessageEvent('message',{source:frame.contentWindow,data:{type:'editor:panel',open:true}}));
    assert.equal(d.getElementById('panel').getAttribute('aria-pressed'),'true');
    d.getElementById('panel').click();
    assert.deepEqual({...sent.at(-1)},{type:'editor:set-panel',open:false});
    // 顶栏的缩放与播放按编辑器报告的视图状态显示，菜单操作发回编辑器
    assert.equal(d.getElementById('view-controls').hidden,true);
    const view={scale:0.26,minScale:0.05,maxScale:8,presets:[0.5,1],toggles:[],canUndo:false,canRedo:false,play:[{label:'Prototypes',items:[{file:'Login.dc.html',title:'登录'}]}]};
    ui.win.dispatchEvent(new ui.win.MessageEvent('message',{source:frame.contentWindow,data:{type:'editor:view',...view}}));
    assert.equal(d.getElementById('view-controls').hidden,false);
    assert.equal(d.getElementById('zoom-readout').textContent,'26%');
    const items=id=>[...d.querySelectorAll(`#${id}-menu .menu-item`)];
    items('zoom').find(b=>b.textContent==='100%').click();
    assert.deepEqual({...sent.at(-1)},{type:'editor:view-action',action:'zoom',scale:1});
    assert.match(d.getElementById('play-menu').textContent,/原型/);
    items('play').find(b=>b.textContent==='登录').click();
    assert.deepEqual({...sent.at(-1)},{type:'editor:view-action',action:'play',file:'Login.dc.html'});
  }finally{if(ui)await ui.close();await service.close();await fs.rm(noteFile,{force:true});await fs.rm(tmp,{recursive:true,force:true});}
});
