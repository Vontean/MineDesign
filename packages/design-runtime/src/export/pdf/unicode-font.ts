/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { encodeAsciiBytes } from "./document";
import { decodeBase64Bytes } from "./jpeg";
import { helveticaCharacterWidths } from "./winansi";

var PdfUnicodeFontLimit: Dynamic;
var PdfUnicodeFontLimit_2: Dynamic;
var PdfUnicodeFontConstant: Dynamic;
var pdfFallbackFontBase64: Dynamic;
var pdfFallbackGlyphData: Dynamic;
var PdfUnicodeFontItems: Dynamic;
var PdfUnicodeFontConstant_2: Dynamic;
function unicodeGlyphWidth(input?: Dynamic): Dynamic {
  return input >= 32 && input <= 126
    ? helveticaCharacterWidths[input - 32]
    : PdfUnicodeFontItems.some(
          ([input2, input3]: Dynamic): Dynamic =>
            input >= input2 && input <= input3,
        )
      ? 1e3
      : PdfUnicodeFontConstant_2;
}
function pdfHexCodeUnit(input?: Dynamic): Dynamic {
  return input.toString(16).padStart(4, "0");
}
function encodePdfUnicode(input?: Dynamic, options?: Dynamic): Dynamic {
  let items: Dynamic = [],
    flag: Dynamic = false;
  for (let value of input as Dynamic) {
    let value2: Dynamic = value.codePointAt(0),
      value3: Dynamic;
    if (value2 < 32 || (value2 >= 127 && value2 <= 159)) value3 = 32;
    else if (value2 >= 55296 && value2 <= 57343) {
      value3 = PdfUnicodeFontConstant;
      flag = true;
    } else if (value2 > 65535) {
      let entry: Dynamic = options.astral.get(value2);
      entry === undefined &&
        options.astral.size < PdfUnicodeFontLimit_2 &&
        ((entry = PdfUnicodeFontLimit + options.astral.size),
        options.astral.set(value2, entry));
      value3 = entry ?? PdfUnicodeFontConstant;
      flag = true;
    } else {
      value3 = value2;
      value.trim() !== "" && (flag = true);
    }
    items.push(value3);
    (value3 < PdfUnicodeFontLimit ||
      value3 >= PdfUnicodeFontLimit + PdfUnicodeFontLimit_2) &&
      options.highBytes.add(value3 >> 8);
  }
  return flag ? items : undefined;
}
function buildCmapEntries(input?: Dynamic, items?: Dynamic): Dynamic {
  let text: Dynamic = "";
  for (let index: Dynamic = 0; index < items.length; index += 100) {
    let value: Dynamic = items.slice(index, index + 100);
    text +=
      String(value.length) +
      " begin" +
      input +
      `
` +
      value.join("") +
      "end" +
      input +
      `
`;
  }
  return text;
}
function buildUnicodeCmap(input?: Dynamic): Dynamic {
  let value: Dynamic = [...input.highBytes]
      .sort(
        (input2?: Dynamic, options?: Dynamic): Dynamic => input2 - options,
      )
      .map(
        (input2?: Dynamic): Dynamic =>
          "<" +
          pdfHexCodeUnit(input2 << 8) +
          "> <" +
          pdfHexCodeUnit((input2 << 8) | 255) +
          "> <" +
          pdfHexCodeUnit(input2 << 8) +
          `>
`,
      ),
    items: Dynamic = [];
  for (let [value2, value3] of input.astral as Dynamic) {
    let value4: Dynamic = value2 - 65536;
    items.push(
      "<" +
        pdfHexCodeUnit(value3) +
        "> <" +
        pdfHexCodeUnit(55296 + (value4 >> 10)) +
        pdfHexCodeUnit(56320 + (value4 & 1023)) +
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
function buildPdfFontObjects(input?: Dynamic, options?: Dynamic): Dynamic {
  let callback: Dynamic = (input2?: Dynamic): Dynamic =>
      String(input + input2) + " 0 R",
    callback2: Dynamic = (input2?: Dynamic, items?: Dynamic): Dynamic => [
      encodeAsciiBytes(
        input2 +
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
    value2: Dynamic =
      "/DW " +
      String(PdfUnicodeFontConstant_2) +
      " /W [32 [" +
      helveticaCharacterWidths.join(" ") +
      "] " +
      PdfUnicodeFontItems.map(
        ([input2, input3]: Dynamic): Dynamic =>
          String(input2) + " " + String(input3) + " 1000",
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
          value2 +
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
    callback2("<< /Length1 " + String(value.length), value),
    callback2(
      "<< /Filter /FlateDecode",
      decodeBase64Bytes(pdfFallbackGlyphData),
    ),
    callback2("<<", encodeAsciiBytes(buildUnicodeCmap(options))),
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
  PdfUnicodeFontConstant_2,
  PdfUnicodeFontItems,
  PdfUnicodeFontLimit,
  PdfUnicodeFontLimit_2,
  unicodeGlyphWidth,
};
export function installExportPdfUnicodeFont(): () => void {
  return () => {
    PdfUnicodeFontLimit = 55296;
    PdfUnicodeFontLimit_2 = 2048;
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
    PdfUnicodeFontConstant_2 = 556;
  };
}
