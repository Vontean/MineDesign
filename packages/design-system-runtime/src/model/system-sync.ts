import type * as Storage from "../contracts/model-storage";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { getAssetsCapability } from "../media/assets";
import { stripGeneratedReadmeTail } from "./documentation";
import { DESIGN_SYSTEM_PATHS, GENERATED_TOKENS_CSS_PATH } from "./file-policy";
import { readMovedToMarker } from "./migration-markers";
import { COMMENT_DOCUMENT_PREFIX, composeCommentDocuments, decomposeCommentDocuments, documentRecordsEqual, estimateEmbeddedJsonBytes, jsonValueDepth, MAX_COLLECTION_DOCUMENTS } from "./record-codec";
import { acceptRemoteTextEdit, discardRemoteTextEdit, failedRemoteTextReference, getLocalRemoteTextEdits, getRemoteTextEntries, getRemoteTextProblems, getUploadedRemoteTextEntries, hydratedRemoteTexts, knownUploadForRemoteText, remoteTextEntry, setRemoteTextUploadProblem, setRetainedBlobIdsProvider, synchronizeRemoteTextEntries, uploadEditedRemoteText } from "./remote-text";
import { composeStoredSystemFiles, hydrateStoredSystemText } from "./store-compose";
import { documentCollectionPath, planSystemStoreConversion } from "./store-conversion";
import { API_COLLECTION, blobIdFromReference, DESIGN_SYSTEM_COLLECTIONS, documentPathForFile, generatedReadmeTail, MAX_SYNC_COLLECTION_BYTES, MAX_SYNC_DOCUMENT_BYTES, MAX_SYNC_DOCUMENT_DEPTH, mergeReadmeWithGeneratedTail, SYSTEM_META_DOCUMENT_PATH, SYSTEM_TOKENS_DOCUMENT_PATH } from "./stored-file-codec";

var EMPTY_STORED_SYSTEM_STATUS: Storage.StoredSystemStatus;
var storedSystemStatus: Storage.StoredSystemStatus;
var storedSystemStatusSubscribers: Set<() => void>;
var localSystemMetadataChanges: Partial<Storage.StoredSystemMetadata>;
var currentStoredSystemMetadata: Storage.StoredSystemMetadata | null;
var systemMovedToFiles: boolean;
var storedSystemMigrationFlags: Storage.StoredSystemFlags;
var regenerateStoredDerivedFiles: boolean;
var remoteTextDocumentRecords: Storage.DocumentRecords;
var retainedDerivedSystemDocuments: Storage.RetainedDerivedSystem;
var README_DOCUMENT_PATH: string;
var isDerivedSystemDocument: (path: string) => boolean;
var currentSystemDocumentRecords: Storage.DocumentRecords;
var pendingSystemDocumentRecords: Storage.DocumentRecords;
var hasWindowedSystemCollection: boolean;
var ceilKilobytesString: (bytes: number) => string;
var DESIGN_SYSTEM_DOCUMENT_CODEC: Storage.SystemDocumentCodec;
function reuseStoredDocumentIdentity(
  previous: ReadonlyMap<string, Storage.DatabaseRecord> | undefined,
  path: string,
  record: Storage.DatabaseRecord,
): Storage.DatabaseRecord {
  let existing = previous?.get(path);
  if (existing === undefined) {
    return record;
  }
  if (existing === record) {
    return existing;
  }
  if (typeof record.data === "string") {
    if (
      existing.data === record.data &&
      existing.path === record.path &&
      existing.kind === record.kind
    ) {
      return existing;
    } else {
      return record;
    }
  }
  if (documentRecordsEqual(existing, record)) {
    return existing;
  } else {
    return record;
  }
}
function decomposeDesignSystemDocuments(
  document2: Host.ArtifactEnvelope<Model.DesignSystemContent>,
  previous?: ReadonlyMap<string, Storage.DatabaseRecord>,
  carry?: Storage.SystemCarry,
): Storage.DocumentRecords {
  let files = document2.content.files,
    knownUploads = knownRemoteUploadsForFiles(files),
    regenerate: boolean = regenerateStoredDerivedFiles;
  regenerateStoredDerivedFiles = false;
  let plan = planSystemStoreConversion(document2.title, files, {
      known: knownUploads,
      derived: regenerate,
      ...(carry?.meta !== undefined
        ? {
            meta: carry.meta,
          }
        : {}),
    }),
    documents = new Map<string, Storage.DatabaseRecord>();
  for (let [value, value2] of plan.docs) {
    documents.set(
      value,
      reuseStoredDocumentIdentity(
        previous,
        value,
        value === SYSTEM_META_DOCUMENT_PATH
          ? {
              ...value2,
              ...retainedDerivedSystemDocuments.meta,
              ...localSystemMetadataChanges,
            }
          : value2,
      ),
    );
  }
  let readmeUpload = plan.uploads.some((input) =>
    input.paths.includes(DESIGN_SYSTEM_PATHS.readme),
  );
  if (regenerate) {
    let entry = documents.get(README_DOCUMENT_PATH);
    retainedDerivedSystemDocuments = {
      ...retainedDerivedSystemDocuments,
      derived: new Map(
        [...documents].filter(([input]: [string, Storage.DatabaseRecord]) =>
          isDerivedSystemDocument(input),
        ),
      ),
      readmeTail:
        typeof entry?.data === "string"
          ? generatedReadmeTail(entry.data)
          : readmeUpload
            ? retainedDerivedSystemDocuments.readmeTail
            : "",
    };
  }
  for (let [value, value2] of retainedDerivedSystemDocuments.derived) {
    if (!documents.has(value)) {
      documents.set(
        value,
        reuseStoredDocumentIdentity(previous, value, value2),
      );
    }
  }
  let readmeWithTail = mergeReadmeWithGeneratedTail(
    files[DESIGN_SYSTEM_PATHS.readme] ?? "",
    retainedDerivedSystemDocuments.readmeTail,
  );
  if (
    !readmeUpload &&
    (readmeWithTail !== "" || previous?.has(README_DOCUMENT_PATH) === true)
  ) {
    documents.set(
      README_DOCUMENT_PATH,
      reuseStoredDocumentIdentity(previous, README_DOCUMENT_PATH, {
        path: DESIGN_SYSTEM_PATHS.readme,
        kind: "text",
        data: readmeWithTail,
      }),
    );
  }
  if (readmeUpload) {
    if (previous?.has(README_DOCUMENT_PATH) === true) {
      documents.set(
        README_DOCUMENT_PATH,
        previous.get(README_DOCUMENT_PATH)!,
      );
    }
    let value = remoteTextEntry(
      DESIGN_SYSTEM_PATHS.readme,
    );
    if (
      value === undefined ||
      value.text === undefined ||
      stripGeneratedReadmeTail(value.text) !==
        stripGeneratedReadmeTail(
          files[DESIGN_SYSTEM_PATHS.readme] ?? "",
        )
    ) {
      setRemoteTextUploadProblem(
        DESIGN_SYSTEM_PATHS.readme,
        "is larger than the store keeps a README (" +
          ceilKilobytesString(MAX_SYNC_DOCUMENT_BYTES) +
          " KB); shorten it — this edit is not saved",
      );
    }
  }
  for (let [value, value2] of remoteTextDocumentRecords) {
    if (
      !Object.hasOwn(files, value) ||
      !knownUploads.has(value) ||
      remoteTextEntry(value)?.text === files[value]
    ) {
      documents.set(
        documentPathForFile(value),
        reuseStoredDocumentIdentity(
          previous,
          documentPathForFile(value),
          value2,
        ),
      );
    }
  }
  for (let [value, value2] of getLocalRemoteTextEdits()) {
    if (!Object.hasOwn(files, value) || files[value] !== value2) {
      discardRemoteTextEdit(value);
    } else if (remoteTextEntry(value)?.text === value2) {
      acceptRemoteTextEdit(value);
    }
  }
  for (let value of plan.uploads) {
    for (let value2 of value.paths) {
      if (value2 === DESIGN_SYSTEM_PATHS.readme) {
        continue;
      }
      if (
        !remoteTextDocumentRecords.has(value2) &&
        previous?.has(documentPathForFile(value2)) === true
      ) {
        documents.set(
          documentPathForFile(value2),
          previous.get(documentPathForFile(value2))!,
        );
      }
      getAssetsCapability().then((input) =>
        uploadEditedRemoteText(
          value2,
          files[value2],
          value.contentType,
          input?.upload !== undefined
            ? (input2, options) => input.upload(input2, options)
            : null,
          value.kind === "code" ? undefined : value.bytes,
        ),
      );
    }
  }
  decomposeCommentDocuments(
    document2.comments,
    previous,
    documents,
  );
  pendingSystemDocumentRecords = documents;
  return documents;
}
function knownRemoteUploadsForFiles(
  files: Model.FileTable,
): Map<string, Storage.KnownUpload> {
  let known = new Map<string, Storage.KnownUpload>(),
    byText = knownRemoteUploadsByText();
  for (let value of Object.keys(files)) {
    let value2 = remoteTextEntry(value);
    if (value2 !== undefined && value2.text === files[value]) {
      known.set(value, knownUploadFromRemoteRecord(value2.ptr));
    } else {
      let value3 =
        knownUploadForRemoteText(value, files[value]) ??
        byText.get(files[value]);
      if (value3 !== undefined) {
        known.set(value, value3);
      }
    }
  }
  return known;
}
function knownUploadFromRemoteRecord(
  record: Storage.RemoteFileRecord,
): Storage.KnownUpload {
  return {
    id: record.dataRef.slice(record.dataRef.lastIndexOf("/") + 1),
    bytes: record.dataBytes,
    ...(record.contentType !== undefined
      ? {
          contentType: record.contentType,
        }
      : {}),
    ...(record.sha256 !== undefined
      ? {
          sha256: record.sha256,
        }
      : {}),
  };
}
function knownRemoteUploadsByText(): Map<string, Storage.KnownUpload> {
  let known = new Map<string, Storage.KnownUpload>();
  for (let [, value] of getRemoteTextEntries()) {
    if (value.text !== undefined && !known.has(value.text)) {
      known.set(value.text, knownUploadFromRemoteRecord(value.ptr));
    }
  }
  for (let [, value] of getUploadedRemoteTextEntries()) {
    if (!known.has(value.text)) {
      known.set(value.text, value.known);
    }
  }
  return known;
}
function getStoredSystemStatus(): Storage.StoredSystemStatus {
  return storedSystemStatus;
}
function subscribeStoredSystemStatus(subscriber: () => void): () => void {
  storedSystemStatusSubscribers.add(subscriber);
  return () => storedSystemStatusSubscribers.delete(subscriber);
}
function updateStoredSystemStatus(
  metadata: Storage.StoredSystemMetadata | null,
): void {
  let snapshotAt =
      metadata?.snapshot?.at ?? localSystemMetadataChanges.snapshot?.at,
    status =
      metadata === null
        ? EMPTY_STORED_SYSTEM_STATUS
        : {
            loaded: true,
            carried: metadata.carried ?? [],
            carriedMore: metadata.carriedMore ?? 0,
            ...(metadata.convertedFrom !== undefined
              ? {
                  convertedAt: metadata.convertedFrom.at,
                }
              : {}),
            ...(snapshotAt !== undefined
              ? {
                  snapshotAt: snapshotAt,
                }
              : {}),
            ...storedSystemMigrationFlags,
            ...(systemMovedToFiles
              ? {
                  movedToFiles: true,
                }
              : {}),
          };
  if (JSON.stringify(status) === JSON.stringify(storedSystemStatus)) {
    return;
  }
  storedSystemStatus = status;
  for (let value of storedSystemStatusSubscribers) {
    value();
  }
}
function stampLocalSystemLastChange(
  lastChange: Storage.DatabaseRecord,
): void {
  localSystemMetadataChanges = {
    ...localSystemMetadataChanges,
    lastChange: lastChange,
  };
}
function updateStoredSystemMigrationFlags(system: {
  source?: unknown;
  upgraded?: unknown;
  editing?: unknown;
}): void {
  let source =
      typeof system.source === "object" && system.source !== null
        ? (system.source as Storage.DatabaseRecord)
        : null,
    upgraded =
      (system.upgraded !== undefined && system.upgraded !== null) ||
      (source?.upgradedAt ?? null) !== null;
  storedSystemMigrationFlags = {
    ...(source?.app === "claude-design"
      ? {
          migratedFrom: "claude-design",
        }
      : {}),
    ...(upgraded
      ? {
          upgraded: true,
        }
      : {}),
    ...(isSystemEditingDisabled(system)
      ? {
          editingOff: true,
        }
      : {}),
  };
  updateStoredSystemStatus({
    v: 1,
    title: "",
  });
}
function isSystemEditingDisabled(system: { editing?: unknown }): boolean {
  return system.editing === "off";
}
function requestStoredDerivedRegeneration(): void {
  regenerateStoredDerivedFiles = true;
}
function composeDesignSystemDocuments(
  documents: Storage.DocumentRecords,
  previous?: unknown,
): Storage.ComposedDocument {
  currentSystemDocumentRecords = documents;
  setRetainedBlobIdsProvider(retainedSystemBlobIds);
  hasWindowedSystemCollection ||= hasFullCollectionWindow(documents);
  let composed = composeStoredSystemFiles(documents);
  remoteTextDocumentRecords = new Map(
    [...composed.remoteText.keys()].map(
      (input: string): [string, Storage.DatabaseRecord] => [
        input,
        documents.get(documentPathForFile(input))!,
      ],
    ),
  );
  let readmeRecord = documents.get(README_DOCUMENT_PATH);
  retainedDerivedSystemDocuments = {
    derived: new Map(
      [...documents].filter(
        ([input, input2]: [string, Storage.DatabaseRecord]) =>
          isDerivedSystemDocument(input) && typeof input2.path === "string",
      ),
    ),
    readmeTail:
      typeof readmeRecord?.data === "string"
        ? generatedReadmeTail(readmeRecord.data)
        : "",
    meta: {
      ...(composed.meta?.namespace !== undefined
        ? {
            namespace: composed.meta.namespace,
          }
        : {}),
      ...(composed.meta?.libraries !== undefined
        ? {
            libraries: composed.meta.libraries,
          }
        : {}),
    },
  };
  synchronizeRemoteTextEntries(composed.remoteText);
  let meta = composed.meta;
  currentStoredSystemMetadata = meta;
  systemMovedToFiles =
    readMovedToMarker(
      documents.get(SYSTEM_META_DOCUMENT_PATH),
    ) !== null;
  storedSystemMigrationFlags = {
    ...(composed.source?.app === "claude-design"
      ? {
          migratedFrom: "claude-design",
        }
      : {}),
    ...(composed.upgraded !== null ||
    (composed.source?.upgradedAt ?? null) !== null
      ? {
          upgraded: true,
        }
      : {}),
  };
  updateStoredSystemStatus(meta);
  let carry: Storage.SystemCarry = {};
  if (meta?.convertedFrom !== undefined || meta?.snapshot !== undefined) {
    carry.meta = {
      ...(meta.convertedFrom !== undefined
        ? {
            convertedFrom: meta.convertedFrom,
          }
        : {}),
      ...(meta.snapshot !== undefined
        ? {
            snapshot: meta.snapshot,
          }
        : {}),
    };
  }
  let files = {
    ...hydrateStoredSystemText(
      composed,
      hydratedRemoteTexts(),
    ),
  };
  for (let [value, value2] of getLocalRemoteTextEdits()) {
    let value3 = composed.remoteText.has(value)
        ? remoteTextEntry(value)?.text
        : undefined,
      value4 =
        typeof composed.files[value] === "string" &&
        /^blob:/.test(composed.files[value]),
      value5 =
        composed.remoteText.get(value)?.dataRef ??
        (value4 ? composed.files[value] : undefined);
    if (
      value3 === value2 ||
      (getRemoteTextProblems().has(value)
        ? value5 !== undefined &&
          value5 !== failedRemoteTextReference(value)
        : value4)
    ) {
      acceptRemoteTextEdit(value);
    } else {
      files[value] = value2;
    }
  }
  return {
    title: composed.title,
    content: {
      v: 2,
      files: files,
    },
    comments: composeCommentDocuments(documents),
    carry: carry,
    dangling: [],
  };
}
function blobIdsInDocumentRecords(
  documents: ReadonlyMap<string, Storage.DatabaseRecord>,
): Set<string> {
  let ids = new Set<string>(),
    walk = (items: unknown, options: number): void => {
      if (typeof items === "string") {
        let value = blobIdFromReference(items);
        if (value !== null) {
          ids.add(value);
        }
        if (items.length > 12) {
          for (let value2 of items.matchAll(
            /(?:_blob\/|read(?:_asset)?[\s\u0060]+)([A-Za-z0-9_-]{8,})/g,
          )) {
            for (
              let count: number = 8, value3 = value2[1];
              count <= Math.min(value3.length, 64);
              count++
            ) {
              ids.add(value3.slice(0, count));
            }
          }
        }
      } else if (
        options <= MAX_SYNC_DOCUMENT_DEPTH &&
        typeof items === "object" &&
        items !== null
      ) {
        for (let value of Array.isArray(items)
          ? (items as readonly unknown[])
          : Object.values<unknown>(items as Storage.DatabaseRecord)) {
          walk(value, options + 1);
        }
      }
    };
  for (let [, value] of documents) {
    walk(value, 0);
  }
  return ids;
}
function retainedSystemBlobIds(): Set<string> {
  return new Set([
    ...blobIdsInDocumentRecords(currentSystemDocumentRecords),
    ...blobIdsInDocumentRecords(pendingSystemDocumentRecords),
  ]);
}
function isSystemCollectionWindowed(): boolean {
  hasWindowedSystemCollection ||= hasFullCollectionWindow(
    currentSystemDocumentRecords,
  );
  return hasWindowedSystemCollection;
}
function hasFullCollectionWindow(
  documents: ReadonlyMap<string, Storage.DatabaseRecord>,
): boolean {
  let counts = new Map<string, number>();
  for (let value of documents.keys()) {
    counts.set(
      documentCollectionPath(value),
      (counts.get(documentCollectionPath(value)) ?? 0) + 1,
    );
  }
  return [...counts.values()].some(
    (input: number): boolean => input >= MAX_COLLECTION_DOCUMENTS,
  );
}
function refuseOversizedSystemDocument(
  path: string,
  record: Storage.DatabaseRecord,
  collectionBytes: number,
): string | undefined {
  let bytes = estimateEmbeddedJsonBytes(record),
    displayPath = typeof record.path === "string" ? record.path : path;
  if (bytes > MAX_SYNC_DOCUMENT_BYTES) {
    return (
      "“" +
      displayPath +
      "” is too large to sync (" +
      ceilKilobytesString(bytes) +
      " KB > 240 KB)."
    );
  }
  if (jsonValueDepth(record) > MAX_SYNC_DOCUMENT_DEPTH) {
    return "“" + displayPath + "” is nested too deeply to sync.";
  }
  if (collectionBytes > MAX_SYNC_COLLECTION_BYTES) {
    return (
      "This design system’s " +
      (documentCollectionPath(path) ===
      COMMENT_DOCUMENT_PREFIX
        ? "comments"
        : documentCollectionPath(path) + " files") +
      " are over the 2 MB live-sync budget."
    );
  }
  return;
}
export {
  blobIdsInDocumentRecords,
  ceilKilobytesString,
  composeDesignSystemDocuments,
  currentStoredSystemMetadata,
  currentSystemDocumentRecords,
  decomposeDesignSystemDocuments,
  DESIGN_SYSTEM_DOCUMENT_CODEC,
  EMPTY_STORED_SYSTEM_STATUS,
  getStoredSystemStatus,
  hasFullCollectionWindow,
  hasWindowedSystemCollection,
  isDerivedSystemDocument,
  isSystemCollectionWindowed,
  isSystemEditingDisabled,
  knownRemoteUploadsByText,
  knownRemoteUploadsForFiles,
  knownUploadFromRemoteRecord,
  localSystemMetadataChanges,
  pendingSystemDocumentRecords,
  README_DOCUMENT_PATH,
  refuseOversizedSystemDocument,
  regenerateStoredDerivedFiles,
  remoteTextDocumentRecords,
  requestStoredDerivedRegeneration,
  retainedDerivedSystemDocuments,
  retainedSystemBlobIds,
  reuseStoredDocumentIdentity,
  stampLocalSystemLastChange,
  storedSystemMigrationFlags,
  storedSystemStatus,
  storedSystemStatusSubscribers,
  subscribeStoredSystemStatus,
  systemMovedToFiles,
  updateStoredSystemMigrationFlags,
  updateStoredSystemStatus,
};
export function installModelSystemSync(): () => void {
  return () => {
    EMPTY_STORED_SYSTEM_STATUS = {
      carried: [],
      carriedMore: 0,
      loaded: false,
    };
    storedSystemStatus = EMPTY_STORED_SYSTEM_STATUS;
    storedSystemStatusSubscribers = new Set();
    localSystemMetadataChanges = {};
    currentStoredSystemMetadata = null;
    systemMovedToFiles = false;
    storedSystemMigrationFlags = {};
    regenerateStoredDerivedFiles = false;
    remoteTextDocumentRecords = new Map();
    retainedDerivedSystemDocuments = {
      derived: new Map(),
      readmeTail: "",
      meta: {},
    };
    README_DOCUMENT_PATH = documentPathForFile(
      DESIGN_SYSTEM_PATHS.readme,
    );
    isDerivedSystemDocument = (input: string) =>
      documentCollectionPath(input) === API_COLLECTION ||
      input ===
        documentPathForFile(GENERATED_TOKENS_CSS_PATH);
    currentSystemDocumentRecords = new Map();
    pendingSystemDocumentRecords = new Map();
    hasWindowedSystemCollection = false;
    ceilKilobytesString = (bytes: number): string =>
      String(Math.ceil(bytes / 1024));
    DESIGN_SYSTEM_DOCUMENT_CODEC = {
      collections: [
        ...DESIGN_SYSTEM_COLLECTIONS,
        COMMENT_DOCUMENT_PREFIX,
      ],
      metaPath: SYSTEM_META_DOCUMENT_PATH,
      decompose: decomposeDesignSystemDocuments,
      compose: composeDesignSystemDocuments,
      refuse: refuseOversizedSystemDocument,
      replaceOnly: (input: string): boolean =>
        input === SYSTEM_TOKENS_DOCUMENT_PATH,
    };
  };
}
