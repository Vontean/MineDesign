/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ClipboardHtmlSanitizationAZPattern, ClipboardHtmlSanitizationExpressionMozBindingPattern, ClipboardHtmlSanitizationScriptDataDcScriptPattern, decodeCssEscapes, removeCssStrings } from "./html-sanitization";
import { isUnsafeCssProperty } from "../css/declarations";

var ClipboardLayoutSnapshotsScriptStyleXmpSet: Dynamic;
var ClipboardLayoutSnapshotsLeftTopRightSet: Dynamic;
var ClipboardLayoutSnapshotsPattern: Dynamic;
var ClipboardLayoutSnapshotsMarginGridAreaConfig: Dynamic;
var ClipboardLayoutSnapshotsBeforeAfterIntoSet: Dynamic;
var ClipboardLayoutSnapshotsIsArray: Dynamic;
var ClipboardLayoutSnapshotsHandler: Dynamic;
var ClipboardLayoutSnapshotsPositivePxPattern: Dynamic;
var ClipboardLayoutSnapshotsStrokeStrokeWidthStrokeLinecapSet: Dynamic;
function normalizeFrozenLayoutStyle(style?: Dynamic): Dynamic {
  let state: Dynamic = {};
  if (typeof style != "object" || style == null) return state;
  for (let [propertyName, propertyValue] of Object.entries(style) as Dynamic) {
    if (Object.hasOwn(ClipboardLayoutSnapshotsMarginGridAreaConfig, propertyName)) {
      propertyValue === ClipboardLayoutSnapshotsMarginGridAreaConfig[propertyName] &&
        (state[propertyName] = propertyValue);
      continue;
    }
    ClipboardLayoutSnapshotsLeftTopRightSet.has(propertyName) &&
      (typeof propertyValue != "string" ||
        !ClipboardLayoutSnapshotsPattern.test(propertyValue) ||
        ((propertyName === "width" || propertyName === "height") &&
          propertyValue.startsWith("-")) ||
        (state[propertyName] = propertyValue));
  }
  return state;
}
function parsePastedElementRects(elements?: Dynamic): Dynamic {
  let values: Dynamic = new Set(),
    items: Dynamic = [];
  for (let element of elements.slice(0, 500) as Dynamic) {
    if (element == null || typeof element != "object") continue;
    let tid: Dynamic = element.tid;
    if (!Number.isInteger(tid) || values.has(tid)) continue;
    let absStyles: Dynamic = normalizeFrozenLayoutStyle(element.absStyles);
    if (Object.keys(absStyles).length === 0) continue;
    values.add(tid);
    let freezeStyle: Dynamic = element.freezeStyle,
      freezeStyleObject: Dynamic =
        freezeStyle != null &&
        typeof freezeStyle == "object" &&
        !Array.isArray(freezeStyle)
          ? freezeStyle
          : undefined;
    items.push({
      tid: tid,
      absStyles: absStyles,
      fixed: element.fixed === true,
      ...(freezeStyleObject
        ? {
            freezeStyle: freezeStyleObject,
          }
        : {}),
    });
  }
  return items;
}
function parsePastedElementKinds(elements?: Dynamic): Dynamic {
  let values: Dynamic = new Set(),
    items: Dynamic = [];
  for (let element of elements.slice(0, 500) as Dynamic) {
    let tid: Dynamic =
      element != null && typeof element == "object" ? element.tid : undefined;
    if (!Number.isInteger(tid) || tid < 0 || values.has(tid))
      continue;
    values.add(tid);
    let freezeStyle: Dynamic = element.freezeStyle;
    items.push({
      tid: tid,
      freezeStyle:
        freezeStyle != null &&
        typeof freezeStyle == "object" &&
        !Array.isArray(freezeStyle)
          ? freezeStyle
          : undefined,
    });
  }
  return items;
}
function parseGroupLayoutSnapshot(rawSnapshot?: Dynamic): Dynamic {
  if (rawSnapshot == null || typeof rawSnapshot != "object") return;
  let snapshot: Dynamic = rawSnapshot,
    parentTid: Dynamic = ClipboardLayoutSnapshotsHandler(snapshot.parentTid);
  if (parentTid === undefined) return;
  let toFiniteNumber: Dynamic = (numericValue?: Dynamic): Dynamic =>
      typeof numericValue == "number" && Number.isFinite(numericValue) ? numericValue : 0,
    siblings: Dynamic = Array.isArray(snapshot.siblings)
      ? snapshot.siblings.slice(0, 200).flatMap((sibling?: Dynamic): Dynamic => {
          if (sibling == null || typeof sibling != "object") return [];
          let siblingRecord: Dynamic = sibling;
          return Number.isInteger(siblingRecord.tid)
            ? [
                {
                  tid: siblingRecord.tid,
                  left: toFiniteNumber(siblingRecord.left),
                  top: toFiniteNumber(siblingRecord.top),
                  w: toFiniteNumber(siblingRecord.w),
                  h: toFiniteNumber(siblingRecord.h),
                  static: siblingRecord.static === true,
                },
              ]
            : [];
        })
      : [];
  return {
    parentTid: parentTid,
    parentStatic: snapshot.parentStatic === true,
    w: toFiniteNumber(snapshot.w),
    h: toFiniteNumber(snapshot.h),
    siblings: siblings,
  };
}
function parseElementMoveSnapshot(
  rawMove?: Dynamic,
  movableTids?: Dynamic,
): Dynamic {
  if (rawMove == null || typeof rawMove != "object") return null;
  let move: Dynamic = rawMove;
  if (
    !Number.isInteger(move.tid) ||
    !movableTids.includes(move.tid) ||
    move.alt === true
  )
    return null;
  let targetTid: Dynamic = ClipboardLayoutSnapshotsHandler(move.targetTid);
  if (
    targetTid === undefined ||
    typeof move.position != "string" ||
    !ClipboardLayoutSnapshotsBeforeAfterIntoSet.has(move.position)
  )
    return null;
  let isAbsolute: Dynamic = move.absolute === true,
    followers: Dynamic = Array.isArray(move.followers)
      ? parsePastedElementRects(move.followers).filter(
          (follower?: Dynamic): Dynamic => movableTids.includes(follower.tid),
        )
      : undefined,
    group: Dynamic = Array.isArray(move.group)
      ? parsePastedElementKinds(move.group).filter(
          (groupItem?: Dynamic): Dynamic => movableTids.includes(groupItem.tid),
        )
      : undefined;
  return {
    tid: move.tid,
    targetTid: targetTid,
    position: move.position,
    alt: move.alt === true,
    absolute: isAbsolute,
    ...(move.breakout === true
      ? {
          breakout: true,
        }
      : {}),
    ...(move.fixed === true
      ? {
          fixed: true,
        }
      : {}),
    ...(move.absStyles != null
      ? {
          absStyles: normalizeFrozenLayoutStyle(move.absStyles),
        }
      : {}),
    ...(move.parentNeedsPositioning === true
      ? {
          parentNeedsPositioning: true,
        }
      : {}),
    ...(isAbsolute && move.flatten != null
      ? {
          flatten: parseGroupLayoutSnapshot(move.flatten),
        }
      : {}),
    ...(followers && followers.length > 0
      ? {
          followers: followers,
        }
      : {}),
    ...(group && group.length > 0
      ? {
          group: group,
        }
      : {}),
    block: null,
    ...(move.clearPositioning === true
      ? {
          clearPositioning: true,
        }
      : {}),
    ...(ClipboardLayoutSnapshotsIsArray(move.freezeStyle)
      ? {
          freezeStyle: ClipboardLayoutSnapshotsIsArray(move.freezeStyle),
        }
      : {}),
  };
}
function parseGroupMoveSnapshot(rawMove?: Dynamic, memberTids?: Dynamic): Dynamic {
  if (rawMove == null || typeof rawMove != "object") return null;
  let move: Dynamic = rawMove,
    container: Dynamic = ClipboardLayoutSnapshotsHandler(move.container);
  if (
    container === undefined ||
    !Array.isArray(move.members) ||
    move.members.length > 500
  )
    return null;
  let landingMoves: Dynamic = [],
    refusedTids: Dynamic = [],
    handledTids: Dynamic = new Set();
  for (let member of move.members as Dynamic) {
    if (member == null || typeof member != "object") continue;
    let memberRecord: Dynamic = member;
    if (
      !Number.isInteger(memberRecord.tid) ||
      !memberTids.includes(memberRecord.tid) ||
      handledTids.has(memberRecord.tid)
    )
      continue;
    if (typeof memberRecord.refused == "string") {
      handledTids.add(memberRecord.tid);
      refusedTids.push(memberRecord.tid);
      continue;
    }
    let targetTid: Dynamic = ClipboardLayoutSnapshotsHandler(memberRecord.targetTid);
    if (
      targetTid === undefined ||
      typeof memberRecord.position != "string" ||
      !ClipboardLayoutSnapshotsBeforeAfterIntoSet.has(memberRecord.position) ||
      (memberRecord.position === "root-end" ? targetTid !== null : targetTid === null)
    )
      continue;
    let isAbsolute: Dynamic = memberRecord.absolute === true;
    if (
      isAbsolute &&
      memberRecord.position !== "into" &&
      memberRecord.position !== "root-end"
    )
      continue;
    let absStyles: Dynamic = isAbsolute
        ? normalizeFrozenLayoutStyle(memberRecord.absStyles)
        : undefined,
      positionStyles: Dynamic = absStyles
        ? Object.fromEntries(
            Object.entries(absStyles).filter(
              ([propertyName]: Dynamic): Dynamic =>
                propertyName === "left" ||
                propertyName === "top" ||
                propertyName === "width" ||
                propertyName === "height",
            ),
          )
        : undefined;
    (isAbsolute && (!positionStyles || !("left" in positionStyles) || !("top" in positionStyles))) ||
      (handledTids.add(memberRecord.tid),
      landingMoves.push({
        tid: memberRecord.tid,
        targetTid: targetTid,
        position: memberRecord.position,
        absolute: isAbsolute,
        ...(positionStyles
          ? {
              absStyles: positionStyles,
            }
          : {}),
        ...(memberRecord.parentNeedsPositioning === true && targetTid !== null
          ? {
              parentNeedsPositioning: true,
            }
          : {}),
      }));
  }
  for (let tid of memberTids as Dynamic)
    handledTids.has(tid) || refusedTids.push(tid);
  return {
    container: container,
    landing: landingMoves,
    refused: refusedTids,
  };
}
function normalizePasteScale(scale?: Dynamic): Dynamic {
  return scale === undefined
    ? 1
    : typeof scale == "number" &&
        Number.isFinite(scale) &&
        scale > 1e-4 &&
        scale < 1e4
      ? scale
      : null;
}
function normalizeSvgStrokeProperties(properties?: Dynamic): Dynamic {
  let state: Dynamic = {};
  if (properties == null || typeof properties != "object") return state;
  for (let [propertyName, propertyValue] of Object.entries(properties) as Dynamic)
    ClipboardLayoutSnapshotsStrokeStrokeWidthStrokeLinecapSet.has(propertyName) &&
      typeof propertyValue == "string" &&
      propertyValue.length <= 64 &&
      (/^(?![\s\S]*url\()[\w #(),.%\/-]+$/i.test(propertyValue) ||
        /^url\((#[\w-]+|"#[\w-]+")\)$/.test(propertyValue)) &&
      (state[propertyName] = propertyValue);
  return state;
}
function parseVectorElements(elements?: Dynamic): Dynamic {
  let items: Dynamic = [];
  if (!Array.isArray(elements)) return items;
  let seenTids: Dynamic = new Set(),
    isReasonableNumber: Dynamic = (numericValue?: Dynamic): Dynamic =>
      typeof numericValue == "number" &&
      Number.isFinite(numericValue) &&
      Math.abs(numericValue) < 1e6;
  for (let element of elements.slice(0, 500) as Dynamic) {
    if (element == null || typeof element != "object") continue;
    let {
      tid: tid,
      styles: styles,
      angle: angle,
      stroke: stroke,
      fixed: fixed,
    }: Dynamic = element;
    if (!Number.isInteger(tid) || tid < 0 || seenTids.has(tid))
      continue;
    let state: Dynamic = {
      tid: tid,
    };
    if (typeof styles == "object" && styles != null) {
      let normalizedStyles: Dynamic = normalizeFrozenLayoutStyle(styles),
        styleOverrides: Dynamic = {};
      for (let edge of ["left", "top", "right", "bottom"] as Dynamic)
        normalizedStyles[edge] !== undefined && (styleOverrides[edge] = normalizedStyles[edge]);
      for (let dimension of ["width", "height"] as Dynamic) {
        let dimensionValue: Dynamic = styles[dimension];
        typeof dimensionValue == "string" &&
          ClipboardLayoutSnapshotsPositivePxPattern.test(dimensionValue) &&
          parseFloat(dimensionValue) >= 1 &&
          (styleOverrides[dimension] = dimensionValue);
      }
      styleOverrides.left !== undefined && delete styleOverrides.right;
      styleOverrides.top !== undefined && delete styleOverrides.bottom;
      Object.keys(styleOverrides).length > 0 && (state.styles = styleOverrides);
    }
    fixed === true && (state.fixed = true);
    typeof angle == "number" &&
      Number.isFinite(angle) &&
      Math.abs(angle) <= 360 &&
      (state.angle = angle);
    if (typeof stroke == "object" && stroke != null) {
      let strokeRecord: Dynamic = stroke,
        unitScale: Dynamic = normalizePasteScale(strokeRecord.unitScale);
      unitScale != null &&
        isReasonableNumber(strokeRecord.left) &&
        isReasonableNumber(strokeRecord.top) &&
        isReasonableNumber(strokeRecord.width) &&
        isReasonableNumber(strokeRecord.height) &&
        typeof strokeRecord.d == "string" &&
        strokeRecord.d.length <= 256 &&
        /^[MLZE\d\s.,-]+$/i.test(strokeRecord.d) &&
        (state.stroke = {
          left: strokeRecord.left,
          top: strokeRecord.top,
          width: Math.max(1, strokeRecord.width),
          height: Math.max(1, strokeRecord.height),
          d: strokeRecord.d,
          isArrow: strokeRecord.isArrow === true,
          unitScale: unitScale,
          paint: normalizeSvgStrokeProperties(strokeRecord.paint),
          svgPaint: normalizeSvgStrokeProperties(strokeRecord.svgPaint),
        });
    }
    (state.styles || state.angle !== undefined || state.stroke) &&
      (seenTids.add(state.tid), items.push(state));
  }
  return items;
}
function normalizeComputedStyleCarry(styles?: Dynamic): Dynamic {
  let state: Dynamic = {};
  if (typeof styles != "object" || styles == null) return state;
  for (let [propertyName, propertyValue] of Object.entries(styles) as Dynamic) {
    if (
      !/^(?:--[A-Za-z0-9_-]+|-?[A-Za-z][A-Za-z0-9-]*)$/.test(propertyName) ||
      isUnsafeCssProperty(propertyName) ||
      ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(
        propertyName,
      ) ||
      typeof propertyValue != "string"
    )
      continue;
    let trimmedValue: Dynamic = propertyValue.trim();
    trimmedValue.length === 0 ||
      trimmedValue.length > 2048 ||
      /;|[\r\n]/.test(trimmedValue) ||
      /\\$/.test(trimmedValue) ||
      ClipboardHtmlSanitizationExpressionMozBindingPattern.test(
        decodeCssEscapes(trimmedValue).replace(
          /[\u0000\t\n\r\f]/g,
          "",
        ),
      ) ||
      ClipboardHtmlSanitizationAZPattern.test(
        decodeCssEscapes(
          removeCssStrings(trimmedValue),
        ).replace(/[\u0000\t\n\r\f]/g, ""),
      ) ||
      ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(
        trimmedValue,
      ) ||
      (state[propertyName] = trimmedValue);
  }
  return state;
}
export {
  ClipboardLayoutSnapshotsBeforeAfterIntoSet,
  ClipboardLayoutSnapshotsHandler,
  ClipboardLayoutSnapshotsIsArray,
  ClipboardLayoutSnapshotsLeftTopRightSet,
  ClipboardLayoutSnapshotsMarginGridAreaConfig,
  ClipboardLayoutSnapshotsPattern,
  ClipboardLayoutSnapshotsPositivePxPattern as ClipboardLayoutSnapshotsPattern_2,
  ClipboardLayoutSnapshotsScriptStyleXmpSet,
  ClipboardLayoutSnapshotsStrokeStrokeWidthStrokeLinecapSet,
  normalizeComputedStyleCarry,
  normalizeFrozenLayoutStyle,
  normalizePasteScale,
  normalizeSvgStrokeProperties,
  parseElementMoveSnapshot,
  parseGroupLayoutSnapshot,
  parseGroupMoveSnapshot,
  parsePastedElementKinds,
  parsePastedElementRects,
  parseVectorElements,
};
export function installEditorClipboardLayoutSnapshots(): () => void {
  return () => {
    ClipboardLayoutSnapshotsScriptStyleXmpSet = new Set([
      "script",
      "style",
      "xmp",
      "iframe",
      "noembed",
      "noframes",
      "plaintext",
      "noscript",
    ]);
    ClipboardLayoutSnapshotsLeftTopRightSet = new Set([
      "left",
      "top",
      "right",
      "bottom",
      "width",
      "height",
    ]);
    ClipboardLayoutSnapshotsPattern = /^-?\d{1,6}(?:\.\d{1,4})?px$/;
    ClipboardLayoutSnapshotsMarginGridAreaConfig = {
      margin: "0px",
      "grid-area": "auto",
    };
    ClipboardLayoutSnapshotsBeforeAfterIntoSet = new Set([
      "before",
      "after",
      "into",
      "root-end",
    ]);
    ClipboardLayoutSnapshotsIsArray = (candidate?: Dynamic): Dynamic =>
      candidate != null && typeof candidate == "object" && !Array.isArray(candidate)
        ? candidate
        : undefined;
    ClipboardLayoutSnapshotsHandler = (tid?: Dynamic): Dynamic =>
      tid == null
        ? null
        : Number.isInteger(tid) && tid >= 0 && tid <= 1e6
          ? tid
          : undefined;
    ClipboardLayoutSnapshotsPositivePxPattern = /^\d{1,6}(?:\.\d{1,4})?px$/;
    ClipboardLayoutSnapshotsStrokeStrokeWidthStrokeLinecapSet = new Set([
      "stroke",
      "stroke-width",
      "stroke-linecap",
      "stroke-linejoin",
      "stroke-dasharray",
      "stroke-dashoffset",
      "stroke-opacity",
      "stroke-miterlimit",
      "vector-effect",
    ]);
  };
}
