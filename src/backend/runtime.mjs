import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { ROOT } from '../paths.mjs';

async function loadBuiltService(){
  const file=path.join(ROOT,'dist/backend.mjs');
  const hash=createHash('sha256').update(await fs.readFile(file)).digest('hex');
  return (await import(pathToFileURL(file).href+'?build='+hash)).startService;
}

// MCP 持有这个稳定对象；更新只替换文件服务，保留宿主 stdio 与工具注册。
export async function startRuntime(options,loadService=loadBuiltService){
  let current=await (await loadService())(options),reloading;
  const pending=new Set();
  const runtime={
    documents:()=>current.documents(),
    get workspace(){return current.workspace;},
    get origin(){return current.origin;},
    get api(){return current.api;},
    get url(){return current.url;},
    reload(){
      if(reloading)return reloading;
      reloading=(async()=>{
        await Promise.allSettled([...pending]);
        const documents=current.documents();
        let next;
        try{
          next=await (await loadService())({...options,port:0});
          for(const doc of documents)await next.open(doc.path,doc.kind);
        }catch(error){await next?.close();throw error;}
        const previous=current;current=next;
        await previous.close();
        return {documents:current.documents()};
      })().finally(()=>{reloading=undefined;});
      return reloading;
    },
    async close(){if(reloading)await reloading.catch(()=>{});await current.close();},
  };
  for(const operation of ['open','check','importAsset','annotations','prepareFeedback','proxy','events','about','settings','update']){
    runtime[operation]=async(...args)=>{
      if(reloading)await reloading;
      const work=Promise.resolve().then(()=>current[operation](...args));
      pending.add(work);
      try{return await work;}finally{pending.delete(work);}
    };
  }
  return runtime;
}
