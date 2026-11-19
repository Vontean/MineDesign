import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Debug from "../contracts/debug-panel";
import type * as Core from "../contracts/files-core";
import type * as Model from "../contracts";
import type * as Host from "../contracts/platform-host";
/** Restored application module; prepare first, initialize in original order. */
import { cachedClaudeRoom } from "../editor/claude-delivery";
import { filePublishEncodedBytes } from "./paths";

var FILES_DEBUG_REFRESH_MS: number;
var FILES_DEBUG_EVENT_STAGGER_MS: number;
var FILES_DEBUG_VIEW_REFRESH_MS: number;
var FILES_DEBUG_PANEL_DEFAULT_SIZE: Record<Debug.DebugSide, number>;
var FILES_DEBUG_PANEL_MIN_SIZE: Record<Debug.DebugSide, number>;
var FILES_DEBUG_TOGGLE_SHORTCUT: string;
var createFilesDebugTabId: () => string;
var formatFilesDebugTimestamp: (timestamp: number) => string;
var shortDebugValue: (value: string | null | undefined) => string;
function filesDebugEnabled(
  getStorage: () => Pick<Storage, "getItem"> | null | undefined = () =>
    globalThis.localStorage,
): boolean {
  try {
    return getStorage()?.getItem("appifact-files-debug") === "1";
  } catch {
    return false;
  }
}
function filesModeDebugEnabled(
  mode: string,
  storage?: () => Pick<Storage, "getItem"> | null | undefined,
): boolean {
  return mode === "files" && filesDebugEnabled(storage);
}
function sortedSampleQuantile(
  sortedSamples: readonly number[],
  quantile: number,
): number {
  if (sortedSamples.length === 0) {
    return NaN;
  }
  return sortedSamples[
    Math.min(
      sortedSamples.length - 1,
      Math.floor((sortedSamples.length - 1) * quantile + 0.5),
    )
  ];
}
function filesDebugEventLevel(
  debugInput: Debug.DebugEvent,
): Debug.DebugEventLevel {
  let type = debugInput.type;
  if (
    type === "hot-restart" ||
    type === "save-conflict" ||
    type === "save-error" ||
    type === "publish-raw-error" ||
    type === "restart-asked"
  ) {
    return "error";
  }
  if (type === "read") {
    let value =
      (debugInput.data as Debug.DebugEventData | undefined)?.status ?? 200;
    if (value === 0 || value >= 400) {
      return "error";
    } else {
      return "boot";
    }
  }
  if (type === "reconcile") {
    if ((debugInput.data as Debug.DebugEventData | undefined)?.ok === false) {
      return "error";
    } else {
      return "hot";
    }
  }
  if (
    type.startsWith("hot-") ||
    type === "apply" ||
    type === "visible" ||
    type === "board-remote" ||
    type === "reveal-held" ||
    type === "reconcile-choice"
  ) {
    return "hot";
  }
  if (type.startsWith("save-") || type === "notice") {
    return "save";
  }
  if (type.startsWith("boot") || type === "listing-retried") {
    return "boot";
  }
  if (type.startsWith("peer-") || type === "visibility") {
    return "room";
  }
  return "other";
}
function createFilesDebugPanel(
  panelOptions: Core.FilesDebuggerOptions,
): Core.FilesDebugger {
  let storagePrefix: string = "hotdbg/" + panelOptions.product + "/",
    storage = (() => {
      try {
        if (typeof sessionStorage === "undefined") {
          return null;
        } else {
          return sessionStorage;
        }
      } catch {
        return null;
      }
    })(),
    readStored = <Key extends keyof Debug.DebugStoredValues>(
      debugInputA: Key,
      debugOptionsA: Debug.DebugStoredValues[Key],
    ): Debug.DebugStoredValues[Key] => {
      try {
        let value = storage?.getItem(storagePrefix + debugInputA);
        if (value === null || value === undefined) {
          return debugOptionsA;
        } else {
          return JSON.parse(value) as unknown as Debug.DebugStoredValues[Key];
        }
      } catch {
        return debugOptionsA;
      }
    },
    writeStored = (debugInputB: string, debugOptionsB: unknown): void => {
      try {
        if (debugOptionsB === null) {
          storage?.removeItem(storagePrefix + debugInputB);
        } else {
          storage?.setItem(storagePrefix + debugInputB, JSON.stringify(debugOptionsB));
        }
      } catch {}
    },
    clockNow = () =>
      typeof performance !== "undefined" ? performance.now() : Date.now(),
    hot = (panelOptions.hot ?? null) as
      | (Host.HotCapability & { from?: unknown })
      | null,
    tabId = readStored("tab", "") || createFilesDebugTabId();
  writeStored("tab", tabId);
  let bootStartedAt = panelOptions.bootStartedAt ?? clockNow(),
    eventLog = readStored("log", []),
    fields = new Map<string, unknown>(),
    timingSamples = new Map<string, number[]>(),
    visibilitySeries: Debug.DebugVisibilitySample[] = [],
    lastVersionByPath = new Map<string, string | undefined>(),
    hiddenSamplesExcluded = 0,
    lastUpdateRestarted: boolean = false,
    providers: Core.DebugProviders = {},
    errorCounts = {
      conflict: 0,
      rate: 0,
      other: 0,
    },
    lastPublish: Debug.DebugLastPublish | undefined,
    publishErrors: Debug.DebugPublishError[] = [],
    restartBreadcrumb = readStored("crumb", null),
    loadedBefore = readStored("seen", false),
    cameFromHotRestart = false,
    hotFrom: unknown;
  try {
    hotFrom = hot?.from;
    cameFromHotRestart = hotFrom !== null && hotFrom !== undefined;
  } catch {}
  let hotRestartNote = (() => {
      let value = (hotFrom as { note?: unknown } | null | undefined)?.note;
      if (typeof value === "string") {
        return value;
      } else {
        return undefined;
      }
    })(),
    reloadReason: string;
  if (restartBreadcrumb?.phase === "hot-restart") {
    reloadReason =
      uiMessage("design-system.debugPanel.hotRestart") + (restartBreadcrumb.reason ?? uiMessage("design-system.debugPanel.askedByThisPage"));
  } else if (restartBreadcrumb?.phase === "publishing") {
    reloadReason =
      uiMessage("design-system.debugPanel.reloadedDuringAPublishOf") +
      (restartBreadcrumb.paths ?? []).join(", ") +
      " (likely a conflict: the shell reboots the tab that lost)";
  } else if (cameFromHotRestart) {
    reloadReason =
      uiMessage("design-system.debugPanel.hotRestartByTheShell") +
      (hotRestartNote !== undefined
        ? " (note: " + hotRestartNote + ")"
        : " (no reason recorded here: no accept handler was registered in time, or the kernel restarted on its own)");
  } else if (loadedBefore) {
    reloadReason = uiMessage("design-system.debugPanel.plainReload");
  } else {
    reloadReason = uiMessage("design-system.debugPanel.firstLoad");
  }
  let reloadReasonKey: string =
      restartBreadcrumb?.phase === "hot-restart"
        ? uiMessage("design-system.debugPanel.hotRestart") + (restartBreadcrumb.reason ?? "?")
        : restartBreadcrumb?.phase === "publishing"
          ? uiMessage("design-system.debugPanel.duringAPublish")
          : cameFromHotRestart
            ? uiMessage("design-system.debugPanel.hotRestartByTheShell")
            : loadedBefore
              ? uiMessage("design-system.debugPanel.plainReload")
              : uiMessage("design-system.debugPanel.firstLoad"),
    reasonCounts = readStored("reasons", {});
  reasonCounts[reloadReasonKey] = (reasonCounts[reloadReasonKey] ?? 0) + 1;
  writeStored("reasons", reasonCounts);
  let reloadHistory = readStored("reloads", []);
  reloadHistory.push({
    t: Date.now(),
    reason: reloadReason,
  });
  if (reloadHistory.length > 60) {
    reloadHistory.splice(0, reloadHistory.length - 60);
  }
  writeStored("reloads", reloadHistory);
  writeStored("crumb", null);
  writeStored("seen", true);
  let debugOptions = new Map<string, Debug.DebugToggle>();
  function option(debugInputC: string, debugOptionsC: string): () => boolean {
    if (!debugOptions.has(debugInputC)) {
      debugOptions.set(debugInputC, {
        label: debugOptionsC,
        on: readStored(("opt/" + debugInputC) as `opt/${string}`, true),
      });
    }
    return () => debugOptions.get(debugInputC)?.on ?? true;
  }
  let logPersistTimer: ReturnType<typeof setTimeout> | undefined,
    persistLog = false,
    schedulePersistLog = (): void => {
      if (!persistLog || logPersistTimer !== undefined) {
        return;
      }
      logPersistTimer = setTimeout((): void => {
        logPersistTimer = undefined;
        if (persistLog) {
          writeStored("log", eventLog.slice(-FILES_DEBUG_EVENT_STAGGER_MS));
        }
      }, 250);
    };
  function recordEvent(debugInputD: string, debugOptionsD?: unknown): void {
    eventLog.push({
      t: Date.now(),
      type: debugInputD,
      ...(debugOptionsD !== undefined
        ? {
            data: debugOptionsD,
          }
        : {}),
    });
    if (eventLog.length > FILES_DEBUG_REFRESH_MS) {
      eventLog.splice(0, eventLog.length - FILES_DEBUG_REFRESH_MS);
    }
    schedulePersistLog();
    invalidateView("events");
  }
  function recordTiming(debugInputE: string, debugOptionsE: number): void {
    if (!Number.isFinite(debugOptionsE)) {
      return;
    }
    let value = timingSamples.get(debugInputE) ?? [];
    value.push(Math.round(debugOptionsE));
    if (value.length > 300) {
      value.shift();
    }
    timingSamples.set(debugInputE, value);
    invalidateView("timing");
  }
  let documentHidden = () =>
      typeof document !== "undefined" &&
      document.visibilityState !== "visible",
    hiddenSince: number | undefined = documentHidden()
      ? Date.now()
      : undefined;
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", (): void => {
      hiddenSince = documentHidden() ? Date.now() : undefined;
      recordEvent("visibility", {
        state: document.visibilityState,
      });
    });
  }
  let roomTopic: string = "hotdbg-" + panelOptions.product,
    peerPings = readStored("pings", []),
    prunePeerPings = (): void => {
      peerPings = peerPings
        .filter((debugInputF): boolean => Date.now() - debugInputF.recvAt < 60000)
        .slice(-40);
      writeStored("pings", peerPings);
    };
  function receivePeerPing(debugInputG: unknown): void {
    let value = ((debugInputG as { data?: unknown } | null | undefined)?.data ??
      debugInputG) as Debug.DebugPeerWire | null;
    if (
      value === null ||
      typeof value !== "object" ||
      typeof value.tab !== "string" ||
      value.tab === tabId ||
      typeof value.n !== "number" ||
      typeof value.at !== "number"
    ) {
      return;
    }
    let state: Debug.DebugPeerPing = {
      tab: value.tab,
      n: value.n,
      phase: value.phase === "saved" ? "saved" : "saving",
      ...(typeof value.version === "string"
        ? {
            version: value.version,
          }
        : {}),
      at: value.at,
      recvAt: Date.now(),
      ...(Array.isArray(value.paths)
        ? {
            paths: value.paths as unknown[],
          }
        : {}),
    };
    peerPings.push(state);
    prunePeerPings();
    recordTiming(uiMessage("design-system.debugPanel.roomPing"), Math.max(0, state.recvAt - state.at));
    recordEvent("peer-" + state.phase, {
      from: state.tab,
      n: state.n,
      ...(state.version !== undefined
        ? {
            version: state.version,
          }
        : {}),
      ...(state.paths !== undefined
        ? {
            paths: state.paths,
          }
        : {}),
      skewedMs: state.recvAt - state.at,
    });
    refreshStatus();
  }
  let room: Debug.DebugRoom | null = null,
    usePresenceFallback: boolean = false;
  if (panelOptions.room !== false) {
    cachedClaudeRoom().then(
      (debugInputH): void => {
        room = debugInputH as Debug.DebugRoom | null;
        fields.set("room", room === null ? "off" : "connected");
        invalidateView("header");
        if (room === null) {
          return;
        }
        try {
          room.on?.(roomTopic, receivePeerPing, (): void => {
            return;
          });
        } catch {}
        let entries = new Map<string, number>();
        try {
          room.onPeers?.((debugInputI): void => {
            for (let value of debugInputI.peers) {
              let debugValue = value as Debug.DebugRoomPeer | null,
                debugState = debugValue?.presence?.hotdbg;
              if (
                debugValue === null ||
                debugValue.sameTab === true ||
                debugState === undefined ||
                typeof debugState.tab !== "string" ||
                typeof debugState.n !== "number"
              ) {
                continue;
              }
              let debugResult: string = debugState.tab + "/" + String(debugState.phase);
              if ((entries.get(debugResult) ?? -1) >= debugState.n) {
                continue;
              }
              entries.set(debugResult, debugState.n);
              if (
                !peerPings.some(
                  (debugInputJ) =>
                    debugInputJ.tab === debugState.tab &&
                    debugInputJ.n === debugState.n &&
                    debugInputJ.phase ===
                      (debugState.phase === "saved" ? "saved" : "saving"),
                )
              ) {
                receivePeerPing(debugState);
              }
            }
          });
        } catch {}
      },
      (): void => {
        return;
      },
    );
  }
  function sendPeerPing(debugInputK: Debug.DebugPingInput): void {
    let state: Debug.DebugPingSent = {
        tab: tabId,
        at: Date.now(),
        ...debugInputK,
      },
      value = room;
    if (value === null) {
      return;
    }
    let callback = (): void => {
      usePresenceFallback = true;
      try {
        value
          .presence?.({
            hotdbg: state,
          })
          ?.catch?.((): void => {
            return;
          });
      } catch {}
    };
    if (usePresenceFallback || typeof value.emit !== "function") {
      return callback();
    }
    try {
      value.emit(roomTopic, state).catch(callback);
    } catch {
      callback();
    }
  }
  let publishCount = readStored("saveN", 0),
    inFlightPublishes = new Map<number, Debug.DebugPublish>(),
    safeDebugValue = (debugInputL: unknown): unknown => {
      try {
        return JSON.parse(
          JSON.stringify(debugInputL, (debugInputM: string, items: unknown) =>
            typeof items === "string" && items.length > 300
              ? items.slice(0, 300) + "…"
              : items,
          ),
        );
      } catch {
        return String(debugInputL);
      }
    };
  function saveStart(debugInputN: string[], debugOptionsF: number): number {
    publishCount += 1;
    writeStored("saveN", publishCount);
    inFlightPublishes.set(publishCount, {
      t: clockNow(),
      paths: [...debugInputN],
      bytes: debugOptionsF,
    });
    writeStored("crumb", {
      phase: "publishing",
      paths: persistLog ? [...debugInputN] : [],
      at: Date.now(),
    });
    sendPeerPing({
      n: publishCount,
      phase: "saving",
      paths: [...debugInputN],
    });
    recordEvent("save-flush", {
      n: publishCount,
      paths: debugInputN,
      bytes: debugOptionsF,
    });
    invalidateView("queue");
    return publishCount;
  }
  function saveEnd(debugInputO: number, debugOptionsG: Debug.DebugPublishOutcome): void {
    let entry = inFlightPublishes.get(debugInputO);
    inFlightPublishes.delete(debugInputO);
    if (inFlightPublishes.size === 0) {
      writeStored("crumb", null);
    }
    let value = entry !== undefined ? clockNow() - entry.t : NaN;
    if (debugOptionsG.ok) {
      recordTiming(uiMessage("design-system.debugPanel.publishCall"), value);
      lastPublish = {
        n: debugInputO,
        ms: Math.round(value),
        ...(debugOptionsG.version !== undefined
          ? {
              version: debugOptionsG.version,
            }
          : {}),
        at: Date.now(),
      };
      if (debugOptionsG.version !== undefined) {
        fields.set("on version", debugOptionsG.version);
        for (let debugValueA of entry?.paths ?? []) {
          lastVersionByPath.set(debugValueA, debugOptionsG.version);
        }
        sendPeerPing({
          n: debugInputO,
          phase: "saved",
          version: debugOptionsG.version,
          ...(entry !== undefined
            ? {
                paths: entry.paths,
              }
            : {}),
        });
      }
      recordEvent("save-ok", {
        n: debugInputO,
        ms: Math.round(value),
        version: debugOptionsG.version,
      });
    } else {
      if (debugOptionsG.code === "conflict") {
        errorCounts.conflict += 1;
      } else if (debugOptionsG.code === "rate_limited") {
        errorCounts.rate += 1;
      } else {
        errorCounts.other += 1;
      }
      publishErrors.push({
        t: Date.now(),
        n: debugInputO,
        ...(debugOptionsG.code !== undefined
          ? {
              code: debugOptionsG.code,
            }
          : {}),
        ...(debugOptionsG.raw !== undefined
          ? {
              raw: safeDebugValue(debugOptionsG.raw),
            }
          : {}),
      });
      if (publishErrors.length > 30) {
        publishErrors.shift();
      }
      recordEvent(
        debugOptionsG.code === "conflict" ? "save-conflict" : "save-error",
        {
          n: debugInputO,
          ms: Math.round(value),
          code: debugOptionsG.code,
          ...(debugOptionsG.raw !== undefined
            ? {
                raw: safeDebugValue(debugOptionsG.raw),
              }
            : {}),
        },
      );
    }
    invalidateView("queue");
    invalidateView("header");
    refreshStatus();
  }
  function recordVisible(debugInputP: string, debugOptionsH: string): void {
    let value: number = Date.now(),
      debugValueB: boolean = hiddenSince !== undefined,
      debugStateA = peerPings.findIndex(
        (debugInputQ) => debugInputQ.phase === "saved" && debugInputQ.version === debugInputP,
      ),
      debugResultA =
        debugStateA >= 0
          ? peerPings[debugStateA].recvAt
          : debugOptionsH === "restarted"
            ? value
            : -1;
    if (debugResultA < 0) {
      return;
    }
    let debugData = peerPings.filter(
      (debugInputR): boolean => debugInputR.recvAt <= debugResultA,
    );
    peerPings = peerPings.filter((debugInputS): boolean => debugInputS.recvAt > debugResultA);
    prunePeerPings();
    let entries = new Map<string, Debug.DebugSavePairs>();
    for (let debugValueC of debugData) {
      let debugEntry: string = debugValueC.tab + "#" + String(debugValueC.n),
        debugValueD = entries.get(debugEntry) ?? {};
      debugValueD[debugValueC.phase] = debugValueC;
      entries.set(debugEntry, debugValueD);
    }
    for (let debugValueE of entries.values()) {
      let debugEntryA = debugValueE.saving ?? debugValueE.saved;
      if (debugEntryA === undefined) {
        continue;
      }
      if (debugValueB) {
        hiddenSamplesExcluded += 1;
        continue;
      }
      let debugValueF: number = value - debugEntryA.recvAt;
      recordTiming(
        debugOptionsH === "adopted"
          ? uiMessage("design-system.debugPanel.saveVisibleAdopted")
          : uiMessage("design-system.debugPanel.saveVisibleRestarted"),
        debugValueF,
      );
      visibilitySeries.push({
        how: debugOptionsH,
        ms: debugValueF,
      });
      if (visibilitySeries.length > 60) {
        visibilitySeries.shift();
      }
      if (debugValueE.saved !== undefined) {
        recordTiming("saved-ping → visible", value - debugValueE.saved.recvAt);
      }
    }
    recordEvent("visible", {
      version: debugInputP,
      how: debugOptionsH,
      saves: entries.size,
      hidden: debugValueB,
    });
    refreshStatus();
  }
  function recordHotEvent(debugInputT: Debug.DebugHotEvent): void {
    if (debugInputT.type === "update") {
      fields.set(
        "hot shape",
        debugInputT.shape === "calls" ? uiMessage("design-system.debugPanel.threeCalls") : uiMessage("design-system.debugPanel.stringVerdicts"),
      );
      fields.set(
        "live seen",
        debugInputT.to +
          (debugInputT.toSeq !== undefined ? " · seq " + String(debugInputT.toSeq) : ""),
      );
      if (debugInputT.decision === "adopt") {
        fields.set(
          "on version",
          debugInputT.to +
            (debugInputT.toSeq !== undefined
              ? " · seq " + String(debugInputT.toSeq)
              : ""),
        );
        lastUpdateRestarted = false;
      }
      if (debugInputT.decision === "restart") {
        lastUpdateRestarted = true;
      }
    }
    if (debugInputT.type === "restart") {
      lastUpdateRestarted = true;
    }
    if (debugInputT.type === "applied") {
      lastUpdateRestarted = false;
      if (debugInputT.grantLagMs !== undefined) {
        recordTiming(uiMessage("design-system.debugPanel.adoptFirst200GrantLag"), debugInputT.grantLagMs);
      }
      for (let value of debugInputT.paths ?? []) {
        lastVersionByPath.set(value, debugInputT.to);
      }
      invalidateView("files");
    }
    recordEvent("hot-" + debugInputT.type, debugInputT);
    invalidateView("header");
    refreshStatus();
  }
  function beforeRestart(debugInputU: string): void {
    writeStored("crumb", {
      phase: "hot-restart",
      reason: debugInputU,
      at: Date.now(),
    });
    recordEvent("restart-asked", {
      reason: debugInputU,
    });
    if (persistLog) {
      writeStored("log", eventLog.slice(-FILES_DEBUG_EVENT_STAGGER_MS));
    }
  }
  let bootPhases: Debug.DebugPhase[] = [];
  function recordPhase(debugInputV: string): void {
    let value: number = Math.round(clockNow() - bootStartedAt);
    bootPhases.push({
      name: debugInputV,
      ms: value,
    });
    if (debugInputV === "first artboard painted" || debugInputV === "first paint") {
      recordTiming(uiMessage("design-system.debugPanel.bootFirstPaint"), value);
    }
    if (debugInputV === "all painted") {
      recordTiming(uiMessage("design-system.debugPanel.bootAllPainted"), value);
    }
    recordEvent("boot-phase", {
      name: debugInputV,
      ms: value,
    });
    invalidateView("timing");
  }
  function recordRead(
    debugInputW: string,
    debugOptionsI: number,
    debugValueG: number,
    debugValueH?: boolean,
  ): void {
    recordEvent("read", {
      path: debugInputW,
      ms: Math.round(debugOptionsI),
      status: debugValueG,
      ...(debugValueH
        ? {
            fresh: true,
          }
        : {}),
    });
  }
  let storedUi = readStored("ui", {}),
    ui2: Debug.DebugPanelUi = {
      open: storedUi.open === true,
      side: storedUi.side === "right" ? "right" : "bottom",
      size: {
        ...FILES_DEBUG_PANEL_DEFAULT_SIZE,
        ...(storedUi.size ?? {}),
      },
      tab: storedUi.tab ?? "events",
      kinds: {
        hot: true,
        save: true,
        boot: true,
        room: true,
        error: true,
        other: true,
        ...(storedUi.kinds ?? {}),
      },
      text: typeof storedUi.text === "string" ? storedUi.text : "",
      paused: false,
    };
  if (storedUi.open === undefined && readStored("open", false)) {
    ui2.open = true;
  }
  let saveUi = () => writeStored("ui", ui2);
  persistLog = ui2.open;
  if (!persistLog) {
    writeStored("log", null);
  }
  let hostElement: HTMLDivElement | null = null,
    shadowRoot: ShadowRoot | null = null,
    themeElement: HTMLDivElement | null = null,
    chipElement: HTMLDivElement | null = null,
    panelElement: HTMLDivElement | null = null,
    panelBody: HTMLDivElement | null = null,
    eventListElement: HTMLDivElement | null = null,
    roomStyleElement: HTMLStyleElement | null = null,
    expandedEvents = new Set<Debug.DebugEvent>(),
    dirtyViews = new Set<string>(),
    paintFrame = 0,
    status = "ok";
  function refreshStatus(): void {
    let value: number = Date.now(),
      debugValueI =
        peerPings.some(
          (debugInputX) => debugInputX.phase === "saved" && value - debugInputX.recvAt < 15000,
        ) || publishErrors.some((debugInputY): boolean => value - debugInputY.t < 1e4),
      debugStateB: string = lastUpdateRestarted ? "bad" : debugValueI ? "behind" : "ok";
    if (debugStateB === status) {
      return;
    }
    status = debugStateB;
    if (chipElement) {
      chipElement.dataset.status = status;
    }
    invalidateView("header");
  }
  function invalidateView(debugInputZ: string): void {
    if (!ui2.open || shadowRoot === null) {
      return;
    }
    dirtyViews.add(debugInputZ);
    if (paintFrame !== 0 || typeof requestAnimationFrame !== "function") {
      return;
    }
    paintFrame = requestAnimationFrame((): void => {
      paintFrame = 0;
      paintDirtyViews();
    });
  }
  function paintDirtyViews(): void {
    if (!ui2.open || panelElement === null) {
      dirtyViews.clear();
      return;
    }
    if (dirtyViews.has("header")) {
      paintHeader();
    }
    let tab = ui2.tab;
    if (tab === "events" && dirtyViews.has("events") && !ui2.paused) {
      paintEvents();
    }
    if (tab === "timing" && dirtyViews.has("timing")) {
      paintActiveTab();
    }
    if (
      tab === "files" &&
      (dirtyViews.has("files") || dirtyViews.has("queue"))
    ) {
      paintActiveTab();
    }
    if (
      tab === "queue" &&
      (dirtyViews.has("queue") || dirtyViews.has("events"))
    ) {
      paintActiveTab();
    }
    dirtyViews.clear();
  }
  let resizePageForPanel = (
      side: Debug.DebugSide | null,
      debugOptionsJ: number,
    ): void => {
      if (typeof document === "undefined") {
        return;
      }
      if (roomStyleElement === null) {
        roomStyleElement = document.createElement("style");
        roomStyleElement.setAttribute("data-hot-debug-room", "");
        roomStyleElement.textContent =
          ":root{--hotdbg-b:0px;--hotdbg-r:0px}html[data-hotdbg-open] .h-screen{height:calc(100vh - var(--hotdbg-b))!important}html[data-hotdbg-open] .h-dvh{height:calc(100dvh - var(--hotdbg-b))!important}html[data-hotdbg-open] .w-screen{width:calc(100vw - var(--hotdbg-r))!important}";
        document.head.appendChild(roomStyleElement);
      }
      let documentElement = document.documentElement;
      if (side === null) {
        documentElement.removeAttribute("data-hotdbg-open");
      } else {
        documentElement.setAttribute("data-hotdbg-open", side);
      }
      documentElement.style.setProperty(
        "--hotdbg-b",
        side === "bottom" ? String(debugOptionsJ) + "px" : "0px",
      );
      documentElement.style.setProperty(
        "--hotdbg-r",
        side === "right" ? String(debugOptionsJ) + "px" : "0px",
      );
      try {
        window.dispatchEvent(new Event("resize"));
      } catch {}
    },
    makeRoom = panelOptions.makeRoom ?? resizePageForPanel,
    panelCss: string = `
    :host{all:initial}
    *{box-sizing:border-box}
    .t-dark{--bg:#17181a;--bg2:#1e2023;--fg:#e6e6e3;--mut:#8b9098;--line:#ffffff14;--acc:#6fcfb0;--warn:#f0b35a;--bad:#f07a7a;--sel:#ffffff0d}
    .t-light{--bg:#fbfaf7;--bg2:#f1efea;--fg:#1b1b19;--mut:#6d6f73;--line:#0000001a;--acc:#1f8f6d;--warn:#a96a00;--bad:#c23c3c;--sel:#0000000a}
    .chip{position:fixed;left:10px;bottom:10px;z-index:2147483001;display:flex;align-items:center;gap:6px;font:500 11px/1 system-ui,-apple-system,"Segoe UI",sans-serif;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:999px;padding:5px 9px;cursor:pointer;pointer-events:auto;user-select:none;box-shadow:0 1px 6px #0003}
    .chip[data-open="1"]{display:none}
    .dot{width:7px;height:7px;border-radius:50%;background:var(--acc);flex:none}
    [data-status="behind"] .dot{background:var(--warn)}
    [data-status="bad"] .dot{background:var(--bad)}
    .mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace}
    .panel{position:fixed;z-index:2147483000;background:var(--bg);color:var(--fg);font:12px/1.4 system-ui,-apple-system,"Segoe UI",sans-serif;pointer-events:auto;display:flex;flex-direction:column;outline:none}
    .panel.bottom{left:0;right:0;bottom:0;border-top:1px solid var(--line)}
    .panel.right{top:0;right:0;bottom:0;border-left:1px solid var(--line)}
    .grip{position:absolute;z-index:2}
    .bottom .grip{left:0;right:0;top:-3px;height:7px;cursor:ns-resize}
    .right .grip{top:0;bottom:0;left:-3px;width:7px;cursor:ew-resize}
    .grip:hover,.grip.on{background:color-mix(in srgb,var(--acc) 40%,transparent)}
    .shield{position:fixed;inset:0;z-index:2147483002;pointer-events:auto}
    .bar{display:flex;align-items:center;gap:10px;padding:0 8px;height:30px;flex:none;border-bottom:1px solid var(--line);white-space:nowrap;overflow:hidden}
    .bar .k{color:var(--mut);margin-right:-6px}
    .bar .sp{flex:1}
    .bar .v{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;overflow:hidden;text-overflow:ellipsis}
    .ib{all:unset;cursor:pointer;color:var(--mut);padding:3px 6px;border-radius:5px;font:inherit;flex:none}
    .ib:hover{color:var(--fg);background:var(--sel)}
    .tabs{display:flex;gap:2px;padding:0 6px;height:28px;flex:none;border-bottom:1px solid var(--line);align-items:stretch}
    .tab{all:unset;cursor:pointer;padding:0 9px;color:var(--mut);display:flex;align-items:center;border-bottom:2px solid transparent;font:inherit}
    .tab:hover{color:var(--fg)}
    .tab[aria-selected="true"]{color:var(--fg);border-bottom-color:var(--acc)}
    .body{flex:1;min-height:0;overflow:auto;padding:0}
    .tools{display:flex;align-items:center;gap:6px;padding:5px 8px;border-bottom:1px solid var(--line);position:sticky;top:0;background:var(--bg);z-index:1;flex-wrap:wrap}
    .fchip{all:unset;cursor:pointer;padding:1px 8px;border-radius:999px;color:var(--mut);border:1px solid var(--line);font-size:11px}
    .fchip[aria-pressed="true"]{color:var(--fg);background:var(--sel);border-color:transparent}
    input[type=text]{all:unset;flex:1;min-width:120px;padding:2px 8px;border:1px solid var(--line);border-radius:6px;font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--fg)}
    .row{display:grid;grid-template-columns:86px 120px 1fr;gap:8px;padding:2px 8px;cursor:default;align-items:baseline}
    .row:hover{background:var(--sel)}
    .row .t{color:var(--mut);font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
    .row .ty{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--acc);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .row.error .ty{color:var(--bad)} .row.warn .ty{color:var(--warn)}
    .row .s{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px}
    .raw{margin:0 8px 4px 102px;padding:6px 8px;background:var(--bg2);border-radius:6px;font:11px/1.35 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;word-break:break-word;user-select:text}
    .pad{padding:8px 10px}
    h4{margin:12px 0 4px;font:600 10px/1 system-ui,sans-serif;letter-spacing:.07em;text-transform:uppercase;color:var(--mut)}
    h4:first-child{margin-top:2px}
    table{border-collapse:collapse;width:100%;font-size:12px}
    th{color:var(--mut);font-weight:400;text-align:right;padding:2px 10px 2px 0}
    td{padding:2px 10px 2px 0;text-align:right;white-space:nowrap;font:11px ui-monospace,SFMono-Regular,Menlo,monospace}
    td:first-child,th:first-child{text-align:left;font-family:inherit;font-size:12px}
    table.l td,table.l th{text-align:left;white-space:normal}
    tr:hover td{background:var(--sel)}
    .wf{display:grid;grid-template-columns:minmax(120px,240px) 1fr 60px;gap:8px;align-items:center;padding:1px 0;font-size:12px}
    .wf .barx{height:8px;border-radius:2px;background:color-mix(in srgb,var(--acc) 65%,transparent)}
    .wf .ms{font:11px ui-monospace,monospace;color:var(--mut);text-align:right}
    .spark{display:flex;align-items:flex-end;gap:2px;height:44px;padding:2px 0}
    .spark i{display:block;width:6px;border-radius:1px;background:var(--acc)}
    .spark i.r{background:var(--bad)}
    .mut{color:var(--mut)}
    .st{display:inline-block;padding:0 6px;border-radius:999px;font-size:10px;background:var(--sel);margin-right:4px}
    .st.b{color:var(--bad)} .st.w{color:var(--warn)}
    label{display:block;padding:1px 0}
    textarea{width:100%;height:120px;background:var(--bg2);color:var(--fg);border:0;font:10px/1.3 ui-monospace,monospace;padding:6px}
  `,
    element = <Tag extends keyof HTMLElementTagNameMap>(
      tagName: Tag,
      debugOptionsK?: string,
      debugValueJ?: string,
    ): HTMLElementTagNameMap[Tag] => {
      let value = document.createElement(tagName);
      if (debugOptionsK !== undefined) {
        value.className = debugOptionsK;
      }
      if (debugValueJ !== undefined) {
        value.textContent = debugValueJ;
      }
      return value;
    },
    themeMode = () => {
      let value =
        document.documentElement.getAttribute("data-theme") ??
        document.documentElement.getAttribute("data-mode");
      if (value === "dark" || value === "light") {
        return value;
      }
      try {
        if (matchMedia("(prefers-color-scheme: dark)").matches) {
          return "dark";
        } else {
          return "light";
        }
      } catch {
        return "dark";
      }
    };
  function describeEvent(
    event: Debug.DebugEvent,
  ): Debug.DebugEventDescription {
    let value = (event.data ?? {}) as Debug.DebugEventData,
      callback = (debugValue: unknown): string | undefined => {
        try {
          return JSON.stringify(debugValue);
        } catch {
          return String(debugValue);
        }
      };
    switch (event.type) {
      case "hot-update": {
        let changed = value.changed as NonNullable<
            Debug.DebugEventData["changed"]
          > | null,
          debugValueK =
            changed === null
              ? "changed: null"
              : changed
                  .map(
                    (debugInput_): string =>
                      debugInput_.path +
                      (debugInput_.klass === "code" ? " [CODE]" : ""),
                  )
                  .join(", ");
        return {
          cls:
            value.decision === "restart"
              ? "error"
              : value.decision === "defer"
                ? "warn"
                : "",
          text: `${String(value.decision).toUpperCase()} · ${shortDebugValue(String(value.from))} → ${shortDebugValue(String(value.to))}${value.toSeq !== undefined ? " seq " + String(value.toSeq) : ""} · required ${String(value.required)} · ${debugValueK} · ${String(value.why ?? "")}${value.early === true ? " (early handler)" : ""}`,
        };
      }
      case "hot-fetch":
        return {
          cls: value.ok === true ? "" : "warn",
          text: `${String(value.path)} · try ${String(value.attempt)} → ${value.ok === true ? "200" : String(value.status ?? "failed")} at +${String(value.msAfterAdopt)} ms after adopt`,
        };
      case "hot-pending":
        return {
          cls: "warn",
          text: `still refused ${String(value.msAfterAdopt)} ms after adopt: old content stays, retrying slowly · ${callback(value.paths)}`,
        };
      case "hot-applied":
        return {
          cls: "",
          text: `${String(value.applied)}/${String(value.rows)} rows in ${String(value.ms)} ms · grant lag ${String(value.grantLagMs ?? "—")} ms · retries ${String(value.retries)} · ${callback(value.paths ?? [])}`,
        };
      case "hot-restart":
        return {
          cls: "error",
          text: `restart asked: ${String(value.reason)}${value.error !== undefined ? " · " + String(value.error) : ""}`,
        };
      case "hot-deferred":
        return {
          cls: "warn",
          text: `deferred (${String(value.reason)})`,
        };
      case "hot-reveal":
        return {
          cls: value.timedOut === true ? "warn" : "",
          text: `restarted realm shown after holding the reveal ${String(value.heldMs)} ms${value.timedOut === true ? " (the hold ran out before the editor painted)" : ""}${value.carried === true ? " · view carried" : ""}`,
        };
      case "reconcile": {
        let { regions: debugValueL, guard: debugStateC } = value,
          debugResultB = value.overlapList ?? [];
        return {
          cls:
            value.ok === true
              ? Number(value.overlaps) > 0
                ? "warn"
                : ""
              : "error",
          text: `${String(value.file)} · ${String(value.trigger)} · ${value.ok === true ? "FOLDED" : "NOT merged: " + String(value.why ?? "")}${debugValueL !== undefined ? ` · template ${debugValueL.template}, script ${debugValueL.script}, outer ${debugValueL.outer}` : ""} · ${String(value.applied)} of mine re-applied · ${String(value.overlaps)} overlaps${debugResultB.length > 0 ? " (" + debugResultB.map((eventValue): string => `${eventValue.name}: mine ${String(eventValue.to)} over theirs ${String(eventValue.theirs)}`).join("; ") + ")" : ""}${debugStateC !== undefined ? ` · same tree: theirs ${String(debugStateC.baseTheirs)}, mine ${String(debugStateC.baseMine)}` : ""} · ${String(value.ms)} ms`,
        };
      }
      case "reconcile-choice":
        return {
          cls: "",
          text: `${String(value.file)} · the person chose: ${String(value.choice)}`,
        };
      case "board-remote":
        return {
          cls: "",
          text: `${String(value.file)} · ${String(value.how)}${value.why !== undefined ? " · " + String(value.why) : ""}${value.ms !== undefined ? " · " + String(value.ms) + " ms" : ""}`,
        };
      case "save-flush":
        return {
          cls: "",
          text: `#${String(value.n)} ${callback(value.paths)} · ${String(value.bytes)} B`,
        };
      case "save-ok":
        return {
          cls: "",
          text: `#${String(value.n)} published in ${String(value.ms)} ms → ${shortDebugValue(String(value.version))}`,
        };
      case "save-conflict":
      case "save-error":
        return {
          cls: "error",
          text: `#${String(value.n)} ${String(value.code)} after ${String(value.ms)} ms · ${callback(value.raw ?? "")}`,
        };
      case "boot":
        return {
          cls: "",
          text: String(value.reason),
        };
      case "boot-phase":
        return {
          cls: "",
          text: `${String(value.name)} at +${String(value.ms)} ms`,
        };
      case "read":
        return {
          cls:
            Number(value.status) >= 400 || value.status === 0 ? "warn" : "",
          text: `${String(value.path)} · ${String(value.status)} in ${String(value.ms)} ms${value.fresh === true ? " (no-store)" : ""}`,
        };
      case "peer-saving":
      case "peer-saved":
        return {
          cls: "",
          text: `${String(value.from)} #${String(value.n)}${value.version !== undefined ? " → " + shortDebugValue(String(value.version)) : ""} ${callback(value.paths ?? [])}`,
        };
      default:
        return {
          cls: "",
          text: callback(value),
        };
    }
  }
  function paintHeader(): void {
    let value = panelElement?.querySelector(".bar");
    if (!value) {
      return;
    }
    value.setAttribute("data-status", status);
    let callback = (debugInputa: string, debugOptionsL: unknown): void => {
      let debugValueM = value.querySelector('[data-f="' + debugInputa + '"]');
      if (debugValueM && debugValueM.textContent !== debugOptionsL) {
        debugValueM.textContent = debugOptionsL as string;
      }
    };
    callback("tab", tabId);
    callback("ver", fields.get("on version") ?? "—");
    callback(
      "hot",
      hot === null ? "absent" : (fields.get("hot shape") ?? "present"),
    );
    callback(
      "status",
      status === "ok"
        ? uiMessage("design-system.debugPanel.levelWithLive")
        : status === "behind"
          ? uiMessage("design-system.debugPanel.behindLive")
          : uiMessage("design-system.debugPanel.lastUpdateRestarted"),
    );
  }
  function filteredEvents(): Debug.DebugEvent[] {
    let value = ui2.text.trim().toLowerCase(),
      items: Debug.DebugEvent[] = [];
    for (
      let debugValueN: number = eventLog.length - 1;
      debugValueN >= 0 && items.length < FILES_DEBUG_VIEW_REFRESH_MS;
      debugValueN--
    ) {
      let debugStateD = eventLog[debugValueN];
      if (!ui2.kinds[filesDebugEventLevel(debugStateD)]) {
        continue;
      }
      if (value !== "") {
        let type = debugStateD.type;
        try {
          type += " " + JSON.stringify(debugStateD.data ?? "");
        } catch {}
        if (!type.toLowerCase().includes(value)) {
          continue;
        }
      }
      items.push(debugStateD);
    }
    return items;
  }
  function paintEvents(): void {
    if (eventListElement === null) {
      return;
    }
    let value = filteredEvents(),
      debugValueO = document.createDocumentFragment();
    for (let debugStateE of value) {
      let debugResultC = describeEvent(debugStateE),
        debugDataA = filesDebugEventLevel(debugStateE),
        debugValueP = element(
          "div",
          uiMessage("design-system.debugPanel.row") + (debugDataA === "error" ? "error" : debugResultC.cls),
        );
      debugValueP.append(
        element("span", "t", formatFilesDebugTimestamp(debugStateE.t)),
        element("span", "ty", debugStateE.type),
        element("span", "s", debugResultC.text),
      );
      debugValueP.title = uiMessage("design-system.debugPanel.clickForTheRawEvent");
      debugValueP.addEventListener("click", (): void => {
        if (expandedEvents.has(debugStateE)) {
          expandedEvents.delete(debugStateE);
        } else {
          expandedEvents.add(debugStateE);
        }
        paintEvents();
      });
      debugValueO.append(debugValueP);
      if (expandedEvents.has(debugStateE)) {
        let text = "";
        try {
          text = JSON.stringify(debugStateE.data ?? {}, null, 1);
        } catch {
          text = String(debugStateE.data);
        }
        debugValueO.append(element("div", "raw", text));
      }
    }
    if (value.length === 0) {
      debugValueO.append(
        element(
          "div",
          "pad mut",
          eventLog.length === 0
            ? uiMessage("design-system.debugPanel.nothingLoggedYet")
            : uiMessage("design-system.debugPanel.noEventMatchesTheFilters"),
        ),
      );
    }
    eventListElement.replaceChildren(debugValueO);
  }
  function table(
    debugInputb: readonly string[],
    debugOptionsM: readonly (readonly unknown[])[],
    debugValueQ?: string,
  ): HTMLTableElement {
    let value = element("table", debugValueQ);
    if (debugInputb.some((debugInputc): boolean => debugInputc !== "")) {
      let debugValueR = element("tr");
      for (let debugStateF of debugInputb) {
        debugValueR.append(element("th", undefined, debugStateF));
      }
      value.append(debugValueR);
    }
    for (let debugValueS of debugOptionsM) {
      let debugStateG = element("tr");
      for (let debugResultD of debugValueS) {
        debugStateG.append(element("td", undefined, String(debugResultD)));
      }
      value.append(debugStateG);
    }
    return value;
  }
  function paintActiveTab(): void {
    if (panelBody === null) {
      return;
    }
    let value = panelBody;
    eventListElement = null;
    value.replaceChildren();
    if (ui2.tab === "events") {
      let debugStateH = element("div", "tools");
      for (let debugValueT of [
        "hot",
        "save",
        "boot",
        "room",
        "error",
        "other",
      ] as const) {
        let debugEntryB = element("button", "fchip", debugValueT);
        debugEntryB.setAttribute("aria-pressed", String(ui2.kinds[debugValueT]));
        debugEntryB.addEventListener("click", (): void => {
          ui2.kinds[debugValueT] = !ui2.kinds[debugValueT];
          debugEntryB.setAttribute("aria-pressed", String(ui2.kinds[debugValueT]));
          saveUi();
          paintEvents();
        });
        debugStateH.append(debugEntryB);
      }
      let debugResultE = element("input");
      debugResultE.type = "text";
      debugResultE.placeholder = uiMessage("design-system.debugPanel.filterPathVersionReason");
      debugResultE.value = ui2.text;
      debugResultE.addEventListener("input", (): void => {
        ui2.text = debugResultE.value;
        saveUi();
        paintEvents();
      });
      let debugDataB = element("button", "fchip", ui2.paused ? "paused" : "live");
      debugDataB.setAttribute("aria-pressed", String(!ui2.paused));
      debugDataB.title = uiMessage("design-system.debugPanel.pauseTheListEventsKeep");
      debugDataB.addEventListener("click", (): void => {
        ui2.paused = !ui2.paused;
        debugDataB.textContent = ui2.paused ? "paused" : "live";
        debugDataB.setAttribute("aria-pressed", String(!ui2.paused));
        if (!ui2.paused) {
          paintEvents();
        }
      });
      debugStateH.append(
        debugResultE,
        debugDataB,
        element(
          "span",
          "mut",
          `newest first · ${String(FILES_DEBUG_VIEW_REFRESH_MS)} drawn at most · ${String(FILES_DEBUG_REFRESH_MS)} kept`,
        ),
      );
      eventListElement = element("div");
      value.append(debugStateH, eventListElement);
      paintEvents();
      return;
    }
    let debugValueU = element("div", "pad");
    value.append(debugValueU);
    if (ui2.tab === "timing") {
      debugValueU.append(element("h4", undefined, uiMessage("design-system.debugPanel.timingMs")));
      let debugStateI = [...timingSamples.entries()].map(([debugInputd, debugInpute]) => {
        let debugEntryC = [...debugInpute].sort(
          (debugInputf, debugOptionsN) => debugInputf - debugOptionsN,
        );
        return [
          debugInputd,
          sortedSampleQuantile(debugEntryC, 0.5),
          sortedSampleQuantile(debugEntryC, 0.95),
          debugEntryC[debugEntryC.length - 1],
          debugEntryC.length,
        ];
      });
      debugValueU.append(
        debugStateI.length > 0
          ? table(["", "p50", "p95", "max", "n"], debugStateI)
          : element(
              "div",
              "mut",
              uiMessage("design-system.debugPanel.noSamplesYetSaveIn"),
            ),
      );
      if (hiddenSamplesExcluded > 0) {
        debugValueU.append(
          element(
            "div",
            "mut",
            `${String(hiddenSamplesExcluded)} samples taken while this tab was hidden were left out.`,
          ),
        );
      }
      debugValueU.append(
        element(
          "h4",
          undefined,
          uiMessage("design-system.debugPanel.saveVisibleNewestOnThe"),
        ),
      );
      let debugResultF = element("div", "spark"),
        debugDataC: number = Math.max(
          1,
          ...visibilitySeries.map((debugInputg) => debugInputg.ms),
        );
      for (let debugEntryD of visibilitySeries) {
        let debugValueV = element("i", debugEntryD.how === "restarted" ? "r" : "");
        debugValueV.style.height =
          String(Math.max(2, Math.round((debugEntryD.ms / debugDataC) * 40))) + "px";
        debugValueV.title = debugEntryD.how + " · " + String(debugEntryD.ms) + " ms";
        debugResultF.append(debugValueV);
      }
      debugValueU.append(
        visibilitySeries.length > 0 ? debugResultF : element("div", "mut", "—"),
      );
      debugValueU.append(element("h4", undefined, "boot, from the entry module"));
      let debugValueW: number = Math.max(
        1,
        ...bootPhases.map((debugInputh) => debugInputh.ms),
      );
      for (let debugEntryE of bootPhases) {
        let debugValueX = element("div", "wf"),
          debugValueY = element("div"),
          debugValueZ = element("div", "barx");
        debugValueZ.style.width =
          String(Math.max(1, Math.round((debugEntryE.ms / debugValueW) * 100))) + "%";
        debugValueY.append(debugValueZ);
        debugValueX.append(
          element("span", undefined, debugEntryE.name),
          debugValueY,
          element("span", "ms", "+" + String(debugEntryE.ms)),
        );
        debugValueU.append(debugValueX);
      }
      if (bootPhases.length === 0) {
        debugValueU.append(element("div", "mut", "—"));
      }
      if (debugOptions.size > 0) {
        debugValueU.append(element("h4", undefined, "options"));
        for (let [debugEntryF, tabOptions] of debugOptions) {
          let labelElement = element("label"),
            checkbox = element("input");
          checkbox.type = "checkbox";
          checkbox.checked = tabOptions.on;
          checkbox.addEventListener("change", (): void => {
            tabOptions.on = checkbox.checked;
            writeStored("opt/" + debugEntryF, tabOptions.on);
            recordEvent("option", {
              key: debugEntryF,
              on: tabOptions.on,
            });
          });
          labelElement.append(checkbox, document.createTextNode(" " + tabOptions.label));
          debugValueU.append(labelElement);
        }
      }
      return;
    }
    if (ui2.tab === "files") {
      let items: Core.DebugFileRow[] = [];
      try {
        items = providers.files?.() ?? [];
      } catch {
        items = [];
      }
      debugValueU.append(
        element(
          "h4",
          undefined,
          `files this tab knows · ${String(items.length)}`,
        ),
      );
      if (items.length === 0) {
        debugValueU.append(
          element(
            "div",
            "mut",
            providers.files === undefined
              ? uiMessage("design-system.debugPanel.thisEditorDidNotProvide")
              : uiMessage("design-system.debugPanel.noFiles"),
          ),
        );
        return;
      }
      let debugStateJ = element("table", "l"),
        debugResultG = element("tr");
      for (let debugDataD of [
        "path",
        "state",
        uiMessage("design-system.debugPanel.onScreen"),
        "live",
        "size",
        uiMessage("design-system.debugPanel.lastChangedAt"),
      ]) {
        debugResultG.append(element("th", undefined, debugDataD));
      }
      debugStateJ.append(debugResultG);
      for (let debugDataE of [...items].sort((debugInputi, debugOptionsO): number =>
        debugInputi.path < debugOptionsO.path ? -1 : 1,
      )) {
        let rowElement = element("tr"),
          debugEntryG = element("td");
        for (let debugValue_ of (debugDataE.state ?? "").split(" ").filter(Boolean)) {
          debugEntryG.append(
            element(
              "span",
              "st" +
                (debugValue_ === "conflicted"
                  ? " b"
                  : debugValue_ === "behind" || debugValue_ === "held"
                    ? " w"
                    : ""),
              debugValue_,
            ),
          );
        }
        rowElement.append(
          element("td", undefined, debugDataE.path),
          debugEntryG,
          element("td", undefined, (debugDataE.sha ?? "—").slice(0, 10)),
          element(
            "td",
            undefined,
            debugDataE.liveSha === undefined
              ? ""
              : (debugDataE.liveSha ?? "removed").slice(0, 10),
          ),
          element(
            "td",
            undefined,
            debugDataE.size !== undefined ? String(debugDataE.size) : "",
          ),
          element(
            "td",
            undefined,
            shortDebugValue(lastVersionByPath.get(debugDataE.path)),
          ),
        );
        debugStateJ.append(rowElement);
      }
      debugValueU.append(debugStateJ);
      return;
    }
    if (ui2.tab === "queue") {
      let debugStateK: Core.DebugQueueView | undefined;
      try {
        debugStateK = providers.queue?.();
      } catch {
        debugStateK = undefined;
      }
      debugValueU.append(element("h4", undefined, "now"));
      debugValueU.append(
        table(
          ["", ""],
          [
            [
              "dirty",
              debugStateK === undefined
                ? "(not provided)"
                : debugStateK.dirty.length === 0
                  ? "none"
                  : debugStateK.dirty.join(", "),
            ],
            [
              uiMessage("design-system.debugPanel.inFlight"),
              inFlightPublishes.size > 0
                ? [...inFlightPublishes.values()]
                    .map((debugInputj) => debugInputj.paths.join(", "))
                    .join(" | ")
                : debugStateK?.inFlight === true
                  ? "yes"
                  : "no",
            ],
            [
              "conflicted",
              debugStateK?.conflicted !== undefined && debugStateK.conflicted.length > 0
                ? debugStateK.conflicted.join(", ")
                : "none",
            ],
            [
              uiMessage("design-system.debugPanel.lastPublish"),
              lastPublish === undefined
                ? "—"
                : `#${String(lastPublish.n)} · ${String(lastPublish.ms)} ms → ${shortDebugValue(lastPublish.version)} · ${formatFilesDebugTimestamp(lastPublish.at)}`,
            ],
            [uiMessage("design-system.debugPanel.queueSays"), debugStateK?.lastError ?? "ok"],
            ["publishes", String(publishCount)],
            [
              "errors",
              `409 conflict ×${String(errorCounts.conflict)} · 429 rate limit ×${String(errorCounts.rate)} · other ×${String(errorCounts.other)}`,
            ],
            [
              "catch-up waits",
              debugStateK?.note ??
                uiMessage("design-system.debugPanel.thisEditorDoesNotWait"),
            ],
          ],
          "l",
        ),
      );
      debugValueU.append(element("h4", undefined, uiMessage("design-system.debugPanel.publishErrorsNewestFirst")));
      if (publishErrors.length === 0) {
        debugValueU.append(element("div", "mut", "none"));
      }
      for (let debugResultH of [...publishErrors].reverse()) {
        let text = "";
        try {
          text = JSON.stringify(debugResultH.raw ?? {}, null, 1);
        } catch {
          text = String(debugResultH.raw);
        }
        let debugDataF = element("div", "raw", text);
        debugDataF.style.marginLeft = "0";
        debugValueU.append(
          element(
            "div",
            "mut",
            `${formatFilesDebugTimestamp(debugResultH.t)} · #${String(debugResultH.n)} · ${String(debugResultH.code)}`,
          ),
          debugDataF,
        );
      }
      return;
    }
    debugValueU.append(element("h4", undefined, uiMessage("design-system.debugPanel.thisTabLastLoadedBecause")));
    debugValueU.append(element("div", undefined, reloadReason));
    debugValueU.append(element("h4", undefined, uiMessage("design-system.debugPanel.countsByReason")));
    debugValueU.append(
      table(
        ["reason", "times"],
        Object.entries(reasonCounts)
          .sort((debugInputk, debugOptionsP) => debugOptionsP[1] - debugInputk[1])
          .map(([debugInputl, debugInputm]) => [debugInputl, debugInputm]),
      ),
    );
    debugValueU.append(element("h4", undefined, "history, newest first"));
    debugValueU.append(
      table(
        ["when", "reason"],
        [...reloadHistory]
          .reverse()
          .map((debugInputn) => [formatFilesDebugTimestamp(debugInputn.t), debugInputn.reason]),
        "l",
      ),
    );
  }
  function clampPanelSize(debugInputo: Debug.DebugSide, debugOptionsQ: number): number {
    let value: number = Math.round(
      (debugInputo === "bottom" ? window.innerHeight : window.innerWidth) * 0.8,
    );
    return Math.max(
      FILES_DEBUG_PANEL_MIN_SIZE[debugInputo],
      Math.min(value, Math.round(debugOptionsQ)),
    );
  }
  function applyPanelLayout(): void {
    if (panelElement === null || themeElement === null) {
      return;
    }
    themeElement.className = "t-" + themeMode();
    panelElement.className = uiMessage("design-system.debugPanel.panel") + ui2.side;
    let value = clampPanelSize(ui2.side, ui2.size[ui2.side]);
    if (ui2.side === "bottom") {
      panelElement.style.height = String(value) + "px";
      panelElement.style.width = "";
    } else {
      panelElement.style.width = String(value) + "px";
      panelElement.style.height = "";
    }
    makeRoom(ui2.open ? ui2.side : null, ui2.open ? value : 0);
  }
  function paintTabs(): void {
    panelElement
      ?.querySelectorAll(".tab")
      .forEach((tabElement) =>
        tabElement.setAttribute(
          "aria-selected",
          String(tabElement.getAttribute("data-tab") === ui2.tab),
        ),
      );
  }
  function setOpen(debugInputp: boolean): void {
    ui2.open = debugInputp;
    persistLog = debugInputp;
    if (debugInputp) {
      schedulePersistLog();
    } else {
      writeStored("log", null);
    }
    saveUi();
    if (chipElement) {
      chipElement.dataset.open = debugInputp ? "1" : "0";
    }
    if (panelElement) {
      panelElement.style.display = debugInputp ? "flex" : "none";
    }
    if (debugInputp) {
      applyPanelLayout();
      paintHeader();
      paintTabs();
      paintActiveTab();
    } else {
      makeRoom(null, 0);
    }
  }
  function buildPanel(): void {
    if (shadowRoot === null) {
      return;
    }
    themeElement = element("div", "t-" + themeMode());
    let value = themeElement;
    chipElement = element("div", "chip");
    chipElement.dataset.status = status;
    chipElement.dataset.open = "0";
    chipElement.title =
      "hot-reload debug panel (" + FILES_DEBUG_TOGGLE_SHORTCUT + ")";
    chipElement.append(
      element("span", "dot"),
      element("span", undefined, "hot"),
      element("span", "mono", tabId),
    );
    chipElement.addEventListener("click", () => setOpen(true));
    panelElement = element("div", uiMessage("design-system.debugPanel.panel") + ui2.side);
    panelElement.style.display = "none";
    panelElement.tabIndex = -1;
    let debugValuea = element("div", "grip");
    debugValuea.title = uiMessage("design-system.debugPanel.dragToResizeDoubleClick");
    debugValuea.addEventListener("dblclick", (): void => {
      ui2.size[ui2.side] = FILES_DEBUG_PANEL_DEFAULT_SIZE[ui2.side];
      saveUi();
      applyPanelLayout();
    });
    debugValuea.addEventListener("pointerdown", (event): void => {
      event.preventDefault();
      debugValuea.classList.add("on");
      let debugValueb = element("div", "shield");
      debugValueb.style.cursor = ui2.side === "bottom" ? "ns-resize" : "ew-resize";
      value.append(debugValueb);
      let debugHandler = (debugInputq: PointerEvent): void => {
          ui2.size[ui2.side] = clampPanelSize(
            ui2.side,
            ui2.side === "bottom"
              ? window.innerHeight - debugInputq.clientY
              : window.innerWidth - debugInputq.clientX,
          );
          applyPanelLayout();
        },
        debugHandlerA = (): void => {
          debugValueb.remove();
          debugValuea.classList.remove("on");
          window.removeEventListener("pointermove", debugHandler, true);
          window.removeEventListener("pointerup", debugHandlerA, true);
          window.removeEventListener("pointercancel", debugHandlerA, true);
          saveUi();
        };
      window.addEventListener("pointermove", debugHandler, true);
      window.addEventListener("pointerup", debugHandlerA, true);
      window.addEventListener("pointercancel", debugHandlerA, true);
    });
    let debugStateL = element("div", "bar");
    debugStateL.setAttribute("data-status", status);
    let callback = (debugInputr: string, debugOptionsR: string): void => {
      debugStateL.append(element("span", "k", debugInputr));
      let debugValuec = element("span", "v");
      debugValuec.setAttribute("data-f", debugOptionsR);
      debugStateL.append(debugValuec);
    };
    debugStateL.append(element("span", "dot"));
    let debugResultI = element("span");
    debugResultI.setAttribute("data-f", "status");
    debugStateL.append(debugResultI);
    callback("tab", "tab");
    callback("version", "ver");
    // MineDesign: the host global is designSystemHost, not claude.
    callback("designSystemHost.hot", "hot");
    debugStateL.append(element("span", "sp"));
    let debugHandlerB = (
      debugInputs: string,
      debugOptionsS: string,
      debugValued: EventListener,
    ): void => {
      let debugValuee = element("button", "ib", debugInputs);
      debugValuee.title = debugOptionsS;
      debugValuee.addEventListener("click", debugValued);
      debugStateL.append(debugValuee);
    };
    debugHandlerB(
      uiMessage("design-system.debugPanel.dock"),
      uiMessage("design-system.debugPanel.dockToTheOtherSide"),
      (): void => {
        ui2.side = ui2.side === "bottom" ? "right" : "bottom";
        saveUi();
        applyPanelLayout();
      },
    );
    debugHandlerB("clear", uiMessage("design-system.debugPanel.clearTheLog"), (): void => {
      eventLog.length = 0;
      expandedEvents.clear();
      writeStored("log", eventLog);
      paintActiveTab();
    });
    debugHandlerB(uiMessage("design-system.debugPanel.copyLog"), uiMessage("design-system.debugPanel.copyTheWholeLogAs"), (): void => {
      let debugValuef = exportJson(),
        flag: boolean = false;
      try {
        navigator.clipboard?.writeText(debugValuef).then(
          (): void => {
            flag = true;
          },
          (): void => {
            return;
          },
        );
      } catch {}
      setTimeout((): void => {
        if (flag || panelBody === null) {
          return;
        }
        panelBody.querySelector("textarea")?.remove();
        let debugValueg = element("textarea");
        debugValueg.readOnly = true;
        debugValueg.value = debugValuef;
        panelBody.prepend(debugValueg);
      }, 200);
    });
    debugHandlerB(
      "✕",
      uiMessage("design-system.debugPanel.closeEscWhileThePanel") +
        FILES_DEBUG_TOGGLE_SHORTCUT +
        ")",
      () => setOpen(false),
    );
    let debugDataG = element("div", "tabs");
    for (let [debugValueh, debugValuei] of [
      ["events", "Events"],
      ["timing", "Timing"],
      ["files", "Files"],
      ["queue", uiMessage("design-system.debugPanel.saveQueue")],
      ["reloads", "Reloads"],
    ]) {
      let debugValuej = element("button", "tab", debugValuei);
      debugValuej.setAttribute("data-tab", debugValueh);
      debugValuej.addEventListener("click", (): void => {
        ui2.tab = debugValueh;
        saveUi();
        paintTabs();
        paintActiveTab();
      });
      debugDataG.append(debugValuej);
    }
    panelBody = element("div", "body");
    panelElement.append(debugValuea, debugStateL, debugDataG, panelBody);
    panelElement.addEventListener("keydown", (debugInputt): void => {
      if (debugInputt.key === "Escape") {
        debugInputt.stopPropagation();
        setOpen(false);
      }
    });
    value.append(chipElement, panelElement);
    let debugValuek = element("style");
    debugValuek.textContent = panelCss;
    shadowRoot.replaceChildren(debugValuek, value);
    if (ui2.open) {
      setOpen(true);
    }
    try {
      new MutationObserver((): void => {
        if (themeElement) {
          themeElement.className = "t-" + themeMode();
        }
      }).observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "data-mode"],
      });
    } catch {}
    let { innerWidth: debugEntryH, innerHeight: debugValuel } = window;
    window.addEventListener("resize", (): void => {
      if (
        !ui2.open ||
        (window.innerWidth === debugEntryH && window.innerHeight === debugValuel)
      ) {
        return;
      }
      debugEntryH = window.innerWidth;
      debugValuel = window.innerHeight;
      applyPanelLayout();
    });
    setInterval(refreshStatus, 3000);
  }
  function exportJson(): string {
    let state: Record<string, Debug.DebugQuantiles> = {};
    for (let [debugStateM, debugResultJ] of timingSamples) {
      let debugDataH = [...debugResultJ].sort((debugInputu, debugOptionsT) => debugInputu - debugOptionsT);
      state[debugStateM] = {
        p50: sortedSampleQuantile(debugDataH, 0.5),
        p95: sortedSampleQuantile(debugDataH, 0.95),
        max: debugDataH[debugDataH.length - 1],
        n: debugDataH.length,
      };
    }
    let value: Core.DebugFileRow[] | undefined,
      debugValuem: Core.DebugQueueView | undefined;
    try {
      value = providers.files?.();
    } catch {}
    try {
      debugValuem = providers.queue?.();
    } catch {}
    return JSON.stringify(
      {
        tab: tabId,
        reloadReason: reloadReason,
        reasons: reasonCounts,
        reloads: reloadHistory,
        fields: Object.fromEntries(fields),
        stats: state,
        excludedHidden: hiddenSamplesExcluded,
        phases: bootPhases,
        counters: errorCounts,
        publishErrors: publishErrors,
        series: visibilitySeries,
        files: value,
        queue: debugValuem,
        log: eventLog,
      },
      null,
      1,
    );
  }
  let eventGuardsInstalled: boolean = false;
  function installEventGuards(): void {
    if (eventGuardsInstalled || typeof window === "undefined") {
      return;
    }
    eventGuardsInstalled = true;
    let callback = (debugInputv: Event) => {
      try {
        return (
          panelElement !== null && debugInputv.composedPath().includes(panelElement)
        );
      } catch {
        return false;
      }
    };
    window.addEventListener(
      "keydown",
      (event): void => {
        if (
          event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          (event.key === "`" || event.code === "Backquote")
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          setOpen(!ui2.open);
          return;
        }
        if (!callback(event)) {
          return;
        }
        event.stopImmediatePropagation();
        if (event.key === "Escape") {
          setOpen(false);
        }
      },
      true,
    );
    for (let value of [
      "keyup",
      "keypress",
      "copy",
      "cut",
      "paste",
      "wheel",
      "contextmenu",
    ]) {
      window.addEventListener(
        value,
        (debugInputw): void => {
          if (callback(debugInputw)) {
            debugInputw.stopImmediatePropagation();
          }
        },
        true,
      );
    }
  }
  function mount(debugInputx: string): void {
    if (
      debugInputx !== "files" ||
      typeof document === "undefined" ||
      hostElement !== null
    ) {
      return;
    }
    installEventGuards();
    let callback = (): void => {
      if (hostElement !== null) {
        return;
      }
      hostElement = document.createElement("div");
      hostElement.setAttribute("data-hot-debug", "");
      hostElement.style.cssText =
        "position:fixed;left:0;top:0;width:0;height:0;z-index:2147483000;pointer-events:none";
      shadowRoot = hostElement.attachShadow({
        mode: "open",
      });
      (document.body ?? document.documentElement).appendChild(hostElement);
      buildPanel();
    };
    if (document.body !== null) {
      callback();
    } else {
      document.addEventListener("DOMContentLoaded", callback, {
        once: true,
      });
    }
  }
  recordEvent("boot", {
    reason: reloadReason,
    viaHot: cameFromHotRestart,
    ...(hotFrom !== undefined && hotFrom !== null
      ? {
          hotFrom: hotFrom,
        }
      : {}),
    ...(restartBreadcrumb !== null
      ? {
          crumb: restartBreadcrumb,
        }
      : {}),
  });
  return {
    tab: tabId,
    reloadReason: reloadReason,
    field(debugInputy: string, debugOptionsU: unknown): void {
      fields.set(debugInputy, debugOptionsU);
      invalidateView("header");
    },
    event: recordEvent,
    hotEvent: recordHotEvent,
    beforeRestart: beforeRestart,
    saveStart: saveStart,
    saveEnd: saveEnd,
    phase: recordPhase,
    read: recordRead,
    visible: recordVisible,
    sample: recordTiming,
    mount: mount,
    exportJson: exportJson,
    option: option,
    provide(debugInputz: Core.DebugProviders): void {
      providers = {
        ...providers,
        ...debugInputz,
      };
      invalidateView("files");
      invalidateView("queue");
    },
  };
}
function instrumentFilesPort<Port extends Model.BrowserFilesPort>(
  port: Port,
  debug: Core.FilesDebugger,
): Port {
  let value: Port = Object.create(port);
  value.publish = async (
    fileEntries: Model.FilePublishEntries,
    debugOptionsV?: Model.FilePublishPreconditions,
  ): Promise<Model.FilePublishResult> => {
    let debugValuen: number | undefined;
    try {
      debugValuen = debug.saveStart(
        Object.keys(fileEntries),
        Object.values(fileEntries).reduce(
          (total, debugOptionsW) =>
            total + filePublishEncodedBytes(debugOptionsW),
          0,
        ),
      );
    } catch {}
    let debugStateN = await port.publish(fileEntries, debugOptionsV);
    try {
      if (debugValuen !== undefined) {
        debug.saveEnd(
          debugValuen,
          debugStateN.ok
            ? {
                ok: true,
                version: debugStateN.version,
              }
            : {
                ok: false,
                code: debugStateN.code,
                raw: debugStateN,
              },
        );
      }
    } catch {}
    return debugStateN;
  };
  return value;
}
function createNoopFilesDebugger(): Core.FilesDebugger {
  let callback = (): void => {
    return;
  };
  return {
    tab: "",
    reloadReason: "",
    field: callback,
    event: callback,
    hotEvent: callback,
    beforeRestart: callback,
    saveStart: (): number => 0,
    saveEnd: callback,
    phase: callback,
    read: callback,
    visible: callback,
    sample: callback,
    mount: callback,
    exportJson: (): string => "{}",
    option: () => (): boolean => true,
    provide: callback,
  };
}
function createFilesDebugger(
  debugOptionsX: Core.FilesDebuggerOptions,
): Core.FilesDebugger {
  if (filesDebugEnabled()) {
    return createFilesDebugPanel(debugOptionsX);
  } else {
    return createNoopFilesDebugger();
  }
}
export {
  createFilesDebugger,
  createFilesDebugPanel,
  createFilesDebugTabId,
  createNoopFilesDebugger,
  FILES_DEBUG_EVENT_STAGGER_MS,
  FILES_DEBUG_PANEL_DEFAULT_SIZE,
  FILES_DEBUG_PANEL_MIN_SIZE,
  FILES_DEBUG_REFRESH_MS,
  FILES_DEBUG_TOGGLE_SHORTCUT,
  FILES_DEBUG_VIEW_REFRESH_MS,
  filesDebugEnabled,
  filesDebugEventLevel,
  filesModeDebugEnabled,
  formatFilesDebugTimestamp,
  instrumentFilesPort,
  shortDebugValue,
  sortedSampleQuantile,
};
export function installFilesDebugPanel(): () => void {
  return () => {
    FILES_DEBUG_REFRESH_MS = 1500;
    FILES_DEBUG_EVENT_STAGGER_MS = 150;
    FILES_DEBUG_VIEW_REFRESH_MS = 250;
    FILES_DEBUG_PANEL_DEFAULT_SIZE = {
      bottom: 300,
      right: 440,
    };
    FILES_DEBUG_PANEL_MIN_SIZE = {
      bottom: 140,
      right: 300,
    };
    FILES_DEBUG_TOGGLE_SHORTCUT = "Ctrl+`";
    createFilesDebugTabId = () => Math.random().toString(36).slice(2, 6);
    formatFilesDebugTimestamp = (timestamp: number) =>
      new Date(timestamp).toISOString().slice(11, 23);
    shortDebugValue = (items: string | null | undefined) =>
      items === undefined || items === null || items === ""
        ? "—"
        : items.length > 18
          ? items.slice(0, 10) + "…" + items.slice(-4)
          : items;
  };
}
