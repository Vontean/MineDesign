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
  b.onLoad({filter:/.*/,namespace:'test'},({path})=>({contents:path==='host'?`export class App { async connect(){} addEventListener(){} getHostContext(){return {}} async callServerTool(input){return window.testTransport(input)} }`:`export function createBridge(){return window.testBridge}`,loader:'js'}));
}}]});
const html=(await fs.readFile(path.join(ROOT,'src/frontend/app.html'),'utf8')).replace(/<script[\s\S]*?<\/script>/g,'');
async function until(check){const deadline=Date.now()+3000;while(!check()){if(Date.now()>deadline)assert.fail('App did not reach expected state');await new Promise(r=>setTimeout(r,10));}}
async function harness(record,service){
  const win=new Window({url:'https://minedesign.test/'});
  const calls=[];
  win.document.write(html);
  // 嵌入宿主，测试公开的工具响应与用户可见的加载结果。
  Object.defineProperty(win,'parent',{value:{},configurable:true});
  win.MINEDESIGN_CONFIG={documents:[record]};
  let broken=false;
  win.testTransport=async({name,arguments:args})=>{
    calls.push({name,args});
    if(name==='minedesign_open_document')return {structuredContent:{document:await service.open(args.path,args.kind)}};
    if(name==='minedesign_annotations')return {structuredContent:{annotations:await service.annotations(args.id)}};
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
