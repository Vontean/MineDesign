/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reportExportBuilt, reportExportEvent } from "../analytics";
import { ExportCaptureViewportLimit, measureEmptyExportTail } from "../capture-viewport";
import { exportDeliveryEventName } from "../delivery";
import { DownloadsArenTAvailableToYouForMessage, downloadsWithheld, saveThroughHost } from "../downloads";
import { exportFileName, sanitizeExportFileName } from "../file-names";
import { classifyExportFailure, classifyExportSaveOutcome } from "../outcomes";
import { minEmptyExportTail, getArtboardPaperSize, isFillPagedExport, isFlowExport, paperHeightForWidth, paperSizes } from "../paper-and-scale";
import { captureArtboardPdfPages, getPdfRasterScale, maxFlowPages as pdfCapturePageLimit } from "./capture";
import { buildPdfDocument } from "./document";
import { decodeJpegDataUrl, pixelsToPoints, readJpegDimensions } from "./jpeg";
import { inferPdfLanguage } from "./language";
import { artboardsInReadingOrder } from "../reading-order";
import { emptyExportTailMessage, fontSubstitutionWarnings, formatArtboardNames } from "../warnings";
import { designAnalyticsEvents, healthReporter, reportExportOutcome } from "../../platform/health-and-analytics";
import { createPreviewHandle } from "../../preview/evaluation";

var PdfOrchestrationLimit: Dynamic;
var ApplicationPdfValue: Dynamic;
var maxPdfContentDimensionPt: Dynamic;
function capturedTextToPdfPoints(
  textRuns?: Dynamic,
  sourceWidth?: Dynamic,
  sourceHeight?: Dynamic,
  targetWidth?: Dynamic,
  targetHeight?: Dynamic,
): Dynamic {
  let widthScale: Dynamic = targetWidth / sourceWidth,
    heightScale: Dynamic = targetHeight / sourceHeight;
  return textRuns.map(
    (run?: Dynamic): Dynamic => ({
      text: run.t,
      xPt: Math.min(targetWidth, run.x * widthScale),
      yPt: Math.max(0, targetHeight - run.y * heightScale),
      sizePt: Math.min(targetHeight, run.s * heightScale),
      widthPt: run.w * widthScale,
      ...(run.b !== undefined
        ? {
            block: run.b,
          }
        : {}),
      ...(run.i !== undefined
        ? {
            item: run.i,
          }
        : {}),
      ...(run.sp !== undefined
        ? {
            spaceBefore: run.sp,
          }
        : {}),
      ...(run.a !== undefined
        ? {
            link: run.a,
          }
        : {}),
    }),
  );
}
function capturedBlocksToPdfPoints(
  blocks?: Dynamic,
  sourceWidth?: Dynamic,
  sourceHeight?: Dynamic,
  targetWidth?: Dynamic,
  targetHeight?: Dynamic,
): Dynamic {
  let widthScale: Dynamic = targetWidth / sourceWidth,
    heightScale: Dynamic = targetHeight / sourceHeight;
  return blocks.map(
    (block?: Dynamic): Dynamic =>
      block.role !== "Figure"
        ? {
            role: block.role,
          }
        : {
            role: "Figure",
            ...(block.alt !== undefined
              ? {
                  alt: block.alt,
                }
              : {}),
            ...(block.link !== undefined
              ? {
                  link: block.link,
                }
              : {}),
            box: {
              xPt: block.x * widthScale,
              yPt: targetHeight - (block.y + block.h) * heightScale,
              widthPt: block.w * widthScale,
              heightPt: block.h * heightScale,
            },
          },
  );
}
function sharedExportLanguage(
  languages?: Dynamic,
  fallbackLanguage?: Dynamic,
  items?: Dynamic,
): Dynamic {
  let callback: Dynamic = (languageTag?: Dynamic): Dynamic =>
      languageTag.split("-")[0].toLowerCase(),
    value: Dynamic = languages.filter(
      (languageTag?: Dynamic): Dynamic => languageTag !== undefined,
    ),
    commonLanguage: Dynamic =
      value.length > 0 &&
      value.every(
        (languageTag?: Dynamic): Dynamic =>
          callback(languageTag) === callback(value[0]),
      )
        ? value[0]
        : undefined,
    languageText: Dynamic =
      fallbackLanguage +
      `
` +
      items.flatMap(
        (block?: Dynamic): Dynamic =>
          (block.textRuns ?? []).map(
            (run?: Dynamic): Dynamic => run.text,
          ),
      ).join(`
`),
    inferredLanguage: Dynamic =
      value.length === 0
        ? inferPdfLanguage(languageText)
        : inferPdfLanguage(languageText, commonLanguage ?? "und");
  return commonLanguage === undefined
    ? inferredLanguage
    : callback(inferredLanguage) === callback(commonLanguage) ||
        (callback(commonLanguage) !== "en" &&
          callback(
            inferPdfLanguage(
              languageText.replace(/[^\p{L}]+/gu, ""),
              commonLanguage,
            ),
          ) === callback(commonLanguage))
      ? commonLanguage
      : inferredLanguage;
}
function capturedLinksToPdfPoints(
  links?: Dynamic,
  sourceWidth?: Dynamic,
  sourceHeight?: Dynamic,
  targetWidth?: Dynamic,
  targetHeight?: Dynamic,
): Dynamic {
  let widthScale: Dynamic = targetWidth / sourceWidth,
    heightScale: Dynamic = targetHeight / sourceHeight;
  return links.map(
    (link?: Dynamic): Dynamic => ({
      uri: link.u,
      xPt: link.x * widthScale,
      yPt: targetHeight - (link.y + link.h) * heightScale,
      widthPt: link.w * widthScale,
      heightPt: link.h * heightScale,
      ...(link.a !== undefined
        ? {
            anchor: link.a,
          }
        : {}),
    }),
  );
}
function pdfExportFileName(fileNameInput?: Dynamic): Dynamic {
  return (sanitizeExportFileName(fileNameInput) || "design") + ".pdf";
}
async function collectPdfExportPages(
  designFile?: Dynamic,
  resolveFile?: Dynamic,
  documentTitle?: Dynamic,
  exportOptions: Dynamic = {},
): Promise<Dynamic> {
  let capturePages: Dynamic = exportOptions.capture ?? captureArtboardPdfPages,
    resolveHandle: Dynamic = exportOptions.resolveHandle ?? createPreviewHandle,
    measureTail: Dynamic = exportOptions.measureTail ?? measureEmptyExportTail,
    index: Dynamic = 0,
    captureCount: Dynamic = 0,
    items: Dynamic = [],
    exportedPages: Dynamic = [],
    clippedPages: Dynamic = [],
    clippedFiles: Dynamic = [],
    cappedPages: Dynamic = [],
    boxedPages: Dynamic = [],
    emptyTailPages: Dynamic = [],
    emptyTailFiles: Dynamic = [],
    emptyTailPixels: Dynamic = 0,
    hiddenCount: Dynamic = 0,
    embedWarningCount: Dynamic = 0,
    fontWarningCount: Dynamic = 0,
    scaledDownCount: Dynamic = 0,
    textPartialPages: Dynamic = [],
    state: Dynamic = {
      innerClipped: 0,
      scrollRegion: 0,
      collapsed: 0,
      unrevealed: 0,
    },
    languages: Dynamic = [];
  for (let artboard of artboardsInReadingOrder(designFile) as Dynamic) {
    exportOptions.signal?.throwIfAborted();
    let fileName: Dynamic = exportFileName(
        artboard.file,
        artboard.title,
      ),
      fileHandle: Dynamic = await resolveFile(artboard.file);
    exportOptions.signal?.throwIfAborted();
    if (fileHandle && fileHandle.getBoundingClientRect().width === 0) {
      hiddenCount += 1;
      continue;
    }
    let previewHandle: Dynamic = fileHandle ? resolveHandle(fileHandle) : null;
    if (!previewHandle)
      throw new Error(
        '"' + fileName + '" is still loading \u2014 try again in a moment',
      );
    let isFlow: Dynamic = isFlowExport(
        {
          expand: artboard.expand,
        },
        exportOptions.rules,
      ),
      flowScale: Dynamic = isFlowExport(artboard, exportOptions.rules)
        ? getArtboardPaperSize(artboard)
        : null,
      captureResult: Dynamic;
    try {
      let pageHeight: Dynamic = flowScale
        ? paperHeightForWidth(artboard.w, flowScale)
        : 0;
      captureResult = await capturePages(
        previewHandle,
        {
          w: artboard.w,
          h: artboard.h,
        },
        flowScale
          ? {
              flow: true,
              pageH: pageHeight,
              ...(isFlow
                ? {
                    maxScale: getPdfRasterScale(artboard.w),
                    ifScrolls: artboard.print !== "flow" && artboard.h <= pageHeight,
                  }
                : {}),
            }
          : {
              flow: false,
            },
        exportOptions.rules?.settle === true &&
          captureCount < ExportCaptureViewportLimit,
      );
    } catch (captureError: Dynamic) {
      throw new Error(
        '"' +
          fileName +
          '" could not be captured: ' +
          (captureError instanceof Error ? captureError.message : String(captureError)),
      );
    }
    if (!captureResult.ok) {
      if (captureResult.softError === "zero-size") {
        hiddenCount += 1;
        continue;
      }
      throw new Error('"' + fileName + '" could not be captured');
    }
    captureResult.atFrame && (flowScale = null);
    let jpegImages: Dynamic = captureResult.pages.map((page?: Dynamic): Dynamic => {
        let jpegBytes: Dynamic = decodeJpegDataUrl(page.uri);
        try {
          if (jpegBytes === undefined) throw new Error("not a JPEG data URI");
          readJpegDimensions(jpegBytes);
        } catch (decodeError: Dynamic) {
          throw new Error(
            '"' +
              fileName +
              '" produced an unreadable capture: ' +
              (decodeError instanceof Error ? decodeError.message : String(decodeError)),
          );
        }
        return jpegBytes;
      }),
      contentWidth: Dynamic = flowScale
        ? paperSizes[flowScale].wPt
        : pixelsToPoints(captureResult.cssW),
      contentHeight: Dynamic = flowScale
        ? paperSizes[flowScale].hPt
        : pixelsToPoints(captureResult.cssH),
      maxContentSize: Dynamic = Math.max(contentWidth, contentHeight);
    maxContentSize > maxPdfContentDimensionPt &&
      (contentWidth >= contentHeight
        ? ((contentHeight = Math.min(
            maxPdfContentDimensionPt,
            (contentHeight * maxPdfContentDimensionPt) / maxContentSize,
          )),
          (contentWidth = maxPdfContentDimensionPt))
        : ((contentWidth = Math.min(
            maxPdfContentDimensionPt,
            (contentWidth * maxPdfContentDimensionPt) / maxContentSize,
          )),
          (contentHeight = maxPdfContentDimensionPt)));
    if (!(contentWidth >= 3 && contentHeight >= 3))
      throw new Error(
        '"' + fileName + '" is too small to export as a PDF page',
      );
    embedWarningCount += captureResult.embedWarningCount;
    fontWarningCount += captureResult.fontWarningCount ?? 0;
    captureCount += captureResult.settleMs ?? 0;
    captureResult.scaledDown && (scaledDownCount += 1);
    captureResult.textPartial && textPartialPages.push(fileName);
    for (let hiddenCategory of [
      "innerClipped",
      "scrollRegion",
      "collapsed",
      "unrevealed",
    ] as Dynamic)
      (captureResult.hiddenContent?.[hiddenCategory] ?? 0) > 0 && (state[hiddenCategory] += 1);
    captureResult.linksPartial &&
      console.warn(
        '[pdf-export] "' +
          fileName +
          '": some links are not clickable in the PDF',
      );
    captureResult.overflowed
      ? (flowScale
          ? captureResult.pages.length >= pdfCapturePageLimit
            ? cappedPages
            : boxedPages
          : clippedPages
        ).push(fileName)
      : captureResult.boxed && boxedPages.push(fileName);
    captureResult.overflowed && !flowScale && clippedFiles.push(artboard.file);
    if (
      isFlow &&
      captureResult.atFrame === true &&
      !captureResult.overflowed &&
      isFillPagedExport(artboard) &&
      index < PdfOrchestrationLimit
    ) {
      let tailMeasurementStartedAt: Dynamic = Date.now(),
        emptyTailPx: Dynamic = await measureTail(previewHandle, {
          w: artboard.w,
          h: artboard.h,
        }).catch((): Dynamic => null);
      index += Date.now() - tailMeasurementStartedAt;
      exportOptions.signal?.throwIfAborted();
      emptyTailPx !== null &&
        emptyTailPx >= minEmptyExportTail &&
        (emptyTailPages.push(fileName),
        emptyTailFiles.push(artboard.file),
        (emptyTailPixels = Math.max(emptyTailPixels, emptyTailPx)));
    }
    exportedPages.push(fileName);
    languages.push(captureResult.lang);
    captureResult.pages.forEach((page?: Dynamic, pageIndex?: Dynamic): Dynamic => {
      items.push({
        jpeg: jpegImages[pageIndex],
        widthPt: contentWidth,
        heightPt: contentHeight,
        textRuns: capturedTextToPdfPoints(
          page.textRuns,
          captureResult.cw,
          captureResult.ch,
          contentWidth,
          contentHeight,
        ),
        links: capturedLinksToPdfPoints(
          page.links ?? [],
          captureResult.cw,
          captureResult.ch,
          contentWidth,
          contentHeight,
        ),
        ...(page.blocks !== undefined
          ? {
              blocks: capturedBlocksToPdfPoints(
                page.blocks,
                captureResult.cw,
                captureResult.ch,
                contentWidth,
                contentHeight,
              ),
            }
          : {}),
      });
    });
  }
  if (items.length === 0)
    throw new Error(
      hiddenCount > 0
        ? "every artboard is hidden while one is expanded \u2014 collapse it to export"
        : "there are no artboards to export",
    );
  let outputFileName: Dynamic = pdfExportFileName(documentTitle),
    documentState: Dynamic = {
      title: documentTitle,
      textEncoding: exportOptions.textEncoding,
    },
    documentOptions: Dynamic =
      exportOptions.tagged === true
        ? {
            ...documentState,
            tagged: true,
            lang: sharedExportLanguage(languages, documentTitle, items),
          }
        : documentState,
    pdfBytes: Dynamic;
  try {
    pdfBytes = buildPdfDocument(items, documentOptions);
  } catch (buildError: Dynamic) {
    try {
      if (documentOptions === documentState) throw buildError;
      pdfBytes = buildPdfDocument(items, documentState);
      console.warn(
        "[pdf-export] the PDF writer rejected the accessibility tags; the file was written without them:",
        buildError,
      );
    } catch (saveError: Dynamic) {
      if (
        !items.some(
          (page?: Dynamic): Dynamic =>
            page.textRuns !== undefined && page.textRuns.length > 0,
        )
      )
        throw saveError;
      pdfBytes = buildPdfDocument(
        items.map(
          (page?: Dynamic): Dynamic => ({
            jpeg: page.jpeg,
            widthPt: page.widthPt,
            heightPt: page.heightPt,
            links: page.links,
          }),
        ),
        documentState,
      );
      textPartialPages = exportedPages.slice();
    }
  }
  return {
    blob: new Blob([pdfBytes.slice().buffer], {
      type: ApplicationPdfValue,
    }),
    exported: exportedPages.length,
    pages: items.length,
    clipped: clippedPages,
    clippedFiles: clippedFiles,
    capped: cappedPages,
    emptyTail: emptyTailPages,
    emptyTailFiles: emptyTailFiles,
    emptyTailPx: emptyTailPixels,
    boxed: boxedPages,
    hidden: hiddenCount,
    filename: outputFileName,
    embedWarningCount: embedWarningCount,
    fontWarningCount: fontWarningCount,
    scaledDown: scaledDownCount,
    textPartial: textPartialPages,
    hiddenContent: state,
  };
}
function pdfExportWarnings(result?: Dynamic): Dynamic {
  return {
    blankImages: result.embedWarningCount,
    clipped: result.clipped.length > 0,
    flowOverflow: result.capped.length > 0 || result.boxed.length > 0,
    hiddenSkipped: result.hidden,
    fontFallback: result.fontWarningCount,
    scaledDown: result.scaledDown > 0,
    ...result.hiddenContent,
  };
}
async function exportPdf(
  items?: Dynamic,
  exportOptions?: Dynamic,
  documentTitle?: Dynamic,
  extraOptions: Dynamic = {},
): Promise<Dynamic> {
  if (await downloadsWithheld())
    return {
      exported: 0,
      pages: 0,
      clipped: [],
      clippedFiles: [],
      capped: [],
      boxed: [],
      emptyTail: [],
      emptyTailFiles: [],
      emptyTailPx: 0,
      hidden: 0,
      filename: pdfExportFileName(documentTitle),
      embedWarningCount: 0,
      fontWarningCount: 0,
      scaledDown: 0,
      textPartial: [],
      hiddenContent: {
        innerClipped: 0,
        scrollRegion: 0,
        collapsed: 0,
        unrevealed: 0,
      },
      saveOutcome: "withheld",
    };
  let { blob: pdfBlob, ...exportSummary }: Dynamic = await collectPdfExportPages(
    items,
    exportOptions,
    documentTitle,
    extraOptions,
  );
  reportExportBuilt({
    ...pdfExportWarnings(exportSummary),
    ...extraOptions.scope,
  });
  let { filename: fileName, embedWarningCount: embedWarningCount }: Dynamic = exportSummary,
    saveResult: Dynamic =
      embedWarningCount > 0 ? null : await saveThroughHost(pdfBlob, fileName),
    saveOutcome: Dynamic = saveResult?.outcome ?? "unsupported";
  if (saveOutcome === "unsupported") {
    try {
      let downloadLink: Dynamic = (document as Dynamic).createElement("a");
      downloadLink.href = URL.createObjectURL(pdfBlob);
      downloadLink.download = fileName;
      downloadLink.rel = "noopener";
      downloadLink.style.display = "none";
      (document as Dynamic).body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setTimeout((): Dynamic => URL.revokeObjectURL(downloadLink.href), 6e4);
    } catch {}
    (window as Dynamic).dispatchEvent(
      new CustomEvent(exportDeliveryEventName, {
        detail: {
          url: "",
          filename: fileName,
          embedWarningCount: embedWarningCount,
          file: {
            blob: pdfBlob,
            mime: ApplicationPdfValue,
          },
          refusal: saveResult?.code,
        },
      }),
    );
  }
  return {
    ...exportSummary,
    saveOutcome: saveOutcome,
  };
}
function pdfExportMessage(
  summary?: Dynamic,
  errorDetail?: Dynamic,
  {
    embeds: embeds = false,
    fitOffered: fitOffered = false,
    fitAdvice: fitAdvice = false,
    fonts: fonts = true,
  }: Dynamic = {},
): Dynamic {
  let items: Dynamic = [];
  summary.hidden > 0 &&
    items.push(
      "Exported " +
        String(summary.exported) +
        " of " +
        String(errorDetail) +
        " artboards \u2014 " +
        String(summary.hidden) +
        (summary.hidden === 1 ? " is" : " are") +
        " hidden while an artboard is expanded (collapse to export all).",
    );
  embeds &&
    summary.embedWarningCount > 0 &&
    items.push(
      summary.embedWarningCount === 1
        ? "1 image could not be embedded and renders blank in the PDF."
        : String(summary.embedWarningCount) +
            " images could not be embedded and render blank in the PDF.",
    );
  let value: Dynamic = formatArtboardNames;
  summary.textPartial.length > 0 &&
    items.push(
      "Some text on " +
        value(summary.textPartial) +
        " can't be selected in the PDF (it still shows on the page).",
    );
  if (summary.clipped.length > 0) {
    let hasSingleClippedFile: Dynamic = summary.clipped.length === 1;
    items.push(
      value(summary.clipped) +
        (hasSingleClippedFile
          ? " runs past its frame, so the PDF keeps one page"
          : " run past their frames, so the PDF keeps one page each") +
        (fitOffered ? "." : " \u2014 set Print mode to Flow to paginate."),
    );
  }
  summary.capped.length > 0 &&
    items.push(
      value(summary.capped) +
        " stopped at " +
        String(pdfCapturePageLimit) +
        " pages.",
    );
  summary.emptyTail.length > 0 &&
    items.push(
      emptyExportTailMessage(
        summary.emptyTail,
        summary.emptyTailPx,
        fitAdvice,
      ),
    );
  fonts &&
    items.push(
      ...fontSubstitutionWarnings(summary.fontWarningCount),
    );
  summary.boxed.length > 0 &&
    items.push(
      value(summary.boxed) +
        (summary.boxed.length === 1 ? " has" : " have") +
        " content past the frame that isn\u2019t in the PDF (it sits where pages can\u2019t reach: clipped, or positioned outside the flow).",
    );
  return items;
}
async function exportPdfWithFeedback(
  items?: Dynamic,
  exportOptions?: Dynamic,
  documentTitle?: Dynamic,
  notify?: Dynamic,
  feedbackOptions: Dynamic = {},
  feedbackDetail?: Dynamic,
): Promise<Dynamic> {
  try {
    let exportResult: Dynamic = await exportPdf(items, exportOptions, documentTitle, feedbackOptions);
    reportExportOutcome(
      classifyExportSaveOutcome("pdf", exportResult.saveOutcome),
      designAnalyticsEvents.exported.pdf,
    );
    if (exportResult.saveOutcome === "withheld") {
      notify(DownloadsArenTAvailableToYouForMessage);
      return;
    }
    let problemFiles: Dynamic = [...exportResult.clippedFiles, ...exportResult.emptyTailFiles],
      eligibleFiles: Dynamic = feedbackDetail ? problemFiles.filter(feedbackDetail.eligible) : [],
      hasIneligibleFiles: Dynamic = eligibleFiles.length < problemFiles.length,
      feedbackAction: Dynamic =
        feedbackDetail && eligibleFiles.length > 0
          ? feedbackDetail.action(
              eligibleFiles,
              hasIneligibleFiles,
              exportResult.saveOutcome === "unsupported",
            )
          : undefined,
      messages: Dynamic = pdfExportMessage(exportResult, items.length, {
        fitOffered: eligibleFiles.length > 0 && !hasIneligibleFiles,
        fonts: exportResult.saveOutcome !== "declined",
      }),
      message: Dynamic =
        exportResult.saveOutcome === "saved"
          ? "Saved " + exportResult.filename + "."
          : messages.shift();
    if (message === undefined) return;
    notify(
      message,
      exportResult.saveOutcome === "saved" ? "success" : undefined,
      messages.length > 0 || feedbackAction !== undefined
        ? {
            ...(messages.length > 0
              ? {
                  description: messages.join(" "),
                }
              : {}),
            ...(feedbackAction !== undefined
              ? {
                  action: feedbackAction,
                  pinned: true,
                }
              : {}),
          }
        : undefined,
    );
  } catch (exportError: Dynamic) {
    healthReporter.report(
      ...classifyExportFailure("pdf"),
    );
    reportExportEvent("failed");
    notify(
      "PDF export failed \u2014 " +
        (exportError instanceof Error ? exportError.message : String(exportError)) +
        ".",
      "error",
    );
  }
}
export {
  ApplicationPdfValue,
  capturedBlocksToPdfPoints,
  capturedLinksToPdfPoints,
  capturedTextToPdfPoints,
  collectPdfExportPages,
  exportPdf,
  exportPdfWithFeedback,
  pdfExportFileName,
  pdfExportMessage,
  pdfExportWarnings,
  PdfOrchestrationLimit,
  sharedExportLanguage,
};
export function installExportPdfOrchestration(): () => void {
  return () => {
    PdfOrchestrationLimit = 6e3;
    ApplicationPdfValue = "application/pdf";
    maxPdfContentDimensionPt = 14400;
  };
}
