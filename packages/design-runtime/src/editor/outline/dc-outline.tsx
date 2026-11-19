import { uiNodeLabel } from '@minedesign/contracts/ui-value';
import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { Badge } from "../../cds/components/badge";
import { Icon } from "../../cds/components/icon";
import { ComponentsSelectionPointsComponent } from "../../cds/components/selection-points";
import { TextInput } from "../../cds/components/text-input";
import { cn } from "../../cds/theme/class-names";
import { DeferredTooltipProvider } from "../../cds/tooltip/deferred-provider";
import { EditorMenu } from "../chrome/context-menu";
import { hasBlockingOverlay } from "../chrome/overlay-state";
import { ChromeScrollbarLabel, FloatingScrollbar } from "../chrome/scrollbar";
import { ChromeToolIconsColumnRowTextConfig, ChromeToolIconsNoteTitleRectConfig } from "../chrome/tool-icons";
import { OutlineValue } from "../inspector/modes";
import { isContextMenuShortcut, reactKeyboardEditActions } from "../keyboard/edit-actions";
import { DcKeyBrowsedAttribute } from "../keyboard/find";
import { CanTReadThisArtboardSFileAskMessage, OutlineElementGlyph, OutlineGlyphsClassNames_2, OutlineGlyphsClassNames_3, OutlineGlyphsClassNames_4, OutlineGlyphsColorConfig, OutlineGlyphsConstant, OutlineGlyphsConstant_2 as layersListMaxSize, OutlineGlyphsConstant_3 as layersListDefaultSize, OutlineGlyphsConstant_4 as treeRowBaseIndent, OutlineGlyphsConstant_5 as treeIndentPerLevel, OutlineGlyphsConstant_6 as treeToggleColumnWidth, OutlineGlyphsLabel, OutlineGlyphsNativeEvent, OutlineGlyphsResolvedValue, OutlineGlyphsResolvedValue_2 as selectedRowClasses, OutlineGlyphsResolvedValue_3 as selectedRowSecondaryClasses, OutlineGlyphsScForScIfDcImportSet, OutlineGlyphsSubscribers, OutlineIconGlyph } from "./glyphs";
import { OutlineRenameInput, OutlineRenameLimit } from "./rename";
import { flattenOutlineRows, outlineAncestorMap, OutlineTreeHandler, OutlineTreeHandler_2, OutlineTreeHandler_3, scrollOutlineRowIntoView } from "./tree";
import { CdsIsland, initializePlatformCdsIsland } from "../../platform/cds-island";

var OutlineDcOutlineConstant: Dynamic;
var OutlineDcOutlineLongSuppressDelay: Dynamic;
var OutlineDcOutlineHandler: Dynamic;
var OutlineDcOutlineTarget: Dynamic;
var nativeContextMenuTimeout: Dynamic;
var OutlineDcOutlineRemoveEventListener: Dynamic;
function DcOutline({
  nodes: nodes,
  selectedTids: selectedTids,
  onSelect: onSelect,
  onHover: onHover,
  onToggleHidden: onToggleHidden,
  onMove: onMove,
  onRename: onRename,
  closeRenameOn: closeRenameOn,
  contextActions: contextActions,
  directiveState: directiveState,
  fill: fill,
  artboards: artboards,
}: Dynamic): Dynamic {
  useUiLocale();
  let [listHeight, setListHeight]: Dynamic = (0,
    reactKeyboardEditActions.useState)(
      layersListDefaultSize,
    ),
    idPrefix: Dynamic = (0, reactKeyboardEditActions.useId)(),
    [expandedTids, setExpandedTids]: Dynamic = (0,
    reactKeyboardEditActions.useState)((): Dynamic => new Set()),
    getExpanded: Dynamic = (artboardKey?: Dynamic): Dynamic =>
      artboards && artboardKey != null
        ? (artboards.expanded[artboardKey] ?? OutlineGlyphsSubscribers)
        : expandedTids,
    updateExpanded: Dynamic = (artboardKey?: Dynamic, update?: Dynamic): Dynamic => {
      if (artboards && artboardKey != null) {
        let currentExpanded: Dynamic =
            artboards.expanded[artboardKey] ?? OutlineGlyphsSubscribers,
          nextExpanded: Dynamic = update(currentExpanded);
        nextExpanded !== currentExpanded && artboards.onExpandedChange(artboardKey, nextExpanded);
      } else setExpandedTids((prevExpanded?: Dynamic): Dynamic => update(prevExpanded));
    },
    focusedArtboard: Dynamic = artboards ? artboards.focused : null,
    focusedExpanded: Dynamic = getExpanded(focusedArtboard),
    ancestorMap: Dynamic = (0, reactKeyboardEditActions.useMemo)(
      (): Dynamic => outlineAncestorMap(nodes),
      [nodes],
    ),
    [renamingTid, setRenamingTid]: Dynamic = (0,
    reactKeyboardEditActions.useState)(null),
    [renameDraft, setRenameDraft]: Dynamic = (0,
    reactKeyboardEditActions.useState)(""),
    [contextMenu, setContextMenu]: Dynamic = (0,
    reactKeyboardEditActions.useState)(null),
    [draggingTid, setDraggingTid]: Dynamic = (0,
    reactKeyboardEditActions.useState)(null),
    [lastCloseRenameOn, setLastCloseRenameOn]: Dynamic = (0,
    reactKeyboardEditActions.useState)(closeRenameOn);
  closeRenameOn !== lastCloseRenameOn &&
    (setLastCloseRenameOn(closeRenameOn), setRenamingTid(null), setDraggingTid(null));
  let [dropTarget, setDropTarget]: Dynamic = (0,
    reactKeyboardEditActions.useState)(null),
    artboardCursor: Dynamic = artboards?.cursor,
    [cursorKey, setCursorKey]: Dynamic = (0,
    reactKeyboardEditActions.useState)(
      (): Dynamic => artboardCursor?.key ?? null,
    ),
    setCursor: Dynamic = (key?: Dynamic): Dynamic => {
      artboardCursor && (artboardCursor.key = key);
      setCursorKey(key);
    },
    refocusStampRef: Dynamic = (0, reactKeyboardEditActions.useRef)(0),
    selectionSignature: Dynamic =
      selectedTids.length > 0
        ? `${focusedArtboard ?? ""}:${selectedTids.join(",")}`
        : "",
    [fallbackRevealed]: Dynamic = (0, reactKeyboardEditActions.useState)(
      (): Dynamic => ({
        path: "",
        row: "",
      }),
    ),
    revealed: Dynamic = artboards?.revealed ?? fallbackRevealed,
    lastRevealedRef: Dynamic = (0, reactKeyboardEditActions.useRef)(
      artboards ? artboards.revealed.path : selectionSignature,
    );
  (0, reactKeyboardEditActions.useEffect)((): Dynamic => {
    if (selectedTids.length === 0) {
      lastRevealedRef.current = "";
      revealed.path = "";
      return;
    }
    let signature: Dynamic = selectionSignature;
    signature !== lastRevealedRef.current &&
      artboards &&
      !artboards.open.has(artboards.focused) &&
      artboards.onToggleOpen(artboards.focused, true);
    lastRevealedRef.current = signature;
    revealed.path = signature;
    updateExpanded(focusedArtboard, (expanded?: Dynamic): Dynamic => {
      let values: Dynamic = new Set(expanded);
      for (let selectedTid of selectedTids as Dynamic)
        for (let ancestorTid of (ancestorMap.get(selectedTid) ?? []) as Dynamic)
          values.add(ancestorTid);
      return values.size === expanded.size ? expanded : values;
    });
  }, [selectedTids, ancestorMap]);
  let treeRef: Dynamic = (0, reactKeyboardEditActions.useRef)(null),
    findRowElement: Dynamic = (rowKey?: Dynamic): Dynamic => {
      let rowElements: Dynamic =
        treeRef.current?.querySelectorAll("[data-row-key]");
      for (let rowElement of (rowElements ?? []) as Dynamic)
        if (rowElement.dataset.rowKey === rowKey) return rowElement;
      return null;
    },
    scrollState: Dynamic = artboards?.scroll,
    isRestoringScrollRef: Dynamic = (0, reactKeyboardEditActions.useRef)(false),
    needsScrollRestoreRef: Dynamic = (0, reactKeyboardEditActions.useRef)(true);
  (0, reactKeyboardEditActions.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = treeRef.current;
    !current ||
      !scrollState ||
      !needsScrollRestoreRef.current ||
      ((isRestoringScrollRef.current = true),
      (current.scrollTop = scrollState.current),
      Math.abs(current.scrollTop - scrollState.current) <= 0.5 &&
        (needsScrollRestoreRef.current = false),
      requestAnimationFrame((): Dynamic => {
        isRestoringScrollRef.current = false;
      }));
  }, [scrollState, nodes, artboards?.trees, artboards?.open]);
  let revealRow: Dynamic = (rowElement?: Dynamic): Dynamic => {
      scrollOutlineRowIntoView(treeRef.current, rowElement, true) &&
        (needsScrollRestoreRef.current = false);
    },
    revealSignature: Dynamic =
      selectionSignature +
      "|" +
      [...(artboards?.selectedObjects ?? [])].sort().join(",") +
      "|" +
      [...(artboards?.selected ?? [])].sort().join(","),
    justPressedRef: Dynamic = (0, reactKeyboardEditActions.useRef)(false),
    blurredTargetRef: Dynamic = (0, reactKeyboardEditActions.useRef)(null);
  (0, reactKeyboardEditActions.useEffect)((): Dynamic => {
    let clearBlurredTarget: Dynamic = (): Dynamic => {
      setTimeout((): Dynamic => (blurredTargetRef.current = null), 0);
    };
    (window as Dynamic).addEventListener("focus", clearBlurredTarget);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("focus", clearBlurredTarget);
  }, []);
  let setKeyboardBrowsed: Dynamic = (isBrowsed?: Dynamic): Dynamic => {
      let current: Dynamic = treeRef.current;
      current &&
        (isBrowsed
          ? current.setAttribute(DcKeyBrowsedAttribute, "")
          : current.removeAttribute(DcKeyBrowsedAttribute));
    },
    handlePointerDown: Dynamic = (): Dynamic => {
      blurredTargetRef.current = null;
      justPressedRef.current = true;
      setTimeout((): Dynamic => (justPressedRef.current = false), 0);
    },
    revealNewSelection: Dynamic = (
      selectedIds?: Dynamic,
      previousIdsRef?: Dynamic,
      testIdPrefix?: Dynamic,
    ): Dynamic => {
      let current: Dynamic = previousIdsRef.current;
      previousIdsRef.current = selectedIds ?? new Set();
      let addedId: Dynamic = selectedIds
        ? [...selectedIds].find((id?: Dynamic): Dynamic => !current.has(id))
        : undefined;
      if (addedId == null) return;
      revealed.row = revealSignature;
      let frameId: Dynamic = requestAnimationFrame((): Dynamic => {
        let rowElement: Dynamic = treeRef.current?.querySelector(
          `[data-testid="${testIdPrefix}-${CSS.escape(addedId)}"]`,
        );
        rowElement && revealRow(rowElement);
      });
      return (): Dynamic => cancelAnimationFrame(frameId);
    },
    selectedArtboards: Dynamic = artboards?.selected,
    previousArtboardsRef: Dynamic = (0, reactKeyboardEditActions.useRef)(
      new Set(),
    );
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => revealNewSelection(selectedArtboards, previousArtboardsRef, "dc-outline-artboard"),
    [selectedArtboards],
  );
  let selectedObjects: Dynamic = artboards?.selectedObjects,
    previousObjectsRef: Dynamic = (0, reactKeyboardEditActions.useRef)(
      new Set(),
    );
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => revealNewSelection(selectedObjects, previousObjectsRef, "dc-outline-object"),
    [selectedObjects],
  );
  (0, reactKeyboardEditActions.useEffect)((): Dynamic => {
    if (selectedTids.length === 0) {
      revealed.row = "";
      return;
    }
    if (revealed.row === revealSignature) return;
    let firstTid: Dynamic = selectedTids[0];
    if (
      !(ancestorMap.get(firstTid) ?? []).every(
        (ancestorTid?: Dynamic): Dynamic => focusedExpanded.has(ancestorTid),
      )
    )
      return;
    let frameId: Dynamic = requestAnimationFrame((): Dynamic => {
      let rowElement: Dynamic = treeRef.current?.querySelector(
        `[data-testid="dc-outline-${firstTid}"]`,
      );
      rowElement && ((revealed.row = revealSignature), revealRow(rowElement));
    });
    return (): Dynamic => cancelAnimationFrame(frameId);
  }, [selectedTids, revealSignature, focusedExpanded, ancestorMap, artboards?.open]);
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => (): Dynamic => {
      revealed.row = "";
    },
    [revealed],
  );
  let listHeightRef: Dynamic = (0, reactKeyboardEditActions.useRef)(listHeight),
    resizeList: Dynamic = (delta?: Dynamic): Dynamic =>
      setListHeight(
        Math.min(
          layersListMaxSize,
          Math.max(OutlineGlyphsConstant, listHeightRef.current + delta),
        ),
      ),
    visibleRows: Dynamic = flattenOutlineRows(
      nodes,
      artboards,
      getExpanded,
    ),
    tabStopKey: Dynamic = ((): Dynamic => {
      let values: Dynamic = new Set(
        visibleRows.map((row?: Dynamic): Dynamic => row.key),
      );
      if (cursorKey != null && values.has(cursorKey)) return cursorKey;
      let selectedKey: Dynamic =
        selectedTids.length > 0
          ? OutlineTreeHandler_3(focusedArtboard, selectedTids[0])
          : null;
      if (selectedKey != null && values.has(selectedKey)) return selectedKey;
      let selectedObject: Dynamic = artboards?.objects.find(
        (objectItem?: Dynamic): Dynamic => artboards.selectedObjects.has(objectItem.id),
      );
      if (selectedObject) return OutlineTreeHandler_2(selectedObject.id);
      let selectedRow: Dynamic = artboards?.rows.find(
        (artboardRow?: Dynamic): Dynamic => artboards.selected.has(artboardRow.file),
      );
      return selectedRow
        ? OutlineTreeHandler(selectedRow.file)
        : (visibleRows[0]?.key ?? null);
    })(),
    focusRow: Dynamic = (key?: Dynamic): Dynamic => {
      setCursor(key);
      let rowElement: Dynamic = findRowElement(key);
      rowElement &&
        (rowElement.focus({
          preventScroll: true,
        }),
        scrollOutlineRowIntoView(treeRef.current, rowElement));
    },
    setRowOpen: Dynamic = (row?: Dynamic, isOpen?: Dynamic): Dynamic => {
      if (row.tid == null) {
        row.file != null && artboards?.onToggleOpen(row.file, isOpen);
        return;
      }
      let tid: Dynamic = row.tid;
      updateExpanded(row.file, (expanded?: Dynamic): Dynamic => {
        if (expanded.has(tid) === isOpen) return expanded;
        let values: Dynamic = new Set(expanded);
        isOpen ? values.add(tid) : values.delete(tid);
        return values;
      });
    },
    activateRow: Dynamic = (row?: Dynamic, isMultiSelect?: Dynamic): Dynamic => {
      setCursor(row.key);
      if (row.object != null)
        return !artboards ||
          (!isMultiSelect && artboards.selectedObjects.has(row.object))
          ? false
          : (artboards.onSelectObject(row.object, isMultiSelect), true);
      if (artboards && isMultiSelect && row.tid == null && row.file != null) {
        artboards.onToggleSelected(row.file);
        return true;
      }
      if (
        artboards &&
        row.file != null &&
        row.file !== artboards.focused
      ) {
        let cursor: Dynamic = artboards.cursor,
          refocusStamp: Dynamic =
            (refocusStampRef.current =
            cursor.refocusAt =
              Date.now()),
          clearRefocus: Dynamic = (): Dynamic => {
            cursor.refocusAt === refocusStamp && (cursor.refocusAt = 0);
          };
        (document as Dynamic).addEventListener("pointerdown", clearRefocus, {
          capture: true,
          once: true,
        });
        (window as Dynamic).setTimeout(
          (): Dynamic =>
            (document as Dynamic).removeEventListener(
              "pointerdown",
              clearRefocus,
              {
                capture: true,
              },
            ),
          OutlineRenameLimit,
        );
        row.tid == null
          ? artboards.onFocus(row.file)
          : artboards.onSelectIn(row.file, row.tid);
        return true;
      }
      return row.tid == null
        ? artboards?.selected.has(row.file)
          ? false
          : (artboards?.onFocus(row.file), true)
        : !isMultiSelect && selectedTids.includes(row.tid)
          ? false
          : (onSelect(row.tid, isMultiSelect), true);
    },
    handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.altKey ||
        ((event.metaKey || event.ctrlKey) && event.key !== " ")
      )
        return;
      let target: Dynamic = event.target,
        ancestor: Dynamic = target.closest('[role="treeitem"]');
      if (!ancestor || !event.currentTarget.contains(ancestor)) return;
      let rowIndex: Dynamic = visibleRows.findIndex(
        (row?: Dynamic): Dynamic => row.key === ancestor.dataset.rowKey,
      );
      if (rowIndex < 0) return;
      let currentRow: Dynamic = visibleRows[rowIndex],
        isRowFocused: Dynamic = target === ancestor,
        lastIndex: Dynamic = visibleRows.length - 1;
      if (isContextMenuShortcut(event)) {
        event.preventDefault();
        !event.repeat &&
          contextMenu === null &&
          ancestor.dispatchEvent(
            new MouseEvent("contextmenu", {
              bubbles: true,
              cancelable: true,
            }),
          );
        return;
      }
      switch (event.key) {
        case "ArrowDown":
          focusRow(visibleRows[Math.min(rowIndex + 1, lastIndex)].key);
          break;
        case "ArrowUp":
          focusRow(visibleRows[Math.max(rowIndex - 1, 0)].key);
          break;
        case "Home":
          focusRow(visibleRows[0].key);
          break;
        case "End":
          focusRow(visibleRows[lastIndex].key);
          break;
        case "ArrowRight":
          currentRow.expandable && !currentRow.open
            ? setRowOpen(currentRow, true)
            : currentRow.open &&
              rowIndex < lastIndex &&
              focusRow(visibleRows[rowIndex + 1].key);
          break;
        case "ArrowLeft":
          currentRow.open
            ? setRowOpen(currentRow, false)
            : currentRow.parentKey != null && focusRow(currentRow.parentKey);
          break;
        case " ":
          if (
            !isRowFocused ||
            (!event.repeat &&
              !activateRow(
                currentRow,
                event.shiftKey || event.metaKey || event.ctrlKey,
              ))
          )
            return;
          break;
        case "Enter":
          if (
            !isRowFocused ||
            event.shiftKey ||
            (!event.repeat && !activateRow(currentRow, false))
          )
            return;
          break;
        default:
          return;
      }
      event.key !== " " && event.key !== "Enter" && setKeyboardBrowsed(true);
      event.preventDefault();
    };
  (0, reactKeyboardEditActions.useLayoutEffect)((): Dynamic => {
    if (
      !artboardCursor ||
      artboardCursor.refocusAt === 0 ||
      artboardCursor.refocusAt === refocusStampRef.current
    )
      return;
    let activeElement: Dynamic = (document as Dynamic).activeElement;
    if (
      Date.now() - artboardCursor.refocusAt > OutlineRenameLimit ||
      (activeElement != null &&
        activeElement !== (document as Dynamic).body &&
        activeElement.closest('[data-testid="dc-outline"]') == null)
    ) {
      artboardCursor.refocusAt = 0;
      return;
    }
    let rowElement: Dynamic =
      artboardCursor.key != null ? findRowElement(artboardCursor.key) : null;
    rowElement &&
      ((artboardCursor.refocusAt = 0),
      rowElement.focus({
        preventScroll: true,
      }),
      scrollOutlineRowIntoView(treeRef.current, rowElement));
  });
  let onHoverRef: Dynamic = (0, reactKeyboardEditActions.useRef)(
    onHover,
  );
  (0, reactKeyboardEditActions.useEffect)((): Dynamic => {
    onHoverRef.current = onHover;
  });
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => (): Dynamic => onHoverRef.current(null),
    [],
  );
  let lastFocusedRowRef: Dynamic = (0, reactKeyboardEditActions.useRef)(null);
  (0, reactKeyboardEditActions.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = lastFocusedRowRef.current,
      activeElement: Dynamic = (document as Dynamic).activeElement;
    if (
      current != null &&
      (activeElement == null ||
        activeElement === (document as Dynamic).body) &&
      visibleRows.length > 0 &&
      !visibleRows.some((row?: Dynamic): Dynamic => row.key === current.key)
    ) {
      let wasKeyBrowsed: Dynamic =
        treeRef.current?.hasAttribute(DcKeyBrowsedAttribute) === true;
      focusRow(visibleRows[Math.min(current.index, visibleRows.length - 1)].key);
      setKeyboardBrowsed(wasKeyBrowsed);
    }
    let focusedElement: Dynamic = (document as Dynamic).activeElement,
      focusedKey: Dynamic =
        focusedElement != null && treeRef.current?.contains(focusedElement)
          ? focusedElement
              .closest('[role="treeitem"]')
              ?.getAttribute("data-row-key")
          : null,
      focusedIndex: Dynamic =
        focusedKey != null
          ? visibleRows.findIndex(
              (row?: Dynamic): Dynamic => row.key === focusedKey,
            )
          : -1;
    lastFocusedRowRef.current =
      focusedKey != null && focusedIndex >= 0
        ? {
            key: focusedKey,
            index: focusedIndex,
          }
        : null;
  });
  let renderNode: Dynamic = (
      node?: Dynamic,
      depth?: Dynamic,
      position?: Dynamic,
      artboardKey: Dynamic = null,
    ): Dynamic => {
      let treeKey: Dynamic = artboardKey ?? focusedArtboard,
        isOpen: Dynamic = getExpanded(treeKey).has(node.tid),
        hasChildren: Dynamic = node.children.length > 0,
        rowKey: Dynamic = OutlineTreeHandler_3(
          treeKey,
          node.tid,
        ),
        isSelected: Dynamic =
          artboardKey == null
            ? selectedTids.includes(node.tid)
            : (artboards?.selectedIn[artboardKey] ?? []).includes(node.tid),
        isDropTarget: Dynamic = artboardKey == null && dropTarget?.tid === node.tid,
        isHighlighted: Dynamic =
          isSelected || (isDropTarget && dropTarget?.position === "into"),
        isDimmed: Dynamic = node.hidden || node.grayed === true,
        isComponent: Dynamic = node.component != null,
        labelText: Dynamic = node.detail
          ? `${uiNodeLabel(node)} ${node.detail}`
          : uiNodeLabel(node),
        glyphIcon: Dynamic = node.glyph
          ? ChromeToolIconsColumnRowTextConfig[node.glyph]
          : undefined,
        directive: Dynamic =
          artboardKey == null ? directiveState?.[node.tid] : undefined,
        directiveBadge: Dynamic =
          node.tag === "sc-if" && directive?.on != null
            ? directive.on
              ? "on"
              : "off"
            : node.tag === "sc-for" && directive?.count != null
              ? directive.count === 0
                ? "empty"
                : directive.count === 1
                  ? "1 item"
                  : `${directive.count} items`
              : null;
      return (() => {
        const NodeRowTag = "div";
        const nodeRowProps = {
          children: [
            isDropTarget && dropTarget?.position === "before" && (
              <div
                className={"h-0.5 rounded-[1px] bg-fill-accent"}
                style={{
                  marginLeft:
                    treeRowBaseIndent +
                    depth * treeIndentPerLevel +
                    treeToggleColumnWidth,
                }}
              />
            ),
            <div
              role={"treeitem"}
              aria-level={depth + 1}
              aria-posinset={position.index + 1}
              aria-setsize={position.count}
              aria-expanded={hasChildren ? isOpen : undefined}
              aria-selected={isHighlighted}
              aria-label={[
                uiNodeLabel(node),
                isComponent ? "component" : null,
                directiveBadge,
                node.detail,
                node.hidden ? "hidden" : null,
              ]
                .filter(
                  (part?: Dynamic): Dynamic =>
                    part != null && part !== "",
                )
                .join(", ")}
              tabIndex={rowKey === tabStopKey ? 0 : -1}
              data-row-key={rowKey}
              className={cn(
                OutlineGlyphsClassNames_2,
                isHighlighted
                  ? selectedRowClasses
                  : OutlineGlyphsClassNames_4,
              )}
              style={{
                paddingLeft:
                  treeRowBaseIndent +
                  depth * treeIndentPerLevel,
              }}
              onFocus={(event?: Dynamic): Dynamic => {
                event.target === event.currentTarget &&
                  (setCursor(rowKey),
                  onHover(artboardKey == null ? node.tid : null));
              }}
              onClick={(event?: Dynamic): Dynamic => {
                let isMultiSelect: Dynamic =
                    event.shiftKey || event.metaKey || event.ctrlKey,
                  rowEntry: Dynamic = visibleRows.find(
                    (row?: Dynamic): Dynamic => row.key === rowKey,
                  );
                (event.detail === 0 &&
                  rowEntry &&
                  activateRow(rowEntry, isMultiSelect)) ||
                  (artboardKey != null
                    ? artboards?.onSelectIn(artboardKey, node.tid)
                    : onSelect(node.tid, isMultiSelect));
              }}
              onDoubleClick={(event?: Dynamic): Dynamic => {
                !onRename ||
                  artboardKey != null ||
                  (event.stopPropagation(),
                  setRenamingTid(node.tid),
                  setRenameDraft(node.userLabel ?? ""));
              }}
              onContextMenu={(event?: Dynamic): Dynamic => {
                if (!contextActions || artboardKey != null) return;
                event.preventDefault();
                selectedTids.includes(node.tid) ||
                  onSelect(node.tid, false, "contextmenu");
                let menuItems: Dynamic = contextActions(node.tid);
                menuItems.length !== 0 &&
                  setContextMenu({
                    ...OutlineGlyphsNativeEvent(event),
                    items: menuItems.map(OutlineGlyphsLabel),
                    get label() { return uiMessage("inspector.dcOutline.actions", { value1: String(uiNodeLabel(node)) }); },
                  });
              }}
              onMouseEnter={(): Dynamic => {
                onHover(artboardKey == null ? node.tid : null);
              }}
              data-testid={
                artboardKey == null
                  ? `dc-outline-${node.tid}`
                  : `dc-outline-in-${artboardKey}-${node.tid}`
              }
              data-tag={node.tag}
              draggable={!!onMove && artboardKey == null && renamingTid !== node.tid}
              onDragStart={(event?: Dynamic): Dynamic => {
                if (artboardKey != null) {
                  event.preventDefault();
                  return;
                }
                setDraggingTid(node.tid);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(node.tid));
              }}
              onDragEnd={(): Dynamic => {
                setDraggingTid(null);
                setDropTarget(null);
              }}
              onDragOver={(event?: Dynamic): Dynamic => {
                if (
                  artboardKey != null ||
                  draggingTid == null ||
                  draggingTid === node.tid
                )
                  return;
                event.preventDefault();
                let bounds: Dynamic =
                    event.currentTarget.getBoundingClientRect(),
                  pointerRatio: Dynamic =
                    (event.clientY - bounds.top) / bounds.height,
                  dropPosition: Dynamic =
                    pointerRatio < 0.25
                      ? "before"
                      : pointerRatio > 0.75
                        ? "after"
                        : "into";
                setDropTarget(
                  (prevTarget?: Dynamic): Dynamic =>
                    prevTarget?.tid === node.tid && prevTarget.position === dropPosition
                      ? prevTarget
                      : {
                          tid: node.tid,
                          position: dropPosition,
                        },
                );
              }}
              onDrop={(event?: Dynamic): Dynamic => {
                artboardKey == null &&
                  (event.preventDefault(),
                  draggingTid != null &&
                    dropTarget &&
                    draggingTid !== dropTarget.tid &&
                    onMove?.(draggingTid, dropTarget.tid, dropTarget.position),
                  setDraggingTid(null),
                  setDropTarget(null));
              }}
            >
              {hasChildren ? (<Button
                  variant={"ghost"}
                  size={"xs"}
                  iconOnly={true}
                  tooltip={false}
                  aria-label={(isOpen ? uiMessage("inspector.dcOutline.collapse") : uiMessage("inspector.dcOutline.expand")) + labelText}
                  aria-expanded={isOpen}
                  tabIndex={-1}
                  className={"shrink-0"}
                  icon={
                    <Icon
                      name={"CaretRight"}
                      size={"xs"}
                      className={cn(
                        "text-muted transition-transform duration-fast",
                        isOpen ? "rotate-90" : "rotate-0",
                      )}
                    />
                  }
                  onClick={(event?: Dynamic): Dynamic => {
                    event.stopPropagation();
                    updateExpanded(treeKey, (prevExpanded?: Dynamic): Dynamic => {
                      let values: Dynamic = new Set(prevExpanded);
                      values.has(node.tid)
                        ? values.delete(node.tid)
                        : values.add(node.tid);
                      return values;
                    });
                  }}
                  onDoubleClick={(event?: Dynamic): Dynamic =>
                    event.stopPropagation()
                  }
                />) : (<span
                  aria-hidden={true}
                  className={"shrink-0"}
                  style={{
                    width: treeToggleColumnWidth,
                  }}
                />)}
              {glyphIcon ? (<OutlineIconGlyph
                  icon={glyphIcon}
                  dimmed={isDimmed}
                  ink={
                    isComponent
                      ? OutlineGlyphsColorConfig.color
                      : undefined
                  }
                />) : (<OutlineElementGlyph dimmed={isDimmed} />)}
              {renamingTid === node.tid && artboardKey == null ? (<TextInput
                  size={"sm"}
                  fullWidth={false}
                  className={"min-w-0 flex-1"}
                  aria-label={uiMessage("inspector.dcOutline.layerName")}
                  autoFocus={true}
                  value={renameDraft}
                  placeholder={uiNodeLabel(node)}
                  onChange={(event?: Dynamic): Dynamic =>
                    setRenameDraft(event.target.value)
                  }
                  onClick={(event?: Dynamic): Dynamic =>
                    event.stopPropagation()
                  }
                  onDoubleClick={(event?: Dynamic): Dynamic =>
                    event.stopPropagation()
                  }
                  onContextMenu={(event?: Dynamic): Dynamic =>
                    event.stopPropagation()
                  }
                  onFocus={(event?: Dynamic): Dynamic =>
                    event.currentTarget.select()
                  }
                  onBlur={(): Dynamic => setRenamingTid(null)}
                  onKeyDown={(event?: Dynamic): Dynamic => {
                    if (event.key === "Enter") {
                      let trimmedName: Dynamic = renameDraft.trim();
                      trimmedName
                        ? onRename?.(node.tid, trimmedName)
                        : node.userLabel && onRename?.(node.tid, "");
                      setRenamingTid(null);
                    } else event.key === "Escape" && setRenamingTid(null);
                    event.stopPropagation();
                  }}
                />) : (<span
                  className={cn(
                    "min-w-0 flex-initial truncate",
                    OutlineGlyphsClassNames_3,
                    OutlineGlyphsScForScIfDcImportSet.has(
                      node.tag,
                    ) &&
                      !isComponent &&
                      "italic",
                    isDimmed ? "opacity-50" : "opacity-100",
                  )}
                  style={
                    isComponent ? OutlineGlyphsColorConfig : undefined
                  }
                  title={node.component?.ref}
                >
                  {uiNodeLabel(node)}
                </span>)}
              {directiveBadge != null && (<Badge
                  variant={"neutral"}
                  size={"xxs"}
                  className={cn(
                    "ml-1.5 shrink-0",
                    isDimmed ? "opacity-50" : "opacity-100",
                  )}
                >
                  {directiveBadge}
                </Badge>)}
              {renamingTid !== node.tid && (<span
                  className={cn(
                    "mx-1.5 min-w-0 flex-auto shrink-[9999] truncate",
                    OutlineGlyphsClassNames_3,
                    !isComponent && "text-muted",
                    isDimmed
                      ? "opacity-50"
                      : isComponent
                        ? "opacity-60"
                        : "opacity-100",
                  )}
                  style={
                    isComponent ? OutlineGlyphsColorConfig : undefined
                  }
                  title={node.component?.ref}
                >
                  {node.detail ?? ("")}
                </span>)}
              {!node.noHide && artboardKey == null && onToggleHidden && (<Button
                  variant={"ghost"}
                  size={"xs"}
                  iconOnly={true}
                  icon={
                    <Icon
                      name={node.hidden ? "EyeSlash" : "Eye"}
                      size={"xs"}
                      className={
                        "text-muted group-hover/eye:text-primary group-focus-visible/eye:text-primary"
                      }
                    />
                  }
                  aria-label={(node.hidden ? uiMessage("inspector.dcOutline.show2") : uiMessage("inspector.dcOutline.hide")) + labelText}
                  tooltip={node.hidden ? (uiMessage("inspector.dcOutline.show")) : ("Hide")}
                  tabIndex={rowKey === tabStopKey ? 0 : -1}
                  className={cn(
                    "group/eye shrink-0",
                    node.hidden
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 focus-visible:opacity-100",
                  )}
                  onClick={(event?: Dynamic): Dynamic => {
                    event.stopPropagation();
                    onToggleHidden(node.tid, !node.hidden);
                  }}
                  onDoubleClick={(event?: Dynamic): Dynamic =>
                    event.stopPropagation()
                  }
                />)}
            </div>,
            isDropTarget && dropTarget?.position === "after" && (
              <div
                className={"h-0.5 rounded-[1px] bg-fill-accent"}
                style={{
                  marginLeft:
                    treeRowBaseIndent +
                    depth * treeIndentPerLevel +
                    treeToggleColumnWidth,
                }}
              />
            ),
            isOpen &&
              hasChildren &&
              node.children.map(
                (child?: Dynamic, childIndex?: Dynamic): Dynamic =>
                  renderNode(
                    child,
                    depth + 1,
                    {
                      index: childIndex,
                      count: node.children.length,
                    },
                    artboardKey,
                  ),
              ),
          ],
        } as const;
        const nodeRowKey = artboardKey == null ? node.tid : `${artboardKey}:${node.tid}`;
        return <NodeRowTag key={nodeRowKey} {...nodeRowProps} />;
      })();
    },
    renderObjectRow: Dynamic = (objectItem?: Dynamic, index?: Dynamic): Dynamic => {
      if (!artboards) return null;
      let rowKey: Dynamic = OutlineTreeHandler_2(objectItem.id),
        isSelected: Dynamic = artboards.selectedObjects.has(objectItem.id);
      return (() => {
        const ObjectRowTag = "div";
        const objectRowProps = {
          role: "treeitem",
          "aria-level": 1,
          "aria-posinset": index + 1,
          "aria-setsize": artboards.objects.length + artboards.rows.length,
          "aria-selected": isSelected,
          "aria-label": objectItem.detail
            ? `${uiNodeLabel(objectItem)}, ${objectItem.detail}`
            : uiNodeLabel(objectItem),
          tabIndex: rowKey === tabStopKey ? 0 : -1,
          "data-row-key": rowKey,
          className: cn(
            OutlineGlyphsClassNames_2,
            isSelected
              ? selectedRowClasses
              : OutlineGlyphsClassNames_4,
          ),
          style: {
            paddingLeft: treeRowBaseIndent,
          },
          onFocus: (event?: Dynamic): Dynamic => {
            event.target === event.currentTarget &&
              (setCursor(rowKey), onHover(null));
          },
          onClick: (event?: Dynamic): Dynamic => {
            let isMultiSelect: Dynamic =
                event.shiftKey || event.metaKey || event.ctrlKey,
              rowEntry: Dynamic = visibleRows.find(
                (row?: Dynamic): Dynamic => row.key === rowKey,
              );
            (event.detail === 0 &&
              rowEntry &&
              activateRow(rowEntry, isMultiSelect)) ||
              artboards.onSelectObject(objectItem.id, isMultiSelect);
          },
          onContextMenu: (event?: Dynamic): Dynamic => {
            if (!artboards.objectContextActions) return;
            event.preventDefault();
            let menuItems: Dynamic = artboards.objectContextActions(objectItem.id);
            menuItems.length !== 0 &&
              setContextMenu({
                ...OutlineGlyphsNativeEvent(event),
                items: menuItems.map(OutlineGlyphsLabel),
                get label() { return uiMessage("inspector.dcOutline.actions", { value1: String(uiNodeLabel(objectItem)) }); },
              });
          },
          onMouseEnter: (): Dynamic => onHover(null),
          "data-testid": `dc-outline-object-${objectItem.id}`,
          children: [
            <span
              aria-hidden={true}
              className={"shrink-0"}
              style={{
                width: treeToggleColumnWidth,
              }}
            />,
            <OutlineIconGlyph
              icon={ChromeToolIconsNoteTitleRectConfig[objectItem.glyph]}
              dimmed={false}
            />,
            <span
              className={cn(
                "min-w-0 flex-initial truncate",
                OutlineGlyphsClassNames_3,
              )}
            >
              {uiNodeLabel(objectItem)}
            </span>,
            <span
              className={cn(
                "mx-1.5 min-w-0 flex-auto shrink-[9999] truncate text-muted",
                OutlineGlyphsClassNames_3,
              )}
              title={objectItem.detailTitle}
            >
              {objectItem.detail ?? ("")}
            </span>,
          ],
        } as const;
        const objectRowKey = objectItem.id;
        return <ObjectRowTag key={objectRowKey} {...objectRowProps} />;
      })();
    };
  return (
    <CdsIsland
      density={"compact"}
      className={cn(
        "relative flex flex-col",
        fill ? "min-h-0 flex-1" : "shrink-0 border-b",
      )}
    >
      <DeferredTooltipProvider>
        <div
          ref={treeRef}
          role={"tree"}
          aria-label={uiMessage("inspector.dcOutline.layers")}
          aria-multiselectable={"true"}
          className={cn(
            "overflow-y-auto px-1.5 pb-0.5 pt-1.5",
            ChromeScrollbarLabel,
            fill && "min-h-0 flex-1",
          )}
          style={
            fill
              ? undefined
              : {
                  height: listHeight,
                }
          }
          onKeyDown={handleKeyDown}
          onMouseLeave={(): Dynamic => onHover(null)}
          onPointerDown={handlePointerDown}
          onMouseDown={handlePointerDown}
          onFocus={(event?: Dynamic): Dynamic => {
            let ancestor: Dynamic = event.target.closest('[role="treeitem"]'),
              rowKey: Dynamic = ancestor?.getAttribute("data-row-key"),
              rowIndex: Dynamic =
                rowKey != null
                  ? visibleRows.findIndex(
                      (row?: Dynamic): Dynamic => row.key === rowKey,
                    )
                  : -1;
            rowKey != null &&
              rowIndex >= 0 &&
              (lastFocusedRowRef.current = {
                key: rowKey,
                index: rowIndex,
              });
            if (ancestor != null) {
              let relatedTarget: Dynamic = event.relatedTarget,
                isRestoredFocus: Dynamic =
                  blurredTargetRef.current === event.target &&
                  (relatedTarget == null ||
                    !relatedTarget.isConnected ||
                    relatedTarget.closest(
                      OutlineGlyphsResolvedValue,
                    ) != null);
              blurredTargetRef.current = null;
              justPressedRef.current ? setKeyboardBrowsed(false) : isRestoredFocus || setKeyboardBrowsed(true);
            }
          }}
          onBlur={(event?: Dynamic): Dynamic => {
            if (event.currentTarget.contains(event.relatedTarget)) return;
            let ownerDocument: Dynamic = event.currentTarget.ownerDocument,
              relatedTarget: Dynamic = event.relatedTarget;
            blurredTargetRef.current =
              !ownerDocument.hasFocus() ||
              hasBlockingOverlay(ownerDocument) ||
              relatedTarget?.closest(OutlineGlyphsResolvedValue) !=
                null
                ? event.target
                : null;
            lastFocusedRowRef.current = null;
            onHover(null);
          }}
          onScroll={(event?: Dynamic): Dynamic => {
            scrollState &&
              !isRestoringScrollRef.current &&
              ((scrollState.current = event.currentTarget.scrollTop),
              (needsScrollRestoreRef.current = false));
          }}
          data-testid={"dc-outline"}
        >
          {artboards?.objects.map(renderObjectRow)}
          {artboards ? (artboards.rows.map(
              (artboardRow?: Dynamic, rowIndex?: Dynamic): Dynamic => {
                let isFocused: Dynamic = artboardRow.file === artboards.focused,
                  rowKey: Dynamic = OutlineTreeHandler(
                    artboardRow.file,
                  ),
                  fileNodes: Dynamic = isFocused
                    ? nodes
                    : artboards.trees[artboardRow.file],
                  hasNodes: Dynamic = fileNodes != null && fileNodes.length > 0,
                  isOpen: Dynamic =
                    hasNodes && artboards.open.has(artboardRow.file),
                  isCover: Dynamic = artboards.cover === artboardRow.file,
                  isComponent: Dynamic =
                    artboards.components?.has(artboardRow.file) === true,
                  unreadableId: Dynamic =
                    artboards.trees[artboardRow.file] === null
                      ? idPrefix + "-unreadable-" + String(rowIndex)
                      : undefined;
                return (() => {
                  const ArtboardRowTag = "div";
                  const artboardRowProps = {
                    children: [
                      <div
                        role={"treeitem"}
                        aria-level={1}
                        aria-posinset={artboards.objects.length + rowIndex + 1}
                        aria-setsize={
                          artboards.objects.length + artboards.rows.length
                        }
                        aria-expanded={hasNodes ? isOpen : undefined}
                        aria-selected={artboards.selected.has(artboardRow.file)}
                        aria-current={isFocused || undefined}
                        aria-label={
                          uiNodeLabel(artboardRow) + (isComponent ? uiMessage("inspector.dcOutline.component") : "") + (isCover ? uiMessage("inspector.dcOutline.thumbnail") : "")
                        }
                        aria-describedby={unreadableId}
                        tabIndex={rowKey === tabStopKey ? 0 : -1}
                        data-row-key={rowKey}
                        className={cn(
                          OutlineGlyphsClassNames_2,
                          artboards.selected.has(artboardRow.file)
                            ? selectedRowSecondaryClasses
                            : OutlineGlyphsClassNames_4,
                        )}
                        style={{
                          paddingLeft: treeRowBaseIndent,
                        }}
                        onFocus={(event?: Dynamic): Dynamic => {
                          event.target === event.currentTarget &&
                            (setCursor(rowKey), onHover(null));
                        }}
                        onClick={(event?: Dynamic): Dynamic => {
                          let isMultiSelect: Dynamic =
                              event.shiftKey ||
                              event.metaKey ||
                              event.ctrlKey,
                            rowEntry: Dynamic = visibleRows.find(
                              (row?: Dynamic): Dynamic =>
                                row.key === rowKey,
                            );
                          (event.detail === 0 &&
                            rowEntry &&
                            activateRow(rowEntry, isMultiSelect)) ||
                            (isMultiSelect
                              ? artboards.onToggleSelected(artboardRow.file)
                              : artboards.onFocus(artboardRow.file));
                        }}
                        onContextMenu={(event?: Dynamic): Dynamic => {
                          if (!artboards.contextActions) return;
                          event.preventDefault();
                          let menuItems: Dynamic = artboards.contextActions(
                            artboardRow.file,
                          );
                          menuItems.length !== 0 &&
                            setContextMenu({
                              ...OutlineGlyphsNativeEvent(event),
                              items: menuItems.map(OutlineGlyphsLabel),
                              get label() { return uiMessage("inspector.dcOutline.actions", { value1: String(uiNodeLabel(artboardRow)) }); },
                            });
                        }}
                        data-testid={`dc-outline-artboard-${artboardRow.file}`}
                      >
                        {hasNodes ? (<Button
                            variant={"ghost"}
                            size={"xs"}
                            iconOnly={true}
                            tooltip={false}
                            aria-label={
                              (isOpen ? uiMessage("inspector.dcOutline.collapse") : uiMessage("inspector.dcOutline.expand")) + uiNodeLabel(artboardRow)
                            }
                            aria-expanded={isOpen}
                            tabIndex={-1}
                            className={"shrink-0"}
                            icon={
                              <Icon
                                name={"CaretRight"}
                                size={"xs"}
                                className={cn(
                                  "text-muted transition-transform duration-fast",
                                  isOpen ? "rotate-90" : "rotate-0",
                                )}
                              />
                            }
                            onClick={(event?: Dynamic): Dynamic => {
                              event.stopPropagation();
                              artboards.onToggleOpen(artboardRow.file, !isOpen);
                            }}
                            onDoubleClick={(event?: Dynamic): Dynamic =>
                              event.stopPropagation()
                            }
                          />) : (<span
                            aria-hidden={true}
                            className={"shrink-0"}
                            style={{
                              width: treeToggleColumnWidth,
                            }}
                          />)}
                        <div
                          className={"flex min-w-0 flex-auto items-center"}
                        >
                          <OutlineIconGlyph
                            icon={
                              ChromeToolIconsColumnRowTextConfig.frame
                            }
                            dimmed={false}
                            ink={
                              isComponent
                                ? OutlineGlyphsColorConfig.color
                                : undefined
                            }
                          />
                          {artboards.renaming === artboardRow.file ? (<OutlineRenameInput
                              label={uiNodeLabel(artboardRow)}
                              onDone={(
                                newName?: Dynamic,
                                shouldRefocus?: Dynamic,
                              ): Dynamic => {
                                artboards.onRename?.(artboardRow.file, newName);
                                shouldRefocus &&
                                  findRowElement(rowKey)?.focus({
                                    preventScroll: true,
                                  });
                              }}
                            />) : (<span
                              className={cn(
                                "min-w-0 flex-auto truncate",
                                OutlineGlyphsClassNames_3,
                              )}
                              style={
                                isComponent
                                  ? OutlineGlyphsColorConfig
                                  : undefined
                              }
                            >
                              {uiNodeLabel(artboardRow)}
                            </span>)}
                          {isCover && artboards.renaming !== artboardRow.file && (<Icon
                              name={"Image"}
                              size={"xs"}
                              data-testid={"dc-outline-cover"}
                              className={cn(
                                "mx-1.5 shrink-0 text-muted",
                                OutlineGlyphsClassNames_3,
                              )}
                            />)}
                          {unreadableId != null && (<span id={unreadableId} hidden={true}>
                              {CanTReadThisArtboardSFileAskMessage}
                            </span>)}
                        </div>
                      </div>,
                      isOpen &&
                        fileNodes.map(
                          (child?: Dynamic, childIndex?: Dynamic): Dynamic =>
                            renderNode(
                              child,
                              1,
                              {
                                index: childIndex,
                                count: fileNodes.length,
                              },
                              isFocused ? null : artboardRow.file,
                            ),
                        ),
                    ],
                  } as const;
                  const artboardRowKey = artboardRow.file;
                  return <ArtboardRowTag key={artboardRowKey} {...artboardRowProps} />;
                })();
              },
            )) : (nodes.length === 0 ? (<div className={"px-3.5 py-2.5 text-caption text-muted"}>
              {uiMessage("inspector.dcOutline.noElementsYet")}
            </div>) : (nodes.map(
              (node?: Dynamic, index?: Dynamic): Dynamic =>
                renderNode(node, 0, {
                  index: index,
                  count: nodes.length,
                }),
            )))}
          <FloatingScrollbar />
        </div>
      </DeferredTooltipProvider>
      {!fill && (<ComponentsSelectionPointsComponent
          side={"bottom"}
          aria-label={uiMessage("inspector.dcOutline.resizeLayersList")}
          aria-valuenow={listHeight}
          aria-valuemin={OutlineGlyphsConstant}
          aria-valuemax={layersListMaxSize}
          className={"z-10 [--cds-ring-inner:1px] [--cds-ring-outer:0px]"}
          onResizeStart={(): Dynamic => {
            listHeightRef.current = listHeight;
          }}
          onResize={resizeList}
          onKeyDown={(event?: Dynamic): Dynamic => {
            (event.key.startsWith("Arrow") ||
              event.key === "Enter" ||
              event.key === " ") &&
              event.stopPropagation();
          }}
        />)}
      <EditorMenu
        at={contextMenu}
        onClose={(): Dynamic => setContextMenu(null)}
        items={contextMenu?.items ?? []}
        minWidth={180}
        label={contextMenu?.label}
        focusFirstItem={contextMenu?.keyboard}
        owner={OutlineValue}
      />
    </CdsIsland>
  );
}
export {
  DcOutline,
  nativeContextMenuTimeout,
  OutlineDcOutlineConstant,
  OutlineDcOutlineLongSuppressDelay as OutlineDcOutlineConstant_2,
  OutlineDcOutlineHandler,
  OutlineDcOutlineRemoveEventListener,
  OutlineDcOutlineTarget,
};
export function set_nativeContextMenuTimeout(timeoutId: any): any {
  nativeContextMenuTimeout = timeoutId;
  return timeoutId;
}
export function installEditorOutlineDcOutline(): () => void {
  return () => {
    initializePlatformCdsIsland();
    OutlineDcOutlineConstant = 500;
    OutlineDcOutlineLongSuppressDelay = 3e4;
    OutlineDcOutlineHandler = (target?: Dynamic): Dynamic =>
      target?.closest?.(
        'input, textarea, select, [contenteditable]:not([contenteditable="false"])',
      ) != null;
    OutlineDcOutlineTarget = (event?: Dynamic): Dynamic => {
      OutlineDcOutlineHandler(event.target) || event.preventDefault();
    };
    nativeContextMenuTimeout = null;
    OutlineDcOutlineRemoveEventListener = (): Dynamic => {
      nativeContextMenuTimeout = null;
      (window as Dynamic).removeEventListener(
        "contextmenu",
        OutlineDcOutlineTarget,
        true,
      );
    };
  };
}
