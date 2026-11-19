/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function captureSelectionSvg(
  element?: Dynamic,
  selector?: Dynamic,
  selectionSize?: Dynamic,
  scrollContainer?: Dynamic,
): Dynamic {
  let selectedElement: Dynamic = element.querySelector(
    selector || "[data-dc-editor-selected]",
  );
  if (!selectedElement)
    return {
      e: "no-selection",
    };
  let svgRoot: Dynamic =
      (selectedElement.ownerSVGElement != null && selectedElement.closest("svg")) ||
      selectedElement,
    width: Dynamic = svgRoot.offsetWidth || 0,
    height: Dynamic = svgRoot.offsetHeight || 0;
  if (!width || !height) {
    let bounds: Dynamic = svgRoot.getBoundingClientRect(),
      count: Dynamic = 1;
    for (
      let parentElement: Dynamic = svgRoot.parentElement;
      parentElement;
      parentElement = parentElement.parentElement
    )
      if (parentElement.offsetWidth > 0) {
        let parentBounds: Dynamic = parentElement.getBoundingClientRect();
        if (parentBounds.width > 0) {
          count = parentBounds.width / parentElement.offsetWidth;
          break;
        }
      }
    width = Math.round(bounds.width / count) || width;
    height = Math.round(bounds.height / count) || height;
  }
  selectionSize &&
    width > 0 &&
    ((width = selectionSize.w),
    (height = Math.max(
      selectionSize.h,
      height,
      (scrollContainer && svgRoot.scrollHeight) || 0,
    )));
  return !width || !height
    ? {
        e: "zero-size",
      }
    : {
        root: svgRoot,
        w: width,
        h: height,
      };
}
export {
  captureSelectionSvg,
};
export function installExportCaptureSelection(): () => void {
  return () => {};
}
