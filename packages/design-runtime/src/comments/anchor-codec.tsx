/** 评论锚点的编码：把锚点序列化成一条只含 nth-of-type 选择器片段的字符串，并能解析回来。 */
import { type Dynamic } from "../runtime-types";
import { load_react, load_react_dom, load_react_jsx_runtime } from "../dependencies";
import { initializeInspectorContext } from "../editor/inspector/context";
import { toModuleNamespace } from "../module-helpers";
import { initializePlatformCdsIsland } from "../platform/cds-island";
import type { CommentArea } from "./area-geometry";

/** 区域锚点里的归一化盒子；corner 记录拖动的角（0–3）。 */
export interface AnchorBox extends CommentArea {
  corner?: number | null;
}

/** 元素内的位置：path 是 " > " 连接的元素路径，tid 是模板序号，fp 是文件指纹。 */
export interface ElementAnchor {
  kind: "el";
  path: string;
  tid?: number | null;
  fp?: unknown;
  file: string;
  fx: number;
  fy: number;
}
export interface ArtboardFractionAnchor {
  kind: "artboard";
  file: string;
  fx: number;
  fy: number;
}
export interface ArtboardPixelAnchor {
  kind: "artboard";
  file: string;
  px: number;
  py: number;
}
export interface NoteAnchor {
  kind: "note";
  id: string;
  fx?: number | null;
  fy?: number | null;
}
export interface NoteAreaAnchor {
  kind: "notearea";
  id: string;
  box: AnchorBox;
}
export interface CanvasAnchor {
  kind: "canvas";
  page: string;
  x: number;
  y: number;
}
export interface AreaAnchor {
  kind: "area";
  path?: string | null;
  tid?: number | null;
  fp?: unknown;
  file: string;
  box: AnchorBox;
}
export interface BoardsAnchor {
  kind: "boards";
  page: string;
  boards: { file: string; cov: number }[];
  box: AnchorBox;
}
/** 可以序列化的评论锚点。 */
export type DesignCommentAnchor =
  | ElementAnchor
  | ArtboardFractionAnchor
  | ArtboardPixelAnchor
  | NoteAnchor
  | NoteAreaAnchor
  | CanvasAnchor
  | AreaAnchor
  | BoardsAnchor;

/** 解析结果：文件、页面、备注只剩哈希，位置换回数值。 */
export type ParsedDesignCommentAnchor =
  | { kind: "area"; fileHash: string; path: string | null; tid: number | null; fp?: string; box: AnchorBox }
  | { kind: "boards"; pageHash: string; boards: { fileHash: string; cov: number }[]; box: AnchorBox }
  | { kind: "artboard"; fileHash: string; fx: number; fy: number }
  | { kind: "el"; fileHash: string; path: string; tid: number | null; fp?: string; fx: number; fy: number }
  | { kind: "artboard"; fileHash: string; px: number; py: number }
  | { kind: "notearea"; idHash: string; box: AnchorBox }
  | { kind: "note"; idHash: string; fx?: number; fy?: number }
  | { kind: "canvas"; pageHash: string; x: number; y: number };

var react_bB: Dynamic;
var reactDOM_idn: Dynamic;
var jsx_sdn: Dynamic;
var react_YEt: Dynamic;

export const anchorRootIdPattern = /^#[A-Za-z_][A-Za-z0-9_-]{0,31}$/;
export const anchorElementPathPattern = /^[a-z][a-z0-9-]{0,23}:nth-of-type\([1-9][0-9]{0,3}\)$/;
export const anchorPayloadPattern = /^dc([eancgbod])([0-9a-z]*):nth-of-type\(([1-9][0-9]{0,3})\)$/;
export const anchorTemplateIdPattern = /^dct:nth-of-type\(([1-9][0-9]{0,3})\)$/;
export const anchorFingerprintPattern = /^x[0-9a-z]{7}$/;
export const anchorFileFingerprintPattern = /^dcf([0-9a-z]{1,21}):nth-of-type\(1\)$/;
export const anchorPagePattern = /^dcp([0-9a-f]{12}):nth-of-type\(1\)$/;
export const anchorAreaReferencePattern = /^dcr([0-9a-f]{12})(\d):nth-of-type\(1\)$/;
export const maxBase36AnchorCoordinate = 36 ** 4 - 1;

/** 比例编码成 4 位十进制（0–9999）；非有限数按 0.5。 */
export const encodeAnchorFraction = (value: number | null | undefined): string =>
  String(Math.round(Math.min(1, Math.max(0, Number.isFinite(value) ? (value as number) : 0.5)) * 9999)).padStart(4, "0");

export const decodeAnchorFraction = (text: string): number => Number(text) / 9999;

export const encodeBase36AnchorCoordinate = (value: number | null | undefined): string =>
  Math.round(Math.min(maxBase36AnchorCoordinate, Math.max(0, Number.isFinite(value) ? (value as number) : 0)))
    .toString(36)
    .padStart(4, "0");

/** 带符号坐标：n/p 加 7 位数字。 */
export const encodeSignedAnchorCoordinate = (value: number | null | undefined): string => {
  const rounded = Math.round(Math.min(9999999, Math.max(-9999999, Number.isFinite(value) ? (value as number) : 0)));
  return (rounded < 0 ? "n" : "p") + String(Math.abs(rounded)).padStart(7, "0");
};

export const decodeSignedAnchorCoordinate = (text: string): number | null => {
  const match = /^([np])(\d{7})$/.exec(text);
  return match ? (match[1] === "n" ? -1 : 1) * Number(match[2]) : null;
};

/** 模板序号（和可选的文件指纹）编成路径片段，序号无效时为空串。 */
export const encodeAnchorTemplatePath = (path: string, templateId?: number | null, fingerprint?: unknown): string =>
  templateId != null && Number.isInteger(templateId) && templateId >= 0 && templateId < 9999
    ? (typeof fingerprint == "string" && anchorFingerprintPattern.test(fingerprint) && path.split(" > ").length <= 7
        ? "dcf" + fingerprint + ":nth-of-type(1) > "
        : "") +
      "dct:nth-of-type(" +
      String(templateId + 1) +
      ") > "
    : "";

export const encodeAnchorPayloadSelector = (type: string, payload: string): string =>
  "dc" + type + payload + ":nth-of-type(" + String(1) + ")";

/** 区域边界编码成两位百分数；end 为真时按右/下边界向上取整再减 1。 */
export const encodeAnchorAreaPercent = (value: number | null | undefined, end: boolean): string => {
  const percent = Math.min(1, Math.max(0, Number.isFinite(value) ? (value as number) : end ? 1 : 0)) * 100;
  const cell = Math.min(99, Math.max(0, end ? Math.ceil(percent - 1e-7) - 1 : Math.floor(percent + 1e-7)));
  return String(cell).padStart(2, "0");
};

export const encodeAnchorArea = (box: AnchorBox): string => {
  const x0 = encodeAnchorAreaPercent(box.x0, false);
  const y0 = encodeAnchorAreaPercent(box.y0, false);
  const x1 = encodeAnchorAreaPercent(box.x1, true);
  const y1 = encodeAnchorAreaPercent(box.y1, true);
  return x0 + y0 + (x1 < x0 ? x0 : x1) + (y1 < y0 ? y0 : y1) + (box.corner != null ? String(box.corner) : "");
};

export const decodeAnchorArea = (text: string): AnchorBox | null => {
  const match = /^(\d\d)(\d\d)(\d\d)(\d\d)([0-3])?$/.exec(text);
  if (!match) return null;
  const x0 = Number(match[1]) / 100;
  const y0 = Number(match[2]) / 100;
  const x1 = (Number(match[3]) + 1) / 100;
  const y1 = (Number(match[4]) + 1) / 100;
  return x1 > x0 && y1 > y0
    ? match[5] != null
      ? { x0, y0, x1, y1, corner: Number(match[5]) }
      : { x0, y0, x1, y1 }
    : null;
};

/** 覆盖比例编码成一位：85% 以上记 9，其余按 0–8 分档。 */
export const encodeAnchorCoverage = (coverage: number | null | undefined): string => {
  const value = Number.isFinite(coverage) ? (coverage as number) : 0;
  return value >= 0.85 ? "9" : String(Math.min(8, Math.max(0, Math.floor(value * 9 + 1e-9))));
};

/** 把字符串稳定地哈希成 12 位十六进制。 */
export function stableAnchorHash(text: string): string {
  let lowHash = -559038737;
  let highHash = 1103547991;
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    lowHash = Math.imul(lowHash ^ code, 2654435761);
    highHash = Math.imul(highHash ^ code, 1597334677);
  }
  lowHash = Math.imul(lowHash ^ (lowHash >>> 16), 2246822507) ^ Math.imul(highHash ^ (highHash >>> 13), 3266489909);
  highHash = Math.imul(highHash ^ (highHash >>> 16), 2246822507) ^ Math.imul(lowHash ^ (lowHash >>> 13), 3266489909);
  return (4294967296 * (2097151 & highHash) + (lowHash >>> 0)).toString(16).padStart(14, "0").slice(-12);
}

/** 元素路径最多 8 段，每段是普通元素选择器；只有第一段可以是 #id。 */
export function isValidAnchorElementPath(path: string): boolean {
  const segments = path.split(" > ");
  return segments.length === 0 || segments.length > 8
    ? false
    : segments.every(
        (segment, index) =>
          (anchorElementPathPattern.test(segment) &&
            !anchorPayloadPattern.test(segment) &&
            !anchorTemplateIdPattern.test(segment) &&
            !anchorFileFingerprintPattern.test(segment) &&
            !anchorPagePattern.test(segment) &&
            !anchorAreaReferencePattern.test(segment)) ||
          (index === 0 && anchorRootIdPattern.test(segment)),
      );
}

/** 序列化锚点；路径、长度或结构不合规时返回 null。 */
export function serializeDesignCommentAnchor(anchor: DesignCommentAnchor): string | null {
  let selector: string;
  if (anchor.kind === "el") {
    if (!isValidAnchorElementPath(anchor.path)) return null;
    selector =
      anchor.path +
      " > " +
      encodeAnchorTemplatePath(anchor.path, anchor.tid, anchor.fp) +
      encodeAnchorPayloadSelector(
        "e",
        stableAnchorHash(anchor.file) + encodeAnchorFraction(anchor.fx) + encodeAnchorFraction(anchor.fy),
      );
  } else if (anchor.kind === "artboard")
    selector =
      "px" in anchor
        ? encodeAnchorPayloadSelector(
            "d",
            stableAnchorHash(anchor.file) + encodeBase36AnchorCoordinate(anchor.px) + encodeBase36AnchorCoordinate(anchor.py),
          )
        : encodeAnchorPayloadSelector(
            "a",
            stableAnchorHash(anchor.file) + encodeAnchorFraction(anchor.fx) + encodeAnchorFraction(anchor.fy),
          );
  else if (anchor.kind === "note")
    selector = encodeAnchorPayloadSelector(
      "n",
      stableAnchorHash(anchor.id) +
        (anchor.fx != null && anchor.fy != null ? encodeAnchorFraction(anchor.fx) + encodeAnchorFraction(anchor.fy) : ""),
    );
  else if (anchor.kind === "notearea")
    selector = encodeAnchorPayloadSelector("o", stableAnchorHash(anchor.id) + encodeAnchorArea(anchor.box));
  else if (anchor.kind === "canvas")
    selector =
      "dcp" +
      stableAnchorHash(anchor.page) +
      ":nth-of-type(1) > " +
      encodeAnchorPayloadSelector("c", encodeSignedAnchorCoordinate(anchor.x) + encodeSignedAnchorCoordinate(anchor.y));
  else if (anchor.kind === "area") {
    let elementPart = "";
    if (anchor.path != null) {
      if (!isValidAnchorElementPath(anchor.path)) return null;
      elementPart = anchor.path + " > " + encodeAnchorTemplatePath(anchor.path, anchor.tid, anchor.fp);
    }
    selector =
      elementPart + encodeAnchorPayloadSelector("g", stableAnchorHash(anchor.file) + encodeAnchorArea(anchor.box));
  } else {
    if (anchor.boards.length === 0 || anchor.boards.length > 7) return null;
    const boardSelectors = anchor.boards
      .map((board) => "dcr" + stableAnchorHash(board.file) + encodeAnchorCoverage(board.cov) + ":nth-of-type(1)")
      .sort();
    selector = [
      "dcp" + stableAnchorHash(anchor.page) + ":nth-of-type(1)",
      ...boardSelectors,
      encodeAnchorPayloadSelector("b", encodeAnchorArea(anchor.box)),
    ].join(" > ");
  }
  return selector
    .split(" > ")
    .every((segment, index) => anchorElementPathPattern.test(segment) || (index === 0 && anchorRootIdPattern.test(segment))) &&
    selector.length <= 1024 &&
    selector.split(" > ").length <= 10
    ? selector
    : null;
}

/** 解析序列化的锚点；格式不对时返回 null。 */
export function parseDesignCommentAnchor(serializedAnchor: unknown): ParsedDesignCommentAnchor | null {
  if (typeof serializedAnchor != "string" || serializedAnchor === "" || serializedAnchor.length > 1024) return null;
  const segments = serializedAnchor.split(" > ");
  if (segments.length > 10) return null;
  const payload = anchorPayloadPattern.exec(segments[segments.length - 1] ?? "");
  if (!payload || Number(payload[3]) !== 1) return null;
  const type = payload[1];
  const body = payload[2] ?? "";
  let pathSegments = segments.slice(0, -1);
  const templateMatch =
    type === "e" || type === "g" ? anchorTemplateIdPattern.exec(pathSegments[pathSegments.length - 1] ?? "") : null;
  const templateId = templateMatch ? Number(templateMatch[1]) - 1 : null;
  templateMatch && (pathSegments = pathSegments.slice(0, -1));
  let fingerprint: { fp?: string } = {};
  // 模板片段前可能有文件指纹片段；取最靠近模板的那个有效指纹
  while (templateMatch) {
    const fileFingerprint = anchorFileFingerprintPattern.exec(pathSegments[pathSegments.length - 1] ?? "");
    if (!fileFingerprint) break;
    pathSegments = pathSegments.slice(0, -1);
    fingerprint.fp == null &&
      anchorFingerprintPattern.test(fileFingerprint[1].slice(0, 8)) &&
      (fingerprint = { fp: fileFingerprint[1].slice(0, 8) });
  }
  const elementPath = pathSegments.join(" > ");
  if (type === "g") {
    const match = /^([0-9a-f]{12})(\d{8}[0-3]?)$/.exec(body);
    const box = match ? decodeAnchorArea(match[2]) : null;
    return !match || !box || (elementPath === "" && templateMatch) || (elementPath !== "" && !isValidAnchorElementPath(elementPath))
      ? null
      : {
          kind: "area",
          fileHash: match[1],
          path: elementPath === "" ? null : elementPath,
          tid: elementPath === "" ? null : templateId,
          ...fingerprint,
          box,
        };
  }
  if (type === "b") {
    const box = decodeAnchorArea(body);
    const page = anchorPagePattern.exec(pathSegments[0] ?? "");
    if (!box || !page || pathSegments.length < 2 || pathSegments.length > 8) return null;
    const boards: { fileHash: string; cov: number }[] = [];
    let previous = "";
    for (const boardSegment of pathSegments.slice(1)) {
      const reference = anchorAreaReferencePattern.exec(boardSegment);
      if (!reference || boardSegment <= previous) return null;
      previous = boardSegment;
      boards.push({ fileHash: reference[1], cov: reference[2] === "9" ? 1 : Number(reference[2]) / 9 });
    }
    return { kind: "boards", pageHash: page[1], boards, box };
  }
  if (type === "e" || type === "a") {
    const match = /^([0-9a-f]{12})(\d{4})(\d{4})$/.exec(body);
    if (!match) return null;
    const [, fileHash, fx, fy] = match;
    return type === "a"
      ? elementPath === ""
        ? { kind: "artboard", fileHash, fx: decodeAnchorFraction(fx), fy: decodeAnchorFraction(fy) }
        : null
      : elementPath === "" || !isValidAnchorElementPath(elementPath)
        ? null
        : {
            kind: "el",
            fileHash,
            path: elementPath,
            tid: templateId,
            ...fingerprint,
            fx: decodeAnchorFraction(fx),
            fy: decodeAnchorFraction(fy),
          };
  }
  if (type === "d") {
    const match = elementPath === "" ? /^([0-9a-f]{12})([0-9a-z]{4})([0-9a-z]{4})$/.exec(body) : null;
    return match
      ? { kind: "artboard", fileHash: match[1], px: parseInt(match[2], 36), py: parseInt(match[3], 36) }
      : null;
  }
  if (type === "o") {
    const match = elementPath === "" ? /^([0-9a-f]{12})(\d{8}[0-3]?)$/.exec(body) : null;
    const box = match ? decodeAnchorArea(match[2]) : null;
    return match && box ? { kind: "notearea", idHash: match[1], box } : null;
  }
  if (type === "n") {
    const match = elementPath === "" ? /^([0-9a-f]{12})(?:(\d{4})(\d{4}))?$/.exec(body) : null;
    return match
      ? match[2] != null && match[3] != null
        ? { kind: "note", idHash: match[1], fx: decodeAnchorFraction(match[2]), fy: decodeAnchorFraction(match[3]) }
        : { kind: "note", idHash: match[1] }
      : null;
  }
  const page = pathSegments.length === 1 ? anchorPagePattern.exec(pathSegments[0]) : null;
  const x = decodeSignedAnchorCoordinate(body.slice(0, 8));
  const y = decodeSignedAnchorCoordinate(body.slice(8));
  return page && x != null && y != null && body.length === 16 ? { kind: "canvas", pageHash: page[1], x, y } : null;
}

export { jsx_sdn, react_bB, react_YEt, reactDOM_idn };
export function installCommentsAnchorCodec(): () => void {
  return () => {
    react_bB = toModuleNamespace(load_react(), 1);
    reactDOM_idn = toModuleNamespace(load_react_dom(), 1);
    initializePlatformCdsIsland();
    initializeInspectorContext();
    jsx_sdn = toModuleNamespace(load_react_jsx_runtime(), 1);
    react_YEt = toModuleNamespace(load_react(), 1);
  };
}
