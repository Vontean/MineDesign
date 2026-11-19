import type { DataRecord } from "../contracts/storage";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { DesignSystemsKey } from "../design-system/type-declarations";
import { createDesignIndexFromFiles, INDEX_DESIGN_SYSTEM_TOKENS_KEY, INDEX_LEFT_OUT_KEY, INDEX_SOURCE_KEY, isPrototypeProperty, MAX_NOTE_INLINE_PATH_CHARS, normalizeDesignIndex, orderedDesignMapKeys } from "./design-index";
import { BoardsValue, canvasMetadataFile, DesignValue, encodeStorePathSegment, FilesValue, isArtboardFile, isProjectTextFilePath, isSafeProjectPath, isSupportedProjectAsset, isTypeDeclarationPath, NotesValue, parseCanvasMetadata, parseDesignSource, PlatformFileContentResolvedValue_4 as designMetadataPath, PlatformFileContentResolvedValue_5 as designSourceDocumentPath, PlatformFileContentXYWValues, serializeCanvasMetadata } from "./file-content";
import { canSaveDesignFile, encodeDesignPortFile } from "./files-design-document";
import { isBlobAssetUrl } from "./image-upload";
import { cloneIndexValue, equalIndexValue } from "./index-merge";
import { stringifyCanonicalIndex } from "./index-state";
import { isReservedProjectPath, projectMetadataPaths, projectPathPrefix, toProjectContentPath } from "./project-paths";
import { PlatformSha256Encode, sha256Fallback } from "./sha256";
import { hashCanonicalIndex, parsePublishedIndexMetadata, readPortVersion } from "./snapshot-database";

var DESIGN_SYSTEM_DOCUMENT_PATH: Dynamic;
var DESIGN_CONVERSION_LOCK_PATH: Dynamic;
var optionalString: Dynamic;
var documentPathBasename: Dynamic;
var isDirectCollectionDocument: Dynamic;
var isReservedConversionFile: Dynamic;
var serializeConvertedArtboard: Dynamic;
var readDatabaseBoardOrder: Dynamic;
async function readDatabaseArtboardHtml(
  record?: Dynamic,
  store?: Dynamic,
): Promise<Dynamic> {
  let htmlRef: Dynamic = optionalString(record.htmlRef);
  if (htmlRef === undefined) return optionalString(record.html);
  if (!isBlobAssetUrl(htmlRef)) return;
  let value: Dynamic = JSON.parse(await store.readBlob(htmlRef));
  if (typeof value?.html != "string")
    throw new Error("the upload an artboard points at is not an artboard");
  return value.html;
}
function databaseArtboardFilePath(record?: Dynamic): Dynamic {
  let filePath: Dynamic = record.data.path;
  return isSafeProjectPath(filePath) &&
    isArtboardFile(filePath) &&
    documentPathBasename(record.path) ===
      encodeStorePathSegment(filePath)
    ? filePath
    : undefined;
}
async function readDatabaseFileEntry(
  record?: Dynamic,
  store?: Dynamic,
): Promise<Dynamic> {
  let data: Dynamic = record.data,
    path: Dynamic = data.path,
    inlineData: Dynamic = optionalString(data.data),
    dataRef: Dynamic = optionalString(data.dataRef);
  if (
    inlineData === undefined &&
    data.kind === "text" &&
    dataRef !== undefined &&
    isBlobAssetUrl(dataRef) &&
    ((isProjectTextFilePath(path) &&
      /\.(css|m?js)$/i.test(path)) ||
      isTypeDeclarationPath(path)) &&
    documentPathBasename(record.path) ===
      encodeStorePathSegment(path)
  )
    return {
      path: path,
      data: await store.readBlob(dataRef),
    };
  if (
    !(
      !isSafeProjectPath(path) ||
      isArtboardFile(path) ||
      path === canvasMetadataFile ||
      isReservedConversionFile(path) ||
      !isSupportedProjectAsset(path) ||
      documentPathBasename(record.path) !==
        encodeStorePathSegment(path) ||
      inlineData === undefined
    )
  )
    return {
      path: path,
      data: inlineData,
    };
}
function readDatabaseAnnotation(record?: Dynamic): Dynamic {
  let data: Dynamic = record.data;
  if (
    typeof data.x != "number" ||
    typeof data.y != "number" ||
    isPrototypeProperty(documentPathBasename(record.path))
  )
    return;
  let hasNumericFields: Dynamic = (firstField?: Dynamic, secondField?: Dynamic): Dynamic =>
    typeof data[firstField] == "number" && typeof data[secondField] == "number";
  return (
    data.kind === "rect" || data.kind === "oval"
      ? hasNumericFields("w", "h")
      : data.kind === "line" || data.kind === "arrow"
        ? hasNumericFields("x2", "y2")
        : data.kind === "pen"
          ? hasNumericFields("w", "h") && typeof data.d == "string"
          : data.kind === "image"
            ? hasNumericFields("w", "h") && typeof data.src == "string"
            : typeof data.text == "string"
  )
    ? {
        ...data,
        id: documentPathBasename(record.path),
      }
    : undefined;
}
function buildConvertedDesignIndex(
  metadata?: Dynamic,
  boards?: Dynamic,
  order?: Dynamic,
  annotations?: Dynamic,
  title?: Dynamic,
): Dynamic {
  let manifestText: Dynamic = JSON.stringify({
    artboards: order.map(
      (artboardPath?: Dynamic): Dynamic =>
        serializeConvertedArtboard(artboardPath, boards.get(artboardPath)),
    ),
    annotations: annotations,
    ...(metadata?.launch !== undefined
      ? {
          launch: metadata.launch,
        }
      : {}),
    ...(metadata?.pages !== undefined
      ? {
          pages: metadata.pages,
        }
      : {}),
    ...(metadata?.cover !== undefined
      ? {
          cover: metadata.cover,
        }
      : {}),
    ...(metadata?.migrated === true
      ? {
          migrated: true,
        }
      : {}),
  });
  return serializeCanvasMetadata(
    parseCanvasMetadata(manifestText, title),
  );
}
function copyDesignSourceMetadata(
  index?: Dynamic,
  records?: Dynamic,
): Dynamic {
  let sourceMetadata: Dynamic = parseDesignSource(
    records.get(designSourceDocumentPath)?.data,
  );
  sourceMetadata !== undefined &&
    (index[INDEX_SOURCE_KEY] = cloneIndexValue(
      sourceMetadata,
    ));
  let designSystemTokens: Dynamic = records.get(DESIGN_SYSTEM_DOCUMENT_PATH)?.data;
  designSystemTokens !== undefined &&
    (index[INDEX_DESIGN_SYSTEM_TOKENS_KEY] = cloneIndexValue(designSystemTokens));
}
function annotationMatchesDatabase(
  annotation?: Dynamic,
  record?: Dynamic,
): Dynamic {
  let decoded: Dynamic = readDatabaseAnnotation(record);
  return annotation === undefined || decoded === undefined
    ? false
    : Object.entries(encodeDatabaseAnnotation(decoded)).every(
        ([property, propertyValue]: Dynamic): Dynamic =>
          Object.hasOwn(annotation, property) &&
          equalIndexValue(annotation[property], propertyValue),
      );
}
function sourceMetadataMatchesDatabase(
  index?: Dynamic,
  record?: Dynamic,
): Dynamic {
  let metadata: Dynamic =
    index[
      record.path === designSourceDocumentPath
        ? INDEX_SOURCE_KEY
        : INDEX_DESIGN_SYSTEM_TOKENS_KEY
    ];
  return (
    metadata !== undefined &&
    equalIndexValue(metadata, record.data)
  );
}
function createDesignDatabaseCodec(codecOptions?: Dynamic): Dynamic {
  async function composeDatabaseSnapshot(databaseEntries?: Dynamic): Promise<Dynamic> {
    let designMetadata: Dynamic = databaseEntries.get(
        designMetadataPath,
      )?.data,
      boardDataByPath: Dynamic = new Map(),
      contentByPath: Dynamic = {},
      sourcesByPath: Dynamic = new Map(),
      annotations: Dynamic = [],
      annotationEntryPaths: Dynamic = [];
    for (let entry of databaseEntries.values() as Dynamic)
      if (isDirectCollectionDocument(entry.path, BoardsValue)) {
        let artboardPath: Dynamic = databaseArtboardFilePath(entry);
        artboardPath !== undefined && boardDataByPath.set(artboardPath, entry.data);
      } else if (
        isDirectCollectionDocument(entry.path, NotesValue)
      ) {
        let annotation: Dynamic = readDatabaseAnnotation(entry);
        annotation !== undefined &&
          (annotations.push(annotation), annotationEntryPaths.push(entry.path));
      }
    let databaseBoardOrder: Dynamic = readDatabaseBoardOrder(
      designMetadata,
      (artboardPath?: Dynamic): Dynamic => boardDataByPath.has(artboardPath),
    );
    for (let artboardPath of databaseBoardOrder as Dynamic) {
      let artboardHtml: Dynamic = await readDatabaseArtboardHtml(
        boardDataByPath.get(artboardPath),
        codecOptions,
      );
      artboardHtml !== undefined &&
        ((contentByPath[artboardPath] = artboardHtml),
        sourcesByPath.set(toProjectContentPath(artboardPath), [
          BoardsValue +
            "/" +
            encodeStorePathSegment(artboardPath),
        ]));
    }
    let availableBoardOrder: Dynamic = databaseBoardOrder.filter(
      (artboardPath?: Dynamic): Dynamic => contentByPath[artboardPath] !== undefined,
    );
    for (let entry of databaseEntries.values() as Dynamic) {
      if (!isDirectCollectionDocument(entry.path, FilesValue))
        continue;
      let file: Dynamic = await readDatabaseFileEntry(entry, codecOptions);
      file === undefined ||
        contentByPath[file.path] !== undefined ||
        ((contentByPath[file.path] = file.data),
        sourcesByPath.set(toProjectContentPath(file.path), [
          entry.path,
        ]));
    }
    let title: Dynamic = optionalString(designMetadata?.title) ?? "",
      convertedIndex: Dynamic = createDesignIndexFromFiles(
        title,
        buildConvertedDesignIndex(designMetadata, boardDataByPath, availableBoardOrder, annotations, contentByPath),
        contentByPath,
      );
    copyDesignSourceMetadata(convertedIndex, databaseEntries);
    sourcesByPath.set(projectMetadataPaths.design, [
      designMetadataPath,
      ...availableBoardOrder.map(
        (artboardPath?: Dynamic): Dynamic =>
          BoardsValue +
          "/" +
          encodeStorePathSegment(artboardPath),
      ),
      ...annotationEntryPaths,
      ...(databaseEntries.has(designSourceDocumentPath)
        ? [designSourceDocumentPath]
        : []),
      ...(databaseEntries.has(DESIGN_SYSTEM_DOCUMENT_PATH)
        ? [DESIGN_SYSTEM_DOCUMENT_PATH]
        : []),
    ]);
    let filesByPath: Dynamic = new Map(),
      omittedFiles: Dynamic = [
        ...Object.keys(contentByPath).filter(
          (filePath?: Dynamic): Dynamic =>
            !canSaveDesignFile(filePath),
        ),
        ...[...databaseEntries.values()]
          .filter(
            (entry?: Dynamic): Dynamic =>
              isDirectCollectionDocument(entry.path, FilesValue) &&
              isReservedConversionFile(entry.data.path),
          )
          .map((entry?: Dynamic): Dynamic => entry.data.path),
      ].sort();
    omittedFiles.length > 0 && (convertedIndex[INDEX_LEFT_OUT_KEY] = omittedFiles);
    for (let [relativePath, fileContent] of Object.entries(contentByPath) as Dynamic)
      canSaveDesignFile(relativePath) &&
        filesByPath.set(
          toProjectContentPath(relativePath),
          encodeDesignPortFile(relativePath, fileContent),
        );
    let indexSources: Dynamic = [
      ...annotationEntryPaths.filter(
        (annotationEntryPath?: Dynamic): Dynamic =>
          Object.hasOwn(convertedIndex.notes, documentPathBasename(annotationEntryPath)) &&
          annotationMatchesDatabase(
            convertedIndex.notes[documentPathBasename(annotationEntryPath)],
            databaseEntries.get(annotationEntryPath),
          ),
      ),
      ...[
        designSourceDocumentPath,
        DESIGN_SYSTEM_DOCUMENT_PATH,
      ].filter(
        (metadataPath?: Dynamic): Dynamic =>
          databaseEntries.has(metadataPath) &&
          sourceMetadataMatchesDatabase(convertedIndex, databaseEntries.get(metadataPath)),
      ),
    ];
    return {
      files: filesByPath,
      index: convertedIndex,
      sources: sourcesByPath,
      indexSources: indexSources,
    };
  }
  async function foldDatabaseChanges(foldOptions?: Dynamic): Promise<Dynamic> {
    let index: Dynamic = normalizeDesignIndex(
        cloneIndexValue(foldOptions.index),
      ),
      changedFiles: Dynamic = new Map(),
      sourcesByPath: Dynamic = new Map(),
      indexSources: Dynamic = [],
      designMetadata: Dynamic = foldOptions.snapshot.get(
        designMetadataPath,
      )?.data;
    if (designMetadata === undefined)
      return {
        files: changedFiles,
        index: index,
        sources: sourcesByPath,
      };
    let boardEntriesByPath: Dynamic = new Map();
    for (let entry of foldOptions.snapshot.values() as Dynamic)
      if (isDirectCollectionDocument(entry.path, BoardsValue)) {
        let artboardPath: Dynamic = databaseArtboardFilePath(entry);
        artboardPath !== undefined && boardEntriesByPath.set(artboardPath, entry);
      }
    let unfoldedPaths: Dynamic = [],
      readPublishedText: Dynamic = async (filePath?: Dynamic): Promise<Dynamic> => {
        let fileState: Dynamic = await foldOptions.readFileState(filePath);
        return fileState.state === "text"
          ? fileState.text
          : fileState.state === "absent"
            ? null
            : "unreadable";
      },
      publishedVersion: Dynamic = await readPublishedText(readPortVersion);
    if (publishedVersion === "unreadable")
      return {
        files: changedFiles,
        index: index,
        sources: sourcesByPath,
        unfolded: [
          ...foldOptions.changed.map((entry?: Dynamic): Dynamic => entry.path),
          ...foldOptions.removed,
        ],
      };
    let publishedIndexMetadata: Dynamic =
        publishedVersion === null
          ? null
          : parsePublishedIndexMetadata(publishedVersion),
      matchesPublishedHash: Dynamic = (filePath?: Dynamic, fileText?: Dynamic): Dynamic =>
        fileText === null ||
        publishedIndexMetadata?.files[filePath]?.sha256 ===
          sha256Fallback(
            PlatformSha256Encode(fileText),
          ),
      wasPublished: Dynamic = (relativePath?: Dynamic): Dynamic =>
        publishedIndexMetadata?.files[toProjectContentPath(relativePath)] !==
        undefined,
      isEmptyIndexField: Dynamic = (field?: Dynamic, fieldValue?: Dynamic): Dynamic =>
        fieldValue == null ||
        fieldValue === "" ||
        (Array.isArray(fieldValue) && fieldValue.length === 0) ||
        (typeof fieldValue == "object" && Object.keys(fieldValue).length === 0) ||
        (field === "title" && fieldValue === codecOptions.defaultTitle),
      mayReplaceIndexField: Dynamic = async (
        databaseEntry?: Dynamic,
        field?: Dynamic,
        currentIndexValue?: Dynamic,
      ): Promise<Dynamic> => {
        let recordedFields: Dynamic = foldOptions.recorded.get(databaseEntry.path);
        if (recordedFields === undefined) return true;
        let recordedHash: Dynamic = recordedFields[field];
        return (await hashCanonicalIndex(
          databaseEntry.data[field],
        )) === recordedHash
          ? false
          : recordedHash === undefined
            ? isEmptyIndexField(field, currentIndexValue)
            : (await hashCanonicalIndex(currentIndexValue)) === recordedHash;
      },
      foldArtboard: Dynamic = async (artboardPath?: Dynamic): Promise<Dynamic> => {
        let boardEntry: Dynamic = boardEntriesByPath.get(artboardPath);
        if (boardEntry === undefined) return;
        let isNewBoard: Dynamic = !(artboardPath in index.boards);
        if (
          (isNewBoard && wasPublished(artboardPath)) ||
          (!isNewBoard &&
            !wasPublished(artboardPath) &&
            foldOptions.recorded.get(boardEntry.path) === undefined)
        )
          return;
        let publishedHtml: Dynamic = isNewBoard
          ? null
          : await readPublishedText(toProjectContentPath(artboardPath));
        if (publishedHtml === "unreadable") return void unfoldedPaths.push(boardEntry.path);
        let recordedFields: Dynamic = foldOptions.recorded.get(boardEntry.path),
          didHtmlChange: Dynamic =
            recordedFields === undefined ||
            (await hashCanonicalIndex(boardEntry.data.html)) !==
              recordedFields.html ||
            (await hashCanonicalIndex(boardEntry.data.htmlRef)) !==
              recordedFields.htmlRef;
        if (
          isNewBoard ||
          (didHtmlChange &&
            matchesPublishedHash(toProjectContentPath(artboardPath), publishedHtml))
        ) {
          let databaseHtml: Dynamic = await readDatabaseArtboardHtml(
            boardEntry.data,
            codecOptions,
          );
          databaseHtml !== undefined &&
            databaseHtml !== publishedHtml &&
            (changedFiles.set(
              toProjectContentPath(artboardPath),
              encodeDesignPortFile(artboardPath, databaseHtml),
            ),
            sourcesByPath.set(toProjectContentPath(artboardPath), [
              boardEntry.path,
            ]));
        }
        let indexBoard: Dynamic = (index.boards[artboardPath] ??= {});
        for (let field of PlatformFileContentXYWValues as Dynamic) {
          if (!isNewBoard && !(await mayReplaceIndexField(boardEntry, field, indexBoard[field])))
            continue;
          let fieldValue: Dynamic = boardEntry.data[field];
          fieldValue == null
            ? delete indexBoard[field]
            : (indexBoard[field] = cloneIndexValue(fieldValue));
        }
        index.order.includes(artboardPath) || index.order.push(artboardPath);
      },
      databaseBoardPaths: Dynamic = new Set(
        readDatabaseBoardOrder(
          designMetadata,
          (artboardPath?: Dynamic): Dynamic => boardEntriesByPath.has(artboardPath),
        ),
      );
    for (let changedEntry of foldOptions.changed as Dynamic)
      if (changedEntry.path === designMetadataPath) {
        typeof changedEntry.data.title == "string" &&
          (await mayReplaceIndexField(changedEntry, "title", index.title)) &&
          (index.title = changedEntry.data.title);
        Array.isArray(changedEntry.data.pages) &&
          (await mayReplaceIndexField(changedEntry, "pages", index.pages)) &&
          (index.pages = cloneIndexValue(changedEntry.data.pages));
        typeof changedEntry.data.launch == "object" &&
          changedEntry.data.launch !== null &&
          (await mayReplaceIndexField(changedEntry, "launch", index.launch)) &&
          (index.launch = cloneIndexValue(changedEntry.data.launch));
        (await mayReplaceIndexField(changedEntry, "cover", index.cover)) &&
          (typeof changedEntry.data.cover == "string"
            ? (index.cover = changedEntry.data.cover)
            : delete index.cover);
        for (let artboardPath of databaseBoardPaths as Dynamic)
          artboardPath in index.boards || (await foldArtboard(artboardPath));
        let availableBoardOrder: Dynamic = [...databaseBoardPaths].filter(
            (artboardPath?: Dynamic): Dynamic => artboardPath in index.boards,
          ),
          newBoardPaths: Dynamic = availableBoardOrder.filter(
            (artboardPath?: Dynamic): Dynamic =>
              !foldOptions.index.order.includes(artboardPath) && !wasPublished(artboardPath),
          ),
          nextBoardOrder: Dynamic = index.order.filter(
            (artboardPath?: Dynamic): Dynamic => !newBoardPaths.includes(artboardPath),
          );
        for (let newBoardPath of newBoardPaths as Dynamic) {
          let predecessorPath: Dynamic = availableBoardOrder
            .slice(0, availableBoardOrder.indexOf(newBoardPath))
            .reverse()
            .find((artboardPath?: Dynamic): Dynamic => nextBoardOrder.includes(artboardPath));
          nextBoardOrder.splice(
            predecessorPath === undefined ? 0 : nextBoardOrder.indexOf(predecessorPath) + 1,
            0,
            newBoardPath,
          );
        }
        index.order = orderedDesignMapKeys(
          nextBoardOrder,
          index.boards,
        );
      } else if (
        isDirectCollectionDocument(changedEntry.path, BoardsValue)
      ) {
        let artboardPath: Dynamic = databaseArtboardFilePath(changedEntry);
        artboardPath !== undefined &&
          (databaseBoardPaths.has(artboardPath) || artboardPath in index.boards) &&
          (await foldArtboard(artboardPath));
      } else if (
        isDirectCollectionDocument(changedEntry.path, FilesValue)
      ) {
        let file: Dynamic = await readDatabaseFileEntry(changedEntry, codecOptions);
        if (file === undefined) continue;
        let publishedText: Dynamic = await readPublishedText(
          toProjectContentPath(file.path),
        );
        if (publishedText === "unreadable") {
          unfoldedPaths.push(changedEntry.path);
          continue;
        }
        canSaveDesignFile(file.path) &&
          matchesPublishedHash(toProjectContentPath(file.path), publishedText) &&
          file.data !== publishedText &&
          (changedFiles.set(
            toProjectContentPath(file.path),
            encodeDesignPortFile(file.path, file.data),
          ),
          sourcesByPath.set(toProjectContentPath(file.path), [
            changedEntry.path,
          ]));
      } else if (
        isDirectCollectionDocument(changedEntry.path, NotesValue)
      ) {
        let annotation: Dynamic = readDatabaseAnnotation(changedEntry);
        if (annotation === undefined) continue;
        let annotationId: Dynamic = documentPathBasename(changedEntry.path),
          nextNote: Dynamic = encodeDatabaseAnnotation(annotation),
          existingNote: Dynamic = index.notes[annotationId];
        if (
          existingNote === undefined ||
          foldOptions.recorded.get(changedEntry.path) === undefined
        ) {
          index.notes[annotationId] = nextNote;
          Object.hasOwn(index.notes, annotationId) && indexSources.push(changedEntry.path);
          continue;
        }
        for (let field of new Set([
          ...Object.keys(nextNote),
          ...Object.keys(existingNote),
        ]) as Dynamic)
          field !== "d1" &&
            (await mayReplaceIndexField(
              changedEntry,
              field,
              field === "d" && typeof existingNote.d == "string"
                ? String(existingNote.d) + String(existingNote.d1 ?? "")
                : existingNote[field],
            )) &&
            (nextNote[field] === undefined
              ? (delete existingNote[field],
                field === "d" && delete existingNote.d1)
              : ((existingNote[field] = nextNote[field]),
                field === "d" &&
                  (nextNote.d1 === undefined
                    ? delete existingNote.d1
                    : (existingNote.d1 = nextNote.d1))));
        Object.hasOwn(index.notes, annotationId) &&
          annotationMatchesDatabase(index.notes[annotationId], changedEntry) &&
          indexSources.push(changedEntry.path);
      } else
        (changedEntry.path === designSourceDocumentPath ||
          changedEntry.path === DESIGN_SYSTEM_DOCUMENT_PATH) &&
          (copyDesignSourceMetadata(index, foldOptions.snapshot),
          sourceMetadataMatchesDatabase(index, changedEntry) &&
            indexSources.push(changedEntry.path));
    for (let removedEntryPath of foldOptions.removed as Dynamic)
      if (isDirectCollectionDocument(removedEntryPath, NotesValue))
        delete index.notes[documentPathBasename(removedEntryPath)];
      else if (isDirectCollectionDocument(removedEntryPath, BoardsValue)) {
        let artboardPath: Dynamic = Object.keys(index.boards).find(
          (candidatePath?: Dynamic): Dynamic =>
            encodeStorePathSegment(candidatePath) ===
            documentPathBasename(removedEntryPath),
        );
        if (artboardPath === undefined) continue;
        let publishedHtml: Dynamic = await readPublishedText(
          toProjectContentPath(artboardPath),
        );
        if (publishedHtml === "unreadable") {
          unfoldedPaths.push(removedEntryPath);
          continue;
        }
        if (!matchesPublishedHash(toProjectContentPath(artboardPath), publishedHtml))
          continue;
        delete index.boards[artboardPath];
        index.order = index.order.filter(
          (boardPath?: Dynamic): Dynamic => boardPath !== artboardPath,
        );
        changedFiles.set(toProjectContentPath(artboardPath), null);
      }
    return {
      files: changedFiles,
      index: index,
      sources: sourcesByPath,
      ...(indexSources.length > 0
        ? {
            indexSources: indexSources,
          }
        : {}),
      ...(unfoldedPaths.length > 0
        ? {
            unfolded: unfoldedPaths,
          }
        : {}),
    };
  }
  return {
    toTree: composeDatabaseSnapshot,
    serializeIndex: (index?: Dynamic): Dynamic =>
      stringifyCanonicalIndex(index),
    fold: foldDatabaseChanges,
  };
}
function encodeDatabaseAnnotation(annotation?: Dynamic): Dynamic {
  let { id: id, d: path, ...properties }: Dynamic = annotation;
  return typeof path != "string"
    ? cloneIndexValue(properties)
    : {
        ...(cloneIndexValue(properties) as DataRecord),
        d: path.slice(0, MAX_NOTE_INLINE_PATH_CHARS),
        ...(path.length > MAX_NOTE_INLINE_PATH_CHARS
          ? {
              d1: path.slice(MAX_NOTE_INLINE_PATH_CHARS),
            }
          : {}),
      };
}
export {
  annotationMatchesDatabase,
  buildConvertedDesignIndex,
  copyDesignSourceMetadata,
  createDesignDatabaseCodec,
  databaseArtboardFilePath,
  DESIGN_CONVERSION_LOCK_PATH,
  DESIGN_SYSTEM_DOCUMENT_PATH,
  documentPathBasename,
  encodeDatabaseAnnotation,
  isDirectCollectionDocument,
  isReservedConversionFile,
  optionalString,
  readDatabaseAnnotation,
  readDatabaseArtboardHtml,
  readDatabaseBoardOrder,
  readDatabaseFileEntry,
  serializeConvertedArtboard,
  sourceMetadataMatchesDatabase,
};
export function installPlatformDatabaseCodec(): () => void {
  return () => {
    DESIGN_SYSTEM_DOCUMENT_PATH =
      DesignValue + "/" + DesignSystemsKey;
    DESIGN_CONVERSION_LOCK_PATH = DesignValue + "/convert-lock";
    optionalString = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "string" ? candidate : undefined;
    documentPathBasename = (documentPath?: Dynamic): Dynamic =>
      documentPath.slice(documentPath.indexOf("/") + 1);
    isDirectCollectionDocument = (documentPath?: Dynamic, collectionPath?: Dynamic): Dynamic =>
      documentPath.startsWith(collectionPath + "/") && documentPath.indexOf("/", collectionPath.length + 1) < 0;
    isReservedConversionFile = (filePath?: Dynamic): Dynamic =>
      typeof filePath == "string" &&
      filePath !== canvasMetadataFile &&
      isReservedProjectPath(
        "design",
        projectPathPrefix + filePath,
      );
    serializeConvertedArtboard = (
      filePath?: Dynamic,
      boardData?: Dynamic,
    ): Dynamic => {
      let state: Dynamic = {
        file: filePath,
      };
      for (let value of PlatformFileContentXYWValues as Dynamic)
        boardData[value] !== undefined &&
          boardData[value] !== null &&
          (state[value] = boardData[value]);
      return state;
    };
    readDatabaseBoardOrder = (metadata?: Dynamic, hasBoard?: Dynamic): Dynamic => {
      let items: Dynamic = [];
      if (Array.isArray(metadata?.boardOrder))
        for (let value of metadata.boardOrder as Dynamic)
          typeof value == "string" &&
            hasBoard(value) &&
            !items.includes(value) &&
            items.push(value);
      return items;
    };
  };
}
