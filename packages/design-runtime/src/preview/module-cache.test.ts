import { afterEach, beforeEach, expect, it, vi } from 'vitest';
vi.mock('./runtime-loading', () => ({ supportsBlobScripts: () => true }));
import { createLinkedFileScript, runtimeModuleBlobs, runtimeModuleUrls } from './module-cache';

let created: Blob[] = [];
const revoked: string[] = [];
const origCreate = URL.createObjectURL;
const origRevoke = URL.revokeObjectURL;
beforeEach(() => {
  vi.useFakeTimers();
  created = [];
  revoked.length = 0;
  URL.createObjectURL = ((blob: Blob) => (created.push(blob), 'blob:' + created.length)) as typeof URL.createObjectURL;
  URL.revokeObjectURL = ((url: string) => void revoked.push(url)) as typeof URL.revokeObjectURL;
});
afterEach(() => {
  vi.useRealTimers();
  URL.createObjectURL = origCreate;
  URL.revokeObjectURL = origRevoke;
});

it('脚本文件的 Blob 是 javascript，其他文件是纯文本；内容不变时复用同一个 Blob', () => {
  const sources = { 'file:a.js': 'a', 'file:b.css': 'b' };
  const first = runtimeModuleBlobs(sources);
  expect(first['file:a.js'].type).toBe('text/javascript');
  expect(first['file:b.css'].type).toBe('text/plain');
  expect(runtimeModuleBlobs(sources)['file:a.js']).toBe(first['file:a.js']);
  expect(runtimeModuleBlobs({ 'file:a.js': 'a2' })['file:a.js']).not.toBe(first['file:a.js']);
});

it('只给 js / mjs 生成对象 URL，同一份内容只生成一次', () => {
  const sources = { 'file:lib/a.mjs': 'a', 'file:b.css': 'b', 'file:c.jsx': 'c' };
  expect(runtimeModuleUrls(sources)).toEqual({ 'lib/a.mjs': 'blob:1' });
  expect(runtimeModuleUrls(sources)).toEqual({ 'lib/a.mjs': 'blob:1' });
  expect(created).toHaveLength(1);
});

it('内容变化后旧 URL 延迟 60 秒释放', () => {
  runtimeModuleUrls({ 'file:a.js': 'v1' });
  runtimeModuleUrls({ 'file:a.js': 'v2' });
  expect(revoked).toEqual([]);
  vi.advanceTimersByTime(60000);
  expect(revoked).toEqual(['blob:1']);
});

it('不支持 Blob 脚本时不生成 URL', () => {
  expect(runtimeModuleUrls({ 'file:a.js': 'x' }, false)).toEqual({});
  expect(created).toHaveLength(0);
});

it('较大的文件才生成链接脚本，相同内容复用 URL', () => {
  expect(createLinkedFileScript('a.js', 'x'.repeat(4095))).toBeUndefined();
  const url = createLinkedFileScript('a.js', 'x'.repeat(4096));
  expect(url).toBe('blob:1');
  expect(createLinkedFileScript('a.js', 'x'.repeat(4096))).toBe(url);
  expect(createLinkedFileScript('a.js', 'x'.repeat(4096), false)).toBeUndefined();
});
