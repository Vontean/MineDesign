import {
  ancestorTransformInfo,
  computedTransformMatrix,
  elementLayoutDimensions,
  hasIndependentTransforms,
} from "./element-transform-geometry";
import { outerSvgElement } from "./element-query";
import {
  expandBoundsForLineMarkers,
  extendLineEndpoint,
  measureSvgMarkerOverhang,
  readSvgLineGeometry,
} from "./svg-line-geometry";

const strokeProperties = [
  "stroke",
  "stroke-width",
  "stroke-linecap",
  "stroke-linejoin",
  "stroke-dasharray",
  "stroke-dashoffset",
  "stroke-opacity",
  "stroke-miterlimit",
  "vector-effect",
];

interface SvgLine {
  shaft: SVGElement;
  tag: string;
  legacy: boolean;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
}

function isEditorDrawnLine(svg: SVGSVGElement, line: SvgLine) {
  return line.tag === "path" &&
    /(^|;)\s*fill:\s*none/.test(svg.getAttribute("style") || "") &&
    svg.style.overflow === "visible" &&
    (line.legacy ||
      (svg.getAttribute("preserveAspectRatio") === "none" &&
        /^\s*M\s*[-\d.e+]+[\s,]+[-\d.e+]+\s+L\s*[-\d.e+]+[\s,]+[-\d.e+]+\s*$/i.test(
          line.shaft.getAttribute("d") || "",
        )));
}

function hasExplicitOrigin(svg: SVGSVGElement) {
  const { position } = getComputedStyle(svg);
  const { left, top, right, bottom } = svg.style;
  const isPixels = (value: string) => /^-?[\d.]+px$/.test(value.trim());
  return (position === "absolute" || position === "fixed") &&
    isPixels(left) && isPixels(top) && !right && !bottom;
}

function readStrokePaint(shaft: SVGElement, svg: SVGSVGElement) {
  const paint: Record<string, string> = {};
  const svgPaint: Record<string, string> = {};
  try {
    const shaftStyle = getComputedStyle(shaft);
    const svgStyle = getComputedStyle(svg);
    for (const property of strokeProperties) {
      const shaftValue = shaftStyle.getPropertyValue(property);
      if (shaftValue) paint[property] = shaftValue;
      const svgValue = svgStyle.getPropertyValue(property);
      if (svgValue) svgPaint[property] = svgValue;
    }
  } catch {}
  return { paint, svgPaint };
}

export function editableSvgGeometry(element?: Element | null) {
  if (!element || element.tagName.toLowerCase() !== "svg") return null;
  const svg = element as SVGSVGElement;
  const line: SvgLine | null = readSvgLineGeometry(svg);
  if (!line || !computedTransformMatrix(svg)?.none) return null;
  const { shaft, legacy, tag } = line;
  try {
    const shaftStyle = getComputedStyle(shaft);
    if (shaftStyle.transform !== "none" || hasIndependentTransforms(shaftStyle)) return null;
  } catch {}

  const editorDrawn = isEditorDrawnLine(svg, line);
  if (!editorDrawn && !hasExplicitOrigin(svg)) return null;
  const { w: vbW, h: vbH } = elementLayoutDimensions(svg);
  if (!(vbW > 0) || !(vbH > 0)) return null;

  let matrix: DOMMatrix | null = null;
  try {
    matrix = svg.getCTM ? svg.getCTM() : null;
  } catch {}
  const toViewport = (x: number, y: number) => {
    if (!matrix) return { x, y };
    const point = svg.createSVGPoint();
    point.x = x;
    point.y = y;
    return point.matrixTransform(matrix);
  };

  let unitScale = 1;
  if (matrix && !editorDrawn) {
    const scaleX = Math.hypot(matrix.a, matrix.b);
    const scaleY = Math.hypot(matrix.c, matrix.d);
    const dx = line.ex - line.sx;
    const dy = line.ey - line.sy;
    unitScale = (scaleX * scaleY * Math.hypot(dx, dy)) / Math.hypot(scaleX * dx, scaleY * dy);
    if (!(unitScale > 1e-4 && unitScale < 1e4)) return null;
  }

  const { paint, svgPaint } = readStrokePaint(shaft, svg);
  const strokeWidth = parseFloat(paint["stroke-width"]) || 0;
  const endOverhang = (legacy ? 0 : measureSvgMarkerOverhang(svg, shaft, "end")) * strokeWidth;
  const startOverhang = legacy ? 0 : measureSvgMarkerOverhang(svg, shaft, "start") * strokeWidth;
  const start = toViewport(line.sx, line.sy);
  const end = toViewport(line.ex, line.ey);
  const endTip = extendLineEndpoint(line, legacy ? 0 : endOverhang);
  const startTip = extendLineEndpoint(
    { sx: line.ex, sy: line.ey, ex: line.sx, ey: line.sy },
    startOverhang,
  );
  const startMarker = toViewport(startTip.x, startTip.y);
  const endMarker = toViewport(endTip.x, endTip.y);

  return {
    sx: start.x,
    sy: start.y,
    ex: end.x,
    ey: end.y,
    px: startMarker.x,
    py: startMarker.y,
    tx: endMarker.x,
    ty: endMarker.y,
    back: legacy ? 0 : endOverhang * unitScale,
    startBack: startOverhang * unitScale,
    legacyBack: legacy ? endOverhang * unitScale : 0,
    isArrow: shaft.hasAttribute("marker-end") || shaft.hasAttribute("marker-start") || legacy,
    legacy,
    vbW,
    vbH,
    shaft,
    tag,
    unitScale,
    paint,
    svgPaint,
  };
}

export function svgGeometryBounds(element: Element) {
  const bounds = element.getBoundingClientRect();
  const svg = outerSvgElement(element);
  if (svg === element || !(bounds.width > 0 || bounds.height > 0)) return bounds;
  const geometry = editableSvgGeometry(svg);
  if (geometry?.shaft !== element) return bounds;
  const expanded = expandBoundsForLineMarkers(geometry, svg.getBoundingClientRect(), bounds);
  return expanded && !ancestorTransformInfo(svg).rotated ? expanded : bounds;
}
