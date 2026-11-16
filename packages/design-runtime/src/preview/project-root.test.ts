import { expect, it } from 'vitest';
import { setPreviewProjectRoot, stripPreviewProjectRoot } from './project-root';

it('没有记录项目根的预览，路径原样返回', () => {
  expect(stripPreviewProjectRoot('p/a.html', {})).toBe('p/a.html');
  expect(stripPreviewProjectRoot('p/a.html', null)).toBe('p/a.html');
});

it('路径以项目根开头时去掉这一段，根前面的斜杠不影响匹配', () => {
  const preview = {};
  setPreviewProjectRoot(preview, '/p/');
  expect(stripPreviewProjectRoot('p/a.html', preview)).toBe('a.html');
  expect(stripPreviewProjectRoot('q/a.html', preview)).toBe('q/a.html');
});

it('清除记录后恢复原样；不同预览互不影响', () => {
  const a = {};
  const b = {};
  setPreviewProjectRoot(a, 'p/');
  setPreviewProjectRoot(b, 'q/');
  expect(stripPreviewProjectRoot('q/x', a)).toBe('q/x');
  expect(stripPreviewProjectRoot('q/x', b)).toBe('x');
  setPreviewProjectRoot(b, undefined);
  expect(stripPreviewProjectRoot('q/x', b)).toBe('q/x');
});

it('预览为空时忽略设置', () => {
  expect(() => setPreviewProjectRoot(null, 'p/')).not.toThrow();
});
