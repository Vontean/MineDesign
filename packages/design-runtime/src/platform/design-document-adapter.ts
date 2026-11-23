/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { setDesignSystems } from "../design-system/store";
import { DesignSystemsKey, DesignSystemTypeDeclarationsGetLength, getArtboardHtmlReference, getHtmlReferenceState, getReferencedHtml, htmlReferenceForText, isKnownHtmlReference, knownHtmlReferenceState, scheduleHtmlUpload, setArtboardHtmlReferences, setInstanceFileReferences } from "../design-system/type-declarations";
import { CommentsValue, composeComments, decomposeComments } from "./comment-documents";
import { updateDesignSourceFile } from "./design-source";
import { basename, recordDepth, serializedDocumentBytes, structurallyEqual } from "./document-values";
import { setExternalFileReferences } from "./external-files";
import { annotationDocument, artboardDocument, BoardsValue, canvasMetadataFile, canvasMetaDocument, DesignValue, encodeStorePathSegment, FilesValue, isArtboardFile, isProjectTextFilePath, isSafeProjectPath, isSupportedProjectAsset, isTypeDeclarationPath, NotesValue, parseCanvasMetadata, designMetadataPath as designMetadataPath, designSourceDocumentPath as designSourceDocumentPath, maxSyncedArtboardBytes as maxSyncedArtboardBytes, maxSyncedFileBytes as maxSyncedFileBytes, maxCollectionBytes as maxCollectionBytes, maxInlineArtboardBytes as maxInlineArtboardBytes, PlatformFileContentXYWValues, projectFileDocument, serializeCanvasMetadata } from "./file-content";
import { InstanceValue } from "./file-references";
import { isBlobAssetUrl } from "./image-upload";
import { updateMovedToFilesState } from "./migration-state";

var PlatformDesignDocumentAdapterResolvedValue: Dynamic;
var PlatformDesignDocumentAdapterLimit: Dynamic;
var isLoadingArtboardHtml: Dynamic;
var DoctypeHtmlHtmlDataDcBoardLoadingBodyStyleMarginDisplayGridMessage: Dynamic;
var isSafeProjectPathAlias: Dynamic;
var PlatformDesignDocumentAdapterAlias: Dynamic;
var PlatformDesignDocumentAdapterHandler: Dynamic;
var designDocumentStorageAdapter: Dynamic;
function shouldStoreArtboardByReference(
  artboard?: Dynamic,
  html?: Dynamic,
): Dynamic {
  let existingReference: Dynamic = getArtboardHtmlReference(artboard.file);
  return (
    isLoadingArtboardHtml(html) ||
    (existingReference !== undefined &&
      htmlReferenceForText(html) === existingReference.ref) ||
    serializedDocumentBytes(
      artboardDocument(artboard, html),
    ) > maxInlineArtboardBytes
  );
}
function shallowDocumentEqual(left?: Dynamic, right?: Dynamic): Dynamic {
  let keys: Dynamic = Object.keys(left);
  if (keys.length !== Object.keys(right).length) return false;
  for (let key of keys as Dynamic)
    if (
      !(key in right) ||
      (left[key] !== right[key] &&
        !structurallyEqual(left[key], right[key]))
    )
      return false;
  return true;
}
function setUnchangedDocumentValue(
  nextEntries?: Dynamic,
  previousEntries?: Dynamic,
  documentPath?: Dynamic,
  nextValue?: Dynamic,
): Dynamic {
  let previousValue: Dynamic = previousEntries?.get(documentPath);
  nextEntries.set(
    documentPath,
    previousValue !== undefined && shallowDocumentEqual(previousValue, nextValue)
      ? previousValue
      : nextValue,
  );
}
function decomposeDesignDocument(
  document?: Dynamic,
  previousEntries?: Dynamic,
  carriedMetadata?: Dynamic,
): Dynamic {
  let files: Dynamic = document.content.files,
    manifest: Dynamic = parseCanvasMetadata(
      files[canvasMetadataFile],
      files,
    ),
    documentEntries: Dynamic = new Map(),
    boardOrder: Dynamic = manifest.artboards.map(
      (artboard?: Dynamic): Dynamic => artboard.file,
    );
  for (let danglingBoard of (carriedMetadata?.dangling ?? []) as Dynamic) {
    if (boardOrder.includes(danglingBoard.path)) continue;
    let predecessorIndex: Dynamic =
      danglingBoard.after === null ? -1 : boardOrder.indexOf(danglingBoard.after);
    danglingBoard.after !== null && predecessorIndex < 0
      ? boardOrder.push(danglingBoard.path)
      : boardOrder.splice(predecessorIndex + 1, 0, danglingBoard.path);
  }
  for (let artboard of manifest.artboards as Dynamic) {
    let html: Dynamic = files[artboard.file] ?? "",
      existingReference: Dynamic = getArtboardHtmlReference(artboard.file),
      boardDocument: Dynamic = artboardDocument(artboard, html);
    if (
      existingReference !== undefined &&
      (isLoadingArtboardHtml(html) ||
        htmlReferenceForText(html) === existingReference.ref)
    )
      boardDocument = {
        ...artboardDocument(artboard, ""),
        htmlRef: existingReference.ref,
        htmlBytes: existingReference.bytes,
      };
    else if (
      existingReference === undefined &&
      html ===
        DoctypeHtmlHtmlDataDcBoardLoadingBodyStyleMarginDisplayGridMessage
    ) {
      let previousBoardDocument: Dynamic = previousEntries?.get(
        BoardsValue +
          "/" +
          encodeStorePathSegment(artboard.file),
      );
      previousBoardDocument !== undefined &&
        documentEntries.set(
          BoardsValue +
            "/" +
            encodeStorePathSegment(artboard.file),
          previousBoardDocument,
        );
      continue;
    } else if (
      serializedDocumentBytes(boardDocument) >
      maxInlineArtboardBytes
    ) {
      let uploadedReference: Dynamic = htmlReferenceForText(html);
      uploadedReference !== undefined
        ? (boardDocument = {
            ...artboardDocument(artboard, ""),
            htmlRef: uploadedReference,
            htmlBytes:
              existingReference?.ref === uploadedReference
                ? existingReference.bytes
                : DesignSystemTypeDeclarationsGetLength(html),
          })
        : scheduleHtmlUpload(artboard.file, html);
    }
    setUnchangedDocumentValue(
      documentEntries,
      previousEntries,
      BoardsValue +
        "/" +
        encodeStorePathSegment(artboard.file),
      boardDocument,
    );
  }
  for (let annotation of (manifest.annotations ?? []) as Dynamic)
    setUnchangedDocumentValue(
      documentEntries,
      previousEntries,
      NotesValue + "/" + annotation.id,
      annotationDocument(annotation),
    );
  for (let filePath of Object.keys(files) as Dynamic)
    filePath === canvasMetadataFile ||
      isArtboardFile(filePath) ||
      setUnchangedDocumentValue(
        documentEntries,
        previousEntries,
        FilesValue +
          "/" +
          encodeStorePathSegment(filePath),
        projectFileDocument(filePath, files[filePath]),
      );
  decomposeComments(document.comments, previousEntries, documentEntries);
  let cover: Dynamic =
    manifest.cover ??
    (carriedMetadata?.cover !== undefined && boardOrder.includes(carriedMetadata.cover)
      ? carriedMetadata.cover
      : undefined);
  setUnchangedDocumentValue(
    documentEntries,
    previousEntries,
    designMetadataPath,
    canvasMetaDocument(
      document.title,
      cover === manifest.cover
        ? manifest
        : {
            ...manifest,
            cover: cover,
          },
      boardOrder,
    ),
  );
  return documentEntries;
}
function asString(candidate?: Dynamic): Dynamic {
  return typeof candidate == "string" ? candidate : undefined;
}
function composeDesignDocument(documentEntries?: Dynamic, _composeOptions?: Dynamic): Dynamic {
  let designMetadata: Dynamic = documentEntries.get(designMetadataPath);
  updateMovedToFilesState(designMetadata);
  setInstanceFileReferences(
    documentEntries.get(DesignValue + "/" + InstanceValue),
  );
  setDesignSystems(
    documentEntries.get(DesignValue + "/" + DesignSystemsKey),
  );
  updateDesignSourceFile(
    documentEntries.get(designSourceDocumentPath),
  );
  let boardsByPath: Dynamic = new Map(),
    htmlReferences: Dynamic = new Map(),
    inlineFiles: Dynamic = new Map(),
    externalReferences: Dynamic = new Map(),
    usedStoreSegments: Dynamic = new Set(),
    invalidDocumentCount: Dynamic = 0;
  for (let [documentPath, documentValue] of documentEntries as Dynamic) {
    let firstSlash: Dynamic = documentPath.indexOf("/"),
      collection: Dynamic = firstSlash < 0 ? "" : documentPath.slice(0, firstSlash);
    if (!(documentPath.indexOf("/", firstSlash + 1) >= 0)) {
      if (collection === BoardsValue) {
        let filePath: Dynamic = documentValue.path,
          html: Dynamic = asString(documentValue.html);
        if (
          !isSafeProjectPathAlias(filePath) ||
          !isArtboardFile(filePath) ||
          basename(documentPath) !==
            encodeStorePathSegment(filePath)
        ) {
          invalidDocumentCount++;
          continue;
        }
        let htmlRef: Dynamic = asString(documentValue.htmlRef);
        if (html === undefined && htmlRef === undefined) continue;
        let artboardSpec: Dynamic = {
          file: filePath,
        };
        for (let property of PlatformFileContentXYWValues as Dynamic)
          documentValue[property] !== undefined &&
            (artboardSpec[property] = documentValue[property]);
        if (htmlRef !== undefined && isBlobAssetUrl(htmlRef)) {
          htmlReferences.set(filePath, {
            ref: htmlRef,
            bytes: typeof documentValue.htmlBytes == "number" ? documentValue.htmlBytes : 0,
          });
          boardsByPath.set(filePath, {
            spec: artboardSpec,
            html:
              getReferencedHtml(htmlRef) ??
              DoctypeHtmlHtmlDataDcBoardLoadingBodyStyleMarginDisplayGridMessage,
          });
        } else if (htmlRef !== undefined) {
          invalidDocumentCount++;
          continue;
        } else
          boardsByPath.set(filePath, {
            spec: artboardSpec,
            html: html,
          });
      } else if (collection === FilesValue) {
        usedStoreSegments.add(basename(documentPath));
        let filePath: Dynamic = documentValue.path,
          fileContent: Dynamic = asString(documentValue.data),
          dataRef: Dynamic = asString(documentValue.dataRef),
          isReferenceableText: Dynamic =
            (isProjectTextFilePath(filePath) &&
              /\.(css|m?js)$/i.test(filePath)) ||
            isTypeDeclarationPath(filePath);
        if (
          fileContent === undefined &&
          documentValue.kind === "text" &&
          dataRef !== undefined &&
          isBlobAssetUrl(dataRef) &&
          isReferenceableText &&
          basename(documentPath) ===
            encodeStorePathSegment(filePath)
        ) {
          externalReferences.set(filePath, {
            ref: dataRef,
            bytes: typeof documentValue.dataBytes == "number" ? documentValue.dataBytes : 0,
          });
          continue;
        }
        if (
          !isSafeProjectPathAlias(filePath) ||
          isArtboardFile(filePath) ||
          filePath === canvasMetadataFile ||
          !isSupportedProjectAsset(filePath)
        ) {
          invalidDocumentCount++;
          continue;
        }
        if (
          basename(documentPath) !==
            encodeStorePathSegment(filePath) ||
          fileContent === undefined
        )
          continue;
        inlineFiles.set(filePath, fileContent);
      }
    }
  }
  invalidDocumentCount !== PlatformDesignDocumentAdapterAlias &&
    ((PlatformDesignDocumentAdapterAlias = invalidDocumentCount),
    invalidDocumentCount > 0 &&
      console.warn(
        "design (live store): not showing " +
          String(invalidDocumentCount) +
          ' store document(s) whose name or kind is outside the rules (names: letters, digits, "_", then also space, "." and "-"; files/ = images, .css, .js, .mjs, .jsx, .tsx, .json)',
      ));
  let storedBoardOrder: Dynamic = Array.isArray(designMetadata?.boardOrder)
      ? designMetadata.boardOrder.filter(
          (filePath?: Dynamic): Dynamic => typeof filePath == "string",
        )
      : [],
    danglingBoards: Dynamic = [],
    danglingDocumentPaths: Dynamic = [],
    availableBoardPaths: Dynamic = [],
    previousBoardPath: Dynamic = null;
  for (let filePath of storedBoardOrder as Dynamic)
    availableBoardPaths.includes(filePath) ||
      danglingBoards.some((danglingBoard?: Dynamic): Dynamic => danglingBoard.path === filePath) ||
      (boardsByPath.has(filePath)
        ? availableBoardPaths.push(filePath)
        : (danglingBoards.push({
            path: filePath,
            after: previousBoardPath,
          }),
          isSafeProjectPathAlias(filePath) &&
            isArtboardFile(filePath) &&
            danglingDocumentPaths.push(
              BoardsValue +
                "/" +
                encodeStorePathSegment(filePath),
            )),
      (previousBoardPath = filePath));
  setArtboardHtmlReferences(htmlReferences);
  setExternalFileReferences(externalReferences, undefined, usedStoreSegments);
  let files: Dynamic = {};
  for (let filePath of availableBoardPaths as Dynamic)
    files[filePath] = boardsByPath.get(filePath).html;
  for (let [filePath, fileContent] of [...inlineFiles].sort(
    ([earlierPath]: Dynamic, [laterPath]: Dynamic): Dynamic =>
      earlierPath < laterPath ? -1 : earlierPath > laterPath ? 1 : 0,
  ) as Dynamic)
    files[filePath] = fileContent;
  let annotations: Dynamic = [];
  for (let [documentPath, noteRecord] of documentEntries as Dynamic) {
    if (
      !documentPath.startsWith(NotesValue + "/") ||
      documentPath.indexOf("/", NotesValue.length + 1) >= 0 ||
      typeof noteRecord.x != "number" ||
      typeof noteRecord.y != "number"
    )
      continue;
    let hasNumericFields: Dynamic = (firstField?: Dynamic, secondField?: Dynamic): Dynamic =>
      typeof noteRecord[firstField] == "number" &&
      typeof noteRecord[secondField] == "number";
    (noteRecord.kind === "rect" || noteRecord.kind === "oval"
      ? hasNumericFields("w", "h")
      : noteRecord.kind === "line" || noteRecord.kind === "arrow"
        ? hasNumericFields("x2", "y2")
        : noteRecord.kind === "pen"
          ? hasNumericFields("w", "h") && typeof noteRecord.d == "string"
          : noteRecord.kind === "image"
            ? hasNumericFields("w", "h") && typeof noteRecord.src == "string"
            : typeof noteRecord.text == "string") &&
      annotations.push({
        ...noteRecord,
        id: basename(documentPath),
      });
  }
  let serializedManifest: Dynamic = JSON.stringify({
    artboards: availableBoardPaths.map(
      (filePath?: Dynamic): Dynamic => boardsByPath.get(filePath).spec,
    ),
    annotations: annotations,
    ...(designMetadata?.launch !== undefined
      ? {
          launch: designMetadata.launch,
        }
      : {}),
    ...(designMetadata?.pages !== undefined
      ? {
          pages: designMetadata.pages,
        }
      : {}),
    ...(designMetadata?.cover !== undefined
      ? {
          cover: designMetadata.cover,
        }
      : {}),
    ...(designMetadata?.migrated === true
      ? {
          migrated: true,
        }
      : {}),
  });
  designMetadata !== undefined &&
    (files[canvasMetadataFile] = serializeCanvasMetadata(
      parseCanvasMetadata(serializedManifest, files),
    ));
  let storedCover: Dynamic = asString(designMetadata?.cover),
    danglingCover: Dynamic =
      storedCover !== undefined &&
      danglingBoards.some((danglingBoard?: Dynamic): Dynamic => danglingBoard.path === storedCover)
        ? storedCover
        : undefined;
  return {
    title: asString(designMetadata?.title) ?? "",
    content: {
      files: files,
    },
    comments: composeComments(documentEntries),
    carry: {
      dangling: danglingBoards,
      ...(danglingCover !== undefined
        ? {
            cover: danglingCover,
          }
        : {}),
    },
    dangling: danglingDocumentPaths,
  };
}
function describeDesignPublishRefusal(
  documentPath?: Dynamic,
  documentValue?: Dynamic,
  collectionBytes?: Dynamic,
): Dynamic {
  let collection: Dynamic = documentPath.slice(0, documentPath.indexOf("/")),
    documentBytes: Dynamic = serializedDocumentBytes(documentValue);
  if (
    collection === BoardsValue &&
    documentBytes > maxSyncedArtboardBytes
  ) {
    let artboardPath: Dynamic =
        asString(documentValue.path) ?? basename(documentPath),
      artboardTitle: Dynamic =
        asString(documentValue.title) ?? artboardPath.replace(/\.dc\.html$/, ""),
      html: Dynamic = asString(documentValue.html) ?? "";
    return html !== "" && isKnownHtmlReference(html)
      ? "Artboard \u201C" +
          artboardTitle +
          "\u201D is " +
          PlatformDesignDocumentAdapterHandler(documentBytes) +
          " KB \u2014 too large even as an uploaded blob (2 MB). Split it or move images to assets."
      : html !== "" && getHtmlReferenceState()
        ? "Artboard \u201C" +
          artboardTitle +
          "\u201D is " +
          PlatformDesignDocumentAdapterHandler(documentBytes) +
          " KB \u2014 over the 240 KB that syncs, and this view cannot upload it; it stays on this screen. Split it or move images to assets."
        : html !== "" && !knownHtmlReferenceState(html)
          ? "Artboard \u201C" +
            artboardTitle +
            "\u201D is " +
            PlatformDesignDocumentAdapterHandler(documentBytes) +
            " KB \u2014 uploading it as a blob; this edit syncs when that lands."
          : html !== ""
            ? "Artboard \u201C" +
              artboardTitle +
              "\u201D is " +
              PlatformDesignDocumentAdapterHandler(documentBytes) +
              " KB and its upload failed \u2014 it stays on this screen; retrying shortly."
            : "Artboard \u201C" +
              artboardTitle +
              "\u201D is too large to sync (" +
              PlatformDesignDocumentAdapterHandler(documentBytes) +
              " KB > 240 KB). Split it or move images to assets.";
  }
  if (
    collection === FilesValue &&
    documentBytes > maxSyncedFileBytes
  )
    return (
      "\u201C" +
      (asString(documentValue.path) ?? basename(documentPath)) +
      "\u201D is too large to sync (" +
      PlatformDesignDocumentAdapterHandler(documentBytes) +
      " KB > 180 KB). Upload images as assets instead."
    );
  if (documentBytes > PlatformDesignDocumentAdapterResolvedValue)
    return (
      "This change is too large to sync (" +
      PlatformDesignDocumentAdapterHandler(documentBytes) +
      " KB)."
    );
  if (recordDepth(documentValue) > PlatformDesignDocumentAdapterLimit)
    return "This change is nested too deeply to sync.";
  if (collectionBytes > maxCollectionBytes)
    return (
      "This canvas\u2019s " +
      (collection === CommentsValue ? "comments" : collection) +
      " are over the 2 MB live-sync budget. Move images to assets or split the canvas."
    );
}
export {
  asString,
  composeDesignDocument,
  decomposeDesignDocument,
  describeDesignPublishRefusal,
  designDocumentStorageAdapter,
  DoctypeHtmlHtmlDataDcBoardLoadingBodyStyleMarginDisplayGridMessage,
  isLoadingArtboardHtml,
  isSafeProjectPathAlias,
  PlatformDesignDocumentAdapterAlias,
  PlatformDesignDocumentAdapterHandler,
  PlatformDesignDocumentAdapterLimit,
  PlatformDesignDocumentAdapterResolvedValue,
  setUnchangedDocumentValue,
  shallowDocumentEqual,
  shouldStoreArtboardByReference,
};
export function installPlatformDesignDocumentAdapter(): () => void {
  return () => {
    PlatformDesignDocumentAdapterResolvedValue = 240 * 1024;
    PlatformDesignDocumentAdapterLimit = 30;
    isLoadingArtboardHtml = (html?: Dynamic): Dynamic =>
      html.includes("data-dc-board-loading");
    DoctypeHtmlHtmlDataDcBoardLoadingBodyStyleMarginDisplayGridMessage =
      '<!doctype html><html data-dc-board-loading><body style="margin:0;display:grid;place-items:center;height:100vh;font:14px system-ui;color:#888">Loading this artboard\u2026</body></html>';
    isSafeProjectPathAlias = isSafeProjectPath;
    PlatformDesignDocumentAdapterAlias = 0;
    PlatformDesignDocumentAdapterHandler = (bytes?: Dynamic): Dynamic =>
      String(Math.round(bytes / 1024));
    designDocumentStorageAdapter = {
      collections: [
        FilesValue,
        BoardsValue,
        NotesValue,
        CommentsValue,
        "design",
      ],
      metaPath: designMetadataPath,
      decompose: decomposeDesignDocument,
      compose: composeDesignDocument,
      refuse: describeDesignPublishRefusal,
    };
  };
}
