import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { FlippingThisWayWouldnTChangeItMessage } from "./flip-elements";
import { annotationRotation, isShapeAnnotation, normalizeRotationDegrees, PlatformFileContentTrim_2 } from "../../platform/file-content";

var GeometryFlipAnnotationsLabel: Dynamic;
var ThisDrawingHasTooManyPointsMessage: Dynamic;
var ThisDrawingSSavedPathCouldnTBeMessage: Dynamic;
var GeometryFlipAnnotationsLabel_2: Dynamic;
var PartOfTheSelectionCouldnTBeMessage: Dynamic;
var GeometryFlipAnnotationsLabel_3: Dynamic;
var GeometryFlipAnnotationsWytKytYtConfig: Dynamic;
var CropDoesNotWorkWhileThisMessage: Dynamic;
var GeometryFlipAnnotationsPattern: Dynamic;
var GeometryFlipAnnotationsHandler: Dynamic;
var GeometryFlipAnnotationsConstant: Dynamic;
function flipAnnotationPen(penAnnotation?: Dynamic, axis?: Dynamic): Dynamic {
  let coordParity: Dynamic = axis === "horizontal" ? 0 : 1,
    numberTexts: Dynamic = penAnnotation.d.match(GeometryFlipAnnotationsPattern) ?? [],
    axisCoords: Dynamic = numberTexts
      .map(Number)
      .filter(
        (coord?: Dynamic, coordIndex?: Dynamic): Dynamic =>
          coordIndex % 2 === coordParity,
      ),
    [minCoord, maxCoord]: Dynamic = [Math.min(...axisCoords), Math.max(...axisCoords)],
    decimals: Dynamic = Math.min(
      GeometryFlipAnnotationsConstant,
      Math.max(
        0,
        ...numberTexts.map(
          (numberText?: Dynamic): Dynamic => (numberText.split(".")[1] ?? "").length,
        ),
      ),
    ),
    formatNumber: Dynamic = (value?: Dynamic): Dynamic =>
      decimals > 0
        ? value.toFixed(decimals).replace(/\.?0+$/, "")
        : value.toFixed(0),
    index: Dynamic = 0,
    flippedPath: Dynamic = penAnnotation.d.replace(
      GeometryFlipAnnotationsPattern,
      (matchedNumber?: Dynamic): Dynamic =>
        index++ % 2 === coordParity
          ? formatNumber(minCoord + maxCoord - Number(matchedNumber))
          : matchedNumber,
    ),
    [rotation, flippedRotation]: Dynamic = [
      annotationRotation(penAnnotation),
      normalizeRotationDegrees(
        -annotationRotation(penAnnotation),
      ),
    ];
  if (flippedPath === penAnnotation.d && flippedRotation === rotation) return "same";
  if (PlatformFileContentTrim_2(flippedPath) !== flippedPath) return null;
  let fromState: Dynamic = {
      d: penAnnotation.d,
      ...(flippedRotation !== rotation
        ? {
            rotate: rotation,
          }
        : {}),
    },
    toState: Dynamic = {
      d: flippedPath,
      ...(flippedRotation !== rotation
        ? {
            rotate: flippedRotation,
          }
        : {}),
    },
    allCoords: Dynamic = numberTexts.map(Number),
    xCoords: Dynamic = allCoords.filter(
      (coord?: Dynamic, coordIndex?: Dynamic): Dynamic => coordIndex % 2 === 0,
    ),
    yCoords: Dynamic = allCoords.filter(
      (coord?: Dynamic, coordIndex?: Dynamic): Dynamic => coordIndex % 2 === 1,
    ),
    centerOffset: Dynamic = (coords?: Dynamic, size?: Dynamic): Dynamic =>
      ((Math.min(...coords) + Math.max(...coords)) /
        2 /
        Math.max(1, ...coords) -
        0.5) *
      size,
    sinRotation: Dynamic = Math.sin((rotation * Math.PI) / 180),
    [shiftX, shiftY]: Dynamic = [
      GeometryFlipAnnotationsHandler(
        -2 * centerOffset(yCoords, penAnnotation.h) * sinRotation,
      ),
      GeometryFlipAnnotationsHandler(2 * centerOffset(xCoords, penAnnotation.w) * sinRotation),
    ];
  shiftX !== 0 &&
    ([fromState.x, toState.x] = [
      penAnnotation.x,
      GeometryFlipAnnotationsHandler(penAnnotation.x + shiftX),
    ]);
  shiftY !== 0 &&
    ([fromState.y, toState.y] = [
      penAnnotation.y,
      GeometryFlipAnnotationsHandler(penAnnotation.y + shiftY),
    ]);
  return {
    id: penAnnotation.id,
    from: fromState,
    to: toState,
  };
}
function flipAnnotation(source?: Dynamic, axis?: Dynamic): Dynamic {
  if (!isShapeAnnotation(source))
    return GeometryFlipAnnotationsLabel;
  if (source.kind === "pen")
    try {
      let penFlip: Dynamic = flipAnnotationPen(source, axis);
      return penFlip === "same"
        ? null
        : (penFlip ?? ThisDrawingHasTooManyPointsMessage);
    } catch {
      return ThisDrawingSSavedPathCouldnTBeMessage;
    }
  if (source.kind === "line" || source.kind === "arrow")
    return (
      axis === "horizontal"
        ? source.x === source.x2
        : source.y === source.y2
    )
      ? null
      : axis === "horizontal"
        ? {
            id: source.id,
            from: {
              x: source.x,
              x2: source.x2,
            },
            to: {
              x: source.x2,
              x2: source.x,
            },
          }
        : {
            id: source.id,
            from: {
              y: source.y,
              y2: source.y2,
            },
            to: {
              y: source.y2,
              y2: source.y,
            },
          };
  let flipKey: Dynamic = axis === "horizontal" ? "flipX" : "flipY",
    [rotation, flippedRotation]: Dynamic = [
      annotationRotation(source),
      normalizeRotationDegrees(
        -annotationRotation(source),
      ),
    ];
  return {
    id: source.id,
    from: {
      [flipKey]: source[flipKey],
      ...(flippedRotation !== rotation
        ? {
            rotate: rotation,
          }
        : {}),
    },
    to: {
      [flipKey]: source[flipKey] === true ? undefined : true,
      ...(flippedRotation !== rotation
        ? {
            rotate: flippedRotation,
          }
        : {}),
    },
  };
}
function flipAnnotations(annotations?: Dynamic, axis?: Dynamic): Dynamic {
  let flipResults: Dynamic = annotations.map(
      (annotation?: Dynamic): Dynamic => flipAnnotation(annotation, axis),
    ),
    refusal: Dynamic =
      flipResults.find((flipResult?: Dynamic): Dynamic => typeof flipResult == "string") ??
      (flipResults.length > 0 &&
      flipResults.every((flipResult?: Dynamic): Dynamic => flipResult === null)
        ? FlippingThisWayWouldnTChangeItMessage
        : undefined),
    flips: Dynamic = flipResults.filter(
      (flipResult?: Dynamic): Dynamic =>
        flipResult !== null && typeof flipResult != "string",
    );
  return refusal === undefined
    ? {
        flips: flips,
      }
    : {
        flips: flips,
        refused: refusal,
      };
}
function imageFlipCss(image?: Dynamic): Dynamic {
  return image.flipX === true || image.flipY === true
    ? {
        transform:
          "scale(" +
          (image.flipX === true ? "-1" : "1") +
          ", " +
          (image.flipY === true ? "-1" : "1") +
          ")",
      }
    : undefined;
}
export {
  CropDoesNotWorkWhileThisMessage,
  flipAnnotation,
  flipAnnotationPen,
  flipAnnotations,
  GeometryFlipAnnotationsConstant,
  GeometryFlipAnnotationsHandler,
  GeometryFlipAnnotationsLabel,
  GeometryFlipAnnotationsLabel_2,
  GeometryFlipAnnotationsLabel_3,
  GeometryFlipAnnotationsPattern,
  GeometryFlipAnnotationsWytKytYtConfig,
  imageFlipCss,
  PartOfTheSelectionCouldnTBeMessage,
  ThisDrawingHasTooManyPointsMessage,
  ThisDrawingSSavedPathCouldnTBeMessage,
};
export function installEditorGeometryFlipAnnotations(): () => void {
  return () => {
    GeometryFlipAnnotationsLabel = uiMessage("inspector.flipAnnotations.notesAndTitlesCanT");
    ThisDrawingHasTooManyPointsMessage =
      uiMessage("inspector.flipAnnotations.thisDrawingHasTooMany");
    ThisDrawingSSavedPathCouldnTBeMessage =
      uiMessage("inspector.flipAnnotations.thisDrawingSSavedPath");
    GeometryFlipAnnotationsLabel_2 =
      uiMessage("inspector.flipAnnotations.artboardsCanTBeFlipped");
    PartOfTheSelectionCouldnTBeMessage =
      uiMessage("inspector.flipAnnotations.partOfTheSelectionCouldn");
    GeometryFlipAnnotationsLabel_3 = uiMessage("inspector.flipAnnotations.stillFinishingTheLastFlip");
    GeometryFlipAnnotationsWytKytYtConfig = {
      [GeometryFlipAnnotationsLabel]: "notes and titles",
      [ThisDrawingHasTooManyPointsMessage]: "a drawing with too many points",
      [ThisDrawingSSavedPathCouldnTBeMessage]:
        "a drawing whose saved path couldn\u2019t be read",
    };
    CropDoesNotWorkWhileThisMessage =
      uiMessage("inspector.flipAnnotations.cropDoesNotWorkWhile");
    GeometryFlipAnnotationsPattern = /\d+(?:\.\d+)?/g;
    GeometryFlipAnnotationsHandler = (value?: Dynamic): Dynamic =>
      Math.round(value * 100) / 100 || 0;
    GeometryFlipAnnotationsConstant = 6;
  };
}
