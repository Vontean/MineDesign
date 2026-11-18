/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var spaceActivatedElements: Dynamic;
function buttonKeyboardActivation(onActivate?: Dynamic): Dynamic {
  return {
    onKeyDown(event: Dynamic): Dynamic {
      (event.key !== "Enter" && event.key !== " ") ||
        event.altKey ||
        event.ctrlKey ||
        event.defaultPrevented ||
        (event.preventDefault(),
        !event.repeat &&
          (event.key === "Enter"
            ? onActivate(event)
            : spaceActivatedElements.add(event.currentTarget)));
    },
    onKeyUp(event: Dynamic): Dynamic {
      event.key !== " " ||
        !spaceActivatedElements.delete(event.currentTarget) ||
        event.altKey ||
        event.ctrlKey ||
        event.defaultPrevented ||
        (event.preventDefault(), onActivate(event));
    },
    onBlur(blurEvent: Dynamic): Dynamic {
      spaceActivatedElements.delete(blurEvent.currentTarget);
    },
  };
}
export {
  buttonKeyboardActivation,
  spaceActivatedElements,
};
export function installCanvasKeyboardActivation(): () => void {
  return () => {
    spaceActivatedElements = new WeakSet();
  };
}
