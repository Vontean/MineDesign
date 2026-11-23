import { readSvgLineAttributes, writeSvgLineEndpoints } from "./svg-line-geometry";

export interface LinePreviewGeometry {
  left: number;
  top: number;
  w: number;
  h: number;
  sx: number;
  sy: number;
  ex: number;
  ey: number;
  d: string;
}

export function snapshotSvgLine(svg: SVGSVGElement, shaft: SVGElement) {
  return {
    svg,
    shaft,
    style: svg.getAttribute("style") || "",
    lineAttributes: readSvgLineAttributes(shaft) as Record<string, string | null>,
    viewBox: svg.getAttribute("viewBox"),
    width: svg.getAttribute("width"),
    height: svg.getAttribute("height"),
  };
}

export type SvgLineSnapshot = ReturnType<typeof snapshotSvgLine>;

export function applySvgEndpointGeometry(svg: SVGSVGElement, shaft: SVGElement, geometry: LinePreviewGeometry) {
  svg.style.left = geometry.left + "px";
  svg.style.top = geometry.top + "px";
  svg.style.width = geometry.w + "px";
  svg.style.height = geometry.h + "px";
  svg.setAttribute("width", String(geometry.w));
  svg.setAttribute("height", String(geometry.h));
  svg.setAttribute("viewBox", "0 0 " + geometry.w + " " + geometry.h);
  writeSvgLineEndpoints(shaft, geometry.sx, geometry.sy, geometry.ex, geometry.ey);
}

function restoreAttribute(element: Element, name: string, value: string | null) {
  if (value != null) element.setAttribute(name, value);
  else element.removeAttribute(name);
}

export function restoreSvgLine(snapshot: SvgLineSnapshot) {
  const { svg, shaft, style, viewBox, width, height, lineAttributes } = snapshot;
  svg.setAttribute("style", style);
  restoreAttribute(svg, "viewBox", viewBox);
  restoreAttribute(svg, "width", width);
  restoreAttribute(svg, "height", height);
  for (const key in lineAttributes) restoreAttribute(shaft, key, lineAttributes[key]);
}

/** Tracks SVG previews retained until the host writes the committed geometry. */
export function createSvgPreviewRollback() {
  let pending: SvgLineSnapshot[] = [];
  return {
    retain(snapshots: SvgLineSnapshot[]) { pending = snapshots; },
    clear() { pending = []; },
    settle() {
      for (const snapshot of pending) {
        if (snapshot.svg.isConnected) restoreSvgLine(snapshot);
      }
      pending = [];
    },
  };
}
