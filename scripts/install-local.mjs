import fs from 'node:fs/promises';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
const root=path.resolve(import.meta.dirname,'..');
const version=JSON.parse(await fs.readFile(path.join(root,'package.json'),'utf8')).version;
const market=path.join(root,'.local/marketplace');
const plugin=path.join(market,'plugins/minedesign');
await fs.mkdir(path.join(plugin,'.codex-plugin'),{recursive:true});
await fs.copyFile(path.join(root,'.codex-plugin/plugin.json'),path.join(plugin,'.codex-plugin/plugin.json'));
await fs.cp(path.join(root,'assets/brand'),path.join(plugin,'assets/brand'),{recursive:true});
await fs.writeFile(path.join(plugin,'.mcp.json'),JSON.stringify({mcpServers:{minedesign:{command:process.execPath,args:[path.join(root,'dist/cli.mjs'),'mcp','--workspace',root],env:{MINEDESIGN_PLUGIN_VERSION:version}}}},null,2));
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
