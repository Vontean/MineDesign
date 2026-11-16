import { expect, it, vi } from "vitest";

// 块规整依赖界面模块，这里只关心切块与原文记录
vi.mock("./markdown-blocks", () => ({ normalizeMarkdownBlock: (block: unknown) => block }));
import { MAX_PARSED_MARKDOWN_BLOCKS, parseMarkdownBlocks } from "./markdown-parser";

it("标题、段落、列表、引用、分隔线依次切块；相邻的行并成一块", () => {
  const { blocks } = parseMarkdownBlocks("# 标题\n正文一\n正文二\n\n- a\n- b\n\n> 引用\n> 续行\n\n---");
  expect(blocks).toEqual([
    { type: "h1", text: "标题" },
    { type: "p", text: "正文一 正文二" },
    { type: "ul", items: ["a", "b"] },
    { type: "quote", text: "引用 续行" },
    { type: "divider" },
  ]);
});

it("记录每块原文，以及它之前被跳过的空行", () => {
  const { sources } = parseMarkdownBlocks("# A\n\n\nbody");
  expect(sources).toEqual([
    { text: "# A", lead: "" },
    { text: "body", lead: "\n\n" },
  ]);
});

it("围栏代码块保留内部内容；没有结束行时回写补上围栏", () => {
  const closed = parseMarkdownBlocks("```ts\nlet a;\n```");
  expect(closed.blocks).toEqual([{ type: "code", text: "let a;" }]);
  expect(closed.sources[0].text).toBe("```ts\nlet a;\n```");
  const open = parseMarkdownBlocks("```\nx\n\n");
  expect(open.blocks).toEqual([{ type: "code", text: "x\n\n" }]);
  expect(open.sources[0].text).toBe("```\nx\n```");
});

it("表格识别表头分隔行，并还原转义的竖线", () => {
  const { blocks } = parseMarkdownBlocks("| 名称 | 值 |\n| --- | --- |\n| a \\| b | 1 |");
  expect(blocks).toEqual([{ type: "table", header: true, rows: [["名称", "值"], ["a | b", "1"]] }]);
});

it("图片行与有序列表", () => {
  const { blocks } = parseMarkdownBlocks("![logo](a.png)\n\n1. 一\n2) 二");
  expect(blocks).toEqual([
    { type: "img", src: "a.png", alt: "logo", size: "m" },
    { type: "ol", items: ["一", "二"] },
  ]);
});

it("超过块数上限后不再解析", () => {
  const markdown = Array.from({ length: MAX_PARSED_MARKDOWN_BLOCKS + 50 }, (_, i) => `p${i}`).join("\n\n");
  expect(parseMarkdownBlocks(markdown).blocks).toHaveLength(MAX_PARSED_MARKDOWN_BLOCKS);
});
