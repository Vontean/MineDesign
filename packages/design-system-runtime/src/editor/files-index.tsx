import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type {
  FileStoragePolicy,
  MergeSchema,
  DataUrlSignature,
  FilePublishRejection,
  StoredIndexMetadata,
  RestoredIndexedFiles,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import { loadReactNamespace } from "../dependencies";
import { buildDesignSystemManifest, parsedDesignSystem, stringifyManifestWithinBudget } from "../model/derive-system";
import { consumptionDocumentationForFiles } from "../model/documentation";
import { blobPointer, blobRelativeUrlModelFilePolicy, DESIGN_SYSTEM_PATHS, explainGeneratedOrRetiredPath, explainReservedSystemPath, fileExtension, GENERATED_TOKENS_CSS_PATH, isGeneratedSystemPath, isHeldFilePointer, isTextFilePath, isValidDesignSystemPath, mimeTypeForPath, parseDataUriHeader, RESERVED_PROTOTYPE_NAMES, storagePointerForFile } from "../model/file-policy";
import { classifyDesignSystemFile, HELD_BINARY_MIME_TYPES, isAdditionalMarkdownPath, isPublishableFilePathModelFileTable, mirrorMimeTypeForPath, normalizeDesignSystemPath } from "../model/file-table";
import { isAssetGroupName, isAssetTileSize } from "../model/manifest-metadata";
import { reconcileStorageCatalog, serializeStorageCatalog, storageCatalogFromManifest } from "../model/storage";
import { makeStoredSystemMetadata } from "../model/stored-file-codec";
import { generatedTokensCssForFiles } from "../model/tokens";
import { toModuleNamespace } from "../module-helpers";

var reactFontFaces: typeof import("react");
var FILES_INDEX_PROJECT_PATH: string;
var FILES_INDEX_NAME: string;
var FILES_INDEX_PATH: string;
var RESERVED_MIGRATION_FILE_NAMES: string[];
var PROJECT_FILE_PREFIXEditorFilesIndex: string;
var FILES_INDEX_VERSION: number;
var projectFilePath: (path: string) => string;
var relativeProjectFilePath: (path: string) => string | undefined;
var DEFAULT_FILE_STORAGE_POLICY: FileStoragePolicy;
var fileIndexEncoder: TextEncoder;
var fileIndexDecoder: TextDecoder;
var FILE_INDEX_KEY_SAFE_CHARACTER: RegExp;
var isSafeFileIndexKey: (key: string) => boolean;
var CONVERTED_FROM_FIELD: string;
var CREATED_ON_FILES_FIELD: string;
var createEmptyFilesIndex: () => Files.FilesIndex;
var FILES_INDEX_MERGE_SCHEMA: MergeSchema;
var isFilesIndexObject: (value: unknown) => value is Record<string, unknown>;
var TREE_INDEX_FIELD: string;
var PUBLISHABLE_MIME_TYPES: Set<string>;
var TEXT_MIME_TYPES: Set<string>;
var isTextMimeType: (mime: string) => boolean;
var SVG_XML_DECLARATION_PATTERN: RegExp;
var SVG_DOCTYPE_PATTERN: RegExp;
var SVG_ATTRIBUTE_PATTERN: RegExp;
var RESERVED_XML_NAMESPACES: string[];
var isXmlWhitespace: (character: string | undefined) => boolean;
var asciiCharacterCodes: (text: string) => number[];
var bytesMatchAt: (
  bytes: Uint8Array<ArrayBufferLike>,
  offset: number,
  signature: readonly number[],
) => boolean;
var unpublishableFileReason: (
  path: string,
  contents: string | undefined,
) => string | null;
function classifyFileStorage(
  path: string,
  contents: string,
  policy: FileStoragePolicy = DEFAULT_FILE_STORAGE_POLICY,
): Files.FileStorageClassification {
  if (path === DESIGN_SYSTEM_PATHS.manifest) {
    return {
      to: "derived",
    };
  }
  let record = storagePointerForFile(path, contents),
    desiredStorage =
      isTextFilePath(path) &&
      classifyDesignSystemFile(path) === "asset" &&
      record === null
        ? "file"
        : policy[classifyDesignSystemFile(path)];
  if (record !== null && record.store === "blob") {
    return {
      to: "record",
      id: record.id,
      owed: desiredStorage === "file",
    };
  }
  if (record !== null) {
    return {
      to: "derived",
    };
  }
  return {
    to: "file",
    owed: desiredStorage === "blob",
  };
}
function blobFilesOwedToFileStorage(
  files: Files.FileTable,
  policy: FileStoragePolicy = DEFAULT_FILE_STORAGE_POLICY,
) {
  let owedFiles: {
    path: string;
    id: string;
  }[] = [];
  for (let value of Object.keys(files).sort()) {
    let storageClassification = classifyFileStorage(value, files[value], policy);
    if (storageClassification.to === "record" && storageClassification.owed) {
      owedFiles.push({
        path: value,
        id: storageClassification.id,
      });
    }
  }
  return owedFiles;
}
function encodeFileIndexKey(key: string): string {
  let encodedKey = "";
  for (let value of fileIndexEncoder.encode(key)) {
    let character = String.fromCharCode(value);
    encodedKey +=
      value < 128 && FILE_INDEX_KEY_SAFE_CHARACTER.test(character)
        ? character
        : "~" + value.toString(16).padStart(2, "0");
  }
  return encodedKey;
}
function decodeFileIndexKey(key: string): string {
  let bytes: number[] = [];
  for (let index = 0; index < key.length; index++) {
    let value =
      key[index] === "~"
        ? /^[0-9a-f]{2}/.exec(key.slice(index + 1, index + 3))
        : null;
    if (value !== null) {
      bytes.push(parseInt(value[0], 16));
      index += 2;
    } else {
      for (let encodedByte of fileIndexEncoder.encode(key[index])) {
        bytes.push(encodedByte);
      }
    }
  }
  return fileIndexDecoder.decode(new Uint8Array(bytes));
}
function isFilesIndex(indexValue: unknown): indexValue is Files.FilesIndex {
  return (
    isFilesIndexObject(indexValue) &&
    !isFilesIndexObject(indexValue.content) &&
    (hasFilesMigrationMarker(indexValue) ||
      (typeof indexValue.v === "number" &&
        indexValue.v >= FILES_INDEX_VERSION &&
        indexValue.layout === "files"))
  );
}
function hasFilesMigrationMarker(indexValue: unknown) {
  return (
    isFilesIndexObject(indexValue) &&
    (isFilesIndexObject(indexValue[CONVERTED_FROM_FIELD]) ||
      isFilesIndexObject(indexValue[CREATED_ON_FILES_FIELD]))
  );
}
function parseFilesIndex(text: string): Files.FilesIndex | null {
  try {
    let value: unknown = JSON.parse(text);
    if (isFilesIndex(value)) {
      return value;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function readTreeIndex(
  treeIndexValue: Record<string, unknown>,
): Files.FilesIndex | undefined {
  let index = treeIndexValue[TREE_INDEX_FIELD];
  if (isFilesIndex(index)) {
    return index;
  } else {
    return undefined;
  }
}
function hasValidSvgRoot(text: string, offset: number) {
  if (!text.startsWith("<svg", offset)) {
    return false;
  }
  let attributes: Set<string> = new Set(),
    namespacePrefixes: Set<string> = new Set(),
    namespaceUris: Set<string> = new Set(),
    usedPrefixes: string[] = [];
  for (let value = offset + 4; value - offset < 60000; ) {
    let isWhitespace = isXmlWhitespace(text[value]);
    while (isXmlWhitespace(text[value])) {
      value++;
    }
    if (
      text[value] === ">" ||
      (text[value] === "/" && text[value + 1] === ">")
    ) {
      return usedPrefixes.every((prefix) => namespacePrefixes.has(prefix));
    }
    SVG_ATTRIBUTE_PATTERN.lastIndex = value;
    let attributeMatch = isWhitespace ? SVG_ATTRIBUTE_PATTERN.exec(text) : null;
    if (attributeMatch === null) {
      return false;
    }
    let namespacePrefix = attributeMatch[1] ?? "",
      attributeName = attributeMatch[2],
      attributeValue = attributeMatch[3] ?? attributeMatch[4] ?? "",
      qualifiedName = attributeName === undefined ? namespacePrefix : namespacePrefix + ":" + attributeName;
    if (attributes.has(qualifiedName)) {
      return false;
    }
    attributes.add(qualifiedName);
    if (namespacePrefix === "xmlns") {
      if (
        /[ \t\r\n]/.test(attributeValue) ||
        RESERVED_XML_NAMESPACES.includes(attributeValue) ||
        (attributeValue !== "" && !/[:/]/.test(attributeValue))
      ) {
        return false;
      }
      if (
        attributeName !== undefined &&
        (attributeValue === "" ||
          attributeName === "xml" ||
          attributeName === "xmlns" ||
          namespaceUris.has(attributeValue))
      ) {
        return false;
      }
      if (attributeName !== undefined) {
        namespacePrefixes.add(attributeName);
        namespaceUris.add(attributeValue);
      }
    } else if (attributeName !== undefined && namespacePrefix !== "xml") {
      usedPrefixes.push(namespacePrefix);
    }
    value += attributeMatch[0].length;
  }
  return false;
}
function isPublishableSvgText(text: string): boolean {
  if (
    text === "" ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\ufffd-\uffff]/.test(text) ||
    /\p{Cs}/u.test(text)
  ) {
    return false;
  }
  let offset = text.startsWith("\uFEFF") ? 1 : 0;
  if (text.startsWith("ftyp", 4) || text.startsWith("ftyp", offset + 4)) {
    return false;
  }
  if (text.startsWith("<?xml", offset)) {
    SVG_XML_DECLARATION_PATTERN.lastIndex = offset;
    let value = SVG_XML_DECLARATION_PATTERN.exec(text);
    if (value === null) {
      return false;
    }
    offset += value[0].length;
  }
  for (let flag: boolean = false; ; ) {
    while (isXmlWhitespace(text[offset])) {
      offset++;
    }
    if (offset >= 200000) {
      return false;
    }
    if (text.startsWith("<\!--", offset)) {
      let value = text.indexOf("-->", offset + 4),
        svgText =
          value < 0 || value > 200000 ? "--" : text.slice(offset + 4, value);
      if (
        svgText.includes("--") ||
        svgText.endsWith("-") ||
        svgText.includes("<![")
      ) {
        return false;
      }
      offset = value + 3;
    } else if (text.startsWith("<!DOCTYPE", offset)) {
      SVG_DOCTYPE_PATTERN.lastIndex = offset;
      let value = SVG_DOCTYPE_PATTERN.exec(text);
      if (flag || value === null || value[0].includes("ENTITY")) {
        return false;
      }
      flag = true;
      offset += value[0].length;
    } else {
      return hasValidSvgRoot(text, offset);
    }
  }
}
function detectNonCodeText(text: string): undefined | string {
  if (text === "") {
    return;
  }
  let hasBom: boolean = text.charCodeAt(0) === 65279,
    offset: number = hasBom ? 1 : 0;
  if (text.startsWith("\x00<\x00?", offset)) {
    return "markup";
  }
  while (
    offset < text.length &&
    ` 	
\f\r`.includes(text[offset])
  ) {
    offset++;
  }
  if (text[offset] === "<") {
    return "markup";
  }
  let prefixBytes = fileIndexEncoder
      .encode(text.slice(0, 512))
      .subarray(0, 512),
    prefixText = String.fromCharCode(...prefixBytes.subarray(0, 16));
  if (/^[\s\S]{4}ftyp[\s\S]{4}/.test(prefixText)) {
    return "signature";
  }
  if (hasBom) {
    return;
  }
  if (
    /^(?:%PDF-|%!PS-Adobe-|BM|GIF8[79]a|ID3|OTTO|ttcf|wOFF|wOF2|FORM[\s\S]{4}AIFF|RIFF[\s\S]{4}(?:AVI |WAVE|WEBP))/.test(
      prefixText,
    ) ||
    (prefixBytes.length >= 36 &&
      prefixBytes[34] === 76 &&
      prefixBytes[35] === 80)
  ) {
    return "signature";
  }
  if (
    prefixBytes.some(
      (byte) =>
        byte <= 8 ||
        byte === 11 ||
        (byte >= 14 && byte <= 26) ||
        (byte >= 28 && byte <= 31),
    )
  ) {
    return "binary";
  } else {
    return undefined;
  }
}
function publishableFileMimeType(
  path: string,
  contents?: string,
): string | null {
  let extension = fileExtension(path);
  if (extension === "lottie") {
    if (contents === undefined) {
      return null;
    } else {
      return lottieDataUrlMimeType(contents);
    }
  }
  let archiveMimeType =
    contents !== undefined &&
    Object.hasOwn(HELD_BINARY_MIME_TYPES, extension)
      ? archiveFileMimeType(path, contents)
      : null;
  if (archiveMimeType !== null) {
    return archiveMimeType;
  }
  let mimeType =
    extension === "svg" &&
    contents !== undefined &&
    isPublishableSvgText(contents)
      ? "image/svg+xml"
      : extension === "js" || extension === "mjs"
        ? "text/javascript"
        : (mirrorMimeTypeForPath(path) ??
          (isTextFilePath(path)
            ? "text/plain"
            : mimeTypeForPath(path)));
  if (
    (mimeType === "text/css" || mimeType === "text/javascript") &&
    contents !== undefined &&
    detectNonCodeText(contents) !== undefined
  ) {
    return "text/plain";
  }
  if (typeof mimeType === "string" && PUBLISHABLE_MIME_TYPES.has(mimeType)) {
    return mimeType;
  }
  if (contents !== undefined && isCleanUtf8DataUrl(contents)) {
    return "text/plain";
  } else {
    return null;
  }
}
function decodeFileDataUrl(dataUrl: string): Uint8Array<ArrayBuffer> | null {
  let metadata = parseDataUriHeader(dataUrl);
  if (metadata === null) {
    return null;
  }
  try {
    let value = dataUrl.slice(metadata.payloadOffset);
    if (!metadata.base64) {
      return new TextEncoder().encode(decodeURIComponent(value));
    }
    let base64Text = atob(value),
      decodedBytes = new Uint8Array(base64Text.length);
    for (let index: number = 0; index < base64Text.length; index++) {
      decodedBytes[index] = base64Text.charCodeAt(index);
    }
    return decodedBytes;
  } catch {
    return null;
  }
}
function decodeCleanUtf8(bytes: Uint8Array<ArrayBufferLike>): string | null {
  try {
    let value = new TextDecoder("utf-8", {
      fatal: true,
    }).decode(bytes);
    if (
      /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(value) ||
      hasDamagedUnicode(value)
    ) {
      return null;
    } else {
      return value;
    }
  } catch {
    return null;
  }
}
function isCleanUtf8DataUrl(dataUrl: string) {
  let bytes = decodeFileDataUrl(dataUrl);
  return bytes !== null && decodeCleanUtf8(bytes) !== null;
}
function lottieDataUrlMimeType(dataUrl: string): null | string {
  let bytes = decodeFileDataUrl(dataUrl);
  if (bytes === null) {
    return null;
  }
  if (
    bytes.length >= 4 &&
    bytes[0] === 80 &&
    bytes[1] === 75 &&
    bytes[2] === 3 &&
    bytes[3] === 4
  ) {
    return "application/zip+dotlottie";
  }
  if (decodeCleanUtf8(bytes)?.trimStart().startsWith("{") === true) {
    return "application/json";
  } else {
    return null;
  }
}
function archiveFileMimeType(path: string, dataUrl: string) {
  let signature = readDataUrlSignature(dataUrl);
  if (signature === null) {
    return null;
  }
  if (
    !bytesMatchAt(signature.head, 0, [80, 75, 3, 4]) &&
    !(
      fileExtension(path) === "fig" &&
      bytesMatchAt(signature.head, 0, asciiCharacterCodes("fig-"))
    )
  ) {
    return null;
  }
  if (
    signature.length >= 12 &&
    bytesMatchAt(signature.head, 4, asciiCharacterCodes("ftyp"))
  ) {
    return null;
  }
  let isVirtualDiskFooter = (offset: number) =>
    bytesMatchAt(signature.tail, offset, asciiCharacterCodes("conectix")) &&
    bytesMatchAt(signature.tail, offset + 12, [0, 1, 0, 0]);
  if (
    signature.length >= 512 &&
    (bytesMatchAt(signature.tail, 0, [
      ...asciiCharacterCodes("koly"),
      0,
      0,
      0,
      4,
      0,
      0,
      2,
      0,
    ]) ||
      isVirtualDiskFooter(0) ||
      isVirtualDiskFooter(1))
  ) {
    return null;
  }
  return HELD_BINARY_MIME_TYPES[fileExtension(path)];
}
function readDataUrlSignature(dataUrl: string): DataUrlSignature | null {
  let metadata = parseDataUriHeader(dataUrl),
    payload = metadata === null ? "" : dataUrl.slice(metadata.payloadOffset),
    readFullSignature = () => {
      let value = decodeFileDataUrl(dataUrl);
      if (value === null) {
        return null;
      } else {
        return {
          head: value.subarray(0, 12),
          tail: value.subarray(Math.max(0, value.length - 512)),
          length: value.length,
        };
      }
    };
  if (
    metadata === null ||
    !metadata.base64 ||
    payload.length < 720 ||
    payload.length % 4 !== 0 ||
    !/^[A-Za-z0-9+/]*={0,2}$/.test(payload)
  ) {
    return readFullSignature();
  }
  let decodeBase64Bytes = (encodedText: string) =>
      Uint8Array.from(atob(encodedText), (character) => character.charCodeAt(0)),
    decodedTail = decodeBase64Bytes(payload.slice(-688));
  return {
    head: decodeBase64Bytes(payload.slice(0, 16)),
    tail: decodedTail.subarray(decodedTail.length - 512),
    length:
      (payload.length / 4) * 3 -
      (payload.endsWith("==") ? 2 : payload.endsWith("=") ? 1 : 0),
  };
}
function hasDamagedUnicode(text: string) {
  return (
    text.includes(String.fromCharCode(65533)) ||
    /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/.test(
      text,
    )
  );
}
function explainUnpublishableFile(
  path: string,
  contents: string | undefined,
): FilePublishRejection | null {
  if (hasDamagedUnicode(path)) {
    return {
      why: "this name contains a damaged character; rename the file",
      cause: "name",
    };
  }
  if (publishableFileMimeType(path, contents) === null) {
    if (
      contents === undefined ||
      !Object.hasOwn(
        HELD_BINARY_MIME_TYPES,
        fileExtension(path),
      )
    ) {
      return {
        why: "this kind of file cannot be published with the design system; it was left out (convert it, or keep it elsewhere)",
        cause: "kind",
      };
    }
    if (decodeFileDataUrl(contents) === null) {
      return {
        why: uiMessage("design-system.filesIndex.itsContentsCouldNotBe"),
        cause: "unreadable",
      };
    }
    return {
      get why() { return ((uiMessage("design-system.filesIndex.itDoesNotLookLike")) + (fileExtension(path))) + (" file inside (it may be damaged, password-protected or another format renamed). Replace it with a fresh copy, or remove it"); },
      cause: "kind",
    };
  }
  if (
    contents !== undefined &&
    isTextFilePath(path) &&
    hasDamagedUnicode(contents)
  ) {
    return {
      why: "it contains a damaged character (one that was not valid text when the file was saved); fix the text and try again",
      cause: "damaged_text",
    };
  }
  if (
    !isPublishableFilePathModelFileTable(projectFilePath(path))
  ) {
    return {
      why: "this name cannot be published: it contains one of % ; : ? # or a backslash, ends in .cmekshadow, or is too long; rename the file",
      cause: "name",
    };
  }
  return null;
}
function isProjectContentPath(path: string) {
  let relativePath = relativeProjectFilePath(path);
  if (
    relativePath === undefined ||
    !isValidDesignSystemPath(relativePath) ||
    normalizeDesignSystemPath(relativePath) !== relativePath
  ) {
    return false;
  }
  if (
    relativePath === DESIGN_SYSTEM_PATHS.manifest ||
    isGeneratedSystemPath(relativePath) ||
    RESERVED_MIGRATION_FILE_NAMES.includes(relativePath)
  ) {
    return false;
  }
  return (
    explainReservedSystemPath(relativePath) === null &&
    explainGeneratedOrRetiredPath(relativePath) === null
  );
}
function isDerivedProjectPath(path: string) {
  let relativePath = relativeProjectFilePath(path);
  return (
    relativePath !== undefined &&
    isValidDesignSystemPath(relativePath) &&
    normalizeDesignSystemPath(relativePath) === relativePath &&
    (relativePath === DESIGN_SYSTEM_PATHS.manifest ||
      isGeneratedSystemPath(relativePath))
  );
}
function validDerivedProjectFiles(files: Files.FileTable) {
  let derived = derivedProjectFiles(files);
  for (let [value, filePath] of derived) {
    if (hasDamagedUnicode(filePath)) {
      derived.delete(value);
    }
  }
  return derived;
}
function damagedDerivedProjectPaths(files: Files.FileTable) {
  let damagedPaths = [...derivedProjectFiles(files)]
    .filter(([, fileContent]: [string, string]) => hasDamagedUnicode(fileContent))
    .map(([filePath]: [string, string]) => filePath);
  if (
    Object.hasOwn(files, DESIGN_SYSTEM_PATHS.tokens) &&
    generatedTokensCssForFiles(files) === null
  ) {
    damagedPaths.push(projectFilePath(GENERATED_TOKENS_CSS_PATH));
  }
  return damagedPaths;
}
function projectFilesForSave(files: Files.FileTable) {
  let projectFiles = publishableProjectFiles(files);
  for (let value of Object.keys(files)) {
    let fileContent = files[value];
    if (
      (isRepairableDamagedText(value, fileContent) ||
        isUnsupportedBinaryFile(value, fileContent)) &&
      classifyFileStorage(value, fileContent).to === "file" &&
      isProjectContentPath(projectFilePath(value))
    ) {
      projectFiles.set(projectFilePath(value), fileContent);
    } else if (
      isHeldFilePointer(value, fileContent) &&
      isProjectContentPath(projectFilePath(value)) &&
      !hasDamagedUnicode(value) &&
      isPublishableFilePathModelFileTable(projectFilePath(value))
    ) {
      projectFiles.set(projectFilePath(value), fileContent);
    }
  }
  return projectFiles;
}
function isUnsupportedBinaryFile(path: string, contents: string) {
  return (
    !isTextFilePath(path) &&
    !hasDamagedUnicode(path) &&
    isPublishableFilePathModelFileTable(projectFilePath(path)) &&
    publishableFileMimeType(path, contents) === null &&
    decodeFileDataUrl(contents) !== null
  );
}
function isRepairableDamagedText(path: string, contents: string) {
  return (
    isTextFilePath(path) &&
    hasDamagedUnicode(contents) &&
    unpublishableFileReason(
      path,
      contents
        .split(String.fromCharCode(65533))
        .join("")
        .replace(
          /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g,
          "",
        ),
    ) === null
  );
}
function derivedProjectFiles(files: Files.FileTable) {
  let projectFiles: Map<string, string> = new Map(),
    tokensCss =
      generatedTokensCssForFiles(files)?.replaceAll(
        'url("' + blobRelativeUrlModelFilePolicy(""),
        'url("../' + blobRelativeUrlModelFilePolicy(""),
      ) ?? null;
  if (tokensCss !== null) {
    projectFiles.set(
      projectFilePath(GENERATED_TOKENS_CSS_PATH),
      tokensCss,
    );
  }
  for (let [value, derivedContent] of consumptionDocumentationForFiles(
    files,
    PROJECT_FILE_PREFIXEditorFilesIndex,
  ).files) {
    if (isDerivedProjectPath(projectFilePath(value))) {
      projectFiles.set(projectFilePath(value), derivedContent);
    }
  }
  let manifest = files[DESIGN_SYSTEM_PATHS.manifest];
  if (typeof manifest === "string" && manifest !== "") {
    projectFiles.set(
      projectFilePath(DESIGN_SYSTEM_PATHS.manifest),
      manifest,
    );
  }
  return projectFiles;
}
function blobRecordForIndex(name: string, record: Files.StorageRecord) {
  if (record.store !== "blob" || record.id === undefined) {
    return null;
  }
  return {
    name: name,
    blob: record.id,
    size: record.bytes,
    type: record.type,
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
  };
}
function assetPathGroup(path: string) {
  if (!path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)) {
    return null;
  }
  let relativePath = path.slice(DESIGN_SYSTEM_PATHS.assetsDir.length),
    separator = relativePath.indexOf("/");
  if (separator <= 0) {
    return null;
  }
  let group = relativePath.slice(0, separator);
  if (isAssetGroupName(group)) {
    return {
      group: group,
      rel: relativePath.slice(separator + 1),
    };
  } else {
    return null;
  }
}
function assetFileIndexAddress(path: string) {
  let address = assetPathGroup(path),
    key = encodeFileIndexKey(address !== null ? address.rel : path);
  if (!isSafeFileIndexKey(key)) {
    return null;
  }
  if (address === null) {
    return {
      group: null,
      key: key,
    };
  }
  let groupKey = encodeFileIndexKey(address.group);
  if (isSafeFileIndexKey(groupKey)) {
    return {
      group: groupKey,
      key: key,
    };
  } else {
    return null;
  }
}
function buildFilesIndex(
  title: string,
  files: Files.FileTable,
  previousIndex: Files.FilesIndex = createEmptyFilesIndex(),
) {
  let manifest: StoredIndexMetadata = makeStoredSystemMetadata(
      title,
      files,
    ) as unknown as StoredIndexMetadata,
    storage = reconcileStorageCatalog(
      files,
      storageCatalogFromManifest(
        files[DESIGN_SYSTEM_PATHS.manifest] ?? "",
      ),
    ),
    assetGroups: Record<string, Files.FilesIndexAssetGroup> = {},
    groupOrder: string[] = [],
    ensureGroup = (groupName: string) => {
      let value = encodeFileIndexKey(groupName);
      if (!isSafeFileIndexKey(value)) {
        return null;
      }
      if (!Object.hasOwn(assetGroups, value)) {
        assetGroups[value] = {
          name: groupName,
          order: [],
          files: {},
        };
      }
      return assetGroups[value];
    };
  for (let value of manifest.assetGroups ?? []) {
    let group = ensureGroup(value.name);
    if (group === null) {
      continue;
    }
    if (!groupOrder.includes(encodeFileIndexKey(value.name))) {
      groupOrder.push(encodeFileIndexKey(value.name));
    }
    if (
      value.tile !== undefined &&
      isAssetTileSize(value.tile)
    ) {
      group.tile = value.tile as Files.AssetTileSize;
    }
    if (value.order !== undefined) {
      group.order = [...value.order];
    }
  }
  let blobs: Record<string, Files.IndexBlobRecord> = {};
  for (let value of Object.keys(storage.files).sort()) {
    if (classifyFileStorage(value, files[value] ?? "").to !== "record") {
      continue;
    }
    let assetGroup = assetPathGroup(value),
      blobRecord = blobRecordForIndex(
        assetGroup !== null ? assetGroup.rel : value,
        storage.files[value],
      );
    if (blobRecord === null) {
      continue;
    }
    let groupRecord = assetGroup !== null ? ensureGroup(assetGroup.group) : null,
      blobKey = encodeFileIndexKey(blobRecord.name);
    if (!isSafeFileIndexKey(blobKey)) {
      continue;
    }
    if (groupRecord !== null) {
      groupRecord.files[blobKey] = blobRecord;
    } else {
      blobs[blobKey] = blobRecord;
    }
  }
  let sections: Record<string, string> = {};
  for (let [value, sectionContent] of Object.entries(manifest.sections ?? {})) {
    if (isSafeFileIndexKey(encodeFileIndexKey(value))) {
      sections[encodeFileIndexKey(value)] = sectionContent;
    }
  }
  let docs = Object.keys(files)
      .filter(
        (filePath) =>
          isAdditionalMarkdownPath(filePath) &&
          classifyFileStorage(filePath, files[filePath]).to === "file" &&
          isProjectContentPath(projectFilePath(filePath)) &&
          unpublishableFileReason(filePath, files[filePath]) === null,
      )
      .sort(),
    index: Files.FilesIndex = {
      ...previousIndex,
      v: FILES_INDEX_VERSION,
      layout: "files",
      title: title,
      libraries: manifest.libraries ?? [],
      sections: sections,
      groups: groupOrder,
      assetGroups: assetGroups,
      blobs: blobs,
      docs: {
        ...(Object.hasOwn(files, DESIGN_SYSTEM_PATHS.readme) &&
        unpublishableFileReason(
          DESIGN_SYSTEM_PATHS.readme,
          files[DESIGN_SYSTEM_PATHS.readme],
        ) === null
          ? {
              readme: projectFilePath(DESIGN_SYSTEM_PATHS.readme),
            }
          : {}),
        sections: docs.map(projectFilePath),
      },
    };
  if (manifest.namespace !== undefined) {
    index.namespace = manifest.namespace;
  } else {
    delete index.namespace;
  }
  return index;
}
function publishableProjectFiles(files: Files.FileTable) {
  let projectFiles: Map<string, string> = new Map();
  for (let value of Object.keys(files)) {
    let fileContent = files[value];
    if (
      classifyFileStorage(value, fileContent).to !== "file" ||
      !isProjectContentPath(projectFilePath(value)) ||
      unpublishableFileReason(value, fileContent) !== null
    ) {
      continue;
    }
    if (
      !isTextFilePath(value) &&
      decodeFileDataUrl(fileContent) === null
    ) {
      continue;
    }
    projectFiles.set(projectFilePath(value), fileContent);
  }
  return projectFiles;
}
function filesLeftOutOfMigration(files: Files.FileTable) {
  let leftOut = [];
  for (let value of Object.keys(files).sort()) {
    let fileContent = files[value],
      storageClassification = classifyFileStorage(value, fileContent);
    if (
      storageClassification.to === "derived" &&
      value !== DESIGN_SYSTEM_PATHS.manifest
    ) {
      leftOut.push({
        path: value,
        reason:
          "it only points at a file kept somewhere else, and that file is not here; add the file itself",
      });
      continue;
    }
    if (
      storageClassification.to === "file" &&
      RESERVED_MIGRATION_FILE_NAMES.includes(value)
    ) {
      leftOut.push({
        path: value,
        reason:
          "this name is used by the page itself; rename this one to bring it over",
      });
      continue;
    }
    if (
      storageClassification.to !== "file" ||
      !isProjectContentPath(projectFilePath(value))
    ) {
      continue;
    }
    let unpublishableReason =
      unpublishableFileReason(value, fileContent) ??
      (!isTextFilePath(value) &&
      decodeFileDataUrl(fileContent) === null
        ? uiMessage("design-system.filesIndex.itsContentsCouldNotBe")
        : null);
    if (unpublishableReason !== null) {
      leftOut.push({
        path: value,
        reason: unpublishableReason,
      });
    }
  }
  return leftOut;
}
function parseIndexBlobRecord(indexRecord: unknown) {
  if (
    !isFilesIndexObject(indexRecord) ||
    typeof indexRecord.name !== "string" ||
    typeof indexRecord.blob !== "string" ||
    indexRecord.blob === ""
  ) {
    return null;
  }
  let record: Files.StorageRecord & {
    store: "blob";
    id: string;
  } = {
    store: "blob",
    id: indexRecord.blob,
    bytes:
      typeof indexRecord.size === "number" && indexRecord.size >= 0
        ? Math.floor(indexRecord.size)
        : 0,
    type: typeof indexRecord.type === "string" ? indexRecord.type : "",
  };
  if (typeof indexRecord.sha256 === "string") {
    record.sha256 = indexRecord.sha256;
  }
  if (typeof indexRecord.storedSha256 === "string") {
    record.storedSha256 = indexRecord.storedSha256;
  }
  return {
    name: indexRecord.name,
    rec: record,
  };
}
function restoreFilesFromIndex(
  index: Files.FilesIndex,
  projectFiles: ReadonlyMap<string, string>,
): RestoredIndexedFiles {
  let files: Record<string, string> = {};
  for (let [value, fileContent] of projectFiles) {
    if (!isProjectContentPath(value)) {
      continue;
    }
    files[relativeProjectFilePath(value)!] = fileContent;
  }
  let storageRecords: Record<string, Files.StorageRecord> = {},
    appendBlobFile = (filePath: string, storageRecord: Files.StorageRecord): void => {
      if (
        !isValidDesignSystemPath(filePath) ||
        Object.hasOwn(files, filePath)
      ) {
        return;
      }
      if (storageRecord.type === "") {
        storageRecord.type = mimeTypeForPath(filePath);
      }
      let value = blobPointer(storageRecord.id!);
      if (storagePointerForFile(filePath, value) === null) {
        return;
      }
      files[filePath] = value;
      storageRecords[filePath] = storageRecord;
    },
    assetGroups: {
      name: string;
      tile?: Files.AssetTileSize;
      order?: string[];
    }[] = [],
    indexAssetGroups: Record<string, Files.FilesIndexAssetGroup> =
      isFilesIndexObject(index.assetGroups) ? index.assetGroups : {},
    groupOrder = [
      ...(Array.isArray(index.groups)
        ? index.groups.filter((groupName): boolean => typeof groupName === "string")
        : []),
      ...Object.keys(indexAssetGroups).sort(),
    ],
    seenGroups: Set<string> = new Set();
  for (let value of groupOrder) {
    let assetGroup = indexAssetGroups[value];
    if (seenGroups.has(value) || !isFilesIndexObject(assetGroup)) {
      continue;
    }
    seenGroups.add(value);
    let assetGroupName =
      typeof assetGroup.name === "string"
        ? assetGroup.name
        : decodeFileIndexKey(value);
    if (!isAssetGroupName(assetGroupName)) {
      continue;
    }
    let order = Array.isArray(assetGroup.order)
      ? assetGroup.order.filter((filePath): boolean => typeof filePath === "string")
      : [];
    assetGroups.push({
      name: assetGroupName,
      ...(isAssetTileSize(assetGroup.tile)
        ? {
            tile: assetGroup.tile,
          }
        : {}),
      ...(order.length > 0
        ? {
            order: order,
          }
        : {}),
    });
    for (let blob of Object.values(
      isFilesIndexObject(assetGroup.files) ? assetGroup.files : {},
    )) {
      let blobRecord = parseIndexBlobRecord(blob);
      if (blobRecord !== null) {
        appendBlobFile(
          DESIGN_SYSTEM_PATHS.assetsDir + assetGroupName + "/" + blobRecord.name,
          blobRecord.rec,
        );
      }
    }
  }
  for (let value of Object.values(
    isFilesIndexObject(index.blobs) ? index.blobs : {},
  )) {
    let blobRecord = parseIndexBlobRecord(value);
    if (blobRecord !== null) {
      appendBlobFile(blobRecord.name, blobRecord.rec);
    }
  }
  let sections: Record<string, string> = {};
  for (let [value, sectionValue] of Object.entries(
    isFilesIndexObject(index.sections) ? index.sections : {},
  )) {
    if (typeof sectionValue === "string") {
      sections[decodeFileIndexKey(value)] = sectionValue;
    }
  }
  let title = typeof index.title === "string" ? index.title : "",
    storage = serializeStorageCatalog({
      files: storageRecords,
    });
  files[DESIGN_SYSTEM_PATHS.manifest] = stringifyManifestWithinBudget({
    manifestVersion: 3,
    name: title,
    namespace: typeof index.namespace === "string" ? index.namespace : null,
    ...(Array.isArray(index.libraries) && index.libraries.length > 0
      ? {
          libraries: index.libraries,
        }
      : {}),
    assetGroups: assetGroups,
    ...(storage !== undefined
      ? {
          storage: storage,
        }
      : {}),
    ...(Object.keys(sections).length > 0
      ? {
          sections: sections,
        }
      : {}),
  });
  files[DESIGN_SYSTEM_PATHS.manifest] = stringifyManifestWithinBudget(
    buildDesignSystemManifest(
      parsedDesignSystem({
        v: 2,
        files: {
          ...files,
        },
      }),
      title,
    ),
  );
  let sortedFiles = Object.fromEntries(
    Object.keys(files)
      .sort()
      .map((filePath) => [filePath, files[filePath]]),
  );
  return {
    title: title,
    content: {
      v: 2,
      files: Object.freeze(sortedFiles),
    },
  };
}
export {
  archiveFileMimeType,
  asciiCharacterCodes,
  assetFileIndexAddress,
  assetPathGroup,
  blobFilesOwedToFileStorage,
  blobRecordForIndex,
  buildFilesIndex,
  bytesMatchAt,
  classifyFileStorage,
  CONVERTED_FROM_FIELD,
  CREATED_ON_FILES_FIELD,
  createEmptyFilesIndex,
  damagedDerivedProjectPaths,
  decodeCleanUtf8,
  decodeFileDataUrl,
  decodeFileIndexKey,
  DEFAULT_FILE_STORAGE_POLICY,
  derivedProjectFiles,
  detectNonCodeText,
  encodeFileIndexKey,
  explainUnpublishableFile,
  FILE_INDEX_KEY_SAFE_CHARACTER,
  fileIndexDecoder,
  fileIndexEncoder,
  FILES_INDEX_MERGE_SCHEMA,
  FILES_INDEX_NAME,
  FILES_INDEX_PATH,
  FILES_INDEX_PROJECT_PATH,
  FILES_INDEX_VERSION,
  filesLeftOutOfMigration,
  hasDamagedUnicode,
  hasFilesMigrationMarker,
  hasValidSvgRoot,
  isCleanUtf8DataUrl,
  isDerivedProjectPath,
  isFilesIndex,
  isFilesIndexObject,
  isProjectContentPath,
  isPublishableSvgText,
  isRepairableDamagedText,
  isSafeFileIndexKey,
  isTextMimeType,
  isUnsupportedBinaryFile,
  isXmlWhitespace,
  lottieDataUrlMimeType,
  parseFilesIndex,
  parseIndexBlobRecord,
  PROJECT_FILE_PREFIXEditorFilesIndex,
  projectFilePath,
  projectFilesForSave,
  PUBLISHABLE_MIME_TYPES,
  publishableFileMimeType,
  publishableProjectFiles,
  reactFontFaces,
  readDataUrlSignature,
  readTreeIndex,
  relativeProjectFilePath,
  RESERVED_MIGRATION_FILE_NAMES,
  RESERVED_XML_NAMESPACES,
  restoreFilesFromIndex,
  SVG_ATTRIBUTE_PATTERN,
  SVG_DOCTYPE_PATTERN,
  SVG_XML_DECLARATION_PATTERN,
  TEXT_MIME_TYPES,
  TREE_INDEX_FIELD,
  unpublishableFileReason,
  validDerivedProjectFiles,
};
export function installEditorFilesIndex(): () => void {
  return () => {
    reactFontFaces = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    FILES_INDEX_PROJECT_PATH = "project/design-system.json";
    FILES_INDEX_NAME = "design-system.json";
    FILES_INDEX_PATH = FILES_INDEX_PROJECT_PATH;
    RESERVED_MIGRATION_FILE_NAMES = [
      "migration.json",
      "design-system.before-files.json",
      "publish-progress.json",
      "migration-map.json",
    ];
    PROJECT_FILE_PREFIXEditorFilesIndex = "project/";
    FILES_INDEX_VERSION = 3;
    projectFilePath = (path: string): string =>
      PROJECT_FILE_PREFIXEditorFilesIndex + path;
    relativeProjectFilePath = (path: string) => {
      if (!path.startsWith(PROJECT_FILE_PREFIXEditorFilesIndex)) {
        return;
      }
      let value = path.slice(PROJECT_FILE_PREFIXEditorFilesIndex.length);
      if (
        path === FILES_INDEX_PROJECT_PATH ||
        RESERVED_MIGRATION_FILE_NAMES.includes(value)
      ) {
        return undefined;
      } else {
        return value;
      }
    };
    DEFAULT_FILE_STORAGE_POLICY = {
      readme: "file",
      doc: "file",
      tokens: "file",
      manifest: "file",
      bundleJs: "file",
      bundleCss: "file",
      dts: "file",
      preview: "file",
      componentReadme: "file",
      componentSource: "file",
      componentLib: "file",
      componentOther: "file",
      other: "file",
      font: "file",
      asset: "blob",
    };
    fileIndexEncoder = new TextEncoder();
    fileIndexDecoder = new TextDecoder();
    FILE_INDEX_KEY_SAFE_CHARACTER = /[A-Za-z0-9_.\/-]/;
    isSafeFileIndexKey = (key: string) =>
      key !== "" && !RESERVED_PROTOTYPE_NAMES.has(key);
    CONVERTED_FROM_FIELD = "convertedFrom";
    CREATED_ON_FILES_FIELD = "createdOnFiles";
    createEmptyFilesIndex = () => ({
      v: FILES_INDEX_VERSION,
      layout: "files",
      title: "",
      libraries: [],
      sections: {},
      groups: [],
      assetGroups: {},
      blobs: {},
      docs: {
        sections: [],
      },
    });
    FILES_INDEX_MERGE_SCHEMA = {
      kind: "map",
      keys: {
        libraries: {
          kind: "leaf",
        },
        sections: {
          kind: "map",
          of: {
            kind: "leaf",
          },
        },
        groups: {
          kind: "list",
          membersOf: "assetGroups",
        },
        assetGroups: {
          kind: "map",
          of: {
            kind: "map",
            keys: {
              order: {
                kind: "list",
              },
              files: {
                kind: "map",
                of: {
                  kind: "map",
                  of: {
                    kind: "leaf",
                  },
                },
              },
            },
          },
        },
        blobs: {
          kind: "map",
          of: {
            kind: "map",
            of: {
              kind: "leaf",
            },
          },
        },
        docs: {
          kind: "map",
          keys: {
            sections: {
              kind: "list",
            },
          },
        },
        source: {
          kind: "leaf",
        },
        upgraded: {
          kind: "leaf",
        },
        convertedFrom: {
          kind: "leaf",
        },
        createdOnFiles: {
          kind: "leaf",
        },
      },
    };
    isFilesIndexObject = (candidate: unknown): candidate is Record<string, unknown> =>
      typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
    TREE_INDEX_FIELD = "treeIndex";
    PUBLISHABLE_MIME_TYPES = new Set([
      "text/html",
      "text/css",
      "text/plain",
      "text/markdown",
      "text/csv",
      "text/javascript",
      "application/javascript",
      "application/json",
      "application/manifest+json",
      "application/xml",
      "text/xml",
      "application/wasm",
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
      "image/avif",
      "image/x-icon",
      "image/vnd.microsoft.icon",
      "font/woff",
      "font/woff2",
      "font/ttf",
      "font/otf",
      "application/font-woff",
      "application/font-woff2",
      "audio/mpeg",
      "audio/ogg",
      "audio/wav",
      "audio/webm",
      "video/mp4",
      "video/webm",
      "video/ogg",
      "application/pdf",
      "application/zip+dotlottie",
    ]);
    TEXT_MIME_TYPES = new Set([
      "text/html",
      "text/css",
      "text/plain",
      "text/markdown",
      "text/csv",
      "text/javascript",
      "application/javascript",
      "application/json",
      "application/manifest+json",
      "application/xml",
      "text/xml",
      "image/svg+xml",
    ]);
    isTextMimeType = (mimeType: string) => TEXT_MIME_TYPES.has(mimeType);
    SVG_XML_DECLARATION_PATTERN =
      /<\?xml[ \t\r\n]+version[ \t\r\n]*=[ \t\r\n]*(?:"1\.0"|'1\.0')(?:[ \t\r\n]+encoding[ \t\r\n]*=[ \t\r\n]*(?:"[Uu][Tt][Ff]-8"|'[Uu][Tt][Ff]-8'))?(?:[ \t\r\n]+standalone[ \t\r\n]*=[ \t\r\n]*(?:"yes"|'yes'|"no"|'no'))?[ \t\r\n]*\?>/y;
    SVG_DOCTYPE_PATTERN =
      /<!DOCTYPE[ \t\r\n]+svg(?:[ \t\r\n]+(?:SYSTEM[ \t\r\n]+(?:"[^"<>[]*"|'[^'<>[]*')|PUBLIC[ \t\r\n]+(?:"[ \r\na-zA-Z0-9'()+,./:=?;!*#@$_%-]*"|'[ \r\na-zA-Z0-9()+,./:=?;!*#@$_%-]*')[ \t\r\n]+(?:"[^"<>[]*"|'[^'<>[]*')))?[ \t\r\n]*>/y;
    SVG_ATTRIBUTE_PATTERN =
      /([A-Za-z_][-A-Za-z0-9_.]*)(?::([A-Za-z_][-A-Za-z0-9_.]*))?[ \t\r\n]*=[ \t\r\n]*(?:"([^"<&]*)"|'([^'<&]*)')/y;
    RESERVED_XML_NAMESPACES = [
      "http://www.w3.org/XML/1998/namespace",
      "http://www.w3.org/2000/xmlns/",
    ];
    isXmlWhitespace = (character: string | undefined) =>
      character === " " ||
      character === "\t" ||
      character === "\r" ||
      character ===
        `
`;
    asciiCharacterCodes = (text: string) =>
      [...text].map((character) => character.charCodeAt(0));
    bytesMatchAt = (
      bytes: Uint8Array<ArrayBufferLike>,
      offset: number,
      signature: readonly number[],
    ) =>
      offset >= 0 &&
      offset + signature.length <= bytes.length &&
      signature.every(
        (expectedByte, byteOffset): boolean => bytes[offset + byteOffset] === expectedByte,
      );
    unpublishableFileReason = (path: string, contents: string | undefined) =>
      explainUnpublishableFile(path, contents)?.why ?? null;
  };
}
