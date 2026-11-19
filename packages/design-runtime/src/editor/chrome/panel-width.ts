/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactChromePanelShell } from "./panel-shell";
import { ToolbarPrimitivesMediaQuery } from "../toolbar/primitives";

var McSideValue: Dynamic;
var ChromePanelWidthHandler: Dynamic;
var ChromePanelWidthConstant: Dynamic;
var compactMinPanelWidth: Dynamic;
function readPanelPreference(key?: Dynamic, isValid?: Dynamic): Dynamic {
  try {
    let storedText: Dynamic = localStorage.getItem(McSideValue + key);
    if (storedText === null) return;
    let storedValue: Dynamic = JSON.parse(storedText);
    if (isValid(storedValue)) return storedValue;
  } catch {}
}
function writePanelPreference(key?: Dynamic, value?: Dynamic): Dynamic {
  try {
    localStorage.setItem(McSideValue + key, JSON.stringify(value));
  } catch {}
}
function panelMaximumWidth(): Dynamic {
  return Math.max(
    ChromePanelWidthConstant,
    Math.min(560, (window as Dynamic).innerWidth - 120),
  );
}
function clampPanelWidth(width?: Dynamic): Dynamic {
  return Math.max(
    ChromePanelWidthConstant,
    Math.min(panelMaximumWidth(), Math.round(width)),
  );
}
function startPanelResizeGesture(
  event?: Dynamic,
  axis?: Dynamic,
  callbacks?: Dynamic,
  pointerMode: Dynamic = "touch",
): Dynamic {
  let noop: Dynamic = (): Dynamic => {};
  if (
    (pointerMode === "touch" && event.pointerType === "mouse") ||
    !event.isPrimary ||
    event.button !== 0
  )
    return noop;
  event.preventDefault();
  let currentTarget: Dynamic = event.currentTarget,
    pointerId: Dynamic = event.pointerId;
  currentTarget.setPointerCapture?.(pointerId);
  let readPointerPosition: Dynamic = (pointerEvent?: Dynamic): Dynamic =>
      axis === "x" ? pointerEvent.clientX : pointerEvent.clientY,
    startPosition: Dynamic = readPointerPosition(event),
    gestureId: Dynamic = "pointer:" + pointerId,
    hasMoved: Dynamic = false,
    isEnded: Dynamic = false;
  callbacks.onResizeStart(gestureId);
  let handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
      if (moveEvent.pointerId !== pointerId) return;
      let delta: Dynamic = readPointerPosition(moveEvent) - startPosition;
      Math.abs(delta) > 3 && (hasMoved = true);
      callbacks.onResize(delta, gestureId);
    },
    endGesture: Dynamic = (endEvent?: Dynamic): Dynamic => {
      isEnded ||
        ((isEnded = true),
        (window as Dynamic).removeEventListener("pointermove", handlePointerMove),
        (window as Dynamic).removeEventListener("pointerup", handlePointerEnd),
        (window as Dynamic).removeEventListener("pointercancel", handlePointerEnd),
        currentTarget.removeEventListener("lostpointercapture", handlePointerEnd),
        callbacks.onResizeEnd(hasMoved, gestureId, endEvent));
    },
    handlePointerEnd: Dynamic = (endEvent?: Dynamic): Dynamic => {
      endEvent.pointerId === pointerId && endGesture();
    };
  (window as Dynamic).addEventListener("pointermove", handlePointerMove);
  (window as Dynamic).addEventListener("pointerup", handlePointerEnd);
  (window as Dynamic).addEventListener("pointercancel", handlePointerEnd);
  currentTarget.addEventListener("lostpointercapture", handlePointerEnd);
  return endGesture;
}
function usePanelWidth(initialWidth: Dynamic = 304, onWidthChange?: Dynamic): Dynamic {
  let [defaultWidth]: Dynamic = (0, reactChromePanelShell.useState)(
      (): Dynamic =>
        typeof matchMedia == "function" &&
        matchMedia(ToolbarPrimitivesMediaQuery).matches
          ? Math.max(initialWidth, compactMinPanelWidth)
          : initialWidth,
    ),
    [width, setWidth]: Dynamic = (0, reactChromePanelShell.useState)(
      (): Dynamic =>
        readPanelPreference("width", ChromePanelWidthHandler) ?? defaultWidth,
    ),
    [maxWidth, setMaxWidth]: Dynamic = (0, reactChromePanelShell.useState)(
      panelMaximumWidth,
    );
  (0, reactChromePanelShell.useLayoutEffect)((): Dynamic => {
    let updateLimits: Dynamic = (): Dynamic => {
      setMaxWidth(panelMaximumWidth());
      setWidth((currentWidth?: Dynamic): Dynamic => clampPanelWidth(currentWidth));
    };
    updateLimits();
    (window as Dynamic).addEventListener("resize", updateLimits);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("resize", updateLimits);
  }, []);
  let widthRef: Dynamic = (0, reactChromePanelShell.useRef)(width),
    onWidthChangeRef: Dynamic = (0, reactChromePanelShell.useRef)(onWidthChange);
  (0, reactChromePanelShell.useLayoutEffect)((): Dynamic => {
    widthRef.current = width;
    onWidthChangeRef.current = onWidthChange;
  });
  let gestureStartWidthRef: Dynamic = (0, reactChromePanelShell.useRef)(width),
    gesture: Dynamic = (0, reactChromePanelShell.useMemo)(
      (): Dynamic => ({
        onResizeStart: (): Dynamic => {
          gestureStartWidthRef.current = widthRef.current;
        },
        onResize: (deltaPx?: Dynamic): Dynamic => {
          let nextWidth: Dynamic = clampPanelWidth(gestureStartWidthRef.current - deltaPx);
          setWidth(nextWidth);
          onWidthChangeRef.current?.(nextWidth, gestureStartWidthRef.current);
        },
        onResizeEnd: (): Dynamic => {
          setWidth(
            (currentWidth?: Dynamic): Dynamic => (
              writePanelPreference("width", currentWidth),
              currentWidth
            ),
          );
        },
      }),
      [],
    );
  return {
    width: width,
    min: ChromePanelWidthConstant,
    max: maxWidth,
    defaultWidth: defaultWidth,
    gesture: gesture,
  };
}
export {
  ChromePanelWidthConstant,
  compactMinPanelWidth as ChromePanelWidthConstant_2,
  ChromePanelWidthHandler,
  clampPanelWidth,
  McSideValue,
  panelMaximumWidth,
  readPanelPreference,
  startPanelResizeGesture,
  usePanelWidth,
  writePanelPreference,
};
export function installEditorChromePanelWidth(): () => void {
  return () => {
    McSideValue = "mc-side/";
    ChromePanelWidthHandler = (value?: Dynamic): Dynamic =>
      typeof value == "number" && Number.isFinite(value);
    ChromePanelWidthConstant = 285;
    compactMinPanelWidth = 376;
  };
}
