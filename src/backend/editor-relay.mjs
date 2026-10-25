// 传输代理只处理已授权的编辑器路径，不处理作品领域规则。
export function createEditorRelay(origin) {
  // Codex 的 MCP App 沙箱只放行 https/blob/data，编辑器无法直接访问本服务；
  // 插件页把编辑器的请求经 MCP 工具转到这里，由 Node 回环请求本服务，沿用原有 grant、ifMatch 与同源校验。
  const PROXY_PATH=/^\/(?:(?:design|design-system)\/[A-Za-z0-9_-]+\/|_blob\/[0-9a-f]{32}$)/;
  const CHUNK=4*1024*1024;
  async function proxy({method='GET',path:target,headers={},body,offset=0}){
    if(typeof target!=='string'||!PROXY_PATH.test(target)||target.includes('..'))throw new Error('不允许代理的路径');
    if(!['GET','HEAD','POST'].includes(method))throw new Error('不允许的请求方法');
    const send={};for(const name of ['content-type','accept'])if(typeof headers[name]==='string')send[name]=headers[name];
    if(method==='POST')send.origin=origin();
    const response=await fetch(origin()+target,{method,headers:send,...(method==='POST'&&body!==undefined?{body:Buffer.from(body,'base64')}:{})});
    const bytes=Buffer.from(await response.arrayBuffer());
    const part=bytes.subarray(offset,offset+CHUNK);
    return {status:response.status,headers:{'content-type':response.headers.get('content-type')||''},size:bytes.length,offset,body:part.toString('base64')};
  }
  // 订阅原有 SSE（__deck/events），供插件页长轮询；无人轮询一分钟后关闭
  const feeds=new Map();
  function feed(target){
    let entry=feeds.get(target);
    if(entry){entry.seen=Date.now();return entry;}
    entry={events:[],seq:0,waiters:new Set(),seen:Date.now(),abort:new AbortController()};
    feeds.set(target,entry);
    const close=()=>{entry.abort.abort();feeds.delete(target);clearInterval(timer);for(const wake of entry.waiters)wake();};
    const timer=setInterval(()=>{if(Date.now()-entry.seen>60000)close();},10000);timer.unref?.();
    (async()=>{
      const response=await fetch(origin()+target,{signal:entry.abort.signal});
      let buffer='';const decoder=new TextDecoder();
      for await(const chunk of response.body){
        buffer+=decoder.decode(chunk,{stream:true});
        let end;
        while((end=buffer.indexOf('\n\n'))>=0){
          const frame=buffer.slice(0,end);buffer=buffer.slice(end+2);
          const type=/^event: (.*)$/m.exec(frame)?.[1],data=/^data: (.*)$/m.exec(frame)?.[1];
          if(type&&data!==undefined){entry.events.push({seq:++entry.seq,type,data});entry.events.splice(0,entry.events.length-50);for(const wake of entry.waiters)wake();}
        }
      }
    })().catch(()=>{}).finally(close);
    return entry;
  }
  async function events({path:target,after=0,waitMs=15000}){
    if(typeof target!=='string'||!/^\/(?:design|design-system)\/[A-Za-z0-9_-]+\/__deck\/events$/.test(target))throw new Error('不允许订阅的路径');
    const entry=feed(target);
    if(after<0)return {events:[],cursor:entry.seq};
    if(after>entry.seq)after=0;
    const pending=()=>entry.events.filter(event=>event.seq>after);
    if(!pending().length&&feeds.has(target))await new Promise(resolve=>{const done=()=>{clearTimeout(timer);entry.waiters.delete(done);resolve();};const timer=setTimeout(done,Math.min(waitMs,25000));entry.waiters.add(done);});
    return {events:pending(),cursor:entry.seq};
  }
  return {proxy,events,close(){for(const entry of feeds.values())entry.abort.abort();}};
}
