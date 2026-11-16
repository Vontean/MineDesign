import { beforeAll, expect, it } from "vitest";
import {
  createPdfUnicodeEncoder,
  encodeWinAnsiOperand,
  installExportPdfTextEncoding,
  reverseMixedRtlText,
  spaceOperands,
} from "./text-encoding";
import { installExportPdfUnicodeFont } from "./unicode-font";

// 字宽表与空格操作数由各自的初始化函数提供
beforeAll(() => {
  installExportPdfUnicodeFont()();
  installExportPdfTextEncoding()();
});

it('WinAnsi 编码器输出带括号的字面串和以 em 计的宽度', () => {
  const run = encodeWinAnsiOperand("A(b)");
  expect(run?.operand).toBe("(A\\(b\\))");
  expect(run?.em).toBeCloseTo((667 + 333 + 556 + 333) / 1e3, 6);
  // 只有空白或无法表示的字符时交给 Unicode 编码
  expect(encodeWinAnsiOperand("中")).toBeUndefined();
});

it('Unicode 编码器输出四位十六进制字码，并登记高字节', () => {
  const state = { astral: new Map(), highBytes: new Set<number>() };
  const run = createPdfUnicodeEncoder(state)("A中");
  expect(run).toMatchObject({ operand: "<00414e2d>", reordered: false });
  expect(run?.em).toBeCloseTo((667 + 1000) / 1e3, 6);
  expect([...state.highBytes]).toContain(0x4e);
});

it('右到左文字与数字混排且没有其他文字时按视觉顺序重排', () => {
  expect(reverseMixedRtlText("مرحبا 123")).toBe("123 ابحرم");
  expect(reverseMixedRtlText("hello")).toBeUndefined();
  // 夹有拉丁字母时不重排
  expect(reverseMixedRtlText("مرحبا abc")).toBeUndefined();
});

it('空格的操作数与宽度', () => {
  expect(spaceOperands.winansi).toEqual({ operand: "( )", em: 0.278 });
  expect(spaceOperands.unicode).toEqual({ operand: "<0020>", em: 0.278 });
});
