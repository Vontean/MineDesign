import { uiMessage } from "@minedesign/contracts/ui-messages";
import { designSystemCacheKey, getDesignSystemFiles, resolvePublishedDesignSystemFile } from "../design-system/published-files";
import { notifyUndoGesture } from "../editor/history-ownership";
import { artboardsAtAddressEnabled } from "../platform/feature-flags";
import { FileValue, getKvClient, registerImageFileUrls } from "../platform/file-content";
import { addressedArtboardCacheKey, resolveAddressedArtboard } from "../preview/addressed-artboards";
import { normalizeProjectBlobPaths } from "../preview/blob-paths";
import {
  buildPreviewDocument,
  evaluationOnlyDocumentHtml as buildPreviewFromFiles,
  PreviewBuildDocumentStringify,
} from "../preview/build-document";
import { collectProjectDependencyFiles } from "../preview/dependency-graph";
import { createLinkedFileScript, runtimeModuleBlobs, runtimeModuleUrls } from "../preview/module-cache";
import type { Dynamic } from "../runtime-types";
import {
  cacheArtboardCompilation,
  createProjectAssetReadinessProbe,
  effectiveDesignPartMinScale,
  getCachedArtboardCompilation,
  projectFileNamesKey,
} from "./compilation-cache";

export async function readArtboardProjectFiles(): Promise<Record<string, Dynamic>> {
  const fileKeys: string[] = await getKvClient().list(FileValue);
  const files = { ...getDesignSystemFiles() };
  for (const key of fileKeys) {
    const content = await getKvClient().get(key);
    if (content != null) files[key.slice(FileValue.length)] = content;
  }
  registerImageFileUrls(files);
  return files;
}

export function compileArtboardPreview(
  file: string,
  files: Record<string, Dynamic>,
  assets: Dynamic,
  frameless: boolean,
) {
  const addressEnabled = artboardsAtAddressEnabled();
  const cacheKey = PreviewBuildDocumentStringify({
    partMin: effectiveDesignPartMinScale(),
    frameless,
    assets,
    installed: designSystemCacheKey(),
    address: addressedArtboardCacheKey(addressEnabled),
  });
  let entry = getCachedArtboardCompilation(file, files, cacheKey);
  if (entry === null) {
    const dependencies = collectProjectDependencyFiles(files, file);
    const resolution = resolveAddressedArtboard(dependencies, file, addressEnabled);
    const published = resolution === undefined || "copied" in resolution ? undefined : resolution;
    if (addressEnabled && resolution !== undefined) {
      notifyUndoGesture("board-address", {
        file,
        how: "copied" in resolution
          ? uiMessage("canvas.artboardFrame.theAppifactBase")
          : uiMessage("canvas.artboardFrame.thePublishedBase"),
        ...("copied" in resolution ? { why: resolution.copied } : {}),
      });
    }
    const normalizedFiles = normalizeProjectBlobPaths(published?.files ?? dependencies);
    const rootSheets = new Set();
    const { doc, parts, sheetUrls, byAddress } = buildPreviewDocument(
      normalizedFiles,
      file,
      assets,
      rootSheets,
      published !== undefined
        ? {
            frameless,
            atAddress: { projectRoot: published.projectPath, base: published.pageUrl },
          }
        : {
            partMin: effectiveDesignPartMinScale(),
            frameless,
            sheetUrlFor: createProjectAssetReadinessProbe(files),
            installedUrlFor: resolvePublishedDesignSystemFile,
            fileUrlFor: createLinkedFileScript,
          },
    );
    entry = {
      names: projectFileNamesKey(files),
      opts: cacheKey,
      closure: dependencies,
      doc,
      parts,
      sheetUrls: sheetUrls ?? {},
      byAddress,
      rootSheets,
      ...(published !== undefined ? { at: published } : {}),
    };
    cacheArtboardCompilation(file, entry);
  }

  const { doc, parts, closure, rootSheets, sheetUrls } = entry;
  const previewDocument = entry.at !== undefined
    ? { srcdoc: doc, projectRoot: entry.at.projectRoot }
    : Object.keys(parts).length > 0
      ? {
          srcdoc: buildPreviewFromFiles,
          boot: {
            doc,
            parts: runtimeModuleBlobs(parts),
            urls: { ...runtimeModuleUrls(parts), ...sheetUrls },
          },
        }
      : { srcdoc: doc };
  return {
    previewDocument,
    loadedComponentIds: new Set(Object.keys(entry.at?.files ?? closure)),
    dependencyFiles: new Set(Object.keys(closure)),
    coveredStylesheets: new Set(rootSheets),
    compilationAddresses: new Set(Object.values(entry.byAddress)),
  };
}
