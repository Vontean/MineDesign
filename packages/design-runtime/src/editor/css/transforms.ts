/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { classifyStyleValue, formatCssNumber, parseCssNumber } from "./values";

var CssTransformsTranslateTranslatexTranslateyConfig: Dynamic;
function parseCssTransform(transform?: Dynamic): Dynamic {
  let trimmed: Dynamic = (transform ?? "").trim(),
    state: Dynamic = {
      x: {
        value: 0,
        unit: "px",
      },
      y: {
        value: 0,
        unit: "px",
      },
      rotate: {
        value: 0,
        unit: "deg",
      },
      scaleX: 1,
      scaleY: 1,
    };
  if (!trimmed || trimmed === "none") return state;
  if (classifyStyleValue(trimmed).kind !== "literal") return null;
  let functionPattern: Dynamic = /([a-zA-Z]+)\(([^)]*)\)/g;
  if (trimmed.replace(functionPattern, "").trim() !== "") return null;
  let usedAxes: Dynamic = new Set(),
    match: Dynamic;
  for (; (match = functionPattern.exec(trimmed)); ) {
    let functionName: Dynamic = match[1].toLowerCase(),
      args: Dynamic = match[2]
        .split(",")
        .map((arg?: Dynamic): Dynamic => arg.trim()),
      firstArg: Dynamic = parseCssNumber(args[0] ?? ""),
      secondArg: Dynamic = parseCssNumber(args[1] ?? "");
    if (
      !firstArg ||
      !Object.hasOwn(CssTransformsTranslateTranslatexTranslateyConfig, functionName)
    )
      return null;
    for (let axis of CssTransformsTranslateTranslatexTranslateyConfig[
      functionName
    ] as Dynamic) {
      if (usedAxes.has(axis)) return null;
      usedAxes.add(axis);
    }
    if (
      args.length >
      CssTransformsTranslateTranslatexTranslateyConfig[functionName].length
    )
      return null;
    let hasBareNonZero: Dynamic = (parsedNumber?: Dynamic): Dynamic =>
      !!parsedNumber && !parsedNumber.unit && parsedNumber.value !== 0;
    if (!functionName.startsWith("scale") && (hasBareNonZero(firstArg) || hasBareNonZero(secondArg)))
      return null;
    if (functionName === "translate") {
      state.x = firstArg;
      if (args.length > 1) {
        if (!secondArg) return null;
        state.y = secondArg;
      }
    } else if (functionName === "translatex") state.x = firstArg;
    else if (functionName === "translatey") state.y = firstArg;
    else if (functionName === "rotate") {
      if (!/^(deg|rad|turn|grad)?$/i.test(firstArg.unit)) return null;
      state.rotate = {
        value: firstArg.value,
        unit: firstArg.unit || "deg",
      };
    } else if (functionName === "scale") {
      if ((args.length > 1 && !secondArg) || firstArg.unit || secondArg?.unit)
        return null;
      state.scaleX = firstArg.value;
      state.scaleY = secondArg ? secondArg.value : firstArg.value;
    } else if (functionName === "scalex" || functionName === "scaley") {
      if (firstArg.unit) return null;
      functionName === "scalex"
        ? (state.scaleX = firstArg.value)
        : (state.scaleY = firstArg.value);
    } else return null;
  }
  return state;
}
function serializeCssTransform(transform?: Dynamic): Dynamic {
  let parts: Dynamic = [];
  (transform.x.value !== 0 || transform.y.value !== 0) &&
    parts.push(
      `translate(${formatCssNumber(transform.x.value, transform.x.unit || "px")}, ${formatCssNumber(transform.y.value, transform.y.unit || "px")})`,
    );
  transform.rotate.value !== 0 &&
    parts.push(
      `rotate(${formatCssNumber(transform.rotate.value, transform.rotate.unit || "deg")})`,
    );
  (transform.scaleX !== 1 || transform.scaleY !== 1) &&
    (transform.scaleX === transform.scaleY
      ? parts.push(`scale(${formatCssNumber(transform.scaleX, "")})`)
      : transform.scaleY === 1
        ? parts.push(
            `scaleX(${formatCssNumber(transform.scaleX, "")})`,
          )
        : transform.scaleX === 1
          ? parts.push(
              `scaleY(${formatCssNumber(transform.scaleY, "")})`,
            )
          : parts.push(
              `scale(${formatCssNumber(transform.scaleX, "")}, ${formatCssNumber(transform.scaleY, "")})`,
            ));
  return parts.join(" ");
}
export {
  CssTransformsTranslateTranslatexTranslateyConfig,
  parseCssTransform,
  serializeCssTransform,
};
export function installEditorCssTransforms(): () => void {
  return () => {
    CssTransformsTranslateTranslatexTranslateyConfig = {
      translate: ["x", "y"],
      translatex: ["x"],
      translatey: ["y"],
      rotate: ["r"],
      scale: ["sx", "sy"],
      scalex: ["sx"],
      scaley: ["sy"],
    };
  };
}
