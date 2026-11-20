import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactDomNamespace, loadReactNamespace } from "../dependencies";
import { addressedProjectFileUrl, advanceAddressedFileSource, createAddressedFileLoadState, currentAddressedFileSource, refreshAddressedFileVersion, refuseAddressedFileSource, resolveFileVersion, retryAddressedFileSource, subscribeAddressedFiles } from "./addressed-files";
import { projectFilePath } from "./files-index";
import { addressedFileEntry, isPublishedPreviewStillOffered, notePublishedPreviewFailure, subscribeAddressedFileEntries } from "./published-preview";
import { encodeRelativeUrlPath, isHeldFilePointer } from "../model/file-policy";
import { toModuleNamespace } from "../module-helpers";

var reactAssetGroups: typeof import("react");
var reactDomAssetGroups: typeof import("react-dom");
var reactAssetThumbnail: typeof import("react");
var assetThumbnailGeneration: number;
var assetThumbnailSubscribers: Set<() => void>;
var notifyAssetThumbnailSources: () => void;
var subscribeAssetThumbnailSources: (listener: () => void) => () => void;
var assetThumbnailSourceSnapshot: () => number;
var ASSET_THUMBNAIL_RETRY_MS: number;
var reportedAssetThumbnailFailures: Set<string>;
var assetThumbnailRetryTimers: Map<
  string,
  Promise<Editor.ThumbnailProbeResult>
>;
var assetAddressRoot: (url: string) => string;
function useAssetThumbnailSources(): void {
  reactAssetThumbnail.useSyncExternalStore(
    subscribeAssetThumbnailSources,
    assetThumbnailSourceSnapshot,
    assetThumbnailSourceSnapshot,
  );
}
function resolvedAssetFileBytes(
  files: Model.FileTable,
  path: string,
  bytes?: number,
): number {
  if (
    (bytes ?? 0) > 0 ||
    !isHeldFilePointer(path, files[path] ?? "")
  ) {
    return bytes ?? 0;
  }
  return (
    addressedFileEntry(projectFilePath(path))
      ?.size ?? 0
  );
}
function retryAssetThumbnailAddress(
  files: string,
  image: Editor.ThumbnailEvent | undefined,
  path: () => void,
  reason: () => void,
): void {
  try {
    let value = globalThis.document?.baseURI ?? "",
      thumbnailUrl =
        image?.currentTarget?.currentSrc ||
        image?.currentTarget?.src ||
        encodeRelativeUrlPath(
          projectFilePath(files),
        ),
      pathname = new URL(thumbnailUrl, value).pathname,
      assetAddress = assetAddressRoot(pathname),
      entry = assetThumbnailRetryTimers.get(pathname);
    if (entry === undefined) {
      entry = new Promise<void>((resolve) =>
        setTimeout(resolve, ASSET_THUMBNAIL_RETRY_MS),
      )
        .then(() =>
          fetch(pathname, {
            method: "HEAD",
            credentials: "same-origin",
            cache: "no-store",
          }),
        )
        .then(
          (state) => ({
            ok: state.ok,
            status: state.status,
          }),
          () => ({
            ok: false,
            status: 0,
          }),
        )
        .finally(() => assetThumbnailRetryTimers.delete(pathname));
      assetThumbnailRetryTimers.set(pathname, entry);
    }
    entry.then((state): void => {
      if (state.ok) {
        path();
        return;
      }
      reason();
      if (state.status === 0 || reportedAssetThumbnailFailures.has(assetAddress)) {
        return;
      }
      reportedAssetThumbnailFailures.add(assetAddress);
      if (
        assetAddress === assetAddressRoot(new URL(value).pathname) &&
        isPublishedPreviewStillOffered(pathname)
      ) {
        notePublishedPreviewFailure(pathname, files);
      } else {
        console.warn(
          "design-system: could not load " +
            files +
            " from its address (" +
            pathname +
            ", HTTP " +
            String(state.status) +
            "). Reload the page.",
        );
      }
    });
  } catch {
    reason();
  }
}
function useAssetThumbnailSource(
  files: Model.FileTable,
  path: string,
): Editor.ThumbnailSource {
  useAssetThumbnailSources();
  let value = isHeldFilePointer(path, files[path] ?? ""),
    ref = reactAssetThumbnail.useRef<Editor.AddressedLoadState | null>(null),
    [, refreshSource] = reactAssetThumbnail.useReducer(
      (generation: number) => generation + 1,
      0,
    );
  if (!value) {
    ref.current = null;
    return {
      part: 0,
    };
  }
  let callback = () => addressedProjectFileUrl(path);
  if (ref.current === null) {
    ref.current = createAddressedFileLoadState(
      resolveFileVersion(path),
      callback(),
    );
  }
  let current = ref.current!,
    addressedSourceVersion = refreshAddressedFileVersion(
      current,
      addressedFileEntry(projectFilePath(path))
        ?.sha256 ?? resolveFileVersion(path),
      callback,
    ),
    fileSource = currentAddressedFileSource(current, callback);
  return {
    part: addressedSourceVersion,
    ...(fileSource !== undefined
      ? {
          src: fileSource,
        }
      : {}),
    onLoad: (): void => {
      current.loaded = true;
    },
    onError: (error: Editor.ThumbnailEvent): void => {
      if (retryAddressedFileSource(current, callback)) {
        setTimeout((): void => {
          advanceAddressedFileSource(current);
          refreshSource();
        }, ASSET_THUMBNAIL_RETRY_MS);
        return;
      }
      if (current.next !== null) {
        return;
      }
      let last = current.last,
        retryToken = callback();
      retryAssetThumbnailAddress(
        path,
        error,
        (): void => {
          if (current.last === last) {
            current.loaded = true;
          }
        },
        (): void => {
          if (current.last === last) {
            refuseAddressedFileSource(current, () => retryToken);
          }
        },
      );
    },
  };
}
export {
  ASSET_THUMBNAIL_RETRY_MS,
  assetAddressRoot,
  assetThumbnailGeneration,
  assetThumbnailRetryTimers,
  assetThumbnailSourceSnapshot,
  assetThumbnailSubscribers,
  notifyAssetThumbnailSources,
  reactAssetGroups,
  reactAssetThumbnail,
  reactDomAssetGroups,
  reportedAssetThumbnailFailures,
  resolvedAssetFileBytes,
  retryAssetThumbnailAddress,
  subscribeAssetThumbnailSources,
  useAssetThumbnailSource,
  useAssetThumbnailSources,
};
export function installEditorAssetThumbnails(): () => void {
  return () => {
    reactAssetGroups = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomAssetGroups = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    reactAssetThumbnail = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    assetThumbnailGeneration = 0;
    assetThumbnailSubscribers = new Set();
    notifyAssetThumbnailSources = (): void => {
      assetThumbnailGeneration++;
      for (let value of [...assetThumbnailSubscribers]) {
        try {
          value();
        } catch {}
      }
    };
    subscribeAddressedFileEntries(notifyAssetThumbnailSources);
    subscribeAddressedFiles(notifyAssetThumbnailSources);
    subscribeAssetThumbnailSources = (subscriber: () => void) => {
      assetThumbnailSubscribers.add(subscriber);
      return () => void assetThumbnailSubscribers.delete(subscriber);
    };
    assetThumbnailSourceSnapshot = (): number => assetThumbnailGeneration;
    ASSET_THUMBNAIL_RETRY_MS = 300;
    reportedAssetThumbnailFailures = new Set();
    assetThumbnailRetryTimers = new Map();
    assetAddressRoot = (url: string) =>
      /^(.*?\/_f\/[^/]+\/)/.exec(url)?.[1] ?? url;
  };
}
