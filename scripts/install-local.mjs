import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { existsSync } from 'node:fs';
const root=path.resolve(import.meta.dirname,'..');
// 与 src/paths.mjs 同一规则：源码检出数据在项目 .local、作品就是项目；npm 安装数据在 ~/.minedesign、作品默认在 ~/MineDesign
const checkout=existsSync(path.join(root,'.git'));
const data=checkout?path.join(root,'.local'):path.resolve(process.env.MINEDESIGN_HOME||path.join(os.homedir(),'.minedesign'));
const args=process.argv.slice(2);
const saved=await fs.readFile(path.join(data,'install.json'),'utf8').then(JSON.parse,()=>({}));
// 更新后重装沿用上次选的作品目录
const workspace=path.resolve(args.includes('--workspace')?args[args.indexOf('--workspace')+1]:saved.workspace??(checkout?root:path.join(os.homedir(),'MineDesign')));
await fs.mkdir(workspace,{recursive:true});
await fs.mkdir(data,{recursive:true});
await fs.writeFile(path.join(data,'install.json'),JSON.stringify({workspace},null,2));
const version=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version;
const fingerprint=createHash('sha256');
// 服务、页面和编辑器都参与指纹，后端独立打包后也能识别新构建。
for(const folder of ['dist','apps/design-editor/dist','apps/design-system-editor/dist']){
  const entries=await fs.readdir(path.join(root,folder),{recursive:true,withFileTypes:true});
  const files=entries.filter(entry=>entry.isFile()).map(entry=>path.join(entry.parentPath,entry.name)).sort();
  for(const file of files)fingerprint.update(path.relative(root,file)).update('\0').update(await fs.readFile(file));
}
const buildId=fingerprint.digest('hex');
const market=path.join(data,'marketplace');
const plugin=path.join(market,'plugins/minedesign');
await fs.mkdir(path.join(plugin,'.codex-plugin'),{recursive:true});
await fs.copyFile(path.join(root,'.codex-plugin/plugin.json'),path.join(plugin,'.codex-plugin/plugin.json'));
await fs.cp(path.join(root,'assets/brand'),path.join(plugin,'assets/brand'),{recursive:true});
await fs.writeFile(path.join(plugin,'.mcp.json'),JSON.stringify({mcpServers:{minedesign:{command:process.execPath,args:[path.join(root,'dist/cli.mjs'),'mcp','--workspace',workspace],env:{MINEDESIGN_PLUGIN_VERSION:version,MINEDESIGN_PLUGIN_BUILD:buildId}}}},null,2));
await fs.cp(path.join(root,'skills'),path.join(plugin,'skills'),{recursive:true});
await fs.mkdir(path.join(market,'.agents/plugins'),{recursive:true});
await fs.writeFile(path.join(market,'.agents/plugins/marketplace.json'),JSON.stringify({name:'minedesign-local',interface:{displayName:'MineDesign Local Experiment'},plugins:[{name:'minedesign',source:{source:'local',path:'./plugins/minedesign'},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'}}]},null,2));
// Codex 桌面版已并入 ChatGPT.app，CLI 不一定在 PATH；按 CODEX_BIN → PATH → 已知安装位置查找
function findCodex(){
  const candidates=[process.env.CODEX_BIN,'codex','/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex','/Applications/Codex.app/Contents/Resources/codex'].filter(Boolean);
  for(const bin of candidates){try{execFileSync(bin,['--version'],{stdio:'ignore'});return bin;}catch{}}
  throw new Error('找不到 Codex CLI；请设置 CODEX_BIN 指向 codex 可执行文件后重试');
}
const codex=findCodex();
execFileSync(codex,['plugin','marketplace','add',market,'--json'],{stdio:'inherit'});
execFileSync(codex,['plugin','add','minedesign@minedesign-local','--json'],{stdio:'inherit'});
