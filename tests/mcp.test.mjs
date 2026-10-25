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
  }finally{await client.close();}
});
