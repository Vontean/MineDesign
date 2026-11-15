import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactCanvasMeasurements } from "../../canvas/measurements";
import { CdsRoot } from "../../cds/theme/root";
import { TooltipGroup } from "../../cds/tooltip/tooltip";
import { joinClassNames } from "../chrome/overlay-state";
import { jsxToolbarLayout, toolbarDensity, ToolbarLayoutConstant, ToolbarLayoutConstant_2, ToolbarLayoutLimit, updateToolbarEmptySlots, updateToolbarPinnedWords, useTouchToolbar } from "./layout";
import { ToolbarPrimitivesComponent, ToolbarPrimitivesContext, ToolbarPrimitivesContext_2 } from "./primitives";
import { ToolbarPublishControls, ToolbarSurface } from "./publish-controls";
import { ToolbarSaveFailure, ToolbarSaveStatus } from "./save-status";
import { ToolbarScroller } from "./scroller";
import { hostDrawsReadOnly, subscribeHostChrome } from "../../platform/frame-host-bridge";

function EditorToolbar({
  title: title,
  saveState: saveState,
  saveMode = "manual",
  syncDot = false,
  onSave: onSave,
  undo: undo,
  publishControls = true,
  pinned: pinned,
  trailing: trailing,
  leading: leading,
  afterUndo: afterUndo,
  undoButtons = true,
  density = "compact",
  touchTargets: touchTargets,
  readOnly: readOnly,
  quietReadOnlyReason: quietReadOnlyReason,
  variant = "docked",
  children: children,
  extrasEnd: extrasEnd,
}: Dynamic): Dynamic {
  useUiLocale();
  let [, value]: Dynamic = (0, reactCanvasMeasurements.useState)(0);
  (0, reactCanvasMeasurements.useEffect)(
    (): Dynamic =>
      undo?.subscribe(
        (): Dynamic => value((input?: Dynamic): Dynamic => input + 1),
      ),
    [undo],
  );
  let value2: Dynamic = readOnly === true || saveState.status === "readonly",
    value3: Dynamic = (0,
    reactCanvasMeasurements.useSyncExternalStore)(
      subscribeHostChrome,
      hostDrawsReadOnly,
      (): Dynamic => false,
    ),
    value4: Dynamic = (0, toolbarDensity)(density),
    value5: Dynamic = touchTargets === "square" ? value4 : density,
    value6: Dynamic = (0, reactCanvasMeasurements.useRef)(null),
    [value7, value8]: Dynamic = (0, reactCanvasMeasurements.useState)(
      false,
    ),
    [value9, value10]: Dynamic = (0,
    reactCanvasMeasurements.useState)(false),
    value11: Dynamic = (0, useTouchToolbar)(),
    value12: Dynamic = variant === "floating";
  (0, reactCanvasMeasurements.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = value6.current;
    if (!current) return;
    let callback: Dynamic = (): Dynamic => {
        let value14: Dynamic = getComputedStyle(current),
          value15: Dynamic =
            current.clientWidth -
            parseFloat(value14.paddingLeft || "0") -
            parseFloat(value14.paddingRight || "0");
        value8(
          current.clientWidth > 0 && value15 <= ToolbarLayoutLimit,
        );
        value10(
          current.clientWidth > 0 &&
            value15 <=
              (value11
                ? ToolbarLayoutConstant_2
                : ToolbarLayoutConstant),
        );
        value12 &&
          (current.parentElement?.style.setProperty(
            "--tb-overlay-h",
            String(current.offsetHeight) + "px",
          ),
          ancestor?.style.setProperty(
            "--tb-row-h",
            String(current.offsetHeight) + "px",
          ));
      },
      ancestor: Dynamic = current.closest("[data-mc-paned]"),
      value13: Dynamic =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(callback)
          : null;
    value13?.observe(current);
    callback();
    return (): Dynamic => {
      value13?.disconnect();
      ancestor?.style.removeProperty("--tb-row-h");
      current.parentElement?.style.removeProperty("--tb-overlay-h");
    };
  }, [value11, value12]);
  (0, reactCanvasMeasurements.useLayoutEffect)((): Dynamic => {
    value6.current &&
      ((0, updateToolbarEmptySlots)(value6.current),
      (0, updateToolbarPinnedWords)(value6.current));
  });
  (0, reactCanvasMeasurements.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = value6.current;
    if (!current || typeof MutationObserver === "undefined") return;
    let index: Dynamic = 0,
      observer: Dynamic = new MutationObserver((): Dynamic => {
        cancelAnimationFrame(index);
        index = requestAnimationFrame((): Dynamic => {
          (0, updateToolbarEmptySlots)(current);
          (0, updateToolbarPinnedWords)(current);
        });
      });
    observer.observe(current, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true,
      attributeFilter: [
        "hidden",
        "aria-hidden",
        "data-quiet",
        "data-pin-fixed",
      ],
    });
    return (): Dynamic => {
      observer.disconnect();
      cancelAnimationFrame(index);
    };
  }, []);
  return (
    <CdsRoot
      density={value5}
      render={
        <header
          ref={value6}
          data-collapsed={value7 ? "" : undefined}
          data-pin-fixed={value9 ? "" : undefined}
          data-touch-targets={touchTargets}
          data-tb-overlay={value12 ? "" : undefined}
          className={(0, joinClassNames)(
            "tb-root flex shrink-0 items-center",
            value12
              ? "absolute inset-x-0 top-0 z-toolbar"
              : "h-10 gap-1 px-1 shadow-[inset_0_-1px_0_0_var(--t-border)] pointer-coarse:h-12 pointer-coarse:gap-1.5 pointer-coarse:px-2",
          )}
        />
      }
    >
      <TooltipGroup>
        <ToolbarPrimitivesContext.Provider value={value7}>
          <ToolbarPrimitivesContext_2.Provider value={value2}>
            <ToolbarSurface
              floating={value12}
              className={"tb-card tb-card-start flex min-w-0 items-center"}
            >
              <ToolbarScroller
                revealLeading={
                  (saveState.status === "readonly" && !value3) ||
                  (saveState.status === "error" && !syncDot)
                    ? saveState.status
                    : undefined
                }
                leading={
                  <jsxToolbarLayout.Fragment>
                    {leading}
                    {undo && !value2 && undoButtons ? (<jsxToolbarLayout.Fragment>
                        <ToolbarPrimitivesComponent
                          iconOnly={true}
                          icon={"ArrowCounterClockwise"}
                          label={uiMessage("inspector.toolbar.undo")}
                          disabledTip={"Nothing to undo yet"}
                          shortcut={"cmd+z"}
                          disabled={!undo.canUndo()}
                          onClick={(): Dynamic => undo.undo()}
                        />
                        <ToolbarPrimitivesComponent
                          iconOnly={true}
                          icon={"ArrowClockwise"}
                          label={uiMessage("inspector.toolbar.redo")}
                          disabledTip={"Nothing to redo"}
                          shortcut={"shift+cmd+z"}
                          disabled={!undo.canRedo()}
                          onClick={(): Dynamic => undo.redo()}
                        />
                      </jsxToolbarLayout.Fragment>) : (null)}
                    {afterUndo}
                    {saveState.status === "readonly" &&
                    quietReadOnlyReason !== undefined &&
                    saveState.message ===
                      quietReadOnlyReason ? (null) : (syncDot ? (saveState.status === "readonly" ? (<ToolbarSaveFailure state={saveState} />) : (null)) : (saveMode === "auto" ? (<ToolbarSaveStatus state={saveState} />) : (<ToolbarSaveFailure state={saveState} />)))}
                  </jsxToolbarLayout.Fragment>
                }
              >
                {children}
              </ToolbarScroller>
            </ToolbarSurface>
            <ToolbarSurface
              floating={value12}
              className={
                "tb-card tb-card-end ml-auto flex items-center gap-1 pointer-coarse:gap-1.5"
              }
            >
              {extrasEnd != null ? (<span
                  data-tb-cluster={""}
                  className={
                    "tb-slot flex shrink-0 items-center gap-1 pointer-coarse:gap-1.5"
                  }
                >
                  {extrasEnd}
                </span>) : (null)}
              {(pinned != null && value9) || trailing != null ? (<span
                  className={
                    "tb-tail flex items-center gap-1 pointer-coarse:gap-1.5"
                  }
                >
                  {pinned != null && value9 ? (<span
                      data-tb-cluster={""}
                      className={
                        "tb-pin-fixed flex shrink-0 items-center gap-1 empty:hidden pointer-coarse:gap-1.5"
                      }
                    >
                      {pinned}
                    </span>) : (null)}
                  {trailing != null ? (<span
                      data-tb-cluster={""}
                      className={
                        "tb-slot flex items-center gap-1 pointer-coarse:gap-1.5"
                      }
                    >
                      {trailing}
                    </span>) : (null)}
                </span>) : (null)}
              {publishControls ? (<span
                  className={
                    "tb-publish flex shrink-0 items-center gap-1 pointer-coarse:gap-1.5"
                  }
                >
                  <ToolbarPublishControls
                    saveState={saveState}
                    saveMode={saveMode}
                    syncDot={syncDot}
                    onSave={onSave}
                  />
                </span>) : (null)}
            </ToolbarSurface>
          </ToolbarPrimitivesContext_2.Provider>
        </ToolbarPrimitivesContext.Provider>
      </TooltipGroup>
    </CdsRoot>
  );
}
export {
  EditorToolbar,
};
export function installEditorToolbarToolbar(): () => void {
  return () => {};
}
