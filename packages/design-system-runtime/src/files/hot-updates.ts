import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type {
  FilesHotOptions,
  FilesHotController,
  FilesHotStats,
  FilesHotEvent,
  FilesHotChange,
  HotIdleOptions,
  FileRetryError,
  FilesHotCapability,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import type * as Host from "../contracts/platform-host";
import { filesPortExtensions, isRuntimeInternalFilePath, listWritableFiles, retryFileRead } from "./paths";
import { getClaudeCapability } from "../host/claude-capabilities";
import { currentHotReloadBridge } from "../host/hot-reload";

var BOOT_FILE_READ_RETRY_DELAYS_MS: number[];
var MAX_HOT_FETCH_RETRIES: number;
var getHotWindowName: () => string;
var HOT_UPDATE_MAX_DEFER_MS: number;
var HOT_RESTARTS_PER_WINDOW: number;
var HOT_EVENT_HISTORY_LIMIT: number;
var hotChangedPathSha: (change: FilesHotChange) => string | null;
var shortHotErrorMessage: (error: unknown) => string;
var hotListingDescriptor: (version: Host.HotVersion) => Files.FileVersion;
var describeHotChangedPaths: (
  changes: Host.HotFileChange[] | null,
  isCode: (path: string) => boolean,
) => { path: string; kind: string; klass: string }[] | null;
var hotAdoptMethodKind: (update: Host.HotUpdate) => string;
var HOT_INDEX_RECHECK_DELAY_MS: number;
function getHotCapability(): FilesHotCapability | null {
  let value = getClaudeCapability("hot");
  if (
    (typeof value === "object" || typeof value === "function") &&
    value !== null
  ) {
    return value as FilesHotCapability;
  } else {
    return null;
  }
}
function hasHotRestartKey(windowName: string = getHotWindowName()) {
  try {
    let value: unknown = JSON.parse(windowName)?.hot?.k;
    return typeof value === "string" && value !== "";
  } catch {
    return false;
  }
}
function canRestartArtifact(
  hot: FilesHotCapability | null = getHotCapability(),
  windowName?: string,
) {
  return typeof hot?.restart === "function" && hasHotRestartKey(windowName);
}
function waitForHotUpdateIdle(
  updateInput: PromiseLike<unknown> | unknown,
  updateOptions: HotIdleOptions = {},
) {
  let value = updateOptions.timers ?? {
      setTimeout: (updateInputA: () => void, updateOptionsA: number) =>
        setTimeout(updateInputA, updateOptionsA),
      clearTimeout: (updateInputB: ReturnType<typeof setTimeout>) =>
        clearTimeout(updateInputB),
    },
    callback = () => value.now?.() ?? Date.now(),
    updateValue = callback();
  return new Promise<void>((updateInputC): void => {
    let flag: boolean = false,
      updateHandler = (updateInputD: boolean): void => {
        if (flag) {
          return;
        }
        flag = true;
        if (!updateInputD) {
          value.clearTimeout?.(updateState);
        }
        try {
          updateOptions.onEvent?.({
            type: "reveal",
            heldMs: callback() - updateValue,
            timedOut: updateInputD,
            carried: updateOptions.carried === true,
          });
        } catch {}
        updateInputC();
      },
      updateState = value.setTimeout(
        () => updateHandler(true),
        updateOptions.holdMs ?? HOT_INDEX_RECHECK_DELAY_MS,
      );
    Promise.resolve(updateInput).then(
      () => updateHandler(false),
      () => updateHandler(false),
    );
  });
}
function createFilesHotUpdateController(
  updateOptionsB: FilesHotOptions,
): FilesHotController {
  let hot: FilesHotCapability | null =
      updateOptionsB.hot !== undefined ? updateOptionsB.hot : getHotCapability(),
    counters: FilesHotStats = {
      updates: 0,
      applied: 0,
      deferred: 0,
      restarts: 0,
      fetchRetries: 0,
    },
    events: FilesHotEvent[] = [];
  if (
    updateOptionsB.embedded === true ||
    hot === null ||
    typeof hot.accept !== "function"
  ) {
    return {
      dispose: (): void => {
        return;
      },
      active: false,
      stats: () => ({
        ...counters,
      }),
      events: events,
    };
  }
  let { port: port } = updateOptionsB,
    portExtensions = filesPortExtensions(port),
    isCodePath = updateOptionsB.isCode ?? isRuntimeInternalFilePath,
    retryDelays = updateOptionsB.retryMs ?? BOOT_FILE_READ_RETRY_DELAYS_MS,
    timers = updateOptionsB.timers ?? {
      setTimeout: (updateInputE: () => void, updateOptionsC: number) =>
        setTimeout(updateInputE, updateOptionsC),
      clearTimeout: (updateInputF: ReturnType<typeof setTimeout>) =>
        clearTimeout(updateInputF),
      now: (): number => Date.now(),
    },
    now = () => timers.now?.() ?? Date.now(),
    disposed: boolean = false,
    restartTimer: ReturnType<typeof setTimeout> | undefined,
    restartNote: string | undefined,
    recentRestartTimes: number[] = [],
    fallbackListing: Map<string, string> | undefined;
  if (portExtensions.knownListing === undefined) {
    port.list().then(
      (updateInputG): void => {
        fallbackListing ??= new Map(
          updateInputG.map((updateInputH) => [updateInputH.path, updateInputH.sha256]),
        );
      },
      (): void => {
        return;
      },
    );
  }
  function emitEvent(updateInputI: FilesHotEvent): void {
    events.push(updateInputI);
    if (events.length > HOT_EVENT_HISTORY_LIMIT) {
      events.shift();
    }
    try {
      if (updateOptionsB.onEvent) {
        updateOptionsB.onEvent(updateInputI);
      } else {
        globalThis.console?.debug?.("[hot]", JSON.stringify(updateInputI));
      }
    } catch {}
  }
  let beforeRestart = (updateInputJ: string): void => {
    try {
      updateOptionsB.onBeforeRestart?.(updateInputJ);
    } catch {}
  };
  function scheduleRestart(updateInputK: string, updateOptionsD: number = 0): void {
    restartNote ??= updateInputK;
    if (restartTimer !== undefined || disposed) {
      return;
    }
    let callback = (): void => {
      restartTimer = undefined;
      if (disposed || restartNote === undefined) {
        return;
      }
      if (updateOptionsB.isBusy?.() === true) {
        restartTimer = timers.setTimeout(callback, updateOptionsB.busyPollMs ?? 250);
        return;
      }
      let value = now();
      while (
        recentRestartTimes.length > 0 &&
        value - recentRestartTimes[0] > HOT_UPDATE_MAX_DEFER_MS
      ) {
        recentRestartTimes.shift();
      }
      if (recentRestartTimes.length >= HOT_RESTARTS_PER_WINDOW) {
        restartTimer = timers.setTimeout(
          callback,
          HOT_UPDATE_MAX_DEFER_MS - (value - recentRestartTimes[0]) + 1,
        );
        return;
      }
      recentRestartTimes.push(value);
      let updateValueA = restartNote;
      restartNote = undefined;
      counters.restarts += 1;
      beforeRestart(updateValueA);
      try {
        hot!.restart?.({
          note: updateValueA,
        });
      } catch {}
    };
    restartTimer = timers.setTimeout(callback, updateOptionsD);
  }
  async function diffListing(): Promise<Files.ChangedFileRow[]> {
    let entries = new Map(
        portExtensions.knownListing?.() ?? fallbackListing ?? [],
      ),
      updateValueB = new Map(
        (await listWritableFiles(port)).map((updateInputL) => [
          updateInputL.path,
          updateInputL.sha256,
        ]),
      );
    fallbackListing = updateValueB;
    let items: Files.ChangedFileRow[] = [];
    for (let [value, updateValueC] of updateValueB) {
      if (entries.get(value) !== updateValueC) {
        items.push({
          path: value,
          sha256: updateValueC,
        });
      }
    }
    for (let value of entries.keys()) {
      if (!updateValueB.has(value)) {
        items.push({
          path: value,
          sha256: null,
        });
      }
    }
    return items.sort((updateInputM, updateOptionsE): number =>
      updateInputM.path < updateOptionsE.path ? -1 : 1,
    );
  }
  function acceptUpdate(
    updateInputN: Host.HotUpdate,
  ): void | "deferred" | Promise<"applied"> {
    if (disposed) {
      return void updateInputN.restart?.();
    }
    counters.updates += 1;
    let value = hotListingDescriptor(updateInputN.from),
      updateValueD = hotListingDescriptor(updateInputN.to),
      updateStateA: boolean = updateOptionsB.isBusy?.() === true,
      updateResult: string | string | undefined =
        updateInputN.required !== "none"
          ? "required"
          : updateInputN.changed !== null &&
              updateInputN.changed.some((updateInputO) => isCodePath(updateInputO.path))
            ? "code"
            : undefined,
      state: FilesHotEvent = {
        type: "update",
        from: value.version,
        to: updateValueD.version,
        ...(value.seq !== undefined
          ? {
              fromSeq: value.seq,
            }
          : {}),
        ...(updateValueD.seq !== undefined
          ? {
              toSeq: updateValueD.seq,
            }
          : {}),
        required: String(updateInputN.required),
        shape: hotAdoptMethodKind(updateInputN),
        changed: describeHotChangedPaths(updateInputN.changed, isCodePath),
        busy: updateStateA,
      };
    if (updateResult !== undefined) {
      let updateData: string =
          updateResult === "code"
            ? uiMessage("design-system.hotUpdates.aChangedPathIsThe") +
              (updateInputN.changed ?? [])
                .filter((updateInputP) => isCodePath(updateInputP.path))
                .map((updateInputQ) => updateInputQ.path)
                .join(", ")
            : uiMessage("design-system.hotUpdates.requiredIs") + String(updateInputN.required),
        updateItem =
          updateResult === "code" && updateInputN.changed !== null
            ? updateInputN.changed.filter(
                (updateInputR): boolean => !isCodePath(updateInputR.path),
              )
            : [];
      if (
        updateStateA &&
        updateOptionsB.contentWhileBusy !== false &&
        updateItem.length > 0 &&
        typeof updateInputN.adopt === "function"
      ) {
        try {
          updateInputN.adopt();
        } catch (updateValueE: unknown) {
          emitEvent({
            ...state,
            decision: "restart",
            get why() { return ("u.adopt() threw: ") + (shortHotErrorMessage(updateValueE)); },
          });
          beforeRestart(uiMessage("design-system.hotUpdates.adoptFailed"));
          return void updateInputN.restart?.();
        }
        emitEvent({
          ...state,
          decision: "adopt",
          get why() { return (((updateData) + ("; the person is busy, so the ")) + (String(updateItem.length))) + (" content row(s) are applied in place now and the restart waits"); },
        });
        emitEvent({
          type: "deferred",
          from: value.version,
          to: updateValueD.version,
          reason: "code",
        });
        counters.deferred += 1;
        let updateValueF = now();
        try {
          portExtensions.noteAdopted?.(updateValueD, value);
        } catch {}
        scheduleRestart("deferred-update", updateOptionsB.busyPollMs ?? 250);
        return applyUpdateRows(updateItem, value, updateValueD, updateValueF, false).catch(
          (updateInputS: unknown): "applied" => {
            emitEvent({
              type: "restart",
              from: value.version,
              to: updateValueD.version,
              reason: "apply-failed",
              asked: true,
              error: shortHotErrorMessage(updateInputS),
            });
            scheduleRestart("apply-failed");
            return "applied";
          },
        );
      }
      if (updateStateA && typeof updateInputN.defer === "function") {
        updateInputN.defer();
        counters.deferred += 1;
        emitEvent({
          ...state,
          decision: "defer",
          get why() { return (updateData) + ("; the person is mid-gesture or typing, so the restart waits"); },
        });
        emitEvent({
          type: "deferred",
          from: value.version,
          to: updateValueD.version,
          reason: updateResult,
        });
        scheduleRestart("deferred-update", updateOptionsB.busyPollMs ?? 250);
        return "deferred";
      }
      counters.restarts += 1;
      emitEvent({
        ...state,
        decision: "restart",
        why: updateData,
      });
      emitEvent({
        type: "restart",
        from: value.version,
        to: updateValueD.version,
        reason: updateResult,
        asked: true,
      });
      beforeRestart(
        updateResult === "code"
          ? uiMessage("design-system.hotUpdates.codeChanged")
          : "required: " + String(updateInputN.required),
      );
      return void updateInputN.restart?.();
    }
    try {
      updateInputN.adopt?.();
    } catch (updateDataA: unknown) {
      emitEvent({
        ...state,
        decision: "restart",
        get why() { return ("u.adopt() threw: ") + (shortHotErrorMessage(updateDataA)); },
      });
      beforeRestart(uiMessage("design-system.hotUpdates.adoptFailed"));
      return void updateInputN.restart?.();
    }
    emitEvent({
      ...state,
      decision: "adopt",
      why:
        updateInputN.changed === null
          ? uiMessage("design-system.hotUpdates.theShellSentNoDiff")
          : uiMessage("design-system.hotUpdates.contentOnly"),
    });
    let updateEntry = now();
    try {
      portExtensions.noteAdopted?.(updateValueD, value);
    } catch {}
    return applyUpdateRows(updateInputN.changed, value, updateValueD, updateEntry, false).catch(
      (updateInputT: unknown): "applied" => {
        emitEvent({
          type: "restart",
          from: value.version,
          to: updateValueD.version,
          reason: "apply-failed",
          asked: true,
          error: shortHotErrorMessage(updateInputT),
        });
        scheduleRestart("apply-failed");
        return "applied";
      },
    );
  }
  async function applyUpdateRows(
    updateInputU: Host.HotFileChange[] | null,
    updateOptionsF: Files.FileVersion,
    updateValueG: Files.FileVersion,
    updateValueH: number,
    updateValueI: boolean,
  ): Promise<"applied"> {
    let index = 0,
      flag: boolean = false,
      callback = (updateInputV: string, updateOptionsG?: unknown): "applied" => {
        emitEvent({
          type: "restart",
          from: updateOptionsF.version,
          to: updateValueG.version,
          reason: updateInputV,
          asked: true,
          ...(updateOptionsG !== undefined
            ? {
                error: shortHotErrorMessage(updateOptionsG),
              }
            : {}),
        });
        scheduleRestart(updateInputV);
        return "applied";
      },
      updateHandlerA = (updateInputW: unknown) => {
        let updateValueJ: unknown = (updateInputW as FileRetryError | null)?.status;
        if (typeof updateValueJ === "number") {
          return updateValueJ;
        } else {
          return undefined;
        }
      },
      updateHandlerB = <Result>(
        updateInputX: string,
        updateOptionsH: () => Promise<Result>,
      ): Promise<Result> => {
        let updateValueK = 0;
        return retryFileRead(
          () => {
            updateValueK += 1;
            return updateOptionsH();
          },
          timers,
          (updateInputY, updateOptionsI): void => {
            index += 1;
            counters.fetchRetries += 1;
            let updateValueL = updateHandlerA(updateOptionsI),
              updateValueM: unknown = (
                updateOptionsI as
                  | (FileRetryError & { redirectedTo?: unknown })
                  | null
              )?.redirectedTo;
            emitEvent({
              type: "fetch",
              to: updateValueG.version,
              path: updateInputX,
              attempt: updateInputY,
              ok: false,
              ...(updateValueL !== undefined
                ? {
                    status: updateValueL,
                  }
                : {}),
              msAfterAdopt: now() - updateValueH,
              ...(typeof updateValueM === "string"
                ? {
                    redirectedTo: updateValueM,
                  }
                : {}),
            });
            if (updateInputY >= MAX_HOT_FETCH_RETRIES && !flag) {
              flag = true;
              emitEvent({
                type: "pending",
                from: updateOptionsF.version,
                to: updateValueG.version,
                paths: [updateInputX],
                msAfterAdopt: now() - updateValueH,
              });
            }
          },
          retryDelays,
        ).then((updateInputZ) => {
          emitEvent({
            type: "fetch",
            to: updateValueG.version,
            path: updateInputX,
            attempt: updateValueK,
            ok: true,
            msAfterAdopt: now() - updateValueH,
          });
          return updateInputZ;
        });
      },
      updateValueN: Files.ChangedFileRow[];
    try {
      updateValueN =
        updateInputU === null
          ? await updateHandlerB("_files.json", diffListing)
          : updateInputU.map((fileEntry) => ({
              path: fileEntry.path,
              sha256: hotChangedPathSha(fileEntry),
            }));
    } catch (updateValueO: unknown) {
      return callback("fetch-exhausted", updateValueO);
    }
    if (updateInputU === null && updateValueN.some((fileEntry) => isCodePath(fileEntry.path))) {
      if (
        updateOptionsB.contentWhileBusy !== false &&
        updateOptionsB.isBusy?.() === true &&
        updateValueN.some((fileEntry): boolean => !isCodePath(fileEntry.path))
      ) {
        emitEvent({
          type: "restart",
          from: updateOptionsF.version,
          to: updateValueG.version,
          reason: "code-after-adopt",
          asked: true,
        });
        scheduleRestart("code-after-adopt");
        updateValueN = updateValueN.filter((fileEntry): boolean => !isCodePath(fileEntry.path));
      } else {
        return callback("code-after-adopt");
      }
    }
    if (fallbackListing !== undefined && updateInputU !== null) {
      for (let updateValueP of updateValueN) {
        if (updateValueP.sha256 === null) {
          fallbackListing.delete(updateValueP.path);
        } else {
          fallbackListing.set(updateValueP.path, updateValueP.sha256);
        }
      }
    }
    updateValueN = updateValueN.filter(
      (updateInput_): boolean =>
        portExtensions.olderThanMyWrite?.(updateValueG.version, updateInput_.path) !==
        true,
    );
    let updateStateB = updateValueI
      ? updateValueN.slice()
      : updateValueN.filter((fileEntry) => {
          let updateValueQ = portExtensions.heldSha?.(fileEntry.path);
          if (updateValueQ === undefined || updateValueQ !== fileEntry.sha256) {
            return true;
          }
          let updateValueR = portExtensions.liveSha?.(fileEntry.path);
          return updateValueR !== undefined && updateValueR !== fileEntry.sha256;
        });
    try {
      portExtensions.noteIncoming?.(updateValueN);
    } catch {}
    let updateHandlerC = (updateInputa: string): boolean | undefined => {
        try {
          return portExtensions.answersByReference?.(updateInputa) === true;
        } catch {
          return false;
        }
      },
      updateResultA = updateStateB.filter((updateInputb): boolean => updateInputb.sha256 !== null),
      updateEntryA = updateResultA.filter((updateInputc): boolean => !updateHandlerC(updateInputc.path)),
      entries: Map<string, Files.FileBytesRead> = new Map(),
      updateDataB: number | undefined,
      updateItemA: unknown;
    if (updateEntryA.length === 0 && updateResultA.length > 0 && updateInputU !== null) {
      try {
        await updateHandlerB("_files.json", () =>
          listWritableFiles(port),
        );
        updateDataB = now() - updateValueH;
      } catch (updateValueS: unknown) {
        return callback("fetch-exhausted", updateValueS);
      }
    }
    let updateValueT = await Promise.all(
      updateEntryA.map((updateInputd) =>
        updateHandlerB<Files.FileBytesRead>(updateInputd.path, () =>
          port.readBytes(updateInputd.path),
        ).then(
          (updateInpute): boolean => {
            updateDataB ??= now() - updateValueH;
            let updateValueU = {
              ...updateInpute,
              sha256: updateInputd.sha256 ?? updateInpute.sha256,
            };
            entries.set(updateInputd.path, updateValueU);
            try {
              portExtensions.primeRead?.(updateInputd.path, updateValueU);
            } catch {}
            return true;
          },
          (updateInputf: unknown): boolean => {
            updateItemA = updateInputf;
            return false;
          },
        ),
      ),
    );
    if (updateDataB !== undefined) {
      counters.lastGrantLagMs = updateDataB;
      counters.maxGrantLagMs = Math.max(counters.maxGrantLagMs ?? 0, updateDataB);
    }
    if (updateValueT.includes(false)) {
      return callback("fetch-exhausted", updateItemA);
    }
    let state: Files.FileRemoteChange = {
      from: updateOptionsF,
      to: updateValueG,
      changed: updateStateB,
    };
    try {
      if (updateStateB.length > 0) {
        await updateOptionsB.applyRemote(state, entries);
      }
    } catch (updateValueV: unknown) {
      return callback("apply-failed", updateValueV);
    }
    try {
      portExtensions.noteRemote?.(state);
    } catch {}
    counters.applied += 1;
    emitEvent({
      type: "applied",
      from: updateOptionsF.version,
      to: updateValueG.version,
      rows: updateValueN.length,
      applied: updateStateB.length,
      fetched: entries.size,
      ...(updateResultA.length > updateEntryA.length
        ? {
            skipped: updateResultA.length - updateEntryA.length,
          }
        : {}),
      retries: index,
      ...(updateDataB !== undefined
        ? {
            grantLagMs: updateDataB,
          }
        : {}),
      ms: now() - updateValueH,
      paths: updateStateB.map((updateInputg) => updateInputg.path),
      ...(updateValueI
        ? {
            early: true,
          }
        : {}),
    });
    return "applied";
  }
  let earlyUpdates =
    updateOptionsB.early ?? currentHotReloadBridge(hot);
  if (updateOptionsB.snapshot !== undefined && typeof hot.snapshot === "function") {
    hot.snapshot((updateInputh: unknown) =>
      disposed ? undefined : updateOptionsB.snapshot!(updateInputh),
    );
  }
  if (
    earlyUpdates?.attach === undefined &&
    (updateOptionsB.restore !== undefined || updateOptionsB.reveal !== undefined) &&
    typeof hot.ready === "function"
  ) {
    hot.ready((updateInputi: unknown) => {
      if (disposed) {
        return;
      }
      try {
        updateOptionsB.restore?.(updateInputi);
      } catch {}
      if (updateOptionsB.reveal === undefined) {
        return undefined;
      } else {
        return waitForHotUpdateIdle(updateOptionsB.reveal, {
          holdMs: updateOptionsB.revealHoldMs,
          timers: timers,
          carried: updateInputi !== undefined && updateInputi !== null,
          onEvent: emitEvent,
        });
      }
    });
  }
  hot.accept(acceptUpdate);
  if (earlyUpdates !== undefined) {
    earlyUpdates.attach?.({
      ...(updateOptionsB.snapshot !== undefined
        ? {
            snapshot: (updateInputj: unknown) =>
              disposed ? undefined : updateOptionsB.snapshot!(updateInputj),
          }
        : {}),
      ...(updateOptionsB.restore !== undefined
        ? {
            restore: (updateInputk: unknown): void => {
              if (!disposed) {
                updateOptionsB.restore!(updateInputk);
              }
            },
          }
        : {}),
      ...(updateOptionsB.reveal !== undefined
        ? {
            reveal: updateOptionsB.reveal,
          }
        : {}),
      onEvent: emitEvent,
      onBeforeRestart: beforeRestart,
    });
    earlyUpdates.release();
    let value = earlyUpdates.takeOwed?.();
    if (value !== undefined) {
      emitEvent({
        type: "restart",
        from: value.from.version,
        to: value.to.version,
        reason: "deferred-update",
        asked: true,
      });
      scheduleRestart("deferred-update", updateOptionsB.busyPollMs ?? 250);
    }
    let updateValueW = earlyUpdates.queued.splice(0);
    if (updateValueW.length > 0) {
      let updateStateC = updateValueW.some((updateInputl): boolean => updateInputl.changed === null),
        entries: Map<string, Host.HotFileChange> = new Map();
      if (!updateStateC) {
        for (let updateDataC of updateValueW) {
          for (let updateItemB of updateDataC.changed!) {
            entries.set(updateItemB.path, updateItemB);
          }
        }
      }
      let updateResultB = updateValueW[0],
        updateEntryB = updateValueW[updateValueW.length - 1];
      counters.updates += updateValueW.length;
      try {
        portExtensions.noteAdopted?.(updateEntryB.to, updateResultB.from);
      } catch {}
      applyUpdateRows(
        updateStateC ? null : [...entries.values()],
        updateResultB.from,
        updateEntryB.to,
        updateResultB.at,
        true,
      ).catch((updateInputm: unknown): void => {
        emitEvent({
          type: "restart",
          from: updateResultB.from.version,
          to: updateEntryB.to.version,
          reason: "apply-failed",
          asked: true,
          error: shortHotErrorMessage(updateInputm),
        });
        scheduleRestart("apply-failed");
      });
    }
  }
  return {
    get active(): boolean {
      return !disposed;
    },
    stats: () => ({
      ...counters,
    }),
    events: events,
    dispose(): void {
      disposed = true;
      if (restartTimer !== undefined) {
        timers.clearTimeout(restartTimer);
        restartTimer = undefined;
      }
    },
  };
}
export {
  BOOT_FILE_READ_RETRY_DELAYS_MS,
  canRestartArtifact,
  createFilesHotUpdateController,
  describeHotChangedPaths,
  getHotCapability,
  getHotWindowName,
  hasHotRestartKey,
  HOT_EVENT_HISTORY_LIMIT,
  HOT_INDEX_RECHECK_DELAY_MS,
  HOT_RESTARTS_PER_WINDOW,
  HOT_UPDATE_MAX_DEFER_MS,
  hotAdoptMethodKind,
  hotChangedPathSha,
  hotListingDescriptor,
  MAX_HOT_FETCH_RETRIES,
  shortHotErrorMessage,
  waitForHotUpdateIdle,
};
export function installFilesHotUpdates(): () => void {
  return () => {
    BOOT_FILE_READ_RETRY_DELAYS_MS = [
      150, 300, 600, 1000, 2000, 2000, 2000, 2000, 2000, 2000, 2000, 2000,
    ];
    MAX_HOT_FETCH_RETRIES = 4;
    getHotWindowName = (): string => {
      try {
        if (typeof window === "undefined") {
          return "";
        } else {
          return String(window.name ?? "");
        }
      } catch {
        return "";
      }
    };
    HOT_UPDATE_MAX_DEFER_MS = 60000;
    HOT_RESTARTS_PER_WINDOW = 1;
    HOT_EVENT_HISTORY_LIMIT = 50;
    hotChangedPathSha = (source: FilesHotChange) =>
      source.kind === "removed"
        ? null
        : typeof source.to === "string"
          ? source.to
          : null;
    shortHotErrorMessage = (updateInputn: unknown) =>
      (updateInputn instanceof Error
        ? updateInputn.message
        : String((updateInputn as FileRetryError | null)?.message ?? updateInputn)
      ).slice(0, 120);
    hotListingDescriptor = (updateInputo: Host.HotVersion) => ({
      version: updateInputo.ver,
      ...(updateInputo.seq !== undefined
        ? {
            seq: updateInputo.seq,
          }
        : {}),
    });
    describeHotChangedPaths = (
      updateInputp: Host.HotFileChange[] | null,
      updateOptionsJ: (path: string) => boolean,
    ) =>
      updateInputp === null
        ? null
        : updateInputp.map((source: Host.HotFileChange) => ({
            path: source.path,
            kind: String(source.kind),
            klass: updateOptionsJ(source.path) ? "code" : "content",
          }));
    hotAdoptMethodKind = (updateInputq: Host.HotUpdate): string =>
      typeof updateInputq.adopt === "function" ? "calls" : "string";
    HOT_INDEX_RECHECK_DELAY_MS = 4500;
  };
}
