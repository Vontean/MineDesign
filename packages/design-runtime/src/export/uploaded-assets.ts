/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var projectBlobReferencePattern: Dynamic;
var emulatorBlobReferencePattern: Dynamic;
var exportAssetExtensionsByMime: Dynamic;
var ExportAssetFetchError: Dynamic;
var exportAssetIdleTimeoutMs: Dynamic;
var exportAssetAbsoluteTimeoutMs: Dynamic;
var exportAssetFetchConcurrency: Dynamic;
var parentDirectoryOfExportPath: Dynamic;
async function fetchExportAsset(
  url?: Dynamic,
  timeoutMs: Dynamic = exportAssetIdleTimeoutMs,
): Promise<Dynamic> {
  let controller: Dynamic = new AbortController(),
    flag: Dynamic = false,
    callback: Dynamic = (): Dynamic => {
      flag = true;
      controller.abort();
    },
    value: Dynamic = setTimeout(callback, timeoutMs),
    resetIdleTimeout: Dynamic = (): Dynamic => {
      clearTimeout(value);
      value = setTimeout(callback, timeoutMs);
    },
    absoluteTimer: Dynamic = setTimeout(callback, exportAssetAbsoluteTimeoutMs),
    response: Dynamic,
    data: Dynamic;
  try {
    response = await fetch(url, {
      credentials: "same-origin",
      signal: controller.signal,
    });
    resetIdleTimeout();
    if (!response.ok || response.body === null)
      data = response.ok
        ? new Uint8Array(await response.arrayBuffer())
        : new Uint8Array(0);
    else {
      let items: Dynamic = [],
        index: Dynamic = 0;
      for (let reader: Dynamic = response.body.getReader(); ; ) {
        let { done: done, value: chunk }: Dynamic = await reader.read();
        if (done) break;
        resetIdleTimeout();
        items.push(chunk);
        index += chunk.length;
      }
      data = new Uint8Array(index);
      let offset: Dynamic = 0;
      for (let chunk of items as Dynamic) {
        data.set(chunk, offset);
        offset += chunk.length;
      }
    }
  } catch {
    throw flag
      ? new ExportAssetFetchError("the download stalled")
      : new Error("the download failed");
  } finally {
    clearTimeout(value);
    clearTimeout(absoluteTimer);
  }
  if (!response.ok)
    throw new Error("the server answered " + String(response.status));
  let mimeType: Dynamic =
    response.headers.get("content-type")?.split(";")[0].trim().toLowerCase() ??
    "";
  if (data.length === 0 || mimeType === "text/html")
    throw new Error("the server did not return the file");
  return {
    data: data,
    type: mimeType,
  };
}
async function mapWithConcurrency(
  items?: Dynamic,
  concurrency?: Dynamic,
  mapper?: Dynamic,
): Promise<Dynamic> {
  let value: Dynamic = new Array(items.length),
    index: Dynamic = 0,
    callback: Dynamic = async (): Promise<Dynamic> => {
      for (; index < items.length; ) {
        let itemIndex: Dynamic = index++;
        value[itemIndex] = await mapper(items[itemIndex]);
      }
    };
  await Promise.all(
    Array.from(
      {
        length: Math.min(concurrency, items.length),
      },
      callback,
    ),
  );
  return value;
}
function findExportBlobReferences(
  source?: Dynamic,
  includeEmulatorBlobUrls?: Dynamic,
): Dynamic {
  let entries: Dynamic = new Map();
  if (source.includes("_blob/"))
    for (let value of source.matchAll(projectBlobReferencePattern) as Dynamic)
      entries.set("_blob/" + value[2], value[2]);
  if (includeEmulatorBlobUrls && source.includes("blob:"))
    for (let value of source.matchAll(
      emulatorBlobReferencePattern,
    ) as Dynamic)
      entries.set(value[0], value[1]);
  return entries;
}
async function collectExportUploadedAssets(
  files?: Dynamic,
  readBlob?: Dynamic,
  transform?: Dynamic,
  options: Dynamic = {},
): Promise<Dynamic> {
  let value: Dynamic = options.emulatorBlobUrls === true,
    maxBytes: Dynamic = options.maxBytes ?? 268435456,
    values: Dynamic = new Set(
      [...(options.taken ?? []), ...files.keys()].map(
        (input?: Dynamic): Dynamic => input.toLowerCase(),
      ),
    ),
    entries: Dynamic = new Map(),
    items: Dynamic = [],
    textFiles: Dynamic = new Map(files),
    originalAssetBytes: Dynamic = new Map(),
    missingAssets: Dynamic = [],
    visitedReferences: Dynamic = new Set(),
    sizeLimitReason: Dynamic =
      "it would take the export past " +
      String(maxBytes >> 20) +
      " MB of uploaded files",
    text: Dynamic = "not downloaded, because an earlier download stalled",
    index: Dynamic = 0,
    downloadedBytes: Dynamic = 0,
    flag: Dynamic = false,
    pendingSources: Dynamic = [...files.values()];
  for (; pendingSources.length > 0; ) {
    let references: Dynamic = new Map();
    for (let source of pendingSources as Dynamic)
      for (let [reference, blobId] of findExportBlobReferences(
        source,
        value,
      ) as Dynamic)
        visitedReferences.has(reference) || references.set(reference, blobId);
    pendingSources = [];
    for (let reference of references.keys() as Dynamic) visitedReferences.add(reference);
    let results: Dynamic = await mapWithConcurrency(
      [...references.keys()],
      exportAssetFetchConcurrency,
      async (input?: Dynamic): Promise<Dynamic> => {
        if (flag) return text;
        if (downloadedBytes >= maxBytes) return sizeLimitReason;
        try {
          let asset: Dynamic = await transform(
            input.startsWith("blob:") ? input : "/" + input,
          );
          downloadedBytes += asset.data.length;
          return asset;
        } catch (error: Dynamic) {
          error instanceof ExportAssetFetchError && (flag = true);
          return error instanceof Error ? error.message : String(error);
        }
      },
    );
    [...references].forEach(
      ([input, blobId]: Dynamic, resultIndex?: Dynamic): Dynamic => {
        let result: Dynamic = results[resultIndex];
        if (
          typeof result == "string" ||
          index + result.data.length > maxBytes
        ) {
          missingAssets.push({
            ref: input,
            why: typeof result == "string" ? result : sizeLimitReason,
            usedIn: [],
          });
          return;
        }
        index += result.data.length;
        let extension: Dynamic =
            exportAssetExtensionsByMime[result.type] ?? "bin",
          assetPath: Dynamic = "assets/" + blobId + "." + extension;
        for (
          let count: Dynamic = 2;
          values.has(assetPath.toLowerCase());
          count++
        )
          assetPath = "assets/" + blobId + "-" + String(count) + "." + extension;
        values.add(assetPath.toLowerCase());
        entries.set(input, assetPath);
        if (result.type === "text/css" || result.type === "text/javascript") {
          let source: Dynamic = new TextDecoder().decode(result.data);
          textFiles.set(assetPath, source);
          originalAssetBytes.set(assetPath, result.data);
          pendingSources.push(source);
        } else
          items.push({
            name: assetPath,
            data: result.data,
          });
      },
    );
  }
  let defaultDirectory: Dynamic = parentDirectoryOfExportPath(readBlob),
    rewrittenFiles: Dynamic = new Map();
  for (let [filePath, source] of textFiles as Dynamic) {
    let directory: Dynamic = /\.css$/i.test(filePath)
        ? parentDirectoryOfExportPath(filePath)
        : defaultDirectory,
      relativePrefix: Dynamic =
        directory === "" ? "./" : "../".repeat(directory.split("/").length),
      rewrittenSource: Dynamic = source;
    rewrittenSource.includes("_blob/") &&
      (rewrittenSource = rewrittenSource.replace(
        projectBlobReferencePattern,
        (input?: Dynamic, prefix?: Dynamic, context?: Dynamic): Dynamic => {
          let entry: Dynamic = entries.get("_blob/" + context);
          return entry === undefined ? input : prefix + relativePrefix + entry;
        },
      ));
    value &&
      rewrittenSource.includes("blob:") &&
      (rewrittenSource = rewrittenSource.replace(
        emulatorBlobReferencePattern,
        (input?: Dynamic): Dynamic => {
          let entry: Dynamic = entries.get(input);
          return entry === undefined ? input : relativePrefix + entry;
        },
      ));
    rewrittenFiles.set(filePath, rewrittenSource);
  }
  let updatedSources: Dynamic = new Map(),
    exportEntries: Dynamic = items;
  for (let [filePath, rewrittenSource] of rewrittenFiles as Dynamic)
    files.has(filePath)
      ? updatedSources.set(filePath, rewrittenSource)
      : exportEntries.push({
          name: filePath,
          data:
            rewrittenSource === textFiles.get(filePath) ? originalAssetBytes.get(filePath) : rewrittenSource,
        });
  for (let missingAsset of missingAssets as Dynamic)
    missingAsset.usedIn = [...textFiles]
      .filter(
        ([, input]: Dynamic): Dynamic =>
          findExportBlobReferences(input, value).has(missingAsset.ref),
      )
      .map(([input]: Dynamic): Dynamic => input);
  let mentionsUploads: Dynamic =
    visitedReferences.size > 0 ||
    [...files.values()].some(
      (input?: Dynamic): Dynamic => input.includes("_blob/"),
    );
  return {
    sources: updatedSources,
    entries: exportEntries,
    missing: missingAssets,
    mentionsUploads: mentionsUploads,
  };
}
export {
  collectExportUploadedAssets,
  emulatorBlobReferencePattern,
  exportAssetAbsoluteTimeoutMs,
  exportAssetExtensionsByMime,
  exportAssetFetchConcurrency,
  ExportAssetFetchError,
  exportAssetIdleTimeoutMs,
  fetchExportAsset,
  findExportBlobReferences,
  mapWithConcurrency,
  parentDirectoryOfExportPath,
  projectBlobReferencePattern,
};
export function installExportUploadedAssets(): () => void {
  return () => {
    projectBlobReferencePattern =
      /(^|[^\w/.:-])(?:(?:\.{1,2}\/)+|\/)?_blob\/([0-9a-f]{32})(?![0-9a-f])/g;
    emulatorBlobReferencePattern =
      /blob:https?:\/\/[A-Za-z0-9.:-]{1,80}\/([0-9a-f-]{36})/g;
    exportAssetExtensionsByMime = {
      "image/png": "png",
      "image/jpeg": "jpg",
      "image/gif": "gif",
      "image/webp": "webp",
      "image/svg+xml": "svg",
      "video/mp4": "mp4",
      "video/webm": "webm",
      "application/pdf": "pdf",
      "font/woff2": "woff2",
      "font/woff": "woff",
      "font/ttf": "ttf",
      "font/otf": "otf",
      "text/csv": "csv",
      "text/markdown": "md",
      "application/json": "json",
      "text/plain": "txt",
      "text/css": "css",
      "text/javascript": "js",
    };
    ExportAssetFetchError = class extends Error {};
    exportAssetIdleTimeoutMs = 2e4;
    exportAssetAbsoluteTimeoutMs = 12e4;
    exportAssetFetchConcurrency = 4;
    parentDirectoryOfExportPath = (input?: Dynamic): Dynamic =>
      input.includes("/") ? input.slice(0, input.lastIndexOf("/")) : "";
  };
}
