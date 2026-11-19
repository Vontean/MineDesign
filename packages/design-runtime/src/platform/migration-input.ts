/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { PlatformMigrationStateAlias } from "./migration-state";

var PlatformMigrationInputTest: Dynamic;
var PlatformMigrationInputKeydownKeypressKeyupValues: Dynamic;
var PlatformMigrationInputConstant: Dynamic;
var PlatformMigrationInputStartsWith: Dynamic;
var PlatformMigrationInputCurrentState: Dynamic;
var CouldnTOpenTheCurrentVersionOfMessage: Dynamic;
var CouldnTLoadThisCanvasReloadToMessage: Dynamic;
var PlatformMigrationInputAlias: Dynamic;
var PlatformMigrationInputSubscribers: Dynamic;
var getCanvasLoadFailure: Dynamic;
function installMigrationInputBlocker(
  targetWindow: Dynamic = typeof window === "undefined" ? undefined : window,
): Dynamic {
  for (let eventName of PlatformMigrationInputKeydownKeypressKeyupValues as Dynamic)
    targetWindow?.addEventListener(eventName, PlatformMigrationInputStartsWith, {
      capture: true,
    });
}
function clearMigrationInputBlocker(): Dynamic {
  PlatformMigrationInputConstant = 0;
  PlatformMigrationInputCurrentState?.removeAttribute("inert");
  PlatformMigrationInputCurrentState?.removeAttribute("aria-busy");
}
function isMovedToFiles(): Dynamic {
  return PlatformMigrationStateAlias;
}
function setCanvasLoadFailure(failure?: Dynamic): Dynamic {
  if (PlatformMigrationInputAlias !== failure) {
    PlatformMigrationInputAlias = failure;
    for (let listener of [...PlatformMigrationInputSubscribers] as Dynamic)
      try {
        listener();
      } catch {}
  }
}
function subscribeCanvasLoadFailure(listener?: Dynamic): Dynamic {
  PlatformMigrationInputSubscribers.add(listener);
  return (): Dynamic => {
    PlatformMigrationInputSubscribers.delete(listener);
  };
}
export {
  clearMigrationInputBlocker,
  CouldnTLoadThisCanvasReloadToMessage,
  CouldnTOpenTheCurrentVersionOfMessage,
  getCanvasLoadFailure,
  installMigrationInputBlocker,
  isMovedToFiles,
  PlatformMigrationInputAlias,
  PlatformMigrationInputConstant,
  PlatformMigrationInputCurrentState,
  PlatformMigrationInputKeydownKeypressKeyupValues,
  PlatformMigrationInputStartsWith,
  PlatformMigrationInputSubscribers,
  PlatformMigrationInputTest,
  setCanvasLoadFailure,
  subscribeCanvasLoadFailure,
};
export function installPlatformMigrationInput(): () => void {
  return () => {
    PlatformMigrationInputTest = (key?: Dynamic): Dynamic =>
      key === "Escape" || key === "Tab" || /^F\d{1,2}$/.test(key ?? "");
    PlatformMigrationInputKeydownKeypressKeyupValues = [
      "keydown",
      "keypress",
      "keyup",
      "beforeinput",
      "paste",
      "cut",
      "copy",
      "drop",
      "dragover",
      "pointerdown",
      "mousedown",
      "touchstart",
    ];
    PlatformMigrationInputConstant = 0;
    PlatformMigrationInputStartsWith = (event?: Dynamic): Dynamic => {
      PlatformMigrationInputConstant !== 0 &&
        ((event.type.startsWith("key") &&
          PlatformMigrationInputTest(event.key)) ||
          (event.stopImmediatePropagation(),
          event.cancelable && event.preventDefault()));
    };
    installMigrationInputBlocker();
    PlatformMigrationInputCurrentState = null;
    CouldnTOpenTheCurrentVersionOfMessage =
      "Couldn\u2019t open the current version of this canvas. Reload to try again.";
    CouldnTLoadThisCanvasReloadToMessage =
      "Couldn\u2019t load this canvas. Reload to try again.";
    PlatformMigrationInputSubscribers = new Set();
    getCanvasLoadFailure = (): Dynamic => PlatformMigrationInputAlias;
  };
}
