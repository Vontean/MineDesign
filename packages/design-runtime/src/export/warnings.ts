import type { ExportArtboard } from "../contracts/export";
import { exportFileName } from "./file-names";
import { isFlowExport } from "./paper-and-scale";
import type { FlowExportOptions } from "./paper-and-scale";

/** 画板导出的计数警告；没有任何警告时为空对象。 */
export interface ExportWarningCounts {
  innerClipped?: number;
  scrollRegion?: number;
  collapsed?: number;
  unrevealed?: number;
}

/** 画板的截取方式：无边框取盒子、已迁移取整页、流式取全长、其余取画板框。 */
export type ArtboardCaptureMode = "box" | "page" | "full" | "frame";

export interface ArtboardCaptureOptions {
  selectionRoot: "body";
  frame: { w: number; h: number };
  clipToFrame: boolean;
  fullLength: boolean;
  settle?: true;
}

/** 字体替换提示。 */
export const fontSubstitutionMessage =
  "Some text in this export may be in a substitute font: one of the design’s web fonts could not be used.";

export function getArtboardCaptureMode(
  artboard?: ExportArtboard,
  options: FlowExportOptions = {},
): ArtboardCaptureMode {
  return artboard?.frameless
    ? "box"
    : options.migrated
      ? "page"
      : artboard !== undefined && isFlowExport(artboard, options)
        ? "full"
        : "frame";
}

export function getArtboardCaptureOptions(
  artboard: ExportArtboard,
  options: FlowExportOptions & { settle?: boolean } = {},
): ArtboardCaptureOptions {
  return {
    selectionRoot: "body",
    frame: {
      w: artboard.w,
      h: artboard.h,
    },
    clipToFrame: getArtboardCaptureMode(artboard, options) === "frame",
    fullLength: getArtboardCaptureMode(artboard, options) === "full",
    ...(options.settle ? { settle: true as const } : {}),
  };
}

/** 页面里上报的计数（ic、sr、cd、ur）转成警告；只接受 1 到 100 万的整数。 */
export function normalizeExportWarnings(report: unknown): ExportWarningCounts {
  if (typeof report != "object" || report === null) return {};
  const count = (key: string): number => {
    const value = (report as Record<string, unknown>)[key];
    return typeof value == "number" && Number.isInteger(value) && value > 0 && value <= 1e6 ? value : 0;
  };
  const counts = {
    innerClipped: count("ic"),
    scrollRegion: count("sr"),
    collapsed: count("cd"),
    unrevealed: count("ur"),
  };
  return counts.innerClipped || counts.scrollRegion || counts.collapsed || counts.unrevealed ? counts : {};
}

/** 超过 3 个时只报数量，否则逐个加引号列出。 */
export function formatArtboardNames(names: readonly string[]): string {
  return names.length > 3 ? String(names.length) + " artboards" : names.map((name) => '"' + name + '"').join(", ");
}

/** 画板内容超出画板框的提示；asFrame 为真时只说明现状，不提示改用 Flow。 */
export function clippedArtboardsMessage(names: readonly string[], asFrame: boolean = false): string {
  const list = formatArtboardNames(names);
  return asFrame
    ? list +
        (names.length === 1
          ? " runs past its frame, so the PNG stops at the frame."
          : " run past their frames, so each PNG stops at its frame.")
    : names.length === 1
      ? list +
        " runs past its frame, so the PNG stops at the frame — set Print mode to Flow to export its full length."
      : list +
        " run past their frames, so each PNG stops at its frame — set Print mode to Flow to export the full length.";
}

/** 字体被替换时返回提示；计数为空或为 0 时没有提示。 */
export function fontSubstitutionWarnings(count?: number): string[] {
  return count !== undefined && count > 0 ? [fontSubstitutionMessage] : [];
}

/** 画板框比内容高、文件末尾留白的提示；withAdvice 为真时附上裁掉留白的做法。 */
export function emptyExportTailMessage(
  names: readonly string[],
  tailPx: number,
  withAdvice: boolean = false,
): string {
  const list = formatArtboardNames(names);
  const approx = "about " + String(Math.round(tailPx / 10) * 10) + " px";
  const single = names.length === 1;
  const summary = single
    ? list + "’s frame is " + approx + " taller than its content, so the file ends with that much blank space"
    : list + " have frames taller than their content (by up to " + approx + "), so each ends with blank space in the file";
  const advice =
    " To trim that space, choose Fit to content under Height in " + (single ? "the" : "each") + " artboard’s settings.";
  return summary + "." + (withAdvice ? advice : "");
}

export function selectionExportFileName(path: string, extension: string, title?: string): string {
  return `${exportFileName(path, title)}-selection.${extension}`;
}
