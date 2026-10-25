import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { projectOf } from '../src/backend/projects.mjs';

// 项目归组：显式 project.json 优先；没有时设计稿带上它引用的设计系统，设计系统只在唯一被引用时归入
const ROOT=path.resolve(import.meta.dirname,'..');
async function workspace(){
  const tmp=await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(),'mdn-projects-')));
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(tmp,'pine/app'),{recursive:true});
  await fs.cp(path.join(ROOT,'examples/showcase-system'),path.join(tmp,'pine/system'),{recursive:true});
  await fs.cp(path.join(ROOT,'tests/fixtures/studio'),path.join(tmp,'pine/other'),{recursive:true});
  const link=async dir=>{const file=path.join(tmp,dir,'canvas.json');const canvas=JSON.parse(await fs.readFile(file,'utf8'));await fs.writeFile(file,JSON.stringify({...canvas,designSystems:[{artifact:'../system'}]}));};
  return {tmp,link};
}

test('a design groups with the design systems it references; a system joins its only referencing design',async()=>{
  const {tmp,link}=await workspace();
  try{
    await link('pine/app');
    const app=await projectOf(tmp,path.join(tmp,'pine/app'),'design');
    assert.deepEqual(app.files.map(f=>[f.kind,path.relative(tmp,f.path)]),[['design','pine/app'],['design-system','pine/system']]);
    const system=await projectOf(tmp,path.join(tmp,'pine/system'),'design-system');
    assert.equal(system.id,app.id);
    // 两份设计稿都引用时说不清归属，设计系统单独成项目
    await link('pine/other');
    const alone=await projectOf(tmp,path.join(tmp,'pine/system'),'design-system');
    assert.deepEqual(alone.files.map(f=>f.kind),['design-system']);
    const other=await projectOf(tmp,path.join(tmp,'pine/other'),'design');
    assert.notEqual(other.id,app.id);
  }finally{await fs.rm(tmp,{recursive:true,force:true});}
});

test('project.json names the project and lists its members; missing or unknown members are skipped',async()=>{
  const {tmp}=await workspace();
  try{
    await fs.writeFile(path.join(tmp,'pine/project.json'),JSON.stringify({name:'Pine',files:[{kind:'design',path:'app'},{kind:'design-system',path:'system'},{kind:'motion',path:'motion'},{kind:'design',path:'missing'},{kind:'design',path:'../../outside'}]}));
    const app=await projectOf(tmp,path.join(tmp,'pine/app'),'design');
    assert.equal(app.name,'Pine');
    assert.deepEqual(app.files.map(f=>path.relative(tmp,f.path)),['pine/app','pine/system']);
    assert.equal((await projectOf(tmp,path.join(tmp,'pine/system'),'design-system')).id,app.id);
    // 没被列出的文件不属于这个项目
    const other=await projectOf(tmp,path.join(tmp,'pine/other'),'design');
    assert.deepEqual(other.files.map(f=>path.relative(tmp,f.path)),['pine/other']);
  }finally{await fs.rm(tmp,{recursive:true,force:true});}
});
