/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { announce } from "../editor/accessibility/announcer";
import { showEditorActionToast, showEditorToast } from "../editor/chrome/pending-toasts";
import { canHotRestart } from "./files-hot-reload";
import { clearMigrationInputBlocker } from "./migration-input";
import { announceReopenedArtifact, scheduleTypingAwareAnnouncement } from "./reopen-announcement";
import { getMovedToMarker } from "./storage-migration";

var PlatformMigrationStateAlias: Dynamic;
var migrationStateLoaded: Dynamic;
var PlatformMigrationStateSubscribers: Dynamic;
var MovedToFilesValue: Dynamic;
var PlatformMigrationStateHandler: Dynamic;
var ThisCanvasNowSavesInAMessage: Dynamic;
var MIGRATION_REOPENING_MESSAGE: Dynamic;
var ThisCanvasIsOpenAgainYouMessage: Dynamic;
var ThisCanvasIsOpenAgainMessage: Dynamic;
var YourLastChangeIsNotSavedMessage: Dynamic;
var ThatChangeIsSavedThisCanvasMessage: Dynamic;
var SAVE_DRAIN_POLL_MS: Dynamic;
var REOPEN_FALLBACK_DELAY_MS: Dynamic;
var lastMigrationEventAt: Dynamic;
var markMigrationEvent: Dynamic;
var wasMigrationEventRecent: Dynamic;
var getSessionStorageOrUndefined: Dynamic;
var restartFallbackListeners: Dynamic;
var migrationRestartHandlerInstalled: Dynamic;
function updateMovedToFilesState(metadata?: Dynamic): Dynamic {
  let movedToFiles: Dynamic = getMovedToMarker(metadata) !== null,
    shouldNotifyMove: Dynamic =
      migrationStateLoaded && movedToFiles && !PlatformMigrationStateAlias;
  PlatformMigrationStateAlias = movedToFiles;
  if (!!shouldNotifyMove)
    for (let listener of [...PlatformMigrationStateSubscribers] as Dynamic)
      try {
        listener();
      } catch {}
}
function markMigrationLoaded(): Dynamic {
  migrationStateLoaded = true;
}
function subscribeMovedToFiles(listener?: Dynamic): Dynamic {
  PlatformMigrationStateSubscribers.add(listener);
  return (): Dynamic => {
    PlatformMigrationStateSubscribers.delete(listener);
  };
}
function subscribeMigrationRestart(listener?: Dynamic): Dynamic {
  restartFallbackListeners.add(listener);
  return (): Dynamic => restartFallbackListeners.delete(listener);
}
function installMigrationRestartHandler(restartOptions: Dynamic = {}): Dynamic {
  if (migrationRestartHandlerInstalled) return;
  migrationRestartHandlerInstalled = true;
  let hotCapability: Dynamic =
      restartOptions.hot !== undefined
        ? restartOptions.hot
        // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
        : (globalThis as Dynamic).designHost?.hot,
    showToast: Dynamic = restartOptions.show ?? showEditorToast,
    speakFallback: Dynamic =
      restartOptions.say ??
      ((message?: Dynamic): Dynamic => announce(message)),
    showReloadFallback: Dynamic = (): Dynamic => {
      (
        restartOptions.show ??
        ((message?: Dynamic): Dynamic => {
          showEditorActionToast(message, null);
        })
      )(ThisCanvasNowSavesInAMessage);
      try {
        speakFallback(ThisCanvasNowSavesInAMessage);
      } catch {}
      clearMigrationInputBlocker();
      try {
        restartOptions.onStranded?.();
      } catch {}
      for (let listener of [...restartFallbackListeners] as Dynamic)
        try {
          listener();
        } catch {}
    };
  if (
    !(
      typeof hotCapability?.restart == "function" &&
      (restartOptions.hot !== undefined
        ? restartOptions.canReopen?.() !== false
        : (restartOptions.canReopen ?? PlatformMigrationStateHandler)())
    )
  )
    return showReloadFallback();
  let timers: Dynamic = restartOptions.timers ?? {
      setTimeout: (run?: Dynamic, delayMs?: Dynamic): Dynamic =>
        setTimeout(run, delayMs),
      clearTimeout: (timer?: Dynamic): Dynamic => clearTimeout(timer),
      now: (): Dynamic => Date.now(),
    },
    restart: Dynamic = (): Dynamic => {
      try {
        hotCapability.restart({
          note: "canvas keeps its content as files",
        });
      } catch {
        return showReloadFallback();
      }
      timers.setTimeout(showReloadFallback, REOPEN_FALLBACK_DELAY_MS);
    };
  if (restartOptions.quiet === true) return restart();
  let say: Dynamic =
      restartOptions.say ??
      ((message?: Dynamic): Dynamic => announce(message)),
    reopenTimers: Dynamic = timers,
    storage: Dynamic = restartOptions.store ?? getSessionStorageOrUndefined(),
    waitingForSave: Dynamic = false,
    requestedFlush: Dynamic = false,
    reopenAfterSaving: Dynamic = (): Dynamic => {
      if (!requestedFlush) {
        requestedFlush = true;
        try {
          restartOptions.flush?.();
        } catch {}
      }
      let isDrained: Dynamic = true;
      try {
        isDrained = restartOptions.drained === undefined || restartOptions.drained();
      } catch {}
      if (!isDrained) {
        waitingForSave ||
          ((waitingForSave = true),
          showToast(YourLastChangeIsNotSavedMessage),
          say(YourLastChangeIsNotSavedMessage));
        reopenTimers.setTimeout(reopenAfterSaving, SAVE_DRAIN_POLL_MS);
        return;
      }
      if (!waitingForSave) return restart();
      waitingForSave = false;
      showToast(ThatChangeIsSavedThisCanvasMessage);
      scheduleTypingAwareAnnouncement({
        say: say,
        message: ThatChangeIsSavedThisCanvasMessage,
        ...(restartOptions.isTyping !== undefined
          ? {
              isTyping: restartOptions.isTyping,
            }
          : {}),
        reopen: reopenAfterSaving,
        timers: reopenTimers,
        note: {
          store: storage,
          why: MovedToFilesValue,
          ...(restartOptions.focus !== undefined
            ? {
                focus: restartOptions.focus,
              }
            : {}),
        },
      });
    };
  showToast(MIGRATION_REOPENING_MESSAGE);
  scheduleTypingAwareAnnouncement({
    say: say,
    message: MIGRATION_REOPENING_MESSAGE,
    ...(restartOptions.isTyping !== undefined
      ? {
          isTyping: restartOptions.isTyping,
        }
      : {}),
    reopen: reopenAfterSaving,
    timers: reopenTimers,
    note: {
      store: storage,
      why: MovedToFilesValue,
      ...(restartOptions.focus !== undefined
        ? {
            focus: restartOptions.focus,
          }
        : {}),
    },
  });
}
function announceMigrationReopen(reopenOptions?: Dynamic): Dynamic {
  return announceReopenedArtifact({
    store: reopenOptions.store ?? getSessionStorageOrUndefined(),
    now: reopenOptions.now ?? Date.now(),
    say:
      reopenOptions.say ??
      ((message?: Dynamic): Dynamic => announce(message)),
    message: (): Dynamic =>
      reopenOptions.canWrite
        ? ThisCanvasIsOpenAgainYouMessage
        : ThisCanvasIsOpenAgainMessage,
    focus: (focusTarget?: Dynamic): Dynamic => reopenOptions.focus(focusTarget),
  });
}
export {
  announceMigrationReopen,
  installMigrationRestartHandler,
  markMigrationLoaded,
  migrationRestartHandlerInstalled,
  migrationStateLoaded,
  MovedToFilesValue,
  PlatformMigrationStateAlias,
  SAVE_DRAIN_POLL_MS as PlatformMigrationStateConstant,
  PlatformMigrationStateHandler,
  getSessionStorageOrUndefined,
  markMigrationEvent as PlatformMigrationStateNow,
  wasMigrationEventRecent,
  PlatformMigrationStateSubscribers,
  subscribeMigrationRestart,
  subscribeMovedToFiles,
  ThatChangeIsSavedThisCanvasMessage,
  ThisCanvasIsOpenAgainMessage,
  ThisCanvasIsOpenAgainYouMessage,
  ThisCanvasNowSavesInAMessage,
  updateMovedToFilesState,
  YourLastChangeIsNotSavedMessage,
};
export function installPlatformMigrationState(): () => void {
  return () => {
    PlatformMigrationStateAlias = false;
    migrationStateLoaded = false;
    PlatformMigrationStateSubscribers = new Set();
    MovedToFilesValue = "moved_to_files";
    PlatformMigrationStateHandler = (): Dynamic => canHotRestart();
    ThisCanvasNowSavesInAMessage =
      "This canvas now saves in a newer way. Reload the page to keep editing it.";
    MIGRATION_REOPENING_MESSAGE =
      "This canvas now saves in a newer way. It reopens here in a moment.";
    ThisCanvasIsOpenAgainYouMessage =
      "This canvas is open again. You can keep editing.";
    ThisCanvasIsOpenAgainMessage = "This canvas is open again.";
    YourLastChangeIsNotSavedMessage =
      "Your last change is not saved yet, so this canvas stays open. It reopens by itself once that change is saved.";
    ThatChangeIsSavedThisCanvasMessage =
      "That change is saved. This canvas reopens in a moment.";
    SAVE_DRAIN_POLL_MS = 2e3;
    REOPEN_FALLBACK_DELAY_MS = 2e4;
    lastMigrationEventAt = -1 / 0;
    markMigrationEvent = (now: Dynamic = Date.now()): Dynamic => {
      lastMigrationEventAt = now;
    };
    wasMigrationEventRecent = (now: Dynamic = Date.now()): Dynamic =>
      now - lastMigrationEventAt < 1500;
    getSessionStorageOrUndefined = (): Dynamic => {
      try {
        return typeof sessionStorage === "undefined"
          ? undefined
          : sessionStorage;
      } catch {
        return;
      }
    };
    restartFallbackListeners = new Set();
    migrationRestartHandlerInstalled = false;
  };
}
