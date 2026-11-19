import type { OwnedBytes } from "../contracts/export";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { expandSelfClosingImports, isDcHtmlDocument } from "../editor/html/dc-document";
import { escapeHtml } from "../editor/html/escaping";
import { encodeCamelCaseAttributes, HtmlTagNormalizationSelectTableTbodyConfig } from "../editor/html/tag-normalization";
import { gzipExportAsset, verifyExportAssetIntegrity } from "./compression-integrity";
import { escapeExportScriptClosingTags, escapeExportStyleClosingTag, inlineExportCssAssetUrls, inlineExportCssImports, replaceCssAssetUrlsWithIds } from "./css-assets";
import { standaloneExportBootstrapScript } from "./standalone-bootstrap";

var safeExportColorPattern: Dynamic;
var designSystemBaseFilename: Dynamic;
var exportReactUmdUrl: Dynamic;
var exportReactUmdIntegrity: Dynamic;
var exportReactDomUmdUrl: Dynamic;
var exportReactDomUmdIntegrity: Dynamic;
var exportBabelStandaloneUrl: Dynamic;
var exportBabelStandaloneIntegrity: Dynamic;
var alreadyCompressedExportMimeTypes: Dynamic;
var maxCssImportDepth: Dynamic;
var maxEmbeddedExportDepth: Dynamic;
var jsxAssetFilenamePattern: Dynamic;
var mimeTypePattern: Dynamic;
var exportAssetUuidPattern: Dynamic;
var imageSlotsStateFilename: Dynamic;
var projectServeUrlPattern: Dynamic;
var projectServeAccessTokenPattern: Dynamic;
var designSystemAssetPathPattern: Dynamic;
var invalidExportAssetPathSegmentsPattern: Dynamic;
function sanitizeExportColor(color?: Dynamic, fallback?: Dynamic): Dynamic {
  let value: Dynamic = (color ?? "").trim();
  return safeExportColorPattern.test(value) ? value : fallback;
}
function maskJavaScriptCommentsAndStrings(source?: Dynamic): Dynamic {
  let isInBlockComment: Dynamic = false,
    inTemplateLiteral: Dynamic = false,
    sourceLines: Dynamic = source.split(`
`);
  for (let lineIndex: Dynamic = 0; lineIndex < sourceLines.length; lineIndex++) {
    let line: Dynamic = sourceLines[lineIndex],
      maskedLine: Dynamic = new Array(line.length).fill(" "),
      quoteEndByStart: Dynamic = new Map(),
      quote: Dynamic = null,
      quoteStartIndex: Dynamic = -1,
      cursor: Dynamic = 0;
    for (; cursor < line.length; ) {
      let character: Dynamic = line[cursor],
        nextCharacter: Dynamic = line[cursor + 1];
      if (isInBlockComment) {
        if (character === "*" && nextCharacter === "/") {
          isInBlockComment = false;
          cursor += 2;
          continue;
        }
        cursor++;
        continue;
      }
      if (inTemplateLiteral) {
        if (character === "\\") {
          cursor += 2;
          continue;
        }
        character === "`" && (inTemplateLiteral = false);
        cursor++;
        continue;
      }
      if (quote != null) {
        if (character === "\\") {
          cursor += 2;
          continue;
        }
        character === quote &&
          ((maskedLine[cursor] = character),
          quoteEndByStart.set(quoteStartIndex, cursor),
          (quote = null));
        cursor++;
        continue;
      }
      if (character === "'" || character === '"') {
        maskedLine[cursor] = character;
        quote = character;
        quoteStartIndex = cursor;
        cursor++;
        continue;
      }
      if (character === "`") {
        inTemplateLiteral = true;
        cursor++;
        continue;
      }
      if (character === "/" && nextCharacter === "/") break;
      if (character === "/" && nextCharacter === "*") {
        isInBlockComment = true;
        cursor += 2;
        continue;
      }
      maskedLine[cursor] = character;
      cursor++;
    }
    let maskedSource: Dynamic = maskedLine.join(""),
      basePattern: Dynamic = /const\s+base\s*=\s*(['"])/g,
      baseMatch: Dynamic;
    for (; (baseMatch = basePattern.exec(maskedSource)) != null; ) {
      let prefix: Dynamic = maskedSource.slice(0, baseMatch.index);
      if (!(/^\s*$/.test(prefix) || /[;{}]\s*$/.test(prefix))) continue;
      let quoteStart: Dynamic = baseMatch.index + baseMatch[0].length - 1,
        entry: Dynamic = quoteEndByStart.get(quoteStart);
      if (entry != null)
        return {
          lineIndex: lineIndex,
          value: line.slice(quoteStart + 1, entry),
          quoteStart: quoteStart,
          quoteEnd: entry,
          quote: baseMatch[1],
        };
    }
  }
  return null;
}
function encodeBinaryBase64(bytes: Uint8Array | ArrayBuffer): string {
  let value = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes),
    text = "";
  for (let index = 0; index < value.length; index += 32768)
    text += String.fromCharCode(...value.subarray(index, index + 32768));
  return btoa(text);
}
function decodeBinaryBase64(base64: string): OwnedBytes {
  let value = atob(base64),
    bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index++)
    bytes[index] = value.charCodeAt(index);
  return bytes;
}
function formatExportByteSize(
  bytes?: Dynamic,
  formatOptions: Dynamic = {},
): Dynamic {
  let {
      decimals: value = 1,
      ceil: ceil = false,
      binary: binary = false,
    }: Dynamic = formatOptions,
    unit: Dynamic = 1024 * 1024;
  if (bytes >= unit) {
    let precisionBase: Dynamic = 10 ** value;
    return `${(ceil ? Math.ceil((bytes / unit) * precisionBase) / precisionBase : bytes / unit).toFixed(value)} ${binary ? "MiB" : "MB"}`;
  }
  if (bytes >= 1024) {
    let kibibytes: Dynamic = bytes / 1024;
    return `${ceil ? Math.ceil(kibibytes) : Math.round(kibibytes)} ${binary ? "KiB" : "KB"}`;
  }
  return `${bytes} B`;
}
function hasCompressedFileSignature(bytes?: Dynamic): Dynamic {
  if (bytes.length < 12) return false;
  let value: Dynamic = bytes;
  return (
    (value[0] === 137 &&
      value[1] === 80 &&
      value[2] === 78 &&
      value[3] === 71) ||
    (value[0] === 255 && value[1] === 216 && value[2] === 255) ||
    (value[0] === 71 &&
      value[1] === 73 &&
      value[2] === 70 &&
      value[3] === 56) ||
    (value[0] === 82 &&
      value[1] === 73 &&
      value[2] === 70 &&
      value[3] === 70) ||
    (value[0] === 119 && value[1] === 79 && value[2] === 70) ||
    (value[0] === 31 && value[1] === 139) ||
    (value[0] === 80 && value[1] === 75) ||
    (value[0] === 79 &&
      value[1] === 103 &&
      value[2] === 103 &&
      value[3] === 83) ||
    (value[0] === 26 &&
      value[1] === 69 &&
      value[2] === 223 &&
      value[3] === 163) ||
    (value[0] === 73 && value[1] === 68 && value[2] === 51) ||
    (value[0] === 255 && (value[1] & 224) === 224) ||
    (value[4] === 102 &&
      value[5] === 116 &&
      value[6] === 121 &&
      value[7] === 112)
  );
}
function parseImageSlotState(bytes?: Dynamic): Dynamic {
  let value: Dynamic;
  try {
    value = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
  if (value === null || typeof value != "object" || Array.isArray(value))
    return null;
  let entries: Dynamic = new Map();
  for (let [key, slot] of Object.entries(value) as Dynamic) {
    let imageSource: Dynamic =
      typeof slot == "string"
        ? slot
        : slot !== null &&
            typeof slot == "object" &&
            "u" in slot &&
            typeof slot.u == "string"
          ? slot.u
          : null;
    imageSource !== null &&
      /^data:image\//i.test(imageSource) &&
      entries.set(key, imageSource);
  }
  return entries;
}
function parseExportSrcset(srcset?: Dynamic): Dynamic {
  let items: Dynamic = [],
    index: Dynamic = 0,
    length: Dynamic = srcset.length,
    callback: Dynamic = (character?: Dynamic): Dynamic =>
      character === " " ||
      character === "	" ||
      character ===
        `
` ||
      character === "\r" ||
      character === "\f";
  for (; index < length; ) {
    for (
      ;
      index < length && (callback(srcset[index]) || srcset[index] === ",");

    )
      index++;
    if (index >= length) break;
    let value: Dynamic = index;
    for (; index < length && !callback(srcset[index]); ) index++;
    let candidate: Dynamic = srcset.slice(value, index);
    if (candidate.endsWith(",")) {
      for (; candidate.endsWith(","); ) candidate = candidate.slice(0, -1);
      candidate && items.push(candidate);
      continue;
    }
    for (; index < length && callback(srcset[index]); ) index++;
    let itemStart: Dynamic = index;
    for (; index < length && srcset[index] !== ","; ) index++;
    let descriptor: Dynamic = srcset.slice(itemStart, index).trim();
    items.push(descriptor ? `${candidate} ${descriptor}` : candidate);
  }
  return items;
}
function normalizeExportHtmlOutsideScripts(html?: Dynamic): Dynamic {
  return html
    .split(/(<script\b[^>]*>[\s\S]*?<\/script\s*>)/i)
    .map(
      (attribute?: Dynamic, index?: Dynamic): Dynamic =>
        index % 2 ? attribute : encodeCamelCaseAttributes(attribute),
    )
    .join("");
}
function normalizeExportDesignTags(html?: Dynamic): Dynamic {
  for (let [value, tagReplacement] of Object.entries(
    HtmlTagNormalizationSelectTableTbodyConfig,
  ) as Dynamic)
    html = html.replace(
      new RegExp("(</?)" + value + "(?=[\\s>])", "gi"),
      "$1" + tagReplacement,
    );
  return html;
}
function decodeExportPathEscapes(
  path?: Dynamic,
  percentDecode: Dynamic = false,
): Dynamic {
  let value: Dynamic = path;
  for (let index: Dynamic = 0; index < 2; index++)
    value = value
      .replace(/&amp;/gi, "&")
      .replace(/&quest;/gi, "?")
      .replace(/&sol;/gi, "/")
      .replace(/&period;/gi, ".")
      .replace(/&equals;/gi, "=")
      .replace(/&percnt;/gi, "%")
      .replace(
        /&#x([0-9a-f]+);?/gi,
        (match?: Dynamic, hexCode?: Dynamic): Dynamic => {
          let codePoint: Dynamic = parseInt(hexCode, 16);
          return codePoint > 0 && codePoint < 1114112
            ? String.fromCodePoint(codePoint)
            : match;
        },
      )
      .replace(
        /&#(\d+);?/g,
        (match?: Dynamic, decimalCode?: Dynamic): Dynamic => {
          let codePoint: Dynamic = Number(decimalCode);
          return codePoint > 0 && codePoint < 1114112
            ? String.fromCodePoint(codePoint)
            : match;
        },
      )
      .replace(
        percentDecode
          ? /\\([0-9a-f]{1,6})(?:\r\n|[ \t\n\r\f])?/gi
          : /\\u([0-9a-f]{4})/gi,
        (match?: Dynamic, hexCode?: Dynamic): Dynamic => {
          let codePoint: Dynamic = parseInt(hexCode, 16);
          return codePoint > 0 && codePoint < 1114112
            ? String.fromCodePoint(codePoint)
            : match;
        },
      )
      .replace(
        /\\x([0-9a-f]{2})/gi,
        (match?: Dynamic, hexCode?: Dynamic): Dynamic =>
          String.fromCharCode(parseInt(hexCode, 16)),
      )
      .replace(
        /\\u\{([0-9a-f]+)\}/gi,
        (match?: Dynamic, hexCode?: Dynamic): Dynamic => {
          let codePoint: Dynamic = parseInt(hexCode, 16);
          return codePoint > 0 && codePoint < 1114112
            ? String.fromCodePoint(codePoint)
            : match;
        },
      )
      .replace(
        /\\([0-3][0-7]{0,2}|[4-7][0-7]?)/g,
        (match?: Dynamic, octalCode?: Dynamic): Dynamic => {
          let codePoint: Dynamic = parseInt(octalCode, 8);
          return codePoint > 0 && codePoint < 256
            ? String.fromCharCode(codePoint)
            : match;
        },
      )
      .replace(
        /%([0-9a-f]{2})/gi,
        (match?: Dynamic, hexCode?: Dynamic): Dynamic =>
          String.fromCharCode(parseInt(hexCode, 16)),
      )
      .replace(/\\(\r\n|[\n\r\f\u2028\u2029])/g, "")
      .replace(/\\(.)/g, "$1");
  return value;
}
function containsProjectServeAccessToken(path?: Dynamic): Dynamic {
  return (
    projectServeAccessTokenPattern.test(decodeExportPathEscapes(path)) ||
    projectServeAccessTokenPattern.test(decodeExportPathEscapes(path, true))
  );
}
function containsProjectServeCredential(path?: Dynamic): Dynamic {
  for (let value of [
    decodeExportPathEscapes(path),
    decodeExportPathEscapes(path, true),
  ] as Dynamic) {
    let flag: Dynamic = false;
    value.replace(
      projectServeUrlPattern,
      (items?: Dynamic, left?: Dynamic): Dynamic => (
        items.length > left.length && (flag = true),
        items
      ),
    );
    if (flag || projectServeAccessTokenPattern.test(value)) return true;
  }
  return false;
}
function isSuspiciousExportAssetPath(path?: Dynamic): Dynamic {
  let callback: Dynamic = (text?: Dynamic): Dynamic =>
      /\\|%(?:[0-9a-f]{2}|u[0-9a-f]{4})/i.test(text) ||
      /\p{C}/u.test(text) ||
      /\p{Zl}|\p{Zp}|(?!\x20)\p{Zs}/u.test(text) ||
      /(?=[^\x00-\x7f])\p{S}/u.test(text) ||
      /(^|[^\p{L}\p{M}])\p{M}/u.test(text),
    value: Dynamic = path.normalize("NFKC");
  return (
    callback(path) ||
    callback(value) ||
    value.split("/").length !== path.split("/").length
  );
}
function matchesNormalizedPathPattern(
  path?: Dynamic,
  pattern?: Dynamic,
): Dynamic {
  return pattern.test(path) || pattern.test(path.normalize("NFKC"));
}
function redactProjectServeAccessToken(path?: Dynamic): Dynamic {
  let value: Dynamic = path,
    queryIndex: Dynamic = value.indexOf("?");
  queryIndex >= 0 &&
    containsProjectServeAccessToken(value.slice(queryIndex)) &&
    (value = value.slice(0, queryIndex));
  value = value.replace(
    /\/_t\/([^/]+)\//i,
    (fallbackPath?: Dynamic, candidatePath?: Dynamic): Dynamic =>
      projectServeAccessTokenPattern.test(candidatePath) ? "/" : fallbackPath,
  );
  return containsProjectServeAccessToken(value)
    ? "(path withheld: it matches a project serve access token)"
    : value;
}
function parseExportRuntimeAssetPaths(source?: Dynamic): Dynamic {
  let value: Dynamic = /for\s*\(\s*const\s+p\s+of\s*\[/.exec(source);
  if (!value) return null;
  let items: Dynamic = [],
    cursor: Dynamic = value.index + value[0].length,
    state: Dynamic = {
      n: `
`,
      t: "	",
      r: "\r",
      b: "\b",
      f: "\f",
      v: "\v",
      0: "\0",
    };
  for (; cursor < source.length; ) {
    let character: Dynamic = source[cursor];
    if (character === "]") return items;
    if (/[\s,]/.test(character)) {
      cursor++;
      continue;
    }
    if (character !== "'" && character !== '"') return null;
    let quote: Dynamic = character;
    cursor++;
    let text: Dynamic = "";
    for (;;) {
      if (cursor >= source.length) return null;
      let escapedCharacter: Dynamic = source[cursor];
      if (escapedCharacter === quote) {
        cursor++;
        break;
      }
      if (escapedCharacter === "\\") {
        let escapeType: Dynamic = source[cursor + 1];
        if (escapeType === undefined) return null;
        if (escapeType === "u" || escapeType === "x") {
          let escapeLength: Dynamic = escapeType === "u" ? 4 : 2,
            escapeDigits: Dynamic = source.slice(cursor + 2, cursor + 2 + escapeLength);
          if (!new RegExp("^[0-9a-fA-F]{" + escapeLength + "}$").test(escapeDigits))
            return null;
          text += String.fromCharCode(parseInt(escapeDigits, 16));
          cursor += 2 + escapeLength;
          continue;
        }
        text += state[escapeType] ?? escapeType;
        cursor += 2;
        continue;
      }
      text += escapedCharacter;
      cursor++;
    }
    text && items.push(text);
  }
  return null;
}
async function bundleStandaloneDesignHtml(
  html?: Dynamic,
  path?: Dynamic,
  resolveAsset?: Dynamic,
  bundleContext: Dynamic = {},
  bundleOptions: Dynamic = {},
): Promise<Dynamic> {
  let state: Dynamic = {
      ancestors: bundleContext.ancestors ?? new Set([path]),
      depth: bundleContext.depth ?? 0,
      pages: bundleContext.pages ?? new Map(),
      pageOrder: bundleContext.pageOrder ?? [],
      dsProject: bundleContext.dsProject ?? false,
    },
    value: Dynamic = /<x-dc(?:\s[^>]*)?>/.exec(html),
    closingTagIndex: Dynamic = html.lastIndexOf("</x-dc>"),
    documentHtml: Dynamic =
      value && closingTagIndex >= value.index + value[0].length
        ? html.slice(0, value.index + value[0].length) +
          normalizeExportDesignTags(
            normalizeExportHtmlOutsideScripts(
              expandSelfClosingImports(
                html.slice(value.index + value[0].length, closingTagIndex),
              ),
            ),
          ) +
          html.slice(closingTagIndex)
        : html,
    document: Dynamic = new DOMParser().parseFromString(documentHtml, "text/html"),
    entries: Dynamic = new Map(),
    pendingAssets: Dynamic = new Map(),
    items: Dynamic = [],
    values: Dynamic = new Set(),
    callback: Dynamic = async (
      url?: Dynamic,
      assetOptions?: Dynamic,
    ): Promise<Dynamic> => {
      let resolvedAsset: Dynamic = await resolveAsset(url, assetOptions);
      !resolvedAsset &&
        !values.has(url) &&
        (values.add(url),
        items.push(
          `asset not found: ${redactProjectServeAccessToken(url)}`,
        ));
      return resolvedAsset;
    };
  async function resolveAssetUrl(url?: Dynamic): Promise<Dynamic> {
    if (!url || url.startsWith("#")) return null;
    let scheme: Dynamic = url
      .slice(0, url.indexOf(":") + 1)
      .toLowerCase();
    if (
      scheme === "data:" ||
      scheme === "blob:" ||
      scheme === "javascript:"
    )
      return null;
    let assetPath: Dynamic = resolveExportAssetUrl(url, path);
    if (entries.has(assetPath)) return entries.get(assetPath).uuid;
    if (pendingAssets.has(assetPath)) return pendingAssets.get(assetPath);
    let pendingResult: Dynamic = (async (): Promise<Dynamic> => {
      let asset: Dynamic = await callback(assetPath);
      if (!asset) return null;
      let assetId: Dynamic = crypto.randomUUID();
      entries.set(assetPath, {
        uuid: assetId,
        data: asset.data,
        mime: asset.mime,
      });
      return assetId;
    })();
    pendingAssets.set(assetPath, pendingResult);
    let resolvedId: Dynamic = await pendingResult;
    pendingAssets.delete(assetPath);
    return resolvedId;
  }
  async function rewriteAttribute(
    elementNode?: Dynamic,
    attributeName?: Dynamic,
  ): Promise<Dynamic> {
    let attribute: Dynamic = elementNode.getAttribute(attributeName);
    if (!attribute) return;
    let fragmentIndex: Dynamic = attribute.indexOf("#"),
      fragment: Dynamic = fragmentIndex >= 0 ? attribute.slice(fragmentIndex) : "",
      rewrittenUrl: Dynamic = await resolveAssetUrl(attribute);
    rewrittenUrl && elementNode.setAttribute(attributeName, rewrittenUrl + fragment);
  }
  async function rewriteSrcset(elementNode?: Dynamic): Promise<Dynamic> {
    for (let attributeName of ["srcset", "sc-camel-src-set"] as Dynamic) {
      let attribute: Dynamic = elementNode.getAttribute(attributeName);
      if (!attribute) continue;
      let srcsetItems: Dynamic = parseExportSrcset(attribute),
        rewrittenItems: Dynamic = [];
      for (let item of srcsetItems as Dynamic) {
        let [url, ...descriptor]: Dynamic = item.split(/\s+/),
          rewrittenUrl: Dynamic = await resolveAssetUrl(url);
        rewrittenItems.push(
          rewrittenUrl ? `${rewrittenUrl} ${descriptor.join(" ")}`.trim() : item,
        );
      }
      elementNode.setAttribute(attributeName, rewrittenItems.join(", "));
    }
  }
  await Promise.all(
    Array.from(document.querySelectorAll("img")).map(
      async (elementNode?: Dynamic): Promise<Dynamic> => {
        await rewriteAttribute(elementNode, "src");
        await rewriteSrcset(elementNode);
      },
    ),
  );
  await Promise.all(
    Array.from(
      document.querySelectorAll("source[srcset], source[sc-camel-src-set]"),
    ).map((elementNode?: Dynamic): Dynamic => rewriteSrcset(elementNode)),
  );
  let imageSlots: Dynamic = Array.from(
    document.querySelectorAll("image-slot"),
  ).concat(
    Array.from(
      document.querySelectorAll(
        'x-dc x-import[component-from-global-scope="image-slot"]',
      ),
    ),
  );
  if (imageSlots.length > 0) {
    let slotUrl: Dynamic = resolveExportAssetUrl(
        imageSlotsStateFilename,
        path,
      ),
      slotAsset: Dynamic = await resolveAsset(slotUrl, {
        optional: true,
      }),
      slotState: Dynamic = slotAsset ? parseImageSlotState(slotAsset.data) : null;
    slotAsset &&
      slotState === null &&
      items.push(
        `image-slot sidecar ${redactProjectServeAccessToken(slotUrl)} could not be parsed \u2014 user-dropped slot images will not appear in the bundle`,
      );
    await Promise.all(
      imageSlots.map(async (slotElement?: Dynamic): Promise<Dynamic> => {
        let attribute: Dynamic = slotElement.getAttribute("id"),
          slotId: Dynamic = attribute ? slotState?.get(attribute) : undefined;
        if (slotId !== undefined) {
          let entry: Dynamic = entries.get(slotId);
          if (!entry) {
            let [, mimeType, base64Data]: Dynamic =
              /^data:(image\/[\w.+-]+);base64,([\s\S]*)$/i.exec(slotId) ??
              [];
            if (mimeType !== undefined && base64Data !== undefined)
              try {
                entry = {
                  uuid: crypto.randomUUID(),
                  data: decodeBinaryBase64(base64Data),
                  mime: mimeType.toLowerCase(),
                };
                entries.set(slotId, entry);
              } catch {}
          }
          if (entry) {
            slotElement.setAttribute("src", entry.uuid);
            slotElement.removeAttribute("credit");
            slotElement.removeAttribute("credit-href");
            return;
          }
          items.push(
            `image-slot "${attribute}": the stored replacement image could not be decoded \u2014 the bundle falls back to the slot's src image`,
          );
        }
        slotElement.tagName.toLowerCase() === "image-slot" &&
          slotElement.hasAttribute("src") &&
          (await rewriteAttribute(slotElement, "src"));
      }),
    );
  }
  await Promise.all(
    Array.from(document.querySelectorAll("svg image, svg use")).map(
      async (elementNode?: Dynamic): Promise<Dynamic> => {
        elementNode.hasAttribute("href")
          ? await rewriteAttribute(elementNode, "href")
          : elementNode.hasAttribute("xlink:href")
            ? await rewriteAttribute(elementNode, "xlink:href")
            : elementNode.hasAttribute("sc-camel-xlink-href") &&
              (await rewriteAttribute(elementNode, "sc-camel-xlink-href"));
      },
    ),
  );
  let resourceEntries: Dynamic = [],
    resourceElements: Dynamic = Array.from(
      document.querySelectorAll('meta[name="ext-resource-dependency"]'),
    );
  await Promise.all(
    resourceElements.map(async (resourceElement?: Dynamic): Promise<Dynamic> => {
      let attribute: Dynamic = resourceElement.getAttribute("content"),
        resourceId: Dynamic = resourceElement.getAttribute("data-resource-id");
      if (attribute && resourceId) {
        let resourceUrl: Dynamic = await resolveAssetUrl(attribute);
        resourceUrl &&
          resourceEntries.push({
            id: resourceId,
            uuid: resourceUrl,
          });
      }
      resourceElement.remove();
    }),
  );
  await Promise.all(
    Array.from(
      document.querySelectorAll(
        "video[src], audio[src], source[src], track[src]",
      ),
    ).map((elementNode?: Dynamic): Dynamic => rewriteAttribute(elementNode, "src")),
  );
  await Promise.all(
    Array.from(document.querySelectorAll("video[poster]")).map(
      (elementNode?: Dynamic): Dynamic => rewriteAttribute(elementNode, "poster"),
    ),
  );
  await Promise.all(
    Array.from(
      document.querySelectorAll(
        'link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]',
      ),
    ).map((elementNode?: Dynamic): Dynamic => rewriteAttribute(elementNode, "href")),
  );
  {
    let scriptPattern: Dynamic =
        /const\s+(\w+)\s*=\s*document\.createElement\(\s*(['"])link\2\s*\)\s*;\s*\1\.rel\s*=\s*(['"])stylesheet\3\s*;\s*\1\.href\s*=\s*base\s*\+\s*(['"])\/\4\s*\+\s*p\s*;\s*document\.head\.appendChild\(\s*\1\s*\)\s*;(?=\s*\})/,
      modulePattern: Dynamic =
        /(\w+)\.src\s*=\s*base\s*\+\s*(['"])\/_ds_bundle\.js\2\s*;/,
      resolvedAssetIds: Dynamic = new Set(),
      visitedPaths: Dynamic = new Set(),
      resolveAssetWithContext: Dynamic = async (
        assetPath?: Dynamic,
        assetType?: Dynamic,
        baseUrl: Dynamic = "",
      ): Promise<Dynamic> => {
        if (
          matchesNormalizedPathPattern(assetPath, /(^|\/)\.\.(\/|$)/) ||
          isSuspiciousExportAssetPath(assetPath)
        ) {
          visitedPaths.has(assetPath) ||
            (visitedPaths.add(assetPath),
            items.push(
              `design-system file not embedded (${redactProjectServeAccessToken(assetPath)}): the resolved path carries dot segments \u2014 point ds-base.js at a plain _ds/<folder> path to publish this page with its design system`,
            ));
          return null;
        }
        if (/\/v1\/design\/projects\/[^/]+\/serve\//.test(assetPath)) {
          visitedPaths.has(assetPath) ||
            (visitedPaths.add(assetPath),
            items.push(
              `design-system file not embedded (${redactProjectServeAccessToken(assetPath)}): project serve URLs may not be loaded as design-system files \u2014 point ds-base.js at the project's _ds/<folder> tree to publish this page with its design system`,
            ));
          return null;
        }
        let resolveExternalAsset: Dynamic = async (
            url?: Dynamic,
          ): Promise<Dynamic> => {
            let isExternalUrl: Dynamic = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(
              url,
            );
            if (/\/v1\/design\/projects\/[^/]+\/serve\//.test(url)) {
              visitedPaths.has(url) ||
                (visitedPaths.add(url),
                items.push(
                  `design-system file not embedded (${redactProjectServeAccessToken(url)}): project serve URLs may not be referenced from design-system stylesheets \u2014 the reference ships live and will not load for public viewers`,
                ));
              return null;
            }
            if (
              !isExternalUrl &&
              baseUrl !== "" &&
              matchesNormalizedPathPattern(url, /(^|\/)\.\.(\/|$)/)
            ) {
              visitedPaths.has(url) ||
                (visitedPaths.add(url),
                items.push(
                  `design-system file not embedded (${redactProjectServeAccessToken(url)}): referenced from a design-system stylesheet with dot segments in the path \u2014 design-system styles may only embed plain relative paths from their own tree`,
                ));
              return null;
            }
            if (
              !isExternalUrl &&
              baseUrl !== "" &&
              isSuspiciousExportAssetPath(url)
            ) {
              visitedPaths.has(url) ||
                (visitedPaths.add(url),
                items.push(
                  `design-system file not embedded (${redactProjectServeAccessToken(url)}): referenced from a design-system stylesheet with unsupported characters in the path \u2014 design-system styles may only embed plain relative paths from their own tree`,
                ));
              return null;
            }
            if (
              !isExternalUrl &&
              baseUrl !== "" &&
              url !== baseUrl &&
              !url.startsWith(baseUrl + "/")
            ) {
              visitedPaths.has(url) ||
                (visitedPaths.add(url),
                items.push(
                  `design-system file not embedded (${redactProjectServeAccessToken(url)}): referenced from a design-system stylesheet but resolves outside the design-system tree \u2014 design-system styles may only embed files from their own tree`,
                ));
              return null;
            }
            let resolvedAsset: Dynamic = await resolveAsset(url);
            !resolvedAsset &&
              !visitedPaths.has(url) &&
              (visitedPaths.add(url),
              items.push(
                `design-system file not embedded (${redactProjectServeAccessToken(url)}): not found \u2014 referenced from a design-system stylesheet, and the published page may not render its design system`,
              ));
            return resolvedAsset;
          },
          inlineCssAsset: Dynamic = async (url?: Dynamic): Promise<Dynamic> => {
            let inlineCssText: Dynamic = await inlineExportCssImports(
              url,
              assetPath,
              resolveExternalAsset,
              entries,
              0,
              "data",
              items,
            );
            /\/v1\/design\/projects\/[^/]+\/serve\//.test(inlineCssText) &&
              ((inlineCssText = inlineCssText.replace(projectServeUrlPattern, "$1")),
              items.push(
                `design-system file "${redactProjectServeAccessToken(assetPath)}" references project serve URLs \u2014 detected access tokens were removed, but the URLs (and project id) ship in the published file and will not load for public viewers`,
              ));
            containsProjectServeCredential(inlineCssText) &&
              items.push(
                `serve token not removed: design-system file "${redactProjectServeAccessToken(assetPath)}" ships project serve URLs whose query tokens were not stripped \u2014 the published file may carry a live access token`,
              );
            return {
              uuid: crypto.randomUUID(),
              data: new TextEncoder().encode(inlineCssText),
              mime: "text/css",
            };
          },
          entry: Dynamic = entries.get(assetPath);
        if (entry) {
          if (assetType === "js") {
            containsProjectServeAccessToken(
              new TextDecoder().decode(entry.data),
            ) &&
              items.push(
                `serve token not removed: design-system file "${redactProjectServeAccessToken(assetPath)}" ships bytes matching a project serve access token \u2014 the published file may carry a live access token`,
              );
            return entry.uuid;
          }
          if (resolvedAssetIds.has(assetPath)) return entry.uuid;
          let cssEntry: Dynamic = entries.get("ds-css:" + assetPath);
          if (cssEntry) return cssEntry.uuid;
          let cssAsset: Dynamic = await inlineCssAsset(
            new TextDecoder().decode(entry.data),
          );
          entries.set("ds-css:" + assetPath, cssAsset);
          return cssAsset.uuid;
        }
        let loadedAsset: Dynamic = await resolveAsset(assetPath);
        if (!loadedAsset) {
          items.push(
            `design-system file not embedded (${redactProjectServeAccessToken(assetPath)}): not found in the project \u2014 the page loads it dynamically via ds-base.js, and the published file will not render its design system`,
          );
          return null;
        }
        if (assetType === "css") {
          let asset: Dynamic = await inlineCssAsset(
            new TextDecoder().decode(loadedAsset.data),
          );
          entries.set(assetPath, asset);
          resolvedAssetIds.add(assetPath);
          return asset.uuid;
        }
        let cssText: Dynamic = new TextDecoder().decode(loadedAsset.data);
        /\/v1\/design\/projects\/[^/]+\/serve\//.test(cssText) &&
          ((cssText = cssText.replace(projectServeUrlPattern, "$1")),
          items.push(
            `design-system file "${redactProjectServeAccessToken(assetPath)}" references project serve URLs \u2014 detected access tokens were removed, but the URLs (and project id) ship in the published file and will not load for public viewers`,
          ));
        containsProjectServeCredential(cssText) &&
          items.push(
            `serve token not removed: design-system file "${redactProjectServeAccessToken(assetPath)}" ships project serve URLs whose query tokens were not stripped \u2014 the published file may carry a live access token`,
          );
        let assetState: Dynamic = {
          uuid: crypto.randomUUID(),
          data: new TextEncoder().encode(cssText),
          mime: loadedAsset.mime,
        };
        entries.set(assetPath, assetState);
        return assetState.uuid;
      },
      embeddedPaths: Dynamic = new Set();
    for (let imageElement of Array.from(
      document.querySelectorAll("script[src]"),
    ) as Dynamic) {
      let imageUrl: Dynamic = (imageElement.getAttribute("src") || "").trim(),
        normalizedUrl: Dynamic = imageUrl.split("#")[0].split("?")[0];
      if (
        (normalizedUrl !== designSystemBaseFilename &&
          !normalizedUrl.endsWith("/" + designSystemBaseFilename)) ||
        /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(normalizedUrl)
      )
        continue;
      let resolvedUrl: Dynamic = resolveExportAssetUrl(imageUrl, path);
      if (embeddedPaths.has(resolvedUrl)) continue;
      embeddedPaths.add(resolvedUrl);
      if (
        matchesNormalizedPathPattern(
          resolvedUrl,
          invalidExportAssetPathSegmentsPattern,
        ) ||
        isSuspiciousExportAssetPath(resolvedUrl)
      ) {
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): the ds-base.js reference carries dot, empty, or unsupported path segments \u2014 reference the loader by a plain path (if the page's own folder name carries symbols or emoji, renaming that folder to plain characters also resolves this) to publish this page with its design system`,
        );
        continue;
      }
      let entry: Dynamic = entries.get(resolvedUrl),
        assetEntry: Dynamic = entry ?? (await resolveAsset(resolvedUrl));
      if (!assetEntry) continue;
      let scriptText: Dynamic = new TextDecoder().decode(assetEntry.data);
      if (scriptText.includes("(window.__resources || {})[base + ")) continue;
      let maskedText: Dynamic = maskJavaScriptCommentsAndStrings(scriptText),
        hasBaseReference: Dynamic = scriptPattern.test(scriptText),
        hasRuntimeReference: Dynamic = modulePattern.test(scriptText);
      if (!maskedText && !hasBaseReference && !hasRuntimeReference) continue;
      if (!maskedText) {
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js has no live 'const base = \u2026' statement to follow, so its dynamically loaded files ship un-embedded and will not load on strict hosts (e.g. published artifacts) \u2014 restoring the generated base line re-enables embedding`,
        );
        continue;
      }
      if (!hasBaseReference && !hasRuntimeReference) {
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js was customized beyond the generated load lines, so its dynamically loaded files ship un-embedded and will not load on strict hosts (e.g. published artifacts) \u2014 restoring the generated lines re-enables embedding`,
        );
        continue;
      }
      let assetPath: Dynamic = maskedText.value,
        resolvedAssetPath: Dynamic = resolveExportAssetUrl(assetPath, path);
      if (isSuspiciousExportAssetPath(assetPath)) {
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js's base line carries unsupported characters \u2014 point base at a plain _ds/<folder> path to publish this page with its design system`,
        );
        continue;
      }
      if (/\/v1\/design\/projects\/[^/]+\/serve(\/|$)/.test("/" + assetPath)) {
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js points base at a project serve path, which is not a design-system tree \u2014 point base at the project's _ds/<folder> tree to publish this page with its design system`,
        );
        continue;
      }
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(assetPath)) {
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js points base at an absolute URL, which is loaded live and blocked on strict hosts (e.g. published artifacts) \u2014 point base at the project's _ds/<folder> tree to publish this page with its design system`,
        );
        continue;
      }
      {
        let designSystemPattern: Dynamic = /^\/?(_ds\/[^/]+)(\/|$)/,
          normalizedSourcePath: Dynamic = resolvedUrl.normalize("NFKC"),
          normalizedResolvedPath: Dynamic = resolvedAssetPath.normalize("NFKC"),
          isWithinDesignSystemTree: Dynamic = (
            sourcePath?: Dynamic,
            resolvedPath?: Dynamic,
          ): Dynamic => {
            let match: Dynamic = designSystemPattern.exec(sourcePath);
            if (!match) return true;
            let normalizedPath: Dynamic = resolvedPath.replace(/^\//, "");
            return (
              normalizedPath === match[1] || normalizedPath.startsWith(match[1] + "/")
            );
          };
        if (
          !(
            !!designSystemPattern.exec(resolvedUrl) == !!designSystemPattern.exec(normalizedSourcePath) &&
            designSystemAssetPathPattern.test(resolvedAssetPath) ===
              designSystemAssetPathPattern.test(normalizedResolvedPath) &&
            isWithinDesignSystemTree(resolvedUrl, resolvedAssetPath) === isWithinDesignSystemTree(normalizedSourcePath, normalizedResolvedPath) &&
            (resolvedAssetPath === "") == (normalizedResolvedPath === "")
          )
        ) {
          items.push(
            `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): the loader path or its base changes meaning under Unicode normalization, so it cannot be safely classified \u2014 reference the loader and point base at a plain _ds/<folder> path`,
          );
          continue;
        }
      }
      let designSystemMatch: Dynamic = /^\/?(_ds\/[^/]+)(\/|$)/.exec(resolvedUrl);
      if (designSystemMatch) {
        let designSystemRoot: Dynamic = designSystemMatch[1],
          resolvedRelativePath: Dynamic = resolvedAssetPath.replace(/^\//, "");
        if (resolvedRelativePath !== designSystemRoot && !resolvedRelativePath.startsWith(designSystemRoot + "/")) {
          items.push(
            `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): a loader inside ${designSystemRoot}/ may only embed from its own tree, and its base resolves elsewhere \u2014 the page loads these files live, which strict hosts block`,
          );
          continue;
        }
      }
      if (resolvedAssetPath === "" && !state.dsProject) {
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js's base resolves to the project root, which a bound design system may not embed from \u2014 place design files under '_ds/<name>/' and point base at that tree`,
        );
        continue;
      }
      if (
        !state.dsProject &&
        resolvedAssetPath !== "" &&
        !designSystemAssetPathPattern.test(resolvedAssetPath)
      ) {
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js's base does not point at a bound design-system tree \u2014 place design files under '_ds/<name>/' and point base at that tree`,
        );
        continue;
      }
      let runtimePaths: Dynamic = parseExportRuntimeAssetPaths(scriptText),
        assetText: Dynamic = scriptText,
        flag: Dynamic = false;
      if (hasRuntimeReference) {
        let loaderPath: Dynamic = `${assetPath}/_ds_bundle.js`,
          loaderId: Dynamic = await resolveAssetWithContext(
            resolveExportAssetUrl(loaderPath, path),
            "js",
          );
        loaderId &&
          (resourceEntries.push({
            id: loaderPath,
            uuid: loaderId,
          }),
          (assetText = assetText.replace(
            new RegExp(modulePattern.source, "g"),
            "$1.src = (window.__resources || {})[base + $2/_ds_bundle.js$2] || base + $2/_ds_bundle.js$2;",
          )),
          (flag = true));
      } else
        items.push(
          `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js's _ds_bundle.js load line was customized beyond the generated shape, so the published page loads the design-system bundle live, which strict hosts block \u2014 restoring the generated line re-enables embedding`,
        );
      if (hasBaseReference && runtimePaths && runtimePaths.length > 0) {
        let hasUnresolvedAsset: Dynamic = false;
        for (let runtimePath of runtimePaths as Dynamic) {
          if (
            isSuspiciousExportAssetPath(runtimePath) ||
            /[#?]/.test(runtimePath) ||
            runtimePath.startsWith("/") ||
            matchesNormalizedPathPattern(runtimePath, /(^|\/)\.\.(\/|$)/)
          ) {
            items.push(
              `design-system stylesheet not embedded ("${redactProjectServeAccessToken(runtimePath)}" in ds-base.js): the path is not a plain relative path inside the design-system tree \u2014 the reference ships live and will not load for public viewers`,
            );
            continue;
          }
          let runtimeAssetPath: Dynamic = `${assetPath}/${runtimePath}`,
            runtimeAssetId: Dynamic = await resolveAssetWithContext(
              resolveExportAssetUrl(runtimeAssetPath, path),
              "css",
              resolvedAssetPath,
            );
          runtimeAssetId &&
            (resourceEntries.push({
              id: runtimeAssetPath,
              uuid: runtimeAssetId,
            }),
            (hasUnresolvedAsset = true));
        }
        hasUnresolvedAsset &&
          ((assetText = assetText.replace(
            new RegExp(scriptPattern.source, "g"),
            `const __dsu = (window.__resources || {})[base + $4/$4 + p];
    const __dsb = __dsu && (window.__resourceBlobs || {})[__dsu];
    if (__dsb) {
      const __dst = document.createElement($2style$2);
      __dsb.text().then(function (t) { __dst.textContent = t; });
      document.head.appendChild(__dst);
    } else {
      const $1 = document.createElement($2link$2);
      $1.href = base + $4/$4 + p; $1.rel = $3stylesheet$3;
      document.head.appendChild($1);
    }`,
          )),
          (flag = true));
      } else
        hasBaseReference && runtimePaths === null
          ? items.push(
              `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js's stylesheet list could not be read as a plain string array, so its stylesheets ship un-embedded and will not load on strict hosts \u2014 restoring the generated 'for (const p of [...])' loop head re-enables embedding`,
            )
          : runtimePaths &&
            runtimePaths.length > 0 &&
            items.push(
              `design-system file not embedded (${redactProjectServeAccessToken(resolvedUrl)}): ds-base.js's stylesheet loop was customized beyond the generated shape, so the published page loads its design-system stylesheets live, which strict hosts block \u2014 restoring the generated lines re-enables embedding`,
            );
      flag &&
        (entry
          ? (entry.data = new TextEncoder().encode(assetText))
          : entries.set(resolvedUrl, {
              uuid: crypto.randomUUID(),
              data: new TextEncoder().encode(assetText),
              mime: assetEntry.mime,
            }));
    }
  }
  await Promise.all(
    Array.from(document.querySelectorAll("script[src]")).map(
      (sourceElement?: Dynamic): Dynamic => rewriteAttribute(sourceElement, "src"),
    ),
  );
  await Promise.all(
    Array.from(document.querySelectorAll("x-dc x-import")).map(
      async (sourceElement?: Dynamic): Promise<Dynamic> => {
        let sourceAttribute: Dynamic = "from";
        if (!sourceElement.getAttribute(sourceAttribute)) return;
        let sourceValue: Dynamic = sourceElement.getAttribute(sourceAttribute).trim();
        if (sourceValue.includes("{{")) return;
        let sourceTokens: Dynamic = sourceValue.split(/\s+/),
          rewrittenTokens: Dynamic = [],
          flag: Dynamic = false;
        for (let token of sourceTokens as Dynamic) {
          if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(token)) {
            if (!/\/v1\/design\/projects\/[^/]+\/serve\//.test(token)) {
              rewrittenTokens.push(token);
              continue;
            }
            let resolvedTokenPath: Dynamic = resolveExportAssetUrl(token, path);
            if (!entries.has(resolvedTokenPath)) {
              let tokenAsset: Dynamic = await resolveAsset(resolvedTokenPath);
              if (!tokenAsset) {
                let sourceFragmentIndex: Dynamic = token.indexOf("#"),
                  tokenWithoutFragment: Dynamic =
                    sourceFragmentIndex >= 0 ? token.slice(sourceFragmentIndex) : "",
                  sanitizedToken: Dynamic =
                    (sourceFragmentIndex >= 0 ? token.slice(0, sourceFragmentIndex) : token)
                      .split("?")[0]
                      .replace(/\/_t\/[^/]+\//i, "/") +
                    (containsProjectServeAccessToken(tokenWithoutFragment) ? "" : tokenWithoutFragment);
                rewrittenTokens.push(sanitizedToken);
                sanitizedToken !== token && (flag = true);
                continue;
              }
              entries.has(resolvedTokenPath) ||
                entries.set(resolvedTokenPath, {
                  uuid: crypto.randomUUID(),
                  data: tokenAsset.data,
                  mime: tokenAsset.mime,
                });
            }
          }
          let fragmentIndex: Dynamic = token.indexOf("#"),
            fragment: Dynamic = fragmentIndex >= 0 ? token.slice(fragmentIndex) : "",
            sanitizedFragment: Dynamic = containsProjectServeAccessToken(fragment)
              ? ""
              : fragment,
            instanceName: Dynamic =
              token.split("#")[0].split("?")[0].split("/").pop() || "",
            resolvedAssetId: Dynamic = await resolveAssetUrl(token);
          if (!resolvedAssetId) {
            sanitizedFragment !== fragment
              ? (rewrittenTokens.push(token.slice(0, fragmentIndex)), (flag = true))
              : rewrittenTokens.push(token);
            continue;
          }
          let rewrittenUrl: Dynamic = `${resolvedAssetId}#/${instanceName}${sanitizedFragment}`,
            jsxMatch: Dynamic = jsxAssetFilenamePattern.exec(token);
          jsxMatch &&
            !jsxAssetFilenamePattern.test(rewrittenUrl) &&
            (rewrittenUrl += `#.${jsxMatch[1]}`);
          rewrittenTokens.push(rewrittenUrl);
          flag = true;
        }
        flag && sourceElement.setAttribute(sourceAttribute, rewrittenTokens.join(" "));
      },
    ),
  );
  {
    let embeddedPageEntries: Dynamic = new Map(),
      bundleEmbeddedPage: Dynamic = async (pagePath?: Dynamic): Promise<Dynamic> => {
        if (state.ancestors.has(pagePath)) {
          items.push(
            `embedded page not bundled (${pagePath}): the page embeds itself, directly or through a chain of embedded pages \u2014 the frame will render empty`,
          );
          return null;
        }
        if (state.depth >= maxEmbeddedExportDepth) {
          items.push(
            `embedded page not bundled (${pagePath}): embedded pages nest more than ${maxEmbeddedExportDepth} levels deep \u2014 the frame will render empty`,
          );
          return null;
        }
        let entry: Dynamic = state.pages.get(pagePath);
        if (entry) return "about:blank#" + entry.uuid;
        let pageAsset: Dynamic = await callback(pagePath);
        if (!pageAsset) return null;
        let mimeType: Dynamic = pageAsset.mime
          .split(";")[0]
          .trim()
          .toLowerCase();
        if (mimeType !== "text/html") {
          let cachedEntry: Dynamic = entries.get(pagePath),
            pageData: Dynamic = cachedEntry?.data ?? pageAsset.data;
          !(
            alreadyCompressedExportMimeTypes.has(mimeType) &&
            hasCompressedFileSignature(pageData)
          ) &&
            containsProjectServeAccessToken(
              new TextDecoder().decode(pageData),
            ) &&
            items.push(
              `serve token not removed: embedded file "${pagePath}" ships bytes matching a project serve access token \u2014 the published file may carry a live access token`,
            );
          if (cachedEntry) return cachedEntry.uuid;
          let pageEntry: Dynamic = {
            uuid: crypto.randomUUID(),
            data: pageAsset.data,
            mime: pageAsset.mime,
          };
          entries.set(pagePath, pageEntry);
          return pageEntry.uuid;
        }
        let pageHtml: Dynamic = new TextDecoder().decode(pageAsset.data);
        /\/v1\/design\/projects\/[^/]+\/serve\//.test(pageHtml) &&
          ((pageHtml = pageHtml.replace(projectServeUrlPattern, "$1")),
          items.push(
            `embedded page "${pagePath}" references project serve URLs \u2014 detected access tokens were removed, but the URLs (and project id) ship in the published file and will not load for public viewers`,
          ));
        containsProjectServeCredential(pageHtml) &&
          items.push(
            `serve token not removed: embedded page "${pagePath}" ships project serve URLs whose query tokens were not stripped \u2014 the published file may carry a live access token`,
          );
        let embeddedBundle: Dynamic = await bundleStandaloneDesignHtml(
          pageHtml,
          pagePath,
          resolveAsset,
          {
            ancestors: new Set([...state.ancestors, pagePath]),
            depth: state.depth + 1,
            pages: state.pages,
            pageOrder: state.pageOrder,
            dsProject: state.dsProject,
          },
        );
        for (let warning of embeddedBundle.warnings as Dynamic)
          items.push(`${warning} \u2014 inside embedded page "${pagePath}"`);
        let embeddedPage: Dynamic = {
            uuid: crypto.randomUUID(),
            data: new TextEncoder().encode(embeddedBundle.html),
            hasSubPages: [...state.pages.values()].some(
              (page?: Dynamic): Dynamic =>
                embeddedBundle.html.includes("about:blank#" + page.uuid),
            ),
          },
          hasWarnings: Dynamic = embeddedBundle.warnings.some(
            (warning?: Dynamic): Dynamic =>
              warning.startsWith("embedded page not bundled ("),
          );
        state.pages.set(hasWarnings ? "instance:" + embeddedPage.uuid : pagePath, embeddedPage);
        state.pageOrder.push(embeddedPage.uuid);
        return "about:blank#" + embeddedPage.uuid;
      };
    for (let iframe of Array.from(
      document.querySelectorAll("iframe[src]"),
    ) as Dynamic) {
      let src: Dynamic = (iframe.getAttribute("src") || "").trim();
      if (!src || src.includes("{{")) continue;
      let fragmentIndex: Dynamic = src.indexOf("#"),
        fragment: Dynamic = fragmentIndex >= 0 ? src.slice(fragmentIndex) : "",
        sanitizedFragment: Dynamic = containsProjectServeAccessToken(fragment)
          ? ""
          : fragment,
        pageUrl: Dynamic = fragmentIndex >= 0 ? src.slice(0, fragmentIndex) : src;
      if (!pageUrl) continue;
      let decodedPageUrl: Dynamic = pageUrl;
      try {
        decodedPageUrl = decodeURIComponent(pageUrl);
      } catch {}
      let schemeMatch: Dynamic = /^([a-z][a-z0-9+.-]*):/i
        .exec(decodedPageUrl)?.[1]
        ?.toLowerCase();
      if (schemeMatch && schemeMatch !== "http" && schemeMatch !== "https") continue;
      let isProjectServeUrl: Dynamic = /\/v1\/design\/projects\/[^/]+\/serve\//.test(
        decodedPageUrl,
      );
      if (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(decodedPageUrl) && !isProjectServeUrl) continue;
      let resolvedPageUrl: Dynamic;
      if (isProjectServeUrl) resolvedPageUrl = resolveExportAssetUrl(decodedPageUrl, path);
      else {
        resolvedPageUrl = resolveExportAssetUrl(pageUrl, path);
        try {
          resolvedPageUrl = decodeURIComponent(resolvedPageUrl);
        } catch {}
      }
      let normalizedPageUrl: Dynamic = isProjectServeUrl ? resolvedPageUrl.split("?")[0] : resolvedPageUrl;
      if (!isProjectServeUrl && /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(normalizedPageUrl)) continue;
      let entry: Dynamic = embeddedPageEntries.get(normalizedPageUrl);
      if (entry === undefined) {
        if (isProjectServeUrl) {
          let pageLookupKey: Dynamic = normalizedPageUrl.replace(/\/_t\/[^/]+\//i, "/");
          containsProjectServeAccessToken(pageLookupKey)
            ? (items.push(
                "serve token not removed: an embedded frame references a project serve URL whose access token could not be stripped \u2014 the published file may carry a live access token",
              ),
              (entry = null))
            : (items.push(
                `embedded page not bundled (${pageLookupKey}): project serve URLs are not embedded as pages \u2014 the frame ships without its access token and will not load for public viewers`,
              ),
              (entry = pageLookupKey));
        } else entry = await bundleEmbeddedPage(normalizedPageUrl);
        embeddedPageEntries.set(normalizedPageUrl, entry);
      }
      if (
        iframe.hasAttribute("sandbox") &&
        !(iframe.getAttribute("sandbox") || "")
          .toLowerCase()
          .split(/[ \t\n\f\r]+/)
          .includes("allow-same-origin") &&
        entry?.startsWith("about:blank#")
      ) {
        let pageUuid: Dynamic = entry.slice(12);
        [...state.pages.values()].find(
          (pageEntry?: Dynamic): Dynamic => pageEntry.uuid === pageUuid,
        )?.hasSubPages &&
          items.push(
            `embedded page inside a sandboxed frame (${redactProjectServeAccessToken(normalizedPageUrl)}): pages embedded inside this sandboxed frame will not display in the published deck on the web \u2014 remove the sandbox attribute or avoid nesting page embeds inside it`,
          );
      }
      entry
        ? iframe.setAttribute("src", entry + sanitizedFragment)
        : sanitizedFragment !== fragment && iframe.setAttribute("src", pageUrl);
    }
  }
  let findImportedComponents: Dynamic = (sourceDocument?: Dynamic): Dynamic =>
      Array.from(sourceDocument.querySelectorAll("x-dc dc-import")).flatMap(
        (importElement?: Dynamic): Dynamic => {
          let componentName: Dynamic =
            importElement.getAttribute("name") ||
            importElement.getAttribute("component") ||
            "";
          return componentName ? [componentName] : [];
        },
      ),
    visitedComponents: Dynamic = new Set(),
    visitedStylesheets: Dynamic = new Set(),
    componentQueue: Dynamic = findImportedComponents(document);
  for (; componentQueue.length > 0; ) {
    let componentName: Dynamic = componentQueue.shift();
    if (visitedComponents.has(componentName)) continue;
    visitedComponents.add(componentName);
    if (/[/\\#?]/.test(componentName)) {
      items.push(
        `sibling component not embedded (<${componentName}/>): the name is not a plain sibling filename \u2014 the reference renders as an empty placeholder`,
      );
      continue;
    }
    let componentPath: Dynamic = "./" + encodeURIComponent(componentName) + ".dc.html",
      componentUrl: Dynamic = resolveExportAssetUrl(
        "./" + componentName + ".dc.html",
        path,
      ),
      entry: Dynamic = entries.get(componentUrl);
    entry &&
      containsProjectServeAccessToken(new TextDecoder().decode(entry.data)) &&
      items.push(
        `serve token not removed: sibling component <${componentName}/> ships project serve URLs whose query tokens were not stripped \u2014 the published file may carry a live access token`,
      );
    if (!entry) {
      let componentAsset: Dynamic = await resolveAsset(componentUrl);
      if (!componentAsset) {
        items.push(
          `sibling component not embedded (<${componentName}/>): ${componentPath} is not in the project \u2014 the reference renders as an empty placeholder`,
        );
        continue;
      }
      let componentHtml: Dynamic = new TextDecoder().decode(componentAsset.data);
      /\/v1\/design\/projects\/[^/]+\/serve\//.test(componentHtml) &&
        ((componentHtml = componentHtml.replace(projectServeUrlPattern, "$1")),
        items.push(
          `sibling component <${componentName}/> references project serve URLs \u2014 detected access tokens were removed, but the URLs (and project id) ship in the published file and will not load for public viewers`,
        ));
      containsProjectServeCredential(componentHtml) &&
        items.push(
          `serve token not removed: sibling component <${componentName}/> ships project serve URLs whose query tokens were not stripped \u2014 the published file may carry a live access token`,
        );
      entry = {
        uuid: crypto.randomUUID(),
        data: new TextEncoder().encode(componentHtml),
        mime: componentAsset.mime,
      };
      entries.set(componentUrl, entry);
    }
    resourceEntries.push({
      id: componentPath,
      uuid: entry.uuid,
    });
    let componentDocument: Dynamic = new DOMParser().parseFromString(
      new TextDecoder().decode(entry.data),
      "text/html",
    );
    componentQueue.push(...findImportedComponents(componentDocument));
    for (let importElement of Array.from(
      componentDocument.querySelectorAll("x-dc x-import"),
    ) as Dynamic) {
      let importSource: Dynamic =
          importElement.getAttribute("from") ||
          (importElement.getAttribute("component-from-global-scope")
            ? ""
            : importElement.getAttribute("src") ||
              importElement.getAttribute("import") ||
              ""),
        normalizedSource: Dynamic = importSource.trim();
      if (!(!normalizedSource || importSource.includes("{{")))
        for (let sourcePart of normalizedSource.split(/\s+/) as Dynamic)
          (/^(?:[a-z][a-z0-9+.-]*:|\/\/)/i.test(sourcePart) &&
            !/\/v1\/design\/projects\/[^/]+\/serve\//.test(sourcePart)) ||
            items.push(
              `x-import inside sibling component <${componentName}/> (${sourcePart}) is not embedded \u2014 it will fail to load in the published page`,
            );
    }
    for (let linkElement of Array.from(
      componentDocument.querySelectorAll(
        'x-dc helmet link[rel~="stylesheet" i], x-dc sc-helmet link[rel~="stylesheet" i]',
      ),
    ) as Dynamic) {
      let stylesheetUrl: Dynamic = (linkElement.getAttribute("href") || "").trim();
      if (
        !stylesheetUrl ||
        stylesheetUrl.includes("{{") ||
        visitedStylesheets.has(stylesheetUrl) ||
        (linkElement.getAttribute("rel") || "")
          .toLowerCase()
          .split(/\s+/)
          .includes("alternate") ||
        !/^(?:https?:|\/\/)/i.test(stylesheetUrl)
      )
        continue;
      let resolvedStylesheetUrl: Dynamic = resolveExportAssetUrl(stylesheetUrl, path),
        stylesheetAsset: Dynamic = await callback(resolvedStylesheetUrl);
      if (!stylesheetAsset) continue;
      let stylesheetText: Dynamic = new TextDecoder().decode(stylesheetAsset.data);
      stylesheetText = await inlineExportCssAssetUrls(
        stylesheetText,
        resolvedStylesheetUrl,
        callback,
        entries,
        items,
      );
      visitedStylesheets.add(stylesheetUrl);
      let stylesheetEntry: Dynamic = {
        uuid: crypto.randomUUID(),
        data: new TextEncoder().encode(stylesheetText),
        mime: "text/css",
      };
      entries.set("helmet-css:" + stylesheetUrl, stylesheetEntry);
      resourceEntries.push({
        id: stylesheetUrl,
        uuid: stylesheetEntry.uuid,
      });
    }
  }
  if (isDcHtmlDocument(html)) {
    let runtimeEntries: Dynamic = [
      {
        url: exportReactUmdUrl,
        sri: exportReactUmdIntegrity,
      },
      {
        url: exportReactDomUmdUrl,
        sri: exportReactDomUmdIntegrity,
      },
    ];
    Array.from(document.querySelectorAll("x-dc x-import")).some(
      (linkElement?: Dynamic): Dynamic => {
        let sourceUrl: Dynamic = linkElement.getAttribute("from") || "";
        return sourceUrl.includes("{{")
          ? false
          : sourceUrl
              .trim()
              .split(/\s+/)
              .some(
                (url?: Dynamic): Dynamic =>
                  jsxAssetFilenamePattern.test(url),
              );
      },
    ) &&
      runtimeEntries.push({
        url: exportBabelStandaloneUrl,
        sri: exportBabelStandaloneIntegrity,
      });
    await Promise.all(
      runtimeEntries.map(
        async ({ url: url, sri: sri }: Dynamic): Promise<Dynamic> => {
          let resolvedUrl: Dynamic = resolveExportAssetUrl(url, path),
            entry: Dynamic = entries.get(resolvedUrl),
            asset: Dynamic = entry ?? (await resolveAsset(resolvedUrl));
          if (
            !asset ||
            !(await verifyExportAssetIntegrity(
              asset.data,
              sri,
            ))
          ) {
            items.push(
              `runtime dependency not embedded (${url}): ${asset ? "integrity check failed" : "fetch failed"} \u2014 the page will load it from the CDN when opened, which strict hosts (e.g. published artifacts) block`,
            );
            return;
          }
          let assetEntry: Dynamic = entry ?? {
            uuid: crypto.randomUUID(),
            data: asset.data,
            mime: asset.mime,
          };
          entry || entries.set(resolvedUrl, assetEntry);
          resourceEntries.push({
            id: url,
            uuid: assetEntry.uuid,
          });
        },
      ),
    );
  }
  let styleElements: Dynamic = Array.from(document.querySelectorAll("style"));
  for (let styleElement of Array.from(
    document.querySelectorAll('link[rel~="stylesheet" i]'),
  ) as Dynamic) {
    let attribute: Dynamic = styleElement.getAttribute("href");
    if (
      !attribute ||
      (styleElement.getAttribute("rel") || "")
        .toLowerCase()
        .split(/\s+/)
        .includes("alternate")
    )
      continue;
    let styleUrl: Dynamic = attribute
      .slice(0, attribute.indexOf(":") + 1)
      .toLowerCase();
    if (styleUrl === "data:" || styleUrl === "blob:") continue;
    let stylesheetUrl: Dynamic = resolveExportAssetUrl(attribute, path),
      stylesheetAsset: Dynamic = await callback(stylesheetUrl);
    if (stylesheetAsset) {
      let stylesheetText: Dynamic = new TextDecoder().decode(stylesheetAsset.data);
      stylesheetText = await inlineExportCssImports(
        stylesheetText,
        stylesheetUrl,
        callback,
        entries,
        0,
        "uuid",
        items,
      );
      let generatedStyleElement: Dynamic = document.createElement("style");
      styleElement.hasAttribute("disabled")
        ? generatedStyleElement.setAttribute("media", "not all")
        : styleElement.hasAttribute("media") &&
          generatedStyleElement.setAttribute("media", styleElement.getAttribute("media"));
      styleElement.hasAttribute("title") &&
        generatedStyleElement.setAttribute("title", styleElement.getAttribute("title"));
      generatedStyleElement.textContent = escapeExportStyleClosingTag(stylesheetText);
      styleElement.replaceWith(generatedStyleElement);
    }
  }
  for (let styleElement of Array.from(
    document.querySelectorAll(
      'link[rel~="preload" i], link[rel~="prefetch" i], link[rel~="modulepreload" i]',
    ),
  ) as Dynamic)
    styleElement.remove();
  for (let styleElement of styleElements as Dynamic) {
    let inlinedCssText: Dynamic = await inlineExportCssImports(
      styleElement.textContent || "",
      path,
      callback,
      entries,
      0,
      "uuid",
      items,
    );
    styleElement.textContent = escapeExportStyleClosingTag(inlinedCssText);
  }
  for (let styleElement of Array.from(
    document.querySelectorAll("[style]"),
  ) as Dynamic) {
    let styleText: Dynamic = styleElement.getAttribute("style") || "";
    styleElement.setAttribute(
      "style",
      await replaceCssAssetUrlsWithIds(
        styleText,
        path,
        callback,
        entries,
      ),
    );
  }
  let element: Dynamic = document.querySelector("template#__bundler_thumbnail"),
    text: Dynamic = "",
    backgroundColor: Dynamic = "#faf9f5";
  element &&
    ((text = element.innerHTML),
    (backgroundColor = sanitizeExportColor(
      element.getAttribute("data-bg-color"),
      backgroundColor,
    )),
    element.remove(),
    /\/v1\/design\/projects\/[^/]+\/serve\//.test(text) &&
      ((text = text.replace(projectServeUrlPattern, "$1")),
      items.push(
        "thumbnail splash references project serve URLs \u2014 detected access tokens were removed, but the URLs (and project id) ship in the published file and will not load for public viewers",
      )),
    containsProjectServeCredential(text) &&
      items.push(
        "serve token not removed: the thumbnail splash ships project serve URLs whose query tokens were not stripped \u2014 the published file may carry a live access token",
      ));
  bundleOptions.branding;
  let outputDocument: Dynamic = document;
  if (state.depth === 0 && bundleOptions.finalizeTemplate) {
    let templateDocument: Dynamic = document.cloneNode(true),
      resourceValues: Dynamic = [...entries.values()]
        .filter(
          (resource?: Dynamic): Dynamic =>
            /^text\/|javascript|json|xml/i.test(resource.mime),
        )
        .map(
          (resource?: Dynamic): Dynamic => ({
            mime: resource.mime,
            text: new TextDecoder().decode(resource.data),
          }),
        );
    try {
      bundleOptions.finalizeTemplate(templateDocument, resourceValues);
      outputDocument = templateDocument;
    } catch (error: Dynamic) {
      items.push(
        "importer-ready pass failed; exported without it: " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }
  let documentTitle: Dynamic =
      outputDocument.querySelector("title")?.textContent || "Bundled Page",
    serializedPageHtml: Dynamic =
      `<!DOCTYPE html>
` + outputDocument.documentElement.outerHTML;
  containsProjectServeAccessToken(serializedPageHtml) &&
    items.push(
      "serve token not removed: the bundled page ships bytes matching a project serve access token \u2014 the published file may carry a live access token",
    );
  if (state.depth === 0)
    for (let [pageKey, page] of state.pages as Dynamic)
      entries.set("bundled-page:" + pageKey, {
        uuid: page.uuid,
        data: page.data,
        mime: "text/html",
      });
  let resourceState: Dynamic = {},
    hasResourceWarning: Dynamic = items.some(
      (warning?: Dynamic): Dynamic =>
        warning.startsWith("serve token not removed:"),
    );
  for (let [entryKey, entry] of entries as Dynamic) {
    !hasResourceWarning &&
      !(
        alreadyCompressedExportMimeTypes.has(
          entry.mime.split(";")[0].trim().toLowerCase(),
        ) && hasCompressedFileSignature(entry.data)
      ) &&
      !entryKey.startsWith("bundled-page:") &&
      containsProjectServeAccessToken(
        new TextDecoder().decode(entry.data),
      ) &&
      ((hasResourceWarning = true),
      items.push(
        state.depth > 0
          ? "serve token not removed: an asset referenced by this embedded page ships bytes matching a project serve access token \u2014 the published file may carry a live access token"
          : "serve token not removed: an asset referenced by this page ships bytes matching a project serve access token \u2014 the published file may carry a live access token",
      ));
    let mimeType: Dynamic = entry.mime.split(";")[0].trim().toLowerCase(),
      normalizedMimeType: Dynamic = mimeTypePattern.test(mimeType)
        ? mimeType
        : "application/octet-stream",
      isUncompressed: Dynamic = !alreadyCompressedExportMimeTypes.has(normalizedMimeType),
      entryData: Dynamic = isUncompressed
        ? await gzipExportAsset(entry.data)
        : entry.data;
    resourceState[entry.uuid] = {
      mime: normalizedMimeType,
      compressed: isUncompressed,
      data: encodeBinaryBase64(entryData),
    };
  }
  let serializedResources: Dynamic = escapeExportScriptClosingTags(
    JSON.stringify(serializedPageHtml),
  );
  containsProjectServeAccessToken(
    resourceEntries.map((resource?: Dynamic): Dynamic => resource.id).join(`
`),
  ) &&
    items.push(
      "serve token not removed: an ext-resource id ships bytes matching a project serve access token \u2014 the published file may carry a live access token",
    );
  let serializedState: Dynamic = escapeExportScriptClosingTags(
      JSON.stringify(resourceEntries),
    ),
    totalBytes: Dynamic = Object.values(resourceState).reduce(
      (total?: Dynamic, resource?: Dynamic): Dynamic =>
        total + resource.data.length,
      0,
    );
  totalBytes > 200 * 1024 * 1024 &&
    items.push(
      `total output is ${formatExportByteSize(totalBytes)} \u2014 may cause browser perf issues`,
    );
  totalBytes > 20 * 1024 * 1024 &&
    items.push(
      `total output is ${formatExportByteSize(totalBytes)} \u2014 publishing at this size may fail at the upload limit; pages embedded via iframe re-ship their shared dependencies, so consolidating or removing embedded pages reduces size most`,
    );
  return {
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(documentTitle)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: ${backgroundColor}; display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
    #__bundler_loading { position: fixed; bottom: 20px; right: 20px; font: 13px/1.4 -apple-system, BlinkMacSystemFont, sans-serif; color: #666; background: #fff; padding: 8px 14px; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.12); z-index: 10000; }
    #__bundler_thumbnail { position: fixed; inset: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: ${backgroundColor}; z-index: 9999; }
    #__bundler_thumbnail svg { width: 100%; height: 100%; object-fit: contain; }
    #__bundler_placeholder { color: #999; font-size: 14px; }
  </style>
  <noscript>
    <style>#__bundler_loading { display: none; }</style>
    <div style="position:fixed;bottom:12px;left:12px;font:13px/1.4 -apple-system,BlinkMacSystemFont,sans-serif;color:#999;background:rgba(255,255,255,0.9);padding:6px 12px;border-radius:6px;box-shadow:0 1px 4px rgba(0,0,0,0.08);z-index:10000;">
      This page requires JavaScript to display.
    </div>
  </noscript>
</head>
<body>
  ${text ? '<div id="__bundler_thumbnail">' + text + "</div>" : '<div id="__bundler_placeholder">Loading ' + escapeHtml(documentTitle) + "...</div>"}
  <div id="__bundler_loading">Unpacking...</div>

  <script>
    ${standaloneExportBootstrapScript}
  <\/script>

  <script type="__bundler/manifest">
${escapeExportScriptClosingTags(JSON.stringify(resourceState))}
  <\/script>

  <script type="__bundler/ext_resources">
${serializedState}
  <\/script>

  <script type="__bundler/page_order">
${escapeExportScriptClosingTags(JSON.stringify(state.depth === 0 ? state.pageOrder : []))}
  <\/script>

  <script type="__bundler/template">
${serializedResources}
  <\/script>
</body>
</html>`,
    warnings: items,
  };
}
function resolveExportAssetUrl(
  reference?: Dynamic,
  basePath?: Dynamic,
): Dynamic {
  let value: Dynamic = reference.split("#")[0];
  if (/^(https?:)?\/\//.test(value)) return value;
  if (/^https?:\/\//.test(basePath)) return new URL(value, basePath).href;
  if (basePath.startsWith("//"))
    return new URL(value, "https:" + basePath).href;
  let relativePath: Dynamic = value.split("?")[0];
  if (relativePath.startsWith("/")) return relativePath;
  let baseDirectory: Dynamic = basePath.split("?")[0],
    isAbsolute: Dynamic = baseDirectory.startsWith("/"),
    baseSegments: Dynamic = baseDirectory.split("/");
  baseSegments.pop();
  let items: Dynamic = [];
  for (let segment of [...baseSegments, ...relativePath.split("/")] as Dynamic)
    segment === "." ||
      segment === "" ||
      (segment === ".." ? items.pop() : items.push(segment));
  return (isAbsolute ? "/" : "") + items.join("/");
}
export {
  alreadyCompressedExportMimeTypes,
  bundleStandaloneDesignHtml,
  containsProjectServeAccessToken,
  containsProjectServeCredential,
  decodeBinaryBase64,
  decodeExportPathEscapes,
  designSystemAssetPathPattern,
  designSystemBaseFilename,
  encodeBinaryBase64,
  exportAssetUuidPattern,
  exportBabelStandaloneIntegrity,
  exportBabelStandaloneUrl,
  exportReactDomUmdIntegrity,
  exportReactDomUmdUrl,
  exportReactUmdIntegrity,
  exportReactUmdUrl,
  formatExportByteSize,
  hasCompressedFileSignature,
  imageSlotsStateFilename,
  invalidExportAssetPathSegmentsPattern,
  isSuspiciousExportAssetPath,
  jsxAssetFilenamePattern,
  maskJavaScriptCommentsAndStrings,
  matchesNormalizedPathPattern,
  maxCssImportDepth,
  maxEmbeddedExportDepth,
  mimeTypePattern,
  normalizeExportDesignTags,
  normalizeExportHtmlOutsideScripts,
  parseExportRuntimeAssetPaths,
  parseExportSrcset,
  parseImageSlotState,
  projectServeAccessTokenPattern,
  projectServeUrlPattern,
  redactProjectServeAccessToken,
  resolveExportAssetUrl,
  safeExportColorPattern,
  sanitizeExportColor,
};
export function installExportStandaloneHtml(): () => void {
  return () => {
    safeExportColorPattern =
      /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,%\s/]+\)|hsla?\([\d.,%\s/]+\)|[a-zA-Z]+)$/;
    designSystemBaseFilename = "ds-base.js";
    exportReactUmdUrl =
      "https://cdn.jsdelivr.net/npm/react@18.3.1/umd/react.production.min.js";
    exportReactUmdIntegrity =
      "sha384-DGyLxAyjq0f9SPpVevD6IgztCFlnMF6oW/XQGmfe+IsZ8TqEiDrcHkMLKI6fiB/Z";
    exportReactDomUmdUrl =
      "https://cdn.jsdelivr.net/npm/react-dom@18.3.1/umd/react-dom.production.min.js";
    exportReactDomUmdIntegrity =
      "sha384-gTGxhz21lVGYNMcdJOyq01Edg0jhn/c22nsx0kyqP0TxaV5WVdsSH1fSDUf5YJj1";
    exportBabelStandaloneUrl =
      "https://cdn.jsdelivr.net/npm/@babel/standalone@7.29.0/babel.min.js";
    exportBabelStandaloneIntegrity =
      "sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y";
    alreadyCompressedExportMimeTypes = new Set([
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/avif",
      "image/gif",
      "video/mp4",
      "video/webm",
      "audio/mpeg",
      "audio/mp3",
      "audio/aac",
      "audio/ogg",
      "font/woff",
      "font/woff2",
      "application/zip",
      "application/gzip",
    ]);
    maxCssImportDepth = 10;
    maxEmbeddedExportDepth = 3;
    jsxAssetFilenamePattern = /\.(jsx|tsx)(\?|#|$)/i;
    mimeTypePattern = /^[\w.+-]+\/[\w.+-]+$/;
    exportAssetUuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    imageSlotsStateFilename = ".image-slots.state.json";
    projectServeUrlPattern =
      /(\/v1\/design\/projects\/[^/"'\s)>`]+\/serve\/[^"'\s)>`?#]*)(?:\?[^"'\s<)>`]*)?/g;
    projectServeAccessTokenPattern =
      /[0-9a-f]{64}\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.\d{10}/i;
    designSystemAssetPathPattern = /^\/?_ds\/(?!\.\.?(\/|$))[^/]+(\/|$)/;
    invalidExportAssetPathSegmentsPattern = /(^|\/)\.\.?(\/|$)|\/\//;
  };
}
