import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { DcTplAttribute } from "../html/authoring";
import { toModuleNamespace } from "../../module-helpers";

var reactSessionElementState: Dynamic;
var SessionElementStateCroppingTargetSelectedConfig: Dynamic;
var SessionElementStateCache: Dynamic;
var SessionElementStateSubscribers: Dynamic;
var SessionElementStateGet: Dynamic;
var SessionElementStateCache_2: Dynamic;
var SessionElementStateItems: Dynamic;
var SessionElementStateKey: Dynamic;
var SessionElementStateCache_3: Dynamic;
var CropIsNotAvailableHereForMessage: Dynamic;
var SessionElementStateUnloadedTurnedAutoConfig: Dynamic;
function updateElementSessionState(
  file?: Dynamic,
  patch?: Dynamic,
): Dynamic {
  let state: Dynamic = {
    ...SessionElementStateGet(file),
    ...patch,
  };
  if (
    JSON.stringify(state) !== JSON.stringify(SessionElementStateGet(file))
  ) {
    JSON.stringify(state) ===
    JSON.stringify(SessionElementStateCroppingTargetSelectedConfig)
      ? SessionElementStateCache.delete(file)
      : SessionElementStateCache.set(file, state);
    for (let notifySubscriber of SessionElementStateSubscribers as Dynamic) notifySubscriber();
  }
}
function useElementSessionState(file?: Dynamic): Dynamic {
  return (0, reactSessionElementState.useSyncExternalStore)(
    (onChange?: Dynamic): Dynamic => (
      SessionElementStateSubscribers.add(onChange),
      (): Dynamic => SessionElementStateSubscribers.delete(onChange)
    ),
    (): Dynamic =>
      file === null
        ? SessionElementStateCroppingTargetSelectedConfig
        : SessionElementStateGet(file),
  );
}
function registerElementSession(file?: Dynamic, element?: Dynamic): Dynamic {
  SessionElementStateCache_2.set(file, [
    ...(SessionElementStateCache_2.get(file) ?? []),
    {
      el: element,
    },
  ]);
}
function unregisterElementSession(
  file?: Dynamic,
  element?: Dynamic,
  isDeferred?: Dynamic,
): Dynamic {
  let entry: Dynamic = [...(SessionElementStateCache_2.get(file) ?? [])]
    .reverse()
    .find((item?: Dynamic): Dynamic => item.el === element);
  entry &&
    (isDeferred
      ? setTimeout((): Dynamic => SessionElementStateKey(file, entry), 3e3)
      : SessionElementStateKey(file, entry));
}
function dispatchElementSessionGesture(
  file?: Dynamic,
  gesture?: Dynamic,
  model?: Dynamic,
  shouldRelease: Dynamic = false,
): Dynamic {
  let entries: Dynamic = SessionElementStateCache_2.get(file) ?? [],
    entry: Dynamic =
      gesture.gestureKey === undefined
        ? undefined
        : entries.find(
            (item?: Dynamic): Dynamic => item.key === gesture.gestureKey,
          );
  if (!entry) {
    if (
      SessionElementStateItems.includes(
        file + "|" + String(gesture.gestureKey),
      ) ||
      ((entry = entries.find(
        (item?: Dynamic): Dynamic => item.key === undefined,
      )),
      !entry ||
        gesture.gestureKey === undefined ||
        model.element(gesture.tid) !== entry.el)
    )
      return null;
    entry.key = gesture.gestureKey;
  }
  shouldRelease && SessionElementStateKey(file, entry);
  let tid: Dynamic = parseInt(
    entry.el.getAttribute(DcTplAttribute) ?? "",
    10,
  );
  return model.element(tid) === entry.el ? tid : null;
}
function registerLateGesture(
  file?: Dynamic,
  gestureKey?: Dynamic,
  pendingGesture?: Dynamic,
): Dynamic {
  let lateKey: Dynamic = file + "|" + String(gestureKey);
  SessionElementStateCache_3.set(lateKey, pendingGesture);
  setTimeout((): Dynamic => {
    SessionElementStateCache_3.get(lateKey) === pendingGesture &&
      (SessionElementStateCache_3.delete(lateKey), pendingGesture.lapsed("late"));
  }, 3e3);
}
function claimLateGesture(
  file?: Dynamic,
  gestureKey?: Dynamic,
  element?: Dynamic,
  isFinalClaim?: Dynamic,
): Dynamic {
  let lateKey: Dynamic = file + "|" + String(gestureKey),
    entry: Dynamic = SessionElementStateCache_3.get(lateKey);
  return entry === undefined
    ? isFinalClaim
      ? undefined
      : null
    : !isFinalClaim && entry.el !== element
      ? null
      : (SessionElementStateCache_3.delete(lateKey),
        isFinalClaim && entry.el === element
          ? entry.edits
          : (entry.lapsed("stale"), isFinalClaim ? undefined : null));
}
function activeCropElement(): Dynamic {
  for (let [file, state] of SessionElementStateCache as Dynamic)
    if (state.cropping !== null) return file;
  return null;
}
function useActiveCropElement(): Dynamic {
  return (0, reactSessionElementState.useSyncExternalStore)(
    (onChange?: Dynamic): Dynamic => (
      SessionElementStateSubscribers.add(onChange),
      (): Dynamic => SessionElementStateSubscribers.delete(onChange)
    ),
    activeCropElement,
  );
}
export {
  activeCropElement,
  claimLateGesture,
  CropIsNotAvailableHereForMessage,
  dispatchElementSessionGesture,
  reactSessionElementState,
  registerElementSession,
  registerLateGesture,
  SessionElementStateCache,
  SessionElementStateCache_2,
  SessionElementStateCache_3,
  SessionElementStateCroppingTargetSelectedConfig,
  SessionElementStateGet,
  SessionElementStateItems,
  SessionElementStateKey,
  SessionElementStateSubscribers,
  SessionElementStateUnloadedTurnedAutoConfig,
  unregisterElementSession,
  updateElementSessionState,
  useActiveCropElement,
  useElementSessionState,
};
export function installEditorSessionElementState(): () => void {
  return () => {
    reactSessionElementState = toModuleNamespace(
      load_react(),
      1,
    );
    SessionElementStateCroppingTargetSelectedConfig = {
      cropping: null,
      target: null,
      selected: null,
    };
    SessionElementStateCache = new Map();
    SessionElementStateSubscribers = new Set();
    SessionElementStateGet = (file?: Dynamic): Dynamic =>
      SessionElementStateCache.get(file) ??
      SessionElementStateCroppingTargetSelectedConfig;
    SessionElementStateCache_2 = new Map();
    SessionElementStateItems = [];
    SessionElementStateKey = (file?: Dynamic, entry?: Dynamic): Dynamic => {
      entry.key !== undefined &&
        SessionElementStateItems.push(file + "|" + entry.key) > 32 &&
        SessionElementStateItems.shift();
      let remaining: Dynamic = (SessionElementStateCache_2.get(file) ?? []).filter(
        (item?: Dynamic): Dynamic => item !== entry,
      );
      remaining.length
        ? SessionElementStateCache_2.set(file, remaining)
        : SessionElementStateCache_2.delete(file);
    };
    SessionElementStateCache_3 = new Map();
    CropIsNotAvailableHereForMessage =
      uiMessage("inspector.elementState.cropIsNotAvailableHere");
    SessionElementStateUnloadedTurnedAutoConfig = {
      unloaded:
        "This has not loaded, or its file is missing, so there is nothing to crop.",
      turned:
        "Crop does not work while this is flipped, skewed or unevenly scaled, or sits in a rotated or unevenly scaled container.",
      auto: "This has no set width or height, so a crop would resize it. Set a width or height first.",
      offboard: "Bring this back onto the artboard to crop it.",
      custom:
        "Its own CSS places or crops this in a form this editor cannot edit. Remove object-position or object-view-box to crop it here.",
      "foreign-zoom":
        "This was zoomed in Chrome or Edge. Crop it there: this browser cannot show the zoom.",
    };
  };
}
