/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isFullProjectPath, isProjectTextFilePath } from "./file-content";

var instanceScope: Dynamic;
var maxProjectTextFiles: Dynamic;
var maxReferencedFileBytes: Dynamic;
var maxTotalReferencedBytes: Dynamic;
var maxDeclarationFiles: Dynamic;
var publishedFileIndexPath: Dynamic;
function parseFileReferences(indexDocument?: Dynamic): Dynamic {
  let indexFiles: Dynamic = indexDocument?.files;
  if (!Array.isArray(indexFiles)) return [];
  let fileReferences: Dynamic = [],
    droppedCount: Dynamic = 0;
  for (let indexEntry of indexFiles as Dynamic) {
    let fileReference: Dynamic = indexEntry;
    if (
      fileReferences.length >= maxProjectTextFiles ||
      fileReference === null ||
      typeof fileReference != "object" ||
      !isProjectTextFilePath(fileReference.path) ||
      !isFullProjectPath(fileReference.file) ||
      (typeof fileReference.bytes == "number" &&
        fileReference.bytes > maxReferencedFileBytes) ||
      fileReferences.some((existingReference?: Dynamic): Dynamic => existingReference.path === fileReference.path)
    ) {
      droppedCount++;
      continue;
    }
    fileReferences.push({
      path: fileReference.path,
      file: fileReference.file,
      ...(typeof fileReference.bytes == "number"
        ? {
            bytes: fileReference.bytes,
          }
        : {}),
    });
  }
  return Object.assign(
    fileReferences,
    droppedCount > 0
      ? {
          dropped: droppedCount,
        }
      : {},
  );
}
async function fetchPublishedFileIndex(fetchFile?: Dynamic): Promise<Dynamic> {
  try {
    let response: Dynamic = await fetchFile(publishedFileIndexPath);
    if (!response.ok)
      return {
        files: response.status === 404 ? null : undefined,
        narrowed: false,
      };
    let indexDocument: Dynamic = await response.json(),
      files: Dynamic = indexDocument.files;
    return {
      files:
        files !== null && typeof files == "object" && !Array.isArray(files)
          ? files
          : undefined,
      narrowed: indexDocument.narrowed === true,
    };
  } catch {
    return {
      files: undefined,
      narrowed: false,
    };
  }
}
async function loadReferencedFiles(
  references?: Dynamic,
  fetchFile?: Dynamic,
  alreadyLoadedBytes: Dynamic = 0,
): Promise<Dynamic> {
  let loadedFiles: Dynamic = {},
    downloadsByUrl: Dynamic = new Map(),
    failedReferences: Dynamic = [],
    loadedBytes: Dynamic = alreadyLoadedBytes,
    budgetSkippedCount: Dynamic = 0,
    nextReferenceIndex: Dynamic = 0,
    loadReference: Dynamic = async (reference?: Dynamic): Promise<Dynamic> => {
      let remainingBudget: Dynamic = (): Dynamic =>
        maxTotalReferencedBytes - loadedBytes;
      if ((reference.bytes ?? 0) > remainingBudget()) return void budgetSkippedCount++;
      let download: Dynamic = downloadsByUrl.get(reference.file);
      download === undefined &&
        ((download = (async (): Promise<Dynamic> => {
          let response: Dynamic = await fetchFile(
            reference.file.startsWith("blob:")
              ? reference.file
              : reference.file.split("/").map(encodeURIComponent).join("/"),
          );
          if (!response.ok) throw new Error("HTTP " + String(response.status));
          let headerBytes: Dynamic = Number(
            response.headers?.get?.("content-length") ?? NaN,
          );
          if (
            headerBytes > maxReferencedFileBytes ||
            headerBytes > remainingBudget()
          )
            throw new Error("over the size budget");
          let receivedBytes: Dynamic = await response.arrayBuffer();
          if (receivedBytes.byteLength > maxReferencedFileBytes)
            throw new Error("over 20 MiB");
          return receivedBytes;
        })().catch((downloadError?: Dynamic): Dynamic => {
          console.warn(
            "design (instance files): skipping a listed file \u2014 " +
              (downloadError instanceof Error ? downloadError.message : String(downloadError)),
          );
        })),
        downloadsByUrl.set(reference.file, download));
      let fileBytes: Dynamic = await download;
      if (fileBytes === undefined) return void failedReferences.push(reference);
      if (fileBytes.byteLength > remainingBudget()) return void budgetSkippedCount++;
      loadedFiles[reference.path] = new TextDecoder().decode(fileBytes);
      loadedBytes += fileBytes.byteLength;
    },
    loadNextReferences: Dynamic = async (): Promise<Dynamic> => {
      for (; nextReferenceIndex < references.length; ) await loadReference(references[nextReferenceIndex++]);
    };
  await Promise.all(
    Array.from(
      {
        length: Math.min(4, references.length),
      },
      loadNextReferences,
    ),
  );
  return {
    files: loadedFiles,
    skipped: budgetSkippedCount + failedReferences.length,
    failed: failedReferences,
    bytes: loadedBytes,
  };
}
export {
  fetchPublishedFileIndex,
  publishedFileIndexPath as FilesJsonValue,
  instanceScope as InstanceValue,
  loadReferencedFiles,
  parseFileReferences,
  maxProjectTextFiles as PlatformFileReferencesLimit,
  maxDeclarationFiles as PlatformFileReferencesLimit_2,
  maxReferencedFileBytes as PlatformFileReferencesResolvedValue,
  maxTotalReferencedBytes as PlatformFileReferencesResolvedValue_2,
};
export function installPlatformFileReferences(): () => void {
  return () => {
    instanceScope = "instance";
    maxProjectTextFiles = 1024;
    maxReferencedFileBytes = 20 * 1024 * 1024;
    maxTotalReferencedBytes = 256 * 1024 * 1024;
    maxDeclarationFiles = 8;
    publishedFileIndexPath = "_files.json";
  };
}
