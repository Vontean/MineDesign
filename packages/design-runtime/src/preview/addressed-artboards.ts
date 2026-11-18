/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { describesPublishedRoot, getCurrentPublishedProjectRoot, isFilePublishedAtAddress, isFilePublishedWithMimeType, publishedProjectCacheKey } from "../design-system/published-files";
import { isLoadingArtboardHtml } from "../platform/design-document-adapter";
import { PlatformFileContentWebpAvifPattern } from "../platform/file-content";
import { projectDirectoryOf, resolveProjectAssetPath } from "./asset-rewriting";
import { normalizeBlobAssetPaths } from "./blob-paths";
import { decodeHtmlAttributeEntities, isProjectSourcePath } from "./component-imports";
import { collectProjectDependencyFiles } from "./dependency-graph";
import { rewriteHtmlDependencies } from "./dependency-injection";
import { findHtmlTags, getHtmlAttribute, maskHtmlRawContent } from "./html-scanner";

var PreviewAddressedArtboardsHtmlPattern: Dynamic;
var PreviewAddressedArtboardsPattern: Dynamic;
var PreviewAddressedArtboardsSupportPattern: Dynamic;
var PreviewAddressedArtboardsTest: Dynamic;
var PreviewAddressedArtboardsHandler: Dynamic;
var HttpsProjectInvalidValue: Dynamic;
var PreviewAddressedArtboardsResolvedValue: Dynamic;
var PreviewAddressedArtboardsCache: Dynamic;
function hasExactFileReference(text: string, fileReference: string): boolean {
  for (
    let matchIndex: number = text.indexOf(fileReference);
    matchIndex >= 0;
    matchIndex = text.indexOf(fileReference, matchIndex + 1)
  ) {
    let precedingChar: string = matchIndex === 0 ? "" : text[matchIndex - 1];
    if (
      precedingChar === "" ||
      !/[A-Za-z0-9_.%/-]/.test(precedingChar) ||
      (precedingChar === "/" &&
        text[matchIndex - 2] === "." &&
        !/[A-Za-z0-9_.%/-]/.test(text[matchIndex - 3] ?? ""))
    )
      return true;
  }
  return false;
}
function projectReferenceTokens(attributeText?: Dynamic): Dynamic {
  let decodedText: Dynamic = decodeHtmlAttributeEntities(attributeText);
  return (decodedText === attributeText ? [attributeText] : [attributeText, decodedText]).flatMap(
    (variant?: Dynamic): Dynamic => variant.match(/[\w.~%/\\:@!$&*+-]+/g) ?? [],
  );
}
function resolveProjectReference(
  reference?: Dynamic,
  baseDirectory?: Dynamic,
): Dynamic {
  let resolvedUrl: Dynamic;
  try {
    resolvedUrl = new URL(reference, PreviewAddressedArtboardsResolvedValue + baseDirectory);
  } catch {
    return;
  }
  if (resolvedUrl.origin === HttpsProjectInvalidValue) {
    if (!resolvedUrl.pathname.startsWith("/p/")) return null;
    try {
      return decodeURIComponent(resolvedUrl.pathname.slice(3));
    } catch {
      return resolvedUrl.pathname.slice(3);
    }
  }
}
function referencesOutsideProject(
  text?: Dynamic,
  baseDirectory?: Dynamic,
): Dynamic {
  return projectReferenceTokens(text).some(
    (token?: Dynamic): Dynamic =>
      /\.\.|%2e/i.test(token) &&
      resolveProjectReference(token, baseDirectory) === null,
  );
}
function addressedArtboardRefusal(
  fileText?: Dynamic,
  filePath?: Dynamic,
  baseDirectory?: Dynamic,
  projectPaths?: Dynamic,
  projectPathsKey?: Dynamic,
): Dynamic {
  let cached: Dynamic = PreviewAddressedArtboardsCache.get(filePath);
  if (
    cached !== undefined &&
    cached.text === fileText &&
    cached.native === baseDirectory &&
    cached.paths === projectPathsKey
  )
    return cached.why;
  let refusal: Dynamic = ((): Dynamic => {
    if (fileText.includes("/appifact/"))
      return filePath + " names a path under /appifact/";
    if (referencesOutsideProject(fileText, baseDirectory))
      return filePath + " names a path that climbs above the project folder";
    if (
      !PreviewAddressedArtboardsPattern.test(filePath) &&
      /\bimport\s*\(/.test(fileText)
    )
      return filePath + " imports a module as it runs";
    for (let otherPath of projectPaths as Dynamic)
      if (
        otherPath !== filePath &&
        PreviewAddressedArtboardsHandler(fileText, "/" + otherPath)
      )
        return filePath + " names " + otherPath + " from the root";
    for (let token of projectReferenceTokens(fileText) as Dynamic) {
      if (!/^\/(?!\/)/.test(token)) continue;
      let assetPath: Dynamic = resolveProjectAssetPath(
        baseDirectory,
        token,
      );
      if (
        assetPath !== null &&
        assetPath !== filePath &&
        projectPaths.includes(assetPath) &&
        resolveProjectReference(token, baseDirectory) !== assetPath
      )
        return filePath + " names " + assetPath + " from the root";
    }
    for (let otherPath of projectPaths as Dynamic)
      if (
        otherPath !== filePath &&
        baseDirectory !== "" &&
        PlatformFileContentWebpAvifPattern.test(otherPath) &&
        PreviewAddressedArtboardsHandler(fileText, otherPath)
      )
        return filePath + " names " + otherPath + " from the project folder";
  })();
  PreviewAddressedArtboardsCache.set(filePath, {
    text: fileText,
    native: baseDirectory,
    paths: projectPathsKey,
    why: refusal,
  });
  return refusal;
}
function addressedRuntimeRefusal(
  html?: Dynamic,
  baseDirectory?: Dynamic,
  files?: Dynamic,
): Dynamic {
  let maskedHtml: Dynamic = maskHtmlRawContent(html);
  for (let [tagStart, tagEnd] of findHtmlTags(
    maskedHtml,
    "base",
  ) as Dynamic)
    if (
      getHtmlAttribute(html.slice(tagStart, tagEnd), "href") !==
      null
    )
      return "a base element of its own";
  for (let [tagStart, tagEnd] of findHtmlTags(
    maskedHtml,
    "script",
  ) as Dynamic) {
    let tagText: Dynamic = html.slice(tagStart, tagEnd),
      src: Dynamic = getHtmlAttribute(tagText, "src"),
      isModule: Dynamic =
        (getHtmlAttribute(tagText, "type") ?? "")
          .trim()
          .toLowerCase() === "module";
    if (src === null) {
      if (isModule) return "an inline module script";
      continue;
    }
    let scriptPath: Dynamic = resolveProjectAssetPath(
      baseDirectory,
      src,
    );
    if (!(scriptPath === null || files[scriptPath] == null)) {
      if (isModule) return "a module script names " + scriptPath;
      if (getHtmlAttribute(tagText, "async") !== null)
        return "an async script names " + scriptPath;
    }
  }
}
function isRequiredProjectFile(
  filePath?: Dynamic,
  artboardPath?: Dynamic,
  dependencyPaths?: Dynamic,
  extraPaths?: Dynamic,
): Dynamic {
  return filePath === artboardPath || dependencyPaths.has(filePath) || extraPaths.has(filePath);
}
function filterAddressedFiles(
  filePaths?: Dynamic,
  artboardPath?: Dynamic,
  dependencyPaths?: Dynamic,
  extraPaths?: Dynamic,
  getFallbackFiles?: Dynamic,
): Dynamic {
  let fallbackFiles: Dynamic;
  return filePaths.filter(
    (filePath?: Dynamic): Dynamic =>
      isRequiredProjectFile(filePath, artboardPath, dependencyPaths, extraPaths) ||
      filePath in (fallbackFiles ??= getFallbackFiles()),
  );
}
function buildAddressedArtboard(
  editorFiles?: Dynamic,
  artboardPath?: Dynamic,
  projectState?: Dynamic,
): Dynamic {
  if (projectState.projectRoot === undefined)
    return {
      copied:
        "the published files are not known for the version the editor's page addresses, or one of them did not load",
    };
  let artboardHtml: Dynamic = editorFiles[artboardPath];
  if (artboardHtml == null)
    return {
      copied: "the artboard's file is not among the editor's files",
    };
  if (isLoadingArtboardHtml(artboardHtml))
    return {
      copied: "the artboard's content has not arrived",
    };
  if (!projectState.publishedAtAddress(artboardPath))
    return {
      copied:
        "the artboard's file is not in the published version the editor shows",
    };
  let artboardDirectory: Dynamic = projectDirectoryOf(artboardPath),
    filePaths: Dynamic = Object.keys(editorFiles),
    filePathsKey: Dynamic = filePaths.join(`
`),
    htmlFiles: Dynamic = {};
  for (let filePath of filePaths as Dynamic) {
    let fileText: Dynamic = editorFiles[filePath];
    if (PreviewAddressedArtboardsSupportPattern.test(filePath))
      return {
        copied: "the canvas holds a runtime file of its own: " + filePath,
      };
    if (PreviewAddressedArtboardsTest(filePath)) {
      if (projectDirectoryOf(filePath) !== artboardDirectory)
        return {
          copied: "the artboard uses a page from another folder: " + filePath,
        };
      if (
        filePath !== artboardPath &&
        rewriteHtmlDependencies(fileText, editorFiles, artboardDirectory) !== fileText
      )
        return {
          copied:
            "a component names a stored stylesheet or script: " + filePath,
        };
      let runtimeRefusal: Dynamic = addressedRuntimeRefusal(fileText, artboardDirectory, editorFiles);
      if (runtimeRefusal !== undefined)
        return {
          copied: runtimeRefusal + " in " + filePath,
        };
      htmlFiles[filePath] = fileText;
    } else {
      if (!projectState.publishedAsHeld(filePath, fileText))
        return {
          copied: "not published with the bytes the editor holds: " + filePath,
        };
      if (
        isProjectSourcePath(filePath) &&
        normalizeBlobAssetPaths(fileText) !== fileText
      )
        return {
          copied:
            'an uploaded file named as "_blob/" and not "/_blob/" in ' +
            filePath,
        };
    }
    if (PlatformFileContentWebpAvifPattern.test(filePath)) continue;
    let refusal: Dynamic = addressedArtboardRefusal(
      fileText,
      filePath,
      PreviewAddressedArtboardsPattern.test(filePath)
        ? projectDirectoryOf(filePath)
        : artboardDirectory,
      filePaths,
      filePathsKey,
    );
    if (refusal !== undefined)
      return {
        copied: refusal,
      };
  }
  let projectPathname: Dynamic = new URL(projectState.projectRoot).pathname,
    artboardPageUrl: Dynamic =
      projectState.projectRoot +
      artboardPath.split("/").map(encodeURIComponent).join("/");
  return {
    projectRoot: projectState.projectRoot,
    projectPath: projectPathname,
    pageUrl: artboardPageUrl,
    files: htmlFiles,
  };
}
function validateAddressedArtboard(
  files?: Dynamic,
  artboardPath?: Dynamic,
  builtProjectRoot?: Dynamic,
  projectState?: Dynamic,
): Dynamic {
  if (
    projectState.projectRoot !== undefined &&
    projectState.projectRoot !== builtProjectRoot &&
    !projectState.describes(builtProjectRoot)
  )
    return "the list of files no longer describes the version the artboard was built for, or a file did not load from it";
  let built: Dynamic = buildAddressedArtboard(files, artboardPath, projectState);
  return "copied" in built ? built.copied : undefined;
}
function addressedProjectState(): Dynamic {
  return {
    projectRoot: getCurrentPublishedProjectRoot(),
    publishedAsHeld: isFilePublishedWithMimeType,
    publishedAtAddress: isFilePublishedAtAddress,
    describes: describesPublishedRoot,
  };
}
function resolveAddressedArtboard(
  files?: Dynamic,
  artboardPath?: Dynamic,
  isEnabled?: Dynamic,
): Dynamic {
  return isEnabled
    ? buildAddressedArtboard(files, artboardPath, addressedProjectState())
    : {
        copied: "the flag is off",
      };
}
function addressedArtboardFailure(
  files?: Dynamic,
  artboardPath?: Dynamic,
  builtProjectRoot?: Dynamic,
): Dynamic {
  return validateAddressedArtboard(
    collectProjectDependencyFiles(files, artboardPath),
    artboardPath,
    builtProjectRoot,
    addressedProjectState(),
  );
}
function addressedArtboardCacheKey(isEnabled?: Dynamic): Dynamic {
  return isEnabled ? publishedProjectCacheKey() : "";
}
export {
  addressedArtboardCacheKey,
  addressedArtboardFailure,
  addressedArtboardRefusal,
  addressedProjectState,
  addressedRuntimeRefusal,
  buildAddressedArtboard,
  filterAddressedFiles,
  hasExactFileReference,
  HttpsProjectInvalidValue,
  isRequiredProjectFile,
  PreviewAddressedArtboardsCache,
  PreviewAddressedArtboardsHandler,
  PreviewAddressedArtboardsHtmlPattern,
  PreviewAddressedArtboardsPattern,
  PreviewAddressedArtboardsResolvedValue,
  PreviewAddressedArtboardsSupportPattern,
  PreviewAddressedArtboardsTest,
  projectReferenceTokens,
  referencesOutsideProject,
  resolveAddressedArtboard,
  resolveProjectReference,
  validateAddressedArtboard,
};
export function installPreviewAddressedArtboards(): () => void {
  return () => {
    PreviewAddressedArtboardsHtmlPattern = /\.dc\.html$/i;
    PreviewAddressedArtboardsPattern = /\.css$/i;
    PreviewAddressedArtboardsSupportPattern = /(^|\/)support\.js$/;
    PreviewAddressedArtboardsTest = (filePath?: Dynamic): Dynamic =>
      PreviewAddressedArtboardsHtmlPattern.test(filePath);
    PreviewAddressedArtboardsHandler = (
      text?: Dynamic,
      fileReference?: Dynamic,
    ): Dynamic =>
      hasExactFileReference(text, fileReference) ||
      (encodeURI(fileReference) !== fileReference &&
        hasExactFileReference(text, encodeURI(fileReference)));
    HttpsProjectInvalidValue = "https://project.invalid";
    PreviewAddressedArtboardsResolvedValue = HttpsProjectInvalidValue + "/p/";
    PreviewAddressedArtboardsCache = new Map();
  };
}
