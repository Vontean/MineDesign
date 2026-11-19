/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { cachedRoomCapability } from "./file-content";
import { HOT_EDIT_RESTART_CATEGORIES } from "./save-notices";

var FILES_DEBUG_STORAGE_KEY: Dynamic;
var MAX_RETAINED_EVENTS: Dynamic;
var MAX_PERSISTED_EVENTS: Dynamic;
var MAX_VISIBLE_EVENTS: Dynamic;
var HOT_DEBUG_PANEL_SIZE: Dynamic;
var HOT_DEBUG_MIN_PANEL_SIZE: Dynamic;
var HOT_DEBUG_SHORTCUT: Dynamic;
var createHotDebugTabId: Dynamic;
var formatHotDebugTimestamp: Dynamic;
var abbreviateHotDebugValue: Dynamic;
function classifyHotEditMetric(editEvent?: Dynamic): Dynamic {
  if (editEvent.type === "applied")
    return editEvent.applied > 0 ? ["edit", "success"] : null;
  if (editEvent.type !== "restart") return null;
  let failureCategory: Dynamic = HOT_EDIT_RESTART_CATEGORIES[editEvent.reason];
  return failureCategory === null ? null : ["edit", "failure", failureCategory];
}
function isFilesDebugEnabled(
  getStorage: Dynamic = (): Dynamic => (globalThis as Dynamic).localStorage,
): Dynamic {
  try {
    return getStorage()?.getItem(FILES_DEBUG_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}
function quantile(sortedValues?: Dynamic, ratio?: Dynamic): Dynamic {
  return sortedValues.length === 0
    ? NaN
    : sortedValues[
        Math.min(
          sortedValues.length - 1,
          Math.floor((sortedValues.length - 1) * ratio + 0.5),
        )
      ];
}
function classifyHotDebugEvent(event?: Dynamic): Dynamic {
  let type: Dynamic = event.type;
  if (
    type === "hot-restart" ||
    type === "save-conflict" ||
    type === "save-error" ||
    type === "publish-raw-error" ||
    type === "restart-asked"
  )
    return "error";
  if (type === "read") {
    let status: Dynamic = event.data?.status ?? 200;
    return status === 0 || status >= 400 ? "error" : "boot";
  }
  return type === "reconcile"
    ? event.data?.ok === false
      ? "error"
      : "hot"
    : type.startsWith("hot-") ||
        type === "apply" ||
        type === "visible" ||
        type === "board-remote" ||
        type === "reveal-held" ||
        type === "reconcile-choice"
      ? "hot"
      : type.startsWith("save-") || type === "notice"
        ? "save"
        : type.startsWith("boot") || type === "listing-retried"
          ? "boot"
          : type.startsWith("peer-") || type === "visibility"
            ? "room"
            : "other";
}
function createHotReloadDebugger(debugOptions?: Dynamic): Dynamic {
  let storagePrefix: Dynamic = "hotdbg/" + debugOptions.product + "/",
    storage: Dynamic = ((): Dynamic => {
      try {
        return typeof sessionStorage === "undefined" ? null : sessionStorage;
      } catch {
        return null;
      }
    })(),
    readStoredValue: Dynamic = (
      key?: Dynamic,
      fallback?: Dynamic,
    ): Dynamic => {
      try {
        let storedJson: Dynamic = storage?.getItem(storagePrefix + key);
        return storedJson == null ? fallback : JSON.parse(storedJson);
      } catch {
        return fallback;
      }
    },
    writeStoredValue: Dynamic = (key?: Dynamic, valueToStore?: Dynamic): Dynamic => {
      try {
        valueToStore === null
          ? storage?.removeItem(storagePrefix + key)
          : storage?.setItem(storagePrefix + key, JSON.stringify(valueToStore));
      } catch {}
    },
    monotonicNow: Dynamic = (): Dynamic =>
      typeof performance !== "undefined" ? performance.now() : Date.now(),
    hotCapability: Dynamic = debugOptions.hot ?? null,
    tabId: Dynamic = readStoredValue("tab", "") || createHotDebugTabId();
  writeStoredValue("tab", tabId);
  let bootStartedAt: Dynamic = debugOptions.bootStartedAt ?? monotonicNow(),
    eventLog: Dynamic = readStoredValue("log", []),
    debugFacts: Dynamic = new Map(),
    timingSamples: Dynamic = new Map(),
    updateMeasurements: Dynamic = [],
    fileVersions: Dynamic = new Map(),
    hiddenUpdateCount: Dynamic = 0,
    lastUpdateRestarted: Dynamic = false,
    debugSources: Dynamic = {},
    saveFailureCounts: Dynamic = {
      conflict: 0,
      rate: 0,
      other: 0,
    },
    lastSuccessfulSave: Dynamic,
    recentSaveFailures: Dynamic = [],
    previousBootMarker: Dynamic = readStoredValue("crumb", null),
    hasOpenedBefore: Dynamic = readStoredValue("seen", false),
    wasHotRestart: Dynamic = false,
    restartSource: Dynamic;
  try {
    restartSource = hotCapability?.from;
    wasHotRestart = restartSource != null;
  } catch {}
  let restartNote: Dynamic = ((): Dynamic => {
      let note: Dynamic = restartSource?.note;
      return typeof note == "string" ? note : undefined;
    })(),
    reloadMessage: Dynamic;
  previousBootMarker?.phase === "hot-restart"
    ? (reloadMessage = "hot restart: " + (previousBootMarker.reason ?? "asked by this page"))
    : previousBootMarker?.phase === "publishing"
      ? (reloadMessage =
          "reloaded during a publish of " +
          (previousBootMarker.paths ?? []).join(", ") +
          " (likely a conflict: the shell reboots the tab that lost)")
      : wasHotRestart
        ? (reloadMessage =
            "hot restart by the shell" +
            (restartNote !== undefined
              ? " (note: " + restartNote + ")"
              : " (no reason recorded here: no accept handler was registered in time, or the kernel restarted on its own)"))
        : hasOpenedBefore
          ? (reloadMessage = "plain reload")
          : (reloadMessage = "first load");
  let reloadCategory: Dynamic =
      previousBootMarker?.phase === "hot-restart"
        ? "hot restart: " + (previousBootMarker.reason ?? "?")
        : previousBootMarker?.phase === "publishing"
          ? "during a publish"
          : wasHotRestart
            ? "hot restart by the shell"
            : hasOpenedBefore
              ? "plain reload"
              : "first load",
    reloadCounts: Dynamic = readStoredValue("reasons", {});
  reloadCounts[reloadCategory] = (reloadCounts[reloadCategory] ?? 0) + 1;
  writeStoredValue("reasons", reloadCounts);
  let reloadHistory: Dynamic = readStoredValue("reloads", []);
  reloadHistory.push({
    t: Date.now(),
    reason: reloadMessage,
  });
  reloadHistory.length > 60 && reloadHistory.splice(0, reloadHistory.length - 60);
  writeStoredValue("reloads", reloadHistory);
  writeStoredValue("crumb", null);
  writeStoredValue("seen", true);
  let toggles: Dynamic = new Map();
  function registerToggle(key?: Dynamic, label?: Dynamic): Dynamic {
    toggles.has(key) ||
      toggles.set(key, {
        label: label,
        on: readStoredValue("opt/" + key, true),
      });
    return (): Dynamic => toggles.get(key)?.on ?? true;
  }
  let persistLogTimer: Dynamic,
    keepEventLog: Dynamic = false,
    scheduleLogPersistence: Dynamic = (): Dynamic => {
      !keepEventLog ||
        persistLogTimer !== undefined ||
        (persistLogTimer = setTimeout((): Dynamic => {
          persistLogTimer = undefined;
          keepEventLog &&
            writeStoredValue("log", eventLog.slice(-MAX_PERSISTED_EVENTS));
        }, 250));
    };
  function recordEvent(eventType?: Dynamic, data?: Dynamic): Dynamic {
    eventLog.push({
      t: Date.now(),
      type: eventType,
      ...(data !== undefined
        ? {
            data: data,
          }
        : {}),
    });
    eventLog.length > MAX_RETAINED_EVENTS &&
      eventLog.splice(0, eventLog.length - MAX_RETAINED_EVENTS);
    scheduleLogPersistence();
    scheduleRender("events");
  }
  function recordTiming(label?: Dynamic, durationMs?: Dynamic): Dynamic {
    if (!Number.isFinite(durationMs)) return;
    let samples: Dynamic = timingSamples.get(label) ?? [];
    samples.push(Math.round(durationMs));
    samples.length > 300 && samples.shift();
    timingSamples.set(label, samples);
    scheduleRender("timing");
  }
  let pageIsHidden: Dynamic = (): Dynamic =>
      typeof document !== "undefined" &&
      (document as Dynamic).visibilityState !== "visible",
    hiddenSince: Dynamic = pageIsHidden() ? Date.now() : undefined;
  typeof document !== "undefined" &&
    (document as Dynamic).addEventListener(
      "visibilitychange",
      (): Dynamic => {
        hiddenSince = pageIsHidden() ? Date.now() : undefined;
        recordEvent("visibility", {
          state: (document as Dynamic).visibilityState,
        });
      },
    );
  let roomEventName: Dynamic = "hotdbg-" + debugOptions.product,
    peerPings: Dynamic = readStoredValue("pings", []),
    persistRecentPings: Dynamic = (): Dynamic => {
      peerPings = peerPings
        .filter((ping?: Dynamic): Dynamic => Date.now() - ping.recvAt < 6e4)
        .slice(-40);
      writeStoredValue("pings", peerPings);
    };
  function onPeerPing(message?: Dynamic): Dynamic {
    let payload: Dynamic = message?.data ?? message;
    if (
      payload === null ||
      typeof payload != "object" ||
      typeof payload.tab != "string" ||
      payload.tab === tabId ||
      typeof payload.n != "number" ||
      typeof payload.at != "number"
    )
      return;
    let ping: Dynamic = {
      tab: payload.tab,
      n: payload.n,
      phase: payload.phase === "saved" ? "saved" : "saving",
      ...(typeof payload.version == "string"
        ? {
            version: payload.version,
          }
        : {}),
      at: payload.at,
      recvAt: Date.now(),
      ...(Array.isArray(payload.paths)
        ? {
            paths: payload.paths,
          }
        : {}),
    };
    peerPings.push(ping);
    persistRecentPings();
    recordTiming("room ping", Math.max(0, ping.recvAt - ping.at));
    recordEvent("peer-" + ping.phase, {
      from: ping.tab,
      n: ping.n,
      ...(ping.version !== undefined
        ? {
            version: ping.version,
          }
        : {}),
      ...(ping.paths !== undefined
        ? {
            paths: ping.paths,
          }
        : {}),
      skewedMs: ping.recvAt - ping.at,
    });
    refreshStatus();
  }
  let room: Dynamic = null,
    roomEmitFailed: Dynamic = false;
  debugOptions.room !== false &&
    cachedRoomCapability().then(
      (capability?: Dynamic): Dynamic => {
        room = capability;
        debugFacts.set("room", room === null ? "off" : "connected");
        scheduleRender("header");
        if (room === null) return;
        try {
          room.on?.(roomEventName, onPeerPing, (): Dynamic => {});
        } catch {}
        let presenceSequence: Dynamic = new Map();
        try {
          room.onPeers?.((presence?: Dynamic): Dynamic => {
            for (let participant of presence.peers as Dynamic) {
              let peer: Dynamic = participant,
                ping: Dynamic = peer?.presence?.hotdbg;
              if (
                peer === null ||
                peer.sameTab === true ||
                ping === undefined ||
                typeof ping.tab != "string" ||
                typeof ping.n != "number"
              )
                continue;
              let sequenceKey: Dynamic =
                ping.tab + "/" + String(ping.phase);
              (presenceSequence.get(sequenceKey) ?? -1) >= ping.n ||
                (presenceSequence.set(sequenceKey, ping.n),
                peerPings.some(
                  (knownPing?: Dynamic): Dynamic =>
                    knownPing.tab === ping.tab &&
                    knownPing.n === ping.n &&
                    knownPing.phase ===
                      (ping.phase === "saved" ? "saved" : "saving"),
                ) || onPeerPing(ping));
            }
          });
        } catch {}
      },
      (): Dynamic => {},
    );
  function broadcastPing(pingDetails?: Dynamic): Dynamic {
    let ping: Dynamic = {
        tab: tabId,
        at: Date.now(),
        ...pingDetails,
      },
      connectedRoom: Dynamic = room;
    if (connectedRoom === null) return;
    let publishViaPresence: Dynamic = (): Dynamic => {
      roomEmitFailed = true;
      try {
        connectedRoom
          .presence?.({
            hotdbg: ping,
          })
          ?.catch?.((): Dynamic => {});
      } catch {}
    };
    if (roomEmitFailed || typeof connectedRoom.emit != "function") return publishViaPresence();
    try {
      connectedRoom.emit(roomEventName, ping).catch(publishViaPresence);
    } catch {
      publishViaPresence();
    }
  }
  let saveSequence: Dynamic = readStoredValue("saveN", 0),
    pendingSaves: Dynamic = new Map(),
    summarizeRawSaveError: Dynamic = (raw?: Dynamic): Dynamic => {
      try {
        return JSON.parse(
          JSON.stringify(
            raw,
            (_key?: Dynamic, field?: Dynamic): Dynamic =>
              typeof field == "string" && field.length > 300
                ? field.slice(0, 300) + "\u2026"
                : field,
          ),
        );
      } catch {
        return String(raw);
      }
    };
  function recordSaveStart(paths?: Dynamic, bytes?: Dynamic): Dynamic {
    saveSequence += 1;
    writeStoredValue("saveN", saveSequence);
    pendingSaves.set(saveSequence, {
      t: monotonicNow(),
      paths: [...paths],
      bytes: bytes,
    });
    writeStoredValue("crumb", {
      phase: "publishing",
      paths: keepEventLog ? [...paths] : [],
      at: Date.now(),
    });
    broadcastPing({
      n: saveSequence,
      phase: "saving",
      paths: [...paths],
    });
    recordEvent("save-flush", {
      n: saveSequence,
      paths: paths,
      bytes: bytes,
    });
    scheduleRender("queue");
    return saveSequence;
  }
  function recordSaveEnd(saveId?: Dynamic, result?: Dynamic): Dynamic {
    let entry: Dynamic = pendingSaves.get(saveId);
    pendingSaves.delete(saveId);
    pendingSaves.size === 0 && writeStoredValue("crumb", null);
    let durationMs: Dynamic = entry !== undefined ? monotonicNow() - entry.t : NaN;
    if (result.ok) {
      recordTiming("publish call", durationMs);
      lastSuccessfulSave = {
        n: saveId,
        ms: Math.round(durationMs),
        ...(result.version !== undefined
          ? {
              version: result.version,
            }
          : {}),
        at: Date.now(),
      };
      if (result.version !== undefined) {
        debugFacts.set("on version", result.version);
        for (let filePath of (entry?.paths ?? []) as Dynamic)
          fileVersions.set(filePath, result.version);
        broadcastPing({
          n: saveId,
          phase: "saved",
          version: result.version,
          ...(entry !== undefined
            ? {
                paths: entry.paths,
              }
            : {}),
        });
      }
      recordEvent("save-ok", {
        n: saveId,
        ms: Math.round(durationMs),
        version: result.version,
      });
    } else {
      result.code === "conflict"
        ? (saveFailureCounts.conflict += 1)
        : result.code === "rate_limited"
          ? (saveFailureCounts.rate += 1)
          : (saveFailureCounts.other += 1);
      recentSaveFailures.push({
        t: Date.now(),
        n: saveId,
        ...(result.code !== undefined
          ? {
              code: result.code,
            }
          : {}),
        ...(result.raw !== undefined
          ? {
              raw: summarizeRawSaveError(result.raw),
            }
          : {}),
      });
      recentSaveFailures.length > 30 && recentSaveFailures.shift();
      recordEvent(result.code === "conflict" ? "save-conflict" : "save-error", {
        n: saveId,
        ms: Math.round(durationMs),
        code: result.code,
        ...(result.raw !== undefined
          ? {
              raw: summarizeRawSaveError(result.raw),
            }
          : {}),
      });
    }
    scheduleRender("queue");
    scheduleRender("header");
    refreshStatus();
  }
  function recordVisibleUpdate(version?: Dynamic, updateMethod?: Dynamic): Dynamic {
    let visibleAt: Dynamic = Date.now(),
      wasHidden: Dynamic = hiddenSince !== undefined,
      matchingSavedPingIndex: Dynamic = peerPings.findIndex(
        (ping?: Dynamic): Dynamic =>
          ping.phase === "saved" && ping.version === version,
      ),
      pingCutoffAt: Dynamic =
        matchingSavedPingIndex >= 0
          ? peerPings[matchingSavedPingIndex].recvAt
          : updateMethod === "restarted"
            ? visibleAt
            : -1;
    if (pingCutoffAt < 0) return;
    let matchedPings: Dynamic = peerPings.filter(
      (ping?: Dynamic): Dynamic => ping.recvAt <= pingCutoffAt,
    );
    peerPings = peerPings.filter(
      (ping?: Dynamic): Dynamic => ping.recvAt > pingCutoffAt,
    );
    persistRecentPings();
    let pingsByPeerSave: Dynamic = new Map();
    for (let ping of matchedPings as Dynamic) {
      let peerSaveKey: Dynamic = ping.tab + "#" + String(ping.n),
        pingPhases: Dynamic = pingsByPeerSave.get(peerSaveKey) ?? {};
      pingPhases[ping.phase] = ping;
      pingsByPeerSave.set(peerSaveKey, pingPhases);
    }
    for (let pingPhases of pingsByPeerSave.values() as Dynamic) {
      let firstPing: Dynamic = pingPhases.saving ?? pingPhases.saved;
      if (firstPing === undefined) continue;
      if (wasHidden) {
        hiddenUpdateCount += 1;
        continue;
      }
      let visibilityLagMs: Dynamic = visibleAt - firstPing.recvAt;
      recordTiming(
        updateMethod === "adopted"
          ? "save \u2192 visible, adopted"
          : "save \u2192 visible, restarted",
        visibilityLagMs,
      );
      updateMeasurements.push({
        how: updateMethod,
        ms: visibilityLagMs,
      });
      updateMeasurements.length > 60 && updateMeasurements.shift();
      pingPhases.saved !== undefined &&
        recordTiming("saved-ping \u2192 visible", visibleAt - pingPhases.saved.recvAt);
    }
    recordEvent("visible", {
      version: version,
      how: updateMethod,
      saves: pingsByPeerSave.size,
      hidden: wasHidden,
    });
    refreshStatus();
  }
  function onHotEvent(event?: Dynamic): Dynamic {
    event.type === "update" &&
      (debugFacts.set(
        "hot shape",
        event.shape === "calls" ? "three calls" : "string verdicts",
      ),
      debugFacts.set(
        "live seen",
        event.to +
          (event.toSeq !== undefined
            ? " \xB7 seq " + String(event.toSeq)
            : ""),
      ),
      event.decision === "adopt" &&
        (debugFacts.set(
          "on version",
          event.to +
            (event.toSeq !== undefined
              ? " \xB7 seq " + String(event.toSeq)
              : ""),
        ),
        (lastUpdateRestarted = false)),
      event.decision === "restart" && (lastUpdateRestarted = true));
    event.type === "restart" && (lastUpdateRestarted = true);
    if (event.type === "applied") {
      lastUpdateRestarted = false;
      event.grantLagMs !== undefined &&
        recordTiming("adopt \u2192 first 200 (grant lag)", event.grantLagMs);
      for (let filePath of (event.paths ?? []) as Dynamic)
        fileVersions.set(filePath, event.to);
      scheduleRender("files");
    }
    recordEvent("hot-" + event.type, event);
    scheduleRender("header");
    refreshStatus();
  }
  function recordRestart(reason?: Dynamic): Dynamic {
    writeStoredValue("crumb", {
      phase: "hot-restart",
      reason: reason,
      at: Date.now(),
    });
    recordEvent("restart-asked", {
      reason: reason,
    });
    keepEventLog && writeStoredValue("log", eventLog.slice(-MAX_PERSISTED_EVENTS));
  }
  let bootPhases: Dynamic = [];
  function recordBootPhase(phase?: Dynamic): Dynamic {
    let elapsedMs: Dynamic = Math.round(monotonicNow() - bootStartedAt);
    bootPhases.push({
      name: phase,
      ms: elapsedMs,
    });
    (phase === "first artboard painted" || phase === "first paint") &&
      recordTiming("boot \u2192 first paint", elapsedMs);
    phase === "all painted" && recordTiming("boot \u2192 all painted", elapsedMs);
    recordEvent("boot-phase", {
      name: phase,
      ms: elapsedMs,
    });
    scheduleRender("timing");
  }
  function recordFileRead(
    filePath?: Dynamic,
    durationMs?: Dynamic,
    responseStatus?: Dynamic,
    wasFresh?: Dynamic,
  ): Dynamic {
    recordEvent("read", {
      path: filePath,
      ms: Math.round(durationMs),
      status: responseStatus,
      ...(wasFresh
        ? {
            fresh: true,
          }
        : {}),
    });
  }
  let storedPanelState: Dynamic = readStoredValue("ui", {}),
    panelState: Dynamic = {
      open: storedPanelState.open === true,
      side: storedPanelState.side === "right" ? "right" : "bottom",
      size: {
        ...HOT_DEBUG_PANEL_SIZE,
        ...(storedPanelState.size ?? {}),
      },
      tab: storedPanelState.tab ?? "events",
      kinds: {
        hot: true,
        save: true,
        boot: true,
        room: true,
        error: true,
        other: true,
        ...(storedPanelState.kinds ?? {}),
      },
      text: typeof storedPanelState.text == "string" ? storedPanelState.text : "",
      paused: false,
    };
  storedPanelState.open === undefined &&
    readStoredValue("open", false) &&
    (panelState.open = true);
  let persistPanelState: Dynamic = (): Dynamic => writeStoredValue("ui", panelState);
  keepEventLog = panelState.open;
  keepEventLog || writeStoredValue("log", null);
  let panelHost: Dynamic = null,
    shadowRoot: Dynamic = null,
    themedContainer: Dynamic = null,
    statusChip: Dynamic = null,
    panel: Dynamic = null,
    panelBody: Dynamic = null,
    eventRows: Dynamic = null,
    panelInsetStyles: Dynamic = null,
    expandedEvents: Dynamic = new Set(),
    dirtySections: Dynamic = new Set(),
    renderFrame: Dynamic = 0,
    status: Dynamic = "ok";
  function refreshStatus(): Dynamic {
    let now: Dynamic = Date.now(),
      hasRecentPeerSaveOrFailure: Dynamic =
        peerPings.some(
          (ping?: Dynamic): Dynamic =>
            ping.phase === "saved" && now - ping.recvAt < 15e3,
        ) ||
        recentSaveFailures.some((failure?: Dynamic): Dynamic => now - failure.t < 1e4),
      nextStatus: Dynamic = lastUpdateRestarted ? "bad" : hasRecentPeerSaveOrFailure ? "behind" : "ok";
    nextStatus !== status &&
      ((status = nextStatus),
      statusChip && (statusChip.dataset.status = status),
      scheduleRender("header"));
  }
  function scheduleRender(section?: Dynamic): Dynamic {
    !panelState.open ||
      shadowRoot === null ||
      (dirtySections.add(section),
      !(renderFrame !== 0 || typeof requestAnimationFrame != "function") &&
        (renderFrame = requestAnimationFrame((): Dynamic => {
          renderFrame = 0;
          renderDirtySections();
        })));
  }
  function renderDirtySections(): Dynamic {
    if (!panelState.open || panel === null) {
      dirtySections.clear();
      return;
    }
    dirtySections.has("header") && renderHeader();
    let tab: Dynamic = panelState.tab;
    tab === "events" && dirtySections.has("events") && !panelState.paused && renderEvents();
    tab === "timing" && dirtySections.has("timing") && renderActiveTab();
    tab === "files" &&
      (dirtySections.has("files") || dirtySections.has("queue")) &&
      renderActiveTab();
    tab === "queue" &&
      (dirtySections.has("queue") || dirtySections.has("events")) &&
      renderActiveTab();
    dirtySections.clear();
  }
  let setDefaultPanelInset: Dynamic = (side?: Dynamic, insetPx?: Dynamic): Dynamic => {
      if (typeof document === "undefined") return;
      panelInsetStyles === null &&
        ((panelInsetStyles = (document as Dynamic).createElement("style")),
        panelInsetStyles.setAttribute("data-hot-debug-room", ""),
        (panelInsetStyles.textContent =
          ":root{--hotdbg-b:0px;--hotdbg-r:0px}html[data-hotdbg-open] .h-screen{height:calc(100vh - var(--hotdbg-b))!important}html[data-hotdbg-open] .h-dvh{height:calc(100dvh - var(--hotdbg-b))!important}html[data-hotdbg-open] .w-screen{width:calc(100vw - var(--hotdbg-r))!important}"),
        (document as Dynamic).head.appendChild(panelInsetStyles));
      let documentElement: Dynamic = (document as Dynamic).documentElement;
      side === null
        ? documentElement.removeAttribute("data-hotdbg-open")
        : documentElement.setAttribute("data-hotdbg-open", side);
      documentElement.style.setProperty(
        "--hotdbg-b",
        side === "bottom" ? String(insetPx) + "px" : "0px",
      );
      documentElement.style.setProperty(
        "--hotdbg-r",
        side === "right" ? String(insetPx) + "px" : "0px",
      );
      try {
        (window as Dynamic).dispatchEvent(new Event("resize"));
      } catch {}
    },
    makeRoomForPanel: Dynamic = debugOptions.makeRoom ?? setDefaultPanelInset,
    panelStyles: Dynamic = `
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
    createElement: Dynamic = (
      tagName?: Dynamic,
      className?: Dynamic,
      text?: Dynamic,
    ): Dynamic => {
      let element: Dynamic = (document as Dynamic).createElement(tagName);
      className !== undefined && (element.className = className);
      text !== undefined && (element.textContent = text);
      return element;
    },
    readTheme: Dynamic = (): Dynamic => {
      let theme: Dynamic =
        (document as Dynamic).documentElement.getAttribute("data-theme") ??
        (document as Dynamic).documentElement.getAttribute("data-mode");
      if (theme === "dark" || theme === "light") return theme;
      try {
        return matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      } catch {
        return "dark";
      }
    };
  function describeEvent(event?: Dynamic): Dynamic {
    let data: Dynamic = event.data ?? {},
      formatValue: Dynamic = (dataToFormat?: Dynamic): Dynamic => {
        try {
          return JSON.stringify(dataToFormat);
        } catch {
          return String(dataToFormat);
        }
      };
    switch (event.type) {
      case "hot-update": {
        let changed: Dynamic = data.changed,
          changedDescription: Dynamic =
            changed === null
              ? "changed: null"
              : changed
                  .map(
                    (change?: Dynamic): Dynamic =>
                      change.path +
                      (change.klass === "code" ? " [CODE]" : ""),
                  )
                  .join(", ");
        return {
          cls:
            data.decision === "restart"
              ? "error"
              : data.decision === "defer"
                ? "warn"
                : "",
          text: `${String(data.decision).toUpperCase()} \xB7 ${abbreviateHotDebugValue(String(data.from))} \u2192 ${abbreviateHotDebugValue(String(data.to))}${data.toSeq !== undefined ? " seq " + String(data.toSeq) : ""} \xB7 required ${String(data.required)} \xB7 ${changedDescription} \xB7 ${String(data.why ?? "")}${data.early === true ? " (early handler)" : ""}`,
        };
      }
      case "hot-fetch":
        return {
          cls: data.ok === true ? "" : "warn",
          text: `${String(data.path)} \xB7 try ${String(data.attempt)} \u2192 ${data.ok === true ? "200" : String(data.status ?? "failed")} at +${String(data.msAfterAdopt)} ms after adopt`,
        };
      case "hot-pending":
        return {
          cls: "warn",
          text: `still refused ${String(data.msAfterAdopt)} ms after adopt: old content stays, retrying slowly \xB7 ${formatValue(data.paths)}`,
        };
      case "hot-applied":
        return {
          cls: "",
          text: `${String(data.applied)}/${String(data.rows)} rows in ${String(data.ms)} ms \xB7 grant lag ${String(data.grantLagMs ?? "\u2014")} ms \xB7 retries ${String(data.retries)} \xB7 ${formatValue(data.paths ?? [])}`,
        };
      case "hot-restart":
        return {
          cls: "error",
          text: `restart asked: ${String(data.reason)}${data.error !== undefined ? " \xB7 " + String(data.error) : ""}`,
        };
      case "hot-deferred":
        return {
          cls: "warn",
          text: `deferred (${String(data.reason)})`,
        };
      case "hot-reveal":
        return {
          cls: data.timedOut === true ? "warn" : "",
          text: `restarted realm shown after holding the reveal ${String(data.heldMs)} ms${data.timedOut === true ? " (the hold ran out before the editor painted)" : ""}${data.carried === true ? " \xB7 view carried" : ""}`,
        };
      case "reconcile": {
        let regions: Dynamic = data.regions,
          guard: Dynamic = data.guard,
          overlaps: Dynamic = data.overlapList ?? [];
        return {
          cls:
            data.ok === true
              ? Number(data.overlaps) > 0
                ? "warn"
                : ""
              : "error",
          text: `${String(data.file)} \xB7 ${String(data.trigger)} \xB7 ${data.ok === true ? "FOLDED" : "NOT merged: " + String(data.why ?? "")}${regions !== undefined ? ` \xB7 template ${regions.template}, script ${regions.script}, outer ${regions.outer}` : ""} \xB7 ${String(data.applied)} of mine re-applied \xB7 ${String(data.overlaps)} overlaps${overlaps.length > 0 ? " (" + overlaps.map((overlap?: Dynamic): Dynamic => `${overlap.name}: mine ${String(overlap.to)} over theirs ${String(overlap.theirs)}`).join("; ") + ")" : ""}${guard !== undefined ? ` \xB7 same tree: theirs ${String(guard.baseTheirs)}, mine ${String(guard.baseMine)}` : ""} \xB7 ${String(data.ms)} ms`,
        };
      }
      case "reconcile-choice":
        return {
          cls: "",
          text: `${String(data.file)} \xB7 the person chose: ${String(data.choice)}`,
        };
      case "board-remote":
        return {
          cls: "",
          text: `${String(data.file)} \xB7 ${String(data.how)}${data.why !== undefined ? " \xB7 " + String(data.why) : ""}${data.ms !== undefined ? " \xB7 " + String(data.ms) + " ms" : ""}`,
        };
      case "save-flush":
        return {
          cls: "",
          text: `#${String(data.n)} ${formatValue(data.paths)} \xB7 ${String(data.bytes)} B`,
        };
      case "save-ok":
        return {
          cls: "",
          text: `#${String(data.n)} published in ${String(data.ms)} ms \u2192 ${abbreviateHotDebugValue(String(data.version))}`,
        };
      case "save-conflict":
      case "save-error":
        return {
          cls: "error",
          text: `#${String(data.n)} ${String(data.code)} after ${String(data.ms)} ms \xB7 ${formatValue(data.raw ?? "")}`,
        };
      case "boot":
        return {
          cls: "",
          text: String(data.reason),
        };
      case "boot-phase":
        return {
          cls: "",
          text: `${String(data.name)} at +${String(data.ms)} ms`,
        };
      case "read":
        return {
          cls:
            Number(data.status) >= 400 || data.status === 0
              ? "warn"
              : "",
          text: `${String(data.path)} \xB7 ${String(data.status)} in ${String(data.ms)} ms${data.fresh === true ? " (no-store)" : ""}`,
        };
      case "peer-saving":
      case "peer-saved":
        return {
          cls: "",
          text: `${String(data.from)} #${String(data.n)}${data.version !== undefined ? " \u2192 " + abbreviateHotDebugValue(String(data.version)) : ""} ${formatValue(data.paths ?? [])}`,
        };
      default:
        return {
          cls: "",
          text: formatValue(data),
        };
    }
  }
  function renderHeader(): Dynamic {
    let header: Dynamic = panel?.querySelector(".bar");
    if (!header) return;
    header.setAttribute("data-status", status);
    let updateField: Dynamic = (
      field?: Dynamic,
      text?: Dynamic,
    ): Dynamic => {
      let element: Dynamic = header.querySelector(
        '[data-f="' + field + '"]',
      );
      element &&
        element.textContent !== text &&
        (element.textContent = text);
    };
    updateField("tab", tabId);
    updateField("ver", debugFacts.get("on version") ?? "\u2014");
    updateField(
      "hot",
      hotCapability === null ? "absent" : (debugFacts.get("hot shape") ?? "present"),
    );
    updateField(
      "status",
      status === "ok"
        ? "level with live"
        : status === "behind"
          ? "behind live"
          : "last update restarted",
    );
  }
  function visibleEvents(): Dynamic {
    let searchText: Dynamic = panelState.text.trim().toLowerCase(),
      matches: Dynamic = [];
    for (
      let index: Dynamic = eventLog.length - 1;
      index >= 0 && matches.length < MAX_VISIBLE_EVENTS;
      index--
    ) {
      let event: Dynamic = eventLog[index];
      if (panelState.kinds[classifyHotDebugEvent(event)]) {
        if (searchText !== "") {
          let type: Dynamic = event.type;
          try {
            type += " " + JSON.stringify(event.data ?? "");
          } catch {}
          if (!type.toLowerCase().includes(searchText)) continue;
        }
        matches.push(event);
      }
    }
    return matches;
  }
  function renderEvents(): Dynamic {
    if (eventRows === null) return;
    let events: Dynamic = visibleEvents(),
      rows: Dynamic = (document as Dynamic).createDocumentFragment();
    for (let event of events as Dynamic) {
      let description: Dynamic = describeEvent(event),
        category: Dynamic = classifyHotDebugEvent(event),
        row: Dynamic = createElement(
          "div",
          "row " + (category === "error" ? "error" : description.cls),
        );
      row.append(
        createElement("span", "t", formatHotDebugTimestamp(event.t)),
        createElement("span", "ty", event.type),
        createElement("span", "s", description.text),
      );
      row.title = "click for the raw event";
      row.addEventListener("click", (): Dynamic => {
        expandedEvents.has(event) ? expandedEvents.delete(event) : expandedEvents.add(event);
        renderEvents();
      });
      rows.append(row);
      if (expandedEvents.has(event)) {
        let rawData: Dynamic = "";
        try {
          rawData = JSON.stringify(event.data ?? {}, null, 1);
        } catch {
          rawData = String(event.data);
        }
        rows.append(createElement("div", "raw", rawData));
      }
    }
    events.length === 0 &&
      rows.append(
        createElement(
          "div",
          "pad mut",
          eventLog.length === 0
            ? "Nothing logged yet."
            : "No event matches the filters.",
        ),
      );
    eventRows.replaceChildren(rows);
  }
  function createTable(
    headings?: Dynamic,
    rows?: Dynamic,
    className?: Dynamic,
  ): Dynamic {
    let table: Dynamic = createElement("table", className);
    if (headings.some((heading?: Dynamic): Dynamic => heading !== "")) {
      let headerRow: Dynamic = createElement("tr");
      for (let heading of headings as Dynamic)
        headerRow.append(createElement("th", undefined, heading));
      table.append(headerRow);
    }
    for (let cells of rows as Dynamic) {
      let row: Dynamic = createElement("tr");
      for (let cell of cells as Dynamic)
        row.append(createElement("td", undefined, String(cell)));
      table.append(row);
    }
    return table;
  }
  function renderActiveTab(): Dynamic {
    if (panelBody === null) return;
    let body: Dynamic = panelBody;
    eventRows = null;
    body.replaceChildren();
    if (panelState.tab === "events") {
      let toolbar: Dynamic = createElement("div", "tools");
      for (let category of [
        "hot",
        "save",
        "boot",
        "room",
        "error",
        "other",
      ] as Dynamic) {
        let filterButton: Dynamic = createElement("button", "fchip", category);
        filterButton.setAttribute("aria-pressed", String(panelState.kinds[category]));
        filterButton.addEventListener("click", (): Dynamic => {
          panelState.kinds[category] = !panelState.kinds[category];
          filterButton.setAttribute("aria-pressed", String(panelState.kinds[category]));
          persistPanelState();
          renderEvents();
        });
        toolbar.append(filterButton);
      }
      let searchField: Dynamic = createElement("input");
      searchField.type = "text";
      searchField.placeholder = "filter (path, version, reason\u2026)";
      searchField.value = panelState.text;
      searchField.addEventListener("input", (): Dynamic => {
        panelState.text = searchField.value;
        persistPanelState();
        renderEvents();
      });
      let pauseButton: Dynamic = createElement(
        "button",
        "fchip",
        panelState.paused ? "paused" : "live",
      );
      pauseButton.setAttribute("aria-pressed", String(!panelState.paused));
      pauseButton.title = "pause the list (events keep being recorded)";
      pauseButton.addEventListener("click", (): Dynamic => {
        panelState.paused = !panelState.paused;
        pauseButton.textContent = panelState.paused ? "paused" : "live";
        pauseButton.setAttribute("aria-pressed", String(!panelState.paused));
        panelState.paused || renderEvents();
      });
      toolbar.append(
        searchField,
        pauseButton,
        createElement(
          "span",
          "mut",
          `newest first \xB7 ${String(MAX_VISIBLE_EVENTS)} drawn at most \xB7 ${String(MAX_RETAINED_EVENTS)} kept`,
        ),
      );
      eventRows = createElement("div");
      body.append(toolbar, eventRows);
      renderEvents();
      return;
    }
    let content: Dynamic = createElement("div", "pad");
    body.append(content);
    if (panelState.tab === "timing") {
      content.append(createElement("h4", undefined, "timing \xB7 ms"));
      let timingRows: Dynamic = [...timingSamples.entries()].map(
        ([label, samples]: Dynamic): Dynamic => {
          let sortedSamples: Dynamic = [...samples].sort(
            (left?: Dynamic, right?: Dynamic): Dynamic =>
              left - right,
          );
          return [
            label,
            quantile(sortedSamples, 0.5),
            quantile(sortedSamples, 0.95),
            sortedSamples[sortedSamples.length - 1],
            sortedSamples.length,
          ];
        },
      );
      content.append(
        timingRows.length > 0
          ? createTable(["", "p50", "p95", "max", "n"], timingRows)
          : createElement(
              "div",
              "mut",
              "No samples yet. Save in another tab and watch this one.",
            ),
      );
      hiddenUpdateCount > 0 &&
        content.append(
          createElement(
            "div",
            "mut",
            `${String(hiddenUpdateCount)} samples taken while this tab was hidden were left out.`,
          ),
        );
      content.append(
        createElement(
          "h4",
          undefined,
          "save \u2192 visible, newest on the right \xB7 green adopted, red restarted",
        ),
      );
      let sparkline: Dynamic = createElement("div", "spark"),
        maxUpdateMs: Dynamic = Math.max(
          1,
          ...updateMeasurements.map((measurement?: Dynamic): Dynamic => measurement.ms),
        );
      for (let measurement of updateMeasurements as Dynamic) {
        let bar: Dynamic = createElement(
          "i",
          measurement.how === "restarted" ? "r" : "",
        );
        bar.style.height =
          String(Math.max(2, Math.round((measurement.ms / maxUpdateMs) * 40))) + "px";
        bar.title = measurement.how + " \xB7 " + String(measurement.ms) + " ms";
        sparkline.append(bar);
      }
      content.append(
        updateMeasurements.length > 0 ? sparkline : createElement("div", "mut", "\u2014"),
      );
      content.append(
        createElement("h4", undefined, "boot, from the entry module"),
      );
      let maxBootMs: Dynamic = Math.max(
        1,
        ...bootPhases.map((phase?: Dynamic): Dynamic => phase.ms),
      );
      for (let phase of bootPhases as Dynamic) {
        let row: Dynamic = createElement("div", "wf"),
          barTrack: Dynamic = createElement("div"),
          bar: Dynamic = createElement("div", "barx");
        bar.style.width =
          String(Math.max(1, Math.round((phase.ms / maxBootMs) * 100))) + "%";
        barTrack.append(bar);
        row.append(
          createElement("span", undefined, phase.name),
          barTrack,
          createElement("span", "ms", "+" + String(phase.ms)),
        );
        content.append(row);
      }
      bootPhases.length === 0 &&
        content.append(createElement("div", "mut", "\u2014"));
      if (toggles.size > 0) {
        content.append(createElement("h4", undefined, "options"));
        for (let [key, toggle] of toggles as Dynamic) {
          let label: Dynamic = createElement("label"),
            checkbox: Dynamic = createElement("input");
          checkbox.type = "checkbox";
          checkbox.checked = toggle.on;
          checkbox.addEventListener("change", (): Dynamic => {
            toggle.on = checkbox.checked;
            writeStoredValue("opt/" + key, toggle.on);
            recordEvent("option", {
              key: key,
              on: toggle.on,
            });
          });
          label.append(
            checkbox,
            (document as Dynamic).createTextNode(" " + toggle.label),
          );
          content.append(label);
        }
      }
      return;
    }
    if (panelState.tab === "files") {
      let files: Dynamic = [];
      try {
        files = debugSources.files?.() ?? [];
      } catch {
        files = [];
      }
      content.append(
        createElement(
          "h4",
          undefined,
          `files this tab knows \xB7 ${String(files.length)}`,
        ),
      );
      if (files.length === 0) {
        content.append(
          createElement(
            "div",
            "mut",
            debugSources.files === undefined
              ? "This editor did not provide its file list."
              : "No files.",
          ),
        );
        return;
      }
      let table: Dynamic = createElement("table", "l"),
        headerRow: Dynamic = createElement("tr");
      for (let heading of [
        "path",
        "state",
        "on screen",
        "live",
        "size",
        "last changed at",
      ] as Dynamic)
        headerRow.append(createElement("th", undefined, heading));
      table.append(headerRow);
      for (let file of [...files].sort(
        (left?: Dynamic, right?: Dynamic): Dynamic =>
          left.path < right.path ? -1 : 1,
      ) as Dynamic) {
        let row: Dynamic = createElement("tr"),
          statusCell: Dynamic = createElement("td");
        for (let fileStatus of (file.state ?? "")
          .split(" ")
          .filter(Boolean) as Dynamic)
          statusCell.append(
            createElement(
              "span",
              "st" +
                (fileStatus === "conflicted"
                  ? " b"
                  : fileStatus === "behind" || fileStatus === "held"
                    ? " w"
                    : ""),
              fileStatus,
            ),
          );
        row.append(
          createElement("td", undefined, file.path),
          statusCell,
          createElement("td", undefined, (file.sha ?? "\u2014").slice(0, 10)),
          createElement(
            "td",
            undefined,
            file.liveSha === undefined
              ? ""
              : (file.liveSha ?? "removed").slice(0, 10),
          ),
          createElement(
            "td",
            undefined,
            file.size !== undefined ? String(file.size) : "",
          ),
          createElement(
            "td",
            undefined,
            abbreviateHotDebugValue(fileVersions.get(file.path)),
          ),
        );
        table.append(row);
      }
      content.append(table);
      return;
    }
    if (panelState.tab === "queue") {
      let queue: Dynamic;
      try {
        queue = debugSources.queue?.();
      } catch {
        queue = undefined;
      }
      content.append(createElement("h4", undefined, "now"));
      content.append(
        createTable(
          ["", ""],
          [
            [
              "dirty",
              queue === undefined
                ? "(not provided)"
                : queue.dirty.length === 0
                  ? "none"
                  : queue.dirty.join(", "),
            ],
            [
              "in flight",
              pendingSaves.size > 0
                ? [...pendingSaves.values()]
                    .map((save?: Dynamic): Dynamic => save.paths.join(", "))
                    .join(" | ")
                : queue?.inFlight === true
                  ? "yes"
                  : "no",
            ],
            [
              "conflicted",
              queue?.conflicted !== undefined &&
              queue.conflicted.length > 0
                ? queue.conflicted.join(", ")
                : "none",
            ],
            [
              "last publish",
              lastSuccessfulSave === undefined
                ? "\u2014"
                : `#${String(lastSuccessfulSave.n)} \xB7 ${String(lastSuccessfulSave.ms)} ms \u2192 ${abbreviateHotDebugValue(lastSuccessfulSave.version)} \xB7 ${formatHotDebugTimestamp(lastSuccessfulSave.at)}`,
            ],
            ["queue says", queue?.lastError ?? "ok"],
            ["publishes", String(saveSequence)],
            [
              "errors",
              `409 conflict \xD7${String(saveFailureCounts.conflict)} \xB7 429 rate limit \xD7${String(saveFailureCounts.rate)} \xB7 other \xD7${String(saveFailureCounts.other)}`,
            ],
            [
              "catch-up waits",
              queue?.note ??
                "this editor does not wait for a newer version before saving yet",
            ],
          ],
          "l",
        ),
      );
      content.append(
        createElement("h4", undefined, "publish errors, newest first"),
      );
      recentSaveFailures.length === 0 && content.append(createElement("div", "mut", "none"));
      for (let failure of [...recentSaveFailures].reverse() as Dynamic) {
        let rawError: Dynamic = "";
        try {
          rawError = JSON.stringify(failure.raw ?? {}, null, 1);
        } catch {
          rawError = String(failure.raw);
        }
        let rawErrorElement: Dynamic = createElement("div", "raw", rawError);
        rawErrorElement.style.marginLeft = "0";
        content.append(
          createElement(
            "div",
            "mut",
            `${formatHotDebugTimestamp(failure.t)} \xB7 #${String(failure.n)} \xB7 ${String(failure.code)}`,
          ),
          rawErrorElement,
        );
      }
      return;
    }
    content.append(
      createElement("h4", undefined, "this tab last loaded because"),
    );
    content.append(createElement("div", undefined, reloadMessage));
    content.append(createElement("h4", undefined, "counts by reason"));
    content.append(
      createTable(
        ["reason", "times"],
        Object.entries(reloadCounts)
          .sort(
            (left?: Dynamic, right?: Dynamic): Dynamic =>
              right[1] - left[1],
          )
          .map(([reason, count]: Dynamic): Dynamic => [reason, count]),
      ),
    );
    content.append(createElement("h4", undefined, "history, newest first"));
    content.append(
      createTable(
        ["when", "reason"],
        [...reloadHistory]
          .reverse()
          .map(
            (reload?: Dynamic): Dynamic => [
              formatHotDebugTimestamp(reload.t),
              reload.reason,
            ],
          ),
        "l",
      ),
    );
  }
  function clampPanelSize(side?: Dynamic, size?: Dynamic): Dynamic {
    let maxSize: Dynamic = Math.round(
      (side === "bottom"
        ? (window as Dynamic).innerHeight
        : (window as Dynamic).innerWidth) * 0.8,
    );
    return Math.max(
      HOT_DEBUG_MIN_PANEL_SIZE[side],
      Math.min(maxSize, Math.round(size)),
    );
  }
  function applyPanelLayout(): Dynamic {
    if (panel === null || themedContainer === null) return;
    themedContainer.className = "t-" + readTheme();
    panel.className = "panel " + panelState.side;
    let size: Dynamic = clampPanelSize(panelState.side, panelState.size[panelState.side]);
    panelState.side === "bottom"
      ? ((panel.style.height = String(size) + "px"),
        (panel.style.width = ""))
      : ((panel.style.width = String(size) + "px"),
        (panel.style.height = ""));
    makeRoomForPanel(panelState.open ? panelState.side : null, panelState.open ? size : 0);
  }
  function refreshActiveTab(): Dynamic {
    panel
      ?.querySelectorAll(".tab")
      .forEach(
        (element?: Dynamic): Dynamic =>
          element.setAttribute(
            "aria-selected",
            String(element.getAttribute("data-tab") === panelState.tab),
          ),
      );
  }
  function setPanelOpen(isOpen?: Dynamic): Dynamic {
    panelState.open = isOpen;
    keepEventLog = isOpen;
    isOpen ? scheduleLogPersistence() : writeStoredValue("log", null);
    persistPanelState();
    statusChip && (statusChip.dataset.open = isOpen ? "1" : "0");
    panel && (panel.style.display = isOpen ? "flex" : "none");
    isOpen ? (applyPanelLayout(), renderHeader(), refreshActiveTab(), renderActiveTab()) : makeRoomForPanel(null, 0);
  }
  function buildPanel(): Dynamic {
    if (shadowRoot === null) return;
    themedContainer = createElement("div", "t-" + readTheme());
    let container: Dynamic = themedContainer;
    statusChip = createElement("div", "chip");
    statusChip.dataset.status = status;
    statusChip.dataset.open = "0";
    statusChip.title = "hot-reload debug panel (" + HOT_DEBUG_SHORTCUT + ")";
    statusChip.append(
      createElement("span", "dot"),
      createElement("span", undefined, "hot"),
      createElement("span", "mono", tabId),
    );
    statusChip.addEventListener("click", (): Dynamic => setPanelOpen(true));
    panel = createElement("div", "panel " + panelState.side);
    panel.style.display = "none";
    panel.tabIndex = -1;
    let resizeGrip: Dynamic = createElement("div", "grip");
    resizeGrip.title = "drag to resize \xB7 double-click to reset";
    resizeGrip.addEventListener("dblclick", (): Dynamic => {
      panelState.size[panelState.side] = HOT_DEBUG_PANEL_SIZE[panelState.side];
      persistPanelState();
      applyPanelLayout();
    });
    resizeGrip.addEventListener("pointerdown", (event?: Dynamic): Dynamic => {
      event.preventDefault();
      resizeGrip.classList.add("on");
      let resizeShield: Dynamic = createElement("div", "shield");
      resizeShield.style.cursor =
        panelState.side === "bottom" ? "ns-resize" : "ew-resize";
      container.append(resizeShield);
      let resizePanel: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
          panelState.size[panelState.side] = clampPanelSize(
            panelState.side,
            panelState.side === "bottom"
              ? (window as Dynamic).innerHeight - pointerEvent.clientY
              : (window as Dynamic).innerWidth - pointerEvent.clientX,
          );
          applyPanelLayout();
        },
        finishResize: Dynamic = (): Dynamic => {
          resizeShield.remove();
          resizeGrip.classList.remove("on");
          (window as Dynamic).removeEventListener(
            "pointermove",
            resizePanel,
            true,
          );
          (window as Dynamic).removeEventListener(
            "pointerup",
            finishResize,
            true,
          );
          (window as Dynamic).removeEventListener(
            "pointercancel",
            finishResize,
            true,
          );
          persistPanelState();
        };
      (window as Dynamic).addEventListener("pointermove", resizePanel, true);
      (window as Dynamic).addEventListener("pointerup", finishResize, true);
      (window as Dynamic).addEventListener("pointercancel", finishResize, true);
    });
    let header: Dynamic = createElement("div", "bar");
    header.setAttribute("data-status", status);
    let appendHeaderField: Dynamic = (
      label?: Dynamic,
      field?: Dynamic,
    ): Dynamic => {
      header.append(createElement("span", "k", label));
      let fieldValue: Dynamic = createElement("span", "v");
      fieldValue.setAttribute("data-f", field);
      header.append(fieldValue);
    };
    header.append(createElement("span", "dot"));
    let statusLabel: Dynamic = createElement("span");
    statusLabel.setAttribute("data-f", "status");
    header.append(statusLabel);
    appendHeaderField("tab", "tab");
    appendHeaderField("version", "ver");
    appendHeaderField("claude.hot", "hot");
    header.append(createElement("span", "sp"));
    let appendHeaderButton: Dynamic = (
      label?: Dynamic,
      title?: Dynamic,
      onClick?: Dynamic,
    ): Dynamic => {
      let button: Dynamic = createElement("button", "ib", label);
      button.title = title;
      button.addEventListener("click", onClick);
      header.append(button);
    };
    appendHeaderButton(
      "dock \u21C4",
      "dock to the other side (bottom / right)",
      (): Dynamic => {
        panelState.side = panelState.side === "bottom" ? "right" : "bottom";
        persistPanelState();
        applyPanelLayout();
      },
    );
    appendHeaderButton("clear", "clear the log", (): Dynamic => {
      eventLog.length = 0;
      expandedEvents.clear();
      writeStoredValue("log", eventLog);
      renderActiveTab();
    });
    appendHeaderButton("copy log", "copy the whole log as JSON", (): Dynamic => {
      let logJson: Dynamic = exportLogJson(),
        copiedToClipboard: Dynamic = false;
      try {
        navigator.clipboard?.writeText(logJson).then(
          (): Dynamic => {
            copiedToClipboard = true;
          },
          (): Dynamic => {},
        );
      } catch {}
      setTimeout((): Dynamic => {
        if (copiedToClipboard || panelBody === null) return;
        panelBody.querySelector("textarea")?.remove();
        let clipboardFallback: Dynamic = createElement("textarea");
        clipboardFallback.readOnly = true;
        clipboardFallback.value = logJson;
        panelBody.prepend(clipboardFallback);
      }, 200);
    });
    appendHeaderButton(
      "\u2715",
      "close (Esc while the panel has focus, or " + HOT_DEBUG_SHORTCUT + ")",
      (): Dynamic => setPanelOpen(false),
    );
    let tabs: Dynamic = createElement("div", "tabs");
    for (let [tabIdToShow, tabLabel] of [
      ["events", "Events"],
      ["timing", "Timing"],
      ["files", "Files"],
      ["queue", "Save queue"],
      ["reloads", "Reloads"],
    ] as Dynamic) {
      let tabButton: Dynamic = createElement("button", "tab", tabLabel);
      tabButton.setAttribute("data-tab", tabIdToShow);
      tabButton.addEventListener("click", (): Dynamic => {
        panelState.tab = tabIdToShow;
        persistPanelState();
        refreshActiveTab();
        renderActiveTab();
      });
      tabs.append(tabButton);
    }
    panelBody = createElement("div", "body");
    panel.append(resizeGrip, header, tabs, panelBody);
    panel.addEventListener("keydown", (event?: Dynamic): Dynamic => {
      event.key === "Escape" && (event.stopPropagation(), setPanelOpen(false));
    });
    container.append(statusChip, panel);
    let styleElement: Dynamic = createElement("style");
    styleElement.textContent = panelStyles;
    shadowRoot.replaceChildren(styleElement, container);
    panelState.open && setPanelOpen(true);
    try {
      new MutationObserver((): Dynamic => {
        themedContainer && (themedContainer.className = "t-" + readTheme());
      }).observe((document as Dynamic).documentElement, {
        attributes: true,
        attributeFilter: ["data-theme", "data-mode"],
      });
    } catch {}
    let innerWidth: Dynamic = (window as Dynamic).innerWidth,
      innerHeight: Dynamic = (window as Dynamic).innerHeight;
    (window as Dynamic).addEventListener("resize", (): Dynamic => {
      !panelState.open ||
        ((window as Dynamic).innerWidth === innerWidth &&
          (window as Dynamic).innerHeight === innerHeight) ||
        ((innerWidth = (window as Dynamic).innerWidth),
        (innerHeight = (window as Dynamic).innerHeight),
        applyPanelLayout());
    });
    setInterval(refreshStatus, 3e3);
  }
  function exportLogJson(): Dynamic {
    let statistics: Dynamic = {};
    for (let [label, samples] of timingSamples as Dynamic) {
      let sortedSamples: Dynamic = [...samples].sort(
        (left?: Dynamic, right?: Dynamic): Dynamic => left - right,
      );
      statistics[label] = {
        p50: quantile(sortedSamples, 0.5),
        p95: quantile(sortedSamples, 0.95),
        max: sortedSamples[sortedSamples.length - 1],
        n: sortedSamples.length,
      };
    }
    let files: Dynamic, queue: Dynamic;
    try {
      files = debugSources.files?.();
    } catch {}
    try {
      queue = debugSources.queue?.();
    } catch {}
    return JSON.stringify(
      {
        tab: tabId,
        reloadReason: reloadMessage,
        reasons: reloadCounts,
        reloads: reloadHistory,
        fields: Object.fromEntries(debugFacts),
        stats: statistics,
        excludedHidden: hiddenUpdateCount,
        phases: bootPhases,
        counters: saveFailureCounts,
        publishErrors: recentSaveFailures,
        series: updateMeasurements,
        files: files,
        queue: queue,
        log: eventLog,
      },
      null,
      1,
    );
  }
  let guardsInstalled: Dynamic = false;
  function installPanelEventGuards(): Dynamic {
    if (guardsInstalled || typeof window === "undefined") return;
    guardsInstalled = true;
    let eventIsInsidePanel: Dynamic = (event?: Dynamic): Dynamic => {
      try {
        return panel !== null && event.composedPath().includes(panel);
      } catch {
        return false;
      }
    };
    (window as Dynamic).addEventListener(
      "keydown",
      (event?: Dynamic): Dynamic => {
        if (
          event.ctrlKey &&
          !event.metaKey &&
          !event.altKey &&
          (event.key === "`" || event.code === "Backquote")
        ) {
          event.preventDefault();
          event.stopImmediatePropagation();
          setPanelOpen(!panelState.open);
          return;
        }
        eventIsInsidePanel(event) &&
          (event.stopImmediatePropagation(),
          event.key === "Escape" && setPanelOpen(false));
      },
      true,
    );
    for (let eventName of [
      "keyup",
      "keypress",
      "copy",
      "cut",
      "paste",
      "wheel",
      "contextmenu",
    ] as Dynamic)
      (window as Dynamic).addEventListener(
        eventName,
        (event?: Dynamic): Dynamic => {
          eventIsInsidePanel(event) && event.stopImmediatePropagation();
        },
        true,
      );
  }
  function mountPanel(mode?: Dynamic): Dynamic {
    if (
      mode !== "files" ||
      typeof document === "undefined" ||
      panelHost !== null
    )
      return;
    installPanelEventGuards();
    let attachPanelHost: Dynamic = (): Dynamic => {
      panelHost === null &&
        ((panelHost = (document as Dynamic).createElement("div")),
        panelHost.setAttribute("data-hot-debug", ""),
        (panelHost.style.cssText =
          "position:fixed;left:0;top:0;width:0;height:0;z-index:2147483000;pointer-events:none"),
        (shadowRoot = panelHost.attachShadow({
          mode: "open",
        })),
        (
          (document as Dynamic).body ?? (document as Dynamic).documentElement
        ).appendChild(panelHost),
        buildPanel());
    };
    (document as Dynamic).body !== null
      ? attachPanelHost()
      : (document as Dynamic).addEventListener(
          "DOMContentLoaded",
          attachPanelHost,
          {
            once: true,
          },
        );
  }
  recordEvent("boot", {
    reason: reloadMessage,
    viaHot: wasHotRestart,
    ...(restartSource != null
      ? {
          hotFrom: restartSource,
        }
      : {}),
    ...(previousBootMarker !== null
      ? {
          crumb: previousBootMarker,
        }
      : {}),
  });
  return {
    tab: tabId,
    reloadReason: reloadMessage,
    field(field: Dynamic, fieldValue: Dynamic): Dynamic {
      debugFacts.set(field, fieldValue);
      scheduleRender("header");
    },
    event: recordEvent,
    hotEvent: onHotEvent,
    beforeRestart: recordRestart,
    saveStart: recordSaveStart,
    saveEnd: recordSaveEnd,
    phase: recordBootPhase,
    read: recordFileRead,
    visible: recordVisibleUpdate,
    sample: recordTiming,
    mount: mountPanel,
    exportJson: exportLogJson,
    option: registerToggle,
    provide(sources: Dynamic): Dynamic {
      debugSources = {
        ...debugSources,
        ...sources,
      };
      scheduleRender("files");
      scheduleRender("queue");
    },
  };
}
function createNoopHotDebugger(): Dynamic {
  let callback: Dynamic = (): Dynamic => {};
  return {
    tab: "",
    reloadReason: "",
    field: callback,
    event: callback,
    hotEvent: callback,
    beforeRestart: callback,
    saveStart: (): Dynamic => 0,
    saveEnd: callback,
    phase: callback,
    read: callback,
    visible: callback,
    sample: callback,
    mount: callback,
    exportJson: (): Dynamic => "{}",
    option: (): Dynamic => (): Dynamic => true,
    provide: callback,
  };
}
function createHotDebugger(debugOptions?: Dynamic): Dynamic {
  return isFilesDebugEnabled()
    ? createHotReloadDebugger(debugOptions)
    : createNoopHotDebugger();
}
export {
  abbreviateHotDebugValue,
  classifyHotDebugEvent,
  classifyHotEditMetric,
  createHotDebugger,
  createHotDebugTabId,
  createHotReloadDebugger,
  createNoopHotDebugger,
  FILES_DEBUG_STORAGE_KEY,
  formatHotDebugTimestamp,
  MAX_VISIBLE_EVENTS as HOT_DEBUG_LOG_DEBOUNCE_MS,
  HOT_DEBUG_MIN_PANEL_SIZE,
  HOT_DEBUG_PANEL_SIZE,
  MAX_PERSISTED_EVENTS as HOT_DEBUG_RENDER_DEBOUNCE_MS,
  MAX_RETAINED_EVENTS as HOT_DEBUG_SAMPLE_PERIOD_MS,
  HOT_DEBUG_SHORTCUT,
  isFilesDebugEnabled,
  quantile,
};
export function installPlatformHotDebugger(): () => void {
  return () => {
    FILES_DEBUG_STORAGE_KEY = "appifact-files-debug";
    MAX_RETAINED_EVENTS = 1500;
    MAX_PERSISTED_EVENTS = 150;
    MAX_VISIBLE_EVENTS = 250;
    HOT_DEBUG_PANEL_SIZE = {
      bottom: 300,
      right: 440,
    };
    HOT_DEBUG_MIN_PANEL_SIZE = {
      bottom: 140,
      right: 300,
    };
    HOT_DEBUG_SHORTCUT = "Ctrl+`";
    createHotDebugTabId = (): Dynamic => Math.random().toString(36).slice(2, 6);
    formatHotDebugTimestamp = (timestamp?: Dynamic): Dynamic =>
      new Date(timestamp).toISOString().slice(11, 23);
    abbreviateHotDebugValue = (text?: Dynamic): Dynamic =>
      text == null || text === ""
        ? "\u2014"
        : text.length > 18
          ? text.slice(0, 10) + "\u2026" + text.slice(-4)
          : text;
  };
}
