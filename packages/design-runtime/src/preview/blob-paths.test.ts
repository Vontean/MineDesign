import { beforeAll, expect, it } from 'vitest';
import { installPreviewComponentImports } from './component-imports';
import { blobPlaceholderImage, normalizeBlobAssetPaths, normalizeProjectBlobPaths } from './blob-paths';

const id = '0123456789abcdef0123456789abcdef';

beforeAll(() => installPreviewComponentImports()());

it('相对写法的素材路径统一成 前缀/_blob/id', () => {
  expect(normalizeBlobAssetPaths(`<img src="_blob/${id}">`)).toBe(`<img src="/_blob/${id}">`);
  expect(normalizeBlobAssetPaths(`url(./_blob/${id})`)).toBe(`url(/_blob/${id})`);
});

it('id 不是 32 位十六进制，或前面是路径片段时不改', () => {
  const short = '0123456789abcdef0123456789abcde';
  expect(normalizeBlobAssetPaths(`src="_blob/${short}"`)).toBe(`src="_blob/${short}"`);
  expect(normalizeBlobAssetPaths(`src="_blob/${id}0"`)).toBe(`src="_blob/${id}0"`);
  expect(normalizeBlobAssetPaths(`https://h/x/_blob/${id}`)).toBe(`https://h/x/_blob/${id}`);
});

it('没有改动时批量处理返回原对象，有改动时只改项目源文件', () => {
  const clean = { 'a.css': 'body{}' };
  expect(normalizeProjectBlobPaths(clean)).toBe(clean);
  const files = { 'a.css': `a{background:url(_blob/${id})}`, 'img.png': `_blob/${id}` };
  const out = normalizeProjectBlobPaths(files);
  expect(out).not.toBe(files);
  expect(out['a.css']).toBe(`a{background:url(/_blob/${id})}`);
  expect(out['img.png']).toBe(`_blob/${id}`);
});

it('占位图是可直接作为 src 的 SVG data URI', () => {
  expect(blobPlaceholderImage.startsWith('data:image/svg+xml,')).toBe(true);
});
