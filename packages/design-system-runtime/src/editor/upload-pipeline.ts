import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Storage from "../contracts/model-storage";
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { ASSET_EXTENSION_MIME_TYPES, assetFileExtension, assetNameFromFileName, assetUploadDestination, bytesToFileDataUrl, classifyAssetUpload, FONT_FILE_EXTENSIONS, isFontFile } from "./asset-resources";
import { downloadDataUrlBytes, inferFontMetadata, isIgnoredUploadFile, uploadedFileRelativePath } from "./asset-upload";
import { truncateHandoffFileName } from "./claude-prompts";
import { hasDamagedUnicode } from "./files-index";
import { ASSETS_SECTION_LABEL } from "./view-model";
import { assetUploadFailureMessage, getAssetsCatalogState, getAssetsTierState, getRecentOrphanedAssets, listedAssetIds, rememberOrphanedAsset, resolveAssetsCapability, setAssetsTierState, sha256Hex, uploadAssetWithRetry } from "../model/asset-store";
import { UNGROUPED_ASSETS_NAME } from "../model/derive-system";
import { sanitizeUploadFileName } from "../model/file-commands";
import { blobPointer, canUseStoragePointer, DESIGN_SYSTEM_PATHS, fileExtension, isTextFilePath, parseDataUriHeader, storagePointerForFile } from "../model/file-policy";
import { DESIGN_SYSTEM_INLINE_LIMITS, estimateEmbeddedStringBytes, formatInlineBudgetBytes } from "../model/file-table";
import { chooseFileStorageRoute, EMPTY_STORAGE_CATALOG, findStoredBlobByDigest, uniqueStoredBlobBytes, uniqueStoredBlobCount } from "../model/storage";

var UNSUPPORTED_UPLOAD_KIND_MESSAGE: string;
var UPLOAD_REASON_MESSAGES: Record<string, string>;
var countedFileLabel: (count: number) => string;
var ADDED_FILES_PREFIX: string;
var MAX_UPLOAD_SUMMARY_ITEMS: number;
var MAX_UPLOAD_ERROR_DETAILS: number;
function uploadedAssetFile(file: File): Model.UploadedAssetFile {
  return {
    file: file,
    kind: assetFileExtension(file.name, file.type),
    name: sanitizeUploadFileName(uploadFileBaseName(file.name)),
  };
}
function createUploadBatchState(): Model.AssetUploadBatchState {
  return {
    rateLimited: false,
  };
}
function resolveAssetUploadRoute(
  uploadOptions: Editor.AssetFileUploadOptions,
  file: Editor.AssetUploadApi | null,
): Editor.AssetUploadRoute {
  let value = uploadOptions.catalogue?.() ?? EMPTY_STORAGE_CATALOG,
    uploadValue = getAssetsCatalogState(),
    uploadStatus =
      uploadValue.state === "listed"
        ? uploadValue.usage.bytes
        : uniqueStoredBlobBytes(value),
    uploadRecord =
      uploadValue.state === "listed"
        ? uploadValue.usage.files
        : uniqueStoredBlobCount(value),
    uploadRoute =
      uploadValue.state === "listed"
        ? {
            blobMaxBytes: uploadValue.usage.maxBytes,
            blobMaxFiles: uploadValue.usage.maxFiles,
          }
        : {};
  return {
    room: uploadOptions.room?.() ?? Number.POSITIVE_INFINITY,
    tier: file === null ? "off" : getAssetsTierState().state,
    blobUsed: uploadStatus,
    blobCount: uploadRecord,
    ...uploadRoute,
    cat: value,
  };
}
function resolveAssetStorageApi(
  uploadOptionsA: Editor.AssetFileUploadOptions,
): Promise<Editor.AssetUploadApi | null> {
  if (uploadOptionsA.api === undefined) {
    return resolveAssetsCapability() as Promise<Editor.AssetUploadApi | null>;
  } else {
    return Promise.resolve(uploadOptionsA.api);
  }
}
function readUploadedFileValue(
  file: Model.UploadedAssetFile,
  bytes: Uint8Array,
): Editor.UploadedFileValue {
  if (isTextFilePath(file.name)) {
    try {
      return {
        value: new TextDecoder("utf-8", {
          fatal: true,
        }).decode(bytes),
      };
    } catch {
      return {
        reason: "not valid UTF-8 text",
      };
    }
  }
  let value =
    file.kind !== null
      ? ASSET_EXTENSION_MIME_TYPES[file.kind]
      : file.file.type !== ""
        ? file.file.type
        : "application/octet-stream";
  return {
    value: bytesToFileDataUrl(value, bytes),
  };
}
function deduplicatedUploadedAsset(
  file: Model.StorageCatalog,
  bytes: string,
  existingIds: ReadonlySet<string>,
): Editor.UploadedBlob | null {
  let catalogue = listedAssetIds(),
    existing = findStoredBlobByDigest(file, bytes, catalogue);
  if (existing !== null && !existingIds.has(existing.id)) {
    return {
      ...existing,
      sha256: bytes,
    };
  }
  if (catalogue === null) {
    return null;
  }
  let value = getRecentOrphanedAssets().find(
    (uploadInput: Storage.OrphanedAsset & { sha256?: string }) =>
      uploadInput.sha256 === bytes &&
      catalogue.has(uploadInput.id) &&
      !existingIds.has(uploadInput.id),
  );
  if (value !== undefined) {
    return {
      id: value.id,
      bytes: value.bytes,
      type: "",
      sha256: bytes,
    };
  } else {
    return null;
  }
}
function commitUploadedAsset(
  uploaded: Model.UploadedAssetFile,
  result: Editor.UploadedBlob,
  mimeType: string,
  uploadOptionsB: Editor.AssetFileUploadOptions,
): Editor.FileUploadResult {
  let now = uploadOptionsB.now ?? (() => new Date().toISOString()),
    record: Model.AssetUploadRecord = {
      store: "blob",
      id: result.id,
      sha256: result.sha256,
      bytes: result.bytes > 0 ? result.bytes : uploaded.file.size,
      type: result.type !== "" ? result.type : mimeType,
      name: uploaded.file.name.slice(0, 200),
      addedAt: now(),
      via: "page",
      ...(result.url !== undefined
        ? {
            url: result.url,
          }
        : {}),
    };
  return {
    ok: true,
    fileName: uploaded.name,
    value: blobPointer(result.id),
    tier: "blob",
    record: record,
    deduped: true,
  };
}
async function uploadAssetFile(
  uploaded: Model.UploadedAssetFile,
  fontUpload: boolean,
  uploadOptionsC: Editor.AssetFileUploadOptions = {},
  progress: Editor.UploadProgress = { i: 1, n: 1 },
): Promise<Editor.FileUploadResult> {
  if (
    fontUpload &&
    (uploaded.kind === null ||
      !FONT_FILE_EXTENSIONS.includes(uploaded.kind))
  ) {
    return {
      ok: false,
      reason: "not a woff2, woff, ttf, or otf font",
    };
  }
  let value = progress.batch ?? createUploadBatchState(),
    uploadValueA = canUseStoragePointer(uploaded.name)
      ? await resolveAssetStorageApi(uploadOptionsC)
      : null,
    uploadStatusA = resolveAssetUploadRoute(uploadOptionsC, uploadValueA),
    uploadRecordA = uploadOptionsC.freeing?.() ?? new Set(),
    state = {
      name: uploaded.name,
      type: uploaded.file.type,
      size: uploaded.file.size,
      font: fontUpload,
    },
    uploadRouteA = chooseFileStorageRoute(
      state,
      value.rateLimited
        ? {
            ...uploadStatusA,
            tier: "off",
          }
        : uploadStatusA,
    ),
    uploadType =
      uploadRouteA.to !== "blob" && canUseStoragePointer(uploaded.name)
        ? chooseFileStorageRoute(state, {
            ...uploadStatusA,
            blobUsed: 0,
            blobCount: 0,
          })
        : null;
  if (uploadType !== null && uploadType.to === "blob") {
    let uploadDetails = deduplicatedUploadedAsset(
      uploadStatusA.cat,
      await sha256Hex(
        new Uint8Array(await uploaded.file.arrayBuffer()),
      ),
      uploadRecordA,
    );
    if (uploadDetails !== null) {
      return commitUploadedAsset(uploaded, uploadDetails, uploadType.type, uploadOptionsC);
    }
  }
  if (uploadRouteA.to === "refuse") {
    if (
      value.rateLimited &&
      chooseFileStorageRoute(state, uploadStatusA).to === "blob"
    ) {
      return {
        ok: false,
        reason: "rate-limited — add it again in a minute.",
      };
    } else {
      return failedAssetUploadResult(uploadRouteA);
    }
  }
  let uploadBytes = new Uint8Array(await uploaded.file.arrayBuffer()),
    uploadName = (() => {
      let uploadDetailsA = classifyAssetUpload(
        "",
        uploaded.kind,
        uploaded.file.size,
      );
      if (uploadDetailsA.mode === "original") {
        return uploadDetailsA.warning;
      } else {
        return undefined;
      }
    })(),
    callback = (uploadInputA?: string): Editor.FileUploadResult => {
      let uploadDetailsB = readUploadedFileValue(uploaded, uploadBytes);
      if ("reason" in uploadDetailsB) {
        return {
          ok: false,
          reason: uploadDetailsB.reason,
        };
      }
      if (
        estimateEmbeddedStringBytes(uploadDetailsB.value) >
        (uploadOptionsC.room?.() ?? Number.POSITIVE_INFINITY)
      ) {
        return {
          ok: false,
          reason:
            uiMessage("design-system.uploadPipeline.noRoomADesignSystem") +
            formatInlineBudgetBytes(
              DESIGN_SYSTEM_INLINE_LIMITS.total,
            ) +
            " in the page — remove something first",
        };
      }
      let uploadWarning = uploadInputA ?? uploadName;
      return {
        ok: true,
        fileName: uploaded.name,
        value: uploadDetailsB.value,
        tier: "inline",
        ...(uploadWarning !== undefined
          ? {
              warning: uploadWarning,
            }
          : {}),
      };
    };
  if (
    uploadRouteA.to === "inline" ||
    !canUseStoragePointer(uploaded.name)
  ) {
    return callback(
      value.rateLimited &&
        chooseFileStorageRoute(state, uploadStatusA).to === "blob"
        ? uiMessage("design-system.uploadPipeline.storedInThePageInstead")
        : undefined,
    );
  }
  let uploadTimestamp = uploadOptionsC.now ?? (() => new Date().toISOString()),
    uploadHash = await sha256Hex(uploadBytes),
    uploadDuplicate = deduplicatedUploadedAsset(uploadStatusA.cat, uploadHash, uploadRecordA);
  if (uploadDuplicate !== null) {
    return commitUploadedAsset(uploaded, uploadDuplicate, uploadRouteA.type, uploadOptionsC);
  }
  if (uploadValueA === null) {
    return callback();
  }
  uploadOptionsC.onProgress?.(
    (progress.n > 1
      ? uiMessage("design-system.uploadPipeline.uploading") +
        String(progress.i) +
        " of " +
        String(progress.n) +
        " · "
      : uiMessage("design-system.uploadPipeline.uploading")) + uploaded.name,
  );
  let uploadPointer =
      uploaded.file.type === uploadRouteA.type
        ? uploaded.file
        : new Blob([uploadBytes], {
            type: uploadRouteA.type,
          }),
    uploadResult = await uploadAssetWithRetry(
      uploadValueA,
      uploadPointer,
      uploadRouteA.type,
      {
        ...(uploadOptionsC.sleep !== undefined
          ? {
              sleep: uploadOptionsC.sleep,
            }
          : {}),
        now: uploadTimestamp,
        onWait: (uploadInputB: number, uploadOptionsD: string) =>
          uploadOptionsC.onProgress?.(
            (uploadOptionsD === "rate_limited"
              ? uiMessage("design-system.uploadPipeline.uploadsAreBeingRateLimited")
              : uiMessage("design-system.uploadPipeline.theStoreDidNotAnswer")) +
              uploaded.name +
              " in " +
              String(Math.round(uploadInputB / 1000)) +
              " s (" +
              String(progress.i) +
              " of " +
              String(progress.n) +
              ")",
          ),
      },
    );
  if (uploadResult.ok) {
    setAssetsTierState("on");
    rememberOrphanedAsset({
      id: uploadResult.id,
      bytes: uploadResult.bytes,
      path: uploaded.name,
      sha256: uploadHash,
    });
    let uploadValueB: Model.AssetUploadRecord = {
      store: "blob",
      id: uploadResult.id,
      sha256: uploadHash,
      bytes: uploadResult.bytes,
      type: uploadResult.type,
      name: uploaded.file.name.slice(0, 200),
      addedAt: uploadTimestamp(),
      via: "page",
      ...(uploadResult.url !== undefined
        ? {
            url: uploadResult.url,
          }
        : {}),
    };
    return {
      ok: true,
      fileName: uploaded.name,
      value: blobPointer(uploadResult.id),
      tier: "blob",
      record: uploadValueB,
    };
  }
  let type = uploadRouteA.type;
  uploadRouteA = chooseFileStorageRoute(state, {
    ...resolveAssetUploadRoute(uploadOptionsC, uploadValueA),
    tier: "off",
  });
  if (uploadResult.kind === "tier-off" || uploadResult.kind === "not-granted") {
    let uploadDetailsC: string =
      uploadResult.kind === "not-granted" ? "not_granted" : "disabled";
    if (setAssetsTierState("off", uploadDetailsC)) {
      uploadOptionsC.onTierOff?.(uploadDetailsC);
    }
    if (uploadRouteA.to === "refuse") {
      return failedAssetUploadResult(uploadRouteA);
    } else {
      return callback();
    }
  }
  if (uploadResult.kind === "backoff") {
    value.rateLimited = true;
  }
  if (uploadRouteA.to === "inline") {
    return callback(
      uploadResult.kind === "inline-if-fits" || uploadResult.kind === "quota"
        ? undefined
        : uiMessage("design-system.uploadPipeline.storedInThePageInstead2") +
            uploadResult.code +
            ")",
    );
  }
  let uploadReason = assetUploadFailureMessage(
    uploadResult.kind,
    uploadResult.code,
    uploaded.file.size,
    type,
  );
  if (
    (uploadResult.kind === "too-large" || uploadResult.kind === "inline-if-fits") &&
    uploadRouteA.to === "refuse" &&
    uploadRouteA.handOff !== undefined
  ) {
    return {
      ok: false,
      reason: uploadReason,
      handOff: "too-large",
    };
  } else {
    return {
      ok: false,
      reason: uploadReason,
    };
  }
}
function failedAssetUploadResult(
  result: Extract<Storage.UploadRoute, { to: "refuse" }>,
): Editor.FileUploadResult {
  return {
    ok: false,
    reason: result.reason,
    ...(result.handOff !== undefined
      ? {
          handOff: result.handOff,
        }
      : {}),
  };
}
function commitUploadedAssetChange(
  change: (mutate: Application.ContentMutation) => boolean,
  mutate: Application.ContentMutation,
  validateFile?: (
    path: string,
    value: string,
  ) => Application.FileSaveProblem | undefined,
): Application.UploadCommitResult {
  let problem: Editor.UploadProblem | undefined,
    result = change((uploadInputC: Model.DesignSystemContent) => {
      problem = undefined;
      let value = mutate(uploadInputC);
      if (value === uploadInputC || validateFile === undefined) {
        return value;
      }
      for (let [uploadValueC, uploadStatusB] of Object.entries(value.files)) {
        if (
          Object.hasOwn(uploadInputC.files, uploadValueC) ||
          !(
            uploadValueC.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) ||
            uploadValueC.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)
          )
        ) {
          continue;
        }
        let uploadRecordB =
          storagePointerForFile(uploadValueC, uploadStatusB) === null
            ? validateFile(uploadValueC, uploadStatusB)
            : undefined;
        if (uploadRecordB === undefined) {
          continue;
        }
        problem = {
          problem: uploadRecordB,
          path: uploadValueC,
        };
        return uploadInputC;
      }
      return value;
    });
  return problem ?? result;
}
function describeUploadProblem({
  problem: problem,
  path: path,
}: Editor.UploadProblem): string {
  if (problem.forNow === true) {
    return uiMessage("design-system.uploadPipeline.canTBeSavedRight");
  }
  if (problem.cause === "kind") {
    let uploadRecordC = fileExtension(path);
    if (uploadRecordC === "lottie") {
      return ".lottie files can’t be saved here: add the Lottie JSON instead";
    }
    if (["docx", "pptx", "xlsx"].includes(uploadRecordC)) {
      return (
        uiMessage("design-system.uploadPipeline.wonTOpenAsA") +
        uploadRecordC +
        " file, perhaps damaged or password-protected: use a fresh copy"
      );
    }
    if (uploadRecordC === "zip") {
      return uiMessage("design-system.uploadPipeline.wonTOpenAsA2");
    }
    return uiMessage("design-system.uploadPipeline.thisKindOfFileCan");
  }
  if (problem.cause !== "name") {
    return UPLOAD_REASON_MESSAGES[problem.cause];
  }
  let value = path.slice(path.lastIndexOf("/") + 1),
    uploadValueD = path.slice(0, -value.length),
    uploadStatusC = /[%;#]/.test(value);
  if (/[%;:?#]/.test(uploadValueD)) {
    if (uploadStatusC) {
      return uiMessage("design-system.uploadPipeline.chooseASetOrFolder");
    } else {
      return uiMessage("design-system.uploadPipeline.chooseASetOrFolder2");
    }
  }
  if (uploadStatusC) {
    return uiMessage("design-system.uploadPipeline.renameTheFileWithoutOr");
  }
  if (hasDamagedUnicode(value)) {
    return uiMessage("design-system.uploadPipeline.renameTheFileTheName");
  }
  if (value.endsWith(".cmekshadow")) {
    return uiMessage("design-system.uploadPipeline.thisKindOfFileCan");
  }
  if (hasDamagedUnicode(uploadValueD)) {
    return uiMessage("design-system.uploadPipeline.chooseASetOrFolder3");
  } else {
    return uiMessage("design-system.uploadPipeline.chooseAShorterSetOr");
  }
}
async function uploadAssetFiles(
  files: File[],
  group: Editor.AssetBatchUploadOptions,
  uploadOptionsE?: string,
): Promise<Application.AssetUploadSummary> {
  let result: Application.AssetUploadSummary = {
      fonts: 0,
      assets: {},
      blobs: 0,
      refused: [],
      warnings: [],
    },
    state = createUploadBatchState(),
    resolvedFiles = files.filter(
      (uploadInputD): boolean => !isIgnoredUploadFile(uploadInputD),
    ),
    index: number = 0;
  for (let value of resolvedFiles) {
    index++;
    let uploadValueE:Editor.UploadDestination =
        uploadOptionsE !== undefined &&
        !isFontFile(value.name, value.type)
          ? {
              to: "assets",
              group: uploadOptionsE,
              subpath: "",
            }
          : assetUploadDestination(
              value.name,
              value.type,
              uploadedFileRelativePath(value),
            ),
      uploadStatusD = uploadedAssetFile(value);
    group.onProgress?.(
      (resolvedFiles.length > 1
        ? uiMessage("design-system.uploadPipeline.adding") +
          String(index) +
          " of " +
          String(resolvedFiles.length) +
          " · "
        : uiMessage("design-system.uploadPipeline.adding")) + uploadStatusD.name,
    );
    let uploadRecordD = await uploadAssetFile(uploadStatusD, uploadValueE.to === "fonts", group, {
      i: index,
      n: resolvedFiles.length,
      batch: state,
    });
    if (!uploadRecordD.ok) {
      result.refused.push({
        name: uploadStatusD.name,
        bytes: uploadStatusD.file.size,
        reason: uploadRecordD.reason.replace(/\.$/, ""),
        ...(uploadRecordD.handOff !== undefined
          ? {
              handOff: uploadRecordD.handOff,
            }
          : {}),
      });
      continue;
    }
    let uploadRouteB =
      uploadValueE.to === "fonts"
        ? group.font(
            {
              fileName: uploadRecordD.fileName,
              value: uploadRecordD.value,
              ...inferFontMetadata(value.name),
              ...(uploadRecordD.record !== undefined
                ? {
                    record: uploadRecordD.record,
                  }
                : {}),
            },
            value,
          )
        : group.asset(
            {
              group: uploadValueE.group,
              subpath: uploadValueE.subpath,
              fileName: uploadRecordD.fileName,
              value: uploadRecordD.value,
              ...(uploadRecordD.record !== undefined
                ? {
                    record: uploadRecordD.record,
                  }
                : {}),
            },
            value,
          );
    if (uploadRouteB !== true) {
      result.refused.push(
        uploadRouteB === false
          ? {
              name: uploadStatusD.name,
              bytes: uploadStatusD.file.size,
              reason: "it couldn’t be stored",
            }
          : {
              name: uploadStatusD.name,
              bytes: uploadStatusD.file.size,
              reason: describeUploadProblem(uploadRouteB),
              atDoor: true,
            },
      );
      continue;
    }
    if (
      uploadRecordD.warning !== undefined &&
      uploadRecordD.warning.startsWith("stored in the page instead")
    ) {
      result.warnings.push(uploadStatusD.name + " (" + uploadRecordD.warning + ")");
    }
    if (uploadValueE.to === "fonts") {
      result.fonts++;
    } else {
      let uploadTypeA =
        uploadValueE.group === UNGROUPED_ASSETS_NAME ? "" : uploadValueE.group;
      result.assets[uploadTypeA] = (result.assets[uploadTypeA] ?? 0) + 1;
    }
    if (uploadRecordD.tier === "blob") {
      result.blobs++;
    }
  }
  group.onProgress?.(null);
  return result;
}
async function existingFontUploadFiles(
  files: Model.FileTable,
  storage: Editor.AssetFileUploadOptions,
  uploadOptionsF: (
    path: string,
    previous: string,
    next: string,
    record: Model.AssetUploadRecord,
  ) => boolean,
): Promise<number> {
  let value = Object.entries(files).filter(
    ([uploadInputE, uploadInputF]) =>
      uploadInputE.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) &&
      isFontFile(uploadInputE, "") &&
      uploadInputF.startsWith("data:"),
  );
  if (value.length === 0) {
    return 0;
  }
  let uploadValueF = await resolveAssetStorageApi(storage);
  if (uploadValueF === null || getAssetsTierState().state === "off") {
    return 0;
  }
  let uploadStatusE = createUploadBatchState(),
    index: number = 0;
  for (let [uploadRecordE, [uploadRouteC, uploadTypeB]] of value.entries()) {
    let uploadBytesA = downloadDataUrlBytes(uploadTypeB);
    if (uploadBytesA === null) {
      continue;
    }
    let uploadNameA = uploadRouteC.slice(DESIGN_SYSTEM_PATHS.fontsDir.length),
      uploadTimestampA = new File([new Uint8Array(uploadBytesA)], uploadNameA, {
        type: parseDataUriHeader(uploadTypeB)?.mime ?? "",
      }),
      uploadHashA = await uploadAssetFile(
        {
          file: uploadTimestampA,
          kind: assetFileExtension(uploadNameA, uploadTimestampA.type),
          name: uploadNameA,
        },
        true,
        {
          ...storage,
          api: uploadValueF,
        },
        {
          i: uploadRecordE + 1,
          n: value.length,
          batch: uploadStatusE,
        },
      );
    if (!(uploadHashA.ok && uploadHashA.tier === "blob")) {
      break;
    }
    if (
      uploadHashA.record !== undefined &&
      uploadOptionsF(uploadRouteC, uploadTypeB, uploadHashA.value, uploadHashA.record)
    ) {
      index++;
    }
  }
  storage.onProgress?.(null);
  return index;
}
function mergeAssetUploadResults(
  left: Application.AssetUploadSummary,
  right: Application.AssetUploadSummary,
): Application.AssetUploadSummary {
  let assets = {
    ...left.assets,
  };
  for (let [value, uploadValueG] of Object.entries(right.assets)) {
    assets[value] = (assets[value] ?? 0) + uploadValueG;
  }
  return {
    fonts: left.fonts + right.fonts,
    assets: assets,
    blobs: left.blobs + right.blobs,
    refused: [...left.refused, ...right.refused],
    warnings: [...left.warnings, ...right.warnings],
  };
}
function countSuccessfulUploads(
  result: Application.AssetUploadSummary,
): number {
  return (
    result.fonts +
    Object.values(result.assets).reduce(
      (uploadInputG, uploadOptionsG) => uploadInputG + uploadOptionsG,
      0,
    )
  );
}
function uploadDestinationSummary(
  result: Application.AssetUploadSummary,
): string[] {
  let parts: string[] = [];
  if (result.fonts > 0) {
    parts.push(String(result.fonts) + " to Font files");
  }
  let callback = (uploadInputH: string) =>
    [ASSETS_SECTION_LABEL, uiMessage("design-system.uploadPipeline.fontFiles")].some(
      (uploadInputI): boolean => uploadInputI.toLowerCase() === uploadInputH.toLowerCase(),
    );
  for (let [value, uploadValueH] of Object.entries(result.assets)) {
    parts.push(
      String(uploadValueH) +
        " to " +
        (value === ""
          ? ASSETS_SECTION_LABEL
          : callback(value)
            ? "assets/" + value + "/"
            : value),
    );
  }
  return parts;
}
function addedFilesSummary(result: Application.AssetUploadSummary): string {
  let count = countSuccessfulUploads(result);
  if (count === 0) {
    return "";
  }
  let destinations = uploadDestinationSummary(result);
  return (
    uiMessage("design-system.uploadPipeline.added") +
    countedFileLabel(count) +
    (destinations.length === 1
      ? destinations[0].slice(String(count).length)
      : ": " + destinations.join(", "))
  );
}
function uploadedFilesBuildSummary(
  result: Application.AssetUploadSummary,
): string {
  let count = countSuccessfulUploads(result);
  if (count === 0) {
    return "";
  } else {
    return uiMessage("design-system.uploadPipeline.uploaded") + countedFileLabel(count) + " to build from";
  }
}
function uploadResultSummary(
  result: Application.AssetUploadSummary,
  leftOut: boolean,
  build: boolean = false,
): { text: string; handOff?: Application.RefusedUpload[] } | null {
  let count = countSuccessfulUploads(result),
    handoffs = result.refused.filter(
      (uploadInputJ): boolean => uploadInputJ.handOff !== undefined,
    ),
    items: string[] = [];
  if (count > 0) {
    items.push(
      addedFilesSummary(result) +
        (handoffs.length > 0 || build
          ? "."
          : leftOut
            ? // MineDesign: user-facing copy calls the agent "the agent", not Claude.
              " — the agent will take it from here."
            : ". Save when you’re ready and the agent will take it from here."),
    );
  }
  if (result.warnings.length > 0) {
    items.push(
      uiMessage("design-system.uploadPipeline.keptInThePage") + joinLimitedUploadMessages(result.warnings) + ".",
    );
  }
  for (let value of ["figma", "too-large", undefined]) {
    let uploadValueI = result.refused.filter(
      (uploadInputK): boolean => uploadInputK.handOff === value,
    );
    if (uploadValueI.length > 0) {
      items.push(failedUploadSummary(value, uploadValueI));
    }
  }
  if (items.length === 0) {
    return null;
  }
  return {
    text: items.join(" "),
    ...(handoffs.length > 0
      ? {
          handOff: handoffs,
        }
      : {}),
  };
}
function joinLimitedUploadMessages(messages: string[]): string {
  if (messages.length <= MAX_UPLOAD_SUMMARY_ITEMS) {
    return messages.join("; ");
  } else {
    return (
      messages.slice(0, MAX_UPLOAD_SUMMARY_ITEMS).join("; ") +
      "; and " +
      String(messages.length - MAX_UPLOAD_SUMMARY_ITEMS) +
      " more"
    );
  }
}
function summarizeUploadItems<T>(
  items: T[],
  label: (item: T) => string,
): string {
  let value = items.slice(0, MAX_UPLOAD_SUMMARY_ITEMS).map(label),
    uploadValueJ =
      items.length > MAX_UPLOAD_SUMMARY_ITEMS
        ? String(items.length - MAX_UPLOAD_SUMMARY_ITEMS) + " more"
        : (value.pop() ?? "");
  if (value.length === 0) {
    return uploadValueJ;
  } else {
    return value.join(", ") + " and " + uploadValueJ;
  }
}
function failedUploadSummary(
  result: string | undefined,
  files: Application.RefusedUpload[],
): string {
  let value: boolean = files.length === 1,
    uploadValueK: string = value ? " was not uploaded" : " were not uploaded";
  if (result === "figma") {
    return (
      summarizeUploadItems(files, (uploadInputL) =>
        truncateHandoffFileName(uploadInputL.name),
      ) +
      uploadValueK +
      " — add the " +
      (value ? uiMessage("design-system.uploadPipeline.fileOrItsShareLink") : uiMessage("design-system.uploadPipeline.filesOrTheirShareLinks")) +
      " in the chat instead."
    );
  }
  if (result === "too-large") {
    return (
      summarizeUploadItems(files, (uploadInputM) =>
        truncateHandoffFileName(uploadInputM.name),
      ) +
      uploadValueK +
      " — " +
      (value ? uiMessage("design-system.uploadPipeline.itS") : uiMessage("design-system.uploadPipeline.theyRe")) +
      " too large, attach " +
      (value ? "it" : "them") +
      " in the chat instead."
    );
  }
  let callback = (uploadInputN: string, uploadOptionsH: number): string =>
      uploadInputN + (uploadOptionsH === 1 ? " was not uploaded." : " were not uploaded."),
    uploadHandler = (items: Application.RefusedUpload[]) =>
      callback(
        summarizeUploadItems(
          items,
          (uploadInputO): string =>
            truncateHandoffFileName(uploadInputO.name) +
            " (" +
            uploadInputO.reason +
            ")",
        ),
        items.length,
      ),
    entries = new Map<string, Application.RefusedUpload[]>();
  for (let uploadTypeC of files) {
    if (uploadTypeC.atDoor === true) {
      entries.set(uploadTypeC.reason, [
        ...(entries.get(uploadTypeC.reason) ?? []),
        uploadTypeC,
      ]);
    }
  }
  let uploadStatusF = files.filter((uploadInputP): boolean => uploadInputP.atDoor !== true);
  if (
    entries.size === files.length - uploadStatusF.length &&
    files.length <= MAX_UPLOAD_ERROR_DETAILS
  ) {
    return uploadHandler(files);
  }
  let uploadRecordF = [...entries.entries()].sort(
      (uploadInputQ, uploadOptionsI) => uploadOptionsI[1].length - uploadInputQ[1].length,
    ),
    uploadRouteD = uploadRecordF
      .slice(MAX_UPLOAD_ERROR_DETAILS)
      .reduce((uploadInputR, [, items]) => uploadInputR + items.length, 0);
  return [
    ...(uploadStatusF.length === 0 ? [] : [uploadHandler(uploadStatusF)]),
    ...uploadRecordF
      .slice(0, MAX_UPLOAD_ERROR_DETAILS)
      .map(([uploadInputS, items]) =>
        callback(
          summarizeUploadItems(items, (uploadInputT) =>
            truncateHandoffFileName(uploadInputT.name),
          ) +
            " (" +
            uploadInputS +
            ")",
          items.length,
        ),
      ),
    ...(uploadRouteD === 0
      ? []
      : [
          callback(
            String(uploadRouteD) + (uploadRouteD === 1 ? " more file" : " more files"),
            uploadRouteD,
          ),
        ]),
  ].join(" ");
}
function uploadFileBaseName(fileName: string): string {
  let baseName = fileName.trim().replace(/^.*[\\/]/, "");
  if (baseName !== "") {
    return baseName;
  } else {
    return assetNameFromFileName(fileName);
  }
}
function pickUploadFiles(
  multiple: boolean = false,
  accept?: string,
): Promise<File[]> {
  return new Promise<File[]>((uploadInputU): void => {
    let value = document.createElement("input");
    value.type = "file";
    value.multiple = true;
    if (accept !== undefined) {
      value.accept = accept;
    }
    if (multiple) {
      value.webkitdirectory = true;
    }
    value.style.position = "fixed";
    value.style.left = "-9999px";
    let callback = (uploadInputV: File[]): void => {
      value.remove();
      uploadInputU(uploadInputV);
    };
    value.addEventListener(
      "change",
      () =>
        callback(
          Array.from(value.files ?? []).filter(
            (uploadInputW): boolean => !isIgnoredUploadFile(uploadInputW),
          ),
        ),
      {
        once: true,
      },
    );
    value.addEventListener("cancel", () => callback([]), {
      once: true,
    });
    document.body.appendChild(value);
    value.click();
  });
}
function get_UNSUPPORTED_UPLOAD_KIND_MESSAGE() {
  return uiMessage("design-system.uploadPipeline.thisKindOfFileCan");
}
function get_ADDED_FILES_PREFIX() {
  return uiMessage("design-system.uploadPipeline.added");
}
export {
  get_ADDED_FILES_PREFIX,
  addedFilesSummary,
  commitUploadedAsset,
  commitUploadedAssetChange,
  countedFileLabel,
  countSuccessfulUploads,
  createUploadBatchState,
  deduplicatedUploadedAsset,
  describeUploadProblem,
  existingFontUploadFiles,
  failedAssetUploadResult,
  failedUploadSummary,
  joinLimitedUploadMessages,
  MAX_UPLOAD_ERROR_DETAILS,
  MAX_UPLOAD_SUMMARY_ITEMS,
  mergeAssetUploadResults,
  pickUploadFiles,
  readUploadedFileValue,
  resolveAssetStorageApi,
  resolveAssetUploadRoute,
  summarizeUploadItems,
  get_UNSUPPORTED_UPLOAD_KIND_MESSAGE,
  UPLOAD_REASON_MESSAGES,
  uploadAssetFile,
  uploadAssetFiles,
  uploadDestinationSummary,
  uploadedAssetFile,
  uploadedFilesBuildSummary,
  uploadFileBaseName,
  uploadResultSummary,
};
export function installEditorUploadPipeline(): () => void {
  return () => {
    UNSUPPORTED_UPLOAD_KIND_MESSAGE =
      "this kind of file can’t be saved here: convert to another format";
    UPLOAD_REASON_MESSAGES = {
      damaged_text: "fix the damaged character in the text, then add again",
      size: "too large to save here",
      unreadable: "contents could not be read",
      gone: "can’t be saved here",
      other: "can’t be saved here",
    };
    countedFileLabel = (count: number): string =>
      String(count) + (count === 1 ? " file" : " files");
    ADDED_FILES_PREFIX = "Added ";
    MAX_UPLOAD_SUMMARY_ITEMS = 5;
    MAX_UPLOAD_ERROR_DETAILS = 3;
  };
}
