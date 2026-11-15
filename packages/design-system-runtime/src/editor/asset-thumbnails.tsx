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
    !(0, isHeldFilePointer)(path, files[path] ?? "")
  ) {
    return bytes ?? 0;
  }
  return (
    (0, addressedFileEntry)((0, projectFilePath)(path))
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
      value2 =
        image?.currentTarget?.currentSrc ||
        image?.currentTarget?.src ||
        (0, encodeRelativeUrlPath)(
          (0, projectFilePath)(files),
        ),
      pathname = new URL(value2, value).pathname,
      value3 = assetAddressRoot(pathname),
      entry = assetThumbnailRetryTimers.get(pathname);
    if (entry === undefined) {
      entry = new Promise<void>((input) =>
        setTimeout(input, ASSET_THUMBNAIL_RETRY_MS),
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
      if (state.status === 0 || reportedAssetThumbnailFailures.has(value3)) {
        return;
      }
      reportedAssetThumbnailFailures.add(value3);
      if (
        value3 === assetAddressRoot(new URL(value).pathname) &&
        (0, isPublishedPreviewStillOffered)(pathname)
      ) {
        (0, notePublishedPreviewFailure)(pathname, files);
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
  let value = (0, isHeldFilePointer)(path, files[path] ?? ""),
    ref = reactAssetThumbnail.useRef<Editor.AddressedLoadState | null>(null),
    [, value2] = reactAssetThumbnail.useReducer(
      (input: number) => input + 1,
      0,
    );
  if (!value) {
    ref.current = null;
    return {
      part: 0,
    };
  }
  let callback = () => (0, addressedProjectFileUrl)(path);
  if (ref.current === null) {
    ref.current = (0, createAddressedFileLoadState)(
      (0, resolveFileVersion)(path),
      callback(),
    );
  }
  let current = ref.current!,
    value3 = (0, refreshAddressedFileVersion)(
      current,
      (0, addressedFileEntry)((0, projectFilePath)(path))
        ?.sha256 ?? (0, resolveFileVersion)(path),
      callback,
    ),
    value4 = (0, currentAddressedFileSource)(current, callback);
  return {
    part: value3,
    ...(value4 !== undefined
      ? {
          src: value4,
        }
      : {}),
    onLoad: (): void => {
      current.loaded = true;
    },
    onError: (input: Editor.ThumbnailEvent): void => {
      if ((0, retryAddressedFileSource)(current, callback)) {
        setTimeout((): void => {
          (0, advanceAddressedFileSource)(current);
          value2();
        }, ASSET_THUMBNAIL_RETRY_MS);
        return;
      }
      if (current.next !== null) {
        return;
      }
      let last = current.last,
        value5 = callback();
      retryAssetThumbnailAddress(
        path,
        input,
        (): void => {
          if (current.last === last) {
            current.loaded = true;
          }
        },
        (): void => {
          if (current.last === last) {
            (0, refuseAddressedFileSource)(current, () => value5);
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
    reactAssetGroups = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    reactDomAssetGroups = (0, toModuleNamespace)(
      (0, loadReactDomNamespace)(),
      1,
    );
    reactAssetThumbnail = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
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
    (0, subscribeAddressedFileEntries)(notifyAssetThumbnailSources);
    (0, subscribeAddressedFiles)(notifyAssetThumbnailSources);
    subscribeAssetThumbnailSources = (input: () => void) => {
      assetThumbnailSubscribers.add(input);
      return () => void assetThumbnailSubscribers.delete(input);
    };
    assetThumbnailSourceSnapshot = (): number => assetThumbnailGeneration;
    ASSET_THUMBNAIL_RETRY_MS = 300;
    reportedAssetThumbnailFailures = new Set();
    assetThumbnailRetryTimers = new Map();
    assetAddressRoot = (url: string) =>
      /^(.*?\/_f\/[^/]+\/)/.exec(url)?.[1] ?? url;
  };
}
