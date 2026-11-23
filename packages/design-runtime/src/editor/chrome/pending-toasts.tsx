/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { useToastManager } from "../../cds/toast/toast";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactChromePendingToasts: Dynamic;
var ChromePendingToastsFilterValue: Dynamic;
var ChromePendingToastsCurrentState: Dynamic;
var ChromePendingToastsConstant: Dynamic;
var ChromePendingToastsSubscribers: Dynamic;
var pinnedStateListeners: Dynamic;
function notifyPendingToasts(): Dynamic {
  for (let listener of ChromePendingToastsSubscribers as Dynamic)
    listener(ChromePendingToastsFilterValue);
}
function showEditorToast(text?: Dynamic, durationMs: Dynamic = 6e3): Dynamic {
  let toastId: Dynamic = ChromePendingToastsConstant++;
  ChromePendingToastsFilterValue = [
    ...ChromePendingToastsFilterValue,
    {
      id: toastId,
      text: text,
      durationMs: durationMs,
    },
  ];
  notifyPendingToasts();
  return toastId;
}
function showEditorActionToast(
  text?: Dynamic,
  action?: Dynamic,
  onClose?: Dynamic,
): Dynamic {
  let toastId: Dynamic = ChromePendingToastsConstant++;
  ChromePendingToastsFilterValue = [
    ...ChromePendingToastsFilterValue,
    {
      id: toastId,
      text: text,
      durationMs: 0,
      action: action,
      ...(onClose
        ? {
            onClose: onClose,
          }
        : {}),
    },
  ];
  notifyPendingToasts();
  return toastId;
}
function closeEditorToast(toastId?: Dynamic): Dynamic {
  ChromePendingToastsFilterValue.some(
    (toast?: Dynamic): Dynamic => toast.id === toastId,
  ) &&
    ((ChromePendingToastsFilterValue = ChromePendingToastsFilterValue.filter(
      (toast?: Dynamic): Dynamic => toast.id !== toastId,
    )),
    notifyPendingToasts());
}
function subscribeEditorToasts(listener?: Dynamic): Dynamic {
  ChromePendingToastsSubscribers.add(listener);
  listener(ChromePendingToastsFilterValue);
  return (): Dynamic => {
    ChromePendingToastsSubscribers.delete(listener);
  };
}
function PendingEditorToasts(): Dynamic {
  let {
      add: addToast,
      close: closeToast,
      setPinned: setPinned,
    }: Dynamic = useToastManager(),
    toastHandles: Dynamic = (0, reactChromePendingToasts.useRef)(new Map());
  (0, reactChromePendingToasts.useEffect)((): Dynamic => {
    let forwardPinned: Dynamic = (pinned?: Dynamic): Dynamic => setPinned(pinned);
    pinnedStateListeners.add(forwardPinned);
    ChromePendingToastsCurrentState !== null &&
      forwardPinned(ChromePendingToastsCurrentState);
    return (): Dynamic => {
      pinnedStateListeners.delete(forwardPinned);
    };
  }, [setPinned]);
  (0, reactChromePendingToasts.useEffect)((): Dynamic => {
    let current: Dynamic = toastHandles.current;
    return subscribeEditorToasts((toasts?: Dynamic): Dynamic => {
      let activeIds: Dynamic = new Set(
        toasts.map((toast?: Dynamic): Dynamic => toast.id),
      );
      for (let toast of toasts as Dynamic) {
        if (current.has(toast.id)) continue;
        let handle: Dynamic = addToast({
          title: toast.text,
          action: toast.action,
          timeout: Math.max(0, toast.durationMs),
          dedupe: false,
          onClose: (): Dynamic => {
            current.delete(toast.id);
            closeEditorToast(toast.id);
            toast.onClose?.();
          },
        });
        current.set(toast.id, handle);
      }
      for (let [toastId, handle] of [...current] as Dynamic)
        activeIds.has(toastId) || (current.delete(toastId), closeToast(handle));
    });
  }, [addToast, closeToast]);
  return null;
}
export {
  ChromePendingToastsConstant,
  ChromePendingToastsCurrentState,
  ChromePendingToastsFilterValue,
  ChromePendingToastsSubscribers,
  pinnedStateListeners,
  closeEditorToast,
  notifyPendingToasts,
  PendingEditorToasts,
  reactChromePendingToasts,
  showEditorActionToast,
  showEditorToast,
  subscribeEditorToasts,
};
export function installEditorChromePendingToasts(): () => void {
  return () => {
    reactChromePendingToasts = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    ChromePendingToastsFilterValue = [];
    ChromePendingToastsCurrentState = null;
    ChromePendingToastsConstant = 1;
    ChromePendingToastsSubscribers = new Set();
    pinnedStateListeners = new Set();
  };
}
