import { encodePdfUnicode, pdfHexCodeUnit, unicodeGlyphWidth } from "./unicode-font";
import { encodeWinAnsiText, escapePdfLiteralBytes, winAnsiGlyphWidth } from "./winansi";

/** 一段文本编码后的 PDF 操作数与宽度（em）。 */
export interface PdfTextOperand {
  operand: string;
  em: number;
}
export interface PdfUnicodeTextOperand extends PdfTextOperand {
  /** 混排的右到左文本是否按视觉顺序重排过 */
  reordered: boolean;
}
export type PdfTextEncoder = (text: string) => PdfTextOperand | undefined;

/** 阿拉伯语、希伯来语等右到左书写区。 */
export const rtlScriptPattern = /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufefc]/;
/** 右到左书写区里的字母。 */
export const rtlLetterPattern = /(?=\p{L})[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufefc]/u;
/** 任意字母；language.ts 也用它判断文字。 */
export const letterPattern = /\p{L}/u;
/** 切分文本：数字串（含前后符号）整体保留为一段，其余逐字符。 */
export const bidiRunPattern =
  /[+\-\u2212#$%\u00a2-\u00a5\u00b0\u00b1\u066a\u2030\u2031\u20a0-\u20cf]{0,4}[0-9\u0660-\u0669\u066b\u066c\u06f0-\u06f9]+(?:[+\-\u2012\u2013\u2212,.:/\u00a0\u060c\u202f][0-9\u0660-\u0669\u066b\u066c\u06f0-\u06f9]+)*[#$%\u00a2-\u00a5\u00b0\u00b1\u066a\u2030\u2031\u20a0-\u20cf]{0,4}|[^]/gu;

/** 空格在两种编码下的操作数与宽度；宽度来自其他模块，由 install 函数赋值。 */
export var spaceOperands: Record<string, PdfTextOperand>;
/** WinAnsi 文本编码器；由 install 函数赋值。 */
export var encodeWinAnsiOperand: PdfTextEncoder;

/**
 * 含右到左文字且没有其他文字（只有数字符号）时，返回按视觉顺序反转后的文本；
 * 不需要重排时返回 undefined。
 */
export function reverseMixedRtlText(text: string): string | undefined {
  if (!rtlLetterPattern.test(text)) return undefined;
  const runs = text.match(bidiRunPattern) ?? [];
  if (!runs.some((run) => letterPattern.test(run) && !rtlScriptPattern.test(run)))
    return runs.reverse().join("");
}

/** 创建 Unicode 编码器；state 是文档的 Unicode 字体状态（astral 映射与高字节集合）。 */
export function createPdfUnicodeEncoder(state: unknown): (text: string) => PdfUnicodeTextOperand | undefined {
  return (text) => {
    const reversed = reverseMixedRtlText(text);
    const units = encodePdfUnicode(reversed ?? text, state);
    if (units !== undefined)
      return {
        operand: "<" + units.map(pdfHexCodeUnit).join("") + ">",
        em: units.reduce((total: number, unit: number) => total + unicodeGlyphWidth(unit), 0) / 1e3,
        reordered: reversed !== undefined,
      };
  };
}

export function installExportPdfTextEncoding(): () => void {
  return () => {
    spaceOperands = {
      winansi: {
        operand: "( )",
        em: winAnsiGlyphWidth(32) / 1e3,
      },
      unicode: {
        operand: "<0020>",
        em: unicodeGlyphWidth(32) / 1e3,
      },
    };
    encodeWinAnsiOperand = (text) => {
      const bytes = encodeWinAnsiText(text);
      if (bytes !== undefined)
        return {
          operand: "(" + escapePdfLiteralBytes(bytes) + ")",
          em: bytes.reduce((total, byte) => total + winAnsiGlyphWidth(byte), 0) / 1e3,
        };
    };
  };
}
