import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs/promises';
import { randomBytes, createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SlidesServer } from '../vendor/baocut/packages/slides/src/deck-routes.ts';
import { CANVAS_LAYOUT, readCanvasInfo } from '../vendor/baocut/packages/design/src/canvas-layout.ts';
import { checkCanvas } from '../vendor/baocut/packages/design/src/canvas-check.ts';
import { DESIGN_SYSTEM_LAYOUT, readDesignSystemInfo } from '../vendor/baocut/packages/design-system/src/layout.ts';
import { checkDesignSystem } from '../vendor/baocut/packages/design-system/src/check.ts';

export const ROOT = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const json = (res, status, body) => res.writeHead(status, {'Content-Type':'application/json', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff'}).end(JSON.stringify(body));
export async function inside(root, given) {
  const base = await fs.realpath(root);
  const target = await fs.realpath(path.resolve(base, given));
  const relative = path.relative(base, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw new Error('路径超出本次授权工作区');
  return target;
}

export async function startService({workspace = ROOT, port = 0} = {}) {
  workspace = await fs.realpath(workspace);
  const token = randomBytes(24).toString('hex');
  const opened = new Map();
  const editors = new SlidesServer({editorDist:()=>null,
    design:{editorDist:()=>path.join(ROOT,'vendor/baocut/apps/design-editor/dist'),layout:CANVAS_LAYOUT},
    designSystem:{editorDist:()=>path.join(ROOT,'vendor/baocut/apps/design-system-editor/dist'),layout:DESIGN_SYSTEM_LAYOUT,userName:()=> 'You'},
    onError:(message,error)=>console.error(message,error),
  });
  let origin;
  async function open(given, kind='design') {
    if (!['design','design-system'].includes(kind)) throw new Error('未知编辑器类型');
    const dir = await inside(workspace, given);
    const info = await (kind === 'design' ? readCanvasInfo(dir) : readDesignSystemInfo(dir));
    if (!info) throw new Error('目录缺少有效的设计稿或设计系统索引');
    const grant = await editors.open(dir,kind);
    const version=(await editors.storeOf(dir,kind).listing()).ver;
    const record = {id:createHash('sha256').update(`${kind}:${dir}`).digest('hex').slice(0,20),path:dir,title:info.title || path.basename(dir),kind,version,editorUrl:`${origin}/${kind}/${grant}/?lang=zh-Hans`};
    opened.set(record.id,record);
    return record;
  }
  async function check(given,kind='design') {
    const dir=await inside(workspace,given);
    const result=await (kind==='design' ? checkCanvas(dir) : checkDesignSystem(dir));
    return {...result,problems:result.issues.length,notChecked:'结构校验不证明渲染、视觉或交互正确'};
  }
  async function importAsset(given,source,kind='design',group) {
    const doc=await open(given,kind);
    const file=await inside(workspace,source);
    const stat=await fs.stat(file);
    const types={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.gif':'image/gif','.avif':'image/avif','.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff','.ttf':'font/ttf','.otf':'font/otf'};
    if(kind==='design-system'){
      delete types['.avif'];Object.assign(types,{'.mp4':'video/mp4','.webm':'video/webm','.pdf':'application/pdf'});
      if(group!==undefined && (!group.trim() || group!==group.trim() || group.length>80 || /[\\/\u0000-\u001f]/.test(group) || group==='.' || group==='..'))throw new Error('无效的素材组名');
    }
    const type=types[path.extname(file).toLowerCase()];
    if (!type || !stat.isFile() || stat.size>20*1024*1024 || (kind==='design-system' && type==='image/svg+xml' && stat.size>2*1024*1024)) throw new Error('不支持的素材或素材超过大小限制');
    const bytes=await fs.readFile(file);
    if (bytes.length>20*1024*1024) throw new Error('素材超过大小限制');
    const uploaded=await editors.storeOf(doc.path,kind).putBlob(bytes,type);
    if(kind==='design')return {...uploaded,src:uploaded.url,bytes:uploaded.sizeBytes,contentType:type};
    const base=path.basename(file);
    const name=group!==undefined?base:`${type.startsWith('font/')?'fonts':'assets'}/${base}`;
    const encode=value=>[...Buffer.from(value)].map(byte=>/[A-Za-z0-9_./-]/.test(String.fromCharCode(byte))?String.fromCharCode(byte):`~${byte.toString(16).toUpperCase().padStart(2,'0')}`).join('');
    const key=encode(name),groupKey=group!==undefined?encode(group):undefined;
    return {...uploaded,src:uploaded.url,record:{name,blob:uploaded.id,size:uploaded.sizeBytes,type},key,...(groupKey?{groupKey}:{}),indexPath:groupKey?['assetGroups',groupKey,'files',key]:['blobs',key],restoredAs:group!==undefined?`assets/${group}/${name}`:name};
  }
  async function annotations(docId, value) {
    const doc=opened.get(docId); if(!doc) throw new Error('未知作品');
    const dir=path.join(ROOT,'.local/annotations'); await fs.mkdir(dir,{recursive:true});
    const file=path.join(dir,`${docId}.json`);
    if (value!==undefined) {
      if(!Array.isArray(value) || value.length>100 || JSON.stringify(value).length>200000) throw new Error('批注格式或大小错误');
      const sourceVersion=(await editors.storeOf(doc.path,doc.kind).listing()).ver;
      value=value.map(note=>({...note,sourceVersion:note.sourceVersion||sourceVersion}));
      const temp=`${file}.${randomBytes(6).toString('hex')}.tmp`;
      await fs.writeFile(temp,JSON.stringify(value)); await fs.rename(temp,file);
    }
    return JSON.parse(await fs.readFile(file,'utf8').catch(error=>{if(error.code==='ENOENT')return '[]';throw error;}));
  }
  async function prepareFeedback(id){
    const doc=opened.get(id);if(!doc)throw new Error('未知作品');
    const version=(await editors.storeOf(doc.path,doc.kind).listing()).ver;
    const notes=await annotations(id);
    return {version,annotations:notes,stale:notes.some(note=>!note.sourceVersion||note.sourceVersion!==version)};
  }
  const server=http.createServer(async(req,res)=>{
    try {
      if (!['127.0.0.1','localhost'].includes((req.headers.host||'').split(':')[0])) return json(res,403,{error:'Invalid host'});
      const url=new URL(req.url,origin);
      if(url.pathname.startsWith(`/api/${token}/`)) {
        if(req.headers.origin && ![origin,origin.replace('127.0.0.1','localhost')].includes(req.headers.origin)) return json(res,403,{error:'Invalid origin'});
        const chunks=[];let size=0;
        for await (const chunk of req) {size+=chunk.length;if(size>250000)throw new Error('请求太大');chunks.push(chunk);}
        const body=size?JSON.parse(Buffer.concat(chunks)):{};
        const action=url.pathname.split('/').at(-1);
        if(action==='documents' && req.method==='GET')return json(res,200,[...opened.values()]);
        if(action==='open' && req.method==='POST')return json(res,200,await open(body.path,body.kind));
        if(action==='annotations')return json(res,200,await annotations(body.id||url.searchParams.get('id'),req.method==='POST'?body.annotations:undefined));
        if(action==='prepare-feedback' && req.method==='POST')return json(res,200,await prepareFeedback(body.id));
        return json(res,404,{error:'Unknown action'});
      }
      if(url.pathname===`/app/${token}/`){
        let html=await fs.readFile(path.join(ROOT,'dist/app.html'),'utf8');
        html=html.replace('/*__CONFIG__*/',()=>JSON.stringify({origin,api:`${origin}/api/${token}/`,documents:[...opened.values()]}).replaceAll('<','\\u003c'));
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}).end(html);return;
      }
      if(editors.handle(req,res,{canEdit:true,blobScope:'isolated'}))return;
      res.writeHead(404).end();
    } catch(error){json(res,400,{error:error.message});}
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  origin=`http://127.0.0.1:${server.address().port}`;
  return {workspace,origin,api:`${origin}/api/${token}/`,url:`${origin.replace('127.0.0.1','localhost')}/app/${token}/`,open,check,importAsset,annotations,prepareFeedback,
    documents:()=>[...opened.values()], async close(){editors.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
