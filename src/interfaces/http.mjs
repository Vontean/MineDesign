import { OPERATIONS } from '@minedesign/contracts/service';
import fs from 'node:fs/promises';
import path from 'node:path';
import { ROOT } from '../paths.mjs';
const json = (res,status,body)=>res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(body));

export function createHttpHandler({service,editors,token,getOrigin}) {
  return async(req,res)=>{
    const origin=getOrigin();
    try {
      if (!['127.0.0.1','localhost'].includes((req.headers.host||'').split(':')[0])) return json(res,403,{error:'Invalid host'});
      const url=new URL(req.url,origin);
      if(url.pathname.startsWith(`/api/${token}/`)) {
        if(req.headers.origin && ![origin,origin.replace('127.0.0.1','localhost')].includes(req.headers.origin)) return json(res,403,{error:'Invalid origin'});
        const action=url.pathname.split('/').at(-1);
        const chunks=[];let size=0;
        for await (const chunk of req) {size+=chunk.length;if(size>(action===OPERATIONS.http.http?32e6:250000))throw new Error('请求太大');chunks.push(chunk);}
        const body=size?JSON.parse(Buffer.concat(chunks)):{};
        if(action==='documents' && req.method==='GET')return json(res,200,service.documents());
        if(action===OPERATIONS.open.http && req.method==='POST')return json(res,200,await service.open(body.path,body.kind));
        if(action===OPERATIONS.annotations.http)return json(res,200,await service.annotations(body.id||url.searchParams.get('id'),req.method==='POST'?body.annotations:undefined));
        if(action===OPERATIONS.prepareFeedback.http && req.method==='POST')return json(res,200,await service.prepareFeedback(body.id));
        if(action===OPERATIONS.http.http && req.method==='POST')return json(res,200,await service.proxy(body));
        if(action===OPERATIONS.events.http && req.method==='POST')return json(res,200,await service.events(body));
        return json(res,404,{error:'Unknown action'});
      }
      if(url.pathname===`/app/${token}/`){
        let html=await fs.readFile(path.join(ROOT,'dist/app.html'),'utf8');
        html=html.replace('/*__CONFIG__*/',()=>JSON.stringify({origin,api:`${origin}/api/${token}/`,documents:service.documents()}).replaceAll('<','\\u003c'));
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}).end(html);return;
      }
      if(editors.handle(req,res,{canEdit:true,blobScope:'isolated'}))return;
      res.writeHead(404).end();
    } catch(error){json(res,400,{error:error.message});}
  };
}
