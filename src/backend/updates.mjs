import fs from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const run = async (command, args, cwd) => (await exec(command, args, { cwd, maxBuffer: 32e6 })).stdout.trim();

// 与 package.json 的 build 脚本同序；用当前 Node 运行，不依赖宿主的 PATH 里有 npm。
async function buildAll(root) {
  for (const script of ['scripts/build-brand-icons.mjs', 'apps/design-editor/build.mjs', 'apps/design-system-editor/build.mjs', 'scripts/build.mjs'])
    await run(process.execPath, [script], root);
}
async function installDependencies(root) {
  const npm = path.join(path.dirname(process.execPath), 'npm');
  await run(existsSync(npm) ? npm : 'npm', ['install', '--no-audit', '--no-fund'], root);
}
async function npmInstallGlobal(spec) {
  const npm = path.join(path.dirname(process.execPath), 'npm');
  await run(existsSync(npm) ? npm : 'npm', ['install', '--global', spec, '--no-audit', '--no-fund'], process.cwd());
}
async function registryLatest(name) {
  const response = await fetch(`https://registry.npmjs.org/${name.replace('/', '%2f')}/latest`);
  if (!response.ok) throw new Error(`npm registry ${response.status}`);
  return (await response.json()).version;
}
const newer = (a, b) => {
  const [x, y] = [a, b].map(v => v.split('.').map(Number));
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] > y[i];
  return false;
};
async function fileHash(file) {
  try {
    return createHash('sha256').update(await fs.readFile(file)).digest('hex');
  } catch {
    return null;
  }
}

/**
 * 本机一键更新。source 为 git（源码检出，开发版）时与当前分支的上游对比，只做快进合并，本地有未提交改动或没有上游时拒绝；
 * 为 npm（npm 安装，生产版）时查 npm 上的 latest，用全局安装换成新版本，再重新登记 Codex 插件。
 * 任务状态写在 statusFile，后端重新加载后仍可读到结果。build、install、reload 等可替换，测试用真实 git 仓库但不真正构建。
 */
export function createUpdates({ root, statusFile, source = 'git', build = buildAll, install = installDependencies, latest: latestOf = registryLatest, installRelease = npmInstallGlobal, registerPlugin = () => run(process.execPath, [path.join(root, 'scripts/install-local.mjs')], root), reload = async () => {} }) {
  const git = (...args) => run('git', args, root);
  let running = null;

  async function version() {
    return JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')).version;
  }
  async function readJob() {
    try {
      return JSON.parse(await fs.readFile(statusFile, 'utf8'));
    } catch {
      return { state: 'idle' };
    }
  }
  async function writeJob(job) {
    await fs.mkdir(path.dirname(statusFile), { recursive: true });
    // 先写临时文件再改名，读的一方不会读到写了一半的内容
    const temp = `${statusFile}.${process.pid}.tmp`;
    await fs.writeFile(temp, JSON.stringify(job));
    await fs.rename(temp, statusFile);
  }
  async function packageName() {
    return JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8')).name;
  }
  async function inspect({ fetch }) {
    if (source === 'npm') {
      const latest = await latestOf(await packageName());
      return { source, latest, behind: newer(latest, await version()) ? 1 : 0 };
    }
    const upstream = await git('rev-parse', '--abbrev-ref', '@{u}').catch(() => null);
    if (!upstream) return { blocked: 'no-upstream' };
    if (fetch) await git('fetch', '--quiet');
    const behind = Number(await git('rev-list', '--count', 'HEAD..@{u}'));
    const latest = JSON.parse(await git('show', '@{u}:package.json')).version;
    const dirty = (await git('status', '--porcelain')) !== '';
    return { upstream, behind, latest, ...(dirty ? { blocked: 'dirty' } : {}) };
  }

  async function about({ check = false } = {}) {
    let status = null;
    if (check) {
      try {
        status = await inspect({ fetch: true });
      } catch (error) {
        status = { error: error.message.split('\n')[0] };
      }
    }
    const job = await readJob();
    // 进程重启后遗留的 running 已经不会完成
    return { version: await version(), status, job: job.state === 'running' && !running ? { state: 'failed', error: 'interrupted' } : job };
  }

  async function npmSteps() {
    const step = async name => writeJob({ state: 'running', step: name });
    await step('fetch');
    const { latest } = await inspect({ fetch: true });
    const cli = await fileHash(path.join(root, 'dist/cli.mjs'));
    await step('release');
    await installRelease(`${await packageName()}@${latest}`);
    // 包目录已整体换新：用新版本的安装脚本重新登记插件，MCP 参数与构建号随之更新
    await step('plugin');
    await registerPlugin();
    const reconnect = (await fileHash(path.join(root, 'dist/cli.mjs'))) !== cli;
    await writeJob({ state: 'done', reconnect, version: await version() });
    await reload();
  }

  async function steps() {
    if (source === 'npm') return npmSteps();
    const step = async name => writeJob({ state: 'running', step: name });
    await step('fetch');
    const before = await inspect({ fetch: true });
    if (before.blocked) throw new Error(before.blocked);
    const lock = await fileHash(path.join(root, 'package-lock.json'));
    const cli = await fileHash(path.join(root, 'dist/cli.mjs'));
    await step('merge');
    await git('merge', '--ff-only', '@{u}');
    if ((await fileHash(path.join(root, 'package-lock.json'))) !== lock) {
      await step('install');
      await install(root);
    }
    await step('build');
    await build(root);
    // 稳定 CLI 变了时，需要宿主刷新连接才能用上新接口
    const reconnect = (await fileHash(path.join(root, 'dist/cli.mjs'))) !== cli;
    await writeJob({ state: 'done', reconnect, version: await version() });
    await reload();
  }

  async function update() {
    if (!running) {
      const status = await inspect({ fetch: false }).catch(error => ({ blocked: error.message }));
      if (status.blocked) throw new Error(status.blocked);
      // 先记下 running 再启动，避免任务很快失败时被这条记录覆盖
      await writeJob({ state: 'running', step: 'fetch' });
      running = steps()
        .catch(error => writeJob({ state: 'failed', error: error.message.split('\n')[0] }))
        .finally(() => {
          running = null;
        });
    }
    return about();
  }

  return { about, update, idle: () => running ?? Promise.resolve() };
}
