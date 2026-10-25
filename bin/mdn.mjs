#!/usr/bin/env node
import fs from 'node:fs';
const args=process.argv.slice(2);
if(args.includes('--version')||args.includes('-v')){
  console.log(`MDN ${JSON.parse(fs.readFileSync(new URL('../package.json',import.meta.url),'utf8')).version}`);
}else if(args.includes('--help')||args.includes('-h')){
  console.log('MineDesign (MDN)\n\nmdn [--workspace PATH] [--port PORT]  打开本地设计服务\nmdn mcp [--workspace PATH]          启动 Codex MCP 服务\nmdn plugin install [--workspace PATH]  安装或更新 Codex 插件（npm 安装默认作品目录 ~/MineDesign）\nmdn --version                       查看版本');
}else if(args[0]==='plugin'&&args[1]==='install'){
  await import('../scripts/install-local.mjs');
}else{
  await import('../dist/cli.mjs');
}
