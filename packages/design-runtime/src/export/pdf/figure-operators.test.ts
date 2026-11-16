import { expect, it, vi } from "vitest";

vi.mock("./document", () => ({ formatPdfNumber: (n: number) => String(n) }));
import { buildPdfFigureOperators, clipPdfBlockBox, mapPdfFigureLinks } from "./figure-operators";

const block = (xPt: number, yPt: number, widthPt: number, heightPt: number, extra: Record<string, unknown> = {}) =>
  ({ role: "Figure", box: { xPt, yPt, widthPt, heightPt }, ...extra });

it('块的位置裁到页面内；裁后太小则返回 undefined', () => {
  expect(clipPdfBlockBox(block(-10, 5, 100, 50), 80, 40)).toEqual({ x0: 0, y0: 5, x1: 80, y1: 40 });
  expect(clipPdfBlockBox(block(100, 0, 10, 10), 80, 40)).toBeUndefined();
  expect(clipPdfBlockBox(block(0, 0, 0.4, 10), 80, 40)).toBeUndefined();
});

it('为每个图片块写带 MCID 的空裁剪内容，MCID 从起点依次递增', () => {
  const { ops, marks } = buildPdfFigureOperators([block(0, 0, 10, 10), { ...block(0, 0, 10, 10), role: "P" }, block(5, 5, 20, 10)], 100, 100, 7, true);
  expect(marks.map((m) => [m.mcid, m.block])).toEqual([[7, 0], [8, 2]]);
  expect(ops).toBe("/Figure << /MCID 7 >> BDC\n0 0 10 10 re n\nEMC\n/Figure << /MCID 8 >> BDC\n5 5 20 10 re n\nEMC\n");
});

it('未开启标签时不输出任何内容', () => {
  expect(buildPdfFigureOperators([block(0, 0, 10, 10)], 100, 100, 0, false)).toEqual({ ops: "", marks: [] });
});

it('链接图片：已被文字标记占用或重复的链接不再登记', () => {
  const blocks = [block(0, 0, 10, 10, { link: "a" }), block(0, 0, 10, 10, { link: "a" }), block(0, 0, 10, 10, { link: "b" }), block(0, 0, 10, 10)];
  expect([...mapPdfFigureLinks(blocks, [{ link: "b" }], 100, 100)]).toEqual([["a", 0]]);
});
