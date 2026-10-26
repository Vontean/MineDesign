import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import os from 'node:os';
import { existsSync } from 'node:fs';
const root=path.resolve(import.meta.dirname,'..');
// 与 src/paths.mjs 同一规则；源码安装必须显式选择 Dev，避免覆盖生产插件。
const checkout=existsSync(path.join(root,'.git'));
const args=process.argv.slice(2);
const dev=args.includes('--dev');
if(checkout&&!dev)throw new Error('源码只能安装 Dev 插件：运行 npm run install:dev；生产版请使用 npm 安装的 mdn plugin install');
if(dev&&!checkout)throw new Error('Dev 插件必须从源码 checkout 安装');
const name=dev?'minedesign-dev':'minedesign';
const marketName=dev?'minedesign-dev-local':'minedesign-local';
const data=path.resolve(process.env.MINEDESIGN_HOME||(dev?path.join(root,'.local/dev'):path.join(os.homedir(),'.minedesign')));
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
const plugin=path.join(market,'plugins',name);
await fs.mkdir(path.join(plugin,'.codex-plugin'),{recursive:true});
const manifest=JSON.parse(await fs.readFile(path.join(root,'.codex-plugin/plugin.json'),'utf8'));
manifest.name=name;
if(dev){manifest.interface.displayName='MineDesign dev';manifest.description='MineDesign source development environment';manifest.interface.shortDescription='Develop and verify MineDesign separately from production';}
await fs.writeFile(path.join(plugin,'.codex-plugin/plugin.json'),JSON.stringify(manifest,null,2));
await fs.cp(path.join(root,'assets/brand'),path.join(plugin,'assets/brand'),{recursive:true});
await fs.writeFile(path.join(plugin,'.mcp.json'),JSON.stringify({mcpServers:{[name]:{command:process.execPath,args:[path.join(root,'dist/cli.mjs'),'mcp','--workspace',workspace],env:{MINEDESIGN_PLUGIN_VERSION:version,MINEDESIGN_PLUGIN_BUILD:buildId,MINEDESIGN_CHANNEL:dev?'dev':'production',MINEDESIGN_HOME:data}}}},null,2));
await fs.cp(path.join(root,'skills'),path.join(plugin,'skills'),{recursive:true});
await fs.mkdir(path.join(market,'.agents/plugins'),{recursive:true});
await fs.writeFile(path.join(market,'.agents/plugins/marketplace.json'),JSON.stringify({name:marketName,interface:{displayName:dev?'MineDesign dev':'MineDesign'},plugins:[{name,source:{source:'local',path:`./plugins/${name}`},policy:{installation:'AVAILABLE',authentication:'ON_INSTALL'}}]},null,2));
// Codex 桌面版已并入 ChatGPT.app，CLI 不一定在 PATH；按 CODEX_BIN → PATH → 已知安装位置查找
function findCodex(){
  const candidates=[process.env.CODEX_BIN,'codex','/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex','/Applications/Codex.app/Contents/Resources/codex'].filter(Boolean);
  for(const bin of candidates){try{execFileSync(bin,['--version'],{stdio:'ignore'});return bin;}catch{}}
  throw new Error('找不到 Codex CLI；请设置 CODEX_BIN 指向 codex 可执行文件后重试');
}
const codex=findCodex();
execFileSync(codex,['plugin','marketplace','add',market,'--json'],{stdio:'inherit'});
execFileSync(codex,['plugin','add',`${name}@${marketName}`,'--json'],{stdio:'inherit'});
