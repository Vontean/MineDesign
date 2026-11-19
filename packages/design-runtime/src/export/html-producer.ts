/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { normalizeDcScriptType } from "../editor/html/dc-document";
import { escapeHtml, escapeHtmlAttributeValue } from "../editor/html/escaping";
import { createExportAssetResolver, exportMimeForPath } from "./asset-resolver";
import { ExportDownloadsResolvedValue } from "./downloads";
import { exportBaseFileName, sanitizeExportFileName } from "./file-names";
import { createFontAwareExportResolver } from "./font-usage";
import { artboardsInReadingOrder } from "./reading-order";
import { bundleStandaloneDesignHtml, decodeBinaryBase64, redactProjectServeAccessToken } from "./standalone-html";
import { prepareStaticArtboardExport } from "./static-artboard";
import { artboardRadiusCss, designPageId } from "../platform/file-content";

var designExportRuntimeSource: Dynamic;
var exportImageFilenamePattern: Dynamic;
var exportBlobPathPattern: Dynamic;
var ExportHtmlError: Dynamic;
var exportedCanvasOverviewFilename: Dynamic;
function selectHtmlExportArtboards(
  manifest?: Dynamic,
  pageId?: Dynamic,
  focusedFile?: Dynamic,
): Dynamic {
  let value: Dynamic =
    focusedFile === null
      ? undefined
      : manifest.artboards.find(
          (artboard?: Dynamic): Dynamic => artboard.file === focusedFile,
        );
  return value !== undefined
    ? {
        artboards: [value],
        open: value.file,
      }
    : {
        artboards: manifest.artboards.filter(
          (artboard?: Dynamic): Dynamic =>
            designPageId(artboard, manifest.pages) === pageId &&
            !artboard.frameless,
        ),
      };
}
function exportedCanvasOverviewHtml(
  title?: Dynamic,
  manifest?: Dynamic,
): Dynamic {
  let value: Dynamic = artboardsInReadingOrder(manifest).map(
    (artboard?: Dynamic): Dynamic => {
      let artboardTitleText: Dynamic =
          artboard.title ?? exportBaseFileName(artboard.file),
        width: Dynamic = Math.max(1, Math.round(artboard.w)),
        height: Dynamic = Math.max(1, Math.round(artboard.h)),
        radius: Dynamic = artboardRadiusCss(artboard.radius);
      return (
        '<section class="board"><h2>' +
        escapeHtml(artboardTitleText) +
        '</h2><iframe src="' +
        escapeHtmlAttributeValue(encodeURI(artboard.file)) +
        '" title="' +
        escapeHtmlAttributeValue(artboardTitleText) +
        '" width="' +
        String(width) +
        '" height="' +
        String(height) +
        '" loading="eager" style="width:' +
        String(width) +
        "px;height:" +
        String(height) +
        "px" +
        (radius === undefined ? "" : ";border-radius:" + radius) +
        '"></iframe></section>'
      );
    },
  ).join(`
`);
  return [
    "<!DOCTYPE html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    "<title>" + escapeHtml(title) + "</title>",
    "<style>",
    'html{background:#f5f4ef;color:#1f1e1d;font:14px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif}',
    "body{margin:0;padding:48px;display:flex;flex-direction:column;align-items:flex-start;gap:48px}",
    ".board h2{margin:0 0 12px;font-size:13px;font-weight:500;color:#6b6a68}",
    ".board iframe{display:block;border:0;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.12)}",
    "</style>",
    "</head>",
    "<body>",
    value,
    "</body>",
    "</html>",
    "",
  ].join(`
`);
}
function standaloneExportFilename(
  title?: Dynamic,
  file?: Dynamic,
  artboardTitle?: Dynamic,
): Dynamic {
  let value: Dynamic =
      sanitizeExportFileName(title) ||
      exportBaseFileName(file),
    sanitizedArtboardTitle: Dynamic =
      artboardTitle === undefined
        ? ""
        : sanitizeExportFileName(artboardTitle);
  return (
    [...(sanitizedArtboardTitle === "" ? value : value + " \u2013 " + sanitizedArtboardTitle)]
      .slice(0, 120)
      .join("")
      .trimEnd()
      .replace(/ –$/, "") + ".html"
  );
}
function findUnremovedServeTokenWarning(warnings?: Dynamic): Dynamic {
  return warnings.find(
    (warning?: Dynamic): Dynamic =>
      warning.startsWith("serve token not removed:"),
  );
}
async function fetchExportProjectBlob(
  fetchBlob?: Dynamic,
  path?: Dynamic,
): Promise<Dynamic> {
  if (!fetchBlob) return null;
  try {
    let value: Dynamic = await fetchBlob(path);
    if (!value.ok) return null;
    let mimeType: Dynamic =
      value.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ||
      "application/octet-stream";
    return {
      data: new Uint8Array(await value.arrayBuffer()),
      mime: mimeType,
    };
  } catch {
    return null;
  }
}
function createDesignDocumentAssetReader(document?: Dynamic): Dynamic {
  let values: Dynamic = new Set(document.paths),
    value: Dynamic = new TextEncoder();
  return async (path?: Dynamic): Promise<Dynamic> => {
    let blobPath: Dynamic = exportBlobPathPattern.exec(path)?.[1];
    if (blobPath !== undefined)
      return fetchExportProjectBlob(document.fetchBlob, blobPath);
    if (!values.has(path)) return null;
    let content: Dynamic = await document.read(path);
    if (content === undefined) return null;
    let mimeType: Dynamic = exportMimeForPath(path);
    if (exportImageFilenamePattern.test(path))
      try {
        return {
          data: decodeBinaryBase64(
            content.replace(/^data:[^,]*,/, ""),
          ),
          mime: mimeType,
        };
      } catch {
        return null;
      }
    return {
      data: value.encode(
        mimeType === "text/html"
          ? normalizeDcScriptType(content)
          : content,
      ),
      mime: mimeType,
    };
  };
}
function explainSkippedGoogleFontAssets(
  warnings?: Dynamic,
  skippedFonts?: Dynamic,
): Dynamic {
  if (skippedFonts.length === 0) return warnings;
  let value: Dynamic = skippedFonts.map(
      (warning?: Dynamic): Dynamic =>
        "asset not found: " +
        redactProjectServeAccessToken(warning),
    ),
    callback: Dynamic = (warning?: Dynamic): Dynamic =>
      value.some(
        (embeddedWarning?: Dynamic): Dynamic =>
          warning === embeddedWarning ||
          warning.startsWith(embeddedWarning + ' \u2014 inside embedded page "'),
      ),
    length: Dynamic = skippedFonts.length,
    fontWarning: Dynamic =
      length === 1
        ? "1 Google Fonts file the artboards never loaded was left as a link on purpose, not inlined"
        : String(length) +
          " Google Fonts files the artboards never loaded were left as links on purpose, not inlined";
  return [
    ...warnings.filter((warning?: Dynamic): Dynamic => !callback(warning)),
    fontWarning +
      "; a browser opening the export online still fetches " +
      (length === 1 ? "it" : "them"),
  ];
}
async function produceStandaloneHtmlExport(
  exportInput?: Dynamic,
  exportOptions: Dynamic = {},
): Promise<Dynamic> {
  let value: Dynamic,
    overviewTitle: Dynamic,
    overviewFilename: Dynamic,
    assetReader: Dynamic,
    documentAssetReader: Dynamic;
  if (exportInput.kind === "project")
    throw new ExportHtmlError("empty", "this page has no artboard to send");
  {
    if (exportInput.artboards.length === 0)
      throw new ExportHtmlError("empty", "this page has no artboard to send");
    assetReader = createDesignDocumentAssetReader(exportInput);
    let openArtboard: Dynamic =
      exportInput.open === undefined
        ? undefined
        : exportInput.artboards.find(
            (artboard?: Dynamic): Dynamic => artboard.file === exportInput.open,
          );
    if (exportInput.open !== undefined && openArtboard === undefined)
      throw new ExportHtmlError(
        "empty",
        exportInput.open + " is not on this canvas",
      );
    if (openArtboard !== undefined || exportInput.artboards.length === 1) {
      let selectedArtboard: Dynamic = openArtboard ?? exportInput.artboards[0],
        artboardHtml: Dynamic = await exportInput.read(selectedArtboard.file);
      if (artboardHtml === undefined)
        throw new ExportHtmlError(
          "empty",
          selectedArtboard.file + " could not be read",
        );
      value = normalizeDcScriptType(artboardHtml);
      overviewTitle = selectedArtboard.file;
      openArtboard !== undefined &&
        (overviewFilename =
          openArtboard.title ?? exportBaseFileName(openArtboard.file));
      exportInput.importerReady === true &&
        (documentAssetReader = {
          w: selectedArtboard.w,
          h: selectedArtboard.h,
          label:
            selectedArtboard.title?.trim() ||
            exportBaseFileName(selectedArtboard.file),
        });
    } else {
      for (let artboard of exportInput.artboards as Dynamic)
        if ((await exportInput.read(artboard.file)) === undefined)
          throw new ExportHtmlError(
            "empty",
            artboard.file + " could not be read",
          );
      value = exportedCanvasOverviewHtml(exportInput.title, exportInput.artboards);
      overviewTitle = exportedCanvasOverviewFilename;
    }
  }
  let assets: Dynamic = exportInput.assets,
    assetResolver: Dynamic = createExportAssetResolver(
      assetReader,
      assets,
      exportOptions,
    ),
    fontAwareResolver: Dynamic =
      exportInput.kind === "canvas" &&
      exportInput.fontLoads !== undefined &&
      exportInput.fontLoads.length > 0
        ? createFontAwareExportResolver(assetResolver, exportInput.fontLoads)
        : undefined,
    { html: html, warnings: warnings }: Dynamic = await bundleStandaloneDesignHtml(
      value,
      overviewTitle,
      fontAwareResolver?.resolve ?? assetResolver,
      {},
      documentAssetReader === undefined
        ? {}
        : {
            finalizeTemplate: (
              signal?: Dynamic,
              onWarning?: Dynamic,
            ): Dynamic =>
              prepareStaticArtboardExport(
                signal,
                documentAssetReader,
                onWarning,
              ),
          },
    ),
    warningsWithFonts: Dynamic = explainSkippedGoogleFontAssets(
      warnings,
      fontAwareResolver?.leftOut() ?? [],
    );
  if (exportOptions.signal?.aborted)
    throw new ExportHtmlError("timeout", "preparing the file took too long");
  let serveTokenWarning: Dynamic = findUnremovedServeTokenWarning(warningsWithFonts);
  if (serveTokenWarning !== undefined)
    throw (
      console.warn("[design/export] " + serveTokenWarning),
      new ExportHtmlError(
        "blocked",
        // MineDesign: user-facing copy calls the agent "the agent", not Claude.
        "the design contains what looks like a live access link, which cannot be sent",
      )
    );
  let blob: Dynamic = new Blob([html], {
    type: "text/html",
  });
  if (blob.size > designExportRuntimeSource)
    throw new ExportHtmlError(
      "too_large",
      "the single-file export is " +
        (blob.size / 1048576).toFixed(1) +
        // MineDesign: the limit is no longer 16 MiB (export/downloads.tsx).
        " MiB; the most that can be sent is " +
        (designExportRuntimeSource >> 20) +
        " MiB",
    );
  return {
    filename: standaloneExportFilename(exportInput.title, overviewTitle, overviewFilename),
    blob: blob,
    bytes: blob.size,
    warnings: warningsWithFonts,
  };
}
export {
  createDesignDocumentAssetReader,
  designExportRuntimeSource,
  explainSkippedGoogleFontAssets,
  exportBlobPathPattern,
  exportedCanvasOverviewFilename,
  exportedCanvasOverviewHtml,
  ExportHtmlError,
  exportImageFilenamePattern,
  fetchExportProjectBlob,
  findUnremovedServeTokenWarning,
  produceStandaloneHtmlExport,
  selectHtmlExportArtboards,
  standaloneExportFilename,
};
export function installExportHtmlProducer(): () => void {
  return () => {
    designExportRuntimeSource = ExportDownloadsResolvedValue;
    exportImageFilenamePattern = /\.(png|jpe?g|gif|webp|avif|bmp|svg)$/i;
    exportBlobPathPattern = /(?:^|\/)(_blob\/[0-9a-f]{32})$/;
    ExportHtmlError = class extends Error {
      declare name: Dynamic;
      constructor(message: Dynamic, cause: Dynamic) {
        super(cause);
        this.code = message;
        this.name = "ExportHtmlError";
      }
      code: Dynamic;
    };
    exportedCanvasOverviewFilename = "__design-canvas__.html";
  };
}
