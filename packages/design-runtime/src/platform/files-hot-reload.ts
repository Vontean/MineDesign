import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { listWritableFiles, retryAccessFailure } from "./access-retry";
import { getCachedHostCapability } from "./host-capabilities";
import { getHotReloadController } from "./hot-reload";
import { isApplicationCodeFile } from "./project-paths";

var DEFAULT_FILE_READ_RETRY_DELAYS_MS: Dynamic;
var MAX_FILE_READ_ATTEMPTS: Dynamic;
var readWindowName: Dynamic;
var RESTART_RATE_WINDOW_MS: Dynamic;
var MAX_RESTARTS_PER_WINDOW: Dynamic;
var MAX_RETAINED_HOT_EVENTS: Dynamic;
var changedFileSha: Dynamic;
var summarizeError: Dynamic;
var readUpdateVersion: Dynamic;
var describeChangedFiles: Dynamic;
var describeUpdateMethods: Dynamic;
var HOT_RESTART_READY_TIMEOUT_MS: Dynamic;
function getHotCapability(): Dynamic {
  let hotCapability: Dynamic = getCachedHostCapability("hot");
  return (typeof hotCapability == "object" || typeof hotCapability == "function") &&
    hotCapability !== null
    ? hotCapability
    : null;
}
function hasHotRestartToken(
  windowName: Dynamic = readWindowName(),
): Dynamic {
  try {
    let restartToken: Dynamic = JSON.parse(windowName)?.hot?.k;
    return typeof restartToken == "string" && restartToken !== "";
  } catch {
    return false;
  }
}
function canHotRestart(
  hotCapability: Dynamic = getHotCapability(),
  windowName?: Dynamic,
): Dynamic {
  return typeof hotCapability?.restart == "function" && hasHotRestartToken(windowName);
}
function awaitHotRestartReady(
  ready?: Dynamic,
  holdOptions: Dynamic = {},
): Dynamic {
  let timers: Dynamic = holdOptions.timers ?? {
      setTimeout: (run?: Dynamic, delayMs?: Dynamic): Dynamic =>
        setTimeout(run, delayMs),
      clearTimeout: (timer?: Dynamic): Dynamic => clearTimeout(timer),
    },
    now: Dynamic = (): Dynamic => timers.now?.() ?? Date.now(),
    holdStartedAt: Dynamic = now();
  return new Promise((resolve?: Dynamic): Dynamic => {
    let finished: Dynamic = false,
      finish: Dynamic = (timedOut?: Dynamic): Dynamic => {
        if (!finished) {
          finished = true;
          timedOut || timers.clearTimeout?.(holdTimer);
          try {
            holdOptions.onEvent?.({
              type: "reveal",
              heldMs: now() - holdStartedAt,
              timedOut: timedOut,
              carried: holdOptions.carried === true,
            });
          } catch {}
          resolve();
        }
      },
      holdTimer: Dynamic = timers.setTimeout(
        (): Dynamic => finish(true),
        holdOptions.holdMs ?? HOT_RESTART_READY_TIMEOUT_MS,
      );
    Promise.resolve(ready).then(
      (): Dynamic => finish(false),
      (): Dynamic => finish(false),
    );
  });
}
function createFilesHotReloadController(controllerOptions?: Dynamic): Dynamic {
  let hotCapability: Dynamic =
      controllerOptions.hot !== undefined ? controllerOptions.hot : getHotCapability(),
    stats: Dynamic = {
      updates: 0,
      applied: 0,
      deferred: 0,
      restarts: 0,
      fetchRetries: 0,
    },
    recentEvents: Dynamic = [];
  if (
    controllerOptions.embedded === true ||
    hotCapability === null ||
    typeof hotCapability.accept != "function"
  )
    return {
      dispose: (): Dynamic => {},
      active: false,
      stats: (): Dynamic => ({
        ...stats,
      }),
      events: recentEvents,
    };
  let { port: filePort }: Dynamic = controllerOptions,
    listingPort: Dynamic = filePort,
    isCodePath: Dynamic = controllerOptions.isCode ?? isApplicationCodeFile,
    retryDelaysMs: Dynamic = controllerOptions.retryMs ?? DEFAULT_FILE_READ_RETRY_DELAYS_MS,
    timers: Dynamic = controllerOptions.timers ?? {
      setTimeout: (run?: Dynamic, delayMs?: Dynamic): Dynamic =>
        setTimeout(run, delayMs),
      clearTimeout: (timer?: Dynamic): Dynamic => clearTimeout(timer),
      now: (): Dynamic => Date.now(),
    },
    now: Dynamic = (): Dynamic => timers.now?.() ?? Date.now(),
    disposed: Dynamic = false,
    restartTimer: Dynamic,
    queuedRestartReason: Dynamic,
    restartTimes: Dynamic = [],
    cachedListing: Dynamic;
  listingPort.knownListing === undefined &&
    filePort.list().then(
      (listedFiles?: Dynamic): Dynamic => {
        cachedListing ??= new Map(
          listedFiles.map(
            (file?: Dynamic): Dynamic => [file.path, file.sha256],
          ),
        );
      },
      (): Dynamic => {},
    );
  function recordEvent(event?: Dynamic): Dynamic {
    recentEvents.push(event);
    recentEvents.length > MAX_RETAINED_HOT_EVENTS && recentEvents.shift();
    try {
      controllerOptions.onEvent
        ? controllerOptions.onEvent(event)
        : (globalThis as Dynamic).console?.debug?.(
            "[hot]",
            JSON.stringify(event),
          );
    } catch {}
  }
  let notifyBeforeRestart: Dynamic = (reason?: Dynamic): Dynamic => {
    try {
      controllerOptions.onBeforeRestart?.(reason);
    } catch {}
  };
  function scheduleRestart(restartReason?: Dynamic, delayMs: Dynamic = 0): Dynamic {
    queuedRestartReason ??= restartReason;
    if (restartTimer !== undefined || disposed) return;
    let restartWhenIdle: Dynamic = (): Dynamic => {
      restartTimer = undefined;
      if (disposed || queuedRestartReason === undefined) return;
      if (controllerOptions.isBusy?.() === true) {
        restartTimer = timers.setTimeout(restartWhenIdle, controllerOptions.busyPollMs ?? 250);
        return;
      }
      let currentTime: Dynamic = now();
      for (
        ;
        restartTimes.length > 0 &&
        currentTime - restartTimes[0] > RESTART_RATE_WINDOW_MS;

      )
        restartTimes.shift();
      if (restartTimes.length >= MAX_RESTARTS_PER_WINDOW) {
        restartTimer = timers.setTimeout(
          restartWhenIdle,
          RESTART_RATE_WINDOW_MS - (currentTime - restartTimes[0]) + 1,
        );
        return;
      }
      restartTimes.push(currentTime);
      let reason: Dynamic = queuedRestartReason;
      queuedRestartReason = undefined;
      stats.restarts += 1;
      notifyBeforeRestart(reason);
      try {
        hotCapability.restart?.({
          note: reason,
        });
      } catch {}
    };
    restartTimer = timers.setTimeout(restartWhenIdle, delayMs);
  }
  async function diffFileListing(): Promise<Dynamic> {
    let previousListing: Dynamic = new Map(listingPort.knownListing?.() ?? cachedListing ?? []),
      latestListing: Dynamic = new Map(
        (await listWritableFiles(filePort)).map(
          (file?: Dynamic): Dynamic => [file.path, file.sha256],
        ),
      );
    cachedListing = latestListing;
    let changes: Dynamic = [];
    for (let [filePath, sha] of latestListing as Dynamic)
      previousListing.get(filePath) !== sha &&
        changes.push({
          path: filePath,
          sha256: sha,
        });
    for (let filePath of previousListing.keys() as Dynamic)
      latestListing.has(filePath) ||
        changes.push({
          path: filePath,
          sha256: null,
        });
    return changes.sort(
      (left?: Dynamic, right?: Dynamic): Dynamic =>
        left.path < right.path ? -1 : 1,
    );
  }
  function handleHotUpdate(update?: Dynamic): Dynamic {
    if (disposed) return void update.restart?.();
    stats.updates += 1;
    let previousVersion: Dynamic = readUpdateVersion(update.from),
      nextVersion: Dynamic = readUpdateVersion(update.to),
      isBusy: Dynamic = controllerOptions.isBusy?.() === true,
      restartCause: Dynamic =
        update.required !== "none"
          ? "required"
          : update.changed !== null &&
              update.changed.some(
                (change?: Dynamic): Dynamic => isCodePath(change.path),
              )
            ? "code"
            : undefined,
      updateEvent: Dynamic = {
        type: "update",
        from: previousVersion.version,
        to: nextVersion.version,
        ...(previousVersion.seq !== undefined
          ? {
              fromSeq: previousVersion.seq,
            }
          : {}),
        ...(nextVersion.seq !== undefined
          ? {
              toSeq: nextVersion.seq,
            }
          : {}),
        required: String(update.required),
        shape: describeUpdateMethods(update),
        changed: describeChangedFiles(update.changed, isCodePath),
        busy: isBusy,
      };
    if (restartCause !== undefined) {
      let restartExplanation: Dynamic =
          restartCause === "code"
            ? "a changed path is the page\u2019s own code: " +
              (update.changed ?? [])
                .filter((change?: Dynamic): Dynamic => isCodePath(change.path))
                .map((change?: Dynamic): Dynamic => change.path)
                .join(", ")
            : "required is " + String(update.required),
        contentChanges: Dynamic =
          restartCause === "code" && update.changed !== null
            ? update.changed.filter(
                (change?: Dynamic): Dynamic => !isCodePath(change.path),
              )
            : [];
      if (
        isBusy &&
        controllerOptions.contentWhileBusy !== false &&
        contentChanges.length > 0 &&
        typeof update.adopt == "function"
      ) {
        try {
          update.adopt();
        } catch (adoptError: Dynamic) {
          recordEvent({
            ...updateEvent,
            decision: "restart",
            get why() { return ("u.adopt() threw: ") + (summarizeError(adoptError)); },
          });
          notifyBeforeRestart("adopt failed");
          return void update.restart?.();
        }
        recordEvent({
          ...updateEvent,
          decision: "adopt",
          get why() { return (((restartExplanation) + ("; the person is busy, so the ")) + (String(contentChanges.length))) + (" content row(s) are applied in place now and the restart waits"); },
        });
        recordEvent({
          type: "deferred",
          from: previousVersion.version,
          to: nextVersion.version,
          reason: "code",
        });
        stats.deferred += 1;
        let contentAdoptedAt: Dynamic = now();
        try {
          listingPort.noteAdopted?.(nextVersion, previousVersion);
        } catch {}
        scheduleRestart("deferred-update", controllerOptions.busyPollMs ?? 250);
        return applyHotUpdate(contentChanges, previousVersion, nextVersion, contentAdoptedAt, false).catch(
          (applyError?: Dynamic): Dynamic => (
            recordEvent({
              type: "restart",
              from: previousVersion.version,
              to: nextVersion.version,
              reason: "apply-failed",
              asked: true,
              error: summarizeError(applyError),
            }),
            scheduleRestart("apply-failed"),
            "applied"
          ),
        );
      }
      return isBusy && typeof update.defer == "function"
        ? (update.defer(),
          (stats.deferred += 1),
          recordEvent({
            ...updateEvent,
            decision: "defer",
            get why() { return (restartExplanation) + ("; the person is mid-gesture or typing, so the restart waits"); },
          }),
          recordEvent({
            type: "deferred",
            from: previousVersion.version,
            to: nextVersion.version,
            reason: restartCause,
          }),
          scheduleRestart("deferred-update", controllerOptions.busyPollMs ?? 250),
          "deferred")
        : ((stats.restarts += 1),
          recordEvent({
            ...updateEvent,
            decision: "restart",
            why: restartExplanation,
          }),
          recordEvent({
            type: "restart",
            from: previousVersion.version,
            to: nextVersion.version,
            reason: restartCause,
            asked: true,
          }),
          notifyBeforeRestart(
            restartCause === "code"
              ? "code changed"
              : "required: " + String(update.required),
          ),
          void update.restart?.());
    }
    try {
      update.adopt?.();
    } catch (adoptError: Dynamic) {
      recordEvent({
        ...updateEvent,
        decision: "restart",
        get why() { return ("u.adopt() threw: ") + (summarizeError(adoptError)); },
      });
      notifyBeforeRestart("adopt failed");
      return void update.restart?.();
    }
    recordEvent({
      ...updateEvent,
      decision: "adopt",
      why:
        update.changed === null
          ? "the shell sent no diff (changed: null); the listing is diffed after adopt"
          : "content only",
    });
    let adoptedAt: Dynamic = now();
    try {
      listingPort.noteAdopted?.(nextVersion, previousVersion);
    } catch {}
    return applyHotUpdate(update.changed, previousVersion, nextVersion, adoptedAt, false).catch(
      (applyError?: Dynamic): Dynamic => (
        recordEvent({
          type: "restart",
          from: previousVersion.version,
          to: nextVersion.version,
          reason: "apply-failed",
          asked: true,
          error: summarizeError(applyError),
        }),
        scheduleRestart("apply-failed"),
        "applied"
      ),
    );
  }
  async function applyHotUpdate(
    changedFiles?: Dynamic,
    previousVersion?: Dynamic,
    nextVersion?: Dynamic,
    adoptedAt?: Dynamic,
    isEarlyUpdate?: Dynamic,
  ): Promise<Dynamic> {
    let fetchRetryCount: Dynamic = 0,
      reportedPendingFetch: Dynamic = false,
      restartAfterApplyFailure: Dynamic = (
        reason?: Dynamic,
        error?: Dynamic,
      ): Dynamic => (
        recordEvent({
          type: "restart",
          from: previousVersion.version,
          to: nextVersion.version,
          reason: reason,
          asked: true,
          ...(error !== undefined
            ? {
                error: summarizeError(error),
              }
            : {}),
        }),
        scheduleRestart(reason),
        "applied"
      ),
      readErrorStatus: Dynamic = (error?: Dynamic): Dynamic => {
        let status: Dynamic = error?.status;
        return typeof status == "number" ? status : undefined;
      },
      fetchWithRetry: Dynamic = (
        filePath?: Dynamic,
        fetchFile?: Dynamic,
      ): Dynamic => {
        let attempts: Dynamic = 0;
        return retryAccessFailure(
          (): Dynamic => ((attempts += 1), fetchFile()),
          timers,
          (attempt?: Dynamic, error?: Dynamic): Dynamic => {
            fetchRetryCount += 1;
            stats.fetchRetries += 1;
            let status: Dynamic = readErrorStatus(error),
              redirectedTo: Dynamic = error?.redirectedTo;
            recordEvent({
              type: "fetch",
              to: nextVersion.version,
              path: filePath,
              attempt: attempt,
              ok: false,
              ...(status !== undefined
                ? {
                    status: status,
                  }
                : {}),
              msAfterAdopt: now() - adoptedAt,
              ...(typeof redirectedTo == "string"
                ? {
                    redirectedTo: redirectedTo,
                  }
                : {}),
            });
            attempt >= MAX_FILE_READ_ATTEMPTS &&
              !reportedPendingFetch &&
              ((reportedPendingFetch = true),
              recordEvent({
                type: "pending",
                from: previousVersion.version,
                to: nextVersion.version,
                paths: [filePath],
                msAfterAdopt: now() - adoptedAt,
              }));
          },
          retryDelaysMs,
        ).then(
          (response?: Dynamic): Dynamic => (
            recordEvent({
              type: "fetch",
              to: nextVersion.version,
              path: filePath,
              attempt: attempts,
              ok: true,
              msAfterAdopt: now() - adoptedAt,
            }),
            response
          ),
        );
      },
      incomingChanges: Dynamic;
    try {
      incomingChanges =
        changedFiles === null
          ? await fetchWithRetry("_files.json", diffFileListing)
          : changedFiles.map(
              (change?: Dynamic): Dynamic => ({
                path: change.path,
                sha256: changedFileSha(change),
              }),
            );
    } catch (listingError: Dynamic) {
      return restartAfterApplyFailure("fetch-exhausted", listingError);
    }
    if (
      changedFiles === null &&
      incomingChanges.some((change?: Dynamic): Dynamic => isCodePath(change.path))
    )
      if (
        controllerOptions.contentWhileBusy !== false &&
        controllerOptions.isBusy?.() === true &&
        incomingChanges.some((change?: Dynamic): Dynamic => !isCodePath(change.path))
      ) {
        recordEvent({
          type: "restart",
          from: previousVersion.version,
          to: nextVersion.version,
          reason: "code-after-adopt",
          asked: true,
        });
        scheduleRestart("code-after-adopt");
        incomingChanges = incomingChanges.filter(
          (change?: Dynamic): Dynamic => !isCodePath(change.path),
        );
      } else return restartAfterApplyFailure("code-after-adopt");
    if (cachedListing !== undefined && changedFiles !== null)
      for (let change of incomingChanges as Dynamic)
        change.sha256 === null
          ? cachedListing.delete(change.path)
          : cachedListing.set(change.path, change.sha256);
    incomingChanges = incomingChanges.filter(
      (change?: Dynamic): Dynamic =>
        listingPort.olderThanMyWrite?.(nextVersion.version, change.path) !== true,
    );
    let applicableChanges: Dynamic = isEarlyUpdate
      ? incomingChanges.slice()
      : incomingChanges.filter((change?: Dynamic): Dynamic => {
          let heldSha: Dynamic = listingPort.heldSha?.(change.path);
          if (heldSha === undefined || heldSha !== change.sha256) return true;
          let liveSha: Dynamic = listingPort.liveSha?.(change.path);
          return liveSha !== undefined && liveSha !== change.sha256;
        });
    try {
      listingPort.noteIncoming?.(incomingChanges);
    } catch {}
    let canReadByReference: Dynamic = (filePath?: Dynamic): Dynamic => {
        try {
          return listingPort.answersByReference?.(filePath) === true;
        } catch {
          return false;
        }
      },
      changedExistingFiles: Dynamic = applicableChanges.filter(
        (change?: Dynamic): Dynamic => change.sha256 !== null,
      ),
      filesToFetch: Dynamic = changedExistingFiles.filter(
        (change?: Dynamic): Dynamic => !canReadByReference(change.path),
      ),
      fetchedFiles: Dynamic = new Map(),
      grantLagMs: Dynamic,
      lastFetchError: Dynamic;
    if (filesToFetch.length === 0 && changedExistingFiles.length > 0 && changedFiles !== null)
      try {
        await fetchWithRetry(
          "_files.json",
          (): Dynamic => listWritableFiles(filePort),
        );
        grantLagMs = now() - adoptedAt;
      } catch (listingError: Dynamic) {
        return restartAfterApplyFailure("fetch-exhausted", listingError);
      }
    let fetchResults: Dynamic = await Promise.all(
      filesToFetch.map(
        (change?: Dynamic): Dynamic =>
          fetchWithRetry(
            change.path,
            (): Dynamic => filePort.readBytes(change.path),
          ).then(
            (fileBytes?: Dynamic): Dynamic => {
              grantLagMs ??= now() - adoptedAt;
              let fetchedFile: Dynamic = {
                ...fileBytes,
                sha256: change.sha256 ?? fileBytes.sha256,
              };
              fetchedFiles.set(change.path, fetchedFile);
              try {
                listingPort.primeRead?.(change.path, fetchedFile);
              } catch {}
              return true;
            },
            (error?: Dynamic): Dynamic => ((lastFetchError = error), false),
          ),
      ),
    );
    grantLagMs !== undefined &&
      ((stats.lastGrantLagMs = grantLagMs),
      (stats.maxGrantLagMs = Math.max(stats.maxGrantLagMs ?? 0, grantLagMs)));
    if (fetchResults.includes(false)) return restartAfterApplyFailure("fetch-exhausted", lastFetchError);
    let remoteUpdate: Dynamic = {
      from: previousVersion,
      to: nextVersion,
      changed: applicableChanges,
    };
    try {
      applicableChanges.length > 0 && (await controllerOptions.applyRemote(remoteUpdate, fetchedFiles));
    } catch (applyError: Dynamic) {
      return restartAfterApplyFailure("apply-failed", applyError);
    }
    try {
      listingPort.noteRemote?.(remoteUpdate);
    } catch {}
    stats.applied += 1;
    recordEvent({
      type: "applied",
      from: previousVersion.version,
      to: nextVersion.version,
      rows: incomingChanges.length,
      applied: applicableChanges.length,
      fetched: fetchedFiles.size,
      ...(changedExistingFiles.length > filesToFetch.length
        ? {
            skipped: changedExistingFiles.length - filesToFetch.length,
          }
        : {}),
      retries: fetchRetryCount,
      ...(grantLagMs !== undefined
        ? {
            grantLagMs: grantLagMs,
          }
        : {}),
      ms: now() - adoptedAt,
      paths: applicableChanges.map((change?: Dynamic): Dynamic => change.path),
      ...(isEarlyUpdate
        ? {
            early: true,
          }
        : {}),
    });
    return "applied";
  }
  let earlyController: Dynamic =
    controllerOptions.early ?? getHotReloadController(hotCapability);
  controllerOptions.snapshot !== undefined &&
    typeof hotCapability.snapshot == "function" &&
    hotCapability.snapshot(
      (snapshotContext?: Dynamic): Dynamic =>
        disposed ? undefined : controllerOptions.snapshot(snapshotContext),
    );
  earlyController?.attach === undefined &&
    (controllerOptions.restore !== undefined || controllerOptions.reveal !== undefined) &&
    typeof hotCapability.ready == "function" &&
    hotCapability.ready((carriedState?: Dynamic): Dynamic => {
      if (!disposed) {
        try {
          controllerOptions.restore?.(carriedState);
        } catch {}
        return controllerOptions.reveal === undefined
          ? undefined
          : awaitHotRestartReady(controllerOptions.reveal, {
              holdMs: controllerOptions.revealHoldMs,
              timers: timers,
              carried: carriedState != null,
              onEvent: recordEvent,
            });
      }
    });
  hotCapability.accept(handleHotUpdate);
  if (earlyController !== undefined) {
    earlyController.attach?.({
      ...(controllerOptions.snapshot !== undefined
        ? {
            snapshot: (snapshotContext?: Dynamic): Dynamic =>
              disposed ? undefined : controllerOptions.snapshot(snapshotContext),
          }
        : {}),
      ...(controllerOptions.restore !== undefined
        ? {
            restore: (carriedState?: Dynamic): Dynamic => {
              disposed || controllerOptions.restore(carriedState);
            },
          }
        : {}),
      ...(controllerOptions.reveal !== undefined
        ? {
            reveal: controllerOptions.reveal,
          }
        : {}),
      onEvent: recordEvent,
      onBeforeRestart: notifyBeforeRestart,
    });
    earlyController.release();
    let owedRestart: Dynamic = earlyController.takeOwed?.();
    owedRestart !== undefined &&
      (recordEvent({
        type: "restart",
        from: owedRestart.from.version,
        to: owedRestart.to.version,
        reason: "deferred-update",
        asked: true,
      }),
      scheduleRestart("deferred-update", controllerOptions.busyPollMs ?? 250));
    let queuedUpdates: Dynamic = earlyController.queued.splice(0);
    if (queuedUpdates.length > 0) {
      let needsListingDiff: Dynamic = queuedUpdates.some(
          (update?: Dynamic): Dynamic => update.changed === null,
        ),
        changesByPath: Dynamic = new Map();
      if (!needsListingDiff)
        for (let update of queuedUpdates as Dynamic)
          for (let change of update.changed as Dynamic)
            changesByPath.set(change.path, change);
      let firstUpdate: Dynamic = queuedUpdates[0],
        lastUpdate: Dynamic = queuedUpdates[queuedUpdates.length - 1];
      stats.updates += queuedUpdates.length;
      try {
        listingPort.noteAdopted?.(lastUpdate.to, firstUpdate.from);
      } catch {}
      applyHotUpdate(
        needsListingDiff ? null : [...changesByPath.values()],
        firstUpdate.from,
        lastUpdate.to,
        firstUpdate.at,
        true,
      ).catch((applyError?: Dynamic): Dynamic => {
        recordEvent({
          type: "restart",
          from: firstUpdate.from.version,
          to: lastUpdate.to.version,
          reason: "apply-failed",
          asked: true,
          error: summarizeError(applyError),
        });
        scheduleRestart("apply-failed");
      });
    }
  }
  return {
    get active(): Dynamic {
      return !disposed;
    },
    stats: (): Dynamic => ({
      ...stats,
    }),
    events: recentEvents,
    dispose(): Dynamic {
      disposed = true;
      restartTimer !== undefined &&
        (timers.clearTimeout(restartTimer), (restartTimer = undefined));
    },
  };
}
export {
  awaitHotRestartReady,
  canHotRestart,
  createFilesHotReloadController,
  getHotCapability,
  hasHotRestartToken,
  describeUpdateMethods as PlatformFilesHotReloadAdopt,
  HOT_RESTART_READY_TIMEOUT_MS as PlatformFilesHotReloadConstant,
  DEFAULT_FILE_READ_RETRY_DELAYS_MS as PlatformFilesHotReloadItems,
  changedFileSha as PlatformFilesHotReloadKind,
  MAX_FILE_READ_ATTEMPTS as PlatformFilesHotReloadLimit,
  readWindowName as PlatformFilesHotReloadName,
  describeChangedFiles as PlatformFilesHotReloadPath,
  summarizeError as PlatformFilesHotReloadSlice,
  readUpdateVersion as PlatformFilesHotReloadVer,
};
export function installPlatformFilesHotReload(): () => void {
  return () => {
    DEFAULT_FILE_READ_RETRY_DELAYS_MS = [
      150, 300, 600, 1e3, 2e3, 2e3, 2e3, 2e3, 2e3, 2e3, 2e3, 2e3,
    ];
    MAX_FILE_READ_ATTEMPTS = 4;
    readWindowName = (): Dynamic => {
      try {
        return typeof window === "undefined"
          ? ""
          : String((window as Dynamic).name ?? "");
      } catch {
        return "";
      }
    };
    RESTART_RATE_WINDOW_MS = 6e4;
    MAX_RESTARTS_PER_WINDOW = 1;
    MAX_RETAINED_HOT_EVENTS = 50;
    changedFileSha = (source?: Dynamic): Dynamic =>
      source.kind === "removed"
        ? null
        : typeof source.to == "string"
          ? source.to
          : null;
    summarizeError = (error?: Dynamic): Dynamic =>
      (error instanceof Error
        ? error.message
        : String(error?.message ?? error)
      ).slice(0, 120);
    readUpdateVersion = (updateVersion?: Dynamic): Dynamic => ({
      version: updateVersion.ver,
      ...(updateVersion.seq !== undefined
        ? {
            seq: updateVersion.seq,
          }
        : {}),
    });
    describeChangedFiles = (
      changes?: Dynamic,
      isCodePath?: Dynamic,
    ): Dynamic =>
      changes === null
        ? null
        : changes.map(
            (source?: Dynamic): Dynamic => ({
              path: source.path,
              kind: String(source.kind),
              klass: isCodePath(source.path) ? "code" : "content",
            }),
          );
    describeUpdateMethods = (update?: Dynamic): Dynamic =>
      typeof update.adopt == "function" ? "calls" : "string";
    HOT_RESTART_READY_TIMEOUT_MS = 4500;
  };
}
