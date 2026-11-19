/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var hexColorPattern: Dynamic;
var rgbColorPattern: Dynamic;
var clampColorChannel: Dynamic;
var ColorContrastConstant: Dynamic;
var contrastThresholds: Dynamic;
var formatContrastNumber: Dynamic;
function parseRgbaColor(cssColor?: Dynamic): Dynamic {
  let normalized: Dynamic = cssColor.trim(),
    hexDigits: Dynamic = hexColorPattern.exec(normalized)?.[1];
  if (hexDigits !== undefined) {
    let expandedHex: Dynamic =
        hexDigits.length <= 4
          ? hexDigits.replace(
              /[0-9a-f]/gi,
              (char?: Dynamic): Dynamic => char + char,
            )
          : hexDigits,
      channelAt: Dynamic = (index?: Dynamic): Dynamic =>
        parseInt(expandedHex.slice(index * 2, index * 2 + 2), 16) / 255;
    return {
      r: channelAt(0),
      g: channelAt(1),
      b: channelAt(2),
      a: expandedHex.length === 8 ? channelAt(3) : 1,
    };
  }
  let rgbMatch: Dynamic = rgbColorPattern.exec(normalized);
  if (rgbMatch === null) return;
  let normalizeChannel: Dynamic = (raw?: Dynamic, unit?: Dynamic): Dynamic =>
      clampColorChannel(Number(raw) / (unit === "%" ? 100 : 255)),
    red: Dynamic = normalizeChannel(rgbMatch[1], rgbMatch[2]),
    green: Dynamic = normalizeChannel(rgbMatch[3], rgbMatch[4]),
    blue: Dynamic = normalizeChannel(rgbMatch[5], rgbMatch[6]),
    alpha: Dynamic =
      rgbMatch[7] === undefined
        ? 1
        : clampColorChannel(Number(rgbMatch[7]) / (rgbMatch[8] === "%" ? 100 : 1));
  return [red, green, blue, alpha].every(Number.isFinite)
    ? {
        r: red,
        g: green,
        b: blue,
        a: alpha,
      }
    : undefined;
}
function relativeLuminance(color?: Dynamic): Dynamic {
  let linearize: Dynamic = (channel?: Dynamic): Dynamic =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return (
    0.2126 * linearize(color.r) +
    0.7152 * linearize(color.g) +
    0.0722 * linearize(color.b)
  );
}
function compositeRgbaColor(
  foreground?: Dynamic,
  background?: Dynamic,
): Dynamic {
  let blend: Dynamic = (foregroundChannel?: Dynamic, backgroundChannel?: Dynamic): Dynamic =>
    foreground.a * foregroundChannel + (1 - foreground.a) * backgroundChannel;
  return {
    r: blend(foreground.r, background.r),
    g: blend(foreground.g, background.g),
    b: blend(foreground.b, background.b),
    a: 1,
  };
}
function contrastRatio(foreground?: Dynamic, background?: Dynamic): Dynamic {
  let foregroundLuminance: Dynamic = relativeLuminance(
      compositeRgbaColor(foreground, background),
    ),
    backgroundLuminance: Dynamic = relativeLuminance(background);
  return foregroundLuminance > backgroundLuminance
    ? (foregroundLuminance + 0.05) / (backgroundLuminance + 0.05)
    : (backgroundLuminance + 0.05) / (foregroundLuminance + 0.05);
}
function evaluateColorContrast(color?: Dynamic, settings?: Dynamic): Dynamic {
  let foreground: Dynamic =
    typeof color == "string" ? parseRgbaColor(color) : color;
  if (foreground === undefined) return;
  let minRatio: Dynamic = contrastThresholds[settings.role ?? "text"],
    grounds: Dynamic = Array.isArray(settings.against)
      ? settings.against
      : [settings.against],
    results: Dynamic = [];
  for (let ground of grounds as Dynamic) {
    let groundColor: Dynamic = parseRgbaColor(ground.css);
    if (groundColor === undefined) continue;
    let ratio: Dynamic = contrastRatio(foreground, {
      ...groundColor,
      a: 1,
    });
    results.push({
      ground: ground,
      ratio: ratio,
      min: minRatio,
      passes: ratio + ColorContrastConstant >= minRatio,
    });
  }
  return results.length > 0 ? results : undefined;
}
function worstContrastResult(results?: Dynamic): Dynamic {
  let worst: Dynamic = results[0];
  for (let result of results as Dynamic)
    result.ratio < worst.ratio && (worst = result);
  return worst;
}
function formatContrastRatio(ratio?: Dynamic): Dynamic {
  return formatContrastNumber(ratio) + ":1";
}
function formatSpokenContrastRatio(ratio?: Dynamic): Dynamic {
  return formatContrastNumber(ratio) + " to 1";
}
function rgbaToHex(color?: Dynamic): Dynamic {
  let channelToHex: Dynamic = (channel?: Dynamic): Dynamic =>
    Math.round(clampColorChannel(channel) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return (
    "#" +
    channelToHex(color.r) +
    channelToHex(color.g) +
    channelToHex(color.b) +
    (color.a < 1 ? channelToHex(color.a) : "")
  );
}
export {
  clampColorChannel,
  ColorContrastConstant,
  compositeRgbaColor,
  contrastRatio,
  contrastThresholds,
  evaluateColorContrast,
  formatContrastNumber,
  formatContrastRatio,
  formatSpokenContrastRatio,
  hexColorPattern,
  parseRgbaColor,
  relativeLuminance,
  rgbaToHex,
  rgbColorPattern,
  worstContrastResult,
};
export function installEditorColorContrast(): () => void {
  return () => {
    hexColorPattern = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
    rgbColorPattern =
      /^rgba?\(\s*([\d.]+)(%?)[\s,]+([\d.]+)(%?)[\s,]+([\d.]+)(%?)(?:[\s,/]+([\d.]+)(%?))?\s*\)$/i;
    clampColorChannel = (channel?: Dynamic): Dynamic =>
      channel < 0 ? 0 : channel > 1 ? 1 : channel;
    ColorContrastConstant = 1e-9;
    contrastThresholds = {
      text: 4.5,
      largeText: 3,
      graphic: 3,
    };
    formatContrastNumber = (ratio?: Dynamic): Dynamic => {
      let rounded: Dynamic =
        Math.floor((ratio + ColorContrastConstant) * 10) / 10;
      return rounded < 10 || !Number.isInteger(rounded)
        ? rounded.toFixed(1)
        : String(rounded);
    };
  };
}
