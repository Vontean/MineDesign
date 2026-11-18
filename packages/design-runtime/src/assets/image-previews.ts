/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isBlobAssetUrl } from "../platform/image-upload";

var imagePreviewMaxBytes: Dynamic;
var imageMimeByExtension: Dynamic;
var imagePreviewCache: Dynamic;
var inlineImagePreview: Dynamic;
function resolveImagePreviewUrl(source?: Dynamic, files?: Dynamic): Dynamic {
  let inlineUrl: Dynamic = inlineImagePreview(source);
  if (inlineUrl !== null) return inlineUrl;
  if (!source.startsWith("./")) return null;
  let relativePath: Dynamic = source.slice(2),
    base64Data: Dynamic = files[relativePath];
  if (typeof base64Data != "string" || base64Data.length > imagePreviewMaxBytes)
    return null;
  let cachedPreview: Dynamic = imagePreviewCache.get(relativePath);
  if (cachedPreview !== undefined && cachedPreview.b64 === base64Data) return cachedPreview.url;
  let mimeType: Dynamic = imageMimeByExtension.get(
    relativePath.slice(relativePath.lastIndexOf(".") + 1).toLowerCase(),
  );
  if (mimeType === undefined) return null;
  let dataUrl: Dynamic = "data:" + mimeType + ";base64," + base64Data;
  imagePreviewCache.set(relativePath, {
    b64: base64Data,
    url: dataUrl,
  });
  imagePreviewCache.size > 64 &&
    imagePreviewCache.delete(imagePreviewCache.keys().next().value);
  return dataUrl;
}
export {
  imageMimeByExtension,
  imagePreviewCache,
  imagePreviewMaxBytes,
  inlineImagePreview,
  resolveImagePreviewUrl,
};
export function installAssetsImagePreviews(): () => void {
  return () => {
    imagePreviewMaxBytes = 256 * 1024;
    imageMimeByExtension = new Map([
      ["png", "image/png"],
      ["jpg", "image/jpeg"],
      ["jpeg", "image/jpeg"],
      ["gif", "image/gif"],
      ["webp", "image/webp"],
      ["svg", "image/svg+xml"],
      ["avif", "image/avif"],
    ]);
    imagePreviewCache = new Map();
    inlineImagePreview = (assetUrl?: Dynamic): Dynamic =>
      isBlobAssetUrl(assetUrl)
        ? assetUrl.startsWith("_blob/")
          ? "/" + assetUrl
          : assetUrl
        : null;
  };
}
