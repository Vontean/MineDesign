import { expect, it } from 'vitest';
import {
  projectDirectoryOf,
  relativeProjectPath,
  resolveProjectAssetPath,
  rewriteProjectAssets,
} from './asset-rewriting';

it('相对路径按所在目录解析，绝对写法回到项目根', () => {
  expect(resolveProjectAssetPath('a/b/', '../img/p.png?v=1#x')).toBe('a/img/p.png');
  expect(resolveProjectAssetPath('a/b/', '/img/p.png')).toBe('img/p.png');
  expect(resolveProjectAssetPath('a/b/', '/appifact/img/p.png')).toBe('img/p.png');
  expect(resolveProjectAssetPath('a/', 'my%20dir/p.png')).toBe('a/my dir/p.png');
});

it('外部地址、目录和空路径解析不到项目文件', () => {
  expect(resolveProjectAssetPath('a/', 'https://h/p.png')).toBeNull();
  expect(resolveProjectAssetPath('a/', '//cdn/p.png')).toBeNull();
  expect(resolveProjectAssetPath('a/', 'img/')).toBeNull();
  expect(resolveProjectAssetPath('a/', '')).toBeNull();
});

it('目录和相对路径的换算', () => {
  expect(projectDirectoryOf('a/b/c.dc.html')).toBe('a/b/');
  expect(projectDirectoryOf('c.dc.html')).toBe('');
  expect(relativeProjectPath('a/b/', 'a/img/p.png')).toBe('../img/p.png');
  expect(relativeProjectPath('a/', 'a/p.png')).toBe('p.png');
});

it('图片引用换成 data URI，其他文件和未引用的素材不动', () => {
  const files = { 'img/p.png': 'AAA', 'img/q.svg': 'BBB', 'main.css': 'a{}' };
  const html = '<img src="img/p.png"><div style="background:url(./img/p.png)"></div><a href="main.css">';
  expect(rewriteProjectAssets(html, files)).toBe(
    '<img src="data:image/png;base64,AAA"><div style="background:url(data:image/png;base64,AAA)"></div><a href="main.css">',
  );
});

it('页面在子目录时识别相对写法，srcset 逐项替换并保留描述符', () => {
  const files = { 'a/img/p.png': 'AAA' };
  expect(rewriteProjectAssets('<img src="img/p.png">', files, 'a/')).toBe('<img src="data:image/png;base64,AAA">');
  expect(rewriteProjectAssets('<img srcset="img/p.png 2x, x.png 1x">', files, 'a/')).toBe(
    '<img srcset="data:image/png;base64,AAA 2x, x.png 1x">',
  );
});
