import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */

var isAppCodePath: (path: string) => boolean;
var hotReloadBridges: WeakMap<object, Host.ActiveHotReloadBridge>;
var activeHotReloadSession: Host.HotReloadBridge | undefined;
function resolveClaudeHotApi(): Host.HotCapability | null {
  try {
    // MineDesign: the host is globalThis.designSystemHost (packages/design-system/src/editor/design-system-host.ts), not globalThis.claude.
    let value = (
      globalThis as typeof globalThis &
        Pick<Host.ProtocolGlobal, "designSystemHost">
    ).designSystemHost?.hot;
    if (
      (typeof value === "object" || typeof value === "function") &&
      value !== null
    ) {
      return value;
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function createInactiveHotReloadBridge(): Host.HotReloadBridge {
  return {
    active: false,
    queued: [],
    restarted: false,
    carried: undefined,
    events: [],
    owed: (): undefined => {
      return;
    },
    takeOwed: (): undefined => {
      return;
    },
    attach(): void {},
    release(): void {},
    detach(): void {},
    armReady(): void {},
  };
}
function currentHotReloadBridge(
  hot?: Host.HotCapability | null,
): Host.ActiveHotReloadBridge | undefined {
  let value = hot === undefined ? resolveClaudeHotApi() : hot;
  if (value === null) {
    return;
  }
  let entry = hotReloadBridges.get(value);
  if (entry !== undefined && entry.live()) {
    return entry;
  } else {
    return undefined;
  }
}
function createHotReloadBridge(
  reloadOptions: Host.HotReloadOptions = {},
): Host.HotReloadBridge {
  let value = reloadOptions.hot !== undefined ? reloadOptions.hot : resolveClaudeHotApi();
  if (
    reloadOptions.embedded === true ||
    value === null ||
    typeof value.accept !== "function"
  ) {
    return createInactiveHotReloadBridge();
  }
  let entry = hotReloadBridges.get(value);
  if (entry !== undefined && entry.live()) {
    return entry;
  }
  let isCodePath = reloadOptions.isCode ?? isAppCodePath,
    now = reloadOptions.now ?? ((): number => Date.now()),
    callback = (timerCallback: () => void, delayMs: number) =>
      reloadOptions.timers !== undefined
        ? reloadOptions.timers.setTimeout(timerCallback, delayMs)
        : setTimeout(timerCallback, delayMs),
    clearTimer = (timer: ReturnType<typeof setTimeout>): void => {
      if (reloadOptions.timers !== undefined) {
        reloadOptions.timers.clearTimeout?.(timer);
      } else {
        clearTimeout(timer);
      }
    },
    items: Host.HotQueuedUpdate[] = [],
    pendingEvents: Host.HotEvent[] = [],
    queuedEvents: Host.HotEvent[] = [],
    state: Host.HotAttachment = {},
    pendingOwedUpdate: Host.HotOwedUpdate | undefined,
    restoreValue: unknown,
    flag: boolean = false,
    hasRestored: boolean = false,
    isCodeUpdate: boolean = false,
    isContentUpdate: boolean = false,
    timeoutHandler: ((timedOut: boolean) => void) | undefined;
  function handleHotEvent(event: Host.HotEvent): void {
    pendingEvents.push(event);
    if (pendingEvents.length > 50) {
      pendingEvents.shift();
    }
    if (state.onEvent === undefined) {
      queuedEvents.push(event);
      if (queuedEvents.length > 50) {
        queuedEvents.shift();
      }
      return;
    }
    try {
      state.onEvent(event);
    } catch {}
  }
  let formatVersion = (version: Host.HotVersion) => ({
    version: version.ver,
    ...(version.seq !== undefined
      ? {
          seq: version.seq,
        }
      : {}),
  });
  function expireTimeout(): void {
    let onTimeout = timeoutHandler;
    if (onTimeout === undefined) {
      return;
    }
    if (state.reveal !== undefined) {
      Promise.resolve(state.reveal).then(
        () => onTimeout(false),
        () => onTimeout(false),
      );
    } else if (isCodeUpdate || isContentUpdate) {
      onTimeout(false);
    }
  }
  function recordUpdate(
    update: Host.HotUpdate,
    event: Host.HotEvent,
    updateKind: string,
    fromVersion: { version: string; seq?: number },
    toVersion: { version: string; seq?: number },
  ): "deferred" | undefined {
    pendingOwedUpdate = {
      reason: updateKind,
      from: pendingOwedUpdate?.from ?? fromVersion,
      to: toVersion,
      at: now(),
    };
    let updateReason: string =
      updateKind === "code"
        ? "a changed path is the page’s own code"
        : "required is " + String(update.required);
    handleHotEvent({
      ...event,
      decision: "defer",
      get why() { return (updateReason) + ("; the editor is still booting, so the restart waits until it has attached"); },
    });
    handleHotEvent({
      type: "deferred",
      from: fromVersion.version,
      to: toVersion.version,
      reason: updateKind,
    });
    if (typeof update.defer === "function") {
      try {
        update.defer();
      } catch {}
      return;
    }
    return "deferred";
  }
  value.accept((update) => {
    if (isContentUpdate) {
      if (typeof update.restart === "function") {
        try {
          update.restart();
        } catch {}
        return;
      }
      return "restart";
    }
    if (isCodeUpdate) {
      return;
    }
    let fromVersion = formatVersion(update.from),
      toVersion = formatVersion(update.to),
      requiredBy: string | string | undefined =
        update.required !== "none"
          ? "required"
          : update.changed !== null &&
              update.changed.some((change) => isCodePath(change.path))
            ? "code"
            : undefined,
      eventState = {
        type: "update",
        from: fromVersion.version,
        to: toVersion.version,
        ...(fromVersion.seq !== undefined
          ? {
              fromSeq: fromVersion.seq,
            }
          : {}),
        ...(toVersion.seq !== undefined
          ? {
              toSeq: toVersion.seq,
            }
          : {}),
        required: String(update.required),
        shape: typeof update.adopt === "function" ? "calls" : "string",
        changed:
          update.changed === null
            ? null
            : update.changed.map((source) => ({
                path: source.path,
                kind: String(source.kind),
                klass: isCodePath(source.path) ? "code" : "content",
              })),
        busy: false,
        early: true,
      };
    if (requiredBy !== undefined) {
      return recordUpdate(update, eventState, requiredBy, fromVersion, toVersion);
    }
    if (typeof update.adopt === "function") {
      try {
        update.adopt();
      } catch {
        return recordUpdate(update, eventState, "required", fromVersion, toVersion);
      }
    }
    items.push({
      from: fromVersion,
      to: toVersion,
      changed: update.changed,
      at: now(),
    });
    handleHotEvent({
      ...eventState,
      decision: "adopt",
      why: "content only; the editor is still booting, so the rows wait for it",
    });
    return "applied";
  });
  let isReady: boolean = false;
  function flushPending(): void {
    if (isReady || typeof value?.ready !== "function") {
      return;
    }
    isReady = true;
    try {
      value.ready((restoreState) => {
        restoreValue = restoreState;
        flag = true;
        if (state.restore !== undefined && !hasRestored) {
          hasRestored = true;
          try {
            state.restore(restoreState);
          } catch {}
        }
        let startedAt = now();
        return new Promise<void>((resolve): void => {
          let finishWait = (timedOut: boolean): void => {
              if (timeoutHandler !== finishWait) {
                return;
              }
              timeoutHandler = undefined;
              if (!timedOut) {
                clearTimer(timeoutHandle);
              }
              handleHotEvent({
                type: "reveal",
                heldMs: now() - startedAt,
                timedOut: timedOut,
                carried: restoreState !== undefined && restoreState !== null,
              });
              resolve();
            },
            timeoutHandle = callback(
              () => finishWait(true),
              reloadOptions.revealHoldMs ?? 4500,
            );
          timeoutHandler = finishWait;
          expireTimeout();
        });
      });
    } catch {}
  }
  if (reloadOptions.ready === "now") {
    flushPending();
  }
  if (typeof value.snapshot === "function") {
    try {
      value.snapshot((snapshot) =>
        isContentUpdate
          ? null
          : state.snapshot !== undefined
            ? state.snapshot(snapshot)
            : (restoreValue ?? null),
      );
    } catch {}
  }
  let bridgeState: Host.ActiveHotReloadBridge = {
    active: true,
    queued: items,
    get restarted(): boolean {
      return flag;
    },
    get carried() {
      return restoreValue;
    },
    events: pendingEvents,
    owed: () => pendingOwedUpdate,
    takeOwed() {
      let owedUpdate = pendingOwedUpdate;
      pendingOwedUpdate = undefined;
      return owedUpdate;
    },
    attach(bridge): void {
      flushPending();
      if (bridge.snapshot !== undefined) {
        state.snapshot = bridge.snapshot;
      }
      if (bridge.restore !== undefined) {
        state.restore = bridge.restore;
      }
      if (bridge.reveal !== undefined) {
        state.reveal = bridge.reveal;
      }
      if (bridge.onBeforeRestart !== undefined) {
        state.onBeforeRestart = bridge.onBeforeRestart;
      }
      if (bridge.onEvent !== undefined) {
        state.onEvent = bridge.onEvent;
        for (let event of queuedEvents.splice(0)) {
          try {
            bridge.onEvent(event);
          } catch {}
        }
      }
      if (flag && !hasRestored && state.restore !== undefined) {
        hasRestored = true;
        try {
          state.restore(restoreValue);
        } catch {}
      }
      expireTimeout();
    },
    release(): void {
      isCodeUpdate = true;
      expireTimeout();
    },
    detach(): void {
      if (isContentUpdate) {
        return;
      }
      isCodeUpdate = true;
      isContentUpdate = true;
      expireTimeout();
      let owedUpdate = pendingOwedUpdate;
      pendingOwedUpdate = undefined;
      if (owedUpdate === undefined) {
        return;
      }
      try {
        state.onBeforeRestart?.("deferred-update");
      } catch {}
      try {
        value.restart?.({
          note: "deferred-update",
        });
      } catch {}
    },
    armReady(): void {
      if (!isContentUpdate) {
        flushPending();
      }
    },
    live: () => !isCodeUpdate && !isContentUpdate,
  };
  hotReloadBridges.set(value, bridgeState);
  return bridgeState;
}
export {
  activeHotReloadSession,
  createHotReloadBridge,
  createInactiveHotReloadBridge,
  currentHotReloadBridge,
  hotReloadBridges,
  isAppCodePath,
  resolveClaudeHotApi,
};
export function installHostHotReload(): () => void {
  return () => {
    isAppCodePath = (path: string) =>
      path === "index.html" ||
      path === "SKILL.md" ||
      path.startsWith("artifact-type/");
    hotReloadBridges = new WeakMap();
    activeHotReloadSession =
      typeof window === "undefined" ? undefined : createHotReloadBridge();
  };
}
