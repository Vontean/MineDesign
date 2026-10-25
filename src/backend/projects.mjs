import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { inside } from './workspace.mjs';
import { readCanvasInfo, readCanvasJson } from '@minedesign/design-files';
import { readDesignSystemInfo } from '@minedesign/design-system-files';

export const PROJECT_FILE='project.json';
// 当前有编辑器的文件类型；project.json 里的其他类型留给以后的编辑器，暂不显示
const READERS={design:readCanvasInfo,'design-system':readDesignSystemInfo};

async function member(workspace,dir,kind){
  const file=await inside(workspace,dir).catch(()=>null);
  const info=file&&Object.hasOwn(READERS,kind)&&await READERS[kind](file);
  return info?{kind,path:file,title:info.title}:null;
}
const project=(key,name,files)=>({id:createHash('sha256').update(`project:${key}`).digest('hex').slice(0,20),name,files});

// 显式项目：从文件所在目录向上找 project.json（到工作区根为止），第一个把它列为成员的项目生效
async function declared(workspace,dir){
  const root=await fs.realpath(workspace);
  if(dir===root)return null;
  for(let folder=path.dirname(dir);;folder=path.dirname(folder)){
    const manifest=await fs.readFile(path.join(folder,PROJECT_FILE),'utf8').then(JSON.parse,()=>null);
    if(Array.isArray(manifest?.files)){
      const files=(await Promise.all(manifest.files.map(f=>typeof f?.path==='string'&&typeof f?.kind==='string'?member(workspace,path.resolve(folder,f.path),f.kind):null))).filter(Boolean);
      if(files.some(f=>f.path===dir)){
        const name=typeof manifest.name==='string'&&manifest.name.trim()?manifest.name.trim():path.basename(folder);
        return project(path.join(folder,PROJECT_FILE),name,files);
      }
    }
    if(folder===root||path.dirname(folder)===folder)return null;
  }
}
// 设计稿与它 designSystems 里引用的设计系统
async function linked(workspace,dir){
  const canvas=await readCanvasJson(dir);
  const refs=Array.isArray(canvas?.designSystems)?canvas.designSystems.map(r=>r?.artifact).filter(a=>typeof a==='string'):[];
  const systems=(await Promise.all(refs.map(a=>member(workspace,path.resolve(dir,a),'design-system')))).filter(Boolean);
  return systems.filter((s,i)=>systems.findIndex(o=>o.path===s.path)===i);
}

// 文件所属项目：先看 project.json，没有时按引用关系自动归组；设计系统只在恰好被一份同级设计稿引用时归入该稿的项目，其余单独成项目
export async function projectOf(workspace,dir,kind){
  const explicit=await declared(workspace,dir);
  if(explicit)return explicit;
  const self=await member(workspace,dir,kind);
  if(kind==='design'){
    const systems=await linked(workspace,dir);
    return project(dir,self.title,[self,...systems]);
  }
  const parent=path.dirname(dir);
  const siblings=await fs.readdir(parent,{withFileTypes:true}).catch(()=>[]);
  const owners=[];
  for(const entry of siblings){
    if(!entry.isDirectory()||entry.name.startsWith('.'))continue;
    const design=path.join(parent,entry.name);
    if(design!==dir&&(await linked(workspace,design)).some(s=>s.path===dir))owners.push(design);
  }
  if(owners.length===1){
    const owner=await member(workspace,owners[0],'design');
    if(owner)return project(owner.path,owner.title,[owner,...await linked(workspace,owner.path)]);
  }
  return project(dir,self.title,[self]);
}
