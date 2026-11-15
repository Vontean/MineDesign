/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var TypographyFontFamilySerifSansSerifPattern: Dynamic;
var TypographyFontFamilyEmojiSymbolPattern: Dynamic;
function firstFontFamily(input?: Dynamic): Dynamic {
  return input
    .split(",")[0]
    .trim()
    .replace(/^['"]|['"]$/g, "");
}
function displayFontFamily(input?: Dynamic): Dynamic {
  let value: Dynamic = input
    .split(",")
    .map(
      (input2?: Dynamic): Dynamic =>
        input2.trim().replace(/^["']|["']$/g, ""),
    )
    .filter(Boolean);
  return (
    value.find(
      (input2?: Dynamic): Dynamic =>
        !TypographyFontFamilySerifSansSerifPattern.test(input2) &&
        !TypographyFontFamilyEmojiSymbolPattern.test(input2),
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
