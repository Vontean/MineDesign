/** Unicode 码点到 WinAnsi（Windows-1252）0x80–0x9F 区的映射；其余可用码点见 codepointToWinAnsi。 */
export const winAnsiCodepointMap: Readonly<Record<number, number>> = {
  8364: 128,
  8218: 130,
  402: 131,
  8222: 132,
  8230: 133,
  8224: 134,
  8225: 135,
  710: 136,
  8240: 137,
  352: 138,
  8249: 139,
  338: 140,
  381: 142,
  8216: 145,
  8217: 146,
  8220: 147,
  8221: 148,
  8226: 149,
  8211: 150,
  8212: 151,
  732: 152,
  8482: 153,
  353: 154,
  8250: 155,
  339: 156,
  382: 158,
  376: 159,
};

/** Helvetica 在 ASCII 32–126 的字宽（千分之一 em）。 */
export const helveticaCharacterWidths: readonly number[] = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278,
  278, 556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584,
  584, 556, 1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667,
  556, 833, 722, 778, 667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611,
  278, 278, 278, 469, 556, 333, 556, 556, 500, 556, 556, 278, 556, 556, 222,
  222, 500, 222, 833, 556, 556, 556, 556, 333, 500, 278, 556, 500, 722, 500,
  500, 500, 334, 260, 334, 584,
];

/** 码点对应的 WinAnsi 字节；无法表示时返回 undefined。 */
export function codepointToWinAnsi(codepoint: number): number | undefined {
  return (codepoint >= 32 && codepoint <= 126) || (codepoint >= 160 && codepoint <= 255)
    ? codepoint
    : winAnsiCodepointMap[codepoint];
}

/** WinAnsi 字节的字宽；ASCII 之外统一按 556。 */
export function winAnsiGlyphWidth(byte: number): number {
  return byte >= 32 && byte <= 126 ? helveticaCharacterWidths[byte - 32]! : 556;
}

/** 把文本编码成 WinAnsi 字节；无法表示的字符换成空格，全是空格或空串时返回 undefined。 */
export function encodeWinAnsiText(text: string): number[] | undefined {
  const bytes: number[] = [];
  let hasVisible = false;
  for (const char of text) {
    const byte = codepointToWinAnsi(char.codePointAt(0)!);
    if (byte === undefined) {
      bytes.push(32);
    } else {
      bytes.push(byte);
      if (byte !== 32) hasVisible = true;
    }
  }
  return hasVisible ? bytes : undefined;
}

/** 生成 PDF 字面串的内容：转义反斜杠与括号，非可见 ASCII 写成三位八进制。 */
export function escapePdfLiteralBytes(bytes: Iterable<number>): string {
  let text = "";
  for (const byte of bytes)
    if (byte === 92) text += "\\\\";
    else if (byte === 40) text += "\\(";
    else if (byte === 41) text += "\\)";
    else if (byte >= 32 && byte <= 126) text += String.fromCharCode(byte);
    else text += "\\" + byte.toString(8).padStart(3, "0");
  return text;
}
