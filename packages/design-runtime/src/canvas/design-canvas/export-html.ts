import { uiMessage } from "@minedesign/contracts/ui-messages";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { reportExportEvent } from "../../export/analytics";
import { ExportDownloadsResolvedValue } from "../../export/downloads";
import { exportBaseFileName } from "../../export/file-names";
import { collectArtboardFontDescriptors } from "../../export/font-usage";
import { ExportHtmlError, produceStandaloneHtmlExport, selectHtmlExportArtboards } from "../../export/html-producer";
import { classifyHtmlDelivery, type DeliveryResult } from "../../export/outcomes";
import { designAnalyticsEvents, reportExportOutcome } from "../../platform/health-and-analytics";
import { isLoadingArtboardHtml } from "../../platform/design-document-adapter";
import { canvasMetadataFile, getKvClient, projectFileKey } from "../../platform/file-content";
import { errorMessage } from "../../platform/rate-limiter";
import { createPreviewHandle } from "../../preview/evaluation";
import type { Dynamic } from "../../runtime-types";
import type { CanvasManifest } from "../manifest-history";

interface ArtboardExportEntry {
  flushPending(): Promise<unknown>;
  isReady(): boolean;
  previewFrameRef: { current: HTMLIFrameElement | null };
}

interface CanvasHtmlExportOptions {
  assets: Dynamic;
  doc: { content(): { files: Record<string, unknown> } };
  filePath: string;
  artboards: { current: Map<string, ArtboardExportEntry> };
  manifest: { current: CanvasManifest };
  activePage: { current: string };
  playPreview: { current: string | null };
  importerReady: boolean;
  showToast(message: string, kind: "error"): void;
}

async function collectExportFonts(
  entries: Map<string, ArtboardExportEntry>,
  paths: string[],
) {
  const fonts = await Promise.all(paths.map((path) => {
    const entry = entries.get(path);
    const preview = entry?.isReady() ? createPreviewHandle(entry.previewFrameRef.current) : null;
    return preview === null ? null : collectArtboardFontDescriptors(preview);
  }));
  return fonts.every((item) => item !== null) ? fonts.flat() : undefined;
}

async function buildCanvasHtml({
  assets, doc, filePath, artboards, manifest, activePage, playPreview, importerReady,
}: CanvasHtmlExportOptions) {
  const title = document.title || exportBaseFileName(filePath);
  const signal = AbortSignal.timeout(55_000);
  const files = doc.content().files;
  async function read(path: string) {
    const content = (await getKvClient().get(projectFileKey(path))) ?? files[path];
    if (typeof content !== "string") return;
    if (path.endsWith(".dc.html") && isLoadingArtboardHtml(content)) {
      throw new ExportHtmlError("not_loaded", "an artboard on this canvas has not loaded yet");
    }
    return content;
  }

  for (const entry of artboards.current.values()) await entry.flushPending();
  const selection = selectHtmlExportArtboards(manifest.current, activePage.current, playPreview.current);
  const fontLoads = importerReady
    ? await collectExportFonts(artboards.current, selection.artboards.map((artboard: { file: string }) => artboard.file))
    : undefined;
  const exported = await produceStandaloneHtmlExport({
    kind: "canvas",
    title,
    ...selection,
    paths: Object.keys(files).filter((path) => path !== canvasMetadataFile),
    read,
    fetchBlob: (url: string) => fetch(url, { credentials: "same-origin", signal }),
    assets,
    importerReady,
    ...(fontLoads === undefined ? {} : { fontLoads }),
  }, { signal });
  for (const warning of exported.warnings) console.warn("[design/export] " + warning);
  return { filename: exported.filename, data: exported.blob };
}

function htmlExportErrorCode(error: unknown): string | undefined {
  return error instanceof ExportHtmlError ? (error as { code: string }).code : undefined;
}

function describeHtmlExportError(error: unknown) {
  switch (htmlExportErrorCode(error)) {
    case "too_large":
      return uiMessage("canvas.designCanvas.thisDesignIsTooLarge", { limitMb: String(ExportDownloadsResolvedValue >> 20) });
    case "not_loaded":
      return uiMessage("canvas.designCanvas.anArtboardIsStillLoading");
    case "timeout":
      return uiMessage("canvas.designCanvas.preparingThisDesignToSend");
    default:
      return uiMessage("canvas.designCanvas.couldnTPrepareThisDesign") + errorMessage(error) + ".";
  }
}

export function useCanvasHtmlExport(options: CanvasHtmlExportOptions) {
  const { assets, doc, filePath, importerReady, showToast } = options;
  const lastError: { current: unknown } = React.useRef(undefined);
  const produce = React.useCallback(async () => {
    lastError.current = undefined;
    try {
      const result = await buildCanvasHtml(options);
      reportExportEvent("htmlBuilt");
      return result;
    } catch (error) {
      lastError.current = error;
      console.error("[design/export]", error);
      const code = htmlExportErrorCode(error);
      if (code === "too_large") reportExportEvent("tooLarge");
      else if (code !== "not_loaded" && code !== "empty" && code !== "timeout") reportExportEvent("failed");
      showToast(describeHtmlExportError(error), "error");
      throw error;
    }
  }, [assets, doc, filePath, importerReady, showToast]);
  const reportResult = React.useCallback((result: DeliveryResult) => {
    reportExportOutcome(classifyHtmlDelivery(result, htmlExportErrorCode(lastError.current)), designAnalyticsEvents.exported.html);
  }, []);
  return { produce, reportResult };
}
