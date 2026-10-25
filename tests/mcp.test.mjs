import test from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { ROOT } from '../src/backend/service.mjs';
import path from 'node:path';
import { APP_URI } from '../src/brand.mjs';

test('built plugin exposes both editors and design tools via real stdio MCP',async()=>{
  const client=new Client({name:'minedesign-test',version:'1'});
  const transport=new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'dist/cli.mjs'),'mcp','--workspace',ROOT]});
  try{
    await client.connect(transport);
    const {tools}=await client.listTools();assert.ok(tools.some(t=>t.name==='design_check'));assert.ok(tools.some(t=>t.name==='design_system_check'));
    const result=await client.callTool({name:'minedesign_open',arguments:{}});assert.equal(result.structuredContent.documents.length,4);
    const entry=tools.find(t=>t.name==='minedesign_open');assert.deepEqual(entry.icons.map(i=>i.theme),[undefined,'light','dark']);
    assert.match(Buffer.from(entry.icons[0].src.split(',')[1],'base64').toString(),/id="brush"/);
    const resource=await client.readResource({uri:APP_URI});assert.match(resource.contents[0].text,/MineDesign/);
    assert.equal(entry._meta.ui.resourceUri,APP_URI);
    assert.deepEqual(entry._meta['openai/ui'].entrypoints,[{type:'global'},{type:'thread'}]);
    const {resources}=await client.listResources();assert.deepEqual(resources.map(r=>r.uri),[APP_URI]);
    for(const name of ['minedesign_http','minedesign_events','minedesign_annotations','minedesign_prepare_feedback','minedesign_shell','minedesign_about','minedesign_settings','minedesign_update'])assert.deepEqual(tools.find(t=>t.name===name)._meta.ui.visibility,['app']);
    // 已打开的外壳按构建标识轮询：标识不同才返回整页，且与资源同为当前构建
    const latest=(await client.callTool({name:'minedesign_shell',arguments:{build:'stale'}})).structuredContent;
    assert.match(latest.html,/MineDesign/);assert.ok(resource.contents[0].text.includes(`"build":"${latest.build}"`));
    assert.deepEqual((await client.callTool({name:'minedesign_shell',arguments:{build:latest.build}})).structuredContent,{build:latest.build});
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

test('backend reload preserves the same stdio connection, documents and persisted drafts',async()=>{
  const fs=await import('node:fs/promises');
  const os=await import('node:os');
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-reload-'));
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(tmp,'studio'),{recursive:true});
  const client=new Client({name:'reload-test',version:'1'});
  let doc;
  try{
    await client.connect(new StdioClientTransport({command:process.execPath,args:[path.join(ROOT,'dist/cli.mjs'),'mcp','--workspace',tmp]}));
    doc=(await client.callTool({name:'minedesign_open_document',arguments:{path:'studio',kind:'design'}})).structuredContent.document;
    const notes=[{id:'reload-note',anchor:'Main.dc.html',label:'工作台',text:'保留草稿'}];
    const saved=(await client.callTool({name:'minedesign_annotations',arguments:{id:doc.id,annotations:notes}})).structuredContent.annotations;
    const result=await client.callTool({name:'minedesign_reload',arguments:{}});
    assert.ok(!result.isError);
    const current=result.structuredContent.documents[0];
    assert.equal(current.id,doc.id);assert.notEqual(current.editorPath,doc.editorPath);
    assert.deepEqual((await client.callTool({name:'minedesign_annotations',arguments:{id:doc.id}})).structuredContent.annotations,saved);
    assert.equal((await client.callTool({name:'minedesign_http',arguments:{path:current.editorPath}})).structuredContent.status,200);
    assert.match((await client.readResource({uri:APP_URI})).contents[0].text,/MineDesign/);
    assert.ok((await client.listTools()).tools.some(t=>t.name==='minedesign_reload'));
  }finally{
    await client.close();
    if(doc)await fs.rm(path.join(ROOT,'.local/annotations',doc.id+'.json'),{force:true});
    await fs.rm(tmp,{recursive:true,force:true});
  }
});
