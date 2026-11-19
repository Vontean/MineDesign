/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { SupportJsValue } from "../editor/html/dc-document";
import { exportBabelStandaloneUrl, exportReactDomUmdUrl, exportReactUmdUrl, redactProjectServeAccessToken } from "./standalone-html";
import { getBabelFileUrl } from "../preview/runtime-loading";

var exportUuidPattern: Dynamic;
var exportUrlSchemePattern: Dynamic;
var exportAssetTextEncoder: Dynamic;
var exportMimeByExtension: Dynamic;
function isDesignRuntimeSource(source?: Dynamic): Dynamic {
  return (
    source.startsWith("// GENERATED from dc-runtime/") ||
    source.includes("__dcUpdate")
  );
}
function exportMimeForPath(path?: Dynamic): Dynamic {
  let value: Dynamic = path.split("/").pop() ?? path,
    extensionIndex: Dynamic = value.lastIndexOf("."),
    extension: Dynamic = extensionIndex < 0 ? "" : value.slice(extensionIndex + 1).toLowerCase();
  return exportMimeByExtension[extension] ?? "application/octet-stream";
}
function normalizeLocalExportPath(path?: Dynamic): Dynamic {
  if (path.startsWith("//") || exportUrlSchemePattern.test(path)) return null;
  let value: Dynamic = path.split("#")[0].split("?")[0];
  value.startsWith("/appifact/") && (value = value.slice(10));
  let items: Dynamic = [];
  for (let pathSegment of value.split("/") as Dynamic) {
    let decodedSegment: Dynamic = pathSegment;
    try {
      decodedSegment = decodeURIComponent(pathSegment);
    } catch {}
    if (decodedSegment.includes("/") || decodedSegment.includes("\\")) return null;
    decodedSegment === "" ||
      decodedSegment === "." ||
      (decodedSegment === ".." ? items.pop() : items.push(decodedSegment));
  }
  if (items.length === 0) return null;
  let normalizedPath: Dynamic = items.join("/");
  return exportUrlSchemePattern.test(normalizedPath) ? null : normalizedPath;
}
function createExportAssetResolver(
  files?: Dynamic,
  libraries?: Dynamic,
  resolverOptions: Dynamic = {},
): Dynamic {
  let entries: Dynamic = new Map([
      [exportReactUmdUrl, libraries.reactUmd],
      [exportReactDomUmdUrl, libraries.reactDomUmd],
    ]),
    value: Dynamic =
      resolverOptions.fetchExternal ??
      ((url?: Dynamic, requestOptions?: Dynamic): Dynamic =>
        fetch(url, requestOptions)),
    externalTimeoutMs: Dynamic = resolverOptions.externalTimeoutMs ?? 15e3;
  return async (assetUrl?: Dynamic, requestOptions?: Dynamic): Promise<Dynamic> => {
    if (exportUuidPattern.test(assetUrl)) return null;
    let entry: Dynamic = entries.get(assetUrl);
    if (entry !== undefined)
      return {
        data: exportAssetTextEncoder.encode(entry),
        mime: "text/javascript",
      };
    // MineDesign: Babel (embedded only for a JSX x-import) comes from the editor's own copy, the same bytes as the CDN
    // file; the CSP blocks the CDN (getBabelFileUrl, docs/design/canvas §8.3).
    let babelFile: Dynamic =
      assetUrl === exportBabelStandaloneUrl
        ? getBabelFileUrl()
        : undefined;
    if (babelFile)
      try {
        let response: Dynamic = await fetch(babelFile, { signal: resolverOptions.signal });
        return response.ok
          ? {
              data: new Uint8Array(await response.arrayBuffer()),
              mime: "text/javascript",
            }
          : null;
      } catch {
        return null;
      }
    if (/^(https?:)?\/\//i.test(assetUrl)) {
      let secureUrl: Dynamic = assetUrl.startsWith("//") ? "https:" + assetUrl : assetUrl;
      if (!/^https:/i.test(secureUrl)) {
        console.warn(
          "[design/export] not fetching insecure URL: " +
            redactProjectServeAccessToken(assetUrl),
        );
        return null;
      }
      if (resolverOptions.signal?.aborted) return null;
      let controller: Dynamic = new AbortController(),
        timeoutId: Dynamic = setTimeout(
          (): Dynamic => controller.abort(),
          externalTimeoutMs,
        ),
        callback: Dynamic = (): Dynamic => controller.abort();
      resolverOptions.signal?.addEventListener("abort", callback);
      try {
        let response: Dynamic = await value(secureUrl, {
          signal: controller.signal,
          credentials: "omit",
          referrerPolicy: "no-referrer",
          redirect: "follow",
        });
        if (!response.ok) return null;
        let mimeType: Dynamic =
          response.headers
            .get("content-type")
            ?.split(";")[0]
            .trim()
            .toLowerCase() || "application/octet-stream";
        return {
          data: new Uint8Array(await response.arrayBuffer()),
          mime: mimeType,
        };
      } catch {
        return null;
      } finally {
        clearTimeout(timeoutId);
        resolverOptions.signal?.removeEventListener("abort", callback);
      }
    }
    let localPath: Dynamic = normalizeLocalExportPath(assetUrl);
    if (localPath === null) return null;
    let asset: Dynamic = await files(localPath);
    return localPath.split("/").pop() === SupportJsValue &&
      (asset === null ||
        isDesignRuntimeSource(new TextDecoder().decode(asset.data)))
      ? {
          data: exportAssetTextEncoder.encode(libraries.supportJs),
          mime: "text/javascript",
        }
      : (asset === null &&
          !requestOptions?.optional &&
          console.warn(
            "[design/export] unresolved: " +
              redactProjectServeAccessToken(assetUrl),
          ),
        asset);
  };
}
export {
  createExportAssetResolver,
  exportAssetTextEncoder,
  exportMimeByExtension,
  exportMimeForPath,
  exportUrlSchemePattern,
  exportUuidPattern,
  isDesignRuntimeSource,
  normalizeLocalExportPath,
};
export function installExportAssetResolver(): () => void {
  return () => {
    exportUuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    exportUrlSchemePattern = /^[a-z][a-z0-9+.-]*:/i;
    exportAssetTextEncoder = new TextEncoder();
    exportMimeByExtension = {
      html: "text/html",
      htm: "text/html",
      css: "text/css",
      js: "text/javascript",
      mjs: "text/javascript",
      jsx: "text/jsx",
      tsx: "text/tsx",
      json: "application/json",
      svg: "image/svg+xml",
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      avif: "image/avif",
      bmp: "image/bmp",
      ico: "image/x-icon",
      woff: "font/woff",
      woff2: "font/woff2",
      ttf: "font/ttf",
      otf: "font/otf",
      mp4: "video/mp4",
      webm: "video/webm",
      mp3: "audio/mpeg",
      wav: "audio/wav",
      ogg: "audio/ogg",
      txt: "text/plain",
      md: "text/markdown",
    };
  };
}
