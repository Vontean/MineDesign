/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { reportExportBuilt, reportExportEvent } from "./analytics";
import { buildCaptureScript } from "./capture-script";
import { withCaptureViewport } from "./capture-viewport";
import { countMatchingExportWarnings, dataUrlToBytes, describeCaptureFailure, ExportCaptureWarningsItems, ExportCaptureWarningsItems_2 as ExportCaptureWarningsItemsForImage } from "./capture-warnings";
import { exportDeliveryEventName, triggerBrowserDownload } from "./delivery";
import { downloadsWithheld, saveThroughHost } from "./downloads";
import { exportFileName } from "./file-names";
import { classifyExportAbort, classifyExportFailure, classifyImageSaveOutcome } from "./outcomes";
import { exportImageMimeTypes, artboardThumbnailWidth } from "./paper-and-scale";
import { normalizeExportWarnings, selectionExportFileName } from "./warnings";
import { designAnalyticsEvents, healthReporter, reportExportOutcome } from "../platform/health-and-analytics";

async function captureArtboardImage(
  preview?: Dynamic,
  format?: Dynamic,
  settleMs: Dynamic = 2,
  captureOptions?: Dynamic,
): Promise<Dynamic> {
  try {
    await captureOptions?.onBeforeCapture?.();
    let frameBounds: Dynamic = captureOptions?.frame,
      hasFrame: Dynamic =
        frameBounds !== undefined &&
        Number.isFinite(frameBounds.w) &&
        Number.isFinite(frameBounds.h) &&
        frameBounds.w > 0 &&
        frameBounds.h > 0,
      clipRegion: Dynamic =
        captureOptions?.clipToFrame && hasFrame
          ? {
              h: frameBounds.h,
              max: 1,
              count: 1,
            }
          : null,
      captureScript: Dynamic = buildCaptureScript(
        exportImageMimeTypes[format],
        format === "jpg" ? 0.92 : 1,
        0,
        settleMs,
        false,
        false,
        0,
        "",
        false,
        true,
        false,
        "",
        captureOptions?.selectionRoot ?? "",
        "",
        false,
        clipRegion !== null,
        hasFrame
          ? {
              w: frameBounds.w,
              h: frameBounds.h,
              full: captureOptions?.fullLength === true && clipRegion === null,
            }
          : (captureOptions?.frame ?? null),
        clipRegion,
      ),
      captureResult: Dynamic,
      index: Dynamic = 0;
    try {
      captureResult = await withCaptureViewport(
        preview,
        captureOptions?.frame,
        (elapsedMs?: Dynamic): Dynamic => (
          (index = elapsedMs),
          preview.executeJavaScript(captureScript, 15e3)
        ),
        captureOptions?.settle === true,
      );
    } catch (error: Dynamic) {
      throw (
        console.error("[selection-export] capture failed:", error),
        new Error(describeCaptureFailure(error))
      );
    }
    if (typeof captureResult != "object" || captureResult === null)
      throw new Error(
        "its preview returned no image; reload it and try again",
      );
    let imageResult: Dynamic = captureResult;
    if ("e" in imageResult) {
      if (imageResult.e !== "no-selection" && imageResult.e !== "zero-size")
        throw new Error(
          "its preview returned no image; reload it and try again",
        );
      return {
        ok: false,
        softError: imageResult.e,
      };
    }
    let warningCount: Dynamic = Array.isArray(imageResult.w) ? imageResult.w.length : 0;
    warningCount && console.warn("[selection-export] capture warnings:", imageResult.w);
    let embedWarningCount: Dynamic = countMatchingExportWarnings(
        imageResult.w,
        ExportCaptureWarningsItems,
      ),
      fontWarningCount: Dynamic = countMatchingExportWarnings(
        imageResult.w,
        ExportCaptureWarningsItemsForImage,
      ),
      dataUrl: Dynamic = clipRegion
        ? Array.isArray(imageResult.pg)
          ? imageResult.pg[0]
          : undefined
        : imageResult.u;
    if (
      typeof dataUrl != "string" ||
      !dataUrl.startsWith(
        `data:${exportImageMimeTypes[format]};base64,`,
      )
    )
      throw new Error(
        "the image came back empty; it may be too large to export at this scale",
      );
    let hiddenContent: Dynamic = normalizeExportWarnings(imageResult.hc);
    return {
      ok: true,
      uri: dataUrl,
      embedWarningCount: embedWarningCount,
      warnings: warningCount,
      ...(fontWarningCount
        ? {
            fontWarningCount: fontWarningCount,
          }
        : {}),
      ...(clipRegion !== null && imageResult.pm === 1
        ? {
            clipped: true,
          }
        : {}),
      ...(Object.keys(hiddenContent).length > 0
        ? {
            hiddenContent: hiddenContent,
          }
        : {}),
      ...(captureOptions?.settle
        ? {
            settleMs: index,
          }
        : {}),
    };
  } finally {
    await preview
      .executeJavaScript("window.__omCaptureCache=undefined;null", 5e3)
      .catch((): Dynamic => {});
  }
}
async function exportArtboardImage(
  preview?: Dynamic,
  filename?: Dynamic,
  extension?: Dynamic,
  scale: Dynamic = 2,
  exportOptions?: Dynamic,
): Promise<Dynamic> {
  if (await downloadsWithheld()) {
    healthReporter.report(
      ...classifyExportAbort("image"),
    );
    return {
      ok: true,
      saveOutcome: "withheld",
    };
  }
  try {
    let captureResult: Dynamic = await captureArtboardImage(
      preview,
      extension,
      scale,
      exportOptions,
    );
    if (!captureResult.ok) {
      healthReporter.report(
        ...classifyExportAbort("image"),
      );
      return {
        ok: false,
        softError: captureResult.softError,
      };
    }
    let {
      uri: dataUrl,
      embedWarningCount: embedWarningCount,
      clipped: clipped,
      fontWarningCount: fontWarningCount,
    }: Dynamic = captureResult;
    reportExportBuilt({
      blankImages: embedWarningCount,
      clipped: clipped,
      fontFallback: fontWarningCount,
      ...exportOptions?.scope,
      ...captureResult.hiddenContent,
    });
    let outputFilename: Dynamic =
        exportOptions?.filename ??
        (exportOptions?.selectionRoot
          ? `${exportFileName(filename, exportOptions.title)}-element.${extension}`
          : selectionExportFileName(
              filename,
              extension,
              exportOptions?.title,
            )),
      saveResult: Dynamic =
        embedWarningCount > 0
          ? null
          : await saveThroughHost(
              dataUrlToBytes(dataUrl),
              outputFilename,
            ),
      saveOutcome: Dynamic = saveResult?.outcome ?? "unsupported";
    saveOutcome === "unsupported" &&
      (triggerBrowserDownload(dataUrl, outputFilename),
      (window as Dynamic).dispatchEvent(
        new CustomEvent(exportDeliveryEventName, {
          detail: {
            url: dataUrl,
            filename: outputFilename,
            embedWarningCount: embedWarningCount,
            mime: exportImageMimeTypes[extension],
            refusal: saveResult?.code,
          },
        }),
      ));
    reportExportOutcome(
      classifyImageSaveOutcome(saveResult),
      designAnalyticsEvents.exported[extension],
    );
    return {
      ok: true,
      saveOutcome: saveOutcome,
      ...(embedWarningCount
        ? {
            embedWarningCount: embedWarningCount,
          }
        : {}),
      ...(clipped
        ? {
            clipped: clipped,
          }
        : {}),
      ...(fontWarningCount
        ? {
            fontWarningCount: fontWarningCount,
          }
        : {}),
    };
  } catch (error: Dynamic) {
    throw (
      healthReporter.report(
        ...classifyExportFailure("image"),
      ),
      reportExportEvent("failed"),
      error
    );
  }
}
async function captureArtboardThumbnail(preview?: Dynamic): Promise<Dynamic> {
  try {
    let value: Dynamic = buildCaptureScript(
        "image/png",
        1,
        artboardThumbnailWidth,
        0,
        false,
        false,
        0,
        "",
        false,
        true,
      ),
      thumbnailResult: Dynamic = await preview.executeJavaScript(value, 15e3);
    return !thumbnailResult ||
      !("u" in thumbnailResult) ||
      typeof thumbnailResult.u != "string" ||
      !thumbnailResult.u.startsWith("data:image/png")
      ? {
          ok: false,
        }
      : {
          ok: true,
          url: thumbnailResult.u,
        };
  } catch (value: Dynamic) {
    console.warn("[selection-export] preview capture failed:", value);
    return {
      ok: false,
    };
  }
}
export {
  captureArtboardImage,
  captureArtboardThumbnail,
  exportArtboardImage,
};
export function installExportImage(): () => void {
  return () => {};
}
