import { expect, it, vi } from "vitest";

// 数字格式与字符串编码属于 document.ts，这里用最简替身隔离
vi.mock("./document", () => ({
  formatPdfNumber: (n: number) => String(n),
  pdfStringOperand: (s: string) => `<${s}>`,
}));
import { buildPdfLinkAnnotations, needsInterwordSpace, normalizePdfLink } from "./link-annotations";

const link = (patch: Record<string, unknown> = {}) => ({ uri: "https://a.com/x", xPt: 10, yPt: 20, widthPt: 100, heightPt: 12, ...patch });

it('只接受 http、https、mailto 链接，去掉首尾空白', () => {
  expect(normalizePdfLink(" https://a.com/x ")).toBe("https://a.com/x");
  expect(normalizePdfLink("mailto:a@b.c")).toBe("mailto:a@b.c");
  expect(normalizePdfLink("javascript:alert(1)")).toBeUndefined();
  expect(normalizePdfLink("https://user:pw@a.com")).toBeUndefined();
  expect(normalizePdfLink("mailto:")).toBeUndefined();
  expect(normalizePdfLink(5)).toBeUndefined();
});

it('地址里有非 ASCII 字符会被浏览器编码，超长则拒绝', () => {
  expect(normalizePdfLink("https://a.com/路径")).toBe("https://a.com/%E8%B7%AF%E5%BE%84");
  expect(normalizePdfLink("https://a.com/" + "a".repeat(2100))).toBeUndefined();
});

it('相邻文字之间补词间空格；中日泰文与空白边界不补；推断时连字符后不补', () => {
  expect(needsInterwordSpace("Hello", "World", false)).toBe(true);
  expect(needsInterwordSpace("你好", "世界", false)).toBe(false);
  expect(needsInterwordSpace("Hello ", "World", false)).toBe(false);
  expect(needsInterwordSpace("well-", "known", false)).toBe(false);
  expect(needsInterwordSpace("well-", "known", true)).toBe(true);
});

it('生成链接注释：矩形裁到页面内，地址里的括号转义', () => {
  const { dicts, anchors } = buildPdfLinkAnnotations([link({ uri: "https://a.com/(x)", xPt: -5, widthPt: 1000 })], 200, 300, 100, () => {});
  expect(dicts).toHaveLength(1);
  expect(dicts[0]).toContain("/Rect [0 20 200 32]");
  expect(dicts[0]).toContain("/URI (https://a.com/\\(x\\))");
  expect(anchors).toEqual([undefined]);
});

it('过小、无效的链接被跳过；传入结构起点时写入 /StructParent 与说明文字', () => {
  const links = [link({ widthPt: 0.2 }), link({ uri: "ftp://x" }), link({ anchor: 3 }), link({ anchor: 4 })];
  const { dicts, anchors } = buildPdfLinkAnnotations(links, 200, 300, 100, () => {}, 50, (anchor) => (anchor === 3 ? "说明" : undefined));
  expect(anchors).toEqual([3, 4]);
  expect(dicts[0]).toContain("/StructParent 50 /Contents <说明>");
  expect(dicts[1]).toContain("/StructParent 51 /Contents (https://a.com/x)");
});

it('文件总链接数用尽时通知调用方并停止', () => {
  let reached = 0;
  const { dicts } = buildPdfLinkAnnotations([link(), link(), link()], 200, 300, 2, () => reached++);
  expect(dicts).toHaveLength(2);
  expect(reached).toBe(1);
});
