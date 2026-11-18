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
  input: Storage.DatabaseRecord,
): Storage.RemoteFileRecord | null {
  let id = blobIdFromReference(
    stringOrUndefined(input.dataRef) ?? "",
  );
  if (id === null || isPendingBlobId(id)) {
    return null;
  }
  let contentType = stringOrUndefined(input.contentType),
    sha2562 = stringOrUndefined(input.sha256),
    storedSha256 = stringOrUndefined(input.storedSha256);
  return makeRemoteFileRecord(
    path,
    blobAbsoluteUrl(id),
    {
      bytes:
        typeof input.dataBytes === "number" && input.dataBytes >= 0
          ? Math.floor(input.dataBytes)
          : 0,
      contentType:
        contentType !== undefined &&
        REMOTE_FILE_MIME_TYPE_PATTERN.test(contentType)
          ? contentType
          : undefined,
      sha256:
        sha2562 !== undefined && REMOTE_FILE_SHA256_PATTERN.test(sha2562)
          ? sha2562.toLowerCase()
          : undefined,
      storedSha256:
        storedSha256 !== undefined &&
        REMOTE_FILE_SHA256_PATTERN.test(storedSha256)
          ? storedSha256.toLowerCase()
          : undefined,
      name: safeBoundedRemoteFileText(input.name, 200),
      addedAt: safeBoundedRemoteFileText(input.addedAt, 40),
      via: safeBoundedRemoteFileText(input.via, 120),
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
  input: unknown,
): Storage.StoredSystemMetadata | null {
  if (input === undefined || !isStoredDocumentObject(input)) {
    return null;
  }
  let metadata: Storage.StoredSystemMetadata = {
    v: 1,
    title: stringOrUndefined(input.title) ?? "",
  };
  if (
    typeof input.namespace === "string" &&
    WINDOW_NAMESPACE_PATTERN.test(input.namespace)
  ) {
    metadata.namespace = input.namespace;
  }
  if (Array.isArray(input.libraries)) {
    metadata.libraries = input.libraries;
  }
  if (Array.isArray(input.assetGroups)) {
    metadata.assetGroups = input.assetGroups;
  }
  if (isStoredDocumentObject(input.sections)) {
    metadata.sections = input.sections;
  }
  if (isStoredDocumentObject(input.lastChange)) {
    metadata.lastChange = input.lastChange;
  }
  if (
    isStoredDocumentObject(input.convertedFrom) &&
    typeof input.convertedFrom.at === "string"
  ) {
    metadata.convertedFrom = input.convertedFrom as Storage.TimestampMetadata;
  }
  if (
    isStoredDocumentObject(input.snapshot) &&
    typeof input.snapshot.at === "string"
  ) {
    metadata.snapshot = input.snapshot as Storage.TimestampMetadata;
  }
  if (Array.isArray(input.carried)) {
    metadata.carried = input.carried
      .slice(0, MAX_CARRIED_FILES_METADATA)
      .flatMap((input2: unknown): Storage.CarriedFile[] => {
        if (!isStoredDocumentObject(input2)) {
          return [];
        }
        let value = safeBoundedRemoteFileText(input2.path, 300),
          value2 = safeBoundedRemoteFileText(input2.reason, 400);
        if (
          value === undefined ||
          value2 === undefined ||
          typeof input2.form !== "string" ||
          !CARRIED_FILE_FORMS.includes(
            input2.form as Storage.CarriedForm,
          )
        ) {
          return [];
        }
        return [
          {
            path: value,
            reason: value2,
            form: input2.form as Storage.CarriedForm,
            ...(Array.isArray(input2.referrers)
              ? {
                  referrers: input2.referrers
                    .map((input3: unknown) =>
                      safeBoundedRemoteFileText(input3, 300),
                    )
                    .filter(
                      (input3: string | undefined): input3 is string =>
                        input3 !== undefined,
                    )
                    .slice(0, MAX_CARRIED_FILE_REFERRERS),
                }
              : {}),
          },
        ];
      });
  }
  if (typeof input.carriedMore === "number" && input.carriedMore > 0) {
    metadata.carriedMore = Math.floor(input.carriedMore);
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
  for (let [value, value2] of documents) {
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
    if (!isStoredDocumentObject(value2)) {
      hidden++;
      continue;
    }
    let value3 = validatedFilePathForDocument(value, value2);
    if (value3 === null) {
      hidden++;
      continue;
    }
    if (
      value3 === GENERATED_TOKENS_CSS_PATH ||
      isGeneratedApiPath(value3)
    ) {
      continue;
    }
    let value4 =
      stringOrUndefined(value2.dataRef) !== undefined
        ? parseRemoteFileRecord(value3, value2)
        : null;
    if (value === SYSTEM_TOKENS_DOCUMENT_PATH) {
      files[value3] =
        JSON.stringify(value2, null, 2) +
        `
`;
    } else if (
      value3 === DESIGN_SYSTEM_PATHS.tokens &&
      Object.hasOwn(files, value3)
    ) {
      continue;
    } else if (value4 !== null && canUseStoragePointer(value3)) {
      files[value3] = blobPointer(
        blobIdFromReference(value4.dataRef)!,
      );
      storageFiles[value3] = storageRecordFromRemoteFile(value4);
    } else if (value4 !== null) {
      remoteText.set(value3, value4);
    } else if (typeof value2.data === "string") {
      files[value3] =
        value3 === DESIGN_SYSTEM_PATHS.readme
          ? stripGeneratedReadmeTail(value2.data)
          : value2.data;
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
        .map((input: string): [string, string] => [input, files[input]]),
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
  for (let [value, value2] of remoteText) {
    if (system.remoteText.has(value)) {
      files[value] =
        value === DESIGN_SYSTEM_PATHS.readme
          ? stripGeneratedReadmeTail(value2)
          : value2;
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
        .map((input: string): [string, string] => [input, files[input]]),
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
    path.split("/").some((input: string) => input !== "" && input !== ".")
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
  let addReference = (input: RegExpMatchArray): void => {
    let value = (input[1] ?? input[2] ?? input[3] ?? "").trim();
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
          (input: string): boolean =>
            documentCollectionPath(input) === items,
        )
        .map((input: string) => input.slice(items.length + 1))
        .sort(),
    blobIdForPath = (input: string) =>
      blobIdFromReference(
        remoteFileRecordAtPath(documents, input)?.dataRef ?? "",
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
      (input: string) =>
        stringOrUndefined(
          documents.get(COMPONENTS_COLLECTION + "/" + input)?.path,
        ) ?? "",
    )
    .filter((input: string) =>
      input.startsWith(DESIGN_SYSTEM_PATHS.libDir),
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
    let value2 =
      stringOrUndefined(
        documents.get(FONTS_COLLECTION + "/" + value)?.path,
      ) ?? "";
    if (blobIdForPath(value2) === null) {
      continue;
    }
    let value3 = fonts.find(
      (input: Model.FontFace): boolean => input.file === value2,
    );
    rows.push(
      "| " +
        (value3 !== undefined
          ? sanitizeStoredReadmeCell(
              value3.family +
                (value3.style !== "normal" ? " " + value3.style : ""),
            ) + " — "
          : "") +
        storedReadmeCodeSpan(value2) +
        " | " +
        storedReadmeCodeSpan(blobIdForPath(value2)!) +
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
        .flatMap((input) => input.paths)
        .filter(
          (input: string): boolean =>
            documentCollectionPath(
              rawDocumentPathForFile(input),
            ) === FILES_COLLECTION,
        ).length;
  for (let [value, value2] of plan.docs) {
    if (
      documentCollectionPath(value) === FILES_COLLECTION
    ) {
      collectionBytes += estimateEmbeddedJsonBytes(
        value === readmePath ? updatedRecord : value2,
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
    stringOrUndefined = (input: unknown) =>
      typeof input === "string" ? input : undefined;
    isStoredDocumentObject = (
      input: unknown,
    ): input is Storage.DatabaseRecord =>
      typeof input === "object" && input !== null && !Array.isArray(input);
    REMOTE_FILE_MIME_TYPE_PATTERN =
      /^[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}\/[A-Za-z0-9][A-Za-z0-9!#$&^_.+-]{0,126}$/;
    REMOTE_FILE_SHA256_PATTERN = /^[0-9a-f]{64}$/i;
    safeBoundedRemoteFileText = (items: unknown, options: number) =>
      typeof items === "string" &&
      items.length <= options &&
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
    sanitizeStoredReadmeCell = (input: string) =>
      input.replace(/[|\r\n]+/g, " ").trim();
    STORED_README_CODE_DELIMITER = "`";
    storedReadmeCodeSpan = (input: string): string =>
      STORED_README_CODE_DELIMITER +
      sanitizeStoredReadmeCell(input).replaceAll(
        STORED_README_CODE_DELIMITER,
        "",
      ) +
      STORED_README_CODE_DELIMITER;
    STORED_FILES_GUIDANCE_HEADING =
      "**Where these live (this artifact’s store):**";
  };
}
