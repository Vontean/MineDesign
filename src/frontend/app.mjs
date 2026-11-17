import { setUiLocale } from '@minedesign/contracts/ui-locale';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import { normalizeAnnotations, visibleAnnotations, draftAnnotations, editAnnotation, markAnnotationsSent, markAnnotationsResolved, canSendFeedback, feedbackContent } from '@minedesign/contracts/annotations';
import { uiError } from '@minedesign/contracts/ui-error';
import { serviceError } from '@minedesign/contracts/service-errors';
import { App } from '@modelcontextprotocol/ext-apps';
import { readEditorMessage, saveFileName } from '../../packages/contracts/src/editor-messages.ts';
import { createServiceClient } from './service-client.mjs';
import { createBridge } from './virtual.mjs';
import { createIllustration } from '../../assets/illustrations/index.mjs';
import { uiText, resolveUiLocale } from '../../packages/contracts/src/ui-text.ts';
import { createAbout } from './about.mjs';
import { createElement, PanelsTopLeft, Component, MessageCircle, Undo2, Redo2, Pencil, Check } from 'lucide';
import { installTooltips } from './tooltip.mjs';
const config=window.MINEDESIGN_CONFIG;
const $=id=>document.getElementById(id);
const displayName=config.displayName??'MineDesign';
document.title=displayName;
$('about-open').querySelector('strong').textContent=displayName;
$('about-name').textContent=displayName;
const frame=$('editor');
$('state-illustration').append(createIllustration('document-loading'));
// 评论图标与画布工具栏的评论按钮同一个（CDS Chat → Lucide MessageCircle），保持语义一致
for(const slot of document.querySelectorAll('[data-comment-icon]'))slot.replaceWith(createElement(MessageCircle,{class:'icon','aria-hidden':'true'}));
let app,client,bridge,documentRecord,notes=[],pending,mode=false,busy=false,loading=0,editorPanel=false,view=null;
// 反馈侧栏里正在编辑的评论与输入中的文字；同一时间只编辑一条
let editing=null,editText='';
const mac=/Mac|iPhone|iPad/.test(navigator.platform),tooltips=installTooltips();
// 失焦（按下鼠标）到 iframe 发来 compose（松开鼠标后）之间的上限；长按拖动框选超过它时照常开始新评论
const COMPOSE_DISMISS_MS=600;
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
  locale=resolveUiLocale(preference,[app?.getHostContext()?.locale,navigator.language]);setUiLocale(locale);t=uiText(locale);
  document.documentElement.lang=locale==='zh-Hans'?'zh-CN':'en';
  for(const el of document.querySelectorAll('[data-i18n]'))el.textContent=t[el.dataset.i18n];
  for(const el of document.querySelectorAll('[data-i18n-label]')){el.setAttribute('aria-label',t[el.dataset.i18nLabel]);el.title=t[el.dataset.i18nLabel];}
  for(const el of document.querySelectorAll('[data-i18n-tip]')){el.setAttribute('aria-label',t[el.dataset.i18nTip]);el.dataset.tip=t[el.dataset.i18nTip];}
  for(const el of document.querySelectorAll('[data-i18n-aria]'))el.setAttribute('aria-label',t[el.dataset.i18nAria]);
  for(const el of document.querySelectorAll('[data-i18n-placeholder]'))el.placeholder=t[el.dataset.i18nPlaceholder];
  post({type:'editor:locale',locale});
  renderProjects();renderNotes();renderView();syncPanelButton();renderState();renderStatus();about.render();tooltips.refresh();
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
function editorAvailable(available){$('annotate').disabled=!available;syncSend();}
// 发送需要编辑器就绪、在 Codex 中，并且有草稿或补充说明
function syncSend(){const content=canSendFeedback(notes,$('message').value);$('send').disabled=shownState[0]!=='ready'||!app||busy||!content;$('send').title=!app?t.sendUnavailable:content?'':uiMessage('feedback.send.empty');}
// 连接、加载和失败共用视窗状态，重试不能把提示送回顶栏。标题与说明可传函数，切换语言时重新取值。
let shownState=['loading',{title:()=>t.connecting,description:()=>t.pleaseWait}];
function viewState(state,options={}){shownState=[state,options];renderState();}
function renderState(){
  const [state,{title,description='',error,kind}]=shownState,value=v=>typeof v==='function'?v():v;
  const panel=$('viewport-state'),failed=state==='error';
  panel.hidden=state==='ready';panel.dataset.state=state;
  // 打开已知类型的作品时显示该编辑器布局的骨架屏，标题与说明只留给读屏；光带相位按挂钟，与编辑器页面里的骨架屏接上
  // 外壳的反馈侧栏同时显示列表骨架屏：评论还没读到时不显示「暂无评论」
  const skeleton=state==='loading'&&!!kind;
  if(skeleton){panel.dataset.kind=kind;const period=parseFloat(getComputedStyle(panel).getPropertyValue('--mdn-skeleton-period'))*1000||1600;document.body.style.setProperty('--mdn-skel-phase',-(Date.now()%period)+'ms');}
  else delete panel.dataset.kind;
  document.body.toggleAttribute('data-loading',skeleton);
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
async function drafts(value){return normalizeAnnotations(await client.annotations(documentRecord.id,value));}
// 列表与画布编号只含草稿和已发送，编号按这份列表
const shown=()=>visibleAnnotations(notes);
function threads(){post({type:'editor:threads',threads:shown().map((n,i)=>({id:n.id,anchor:n.anchor,n:i+1,...(n.section?{section:n.section}:{})}))});syncFeedback();}
// 设计稿的评论列表显示在编辑器右侧面板里；这里只推送草稿与发送状态，保存和发送仍在本页
const editorFeedback=()=>document.body.dataset.feedback==='editor';
function syncFeedback(){
  if(!editorFeedback())return;
  post({type:'editor:feedback',items:shown().map((n,i)=>({id:n.id,n:i+1,label:String(n.label??'').slice(0,1000),text:String(n.text??'').slice(0,4000),status:n.status})),status:$('delivery').textContent,canSend:!!app,busy});
}
let shownStatus = '';
function renderStatus(){ $('delivery').textContent = typeof shownStatus==='function' ? shownStatus() : shownStatus instanceof Error ? uiError(shownStatus,locale) : shownStatus;syncFeedback(); }
function status(value){shownStatus=value;renderStatus();}
const svg=paths=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths}</svg>`;
function renderNotes(){
  const visible=shown(),list=$('annotation-list');
  if(editing&&!visible.some(n=>n.id===editing))editing=null;
  const refocus=list.contains(document.activeElement)&&document.activeElement.tagName==='TEXTAREA';
  const items=visible.map((note,i)=>{
    const li=document.createElement('li');li.dataset.id=note.id;li.dataset.status=note.status;
    const index=document.createElement('span');index.className='index';index.textContent=String(i+1);
    const target=document.createElement('button');target.type='button';target.className='target-link';target.textContent=note.label;target.title=t.locate(note.label);target.onclick=()=>post({type:'editor:reveal',id:note.id});
    const meta=document.createElement('div');meta.className='comment-meta';meta.append(target);
    if(note.status==='sent'){const tag=document.createElement('span');tag.className='comment-state';tag.textContent=uiMessage('feedback.comments.sent');meta.append(tag);}
    const body=editing===note.id?editForm(note,i+1):Object.assign(document.createElement('p'),{className:'comment',textContent:note.text});
    const edit=document.createElement('button');edit.type='button';edit.className='btn btn-icon row-action edit';edit.setAttribute('aria-label',uiMessage('feedback.comments.editN',{n:i+1}));edit.title=uiMessage('feedback.comments.edit');edit.dataset.testid='feedback-edit';
    edit.append(createElement(Pencil,{class:'icon','aria-hidden':'true'}));edit.hidden=editing===note.id;
    edit.onclick=()=>{editing=note.id;editText=note.text;renderNotes();const field=list.querySelector('textarea');field?.focus();field?.setSelectionRange(editText.length,editText.length);};
    const done=document.createElement('button');done.type='button';done.className='btn btn-icon row-action resolve';done.setAttribute('aria-label',uiMessage('feedback.comments.resolveN',{n:i+1}));done.title=uiMessage('feedback.comments.resolve');done.dataset.testid='feedback-resolve';
    done.append(createElement(Check,{class:'icon','aria-hidden':'true'}));done.onclick=()=>resolveNote(note.id);
    const remove=document.createElement('button');remove.type='button';remove.className='btn btn-icon row-action remove';remove.setAttribute('aria-label',t.removeCommentN(i+1));remove.title=t.removeComment;
    remove.innerHTML=svg('<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/>');
    remove.onclick=async()=>{notes=notes.filter(n=>n.id!==note.id);await save();};
    li.append(index,meta,body,edit,done,remove);return li;
  });
  list.replaceChildren(...items);
  if(refocus)list.querySelector('textarea')?.focus();
  $('empty').hidden=visible.length>0;
  $('count').hidden=!visible.length;$('count').textContent=String(visible.length);
  threads();syncSend();
}
// 编辑一条评论：Enter 保存，Shift+Enter 换行，Esc 取消；空文字不能保存
function editForm(note,n){
  const form=document.createElement('form');form.className='comment-edit';
  const field=document.createElement('textarea');field.rows=2;field.maxLength=4000;field.value=editText;field.setAttribute('aria-label',uiMessage('feedback.comments.editField',{n}));field.dataset.testid='feedback-edit-field';
  const cancel=document.createElement('button');cancel.type='button';cancel.className='btn btn-ghost';cancel.textContent=uiMessage('feedback.comments.cancel');cancel.dataset.testid='feedback-edit-cancel';
  const submit=document.createElement('button');submit.type='submit';submit.className='btn btn-solid';submit.textContent=uiMessage('feedback.comments.save');submit.dataset.testid='feedback-edit-save';submit.disabled=!editText.trim();
  field.oninput=()=>{editText=field.value;submit.disabled=!editText.trim();};
  field.onkeydown=e=>{
    if(e.key==='Escape'){e.preventDefault();e.stopPropagation();finishEdit(note.id,false);}
    else if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();finishEdit(note.id,true);}
  };
  cancel.onclick=()=>finishEdit(note.id,false);
  form.onsubmit=e=>{e.preventDefault();finishEdit(note.id,true);};
  const actions=document.createElement('div');actions.className='comment-edit-actions';actions.append(cancel,submit);
  form.append(field,actions);return form;
}
async function finishEdit(id,keep){
  if(keep&&!editText.trim())return;
  editing=null;if(keep)notes=editAnnotation(notes,id,editText);renderNotes();
  [...$('annotation-list').children].find(li=>li.dataset.id===id)?.querySelector('.edit')?.focus();
  if(keep)await save().catch(e=>status(e));
}
// saves 记录本地保存次数、saving 是进行中的保存：轮询读到的旧结果不能盖过本地修改
let saves=0,saving=0;
async function save(){saves++;saving++;try{notes=await drafts(notes);}finally{saving--;}renderNotes();}
// 手动标为已解决：数据保留，从列表与画布编号中消失
function resolveNote(id){notes=markAnnotationsResolved(notes,[id],new Date().toISOString());save().catch(e=>status(e));}
// Agent 解决评论后，已打开的列表在轮询节拍里更新：只在有已发送评论、且没有编辑、发送或评论输入进行中时读取
const quiet=()=>!busy&&!pending&&!editing;
async function refreshNotes(){
  if(!documentRecord||!quiet()||saving||!notes.some(n=>n.status==='sent'))return;
  const id=documentRecord.id,rev=saves,next=await drafts();
  if(documentRecord?.id!==id||rev!==saves||!quiet()||JSON.stringify(next)===JSON.stringify(notes))return;
  notes=next;renderNotes();
}
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
  viewState('loading',{title:()=>t.opening,description:record.title,kind:record.kind});
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
// 发送与复制的内容只含草稿
function feedback(message){return feedbackContent({document:documentRecord.path,editor:documentRecord.kind,annotations:notes,message});}
async function flush(){
  const requestId=crypto.randomUUID();
  return new Promise((resolve,reject)=>{const timer=setTimeout(()=>{flushes.delete(requestId);reject(serviceError('save_timeout',t.saveTimeout));},10000);flushes.set(requestId,saved=>{clearTimeout(timer);saved?resolve():reject(serviceError('not_saved',t.notSaved));});post({type:'editor:flush',requestId});});
}
$('retry').onclick=()=>(bridge?select(documentRecord):initialize()).catch(fail);
function syncPanelButton(){
  const editor=editorFeedback(),open=editor?editorPanel:document.body.dataset.panel!=='closed';
  const label=editor?(open?t.hidePanel:t.showPanel):(open?t.hideSidebar:t.showSidebar);
  $('panel').setAttribute('aria-pressed',String(open));$('panel').setAttribute('aria-label',label);$('panel').dataset.tip=label;tooltips.refresh();
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
  const now=percent(view.scale),min=percent(view.minScale),max=percent(view.maxScale);
  $('zoom-readout').textContent=`${now}%`;
  $('zoom-menu').replaceChildren(
    menuItem(t.zoomIn,{trailing:mac?'⌘+':'Ctrl +',disabled:now>=max,onClick:()=>viewAction({action:'zoom-in'})}),
    menuItem(t.zoomOut,{trailing:mac?'⌘−':'Ctrl −',disabled:now<=min,onClick:()=>viewAction({action:'zoom-out'})}),
    menuItem(t.fit,{onClick:()=>viewAction({action:'fit'})}),
    menuPart('menu-separator'),
    ...view.presets.map(scale=>menuItem(`${percent(scale)}%`,{role:'menuitemradio',checked:percent(scale)===now,disabled:percent(scale)<min||percent(scale)>max,onClick:()=>viewAction({action:'zoom',scale})})),
    ...(view.toggles.length?[menuPart('menu-separator'),...view.toggles.map(toggle=>menuItem(viewLabel(toggle.label),{role:'menuitemcheckbox',checked:toggle.checked,onClick:()=>viewAction({action:'toggle',id:toggle.id})}))]:[]),
  );
  // 撤销、重做与播放不可用时用 aria-disabled：仍可悬停与聚焦，提示照常显示
  $('undo').setAttribute('aria-disabled',String(!view.canUndo));$('redo').setAttribute('aria-disabled',String(!view.canRedo));
  $('play').setAttribute('aria-disabled',String(!view.play.length));
  const playTip=view.play.length?t.play:t.noPlayable;$('play').dataset.tip=playTip;$('play').setAttribute('aria-label',playTip);
  tooltips.refresh();
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
$('play').onclick=()=>{if($('play').getAttribute('aria-disabled')!=='true')toggleMenu('play');};
// 撤销与重做：图标按钮，快捷键与编辑器内一致（显示在提示气泡里）
for(const [id,icon,action,key,keys] of [['undo',Undo2,'undo',mac?'⌘Z':'Ctrl Z',mac?'Meta+Z':'Control+Z'],['redo',Redo2,'redo',mac?'⇧⌘Z':'Ctrl ⇧ Z',mac?'Shift+Meta+Z':'Control+Shift+Z']]){
  const button=$(id);button.append(createElement(icon,{class:'icon','aria-hidden':'true'}));button.dataset.tipKey=key;button.setAttribute('aria-keyshortcuts',keys);
  button.onclick=()=>{if(button.getAttribute('aria-disabled')!=='true')viewAction({action});};
}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.menu-wrap'))closeMenus();});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenus();});
// 点进编辑器 iframe 时本页失去焦点，菜单随之关闭
window.addEventListener('blur',closeMenus);
function setPanel(open){document.body.dataset.panel=open?'open':'closed';syncPanelButton();}
$('panel').onclick=()=>editorFeedback()?post({type:'editor:set-panel',open:!editorPanel}):setPanel(document.body.dataset.panel==='closed');
$('annotate').onclick=()=>{mode=!mode;$('annotate').setAttribute('aria-pressed',String(mode));post({type:'editor:set-mode',on:mode});};
// 评论输入框：点中目标后浮在落点旁（钉子尖角指着落点），不遮挡目标；Enter 提交，Shift+Enter 换行，Esc 或空内容时点到外部取消
function placeComposer(point){
  const box=frame.getBoundingClientRect(),x=box.left+point.x,y=box.top+point.y,bar=$('compose-form');
  $('compose').style.setProperty('--pin-x',`${x}px`);$('compose').style.setProperty('--pin-y',`${y}px`);
  const w=bar.offsetWidth,h=bar.offsetHeight;
  bar.style.left=`${Math.max(box.left+8,Math.min(x+28,box.right-w-8))}px`;
  bar.style.top=`${Math.max(box.top+8,Math.min(y-13-h/2,box.bottom-h-8))}px`;
}
function fitComment(){const c=$('comment');c.style.height='auto';c.style.height=`${Math.min(c.scrollHeight,120)}px`;$('compose-add').disabled=!c.value.trim();}
async function closeComposer(add){
  if(!pending)return;
  const m=pending,text=$('comment').value.trim();pending=null;$('compose').hidden=true;
  try{if(add&&text){notes.push({id:crypto.randomUUID(),anchor:m.anchor,label:m.label,detail:m.detail,section:m.section,text,createdAt:new Date().toISOString()});await save();}}catch(e){status(e);}
  post({type:'editor:composer-closed',requestId:m.requestId});
}
let dismissedAt=0;
function openComposer(m){
  // 刚因点到外部而取消时，同一次点击在评论模式下会再发一次 compose：这次点击只用来关闭，拒绝它
  if(performance.now()-dismissedAt<COMPOSE_DISMISS_MS){dismissedAt=0;post({type:'editor:compose-result',requestId:m.requestId,opened:false});return;}
  // 已写了内容时点到别处不另起一条，保留原输入框并把焦点交回，避免丢字
  if(pending&&$('comment').value.trim()){post({type:'editor:compose-result',requestId:m.requestId,opened:false});$('comment').focus();return;}
  if(pending)closeComposer(false);
  pending=m;$('compose').setAttribute('aria-label',`${t.composeTitle}: ${m.label}`);$('comment').value='';$('compose').hidden=false;fitComment();placeComposer(m.point);
  post({type:'editor:compose-result',requestId:m.requestId,opened:true});$('comment').focus();
}
$('compose-form').onsubmit=e=>{e.preventDefault();closeComposer(true);};
$('comment').oninput=()=>{fitComment();if(pending)placeComposer(pending.point);};
$('comment').onkeydown=e=>{
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();closeComposer(false);}
  else if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();closeComposer(true);}
};
// 未输入内容时点到输入框以外（画布 iframe 或外壳其他控件）即取消这次评论；已有内容时保留，避免丢字。
// 画布在 iframe 里，外壳收不到点击，只能看焦点去向；切到别的应用时整页失焦（hasFocus 为 false），不算取消。
$('compose').addEventListener('focusout',()=>setTimeout(()=>{
  if(!pending||$('comment').value.trim()||$('compose').contains(document.activeElement)||!document.hasFocus())return;
  dismissedAt=performance.now();closeComposer(false);
}));
window.addEventListener('message',e=>{
  if(e.source!==frame.contentWindow)return;
  const m=readEditorMessage(e.data);if(!m)return;
  if(m.type==='editor:ready'&&!frame.hidden){post({type:'editor:locale',locale});threads();setTheme(theme);post({type:'editor:set-mode',on:mode});viewState('ready');}
  if(m.type==='editor:mode'){mode=m.on;$('annotate').setAttribute('aria-pressed',String(mode));if(!mode)closeComposer(false);}
  if(m.type==='editor:compose')openComposer(m);
  if(m.type==='editor:panel'){editorPanel=m.open;syncPanelButton();}
  if(m.type==='editor:view'){view=m;renderView();}
  if(m.type==='editor:feedback-action'){
    if(m.action==='reveal')post({type:'editor:reveal',id:m.id});
    else if(m.action==='remove'){notes=notes.filter(n=>n.id!==m.id);save().catch(e=>status(e));}
    else if(m.action==='edit'){notes=editAnnotation(notes,m.id,m.text);save().catch(e=>status(e));}
    else if(m.action==='resolve')resolveNote(m.id);
    else if(m.action==='copy')copyFeedback(m.message);
    else sendFeedback(m.message);
  }
  if(m.type==='editor:flushed'){flushes.get(m.requestId)?.(m.saved);flushes.delete(m.requestId);}
  if(m.type==='editor:suggest-prompt'){$('message').value=m.prompt;syncSend();$('message').focus();post({type:'editor:suggest-prompt-result',requestId:m.requestId,ok:true});}
  if(m.type==='editor:save-file'){
    const name=saveFileName(m.filename);if(!name){post({type:'editor:save-file-result',requestId:m.requestId,outcome:'failed'});return;}
    const url=URL.createObjectURL(new Blob([m.data]));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);post({type:'editor:save-file-result',requestId:m.requestId,outcome:'saved'});
  }
});
async function copyFeedback(message){try{await navigator.clipboard.writeText(feedback(message));status(()=>t.copied);}catch(e){status(e);}}
async function sendFeedback(message){
  if(!app||busy||!canSendFeedback(notes,message))return;
  busy=true;syncSend();renderProjects();syncFeedback();
  // 发送成功后，本次发送的草稿标为已发送；失败时保持草稿
  try{await flush();const prepared=await client.prepareFeedback(documentRecord.id);if(prepared.stale)throw serviceError('feedback_stale',t.stale);const batch=draftAnnotations(notes).map(n=>n.id),text=feedback(message);if(text===sessionStorage.getItem(`sent:${documentRecord.id}`))throw serviceError('feedback_duplicate',t.duplicate);const result=await app.sendMessage({role:'user',content:[{type:'text',text:t.agentPrompt(text)} ]});if(result?.isError)throw serviceError('feedback_rejected',t.rejected);sessionStorage.setItem(`sent:${documentRecord.id}`,text);status(()=>t.sent);if(batch.length){notes=markAnnotationsSent(notes,batch,new Date().toISOString());await save();}}catch(e){status(e);}finally{busy=false;syncSend();renderProjects();syncFeedback();}
}
$('copy').onclick=()=>copyFeedback($('message').value);
$('send').onclick=()=>sendFeedback($('message').value);
$('message').addEventListener('input',syncSend);
// 构建后原地换成新外壳；批注已持久化，这里只携带视图状态。编辑或发送进行中时推迟。
const idle=()=>quiet()&&!flushes.size;
async function swapShell(html){
  try{sessionStorage.setItem(CARRY,JSON.stringify({id:documentRecord?.id,panel:document.body.dataset.panel,message:$('message').value,...(about.isOpen()?{about:true}:{})}));}catch{}
  await app?.close();
  document.open();document.write(html);document.close();
}
// 每 2 秒一拍：先按需刷新评论，再比较构建标识
function watchShell(){
  setTimeout(async()=>{
    try{
      if(document.visibilityState==='visible'){
        await refreshNotes().catch(()=>{});
        if(idle()){const next=await client.shell(config.build);if(next.html&&idle())return await swapShell(next.html);}
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
    app=new App({name:displayName,version:__MDN_VERSION__});
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
  if(carried){setPanel(carried.panel!=='closed');$('message').value=carried.message||'';syncSend();}
  if(config.build)watchShell();
  if(carried?.about)about.open();
  await select(carried?.id||docs[0]?.id);
}
initialize().catch(fail);
