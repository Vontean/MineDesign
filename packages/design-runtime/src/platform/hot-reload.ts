import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var isHotReloadCodeFile: Dynamic;
var hotReloadControllers: Dynamic;
var applicationBootTime: Dynamic;
var isEmbeddedApplication: Dynamic;
var hotReloadController: Dynamic;
function getHotReloadCapability(): Dynamic {
  try {
    // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
    let capability: Dynamic = (globalThis as Dynamic).designHost?.hot;
    return (typeof capability == "object" || typeof capability == "function") &&
      capability !== null
      ? capability
      : null;
  } catch {
    return null;
  }
}
function createDisabledHotReloadController(): Dynamic {
  return {
    active: false,
    queued: [],
    restarted: false,
    carried: undefined,
    events: [],
    owed: (): Dynamic => {},
    takeOwed: (): Dynamic => {},
    attach(): Dynamic {},
    release(): Dynamic {},
    detach(): Dynamic {},
    armReady(): Dynamic {},
  };
}
function getHotReloadController(hot?: Dynamic): Dynamic {
  let capability: Dynamic = hot === undefined ? getHotReloadCapability() : hot;
  if (capability === null) return;
  let controller: Dynamic = hotReloadControllers.get(capability);
  return controller !== undefined && controller.live() ? controller : undefined;
}
function createHotReloadController(reloadOptions: Dynamic = {}): Dynamic {
  let capability: Dynamic =
    reloadOptions.hot !== undefined ? reloadOptions.hot : getHotReloadCapability();
  if (
    reloadOptions.embedded === true ||
    capability === null ||
    typeof capability.accept != "function"
  )
    return createDisabledHotReloadController();
  let existingController: Dynamic = hotReloadControllers.get(capability);
  if (existingController !== undefined && existingController.live()) return existingController;
  let isCodePath: Dynamic = reloadOptions.isCode ?? isHotReloadCodeFile,
    now: Dynamic = reloadOptions.now ?? ((): Dynamic => Date.now()),
    scheduleTimeout: Dynamic = (run?: Dynamic, delayMs?: Dynamic): Dynamic =>
      reloadOptions.timers !== undefined
        ? reloadOptions.timers.setTimeout(run, delayMs)
        : setTimeout(run, delayMs),
    cancelTimeout: Dynamic = (timeoutId?: Dynamic): Dynamic => {
      reloadOptions.timers !== undefined
        ? reloadOptions.timers.clearTimeout?.(timeoutId)
        : clearTimeout(timeoutId);
    },
    queuedUpdates: Dynamic = [],
    recentEvents: Dynamic = [],
    pendingEvents: Dynamic = [],
    hooks: Dynamic = {},
    owedUpdate: Dynamic,
    carriedState: Dynamic,
    restarted: Dynamic = false,
    restored: Dynamic = false,
    released: Dynamic = false,
    detached: Dynamic = false,
    finishPendingReveal: Dynamic;
  function recordEvent(event?: Dynamic): Dynamic {
    recentEvents.push(event);
    recentEvents.length > 50 && recentEvents.shift();
    if (hooks.onEvent === undefined) {
      pendingEvents.push(event);
      pendingEvents.length > 50 && pendingEvents.shift();
      return;
    }
    try {
      hooks.onEvent(event);
    } catch {}
  }
  let readVersion: Dynamic = (snapshot?: Dynamic): Dynamic => ({
    version: snapshot.ver,
    ...(snapshot.seq !== undefined
      ? {
          seq: snapshot.seq,
        }
      : {}),
  });
  function finishRevealWhenReady(): Dynamic {
    let finishReveal: Dynamic = finishPendingReveal;
    finishReveal !== undefined &&
      (hooks.reveal !== undefined
        ? Promise.resolve(hooks.reveal).then(
            (): Dynamic => finishReveal(false),
            (): Dynamic => finishReveal(false),
          )
        : (released || detached) && finishReveal(false));
  }
  function deferRestart(
    update?: Dynamic,
    updateEvent?: Dynamic,
    reason?: Dynamic,
    previousVersion?: Dynamic,
    nextVersion?: Dynamic,
  ): Dynamic {
    owedUpdate = {
      reason: reason,
      from: owedUpdate?.from ?? previousVersion,
      to: nextVersion,
      at: now(),
    };
    let explanation: Dynamic =
      reason === "code"
        ? "a changed path is the page\u2019s own code"
        : "required is " + String(update.required);
    recordEvent({
      ...updateEvent,
      decision: "defer",
      get why() { return (explanation) + ("; the editor is still booting, so the restart waits until it has attached"); },
    });
    recordEvent({
      type: "deferred",
      from: previousVersion.version,
      to: nextVersion.version,
      reason: reason,
    });
    if (typeof update.defer == "function") {
      try {
        update.defer();
      } catch {}
      return;
    }
    return "deferred";
  }
  capability.accept((update?: Dynamic): Dynamic => {
    if (detached) {
      if (typeof update.restart == "function") {
        try {
          update.restart();
        } catch {}
        return;
      }
      return "restart";
    }
    if (released) return;
    let previousVersion: Dynamic = readVersion(update.from),
      nextVersion: Dynamic = readVersion(update.to),
      restartReason: Dynamic =
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
        shape: typeof update.adopt == "function" ? "calls" : "string",
        changed:
          update.changed === null
            ? null
            : update.changed.map(
                (source?: Dynamic): Dynamic => ({
                  path: source.path,
                  kind: String(source.kind),
                  klass: isCodePath(source.path) ? "code" : "content",
                }),
              ),
        busy: false,
        early: true,
      };
    if (restartReason !== undefined)
      return deferRestart(update, updateEvent, restartReason, previousVersion, nextVersion);
    if (typeof update.adopt == "function")
      try {
        update.adopt();
      } catch {
        return deferRestart(update, updateEvent, "required", previousVersion, nextVersion);
      }
    queuedUpdates.push({
      from: previousVersion,
      to: nextVersion,
      changed: update.changed,
      at: now(),
    });
    recordEvent({
      ...updateEvent,
      decision: "adopt",
      why: "content only; the editor is still booting, so the rows wait for it",
    });
    return "applied";
  });
  let readyArmed: Dynamic = false;
  function registerReadyHandler(): Dynamic {
    if (!(readyArmed || typeof capability?.ready != "function")) {
      readyArmed = true;
      try {
        capability.ready((restartState?: Dynamic): Dynamic => {
          carriedState = restartState;
          restarted = true;
          if (hooks.restore !== undefined && !restored) {
            restored = true;
            try {
              hooks.restore(restartState);
            } catch {}
          }
          let revealStartedAt: Dynamic = now();
          return new Promise((resolve?: Dynamic): Dynamic => {
            let finishReveal: Dynamic = (timedOut?: Dynamic): Dynamic => {
                finishPendingReveal === finishReveal &&
                  ((finishPendingReveal = undefined),
                  timedOut || cancelTimeout(revealTimeout),
                  recordEvent({
                    type: "reveal",
                    heldMs: now() - revealStartedAt,
                    timedOut: timedOut,
                    carried: restartState != null,
                  }),
                  resolve());
              },
              revealTimeout: Dynamic = scheduleTimeout(
                (): Dynamic => finishReveal(true),
                reloadOptions.revealHoldMs ?? 4500,
              );
            finishPendingReveal = finishReveal;
            finishRevealWhenReady();
          });
        });
      } catch {}
    }
  }
  reloadOptions.ready === "now" && registerReadyHandler();
  if (typeof capability.snapshot == "function")
    try {
      capability.snapshot(
        (snapshotContext?: Dynamic): Dynamic =>
          detached
            ? null
            : hooks.snapshot !== undefined
              ? hooks.snapshot(snapshotContext)
              : (carriedState ?? null),
      );
    } catch {}
  let controller: Dynamic = {
    active: true,
    queued: queuedUpdates,
    get restarted(): Dynamic {
      return restarted;
    },
    get carried(): Dynamic {
      return carriedState;
    },
    events: recentEvents,
    owed: (): Dynamic => owedUpdate,
    takeOwed(): Dynamic {
      let update: Dynamic = owedUpdate;
      owedUpdate = undefined;
      return update;
    },
    attach(nextHooks: Dynamic): Dynamic {
      registerReadyHandler();
      nextHooks.snapshot !== undefined && (hooks.snapshot = nextHooks.snapshot);
      nextHooks.restore !== undefined && (hooks.restore = nextHooks.restore);
      nextHooks.reveal !== undefined && (hooks.reveal = nextHooks.reveal);
      nextHooks.onBeforeRestart !== undefined &&
        (hooks.onBeforeRestart = nextHooks.onBeforeRestart);
      if (nextHooks.onEvent !== undefined) {
        hooks.onEvent = nextHooks.onEvent;
        for (let event of pendingEvents.splice(0) as Dynamic)
          try {
            nextHooks.onEvent(event);
          } catch {}
      }
      if (restarted && !restored && hooks.restore !== undefined) {
        restored = true;
        try {
          hooks.restore(carriedState);
        } catch {}
      }
      finishRevealWhenReady();
    },
    release(): Dynamic {
      released = true;
      finishRevealWhenReady();
    },
    detach(): Dynamic {
      if (detached) return;
      released = true;
      detached = true;
      finishRevealWhenReady();
      let update: Dynamic = owedUpdate;
      owedUpdate = undefined;
      if (update !== undefined) {
        try {
          hooks.onBeforeRestart?.("deferred-update");
        } catch {}
        try {
          capability.restart?.({
            note: "deferred-update",
          });
        } catch {}
      }
    },
    armReady(): Dynamic {
      detached || registerReadyHandler();
    },
    live: (): Dynamic => !released && !detached,
  };
  hotReloadControllers.set(capability, controller);
  return controller;
}
export {
  applicationBootTime,
  createDisabledHotReloadController,
  createHotReloadController,
  getHotReloadCapability,
  getHotReloadController,
  hotReloadController,
  hotReloadControllers,
  isEmbeddedApplication,
  isHotReloadCodeFile,
};
export function installPlatformHotReload(): () => void {
  return () => {
    isHotReloadCodeFile = (filePath?: Dynamic): Dynamic =>
      filePath === "index.html" ||
      filePath === "SKILL.md" ||
      filePath.startsWith("artifact-type/");
    hotReloadControllers = new WeakMap();
    applicationBootTime =
      typeof performance !== "undefined" ? performance.now() : 0;
    isEmbeddedApplication =
      typeof window !== "undefined" &&
      (window as Dynamic).__appifactEmbed !== undefined;
    hotReloadController = createHotReloadController({
      embedded: isEmbeddedApplication,
    });
  };
}
