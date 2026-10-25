import { startService, ROOT } from './service.mjs';
import { serveMcp } from './mcp.mjs';
import path from 'node:path';

const args=process.argv.slice(2);
const value=(name)=>args.includes(name)?args[args.indexOf(name)+1]:undefined;
const workspace=path.resolve(value('--workspace')||ROOT);
const service=await startService({workspace,port:Number(value('--port')||0)});
if(workspace===ROOT){await service.open('examples/studio');await service.open('examples/design-system','design-system');}
if(args.includes('mcp'))await serveMcp(service);
else console.log(`MineDesign local experiment: ${service.url}`);
for(const signal of ['SIGINT','SIGTERM'])process.on(signal,async()=>{await service.close();process.exit(0);});
