/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react_jsx_runtime } from "../dependencies";
import { getDesignSystemFiles, getDesignSystemFileUrl } from "../design-system/published-files";
import { toModuleNamespace } from "../module-helpers";
import { PreviewAddressedArtboardsTest } from "../preview/addressed-artboards";
import { PreviewBuildDocumentResolvedValue } from "../preview/build-document";
import { isStandaloneStylesheet } from "../preview/css-rewriting";

var jsx_ip: Dynamic;
var equivalentDesignImportTags: Dynamic;
var pageFilesCache: Dynamic;
var maxArtboardCompileCacheEntries: Dynamic;
var artboardCompileCache: Dynamic;
var projectFileNamesCache: Dynamic;
var lastDesignEditAt: Dynamic;
var designEditQuietPeriodMs: Dynamic;
var navigationProbeAttempts: Dynamic;
var navigationProbeAttemptsAfterEdit: Dynamic;
function selectPageFiles(files?: Dynamic): Dynamic {
  pageFilesCache?.all !== files &&
    (pageFilesCache = {
      all: files,
      pages: Object.fromEntries(
        Object.entries(files).filter(
          ([filePath]: Dynamic): Dynamic =>
            PreviewAddressedArtboardsTest(filePath),
        ),
      ),
    });
  return pageFilesCache.pages;
}
function createProjectAssetReadinessProbe(files?: Dynamic): Dynamic {
  let origin: Dynamic = (globalThis as Dynamic).origin;
  if (
    origin === undefined ||
    origin === "null" ||
    typeof location === "undefined"
  )
    return;
  let designSystemFiles: Dynamic = getDesignSystemFiles();
  return (filePath?: Dynamic): Dynamic => {
    if (
      files[filePath] !== designSystemFiles[filePath] ||
      !isStandaloneStylesheet(filePath, files, designSystemFiles)
    )
      return;
    let designSystemUrl: Dynamic = getDesignSystemFileUrl(filePath);
    if (designSystemUrl !== undefined)
      try {
        return new URL(designSystemUrl).origin === location.origin
          ? designSystemUrl
          : undefined;
      } catch {
        return;
      }
  };
}
function getCachedArtboardCompilation(
  file?: Dynamic,
  files?: Dynamic,
  compileOptions?: Dynamic,
): Dynamic {
  let entry: Dynamic = artboardCompileCache.get(file);
  if (entry === undefined || entry.opts !== compileOptions) return null;
  for (let fileName in entry.closure)
    if (files[fileName] !== entry.closure[fileName]) return null;
  return entry.names !== projectFileNamesKey(files)
    ? null
    : (artboardCompileCache.delete(file),
      artboardCompileCache.set(file, entry),
      entry);
}
function cacheArtboardCompilation(
  file?: Dynamic,
  compilation?: Dynamic,
): Dynamic {
  for (
    artboardCompileCache.delete(file),
      artboardCompileCache.set(file, compilation);
    artboardCompileCache.size > maxArtboardCompileCacheEntries;

  )
    artboardCompileCache.delete(artboardCompileCache.keys().next().value);
}
function projectFileNamesKey(files?: Dynamic): Dynamic {
  if (projectFileNamesCache?.files === files)
    return projectFileNamesCache.key;
  let fileNamesKey: Dynamic = Object.keys(files).sort().join(`
`);
  projectFileNamesCache = {
    files: files,
    key: fileNamesKey,
  };
  return fileNamesKey;
}
function effectiveDesignPartMinScale(): Dynamic {
  let __designPartMin: Dynamic = (globalThis as Dynamic).__designPartMin;
  return typeof __designPartMin == "number" && __designPartMin >= 0
    ? __designPartMin
    : PreviewBuildDocumentResolvedValue;
}
function recordDesignEditActivity(): Dynamic {
  lastDesignEditAt = performance.now();
}
export {
  artboardCompileCache,
  cacheArtboardCompilation,
  createProjectAssetReadinessProbe,
  designEditQuietPeriodMs,
  effectiveDesignPartMinScale,
  equivalentDesignImportTags,
  getCachedArtboardCompilation,
  jsx_ip,
  lastDesignEditAt,
  maxArtboardCompileCacheEntries,
  navigationProbeAttempts,
  navigationProbeAttemptsAfterEdit,
  pageFilesCache,
  projectFileNamesCache,
  projectFileNamesKey,
  recordDesignEditActivity,
  selectPageFiles,
};
export function set_lastDesignEditAt(timestamp: any): any {
  lastDesignEditAt = timestamp;
  return timestamp;
}
export function installCanvasCompilationCache(): () => void {
  return () => {
    jsx_ip = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    equivalentDesignImportTags = (
      tagName?: Dynamic,
      otherTagName?: Dynamic,
    ): Dynamic =>
      tagName === otherTagName ||
      ((otherTagName === "dc-import" || otherTagName === "x-import") &&
        (tagName === "x-import" || tagName === "dc-import"));
    pageFilesCache = null;
    maxArtboardCompileCacheEntries = 64;
    artboardCompileCache = new Map();
    projectFileNamesCache = null;
    lastDesignEditAt = -1 / 0;
    designEditQuietPeriodMs = 3e3;
    navigationProbeAttempts = 3;
    navigationProbeAttemptsAfterEdit = 6;
  };
}
