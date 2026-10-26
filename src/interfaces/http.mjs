import { serviceError, errorRecord } from '@minedesign/contracts/service-errors';
import { OPERATIONS } from '@minedesign/contracts/service';
import { readShell, shellUpdate } from './shell.mjs';
const json = (res,status,body)=>res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}).end(JSON.stringify(body));

export function createHttpHandler({service,editors,token,getOrigin}) {
  return async(req,res)=>{
    const origin=getOrigin();
    const appConfig=()=>({origin,api:`${origin}/api/${token}/`,documents:service.documents()});
    try {
      if (!['127.0.0.1','localhost'].includes((req.headers.host||'').split(':')[0])) return json(res,403,{error:'Invalid host',code:'invalid_host'});
      const url=new URL(req.url,origin);
      if(url.pathname.startsWith(`/api/${token}/`)) {
        if(req.headers.origin && ![origin,origin.replace('127.0.0.1','localhost')].includes(req.headers.origin)) return json(res,403,{error:'Invalid origin',code:'invalid_origin'});
        const action=url.pathname.split('/').at(-1);
        const chunks=[];let size=0;
        for await (const chunk of req) {size+=chunk.length;if(size>(action===OPERATIONS.http.http?32e6:250000))throw serviceError('request_too_large','请求太大');chunks.push(chunk);}
        const body=size?JSON.parse(Buffer.concat(chunks)):{};
        if(action==='documents' && req.method==='GET')return json(res,200,service.documents());
        if(action===OPERATIONS.open.http && req.method==='POST')return json(res,200,await service.open(body.path,body.kind));
        if(action===OPERATIONS.annotations.http)return json(res,200,await service.annotations(body.id||url.searchParams.get('id'),req.method==='POST'?body.annotations:undefined));
        if(action===OPERATIONS.prepareFeedback.http && req.method==='POST')return json(res,200,await service.prepareFeedback(body.id));
        if(action===OPERATIONS.http.http && req.method==='POST')return json(res,200,await service.proxy(body));
        if(action===OPERATIONS.events.http && req.method==='POST')return json(res,200,await service.events(body));
        if(action===OPERATIONS.about.http && req.method==='POST')return json(res,200,await service.about(body));
        if(action===OPERATIONS.settings.http && req.method==='POST')return json(res,200,await service.settings(body));
        if(action===OPERATIONS.update.http && req.method==='POST')return json(res,200,await service.update());
        if(action===OPERATIONS.shell.http && req.method==='POST')return json(res,200,await shellUpdate(appConfig(),body.build));
        return json(res,404,{error:'Unknown action'});
      }
      if(url.pathname===`/app/${token}/`){
        const {html}=await readShell(appConfig());
        res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','Referrer-Policy':'no-referrer'}).end(html);return;
      }
      if(editors.handle(req,res,{canEdit:true,blobScope:'isolated'}))return;
      res.writeHead(404).end();
    } catch(error){json(res,400,{error:error.message,code:errorRecord(error).code});}
  };
}
