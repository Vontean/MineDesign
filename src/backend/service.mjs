import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import { DocumentServer } from '@minedesign/document-store';
import { CANVAS_LAYOUT } from '@minedesign/design-files';
import { DESIGN_SYSTEM_LAYOUT } from '@minedesign/design-system-files';
import { ROOT } from '../paths.mjs';
import { createDocumentService } from './documents.mjs';
import { createEditorRelay } from './editor-relay.mjs';
import { createHttpHandler } from '../interfaces/http.mjs';
export { ROOT } from '../paths.mjs';
export { inside } from './workspace.mjs';

// 唯一组合根：连接领域操作、文件适配器和两种外部接口。
export async function startService({workspace=ROOT,port=0}={}) {
  workspace=await fs.realpath(workspace);
  const token=randomBytes(24).toString('hex');
  const editors=new DocumentServer({editorDist:()=>null,
    design:{editorDist:()=>path.join(ROOT,'apps/design-editor/dist'),layout:CANVAS_LAYOUT},
    designSystem:{editorDist:()=>path.join(ROOT,'apps/design-system-editor/dist'),layout:DESIGN_SYSTEM_LAYOUT,userName:()=> 'You'},
    onError:(message,error)=>console.error(message,error),
  });
  let origin;
  const getOrigin=()=>origin;
  const documents=createDocumentService({workspace,editors,origin:getOrigin,annotationRoot:path.join(ROOT,'.local/annotations')});
  const relay=createEditorRelay(getOrigin);
  const service={...documents,proxy:relay.proxy,events:relay.events};
  const server=http.createServer(createHttpHandler({service,editors,token,getOrigin}));
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(port,'127.0.0.1',resolve);});
  origin=`http://127.0.0.1:${server.address().port}`;
  return {...service,workspace,origin,api:`${origin}/api/${token}/`,url:`${origin.replace('127.0.0.1','localhost')}/app/${token}/`,
    async close(){relay.close();editors.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));}};
}
