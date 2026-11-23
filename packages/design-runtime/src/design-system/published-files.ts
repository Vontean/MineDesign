/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { PlatformFileContentWebpAvifPattern, ProjectValue } from "../platform/file-content";
import { sha256Fallback } from "../platform/sha256";

var DesignSystemPublishedFilesFromEntriesValue: Dynamic;
var DesignSystemPublishedFilesCache: Dynamic;
var DesignSystemPublishedFilesAlias: Dynamic;
var DesignSystemPublishedFilesSubscribers: Dynamic;
var DesignSystemPublishedFilesPattern: Dynamic;
var DesignSystemPublishedFilesItems: Dynamic;
var DesignSystemPublishedFilesResolvedValue: Dynamic;
var DesignSystemPublishedFilesConstant: Dynamic;
var publishedFileEntryByPath: Dynamic;
var invalidatedNamespaces: Dynamic;
var publishedFilePaths: Dynamic;
var invalidatedRoots: Dynamic;
var getPublishedProjectRootValue: Dynamic;
var knownPublishedVersions: Dynamic;
var DesignSystemPublishedFilesLimit: Dynamic;
var versionedProjectRootPattern: Dynamic;
var publishedProjectRevision: Dynamic;
function getDesignSystemFiles(): Dynamic {
  return DesignSystemPublishedFilesFromEntriesValue;
}
function getDesignSystemFileUrl(fileKey?: Dynamic): Dynamic {
  let entry: Dynamic = DesignSystemPublishedFilesCache.get(fileKey);
  if (!(entry === undefined || typeof document === "undefined"))
    try {
      return new URL(
        entry.split("/").map(encodeURIComponent).join("/"),
        (document as Dynamic).baseURI,
      ).href;
    } catch {
      return;
    }
}
function designSystemNamespaceFromUrl(fileUrl?: Dynamic): Dynamic {
  try {
    let href: Dynamic = new URL(
        ProjectValue + "ds/",
        (document as Dynamic).baseURI,
      ).href,
      namespaceName: Dynamic = fileUrl.startsWith(href)
        ? fileUrl.slice(href.length).split("/")[0]
        : undefined;
    return namespaceName === undefined ||
      namespaceName === "" ||
      !fileUrl.startsWith(href + namespaceName + "/")
      ? undefined
      : href + namespaceName + "/";
  } catch {
    return;
  }
}
function invalidateDesignSystemUrl(
  urlCache?: Dynamic,
  changedUrl?: Dynamic,
): Dynamic {
  if (typeof changedUrl != "string" || !urlCache.has(changedUrl)) return;
  urlCache.clear();
  let namespaceUrl: Dynamic = designSystemNamespaceFromUrl(changedUrl);
  return namespaceUrl === undefined ||
    invalidatedNamespaces.has(namespaceUrl)
    ? "again"
    : (invalidatedNamespaces.add(namespaceUrl),
      (DesignSystemPublishedFilesConstant += 1),
      "first");
}
function resetPublishedFileIndex(publishedFiles?: Dynamic): Dynamic {
  DesignSystemPublishedFilesConstant += 1;
  publishedProjectRevision += 1;
  invalidatedNamespaces.clear();
  invalidatedRoots.clear();
  DesignSystemPublishedFilesResolvedValue =
    publishedFiles === undefined ? undefined : new Map();
  publishedFilePaths =
    publishedFiles === undefined ? undefined : new Set(Object.keys(publishedFiles));
  getPublishedProjectRootValue =
    publishedFiles === undefined ? undefined : getPublishedProjectRoot();
  knownPublishedVersions.length = 0;
  for (let [filePath, fileInfo] of Object.entries(publishedFiles ?? {}) as Dynamic) {
    let { sha256: fileSha256, contentType: fileContentType }: Dynamic = fileInfo ?? {};
    typeof fileSha256 == "string" &&
      DesignSystemPublishedFilesResolvedValue.set(filePath, {
        sha256: fileSha256,
        ...(typeof fileContentType == "string"
          ? {
              contentType: fileContentType,
            }
          : {}),
      });
  }
}
function removePublishedFiles(removedPaths?: Dynamic): Dynamic {
  for (let removedPath of removedPaths as Dynamic)
    DesignSystemPublishedFilesResolvedValue?.delete(removedPath) === true &&
      ((publishedProjectRevision += 1),
      removedPath.startsWith(ProjectValue + "ds/") &&
        (DesignSystemPublishedFilesConstant += 1));
}
function updatePublishedFileIndex(fileChanges?: Dynamic): Dynamic {
  DesignSystemPublishedFilesConstant += 1;
  publishedProjectRevision += 1;
  DesignSystemPublishedFilesResolvedValue !== undefined &&
    (getPublishedProjectRootValue = getPublishedProjectRoot());
  knownPublishedVersions.length = 0;
  for (let fileChange of fileChanges as Dynamic)
    fileChange.sha256 === null
      ? (DesignSystemPublishedFilesResolvedValue?.delete(fileChange.path),
        publishedFilePaths?.delete(fileChange.path))
      : (DesignSystemPublishedFilesResolvedValue?.set(fileChange.path, {
          sha256: fileChange.sha256,
        }),
        publishedFilePaths?.add(fileChange.path));
}
function resolvePublishedDesignSystemFile(
  relativePath?: Dynamic,
  fileText?: Dynamic,
): Dynamic {
  if (
    !DesignSystemPublishedFilesPattern.test(relativePath) ||
    typeof document === "undefined" ||
    typeof location === "undefined" ||
    relativePath
      .split("/")
      .some(
        (segment?: Dynamic): Dynamic =>
          segment === "" || segment === "." || segment === "..",
      )
  )
    return;
  let publishedEntry: Dynamic = DesignSystemPublishedFilesResolvedValue?.get(
    ProjectValue + relativePath,
  );
  if (
    publishedEntry === undefined ||
    (publishedEntry.contentType !== undefined &&
      !DesignSystemPublishedFilesItems.some(
        ([pathPattern, contentTypePattern]: Dynamic): Dynamic =>
          pathPattern.test(relativePath) && contentTypePattern.test(publishedEntry.contentType),
      ))
  )
    return;
  let origin: Dynamic = (globalThis as Dynamic).origin;
  if (origin === undefined || origin === "null") return;
  let entry: Dynamic = publishedFileEntryByPath.get(relativePath);
  entry?.text !== fileText &&
    publishedFileEntryByPath.set(
      relativePath,
      (entry = {
        text: fileText,
        sha256: sha256Fallback(fileText),
      }),
    );
  if (entry.sha256 === publishedEntry.sha256)
    try {
      let fileUrlObject: Dynamic = new URL(
        ProjectValue +
          relativePath.split("/").map(encodeURIComponent).join("/"),
        (document as Dynamic).baseURI,
      );
      return fileUrlObject.origin === location.origin &&
        !invalidatedNamespaces.has(
          designSystemNamespaceFromUrl(fileUrlObject.href) ?? "",
        )
        ? fileUrlObject.href
        : undefined;
    } catch {
      return;
    }
}
function decodePublishedImage(relativePath?: Dynamic, fileText?: Dynamic): Dynamic {
  if (!PlatformFileContentWebpAvifPattern.test(relativePath)) return fileText;
  try {
    let binaryText: Dynamic = atob(fileText),
      bytes: Dynamic = new Uint8Array(binaryText.length);
    for (let index: Dynamic = 0; index < binaryText.length; index += 1)
      bytes[index] = binaryText.charCodeAt(index);
    return bytes;
  } catch {
    return;
  }
}
function getPublishedProjectRoot(): Dynamic {
  if (typeof document === "undefined" || typeof location === "undefined")
    return;
  let origin: Dynamic = (globalThis as Dynamic).origin;
  if (!(origin === undefined || origin === "null"))
    try {
      let rootUrl: Dynamic = new URL(
        ProjectValue,
        (document as Dynamic).baseURI,
      );
      return rootUrl.origin === location.origin ? rootUrl.href : undefined;
    } catch {
      return;
    }
}
function recordPublishedVersion(publishResult?: Dynamic): Dynamic {
  !publishResult.ok ||
    publishResult.own !== true ||
    publishResult.version === undefined ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(publishResult.version) ||
    getPublishedProjectRootValue === undefined ||
    (knownPublishedVersions.push(publishResult.version),
    knownPublishedVersions.length >
      DesignSystemPublishedFilesLimit &&
      knownPublishedVersions.shift());
}
function isKnownPublishedVersion(rootUrl?: Dynamic): Dynamic {
  let candidateMatch: Dynamic = versionedProjectRootPattern.exec(rootUrl),
    currentMatch: Dynamic =
      getPublishedProjectRootValue === undefined
        ? null
        : versionedProjectRootPattern.exec(getPublishedProjectRootValue);
  return (
    candidateMatch !== null &&
    currentMatch !== null &&
    candidateMatch[1] === currentMatch[1] &&
    knownPublishedVersions.includes(candidateMatch[2])
  );
}
function describesPublishedRoot(rootUrl?: Dynamic): Dynamic {
  return invalidatedRoots.has(rootUrl)
    ? false
    : rootUrl === getPublishedProjectRootValue
      ? knownPublishedVersions.length <
        DesignSystemPublishedFilesLimit
      : isKnownPublishedVersion(rootUrl);
}
function getCurrentPublishedProjectRoot(): Dynamic {
  if (DesignSystemPublishedFilesResolvedValue === undefined) return;
  let currentRoot: Dynamic = getPublishedProjectRoot();
  return currentRoot !== undefined &&
    !invalidatedRoots.has(currentRoot) &&
    (currentRoot === getPublishedProjectRootValue || isKnownPublishedVersion(currentRoot))
    ? currentRoot
    : undefined;
}
function isFilePublishedWithMimeType(
  relativePath?: Dynamic,
  fileText?: Dynamic,
): Dynamic {
  if (
    relativePath
      .split("/")
      .some(
        (segment?: Dynamic): Dynamic =>
          segment === "" || segment === "." || segment === "..",
      )
  )
    return false;
  let publishedEntry: Dynamic = DesignSystemPublishedFilesResolvedValue?.get(
    ProjectValue + relativePath,
  );
  if (publishedEntry === undefined) return false;
  let mimeRule: Dynamic = DesignSystemPublishedFilesItems.find(
    ([pathPattern]: Dynamic): Dynamic => pathPattern.test(relativePath),
  );
  if (
    mimeRule !== undefined &&
    publishedEntry.contentType !== undefined &&
    !mimeRule[1].test(publishedEntry.contentType)
  )
    return false;
  let entry: Dynamic = publishedFileEntryByPath.get(relativePath);
  if (entry?.text !== fileText) {
    let decodedContent: Dynamic = decodePublishedImage(relativePath, fileText);
    if (decodedContent === undefined) return false;
    publishedFileEntryByPath.set(
      relativePath,
      (entry = {
        text: fileText,
        sha256: sha256Fallback(decodedContent),
      }),
    );
  }
  return entry.sha256 === publishedEntry.sha256;
}
function isFilePublishedAtAddress(relativePath?: Dynamic): Dynamic {
  return (
    publishedFilePaths?.has(
      ProjectValue + relativePath,
    ) === true
  );
}
function lookupPublishedUrl(rootUrl?: Dynamic, requestUrl?: Dynamic): Dynamic {
  if (
    !(
      rootUrl === undefined ||
      typeof requestUrl != "string" ||
      !requestUrl.startsWith(rootUrl)
    )
  )
    try {
      let relativePath: Dynamic = decodeURIComponent(
        requestUrl.slice(rootUrl.length).split(/[?#]/)[0]!,
      );
      return (isKnownPublishedVersion(rootUrl)
        ? DesignSystemPublishedFilesResolvedValue?.has(
            ProjectValue + relativePath,
          ) === true
        : isFilePublishedAtAddress(relativePath)) && !/\.dc\.html$/i.test(relativePath)
        ? relativePath
        : undefined;
    } catch {
      return;
    }
}
function invalidatePublishedRoot(
  rootUrl?: Dynamic,
  requestUrl?: Dynamic,
): Dynamic {
  if (
    !(rootUrl === undefined || lookupPublishedUrl(rootUrl, requestUrl) === undefined)
  )
    return invalidatedRoots.has(rootUrl)
      ? "again"
      : (invalidatedRoots.add(rootUrl),
        (publishedProjectRevision += 1),
        "first");
}
function publishedProjectCacheKey(): Dynamic {
  return (
    (getCurrentPublishedProjectRoot() ?? "") +
    "#" +
    String(publishedProjectRevision)
  );
}
function designSystemCacheKey(): Dynamic {
  try {
    return DesignSystemPublishedFilesResolvedValue !== undefined &&
      typeof document !== "undefined"
      ? new URL(ProjectValue, (document as Dynamic).baseURI).href +
          "#" +
          String(DesignSystemPublishedFilesConstant)
      : "";
  } catch {
    return "";
  }
}
export {
  decodePublishedImage,
  describesPublishedRoot,
  designSystemCacheKey,
  designSystemNamespaceFromUrl,
  DesignSystemPublishedFilesAlias,
  DesignSystemPublishedFilesCache,
  publishedFileEntryByPath,
  DesignSystemPublishedFilesConstant,
  DesignSystemPublishedFilesFromEntriesValue,
  DesignSystemPublishedFilesItems,
  DesignSystemPublishedFilesLimit,
  DesignSystemPublishedFilesPattern,
  DesignSystemPublishedFilesResolvedValue,
  DesignSystemPublishedFilesSubscribers,
  getCurrentPublishedProjectRoot,
  getDesignSystemFiles,
  getDesignSystemFileUrl,
  getPublishedProjectRoot,
  getPublishedProjectRootValue,
  invalidateDesignSystemUrl,
  invalidatePublishedRoot,
  isFilePublishedAtAddress,
  isFilePublishedWithMimeType,
  isKnownPublishedVersion,
  lookupPublishedUrl,
  publishedProjectCacheKey,
  recordPublishedVersion,
  removePublishedFiles,
  resetPublishedFileIndex,
  resolvePublishedDesignSystemFile,
  updatePublishedFileIndex,
  versionedProjectRootPattern,
};
export function set_DesignSystemPublishedFilesAlias(newValue: any): any {
  DesignSystemPublishedFilesAlias = newValue;
  return newValue;
}
export function set_DesignSystemPublishedFilesFromEntriesValue(newValue: any): any {
  DesignSystemPublishedFilesFromEntriesValue = newValue;
  return newValue;
}
export function installDesignSystemPublishedFiles(): () => void {
  return () => {
    DesignSystemPublishedFilesFromEntriesValue = {};
    DesignSystemPublishedFilesCache = new Map();
    DesignSystemPublishedFilesAlias = "[[],0]";
    DesignSystemPublishedFilesSubscribers = new Set();
    DesignSystemPublishedFilesPattern = /^ds\/[^/]+\/[^/]/;
    DesignSystemPublishedFilesItems = [
      [/\.css$/i, /^text\/css\b/i],
      [/\.m?js$/i, /^(?:text|application)\/javascript\b/i],
    ];
    DesignSystemPublishedFilesConstant = 0;
    publishedFileEntryByPath = new Map();
    invalidatedNamespaces = new Set();
    invalidatedRoots = new Set();
    knownPublishedVersions = [];
    DesignSystemPublishedFilesLimit = 16;
    versionedProjectRootPattern = new RegExp(
      "^(.*/_f/)([^/]+)/" + ProjectValue + "$",
    );
    publishedProjectRevision = 0;
  };
}
