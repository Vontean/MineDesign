import { OPERATIONS } from '@minedesign/contracts/service';

// 页面只使用领域操作；宿主工具的封装和浏览器 HTTP 差异在此收敛。
export function createServiceClient({app,apiBase,fetchImpl=(...args)=>fetch(...args)}) {
  async function call(operation,args) {
    const {http,tool,field}=OPERATIONS[operation];
    if(app){
      const result=await app.callServerTool({name:tool,arguments:args});
      if(result.isError)throw new Error(result.content?.map(c=>c.text).join(' ')||`${tool} 失败`);
      return field?result.structuredContent[field]:result.structuredContent;
    }
    const reading=operation==='annotations'&&args.annotations===undefined;
    const action=reading?`${http}?id=${args.id}`:http;
    const response=await fetchImpl(new URL(apiBase).pathname+action,reading?{method:'GET'}:{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(args)});
    const result=await response.json();
    if(!response.ok)throw new Error(result.error);
    return result;
  }
  return {
    open:args=>call('open',args),
    annotations:(id,annotations)=>call('annotations',{id,...(annotations?{annotations}:{})}),
    prepareFeedback:id=>call('prepareFeedback',{id}),
    http:args=>call('http',args),
    events:args=>call('events',args),
    shell:build=>call('shell',{build}),
  };
}
