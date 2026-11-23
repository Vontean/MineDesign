/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactCanvasPreviewMounting: Dynamic;
var currentPreviewDistanceWeight: Dynamic;
var viewportSlackRatio: Dynamic;
function getDevicePreviewCapabilities(): Dynamic {
  if (typeof window === "undefined")
    return {
      coarsePointer: false,
      shortSide: 1 / 0,
      ios: false,
    };
  let hasCoarsePointer: Dynamic =
      (window as Dynamic).matchMedia?.("(pointer: coarse)")?.matches === true,
    screen: Dynamic = (window as Dynamic).screen,
    shortSide: Dynamic =
      screen && screen.width > 0 && screen.height > 0
        ? Math.min(screen.width, screen.height)
        : 1 / 0,
    navigatorInfo: Dynamic = typeof navigator !== "undefined" ? navigator : null,
    isIos: Dynamic =
      navigatorInfo != null &&
      (/iPad|iPhone|iPod/.test(navigatorInfo.userAgent) ||
        (navigatorInfo.platform === "MacIntel" && (navigatorInfo.maxTouchPoints ?? 0) > 1));
  return {
    coarsePointer: hasCoarsePointer,
    shortSide: shortSide,
    ios: isIos,
  };
}
function isSmallTouchDevice(
  capabilities: Dynamic = getDevicePreviewCapabilities(),
): Dynamic {
  return capabilities.coarsePointer && capabilities.shortSide < 768;
}
function maxInteractivePreviews(
  capabilities: Dynamic = getDevicePreviewCapabilities(),
): Dynamic {
  return capabilities.coarsePointer ? (isSmallTouchDevice(capabilities) ? 3 : 6) : 10;
}
function maxMountedPreviews(
  capabilities: Dynamic = getDevicePreviewCapabilities(),
): Dynamic {
  return capabilities.coarsePointer || capabilities.ios === true
    ? maxInteractivePreviews(capabilities)
    : 40;
}
function distanceBetweenRects(rectA?: Dynamic, rectB?: Dynamic): Dynamic {
  let gapX: Dynamic = Math.max(
      0,
      rectA.x - (rectB.x + rectB.w),
      rectB.x - (rectA.x + rectA.w),
    ),
    gapY: Dynamic = Math.max(
      0,
      rectA.y - (rectB.y + rectB.h),
      rectB.y - (rectA.y + rectA.h),
    );
  return Math.hypot(gapX, gapY);
}
function distanceBetweenRectCenters(
  rectA?: Dynamic,
  rectB?: Dynamic,
): Dynamic {
  return Math.hypot(
    rectA.x + rectA.w / 2 - (rectB.x + rectB.w / 2),
    rectA.y + rectA.h / 2 - (rectB.y + rectB.h / 2),
  );
}
function chooseMountedPreviews(params?: Dynamic): Dynamic {
  let baseCap: Dynamic = Math.max(0, Math.floor(params.cap ?? 10)),
    hardCeiling: Dynamic = Math.max(
      baseCap,
      Math.floor(params.ceiling ?? baseCap) || 0,
    ),
    canExceedCap: Dynamic = hardCeiling > baseCap,
    viewport: Dynamic = params.viewport,
    artboardsByFile: Dynamic = new Map();
  for (let artboard of params.artboards as Dynamic)
    artboardsByFile.set(artboard.file, artboard);
  let chosenFiles: Dynamic = new Set(),
    areaBudget: Dynamic = params.areaBudget;
  if (artboardsByFile.size <= baseCap && areaBudget == null) {
    for (let file of artboardsByFile.keys() as Dynamic) chosenFiles.add(file);
    return chosenFiles;
  }
  let requiredFiles: Dynamic = new Set();
  for (let file of (params.required ?? []) as Dynamic)
    file != null && artboardsByFile.has(file) && requiredFiles.add(file);
  for (let artboard of params.artboards as Dynamic)
    distanceBetweenRects(artboard, viewport) === 0 && requiredFiles.add(artboard.file);
  let targetCount: Dynamic = Math.min(hardCeiling, Math.max(baseCap, requiredFiles.size)),
    now: Dynamic = params.now ?? 0,
    isRecentlyOnScreen: Dynamic = (file?: Dynamic): Dynamic =>
      params.current?.has(file) === true &&
      (params.lastOnScreen == null ||
        now - (params.lastOnScreen.get(file) ?? -1 / 0) < 18e4),
    usedArea: Dynamic = 0,
    addIfFits: Dynamic = (
      file?: Dynamic,
      isRequired: Dynamic = false,
    ): Dynamic => {
      let artboard: Dynamic = file == null ? undefined : artboardsByFile.get(file);
      file == null ||
        artboard === undefined ||
        chosenFiles.has(file) ||
        (!isRequired &&
          areaBudget != null &&
          usedArea + artboard.w * artboard.h > areaBudget) ||
        ((chosenFiles.size < targetCount ||
          (chosenFiles.size < hardCeiling && isRecentlyOnScreen(file))) &&
          (chosenFiles.add(file), (usedArea += artboard.w * artboard.h)));
    };
  for (let file of (params.required ?? []) as Dynamic)
    addIfFits(file, true);
  for (let file of (params.recent ?? []) as Dynamic) {
    let entry: Dynamic = artboardsByFile.get(file);
    entry && distanceBetweenRects(entry, viewport) === 0 && addIfFits(file);
  }
  let nearThreshold: Dynamic =
      viewportSlackRatio * Math.min(viewport.w, viewport.h),
    discountDistance: Dynamic = (distance?: Dynamic): Dynamic =>
      canExceedCap
        ? params.zoomed === true
          ? distance
          : Math.max(0, distance - nearThreshold)
        : distance * currentPreviewDistanceWeight,
    candidates: Dynamic = params.artboards
      .filter((artboard?: Dynamic): Dynamic => !chosenFiles.has(artboard.file))
      .map((artboard?: Dynamic): Dynamic => {
        let gap: Dynamic = distanceBetweenRects(artboard, viewport),
          isCurrentAndVisible: Dynamic =
            gap === 0 && params.current?.has(artboard.file) === true;
        return {
          file: artboard.file,
          gap: gap,
          centre: isCurrentAndVisible
            ? discountDistance(distanceBetweenRectCenters(artboard, viewport))
            : distanceBetweenRectCenters(artboard, viewport),
        };
      })
      .sort(
        (first?: Dynamic, second?: Dynamic): Dynamic =>
          first.gap - second.gap || first.centre - second.centre,
      );
  for (let candidate of candidates as Dynamic)
    (areaBudget == null ||
      candidate.gap === 0 ||
      (candidate.gap <= nearThreshold && params.current?.has(candidate.file) === true)) &&
      addIfFits(candidate.file);
  return chosenFiles;
}
function shouldDelayPreviewMount(
  artboard?: Dynamic,
  state?: Dynamic,
): Dynamic {
  return !state.editing || state.runsNothing || artboard.w * artboard.h > 15e5;
}
function limitMountedPreviewPixels(
  currentFiles?: Dynamic,
  candidateFiles?: Dynamic,
  artboards?: Dynamic,
  pixelBudget?: Dynamic,
): Dynamic {
  let pixelsOf: Dynamic = (file?: Dynamic): Dynamic => {
      let artboard: Dynamic = artboards.find(
        (candidate?: Dynamic): Dynamic => candidate.file === file,
      );
      return artboard && artboard.w * artboard.h;
    },
    keptFiles: Dynamic = currentFiles.filter(
      (file?: Dynamic): Dynamic => pixelsOf(file) !== undefined,
    ),
    usedPixels: Dynamic = keptFiles.reduce(
      (total?: Dynamic, file?: Dynamic): Dynamic =>
        total + pixelsOf(file),
      0,
    );
  for (let candidateFile of candidateFiles as Dynamic) {
    let candidatePixels: Dynamic =
      candidateFile == null || keptFiles.includes(candidateFile)
        ? undefined
        : pixelsOf(candidateFile);
    candidatePixels === undefined ||
      usedPixels + candidatePixels > pixelBudget ||
      (keptFiles.push(candidateFile), (usedPixels += candidatePixels));
  }
  return keptFiles;
}
function isPreviewHighlighted(
  file?: Dynamic,
  hoveredFile?: Dynamic,
  highlightedFiles?: Dynamic,
): Dynamic {
  return file === hoveredFile || (highlightedFiles?.has(file) ?? false);
}
function previewScaleChanged(previousScale?: Dynamic, nextScale?: Dynamic): Dynamic {
  return previousScale != null && Math.abs(nextScale / previousScale - 1) > 0.05;
}
function recordVisiblePreviewTimes(
  timesByFile?: Dynamic,
  artboards?: Dynamic,
  viewport?: Dynamic,
  extraViewport?: Dynamic,
  now?: Dynamic,
): Dynamic {
  for (let artboard of artboards as Dynamic)
    (distanceBetweenRects(artboard, viewport) === 0 ||
      (extraViewport != null && distanceBetweenRects(artboard, extraViewport) === 0)) &&
      timesByFile.set(artboard.file, now);
}
function nextPreviewExpiry(
  mountedFiles?: Dynamic,
  artboards?: Dynamic,
  viewport?: Dynamic,
  lastOnScreen?: Dynamic,
  now?: Dynamic,
): Dynamic {
  let earliestExpiry: Dynamic = null;
  for (let artboard of artboards as Dynamic) {
    let entry: Dynamic = lastOnScreen.get(artboard.file);
    !mountedFiles.has(artboard.file) ||
      entry == null ||
      entry + 18e4 <= now ||
      distanceBetweenRects(artboard, viewport) === 0 ||
      ((earliestExpiry == null || entry + 18e4 < earliestExpiry) && (earliestExpiry = entry + 18e4));
  }
  return earliestExpiry;
}
function previewMountPriority(artboard?: Dynamic, viewport?: Dynamic): Dynamic {
  let gap: Dynamic = distanceBetweenRects(artboard, viewport);
  return gap === 0
    ? distanceBetweenRectCenters(artboard, viewport)
    : 1e9 + gap;
}
function samePreviewFiles(filesA?: Dynamic, filesB?: Dynamic): Dynamic {
  if (filesA.size !== filesB.size) return false;
  for (let file of filesA as Dynamic) if (!filesB.has(file)) return false;
  return true;
}
export {
  currentPreviewDistanceWeight as CanvasPreviewMountingConstant,
  chooseMountedPreviews,
  distanceBetweenRectCenters,
  distanceBetweenRects,
  getDevicePreviewCapabilities,
  isPreviewHighlighted,
  isSmallTouchDevice,
  limitMountedPreviewPixels,
  maxInteractivePreviews,
  maxMountedPreviews,
  nextPreviewExpiry,
  previewMountPriority,
  previewScaleChanged,
  reactCanvasPreviewMounting,
  recordVisiblePreviewTimes,
  samePreviewFiles,
  shouldDelayPreviewMount,
};
export function installCanvasPreviewMounting(): () => void {
  return () => {
    reactCanvasPreviewMounting = toModuleNamespace(
      load_react(),
      1,
    );
    currentPreviewDistanceWeight = 0.7;
    viewportSlackRatio = 0.15;
  };
}
