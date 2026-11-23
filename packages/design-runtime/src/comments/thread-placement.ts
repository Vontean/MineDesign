import type { Dynamic } from "../runtime-types";
import { parseDesignCommentAnchor, stableAnchorHash } from "./anchor-codec";
import type { CommentAreaRect, CommentBoardLookup } from "./anchor-resolution";
import type { CommentPoint } from "./area-geometry";

/**
 * 评论线程在评论图层上的落点：画布坐标换算、给宿主的窗口坐标、卡片目标点、
 * 区域描边，以及“定位到线程”时的目标选择。都是纯计算，调用方传入当前一帧的事实。
 */

/** 画布相机在屏幕上的位置与缩放（画布坐标 -> 图层像素）。 */
export interface CommentViewport {
  x: number;
  y: number;
  scale: number;
}

export function canvasToLayerPoint(point: CommentPoint, viewport: CommentViewport): CommentPoint {
  return { x: (point.x - viewport.x) * viewport.scale, y: (point.y - viewport.y) * viewport.scale };
}

export interface ThreadPlacementInput {
  threads: Dynamic[];
  resolveAnchorPoint(anchor: Dynamic): CommentPoint | null;
  viewport: CommentViewport;
  /** 评论图层所在容器的屏幕外框。 */
  bounds: { left: number; top: number; width: number; height: number };
  /** 顶部工具栏占用的高度；工具栏之上的点视为不可见。 */
  toolbarHeight: number;
  window: { innerWidth: number; innerHeight: number; scrollX: number; scrollY: number };
}

/**
 * 每条线程在页面坐标里的位置，交给宿主摆放评论气泡。
 * 图层外的点推到窗口之外一个窗口的距离，宿主据此隐藏而不是贴边。
 */
export function computeThreadPlacements(input: ThreadPlacementInput): Record<string, CommentPoint> {
  const { bounds, toolbarHeight, viewport, window: win } = input;
  const placements: Record<string, CommentPoint> = {};
  for (const thread of input.threads) {
    const parsedAnchor = parseDesignCommentAnchor(thread.anchor);
    const anchorPoint = parsedAnchor ? input.resolveAnchorPoint(parsedAnchor) : null;
    if (!anchorPoint) continue;
    const layerPoint = canvasToLayerPoint(anchorPoint, viewport);
    const clientX =
      layerPoint.x < 0
        ? layerPoint.x - win.innerWidth
        : layerPoint.x > bounds.width
          ? layerPoint.x + win.innerWidth
          : bounds.left + layerPoint.x;
    const clientY =
      layerPoint.y < toolbarHeight
        ? layerPoint.y - win.innerHeight
        : layerPoint.y > bounds.height
          ? layerPoint.y + win.innerHeight
          : bounds.top + layerPoint.y;
    placements[thread.id] = {
      x: Math.round(clientX + win.scrollX),
      y: Math.round(clientY + win.scrollY),
    };
  }
  return placements;
}

export interface CommentCardTargetsInput {
  threads: Dynamic[];
  resolveAnchorPoint(anchor: Dynamic): CommentPoint | null;
  viewport: CommentViewport;
  layerWidth: number;
  layerHeight: number;
  /** 卡片可用区域的顶边（工具栏之下）。 */
  cardTop: number;
}

/** 评论卡片的目标点：与编号圆点同一位置，只保留图层可视区域内的线程。 */
export function commentCardTargets(input: CommentCardTargetsInput): Array<{ id: string; x: number; y: number }> {
  const { viewport, layerWidth, layerHeight, cardTop } = input;
  return input.threads.flatMap((thread: Dynamic) => {
    const anchor = parseDesignCommentAnchor(thread.anchor);
    const world = anchor ? input.resolveAnchorPoint(anchor) : null;
    if (!world) return [];
    const point = canvasToLayerPoint(world, viewport);
    return point.x < 0 || point.x > layerWidth || point.y < cardTop || point.y > layerHeight
      ? []
      : [{ id: thread.id, x: point.x, y: point.y }];
  });
}

/** 描边矩形：位置尺寸为图层像素；origin 为拖动起点，deg 为便签旋转角。 */
export interface CommentAreaOutlineRect {
  x: number;
  y: number;
  w: number;
  h: number;
  ox?: number;
  oy?: number;
  deg?: number;
}

export interface CommentAreaOutlineInput {
  /** 正在拖拽的框选；pin 是画布坐标的固定点，x1/y1 是图层像素里的当前点。 */
  marquee: { pin: CommentPoint; x1: number; y1: number; resizing?: boolean } | null;
  /** 已打开线程的区域（画布坐标）。 */
  activeThreadAreaRect: CommentAreaRect | null;
  /** 已画好、等待写评论的区域（画布坐标，ox/oy 为起点）。 */
  drawnAreaRect: (CommentAreaRect & { ox: number; oy: number }) | null;
  viewport: CommentViewport;
}

/** 区域描边优先级：拖拽中的框选 > 已打开线程的区域 > 已画好的区域。 */
export function commentAreaOutline(input: CommentAreaOutlineInput): CommentAreaOutlineRect | null {
  const { marquee, activeThreadAreaRect, drawnAreaRect, viewport } = input;
  if (marquee) {
    const pinX = (marquee.pin.x - viewport.x) * viewport.scale;
    const pinY = (marquee.pin.y - viewport.y) * viewport.scale;
    const { x1, y1 } = marquee;
    return {
      x: Math.min(pinX, x1),
      y: Math.min(pinY, y1),
      w: Math.abs(x1 - pinX),
      h: Math.abs(y1 - pinY),
      ox: marquee.resizing ? x1 : pinX,
      oy: marquee.resizing ? y1 : pinY,
    };
  }
  if (activeThreadAreaRect)
    return {
      x: (activeThreadAreaRect.x - viewport.x) * viewport.scale,
      y: (activeThreadAreaRect.y - viewport.y) * viewport.scale,
      w: activeThreadAreaRect.w * viewport.scale,
      h: activeThreadAreaRect.h * viewport.scale,
      deg: activeThreadAreaRect.deg,
    };
  if (drawnAreaRect)
    return {
      x: (drawnAreaRect.x - viewport.x) * viewport.scale,
      y: (drawnAreaRect.y - viewport.y) * viewport.scale,
      w: drawnAreaRect.w * viewport.scale,
      h: drawnAreaRect.h * viewport.scale,
      ox: (drawnAreaRect.ox - viewport.x) * viewport.scale,
      oy: (drawnAreaRect.oy - viewport.y) * viewport.scale,
    };
  return null;
}

/** 宿主请求“定位到线程”时，让画布展示的目标：画板、便签或页面。 */
export interface CommentRevealTarget {
  kind: "artboard" | "note" | "page";
  match(id?: Dynamic): boolean;
  /** 多画板区域：只要命中其中任一画板。 */
  boards?: true;
}

export function commentRevealTarget(parsedAnchor: Dynamic): CommentRevealTarget {
  if (parsedAnchor.kind === "el" || parsedAnchor.kind === "artboard" || parsedAnchor.kind === "area")
    return { kind: "artboard", match: (file?: Dynamic) => stableAnchorHash(file) === parsedAnchor.fileHash };
  if (parsedAnchor.kind === "note" || parsedAnchor.kind === "notearea")
    return { kind: "note", match: (noteId?: Dynamic) => stableAnchorHash(noteId) === parsedAnchor.idHash };
  if (parsedAnchor.kind === "boards")
    return {
      kind: "artboard",
      match: (file?: Dynamic) =>
        parsedAnchor.boards.some((board?: Dynamic) => board.fileHash === stableAnchorHash(file)),
      boards: true,
    };
  return { kind: "page", match: (pageId?: Dynamic) => stableAnchorHash(pageId) === parsedAnchor.pageHash };
}

/** 锚点本身解析不出位置（元素已不在）时，退回到所属画板的中心。 */
export function revealFallbackPoint(parsedAnchor: Dynamic, lookup: CommentBoardLookup): CommentPoint | null {
  if (
    parsedAnchor.kind !== "el" &&
    parsedAnchor.kind !== "artboard" &&
    parsedAnchor.kind !== "area" &&
    parsedAnchor.kind !== "boards"
  )
    return null;
  const boardFile = lookup.findFileByHash(
    parsedAnchor.kind === "boards" ? (parsedAnchor.boards[0]?.fileHash ?? "") : parsedAnchor.fileHash,
  );
  const artboard = boardFile == null ? null : lookup.findArtboardByFile(boardFile);
  return artboard ? { x: artboard.x + artboard.w / 2, y: artboard.y + artboard.h / 2 } : null;
}
