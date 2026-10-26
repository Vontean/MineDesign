import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { startService, inside, ROOT } from '../src/backend/service.mjs';

test('design editor serves real files, preserves ifMatch and rejects workspace escape',async()=>{
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'minedesign-test-'));
  const workspace=path.join(tmp,'workspace');await fs.mkdir(workspace);
  await fs.cp(path.join(import.meta.dirname,'fixtures/studio'),path.join(workspace,'studio'),{recursive:true});
  await fs.symlink(tmp,path.join(workspace,'outside'));
  const service=await startService({workspace});
  try{
    await assert.rejects(inside(workspace,'outside'),/超出/);
    const unknown=await fetch(new URL('annotations?id=missing-i18n-document',service.api));
    assert.equal(unknown.status,400);
    assert.deepEqual(await unknown.json(),{error:'未知作品',code:'unknown_document'});
    const doc=await service.open('studio');
    const noteFile=path.join(ROOT,'.local/annotations',`${doc.id}.json`);
    const savedNotes=await service.annotations(doc.id,[{id:'test-note',anchor:'Main.dc.html',label:'工作台',text:'缩短说明'}]);
    assert.ok(savedNotes[0].sourceVersion);
    assert.equal((await service.prepareFeedback(doc.id)).stale,false);
    const listing=await fetch(new URL('_files.json',doc.editorUrl)).then(r=>r.json());
    const file='project/Main.dc.html';assert.ok(listing.files[file].sha256);
    const source=await fetch(new URL(file,doc.editorUrl)).then(r=>r.text());assert.match(source,/<x-dc>/);
    const publish=files=>fetch(new URL('__deck/publish',doc.editorUrl),{method:'POST',headers:{'Content-Type':'application/json',Origin:service.origin},body:JSON.stringify({files})});
    const result=await publish({[file]:{base64:Buffer.from(source.replace('一起迭代','一起设计')).toString('base64'),contentType:'text/html',ifMatch:listing.files[file].sha256}});
    assert.equal(result.status,200);
    assert.equal((await service.prepareFeedback(doc.id)).stale,true);
    await fs.rm(noteFile,{force:true});
    const conflict=await publish({[file]:{base64:Buffer.from(source).toString('base64'),contentType:'text/html',ifMatch:listing.files[file].sha256}});
    assert.equal(conflict.status,409);assert.equal((await conflict.json()).code,'conflict');
    const badOrigin=await fetch(new URL('__deck/publish',doc.editorUrl),{method:'POST',headers:{'Content-Type':'application/json',Origin:'https://example.com'},body:JSON.stringify({files:{}})});
    assert.equal(badOrigin.status,403);
    assert.equal((await fetch(new URL('../invalid/_files.json',doc.editorUrl))).status,404);
    assert.equal((await service.check('studio')).issues.length,0);
  }finally{await service.close();await fs.rm(tmp,{recursive:true,force:true});}
});

test('design system uses the same persisted token source and structural checker',async()=>{
  const service=await startService({workspace:ROOT});
  try{
    const doc=await service.open('examples/design-system','design-system');
    const response=await fetch(new URL('project/tokens.json',doc.editorUrl));assert.equal(response.status,200);
    const tokens=await response.json();assert.equal(tokens.name,'Mine Studio');
    const result=await service.check('examples/design-system','design-system');assert.equal(result.issues.length,0,JSON.stringify(result.issues));
    const html=await fetch(doc.editorUrl).then(r=>r.text());assert.match(html,/data-minedesign-theme/);
    assert.match(html,/--mdn-surface/);assert.doesNotMatch(html,/getComputedStyle\(parent/);
  }finally{await service.close();}
});
