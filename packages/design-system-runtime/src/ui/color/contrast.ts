import type * as React from "react";
import type * as Color from "../../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */

var CONTRAST_HEX_PATTERN: RegExp;
var CONTRAST_RGB_PATTERN: RegExp;
var clampColorChannel_di: (channel: number) => number;
var CONTRAST_RATIO_EPSILON: number;
var CONTRAST_MINIMUMS: Record<
  NonNullable<Color.ContrastOptions["role"]>,
  number
>;
var formatContrastRatio: (ratio: number) => string;
var srgbToLinearChannel: (channel: number) => number;
var linearToSrgbChannel: (channel: number) => number;
var RGB_GAMUT_TOLERANCE: number;
var rgbIsInGamut: (color: number[]) => boolean;
function parseContrastColor(text: string): Color.RgbaColor | undefined {
  let value = text.trim(),
    hexDigits = CONTRAST_HEX_PATTERN.exec(value)?.[1];
  if (hexDigits !== undefined) {
    let expandedHex =
        hexDigits.length <= 4
          ? hexDigits.replace(/[0-9a-f]/gi, (digit: string) => digit + digit)
          : hexDigits,
      readHexChannel = (channelIndex: number) =>
        parseInt(expandedHex.slice(channelIndex * 2, channelIndex * 2 + 2), 16) / 255;
    return {
      r: readHexChannel(0),
      g: readHexChannel(1),
      b: readHexChannel(2),
      a: expandedHex.length === 8 ? readHexChannel(3) : 1,
    };
  }
  let rgbMatch = CONTRAST_RGB_PATTERN.exec(value);
  if (rgbMatch === null) {
    return;
  }
  let callback = (component: string, unit: string) =>
      clampColorChannel_di(Number(component) / (unit === "%" ? 100 : 255)),
    red = callback(rgbMatch[1], rgbMatch[2]),
    green = callback(rgbMatch[3], rgbMatch[4]),
    blue = callback(rgbMatch[5], rgbMatch[6]),
    alpha =
      rgbMatch[7] === undefined
        ? 1
        : clampColorChannel_di(
            Number(rgbMatch[7]) / (rgbMatch[8] === "%" ? 100 : 1),
          );
  if ([red, green, blue, alpha].every(Number.isFinite)) {
    return {
      r: red,
      g: green,
      b: blue,
      a: alpha,
    };
  } else {
    return undefined;
  }
}
function relativeLuminance(color: Color.RgbaColor): number {
  let callback = (channel: number) =>
    channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  return (
    0.2126 * callback(color.r) +
    0.7152 * callback(color.g) +
    0.0722 * callback(color.b)
  );
}
function compositeContrastColor(
  foreground: Color.RgbaColor,
  background: Color.RgbaColor,
): Color.RgbaColor {
  let callback = (foregroundChannel: number, backgroundChannel: number) =>
    foreground.a * foregroundChannel + (1 - foreground.a) * backgroundChannel;
  return {
    r: callback(foreground.r, background.r),
    g: callback(foreground.g, background.g),
    b: callback(foreground.b, background.b),
    a: 1,
  };
}
function contrastRatio(
  foreground: Color.RgbaColor,
  background: Color.RgbaColor,
): number {
  let value = relativeLuminance(
      compositeContrastColor(foreground, background),
    ),
    backgroundLuminance = relativeLuminance(background);
  if (value > backgroundLuminance) {
    return (value + 0.05) / (backgroundLuminance + 0.05);
  } else {
    return (backgroundLuminance + 0.05) / (value + 0.05);
  }
}
function colorContrastResults(
  color: string | Color.RgbaColor,
  contrast: Color.ContrastOptions,
): Color.ContrastResult[] | undefined {
  let value = typeof color === "string" ? parseContrastColor(color) : color;
  if (value === undefined) {
    return;
  }
  let minimumRatio = CONTRAST_MINIMUMS[contrast.role ?? "text"],
    backgrounds = Array.isArray(contrast.against)
      ? contrast.against
      : [contrast.against],
    items: Color.ContrastResult[] = [];
  for (let background of backgrounds) {
    let backgroundColor = parseContrastColor(background.css);
    if (backgroundColor === undefined) {
      continue;
    }
    let ratio = contrastRatio(value, {
      ...backgroundColor,
      a: 1,
    });
    items.push({
      ground: background,
      ratio: ratio,
      min: minimumRatio,
      passes: ratio + CONTRAST_RATIO_EPSILON >= minimumRatio,
    });
  }
  if (items.length > 0) {
    return items;
  } else {
    return undefined;
  }
}
function worstContrastResult(
  results: Color.ContrastResult[],
): Color.ContrastResult {
  let value = results[0];
  for (let result of results) {
    if (result.ratio < value.ratio) {
      value = result;
    }
  }
  return value;
}
function contrastRatioReadout(ratio: number): string {
  return formatContrastRatio(ratio) + ":1";
}
function contrastRatioSpoken(ratio: number): string {
  return formatContrastRatio(ratio) + " to 1";
}
function contrastColorHex(color: Color.RgbaColor): string {
  let callback = (channel: number) =>
    Math.round(clampColorChannel_di(channel) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return (
    "#" +
    callback(color.r) +
    callback(color.g) +
    callback(color.b) +
    (color.a < 1 ? callback(color.a) : "")
  );
}
function rgbToOklch(color: Color.RgbaColor): Color.OklchColor {
  let value = srgbToLinearChannel(color.r),
    linearGreen = srgbToLinearChannel(color.g),
    linearBlue = srgbToLinearChannel(color.b),
    lmsLongRoot = Math.cbrt(
      0.4122214708 * value + 0.5363325363 * linearGreen + 0.0514459929 * linearBlue,
    ),
    lmsMediumRoot = Math.cbrt(
      0.2119034982 * value + 0.6806995451 * linearGreen + 0.1073969566 * linearBlue,
    ),
    lmsShortRoot = Math.cbrt(
      0.0883024619 * value + 0.2817188376 * linearGreen + 0.6299787005 * linearBlue,
    ),
    lightness =
      0.2104542553 * lmsLongRoot + 0.793617785 * lmsMediumRoot - 0.0040720468 * lmsShortRoot,
    oklabA =
      1.9779984951 * lmsLongRoot - 2.428592205 * lmsMediumRoot + 0.4505937099 * lmsShortRoot,
    oklabB =
      0.0259040371 * lmsLongRoot + 0.7827717662 * lmsMediumRoot - 0.808675766 * lmsShortRoot;
  return {
    l: lightness,
    c: Math.hypot(oklabA, oklabB),
    h: Math.atan2(oklabB, oklabA),
  };
}
function oklchToRgb(
  lightness: number,
  chroma: number,
  hue: number,
): [number, number, number] {
  let value = chroma * Math.cos(hue),
    oklabB = chroma * Math.sin(hue),
    lmsLong = (lightness + 0.3963377774 * value + 0.2158037573 * oklabB) ** 3,
    lmsMedium = (lightness - 0.1055613458 * value - 0.0638541728 * oklabB) ** 3,
    lmsShort = (lightness - 0.0894841775 * value - 1.291485548 * oklabB) ** 3;
  return [
    linearToSrgbChannel(
      4.0767416621 * lmsLong - 3.3077115913 * lmsMedium + 0.2309699292 * lmsShort,
    ),
    linearToSrgbChannel(
      -1.2684380046 * lmsLong + 2.6097574011 * lmsMedium - 0.3413193965 * lmsShort,
    ),
    linearToSrgbChannel(
      -0.0041960863 * lmsLong - 0.7034186147 * lmsMedium + 1.707614701 * lmsShort,
    ),
  ];
}
function clippedOklchColor(
  lightness: number,
  chroma: number,
  hue: number,
  alpha: number = 1,
): Color.RgbaColor {
  let index = 0,
    value = chroma;
  if (!rgbIsInGamut(oklchToRgb(lightness, chroma, hue))) {
    for (let iteration = 0; iteration < 18; iteration++) {
      let candidateChroma = (index + value) / 2;
      if (rgbIsInGamut(oklchToRgb(lightness, candidateChroma, hue))) {
        index = candidateChroma;
      } else {
        value = candidateChroma;
      }
    }
    value = index;
  }
  let [red, green, blue] = oklchToRgb(lightness, value, hue),
    callback = (channel: number) =>
      Math.round(clampColorChannel_di(channel) * 255) / 255;
  return {
    r: callback(red),
    g: callback(green),
    b: callback(blue),
    a: callback(alpha),
  };
}
function contrastColorFix(
  color: string | Color.RgbaColor,
  contrast: Color.ContrastOptions,
): Color.ContrastFix | undefined {
  let value = typeof color === "string" ? parseContrastColor(color) : color;
  if (value === undefined) {
    return;
  }
  let callback = (
    candidateColor: Color.RgbaColor,
  ): Color.ContrastVerdict | undefined => {
    let results = colorContrastResults(candidateColor, contrast);
    if (results === undefined) {
      return undefined;
    } else {
      return {
        passes: results.every((result) => result.passes),
        worst: worstContrastResult(results),
      };
    }
  };
  if (callback(value)?.passes !== false) {
    return;
  }
  let { l: l5, c: c, h: h } = rgbToOklch(value),
    adjustedChroma = c < 0.0001 ? 0 : c,
    count = 0.00390625,
    hasContrastRequirements =
      (Array.isArray(contrast.against) ? contrast.against.length : 1) === 1,
    searchTowardsLightness = (targetLightness: number): Color.ContrastFixCandidate | undefined => {
      if (
        hasContrastRequirements &&
        callback(clippedOklchColor(targetLightness, adjustedChroma, h, value.a))?.passes !==
          true
      ) {
        return;
      }
      let failingLightness = l5;
      for (let candidateLightness = l5; candidateLightness !== targetLightness; ) {
        failingLightness = candidateLightness;
        candidateLightness =
          Math.abs(targetLightness - candidateLightness) <= count
            ? targetLightness
            : candidateLightness + Math.sign(targetLightness - l5) * count;
        let passingColor = clippedOklchColor(candidateLightness, adjustedChroma, h, value.a),
          passingResults = callback(passingColor);
        if (passingResults?.passes !== true) {
          continue;
        }
        for (let index = 0; index < 12; index++) {
          let midpointLightness = (failingLightness + candidateLightness) / 2,
            midpointColor = clippedOklchColor(midpointLightness, adjustedChroma, h, value.a),
            midpointResults = callback(midpointColor);
          if (midpointResults?.passes === true) {
            candidateLightness = midpointLightness;
            passingColor = midpointColor;
            passingResults = midpointResults;
          } else {
            failingLightness = midpointLightness;
          }
        }
        return {
          rgba: passingColor,
          worst: passingResults.worst,
          moved: Math.abs(rgbToOklch(passingColor).l - l5),
        };
      }
      return;
    },
    lighterCandidate = searchTowardsLightness(1),
    darkerCandidate = searchTowardsLightness(0),
    preferredCandidate =
      lighterCandidate === undefined
        ? darkerCandidate
        : darkerCandidate === undefined
          ? lighterCandidate
          : Math.abs(lighterCandidate.moved - darkerCandidate.moved) > 0.001
            ? lighterCandidate.moved < darkerCandidate.moved
              ? lighterCandidate
              : darkerCandidate
            : lighterCandidate.worst.ratio >= darkerCandidate.worst.ratio
              ? lighterCandidate
              : darkerCandidate;
  if (preferredCandidate === undefined) {
    return undefined;
  } else {
    return {
      rgba: preferredCandidate.rgba,
      css: contrastColorHex(preferredCandidate.rgba),
      ground: preferredCandidate.worst.ground,
      ratio: preferredCandidate.worst.ratio,
    };
  }
}
export {
  clampColorChannel_di,
  clippedOklchColor,
  colorContrastResults,
  compositeContrastColor,
  CONTRAST_HEX_PATTERN,
  CONTRAST_MINIMUMS,
  CONTRAST_RATIO_EPSILON,
  CONTRAST_RGB_PATTERN,
  contrastColorFix,
  contrastColorHex,
  contrastRatio,
  contrastRatioReadout,
  contrastRatioSpoken,
  formatContrastRatio,
  linearToSrgbChannel,
  oklchToRgb,
  parseContrastColor,
  relativeLuminance,
  RGB_GAMUT_TOLERANCE,
  rgbIsInGamut,
  rgbToOklch,
  srgbToLinearChannel,
  worstContrastResult,
};
export function installUiColorContrast(): () => void {
  return () => {
    CONTRAST_HEX_PATTERN = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
    CONTRAST_RGB_PATTERN =
      /^rgba?\(\s*([\d.]+)(%?)[\s,]+([\d.]+)(%?)[\s,]+([\d.]+)(%?)(?:[\s,/]+([\d.]+)(%?))?\s*\)$/i;
    clampColorChannel_di = (channel: number) =>
      channel < 0 ? 0 : channel > 1 ? 1 : channel;
    CONTRAST_RATIO_EPSILON = 0.000000001;
    CONTRAST_MINIMUMS = {
      text: 4.5,
      largeText: 3,
      graphic: 3,
    };
    formatContrastRatio = (ratio: number) => {
      let value = Math.floor((ratio + CONTRAST_RATIO_EPSILON) * 10) / 10;
      if (value < 10 || !Number.isInteger(value)) {
        return value.toFixed(1);
      } else {
        return String(value);
      }
    };
    srgbToLinearChannel = (channel: number) =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    linearToSrgbChannel = (channel: number) =>
      channel <= 0.0031308
        ? 12.92 * channel
        : 1.055 * channel ** 0.4166666666666667 - 0.055;
    RGB_GAMUT_TOLERANCE = 0.001953125;
    rgbIsInGamut = (color) =>
      color.every(
        (channel: number) =>
          channel >= -RGB_GAMUT_TOLERANCE && channel <= 1 + RGB_GAMUT_TOLERANCE,
      );
  };
}
