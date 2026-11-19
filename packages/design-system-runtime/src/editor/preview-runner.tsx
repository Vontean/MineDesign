import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { COMPONENT_FILENAMES, DESIGN_SYSTEM_PATHS } from "../model/file-policy";
import { toModuleNamespace } from "../module-helpers";

var reactPreviewComponents: typeof import("react");
var PREVIEW_PROJECT_PREFIX: string;
var CARD_PROJECT_REFERENCE_PATTERN: RegExp;
var BUNDLE_PROJECT_REFERENCE_PATTERN: RegExp;
var hasRawProjectReferences: (
  text: string,
  kind: "card" | "bundle",
) => boolean;
var EXECUTABLE_SCRIPT_TYPE_PATTERN: RegExp;
var SCRIPT_TAG_ATTRIBUTE_PATTERN: RegExp;
var RELATIVE_SCRIPT_IMPORT_PATTERN: RegExp;
var RELATIVE_IMPORT_MAP_PATTERN: RegExp;
var PREVIEW_VALIDATION_BASE_URL: string;
var BLOCKED_SCRIPT_SOURCE_GUIDANCE: string;
var BLOCKED_SCRIPT_IMPORT_GUIDANCE: string;
var RAW_PROJECT_REFERENCE_GUIDANCE: string;
var PREVIEW_RUNNER_GLOBAL: string;
var PREVIEW_RUNNER_PATH: string;
var PREVIEW_RUNNER_REGISTRY_OPTIONS: Editor.PreviewRegistryOptions;
var PREVIEW_RUNNER_BACKOFF_MS: number[];
var componentPreviewPath: (name: string) => string;
function getOrCreatePreviewDocumentRegistry<Doc, State extends object>(
  environment: object,
  registryOptions: Editor.PreviewRegistryOptions,
  createState: () => State,
): Editor.StatefulPreviewRegistry<Doc, State> {
  let globalObject = environment as Record<string, unknown>,
    existing = globalObject[registryOptions.global];
  if (
    existing != null &&
    (existing as Partial<Editor.PreviewDocumentRegistry<Doc>>).docs instanceof
      Map
  ) {
    return existing as Editor.StatefulPreviewRegistry<Doc, State>;
  }
  let documents = new Map<string, Doc>(),
    waiting = new Map<string, Editor.PreviewWaiting>(),
    registry: Editor.StatefulPreviewRegistry<Doc, State> = {
      ...createState(),
      docs: documents,
      waiting: waiting,
      seq: 0,
      tookAt: 0,
      take: (ownerId: string) => {
        let entry = documents.get(ownerId);
        if (entry !== undefined) {
          registry.tookAt = performance.now();
          try {
            waiting.get(ownerId)?.taken?.();
          } catch {}
        }
        documents.delete(ownerId);
        waiting.delete(ownerId);
        return entry;
      },
    };
  globalObject[registryOptions.global] = registry;
  return registry;
}
function registerPreviewDocument<Doc>(
  registry: Editor.PreviewDocumentRegistry<Doc>,
  registryOptions: Editor.PreviewRegistryOptions,
  document: Doc,
  waiting?: Editor.PreviewWaiting,
): string {
  registry.seq += 1;
  let token: string = registryOptions.tokenPrefix + String(registry.seq);
  registry.docs.set(token, document);
  if (waiting !== undefined) {
    registry.waiting.set(token, waiting);
  }
  return token;
}
function removePreviewDocument(
  registry: Editor.PreviewDocumentRegistry<unknown>,
  token: string,
): void {
  registry.docs.delete(token);
  registry.waiting.delete(token);
}
function encodedPreviewPathname(path: string, baseURI: string): string {
  return new URL(path.split("/").map(encodeURIComponent).join("/"), baseURI)
    .pathname;
}
function trimScriptAttributeWhitespace(text: string): string {
  let start: number = 0,
    end = text.length;
  while (start < end && text.charCodeAt(start) <= 32) {
    start++;
  }
  while (end > start && text.charCodeAt(end - 1) <= 32) {
    end--;
  }
  return text.slice(start, end);
}
function isDisallowedRelativeScriptSource(
  src: string,
  cardPath: string,
): boolean {
  if (/[&\\]/.test(src)) {
    return true;
  }
  try {
    let value = new URL(
        src,
        PREVIEW_VALIDATION_BASE_URL +
          cardPath.split("/").map(encodeURIComponent).join("/"),
      ),
      pathname = new URL(PREVIEW_PROJECT_PREFIX, PREVIEW_VALIDATION_BASE_URL)
        .pathname,
      decodedPath = decodeURIComponent(value.pathname)
        .toLowerCase()
        .replace(/\/+/g, "/")
        .replace(/\/$/, "");
    if (
      value.origin !== new URL(PREVIEW_VALIDATION_BASE_URL).origin ||
      !decodedPath.startsWith(pathname) ||
      /[\\\u0000-\u001f]|\/\.\.?(?:\/|$)/.test(decodedPath)
    ) {
      return true;
    }
    let relativePath = decodedPath.slice(pathname.length);
    return (
      relativePath.startsWith(DESIGN_SYSTEM_PATHS.libDir) ||
      /(?:^|\/)_vendor\/|(?:^|\/)(?:_ds_)?bundle\.js$/.test(relativePath)
    );
  } catch {
    return true;
  }
}
function blockedPreviewScriptReference(
  html: string,
  cardPath: string,
  strict: boolean = false,
): boolean | string {
  let findNext = (pattern: RegExp, offset: number) => {
      pattern.lastIndex = offset;
      return pattern.exec(html)?.index ?? -1;
    },
    openScriptPattern: RegExp = /<script/gi,
    closeScriptPattern: RegExp = /<\/script[ \t\n\f\r/>]/gi,
    scriptEnd = -2,
    scannedInlineEnd = 0,
    scannedImportMapEnd = 0,
    hasBaseTag = /<base[ \t\n\f\r/>]/i.test(html);
  for (let value = findNext(openScriptPattern, 0); value >= 0; ) {
    let attributeEnd = value + 7;
    if (attributeEnd < html.length && !/[ \t\n\f\r/>]/.test(html[attributeEnd])) {
      value = findNext(openScriptPattern, attributeEnd);
      continue;
    }
    for (
      let text = "",
        flag = false,
        insideImportMap: boolean = false,
        insideScript: boolean = false;
      attributeEnd < html.length;
      attributeEnd++
    ) {
      let character = html[attributeEnd],
        isWhitespace =
          character === " " ||
          character ===
            `
` ||
          character === "\t" ||
          character === "\f" ||
          character === "\r";
      if (text !== "") {
        text = character === text ? "" : text;
      } else if (character === ">") {
        break;
      } else if (insideScript) {
        insideScript = !isWhitespace;
      } else if (insideImportMap) {
        if (!isWhitespace) {
          if (((insideImportMap = false), character === '"' || character === "'")) {
            text = character;
          } else {
            insideScript = true;
          }
        }
      } else if (!flag) {
        flag = !isWhitespace && character !== "/";
      } else if (character === "/" || character === "=") {
        flag = false;
        insideImportMap = character === "=";
      }
    }
    let scriptType: string | undefined, scriptSource: string | undefined;
    for (let attribute of html
      .slice(value + 7, attributeEnd)
      .matchAll(SCRIPT_TAG_ATTRIBUTE_PATTERN)) {
      let attributeValue = trimScriptAttributeWhitespace(
        attribute[2] ?? attribute[3] ?? attribute[4] ?? "",
      );
      if (attribute[1].toLowerCase() === "type") {
        scriptType ??= attributeValue.toLowerCase();
      } else if (attribute[1].toLowerCase() === "src") {
        scriptSource ??= attributeValue;
      }
    }
    let isExecutable = EXECUTABLE_SCRIPT_TYPE_PATTERN.test(scriptType ?? ""),
      scriptBeforeEnd = scriptEnd === -1 || value < scriptEnd;
    if (!scriptBeforeEnd) {
      scriptEnd = findNext(closeScriptPattern, attributeEnd);
    }
    if (scriptSource !== undefined) {
      if (
        isExecutable &&
        scriptSource !== "" &&
        !/^(?:[a-z][a-z0-9+.-]*:|\/)/i.test(scriptSource) &&
        (strict ||
          scriptBeforeEnd ||
          hasBaseTag ||
          isDisallowedRelativeScriptSource(scriptSource, cardPath))
      ) {
        return scriptSource;
      }
    } else if (!strict && (isExecutable || scriptType === "importmap")) {
      if (scriptEnd !== -1 && scriptEnd < attributeEnd) {
        scriptEnd = findNext(closeScriptPattern, attributeEnd);
      }
      let scanEnd = scriptEnd < 0 ? html.length : scriptEnd,
        isImportMap: boolean = scriptType === "importmap";
      if (
        scanEnd > (isImportMap ? scannedImportMapEnd : scannedInlineEnd) &&
        (isImportMap
          ? RELATIVE_IMPORT_MAP_PATTERN
          : RELATIVE_SCRIPT_IMPORT_PATTERN
        ).test(html.slice(attributeEnd + 1, scanEnd))
      ) {
        return true;
      }
      if (isImportMap) {
        scannedImportMapEnd = scanEnd;
      } else {
        scannedInlineEnd = scanEnd;
      }
    }
    value = findNext(openScriptPattern, attributeEnd);
  }
  return false;
}
function previewRunnerRegistry(
  environment: object,
): Editor.PreviewRunnerRegistry {
  return getOrCreatePreviewDocumentRegistry(
    environment,
    PREVIEW_RUNNER_REGISTRY_OPTIONS,
    () => ({
      on: false,
      worked: false,
      strikes: 0,
      struckAt: 0,
      off: false,
      refusals: 0,
      pauses: PREVIEW_RUNNER_BACKOFF_MS,
      refusedSeq: 0,
      refusedAt: 0,
      suspended: false,
    }),
  );
}
function enablePreviewRunner(
  environment: object = window,
  signal?: AbortSignal,
  pauses: number[] = PREVIEW_RUNNER_BACKOFF_MS,
): void {
  previewRunnerRegistry(environment).on = true;
  if (pauses.length > 0) {
    previewRunnerRegistry(environment).pauses = pauses;
  }
  if (signal?.aborted === true) {
    suspendPreviewRunner(environment);
  } else {
    signal?.addEventListener(
      "abort",
      () => suspendPreviewRunner(environment),
      {
        once: true,
      },
    );
  }
}
function isPreviewRunnerCoolingDown(environment: object): boolean {
  let registry = previewRunnerRegistry(environment);
  return (
    !registry.off &&
    registry.refusals > 0 &&
    performance.now() - registry.refusedAt <
      registry.pauses[Math.min(registry.refusals, registry.pauses.length) - 1]
  );
}
function isPreviewRunnerAvailable(environment: object): boolean {
  let registry = previewRunnerRegistry(environment);
  return (
    registry.on &&
    !registry.off &&
    !registry.suspended &&
    !isPreviewRunnerCoolingDown(environment)
  );
}
function isPreviewRunnerEnabled(environment: object): boolean {
  return previewRunnerRegistry(environment).on;
}
function wasPreviewRunnerRecentlyTaken(
  environment: object,
  withinMs: number,
): boolean {
  let takenAt = previewRunnerRegistry(environment).tookAt;
  return takenAt > 0 && performance.now() - takenAt < withinMs;
}
function suspendPreviewRunner(environment: object = window): void {
  let registry = previewRunnerRegistry(environment);
  registry.suspended = true;
  let waiting = [...registry.waiting.values()];
  registry.waiting.clear();
  for (let value of waiting) {
    try {
      value.remove();
    } catch {}
  }
  for (let value of waiting) {
    try {
      value.notify();
    } catch {}
  }
}
function recordPreviewRunnerOutcome(
  environment: object,
  outcome: string,
  token: string,
): {
  tell: boolean;
} {
  let registry = previewRunnerRegistry(environment);
  if (outcome === "worked") {
    registry.worked = true;
    registry.refusals = 0;
    if (!registry.off) {
      registry.strikes = 0;
    }
    return {
      tell: false,
    };
  }
  let sequence: number = Number(
    token.slice(PREVIEW_RUNNER_REGISTRY_OPTIONS.tokenPrefix.length),
  );
  if (outcome === "refused") {
    let value: boolean = registry.refusals === 0;
    if (sequence > registry.refusedSeq) {
      registry.refusals += 1;
      registry.refusedSeq = registry.seq;
    }
    registry.refusedAt = performance.now();
    return {
      tell: value,
    };
  }
  if (sequence > registry.struckAt) {
    registry.strikes += 1;
    registry.struckAt = registry.seq;
  }
  if (registry.strikes >= 2) {
    registry.off = true;
  }
  return {
    tell: true,
  };
}
function previewRunnerAddresses(
  path: string,
  baseURI: string,
): {
  runner: string;
  card: string;
} | null {
  try {
    let value = encodedPreviewPathname(path, baseURI);
    if (value.startsWith(new URL(PREVIEW_PROJECT_PREFIX, baseURI).pathname)) {
      return {
        runner: new URL(PREVIEW_RUNNER_PATH, baseURI).pathname,
        card: value,
      };
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function registerPreviewRunnerDocument(
  environment: object,
  url: string,
  html: string,
  waiting?: Editor.PreviewWaiting,
): string {
  return registerPreviewDocument(
    previewRunnerRegistry(environment),
    PREVIEW_RUNNER_REGISTRY_OPTIONS,
    {
      url: url,
      html: html,
    },
    waiting,
  );
}
function removePreviewRunnerDocument(
  environment: object,
  token: string,
): void {
  removePreviewDocument(previewRunnerRegistry(environment), token);
}
function hasPreviewRunnerDocument(
  environment: object,
  token: string,
): boolean {
  return previewRunnerRegistry(environment).docs.has(token);
}
export {
  BLOCKED_SCRIPT_IMPORT_GUIDANCE,
  BLOCKED_SCRIPT_SOURCE_GUIDANCE,
  blockedPreviewScriptReference,
  BUNDLE_PROJECT_REFERENCE_PATTERN,
  CARD_PROJECT_REFERENCE_PATTERN,
  componentPreviewPath,
  enablePreviewRunner,
  encodedPreviewPathname,
  EXECUTABLE_SCRIPT_TYPE_PATTERN,
  getOrCreatePreviewDocumentRegistry,
  hasPreviewRunnerDocument,
  hasRawProjectReferences,
  isDisallowedRelativeScriptSource,
  isPreviewRunnerAvailable,
  isPreviewRunnerCoolingDown,
  isPreviewRunnerEnabled,
  PREVIEW_PROJECT_PREFIX,
  PREVIEW_RUNNER_BACKOFF_MS,
  PREVIEW_RUNNER_GLOBAL,
  PREVIEW_RUNNER_PATH,
  PREVIEW_RUNNER_REGISTRY_OPTIONS,
  PREVIEW_VALIDATION_BASE_URL,
  previewRunnerAddresses,
  previewRunnerRegistry,
  RAW_PROJECT_REFERENCE_GUIDANCE,
  reactPreviewComponents,
  recordPreviewRunnerOutcome,
  registerPreviewDocument,
  registerPreviewRunnerDocument,
  RELATIVE_IMPORT_MAP_PATTERN,
  RELATIVE_SCRIPT_IMPORT_PATTERN,
  removePreviewDocument,
  removePreviewRunnerDocument,
  SCRIPT_TAG_ATTRIBUTE_PATTERN,
  suspendPreviewRunner,
  trimScriptAttributeWhitespace,
  wasPreviewRunnerRecentlyTaken,
};
export function installEditorPreviewRunner(): () => void {
  return () => {
    reactPreviewComponents = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    PREVIEW_PROJECT_PREFIX = "project/";
    CARD_PROJECT_REFERENCE_PATTERN =
      /(?:^|["'`(=,;\s])(?:\.\\?\/)*(?:_blob|project)\\?\//;
    BUNDLE_PROJECT_REFERENCE_PATTERN =
      /(?:["'`=]|\(\s*)(?:\.\\?\/)*(?:_blob|project)\\?\//;
    hasRawProjectReferences = (text: string, kind: "card" | "bundle") =>
      (kind === "card"
        ? CARD_PROJECT_REFERENCE_PATTERN
        : BUNDLE_PROJECT_REFERENCE_PATTERN
      ).test(text);
    EXECUTABLE_SCRIPT_TYPE_PATTERN =
      /^(?:module|text\/(?:javascript(?:1\.[0-5])?|ecmascript|jscript|livescript|x-javascript|x-ecmascript)|application\/(?:javascript|ecmascript|x-javascript|x-ecmascript))?$/;
    SCRIPT_TAG_ATTRIBUTE_PATTERN =
      /(=?[^ \t\n\f\r=/>]+)[ \t\n\f\r]*(?:=[ \t\n\f\r]*(?:"([^"]*)"|'([^']*)'|([^ \t\n\f\r>]+)))?/g;
    RELATIVE_SCRIPT_IMPORT_PATTERN =
      /\bimport\s*(?:\(\s*)?["'`]\.{1,2}\/|\bfrom\s*["'`]\.{1,2}\//;
    RELATIVE_IMPORT_MAP_PATTERN = /:\s*"\.{1,2}\//;
    PREVIEW_VALIDATION_BASE_URL = "https://card.invalid/0/0/";
    BLOCKED_SCRIPT_SOURCE_GUIDANCE =
      'Remove the tag if it loads components/bundle.js or a library: those are already provided. A script of the card’s own does not hold the preview when a plain <script src> tag names it under project/, outside components/lib/ and _vendor/, not called bundle.js or _ds_bundle.js, with no "&" or "\\" in the path, no <base> tag in the card, and the tag not written from a script’s text.';
    BLOCKED_SCRIPT_IMPORT_GUIDANCE =
      "Remove the import (one inside a comment or a string counts too), or load the file with a plain <script src> tag.";
    RAW_PROJECT_REFERENCE_GUIDANCE =
      'Write the reference as "/_blob/<id>" or relative to the card';
    PREVIEW_RUNNER_GLOBAL = "__dsPreviewRunner";
    PREVIEW_RUNNER_PATH = "artifact-type/run.html";
    PREVIEW_RUNNER_REGISTRY_OPTIONS = {
      global: PREVIEW_RUNNER_GLOBAL,
      tokenPrefix: "r",
    };
    PREVIEW_RUNNER_BACKOFF_MS = [150, 300, 600, 1000, 2000];
    componentPreviewPath = (componentName: string): string =>
      DESIGN_SYSTEM_PATHS.componentsDir +
      componentName +
      "/" +
      COMPONENT_FILENAMES.preview;
  };
}
