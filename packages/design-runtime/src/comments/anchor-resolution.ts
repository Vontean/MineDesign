import type { Dynamic } from "../runtime-types";
import { isCanvasPageMatch } from "../canvas/page-operations";
import { rotatedAnnotationBounds } from "../platform/file-content";
import { stableAnchorHash } from "./anchor-codec";
import { commentAreaHandlePoint, type CommentPoint, type CommentRect, denormalizeCommentArea, unionCommentRects } from "./area-geometry";
import { objectCommentAreaHandlePoint, objectCommentAreaRect, objectCommentPoint } from "./object-geometry";

/**
 * 评论锚点解析：把线程里保存的锚点（画板 / 元素 / 区域 / 便签 / 画布）换算成画布坐标。
 * 纯计算：画板与便签来自 manifest，元素与页面矩形由调用方按当前一帧传入。
 */

/** 便签区域带旋转角；其余矩形与点沿用区域几何模块的定义。 */
export type CommentAreaRect = CommentRect & { deg?: number };

/** 评论图层在像素锚点上保留的最小边距。 */
export const commentPlacementInsetPixels = 12;

/** 元素评论的测量键：同一画板内按模板、指纹与路径区分。 */
export function commentScopeKey(
  path?: Dynamic,
  templateId?: Dynamic,
  fingerprint?: Dynamic,
): string {
  return String(templateId) + (fingerprint ?? "") + "\n" + path;
}

/** 两个矩形是否相同（同一个对象或四个数值一致）。 */
export function commentRectsEqual(rectA?: Dynamic, rectB?: Dynamic): boolean {
  return (
    rectA === rectB ||
    (!!rectA &&
      !!rectB &&
      rectA.x === rectB.x &&
      rectA.y === rectB.y &&
      rectA.w === rectB.w &&
      rectA.h === rectB.h)
  );
}

/** 按 manifest 与全屏状态查找画板、便签，并给出画板在画布上的外框。 */
export interface CommentBoardLookup {
  findArtboardByFile(file?: Dynamic): Dynamic;
  findFileByHash(hash?: Dynamic): Dynamic;
  findNoteByHash(hash?: Dynamic): Dynamic;
  findNoteById(noteId?: Dynamic): Dynamic;
  /** 全屏时只有全屏画板可见。 */
  isFileVisible(file?: Dynamic): boolean;
  /** 全屏画板用全屏外框，其余用 manifest 里的位置与尺寸。 */
  getArtboardFrame(artboard?: Dynamic): CommentRect;
}

export interface CommentBoardLookupInput {
  manifest: Dynamic;
  fullscreenFile: Dynamic;
  fullscreenFrame: Dynamic;
}

export function createCommentBoardLookup(input: CommentBoardLookupInput): CommentBoardLookup {
  const { manifest, fullscreenFile, fullscreenFrame } = input;
  return {
    findArtboardByFile: (file?: Dynamic): Dynamic =>
      manifest.artboards.find((artboard?: Dynamic): Dynamic => artboard.file === file) ?? null,
    findFileByHash: (hash?: Dynamic): Dynamic =>
      manifest.artboards.find((artboard?: Dynamic): Dynamic => stableAnchorHash(artboard.file) === hash)?.file ??
      null,
    findNoteByHash: (hash?: Dynamic): Dynamic =>
      (manifest.annotations ?? []).find((note?: Dynamic): Dynamic => stableAnchorHash(note.id) === hash) ?? null,
    findNoteById: (noteId?: Dynamic): Dynamic =>
      (manifest.annotations ?? []).find((note?: Dynamic): Dynamic => note.id === noteId) ?? null,
    isFileVisible: (file?: Dynamic): boolean => fullscreenFile == null || fullscreenFile === file,
    getArtboardFrame: (artboard?: Dynamic): CommentRect =>
      artboard.file === fullscreenFile && fullscreenFrame
        ? fullscreenFrame
        : { x: artboard.x, y: artboard.y, w: artboard.w, h: artboard.h },
  };
}

/** 解析锚点所需的当前一帧事实。 */
export interface CommentAnchorResolverContext {
  manifest: Dynamic;
  pageKey: string;
  fullscreenFile: Dynamic;
  lookup: CommentBoardLookup;
  /** 便签在画布上的未旋转外框，来自宿主选项。 */
  annBox(note: Dynamic): Dynamic;
  /** 已测得的元素矩形：画板文件 -> 测量键 -> 画板内矩形（null 表示元素已不存在）。 */
  elementRects: Map<string, Map<string, CommentRect | null>>;
  /** 已测得的画板页面矩形（页面在画板内的偏移与尺寸）。 */
  pageRects: Map<string, CommentRect>;
}

export interface CommentAnchorResolver {
  /**
   * 区域锚点的画布矩形。null 表示锚点已失效；
   * undefined 表示元素矩形尚未测得，调用方应退回画板中心。
   */
  resolveAreaRect(source?: Dynamic): CommentAreaRect | null | undefined;
  /** 任意锚点的画布坐标；null 表示当前不可见或已失效。 */
  resolveAnchorPoint(source?: Dynamic): CommentPoint | null;
  /** 把画板内矩形裁到画板范围后换成画布坐标；完全在画板外则为 null。 */
  artboardRectToCanvas(file?: Dynamic, rect?: Dynamic): CommentRect | null;
}

export function createCommentAnchorResolver(context: CommentAnchorResolverContext): CommentAnchorResolver {
  const { manifest, pageKey, fullscreenFile, lookup, elementRects, pageRects } = context;
  const { findArtboardByFile, findFileByHash, findNoteByHash, isFileVisible, getArtboardFrame } = lookup;

  const artboardRectToCanvas = (file?: Dynamic, rect?: Dynamic): CommentRect | null => {
    const artboard = findArtboardByFile(file);
    if (!artboard) return null;
    const frame = getArtboardFrame(artboard);
    const left = Math.max(0, rect.x);
    const top = Math.max(0, rect.y);
    const right = Math.min(frame.w, rect.x + rect.w);
    const bottom = Math.min(frame.h, rect.y + rect.h);
    return right <= left || bottom <= top
      ? null
      : { x: frame.x + left, y: frame.y + top, w: right - left, h: bottom - top };
  };

  const resolveAreaRect = (source?: Dynamic): CommentAreaRect | null | undefined => {
    if (source.kind === "notearea") {
      const note = fullscreenFile == null ? findNoteByHash(source.idHash) : null;
      return note
        ? rotatedAnnotationBounds(note, objectCommentAreaRect(note, context.annBox(note), source.box))
        : null;
    }
    if (source.kind === "boards") {
      if (fullscreenFile != null) return null;
      const boardRects = source.boards.flatMap((board?: Dynamic): Dynamic => {
        const boardFile = findFileByHash(board.fileHash);
        const boardArtboard = boardFile == null ? null : findArtboardByFile(boardFile);
        return boardArtboard
          ? [{ x: boardArtboard.x, y: boardArtboard.y, w: boardArtboard.w, h: boardArtboard.h }]
          : [];
      });
      const boardsUnion = unionCommentRects(boardRects);
      return boardsUnion ? denormalizeCommentArea(boardsUnion, source.box) : null;
    }
    if (source.kind !== "area") return null;
    const file = findFileByHash(source.fileHash);
    const artboard = file == null ? null : findArtboardByFile(file);
    if (!artboard || file == null || !isFileVisible(file)) return null;
    if (source.path == null) return denormalizeCommentArea(getArtboardFrame(artboard), source.box);
    const elementRect = elementRects.get(file)?.get(commentScopeKey(source.path, source.tid, source.fp));
    if (elementRect !== undefined)
      return elementRect === null
        ? null
        : artboardRectToCanvas(file, denormalizeCommentArea(elementRect, source.box));
    return undefined;
  };

  const resolveAnchorPoint = (source?: Dynamic): CommentPoint | null => {
    if (source.kind === "canvas") {
      const firstPageId = manifest.pages?.[0]?.id ?? "";
      const isCurrentPage = isCanvasPageMatch(
        (pageId?: Dynamic): Dynamic => source.pageHash === stableAnchorHash(pageId),
        pageKey === "" ? firstPageId : pageKey,
        firstPageId,
      );
      return fullscreenFile == null && isCurrentPage ? { x: source.x, y: source.y } : null;
    }
    if (source.kind === "note") {
      if (fullscreenFile != null) return null;
      const note = findNoteByHash(source.idHash);
      if (!note) return null;
      if (source.fx != null && source.fy != null)
        return objectCommentPoint(note, context.annBox(note), { fx: source.fx, fy: source.fy });
      const noteBounds = rotatedAnnotationBounds(note, context.annBox(note));
      return { x: noteBounds.x + noteBounds.w / 2, y: noteBounds.y + 12 };
    }
    if (source.kind === "notearea") {
      const note = fullscreenFile == null ? findNoteByHash(source.idHash) : null;
      return note ? objectCommentAreaHandlePoint(note, context.annBox(note), source.box) : null;
    }
    if (source.kind === "area" || source.kind === "boards") {
      const areaRect = resolveAreaRect(source);
      if (areaRect) return commentAreaHandlePoint(areaRect, source.box.corner);
      if (areaRect === null && source.kind === "area") return null;
      // 元素矩形尚未测得，或多画板区域失效：退回到第一个可见画板的中心
      const boardHashes =
        source.kind === "area"
          ? [source.fileHash]
          : source.boards.map((board?: Dynamic): Dynamic => board.fileHash);
      for (const boardHash of boardHashes as Dynamic) {
        const boardFile = findFileByHash(boardHash);
        const boardArtboard = boardFile == null ? null : findArtboardByFile(boardFile);
        if (!boardArtboard || !isFileVisible(boardArtboard.file)) continue;
        const boardFrame = getArtboardFrame(boardArtboard);
        return { x: boardFrame.x + boardFrame.w / 2, y: boardFrame.y + boardFrame.h / 2 };
      }
      return null;
    }
    const file = findFileByHash(source.fileHash);
    const artboard = file == null ? null : findArtboardByFile(file);
    if (!artboard || file == null || !isFileVisible(file)) return null;
    const frame = getArtboardFrame(artboard);
    if (source.kind === "artboard" && !("px" in source))
      return { x: frame.x + source.fx * frame.w, y: frame.y + source.fy * frame.h };
    if (source.kind === "artboard") {
      const entry = pageRects.get(file);
      if (!entry && file === fullscreenFile) return { x: frame.x + frame.w / 2, y: frame.y + frame.h / 2 };
      const pixelX =
        (entry?.x ?? 0) +
        (entry ? Math.min(source.px, Math.max(0, entry.w - commentPlacementInsetPixels)) : source.px);
      const pixelY =
        (entry?.y ?? 0) +
        (entry ? Math.min(source.py, Math.max(0, entry.h - commentPlacementInsetPixels)) : source.py);
      return pixelX < 0 || pixelY < 0 || pixelX > frame.w || pixelY > frame.h
        ? null
        : { x: frame.x + pixelX, y: frame.y + pixelY };
    }
    const elementRect = elementRects.get(file)?.get(commentScopeKey(source.path, source.tid, source.fp));
    if (elementRect === undefined) return { x: frame.x + frame.w / 2, y: frame.y + frame.h / 2 };
    if (elementRect === null) return null;
    const localX = elementRect.x + source.fx * elementRect.w;
    const localY = elementRect.y + source.fy * elementRect.h;
    return localX < 0 || localY < 0 || localX > frame.w || localY > frame.h
      ? null
      : { x: frame.x + localX, y: frame.y + localY };
  };

  return { resolveAreaRect, resolveAnchorPoint, artboardRectToCanvas };
}
