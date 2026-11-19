/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { promoteSvgShapeToRoot } from "./element-order";

var SelectionTreeNavigationHelmetScHelmetPattern: Dynamic;
var SelectionTreeNavigationTest: Dynamic;
var SelectionTreeNavigationFilter: Dynamic;
var SelectionTreeNavigationHandler: Dynamic;
function clientPointToArtboard(
  clientX?: Dynamic,
  clientY?: Dynamic,
  artboardRect?: Dynamic,
  frameWidth?: Dynamic,
): Dynamic {
  let isUsableCoordinate: Dynamic = (coordinate?: Dynamic): Dynamic =>
    typeof coordinate == "number" &&
    Number.isFinite(coordinate) &&
    Math.abs(coordinate) < 1e6;
  if (!isUsableCoordinate(clientX) || !isUsableCoordinate(clientY)) return null;
  let scale: Dynamic = frameWidth ? artboardRect.width / frameWidth : 1;
  return {
    x: Math.min(
      artboardRect.right,
      Math.max(artboardRect.left, clientX * scale + artboardRect.left),
    ),
    y: Math.min(
      artboardRect.bottom,
      Math.max(artboardRect.top, clientY * scale + artboardRect.top),
    ),
  };
}
function navigableChildIds(model?: Dynamic, parentTid?: Dynamic): Dynamic {
  return model
    .childTids(parentTid)
    .filter(
      (tid?: Dynamic): Dynamic =>
        SelectionTreeNavigationTest(model, tid),
    );
}
function selectionChildren(model?: Dynamic, tids?: Dynamic): Dynamic {
  return SelectionTreeNavigationHandler(
    SelectionTreeNavigationFilter(model, tids).flatMap(
      (tid?: Dynamic): Dynamic => navigableChildIds(model, tid),
    ),
  );
}
function selectionParents(model?: Dynamic, tids?: Dynamic): Dynamic {
  return SelectionTreeNavigationHandler(
    SelectionTreeNavigationFilter(model, tids)
      .map((tid?: Dynamic): Dynamic => model.parentTid(tid))
      .filter((parentTid?: Dynamic): Dynamic => parentTid != null),
  );
}
function selectionAdjacentSiblings(
  model?: Dynamic,
  tids?: Dynamic,
  direction?: Dynamic,
): Dynamic {
  return SelectionTreeNavigationHandler(
    SelectionTreeNavigationFilter(model, tids).map(
      (tid?: Dynamic): Dynamic => {
        let siblings: Dynamic = navigableChildIds(
            model,
            model.parentTid(tid),
          ),
          index: Dynamic = siblings.indexOf(tid);
        return index < 0 || siblings.length < 2
          ? tid
          : siblings[
              (index + (direction === "next" ? 1 : siblings.length - 1)) %
                siblings.length
            ];
      },
    ),
  );
}
function selectionSiblingIds(model?: Dynamic, tids?: Dynamic): Dynamic {
  let firstTid: Dynamic = SelectionTreeNavigationFilter(model, tids)[0];
  return navigableChildIds(
    model,
    firstTid == null ? null : model.parentTid(firstTid),
  );
}
function promotedSvgSelection(model?: Dynamic, tids?: Dynamic): Dynamic {
  let validTids: Dynamic = SelectionTreeNavigationFilter(model, tids),
    targets: Dynamic = SelectionTreeNavigationHandler(
      validTids.map(
        (tid?: Dynamic): Dynamic =>
          promoteSvgShapeToRoot(model, tid),
      ),
    ),
    hasPromoted: Dynamic =
      targets.length !== validTids.length ||
      targets.some(
        (target?: Dynamic, index?: Dynamic): Dynamic =>
          target !== validTids[index],
      );
  return {
    targets: targets,
    promoted: hasPromoted,
  };
}
export {
  clientPointToArtboard,
  navigableChildIds,
  promotedSvgSelection,
  selectionAdjacentSiblings,
  selectionChildren,
  selectionParents,
  selectionSiblingIds,
  SelectionTreeNavigationFilter,
  SelectionTreeNavigationHandler,
  SelectionTreeNavigationHelmetScHelmetPattern,
  SelectionTreeNavigationTest,
};
export function installEditorSelectionTreeNavigation(): () => void {
  return () => {
    SelectionTreeNavigationHelmetScHelmetPattern =
      /^(helmet|sc-helmet|script|style|link|noscript|template)$/i;
    SelectionTreeNavigationTest = (
      model?: Dynamic,
      tid?: Dynamic,
    ): Dynamic =>
      !SelectionTreeNavigationHelmetScHelmetPattern.test(
        model.tagName(tid) ?? "",
      );
    SelectionTreeNavigationFilter = (
      model?: Dynamic,
      tids?: Dynamic,
    ): Dynamic =>
      tids.filter(
        (tid?: Dynamic): Dynamic => model.element(tid) != null,
      );
    SelectionTreeNavigationHandler = (tids?: Dynamic): Dynamic => [
      ...new Set(tids),
    ];
  };
}
