/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { getCurrentUserId } from "./user-capabilities";

var CRASH_STASH_TTL_MS: Dynamic;
var CRASH_STASH_RETENTION_LABEL: Dynamic;
var MAX_CRASH_STASH_EDITS_PER_ENTRY: Dynamic;
var MAX_CRASH_STASH_ENTRY_CHARS: Dynamic;
var MAX_CRASH_STASH_CHARS: Dynamic;
var crashStashKey: Dynamic;
var crashStashEditSize: Dynamic;
var baseArtifactIdentity: Dynamic;
var isCrashStashEntry: Dynamic;
var CRASH_STASH_DATABASE: Dynamic;
var CRASH_STASH_STORE: Dynamic;
var ARTIFACT_VERSION_PATH_PATTERN: Dynamic;
var CRASH_STASH_LOCK_PREFIX: Dynamic;
var getNavigatorLocks: Dynamic;
function extractPortFileText(portFile?: Dynamic): Dynamic {
  if (portFile === null) return "";
  let content: Dynamic =
    typeof portFile == "object" &&
    !(typeof Blob !== "undefined" && portFile instanceof Blob)
      ? portFile.content
      : portFile;
  return typeof content == "string" ? content : "";
}
function createCrashStash(
  store?: Dynamic,
  artifactId?: Dynamic,
  viewerId?: Dynamic,
  tabId?: Dynamic,
  now?: Dynamic,
  getActiveTabs?: Dynamic,
): Dynamic {
  let key: Dynamic = crashStashKey(artifactId, viewerId, tabId),
    pending: Dynamic = [],
    attempt: Dynamic = async (
      fallback?: Dynamic,
      operation?: Dynamic,
    ): Promise<Dynamic> => {
      try {
        return await operation();
      } catch {
        return fallback;
      }
    },
    isSameArtifact: Dynamic = (storedEntry?: Dynamic): Dynamic =>
      baseArtifactIdentity(storedEntry.artifactId) ===
      baseArtifactIdentity(artifactId),
    pruneExpiredEntries: Dynamic = async (): Promise<Dynamic> => {
      let unexpiredEntries: Dynamic = [];
      for (let storedEntry of (await store.all()) as Dynamic) {
        if (
          !isCrashStashEntry(storedEntry) ||
          now() - storedEntry.createdAt > CRASH_STASH_TTL_MS
        ) {
          typeof storedEntry?.key == "string" && (await store.delete(storedEntry.key));
          continue;
        }
        unexpiredEntries.push(storedEntry);
      }
      return unexpiredEntries;
    },
    getOtherActiveTabs: Dynamic = async (): Promise<Dynamic> => {
      let activeTabIds: Dynamic = new Set(
        await getActiveTabs().catch((): Dynamic => new Set()),
      );
      activeTabIds.delete(tabId);
      return activeTabIds;
    };
  return {
    put: (edits?: Dynamic, version?: Dynamic): Dynamic =>
      attempt(false, async (): Promise<Dynamic> => {
        if (viewerId === "") return false;
        if (edits.length === 0) {
          await store.delete(key);
          return true;
        }
        let retainedEdits: Dynamic = [],
          retainedChars: Dynamic = 0;
        for (let edit of edits as Dynamic)
          retainedEdits.length >= MAX_CRASH_STASH_EDITS_PER_ENTRY ||
            retainedChars + crashStashEditSize(edit) >
              MAX_CRASH_STASH_ENTRY_CHARS ||
            (retainedEdits.push({
              path: edit.path,
              text: edit.text,
              base: edit.base,
            }),
            (retainedChars += crashStashEditSize(edit)));
        let unexpiredEntries: Dynamic = await pruneExpiredEntries(),
          otherActiveTabs: Dynamic = await getOtherActiveTabs(),
          otherEntries: Dynamic = unexpiredEntries.filter(
            (entry?: Dynamic): Dynamic => entry.key !== key,
          ),
          totalChars: Dynamic =
            retainedChars +
            otherEntries.reduce(
              (chars?: Dynamic, entry?: Dynamic): Dynamic =>
                chars + entry.chars,
              0,
            );
        for (let evictableEntry of otherEntries
          .filter((entry?: Dynamic): Dynamic => !otherActiveTabs.has(entry.tabId))
          .sort(
            (earlierEntry?: Dynamic, laterEntry?: Dynamic): Dynamic =>
              earlierEntry.at - laterEntry.at,
          ) as Dynamic) {
          if (totalChars <= MAX_CRASH_STASH_CHARS) break;
          await store.delete(evictableEntry.key);
          totalChars -= evictableEntry.chars;
        }
        if (totalChars > MAX_CRASH_STASH_CHARS) return false;
        let createdAt: Dynamic =
          unexpiredEntries.find((entry?: Dynamic): Dynamic => entry.key === key)
            ?.createdAt ?? now();
        await store.put({
          key: key,
          artifactId: artifactId,
          viewerId: viewerId,
          tabId: tabId,
          createdAt: createdAt,
          at: now(),
          version: version,
          edits: retainedEdits,
          chars: retainedChars,
        });
        return retainedEdits.length === edits.length;
      }),
    read: (): Dynamic =>
      attempt(undefined, async (): Promise<Dynamic> => {
        if (viewerId === "") return;
        let otherActiveTabs: Dynamic = await getOtherActiveTabs(),
          recoverableEntries: Dynamic = (await pruneExpiredEntries())
            .filter(
              (entry?: Dynamic): Dynamic =>
                entry.artifactId === artifactId &&
                entry.viewerId === viewerId &&
                !otherActiveTabs.has(entry.tabId),
            )
            .sort(
              (earlierEntry?: Dynamic, laterEntry?: Dynamic): Dynamic =>
                earlierEntry.at - laterEntry.at,
            );
        pending = recoverableEntries.map(
          (entry?: Dynamic): Dynamic => ({
            key: entry.key,
            at: entry.at,
          }),
        );
        let entries: Dynamic = new Map();
        for (let entry of recoverableEntries as Dynamic)
          for (let edit of entry.edits as Dynamic)
            entries.set(edit.path, edit);
        if (entries.size === 0) return;
        let latestEntry: Dynamic = recoverableEntries[recoverableEntries.length - 1];
        return {
          createdAt: Math.min(
            ...recoverableEntries.map((entry?: Dynamic): Dynamic => entry.createdAt),
          ),
          at: latestEntry.at,
          version: latestEntry.version,
          edits: [...entries.values()],
        };
      }),
    clear: (): Dynamic =>
      attempt(undefined, (): Dynamic => store.delete(key)),
    clearOffered: (): Dynamic =>
      attempt(undefined, async (): Promise<Dynamic> => {
        let offeredEntries: Dynamic = pending;
        pending = [];
        let entries: Dynamic = new Map(
          (await store.all()).map(
            (entry?: Dynamic): Dynamic => [entry.key, entry.at],
          ),
        );
        for (let offeredEntry of offeredEntries as Dynamic)
          entries.get(offeredEntry.key) === offeredEntry.at &&
            (await store.delete(offeredEntry.key));
      }),
    clearArtifact: (): Dynamic =>
      attempt(undefined, async (): Promise<Dynamic> => {
        for (let entry of (await store.all()) as Dynamic)
          typeof entry?.artifactId == "string" &&
            isSameArtifact(entry) &&
            (await store.delete(entry.key));
      }),
    purgeOtherViewers: (): Dynamic =>
      attempt(undefined, async (): Promise<Dynamic> => {
        for (let entry of (await pruneExpiredEntries()) as Dynamic)
          viewerId !== "" &&
            isSameArtifact(entry) &&
            entry.viewerId !== viewerId &&
            (await store.delete(entry.key));
      }),
  };
}
function awaitIndexedDbRequest(request?: Dynamic): Dynamic {
  return new Promise((resolve?: Dynamic, reject?: Dynamic): Dynamic => {
    request.onsuccess = (): Dynamic => resolve(request.result);
    request.onerror = (): Dynamic =>
      reject(request.error ?? new Error("indexedDB request failed"));
  });
}
function createIndexedDbStashStore(indexedDb?: Dynamic): Dynamic {
  let databasePromise: Dynamic,
    openDatabase: Dynamic = (): Dynamic => (
      (databasePromise ??= new Promise(
        (resolve?: Dynamic, reject?: Dynamic): Dynamic => {
          let openRequest: Dynamic = indexedDb.open(CRASH_STASH_DATABASE, 1);
          openRequest.onupgradeneeded = (): Dynamic => {
            openRequest.result.createObjectStore(CRASH_STASH_STORE, {
              keyPath: "key",
            });
          };
          openRequest.onsuccess = (): Dynamic => resolve(openRequest.result);
          openRequest.onerror = (): Dynamic =>
            reject(openRequest.error ?? new Error("indexedDB open failed"));
          openRequest.onblocked = (): Dynamic =>
            reject(new Error("indexedDB open blocked"));
        },
      )),
      databasePromise.catch((): Dynamic => {
        databasePromise = undefined;
      }),
      databasePromise
    ),
    writeToStore: Dynamic = async (createRequest?: Dynamic): Promise<Dynamic> => {
      let transaction: Dynamic = (await openDatabase()).transaction(
          CRASH_STASH_STORE,
          "readwrite",
        ),
        transactionComplete: Dynamic = new Promise(
          (resolve?: Dynamic, reject?: Dynamic): Dynamic => {
            transaction.oncomplete = (): Dynamic => resolve();
            transaction.onerror = (): Dynamic =>
              reject(
                transaction.error ?? new Error("indexedDB transaction failed"),
              );
            transaction.onabort = (): Dynamic =>
              reject(
                transaction.error ?? new Error("indexedDB transaction aborted"),
              );
          },
        );
      await Promise.all([
        awaitIndexedDbRequest(createRequest(transaction.objectStore(CRASH_STASH_STORE))),
        transactionComplete,
      ]);
    };
  return {
    all: async (): Promise<Dynamic> =>
      awaitIndexedDbRequest(
        (await openDatabase())
          .transaction(CRASH_STASH_STORE, "readonly")
          .objectStore(CRASH_STASH_STORE)
          .getAll(),
      ),
    put: (entry?: Dynamic): Dynamic =>
      writeToStore((objectStore?: Dynamic): Dynamic => objectStore.put(entry)),
    delete: (entryKey?: Dynamic): Dynamic =>
      writeToStore((objectStore?: Dynamic): Dynamic => objectStore.delete(entryKey)),
  };
}
function artifactPathIdentity(
  pageLocation: Dynamic = (globalThis as Dynamic).location,
): Dynamic {
  return (pageLocation?.pathname ?? "").replace(
    ARTIFACT_VERSION_PATH_PATTERN,
    "$1",
  );
}
function trackActiveStashTabs(tabId?: Dynamic): Dynamic {
  let locks: Dynamic = getNavigatorLocks();
  return locks === undefined
    ? (): Dynamic => Promise.resolve(new Set())
    : (locks
        .request(
          CRASH_STASH_LOCK_PREFIX + tabId,
          (): Dynamic => new Promise((): Dynamic => {}),
        )
        .catch((): Dynamic => {}),
      async (): Promise<Dynamic> =>
        new Set(
          ((await locks.query()).held ?? [])
            .map((lock?: Dynamic): Dynamic => lock.name ?? "")
            .filter(
              (lockName?: Dynamic): Dynamic =>
                lockName.startsWith(CRASH_STASH_LOCK_PREFIX),
            )
            .map(
              (lockName?: Dynamic): Dynamic =>
                lockName.slice(CRASH_STASH_LOCK_PREFIX.length),
            ),
        ));
}
function createBrowserCrashStash(stashOptions?: Dynamic): Dynamic {
  let indexedDb: Dynamic;
  try {
    indexedDb = stashOptions.indexedDB ?? (globalThis as Dynamic).indexedDB;
  } catch {
    indexedDb = undefined;
  }
  if (indexedDb === undefined || typeof stashOptions.viewerId != "string")
    return null;
  let tabId: Dynamic = stashOptions.tabId ?? crypto.randomUUID();
  return createCrashStash(
    createIndexedDbStashStore(indexedDb),
    stashOptions.artifactId ?? artifactPathIdentity(),
    stashOptions.viewerId,
    tabId,
    stashOptions.now ?? Date.now,
    stashOptions.liveTabs ?? trackActiveStashTabs(tabId),
  );
}
async function restoreBrowserCrashStash(
  suffix: Dynamic = "",
): Promise<Dynamic> {
  let viewerId: Dynamic = (await getCurrentUserId()) ?? "",
    stash: Dynamic = createBrowserCrashStash({
      viewerId: viewerId,
      artifactId:
        artifactPathIdentity() + (suffix === "" ? "" : "#" + suffix),
    });
  await stash?.purgeOtherViewers();
  return stash;
}
export {
  ARTIFACT_VERSION_PATH_PATTERN,
  artifactPathIdentity,
  awaitIndexedDbRequest,
  baseArtifactIdentity,
  CRASH_STASH_DATABASE,
  CRASH_STASH_LOCK_PREFIX,
  CRASH_STASH_RETENTION_LABEL,
  CRASH_STASH_STORE,
  CRASH_STASH_TTL_MS,
  crashStashEditSize,
  crashStashKey,
  createBrowserCrashStash,
  createCrashStash,
  createIndexedDbStashStore,
  extractPortFileText,
  getNavigatorLocks,
  isCrashStashEntry,
  MAX_CRASH_STASH_CHARS,
  MAX_CRASH_STASH_EDITS_PER_ENTRY,
  MAX_CRASH_STASH_ENTRY_CHARS,
  restoreBrowserCrashStash,
  trackActiveStashTabs,
};
export function installPlatformCrashStash(): () => void {
  return () => {
    CRASH_STASH_TTL_MS = 4320 * 60 * 1e3;
    CRASH_STASH_RETENTION_LABEL = "3 days";
    MAX_CRASH_STASH_EDITS_PER_ENTRY = 64;
    MAX_CRASH_STASH_ENTRY_CHARS = 1e6;
    MAX_CRASH_STASH_CHARS = 2e6;
    crashStashKey = (
      artifactId?: Dynamic,
      viewerId?: Dynamic,
      tabId?: Dynamic,
    ): Dynamic => [artifactId, viewerId, tabId].join("\0");
    crashStashEditSize = (edit?: Dynamic): Dynamic =>
      edit.path.length + (edit.text?.length ?? 0);
    baseArtifactIdentity = (artifactId?: Dynamic): Dynamic => artifactId.split("#")[0];
    isCrashStashEntry = (entry?: Dynamic): Dynamic =>
      typeof entry?.key == "string" &&
      typeof entry.artifactId == "string" &&
      typeof entry.viewerId == "string" &&
      Number.isFinite(entry.createdAt) &&
      Number.isFinite(entry.at) &&
      Number.isFinite(entry.chars) &&
      entry.chars >= 0 &&
      Array.isArray(entry.edits) &&
      entry.edits.every(
        (edit?: Dynamic): Dynamic =>
          typeof edit?.path == "string" &&
          (typeof edit.text == "string" || edit.text === null) &&
          (typeof edit.base == "string" || edit.base === null),
      );
    CRASH_STASH_DATABASE = "appifact-crash-stash";
    CRASH_STASH_STORE = "entries";
    ARTIFACT_VERSION_PATH_PATTERN = /(^|\/)_f\/[^/]+\//;
    CRASH_STASH_LOCK_PREFIX = "appifact-stash-tab:";
    getNavigatorLocks = (): Dynamic => {
      try {
        return (globalThis as Dynamic).navigator?.locks;
      } catch {
        return;
      }
    };
  };
}
