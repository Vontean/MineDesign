import type * as React from "react";
import type * as Token from "../contracts/token-editors";

export let clampTypographyNumber: (
  value: number,
  minimum: number,
  maximum: number,
) => number;

export function parseTypographyLength(fontValue: string, fallback: number): number {
  let lengthMatch = /^(\d{1,4}(?:\.\d{1,6})?)(px|rem|em|%)?$/.exec(fontValue.trim());
  if (lengthMatch === null) {
    return fallback;
  }
  let numericLength: number = Number(lengthMatch[1] ?? String(fallback));
  if (lengthMatch[2] === "rem" || lengthMatch[2] === "em") {
    return numericLength * 16;
  } else {
    return numericLength;
  }
}
export function typeStylePreviewStyle(
  style: Token.TypographyPreviewStyle,
  fontFamily: string,
): React.CSSProperties {
  let fontSize = clampTypographyNumber(
      parseTypographyLength(style.fontSize, 14),
      6,
      160,
    ),
    rawLineHeight = style.lineHeight.trim(),
    lineHeight = /[a-z%]/.test(rawLineHeight)
      ? clampTypographyNumber(
          parseTypographyLength(rawLineHeight, fontSize * 1.3),
          6,
          400,
        ) + "px"
      : clampTypographyNumber(Number(rawLineHeight), 0.5, 4),
    fontWeight =
      typeof style.fontWeight === "number"
        ? clampTypographyNumber(Math.round(style.fontWeight), 1, 1000)
        : clampTypographyNumber(
            parseInt(String(style.fontWeight), 10),
            1,
            1000,
          ),
    previewStyle: React.CSSProperties = {
      fontFamily: fontFamily,
      fontSize: fontSize,
      lineHeight: lineHeight,
      fontWeight: fontWeight,
      letterSpacing: style.letterSpacing,
      fontStyle: style.fontStyle === "italic" ? "italic" : "normal",
    };
  if (style.opticalSize !== undefined && Number.isFinite(style.opticalSize)) {
    previewStyle.fontVariationSettings =
      '"opsz" ' +
      String(clampTypographyNumber(style.opticalSize as number, 1, 144));
  } else {
    previewStyle.fontVariationSettings = "normal";
  }
  return previewStyle;
}
export function initializeTypographyPreview(): void {
    clampTypographyNumber = (
      numericValue: number,
      minimum: number,
      maximum: number,
    ) =>
      Number.isFinite(numericValue)
        ? Math.min(maximum, Math.max(minimum, numericValue))
        : minimum;
}
