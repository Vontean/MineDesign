import { clickInsertDimensions, isLineTool, type DrawingContainer } from "./drawing-placement";
import { fitCubicBezierPath, maxPathLength, serializeBezierPath, serializePolyline, simplifyPenPath } from "./freehand-path";
import { snapLineAngle } from "./resize-geometry";
import { shortenLineEndpoint } from "./svg-line-geometry";
import type { Dynamic } from "../../runtime-types";

type Point = [number, number];

interface PendingShape {
  x: number;
  y: number;
  parent: DrawingContainer;
}

interface DrawnShape {
  box: HTMLDivElement;
  start: PendingShape;
  x: number;
  y: number;
  w: number;
  h: number;
  dirX: number;
  dirY: number;
}

interface PenStroke {
  points: Point[];
  path: SVGPathElement;
  parent: DrawingContainer;
  long?: boolean;
}

interface DrawingOptions {
  activeTool(): string;
  hostScale(): number;
  previewScale(): number;
  elementViewportScale(element: Element | null): number;
  overlayRoot(): HTMLElement;
  strokeColor: string;
  findContainer(x: number, y: number): DrawingContainer;
  hidePlacement(): void;
  watchPendingInsert(node: Element): void;
  hasPendingInserts(): boolean;
  emit(message: Dynamic): void;
}

const svgNamespace = "http://www.w3.org/2000/svg";
const penTolerance = 1.25;

export function createDrawingGestures(options: DrawingOptions) {
  let pendingShape: PendingShape | null = null;
  let shape: DrawnShape | null = null;
  let penStroke: PenStroke | null = null;
  let penOverlay: SVGSVGElement | null = null;

  function start(event: MouseEvent) {
    const { clientX, clientY } = event;
    if (options.activeTool() !== "draw") {
      pendingShape = { x: clientX, y: clientY, parent: options.findContainer(clientX, clientY) };
      return;
    }

    if (!penOverlay) {
      penOverlay = document.createElementNS(svgNamespace, "svg");
      penOverlay.setAttribute("data-dc-editor-overlay", "");
      penOverlay.style.cssText = "position:fixed;inset:0;width:100%;height:100%;z-index:2147483646;pointer-events:none;";
      options.overlayRoot().appendChild(penOverlay);
    }
    const path = document.createElementNS(svgNamespace, "path");
    path.setAttribute("fill", "none");
    path.style.stroke = options.strokeColor;
    path.setAttribute("stroke-width", "2");
    path.setAttribute("stroke-linecap", "round");
    path.setAttribute("stroke-linejoin", "round");
    penOverlay.appendChild(path);
    penStroke = {
      points: [[clientX, clientY]],
      path,
      parent: options.findContainer(clientX, clientY),
    };
    options.hidePlacement();
  }

  function startDraggedShape(start: PendingShape) {
    const tool = options.activeTool();
    const { strokeColor } = options;
    const box = document.createElement("div");
    box.setAttribute("data-dc-editor-overlay", "");
    box.style.cssText = "position:fixed;z-index:2147483646;pointer-events:none;" +
      (isLineTool(tool) ? "border:none;background:transparent;"
        : `border:1.5px solid ${strokeColor};background:color-mix(in srgb,${strokeColor} 10%,transparent);`) +
      "border-radius:" + (tool === "oval" ? "50%" : "0") + ";";
    options.overlayRoot().appendChild(box);
    shape = { box, start, x: start.x, y: start.y, w: 0, h: 0, dirX: 1, dirY: 1 };
    pendingShape = null;
    options.hidePlacement();
  }

  function paintLine(drawing: DrawnShape, arrow: boolean) {
    const { box, start, x, y, w, h, dirX, dirY } = drawing;
    const scale = options.elementViewportScale(start.parent.el) || 1;
    const width = Math.max(w, 8 * scale);
    const height = Math.max(h, 8 * scale);
    const insetX = (width - w) / 2;
    const insetY = (height - h) / 2;
    box.style.left = x - insetX + "px";
    box.style.top = y - insetY + "px";
    box.style.width = width + "px";
    box.style.height = height + "px";

    const fromX = insetX + (dirX === 1 ? 0 : w);
    const fromY = insetY + (dirY === 1 ? 0 : h);
    let toX = insetX + (dirX === 1 ? w : 0);
    let toY = insetY + (dirY === 1 ? h : 0);
    if (arrow) {
      const shortened = shortenLineEndpoint(fromX, fromY, toX, toY, 8 * scale);
      toX = shortened.x;
      toY = shortened.y;
    }
    const { strokeColor } = options;
    const marker = arrow
      ? `<defs><marker id="dc-draw-head" orient="auto" markerWidth="5" markerHeight="5" refX="2" refY="2" overflow="visible"><path d="M0 0 L4 2 L0 4 Z" stroke="none" style="fill:${strokeColor}"/></marker></defs>`
      : "";
    box.innerHTML = `<svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" style="display:block;overflow:visible">${marker}` +
      `<path d="M ${fromX} ${fromY} L ${toX} ${toY}" fill="none" style="stroke:${strokeColor}" stroke-width="${4 * scale}" stroke-linecap="round" stroke-linejoin="round"` +
      (arrow ? ' marker-end="url(#dc-draw-head)"' : "") + "/></svg>";
  }

  function updateShape(drawing: DrawnShape, event: MouseEvent) {
    const { start, box } = drawing;
    const tool = options.activeTool();
    const line = isLineTool(tool);
    let point = { x: event.clientX, y: event.clientY };
    if (event.shiftKey && line) point = snapLineAngle(start, point);
    const deltaX = point.x - start.x;
    const deltaY = point.y - start.y;
    const width = Math.abs(deltaX);
    const height = Math.abs(deltaY);
    if (event.shiftKey && !line) {
      const side = Math.max(width, height);
      drawing.w = side;
      drawing.h = side;
      drawing.x = deltaX < 0 ? start.x - side : start.x;
      drawing.y = deltaY < 0 ? start.y - side : start.y;
    } else {
      drawing.w = width;
      drawing.h = height;
      drawing.x = Math.min(start.x, point.x);
      drawing.y = Math.min(start.y, point.y);
    }
    drawing.dirX = deltaX >= 0 ? 1 : -1;
    drawing.dirY = deltaY >= 0 ? 1 : -1;
    box.style.left = drawing.x + "px";
    box.style.top = drawing.y + "px";
    box.style.width = drawing.w + "px";
    box.style.height = drawing.h + "px";
    if (line) paintLine(drawing, tool === "arrow");
  }

  function updatePen(stroke: PenStroke, event: MouseEvent) {
    const [lastX, lastY] = stroke.points[stroke.points.length - 1];
    const deltaX = event.clientX - lastX;
    const deltaY = event.clientY - lastY;
    if (deltaX * deltaX + deltaY * deltaY < 4) return;
    stroke.points.push([event.clientX, event.clientY]);
    const fitted = stroke.long ? null : fitCubicBezierPath(stroke.points, penTolerance / options.hostScale());
    const fittedPath = fitted && fitted.length * 2 <= maxPathLength ? serializeBezierPath(fitted, 1) : null;
    if (fitted && !(fittedPath && fittedPath.length <= maxPathLength)) stroke.long = true;
    stroke.path.setAttribute("d", fittedPath && fittedPath.length <= maxPathLength
      ? fittedPath : serializePolyline(stroke.points, 0, 0));
  }

  function move(event: MouseEvent) {
    if (penStroke) updatePen(penStroke, event);
    else if (shape) updateShape(shape, event);
    else if (pendingShape) {
      const deltaX = event.clientX - pendingShape.x;
      const deltaY = event.clientY - pendingShape.y;
      if (deltaX * deltaX + deltaY * deltaY > 16) startDraggedShape(pendingShape);
    } else return false;
    return true;
  }

  function emitInsert(parent: DrawingContainer, rect: { x: number; y: number; w: number; h: number }, extra?: Dynamic) {
    options.emit({
      type: "insert",
      name: parent.name,
      targetTid: parent.tid,
      position: parent.tid == null ? "root-end" : "into",
      rect,
      ...extra,
    });
  }

  function insertAt(event: MouseEvent) {
    const parent = options.findContainer(event.clientX, event.clientY);
    options.hidePlacement();
    const tool = options.activeTool();
    const [width, height] = clickInsertDimensions(tool);
    const scale = parent.el ? options.elementViewportScale(parent.el) : options.previewScale() || 1;
    emitInsert(parent, {
      x: Math.round((event.clientX - parent.rect.left) / scale),
      y: Math.round((event.clientY - parent.rect.top) / scale),
      w: tool === "text" ? 0 : width,
      h: tool === "text" ? 0 : height,
    });
  }

  function finishShape(commit: boolean) {
    if (!shape) return;
    const { box, start: { parent }, x, y, w, h, dirX, dirY } = shape;
    shape = null;
    options.hidePlacement();
    const largeEnough = isLineTool(options.activeTool()) ? w > 4 || h > 4 : w > 4 && h > 4;
    if (!commit || !largeEnough) {
      box.remove();
      return;
    }
    options.watchPendingInsert(box);
    const scale = options.elementViewportScale(parent.el);
    emitInsert(parent, {
      x: Math.round((x - parent.rect.left) / scale),
      y: Math.round((y - parent.rect.top) / scale),
      w: Math.round(w / scale),
      h: Math.round(h / scale),
    }, { dir: { x: dirX || 1, y: dirY || 1 } });
  }

  function insertPen(stroke: PenStroke) {
    const { points } = stroke;
    let parent = stroke.parent;
    if (parent.el && !parent.el.isConnected) parent = options.findContainer(...points[0]);
    const target = parent.el;
    const stampedTid = parent.tid != null && target ? parseInt(target.getAttribute("data-dc-tpl")!, 10) : NaN;
    const tid = Number.isNaN(stampedTid) ? parent.tid : stampedTid;
    const bounds = tid != null && target ? target.getBoundingClientRect() : parent.rect;
    const scale = target ? options.elementViewportScale(target) : options.previewScale() || 1;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const [x, y] of points) {
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
    emitInsert({ ...parent, tid }, {
      x: Math.round((minX - bounds.left) / scale),
      y: Math.round((minY - bounds.top) / scale),
      w: Math.max(2, Math.round((maxX - minX) / scale)),
      h: Math.max(2, Math.round((maxY - minY) / scale)),
    }, {
      path: {
        d: simplifyPenPath(
          points.map(([x, y]) => [(x - minX) / scale, (y - minY) / scale]),
          penTolerance / options.hostScale() / scale,
        ),
      },
    });
  }

  function finishPenStroke(commit: boolean) {
    if (!penStroke) return;
    const stroke = penStroke;
    penStroke = null;
    if (!commit || stroke.points.length < 2 || !penOverlay) {
      stroke.path.remove();
      return;
    }
    options.watchPendingInsert(stroke.path);
    insertPen(stroke);
  }

  function finishPenDrawing(commit: boolean, endTool: boolean) {
    finishPenStroke(commit);
    if (!penOverlay) return;
    const overlay = penOverlay;
    penOverlay = null;
    if (options.hasPendingInserts()) options.watchPendingInsert(overlay);
    else overlay.remove();
    if (commit && endTool) {
      options.emit({ type: "insert", name: null, targetTid: null, position: "root-end", endTool: true });
    }
  }

  return {
    start, move, insertAt, finishShape, finishPenStroke, finishPenDrawing,
    cancelPendingShape() { pendingShape = null; },
    get shapeActive() { return shape !== null; },
    get shapePending() { return pendingShape !== null; },
    get penActive() { return penStroke !== null; },
    get hasPenOverlay() { return penOverlay !== null; },
  };
}
