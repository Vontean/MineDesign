import { expect, it, vi } from "vitest";

// 标题规整与字符串编码属于 document.ts，这里用最简替身隔离
vi.mock("./document", () => ({
  normalizePdfTitle: (text: string, max: number) => text.replace(/\s+/g, " ").trim().slice(0, max),
  pdfStringOperand: (text: string) => `(${text})`,
}));
vi.mock("./text-operators", () => ({
  textRunsNeedSpace: (_prev: unknown, run: { spaceBefore?: boolean }) => run.spaceBefore === true,
}));
import { buildPdfOutline } from "./outline";

const item = (block: number, text: string, spaceBefore?: boolean) => ({ block, run: { text, spaceBefore } });
const pageObjectOf = (page: number) => 100 + page;

it('每页取第一个非空标题块，生成根对象和书签项', () => {
  const outline = buildPdfOutline(
    10,
    [[item(0, "正文"), item(1, "第一章")], [item(0, "第二章")]],
    [["P", "H1"], ["H2"]],
    pageObjectOf,
  );
  expect(outline?.rootObj).toBe(10);
  expect(outline?.nextObj).toBe(13);
  expect(outline?.bodies[0]).toBe("<< /Type /Outlines /First 11 0 R /Last 12 0 R /Count 2 >>");
  expect(outline?.bodies[1]).toBe("<< /Title (第一章) /Parent 10 0 R /Next 12 0 R /Dest [100 0 R /XYZ null null null] >>");
  expect(outline?.bodies[2]).toBe("<< /Title (第二章) /Parent 10 0 R /Prev 11 0 R /Dest [101 0 R /XYZ null null null] >>");
});

it('同一块里的多段文字按需要补空格', () => {
  const outline = buildPdfOutline(1, [[item(0, "Hello"), item(0, "World", true)]], [["H1"]], pageObjectOf);
  expect(outline?.bodies[1]).toContain("(Hello World)");
});

it('没有标题块或标题为空时返回 undefined', () => {
  expect(buildPdfOutline(1, [[item(0, "x")]], [["P"]], pageObjectOf)).toBeUndefined();
  expect(buildPdfOutline(1, [[item(0, "  ")]], [["H1"]], pageObjectOf)).toBeUndefined();
  expect(buildPdfOutline(1, [], [], pageObjectOf)).toBeUndefined();
});
