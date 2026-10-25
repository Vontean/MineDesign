import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT } from '../paths.mjs';

// 外壳与两套编辑器入口共同决定构建标识；编辑器入口引用带哈希的资源，重建编辑器也会改变标识。
const BUILD_FILES=['apps/design-editor/dist/index.html','apps/design-system-editor/dist/index.html'];

// 每次从磁盘读取构建产物，构建标识让已打开的外壳发现新构建。
export async function readShell(config){
  const raw=await fs.readFile(path.join(ROOT,'dist/app.html'),'utf8');
  const hash=createHash('sha256').update(raw);
  for(const file of BUILD_FILES)hash.update(await fs.readFile(path.join(ROOT,file)));
  const build=hash.digest('hex').slice(0,16);
  return {build,html:raw.replace('/*__CONFIG__*/',()=>JSON.stringify({...config,build}).replaceAll('<','\\u003c'))};
}

// 标识一致时只返回标识，避免轮询反复传输整页。
export async function shellUpdate(config,build){
  const shell=await readShell(config);
  return shell.build===build?{build}:shell;
}
