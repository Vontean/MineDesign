import type * as Storage from "../contracts/model-storage";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import type { ParseReport, StorageCatalog } from "../contracts";
import { BLOB_ID_PATTERN, canUseStoragePointer, fileExtension, isHeldFilePointer, isTextFilePath, isValidDesignSystemPath, MAX_DESIGN_SYSTEM_FILES, mimeTypeForPath, storagePointerForFile } from "./file-policy";
import { DESIGN_SYSTEM_INLINE_LIMITS, KIBIBYTE, MEBIBYTE, parseManifest } from "./file-table";

var SVG_MIME_TYPE: string;
var BLOB_STORAGE_LIMITS: Storage.StorageLimits;
var BLOB_STORAGE_MIME_TYPES: Record<string, string>;
var BLOB_STORAGE_ACCEPTED_MIME_TYPES: Set<string>;
var MAX_INLINE_FONT_BYTESModelStorage: number;
var MAX_INLINE_ASSET_BYTESModelStorage: number;
var FIGMA_FILE_REFUSAL_MESSAGE: string;
var INLINE_NO_ROOM_MESSAGE: string;
var BLOB_STORE_UNAVAILABLE_MESSAGE: string;
var EMPTY_STORAGE_CATALOG: Model.StorageCatalog;
var STORAGE_SHA256_PATTERN: RegExp;
var STORAGE_MIME_TYPE_PATTERN: RegExp;
var STORAGE_BLOB_URL_PATTERN: RegExp;
var isStorageCatalogObject: (
  input: unknown,
) => input is Storage.DatabaseRecord;
function storedFileByteLimit(mime: string | null): number {
  if (mime === SVG_MIME_TYPE) {
    return BLOB_STORAGE_LIMITS.svgFile;
  } else {
    return BLOB_STORAGE_LIMITS.file;
  }
}
function isFigmaFile(name: string): boolean {
  return /\.fig$/i.test(name);
}
function formatUploadBytes(bytes: number): string {
  if (bytes >= MEBIBYTE) {
    return (
      (bytes / MEBIBYTE)
        .toFixed(bytes >= 10 * MEBIBYTE ? 0 : 1)
        .replace(/\.0$/, "") + " MB"
    );
  } else {
    return String(Math.max(1, Math.ceil(bytes / KIBIBYTE))) + " KB";
  }
}
function explainUploadSize(
  bytes: number,
  limit: number,
  limitLabel: string = "the limit",
): string {
  if (formatUploadBytes(bytes) === formatUploadBytes(limit)) {
    return "it’s just over " + limitLabel + " of " + formatUploadBytes(limit);
  } else {
    return (
      "it’s " +
      formatUploadBytes(bytes) +
      " and " +
      limitLabel +
      " is " +
      formatUploadBytes(limit)
    );
  }
}
function estimateBase64StringBytes(bytes: number): number {
  return Math.ceil(bytes / 3) * 4 + 48;
}
function chooseFileStorageRoute(
  file: Storage.UploadCandidate,
  budget: Storage.UploadBudget,
): Storage.UploadRoute {
  if (isFigmaFile(file.name)) {
    return {
      to: "refuse",
      reason: FIGMA_FILE_REFUSAL_MESSAGE,
      handOff: "figma",
    };
  }
  let mime = storedMimeTypeForPath(file.name, file.type);
  if (isTextFilePath(file.name) && mime === null) {
    if (file.size > MAX_INLINE_ASSET_BYTESModelStorage) {
      return {
        to: "refuse",
        reason:
          "text files can be at most " +
          formatUploadBytes(MAX_INLINE_ASSET_BYTESModelStorage) +
          " here",
        handOff: "too-large",
      };
    }
    if (file.size + 64 <= budget.room) {
      return {
        to: "inline",
      };
    } else {
      return {
        to: "refuse",
        reason: INLINE_NO_ROOM_MESSAGE,
      };
    }
  }
  let inlineBytes = isTextFilePath(file.name)
      ? file.size + 64
      : estimateBase64StringBytes(file.size),
    inlineLimit: number = file.font
      ? MAX_INLINE_FONT_BYTESModelStorage
      : MAX_INLINE_ASSET_BYTESModelStorage,
    fitsInline = file.size <= inlineLimit && inlineBytes <= budget.room;
  if (mime === null) {
    if (fitsInline) {
      return {
        to: "inline",
      };
    }
    if (file.size > inlineLimit) {
      return {
        to: "refuse",
        reason:
          (file.font ? "fonts" : "files like this") +
          " can be at most " +
          formatUploadBytes(inlineLimit) +
          " here",
        handOff: "too-large",
      };
    }
    return {
      to: "refuse",
      reason: INLINE_NO_ROOM_MESSAGE,
    };
  }
  if (budget.tier === "off") {
    if (fitsInline) {
      return {
        to: "inline",
      };
    }
    if (file.size > inlineLimit) {
      return {
        to: "refuse",
        reason:
          explainUploadSize(
            file.size,
            inlineLimit,
            file.font ? "the limit for fonts here" : "the limit here",
          ) +
          " (" +
          BLOB_STORE_UNAVAILABLE_MESSAGE +
          ")",
        handOff: "too-large",
      };
    }
    return {
      to: "refuse",
      reason:
        INLINE_NO_ROOM_MESSAGE + " (" + BLOB_STORE_UNAVAILABLE_MESSAGE + ")",
    };
  }
  let blobLimit = storedFileByteLimit(mime);
  if (file.size > blobLimit) {
    if (fitsInline) {
      return {
        to: "inline",
      };
    }
    return {
      to: "refuse",
      reason: explainUploadSize(
        file.size,
        blobLimit,
        mime === SVG_MIME_TYPE ? "the limit for SVG" : "the limit",
      ),
      handOff: "too-large",
    };
  }
  let blobMaxBytes = budget.blobMaxBytes ?? BLOB_STORAGE_LIMITS.total;
  if (
    budget.blobUsed + file.size > blobMaxBytes ||
    budget.blobCount >= (budget.blobMaxFiles ?? BLOB_STORAGE_LIMITS.files)
  ) {
    if (fitsInline) {
      return {
        to: "inline",
      };
    }
    return {
      to: "refuse",
      reason:
        "this design system’s file storage is full (" +
        formatUploadBytes(budget.blobUsed) +
        " of " +
        formatUploadBytes(blobMaxBytes) +
        ", " +
        String(budget.blobCount) +
        // MineDesign: user-facing copy calls the agent "the agent", not Claude.
        " files) — free space under Assets, or ask the agent to start a fresh system.",
    };
  }
  return {
    to: "blob",
    type: mime,
  };
}
function storedMimeTypeForPath(
  path: string,
  providedMime: string = "",
): string | null {
  if (!canUseStoragePointer(path)) {
    return null;
  }
  let mime =
    BLOB_STORAGE_MIME_TYPES[fileExtension(path)] ?? null;
  if (mime !== null) {
    return mime;
  }
  let normalizedMime = providedMime.split(";")[0]?.trim().toLowerCase() ?? "";
  if (BLOB_STORAGE_ACCEPTED_MIME_TYPES.has(normalizedMime)) {
    return normalizedMime;
  } else {
    return null;
  }
}
function boundedStorageText(
  text: unknown,
  maxLength: number,
): string | undefined {
  if (typeof text !== "string") {
    return;
  }
  let trimmed = text.trim();
  if (
    trimmed === "" ||
    trimmed.length > maxLength ||
    /[\u0000-\u001f\u007f]/.test(trimmed)
  ) {
    return;
  }
  return trimmed;
}
function boundedStorageBytes(
  bytes: unknown,
  maxBytes: number = 4398046511104,
): number {
  if (typeof bytes === "number" && Number.isFinite(bytes) && bytes >= 0) {
    return Math.min(Math.floor(bytes), maxBytes);
  } else {
    return 0;
  }
}
function parseStorageRecord(
  path: string,
  storageRecord: unknown,
  report: Model.ParseReport,
): Model.StorageRecord | null {
  if (!isStorageCatalogObject(storageRecord)) {
    return null;
  }
  let store: Model.StorageKind | null =
    storageRecord.store === "blob" ||
    storageRecord.store === "file" ||
    storageRecord.store === "inline"
      ? storageRecord.store
      : null;
  if (store === null) {
    report.dropped.push(
      "manifest.json storage " +
        JSON.stringify(path.slice(0, 60)) +
        ": unknown store",
    );
    return null;
  }
  let id = boundedStorageText(storageRecord.id, 64);
  if (
    store === "blob" &&
    (id === undefined || !BLOB_ID_PATTERN.test(id))
  ) {
    report.dropped.push(
      "manifest.json storage " +
        JSON.stringify(path.slice(0, 60)) +
        ": blob record without a usable id",
    );
    return null;
  }
  let mime = boundedStorageText(storageRecord.type, 100)?.toLowerCase(),
    record: Model.StorageRecord = {
      store: store,
      bytes: boundedStorageBytes(
        storageRecord.bytes,
        store === "blob" ? BLOB_STORAGE_LIMITS.file : undefined,
      ),
      type:
        mime !== undefined && STORAGE_MIME_TYPE_PATTERN.test(mime)
          ? mime
          : mimeTypeForPath(path),
    };
  if (store === "blob") {
    record.id = id;
  }
  let url = boundedStorageText(storageRecord.url, 2048);
  if (url !== undefined && STORAGE_BLOB_URL_PATTERN.test(url)) {
    record.url = url;
  }
  let normalizedSha256 = boundedStorageText(storageRecord.sha256, 64)?.toLowerCase();
  if (normalizedSha256 !== undefined && STORAGE_SHA256_PATTERN.test(normalizedSha256)) {
    record.sha256 = normalizedSha256;
  }
  let storedSha256 = boundedStorageText(
    storageRecord.storedSha256,
    64,
  )?.toLowerCase();
  if (
    storedSha256 !== undefined &&
    STORAGE_SHA256_PATTERN.test(storedSha256) &&
    storedSha256 !== record.sha256
  ) {
    record.storedSha256 = storedSha256;
  }
  let name = boundedStorageText(storageRecord.name, 200);
  if (name !== undefined) {
    record.name = name;
  }
  let addedAt = boundedStorageText(storageRecord.addedAt, 40);
  if (addedAt !== undefined) {
    record.addedAt = addedAt;
  }
  let via = boundedStorageText(storageRecord.via, 120);
  if (via !== undefined) {
    record.via = via;
  }
  let thumb = boundedStorageText(storageRecord.thumb, 300);
  if (thumb !== undefined && isValidDesignSystemPath(thumb)) {
    record.thumb = thumb;
  }
  let supersedes = boundedStorageText(storageRecord.supersedes, 64);
  if (supersedes !== undefined && BLOB_ID_PATTERN.test(supersedes)) {
    record.supersedes = supersedes;
  }
  return record;
}
function storageCatalogFromManifest(
  manifestInput: unknown,
  report: ParseReport = {
    dropped: [],
    warnings: [],
  },
): StorageCatalog {
  let manifest = parseManifest(manifestInput, report);
  if (!Object.hasOwn(manifest, "storage")) {
    return {
      files: {},
    };
  }
  let storage = manifest.storage;
  if (!isStorageCatalogObject(storage)) {
    report.dropped.push(
      "manifest.json storage: not an object — the storage catalogue was ignored",
    );
    return {
      files: {},
    };
  }
  let files: Record<string, Model.StorageRecord> = {},
    count: number = 0;
  if (
    Object.hasOwn(storage, "files") &&
    !isStorageCatalogObject(storage.files)
  ) {
    report.dropped.push(
      "manifest.json storage.files: not an object — ignored",
    );
  }
  if (isStorageCatalogObject(storage.files)) {
    for (let value in storage.files) {
      if (!Object.hasOwn(storage.files, value)) {
        continue;
      }
      if (count >= MAX_DESIGN_SYSTEM_FILES) {
        break;
      }
      if (
        !isValidDesignSystemPath(value) ||
        !canUseStoragePointer(value)
      ) {
        report.dropped.push(
          "manifest.json storage " +
            JSON.stringify(String(value).slice(0, 60)) +
            ": not a binary table path",
        );
        continue;
      }
      let storageRecord = parseStorageRecord(value, storage.files[value], report);
      if (storageRecord === null) {
        continue;
      }
      files[value] = storageRecord;
      count++;
    }
  }
  return {
    files: files,
  };
}
function reconcileStorageCatalog(
  files: Model.FileTable,
  catalog: Model.StorageCatalog,
): Model.StorageCatalog {
  let reconciled: Record<string, Model.StorageRecord> = {},
    pointers: [string, Model.StoragePointer][] = [];
  for (let value of Object.keys(files).sort()) {
    let pointer = storagePointerForFile(value, files[value]);
    if (
      pointer !== null &&
      !isHeldFilePointer(value, files[value])
    ) {
      pointers.push([value, pointer]);
    }
  }
  let recordsById = new Map<string, Model.StorageRecord>();
  for (let value of Object.keys(catalog.files)) {
    let record = catalog.files[value];
    if (
      record.store === "blob" &&
      record.id !== undefined &&
      !recordsById.has(record.id)
    ) {
      recordsById.set(record.id, record);
    }
  }
  for (let [value, record] of pointers) {
    let fileRecord = catalog.files[value];
    if (record.store === "blob") {
      if (
        fileRecord !== undefined &&
        fileRecord.store === "blob" &&
        fileRecord.id === record.id
      ) {
        reconciled[value] = fileRecord;
        continue;
      }
      let entry = recordsById.get(record.id);
      reconciled[value] =
        entry !== undefined
          ? {
              ...entry,
            }
          : {
              store: "blob",
              id: record.id,
              bytes: 0,
              type:
                storedMimeTypeForPath(value) ??
                mimeTypeForPath(value),
            };
    } else {
      reconciled[value] =
        fileRecord !== undefined && fileRecord.store === "file"
          ? fileRecord
          : {
              store: "file",
              bytes: 0,
              type: mimeTypeForPath(value),
            };
    }
  }
  return {
    files: reconciled,
  };
}
function referencedBlobIds(files: Model.FileTable): Set<string> {
  let ids = new Set<string>();
  for (let value of Object.keys(files)) {
    let pointer = storagePointerForFile(value, files[value]);
    if (pointer !== null && pointer.store === "blob") {
      ids.add(pointer.id);
    }
  }
  return ids;
}
function uniqueStoredBlobBytes(catalog: Model.StorageCatalog): number {
  let bytes = 0,
    seenIds = new Set();
  for (let value of Object.keys(catalog.files)) {
    let record = catalog.files[value];
    if (
      record.store !== "blob" ||
      record.id === undefined ||
      seenIds.has(record.id)
    ) {
      continue;
    }
    seenIds.add(record.id);
    bytes += record.bytes;
  }
  return bytes;
}
function uniqueStoredBlobCount(catalog: Model.StorageCatalog): number {
  let ids = new Set<string>();
  for (let value of Object.keys(catalog.files)) {
    let record = catalog.files[value];
    if (record.store === "blob" && record.id !== undefined) {
      ids.add(record.id);
    }
  }
  return ids.size;
}
function findStoredBlobByDigest(
  catalog: Model.StorageCatalog,
  digest: string,
  knownIds: ReadonlySet<string> | null | undefined,
): Storage.KnownStoredBlob | null {
  for (let value of Object.keys(catalog.files).sort()) {
    let record = catalog.files[value];
    if (
      record.store !== "blob" ||
      record.id === undefined ||
      (record.sha256 !== digest &&
        !(record.storedSha256 === digest && /\.svg$/i.test(value)))
    ) {
      continue;
    }
    if (
      knownIds !== undefined &&
      knownIds !== null &&
      !knownIds.has(record.id)
    ) {
      continue;
    }
    return {
      id: record.id,
      bytes: record.bytes,
      type: record.type,
      ...(record.url !== undefined
        ? {
            url: record.url,
          }
        : {}),
    };
  }
  return null;
}
function storageRecordForFile(
  files: Model.FileTable,
  catalog: Model.StorageCatalog,
  path: string,
): Model.StorageRecord | null {
  let content = files[path];
  if (content === undefined) {
    return null;
  }
  let pointer = storagePointerForFile(path, content);
  if (pointer === null) {
    return null;
  }
  let record = catalog.files[path];
  if (
    record !== undefined &&
    record.store === pointer.store &&
    (pointer.store !== "blob" || record.id === pointer.id)
  ) {
    return record;
  }
  if (pointer.store === "blob") {
    return {
      store: "blob",
      id: pointer.id,
      bytes: 0,
      type: storedMimeTypeForPath(path) ?? mimeTypeForPath(path),
    };
  } else {
    return {
      store: "file",
      bytes: 0,
      type: mimeTypeForPath(path),
    };
  }
}
function compareReferencedAndStoredBlobs(
  files: Model.FileTable,
  storedIds: ReadonlySet<string>,
): Storage.StorageComparison {
  let referencedIds = referencedBlobIds(files),
    missingPaths: string[] = [];
  for (let value of Object.keys(files).sort()) {
    let pointer = storagePointerForFile(value, files[value]);
    if (
      pointer !== null &&
      pointer.store === "blob" &&
      !storedIds.has(pointer.id)
    ) {
      missingPaths.push(value);
    }
  }
  return {
    missing: missingPaths,
    missingIds: [...referencedIds]
      .filter((blobId: string): boolean => !storedIds.has(blobId))
      .sort(),
    unreferenced: [...storedIds]
      .filter((blobId: string): boolean => !referencedIds.has(blobId))
      .sort(),
  };
}
function dropMissingBlobDigests(
  catalog: Model.StorageCatalog,
  missingIds: ReadonlySet<string>,
): Model.StorageCatalog {
  if (missingIds.size === 0) {
    return catalog;
  }
  let changed: boolean = false,
    files: Record<string, Model.StorageRecord> = {};
  for (let value of Object.keys(catalog.files)) {
    let record = catalog.files[value];
    if (
      record.store === "blob" &&
      record.id !== undefined &&
      missingIds.has(record.id) &&
      (record.sha256 !== undefined || record.storedSha256 !== undefined)
    ) {
      let { sha256: sha256, storedSha256: storedSha256, ...recordWithoutDigests } = record;
      files[value] = recordWithoutDigests;
      changed = true;
    } else {
      files[value] = record;
    }
  }
  if (changed) {
    return {
      files: files,
    };
  } else {
    return catalog;
  }
}
function serializeStorageCatalog(
  catalog: Model.StorageCatalog,
): Storage.SerializedStorageCatalog | undefined {
  let paths = Object.keys(catalog.files).sort();
  if (paths.length === 0) {
    return;
  }
  let files: Record<string, Model.StorageRecord> = {};
  for (let value of paths) {
    let record = catalog.files[value];
    files[value] = {
      store: record.store,
      ...(record.id !== undefined
        ? {
            id: record.id,
          }
        : {}),
      ...(record.url !== undefined
        ? {
            url: record.url,
          }
        : {}),
      ...(record.sha256 !== undefined
        ? {
            sha256: record.sha256,
          }
        : {}),
      ...(record.storedSha256 !== undefined
        ? {
            storedSha256: record.storedSha256,
          }
        : {}),
      bytes: record.bytes,
      type: record.type,
      ...(record.name !== undefined
        ? {
            name: record.name,
          }
        : {}),
      ...(record.addedAt !== undefined
        ? {
            addedAt: record.addedAt,
          }
        : {}),
      ...(record.via !== undefined
        ? {
            via: record.via,
          }
        : {}),
      ...(record.thumb !== undefined
        ? {
            thumb: record.thumb,
          }
        : {}),
      ...(record.supersedes !== undefined
        ? {
            supersedes: record.supersedes,
          }
        : {}),
    };
  }
  return {
    files: files,
    blobBytesUsed: uniqueStoredBlobBytes(catalog),
  };
}
export {
  BLOB_STORAGE_ACCEPTED_MIME_TYPES,
  BLOB_STORAGE_LIMITS,
  BLOB_STORAGE_MIME_TYPES,
  BLOB_STORE_UNAVAILABLE_MESSAGE,
  boundedStorageBytes,
  boundedStorageText,
  chooseFileStorageRoute,
  compareReferencedAndStoredBlobs,
  dropMissingBlobDigests,
  EMPTY_STORAGE_CATALOG,
  estimateBase64StringBytes,
  explainUploadSize,
  FIGMA_FILE_REFUSAL_MESSAGE,
  findStoredBlobByDigest,
  formatUploadBytes,
  INLINE_NO_ROOM_MESSAGE,
  isFigmaFile,
  isStorageCatalogObject,
  MAX_INLINE_ASSET_BYTESModelStorage,
  MAX_INLINE_FONT_BYTESModelStorage,
  parseStorageRecord,
  reconcileStorageCatalog,
  referencedBlobIds,
  serializeStorageCatalog,
  STORAGE_BLOB_URL_PATTERN,
  STORAGE_MIME_TYPE_PATTERN,
  STORAGE_SHA256_PATTERN,
  storageCatalogFromManifest,
  storageRecordForFile,
  storedFileByteLimit,
  storedMimeTypeForPath,
  SVG_MIME_TYPE,
  uniqueStoredBlobBytes,
  uniqueStoredBlobCount,
};
export function installModelStorage(): () => void {
  return () => {
    SVG_MIME_TYPE = "image/svg+xml";
    BLOB_STORAGE_LIMITS = {
      file: 20 * MEBIBYTE,
      svgFile: 2 * MEBIBYTE,
      total: 1024 * MEBIBYTE,
      files: 5000,
    };
    BLOB_STORAGE_MIME_TYPES = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
      svg: SVG_MIME_TYPE,
      mp4: "video/mp4",
      webm: "video/webm",
      pdf: "application/pdf",
      woff2: "font/woff2",
      woff: "font/woff",
      ttf: "font/ttf",
      otf: "font/otf",
    };
    BLOB_STORAGE_ACCEPTED_MIME_TYPES = new Set(
      Object.values(BLOB_STORAGE_MIME_TYPES),
    );
    MAX_INLINE_FONT_BYTESModelStorage =
      Math.floor((DESIGN_SYSTEM_INLINE_LIMITS.font * 3) / 4) - 1024;
    MAX_INLINE_ASSET_BYTESModelStorage =
      Math.floor((DESIGN_SYSTEM_INLINE_LIMITS.asset * 3) / 4) - 1024;
    FIGMA_FILE_REFUSAL_MESSAGE = ".fig files can’t be used here directly";
    INLINE_NO_ROOM_MESSAGE =
      "no room: the page holds " +
      formatUploadBytes(DESIGN_SYSTEM_INLINE_LIMITS.total) +
      " in all — remove something first";
    BLOB_STORE_UNAVAILABLE_MESSAGE =
      "large-file storage isn’t available in this view";
    EMPTY_STORAGE_CATALOG = {
      files: {},
    };
    STORAGE_SHA256_PATTERN = /^[0-9a-f]{64}$/;
    STORAGE_MIME_TYPE_PATTERN =
      /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/;
    STORAGE_BLOB_URL_PATTERN = /^blob:[^\s"'<>\\]{1,2040}$/;
    isStorageCatalogObject = (
      candidate: unknown,
    ): candidate is Storage.DatabaseRecord =>
      typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
  };
}
