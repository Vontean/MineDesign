/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { uniqueExportFileNames } from "./file-names";
import { artboardsInReadingOrder } from "./reading-order";
import { createStoredZip } from "./stored-zip";

function selectExportCaptureArtboard(
  artboards?: Dynamic,
  focusedFile?: Dynamic,
  selectedFiles?: Dynamic,
  pageId?: Dynamic,
): Dynamic {
  let callback: Dynamic = (fileId?: Dynamic): Dynamic =>
    fileId === null
      ? undefined
      : artboards.find((artboard?: Dynamic): Dynamic => artboard.file === fileId);
  if (focusedFile !== null) {
    let focusedArtboard: Dynamic = callback(focusedFile);
    return focusedArtboard
      ? {
          artboard: focusedArtboard,
          chosen: true,
        }
      : {
          artboard: null,
          covered: true,
        };
  }
  let value: Dynamic = artboards.filter(
    (artboard?: Dynamic): Dynamic => selectedFiles.has(artboard.file),
  );
  if (value.length === 1)
    return {
      artboard: value[0],
      chosen: true,
    };
  let fallbackArtboard: Dynamic = callback(pageId) ?? artboards[0];
  return fallbackArtboard
    ? {
        artboard: fallbackArtboard,
        chosen: artboards.length === 1,
      }
    : {
        artboard: null,
        covered: false,
      };
}
async function drainArtboardExportCaptures(
  capture?: Dynamic,
  artboards?: Dynamic,
  deadline?: Dynamic,
  timeLimit?: Dynamic,
  { reserveMs: reserveMs = 25e3, now: now = Date.now }: Dynamic = {},
): Promise<Dynamic> {
  let value: Dynamic = null;
  for (let [artboardIndex, artboard] of artboards.entries() as Dynamic) {
    if (value !== null && now() + reserveMs > timeLimit)
      return {
        ok: false,
        reason: "no_time",
        after: value,
      };
    let captureResult: Dynamic;
    try {
      captureResult = await capture(artboard);
    } catch (error: Dynamic) {
      if (artboardIndex === artboards.length - 1) throw error;
      value = "failed";
      continue;
    }
    if (captureResult === null)
      return {
        ok: false,
        reason: "nothing",
      };
    if (captureResult.bytes.length === 0)
      throw new Error("the image came back empty");
    if (captureResult.bytes.length <= deadline)
      return {
        ok: true,
        scale: artboard,
        steppedDown: value,
        ...captureResult,
      };
    value = "too_large";
  }
  return {
    ok: false,
    reason: "too_large",
  };
}
async function captureExportArtboards(
  artboards?: Dynamic,
  scale?: Dynamic,
  { signal: abortSignal }: Dynamic = {},
): Promise<Dynamic> {
  let value: Dynamic = uniqueExportFileNames(),
    items: Dynamic = [],
    clippedNames: Dynamic = [],
    index: Dynamic = 0,
    fontFallbackCount: Dynamic = 0,
    state: Dynamic = {
      innerClipped: 0,
      scrollRegion: 0,
      collapsed: 0,
      unrevealed: 0,
    };
  for (let artboard of artboardsInReadingOrder(
    artboards,
  ) as Dynamic) {
    abortSignal?.throwIfAborted();
    let fileName: Dynamic = value(artboard.file, artboard.title),
      captureResult: Dynamic = await scale(artboard);
    if (captureResult.bytes.length === 0)
      throw new Error('"' + fileName + '" came back empty');
    items.push({
      name: fileName + ".png",
      data: captureResult.bytes,
    });
    captureResult.clipped && clippedNames.push(fileName);
    index += captureResult.blank;
    fontFallbackCount += captureResult.fontFallback ?? 0;
    for (let warningType of [
      "innerClipped",
      "scrollRegion",
      "collapsed",
      "unrevealed",
    ] as Dynamic)
      (captureResult.hiddenContent?.[warningType] ?? 0) > 0 && (state[warningType] += 1);
  }
  if (items.length === 0) throw new Error("no artboards to export");
  return {
    blob: createStoredZip(items),
    clipped: clippedNames,
    blank: index,
    fontFallback: fontFallbackCount,
    hiddenContent: state,
  };
}
function describeExportCaptureWarnings(
  capture?: Dynamic,
  scaledDownCount?: Dynamic,
): Dynamic {
  return {
    blankImages: capture.blank,
    clipped: capture.clipped.length > 0,
    fontFallback: capture.fontFallback,
    scaledDown: scaledDownCount > 0,
    ...capture.hiddenContent,
  };
}
export {
  captureExportArtboards,
  describeExportCaptureWarnings,
  drainArtboardExportCaptures,
  selectExportCaptureArtboard,
};
export function installExportCapture(): () => void {
  return () => {};
}
