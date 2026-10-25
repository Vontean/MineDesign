import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createServiceClient } from '../src/frontend/service-client.mjs';

// 验证可执行依赖图，防止后续修改把文件系统服务重新打进浏览器。
test('frontend and backend keep independent dependency graphs',async()=>{
  const frontend=await build({entryPoints:['src/frontend/app.mjs'],bundle:true,write:false,metafile:true,platform:'browser',define:{__MDN_VERSION__:'"test"'},plugins:[{name:'shim-text',setup(b){b.onLoad({filter:/frame-shim\.js$/},async args=>({contents:await (await import('node:fs/promises')).readFile(args.path,'utf8'),loader:'text'}));}}]});
  const clientInputs=Object.keys(frontend.metafile.inputs);
  assert.ok(clientInputs.some(p=>p.includes('contracts/src/service.mjs')));
  assert.ok(clientInputs.every(p=>!/(src\/backend|src\/interfaces|packages\/(document-store|design-files|design-system-files))\//.test(p)));
  const backend=await build({entryPoints:['src/backend/service.mjs'],bundle:true,write:false,metafile:true,platform:'node',format:'esm',external:['@modelcontextprotocol/*','zod']});
  assert.ok(Object.keys(backend.metafile.inputs).every(p=>!/(src\/frontend|packages\/(editor-host|design-runtime|design-system-runtime))\//.test(p)));
});

test('service client presents the same result and errors across MCP and HTTP',async()=>{
  const record={id:'document',path:'studio',kind:'design'};
  const mcpCalls=[],httpCalls=[];
  const mcp=createServiceClient({app:{async callServerTool(call){mcpCalls.push(call);return {structuredContent:{document:record}};}}});
  const http=createServiceClient({apiBase:'http://localhost/api/token/',fetchImpl:async(url,options)=>{httpCalls.push({url,options});return {ok:true,json:async()=>record};}});
  assert.deepEqual(await mcp.open({path:'studio'}),await http.open({path:'studio'}));
  assert.equal(mcpCalls[0].name,'minedesign_open_document');
  assert.equal(httpCalls[0].url,'/api/token/open');
  assert.equal(httpCalls[0].options.method,'POST');
  assert.deepEqual(JSON.parse(httpCalls[0].options.body),mcpCalls[0].arguments);
  const rejected=createServiceClient({app:{async callServerTool(){return {isError:true,content:[{text:'保存失败'}]};}}});
  await assert.rejects(rejected.open({path:'studio'}),/保存失败/);
  const rejectedHttp=createServiceClient({apiBase:'http://localhost/api/token/',fetchImpl:async()=>({ok:false,json:async()=>({error:'保存失败'})})});
  await assert.rejects(rejectedHttp.open({path:'studio'}),/保存失败/);
});
