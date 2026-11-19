/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var TypographyFontFamilySerifSansSerifPattern: Dynamic;
var TypographyFontFamilyEmojiSymbolPattern: Dynamic;
function firstFontFamily(fontStack?: Dynamic): Dynamic {
  return fontStack
    .split(",")[0]
    .trim()
    .replace(/^['"]|['"]$/g, "");
}
function displayFontFamily(fontStack?: Dynamic): Dynamic {
  let value: Dynamic = fontStack
    .split(",")
    .map(
      (fontName?: Dynamic): Dynamic =>
        fontName.trim().replace(/^["']|["']$/g, ""),
    )
    .filter(Boolean);
  return (
    value.find(
      (fontName?: Dynamic): Dynamic =>
        !TypographyFontFamilySerifSansSerifPattern.test(fontName) &&
        !TypographyFontFamilyEmojiSymbolPattern.test(fontName),
    ) ??
    value[0] ??
    ""
  );
}
export {
  displayFontFamily,
  firstFontFamily,
  TypographyFontFamilyEmojiSymbolPattern,
  TypographyFontFamilySerifSansSerifPattern,
};
export function installEditorTypographyFontFamily(): () => void {
  return () => {
    TypographyFontFamilySerifSansSerifPattern =
      /^(serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-serif|ui-sans-serif|ui-monospace|ui-rounded|emoji|math|fangsong|-apple-system|BlinkMacSystemFont)$/i;
    TypographyFontFamilyEmojiSymbolPattern = /emoji|symbol/i;
  };
}
