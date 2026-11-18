import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { ClipboardHtmlSanitizationScriptDataDcScriptPattern } from "../editor/clipboard/html-sanitization";
import { escapeHtmlAttributeValue } from "../editor/html/escaping";
import { truncateUtf16Safely } from "../platform/comments";
import { PlatformFileContentSlice } from "../platform/file-content";

var pasteCascadePixels: Dynamic;
var maxPlacedImageWidth: Dynamic;
var hasMalformedUnicode: Dynamic;
function pastedObjectsOrigin(objects?: Dynamic, point?: Dynamic): Dynamic {
  let groupWidth: Dynamic = Math.max(
      0,
      ...objects.map((pastedObject?: Dynamic): Dynamic => pastedObject.dx + pastedObject.w),
    ),
    groupHeight: Dynamic = Math.max(
      0,
      ...objects.map((pastedObject?: Dynamic): Dynamic => pastedObject.dy + pastedObject.h),
    );
  return {
    x: point.x - groupWidth / 2,
    y: point.y - groupHeight / 2,
  };
}
function pointerCoordinates(pointer?: Dynamic): Dynamic {
  return pointer
    ? {
        x: pointer.x,
        y: pointer.y,
      }
    : null;
}
function resolveInsertionPointer(
  pointer?: Dynamic,
  cachedPointer?: Dynamic,
  file?: Dynamic,
  allowCanvas?: Dynamic,
): Dynamic {
  return !pointer ||
    pointer.stale ||
    file == null ||
    !(pointer.inFrame ? pointer.frameFile === file : allowCanvas)
    ? null
    : cachedPointer?.file === file
      ? cachedPointer
      : pointer;
}
function insertionPointerMatchesContent(
  kind?: Dynamic,
  file?: Dynamic,
  currentFile?: Dynamic,
  enteredFile?: Dynamic,
): Dynamic {
  return kind === "content" && (file === currentFile || file === enteredFile);
}
function clampPointToRect(point?: Dynamic, box?: Dynamic): Dynamic {
  return {
    x: Math.min(box.x + box.w, Math.max(box.x, point.x)),
    y: Math.min(box.y + box.h, Math.max(box.y, point.y)),
  };
}
function pasteCascadeStep(scale?: Dynamic): Dynamic {
  return scale > 0 && Number.isFinite(scale)
    ? Math.max(pasteCascadePixels, Math.round(pasteCascadePixels / scale))
    : pasteCascadePixels;
}
function avoidPastedObjectCollisions(
  origin?: Dynamic,
  objects?: Dynamic,
  existingPositions?: Dynamic,
  step: Dynamic = pasteCascadePixels,
): Dynamic {
  let minGap: Dynamic = step / 2,
    collidesAt: Dynamic = (candidate?: Dynamic): Dynamic =>
      objects.some(
        (pastedObject?: Dynamic): Dynamic =>
          existingPositions.some(
            (existingPosition?: Dynamic): Dynamic =>
              Math.abs(existingPosition.x - (candidate.x + pastedObject.dx)) < minGap &&
              Math.abs(existingPosition.y - (candidate.y + pastedObject.dy)) < minGap,
          ),
      ),
    position: Dynamic = origin;
  for (let index: Dynamic = 0; index < 40 && collidesAt(position); index++)
    position = {
      x: position.x + step,
      y: position.y + step,
    };
  return position;
}
function pastedObjectsBounds(objects?: Dynamic): Dynamic {
  let [minX, minY]: Dynamic = [
    Math.min(...objects.map((pastedObject?: Dynamic): Dynamic => pastedObject.x)),
    Math.min(...objects.map((pastedObject?: Dynamic): Dynamic => pastedObject.y)),
  ];
  return {
    x: minX,
    y: minY,
    w:
      Math.max(
        ...objects.map((pastedObject?: Dynamic): Dynamic => pastedObject.x + pastedObject.w),
      ) - minX,
    h:
      Math.max(
        ...objects.map((pastedObject?: Dynamic): Dynamic => pastedObject.y + pastedObject.h),
      ) - minY,
  };
}
function insertBlankArtboardMarkup(
  source?: Dynamic,
  markup?: Dynamic,
): Dynamic {
  let stageIndex: Dynamic = source.indexOf("></section>");
  if (stageIndex < 0) throw new Error("blank artboard source has no empty stage");
  return (
    source.slice(0, stageIndex + 1) +
    `
` +
    markup +
    `
` +
    source.slice(stageIndex + 1)
  );
}
function visibleArtboardCenter(
  artboard?: Dynamic,
  camera?: Dynamic,
): Dynamic {
  if (camera) {
    let overlapLeft: Dynamic = Math.max(artboard.x, camera.x),
      overlapRight: Dynamic = Math.min(
        artboard.x + artboard.w,
        camera.x + camera.width / camera.scale,
      ),
      overlapTop: Dynamic = Math.max(artboard.y, camera.y),
      overlapBottom: Dynamic = Math.min(
        artboard.y + artboard.h,
        camera.y + camera.height / camera.scale,
      );
    if (overlapRight > overlapLeft && overlapBottom > overlapTop)
      return {
        x: (overlapLeft + overlapRight) / 2,
        y: (overlapTop + overlapBottom) / 2,
      };
  }
  return {
    x: artboard.x + artboard.w / 2,
    y: artboard.y + artboard.h / 2,
  };
}
function defaultPlacedImageSize(
  naturalSize?: Dynamic,
  pixelDensity?: Dynamic,
): Dynamic {
  let imageSize: Dynamic =
      naturalSize && naturalSize.width > 0 && naturalSize.height > 0
        ? naturalSize
        : {
            width: 320,
            height: 240,
          },
    densityScale: Dynamic =
      pixelDensity != null && pixelDensity >= 5600
        ? Math.min(3, Math.round(pixelDensity / 2835))
        : 1,
    placedWidth: Dynamic = Math.max(
      48,
      Math.min(maxPlacedImageWidth, Math.round(imageSize.width / densityScale)),
    );
  return {
    w: placedWidth,
    h: Math.max(48, Math.ceil((placedWidth * imageSize.height) / imageSize.width)),
  };
}
function droppedImagePlacement(
  point?: Dynamic,
  artboard?: Dynamic,
  naturalSize?: Dynamic,
  index?: Dynamic,
): Dynamic {
  let placedWidth: Dynamic = Math.round(
      Math.min(naturalSize.width, Math.max(48, artboard.w * 0.6)),
    ),
    placedHeight: Dynamic = Math.round(
      (placedWidth * naturalSize.height) / naturalSize.width,
    );
  return {
    x:
      Math.max(
        0,
        Math.min(
          Math.round(point.x - artboard.x - placedWidth / 2),
          artboard.w - placedWidth,
        ),
      ) +
      index * 24,
    y:
      Math.max(
        0,
        Math.min(
          Math.round(point.y - artboard.y - placedHeight / 2),
          artboard.h - placedHeight,
        ),
      ) +
      index * 24,
    w: placedWidth,
    h: placedHeight,
  };
}
function safeDroppedImageAltText(
  name?: Dynamic,
  fallback?: Dynamic,
): Dynamic {
  let altText: Dynamic = PlatformFileContentSlice(name);
  return altText === undefined ||
    /[{}<]/.test(altText) ||
    hasMalformedUnicode(altText) ||
    ClipboardHtmlSanitizationScriptDataDcScriptPattern.test(altText)
    ? fallback
    : altText;
}
function droppedImageMarkup(image?: Dynamic): Dynamic {
  let styleText: Dynamic = `position: absolute; left: ${String(image.left)}px; top: ${String(image.top)}px; width: ${String(image.w)}px; height: auto`;
  return `<img src="${escapeHtmlAttributeValue(image.src)}" alt="${escapeHtmlAttributeValue(image.alt)}" data-dc-drop="${image.mark}" width="${String(image.natural.width)}" height="${String(image.natural.height)}" style="${styleText}">`;
}
function droppedImageLabel(file?: Dynamic, origin?: Dynamic): Dynamic {
  let baseName: Dynamic = file.name.replace(/\.[^.]*$/, "").trim();
  return baseName && baseName.toLowerCase() !== "image"
    ? truncateUtf16Safely(baseName, 60)
    : origin === "pasted"
      ? uiMessage("canvas.pastePlacement.pastedImage")
      : uiMessage("canvas.pastePlacement.droppedImage");
}
export {
  avoidPastedObjectCollisions,
  clampPointToRect,
  defaultPlacedImageSize,
  droppedImageLabel,
  droppedImageMarkup,
  droppedImagePlacement,
  hasMalformedUnicode,
  insertBlankArtboardMarkup,
  insertionPointerMatchesContent,
  maxPlacedImageWidth,
  pasteCascadePixels,
  pasteCascadeStep,
  pastedObjectsBounds,
  pastedObjectsOrigin,
  pointerCoordinates,
  resolveInsertionPointer,
  safeDroppedImageAltText,
  visibleArtboardCenter,
};
export function installCanvasPastePlacement(): () => void {
  return () => {
    pasteCascadePixels = 24;
    maxPlacedImageWidth = 1200;
    hasMalformedUnicode = (text?: Dynamic): Dynamic =>
      /\p{Cs}/u.test(text) ||
      [...text].some(
        (character?: Dynamic): Dynamic => character.codePointAt(0) === 65533,
      );
  };
}
