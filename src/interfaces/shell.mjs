import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { ROOT } from '../paths.mjs';

// 每次从磁盘读取构建产物，构建标识让已打开的外壳发现新构建。
export async function readShell(config){
  const raw=await fs.readFile(path.join(ROOT,'dist/app.html'),'utf8');
  const build=createHash('sha256').update(raw).digest('hex').slice(0,16);
  return {build,html:raw.replace('/*__CONFIG__*/',()=>JSON.stringify({...config,build}).replaceAll('<','\\u003c'))};
}

// 标识一致时只返回标识，避免轮询反复传输整页。
export async function shellUpdate(config,build){
  const shell=await readShell(config);
  return shell.build===build?{build}:shell;
}
