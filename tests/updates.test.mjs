import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { createUpdates } from '../src/backend/updates.mjs';
import { createSettings } from '../src/backend/settings.mjs';

// 真实 git 仓库：上游前进一个版本，本机副本检查、拒绝脏工作区、快进更新；构建替换为记录调用。
Object.assign(process.env, { GIT_AUTHOR_NAME: 'test', GIT_AUTHOR_EMAIL: 't@example.com', GIT_COMMITTER_NAME: 'test', GIT_COMMITTER_EMAIL: 't@example.com' });
const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8' }).trim();
async function commitVersion(dir, version) {
  await fs.writeFile(path.join(dir, 'package.json'), JSON.stringify({ name: 'minedesign', version }));
  git(dir, 'add', '-A');
  git(dir, 'commit', '-qm', version);
  git(dir, 'push', '-q');
}

test('update checks the upstream, refuses a dirty checkout and fast-forwards with a rebuild', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mdn-update-'));
  try {
    const remote = path.join(tmp, 'remote.git'), author = path.join(tmp, 'author'), local = path.join(tmp, 'local');
    git(tmp, 'init', '-q', '--bare', '-b', 'main', remote);
    git(tmp, 'clone', '-q', remote, author);
    git(author, 'checkout', '-qb', 'main');
    await commitVersion(author, '0.0.1');
    git(author, 'push', '-qu', 'origin', 'main');
    git(tmp, 'clone', '-q', remote, local);
    await commitVersion(author, '0.0.2');

    const builds = [];
    const updates = createUpdates({ root: local, statusFile: path.join(local, '.local/update.json'), build: async root => builds.push(root) });
    await fs.appendFile(path.join(local, '.git/info/exclude'), '.local/\n');
    const checked = await updates.about({ check: true });
    assert.equal(checked.version, '0.0.1');
    assert.deepEqual({ ...checked.status, upstream: undefined }, { upstream: undefined, behind: 1, latest: '0.0.2' });

    await fs.writeFile(path.join(local, 'draft.txt'), 'unsaved');
    assert.equal((await updates.about({ check: true })).status.blocked, 'dirty');
    await assert.rejects(updates.update(), /dirty/);
    await fs.rm(path.join(local, 'draft.txt'));

    assert.equal((await updates.update()).job.state, 'running');
    await updates.idle();
    const done = await updates.about();
    assert.equal(done.version, '0.0.2');
    assert.equal(done.job.state, 'done');
    assert.deepEqual(builds, [local]);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
});

test('settings default to following Codex and reject unknown languages', async () => {
  const tmp = await fs.mkdtemp(path.join(os.tmpdir(), 'mdn-settings-'));
  try {
    const settings = createSettings(path.join(tmp, 'settings.json'));
    assert.deepEqual(await settings.read(), { language: 'system' });
    assert.deepEqual(await settings.update({ language: 'en' }), { language: 'en' });
    assert.deepEqual(await settings.read(), { language: 'en' });
    await assert.rejects(settings.update({ language: 'fr' }), /不支持/);
  } finally {
    await fs.rm(tmp, { recursive: true, force: true });
  }
});
