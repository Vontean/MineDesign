import { resetCanvasFileUploads, setFilePublishHandler, uploadDesignFile, uploadDesignVideo, writeVersionedProjectFile } from "./file-uploads";
import { releaseGuardMs, travelCommitTimeoutMs, createElementMoveSessions, pointerDelta, randomSessionToken } from "./element-move-sessions";
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { CanvasWorkingLabelAnimationLabel, reactCanvasWorkingLabelAnimation } from "./working-label-animation";
import { load_react } from "../dependencies";
import { announce } from "../editor/accessibility/announcer";
import { canDecodeRasterImage } from "../editor/clipboard/image-validation";
import { parseDcHtmlDocument, sameDcTemplate } from "../editor/html/dc-document";
import { getDcPropsJson } from "../editor/html/dc-props";
import { uploadedVideoHtml } from "../editor/media/video-upload";
import { serializeStableModel } from "../editor/model/model-state";
import { canvasBoardSelection, selectionFromParts } from "../editor/selection/canvas-selection";
import { toModuleNamespace } from "../module-helpers";
import { claudeActivityStore } from "../platform/claude-activity";
import { truncateUtf16Safely } from "../platform/comments";
import { moveAnnotation, maxCanvasCoordinate as coordinateLimit, updateAnnotationAlt, updateAnnotationVideo } from "../platform/file-content";

var internalKeyPrefix: Dynamic;
var CanvasWorkingStateConstant: Dynamic;
var announcementCooldownMs: Dynamic;
var CanvasWorkingStateRegistry: Dynamic;
var CanvasWorkingStateFloorValue: Dynamic;
var CanvasWorkingStateLimit: Dynamic;
var CanvasWorkingStatePxPtPcConfig: Dynamic;
var CanvasWorkingStateItems: Dynamic;
var CanvasWorkingStateCache: Dynamic;
var CanvasWorkingStateSubscribers: Dynamic;
var CanvasWorkingStateMapValue: Dynamic;
var dropGhostCounter: Dynamic;
var CanvasWorkingStateHtml: Dynamic;
var imagePreviewWorker: Dynamic;
var imagePreviewWorkerUnavailable: Dynamic;
var imagePreviewQueue: Dynamic;
var CanvasWorkingStateJobState: Dynamic;
var CanvasWorkingStateDelayMs: Dynamic;
var imagePreviewWorkerDeadline: Dynamic;
var maxPreviewEdge: Dynamic;
var maxPreviewChars: Dynamic;
var CanvasWorkingStateOnload: Dynamic;
var CanvasWorkingStateResolvedValue: Dynamic;
var CanvasWorkingStateWidth: Dynamic;
var CanvasWorkingStateReplace: Dynamic;
var CanvasWorkingStateHandler: Dynamic;
var maxVideosPerDrop: Dynamic;
var CanvasWorkingStateJoin: Dynamic;
var CanvasWorkingStatePrint: Dynamic;
var BoxcancelValue: Dynamic;
var pressStaleMs: Dynamic;
var reactCanvasWorkingState: Dynamic;
var keptFilesMax: Dynamic;
var writeSettleMs: Dynamic;
var loadLimitMs: Dynamic;
var CanvasWorkingStateKEEPFILESMAXWaitsConfig: Dynamic;
var CanvasWorkingStateChangedStaleUnsavedSet: Dynamic;
var CanvasWorkingStateHas: Dynamic;
var CanvasWorkingStateContext: Dynamic;
var createWorkingCommitRecord: Dynamic;
var CanvasWorkingStateAddDeletePageAddConfig: Dynamic;
var isTextEditHistoryKind: Dynamic;
function createCanvasWorkingState(deps?: Dynamic): Dynamic {
  let isWorking: Dynamic = false,
    isSessionActive: Dynamic = false,
    cancelFinishTimer: Dynamic,
    readItemsSource: Dynamic = (): Dynamic => new Map(),
    isDocEmpty: Dynamic = false,
    isBusy: Dynamic = false,
    hasAnnouncedBusy: Dynamic = false,
    hasIdleAnnouncement: Dynamic = false,
    isAnnouncementPending: Dynamic = false,
    hasChanges: Dynamic = false,
    wasEmptyAtStart: Dynamic = false,
    snapshotItems: Dynamic = new Map(),
    changedKeys: Dynamic = new Set(),
    confirmAnnouncement: Dynamic = (): Dynamic => (
      (isAnnouncementPending = false),
      (hasAnnouncedBusy = isBusy),
      isBusy || (hasIdleAnnouncement = false),
      isBusy
    ),
    updateBusyState: Dynamic = (isQuiet?: Dynamic): Dynamic => {
      let nextBusy: Dynamic = (isWorking && isDocEmpty) || (isSessionActive && hasChanges);
      nextBusy !== isBusy && ((isBusy = nextBusy), deps.onBusy(nextBusy));
      !(!isBusy || hasAnnouncedBusy || isAnnouncementPending || (isQuiet && hasIdleAnnouncement)) &&
        (isQuiet
          ? (hasIdleAnnouncement = true)
          : ((isAnnouncementPending = true),
            deps.after(
              announcementCooldownMs,
              (): Dynamic => (isAnnouncementPending = false),
            )),
        deps.say(
          CanvasWorkingLabelAnimationLabel,
          isQuiet,
          confirmAnnouncement,
        ));
    },
    finishSession: Dynamic = (): Dynamic => {
      cancelFinishTimer = undefined;
      let latestItems: Dynamic = readItemsSafely(readItemsSource);
      isSessionActive = false;
      snapshotItems = latestItems;
      updateBusyState(true);
      if (!hasChanges || (wasEmptyAtStart && countVisibleItems(latestItems) === 0)) {
        (hasAnnouncedBusy || hasIdleAnnouncement) && deps.hush();
        return;
      }
      let index: Dynamic = 0;
      for (let key of changedKeys as Dynamic) latestItems.has(key) && index++;
      deps.say(
        wasEmptyAtStart
          ? deps.words.ready(countVisibleItems(latestItems))
          : index > 0
            ? deps.words.updated(index)
            : deps.words.changed(countVisibleItems(latestItems)),
        false,
      );
    },
    isInternalKey: Dynamic = (key?: Dynamic): Dynamic =>
      key.startsWith(internalKeyPrefix),
    countVisibleItems: Dynamic = (items?: Dynamic): Dynamic => {
      let index: Dynamic = 0;
      for (let key of items.keys() as Dynamic)
        isInternalKey(key) || index++;
      return index;
    },
    readItemsSafely: Dynamic = (readItems?: Dynamic): Dynamic => {
      try {
        return readItems();
      } catch {
        return snapshotItems;
      }
    };
  return {
    busy: (): Dynamic => isBusy,
    set(isWorkingNow: Dynamic, isEmpty: Dynamic, itemsSource: Dynamic): Dynamic {
      readItemsSource = itemsSource;
      let hadPendingFinish: Dynamic = isWorkingNow && cancelFinishTimer !== undefined;
      hadPendingFinish && cancelFinishTimer();
      hadPendingFinish && (cancelFinishTimer = undefined);
      let isNewSession: Dynamic = isWorkingNow && !isSessionActive,
        freshItems: Dynamic = isWorkingNow || isSessionActive ? readItemsSafely(readItemsSource) : snapshotItems;
      isNewSession &&
        ((hasAnnouncedBusy = false),
        (hasIdleAnnouncement = false),
        (isAnnouncementPending = false),
        (hasChanges = false),
        changedKeys.clear(),
        (wasEmptyAtStart = countVisibleItems(freshItems) === 0));
      isWorking = isWorkingNow;
      isWorkingNow && (isSessionActive = true);
      isDocEmpty = isEmpty;
      snapshotItems = freshItems;
      updateBusyState(!isNewSession);
      !isWorkingNow &&
        isSessionActive &&
        cancelFinishTimer === undefined &&
        (cancelFinishTimer = deps.after(CanvasWorkingStateConstant, finishSession));
    },
    changed(shouldTrack: Dynamic, itemsSource: Dynamic): Dynamic {
      if (!isSessionActive) return;
      readItemsSource = itemsSource;
      let latestItems: Dynamic = readItemsSafely(readItemsSource),
        hasItemChange: Dynamic = false;
      if (shouldTrack) {
        for (let [key, itemValue] of latestItems as Dynamic)
          (!snapshotItems.has(key) || !Object.is(snapshotItems.get(key), itemValue)) &&
            ((hasItemChange = true), isInternalKey(key) || changedKeys.add(key));
        for (let key of snapshotItems.keys() as Dynamic)
          latestItems.has(key) || (hasItemChange = true);
        hasItemChange && (hasChanges = true);
      }
      snapshotItems = latestItems;
      hasItemChange && updateBusyState(false);
    },
    stop(): Dynamic {
      cancelFinishTimer?.();
      cancelFinishTimer = undefined;
      isWorking = false;
      isSessionActive = false;
      isBusy = false;
    },
  };
}
function subscribeRemoteDocumentUpdates(
  documentState?: Dynamic,
  onRemoteUpdate?: Dynamic,
): Dynamic {
  let lastState: Dynamic = documentState.loadState?.();
  return documentState.subscribe((event?: Dynamic): Dynamic => {
    let currentState: Dynamic = documentState.loadState?.(),
      hasStateChanged: Dynamic = currentState !== lastState;
    lastState = currentState;
    onRemoteUpdate(event?.remote === true && !hasStateChanged);
  });
}
function useCanvasWorkingState(props?: Dynamic): Dynamic {
  let propsRef: Dynamic = (0, reactCanvasWorkingLabelAnimation.useRef)(
    props,
  );
  propsRef.current = props;
  let stateRef: Dynamic = (0, reactCanvasWorkingLabelAnimation.useRef)(
    null,
  );
  stateRef.current ??= createCanvasWorkingState({
    words: {
      ready: (count?: Dynamic): Dynamic => propsRef.current.words.ready(count),
      updated: (count?: Dynamic): Dynamic =>
        propsRef.current.words.updated(count),
      changed: (count?: Dynamic): Dynamic =>
        propsRef.current.words.changed(count),
    },
    after: (delayMs?: Dynamic, onElapsed?: Dynamic): Dynamic => {
      let timerId: Dynamic = setTimeout(
        onElapsed,
        delayMs === CanvasWorkingStateConstant
          ? (CanvasWorkingStateRegistry.graceMs ?? delayMs)
          : delayMs,
      );
      return (): Dynamic => clearTimeout(timerId);
    },
    say: (message?: Dynamic, ifIdle?: Dynamic, shouldAnnounce?: Dynamic): Dynamic =>
      announce(
        shouldAnnounce ? (): Dynamic => (shouldAnnounce() ? message : null) : message,
        ifIdle
          ? {
              ifIdle: true,
            }
          : {},
      ),
    hush: (): Dynamic =>
      announce("", {
        ifIdle: true,
      }),
    onBusy: (isBusy?: Dynamic): Dynamic => propsRef.current.onBusy(isBusy),
  });
  let current: Dynamic = stateRef.current,
    { doc: doc, empty: empty }: Dynamic = props,
    readItems: Dynamic = (): Dynamic => propsRef.current.items();
  (0, reactCanvasWorkingLabelAnimation.useEffect)(
    (): Dynamic =>
      subscribeRemoteDocumentUpdates(
        doc,
        (isRemote?: Dynamic): Dynamic => current.changed(isRemote, readItems),
      ),
    [doc, current],
  );
  (0, reactCanvasWorkingLabelAnimation.useEffect)(
    (): Dynamic =>
      claudeActivityStore.subscribe(
        (): Dynamic =>
          current.set(
            claudeActivityStore.get() === "working",
            propsRef.current.empty,
            readItems,
          ),
      ),
    [current],
  );
  (0, reactCanvasWorkingLabelAnimation.useEffect)(
    (): Dynamic =>
      current.set(
        claudeActivityStore.get() === "working",
        empty,
        readItems,
      ),
    [current, empty],
  );
  (0, reactCanvasWorkingLabelAnimation.useEffect)(
    (): Dynamic => (
      propsRef.current.onBusy(current.busy()),
      (): Dynamic => {
        current.stop();
        propsRef.current.onBusy(false);
      }
    ),
    [current],
  );
  return null;
}
function isSvgFile(file?: Dynamic): Dynamic {
  return file.type === "image/svg+xml" || /\.svg$/i.test(file.name);
}
async function imageHeaderDimensions(file?: Dynamic): Promise<Dynamic> {
  if (isSvgFile(file))
    try {
      return svgHeaderDimensions(await file.slice(0, 262144).text());
    } catch {
      return null;
    }
  let headerView: Dynamic;
  try {
    headerView = new DataView(await file.slice(0, 262144).arrayBuffer());
  } catch {
    return null;
  }
  return rasterImageDimensions(headerView);
}
function pngPhysicalDimensions(view?: Dynamic): Dynamic {
  if (
    view.byteLength < 8 ||
    view.getUint32(0) !== 2303741511 ||
    view.getUint32(4) !== 218765834
  )
    return null;
  for (
    let count: Dynamic = 8;
    count + 12 <= view.byteLength;
    count += 12 + view.getUint32(count)
  ) {
    let chunkType: Dynamic = view.getUint32(count + 4);
    if (chunkType === 1229209940) return null;
    if (chunkType === 1883789683 && count + 17 <= view.byteLength)
      return view.getUint8(count + 16) === 1
        ? view.getUint32(count + 8)
        : null;
  }
  return null;
}
function rasterImageDimensions(source?: Dynamic): Dynamic {
  let view: Dynamic =
    source instanceof DataView
      ? new DataView(
          source.buffer,
          source.byteOffset,
          Math.min(source.byteLength, 262144),
        )
      : new DataView(source, 0, Math.min(source.byteLength, 262144));
  try {
    return parseRasterHeaderDimensions(view);
  } catch {
    return null;
  }
}
function parseRasterHeaderDimensions(view?: Dynamic): Dynamic {
  if (view.byteLength < 10) return null;
  if (view.getUint32(0) === 2303741511 && view.getUint32(4) === 218765834)
    return view.getUint32(12) !== 1229472850
      ? null
      : validImageDimensions(view.getUint32(16), view.getUint32(20));
  if (view.getUint32(0) === 1195984440)
    return validImageDimensions(
      view.getUint16(6, true),
      view.getUint16(8, true),
    );
  if (
    view.getUint32(0) === 1380533830 &&
    view.getUint32(8) === 1464156752
  ) {
    let riffChunkType: Dynamic = view.getUint32(12);
    if (riffChunkType === 1448097880) {
      let canvasWidth: Dynamic =
          1 +
          (view.getUint8(24) |
            (view.getUint8(25) << 8) |
            (view.getUint8(26) << 16)),
        canvasHeight: Dynamic =
          1 +
          (view.getUint8(27) |
            (view.getUint8(28) << 8) |
            (view.getUint8(29) << 16));
      return validImageDimensions(canvasWidth, canvasHeight);
    }
    if (riffChunkType === 1448097824)
      return view.getUint8(23) !== 157 ||
        view.getUint8(24) !== 1 ||
        view.getUint8(25) !== 42
        ? null
        : validImageDimensions(
            view.getUint16(26, true) & 16383,
            view.getUint16(28, true) & 16383,
          );
    if (riffChunkType === 1448097868) {
      if (view.getUint8(20) !== 47) return null;
      let losslessBits: Dynamic = view.getUint32(21, true);
      return validImageDimensions(
        1 + (losslessBits & 16383),
        1 + ((losslessBits >> 14) & 16383),
      );
    }
    return null;
  }
  return view.getUint16(0) === 65496 ? jpegHeaderDimensions(view) : null;
}
function validImageDimensions(width?: Dynamic, height?: Dynamic): Dynamic {
  return width > 0 &&
    height > 0 &&
    width <= CanvasWorkingStateLimit &&
    height <= CanvasWorkingStateLimit
    ? {
        width: width,
        height: height,
      }
    : null;
}
function svgLengthToPixels(lengthText?: Dynamic): Dynamic {
  if (lengthText == null) return null;
  let match: Dynamic = /^\s*\+?(\d*\.?\d+)([a-z%]*)\s*$/i.exec(lengthText);
  if (!match) return null;
  let unitScale: Dynamic =
    CanvasWorkingStatePxPtPcConfig[(match[2] ?? "").toLowerCase()];
  return unitScale == null ? null : parseFloat(match[1] ?? "") * unitScale;
}
function svgAttributeValue(svgTag?: Dynamic, attributeName?: Dynamic): Dynamic {
  let match: Dynamic = new RegExp(
    "(?<![\\w-])" + attributeName + `\\s*=\\s*("([^"]*)"|'([^']*)')`,
    "i",
  ).exec(svgTag);
  return match ? (match[2] ?? match[3]) : undefined;
}
function svgHeaderDimensions(svgSource?: Dynamic): Dynamic {
  let tagMatch: Dynamic = /<svg(?=[\s>])[^>]*/i.exec(svgSource);
  if (!tagMatch) return null;
  let tagText: Dynamic = tagMatch[0],
    width: Dynamic = svgLengthToPixels(svgAttributeValue(tagText, "width")),
    height: Dynamic = svgLengthToPixels(svgAttributeValue(tagText, "height"));
  if (width != null && height != null)
    return validImageDimensions(width, height);
  let viewBoxText: Dynamic = svgAttributeValue(tagText, "viewBox");
  if (viewBoxText == null) return null;
  let viewBoxNumbers: Dynamic = viewBoxText
    .trim()
    .split(/[\s,]+/)
    .map(parseFloat);
  return viewBoxNumbers.length !== 4 ||
    viewBoxNumbers.some((coordinate?: Dynamic): Dynamic => !Number.isFinite(coordinate))
    ? null
    : validImageDimensions(viewBoxNumbers[2], viewBoxNumbers[3]);
}
function jpegHeaderDimensions(view?: Dynamic): Dynamic {
  let count: Dynamic = 2,
    orientation: Dynamic = 1;
  for (; count + 4 <= view.byteLength; ) {
    if (view.getUint8(count) !== 255) return null;
    let marker: Dynamic = view.getUint8(count + 1);
    for (; marker === 255 && count + 2 < view.byteLength; ) {
      count++;
      marker = view.getUint8(count + 1);
    }
    if (marker === 1 || (marker >= 208 && marker <= 215)) {
      count += 2;
      continue;
    }
    if (marker === 217 || marker === 218) return null;
    let segmentLength: Dynamic = view.getUint16(count + 2);
    if (segmentLength < 2) return null;
    if (
      marker >= 192 &&
      marker <= 207 &&
      marker !== 196 &&
      marker !== 200 &&
      marker !== 204
    ) {
      let frameHeight: Dynamic = view.getUint16(count + 5),
        frameWidth: Dynamic = view.getUint16(count + 7),
        isRotated: Dynamic = orientation >= 5 && orientation <= 8;
      return validImageDimensions(
        isRotated ? frameHeight : frameWidth,
        isRotated ? frameWidth : frameHeight,
      );
    }
    if (
      marker === 225 &&
      segmentLength >= 16 &&
      view.getUint32(count + 4) === 1165519206
    )
      try {
        orientation =
          exifImageOrientation(view, count + 10, segmentLength - 8) ?? orientation;
      } catch {}
    count += 2 + segmentLength;
  }
  return null;
}
function exifImageOrientation(
  view?: Dynamic,
  tiffStart?: Dynamic,
  availableLength?: Dynamic,
): Dynamic {
  let isInRange: Dynamic = (offset?: Dynamic, length?: Dynamic): Dynamic =>
    offset >= 0 && offset + length <= availableLength;
  if (!isInRange(0, 8)) return null;
  let byteOrderMark: Dynamic = view.getUint16(tiffStart),
    isLittleEndian: Dynamic = byteOrderMark === 18761;
  if (
    (!isLittleEndian && byteOrderMark !== 19789) ||
    view.getUint16(tiffStart + 2, isLittleEndian) !== 42
  )
    return null;
  let ifdOffset: Dynamic = view.getUint32(tiffStart + 4, isLittleEndian);
  if (!isInRange(ifdOffset, 2)) return null;
  let entryCount: Dynamic = view.getUint16(tiffStart + ifdOffset, isLittleEndian);
  for (let index: Dynamic = 0; index < entryCount; index++) {
    let entryOffset: Dynamic = ifdOffset + 2 + index * 12;
    if (!isInRange(entryOffset, 12)) return null;
    if (view.getUint16(tiffStart + entryOffset, isLittleEndian) === 274) {
      let orientation: Dynamic = view.getUint16(tiffStart + entryOffset + 8, isLittleEndian);
      return orientation >= 1 && orientation <= 8 ? orientation : null;
    }
  }
  return null;
}
function notifyDropGhosts(): Dynamic {
  CanvasWorkingStateMapValue = CanvasWorkingStateItems.map(
    ({ need: need, ...props }: Dynamic): Dynamic => props,
  );
  for (let notify of CanvasWorkingStateSubscribers as Dynamic) notify();
}
function removeDropGhost(ghost?: Dynamic): Dynamic {
  let ghostIndex: Dynamic = CanvasWorkingStateItems.indexOf(ghost);
  ghostIndex < 0 || (CanvasWorkingStateItems.splice(ghostIndex, 1), notifyDropGhosts());
}
function createDropGhost({ washless: washless, ...props }: Dynamic): Dynamic {
  let length: Dynamic = CanvasWorkingStateItems.filter(
      (otherGhost?: Dynamic): Dynamic =>
        otherGhost.file != null &&
        otherGhost.file === props.file &&
        otherGhost.need !== 1 / 0,
    ).length,
    state: Dynamic = {
      ...props,
      key: "dg-" + String(++dropGhostCounter),
      need:
        props.file == null || washless
          ? 1 / 0
          : (CanvasWorkingStateCache.get(props.file) ?? 0) + length + 1,
    };
  CanvasWorkingStateItems.push(state);
  notifyDropGhosts();
  return {
    replaced: (): Dynamic =>
      afterRendering((): Dynamic => removeDropGhost(state)),
    cancel: (): Dynamic => {
      if (CanvasWorkingStateItems.includes(state)) {
        for (let otherGhost of CanvasWorkingStateItems as Dynamic)
          otherGhost !== state &&
            otherGhost.file != null &&
            otherGhost.file === state.file &&
            otherGhost.need > state.need &&
            (otherGhost.need -= 1);
        removeDropGhost(state);
      }
    },
    landed: (): Dynamic => {
      setTimeout((): Dynamic => removeDropGhost(state), 700);
    },
    move: (x?: Dynamic, y?: Dynamic): Dynamic => {
      !CanvasWorkingStateItems.includes(state) ||
        (state.x === x && state.y === y) ||
        ((state.x = x), (state.y = y), notifyDropGhosts());
    },
    place: (rect?: Dynamic): Dynamic => {
      !CanvasWorkingStateItems.includes(state) ||
        (state.x === rect.x &&
          state.y === rect.y &&
          state.w === rect.w &&
          state.h === rect.h) ||
        (Object.assign(state, rect), notifyDropGhosts());
    },
  };
}
function updateDropGhostDemand(file?: Dynamic, pendingCount?: Dynamic): Dynamic {
  let resolvedCount: Dynamic = Math.max(
    0,
    (CanvasWorkingStateCache.get(file) ?? 0) - pendingCount,
  );
  CanvasWorkingStateCache.set(file, pendingCount);
  resolvedCount > 0 &&
    CanvasWorkingStateItems.filter(
      (ghost?: Dynamic): Dynamic =>
        ghost.file === file && ghost.need !== 1 / 0,
    ).forEach((ghost?: Dynamic, index?: Dynamic): Dynamic => {
      ghost.need = Math.max(index + 1, ghost.need - resolvedCount);
    });
  for (let ghostToRemove of CanvasWorkingStateItems.filter(
    (ghost?: Dynamic): Dynamic => ghost.file === file,
  ) as Dynamic)
    pendingCount >= ghostToRemove.need &&
      afterRendering((): Dynamic => removeDropGhost(ghostToRemove));
}
function uploadingAnimationDelay(): Dynamic {
  return "-" + String(Date.now() % 1600) + "ms";
}
function getDropGhosts(): Dynamic {
  return CanvasWorkingStateMapValue;
}
function subscribeDropGhosts(listener?: Dynamic): Dynamic {
  CanvasWorkingStateSubscribers.add(listener);
  return (): Dynamic => {
    CanvasWorkingStateSubscribers.delete(listener);
  };
}
function afterNextPaint(): Dynamic {
  return new Promise((resolve?: Dynamic): Dynamic => {
    typeof requestAnimationFrame == "function" &&
      requestAnimationFrame((): Dynamic => setTimeout(resolve, 0));
    setTimeout(resolve, 100);
  });
}
function afterRendering(render?: Dynamic): Dynamic {
  typeof requestAnimationFrame == "function"
    ? afterNextPaint().then(render)
    : render();
}
function markDropPerformance(stage?: Dynamic): Dynamic {
  try {
    if (stage === "received")
      for (let entry of performance.getEntriesByType("mark") as Dynamic)
        entry.name.startsWith("dc-drop:") &&
          performance.clearMarks(entry.name);
    performance.mark("dc-drop:" + stage);
  } catch {}
}
function stopImagePreviewWorker(): Dynamic {
  clearTimeout(imagePreviewWorkerDeadline);
  imagePreviewWorkerUnavailable = true;
  imagePreviewWorker?.terminate();
  imagePreviewWorker = null;
  for (let job of [
    ...(CanvasWorkingStateJobState ? [CanvasWorkingStateJobState] : []),
    ...imagePreviewQueue.splice(0),
  ] as Dynamic)
    job.settle("unavailable");
  CanvasWorkingStateJobState = null;
}
function runNextImagePreviewJob(): Dynamic {
  if (
    !(
      CanvasWorkingStateJobState !== null ||
      imagePreviewQueue.length === 0
    )
  ) {
    CanvasWorkingStateJobState = imagePreviewQueue.shift();
    try {
      imagePreviewWorker === null &&
        ((imagePreviewWorker = new Worker(
          URL.createObjectURL(
            new Blob([CanvasWorkingStateHtml], {
              type: "text/javascript",
            }),
          ),
        )),
        (imagePreviewWorker.onmessage = (event?: Dynamic): Dynamic => {
          if (event.data.unavailable) return stopImagePreviewWorker();
          clearTimeout(imagePreviewWorkerDeadline);
          let job: Dynamic = CanvasWorkingStateJobState;
          CanvasWorkingStateJobState = null;
          job?.settle(
            event.data.threw
              ? "unavailable"
              : {
                  url: event.data.url ?? null,
                  width: event.data.width ?? 0,
                  height: event.data.height ?? 0,
                },
          );
          runNextImagePreviewJob();
        }),
        (imagePreviewWorker.onerror = stopImagePreviewWorker),
        (imagePreviewWorker.onmessageerror = stopImagePreviewWorker));
      imagePreviewWorker.postMessage(CanvasWorkingStateJobState.job);
      imagePreviewWorkerDeadline = setTimeout(
        stopImagePreviewWorker,
        CanvasWorkingStateDelayMs,
      );
    } catch {
      stopImagePreviewWorker();
    }
  }
}
function previewImageInWorker(
  file?: Dynamic,
  width?: Dynamic,
  edge?: Dynamic,
  maxChars?: Dynamic,
): Dynamic {
  return imagePreviewWorkerUnavailable ||
    typeof Worker === "undefined" ||
    typeof OffscreenCanvas === "undefined"
    ? Promise.resolve("unavailable")
    : new Promise((resolve?: Dynamic): Dynamic => {
        imagePreviewQueue.push({
          job: {
            file: file,
            width: width,
            edge: edge,
            maxChars: maxChars,
          },
          settle: resolve,
        });
        runNextImagePreviewJob();
      });
}
function encodeImagePreview(
  canvas?: Dynamic,
  quality?: Dynamic,
  maxChars: Dynamic = 0,
): Dynamic {
  let source: Dynamic = canvas,
    text: Dynamic = "image/webp",
    currentQuality: Dynamic = quality,
    dataUrl: Dynamic = source.toDataURL(text, currentQuality);
  if (!dataUrl.startsWith("data:image/webp")) {
    let fallbackCanvas: Dynamic = (document as Dynamic).createElement("canvas");
    fallbackCanvas.width = source.width;
    fallbackCanvas.height = source.height;
    let context2d: Dynamic = fallbackCanvas.getContext("2d");
    context2d &&
      ((context2d.fillStyle = "#fff"),
      context2d.fillRect(0, 0, fallbackCanvas.width, fallbackCanvas.height),
      context2d.drawImage(source, 0, 0));
    source = fallbackCanvas;
    text = "image/jpeg";
    dataUrl = source.toDataURL(text, currentQuality);
  }
  for (; maxChars && dataUrl.length > maxChars && currentQuality > 0.3; ) {
    currentQuality -= 0.1;
    dataUrl = source.toDataURL(text, currentQuality);
  }
  if (maxChars && dataUrl.length > maxChars) {
    let halfCanvas: Dynamic = (document as Dynamic).createElement("canvas");
    halfCanvas.width = source.width >> 1 || 1;
    halfCanvas.height = source.height >> 1 || 1;
    halfCanvas
      .getContext("2d")
      ?.drawImage(source, 0, 0, halfCanvas.width, halfCanvas.height);
    dataUrl = halfCanvas.toDataURL(text, currentQuality);
  }
  return dataUrl;
}
function imagePreviewDecodeWidth(dimensions?: Dynamic): Dynamic {
  let downscaleFactor: Dynamic = dimensions
    ? Math.max(
        1,
        Math.ceil(
          Math.max(dimensions.width, dimensions.height) / maxPreviewEdge,
        ),
      )
    : 1;
  if (dimensions == null || downscaleFactor === 1) return 0;
  let scaledWidth: Dynamic = Math.max(1, Math.round(dimensions.width / downscaleFactor)),
    aspectRatio: Dynamic = dimensions.width / dimensions.height;
  return scaledWidth * scaledWidth * Math.max(aspectRatio, 1 / aspectRatio) > 67108864
    ? 0
    : scaledWidth;
}
function reconcileImageDimensions(
  headerSize?: Dynamic,
  decodedSize?: Dynamic,
): Dynamic {
  return headerSize == null
    ? {
        width: decodedSize.width,
        height: decodedSize.height,
      }
    : Math.abs(
          Math.log(
            (decodedSize.width / decodedSize.height) * (headerSize.width / headerSize.height),
          ),
        ) < 0.02 && Math.abs(Math.log(headerSize.width / headerSize.height)) > 0.04
      ? {
          width: headerSize.height,
          height: headerSize.width,
        }
      : headerSize;
}
async function previewImageFile(
  file?: Dynamic,
  hints: Dynamic = {},
): Promise<Dynamic> {
  if (isSvgFile(file))
    return file.size > CanvasWorkingStateFloorValue
      ? null
      : previewSvgFile(file);
  let [canDecode, headerSize]: Dynamic = await Promise.all([
    hints.sized ?? canDecodeRasterImage(file),
    hints.head !== undefined
      ? hints.head
      : imageHeaderDimensions(file).catch((): Dynamic => null),
  ]);
  if (!canDecode) return null;
  let decodeWidth: Dynamic = imagePreviewDecodeWidth(headerSize),
    preview: Dynamic = await previewImageInWorker(
      file,
      decodeWidth,
      maxPreviewEdge,
      maxPreviewChars,
    );
  preview === "unavailable"
    ? (preview = await decodeRasterPreview(file, decodeWidth))
    : preview.url != null && markDropPerformance("worker");
  return preview.url == null
    ? null
    : {
        url: preview.url,
        ...reconcileImageDimensions(headerSize, preview),
      };
}
async function decodeRasterPreview(
  file?: Dynamic,
  decodeWidth?: Dynamic,
): Promise<Dynamic> {
  let bitmap: Dynamic;
  try {
    bitmap = await (decodeWidth > 0
      ? createImageBitmap(file, {
          resizeWidth: decodeWidth,
          resizeQuality: "medium",
        }).catch((): Dynamic => createImageBitmap(file))
      : createImageBitmap(file));
  } catch {
    return {
      url: null,
      width: 0,
      height: 0,
    };
  }
  try {
    let downscaleFactor: Dynamic = Math.max(
        1,
        Math.ceil(
          Math.max(bitmap.width, bitmap.height) / maxPreviewEdge,
        ),
      ),
      scaledWidth: Dynamic = Math.max(1, Math.round(bitmap.width / downscaleFactor)),
      scaledHeight: Dynamic = Math.max(1, Math.round(bitmap.height / downscaleFactor)),
      previewUrl: Dynamic =
        (await encodeOffscreenPreview(bitmap, scaledWidth, scaledHeight)) ??
        encodeCanvasPreview(bitmap, scaledWidth, scaledHeight);
    return {
      url:
        previewUrl != null && previewUrl.length <= maxPreviewChars
          ? previewUrl
          : null,
      width: bitmap.width,
      height: bitmap.height,
    };
  } finally {
    bitmap.close();
  }
}
async function encodeOffscreenPreview(
  bitmap?: Dynamic,
  width?: Dynamic,
  height?: Dynamic,
): Promise<Dynamic> {
  if (typeof OffscreenCanvas === "undefined") return null;
  try {
    let canvas: Dynamic = new OffscreenCanvas(width, height);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, width, height);
    for (let quality: Dynamic = 0.8; quality > 0.25; quality -= 0.1) {
      let blob: Dynamic = await canvas.convertToBlob({
        type: "image/webp",
        quality: quality,
      });
      if (blob.type !== "image/webp") return null;
      let dataUrl: Dynamic = await CanvasWorkingStateOnload(blob);
      if (dataUrl.length <= maxPreviewChars) return dataUrl;
    }
    let halfCanvas: Dynamic = new OffscreenCanvas(
      width >> 1 || 1,
      height >> 1 || 1,
    );
    halfCanvas
      .getContext("2d")
      ?.drawImage(canvas, 0, 0, halfCanvas.width, halfCanvas.height);
    return await CanvasWorkingStateOnload(
      await halfCanvas.convertToBlob({
        type: "image/webp",
        quality: 0.3,
      }),
    );
  } catch {
    return null;
  }
}
function encodeCanvasPreview(
  bitmap?: Dynamic,
  width?: Dynamic,
  height?: Dynamic,
): Dynamic {
  let canvas: Dynamic = (document as Dynamic).createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let context2d: Dynamic = canvas.getContext("2d");
  return context2d
    ? (context2d.drawImage(bitmap, 0, 0, width, height),
      encodeImagePreview(canvas, 0.8, maxPreviewChars))
    : null;
}
async function previewSvgFile(file?: Dynamic): Promise<Dynamic> {
  try {
    let image: Dynamic = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(await file.text())}`;
    await image.decode();
    let naturalWidth: Dynamic = image.naturalWidth,
      naturalHeight: Dynamic = image.naturalHeight;
    if (!(naturalWidth > 0) || !(naturalHeight > 0)) return null;
    let downscaleFactor: Dynamic = Math.max(
        1,
        Math.ceil(
          Math.max(naturalWidth, naturalHeight) /
            maxPreviewEdge,
        ),
      ),
      scaledWidth: Dynamic = Math.max(1, Math.round(naturalWidth / downscaleFactor)),
      scaledHeight: Dynamic = Math.max(1, Math.round(naturalHeight / downscaleFactor)),
      canvas: Dynamic = (document as Dynamic).createElement("canvas");
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;
    let context2d: Dynamic = canvas.getContext("2d");
    if (!context2d) return null;
    context2d.drawImage(image, 0, 0, scaledWidth, scaledHeight);
    let previewUrl: Dynamic = encodeImagePreview(
      canvas,
      0.8,
      maxPreviewChars,
    );
    return previewUrl.length <= maxPreviewChars
      ? {
          url: previewUrl,
          width: naturalWidth,
          height: naturalHeight,
        }
      : null;
  } catch {
    return null;
  }
}
function positionedVideoHtml(
  src?: Dynamic,
  attrs?: Dynamic,
  rect?: Dynamic,
  label?: Dynamic,
): Dynamic {
  return uploadedVideoHtml(src, {
    ...attrs,
    style: `position: absolute; left: ${String(rect.left)}px; top: ${String(rect.top)}px; width: ${String(rect.w)}px; height: auto`,
    label: label,
  });
}
function videoFileTitle(file?: Dynamic): Dynamic {
  return (
    truncateUtf16Safely(
      file.name.replace(/\.[^.]*$/, "").trim(),
      60,
    ) || "Video"
  );
}
function uploadedVideoAnnotation(
  annotation?: Dynamic,
  upload?: Dynamic,
): Dynamic {
  return updateAnnotationAlt(
    updateAnnotationVideo(
      {
        ...annotation,
        src: upload.src,
        ...(upload.h !== undefined
          ? {
              h: upload.h,
            }
          : {}),
      },
      upload.video,
    ),
    upload.alt,
  );
}
function isSessionCancelMessage(message?: Dynamic, key?: Dynamic): Dynamic {
  return (
    message != null && key != null && message === BoxcancelValue + key
  );
}
function reduceSessionCancellation(
  record?: Dynamic,
  event?: Dynamic,
  status?: Dynamic,
): Dynamic {
  let state: Dynamic = {
    rec: record,
    restore: null,
    cancelKey: null,
  };
  return event.type === "escape"
    ? !record || !record.live || record.cancelling || status.busy
      ? state
      : {
          rec: {
            ...record,
            cancelling: true,
          },
          restore: null,
          cancelKey: record.key,
        }
    : event.file !== status.focusedFile
      ? state
      : event.type === "press"
        ? status.busy
          ? state
          : {
              rec: {
                file: event.file,
                key: event.key,
                live: false,
                prior: status.selection,
                at: status.now,
              },
              restore: null,
              cancelKey: null,
            }
        : !record || record.file !== event.file || record.key !== event.key
          ? state
          : event.type === "live"
            ? status.busy ||
              status.now - record.at > pressStaleMs
              ? {
                  rec: null,
                  restore: null,
                  cancelKey: null,
                }
              : {
                  rec: {
                    ...record,
                    live: true,
                  },
                  restore: null,
                  cancelKey: null,
                }
            : event.type === "end"
              ? {
                  rec: null,
                  restore: null,
                  cancelKey: null,
                }
              : !record.live ||
                  status.busy ||
                  !(record.cancelling || status.frameFocused)
                ? {
                    rec: null,
                    restore: null,
                    cancelKey: null,
                  }
                : {
                    rec: null,
                    restore: record.prior,
                    cancelKey: null,
                  };
}
function createEditSessionManager(host?: Dynamic): Dynamic {
  let undoStack: Dynamic = [],
    redoStack: Dynamic = [],
    isApplying: Dynamic = false,
    index: Dynamic = 0,
    pushCount: Dynamic = 0,
    refusedEntries: Dynamic = new WeakSet(),
    activeGroup: Dynamic = null,
    isSettling: Dynamic = false,
    markSettling: Dynamic = (): Dynamic => {
      isSettling = true;
      queueMicrotask((): Dynamic => {
        isSettling = false;
      });
    },
    listeners: Dynamic = new Set(),
    notifyListeners: Dynamic = (): Dynamic => {
      for (let listener of listeners as Dynamic) listener();
    },
    readFloor: Dynamic = (file?: Dynamic): Dynamic =>
      host.floor?.(file) ?? 0,
    effectiveDepth: Dynamic = (part?: Dynamic): Dynamic => {
      let floor: Dynamic = readFloor(part.file);
      return floor < part.floor
        ? 0
        : Math.max(0, part.depth - (floor - part.floor));
    },
    isUndoable: Dynamic = (part?: Dynamic): Dynamic => {
      let depth: Dynamic = host.depths(part.file);
      return depth != null && depth > 0 && depth === effectiveDepth(part);
    },
    isRedoable: Dynamic = (part?: Dynamic): Dynamic => {
      let depth: Dynamic = host.depths(part.file);
      return (
        depth != null &&
        effectiveDepth(part) > 0 &&
        depth === effectiveDepth(part) - 1 &&
        (host.redos?.(part.file) ?? 1) > 0
      );
    },
    entryMatches: Dynamic = (entry?: Dynamic, predicate?: Dynamic): Dynamic =>
      entry.atomic
        ? entry.parts.every(predicate)
        : entry.parts.some(predicate),
    reportAtomicRefusal: Dynamic = (
      entry?: Dynamic,
      reason?: Dynamic,
      once: Dynamic = false,
      outcome?: Dynamic,
      holderFile?: Dynamic,
    ): Dynamic => {
      if (once && refusedEntries.has(entry)) return;
      reason === "stale" && refusedEntries.add(entry);
      let bound: Dynamic = entry.bound;
      queueMicrotask(
        (): Dynamic => host.onAtomicRefused?.(bound, reason, outcome, holderFile),
      );
    },
    isEntryUsable: Dynamic = (entry?: Dynamic, predicate?: Dynamic): Dynamic =>
      !refusedEntries.has(entry) && entryMatches(entry, predicate),
    splitEntry: Dynamic = (
      entry?: Dynamic,
      direction?: Dynamic,
      predicate?: Dynamic,
    ): Dynamic => {
      let livingParts: Dynamic = entry.parts.filter(predicate);
      if (livingParts.length === entry.parts.length)
        return {
          parts: livingParts,
          atomic: true,
          ...(entry.holder !== undefined
            ? {
                holder: entry.holder,
              }
            : {}),
        };
      if (entry.holder === undefined) return null;
      let remainingParts: Dynamic = livingParts.filter(
        (part?: Dynamic): Dynamic =>
          direction === "undo"
            ? part.file !== entry.holder
            : part.file === entry.holder,
      );
      return remainingParts.length > 0
        ? {
            parts: remainingParts,
          }
        : null;
    },
    entryOutcome: Dynamic = (
      entry?: Dynamic,
      direction?: Dynamic,
      predicate?: Dynamic,
    ): Dynamic => {
      let split: Dynamic = splitEntry(entry, direction, predicate);
      return split
        ? split.atomic
          ? "whole"
          : direction === "undo"
            ? "others"
            : "holder"
        : "nothing";
    },
    findHolderPart: Dynamic = (entry?: Dynamic, predicate?: Dynamic): Dynamic => {
      if (
        entry.holder === undefined ||
        splitEntry(entry, "undo", predicate)?.atomic
      )
        return;
      let holder: Dynamic = entry.parts.find(
          (part?: Dynamic): Dynamic => part.file === entry.holder,
        ),
        holderDepth: Dynamic = holder ? host.depths(holder.file) : null;
      return holder &&
        holderDepth != null &&
        effectiveDepth(holder) > 0 &&
        holderDepth >= effectiveDepth(holder)
        ? holder
        : undefined;
    },
    dropStaleRedo: Dynamic = (parts?: Dynamic): Dynamic => {
      if (!host.dropRedo) return [];
      let staleParts: Dynamic = parts.filter((part?: Dynamic): Dynamic => {
        let depth: Dynamic = host.depths(part.file);
        return depth != null && depth < effectiveDepth(part);
      });
      for (let part of staleParts as Dynamic)
        host.dropRedo(part.file, effectiveDepth(part));
      return staleParts;
    },
    dropStaleRedoExcept: Dynamic = (parts?: Dynamic, file?: Dynamic): Dynamic =>
      parts.length < 2
        ? []
        : dropStaleRedo(
            parts.filter(
              (part?: Dynamic): Dynamic => part.file !== file,
            ),
          ),
    pruneRedoEntries: Dynamic = (parts?: Dynamic): Dynamic => {
      let pendingParts: Dynamic = [...parts];
      for (; pendingParts.length > 0; ) {
        let currentParts: Dynamic = pendingParts,
          isCovered: Dynamic = (part?: Dynamic): Dynamic =>
            currentParts.some(
              (other?: Dynamic): Dynamic =>
                other.file === part.file &&
                effectiveDepth(part) >= effectiveDepth(other),
            ),
          nextPending: Dynamic = [],
          keptEntries: Dynamic = [];
        for (let entry of redoStack as Dynamic)
          entry.parts.some(isCovered)
            ? entry.atomic
              ? (reportAtomicRefusal(entry, "stale", false, "nothing"),
                nextPending.push(
                  ...dropStaleRedo(
                    entry.parts.filter(
                      (part?: Dynamic): Dynamic => !isCovered(part),
                    ),
                  ),
                ))
              : ((entry.parts = entry.parts.filter(
                  (part?: Dynamic): Dynamic => !isCovered(part),
                )),
                entry.parts.length > 0 && keptEntries.push(entry))
            : keptEntries.push(entry);
        redoStack = keptEntries;
        pendingParts = nextPending;
      }
    },
    trimStaleEntries: Dynamic = (): Dynamic => {
      if (isApplying || index > 0) return;
      let length: Dynamic = undoStack.length;
      for (
        ;
        length > 0 &&
        !undoStack[length - 1].atomic &&
        !entryMatches(undoStack[length - 1], isUndoable);

      )
        length--;
      length !== undoStack.length && (undoStack = undoStack.slice(0, length));
      let topUndo: Dynamic = undoStack[undoStack.length - 1];
      topUndo?.atomic &&
        !entryMatches(topUndo, isUndoable) &&
        reportAtomicRefusal(
          topUndo,
          "stale",
          true,
          entryOutcome(topUndo, "undo", isUndoable),
        );
      let redoLength: Dynamic = redoStack.length;
      for (
        ;
        redoLength > 0 &&
        !redoStack[redoLength - 1].atomic &&
        !entryMatches(redoStack[redoLength - 1], isRedoable);

      )
        redoLength--;
      redoLength !== redoStack.length && (redoStack = redoStack.slice(0, redoLength));
      let topRedo: Dynamic = redoStack[redoStack.length - 1];
      topRedo?.atomic &&
        !entryMatches(topRedo, isRedoable) &&
        reportAtomicRefusal(
          topRedo,
          "stale",
          true,
          entryOutcome(topRedo, "redo", isRedoable),
        );
    },
    applyEntry: Dynamic = (
      entry?: Dynamic,
      direction?: Dynamic,
      isUsable?: Dynamic,
    ): Dynamic => {
      let trackApply: Dynamic = (promise?: Dynamic): Dynamic => (
        (isApplying = true),
        promise
          .then(
            (): Dynamic => true,
            (): Dynamic => false,
          )
          .finally((): Dynamic => {
            isApplying = false;
            notifyListeners();
          })
      );
      if (entry.parts.length === 1) {
        let applyResult: Dynamic = host.apply(entry.parts[0].file, direction);
        return applyResult
          ? trackApply(Promise.resolve(applyResult))
          : Promise.resolve(true);
      }
      let orderedParts: Dynamic =
        direction === "undo" ? [...entry.parts].reverse() : entry.parts;
      if (!entry.atomic)
        return trackApply(
          (async (): Promise<Dynamic> => {
            for (let part of orderedParts as Dynamic)
              isUsable(part) &&
                (await host.apply(part.file, direction, true));
          })(),
        );
      let reverseDirection: Dynamic = direction === "undo" ? "redo" : "undo",
        appliedParts: Dynamic = [];
      return trackApply(
        (async (): Promise<Dynamic> => {
          for (let part of orderedParts as Dynamic) {
            let depthBefore: Dynamic = host.depths(part.file);
            if (!isUsable(part)) {
              for (let appliedPart of [...appliedParts].reverse() as Dynamic)
                await host.apply(appliedPart.file, reverseDirection);
              throw new Error("atomic part went stale: " + part.file);
            }
            await host.apply(part.file, direction, true);
            let depthAfter: Dynamic = host.depths(part.file);
            if (
              depthBefore == null ||
              depthAfter == null ||
              depthAfter !== depthBefore + (direction === "undo" ? -1 : 1)
            ) {
              for (let appliedPart of [...appliedParts].reverse() as Dynamic)
                await host.apply(appliedPart.file, reverseDirection);
              throw new Error("atomic part did not land: " + part.file);
            }
            appliedParts.push(part);
          }
        })(),
      );
    },
    notifyBoundApplied: Dynamic = (
      entry?: Dynamic,
      direction?: Dynamic,
      applyPromise?: Dynamic,
    ): Dynamic => {
      let bound: Dynamic = entry.bound;
      bound === undefined ||
        !host.onBoundApplied ||
        applyPromise.then((didApply?: Dynamic): Dynamic => {
          didApply &&
            setTimeout(
              (): Dynamic => host.onBoundApplied?.(bound, direction),
              0,
            );
        });
    };
  return {
    reportPush(file: Dynamic): Dynamic {
      let depth: Dynamic = host.depths(file);
      if (depth == null || depth <= 0) return;
      activeGroup &&
        !activeGroup.atomic &&
        !activeGroup.files.has(file) &&
        !activeGroup.taken.has(file) &&
        (activeGroup = null);
      pushCount += 1;
      let state: Dynamic = {
          file: file,
          depth: depth,
          floor: readFloor(file),
        },
        joinsGroup: Dynamic =
          activeGroup != null &&
          activeGroup.files.has(file) &&
          !activeGroup.taken.has(file) &&
          !activeGroup.waiting.has(file);
      if (joinsGroup && activeGroup?.entry && undoStack.includes(activeGroup.entry)) {
        let entry: Dynamic = activeGroup.entry;
        entry.parts.push(state);
        let entryIndex: Dynamic = undoStack.indexOf(entry),
          laterEntries: Dynamic = undoStack.slice(entryIndex + 1);
        if (
          laterEntries.some(
            (laterEntry?: Dynamic): Dynamic =>
              laterEntry.parts.some(
                (part?: Dynamic): Dynamic => part.file === file,
              ),
          )
        ) {
          let otherFiles: Dynamic = new Set(
              entry.parts
                .map((part?: Dynamic): Dynamic => part.file)
                .filter((otherFile?: Dynamic): Dynamic => otherFile !== file),
            ),
            dependentEntries: Dynamic = laterEntries.filter(
              (laterEntry?: Dynamic): Dynamic =>
                laterEntry.parts.some(
                  (part?: Dynamic): Dynamic => otherFiles.has(part.file),
                ),
            ),
            independentEntries: Dynamic = laterEntries.filter(
              (laterEntry?: Dynamic): Dynamic => !dependentEntries.includes(laterEntry),
            ),
            dependentFiles: Dynamic = new Set(
              dependentEntries.flatMap(
                (laterEntry?: Dynamic): Dynamic =>
                  laterEntry.parts.map(
                    (part?: Dynamic): Dynamic => part.file,
                  ),
              ),
            );
          !dependentFiles.has(file) &&
            !independentEntries.some(
              (laterEntry?: Dynamic): Dynamic =>
                laterEntry.parts.some(
                  (part?: Dynamic): Dynamic => dependentFiles.has(part.file),
                ),
            ) &&
            (undoStack = [
              ...undoStack.slice(0, entryIndex),
              ...independentEntries,
              entry,
              ...dependentEntries,
            ]);
        }
      } else {
        let newEntry: Dynamic = {
          parts: [state],
          ...(joinsGroup && activeGroup?.bound !== undefined
            ? {
                bound: activeGroup.bound,
              }
            : {}),
          ...(joinsGroup && activeGroup?.atomic
            ? {
                atomic: true,
              }
            : {}),
          ...(joinsGroup && activeGroup?.atomic && activeGroup.holder !== undefined
            ? {
                holder: activeGroup.holder,
              }
            : {}),
        };
        joinsGroup && activeGroup && (activeGroup.entry = newEntry);
        let nextStack: Dynamic = [...undoStack, newEntry];
        for (let droppedEntry of nextStack.slice(
          0,
          Math.max(0, nextStack.length - 50),
        ) as Dynamic)
          droppedEntry.atomic && reportAtomicRefusal(droppedEntry, "capped");
        undoStack = nextStack.slice(-50);
      }
      joinsGroup &&
        activeGroup &&
        (activeGroup.taken.add(file),
        activeGroup.taken.size === activeGroup.files.size && (activeGroup = null));
      redoStack = [];
      notifyListeners();
    },
    group(files: Dynamic, groupOptions: Dynamic): Dynamic {
      let state: Dynamic = {
        files: new Set(files),
        taken: new Set(),
        waiting: new Set(groupOptions?.waiting ?? []),
        entry: null,
        ...(groupOptions?.bound !== undefined
          ? {
              bound: groupOptions.bound,
            }
          : {}),
        ...(groupOptions?.atomic
          ? {
              atomic: true,
            }
          : {}),
        ...(groupOptions?.atomic && groupOptions.holder !== undefined
          ? {
              holder: groupOptions.holder,
            }
          : {}),
      };
      activeGroup = state;
      return {
        end(): Dynamic {
          activeGroup === state && (activeGroup = null);
        },
        admit(file: Dynamic): Dynamic {
          state.waiting.delete(file);
        },
        settled(file: Dynamic): Dynamic {
          activeGroup !== state ||
            !state.files.has(file) ||
            (state.taken.add(file),
            state.taken.size === state.files.size && (activeGroup = null));
        },
        discard(file: Dynamic): Dynamic {
          let entry: Dynamic = state.entry,
            entryPart: Dynamic =
              entry && undoStack.includes(entry)
                ? entry.parts.find(
                    (part?: Dynamic): Dynamic => part.file === file,
                  )
                : undefined;
          if (!entry || !entryPart || !isUndoable(entryPart)) return null;
          let savedEntry: Dynamic = {
            parts: entry.parts,
            atomic: entry.atomic,
            holder: entry.holder,
          };
          entry.parts = entry.parts.filter(
            (part?: Dynamic): Dynamic => part.file !== file,
          );
          file === entry.holder &&
            (delete entry.atomic, delete entry.holder);
          entry.parts.length === 0 &&
            (undoStack = undoStack.filter(
              (item?: Dynamic): Dynamic => item !== entry,
            ));
          notifyListeners();
          return (): Dynamic => {
            entry.parts = savedEntry.parts;
            savedEntry.atomic && (entry.atomic = savedEntry.atomic);
            savedEntry.holder !== undefined && (entry.holder = savedEntry.holder);
            undoStack.includes(entry) || (undoStack = [...undoStack, entry].slice(-50));
            notifyListeners();
          };
        },
      };
    },
    canUndo(): Dynamic {
      trimStaleEntries();
      return undoStack.length > 0;
    },
    canRedo(): Dynamic {
      trimStaleEntries();
      return redoStack.length > 0;
    },
    undoFile(): Dynamic {
      trimStaleEntries();
      let topEntry: Dynamic = undoStack[undoStack.length - 1];
      return (
        [
          ...((topEntry?.atomic && !isEntryUsable(topEntry, isUndoable)
            ? splitEntry(topEntry, "undo", isUndoable)
            : topEntry
          )?.parts ?? []),
        ]
          .reverse()
          .find(isUndoable)?.file ?? null
      );
    },
    redoFile(): Dynamic {
      trimStaleEntries();
      let topEntry: Dynamic = redoStack[redoStack.length - 1];
      return (
        (topEntry?.atomic && !isEntryUsable(topEntry, isRedoable)
          ? splitEntry(topEntry, "redo", isRedoable)
          : topEntry
        )?.parts.find(isRedoable)?.file ?? null
      );
    },
    undo(): Dynamic {
      if (isApplying || isSettling) return "applied";
      let hadEntries: Dynamic = undoStack.length > 0;
      for (; undoStack.length > 0; ) {
        let entry: Dynamic = undoStack[undoStack.length - 1];
        undoStack = undoStack.slice(0, -1);
        if (
          entry.atomic
            ? !isEntryUsable(entry, isUndoable)
            : !entryMatches(entry, isUndoable)
        ) {
          if (entry.atomic) {
            let holder: Dynamic = findHolderPart(entry, isUndoable);
            reportAtomicRefusal(
              entry,
              "stale",
              false,
              entryOutcome(entry, "undo", isUndoable),
              holder?.file,
            );
            let remaining: Dynamic = splitEntry(entry, "undo", isUndoable);
            holder && host.cutUndo?.(holder.file, effectiveDepth(holder));
            if (remaining) {
              undoStack = [...undoStack, remaining];
              continue;
            }
            notifyListeners();
            return "refused-atomic";
          }
          continue;
        }
        markSettling();
        let epoch: Dynamic = pushCount,
          applyPromise: Dynamic = applyEntry(entry, "undo", isUndoable);
        entry.atomic && index++;
        notifyBoundApplied(entry, "undo", applyPromise);
        entry.atomic
          ? applyPromise
              .catch((): Dynamic => false)
              .then((didApply?: Dynamic): Dynamic => {
                index--;
                didApply
                  ? pushCount === epoch
                    ? (redoStack = [...redoStack, entry].slice(-50))
                    : reportAtomicRefusal(entry, "stale", false, "nothing")
                  : pushCount === epoch
                    ? ((undoStack = [...undoStack, entry].slice(-50)),
                      reportAtomicRefusal(entry, "failed"))
                    : reportAtomicRefusal(entry, "stale", false, "nothing");
                notifyListeners();
              })
          : (redoStack = [...redoStack, entry].slice(-50));
        notifyListeners();
        return "applied";
      }
      notifyListeners();
      return hadEntries ? "skipped-all" : "empty";
    },
    redo(): Dynamic {
      if (isApplying || isSettling) return "applied";
      let hadEntries: Dynamic = redoStack.length > 0;
      for (; redoStack.length > 0; ) {
        let entry: Dynamic = redoStack[redoStack.length - 1];
        redoStack = redoStack.slice(0, -1);
        if (
          entry.atomic
            ? !isEntryUsable(entry, isRedoable)
            : !entryMatches(entry, isRedoable)
        ) {
          if (entry.atomic) {
            reportAtomicRefusal(
              entry,
              "stale",
              false,
              entryOutcome(entry, "redo", isRedoable),
            );
            let remaining: Dynamic = splitEntry(entry, "redo", isRedoable);
            if (remaining) {
              redoStack = [...redoStack, remaining];
              continue;
            }
            pruneRedoEntries(dropStaleRedoExcept(entry.parts));
            notifyListeners();
            return "refused-atomic";
          }
          continue;
        }
        markSettling();
        let epoch: Dynamic = pushCount,
          applyPromise: Dynamic = applyEntry(entry, "redo", isRedoable);
        entry.atomic && index++;
        notifyBoundApplied(entry, "redo", applyPromise);
        entry.atomic
          ? applyPromise
              .catch((): Dynamic => false)
              .then((didApply?: Dynamic): Dynamic => {
                index--;
                didApply
                  ? pushCount === epoch
                    ? (undoStack = [...undoStack, entry].slice(-50))
                    : reportAtomicRefusal(entry, "stale", false, "nothing")
                  : pushCount === epoch
                    ? ((redoStack = [...redoStack, entry].slice(-50)),
                      reportAtomicRefusal(entry, "failed"))
                    : reportAtomicRefusal(entry, "stale", false, "nothing");
                notifyListeners();
              })
          : (undoStack = [...undoStack, entry].slice(-50));
        notifyListeners();
        return "applied";
      }
      notifyListeners();
      return hadEntries ? "skipped-all" : "empty";
    },
    busy: (): Dynamic => isApplying || index > 0,
    settle: trimStaleEntries,
    staleBound(direction: Dynamic): Dynamic {
      let stack: Dynamic = direction === "undo" ? undoStack : redoStack,
        topEntry: Dynamic = stack[stack.length - 1];
      return topEntry?.atomic &&
        !isEntryUsable(topEntry, direction === "undo" ? isUndoable : isRedoable)
        ? (topEntry.bound ?? null)
        : null;
    },
    headBound(direction: Dynamic): Dynamic {
      trimStaleEntries();
      let stack: Dynamic = direction === "undo" ? undoStack : redoStack;
      return stack[stack.length - 1]?.bound ?? null;
    },
    forget(file: Dynamic): Dynamic {
      let staleRedoParts: Dynamic = [],
        dropFile: Dynamic = (
          entries?: Dynamic,
          direction?: Dynamic,
        ): Dynamic => {
          for (let entry of entries as Dynamic)
            if (
              entry.atomic &&
              entry.parts.some(
                (part?: Dynamic): Dynamic => part.file === file,
              )
            ) {
              let remaining: Dynamic = splitEntry(
                  entry,
                  direction,
                  (part?: Dynamic): Dynamic => part.file !== file,
                ),
                holder: Dynamic =
                  direction === "undo"
                    ? findHolderPart(
                        entry,
                        (part?: Dynamic): Dynamic => part.file !== file,
                      )
                    : undefined;
              reportAtomicRefusal(
                entry,
                "stale",
                false,
                remaining
                  ? direction === "undo"
                    ? "others"
                    : "holder"
                  : "nothing",
                holder?.file,
              );
              !remaining &&
                direction === "redo" &&
                staleRedoParts.push(...dropStaleRedoExcept(entry.parts, file));
              holder && host.cutUndo?.(holder.file, effectiveDepth(holder));
              entry.parts = remaining?.parts ?? [];
              delete entry.atomic;
              delete entry.bound;
              delete entry.holder;
            } else
              entry.parts = entry.parts.filter(
                (part?: Dynamic): Dynamic => part.file !== file,
              );
          return entries.filter(
            (part?: Dynamic): Dynamic => part.parts.length > 0,
          );
        };
      undoStack = dropFile(undoStack, "undo");
      redoStack = dropFile(redoStack, "redo");
      pruneRedoEntries(staleRedoParts);
      activeGroup?.entry &&
        activeGroup.entry.parts.length === 0 &&
        (activeGroup.entry = null);
      notifyListeners();
    },
    clearRedo(): Dynamic {
      let savedRedo: Dynamic = redoStack;
      return savedRedo.length === 0
        ? (): Dynamic => {}
        : ((redoStack = []),
          notifyListeners(),
          (): Dynamic => {
            redoStack.length > 0 || ((redoStack = savedRedo), notifyListeners());
          });
    },
    subscribe(listener: Dynamic): Dynamic {
      listeners.add(listener);
      return (): Dynamic => {
        listeners.delete(listener);
      };
    },
  };
}
function createSessionHistory(host?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(),
    values: Dynamic = new Set(),
    epoch: Dynamic,
    dropEntry: Dynamic = (key?: Dynamic, reason?: Dynamic): Dynamic => {
      entries.delete(key) && host.onDrop(key, reason);
    },
    isSameStack: Dynamic = (items?: Dynamic, snapshot?: Dynamic): Dynamic =>
      items === snapshot.entries && items.length === snapshot.length,
    hasPropEntries: Dynamic = (state?: Dynamic): Dynamic =>
      [...state.undo, ...state.redo].some(
        (source?: Dynamic): Dynamic =>
          typeof source != "string" && source.kind === "prop",
      ),
    readPropDefault: Dynamic = (propsJson?: Dynamic, propName?: Dynamic): Dynamic => {
      try {
        return JSON.parse(propsJson ?? "")?.[propName]?.default;
      } catch {
        return;
      }
    },
    canReplayRedo: Dynamic = (state?: Dynamic, source?: Dynamic): Dynamic => {
      let currentProps: Dynamic = getDcPropsJson(source),
        seenProps: Dynamic = new Set();
      for (let item of [...state.redo].reverse() as Dynamic)
        if (!(typeof item == "string" || item.kind !== "prop")) {
          if (item.before === undefined && !seenProps.has(item.prop)) {
            let currentDefault: Dynamic = readPropDefault(currentProps, item.prop);
            if (
              typeof currentDefault != "string" ||
              currentDefault !== readPropDefault(item.base, item.prop)
            )
              return false;
          }
          seenProps.add(item.prop);
        }
      return true;
    },
    compareKeptHistory: Dynamic = (
      file?: Dynamic,
      kept?: Dynamic,
      currentSource?: Dynamic,
    ): Dynamic => {
      let state: Dynamic = kept.state;
      if (!kept.settled) return "unsaved";
      if (state.adoptedMerge) return "merged";
      if (
        state.dirty ||
        state.pendingScript !== undefined ||
        Object.keys(state.pendingProps ?? {}).length > 0
      )
        return "unsaved";
      try {
        if (
          !isSameStack(state.undo, kept.undo) ||
          !isSameStack(state.redo, kept.redo)
        )
          return "stale";
        if (currentSource === undefined) return "changed";
        let parsedDoc: Dynamic = parseDcHtmlDocument(currentSource);
        if (
          !parsedDoc ||
          !sameDcTemplate(currentSource, state.src) ||
          (hasPropEntries(state) &&
            getDcPropsJson(currentSource) !==
              getDcPropsJson(state.src))
        )
          return "changed";
        if (!canReplayRedo(state, currentSource)) return "stale";
        let stableModel: Dynamic = serializeStableModel(state);
        return parsedDoc.template === stableModel ||
          state.model.rebuild(parsedDoc.template).serialize() ===
            state.model.rebuild(stableModel).serialize()
          ? "same"
          : "changed";
      } catch (error: Dynamic) {
        console.warn(
          "[history-keeper] could not compare the kept history of " + file,
          error,
        );
        return "stale";
      }
    };
  return {
    setEpoch(newEpoch: Dynamic): Dynamic {
      epoch = newEpoch;
    },
    keep(
      file: Dynamic,
      historyState: Dynamic,
      loadPromise: Dynamic,
      keptEpoch: Dynamic,
    ): Dynamic {
      if (
        entries.has(file) ||
        values.has(file) ||
        !host.inDocument(file) ||
        keptEpoch === undefined ||
        keptEpoch !== epoch ||
        (historyState.undo.length === 0 && historyState.redo.length === 0) ||
        historyState.adoptedMerge
      )
        return false;
      let state: Dynamic = {
          state: historyState,
          undo: {
            entries: historyState.undo,
            length: historyState.undo.length,
          },
          redo: {
            entries: historyState.redo,
            length: historyState.redo.length,
          },
          epoch: keptEpoch,
          settled: false,
          chain: Promise.resolve(),
          loadStarted: false,
        },
        markSettled: Dynamic = (): Dynamic => {
          state.settled = true;
        };
      for (
        state.chain = loadPromise.then(markSettled, markSettled),
          entries.set(file, state);
        entries.size > keptFilesMax;

      ) {
        let evictKey: Dynamic = [...entries.keys()].find(
          (key?: Dynamic): Dynamic =>
            key !== file && !host.isProtected(key),
        );
        if (evictKey === undefined) {
          entries.delete(file);
          return false;
        }
        dropEntry(evictKey, "cap");
      }
      return true;
    },
    decline(file: Dynamic): Dynamic {
      let entry: Dynamic = entries.get(file);
      if (!entry) return host.onDrop(file, "declined");
      entry.loadStarted = false;
      entry.waitingSince = undefined;
    },
    holds: (file?: Dynamic): Dynamic => entries.has(file),
    heldFiles: (): Dynamic => [...entries.keys()],
    read(file: Dynamic, field: Dynamic): Dynamic {
      let keptState: Dynamic = entries.get(file)?.state;
      return keptState
        ? field === "depth"
          ? keptState.undo.length
          : field === "redos"
            ? keptState.redo.length
            : (keptState.undoFloor ?? 0)
        : null;
    },
    peekEpoch: (file?: Dynamic): Dynamic => entries.get(file)?.epoch,
    settledOf: (file?: Dynamic): Dynamic =>
      entries.get(file)?.settled ?? false,
    whenSettled(file: Dynamic): Dynamic {
      let entry: Dynamic = entries.get(file);
      return entry
        ? new Promise((resolve?: Dynamic): Dynamic => {
            let timerId: Dynamic = setTimeout(
              (): Dynamic => resolve(false),
              host.writeSettleMs ??
                CanvasWorkingStateKEEPFILESMAXWaitsConfig.waits.writeSettleMs,
            );
            entry.chain.then((): Dynamic => {
              clearTimeout(timerId);
              resolve(true);
            });
          })
        : Promise.resolve(true);
    },
    check(file: Dynamic, currentSource: Dynamic): Dynamic {
      let entry: Dynamic = entries.get(file);
      return entry ? compareKeptHistory(file, entry, currentSource) : "gone";
    },
    take(file: Dynamic, currentSource: Dynamic, currentEpoch: Dynamic): Dynamic {
      let entry: Dynamic = entries.get(file);
      if (!entry) return null;
      let comparison: Dynamic = compareKeptHistory(file, entry, currentSource),
        dropReason: Dynamic =
          comparison !== "same"
            ? comparison
            : currentEpoch !== entry.epoch
              ? "epoch"
              : null;
      return dropReason !== null
        ? (dropEntry(file, dropReason), null)
        : (entries.delete(file),
          {
            undo: [...entry.state.undo],
            redo: [...entry.state.redo],
            undoFloor: entry.state.undoFloor ?? 0,
          });
    },
    drop: dropEntry,
    taint(files: Dynamic): Dynamic {
      for (let file of files as Dynamic) values.add(file);
    },
    prune(): Dynamic {
      for (let file of [...entries.keys()] as Dynamic)
        host.inDocument(file) || dropEntry(file, "gone");
    },
    clearAll(): Dynamic {
      for (let file of [...entries.keys()] as Dynamic)
        dropEntry(file, "session");
    },
    clearRedo(): Dynamic {
      let items: Dynamic = [],
        setRedo: Dynamic = (
          entry?: Dynamic,
          redoEntries?: Dynamic,
        ): Dynamic => {
          entry.state.redo = redoEntries;
          entry.redo = {
            entries: redoEntries,
            length: redoEntries.length,
          };
        };
      for (let [file, entry] of entries as Dynamic)
        entry.state.redo.length === 0 ||
          !isSameStack(entry.state.redo, entry.redo) ||
          (items.push([file, entry, entry.state.redo]),
          setRedo(entry, []));
      return (): Dynamic => {
        for (let [file, entry, savedRedo] of items as Dynamic)
          entries.get(file) === entry &&
            isSameStack(entry.state.redo, entry.redo) &&
            entry.state.redo.length === 0 &&
            setRedo(entry, savedRedo);
      };
    },
    noteAbsorbed(file: Dynamic): Dynamic {
      let entry: Dynamic = entries.get(file);
      entry && (entry.waitingSince ??= host.now());
    },
    noteLoadStart(file: Dynamic): Dynamic {
      let entry: Dynamic = entries.get(file);
      entry &&
        ((entry.loadStarted = true), (entry.waitingSince ??= host.now()));
    },
    loadStarted: (file?: Dynamic): Dynamic =>
      entries.get(file)?.loadStarted ?? false,
    waitedTooLong(file: Dynamic): Dynamic {
      let waitingSince: Dynamic = entries.get(file)?.waitingSince;
      return (
        waitingSince !== undefined &&
        host.now() - waitingSince >
          CanvasWorkingStateKEEPFILESMAXWaitsConfig.waits.loadLimitMs
      );
    },
  };
}
function textEditHistoryEpoch(
  isEditing?: Dynamic,
  keepsEpoch?: Dynamic,
  epoch?: Dynamic,
): Dynamic {
  return isEditing
    ? {
        epoch: keepsEpoch ? epoch : undefined,
        clear: false,
      }
    : {
        epoch: undefined,
        clear: true,
      };
}
function createInlineHistoryBridge(
  canvasHistory?: Dynamic,
  keptHistory?: Dynamic,
  page?: Dynamic,
): Dynamic {
  let justApplied: Dynamic = false,
    isSwitching: Dynamic = false,
    stepCanvasHistory: Dynamic = (direction?: Dynamic): Dynamic => {
      let status: Dynamic = direction === "undo" ? canvasHistory.undo() : canvasHistory.redo();
      status === "applied" &&
        ((justApplied = true),
        queueMicrotask((): Dynamic => {
          justApplied = false;
        }));
      return status;
    },
    peekFile: Dynamic = (direction?: Dynamic): Dynamic =>
      direction === "undo" ? canvasHistory.undoFile() : canvasHistory.redoFile(),
    checkKept: Dynamic = (file?: Dynamic): Dynamic => {
      if (!page.inDocument(file)) return "gone";
      let verdict: Dynamic = keptHistory.check(file, page.currentSrc(file));
      return verdict === "same" ? null : verdict;
    },
    scheduleFirstPress: Dynamic = (
      direction?: Dynamic,
      file?: Dynamic,
      openPage?: Dynamic,
    ): Dynamic => {
      isSwitching = true;
      page.afterExitGuard((): Dynamic => {
        isSwitching = false;
        let targetPage: Dynamic = page.pageOfFile(file);
        !page.mayShowPage() ||
          page.openPage() !== openPage ||
          peekFile(direction) !== file ||
          !keptHistory.holds(file) ||
          targetPage === undefined ||
          !page.inDocument(file) ||
          (page.switchPage(
            targetPage,
            page.isFramed(file) ? file : undefined,
          ),
          page.say({
            kind: "first-press",
            dir: direction,
            file: file,
            page: targetPage,
          }));
      });
    },
    stepHistory: Dynamic = (direction?: Dynamic): Dynamic => {
      if (justApplied) return "applied";
      for (;;) {
        let nextFile: Dynamic = peekFile(direction);
        if (nextFile === null || !keptHistory.holds(nextFile)) return stepCanvasHistory(direction);
        if (!page.inDocument(nextFile)) {
          keptHistory.drop(nextFile, "gone");
          canvasHistory.forget(nextFile);
          continue;
        }
        let openPage: Dynamic = page.openPage();
        if (page.pageOfFile(nextFile) === openPage) {
          keptHistory.waitedTooLong(nextFile)
            ? keptHistory.drop(nextFile, "load")
            : (keptHistory.noteAbsorbed(nextFile),
              page.startLoad(nextFile),
              page.say({
                kind: "loading",
                dir: direction,
                file: nextFile,
              }));
          return "deferred";
        }
        if (isSwitching || !page.mayShowPage()) return "deferred";
        let staleReason: Dynamic = keptHistory.settledOf(nextFile)
          ? checkKept(nextFile)
          : null;
        if (staleReason !== null) {
          keptHistory.drop(nextFile, staleReason);
          for (let heldFile of keptHistory.heldFiles() as Dynamic) {
            let heldReason: Dynamic = keptHistory.settledOf(heldFile)
              ? checkKept(heldFile)
              : null;
            heldReason !== null && keptHistory.drop(heldFile, heldReason);
          }
          return "deferred";
        }
        scheduleFirstPress(direction, nextFile, openPage);
        return "deferred";
      }
    };
  return {
    ...canvasHistory,
    group(files: Dynamic, groupOptions: Dynamic): Dynamic {
      let items: Dynamic = [...files];
      (items.length > 1 ||
        groupOptions?.bound !== undefined ||
        groupOptions?.atomic) &&
        keptHistory.taint(items);
      return canvasHistory.group(items, groupOptions);
    },
    reportPush(file: Dynamic): Dynamic {
      keptHistory.holds(file) || canvasHistory.reportPush(file);
    },
    undo: (): Dynamic => stepHistory("undo"),
    redo: (): Dynamic => stepHistory("redo"),
  };
}
function recordSessionLoadStart(
  session?: Dynamic,
  file?: Dynamic,
  startLoad?: Dynamic,
): Dynamic {
  !startLoad ||
    session.loadStarted(file) ||
    (session.noteLoadStart(file), startLoad());
}
function readHeldSessionState(
  session?: Dynamic,
  isReady?: Dynamic,
  file?: Dynamic,
  field?: Dynamic,
  fallback?: Dynamic,
): Dynamic {
  return session.holds(file)
    ? isReady(file)
      ? session.read(file, field)
      : null
    : fallback();
}
function updateTextEditHistoryCounts(
  counts?: Dynamic,
  action?: Dynamic,
): Dynamic {
  counts.counts &&
    (action === "push"
      ? ((counts.redoableBeforePush = counts.redoable),
        (counts.applied += 1),
        (counts.redoable = 0))
      : action === "revoke"
        ? counts.applied > 0 &&
          ((counts.applied -= 1), (counts.redoable = counts.redoableBeforePush))
        : action === "undo"
          ? counts.applied > 0 && ((counts.applied -= 1), (counts.redoable += 1))
          : action === "redo"
            ? counts.redoable > 0 &&
              ((counts.redoable -= 1), (counts.applied += 1))
            : action === "drop-undo"
              ? counts.applied > 0 && (counts.applied -= 1)
              : action === "clear-redo"
                ? ((counts.redoable = 0), (counts.redoableBeforePush = 0))
                : action === "drop-redo" &&
                  counts.redoable > 0 &&
                  (counts.redoable -= 1));
}
function canApplyTextEditHistory(
  counts?: Dynamic,
  direction?: Dynamic,
  liveDepth?: Dynamic,
  canvasStep: Dynamic = null,
): Dynamic {
  return canvasStep !== null
    ? counts.counts && canvasStep.duringTextEdit === counts
    : ((liveDepth === null || liveDepth < counts.applied) &&
        ((counts.applied = 0),
        (counts.redoable = 0),
        (counts.redoableBeforePush = 0)),
      direction === "undo" ? counts.applied > 0 : counts.redoable > 0);
}
function stepInlineHistory({
  blocked: blocked,
  stillOk: stillOk,
  liveUndoDepth: liveUndoDepth,
  canvasStep: canvasStep,
  textEdit: textEdit,
  pending: pending,
  dir: dir,
  step: step,
}: Dynamic): Dynamic {
  if (!(blocked() || pending.current)) {
    if (
      textEdit === null ||
      canApplyTextEditHistory(
        textEdit,
        dir,
        liveUndoDepth(),
        canvasStep?.(dir) ?? null,
      )
    ) {
      step();
      return;
    }
    pending.current = true;
    return (async (): Promise<Dynamic> => {
      let didCommit: Dynamic = false;
      try {
        didCommit = await textEdit.commit();
      } catch (error: Dynamic) {
        console.error(
          "[design/undo] could not commit the open text edit before undo or redo; nothing was undone or redone:",
          error,
        );
      } finally {
        pending.current = false;
      }
      didCommit === true && !blocked() && stillOk() && step();
    })();
  }
}
function handleInlineUndoKey(event?: Dynamic, state?: Dynamic): Dynamic {
  if (
    !(event.metaKey || event.ctrlKey) ||
    typeof event.key != "string" ||
    event.key.toLowerCase() !== "z" ||
    event.defaultPrevented ||
    !state.editing ||
    state.filesOpen ||
    (!state.textEditOpen && !state.pending) ||
    state.targetOwnsKey()
  )
    return "ignore";
  if (state.pending) return "drop";
  let direction: Dynamic = event.shiftKey ? "redo" : "undo";
  return event.repeat && state.canvasStepOnTop(direction)
    ? "drop"
    : state.stepMadeDuringEdit(direction)
      ? "ignore"
      : event.repeat
        ? "drop"
        : direction;
}
function hasMultipleEditingGroups(
  groups?: Dynamic,
  extraCount?: Dynamic,
): Dynamic {
  let length: Dynamic = Object.values(groups ?? {}).filter(
    (group?: Dynamic): Dynamic => group.length > 0,
  ).length;
  return length >= 2 || (length >= 1 && extraCount >= 1);
}
function sessionAllowsMutation(session?: Dynamic): Dynamic {
  return !session.gesturing && session.setMoveCommits <= 0;
}
function selectionAfterElementEdits(
  selection?: Dynamic,
  scope?: Dynamic,
  artboardTids?: Dynamic,
  elementTids?: Dynamic,
  getArtboardName?: Dynamic,
): Dynamic {
  let values: Dynamic = new Set(selection.artboards),
    entries: Dynamic = new Map(),
    hasChange: Dynamic = false,
    items: Dynamic = [];
  for (let [file, tids] of artboardTids as Dynamic)
    if (values.has(file)) {
      if (tids.length === 0) {
        items.push(file);
        continue;
      }
      values.delete(file);
      entries.set(file, {
        name: getArtboardName(file),
        tids: [...tids],
        rect: null,
        count: tids.length,
      });
      hasChange = true;
    }
  for (let [file, element] of selection.elements as Dynamic) {
    let entry: Dynamic = elementTids.get(file);
    if (entry === "artboard") {
      values.add(file);
      hasChange = true;
      continue;
    }
    if (entry == null || entry.length === 0) {
      entry != null && items.push(file);
      entries.set(file, element);
      continue;
    }
    let isSameTids: Dynamic =
      entry.length === element.tids.length &&
      entry.every(
        (tid?: Dynamic, index?: Dynamic): Dynamic =>
          tid === element.tids[index],
      );
    entries.set(
      file,
      isSameTids
        ? element
        : {
            name: element.name ?? getArtboardName(file),
            tids: [...entry],
            rect: null,
            count: entry.length,
          },
    );
    isSameTids || (hasChange = true);
  }
  if (!hasChange) return selection;
  let notes: Dynamic = selection.notes;
  if (scope === "children") {
    for (let file of items as Dynamic) {
      values.delete(file);
      entries.delete(file);
    }
    notes = new Set();
  }
  return selectionFromParts(
    values,
    notes,
    entries,
    selection.primary,
  );
}
function nudgeCanvasObjects(
  manifest?: Dynamic,
  selection?: Dynamic,
  dx?: Dynamic,
  dy?: Dynamic,
): Dynamic {
  if (
    !Number.isFinite(dx) ||
    !Number.isFinite(dy) ||
    (dx === 0 && dy === 0)
  )
    return null;
  let clampCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
      Math.max(
        -coordinateLimit,
        Math.min(coordinateLimit, Math.round(coordinate)),
      ),
    artboardMoves: Dynamic = [],
    artboards: Dynamic = manifest.artboards.map((artboard?: Dynamic): Dynamic => {
      if (!selection.files.has(artboard.file)) return artboard;
      let state: Dynamic = {
        x: clampCoordinate(artboard.x + dx),
        y: clampCoordinate(artboard.y + dy),
      };
      return state.x === artboard.x && state.y === artboard.y
        ? artboard
        : (artboardMoves.push({
            file: artboard.file,
            from: {
              x: artboard.x,
              y: artboard.y,
            },
            to: state,
          }),
          {
            ...artboard,
            ...state,
          });
    }),
    noteMoves: Dynamic = [],
    annotations: Dynamic = manifest.annotations?.map((annotation?: Dynamic): Dynamic => {
      if (!selection.notes.has(annotation.id)) return annotation;
      let state: Dynamic = {
        x: clampCoordinate(annotation.x + dx),
        y: clampCoordinate(annotation.y + dy),
      };
      return state.x === annotation.x && state.y === annotation.y
        ? annotation
        : (noteMoves.push({
            id: annotation.id,
            from: {
              x: annotation.x,
              y: annotation.y,
            },
            to: state,
          }),
          moveAnnotation(annotation, state.x, state.y));
    });
  return artboardMoves.length === 0 && noteMoves.length === 0
    ? null
    : {
        moves: artboardMoves,
        anns: noteMoves,
        manifest: {
          ...manifest,
          artboards: artboards,
          ...(annotations
            ? {
                annotations: annotations,
              }
            : {}),
        },
      };
}
function boardSelectionKey(selection?: Dynamic): Dynamic {
  return (
    [...selection.files].sort().join(`
`) +
    `

` +
    [...selection.notes].sort().join(`
`)
  );
}
function selectionNavigationScope(
  selection?: Dynamic,
  isPanel?: Dynamic,
): Dynamic {
  return isPanel
    ? "panel"
    : selection.elements.size === 0 ||
        selection.artboards.size > 0 ||
        selection.notes.size > 0
      ? "canvas"
      : "siblings";
}
function canNavigateSelection(session?: Dynamic): Dynamic {
  return !session.gesturing && session.setMoveCommits <= 0;
}
function sameSelectionStructure(previous?: Dynamic, next?: Dynamic): Dynamic {
  let previousBoards: Dynamic = canvasBoardSelection(previous),
    nextBoards: Dynamic = canvasBoardSelection(next);
  return (
    next.elements.size === previous.elements.size &&
    [...next.elements.keys()].every(
      (item?: Dynamic): Dynamic => previous.elements.has(item),
    ) &&
    nextBoards.files.size === previousBoards.files.size &&
    [...nextBoards.files].every(
      (item?: Dynamic): Dynamic => previousBoards.files.has(item),
    ) &&
    nextBoards.notes.size === previousBoards.notes.size &&
    [...nextBoards.notes].every(
      (item?: Dynamic): Dynamic => previousBoards.notes.has(item),
    )
  );
}
function sameSelectedObjectFiles(
  previous?: Dynamic,
  next?: Dynamic,
): Dynamic {
  let collectObjectFiles: Dynamic = (selection?: Dynamic): Dynamic =>
      new Set([...selection.artboards, ...selection.elements.keys()]),
    previousFiles: Dynamic = collectObjectFiles(previous),
    nextFiles: Dynamic = collectObjectFiles(next);
  return (
    nextFiles.size === previousFiles.size &&
    [...nextFiles].every((file?: Dynamic): Dynamic => previousFiles.has(file)) &&
    next.notes.size === previous.notes.size &&
    [...next.notes].every(
      (file?: Dynamic): Dynamic => previous.notes.has(file),
    )
  );
}
function keyboardNudgeDelta(key?: Dynamic, isShift?: Dynamic): Dynamic {
  let step: Dynamic = isShift ? 10 : 1;
  switch (key) {
    case "ArrowLeft":
      return {
        dx: -step,
        dy: 0,
      };
    case "ArrowRight":
      return {
        dx: step,
        dy: 0,
      };
    case "ArrowUp":
      return {
        dx: 0,
        dy: -step,
      };
    case "ArrowDown":
      return {
        dx: 0,
        dy: step,
      };
    default:
      return null;
  }
}
function activeDesignColorTokens(
  tokens?: Dynamic,
  scopes?: Dynamic,
  activeScope?: Dynamic,
): Dynamic {
  let values: Dynamic = new Set(
      scopes.map((scope?: Dynamic): Dynamic => scope.selector),
    ),
    entries: Dynamic = new Map(),
    activeNames: Dynamic = new Set();
  for (let token of tokens as Dynamic) {
    let isActiveScope: Dynamic = activeScope !== undefined && token.scope === activeScope,
      isUnscoped: Dynamic = token.scope === undefined || !values.has(token.scope);
    (!isActiveScope && !isUnscoped) ||
      ((isActiveScope || !activeNames.has(token.name)) && entries.set(token.name, token),
      isActiveScope && activeNames.add(token.name));
  }
  return [...entries.values()];
}
function cssVariableValue(name?: Dynamic): Dynamic {
  return `var(${name.startsWith("--") ? name : `--${name}`})`;
}
function cssVariableName(text?: Dynamic): Dynamic {
  return text?.match(/^var\(\s*(--[\w-]+)\s*\)$/)?.[1] ?? null;
}
export {
  activeDesignColorTokens,
  afterNextPaint,
  afterRendering,
  boardSelectionKey,
  BoxcancelValue,
  canApplyTextEditHistory,
  canNavigateSelection,
  CanvasWorkingStateAddDeletePageAddConfig,
  CanvasWorkingStateCache,
  CanvasWorkingStateChangedStaleUnsavedSet,
  CanvasWorkingStateConstant,
  maxVideosPerDrop,
  travelCommitTimeoutMs,
  CanvasWorkingStateContext,
  CanvasWorkingStateDelayMs,
  CanvasWorkingStateFloorValue,
  CanvasWorkingStateHandler,
  createWorkingCommitRecord,
  isTextEditHistoryKind,
  CanvasWorkingStateHas,
  CanvasWorkingStateHtml,
  CanvasWorkingStateItems,
  CanvasWorkingStateJobState,
  CanvasWorkingStateJoin,
  CanvasWorkingStateKEEPFILESMAXWaitsConfig,
  CanvasWorkingStateLimit,
  releaseGuardMs,
  CanvasWorkingStateMapValue,
  CanvasWorkingStateOnload,
  CanvasWorkingStatePrint,
  CanvasWorkingStatePxPtPcConfig,
  CanvasWorkingStateRegistry,
  CanvasWorkingStateReplace,
  CanvasWorkingStateResolvedValue,
  CanvasWorkingStateSubscribers,
  CanvasWorkingStateWidth,
  createCanvasWorkingState,
  createDropGhost,
  createEditSessionManager,
  createElementMoveSessions,
  createInlineHistoryBridge,
  createSessionHistory,
  cssVariableName,
  cssVariableValue,
  decodeRasterPreview,
  encodeCanvasPreview,
  encodeImagePreview,
  encodeOffscreenPreview,
  exifImageOrientation,
  getDropGhosts,
  handleInlineUndoKey,
  hasMultipleEditingGroups,
  imageHeaderDimensions,
  imagePreviewDecodeWidth,
  imagePreviewWorker,
  imagePreviewWorkerDeadline,
  imagePreviewWorkerUnavailable,
  isSessionCancelMessage,
  isSvgFile,
  jpegHeaderDimensions,
  keyboardNudgeDelta,
  markDropPerformance,
  notifyDropGhosts,
  nudgeCanvasObjects,
  parseRasterHeaderDimensions,
  pngPhysicalDimensions,
  pointerDelta,
  positionedVideoHtml,
  previewImageFile,
  previewImageInWorker,
  previewSvgFile,
  randomSessionToken,
  rasterImageDimensions,
  reactCanvasWorkingState,
  readHeldSessionState,
  reconcileImageDimensions,
  recordSessionLoadStart,
  reduceSessionCancellation,
  removeDropGhost,
  runNextImagePreviewJob,
  sameSelectedObjectFiles,
  sameSelectionStructure,
  selectionAfterElementEdits,
  selectionNavigationScope,
  sessionAllowsMutation,
  setFilePublishHandler,
  stepInlineHistory,
  stopImagePreviewWorker,
  subscribeDropGhosts,
  subscribeRemoteDocumentUpdates,
  svgAttributeValue,
  svgHeaderDimensions,
  svgLengthToPixels,
  textEditHistoryEpoch,
  updateDropGhostDemand,
  updateTextEditHistoryCounts,
  uploadDesignFile,
  uploadDesignVideo,
  uploadedVideoAnnotation,
  uploadingAnimationDelay,
  useCanvasWorkingState,
  validImageDimensions,
  internalKeyPrefix,
  videoFileTitle,
  writeVersionedProjectFile,
};
export function installCanvasWorkingState(): () => void {
  return () => {
    internalKeyPrefix = "\0";
    CanvasWorkingStateConstant = 2e3;
    announcementCooldownMs = 500;
    CanvasWorkingStateRegistry = {};
    CanvasWorkingStateFloorValue = Math.floor(1572864);
    CanvasWorkingStateLimit = 65535;
    CanvasWorkingStatePxPtPcConfig = {
      "": 1,
      px: 1,
      pt: 96 / 72,
      pc: 16,
      in: 96,
      cm: 96 / 2.54,
      mm: 96 / 25.4,
      q: 96 / 101.6,
    };
    CanvasWorkingStateItems = [];
    CanvasWorkingStateCache = new Map();
    CanvasWorkingStateSubscribers = new Set();
    CanvasWorkingStateMapValue = [];
    dropGhostCounter = 0;
    CanvasWorkingStateHtml = `self.onmessage = async function (e) {
  var d = e.data, bm = null;
  try {
    bm = await createImageBitmap(d.file, d.width > 0 ? { resizeWidth: d.width, resizeQuality: 'medium' } : undefined);
    var k = Math.max(1, Math.ceil(Math.max(bm.width, bm.height) / d.edge));
    var w = Math.max(1, Math.round(bm.width / k)), h = Math.max(1, Math.round(bm.height / k));
    var encode = async function (cw, ch, q) {
      var c = new OffscreenCanvas(cw, ch);
      c.getContext('2d').drawImage(bm, 0, 0, cw, ch);
      var b = await c.convertToBlob({ type: 'image/webp', quality: q });
      return b.type === 'image/webp' ? new FileReaderSync().readAsDataURL(b) : null;
    };
    var url = null;
    for (var q = 0.8; q > 0.25 && url === null; q -= 0.1) {
      var u = await encode(w, h, q);
      if (u === null) { self.postMessage({ unavailable: true }); return; }
      if (u.length <= d.maxChars) url = u;
    }
    if (url === null) { var s = await encode(w >> 1 || 1, h >> 1 || 1, 0.3); if (s !== null && s.length <= d.maxChars) url = s; }
    self.postMessage({ url: url, width: bm.width, height: bm.height });
  } catch (err) {
    self.postMessage({ threw: true });
  } finally {
    if (bm) bm.close();
  }
};`;
    imagePreviewWorker = null;
    imagePreviewWorkerUnavailable = false;
    imagePreviewQueue = [];
    CanvasWorkingStateJobState = null;
    CanvasWorkingStateDelayMs = 12e3;
    maxPreviewEdge = 1600;
    maxPreviewChars = 4e5;
    CanvasWorkingStateOnload = (blob?: Dynamic): Dynamic =>
      new Promise((resolve?: Dynamic, reject?: Dynamic): Dynamic => {
        let reader: Dynamic = new FileReader();
        reader.onload = (): Dynamic => resolve(String(reader.result));
        reader.onerror = (): Dynamic =>
          reject(reader.error ?? new Error("could not read the preview"));
        reader.readAsDataURL(blob);
      });
    resetCanvasFileUploads();
    CanvasWorkingStateResolvedValue = 512 * 1024;
    CanvasWorkingStateWidth = (
      targetWidth?: Dynamic,
      imageSize?: Dynamic,
      fallback?: Dynamic,
      minHeight?: Dynamic,
      maxHeight?: Dynamic,
    ): Dynamic =>
      imageSize && imageSize.width > 0 && imageSize.height > 0
        ? Math.min(
            maxHeight,
            Math.max(
              minHeight,
              Math.round((targetWidth * imageSize.height) / imageSize.width),
            ),
          )
        : fallback;
    CanvasWorkingStateReplace = (message?: Dynamic): Dynamic =>
      message
        .replace(uiMessage("canvas.workingState.soVideosCanTBe"), uiMessage("canvas.workingState.soTheVideoCanT"))
        .replace(uiMessage("canvas.workingState.soItWasnTAdded"), uiMessage("canvas.workingState.soTheVideoWasnT"))
        .replace(uiMessage("canvas.workingState.videosCanBeAdded"), uiMessage("canvas.workingState.videosCanBeUsed"))
        .replace(
          uiMessage("canvas.workingState.noMoreUploadsCanBe"),
          uiMessage("canvas.workingState.noMoreFilesCanBe"),
        )
        .replace(uiMessage("canvas.workingState.canTBeAdded"), uiMessage("canvas.workingState.canTBeUsed"));
    CanvasWorkingStateHandler = (surface?: Dynamic): Dynamic =>
      `A slide deck can't take videos yet. Add the video to another ${surface}.`;
    maxVideosPerDrop = 4;
    CanvasWorkingStateJoin = (file?: Dynamic): Dynamic =>
      [file.name, file.size, file.lastModified].join("|");
    CanvasWorkingStatePrint = (
      current?: Dynamic,
      printKey?: Dynamic,
      next?: Dynamic,
    ): Dynamic =>
      current !== undefined &&
      current.print === printKey &&
      current.src === next.src &&
      current.video === next.video;
    BoxcancelValue = "boxcancel:";
    pressStaleMs = 1e4;
    reactCanvasWorkingState = toModuleNamespace(
      load_react(),
      1,
    );
    keptFilesMax = 24;
    writeSettleMs = 3e3;
    loadLimitMs = 5e3;
    CanvasWorkingStateKEEPFILESMAXWaitsConfig = {
      KEEP_FILES_MAX: keptFilesMax,
      waits: {
        writeSettleMs: writeSettleMs,
        loadLimitMs: loadLimitMs,
      },
    };
    CanvasWorkingStateChangedStaleUnsavedSet = new Set([
      "changed",
      "stale",
      "unsaved",
      "merged",
      "load",
      "cap",
    ]);
    CanvasWorkingStateHas = (reason?: Dynamic): Dynamic =>
      CanvasWorkingStateChangedStaleUnsavedSet.has(reason);
    CanvasWorkingStateContext = (0, reactCanvasWorkingState.createContext)(
      null,
    );
    createWorkingCommitRecord = (
      commit?: Dynamic,
      counts: Dynamic = true,
    ): Dynamic => ({
      commit: commit,
      counts: counts,
      applied: 0,
      redoable: 0,
      redoableBeforePush: 0,
    });
    CanvasWorkingStateAddDeletePageAddConfig = {
      add: false,
      delete: false,
      "page-add": false,
      move: true,
      order: true,
      rename: true,
      print: true,
      paper: true,
      cover: true,
      guides: true,
      radius: true,
      resize: true,
      transform: true,
      tweak: true,
      "page-rename": true,
      "ann-add": true,
      "ann-delete": true,
      "ann-move": true,
      "ann-resize": true,
      "ann-text": true,
      "ann-style": true,
      "ann-box": true,
      "ann-path": true,
      "ann-color": true,
      "ann-css": true,
      "ann-src": true,
      "ann-crop": true,
      "ann-heads": true,
    };
    isTextEditHistoryKind = (action?: Dynamic): Dynamic =>
      CanvasWorkingStateAddDeletePageAddConfig[action];
  };
}
