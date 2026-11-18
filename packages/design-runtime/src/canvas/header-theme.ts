/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { normalizeCssColor } from "../design-system/type-declarations";
import { contrastRatio, parseRgbaColor } from "../editor/color/contrast";

var quickActionImagePreviewMaxBytes: Dynamic;
var defaultDarkHeaderColor: Dynamic;
var defaultLightHeaderColor: Dynamic;
var opaqueHeaderColorPattern: Dynamic;
var headerColorCanvasContext: Dynamic;
function parseHeaderCssColor(color?: Dynamic): Dynamic {
  if (color.length > 64 || /currentcolor/i.test(color)) return;
  if (headerColorCanvasContext === undefined) {
    let value3: Dynamic =
      typeof document === "undefined"
        ? null
        : (document as Dynamic).createElement("canvas");
    value3 && (value3.width = value3.height = 1);
    headerColorCanvasContext = value3?.getContext("2d") ?? null;
  }
  let value: Dynamic = headerColorCanvasContext;
  if (!value) return normalizeCssColor(color);
  let callback: Dynamic = (input?: Dynamic): Dynamic => (
      (value.fillStyle = input),
      (value.fillStyle = color),
      String(value.fillStyle)
    ),
    value2: Dynamic = callback("#010203");
  return value2 === callback("#030201") ? value2 : undefined;
}
function artboardHeaderTheme(
  theme?: Dynamic,
  parseColor: Dynamic = parseHeaderCssColor,
): Dynamic {
  let value: Dynamic = theme ? theme.background || theme.backgroundColor : "";
  if (!theme || !value) return null;
  let value2: Dynamic = Object.hasOwn(theme.vars, value)
      ? theme.vars[value]
      : value,
    value3: Dynamic = typeof value2 == "string" ? value2.trim() : "",
    value4: Dynamic = value3 === "" ? undefined : parseColor(value3),
    value5: Dynamic =
      value4 === undefined || opaqueHeaderColorPattern.test(value4)
        ? value4
        : normalizeCssColor(value3),
    value6: Dynamic =
      value5 !== undefined && opaqueHeaderColorPattern.test(value5)
        ? parseRgbaColor(value5)
        : undefined;
  return value5 === undefined || value6 === undefined
    ? null
    : {
        bg: value5,
        lightInk:
          contrastRatio(defaultLightHeaderColor, value6) >
          contrastRatio(defaultDarkHeaderColor, value6),
      };
}
export {
  artboardHeaderTheme,
  defaultDarkHeaderColor,
  defaultLightHeaderColor,
  headerColorCanvasContext,
  opaqueHeaderColorPattern,
  parseHeaderCssColor,
  quickActionImagePreviewMaxBytes,
};
export function installCanvasHeaderTheme(): () => void {
  return () => {
    quickActionImagePreviewMaxBytes = 256 * 1024;
    defaultDarkHeaderColor = {
      r: 20 / 255,
      g: 20 / 255,
      b: 19 / 255,
      a: 1,
    };
    defaultLightHeaderColor = {
      r: 1,
      g: 1,
      b: 1,
      a: 1,
    };
    opaqueHeaderColorPattern = /^#[0-9a-f]{6}$/;
  };
}
