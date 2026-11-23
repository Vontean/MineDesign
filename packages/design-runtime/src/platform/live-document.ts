import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { CommentsValue } from "./comment-documents";
import { maxDocumentComments, parseDocumentComments } from "./comments";
import { DATABASE_ACCESS_DENIED_CODES, normalizeDatabaseError } from "./database-adapter";
import { normalizeDocumentTitle, normalizeNewDocumentTitle } from "./database-document-store";
import { countRecordNulls, deepMerge, DELETE_DOCUMENT, diffRecord, dirname, isPlainRecord, mergeCompatibleRecords, removeNullValues, serializedDocumentBytes, structurallyEqual } from "./document-values";
import { recordEdit } from "./edit-count";

var liveDocumentFlushers: Dynamic;
var LIVE_WRITE_DEBOUNCE_MS: Dynamic;
var LIVE_WRITE_MAX_WAIT_MS: Dynamic;
var LIVE_INITIAL_LOAD_TIMEOUT_MS: Dynamic;
var LIVE_RECONNECT_BACKOFF_MS: Dynamic;
var LIVE_RECENT_RECONNECT_DELAY_MS: Dynamic;
var LIVE_RECENT_RECONNECT_WINDOW_MS: Dynamic;
var LIVE_MAX_RECOVERY_RETRIES: Dynamic;
var LIVE_WRITE_ACK_TIMEOUT_MS: Dynamic;
var LIVE_STUCK_WRITE_TIMEOUT_MS: Dynamic;
var LIVE_MAX_PATCH_PROPERTY_COUNT: Dynamic;
var LIVE_CONFLICT_RETRY_MS: Dynamic;
var LIVE_WRITE_RETRY_INITIAL_BACKOFF_MS: Dynamic;
var LIVE_MAX_WRITE_RETRY_BACKOFF_MS: Dynamic;
var LIVE_RETRY_INITIAL_BACKOFF_MS: Dynamic;
var LIVE_RETRY_MAX_BACKOFF_MS: Dynamic;
var LIVE_ERROR_SURFACE_DELAY_MS: Dynamic;
var LIVE_FRAME_FALLBACK_DELAY_MS: Dynamic;
var LIVE_MAX_ACKNOWLEDGED_WRITES: Dynamic;
var LIVE_EXTENDED_LOAD_TIMEOUT_MS: Dynamic;
var LIVE_MAX_INFLIGHT_WRITES: Dynamic;
var LIVE_SYNC_EXPLANATION: Dynamic;
function registerLiveDocumentFlusher(flush?: Dynamic): Dynamic {
  liveDocumentFlushers.add(flush);
  return (): Dynamic => {
    liveDocumentFlushers.delete(flush);
  };
}
function createLiveDocumentTimers(): Dynamic {
  return {
    setTimeout: (run?: Dynamic, delayMs?: Dynamic): Dynamic =>
      setTimeout(run, delayMs),
    clearTimeout: (timer?: Dynamic): Dynamic => clearTimeout(timer),
    now: (): Dynamic => Date.now(),
    random: (): Dynamic => Math.random(),
    frame:
      typeof requestAnimationFrame == "function"
        ? (run?: Dynamic): Dynamic =>
            requestAnimationFrame((): Dynamic => run())
        : undefined,
  };
}
function formatSyncTime(timestamp?: Dynamic): Dynamic {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return new Date(timestamp).toISOString().slice(11, 16);
  }
}
function pluralizeSyncCount(count?: Dynamic, noun?: Dynamic): Dynamic {
  return count + " " + noun + (count === 1 ? "" : "s");
}
function createLiveDocument(liveOptions?: Dynamic): Dynamic {
  let { codec: codec, db: database }: Dynamic = liveOptions,
    timers: Dynamic = liveOptions.timers ?? createLiveDocumentTimers(),
    collections: Dynamic = codec.collections,
    metaPath: Dynamic = codec.metaPath,
    canWrite: Dynamic = liveOptions.canWrite;
  function parseContentOrFallback(
    rawContent?: Dynamic,
    fallbackContent?: Dynamic,
  ): Dynamic {
    try {
      return liveOptions.parseContent(rawContent);
    } catch {
      return fallbackContent;
    }
  }
  function normalizeTitle(title?: Dynamic, fallbackTitle?: Dynamic): Dynamic {
    return (
      normalizeDocumentTitle(
        typeof title == "string" ? title.trim() : title,
      ) ?? fallbackTitle
    );
  }
  let state: Dynamic = {
      title: normalizeTitle(liveOptions.defaultTitle, "Appifact"),
      content: liveOptions.initialContent,
      comments: [],
    },
    pathStates: Dynamic = new Map(),
    effectiveDocuments: Dynamic = new Map(),
    documentSizes: Dynamic = new Map(),
    decomposedDocuments: Dynamic = new Map(),
    composeCarry: Dynamic,
    loadState: Dynamic = "loading",
    loadedCollections: Dynamic = new Set(),
    collectionSubscriptions: Dynamic = [],
    subscriptionGeneration: Dynamic = 0,
    initialLoadTimer: Dynamic,
    reconnecting: Dynamic = false,
    hasCachedSnapshot: Dynamic = false,
    lastSnapshotAt: Dynamic = 0,
    refreshPathsByCollection: Dynamic,
    recreatedPaths: Dynamic = new Set(),
    hasMetadataSnapshot: Dynamic = false,
    recoveryWaitingForMetadata: Dynamic = false,
    recoveryTimer: Dynamic,
    reconnectTimer: Dynamic,
    reconnectAttempts: Dynamic = 0,
    hasRetriedAfterWrite: Dynamic = false,
    hasUnresolvedDocuments: Dynamic = false,
    hasReceivedDocument: Dynamic = false,
    recoveryAttempts: Dynamic = 0,
    firstLiveAt: Dynamic,
    shouldKeepRecovering: Dynamic = (): Dynamic =>
      (!hasMetadataSnapshot || hasUnresolvedDocuments) && (!hasReceivedDocument || recoveryAttempts < LIVE_MAX_RECOVERY_RETRIES),
    liveSyncError: Dynamic,
    inFlightWrites: Dynamic = new Map(),
    parkedWrites: Dynamic = new Map(),
    writeSequence: Dynamic = 0,
    writeFlushTimer: Dynamic,
    needsDecompose: Dynamic = false,
    writesPausedUntil: Dynamic = 0,
    rateLimitFailures: Dynamic = 0,
    firstRateLimitAt: Dynamic,
    hasWriteBackoffError: Dynamic = false,
    collectionsWithPendingWrites: Dynamic = new Set(),
    seenCollections: Dynamic = new Set(),
    cachedCollections: Dynamic = new Set(),
    hasShownContent: Dynamic = false,
    initialLoadExtended: Dynamic = false,
    cachedReconnectAvailable: Dynamic = false,
    cachedReconnectAvailabilityTimer: Dynamic,
    serializeWrites: Dynamic = false,
    lastAcknowledgedAt: Dynamic,
    saveStatusTimer: Dynamic,
    lastWriteRetryAt: Dynamic,
    lastSyncedAt: Dynamic,
    lastError: Dynamic,
    hasSyncedWrite: Dynamic = false,
    disposed: Dynamic = false,
    contentListeners: Dynamic = new Set(),
    saveListeners: Dynamic = new Set(),
    stuckListeners: Dynamic = new Set(),
    loadListeners: Dynamic = new Set();
  function ensurePathState(path?: Dynamic): Dynamic {
    let entry: Dynamic = pathStates.get(path);
    entry === undefined &&
      ((entry = {
        exists: false,
        removedSeen: false,
        acked: [],
        firstAt: 0,
        lastAt: 0,
        due: false,
        notBefore: 0,
        failures: 0,
        seq: 0,
        held: false,
      }),
      pathStates.set(path, entry));
    return entry;
  }
  function applyPendingPatch(
    baseDocument?: Dynamic,
    pending?: Dynamic,
    wasRemoved: Dynamic = false,
  ): Dynamic {
    if (pending === undefined) return baseDocument;
    if (
      pending.patch !== DELETE_DOCUMENT &&
      !(baseDocument === undefined && !pending.replace && wasRemoved)
    )
      return pending.replace || baseDocument === undefined
        ? pending.patch
        : deepMerge(baseDocument, pending.patch);
  }
  function effectivePathValue(path?: Dynamic): Dynamic {
    let entry: Dynamic = pathStates.get(path);
    if (entry === undefined) return;
    let document: Dynamic =
        entry.held && entry.heldBase !== undefined
          ? (entry.heldBase ?? undefined)
          : entry.server,
      wasRemoved: Dynamic = entry.removedSeen && entry.server === undefined;
    for (let acknowledgedWrite of entry.acked as Dynamic)
      document = acknowledgedWrite.del
        ? undefined
        : applyPendingPatch(document, acknowledgedWrite, wasRemoved);
    entry.inflightEchoed !== true &&
      (document = applyPendingPatch(document, entry.inflight, wasRemoved));
    document = applyPendingPatch(document, entry.pending, wasRemoved);
    return document;
  }
  function updateEffectiveDocument(path?: Dynamic): Dynamic {
    let effective: Dynamic = effectivePathValue(path),
      normalized: Dynamic =
        effective === undefined
          ? undefined
          : removeNullValues(effective),
      entry: Dynamic = effectiveDocuments.get(path);
    return normalized === undefined
      ? entry === undefined
        ? false
        : (effectiveDocuments.delete(path),
          documentSizes.delete(path),
          true)
      : entry !== undefined && structurallyEqual(entry, normalized)
        ? false
        : (effectiveDocuments.set(path, normalized),
          documentSizes.set(
            path,
            serializedDocumentBytes(normalized),
          ),
          true);
  }
  function collectionContentSize(
    collectionPath?: Dynamic,
    excludePath?: Dynamic,
  ): Dynamic {
    let bytes: Dynamic = 0;
    for (let [path, documentBytes] of documentSizes as Dynamic) {
      if (path === excludePath || dirname(path) !== collectionPath)
        continue;
      let entry: Dynamic = pathStates.get(path);
      bytes +=
        entry?.parked !== undefined
          ? entry.server !== undefined
            ? serializedDocumentBytes(entry.server)
            : 0
          : documentBytes;
    }
    return bytes;
  }
  function isLoaded(): Dynamic {
    return loadState === "live" || loadState === "cached";
  }
  function pendingWriteCount(): Dynamic {
    let count: Dynamic = 0;
    for (let pathState of pathStates.values() as Dynamic)
      pathState.pending !== undefined && (count += 1);
    for (let path of inFlightWrites.keys() as Dynamic)
      pathStates.get(path)?.pending === undefined && (count += 1);
    return count + (needsDecompose ? 1 : 0);
  }
  function getSaveState(): Dynamic {
    if (liveSyncError !== undefined)
      return {
        status: "readonly",
        get message() { return uiMessage("canvas.liveDocument.liveSyncEndedForThisViewReloadToContinue"); },
      };
    if (loadState === "loading")
      return {
        status: "loading",
        get message() { return uiMessage("canvas.liveDocument.loadingTheLatestContent"); },
      };
    if (loadState === "failed")
      return {
        status: "error",
        get message() { return uiMessage("canvas.liveDocument.theLatestContentFailedToLoadClickToRetry"); },
      };
    if (loadState === "cached") {
      if (!canWrite)
        return {
          status: "readonly",
          get message() { return uiMessage("canvas.liveDocument.showingASavedCopyReconnecting"); },
        };
      if (
        pendingWriteCount() === 0 &&
        inFlightWrites.size === 0 &&
        parkedWrites.size === 0
      )
        return collectionsWithPendingWrites.size > 0
          ? {
              status: "cached",
              get message() { return uiMessage("canvas.liveDocument.showingYourSavedCopyYourChangesWillSyncWhenYouReBackOnline"); },
            }
          : {
              status: "cached",
              get message() { return uiMessage("canvas.liveDocument.showingYourSavedCopyReconnecting"); },
            };
    }
    if (reconnecting)
      return canWrite
        ? {
            status: "error",
            get message() { return uiMessage("canvas.liveDocument.liveUpdatesStoppedReconnectingClickToRetryNowYourEditsAreKeptOnThisScreen"); },
          }
        : {
            status: "readonly",
            get message() { return uiMessage("canvas.liveDocument.liveUpdatesStoppedReconnecting"); },
          };
    if (!canWrite)
      return {
        status: "readonly",
        message:
          liveOptions.readOnlyReason ??
          "Read-only. You\u2019re seeing live changes.",
      };
    let pendingCount: Dynamic = pendingWriteCount();
    if (parkedWrites.size > 0) {
      let [parkedReason]: Dynamic = parkedWrites.values(),
        wasRefused: Dynamic = lastError?.code === "refused";
      return {
        status: "error",
        message:
          (parkedReason ?? "A change could not be stored.") +
          (pendingCount > parkedWrites.size
            ? " Other changes keep syncing."
            : "") +
          (wasRefused
            ? " Shorten it to resume syncing this item."
            : " Click to retry."),
      };
    }
    return hasWriteBackoffError ||
      (firstRateLimitAt !== undefined &&
        timers.now() - firstRateLimitAt > LIVE_ERROR_SURFACE_DELAY_MS)
      ? {
          status: "error",
          message:
            (inFlightWrites.size > 0
              ? "The store is unreachable. Retrying now."
              : "The store is unreachable. Retrying shortly; click to retry now.") +
            " Your edits are kept on this screen.",
        }
      : inFlightWrites.size > 0
        ? {
            status: "saving",
            get message() { return uiMessage("canvas.liveDocument.syncing"); },
          }
        : pendingCount > 0
          ? {
              status: "dirty",
              message:
                pluralizeSyncCount(pendingCount, "change") + " waiting to sync.",
            }
          : collectionsWithPendingWrites.size > 0
            ? lastAcknowledgedAt !== undefined &&
              timers.now() - lastAcknowledgedAt < LIVE_WRITE_ACK_TIMEOUT_MS
              ? ((saveStatusTimer ??= timers.setTimeout(
                  (): Dynamic => {
                    saveStatusTimer = undefined;
                    notifySaveState();
                  },
                  lastAcknowledgedAt + LIVE_WRITE_ACK_TIMEOUT_MS - timers.now(),
                )),
                {
                  status: "saving",
                  get message() { return uiMessage("canvas.liveDocument.syncing"); },
                })
              : {
                  status: "dirty",
                  get message() { return uiMessage("canvas.liveDocument.changesSavedOnThisDeviceNotYetSynced"); },
                }
            : {
                status: "ready",
                message:
                  (lastSyncedAt !== undefined
                    ? "All changes synced \xB7 " + formatSyncTime(lastSyncedAt)
                    : hasSyncedWrite
                      ? "All changes synced"
                      : "Synced") +
                  ". " +
                  LIVE_SYNC_EXPLANATION,
              };
  }
  let lastSaveStateKey: Dynamic = "";
  function notifySaveState(): Dynamic {
    let saveState: Dynamic = getSaveState(),
      nextSaveStateKey: Dynamic = saveState.status + "|" + (saveState.message ?? "");
    if (nextSaveStateKey !== lastSaveStateKey) {
      lastSaveStateKey = nextSaveStateKey;
      for (let listener of [...saveListeners] as Dynamic) listener(saveState);
    }
  }
  function notifyContent(isRemote?: Dynamic): Dynamic {
    for (let listener of [...contentListeners] as Dynamic)
      listener(
        isRemote
          ? {
              remote: true,
            }
          : undefined,
      );
    notifySaveState();
  }
  function setLoadState(nextLoadState?: Dynamic): Dynamic {
    if (loadState !== nextLoadState) {
      loadState = nextLoadState;
      for (let listener of [...loadListeners] as Dynamic) listener();
      notifySaveState();
    }
  }
  function composeDocument(isRemote?: Dynamic): Dynamic {
    needsDecompose && decomposeChanges();
    let composition: Dynamic;
    try {
      composition = codec.compose(effectiveDocuments, composeCarry);
    } catch (error: Dynamic) {
      console.error(
        "appifact sync: compose failed; keeping the current content",
        error,
      );
      return;
    }
    composeCarry = composition.carry;
    hasUnresolvedDocuments = composition.dangling.some(
      (path?: Dynamic): Dynamic =>
        pathStates.get(path)?.removedSeen !== true,
    );
    loadState === "live" &&
      (hasUnresolvedDocuments && reconnectTimer === undefined && recoveryTimer === undefined
        ? schedulePeriodicRefresh()
        : !hasUnresolvedDocuments && hasMetadataSnapshot && !recoveryWaitingForMetadata && (clearReconnectTimer(), (reconnectAttempts = 0)));
    state = {
      title: normalizeTitle(composition.title, state.title),
      content: parseContentOrFallback(composition.content, state.content),
      comments: parseDocumentComments(composition.comments),
    };
    decomposedDocuments = new Map(
      codec.decompose(state, decomposedDocuments, composeCarry),
    );
    notifyContent(isRemote);
  }
  function changeDocument(nextDocument?: Dynamic): Dynamic {
    state = nextDocument;
    if (!needsDecompose) {
      needsDecompose = true;
      let isPageHidden: Dynamic =
        typeof document !== "undefined" &&
        (document as Dynamic).visibilityState === "hidden";
      timers.frame !== undefined && !isPageHidden
        ? timers.frame(decomposeChanges)
        : timers.setTimeout(decomposeChanges, LIVE_FRAME_FALLBACK_DELAY_MS);
    }
    notifyContent(false);
  }
  function decomposeChanges(): Dynamic {
    if (!needsDecompose || disposed) return;
    needsDecompose = false;
    let nextDocuments: Dynamic = new Map(
        codec.decompose(state, decomposedDocuments, composeCarry),
      ),
      previousDocuments: Dynamic = decomposedDocuments;
    decomposedDocuments = nextDocuments;
    if (liveSyncError !== undefined || !canWrite || !isLoaded()) {
      notifySaveState();
      return;
    }
    let now: Dynamic = timers.now(),
      queuedWrites: Dynamic = false;
    for (let [path, document] of nextDocuments as Dynamic) {
      let previousDocument: Dynamic = previousDocuments.get(path);
      if (previousDocument === document) continue;
      let patch: Dynamic = diffRecord(previousDocument, document);
      if (patch === null) continue;
      let pathState: Dynamic = pathStates.get(path),
        hasNoStoredDocument: Dynamic =
          pathState === undefined ||
          (pathState.server === undefined &&
            !pathState.exists &&
            !pathState.removedSeen &&
            pathState.inflight === undefined &&
            pathState.pending === undefined),
        isDeletedMetadata: Dynamic =
          path === metaPath &&
          pathState !== undefined &&
          pathState.removedSeen &&
          pathState.server === undefined &&
          !pathState.exists;
      previousDocument !== undefined && (hasNoStoredDocument || isDeletedMetadata)
        ? queueReplacement(
            path,
            document,
            now,
            hasNoStoredDocument ? previousDocument : undefined,
          )
        : previousDocument !== undefined && codec.replaceOnly?.(path) === true
          ? queueReplacement(path, document, now)
          : queuePatch(path, patch, previousDocument === undefined, now);
      queuedWrites = true;
    }
    for (let path of previousDocuments.keys() as Dynamic)
      nextDocuments.has(path) ||
        (queueDeletion(path, now), (queuedWrites = true));
    queuedWrites ? scheduleWriteFlush() : notifySaveState();
  }
  function queuePatch(
    path?: Dynamic,
    patch?: Dynamic,
    isNewDocument?: Dynamic,
    queuedAt?: Dynamic,
  ): Dynamic {
    let pathState: Dynamic = ensurePathState(path),
      pending: Dynamic = pathState.pending;
    touchPendingState(pathState, queuedAt, pending === undefined);
    pending === undefined || pending.patch === DELETE_DOCUMENT
      ? ((pathState.pending = {
          patch: patch,
          replace: pending !== undefined || isNewDocument,
        }),
        pathState.pending.replace && (pathState.reAdd = !pathState.exists))
      : pending.replace
        ? (pathState.pending = {
            patch: removeNullValues(
              deepMerge(pending.patch, patch),
            ),
            replace: true,
          })
        : ((pathState.pending = undefined),
          (pathState.pending = combinePendingPatches(
            pending.patch,
            patch,
            effectivePathValue(path),
          )),
          pathState.pending === undefined &&
            withdrawPendingWrite(path, pathState));
    pathState.pending !== undefined && validatePendingWrite(path, pathState);
    updateEffectiveDocument(path);
  }
  function queueReplacement(
    path?: Dynamic,
    document?: Dynamic,
    queuedAt?: Dynamic,
    createBase?: Dynamic,
  ): Dynamic {
    let pathState: Dynamic = ensurePathState(path);
    touchPendingState(pathState, queuedAt, pathState.pending === undefined);
    pathState.pending = {
      patch: removeNullValues(document),
      replace: true,
    };
    pathState.reAdd = !pathState.exists;
    createBase !== undefined && (pathState.createBase ??= createBase);
    validatePendingWrite(path, pathState);
    updateEffectiveDocument(path);
  }
  function rebaseReplacementPatch(
    baseDocument?: Dynamic,
    replacement?: Dynamic,
    remoteDocument?: Dynamic,
  ): Dynamic {
    let patch: Dynamic = diffRecord(baseDocument, replacement);
    if (patch === null) return null;
    let rebasedPatch: Dynamic = {
      ...patch,
    };
    for (let key of Object.keys(rebasedPatch) as Dynamic) {
      let baseValue: Dynamic = baseDocument[key],
        localValue: Dynamic = replacement[key],
        remoteValue: Dynamic = remoteDocument[key],
        isStringList: Dynamic = (candidate?: Dynamic): Dynamic =>
          Array.isArray(candidate) &&
          candidate.every(
            (item?: Dynamic): Dynamic => typeof item == "string",
          );
      if (!isStringList(baseValue) || !isStringList(localValue) || !isStringList(remoteValue))
        continue;
      let mergedList: Dynamic = [
        ...remoteValue,
        ...localValue.filter(
          (item?: Dynamic): Dynamic =>
            !baseValue.includes(item) && !remoteValue.includes(item),
        ),
      ];
      structurallyEqual(mergedList, remoteValue)
        ? delete rebasedPatch[key]
        : (rebasedPatch[key] = mergedList);
    }
    return Object.keys(rebasedPatch).length === 0 ? null : rebasedPatch;
  }
  function combinePendingPatches(
    earlierPatch?: Dynamic,
    laterPatch?: Dynamic,
    baseDocument?: Dynamic,
  ): Dynamic {
    let compatiblePatch: Dynamic = mergeCompatibleRecords(
      earlierPatch,
      laterPatch,
    );
    if (compatiblePatch !== null)
      return {
        patch: compatiblePatch,
        replace: false,
      };
    if (baseDocument === undefined)
      return {
        patch: deepMerge(earlierPatch, laterPatch),
        replace: false,
      };
    let combinedPatch: Dynamic = diffRecord(
      baseDocument,
      deepMerge(
        deepMerge(baseDocument, earlierPatch),
        laterPatch,
      ),
    );
    return combinedPatch === null
      ? undefined
      : {
          patch: combinedPatch,
          replace: false,
        };
  }
  function queueDeletion(path?: Dynamic, queuedAt?: Dynamic): Dynamic {
    let pathState: Dynamic = ensurePathState(path);
    touchPendingState(pathState, queuedAt, pathState.pending === undefined);
    pathState.pending = {
      patch: DELETE_DOCUMENT,
      replace: false,
    };
    pathState.parked = undefined;
    parkedWrites.delete(path);
    updateEffectiveDocument(path);
  }
  function touchPendingState(
    pathState?: Dynamic,
    queuedAt?: Dynamic,
    isFirstPendingWrite?: Dynamic,
  ): Dynamic {
    isFirstPendingWrite &&
      ((pathState.firstAt = queuedAt),
      (pathState.seq = ++writeSequence),
      (pathState.notBefore = 0));
    pathState.lastAt = queuedAt;
    pathState.due = false;
  }
  function validatePendingWrite(
    path?: Dynamic,
    pathState?: Dynamic,
  ): Dynamic {
    if (
      codec.refuse === undefined ||
      pathState.pending === undefined ||
      pathState.pending.patch === DELETE_DOCUMENT
    )
      return;
    let document: Dynamic = effectivePathValue(path);
    if (document === undefined) return;
    let collectionBytes: Dynamic =
        collectionContentSize(dirname(path), path) +
        serializedDocumentBytes(document),
      refusal: Dynamic = codec.refuse(path, document, collectionBytes);
    if (refusal === undefined) {
      pathState.parked !== undefined &&
        ((pathState.parked = undefined), parkedWrites.delete(path));
      return;
    }
    pathState.parked = refusal;
    parkedWrites.set(path, refusal);
    lastError = {
      code: "refused",
      message: refusal,
      path: path,
    };
  }
  function scheduleWriteFlush(): Dynamic {
    if (disposed || liveSyncError !== undefined) return;
    writeFlushTimer !== undefined &&
      (timers.clearTimeout(writeFlushTimer), (writeFlushTimer = undefined));
    let now: Dynamic = timers.now(),
      nextWakeAt: Dynamic = 1 / 0;
    for (let pathState of pathStates.values() as Dynamic)
      if (!(pathState.pending === undefined || pathState.parked !== undefined)) {
        if (!pathState.due) {
          let dueAt: Dynamic = Math.min(
            pathState.lastAt + LIVE_WRITE_DEBOUNCE_MS,
            pathState.firstAt + LIVE_WRITE_MAX_WAIT_MS,
          );
          dueAt <= now
            ? (pathState.due = true)
            : (nextWakeAt = Math.min(nextWakeAt, dueAt));
        }
        pathState.due &&
          pathState.notBefore > now &&
          (nextWakeAt = Math.min(nextWakeAt, pathState.notBefore));
      }
    writesPausedUntil > now && (nextWakeAt = Math.min(nextWakeAt, writesPausedUntil));
    flushDueWrites();
    nextWakeAt !== 1 / 0 &&
      writeFlushTimer === undefined &&
      (writeFlushTimer = timers.setTimeout(
        (): Dynamic => {
          writeFlushTimer = undefined;
          scheduleWriteFlush();
        },
        Math.max(0, nextWakeAt - timers.now()),
      ));
    notifySaveState();
  }
  function collectionWriteOrder(path?: Dynamic): Dynamic {
    let collectionIndex: Dynamic = collections.indexOf(dirname(path));
    return collectionIndex < 0 ? collections.length : collectionIndex;
  }
  function selectNextWrite(): Dynamic {
    let now: Dynamic = timers.now(),
      nextPath: Dynamic,
      nextDeleteRank: Dynamic = 0,
      nextCollectionRank: Dynamic = 0,
      nextSequence: Dynamic = 0;
    for (let [path, pathState] of pathStates as Dynamic) {
      if (
        pathState.pending === undefined ||
        !pathState.due ||
        pathState.notBefore > now ||
        pathState.parked !== undefined ||
        inFlightWrites.has(path)
      )
        continue;
      let deleteRank: Dynamic =
          pathState.pending.patch === DELETE_DOCUMENT ? 1 : 0,
        collectionIndex: Dynamic = collectionWriteOrder(path),
        collectionRank: Dynamic = deleteRank
          ? -collectionIndex
          : collectionIndex + (path === metaPath ? 0.5 : 0);
      (nextPath === undefined ||
        deleteRank < nextDeleteRank ||
        (deleteRank === nextDeleteRank &&
          (collectionRank < nextCollectionRank ||
            (collectionRank === nextCollectionRank && pathState.seq < nextSequence)))) &&
        ((nextPath = path),
        (nextDeleteRank = deleteRank),
        (nextCollectionRank = collectionRank),
        (nextSequence = pathState.seq));
    }
    return nextPath;
  }
  function shouldPauseWrites(): Dynamic {
    return (
      disposed ||
      liveSyncError !== undefined ||
      !canWrite ||
      !isLoaded() ||
      reconnecting ||
      inFlightWrites.size >= (serializeWrites ? 1 : LIVE_MAX_INFLIGHT_WRITES)
    );
  }
  function flushDueWrites(): Dynamic {
    let sentWrite: Dynamic = false;
    for (; !shouldPauseWrites() && writesPausedUntil <= timers.now(); ) {
      let path: Dynamic = selectNextWrite();
      if (path === undefined) break;
      sendWrite(path) && (sentWrite = true);
    }
    sentWrite && notifySaveState();
  }
  function sendWrite(path?: Dynamic): Dynamic {
    let entry: Dynamic = pathStates.get(path),
      pending: Dynamic = entry.pending;
    entry.pending = undefined;
    let write: Dynamic;
    if (pending.patch === DELETE_DOCUMENT)
      write = {
        path: path,
        verb: "delete",
        op: pending,
        sent: timers.now(),
      };
    else {
      if (
        !pending.replace &&
        entry.removedSeen &&
        !entry.exists &&
        entry.server === undefined
      ) {
        withdrawPendingWrite(path, entry);
        updateEffectiveDocument(path);
        composeDocument(true);
        entry.goneNoticed !== true &&
          liveOptions.onNotice?.(
            "An item you were editing was deleted by someone else.",
          );
        entry.goneNoticed = true;
        return false;
      }
      let documentAfterWrite: Dynamic = previewInflightValue(path, entry, pending);
      if (documentAfterWrite === undefined) return false;
      let operation: Dynamic = {
        patch: pending.patch,
        replace: pending.replace,
      };
      if (
        pending.replace &&
        entry.exists &&
        entry.server === undefined &&
        entry.removedSeen
      ) {
        let effectiveDocument: Dynamic = effectivePathValue(path),
          recreatePatch: Dynamic =
            effectiveDocument === undefined
              ? undefined
              : diffRecord(
                  effectiveDocument,
                  removeNullValues(documentAfterWrite),
                );
        if (recreatePatch === null) return false;
        recreatePatch !== undefined &&
          (operation = {
            patch: recreatePatch,
            replace: false,
          });
      }
      let shouldCompactByReplacing: Dynamic =
          !operation.replace &&
          loadState === "live" &&
          !reconnecting &&
          !entry.held &&
          entry.acked.length === 0 &&
          entry.server !== undefined &&
          countRecordNulls(
            deepMerge(entry.server, operation.patch),
          ) > LIVE_MAX_PATCH_PROPERTY_COUNT,
        sentAt: Dynamic = timers.now();
      write = operation.replace
        ? {
            path: path,
            verb: "set",
            body: removeNullValues(documentAfterWrite),
            op: {
              patch: removeNullValues(documentAfterWrite),
              replace: true,
            },
            sent: sentAt,
          }
        : shouldCompactByReplacing
          ? {
              path: path,
              verb: "set",
              body: removeNullValues(documentAfterWrite),
              op: operation,
              sent: sentAt,
            }
          : {
              path: path,
              verb: "update",
              body: operation.patch,
              op: operation,
              sent: sentAt,
            };
    }
    entry.inflight = write.op;
    entry.inflightEchoed = false;
    inFlightWrites.set(path, write);
    (write.verb === "set"
      ? database.set(path, write.body)
      : write.verb === "update"
        ? database.update(path, write.body)
        : database.del(path)
    ).then(
      (): Dynamic => handleWriteSuccess(write),
      (error?: Dynamic): Dynamic =>
        handleWriteFailure(
          write,
          normalizeDatabaseError(error),
        ),
    );
    return true;
  }
  function previewInflightValue(
    path?: Dynamic,
    pathState?: Dynamic,
    operation?: Dynamic,
  ): Dynamic {
    let inflight: Dynamic = pathState.inflight;
    pathState.inflight = operation;
    let document: Dynamic = effectivePathValue(path);
    pathState.inflight = inflight;
    return document;
  }
  function handleWriteSuccess(write?: Dynamic): Dynamic {
    if (disposed) return;
    let pathState: Dynamic = ensurePathState(write.path);
    inFlightWrites.delete(write.path);
    pathState.inflight = undefined;
    let alreadyEchoed: Dynamic = pathState.inflightEchoed === true;
    pathState.inflightEchoed = undefined;
    pathState.failures = 0;
    hasSyncedWrite = true;
    !hasReceivedDocument &&
      recoveryWaitingForMetadata &&
      !hasRetriedAfterWrite &&
      liveSyncError === undefined &&
      ((hasRetriedAfterWrite = true),
      (reconnectAttempts = 0),
      reconnecting || refreshCollectionSnapshots(),
      schedulePeriodicRefresh());
    lastSyncedAt = timers.now();
    lastAcknowledgedAt = lastSyncedAt;
    serializeWrites = false;
    clearRecoveredWriteError();
    let acknowledgedAt: Dynamic = timers.now();
    if (write.verb === "delete") {
      let existed: Dynamic = pathState.server !== undefined || pathState.exists;
      pathState.exists = false;
      existed
        ? (pathState.acked.push({
            patch: {},
            replace: false,
            del: true,
            at: acknowledgedAt,
            sent: write.sent,
            since: acknowledgedAt,
          }),
          scheduleStuckCheck(write.path))
        : (pathState.acked = []);
    } else {
      (write.verb === "set" ||
        pathState.server !== undefined ||
        !pathState.removedSeen) &&
        ((pathState.exists = true),
        (pathState.goneNoticed = undefined),
        (pathState.reAdd = undefined));
      if (
        pathState.createBase !== undefined &&
        pathState.createTheirs !== undefined &&
        write.verb === "set"
      ) {
        let rebasedDocument: Dynamic = deepMerge(
            pathState.createTheirs,
            rebaseReplacementPatch(
              pathState.createBase,
              write.body,
              pathState.createTheirs,
            ) ?? {},
          ),
          rebasedPatch: Dynamic = diffRecord(write.body, rebasedDocument);
        if (rebasedPatch !== null) {
          let pending: Dynamic = pathState.pending;
          pathState.pending =
            pending === undefined
              ? {
                  patch: rebasedPatch,
                  replace: false,
                }
              : pending.patch === DELETE_DOCUMENT || pending.replace
                ? pending
                : combinePendingPatches(rebasedPatch, pending.patch, write.body);
          pathState.pending !== undefined &&
            ((pathState.due = true),
            pathState.seq === 0 && (pathState.seq = ++writeSequence));
        }
      }
      pathState.createBase = pathState.createTheirs = undefined;
      let isReplacement: Dynamic = write.verb === "set",
        matchesServer: Dynamic =
          pathState.acked.length === 0 &&
          pathState.server !== undefined &&
          (isReplacement
            ? structurallyEqual(pathState.server, write.body)
            : containsServerPatch(pathState.server, write.body));
      if (alreadyEchoed || matchesServer) {
        for (let acknowledged of pathState.acked as Dynamic)
          advanceHeldBase(pathState, acknowledged);
        advanceHeldBase(pathState, {
          patch: write.body,
          replace: isReplacement,
          del: false,
          at: acknowledgedAt,
          sent: write.sent,
          since: acknowledgedAt,
        });
        pathState.acked = [];
      } else if (
        (pathState.acked.push({
          patch: write.body,
          replace: isReplacement,
          del: false,
          at: acknowledgedAt,
          sent: write.sent,
          since: acknowledgedAt,
        }),
        scheduleStuckCheck(write.path),
        pathState.acked.length > LIVE_MAX_ACKNOWLEDGED_WRITES)
      ) {
        let leadingDeletes: Dynamic = pathState.acked[0].del
            ? pathState.acked.slice(0, 1)
            : [],
          [earlierWrite, laterWrite, ...remainingWrites]: Dynamic = pathState.acked.slice(
            leadingDeletes.length,
          ),
          combinedPatch: Dynamic =
            laterWrite.del || laterWrite.replace || earlierWrite.del
              ? undefined
              : earlierWrite.replace
                ? deepMerge(earlierWrite.patch, laterWrite.patch)
                : mergeCompatibleRecords(
                    earlierWrite.patch,
                    laterWrite.patch,
                  ),
          useDeliveryTime: Dynamic =
            earlierWrite.replace &&
            pathState.server === undefined &&
            pathState.removedSeen &&
            pathState.deliveredAt !== undefined &&
            earlierWrite.at <= pathState.deliveredAt &&
            pathState.deliveredAt < laterWrite.at,
          firstWriteTimes: Dynamic = {
            sent: earlierWrite.sent,
            since: earlierWrite.since,
          },
          mergedWrite: Dynamic = laterWrite.del
            ? {
                patch: {},
                replace: false,
                del: true,
                at: laterWrite.at,
                ...firstWriteTimes,
              }
            : laterWrite.replace || earlierWrite.del
              ? {
                  patch: laterWrite.patch,
                  replace: true,
                  del: false,
                  at: laterWrite.at,
                  ...firstWriteTimes,
                }
              : combinedPatch != null
                ? {
                    patch: combinedPatch,
                    replace: earlierWrite.replace,
                    del: false,
                    at: useDeliveryTime ? pathState.deliveredAt : laterWrite.at,
                    ...firstWriteTimes,
                  }
                : undefined;
        mergedWrite !== undefined &&
          (pathState.acked = [...leadingDeletes, mergedWrite, ...remainingWrites]);
      }
    }
    pathState.acked.length > 0 && scheduleAckPruning();
    parkedWrites.size === 0 && (lastError = undefined);
    updateEffectiveDocument(write.path) && composeDocument(true);
    releaseDeferredEcho(write.path, write.op);
    scheduleWriteFlush();
  }
  let ackPruningTimer: Dynamic;
  function acknowledgementDeadline(
    pathState?: Dynamic,
    acknowledgedWrite?: Dynamic,
  ): Dynamic {
    if (pathState.deliveredAt === undefined || pathState.deliveredAt < acknowledgedWrite.sent)
      return;
    if (pathState.server !== undefined || !pathState.removedSeen)
      return acknowledgedWrite.at + LIVE_WRITE_ACK_TIMEOUT_MS;
    if (
      reconnecting ||
      (pathState.inflight !== undefined &&
        pathState.inflight.patch !== DELETE_DOCUMENT)
    )
      return;
    let latestChangeAt: Dynamic = Math.max(pathState.deliveredAt, acknowledgedWrite.at);
    for (let write of pathState.acked as Dynamic)
      !write.del &&
        !write.replace &&
        (latestChangeAt = Math.max(latestChangeAt, write.at));
    return latestChangeAt + LIVE_WRITE_ACK_TIMEOUT_MS;
  }
  function pruneAcknowledgedWrites(
    path?: Dynamic,
    pathState?: Dynamic,
    now?: Dynamic,
  ): Dynamic {
    let previousAckCount: Dynamic = pathState.acked.length,
      hasExpired: Dynamic = (write?: Dynamic): Dynamic =>
        (acknowledgementDeadline(pathState, write) ?? 1 / 0) <= now;
    for (let write of pathState.acked as Dynamic)
      hasExpired(write) && advanceHeldBase(pathState, write);
    pathState.acked = pathState.acked.filter(
      (write?: Dynamic): Dynamic => !hasExpired(write),
    );
    pathState.server === undefined &&
      pathState.removedSeen &&
      pathState.exists &&
      (!pathState.acked.some((write?: Dynamic): Dynamic => write.replace) ||
        pathState.acked[pathState.acked.length - 1].del) &&
      ((pathState.exists = false),
      discardInvalidPending(path, pathState, true) &&
        pathState.goneNoticed !== true &&
        (liveOptions.onNotice?.(
          "An item you were editing was deleted by someone else.",
        ),
        (pathState.goneNoticed = true)));
    return (
      pathState.acked.length !== previousAckCount &&
      !pathState.held &&
      updateEffectiveDocument(path)
    );
  }
  function discardInvalidPending(
    path?: Dynamic,
    pathState?: Dynamic,
    discardReplacement?: Dynamic,
  ): Dynamic {
    return pathState.pending === undefined ||
      pathState.pending.patch === DELETE_DOCUMENT ||
      (pathState.pending.replace && !discardReplacement)
      ? false
      : (withdrawPendingWrite(path, pathState), true);
  }
  function advanceHeldBase(pathState?: Dynamic, acknowledgedWrite?: Dynamic): Dynamic {
    !pathState.held ||
      pathState.heldBase === undefined ||
      acknowledgedWrite.del ||
      (pathState.heldBase =
        applyPendingPatch(pathState.heldBase ?? undefined, acknowledgedWrite) ?? null);
  }
  function scheduleStuckCheck(path?: Dynamic): Dynamic {
    stuckListeners.size !== 0 &&
      timers.setTimeout((): Dynamic => {
        let entry: Dynamic = pathStates.get(path);
        if (
          disposed ||
          liveSyncError !== undefined ||
          reconnecting ||
          loadState !== "live" ||
          entry === undefined ||
          entry.pending !== undefined ||
          entry.inflight !== undefined
        )
          return;
        let oldestPendingEchoAt: Dynamic = entry.acked.reduce(
          (earliest?: Dynamic, write?: Dynamic): Dynamic =>
            earliest === undefined || write.since < earliest
              ? write.since
              : earliest,
          undefined,
        );
        if (
          oldestPendingEchoAt === undefined ||
          oldestPendingEchoAt > timers.now() - LIVE_STUCK_WRITE_TIMEOUT_MS ||
          entry.stuckSaid === oldestPendingEchoAt
        )
          return;
        let effectiveDocument: Dynamic = effectivePathValue(path),
          stuckReason: Dynamic =
            entry.server === undefined
              ? entry.removedSeen && effectiveDocument !== undefined
                ? "ghost"
                : undefined
              : structurallyEqual(effectiveDocument ?? null, entry.server)
                ? undefined
                : "stale";
        if (stuckReason !== undefined) {
          entry.stuckSaid = oldestPendingEchoAt;
          for (let listener of [...stuckListeners] as Dynamic)
            listener(stuckReason);
        }
      }, LIVE_STUCK_WRITE_TIMEOUT_MS + LIVE_FRAME_FALLBACK_DELAY_MS);
  }
  function scheduleAckPruning(): Dynamic {
    if (ackPruningTimer !== undefined) return;
    let firstDeadline: Dynamic = 1 / 0,
      scheduledAt: Dynamic = timers.now();
    for (let pathState of pathStates.values() as Dynamic)
      for (let write of pathState.acked as Dynamic)
        firstDeadline = Math.min(
          firstDeadline,
          acknowledgementDeadline(pathState, write) ?? 1 / 0,
        );
    firstDeadline !== 1 / 0 &&
      (ackPruningTimer = timers.setTimeout(
        (): Dynamic => {
          ackPruningTimer = undefined;
          let now: Dynamic = timers.now(),
            documentsChanged: Dynamic = false;
          for (let [path, pathState] of pathStates as Dynamic)
            pathState.acked.length > 0 &&
              pruneAcknowledgedWrites(path, pathState, now) &&
              (documentsChanged = true);
          documentsChanged && composeDocument(true);
          scheduleAckPruning();
        },
        Math.max(LIVE_FRAME_FALLBACK_DELAY_MS, firstDeadline - scheduledAt),
      ));
  }
  function clearRecoveredWriteError(): Dynamic {
    [...pathStates.values()].some(
      (pathState?: Dynamic): Dynamic =>
        pathState.failures > 0 &&
        (pathState.pending !== undefined || pathState.inflight !== undefined),
    ) ||
      ((hasWriteBackoffError = false),
      (lastWriteRetryAt = undefined),
      (rateLimitFailures = 0),
      (firstRateLimitAt = undefined));
  }
  function withdrawPendingWrite(
    path?: Dynamic,
    pathState?: Dynamic,
  ): Dynamic {
    pathState.pending = undefined;
    pathState.parked = undefined;
    parkedWrites.delete(path);
    pathState.failures = 0;
    pathState.notBefore = 0;
    parkedWrites.size === 0 && (lastError = undefined);
    clearRecoveredWriteError();
  }
  function writeFailureBackoff(failures?: Dynamic): Dynamic {
    return Math.min(
      LIVE_MAX_WRITE_RETRY_BACKOFF_MS,
      LIVE_WRITE_RETRY_INITIAL_BACKOFF_MS * 2 ** Math.max(0, failures - 2),
    );
  }
  function restoreFailedWrite(failedWrite?: Dynamic, pathState?: Dynamic): Dynamic {
    let pending: Dynamic = pathState.pending;
    if (
      failedWrite.op.replace &&
      failedWrite.op.patch !== DELETE_DOCUMENT &&
      pathState.createBase !== undefined &&
      pathState.server !== undefined
    ) {
      let replacement: Dynamic =
          pending !== undefined && pending.patch !== DELETE_DOCUMENT
            ? pending.replace
              ? pending.patch
              : removeNullValues(
                  deepMerge(failedWrite.op.patch, pending.patch),
                )
            : failedWrite.op.patch,
        rebasedPatch: Dynamic = rebaseReplacementPatch(
          pathState.createBase,
          replacement,
          pathState.server,
        );
      pathState.createBase = pathState.createTheirs = undefined;
      pathState.pending =
        pending !== undefined && pending.patch === DELETE_DOCUMENT
          ? pending
          : rebasedPatch === null
            ? undefined
            : {
                patch: rebasedPatch,
                replace: false,
              };
      pathState.pending !== undefined &&
        ((pathState.due = true),
        pathState.seq === 0 && (pathState.seq = ++writeSequence));
      return;
    }
    if (failedWrite.op.patch === DELETE_DOCUMENT)
      pending === undefined && (pathState.pending = failedWrite.op);
    else if (pending === undefined) pathState.pending = failedWrite.op;
    else if (pending.patch !== DELETE_DOCUMENT)
      if (pending.replace) pathState.pending = pending;
      else if (failedWrite.op.replace)
        pathState.pending = {
          patch: removeNullValues(
            deepMerge(failedWrite.op.patch, pending.patch),
          ),
          replace: true,
        };
      else {
        let server: Dynamic = pathState.server;
        for (let write of pathState.acked as Dynamic)
          server = write.del
            ? undefined
            : applyPendingPatch(server, write);
        pathState.pending = combinePendingPatches(
          failedWrite.op.patch,
          pending.patch,
          server,
        );
        pathState.pending === undefined &&
          withdrawPendingWrite(failedWrite.path, pathState);
      }
    pathState.pending !== undefined &&
      ((pathState.due = true),
      pathState.seq === 0 && (pathState.seq = ++writeSequence));
  }
  function handleWriteFailure(write?: Dynamic, error?: Dynamic): Dynamic {
    if (disposed) return;
    let pathState: Dynamic = ensurePathState(write.path),
      entry: Dynamic = deferredChanges.get(write.path),
      canRetry: Dynamic =
        error.code === "unavailable" ||
        error.code === "resource_exhausted";
    entry?.type === "removed"
      ? (deferredChanges.delete(write.path), pendingServerChanges.push(entry), applyServerChanges())
      : canRetry || deferredChanges.delete(write.path);
    inFlightWrites.delete(write.path);
    pathState.inflight = undefined;
    pathState.inflightEchoed = undefined;
    let failedAt: Dynamic = timers.now();
    if (DATABASE_ACCESS_DENIED_CODES.includes(error.code)) {
      restoreFailedWrite(write, pathState);
      return endLiveSync(error);
    }
    (error.code === "unavailable" ||
      error.code === "resource_exhausted") &&
      (serializeWrites = true);
    if (error.code === "unavailable") {
      pathState.failures += 1;
      restoreFailedWrite(write, pathState);
      if (pathState.pending !== undefined)
        if (pathState.failures === 1) {
          let [minRetryDelayMs, maxRetryDelayMs]: Dynamic = LIVE_CONFLICT_RETRY_MS;
          pathState.notBefore =
            failedAt + minRetryDelayMs + timers.random() * (maxRetryDelayMs - minRetryDelayMs);
        } else {
          hasWriteBackoffError = true;
          pathState.notBefore = failedAt + writeFailureBackoff(pathState.failures);
          lastWriteRetryAt = pathState.notBefore;
          lastError = {
            code: error.code,
            message: error.message,
            path: write.path,
          };
        }
    } else
      error.code === "resource_exhausted"
        ? (restoreFailedWrite(write, pathState),
          pathState.pending !== undefined &&
            ((rateLimitFailures += 1),
            (writesPausedUntil =
              failedAt +
              Math.min(
                LIVE_RETRY_MAX_BACKOFF_MS,
                LIVE_RETRY_INITIAL_BACKOFF_MS * 2 ** (rateLimitFailures - 1),
              )),
            (firstRateLimitAt ??= failedAt),
            (lastError = {
              code: error.code,
              message: error.message,
              path: write.path,
            })))
        : error.code === "invalid_argument" &&
            write.verb === "update" &&
            pathState.removedSeen &&
            pathState.server === undefined
          ? (pathState.pending !== undefined &&
            (pathState.pending.patch === DELETE_DOCUMENT ||
              (pathState.pending.replace && !pathState.exists))
              ? ((pathState.failures = 0), clearRecoveredWriteError())
              : withdrawPendingWrite(write.path, pathState),
            (pathState.exists = false),
            (pathState.acked = []),
            updateEffectiveDocument(write.path) && composeDocument(true),
            pathState.goneNoticed !== true &&
              liveOptions.onNotice?.(
                "An item you were editing was deleted by someone else.",
              ),
            (pathState.goneNoticed = true))
          : parkRejectedWrite(write, pathState, error);
    pathState.pending === undefined && deferredChanges.delete(write.path);
    updateEffectiveDocument(write.path) && composeDocument(true);
    pathState.acked.length > 0 && scheduleAckPruning();
    scheduleWriteFlush();
  }
  function parkRejectedWrite(
    write?: Dynamic,
    pathState?: Dynamic,
    error?: Dynamic,
  ): Dynamic {
    restoreFailedWrite(write, pathState);
    if (pathState.pending === undefined) return;
    let document: Dynamic = effectivePathValue(write.path),
      reason: Dynamic =
        (document !== undefined
          ? codec.refuse?.(
              write.path,
              document,
              collectionContentSize(dirname(write.path)),
            )
          : undefined) ??
        "This change can\u2019t be stored (" + error.message + ").";
    pathState.parked = reason;
    parkedWrites.set(write.path, reason);
    lastError = {
      code: error.code,
      message: reason,
      path: write.path,
    };
  }
  function retryParkedWrites(): Dynamic {
    for (let [path, pathState] of pathStates as Dynamic)
      pathState.parked !== undefined &&
        ((pathState.parked = undefined),
        parkedWrites.delete(path),
        validatePendingWrite(path, pathState),
        pathState.parked === undefined && (pathState.due = true));
  }
  function flushPendingNow(): Dynamic {
    needsDecompose && decomposeChanges();
    let now: Dynamic = timers.now();
    for (let pathState of pathStates.values() as Dynamic)
      pathState.pending !== undefined &&
        ((pathState.due = true),
        (pathState.notBefore = Math.min(pathState.notBefore, now)));
    writesPausedUntil = 0;
    scheduleWriteFlush();
  }
  function endLiveSync(error?: Dynamic): Dynamic {
    if (liveSyncError === undefined) {
      unsubscribeCollections();
      clearTimers();
      if (!hasShownContent) {
        disposed = true;
        removeLifecycleListeners();
        liveOptions.onStoreUnavailable(
          error.code + (error.message ? ": " + error.message : ""),
        );
        return;
      }
      liveSyncError = error;
      loadState === "cached" && (cachedReconnectAvailable = true);
      for (let listener of [...loadListeners] as Dynamic) listener();
      liveOptions.onNotice?.(
        "Live sync ended for this view. Reload the page to continue editing.",
      );
      notifyContent(false);
    }
  }
  function clearTimers(): Dynamic {
    for (let timer of [
      writeFlushTimer,
      initialLoadTimer,
      ackPruningTimer,
      resubscribeTimer,
      reconnectTimer,
      recoveryTimer,
      cachedReconnectAvailabilityTimer,
      cachedReconnectTimer,
      saveStatusTimer,
    ] as Dynamic)
      timer !== undefined && timers.clearTimeout(timer);
    writeFlushTimer =
      initialLoadTimer =
      ackPruningTimer =
      resubscribeTimer =
      reconnectTimer =
      recoveryTimer =
      cachedReconnectAvailabilityTimer =
      cachedReconnectTimer =
      saveStatusTimer =
        undefined;
  }
  let pendingServerChanges: Dynamic = [],
    serverFlushScheduled: Dynamic = false,
    resumeWritesAfterReconnect: Dynamic = false,
    reconnectTimeoutExtended: Dynamic = false,
    cachedReconnectTimer: Dynamic,
    cachedReconnectAttempts: Dynamic = 0,
    deferredChanges: Dynamic = new Map(),
    deferredOperations: Dynamic = new Map();
  function deferPendingServerEcho(
    change?: Dynamic,
    snapshotInfo?: Dynamic,
  ): Dynamic {
    if (!snapshotInfo.hasPendingWrites || !inFlightWrites.has(change.path))
      return false;
    if (
      change.type === "removed" &&
      inFlightWrites.get(change.path).verb !== "delete"
    ) {
      deferredChanges.delete(change.path);
      return false;
    }
    deferredChanges.set(change.path, change);
    deferredOperations.set(change.path, inFlightWrites.get(change.path).op);
    let entry: Dynamic = pathStates.get(change.path),
      inflight: Dynamic = entry?.inflight;
    entry !== undefined &&
      entry.createBase !== undefined &&
      change.type !== "removed" &&
      inflight !== undefined &&
      inflight.patch !== DELETE_DOCUMENT &&
      inflight.replace &&
      !structurallyEqual(change.data ?? {}, inflight.patch) &&
      (entry.createTheirs = change.data ?? {});
    return true;
  }
  function releaseDeferredEcho(path?: Dynamic, completedOperation?: Dynamic): Dynamic {
    let entry: Dynamic = deferredChanges.get(path),
      deferredOperation: Dynamic = deferredOperations.get(path);
    deferredChanges.delete(path);
    deferredOperations.delete(path);
    entry !== undefined &&
      ((deferredOperation !== undefined && !equalPendingOperations(deferredOperation, completedOperation)) ||
        (pendingServerChanges.push(entry), applyServerChanges()));
  }
  function equalPendingOperations(
    left?: Dynamic,
    right?: Dynamic,
  ): Dynamic {
    return left === right
      ? true
      : left.patch === DELETE_DOCUMENT ||
          right.patch === DELETE_DOCUMENT
        ? left.patch === right.patch
        : left.replace === right.replace &&
          structurallyEqual(left.patch, right.patch);
  }
  function handleCollectionSnapshot(
    collectionPath?: Dynamic,
    changes?: Dynamic,
    snapshotInfo?: Dynamic,
  ): Dynamic {
    if (disposed || liveSyncError !== undefined) return;
    reconnecting && collectionSubscriptions.length > 0 && !snapshotInfo.fromCache
      ? ((reconnecting = false),
        (resubscribeAttempts = 0),
        resubscribeTimer !== undefined &&
          (timers.clearTimeout(resubscribeTimer), (resubscribeTimer = undefined)),
        (resumeWritesAfterReconnect = true),
        loadState === "cached" && cachedReconnectAvailable && scheduleCachedReconnect())
      : reconnecting &&
        collectionSubscriptions.length > 0 &&
        resubscribeTimer !== undefined &&
        !reconnectTimeoutExtended &&
        ((reconnectTimeoutExtended = true),
        scheduleReconnectTimeout(LIVE_EXTENDED_LOAD_TIMEOUT_MS));
    let applicableChanges: Dynamic = (
      snapshotInfo.fromCache
        ? changes.map(
            (change?: Dynamic): Dynamic => ({
              ...change,
              cached: true,
            }),
          )
        : changes
    ).filter(
      (change?: Dynamic): Dynamic => !deferPendingServerEcho(change, snapshotInfo),
    );
    for (let change of changes as Dynamic)
      (!snapshotInfo.hasPendingWrites || !inFlightWrites.has(change.path)) &&
        deferredChanges.delete(change.path);
    for (let change of applicableChanges as Dynamic) pendingServerChanges.push(change);
    snapshotInfo.fromCache ? (hasCachedSnapshot = true) : loadedCollections.add(collectionPath);
    if (snapshotInfo.fromCache) cachedCollections.add(collectionPath);
    else if (cachedCollections.delete(collectionPath)) {
      let deliveredAt: Dynamic = timers.now();
      for (let [path, pathState] of pathStates as Dynamic)
        dirname(path) === collectionPath &&
          (pathState.deliveredAt = deliveredAt);
    }
    seenCollections.add(collectionPath);
    snapshotInfo.hasPendingWrites ? collectionsWithPendingWrites.add(collectionPath) : collectionsWithPendingWrites.delete(collectionPath);
    applicableChanges.some((change?: Dynamic): Dynamic => change.type !== "removed") &&
      (hasReceivedDocument = true);
    !hasMetadataSnapshot &&
      applicableChanges.some(
        (change?: Dynamic): Dynamic =>
          change.type !== "removed" && change.path === metaPath,
      ) &&
      ((hasMetadataSnapshot = true), scheduleReconnectRecovery());
    (loadState === "loading" || loadState === "failed") &&
      scheduleInitialLoadTimeout();
    let refreshedPaths: Dynamic = refreshPathsByCollection?.get(collectionPath);
    if (refreshedPaths !== undefined) {
      for (let change of changes as Dynamic)
        change.type === "removed"
          ? refreshedPaths.delete(change.path)
          : refreshedPaths.add(change.path);
      snapshotInfo.fromCache || reconcileRemovedDocuments(collectionPath, refreshedPaths);
    }
    lastSnapshotAt = timers.now();
    serverFlushScheduled || ((serverFlushScheduled = true), queueMicrotask(applyServerChanges));
  }
  function resolveNestedServerPatch(
    previousServerDocument?: Dynamic,
    nextServerDocument?: Dynamic,
    patch?: Dynamic,
    queuedOperations: Dynamic = [],
  ): Dynamic {
    let resolvedPatch: Dynamic,
      remainingFieldCount: Dynamic = 0;
    for (let key of Object.keys(patch) as Dynamic) {
      let patchValue: Dynamic = patch[key],
        previousValue: Dynamic = previousServerDocument[key],
        nextValue: Dynamic = nextServerDocument[key];
      if (
        isPlainRecord(patchValue) &&
        isPlainRecord(previousValue) &&
        !isPlainRecord(nextValue)
      ) {
        if (pendingWritesObjectField(queuedOperations, key)) {
          remainingFieldCount += 1;
          continue;
        }
        resolvedPatch ??= {
          ...patch,
        };
        delete resolvedPatch[key];
        continue;
      }
      if (
        isPlainRecord(patchValue) &&
        isPlainRecord(previousValue) &&
        isPlainRecord(nextValue)
      ) {
        let nestedPatch: Dynamic = resolveNestedServerPatch(
          previousValue,
          nextValue,
          patchValue,
          pendingFieldPatches(queuedOperations, key),
        );
        nestedPatch !== patchValue &&
          ((resolvedPatch ??= {
            ...patch,
          }),
          nestedPatch === undefined
            ? delete resolvedPatch[key]
            : (resolvedPatch[key] = nestedPatch));
        nestedPatch !== undefined && (remainingFieldCount += 1);
        continue;
      }
      remainingFieldCount += 1;
    }
    return resolvedPatch === undefined ? patch : remainingFieldCount > 0 ? resolvedPatch : undefined;
  }
  function pendingWritesObjectField(
    operations?: Dynamic,
    key?: Dynamic,
  ): Dynamic {
    let lastWriteReplacesObject: Dynamic = false;
    for (let operation of operations as Dynamic)
      (operation.replace || Object.hasOwn(operation.patch, key)) &&
        (lastWriteReplacesObject = !isPlainRecord(operation.patch[key]));
    return lastWriteReplacesObject;
  }
  function pendingFieldPatches(operations?: Dynamic, key?: Dynamic): Dynamic {
    let fieldOperations: Dynamic = [];
    for (let operation of operations as Dynamic) {
      let fieldPatch: Dynamic = operation.patch[key];
      isPlainRecord(fieldPatch)
        ? fieldOperations.push({
            patch: fieldPatch,
            replace: operation.replace,
          })
        : (operation.replace || Object.hasOwn(operation.patch, key)) &&
          fieldOperations.push({
            patch: {},
            replace: true,
          });
    }
    return fieldOperations;
  }
  function containsServerPatch(serverDocument?: Dynamic, patch?: Dynamic): Dynamic {
    for (let key of Object.keys(patch) as Dynamic) {
      let patchValue: Dynamic = patch[key],
        serverValue: Dynamic = serverDocument[key];
      if (patchValue === null) {
        if (serverValue != null) return false;
      } else if (
        isPlainRecord(patchValue) &&
        isPlainRecord(serverValue)
      ) {
        if (!containsServerPatch(serverValue, patchValue)) return false;
      } else if (!structurallyEqual(patchValue, serverValue))
        return false;
    }
    return true;
  }
  function applyServerChanges(): Dynamic {
    serverFlushScheduled = false;
    let changes: Dynamic = pendingServerChanges;
    pendingServerChanges = [];
    if (disposed || liveSyncError !== undefined) return;
    let changedPaths: Dynamic = new Set(),
      now: Dynamic = timers.now(),
      discardedLocalEdits: Dynamic = false;
    for (let change of changes as Dynamic) {
      let pathState: Dynamic = ensurePathState(change.path);
      (!change.cached || change.type === "removed") &&
        (pathState.deliveredAt = now);
      if (change.type === "removed") {
        let previouslyExisted: Dynamic = pathState.exists;
        pathState.server = undefined;
        pathState.removedSeen = true;
        pathState.createBase =
          pathState.createTheirs =
          pathState.heldBase =
            undefined;
        let lastLocalDeleteIndex: Dynamic = pathState.acked.findIndex(
          (write?: Dynamic): Dynamic =>
            write.del && now - write.at < LIVE_WRITE_ACK_TIMEOUT_MS,
        );
        if (recreatedPaths.delete(change.path) && lastLocalDeleteIndex < 0)
          for (
            let index: Dynamic = 0;
            index < pathState.acked.length;
            index++
          )
            pathState.acked[index].del && (lastLocalDeleteIndex = index);
        let wasLocalDeletion: Dynamic =
          lastLocalDeleteIndex >= 0 || pathState.inflight?.patch === DELETE_DOCUMENT;
        pathState.acked = lastLocalDeleteIndex < 0 ? [] : pathState.acked.slice(lastLocalDeleteIndex + 1);
        pathState.exists =
          pathState.acked.length > 0 &&
          !pathState.acked[pathState.acked.length - 1].del;
        !(
          wasLocalDeletion &&
          (pathState.exists ||
            (pathState.inflight !== undefined &&
              pathState.inflight.patch !== DELETE_DOCUMENT &&
              pathState.inflight.replace))
        ) &&
          discardInvalidPending(
            change.path,
            pathState,
            previouslyExisted &&
              !wasLocalDeletion &&
              pathState.reAdd !== true &&
              change.path !== metaPath,
          ) &&
          ((discardedLocalEdits = true), (pathState.goneNoticed = true));
      } else {
        let previousServerDocument: Dynamic = pathState.server;
        pathState.server = change.data ?? {};
        pathState.exists = true;
        change.cached || (pathState.reAdd = undefined);
        pathState.removedSeen = false;
        pathState.goneNoticed = undefined;
        let nextServerDocument: Dynamic = pathState.server,
          inflight: Dynamic = pathState.inflight,
          matchesInflightWrite: Dynamic = false;
        inflight !== undefined &&
          inflight.patch !== DELETE_DOCUMENT &&
          pathState.inflightEchoed !== true &&
          ((pathState.inflightEchoed = inflight.replace
            ? structurallyEqual(nextServerDocument, inflight.patch)
            : containsServerPatch(nextServerDocument, inflight.patch)),
          (matchesInflightWrite = pathState.inflightEchoed === true));
        if (pathState.createBase !== undefined)
          if (pathState.inflightEchoed === true)
            pathState.createTheirs === undefined &&
              (pathState.createBase = undefined);
          else if (
            inflight !== undefined ||
            pathState.pending === undefined ||
            pathState.pending.patch === DELETE_DOCUMENT ||
            !pathState.pending.replace
          )
            inflight !== undefined
              ? (pathState.createTheirs = nextServerDocument)
              : (pathState.createBase = undefined);
          else {
            let rebasedPatch: Dynamic = rebaseReplacementPatch(
              pathState.createBase,
              pathState.pending.patch,
              nextServerDocument,
            );
            pathState.createBase = undefined;
            rebasedPatch === null
              ? withdrawPendingWrite(change.path, pathState)
              : (pathState.pending = {
                  patch: rebasedPatch,
                  replace: false,
                });
          }
        let echoedWrites: Dynamic = [],
          inflightAsAcknowledged: Dynamic =
            inflight !== undefined &&
            inflight.patch !== DELETE_DOCUMENT
              ? {
                  patch: inflight.patch,
                  replace: inflight.replace,
                  del: false,
                  at: 0,
                  sent: 0,
                  since: 0,
                }
              : undefined;
        if (pathState.inflightEchoed === true) {
          echoedWrites =
            inflightAsAcknowledged !== undefined
              ? [...pathState.acked, inflightAsAcknowledged]
              : pathState.acked;
          pathState.acked = [];
        } else {
          let lastMatchingWriteIndex: Dynamic = -1;
          pathState.acked.forEach(
            (write?: Dynamic, index?: Dynamic): Dynamic => {
              !write.del &&
                (write.replace
                  ? structurallyEqual(nextServerDocument, write.patch)
                  : containsServerPatch(nextServerDocument, write.patch)) &&
                (lastMatchingWriteIndex = index);
            },
          );
          lastMatchingWriteIndex >= 0 &&
            ((echoedWrites = pathState.acked.slice(0, lastMatchingWriteIndex + 1)),
            (pathState.acked = pathState.acked.slice(lastMatchingWriteIndex + 1)));
        }
        if (
          previousServerDocument !== undefined &&
          pathState.pending !== undefined &&
          pathState.pending.patch !== DELETE_DOCUMENT &&
          !pathState.pending.replace
        ) {
          let applicableWrites: Dynamic = echoedWrites.filter(
              (write?: Dynamic): Dynamic =>
                !write.del && (write !== inflightAsAcknowledged || matchesInflightWrite),
            ),
            resolvedPatch: Dynamic = resolveNestedServerPatch(
              previousServerDocument,
              nextServerDocument,
              pathState.pending.patch,
              applicableWrites,
            );
          resolvedPatch !== pathState.pending.patch &&
            ((discardedLocalEdits = true),
            resolvedPatch === undefined
              ? withdrawPendingWrite(change.path, pathState)
              : (pathState.pending = {
                  patch: resolvedPatch,
                  replace: false,
                }));
        }
        let held: Dynamic = pathState.held;
        pathState.held =
          isLoaded() &&
          liveOptions.holdRemote?.(change.path, pathState.server) === true;
        pathState.held &&
          (!held || pathState.heldBase === undefined) &&
          (pathState.heldBase =
            previousServerDocument ?? effectiveDocuments.get(change.path) ?? null);
        if (pathState.held)
          for (let write of echoedWrites as Dynamic)
            advanceHeldBase(pathState, write);
        else pathState.heldBase = undefined;
      }
      changedPaths.add(change.path);
    }
    recreatedPaths.clear();
    discardedLocalEdits &&
      isLoaded() &&
      liveOptions.onNotice?.(
        "An item you were editing was deleted by someone else.",
      );
    for (let change of changes as Dynamic) {
      if (change.type !== "removed") continue;
      let entry: Dynamic = pathStates.get(change.path);
      entry &&
        entry.pending === undefined &&
        entry.inflight === undefined &&
        entry.acked.length === 0 &&
        !effectiveDocuments.has(change.path) &&
        pathStates.delete(change.path);
    }
    ackPruningTimer !== undefined &&
      (timers.clearTimeout(ackPruningTimer), (ackPruningTimer = undefined));
    scheduleAckPruning();
    if (loadState !== "live") {
      loadState === "failed" && setLoadState("loading");
      if (
        collections.every(
          (collectionPath?: Dynamic): Dynamic => loadedCollections.has(collectionPath),
        )
      ) {
        enterLiveMode();
        return resumeWritesAfterSnapshot();
      }
      if (loadState !== "cached") return;
    }
    let changedEffectiveDocuments: Dynamic = false;
    for (let path of changedPaths as Dynamic)
      pathStates.get(path)?.held ||
        (updateEffectiveDocument(path) && (changedEffectiveDocuments = true));
    needsDecompose && decomposeChanges();
    changedEffectiveDocuments ? composeDocument(true) : notifySaveState();
    resumeWritesAfterSnapshot();
  }
  function resumeWritesAfterSnapshot(): Dynamic {
    resumeWritesAfterReconnect && ((resumeWritesAfterReconnect = false), scheduleWriteFlush());
  }
  function refreshEffectiveDocuments(): Dynamic {
    let documentsChanged: Dynamic = false,
      paths: Dynamic = new Set([
        ...pathStates.keys(),
        ...effectiveDocuments.keys(),
      ]);
    for (let path of paths as Dynamic)
      pathStates.get(path)?.held ||
        (updateEffectiveDocument(path) && (documentsChanged = true));
    return documentsChanged;
  }
  function enterCachedMode(): Dynamic {
    initialLoadTimer !== undefined &&
      (timers.clearTimeout(initialLoadTimer), (initialLoadTimer = undefined));
    needsDecompose && decomposeChanges();
    loadState = "cached";
    hasShownContent = true;
    cachedReconnectAvailabilityTimer = timers.setTimeout((): Dynamic => {
      cachedReconnectAvailabilityTimer = undefined;
      if (!(loadState !== "cached" || disposed)) {
        cachedReconnectAvailable = true;
        for (let listener of [...loadListeners] as Dynamic) listener();
        scheduleCachedReconnect();
      }
    }, LIVE_EXTENDED_LOAD_TIMEOUT_MS - LIVE_INITIAL_LOAD_TIMEOUT_MS);
    refreshEffectiveDocuments();
    composeDocument(true);
    for (let listener of [...loadListeners] as Dynamic) listener();
  }
  function composeCachedSnapshot(): Dynamic {
    if (
      !hasCachedSnapshot ||
      !hasMetadataSnapshot ||
      !collections.every((collectionPath?: Dynamic): Dynamic => seenCollections.has(collectionPath))
    )
      return false;
    let cachedDocuments: Dynamic = new Map();
    for (let path of pathStates.keys() as Dynamic) {
      let document: Dynamic = effectivePathValue(path);
      document !== undefined &&
        cachedDocuments.set(path, removeNullValues(document));
    }
    try {
      return codec
        .compose(cachedDocuments, undefined)
        .dangling.every(
          (path?: Dynamic): Dynamic =>
            pathStates.get(path)?.removedSeen === true,
        );
    } catch {
      return false;
    }
  }
  function enterLiveMode(): Dynamic {
    initialLoadTimer !== undefined &&
      (timers.clearTimeout(initialLoadTimer), (initialLoadTimer = undefined));
    needsDecompose && decomposeChanges();
    hasShownContent = true;
    cachedReconnectAvailabilityTimer !== undefined &&
      (timers.clearTimeout(cachedReconnectAvailabilityTimer), (cachedReconnectAvailabilityTimer = undefined));
    cachedReconnectTimer !== undefined &&
      (timers.clearTimeout(cachedReconnectTimer), (cachedReconnectTimer = undefined));
    cachedReconnectAttempts = 0;
    firstLiveAt === undefined && (firstLiveAt = timers.now());
    loadState = "live";
    hasMetadataSnapshot || schedulePeriodicRefresh();
    refreshEffectiveDocuments();
    composeDocument(true);
    for (let listener of [...loadListeners] as Dynamic) listener();
  }
  let resubscribeTimer: Dynamic,
    resubscribeAttempts: Dynamic = 0;
  function clearReconnectTimer(): Dynamic {
    reconnectTimer !== undefined && timers.clearTimeout(reconnectTimer);
    reconnectTimer = undefined;
  }
  function reconnectDelay(): Dynamic {
    let backoffMs: Dynamic =
        LIVE_RECONNECT_BACKOFF_MS[
          Math.min(reconnectAttempts, LIVE_RECONNECT_BACKOFF_MS.length - 1)
        ],
      isPageHidden: Dynamic =
        typeof document !== "undefined" &&
        (document as Dynamic).visibilityState === "hidden";
    return !hasReceivedDocument &&
      !isPageHidden &&
      firstLiveAt !== undefined &&
      timers.now() - firstLiveAt < LIVE_RECENT_RECONNECT_WINDOW_MS
      ? Math.min(backoffMs, LIVE_RECENT_RECONNECT_DELAY_MS)
      : backoffMs;
  }
  function schedulePeriodicRefresh(delayMs: Dynamic = reconnectDelay()): Dynamic {
    clearReconnectTimer();
    !(!shouldKeepRecovering() || disposed || liveSyncError !== undefined) &&
      (hasMetadataSnapshot || (recoveryWaitingForMetadata = true),
      (reconnectTimer = timers.setTimeout((): Dynamic => {
        reconnectTimer = undefined;
        if (!shouldKeepRecovering() || disposed || liveSyncError !== undefined) return;
        let isPageHidden: Dynamic =
          typeof document !== "undefined" &&
          (document as Dynamic).visibilityState === "hidden";
        loadState === "live" &&
          !reconnecting &&
          !isPageHidden &&
          ((reconnectAttempts += 1),
          hasReceivedDocument && (recoveryAttempts += 1),
          refreshCollectionSnapshots());
        schedulePeriodicRefresh();
      }, delayMs)));
  }
  function scheduleReconnectRecovery(): Dynamic {
    recoveryWaitingForMetadata &&
      ((recoveryWaitingForMetadata = false),
      clearReconnectTimer(),
      (recoveryTimer = timers.setTimeout((): Dynamic => {
        recoveryTimer = undefined;
        !disposed &&
          liveSyncError === undefined &&
          loadState === "live" &&
          !reconnecting &&
          refreshCollectionSnapshots();
        reconnectAttempts = 0;
        hasUnresolvedDocuments && schedulePeriodicRefresh();
      }, 250)));
  }
  function subscribeCollections(): Dynamic {
    unsubscribeCollections();
    loadedCollections.clear();
    seenCollections.clear();
    collectionsWithPendingWrites.clear();
    let generation: Dynamic = subscriptionGeneration;
    collectionSubscriptions = collections.map(
      (collectionPath?: Dynamic): Dynamic =>
        database.subscribe(
          collectionPath,
          (changes?: Dynamic, snapshotInfo?: Dynamic): Dynamic => {
            generation === subscriptionGeneration &&
              handleCollectionSnapshot(collectionPath, changes, snapshotInfo);
          },
          (error?: Dynamic): Dynamic => {
            generation === subscriptionGeneration && handleStoreError(error);
          },
        ),
    );
    loadState === "loading" && scheduleInitialLoadTimeout();
  }
  function scheduleInitialLoadTimeout(): Dynamic {
    initialLoadTimer !== undefined && timers.clearTimeout(initialLoadTimer);
    initialLoadTimer = timers.setTimeout(
      (): Dynamic => {
        initialLoadTimer = undefined;
        if (loadState === "loading") {
          if (composeCachedSnapshot()) return enterCachedMode();
          if (hasCachedSnapshot && !initialLoadExtended) {
            initialLoadExtended = true;
            return scheduleInitialLoadTimeout();
          }
          lastError = {
            code: "timeout",
            get message() { return uiMessage("canvas.liveDocument.initialSnapshotsDidNotArrive"); },
          };
          setLoadState("failed");
        }
      },
      initialLoadExtended
        ? LIVE_EXTENDED_LOAD_TIMEOUT_MS - LIVE_INITIAL_LOAD_TIMEOUT_MS
        : LIVE_INITIAL_LOAD_TIMEOUT_MS,
    );
  }
  function unsubscribeCollections(): Dynamic {
    subscriptionGeneration += 1;
    for (let unsubscribe of collectionSubscriptions as Dynamic) unsubscribe();
    collectionSubscriptions = [];
    resubscribeTimer !== undefined &&
      (timers.clearTimeout(resubscribeTimer), (resubscribeTimer = undefined));
  }
  function handleStoreError(error?: Dynamic): Dynamic {
    if (!disposed) {
      if (DATABASE_ACCESS_DENIED_CODES.includes(error.code))
        return endLiveSync(error);
      if (loadState !== "failed") {
        lastError = {
          code: error.code,
          message: error.message,
        };
        unsubscribeCollections();
        if (loadState === "loading") {
          initialLoadTimer !== undefined && timers.clearTimeout(initialLoadTimer);
          initialLoadTimer = undefined;
          setLoadState("failed");
          return;
        }
        reconnecting = true;
        resubscribeAttempts += 1;
        resubscribeTimer = timers.setTimeout(
          (): Dynamic => {
            resubscribeTimer = undefined;
            !(disposed || liveSyncError !== undefined || !reconnecting) &&
              restartSubscriptions();
          },
          Math.min(
            LIVE_MAX_WRITE_RETRY_BACKOFF_MS,
            LIVE_WRITE_RETRY_INITIAL_BACKOFF_MS * 2 ** (resubscribeAttempts - 1),
          ),
        );
        notifySaveState();
      }
    }
  }
  function refreshCollectionSnapshots(): Dynamic {
    refreshPathsByCollection = new Map(
      collections.map((collectionPath?: Dynamic): Dynamic => [collectionPath, new Set()]),
    );
    subscribeCollections();
  }
  function restartSubscriptions(): Dynamic {
    refreshPathsByCollection = new Map(
      collections.map((collectionPath?: Dynamic): Dynamic => [collectionPath, new Set()]),
    );
    subscribeCollections();
    reconnectTimeoutExtended = false;
    scheduleReconnectTimeout(LIVE_INITIAL_LOAD_TIMEOUT_MS);
    notifySaveState();
    scheduleWriteFlush();
  }
  function scheduleReconnectTimeout(timeoutMs?: Dynamic): Dynamic {
    resubscribeTimer !== undefined && timers.clearTimeout(resubscribeTimer);
    resubscribeTimer = timers.setTimeout((): Dynamic => {
      resubscribeTimer = undefined;
      !(!reconnecting || disposed || liveSyncError !== undefined) &&
        ((reconnecting = false),
        handleStoreError({
          code: "unavailable",
          get message() { return uiMessage("canvas.liveDocument.reSubscribeStayedSilent"); },
        }));
    }, timeoutMs);
  }
  function reconcileRemovedDocuments(
    collectionPath?: Dynamic,
    refreshedPaths?: Dynamic,
  ): Dynamic {
    refreshPathsByCollection.delete(collectionPath);
    let now: Dynamic = timers.now();
    for (let [path, pathState] of pathStates as Dynamic) {
      if (
        dirname(path) !== collectionPath ||
        pathState.server === undefined ||
        refreshedPaths.has(path)
      )
        continue;
      let lastDeleteIndex: Dynamic = -1;
      for (let index: Dynamic = 0; index < pathState.acked.length; index++)
        pathState.acked[index].del && (lastDeleteIndex = index);
      let willWriteAgain: Dynamic =
          (pathState.inflight !== undefined &&
            pathState.inflight.patch !== DELETE_DOCUMENT) ||
          (pathState.pending !== undefined &&
            pathState.pending.patch !== DELETE_DOCUMENT &&
            pathState.parked === undefined),
        hasRecentReplacement: Dynamic =
          (lastDeleteIndex >= 0 && willWriteAgain) ||
          pathState.acked.some(
            (write?: Dynamic, index?: Dynamic): Dynamic =>
              index > lastDeleteIndex &&
              (write.replace || lastDeleteIndex >= 0) &&
              now - write.at < LIVE_WRITE_ACK_TIMEOUT_MS,
          );
      hasRecentReplacement && lastDeleteIndex >= 0 && recreatedPaths.add(path);
      !(pathState.inflight !== undefined || (hasRecentReplacement && lastDeleteIndex < 0)) &&
        (pendingServerChanges.some(
          (change?: Dynamic): Dynamic =>
            change.type === "removed" && change.path === path,
        ) ||
          pendingServerChanges.push({
            type: "removed",
            path: path,
          }));
    }
    refreshPathsByCollection.size === 0 && (refreshPathsByCollection = undefined);
  }
  function retryLiveSync(): Dynamic {
    disposed ||
      liveSyncError !== undefined ||
      (loadState === "failed"
        ? ((hasCachedSnapshot = false),
          (initialLoadExtended = false),
          setLoadState("loading"),
          subscribeCollections())
        : reconnecting
          ? restartSubscriptions()
          : loadState === "cached" &&
            cachedReconnectAvailable &&
            ((cachedReconnectAttempts = 0),
            refreshCollectionSnapshots(),
            scheduleCachedReconnect()));
  }
  function scheduleCachedReconnect(): Dynamic {
    cachedReconnectTimer !== undefined && timers.clearTimeout(cachedReconnectTimer);
    let delayMs: Dynamic =
      LIVE_RECONNECT_BACKOFF_MS[
        Math.min(cachedReconnectAttempts, LIVE_RECONNECT_BACKOFF_MS.length - 1)
      ];
    cachedReconnectTimer = timers.setTimeout((): Dynamic => {
      cachedReconnectTimer = undefined;
      !(loadState !== "cached" || disposed || liveSyncError !== undefined || reconnecting) &&
        ((cachedReconnectAttempts += 1),
        refreshCollectionSnapshots(),
        scheduleCachedReconnect());
    }, delayMs);
  }
  function releaseHeldDocument(path?: Dynamic): Dynamic {
    let entry: Dynamic = pathStates.get(path);
    entry === undefined ||
      !entry.held ||
      ((entry.held = false),
      (entry.heldBase = undefined),
      updateEffectiveDocument(path),
      composeDocument(true));
  }
  let onVisibilityChange: Dynamic = (): Dynamic => {
      if (
        typeof document !== "undefined" &&
        (document as Dynamic).visibilityState === "visible"
      ) {
        reconnectTimer !== undefined && schedulePeriodicRefresh(LIVE_RECONNECT_BACKOFF_MS[0]);
        return;
      }
      flushPendingNow();
    },
    onPageHide: Dynamic = (): Dynamic => flushPendingNow(),
    onBeforeUnload: Dynamic = (event?: Dynamic): Dynamic => {
      (pendingWriteCount() === 0 && inFlightWrites.size === 0) ||
        (event.preventDefault(), (event.returnValue = ""));
    },
    canListenToVisibility: Dynamic =
      typeof document !== "undefined" &&
      typeof (document as Dynamic).addEventListener == "function";
  typeof addEventListener == "function" &&
    (canListenToVisibility &&
      (document as Dynamic).addEventListener("visibilitychange", onVisibilityChange),
    addEventListener("pagehide", onPageHide),
    canWrite && addEventListener("beforeunload", onBeforeUnload));
  let unregisterFlusher: Dynamic = canWrite
    ? registerLiveDocumentFlusher({
        dirty: (): Dynamic =>
          pendingWriteCount() > 0 || inFlightWrites.size > 0,
        flushNow: flushPendingNow,
      })
    : undefined;
  function removeLifecycleListeners(): Dynamic {
    unregisterFlusher?.();
    typeof removeEventListener == "function" &&
      (canListenToVisibility &&
        (document as Dynamic).removeEventListener(
          "visibilitychange",
          onVisibilityChange,
        ),
      removeEventListener("pagehide", onPageHide),
      removeEventListener("beforeunload", onBeforeUnload));
  }
  subscribeCollections();
  let commentsPathPrefix: Dynamic = CommentsValue + "/";
  function unsavedCommentPaths(): Dynamic {
    let paths: Dynamic = [];
    for (let [path, pathState] of pathStates as Dynamic)
      path.startsWith(commentsPathPrefix) &&
        (pathState.pending !== undefined || pathState.inflight !== undefined) &&
        paths.push(path);
    return paths;
  }
  return {
    saveMode: (): Dynamic => "auto",
    state: (): Dynamic => state,
    content: (): Dynamic => state.content,
    title: (): Dynamic => state.title,
    comments: (): Dynamic => state.comments,
    dirty: (): Dynamic => pendingWriteCount() > 0 || inFlightWrites.size > 0,
    readOnly: (): Dynamic => !canWrite || liveSyncError !== undefined,
    saveState: getSaveState,
    commentSync(): Dynamic {
      let pendingPaths: Dynamic = unsavedCommentPaths(),
        rejectedPath: Dynamic = [...parkedWrites.keys()].find(
          (path?: Dynamic): Dynamic => path.startsWith(commentsPathPrefix),
        );
      return rejectedPath !== undefined
        ? {
            status: "error",
            pending: pendingPaths.length,
            message: parkedWrites.get(rejectedPath),
          }
        : pendingPaths.length > 0
          ? {
              status: "publishing",
              pending: pendingPaths.length,
            }
          : {
              status: "idle",
              pending: 0,
            };
    },
    pendingCommentIds(): Dynamic {
      return new Set(
        unsavedCommentPaths().map(
          (path?: Dynamic): Dynamic => path.slice(commentsPathPrefix.length),
        ),
      );
    },
    retryCommentPublish(): Dynamic {
      retryParkedWrites();
      flushPendingNow();
    },
    setContent(content: Dynamic): Dynamic {
      content !== state.content &&
        (changeDocument({
          ...state,
          content: content,
        }),
        recordEdit());
    },
    updateContent(update: Dynamic, updateOptions: Dynamic): Dynamic {
      let content: Dynamic = update(state.content);
      content !== state.content &&
        (changeDocument({
          ...state,
          content: content,
        }),
        updateOptions?.auto !== true && recordEdit());
    },
    setTitle(newTitle: Dynamic): Dynamic {
      let title: Dynamic = normalizeNewDocumentTitle(newTitle);
      title.length === 0 ||
        title === state.title ||
        (changeDocument({
          ...state,
          title: title,
        }),
        recordEdit());
    },
    addComment(commentDraft: Dynamic): Dynamic {
      if (state.comments.length >= maxDocumentComments) return;
      let comment: Dynamic = parseDocumentComments([
        {
          ...commentDraft,
          id: crypto.randomUUID().slice(0, 8),
          at: Date.now(),
        },
      ])[0];
      if (comment) {
        changeDocument({
          ...state,
          comments: [...state.comments, comment].sort(
            (left?: Dynamic, right?: Dynamic): Dynamic =>
              left.at - right.at,
          ),
        });
        return comment;
      }
    },
    removeComment(commentId: Dynamic): Dynamic {
      state.comments.some(
        (comment?: Dynamic): Dynamic => comment.id === commentId,
      ) &&
        changeDocument({
          ...state,
          comments: state.comments.filter(
            (comment?: Dynamic): Dynamic => comment.id !== commentId,
          ),
        });
    },
    documentBytes(): Dynamic {
      let totalBytes: Dynamic = 0;
      for (let bytes of documentSizes.values() as Dynamic)
        totalBytes += bytes;
      return totalBytes;
    },
    async save(): Promise<Dynamic> {
      (loadState === "failed" ||
        reconnecting ||
        (loadState === "cached" && cachedReconnectAvailable)) &&
        retryLiveSync();
      retryParkedWrites();
      flushPendingNow();
    },
    stashOffer: (): Dynamic => {},
    restoreStash: (): Dynamic => {},
    discardStash: (): Dynamic => {},
    restoreCount: (): Dynamic => 0,
    subscribe(listener: Dynamic): Dynamic {
      contentListeners.add(listener);
      return (): Dynamic => contentListeners.delete(listener);
    },
    subscribeSave(listener: Dynamic): Dynamic {
      saveListeners.add(listener);
      return (): Dynamic => saveListeners.delete(listener);
    },
    subscribeStuck(listener: Dynamic): Dynamic {
      stuckListeners.add(listener);
      return (): Dynamic => stuckListeners.delete(listener);
    },
    loadState: (): Dynamic => loadState,
    shown: (): Dynamic => isLoaded(),
    cachedSettled: (): Dynamic => cachedReconnectAvailable,
    subscribeLoad(listener: Dynamic): Dynamic {
      loadListeners.add(listener);
      return (): Dynamic => loadListeners.delete(listener);
    },
    flushNow: flushPendingNow,
    retryLoad: retryLiveSync,
    storeUntouched: (): Dynamic =>
      loadState === "live" &&
      !hasReceivedDocument &&
      !hasSyncedWrite &&
      inFlightWrites.size === 0 &&
      pendingWriteCount() === 0,
    releaseHold: releaseHeldDocument,
    syncDetail: (): Dynamic => ({
      pending: pendingWriteCount(),
      inflight: inFlightWrites.keys().next().value ?? null,
      flights: inFlightWrites.size,
      ...(lastSyncedAt !== undefined
        ? {
            lastSyncedAt: lastSyncedAt,
          }
        : {}),
      ...(lastError !== undefined
        ? {
            lastError: lastError,
          }
        : {}),
    }),
    dispose(): Dynamic {
      disposed = true;
      unsubscribeCollections();
      clearTimers();
      removeLifecycleListeners();
    },
  };
}
export {
  createLiveDocument,
  createLiveDocumentTimers,
  formatSyncTime,
  LIVE_CONFLICT_RETRY_MS,
  LIVE_ERROR_SURFACE_DELAY_MS,
  LIVE_EXTENDED_LOAD_TIMEOUT_MS,
  LIVE_FRAME_FALLBACK_DELAY_MS,
  LIVE_INITIAL_LOAD_TIMEOUT_MS,
  LIVE_MAX_ACKNOWLEDGED_WRITES,
  LIVE_MAX_INFLIGHT_WRITES,
  LIVE_MAX_PATCH_PROPERTY_COUNT,
  LIVE_MAX_RECOVERY_RETRIES,
  LIVE_MAX_WRITE_RETRY_BACKOFF_MS,
  LIVE_RECENT_RECONNECT_DELAY_MS,
  LIVE_RECENT_RECONNECT_WINDOW_MS,
  LIVE_RECONNECT_BACKOFF_MS,
  LIVE_RETRY_INITIAL_BACKOFF_MS,
  LIVE_RETRY_MAX_BACKOFF_MS,
  LIVE_STUCK_WRITE_TIMEOUT_MS,
  LIVE_SYNC_EXPLANATION,
  LIVE_WRITE_ACK_TIMEOUT_MS,
  LIVE_WRITE_DEBOUNCE_MS,
  LIVE_WRITE_MAX_WAIT_MS,
  LIVE_WRITE_RETRY_INITIAL_BACKOFF_MS,
  liveDocumentFlushers,
  pluralizeSyncCount,
  registerLiveDocumentFlusher,
};
export function installPlatformLiveDocument(): () => void {
  return () => {
    liveDocumentFlushers = new Set();
    LIVE_WRITE_DEBOUNCE_MS = 350;
    LIVE_WRITE_MAX_WAIT_MS = 1500;
    LIVE_INITIAL_LOAD_TIMEOUT_MS = 1e4;
    LIVE_RECONNECT_BACKOFF_MS = [2e3, 4e3, 8e3, 15e3, 3e4, 6e4];
    LIVE_RECENT_RECONNECT_DELAY_MS = 5e3;
    LIVE_RECENT_RECONNECT_WINDOW_MS = 3e5;
    LIVE_MAX_RECOVERY_RETRIES = 3;
    LIVE_WRITE_ACK_TIMEOUT_MS = 5e3;
    LIVE_STUCK_WRITE_TIMEOUT_MS = 6e4;
    LIVE_MAX_PATCH_PROPERTY_COUNT = 64;
    LIVE_CONFLICT_RETRY_MS = [300, 800];
    LIVE_WRITE_RETRY_INITIAL_BACKOFF_MS = 2e3;
    LIVE_MAX_WRITE_RETRY_BACKOFF_MS = 3e4;
    LIVE_RETRY_INITIAL_BACKOFF_MS = 1e3;
    LIVE_RETRY_MAX_BACKOFF_MS = 8e3;
    LIVE_ERROR_SURFACE_DELAY_MS = 3e4;
    LIVE_FRAME_FALLBACK_DELAY_MS = 16;
    LIVE_MAX_ACKNOWLEDGED_WRITES = 8;
    LIVE_EXTENDED_LOAD_TIMEOUT_MS = 35e3;
    LIVE_MAX_INFLIGHT_WRITES = 4;
    LIVE_SYNC_EXPLANATION =
      "Edits sync as you go; if two people change the same thing, the last change wins.";
  };
}
