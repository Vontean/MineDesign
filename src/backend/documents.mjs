import { serviceError } from '@minedesign/contracts/service-errors';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash, randomBytes } from 'node:crypto';
import { inside } from './workspace.mjs';
import { projectOf } from './projects.mjs';
import { readCanvasInfo, checkCanvas } from '@minedesign/design-files';
import { readDesignSystemInfo, checkDesignSystem } from '@minedesign/design-system-files';

export function createDocumentService({workspace, editors, origin, annotationRoot}) {
  const opened = new Map();
  async function open(given, kind='design') {
    if (!['design','design-system'].includes(kind)) throw serviceError('unknown_editor','未知编辑器类型');
    const dir = await inside(workspace, given);
    const info = await (kind === 'design' ? readCanvasInfo(dir) : readDesignSystemInfo(dir));
    if (!info) throw serviceError('invalid_document','目录缺少有效的设计稿或设计系统索引');
    const grant = await editors.open(dir,kind);
    const version=(await editors.storeOf(dir,kind).listing()).ver;
    const record = {id:createHash('sha256').update(`${kind}:${dir}`).digest('hex').slice(0,20),path:dir,title:info.title || path.basename(dir),kind,version,editorPath:`/${kind}/${grant}/`,editorUrl:`${origin()}/${kind}/${grant}/`,project:await projectOf(workspace,dir,kind)};
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
      if(group!==undefined && (!group.trim() || group!==group.trim() || group.length>80 || /[\\/\u0000-\u001f]/.test(group) || group==='.' || group==='..'))throw serviceError('asset_invalid_group','无效的素材组名');
    }
    const type=types[path.extname(file).toLowerCase()];
    if (!type || !stat.isFile() || stat.size>20*1024*1024 || (kind==='design-system' && type==='image/svg+xml' && stat.size>2*1024*1024)) throw serviceError('asset_not_supported','不支持的素材或素材超过大小限制');
    const bytes=await fs.readFile(file);
    if (bytes.length>20*1024*1024) throw serviceError('asset_too_large','素材超过大小限制');
    const uploaded=await editors.storeOf(doc.path,kind).putBlob(bytes,type);
    if(kind==='design')return {...uploaded,src:uploaded.url,bytes:uploaded.sizeBytes,contentType:type};
    const base=path.basename(file);
    const name=group!==undefined?base:`${type.startsWith('font/')?'fonts':'assets'}/${base}`;
    const encode=value=>[...Buffer.from(value)].map(byte=>/[A-Za-z0-9_./-]/.test(String.fromCharCode(byte))?String.fromCharCode(byte):`~${byte.toString(16).toUpperCase().padStart(2,'0')}`).join('');
    const key=encode(name),groupKey=group!==undefined?encode(group):undefined;
    return {...uploaded,src:uploaded.url,record:{name,blob:uploaded.id,size:uploaded.sizeBytes,type},key,...(groupKey?{groupKey}:{}),indexPath:groupKey?['assetGroups',groupKey,'files',key]:['blobs',key],restoredAs:group!==undefined?`assets/${group}/${name}`:name};
  }
  async function annotations(docId, value) {
    const doc=opened.get(docId); if(!doc) throw serviceError('unknown_document','未知作品');
    const dir=annotationRoot; await fs.mkdir(dir,{recursive:true});
    const file=path.join(dir,`${docId}.json`);
    if (value!==undefined) {
      if(!Array.isArray(value) || value.length>100 || JSON.stringify(value).length>200000) throw serviceError('invalid_annotations','批注格式或大小错误');
      const sourceVersion=(await editors.storeOf(doc.path,doc.kind).listing()).ver;
      value=value.map(note=>({...note,sourceVersion:note.sourceVersion||sourceVersion}));
      const temp=`${file}.${randomBytes(6).toString('hex')}.tmp`;
      await fs.writeFile(temp,JSON.stringify(value)); await fs.rename(temp,file);
    }
    return JSON.parse(await fs.readFile(file,'utf8').catch(error=>{if(error.code==='ENOENT')return '[]';throw error;}));
  }
  async function prepareFeedback(id){
    const doc=opened.get(id);if(!doc)throw serviceError('unknown_document','未知作品');
    const version=(await editors.storeOf(doc.path,doc.kind).listing()).ver;
    const notes=await annotations(id);
    return {version,annotations:notes,stale:notes.some(note=>!note.sourceVersion||note.sourceVersion!==version)};
  }
  return {open, check, importAsset, annotations, prepareFeedback, documents:()=>[...opened.values()]};
}
