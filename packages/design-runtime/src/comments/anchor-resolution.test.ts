import { beforeAll, expect, it } from 'vitest';
import { installPlatformFileContent } from '../platform/file-content';
import { stableAnchorHash } from './anchor-codec';
import {
  commentRectsEqual,
  commentScopeKey,
  createCommentAnchorResolver,
  createCommentBoardLookup,
  type CommentAnchorResolverContext,
} from './anchor-resolution';

beforeAll(() => {
  installPlatformFileContent()();
});

const manifest = {
  pages: [{ id: 'home' }, { id: 'about' }],
  artboards: [
    { file: 'a.dc.html', x: 100, y: 200, w: 400, h: 300 },
    { file: 'b.dc.html', x: 600, y: 200, w: 200, h: 300 },
  ],
  annotations: [{ id: 'n1' }],
};

const makeContext = (patch: Partial<CommentAnchorResolverContext & { fullscreenFile: string | null }> = {}) => {
  const fullscreenFile = patch.fullscreenFile ?? null;
  const lookup = createCommentBoardLookup({ manifest, fullscreenFile, fullscreenFrame: null });
  return {
    manifest,
    pageKey: '',
    fullscreenFile,
    lookup,
    annBox: () => ({ x: 0, y: 0, w: 10, h: 10 }),
    elementRects: new Map(),
    pageRects: new Map(),
    ...patch,
  } as CommentAnchorResolverContext;
};

const hashA = stableAnchorHash('a.dc.html');
const hashB = stableAnchorHash('b.dc.html');

it('测量键与矩形比较', () => {
  expect(commentScopeKey('p', 3, 'fp')).toBe('3fp\np');
  expect(commentScopeKey('p', 3)).toBe('3\np');
  const rect = { x: 1, y: 2, w: 3, h: 4 };
  expect(commentRectsEqual(rect, { ...rect })).toBe(true);
  expect(commentRectsEqual(rect, { ...rect, w: 5 })).toBe(false);
  expect(commentRectsEqual(null, null)).toBe(true);
  expect(commentRectsEqual(rect, null)).toBe(false);
});

it('查找画板与全屏外框：全屏时只有全屏画板可见，并使用全屏外框', () => {
  const frame = { x: 0, y: 0, w: 1000, h: 800 };
  const lookup = createCommentBoardLookup({ manifest, fullscreenFile: 'a.dc.html', fullscreenFrame: frame });
  expect(lookup.findFileByHash(hashB)).toBe('b.dc.html');
  expect(lookup.findNoteByHash(stableAnchorHash('n1'))).toBe(manifest.annotations[0]);
  expect(lookup.isFileVisible('a.dc.html')).toBe(true);
  expect(lookup.isFileVisible('b.dc.html')).toBe(false);
  expect(lookup.getArtboardFrame(manifest.artboards[0])).toBe(frame);
  expect(lookup.getArtboardFrame(manifest.artboards[1])).toEqual({ x: 600, y: 200, w: 200, h: 300 });
});

it('画板锚点按比例落在画板外框内', () => {
  const resolver = createCommentAnchorResolver(makeContext());
  expect(resolver.resolveAnchorPoint({ kind: 'artboard', fileHash: hashA, fx: 0.5, fy: 0.5 })).toEqual({
    x: 300,
    y: 350,
  });
  expect(resolver.resolveAnchorPoint({ kind: 'artboard', fileHash: 'missing', fx: 0, fy: 0 })).toBeNull();
});

it('全屏时其他画板与画布锚点不可见', () => {
  const resolver = createCommentAnchorResolver(makeContext({ fullscreenFile: 'a.dc.html' }));
  expect(resolver.resolveAnchorPoint({ kind: 'artboard', fileHash: hashB, fx: 0, fy: 0 })).toBeNull();
  expect(resolver.resolveAnchorPoint({ kind: 'canvas', pageHash: stableAnchorHash('home'), x: 1, y: 2 })).toBeNull();
});

it('画布锚点只在所属页面显示；首页的锚点哈希按空页面标识保存', () => {
  const onHome = createCommentAnchorResolver(makeContext({ pageKey: '' }));
  expect(onHome.resolveAnchorPoint({ kind: 'canvas', pageHash: stableAnchorHash(''), x: 5, y: 6 })).toEqual({
    x: 5,
    y: 6,
  });
  const onAbout = createCommentAnchorResolver(makeContext({ pageKey: 'about' }));
  expect(onAbout.resolveAnchorPoint({ kind: 'canvas', pageHash: stableAnchorHash(''), x: 5, y: 6 })).toBeNull();
  expect(onAbout.resolveAnchorPoint({ kind: 'canvas', pageHash: stableAnchorHash('about'), x: 5, y: 6 })).toEqual({
    x: 5,
    y: 6,
  });
});

it('元素锚点：未测得时退回画板中心，已测得按比例，元素消失为 null，越出画板为 null', () => {
  const anchor = { kind: 'el', fileHash: hashA, path: 'p', tid: 1, fp: 'f', fx: 0.5, fy: 0.5 };
  const key = commentScopeKey('p', 1, 'f');
  expect(createCommentAnchorResolver(makeContext()).resolveAnchorPoint(anchor)).toEqual({ x: 300, y: 350 });
  const measured = (rect: unknown) =>
    createCommentAnchorResolver(makeContext({ elementRects: new Map([['a.dc.html', new Map([[key, rect]])]]) as never }));
  expect(measured({ x: 10, y: 20, w: 100, h: 40 }).resolveAnchorPoint(anchor)).toEqual({ x: 160, y: 240 });
  expect(measured(null).resolveAnchorPoint(anchor)).toBeNull();
  expect(measured({ x: 390, y: 0, w: 100, h: 40 }).resolveAnchorPoint(anchor)).toBeNull();
});

it('像素锚点：按页面矩形偏移并收进页面内，页面未测得时直接用像素', () => {
  const anchor = { kind: 'artboard', fileHash: hashA, px: 50, py: 60 };
  expect(createCommentAnchorResolver(makeContext()).resolveAnchorPoint(anchor)).toEqual({ x: 150, y: 260 });
  const withPage = createCommentAnchorResolver(
    makeContext({ pageRects: new Map([['a.dc.html', { x: 10, y: 0, w: 60, h: 300 }]]) }),
  );
  // px 50 超过页面可用宽度 60 - 12 = 48，收到 48，再加页面偏移 10
  expect(withPage.resolveAnchorPoint(anchor)).toEqual({ x: 100 + 58, y: 200 + 60 });
  const fullscreen = createCommentAnchorResolver(makeContext({ fullscreenFile: 'a.dc.html' }));
  expect(fullscreen.resolveAnchorPoint(anchor)).toEqual({ x: 300, y: 350 });
});

it('区域锚点：整画板区域按比例换算，元素区域的未测得与失效要区分开', () => {
  const box = { x0: 0.25, y0: 0.5, x1: 0.75, y1: 0.75, corner: 0 };
  const wholeBoard = { kind: 'area', fileHash: hashA, path: null, box };
  const resolver = createCommentAnchorResolver(makeContext());
  expect(resolver.resolveAreaRect(wholeBoard)).toEqual({ x: 200, y: 350, w: 200, h: 75 });

  const elementArea = { kind: 'area', fileHash: hashA, path: 'p', tid: 1, fp: 'f', box };
  expect(resolver.resolveAreaRect(elementArea)).toBeUndefined();
  // 未测得：锚点点位退回画板中心；失效：null
  expect(resolver.resolveAnchorPoint(elementArea)).toEqual({ x: 300, y: 350 });
  const gone = createCommentAnchorResolver(
    makeContext({ elementRects: new Map([['a.dc.html', new Map([[commentScopeKey('p', 1, 'f'), null]])]]) as never }),
  );
  expect(gone.resolveAreaRect(elementArea)).toBeNull();
  expect(gone.resolveAnchorPoint(elementArea)).toBeNull();
});

it('多画板区域取画板并集；全屏时不显示', () => {
  const source = {
    kind: 'boards',
    boards: [{ fileHash: hashA }, { fileHash: hashB }],
    box: { x0: 0, y0: 0, x1: 1, y1: 1, corner: 0 },
  };
  expect(createCommentAnchorResolver(makeContext()).resolveAreaRect(source)).toEqual({ x: 100, y: 200, w: 700, h: 300 });
  expect(createCommentAnchorResolver(makeContext({ fullscreenFile: 'a.dc.html' })).resolveAreaRect(source)).toBeNull();
});

it('画板内矩形裁到画板范围后换成画布坐标，完全在外为 null', () => {
  const { artboardRectToCanvas } = createCommentAnchorResolver(makeContext());
  expect(artboardRectToCanvas('a.dc.html', { x: -10, y: 10, w: 50, h: 20 })).toEqual({ x: 100, y: 210, w: 40, h: 20 });
  expect(artboardRectToCanvas('a.dc.html', { x: 500, y: 10, w: 50, h: 20 })).toBeNull();
  expect(artboardRectToCanvas('missing', { x: 0, y: 0, w: 1, h: 1 })).toBeNull();
});
