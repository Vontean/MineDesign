import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { addressedProjectFileUrl } from "./addressed-files";
import { hasDownloadCapability, saveThroughShell } from "./download-permission";
import { filePreviewUrl } from "../model/derive-system";
import { consumptionDocumentationForFiles } from "../model/documentation";
import { DESIGN_SYSTEM_PATHS, fileExtension, GENERATED_TOKENS_CSS_PATH, isHeldFilePointer, isTextFilePath, parseDataUriHeader, storagePointerForFile } from "../model/file-policy";
import { generateNamedTokensCss } from "../model/tokens";
import { toModuleNamespace } from "../module-helpers";

var reactAssetUpload: typeof import("react");
var zipCrc32Table: Uint32Array;
var fetchDownloadFileBytes: Editor.DownloadBytesFetcher;
var addressedDownloadFileUrl: (
  files: Model.FileTable,
  path: string,
) => string | undefined;
var FONT_FILE_WEIGHT_PATTERNS: [RegExp, string][];
var fileRelativePathOverrides: WeakMap<File, string>;
var MAX_DROPPED_FILES: number;
var IGNORED_UPLOAD_FILE_NAME_PATTERN: RegExp;
function downloadZipBaseName(name: string): string {
  let baseName = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  if (baseName !== "") {
    return baseName.slice(0, 60);
  } else {
    return "design-system";
  }
}
function zipCrc32(bytes: Uint8Array): number {
  let crc: number = 4294967295;
  for (let index: number = 0; index < bytes.length; index++) {
    crc = zipCrc32Table[(crc ^ bytes[index]) & 255] ^ (crc >>> 8);
  }
  return (crc ^ 4294967295) >>> 0;
}
function createStoredZip(entries: Application.ZipEntry[]): Uint8Array {
  let encoder = new TextEncoder(),
    localEntries: Uint8Array[] = [],
    centralDirectory: Uint8Array[] = [],
    offset = 0;
  for (let entry of entries) {
    let entryNameBytes = encoder.encode(entry.name),
      entryBytes =
        typeof entry.data === "string"
          ? encoder.encode(entry.data)
          : entry.data,
      entryCrc = zipCrc32(entryBytes),
      localHeader = new DataView(new ArrayBuffer(30));
    localHeader.setUint32(0, 67324752, true);
    localHeader.setUint16(4, 20, true);
    localHeader.setUint16(6, 2048, true);
    localHeader.setUint16(8, 0, true);
    localHeader.setUint16(10, 0, true);
    localHeader.setUint16(12, 33, true);
    localHeader.setUint32(14, entryCrc, true);
    localHeader.setUint32(18, entryBytes.length, true);
    localHeader.setUint32(22, entryBytes.length, true);
    localHeader.setUint16(26, entryNameBytes.length, true);
    localHeader.setUint16(28, 0, true);
    localEntries.push(new Uint8Array(localHeader.buffer), entryNameBytes, entryBytes);
    let centralHeader = new DataView(new ArrayBuffer(46));
    centralHeader.setUint32(0, 33639248, true);
    centralHeader.setUint16(4, 20, true);
    centralHeader.setUint16(6, 20, true);
    centralHeader.setUint16(8, 2048, true);
    centralHeader.setUint16(10, 0, true);
    centralHeader.setUint16(12, 0, true);
    centralHeader.setUint16(14, 33, true);
    centralHeader.setUint32(16, entryCrc, true);
    centralHeader.setUint32(20, entryBytes.length, true);
    centralHeader.setUint32(24, entryBytes.length, true);
    centralHeader.setUint16(28, entryNameBytes.length, true);
    centralHeader.setUint16(30, 0, true);
    centralHeader.setUint16(32, 0, true);
    centralHeader.setUint16(34, 0, true);
    centralHeader.setUint16(36, 0, true);
    centralHeader.setUint32(38, 0, true);
    centralHeader.setUint32(42, offset, true);
    centralDirectory.push(new Uint8Array(centralHeader.buffer), entryNameBytes);
    offset += 30 + entryNameBytes.length + entryBytes.length;
  }
  let value = centralDirectory.reduce(
      (totalLength, chunk) => totalLength + chunk.length,
      0,
    ),
    endRecord = new DataView(new ArrayBuffer(22));
  endRecord.setUint32(0, 101010256, true);
  endRecord.setUint16(8, entries.length, true);
  endRecord.setUint16(10, entries.length, true);
  endRecord.setUint32(12, value, true);
  endRecord.setUint32(16, offset, true);
  let items = [
      ...localEntries,
      ...centralDirectory,
      new Uint8Array(endRecord.buffer),
    ],
    archiveBytes = new Uint8Array(
      items.reduce((totalLength, chunk) => totalLength + chunk.length, 0),
    ),
    index = 0;
  for (let chunk of items) {
    archiveBytes.set(chunk, index);
    index += chunk.length;
  }
  return archiveBytes;
}
function downloadDataUrlBytes(dataUrl: string): Uint8Array | null {
  let metadata = parseDataUriHeader(dataUrl);
  if (metadata === null) {
    return null;
  }
  let payload = dataUrl.slice(metadata.payloadOffset);
  if (metadata.base64) {
    try {
      let value = atob(payload),
        decodedBytes = new Uint8Array(value.length);
      for (let index: number = 0; index < value.length; index++) {
        decodedBytes[index] = value.charCodeAt(index);
      }
      return decodedBytes;
    } catch {
      return null;
    }
  }
  try {
    return new TextEncoder().encode(decodeURIComponent(payload));
  } catch {
    return null;
  }
}
async function collectDownloadFiles(
  files: Model.FileTable,
  paths: Model.NormalizedTokens,
  storage: string,
  prefix: Model.StorageCatalog,
  fetchBytes: Editor.DownloadBytesFetcher = fetchDownloadFileBytes,
): Promise<{
  entries: Application.ZipEntry[];
  skipped: string[];
}> {
  let entries: Application.ZipEntry[] = [],
    missing: string[] = [],
    usedNames = new Set();
  for (let value of Object.keys(files).sort()) {
    let fileData = files[value],
      storagePointer = storagePointerForFile(value, fileData);
    if (storagePointer === null && isTextFilePath(value)) {
      entries.push({
        name: value,
        data: fileData,
      });
      usedNames.add(value);
      continue;
    }
    if (storagePointer === null) {
      let dataUrlBytes = downloadDataUrlBytes(fileData);
      if (dataUrlBytes === null) {
        missing.push(value);
      } else {
        entries.push({
          name: value,
          data: dataUrlBytes,
        });
        usedNames.add(value);
      }
      continue;
    }
    let downloadedBytes = await preflightDownloadFiles(
      [
        addressedDownloadFileUrl(files, value),
        filePreviewUrl(files, value, prefix),
      ],
      fetchBytes,
    );
    if (downloadedBytes === null) {
      missing.push(value);
    } else {
      entries.push({
        name: value,
        data: downloadedBytes,
      });
      usedNames.add(value);
    }
  }
  if (!usedNames.has(DESIGN_SYSTEM_PATHS.readme)) {
    entries.push({
      name: DESIGN_SYSTEM_PATHS.readme,
      data: "",
    });
  }
  entries.push({
    name: GENERATED_TOKENS_CSS_PATH,
    data: generateNamedTokensCss(paths, storage),
  });
  try {
    for (let [value, documentedData] of consumptionDocumentationForFiles(
      files,
    ).files) {
      if (!usedNames.has(value)) {
        entries.push({
          name: value,
          data: documentedData,
        });
      }
    }
  } catch {}
  return {
    entries: entries,
    skipped: missing,
  };
}
async function saveDownloadFile(
  name: string,
  contents: string | Uint8Array,
  mimeType: string,
): Promise<Application.ArtifactDownloadOutcome> {
  let bytes =
      typeof contents === "string"
        ? new TextEncoder().encode(contents)
        : contents,
    permission = await saveThroughShell(bytes, name),
    callback = (
      outcome: Application.ArtifactDownloadOutcome["outcome"],
    ): Application.ArtifactDownloadOutcome => ({
      outcome: outcome,
      shell: permission,
    });
  if (
    permission.outcome === "saved" ||
    permission.outcome === "declined" ||
    permission.outcome === "withheld"
  ) {
    return callback(permission.outcome);
  }
  if (hasDownloadCapability()) {
    return callback("refused");
  }
  try {
    if (
      typeof document === "undefined" ||
      typeof URL === "undefined" ||
      typeof URL.createObjectURL !== "function"
    ) {
      return callback("failed");
    }
    let value = new Blob([bytes as BlobPart], {
        type: mimeType,
      }),
      downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(value);
    downloadLink.download = name;
    downloadLink.rel = "noopener";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    setTimeout((): void => {
      URL.revokeObjectURL(downloadLink.href);
      downloadLink.remove();
    }, 800);
    return callback("downloaded");
  } catch {
    return callback("failed");
  }
}
function unsupportedDownloadMessage(
  path: string,
  shellError: string,
): string {
  let extension = fileExtension(path),
    fileKind: string =
      extension === ""
        ? uiMessage("design-system.assetUpload.filesWithNoExtension")
        : "." + extension + " files";
  switch (shellError) {
    case "rejected_extension":
      return uiMessage("design-system.assetUpload.thisHostCanTSave") + fileKind;
    case "extension_not_enabled":
      return uiMessage("design-system.assetUpload.thisHostCanTSave") + fileKind + " yet";
    case "too_large":
      return uiMessage("design-system.assetUpload.thisHostWouldnTSave") + path;
    case "rate_limited":
      return uiMessage("design-system.assetUpload.theSaveDidnTGo");
    case "unavailable":
      return uiMessage("design-system.assetUpload.theSaveDidnTGo2");
    default:
      return uiMessage("design-system.assetUpload.couldNotDownload") + path + " here";
  }
}
async function preflightDownloadFiles(
  paths: (string | null | undefined)[],
  files: Editor.DownloadBytesFetcher,
): Promise<Uint8Array | null> {
  for (let value of new Set(paths)) {
    if (value === null || value === undefined) {
      continue;
    }
    let isDataUrl = /^data:/i.test(value)
      ? downloadDataUrlBytes(value)
      : await files(value);
    if (isDataUrl !== null) {
      return isDataUrl;
    }
  }
  return null;
}
async function readDownloadFileBytes(
  files: Model.FileTable,
  path: string,
  storage: Model.StorageCatalog,
  fetchBytes: Editor.DownloadBytesFetcher = fetchDownloadFileBytes,
): Promise<Uint8Array | null> {
  let value = files[path];
  if (value === undefined) {
    return null;
  }
  let storagePointer = storagePointerForFile(path, value);
  if (storagePointer === null && isTextFilePath(path)) {
    return new TextEncoder().encode(value);
  }
  if (storagePointer === null) {
    return downloadDataUrlBytes(value);
  }
  return preflightDownloadFiles(
    [
      addressedDownloadFileUrl(files, path),
      filePreviewUrl(files, path, storage),
    ],
    fetchBytes,
  );
}
function inferFontMetadata(fileName: string): Editor.InferredFontMetadata {
  let baseName = fileName.replace(/\.[a-z0-9]+$/i, ""),
    style: Editor.InferredFontMetadata["style"] = /italic/i.test(baseName)
      ? "italic"
      : /oblique/i.test(baseName)
        ? "oblique"
        : "normal",
    weight = "400";
  if (/variable|\bVF\b|var\b/i.test(baseName)) {
    weight = "100 900";
  } else {
    for (let [value, matchedWeight] of FONT_FILE_WEIGHT_PATTERNS) {
      if (value.test(baseName)) {
        weight = matchedWeight;
        break;
      }
    }
  }
  return {
    family: (
      baseName
        .replace(
          /[-_ ](thin|hairline|extra-?light|ultra-?light|light|regular|roman|romans|book|normal|text|medium|semi-?bold|demi-?bold|extra-?bold|ultra-?bold|heavy|bold|black|italic|italics|oblique|variable|var|vf|web|webfont|\d+x\d+|\d{3})(?=[-_ .]|$)/gi,
          "",
        )
        .replace(/[-_]+/g, " ")
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim() || baseName
    ).slice(0, 80),
    weight: weight,
    style: style,
  };
}
function uploadedFileRelativePath(file: File): string {
  return (
    fileRelativePathOverrides.get(file) ??
    file.webkitRelativePath ??
    ""
  ).replace(/^\/+/, "");
}
function withUploadedFileRelativePath(
  file: File,
  relativePath: string,
): File {
  fileRelativePathOverrides.set(file, relativePath);
  return file;
}
function isIgnoredUploadFileName(name: string): boolean {
  return IGNORED_UPLOAD_FILE_NAME_PATTERN.test(name);
}
function isIgnoredUploadFile(file: File): boolean {
  return (
    isIgnoredUploadFileName(file.name) ||
    uploadedFileRelativePath(file).split("/").some(isIgnoredUploadFileName)
  );
}
function extractDroppedFiles(
  dataTransfer: DataTransfer,
): Promise<Editor.DroppedFiles> {
  let entries: Editor.DroppedEntry[] = [],
    files: File[] = [],
    items = dataTransfer.items;
  if (
    items !== undefined &&
    items.length > 0 &&
    typeof items[0].webkitGetAsEntry === "function"
  ) {
    for (let value of Array.from(items)) {
      if (value.kind !== "file") {
        continue;
      }
      let entry = value.webkitGetAsEntry();
      if (entry !== null) {
        entries.push(entry);
      } else {
        let file = value.getAsFile();
        if (file !== null) {
          files.push(file);
        }
      }
    }
  } else {
    files.push(...Array.from(dataTransfer.files));
  }
  return collectDroppedDirectories(entries, files);
}
async function collectDroppedDirectories(
  entries: Editor.DroppedEntry[],
  files: File[] = [],
): Promise<Editor.DroppedFiles> {
  let result: Editor.DroppedFiles = {
      files: [],
      leftOut: 0,
    },
    appendFile = (file: File): void => {
      if (result.files.length < MAX_DROPPED_FILES) {
        result.files.push(file);
      } else {
        result.leftOut++;
      }
    };
  for (let value of files) {
    if (!isIgnoredUploadFileName(value.name)) {
      appendFile(value);
    }
  }
  let callback = async (
    droppedEntry: Editor.DroppedEntry,
    relativePath: string,
  ): Promise<void> => {
    if (isIgnoredUploadFileName(droppedEntry.name)) {
      return;
    }
    if (droppedEntry.isFile && droppedEntry.file !== undefined) {
      let value = await new Promise<File | null>((resolveFile) =>
        droppedEntry.file?.(
          (file) => resolveFile(file),
          () => resolveFile(null),
        ),
      );
      if (value !== null) {
        appendFile(
          relativePath === ""
            ? value
            : withUploadedFileRelativePath(value, relativePath + value.name),
        );
      }
      return;
    }
    if (droppedEntry.isDirectory && droppedEntry.createReader !== undefined) {
      let value = droppedEntry.createReader();
      for (;;) {
        let droppedEntries = await new Promise<Editor.DroppedEntry[]>((resolveEntries) =>
          value.readEntries(
            (directoryEntries) => resolveEntries(directoryEntries),
            () => resolveEntries([]),
          ),
        );
        if (droppedEntries.length === 0) {
          break;
        }
        for (let entry of droppedEntries) {
          if (result.files.length >= MAX_DROPPED_FILES && entry.isFile) {
            result.leftOut++;
            continue;
          }
          await callback(entry, relativePath + droppedEntry.name + "/");
        }
      }
    }
  };
  for (let value of entries) {
    await callback(value, "");
  }
  return result;
}
export {
  addressedDownloadFileUrl,
  collectDownloadFiles,
  collectDroppedDirectories,
  createStoredZip,
  downloadDataUrlBytes,
  downloadZipBaseName,
  extractDroppedFiles,
  fetchDownloadFileBytes,
  fileRelativePathOverrides,
  FONT_FILE_WEIGHT_PATTERNS,
  IGNORED_UPLOAD_FILE_NAME_PATTERN,
  inferFontMetadata,
  isIgnoredUploadFile,
  isIgnoredUploadFileName,
  MAX_DROPPED_FILES,
  preflightDownloadFiles,
  reactAssetUpload,
  readDownloadFileBytes,
  saveDownloadFile,
  unsupportedDownloadMessage,
  uploadedFileRelativePath,
  withUploadedFileRelativePath,
  zipCrc32,
  zipCrc32Table,
};
export function installEditorAssetUpload(): () => void {
  return () => {
    reactAssetUpload = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    zipCrc32Table = (() => {
      let value = new Uint32Array(256);
      for (let index: number = 0; index < 256; index++) {
        let crc: number = index;
        for (let bit: number = 0; bit < 8; bit++) {
          crc = crc & 1 ? 3988292384 ^ (crc >>> 1) : crc >>> 1;
        }
        value[index] = crc >>> 0;
      }
      return value;
    })();
    fetchDownloadFileBytes = async (
      url: string,
    ): Promise<Uint8Array | null> => {
      try {
        let value = await fetch(url, {
          credentials: "same-origin",
        });
        if (!value.ok) {
          return null;
        }
        return new Uint8Array(await value.arrayBuffer());
      } catch {
        return null;
      }
    };
    addressedDownloadFileUrl = (files: Model.FileTable, path: string) =>
      isHeldFilePointer(path, files[path] ?? "")
        ? addressedProjectFileUrl(path)
        : undefined;
    FONT_FILE_WEIGHT_PATTERNS = [
      [/thin|hairline/i, "100"],
      [/extra-?light|ultra-?light/i, "200"],
      [/light/i, "300"],
      [/regular|roman|book|normal|text/i, "400"],
      [/medium/i, "500"],
      [/semi-?bold|demi-?bold/i, "600"],
      [/extra-?bold|ultra-?bold|heavy/i, "800"],
      [/bold/i, "700"],
      [/black/i, "900"],
    ];
    fileRelativePathOverrides = new WeakMap();
    MAX_DROPPED_FILES = 500;
    IGNORED_UPLOAD_FILE_NAME_PATTERN =
      /^(?:\.|__MACOSX$|Thumbs\.db$|desktop\.ini$)/i;
  };
}
