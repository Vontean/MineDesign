import { App } from '@modelcontextprotocol/ext-apps';
import { readEditorMessage, saveFileName } from '../../packages/contracts/src/editor-messages.ts';
import { createServiceClient } from './service-client.mjs';
import { createBridge } from './virtual.mjs';
import { createIllustration } from '../../assets/illustrations/index.mjs';
import { uiText, resolveUiLocale } from '../../packages/contracts/src/ui-text.ts';
import { createAbout } from './about.mjs';
import { createElement, PanelsTopLeft, Component } from 'lucide';
const config=window.MINEDESIGN_CONFIG;
const $=id=>document.getElementById(id);
const frame=$('editor');
$('state-illustration').append(createIllustration('document-loading'));
let app,client,bridge,documentRecord,notes=[],pending,mode=false,busy=false,loading=0,editorPanel=false,view=null;
let docs=config.documents;
const system=matchMedia('(prefers-color-scheme: dark)');
let theme=system.matches?'dark':'light',variables={},hostTheme=false;
const flushes=new Map();
const CARRY='minedesign:shell-carry';
// 外壳原地换新前保存的视图状态，只读取一次
const carried=(()=>{try{const value=JSON.parse(sessionStorage.getItem(CARRY)||'null');sessionStorage.removeItem(CARRY);return value;}catch{return null;}})();
// 编辑器是本页生成的 srcdoc，与本页同源
const post=data=>frame.contentWindow?.postMessage(data,'*');
// 界面语言：About 里的偏好，缺省跟随 Codex（宿主上下文的 locale），取不到再看系统语言
let preference='system',locale='en',t=uiText(locale);
function applyLocale(){
  locale=resolveUiLocale(preference,[app?.getHostContext()?.locale,navigator.language]);t=uiText(locale);
  document.documentElement.lang=locale==='zh-Hans'?'zh-CN':'en';
  for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=t[el.dataset.i18n];
  for(const el of document.querySelectorAll('[data-i18n-label]')){el.setAttribute('aria-label',t[el.dataset.i18nLabel]);el.title=t[el.dataset.i18nLabel];}
  for(const el of document.querySelectorAll('[data-i18n-aria]'))el.setAttribute('aria-label',t[el.dataset.i18nAria]);
  for(const el of document.querySelectorAll('[data-i18n-placeholder]'))el.placeholder=t[el.dataset.i18nPlaceholder];
  if(!app)$('send').title=t.sendUnavailable;
  post({type:'editor:locale',locale});
  renderProjects();renderNotes();renderView();syncPanelButton();renderState();about.render();
}
// 宿主推送的 MCP 标准样式变量覆盖 tokens.css 的本地快照；切换主题时先清掉上一套，缺失的变量回到快照
function applyHostStyles(next={}){
  const root=document.documentElement.style;
  for(const name of Object.keys(variables))if(!(name in next))root.removeProperty(name);
  variables=Object.fromEntries(Object.entries(next).filter(([name,value])=>name.startsWith('--')&&typeof value==='string'));
  for(const [name,value] of Object.entries(variables))root.setProperty(name,value);
}
function setTheme(next){theme=next;document.documentElement.dataset.theme=theme;post({type:'minedesign:theme',theme,variables});}
function applyContext(ctx){
  if(!ctx)return;
  if(ctx.styles?.variables)applyHostStyles(ctx.styles.variables);
  if(ctx.theme==='dark'||ctx.theme==='light'){hostTheme=true;setTheme(ctx.theme);}else setTheme(theme);
}
system.addEventListener('change',e=>{if(!hostTheme)setTheme(e.matches?'dark':'light');});
setTheme(theme);
function editorAvailable(available){$('annotate').disabled=!available;$('send').disabled=!available||!app;}
// 连接、加载和失败共用视窗状态，重试不能把提示送回顶栏。标题与说明可传函数，切换语言时重新取值。
let shownState=['loading',{title:()=>t.connecting,description:()=>t.pleaseWait}];
function viewState(state,options={}){shownState=[state,options];renderState();}
function renderState(){
  const [state,{title,description='',error}]=shownState,value=v=>typeof v==='function'?v():v;
  const panel=$('viewport-state'),failed=state==='error';
  panel.hidden=state==='ready';panel.dataset.state=state;
  panel.closest('.viewport').setAttribute('aria-busy',String(state==='loading'));
  $('state-message').setAttribute('role',failed?'alert':'status');
  $('state-title').textContent=value(title)||'';$('state-description').textContent=value(description);
  if(state!=='ready')$('state-illustration').replaceChildren(createIllustration({loading:'document-loading',error:'document-unavailable',empty:'document-empty'}[state]));
  $('retry').hidden=!failed;$('state-details').hidden=!failed;$('state-details').open=false;
  $('error-detail').textContent=error?.message||'';
  if(state!=='ready')frame.hidden=true;
  editorAvailable(state==='ready');
}
function fail(error){viewState('error',{title:()=>t.openFailedTitle,description:()=>t.openFailedBody,error});}
async function drafts(value){return client.annotations(documentRecord.id,value);}
function threads(){post({type:'editor:threads',threads:notes.map((n,i)=>({id:n.id,anchor:n.anchor,n:i+1,...(n.section?{section:n.section}:{})}))});syncFeedback();}
// 设计稿的评论列表显示在编辑器右侧面板里；这里只推送草稿与发送状态，保存和发送仍在本页
const editorFeedback=()=>document.body.dataset.feedback==='editor';
function syncFeedback(){
  if(!editorFeedback())return;
  post({type:'editor:feedback',items:notes.map((n,i)=>({id:n.id,n:i+1,label:String(n.label??'').slice(0,1000),text:String(n.text??'').slice(0,4000)})),status:$('delivery').textContent,canSend:!!app,busy});
}
function status(text){$('delivery').textContent=text;syncFeedback();}
const svg=paths=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
function renderNotes(){
  const items=notes.map((note,i)=>{
    const li=document.createElement('li');
    const index=document.createElement('span');index.className='index';index.textContent=String(i+1);
    const target=document.createElement('button');target.type='button';target.className='target-link';target.textContent=note.label;target.title=t.locate(note.label);target.onclick=()=>post({type:'editor:reveal',id:note.id});
    const text=document.createElement('p');text.className='comment';text.textContent=note.text;
    const remove=document.createElement('button');remove.type='button';remove.className='btn btn-icon remove';remove.setAttribute('aria-label',t.removeCommentN(i+1));remove.title=t.removeComment;
    remove.innerHTML=svg('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>');
    remove.onclick=async()=>{notes=notes.filter(n=>n.id!==note.id);await save();};
    li.append(index,target,text,remove);return li;
  });
  $('annotation-list').replaceChildren(...items);
  $('empty').hidden=notes.length>0;
  $('count').hidden=!notes.length;$('count').textContent=String(notes.length);
  threads();
}
async function save(){notes=await drafts(notes);renderNotes();}
// 目标可以是已打开作品的 id，也可以是项目里尚未打开的文件 {kind,path,title}
const sameFile=(a,b)=>a.path===b.path&&a.kind===b.kind;
async function select(target){
  if(busy)return;
  const record=(typeof target==='string'?docs.find(d=>d.id===target):target&&(docs.find(d=>sameFile(d,target))||target))||docs[0];
  if(!record){viewState('empty',{title:()=>t.noDocumentTitle,description:()=>t.noDocumentBody});renderProjects();return;}
  const ticket=++loading;
  const changed=!documentRecord||!sameFile(documentRecord,record);
  documentRecord=record;renderProjects();
  // 设计稿的评论入口在画布底部工具栏；设计系统没有该工具栏，保留顶栏入口
  $('annotate').hidden=record.kind==='design';
  // 设计稿的面板开关控制编辑器右侧面板，编辑器载入后回报实际状态
  document.body.dataset.feedback=record.kind==='design'?'editor':'shell';
  if(changed){editorPanel=false;view=null;}
  syncPanelButton();renderView();
  if(changed){notes=[];renderNotes();}
  viewState('loading',{title:()=>t.opening,description:record.title});
  try{
    // 宿主会缓存页面；grant 属于服务进程，必须按稳定目录重新打开，不能复用缓存地址。
    const args={path:record.path,kind:record.kind};
    const current=await client.open(args);
    if(ticket!==loading)return;
    documentRecord=current;docs=docs.some(d=>d.id===current.id)?docs.map(d=>d.id===current.id?current:d):docs.concat(current);renderProjects();
    const savedNotes=await drafts();
    if(ticket!==loading)return;
    notes=savedNotes;renderNotes();
    const html=await bridge.html(current.editorPath);
    if(ticket!==loading)return;
    frame.srcdoc=html;frame.hidden=false;
  }catch(error){if(ticket===loading)fail(error);}
}
// 顶栏：项目菜单切换项目，标签切换当前项目里的文件。项目由后端按 project.json 或引用关系归组；旧后端没有项目信息时作品自成一个项目。
const projectOf=d=>d.project??{id:d.id,name:d.title,files:[{kind:d.kind,path:d.path,title:d.title}]};
const KIND_ICONS={design:PanelsTopLeft,'design-system':Component};
const kindName=kind=>({design:t.kindDesign,'design-system':t.kindSystem})[kind]??kind;
function renderProjects(){
  const current=documentRecord&&projectOf(documentRecord);
  const projects=[...new Map(docs.map(d=>[projectOf(d).id,projectOf(d)])).values()];
  if(current&&!projects.some(p=>p.id===current.id))projects.push(current);
  $('project-name').textContent=current?.name??'';
  $('project').disabled=busy||!projects.length;
  $('project-menu').replaceChildren(...projects.map(p=>menuItem(p.name,{role:'menuitemradio',checked:p.id===current?.id,
    onClick:()=>{if(p.id!==current?.id)select(docs.find(d=>projectOf(d).id===p.id)??p.files[0]).catch(fail);}})));
  // 同一项目里有多个同类型文件时，标签显示文件标题而不是类型名
  const files=current?.files??[];
  const repeated=kind=>files.filter(f=>f.kind===kind).length>1;
  $('files').replaceChildren(...files.map(file=>{
    const tab=document.createElement('button');tab.type='button';tab.className='file-tab';tab.setAttribute('role','tab');
    const selected=sameFile(file,documentRecord);
    tab.setAttribute('aria-selected',String(selected));tab.tabIndex=selected?0:-1;tab.disabled=busy;
    tab.title=`${kindName(file.kind)} · ${file.title}`;
    const label=document.createElement('span');label.textContent=repeated(file.kind)?file.title:kindName(file.kind);
    tab.append(createElement(KIND_ICONS[file.kind]??PanelsTopLeft,{class:'icon','aria-hidden':'true'}),label);
    tab.onclick=()=>{if(!sameFile(file,documentRecord))select({...file,project:current}).catch(fail);};
    return tab;
  }));
}
// 标签栏的方向键在标签之间移动焦点
$('files').addEventListener('keydown',e=>{
  const step={ArrowLeft:-1,ArrowRight:1}[e.key];if(!step)return;
  const tabs=[...$('files').querySelectorAll('[role=tab]')],at=tabs.indexOf(document.activeElement);if(at<0)return;
  e.preventDefault();tabs[(at+step+tabs.length)%tabs.length].focus();
});
function feedback(message){return JSON.stringify({kind:'minedesign-feedback',document:documentRecord.path,editor:documentRecord.kind,annotations:notes,message},null,2);}
async function flush(){
  const requestId=crypto.randomUUID();
  return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{flushes.delete(requestId);reject(new Error(t.saveTimeout));},10000);flushes.set(requestId,saved=>{clearTimeout(timer);saved?resolve():reject(new Error(t.notSaved));});post({type:'editor:flush',requestId});});
}
$('retry').onclick=()=>(bridge?select(documentRecord):initialize()).catch(fail);
function syncPanelButton(){
  const editor=editorFeedback(),open=editor?editorPanel:document.body.dataset.panel!=='closed';
  const label=editor?(open?t.hidePanel:t.showPanel):(open?t.hideSidebar:t.showSidebar);
  $('panel').setAttribute('aria-pressed',String(open));$('panel').setAttribute('aria-label',label);$('panel').title=label;
}
// 顶栏的缩放与播放：设计稿编辑器经 editor:view 报告状态，这里显示菜单并把操作发回编辑器
// 编辑器报告的视图开关与分组名是英文原名，这里映射到当前语言
const viewLabel=label=>({'Layout guides':t.layoutGuides,Prototypes:t.prototypes,'Static artboards':t.staticArtboards})[label]??label;
const percent=scale=>Math.round(scale*100);
const viewAction=action=>post({type:'editor:view-action',...action});
function menuItem(label,{onClick,role='menuitem',checked,disabled,trailing}={}){
  const item=document.createElement('button');item.type='button';item.className='menu-item';item.setAttribute('role',role);item.disabled=!!disabled;
  if(checked!==undefined)item.setAttribute('aria-checked',String(checked));
  const text=document.createElement('span');text.textContent=label;item.append(text);
  if(trailing){const hint=document.createElement('span');hint.className='menu-trailing';hint.textContent=trailing;item.append(hint);}
  item.onclick=()=>{closeMenus();onClick();};return item;
}
function menuPart(className,text){const part=document.createElement('div');part.className=className;if(text)part.textContent=text;else part.setAttribute('role','separator');return part;}
function renderView(){
  $('view-controls').hidden=!editorFeedback()||!view;
  if(!view)return;
  const now=percent(view.scale),min=percent(view.minScale),max=percent(view.maxScale),mac=/Mac|iPhone|iPad/.test(navigator.platform);
  $('zoom-readout').textContent=`${now}%`;
  $('zoom-menu').replaceChildren(
    menuItem(t.zoomIn,{trailing:mac?'⌘+':'Ctrl +',disabled:now>=max,onClick:()=>viewAction({action:'zoom-in'})}),
    menuItem(t.zoomOut,{trailing:mac?'⌘−':'Ctrl −',disabled:now<=min,onClick:()=>viewAction({action:'zoom-out'})}),
    menuItem(t.fit,{onClick:()=>viewAction({action:'fit'})}),
    menuPart('menu-separator'),
    ...view.presets.map(scale=>menuItem(`${percent(scale)}%`,{role:'menuitemradio',checked:percent(scale)===now,disabled:percent(scale)<min||percent(scale)>max,onClick:()=>viewAction({action:'zoom',scale})})),
    ...(view.toggles.length?[menuPart('menu-separator'),...view.toggles.map(toggle=>menuItem(viewLabel(toggle.label),{role:'menuitemcheckbox',checked:toggle.checked,onClick:()=>viewAction({action:'toggle',id:toggle.id})}))]:[]),
    menuPart('menu-separator'),
    menuItem(t.undo,{trailing:mac?'⌘Z':'Ctrl Z',disabled:!view.canUndo,onClick:()=>viewAction({action:'undo'})}),
    menuItem(t.redo,{trailing:mac?'⇧⌘Z':'Ctrl ⇧ Z',disabled:!view.canRedo,onClick:()=>viewAction({action:'redo'})}),
  );
  $('play').disabled=!view.play.length;
  $('play').title=view.play.length?t.play:t.noPlayable;
  $('play-menu').replaceChildren(...view.play.flatMap((group,i)=>[
    ...(i?[menuPart('menu-separator')]:[]),menuPart('menu-label',viewLabel(group.label)),
    ...group.items.map(item=>menuItem(item.title,{onClick:()=>viewAction({action:'play',file:item.file})})),
  ]));
}
function closeMenus(){for(const id of ['project','zoom','play']){$(`${id}-menu`).hidden=true;$(id).setAttribute('aria-expanded','false');}}
function toggleMenu(id){
  const open=$(`${id}-menu`).hidden;closeMenus();if(!open)return;
  $(`${id}-menu`).hidden=false;$(id).setAttribute('aria-expanded','true');$(`${id}-menu`).querySelector('button:not(:disabled)')?.focus();
}
$('project').onclick=()=>toggleMenu('project');
$('zoom').onclick=()=>toggleMenu('zoom');
$('play').onclick=()=>toggleMenu('play');
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.menu-wrap'))closeMenus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus();});
// 点进编辑器 iframe 时本页失去焦点，菜单随之关闭
window.addEventListener('blur',closeMenus);
function setPanel(open){document.body.dataset.panel=open?'open':'closed';syncPanelButton();}
$('panel').onclick=()=>editorFeedback()?post({type:'editor:set-panel',open:!editorPanel}):setPanel(document.body.dataset.panel==='closed');
$('annotate').onclick=()=>{mode=!mode;$('annotate').setAttribute('aria-pressed',String(mode));post({type:'editor:set-mode',on:mode});};
$('compose').addEventListener('close',async()=>{
  if(!pending)return;
  try{if($('compose').returnValue==='add'&&$('comment').value.trim()){notes.push({id:crypto.randomUUID(),anchor:pending.anchor,label:pending.label,detail:pending.detail,section:pending.section,text:$('comment').value.trim(),createdAt:new Date().toISOString()});await save();}}catch(e){status(e.message);}
  post({type:'editor:composer-closed',requestId:pending.requestId});pending=null;
});
window.addEventListener('message',e=>{
  if(e.source!==frame.contentWindow)return;
  const m=readEditorMessage(e.data);if(!m)return;
  if(m.type==='editor:ready'&&!frame.hidden){post({type:'editor:locale',locale});threads();setTheme(theme);post({type:'editor:set-mode',on:mode});viewState('ready');}
  if(m.type==='editor:mode'){mode=m.on;$('annotate').setAttribute('aria-pressed',String(mode));}
  if(m.type==='editor:compose'){
    if(pending){post({type:'editor:compose-result',requestId:m.requestId,opened:false});return;}
    pending=m;$('target-label').textContent=m.label;$('comment').value='';$('compose').returnValue='';$('compose').showModal();post({type:'editor:compose-result',requestId:m.requestId,opened:true});$('comment').focus();
  }
  if(m.type==='editor:panel'){editorPanel=m.open;syncPanelButton();}
  if(m.type==='editor:view'){view=m;renderView();}
  if(m.type==='editor:feedback-action'){
    if(m.action==='reveal')post({type:'editor:reveal',id:m.id});
    else if(m.action==='remove'){notes=notes.filter(n=>n.id!==m.id);save().catch(e=>status(e.message));}
    else if(m.action==='copy')copyFeedback(m.message);
    else sendFeedback(m.message);
  }
  if(m.type==='editor:flushed'){flushes.get(m.requestId)?.(m.saved);flushes.delete(m.requestId);}
  if(m.type==='editor:suggest-prompt'){$('message').value=m.prompt;$('message').focus();post({type:'editor:suggest-prompt-result',requestId:m.requestId,ok:true});}
  if(m.type==='editor:save-file'){
    const name=saveFileName(m.filename);if(!name){post({type:'editor:save-file-result',requestId:m.requestId,outcome:'failed'});return;}
    const url=URL.createObjectURL(new Blob([m.data]));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);post({type:'editor:save-file-result',requestId:m.requestId,outcome:'saved'});
  }
});
async function copyFeedback(message){try{await navigator.clipboard.writeText(feedback(message));status(t.copied);}catch(e){status(e.message);}}
async function sendFeedback(message){
  if(!app||busy)return;
  busy=true;$('send').disabled=true;renderProjects();syncFeedback();
  try{await flush();const prepared=await client.prepareFeedback(documentRecord.id);if(prepared.stale)throw new Error(t.stale);const text=feedback(message);if(text===sessionStorage.getItem(`sent:${documentRecord.id}`))throw new Error(t.duplicate);const result=await app.sendMessage({role:'user',content:[{type:'text',text:t.agentPrompt(text)} ]});if(result?.isError)throw new Error(t.rejected);sessionStorage.setItem(`sent:${documentRecord.id}`,text);status(t.sent);}catch(e){status(e.message);}finally{busy=false;$('send').disabled=false;renderProjects();syncFeedback();}
}
$('copy').onclick=()=>copyFeedback($('message').value);
$('send').onclick=()=>sendFeedback($('message').value);
// 构建后原地换成新外壳；批注已持久化，这里只携带视图状态。编辑或发送进行中时推迟。
const idle=()=>!busy&&!pending&&!flushes.size;
async function swapShell(html){
  try{sessionStorage.setItem(CARRY,JSON.stringify({id:documentRecord?.id,panel:document.body.dataset.panel,message:$('message').value,...(about.isOpen()?{about:true}:{})}));}catch{}
  await app?.close();
  document.open();document.write(html);document.close();
}
function watchShell(){
  setTimeout(async()=>{
    try{
      if(document.visibilityState==='visible'&&idle()){
        const next=await client.shell(config.build);
        if(next.html&&idle())return await swapShell(next.html);
      }
    }catch{}
    watchShell();
  },2000);
}
const about=createAbout({$,text:()=>t,client:()=>client,version:__MDN_VERSION__,preference:()=>preference,
  // Codex 沙箱里经宿主打开链接；浏览器模式直接新开窗口
  openLink:url=>app?app.openLink({url}).catch(()=>{}):window.open(url,'_blank','noopener'),
  onLanguage:async language=>{preference=language;applyLocale();try{await client.settings({language});}catch{}}});
$('about-open').onclick=()=>about.open();
applyLocale();
async function initialize(){
  if(window.parent!==window){
    app=new App({name:'MineDesign',version:__MDN_VERSION__});
    app.ontoolresult=async result=>{const data=result.structuredContent;if(data?.documents){docs=data.documents;renderProjects();if(bridge)await select(documentRecord).catch(fail);}else if(data?.document){const next=data.document;docs=docs.filter(d=>d.id!==next.id).concat(next);renderProjects();if(bridge)await select(next.id).catch(fail);}};
    // 宿主只推送变化的字段，合并后整体应用
    app.addEventListener('hostcontextchanged',()=>{applyContext(app.getHostContext());applyLocale();});
    await app.connect();applyContext(app.getHostContext());
  }else $('send').disabled=true;
  client=createServiceClient({app,apiBase:config.api});
  applyLocale();
  // 旧连接没有 about 工具时保持跟随 Codex
  client.about().then(info=>{preference=info.settings?.language??'system';applyLocale();},()=>{});
  bridge=window.__mdnBridge=createBridge(client);
  renderProjects();
  if(carried){setPanel(carried.panel!=='closed');$('message').value=carried.message||'';}
  if(config.build)watchShell();
  if(carried?.about)about.open();
  await select(carried?.id||docs[0]?.id);
}
initialize().catch(fail);
