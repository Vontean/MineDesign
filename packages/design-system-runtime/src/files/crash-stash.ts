/** Restored application module; prepare first, initialize in original order. */
import type {
  CrashStashStorageRaw,
  CrashStashOffer,
  CrashStashHead,
  CrashStashWireValue,
  IndexedCrashStashOptions,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import { currentUserId } from "../host/user-api";

var CRASH_STASH_MAX_AGE_MS: number;
var CRASH_STASH_RETENTION_LABEL: string;
var CRASH_STASH_MAX_ENTRIES: number;
var CRASH_STASH_MAX_ARTIFACT_CHARS: number;
var CRASH_STASH_MAX_TOTAL_CHARS: number;
var crashStashIdentityKey: (
  artifact: string,
  viewer: string,
  tab: string,
) => string;
var crashStashEntrySize: (edit: Files.StashedFileEdit) => number;
var stripArtifactScopeFragment: (artifact: string) => string;
var isCrashStashEntry: (value: unknown) => value is Files.CrashStashEntry;
var CRASH_STASH_DATABASE_NAME: string;
var CRASH_STASH_OBJECT_STORE: string;
var FRAME_SCOPE_PATH_PATTERN: RegExp;
var CRASH_STASH_TAB_LOCK_PREFIX: string;
var getNavigatorLocks: () => LockManager | undefined;
function createCrashStashKit(
  storage: CrashStashStorageRaw,
  artifactId: string,
  viewerId: string,
  tabId: string,
  now: () => number,
  liveTabs: () => Promise<Set<string>>,
): Files.FilesCrashStash {
  let value = crashStashIdentityKey(artifactId, viewerId, tabId),
    items: CrashStashHead[] = [],
    callback = async <Default, Result>(
      stashInput: Default,
      stashOptions: () => Result | Promise<Result>,
    ): Promise<Default | Result> => {
      try {
        return await stashOptions();
      } catch {
        return stashInput;
      }
    },
    stashHandler = (stashInputA: { artifactId: string }): boolean =>
      stripArtifactScopeFragment(stashInputA.artifactId) ===
      stripArtifactScopeFragment(artifactId),
    stashHandlerA = async (): Promise<Files.CrashStashEntry[]> => {
      let stashEntries: Files.CrashStashEntry[] = [];
      for (let stashEntry of await storage.all()) {
        if (
          !isCrashStashEntry(stashEntry) ||
          now() - stashEntry.createdAt > CRASH_STASH_MAX_AGE_MS
        ) {
          if (
            typeof (stashEntry as CrashStashWireValue | null)?.key === "string"
          ) {
            await storage.delete((stashEntry as { key: string }).key);
          }
          continue;
        }
        stashEntries.push(stashEntry);
      }
      return stashEntries;
    },
    stashHandlerB = async (): Promise<Set<string>> => {
      let values = new Set(await liveTabs().catch(() => new Set<string>()));
      values.delete(tabId);
      return values;
    };
  return {
    put: (stashEntriesA: Files.StashedFileEdit[], stashOptionsA: string) =>
      callback(false, async (): Promise<boolean> => {
        if (viewerId === "") {
          return false;
        }
        if (stashEntriesA.length === 0) {
          await storage.delete(value);
          return true;
        }
        let stashEntriesB: Files.StashedFileEdit[] = [],
          index = 0;
        for (let stashItem of stashEntriesA) {
          if (
            stashEntriesB.length >= CRASH_STASH_MAX_ENTRIES ||
            index + crashStashEntrySize(stashItem) >
              CRASH_STASH_MAX_ARTIFACT_CHARS
          ) {
            continue;
          }
          stashEntriesB.push({
            path: stashItem.path,
            text: stashItem.text,
            base: stashItem.base,
          });
          index += crashStashEntrySize(stashItem);
        }
        let stashEntryA = await stashHandlerA(),
          stashRecords = await stashHandlerB(),
          stashEdits = stashEntryA.filter(
            (stashInputB: Files.CrashStashEntry): boolean => stashInputB.key !== value,
          ),
          stashCount =
            index +
            stashEdits.reduce(
              (stashInputC: number, stashOptionsB: Files.CrashStashEntry) =>
                stashInputC + stashOptionsB.chars,
              0,
            );
        for (let stashItemA of stashEdits
          .filter(
            (stashInputD: Files.CrashStashEntry): boolean =>
              !stashRecords.has(stashInputD.tabId),
          )
          .sort(
            (stashInputE: Files.CrashStashEntry, stashOptionsC: Files.CrashStashEntry) =>
              stashInputE.at - stashOptionsC.at,
          )) {
          if (stashCount <= CRASH_STASH_MAX_TOTAL_CHARS) {
            break;
          }
          await storage.delete(stashItemA.key);
          stashCount -= stashItemA.chars;
        }
        if (stashCount > CRASH_STASH_MAX_TOTAL_CHARS) {
          return false;
        }
        let stashEdit =
          stashEntryA.find(
            (stashInputF: Files.CrashStashEntry): boolean => stashInputF.key === value,
          )?.createdAt ?? now();
        await storage.put({
          key: value,
          artifactId: artifactId,
          viewerId: viewerId,
          tabId: tabId,
          createdAt: stashEdit,
          at: now(),
          version: stashOptionsA,
          edits: stashEntriesB,
          chars: index,
        });
        return stashEntriesB.length === stashEntriesA.length;
      }),
    read: () =>
      callback(undefined, async (): Promise<CrashStashOffer> => {
        if (viewerId === "") {
          return;
        }
        let stashEntryB = await stashHandlerB(),
          stashRecordsA = (await stashHandlerA())
            .filter(
              (stashInputG: Files.CrashStashEntry) =>
                stashInputG.artifactId === artifactId &&
                stashInputG.viewerId === viewerId &&
                !stashEntryB.has(stashInputG.tabId),
            )
            .sort(
              (
                stashInputH: Files.CrashStashEntry,
                stashOptionsD: Files.CrashStashEntry,
              ) => stashInputH.at - stashOptionsD.at,
            );
        items = stashRecordsA.map((stashInputI: Files.CrashStashEntry) => ({
          key: stashInputI.key,
          at: stashInputI.at,
        }));
        let entries: Map<string, Files.StashedFileEdit> = new Map();
        for (let stashCountA of stashRecordsA) {
          for (let stashEditA of stashCountA.edits) {
            entries.set(stashEditA.path, stashEditA);
          }
        }
        if (entries.size === 0) {
          return;
        }
        let stashEditsA = stashRecordsA[stashRecordsA.length - 1];
        return {
          createdAt: Math.min(
            ...stashRecordsA.map((stashInputJ: Files.CrashStashEntry) => stashInputJ.createdAt),
          ),
          at: stashEditsA.at,
          version: stashEditsA.version,
          edits: [...entries.values()],
        };
      }),
    clear: () => callback(undefined, () => storage.delete(value)),
    clearOffered: () =>
      callback(undefined, async (): Promise<void> => {
        let stashEntryC = items;
        items = [];
        let entries = new Map(
          (await storage.all()).map((stashInputK: unknown): [unknown, unknown] => [
            (stashInputK as CrashStashWireValue).key,
            (stashInputK as CrashStashWireValue).at,
          ]),
        );
        for (let stashRecordsB of stashEntryC) {
          if (entries.get(stashRecordsB.key) === stashRecordsB.at) {
            await storage.delete(stashRecordsB.key);
          }
        }
      }),
    clearArtifact: () =>
      callback(undefined, async (): Promise<void> => {
        for (let stashEntryD of await storage.all()) {
          if (
            typeof (stashEntryD as CrashStashWireValue | null)?.artifactId ===
              "string" &&
            stashHandler(stashEntryD as { artifactId: string })
          ) {
            await storage.delete((stashEntryD as { key: string }).key);
          }
        }
      }),
    purgeOtherViewers: () =>
      callback(undefined, async (): Promise<void> => {
        for (let stashEntryE of await stashHandlerA()) {
          if (
            viewerId !== "" &&
            stashHandler(stashEntryE) &&
            stashEntryE.viewerId !== viewerId
          ) {
            await storage.delete((stashEntryE as { key: string }).key);
          }
        }
      }),
  };
}
function awaitIndexedDbRequest<Value>(
  request: IDBRequest<Value>,
): Promise<Value> {
  return new Promise<Value>(
    (
      stashInputL: (value: Value) => void,
      stashOptionsE: (reason: unknown) => void,
    ): void => {
      request.onsuccess = () => stashInputL(request.result);
      request.onerror = () =>
        stashOptionsE(request.error ?? Error("indexedDB request failed"));
    },
  );
}
function createIndexedDbCrashStashStorage(indexedDb: IDBFactory) {
  let value: Promise<IDBDatabase> | undefined,
    callback = () => {
      value ??= new Promise<IDBDatabase>(
        (
          stashInputM: (value: IDBDatabase) => void,
          stashOptionsF: (reason: unknown) => void,
        ): void => {
          let stashEntryF = indexedDb.open(CRASH_STASH_DATABASE_NAME, 1);
          stashEntryF.onupgradeneeded = (): void => {
            stashEntryF.result.createObjectStore(CRASH_STASH_OBJECT_STORE, {
              keyPath: "key",
            });
          };
          stashEntryF.onsuccess = () => stashInputM(stashEntryF.result);
          stashEntryF.onerror = () =>
            stashOptionsF(stashEntryF.error ?? Error("indexedDB open failed"));
          stashEntryF.onblocked = () => stashOptionsF(Error("indexedDB open blocked"));
        },
      );
      value.catch((): void => {
        value = undefined;
      });
      return value;
    },
    stashHandlerC = async <Result>(
      stashInputN: (store: IDBObjectStore) => IDBRequest<Result>,
    ): Promise<void> => {
      let stashEntryG = (await callback()).transaction(
          CRASH_STASH_OBJECT_STORE,
          "readwrite",
        ),
        promise = new Promise<void>(
          (stashInputO: () => void, stashOptionsG: (reason: unknown) => void): void => {
            stashEntryG.oncomplete = () => stashInputO();
            stashEntryG.onerror = () =>
              stashOptionsG(stashEntryG.error ?? Error("indexedDB transaction failed"));
            stashEntryG.onabort = () =>
              stashOptionsG(stashEntryG.error ?? Error("indexedDB transaction aborted"));
          },
        );
      await Promise.all([
        awaitIndexedDbRequest(
          stashInputN(stashEntryG.objectStore(CRASH_STASH_OBJECT_STORE)),
        ),
        promise,
      ]);
    };
  return {
    all: async (): Promise<unknown[]> =>
      awaitIndexedDbRequest(
        (await callback())
          .transaction(CRASH_STASH_OBJECT_STORE, "readonly")
          .objectStore(CRASH_STASH_OBJECT_STORE)
          .getAll() as IDBRequest<unknown[]>,
      ),
    put: (stashInputP: Files.CrashStashEntry) =>
      stashHandlerC((stashInputQ: IDBObjectStore) => stashInputQ.put(stashInputP)),
    delete: (stashInputR: string) =>
      stashHandlerC((stashInputS: IDBObjectStore) => stashInputS.delete(stashInputR)),
  };
}
function artifactPathWithoutFrameScope(
  stashValue: Pick<Location, "pathname"> | undefined = globalThis.location,
) {
  return (stashValue?.pathname ?? "").replace(FRAME_SCOPE_PATH_PATTERN, "$1");
}
function claimCrashStashTabLock(tabId: string) {
  let locks = getNavigatorLocks();
  if (locks === undefined) {
    return () => Promise.resolve(new Set<string>());
  }
  locks
    .request(
      CRASH_STASH_TAB_LOCK_PREFIX + tabId,
      () =>
        new Promise((): void => {
          return;
        }),
    )
    .catch((): void => {
      return;
    });
  return async (): Promise<Set<string>> =>
    new Set(
      ((await locks.query()).held ?? [])
        .map((stashInputT: LockInfo) => stashInputT.name ?? "")
        .filter((stashInputU: string) =>
          stashInputU.startsWith(CRASH_STASH_TAB_LOCK_PREFIX),
        )
        .map((stashInputV: string) =>
          stashInputV.slice(CRASH_STASH_TAB_LOCK_PREFIX.length),
        ),
    );
}
function createIndexedDbCrashStashKit(stashOptionsH: IndexedCrashStashOptions) {
  let indexedDb: IDBFactory | undefined;
  try {
    indexedDb = stashOptionsH.indexedDB ?? globalThis.indexedDB;
  } catch {
    indexedDb = undefined;
  }
  if (indexedDb === undefined || typeof stashOptionsH.viewerId !== "string") {
    return null;
  }
  let tabId = stashOptionsH.tabId ?? crypto.randomUUID();
  return createCrashStashKit(
    createIndexedDbCrashStashStorage(indexedDb),
    stashOptionsH.artifactId ?? artifactPathWithoutFrameScope(),
    stashOptionsH.viewerId,
    tabId,
    stashOptionsH.now ?? Date.now,
    stashOptionsH.liveTabs ?? claimCrashStashTabLock(tabId),
  );
}
async function createCurrentArtifactCrashStash(
  scope = "",
): Promise<Files.FilesCrashStash | null> {
  let value = (await currentUserId()) ?? "",
    stashEntryH = createIndexedDbCrashStashKit({
      viewerId: value,
      artifactId:
        artifactPathWithoutFrameScope() + (scope === "" ? "" : "#" + scope),
    });
  await stashEntryH?.purgeOtherViewers();
  return stashEntryH;
}
async function applyCrashStashEdits(
  stashInputW: Files.FilesCrashStash,
  stashOptionsI: (path: string) => string | null | undefined,
): Promise<CrashStashOffer> {
  let value = await stashInputW.read();
  if (value === undefined) {
    return;
  }
  let stashEntryI = value.edits.filter((stashInputX: Files.StashedFileEdit) => {
    let stashRecordsC = stashOptionsI(stashInputX.path);
    return stashRecordsC === undefined || stashRecordsC !== stashInputX.text;
  });
  if (stashEntryI.length === 0) {
    await stashInputW.clearOffered();
    return;
  }
  return {
    ...value,
    edits: stashEntryI,
  };
}
export {
  applyCrashStashEdits,
  artifactPathWithoutFrameScope,
  awaitIndexedDbRequest,
  claimCrashStashTabLock,
  CRASH_STASH_DATABASE_NAME,
  CRASH_STASH_MAX_AGE_MS,
  CRASH_STASH_MAX_ARTIFACT_CHARS,
  CRASH_STASH_MAX_ENTRIES,
  CRASH_STASH_MAX_TOTAL_CHARS,
  CRASH_STASH_OBJECT_STORE,
  CRASH_STASH_RETENTION_LABEL,
  CRASH_STASH_TAB_LOCK_PREFIX,
  crashStashEntrySize,
  crashStashIdentityKey,
  createCrashStashKit,
  createCurrentArtifactCrashStash,
  createIndexedDbCrashStashKit,
  createIndexedDbCrashStashStorage,
  FRAME_SCOPE_PATH_PATTERN,
  getNavigatorLocks,
  isCrashStashEntry,
  stripArtifactScopeFragment,
};
export function installFilesCrashStash(): () => void {
  return () => {
    CRASH_STASH_MAX_AGE_MS = 259200000;
    CRASH_STASH_RETENTION_LABEL = "3 days";
    CRASH_STASH_MAX_ENTRIES = 64;
    CRASH_STASH_MAX_ARTIFACT_CHARS = 1e6;
    CRASH_STASH_MAX_TOTAL_CHARS = 2000000;
    crashStashIdentityKey = (stashInputY: string, stashOptionsJ: string, stashValueA: string) =>
      [stashInputY, stashOptionsJ, stashValueA].join("\x00");
    crashStashEntrySize = (stashInputZ: Files.StashedFileEdit) =>
      stashInputZ.path.length + (stashInputZ.text?.length ?? 0);
    stripArtifactScopeFragment = (artifactId: string) => artifactId.split("#")[0];
    isCrashStashEntry = (entryValue: unknown): entryValue is Files.CrashStashEntry =>
      typeof (entryValue as CrashStashWireValue | null)?.key === "string" &&
      typeof (entryValue as Files.CrashStashEntry).artifactId === "string" &&
      typeof (entryValue as Files.CrashStashEntry).viewerId === "string" &&
      Number.isFinite((entryValue as Files.CrashStashEntry).createdAt) &&
      Number.isFinite((entryValue as Files.CrashStashEntry).at) &&
      Number.isFinite((entryValue as Files.CrashStashEntry).chars) &&
      (entryValue as Files.CrashStashEntry).chars >= 0 &&
      Array.isArray((entryValue as Files.CrashStashEntry).edits) &&
      (entryValue as Files.CrashStashEntry).edits.every(
        (editValue: unknown) =>
          typeof (editValue as Partial<Files.StashedFileEdit> | null)?.path ===
            "string" &&
          (typeof (editValue as Partial<Files.StashedFileEdit>).text ===
            "string" ||
            (editValue as Partial<Files.StashedFileEdit>).text === null) &&
          (typeof (editValue as Partial<Files.StashedFileEdit>).base ===
            "string" ||
            (editValue as Partial<Files.StashedFileEdit>).base === null),
      );
    CRASH_STASH_DATABASE_NAME = "appifact-crash-stash";
    CRASH_STASH_OBJECT_STORE = "entries";
    FRAME_SCOPE_PATH_PATTERN = /(^|\/)_f\/[^/]+\//;
    CRASH_STASH_TAB_LOCK_PREFIX = "appifact-stash-tab:";
    getNavigatorLocks = () => {
      try {
        return globalThis.navigator?.locks;
      } catch {
        return;
      }
    };
  };
}
