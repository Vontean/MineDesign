import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { cn } from "../../cds/theme/class-names";
import { load_react, load_react_jsx_runtime, npm_useMediaQuery_Wpt } from "../../dependencies";
import { ChromeScrollbarLabel, FloatingScrollbar } from "./scrollbar";
import { reactCodeInspectorCodePanel } from "../code/inspector-code-panel";
import { toModuleNamespace } from "../../module-helpers";

var jsxChromeInspectorSheet: Dynamic;
var ChromeInspectorSheetMediaQuery: Dynamic;
var ChromeInspectorSheetConstant: Dynamic;
var panelInsetPx: Dynamic;
var reactChromeInspectorSheet: Dynamic;
function clampInspectorSheetTop(
  topPx?: Dynamic,
  sheetHeightPx?: Dynamic,
  viewportHeightPx?: Dynamic,
): Dynamic {
  return Math.max(0, Math.min(topPx, viewportHeightPx - sheetHeightPx - 12));
}
function inspectorKeyboardHeightState(
  previousKeyboardInset?: Dynamic,
  keyboardInset?: Dynamic,
  currentHeightPx?: Dynamic,
  storedPreKeyboardPx?: Dynamic,
  heightLimits?: Dynamic,
): Dynamic {
  return previousKeyboardInset <= 0 && keyboardInset > 0
    ? currentHeightPx == null
      ? {
          heldPx: clampInspectorSheetHeight(heightLimits.snapPx, heightLimits),
          storedPreKeyboardPx: "auto",
        }
      : {
          heldPx: clampInspectorSheetHeight(currentHeightPx, heightLimits),
          storedPreKeyboardPx: currentHeightPx,
        }
    : currentHeightPx == null
      ? {
          heldPx: currentHeightPx,
          storedPreKeyboardPx: storedPreKeyboardPx,
        }
      : previousKeyboardInset > 0 && keyboardInset <= 0
        ? storedPreKeyboardPx === "auto"
          ? {
              heldPx: null,
              storedPreKeyboardPx: null,
            }
          : {
              heldPx: clampInspectorSheetHeight(storedPreKeyboardPx ?? currentHeightPx, heightLimits),
              storedPreKeyboardPx: null,
            }
        : {
            heldPx: clampInspectorSheetHeight(currentHeightPx, heightLimits),
            storedPreKeyboardPx: storedPreKeyboardPx,
          };
}
function inspectorSheetHeightLimits(
  viewportHeight?: Dynamic,
  keyboardInset: Dynamic = 0,
  bottomPadding: Dynamic = 0,
): Dynamic {
  let snapHeight: Dynamic = Math.round(viewportHeight * 0.47);
  return {
    snapPx: snapHeight,
    floorPx: Math.max(90, Math.min(90 + bottomPadding, snapHeight)),
    ceilingPx: Math.max(
      keyboardInset > 0 ? 90 : Math.round(viewportHeight * 0.47),
      viewportHeight - keyboardInset - 12,
    ),
  };
}
function clampInspectorSheetHeight(
  heightPx?: Dynamic,
  limits?: Dynamic,
): Dynamic {
  return Math.min(limits.ceilingPx, Math.max(limits.floorPx, heightPx));
}
function inspectorSheetTop(
  viewportHeight?: Dynamic,
  visualHeight?: Dynamic,
  offsetTop?: Dynamic,
  scale?: Dynamic,
): Dynamic {
  return Math.max(0, Math.round(viewportHeight - (visualHeight * scale + offsetTop)));
}
function useInspectorSheetHeight(isSheetActive?: Dynamic): Dynamic {
  let [heightPx, setHeightPx]: Dynamic = (0,
    reactCodeInspectorCodePanel.useState)(undefined),
    [isDragging, setIsDragging]: Dynamic = (0,
    reactCodeInspectorCodePanel.useState)(false),
    [keyboardInset, setKeyboardInset]: Dynamic = (0,
    reactCodeInspectorCodePanel.useState)(0),
    sheetRef: Dynamic = (0, reactCodeInspectorCodePanel.useRef)(null),
    lastParentHeightRef: Dynamic = (0, reactCodeInspectorCodePanel.useRef)(0),
    previousKeyboardInsetRef: Dynamic = (0, reactCodeInspectorCodePanel.useRef)(0),
    storedPreKeyboardRef: Dynamic = (0, reactCodeInspectorCodePanel.useRef)(null),
    keyboardInsetRef: Dynamic = (0, reactCodeInspectorCodePanel.useRef)(0),
    getParentHeight: Dynamic = (0,
    reactCodeInspectorCodePanel.useCallback)((): Dynamic => {
      let measuredHeight: Dynamic =
        sheetRef.current?.closest("[data-posture]")?.offsetParent
          ?.clientHeight ?? 0;
      measuredHeight > 0 && (lastParentHeightRef.current = measuredHeight);
      return lastParentHeightRef.current || (window as Dynamic).innerHeight;
    }, []),
    getHeightLimits: Dynamic = (0,
    reactCodeInspectorCodePanel.useCallback)((): Dynamic => {
      let postureElement: Dynamic = sheetRef.current?.closest("[data-posture]"),
        bottomPadding: Dynamic = Math.round(
          parseFloat(
            postureElement?.ownerDocument.defaultView?.getComputedStyle(postureElement)
              .paddingBottom ?? "",
          ) || 0,
        );
      return inspectorSheetHeightLimits(getParentHeight(), keyboardInsetRef.current, bottomPadding);
    }, [getParentHeight]);
  (0, reactCodeInspectorCodePanel.useEffect)((): Dynamic => {
    isSheetActive ||
      (setHeightPx(undefined), (storedPreKeyboardRef.current = null), (previousKeyboardInsetRef.current = 0));
  }, [isSheetActive]);
  (0, reactCodeInspectorCodePanel.useEffect)((): Dynamic => {
    if (!isSheetActive) return;
    let handleResize: Dynamic = (): Dynamic => {
      let limits: Dynamic = getHeightLimits();
      setHeightPx(
        (currentHeight?: Dynamic): Dynamic =>
          currentHeight == null
            ? currentHeight
            : clampInspectorSheetHeight(currentHeight, limits),
      );
    };
    (window as Dynamic).addEventListener("resize", handleResize);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("resize", handleResize);
  }, [isSheetActive, getHeightLimits]);
  (0, reactCodeInspectorCodePanel.useEffect)((): Dynamic => {
    if (!isSheetActive) return;
    let current: Dynamic = previousKeyboardInsetRef.current;
    previousKeyboardInsetRef.current = keyboardInset;
    if (current === keyboardInset) return;
    let nextState: Dynamic = inspectorKeyboardHeightState(
      current,
      keyboardInset,
      heightPx ?? null,
      storedPreKeyboardRef.current,
      getHeightLimits(),
    );
    storedPreKeyboardRef.current = nextState.storedPreKeyboardPx;
    setHeightPx(nextState.heldPx ?? undefined);
  }, [isSheetActive, keyboardInset, getHeightLimits]);
  (0, reactCodeInspectorCodePanel.useEffect)((): Dynamic => {
    if (!isSheetActive) return;
    let visualViewport: Dynamic = (window as Dynamic).visualViewport;
    if (!visualViewport) return;
    let handleViewportChange: Dynamic = (): Dynamic => {
      let inset: Dynamic = inspectorSheetTop(
        (window as Dynamic).innerHeight,
        visualViewport.height,
        visualViewport.offsetTop,
        visualViewport.scale,
      );
      keyboardInsetRef.current = inset;
      setKeyboardInset(inset);
    };
    handleViewportChange();
    visualViewport.addEventListener("resize", handleViewportChange);
    visualViewport.addEventListener("scroll", handleViewportChange);
    return (): Dynamic => {
      visualViewport.removeEventListener("resize", handleViewportChange);
      visualViewport.removeEventListener("scroll", handleViewportChange);
      setKeyboardInset(0);
    };
  }, [isSheetActive]);
  let dragStateRef: Dynamic = (0, reactCodeInspectorCodePanel.useRef)(
      null,
    ),
    handlePointerDown: Dynamic = (0, reactCodeInspectorCodePanel.useCallback)(
      (event?: Dynamic): Dynamic => {
        if (!isSheetActive) return;
        let initialLimits: Dynamic = getHeightLimits(),
          startHeight: Dynamic = heightPx ?? initialLimits.snapPx;
        dragStateRef.current = {
          startY: event.clientY,
          startH: startHeight,
        };
        setIsDragging(true);
        let currentTarget: Dynamic = event.currentTarget;
        currentTarget.setPointerCapture(event.pointerId);
        let handlePointerMove: Dynamic = (moveEvent?: Dynamic): Dynamic => {
            let current: Dynamic = dragStateRef.current;
            if (!current) return;
            let nextHeight: Dynamic = clampInspectorSheetHeight(
              current.startH + (current.startY - moveEvent.clientY),
              getHeightLimits(),
            );
            current.lastH = nextHeight;
            setHeightPx(nextHeight);
          },
          handlePointerEnd: Dynamic = (endEvent?: Dynamic): Dynamic => {
            let current: Dynamic = dragStateRef.current;
            dragStateRef.current = null;
            setIsDragging(false);
            currentTarget.removeEventListener("pointermove", handlePointerMove);
            currentTarget.removeEventListener("pointerup", handlePointerEnd);
            currentTarget.removeEventListener("pointercancel", handlePointerEnd);
            if (!current) return;
            let limits: Dynamic = getHeightLimits(),
              finalHeight: Dynamic = clampInspectorSheetHeight(
                current.lastH ?? current.startH,
                limits,
              );
            keyboardInsetRef.current > 0 && (storedPreKeyboardRef.current = finalHeight);
            setHeightPx(finalHeight);
          };
        currentTarget.addEventListener("pointermove", handlePointerMove);
        currentTarget.addEventListener("pointerup", handlePointerEnd);
        currentTarget.addEventListener("pointercancel", handlePointerEnd);
      },
      [isSheetActive, getHeightLimits, heightPx],
    ),
    setSheetRef: Dynamic = (0, reactCodeInspectorCodePanel.useCallback)(
      (element?: Dynamic): Dynamic => {
        sheetRef.current = element;
      },
      [],
    );
  return (0, reactCodeInspectorCodePanel.useMemo)(
    (): Dynamic => ({
      heightPx: isSheetActive ? heightPx : undefined,
      dragging: isDragging,
      keyboardInset: ((): Dynamic => {
        if (!isSheetActive) return 0;
        let parentHeight: Dynamic = getParentHeight();
        return clampInspectorSheetTop(
          keyboardInset,
          heightPx ?? inspectorSheetHeightLimits(parentHeight, keyboardInset).ceilingPx,
          parentHeight,
        );
      })(),
      handleProps: {
        onPointerDown: handlePointerDown,
        style: {
          touchAction: "none",
        },
      },
      contentProps: {
        ref: setSheetRef,
      },
    }),
    [isSheetActive, isDragging, heightPx, keyboardInset, handlePointerDown, setSheetRef],
  );
}
function useInspectorPosture(): Dynamic {
  return npm_useMediaQuery_Wpt(ChromeInspectorSheetMediaQuery)
    ? "sheet"
    : "wide";
}
function inspectorShellStyle(
  posture?: Dynamic,
  isFilled?: Dynamic,
  heightPx?: Dynamic,
): Dynamic {
  return posture === "wide"
    ? {
        container: cn(
          "absolute z-20 flex flex-col overflow-hidden rounded-xl",
          "border bg-surface-2 shadow-lg",
        ),
        style: {
          top: panelInsetPx,
          right: panelInsetPx,
          width: ChromeInspectorSheetConstant,
          maxHeight: `calc(100% - ${panelInsetPx * 2}px)`,
        },
        contentClass: cn(
          "min-h-0 overflow-y-auto border-t",
          ChromeScrollbarLabel,
        ),
        showHandle: false,
      }
    : {
        container: cn(
          "relative z-20 flex w-full flex-col",
          "border-t bg-surface-panel",
          "pb-[var(--mc-foot-inset,0px)]",
        ),
        style: {
          height: isFilled
            ? heightPx != null
              ? `${heightPx}px`
              : `calc((100dvh - 68px) * ${0.47})`
            : undefined,
        },
        contentClass: cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto",
          ChromeScrollbarLabel,
        ),
        showHandle: isFilled,
      };
}
function InspectorPanelShell({
  posture: posture,
  filled: filled,
  headerRow: headerRow,
  headerAt = "bottom",
  children: children,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  let sheetState: Dynamic = useInspectorSheetHeight(posture === "sheet" && filled),
    shellStyle: Dynamic = inspectorShellStyle(posture, filled, sheetState.heightPx),
    transitionClass: Dynamic =
      posture === "sheet" && !sheetState.dragging
        ? "transition-[height,transform] duration-200 ease-out motion-reduce:transition-none"
        : undefined,
    content: Dynamic = filled ? (
      <div
        data-testid={"dc-anchored-content"}
        ref={posture === "sheet" ? sheetState.contentProps.ref : undefined}
        className={cn(
          shellStyle.contentClass,
          "pb-3 select-none [&_input]:select-text [&_textarea]:select-text [--pp-label-w:88px]",
        )}
      >
        {children}
        <FloatingScrollbar />
      </div>
    ) : null;
  return (
    <div
      data-testid={dataTestid}
      data-posture={posture}
      className={cn(shellStyle.container, transitionClass)}
      style={{
        ...shellStyle.style,
        ...(sheetState.keyboardInset > 0
          ? {
              transform: `translateY(-${sheetState.keyboardInset}px)`,
              paddingBottom: `max(0px, calc(var(--mc-foot-inset, 0px) - ${sheetState.keyboardInset}px))`,
            }
          : null),
      }}
    >
      {posture === "wide" ? (<jsxChromeInspectorSheet.Fragment>
          {headerRow && (<div className={"shrink-0"}>{headerRow}</div>)}
          {content}
        </jsxChromeInspectorSheet.Fragment>) : (<jsxChromeInspectorSheet.Fragment>
          {shellStyle.showHandle && (<div
              data-testid={"dc-sheet-handle"}
              className={
                "absolute inset-x-0 -top-1.5 z-10 h-3 cursor-row-resize touch-none"
              }
              onPointerDown={sheetState.handleProps.onPointerDown}
              style={sheetState.handleProps.style}
            >
              <span
                aria-hidden={"true"}
                className={
                  "absolute top-0 left-1/2 hidden h-10 w-24 -translate-x-1/2 pointer-coarse:block"
                }
              />
            </div>)}
          {headerRow != null && headerAt === "top" && (<div className={"shrink-0 border-b"}>{headerRow}</div>)}
          {content}
          {headerRow && headerAt === "bottom" && (<div
              className={cn("shrink-0", filled && "border-t")}
            >
              {headerRow}
            </div>)}
        </jsxChromeInspectorSheet.Fragment>)}
    </div>
  );
}
export {
  ChromeInspectorSheetConstant,
  panelInsetPx,
  ChromeInspectorSheetMediaQuery,
  clampInspectorSheetHeight,
  clampInspectorSheetTop,
  inspectorKeyboardHeightState,
  InspectorPanelShell,
  inspectorSheetHeightLimits,
  inspectorSheetTop,
  inspectorShellStyle,
  jsxChromeInspectorSheet,
  reactChromeInspectorSheet,
  useInspectorPosture,
  useInspectorSheetHeight,
};
export function installEditorChromeInspectorSheet(): () => void {
  return () => {
    jsxChromeInspectorSheet = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromeInspectorSheetMediaQuery = "(max-width: 599px)";
    ChromeInspectorSheetConstant = 257;
    panelInsetPx = 12;
    reactChromeInspectorSheet = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
  };
}
