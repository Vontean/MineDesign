/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { sendStaggeredAnalytics } from "../export/analytics";
import { isLoadingArtboardHtml } from "./design-document-adapter";
import { isArtboardFile } from "./file-content";

var DESIGN_OPEN_METRIC_EVENTS: Dynamic;
var DESIGN_SYSTEM_MID_USAGE_RATIO: Dynamic;
var DESIGN_SYSTEM_HIGH_USAGE_RATIO: Dynamic;
var NON_CONTENT_HTML_TAGS: Dynamic;
var OPAQUE_HTML_TAGS: Dynamic;
var MAX_TELEMETRY_TAGS: Dynamic;
var GLOBAL_COMPONENT_ATTRIBUTE_PATTERN: Dynamic;
var IMPORT_FROM_ATTRIBUTE_PATTERN: Dynamic;
var COMPONENT_BUNDLE_PATH_PATTERN: Dynamic;
var DESIGN_SYSTEM_METADATA_PATTERN: Dynamic;
var isAsciiLetterCode: Dynamic;
var isHtmlTagNameCode: Dynamic;
var lowercaseAsciiCode: Dynamic;
function findHtmlClosingTag(
  html?: Dynamic,
  tagName?: Dynamic,
  startOffset?: Dynamic,
): Dynamic {
  for (
    let closingTagOffset: Dynamic = startOffset;
    (closingTagOffset = html.indexOf("</", closingTagOffset)) !== -1;
    closingTagOffset += 2
  ) {
    let tagNameIndex: Dynamic = 0;
    for (
      ;
      tagNameIndex < tagName.length &&
      lowercaseAsciiCode(html.charCodeAt(closingTagOffset + 2 + tagNameIndex)) ===
        tagName.charCodeAt(tagNameIndex);

    )
      tagNameIndex++;
    if (
      tagNameIndex === tagName.length &&
      !isHtmlTagNameCode(html.charCodeAt(closingTagOffset + 2 + tagNameIndex))
    )
      return closingTagOffset;
  }
  return html.length;
}
function scanHtmlStartTags(html?: Dynamic, onTag?: Dynamic): Dynamic {
  let length: Dynamic = html.length,
    offset: Dynamic = 0;
  for (; (offset = html.indexOf("<", offset)) !== -1; ) {
    if (html.startsWith("!--", offset + 1)) {
      let commentEnd: Dynamic = html.indexOf("-->", offset + 4);
      offset = commentEnd === -1 ? length : commentEnd + 3;
      continue;
    }
    let tagNameEnd: Dynamic = offset + 1;
    if (tagNameEnd >= length || !isAsciiLetterCode(html.charCodeAt(tagNameEnd))) {
      offset = tagNameEnd;
      continue;
    }
    for (; tagNameEnd < length && isHtmlTagNameCode(html.charCodeAt(tagNameEnd)); )
      tagNameEnd++;
    let tagName: Dynamic = html.slice(offset + 1, tagNameEnd).toLowerCase(),
      tagEnd: Dynamic = tagNameEnd;
    for (let quoteCode: Dynamic = 0; tagEnd < length; tagEnd++) {
      let characterCode: Dynamic = html.charCodeAt(tagEnd);
      if (quoteCode !== 0) characterCode === quoteCode && (quoteCode = 0);
      else if (characterCode === 34 || characterCode === 39) quoteCode = characterCode;
      else if (characterCode === 62) break;
    }
    if (tagEnd >= length) return;
    NON_CONTENT_HTML_TAGS.has(tagName) ||
      onTag(tagName, html.slice(tagNameEnd, tagEnd));
    offset = tagEnd + 1;
    OPAQUE_HTML_TAGS.has(tagName) &&
      html.charCodeAt(tagEnd - 1) !== 47 &&
      (offset = findHtmlClosingTag(html, tagName, offset));
  }
}
function countDesignSystemImportTags(html?: Dynamic): Dynamic {
  let importCount: Dynamic = 0,
    contentTagCount: Dynamic = 0;
  scanHtmlStartTags(html, (tagName?: Dynamic, attributes?: Dynamic): Dynamic => {
    contentTagCount++;
    if (tagName !== "x-import") return;
    let normalizedAttributes: Dynamic = attributes.replace(/'[^']*'/g, "''"),
      componentMatch: Dynamic = GLOBAL_COMPONENT_ATTRIBUTE_PATTERN.exec(normalizedAttributes);
    componentMatch &&
      componentMatch[1].includes(".") &&
      !componentMatch[1].includes("{{") &&
      !IMPORT_FROM_ATTRIBUTE_PATTERN.test(normalizedAttributes.replace(/"[^"]*"/g, '""')) &&
      importCount++;
  });
  return {
    mounts: importCount,
    elements: contentTagCount,
  };
}
function classifyDesignSystemUsage(
  imports?: Dynamic,
  contentTags?: Dynamic,
): Dynamic {
  let ratio: Dynamic = contentTags > 0 ? imports / contentTags : 0;
  return ratio >= DESIGN_SYSTEM_HIGH_USAGE_RATIO
    ? "high"
    : ratio >= DESIGN_SYSTEM_MID_USAGE_RATIO
      ? "mid"
      : "low";
}
function computeDesignOpenMetricEvents({
  files: files,
  published: published,
  designSystems: designSystems,
}: Dynamic): Dynamic {
  let events: Dynamic = [DESIGN_OPEN_METRIC_EVENTS.opened];
  designSystems > 0 && events.push(DESIGN_OPEN_METRIC_EVENTS.tokens);
  [
    ...Object.keys(files).filter(
      (filePath?: Dynamic): Dynamic => !isArtboardFile(filePath),
    ),
    ...published,
  ].some(
    (filePath?: Dynamic): Dynamic =>
      COMPONENT_BUNDLE_PATH_PATTERN.test(filePath) ||
      DESIGN_SYSTEM_METADATA_PATTERN.test(filePath),
  ) && events.push(DESIGN_OPEN_METRIC_EVENTS.bundle);
  let importCount: Dynamic = 0,
    contentTagCount: Dynamic = 0;
  for (let [filePath, fileHtml] of Object.entries(files) as Dynamic) {
    if (
      !isArtboardFile(filePath) ||
      isLoadingArtboardHtml(fileHtml)
    )
      continue;
    let counts: Dynamic = countDesignSystemImportTags(fileHtml);
    importCount += counts.mounts;
    contentTagCount += counts.elements;
  }
  importCount > 0 &&
    events.push(
      DESIGN_OPEN_METRIC_EVENTS.use[classifyDesignSystemUsage(importCount, contentTagCount)],
    );
  return events;
}
function whenDocumentLive(doc?: Dynamic, onLive?: Dynamic): Dynamic {
  if (doc.loadState() === "live") return onLive();
  let fired: Dynamic = false,
    unsubscribe: Dynamic = doc.subscribeLoad((): Dynamic => {
      fired ||
        doc.loadState() !== "live" ||
        ((fired = true), unsubscribe(), onLive());
    });
}
function whenPublishedBoardsReady(
  doc?: Dynamic,
  onReady?: Dynamic,
  timeoutMs: Dynamic = 1e4,
  browserRuntime: Dynamic = globalThis,
): Dynamic {
  let callSafely: Dynamic = (): Dynamic => {
    try {
      onReady();
    } catch {}
  };
  whenDocumentLive(doc, (): Dynamic => {
    let didNotify: Dynamic = false,
      unsubscribe: Dynamic = (): Dynamic => {},
      readyTimer: Dynamic,
      fallbackTimer: Dynamic,
      notifyReady: Dynamic = (): Dynamic => {
        didNotify ||
          ((didNotify = true),
          unsubscribe(),
          browserRuntime.clearTimeout(readyTimer),
          browserRuntime.clearTimeout(fallbackTimer),
          typeof browserRuntime.requestIdleCallback == "function"
            ? browserRuntime.requestIdleCallback(callSafely, {
                timeout: timeoutMs,
              })
            : browserRuntime.setTimeout(callSafely, 0));
      },
      readArtboardReadiness: Dynamic = (): Dynamic => {
        try {
          let hasArtboards: Dynamic = false;
          for (let [filePath, fileHtml] of Object.entries(
            doc.content().files,
          ) as Dynamic)
            if (isArtboardFile(filePath)) {
              if (isLoadingArtboardHtml(fileHtml))
                return "loading";
              hasArtboards = true;
            }
          return hasArtboards ? "in" : "none";
        } catch {
          return "in";
        }
      },
      scheduleReadinessCheck: Dynamic = (readyDelayMs?: Dynamic): Dynamic => {
        if (didNotify) return;
        browserRuntime.clearTimeout(readyTimer);
        let readiness: Dynamic = readArtboardReadiness();
        readiness !== "none" &&
          ((fallbackTimer ??= browserRuntime.setTimeout(notifyReady, timeoutMs)),
          (readyTimer =
            readiness === "in"
              ? browserRuntime.setTimeout(notifyReady, readyDelayMs)
              : undefined));
      };
    unsubscribe = doc.subscribe((): Dynamic => scheduleReadinessCheck(MAX_TELEMETRY_TAGS));
    scheduleReadinessCheck(0);
  });
}
function reportDesignOpened(
  doc?: Dynamic,
  openOptions?: Dynamic,
  published?: Dynamic,
  designSystems?: Dynamic,
  browserRuntime: Dynamic = globalThis,
): Dynamic {
  try {
    if (!openOptions.canWrite || openOptions.capture || openOptions.embedded) return;
    whenPublishedBoardsReady(
      doc,
      (): Dynamic =>
        sendStaggeredAnalytics(
          computeDesignOpenMetricEvents({
            files: doc.content().files,
            ...published(),
          }),
          designSystems,
          browserRuntime,
        ),
      undefined,
      browserRuntime,
    );
  } catch {}
}
export {
  classifyDesignSystemUsage,
  COMPONENT_BUNDLE_PATH_PATTERN,
  computeDesignOpenMetricEvents,
  countDesignSystemImportTags,
  DESIGN_OPEN_METRIC_EVENTS,
  DESIGN_SYSTEM_HIGH_USAGE_RATIO,
  DESIGN_SYSTEM_METADATA_PATTERN,
  DESIGN_SYSTEM_MID_USAGE_RATIO,
  findHtmlClosingTag,
  GLOBAL_COMPONENT_ATTRIBUTE_PATTERN,
  IMPORT_FROM_ATTRIBUTE_PATTERN,
  isAsciiLetterCode,
  isHtmlTagNameCode,
  lowercaseAsciiCode,
  MAX_TELEMETRY_TAGS,
  NON_CONTENT_HTML_TAGS,
  OPAQUE_HTML_TAGS,
  reportDesignOpened,
  scanHtmlStartTags,
  whenDocumentLive,
  whenPublishedBoardsReady,
};
export function installPlatformDesignMetrics(): () => void {
  return () => {
    DESIGN_OPEN_METRIC_EVENTS = {
      opened: "frame_design_opened",
      tokens: "frame_design_ds_tokens",
      bundle: "frame_design_ds_bundle",
      use: {
        low: "frame_design_ds_use_low",
        mid: "frame_design_ds_use_mid",
        high: "frame_design_ds_use_high",
      },
    };
    DESIGN_SYSTEM_MID_USAGE_RATIO = 0.1;
    DESIGN_SYSTEM_HIGH_USAGE_RATIO = 0.3;
    NON_CONTENT_HTML_TAGS = new Set([
      "html",
      "head",
      "body",
      "x-dc",
      "link",
      "meta",
      "title",
      "base",
      "br",
      "wbr",
      "script",
      "style",
      "helmet",
    ]);
    OPAQUE_HTML_TAGS = new Set(["script", "style", "helmet", "svg"]);
    MAX_TELEMETRY_TAGS = 2e3;
    GLOBAL_COMPONENT_ATTRIBUTE_PATTERN =
      /\scomponent-from-global-scope\s*=\s*"([^"]*)"/i;
    IMPORT_FROM_ATTRIBUTE_PATTERN = /\sfrom\s*=/i;
    COMPONENT_BUNDLE_PATH_PATTERN =
      /(?:^|[-/])components\.m?js$|(?:^|\/)ds\/[^/]+\/.+\.m?js$/i;
    DESIGN_SYSTEM_METADATA_PATTERN = /(?:^|\/)design-system\.json$/i;
    isAsciiLetterCode = (characterCode?: Dynamic): Dynamic =>
      (characterCode | 32) >= 97 && (characterCode | 32) <= 122;
    isHtmlTagNameCode = (characterCode?: Dynamic): Dynamic =>
      isAsciiLetterCode(characterCode) || (characterCode >= 48 && characterCode <= 57) || characterCode === 45;
    lowercaseAsciiCode = (characterCode?: Dynamic): Dynamic =>
      characterCode >= 65 && characterCode <= 90 ? characterCode + 32 : characterCode;
  };
}
