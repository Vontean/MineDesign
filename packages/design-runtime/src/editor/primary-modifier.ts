/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { InspectorColorPickResolvedValue_2 } from "./inspector/color-pick";

var primaryModifierKey: Dynamic;
var primaryModifierHeld: Dynamic;
var primaryModifierSubscribers: Dynamic;
var primaryModifierListenersInstalled: Dynamic;
var pendingPrimaryModifierState: Dynamic;
var primaryModifierAnimationFrame: Dynamic;
function publishPrimaryModifierState(held?: Dynamic): Dynamic {
  primaryModifierHeld = held;
  pendingPrimaryModifierState = null;
  for (let value of primaryModifierSubscribers as Dynamic) value(held);
}
function installPrimaryModifierListeners(): Dynamic {
  if (primaryModifierListenersInstalled || typeof window === "undefined")
    return;
  primaryModifierListenersInstalled = true;
  let callback: Dynamic = (input?: Dynamic): Dynamic => {
    input.key === primaryModifierKey &&
      !input.repeat &&
      publishPrimaryModifierState(input.type === "keydown");
  };
  (window as Dynamic).addEventListener("keydown", callback, true);
  (window as Dynamic).addEventListener("keyup", callback, true);
  (window as Dynamic).addEventListener("blur", (): Dynamic => {
    !(document as Dynamic).hasFocus() &&
      primaryModifierHeld &&
      publishPrimaryModifierState(false);
  });
}
function getPrimaryModifierHeld(): Dynamic {
  installPrimaryModifierListeners();
  return primaryModifierHeld;
}
function setPrimaryModifierHeld(held?: Dynamic): Dynamic {
  installPrimaryModifierListeners();
  pendingPrimaryModifierState = null;
  primaryModifierHeld !== held && publishPrimaryModifierState(held);
}
function schedulePrimaryModifierHeld(held?: Dynamic): Dynamic {
  installPrimaryModifierListeners();
  pendingPrimaryModifierState = held;
  !primaryModifierAnimationFrame &&
    (primaryModifierAnimationFrame = requestAnimationFrame((): Dynamic => {
      primaryModifierAnimationFrame = 0;
      if (pendingPrimaryModifierState == null) return;
      let value: Dynamic = pendingPrimaryModifierState;
      pendingPrimaryModifierState = null;
      primaryModifierHeld !== value && publishPrimaryModifierState(value);
    }));
}
function subscribePrimaryModifierHeld(listener?: Dynamic): Dynamic {
  installPrimaryModifierListeners();
  primaryModifierSubscribers.add(listener);
  return (): Dynamic => {
    primaryModifierSubscribers.delete(listener);
  };
}
export {
  getPrimaryModifierHeld,
  installPrimaryModifierListeners,
  pendingPrimaryModifierState,
  primaryModifierAnimationFrame,
  primaryModifierHeld,
  primaryModifierKey,
  primaryModifierListenersInstalled,
  primaryModifierSubscribers,
  publishPrimaryModifierState,
  schedulePrimaryModifierHeld,
  setPrimaryModifierHeld,
  subscribePrimaryModifierHeld,
};
export function installEditorPrimaryModifier(): () => void {
  return () => {
    primaryModifierKey = InspectorColorPickResolvedValue_2
      ? "Meta"
      : "Control";
    primaryModifierHeld = false;
    primaryModifierSubscribers = new Set();
    primaryModifierListenersInstalled = false;
    pendingPrimaryModifierState = null;
    primaryModifierAnimationFrame = 0;
  };
}
