import fs from 'node:fs/promises';
import path from 'node:path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAppTool, registerAppResource, RESOURCE_MIME_TYPE } from '@modelcontextprotocol/ext-apps/server';
import { z } from 'zod';
import { ROOT } from './service.mjs';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { VERSION, APP_URI, BRAND_ICONS, BRAND_STATES } from './brand.mjs';

export async function serveMcp(service) {
  const server=new McpServer({name:'minedesign',version:VERSION,icons:BRAND_ICONS});
  const uri=APP_URI;
  const appTools=[];
  // 与 MCX 同样补齐公开 tools/list 的图标；SDK 高层注册不转发此字段。
  function registerBrandedTool(target,name,config,handler){
    if(config._meta?.ui)registerAppTool(target,name,config,handler);
    else target.registerTool(name,config,handler);
    appTools.push({name,title:config.title,description:config.description,inputSchema:z.toJSONSchema(z.object(config.inputSchema)),annotations:config.annotations,_meta:config._meta,icons:BRAND_ICONS});
  }
  const ui={resourceUri:uri};
  registerBrandedTool(server,'minedesign_open',{title:'MineDesign',description:'Open the design canvas and design-system editor.',inputSchema:{},annotations:{readOnlyHint:true},_meta:{ui,'minedesign/iconStates':BRAND_STATES,'openai/ui':{entrypoints:[{type:'global'},{type:'thread'}]}}},async()=>({content:[],structuredContent:{documents:service.documents()}}));
  registerBrandedTool(server,'minedesign_open_document',{description:'Open a BaoCut-format design or design-system directory within the authorized workspace.',inputSchema:{path:z.string(),kind:z.enum(['design','design-system']).default('design')},_meta:{ui}},async({path,kind})=>({content:[{type:'text',text:'作品已在 MineDesign 打开'}],structuredContent:{document:await service.open(path,kind)}}));
  for(const kind of ['design','design-system']){
    const prefix=kind==='design'?'design':'design_system';
    registerBrandedTool(server,`${prefix}_check`,{description:'Check structure only; render and inspect before claiming visual acceptance.',inputSchema:{path:z.string()},annotations:{readOnlyHint:true}},async({path})=>({content:[{type:'text',text:JSON.stringify(await service.check(path,kind))}]}));
    const inputSchema=kind==='design'?{canvas:z.string(),path:z.string()}:{system:z.string(),path:z.string(),group:z.string().optional()};
    registerBrandedTool(server,`${prefix}_import_asset`,{description:'Import authorized local assets; design systems also accept video/PDF and return index metadata.',inputSchema,annotations:{destructiveHint:false}},async(input)=>({content:[{type:'text',text:JSON.stringify(await service.importAsset(input.canvas||input.system,input.path,kind,input.group))}]}));
  }
  registerBrandedTool(server,'minedesign_annotations',{description:'Read or persist user-authored design annotation drafts.',inputSchema:{id:z.string(),annotations:z.array(z.record(z.string(),z.unknown())).optional()},_meta:{ui:{resourceUri:uri,visibility:['app']}}},async({id,annotations})=>({content:[],structuredContent:{annotations:await service.annotations(id,annotations)}}));
  registerBrandedTool(server,'minedesign_prepare_feedback',{description:'Check source version before explicitly sending user feedback.',inputSchema:{id:z.string()},_meta:{ui:{resourceUri:uri,visibility:['app']}}},async({id})=>({content:[],structuredContent:await service.prepareFeedback(id)}));
  registerAppResource(server,'editor',uri,{},async()=>{
    let html=await fs.readFile(path.join(ROOT,'dist/app.html'),'utf8');
    html=html.replace('/*__CONFIG__*/',()=>JSON.stringify({origin:service.origin,api:service.api,documents:service.documents()}).replaceAll('<','\\u003c'));
    return {contents:[{uri,mimeType:RESOURCE_MIME_TYPE,text:html,_meta:{ui:{csp:{connectDomains:[service.origin],resourceDomains:[service.origin,'blob:','data:'],frameDomains:[service.origin]}}}}]};
  });
  server.server.setRequestHandler(ListToolsRequestSchema,async()=>({tools:appTools}));
  server.server.oninitialized=()=>server.sendToolListChanged();
  await server.connect(new StdioServerTransport());
  process.stdin.on('end',async()=>{await service.close();process.exit(0);});
}
