/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var DATA_URL_ENCODING_QUALITIES: Dynamic;
var IMAGE_RESIZE_STEP: Dynamic;
var MIN_DOWNSAMPLE_EDGE: Dynamic;
var BLOB_ENCODING_QUALITIES: Dynamic;
function isSvgMimeType(mimeType?: Dynamic): Dynamic {
  return (mimeType.split(";")[0] ?? "").trim().toLowerCase() === "image/svg+xml";
}
async function rasterizeSvg(
  blob?: Dynamic,
  maxEdge?: Dynamic,
): Promise<Dynamic> {
  let objectUrl: Dynamic = URL.createObjectURL(blob);
  try {
    let image: Dynamic = new Image();
    await new Promise((resolve?: Dynamic, reject?: Dynamic): Dynamic => {
      let decodeTimeout: Dynamic = setTimeout(
        (): Dynamic => reject(new Error("timed out reading the SVG")),
        2e4,
      );
      image.onload = (): Dynamic => {
        clearTimeout(decodeTimeout);
        resolve();
      };
      image.onerror = (): Dynamic => {
        clearTimeout(decodeTimeout);
        reject(new Error("the SVG could not be decoded as an image"));
      };
      image.src = objectUrl;
    });
    let hasIntrinsicSize: Dynamic = image.naturalWidth > 0 && image.naturalHeight > 0,
      naturalWidth: Dynamic = hasIntrinsicSize ? image.naturalWidth : maxEdge,
      naturalHeight: Dynamic = hasIntrinsicSize ? image.naturalHeight : maxEdge,
      scale: Dynamic = maxEdge / Math.max(naturalWidth, naturalHeight),
      width: Dynamic = Math.max(1, Math.round(naturalWidth * scale)),
      height: Dynamic = Math.max(1, Math.round(naturalHeight * scale)),
      canvas: Dynamic = (document as Dynamic).createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    let drawingContext: Dynamic = canvas.getContext("2d");
    if (drawingContext === null) throw new Error("no 2d canvas in this host");
    drawingContext.drawImage(image, 0, 0, width, height);
    try {
      drawingContext.getImageData(0, 0, 1, 1);
    } catch {
      throw new Error(
        "this SVG uses features that can't be imported (embedded web content)",
      );
    }
    return createImageBitmap(canvas);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
async function decodeImageBlob(
  blob?: Dynamic,
  maxEdge?: Dynamic,
): Promise<Dynamic> {
  return isSvgMimeType(blob.type)
    ? rasterizeSvg(blob, maxEdge)
    : createImageBitmap(blob);
}
function encodeDownsampledImage(
  image?: Dynamic,
  maxEdge?: Dynamic,
  quality?: Dynamic,
  mimeType?: Dynamic,
): Dynamic {
  let scale: Dynamic = Math.min(
      1,
      maxEdge / Math.max(image.width, image.height),
    ),
    width: Dynamic = Math.max(1, Math.round(image.width * scale)),
    height: Dynamic = Math.max(1, Math.round(image.height * scale)),
    canvas: Dynamic = (document as Dynamic).createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let drawingContext: Dynamic = canvas.getContext("2d");
  if (!drawingContext) return;
  drawingContext.drawImage(image, 0, 0, width, height);
  let dataUrl: Dynamic = canvas.toDataURL(mimeType, quality);
  return dataUrl.startsWith("data:" + mimeType) ? dataUrl : undefined;
}
async function downsampleImageToDataUrl(
  blob?: Dynamic,
  resizeOptions: Dynamic = {},
): Promise<Dynamic> {
  let maxBytes: Dynamic = resizeOptions.maxBytes ?? 71680,
    maxEdge: Dynamic = resizeOptions.maxEdge ?? 1280,
    image: Dynamic = await decodeImageBlob(
      blob,
      Math.max(MIN_DOWNSAMPLE_EDGE, maxEdge),
    );
  try {
    let edge: Dynamic = Math.max(
        MIN_DOWNSAMPLE_EDGE,
        Math.min(maxEdge, Math.max(image.width, image.height)),
      ),
      smallestDataUrl: Dynamic;
    for (; edge >= MIN_DOWNSAMPLE_EDGE; ) {
      for (let quality of DATA_URL_ENCODING_QUALITIES as Dynamic) {
        let dataUrl: Dynamic =
          encodeDownsampledImage(image, edge, quality, "image/webp") ??
          encodeDownsampledImage(image, edge, quality, "image/jpeg");
        if (dataUrl && dataUrl.length <= maxBytes) return dataUrl;
        dataUrl &&
          (!smallestDataUrl || dataUrl.length < smallestDataUrl.length) &&
          (smallestDataUrl = dataUrl);
      }
      edge = Math.floor(edge * IMAGE_RESIZE_STEP);
    }
    throw new Error(
      "could not fit the image into " +
        String(maxBytes) +
        " bytes" +
        (smallestDataUrl ? " (smallest attempt: " + String(smallestDataUrl.length) + ")" : ""),
    );
  } finally {
    image.close();
  }
}
async function encodeDownsampledBlob(
  image?: Dynamic,
  maxEdge?: Dynamic,
  quality?: Dynamic,
  mimeType?: Dynamic,
): Promise<Dynamic> {
  let scale: Dynamic = Math.min(
      1,
      maxEdge / Math.max(image.width, image.height),
    ),
    width: Dynamic = Math.max(1, Math.round(image.width * scale)),
    height: Dynamic = Math.max(1, Math.round(image.height * scale)),
    canvas: Dynamic = (document as Dynamic).createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  let drawingContext: Dynamic = canvas.getContext("2d");
  if (!drawingContext) return;
  drawingContext.drawImage(image, 0, 0, width, height);
  let encodedBlob: Dynamic = await new Promise(
    (resolve?: Dynamic): Dynamic => canvas.toBlob(resolve, mimeType, quality),
  );
  return encodedBlob !== null && encodedBlob.type === mimeType ? encodedBlob : undefined;
}
async function downsampleImageBlob(
  blob?: Dynamic,
  resizeOptions: Dynamic = {},
): Promise<Dynamic> {
  let maxEdge: Dynamic = resizeOptions.maxEdge ?? 2560,
    maxBytes: Dynamic = resizeOptions.maxBytes ?? 1.5 * 1024 * 1024,
    image: Dynamic = await decodeImageBlob(blob, maxEdge);
  try {
    let edge: Dynamic = Math.max(
      MIN_DOWNSAMPLE_EDGE,
      Math.min(maxEdge, Math.max(image.width, image.height)),
    );
    for (; edge >= MIN_DOWNSAMPLE_EDGE; ) {
      for (let quality of BLOB_ENCODING_QUALITIES as Dynamic) {
        let encodedBlob: Dynamic =
          (await encodeDownsampledBlob(
            image,
            edge,
            quality,
            "image/webp",
          )) ??
          (await encodeDownsampledBlob(image, edge, quality, "image/jpeg"));
        if (encodedBlob && encodedBlob.size <= maxBytes) return encodedBlob;
      }
      edge = Math.floor(edge * IMAGE_RESIZE_STEP);
    }
    throw new Error(
      "could not fit the image into " + String(maxBytes) + " bytes",
    );
  } finally {
    image.close();
  }
}
function isImageFile(file?: Dynamic): Dynamic {
  return file.type.startsWith("image/");
}
export {
  decodeImageBlob,
  downsampleImageBlob,
  downsampleImageToDataUrl,
  encodeDownsampledBlob,
  encodeDownsampledImage,
  isImageFile,
  isSvgMimeType,
  IMAGE_RESIZE_STEP as PlatformImageProcessingConstant,
  DATA_URL_ENCODING_QUALITIES as PlatformImageProcessingItems,
  BLOB_ENCODING_QUALITIES as PlatformImageProcessingItems_2,
  MIN_DOWNSAMPLE_EDGE as PlatformImageProcessingLimit,
  rasterizeSvg,
};
export function installPlatformImageProcessing(): () => void {
  return () => {
    DATA_URL_ENCODING_QUALITIES = [0.8, 0.65, 0.5, 0.35, 0.25];
    IMAGE_RESIZE_STEP = 0.7;
    MIN_DOWNSAMPLE_EDGE = 64;
    BLOB_ENCODING_QUALITIES = [0.85, 0.75, 0.65, 0.5];
  };
}
