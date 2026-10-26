import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const repository=path.resolve(import.meta.dirname,'..');
async function fixture(base,name,checkout){
  const root=path.join(base,name);
  for(const dir of ['scripts','.codex-plugin','assets/brand','skills/design','dist','apps/design-editor/dist','apps/design-system-editor/dist'])await fs.mkdir(path.join(root,dir),{recursive:true});
  await fs.copyFile(path.join(repository,'scripts/install-local.mjs'),path.join(root,'scripts/install-local.mjs'));
  await fs.writeFile(path.join(root,'package.json'),JSON.stringify({version:checkout?'0.1.2-dev.0':'0.1.1'}));
  await fs.writeFile(path.join(root,'.codex-plugin/plugin.json'),JSON.stringify({name:'minedesign',version:checkout?'0.1.2-dev.0':'0.1.1',interface:{displayName:'MineDesign'}}));
  for(const file of ['dist/cli.mjs','apps/design-editor/dist/index.html','apps/design-system-editor/dist/index.html'])await fs.writeFile(path.join(root,file),'fixture');
  await fs.writeFile(path.join(root,'skills/design/SKILL.md'),'fixture');
  if(checkout)await fs.mkdir(path.join(root,'.git'));
  return await fs.realpath(root);
}
function install(root,args,env){return spawnSync(process.execPath,[path.join(root,'scripts/install-local.mjs'),...args],{encoding:'utf8',env:{...process.env,...env}});}
test('生产与 Dev 注册可共存，重新安装 Dev 不改变生产启动配置',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-install-'));
  try{
    const codex=path.join(temp,'codex');await fs.writeFile(codex,`#!${process.execPath}\nprocess.exit(0);\n`);await fs.chmod(codex,0o755);
    const prod=await fixture(temp,'npm-package',false),dev=await fixture(temp,'checkout',true),prodHome=path.join(temp,'production-data'),devHome=path.join(temp,'development-data'),workspace=path.join(temp,'artifacts');await fs.mkdir(workspace);
    const env={CODEX_BIN:codex};
    const p=install(prod,['--workspace',workspace],{...env,MINEDESIGN_HOME:prodHome});assert.equal(p.status,0,p.stderr);
    const prodConfig=path.join(prodHome,'marketplace/plugins/minedesign/.mcp.json'),before=await fs.readFile(prodConfig,'utf8');
    for(let i=0;i<2;i++){const d=install(dev,['--dev','--workspace',workspace],{...env,MINEDESIGN_HOME:devHome});assert.equal(d.status,0,d.stderr);}
    assert.equal(await fs.readFile(prodConfig,'utf8'),before);
    const read=async f=>JSON.parse(await fs.readFile(f,'utf8'));
    const prodMcp=JSON.parse(before).mcpServers.minedesign;
    const devMcp=(await read(path.join(devHome,'marketplace/plugins/minedesign-dev/.mcp.json'))).mcpServers['minedesign-dev'];
    assert.equal(prodMcp.args[0],path.join(prod,'dist/cli.mjs'));assert.equal(devMcp.args[0],path.join(dev,'dist/cli.mjs'));
    assert.equal(prodMcp.env.MINEDESIGN_HOME,prodHome);assert.equal(devMcp.env.MINEDESIGN_HOME,devHome);
    assert.equal((await read(path.join(devHome,'marketplace/plugins/minedesign-dev/.codex-plugin/plugin.json'))).interface.displayName,'MineDesign dev');
  }finally{await fs.rm(temp,{recursive:true,force:true});}
});
test('源码未显式选择 Dev 时拒绝安装，不生成生产插件注册',async()=>{
  const temp=await fs.mkdtemp(path.join(os.tmpdir(),'mdn-install-guard-'));
  try{const root=await fixture(temp,'checkout',true),data=path.join(temp,'data');const result=install(root,[],{MINEDESIGN_HOME:data});assert.notEqual(result.status,0);assert.match(result.stderr,/install:dev/);await assert.rejects(fs.access(data));}
  finally{await fs.rm(temp,{recursive:true,force:true});}
});
