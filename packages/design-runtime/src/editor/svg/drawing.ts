/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { createArrowHeadId, defaultArrowHeadDefs, shortenLineEnd, arrowHeadTipInset } from "./arrows";

var SvgDrawingConstant: Dynamic;
var minSvgBoundingBoxSize: Dynamic;
function svgStrokeHtml(
  width?: Dynamic,
  height?: Dynamic,
  pathData?: Dynamic,
  style?: Dynamic,
  markerKind?: Dynamic,
  markerId: Dynamic = null,
): Dynamic {
  return (
    `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" style="${style}width: ${width}px; height: ${height}px; overflow: visible; fill: none; stroke: ${markerKind}; stroke-width: ${SvgDrawingConstant}; stroke-linecap: round; stroke-linejoin: round">` +
    (markerId ? defaultArrowHeadDefs(markerId, markerKind) : "") +
    `<path d="${pathData}"${markerId ? ` marker-end="url(#${markerId})"` : ""}></path></svg>`
  );
}
function lineDrawingInset(width?: Dynamic, height?: Dynamic): Dynamic {
  return {
    dx: (Math.max(width, minSvgBoundingBoxSize) - width) / 2,
    dy: (Math.max(height, minSvgBoundingBoxSize) - height) / 2,
  };
}
function lineDrawingBox(
  width?: Dynamic,
  height?: Dynamic,
  horizontalDirection?: Dynamic,
  verticalDirection?: Dynamic,
): Dynamic {
  let boxWidth: Dynamic = Math.max(width, minSvgBoundingBoxSize),
    boxHeight: Dynamic = Math.max(height, minSvgBoundingBoxSize),
    insetX: Dynamic = (boxWidth - width) / 2,
    insetY: Dynamic = (boxHeight - height) / 2,
    startX: Dynamic = insetX + (horizontalDirection === 1 ? 0 : width),
    startY: Dynamic = insetY + (verticalDirection === 1 ? 0 : height);
  return {
    bw: boxWidth,
    bh: boxHeight,
    sx: startX,
    sy: startY,
    ex: insetX + (horizontalDirection === 1 ? width : 0),
    ey: insetY + (verticalDirection === 1 ? height : 0),
  };
}
function arrowDrawingHtml(
  width?: Dynamic,
  height?: Dynamic,
  horizontalDirection?: Dynamic,
  verticalDirection?: Dynamic,
  markerKind?: Dynamic,
  markerId?: Dynamic,
): Dynamic {
  let {
      bw: boxWidth,
      bh: boxHeight,
      sx: startX,
      sy: startY,
      ex: endX,
      ey: endY,
    }: Dynamic = lineDrawingBox(width, height, horizontalDirection, verticalDirection),
    shortenedEnd: Dynamic = shortenLineEnd(
      startX,
      startY,
      endX,
      endY,
      arrowHeadTipInset * SvgDrawingConstant,
    );
  return svgStrokeHtml(
    boxWidth,
    boxHeight,
    `M ${startX} ${startY} L ${shortenedEnd.x} ${shortenedEnd.y}`,
    markerKind,
    markerId,
    createArrowHeadId(),
  );
}
function lineDrawingHtml(
  width?: Dynamic,
  height?: Dynamic,
  horizontalDirection?: Dynamic,
  verticalDirection?: Dynamic,
  markerKind?: Dynamic,
  markerId?: Dynamic,
): Dynamic {
  let {
    bw: boxWidth,
    bh: boxHeight,
    sx: startX,
    sy: startY,
    ex: endX,
    ey: endY,
  }: Dynamic = lineDrawingBox(width, height, horizontalDirection, verticalDirection);
  return svgStrokeHtml(
    boxWidth,
    boxHeight,
    `M ${startX} ${startY} L ${endX} ${endY}`,
    markerKind,
    markerId,
  );
}
function constrainLineAngle(startPoint?: Dynamic, endPoint?: Dynamic): Dynamic {
  let value: Dynamic = endPoint.x - startPoint.x,
    deltaY: Dynamic = endPoint.y - startPoint.y,
    distance: Dynamic = Math.hypot(value, deltaY),
    octant: Dynamic =
      ((Math.round(Math.atan2(deltaY, value) / (Math.PI / 4)) % 8) + 8) % 8,
    reciprocalSqrt2: Dynamic = Math.SQRT1_2,
    directionX: Dynamic = [1, reciprocalSqrt2, 0, -reciprocalSqrt2, -1, -reciprocalSqrt2, 0, reciprocalSqrt2][
      octant
    ],
    directionY: Dynamic = [0, reciprocalSqrt2, 1, reciprocalSqrt2, 0, -reciprocalSqrt2, -1, -reciprocalSqrt2][
      octant
    ];
  return {
    x: startPoint.x + distance * directionX,
    y: startPoint.y + distance * directionY,
  };
}
export {
  arrowDrawingHtml,
  constrainLineAngle,
  lineDrawingBox,
  lineDrawingHtml,
  lineDrawingInset,
  SvgDrawingConstant,
  minSvgBoundingBoxSize,
  svgStrokeHtml,
};
export function installEditorSvgDrawing(): () => void {
  return () => {
    SvgDrawingConstant = 4;
    minSvgBoundingBoxSize = 8;
  };
}
