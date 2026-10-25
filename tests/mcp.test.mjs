import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ROOT } from '../src/service.mjs';
import path from 'node:path';
import { APP_URI } from '../src/brand.mjs';

test('built plugin exposes both editors and design tools via real stdio MCP',async()=>{
  const client=new Client({name:'minedesign-test',version:'1'});
  const transport=new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'dist/cli.mjs'),'mcp','--workspace',ROOT]});
  try{
    await client.connect(transport);
    const {tools}=await client.listTools();assert.ok(tools.some(t=>t.name==='design_check'));assert.ok(tools.some(t=>t.name==='design_system_check'));
    const result=await client.callTool({name:'minedesign_open',arguments:{}});assert.equal(result.structuredContent.documents.length,2);
    const entry=tools.find(t=>t.name==='minedesign_open');assert.deepEqual(entry.icons.map(i=>i.theme),[undefined,'light','dark']);
    assert.match(Buffer.from(entry.icons[0].src.split(',')[1],'base64').toString(),/id="brush"/);
    const resource=await client.readResource({uri:APP_URI});assert.match(resource.contents[0].text,/MineDesign/);
    const check=await client.callTool({name:'design_check',arguments:{path:'examples/studio'}});assert.equal(check.isError,undefined);
    const outside=await client.callTool({name:'design_check',arguments:{path:'/private/tmp'}});assert.equal(outside.isError,true);
    // Codex 沙箱只放行 https/blob/data：编辑器请求经 MCP 工具转发，CSP 不声明本地 http 来源
    const csp=resource.contents[0]._meta.ui.csp;assert.ok(![...csp.resourceDomains,...csp.frameDomains].some(d=>d.startsWith('http')));
    const design=result.structuredContent.documents.find(d=>d.kind==='design');
    const listing=await client.callTool({name:'minedesign_http',arguments:{path:`${design.editorPath}_files.json`}});
    assert.equal(listing.structuredContent.status,200);assert.ok(JSON.parse(Buffer.from(listing.structuredContent.body,'base64')).files['project/canvas.json']);
    const escape=await client.callTool({name:'minedesign_http',arguments:{path:'/api/x/documents'}});assert.equal(escape.isError,true);
    const subscribed=await client.callTool({name:'minedesign_events',arguments:{path:`${design.editorPath}__deck/events`,after:-1}});assert.deepEqual(subscribed.structuredContent.events,[]);
  }finally{await client.close();}
});
