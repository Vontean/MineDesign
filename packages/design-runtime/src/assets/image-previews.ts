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
  let value: Dynamic = inlineImagePreview(source);
  if (value !== null) return value;
  if (!source.startsWith("./")) return null;
  let value2: Dynamic = source.slice(2),
    value3: Dynamic = files[value2];
  if (typeof value3 != "string" || value3.length > imagePreviewMaxBytes)
    return null;
  let entry: Dynamic = imagePreviewCache.get(value2);
  if (entry !== undefined && entry.b64 === value3) return entry.url;
  let entry2: Dynamic = imageMimeByExtension.get(
    value2.slice(value2.lastIndexOf(".") + 1).toLowerCase(),
  );
  if (entry2 === undefined) return null;
  let value4: Dynamic = "data:" + entry2 + ";base64," + value3;
  imagePreviewCache.set(value2, {
    b64: value3,
    url: value4,
  });
  imagePreviewCache.size > 64 &&
    imagePreviewCache.delete(imagePreviewCache.keys().next().value);
  return value4;
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
    inlineImagePreview = (input?: Dynamic): Dynamic =>
      isBlobAssetUrl(input)
        ? input.startsWith("_blob/")
          ? "/" + input
          : input
        : null;
  };
}
