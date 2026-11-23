import { suppressNativeContextMenu } from "../editor/outline/native-menu";

interface DragBox {
  w: number;
  h: number;
  ew: number;
  eh: number;
  ox: number;
  oy: number;
  gx: number;
  gy: number;
}

type FrameDrag =
  | { type: "arm"; key: string; tids: number[] | null; alt: boolean; box: DragBox | null }
  | { type: "exit"; key: string; tids: number[]; alt: boolean; box: DragBox | null }
  | { type: "disarm" | "cancel"; key: string }
  | { type: "move" | "drop"; key: string; x: number; y: number; alt: boolean; ctrl: boolean };

export interface FramePanZoom {
  pinch: boolean;
  touch: boolean;
  dx: number;
  dy: number;
  dz: number;
  x: number;
  y: number;
}

export interface FrameGestureOptions {
  file: string;
  panelMounted: boolean;
  readOnly: boolean;
  onBoxEvent?(file: string, event: { type: "press" | "live" | "end" | "cancel"; key: string }): void;
  onDragEvent?(file: string, event: FrameDrag): void;
  onPanZoom?(file: string, event: FramePanZoom): void;
  onModifierKey?(file: string, key: "deep", on: boolean, blur: boolean): void;
  onRepeatRefused?(file: string, count: number, reason: "self" | "siblings"): void;
}

const boxEventKinds = {
  canvasPointerDown: "press",
  boxLive: "live",
  boxEnd: "end",
  boxCancel: "cancel",
} as const;

function gestureKey(value: unknown) {
  return typeof value === "string" && /^[0-9a-f]{16}$/.test(value) ? value : null;
}

function finite(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function dragCoordinate(value: unknown) {
  const number = finite(value);
  return number !== null && Math.abs(number) < 1e6 ? number : null;
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function dragBox(event: Record<string, unknown>): DragBox | null {
  const width = dragCoordinate(event.w);
  const height = dragCoordinate(event.h);
  if (width === null || height === null || width < 1 || height < 1) return null;

  const dimension = (value: number) => Math.round(Math.min(value, 8e3));
  const exportWidth = dragCoordinate(event.ew);
  const exportHeight = dragCoordinate(event.eh);
  const offset = (value: unknown) => Math.round(clamp(dragCoordinate(value) ?? 0, -8e3, 8e3));
  return {
    w: dimension(width),
    h: dimension(height),
    ew: dimension(exportWidth !== null && exportWidth >= 1 ? exportWidth : width),
    eh: dimension(exportHeight !== null && exportHeight >= 1 ? exportHeight : height),
    ox: offset(event.ox),
    oy: offset(event.oy),
    gx: Math.round(Math.min(width, 8e3, Math.max(0, dragCoordinate(event.gx) ?? width / 2))),
    gy: Math.round(Math.min(height, 8e3, Math.max(0, dragCoordinate(event.gy) ?? height / 2))),
  };
}

function selectedIds(value: unknown): number[] {
  return Array.isArray(value)
    ? value.filter((id) => typeof id === "number" && Number.isInteger(id) && id >= 0 && id < 1e6).slice(0, 16)
    : [];
}

function parseDrag(event: Record<string, unknown>): FrameDrag | null {
  const key = gestureKey(event.gestureKey);
  if (key === null) return null;
  const alt = event.alt === true;
  switch (event.type) {
    case "dragExit": {
      const tids = selectedIds(event.tids);
      return tids.length ? { type: "exit", key, tids, alt, box: dragBox(event) } : null;
    }
    case "dragState": {
      if (event.live !== true) return { type: "disarm", key };
      const tids = selectedIds(event.tids);
      return { type: "arm", key, tids: tids.length ? tids : null, alt, box: dragBox(event) };
    }
    case "dragMove":
    case "dragDrop": {
      const x = dragCoordinate(event.x);
      const y = dragCoordinate(event.y);
      return x === null || y === null
        ? null
        : { type: event.type === "dragMove" ? "move" : "drop", key, x, y, alt, ctrl: event.ctrl === true };
    }
    case "dragCancel":
    case "dragReturn":
      return { type: "cancel", key };
    default:
      return null;
  }
}

function parsePanZoom(event: Record<string, unknown>): FramePanZoom | null {
  const dx = finite(event.dx);
  const dy = finite(event.dy);
  const x = finite(event.x);
  const y = finite(event.y);
  if (dx === null || dy === null || x === null || y === null) return null;
  return {
    pinch: event.pinch === true,
    touch: event.touch === true,
    dx: clamp(dx, -1e3, 1e3),
    dy: clamp(dy, -1e3, 1e3),
    dz: clamp(finite(event.dz) ?? 0, -0.25, 0.25),
    x: clamp(x, 0, 1e5),
    y: clamp(y, 0, 1e5),
  };
}

/** 接收已通过预览来源检查的手势数据。返回值表示消息是否已处理。 */
export function routeFrameGesture(payload: unknown, options: FrameGestureOptions): boolean {
  if (payload == null || typeof payload !== "object") return false;
  const event = payload as Record<string, unknown>;
  const { file, panelMounted, readOnly } = options;
  const editable = panelMounted && !readOnly;
  const type = event.type;

  switch (type) {
    case "modifierKey":
      if (editable && event.key === "deep" && typeof event.on === "boolean") {
        options.onModifierKey?.(file, "deep", event.on, event.blur === true);
      }
      return true;
    case "canvasPointerDown":
    case "boxLive":
    case "boxEnd":
    case "boxCancel": {
      const key = gestureKey(event.gestureKey);
      if (editable && key !== null) options.onBoxEvent?.(file, { type: boxEventKinds[type], key });
      // 按下还承担预览的基础指针通知。
      return type !== "canvasPointerDown";
    }
    case "panZoom": {
      const pan = options.onPanZoom && parsePanZoom(event);
      if (pan) options.onPanZoom?.(file, pan);
      return true;
    }
    case "panHold":
      if (event.on !== true || panelMounted) suppressNativeContextMenu(event.on === true);
      return true;
    case "repeatRefused": {
      const count = finite(event.count);
      const reason = event.reason;
      if (editable && count !== null && count >= 1 && count <= 1e4 && (reason === "self" || reason === "siblings")) {
        options.onRepeatRefused?.(file, Math.floor(count), reason);
      }
      return true;
    }
    default:
      if (typeof type !== "string" || !type.startsWith("drag") || !options.onDragEvent) return false;
      if (editable) {
        const drag = parseDrag(event);
        if (drag) options.onDragEvent(file, drag);
      }
      return true;
  }
}
