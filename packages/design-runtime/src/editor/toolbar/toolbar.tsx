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
import { jsxToolbarLayout, toolbarDensity, ToolbarLayoutConstant, touchPinWidthThreshold, ToolbarLayoutLimit, updateToolbarEmptySlots, updateToolbarPinnedWords, useTouchToolbar } from "./layout";
import { ToolbarPrimitivesComponent, ToolbarPrimitivesContext, toolbarReadOnlyContext } from "./primitives";
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
        (): Dynamic => value((increment?: Dynamic): Dynamic => increment + 1),
      ),
    [undo],
  );
  let isReadOnly: Dynamic = readOnly === true || saveState.status === "readonly",
    hostReadOnly: Dynamic = (0,
    reactCanvasMeasurements.useSyncExternalStore)(
      subscribeHostChrome,
      hostDrawsReadOnly,
      (): Dynamic => false,
    ),
    toolbarSize: Dynamic = toolbarDensity(density),
    resolvedDensity: Dynamic = touchTargets === "square" ? toolbarSize : density,
    toolbarRef: Dynamic = (0, reactCanvasMeasurements.useRef)(null),
    [isCollapsed, setCollapsed]: Dynamic = (0, reactCanvasMeasurements.useState)(
      false,
    ),
    [isPinnedFixed, setPinnedFixed]: Dynamic = (0,
    reactCanvasMeasurements.useState)(false),
    isTouchToolbar: Dynamic = useTouchToolbar(),
    isFloating: Dynamic = variant === "floating";
  (0, reactCanvasMeasurements.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = toolbarRef.current;
    if (!current) return;
    let callback: Dynamic = (): Dynamic => {
        let computedStyle: Dynamic = getComputedStyle(current),
          contentWidth: Dynamic =
            current.clientWidth -
            parseFloat(computedStyle.paddingLeft || "0") -
            parseFloat(computedStyle.paddingRight || "0");
        setCollapsed(
          current.clientWidth > 0 && contentWidth <= ToolbarLayoutLimit,
        );
        setPinnedFixed(
          current.clientWidth > 0 &&
            contentWidth <=
              (isTouchToolbar
                ? touchPinWidthThreshold
                : ToolbarLayoutConstant),
        );
        isFloating &&
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
      resizeObserver: Dynamic =
        typeof ResizeObserver !== "undefined"
          ? new ResizeObserver(callback)
          : null;
    resizeObserver?.observe(current);
    callback();
    return (): Dynamic => {
      resizeObserver?.disconnect();
      ancestor?.style.removeProperty("--tb-row-h");
      current.parentElement?.style.removeProperty("--tb-overlay-h");
    };
  }, [isTouchToolbar, isFloating]);
  (0, reactCanvasMeasurements.useLayoutEffect)((): Dynamic => {
    toolbarRef.current &&
      (updateToolbarEmptySlots(toolbarRef.current),
      updateToolbarPinnedWords(toolbarRef.current));
  });
  (0, reactCanvasMeasurements.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = toolbarRef.current;
    if (!current || typeof MutationObserver === "undefined") return;
    let index: Dynamic = 0,
      observer: Dynamic = new MutationObserver((): Dynamic => {
        cancelAnimationFrame(index);
        index = requestAnimationFrame((): Dynamic => {
          updateToolbarEmptySlots(current);
          updateToolbarPinnedWords(current);
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
      density={resolvedDensity}
      render={
        <header
          ref={toolbarRef}
          data-collapsed={isCollapsed ? "" : undefined}
          data-pin-fixed={isPinnedFixed ? "" : undefined}
          data-touch-targets={touchTargets}
          data-tb-overlay={isFloating ? "" : undefined}
          className={joinClassNames(
            "tb-root flex shrink-0 items-center",
            isFloating
              ? "absolute inset-x-0 top-0 z-toolbar"
              : "h-10 gap-1 px-1 shadow-[inset_0_-1px_0_0_var(--t-border)] pointer-coarse:h-12 pointer-coarse:gap-1.5 pointer-coarse:px-2",
          )}
        />
      }
    >
      <TooltipGroup>
        <ToolbarPrimitivesContext.Provider value={isCollapsed}>
          <toolbarReadOnlyContext.Provider value={isReadOnly}>
            <ToolbarSurface
              floating={isFloating}
              className={"tb-card tb-card-start flex min-w-0 items-center"}
            >
              <ToolbarScroller
                revealLeading={
                  (saveState.status === "readonly" && !hostReadOnly) ||
                  (saveState.status === "error" && !syncDot)
                    ? saveState.status
                    : undefined
                }
                leading={
                  <jsxToolbarLayout.Fragment>
                    {leading}
                    {undo && !isReadOnly && undoButtons ? (<jsxToolbarLayout.Fragment>
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
              floating={isFloating}
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
              {(pinned != null && isPinnedFixed) || trailing != null ? (<span
                  className={
                    "tb-tail flex items-center gap-1 pointer-coarse:gap-1.5"
                  }
                >
                  {pinned != null && isPinnedFixed ? (<span
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
          </toolbarReadOnlyContext.Provider>
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
