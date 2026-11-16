// @vitest-environment happy-dom
import { expect, it } from 'vitest';
import {
  adjacentPrintableArtboard,
  isInteractivePreviewTarget,
  printableArtboardIndex,
  printableArtboards,
  withClosedPreview,
} from './preview-navigation';

const boards = [
  { file: 'a.dc.html' },
  { file: 'bg.dc.html', frameless: true },
  { file: 'c.dc.html' },
  { file: 'd.dc.html' },
];

it('无边框画板不参与翻页，序号只在可打印画板里计数', () => {
  expect(printableArtboards(boards).map((b) => b.file)).toEqual(['a.dc.html', 'c.dc.html', 'd.dc.html']);
  expect(printableArtboardIndex(boards, 'c.dc.html')).toEqual({ index: 1, count: 3 });
  expect(printableArtboardIndex(boards, 'bg.dc.html')).toBeNull();
});

it('向前向后翻页会跳过无边框画板，到头时没有下一张', () => {
  expect(adjacentPrintableArtboard(boards, 'a.dc.html', 1)).toEqual({ artboard: boards[2], index: 1, count: 3 });
  expect(adjacentPrintableArtboard(boards, 'c.dc.html', -1)).toEqual({ artboard: boards[0], index: 0, count: 3 });
  expect(adjacentPrintableArtboard(boards, 'd.dc.html', 1)).toBeNull();
  expect(adjacentPrintableArtboard(boards, 'missing', 1)).toBeNull();
});

it('输入框、滑块和可编辑内容属于预览里的交互元素', () => {
  document.body.innerHTML = '<div><input id="i"><div role="slider"><b id="s"></b></div><p id="p"></p></div>';
  expect(isInteractivePreviewTarget(document.getElementById('i'))).toBe(true);
  expect(isInteractivePreviewTarget(document.getElementById('s'))).toBe(true);
  expect(isInteractivePreviewTarget(document.getElementById('p'))).toBe(false);
  expect(isInteractivePreviewTarget(null)).toBe(false);
});

it('预览开着时先关闭、做完任务再恢复；没开着就直接做', async () => {
  const log: string[] = [];
  const preview = (state: string | null) => ({
    current: () => state,
    leave: () => log.push('leave'),
    laidOut: async () => log.push('laidOut'),
    mayReopen: () => true,
    reopen: async () => log.push('reopen'),
  });
  expect(await withClosedPreview(preview('x'), () => { log.push('task'); return 7; })).toBe(7);
  expect(log).toEqual(['leave', 'laidOut', 'task', 'reopen']);
  log.length = 0;
  await withClosedPreview(preview(null), () => log.push('task'));
  expect(log).toEqual(['task']);
});

it('任务失败时仍然恢复预览，并把错误交给调用方', async () => {
  const log: string[] = [];
  const session = {
    current: () => 's',
    leave: () => {},
    laidOut: async () => {},
    mayReopen: () => true,
    reopen: async () => { log.push('reopen'); },
  };
  await expect(withClosedPreview(session, () => { throw new Error('boom'); })).rejects.toThrow('boom');
  expect(log).toEqual(['reopen']);
});
