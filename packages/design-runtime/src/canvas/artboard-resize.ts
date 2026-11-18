/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { focusCanvasDocument } from "./focus";

function beginArtboardResize(event?: Dynamic, resizeConfig?: Dynamic): Dynamic {
  if (event.button !== 0) return;
  event.preventDefault();
  event.stopPropagation();
  focusCanvasDocument();
  resizeConfig.onGesture(resizeConfig.src, true);
  resizeConfig.armWindowGestureEnd(resizeConfig.src);
  let [startX, startY, startPointerId]: Dynamic = [
      event.clientX,
      event.clientY,
      event.pointerId,
    ],
    latestPatch: Dynamic = null,
    handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
      if (
        moveEvent.pointerId === startPointerId &&
        !(
          latestPatch === null &&
          Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) < 4
        )
      ) {
        if (resizeConfig.sound && !resizeConfig.sound()) return handlePointerCancel();
        latestPatch = resizeConfig.patchAt(
          (moveEvent.clientX - startX) / resizeConfig.scale,
          (moveEvent.clientY - startY) / resizeConfig.scale,
          moveEvent,
        );
        resizeConfig.onChange(latestPatch, false);
      }
    },
    endGesture: Dynamic = (): Dynamic => {
      (window as Dynamic).removeEventListener("pointermove", handlePointerMove);
      (window as Dynamic).removeEventListener("pointerup", handlePointerUp);
      (window as Dynamic).removeEventListener("pointercancel", handlePointerCancel);
      (window as Dynamic).removeEventListener("keydown", handleKeyDown, true);
      resizeConfig.onGesture(resizeConfig.src, false);
      resizeConfig.onEnd?.();
    },
    serializeRounded: Dynamic = (patch?: Dynamic): Dynamic =>
      JSON.stringify(
        patch,
        (fieldKey?: Dynamic, fieldValue?: Dynamic): Dynamic =>
          typeof fieldValue == "number" ? Math.round(fieldValue) : fieldValue,
      ),
    handlePointerUp: Dynamic = (upEvent?: Dynamic): Dynamic => {
      if (upEvent.pointerId !== startPointerId) return;
      let finalPatch: Dynamic = latestPatch;
      endGesture();
      finalPatch !== null &&
        (serializeRounded(finalPatch) === serializeRounded(resizeConfig.restore) ||
        (resizeConfig.sound && !resizeConfig.sound())
          ? resizeConfig.onChange(resizeConfig.restore, false)
          : resizeConfig.onChange(finalPatch, true));
    },
    handlePointerCancel: Dynamic = (cancelEvent?: Dynamic): Dynamic => {
      if (cancelEvent && cancelEvent.pointerId !== startPointerId) return;
      let hasPatch: Dynamic = latestPatch !== null;
      endGesture();
      hasPatch && resizeConfig.onChange(resizeConfig.restore, false);
    },
    handleKeyDown: Dynamic = (keyEvent?: Dynamic): Dynamic => {
      keyEvent.key === "Escape" &&
        (keyEvent.preventDefault(),
        keyEvent.stopImmediatePropagation(),
        handlePointerCancel());
    };
  (window as Dynamic).addEventListener("pointermove", handlePointerMove);
  (window as Dynamic).addEventListener("pointerup", handlePointerUp);
  (window as Dynamic).addEventListener("pointercancel", handlePointerCancel);
  (window as Dynamic).addEventListener("keydown", handleKeyDown, true);
}
export {
  beginArtboardResize,
};
export function installCanvasArtboardResize(): () => void {
  return () => {};
}
