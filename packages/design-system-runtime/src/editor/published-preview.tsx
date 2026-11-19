import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { PROJECT_FILE_PREFIXEditorFilesIndex, projectFilePath } from "./files-index";
import { sha256 } from "./index-file-store";
import { isPreviewRunnerEnabled } from "./preview-runner";
import { SWATCH_LOCAL_URL_PATTERN } from "./swatch-runtime";
import { encodeRelativeUrlPath, estimateDataUriBytes, parseDataUriHeader } from "../model/file-policy";
import { toModuleNamespace } from "../module-helpers";

var reactPublishedPreview: typeof import("react");
var FILES_LISTING_NAME: string;
var FILES_LISTING_TIMEOUT_MS: number;
var FILES_LISTING_RETRY_MS: number;
var FILES_LISTING_EXHAUSTED_RETRY_MS: number;
var FILES_LISTING_MAX_ATTEMPTS: number;
var ADDRESSED_VERSION_PATH_PATTERN: RegExp;
var FILE_SHA256_PATTERNEditorPublishedPreview: RegExp;
var addressedVersionFromPage: () => string;
var fetchProjectFilesListing: () => Promise<unknown>;
var publishedFilesRegistry: Editor.PublishedFilesRegistry;
var addressedFileEntry: (
  path: string,
) => Model.PublishedFileFacts | null | undefined;
var subscribeAddressedFileEntries: (listener: () => void) => () => void;
var PREVIEW_FILE_MIME_PREDICATES: Record<
  Editor.PublishedFileKind,
  (mime: string) => boolean
>;
var PUBLISHED_FILE_ADDRESS_ROOT_PATTERN: RegExp;
var MAX_PUBLISHED_LISTING_FAILURES: number;
var sha256Integrity: (hexDigest: string) => string;
var publishedPreviewCache: Editor.PublishedPreviewCache;
var publishedPreviewUrl: (
  path: string,
  contents: string,
  kind: Editor.PublishedFileKind,
) => Model.PublishedFileReference | undefined;
var notePublishedPreviewFailure: (
  url: string,
  label: string | undefined,
  timeoutSeconds?: string | number,
) => void;
var isPublishedPreviewStillOffered: (url: string) => boolean;
var SAVE_STATES_WITH_CURRENT_ADDRESSES: Record<
  Application.ApplicationSaveState["status"],
  boolean
>;
var subscribePublishedPreviewCache: (listener: () => void) => () => void;
var publishedPreviewGeneration: () => number;
function createPublishedFilesRegistry(
  registryOptions: Editor.PublishedRegistryOptions = {},
): Editor.PublishedFilesRegistry {
  let fetchListing = registryOptions.fetchListing ?? fetchProjectFilesListing,
    addressedVersion = registryOptions.addressedVersion ?? addressedVersionFromPage,
    now = registryOptions.now ?? ((): number => Date.now()),
    heldListing: Editor.PublishedListing | undefined,
    fetching: boolean = false,
    retryStates = new Map<string, Editor.ListingRetryState>(),
    subscribers = new Set<() => void>(),
    notify = (): void => {
      for (let value of [...subscribers]) {
        try {
          value();
        } catch {}
      }
    };
  async function refreshListing(): Promise<void> {
    let value = addressedVersion(),
      callback = (isNarrowed: boolean = false): void => {
        let attemptCount = (retryStates.get(value)?.tries ?? 0) + 1;
        retryStates.set(value, {
          tries: attemptCount,
          narrowed: isNarrowed,
          until: isNarrowed
            ? Number.POSITIVE_INFINITY
            : now() +
              (attemptCount >= FILES_LISTING_MAX_ATTEMPTS
                ? FILES_LISTING_EXHAUSTED_RETRY_MS
                : FILES_LISTING_RETRY_MS),
        });
      },
      flag: boolean = false;
    try {
      let listing = (await fetchListing()) as
          | Editor.PublishedListingWire
          | null
          | undefined,
        currentAddressedVersion = addressedVersion(),
        listedFiles = listing?.files;
      if (currentAddressedVersion !== value) {
      } else if (
        currentAddressedVersion === "" ||
        listing?.ver !== currentAddressedVersion ||
        listedFiles === null ||
        typeof listedFiles !== "object" ||
        Array.isArray(listedFiles)
      ) {
        callback();
      } else if (listing!.narrowed === true) {
        heldListing = undefined;
        callback(true);
      } else {
        let entries = new Map<string, Model.PublishedFileFacts>(),
          complete: boolean = true;
        for (let [filePath, fileEntry] of Object.entries(
          listedFiles as Record<
            string,
            Editor.PublishedFileWire | undefined | null
          >,
        )) {
          if (
            !filePath.startsWith(PROJECT_FILE_PREFIXEditorFilesIndex)
          ) {
            continue;
          }
          if (
            typeof fileEntry?.sha256 === "string" &&
            FILE_SHA256_PATTERNEditorPublishedPreview.test(fileEntry.sha256) &&
            typeof fileEntry.size === "number" &&
            fileEntry.size >= 0 &&
            typeof fileEntry.contentType === "string" &&
            fileEntry.contentType !== ""
          ) {
            entries.set(filePath, {
              sha256: fileEntry.sha256,
              size: fileEntry.size,
              contentType: fileEntry.contentType,
            });
          } else {
            complete = false;
          }
        }
        heldListing = {
          version: currentAddressedVersion,
          facts: entries,
          complete: complete,
        };
        retryStates.delete(currentAddressedVersion);
        flag = true;
      }
    } catch {
      callback();
    } finally {
      fetching = false;
    }
    if (flag || addressedVersion() !== value) {
      notify();
    }
  }
  return {
    addressedFile(filePath: string) {
      let value = addressedVersion();
      if (
        value === "" ||
        !filePath.startsWith(PROJECT_FILE_PREFIXEditorFilesIndex)
      ) {
        return;
      }
      if (heldListing?.version !== value) {
        if (!fetching && now() >= (retryStates.get(value)?.until ?? 0)) {
          fetching = true;
          queueMicrotask(() => void refreshListing());
        }
        return;
      }
      return (
        heldListing.facts.get(filePath) ??
        (heldListing.complete ? null : undefined)
      );
    },
    addressedSettled(): string | boolean {
      let value = addressedVersion();
      if (value === "") {
        return "no-version";
      }
      if (heldListing?.version === value) {
        return "held";
      }
      let entry = retryStates.get(value);
      if (entry === undefined) {
        return false;
      } else {
        if (entry.narrowed) {
          return "narrowed";
        } else {
          if (entry.tries >= FILES_LISTING_MAX_ATTEMPTS) {
            return "tries";
          } else {
            return false;
          }
        }
      }
    },
    onAddressedChange(listener: () => void) {
      subscribers.add(listener);
      return () => void subscribers.delete(listener);
    },
  };
}
function hasAddressDependentPreviewCode(
  contents: string,
  kind: Editor.PublishedFileKind,
): boolean {
  if (kind === "script") {
    return /\bimport\s*(?:\(|\.\s*meta)|currentScript/.test(contents);
  }
  if (kind !== "style") {
    return false;
  }
  if (/@import|@charset|image-set\(|\bsrc\(/i.test(contents)) {
    return true;
  }
  for (let value of contents.matchAll(
    /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]*))/gi,
  )) {
    let reference = (value[1] ?? value[2] ?? value[3] ?? "").trim();
    if (reference !== "" && !/^(?:data:|https?:|\/)/i.test(reference)) {
      return true;
    }
  }
  return false;
}
function publishedFileBytes(
  contents: string,
  kind: Editor.PublishedFileKind,
): string | Uint8Array | null {
  if (kind !== "font") {
    return contents;
  }
  let value = parseDataUriHeader(contents);
  if (value === null || !value.base64) {
    return null;
  }
  try {
    let encodedContent = atob(contents.slice(value.payloadOffset)),
      decodedBytes = new Uint8Array(encodedContent.length);
    for (let index: number = 0; index < encodedContent.length; index++) {
      decodedBytes[index] = encodedContent.charCodeAt(index);
    }
    return decodedBytes;
  } catch {
    return null;
  }
}
function createPublishedPreviewCache(
  cacheOptions: Editor.PublishedPreviewCacheOptions = {},
): Editor.PublishedPreviewCache {
  let enabled =
      cacheOptions.enabled ??
      (() => isPreviewRunnerEnabled(globalThis)),
    addressedFile = cacheOptions.addressedFile ?? addressedFileEntry,
    baseURI = cacheOptions.baseURI ?? (() => globalThis.document?.baseURI ?? ""),
    hash = cacheOptions.hash ?? sha256,
    setTimer =
      cacheOptions.setTimer ??
      ((timerCallback: () => void, delayMs: number) => setTimeout(timerCallback, delayMs)),
    warn = cacheOptions.warn ?? ((message: string) => console.warn(message)),
    info = cacheOptions.info ?? ((message: string) => console.info(message)),
    fileHashCache = new Map<string, Editor.PreviewHashEntry>(),
    failedAddressRoots = new Set<string>(),
    unusableAddressRoots = new Set<string>(),
    subscribers = new Set<() => void>(),
    urlCache = {
      base: "",
      urls: new Map<string, string | undefined>(),
    },
    pendingHashes = 0,
    generation = 0,
    listingFailures = 0,
    listingCooldown: boolean = false,
    lastAddressRoot = "",
    notify = (): void => {
      generation += 1;
      for (let value of [...subscribers]) {
        value();
      }
    };
  (cacheOptions.onAddressedChange ?? subscribeAddressedFileEntries)((): void => {
    listingFailures = 0;
    unusableAddressRoots.clear();
    notify();
  });
  let addressRoot = (url: string) =>
      PUBLISHED_FILE_ADDRESS_ROOT_PATTERN.exec(url)?.[1] ?? "",
    currentAddressRoot = () => {
      try {
        return addressRoot(new URL(baseURI()).pathname);
      } catch {
        return "";
      }
    };
  function noteUnusableListing(unusableAddressRoot: string) {
    if (unusableAddressRoot !== lastAddressRoot) {
      lastAddressRoot = unusableAddressRoot;
      listingFailures = 0;
    }
    if (listingCooldown) {
      return;
    }
    if (listingFailures >= MAX_PUBLISHED_LISTING_FAILURES) {
      info(
        "design-system: the list of this version’s published files could not be used on this page, so previews use the page’s own copies of the system’s files. Nothing is lost.",
      );
      return void unusableAddressRoots.add(unusableAddressRoot);
    }
    listingCooldown = true;
    setTimer(
      (): void => {
        listingCooldown = false;
        notify();
      },
      (FILES_LISTING_RETRY_MS + 1000) * 2 ** listingFailures,
    );
    listingFailures += 1;
  }
  function hashContents(
    content: string,
    source: string,
    fileKind: Editor.PublishedFileKind,
  ) {
    let entry = fileHashCache.get(content);
    if (entry === undefined || entry.value !== source) {
      let state: Editor.PreviewHashEntry = {
        value: source,
        stays:
          (fileKind === "font" &&
            parseDataUriHeader(source)?.base64 !== true) ||
          hasAddressDependentPreviewCode(source, fileKind),
      };
      fileHashCache.set(content, (entry = state));
      if (!state.stays) {
        pendingHashes += 1;
        let callback = (hashValue?: string): void => {
          if (hashValue !== undefined) {
            state.sha = hashValue;
          }
          pendingHashes -= 1;
          if (pendingHashes === 0) {
            notify();
          }
        };
        Promise.resolve()
          .then(() => publishedFileBytes(source, fileKind))
          .then((hashValue) => (hashValue === null ? undefined : hash(hashValue)))
          .then(callback, () => callback());
      }
    }
    if (entry.stays) {
      return undefined;
    } else {
      return entry.sha;
    }
  }
  function publishedFileAddress(filePath: string) {
    let value = baseURI();
    if (urlCache.base !== value) {
      urlCache = {
        base: value,
        urls: new Map<string, string | undefined>(),
      };
    }
    if (!urlCache.urls.has(filePath)) {
      let localUrl: string | undefined;
      try {
        localUrl = /^https?:/i.test(value)
          ? new URL(
              encodeRelativeUrlPath(
                projectFilePath(filePath),
              ),
              value,
            ).pathname
          : undefined;
      } catch {
        localUrl = undefined;
      }
      urlCache.urls.set(
        filePath,
        localUrl !== undefined && SWATCH_LOCAL_URL_PATTERN.test(localUrl)
          ? localUrl
          : undefined,
      );
    }
    return urlCache.urls.get(filePath);
  }
  return {
    publishedUrl(
      filePath: string,
      items: string,
      fileKind: Editor.PublishedFileKind,
    ) {
      let value = currentAddressRoot();
      if (
        value === "" ||
        failedAddressRoots.has(value) ||
        unusableAddressRoots.has(value) ||
        !enabled()
      ) {
        return;
      }
      let addressedEntry = addressedFile(projectFilePath(filePath));
      if (addressedEntry === undefined) {
        noteUnusableListing(value);
      }
      if (
        addressedEntry === undefined ||
        addressedEntry === null ||
        !PREVIEW_FILE_MIME_PREDICATES[fileKind](
          (addressedEntry.contentType.split(";")[0] ?? "").trim().toLowerCase(),
        )
      ) {
        return;
      }
      let publishedUrl = publishedFileAddress(filePath);
      if (publishedUrl === undefined || addressRoot(publishedUrl) !== value) {
        return;
      }
      if (
        fileKind === "font"
          ? estimateDataUriBytes(items) !== addressedEntry.size
          : addressedEntry.size < items.length || addressedEntry.size > items.length * 3
      ) {
        return;
      }
      let contentHash = hashContents(filePath, items, fileKind);
      if (contentHash !== undefined && contentHash === addressedEntry.sha256) {
        return {
          url: publishedUrl,
          integrity: sha256Integrity(contentHash),
        };
      } else {
        return undefined;
      }
    },
    noteFailed(
      url: string,
      reason: string | undefined,
      status?: string | number,
    ): void {
      let value = addressRoot(url);
      if (value === "" || failedAddressRoots.has(value)) {
        return;
      }
      failedAddressRoots.add(value);
      let message: string =
        status === undefined
          ? uiMessage("design-system.publishedPreview.couldNotLoad") + reason + " from its URL"
          : reason +
            " did not finish loading from its URL in " +
            status +
            " s";
      warn(
        "design-system: " +
          message +
          " (" +
          url +
          "), so previews on this page use the page’s own copies of the system’s files. Nothing is lost. Reload the page to load them by URL again.",
      );
      notify();
    },
    noteAddressBehind(): void {
      let value = currentAddressRoot();
      if (value === "" || failedAddressRoots.has(value) || !enabled()) {
        return;
      }
      failedAddressRoots.add(value);
      notify();
    },
    stillOffered: (url: string): boolean =>
      !failedAddressRoots.has(addressRoot(url)),
    generation: () => generation,
    subscribe(listener: () => void) {
      subscribers.add(listener);
      return () => void subscribers.delete(listener);
    },
  };
}
function subscribePublishedPreviewToSaveState(
  document: Pick<
    Application.ApplicationDocument,
    "saveState" | "subscribeSave"
  >,
  cache: Editor.PublishedPreviewCache = publishedPreviewCache,
): () => void {
  let update = (): void => {
    if (!SAVE_STATES_WITH_CURRENT_ADDRESSES[document.saveState().status]) {
      cache.noteAddressBehind();
    }
  };
  update();
  return document.subscribeSave(update);
}
function usePublishedPreviewGeneration(
  document: Pick<
    Application.ApplicationDocument,
    "saveState" | "subscribeSave"
  >,
): number {
  reactPublishedPreview.useEffect(
    () => subscribePublishedPreviewToSaveState(document),
    [document],
  );
  return reactPublishedPreview.useSyncExternalStore(
    subscribePublishedPreviewCache,
    publishedPreviewGeneration,
    publishedPreviewGeneration,
  );
}
export {
  ADDRESSED_VERSION_PATH_PATTERN,
  addressedFileEntry,
  addressedVersionFromPage,
  createPublishedFilesRegistry,
  createPublishedPreviewCache,
  fetchProjectFilesListing,
  FILE_SHA256_PATTERNEditorPublishedPreview,
  FILES_LISTING_EXHAUSTED_RETRY_MS,
  FILES_LISTING_MAX_ATTEMPTS,
  FILES_LISTING_NAME,
  FILES_LISTING_RETRY_MS,
  FILES_LISTING_TIMEOUT_MS,
  hasAddressDependentPreviewCode,
  isPublishedPreviewStillOffered,
  MAX_PUBLISHED_LISTING_FAILURES,
  notePublishedPreviewFailure,
  PREVIEW_FILE_MIME_PREDICATES,
  PUBLISHED_FILE_ADDRESS_ROOT_PATTERN,
  publishedFileBytes,
  publishedFilesRegistry,
  publishedPreviewCache,
  publishedPreviewGeneration,
  publishedPreviewUrl,
  reactPublishedPreview,
  SAVE_STATES_WITH_CURRENT_ADDRESSES,
  sha256Integrity,
  subscribeAddressedFileEntries,
  subscribePublishedPreviewCache,
  subscribePublishedPreviewToSaveState,
  usePublishedPreviewGeneration,
};
export function installEditorPublishedPreview(): () => void {
  return () => {
    reactPublishedPreview = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    FILES_LISTING_NAME = "_files.json";
    FILES_LISTING_TIMEOUT_MS = 30000;
    FILES_LISTING_RETRY_MS = 5000;
    FILES_LISTING_EXHAUSTED_RETRY_MS = 60000;
    FILES_LISTING_MAX_ATTEMPTS = 6;
    ADDRESSED_VERSION_PATH_PATTERN = /\/_f\/([^/]+)\//;
    FILE_SHA256_PATTERNEditorPublishedPreview = /^[0-9a-f]{64}$/;
    addressedVersionFromPage = () => {
      try {
        let value = globalThis,
          version =
            value.document?.baseURI !== undefined
              ? new URL(value.document.baseURI).pathname
              : (value.location?.pathname ?? "");
        return ADDRESSED_VERSION_PATH_PATTERN.exec(version)?.[1] ?? "";
      } catch {
        return "";
      }
    };
    fetchProjectFilesListing = async (): Promise<unknown> => {
      let value = await globalThis.fetch(FILES_LISTING_NAME, {
        credentials: "same-origin",
        signal: AbortSignal.timeout(FILES_LISTING_TIMEOUT_MS),
      });
      if (!value.ok) {
        throw Error(FILES_LISTING_NAME + ": HTTP " + String(value.status));
      }
      return await value.json();
    };
    publishedFilesRegistry = createPublishedFilesRegistry();
    addressedFileEntry = (path: string) =>
      publishedFilesRegistry.addressedFile(path);
    subscribeAddressedFileEntries = (listener: () => void) =>
      publishedFilesRegistry.onAddressedChange(listener);
    PREVIEW_FILE_MIME_PREDICATES = {
      style: (mimeType: string): boolean => mimeType === "text/css",
      script: (mimeType: string) =>
        mimeType === "text/javascript" || mimeType === "application/javascript",
      font: (mimeType: string) => mimeType.startsWith("font/"),
    };
    PUBLISHED_FILE_ADDRESS_ROOT_PATTERN = /^(.*?\/_f\/[^/]+\/)/;
    MAX_PUBLISHED_LISTING_FAILURES = 4;
    sha256Integrity = (hexDigest: string): string =>
      "sha256-" +
      btoa(
        String.fromCharCode(
          ...(hexDigest.match(/../g) ?? []).map((hexByte) => parseInt(hexByte, 16)),
        ),
      );
    publishedPreviewCache = createPublishedPreviewCache();
    publishedPreviewUrl = (
      path: string,
      contents: string,
      kind: Editor.PublishedFileKind,
    ) => publishedPreviewCache.publishedUrl(path, contents, kind);
    notePublishedPreviewFailure = (
      url: string,
      label: string | undefined,
      timeoutSeconds?: string | number,
    ) => publishedPreviewCache.noteFailed(url, label, timeoutSeconds);
    isPublishedPreviewStillOffered = (url: string) =>
      publishedPreviewCache.stillOffered(url);
    SAVE_STATES_WITH_CURRENT_ADDRESSES = {
      loading: true,
      ready: true,
      readonly: true,
      dirty: false,
      saving: false,
      saved: false,
      cached: false,
      error: false,
    };
    subscribePublishedPreviewCache = (listener: () => void) =>
      publishedPreviewCache.subscribe(listener);
    publishedPreviewGeneration = () => publishedPreviewCache.generation();
  };
}
