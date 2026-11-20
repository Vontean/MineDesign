/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isBlobAssetUrl } from "./image-upload";

var blobFetchPromises: Dynamic;
var blobObjectUrls: Dynamic;
var blobCacheSizes: Dynamic;
var blobCacheBytes: Dynamic;
var maxBlobCacheBytes: Dynamic;
var blobFetchFailures: Dynamic;
var blobFailureCooldownMs: Dynamic;
function recordBlobCacheSize(assetUrl?: Dynamic, byteSize?: Dynamic): Dynamic {
  blobCacheSizes.set(assetUrl, byteSize);
  blobCacheBytes += byteSize;
  for (let [value, cachedSize] of blobCacheSizes as Dynamic) {
    if (blobCacheBytes <= maxBlobCacheBytes) break;
    value !== assetUrl &&
      (blobCacheSizes.delete(value),
      blobFetchPromises.delete(value),
      blobObjectUrls.delete(value),
      (blobCacheBytes -= cachedSize));
  }
}
function fetchBlobAsset(
  url?: Dynamic,
  timeoutMs: Dynamic = 8e3,
  fetchOptions: Dynamic = {},
): Dynamic {
  let entry: Dynamic = blobFetchPromises.get(url);
  if (entry !== undefined) return entry;
  let recentFailureAt: Dynamic = blobFetchFailures.get(url);
  if (
    recentFailureAt !== undefined &&
    fetchOptions.ignoreRecentFailure !== true &&
    Date.now() - recentFailureAt < blobFailureCooldownMs
  )
    return Promise.reject(new Error("blob fetch failed recently"));
  let value: Dynamic = (async (): Promise<Dynamic> => {
    if (!isBlobAssetUrl(url))
      throw new Error("not a blob ref");
    let abortController: Dynamic =
        typeof AbortController == "function"
          ? new AbortController()
          : undefined,
      timeoutId: Dynamic = setTimeout((): Dynamic => abortController?.abort(), timeoutMs);
    try {
      let response: Dynamic = await fetch(url, {
        credentials: "same-origin",
        signal: abortController?.signal,
      });
      if (!response.ok)
        throw Object.assign(
          new Error("blob fetch " + String(response.status)),
          {
            status: response.status,
          },
        );
      let blob: Dynamic = await response.blob();
      return await new Promise(
        (resolveDataUrl?: Dynamic, rejectDataUrl?: Dynamic): Dynamic => {
          let reader: Dynamic = new FileReader();
          reader.onload = (): Dynamic => resolveDataUrl(String(reader.result));
          reader.onerror = (): Dynamic =>
            rejectDataUrl(new Error("blob read failed"));
          reader.readAsDataURL(blob);
        },
      );
    } finally {
      clearTimeout(timeoutId);
    }
  })();
  blobFetchPromises.set(url, value);
  value.then(
    (items?: Dynamic): Dynamic => {
      blobObjectUrls.set(url, items);
      recordBlobCacheSize(url, items.length);
    },
    (): Dynamic => {
      blobFetchPromises.delete(url);
      blobFetchFailures.set(url, Date.now());
    },
  );
  return value;
}
function getCachedBlobObjectUrl(assetUrl?: Dynamic): Dynamic {
  return blobObjectUrls.get(assetUrl);
}
export {
  blobCacheBytes,
  blobCacheSizes,
  blobFailureCooldownMs,
  blobFetchFailures,
  blobFetchPromises,
  blobObjectUrls,
  fetchBlobAsset,
  getCachedBlobObjectUrl,
  maxBlobCacheBytes,
  recordBlobCacheSize,
};
export function installPlatformBlobCache(): () => void {
  return () => {
    blobFetchPromises = new Map();
    blobObjectUrls = new Map();
    blobCacheSizes = new Map();
    blobCacheBytes = 0;
    maxBlobCacheBytes = 48 * 1024 * 1024;
    blobFetchFailures = new Map();
    blobFailureCooldownMs = 3e4;
  };
}
