/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { injected_wZt } from "../dependencies";
import { exportBabelStandaloneUrl } from "../export/standalone-html";
import { scriptPathPattern, imagePathPattern } from "./asset-rewriting";
import { getProjectFileDependencies } from "./component-imports";
import { collectProjectDependencyFiles, resolveComponentFile } from "./dependency-graph";
import { PreviewDependencyInjectionResolvedValue_2 as addressRefusedListenerScript, rewritePreviewAssets } from "./dependency-injection";
import { findHtmlTags, getHtmlAttribute, maskHtmlRawContent } from "./html-scanner";
import { getBabelFileUrl, inlineScriptHtml, previewAssetLoaderRuntimeScript, previewBlobBridgeRuntimeScript, previewDocumentRuntimeScript, previewEvaluationRuntimeScript, previewGuardRuntimeScript, previewResizeRuntimeScript, PreviewRuntimeLoadingResolvedValue as fontVariantLoaderScript, previewViewportRuntimeScript, selectRuntimeUrl, supportsBlobScripts } from "./runtime-loading";

var isSupportScriptSrc: Dynamic;
var defaultPartMinLength: Dynamic;
var framelessPreviewChromeHtml: Dynamic;
var previewDocumentCacheKey: Dynamic;
var TheArtboardRuntimeDidNotLoadMessage: Dynamic;
var runtimeBootCheckScript: Dynamic;
var linkedFilesBootCheckScript: Dynamic;
var previewCaptureScript: Dynamic;
var previewEvaluationScript: Dynamic;
var evaluationOnlyDocumentHtml: Dynamic;
function componentRuntimeDependencies(
  files?: Dynamic,
  artboardPath?: Dynamic,
  loadedPaths?: Dynamic,
  component?: Dynamic,
  coveredSheets?: Dynamic,
): Dynamic {
  let candidatePaths: Dynamic = Object.keys(files).filter(
    (filePath?: Dynamic): Dynamic =>
      !loadedPaths.has(filePath) &&
      !imagePathPattern.test(filePath),
  );
  if (
    candidatePaths.length === 0 ||
    getProjectFileDependencies(component.content, candidatePaths).length ===
      0
  )
    return {};
  let componentPath: Dynamic = resolveComponentFile(files, {
      ...component,
      kind: "html",
    }),
    filesWithComponent: Dynamic =
      componentPath != null
        ? {
            ...files,
            [componentPath]: component.content,
          }
        : files,
    dependencyFiles: Dynamic = {};
  for (let [filePath, fileText] of Object.entries(
    collectProjectDependencyFiles(filesWithComponent, artboardPath),
  ) as Dynamic)
    loadedPaths.has(filePath) ||
      imagePathPattern.test(filePath) ||
      (dependencyFiles[filePath] = filePath.endsWith(".dc.html")
        ? rewritePreviewAssets(
            fileText,
            files,
            filePath,
            filePath === artboardPath
              ? {}
              : {
                  covered: coveredSheets,
                },
          )
        : fileText);
  return dependencyFiles;
}
function prepareExportDcDocument(html?: Dynamic): Dynamic {
  return replaceRuntimeScriptTags(
    html,
    `<script src="./vendor/react.js"><\/script>
<script src="./vendor/react-dom.js"><\/script>
<script src="./support.js"><\/script>`,
  );
}
function replaceRuntimeScriptTags(
  html?: Dynamic,
  replacementHtml?: Dynamic,
  isRuntimeScriptSrc?: Dynamic,
): Dynamic {
  let maskedHtml: Dynamic = maskHtmlRawContent(html),
    findScriptRange: Dynamic = (matchesScript?: Dynamic): Dynamic => {
      for (let [tagStart, tagEnd] of findHtmlTags(
        maskedHtml,
        "script",
      ) as Dynamic) {
        let closingTag: Dynamic = /^\s*<\/script\s*>/i.exec(
          maskedHtml.slice(tagEnd, tagEnd + 64),
        );
        if (
          closingTag !== null &&
          matchesScript(
            getHtmlAttribute(html.slice(tagStart, tagEnd), "src"),
            tagStart,
          )
        )
          return [tagStart, tagEnd + closingTag[0].length];
      }
    },
    scriptRange: Dynamic =
      findScriptRange(isSupportScriptSrc) ??
      (isRuntimeScriptSrc
        ? findScriptRange(
            (src?: Dynamic, tagStart?: Dynamic): Dynamic =>
              src !== null && isRuntimeScriptSrc(src, tagStart),
          )
        : undefined),
    headTag: Dynamic = scriptRange
      ? undefined
      : findHtmlTags(maskedHtml, "head")[0];
  return scriptRange
    ? html.slice(0, scriptRange[0]) + replacementHtml + html.slice(scriptRange[1])
    : headTag
      ? html.slice(0, headTag[1]) +
        `
` +
        replacementHtml +
        html.slice(headTag[1])
      : "<!doctype html><html><head>" +
        replacementHtml +
        "</head><body>" +
        html +
        "</body></html>";
}
function buildPreviewDocument(
  files?: Dynamic,
  rootPath?: Dynamic,
  runtimeAssets?: Dynamic,
  inlinedSheetsSet?: Dynamic,
  buildOptions: Dynamic = {},
): Dynamic {
  let partMinLength: Dynamic =
    buildOptions.atAddress !== undefined
      ? 1 / 0
      : (buildOptions.partMin ?? defaultPartMinLength);
  if (files[rootPath] == null)
    throw new Error(`no such file in the document: ${rootPath}`);
  let partFiles: Dynamic = {},
    previewFiles: Dynamic =
      buildOptions.atAddress !== undefined
        ? {
            ...files,
          }
        : collectProjectDependencyFiles(files, rootPath),
    inlinedSheets: Dynamic = inlinedSheetsSet ?? new Set();
  inlinedSheets.clear();
  let sheetUrlMap: Dynamic = {},
    installedByAddress: Dynamic = {};
  previewFiles[rootPath] = rewritePreviewAssets(
    previewFiles[rootPath],
    previewFiles,
    rootPath,
    {
      inlined: inlinedSheets,
      parts: {
        min: partMinLength,
        out: partFiles,
        urlFor: buildOptions.sheetUrlFor,
        urls: sheetUrlMap,
      },
      ...(buildOptions.installedUrlFor
        ? {
            installedUrlFor: buildOptions.installedUrlFor,
            byAddress: installedByAddress,
          }
        : {}),
    },
  );
  for (let [filePath, fileText] of Object.entries(previewFiles) as Dynamic)
    !filePath.endsWith(".dc.html") ||
      filePath === rootPath ||
      (previewFiles[filePath] = rewritePreviewAssets(
        fileText,
        previewFiles,
        filePath,
        {
          covered: inlinedSheets,
        },
      ));
  let rootHtml: Dynamic = previewFiles[rootPath];
  if (
    !Object.entries(previewFiles).some(
      ([filePath, fileText]: Dynamic): Dynamic =>
        scriptPathPattern.test(filePath) ||
        (filePath.endsWith(".dc.html") &&
          /\bfetch\s*\(|\bXMLHttpRequest\b/.test(fileText)),
    )
  )
    for (let filePath of Object.keys(previewFiles) as Dynamic)
      imagePathPattern.test(filePath) &&
        delete previewFiles[filePath];
  let inlineFiles: Dynamic = {},
    linkedFileUrls: Dynamic = {};
  for (let [filePath, fileText] of Object.entries(previewFiles) as Dynamic) {
    let linkedUrl: Dynamic =
      fileText.length >= partMinLength ||
      filePath === rootPath ||
      filePath === "__proto__"
        ? undefined
        : buildOptions.fileUrlFor?.(filePath, fileText);
    fileText.length >= partMinLength
      ? (partFiles["file:" + filePath] = fileText)
      : linkedUrl !== undefined
        ? (linkedFileUrls[filePath] = linkedUrl)
        : (inlineFiles[filePath] = fileText);
  }
  // MineDesign: the artboard runtime loads Babel from this URL instead of the CDN the CSP blocks (getBabelFileUrl).
  let babelFile: Dynamic = getBabelFileUrl(),
    babelResources: Dynamic = babelFile
      ? ` window.__resources = ${JSON.stringify({ [exportBabelStandaloneUrl]: babelFile }).replace(/</g, "\\u003c")};`
      : "";
  let hasPartFiles: Dynamic = Object.keys(partFiles).length > 0,
    runtimeUrl: Dynamic = selectRuntimeUrl(runtimeAssets),
    addressedProject: Dynamic = buildOptions.atAddress,
    projectRootScript: Dynamic =
      addressedProject === undefined
        ? ""
        : "<script>window.__dcProjectRoot = " +
          JSON.stringify(addressedProject.projectRoot).replace(/</g, "\\u003c") +
          ";<\/script>" +
          inlineScriptHtml(
            addressRefusedListenerScript,
          ),
    headPrefixHtml: Dynamic =
      (addressedProject === undefined
        ? ""
        : '<base href="' +
          addressedProject.base
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;") +
          '">') +
      inlineScriptHtml(previewGuardRuntimeScript) +
      inlineScriptHtml(previewResizeRuntimeScript) +
      inlineScriptHtml(previewEvaluationRuntimeScript) +
      projectRootScript,
    runtimeHeadHtml: Dynamic = [
      ...(addressedProject === undefined
        ? [
            `<base href="/appifact/${rootPath.split("/").map(encodeURIComponent).join("/")}">`,
          ]
        : []),
      `<script>window.__dcFiles = ${JSON.stringify(inlineFiles).replace(/</g, "\\u003c")}; window.__dcRootPath = ${JSON.stringify(rootPath).replace(/</g, "\\u003c")};${babelResources}${hasPartFiles ? previewCaptureScript : ""}<\/script>`,
      ...Object.values(linkedFileUrls).map(
        (url?: Dynamic): Dynamic => `<script src="${url}"><\/script>`,
      ),
      ...(Object.keys(linkedFileUrls).length > 0
        ? [
            inlineScriptHtml(
              linkedFilesBootCheckScript(Object.keys(linkedFileUrls)),
            ),
          ]
        : []),
      inlineScriptHtml(
        previewBlobBridgeRuntimeScript +
          previewAssetLoaderRuntimeScript +
          previewViewportRuntimeScript +
          previewDocumentRuntimeScript,
      ),
      inlineScriptHtml(
        fontVariantLoaderScript,
      ),
      ...(runtimeUrl !== undefined
        ? [
            `<script src="${runtimeUrl}"><\/script>`,
            inlineScriptHtml(
              runtimeBootCheckScript,
            ),
          ]
        : ["reactUmd", "reactDomUmd", "supportJs"].map(
            (assetKey?: Dynamic): Dynamic =>
              inlineScriptHtml(runtimeAssets[assetKey]),
          )),
      ...(buildOptions.frameless ? [framelessPreviewChromeHtml] : []),
    ].join(`
`),
    documentHtml: Dynamic = replaceRuntimeScriptTags(rootHtml, runtimeHeadHtml),
    doctypeMatch: Dynamic = /^\s*<!doctype[^>]*>/i.exec(documentHtml);
  return {
    doc: doctypeMatch
      ? documentHtml.slice(0, doctypeMatch[0].length) +
        `
` +
        headPrefixHtml +
        documentHtml.slice(doctypeMatch[0].length)
      : headPrefixHtml +
        `
` +
        documentHtml,
    parts: partFiles,
    sheetUrls: sheetUrlMap,
    byAddress: installedByAddress,
  };
}
export {
  buildPreviewDocument,
  componentRuntimeDependencies,
  framelessPreviewChromeHtml,
  prepareExportDcDocument,
  defaultPartMinLength as PreviewBuildDocumentResolvedValue,
  runtimeBootCheckScript as PreviewBuildDocumentResolvedValue_2,
  evaluationOnlyDocumentHtml as PreviewBuildDocumentResolvedValue_3,
  previewDocumentCacheKey as PreviewBuildDocumentStringify,
  linkedFilesBootCheckScript as PreviewBuildDocumentStringify_2,
  isSupportScriptSrc as PreviewBuildDocumentTest,
  previewCaptureScript,
  previewEvaluationScript,
  replaceRuntimeScriptTags,
  TheArtboardRuntimeDidNotLoadMessage,
};
export function installPreviewBuildDocument(): () => void {
  return () => {
    isSupportScriptSrc = (src?: Dynamic): Dynamic =>
      src !== null &&
      /^(?:\.\/|\/)?support\.js$/.test(
        src
          .replace(/[\t\n\r]/g, "")
          .replace(/^[\x00-\x20]+|[\x00-\x20]+$/g, ""),
      );
    defaultPartMinLength = 64 * 1024;
    framelessPreviewChromeHtml =
      "<style>html,body{background:transparent!important}html[data-dc-frameless] .sc-logic-error{top:2px;left:auto;right:2px;width:10px;height:10px;max-width:none;padding:0;border-radius:5px;font-size:0;overflow:hidden}</style><script>document.documentElement.setAttribute('data-dc-frameless','')<\/script>";
    previewDocumentCacheKey = (cacheOptions?: Dynamic): Dynamic =>
      JSON.stringify([
        cacheOptions.partMin,
        cacheOptions.frameless,
        supportsBlobScripts(),
        selectRuntimeUrl(cacheOptions.assets) ?? null,
        cacheOptions.installed,
        cacheOptions.address ?? "",
      ]);
    TheArtboardRuntimeDidNotLoadMessage = "the artboard runtime did not load";
    runtimeBootCheckScript =
      "(function (s) { if (!window.React || !window.ReactDOM || typeof window.__dcUpdate !== 'function') { try { s = s && s.previousElementSibling; window.parent.postMessage({ __dc_boot_failed: 1, e: '" +
      TheArtboardRuntimeDidNotLoadMessage +
      "', u: s && s.getAttribute('src') }, '*'); } catch (e) {} } })(document.currentScript);";
    linkedFilesBootCheckScript = (linkedPaths?: Dynamic): Dynamic =>
      "(function (k, f) { for (var i = 0; i < k.length; i += 1) { if (!Object.prototype.hasOwnProperty.call(f, k[i])) { try { window.parent.postMessage({ __dc_boot_failed: 1, e: " +
      JSON.stringify(TheArtboardRuntimeDidNotLoadMessage) +
      " }, '*'); } catch (e) {} return; } } })(" +
      JSON.stringify(linkedPaths).replace(/</g, "\\u003c") +
      ", window.__dcFiles || {});";
    previewCaptureScript =
      " (function (p) { for (var k in p) { if (Object.prototype.hasOwnProperty.call(p, k) && k.indexOf('file:') === 0) window.__dcFiles[k.slice(5)] = p[k]; } document.addEventListener('DOMContentLoaded', function () { try { delete window.__dcParts; delete window.__dcPartBlobs; } catch (e) {} }); })(window.__dcParts || {});";
    previewEvaluationScript = injected_wZt;
    evaluationOnlyDocumentHtml =
      '<!doctype html><meta charset="utf-8">' +
      inlineScriptHtml(previewEvaluationScript);
  };
}
