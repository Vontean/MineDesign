import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { useAssetDrag } from "./asset-drag";
import { hasSelectionModifier, reactAssetInteractions, useAssetSelection } from "./asset-selection";

var ASSET_LONG_PRESS_MS: number;
var ASSET_LONG_PRESS_MOVE_TOLERANCE_PX: number;
function findAssetTile(
  root: HTMLElement | null,
  id: string,
): HTMLElement | null {
  for (let value of root?.querySelectorAll<HTMLElement>("[data-tile-id]") ??
    []) {
    if (value instanceof HTMLElement && value.dataset.tileId === id) {
      return value;
    }
  }
  return null;
}
function assetKeyboardDestination(
  key: string,
  id: string,
  order: string[],
  columns: (id: string) => DOMRect | null,
): string | null {
  let index = order.indexOf(id);
  if (index < 0) {
    return order[0] ?? null;
  }
  if (key === "ArrowLeft") {
    return order[Math.max(0, index - 1)] ?? null;
  }
  if (key === "ArrowRight") {
    return order[Math.min(order.length - 1, index + 1)] ?? null;
  }
  let value: boolean = key === "ArrowUp",
    neighborId = order[value ? index - 1 : index + 1];
  if (neighborId !== undefined && columns(neighborId) === null) {
    return neighborId;
  }
  let currentBounds = columns(id);
  if (currentBounds === null) {
    return id;
  }
  let currentCenterX = currentBounds.left + currentBounds.width / 2,
    bestCandidate: {
      id: string;
      dy: number;
      dx: number;
    } | null = null;
  for (let candidateId of order) {
    if (candidateId === id) {
      continue;
    }
    let candidateBounds = columns(candidateId);
    if (candidateBounds === null) {
      continue;
    }
    let verticalDistance = value
      ? currentBounds.top - (candidateBounds.top + candidateBounds.height)
      : candidateBounds.top - (currentBounds.top + currentBounds.height);
    if (verticalDistance < -candidateBounds.height / 2) {
      continue;
    }
    let horizontalDistance: number = Math.abs(candidateBounds.left + candidateBounds.width / 2 - currentCenterX);
    if (
      bestCandidate === null ||
      verticalDistance < bestCandidate.dy - 1 ||
      (Math.abs(verticalDistance - bestCandidate.dy) <= 1 && horizontalDistance < bestCandidate.dx)
    ) {
      bestCandidate = {
        id: candidateId,
        dy: verticalDistance,
        dx: horizontalDistance,
      };
    }
  }
  return bestCandidate?.id ?? id;
}
function useAssetGridInteractions(
  gridOptions: Editor.AssetGridOptions,
): Editor.AssetGridInteractions {
  let {
      order: value,
      editable: editable,
      coarse: coarsePointer,
      scroller: scroller,
    } = gridOptions,
    ref = (reactAssetInteractions as typeof React).useRef(gridOptions);
  ref.current = gridOptions;
  let selection = useAssetSelection(value),
    memo = (reactAssetInteractions as typeof React).useMemo(
      () => new Set<string>(selection.selected),
      [selection.selected],
    ),
    [menu, setMenu] = (
      reactAssetInteractions as typeof React
    ).useState<Editor.AssetGridMenu | null>(null),
    callback = (reactAssetInteractions as typeof React).useCallback(
      () => setMenu(null),
      [],
    ),
    openContextMenu = (
      openedAssetId: string,
      menuOptions: {
        x: number;
        y: number;
      },
      sourceContext: "tap" | "point",
    ): void => {
      let selectedAssetIds = selection.selected.includes(openedAssetId)
        ? value.filter((assetId) => selection.has(assetId))
        : [openedAssetId];
      if (!selection.selected.includes(openedAssetId)) {
        selection.only(openedAssetId);
      }
      setMenu({
        ...menuOptions,
        paths: selectedAssetIds,
        anchor: sourceContext,
      });
    },
    dragController = useAssetDrag({
      enabled: editable && !coarsePointer,
      order: value,
      selected: selection.selected,
      onGrab: selection.only,
      scroller: scroller,
      onDrop: (assetIds: string[], dropTarget: Model.AssetDropTarget) =>
        ref.current.onDrop(assetIds, dropTarget),
    }),
    pointerSessionRef = (reactAssetInteractions as typeof React).useRef<
      import("../contracts/token-editors").RowTouchSession | null
    >(null),
    clearPointerSession = () => {
      let current = pointerSessionRef.current;
      if (current === null) {
        return false;
      }
      window.clearTimeout(current.timer);
      pointerSessionRef.current = null;
      return current.fired;
    },
    justDroppedRef = (reactAssetInteractions as typeof React).useRef(false),
    handlePointerDown = (reactAssetInteractions as typeof React).useCallback(
      (event: React.PointerEvent<HTMLElement>, assetId: string): void => {
        focusTargetRef.current = null;
        if (event.pointerType === "touch" && event.button === 0) {
          clearPointerSession();
          let state = {
            x: event.clientX,
            y: event.clientY,
          };
          pointerSessionRef.current = {
            x: state.x,
            y: state.y,
            fired: false,
            timer: window.setTimeout((): void => {
              if (pointerSessionRef.current !== null) {
                pointerSessionRef.current.fired = true;
              }
              openContextMenu(assetId, state, "tap");
            }, ASSET_LONG_PRESS_MS),
          };
        }
        dragController.onPointerDown(event, assetId);
      },
      [dragController.onPointerDown, value, selection],
    );
  (reactAssetInteractions as typeof React).useEffect(() => {
    let handlePointerMove = (event: PointerEvent): void => {
        let current = pointerSessionRef.current;
        if (
          current !== null &&
          Math.hypot(event.clientX - current.x, event.clientY - current.y) >
            ASSET_LONG_PRESS_MOVE_TOLERANCE_PX
        ) {
          clearPointerSession();
        }
      },
      handlePointerEnd = (): void => {
        if (clearPointerSession()) {
          justDroppedRef.current = true;
          setTimeout(() => (justDroppedRef.current = false), 0);
        }
      };
    window.addEventListener("pointermove", handlePointerMove, true);
    window.addEventListener("pointerup", handlePointerEnd, true);
    window.addEventListener("pointercancel", handlePointerEnd, true);
    return (): void => {
      window.removeEventListener("pointermove", handlePointerMove, true);
      window.removeEventListener("pointerup", handlePointerEnd, true);
      window.removeEventListener("pointercancel", handlePointerEnd, true);
    };
  }, []);
  let handleClick = (
      reactAssetInteractions as typeof React
    ).useCallback(
      (event: React.MouseEvent<HTMLElement>, assetId: string): void => {
        if (dragController.justDropped() || justDroppedRef.current) {
          return;
        }
        if (
          !ref.current.editable &&
          !event.shiftKey &&
          !hasSelectionModifier(event)
        ) {
          selection.only(assetId);
          ref.current.onOpen(assetId);
          return;
        }
        selection.click(assetId, event);
      },
      [dragController, selection],
    ),
    handleDoubleClick = (reactAssetInteractions as typeof React).useCallback(
      (assetId: string) => ref.current.onOpen(assetId),
      [],
    ),
    handleContextMenu = (reactAssetInteractions as typeof React).useCallback(
      (event: React.MouseEvent<HTMLElement>, assetId: string): void => {
        event.preventDefault();
        if (pointerSessionRef.current?.fired === true) {
          return;
        }
        clearPointerSession();
        openContextMenu(
          assetId,
          {
            x: event.clientX,
            y: event.clientY,
          },
          "point",
        );
      },
      [value, selection],
    ),
    focusTile = (element: HTMLElement): void => {
      element.focus({
        preventScroll: true,
      });
      element.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    },
    focusTargetRef = (reactAssetInteractions as typeof React).useRef<
      string | null
    >(null);
  (reactAssetInteractions as typeof React).useEffect((): void => {
    if (focusTargetRef.current === null) {
      return;
    }
    let targetTile = findAssetTile(scroller.current, focusTargetRef.current);
    if (targetTile === null) {
      return;
    }
    focusTargetRef.current = null;
    focusTile(targetTile);
  });
  let setFocusTarget = (
      reactAssetInteractions as typeof React
    ).useCallback((assetId: string | null): void => {
      focusTargetRef.current = assetId;
    }, []),
    handleKeyDown = (reactAssetInteractions as typeof React).useCallback(
      (event: React.KeyboardEvent<HTMLElement>, keyboardAssetId: string): void => {
        if (event.defaultPrevented || event.target !== event.currentTarget) {
          return;
        }
        let current = ref.current,
          hasCommandModifier = event.metaKey || event.ctrlKey;
        if (event.key === "Enter" && !hasCommandModifier) {
          event.preventDefault();
          current.onOpen(keyboardAssetId);
        } else if (event.key === " ") {
          event.preventDefault();
          selection.click(keyboardAssetId, {
            shiftKey: false,
            metaKey: true,
            ctrlKey: false,
            altKey: false,
          });
        } else if (event.key === "Escape") {
          if (selection.selected.length === 0) {
            return;
          }
          event.preventDefault();
          selection.clear();
        } else if (
          hasCommandModifier &&
          !event.shiftKey &&
          !event.altKey &&
          (event.key === "a" || event.key === "A")
        ) {
          event.preventDefault();
          selection.all();
        } else if (
          (event.key === "Delete" || event.key === "Backspace") &&
          !hasCommandModifier &&
          !event.altKey
        ) {
          event.preventDefault();
          if (!current.editable) {
            return;
          }
          current.onRemove(
            selection.selected.includes(keyboardAssetId)
              ? current.order.filter((assetId) => selection.has(assetId))
              : [keyboardAssetId],
          );
        } else if (
          event.key === "ContextMenu" ||
          (event.key === "F10" && event.shiftKey)
        ) {
          event.preventDefault();
          let bounds = event.currentTarget.getBoundingClientRect();
          openContextMenu(
            keyboardAssetId,
            {
              x: bounds.left + Math.min(40, bounds.width / 2),
              y: bounds.top + Math.min(24, bounds.height / 2),
            },
            "point",
          );
        } else if (
          event.key.startsWith("Arrow") &&
          !hasCommandModifier &&
          !event.altKey
        ) {
          event.preventDefault();
          let entries = new Map<string, HTMLElement>();
          for (let tileElement of current.scroller.current?.querySelectorAll<HTMLElement>(
            "[data-tile-id]",
          ) ?? []) {
            entries.set(tileElement.dataset.tileId ?? "", tileElement);
          }
          let visibleIds = current.order.filter((assetId) => {
              let tileElement = entries.get(assetId);
              return (
                tileElement === undefined || tileElement.getClientRects().length > 0
              );
            }),
            keyboardTarget = assetKeyboardDestination(
              event.key,
              keyboardAssetId,
              visibleIds,
              (assetId) => entries.get(assetId)?.getBoundingClientRect() ?? null,
            );
          if (keyboardTarget === null) {
            return;
          }
          if (event.shiftKey) {
            selection.extend(keyboardTarget);
          } else {
            selection.only(keyboardTarget);
          }
          let entry = entries.get(keyboardTarget);
          if (entry !== undefined) {
            focusTile(entry);
          } else {
            setFocusTarget(keyboardTarget);
          }
        }
      },
      [selection],
    ),
    selectionRef = (reactAssetInteractions as typeof React).useRef(selection);
  selectionRef.current = selection;
  (reactAssetInteractions as typeof React).useEffect(() => {
    let current = scroller.current;
    if (current === null) {
      return;
    }
    let handleNativePointerDown = (event: PointerEvent): void => {
      if (event.button !== 0 || selectionRef.current.selected.length === 0) {
        return;
      }
      let target = event.target;
      if (
        !(target instanceof Element) ||
        target.closest(
          '[data-tile-id],[data-drop-slot],button,input,textarea,select,label,a,[role="button"],[role="radio"],[role="switch"],[role="checkbox"],[role="slider"],[role="menu"],[role="menuitem"],[role="dialog"],[contenteditable="true"],[data-mc-chrome]',
        ) !== null
      ) {
        return;
      }
      selectionRef.current.clear();
    };
    current.addEventListener("pointerdown", handleNativePointerDown);
    return () => current.removeEventListener("pointerdown", handleNativePointerDown);
  }, [scroller]);
  let focusId =
    selection.focus !== null && value.includes(selection.focus)
      ? selection.focus
      : (selection.selected.at(-1) ?? null);
  return {
    selection: selection,
    selected: memo,
    focusId: focusId,
    editable: editable,
    coarse: coarsePointer,
    drag: dragController.drag,
    ghostRef: dragController.ghostRef,
    menu: menu,
    closeMenu: callback,
    focus: setFocusTarget,
    remove: (assetIds: string[]) => ref.current.onRemove(assetIds),
    onPointerDown: handlePointerDown,
    onClick: handleClick,
    onDoubleClick: handleDoubleClick,
    onContextMenu: handleContextMenu,
    onKeyDown: handleKeyDown,
  };
}
export {
  ASSET_LONG_PRESS_MOVE_TOLERANCE_PX,
  ASSET_LONG_PRESS_MS,
  assetKeyboardDestination,
  findAssetTile,
  useAssetGridInteractions,
};
export function installEditorAssetInteractions(): () => void {
  return () => {
    ASSET_LONG_PRESS_MS = 500;
    ASSET_LONG_PRESS_MOVE_TOLERANCE_PX = 10;
  };
}
