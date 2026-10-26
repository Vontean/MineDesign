// 顶栏控件的提示气泡：对齐编辑器里的 CDS Tooltip（Codex 原生样式、悬停 300ms 出现、距触发元素 4px）。
// 触发元素用 data-tip 写文字、data-tip-key 写快捷键；刚有气泡显示过时移到相邻控件立即出现。
// 不可用的控件用 aria-disabled 保留悬停与键盘焦点，提示照常出现；菜单展开时不显示。
const DELAY_MS=300,WARM_MS=500,OFFSET=4,GUTTER=8;

export function installTooltips(root=document){
  // 文字已经是触发元素的 aria-label、快捷键写在 aria-keyshortcuts，气泡只做视觉提示
  const tip=document.createElement('div');tip.className='tooltip';tip.setAttribute('aria-hidden','true');tip.hidden=true;
  const label=document.createElement('span'),key=document.createElement('kbd');key.className='tooltip-key';
  tip.append(label,key);root.body.append(tip);
  let target=null,timer=0,hiddenAt=0;
  const triggerOf=node=>node instanceof Element?node.closest('[data-tip]'):null;
  function place(){
    const box=target.getBoundingClientRect(),w=tip.offsetWidth,view=root.documentElement.clientWidth;
    tip.style.left=`${Math.max(GUTTER,Math.min(box.left+box.width/2-w/2,view-w-GUTTER))}px`;
    tip.style.top=`${box.bottom+OFFSET}px`;
  }
  function show(){
    if(!target?.isConnected||target.getAttribute('aria-expanded')==='true'||!target.dataset.tip)return;
    label.textContent=target.dataset.tip;key.textContent=target.dataset.tipKey||'';key.hidden=!target.dataset.tipKey;
    tip.hidden=false;place();
  }
  function hide(){
    clearTimeout(timer);
    if(!tip.hidden)hiddenAt=performance.now();
    tip.hidden=true;target=null;
  }
  function enter(node,instant){
    if(node===target)return;
    const warm=!tip.hidden||performance.now()-hiddenAt<WARM_MS;
    hide();target=node;
    if(instant||warm)show();else timer=setTimeout(show,DELAY_MS);
  }
  root.addEventListener('pointerover',e=>{const node=triggerOf(e.target);if(node&&e.pointerType!=='touch')enter(node,false);else if(!node&&target)hide();});
  // 移进编辑器 iframe 或离开窗口时收起
  root.addEventListener('pointerout',e=>{if(!triggerOf(e.relatedTarget))hide();});
  // 键盘聚焦立即显示；点击、Esc、滚动与窗口失焦时收起
  root.addEventListener('focusin',e=>{const node=triggerOf(e.target);if(node&&node.matches(':focus-visible'))enter(node,true);});
  root.addEventListener('focusout',e=>{if(triggerOf(e.target)===target)hide();});
  root.addEventListener('pointerdown',hide,true);
  root.addEventListener('keydown',e=>{if(e.key==='Escape')hide();});
  addEventListener('scroll',hide,true);addEventListener('blur',hide);addEventListener('resize',hide);
  // 文案随语言或状态变化时，正在显示的气泡同步更新
  return {refresh(){if(target&&!tip.hidden)show();}};
}
