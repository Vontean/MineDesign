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
import { CanTReadThisArtboardSFileAskMessage, OutlineElementGlyph, OutlineGlyphsClassNames_2, OutlineGlyphsClassNames_3, OutlineGlyphsClassNames_4, OutlineGlyphsColorConfig, OutlineGlyphsConstant, OutlineGlyphsConstant_2, OutlineGlyphsConstant_3, OutlineGlyphsConstant_4, OutlineGlyphsConstant_5, OutlineGlyphsConstant_6, OutlineGlyphsLabel, OutlineGlyphsNativeEvent, OutlineGlyphsResolvedValue, OutlineGlyphsResolvedValue_2, OutlineGlyphsResolvedValue_3, OutlineGlyphsScForScIfDcImportSet, OutlineGlyphsSubscribers, OutlineIconGlyph } from "./glyphs";
import { OutlineRenameInput, OutlineRenameLimit } from "./rename";
import { flattenOutlineRows, outlineAncestorMap, OutlineTreeHandler, OutlineTreeHandler_2, OutlineTreeHandler_3, scrollOutlineRowIntoView } from "./tree";
import { CdsIsland, initializePlatformCdsIsland } from "../../platform/cds-island";

var OutlineDcOutlineConstant: Dynamic;
var OutlineDcOutlineConstant_2: Dynamic;
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
  let [value, value2]: Dynamic = (0,
    reactKeyboardEditActions.useState)(
      OutlineGlyphsConstant_3,
    ),
    value3: Dynamic = (0, reactKeyboardEditActions.useId)(),
    [value4, value5]: Dynamic = (0,
    reactKeyboardEditActions.useState)((): Dynamic => new Set()),
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      artboards && input != null
        ? (artboards.expanded[input] ?? OutlineGlyphsSubscribers)
        : value4,
    callback2: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      if (artboards && input != null) {
        let value45: Dynamic =
            artboards.expanded[input] ?? OutlineGlyphsSubscribers,
          value46: Dynamic = options(value45);
        value46 !== value45 && artboards.onExpandedChange(input, value46);
      } else value5((input2?: Dynamic): Dynamic => options(input2));
    },
    value6: Dynamic = artboards ? artboards.focused : null,
    value7: Dynamic = callback(value6),
    value8: Dynamic = (0, reactKeyboardEditActions.useMemo)(
      (): Dynamic => outlineAncestorMap(nodes),
      [nodes],
    ),
    [value9, value10]: Dynamic = (0,
    reactKeyboardEditActions.useState)(null),
    [value11, value12]: Dynamic = (0,
    reactKeyboardEditActions.useState)(""),
    [value13, value14]: Dynamic = (0,
    reactKeyboardEditActions.useState)(null),
    [value15, value16]: Dynamic = (0,
    reactKeyboardEditActions.useState)(null),
    [value17, value18]: Dynamic = (0,
    reactKeyboardEditActions.useState)(closeRenameOn);
  closeRenameOn !== value17 &&
    (value18(closeRenameOn), value10(null), value16(null));
  let [value19, value20]: Dynamic = (0,
    reactKeyboardEditActions.useState)(null),
    value21: Dynamic = artboards?.cursor,
    [value22, value23]: Dynamic = (0,
    reactKeyboardEditActions.useState)(
      (): Dynamic => value21?.key ?? null,
    ),
    callback3: Dynamic = (input?: Dynamic): Dynamic => {
      value21 && (value21.key = input);
      value23(input);
    },
    value24: Dynamic = (0, reactKeyboardEditActions.useRef)(0),
    value25: Dynamic =
      selectedTids.length > 0
        ? `${value6 ?? ""}:${selectedTids.join(",")}`
        : "",
    [value26]: Dynamic = (0, reactKeyboardEditActions.useState)(
      (): Dynamic => ({
        path: "",
        row: "",
      }),
    ),
    value27: Dynamic = artboards?.revealed ?? value26,
    value28: Dynamic = (0, reactKeyboardEditActions.useRef)(
      artboards ? artboards.revealed.path : value25,
    );
  (0, reactKeyboardEditActions.useEffect)((): Dynamic => {
    if (selectedTids.length === 0) {
      value28.current = "";
      value27.path = "";
      return;
    }
    let value45: Dynamic = value25;
    value45 !== value28.current &&
      artboards &&
      !artboards.open.has(artboards.focused) &&
      artboards.onToggleOpen(artboards.focused, true);
    value28.current = value45;
    value27.path = value45;
    callback2(value6, (input?: Dynamic): Dynamic => {
      let values: Dynamic = new Set(input);
      for (let value46 of selectedTids as Dynamic)
        for (let value47 of (value8.get(value46) ?? []) as Dynamic)
          values.add(value47);
      return values.size === input.size ? input : values;
    });
  }, [selectedTids, value8]);
  let value29: Dynamic = (0, reactKeyboardEditActions.useRef)(null),
    callback4: Dynamic = (input?: Dynamic): Dynamic => {
      let value45: Dynamic =
        value29.current?.querySelectorAll("[data-row-key]");
      for (let value46 of (value45 ?? []) as Dynamic)
        if (value46.dataset.rowKey === input) return value46;
      return null;
    },
    value30: Dynamic = artboards?.scroll,
    value31: Dynamic = (0, reactKeyboardEditActions.useRef)(false),
    value32: Dynamic = (0, reactKeyboardEditActions.useRef)(true);
  (0, reactKeyboardEditActions.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = value29.current;
    !current ||
      !value30 ||
      !value32.current ||
      ((value31.current = true),
      (current.scrollTop = value30.current),
      Math.abs(current.scrollTop - value30.current) <= 0.5 &&
        (value32.current = false),
      requestAnimationFrame((): Dynamic => {
        value31.current = false;
      }));
  }, [value30, nodes, artboards?.trees, artboards?.open]);
  let callback5: Dynamic = (input?: Dynamic): Dynamic => {
      scrollOutlineRowIntoView(value29.current, input, true) &&
        (value32.current = false);
    },
    value33: Dynamic =
      value25 +
      "|" +
      [...(artboards?.selectedObjects ?? [])].sort().join(",") +
      "|" +
      [...(artboards?.selected ?? [])].sort().join(","),
    value34: Dynamic = (0, reactKeyboardEditActions.useRef)(false),
    value35: Dynamic = (0, reactKeyboardEditActions.useRef)(null);
  (0, reactKeyboardEditActions.useEffect)((): Dynamic => {
    let callback16: Dynamic = (): Dynamic => {
      setTimeout((): Dynamic => (value35.current = null), 0);
    };
    (window as Dynamic).addEventListener("focus", callback16);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("focus", callback16);
  }, []);
  let callback6: Dynamic = (input?: Dynamic): Dynamic => {
      let current: Dynamic = value29.current;
      current &&
        (input
          ? current.setAttribute(DcKeyBrowsedAttribute, "")
          : current.removeAttribute(DcKeyBrowsedAttribute));
    },
    callback7: Dynamic = (): Dynamic => {
      value35.current = null;
      value34.current = true;
      setTimeout((): Dynamic => (value34.current = false), 0);
    },
    callback8: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic => {
      let current: Dynamic = options.current;
      options.current = input ?? new Set();
      let value45: Dynamic = input
        ? [...input].find((input2?: Dynamic): Dynamic => !current.has(input2))
        : undefined;
      if (value45 == null) return;
      value27.row = value33;
      let value46: Dynamic = requestAnimationFrame((): Dynamic => {
        let value47: Dynamic = value29.current?.querySelector(
          `[data-testid="${context}-${CSS.escape(value45)}"]`,
        );
        value47 && callback5(value47);
      });
      return (): Dynamic => cancelAnimationFrame(value46);
    },
    value36: Dynamic = artboards?.selected,
    value37: Dynamic = (0, reactKeyboardEditActions.useRef)(
      new Set(),
    );
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => callback8(value36, value37, "dc-outline-artboard"),
    [value36],
  );
  let value38: Dynamic = artboards?.selectedObjects,
    value39: Dynamic = (0, reactKeyboardEditActions.useRef)(
      new Set(),
    );
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => callback8(value38, value39, "dc-outline-object"),
    [value38],
  );
  (0, reactKeyboardEditActions.useEffect)((): Dynamic => {
    if (selectedTids.length === 0) {
      value27.row = "";
      return;
    }
    if (value27.row === value33) return;
    let value45: Dynamic = selectedTids[0];
    if (
      !(value8.get(value45) ?? []).every(
        (input?: Dynamic): Dynamic => value7.has(input),
      )
    )
      return;
    let value46: Dynamic = requestAnimationFrame((): Dynamic => {
      let value47: Dynamic = value29.current?.querySelector(
        `[data-testid="dc-outline-${value45}"]`,
      );
      value47 && ((value27.row = value33), callback5(value47));
    });
    return (): Dynamic => cancelAnimationFrame(value46);
  }, [selectedTids, value33, value7, value8, artboards?.open]);
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => (): Dynamic => {
      value27.row = "";
    },
    [value27],
  );
  let value40: Dynamic = (0, reactKeyboardEditActions.useRef)(value),
    callback9: Dynamic = (input?: Dynamic): Dynamic =>
      value2(
        Math.min(
          OutlineGlyphsConstant_2,
          Math.max(OutlineGlyphsConstant, value40.current + input),
        ),
      ),
    value41: Dynamic = flattenOutlineRows(
      nodes,
      artboards,
      callback,
    ),
    value42: Dynamic = ((): Dynamic => {
      let values: Dynamic = new Set(
        value41.map((input?: Dynamic): Dynamic => input.key),
      );
      if (value22 != null && values.has(value22)) return value22;
      let value45: Dynamic =
        selectedTids.length > 0
          ? OutlineTreeHandler_3(value6, selectedTids[0])
          : null;
      if (value45 != null && values.has(value45)) return value45;
      let value46: Dynamic = artboards?.objects.find(
        (input?: Dynamic): Dynamic => artboards.selectedObjects.has(input.id),
      );
      if (value46) return OutlineTreeHandler_2(value46.id);
      let value47: Dynamic = artboards?.rows.find(
        (input?: Dynamic): Dynamic => artboards.selected.has(input.file),
      );
      return value47
        ? OutlineTreeHandler(value47.file)
        : (value41[0]?.key ?? null);
    })(),
    callback10: Dynamic = (input?: Dynamic): Dynamic => {
      callback3(input);
      let value45: Dynamic = callback4(input);
      value45 &&
        (value45.focus({
          preventScroll: true,
        }),
        scrollOutlineRowIntoView(value29.current, value45));
    },
    callback11: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      if (input.tid == null) {
        input.file != null && artboards?.onToggleOpen(input.file, options);
        return;
      }
      let tid: Dynamic = input.tid;
      callback2(input.file, (input2?: Dynamic): Dynamic => {
        if (input2.has(tid) === options) return input2;
        let values: Dynamic = new Set(input2);
        options ? values.add(tid) : values.delete(tid);
        return values;
      });
    },
    callback12: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      callback3(input.key);
      if (input.object != null)
        return !artboards ||
          (!options && artboards.selectedObjects.has(input.object))
          ? false
          : (artboards.onSelectObject(input.object, options), true);
      if (artboards && options && input.tid == null && input.file != null) {
        artboards.onToggleSelected(input.file);
        return true;
      }
      if (
        artboards &&
        input.file != null &&
        input.file !== artboards.focused
      ) {
        let cursor: Dynamic = artboards.cursor,
          value45: Dynamic =
            (value24.current =
            cursor.refocusAt =
              Date.now()),
          callback16: Dynamic = (): Dynamic => {
            cursor.refocusAt === value45 && (cursor.refocusAt = 0);
          };
        (document as Dynamic).addEventListener("pointerdown", callback16, {
          capture: true,
          once: true,
        });
        (window as Dynamic).setTimeout(
          (): Dynamic =>
            (document as Dynamic).removeEventListener(
              "pointerdown",
              callback16,
              {
                capture: true,
              },
            ),
          OutlineRenameLimit,
        );
        input.tid == null
          ? artboards.onFocus(input.file)
          : artboards.onSelectIn(input.file, input.tid);
        return true;
      }
      return input.tid == null
        ? artboards?.selected.has(input.file)
          ? false
          : (artboards?.onFocus(input.file), true)
        : !options && selectedTids.includes(input.tid)
          ? false
          : (onSelect(input.tid, options), true);
    },
    callback13: Dynamic = (event?: Dynamic): Dynamic => {
      if (
        event.altKey ||
        ((event.metaKey || event.ctrlKey) && event.key !== " ")
      )
        return;
      let target: Dynamic = event.target,
        ancestor: Dynamic = target.closest('[role="treeitem"]');
      if (!ancestor || !event.currentTarget.contains(ancestor)) return;
      let value45: Dynamic = value41.findIndex(
        (input?: Dynamic): Dynamic => input.key === ancestor.dataset.rowKey,
      );
      if (value45 < 0) return;
      let value46: Dynamic = value41[value45],
        value47: Dynamic = target === ancestor,
        value48: Dynamic = value41.length - 1;
      if (isContextMenuShortcut(event)) {
        event.preventDefault();
        !event.repeat &&
          value13 === null &&
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
          callback10(value41[Math.min(value45 + 1, value48)].key);
          break;
        case "ArrowUp":
          callback10(value41[Math.max(value45 - 1, 0)].key);
          break;
        case "Home":
          callback10(value41[0].key);
          break;
        case "End":
          callback10(value41[value48].key);
          break;
        case "ArrowRight":
          value46.expandable && !value46.open
            ? callback11(value46, true)
            : value46.open &&
              value45 < value48 &&
              callback10(value41[value45 + 1].key);
          break;
        case "ArrowLeft":
          value46.open
            ? callback11(value46, false)
            : value46.parentKey != null && callback10(value46.parentKey);
          break;
        case " ":
          if (
            !value47 ||
            (!event.repeat &&
              !callback12(
                value46,
                event.shiftKey || event.metaKey || event.ctrlKey,
              ))
          )
            return;
          break;
        case "Enter":
          if (
            !value47 ||
            event.shiftKey ||
            (!event.repeat && !callback12(value46, false))
          )
            return;
          break;
        default:
          return;
      }
      event.key !== " " && event.key !== "Enter" && callback6(true);
      event.preventDefault();
    };
  (0, reactKeyboardEditActions.useLayoutEffect)((): Dynamic => {
    if (
      !value21 ||
      value21.refocusAt === 0 ||
      value21.refocusAt === value24.current
    )
      return;
    let activeElement: Dynamic = (document as Dynamic).activeElement;
    if (
      Date.now() - value21.refocusAt > OutlineRenameLimit ||
      (activeElement != null &&
        activeElement !== (document as Dynamic).body &&
        activeElement.closest('[data-testid="dc-outline"]') == null)
    ) {
      value21.refocusAt = 0;
      return;
    }
    let value45: Dynamic =
      value21.key != null ? callback4(value21.key) : null;
    value45 &&
      ((value21.refocusAt = 0),
      value45.focus({
        preventScroll: true,
      }),
      scrollOutlineRowIntoView(value29.current, value45));
  });
  let value43: Dynamic = (0, reactKeyboardEditActions.useRef)(
    onHover,
  );
  (0, reactKeyboardEditActions.useEffect)((): Dynamic => {
    value43.current = onHover;
  });
  (0, reactKeyboardEditActions.useEffect)(
    (): Dynamic => (): Dynamic => value43.current(null),
    [],
  );
  let value44: Dynamic = (0, reactKeyboardEditActions.useRef)(null);
  (0, reactKeyboardEditActions.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = value44.current,
      activeElement: Dynamic = (document as Dynamic).activeElement;
    if (
      current != null &&
      (activeElement == null ||
        activeElement === (document as Dynamic).body) &&
      value41.length > 0 &&
      !value41.some((input?: Dynamic): Dynamic => input.key === current.key)
    ) {
      let value47: Dynamic =
        value29.current?.hasAttribute(DcKeyBrowsedAttribute) === true;
      callback10(value41[Math.min(current.index, value41.length - 1)].key);
      callback6(value47);
    }
    let activeElement2: Dynamic = (document as Dynamic).activeElement,
      value45: Dynamic =
        activeElement2 != null && value29.current?.contains(activeElement2)
          ? activeElement2
              .closest('[role="treeitem"]')
              ?.getAttribute("data-row-key")
          : null,
      value46: Dynamic =
        value45 != null
          ? value41.findIndex(
              (input?: Dynamic): Dynamic => input.key === value45,
            )
          : -1;
    value44.current =
      value45 != null && value46 >= 0
        ? {
            key: value45,
            index: value46,
          }
        : null;
  });
  let callback14: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value45: Dynamic = null,
    ): Dynamic => {
      let value46: Dynamic = value45 ?? value6,
        value47: Dynamic = callback(value46).has(input.tid),
        value48: Dynamic = input.children.length > 0,
        value49: Dynamic = OutlineTreeHandler_3(
          value46,
          input.tid,
        ),
        value50: Dynamic =
          value45 == null
            ? selectedTids.includes(input.tid)
            : (artboards?.selectedIn[value45] ?? []).includes(input.tid),
        value51: Dynamic = value45 == null && value19?.tid === input.tid,
        value52: Dynamic =
          value50 || (value51 && value19?.position === "into"),
        value53: Dynamic = input.hidden || input.grayed === true,
        value54: Dynamic = input.component != null,
        value55: Dynamic = input.detail
          ? `${uiNodeLabel(input)} ${input.detail}`
          : uiNodeLabel(input),
        value56: Dynamic = input.glyph
          ? ChromeToolIconsColumnRowTextConfig[input.glyph]
          : undefined,
        value57: Dynamic =
          value45 == null ? directiveState?.[input.tid] : undefined,
        value58: Dynamic =
          input.tag === "sc-if" && value57?.on != null
            ? value57.on
              ? "on"
              : "off"
            : input.tag === "sc-for" && value57?.count != null
              ? value57.count === 0
                ? "empty"
                : value57.count === 1
                  ? "1 item"
                  : `${value57.count} items`
              : null;
      return (() => {
        const _Component = "div";
        const _props = {
          children: [
            value51 && value19?.position === "before" && (
              <div
                className={"h-0.5 rounded-[1px] bg-fill-accent"}
                style={{
                  marginLeft:
                    OutlineGlyphsConstant_4 +
                    options * OutlineGlyphsConstant_5 +
                    OutlineGlyphsConstant_6,
                }}
              />
            ),
            <div
              role={"treeitem"}
              aria-level={options + 1}
              aria-posinset={context.index + 1}
              aria-setsize={context.count}
              aria-expanded={value48 ? value47 : undefined}
              aria-selected={value52}
              aria-label={[
                uiNodeLabel(input),
                value54 ? "component" : null,
                value58,
                input.detail,
                input.hidden ? "hidden" : null,
              ]
                .filter(
                  (input2?: Dynamic): Dynamic =>
                    input2 != null && input2 !== "",
                )
                .join(", ")}
              tabIndex={value49 === value42 ? 0 : -1}
              data-row-key={value49}
              className={cn(
                OutlineGlyphsClassNames_2,
                value52
                  ? OutlineGlyphsResolvedValue_2
                  : OutlineGlyphsClassNames_4,
              )}
              style={{
                paddingLeft:
                  OutlineGlyphsConstant_4 +
                  options * OutlineGlyphsConstant_5,
              }}
              onFocus={(event?: Dynamic): Dynamic => {
                event.target === event.currentTarget &&
                  (callback3(value49),
                  onHover(value45 == null ? input.tid : null));
              }}
              onClick={(input2?: Dynamic): Dynamic => {
                let value59: Dynamic =
                    input2.shiftKey || input2.metaKey || input2.ctrlKey,
                  value60: Dynamic = value41.find(
                    (input3?: Dynamic): Dynamic => input3.key === value49,
                  );
                (input2.detail === 0 &&
                  value60 &&
                  callback12(value60, value59)) ||
                  (value45 != null
                    ? artboards?.onSelectIn(value45, input.tid)
                    : onSelect(input.tid, value59));
              }}
              onDoubleClick={(input2?: Dynamic): Dynamic => {
                !onRename ||
                  value45 != null ||
                  (input2.stopPropagation(),
                  value10(input.tid),
                  value12(input.userLabel ?? ""));
              }}
              onContextMenu={(event?: Dynamic): Dynamic => {
                if (!contextActions || value45 != null) return;
                event.preventDefault();
                selectedTids.includes(input.tid) ||
                  onSelect(input.tid, false, "contextmenu");
                let value59: Dynamic = contextActions(input.tid);
                value59.length !== 0 &&
                  value14({
                    ...OutlineGlyphsNativeEvent(event),
                    items: value59.map(OutlineGlyphsLabel),
                    get label() { return uiMessage("inspector.dcOutline.actions", { value1: String(uiNodeLabel(input)) }); },
                  });
              }}
              onMouseEnter={(): Dynamic => {
                onHover(value45 == null ? input.tid : null);
              }}
              data-testid={
                value45 == null
                  ? `dc-outline-${input.tid}`
                  : `dc-outline-in-${value45}-${input.tid}`
              }
              data-tag={input.tag}
              draggable={!!onMove && value45 == null && value9 !== input.tid}
              onDragStart={(event?: Dynamic): Dynamic => {
                if (value45 != null) {
                  event.preventDefault();
                  return;
                }
                value16(input.tid);
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setData("text/plain", String(input.tid));
              }}
              onDragEnd={(): Dynamic => {
                value16(null);
                value20(null);
              }}
              onDragOver={(event?: Dynamic): Dynamic => {
                if (
                  value45 != null ||
                  value15 == null ||
                  value15 === input.tid
                )
                  return;
                event.preventDefault();
                let bounds: Dynamic =
                    event.currentTarget.getBoundingClientRect(),
                  value59: Dynamic =
                    (event.clientY - bounds.top) / bounds.height,
                  value60: Dynamic =
                    value59 < 0.25
                      ? "before"
                      : value59 > 0.75
                        ? "after"
                        : "into";
                value20(
                  (input2?: Dynamic): Dynamic =>
                    input2?.tid === input.tid && input2.position === value60
                      ? input2
                      : {
                          tid: input.tid,
                          position: value60,
                        },
                );
              }}
              onDrop={(event?: Dynamic): Dynamic => {
                value45 == null &&
                  (event.preventDefault(),
                  value15 != null &&
                    value19 &&
                    value15 !== value19.tid &&
                    onMove?.(value15, value19.tid, value19.position),
                  value16(null),
                  value20(null));
              }}
            >
              {value48 ? (<Button
                  variant={"ghost"}
                  size={"xs"}
                  iconOnly={true}
                  tooltip={false}
                  aria-label={(value47 ? uiMessage("inspector.dcOutline.collapse") : uiMessage("inspector.dcOutline.expand")) + value55}
                  aria-expanded={value47}
                  tabIndex={-1}
                  className={"shrink-0"}
                  icon={
                    <Icon
                      name={"CaretRight"}
                      size={"xs"}
                      className={cn(
                        "text-muted transition-transform duration-fast",
                        value47 ? "rotate-90" : "rotate-0",
                      )}
                    />
                  }
                  onClick={(input2?: Dynamic): Dynamic => {
                    input2.stopPropagation();
                    callback2(value46, (input3?: Dynamic): Dynamic => {
                      let values: Dynamic = new Set(input3);
                      values.has(input.tid)
                        ? values.delete(input.tid)
                        : values.add(input.tid);
                      return values;
                    });
                  }}
                  onDoubleClick={(input2?: Dynamic): Dynamic =>
                    input2.stopPropagation()
                  }
                />) : (<span
                  aria-hidden={true}
                  className={"shrink-0"}
                  style={{
                    width: OutlineGlyphsConstant_6,
                  }}
                />)}
              {value56 ? (<OutlineIconGlyph
                  icon={value56}
                  dimmed={value53}
                  ink={
                    value54
                      ? OutlineGlyphsColorConfig.color
                      : undefined
                  }
                />) : (<OutlineElementGlyph dimmed={value53} />)}
              {value9 === input.tid && value45 == null ? (<TextInput
                  size={"sm"}
                  fullWidth={false}
                  className={"min-w-0 flex-1"}
                  aria-label={uiMessage("inspector.dcOutline.layerName")}
                  autoFocus={true}
                  value={value11}
                  placeholder={uiNodeLabel(input)}
                  onChange={(event?: Dynamic): Dynamic =>
                    value12(event.target.value)
                  }
                  onClick={(input2?: Dynamic): Dynamic =>
                    input2.stopPropagation()
                  }
                  onDoubleClick={(input2?: Dynamic): Dynamic =>
                    input2.stopPropagation()
                  }
                  onContextMenu={(input2?: Dynamic): Dynamic =>
                    input2.stopPropagation()
                  }
                  onFocus={(input2?: Dynamic): Dynamic =>
                    input2.currentTarget.select()
                  }
                  onBlur={(): Dynamic => value10(null)}
                  onKeyDown={(input2?: Dynamic): Dynamic => {
                    if (input2.key === "Enter") {
                      let value59: Dynamic = value11.trim();
                      value59
                        ? onRename?.(input.tid, value59)
                        : input.userLabel && onRename?.(input.tid, "");
                      value10(null);
                    } else input2.key === "Escape" && value10(null);
                    input2.stopPropagation();
                  }}
                />) : (<span
                  className={cn(
                    "min-w-0 flex-initial truncate",
                    OutlineGlyphsClassNames_3,
                    OutlineGlyphsScForScIfDcImportSet.has(
                      input.tag,
                    ) &&
                      !value54 &&
                      "italic",
                    value53 ? "opacity-50" : "opacity-100",
                  )}
                  style={
                    value54 ? OutlineGlyphsColorConfig : undefined
                  }
                  title={input.component?.ref}
                >
                  {uiNodeLabel(input)}
                </span>)}
              {value58 != null && (<Badge
                  variant={"neutral"}
                  size={"xxs"}
                  className={cn(
                    "ml-1.5 shrink-0",
                    value53 ? "opacity-50" : "opacity-100",
                  )}
                >
                  {value58}
                </Badge>)}
              {value9 !== input.tid && (<span
                  className={cn(
                    "mx-1.5 min-w-0 flex-auto shrink-[9999] truncate",
                    OutlineGlyphsClassNames_3,
                    !value54 && "text-muted",
                    value53
                      ? "opacity-50"
                      : value54
                        ? "opacity-60"
                        : "opacity-100",
                  )}
                  style={
                    value54 ? OutlineGlyphsColorConfig : undefined
                  }
                  title={input.component?.ref}
                >
                  {input.detail ?? ("")}
                </span>)}
              {!input.noHide && value45 == null && onToggleHidden && (<Button
                  variant={"ghost"}
                  size={"xs"}
                  iconOnly={true}
                  icon={
                    <Icon
                      name={input.hidden ? "EyeSlash" : "Eye"}
                      size={"xs"}
                      className={
                        "text-muted group-hover/eye:text-primary group-focus-visible/eye:text-primary"
                      }
                    />
                  }
                  aria-label={(input.hidden ? uiMessage("inspector.dcOutline.show2") : uiMessage("inspector.dcOutline.hide")) + value55}
                  tooltip={input.hidden ? (uiMessage("inspector.dcOutline.show")) : ("Hide")}
                  tabIndex={value49 === value42 ? 0 : -1}
                  className={cn(
                    "group/eye shrink-0",
                    input.hidden
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 focus-visible:opacity-100",
                  )}
                  onClick={(input2?: Dynamic): Dynamic => {
                    input2.stopPropagation();
                    onToggleHidden(input.tid, !input.hidden);
                  }}
                  onDoubleClick={(input2?: Dynamic): Dynamic =>
                    input2.stopPropagation()
                  }
                />)}
            </div>,
            value51 && value19?.position === "after" && (
              <div
                className={"h-0.5 rounded-[1px] bg-fill-accent"}
                style={{
                  marginLeft:
                    OutlineGlyphsConstant_4 +
                    options * OutlineGlyphsConstant_5 +
                    OutlineGlyphsConstant_6,
                }}
              />
            ),
            value47 &&
              value48 &&
              input.children.map(
                (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                  callback14(
                    input2,
                    options + 1,
                    {
                      index: options2,
                      count: input.children.length,
                    },
                    value45,
                  ),
              ),
          ],
        } as const;
        const _key = value45 == null ? input.tid : `${value45}:${input.tid}`;
        return <_Component key={_key} {..._props} />;
      })();
    },
    callback15: Dynamic = (input?: Dynamic, options?: Dynamic): Dynamic => {
      if (!artboards) return null;
      let value45: Dynamic = OutlineTreeHandler_2(input.id),
        value46: Dynamic = artboards.selectedObjects.has(input.id);
      return (() => {
        const _Component2 = "div";
        const _props2 = {
          role: "treeitem",
          "aria-level": 1,
          "aria-posinset": options + 1,
          "aria-setsize": artboards.objects.length + artboards.rows.length,
          "aria-selected": value46,
          "aria-label": input.detail
            ? `${uiNodeLabel(input)}, ${input.detail}`
            : uiNodeLabel(input),
          tabIndex: value45 === value42 ? 0 : -1,
          "data-row-key": value45,
          className: cn(
            OutlineGlyphsClassNames_2,
            value46
              ? OutlineGlyphsResolvedValue_2
              : OutlineGlyphsClassNames_4,
          ),
          style: {
            paddingLeft: OutlineGlyphsConstant_4,
          },
          onFocus: (event?: Dynamic): Dynamic => {
            event.target === event.currentTarget &&
              (callback3(value45), onHover(null));
          },
          onClick: (input2?: Dynamic): Dynamic => {
            let value47: Dynamic =
                input2.shiftKey || input2.metaKey || input2.ctrlKey,
              value48: Dynamic = value41.find(
                (input3?: Dynamic): Dynamic => input3.key === value45,
              );
            (input2.detail === 0 &&
              value48 &&
              callback12(value48, value47)) ||
              artboards.onSelectObject(input.id, value47);
          },
          onContextMenu: (event?: Dynamic): Dynamic => {
            if (!artboards.objectContextActions) return;
            event.preventDefault();
            let value47: Dynamic = artboards.objectContextActions(input.id);
            value47.length !== 0 &&
              value14({
                ...OutlineGlyphsNativeEvent(event),
                items: value47.map(OutlineGlyphsLabel),
                get label() { return uiMessage("inspector.dcOutline.actions", { value1: String(uiNodeLabel(input)) }); },
              });
          },
          onMouseEnter: (): Dynamic => onHover(null),
          "data-testid": `dc-outline-object-${input.id}`,
          children: [
            <span
              aria-hidden={true}
              className={"shrink-0"}
              style={{
                width: OutlineGlyphsConstant_6,
              }}
            />,
            <OutlineIconGlyph
              icon={ChromeToolIconsNoteTitleRectConfig[input.glyph]}
              dimmed={false}
            />,
            <span
              className={cn(
                "min-w-0 flex-initial truncate",
                OutlineGlyphsClassNames_3,
              )}
            >
              {uiNodeLabel(input)}
            </span>,
            <span
              className={cn(
                "mx-1.5 min-w-0 flex-auto shrink-[9999] truncate text-muted",
                OutlineGlyphsClassNames_3,
              )}
              title={input.detailTitle}
            >
              {input.detail ?? ("")}
            </span>,
          ],
        } as const;
        const _key2 = input.id;
        return <_Component2 key={_key2} {..._props2} />;
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
          ref={value29}
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
                  height: value,
                }
          }
          onKeyDown={callback13}
          onMouseLeave={(): Dynamic => onHover(null)}
          onPointerDown={callback7}
          onMouseDown={callback7}
          onFocus={(event?: Dynamic): Dynamic => {
            let ancestor: Dynamic = event.target.closest('[role="treeitem"]'),
              value45: Dynamic = ancestor?.getAttribute("data-row-key"),
              value46: Dynamic =
                value45 != null
                  ? value41.findIndex(
                      (input?: Dynamic): Dynamic => input.key === value45,
                    )
                  : -1;
            value45 != null &&
              value46 >= 0 &&
              (value44.current = {
                key: value45,
                index: value46,
              });
            if (ancestor != null) {
              let relatedTarget: Dynamic = event.relatedTarget,
                value47: Dynamic =
                  value35.current === event.target &&
                  (relatedTarget == null ||
                    !relatedTarget.isConnected ||
                    relatedTarget.closest(
                      OutlineGlyphsResolvedValue,
                    ) != null);
              value35.current = null;
              value34.current ? callback6(false) : value47 || callback6(true);
            }
          }}
          onBlur={(event?: Dynamic): Dynamic => {
            if (event.currentTarget.contains(event.relatedTarget)) return;
            let ownerDocument: Dynamic = event.currentTarget.ownerDocument,
              relatedTarget: Dynamic = event.relatedTarget;
            value35.current =
              !ownerDocument.hasFocus() ||
              hasBlockingOverlay(ownerDocument) ||
              relatedTarget?.closest(OutlineGlyphsResolvedValue) !=
                null
                ? event.target
                : null;
            value44.current = null;
            onHover(null);
          }}
          onScroll={(input?: Dynamic): Dynamic => {
            value30 &&
              !value31.current &&
              ((value30.current = input.currentTarget.scrollTop),
              (value32.current = false));
          }}
          data-testid={"dc-outline"}
        >
          {artboards?.objects.map(callback15)}
          {artboards ? (artboards.rows.map(
              (input?: Dynamic, options?: Dynamic): Dynamic => {
                let value45: Dynamic = input.file === artboards.focused,
                  value46: Dynamic = OutlineTreeHandler(
                    input.file,
                  ),
                  value47: Dynamic = value45
                    ? nodes
                    : artboards.trees[input.file],
                  value48: Dynamic = value47 != null && value47.length > 0,
                  value49: Dynamic =
                    value48 && artboards.open.has(input.file),
                  value50: Dynamic = artboards.cover === input.file,
                  value51: Dynamic =
                    artboards.components?.has(input.file) === true,
                  value52: Dynamic =
                    artboards.trees[input.file] === null
                      ? value3 + "-unreadable-" + String(options)
                      : undefined;
                return (() => {
                  const _Component3 = "div";
                  const _props3 = {
                    children: [
                      <div
                        role={"treeitem"}
                        aria-level={1}
                        aria-posinset={artboards.objects.length + options + 1}
                        aria-setsize={
                          artboards.objects.length + artboards.rows.length
                        }
                        aria-expanded={value48 ? value49 : undefined}
                        aria-selected={artboards.selected.has(input.file)}
                        aria-current={value45 || undefined}
                        aria-label={
                          uiNodeLabel(input) + (value51 ? uiMessage("inspector.dcOutline.component") : "") + (value50 ? uiMessage("inspector.dcOutline.thumbnail") : "")
                        }
                        aria-describedby={value52}
                        tabIndex={value46 === value42 ? 0 : -1}
                        data-row-key={value46}
                        className={cn(
                          OutlineGlyphsClassNames_2,
                          artboards.selected.has(input.file)
                            ? OutlineGlyphsResolvedValue_3
                            : OutlineGlyphsClassNames_4,
                        )}
                        style={{
                          paddingLeft: OutlineGlyphsConstant_4,
                        }}
                        onFocus={(event?: Dynamic): Dynamic => {
                          event.target === event.currentTarget &&
                            (callback3(value46), onHover(null));
                        }}
                        onClick={(input2?: Dynamic): Dynamic => {
                          let value53: Dynamic =
                              input2.shiftKey ||
                              input2.metaKey ||
                              input2.ctrlKey,
                            value54: Dynamic = value41.find(
                              (input3?: Dynamic): Dynamic =>
                                input3.key === value46,
                            );
                          (input2.detail === 0 &&
                            value54 &&
                            callback12(value54, value53)) ||
                            (value53
                              ? artboards.onToggleSelected(input.file)
                              : artboards.onFocus(input.file));
                        }}
                        onContextMenu={(event?: Dynamic): Dynamic => {
                          if (!artboards.contextActions) return;
                          event.preventDefault();
                          let value53: Dynamic = artboards.contextActions(
                            input.file,
                          );
                          value53.length !== 0 &&
                            value14({
                              ...OutlineGlyphsNativeEvent(event),
                              items: value53.map(OutlineGlyphsLabel),
                              get label() { return uiMessage("inspector.dcOutline.actions", { value1: String(uiNodeLabel(input)) }); },
                            });
                        }}
                        data-testid={`dc-outline-artboard-${input.file}`}
                      >
                        {value48 ? (<Button
                            variant={"ghost"}
                            size={"xs"}
                            iconOnly={true}
                            tooltip={false}
                            aria-label={
                              (value49 ? uiMessage("inspector.dcOutline.collapse") : uiMessage("inspector.dcOutline.expand")) + uiNodeLabel(input)
                            }
                            aria-expanded={value49}
                            tabIndex={-1}
                            className={"shrink-0"}
                            icon={
                              <Icon
                                name={"CaretRight"}
                                size={"xs"}
                                className={cn(
                                  "text-muted transition-transform duration-fast",
                                  value49 ? "rotate-90" : "rotate-0",
                                )}
                              />
                            }
                            onClick={(input2?: Dynamic): Dynamic => {
                              input2.stopPropagation();
                              artboards.onToggleOpen(input.file, !value49);
                            }}
                            onDoubleClick={(input2?: Dynamic): Dynamic =>
                              input2.stopPropagation()
                            }
                          />) : (<span
                            aria-hidden={true}
                            className={"shrink-0"}
                            style={{
                              width: OutlineGlyphsConstant_6,
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
                              value51
                                ? OutlineGlyphsColorConfig.color
                                : undefined
                            }
                          />
                          {artboards.renaming === input.file ? (<OutlineRenameInput
                              label={uiNodeLabel(input)}
                              onDone={(
                                input2?: Dynamic,
                                options2?: Dynamic,
                              ): Dynamic => {
                                artboards.onRename?.(input.file, input2);
                                options2 &&
                                  callback4(value46)?.focus({
                                    preventScroll: true,
                                  });
                              }}
                            />) : (<span
                              className={cn(
                                "min-w-0 flex-auto truncate",
                                OutlineGlyphsClassNames_3,
                              )}
                              style={
                                value51
                                  ? OutlineGlyphsColorConfig
                                  : undefined
                              }
                            >
                              {uiNodeLabel(input)}
                            </span>)}
                          {value50 && artboards.renaming !== input.file && (<Icon
                              name={"Image"}
                              size={"xs"}
                              data-testid={"dc-outline-cover"}
                              className={cn(
                                "mx-1.5 shrink-0 text-muted",
                                OutlineGlyphsClassNames_3,
                              )}
                            />)}
                          {value52 != null && (<span id={value52} hidden={true}>
                              {CanTReadThisArtboardSFileAskMessage}
                            </span>)}
                        </div>
                      </div>,
                      value49 &&
                        value47.map(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            callback14(
                              input2,
                              1,
                              {
                                index: options2,
                                count: value47.length,
                              },
                              value45 ? null : input.file,
                            ),
                        ),
                    ],
                  } as const;
                  const _key3 = input.file;
                  return <_Component3 key={_key3} {..._props3} />;
                })();
              },
            )) : (nodes.length === 0 ? (<div className={"px-3.5 py-2.5 text-caption text-muted"}>
              {uiMessage("inspector.dcOutline.noElementsYet")}
            </div>) : (nodes.map(
              (input?: Dynamic, options?: Dynamic): Dynamic =>
                callback14(input, 0, {
                  index: options,
                  count: nodes.length,
                }),
            )))}
          <FloatingScrollbar />
        </div>
      </DeferredTooltipProvider>
      {!fill && (<ComponentsSelectionPointsComponent
          side={"bottom"}
          aria-label={uiMessage("inspector.dcOutline.resizeLayersList")}
          aria-valuenow={value}
          aria-valuemin={OutlineGlyphsConstant}
          aria-valuemax={OutlineGlyphsConstant_2}
          className={"z-10 [--cds-ring-inner:1px] [--cds-ring-outer:0px]"}
          onResizeStart={(): Dynamic => {
            value40.current = value;
          }}
          onResize={callback9}
          onKeyDown={(input?: Dynamic): Dynamic => {
            (input.key.startsWith("Arrow") ||
              input.key === "Enter" ||
              input.key === " ") &&
              input.stopPropagation();
          }}
        />)}
      <EditorMenu
        at={value13}
        onClose={(): Dynamic => value14(null)}
        items={value13?.items ?? []}
        minWidth={180}
        label={value13?.label}
        focusFirstItem={value13?.keyboard}
        owner={OutlineValue}
      />
    </CdsIsland>
  );
}
export {
  DcOutline,
  nativeContextMenuTimeout,
  OutlineDcOutlineConstant,
  OutlineDcOutlineConstant_2,
  OutlineDcOutlineHandler,
  OutlineDcOutlineRemoveEventListener,
  OutlineDcOutlineTarget,
};
export function set_nativeContextMenuTimeout(value: any): any {
  nativeContextMenuTimeout = value;
  return value;
}
export function installEditorOutlineDcOutline(): () => void {
  return () => {
    initializePlatformCdsIsland();
    OutlineDcOutlineConstant = 500;
    OutlineDcOutlineConstant_2 = 3e4;
    OutlineDcOutlineHandler = (input?: Dynamic): Dynamic =>
      input?.closest?.(
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
