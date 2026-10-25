import { ROOT, DEFAULT_WORKSPACE } from './paths.mjs';
import { startRuntime } from './backend/runtime.mjs';
import { serveMcp } from './interfaces/mcp.mjs';
import path from 'node:path';
import fs from 'node:fs';

const args=process.argv.slice(2);
const value=(name)=>args.includes(name)?args[args.indexOf(name)+1]:undefined;
const workspace=path.resolve(value('--workspace')||DEFAULT_WORKSPACE);
// 生产版第一次用默认作品目录时，带上示例作品
if(workspace===DEFAULT_WORKSPACE&&workspace!==ROOT&&!fs.existsSync(workspace))fs.cpSync(path.join(ROOT,'examples'),path.join(workspace,'examples'),{recursive:true});
const service=await startRuntime({workspace,port:Number(value('--port')||0)});
if(workspace===DEFAULT_WORKSPACE){for(const [dir,kind] of [['examples/showcase'],['examples/showcase-system','design-system'],['examples/studio'],['examples/design-system','design-system']])if(fs.existsSync(path.join(workspace,dir)))await service.open(dir,kind);}
if(args.includes('mcp'))await serveMcp(service);
else console.log(`MineDesign: ${service.url}`);
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await service.close();process.exit(0);});

if(args.includes('mcp'))process.on('SIGHUP',()=>service.reload().catch(error=>console.error('MineDesign reload failed:',error.message)));
