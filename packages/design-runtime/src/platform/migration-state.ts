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
var ThisCanvasNowSavesInAMessage_2: Dynamic;
var ThisCanvasIsOpenAgainYouMessage: Dynamic;
var ThisCanvasIsOpenAgainMessage: Dynamic;
var YourLastChangeIsNotSavedMessage: Dynamic;
var ThatChangeIsSavedThisCanvasMessage: Dynamic;
var PlatformMigrationStateConstant: Dynamic;
var PlatformMigrationStateConstant_2: Dynamic;
var PlatformMigrationStateAlias_2: Dynamic;
var PlatformMigrationStateNow: Dynamic;
var PlatformMigrationStateNow_2: Dynamic;
var PlatformMigrationStateHandler_2: Dynamic;
var PlatformMigrationStateSubscribers_2: Dynamic;
var migrationRestartHandlerInstalled: Dynamic;
function updateMovedToFilesState(input?: Dynamic): Dynamic {
  let value: Dynamic = (0, getMovedToMarker)(input) !== null,
    value2: Dynamic =
      migrationStateLoaded && value && !PlatformMigrationStateAlias;
  PlatformMigrationStateAlias = value;
  if (!!value2)
    for (let value3 of [...PlatformMigrationStateSubscribers] as Dynamic)
      try {
        value3();
      } catch {}
}
function markMigrationLoaded(): Dynamic {
  migrationStateLoaded = true;
}
function subscribeMovedToFiles(input?: Dynamic): Dynamic {
  PlatformMigrationStateSubscribers.add(input);
  return (): Dynamic => {
    PlatformMigrationStateSubscribers.delete(input);
  };
}
function subscribeMigrationRestart(input?: Dynamic): Dynamic {
  PlatformMigrationStateSubscribers_2.add(input);
  return (): Dynamic => PlatformMigrationStateSubscribers_2.delete(input);
}
function installMigrationRestartHandler(input: Dynamic = {}): Dynamic {
  if (migrationRestartHandlerInstalled) return;
  migrationRestartHandlerInstalled = true;
  let value: Dynamic =
      input.hot !== undefined
        ? input.hot
        // MineDesign: the host is globalThis.designHost (packages/design/src/editor/design-host.ts), not globalThis.claude.
        : (globalThis as Dynamic).designHost?.hot,
    value2: Dynamic = input.show ?? showEditorToast,
    value3: Dynamic =
      input.say ??
      ((input2?: Dynamic): Dynamic => (0, announce)(input2)),
    callback: Dynamic = (): Dynamic => {
      (
        input.show ??
        ((input2?: Dynamic): Dynamic => {
          (0, showEditorActionToast)(input2, null);
        })
      )(ThisCanvasNowSavesInAMessage);
      try {
        value3(ThisCanvasNowSavesInAMessage);
      } catch {}
      (0, clearMigrationInputBlocker)();
      try {
        input.onStranded?.();
      } catch {}
      for (let value8 of [...PlatformMigrationStateSubscribers_2] as Dynamic)
        try {
          value8();
        } catch {}
    };
  if (
    !(
      typeof value?.restart == "function" &&
      (input.hot !== undefined
        ? input.canReopen?.() !== false
        : (input.canReopen ?? PlatformMigrationStateHandler)())
    )
  )
    return callback();
  let value4: Dynamic = input.timers ?? {
      setTimeout: (input2?: Dynamic, options?: Dynamic): Dynamic =>
        setTimeout(input2, options),
      clearTimeout: (input2?: Dynamic): Dynamic => clearTimeout(input2),
      now: (): Dynamic => Date.now(),
    },
    callback2: Dynamic = (): Dynamic => {
      try {
        value.restart({
          note: "canvas keeps its content as files",
        });
      } catch {
        return callback();
      }
      value4.setTimeout(callback, PlatformMigrationStateConstant_2);
    };
  if (input.quiet === true) return callback2();
  let value5: Dynamic =
      input.say ??
      ((input2?: Dynamic): Dynamic => (0, announce)(input2)),
    value6: Dynamic = value4,
    value7: Dynamic = input.store ?? PlatformMigrationStateHandler_2(),
    flag: Dynamic = false,
    flag2: Dynamic = false,
    callback3: Dynamic = (): Dynamic => {
      if (!flag2) {
        flag2 = true;
        try {
          input.flush?.();
        } catch {}
      }
      let flag3: Dynamic = true;
      try {
        flag3 = input.drained === undefined || input.drained();
      } catch {}
      if (!flag3) {
        flag ||
          ((flag = true),
          value2(YourLastChangeIsNotSavedMessage),
          value5(YourLastChangeIsNotSavedMessage));
        value6.setTimeout(callback3, PlatformMigrationStateConstant);
        return;
      }
      if (!flag) return callback2();
      flag = false;
      value2(ThatChangeIsSavedThisCanvasMessage);
      (0, scheduleTypingAwareAnnouncement)({
        say: value5,
        message: ThatChangeIsSavedThisCanvasMessage,
        ...(input.isTyping !== undefined
          ? {
              isTyping: input.isTyping,
            }
          : {}),
        reopen: callback3,
        timers: value6,
        note: {
          store: value7,
          why: MovedToFilesValue,
          ...(input.focus !== undefined
            ? {
                focus: input.focus,
              }
            : {}),
        },
      });
    };
  value2(ThisCanvasNowSavesInAMessage_2);
  (0, scheduleTypingAwareAnnouncement)({
    say: value5,
    message: ThisCanvasNowSavesInAMessage_2,
    ...(input.isTyping !== undefined
      ? {
          isTyping: input.isTyping,
        }
      : {}),
    reopen: callback3,
    timers: value6,
    note: {
      store: value7,
      why: MovedToFilesValue,
      ...(input.focus !== undefined
        ? {
            focus: input.focus,
          }
        : {}),
    },
  });
}
function announceMigrationReopen(input?: Dynamic): Dynamic {
  return (0, announceReopenedArtifact)({
    store: input.store ?? PlatformMigrationStateHandler_2(),
    now: input.now ?? Date.now(),
    say:
      input.say ??
      ((input2?: Dynamic): Dynamic => (0, announce)(input2)),
    message: (): Dynamic =>
      input.canWrite
        ? ThisCanvasIsOpenAgainYouMessage
        : ThisCanvasIsOpenAgainMessage,
    focus: (input2?: Dynamic): Dynamic => input.focus(input2),
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
  PlatformMigrationStateAlias_2,
  PlatformMigrationStateConstant,
  PlatformMigrationStateConstant_2,
  PlatformMigrationStateHandler,
  PlatformMigrationStateHandler_2,
  PlatformMigrationStateNow,
  PlatformMigrationStateNow_2,
  PlatformMigrationStateSubscribers,
  PlatformMigrationStateSubscribers_2,
  subscribeMigrationRestart,
  subscribeMovedToFiles,
  ThatChangeIsSavedThisCanvasMessage,
  ThisCanvasIsOpenAgainMessage,
  ThisCanvasIsOpenAgainYouMessage,
  ThisCanvasNowSavesInAMessage,
  ThisCanvasNowSavesInAMessage_2,
  updateMovedToFilesState,
  YourLastChangeIsNotSavedMessage,
};
export function installPlatformMigrationState(): () => void {
  return () => {
    PlatformMigrationStateAlias = false;
    migrationStateLoaded = false;
    PlatformMigrationStateSubscribers = new Set();
    MovedToFilesValue = "moved_to_files";
    PlatformMigrationStateHandler = (): Dynamic => (0, canHotRestart)();
    ThisCanvasNowSavesInAMessage =
      "This canvas now saves in a newer way. Reload the page to keep editing it.";
    ThisCanvasNowSavesInAMessage_2 =
      "This canvas now saves in a newer way. It reopens here in a moment.";
    ThisCanvasIsOpenAgainYouMessage =
      "This canvas is open again. You can keep editing.";
    ThisCanvasIsOpenAgainMessage = "This canvas is open again.";
    YourLastChangeIsNotSavedMessage =
      "Your last change is not saved yet, so this canvas stays open. It reopens by itself once that change is saved.";
    ThatChangeIsSavedThisCanvasMessage =
      "That change is saved. This canvas reopens in a moment.";
    PlatformMigrationStateConstant = 2e3;
    PlatformMigrationStateConstant_2 = 2e4;
    PlatformMigrationStateAlias_2 = -1 / 0;
    PlatformMigrationStateNow = (input: Dynamic = Date.now()): Dynamic => {
      PlatformMigrationStateAlias_2 = input;
    };
    PlatformMigrationStateNow_2 = (input: Dynamic = Date.now()): Dynamic =>
      input - PlatformMigrationStateAlias_2 < 1500;
    PlatformMigrationStateHandler_2 = (): Dynamic => {
      try {
        return typeof sessionStorage === "undefined"
          ? undefined
          : sessionStorage;
      } catch {
        return;
      }
    };
    PlatformMigrationStateSubscribers_2 = new Set();
    migrationRestartHandlerInstalled = false;
  };
}
