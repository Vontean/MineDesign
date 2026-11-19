/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { encodeAsciiBytes } from "./document";
import { decodeBase64Bytes } from "./jpeg";
import { helveticaCharacterWidths } from "./winansi";

var PdfUnicodeFontLimit: Dynamic;
var surrogateRangeSize: Dynamic;
var PdfUnicodeFontConstant: Dynamic;
var pdfFallbackFontBase64: Dynamic;
var pdfFallbackGlyphData: Dynamic;
var PdfUnicodeFontItems: Dynamic;
var fallbackFontWidth: Dynamic;
function unicodeGlyphWidth(codePoint?: Dynamic): Dynamic {
  return codePoint >= 32 && codePoint <= 126
    ? helveticaCharacterWidths[codePoint - 32]
    : PdfUnicodeFontItems.some(
          ([start, end]: Dynamic): Dynamic =>
            codePoint >= start && codePoint <= end,
        )
      ? 1e3
      : fallbackFontWidth;
}
function pdfHexCodeUnit(codeUnit?: Dynamic): Dynamic {
  return codeUnit.toString(16).padStart(4, "0");
}
function encodePdfUnicode(text?: Dynamic, fontMap?: Dynamic): Dynamic {
  let items: Dynamic = [],
    flag: Dynamic = false;
  for (let value of text as Dynamic) {
    let codePoint: Dynamic = value.codePointAt(0),
      encodedCodePoint: Dynamic;
    if (codePoint < 32 || (codePoint >= 127 && codePoint <= 159)) encodedCodePoint = 32;
    else if (codePoint >= 55296 && codePoint <= 57343) {
      encodedCodePoint = PdfUnicodeFontConstant;
      flag = true;
    } else if (codePoint > 65535) {
      let entry: Dynamic = fontMap.astral.get(codePoint);
      entry === undefined &&
        fontMap.astral.size < surrogateRangeSize &&
        ((entry = PdfUnicodeFontLimit + fontMap.astral.size),
        fontMap.astral.set(codePoint, entry));
      encodedCodePoint = entry ?? PdfUnicodeFontConstant;
      flag = true;
    } else {
      encodedCodePoint = codePoint;
      value.trim() !== "" && (flag = true);
    }
    items.push(encodedCodePoint);
    (encodedCodePoint < PdfUnicodeFontLimit ||
      encodedCodePoint >= PdfUnicodeFontLimit + surrogateRangeSize) &&
      fontMap.highBytes.add(encodedCodePoint >> 8);
  }
  return flag ? items : undefined;
}
function buildCmapEntries(startCode?: Dynamic, items?: Dynamic): Dynamic {
  let text: Dynamic = "";
  for (let index: Dynamic = 0; index < items.length; index += 100) {
    let value: Dynamic = items.slice(index, index + 100);
    text +=
      String(value.length) +
      " begin" +
      startCode +
      `
` +
      value.join("") +
      "end" +
      startCode +
      `
`;
  }
  return text;
}
function buildUnicodeCmap(cmap?: Dynamic): Dynamic {
  let value: Dynamic = [...cmap.highBytes]
      .sort(
        (left?: Dynamic, right?: Dynamic): Dynamic => left - right,
      )
      .map(
        (highByte?: Dynamic): Dynamic =>
          "<" +
          pdfHexCodeUnit(highByte << 8) +
          "> <" +
          pdfHexCodeUnit((highByte << 8) | 255) +
          "> <" +
          pdfHexCodeUnit(highByte << 8) +
          `>
`,
      ),
    items: Dynamic = [];
  for (let [codePoint, glyphCode] of cmap.astral as Dynamic) {
    let astralOffset: Dynamic = codePoint - 65536;
    items.push(
      "<" +
        pdfHexCodeUnit(glyphCode) +
        "> <" +
        pdfHexCodeUnit(55296 + (astralOffset >> 10)) +
        pdfHexCodeUnit(56320 + (astralOffset & 1023)) +
        `>
`,
    );
  }
  return (
    `/CIDInit /ProcSet findresource begin
12 dict begin
begincmap
/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def
/CMapName /Adobe-Identity-UCS def
/CMapType 2 def
1 begincodespacerange
<0000> <ffff>
endcodespacerange
` +
    buildCmapEntries("bfrange", value) +
    buildCmapEntries("bfchar", items) +
    `endcmap
CMapName currentdict /CMap defineresource pop
end
end
`
  );
}
function buildPdfFontObjects(fontIndex?: Dynamic, fontData?: Dynamic): Dynamic {
  let callback: Dynamic = (objectOffset?: Dynamic): Dynamic =>
      String(fontIndex + objectOffset) + " 0 R",
    makeStreamObject: Dynamic = (dictionary?: Dynamic, items?: Dynamic): Dynamic => [
      encodeAsciiBytes(
        dictionary +
          " /Length " +
          String(items.length) +
          ` >>
stream
`,
      ),
      items,
      encodeAsciiBytes(`
endstream`),
    ],
    value: Dynamic = decodeBase64Bytes(pdfFallbackFontBase64),
    fontObjects: Dynamic =
      "/DW " +
      String(fallbackFontWidth) +
      " /W [32 [" +
      helveticaCharacterWidths.join(" ") +
      "] " +
      PdfUnicodeFontItems.map(
        ([glyphCode, width]: Dynamic): Dynamic =>
          String(glyphCode) + " " + String(width) + " 1000",
      ).join(" ") +
      "]";
  return [
    [
      encodeAsciiBytes(
        "<< /Type /Font /Subtype /Type0 /BaseFont /Glyphless /Encoding /Identity-H /DescendantFonts [" +
          callback(1) +
          "] /ToUnicode " +
          callback(5) +
          " >>",
      ),
    ],
    [
      encodeAsciiBytes(
        "<< /Type /Font /Subtype /CIDFontType2 /BaseFont /Glyphless /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor " +
          callback(2) +
          " " +
          fontObjects +
          " /CIDToGIDMap " +
          callback(4) +
          " >>",
      ),
    ],
    [
      encodeAsciiBytes(
        "<< /Type /FontDescriptor /FontName /Glyphless /Flags 4 /FontBBox [0 -207 500 718] /ItalicAngle 0 /Ascent 718 /Descent -207 /CapHeight 718 /StemV 80 /FontFile2 " +
          callback(3) +
          " >>",
      ),
    ],
    makeStreamObject("<< /Length1 " + String(value.length), value),
    makeStreamObject(
      "<< /Filter /FlateDecode",
      decodeBase64Bytes(pdfFallbackGlyphData),
    ),
    makeStreamObject("<<", encodeAsciiBytes(buildUnicodeCmap(fontData))),
  ];
}
export {
  buildCmapEntries,
  buildPdfFontObjects,
  buildUnicodeCmap,
  encodePdfUnicode,
  pdfFallbackFontBase64,
  pdfFallbackGlyphData,
  pdfHexCodeUnit,
  PdfUnicodeFontConstant,
  fallbackFontWidth as PdfUnicodeFontConstant_2,
  PdfUnicodeFontItems,
  PdfUnicodeFontLimit,
  surrogateRangeSize as PdfUnicodeFontLimit_2,
  unicodeGlyphWidth,
};
export function installExportPdfUnicodeFont(): () => void {
  return () => {
    PdfUnicodeFontLimit = 55296;
    surrogateRangeSize = 2048;
    PdfUnicodeFontConstant = 65533;
    pdfFallbackFontBase64 =
      "AAEAAAAKAIAAAwAgT1MvMkSQQzcAAAEoAAAAYGNtYXAADABGAAABkAAAACxnbHlmVRS2+AAAAcQAAAAaaGVhZGELQt8AAACsAAAANmhoZWEExAEoAAAA5AAAACRobXR4AfQAAAAAAYgAAAAIbG9jYQANAAAAAAG8AAAABm1heHAABAAGAAABCAAAACBuYW1lA4cLdQAAAeAAAAA+cG9zdAADAAAAAAIgAAAAIAABAAAAAQAAm3oJWV8PPPUAAwPoAAAAAAAAAAAAAAAAAAAAAAAA/zEB9ALOAAAAAwACAAAAAAAAAAEAAALO/zEAAAH0AAAAAAH0AAEAAAAAAAAAAAAAAAAAAAACAAEAAAACAAQAAQAAAAAAAgAAAAAAAAAAAAAAAAAAAAAAAwH0AZAABQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPz8/PwAAAAAAAALO/zEAAALOAM8AAAAAAAAAAAAAAAAAAAAgAAAAAAAAAfQAAAAAAAIAAAADAAAAFAADAAEAAAAUAAQAGAAAAAIAAgAAAAD//wAA//8AAQAAAAAAAAANAAAAAQAA/zEB9ALOAAMAABURIREB9M8DnfxjAAAAAAAAAgAeAAMAAQQJAAEAEgAAAAMAAQQJAAIADgASAEcAbAB5AHAAaABsAGUAcwBzAFIAZQBnAHUAbABhAHIAAAADAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    pdfFallbackGlyphData =
      "eNrtwgEJAAAAAqD6fzpoh2gaAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgBsA/wAQ";
    PdfUnicodeFontItems = [
      [11904, 40959],
      [44032, 55203],
      [55296, 57343],
      [63744, 64255],
      [65281, 65376],
    ];
    fallbackFontWidth = 556;
  };
}
