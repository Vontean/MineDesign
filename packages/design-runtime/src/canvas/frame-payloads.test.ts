import { expect, it } from 'vitest';
import { parseSelectionChromePayload, selectionChromeCoordinateOverscan as overscan } from './frame-payloads';

const box = { w: 800, h: 600 };
const parse = (payload: Record<string, unknown>, options = {}) => parseSelectionChromePayload(payload, box, options);

it('画板内的框原样保留；只有第一个 grip 带控制点', () => {
  const { rings } = parse({
    rings: [
      { x: 10, y: 20, w: 100, h: 50, k: 'grip', rot: 0.5, rotatable: true, deg: 28.6 },
      { x: 200, y: 20, w: 100, h: 50, k: 'grip' },
      { x: 0, y: 0, w: 0, h: 50, k: 'sel' },
      { x: 5, y: 5, w: 10, h: 10, k: 'hov', component: true },
    ],
  });
  expect(rings).toEqual([
    { x: 10, y: 20, w: 100, h: 50, k: 'grip', rot: 0.5, rotatable: true, deg: 29 },
    { x: 200, y: 20, w: 100, h: 50, k: 'sel' },
    { x: 5, y: 5, w: 10, h: 10, k: 'hov', component: true },
  ]);
  expect(parse({ rings: [{ x: 10, y: 20, w: 100, h: 50, k: 'grip' }] }, { gripless: true }).rings[0].k).toBe('sel');
});

it('超出画板的框被裁剪到 overscan 范围内，并失去控制点与旋转', () => {
  const { rings } = parse({ rings: [{ x: 700, y: 100, w: 1000, h: 50, k: 'grip', rotatable: true }] });
  expect(rings).toEqual([{ x: 700, y: 100, w: box.w + overscan - 700, h: 50, k: 'sel' }]);
  expect(parse({ rings: [{ x: 5000, y: 0, w: 10, h: 10, k: 'sel' }] }).rings).toEqual([]);
});

it('测距最多 12 条线、4 个标注；标注只接受数字；没有线时不显示', () => {
  const line = { x1: 0, y1: 0, x2: 10, y2: 0 };
  const label = { x: 5, y: 0, text: '10', axis: 'x' };
  const { measure } = parse({
    measure: { lines: [...Array(20).fill(line), { ...line, ext: 1 }], labels: [label, { ...label, text: '1.5' }, { ...label, axis: 'y' }, label, label, label] },
  });
  expect(measure?.lines).toHaveLength(12);
  expect(measure?.labels).toEqual([label, { ...label, axis: 'y' }, label]);
  expect(parse({ measure: { lines: [{ ...line, ext: 1 }], labels: [] } }).measure).toEqual({ lines: [{ ...line, ext: 1 }], labels: [] });
  expect(parse({ measure: { lines: [], labels: [label] } }).measure).toBeNull();
});

it('参考线每个方向至多一条，且必须在画板内', () => {
  const { guides } = parse({ guides: [{ axis: 'x', pos: 100 }, { axis: 'x', pos: 200 }, { axis: 'y', pos: 601 }, { axis: 'y', pos: 300 }] });
  expect(guides).toEqual([{ axis: 'x', pos: 100 }, { axis: 'y', pos: 300 }]);
  expect(parse({}).guides).toBeNull();
});

it('钢笔路径的点换算后超出范围时整条丢弃', () => {
  const pen = { tid: 3.7, x: 10, y: 10, w: 100, h: 100, vbW: 100, vbH: 100, kx: 1, ky: 1, d: 'M 0 0 L 50 50' };
  expect(parse({ pen }).pen).toEqual({ ...pen, tid: 3 });
  expect(parse({ pen: { ...pen, d: 'M 0 0 L 5000 50' } }).pen).toBeNull();
  expect(parse({ pen }, { gripless: true }).pen).toBeNull();
  expect(parse({ pen: { ...pen, d: 'Z' } }).pen).toBeNull();
});
