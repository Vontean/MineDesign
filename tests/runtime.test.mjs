import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { startRuntime } from '../src/backend/runtime.mjs';
import { startService, ROOT } from '../src/backend/service.mjs';

test('a rejected backend update keeps the existing service usable',async()=>{
  const tmp=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-failed-reload-'));
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(tmp,'studio'),{recursive:true});
  let loads=0;
  const runtime=await startRuntime({workspace:tmp},async()=>{if(loads++)throw new Error('invalid build');return startService;});
  try{
    const doc=await runtime.open('studio');
    await assert.rejects(runtime.reload(),/invalid build/);
    assert.equal((await runtime.open('studio')).id,doc.id);
    assert.equal((await runtime.proxy({path:doc.editorPath})).status,200);
  }finally{await runtime.close();await fs.rm(tmp,{recursive:true,force:true});}
});
