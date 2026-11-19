/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { CanvasMeasurementsAZaZPattern as EXPORT_REQUEST_ID_PATTERN, CanvasMeasurementsConstant as MAX_EXPORT_FORMATS, CanvasMeasurementsConstant_2 as MAX_EXPORT_VARIANTS, CanvasMeasurementsConstant_3 as MAX_DESTINATIONS, CanvasMeasurementsConstant_4 as MAX_FOOT_INSET, CanvasMeasurementsIsSafeInteger as normalizeExportWindowMs, CanvasMeasurementsPattern as EXPORT_FORMAT_PATTERN, CanvasMeasurementsPattern_2 as EXPORT_VARIANT_ID_PATTERN, CanvasMeasurementsPattern_3 as DESTINATION_ID_PATTERN, CanvasMeasurementsPattern_4 as FOOT_GROUND_PATTERN, OpenFindValue, reactCanvasMeasurements_2 as React, SaveNowValue } from "../canvas/measurements";
import { initializeCdsIndex } from "../cds/index";
import { load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var DEFAULT_HOST_ORIGINS: Dynamic;
var allowedFrameHostOrigins: Dynamic;
var cachedFrameHostBridge: Dynamic;
var PanelValue: Dynamic;
var PopoverValue: Dynamic;
var reactPlatformFrameHostBridge: Dynamic;
function hostSaveStatus(status?: Dynamic): Dynamic {
  switch (status) {
    case "loading":
      return null;
    case "cached":
      return "reconnecting";
    case "ready":
    case "saved":
      return "saved";
    case "dirty":
    case "saving":
      return "saving";
    case "readonly":
      return "readonly";
    case "error":
      return "unsaved";
  }
}
function getHostOrigins(hostWindow?: Dynamic): Dynamic {
  let origins: Dynamic = hostWindow.__FRAME_PREAMBLE?.origins;
  return Array.isArray(origins)
    ? origins.filter((origin?: Dynamic): Dynamic => typeof origin == "string")
    : DEFAULT_HOST_ORIGINS;
}
function isAllowedHostOrigin(origin?: Dynamic, allowedOrigins?: Dynamic): Dynamic {
  for (let allowedOrigin of allowedOrigins as Dynamic)
    if (allowedOrigin.endsWith(":*"))
      try {
        let url: Dynamic = new URL(origin);
        if (`${url.protocol}//${url.hostname}:*` === allowedOrigin) return true;
      } catch {}
    else if (origin === allowedOrigin) return true;
  return false;
}
function normalizeHostExports(formats?: Dynamic): Dynamic {
  let normalizedFormats: Dynamic = [],
    seenFormats: Dynamic = new Set();
  for (let entry of formats as Dynamic) {
    if (
      typeof entry.format != "string" ||
      !EXPORT_FORMAT_PATTERN.test(entry.format) ||
      seenFormats.has(entry.format)
    )
      continue;
    seenFormats.add(entry.format);
    let isHandoff: Dynamic = entry.handoff === true,
      format: Dynamic = {
        format: entry.format,
        ...(entry.disabled === true && {
          disabled: true,
        }),
        ...(!isHandoff &&
          entry.interactive === true && {
            interactive: true,
          }),
        ...(!isHandoff &&
          entry.bundle === true && {
            bundle: true,
          }),
        ...(isHandoff && {
          handoff: isHandoff,
        }),
      },
      variants: Dynamic =
        !isHandoff && Array.isArray(entry.variants)
          ? normalizeHostFindCommands(entry.variants)
          : [];
    variants.length > 0 && (format.variants = variants);
    normalizedFormats.push(format);
    if (normalizedFormats.length === MAX_EXPORT_FORMATS) break;
  }
  return normalizedFormats;
}
function normalizeHostFindCommands(commands?: Dynamic): Dynamic {
  let normalizedCommands: Dynamic = [],
    seenIds: Dynamic = new Set();
  for (let command of commands as Dynamic)
    if (
      !(
        typeof command?.id != "string" ||
        !EXPORT_VARIANT_ID_PATTERN.test(command.id) ||
        seenIds.has(command.id)
      ) &&
      (seenIds.add(command.id),
      normalizedCommands.push(
        command.disabled === true
          ? {
              id: command.id,
              disabled: true,
            }
          : {
              id: command.id,
            },
      ),
      normalizedCommands.length === MAX_EXPORT_VARIANTS)
    )
      break;
  return normalizedCommands;
}
function normalizeHostCanvasCommands(commands?: Dynamic): Dynamic {
  let normalizedCommands: Dynamic = [],
    seenIds: Dynamic = new Set();
  for (let command of commands as Dynamic)
    if (
      !(
        typeof command.id != "string" ||
        !DESTINATION_ID_PATTERN.test(command.id) ||
        seenIds.has(command.id)
      ) &&
      (seenIds.add(command.id),
      normalizedCommands.push(
        command.disabled === true
          ? {
              id: command.id,
              disabled: true,
            }
          : {
              id: command.id,
            },
      ),
      normalizedCommands.length === MAX_DESTINATIONS)
    )
      break;
  return normalizedCommands;
}
function normalizeHostSelectionPaths(paths?: Dynamic): Dynamic {
  return Array.isArray(paths) &&
    paths.length <= 8 &&
    paths.every((path?: Dynamic): Dynamic => typeof path == "string")
    ? paths
    : [];
}
function createFrameHostBridge(bridgeOptions?: Dynamic): Dynamic {
  let parentWindow: Dynamic = bridgeOptions.parentWindow,
    // MineDesign: trustParent (from __FRAME_PREAMBLE) trusts window.parent itself instead of an origin list.
    // The desktop parent page is file:// (opaque origin "null", which postMessage cannot target), so replies go to "*".
    trustParent: Dynamic = bridgeOptions.trustParent === true,
    replyOrigin: Dynamic = null,
    hostShowsRows: Dynamic = false,
    hostFeatures: Dynamic = new Set(),
    canOpenFind: Dynamic = false,
    openFindHandler: Dynamic = null,
    saveState: Dynamic = null,
    exportFormats: Dynamic = null,
    destinations: Dynamic = null,
    foot: Dynamic = null,
    leaveWorkHolds: Dynamic = 0,
    snapshot: Dynamic = null,
    serializedSnapshot: Dynamic,
    saveNowHandler: Dynamic = null,
    destinationHandler: Dynamic = null,
    exportHandler: Dynamic = null,
    chromeListeners: Dynamic = new Set(),
    showsSave: Dynamic = (): Dynamic => hostShowsRows && snapshot?.saved !== undefined,
    showsReadOnly: Dynamic = (): Dynamic =>
      hostShowsRows && hostFeatures.has("readonly") && snapshot?.saved === "readonly",
    showsClaudeTips: Dynamic = (): Dynamic => hostShowsRows && hostFeatures.has("claude_tips"),
    handlesRetry: Dynamic = (): Dynamic =>
      showsSave() &&
      saveNowHandler !== null &&
      snapshot?.actions?.some(
        (action?: Dynamic): Dynamic => action.id === SaveNowValue,
      ) === true,
    chromeStateKey: Dynamic = (): Dynamic =>
      String(showsSave()) +
      String(handlesRetry()) +
      String(showsReadOnly()) +
      String(showsClaudeTips()),
    lastChromeStateKey: Dynamic = chromeStateKey(),
    notifyChromeListeners: Dynamic = (): Dynamic => {
      let nextChromeStateKey: Dynamic = chromeStateKey();
      if (nextChromeStateKey !== lastChromeStateKey) {
        lastChromeStateKey = nextChromeStateKey;
        for (let listener of chromeListeners as Dynamic)
          try {
            listener();
          } catch {}
      }
    },
    buildSnapshot: Dynamic = (): Dynamic => {
      if (
        saveState === null &&
        exportFormats === null &&
        destinations === null &&
        foot === null &&
        leaveWorkHolds === 0
      )
        return null;
      let state: Dynamic = {
        v: 1,
      };
      saveState !== null &&
        ((state.saved = saveState.saved),
        (state.actions = saveState.saveNow
          ? [
              {
                id: SaveNowValue,
              },
            ]
          : []));
      leaveWorkHolds > 0 && (state.leaveLosesWork = true);
      let exports: Dynamic =
          exportFormats?.filter(
            (format?: Dynamic): Dynamic => format.handoff !== true,
          ) ?? [],
        handoffs: Dynamic =
          exportFormats
            ?.filter((format?: Dynamic): Dynamic => format.handoff === true)
            .map(
              ({ handoff: _handoff, ...props }: Dynamic): Dynamic => props,
            ) ?? [];
      exports.length > 0 && (state.exports = exports);
      handoffs.length > 0 && (state.handoffs = handoffs);
      destinations !== null && (state.destinations = destinations);
      foot?.footInset !== undefined && (state.footInset = foot.footInset);
      foot?.ground !== undefined && (state.ground = foot.ground);
      return state;
    },
    refreshSnapshot: Dynamic = (): Dynamic => {
      let baseSnapshot: Dynamic = buildSnapshot(),
        snapshotWithDefaults: Dynamic = baseSnapshot ?? {
          v: 1,
        },
        nextSnapshot: Dynamic = canOpenFind
          ? {
              ...snapshotWithDefaults,
              actions: [
                ...(snapshotWithDefaults.actions ?? []),
                {
                  id: OpenFindValue,
                },
              ],
            }
          : baseSnapshot,
        nextSerializedSnapshot: Dynamic = JSON.stringify(nextSnapshot);
      nextSerializedSnapshot !== serializedSnapshot &&
        ((snapshot = nextSnapshot),
        (serializedSnapshot = nextSerializedSnapshot),
        replyOrigin !== null && postSnapshot(nextSnapshot, replyOrigin),
        notifyChromeListeners());
    },
    canExport: Dynamic = (format?: Dynamic, variantId?: Dynamic): Dynamic => {
      let exportFormat: Dynamic = [
        ...(snapshot?.exports ?? []),
        ...(snapshot?.handoffs ?? []),
      ].find(
        (entry?: Dynamic): Dynamic =>
          entry.format === format && entry.disabled !== true,
      );
      return exportFormat === undefined
        ? false
        : variantId === undefined ||
            exportFormat.variants?.some(
              (variant?: Dynamic): Dynamic =>
                variant.id === variantId && variant.disabled !== true,
            ) === true;
    },
    postSnapshot: Dynamic = (snapshotToPost?: Dynamic, targetOrigin?: Dynamic): Dynamic => {
      try {
        parentWindow?.postMessage(
          {
            __frame_chrome_report: true,
            snapshot: snapshotToPost,
          },
          targetOrigin,
        );
      } catch {}
    },
    handleHostMessage: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        parentWindow === null ||
        event.source !== parentWindow ||
        (!trustParent && !isAllowedHostOrigin(event.origin, bridgeOptions.origins))
      )
        return;
      let data: Dynamic = event.data,
        isHandshake: Dynamic = data?.__frame_chrome_poke === true,
        isCommand: Dynamic = data?.__frame_chrome_cmd === true;
      if (!(!isHandshake && !isCommand)) {
        replyOrigin = trustParent ? "*" : event.origin;
        data?.rows !== false && (hostShowsRows = true);
        isHandshake &&
          (hostFeatures = new Set(normalizeHostSelectionPaths(data?.words)));
        isHandshake && snapshot !== null && postSnapshot(snapshot, replyOrigin);
        notifyChromeListeners();
        if (
          isCommand &&
          data?.cmd === "action" &&
          data.id === OpenFindValue &&
          snapshot?.actions?.some(
            (action?: Dynamic): Dynamic =>
              action.id === OpenFindValue,
          )
        )
          try {
            openFindHandler?.();
          } catch (error: Dynamic) {
            typeof reportError == "function"
              ? reportError(error)
              : console.error(error);
          }
        if (
          isCommand &&
          data?.cmd === "action" &&
          data.id === SaveNowValue &&
          snapshot?.actions?.some(
            (action?: Dynamic): Dynamic => action.id === SaveNowValue,
          )
        )
          try {
            saveNowHandler?.();
          } catch (error: Dynamic) {
            typeof reportError == "function"
              ? reportError(error)
              : console.error(error);
          }
        if (isCommand && data?.cmd === "action" && typeof data.id == "string") {
          let destination: Dynamic = snapshot?.destinations?.find(
            (entry?: Dynamic): Dynamic => entry.id === data.id,
          );
          if (destination !== undefined && destination.disabled !== true)
            try {
              destinationHandler?.(data.id);
            } catch (error: Dynamic) {
              typeof reportError == "function"
                ? reportError(error)
                : console.error(error);
            }
        }
        if (isCommand && data?.cmd === "export") {
          let {
            format: format,
            request: requestId,
            interactive: interactive,
            variant: variant,
            bundle: bundle,
            windowMs: windowMs,
            sender: sender,
          }: Dynamic = data;
          if (
            typeof format == "string" &&
            EXPORT_FORMAT_PATTERN.test(format) &&
            (variant === undefined ||
              (typeof variant == "string" &&
                EXPORT_VARIANT_ID_PATTERN.test(variant))) &&
            canExport(format, variant) &&
            typeof requestId == "string" &&
            EXPORT_REQUEST_ID_PATTERN.test(requestId)
          )
            try {
              exportHandler?.(
                format,
                requestId,
                interactive === true,
                variant,
                interactive === true && bundle === true,
                normalizeExportWindowMs(windowMs),
                interactive !== true &&
                  (sender === "viewer" || sender === "claude")
                  ? sender
                  : undefined,
              );
            } catch (error: Dynamic) {
              typeof reportError == "function"
                ? reportError(error)
                : console.error(error);
            }
        }
      }
    };
  if (parentWindow !== null) {
    bridgeOptions.ownWindow.addEventListener("message", handleHostMessage);
    for (let origin of (trustParent ? ["*"] : bridgeOptions.origins) as Dynamic)
      if (!origin.endsWith(":*"))
        try {
          parentWindow.postMessage(
            {
              __frame_chrome_hello: true,
            },
            origin,
          );
        } catch {}
  }
  return {
    report(status: Dynamic, canSaveNow: Dynamic = false): Dynamic {
      parentWindow !== null &&
        ((saveState =
          status === null
            ? null
            : {
                saved: status,
                saveNow: canSaveNow,
              }),
        refreshSnapshot());
    },
    setSaveNowHandler(handler: Dynamic): Dynamic {
      saveNowHandler = handler;
      notifyChromeListeners();
    },
    setDestinations(entries: Dynamic): Dynamic {
      if (parentWindow === null) return;
      let normalizedDestinations: Dynamic =
        entries === null ? [] : normalizeHostCanvasCommands(entries);
      destinations = normalizedDestinations.length === 0 ? null : normalizedDestinations;
      refreshSnapshot();
    },
    setDestinationHandler(handler: Dynamic): Dynamic {
      destinationHandler = handler;
    },
    setFoot(layout: Dynamic): Dynamic {
      if (parentWindow === null) return;
      let normalizedFoot: Dynamic = {};
      layout !== null &&
        typeof layout.inset == "number" &&
        Number.isFinite(layout.inset) &&
        (normalizedFoot.footInset = Math.min(
          Math.max(0, Math.round(layout.inset)),
          MAX_FOOT_INSET,
        ));
      let ground: Dynamic =
        typeof layout?.ground == "string"
          ? layout.ground.toLowerCase()
          : null;
      ground !== null &&
        FOOT_GROUND_PATTERN.test(ground) &&
        (normalizedFoot.ground = ground);
      foot =
        normalizedFoot.footInset === undefined && normalizedFoot.ground === undefined
          ? null
          : normalizedFoot;
      refreshSnapshot();
    },
    setExports(formats: Dynamic): Dynamic {
      if (parentWindow === null) return;
      let normalizedFormats: Dynamic =
        formats === null ? [] : normalizeHostExports(formats);
      exportFormats = normalizedFormats.length === 0 ? null : normalizedFormats;
      refreshSnapshot();
    },
    setExportHandler(handler: Dynamic): Dynamic {
      exportHandler = handler;
    },
    setFind(enabled: Dynamic, handler: Dynamic): Dynamic {
      openFindHandler = handler;
      !(parentWindow === null || canOpenFind === enabled) &&
        ((canOpenFind = enabled), refreshSnapshot());
    },
    declineExport(requestId: Dynamic, cancelled: Dynamic = false): Dynamic {
      if (
        !(
          parentWindow === null ||
          replyOrigin === null ||
          !EXPORT_REQUEST_ID_PATTERN.test(requestId)
        )
      )
        try {
          parentWindow.postMessage(
            {
              __frame_chrome_decline: true,
              request: requestId,
              ...(cancelled && {
                cancelled: cancelled,
              }),
            },
            replyOrigin,
          );
        } catch {}
    },
    holdLeaveLosesWork(): Dynamic {
      if (parentWindow === null) return (): Dynamic => {};
      let released: Dynamic = false;
      leaveWorkHolds += 1;
      refreshSnapshot();
      return (): Dynamic => {
        released || ((released = true), (leaveWorkHolds -= 1), refreshSnapshot());
      };
    },
    witnessed: (): Dynamic => hostShowsRows,
    hostDrawsSave: showsSave,
    hostDrawsReadOnly: showsReadOnly,
    hostDrawsClaudeTips: showsClaudeTips,
    hostTakesRetry: handlesRetry,
    subscribeHostDrawsSave(listener: Dynamic): Dynamic {
      chromeListeners.add(listener);
      return (): Dynamic => {
        chromeListeners.delete(listener);
      };
    },
    dispose(): Dynamic {
      parentWindow !== null &&
        bridgeOptions.ownWindow.removeEventListener("message", handleHostMessage);
      chromeListeners.clear();
    },
  };
}
function isTrustedHostOrigin(origin?: Dynamic): Dynamic {
  return isAllowedHostOrigin(origin, allowedFrameHostOrigins);
}
function postToFrameHost(
  message?: Dynamic,
  ownWindow: Dynamic = window,
  allowedOrigins: Dynamic = allowedFrameHostOrigins,
): Dynamic {
  if (ownWindow.parent === ownWindow) return;
  let ancestorOrigin: Dynamic = ownWindow.location.ancestorOrigins?.[0];
  for (let origin of (ancestorOrigin !== undefined &&
  isAllowedHostOrigin(ancestorOrigin, allowedOrigins)
    ? [ancestorOrigin]
    : allowedOrigins) as Dynamic)
    if (!origin.endsWith(":*"))
      try {
        ownWindow.parent.postMessage(message, origin);
      } catch {}
}
function getFrameHostBridge(): Dynamic {
  if (cachedFrameHostBridge === null) {
    let hasParentFrame: Dynamic =
      typeof window == "object" && (window as Dynamic).parent !== window;
    cachedFrameHostBridge = createFrameHostBridge({
      ownWindow: window,
      parentWindow: hasParentFrame ? (window as Dynamic).parent : null,
      origins: allowedFrameHostOrigins,
      // MineDesign: set by packages/design/src/editor before the runtime starts (docs/design/canvas §5).
      trustParent: (window as Dynamic).__FRAME_PREAMBLE?.trustParent === true,
    });
  }
  return cachedFrameHostBridge;
}
function reportFrameSaveState(status?: Dynamic, canSaveNow?: Dynamic): Dynamic {
  getFrameHostBridge().report(status, canSaveNow);
}
function setFrameExports(formats?: Dynamic): Dynamic {
  getFrameHostBridge().setExports(formats);
}
function setFrameExportHandler(handler?: Dynamic): Dynamic {
  getFrameHostBridge().setExportHandler(handler);
}
function declineFrameExport(requestId?: Dynamic, cancelled?: Dynamic): Dynamic {
  getFrameHostBridge().declineExport(requestId, cancelled);
}
function useFrameSaveState(status?: Dynamic, onSaveNow?: Dynamic): Dynamic {
  let lastWasError: Dynamic = (0, React.useRef)(false),
    isRetrying: Dynamic = status === "loading" && lastWasError.current;
  status !== "loading" && (lastWasError.current = status === "error");
  let hostStatus: Dynamic =
      status === null ? null : isRetrying ? "saving" : hostSaveStatus(status),
    canSaveNow: Dynamic =
      onSaveNow !== undefined && (status === "error" || status === "dirty"),
    onSaveNowRef: Dynamic = (0, React.useRef)(onSaveNow);
  onSaveNowRef.current = onSaveNow;
  (0, React.useEffect)((): Dynamic => {
    reportFrameSaveState(hostStatus, canSaveNow);
  }, [hostStatus, canSaveNow]);
  (0, React.useEffect)(
    (): Dynamic => (
      getFrameHostBridge().setSaveNowHandler(
        (): Dynamic => onSaveNowRef.current?.(),
      ),
      (): Dynamic => {
        getFrameHostBridge().setSaveNowHandler(null);
        reportFrameSaveState(null);
      }
    ),
    [],
  );
}
function useFrameFind(enabled?: Dynamic, onOpenFind?: Dynamic): Dynamic {
  let onOpenFindRef: Dynamic = (0, React.useRef)(onOpenFind);
  onOpenFindRef.current = onOpenFind;
  (0, React.useEffect)(
    (): Dynamic => (
      getFrameHostBridge().setFind(enabled, (): Dynamic => onOpenFindRef.current()),
      (): Dynamic => getFrameHostBridge().setFind(false, null)
    ),
    [enabled],
  );
}
function hostDrawsSave(): Dynamic {
  return getFrameHostBridge().hostDrawsSave();
}
function hostDrawsReadOnly(): Dynamic {
  return getFrameHostBridge().hostDrawsReadOnly();
}
function useHostDrawsClaudeTips(): Dynamic {
  return (0, React.useSyncExternalStore)(
    subscribeHostChrome,
    (): Dynamic => getFrameHostBridge().hostDrawsClaudeTips(),
    (): Dynamic => false,
  );
}
function hostHandlesRetry(): Dynamic {
  return getFrameHostBridge().hostTakesRetry();
}
function subscribeHostChrome(listener?: Dynamic): Dynamic {
  return getFrameHostBridge().subscribeHostDrawsSave(listener);
}
export {
  allowedFrameHostOrigins,
  createFrameHostBridge,
  cachedFrameHostBridge as createFrameHostBridgeValue,
  declineFrameExport,
  getFrameHostBridge,
  getHostOrigins,
  hostDrawsReadOnly,
  hostDrawsSave,
  hostHandlesRetry,
  hostSaveStatus,
  isAllowedHostOrigin,
  isTrustedHostOrigin,
  normalizeHostCanvasCommands,
  normalizeHostExports,
  normalizeHostFindCommands,
  normalizeHostSelectionPaths,
  PanelValue,
  DEFAULT_HOST_ORIGINS as PlatformFrameHostBridgeItems,
  PopoverValue,
  postToFrameHost,
  reactPlatformFrameHostBridge,
  reportFrameSaveState,
  setFrameExportHandler,
  setFrameExports,
  subscribeHostChrome,
  useFrameFind,
  useFrameSaveState,
  useHostDrawsClaudeTips,
};
export function installPlatformFrameHostBridge(): () => void {
  return () => {
    // MineDesign: no host frame is trusted by default; the editor talks to MineDesign through its own shim
    // (packages/design/src/editor). A page that needs this bridge declares origins in __FRAME_PREAMBLE,
    // or trustParent: the design editor does, so MineDesign can drive whole-design export (createFrameHostBridge).
    DEFAULT_HOST_ORIGINS = [];
    allowedFrameHostOrigins = ((): Dynamic => {
      try {
        return typeof window == "object"
          ? getHostOrigins(window)
          : DEFAULT_HOST_ORIGINS;
      } catch {
        return DEFAULT_HOST_ORIGINS;
      }
    })();
    cachedFrameHostBridge = null;
    PanelValue = "panel";
    PopoverValue = "popover";
    reactPlatformFrameHostBridge = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
  };
}
