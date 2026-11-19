/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseCssTransform } from "../css/transforms";

var SelectionNudgeDegRadTurnConfig: Dynamic;
function canMovePositionedSelection(
  model?: Dynamic,
  items?: Dynamic,
  singleElementPosition?: Dynamic,
): Dynamic {
  if (items.length === 0) return false;
  for (let tid of items as Dynamic) {
    let position: Dynamic =
      model.inlineStyleValue(tid, "position") ||
      (items.length === 1 ? (singleElementPosition ?? "") : "") ||
      "";
    if (position !== "absolute" && position !== "fixed") return false;
  }
  return true;
}
function ancestorTransformScale(model?: Dynamic, tid?: Dynamic): Dynamic {
  let [scaleX, scaleY]: Dynamic = [1, 1];
  for (
    let currentTid: Dynamic = model.parentTid(tid);
    currentTid != null;
    currentTid = model.parentTid(currentTid)
  ) {
    if (
      ["rotate", "scale", "translate"].some(
        (property?: Dynamic): Dynamic =>
          !["", "none"].includes(
            model.effectiveStyleValue(currentTid, property).trim(),
          ),
      )
    )
      return {
        x: 1,
        y: 1,
      };
    let transform: Dynamic = model
      .effectiveStyleValue(currentTid, "transform")
      .trim();
    if (transform === "" || transform === "none") continue;
    let matrixValues: Dynamic = /^matrix\(([^)]*)\)$/i
      .exec(transform)?.[1]!
      .split(",")
      .map(
        (part?: Dynamic): Dynamic =>
          /^\s*[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?\s*$/i.test(part)
            ? Number(part)
            : NaN,
      );
    if (matrixValues) {
      if (
        matrixValues.length !== 6 ||
        matrixValues.some(
          (component?: Dynamic): Dynamic => !Number.isFinite(component),
        ) ||
        matrixValues[1] !== 0 ||
        matrixValues[2] !== 0 ||
        matrixValues[0] === 0 ||
        matrixValues[3] === 0
      )
        return {
          x: 1,
          y: 1,
        };
      scaleX *= Math.sign(matrixValues[0]);
      scaleY *= Math.sign(matrixValues[3]);
      continue;
    }
    let parsedTransform: Dynamic = parseCssTransform(transform),
      rotationTurns: Dynamic = parsedTransform
        ? parsedTransform.rotate.value *
          (SelectionNudgeDegRadTurnConfig[
            parsedTransform.rotate.unit.toLowerCase() || "deg"
          ] ?? NaN)
        : NaN;
    if (!parsedTransform || !(Math.abs(Math.sin(rotationTurns * Math.PI)) <= 1e-4))
      return {
        x: 1,
        y: 1,
      };
    let flipSign: Dynamic = Math.round(rotationTurns) % 2 === 0 ? 1 : -1;
    scaleX *= flipSign * Math.sign(parsedTransform.scaleX || 1);
    scaleY *= flipSign * Math.sign(parsedTransform.scaleY || 1);
  }
  return {
    x: scaleX < 0 ? -1 : 1,
    y: scaleY < 0 ? -1 : 1,
  };
}
function nudgeModelSelection(
  model?: Dynamic,
  tids?: Dynamic,
  deltaX?: Dynamic,
  deltaY?: Dynamic,
  fallbackStyles?: Dynamic,
): Dynamic {
  let isSingleSelection: Dynamic = tids.length === 1;
  for (let tid of tids as Dynamic) {
    let axisScale: Dynamic = ancestorTransformScale(model, tid),
      [offsetX, offsetY]: Dynamic = [deltaX * axisScale.x, deltaY * axisScale.y],
      readOffset: Dynamic = (property?: Dynamic): Dynamic => {
        let inlineValue: Dynamic = model.inlineStyleValue(tid, property),
          numericValue: Dynamic = parseFloat(
            inlineValue || (isSingleSelection && fallbackStyles ? (fallbackStyles[property] ?? "") : "") || "0",
          );
        return Number.isFinite(numericValue) ? numericValue : 0;
      },
      hasInlineStyle: Dynamic = (property?: Dynamic): Dynamic =>
        !!model.inlineStyleValue(tid, property),
      horizontalSide: Dynamic =
        hasInlineStyle("right") && !hasInlineStyle("left") ? "right" : "left",
      verticalSide: Dynamic =
        hasInlineStyle("bottom") && !hasInlineStyle("top") ? "bottom" : "top";
    offsetX !== 0 &&
      model.setStyleProperty(
        tid,
        horizontalSide,
        `${readOffset(horizontalSide) + (horizontalSide === "right" ? -offsetX : offsetX)}px`,
      );
    offsetY !== 0 &&
      model.setStyleProperty(
        tid,
        verticalSide,
        `${readOffset(verticalSide) + (verticalSide === "bottom" ? -offsetY : offsetY)}px`,
      );
  }
}
function hasPositionedSelectionAxes(
  model?: Dynamic,
  tids?: Dynamic,
  deltaX?: Dynamic,
  deltaY?: Dynamic,
): Dynamic {
  let hasInlineStyle: Dynamic = (tid?: Dynamic, property?: Dynamic): Dynamic =>
    !!model.inlineStyleValue(tid, property);
  return tids.every(
    (tid?: Dynamic): Dynamic =>
      (deltaX === 0 ||
        hasInlineStyle(tid, "left") ||
        hasInlineStyle(tid, "right")) &&
      (deltaY === 0 || hasInlineStyle(tid, "top") || hasInlineStyle(tid, "bottom")),
  );
}
export {
  ancestorTransformScale,
  canMovePositionedSelection,
  hasPositionedSelectionAxes,
  nudgeModelSelection,
  SelectionNudgeDegRadTurnConfig,
};
export function installEditorSelectionNudge(): () => void {
  return () => {
    SelectionNudgeDegRadTurnConfig = {
      deg: 1 / 180,
      rad: 1 / Math.PI,
      turn: 2,
      grad: 1 / 200,
    };
  };
}
