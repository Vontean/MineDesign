import { expect, it } from "vitest";
import { codepointToWinAnsi, encodeWinAnsiText, escapePdfLiteralBytes, winAnsiGlyphWidth } from "./winansi";

it('ASCII 与 Latin-1 码点原样保留，0x80–0x9F 区的符号映射到 WinAnsi 字节', () => {
  expect(codepointToWinAnsi(65)).toBe(65);
  expect(codepointToWinAnsi(233)).toBe(233);
  expect(codepointToWinAnsi(8364)).toBe(128); // €
  expect(codepointToWinAnsi(8212)).toBe(151); // —
  expect(codepointToWinAnsi(20013)).toBeUndefined(); // 中
});

it('无法表示的字符换成空格，只要有一个可见字符就返回字节', () => {
  expect(encodeWinAnsiText("a中b")).toEqual([97, 32, 98]);
  expect(encodeWinAnsiText("€")).toEqual([128]);
});

it('没有任何可见字符时返回 undefined，交给 Unicode 字体处理', () => {
  expect(encodeWinAnsiText("")).toBeUndefined();
  expect(encodeWinAnsiText("中文")).toBeUndefined();
  expect(encodeWinAnsiText("  ")).toBeUndefined();
});

it('字宽：ASCII 用 Helvetica 字宽，其余按 556', () => {
  expect(winAnsiGlyphWidth(32)).toBe(278);
  expect(winAnsiGlyphWidth(87)).toBe(944); // W
  expect(winAnsiGlyphWidth(233)).toBe(556);
});

it('PDF 字面串转义：括号与反斜杠加反斜杠，不可见字节写成三位八进制', () => {
  expect(escapePdfLiteralBytes([40, 97, 41, 92])).toBe("\\(a\\)\\\\");
  expect(escapePdfLiteralBytes([10, 128, 65])).toBe("\\012\\200A");
});
