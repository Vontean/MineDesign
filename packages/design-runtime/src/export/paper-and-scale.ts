import { uiMessage } from '@minedesign/contracts/ui-messages';
import type {
  PaperSize,
  PaperSizeName,
  ExportArtboard,
  ExportHeight,
  ImageCaptureScale,
} from "../contracts/export";
import type { Size } from "../contracts/geometry";
import { maxCaptureEdge, maxCapturePixels } from "./capture-runtime";
import { PlatformFileContentLimit_6 } from "../platform/file-content";

/** 判断导出方式时，画板需要的字段。 */
export type PrintableArtboard = ExportArtboard;

export interface FlowExportOptions {
  /** 已迁移的作品不把 expand=fill 当作流式 */
  migrated?: boolean;
  fillFlows?: boolean;
}

/** 使用 Letter 纸张的地区。 */
export const letterPaperRegions: Set<string> = new Set([
  "BZ", "CA", "CL", "CO", "CR", "GT", "MX", "NI", "PA", "PH", "PR", "SV", "US", "VE",
]);
/** 测得高度与声明高度相差不超过它（px）时视为一致。 */
export const exportHeightTolerance = 4;
/** 自然高度比声明高度至少矮这么多（px）才改用自然高度。 */
const naturalHeightShrinkThreshold = 120;
/** 画板末尾空白至少这么高（px）才提示可以裁掉。 */
export const minEmptyExportTail = 400;
/** 画板缩略图宽度（px）。 */
export const artboardThumbnailWidth = 320;
export const exportImageMimeTypes: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
};

/** 纸张尺寸；Letter 的名称随语言变化，所以由 install 函数赋值。 */
export var paperSizes: Record<PaperSizeName, PaperSize>;

/** 按系统语言推断纸张：美洲等地区用 Letter，其余用 A4。 */
export function inferLocalePaperSize(
  languages: readonly (string | null | undefined)[] = typeof navigator !==
  "undefined"
    ? navigator.languages?.length
      ? navigator.languages
      : [navigator.language]
    : [],
): PaperSizeName {
  for (const language of languages) {
    const region = /^[a-z]{2,3}(?:[-_][a-z]{4})?[-_]([a-z]{2})(?:[-_]|$)/i.exec(
      language ?? "",
    )?.[1];
    if (region)
      return letterPaperRegions.has(region.toUpperCase()) ? "letter" : "a4";
  }
  return /^en$/i.test(languages[0] ?? "") ? "letter" : "a4";
}

/** 按画板尺寸推断纸张：先看宽度，再看宽高比；都不符返回 undefined。 */
export function inferArtboardPaperSize(size: Size): PaperSizeName | undefined {
  const within = (actual: number, expected: number, tolerance: number): boolean =>
    Math.abs(actual - expected) <= expected * tolerance;
  const names: readonly PaperSizeName[] = ["letter", "a4"];
  for (const name of names)
    if (within(size.w, (paperSizes[name].wPt * 96) / 72, 0.005)) return name;
  for (const name of names)
    if (
      size.w > 0 &&
      within(
        size.h / size.w,
        paperSizes[name].hPt / paperSizes[name].wPt,
        0.01,
      )
    )
      return name;
}

/** 分页导出：非流式、非无边框，且要填满页面或尺寸不是已知纸张。 */
export const needsPagedExport = (artboard: PrintableArtboard): boolean =>
  artboard.print !== "flow" &&
  !artboard.frameless &&
  (artboard.expand === "fill" || inferArtboardPaperSize(artboard) === undefined);

export const isFillPagedExport = (artboard: PrintableArtboard): boolean =>
  needsPagedExport(artboard) && artboard.expand === "fill";

/** 流式导出：显式 print=flow，或（开启 fillFlows 且未迁移时）expand=fill。 */
export const isFlowExport = (
  artboard: Partial<PrintableArtboard>,
  { migrated = false, fillFlows = false }: FlowExportOptions = {},
): boolean =>
  artboard.print === "flow" || (fillFlows && !migrated && artboard.expand === "fill");

/** 根据测得高度决定导出高度：更高用测得值，超限为 capped，明显偏矮用自然高度，否则 fits。 */
export function resolveMeasuredExportHeight(
  declared: number,
  measured: number,
  naturalHeight?: number,
): ExportHeight {
  const capped = Math.min(PlatformFileContentLimit_6, Math.ceil(measured));
  if (capped > Math.round(declared) + exportHeightTolerance) return capped;
  if (measured > PlatformFileContentLimit_6 + exportHeightTolerance) return "capped";
  if (naturalHeight !== undefined && Number.isFinite(naturalHeight)) {
    const natural = Math.ceil(naturalHeight);
    if (Math.round(declared) - natural >= naturalHeightShrinkThreshold) return natural;
  }
  return "fits";
}

export function getArtboardPaperSize(artboard: PrintableArtboard): PaperSizeName {
  return artboard.paper ?? inferArtboardPaperSize(artboard) ?? inferLocalePaperSize();
}

export function paperHeightForWidth(width: number, paper: PaperSizeName): number {
  const size = paperSizes[paper];
  return Math.round((width * size.hPt) / size.wPt);
}

/** 图片导出不超过单边与总像素上限的最大倍率。 */
export function maxImageCaptureScale(width: number, height: number): number {
  return Math.min(
    maxCaptureEdge / Math.max(width, height, 1),
    Math.sqrt(maxCapturePixels / Math.max(width * height, 1)),
  );
}

/** 1x、2x、3x 三档导出倍率及是否在上限内。 */
export function imageCaptureScaleOptions(width: number, height: number): ImageCaptureScale[] {
  const maxScale = maxImageCaptureScale(width, height);
  return [1, 2, 3].map((scale) => ({
    scale,
    outW: Math.round(width * scale),
    outH: Math.round(height * scale),
    fits: scale <= maxScale + 1e-9,
  }));
}

export function installExportPaperAndScale(): () => void {
  return () => {
    paperSizes = {
      letter: {
        get label() { return uiMessage("canvas.paperAndScale.letter"); },
        wPt: 612,
        hPt: 792,
      },
      a4: {
        label: "A4",
        wPt: 595.28,
        hPt: 841.89,
      },
    };
  };
}
