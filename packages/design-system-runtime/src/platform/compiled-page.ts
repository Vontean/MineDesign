import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { colorModeBootstrapScript, rootHtmlAttributes } from "../ui/color-mode";

var compiledPageDocumentId: string;
var compiledPageAppId: string;
var compiledPageStyleId: string;
var compiledPageModeId: string;
var emulatorShimId: string;
var compiledPageCapabilitiesMetaName: string;
var defaultCompiledPageCapabilities: string;
var compiledPageMaxBytes: number;
var thumbnailDeferAttribute: string;
var databaseCapabilityKey: string;
function emulatorBuildMetaName(): string {
  return ["appifact", "emulator", "build"].join("-");
}
function escapePageHtmlAttribute(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
}
function escapeHtmlComment(text: string): string {
  return text.replaceAll("-->", "--​>").replaceAll("--!>", "--​!>");
}
function stringifyInlineJson(documentData: unknown): string {
  return JSON.stringify(documentData).replaceAll("<", "\\u003c");
}
function compiledPageHtmlAttributes(capabilities: string): string {
  return (
    'lang="en" ' +
    rootHtmlAttributes +
    (capabilitiesUseDatabase(capabilities)
      ? " " + thumbnailDeferAttribute
      : "")
  );
}
function assembleCompiledPage(
  page: Host.CompiledPage,
  appScript?: string,
): string {
  return [
    "<!doctype html>",
    "<html " +
      compiledPageHtmlAttributes(
        page.capabilities ?? defaultCompiledPageCapabilities,
      ) +
      ">",
    "<head>",
    '<meta charset="utf-8">',
    "<title>" + escapePageHtmlAttribute(page.title) + "</title>",
    "<\!-- README",
    escapeHtmlComment(page.readme),
    "-->",
    '<meta name="README" content="' +
      escapePageHtmlAttribute(page.readmeMeta) +
      '">',
    '<meta name="' +
      compiledPageCapabilitiesMetaName +
      '" content="' +
      escapePageHtmlAttribute(
        page.capabilities ?? defaultCompiledPageCapabilities,
      ) +
      '">',
    ...(page.emulator
      ? [
          '<meta name="' +
            emulatorBuildMetaName() +
            '" content="unshippable">',
        ]
      : []),
    '<meta name="viewport" content="width=device-width, initial-scale=1">',
    '<script id="' +
      compiledPageModeId +
      '">' +
      colorModeBootstrapScript(page.colorMode) +
      "<\/script>",
    ...(page.emulator && page.emulatorShim !== undefined
      ? [
          '<script id="' + emulatorShimId + '">',
          page.emulatorShim,
          "<\/script>",
        ]
      : []),
    '<style id="' + compiledPageStyleId + '">',
    page.css,
    "</style>",
    "</head>",
    "<body>",
    '<div id="root"></div>',
    ...(appScript !== undefined
      ? [
          '<script type="application/json" id="' +
            compiledPageDocumentId +
            '">',
          appScript,
          "<\/script>",
        ]
      : []),
    '<script id="' + compiledPageAppId + '">',
    page.js,
    "<\/script>",
    "</body>",
    "</html>",
    "",
  ].join(`
`);
}
function readCompiledPageDocument(pageDocument: Document): unknown {
  let value = pageDocument.getElementById(compiledPageDocumentId);
  if (!value) {
    return;
  }
  try {
    return JSON.parse(value.textContent ?? "");
  } catch {
    return;
  }
}
function readCompiledPageAnatomy(pageDocument: Document): Host.CompiledPage {
  let appScript = pageDocument.getElementById(compiledPageAppId),
    styleSheet = pageDocument.getElementById(compiledPageStyleId);
  if (!appScript || !styleSheet) {
    throw Error(
      "page anatomy missing (#" +
        compiledPageAppId +
        " / #" +
        compiledPageStyleId +
        ") — this page was not assembled by the appifact compile step, " +
        "so it cannot safely re-render itself.",
    );
  }
  let text = "";
  for (let node of Array.from(pageDocument.head.childNodes)) {
    if (node.nodeType === 8) {
      let data = (node as Comment).data;
      if (
        data.startsWith(` README
`) &&
        data.endsWith(`
`)
      ) {
        text = data.slice(8, -1);
        break;
      }
    }
  }
  let readmeMeta =
      pageDocument
        .querySelector('meta[name="README"]')
        ?.getAttribute("content") ?? "",
    emulator: boolean =
      pageDocument.querySelector(
        'meta[name="' + emulatorBuildMetaName() + '"]',
      ) !== null,
    emulatorShim = pageDocument.getElementById(emulatorShimId),
    trimWrapperNewlines = (textContent: string | null) => {
      let source = textContent ?? "";
      if (
        source.startsWith(`
`) &&
        source.endsWith(`
`)
      ) {
        return source.slice(1, -1);
      } else {
        return source;
      }
    },
    capabilities =
      pageDocument
        .querySelector(
          'meta[name="' + compiledPageCapabilitiesMetaName + '"]',
        )
        ?.getAttribute("content") ?? defaultCompiledPageCapabilities,
    colorModeSource = pageDocument.getElementById(compiledPageModeId)?.textContent ?? "",
    colorMode = (["light", "dark"] as const).find(
      (mode): boolean =>
        colorModeSource === colorModeBootstrapScript(mode),
    );
  return {
    title: pageDocument.querySelector("title")?.textContent ?? "",
    capabilities: capabilities,
    readme: text,
    readmeMeta: readmeMeta,
    css: trimWrapperNewlines(styleSheet.textContent),
    js: trimWrapperNewlines(appScript.textContent),
    emulator: emulator,
    emulatorShim: emulator && emulatorShim ? trimWrapperNewlines(emulatorShim.textContent) : undefined,
    ...(colorMode !== undefined
      ? {
          colorMode: colorMode,
        }
      : {}),
  };
}
function detectCompiledPageStorageMode(
  pageDocument: Document,
): "db" | "page" | "files" {
  let value =
    pageDocument
      .querySelector('meta[name="' + compiledPageCapabilitiesMetaName + '"]')
      ?.getAttribute("content") ?? "";
  if (capabilitiesUseDatabase(value)) {
    return "db";
  }
  if (pageDocument.getElementById(compiledPageDocumentId) !== null) {
    return "page";
  } else {
    return "files";
  }
}
function capabilitiesUseDatabase(capabilities: string): boolean {
  try {
    let value: unknown = JSON.parse(capabilities);
    return (
      typeof value === "object" &&
      value !== null &&
      Object.hasOwn(value, databaseCapabilityKey)
    );
  } catch {
    return false;
  }
}
function truncateUtf16Safely(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  let value = text.slice(0, maxLength),
    lastCodeUnit = value.charCodeAt(value.length - 1);
  if (lastCodeUnit >= 55296 && lastCodeUnit <= 56319) {
    return value.slice(0, -1);
  } else {
    return value;
  }
}
export {
  assembleCompiledPage,
  capabilitiesUseDatabase,
  compiledPageAppId,
  compiledPageCapabilitiesMetaName,
  compiledPageDocumentId,
  compiledPageHtmlAttributes,
  compiledPageMaxBytes,
  compiledPageModeId,
  compiledPageStyleId,
  databaseCapabilityKey,
  defaultCompiledPageCapabilities,
  detectCompiledPageStorageMode,
  emulatorBuildMetaName,
  emulatorShimId,
  escapeHtmlComment,
  escapePageHtmlAttribute,
  readCompiledPageAnatomy,
  readCompiledPageDocument,
  stringifyInlineJson,
  thumbnailDeferAttribute,
  truncateUtf16Safely,
};
export function installPlatformCompiledPage(): () => void {
  return () => {
    compiledPageDocumentId = "appifact-doc";
    compiledPageAppId = "appifact-app";
    compiledPageStyleId = "appifact-style";
    compiledPageModeId = "appifact-mode";
    emulatorShimId = ["appifact", "emulator", "shim"].join("-");
    compiledPageCapabilitiesMetaName = "appifact-capabilities";
    defaultCompiledPageCapabilities = '{"self":{}}';
    compiledPageMaxBytes = 16777216;
    thumbnailDeferAttribute = "data-thumb-defer";
    databaseCapabilityKey = "db";
  };
}
