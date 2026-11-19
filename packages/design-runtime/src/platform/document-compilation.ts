/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { buildColorModeScript, cdsRootAttributes } from "./document-theme";

var documentDataElementId: Dynamic;
var documentAppElementId: Dynamic;
var documentStyleElementId: Dynamic;
var documentModeElementId: Dynamic;
var emulatorShimMetaName: Dynamic;
var capabilityMetaName: Dynamic;
var defaultCapabilitiesJson: Dynamic;
var maxCompiledDocumentBytes: Dynamic;
var deferThumbnailAttribute: Dynamic;
var DbValue: Dynamic;
function emulatorBuildMetaName(): Dynamic {
  return ["appifact", "emulator", "build"].join("-");
}
function escapeHtmlAttribute(attribute?: Dynamic): Dynamic {
  return attribute
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
}
function escapeHtmlComment(comment?: Dynamic): Dynamic {
  return comment
    .replaceAll("-->", "--\u200B>")
    .replaceAll("--!>", "--\u200B!>");
}
function safeInlineJson(jsonValue?: Dynamic): Dynamic {
  return JSON.stringify(jsonValue).replaceAll("<", "\\u003c");
}
function buildDocumentHtmlAttributes(serializedCapabilities?: Dynamic): Dynamic {
  return (
    'lang="en" ' +
    cdsRootAttributes +
    (hasDatabaseCapability(serializedCapabilities) ? " " + deferThumbnailAttribute : "")
  );
}
function compileArtifactDocument(
  pageParts?: Dynamic,
  serializedDocument?: Dynamic,
): Dynamic {
  return [
    "<!doctype html>",
    "<html " +
      buildDocumentHtmlAttributes(
        pageParts.capabilities ?? defaultCapabilitiesJson,
      ) +
      ">",
    "<head>",
    '<meta charset="utf-8">',
    "<title>" + escapeHtmlAttribute(pageParts.title) + "</title>",
    "<\!-- README",
    escapeHtmlComment(pageParts.readme),
    "-->",
    '<meta name="README" content="' +
      escapeHtmlAttribute(pageParts.readmeMeta) +
      '">',
    '<meta name="' +
      capabilityMetaName +
      '" content="' +
      escapeHtmlAttribute(pageParts.capabilities ?? defaultCapabilitiesJson) +
      '">',
    ...(pageParts.emulator
      ? [
          '<meta name="' +
            emulatorBuildMetaName() +
            '" content="unshippable">',
        ]
      : []),
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<script id="' +
      documentModeElementId +
      '">' +
      buildColorModeScript(pageParts.colorMode) +
      "<\/script>",
    ...(pageParts.emulator && pageParts.emulatorShim !== undefined
      ? [
          '<script id="' + emulatorShimMetaName + '">',
          pageParts.emulatorShim,
          "<\/script>",
        ]
      : []),
    '<style id="' + documentStyleElementId + '">',
    pageParts.css,
    "</style>",
    "</head>",
    "<body>",
    '<div id="root"></div>',
    ...(serializedDocument !== undefined
      ? [
          '<script type="application/json" id="' +
            documentDataElementId +
            '">',
          serializedDocument,
          "<\/script>",
        ]
      : []),
    '<script id="' + documentAppElementId + '">',
    pageParts.js,
    "<\/script>",
    "</body>",
    "</html>",
    "",
  ].join(`
`);
}
function readEmbeddedDocument(document?: Dynamic): Dynamic {
  let dataElement: Dynamic = document.getElementById(documentDataElementId);
  if (dataElement)
    try {
      return JSON.parse(dataElement.textContent ?? "");
    } catch {
      return;
    }
}
function readCompiledPageParts(document?: Dynamic): Dynamic {
  let scriptElement: Dynamic = document.getElementById(documentAppElementId),
    styleElement: Dynamic = document.getElementById(documentStyleElementId);
  if (!scriptElement || !styleElement)
    throw new Error(
      "page anatomy missing (#" +
        documentAppElementId +
        " / #" +
        documentStyleElementId +
        ") \u2014 this page was not assembled by the appifact compile step, so it cannot safely re-render itself.",
    );
  let readme: Dynamic = "";
  for (let headNode of Array.from(document.head.childNodes) as Dynamic)
    if (headNode.nodeType === 8) {
      let commentText: Dynamic = headNode.data;
      if (
        commentText.startsWith(` README
`) &&
        commentText.endsWith(`
`)
      ) {
        readme = commentText.slice(8, -1);
        break;
      }
    }
  let readmeMeta: Dynamic =
      document.querySelector('meta[name="README"]')?.getAttribute("content") ??
      "",
    isEmulator: Dynamic =
      document.querySelector(
        'meta[name="' + emulatorBuildMetaName() + '"]',
      ) !== null,
    emulatorShimElement: Dynamic = document.getElementById(emulatorShimMetaName),
    trimSurroundingNewlines: Dynamic = (sourceText?: Dynamic): Dynamic => {
      let text: Dynamic = sourceText ?? "";
      return text.startsWith(`
`) &&
        text.endsWith(`
`)
        ? text.slice(1, -1)
        : text;
    },
    serializedCapabilities: Dynamic =
      document
        .querySelector('meta[name="' + capabilityMetaName + '"]')
        ?.getAttribute("content") ?? defaultCapabilitiesJson,
    colorModeScript: Dynamic =
      document.getElementById(documentModeElementId)?.textContent ?? "",
    explicitColorMode: Dynamic = ["light", "dark"].find(
      (mode?: Dynamic): Dynamic =>
        colorModeScript === buildColorModeScript(mode),
    );
  return {
    title: document.querySelector("title")?.textContent ?? "",
    capabilities: serializedCapabilities,
    readme: readme,
    readmeMeta: readmeMeta,
    css: trimSurroundingNewlines(styleElement.textContent),
    js: trimSurroundingNewlines(scriptElement.textContent),
    emulator: isEmulator,
    emulatorShim: isEmulator && emulatorShimElement ? trimSurroundingNewlines(emulatorShimElement.textContent) : undefined,
    ...(explicitColorMode !== undefined
      ? {
          colorMode: explicitColorMode,
        }
      : {}),
  };
}
function detectDocumentStorageMode(document?: Dynamic): Dynamic {
  let serializedCapabilities: Dynamic =
    document
      .querySelector('meta[name="' + capabilityMetaName + '"]')
      ?.getAttribute("content") ?? "";
  return hasDatabaseCapability(serializedCapabilities)
    ? "db"
    : document.getElementById(documentDataElementId) !== null
      ? "page"
      : "files";
}
function hasDatabaseCapability(serializedCapabilities?: Dynamic): Dynamic {
  try {
    let capabilities: Dynamic = JSON.parse(serializedCapabilities);
    return (
      typeof capabilities == "object" &&
      capabilities !== null &&
      Object.hasOwn(capabilities, DbValue)
    );
  } catch {
    return false;
  }
}
export {
  buildDocumentHtmlAttributes,
  capabilityMetaName,
  compileArtifactDocument,
  DbValue,
  defaultCapabilitiesJson,
  deferThumbnailAttribute,
  detectDocumentStorageMode,
  documentAppElementId,
  documentDataElementId,
  documentModeElementId,
  documentStyleElementId,
  emulatorBuildMetaName,
  emulatorShimMetaName,
  escapeHtmlAttribute,
  escapeHtmlComment,
  hasDatabaseCapability,
  maxCompiledDocumentBytes,
  readCompiledPageParts,
  readEmbeddedDocument,
  safeInlineJson,
};
export function installPlatformDocumentCompilation(): () => void {
  return () => {
    documentDataElementId = "appifact-doc";
    documentAppElementId = "appifact-app";
    documentStyleElementId = "appifact-style";
    documentModeElementId = "appifact-mode";
    emulatorShimMetaName = ["appifact", "emulator", "shim"].join("-");
    capabilityMetaName = "appifact-capabilities";
    defaultCapabilitiesJson = '{"self":{}}';
    maxCompiledDocumentBytes = 16 * 1024 * 1024;
    deferThumbnailAttribute = "data-thumb-defer";
    DbValue = "db";
  };
}
