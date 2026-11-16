import { expect, it } from "vitest";
import { autoformatMarkdownBlock, executeMarkdownBlockFormat, noteAutoformatShortcut } from "./markdown-autoformat";

it("行首快捷键对应各自的块，不换行空格按空格处理", () => {
  expect(noteAutoformatShortcut("# ")).toBe("h1");
  expect(noteAutoformatShortcut("### ")).toBe("h3");
  expect(noteAutoformatShortcut("> ")).toBe("quote");
  expect(noteAutoformatShortcut("hello")).toBeNull();
});

it("扩展快捷键接受缩进、项目符号与最多三位的序号", () => {
  expect(noteAutoformatShortcut("  • ", true)).toBe("ul");
  expect(noteAutoformatShortcut("12. ", true)).toBe("ol");
  expect(noteAutoformatShortcut("1234. ", true)).toBeNull();
  expect(noteAutoformatShortcut("12. ", false)).toBeNull();
});

it("按块类型调用对应的编辑命令", () => {
  const calls: unknown[][] = [];
  const document = { execCommand: (...args: unknown[]) => calls.push(args) } as unknown as Document;
  executeMarkdownBlockFormat(document, "quote");
  expect(calls).toEqual([["styleWithCSS", false, "false"], ["formatBlock", false, "BLOCKQUOTE"]]);
  calls.length = 0;
  executeMarkdownBlockFormat(document, "h2");
  expect(calls[1]).toEqual(["formatBlock", false, "H2"]);
});

it("不是空格输入时不转换", () => {
  const root = { ownerDocument: {} } as unknown as HTMLElement;
  expect(autoformatMarkdownBlock(root, { inputType: "insertText", data: "a" }, () => "")).toBe(false);
});
