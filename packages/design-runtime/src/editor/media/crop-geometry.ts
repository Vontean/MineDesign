/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var defaultImageCrop: Dynamic;
var maxCropZoom: Dynamic;
var clamp: Dynamic;
var roundToDecimals: Dynamic;
var overflowEpsilon: Dynamic;
var sameImageCrop: Dynamic;
var cropCoverScale: Dynamic;
var imageCropZoomLimit: Dynamic;
function normalizeImageCrop(rawCrop?: Dynamic): Dynamic {
  if (rawCrop === null || typeof rawCrop != "object") return;
  let source: Dynamic = rawCrop,
    readNumber: Dynamic = (key?: Dynamic): Dynamic =>
      typeof source[key] == "number" && Number.isFinite(source[key])
        ? source[key]
        : null,
    [zoom, x, y]: Dynamic = [
      readNumber("zoom"),
      readNumber("x"),
      readNumber("y"),
    ];
  if (zoom === null || x === null || y === null) return;
  let normalized: Dynamic = {
    zoom: roundToDecimals(
      clamp(zoom, 1, maxCropZoom),
      4,
    ),
    x: roundToDecimals(clamp(x, 0, 1), 5),
    y: roundToDecimals(clamp(y, 0, 1), 5),
  };
  return sameImageCrop(normalized, defaultImageCrop) ? undefined : normalized;
}
function imageCropRect(
  frame?: Dynamic,
  natural?: Dynamic,
  crop?: Dynamic,
): Dynamic {
  let scale: Dynamic = cropCoverScale(frame, natural) * crop.zoom,
    [width, height]: Dynamic = [natural.w * scale, natural.h * scale];
  return {
    x: (frame.w - width) * crop.x + 0,
    y: (frame.h - height) * crop.y + 0,
    w: width,
    h: height,
  };
}
function cropFromImageRect(
  frame?: Dynamic,
  natural?: Dynamic,
  rect?: Dynamic,
  previousCrop?: Dynamic,
  maxZoom: Dynamic = imageCropZoomLimit(previousCrop),
): Dynamic {
  let zoom: Dynamic = clamp(
      rect.w / (natural.w * cropCoverScale(frame, natural)),
      1,
      maxZoom,
    ),
    scale: Dynamic = cropCoverScale(frame, natural) * zoom,
    [overflowX, overflowY]: Dynamic = [
      natural.w * scale - frame.w,
      natural.h * scale - frame.h,
    ];
  return {
    zoom: zoom,
    x:
      overflowX > overflowEpsilon
        ? clamp(-rect.x / overflowX, 0, 1)
        : previousCrop.x,
    y:
      overflowY > overflowEpsilon
        ? clamp(-rect.y / overflowY, 0, 1)
        : previousCrop.y,
  };
}
function translateImageCrop(
  frame?: Dynamic,
  natural?: Dynamic,
  crop?: Dynamic,
  deltaX?: Dynamic,
  deltaY?: Dynamic,
): Dynamic {
  let rect: Dynamic = imageCropRect(frame, natural, crop);
  return cropFromImageRect(
    frame,
    natural,
    {
      ...rect,
      x: rect.x + deltaX,
      y: rect.y + deltaY,
    },
    crop,
  );
}
function resizeImageCropCorner(
  frame?: Dynamic,
  natural?: Dynamic,
  crop?: Dynamic,
  corner?: Dynamic,
  deltaX?: Dynamic,
  deltaY?: Dynamic,
): Dynamic {
  let rect: Dynamic = imageCropRect(frame, natural, crop),
    [signX, signY]: Dynamic = [
      corner === "ne" || corner === "se" ? 1 : -1,
      corner === "sw" || corner === "se" ? 1 : -1,
    ],
    anchor: Dynamic = {
      x: signX > 0 ? rect.x : rect.x + rect.w,
      y: signY > 0 ? rect.y : rect.y + rect.h,
    },
    diagonal: Dynamic = Math.hypot(rect.w, rect.h),
    projectedDelta: Dynamic =
      ((signX * rect.w + deltaX) * signX * rect.w +
        (signY * rect.h + deltaY) * signY * rect.h) /
      diagonal,
    baseWidth: Dynamic = natural.w * cropCoverScale(frame, natural),
    availableWidth: Dynamic = signX > 0 ? frame.w - anchor.x : anchor.x,
    availableHeight: Dynamic = signY > 0 ? frame.h - anchor.y : anchor.y,
    minWidth: Dynamic = Math.max(
      baseWidth,
      availableWidth,
      (availableHeight * rect.w) / rect.h,
    ),
    newWidth: Dynamic = clamp(
      (rect.w * projectedDelta) / diagonal,
      minWidth,
      Math.max(minWidth, baseWidth * imageCropZoomLimit(crop)),
    ),
    newHeight: Dynamic = (newWidth * rect.h) / rect.w;
  return cropFromImageRect(
    frame,
    natural,
    {
      x: signX > 0 ? anchor.x : anchor.x - newWidth,
      y: signY > 0 ? anchor.y : anchor.y - newHeight,
      w: newWidth,
      h: newHeight,
    },
    crop,
  );
}
function resizeImageCropFrame(
  frame?: Dynamic,
  natural?: Dynamic,
  crop?: Dynamic,
  handle?: Dynamic,
  deltaX?: Dynamic,
  deltaY?: Dynamic,
  minSize: Dynamic = 1,
): Dynamic {
  let rect: Dynamic = imageCropRect(frame, natural, crop),
    zoom: Dynamic = Math.max(maxCropZoom, crop.zoom),
    [minWidth, minHeight]: Dynamic = [
      Math.min(frame.w, Math.max(minSize, rect.w / zoom)),
      Math.min(frame.h, Math.max(minSize, rect.h / zoom)),
    ],
    [left, top, right, bottom]: Dynamic = [0, 0, frame.w, frame.h];
  handle.includes("w") &&
    (left = clamp(deltaX, rect.x, right - minWidth));
  handle.includes("e") &&
    (right = clamp(
      frame.w + deltaX,
      left + minWidth,
      rect.x + rect.w,
    ));
  handle.includes("n") &&
    (top = clamp(deltaY, rect.y, bottom - minHeight));
  handle.includes("s") &&
    (bottom = clamp(
      frame.h + deltaY,
      top + minHeight,
      rect.y + rect.h,
    ));
  let newFrame: Dynamic = {
    x: left + 0,
    y: top + 0,
    w: right - left,
    h: bottom - top,
  };
  return {
    frame: newFrame,
    crop: cropIntoFrame(frame, natural, crop, newFrame),
  };
}
function cropIntoFrame(
  oldFrame?: Dynamic,
  natural?: Dynamic,
  crop?: Dynamic,
  newFrame?: Dynamic,
): Dynamic {
  let rect: Dynamic = imageCropRect(oldFrame, natural, crop);
  return cropFromImageRect(
    newFrame,
    natural,
    {
      x: rect.x - newFrame.x,
      y: rect.y - newFrame.y,
      w: rect.w,
      h: rect.h,
    },
    crop,
    Math.max(maxCropZoom, crop.zoom),
  );
}
function rotatedCropFrame(
  frame?: Dynamic,
  angle?: Dynamic,
  box?: Dynamic,
): Dynamic {
  let [offsetX, offsetY]: Dynamic = [
      box.x + box.w / 2 - frame.w / 2,
      box.y + box.h / 2 - frame.h / 2,
    ],
    [cosAngle, sinAngle]: Dynamic = [Math.cos(angle), Math.sin(angle)],
    [centerX, centerY]: Dynamic = [
      frame.x + frame.w / 2 + offsetX * cosAngle - offsetY * sinAngle,
      frame.y + frame.h / 2 + offsetX * sinAngle + offsetY * cosAngle,
    ];
  return {
    x: centerX - box.w / 2,
    y: centerY - box.h / 2,
    w: box.w,
    h: box.h,
  };
}
function zoomImageCrop(
  frame?: Dynamic,
  natural?: Dynamic,
  crop?: Dynamic,
  factor?: Dynamic,
  origin?: Dynamic,
): Dynamic {
  let rect: Dynamic = imageCropRect(frame, natural, crop),
    baseWidth: Dynamic = natural.w * cropCoverScale(frame, natural),
    scale: Dynamic =
      clamp(
        rect.w * factor,
        baseWidth,
        baseWidth * imageCropZoomLimit(crop),
      ) / rect.w,
    [originX, originY]: Dynamic = [
      origin?.x ?? frame.w / 2,
      origin?.y ?? frame.h / 2,
    ];
  return cropFromImageRect(
    frame,
    natural,
    {
      x: originX + (rect.x - originX) * scale,
      y: originY + (rect.y - originY) * scale,
      w: rect.w * scale,
      h: rect.h * scale,
    },
    crop,
  );
}
function normalizeCenteredImageCrop(
  frame?: Dynamic,
  natural?: Dynamic,
  crop?: Dynamic,
): Dynamic {
  let rect: Dynamic = imageCropRect(frame, natural, crop);
  return normalizeImageCrop({
    zoom: crop.zoom,
    x: rect.w - frame.w < 0.5 ? 0.5 : crop.x,
    y: rect.h - frame.h < 0.5 ? 0.5 : crop.y,
  });
}
function imageCropVisibleRect(
  frame?: Dynamic,
  natural?: Dynamic,
  crop?: Dynamic,
): Dynamic {
  let rect: Dynamic = imageCropRect(frame, natural, crop);
  return {
    x: -rect.x / rect.w,
    y: -rect.y / rect.h,
    w: frame.w / rect.w,
    h: frame.h / rect.h,
  };
}
function imageCropCss(crop?: Dynamic): Dynamic {
  let toPercent: Dynamic = (fraction?: Dynamic): Dynamic =>
    String(roundToDecimals(fraction * 100, 4)) + "%";
  return {
    position: "absolute",
    width: toPercent(crop.zoom),
    height: toPercent(crop.zoom),
    left: toPercent(-(crop.zoom - 1) * crop.x),
    top: toPercent(-(crop.zoom - 1) * crop.y),
    maxWidth: "none",
    maxHeight: "none",
    objectFit: "cover",
    objectPosition: toPercent(crop.x) + " " + toPercent(crop.y),
  };
}
function mediaNaturalDimensions(media?: Dynamic): Dynamic {
  let mediaElement: Dynamic = media,
    tagName: Dynamic = mediaElement?.tagName?.toLowerCase(),
    [width, height]: Dynamic =
      tagName === "video"
        ? [mediaElement?.videoWidth ?? 0, mediaElement?.videoHeight ?? 0]
        : tagName === "img"
          ? [mediaElement?.naturalWidth ?? 0, mediaElement?.naturalHeight ?? 0]
          : [0, 0];
  return width > 0 && height > 0
    ? {
        w: width,
        h: height,
      }
    : null;
}
export {
  cropCoverScale,
  cropFromImageRect,
  cropIntoFrame,
  defaultImageCrop,
  imageCropCss,
  imageCropRect,
  imageCropVisibleRect,
  imageCropZoomLimit,
  maxCropZoom as MediaCropGeometryConstant,
  roundToDecimals as MediaCropGeometryHandler,
  overflowEpsilon as MediaCropGeometryLimit,
  clamp as MediaCropGeometryMin,
  mediaNaturalDimensions,
  normalizeCenteredImageCrop,
  normalizeImageCrop,
  resizeImageCropCorner,
  resizeImageCropFrame,
  rotatedCropFrame,
  sameImageCrop,
  translateImageCrop,
  zoomImageCrop,
};
export function installEditorMediaCropGeometry(): () => void {
  return () => {
    defaultImageCrop = {
      zoom: 1,
      x: 0.5,
      y: 0.5,
    };
    maxCropZoom = 50;
    clamp = (
      unclamped?: Dynamic,
      lower?: Dynamic,
      upper?: Dynamic,
    ): Dynamic => Math.min(upper, Math.max(lower, unclamped));
    roundToDecimals = (unrounded?: Dynamic, digits?: Dynamic): Dynamic =>
      Math.round(unrounded * 10 ** digits) / 10 ** digits;
    overflowEpsilon = 1e-6;
    sameImageCrop = (cropA?: Dynamic, cropB?: Dynamic): Dynamic => {
      let [a, b]: Dynamic = [
        cropA ?? defaultImageCrop,
        cropB ?? defaultImageCrop,
      ];
      return (
        a.zoom === b.zoom &&
        a.x === b.x &&
        a.y === b.y
      );
    };
    cropCoverScale = (frame?: Dynamic, natural?: Dynamic): Dynamic =>
      Math.max(frame.w / natural.w, frame.h / natural.h);
    imageCropZoomLimit = (crop?: Dynamic): Dynamic =>
      Math.max(maxCropZoom, crop.zoom);
  };
}
