import { beforeAll, expect, it, vi } from 'vitest';
// build-document 依赖整个预览运行时，这里只需要它的长文本阈值
vi.mock('./build-document', () => ({ PreviewBuildDocumentResolvedValue: 64 * 1024 }));
import { installPreviewComponentImports } from './component-imports';
import {
  collectProjectDependencyFiles,
  getLinkedArtboards,
  maskNavigationLinks,
  resolveComponentFile,
  updateComponentRuntimeScript,
} from './dependency-graph';

beforeAll(() => installPreviewComponentImports()());

const files = {
  'Main.dc.html': '<a href="Board.dc.html">board</a><dc-import name="Card"></dc-import><img src="img/p.png">',
  'Board.dc.html': '<p>board</p>',
  'Card.dc.html': '<p>card</p>',
  'img/p.png': 'AAA',
};

it('导航链接的 href 被清空，注释换成等长空格', () => {
  expect(maskNavigationLinks('<a href="x.dc.html">go</a><!--c-->')).toBe('<a href="">go</a>' + ' '.repeat(8));
  expect(maskNavigationLinks('<area HREF=y>')).toBe('<area HREF="">');
});

it('只有导入才算依赖，导航链接不算', () => {
  expect([...getLinkedArtboards(files)]).toEqual(['Card.dc.html']);
});

it('从入口收集依赖文件：包含入口和素材，不含无关文件', () => {
  expect(Object.keys(collectProjectDependencyFiles({ ...files, 'unused.css': 'a{}' }, 'Main.dc.html')).sort()).toEqual(
    ['Card.dc.html', 'Main.dc.html', 'img/p.png'].sort(),
  );
  expect(collectProjectDependencyFiles(files, 'missing.html')).toEqual({});
});

it('按路径或按组件名找设计稿文件', () => {
  expect(resolveComponentFile(files, { kind: 'html', path: 'Board.dc.html' })).toBe('Board.dc.html');
  expect(resolveComponentFile(files, { kind: 'html', path: 'gone.dc.html' })).toBeUndefined();
  expect(resolveComponentFile(files, { kind: 'html', name: 'Card' })).toBe('Card.dc.html');
  expect(resolveComponentFile(files, { kind: 'js', name: 'Card' })).toBeUndefined();
});

it('运行时更新脚本里的组件名：当前文件用名称，其他设计稿用相对路径', () => {
  const run = (path?: string) =>
    updateComponentRuntimeScript('a/Main.dc.html', { kind: 'html', path, name: 'N' }, { k: 1 });
  expect(run('a/Main.dc.html')).toBe('window.__dcUpdate&&window.__dcUpdate("Main","html",{"k":1},false,"");');
  expect(run('a/b/Card.dc.html')).toContain('("b/Card",');
  expect(run('x/Card.dc.html')).toContain('("../x/Card",');
  expect(run(undefined)).toContain('("N",');
});
