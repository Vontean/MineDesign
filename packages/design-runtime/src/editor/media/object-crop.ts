import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { imageCropVisibleRect } from "./crop-geometry";
import { isSafeProjectPath } from "../../platform/file-content";

var supportsObjectViewBox: Dynamic;
var ThisBrowserCanTZoomAPictureMessage: Dynamic;
var YouCanTCropAnyFurtherAtMessage: Dynamic;
var ThePageLayoutPlacesTheTopMessage: Dynamic;
var objectPositionPattern: Dynamic;
var insetClipPathPattern: Dynamic;
var clampUnit: Dynamic;
var positionToFraction: Dynamic;
var isObjectCropStyle: Dynamic;
var minVisibleFraction: Dynamic;
var maxCropZoom: Dynamic;
var exceedsMaxZoom: Dynamic;
var clampCropToBounds: Dynamic;
var formatPercent: Dynamic;
function isEditableComponentName(name?: Dynamic): Dynamic {
  return (
    typeof name == "string" &&
    name.length > 0 &&
    name.length <= 128 &&
    !name.includes("/") &&
    isSafeProjectPath(name + ".dc.html")
  );
}
function parseObjectPosition(text?: Dynamic): Dynamic {
  let matches: Dynamic = text
    .trim()
    .split(/\s+/)
    .map((token?: Dynamic): Dynamic => objectPositionPattern.exec(token));
  if (matches.length !== 2 || !matches[0] || !matches[1]) return null;
  let toCoordinate: Dynamic = (match?: Dynamic): Dynamic => ({
    v: parseFloat(match[1]),
    unit: match[2],
  });
  return [toCoordinate(matches[0]), toCoordinate(matches[1])];
}
function parseObjectClipPath(text?: Dynamic): Dynamic {
  if (text === "" || text === "none") return null;
  let insetMatch: Dynamic = insetClipPathPattern.exec(text.trim());
  if (!insetMatch) return;
  let fractions: Dynamic = insetMatch[1]
      .trim()
      .split(" ")
      .map((token?: Dynamic): Dynamic => parseFloat(token) / 100),
    [top, right, bottom, left]: Dynamic = [
      fractions[0],
      fractions[1] ?? fractions[0],
      fractions[2] ?? fractions[0],
      fractions[3] ?? fractions[1] ?? fractions[0],
    ];
  return top + bottom < 1 && left + right < 1
    ? [top, right, bottom, left]
    : undefined;
}
function cropFromObjectStyles(
  frame?: Dynamic,
  naturalSize?: Dynamic,
  styles?: Dynamic,
): Dynamic {
  let coverScale: Dynamic = Math.max(frame.w / naturalSize.w, frame.h / naturalSize.h),
    [boxX, boxY, boxWidth, boxHeight]: Dynamic = styles.box
      ? [
          styles.box[3] * naturalSize.w,
          styles.box[0] * naturalSize.h,
          naturalSize.w * (1 - styles.box[3] - styles.box[1]),
          naturalSize.h * (1 - styles.box[0] - styles.box[2]),
        ]
      : [0, 0, naturalSize.w, naturalSize.h],
    boxScale: Dynamic = Math.max(frame.w / boxWidth, frame.h / boxHeight),
    visibleX: Dynamic =
      boxX +
      (boxWidth - frame.w / boxScale) *
        positionToFraction(styles.pos?.[0], frame.w - boxWidth * boxScale),
    visibleY: Dynamic =
      boxY +
      (boxHeight - frame.h / boxScale) *
        positionToFraction(styles.pos?.[1], frame.h - boxHeight * boxScale),
    zoom: Dynamic = Math.max(1, boxScale / coverScale),
    [overflowX, overflowY]: Dynamic = [
      naturalSize.w * coverScale * zoom - frame.w,
      naturalSize.h * coverScale * zoom - frame.h,
    ];
  return {
    zoom: zoom,
    x:
      overflowX > 1e-6
        ? clampUnit((visibleX * coverScale * zoom) / overflowX)
        : 0.5,
    y:
      overflowY > 1e-6
        ? clampUnit((visibleY * coverScale * zoom) / overflowY)
        : 0.5,
  };
}
function imageCropStyleEdits(
  frame?: Dynamic,
  naturalSize?: Dynamic,
  crop?: Dynamic,
  supportsViewBox: Dynamic = supportsObjectViewBox(),
): Dynamic {
  let visibleRect: Dynamic = imageCropVisibleRect(
      frame,
      naturalSize,
      crop,
    ),
    clipPath: Dynamic =
      crop.zoom > 1
        ? "inset(" +
          [
            visibleRect.y,
            1 - visibleRect.x - visibleRect.w,
            1 - visibleRect.y - visibleRect.h,
            visibleRect.x,
          ]
            .map(formatPercent)
            .join(" ") +
          ")"
        : null;
  return [
    ["object-fit", "cover"],
    [
      "object-position",
      formatPercent(crop.x) +
        " " +
        formatPercent(crop.y),
    ],
    ...(supportsViewBox ? [["object-view-box", clipPath]] : []),
  ];
}
export {
  cropFromObjectStyles,
  imageCropStyleEdits,
  isEditableComponentName,
  positionToFraction as MediaObjectCropAbs,
  minVisibleFraction as MediaObjectCropConstant,
  clampCropToBounds as MediaObjectCropEvery,
  formatPercent as MediaObjectCropHandler,
  insetClipPathPattern as MediaObjectCropInsetPattern,
  maxCropZoom as MediaObjectCropMax,
  clampUnit as MediaObjectCropMin,
  objectPositionPattern as MediaObjectCropPattern,
  supportsObjectViewBox as MediaObjectCropSupports,
  isObjectCropStyle as MediaObjectCropTest,
  exceedsMaxZoom as MediaObjectCropZoom,
  parseObjectClipPath,
  parseObjectPosition,
  ThePageLayoutPlacesTheTopMessage,
  ThisBrowserCanTZoomAPictureMessage,
  YouCanTCropAnyFurtherAtMessage,
};
export function installEditorMediaObjectCrop(): () => void {
  return () => {
    supportsObjectViewBox = (): Dynamic =>
      typeof CSS !== "undefined" &&
      typeof CSS.supports == "function" &&
      CSS.supports("object-view-box", "inset(0%)");
    ThisBrowserCanTZoomAPictureMessage =
      uiMessage("inspector.objectCrop.thisBrowserCanTZoom");
    YouCanTCropAnyFurtherAtMessage =
      uiMessage("inspector.objectCrop.youCanTCropAny");
    ThePageLayoutPlacesTheTopMessage =
      uiMessage("inspector.objectCrop.thePageLayoutPlacesThe");
    objectPositionPattern = /^(-?\d+(?:\.\d+)?)(%|px)$/;
    insetClipPathPattern = /^inset\(((?:\d+(?:\.\d+)?% ?){1,4})\)$/;
    clampUnit = (rawFraction?: Dynamic): Dynamic =>
      Math.min(1, Math.max(0, rawFraction));
    positionToFraction = (position?: Dynamic, overflow?: Dynamic): Dynamic =>
      position === undefined || Math.abs(overflow) < 1e-6
        ? 0.5
        : clampUnit(
            position.unit === "%" ? position.v / 100 : position.v / overflow,
          );
    isObjectCropStyle = (readStyle?: Dynamic): Dynamic =>
      readStyle("object-fit") === "cover" &&
      (!!readStyle("object-view-box") ||
        /^\d{1,3}(\.\d{1,4})?% \d{1,3}(\.\d{1,4})?%$/.test(
          (readStyle("object-position") ?? "").trim(),
        ));
    minVisibleFraction = 0.01;
    maxCropZoom = (frame?: Dynamic, naturalSize?: Dynamic): Dynamic => {
      let coverScale: Dynamic = Math.max(frame.w / naturalSize.w, frame.h / naturalSize.h);
      return Math.max(
        1,
        Math.min(frame.w / (naturalSize.w * coverScale), frame.h / (naturalSize.h * coverScale)) /
          minVisibleFraction,
      );
    };
    exceedsMaxZoom = (
      frame?: Dynamic,
      naturalSize?: Dynamic,
      crop?: Dynamic,
    ): Dynamic =>
      crop.zoom > maxCropZoom(frame, naturalSize) * (1 + 1e-9);
    clampCropToBounds = (
      frame?: Dynamic,
      naturalSize?: Dynamic,
      crop?: Dynamic,
    ): Dynamic =>
      [crop.zoom, crop.x, crop.y].every(Number.isFinite)
        ? exceedsMaxZoom(frame, naturalSize, crop)
          ? {
              ...crop,
              zoom: maxCropZoom(frame, naturalSize),
            }
          : crop
        : {
            zoom: 1,
            x: 0.5,
            y: 0.5,
          };
    formatPercent = (fraction?: Dynamic): Dynamic =>
      String(Math.round(clampUnit(fraction) * 1e6) / 1e4) + "%";
  };
}
