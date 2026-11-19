/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isEmulator } from "./emulator";
import { awaitHostCapability, hasCapabilityMethod } from "./host-capabilities";
import { downsampleImageBlob, downsampleImageToDataUrl } from "./image-processing";

var blobAssetPathPattern: Dynamic;
var uploadImageMimeTypes: Dynamic;
var maxImageUploadBytes: Dynamic;
var maxDownsampledImageBytes: Dynamic;
var maxImageUploadEdge: Dynamic;
var downsampleUploadImage: Dynamic;
var expectedUploadFailureReasons: Dynamic;
var uploadFailureCodeMap: Dynamic;
async function getAssetsCapability(): Promise<Dynamic> {
  // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
  let designHost: Dynamic = (globalThis as Dynamic).designHost;
  return typeof designHost?.use == "function"
    ? awaitHostCapability(
        "assets",
        hasCapabilityMethod("upload"),
      )
    : typeof designHost?.assets?.upload == "function"
      ? designHost.assets
      : null;
}
function isEmulatorBlobUrl(url?: Dynamic): Dynamic {
  return url.startsWith("blob:") && isEmulator();
}
function isBlobAssetUrl(url?: Dynamic): Dynamic {
  return blobAssetPathPattern.test(url) || isEmulatorBlobUrl(url);
}
function normalizeUploadedAsset(response?: Dynamic): Dynamic {
  if (typeof response != "object" || response === null) return;
  let asset: Dynamic = response,
    id: Dynamic = typeof asset.id == "string" ? asset.id : "",
    url: Dynamic = typeof asset.url == "string" ? asset.url : "",
    src: Dynamic =
      blobAssetPathPattern.test(url) || isEmulatorBlobUrl(url)
        ? url
        : /^[0-9a-f]{32}$/.test(id)
          ? "_blob/" + id
          : "";
  if (src !== "")
    return {
      id: id || src.slice(-32),
      src: src,
      bytes: typeof asset.sizeBytes == "number" ? asset.sizeBytes : 0,
    };
}
async function readImageMaxEdge(image?: Dynamic): Promise<Dynamic> {
  try {
    let bitmap: Dynamic = await createImageBitmap(image),
      maxEdge: Dynamic = Math.max(bitmap.width, bitmap.height);
    bitmap.close();
    return maxEdge;
  } catch {
    return 0;
  }
}
async function prepareImageUpload(image?: Dynamic): Promise<Dynamic> {
  return image.size <= maxDownsampledImageBytes &&
    (await readImageMaxEdge(image)) <= maxImageUploadEdge
    ? image
    : downsampleUploadImage(image);
}
async function uploadImageWithFallback(
  image?: Dynamic,
  uploadOptions: Dynamic = {},
): Promise<Dynamic> {
  let downsampleToDataUrl: Dynamic = uploadOptions.downsample ?? downsampleImageToDataUrl,
    fallbackToDataUrl: Dynamic = async (reason?: Dynamic): Promise<Dynamic> => ({
      kind: "data",
      src: await downsampleToDataUrl(image, {
        maxBytes: uploadOptions.maxDataBytes ?? 70 * 1024,
      }),
      reason: reason,
    }),
    mimeType: Dynamic = image.type,
    canUploadDirectly: Dynamic = uploadImageMimeTypes.includes(mimeType),
    shouldTranscode: Dynamic =
      mimeType === "image/avif" ||
      mimeType === "image/bmp" ||
      mimeType === "image/svg+xml";
  if (!canUploadDirectly && !shouldTranscode) return fallbackToDataUrl("unsupported_type");
  let isGif: Dynamic = mimeType === "image/gif";
  if (isGif && image.size > maxImageUploadBytes)
    return fallbackToDataUrl("too_large");
  let assetsCapability: Dynamic = await getAssetsCapability();
  if (assetsCapability === null || typeof assetsCapability.upload != "function")
    return fallbackToDataUrl("unavailable");
  let preparedImage: Dynamic = image;
  if (!isGif)
    try {
      preparedImage = shouldTranscode
        ? await (uploadOptions.transcode ?? downsampleUploadImage)(image)
        : await (uploadOptions.downsize ?? prepareImageUpload)(image);
    } catch {
      return fallbackToDataUrl("downsize_failed");
    }
  try {
    let uploadedAsset: Dynamic = normalizeUploadedAsset(
      await assetsCapability.upload.call(assetsCapability, preparedImage, {
        type: preparedImage.type || mimeType,
      }),
    );
    return uploadedAsset === undefined
      ? fallbackToDataUrl("bad_result")
      : {
          kind: "blob",
          ...uploadedAsset,
        };
  } catch (error: Dynamic) {
    let errorCode: Dynamic =
      typeof error == "object" && error !== null
        ? String(error.code ?? "")
        : "";
    return fallbackToDataUrl(errorCode || "upload_failed");
  }
}
function classifyUploadResult(source?: Dynamic): Dynamic {
  return source.kind === "blob"
    ? ["upload", "success"]
    : expectedUploadFailureReasons.has(source.reason)
      ? null
      : [
          "upload",
          "failure",
          (Object.hasOwn(uploadFailureCodeMap, source.reason)
            ? uploadFailureCodeMap[source.reason]
            : undefined) ?? "capability_error",
        ];
}
export {
  blobAssetPathPattern,
  classifyUploadResult,
  downsampleUploadImage,
  expectedUploadFailureReasons,
  getAssetsCapability,
  isBlobAssetUrl,
  isEmulatorBlobUrl,
  maxDownsampledImageBytes,
  maxImageUploadBytes,
  maxImageUploadEdge,
  normalizeUploadedAsset,
  prepareImageUpload,
  readImageMaxEdge,
  uploadFailureCodeMap,
  uploadImageMimeTypes,
  uploadImageWithFallback,
};
export function installPlatformImageUpload(): () => void {
  return () => {
    blobAssetPathPattern = /^\/?_blob\/[0-9a-f]{32}$/;
    uploadImageMimeTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/svg+xml",
    ];
    maxImageUploadBytes = 2 * 1024 * 1024;
    maxDownsampledImageBytes = 1.5 * 1024 * 1024;
    maxImageUploadEdge = 2560;
    downsampleUploadImage = (image?: Dynamic): Dynamic =>
      downsampleImageBlob(image, {
        maxEdge: maxImageUploadEdge,
        maxBytes: maxDownsampledImageBytes,
      });
    expectedUploadFailureReasons = new Set([
      "unavailable",
      "unsupported_type",
      "old_quicktime",
      "unplayable",
      "too_large",
      "not_granted",
      "capability_disabled",
      "capability_removed",
    ]);
    uploadFailureCodeMap = {
      downsize_failed: "invalid_content",
      bad_result: "capability_error",
      upload_failed: "unknown",
      probe_timeout: "transient",
      invalid_request: "internal",
      quota_or_state: "too_large",
      rate_limited: "backpressure",
      store_unavailable: "transient",
      upstream_auth: "capability_error",
      upstream_error: "capability_error",
      transform_error: "capability_error",
    };
  };
}
