import type * as Storage from "../contracts/model-storage";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { blobRelativeUrlModelFilePolicy, TYPE_RESERVED_FILE_BUDGET } from "./file-policy";
import { ARTIFACT_FILE_LIMITS } from "./file-table";
import { blobIdFromReference } from "./stored-file-codec";

var MAX_SYSTEM_MIRROR_FILES: number;
var MAX_SYSTEM_MIRROR_BYTES: number;
var REMOTE_TEXT_RETRY_DELAY_MS: number;
var remoteTextEntries: Map<string, Storage.RemoteTextEntry>;
var fetchingRemoteTextReferences: Set<string>;
var failedRemoteTextTimes: Map<string, number>;
var remoteTextHydrator: Storage.RemoteTextHydrator | undefined;
var remoteTextRetryTimer: ReturnType<typeof setTimeout> | undefined;
var uploadedRemoteTextEntries: Map<string, Storage.UploadedRemoteText>;
var uploadingRemoteTextKeys: Set<string>;
var failedRemoteTextUploadKeys: Set<string>;
var remoteTextUploadProblems: Map<string, string>;
var remoteTextProblemSnapshot: ReadonlyMap<string, string>;
var remoteTextProblemSubscribers: Set<() => void>;
var failedRemoteTextReferenceByPath: Map<string, string | undefined>;
var remoteTextUploadedCallback: (() => void) | undefined;
var localRemoteTextEdits: Map<string, string>;
var extraRetainedBlobIdsProvider: () => Iterable<string>;
function setRemoteTextHydrator(
  hydrator: Storage.RemoteTextHydrator | undefined,
): void {
  remoteTextHydrator = hydrator;
}
function remoteTextEntry(path: string): Storage.RemoteTextEntry | undefined {
  return remoteTextEntries.get(path);
}
function hydratedRemoteTexts(): Map<string, string> {
  let texts = new Map<string, string>();
  for (let [value, value2] of remoteTextEntries) {
    if (value2.text !== undefined) {
      texts.set(value, value2.text);
    }
  }
  return texts;
}
function hasUnhydratedRemoteText(): boolean {
  for (let [, value] of remoteTextEntries) {
    if (value.text === undefined) {
      return true;
    }
  }
  return false;
}
function synchronizeRemoteTextEntries(
  remoteText: ReadonlyMap<string, Storage.RemoteFileRecord>,
  fetchText: Storage.RemoteTextFetch | undefined = sameOriginFileFetcher(),
): void {
  for (let value of [...remoteTextEntries.keys()]) {
    if (!remoteText.has(value)) {
      remoteTextEntries.delete(value);
    }
  }
  for (let [value, value2] of remoteText) {
    let entry = remoteTextEntries.get(value);
    remoteTextEntries.set(
      value,
      entry !== undefined && entry.ptr.dataRef === value2.dataRef
        ? {
            ptr: value2,
            text: entry.text,
          }
        : {
            ptr: value2,
          },
    );
  }
  if (fetchText === undefined) {
    return;
  }
  for (let [value, value2] of remoteTextEntries) {
    let dataRef = value2.ptr.dataRef,
      entry = failedRemoteTextTimes.get(dataRef);
    if (
      value2.text !== undefined ||
      fetchingRemoteTextReferences.has(dataRef) ||
      (entry !== undefined && Date.now() - entry < REMOTE_TEXT_RETRY_DELAY_MS)
    ) {
      continue;
    }
    fetchingRemoteTextReferences.add(dataRef);
    fetchRemoteFileText(dataRef, fetchText).then(
      (input: string | undefined): void => {
        fetchingRemoteTextReferences.delete(dataRef);
        if (input === undefined) {
          failedRemoteTextTimes.set(dataRef, Date.now());
          clearTimeout(remoteTextRetryTimer);
          remoteTextRetryTimer = setTimeout(
            () =>
              synchronizeRemoteTextEntries(
                new Map(
                  [...remoteTextEntries].map(
                    ([input2, input3]: [string, Storage.RemoteTextEntry]) => [
                      input2,
                      input3.ptr,
                    ],
                  ),
                ),
                fetchText,
              ),
            REMOTE_TEXT_RETRY_DELAY_MS + 50,
          );
          return;
        }
        failedRemoteTextTimes.delete(dataRef);
        for (let [value3, value4] of remoteTextEntries) {
          if (value4.ptr.dataRef !== dataRef || value4.text !== undefined) {
            continue;
          }
          value4.text = input;
          if (!localRemoteTextEdits.has(value3)) {
            remoteTextHydrator?.hydrate(value3, input);
          }
        }
      },
    );
  }
}
async function fetchRemoteFileText(
  dataRef: string,
  fetchText: Storage.RemoteTextFetch,
): Promise<string | undefined> {
  let id = blobIdFromReference(dataRef);
  if (id === null) {
    return;
  }
  try {
    let value = await fetchText(
      "/" + blobRelativeUrlModelFilePolicy(id),
    );
    if (!value.ok) {
      throw Error("not served");
    }
    return await value.text();
  } catch (value: unknown) {
    console.warn(
      "design-system (stored code): could not read " +
        dataRef +
        ": " +
        String(value).slice(0, 120),
    );
    return;
  }
}
function sameOriginFileFetcher(): Storage.RemoteTextFetch | undefined {
  if (typeof location === "undefined" || typeof fetch === "undefined") {
    return undefined;
  } else {
    return (input: string) =>
      fetch(input, {
        credentials: "same-origin",
      });
  }
}
function getRemoteTextProblems(): ReadonlyMap<string, string> {
  return remoteTextProblemSnapshot;
}
function subscribeRemoteTextProblems(subscriber: () => void): () => void {
  remoteTextProblemSubscribers.add(subscriber);
  return () => remoteTextProblemSubscribers.delete(subscriber);
}
function failedRemoteTextReference(path: string): string | undefined {
  return failedRemoteTextReferenceByPath.get(path);
}
function setRemoteTextUploadProblem(path: string, message: string): void {
  if (remoteTextUploadProblems.get(path) === message) {
    return;
  }
  remoteTextUploadProblems.set(path, message);
  remoteTextProblemSnapshot = new Map(remoteTextUploadProblems);
  for (let value of remoteTextProblemSubscribers) {
    value();
  }
}
function recordRemoteTextUploadFailure(
  key: string,
  path: string,
  message: string,
): void {
  failedRemoteTextUploadKeys.add(key);
  failedRemoteTextReferenceByPath.set(
    path,
    remoteTextEntries.get(path)?.ptr.dataRef,
  );
  remoteTextUploadProblems.set(path, message);
  remoteTextProblemSnapshot = new Map(remoteTextUploadProblems);
  for (let value of remoteTextProblemSubscribers) {
    value();
  }
  console.warn("[design-system] " + path + ": " + message);
}
function setRemoteTextUploadedCallback(
  callback: (() => void) | undefined,
): void {
  remoteTextUploadedCallback = callback;
}
function getLocalRemoteTextEdits(): ReadonlyMap<string, string> {
  return localRemoteTextEdits;
}
function hasPendingRemoteTextUploads(): boolean {
  return uploadingRemoteTextKeys.size > 0;
}
function acceptRemoteTextEdit(path: string): void {
  localRemoteTextEdits.delete(path);
  clearRemoteTextUploadFailure(path);
}
function discardRemoteTextEdit(path: string): void {
  let hadEdit = localRemoteTextEdits.delete(path);
  uploadedRemoteTextEntries.delete(path);
  clearRemoteTextUploadFailure(path);
  let entry = remoteTextEntries.get(path);
  if (hadEdit && entry?.text !== undefined) {
    let text = entry.text;
    setTimeout((): void => {
      if (remoteTextEntries.get(path)?.text === text) {
        remoteTextHydrator?.hydrate(path, text, true);
      }
    }, 0);
  }
}
function clearRemoteTextUploadFailure(path: string): void {
  failedRemoteTextReferenceByPath.delete(path);
  for (let value of [...failedRemoteTextUploadKeys]) {
    if (value.startsWith(path + "\x00")) {
      failedRemoteTextUploadKeys.delete(value);
    }
  }
  if (remoteTextUploadProblems.delete(path)) {
    remoteTextProblemSnapshot = new Map(remoteTextUploadProblems);
    for (let value of remoteTextProblemSubscribers) {
      value();
    }
  }
}
function getRemoteTextEntries(): ReadonlyMap<
  string,
  Storage.RemoteTextEntry
> {
  return remoteTextEntries;
}
function getUploadedRemoteTextEntries(): ReadonlyMap<
  string,
  Storage.UploadedRemoteText
> {
  return uploadedRemoteTextEntries;
}
function setRetainedBlobIdsProvider(provider: () => Iterable<string>): void {
  extraRetainedBlobIdsProvider = provider;
}
function retainedRemoteTextBlobIds(): Set<string> {
  let ids = new Set(extraRetainedBlobIdsProvider());
  for (let [, value] of remoteTextEntries) {
    let value2 = blobIdFromReference(value.ptr.dataRef);
    if (value2 !== null) {
      ids.add(value2);
    }
  }
  for (let [, value] of uploadedRemoteTextEntries) {
    ids.add(value.known.id);
  }
  return ids;
}
function knownUploadForRemoteText(
  path: string,
  text: string,
): Storage.KnownUpload | undefined {
  let entry = uploadedRemoteTextEntries.get(path);
  if (entry !== undefined && entry.text === text) {
    return entry.known;
  } else {
    return undefined;
  }
}
function uploadEditedRemoteText(
  path: string,
  text: string,
  mime: string,
  upload: Storage.RemoteTextUpload | null,
  binaryBytes: Uint8Array<ArrayBuffer> | undefined,
  retry: number = 0,
): void {
  let key: string = path + "\x00" + String(text.length);
  localRemoteTextEdits.set(path, text);
  if (
    retry === 0 &&
    (uploadingRemoteTextKeys.has(key) ||
      failedRemoteTextUploadKeys.has(key) ||
      knownUploadForRemoteText(path, text) !== undefined)
  ) {
    return;
  }
  if (upload === null) {
    recordRemoteTextUploadFailure(
      key,
      path,
      // MineDesign: the system is files in the working directory; there is no Artifact tool.
      "cannot be stored from this view (no asset store) — add it as a file in this system’s directory; it is shown this session only",
    );
    return;
  }
  uploadingRemoteTextKeys.add(key);
  let bytes = binaryBytes ?? new TextEncoder().encode(text);
  upload(
    new Blob([bytes], {
      type: mime,
    }),
    {
      type: mime,
    },
  ).then(
    (input: unknown): void => {
      uploadingRemoteTextKeys.delete(key);
      let value =
          typeof input === "object" && input !== null
            ? (input as Storage.DatabaseRecord)
            : {},
        value2 =
          typeof value.id === "string"
            ? value.id
            : typeof value.url === "string"
              ? (/(?:^|\/)_blob\/([A-Za-z0-9_-]{8,64})$/.exec(
                  value.url,
                )?.[1] ?? null)
              : null;
      if (value2 === null) {
        recordRemoteTextUploadFailure(
          key,
          path,
          // MineDesign: the system is files in the working directory; there is no Artifact tool.
          "the asset store gave no id for it — add it as a file in this system’s directory; it is shown this session only",
        );
        return;
      }
      uploadedRemoteTextEntries.set(path, {
        text: text,
        known: {
          id: value2,
          bytes: bytes.length,
          contentType: mime,
        },
      });
      remoteTextUploadedCallback?.();
    },
    (input: unknown): void => {
      let value: string = String(
        (input as { code?: unknown } | null | undefined)?.code ?? "",
      );
      if (
        retry === 0 &&
        (value === "store_unavailable" || value === "rate_limited")
      ) {
        setTimeout(
          (): void => {
            uploadingRemoteTextKeys.delete(key);
            if (localRemoteTextEdits.get(path) === text) {
              uploadEditedRemoteText(
                path,
                text,
                mime,
                upload,
                binaryBytes,
                1,
              );
            }
          },
          value === "rate_limited" ? 3000 : 1500,
        );
        return;
      }
      uploadingRemoteTextKeys.delete(key);
      recordRemoteTextUploadFailure(
        key,
        path,
        "the asset store refused it (" +
          (value ||
            String(
              (input as { message?: unknown } | null | undefined)?.message ??
                input,
            )) +
          // MineDesign: the system is files in the working directory; there is no Artifact tool.
          ") — add it as a file in this system’s directory; it is shown this session only",
      );
    },
  );
}
export {
  acceptRemoteTextEdit,
  clearRemoteTextUploadFailure,
  discardRemoteTextEdit,
  extraRetainedBlobIdsProvider,
  failedRemoteTextReference,
  failedRemoteTextReferenceByPath,
  failedRemoteTextTimes,
  failedRemoteTextUploadKeys,
  fetchingRemoteTextReferences,
  fetchRemoteFileText,
  getLocalRemoteTextEdits,
  getRemoteTextEntries,
  getRemoteTextProblems,
  getUploadedRemoteTextEntries,
  hasPendingRemoteTextUploads,
  hasUnhydratedRemoteText,
  hydratedRemoteTexts,
  knownUploadForRemoteText,
  localRemoteTextEdits,
  MAX_SYSTEM_MIRROR_BYTES,
  MAX_SYSTEM_MIRROR_FILES,
  recordRemoteTextUploadFailure,
  REMOTE_TEXT_RETRY_DELAY_MS,
  remoteTextEntries,
  remoteTextEntry,
  remoteTextHydrator,
  remoteTextProblemSnapshot,
  remoteTextProblemSubscribers,
  remoteTextRetryTimer,
  remoteTextUploadedCallback,
  remoteTextUploadProblems,
  retainedRemoteTextBlobIds,
  sameOriginFileFetcher,
  setRemoteTextHydrator,
  setRemoteTextUploadedCallback,
  setRemoteTextUploadProblem,
  setRetainedBlobIdsProvider,
  subscribeRemoteTextProblems,
  synchronizeRemoteTextEntries,
  uploadEditedRemoteText,
  uploadedRemoteTextEntries,
  uploadingRemoteTextKeys,
};
export function installModelRemoteText(): () => void {
  return () => {
    MAX_SYSTEM_MIRROR_FILES =
      ARTIFACT_FILE_LIMITS.files -
      TYPE_RESERVED_FILE_BUDGET.files;
    MAX_SYSTEM_MIRROR_BYTES =
      15728640 - TYPE_RESERVED_FILE_BUDGET.bytes;
    REMOTE_TEXT_RETRY_DELAY_MS = 60000;
    remoteTextEntries = new Map();
    fetchingRemoteTextReferences = new Set();
    failedRemoteTextTimes = new Map();
    uploadedRemoteTextEntries = new Map();
    uploadingRemoteTextKeys = new Set();
    failedRemoteTextUploadKeys = new Set();
    remoteTextUploadProblems = new Map();
    remoteTextProblemSnapshot = new Map();
    remoteTextProblemSubscribers = new Set();
    failedRemoteTextReferenceByPath = new Map();
    localRemoteTextEdits = new Map();
    extraRetainedBlobIdsProvider = () => new Set();
  };
}
