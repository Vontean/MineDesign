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
    let canvasElement: Dynamic =
      typeof document === "undefined"
        ? null
        : (document as Dynamic).createElement("canvas");
    canvasElement && (canvasElement.width = canvasElement.height = 1);
    headerColorCanvasContext = canvasElement?.getContext("2d") ?? null;
  }
  let canvasContext: Dynamic = headerColorCanvasContext;
  if (!canvasContext) return normalizeCssColor(color);
  let probeParse: Dynamic = (seedColor?: Dynamic): Dynamic => (
      (canvasContext.fillStyle = seedColor),
      (canvasContext.fillStyle = color),
      String(canvasContext.fillStyle)
    ),
    probeColor: Dynamic = probeParse("#010203");
  return probeColor === probeParse("#030201") ? probeColor : undefined;
}
function artboardHeaderTheme(
  theme?: Dynamic,
  parseColor: Dynamic = parseHeaderCssColor,
): Dynamic {
  let themeBackground: Dynamic = theme ? theme.background || theme.backgroundColor : "";
  if (!theme || !themeBackground) return null;
  let rawColor: Dynamic = Object.hasOwn(theme.vars, themeBackground)
      ? theme.vars[themeBackground]
      : themeBackground,
    trimmedColor: Dynamic = typeof rawColor == "string" ? rawColor.trim() : "",
    parsedColor: Dynamic = trimmedColor === "" ? undefined : parseColor(trimmedColor),
    opaqueColor: Dynamic =
      parsedColor === undefined || opaqueHeaderColorPattern.test(parsedColor)
        ? parsedColor
        : normalizeCssColor(trimmedColor),
    rgbaColor: Dynamic =
      opaqueColor !== undefined && opaqueHeaderColorPattern.test(opaqueColor)
        ? parseRgbaColor(opaqueColor)
        : undefined;
  return opaqueColor === undefined || rgbaColor === undefined
    ? null
    : {
        bg: opaqueColor,
        lightInk:
          contrastRatio(defaultLightHeaderColor, rgbaColor) >
          contrastRatio(defaultDarkHeaderColor, rgbaColor),
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
