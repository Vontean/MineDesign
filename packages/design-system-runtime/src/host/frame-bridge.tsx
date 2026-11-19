import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var react_z: typeof React;
var SAVE_NOW_COMMAND: string;
var OPEN_FIND_COMMAND: string;
var EXPORT_FORMAT_PATTERN: RegExp;
var validExportTimeout: (input: unknown) => number | undefined;
var MAX_HOST_EXPORT_FORMATS: number;
var HOST_DESTINATION_PATTERN: RegExp;
var MAX_HOST_DESTINATIONS: number;
var HOST_REQUEST_ID_PATTERN: RegExp;
var HOST_COMMAND_PATTERN: RegExp;
var MAX_HOST_COMMANDS: number;
var MAX_HOST_FOOT_INSET: number;
var HOST_BACKGROUND_HEX_PATTERN: RegExp;
var DEFAULT_HOST_ORIGINS: string[];
var allowedHostOrigins: string[];
var hostFrameBridge: Host.HostFrameBridge | null;
function hostSaveStatus(
  status: Host.SaveState["status"],
): null | string | undefined {
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
function hostOrigins(ownWindow: Host.ProtocolGlobal): string[] {
  let value = ownWindow.__FRAME_PREAMBLE?.origins;
  if (Array.isArray(value)) {
    return (value as unknown[]).filter(
      (candidate: unknown): candidate is string => typeof candidate === "string",
    );
  }
  return DEFAULT_HOST_ORIGINS;
}
function isAllowedHostOrigin(
  origin: string,
  allowedOrigins: readonly string[],
): boolean {
  for (let value of allowedOrigins) {
    if (value.endsWith(":*")) {
      try {
        let parsedOrigin = new URL(origin);
        if (`${parsedOrigin.protocol}//${parsedOrigin.hostname}:*` === value) {
          return true;
        }
      } catch {}
    } else if (origin === value) {
      return true;
    }
  }
  return false;
}
function normalizeHostExportFormats(
  formats: readonly {
    format?: unknown;
    disabled?: unknown;
    handoff?: unknown;
    interactive?: unknown;
    bundle?: unknown;
    variants?: unknown;
  }[],
): Host.HostExport[] {
  let items = [],
    values = new Set();
  for (let value of formats) {
    if (
      typeof value.format !== "string" ||
      !EXPORT_FORMAT_PATTERN.test(value.format) ||
      values.has(value.format)
    ) {
      continue;
    }
    values.add(value.format);
    let isHandoff: boolean = value.handoff === true,
      state: Host.HostExport = {
        format: value.format,
        ...(value.disabled === true && {
          disabled: true,
        }),
        ...(!isHandoff &&
          value.interactive === true && {
            interactive: true,
          }),
        ...(!isHandoff &&
          value.bundle === true && {
            bundle: true,
          }),
        ...(isHandoff && {
          handoff: isHandoff,
        }),
      },
      variantIds =
        !isHandoff && Array.isArray(value.variants)
          ? normalizeHostDestinations(value.variants)
          : [];
    if (variantIds.length > 0) {
      state.variants = variantIds;
    }
    items.push(state);
    if (items.length === MAX_HOST_EXPORT_FORMATS) {
      break;
    }
  }
  return items;
}
function normalizeHostDestinations(
  destinations: readonly (
    | {
        id?: unknown;
        disabled?: unknown;
      }
    | null
    | undefined
  )[],
): Host.HostDestination[] {
  let items = [],
    values = new Set();
  for (let value of destinations) {
    if (
      typeof value?.id !== "string" ||
      !HOST_DESTINATION_PATTERN.test(value.id) ||
      values.has(value.id)
    ) {
      continue;
    }
    values.add(value.id);
    items.push(
      value.disabled === true
        ? {
            id: value.id,
            disabled: true,
          }
        : {
            id: value.id,
          },
    );
    if (items.length === MAX_HOST_DESTINATIONS) {
      break;
    }
  }
  return items;
}
function normalizeHostCommands(
  commands: readonly {
    id?: unknown;
    disabled?: unknown;
  }[],
): Host.HostDestination[] {
  let items = [],
    values = new Set();
  for (let value of commands) {
    if (
      typeof value.id !== "string" ||
      !HOST_COMMAND_PATTERN.test(value.id) ||
      values.has(value.id)
    ) {
      continue;
    }
    values.add(value.id);
    items.push(
      value.disabled === true
        ? {
            id: value.id,
            disabled: true,
          }
        : {
            id: value.id,
          },
    );
    if (items.length === MAX_HOST_COMMANDS) {
      break;
    }
  }
  return items;
}
function normalizeHostTips(tips: unknown): string[] {
  if (
    Array.isArray(tips) &&
    tips.length <= 8 &&
    tips.every((tip: unknown): tip is string => typeof tip === "string")
  ) {
    return tips;
  } else {
    return [];
  }
}
function createHostFrameBridge(
  bridgeOptions: Host.HostFrameOptions,
): Host.HostFrameBridge {
  let parentWindow = bridgeOptions.parentWindow,
    hostOrigin: string | null = null,
    hostAcknowledgedRows: boolean = false,
    hostChromeWords = new Set<string>(),
    findEnabled = false,
    findHandler: (() => void) | null = null,
    saveReport: {
      saved: string | null | undefined;
      saveNow: boolean;
    } | null = null,
    exportFormats: Host.HostExport[] | null = null,
    destinations: Host.HostDestination[] | null = null,
    footerReport: Host.HostFoot | null = null,
    unsavedLeaveHolds = 0,
    currentSnapshot: Host.HostSnapshot | null = null,
    previousSnapshotJson: string | undefined,
    saveNowHandler: (() => void) | null = null,
    destinationHandler: ((id: string) => void) | null = null,
    exportHandler: Host.HostExportHandler | null = null,
    hostChromeListeners = new Set<() => void>(),
    hostDrawsSaveCapability = () =>
      hostAcknowledgedRows && currentSnapshot?.saved !== undefined,
    hostDrawsReadOnlyCapability = () =>
      hostAcknowledgedRows &&
      hostChromeWords.has("readonly") &&
      currentSnapshot?.saved === "readonly",
    hostDrawsClaudeTips = () =>
      hostAcknowledgedRows && hostChromeWords.has("claude_tips"),
    hostTakesRetryCapability = () =>
      hostDrawsSaveCapability() &&
      saveNowHandler !== null &&
      currentSnapshot?.actions?.some(
        (command): boolean => command.id === SAVE_NOW_COMMAND,
      ) === true,
    hostChromeStateKey = (): string =>
      String(hostDrawsSaveCapability()) +
      String(hostTakesRetryCapability()) +
      String(hostDrawsReadOnlyCapability()) +
      String(hostDrawsClaudeTips()),
    previousHostChromeStateKey = hostChromeStateKey(),
    notifyHostChromeChanged = (): void => {
      let value = hostChromeStateKey();
      if (value === previousHostChromeStateKey) {
        return;
      }
      previousHostChromeStateKey = value;
      for (let listener of hostChromeListeners) {
        try {
          listener();
        } catch {}
      }
    },
    buildChromeSnapshot = () => {
      if (
        saveReport === null &&
        exportFormats === null &&
        destinations === null &&
        footerReport === null &&
        unsavedLeaveHolds === 0
      ) {
        return null;
      }
      let state: Host.HostSnapshot = {
        v: 1,
      };
      if (saveReport !== null) {
        state.saved = saveReport.saved;
        state.actions = saveReport.saveNow
          ? [
              {
                id: SAVE_NOW_COMMAND,
              },
            ]
          : [];
      }
      if (unsavedLeaveHolds > 0) {
        state.leaveLosesWork = true;
      }
      let value =
          exportFormats?.filter((format): boolean => format.handoff !== true) ??
          [],
        handoffFormats =
          exportFormats
            ?.filter((format): boolean => format.handoff === true)
            .map(({ handoff: handoff, ...props }) => props) ?? [];
      if (value.length > 0) {
        state.exports = value;
      }
      if (handoffFormats.length > 0) {
        state.handoffs = handoffFormats;
      }
      if (destinations !== null) {
        state.destinations = destinations;
      }
      if (footerReport?.footInset !== undefined) {
        state.footInset = footerReport.footInset;
      }
      if (footerReport?.ground !== undefined) {
        state.ground = footerReport.ground;
      }
      return state;
    },
    refreshChromeSnapshot = (): void => {
      let value = buildChromeSnapshot(),
        snapshot = value ?? {
          v: 1,
        },
        enabledSnapshot = findEnabled
          ? {
              ...snapshot,
              actions: [
                ...(snapshot.actions ?? []),
                {
                  id: OPEN_FIND_COMMAND,
                },
              ],
            }
          : value,
        snapshotJson = JSON.stringify(enabledSnapshot);
      if (snapshotJson === previousSnapshotJson) {
        return;
      }
      currentSnapshot = enabledSnapshot;
      previousSnapshotJson = snapshotJson;
      if (hostOrigin !== null) {
        sendChromeSnapshot(enabledSnapshot, hostOrigin);
      }
      notifyHostChromeChanged();
    },
    exportVariantIsEnabled = (format: string, destination?: string) => {
      let value = [
        ...(currentSnapshot?.exports ?? []),
        ...(currentSnapshot?.handoffs ?? []),
      ].find((variant) => variant.format === format && variant.disabled !== true);
      if (value === undefined) {
        return false;
      }
      return (
        destination === undefined ||
        value.variants?.some(
          (variant) => variant.id === destination && variant.disabled !== true,
        ) === true
      );
    },
    sendChromeSnapshot = (
      snapshot: Host.HostSnapshot | null,
      destination: string,
    ): void => {
      try {
        parentWindow?.postMessage(
          {
            __frame_chrome_report: true,
            snapshot: snapshot,
          },
          destination,
        );
      } catch {}
    },
    handleHostChromeMessage = (dataset: MessageEvent<unknown>): void => {
      if (
        parentWindow === null ||
        dataset.source !== parentWindow ||
        !isAllowedHostOrigin(dataset.origin, bridgeOptions.origins)
      ) {
        return;
      }
      let data = dataset.data as Host.HostIncomingData | null | undefined,
        value: boolean = data?.__frame_chrome_poke === true,
        isChromeCommand: boolean = data?.__frame_chrome_cmd === true;
      if (!value && !isChromeCommand) {
        return;
      }
      hostOrigin = dataset.origin;
      if (data?.rows !== false) {
        hostAcknowledgedRows = true;
      }
      if (value) {
        hostChromeWords = new Set(normalizeHostTips(data?.words));
      }
      if (value && currentSnapshot !== null) {
        sendChromeSnapshot(currentSnapshot, dataset.origin);
      }
      notifyHostChromeChanged();
      if (
        isChromeCommand &&
        data?.cmd === "action" &&
        data.id === OPEN_FIND_COMMAND &&
        currentSnapshot?.actions?.some(
          (command): boolean => command.id === OPEN_FIND_COMMAND,
        )
      ) {
        try {
          findHandler?.();
        } catch (error: unknown) {
          if (typeof reportError === "function") {
            reportError(error);
          } else {
            console.error(error);
          }
        }
      }
      if (
        isChromeCommand &&
        data?.cmd === "action" &&
        data.id === SAVE_NOW_COMMAND &&
        currentSnapshot?.actions?.some(
          (command): boolean => command.id === SAVE_NOW_COMMAND,
        )
      ) {
        try {
          saveNowHandler?.();
        } catch (error: unknown) {
          if (typeof reportError === "function") {
            reportError(error);
          } else {
            console.error(error);
          }
        }
      }
      if (isChromeCommand && data?.cmd === "action" && typeof data.id === "string") {
        let matchingDestination = currentSnapshot?.destinations?.find(
          (destination): boolean => destination.id === data.id,
        );
        if (matchingDestination !== undefined && matchingDestination.disabled !== true) {
          try {
            destinationHandler?.(data.id);
          } catch (error: unknown) {
            if (typeof reportError === "function") {
              reportError(error);
            } else {
              console.error(error);
            }
          }
        }
      }
      if (isChromeCommand && data?.cmd === "export") {
        let {
          format: format,
          request: requestId,
          interactive: interactive,
          variant: destination,
          bundle: bundle,
          windowMs: timeoutMs,
          sender: sender,
        } = data;
        if (
          typeof format === "string" &&
          EXPORT_FORMAT_PATTERN.test(format) &&
          (destination === undefined ||
            (typeof destination === "string" &&
              HOST_DESTINATION_PATTERN.test(destination))) &&
          exportVariantIsEnabled(format, destination) &&
          typeof requestId === "string" &&
          HOST_REQUEST_ID_PATTERN.test(requestId)
        ) {
          try {
            exportHandler?.(
              format,
              requestId,
              interactive === true,
              destination,
              interactive === true && bundle === true,
              validExportTimeout(timeoutMs),
              interactive !== true && (sender === "viewer" || sender === "claude")
                ? sender
                : undefined,
            );
          } catch (error: unknown) {
            if (typeof reportError === "function") {
              reportError(error);
            } else {
              console.error(error);
            }
          }
        }
      }
    };
  if (parentWindow !== null) {
    bridgeOptions.ownWindow.addEventListener("message", handleHostChromeMessage);
    for (let value of bridgeOptions.origins) {
      if (value.endsWith(":*")) {
        continue;
      }
      try {
        parentWindow.postMessage(
          {
            __frame_chrome_hello: true,
          },
          value,
        );
      } catch {}
    }
  }
  return {
    report(message, saveNow = false): void {
      if (parentWindow === null) {
        return;
      }
      saveReport =
        message === null
          ? null
          : {
              saved: message,
              saveNow: saveNow,
            };
      refreshChromeSnapshot();
    },
    setSaveNowHandler(handler): void {
      saveNowHandler = handler;
      notifyHostChromeChanged();
    },
    setDestinations(commandDestinations): void {
      if (parentWindow === null) {
        return;
      }
      let value = commandDestinations === null ? [] : normalizeHostCommands(commandDestinations);
      destinations = value.length === 0 ? null : value;
      refreshChromeSnapshot();
    },
    setDestinationHandler(handler): void {
      destinationHandler = handler;
    },
    setFoot(foot): void {
      if (parentWindow === null) {
        return;
      }
      let state: Host.HostFoot = {};
      if (
        foot !== null &&
        typeof foot.inset === "number" &&
        Number.isFinite(foot.inset)
      ) {
        state.footInset = Math.min(
          Math.max(0, Math.round(foot.inset)),
          MAX_HOST_FOOT_INSET,
        );
      }
      let value =
        typeof foot?.ground === "string" ? foot.ground.toLowerCase() : null;
      if (value !== null && HOST_BACKGROUND_HEX_PATTERN.test(value)) {
        state.ground = value;
      }
      footerReport =
        state.footInset === undefined && state.ground === undefined
          ? null
          : state;
      refreshChromeSnapshot();
    },
    setExports(formats): void {
      if (parentWindow === null) {
        return;
      }
      let value = formats === null ? [] : normalizeHostExportFormats(formats);
      exportFormats = value.length === 0 ? null : value;
      refreshChromeSnapshot();
    },
    setExportHandler(handler): void {
      exportHandler = handler;
    },
    setFind(enabled, handler): void {
      findHandler = handler;
      if (parentWindow === null || findEnabled === enabled) {
        return;
      }
      findEnabled = enabled;
      refreshChromeSnapshot();
    },
    declineExport(requestId, cancelled = false): void {
      if (
        parentWindow === null ||
        hostOrigin === null ||
        !HOST_REQUEST_ID_PATTERN.test(requestId)
      ) {
        return;
      }
      try {
        parentWindow.postMessage(
          {
            __frame_chrome_decline: true,
            request: requestId,
            ...(cancelled && {
              cancelled: cancelled,
            }),
          },
          hostOrigin,
        );
      } catch {}
    },
    holdLeaveLosesWork() {
      if (parentWindow === null) {
        return (): void => {
          return;
        };
      }
      let flag: boolean = false;
      unsavedLeaveHolds += 1;
      refreshChromeSnapshot();
      return (): void => {
        if (flag) {
          return;
        }
        flag = true;
        unsavedLeaveHolds -= 1;
        refreshChromeSnapshot();
      };
    },
    witnessed: (): boolean => hostAcknowledgedRows,
    hostDrawsSave: hostDrawsSaveCapability,
    hostDrawsReadOnly: hostDrawsReadOnlyCapability,
    hostDrawsClaudeTips: hostDrawsClaudeTips,
    hostTakesRetry: hostTakesRetryCapability,
    subscribeHostDrawsSave(listener) {
      hostChromeListeners.add(listener);
      return (): void => {
        hostChromeListeners.delete(listener);
      };
    },
    dispose(): void {
      if (parentWindow !== null) {
        bridgeOptions.ownWindow.removeEventListener(
          "message",
          handleHostChromeMessage,
        );
      }
      hostChromeListeners.clear();
    },
  };
}
function getHostFrameBridge(): Host.HostFrameBridge {
  if (hostFrameBridge === null) {
    let value =
      typeof window === "object" &&
      (window as Host.ProtocolGlobal).parent !== window;
    hostFrameBridge = createHostFrameBridge({
      ownWindow: window,
      parentWindow: value ? (window as Host.ProtocolGlobal).parent : null,
      origins: allowedHostOrigins,
    });
  }
  return hostFrameBridge;
}
function reportToHost(
  state: string | null | undefined,
  reason?: boolean,
): void {
  getHostFrameBridge().report(state, reason);
}
function useHostSaveState(
  status: Host.SaveState["status"] | null,
  message?: () => void,
): void {
  let ref = react_z.useRef(false),
    value = status === "loading" && ref.current;
  if (status !== "loading") {
    ref.current = status === "error";
  }
  let saveMessage =
      status === null ? null : value ? "saving" : hostSaveStatus(status),
    saveNow =
      message !== undefined && (status === "error" || status === "dirty"),
    messageRef = react_z.useRef(message);
  messageRef.current = message;
  react_z.useEffect((): void => {
    reportToHost(saveMessage, saveNow);
  }, [saveMessage, saveNow]);
  react_z.useEffect(() => {
    getHostFrameBridge().setSaveNowHandler(() => messageRef.current?.());
    return (): void => {
      getHostFrameBridge().setSaveNowHandler(null);
      reportToHost(null);
    };
  }, []);
}
function hostDrawsSave(): boolean {
  return getHostFrameBridge().hostDrawsSave();
}
function hostDrawsReadOnly(): boolean {
  return getHostFrameBridge().hostDrawsReadOnly();
}
function hostTakesRetry(): boolean {
  return getHostFrameBridge().hostTakesRetry();
}
function subscribeHostSaveChrome(listener: () => void): () => void {
  return getHostFrameBridge().subscribeHostDrawsSave(listener);
}
export {
  allowedHostOrigins,
  createHostFrameBridge,
  DEFAULT_HOST_ORIGINS,
  EXPORT_FORMAT_PATTERN,
  getHostFrameBridge,
  HOST_BACKGROUND_HEX_PATTERN,
  HOST_COMMAND_PATTERN,
  HOST_DESTINATION_PATTERN,
  HOST_REQUEST_ID_PATTERN,
  hostDrawsReadOnly,
  hostDrawsSave,
  hostFrameBridge,
  hostOrigins,
  hostSaveStatus,
  hostTakesRetry,
  isAllowedHostOrigin,
  MAX_HOST_COMMANDS,
  MAX_HOST_DESTINATIONS,
  MAX_HOST_EXPORT_FORMATS,
  MAX_HOST_FOOT_INSET,
  normalizeHostCommands,
  normalizeHostDestinations,
  normalizeHostExportFormats,
  normalizeHostTips,
  OPEN_FIND_COMMAND,
  react_z,
  reportToHost,
  SAVE_NOW_COMMAND,
  subscribeHostSaveChrome,
  useHostSaveState,
  validExportTimeout,
};
export function installHostFrameBridge(): () => void {
  return () => {
    react_z = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    SAVE_NOW_COMMAND = "save_now";
    OPEN_FIND_COMMAND = "open_find";
    EXPORT_FORMAT_PATTERN = /^[a-z0-9]{1,8}$/;
    validExportTimeout = (timeoutMs) =>
      typeof timeoutMs === "number" &&
      Number.isSafeInteger(timeoutMs) &&
      timeoutMs > 5000 &&
      timeoutMs <= 900000
        ? timeoutMs
        : undefined;
    MAX_HOST_EXPORT_FORMATS = 8;
    HOST_DESTINATION_PATTERN = /^[a-z][a-z0-9_-]{0,31}$/;
    MAX_HOST_DESTINATIONS = 8;
    HOST_REQUEST_ID_PATTERN = /^[A-Za-z0-9_-]{16,64}$/;
    HOST_COMMAND_PATTERN = /^[a-z][a-z0-9_-]{0,31}$/;
    MAX_HOST_COMMANDS = 8;
    MAX_HOST_FOOT_INSET = 9999;
    HOST_BACKGROUND_HEX_PATTERN = /^#[0-9a-f]{6}$/;
    // MineDesign: no host frame origin is trusted by default. The editor talks to MineDesign through its own shim
    // (packages/design-system/src/editor), not this frame bridge; a page that needs the bridge declares its
    // origins in __FRAME_PREAMBLE.
    DEFAULT_HOST_ORIGINS = [];
    allowedHostOrigins = (() => {
      try {
        if (typeof window === "object") {
          return hostOrigins(window);
        } else {
          return DEFAULT_HOST_ORIGINS;
        }
      } catch {
        return DEFAULT_HOST_ORIGINS;
      }
    })();
    hostFrameBridge = null;
  };
}
