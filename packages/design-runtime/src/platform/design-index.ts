/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isDesignSystemFile, parseCanvasMetadata, PlatformFileContentBackgroundBackgroundColorOpacityValues, PlatformFileContentRectOvalLineConfig, PlatformFileContentTest, PlatformFileContentXYWValues, serializeCanvasMetadata } from "./file-content";
import { DESIGN_INDEX_MERGE_POLICY } from "./index-state";

var CURRENT_DESIGN_INDEX_VERSION: Dynamic;
var INDEX_SOURCE_KEY: Dynamic;
var INDEX_DESIGN_SYSTEM_TOKENS_KEY: Dynamic;
var INDEX_LEFT_OUT_KEY: Dynamic;
var MAX_NOTE_INLINE_PATH_CHARS: Dynamic;
var FILES_INDEX_MERGE_POLICY: Dynamic;
var isPlainDesignIndexObject: Dynamic;
var isPrototypeProperty: Dynamic;
var equalDesignIndexJson: Dynamic;
var createEmptyDesignIndex: Dynamic;
var isNonemptyIndexAnnotation: Dynamic;
var INDEX_ANNOTATION_PROPERTIES: Dynamic;
function orderedDesignMapKeys(order?: Dynamic, records?: Dynamic): Dynamic {
  let keys: Dynamic = new Set();
  for (let value of order as Dynamic) value in records && keys.add(value);
  for (let value of Object.keys(records).sort() as Dynamic) keys.add(value);
  return [...keys];
}
function normalizeDesignIndex(rawIndex?: Dynamic): Dynamic {
  let indexRecord: Dynamic = isPlainDesignIndexObject(rawIndex) ? rawIndex : {},
    boards: Dynamic = {};
  if (isPlainDesignIndexObject(indexRecord.boards))
    for (let [artboardPath, boardEntry] of Object.entries(indexRecord.boards) as Dynamic)
      isPlainDesignIndexObject(boardEntry) &&
        !isPrototypeProperty(artboardPath) &&
        (boards[artboardPath] = boardEntry);
  let notes: Dynamic = {};
  if (isPlainDesignIndexObject(indexRecord.notes))
    for (let [annotationId, noteEntry] of Object.entries(indexRecord.notes) as Dynamic)
      isPlainDesignIndexObject(noteEntry) &&
        !isPrototypeProperty(annotationId) &&
        (notes[annotationId] = noteEntry);
  let index: Dynamic = {
    ...indexRecord,
    v:
      typeof indexRecord.v == "number" && indexRecord.v >= CURRENT_DESIGN_INDEX_VERSION
        ? indexRecord.v
        : CURRENT_DESIGN_INDEX_VERSION,
    title: typeof indexRecord.title == "string" ? indexRecord.title : "",
    launch: isPlainDesignIndexObject(indexRecord.launch) ? indexRecord.launch : {},
    pages: Array.isArray(indexRecord.pages)
      ? indexRecord.pages.filter(
          (page?: Dynamic): Dynamic =>
            isPlainDesignIndexObject(page) && typeof page.id == "string",
        )
      : [],
    boards: boards,
    order: Array.isArray(indexRecord.order)
      ? indexRecord.order.filter(
          (artboardPath?: Dynamic): Dynamic => typeof artboardPath == "string",
        )
      : [],
    notes: notes,
    designSystems: Array.isArray(indexRecord.designSystems)
      ? indexRecord.designSystems
      : [],
    attachments: isPlainDesignIndexObject(indexRecord.attachments)
      ? indexRecord.attachments
      : {},
  };
  typeof indexRecord.cover != "string" && delete index.cover;
  indexRecord.migrated !== true && delete index.migrated;
  return index;
}
function serializeIndexArtboard(file?: Dynamic, board?: Dynamic): Dynamic {
  let result: Dynamic = {
    file: file,
  };
  for (let value of PlatformFileContentXYWValues as Dynamic)
    if (!(board[value] === undefined || board[value] === null))
      if (value === "guides")
        try {
          result.guides =
            typeof board.guides == "string"
              ? JSON.parse(board.guides)
              : board.guides;
        } catch {}
      else result[value] = board[value];
  return result;
}
function deserializeIndexAnnotation(id?: Dynamic, note?: Dynamic): Dynamic {
  let { d1: pathRemainder, ...properties }: Dynamic = note;
  return {
    ...properties,
    ...(typeof note.d == "string" && typeof pathRemainder == "string"
      ? {
          d: note.d + pathRemainder,
        }
      : {}),
    id: id,
  };
}
function buildDesignDocumentFromIndex(
  index?: Dynamic,
  files?: Dynamic,
): Dynamic {
  let manifestText: Dynamic = JSON.stringify({
    artboards: orderedDesignMapKeys(index.order, index.boards)
      .filter(
        (filePath?: Dynamic): Dynamic => !isDesignSystemFile(filePath),
      )
      .map(
        (filePath?: Dynamic): Dynamic =>
          serializeIndexArtboard(filePath, index.boards[filePath]),
      ),
    annotations: Object.keys(index.notes)
      .filter(
        (annotationId?: Dynamic): Dynamic =>
          isNonemptyIndexAnnotation(index.notes[annotationId]),
      )
      .map(
        (annotationId?: Dynamic): Dynamic =>
          deserializeIndexAnnotation(annotationId, index.notes[annotationId]),
      ),
    ...(typeof index.launch.view == "string"
      ? {
          launch: index.launch,
        }
      : {}),
    ...(index.pages.length > 0
      ? {
          pages: index.pages,
        }
      : {}),
    ...(index.cover !== undefined
      ? {
          cover: index.cover,
        }
      : {}),
    ...(index.migrated === true
      ? {
          migrated: true,
        }
      : {}),
  });
  return serializeCanvasMetadata(
    parseCanvasMetadata(manifestText, files),
  );
}
function buildSelectedBoardsDocument(
  index?: Dynamic,
  files?: Dynamic,
): Dynamic {
  if (files.length === 0) return [];
  let manifestText: Dynamic = JSON.stringify({
    artboards: files.map(
      (artboardPath?: Dynamic): Dynamic =>
        serializeIndexArtboard(artboardPath, index.boards[artboardPath]),
    ),
    ...(index.pages.length > 0
      ? {
          pages: index.pages,
        }
      : {}),
  });
  return parseCanvasMetadata(
    manifestText,
    Object.fromEntries(files.map((filePath?: Dynamic): Dynamic => [filePath, ""])),
  ).artboards.filter((artboard?: Dynamic): Dynamic => artboard.frameless !== true);
}
function updateIndexProperty(
  object?: Dynamic,
  key?: Dynamic,
  newValue?: Dynamic,
): Dynamic {
  newValue === undefined
    ? key in object && delete object[key]
    : equalDesignIndexJson(object[key], newValue) || (object[key] = newValue);
}
function updateIndexArtboard(target?: Dynamic, source?: Dynamic): Dynamic {
  for (let value of PlatformFileContentXYWValues as Dynamic)
    updateIndexProperty(
      target,
      value,
      typeof source[value] == "object"
        ? JSON.parse(JSON.stringify(source[value]))
        : source[value],
    );
}
function updateIndexAnnotation(target?: Dynamic, source?: Dynamic): Dynamic {
  let note: Dynamic = source;
  for (let property of INDEX_ANNOTATION_PROPERTIES as Dynamic)
    updateIndexProperty(target, property, note[property]);
  let path: Dynamic = typeof note.d == "string" ? note.d : undefined;
  updateIndexProperty(
    target,
    "d",
    path === undefined
      ? undefined
      : path.slice(0, MAX_NOTE_INLINE_PATH_CHARS),
  );
  updateIndexProperty(
    target,
    "d1",
    path !== undefined && path.length > MAX_NOTE_INLINE_PATH_CHARS
      ? path.slice(MAX_NOTE_INLINE_PATH_CHARS)
      : undefined,
  );
  let noteCss: Dynamic = isPlainDesignIndexObject(note.css)
    ? note.css
    : undefined;
  if (noteCss === undefined) updateIndexProperty(target, "css", undefined);
  else {
    let targetCss: Dynamic = isPlainDesignIndexObject(target.css)
      ? target.css
      : (target.css = {});
    for (let cssProperty of PlatformFileContentBackgroundBackgroundColorOpacityValues as Dynamic)
      updateIndexProperty(targetCss, cssProperty, noteCss[cssProperty]);
  }
  let noteCrop: Dynamic = isPlainDesignIndexObject(note.crop)
    ? note.crop
    : undefined;
  if (noteCrop === undefined) updateIndexProperty(target, "crop", undefined);
  else {
    let targetCrop: Dynamic = isPlainDesignIndexObject(target.crop)
      ? target.crop
      : (target.crop = {});
    for (let cropProperty of ["zoom", "x", "y"] as Dynamic)
      updateIndexProperty(targetCrop, cropProperty, noteCrop[cropProperty]);
  }
}
function parseIndexDeletionSets(manifestText?: Dynamic): Dynamic {
  let deleted: Dynamic = {
    boards: new Set(),
    notes: new Set(),
    pages: new Set(),
  };
  if (manifestText === undefined || manifestText === "") return deleted;
  try {
    let deletionManifest: Dynamic = JSON.parse(manifestText);
    if (Array.isArray(deletionManifest?.artboards))
      for (let artboard of deletionManifest.artboards as Dynamic)
        isPlainDesignIndexObject(artboard) &&
          typeof artboard.file == "string" &&
          deleted.boards.add(artboard.file);
    if (Array.isArray(deletionManifest?.annotations))
      for (let annotation of deletionManifest.annotations as Dynamic)
        isPlainDesignIndexObject(annotation) &&
          typeof annotation.id == "string" &&
          deleted.notes.add(annotation.id);
    if (Array.isArray(deletionManifest?.pages))
      for (let page of deletionManifest.pages as Dynamic)
        isPlainDesignIndexObject(page) &&
          typeof page.id == "string" &&
          deleted.pages.add(page.id);
  } catch {}
  return deleted;
}
function updateDesignIndexFromDocument(
  index?: Dynamic,
  manifest?: Dynamic,
  title?: Dynamic,
  keepBoards: Dynamic = new Set(),
  keepNotes: Dynamic = new Set(),
  keepPages: Dynamic = new Set(),
): Dynamic {
  index.v < CURRENT_DESIGN_INDEX_VERSION &&
    (index.v = CURRENT_DESIGN_INDEX_VERSION);
  updateIndexProperty(index, "title", title);
  let launch: Dynamic =
    manifest.launch !== undefined
      ? {
          ...manifest.launch,
        }
      : {};
  for (let property of ["view", "page", "file"] as Dynamic)
    updateIndexProperty(index.launch, property, launch[property]);
  updateIndexProperty(index, "cover", manifest.cover);
  updateIndexProperty(
    index,
    "migrated",
    manifest.migrated === true ? true : undefined,
  );
  Array.isArray(index.pages) || (index.pages = []);
  let nextPages: Dynamic = (manifest.pages ?? []).map(
    (page?: Dynamic): Dynamic => ({
      id: page.id,
      name: page.name,
    }),
  );
  for (let originalPageIndex: Dynamic = 0; originalPageIndex < index.pages.length; originalPageIndex++) {
    let originalPage: Dynamic = index.pages[originalPageIndex];
    if (
      !keepPages.has(originalPage.id) ||
      nextPages.some((page?: Dynamic): Dynamic => page.id === originalPage.id)
    )
      continue;
    let predecessorIndex: Dynamic = -1;
    for (
      let scanIndex: Dynamic = originalPageIndex - 1;
      scanIndex >= 0 && predecessorIndex < 0;
      scanIndex--
    )
      predecessorIndex = nextPages.findIndex(
        (page?: Dynamic): Dynamic => page.id === index.pages[scanIndex].id,
      );
    nextPages.splice(predecessorIndex + 1, 0, {
      id: originalPage.id,
      name: originalPage.name,
    });
  }
  equalDesignIndexJson(index.pages, nextPages) ||
    index.pages.splice(0, index.pages.length, ...nextPages);
  let values: Dynamic = new Set(
    manifest.artboards.map((artboard?: Dynamic): Dynamic => artboard.file),
  );
  for (let artboard of manifest.artboards as Dynamic)
    isPrototypeProperty(artboard.file) ||
      updateIndexArtboard((index.boards[artboard.file] ??= {}), artboard);
  for (let artboardPath of Object.keys(index.boards) as Dynamic)
    !values.has(artboardPath) &&
      !keepBoards.has(artboardPath) &&
      delete index.boards[artboardPath];
  let nextBoardOrder: Dynamic = manifest.artboards.map(
      (artboard?: Dynamic): Dynamic => artboard.file,
    ),
    order: Dynamic = index.order;
  for (let originalBoardIndex: Dynamic = 0; originalBoardIndex < order.length; originalBoardIndex++) {
    let originalBoard: Dynamic = order[originalBoardIndex];
    if (
      !keepBoards.has(originalBoard) ||
      nextBoardOrder.includes(originalBoard) ||
      !(originalBoard in index.boards)
    )
      continue;
    let predecessorIndex: Dynamic = -1;
    for (
      let scanIndex: Dynamic = originalBoardIndex - 1;
      scanIndex >= 0 && predecessorIndex < 0;
      scanIndex--
    )
      predecessorIndex = nextBoardOrder.indexOf(order[scanIndex]);
    nextBoardOrder.splice(predecessorIndex + 1, 0, originalBoard);
  }
  equalDesignIndexJson(order, nextBoardOrder) ||
    order.splice(0, order.length, ...nextBoardOrder);
  let annotations: Dynamic = manifest.annotations ?? [],
    annotationIds: Dynamic = new Set(
      annotations.map((annotation?: Dynamic): Dynamic => annotation.id),
    );
  for (let annotation of annotations as Dynamic)
    isPrototypeProperty(annotation.id) ||
      updateIndexAnnotation((index.notes[annotation.id] ??= {}), annotation);
  for (let annotationId of Object.keys(index.notes) as Dynamic)
    !annotationIds.has(annotationId) &&
      !keepNotes.has(annotationId) &&
      delete index.notes[annotationId];
}
function mergeDesignPages(
  base?: Dynamic,
  local?: Dynamic,
  remote?: Dynamic,
): Dynamic {
  let clonePages: Dynamic = (pages?: Dynamic): Dynamic =>
    pages.map(
      (page?: Dynamic): Dynamic => ({
        ...page,
      }),
    );
  if (equalDesignIndexJson(local, base))
    return {
      pages: clonePages(remote),
      overlap: false,
    };
  if (
    equalDesignIndexJson(remote, base) ||
    equalDesignIndexJson(local, remote)
  )
    return {
      pages: clonePages(local),
      overlap: false,
    };
  let basePagesById: Dynamic = new Map(
      base.map((page?: Dynamic): Dynamic => [page.id, page]),
    ),
    localPagesById: Dynamic = new Map(
      local.map((page?: Dynamic): Dynamic => [page.id, page]),
    ),
    remotePagesById: Dynamic = new Map(
      remote.map((page?: Dynamic): Dynamic => [page.id, page]),
    ),
    commonPageOrder: Dynamic = (pages?: Dynamic): Dynamic =>
      pages
        .filter(
          (page?: Dynamic): Dynamic =>
            basePagesById.has(page.id) &&
            localPagesById.has(page.id) &&
            remotePagesById.has(page.id),
        )
        .map((page?: Dynamic): Dynamic => page.id),
    didLocalReorder: Dynamic = !equalDesignIndexJson(commonPageOrder(local), commonPageOrder(base)),
    didRemoteReorder: Dynamic = !equalDesignIndexJson(commonPageOrder(remote), commonPageOrder(base)),
    hasOverlap: Dynamic =
      didLocalReorder &&
      didRemoteReorder &&
      !equalDesignIndexJson(commonPageOrder(local), commonPageOrder(remote)),
    [preferredPages, secondaryPages, secondaryPagesById]: Dynamic =
      didLocalReorder && !didRemoteReorder
        ? [local, remote, remotePagesById]
        : [remote, local, localPagesById],
    mergePageName: Dynamic = (pageId?: Dynamic): Dynamic => {
      let basePage: Dynamic = basePagesById.get(pageId),
        localPage: Dynamic = localPagesById.get(pageId),
        remotePage: Dynamic = remotePagesById.get(pageId);
      return localPage === undefined || remotePage === undefined
        ? (localPage ?? remotePage).name
        : basePage === undefined ||
            localPage.name === remotePage.name ||
            localPage.name === basePage.name
          ? remotePage.name
          : remotePage.name === basePage.name
            ? localPage.name
            : ((hasOverlap = true), remotePage.name);
    },
    mergedPages: Dynamic = preferredPages
      .filter(
        (page?: Dynamic): Dynamic =>
          !(basePagesById.has(page.id) && !secondaryPagesById.has(page.id)),
      )
      .map(
        (page?: Dynamic): Dynamic => ({
          ...page,
          name: mergePageName(page.id),
        }),
      );
  secondaryPages.forEach((page?: Dynamic, secondaryIndex?: Dynamic): Dynamic => {
    if (
      basePagesById.has(page.id) ||
      mergedPages.some((mergedPage?: Dynamic): Dynamic => mergedPage.id === page.id)
    )
      return;
    let insertAt: Dynamic =
      (preferredPages === local ? didLocalReorder : didRemoteReorder) &&
      !secondaryPages
        .slice(secondaryIndex + 1)
        .some((laterPage?: Dynamic): Dynamic => basePagesById.has(laterPage.id))
        ? mergedPages.length
        : 0;
    for (
      let previousIndex: Dynamic = secondaryIndex - 1;
      previousIndex >= 0 && insertAt < mergedPages.length;
      previousIndex--
    ) {
      let predecessorIndex: Dynamic = mergedPages.findIndex(
        (mergedPage?: Dynamic): Dynamic => mergedPage.id === secondaryPages[previousIndex].id,
      );
      if (predecessorIndex >= 0) {
        insertAt = predecessorIndex + 1;
        break;
      }
    }
    mergedPages.splice(insertAt, 0, {
      ...page,
    });
  });
  return {
    pages: mergedPages,
    overlap: hasOverlap,
  };
}
function createDesignIndexFromFiles(
  title?: Dynamic,
  manifestText?: Dynamic,
  files?: Dynamic,
): Dynamic {
  let index: Dynamic = createEmptyDesignIndex(title);
  updateDesignIndexFromDocument(
    index,
    parseCanvasMetadata(manifestText, files),
    title,
  );
  return index;
}
export {
  buildDesignDocumentFromIndex,
  buildSelectedBoardsDocument,
  createDesignIndexFromFiles,
  createEmptyDesignIndex,
  CURRENT_DESIGN_INDEX_VERSION,
  deserializeIndexAnnotation,
  equalDesignIndexJson,
  FILES_INDEX_MERGE_POLICY,
  INDEX_ANNOTATION_PROPERTIES,
  INDEX_DESIGN_SYSTEM_TOKENS_KEY,
  INDEX_LEFT_OUT_KEY,
  INDEX_SOURCE_KEY,
  isNonemptyIndexAnnotation,
  isPlainDesignIndexObject,
  isPrototypeProperty,
  MAX_NOTE_INLINE_PATH_CHARS,
  mergeDesignPages,
  normalizeDesignIndex,
  orderedDesignMapKeys,
  parseIndexDeletionSets,
  serializeIndexArtboard,
  updateDesignIndexFromDocument,
  updateIndexAnnotation,
  updateIndexArtboard,
  updateIndexProperty,
};
export function installPlatformDesignIndex(): () => void {
  return () => {
    CURRENT_DESIGN_INDEX_VERSION = 3;
    INDEX_SOURCE_KEY = "source";
    INDEX_DESIGN_SYSTEM_TOKENS_KEY = "designSystemTokens";
    INDEX_LEFT_OUT_KEY = "leftOut";
    MAX_NOTE_INLINE_PATH_CHARS = 16e3;
    FILES_INDEX_MERGE_POLICY = DESIGN_INDEX_MERGE_POLICY;
    isPlainDesignIndexObject = (candidate?: Dynamic): Dynamic =>
      typeof candidate == "object" && candidate !== null && !Array.isArray(candidate);
    isPrototypeProperty = (property?: Dynamic): Dynamic =>
      property in Object.prototype;
    equalDesignIndexJson = (left?: Dynamic, right?: Dynamic): Dynamic =>
      left === right || JSON.stringify(left) === JSON.stringify(right);
    createEmptyDesignIndex = (title: Dynamic = ""): Dynamic =>
      normalizeDesignIndex({
        title: title,
      });
    isNonemptyIndexAnnotation = (source?: Dynamic): Dynamic =>
      source.kind === undefined ||
      source.kind === null ||
      (typeof source.text == "string" && source.text !== "") ||
      (typeof source.kind == "string" &&
        (Object.hasOwn(
          PlatformFileContentRectOvalLineConfig,
          source.kind,
        ) ||
          PlatformFileContentTest(source.kind) ||
          source.kind === "note" ||
          source.kind === "text"));
    INDEX_ANNOTATION_PROPERTIES = [
      "x",
      "y",
      "w",
      "h",
      "x2",
      "y2",
      "headStart",
      "headEnd",
      "rotate",
      "flipX",
      "flipY",
      "color",
      "page",
      "size",
      "kind",
      "bold",
      "italic",
      "fill",
      "text",
      "src",
      "video",
      "alt",
      "maxW",
      "maxH",
    ];
  };
}
