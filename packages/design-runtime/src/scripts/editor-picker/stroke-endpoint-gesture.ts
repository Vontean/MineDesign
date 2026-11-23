import { snapLineAngle } from "./resize-geometry";
import { resizeLineFromEndpoints } from "./svg-line-geometry";
import {
  applySvgEndpointGeometry,
  restoreSvgLine,
  snapshotSvgLine,
  type LinePreviewGeometry,
  type SvgLineSnapshot,
} from "./svg-line-preview";

interface Point {
  x: number;
  y: number;
}

interface EditableLine {
  px: number;
  py: number;
  tx: number;
  ty: number;
  vbW: number;
  vbH: number;
  shaft: SVGElement;
  back: number;
  startBack: number;
  legacyBack: number;
  isArrow: boolean;
  unitScale: number;
  paint: Record<string, string>;
  svgPaint: Record<string, string>;
}

interface EndpointTarget {
  svg: SVGSVGElement;
  geometry: EditableLine;
  componentName: string | null;
  viewportScale: number;
}

interface EndpointGestureOptions {
  selectedLine(): EndpointTarget | null;
  clearPendingPreview(): void;
  retainPreview(snapshot: SvgLineSnapshot): void;
  activeTool(): string;
  emit(event: object): void;
  refreshChrome(): void;
}

interface EndpointGesture {
  snapshot: SvgLineSnapshot;
  line: EditableLine;
  tid: number;
  name: string | null;
  which: 0 | 1;
  gestureKey: string;
  fixed: Point;
  grabDx: number;
  grabDy: number;
  scl: number;
  back: number;
  startBack: number;
  startLeft: number;
  startTop: number;
  startRect: DOMRectReadOnly;
  preview?: { endpoints: [Point, Point]; geometry: LinePreviewGeometry };
}

export function createStrokeEndpointGesture(options: EndpointGestureOptions) {
  let active: EndpointGesture | null = null;

  function start(which: 0 | 1, pointerX: number, pointerY: number) {
    if (active) return;
    const target = options.selectedLine();
    if (!target) return;
    const { svg, geometry: line, componentName, viewportScale } = target;
    const rect = svg.getBoundingClientRect();
    const viewportPoint = (x: number, y: number) => ({
      x: rect.left + (x / line.vbW) * rect.width,
      y: rect.top + (y / line.vbH) * rect.height,
    });
    const start = viewportPoint(line.px, line.py);
    const end = viewportPoint(line.tx, line.ty);
    const moving = which === 0 ? start : end;

    options.clearPendingPreview();
    active = {
      line,
      tid: parseInt(svg.getAttribute("data-dc-tpl") ?? "", 10),
      name: componentName,
      which,
      gestureKey: "g" + Date.now(),
      scl: viewportScale,
      back: line.back,
      startBack: line.startBack,
      fixed: which === 0 ? end : start,
      grabDx: pointerX - moving.x,
      grabDy: pointerY - moving.y,
      startLeft: parseFloat(svg.style.left) || 0,
      startTop: parseFloat(svg.style.top) || 0,
      startRect: rect,
      snapshot: snapshotSvgLine(svg, line.shaft),
    };
  }

  function move(x: number, y: number, snap: boolean) {
    const gesture = active;
    if (!gesture) return;
    let moving = { x: x - gesture.grabDx, y: y - gesture.grabDy };
    if (snap) moving = snapLineAngle(gesture.fixed, moving);
    const endpoints: [Point, Point] = gesture.which === 0
      ? [moving, gesture.fixed]
      : [gesture.fixed, moving];
    const geometry = resizeLineFromEndpoints(gesture, ...endpoints);
    gesture.preview = { endpoints, geometry };
    applySvgEndpointGeometry(gesture.snapshot.svg, gesture.snapshot.shaft, geometry);
    options.refreshChrome();
  }

  function finish(commit: boolean) {
    if (!active) return;
    const gesture = active;
    active = null;
    document.body.style.cursor = options.activeTool() === "select" ? "" : "crosshair";
    if (!commit || !gesture.preview) {
      restoreSvgLine(gesture.snapshot);
    } else {
      const { line, preview } = gesture;
      const geometry: LinePreviewGeometry = line.legacyBack > 0
        ? resizeLineFromEndpoints({
            scl: gesture.scl,
            startLeft: gesture.startLeft,
            startTop: gesture.startTop,
            startRect: gesture.startRect,
            back: line.legacyBack,
          }, ...preview.endpoints)
        : preview.geometry;
      options.retainPreview(gesture.snapshot);
      options.emit({
        type: "strokeEndpoint",
        tid: gesture.tid,
        name: gesture.name,
        gestureKey: gesture.gestureKey,
        left: geometry.left,
        top: geometry.top,
        width: geometry.w,
        height: geometry.h,
        d: geometry.d,
        isArrow: line.isArrow,
        unitScale: line.unitScale,
        paint: line.paint,
        svgPaint: line.svgPaint,
      });
    }
    options.refreshChrome();
  }

  return { start, move, finish, get active() { return active !== null; } };
}
