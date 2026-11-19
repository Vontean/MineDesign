import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { clampPreviewHeight, observePreviewHeight } from "./preview-height";
import { BLOCKED_SCRIPT_IMPORT_GUIDANCE, BLOCKED_SCRIPT_SOURCE_GUIDANCE, blockedPreviewScriptReference, hasPreviewRunnerDocument, hasRawProjectReferences, isPreviewRunnerAvailable, isPreviewRunnerCoolingDown, PREVIEW_RUNNER_PATH, previewRunnerAddresses, RAW_PROJECT_REFERENCE_GUIDANCE, recordPreviewRunnerOutcome, registerPreviewRunnerDocument, removePreviewRunnerDocument, wasPreviewRunnerRecentlyTaken } from "./preview-runner";
import { toModuleNamespace } from "../module-helpers";

var reactSwatchPreview: typeof import("react");
var SWATCH_NAVIGATING_MESSAGE: string;
var SWATCH_READY_MESSAGE: string;
var SWATCH_ERROR_MESSAGE: string;
var SWATCH_REACT_ERROR_MESSAGE: string;
var MISSING_REACT_ERROR_PATTERN: RegExp;
var PREVIEW_STORAGE_PREFIX: string;
var PREVIEW_SCOPED_STORAGE_SCRIPT: string;
var createPreviewLifecycleScript: (
  admittedCdnPrefixes: readonly string[],
) => string;
var SWATCH_ATTRIBUTE: string;
var PREVIEW_BOOT_TIMEOUT_MS: number;
var PREVIEW_IFRAME_SANDBOX: string;
var ADMITTED_PREVIEW_CDN_PREFIXES: string[];
var PREVIEW_LIFECYCLE_SCRIPT: string;
var clearedPreviewStorageWindows: WeakSet<object>;
var swatchHeadKeyCache: WeakMap<Editor.PreviewRuntimeHead, string>;
var swatchRuntimeKeyCache: WeakMap<Editor.PreviewRuntimeHead, string>;
var SWATCH_HEAD_REGISTRY_GLOBAL: string;
var SWATCH_HEAD_SEQUENCE_GLOBAL: string;
var registeredSwatchHeadIds: WeakMap<Editor.PreviewRuntimeHead, string>;
var ALL_SWATCH_HEAD_PIECES: "all";
var SWATCH_PIECE_ATTRIBUTE: string;
var SWATCH_FAILED_ATTRIBUTE: string;
var SWATCH_LOCAL_URL_PATTERN: RegExp;
var SWATCH_SHA256_INTEGRITY_PATTERN: RegExp;
var SWATCH_THEME_ID_PATTERN: RegExp;
var SWATCH_RUNTIME_TAG_URL_PATTERN: RegExp;
var SWATCH_SHA384_INTEGRITY_PATTERN: RegExp;
var SWATCH_PLACED_ATTRIBUTE: string;
var bundlePageAddressReferenceCache: WeakMap<
  Editor.PreviewRuntimeHead,
  boolean
>;
var reportedPageAddressReasons: WeakMap<object, Set<string>>;
function escapeScriptJson(json: string): string {
  return json.replaceAll("<", "\\u003c");
}
function previewIsolationScript(): string {
  return (
    `(function () {
  var rtc = ['RTCPeerConnection', 'webkitRTCPeerConnection', 'RTCDataChannel', 'RTCIceCandidate', 'RTCSessionDescription', 'RTCRtpSender', 'RTCRtpReceiver'];
  var rtcFailed = 0;
  for (var r = 0; r < rtc.length; r++) {
    try {
      Object.defineProperty(window, rtc[r], { value: undefined, writable: false, configurable: false });
    } catch (e1) {
      try { delete window[rtc[r]]; } catch (e2) {}
      try { Object.defineProperty(window, rtc[r], { value: undefined, writable: false, configurable: true }); } catch (e3) {}
    }
    if (typeof window[rtc[r]] === 'function') rtcFailed++;
  }
  if (rtcFailed > 0) {
    try { parent.postMessage({ type: 'ds-swatch:error' }, '*'); } catch (e4) {}
  }
})();
` + PREVIEW_SCOPED_STORAGE_SCRIPT
  );
}
function clearPreviewStorageOnce(
  environment: Pick<Window, "localStorage" | "sessionStorage">,
): void {
  if (clearedPreviewStorageWindows.has(environment)) {
    return;
  }
  clearedPreviewStorageWindows.add(environment);
  for (let value of ["localStorage", "sessionStorage"] as const) {
    try {
      let storedValue = environment[value],
        items = [];
      for (let index: number = 0; index < storedValue.length; index++) {
        let resolvedUrl = storedValue.key(index);
        if (resolvedUrl !== null && resolvedUrl.indexOf(PREVIEW_STORAGE_PREFIX) === 0) {
          items.push(resolvedUrl);
        }
      }
      for (let resolvedUrlA of items) {
        storedValue.removeItem(resolvedUrlA);
      }
    } catch {}
  }
}
function swatchContentHash(text: string): string {
  let hash: number = 2166136261;
  for (let index: number = 0; index < text.length; index++) {
    hash = Math.imul(hash ^ text.charCodeAt(index), 16777619);
  }
  return String(text.length) + ":" + (hash >>> 0).toString(36);
}
function swatchHeadKey(head: Editor.PreviewRuntimeHead): string {
  let cached = swatchHeadKeyCache.get(head);
  if (cached !== undefined) {
    return cached;
  }
  let key: string =
    [
      swatchContentHash(head.tokensCss),
      swatchContentHash(head.fontsKey ?? ""),
      swatchContentHash(head.bundleCss),
      swatchRuntimeKey(head),
    ].join("|") +
    "|" +
    (head.themeId ?? "") +
    "|" +
    (head.mode ?? "");
  swatchHeadKeyCache.set(head, key);
  return key;
}
function swatchRuntimeKey(head: Editor.PreviewRuntimeHead): string {
  let cached = swatchRuntimeKeyCache.get(head);
  if (cached !== undefined) {
    return cached;
  }
  let key = (head.runtimeTags ?? [])
      .map((reference): string => reference.src + "#" + reference.integrity)
      .join(","),
    value: string =
      (key === "" ? "" : key + "|") +
      head.runtimeScripts.map(swatchContentHash).join(",") +
      "|" +
      swatchContentHash(head.bundleJs);
  swatchRuntimeKeyCache.set(head, value);
  return value;
}
function swatchHeadsEqual(
  left: Editor.PreviewRuntimeHead,
  right: Editor.PreviewRuntimeHead,
): void {
  if (
    !(
      right.tokensCss === left.tokensCss &&
      right.fontsKey === left.fontsKey &&
      right.bundleCss === left.bundleCss &&
      right.bundleJs === left.bundleJs &&
      right.themeId === left.themeId &&
      right.mode === left.mode &&
      right.runtimeScripts.length === left.runtimeScripts.length &&
      right.runtimeScripts.every(
        (referenceA, swatchOptions): boolean => referenceA === left.runtimeScripts[swatchOptions],
      ) &&
      JSON.stringify(right.runtimeTags ?? []) ===
        JSON.stringify(left.runtimeTags ?? [])
    )
  ) {
    return;
  }
  let entry = swatchHeadKeyCache.get(left),
    cachedEntry = swatchRuntimeKeyCache.get(left);
  if (entry !== undefined) {
    swatchHeadKeyCache.set(right, entry);
  }
  if (cachedEntry !== undefined) {
    swatchRuntimeKeyCache.set(right, cachedEntry);
  }
}
function nextSwatchHeadId(environment: object): string {
  let globalObject = environment as Record<string, unknown>,
    sequence =
      (typeof globalObject[SWATCH_HEAD_SEQUENCE_GLOBAL] === "number"
        ? (globalObject[SWATCH_HEAD_SEQUENCE_GLOBAL] as number)
        : 0) + 1;
  globalObject[SWATCH_HEAD_SEQUENCE_GLOBAL] = sequence;
  return "h" + String(sequence);
}
function swatchHeadRegistry(
  environment: object,
): Map<string, Editor.SwatchHeadEntry> {
  let globalObject = environment as Record<string, unknown>,
    registry = globalObject[SWATCH_HEAD_REGISTRY_GLOBAL];
  if (registry === undefined) {
    registry = new Map();
    globalObject[SWATCH_HEAD_REGISTRY_GLOBAL] = registry;
  }
  return registry as Map<string, Editor.SwatchHeadEntry>;
}
function swatchHeadPieceReference(
  head: Editor.PreviewRuntimeHead,
  piece: string | number,
): Editor.SwatchUrlReference | undefined {
  let urls = head.urls;
  if (urls === undefined) {
    return;
  }
  if (piece === "c") {
    return urls.bundleCss;
  }
  if (piece === "b") {
    return urls.bundleJs;
  }
  let value = typeof piece === "string" ? /^f([0-9]+)$/.exec(piece) : null;
  if (value !== null) {
    return urls.fonts[Number(value[1])];
  }
  if (
    typeof piece === "number" ||
    (typeof piece === "string" && /^[0-9]+$/.test(piece))
  ) {
    return urls.runtimeScripts[Number(piece)];
  } else {
    return undefined;
  }
}
function retainSwatchHead(
  environment: object,
  head: Editor.PreviewRuntimeHead,
  onMissed?: (reference: Editor.SwatchUrlReference) => void,
): string {
  let registry = swatchHeadRegistry(environment),
    existingId = registeredSwatchHeadIds.get(head),
    existing =
      existingId === undefined ? undefined : registry.get(existingId);
  if (
    existingId !== undefined &&
    existing !== undefined &&
    existing.head === head
  ) {
    existing.refs += 1;
    return existingId;
  }
  existingId = nextSwatchHeadId(environment);
  registeredSwatchHeadIds.set(head, existingId);
  let id = (referenceB: string | number): void => {
    let value = swatchHeadPieceReference(head, referenceB);
    if (value !== undefined) {
      onMissed?.(value);
    }
  };
  registry.set(existingId, {
    head: head,
    refs: 1,
    missed: id,
  });
  return existingId;
}
function releaseSwatchHead(environment: object, id: string): void {
  let registry = swatchHeadRegistry(environment),
    entry = registry.get(id);
  if (entry === undefined) {
    return;
  }
  entry.refs -= 1;
  if (entry.refs <= 0) {
    registry.delete(id);
  }
}
function swatchHeadScript(
  id: string,
  pieces: "all" | readonly Editor.HeadScriptPiece[] = ALL_SWATCH_HEAD_PIECES,
  withUrlFallback: boolean = false,
): string {
  if (!/^h[0-9]+$/.test(id)) {
    throw Error(uiMessage("design-system.swatchRuntime.swatchHeadIdOutsideIts") + id);
  }
  if (pieces !== ALL_SWATCH_HEAD_PIECES) {
    return swatchHeadPiecesScript(id, pieces, withUrlFallback);
  }
  return (
    `(function () {
  var d = document, h = d.head || d.documentElement;
  var reg = parent['` +
    SWATCH_HEAD_REGISTRY_GLOBAL +
    `'];
  var e = reg && typeof reg.get === 'function' ? reg.get('` +
    id +
    `') : undefined;
  if (!e || !e.head) throw new Error('design-system preview: head ` +
    id +
    ` is not on the page');
  var H = e.head;
  function css(t) { if (!t) return; var s = d.createElement('style'); s.textContent = t; h.appendChild(s); }
  function js(t) { if (!t) return; var s = d.createElement('script'); s.text = t; h.appendChild(s); }
  css('html{overflow:hidden!important}');
  css(H.tokensCss);
  css(H.fontsCss);
  css(H.bundleCss);
  H.runtimeScripts.forEach(function (t) { js(t); });
  js(H.bundleJs);
})();`
  );
}
function swatchHeadPiecesScript(
  id: string,
  pieces: readonly Editor.HeadScriptPiece[],
  withUrlFallback: boolean,
): string {
  let callback = (referenceC: Editor.HeadScriptPiece) => {
    if (typeof referenceC === "number") {
      if (!Number.isInteger(referenceC) || referenceC < 0) {
        throw Error(
          uiMessage("design-system.swatchRuntime.swatchHeadPieceOutsideIts") + String(referenceC),
        );
      }
      return (
        "  js(H.runtimeScripts[" +
        String(referenceC) +
        `]);
`
      );
    }
    return {
      o: `  css('html{overflow:hidden!important}');
`,
      t: `  css(H.tokensCss);
`,
      f: `  F = css(H.fontsCss); byUrlFaces = !!F;
`,
      F: `  css(H.fontsCssHeld || H.fontsCss);
`,
      c: `  css(H.bundleCss);
`,
      b: `  js(H.bundleJs);
`,
    }[referenceC];
  };
  return (
    `(function () {
  var d = document, h = d.head || d.documentElement, F = null, byUrlFaces = false;
  var reg = parent['` +
    SWATCH_HEAD_REGISTRY_GLOBAL +
    `'];
  var e = reg && typeof reg.get === 'function' ? reg.get('` +
    id +
    `') : undefined;
  if (!e || !e.head) throw new Error('design-system preview: head ` +
    id +
    ` is not on the page');
  var H = e.head, U = H.urls || {};
` +
    (withUrlFallback
      ? "  var L = U.bundleCss ? d.querySelector('head > link[" +
        SWATCH_PIECE_ATTRIBUTE +
        `="c"]') : null;
  if (L && L.getAttribute('href') !== U.bundleCss.url) L = null;
`
      : `  var L = null;
`) +
    `  function css(t) { if (!t) return null; var s = d.createElement('style'); s.textContent = t; if (L) h.insertBefore(s, L); else h.appendChild(s); return s; }
  function js(t) { if (!t) return; var s = d.createElement('script'); s.text = t; h.appendChild(s); }
` +
    (withUrlFallback
      ? `  function missed(k) { try { if (typeof e.missed === 'function') e.missed(k); } catch (x) {} }
  d.addEventListener('error', function (ev) {
    var t = ev.target, k = t && t.tagName === 'SCRIPT' && t.getAttribute ? t.getAttribute('` +
        SWATCH_PIECE_ATTRIBUTE +
        `') : null;
    var u = k === 'b' ? U.bundleJs : k === null ? undefined : (U.runtimeScripts || [])[Number(k)];
    var text = k === 'b' ? H.bundleJs : H.runtimeScripts[Number(k)];
    if (!u || t.getAttribute('src') !== u.url || typeof text !== 'string' || !t.parentNode) return;
    var s = d.createElement('script');
    s.text = text;
    t.parentNode.replaceChild(s, t);
    missed(k === 'b' ? k : Number(k));
  }, true);
  try {
    var norm = function (v) { v = String(v).replace(/^["']|["']$/g, '').toLowerCase(); return v === 'normal' ? '400' : v === 'bold' ? '700' : v; };
    var slant = function (v) { return String(v).toLowerCase().split(' ')[0]; };
    var ask = typeof fetch === 'function' ? fetch : null, asked = {};
    d.fonts.addEventListener('loadingerror', function (ev) {
      if (!byUrlFaces) return;
      var faces = ev.fontfaces || [], ours = U.fonts || [];
      for (var i = faces.length - 1; i >= 0; i--) for (var j = ours.length - 1; j >= 0; j--) {
        var a = faces[i], b = ours[j].face;
        if (!H.fontsCssHeld || !b || norm(a.family) !== norm(b.family) || norm(a.weight) !== norm(b.weight) || slant(a.style) !== slant(b.style)) continue;
        if (F) { F.textContent = H.fontsCssHeld; F = null; }
        if (asked[j] || !ask) continue;
        asked[j] = 1;
        (function (j) {
          var told = function () { missed('f' + j); };
          try {
            ask(ours[j].url).then(function (r) {
              if (!r.ok) told();
              try { if (r.body) r.body.cancel(); } catch (x) {}
            }, told);
          } catch (x) {}
        })(j);
      }
    });
  } catch (x) {}
`
      : "") +
    pieces.map(callback).join("") +
    (withUrlFallback
      ? `  function sheetFailed() { if (!L || !L.parentNode) return; var s = d.createElement('style'); s.textContent = H.bundleCss; L.parentNode.replaceChild(s, L); L = null; missed('c'); }
  if (L) { if (L.hasAttribute('` +
        SWATCH_FAILED_ATTRIBUTE +
        `')) sheetFailed(); else L.addEventListener('error', sheetFailed); }
`
      : "") +
    "})();"
  );
}
function swatchPublishedPieceTag(
  piece: string | number,
  reference: Editor.SwatchUrlReference,
): string | undefined {
  if (
    !SWATCH_LOCAL_URL_PATTERN.test(reference.url) ||
    reference.integrity === undefined ||
    !SWATCH_SHA256_INTEGRITY_PATTERN.test(reference.integrity)
  ) {
    return;
  }
  let attributes: string =
    '="' +
    reference.url +
    '" integrity="' +
    reference.integrity +
    '" ' +
    SWATCH_PIECE_ATTRIBUTE +
    '="' +
    String(piece) +
    '"';
  if (piece === "c") {
    return (
      '<link rel="stylesheet" href' +
      attributes +
      ` onerror="this.setAttribute('` +
      SWATCH_FAILED_ATTRIBUTE +
      `','')">`
    );
  } else {
    return "<script src" + attributes + "><\/script>";
  }
}
function swatchHtmlAttributes(head: Editor.PreviewRuntimeHead): string {
  let themeId =
      head.themeId !== undefined && SWATCH_THEME_ID_PATTERN.test(head.themeId)
        ? head.themeId
        : "",
    mode = head.mode === "dark" || head.mode === "light" ? head.mode : "";
  if (themeId === "" && mode === "") {
    return "";
  }
  let classes =
      themeId === mode
        ? [themeId]
        : [themeId, mode].filter((referenceD): boolean => referenceD !== ""),
    colorScheme =
      head.colorScheme === "dark" || head.colorScheme === "light"
        ? head.colorScheme
        : mode;
  return (
    (themeId !== "" ? ' data-theme="' + themeId + '"' : "") +
    (mode !== ""
      ? ' data-mode="' + mode + '" style="color-scheme:' + colorScheme + '"'
      : "") +
    ' class="' +
    classes.join(" ") +
    '"'
  );
}
function swatchRuntimeTagHtml(tag: Model.SwatchRuntimeTag): string {
  if (
    !SWATCH_RUNTIME_TAG_URL_PATTERN.test(tag.src) ||
    !SWATCH_SHA384_INTEGRITY_PATTERN.test(tag.integrity)
  ) {
    throw Error(uiMessage("design-system.swatchRuntime.swatchRuntimeTagOutsideIts") + tag.src);
  }
  return (
    '<script src="' +
    tag.src +
    '" integrity="' +
    tag.integrity +
    '" crossorigin="anonymous"><\/script>'
  );
}
function swatchDocumentHtml(
  html: string,
  head: Editor.PreviewRuntimeHead,
  headId: string,
  holdFonts: boolean = false,
): string {
  let placement = swatchHeadPlacement(head.urls, headId, holdFonts);
  return (
    "<!doctype html><html" +
    swatchHtmlAttributes(head) +
    '><head><meta name="referrer" content="no-referrer">' +
    placement.head +
    "</head><body><script>" +
    previewIsolationScript() +
    "<\/script><script>" +
    PREVIEW_LIFECYCLE_SCRIPT +
    "<\/script>" +
    (head.runtimeTags ?? []).map(swatchRuntimeTagHtml).join("") +
    placement.body +
    html +
    "</body></html>"
  );
}
function swatchHeadPlacement(
  urls: Editor.PreviewRuntimeUrls | undefined,
  headId: string,
  holdFonts: boolean,
): {
  head: string;
  body: string;
} {
  let inlineHeadScript = (
    referenceE?: readonly Editor.HeadScriptPiece[],
    swatchOptionsA: boolean = false,
  ): string =>
    "<script>" + swatchHeadScript(headId, referenceE, swatchOptionsA) + "<\/script>";
  if (urls === undefined) {
    return {
      head: "",
      body: inlineHeadScript(),
    };
  }
  let scriptTags = [
      ...urls.runtimeScripts.map((referenceF, swatchOptionsB) => ({
        piece: swatchOptionsB,
        ref: referenceF,
      })),
      {
        piece: "b" as const,
        ref: urls.bundleJs,
      },
    ].map(({ piece: piece, ref: ref }) => ({
      piece: piece,
      tag:
        ref === undefined ? undefined : swatchPublishedPieceTag(piece, ref),
    })),
    cssTag =
      urls.bundleCss === undefined ||
      scriptTags[scriptTags.length - 1]?.tag === undefined
        ? undefined
        : swatchPublishedPieceTag("c", urls.bundleCss),
    hasPublishedTags =
      cssTag !== undefined ||
      scriptTags.some((referenceG): boolean => referenceG.tag !== undefined),
    hasUrlPieces = hasPublishedTags || (!holdFonts && urls.fonts.length > 0),
    bodyHtml = "",
    pendingPieces: Editor.HeadScriptPiece[] = [
      "o",
      "t",
      holdFonts ? "F" : "f",
      ...(cssTag === undefined ? ["c" as const] : []),
    ],
    firstBlock: boolean = true,
    flushInlinePieces = (): void => {
      if (pendingPieces.length > 0) {
        bodyHtml += inlineHeadScript(
          pendingPieces,
          firstBlock && hasUrlPieces,
        );
      }
      pendingPieces = [];
      firstBlock = false;
    };
  for (let { piece: value, tag: storedValueA } of scriptTags) {
    if (storedValueA === undefined) {
      pendingPieces.push(value);
    } else {
      flushInlinePieces();
      bodyHtml += storedValueA;
    }
  }
  flushInlinePieces();
  return {
    head: cssTag ?? "",
    body:
      bodyHtml +
      (hasPublishedTags
        ? "<script " + SWATCH_PLACED_ATTRIBUTE + "><\/script>"
        : ""),
  };
}
function syncSwatchTheme(
  iframe: HTMLIFrameElement,
  head: readonly Editor.SwatchUrlReference[],
): Editor.HeadPlacementState {
  let value: Document | null;
  try {
    value = iframe.contentDocument;
  } catch {
    value = null;
  }
  if (value === null) {
    return {
      state: "gone",
    };
  }
  if (
    value.querySelector("script[" + SWATCH_PLACED_ATTRIBUTE + "]") !== null
  ) {
    return {
      state: "placed",
    };
  }
  let items = [...value.querySelectorAll("[" + SWATCH_PIECE_ATTRIBUTE + "]")];
  if (items.length === 0) {
    return {
      state: value.readyState === "loading" ? "not-reached" : "no-document",
    };
  }
  let values = new Set(
      items.map(
        (element) =>
          element.getAttribute("src") ?? element.getAttribute("href") ?? "",
      ),
    ),
    storedValueB: string[] | undefined;
  try {
    storedValueB = iframe.contentWindow?.performance
      .getEntriesByType("resource")
      .map((referenceH) => new URL(referenceH.name).pathname);
  } catch {
    storedValueB = undefined;
  }
  if (storedValueB !== undefined) {
    let callback = (referenceI: Editor.SwatchUrlReference) =>
        storedValueB!.includes(referenceI.url),
      fontReference = head.find(
        (referenceJ) => values.has(referenceJ.url) && !callback(referenceJ),
      );
    if (fontReference !== undefined) {
      return {
        state: "waiting",
        on: fontReference,
      };
    }
    if (
      value.readyState === "loading" &&
      head.some((referenceK): boolean => !values.has(referenceK.url))
    ) {
      return {
        state: "not-reached",
      };
    } else {
      return {
        state: "placed",
      };
    }
  }
  let resolvedUrlB = items[items.length - 1],
    matchedReference =
      resolvedUrlB?.getAttribute("src") ?? resolvedUrlB?.getAttribute("href") ?? null;
  return {
    state: "waiting",
    on: head.find((referenceL): boolean => referenceL.url === matchedReference),
  };
}
function swatchHeadWithHeldFonts(
  head: Editor.PreviewRuntimeHead,
  changes: string,
  heldFonts?: (url: string) => boolean,
): Editor.SwatchHeadUrls {
  let urls = head.urls;
  if (urls === undefined) {
    return {
      urls: undefined,
      heldFonts: false,
      awaited: [],
    };
  }
  let value =
      urls.runtimeScripts.length === head.runtimeScripts.length
        ? urls.runtimeScripts
        : head.runtimeScripts.map((): undefined => {
            return;
          }),
    text = "";
  try {
    text = new URL(".", changes).pathname;
  } catch {}
  let callback = (
      referenceM: Editor.SwatchUrlReference | undefined,
    ): referenceM is Editor.SwatchUrlReference =>
      referenceM !== undefined &&
      text.length > 1 &&
      referenceM.url.startsWith(text) &&
      (heldFonts === undefined || heldFonts(referenceM.url)),
    isHeldFont = (referenceN: Editor.SwatchUrlReference | undefined) =>
      callback(referenceN) && swatchPublishedPieceTag("b", referenceN) !== undefined
        ? referenceN
        : undefined,
    storedValueC = urls.fonts.every(callback),
    resolvedUrlC = isHeldFont(urls.bundleJs),
    state = {
      bundleCss: resolvedUrlC === undefined ? undefined : isHeldFont(urls.bundleCss),
      runtimeScripts: value.map(isHeldFont),
      bundleJs: resolvedUrlC,
      fonts: storedValueC ? urls.fonts : [],
    },
    matchedReferenceA = [
      state.bundleCss,
      ...state.runtimeScripts,
      state.bundleJs,
    ].filter(
      (referenceO): referenceO is Editor.SwatchUrlReference => referenceO !== undefined,
    );
  if (matchedReferenceA.length === 0 && urls.fonts.length === 0) {
    return {
      urls: undefined,
      heldFonts: false,
      awaited: matchedReferenceA,
    };
  }
  return {
    urls: state,
    heldFonts: urls.fonts.length > 0 && !storedValueC,
    awaited: matchedReferenceA,
  };
}
function windowOrigin(environment: {
  origin?: unknown;
  location?: {
    origin?: unknown;
  };
}): string {
  let value = environment;
  if (typeof value.origin === "string") {
    return value.origin;
  }
  if (typeof value.location?.origin === "string") {
    return value.location.origin;
  } else {
    return "null";
  }
}
function createLiveSwatch(
  swatchOptionsC: Editor.LiveSwatchOptions,
): Editor.LiveSwatch {
  let value = swatchOptionsC.doc ?? document,
    storedValueD = swatchOptionsC.win ?? window;
  clearPreviewStorageOnce(storedValueD);
  let resolvedUrlD = retainSwatchHead(storedValueD, swatchOptionsC.head, swatchOptionsC.onUrlMissed),
    matchedReferenceB = value.createElement("iframe");
  matchedReferenceB.setAttribute("sandbox", PREVIEW_IFRAME_SANDBOX);
  let fontReferenceA = swatchHeadWithHeldFonts(
      swatchOptionsC.head,
      value.baseURI,
      swatchOptionsC.urlOffered,
    ),
    documentHtml = swatchDocumentHtml(
      swatchOptionsC.html,
      {
        ...swatchOptionsC.head,
        urls: fontReferenceA.urls,
      },
      resolvedUrlD,
      fontReferenceA.heldFonts,
    ),
    pageAddress =
      swatchOptionsC.cardFile !== undefined &&
      isPreviewRunnerAvailable(storedValueD)
        ? previewRunnerAddresses(swatchOptionsC.cardFile, value.baseURI)
        : null,
    cardTarget =
      pageAddress !== null && !swatchRequiresPageAddress(storedValueD, swatchOptionsC)
        ? pageAddress
        : null,
    runnerStartedAt: number | undefined,
    runnerState =
      cardTarget !== null
        ? registerPreviewRunnerDocument(
            storedValueD,
            cardTarget.card,
            documentHtml,
            {
              remove: () => matchedReferenceB.remove(),
              notify: () => reportRunnerOutcome("suspended", ""),
              taken: (): void => {
                runnerStartedAt = storedValueD.performance.now();
              },
            },
          )
        : undefined;
  if (runnerState === undefined) {
    runnerStartedAt = storedValueD.performance.now();
  }
  matchedReferenceB.setAttribute(
    SWATCH_ATTRIBUTE,
    runnerState !== undefined ? "runner" : "",
  );
  matchedReferenceB.tabIndex = -1;
  matchedReferenceB.referrerPolicy = "no-referrer";
  matchedReferenceB.title = swatchOptionsC.title;
  matchedReferenceB.style.width = "100%";
  matchedReferenceB.style.height = "100%";
  matchedReferenceB.style.border = "0";
  matchedReferenceB.style.display = "block";
  matchedReferenceB.style.background = "transparent";
  let flag: boolean = false,
    isAvailable: boolean = false,
    callback = (): void => {
      return;
    };
  function releaseRunner(): void {
    if (flag) {
      return;
    }
    flag = true;
    callback();
    swatchOptionsC.onNavigated();
  }
  let cleanupTimer: ReturnType<typeof setTimeout> | undefined,
    isRunnerUnavailable: boolean = runnerState === undefined;
  function reportRunnerOutcome(
    referenceP: "suspended" | "refused" | "unclear",
    swatchOptionsD: string,
  ) {
    if (isRunnerUnavailable || isAvailable || runnerState === undefined) {
      return;
    }
    isRunnerUnavailable = true;
    if (referenceP === "suspended") {
      return void swatchOptionsC.onUndelivered?.();
    }
    removePreviewRunnerDocument(storedValueD, runnerState);
    if (
      recordPreviewRunnerOutcome(storedValueD, referenceP, runnerState).tell
    ) {
      console.warn(
        'design-system: "' +
          swatchOptionsC.title +
          '" could not load through ' +
          PREVIEW_RUNNER_PATH +
          " (" +
          swatchOptionsD +
          ") and was loaded without an address of its own, so files its card names by relative path will not load" +
          (isPreviewRunnerCoolingDown(storedValueD)
            ? "; previews that start in the next moment load the same way, and ones that start after that try " +
              PREVIEW_RUNNER_PATH +
              " again"
            : isPreviewRunnerAvailable(storedValueD)
              ? ""
              : "; later previews on this page will load the same way until the page is reloaded"),
      );
    }
    swatchOptionsC.onUndelivered?.();
  }
  let index = 0;
  matchedReferenceB.addEventListener("load", () => {
    if (cardTarget !== null && runnerState !== undefined && !isRunnerUnavailable) {
      if (isBlankPreviewFrame(matchedReferenceB)) {
        return;
      }
      if (hasPreviewRunnerDocument(storedValueD, runnerState)) {
        return reportRunnerOutcome(
          "refused",
          "run.html was missing, was refused, or loaded without running the preview",
        );
      }
      if (previewFramePathname(matchedReferenceB) === cardTarget.runner) {
        return reportRunnerOutcome("unclear", uiMessage("design-system.swatchRuntime.itDidNotReachIts"));
      }
      isRunnerUnavailable = true;
      recordPreviewRunnerOutcome(storedValueD, "worked", runnerState);
    }
    index += 1;
    if (index > 1) {
      releaseRunner();
    }
  });
  let isAvailableA: boolean = false,
    swatchValue = windowOrigin(storedValueD),
    isHeldFontA = (dataset: MessageEvent<unknown>): void => {
      let swatchValueA = classifyPreviewMessage(
        {
          source: dataset.source,
          origin: dataset.origin,
          data: dataset.data,
        },
        matchedReferenceB.contentWindow,
        swatchValue,
        flag,
      );
      if (swatchValueA === "navigating") {
        releaseRunner();
      } else if (swatchValueA === "ready") {
        if (!isAvailableA) {
          isAvailableA = true;
          swatchOptionsC.onReady?.(previewMessageHeight(dataset.data));
          if (swatchOptionsC.onContentHeight !== undefined && !flag) {
            callback = observePreviewHeight(
              matchedReferenceB,
              swatchOptionsC.onContentHeight,
              swatchOptionsC.declaredHeight,
            );
          }
        }
      } else if (swatchValueA === "error" || swatchValueA === "error-react") {
        swatchOptionsC.onError?.(swatchValueA === "error-react" ? "react" : undefined);
      }
    };
  storedValueD.addEventListener("message", isHeldFontA);
  if (cardTarget === null || runnerState === undefined) {
    matchedReferenceB.srcdoc = documentHtml;
  } else {
    matchedReferenceB.src = cardTarget.runner + "#" + runnerState;
    let swatchValueB = swatchOptionsC.runnerAskMs ?? PREVIEW_BOOT_TIMEOUT_MS,
      swatchValueC = 0,
      swatchValueD = 0,
      isHeldFontB = (): void => {
        if (
          isRunnerUnavailable ||
          !hasPreviewRunnerDocument(storedValueD, runnerState)
        ) {
          return;
        }
        if (
          value.hidden ||
          (previewFramePathname(matchedReferenceB) === cardTarget.runner &&
            (swatchValueC += 1) <= 3) ||
          (wasPreviewRunnerRecentlyTaken(storedValueD, swatchValueB) &&
            (swatchValueD += 1) <= 8)
        ) {
          cleanupTimer = setTimeout(isHeldFontB, swatchValueB);
        } else {
          cleanupTimer = setTimeout((): void => {
            if (hasPreviewRunnerDocument(storedValueD, runnerState)) {
              reportRunnerOutcome("unclear", "run.html did not start in time");
            }
          }, 0);
        }
      };
    cleanupTimer = setTimeout(isHeldFontB, swatchValueB);
  }
  return {
    iframe: matchedReferenceB,
    awaited: fontReferenceA.awaited,
    headProgress: () => syncSwatchTheme(matchedReferenceB, fontReferenceA.awaited),
    documentAgeMs: () =>
      runnerStartedAt === undefined ? undefined : storedValueD.performance.now() - runnerStartedAt,
    dispose: (): void => {
      if (isAvailable) {
        return;
      }
      isAvailable = true;
      callback();
      clearTimeout(cleanupTimer);
      storedValueD.removeEventListener("message", isHeldFontA);
      if (runnerState !== undefined) {
        removePreviewRunnerDocument(storedValueD, runnerState);
      }
      matchedReferenceB.remove();
      releaseSwatchHead(storedValueD, resolvedUrlD);
    },
  };
}
function swatchRequiresPageAddress(
  environment: object,
  swatchOptionsE: Editor.LiveSwatchOptions,
): boolean {
  let bundleHasPageReference = bundlePageAddressReferenceCache.get(
    swatchOptionsE.head,
  );
  if (bundleHasPageReference === undefined) {
    bundlePageAddressReferenceCache.set(
      swatchOptionsE.head,
      (bundleHasPageReference =
        hasRawProjectReferences(
          swatchOptionsE.head.bundleCss,
          "bundle",
        ) ||
        hasRawProjectReferences(
          swatchOptionsE.head.bundleJs,
          "bundle",
        )),
    );
  }
  let hasPageReference =
      bundleHasPageReference ||
      hasRawProjectReferences(swatchOptionsE.html, "card"),
    blockedScript =
      !hasPageReference &&
      swatchOptionsE.fromProps !== true &&
      blockedPreviewScriptReference(
        swatchOptionsE.html,
        swatchOptionsE.cardFile ?? "",
      );
  if (!hasPageReference && blockedScript === false) {
    return false;
  }
  let reported = reportedPageAddressReasons.get(environment) ?? new Set();
  reportedPageAddressReasons.set(environment, reported);
  let propsHavePageReference =
      !bundleHasPageReference && swatchOptionsE.fromProps === true,
    reasonKey: string = bundleHasPageReference
      ? ""
      : (blockedScript !== false
          ? `script
`
          : propsHavePageReference
            ? `props
`
            : "") + (swatchOptionsE.cardFile ?? "");
  if (!reported.has(reasonKey)) {
    if ((reported.add(reasonKey), typeof blockedScript === "string")) {
      console.info(
        'design-system: "' +
          swatchOptionsE.title +
          '" keeps the page’s address because its card names a script by a relative path (' +
          JSON.stringify(
            blockedScript.length > 80
              ? blockedScript.slice(0, 80) + "…"
              : blockedScript,
          ) +
          ") that may be a file the page adds itself, which would then run twice. So a file named relative to the card will not load. " +
          BLOCKED_SCRIPT_SOURCE_GUIDANCE,
      );
    } else if (blockedScript) {
      console.info(
        'design-system: "' +
          swatchOptionsE.title +
          `" keeps the page’s address because an inline script in its card imports './…' or '../…', or its import map points to such a path, which may be a file the page adds itself and would then run twice. So a file named relative to the card will not load. ` +
          BLOCKED_SCRIPT_IMPORT_GUIDANCE,
      );
    } else if (propsHavePageReference) {
      console.info(
        'design-system: "' +
          swatchOptionsE.title +
          '" keeps the page’s address while a value in Props reads as a path from the page’s folder ("_blob/…" or "project/…"), so a file named relative to the card will not load there. If it is a path, write it as "/_blob/<id>" or relative to the card and the preview gets its card’s address.',
      );
    } else {
      console.info(
        "design-system: " +
          (bundleHasPageReference
            ? "this system’s previews keep"
            : '"' + swatchOptionsE.title + '" keeps') +
          " the page’s address, so a file named relative to the card will not load there: " +
          (bundleHasPageReference
            ? "its bundle.css or bundle.js"
            : "its card") +
          ' names something from the page’s folder ("_blob/…" or "project/…"). ' +
          RAW_PROJECT_REFERENCE_GUIDANCE +
          " and " +
          (bundleHasPageReference ? "each" : "the") +
          " preview gets its card’s address.",
      );
    }
  }
  return true;
}
function isBlankPreviewFrame(iframe: HTMLIFrameElement): boolean {
  try {
    return iframe.contentWindow?.location.href === "about:blank";
  } catch {
    return false;
  }
}
function previewFramePathname(iframe: HTMLIFrameElement): string | undefined {
  try {
    return iframe.contentWindow?.location.pathname;
  } catch {
    return;
  }
}
function classifyPreviewMessage(
  event: Pick<MessageEvent<unknown>, "source" | "origin" | "data">,
  frameWindow: Window | null,
  origin: string,
  navigated: boolean,
): Editor.PreviewMessageKind {
  if (frameWindow === null || event.source !== frameWindow) {
    return "drop";
  }
  if (event.origin !== origin) {
    return "drop";
  }
  if (navigated) {
    return "drop";
  }
  let message = event.data as {
    type?: unknown;
  } | null;
  if (typeof message !== "object" || message === null) {
    return "drop";
  }
  if (message.type === SWATCH_NAVIGATING_MESSAGE) {
    return "navigating";
  }
  if (message.type === SWATCH_READY_MESSAGE) {
    return "ready";
  }
  if (message.type === SWATCH_ERROR_MESSAGE) {
    return "error";
  }
  if (message.type === SWATCH_REACT_ERROR_MESSAGE) {
    return "error-react";
  }
  return "drop";
}
function previewMessageHeight(message: unknown): number | undefined {
  let height = (
    message as
      | {
          h?: unknown;
        }
      | null
      | undefined
  )?.h;
  if (typeof height !== "number" || !Number.isFinite(height)) {
    return;
  }
  return clampPreviewHeight(height);
}
export {
  ADMITTED_PREVIEW_CDN_PREFIXES,
  ALL_SWATCH_HEAD_PIECES,
  bundlePageAddressReferenceCache,
  classifyPreviewMessage,
  clearedPreviewStorageWindows,
  clearPreviewStorageOnce,
  createLiveSwatch,
  createPreviewLifecycleScript,
  escapeScriptJson,
  isBlankPreviewFrame,
  MISSING_REACT_ERROR_PATTERN,
  nextSwatchHeadId,
  PREVIEW_BOOT_TIMEOUT_MS,
  PREVIEW_IFRAME_SANDBOX,
  PREVIEW_LIFECYCLE_SCRIPT,
  PREVIEW_SCOPED_STORAGE_SCRIPT,
  PREVIEW_STORAGE_PREFIX,
  previewFramePathname,
  previewIsolationScript,
  previewMessageHeight,
  reactSwatchPreview,
  registeredSwatchHeadIds,
  releaseSwatchHead,
  reportedPageAddressReasons,
  retainSwatchHead,
  SWATCH_ATTRIBUTE,
  SWATCH_ERROR_MESSAGE,
  SWATCH_FAILED_ATTRIBUTE,
  SWATCH_HEAD_REGISTRY_GLOBAL,
  SWATCH_HEAD_SEQUENCE_GLOBAL,
  SWATCH_LOCAL_URL_PATTERN,
  SWATCH_NAVIGATING_MESSAGE,
  SWATCH_PIECE_ATTRIBUTE,
  SWATCH_PLACED_ATTRIBUTE,
  SWATCH_REACT_ERROR_MESSAGE,
  SWATCH_READY_MESSAGE,
  SWATCH_RUNTIME_TAG_URL_PATTERN,
  SWATCH_SHA256_INTEGRITY_PATTERN,
  SWATCH_SHA384_INTEGRITY_PATTERN,
  SWATCH_THEME_ID_PATTERN,
  swatchContentHash,
  swatchDocumentHtml,
  swatchHeadKey,
  swatchHeadKeyCache,
  swatchHeadPieceReference,
  swatchHeadPiecesScript,
  swatchHeadPlacement,
  swatchHeadRegistry,
  swatchHeadScript,
  swatchHeadsEqual,
  swatchHeadWithHeldFonts,
  swatchHtmlAttributes,
  swatchPublishedPieceTag,
  swatchRequiresPageAddress,
  swatchRuntimeKey,
  swatchRuntimeKeyCache,
  swatchRuntimeTagHtml,
  syncSwatchTheme,
  windowOrigin,
};
export function installEditorSwatchRuntime(): () => void {
  return () => {
    reactSwatchPreview = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    SWATCH_NAVIGATING_MESSAGE = "ds-swatch:navigating";
    SWATCH_READY_MESSAGE = "ds-swatch:ready";
    SWATCH_ERROR_MESSAGE = "ds-swatch:error";
    SWATCH_REACT_ERROR_MESSAGE = "ds-swatch:error-react";
    MISSING_REACT_ERROR_PATTERN =
      /^(?:Uncaught )?ReferenceError: (?:(?:React|ReactDOM) is not defined|Can't find variable: (?:React|ReactDOM))$/;
    PREVIEW_STORAGE_PREFIX = "preview:";
    PREVIEW_SCOPED_STORAGE_SCRIPT =
      `(function () {
  var PREFIX = '` +
      PREVIEW_STORAGE_PREFIX +
      `';
  var memory = function () {
    var m = Object.create(null);
    return {
      getItem: function (k) { return k in m ? m[k] : null; },
      setItem: function (k, v) { m[k] = String(v); },
      removeItem: function (k) { delete m[k]; },
      key: function (i) { var ks = Object.keys(m); i = Math.floor(Number(i)) || 0; return i >= 0 && i < ks.length ? ks[i] : null; },
      get length() { return Object.keys(m).length; }
    };
  };
  var scope = function (real) {
    var keys = function () {
      var out = [];
      for (var i = 0, n = real.length; i < n; i++) { var k = real.key(i); if (k !== null && k.indexOf(PREFIX) === 0) out.push(k.slice(PREFIX.length)); }
      return out;
    };
    var api = {
      getItem: function (k) { return real.getItem(PREFIX + String(k)); },
      setItem: function (k, v) { real.setItem(PREFIX + String(k), String(v)); },
      removeItem: function (k) { real.removeItem(PREFIX + String(k)); },
      clear: function () { keys().forEach(function (k) { real.removeItem(PREFIX + k); }); },
      key: function (i) { var ks = keys(); i = Math.floor(Number(i)) || 0; return i >= 0 && i < ks.length ? ks[i] : null; },
      get length() { return keys().length; }
    };
    if (typeof Proxy !== 'function') return api;
    var own = function (p) { return typeof p === 'string' && !(p in api) && p !== 'length'; };
    return new Proxy(api, {
      get: function (t, p) { if (p === 'length') return keys().length; if (p in api) return api[p]; if (!own(p)) return undefined; var v = real.getItem(PREFIX + p); return v === null ? undefined : v; },
      set: function (t, p, v) { if (own(p)) real.setItem(PREFIX + p, String(v)); return true; },
      deleteProperty: function (t, p) { if (own(p)) real.removeItem(PREFIX + p); return true; },
      has: function (t, p) { return p in api || p === 'length' || (own(p) && real.getItem(PREFIX + p) !== null); },
      ownKeys: function () { return keys(); },
      getOwnPropertyDescriptor: function (t, p) { if (!own(p)) return undefined; var v = real.getItem(PREFIX + p); return v === null ? undefined : { value: v, writable: true, enumerable: true, configurable: true }; }
    });
  };
  var natives = {};
  var views = {};
  ['localStorage', 'sessionStorage'].forEach(function (n) {
    var real = null;
    try { real = window[n]; } catch (e) { real = null; }
    if (!real || typeof real.getItem !== 'function') real = memory();
    natives[n] = real;
    views[n] = scope(real);
    try { Object.defineProperty(window, n, { value: views[n], configurable: true }); } catch (e) {}
  });
  try {
    window.addEventListener('storage', function (e) {
      if (!e.isTrusted) return;
      var k = e.key;
      var area = e.storageArea === natives.localStorage ? views.localStorage : e.storageArea === natives.sessionStorage ? views.sessionStorage : null;
      if (k === null || (typeof k === 'string' && k.indexOf(PREFIX) === 0)) {
        try { Object.defineProperties(e, { key: { value: k === null ? null : k.slice(PREFIX.length), configurable: true }, storageArea: { value: area, configurable: true } }); } catch (x) { e.stopImmediatePropagation(); }
        return;
      }
      e.stopImmediatePropagation();
    }, true);
  } catch (e) {}
})();`;
    createPreviewLifecycleScript = (
      admittedCdnPrefixes: readonly string[],
    ): string =>
      `(function () {
  var sent = false;
  var booted = false;
  var failed = false;
  var noReact = false;
  var noReactRe = ` +
      escapeScriptJson(String(MISSING_REACT_ERROR_PATTERN)) +
      `;
  function nav() {
    if (sent) return;
    sent = true;
    try { parent.postMessage({ type: 'ds-swatch:navigating' }, '*'); } catch (e) {}
  }
  window.addEventListener('beforeunload', nav);
  window.addEventListener('pagehide', nav);
  /* Boot-failure detection, through load plus one tick. capture
   * is true so element-targeted errors are seen (they do not
   * bubble). FILTERED: uncaught exceptions (window-targeted) are
   * boot failures; an element error on a SCRIPT is one when the
   * script is INLINE, or when its src is on the admitted CDN list -
   * that script is load-bearing (a card from Claude Design runs its
   * JSX through Babel fetched there), so a CDN that does not answer,
   * an integrity mismatch or an offline viewer demotes the preview
   * to the static tier with a notice instead of leaving it blank.
   * Any other failed src/href - a relative bundle.js tag a preview.html
   * carries for folder portability (the frame has provided the bundle
   * already; beside the page it is a 404 or a text/plain sibling the
   * browser will not execute), an image that is gone - is a degraded
   * asset, not a reason to demote. v2 has no module graph, so nothing
   * else reports at a script element. */
  var admitted = ` +
      escapeScriptJson(JSON.stringify(admittedCdnPrefixes)) +
      `;
  function onList(u) {
    var m = /^(?:https:)?\\/\\/([^\\/?#]+)([^?#]*)/i.exec(String(u)); if (!m) return false;
    var host = m[1].toLowerCase(), path = m[2] === '' ? '/' : m[2];
    for (var i = 0; i < admitted.length; i++) { var s = /^https:\\/\\/([^\\/]+)(\\/.*)?$/.exec(admitted[i]); if (s && host === s[1] && (!s[2] || path.slice(0, s[2].length) === s[2])) return true; }
    return false;
  }
  window.addEventListener('error', function (e) {
    if (booted) return;
    var t = e.target;
    if (t === window || t === null || t === undefined) { failed = true; if (typeof e.message === 'string' && noReactRe.test(e.message)) noReact = true; return; }
    var tag = t.tagName ? String(t.tagName).toUpperCase() : '';
    var src = '';
    try { src = (t.getAttribute && (t.getAttribute('src') || t.getAttribute('href'))) || ''; } catch (x) {}
    if (tag === 'SCRIPT' && (src === '' || onList(src))) { failed = true; }
  }, true);
  function tall() { try { var de = document.documentElement, b = document.body; return Math.ceil(Math.max(de.scrollHeight, b ? b.scrollHeight : 0)); } catch (x) { return 0; } }
  function post() {
    var h = tall();
    try { parent.postMessage(failed ? { type: noReact ? 'ds-swatch:error-react' : 'ds-swatch:error' } : { type: 'ds-swatch:ready', h: h }, '*'); } catch (e) {}
  }
  window.addEventListener('load', function () {
    setTimeout(function () {
      booted = true;
      var fr = null;
      try { fr = document.fonts ? document.fonts.ready : null; } catch (x) {}
      if (failed || !fr || typeof fr.then !== 'function') { post(); return; }
      var done = false;
      function once() { if (done) return; done = true; post(); }
      fr.then(once, once);
      setTimeout(once, 1000);
    }, 0);
  });
})();`;
    SWATCH_ATTRIBUTE = "data-ds-swatch";
    PREVIEW_BOOT_TIMEOUT_MS = 4000;
    PREVIEW_IFRAME_SANDBOX = "allow-scripts allow-same-origin";
    ADMITTED_PREVIEW_CDN_PREFIXES = [
      "https://cdnjs.cloudflare.com",
      "https://cdn.jsdelivr.net/pyodide/",
      "https://cdn.jsdelivr.net/gh/python-visualization/",
      "https://cdn.jsdelivr.net/npm/",
      "https://cdn.tailwindcss.com",
      "https://code.jquery.com",
      "https://unpkg.com",
    ];
    PREVIEW_LIFECYCLE_SCRIPT = createPreviewLifecycleScript(
      ADMITTED_PREVIEW_CDN_PREFIXES,
    );
    clearedPreviewStorageWindows = new WeakSet();
    swatchHeadKeyCache = new WeakMap();
    swatchRuntimeKeyCache = new WeakMap();
    SWATCH_HEAD_REGISTRY_GLOBAL = "__dsSwatchHeads";
    SWATCH_HEAD_SEQUENCE_GLOBAL = "__dsSwatchHeadSeq";
    registeredSwatchHeadIds = new WeakMap();
    ALL_SWATCH_HEAD_PIECES = "all";
    SWATCH_PIECE_ATTRIBUTE = "data-ds-piece";
    SWATCH_FAILED_ATTRIBUTE = "data-ds-failed";
    SWATCH_LOCAL_URL_PATTERN = /^\/(?!\/)[^\s"<>&\\]*$/;
    SWATCH_SHA256_INTEGRITY_PATTERN = /^sha256-[A-Za-z0-9+/]{43}=$/;
    SWATCH_THEME_ID_PATTERN = /^[a-z0-9][a-z0-9_.-]{0,63}$/;
    // MineDesign: a runtime tag is the editor page's own vendor copy (model/libraries.ts), a root-relative path under
    // the page's artifact-type/vendor/, not a jsDelivr npm UMD address.
    SWATCH_RUNTIME_TAG_URL_PATTERN =
      /^\/(?!\/)(?:[A-Za-z0-9._~%-]+\/)*artifact-type\/vendor\/[a-z][a-z0-9.-]*\.js$/;
    SWATCH_SHA384_INTEGRITY_PATTERN = /^sha384-[A-Za-z0-9+/]{64}$/;
    SWATCH_PLACED_ATTRIBUTE = "data-ds-placed";
    bundlePageAddressReferenceCache = new WeakMap();
    reportedPageAddressReasons = new WeakMap();
  };
}
