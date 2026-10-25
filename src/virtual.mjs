// 虚拟来源：Codex 的 MCP App 沙箱禁止访问本地 HTTP，编辑器改为 srcdoc 装载。
// 编辑器看到的地址是 <插件页>/__mdn/<kind>/<grant>/…，请求经 transport（MCP 工具或浏览器 API）转给本地服务。
// 编辑器与其中的画板、预览都与插件页同源，shim 和本桥直接互相调用。
import shimSource from './frame-shim.js';

const IMMUTABLE=/\/(?:assets|artifact-type)\/|^\/_blob\//;
const TEXT_TYPE=/^(?:text\/|application\/(?:json|javascript)|image\/svg)/;
const URL_ATTRS=['src','href','poster','xlink:href'];
// 只改写会加载资源的元素；<base>、<a> 等导航用的 href 保持原样
const SELECTOR='img,picture source,video,audio,source,track,input[type=image],link[rel~=stylesheet],link[rel~=icon],link[rel~=preload],link[rel~=modulepreload],script[src],iframe[src],image,use,feImage,style,[style]';

const toBase64=bytes=>{let s='';for(let i=0;i<bytes.length;i+=0x8000)s+=String.fromCharCode(...bytes.subarray(i,i+0x8000));return btoa(s);};
const fromBase64=text=>{const s=atob(text),bytes=new Uint8Array(s.length);for(let i=0;i<s.length;i++)bytes[i]=s.charCodeAt(i);return bytes;};
async function bytesOf(body){
  if(body==null)return undefined;
  if(typeof body==='string')return new TextEncoder().encode(body);
  if(typeof body.arrayBuffer==='function')return new Uint8Array(await body.arrayBuffer());
  if(ArrayBuffer.isView(body))return new Uint8Array(body.buffer,body.byteOffset,body.byteLength);
  if(Object.prototype.toString.call(body)==='[object ArrayBuffer]')return new Uint8Array(body);
  return new TextEncoder().encode(String(body));
}

export function createBridge(transport){
  const root=new URL('/__mdn/',location.href).href;
  const blobRoot=new URL('/_blob/',location.href).href;
  const cache=new Map();
  const watched=new WeakSet();

  // 编辑器内的地址 → 本地服务路径；不属于虚拟来源时返回 null
  function toPath(url,base){
    let href;try{href=new URL(url,base).href;}catch{return null;}
    href=href.split('#')[0];
    if(href.startsWith(root))return '/'+href.slice(root.length);
    if(href.startsWith(blobRoot)&&/^[0-9a-f]{32}$/.test(href.slice(blobRoot.length)))return '/_blob/'+href.slice(blobRoot.length);
    return null;
  }
  const toUrl=servicePath=>root+servicePath.slice(1);

  async function request({method='GET',path,headers={},body}){
    const cacheable=method==='GET'&&IMMUTABLE.test(path);
    if(cacheable&&cache.has(path))return cache.get(path);
    const work=(async()=>{
      const sent=await bytesOf(body);
      const parts=[];let first,offset=0;
      do{
        const result=await transport.http({method,path,headers,...(sent?{body:toBase64(sent)}:{}),offset});
        first??=result;
        const part=fromBase64(result.body);parts.push(part);offset+=part.length;
        if(method!=='GET'&&offset<result.size)throw new Error('响应过大');
        if(!part.length)break;
      }while(offset<first.size);
      const bytes=new Uint8Array(offset);let at=0;for(const part of parts){bytes.set(part,at);at+=part.length;}
      return {status:first.status,headers:first.headers,bytes};
    })();
    if(cacheable){cache.set(path,work);work.catch(()=>cache.delete(path));}
    return work;
  }

  const objectUrls=new Map();
  // 静态资源 → blob URL；CSS 里的引用一并改写
  function objectUrl(servicePath){
    if(!objectUrls.has(servicePath))objectUrls.set(servicePath,(async()=>{
      const response=await request({path:servicePath});
      if(response.status!==200)throw new Error(`${servicePath} 读取失败（${response.status}）`);
      const type=response.headers['content-type']||'application/octet-stream';
      let data=response.bytes;
      if(type.startsWith('text/css'))data=await rewriteCss(new TextDecoder().decode(data),toUrl(servicePath));
      return URL.createObjectURL(new Blob([data],{type}));
    })());
    const work=objectUrls.get(servicePath);work.catch(()=>objectUrls.delete(servicePath));
    return work;
  }

  async function rewriteCss(text,base){
    const found=[...text.matchAll(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g)];
    const urls=await Promise.all(found.map(m=>{const servicePath=toPath(m[2],base);return servicePath?objectUrl(servicePath).catch(()=>null):null;}));
    let i=0;return text.replace(/url\(\s*(['"]?)([^'")]+)\1\s*\)/g,whole=>{const url=urls[i++];return url?`url("${url}")`:whole;});
  }

  // 一个元素上指向虚拟来源的引用改成 blob URL；iframe 改为 srcdoc
  async function rewriteElement(element,base,{scripts=false}={}){
    const tag=element.localName;
    if(tag==='iframe'){
      // 解析阶段的 iframe 预先改成 srcdoc；运行中创建的由 shim 的 src setter 接管
      const servicePath=element.getAttribute('src')&&toPath(element.getAttribute('src'),base);
      if(servicePath&&!element.hasAttribute('srcdoc')){element.dataset.mdnSrc=element.getAttribute('src');element.removeAttribute('src');element.srcdoc=await html(servicePath);}
      return;
    }
    if(tag==='script'&&!scripts)return;
    if(tag==='style'){const text=element.textContent;if(text.includes('url(')){const next=await rewriteCss(text,base);if(next!==text)element.textContent=next;}return;}
    for(const name of URL_ATTRS){
      const value=element.getAttribute(name);if(!value)continue;
      const servicePath=toPath(value,base);
      if(servicePath)element.setAttribute(name,await objectUrl(servicePath).catch(()=>value));
    }
    const srcset=element.getAttribute('srcset');
    if(srcset&&(srcset.includes('_blob/')||srcset.includes('__mdn/'))){
      const parts=await Promise.all(srcset.split(',').map(async item=>{const [url,...rest]=item.trim().split(/\s+/);const servicePath=toPath(url,base);return [servicePath?await objectUrl(servicePath).catch(()=>url):url,...rest].join(' ');}));
      element.setAttribute('srcset',parts.join(', '));
    }
    const style=element.getAttribute('style');
    if(style&&style.includes('url(')){const next=await rewriteCss(style,base);if(next!==style)element.setAttribute('style',next);}
  }

  // HTML 文本 → 可放进 srcdoc 的文本：设好 base、注入 shim、改写资源
  async function prepareHtml(text,servicePath){
    const doc=new DOMParser().parseFromString(text,'text/html');
    const base=toUrl(servicePath.replace(/[^/]*$/,''));
    doc.querySelectorAll('base').forEach(node=>node.remove());
    // 画板运行时没有文件地址时直接用 blob 脚本（运行时自带的回退）
    doc.querySelector('meta[name="dc-runtime-file"]')?.remove();
    await Promise.all([...doc.querySelectorAll(SELECTOR)].map(node=>rewriteElement(node,base,{scripts:true})));
    const head=`<base href="${base}"><script>window.__MDN_FRAME__=${JSON.stringify({base,key:servicePath.split('/').slice(0,3).join('/')}).replaceAll('<','\\u003c')}</script><script>${shimSource}</script>`;
    return '<!doctype html>'+doc.documentElement.outerHTML.replace(/<head([^>]*)>/i,match=>match+head);
  }
  async function html(servicePath){
    const response=await request({path:servicePath});
    if(response.status!==200)throw new Error(`${servicePath} 读取失败（${response.status}）`);
    return prepareHtml(new TextDecoder().decode(response.bytes),servicePath);
  }

  // iframe 的 src 指向虚拟来源时同步接管，改为 srcdoc，不发生导航（由 shim 的 src setter 调用）。
  // 设计系统的预览 runner（artifact-type/run.html#token）照它的做法取走暂存文档，并按卡片自己的地址解析引用。
  function adoptFrame(iframe,url,base,win){
    const servicePath=toPath(url,base);
    if(!servicePath)return false;
    iframe.dataset.mdnSrc=url;
    let work;
    if(servicePath.endsWith('/artifact-type/run.html')){
      const token=new URL(url,base).hash.slice(1);
      let parked=null;
      for(const name of ['__dsPreviewRunner','__designCompat']){try{parked=win[name]?.take?.(token)||null;}catch{}if(parked)break;}
      const cardPath=parked&&toPath(parked.url,base);
      work=parked&&cardPath?prepareHtml(parked.html,cardPath):Promise.resolve('');
    }else work=html(servicePath);
    work.then(text=>{iframe.srcdoc=text;},error=>{iframe.srcdoc=`<p style="font:13px system-ui;color:#999;margin:16px">${String(error.message).replace(/</g,'&lt;')}</p>`;});
    return true;
  }

  // 跟随同源子文档（画板、组件预览）：新增或变化的引用改成 blob URL
  function watch(win){
    let doc;try{doc=win.document;}catch{return;}
    if(!doc||watched.has(doc))return;
    watched.add(doc);
    const rewrite=node=>rewriteElement(node,doc.baseURI).catch(()=>{});
    const visitTree=node=>{
      if(node.nodeType!==1)return;
      if(node.matches(SELECTOR))rewrite(node);
      node.querySelectorAll(SELECTOR).forEach(rewrite);
      for(const frame of node.localName==='iframe'?[node]:node.querySelectorAll('iframe'))try{if(frame.contentDocument&&frame.contentDocument.readyState!=='loading')watch(frame.contentWindow);}catch{}
    };
    // 属性变化只看这一个属性，避免拖动时反复扫描整棵树
    const visitAttribute=(node,name)=>{
      if(!node.matches(SELECTOR))return;
      const value=node.getAttribute(name);if(!value)return;
      if(name==='style'?value.includes('url('):name==='srcset'||toPath(value,doc.baseURI))rewrite(node);
    };
    new win.MutationObserver(records=>{for(const record of records){
      if(record.type==='attributes')visitAttribute(record.target,record.attributeName);
      else if(record.type==='characterData'){const style=record.target.parentElement;if(style?.localName==='style')rewrite(style);}
      else{record.addedNodes.forEach(visitTree);if(record.target.localName==='style')rewrite(record.target);}
    }}).observe(doc,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['src','href','srcset','style','xlink:href']});
    doc.addEventListener('load',event=>{if(event.target.localName==='iframe')try{watch(event.target.contentWindow);}catch{}},true);
    if(doc.documentElement)visitTree(doc.documentElement);
  }

  async function events(servicePath,after){return transport.events({path:servicePath,after});}

  return {root,toPath,request,html,adoptFrame,watch,events};
}
