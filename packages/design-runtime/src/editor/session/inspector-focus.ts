import { canvasShapeReact as React } from "../../canvas/shape";
import { modifierOnlyKeys } from "../inspector/editor";
import { isOutlineKeyboardFocus } from "../inspector/modes";
import { consumeOutlineRefocus } from "../outline/rename";
import { focusProModeButton } from "../tools";
import type { Dynamic } from "../../runtime-types";

/** 管理检查器标签、输入方式和图层选区变化后的焦点恢复。 */
export function useInspectorFocus(
  layoutPosture: Dynamic,
  inspectorHost: Dynamic,
  isInspectorOpen: Dynamic,
  outlineArtboards: Dynamic,
  selection: Dynamic,
) {
  let [inspectorSheetTab, setInspectorSheetTab]: Dynamic = (0,
    React.useState)("edit"),
    lastInputWasPointerRef: Dynamic = (0, React.useRef)(false);
  (0, React.useEffect)((): Dynamic => {
    if (layoutPosture === "wide") return;
    let recordPointerInput: Dynamic = (): Dynamic => {
        lastInputWasPointerRef.current = true;
      },
      recordKeyboardInput: Dynamic = (keyEvent?: Dynamic): Dynamic => {
        keyEvent.repeat ||
          keyEvent.key === "AltGraph" ||
          modifierOnlyKeys.has(keyEvent.key) ||
          (lastInputWasPointerRef.current = false);
      };
    (document as Dynamic).addEventListener("pointerdown", recordPointerInput, true);
    (document as Dynamic).addEventListener("keydown", recordKeyboardInput, true);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener(
        "pointerdown",
        recordPointerInput,
        true,
      );
      (document as Dynamic).removeEventListener("keydown", recordKeyboardInput, true);
    };
  }, [layoutPosture]);
  let inspectorFocusContextRef: Dynamic = (0, React.useRef)({
    posture: layoutPosture,
    panelAside: inspectorHost,
  });
  inspectorFocusContextRef.current = {
    posture: layoutPosture,
    panelAside: inspectorHost,
  };
  let lastInspectorSelectionKeyRef: Dynamic = (0, React.useRef)(null);
  (0, React.useEffect)((): Dynamic => {
    let nextSelectionKey: Dynamic =
        selection == null
          ? null
          : selection.name +
            ":" +
            [...selection.tids]
              .sort(
                (earlierTid?: Dynamic, laterTid?: Dynamic): Dynamic =>
                  earlierTid - laterTid,
              )
              .join(","),
      didSelectionChange: Dynamic = nextSelectionKey !== lastInspectorSelectionKeyRef.current;
    lastInspectorSelectionKeyRef.current = nextSelectionKey;
    if (selection == null || !didSelectionChange) return;
    let focusContext: Dynamic = inspectorFocusContextRef.current;
    focusContext.posture !== "wide" &&
      isOutlineKeyboardFocus(
        (document as Dynamic).activeElement,
        lastInputWasPointerRef.current,
      ) &&
      focusProModeButton(focusContext.panelAside);
    setInspectorSheetTab("edit");
  }, [selection]);
  let didCheckOutlineRefocusRef: Dynamic = (0, React.useRef)(false);
  (0, React.useEffect)((): Dynamic => {
    let outlineCursor: Dynamic = outlineArtboards?.cursor;
    didCheckOutlineRefocusRef.current ||
      layoutPosture === "wide" ||
      inspectorHost == null ||
      !isInspectorOpen ||
      outlineCursor == null ||
      ((didCheckOutlineRefocusRef.current = true),
      consumeOutlineRefocus(outlineCursor) &&
        requestAnimationFrame((): Dynamic => {
          ((document as Dynamic).activeElement == null ||
            (document as Dynamic).activeElement ===
              (document as Dynamic).body) &&
            !lastInputWasPointerRef.current &&
            focusProModeButton(inspectorHost);
        }));
  }, [outlineArtboards, layoutPosture, inspectorHost, isInspectorOpen]);
  return { inspectorSheetTab, setInspectorSheetTab, lastInspectorSelectionKeyRef };
}
