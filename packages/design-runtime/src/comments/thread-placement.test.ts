import { expect, it } from 'vitest';
import { serializeDesignCommentAnchor, stableAnchorHash } from './anchor-codec';
import { createCommentBoardLookup } from './anchor-resolution';
import {
  canvasToLayerPoint,
  commentAreaOutline,
  commentCardTargets,
  commentRevealTarget,
  computeThreadPlacements,
  revealFallbackPoint,
} from './thread-placement';

const viewport = { x: 100, y: 50, scale: 2 };
const win = { innerWidth: 1000, innerHeight: 800, scrollX: 0, scrollY: 10 };
const bounds = { left: 20, top: 30, width: 600, height: 400 };

// 解析函数只看锚点是否可解析，这里用画布锚点的序列化结果造线程
const thread = (id: string, x: number, y: number) => ({
  id,
  anchor: serializeDesignCommentAnchor({ kind: 'canvas', page: '', x, y }),
});
const resolveCanvasPoint = (anchor: { x: number; y: number }) => ({ x: anchor.x, y: anchor.y });

it('画布坐标换成图层像素', () => {
  expect(canvasToLayerPoint({ x: 110, y: 60 }, viewport)).toEqual({ x: 20, y: 20 });
});

it('线程落点：图层内按容器偏移并取整，图层外推到窗口之外', () => {
  const placements = computeThreadPlacements({
    threads: [thread('in', 200, 100), thread('left', 0, 100), thread('below', 200, 400)],
    resolveAnchorPoint: resolveCanvasPoint,
    viewport,
    bounds,
    toolbarHeight: 40,
    window: win,
  });
  // in：层内 (200,100) -> (200,100)，加容器偏移 (20,30) 与滚动 (0,10)
  expect(placements.in).toEqual({ x: 220, y: 140 });
  // left：层内 x = -200，小于 0，再往左推一个窗口宽度
  expect(placements.left!.x).toBe(-200 - 1000);
  // below：层内 y = 700 大于容器高度，再往下推一个窗口高度
  expect(placements.below!.y).toBe(700 + 800 + 10);
});

it('线程落点：解析不出位置的线程不出现', () => {
  const placements = computeThreadPlacements({
    threads: [thread('a', 1, 1), { id: 'bad', anchor: 'not-an-anchor' }],
    resolveAnchorPoint: () => null,
    viewport,
    bounds,
    toolbarHeight: 0,
    window: win,
  });
  expect(placements).toEqual({});
});

it('卡片目标点只保留可视区域内的线程', () => {
  const targets = commentCardTargets({
    threads: [thread('in', 200, 100), thread('out', 0, 100), thread('top', 200, 55)],
    resolveAnchorPoint: resolveCanvasPoint,
    viewport,
    layerWidth: 600,
    layerHeight: 400,
    cardTop: 40,
  });
  // top 的图层 y = 10，在工具栏之上
  expect(targets).toEqual([{ id: 'in', x: 200, y: 100 }]);
});

it('区域描边：拖拽中的框选优先，其次是已打开线程区域，最后是已画好的区域', () => {
  const marquee = { pin: { x: 110, y: 60 }, x1: 60, y1: 10, resizing: false };
  const active = { x: 110, y: 60, w: 10, h: 5, deg: 30 };
  const drawn = { x: 120, y: 70, w: 10, h: 5, ox: 120, oy: 70 };
  expect(commentAreaOutline({ marquee, activeThreadAreaRect: active, drawnAreaRect: drawn, viewport })).toEqual({
    x: 20,
    y: 10,
    w: 40,
    h: 10,
    ox: 20,
    oy: 20,
  });
  expect(commentAreaOutline({ marquee: { ...marquee, resizing: true }, activeThreadAreaRect: null, drawnAreaRect: null, viewport })).toMatchObject({
    ox: 60,
    oy: 10,
  });
  expect(commentAreaOutline({ marquee: null, activeThreadAreaRect: active, drawnAreaRect: drawn, viewport })).toEqual({
    x: 20,
    y: 20,
    w: 20,
    h: 10,
    deg: 30,
  });
  expect(commentAreaOutline({ marquee: null, activeThreadAreaRect: null, drawnAreaRect: drawn, viewport })).toEqual({
    x: 40,
    y: 40,
    w: 20,
    h: 10,
    ox: 40,
    oy: 40,
  });
  expect(commentAreaOutline({ marquee: null, activeThreadAreaRect: null, drawnAreaRect: null, viewport })).toBeNull();
});

it('定位目标：按锚点类型选择画板、便签或页面，并用哈希匹配', () => {
  const el = commentRevealTarget({ kind: 'el', fileHash: stableAnchorHash('a.dc.html') });
  expect(el.kind).toBe('artboard');
  expect(el.match('a.dc.html')).toBe(true);
  expect(el.match('b.dc.html')).toBe(false);
  const note = commentRevealTarget({ kind: 'notearea', idHash: stableAnchorHash('n1') });
  expect(note.kind).toBe('note');
  expect(note.match('n1')).toBe(true);
  const boards = commentRevealTarget({ kind: 'boards', boards: [{ fileHash: stableAnchorHash('b.dc.html') }] });
  expect(boards).toMatchObject({ kind: 'artboard', boards: true });
  expect(boards.match('b.dc.html')).toBe(true);
  expect(boards.match('a.dc.html')).toBe(false);
  const page = commentRevealTarget({ kind: 'canvas', pageHash: stableAnchorHash('about') });
  expect(page.kind).toBe('page');
  expect(page.match('about')).toBe(true);
});

it('定位回退：元素类锚点退回画板中心，画布与便签锚点没有回退', () => {
  const manifest = { artboards: [{ file: 'a.dc.html', x: 100, y: 200, w: 400, h: 300 }] };
  const lookup = createCommentBoardLookup({ manifest, fullscreenFile: null, fullscreenFrame: null });
  const hash = stableAnchorHash('a.dc.html');
  expect(revealFallbackPoint({ kind: 'el', fileHash: hash }, lookup)).toEqual({ x: 300, y: 350 });
  expect(revealFallbackPoint({ kind: 'boards', boards: [{ fileHash: hash }] }, lookup)).toEqual({ x: 300, y: 350 });
  expect(revealFallbackPoint({ kind: 'boards', boards: [] }, lookup)).toBeNull();
  expect(revealFallbackPoint({ kind: 'canvas', pageHash: 'x' }, lookup)).toBeNull();
  expect(revealFallbackPoint({ kind: 'note', idHash: 'x' }, lookup)).toBeNull();
});
