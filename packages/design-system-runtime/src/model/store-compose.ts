import type * as Storage from "../contracts/model-storage";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { buildDesignSystemManifest, parsedDesignSystem, stringifyManifestWithinBudget } from "./derive-system";
import { generatedReadmeTailOffset, stripGeneratedReadmeTail } from "./documentation";
import { blobPointer, canUseStoragePointer, DESIGN_SYSTEM_PATHS, GENERATED_TOKENS_CSS_PATH, isGeneratedApiPath, isValidDesignSystemPath, mimeTypeForPath, pathDirname, WINDOW_NAMESPACE_PATTERN } from "./file-policy";
import { classifyDesignSystemFile, normalizeDesignSystemPath } from "./file-table";
import { estimateEmbeddedJsonBytes } from "./record-codec";
import { serializeStorageCatalog } from "./storage";
import { documentCollectionPath, MAX_CARRIED_FILE_REFERRERS } from "./store-conversion";
import { API_COLLECTION, ASSETS_COLLECTION, blobAbsoluteUrl, blobIdFromReference, CARRIED_FILE_FORMS, COMPONENTS_COLLECTION, DESIGN_SYSTEM_COLLECTIONS, documentPathForFile, encodeDocumentId, FILES_COLLECTION, FONTS_COLLECTION, isPendingBlobId, makeRemoteFileRecord, MAX_CARRIED_FILES_METADATA, MAX_SYNC_COLLECTION_BYTES, MAX_SYNC_DOCUMENT_BYTES, PREVIEWS_COLLECTION, RAW_TOKENS_DOCUMENT_PATH, rawDocumentPathForFile, SYSTEM_COLLECTION, SYSTEM_META_DOCUMENT_PATH, SYSTEM_SOURCE_DOCUMENT_PATH, SYSTEM_TOKENS_DOCUMENT_PATH, SYSTEM_UPGRADED_DOCUMENT_PATH, TOKENS_DOCUMENT_ID, validatedFilePathForDocument } from "./stored-file-codec";
import { parseTokens } from "./tokens";

var stringOrUndefined: (input: unknown) => string | undefined;
var isStoredDocumentObject: (
  input: unknown,
) => input is Storage.DatabaseRecord;
var REMOTE_FILE_MIME_TYPE_PATTERN: RegExp;
var REMOTE_FILE_SHA256_PATTERN: RegExp;
var safeBoundedRemoteFileText: (
  input: unknown,
  length: number,
) => string | undefined;
var EXTERNAL_URL_SCHEME_PATTERN: RegExp;
var HTML_FILE_REFERENCE_PATTERN: RegExp;
var CSS_FILE_REFERENCE_PATTERN: RegExp;
var MARKDOWN_IMAGE_REFERENCE_PATTERN: RegExp;
var sanitizeStoredReadmeCell: (input: string) => string;
var STORED_README_CODE_DELIMITER: string;
var storedReadmeCodeSpan: (input: string) => string;
var STORED_FILES_GUIDANCE_HEADING: string;
function parseRemoteFileRecord(
  path: string,
  record: Storage.DatabaseRecord,
): Storage.RemoteFileRecord | null {
  let id = blobIdFromReference(
    stringOrUndefined(record.dataRef) ?? "",
  );
  if (id === null || isPendingBlobId(id)) {
    return null;
  }
  let contentType = stringOrUndefined(record.contentType),
    sha256 = stringOrUndefined(record.sha256),
    storedSha256 = stringOrUndefined(record.storedSha256);
  return makeRemoteFileRecord(
    path,
    blobAbsoluteUrl(id),
    {
      bytes:
        typeof record.dataBytes === "number" && record.dataBytes >= 0
          ? Math.floor(record.dataBytes)
          : 0,
      contentType:
        contentType !== undefined &&
        REMOTE_FILE_MIME_TYPE_PATTERN.test(contentType)
          ? contentType
          : undefined,
      sha256:
        sha256 !== undefined && REMOTE_FILE_SHA256_PATTERN.test(sha256)
          ? sha256.toLowerCase()
          : undefined,
      storedSha256:
        storedSha256 !== undefined &&
        REMOTE_FILE_SHA256_PATTERN.test(storedSha256)
          ? storedSha256.toLowerCase()
          : undefined,
      name: safeBoundedRemoteFileText(record.name, 200),
      addedAt: safeBoundedRemoteFileText(record.addedAt, 40),
      via: safeBoundedRemoteFileText(record.via, 120),
    },
  );
}
function storageRecordFromRemoteFile(
  remoteRecord: Storage.RemoteFileRecord,
): Model.StorageRecord {
  let storageRecord: Model.StorageRecord = {
    store: "blob",
    id: blobIdFromReference(remoteRecord.dataRef)!,
    bytes: remoteRecord.dataBytes,
    type:
      remoteRecord.contentType ??
      mimeTypeForPath(remoteRecord.path),
  };
  if (remoteRecord.sha256 !== undefined) {
    storageRecord.sha256 = remoteRecord.sha256;
  }
  if (remoteRecord.storedSha256 !== undefined) {
    storageRecord.storedSha256 = remoteRecord.storedSha256;
  }
  if (remoteRecord.name !== undefined) {
    storageRecord.name = remoteRecord.name;
  }
  if (remoteRecord.addedAt !== undefined) {
    storageRecord.addedAt = remoteRecord.addedAt;
  }
  if (remoteRecord.via !== undefined) {
    storageRecord.via = remoteRecord.via;
  }
  return storageRecord;
}
function parseStoredSystemMetadata(
  storedMetadata: unknown,
): Storage.StoredSystemMetadata | null {
  if (storedMetadata === undefined || !isStoredDocumentObject(storedMetadata)) {
    return null;
  }
  let metadata: Storage.StoredSystemMetadata = {
    v: 1,
    title: stringOrUndefined(storedMetadata.title) ?? "",
  };
  if (
    typeof storedMetadata.namespace === "string" &&
    WINDOW_NAMESPACE_PATTERN.test(storedMetadata.namespace)
  ) {
    metadata.namespace = storedMetadata.namespace;
  }
  if (Array.isArray(storedMetadata.libraries)) {
    metadata.libraries = storedMetadata.libraries;
  }
  if (Array.isArray(storedMetadata.assetGroups)) {
    metadata.assetGroups = storedMetadata.assetGroups;
  }
  if (isStoredDocumentObject(storedMetadata.sections)) {
    metadata.sections = storedMetadata.sections;
  }
  if (isStoredDocumentObject(storedMetadata.lastChange)) {
    metadata.lastChange = storedMetadata.lastChange;
  }
  if (
    isStoredDocumentObject(storedMetadata.convertedFrom) &&
    typeof storedMetadata.convertedFrom.at === "string"
  ) {
    metadata.convertedFrom = storedMetadata.convertedFrom as Storage.TimestampMetadata;
  }
  if (
    isStoredDocumentObject(storedMetadata.snapshot) &&
    typeof storedMetadata.snapshot.at === "string"
  ) {
    metadata.snapshot = storedMetadata.snapshot as Storage.TimestampMetadata;
  }
  if (Array.isArray(storedMetadata.carried)) {
    metadata.carried = storedMetadata.carried
      .slice(0, MAX_CARRIED_FILES_METADATA)
      .flatMap((carriedFile: unknown): Storage.CarriedFile[] => {
        if (!isStoredDocumentObject(carriedFile)) {
          return [];
        }
        let value = safeBoundedRemoteFileText(carriedFile.path, 300),
          reason = safeBoundedRemoteFileText(carriedFile.reason, 400);
        if (
          value === undefined ||
          reason === undefined ||
          typeof carriedFile.form !== "string" ||
          !CARRIED_FILE_FORMS.includes(
            carriedFile.form as Storage.CarriedForm,
          )
        ) {
          return [];
        }
        return [
          {
            path: value,
            reason: reason,
            form: carriedFile.form as Storage.CarriedForm,
            ...(Array.isArray(carriedFile.referrers)
              ? {
                  referrers: carriedFile.referrers
                    .map((path: unknown) =>
                      safeBoundedRemoteFileText(path, 300),
                    )
                    .filter(
                      (path: string | undefined): path is string =>
                        path !== undefined,
                    )
                    .slice(0, MAX_CARRIED_FILE_REFERRERS),
                }
              : {}),
          },
        ];
      });
  }
  if (typeof storedMetadata.carriedMore === "number" && storedMetadata.carriedMore > 0) {
    metadata.carriedMore = Math.floor(storedMetadata.carriedMore);
  }
  return metadata;
}
function composeStoredSystemFiles(
  documents: ReadonlyMap<string, Storage.DatabaseRecord>,
): Storage.StoredSystemFiles {
  let meta = parseStoredSystemMetadata(
      documents.get(SYSTEM_META_DOCUMENT_PATH),
    ),
    title = meta?.title ?? "",
    files: Record<string, string> = {},
    storageFiles: Record<string, Model.StorageRecord> = {},
    remoteText = new Map<string, Storage.RemoteFileRecord>(),
    hidden: number = 0;
  for (let [value, document] of documents) {
    if (
      value === SYSTEM_META_DOCUMENT_PATH ||
      value === SYSTEM_SOURCE_DOCUMENT_PATH ||
      value === SYSTEM_UPGRADED_DOCUMENT_PATH ||
      !DESIGN_SYSTEM_COLLECTIONS.includes(
        documentCollectionPath(value),
      )
    ) {
      continue;
    }
    if (!isStoredDocumentObject(document)) {
      hidden++;
      continue;
    }
    let validatedPath = validatedFilePathForDocument(value, document);
    if (validatedPath === null) {
      hidden++;
      continue;
    }
    if (
      validatedPath === GENERATED_TOKENS_CSS_PATH ||
      isGeneratedApiPath(validatedPath)
    ) {
      continue;
    }
    let remoteFile =
      stringOrUndefined(document.dataRef) !== undefined
        ? parseRemoteFileRecord(validatedPath, document)
        : null;
    if (value === SYSTEM_TOKENS_DOCUMENT_PATH) {
      files[validatedPath] =
        JSON.stringify(document, null, 2) +
        `
`;
    } else if (
      validatedPath === DESIGN_SYSTEM_PATHS.tokens &&
      Object.hasOwn(files, validatedPath)
    ) {
      continue;
    } else if (remoteFile !== null && canUseStoragePointer(validatedPath)) {
      files[validatedPath] = blobPointer(
        blobIdFromReference(remoteFile.dataRef)!,
      );
      storageFiles[validatedPath] = storageRecordFromRemoteFile(remoteFile);
    } else if (remoteFile !== null) {
      remoteText.set(validatedPath, remoteFile);
    } else if (typeof document.data === "string") {
      files[validatedPath] =
        validatedPath === DESIGN_SYSTEM_PATHS.readme
          ? stripGeneratedReadmeTail(document.data)
          : document.data;
    } else {
      hidden++;
    }
  }
  let serializedStorage = serializeStorageCatalog({
    files: storageFiles,
  });
  files[DESIGN_SYSTEM_PATHS.manifest] = stringifyManifestWithinBudget({
    manifestVersion: 3,
    name: title,
    namespace: meta?.namespace ?? null,
    ...(meta?.libraries !== undefined
      ? {
          libraries: meta.libraries,
        }
      : {}),
    ...(meta?.lastChange !== undefined
      ? {
          lastChange: meta.lastChange,
        }
      : {}),
    assetGroups: meta?.assetGroups ?? [],
    ...(serializedStorage !== undefined
      ? {
          storage: serializedStorage,
        }
      : {}),
    ...(meta?.sections !== undefined
      ? {
          sections: meta.sections,
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
        .map((path: string): [string, string] => [path, files[path]]),
    ),
    source = documents.get(SYSTEM_SOURCE_DOCUMENT_PATH),
    upgraded = documents.get(SYSTEM_UPGRADED_DOCUMENT_PATH);
  return {
    title: title,
    files: Object.freeze(sortedFiles),
    remoteText: remoteText,
    meta: meta,
    source: isStoredDocumentObject(source) ? source : null,
    upgraded: isStoredDocumentObject(upgraded) ? upgraded : null,
    hidden: hidden,
  };
}
function hydrateStoredSystemText(
  system: Storage.StoredSystemFiles,
  remoteText: ReadonlyMap<string, string>,
): Model.FileTable {
  let files = {
    ...system.files,
  };
  for (let [value, text] of remoteText) {
    if (system.remoteText.has(value)) {
      files[value] =
        value === DESIGN_SYSTEM_PATHS.readme
          ? stripGeneratedReadmeTail(text)
          : text;
    }
  }
  files[DESIGN_SYSTEM_PATHS.manifest] = stringifyManifestWithinBudget(
    buildDesignSystemManifest(
      parsedDesignSystem({
        v: 2,
        files: {
          ...files,
        },
      }),
      system.title,
    ),
  );
  return Object.freeze(
    Object.fromEntries(
      Object.keys(files)
        .sort()
        .map((path: string): [string, string] => [path, files[path]]),
    ),
  );
}
function isLocalFileReference(reference: string): boolean {
  let trimmed = reference.trim();
  return (
    trimmed !== "" &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("#") &&
    !EXTERNAL_URL_SCHEME_PATTERN.test(trimmed)
  );
}
function normalizeLocalFileReference(reference: string): string | null {
  if (!isLocalFileReference(reference)) {
    return null;
  }
  let path = reference.trim().replace(/[?#].*$/, "");
  try {
    path = decodeURIComponent(path);
  } catch {}
  if (
    isLocalFileReference(path) &&
    path.split("/").some((segment: string) => segment !== "" && segment !== ".")
  ) {
    return path;
  } else {
    return null;
  }
}
function resolveLocalFileReference(
  sourcePath: string,
  reference: string,
): string | null {
  let localPath = normalizeLocalFileReference(reference);
  if (localPath === null) {
    return null;
  }
  let segments =
    localPath.startsWith("/") || pathDirname(sourcePath) === ""
      ? []
      : pathDirname(sourcePath).split("/");
  for (let value of localPath.split("/")) {
    if (value === "" || value === ".") {
      continue;
    }
    if (value === "..") {
      if (segments.length === 0) {
        return null;
      }
      segments.pop();
    } else {
      segments.push(value);
    }
  }
  let path = segments.join("/");
  if (isValidDesignSystemPath(path)) {
    return normalizeDesignSystemPath(path);
  } else {
    return null;
  }
}
function componentFileReferences(path: string, content: string): string[] {
  let references: string[] = [],
    kind = classifyDesignSystemFile(path);
  if (kind !== "preview" && kind !== "componentReadme") {
    return references;
  }
  let addReference = (match: RegExpMatchArray): void => {
    let value = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (
      normalizeLocalFileReference(value) !== null &&
      !references.includes(value)
    ) {
      references.push(value);
    }
  };
  if (kind === "componentReadme") {
    for (let value of content.matchAll(MARKDOWN_IMAGE_REFERENCE_PATTERN)) {
      addReference(value);
    }
  }
  for (let value of content.matchAll(HTML_FILE_REFERENCE_PATTERN)) {
    addReference(value);
  }
  for (let value of content.matchAll(CSS_FILE_REFERENCE_PATTERN)) {
    addReference(value);
  }
  return references;
}
function remoteFileRecordAtPath(
  documents: ReadonlyMap<string, Storage.DatabaseRecord>,
  path: string,
): Storage.RemoteFileRecord | null {
  let record = documents.get(documentPathForFile(path));
  if (record === undefined) {
    return null;
  } else {
    return parseRemoteFileRecord(path, record);
  }
}
function generateStoredFilesGuidance(
  documents: ReadonlyMap<string, Storage.DatabaseRecord>,
): string {
  let idsInCollection = (items: string) =>
      [...documents.keys()]
        .filter(
          (path: string): boolean =>
            documentCollectionPath(path) === items,
        )
        .map((path: string) => path.slice(items.length + 1))
        .sort(),
    blobIdForPath = (path: string) =>
      blobIdFromReference(
        remoteFileRecordAtPath(documents, path)?.dataRef ?? "",
      ),
    rawTokensRecord = documents.get(RAW_TOKENS_DOCUMENT_PATH),
    rawTokensId =
      rawTokensRecord === undefined
        ? null
        : blobIdFromReference(
            parseRemoteFileRecord(
              DESIGN_SYSTEM_PATHS.tokens,
              rawTokensRecord,
            )?.dataRef ?? "",
          ),
    rows: string[] = [];
  if (blobIdForPath(DESIGN_SYSTEM_PATHS.readme) !== null) {
    rows.push(
      "| " +
        storedReadmeCodeSpan(DESIGN_SYSTEM_PATHS.readme) +
        " (this README, too large for a document) | " +
        storedReadmeCodeSpan(
          blobIdForPath(DESIGN_SYSTEM_PATHS.readme)!,
        ) +
        " |",
    );
  }
  if (rawTokensId !== null) {
    rows.push(
      "| " +
        storedReadmeCodeSpan(DESIGN_SYSTEM_PATHS.tokens) +
        " (too large for a document) | " +
        storedReadmeCodeSpan(rawTokensId) +
        " |",
    );
  }
  for (let value of [
    DESIGN_SYSTEM_PATHS.bundleJs,
    DESIGN_SYSTEM_PATHS.bundleCss,
    DESIGN_SYSTEM_PATHS.indexDts,
  ]) {
    if (blobIdForPath(value) !== null) {
      rows.push(
        "| " +
          storedReadmeCodeSpan(value) +
          " | " +
          storedReadmeCodeSpan(blobIdForPath(value)!) +
          " |",
      );
    }
  }
  for (let value of idsInCollection(COMPONENTS_COLLECTION)
    .map(
      (componentName: string) =>
        stringOrUndefined(
          documents.get(COMPONENTS_COLLECTION + "/" + componentName)?.path,
        ) ?? "",
    )
    .filter((path: string) =>
      path.startsWith(DESIGN_SYSTEM_PATHS.libDir),
    )
    .sort()) {
    if (blobIdForPath(value) !== null) {
      rows.push(
        "| " +
          storedReadmeCodeSpan(value) +
          " (load before the bundle) | " +
          storedReadmeCodeSpan(blobIdForPath(value)!) +
          " |",
      );
    }
  }
  let tokensRecord = documents.get(SYSTEM_TOKENS_DOCUMENT_PATH),
    fonts =
      tokensRecord === undefined
        ? []
        : parseTokens(tokensRecord).type.fonts;
  for (let value of idsInCollection(FONTS_COLLECTION)) {
    let readmePath =
      stringOrUndefined(
        documents.get(FONTS_COLLECTION + "/" + value)?.path,
      ) ?? "";
    if (blobIdForPath(readmePath) === null) {
      continue;
    }
    let matchingFont = fonts.find(
      (font: Model.FontFace): boolean => font.file === readmePath,
    );
    rows.push(
      "| " +
        (matchingFont !== undefined
          ? sanitizeStoredReadmeCell(
              matchingFont.family +
                (matchingFont.style !== "normal" ? " " + matchingFont.style : ""),
            ) + " — "
          : "") +
        storedReadmeCodeSpan(readmePath) +
        " | " +
        storedReadmeCodeSpan(blobIdForPath(readmePath)!) +
        " |",
    );
  }
  let tokensLocation: string | string | null =
      tokensRecord !== undefined
        ? storedReadmeCodeSpan(DESIGN_SYSTEM_PATHS.tokens) +
          " is " +
          storedReadmeCodeSpan(SYSTEM_COLLECTION) +
          " / " +
          storedReadmeCodeSpan(TOKENS_DOCUMENT_ID) +
          " (the object itself; to hand it to a tool as a file, " +
          storedReadmeCodeSpan("get") +
          " it with " +
          storedReadmeCodeSpan("out_dir") +
          " set to this artifact’s folder in your scratchpad — it lands there as " +
          storedReadmeCodeSpan(
            SYSTEM_COLLECTION +
              "/" +
              TOKENS_DOCUMENT_ID +
              ".json",
          ) +
          ")"
        : rawTokensRecord !== undefined && rawTokensId === null
          ? storedReadmeCodeSpan(DESIGN_SYSTEM_PATHS.tokens) +
            " did not parse as JSON, so only its raw text is kept, at " +
            storedReadmeCodeSpan(FILES_COLLECTION) +
            " / " +
            storedReadmeCodeSpan(
              encodeDocumentId(
                DESIGN_SYSTEM_PATHS.tokens,
              ),
            )
          : null,
    guidance = [
      STORED_FILES_GUIDANCE_HEADING +
        " each file this README names is one document on this same url — the " +
        storedReadmeCodeSpan("ArtifactData") +
        " tool’s " +
        storedReadmeCodeSpan("get") +
        ", or " +
        storedReadmeCodeSpan("list") +
        " for a whole collection (or " +
        storedReadmeCodeSpan("read_db") +
        " on an " +
        storedReadmeCodeSpan("Artifact") +
        " tool that still lists it). A path’s first folder is its collection — " +
        [
          COMPONENTS_COLLECTION,
          ASSETS_COLLECTION,
          FONTS_COLLECTION,
        ]
          .map(storedReadmeCodeSpan)
          .join(", ") +
        ", and " +
        storedReadmeCodeSpan(API_COLLECTION) +
        " for the generated cards the Index lists; a component’s " +
        storedReadmeCodeSpan("preview.html") +
        " is in " +
        storedReadmeCodeSpan(PREVIEWS_COLLECTION) +
        " under the component’s name — and every other path (this README, further sections, " +
        storedReadmeCodeSpan(GENERATED_TOKENS_CSS_PATH) +
        ") is in " +
        storedReadmeCodeSpan(FILES_COLLECTION) +
        ". The " +
        storedReadmeCodeSpan("doc_id") +
        " is the path without that collection folder (the whole path in " +
        storedReadmeCodeSpan(FILES_COLLECTION) +
        '), each "/" written ' +
        storedReadmeCodeSpan("~2f") +
        " (any other byte outside A–Z a–z 0–9 _ . - likewise, " +
        storedReadmeCodeSpan("~") +
        " and two hex digits: a space is " +
        storedReadmeCodeSpan("~20") +
        ") — so " +
        storedReadmeCodeSpan(
          API_COLLECTION + "/components/Button.md",
        ) +
        " is " +
        storedReadmeCodeSpan(API_COLLECTION) +
        " / " +
        storedReadmeCodeSpan("components~2fButton.md") +
        " and this README is " +
        storedReadmeCodeSpan(FILES_COLLECTION) +
        " / " +
        storedReadmeCodeSpan(
          encodeDocumentId(DESIGN_SYSTEM_PATHS.readme),
        ) +
        (tokensLocation !== null ? "; " + tokensLocation : "") +
        ". Not found? " +
        storedReadmeCodeSpan("list") +
        ' that collection. A document with "dataRef" in place of "data" is a stored file: the ' +
        storedReadmeCodeSpan("Artifact") +
        " tool’s " +
        storedReadmeCodeSpan("read") +
        ' with the id after "/_blob/" as ' +
        storedReadmeCodeSpan("path") +
        " (" +
        storedReadmeCodeSpan("read_asset") +
        " on a tool that still lists it)" +
        (rows.length > 0
          ? '; this system’s own are below, as of this README’s last refresh — where a document’s "dataRef" differs, the document is right.'
          : "."),
    ];
  if (rows.length > 0) {
    guidance.push("", "| stored file | id |", "| --- | --- |", ...rows);
  }
  return guidance.join(`
`);
}
function appendStoredFilesGuidance(
  plan: Storage.ConversionPlan,
): Storage.ConversionPlan {
  let readmePath = documentPathForFile(
      DESIGN_SYSTEM_PATHS.readme,
    ),
    record = plan.docs.get(readmePath);
  if (record === undefined || typeof record.data !== "string") {
    return plan;
  }
  let generatedOffset = generatedReadmeTailOffset(record.data);
  if (generatedOffset < 0) {
    return plan;
  }
  let guidanceOffset = record.data.indexOf(
      `
` + STORED_FILES_GUIDANCE_HEADING,
      generatedOffset,
    ),
    withoutGuidance =
      guidanceOffset < 0 ? record.data : record.data.slice(0, guidanceOffset),
    updatedRecord = {
      ...record,
      data:
        withoutGuidance.trimEnd() +
        `

` +
        generateStoredFilesGuidance(plan.docs) +
        `
`,
    },
    collectionBytes =
      512 *
      plan.uploads
        .flatMap((document) => document.paths)
        .filter(
          (path: string): boolean =>
            documentCollectionPath(
              rawDocumentPathForFile(path),
            ) === FILES_COLLECTION,
        ).length;
  for (let [value, documentRecord] of plan.docs) {
    if (
      documentCollectionPath(value) === FILES_COLLECTION
    ) {
      collectionBytes += estimateEmbeddedJsonBytes(
        value === readmePath ? updatedRecord : documentRecord,
      );
    }
  }
  if (
    estimateEmbeddedJsonBytes(updatedRecord) >
      MAX_SYNC_DOCUMENT_BYTES ||
    collectionBytes > MAX_SYNC_COLLECTION_BYTES
  ) {
    if (guidanceOffset < 0) {
      return plan;
    }
    updatedRecord = {
      ...record,
      data: withoutGuidance,
    };
  }
  let documents = new Map(plan.docs);
  documents.set(readmePath, updatedRecord);
  return {
    ...plan,
    docs: documents,
  };
}
export {
  appendStoredFilesGuidance,
  componentFileReferences,
  composeStoredSystemFiles,
  CSS_FILE_REFERENCE_PATTERN,
  EXTERNAL_URL_SCHEME_PATTERN,
  generateStoredFilesGuidance,
  HTML_FILE_REFERENCE_PATTERN,
  hydrateStoredSystemText,
  isLocalFileReference,
  isStoredDocumentObject,
  MARKDOWN_IMAGE_REFERENCE_PATTERN,
  normalizeLocalFileReference,
  parseRemoteFileRecord,
  parseStoredSystemMetadata,
  REMOTE_FILE_MIME_TYPE_PATTERN,
  REMOTE_FILE_SHA256_PATTERN,
  remoteFileRecordAtPath,
  resolveLocalFileReference,
  safeBoundedRemoteFileText,
  sanitizeStoredReadmeCell,
  storageRecordFromRemoteFile,
  STORED_FILES_GUIDANCE_HEADING,
  STORED_README_CODE_DELIMITER,
  storedReadmeCodeSpan,
  stringOrUndefined,
};
export function installModelStoreCompose(): () => void {
  return () => {
    stringOrUndefined = (candidateValue: unknown) =>
      typeof candidateValue === "string" ? candidateValue : undefined;
    isStoredDocumentObject = (
      candidate: unknown,
    ): candidate is Storage.DatabaseRecord =>
      typeof candidate === "object" && candidate !== null && !Array.isArray(candidate);
    REMOTE_FILE_MIME_TYPE_PATTERN =
      /^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}\/[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}$/;
    REMOTE_FILE_SHA256_PATTERN = /^[0-9a-f]{64}$/i;
    safeBoundedRemoteFileText = (items: unknown, maxLength: number) =>
      typeof items === "string" &&
      items.length <= maxLength &&
      !/[\u0000-\u001f\u007f]/.test(items)
        ? items
        : undefined;
    EXTERNAL_URL_SCHEME_PATTERN = /^[a-z][a-z0-9+.-]*:/i;
    HTML_FILE_REFERENCE_PATTERN =
      /\b(?:src|href|poster)\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
    CSS_FILE_REFERENCE_PATTERN =
      /(?:^|[\s:,(])url\(\s*(?:"([^"]*)"|'([^']*)'|([^)"'\s]+))\s*\)/g;
    MARKDOWN_IMAGE_REFERENCE_PATTERN =
      /!\[[^\]]*\]\(\s*<?([^)>\s]+)>?(?:\s+"[^"]*")?\s*\)/g;
    sanitizeStoredReadmeCell = (cell: string) =>
      cell.replace(/[|\r\n]+/g, " ").trim();
    STORED_README_CODE_DELIMITER = "`";
    storedReadmeCodeSpan = (text: string): string =>
      STORED_README_CODE_DELIMITER +
      sanitizeStoredReadmeCell(text).replaceAll(
        STORED_README_CODE_DELIMITER,
        "",
      ) +
      STORED_README_CODE_DELIMITER;
    STORED_FILES_GUIDANCE_HEADING =
      "**Where these live (this artifact’s store):**";
  };
}
