import type { Dynamic } from "../../runtime-types";
import { effectiveTransformSigns } from "./element-transform-geometry";

interface FlowDropOptions {
  unwrap(element: Element): Element;
  templateId(element: Element): number;
  overlayRoot(): HTMLElement;
  isParked(): boolean;
  stroke: string;
}

export function createFlowDropPreview(options: FlowDropOptions) {
  function flowChildren(
    this: Dynamic,
    container?: Dynamic,
    source?: Dynamic,
    excluded?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var children: Dynamic = [], index: Dynamic = 0;
      index < container.children.length;
      index++
    ) {
      var child: Dynamic = container.children[index];
      if (
        !(child === source || (excluded && excluded.indexOf(child) >= 0)) &&
        !(!child.getAttribute || child.getAttribute("data-dc-tpl") == null)
      ) {
        var positioning: Dynamic = getComputedStyle(child).position;
        if (!(positioning === "absolute" || positioning === "fixed")) {
          children.push(child);
        }
      }
    }
    return children;
  }
  function flowInsertionCounts(
    this: Dynamic,
    children?: Dynamic,
    source?: Dynamic,
    excluded?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var indices: Dynamic = [], count: Dynamic = 0, index: Dynamic = 0;
      index < children.length;
      index++
    ) {
      if (
        children[index] !== source &&
        !(excluded && excluded.indexOf(children[index]) >= 0)
      ) {
        count++;
      }
      indices[index] = count;
    }
    return indices;
  }
  function pointInsideRect(
    this: Dynamic,
    rect?: Dynamic,
    x?: Dynamic,
    y?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  }
  function flowInsertionPlan(
    this: Dynamic,
    container?: Dynamic,
    containerTid?: Dynamic,
    source?: Dynamic,
    pointerX?: Dynamic,
    pointerY?: Dynamic,
    previous?: Dynamic,
    keepPrevious?: Dynamic,
    excluded?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var children: Dynamic = flowChildren(container, source, excluded);
    if (children.length === 0)
      return {
        targetTid: containerTid,
        position: containerTid == null ? "root-end" : "into",
        n: 0,
      };
    var slotAt: Dynamic = function (
      this: Dynamic,
      input?: Dynamic,
      ..._unusedNestedArgs: Dynamic[]
    ): Dynamic {
      return input < children.length
        ? {
            targetTid: options.templateId(children[input]),
            position: "before",
            n: input,
          }
        : {
            targetTid: options.templateId(children[children.length - 1]),
            position: "after",
            n: children.length,
          };
    };
    var previousSlot: Dynamic = previous && previous.n <= children.length ? slotAt(previous.n) : null;
    var style: Dynamic = getComputedStyle(container);
    var display: Dynamic = style.display || "";
    var flex: Dynamic = display.indexOf("flex") !== -1;
    var grid: Dynamic = display.indexOf("grid") !== -1;
    if (grid || (flex && style.flexWrap !== "nowrap")) {
      if (previousSlot && keepPrevious) return previousSlot;
      for (
        var vertical: Dynamic = flex
            ? style.flexDirection.indexOf("column") === 0
            : String(style.gridTemplateColumns || "none")
                .trim()
                .split(/\s+/).length < 2,
          reversed: Dynamic =
            flex && style.flexDirection.indexOf("reverse") !== -1,
          transformSigns: Dynamic = effectiveTransformSigns(container),
          visuallyReversed: Dynamic = vertical
            ? reversed !== transformSigns.y < 0
            : ((style.direction === "rtl") !== reversed) != transformSigns.x < 0,
          pointerFraction: Dynamic = function (
            this: Dynamic,
            input?: Dynamic,
            ..._unusedNestedArgs: Dynamic[]
          ): Dynamic {
            var value_et: Dynamic = vertical
              ? (pointerY - input.top) / (input.bottom - input.top || 1)
              : (pointerX - input.left) / (input.right - input.left || 1);
            return visuallyReversed ? 1 - value_et : value_et;
          },
          allChildren: Dynamic = flowChildren(container, null),
          slotIndices: Dynamic = flowInsertionCounts(allChildren, source, excluded),
          slotFor: Dynamic = function (
            this: Dynamic,
            input?: Dynamic,
            ..._unusedNestedArgs: Dynamic[]
          ): Dynamic {
            var value_et: Dynamic = allChildren.indexOf(input);
            return value_et < 0 ? null : slotAt(slotIndices[value_et]);
          },
          sourceSlot: Dynamic = slotFor(source),
          movingElements: Dynamic = [source].concat(excluded || []),
          movingIndex: Dynamic = 0;
        movingIndex < movingElements.length;
        movingIndex++
      ) {
        var movingSlot: Dynamic = slotFor(movingElements[movingIndex]);
        if (
          movingSlot &&
          pointInsideRect(
            options.unwrap(movingElements[movingIndex]).getBoundingClientRect(),
            pointerX,
            pointerY,
          )
        )
          return movingSlot;
      }
      for (var childIndex: Dynamic = 0; childIndex < children.length; childIndex++) {
        var bounds: Dynamic = options.unwrap(
          children[childIndex],
        ).getBoundingClientRect();
        if (pointInsideRect(bounds, pointerX, pointerY)) {
          var fraction: Dynamic = pointerFraction(bounds);
          return previousSlot &&
            ((previousSlot.n === childIndex && fraction < 0.65) ||
              (previousSlot.n === childIndex + 1 && fraction > 0.35))
            ? previousSlot
            : slotAt(fraction < 0.5 ? childIndex : childIndex + 1);
        }
      }
      var lastChildBounds: Dynamic = options.unwrap(
        children[children.length - 1],
      ).getBoundingClientRect();
      var beyondLast: Dynamic = vertical
        ? (visuallyReversed ? pointerY < lastChildBounds.top : pointerY > lastChildBounds.bottom) &&
          pointerX >= lastChildBounds.left &&
          pointerX <= lastChildBounds.right
        : (visuallyReversed ? pointerX < lastChildBounds.left : pointerX > lastChildBounds.right) &&
          pointerY >= lastChildBounds.top &&
          pointerY <= lastChildBounds.bottom;
      if (beyondLast) return slotAt(children.length);
      if (previousSlot || sourceSlot) return previousSlot || sourceSlot;
      for (
        var closestIndex: Dynamic = -1, closestDistance: Dynamic = 1 / 0, candidateIndex: Dynamic = 0;
        candidateIndex < children.length;
        candidateIndex++
      ) {
        var candidateBounds: Dynamic = options.unwrap(
          children[candidateIndex],
        ).getBoundingClientRect();
        if (!(candidateBounds.right <= candidateBounds.left || candidateBounds.bottom <= candidateBounds.top)) {
          var deltaX: Dynamic = pointerX - (candidateBounds.left + candidateBounds.right) / 2;
          var deltaY: Dynamic = pointerY - (candidateBounds.top + candidateBounds.bottom) / 2;
          if (deltaX * deltaX + deltaY * deltaY < closestDistance) {
            closestDistance = deltaX * deltaX + deltaY * deltaY;
            closestIndex = candidateIndex;
          }
        }
      }
      return closestIndex < 0
        ? slotAt(children.length)
        : slotAt(
            pointerFraction(
              options.unwrap(children[closestIndex]).getBoundingClientRect(),
            ) < 0.5
              ? closestIndex
              : closestIndex + 1,
          );
    }
    for (
      var horizontal: Dynamic =
          (flex && style.flexDirection.indexOf("row") === 0) ||
          display === "table-row" ||
          (container.tagName || "").toLowerCase() === "tr",
        pointerOffset: Dynamic = horizontal ? pointerX : pointerY,
        flipped: Dynamic = horizontal
          ? effectiveTransformSigns(container).x < 0
          : effectiveTransformSigns(container).y < 0,
        index: Dynamic = 0;
      index < children.length;
      index++
    ) {
      var childBounds: Dynamic = children[index].getBoundingClientRect();
      var midpoint: Dynamic = horizontal
        ? (childBounds.left + childBounds.right) / 2
        : (childBounds.top + childBounds.bottom) / 2;
      if (flipped ? pointerOffset > midpoint : pointerOffset < midpoint)
        return slotAt(index);
    }
    return slotAt(children.length);
  }
  let flowOverlay: HTMLDivElement | null = null;
  function ensureFlowOverlay(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return (
      flowOverlay ||
      ((flowOverlay = document.createElement("div")),
      flowOverlay.setAttribute("data-dc-editor-overlay", ""),
      (flowOverlay.style.cssText =
        "position:fixed;inset:0;z-index:2147483643;pointer-events:none;display:none;"),
      options.overlayRoot().appendChild(flowOverlay),
      flowOverlay)
    );
  }
  function clearFlowOverlay(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (flowOverlay)
      for (flowOverlay.style.display = "none"; flowOverlay.firstChild; )
        flowOverlay.removeChild(flowOverlay.firstChild);
  }
  function appendFlowIndicator(
    this: Dynamic,
    overlay?: Dynamic,
    left?: Dynamic,
    top?: Dynamic,
    width?: Dynamic,
    height?: Dynamic,
    selected?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var indicator: Dynamic = document.createElement("div");
    indicator.style.cssText =
      "position:fixed;pointer-events:none;border-radius:2px;background:color-mix(in srgb," +
      options.stroke +
      (selected ? " 90%" : " 40%") +
      ",transparent);";
    indicator.style.left = left + "px";
    indicator.style.top = top + "px";
    indicator.style.width = width + "px";
    indicator.style.height = height + "px";
    overlay.appendChild(indicator);
  }
  function paintFlowInsertion(
    this: Dynamic,
    container?: Dynamic,
    source?: Dynamic,
    slot?: Dynamic,
    excluded?: Dynamic,
    placeholderIndex?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (var overlay: Dynamic = ensureFlowOverlay(); overlay.firstChild; )
      overlay.removeChild(overlay.firstChild);
    overlay.style.display = "block";
    var children: Dynamic = flowChildren(container, source, excluded);
    var allChildren: Dynamic =
      options.isParked() ? flowChildren(container, null) : [];
    var sourceIndex: Dynamic = allChildren.indexOf(source);
    var omittedIndex: Dynamic = placeholderIndex ?? -1;
    if (sourceIndex >= 0) {
      omittedIndex = flowInsertionCounts(allChildren, source, excluded)[sourceIndex];
      for (
        var movingElements: Dynamic = [source].concat(excluded || []),
          movingBounds: Dynamic = [],
          movingIndex: Dynamic = 0;
        movingIndex < movingElements.length;
        movingIndex++
      )
        if (allChildren.indexOf(movingElements[movingIndex]) >= 0) {
          movingBounds.push(
            options.unwrap(movingElements[movingIndex]).getBoundingClientRect(),
          );
        }
      for (movingIndex = 0; movingIndex < movingBounds.length; movingIndex++)
        appendDropBounds(overlay, movingBounds[movingIndex]);
    }
    if (children.length !== 0) {
      var style: Dynamic = getComputedStyle(container);
      var display: Dynamic = style.display || "";
      var wrappedFlex: Dynamic =
        display.indexOf("flex") !== -1 && style.flexWrap !== "nowrap";
      var showCellBounds: Dynamic =
        display.indexOf("grid") !== -1 ||
        wrappedFlex ||
        display === "table-row" ||
        (container.tagName || "").toLowerCase() === "tr";
      if (showCellBounds) {
        for (
          var cellBounds: Dynamic = children.map(function (
              this: Dynamic,
              K?: Dynamic,
              ..._unusedNestedArgs: Dynamic[]
            ): Dynamic {
              return options.unwrap(K).getBoundingClientRect();
            }),
            cellIndex: Dynamic = 0;
          cellIndex < children.length;
          cellIndex++
        ) {
          var cell: Dynamic = cellBounds[cellIndex];
          var marker: Dynamic = document.createElement("div");
          marker.style.cssText =
            "position:fixed;pointer-events:none;border:1px dotted color-mix(in srgb," +
            options.stroke +
            " 60%,transparent);background:color-mix(in srgb," +
            options.stroke +
            " 5%,transparent);border-radius:3px;";
          marker.style.left = cell.left + "px";
          marker.style.top = cell.top + "px";
          marker.style.width = cell.width + "px";
          marker.style.height = cell.height + "px";
          overlay.appendChild(marker);
        }
        return;
      }
      for (
        var horizontal: Dynamic =
            display.indexOf("flex") !== -1 &&
            style.flexDirection.indexOf("row") === 0,
          containerBounds: Dynamic = container.getBoundingClientRect(),
          childBounds: Dynamic = children.map(function (
            this: Dynamic,
            K?: Dynamic,
            ..._unusedNestedArgs: Dynamic[]
          ): Dynamic {
            return K.getBoundingClientRect();
          }),
          index: Dynamic = 0;
        index <= children.length;
        index++
      ) {
        var selected: Dynamic = !!slot && slot.n === index;
        if (index !== omittedIndex) {
          var previous: Dynamic = index > 0 ? childBounds[index - 1] : null;
          var next: Dynamic =
            index < children.length ? childBounds[index] : null;
          if (horizontal) {
            var centerX: Dynamic =
              previous && next
                ? (previous.right + next.left) / 2
                : previous
                  ? previous.right + 3
                  : next.left - 3;
            if (
              (!previous && centerX < containerBounds.left) ||
              (!next && centerX > containerBounds.right)
            )
              continue;
            var topEdge: Dynamic = Math.min(
              previous ? previous.top : next.top,
              next ? next.top : previous.top,
            );
            var bottomEdge: Dynamic = Math.max(
              previous ? previous.bottom : next.bottom,
              next ? next.bottom : previous.bottom,
            );
            appendFlowIndicator(
              overlay,
              centerX - 1,
              topEdge,
              2,
              bottomEdge - topEdge,
              selected,
            );
          } else {
            var centerY: Dynamic =
              previous && next
                ? (previous.bottom + next.top) / 2
                : previous
                  ? previous.bottom + 3
                  : next.top - 3;
            if (
              (!previous && centerY < containerBounds.top) ||
              (!next && centerY > containerBounds.bottom)
            )
              continue;
            var leftEdge: Dynamic = Math.min(
              previous ? previous.left : next.left,
              next ? next.left : previous.left,
            );
            var rightEdge: Dynamic = Math.max(
              previous ? previous.right : next.right,
              next ? next.right : previous.right,
            );
            appendFlowIndicator(overlay, leftEdge, centerY - 1, rightEdge - leftEdge, 2, selected);
          }
        }
      }
    }
  }
  function appendDropBounds(
    this: Dynamic,
    overlay?: Dynamic,
    bounds?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var marker: Dynamic = document.createElement("div");
    marker.style.cssText =
      "position:fixed;pointer-events:none;box-sizing:border-box;border-radius:3px;border:calc(1*var(--dc-chrome-unit,1px)) dashed color-mix(in srgb," +
      options.stroke +
      " 75%,transparent);background:color-mix(in srgb," +
      options.stroke +
      " 6%,transparent);";
    marker.style.left = bounds.left + "px";
    marker.style.top = bounds.top + "px";
    marker.style.width = bounds.width + "px";
    marker.style.height = bounds.height + "px";
    overlay.appendChild(marker);
  }
  return {
    children: flowChildren,
    plan: flowInsertionPlan,
    paint: paintFlowInsertion,
    clear: clearFlowOverlay,
    get visible() { return flowOverlay?.style.display === "block"; },
  };
}
