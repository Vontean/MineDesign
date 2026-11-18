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
var ChromePendingToastsSubscribers_2: Dynamic;
function notifyPendingToasts(): Dynamic {
  for (let value of ChromePendingToastsSubscribers as Dynamic)
    value(ChromePendingToastsFilterValue);
}
function showEditorToast(input?: Dynamic, options: Dynamic = 6e3): Dynamic {
  let value: Dynamic = ChromePendingToastsConstant++;
  ChromePendingToastsFilterValue = [
    ...ChromePendingToastsFilterValue,
    {
      id: value,
      text: input,
      durationMs: options,
    },
  ];
  notifyPendingToasts();
  return value;
}
function showEditorActionToast(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = ChromePendingToastsConstant++;
  ChromePendingToastsFilterValue = [
    ...ChromePendingToastsFilterValue,
    {
      id: value,
      text: input,
      durationMs: 0,
      action: options,
      ...(context
        ? {
            onClose: context,
          }
        : {}),
    },
  ];
  notifyPendingToasts();
  return value;
}
function closeEditorToast(input?: Dynamic): Dynamic {
  ChromePendingToastsFilterValue.some(
    (input2?: Dynamic): Dynamic => input2.id === input,
  ) &&
    ((ChromePendingToastsFilterValue = ChromePendingToastsFilterValue.filter(
      (input2?: Dynamic): Dynamic => input2.id !== input,
    )),
    notifyPendingToasts());
}
function subscribeEditorToasts(input?: Dynamic): Dynamic {
  ChromePendingToastsSubscribers.add(input);
  input(ChromePendingToastsFilterValue);
  return (): Dynamic => {
    ChromePendingToastsSubscribers.delete(input);
  };
}
function PendingEditorToasts(): Dynamic {
  let {
      add: value,
      close: value2,
      setPinned: value3,
    }: Dynamic = useToastManager(),
    value4: Dynamic = (0, reactChromePendingToasts.useRef)(new Map());
  (0, reactChromePendingToasts.useEffect)((): Dynamic => {
    let callback: Dynamic = (input?: Dynamic): Dynamic => value3(input);
    ChromePendingToastsSubscribers_2.add(callback);
    ChromePendingToastsCurrentState !== null &&
      callback(ChromePendingToastsCurrentState);
    return (): Dynamic => {
      ChromePendingToastsSubscribers_2.delete(callback);
    };
  }, [value3]);
  (0, reactChromePendingToasts.useEffect)((): Dynamic => {
    let current: Dynamic = value4.current;
    return subscribeEditorToasts((input?: Dynamic): Dynamic => {
      let values: Dynamic = new Set(
        input.map((input2?: Dynamic): Dynamic => input2.id),
      );
      for (let value5 of input as Dynamic) {
        if (current.has(value5.id)) continue;
        let value6: Dynamic = value({
          title: value5.text,
          action: value5.action,
          timeout: Math.max(0, value5.durationMs),
          dedupe: false,
          onClose: (): Dynamic => {
            current.delete(value5.id);
            closeEditorToast(value5.id);
            value5.onClose?.();
          },
        });
        current.set(value5.id, value6);
      }
      for (let [value5, value6] of [...current] as Dynamic)
        values.has(value5) || (current.delete(value5), value2(value6));
    });
  }, [value, value2]);
  return null;
}
export {
  ChromePendingToastsConstant,
  ChromePendingToastsCurrentState,
  ChromePendingToastsFilterValue,
  ChromePendingToastsSubscribers,
  ChromePendingToastsSubscribers_2,
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
    ChromePendingToastsSubscribers_2 = new Set();
  };
}
