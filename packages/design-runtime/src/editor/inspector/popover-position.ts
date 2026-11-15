/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { InspectorStyleMetadataTextTspanTextpathSet } from "./style-metadata";

var InspectorPopoverPositionGUseSet: Dynamic;
var InspectorPopoverPositionPropConfig: Dynamic;
function clampPopoverToCanvas(
  point?: Dynamic,
  canvasRect?: Dynamic,
  popupSize?: Dynamic,
): Dynamic {
  return {
    x: Math.max(
      canvasRect.left + 8,
      Math.min(canvasRect.right - popupSize.w, point.x),
    ),
    y: Math.max(
      canvasRect.top + 8,
      Math.min(canvasRect.bottom - popupSize.h, point.y),
    ),
  };
}
function clampPopoverAnchorTop(
  anchorY?: Dynamic,
  canvasRect?: Dynamic,
  titleHeight?: Dynamic,
): Dynamic {
  return Math.max(
    canvasRect.top + 12 + titleHeight,
    Math.min(canvasRect.bottom - 8, anchorY),
  );
}
export {
  clampPopoverAnchorTop,
  clampPopoverToCanvas,
  InspectorPopoverPositionGUseSet,
  InspectorPopoverPositionPropConfig,
};
export function installEditorInspectorPopoverPosition(): () => void {
  return () => {
    InspectorPopoverPositionGUseSet = new Set([
      "g",
      "use",
      ...InspectorStyleMetadataTextTspanTextpathSet,
    ]);
    InspectorPopoverPositionPropConfig = {
      prop: "background-color",
    };
  };
}
