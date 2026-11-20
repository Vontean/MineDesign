import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactAssetDrag: typeof import("react");
var ASSET_DRAG_START_DISTANCE_PX: number;
var ASSET_DRAG_SCROLL_EDGE_PX: number;
var ASSET_DRAG_MAX_SCROLL_STEP_PX: number;
function assetDropTargetsEqual(
  left: Model.AssetDropTarget | null,
  right: Model.AssetDropTarget | null,
): boolean {
  if (left === null || right === null) {
    return left === right;
  }
  if (left.kind !== right.kind) {
    return false;
  }
  if (left.kind === "new") {
    return true;
  }
  return (
    left.group ===
      (
        right as Exclude<
          Model.AssetDropTarget,
          {
            kind: "new";
          }
        >
      ).group &&
    (left.kind === "group" ||
      left.before ===
        (
          right as Extract<
            Model.AssetDropTarget,
            {
              kind: "slot";
            }
          >
        ).before)
  );
}
function assetDropTargetAtPoint(
  document: Document,
  clientX: number,
  clientY: number,
  leadIds: ReadonlySet<string>,
  allowNewGroup: Model.AssetDropTarget | null,
): Model.AssetDropTarget | null {
  let targetElement = document.elementFromPoint(clientX, clientY);
  if (targetElement === null || typeof targetElement.closest !== "function") {
    return null;
  }
  if (targetElement.closest<HTMLElement>('[data-drop-zone="new"]') !== null) {
    return {
      kind: "new",
    };
  }
  let dropGroupElement = targetElement.closest<HTMLElement>("[data-drop-group]");
  if (dropGroupElement === null) {
    return null;
  }
  let groupId = dropGroupElement.dataset.dropGroup ?? "",
    dropTileElement = targetElement.closest<HTMLElement>("[data-tile-id]");
  if (dropTileElement !== null && dropGroupElement.contains(dropTileElement)) {
    let draggedTileId = dropTileElement.dataset.tileId ?? "",
      items = [...dropGroupElement.querySelectorAll<HTMLElement>("[data-tile-id]")],
      findNextTileId = (offset: number) =>
        items
          .slice(offset)
          .map((tileElement) => tileElement.dataset.tileId ?? "")
          .find((tileId): boolean => !leadIds.has(tileId)) ?? null;
    if (leadIds.has(draggedTileId)) {
      return {
        kind: "slot",
        group: groupId,
        before: findNextTileId(items.indexOf(dropTileElement) + 1),
      };
    }
    let bounds = dropTileElement.getBoundingClientRect(),
      insertBefore: boolean =
        dropTileElement.dataset.tileAxis === "y"
          ? clientY < bounds.top + bounds.height / 2
          : clientX < bounds.left + bounds.width / 2;
    return {
      kind: "slot",
      group: groupId,
      before: insertBefore ? draggedTileId : findNextTileId(items.indexOf(dropTileElement) + 1),
    };
  }
  if (targetElement.closest<HTMLElement>("[data-drop-slot]") !== null) {
    return allowNewGroup;
  }
  if (
    allowNewGroup !== null &&
    allowNewGroup.kind !== "new" &&
    allowNewGroup.group === groupId
  ) {
    return allowNewGroup;
  }
  return {
    kind: "group",
    group: groupId,
  };
}
function assetDragScrollDelta(
  clientY: number,
  top: number,
  bottom: number,
): number {
  if (clientY < top + ASSET_DRAG_SCROLL_EDGE_PX) {
    return -Math.ceil(
      ASSET_DRAG_MAX_SCROLL_STEP_PX *
        Math.min(
          1,
          (top + ASSET_DRAG_SCROLL_EDGE_PX - clientY) /
            ASSET_DRAG_SCROLL_EDGE_PX,
        ),
    );
  }
  if (clientY > bottom - ASSET_DRAG_SCROLL_EDGE_PX) {
    return Math.ceil(
      ASSET_DRAG_MAX_SCROLL_STEP_PX *
        Math.min(
          1,
          (clientY - (bottom - ASSET_DRAG_SCROLL_EDGE_PX)) /
            ASSET_DRAG_SCROLL_EDGE_PX,
        ),
    );
  }
  return 0;
}
function useAssetDrag(
  dragOptions: Editor.AssetDragOptions,
): Editor.AssetDragController {
  let optionsRef = reactAssetDrag.useRef(dragOptions);
  optionsRef.current = dragOptions;
  let [drag, setDrag] = reactAssetDrag.useState<Editor.AssetDragView | null>(
      null,
    ),
    dragRef = reactAssetDrag.useRef<Editor.AssetDragView | null>(null),
    setDragView = (updateDrag: Editor.AssetDragView | null): void => {
      dragRef.current = updateDrag;
      setDrag(updateDrag);
    },
    pointerSessionRef = reactAssetDrag.useRef<Editor.AssetPointerSession | null>(null),
    pointerPositionRef = reactAssetDrag.useRef({
      x: 0,
      y: 0,
    }),
    dragGhostRef = reactAssetDrag.useRef<HTMLElement | null>(null),
    justDroppedRef = reactAssetDrag.useRef(false),
    scrollAnimationFrameRef = reactAssetDrag.useRef(0),
    listenersRef = reactAssetDrag.useRef<Editor.AssetDragListeners | null>(null),
    updateGhostPosition = (): void => {
      let current = dragGhostRef.current;
      if (current !== null) {
        current.style.transform =
          "translate3d(" +
          String(pointerPositionRef.current.x) +
          "px," +
          String(pointerPositionRef.current.y) +
          "px,0)";
      }
    },
    updateDropTarget = (): void => {
      let current = dragRef.current;
      if (current === null || typeof document === "undefined") {
        return;
      }
      let dropTarget = assetDropTargetAtPoint(
        document,
        pointerPositionRef.current.x,
        pointerPositionRef.current.y,
        new Set(current.ids),
        current.target,
      );
      if (!assetDropTargetsEqual(dropTarget, current.target)) {
        setDragView({
          ...current,
          target: dropTarget,
        });
      }
    },
    stopAutoScroll = (): void => {
      if (scrollAnimationFrameRef.current !== 0) {
        cancelAnimationFrame(scrollAnimationFrameRef.current);
      }
      scrollAnimationFrameRef.current = 0;
    },
    autoScroll = (): void => {
      scrollAnimationFrameRef.current = 0;
      let current = optionsRef.current.scroller.current;
      if (dragRef.current === null || current === null) {
        return;
      }
      let bounds = current.getBoundingClientRect(),
        scrollDelta = assetDragScrollDelta(
          pointerPositionRef.current.y,
          bounds.top,
          bounds.bottom,
        );
      if (scrollDelta !== 0) {
        current.scrollTop += scrollDelta;
        updateDropTarget();
      }
      scrollAnimationFrameRef.current = requestAnimationFrame(autoScroll);
    },
    removeListeners = (): void => {
      let current = listenersRef.current;
      listenersRef.current = null;
      if (current === null) {
        return;
      }
      window.removeEventListener("pointermove", current.move);
      window.removeEventListener("pointerup", current.up);
      window.removeEventListener("pointercancel", current.cancel);
      window.removeEventListener("blur", current.cancel);
      window.removeEventListener("keydown", current.key, true);
    },
    cancelDrag = (): void => {
      pointerSessionRef.current = null;
      removeListeners();
      stopAutoScroll();
      optionsRef.current.scroller.current?.removeAttribute("data-dragging");
      setDragView(null);
    },
    markJustDropped = (): void => {
      justDroppedRef.current = true;
      let resetJustDropped = (): void => {
        window.removeEventListener("pointerup", resetJustDropped, true);
        window.removeEventListener("pointercancel", resetJustDropped, true);
        setTimeout(() => (justDroppedRef.current = false), 0);
      };
      window.addEventListener("pointerup", resetJustDropped, true);
      window.addEventListener("pointercancel", resetJustDropped, true);
    },
    handlePointerMove = (event: PointerEvent) => {
      let current = pointerSessionRef.current;
      if (current === null || current.pointerId !== event.pointerId) {
        return;
      }
      if (event.pointerType === "mouse" && event.buttons === 0) {
        return cancelDrag();
      }
      if (
        !current.moved &&
        Math.hypot(event.clientX - current.sx, event.clientY - current.sy) <
          ASSET_DRAG_START_DISTANCE_PX
      ) {
        return;
      }
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      if (!current.moved) {
        current.moved = true;
        optionsRef.current.scroller.current?.setAttribute(
          "data-dragging",
          "",
        );
        setDragView({
          ids: current.ids,
          lead: current.id,
          grab: current.grab,
          target:
            typeof document === "undefined"
              ? null
              : assetDropTargetAtPoint(
                  document,
                  event.clientX,
                  event.clientY,
                  new Set(current.ids),
                  null,
                ),
        });
        if (
          scrollAnimationFrameRef.current === 0 &&
          typeof requestAnimationFrame === "function"
        ) {
          scrollAnimationFrameRef.current = requestAnimationFrame(autoScroll);
        }
      } else {
        updateDropTarget();
      }
      updateGhostPosition();
    },
    handlePointerUp = (event: PointerEvent): void => {
      let current = pointerSessionRef.current;
      if (current === null || current.pointerId !== event.pointerId) {
        return;
      }
      let activeDrag = dragRef.current,
        moved = current.moved;
      cancelDrag();
      if (!moved || activeDrag === null) {
        return;
      }
      justDroppedRef.current = true;
      setTimeout(() => (justDroppedRef.current = false), 0);
      if (activeDrag.target !== null) {
        optionsRef.current.onDrop(activeDrag.ids, activeDrag.target);
      }
    },
    handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "Escape" || pointerSessionRef.current === null) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      let moved = pointerSessionRef.current.moved;
      cancelDrag();
      if (moved) {
        markJustDropped();
      }
    };
  reactAssetDrag.useEffect(
    () => (): void => {
      removeListeners();
      stopAutoScroll();
    },
    [],
  );
  let handlePointerDown = reactAssetDrag.useCallback(
    (event: React.PointerEvent<HTMLElement>, pointerAssetId: string): void => {
      let current = optionsRef.current;
      if (event.button !== 0 || pointerSessionRef.current !== null) {
        return;
      }
      if (
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.pointerType === "touch"
      ) {
        return;
      }
      if (!current.selected.includes(pointerAssetId)) {
        current.onGrab(pointerAssetId);
      }
      if (!current.enabled) {
        return;
      }
      let bounds = event.currentTarget.getBoundingClientRect(),
        selectedAssetIds = current.selected.includes(pointerAssetId)
          ? current.selected
          : [pointerAssetId],
        selectedIds =
          selectedAssetIds.length > 1
            ? current.order.filter((assetId) => selectedAssetIds.includes(assetId))
            : [pointerAssetId];
      pointerSessionRef.current = {
        id: pointerAssetId,
        ids: selectedIds,
        pointerId: event.pointerId,
        sx: event.clientX,
        sy: event.clientY,
        moved: false,
        grab: {
          dx: event.clientX - bounds.left,
          dy: event.clientY - bounds.top,
          w: bounds.width,
          h: bounds.height,
        },
      };
      pointerPositionRef.current = {
        x: event.clientX,
        y: event.clientY,
      };
      let state = {
        move: handlePointerMove,
        up: handlePointerUp,
        cancel: cancelDrag,
        key: handleKeyDown,
      };
      listenersRef.current = state;
      window.addEventListener("pointermove", state.move);
      window.addEventListener("pointerup", state.up);
      window.addEventListener("pointercancel", state.cancel);
      window.addEventListener("blur", state.cancel);
      window.addEventListener("keydown", state.key, true);
    },
    [],
  );
  reactAssetDrag.useEffect((): void => {
    if (drag !== null) {
      updateGhostPosition();
    }
  });
  return {
    drag: drag,
    onPointerDown: handlePointerDown,
    ghostRef: dragGhostRef,
    justDropped: () => justDroppedRef.current,
    cancel: cancelDrag,
  };
}
export {
  ASSET_DRAG_MAX_SCROLL_STEP_PX,
  ASSET_DRAG_SCROLL_EDGE_PX,
  ASSET_DRAG_START_DISTANCE_PX,
  assetDragScrollDelta,
  assetDropTargetAtPoint,
  assetDropTargetsEqual,
  reactAssetDrag,
  useAssetDrag,
};
export function installEditorAssetDrag(): () => void {
  return () => {
    reactAssetDrag = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    ASSET_DRAG_START_DISTANCE_PX = 5;
    ASSET_DRAG_SCROLL_EDGE_PX = 56;
    ASSET_DRAG_MAX_SCROLL_STEP_PX = 18;
  };
}
