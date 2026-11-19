/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { hsvaToRgbHex, parseHsvaColor } from "../color/picker-primitives";
import { classifyStyleValue, parseCssNumber } from "./values";
import { PropertiesAssetPickerAZAZPattern } from "../properties/asset-picker";

var CssGradientsXYBlurConfig: Dynamic;
var CssGradientsItems: Dynamic;
function parseCssGradientStop(stopText?: Dynamic): Dynamic {
  let trimmed: Dynamic = stopText.trim(),
    positionMatch: Dynamic = /^(.*\S)\s+(-?\d*\.?\d+)%$/.exec(trimmed),
    colorText: Dynamic = positionMatch ? positionMatch[1] : trimmed;
  if (!PropertiesAssetPickerAZAZPattern.test(colorText)) {
    let bareNumberMatch: Dynamic = /^(-?\d*\.?\d+)%$/.exec(trimmed);
    if (bareNumberMatch)
      return {
        color: trimmed,
        opaque: true,
        raw: trimmed,
        pos: Math.min(100, Math.max(0, Number(bareNumberMatch[1]))),
      };
    let tokens: Dynamic =
        trimmed.match(/(?:[^\s(]+(?:\((?:[^()]|\([^()]*\))*\))?)+|\S+/g) ?? [],
      swatchToken: Dynamic = [tokens[0], tokens[tokens.length - 1]].find(
        (token?: Dynamic): Dynamic =>
          token !== undefined &&
          PropertiesAssetPickerAZAZPattern.test(token) &&
          !/^-?[\d.]/.test(token),
      );
    return {
      color: trimmed,
      opaque: true,
      raw: trimmed,
      ...(swatchToken
        ? {
            swatch: swatchToken,
          }
        : {}),
    };
  }
  if (!positionMatch)
    return {
      color: colorText,
    };
  let position: Dynamic = Number(positionMatch[2]);
  return position < 0 || position > 100
    ? {
        color: colorText,
        opaque: true,
        raw: trimmed,
        pos: position,
        swatch: colorText,
      }
    : {
        color: colorText,
        pos: position,
      };
}
function serializeCssGradientStop(stop?: Dynamic): Dynamic {
  return stop.opaque
    ? (stop.raw ?? stop.color)
    : stop.pos === undefined
      ? stop.color
      : `${stop.color} ${Math.round(stop.pos * 100) / 100}%`;
}
function splitGradientArguments(text?: Dynamic): Dynamic {
  let args: Dynamic = [],
    parenDepth: Dynamic = 0,
    current: Dynamic = "";
  for (let char of text as Dynamic) {
    char === "("
      ? parenDepth++
      : char === ")" && (parenDepth = Math.max(0, parenDepth - 1));
    if (char === "," && parenDepth === 0) {
      args.push(current.trim());
      current = "";
      continue;
    }
    current += char;
  }
  current.trim() && args.push(current.trim());
  return args;
}
function parseCssGradient(gradientText?: Dynamic): Dynamic {
  let trimmed: Dynamic = (gradientText ?? "").trim(),
    gradientMatch: Dynamic = /^(linear|radial)-gradient\(\s*([\s\S]+)\)$/i.exec(
      trimmed,
    );
  if (!gradientMatch) return null;
  let isRadial: Dynamic = gradientMatch[1].toLowerCase() === "radial",
    args: Dynamic = splitGradientArguments(gradientMatch[2]);
  if (args.length === 0) return null;
  let angle: Dynamic = 180,
    shape: Dynamic,
    angleMatch: Dynamic = /^(-?[\d.]+)(deg|grad|rad|turn)$/i.exec(args[0]);
  if (isRadial) {
    let shapeTokens: Dynamic =
        args[0]
          .trim()
          .match(/(?:[^\s(]+(?:\((?:[^()]|\([^()]*\))*\))?)+|\S+/g) ?? [],
      shapeKeyword: Dynamic =
        /^(circle|ellipse|closest-side|closest-corner|farthest-side|farthest-corner|at|center|top|bottom|left|right)$/i;
    shapeTokens.every(
      (token?: Dynamic): Dynamic =>
        shapeKeyword.test(token) ||
        /^(-?[\d.]+[a-z%]*|(calc|min|max|clamp|var)\(.*\))$/i.test(token),
    ) &&
      (shapeTokens.some((token?: Dynamic): Dynamic => shapeKeyword.test(token)) ||
        !shapeTokens.some(
          (token?: Dynamic): Dynamic => /^var\(/i.test(token),
        )) &&
      (shape = args.shift());
  } else if (angleMatch) {
    let angleValue: Dynamic = parseFloat(angleMatch[1]),
      angleUnit: Dynamic = angleMatch[2].toLowerCase();
    angle =
      Math.round(
        (angleUnit === "deg"
          ? angleValue
          : angleUnit === "grad"
            ? angleValue * 0.9
            : angleUnit === "rad"
              ? (angleValue * 180) / Math.PI
              : angleValue * 360) * 100,
      ) / 100;
    args.shift();
  } else if (
    /^(calc|min|max|clamp)\((?:[^()]|\([^()]*\))*\)$/i.test(args[0].trim())
  )
    args.shift();
  else if (/^-?[\d.]+deg$/i.test(args[0])) {
    angle = parseFloat(args[0]);
    args.shift();
  } else if (/^to\s/i.test(args[0])) {
    let direction: Dynamic = args.shift().toLowerCase();
    angle = direction.includes("right")
      ? 90
      : direction.includes("left")
        ? 270
        : direction.includes("top")
          ? 0
          : 180;
  }
  return args.length === 0
    ? null
    : isRadial
      ? {
          angle: angle,
          stops: args,
          radial: true,
          ...(shape !== undefined
            ? {
                shape: shape,
              }
            : {}),
        }
      : {
          angle: angle,
          stops: args,
        };
}
function serializeCssGradient(gradient?: Dynamic): Dynamic {
  return gradient.radial
    ? `radial-gradient(${gradient.shape !== undefined ? gradient.shape + ", " : ""}${gradient.stops.join(", ")})`
    : `linear-gradient(${gradient.angle}deg, ${gradient.stops.join(", ")})`;
}
function parseCssBoxShadow(shadowText?: Dynamic): Dynamic {
  let trimmed: Dynamic = (shadowText ?? "").trim();
  if (
    !trimmed ||
    trimmed === "none" ||
    classifyStyleValue(trimmed).kind !== "literal"
  )
    return null;
  let firstShadow: Dynamic = splitGradientArguments(trimmed)[0] ?? trimmed,
    tokens: Dynamic = [],
    parenDepth: Dynamic = 0,
    current: Dynamic = "";
  for (let char of firstShadow as Dynamic) {
    char === "("
      ? parenDepth++
      : char === ")" && (parenDepth = Math.max(0, parenDepth - 1));
    if (/\s/.test(char) && parenDepth === 0) {
      current && tokens.push(current);
      current = "";
      continue;
    }
    current += char;
  }
  current && tokens.push(current);
  let numbers: Dynamic = [],
    colorParts: Dynamic = [];
  for (let token of tokens as Dynamic) {
    if (token === "inset") continue;
    let numberToken: Dynamic = parseCssNumber(token);
    numberToken && numbers.length < 4
      ? numbers.push(numberToken.value)
      : colorParts.push(token);
  }
  return numbers.length < 2
    ? null
    : {
        x: numbers[0],
        y: numbers[1],
        blur: numbers[2] ?? 0,
        spread: numbers[3] ?? 0,
        color: colorParts.join(" ") || "rgba(0, 0, 0, 0.15)",
      };
}
function serializeCssBoxShadow(shadow?: Dynamic): Dynamic {
  return `${shadow.x}px ${shadow.y}px ${shadow.blur}px ${shadow.spread}px ${shadow.color}`;
}
function contrastingGradientSeed(color?: Dynamic): Dynamic {
  let accentHex: Dynamic = "#c1672a",
    hex: Dynamic = hsvaToRgbHex(
      parseHsvaColor(color),
    ).toLowerCase(),
    contrastHex: Dynamic = hex === accentHex ? "#ffffff" : accentHex,
    channelValue: Dynamic = (hexText?: Dynamic, channelIndex?: Dynamic): Dynamic =>
      parseInt(hexText.slice(1 + channelIndex * 2, 3 + channelIndex * 2), 16);
  return (
    "#" +
    [0, 1, 2]
      .map(
        (channelIndex?: Dynamic): Dynamic =>
          Math.round(
            channelValue(hex, channelIndex) +
              (channelValue(contrastHex, channelIndex) - channelValue(hex, channelIndex)) * 0.6,
          )
            .toString(16)
            .padStart(2, "0"),
      )
      .join("")
  );
}
export {
  contrastingGradientSeed,
  CssGradientsItems,
  CssGradientsXYBlurConfig,
  parseCssBoxShadow,
  parseCssGradient,
  parseCssGradientStop,
  serializeCssBoxShadow,
  serializeCssGradient,
  serializeCssGradientStop,
  splitGradientArguments,
};
export function installEditorCssGradients(): () => void {
  return () => {
    CssGradientsXYBlurConfig = {
      x: 0,
      y: 4,
      blur: 12,
      spread: 0,
      color: "rgba(0, 0, 0, 0.15)",
    };
    CssGradientsItems = [
      {
        prop: "background",
        value: null,
      },
      {
        prop: "background-clip",
        value: "text",
      },
      {
        prop: "-webkit-background-clip",
        value: "text",
      },
      {
        prop: "-webkit-text-fill-color",
        value: "transparent",
      },
    ];
  };
}
