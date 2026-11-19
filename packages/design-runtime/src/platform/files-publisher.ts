/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { listWritableFiles, retryAccessFailure } from "./access-retry";
import { DAMAGED_INDEX_RETRY_DELAY_MS } from "./boot-reader";
import { extractPortFileText } from "./crash-stash";
import { describeInvalidFile, describeOversizedFile, getRawFileBytes, hashFileMap, hasInjectedRuntime, isNarrowedFileContext, roomPeersStore, splitPublishBatches } from "./file-content";
import { IndexFileError } from "./index-state";
import { isProjectMetadataFile } from "./project-paths";

var FILE_PUBLISH_PACING: Dynamic;
var FILE_REMOTE_UPDATE_WAIT_MS: Dynamic;
var FILE_FLUSH_TIMEOUT_MS: Dynamic;
var FILE_PUBLISH_INITIAL_BACKOFF_MS: Dynamic;
var FILE_PUBLISH_MAX_BACKOFF_MS: Dynamic;
var FILE_PUBLISH_RETRY_BUDGET_MS: Dynamic;
var FILE_PUBLISH_RETRY_JITTER_MS: Dynamic;
var FILE_CONFLICT_MAX_JITTER_MS: Dynamic;
var FILE_PUBLISH_STUCK_RETRY_MS: Dynamic;
var MAX_FILE_CONFLICTS_PER_WINDOW: Dynamic;
var FILE_CONFLICT_HISTORY_WINDOW_MS: Dynamic;
var FILE_CONFLICT_RETRY_COOLDOWN_MS: Dynamic;
var FILE_PUBLISH_MAX_RETRIES: Dynamic;
var FILE_PUBLISH_RECOVERY_LIMIT_MS: Dynamic;
var MAX_FILE_VERSION_ADOPTION_WAITS: Dynamic;
var MAX_OWN_PUBLISHED_VERSIONS: Dynamic;
var FILE_PUBLISH_MIN_RETRY_GAP_MS: Dynamic;
var FILE_PUBLISH_CONFLICT_RETRY_MS: Dynamic;
var FILE_PUBLISH_SETTLE_RETRY_MS: Dynamic;
var PERMANENT_PUBLISH_ERROR_CODES: Dynamic;
var isIndexPublishFailure: Dynamic;
function createPublishTimers(): Dynamic {
  return {
    setTimeout: (run?: Dynamic, delayMs?: Dynamic): Dynamic =>
      setTimeout(run, delayMs),
    clearTimeout: (timer?: Dynamic): Dynamic => clearTimeout(timer),
    now: (): Dynamic => Date.now(),
    random: (): Dynamic => Math.random(),
  };
}
function createFilesPublisher(publisherOptions?: Dynamic): Dynamic {
  let { port: originalPort }: Dynamic = publisherOptions,
    port: Dynamic = originalPort,
    timers: Dynamic = publisherOptions.timers ?? createPublishTimers(),
    indexState: Dynamic = publisherOptions.index,
    indexPath: Dynamic = indexState?.path,
    isIndexPath: Dynamic = (filePath?: Dynamic): Dynamic =>
      indexPath !== undefined
        ? filePath === indexPath
        : isProjectMetadataFile(filePath),
    dirtyEdits: Dynamic = new Map(),
    inFlightEdits: Dynamic = new Map(),
    conflictHistory: Dynamic = new Map(),
    surfacedConflictsAt: Dynamic = new Map(),
    conflictLimitedPaths: Dynamic = new Set(),
    withdrawnPaths: Dynamic = new Set(),
    remoteHashes: Dynamic = new Map(),
    unsendableReasons: Dynamic = new Map(),
    unsendableEdits: Dynamic = new Map(),
    unsendableStashed: Dynamic = false,
    ownPublishedHashes: Dynamic = new Map(),
    ownChangedPaths: Dynamic = new Set(),
    remoteVersion: Dynamic,
    hasAdoptedKnownVersion: Dynamic = (): Dynamic =>
      remoteVersion === originalPort.version().version ||
      originalPort.version().version === lastPublishedVersion,
    lastPublishedVersion: Dynamic,
    ownPublishedVersions: Dynamic = new Set(),
    metrics: Dynamic = {
      publishes: 0,
      pathsSent: 0,
      conflicts: 0,
      retries: 0,
      rateLimited: 0,
      bytesSent: 0,
      lastPublishMs: 0,
      surfaced: 0,
    },
    editGeneration: Dynamic = 0,
    inFlight: Dynamic = false,
    flushRequested: Dynamic = false,
    disposed: Dynamic = false,
    lastError: Dynamic,
    backoffUntil: Dynamic,
    backoffMs: Dynamic = FILE_PUBLISH_INITIAL_BACKOFF_MS,
    flushTimer: Dynamic,
    lastPublishAt: Dynamic = -1 / 0,
    idleWaiters: Dynamic = [],
    retriedWithoutRemoteUpdate: Dynamic = false,
    retryWhenRemoteChanges: Dynamic = false,
    remoteChangeCount: Dynamic = 0,
    retryWindow: Dynamic,
    retryBudgetMs: Dynamic =
      publisherOptions.retryBudgetMs ?? FILE_PUBLISH_RETRY_BUDGET_MS,
    conflictWindow: Dynamic,
    stuckState: Dynamic,
    retryTimer: Dynamic,
    stuckRetryMs: Dynamic =
      publisherOptions.stuckRetryMs ?? FILE_PUBLISH_STUCK_RETRY_MS,
    stashDirty: Dynamic = false,
    stashOffered: Dynamic = false,
    retryNotBefore: Dynamic = 0,
    hasServerRetryDelay: Dynamic = false,
    firstDirtyAt: Dynamic,
    maxWaitTimer: Dynamic,
    bypassPacing: Dynamic = false,
    indexNeedsRebase: Dynamic = false,
    lastDamagedIndexAt: Dynamic = -1 / 0,
    interruptWait: Dynamic,
    waitIsInterruptible: Dynamic = false,
    random: Dynamic = (): Dynamic => timers.random?.() ?? Math.random(),
    jitterDelay: Dynamic = (baseDelayMs?: Dynamic): Dynamic =>
      Math.round(baseDelayMs / 2 + random() * (baseDelayMs / 2)),
    getRetryBudget: Dynamic = (): Dynamic =>
      publisherOptions.retryBudgetMs ?? FILE_PUBLISH_RETRY_BUDGET_MS;
  function interruptibleDelay(
    delayMs?: Dynamic,
    canInterrupt: Dynamic = false,
  ): Dynamic {
    return new Promise((resolve?: Dynamic): Dynamic => {
      let delayTimer: Dynamic = timers.setTimeout((): Dynamic => {
        interruptWait = undefined;
        resolve(false);
      }, delayMs);
      waitIsInterruptible = canInterrupt;
      interruptWait = (): Dynamic => {
        timers.clearTimeout(delayTimer);
        interruptWait = undefined;
        resolve(true);
      };
    });
  }
  let currentLiveHash: Dynamic = (filePath?: Dynamic): Dynamic =>
      remoteHashes.has(filePath)
        ? remoteHashes.get(filePath)
        : port.liveSha?.(filePath),
    getSyncState: Dynamic = (): Dynamic => ({
      dirty: dirtyEdits.size,
      inFlight: inFlight,
      ...(lastError !== undefined
        ? {
            lastError: lastError,
          }
        : {}),
      ...(backoffUntil !== undefined
        ? {
            backoffUntil: backoffUntil,
          }
        : {}),
      ...(stuckState !== undefined
        ? {
            stuck: {
              ...stuckState,
              paths: [...stuckState.paths],
            },
          }
        : {}),
      ...(unsendableEdits.size > 0
        ? {
            unsendable: [...unsendableEdits].map(
              ([filePath, unsendableEdit]: Dynamic): Dynamic => ({
                path: filePath,
                why: unsendableEdit.why,
                cause: unsendableEdit.cause,
              }),
            ),
            ...(unsendableStashed
              ? {
                  unsendableStashed: true,
                }
              : {}),
          }
        : {}),
    }),
    notifyState: Dynamic = (): Dynamic => {
      try {
        publisherOptions.onState?.(getSyncState());
      } catch {}
      if (
        !inFlight &&
        flushTimer === undefined &&
        (dirtyEdits.size === 0 || isStoppedByError())
      ) {
        let waiters: Dynamic = idleWaiters;
        idleWaiters = [];
        for (let resolveIdle of waiters as Dynamic) resolveIdle();
      }
    },
    isStoppedByError: Dynamic = (): Dynamic =>
      lastError !== undefined &&
      backoffUntil === undefined &&
      !flushRequested,
    isOwnPublishedHash: Dynamic = (change?: Dynamic): Dynamic =>
      ownPublishedHashes.has(change.path) &&
      ownPublishedHashes.get(change.path) === change.sha256,
    lastRemoteActivityAt: Dynamic = -1 / 0,
    peers: Dynamic = publisherOptions.peers ?? roomPeersStore,
    hasOtherTabs: Dynamic = (): Dynamic =>
      peers.getSnapshot().some((peer?: Dynamic): Dynamic => !peer.sameTab),
    hasRecentRemoteActivity: Dynamic = (): Dynamic =>
      timers.now() - lastRemoteActivityAt < FILE_PUBLISH_PACING.recentMs,
    isSoloPaced: Dynamic = (): Dynamic =>
      publisherOptions.paced === true && !hasOtherTabs() && !hasRecentRemoteActivity(),
    getPacing: Dynamic = (): Dynamic =>
      publisherOptions.paced !== true
        ? undefined
        : isSoloPaced()
          ? FILE_PUBLISH_PACING.solo
          : FILE_PUBLISH_PACING.shared;
  function switchToSharedPacing(): Dynamic {
    if (!disposed) {
      scheduleMaxWait();
      flushTimer !== undefined &&
        (timers.clearTimeout(flushTimer), (flushTimer = undefined));
      schedulePublish();
      try {
        publisherOptions.onShared?.();
      } catch {}
    }
  }
  function noteRemoteActivity(): Dynamic {
    let wasSoloPaced: Dynamic = isSoloPaced();
    lastRemoteActivityAt = timers.now();
    wasSoloPaced && switchToSharedPacing();
  }
  let previouslyHadOtherTabs: Dynamic = publisherOptions.paced === true && hasOtherTabs(),
    unsubscribePeers: Dynamic =
      publisherOptions.paced !== true
        ? undefined
        : peers.subscribe((): Dynamic => {
            let hasPeers: Dynamic = hasOtherTabs(),
              peerJoined: Dynamic = hasPeers && !previouslyHadOtherTabs;
            previouslyHadOtherTabs = hasPeers;
            peerJoined && !hasRecentRemoteActivity() && switchToSharedPacing();
          });
  function scheduleMaxWait(): Dynamic {
    maxWaitTimer !== undefined &&
      (timers.clearTimeout(maxWaitTimer), (maxWaitTimer = undefined));
    let pacing: Dynamic = getPacing();
    pacing === undefined ||
      firstDirtyAt === undefined ||
      disposed ||
      (maxWaitTimer = timers.setTimeout(
        (): Dynamic => {
          maxWaitTimer = undefined;
          if (dirtyEdits.size === 0) {
            firstDirtyAt = undefined;
            return;
          }
          stuckState === undefined &&
            ((flushRequested = true), schedulePublish());
        },
        Math.max(0, firstDirtyAt + pacing.maxWaitMs - timers.now()),
      ));
  }
  let unsubscribeRemoteChange: Dynamic = originalPort.onRemoteChange(
    (update?: Dynamic): Dynamic => handleRemoteChange(update),
  );
  function handleRemoteChange(update?: Dynamic): Dynamic {
    remoteChangeCount += 1;
    let isOwnChange: Dynamic = (change?: Dynamic): Dynamic =>
        isOwnPublishedHash(change) ||
        (ownChangedPaths.has(change.path) &&
          change.sha256 !== null &&
          ownPublishedVersions.has(update.to.version)),
      hasForeignChange: Dynamic = update.changed.some(
        (change?: Dynamic): Dynamic => !isOwnChange(change),
      );
    for (let change of update.changed as Dynamic) {
      remoteHashes.set(change.path, change.sha256);
      ownChangedPaths.delete(change.path);
      ownPublishedHashes.has(change.path) &&
        ownPublishedHashes.get(change.path) !== change.sha256 &&
        ownPublishedHashes.delete(change.path);
    }
    remoteVersion = update.to.version;
    hasForeignChange && noteRemoteActivity();
    let indexChangedAfterFailure: Dynamic =
        isIndexPublishFailure(stuckState?.code) &&
        indexPath !== undefined &&
        update.changed.some(
          (change?: Dynamic): Dynamic => change.path === indexPath,
        ),
      indexRetryDelayMs: Dynamic =
        indexChangedAfterFailure && !retryWhenRemoteChanges
          ? DAMAGED_INDEX_RETRY_DELAY_MS - (timers.now() - lastDamagedIndexAt)
          : 0;
    if (indexRetryDelayMs > 0) {
      retryTimer === undefined &&
        !disposed &&
        (retryTimer = timers.setTimeout((): Dynamic => {
          retryTimer = undefined;
          retryStuck(getRetryBudget());
        }, indexRetryDelayMs));
      return;
    }
    (retryWhenRemoteChanges || indexChangedAfterFailure) &&
      !inFlight &&
      !disposed &&
      retryStuck(getRetryBudget());
  }
  indexState?.bind?.(
    (filePath?: Dynamic, readValue?: Dynamic, baseSha?: Dynamic): Dynamic =>
      markDirty(filePath, readValue, baseSha),
  );
  function recordConflict(filePath?: Dynamic): Dynamic {
    let now: Dynamic = timers.now();
    conflictHistory.set(filePath, [
      ...(conflictHistory.get(filePath) ?? []).filter(
        (timestamp?: Dynamic): Dynamic =>
          now - timestamp < FILE_CONFLICT_HISTORY_WINDOW_MS,
      ),
      now,
    ]);
  }
  function markDirty(
    filePath?: Dynamic,
    readValue?: Dynamic,
    baseSha?: Dynamic,
  ): Dynamic {
    if (disposed) return;
    let entry: Dynamic = dirtyEdits.get(filePath);
    editGeneration += 1;
    let matchesOwnPublish: Dynamic =
        ownPublishedHashes.has(filePath) &&
        (currentLiveHash(filePath) === undefined ||
          currentLiveHash(filePath) === ownPublishedHashes.get(filePath)),
      editBaseSha: Dynamic =
        baseSha !== undefined
          ? baseSha
          : entry !== undefined
            ? entry.base
            : matchesOwnPublish
              ? ownPublishedHashes.get(filePath)
              : (port.heldSha?.(filePath) ?? currentLiveHash(filePath) ?? null);
    unsendableReasons.delete(filePath);
    unsendableEdits.delete(filePath);
    dirtyEdits.set(filePath, {
      value: readValue,
      base: editBaseSha,
      gen: editGeneration,
    });
    firstDirtyAt === undefined && ((firstDirtyAt = timers.now()), scheduleMaxWait());
    withdrawnPaths.delete(filePath);
    if (baseSha !== undefined) {
      let surfacedAt: Dynamic = surfacedConflictsAt.get(filePath);
      surfacedAt !== undefined &&
        timers.now() - surfacedAt < FILE_CONFLICT_HISTORY_WINDOW_MS &&
        recordConflict(filePath);
      surfacedConflictsAt.delete(filePath);
      inFlightEdits.delete(filePath);
    }
    stuckState !== undefined &&
      (stuckState = {
        ...stuckState,
        paths: [...dirtyEdits.keys()],
      });
    stashHandedOff = false;
    scheduleCrashStash();
    notifyState();
  }
  function flushNow(): Dynamic {
    if (!(disposed && dirtyEdits.size === 0) && dirtyEdits.size !== 0) {
      if (stuckState !== undefined) {
        inFlight ? (flushRequested = true) : retryStuck(getRetryBudget());
        return;
      }
      flushRequested = true;
      schedulePublish();
    }
  }
  function retryStuck(budgetMs?: Dynamic, ignoreLocalCooldown: Dynamic = false): Dynamic {
    if (disposed || inFlight) return;
    let remainingDelayMs: Dynamic = retryNotBefore - timers.now();
    if (remainingDelayMs > 0 && (hasServerRetryDelay || !ignoreLocalCooldown)) {
      retryTimer === undefined &&
        (retryTimer = timers.setTimeout((): Dynamic => {
          retryTimer = undefined;
          retryStuck(budgetMs);
        }, remainingDelayMs));
      return;
    }
    retryTimer !== undefined &&
      (timers.clearTimeout(retryTimer), (retryTimer = undefined));
    bypassPacing = true;
    flushTimer !== undefined &&
      (timers.clearTimeout(flushTimer), (flushTimer = undefined));
    retryWindow = undefined;
    retryBudgetMs = budgetMs;
    retryWhenRemoteChanges = false;
    lastError = undefined;
    if (dirtyEdits.size === 0) {
      notifyState();
      return;
    }
    flushRequested = true;
    schedulePublish();
  }
  function schedulePublish(): Dynamic {
    if (inFlight || !flushRequested) return;
    if (flushTimer !== undefined) {
      scheduleCrashStash(0);
      return;
    }
    if (dirtyEdits.size === 0) {
      flushRequested = false;
      notifyState();
      return;
    }
    let remainingGapMs: Dynamic =
      Math.max(publisherOptions.minGapMs ?? 0, bypassPacing ? 0 : (getPacing()?.gapMs ?? 0)) -
      (timers.now() - lastPublishAt);
    if (remainingGapMs > 0) {
      flushTimer = timers.setTimeout((): Dynamic => {
        flushTimer = undefined;
        schedulePublish();
      }, remainingGapMs);
      scheduleCrashStash(0);
      return;
    }
    flushRequested = false;
    bypassPacing = false;
    publishBatch();
  }
  function rebaseDirtyEdits(): Dynamic {
    conflictLimitedPaths.clear();
    for (let [filePath, edit] of [...dirtyEdits] as Dynamic) {
      if (isIndexPath(filePath)) continue;
      let liveSha: Dynamic = currentLiveHash(filePath);
      if (liveSha === undefined || liveSha === edit.base) continue;
      if (
        ownPublishedHashes.has(filePath) &&
        ownPublishedHashes.get(filePath) === liveSha
      ) {
        edit.base = liveSha;
        continue;
      }
      if (
        ownChangedPaths.has(filePath) &&
        typeof liveSha == "string" &&
        hasAdoptedKnownVersion()
      ) {
        ownChangedPaths.delete(filePath);
        ownPublishedHashes.set(filePath, liveSha);
        edit.base = liveSha;
        continue;
      }
      let now: Dynamic = timers.now();
      if (
        (conflictHistory.get(filePath) ?? []).filter(
          (timestamp?: Dynamic): Dynamic =>
            now - timestamp < FILE_CONFLICT_HISTORY_WINDOW_MS,
        ).length >= MAX_FILE_CONFLICTS_PER_WINDOW
      ) {
        conflictLimitedPaths.add(filePath);
        continue;
      }
      let localFile: Dynamic,
        cannotReadLocalFile: Dynamic = false;
      try {
        localFile = edit.value();
      } catch {
        localFile = null;
        cannotReadLocalFile = true;
      }
      let conflict: Dynamic = {
        path: filePath,
        base: edit.base,
        mine: localFile,
        theirsSha: liveSha,
        ...(cannotReadLocalFile
          ? {
              unreadable: true,
            }
          : {}),
      };
      dirtyEdits.delete(filePath);
      inFlightEdits.set(filePath, conflict);
      surfacedConflictsAt.set(filePath, now);
      metrics.surfaced += 1;
      publisherOptions.stash !== undefined && ((stashDirty = true), (stashHandedOff = false));
      try {
        publisherOptions.onConflict(conflict);
      } catch {}
    }
  }
  function beginRetryAttempt(): Dynamic {
    let now: Dynamic = timers.now();
    retryWindow ??= {
      since: now,
      refusals: 0,
      budgetMs: retryBudgetMs,
    };
    retryWindow.refusals += 1;
    conflictWindow ??= {
      since: now,
      attempts: 0,
    };
    conflictWindow.attempts += 1;
    return retryWindow;
  }
  async function publishBatch(): Promise<Dynamic> {
    inFlight = true;
    lastPublishAt = timers.now();
    let remoteChangesAtStart: Dynamic = remoteChangeCount;
    rebaseDirtyEdits();
    if (indexState && indexPath !== undefined && dirtyEdits.has(indexPath)) {
      let liveIndexSha: Dynamic = currentLiveHash(indexPath),
        indexMergeStatus: Dynamic =
          (liveIndexSha != null &&
            liveIndexSha !== indexState.baseSha() &&
            ownPublishedHashes.get(indexPath) !== liveIndexSha) ||
          indexNeedsRebase
            ? await reloadAndMergeIndex()
            : "merged";
      if (indexMergeStatus !== "merged" && indexMergeStatus !== "unread") {
        beginRetryAttempt();
        return surfaceStuckState(indexMergeStatus, false, undefined, indexPath);
      }
      if (indexMergeStatus === "unread") {
        lastError = "conflict";
        beginRetryAttempt();
        notifyState();
        return backoffAndRetry("conflict", true);
      }
    }
    let filesToPublish: Dynamic = {},
      sentGenerations: Dynamic = new Map(),
      baseShas: Dynamic = {};
    for (let [filePath, edit] of [...dirtyEdits] as Dynamic) {
      if (conflictLimitedPaths.has(filePath)) continue;
      let file: Dynamic;
      try {
        file = edit.value();
      } catch {
        continue;
      }
      let fileProblem: Dynamic;
      try {
        if (port.entryProblemDetail !== undefined)
          fileProblem = port.entryProblemDetail(filePath, file);
        else if (port.entryProblem !== undefined) {
          let reason: Dynamic = port.entryProblem(filePath, file);
          fileProblem =
            reason === undefined
              ? undefined
              : {
                  why: reason,
                  cause: "other",
                };
        } else fileProblem = describeInvalidFile(filePath, file);
      } catch {
        fileProblem = describeInvalidFile(filePath, file);
      }
      if (fileProblem === undefined) {
        let sizeProblem: Dynamic = describeOversizedFile(file);
        sizeProblem !== undefined &&
          (fileProblem = {
            why: sizeProblem,
            cause: "size",
          });
      }
      if (fileProblem !== undefined && file === null) {
        dirtyEdits.delete(filePath);
        unsendableReasons.delete(filePath);
        unsendableEdits.delete(filePath);
        continue;
      }
      if (fileProblem !== undefined) {
        dirtyEdits.delete(filePath);
        unsendableReasons.set(filePath, fileProblem.why);
        unsendableEdits.set(filePath, {
          value: edit.value,
          base: edit.base,
          why: fileProblem.why,
          cause: fileProblem.cause,
        });
        unsendableStashed = false;
        publisherOptions.stash !== undefined && ((stashDirty = true), (stashHandedOff = false));
        try {
          publisherOptions.onUnsendable?.(filePath, fileProblem.why);
        } catch {}
        continue;
      }
      filesToPublish[filePath] = file;
      sentGenerations.set(filePath, edit.gen);
      baseShas[filePath] = edit.base;
    }
    if (sentGenerations.size === 0) {
      if (dirtyEdits.size === 0) {
        resetRetryState();
        return;
      }
      return [...dirtyEdits.keys()].every(
        (filePath?: Dynamic): Dynamic => conflictLimitedPaths.has(filePath),
      )
        ? surfaceStuckState(
            "conflict",
            false,
            FILE_CONFLICT_RETRY_COOLDOWN_MS,
          )
        : (beginRetryAttempt(), surfaceStuckState("invalid_content", false));
    }
    notifyState();
    let batches: Dynamic = splitPublishBatches(
        filesToPublish,
        isIndexPath,
      ),
      failure: Dynamic;
    for (let batch of batches as Dynamic) {
      let publishStartedAt: Dynamic = timers.now(),
        result: Dynamic,
        ifMatch: Dynamic = Object.fromEntries(
          Object.keys(batch)
            .filter(
              (filePath?: Dynamic): Dynamic =>
                !(
                  ownChangedPaths.has(filePath) &&
                  baseShas[filePath] === ownPublishedHashes.get(filePath)
                ),
            )
            .map(
              (filePath?: Dynamic): Dynamic => [filePath, baseShas[filePath] ?? null],
            ),
        ),
        version: Dynamic = originalPort.version().version;
      try {
        result = await originalPort.publish(batch, {
          ifMatch: ifMatch,
        });
      } catch {
        result = {
          ok: false,
          code: "upstream_error",
        };
      }
      result.ok &&
        result.unchanged !== true &&
        result.version === version &&
        (result = {
          ...result,
          unchanged: true,
        });
      if (!result.ok) {
        failure = result;
        break;
      }
      if (result.changed)
        for (let change of result.changed as Dynamic)
          change.path in batch ||
            (remoteHashes.set(change.path, change.sha256),
            ownChangedPaths.delete(change.path));
      let allPreconditionsChecked: Dynamic =
        result.preconditionsChecked === true &&
        Object.keys(batch).every(
          (filePath?: Dynamic): Dynamic => Object.hasOwn(ifMatch, filePath),
        );
      result.unchanged === true ||
        (allPreconditionsChecked && result.changed === undefined) ||
        ((lastPublishedVersion = result.version),
        ownPublishedVersions.add(result.version),
        ownPublishedVersions.size > MAX_OWN_PUBLISHED_VERSIONS &&
          ownPublishedVersions.delete(
            ownPublishedVersions.values().next().value,
          ));
      metrics.publishes += 1;
      metrics.pathsSent += Object.keys(batch).length;
      metrics.lastPublishMs = timers.now() - publishStartedAt;
      let publishedShas: Dynamic =
        result.shas ?? (await hashFileMap(batch));
      for (let [filePath, file] of Object.entries(batch) as Dynamic) {
        let sha: Dynamic =
          file === null ? null : (publishedShas[filePath] ?? null);
        metrics.bytesSent += getRawFileBytes(file);
        ownPublishedHashes.set(filePath, sha);
        remoteHashes.set(filePath, sha);
        !(
          result.shas?.[filePath] !== undefined &&
          result.computed?.includes(filePath) !== true
        ) &&
        sha !== null &&
        hasInjectedRuntime(file)
          ? ownChangedPaths.add(filePath)
          : ownChangedPaths.delete(filePath);
        sha !== null &&
          result.unchanged !== true &&
          publisherOptions.tokens?.advance?.(filePath, sha);
        let entry: Dynamic = dirtyEdits.get(filePath);
        entry !== undefined && entry.gen === sentGenerations.get(filePath)
          ? (dirtyEdits.delete(filePath), surfacedConflictsAt.delete(filePath))
          : entry !== undefined && (entry.base = sha);
        indexState &&
          filePath === indexPath &&
          sha !== null &&
          indexState.markSaved(
            extractPortFileText(file),
            sha,
          );
      }
    }
    if (failure === undefined) {
      let hasConflictLimitedEdits: Dynamic = [...conflictLimitedPaths].some(
        (filePath?: Dynamic): Dynamic => dirtyEdits.has(filePath),
      );
      resetRetryState(!hasConflictLimitedEdits, !hasConflictLimitedEdits);
      let hasOtherDirtyEdits: Dynamic = [...dirtyEdits.keys()].some(
        (filePath?: Dynamic): Dynamic => !conflictLimitedPaths.has(filePath),
      );
      hasConflictLimitedEdits &&
        surfaceStuckState(
          "conflict",
          false,
          hasOtherDirtyEdits ? 0 : FILE_CONFLICT_RETRY_COOLDOWN_MS,
          undefined,
          hasOtherDirtyEdits ? getRetryBudget() : 0,
        );
      return;
    }
    await handlePublishFailure(failure, remoteChangesAtStart);
  }
  function resetRetryState(
    scheduleNextPublish: Dynamic = true,
    notify: Dynamic = true,
  ): Dynamic {
    retriedWithoutRemoteUpdate = false;
    retryWhenRemoteChanges = false;
    lastError = undefined;
    backoffUntil = undefined;
    backoffMs = FILE_PUBLISH_INITIAL_BACKOFF_MS;
    retryWindow = undefined;
    conflictWindow = undefined;
    retryBudgetMs = getRetryBudget();
    stuckState = undefined;
    stuckRetryMs = publisherOptions.stuckRetryMs ?? FILE_PUBLISH_STUCK_RETRY_MS;
    retryNotBefore = 0;
    hasServerRetryDelay = false;
    retryTimer !== undefined &&
      (timers.clearTimeout(retryTimer), (retryTimer = undefined));
    clearSettledStash();
    firstDirtyAt = dirtyEdits.size === 0 ? undefined : timers.now();
    scheduleMaxWait();
    inFlight = false;
    notify && notifyState();
    scheduleNextPublish && schedulePublish();
  }
  async function handlePublishFailure(
    failure?: Dynamic,
    remoteChangesAtStart?: Dynamic,
  ): Promise<Dynamic> {
    lastError = failure.code;
    if (failure.code === "conflict") {
      metrics.conflicts += 1;
      if (failure.changed)
        for (let change of failure.changed as Dynamic) {
          remoteHashes.set(change.path, change.sha256);
          ownChangedPaths.delete(change.path);
        }
      if (failure.paths)
        for (let conflictPath of failure.paths as Dynamic) {
          remoteHashes.set(conflictPath.path, conflictPath.liveSha);
          ownChangedPaths.delete(conflictPath.path);
        }
      let retry: Dynamic = beginRetryAttempt();
      for (
        indexState &&
          indexPath !== undefined &&
          dirtyEdits.has(indexPath) &&
          (indexNeedsRebase = true),
          notifyState();
        ;

      ) {
        let remoteUpdateArrived: Dynamic =
          remoteChangeCount !== remoteChangesAtStart ||
          (failure.live !== undefined &&
            originalPort.version().version === failure.live)
            ? true
            : await waitForRemoteUpdate();
        for (
          let adoptionWaits: Dynamic = 0;
          remoteUpdateArrived &&
          ownChangedPaths.size > 0 &&
          !hasAdoptedKnownVersion() &&
          adoptionWaits < MAX_FILE_VERSION_ADOPTION_WAITS &&
          !disposed;
          adoptionWaits++
        )
          await waitForRemoteUpdate();
        let hashesRefreshed: Dynamic = await refreshLiveHashes();
        if (disposed) {
          inFlight = false;
          notifyState();
          return;
        }
        if (remoteUpdateArrived && !hashesRefreshed && remoteChangeCount === remoteChangesAtStart) {
          if (timers.now() - retry.since >= retry.budgetMs)
            return surfaceStuckState("conflict", false);
          let delayMs: Dynamic = Math.min(
            jitterDelay(FILE_PUBLISH_RETRY_JITTER_MS * 2),
            Math.max(1, retry.budgetMs - (timers.now() - retry.since)),
          );
          backoffUntil = timers.now() + delayMs;
          notifyState();
          await interruptibleDelay(delayMs);
          backoffUntil = undefined;
          continue;
        }
        rebaseDirtyEdits();
        if (
          indexState &&
          indexPath !== undefined &&
          dirtyEdits.has(indexPath)
        ) {
          let indexMergeStatus: Dynamic = await reloadAndMergeIndex();
          if (indexMergeStatus !== "merged" && indexMergeStatus !== "unread")
            return surfaceStuckState(indexMergeStatus, false, undefined, indexPath);
        }
        if (dirtyEdits.size === 0) {
          resetRetryState();
          return;
        }
        if (!remoteUpdateArrived) {
          if (retriedWithoutRemoteUpdate) return surfaceStuckState("conflict", true);
          retriedWithoutRemoteUpdate = true;
        }
        return backoffAndRetry("conflict", remoteUpdateArrived);
      }
    }
    if (failure.code === "rate_limited") {
      metrics.rateLimited += 1;
      let retry: Dynamic = beginRetryAttempt(),
        serverDelayMs: Dynamic =
          failure.retryAfterMs !== undefined &&
          Number.isFinite(failure.retryAfterMs) &&
          failure.retryAfterMs >= 0
            ? Math.min(
                Math.max(failure.retryAfterMs, FILE_PUBLISH_MIN_RETRY_GAP_MS),
                FILE_PUBLISH_RECOVERY_LIMIT_MS,
              )
            : undefined,
        retryDelayMs: Dynamic = serverDelayMs ?? backoffMs;
      backoffMs = Math.min(FILE_PUBLISH_MAX_BACKOFF_MS, backoffMs * 2);
      retryNotBefore = timers.now() + retryDelayMs;
      hasServerRetryDelay = serverDelayMs !== undefined;
      backoffUntil = retryNotBefore;
      notifyState();
      let remainingBudgetMs: Dynamic =
          retry.budgetMs - (timers.now() - retry.since),
        wasInterrupted: Dynamic = await interruptibleDelay(
          Math.max(0, Math.min(retryDelayMs, remainingBudgetMs)),
          hasServerRetryDelay,
        );
      if (disposed) {
        inFlight = false;
        notifyState();
        return;
      }
      return !wasInterrupted &&
        (timers.now() < retryNotBefore ||
          timers.now() - retry.since >= retry.budgetMs)
        ? surfaceStuckState(
            "rate_limited",
            false,
            Math.max(
              retryNotBefore - timers.now(),
              FILE_PUBLISH_MIN_RETRY_GAP_MS,
            ),
          )
        : ((retryNotBefore = 0),
          (backoffUntil = undefined),
          (metrics.retries += 1),
          (lastError = undefined),
          publishBatch());
    }
    if (failure.code === "upstream_error") {
      beginRetryAttempt();
      notifyState();
      return backoffAndRetry("upstream_error", true);
    }
    beginRetryAttempt();
    surfaceStuckState(failure.code, false);
  }
  async function backoffAndRetry(
    errorCode?: Dynamic,
    canRetryWithoutRemoteChange?: Dynamic,
  ): Promise<Dynamic> {
    let retry: Dynamic = retryWindow,
      elapsedMs: Dynamic = timers.now() - retry.since;
    if (elapsedMs >= retry.budgetMs)
      return surfaceStuckState(errorCode, !canRetryWithoutRemoteChange);
    let refusals: Dynamic = retry.refusals,
      delayMs: Dynamic;
    refusals <= 1
      ? (delayMs =
          errorCode === "upstream_error"
            ? FILE_PUBLISH_CONFLICT_RETRY_MS[0] +
              Math.floor(
                random() *
                  (FILE_PUBLISH_CONFLICT_RETRY_MS[1] -
                    FILE_PUBLISH_CONFLICT_RETRY_MS[0]),
              )
            : 0)
      : (delayMs = jitterDelay(
          Math.min(
            FILE_CONFLICT_MAX_JITTER_MS,
            FILE_PUBLISH_RETRY_JITTER_MS * 2 ** (refusals - 2),
          ),
        ));
    delayMs = Math.min(delayMs, retry.budgetMs - elapsedMs);
    metrics.retries += 1;
    delayMs > 0 &&
      ((backoffUntil = timers.now() + delayMs),
      notifyState(),
      await interruptibleDelay(delayMs),
      (backoffUntil = undefined));
    if (disposed) {
      inFlight = false;
      notifyState();
      return;
    }
    lastError = undefined;
    return publishBatch();
  }
  function surfaceStuckState(
    errorCode?: Dynamic,
    waitForRemoteChange?: Dynamic,
    delayOverrideMs?: Dynamic,
    filePath?: Dynamic,
    nextRetryBudgetMs: Dynamic = 0,
  ): Dynamic {
    let now: Dynamic = timers.now();
    lastError = errorCode;
    let conflictRetriesExhausted: Dynamic =
      errorCode === "conflict" &&
      (conflictWindow?.attempts ?? 0) >= FILE_PUBLISH_MAX_RETRIES;
    retryWhenRemoteChanges = waitForRemoteChange || conflictRetriesExhausted;
    backoffUntil = undefined;
    flushRequested = false;
    inFlight = false;
    retryWindow = undefined;
    let retryable: Dynamic = !PERMANENT_PUBLISH_ERROR_CODES.has(errorCode),
      nextRetryAt: Dynamic,
      configuredRetryMs: Dynamic = publisherOptions.stuckRetryMs ?? FILE_PUBLISH_STUCK_RETRY_MS;
    if (
      retryable &&
      !waitForRemoteChange &&
      !conflictRetriesExhausted &&
      (configuredRetryMs > 0 || delayOverrideMs !== undefined)
    ) {
      let delayMs: Dynamic = delayOverrideMs ?? jitterDelay(stuckRetryMs);
      delayOverrideMs === undefined &&
        (stuckRetryMs = Math.min(
          FILE_PUBLISH_MAX_BACKOFF_MS,
          stuckRetryMs * 2,
        ));
      nextRetryAt = now + delayMs;
      retryTimer !== undefined && timers.clearTimeout(retryTimer);
      retryTimer = timers.setTimeout((): Dynamic => {
        retryTimer = undefined;
        retryStuck(nextRetryBudgetMs);
      }, delayMs);
    }
    stuckState = {
      code: errorCode,
      since: conflictWindow?.since ?? now,
      attempts: conflictWindow?.attempts ?? 1,
      paths: [...dirtyEdits.keys()],
      retryable: retryable,
      stashed: stuckState?.stashed ?? false,
      ...(nextRetryAt !== undefined
        ? {
            nextRetryAt: nextRetryAt,
          }
        : {}),
      ...(filePath !== undefined
        ? {
            file: filePath,
          }
        : {}),
    };
    stashHandedOff = false;
    writeCrashStash();
    notifyState();
  }
  let stashGeneration: Dynamic = 0,
    pendingStashWork: Dynamic = Promise.resolve();
  function serializeStashWork(run?: Dynamic): Dynamic {
    let work: Dynamic = pendingStashWork.then(run);
    pendingStashWork = work.catch((): Dynamic => {});
    return work;
  }
  let writingStash: Dynamic = false,
    stashWriteRequested: Dynamic = false;
  function writeCrashStash(): Dynamic {
    if (publisherOptions.stash === undefined || stashHandedOff) return;
    if (writingStash) {
      stashWriteRequested = true;
      return;
    }
    let stashEntries: Dynamic = [],
      capturedAllEdits: Dynamic = true,
      pendingEdits: Dynamic = [...dirtyEdits].map(
        ([filePath, edit]: Dynamic): Dynamic => [
          filePath,
          edit.value,
          edit.base,
        ],
      );
    for (let [filePath, conflict] of inFlightEdits as Dynamic)
      if (!dirtyEdits.has(filePath)) {
        if (conflict.unreadable === true) {
          capturedAllEdits = false;
          continue;
        }
        pendingEdits.push([filePath, (): Dynamic => conflict.mine, conflict.base]);
      }
    for (let [filePath, edit] of unsendableEdits as Dynamic)
      !dirtyEdits.has(filePath) &&
        !inFlightEdits.has(filePath) &&
        pendingEdits.push([filePath, edit.value, edit.base]);
    if (pendingEdits.length === 0) return;
    for (let [filePath, readValue, baseSha] of pendingEdits as Dynamic) {
      let file: Dynamic;
      try {
        file = readValue();
      } catch {
        capturedAllEdits = false;
        continue;
      }
      let text: Dynamic =
        file === null
          ? null
          : typeof file == "object" &&
              !(typeof Blob !== "undefined" && file instanceof Blob)
            ? file.content
            : file;
      if (text !== null && typeof text != "string") {
        capturedAllEdits = false;
        continue;
      }
      stashEntries.push({
        path: filePath,
        text: text,
        base: baseSha,
      });
    }
    stashDirty = true;
    writingStash = true;
    let generation: Dynamic = ++stashGeneration,
      stash: Dynamic = publisherOptions.stash,
      version: Dynamic = originalPort.version().version;
    serializeStashWork((): Dynamic => stash.put(stashEntries, version))
      .finally((): Dynamic => {
        writingStash = false;
        stashWriteRequested && ((stashWriteRequested = false), writeCrashStash());
      })
      .then((saved?: Dynamic): Dynamic => {
        generation !== stashGeneration ||
          disposed ||
          (stuckState === undefined && unsendableEdits.size === 0) ||
          (stuckState !== undefined &&
            (stuckState = {
              ...stuckState,
              stashed: saved && capturedAllEdits,
            }),
          (unsendableStashed = unsendableEdits.size > 0 && saved && capturedAllEdits),
          notifyState());
      });
  }
  function clearSettledStash(): Dynamic {
    if (!stashDirty) return;
    if (
      dirtyEdits.size > 0 ||
      inFlightEdits.size > 0 ||
      unsendableEdits.size > 0
    ) {
      scheduleCrashStash(0);
      return;
    }
    stashDirty = false;
    let stash: Dynamic = publisherOptions.stash,
      hadOfferedStash: Dynamic = stashOffered;
    stashOffered = false;
    stash !== undefined &&
      serializeStashWork(async (): Promise<Dynamic> => {
        await stash.clear();
        hadOfferedStash && (await stash.clearOffered());
      });
  }
  let stashHandedOff: Dynamic = false,
    handoffTimeout: Dynamic,
    stashTimer: Dynamic;
  function scheduleCrashStash(delayMs: Dynamic = 1e3): Dynamic {
    if (!(publisherOptions.stash === undefined || disposed)) {
      if (stashTimer !== undefined) {
        if (delayMs > 0) return;
        timers.clearTimeout(stashTimer);
      }
      stashTimer = timers.setTimeout((): Dynamic => {
        stashTimer = undefined;
        !disposed &&
          (dirtyEdits.size > 0 ||
            inFlightEdits.size > 0 ||
            unsendableEdits.size > 0) &&
          writeCrashStash();
      }, delayMs);
    }
  }
  function clearStuckIfClean(): Dynamic {
    dirtyEdits.size > 0 ||
      stuckState === undefined ||
      inFlight ||
      resetRetryState();
  }
  function waitForRemoteUpdate(): Dynamic {
    return new Promise((resolve?: Dynamic): Dynamic => {
      let finished: Dynamic = false,
        finish: Dynamic = (receivedUpdate?: Dynamic): Dynamic => {
          finished ||
            ((finished = true),
            unsubscribe(),
            timers.clearTimeout(updateTimeout),
            resolve(receivedUpdate));
        },
        unsubscribe: Dynamic = originalPort.onRemoteChange(
          (): Dynamic => finish(true),
        ),
        updateTimeout: Dynamic = timers.setTimeout(
          (): Dynamic => finish(false),
          FILE_REMOTE_UPDATE_WAIT_MS,
        );
    });
  }
  async function refreshLiveHashes(): Promise<Dynamic> {
    try {
      let listedFiles: Dynamic = await retryAccessFailure(
        (): Dynamic => listWritableFiles(originalPort),
        timers,
        undefined,
        FILE_PUBLISH_SETTLE_RETRY_MS,
      );
      if (isNarrowedFileContext(listedFiles, originalPort))
        return false;
      let listedShas: Dynamic = new Map(
        listedFiles.map((file?: Dynamic): Dynamic => [file.path, file.sha256]),
      );
      for (let filePath of dirtyEdits.keys() as Dynamic)
        remoteHashes.set(filePath, listedShas.get(filePath) ?? null);
      indexPath !== undefined &&
        remoteHashes.set(indexPath, listedShas.get(indexPath) ?? null);
      return true;
    } catch {
      return false;
    }
  }
  async function reloadAndMergeIndex(): Promise<Dynamic> {
    if (!indexState) return "merged";
    try {
      let mergedFields: Dynamic = await retryAccessFailure(
        (): Dynamic => indexState.reloadAndMerge(),
        timers,
        undefined,
        FILE_PUBLISH_SETTLE_RETRY_MS,
      );
      indexNeedsRebase = false;
      if (mergedFields.length > 0)
        try {
          publisherOptions.onIndexMerged?.(mergedFields);
        } catch {}
      let entry: Dynamic = dirtyEdits.get(indexState.path);
      entry !== undefined && (entry.base = indexState.baseSha());
      return "merged";
    } catch (error: Dynamic) {
      if (
        error instanceof IndexFileError &&
        error.code !== "not_found"
      ) {
        lastDamagedIndexAt = timers.now();
        return error.code === "newer_version"
          ? "index_newer_build"
          : "index_damaged";
      }
      if (
        error?.status === 404 &&
        currentLiveHash(indexState.path) === null
      ) {
        indexNeedsRebase = false;
        let entry: Dynamic = dirtyEdits.get(indexState.path);
        entry !== undefined && (entry.base = null);
        return "merged";
      }
      return "unread";
    }
  }
  function requestImmediatePublish(): Dynamic {
    if (dirtyEdits.size !== 0) {
      if (stuckState !== undefined) {
        retryStuck(getRetryBudget());
        return;
      }
      bypassPacing = true;
      flushRequested = true;
      flushTimer !== undefined &&
        (timers.clearTimeout(flushTimer), (flushTimer = undefined));
      schedulePublish();
    }
  }
  function waitUntilIdle(): Dynamic {
    dirtyEdits.size > 0 &&
      !inFlight &&
      !isStoppedByError() &&
      requestImmediatePublish();
    return !inFlight &&
      flushTimer === undefined &&
      (dirtyEdits.size === 0 || isStoppedByError())
      ? Promise.resolve()
      : new Promise((resolve?: Dynamic): Dynamic => idleWaiters.push(resolve));
  }
  return {
    markDirty: markDirty,
    commit: flushNow,
    settle: waitUntilIdle,
    async dispose(): Promise<Dynamic> {
      requestImmediatePublish();
      await waitUntilIdle();
      disposed = true;
      unsubscribeRemoteChange();
      unsubscribePeers?.();
      maxWaitTimer !== undefined &&
        (timers.clearTimeout(maxWaitTimer), (maxWaitTimer = undefined));
      flushTimer !== undefined &&
        (timers.clearTimeout(flushTimer), (flushTimer = undefined));
      retryTimer !== undefined &&
        (timers.clearTimeout(retryTimer), (retryTimer = undefined));
      handoffTimeout !== undefined &&
        (timers.clearTimeout(handoffTimeout), (handoffTimeout = undefined));
      stashTimer !== undefined &&
        (timers.clearTimeout(stashTimer),
        (stashTimer = undefined),
        writeCrashStash());
      interruptWait?.();
    },
    counters: metrics,
    state: getSyncState,
    conflicted: (): Dynamic => inFlightEdits,
    unsendable: (): Dynamic => unsendableReasons,
    resolveConflict(filePath: Dynamic, resolution: Dynamic): Dynamic {
      let entry: Dynamic = inFlightEdits.get(filePath);
      entry !== undefined &&
        ((resolution === "mine" && entry.unreadable === true) ||
          (inFlightEdits.delete(filePath),
          resolution === "mine"
            ? markDirty(filePath, (): Dynamic => entry.mine, entry.theirsSha)
            : clearSettledStash()));
    },
    pending: (): Dynamic =>
      dirtyEdits.size > 0 ||
      inFlight ||
      inFlightEdits.size > 0 ||
      unsendableReasons.size > 0,
    isOwnEcho: isOwnPublishedHash,
    solo: isSoloPaced,
    withdraw(filePath: Dynamic): Dynamic {
      let removedDirtyEdit: Dynamic = dirtyEdits.delete(filePath),
        removedConflict: Dynamic = inFlightEdits.delete(filePath),
        removedUnsendableEdit: Dynamic = unsendableReasons.delete(filePath);
      unsendableEdits.delete(filePath);
      (removedDirtyEdit || removedConflict) && withdrawnPaths.add(filePath);
      dirtyEdits.size === 0 && ((firstDirtyAt = undefined), scheduleMaxWait());
      (removedDirtyEdit || removedConflict || removedUnsendableEdit) && notifyState();
      clearStuckIfClean();
      clearSettledStash();
    },
    withdrawn: (): Dynamic => withdrawnPaths,
    retryNow(): Dynamic {
      if (!(disposed || dirtyEdits.size === 0)) {
        conflictHistory.clear();
        if (interruptWait !== undefined) {
          waitIsInterruptible || interruptWait();
          return;
        }
        inFlight || retryStuck(getRetryBudget(), true);
      }
    },
    flushNow: requestImmediatePublish,
    stashRestored(): Dynamic {
      publisherOptions.stash !== undefined &&
        ((stashDirty = true), (stashOffered = true));
    },
    stashHandedOff(): Dynamic {
      if (
        publisherOptions.stash === undefined ||
        ((stashHandedOff = true),
        stashTimer !== undefined &&
          (timers.clearTimeout(stashTimer), (stashTimer = undefined)),
        handoffTimeout !== undefined && timers.clearTimeout(handoffTimeout),
        (handoffTimeout = timers.setTimeout((): Dynamic => {
          handoffTimeout = undefined;
          !(!stashHandedOff || disposed) &&
            ((stashHandedOff = false),
            (dirtyEdits.size > 0 ||
              inFlightEdits.size > 0 ||
              unsendableEdits.size > 0) &&
              writeCrashStash());
        }, FILE_FLUSH_TIMEOUT_MS)),
        !stashDirty)
      )
        return;
      stashDirty = false;
      let stash: Dynamic = publisherOptions.stash,
        hadOfferedStash: Dynamic = stashOffered;
      stashOffered = false;
      serializeStashWork(async (): Promise<Dynamic> => {
        await stash.clear();
        hadOfferedStash && (await stash.clearOffered());
      });
    },
  };
}
export {
  createFilesPublisher,
  createPublishTimers,
  FILE_CONFLICT_HISTORY_WINDOW_MS,
  FILE_CONFLICT_MAX_JITTER_MS,
  FILE_CONFLICT_RETRY_COOLDOWN_MS,
  FILE_FLUSH_TIMEOUT_MS,
  FILE_PUBLISH_CONFLICT_RETRY_MS,
  FILE_PUBLISH_INITIAL_BACKOFF_MS,
  FILE_PUBLISH_MAX_BACKOFF_MS,
  FILE_PUBLISH_MAX_RETRIES,
  FILE_PUBLISH_MIN_RETRY_GAP_MS,
  FILE_PUBLISH_PACING,
  FILE_PUBLISH_RECOVERY_LIMIT_MS,
  FILE_PUBLISH_RETRY_BUDGET_MS,
  FILE_PUBLISH_RETRY_JITTER_MS,
  FILE_PUBLISH_SETTLE_RETRY_MS,
  FILE_PUBLISH_STUCK_RETRY_MS,
  FILE_REMOTE_UPDATE_WAIT_MS,
  isIndexPublishFailure,
  MAX_FILE_CONFLICTS_PER_WINDOW,
  MAX_FILE_VERSION_ADOPTION_WAITS,
  MAX_OWN_PUBLISHED_VERSIONS,
  PERMANENT_PUBLISH_ERROR_CODES,
};
export function installPlatformFilesPublisher(): () => void {
  return () => {
    FILE_PUBLISH_PACING = {
      solo: {
        gapMs: 1e4,
        maxWaitMs: 1e4,
      },
      shared: {
        gapMs: 0,
        maxWaitMs: 1500,
      },
      recentMs: 5 * 6e4,
    };
    FILE_REMOTE_UPDATE_WAIT_MS = 5e3;
    FILE_FLUSH_TIMEOUT_MS = 15e3;
    FILE_PUBLISH_INITIAL_BACKOFF_MS = 2e3;
    FILE_PUBLISH_MAX_BACKOFF_MS = 3e4;
    FILE_PUBLISH_RETRY_BUDGET_MS = 1e4;
    FILE_PUBLISH_RETRY_JITTER_MS = 200;
    FILE_CONFLICT_MAX_JITTER_MS = 3e3;
    FILE_PUBLISH_STUCK_RETRY_MS = 2e3;
    MAX_FILE_CONFLICTS_PER_WINDOW = 3;
    FILE_CONFLICT_HISTORY_WINDOW_MS = 6e4;
    FILE_CONFLICT_RETRY_COOLDOWN_MS = 2e4;
    FILE_PUBLISH_MAX_RETRIES = 20;
    FILE_PUBLISH_RECOVERY_LIMIT_MS = 5 * 6e4;
    MAX_FILE_VERSION_ADOPTION_WAITS = 4;
    MAX_OWN_PUBLISHED_VERSIONS = 64;
    FILE_PUBLISH_MIN_RETRY_GAP_MS = 1e3;
    FILE_PUBLISH_CONFLICT_RETRY_MS = [300, 800];
    FILE_PUBLISH_SETTLE_RETRY_MS = [150, 300, 600, 1e3, 2e3];
    PERMANENT_PUBLISH_ERROR_CODES = new Set([
      "not_writer",
      "not_declared",
      "capability_disabled",
      "too_large",
      "invalid_content",
      "read_only_path",
      "index_newer_build",
      "index_damaged",
    ]);
    isIndexPublishFailure = (errorCode?: Dynamic): Dynamic =>
      errorCode === "index_newer_build" || errorCode === "index_damaged";
  };
}
