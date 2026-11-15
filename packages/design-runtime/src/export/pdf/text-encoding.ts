/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { encodePdfUnicode, pdfHexCodeUnit, unicodeGlyphWidth } from "./unicode-font";
import { encodeWinAnsiText, escapePdfLiteralBytes, winAnsiGlyphWidth } from "./winansi";

var PdfTextEncodingUfdffUfefcPattern: Dynamic;
var PdfTextEncodingUfdffUfefcPattern_2: Dynamic;
var PdfTextEncodingPattern: Dynamic;
var PdfTextEncodingPattern_2: Dynamic;
var PdfTextEncodingWinansiUnicodeConfig: Dynamic;
var PdfTextEncodingReduce: Dynamic;
function reverseMixedRtlText(input?: Dynamic): Dynamic {
  if (!PdfTextEncodingUfdffUfefcPattern_2.test(input)) return;
  let value: Dynamic = input.match(PdfTextEncodingPattern_2) ?? [];
  if (
    !value.some(
      (input2?: Dynamic): Dynamic =>
        PdfTextEncodingPattern.test(input2) &&
        !PdfTextEncodingUfdffUfefcPattern.test(input2),
    )
  )
    return value.reverse().join("");
}
function createPdfUnicodeEncoder(input?: Dynamic): Dynamic {
  return (input2?: Dynamic): Dynamic => {
    let value: Dynamic = reverseMixedRtlText(input2),
      value2: Dynamic = (0, encodePdfUnicode)(value ?? input2, input);
    if (value2 !== undefined)
      return {
        operand: "<" + value2.map(pdfHexCodeUnit).join("") + ">",
        em:
          value2.reduce(
            (input3?: Dynamic, options?: Dynamic): Dynamic =>
              input3 + (0, unicodeGlyphWidth)(options),
            0,
          ) / 1e3,
        reordered: value !== undefined,
      };
  };
}
export {
  createPdfUnicodeEncoder,
  PdfTextEncodingPattern,
  PdfTextEncodingPattern_2,
  PdfTextEncodingReduce,
  PdfTextEncodingUfdffUfefcPattern,
  PdfTextEncodingUfdffUfefcPattern_2,
  PdfTextEncodingWinansiUnicodeConfig,
  reverseMixedRtlText,
};
export function installExportPdfTextEncoding(): () => void {
  return () => {
    PdfTextEncodingUfdffUfefcPattern =
      /[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufefc]/;
    PdfTextEncodingUfdffUfefcPattern_2 =
      /(?=\p{L})[\u0590-\u08ff\ufb1d-\ufdff\ufe70-\ufefc]/u;
    PdfTextEncodingPattern = /\p{L}/u;
    PdfTextEncodingPattern_2 =
      /[+\-\u2212#$%\u00a2-\u00a5\u00b0\u00b1\u066a\u2030\u2031\u20a0-\u20cf]{0,4}[0-9\u0660-\u0669\u066b\u066c\u06f0-\u06f9]+(?:[+\-\u2012\u2013\u2212,.:/\u00a0\u060c\u202f][0-9\u0660-\u0669\u066b\u066c\u06f0-\u06f9]+)*[#$%\u00a2-\u00a5\u00b0\u00b1\u066a\u2030\u2031\u20a0-\u20cf]{0,4}|[^]/gu;
    PdfTextEncodingWinansiUnicodeConfig = {
      winansi: {
        operand: "( )",
        em: (0, winAnsiGlyphWidth)(32) / 1e3,
      },
      unicode: {
        operand: "<0020>",
        em: (0, unicodeGlyphWidth)(32) / 1e3,
      },
    };
    PdfTextEncodingReduce = (input?: Dynamic): Dynamic => {
      let value: Dynamic = (0, encodeWinAnsiText)(input);
      if (value !== undefined)
        return {
          operand: "(" + (0, escapePdfLiteralBytes)(value) + ")",
          em:
            value.reduce(
              (input2?: Dynamic, options?: Dynamic): Dynamic =>
                input2 + (0, winAnsiGlyphWidth)(options),
              0,
            ) / 1e3,
        };
    };
  };
}
