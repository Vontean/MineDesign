import { canvasShapeReact as React } from "../../canvas/shape";
import { inspectorPanelId, linkPopoverAttribute } from "../inspector/context";
import { McFindAttribute } from "../keyboard/find";
import { isOutlineRowTarget } from "../outline/tree";
import { blockingOverlaySelectorAlias } from "../text/typing-target";
import type { Dynamic } from "../../runtime-types";

/** 点击编辑区外部时结束文字编辑，保留面板与弹层内的交互。 */
export function useTextEditOutsidePointer(
  active: Dynamic,
  readOnly: Dynamic,
  pendingTextState: Dynamic,
  finishOpenTextEdit: Dynamic,
  clearSelection: Dynamic,
  typingQuietScheduler: Dynamic,
): void {
  (0, React.useEffect)((): Dynamic => {
    if (!active || readOnly || pendingTextState === null) return;
    let selectionStripSelector: Dynamic = "[data-mega-selection-strip]",
      keepTextOpenSelector: Dynamic = `${selectionStripSelector}, [data-base-ui-portal], [data-cds-portal], [${McFindAttribute}], #${inspectorPanelId}, ${blockingOverlaySelectorAlias}`,
      handleOutsideTextPointerDown: Dynamic = (event?: Dynamic): Dynamic => {
        (event.target instanceof Element &&
          event.target.closest(
            typingQuietScheduler.owes()
              ? `${selectionStripSelector}, [${linkPopoverAttribute}]`
              : keepTextOpenSelector,
          )) ||
          (typingQuietScheduler.owes() &&
            event.target instanceof Element &&
            isOutlineRowTarget(event.target) &&
            clearSelection(),
          finishOpenTextEdit());
      };
    (document as Dynamic).addEventListener("pointerdown", handleOutsideTextPointerDown, true);
    return (): Dynamic =>
      (document as Dynamic).removeEventListener(
        "pointerdown",
        handleOutsideTextPointerDown,
        true,
      );
  }, [active, readOnly, pendingTextState, finishOpenTextEdit, clearSelection, typingQuietScheduler]);
}
