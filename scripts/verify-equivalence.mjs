import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { startService, ROOT } from '../src/backend/service.mjs';

// baseline 是重构前单独打包的 service；两次运行复用同一路径、重置夹具，比较外部响应。
const baseline=process.argv[2];
if(!baseline)throw new Error('Usage: node scripts/verify-equivalence.mjs <baseline-service.mjs>');
const previous=await import(pathToFileURL(path.resolve(baseline)));
const workspace=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-equivalence-'));
async function observe(start){
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(workspace,'studio'),{recursive:true});
  await fs.cp(path.join(ROOT,'examples/design-system'),path.join(workspace,'system'),{recursive:true});
  const service=await start({workspace});
  const results={};
  const request=async(url,options)=>{const response=await fetch(url,options);return {status:response.status,type:response.headers.get('content-type'),body:await response.text()};};
  let doc;
  try{
    doc=await service.open('studio');
    results.design={...doc,editorPath:'<grant>',editorUrl:'<origin>/<grant>'};
    results.check=await service.check('studio');
    const system=await service.open('system','design-system');
    results.system={...system,editorPath:'<grant>',editorUrl:'<origin>/<grant>'};
    results.systemCheck=await service.check('system','design-system');
    const listing=await fetch(new URL('_files.json',doc.editorUrl)).then(r=>r.json());
    results.listing=listing;
    const file='project/Main.dc.html';
    results.file=await request(new URL(file,doc.editorUrl));
    results.session=await request(new URL('__deck/session',doc.editorUrl));
    results.missing=await request(new URL('missing.txt',doc.editorUrl));
    const publish=(origin,files)=>request(new URL('__deck/publish',doc.editorUrl),{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify({files})});
    const source=results.file.body;
    const files={[file]:{base64:Buffer.from(source+'\n<!-- equivalence -->').toString('base64'),contentType:'text/html',ifMatch:listing.files[file].sha256}};
    results.badOrigin=await publish('https://example.com',files);
    results.notes=await service.annotations(doc.id,[{id:'equivalence-note',anchor:'Main.dc.html',text:'Check',label:'工作台'}]);
    results.feedback=await service.prepareFeedback(doc.id);
    results.publish=await publish(service.origin,files);
    results.conflict=await publish(service.origin,files);
    results.stale=await service.prepareFeedback(doc.id);
    results.relay=await service.proxy({path:doc.editorPath+file});
    results.invalidProxy=await service.proxy({path:'/../../escape'}).catch(e=>e.message);
    results.escape=await service.open('..').catch(e=>e.message);
    results.httpError=await request(service.api+'unknown');
    results.invalidKind=await service.open('studio','other').catch(e=>e.message);
    await fs.writeFile(path.join(workspace,'asset.svg'),'<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1"></svg>');
    results.asset=await service.importAsset('studio','asset.svg');
    results.systemAsset=await service.importAsset('system','asset.svg','design-system','Icons');
    results.invalidGroup=await service.importAsset('system','asset.svg','design-system','../escape').catch(e=>e.message);
    results.events=await service.events({path:doc.editorPath+'__deck/events',after:-1,waitMs:0});
    results.invalidHost=await request(service.origin+'/',{headers:{Host:'example.com'}});
    results.systemFiles=await request(new URL('_files.json',system.editorUrl));
    return results;
  }finally{
    if(doc){const root=previous.ROOT&&start===previous.startService?previous.ROOT:ROOT;await fs.rm(path.join(root,'.local/annotations',doc.id+'.json'),{force:true});}
    await service.close();
    await fs.rm(path.join(workspace,'studio'),{recursive:true,force:true});
    await fs.rm(path.join(workspace,'system'),{recursive:true,force:true});
  }
}
try{
  const before=await observe(previous.startService),after=await observe(startService);
  for(const key of Object.keys(before))assert.deepEqual(after[key],before[key],key+' changed');
  console.log(`Equivalent: ${Object.keys(before).length} observable responses (only process grant and origin normalized).`);
}finally{await fs.rm(workspace,{recursive:true,force:true});}
