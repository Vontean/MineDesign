/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { sameOriginFileFetcher, setDeclarationReferences } from "../design-system/type-declarations";
import { encodeStorePathSegment, FilesValue, isFullProjectPath, isProjectTextFilePath, isTypeDeclarationPath, PlatformFileContentResolvedValue_10 as maxDeclarationFileBytes, ProjectValue } from "./file-content";
import { PlatformFileReferencesLimit as maxProjectTextFiles, PlatformFileReferencesLimit_2 as maxDeclarationFiles, PlatformFileReferencesResolvedValue as maxReferencedFileBytes } from "./file-references";

var publishedSupportFileReferences: Dynamic;
var publishedReferencePaths: Dynamic;
var parseFileReferencesValue: Dynamic;
var PlatformExternalFilesProjectWoffPattern: Dynamic;
var reservedProjectPaths: Dynamic;
var externalFileReferences: Dynamic;
var publishedDeclarationReferences: Dynamic;
var usedStorePathSegments: Dynamic;
var referenceStore: Dynamic;
function getAllFileReferencePaths(): Dynamic {
  return [
    ...publishedReferencePaths,
    ...parseFileReferencesValue.map((reference?: Dynamic): Dynamic => reference.path),
    ...externalFileReferences.map(
      (reference?: Dynamic): Dynamic => reference.path,
    ),
  ];
}
function parseFontFileReferences(publishedFiles?: Dynamic): Dynamic {
  let textReferences: Dynamic = [];
  if (publishedFiles === null || typeof publishedFiles != "object" || Array.isArray(publishedFiles))
    return textReferences;
  let droppedCount: Dynamic = 0,
    declarationReferences: Dynamic = [];
  for (let [fullPath, fileMetadata] of Object.entries(publishedFiles) as Dynamic) {
    let relativePath: Dynamic = fullPath.slice(ProjectValue.length),
      fileBytes: Dynamic = fileMetadata?.size;
    if (
      !(
        !isFullProjectPath(fullPath) ||
        reservedProjectPaths.has(fullPath.toLowerCase()) ||
        PlatformExternalFilesProjectWoffPattern.test(fullPath)
      )
    ) {
      if (isTypeDeclarationPath(relativePath)) {
        declarationReferences.length < maxDeclarationFiles &&
        !(
          typeof fileBytes == "number" &&
          fileBytes > maxDeclarationFileBytes
        )
          ? declarationReferences.push({
              path: relativePath,
              file: fullPath,
              ...(typeof fileBytes == "number"
                ? {
                    bytes: fileBytes,
                  }
                : {}),
            })
          : droppedCount++;
        continue;
      }
      if (
        !isProjectTextFilePath(relativePath) ||
        textReferences.length >= maxProjectTextFiles ||
        (typeof fileBytes == "number" &&
          fileBytes > maxReferencedFileBytes)
      ) {
        droppedCount++;
        continue;
      }
      textReferences.push({
        path: relativePath,
        file: fullPath,
        ...(typeof fileBytes == "number"
          ? {
              bytes: fileBytes,
            }
          : {}),
      });
    }
  }
  return Object.assign(
    textReferences,
    droppedCount > 0
      ? {
          dropped: droppedCount,
        }
      : {},
    declarationReferences.length > 0
      ? {
          types: declarationReferences,
        }
      : {},
  );
}
function setExternalFileReferences(
  referencesByPath?: Dynamic,
  fetchFile?: Dynamic,
  existingStorePathSegments?: Dynamic,
): Dynamic {
  fetchFile ??= sameOriginFileFetcher();
  usedStorePathSegments = new Set(existingStorePathSegments);
  externalFileReferences = [...referencesByPath]
    .sort(
      ([earlierPath]: Dynamic, [laterPath]: Dynamic): Dynamic =>
        earlierPath < laterPath ? -1 : earlierPath > laterPath ? 1 : 0,
    )
    .map(
      ([filePath, reference]: Dynamic): Dynamic => ({
        path: filePath,
        file: reference.ref.startsWith("blob:")
          ? reference.ref
          : "/" + reference.ref.replace(/^\//, ""),
        ...(reference.bytes > 0
          ? {
              bytes: reference.bytes,
            }
          : {}),
      }),
    );
  setDeclarationReferences(
    getTypeDeclarationReferences(),
    fetchFile,
  );
}
function getExternalFileReferences(): Dynamic {
  return externalFileReferences.map(
    (reference?: Dynamic): Dynamic => ({
      path: reference.path,
      ref: reference.file.replace(/^\//, ""),
    }),
  );
}
function setFileReferenceStore(store?: Dynamic): Dynamic {
  referenceStore = store;
}
async function saveExternalFileReference(
  filePath?: Dynamic,
  dataRef?: Dynamic,
  dataBytes?: Dynamic,
  contentType?: Dynamic,
  isPathTaken?: Dynamic,
): Promise<Dynamic> {
  if (referenceStore === undefined) return "no-store";
  let normalizedStorePathSegment: Dynamic = encodeStorePathSegment(
    filePath,
  ).toLowerCase();
  return isPathTaken(filePath) ||
    externalFileReferences.some(
      (reference?: Dynamic): Dynamic =>
        reference.path.toLowerCase() === filePath.toLowerCase(),
    ) ||
    [...usedStorePathSegments].some(
      (storedSegment?: Dynamic): Dynamic => storedSegment.toLowerCase() === normalizedStorePathSegment,
    )
    ? "taken"
    : (usedStorePathSegments.add(
        encodeStorePathSegment(filePath),
      ),
      await referenceStore.set(
        FilesValue + "/" + encodeStorePathSegment(filePath),
        {
          path: filePath,
          kind: "text",
          dataRef: dataRef,
          dataBytes: dataBytes,
          contentType: contentType,
        },
      ),
      "written");
}
function getTypeDeclarationReferences(): Dynamic {
  let externalDeclarations: Dynamic = externalFileReferences.filter(
    (reference?: Dynamic): Dynamic =>
      isTypeDeclarationPath(reference.path) &&
      !((reference.bytes ?? 0) > maxDeclarationFileBytes),
  );
  return [
    ...externalDeclarations,
    ...publishedDeclarationReferences.filter(
      (publishedReference?: Dynamic): Dynamic =>
        !externalDeclarations.some(
          (externalReference?: Dynamic): Dynamic => externalReference.path === publishedReference.path,
        ),
    ),
  ].slice(0, maxDeclarationFiles);
}
export {
  getAllFileReferencePaths,
  getExternalFileReferences,
  getTypeDeclarationReferences,
  parseFileReferencesValue,
  parseFontFileReferences,
  referenceStore as PlatformExternalFilesAlias,
  publishedSupportFileReferences as PlatformExternalFilesItems,
  externalFileReferences as PlatformExternalFilesMapValue,
  PlatformExternalFilesProjectWoffPattern,
  publishedReferencePaths as PlatformExternalFilesResolvedValue,
  publishedDeclarationReferences as PlatformExternalFilesResolvedValue_2,
  reservedProjectPaths as PlatformExternalFilesSubscribers,
  usedStorePathSegments as PlatformExternalFilesSubscribers_2,
  saveExternalFileReference,
  setExternalFileReferences,
  setFileReferenceStore,
};
export function set_parseFileReferencesValue(references: any): any {
  parseFileReferencesValue = references;
  return references;
}
export function set_PlatformExternalFilesItems(publishedReferences: any): any {
  publishedSupportFileReferences = publishedReferences;
  return publishedReferences;
}
export function set_PlatformExternalFilesResolvedValue(publishedPaths: any): any {
  publishedReferencePaths = publishedPaths;
  return publishedPaths;
}
export function set_PlatformExternalFilesResolvedValue_2(publishedTypes: any): any {
  publishedDeclarationReferences = publishedTypes;
  return publishedTypes;
}
export function installPlatformExternalFiles(): () => void {
  return () => {
    publishedSupportFileReferences = [];
    publishedReferencePaths = [];
    parseFileReferencesValue = [];
    PlatformExternalFilesProjectWoffPattern =
      /^project\/ds\/[^/]+\/.+\.(woff2|woff|ttf|otf)$/i;
    reservedProjectPaths = new Set([
      ProjectValue + "manifest.json",
      ProjectValue + "design-system.json",
    ]);
    externalFileReferences = [];
    publishedDeclarationReferences = [];
    usedStorePathSegments = new Set();
  };
}
