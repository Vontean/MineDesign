/** Restored application module; prepare first, initialize in original order. */
import type {
  DirtyFileEntry,
  FileSaveConflict,
  UnsendableFileEntry,
  FileSaveStuck,
  FileSaveQueueState,
  FileSaveRetryWindow,
  FilesSaveQueueOptions,
  FilesSaveQueue,
  SaveLifecycleQueue,
  SaveLifecycleHost,
  FileRetryError,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import { roomPeerStore } from "../editor/claude-delivery";
import { IndexFileError } from "../editor/index-file-store";
import { FILES_BOOT_PERMANENT_RETRY_MS } from "./boot-reader";
import { fileContentContainsRuntimeMarkers, fileListingIsNarrowed, filePublishRawBytes, filePublishRejection, filePublishSizeRejection, filesPortExtensions, hashFilePublishEntries, isProjectIndexFilePath, listWritableFiles, retryFileRead, splitFilePublishBatches } from "./paths";

var FILE_SAVE_DEBOUNCE_POLICY: {
  solo: { gapMs: number; maxWaitMs: number };
  shared: { gapMs: number; maxWaitMs: number };
  recentMs: number;
};
var FILE_SAVE_RETRY_MIN_MS: number;
var FILE_SAVE_RETRY_MAX_MS: number;
var FILE_SAVE_BACKPRESSURE_DELAY_MS: number;
var FILE_SAVE_STUCK_TIMEOUT_MS: number;
var FILE_SAVE_SHARED_ACTIVITY_TIMEOUT_MS: number;
var FILE_SAVE_QUICK_RETRY_MS: number;
var FILE_SAVE_LONG_REQUEST_MS: number;
var FILE_SAVE_CONFLICT_RETRY_MS: number;
var FILE_SAVE_MAX_TRANSIENT_RETRIES: number;
var FILE_SAVE_TOTAL_RETRY_WINDOW_MS: number;
var FILE_SAVE_RECENT_PEER_WINDOW_MS: number;
var FILE_SAVE_MAX_CONFLICT_PATHS: number;
var FILE_SAVE_RECENT_ACTIVITY_WINDOW_MS: number;
var FILE_SAVE_MAX_CONFLICT_RETRIES: number;
var FILE_SAVE_MAX_BATCH_CONFLICTS: number;
var FILE_SAVE_RETRY_JITTER_MS: number;
var FILE_SAVE_CONFLICT_BACKOFF_MS: [number, number];
var FILE_SAVE_READ_RETRY_DELAYS_MS: number[];
var FILE_SAVE_TERMINAL_ERROR_CODES: Set<string>;
var isIndexFileSaveError: (code: string | undefined) => boolean;
function defaultFilesSaveTimers(): Files.FilesTimers {
  return {
    setTimeout: (timerCallback, delayMs) => setTimeout(timerCallback, delayMs),
    clearTimeout: (timerHandle) => clearTimeout(timerHandle),
    now: (): number => Date.now(),
    random: (): number => Math.random(),
  };
}
function createFilesSaveQueue(
  queueOptions: FilesSaveQueueOptions,
): FilesSaveQueue {
  let { port: port } = queueOptions,
    normalizedPort = filesPortExtensions(port),
    timers = queueOptions.timers ?? defaultFilesSaveTimers(),
    indexStore = queueOptions.index,
    indexPath = indexStore?.path,
    isIndexPath = (filePath: string) =>
      indexPath !== undefined
        ? filePath === indexPath
        : isProjectIndexFilePath(filePath),
    dirtyEntries: Map<string, DirtyFileEntry> = new Map(),
    conflictedEntries: Map<string, FileSaveConflict> = new Map(),
    recentConflictTimes: Map<string, number[]> = new Map(),
    conflictSurfacedAt: Map<string, number> = new Map(),
    conflictBudgetExceeded: Set<string> = new Set(),
    withdrawnPaths: Set<string> = new Set(),
    remoteShas: Map<string, string | null> = new Map(),
    unsendableReasons: Map<string, string> = new Map(),
    unsendableEntries: Map<string, UnsendableFileEntry> = new Map(),
    unsendableStashed = false,
    ownPublishedShas: Map<string, string | null> = new Map(),
    awaitingComputedShas: Set<string> = new Set(),
    lastRemoteVersion: string | undefined,
    isPublishVersionCurrent = () =>
      lastRemoteVersion === port.version().version ||
      port.version().version === lastPublishVersion,
    lastPublishVersion: string | undefined,
    ownPublishedVersions: Set<string> = new Set(),
    counters = {
      publishes: 0,
      pathsSent: 0,
      conflicts: 0,
      retries: 0,
      rateLimited: 0,
      bytesSent: 0,
      lastPublishMs: 0,
      surfaced: 0,
    },
    dirtyGeneration = 0,
    inFlight: boolean = false,
    commitRequested: boolean = false,
    disposed: boolean = false,
    lastError: string | undefined,
    backoffUntil: number | undefined,
    rateLimitBackoff: number = FILE_SAVE_BACKPRESSURE_DELAY_MS,
    commitTimer: ReturnType<typeof setTimeout> | undefined,
    lastPublishStartedAt = -1 / 0,
    settleWaiters: (() => void)[] = [],
    conflictRetryUsed: boolean = false,
    retryOnRemoteChange = false,
    remoteChangeGeneration = 0,
    retryWindow: FileSaveRetryWindow | undefined,
    retryBudgetMs =
      queueOptions.retryBudgetMs ?? FILE_SAVE_SHARED_ACTIVITY_TIMEOUT_MS,
    refusalHistory: { since: number; attempts: number } | undefined,
    stuckState: FileSaveStuck | undefined,
    retryTimer: ReturnType<typeof setTimeout> | undefined,
    stuckRetryBackoff = queueOptions.stuckRetryMs ?? FILE_SAVE_CONFLICT_RETRY_MS,
    hasStashedEntries: boolean = false,
    clearOfferedStashOnSave: boolean = false,
    rateLimitUntil = 0,
    serverRateLimit: boolean = false,
    firstDirtyAt: number | undefined,
    maxWaitTimer: ReturnType<typeof setTimeout> | undefined,
    ignorePacingOnce: boolean = false,
    indexNeedsMerge: boolean = false,
    lastStuckRetryAt = -1 / 0,
    wakeRetryWait: (() => void) | undefined,
    retryWaitProtected = false,
    random = () => timers.random?.() ?? Math.random(),
    jitterDelay = (delayMs: number): number =>
      Math.round(delayMs / 2 + random() * (delayMs / 2)),
    currentRetryBudget = () =>
      queueOptions.retryBudgetMs ?? FILE_SAVE_SHARED_ACTIVITY_TIMEOUT_MS;
  function waitForRetryOrWake(delayMs: number, protectRetryWait: boolean = false) {
    return new Promise<boolean>((resolve): void => {
      let value = timers.setTimeout((): void => {
        wakeRetryWait = undefined;
        resolve(false);
      }, delayMs);
      retryWaitProtected = protectRetryWait;
      wakeRetryWait = (): void => {
        timers.clearTimeout(value);
        wakeRetryWait = undefined;
        resolve(true);
      };
    });
  }
  let liveSha = (filePath: string) =>
      remoteShas.has(filePath)
        ? remoteShas.get(filePath)
        : normalizedPort.liveSha?.(filePath),
    getQueueState: () => FileSaveQueueState = () => ({
      dirty: dirtyEntries.size,
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
      ...(unsendableEntries.size > 0
        ? {
            unsendable: [...unsendableEntries].map(([filePath, entry]) => ({
              path: filePath,
              why: entry.why,
              cause: entry.cause,
            })),
            ...(unsendableStashed
              ? {
                  unsendableStashed: true,
                }
              : {}),
          }
        : {}),
    }),
    notifyState = (): void => {
      try {
        queueOptions.onState?.(getQueueState());
      } catch {}
      if (
        !inFlight &&
        commitTimer === undefined &&
        (dirtyEntries.size === 0 || hasTerminalError())
      ) {
        let value = settleWaiters;
        settleWaiters = [];
        for (let subscriber of value) {
          subscriber();
        }
      }
    },
    hasTerminalError = () =>
      lastError !== undefined &&
      backoffUntil === undefined &&
      !commitRequested,
    isOwnPublishEcho = (change: Files.ChangedFileRow) =>
      ownPublishedShas.has(change.path) &&
      ownPublishedShas.get(change.path) === change.sha256,
    lastSharedActivityAt = -1 / 0,
    peerStore: import("../contracts/files-core").SaveQueuePeers =
      queueOptions.peers ?? roomPeerStore,
    hasOtherPeers = () =>
      peerStore.getSnapshot().some((peer): boolean => !peer.sameTab),
    hasRecentSharedActivity = (): boolean =>
      timers.now() - lastSharedActivityAt <
      FILE_SAVE_DEBOUNCE_POLICY.recentMs,
    isSoloPacing = () =>
      queueOptions.paced === true &&
      !hasOtherPeers() &&
      !hasRecentSharedActivity(),
    getPacingPolicy = () =>
      queueOptions.paced !== true
        ? undefined
        : isSoloPacing()
          ? FILE_SAVE_DEBOUNCE_POLICY.solo
          : FILE_SAVE_DEBOUNCE_POLICY.shared;
  function switchToSharedPacing(): void {
    if (disposed) {
      return;
    }
    scheduleMaxWaitCommit();
    if (commitTimer !== undefined) {
      timers.clearTimeout(commitTimer);
      commitTimer = undefined;
    }
    tryStartCommit();
    try {
      queueOptions.onShared?.();
    } catch {}
  }
  function recordSharedActivity(): void {
    let value = isSoloPacing();
    lastSharedActivityAt = timers.now();
    if (value) {
      switchToSharedPacing();
    }
  }
  let hadOtherPeers = queueOptions.paced === true && hasOtherPeers(),
    unsubscribePeers =
      queueOptions.paced !== true
        ? undefined
        : peerStore.subscribe((): void => {
            let value = hasOtherPeers(),
              sharedActivity = value && !hadOtherPeers;
            hadOtherPeers = value;
            if (sharedActivity && !hasRecentSharedActivity()) {
              switchToSharedPacing();
            }
          });
  function scheduleMaxWaitCommit(): void {
    if (maxWaitTimer !== undefined) {
      timers.clearTimeout(maxWaitTimer);
      maxWaitTimer = undefined;
    }
    let value = getPacingPolicy();
    if (value === undefined || firstDirtyAt === undefined || disposed) {
      return;
    }
    maxWaitTimer = timers.setTimeout(
      (): void => {
        maxWaitTimer = undefined;
        if (dirtyEntries.size === 0) {
          firstDirtyAt = undefined;
          return;
        }
        if (stuckState === undefined) {
          commitRequested = true;
          tryStartCommit();
        }
      },
      Math.max(0, firstDirtyAt + value.maxWaitMs - timers.now()),
    );
  }
  let unsubscribeRemoteChange = port.onRemoteChange((change) =>
    handleRemoteChange(change),
  );
  function handleRemoteChange(remoteChange: Files.FileRemoteChange): void {
    remoteChangeGeneration += 1;
    let callback = (change: Files.ChangedFileRow) =>
        isOwnPublishEcho(change) ||
        (awaitingComputedShas.has(change.path) &&
          change.sha256 !== null &&
          ownPublishedVersions.has(remoteChange.to.version)),
      value = remoteChange.changed.some((change): boolean => !callback(change));
    for (let change of remoteChange.changed) {
      if (
        (remoteShas.set(change.path, change.sha256),
        awaitingComputedShas.delete(change.path),
        ownPublishedShas.has(change.path) &&
          ownPublishedShas.get(change.path) !== change.sha256)
      ) {
        ownPublishedShas.delete(change.path);
      }
    }
    lastRemoteVersion = remoteChange.to.version;
    if (value) {
      recordSharedActivity();
    }
    let shouldRetry =
        isIndexFileSaveError(stuckState?.code) &&
        indexPath !== undefined &&
        remoteChange.changed.some((change): boolean => change.path === indexPath),
      retryDelay =
        shouldRetry && !retryOnRemoteChange
          ? FILES_BOOT_PERMANENT_RETRY_MS -
            (timers.now() - lastStuckRetryAt)
          : 0;
    if (retryDelay > 0) {
      if (retryTimer === undefined && !disposed) {
        retryTimer = timers.setTimeout((): void => {
          retryTimer = undefined;
          restartRetryWindow(currentRetryBudget());
        }, retryDelay);
      }
      return;
    }
    if ((retryOnRemoteChange || shouldRetry) && !inFlight && !disposed) {
      restartRetryWindow(currentRetryBudget());
    }
  }
  indexStore?.bind?.(
    (filePath: string, valueProvider: () => string, baseSha: string | null) =>
      markDirty(filePath, valueProvider, baseSha),
  );
  function recordConflictAttempt(filePath: string): void {
    let value = timers.now();
    recentConflictTimes.set(filePath, [
      ...(recentConflictTimes.get(filePath) ?? []).filter(
        (timestamp): boolean => value - timestamp < FILE_SAVE_TOTAL_RETRY_WINDOW_MS,
      ),
      value,
    ]);
  }
  function markDirty(
    filePath: string,
    valueProvider: () => Files.FilePublishInput,
    baseSha?: string | null,
  ): void {
    if (disposed) {
      return;
    }
    let entry = dirtyEntries.get(filePath);
    dirtyGeneration += 1;
    let value =
        ownPublishedShas.has(filePath) &&
        (liveSha(filePath) === undefined ||
          liveSha(filePath) === ownPublishedShas.get(filePath)),
      remoteSha =
        baseSha !== undefined
          ? baseSha
          : entry !== undefined
            ? entry.base
            : value
              ? ownPublishedShas.get(filePath)
              : (normalizedPort.heldSha?.(filePath) ?? liveSha(filePath) ?? null);
    unsendableReasons.delete(filePath);
    unsendableEntries.delete(filePath);
    dirtyEntries.set(filePath, {
      value: valueProvider,
      base: remoteSha,
      gen: dirtyGeneration,
    });
    if (firstDirtyAt === undefined) {
      firstDirtyAt = timers.now();
      scheduleMaxWaitCommit();
    }
    withdrawnPaths.delete(filePath);
    if (baseSha !== undefined) {
      let conflictTime = conflictSurfacedAt.get(filePath);
      if (
        conflictTime !== undefined &&
        timers.now() - conflictTime < FILE_SAVE_TOTAL_RETRY_WINDOW_MS
      ) {
        recordConflictAttempt(filePath);
      }
      conflictSurfacedAt.delete(filePath);
      conflictedEntries.delete(filePath);
    }
    if (stuckState !== undefined) {
      stuckState = {
        ...stuckState,
        paths: [...dirtyEntries.keys()],
      };
    }
    stashWritePaused = false;
    scheduleStashWrite();
    notifyState();
  }
  function commit(): void {
    if (disposed && dirtyEntries.size === 0) {
      return;
    }
    if (dirtyEntries.size === 0) {
      return;
    }
    if (stuckState !== undefined) {
      if (inFlight) {
        commitRequested = true;
      } else {
        restartRetryWindow(currentRetryBudget());
      }
      return;
    }
    commitRequested = true;
    tryStartCommit();
  }
  function restartRetryWindow(
    delayMs: number,
    protectRetryWait: boolean = false,
  ): void {
    if (disposed || inFlight) {
      return;
    }
    let value = rateLimitUntil - timers.now();
    if (value > 0 && (serverRateLimit || !protectRetryWait)) {
      if (retryTimer === undefined) {
        retryTimer = timers.setTimeout((): void => {
          retryTimer = undefined;
          restartRetryWindow(delayMs);
        }, value);
      }
      return;
    }
    if (retryTimer !== undefined) {
      timers.clearTimeout(retryTimer);
      retryTimer = undefined;
    }
    ignorePacingOnce = true;
    if (commitTimer !== undefined) {
      timers.clearTimeout(commitTimer);
      commitTimer = undefined;
    }
    retryWindow = undefined;
    retryBudgetMs = delayMs;
    retryOnRemoteChange = false;
    lastError = undefined;
    if (dirtyEntries.size === 0) {
      notifyState();
      return;
    }
    commitRequested = true;
    tryStartCommit();
  }
  function tryStartCommit(): void {
    if (inFlight || !commitRequested) {
      return;
    }
    if (commitTimer !== undefined) {
      scheduleStashWrite(0);
      return;
    }
    if (dirtyEntries.size === 0) {
      commitRequested = false;
      notifyState();
      return;
    }
    let value: number =
      Math.max(
        queueOptions.minGapMs ?? 0,
        ignorePacingOnce ? 0 : (getPacingPolicy()?.gapMs ?? 0),
      ) -
      (timers.now() - lastPublishStartedAt);
    if (value > 0) {
      commitTimer = timers.setTimeout((): void => {
        commitTimer = undefined;
        tryStartCommit();
      }, value);
      scheduleStashWrite(0);
      return;
    }
    commitRequested = false;
    ignorePacingOnce = false;
    publishDirtyEntries();
  }
  function detectChangedFileBases(): void {
    conflictBudgetExceeded.clear();
    for (let [value, filePath] of [...dirtyEntries]) {
      if (isIndexPath(value)) {
        continue;
      }
      let liveShaValue = liveSha(value);
      if (liveShaValue === undefined || liveShaValue === filePath.base) {
        continue;
      }
      if (
        ownPublishedShas.has(value) &&
        ownPublishedShas.get(value) === liveShaValue
      ) {
        filePath.base = liveShaValue;
        continue;
      }
      if (
        awaitingComputedShas.has(value) &&
        typeof liveShaValue === "string" &&
        isPublishVersionCurrent()
      ) {
        awaitingComputedShas.delete(value);
        ownPublishedShas.set(value, liveShaValue);
        filePath.base = liveShaValue;
        continue;
      }
      let now = timers.now();
      if (
        (recentConflictTimes.get(value) ?? []).filter(
          (timestamp): boolean =>
            now - timestamp < FILE_SAVE_TOTAL_RETRY_WINDOW_MS,
        ).length >= FILE_SAVE_MAX_TRANSIENT_RETRIES
      ) {
        conflictBudgetExceeded.add(value);
        continue;
      }
      let fileContent: Files.FilePublishInput,
        flag: boolean = false;
      try {
        fileContent = filePath.value();
      } catch {
        fileContent = null;
        flag = true;
      }
      let state = {
        path: value,
        base: filePath.base,
        mine: fileContent,
        theirsSha: liveShaValue,
        ...(flag
          ? {
              unreadable: true,
            }
          : {}),
      };
      dirtyEntries.delete(value);
      conflictedEntries.set(value, state);
      conflictSurfacedAt.set(value, now);
      counters.surfaced += 1;
      if (queueOptions.stash !== undefined) {
        hasStashedEntries = true;
        stashWritePaused = false;
      }
      try {
        queueOptions.onConflict(state);
      } catch {}
    }
  }
  function beginRetryAttempt() {
    let value = timers.now();
    retryWindow ??= {
      since: value,
      refusals: 0,
      budgetMs: retryBudgetMs,
    };
    retryWindow.refusals += 1;
    refusalHistory ??= {
      since: value,
      attempts: 0,
    };
    refusalHistory.attempts += 1;
    return retryWindow;
  }
  async function publishDirtyEntries(): Promise<void> {
    inFlight = true;
    lastPublishStartedAt = timers.now();
    let value = remoteChangeGeneration;
    detectChangedFileBases();
    if (
      indexStore &&
      indexPath !== undefined &&
      dirtyEntries.has(indexPath)
    ) {
      let indexSha = liveSha(indexPath),
        indexMergeResult =
          (indexSha !== undefined &&
            indexSha !== null &&
            indexSha !== indexStore.baseSha() &&
            ownPublishedShas.get(indexPath) !== indexSha) ||
          indexNeedsMerge
            ? await mergeRemoteIndex()
            : "merged";
      if (indexMergeResult !== "merged" && indexMergeResult !== "unread") {
        beginRetryAttempt();
        return markStuck(indexMergeResult, false, undefined, indexPath);
      }
      if (indexMergeResult === "unread") {
        lastError = "conflict";
        beginRetryAttempt();
        notifyState();
        return retryFailure("conflict", true);
      }
    }
    let state: Files.FilePublishEntries = {},
      entries: Map<string, number> = new Map(),
      baseShas: Record<string, string | null | undefined> = {};
    for (let [filePath, dirtyEntry] of [...dirtyEntries]) {
      if (conflictBudgetExceeded.has(filePath)) {
        continue;
      }
      let fileContent: Files.FilePublishInput;
      try {
        fileContent = dirtyEntry.value();
      } catch {
        continue;
      }
      let rejectionReason:
        | {
            why: string;
            cause: import("../contracts/files-core").UnsendableCause;
          }
        | undefined;
      try {
        if (normalizedPort.entryProblemDetail !== undefined) {
          rejectionReason = normalizedPort.entryProblemDetail(filePath, fileContent);
        } else if (normalizedPort.entryProblem !== undefined) {
          let problemReason = normalizedPort.entryProblem(filePath, fileContent);
          rejectionReason =
            problemReason === undefined
              ? undefined
              : {
                  why: problemReason,
                  cause: "other",
                };
        } else {
          rejectionReason = filePublishRejection(filePath, fileContent);
        }
      } catch {
        rejectionReason = filePublishRejection(filePath, fileContent);
      }
      if (rejectionReason === undefined) {
        let sizeReason = filePublishSizeRejection(fileContent);
        if (sizeReason !== undefined) {
          rejectionReason = {
            why: sizeReason,
            cause: "size",
          };
        }
      }
      if (rejectionReason !== undefined && fileContent === null) {
        dirtyEntries.delete(filePath);
        unsendableReasons.delete(filePath);
        unsendableEntries.delete(filePath);
        continue;
      }
      if (rejectionReason !== undefined) {
        dirtyEntries.delete(filePath);
        unsendableReasons.set(filePath, rejectionReason.why);
        unsendableEntries.set(filePath, {
          value: dirtyEntry.value,
          base: dirtyEntry.base,
          why: rejectionReason.why,
          cause: rejectionReason.cause,
        });
        unsendableStashed = false;
        if (queueOptions.stash !== undefined) {
          hasStashedEntries = true;
          stashWritePaused = false;
        }
        try {
          queueOptions.onUnsendable?.(filePath, rejectionReason.why);
        } catch {}
        continue;
      }
      state[filePath] = fileContent;
      entries.set(filePath, dirtyEntry.gen);
      baseShas[filePath] = dirtyEntry.base;
    }
    if (entries.size === 0) {
      if (dirtyEntries.size === 0) {
        finishPublish();
        return;
      }
      if (
        [...dirtyEntries.keys()].every((filePath) =>
          conflictBudgetExceeded.has(filePath),
        )
      ) {
        return markStuck("conflict", false, FILE_SAVE_RECENT_PEER_WINDOW_MS);
      }
      beginRetryAttempt();
      return markStuck("invalid_content", false);
    }
    notifyState();
    let publishBatches = splitFilePublishBatches(state, isIndexPath),
      publishFailure: Files.FilePublishFailure | undefined;
    for (let batch of publishBatches) {
      let publishStartedAt = timers.now(),
        publishResult: Files.FilePublishResult,
        ifMatchShas = Object.fromEntries(
          Object.keys(batch)
            .filter(
              (filePath): boolean =>
                !(
                  awaitingComputedShas.has(filePath) &&
                  baseShas[filePath] === ownPublishedShas.get(filePath)
                ),
            )
            .map((filePath) => [filePath, baseShas[filePath] ?? null]),
        ),
        version = port.version().version;
      try {
        publishResult = await port.publish(batch, {
          ifMatch: ifMatchShas,
        });
      } catch {
        publishResult = {
          ok: false,
          code: "upstream_error",
        };
      }
      if (
        publishResult.ok &&
        publishResult.unchanged !== true &&
        publishResult.version === version
      ) {
        publishResult = {
          ...publishResult,
          unchanged: true,
        };
      }
      if (!publishResult.ok) {
        publishFailure = publishResult;
        break;
      }
      if (publishResult.changed) {
        for (let change of publishResult.changed) {
          if (!(change.path in batch)) {
            remoteShas.set(change.path, change.sha256);
            awaitingComputedShas.delete(change.path);
          }
        }
      }
      let publishSucceeded =
        publishResult.preconditionsChecked === true &&
        Object.keys(batch).every((filePath) => Object.hasOwn(ifMatchShas, filePath));
      if (
        !(
          publishResult.unchanged === true ||
          (publishSucceeded && publishResult.changed === undefined)
        )
      ) {
        lastPublishVersion = publishResult.version;
        ownPublishedVersions.add(publishResult.version);
        if (ownPublishedVersions.size > FILE_SAVE_MAX_BATCH_CONFLICTS) {
          ownPublishedVersions.delete(
            ownPublishedVersions.values().next().value!,
          );
        }
      }
      counters.publishes += 1;
      counters.pathsSent += Object.keys(batch).length;
      counters.lastPublishMs = timers.now() - publishStartedAt;
      let publishedShas =
        publishResult.shas ?? (await hashFilePublishEntries(batch));
      for (let [filePath, fileContent] of Object.entries(batch)) {
        let publishedSha = fileContent === null ? null : (publishedShas[filePath] ?? null);
        counters.bytesSent += filePublishRawBytes(fileContent);
        ownPublishedShas.set(filePath, publishedSha);
        remoteShas.set(filePath, publishedSha);
        if (
          !(
            publishResult.shas?.[filePath] !== undefined &&
            publishResult.computed?.includes(filePath) !== true
          ) &&
          publishedSha !== null &&
          fileContentContainsRuntimeMarkers(fileContent)
        ) {
          awaitingComputedShas.add(filePath);
        } else {
          awaitingComputedShas.delete(filePath);
        }
        if (publishedSha !== null && publishResult.unchanged !== true) {
          queueOptions.tokens?.advance?.(filePath, publishedSha);
        }
        let entry = dirtyEntries.get(filePath);
        if (entry !== undefined && entry.gen === entries.get(filePath)) {
          dirtyEntries.delete(filePath);
          conflictSurfacedAt.delete(filePath);
        } else if (entry !== undefined) {
          entry.base = publishedSha;
        }
        if (indexStore && filePath === indexPath && publishedSha !== null) {
          indexStore.markSaved(fileInputDebugText(fileContent), publishedSha);
        }
      }
    }
    if (publishFailure === undefined) {
      let hasConflicts = [...conflictBudgetExceeded].some((filePath) =>
        dirtyEntries.has(filePath),
      );
      finishPublish(!hasConflicts, !hasConflicts);
      let hasDirtyFiles = [...dirtyEntries.keys()].some(
        (filePath): boolean => !conflictBudgetExceeded.has(filePath),
      );
      if (hasConflicts) {
        markStuck(
          "conflict",
          false,
          hasDirtyFiles ? 0 : FILE_SAVE_RECENT_PEER_WINDOW_MS,
          undefined,
          hasDirtyFiles ? currentRetryBudget() : 0,
        );
      }
      return;
    }
    await handlePublishFailure(publishFailure, value);
  }
  function finishPublish(
    shouldFinish: boolean = true,
    forceFinish: boolean = true,
  ): void {
    conflictRetryUsed = false;
    retryOnRemoteChange = false;
    lastError = undefined;
    backoffUntil = undefined;
    rateLimitBackoff = FILE_SAVE_BACKPRESSURE_DELAY_MS;
    retryWindow = undefined;
    refusalHistory = undefined;
    retryBudgetMs = currentRetryBudget();
    stuckState = undefined;
    stuckRetryBackoff = queueOptions.stuckRetryMs ?? FILE_SAVE_CONFLICT_RETRY_MS;
    rateLimitUntil = 0;
    serverRateLimit = false;
    if (retryTimer !== undefined) {
      timers.clearTimeout(retryTimer);
      retryTimer = undefined;
    }
    clearSavedStash();
    firstDirtyAt = dirtyEntries.size === 0 ? undefined : timers.now();
    scheduleMaxWaitCommit();
    inFlight = false;
    if (forceFinish) {
      notifyState();
    }
    if (shouldFinish) {
      tryStartCommit();
    }
  }
  async function handlePublishFailure(
    failure: Files.FilePublishFailure,
    remoteGeneration: number,
  ): Promise<void> {
    lastError = failure.code;
    if (failure.code === "conflict") {
      counters.conflicts += 1;
      if (failure.changed) {
        for (let change of failure.changed) {
          remoteShas.set(change.path, change.sha256);
          awaitingComputedShas.delete(change.path);
        }
      }
      if (failure.paths) {
        for (let path of failure.paths) {
          remoteShas.set(path.path, path.liveSha);
          awaitingComputedShas.delete(path.path);
        }
      }
      let value = beginRetryAttempt();
      if (
        indexStore &&
        indexPath !== undefined &&
        dirtyEntries.has(indexPath)
      ) {
        indexNeedsMerge = true;
      }
      notifyState();
      for (;;) {
        let shouldRetry =
          remoteChangeGeneration !== remoteGeneration ||
          (failure.live !== undefined && port.version().version === failure.live)
            ? true
            : await waitForRemoteVersion();
        for (
          let index: number = 0;
          shouldRetry &&
          awaitingComputedShas.size > 0 &&
          !isPublishVersionCurrent() &&
          index < FILE_SAVE_MAX_CONFLICT_RETRIES &&
          !disposed;
          index++
        ) {
          await waitForRemoteVersion();
        }
        let hasFreshShas = await refreshLiveFileShas();
        if (disposed) {
          inFlight = false;
          notifyState();
          return;
        }
        if (shouldRetry && !hasFreshShas && remoteChangeGeneration === remoteGeneration) {
          if (timers.now() - value.since >= value.budgetMs) {
            return markStuck("conflict", false);
          }
          let backoffMs: number = Math.min(
            jitterDelay(FILE_SAVE_QUICK_RETRY_MS * 2),
            Math.max(1, value.budgetMs - (timers.now() - value.since)),
          );
          backoffUntil = timers.now() + backoffMs;
          notifyState();
          await waitForRetryOrWake(backoffMs);
          backoffUntil = undefined;
          continue;
        }
        detectChangedFileBases();
        if (
          indexStore &&
          indexPath !== undefined &&
          dirtyEntries.has(indexPath)
        ) {
          let indexMergeResult = await mergeRemoteIndex();
          if (indexMergeResult !== "merged" && indexMergeResult !== "unread") {
            return markStuck(indexMergeResult, false, undefined, indexPath);
          }
        }
        if (dirtyEntries.size === 0) {
          finishPublish();
          return;
        }
        if (!shouldRetry) {
          if (conflictRetryUsed) {
            return markStuck("conflict", true);
          }
          conflictRetryUsed = true;
        }
        return retryFailure("conflict", shouldRetry);
      }
    }
    if (failure.code === "rate_limited") {
      counters.rateLimited += 1;
      let value = beginRetryAttempt(),
        serverRetryMs: number | undefined =
          failure.retryAfterMs !== undefined &&
          Number.isFinite(failure.retryAfterMs) &&
          failure.retryAfterMs >= 0
            ? Math.min(
                Math.max(failure.retryAfterMs, FILE_SAVE_RETRY_JITTER_MS),
                FILE_SAVE_RECENT_ACTIVITY_WINDOW_MS,
              )
            : undefined,
        retryDelay = serverRetryMs ?? rateLimitBackoff;
      rateLimitBackoff = Math.min(
        FILE_SAVE_STUCK_TIMEOUT_MS,
        rateLimitBackoff * 2,
      );
      rateLimitUntil = timers.now() + retryDelay;
      serverRateLimit = serverRetryMs !== undefined;
      backoffUntil = rateLimitUntil;
      notifyState();
      let remainingBudget = value.budgetMs - (timers.now() - value.since),
        waited = await waitForRetryOrWake(
          Math.max(0, Math.min(retryDelay, remainingBudget)),
          serverRateLimit,
        );
      if (disposed) {
        inFlight = false;
        notifyState();
        return;
      }
      if (
        !waited &&
        (timers.now() < rateLimitUntil ||
          timers.now() - value.since >= value.budgetMs)
      ) {
        return markStuck(
          "rate_limited",
          false,
          Math.max(rateLimitUntil - timers.now(), FILE_SAVE_RETRY_JITTER_MS),
        );
      }
      rateLimitUntil = 0;
      backoffUntil = undefined;
      counters.retries += 1;
      lastError = undefined;
      return publishDirtyEntries();
    }
    if (failure.code === "upstream_error") {
      beginRetryAttempt();
      notifyState();
      return retryFailure("upstream_error", true);
    }
    beginRetryAttempt();
    markStuck(failure.code, false);
  }
  async function retryFailure(
    failureCode: string,
    allowStuck: boolean,
  ): Promise<void> {
    let value: FileSaveRetryWindow = retryWindow!,
      elapsedMs = timers.now() - value.since;
    if (elapsedMs >= value.budgetMs) {
      return markStuck(failureCode, !allowStuck);
    }
    let refusals = value.refusals,
      retryDelay: number;
    if (refusals <= 1) {
      retryDelay =
        failureCode === "upstream_error"
          ? FILE_SAVE_CONFLICT_BACKOFF_MS[0] +
            Math.floor(
              random() *
                (FILE_SAVE_CONFLICT_BACKOFF_MS[1] -
                  FILE_SAVE_CONFLICT_BACKOFF_MS[0]),
            )
          : 0;
    } else {
      retryDelay = jitterDelay(
        Math.min(
          FILE_SAVE_LONG_REQUEST_MS,
          FILE_SAVE_QUICK_RETRY_MS * 2 ** (refusals - 2),
        ),
      );
    }
    retryDelay = Math.min(retryDelay, value.budgetMs - elapsedMs);
    counters.retries += 1;
    if (retryDelay > 0) {
      backoffUntil = timers.now() + retryDelay;
      notifyState();
      await waitForRetryOrWake(retryDelay);
      backoffUntil = undefined;
    }
    if (disposed) {
      inFlight = false;
      notifyState();
      return;
    }
    lastError = undefined;
    return publishDirtyEntries();
  }
  function markStuck(
    filePath: string,
    allowRemoteRetry: boolean,
    retryAfterMs?: number,
    detailMessage?: string,
    additionalDelay: number = 0,
  ): void {
    let now = timers.now();
    lastError = filePath;
    let retryBudget =
      filePath === "conflict" &&
      (refusalHistory?.attempts ?? 0) >= FILE_SAVE_MAX_CONFLICT_PATHS;
    retryOnRemoteChange = allowRemoteRetry || retryBudget;
    backoffUntil = undefined;
    commitRequested = false;
    inFlight = false;
    retryWindow = undefined;
    let retryable: boolean = !FILE_SAVE_TERMINAL_ERROR_CODES.has(filePath),
      nextRetryAt: number | undefined,
      stuckRetryMs = queueOptions.stuckRetryMs ?? FILE_SAVE_CONFLICT_RETRY_MS;
    if (
      retryable &&
      !allowRemoteRetry &&
      !retryBudget &&
      (stuckRetryMs > 0 || retryAfterMs !== undefined)
    ) {
      let backoffMs = retryAfterMs ?? jitterDelay(stuckRetryBackoff);
      if (retryAfterMs === undefined) {
        stuckRetryBackoff = Math.min(
          FILE_SAVE_STUCK_TIMEOUT_MS,
          stuckRetryBackoff * 2,
        );
      }
      nextRetryAt = now + backoffMs;
      if (retryTimer !== undefined) {
        timers.clearTimeout(retryTimer);
      }
      retryTimer = timers.setTimeout((): void => {
        retryTimer = undefined;
        restartRetryWindow(additionalDelay);
      }, backoffMs);
    }
    stuckState = {
      code: filePath,
      since: refusalHistory?.since ?? now,
      attempts: refusalHistory?.attempts ?? 1,
      paths: [...dirtyEntries.keys()],
      retryable: retryable,
      stashed: stuckState?.stashed ?? false,
      ...(nextRetryAt !== undefined
        ? {
            nextRetryAt: nextRetryAt,
          }
        : {}),
      ...(detailMessage !== undefined
        ? {
            file: detailMessage,
          }
        : {}),
    };
    stashWritePaused = false;
    writePendingStash();
    notifyState();
  }
  let stashGeneration: number = 0,
    stashWriteChain: Promise<unknown> = Promise.resolve();
  function serializeStashWrite<Result>(
    write: () => Promise<Result>,
  ): Promise<Result> {
    let value = stashWriteChain.then(write);
    stashWriteChain = value.catch((): void => {
      return;
    });
    return value;
  }
  let stashWriteInFlight: boolean = false,
    stashWriteOwed: boolean = false;
  function writePendingStash(): void {
    if (queueOptions.stash === undefined || stashWritePaused) {
      return;
    }
    if (stashWriteInFlight) {
      stashWriteOwed = true;
      return;
    }
    let items: Files.StashedFileEdit[] = [],
      flag: boolean = true,
      value: [
        string,
        () => Files.FilePublishInput,
        string | null | undefined,
      ][] = [...dirtyEntries].map(
        ([filePath, entry]: [string, DirtyFileEntry]) => [
          filePath,
          entry.value,
          entry.base,
        ],
      );
    for (let [filePath, conflictEntry] of conflictedEntries) {
      if (dirtyEntries.has(filePath)) {
        continue;
      }
      if (conflictEntry.unreadable === true) {
        flag = false;
        continue;
      }
      value.push([filePath, () => conflictEntry.mine, conflictEntry.base]);
    }
    for (let [filePath, unsendableEntry] of unsendableEntries) {
      if (!dirtyEntries.has(filePath) && !conflictedEntries.has(filePath)) {
        value.push([filePath, unsendableEntry.value, unsendableEntry.base]);
      }
    }
    if (value.length === 0) {
      return;
    }
    for (let [filePath, valueFactory, baseText] of value) {
      let fileContent: Files.FilePublishInput;
      try {
        fileContent = valueFactory();
      } catch {
        flag = false;
        continue;
      }
      let normalizedContent =
        fileContent === null
          ? null
          : typeof fileContent === "object" &&
              !(typeof Blob !== "undefined" && fileContent instanceof Blob)
            ? (
                fileContent as import("../contracts/files-core").NormalizedFilePublishInput
              ).content
            : fileContent;
      if (normalizedContent !== null && typeof normalizedContent !== "string") {
        flag = false;
        continue;
      }
      items.push({
        path: filePath,
        text: normalizedContent,
        base: baseText as string | null,
      });
    }
    hasStashedEntries = true;
    stashWriteInFlight = true;
    let generation = ++stashGeneration,
      stash = queueOptions.stash,
      version = port.version().version;
    serializeStashWrite(() => stash.put(items, version))
      .finally((): void => {
        stashWriteInFlight = false;
        if (stashWriteOwed) {
          stashWriteOwed = false;
          writePendingStash();
        }
      })
      .then((saved): void => {
        if (
          generation !== stashGeneration ||
          disposed ||
          (stuckState === undefined && unsendableEntries.size === 0)
        ) {
          return;
        }
        if (stuckState !== undefined) {
          stuckState = {
            ...stuckState,
            stashed: saved && flag,
          };
        }
        unsendableStashed = unsendableEntries.size > 0 && saved && flag;
        notifyState();
      });
  }
  function clearSavedStash(): void {
    if (!hasStashedEntries) {
      return;
    }
    if (
      dirtyEntries.size > 0 ||
      conflictedEntries.size > 0 ||
      unsendableEntries.size > 0
    ) {
      scheduleStashWrite(0);
      return;
    }
    hasStashedEntries = false;
    let stash = queueOptions.stash,
      value: boolean = clearOfferedStashOnSave;
    clearOfferedStashOnSave = false;
    if (stash !== undefined) {
      serializeStashWrite(async (): Promise<void> => {
        await stash.clear();
        if (value) {
          await stash.clearOffered();
        }
      });
    }
  }
  let stashWritePaused: boolean = false,
    stashResumeTimer: ReturnType<typeof setTimeout> | undefined,
    stashWriteTimer: ReturnType<typeof setTimeout> | undefined;
  function scheduleStashWrite(delayMs: number = 1000): void {
    if (queueOptions.stash === undefined || disposed) {
      return;
    }
    if (stashWriteTimer !== undefined) {
      if (delayMs > 0) {
        return;
      }
      timers.clearTimeout(stashWriteTimer);
    }
    stashWriteTimer = timers.setTimeout((): void => {
      stashWriteTimer = undefined;
      if (
        !disposed &&
        (dirtyEntries.size > 0 ||
          conflictedEntries.size > 0 ||
          unsendableEntries.size > 0)
      ) {
        writePendingStash();
      }
    }, delayMs);
  }
  function clearStuckIfClean(): void {
    if (dirtyEntries.size > 0 || stuckState === undefined || inFlight) {
      return;
    }
    finishPublish();
  }
  function waitForRemoteVersion() {
    return new Promise<boolean>((resolve): void => {
      let flag: boolean = false,
        callback = (result: boolean): void => {
          if (flag) {
            return;
          }
          flag = true;
          value();
          timers.clearTimeout(timerHandle);
          resolve(result);
        },
        value = port.onRemoteChange(() => callback(true)),
        timerHandle = timers.setTimeout(
          () => callback(false),
          FILE_SAVE_RETRY_MIN_MS,
        );
    });
  }
  async function refreshLiveFileShas(): Promise<boolean | undefined> {
    try {
      let value = await retryFileRead(
        () => listWritableFiles(port),
        timers,
        undefined,
        FILE_SAVE_READ_RETRY_DELAYS_MS,
      );
      if (fileListingIsNarrowed(value, port)) {
        return false;
      }
      let entries = new Map(value.map((fileEntry) => [fileEntry.path, fileEntry.sha256]));
      for (let filePath of dirtyEntries.keys()) {
        remoteShas.set(filePath, entries.get(filePath) ?? null);
      }
      if (indexPath !== undefined) {
        remoteShas.set(indexPath, entries.get(indexPath) ?? null);
      }
      return true;
    } catch {
      return false;
    }
  }
  async function mergeRemoteIndex(): Promise<
    "merged" | "unread" | "index_newer_build" | "index_damaged"
  > {
    if (!indexStore) {
      return "merged";
    }
    try {
      let value = await retryFileRead(
        () => indexStore.reloadAndMerge(),
        timers,
        undefined,
        FILE_SAVE_READ_RETRY_DELAYS_MS,
      );
      indexNeedsMerge = false;
      if (value.length > 0) {
        try {
          queueOptions.onIndexMerged?.(value);
        } catch {}
      }
      let entry = dirtyEntries.get(indexStore.path);
      if (entry !== undefined) {
        entry.base = indexStore.baseSha();
      }
      return "merged";
    } catch (value: unknown) {
      if (
        value instanceof IndexFileError &&
        value.code !== "not_found"
      ) {
        lastStuckRetryAt = timers.now();
        if (value.code === "newer_version") {
          return "index_newer_build";
        } else {
          return "index_damaged";
        }
      }
      if (
        (value as FileRetryError | null)?.status === 404 &&
        liveSha(indexStore.path) === null
      ) {
        indexNeedsMerge = false;
        let entry = dirtyEntries.get(indexStore.path);
        if (entry !== undefined) {
          entry.base = null;
        }
        return "merged";
      }
      return "unread";
    }
  }
  function flushNow(): void {
    if (dirtyEntries.size === 0) {
      return;
    }
    if (stuckState !== undefined) {
      restartRetryWindow(currentRetryBudget());
      return;
    }
    ignorePacingOnce = true;
    commitRequested = true;
    if (commitTimer !== undefined) {
      timers.clearTimeout(commitTimer);
      commitTimer = undefined;
    }
    tryStartCommit();
  }
  function settle() {
    if (dirtyEntries.size > 0 && !inFlight && !hasTerminalError()) {
      flushNow();
    }
    if (
      !inFlight &&
      commitTimer === undefined &&
      (dirtyEntries.size === 0 || hasTerminalError())
    ) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => settleWaiters.push(resolve));
  }
  return {
    markDirty: markDirty,
    commit: commit,
    settle: settle,
    async dispose(): Promise<void> {
      flushNow();
      await settle();
      disposed = true;
      unsubscribeRemoteChange();
      unsubscribePeers?.();
      if (maxWaitTimer !== undefined) {
        timers.clearTimeout(maxWaitTimer);
        maxWaitTimer = undefined;
      }
      if (commitTimer !== undefined) {
        timers.clearTimeout(commitTimer);
        commitTimer = undefined;
      }
      if (retryTimer !== undefined) {
        timers.clearTimeout(retryTimer);
        retryTimer = undefined;
      }
      if (stashResumeTimer !== undefined) {
        timers.clearTimeout(stashResumeTimer);
        stashResumeTimer = undefined;
      }
      if (stashWriteTimer !== undefined) {
        timers.clearTimeout(stashWriteTimer);
        stashWriteTimer = undefined;
        writePendingStash();
      }
      wakeRetryWait?.();
    },
    counters: counters,
    state: getQueueState,
    conflicted: () => conflictedEntries,
    unsendable: () => unsendableReasons,
    resolveConflict(filePath, choice): void {
      let entry = conflictedEntries.get(filePath);
      if (entry === undefined) {
        return;
      }
      if (choice === "mine" && entry.unreadable === true) {
        return;
      }
      conflictedEntries.delete(filePath);
      if (choice === "mine") {
        markDirty(filePath, () => entry.mine, entry.theirsSha);
      } else {
        clearSavedStash();
      }
    },
    pending: () =>
      dirtyEntries.size > 0 ||
      inFlight ||
      conflictedEntries.size > 0 ||
      unsendableReasons.size > 0,
    isOwnEcho: isOwnPublishEcho,
    solo: isSoloPacing,
    withdraw(filePath): void {
      let value = dirtyEntries.delete(filePath),
        removedConflict = conflictedEntries.delete(filePath),
        removedUnsendable = unsendableReasons.delete(filePath);
      unsendableEntries.delete(filePath);
      if (value || removedConflict) {
        withdrawnPaths.add(filePath);
      }
      if (dirtyEntries.size === 0) {
        firstDirtyAt = undefined;
        scheduleMaxWaitCommit();
      }
      if (value || removedConflict || removedUnsendable) {
        notifyState();
      }
      clearStuckIfClean();
      clearSavedStash();
    },
    withdrawn: () => withdrawnPaths,
    retryNow(): void {
      if (disposed || dirtyEntries.size === 0) {
        return;
      }
      recentConflictTimes.clear();
      if (wakeRetryWait !== undefined) {
        if (!retryWaitProtected) {
          wakeRetryWait();
        }
        return;
      }
      if (inFlight) {
        return;
      }
      restartRetryWindow(currentRetryBudget(), true);
    },
    flushNow: flushNow,
    stashRestored(): void {
      if (queueOptions.stash !== undefined) {
        hasStashedEntries = true;
        clearOfferedStashOnSave = true;
      }
    },
    stashHandedOff(): void {
      if (queueOptions.stash === undefined) {
        return;
      }
      stashWritePaused = true;
      if (stashWriteTimer !== undefined) {
        timers.clearTimeout(stashWriteTimer);
        stashWriteTimer = undefined;
      }
      if (stashResumeTimer !== undefined) {
        timers.clearTimeout(stashResumeTimer);
      }
      stashResumeTimer = timers.setTimeout((): void => {
        stashResumeTimer = undefined;
        if (!stashWritePaused || disposed) {
          return;
        }
        stashWritePaused = false;
        if (
          dirtyEntries.size > 0 ||
          conflictedEntries.size > 0 ||
          unsendableEntries.size > 0
        ) {
          writePendingStash();
        }
      }, FILE_SAVE_RETRY_MAX_MS);
      if (!hasStashedEntries) {
        return;
      }
      hasStashedEntries = false;
      let stash = queueOptions.stash,
        value: boolean = clearOfferedStashOnSave;
      clearOfferedStashOnSave = false;
      serializeStashWrite(async (): Promise<void> => {
        await stash.clear();
        if (value) {
          await stash.clearOffered();
        }
      });
    },
  };
}
function fileInputDebugText(fileContent: Files.FilePublishInput) {
  if (fileContent === null) {
    return "";
  }
  let value =
    typeof fileContent === "object" &&
    !(typeof Blob !== "undefined" && fileContent instanceof Blob)
      ? (
          fileContent as import("../contracts/files-core").NormalizedFilePublishInput
        ).content
      : fileContent;
  if (typeof value === "string") {
    return value;
  } else {
    return "";
  }
}
function installFilesSaveLifecycle(
  queue: SaveLifecycleQueue,
  host: SaveLifecycleHost = globalThis,
) {
  if (typeof host?.addEventListener !== "function") {
    return (): void => {
      return;
    };
  }
  let flush = () => (queue.flushNow ? queue.flushNow() : queue.commit()),
    onVisibility = (): void => {
      if (host.document?.visibilityState === "hidden") {
        flush();
      }
    },
    onBeforeUnload = (event: BeforeUnloadEvent): void => {
      if (queue.pending?.() !== true) {
        return;
      }
      flush();
      event.preventDefault();
      event.returnValue = "";
    },
    visibilityTarget =
      typeof host.document?.addEventListener === "function"
        ? host.document
        : host;
  host.addEventListener("pagehide", flush);
  visibilityTarget.addEventListener("visibilitychange", onVisibility);
  host.addEventListener("beforeunload", onBeforeUnload);
  return (): void => {
    host.removeEventListener("pagehide", flush);
    visibilityTarget.removeEventListener("visibilitychange", onVisibility);
    host.removeEventListener("beforeunload", onBeforeUnload);
  };
}
export {
  createFilesSaveQueue,
  defaultFilesSaveTimers,
  FILE_SAVE_BACKPRESSURE_DELAY_MS,
  FILE_SAVE_CONFLICT_BACKOFF_MS,
  FILE_SAVE_CONFLICT_RETRY_MS,
  FILE_SAVE_DEBOUNCE_POLICY,
  FILE_SAVE_LONG_REQUEST_MS,
  FILE_SAVE_MAX_BATCH_CONFLICTS,
  FILE_SAVE_MAX_CONFLICT_PATHS,
  FILE_SAVE_MAX_CONFLICT_RETRIES,
  FILE_SAVE_MAX_TRANSIENT_RETRIES,
  FILE_SAVE_QUICK_RETRY_MS,
  FILE_SAVE_READ_RETRY_DELAYS_MS,
  FILE_SAVE_RECENT_ACTIVITY_WINDOW_MS,
  FILE_SAVE_RECENT_PEER_WINDOW_MS,
  FILE_SAVE_RETRY_JITTER_MS,
  FILE_SAVE_RETRY_MAX_MS,
  FILE_SAVE_RETRY_MIN_MS,
  FILE_SAVE_SHARED_ACTIVITY_TIMEOUT_MS,
  FILE_SAVE_STUCK_TIMEOUT_MS,
  FILE_SAVE_TERMINAL_ERROR_CODES,
  FILE_SAVE_TOTAL_RETRY_WINDOW_MS,
  fileInputDebugText,
  installFilesSaveLifecycle,
  isIndexFileSaveError,
};
export function installFilesSaveQueue(): () => void {
  return () => {
    FILE_SAVE_DEBOUNCE_POLICY = {
      solo: {
        gapMs: 1e4,
        maxWaitMs: 1e4,
      },
      shared: {
        gapMs: 0,
        maxWaitMs: 1500,
      },
      recentMs: 300000,
    };
    FILE_SAVE_RETRY_MIN_MS = 5000;
    FILE_SAVE_RETRY_MAX_MS = 15000;
    FILE_SAVE_BACKPRESSURE_DELAY_MS = 2000;
    FILE_SAVE_STUCK_TIMEOUT_MS = 30000;
    FILE_SAVE_SHARED_ACTIVITY_TIMEOUT_MS = 1e4;
    FILE_SAVE_QUICK_RETRY_MS = 200;
    FILE_SAVE_LONG_REQUEST_MS = 3000;
    FILE_SAVE_CONFLICT_RETRY_MS = 2000;
    FILE_SAVE_MAX_TRANSIENT_RETRIES = 3;
    FILE_SAVE_TOTAL_RETRY_WINDOW_MS = 60000;
    FILE_SAVE_RECENT_PEER_WINDOW_MS = 20000;
    FILE_SAVE_MAX_CONFLICT_PATHS = 20;
    FILE_SAVE_RECENT_ACTIVITY_WINDOW_MS = 300000;
    FILE_SAVE_MAX_CONFLICT_RETRIES = 4;
    FILE_SAVE_MAX_BATCH_CONFLICTS = 64;
    FILE_SAVE_RETRY_JITTER_MS = 1000;
    FILE_SAVE_CONFLICT_BACKOFF_MS = [300, 800];
    FILE_SAVE_READ_RETRY_DELAYS_MS = [150, 300, 600, 1000, 2000];
    FILE_SAVE_TERMINAL_ERROR_CODES = new Set([
      "not_writer",
      "not_declared",
      "capability_disabled",
      "too_large",
      "invalid_content",
      "read_only_path",
      "index_newer_build",
      "index_damaged",
    ]);
    isIndexFileSaveError = (errorCode: string | undefined) =>
      errorCode === "index_newer_build" || errorCode === "index_damaged";
  };
}
