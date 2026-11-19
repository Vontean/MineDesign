/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { clampColorChannel, evaluateColorContrast, parseRgbaColor, rgbaToHex, worstContrastResult } from "./contrast";

var srgbToLinear: Dynamic;
var linearToSrgb: Dynamic;
var ColorOklchResolvedValue: Dynamic;
var isInRgbGamut: Dynamic;
function rgbToOklch(color?: Dynamic): Dynamic {
  let linearRed: Dynamic = srgbToLinear(color.r),
    linearGreen: Dynamic = srgbToLinear(color.g),
    linearBlue: Dynamic = srgbToLinear(color.b),
    lmsL: Dynamic = Math.cbrt(
      0.4122214708 * linearRed +
        0.5363325363 * linearGreen +
        0.0514459929 * linearBlue,
    ),
    lmsM: Dynamic = Math.cbrt(
      0.2119034982 * linearRed +
        0.6806995451 * linearGreen +
        0.1073969566 * linearBlue,
    ),
    lmsS: Dynamic = Math.cbrt(
      0.0883024619 * linearRed +
        0.2817188376 * linearGreen +
        0.6299787005 * linearBlue,
    ),
    lightness: Dynamic =
      0.2104542553 * lmsL + 0.793617785 * lmsM - 0.0040720468 * lmsS,
    labA: Dynamic =
      1.9779984951 * lmsL - 2.428592205 * lmsM + 0.4505937099 * lmsS,
    labB: Dynamic =
      0.0259040371 * lmsL + 0.7827717662 * lmsM - 0.808675766 * lmsS;
  return {
    l: lightness,
    c: Math.hypot(labA, labB),
    h: Math.atan2(labB, labA),
  };
}
function oklchToRgb(
  lightness?: Dynamic,
  chroma?: Dynamic,
  hue?: Dynamic,
): Dynamic {
  let labA: Dynamic = chroma * Math.cos(hue),
    labB: Dynamic = chroma * Math.sin(hue),
    lmsL: Dynamic =
      (lightness + 0.3963377774 * labA + 0.2158037573 * labB) ** 3,
    lmsM: Dynamic =
      (lightness - 0.1055613458 * labA - 0.0638541728 * labB) ** 3,
    lmsS: Dynamic =
      (lightness - 0.0894841775 * labA - 1.291485548 * labB) ** 3;
  return [
    linearToSrgb(
      4.0767416621 * lmsL - 3.3077115913 * lmsM + 0.2309699292 * lmsS,
    ),
    linearToSrgb(
      -1.2684380046 * lmsL + 2.6097574011 * lmsM - 0.3413193965 * lmsS,
    ),
    linearToSrgb(
      -0.0041960863 * lmsL - 0.7034186147 * lmsM + 1.707614701 * lmsS,
    ),
  ];
}
function oklchToGamutMappedRgba(
  lightness?: Dynamic,
  chroma?: Dynamic,
  hue?: Dynamic,
  alpha: Dynamic = 1,
): Dynamic {
  let lowChroma: Dynamic = 0,
    currentChroma: Dynamic = chroma;
  if (!isInRgbGamut(oklchToRgb(lightness, chroma, hue))) {
    for (let iteration: Dynamic = 0; iteration < 18; iteration++) {
      let midChroma: Dynamic = (lowChroma + currentChroma) / 2;
      isInRgbGamut(oklchToRgb(lightness, midChroma, hue))
        ? (lowChroma = midChroma)
        : (currentChroma = midChroma);
    }
    currentChroma = lowChroma;
  }
  let [red, green, blue]: Dynamic = oklchToRgb(lightness, currentChroma, hue),
    toByteChannel: Dynamic = (channel?: Dynamic): Dynamic =>
      Math.round(clampColorChannel(channel) * 255) / 255;
  return {
    r: toByteChannel(red),
    g: toByteChannel(green),
    b: toByteChannel(blue),
    a: toByteChannel(alpha),
  };
}
function findReadableShade(color?: Dynamic, settings?: Dynamic): Dynamic {
  let parsed: Dynamic =
    typeof color == "string" ? parseRgbaColor(color) : color;
  if (parsed === undefined) return;
  let evaluateShade: Dynamic = (candidate?: Dynamic): Dynamic => {
    let results: Dynamic = evaluateColorContrast(
      candidate,
      settings,
    );
    return results === undefined
      ? undefined
      : {
          passes: results.every((result?: Dynamic): Dynamic => result.passes),
          worst: worstContrastResult(results),
        };
  };
  if (evaluateShade(parsed)?.passes !== false) return;
  let { l: lightness, c: chroma, h: hue }: Dynamic = rgbToOklch(parsed),
    effectiveChroma: Dynamic = chroma < 1e-4 ? 0 : chroma,
    lightnessStep: Dynamic = 1 / 256,
    hasSingleGround: Dynamic =
      (Array.isArray(settings.against) ? settings.against.length : 1) === 1,
    searchTowards: Dynamic = (targetLightness?: Dynamic): Dynamic => {
      if (
        hasSingleGround &&
        evaluateShade(oklchToGamutMappedRgba(targetLightness, effectiveChroma, hue, parsed.a))
          ?.passes !== true
      )
        return;
      let previousLightness: Dynamic = lightness;
      for (let stepLightness: Dynamic = lightness; stepLightness !== targetLightness; ) {
        previousLightness = stepLightness;
        stepLightness =
          Math.abs(targetLightness - stepLightness) <= lightnessStep
            ? targetLightness
            : stepLightness + Math.sign(targetLightness - lightness) * lightnessStep;
        let candidateRgba: Dynamic = oklchToGamutMappedRgba(
            stepLightness,
            effectiveChroma,
            hue,
            parsed.a,
          ),
          candidateEval: Dynamic = evaluateShade(candidateRgba);
        if (candidateEval?.passes === true) {
          for (let index: Dynamic = 0; index < 12; index++) {
            let midLightness: Dynamic = (previousLightness + stepLightness) / 2,
              midRgba: Dynamic = oklchToGamutMappedRgba(
                midLightness,
                effectiveChroma,
                hue,
                parsed.a,
              ),
              midEval: Dynamic = evaluateShade(midRgba);
            midEval?.passes === true
              ? ((stepLightness = midLightness),
                (candidateRgba = midRgba),
                (candidateEval = midEval))
              : (previousLightness = midLightness);
          }
          return {
            rgba: candidateRgba,
            worst: candidateEval.worst,
            moved: Math.abs(rgbToOklch(candidateRgba).l - lightness),
          };
        }
      }
    },
    towardsWhite: Dynamic = searchTowards(1),
    towardsBlack: Dynamic = searchTowards(0),
    best: Dynamic =
      towardsWhite === undefined
        ? towardsBlack
        : towardsBlack === undefined
          ? towardsWhite
          : Math.abs(towardsWhite.moved - towardsBlack.moved) > 0.001
            ? towardsWhite.moved < towardsBlack.moved
              ? towardsWhite
              : towardsBlack
            : towardsWhite.worst.ratio >= towardsBlack.worst.ratio
              ? towardsWhite
              : towardsBlack;
  return best === undefined
    ? undefined
    : {
        rgba: best.rgba,
        css: rgbaToHex(best.rgba),
        ground: best.worst.ground,
        ratio: best.worst.ratio,
      };
}
export {
  ColorOklchResolvedValue,
  findReadableShade,
  isInRgbGamut,
  linearToSrgb,
  oklchToGamutMappedRgba,
  oklchToRgb,
  rgbToOklch,
  srgbToLinear,
};
export function installEditorColorOklch(): () => void {
  return () => {
    srgbToLinear = (channel?: Dynamic): Dynamic =>
      channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    linearToSrgb = (channel?: Dynamic): Dynamic =>
      channel <= 0.0031308
        ? 12.92 * channel
        : 1.055 * channel ** (1 / 2.4) - 0.055;
    ColorOklchResolvedValue = 1 / 512;
    isInRgbGamut = (rgb?: Dynamic): Dynamic =>
      rgb.every(
        (channel?: Dynamic): Dynamic =>
          channel >= -ColorOklchResolvedValue &&
          channel <= 1 + ColorOklchResolvedValue,
      );
  };
}
