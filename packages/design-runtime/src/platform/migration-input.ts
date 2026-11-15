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
  input: Dynamic = typeof window === "undefined" ? undefined : window,
): Dynamic {
  for (let value of PlatformMigrationInputKeydownKeypressKeyupValues as Dynamic)
    input?.addEventListener(value, PlatformMigrationInputStartsWith, {
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
function setCanvasLoadFailure(input?: Dynamic): Dynamic {
  if (PlatformMigrationInputAlias !== input) {
    PlatformMigrationInputAlias = input;
    for (let value of [...PlatformMigrationInputSubscribers] as Dynamic)
      try {
        value();
      } catch {}
  }
}
function subscribeCanvasLoadFailure(input?: Dynamic): Dynamic {
  PlatformMigrationInputSubscribers.add(input);
  return (): Dynamic => {
    PlatformMigrationInputSubscribers.delete(input);
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
    PlatformMigrationInputTest = (input?: Dynamic): Dynamic =>
      input === "Escape" || input === "Tab" || /^F\d{1,2}$/.test(input ?? "");
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
