import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { getViewportMemoryScope } from "./viewport-memory";
import { initializeNpm_usehooks_ts_p0, load_react } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var react_uPt: Dynamic;
var phoneCanvasShowingPrefix: Dynamic;
var phoneCanvasKilledMarker: Dynamic;
var phoneCanvasDocumentMarker: Dynamic;
var phoneCanvasDocumentId: Dynamic;
var getPhoneCanvasStorage: Dynamic;
var phoneCanvasStorageKey: Dynamic;
function isPhoneCanvasDocumentAlive(
  documentId?: Dynamic,
  rootWindow?: Dynamic,
): Dynamic {
  let remainingBudget: Dynamic = 2e3,
    containsDocument: Dynamic = (frameWindow?: Dynamic, depth?: Dynamic): Dynamic => {
      if (remainingBudget-- <= 0) return false;
      try {
        if (frameWindow[phoneCanvasDocumentMarker] === documentId) return true;
      } catch {}
      if (depth === 5) return false;
      try {
        for (
          let index: Dynamic = 0,
            childCount: Dynamic = Math.min(frameWindow.length, 100);
          index < childCount;
          index++
        )
          if (containsDocument(frameWindow[index], depth + 1)) return true;
      } catch {}
      return false;
    };
  try {
    return containsDocument(rootWindow ?? (window as Dynamic).top ?? window, 0);
  } catch {
    return false;
  }
}
function wasPhoneCanvasKilled(
  storage?: Dynamic,
  storageKey?: Dynamic,
  isDocumentAlive: Dynamic = isPhoneCanvasDocumentAlive,
): Dynamic {
  try {
    let storedValue: Dynamic = storage?.getItem(storageKey) ?? null;
    if (storedValue === phoneCanvasKilledMarker) return true;
    if (storedValue === null || !storedValue.startsWith(phoneCanvasShowingPrefix))
      return false;
    let storedDocumentId: Dynamic = storedValue.slice(phoneCanvasShowingPrefix.length);
    return storedDocumentId === phoneCanvasDocumentId || isDocumentAlive(storedDocumentId)
      ? false
      : (storage?.setItem(storageKey, phoneCanvasKilledMarker), true);
  } catch {
    return false;
  }
}
function markPhoneCanvasVisibility(
  storage?: Dynamic,
  storageKey?: Dynamic,
  isVisible?: Dynamic,
): Dynamic {
  try {
    let storedValue: Dynamic = storage?.getItem(storageKey) ?? null;
    if (storage == null || storedValue === phoneCanvasKilledMarker) return;
    isVisible
      ? storage.setItem(
          storageKey,
          phoneCanvasShowingPrefix + phoneCanvasDocumentId,
        )
      : storedValue === phoneCanvasShowingPrefix + phoneCanvasDocumentId &&
        storage.removeItem(storageKey);
  } catch {}
}
function usePhoneCanvasVisibility(isEnabled?: Dynamic): Dynamic {
  (0, react_uPt.useLayoutEffect)((): Dynamic => {
    if (!isEnabled) return;
    let storage: Dynamic = getPhoneCanvasStorage(),
      storageKey: Dynamic = phoneCanvasStorageKey(),
      markVisibilityFromDocument: Dynamic = (): Dynamic =>
        markPhoneCanvasVisibility(
          storage,
          storageKey,
          (document as Dynamic).visibilityState !== "hidden",
        ),
      markHidden: Dynamic = (): Dynamic =>
        markPhoneCanvasVisibility(storage, storageKey, false),
      handleStorageEvent: Dynamic = (storageEvent?: Dynamic): Dynamic => {
        storageEvent.key === storageKey && storageEvent.newValue === null && markVisibilityFromDocument();
      };
    markVisibilityFromDocument();
    (document as Dynamic).addEventListener("visibilitychange", markVisibilityFromDocument);
    (window as Dynamic).addEventListener("pageshow", markVisibilityFromDocument);
    (window as Dynamic).addEventListener("pagehide", markHidden);
    (window as Dynamic).addEventListener("storage", handleStorageEvent);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("visibilitychange", markVisibilityFromDocument);
      (window as Dynamic).removeEventListener("pageshow", markVisibilityFromDocument);
      (window as Dynamic).removeEventListener("pagehide", markHidden);
      (window as Dynamic).removeEventListener("storage", handleStorageEvent);
      markHidden();
    };
  }, [isEnabled]);
}
export {
  getPhoneCanvasStorage,
  isPhoneCanvasDocumentAlive,
  markPhoneCanvasVisibility,
  phoneCanvasDocumentId,
  phoneCanvasDocumentMarker,
  phoneCanvasKilledMarker,
  phoneCanvasShowingPrefix,
  phoneCanvasStorageKey,
  react_uPt,
  usePhoneCanvasVisibility,
  wasPhoneCanvasKilled,
};
export function installCanvasPhoneVisibility(): () => void {
  return () => {
    initializeNpm_usehooks_ts_p0();
    react_uPt = toModuleNamespace(load_react(), 1);
    phoneCanvasShowingPrefix = uiMessage("canvas.phoneVisibility.showing");
    phoneCanvasKilledMarker = "killed";
    phoneCanvasDocumentMarker = "__designPhoneCanvasDocument";
    phoneCanvasDocumentId =
      Math.random().toString(36).slice(2) + Date.now().toString(36);
    typeof window !== "undefined" &&
      Object.assign(window, {
        [phoneCanvasDocumentMarker]: phoneCanvasDocumentId,
      });
    getPhoneCanvasStorage = (): Dynamic => {
      try {
        return (
          (typeof sessionStorage === "undefined"
            ? undefined
            : sessionStorage) ?? undefined
        );
      } catch {
        return;
      }
    };
    phoneCanvasStorageKey = (): Dynamic =>
      "design-phone-canvas/" + getViewportMemoryScope();
  };
}
