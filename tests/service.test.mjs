import { DATA } from '../src/paths.mjs';
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
    const noteFile=path.join(DATA,'annotations',`${doc.id}.json`);
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
    // 已发送的评论不随反馈发送，作品变化后也不算过期；旧数据补上草稿状态
    assert.equal(savedNotes[0].status,'draft');
    await service.annotations(doc.id,[{...savedNotes[0],status:'sent',sentAt:'2026-11-17T08:00:00.000Z'}]);
    const prepared=await service.prepareFeedback(doc.id);
    assert.equal(prepared.stale,false);assert.deepEqual(prepared.annotations,[]);
    const resolved=await service.resolveAnnotations(doc.id,['test-note','missing']);
    assert.equal(resolved[0].status,'resolved');assert.ok(resolved[0].resolvedAt);
    // Agent 报告已处理的评论：只解决列出的，未知 id 忽略；之后外壳整组保存不能让它复活
    const sent=(id,text)=>({id,anchor:'Main.dc.html',label:'工作台',text,status:'sent',sentAt:'2026-11-17T08:00:00.000Z'});
    await service.annotations(doc.id,[sent('a','标题再大一点'),sent('b','留白太多'),{id:'c',anchor:'Main.dc.html',label:'工作台',text:'草稿'}]);
    assert.deepEqual(await service.resolveFeedback('studio','design',['a','missing']),{resolved:1,remaining:2});
    assert.deepEqual(await service.resolveFeedback('studio','design',['a']),{resolved:0,remaining:2});
    const viaHttp=await fetch(new URL('resolve-feedback',service.api),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:'studio',kind:'design',ids:['c']})});
    assert.deepEqual(await viaHttp.json(),{resolved:1,remaining:1});
    assert.deepEqual((await service.prepareFeedback(doc.id)).annotations,[]);
    const revived=await service.annotations(doc.id,[sent('a','标题再大一点'),sent('b','留白太多')]);
    assert.deepEqual(revived.map(n=>[n.id,n.status]),[['a','resolved'],['b','sent'],['c','resolved'],['test-note','resolved']]);
    // 外壳只传可见评论时，已解决的保留，未解决且没传的按删除处理
    assert.deepEqual((await service.annotations(doc.id,[])).map(n=>n.id),['a','c','test-note']);
    await assert.rejects(service.resolveFeedback('studio','design',[]),{code:'invalid_feedback_ids'});
    const badIds=await fetch(new URL('resolve-feedback',service.api),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({path:'studio',ids:'a'})});
    assert.equal(badIds.status,400);assert.equal((await badIds.json()).code,'invalid_feedback_ids');
    await assert.rejects(service.resolveFeedback('../outside','design',['a']));
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
