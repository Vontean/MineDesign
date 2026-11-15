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
import { annotationDocument, artboardDocument, BoardsValue, canvasMetadataFile, canvasMetaDocument, DesignValue, encodeStorePathSegment, FilesValue, isArtboardFile, isProjectTextFilePath, isSafeProjectPath, isSupportedProjectAsset, isTypeDeclarationPath, NotesValue, parseCanvasMetadata, PlatformFileContentResolvedValue_4, PlatformFileContentResolvedValue_5, PlatformFileContentResolvedValue_6, PlatformFileContentResolvedValue_7, PlatformFileContentResolvedValue_8, PlatformFileContentResolvedValue_9, PlatformFileContentXYWValues, projectFileDocument, serializeCanvasMetadata } from "./file-content";
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
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  let value: Dynamic = (0, getArtboardHtmlReference)(input.file);
  return (
    isLoadingArtboardHtml(options) ||
    (value !== undefined &&
      (0, htmlReferenceForText)(options) === value.ref) ||
    (0, serializedDocumentBytes)(
      (0, artboardDocument)(input, options),
    ) > PlatformFileContentResolvedValue_9
  );
}
function shallowDocumentEqual(input?: Dynamic, options?: Dynamic): Dynamic {
  let value: Dynamic = Object.keys(input);
  if (value.length !== Object.keys(options).length) return false;
  for (let value2 of value as Dynamic)
    if (
      !(value2 in options) ||
      (input[value2] !== options[value2] &&
        !(0, structurallyEqual)(input[value2], options[value2]))
    )
      return false;
  return true;
}
function setUnchangedDocumentValue(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
): Dynamic {
  let value2: Dynamic = options?.get(context);
  input.set(
    context,
    value2 !== undefined && shallowDocumentEqual(value2, value)
      ? value2
      : value,
  );
}
function decomposeDesignDocument(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let files: Dynamic = input.content.files,
    value: Dynamic = (0, parseCanvasMetadata)(
      files[canvasMetadataFile],
      files,
    ),
    entries: Dynamic = new Map(),
    value2: Dynamic = value.artboards.map(
      (input2?: Dynamic): Dynamic => input2.file,
    );
  for (let value4 of (context?.dangling ?? []) as Dynamic) {
    if (value2.includes(value4.path)) continue;
    let value5: Dynamic =
      value4.after === null ? -1 : value2.indexOf(value4.after);
    value4.after !== null && value5 < 0
      ? value2.push(value4.path)
      : value2.splice(value5 + 1, 0, value4.path);
  }
  for (let value4 of value.artboards as Dynamic) {
    let value5: Dynamic = files[value4.file] ?? "",
      value6: Dynamic = (0, getArtboardHtmlReference)(value4.file),
      value7: Dynamic = (0, artboardDocument)(value4, value5);
    if (
      value6 !== undefined &&
      (isLoadingArtboardHtml(value5) ||
        (0, htmlReferenceForText)(value5) === value6.ref)
    )
      value7 = {
        ...(0, artboardDocument)(value4, ""),
        htmlRef: value6.ref,
        htmlBytes: value6.bytes,
      };
    else if (
      value6 === undefined &&
      value5 ===
        DoctypeHtmlHtmlDataDcBoardLoadingBodyStyleMarginDisplayGridMessage
    ) {
      let value8: Dynamic = options?.get(
        BoardsValue +
          "/" +
          (0, encodeStorePathSegment)(value4.file),
      );
      value8 !== undefined &&
        entries.set(
          BoardsValue +
            "/" +
            (0, encodeStorePathSegment)(value4.file),
          value8,
        );
      continue;
    } else if (
      (0, serializedDocumentBytes)(value7) >
      PlatformFileContentResolvedValue_9
    ) {
      let value8: Dynamic = (0, htmlReferenceForText)(value5);
      value8 !== undefined
        ? (value7 = {
            ...(0, artboardDocument)(value4, ""),
            htmlRef: value8,
            htmlBytes:
              value6?.ref === value8
                ? value6.bytes
                : (0, DesignSystemTypeDeclarationsGetLength)(value5),
          })
        : (0, scheduleHtmlUpload)(value4.file, value5);
    }
    setUnchangedDocumentValue(
      entries,
      options,
      BoardsValue +
        "/" +
        (0, encodeStorePathSegment)(value4.file),
      value7,
    );
  }
  for (let value4 of (value.annotations ?? []) as Dynamic)
    setUnchangedDocumentValue(
      entries,
      options,
      NotesValue + "/" + value4.id,
      (0, annotationDocument)(value4),
    );
  for (let value4 of Object.keys(files) as Dynamic)
    value4 === canvasMetadataFile ||
      (0, isArtboardFile)(value4) ||
      setUnchangedDocumentValue(
        entries,
        options,
        FilesValue +
          "/" +
          (0, encodeStorePathSegment)(value4),
        (0, projectFileDocument)(value4, files[value4]),
      );
  (0, decomposeComments)(input.comments, options, entries);
  let value3: Dynamic =
    value.cover ??
    (context?.cover !== undefined && value2.includes(context.cover)
      ? context.cover
      : undefined);
  setUnchangedDocumentValue(
    entries,
    options,
    PlatformFileContentResolvedValue_4,
    (0, canvasMetaDocument)(
      input.title,
      value3 === value.cover
        ? value
        : {
            ...value,
            cover: value3,
          },
      value2,
    ),
  );
  return entries;
}
function asString(input?: Dynamic): Dynamic {
  return typeof input == "string" ? input : undefined;
}
function composeDesignDocument(input?: Dynamic, options?: Dynamic): Dynamic {
  let entry: Dynamic = input.get(PlatformFileContentResolvedValue_4);
  (0, updateMovedToFilesState)(entry);
  (0, setInstanceFileReferences)(
    input.get(DesignValue + "/" + InstanceValue),
  );
  (0, setDesignSystems)(
    input.get(DesignValue + "/" + DesignSystemsKey),
  );
  (0, updateDesignSourceFile)(
    input.get(PlatformFileContentResolvedValue_5),
  );
  let entries: Dynamic = new Map(),
    entries2: Dynamic = new Map(),
    entries3: Dynamic = new Map(),
    entries4: Dynamic = new Map(),
    values: Dynamic = new Set(),
    index: Dynamic = 0;
  for (let [value6, value7] of input as Dynamic) {
    let value8: Dynamic = value6.indexOf("/"),
      value9: Dynamic = value8 < 0 ? "" : value6.slice(0, value8);
    if (!(value6.indexOf("/", value8 + 1) >= 0)) {
      if (value9 === BoardsValue) {
        let path: Dynamic = value7.path,
          value10: Dynamic = asString(value7.html);
        if (
          !isSafeProjectPathAlias(path) ||
          !(0, isArtboardFile)(path) ||
          (0, basename)(value6) !==
            (0, encodeStorePathSegment)(path)
        ) {
          index++;
          continue;
        }
        let value11: Dynamic = asString(value7.htmlRef);
        if (value10 === undefined && value11 === undefined) continue;
        let state2: Dynamic = {
          file: path,
        };
        for (let value12 of PlatformFileContentXYWValues as Dynamic)
          value7[value12] !== undefined &&
            (state2[value12] = value7[value12]);
        if (value11 !== undefined && (0, isBlobAssetUrl)(value11)) {
          entries2.set(path, {
            ref: value11,
            bytes: typeof value7.htmlBytes == "number" ? value7.htmlBytes : 0,
          });
          entries.set(path, {
            spec: state2,
            html:
              (0, getReferencedHtml)(value11) ??
              DoctypeHtmlHtmlDataDcBoardLoadingBodyStyleMarginDisplayGridMessage,
          });
        } else if (value11 !== undefined) {
          index++;
          continue;
        } else
          entries.set(path, {
            spec: state2,
            html: value10,
          });
      } else if (value9 === FilesValue) {
        values.add((0, basename)(value6));
        let path: Dynamic = value7.path,
          value10: Dynamic = asString(value7.data),
          value11: Dynamic = asString(value7.dataRef),
          value12: Dynamic =
            ((0, isProjectTextFilePath)(path) &&
              /\.(css|m?js)$/i.test(path)) ||
            (0, isTypeDeclarationPath)(path);
        if (
          value10 === undefined &&
          value7.kind === "text" &&
          value11 !== undefined &&
          (0, isBlobAssetUrl)(value11) &&
          value12 &&
          (0, basename)(value6) ===
            (0, encodeStorePathSegment)(path)
        ) {
          entries4.set(path, {
            ref: value11,
            bytes: typeof value7.dataBytes == "number" ? value7.dataBytes : 0,
          });
          continue;
        }
        if (
          !isSafeProjectPathAlias(path) ||
          (0, isArtboardFile)(path) ||
          path === canvasMetadataFile ||
          !(0, isSupportedProjectAsset)(path)
        ) {
          index++;
          continue;
        }
        if (
          (0, basename)(value6) !==
            (0, encodeStorePathSegment)(path) ||
          value10 === undefined
        )
          continue;
        entries3.set(path, value10);
      }
    }
  }
  index !== PlatformDesignDocumentAdapterAlias &&
    ((PlatformDesignDocumentAdapterAlias = index),
    index > 0 &&
      console.warn(
        "design (live store): not showing " +
          String(index) +
          ' store document(s) whose name or kind is outside the rules (names: letters, digits, "_", then also space, "." and "-"; files/ = images, .css, .js, .mjs, .jsx, .tsx, .json)',
      ));
  let value: Dynamic = Array.isArray(entry?.boardOrder)
      ? entry.boardOrder.filter(
          (input2?: Dynamic): Dynamic => typeof input2 == "string",
        )
      : [],
    items: Dynamic = [],
    items2: Dynamic = [],
    items3: Dynamic = [],
    value2: Dynamic = null;
  for (let value6 of value as Dynamic)
    items3.includes(value6) ||
      items.some((input2?: Dynamic): Dynamic => input2.path === value6) ||
      (entries.has(value6)
        ? items3.push(value6)
        : (items.push({
            path: value6,
            after: value2,
          }),
          isSafeProjectPathAlias(value6) &&
            (0, isArtboardFile)(value6) &&
            items2.push(
              BoardsValue +
                "/" +
                (0, encodeStorePathSegment)(value6),
            )),
      (value2 = value6));
  (0, setArtboardHtmlReferences)(entries2);
  (0, setExternalFileReferences)(entries4, undefined, values);
  let state: Dynamic = {};
  for (let value6 of items3 as Dynamic)
    state[value6] = entries.get(value6).html;
  for (let [value6, value7] of [...entries3].sort(
    ([input2]: Dynamic, [options2]: Dynamic): Dynamic =>
      input2 < options2 ? -1 : input2 > options2 ? 1 : 0,
  ) as Dynamic)
    state[value6] = value7;
  let items4: Dynamic = [];
  for (let [value6, value7] of input as Dynamic) {
    if (
      !value6.startsWith(NotesValue + "/") ||
      value6.indexOf("/", NotesValue.length + 1) >= 0 ||
      typeof value7.x != "number" ||
      typeof value7.y != "number"
    )
      continue;
    let callback: Dynamic = (input2?: Dynamic, options2?: Dynamic): Dynamic =>
      typeof value7[input2] == "number" &&
      typeof value7[options2] == "number";
    (value7.kind === "rect" || value7.kind === "oval"
      ? callback("w", "h")
      : value7.kind === "line" || value7.kind === "arrow"
        ? callback("x2", "y2")
        : value7.kind === "pen"
          ? callback("w", "h") && typeof value7.d == "string"
          : value7.kind === "image"
            ? callback("w", "h") && typeof value7.src == "string"
            : typeof value7.text == "string") &&
      items4.push({
        ...value7,
        id: (0, basename)(value6),
      });
  }
  let value3: Dynamic = JSON.stringify({
    artboards: items3.map(
      (input2?: Dynamic): Dynamic => entries.get(input2).spec,
    ),
    annotations: items4,
    ...(entry?.launch !== undefined
      ? {
          launch: entry.launch,
        }
      : {}),
    ...(entry?.pages !== undefined
      ? {
          pages: entry.pages,
        }
      : {}),
    ...(entry?.cover !== undefined
      ? {
          cover: entry.cover,
        }
      : {}),
    ...(entry?.migrated === true
      ? {
          migrated: true,
        }
      : {}),
  });
  entry !== undefined &&
    (state[canvasMetadataFile] = (0, serializeCanvasMetadata)(
      (0, parseCanvasMetadata)(value3, state),
    ));
  let value4: Dynamic = asString(entry?.cover),
    value5: Dynamic =
      value4 !== undefined &&
      items.some((input2?: Dynamic): Dynamic => input2.path === value4)
        ? value4
        : undefined;
  return {
    title: asString(entry?.title) ?? "",
    content: {
      files: state,
    },
    comments: (0, composeComments)(input),
    carry: {
      dangling: items,
      ...(value5 !== undefined
        ? {
            cover: value5,
          }
        : {}),
    },
    dangling: items2,
  };
}
function describeDesignPublishRefusal(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = input.slice(0, input.indexOf("/")),
    value2: Dynamic = (0, serializedDocumentBytes)(options);
  if (
    value === BoardsValue &&
    value2 > PlatformFileContentResolvedValue_6
  ) {
    let value3: Dynamic =
        asString(options.path) ?? (0, basename)(input),
      value4: Dynamic =
        asString(options.title) ?? value3.replace(/\.dc\.html$/, ""),
      value5: Dynamic = asString(options.html) ?? "";
    return value5 !== "" && (0, isKnownHtmlReference)(value5)
      ? "Artboard \u201C" +
          value4 +
          "\u201D is " +
          PlatformDesignDocumentAdapterHandler(value2) +
          " KB \u2014 too large even as an uploaded blob (2 MB). Split it or move images to assets."
      : value5 !== "" && (0, getHtmlReferenceState)()
        ? "Artboard \u201C" +
          value4 +
          "\u201D is " +
          PlatformDesignDocumentAdapterHandler(value2) +
          " KB \u2014 over the 240 KB that syncs, and this view cannot upload it; it stays on this screen. Split it or move images to assets."
        : value5 !== "" && !(0, knownHtmlReferenceState)(value5)
          ? "Artboard \u201C" +
            value4 +
            "\u201D is " +
            PlatformDesignDocumentAdapterHandler(value2) +
            " KB \u2014 uploading it as a blob; this edit syncs when that lands."
          : value5 !== ""
            ? "Artboard \u201C" +
              value4 +
              "\u201D is " +
              PlatformDesignDocumentAdapterHandler(value2) +
              " KB and its upload failed \u2014 it stays on this screen; retrying shortly."
            : "Artboard \u201C" +
              value4 +
              "\u201D is too large to sync (" +
              PlatformDesignDocumentAdapterHandler(value2) +
              " KB > 240 KB). Split it or move images to assets.";
  }
  if (
    value === FilesValue &&
    value2 > PlatformFileContentResolvedValue_7
  )
    return (
      "\u201C" +
      (asString(options.path) ?? (0, basename)(input)) +
      "\u201D is too large to sync (" +
      PlatformDesignDocumentAdapterHandler(value2) +
      " KB > 180 KB). Upload images as assets instead."
    );
  if (value2 > PlatformDesignDocumentAdapterResolvedValue)
    return (
      "This change is too large to sync (" +
      PlatformDesignDocumentAdapterHandler(value2) +
      " KB)."
    );
  if ((0, recordDepth)(options) > PlatformDesignDocumentAdapterLimit)
    return "This change is nested too deeply to sync.";
  if (context > PlatformFileContentResolvedValue_8)
    return (
      "This canvas\u2019s " +
      (value === CommentsValue ? "comments" : value) +
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
    isLoadingArtboardHtml = (input?: Dynamic): Dynamic =>
      input.includes("data-dc-board-loading");
    DoctypeHtmlHtmlDataDcBoardLoadingBodyStyleMarginDisplayGridMessage =
      '<!doctype html><html data-dc-board-loading><body style="margin:0;display:grid;place-items:center;height:100vh;font:14px system-ui;color:#888">Loading this artboard\u2026</body></html>';
    isSafeProjectPathAlias = isSafeProjectPath;
    PlatformDesignDocumentAdapterAlias = 0;
    PlatformDesignDocumentAdapterHandler = (input?: Dynamic): Dynamic =>
      String(Math.round(input / 1024));
    designDocumentStorageAdapter = {
      collections: [
        FilesValue,
        BoardsValue,
        NotesValue,
        CommentsValue,
        "design",
      ],
      metaPath: PlatformFileContentResolvedValue_4,
      decompose: decomposeDesignDocument,
      compose: composeDesignDocument,
      refuse: describeDesignPublishRefusal,
    };
  };
}
