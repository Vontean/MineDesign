import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs/promises';import os from 'node:os';import path from 'node:path';import {spawnSync} from 'node:child_process';
const repository=path.resolve(import.meta.dirname,'..');
test('生产包不包含开发演示目录及本机过程记录',()=>{
 const result=spawnSync('npm',['pack','--dry-run','--ignore-scripts','--json'],{cwd:repository,encoding:'utf8'});assert.equal(result.status,0,result.stderr);const files=JSON.parse(result.stdout)[0].files.map(f=>f.path);assert(!files.some(f=>f.startsWith('examples/')));assert(!files.includes('docs/verification.md'));assert(files.includes('dist/backend.mjs'));assert(files.includes('FORK.md'));
});
test('生产安装创建空工作区，重新安装保留用户文件',async()=>{
 const base=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-empty-install-'));
 try{
 const root=path.join(base,'package'),workspace=path.join(base,'workspace'),data=path.join(base,'data');for(const dir of ['scripts','.codex-plugin','assets/brand','skills','dist','apps/design-editor/dist','apps/design-system-editor/dist','examples/showcase'])await fs.mkdir(path.join(root,dir),{recursive:true});
 await fs.copyFile(path.join(repository,'scripts/install-local.mjs'),path.join(root,'scripts/install-local.mjs'));await fs.writeFile(path.join(root,'package.json'),JSON.stringify({version:'0.1.2'}));await fs.writeFile(path.join(root,'.codex-plugin/plugin.json'),JSON.stringify({name:'minedesign',version:'0.1.2',interface:{displayName:'MineDesign'}}));await fs.writeFile(path.join(root,'examples/showcase/canvas.json'),'Pine fixture');
 const codex=path.join(base,'codex');await fs.writeFile(codex,`#!${process.execPath}\nprocess.exit(0);\n`);await fs.chmod(codex,0o755);
 const run=()=>spawnSync(process.execPath,[path.join(root,'scripts/install-local.mjs'),'--workspace',workspace],{encoding:'utf8',env:{...process.env,CODEX_BIN:codex,MINEDESIGN_HOME:data}});
 let result=run();assert.equal(result.status,0,result.stderr);assert.deepEqual(await fs.readdir(workspace),[]);await fs.writeFile(path.join(workspace,'my-design.txt'),'user work');result=run();assert.equal(result.status,0,result.stderr);assert.equal(await fs.readFile(path.join(workspace,'my-design.txt'),'utf8'),'user work');
 }finally{await fs.rm(base,{recursive:true,force:true});}
});
