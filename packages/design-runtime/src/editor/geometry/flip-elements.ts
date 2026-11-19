import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { getStyleProperty } from "../css/declarations";
import { parseCssTransform, serializeCssTransform } from "../css/transforms";
import { DcTplAttribute } from "../html/authoring";
import { selectedRootElementIds } from "../selection/element-order";
import { inspectSvgArrow } from "../svg/arrows";
import { setSvgLineEndpoints } from "../svg/layout";

var GeometryFlipElementsLabel: Dynamic;
var ThisComponentManagesItselfSoItMessage: Dynamic;
var GeometryFlipElementsLabel_2: Dynamic;
var ThisOnlyWrapsOtherLayersSoMessage: Dynamic;
var ThisHasNoWidthOfItsMessage: Dynamic;
var ThisHasNoHeightOfItsMessage: Dynamic;
var ThisIsnTShownOnThePageMessage: Dynamic;
var GeometryFlipElementsLabel_3: Dynamic;
var GeometryFlipElementsLabel_4: Dynamic;
var GeometryFlipElementsLabel_5: Dynamic;
var ThisRepeatedElementCanTBeFlippedMessage: Dynamic;
var FlippingThisWayWouldnTChangeItMessage: Dynamic;
var FinishEditingThisDrawingSPointsToMessage: Dynamic;
var GeometryFlipElementsLabel_6: Dynamic;
var CouldnTFlipRightNowTryAgainMessage: Dynamic;
var GeometryFlipElementsYtMytOytConfig: Dynamic;
var GeometryFlipElementsTransformRotateScaleValues: Dynamic;
var GeometryFlipElementsLimit: Dynamic;
var GeometryFlipElementsLimit_2: Dynamic;
var GeometryFlipElementsTranslateTranslatexTranslateyConfig: Dynamic;
var GeometryFlipElementsDegRadTurnConfig: Dynamic;
var GeometryFlipElementsHandler: Dynamic;
var GeometryFlipElementsScIfScForPattern: Dynamic;
function parseFlipInspection(rawInspection?: Dynamic): Dynamic {
  if (typeof rawInspection != "object" || rawInspection === null) return null;
  let inspection: Dynamic = rawInspection;
  if (
    typeof inspection.pose == "object" &&
    inspection.pose !== null &&
    inspection.pose.boxless === true
  )
    return {
      boxless: true,
    };
  if (inspection.missing === true || inspection.rendered === false)
    return {
      unrendered: true,
    };
  if (
    typeof inspection.computed != "object" ||
    inspection.computed === null ||
    typeof inspection.pose != "object" ||
    inspection.pose === null
  )
    return null;
  let computed: Dynamic = inspection.computed,
    pose: Dynamic = inspection.pose,
    flatAxes: Dynamic =
      typeof pose.flat == "object" && pose.flat !== null ? pose.flat : {},
    centrePoint: Dynamic =
      typeof pose.centre == "object" && pose.centre !== null
        ? pose.centre
        : {},
    isValidCoordinate: Dynamic = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "number" &&
      Number.isFinite(candidate) &&
      Math.abs(candidate) <= GeometryFlipElementsLimit;
  if (
    !isValidCoordinate(centrePoint.x) ||
    !isValidCoordinate(centrePoint.y) ||
    typeof pose.inline != "boolean"
  )
    return null;
  let hasComputedValue: Dynamic = (property?: Dynamic): Dynamic =>
    typeof computed[property] == "string" &&
    !["", "none"].includes(computed[property].trim());
  return {
    centre: {
      x: centrePoint.x,
      y: centrePoint.y,
    },
    ...(pose.inline
      ? {
          inline: true,
        }
      : {}),
    ...(flatAxes.x === true || flatAxes.y === true
      ? {
          flat: {
            x: flatAxes.x === true,
            y: flatAxes.y === true,
          },
        }
      : {}),
    ...(hasComputedValue("transform")
      ? {
          transformed: true,
        }
      : {}),
    ...(hasComputedValue("rotate") || hasComputedValue("scale") || hasComputedValue("translate")
      ? {
          axisProps: true,
        }
      : {}),
  };
}
async function inspectFlipSelection(
  model?: Dynamic,
  selection?: Dynamic,
  measure?: Dynamic,
): Promise<Dynamic> {
  let inspectTarget: Dynamic = async (
      tid?: Dynamic,
      isTransformSuppressed?: Dynamic,
    ): Promise<Dynamic> =>
      parseFlipInspection(
        await measure(
          tid,
          GeometryFlipElementsTransformRotateScaleValues,
          isTransformSuppressed,
        ).catch((): Dynamic => null),
      ),
    needsReinspection: Dynamic = (tid?: Dynamic, inspection?: Dynamic): Dynamic =>
      inspection != null &&
      inspection.unrendered !== true &&
      (inspection.transformed === true) ===
        ["", "none"].includes(
          model.effectiveStyleValue(tid, "transform").trim(),
        ),
    targets: Dynamic = flipSelectionTargets(model, selection),
    inspections: Dynamic = await Promise.all(
      targets.map(async (tid?: Dynamic): Promise<Dynamic> => {
        let firstInspection: Dynamic = await inspectTarget(tid, false);
        return needsReinspection(tid, firstInspection) ? inspectTarget(tid, true) : firstInspection;
      }),
    );
  return new Map(
    targets.flatMap(
      (tid?: Dynamic, targetIndex?: Dynamic): Dynamic =>
        inspections[targetIndex] ? [[tid, inspections[targetIndex]]] : [],
    ),
  );
}
function isOrderedSimpleTransform(transformText?: Dynamic): Dynamic {
  let index: Dynamic = 0;
  for (let [, functionName] of transformText.matchAll(/([a-zA-Z]+)\(/g) as Dynamic) {
    let lowerFunctionName: Dynamic = functionName.toLowerCase();
    if (
      !Object.hasOwn(
        GeometryFlipElementsTranslateTranslatexTranslateyConfig,
        lowerFunctionName,
      ) ||
      GeometryFlipElementsTranslateTranslatexTranslateyConfig[lowerFunctionName] < index
    )
      return false;
    index = GeometryFlipElementsTranslateTranslatexTranslateyConfig[lowerFunctionName];
  }
  return true;
}
function serializeFlipTransform(transform?: Dynamic): Dynamic {
  let formatNumber: Dynamic = (amount?: Dynamic, unit?: Dynamic): Dynamic =>
      (/e/i.test(String(amount))
        ? amount.toFixed(12).replace(/\.?0+$/, "")
        : String(amount || 0)) + unit,
    parts: Dynamic = [];
  (transform.x.value !== 0 || transform.y.value !== 0) &&
    parts.push(
      "translate(" +
        formatNumber(transform.x.value, transform.x.unit || "px") +
        ", " +
        formatNumber(transform.y.value, transform.y.unit || "px") +
        ")",
    );
  transform.rotate.value !== 0 &&
    parts.push(
      "rotate(" +
        formatNumber(transform.rotate.value, transform.rotate.unit || "deg") +
        ")",
    );
  (transform.scaleX !== 1 || transform.scaleY !== 1) &&
    parts.push(
      transform.scaleX === transform.scaleY
        ? "scale(" + formatNumber(transform.scaleX, "") + ")"
        : transform.scaleY === 1
          ? "scaleX(" + formatNumber(transform.scaleX, "") + ")"
          : transform.scaleX === 1
            ? "scaleY(" + formatNumber(transform.scaleY, "") + ")"
            : "scale(" +
              formatNumber(transform.scaleX, "") +
              ", " +
              formatNumber(transform.scaleY, "") +
              ")",
    );
  return parts.join(" ");
}
function flipElementTransform(
  transformText?: Dynamic,
  axis?: Dynamic,
  centre?: Dynamic,
): Dynamic {
  let parsed: Dynamic = parseCssTransform(transformText);
  if (!parsed || !isOrderedSimpleTransform(transformText ?? "")) return null;
  let finiteOrZero: Dynamic = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "number" &&
      Number.isFinite(candidate) &&
      Math.abs(candidate) <= GeometryFlipElementsLimit
        ? candidate
        : 0,
    radians: Dynamic =
      parsed.rotate.value *
      (GeometryFlipElementsDegRadTurnConfig[
        parsed.rotate.unit.toLowerCase() || "deg"
      ] ?? Math.PI / 180),
    [centreX, centreY]: Dynamic = [
      finiteOrZero(centre?.x) * parsed.scaleX,
      finiteOrZero(centre?.y) * parsed.scaleY,
    ],
    offsetShift: Dynamic =
      axis === "horizontal"
        ? 2 * (Math.cos(radians) * centreX - Math.sin(radians) * centreY)
        : 2 * (Math.sin(radians) * centreX + Math.cos(radians) * centreY),
    needsOffset: Dynamic = Math.abs(offsetShift) >= GeometryFlipElementsLimit_2,
    offsetAxis: Dynamic = axis === "horizontal" ? parsed.x : parsed.y;
  if (needsOffset && offsetAxis.value !== 0 && offsetAxis.unit.toLowerCase() !== "px")
    return "offset";
  let offsetState: Dynamic = {
    value: GeometryFlipElementsHandler(offsetAxis.value + offsetShift),
    unit: "px",
  };
  return serializeFlipTransform({
    x: needsOffset && axis === "horizontal" ? offsetState : parsed.x,
    y: needsOffset && axis === "vertical" ? offsetState : parsed.y,
    rotate: {
      value: -parsed.rotate.value || 0,
      unit: parsed.rotate.unit,
    },
    scaleX: axis === "horizontal" ? -parsed.scaleX || 0 : parsed.scaleX,
    scaleY: axis === "vertical" ? -parsed.scaleY || 0 : parsed.scaleY,
  });
}
function flipSelectionTargets(model?: Dynamic, selection?: Dynamic): Dynamic {
  let resolveTarget: Dynamic = (tid?: Dynamic): Dynamic => {
    let element: Dynamic = model.element(tid),
      flipTarget: Dynamic =
        element?.tagName.toLowerCase() === "picture"
          ? element.querySelector("img[" + DcTplAttribute + "]")
          : null;
    for (
      let ancestor: Dynamic = element?.parentElement ?? null;
      ancestor;
      ancestor = ancestor.parentElement
    )
      ancestor.tagName.toLowerCase() === "svg" && (flipTarget = ancestor);
    let resolvedTid: Dynamic = flipTarget
      ? parseInt(flipTarget.getAttribute(DcTplAttribute) ?? "", 10)
      : NaN;
    return Number.isFinite(resolvedTid) ? resolvedTid : tid;
  };
  return selectedRootElementIds(model, [
    ...new Set(
      selection
        .filter((tid?: Dynamic): Dynamic => model.element(tid) != null)
        .map(resolveTarget),
    ),
  ]);
}
function getSvgFlipEndpoints(model?: Dynamic, tid?: Dynamic): Dynamic {
  let svgElement: Dynamic =
      model.tagName(tid) === "svg" ? model.element(tid) : null,
    arrow: Dynamic = svgElement ? inspectSvgArrow(svgElement) : null,
    transform: Dynamic = parseCssTransform(
      model.effectiveStyleValue(tid, "transform"),
    );
  if (!arrow || !transform || serializeCssTransform(transform) !== "")
    return null;
  let shaftTid: Dynamic = parseInt(
      arrow.shaft.getAttribute(DcTplAttribute) ?? "",
      10,
    ),
    attributes: Dynamic = model.attributes(tid),
    viewBox: Dynamic = (attributes.viewBox ?? "")
      .trim()
      .split(/[\s,]+/)
      .map(Number);
  return !Number.isFinite(shaftTid) ||
    viewBox.length !== 4 ||
    viewBox.some((coordinate?: Dynamic): Dynamic => !Number.isFinite(coordinate)) ||
    !(viewBox[2] > 0) ||
    !(viewBox[3] > 0) ||
    !/^(none|xMidYMid)\b/.test(
      (attributes.preserveAspectRatio ?? "xMidYMid").trim(),
    )
    ? null
    : {
        shaft: arrow,
        shaftTid: shaftTid,
        x: viewBox[0],
        y: viewBox[1],
        w: viewBox[2],
        h: viewBox[3],
      };
}
function elementFlipRefusal(
  model?: Dynamic,
  tid?: Dynamic,
  inspection?: Dynamic,
  axis?: Dynamic,
): Dynamic {
  let tagName: Dynamic = model.tagName(tid) ?? "";
  if (tagName === "dc-import" || tagName === "x-import")
    return GeometryFlipElementsLabel;
  if (GeometryFlipElementsScIfScForPattern.test(tagName))
    return GeometryFlipElementsLabel_2;
  if (model.isUneditable(tid))
    return ThisComponentManagesItselfSoItMessage;
  if (!inspection) return CouldnTFlipRightNowTryAgainMessage;
  if (inspection.boxless) return ThisOnlyWrapsOtherLayersSoMessage;
  if (inspection.unrendered) return ThisIsnTShownOnThePageMessage;
  let transformText: Dynamic = model.effectiveStyleValue(tid, "transform");
  if (
    inspection.axisProps ||
    (inspection.transformed && ["", "none"].includes(transformText.trim()))
  )
    return GeometryFlipElementsLabel_3;
  let endpoints: Dynamic = getSvgFlipEndpoints(model, tid);
  if (endpoints)
    return (
      axis === "horizontal"
        ? endpoints.shaft.sx === endpoints.shaft.ex &&
          2 * endpoints.x + endpoints.w === 2 * endpoints.shaft.sx
        : endpoints.shaft.sy === endpoints.shaft.ey &&
          2 * endpoints.y + endpoints.h === 2 * endpoints.shaft.sy
    )
      ? FlippingThisWayWouldnTChangeItMessage
      : undefined;
  if (inspection.inline) return GeometryFlipElementsLabel_4;
  if (axis === "horizontal" ? inspection.flat?.x : inspection.flat?.y)
    return axis === "horizontal"
      ? ThisHasNoWidthOfItsMessage
      : ThisHasNoHeightOfItsMessage;
  let flippedTransform: Dynamic = flipElementTransform(transformText, axis, inspection.centre);
  return flippedTransform === null
    ? GeometryFlipElementsLabel_3
    : flippedTransform === "offset"
      ? GeometryFlipElementsLabel_5
      : model.isLoopDriven(tid) &&
          flippedTransform !== flipElementTransform(transformText, axis)
        ? ThisRepeatedElementCanTBeFlippedMessage
        : undefined;
}
function selectionFlipRefusal(
  model?: Dynamic,
  selection?: Dynamic,
  axis?: Dynamic,
  inspections?: Dynamic,
): Dynamic {
  let firstRefusal: Dynamic;
  for (let tid of flipSelectionTargets(model, selection) as Dynamic) {
    let refusal: Dynamic = elementFlipRefusal(
      model,
      tid,
      inspections.get(tid),
      axis,
    );
    if (refusal === undefined) return;
    firstRefusal ??= refusal;
  }
  return firstRefusal;
}
function canFlipSelection(
  model?: Dynamic,
  selection?: Dynamic,
  axis?: Dynamic,
): Dynamic {
  return selectionFlipRefusal(
    model,
    selection,
    axis,
    new Map(
      flipSelectionTargets(model, selection).map(
        (tid?: Dynamic): Dynamic => [
          tid,
          {
            centre: {
              x: 0,
              y: 0,
            },
          },
        ],
      ),
    ),
  );
}
function selectionNeedsFlipInspection(
  model?: Dynamic,
  selection?: Dynamic,
  inspections?: Dynamic,
): Dynamic {
  return flipSelectionTargets(model, selection).some(
    (tid?: Dynamic): Dynamic =>
      elementFlipRefusal(model, tid, inspections.get(tid), "horizontal") ===
      CouldnTFlipRightNowTryAgainMessage,
  );
}
function flipModelSelection(
  model?: Dynamic,
  selection?: Dynamic,
  axis?: Dynamic,
  inspections?: Dynamic,
): Dynamic {
  let targets: Dynamic = flipSelectionTargets(model, selection),
    refusals: Dynamic = targets.map(
      (tid?: Dynamic): Dynamic =>
        elementFlipRefusal(model, tid, inspections.get(tid), axis),
    );
  if (refusals.includes(CouldnTFlipRightNowTryAgainMessage))
    return {
      flipped: [],
      refused: CouldnTFlipRightNowTryAgainMessage,
    };
  let flippedTids: Dynamic = [],
    roundCoordinate: Dynamic = (amount?: Dynamic): Dynamic =>
      Math.round(amount * 1e4) / 1e4 || 0,
    flipXCoordinate: Dynamic = (endpoints?: Dynamic, x?: Dynamic): Dynamic =>
      axis === "horizontal"
        ? roundCoordinate(2 * endpoints.x + endpoints.w - x)
        : x,
    flipYCoordinate: Dynamic = (endpoints?: Dynamic, y?: Dynamic): Dynamic =>
      axis === "vertical"
        ? roundCoordinate(2 * endpoints.y + endpoints.h - y)
        : y;
  targets.forEach((tid?: Dynamic, targetIndex?: Dynamic): Dynamic => {
    if (refusals[targetIndex] !== undefined) return;
    let endpoints: Dynamic = getSvgFlipEndpoints(model, tid);
    if (endpoints) {
      let {
        shaft: shaft,
        sx: startX,
        sy: startY,
        ex: endX,
        ey: endY,
        legacy: isLegacy,
      }: Dynamic = endpoints.shaft;
      if (isLegacy) {
        let pathNumbers: Dynamic = (shaft.getAttribute("d") ?? "")
            .match(/[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g)
            .map(Number),
          pathPoint: Dynamic = (pointIndex?: Dynamic): Dynamic =>
            String(flipXCoordinate(endpoints, pathNumbers[2 * pointIndex])) +
            " " +
            String(flipYCoordinate(endpoints, pathNumbers[2 * pointIndex + 1]));
        model.setAttribute(
          endpoints.shaftTid,
          "d",
          "M " +
            pathPoint(0) +
            " L " +
            pathPoint(1) +
            " M " +
            pathPoint(2) +
            " L " +
            pathPoint(3) +
            " L " +
            pathPoint(4),
        );
      } else
        setSvgLineEndpoints(
          model,
          endpoints.shaftTid,
          flipXCoordinate(endpoints, startX),
          flipYCoordinate(endpoints, startY),
          flipXCoordinate(endpoints, endX),
          flipYCoordinate(endpoints, endY),
        );
    } else {
      let flippedTransform: Dynamic = flipElementTransform(
          model.effectiveStyleValue(tid, "transform"),
          axis,
          inspections.get(tid)?.centre,
        ),
        hadAuthoredTransform: Dynamic =
          getStyleProperty(
            model.classOnlyStyleAttr(tid),
            "transform",
          ) !== "";
      model.setStyleProperty(
        tid,
        "transform",
        flippedTransform || (hadAuthoredTransform ? "none" : null),
      );
    }
    flippedTids.push(tid);
  });
  let refusal: Dynamic =
    refusals.find(
      (candidate?: Dynamic): Dynamic =>
        candidate !== undefined &&
        candidate !== FlippingThisWayWouldnTChangeItMessage,
    ) ??
    (flippedTids.length === 0
      ? refusals.find((candidate?: Dynamic): Dynamic => candidate !== undefined)
      : undefined);
  return refusal === undefined
    ? {
        flipped: flippedTids,
      }
    : {
        flipped: flippedTids,
        refused: refusal,
      };
}
function partialFlipMessage(
  reason?: Dynamic,
  hasFlipped?: Dynamic,
  reasons: Dynamic = {},
): Dynamic {
  let description: Dynamic =
    GeometryFlipElementsYtMytOytConfig[reason] ?? reasons[reason];
  return hasFlipped
    ? description !== undefined
      ? uiMessage("inspector.flipElements.couldnTFlip") + description + ". The rest flipped."
      : uiMessage("inspector.flipElements.partOfTheSelectionCouldn")
    : reason.endsWith(".")
      ? reason
      : reason + ".";
}
export {
  canFlipSelection,
  CouldnTFlipRightNowTryAgainMessage,
  elementFlipRefusal,
  FinishEditingThisDrawingSPointsToMessage,
  flipElementTransform,
  flipModelSelection,
  FlippingThisWayWouldnTChangeItMessage,
  flipSelectionTargets,
  GeometryFlipElementsDegRadTurnConfig,
  GeometryFlipElementsHandler,
  GeometryFlipElementsLabel,
  GeometryFlipElementsLabel_2,
  GeometryFlipElementsLabel_3,
  GeometryFlipElementsLabel_4,
  GeometryFlipElementsLabel_5,
  GeometryFlipElementsLabel_6,
  GeometryFlipElementsLimit,
  GeometryFlipElementsLimit_2,
  GeometryFlipElementsScIfScForPattern,
  GeometryFlipElementsTransformRotateScaleValues,
  GeometryFlipElementsTranslateTranslatexTranslateyConfig,
  GeometryFlipElementsYtMytOytConfig,
  getSvgFlipEndpoints,
  inspectFlipSelection,
  isOrderedSimpleTransform,
  parseFlipInspection,
  partialFlipMessage,
  selectionFlipRefusal,
  selectionNeedsFlipInspection,
  serializeFlipTransform,
  ThisComponentManagesItselfSoItMessage,
  ThisHasNoHeightOfItsMessage,
  ThisHasNoWidthOfItsMessage,
  ThisIsnTShownOnThePageMessage,
  ThisOnlyWrapsOtherLayersSoMessage,
  ThisRepeatedElementCanTBeFlippedMessage,
};
export function installEditorGeometryFlipElements(): () => void {
  return () => {
    GeometryFlipElementsLabel = uiMessage("inspector.flipElements.aComponentInstanceCanT");
    ThisComponentManagesItselfSoItMessage =
      uiMessage("inspector.flipElements.thisComponentManagesItselfSo");
    GeometryFlipElementsLabel_2 =
      uiMessage("inspector.flipElements.aConditionalOrRepeatingGroup");
    ThisOnlyWrapsOtherLayersSoMessage =
      uiMessage("inspector.flipElements.thisOnlyWrapsOtherLayers");
    ThisHasNoWidthOfItsMessage =
      uiMessage("inspector.flipElements.thisHasNoWidthOf");
    ThisHasNoHeightOfItsMessage =
      uiMessage("inspector.flipElements.thisHasNoHeightOf");
    ThisIsnTShownOnThePageMessage =
      uiMessage("inspector.flipElements.thisIsnTShownOn");
    GeometryFlipElementsLabel_3 =
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      uiMessage("inspector.flipElements.itsRotationOrScaleIs");
    GeometryFlipElementsLabel_4 =
      uiMessage("inspector.flipElements.partOfALineOf");
    GeometryFlipElementsLabel_5 =
      uiMessage("inspector.flipElements.itsPositionIsSetIn");
    ThisRepeatedElementCanTBeFlippedMessage =
      uiMessage("inspector.flipElements.thisRepeatedElementCanT");
    FlippingThisWayWouldnTChangeItMessage =
      uiMessage("inspector.flipElements.flippingThisWayWouldnT");
    FinishEditingThisDrawingSPointsToMessage =
      uiMessage("inspector.flipElements.finishEditingThisDrawingS");
    GeometryFlipElementsLabel_6 = uiMessage("inspector.flipElements.finishCroppingToFlip");
    CouldnTFlipRightNowTryAgainMessage =
      uiMessage("inspector.flipElements.couldnTFlipRightNow");
    GeometryFlipElementsYtMytOytConfig = {
      [GeometryFlipElementsLabel]: "a component instance",
      [ThisComponentManagesItselfSoItMessage]:
        "a component that manages itself",
      [GeometryFlipElementsLabel_2]: "a conditional or repeating group",
      [ThisOnlyWrapsOtherLayersSoMessage]: "a layer that only wraps others",
      [ThisHasNoWidthOfItsMessage]: "a layer with no width of its own",
      [ThisHasNoHeightOfItsMessage]: "a layer with no height of its own",
      [ThisIsnTShownOnThePageMessage]: "a hidden layer",
      [GeometryFlipElementsLabel_3]: "an element rotated or scaled in code",
      [GeometryFlipElementsLabel_4]: "part of a line of text",
      [GeometryFlipElementsLabel_5]: "an element positioned in code",
      [ThisRepeatedElementCanTBeFlippedMessage]: "a repeated element",
    };
    GeometryFlipElementsTransformRotateScaleValues = [
      "transform",
      "rotate",
      "scale",
      "translate",
    ];
    GeometryFlipElementsLimit = 1e5;
    GeometryFlipElementsLimit_2 = 1;
    GeometryFlipElementsTranslateTranslatexTranslateyConfig = {
      translate: 0,
      translatex: 0,
      translatey: 0,
      rotate: 1,
      scale: 2,
      scalex: 2,
      scaley: 2,
    };
    GeometryFlipElementsDegRadTurnConfig = {
      deg: Math.PI / 180,
      rad: 1,
      turn: 2 * Math.PI,
      grad: Math.PI / 200,
    };
    GeometryFlipElementsHandler = (amount?: Dynamic): Dynamic =>
      Math.round(amount * 100) / 100 || 0;
    GeometryFlipElementsScIfScForPattern = /^(sc-if|sc-for|helmet|sc-helmet)$/i;
  };
}
