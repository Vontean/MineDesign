import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactDomNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { OPEN_OVERLAY_SELECTOR } from "../platform/frame-chrome";
import { Tooltip } from "./avatars";
import { Button } from "./buttons";
import { TooltipWrapper } from "./color/gradient-stops";
import { Icon } from "./interactions";
import { CdsRoot } from "./overlays";
import { hasOpenOverlay } from "./property-focus";
import { joinClassNames } from "./property-icons";
import { DEFAULT_CLOSE_LABEL } from "./property-labels";
import { ResizeHandle } from "./segmented-control";
import { COARSE_POINTER_QUERY } from "./select";
import { Tabs } from "./tabs";

var reactForUiSidePanels: typeof import("react");
var reactDomSidePanels: typeof import("react-dom");
var reactPanelHeader: typeof import("react");
var jsxForUiSidePanels: typeof import("react/jsx-runtime");
var PANEL_HEADER_CLASS: string;
var SidePanelJsx: typeof import("react/jsx-runtime");
var PanelIconButton: React.ForwardRefExoticComponent<
  import("../contracts/controls").ButtonProps &
    React.RefAttributes<HTMLButtonElement>
>;
var SidePanelContext: React.Context<Color.SidePanelState | null>;
var SidePanelHostContext: React.Context<Color.SidePanelHostState | null>;
var PANEL_STORAGE_PREFIX: string;
var isFinitePanelNumber: (value: unknown) => value is number;
var isPanelDockMode: (value: unknown) => value is Color.PanelDockMode;
var isPanelPosition: (value: unknown) => value is Color.PanelPosition;
var MIN_PANEL_WIDTH: number;
var NON_TEXT_INPUT_TYPES: RegExp;
var approximatelyEqualPanelSize: (left: number, right: number) => boolean;
var MIN_PANEL_HEIGHT: number;
var PANEL_SHEET_MAX_HEIGHT: string;
var IFRAME_POINTER_LOCK_CLASS: string;
var activeIframePointerLocks: number;
var COARSE_PANEL_WIDTH: number;
var jsxaZ: typeof import("react/jsx-runtime");
function PanelHeaderContent({
  tabs: tabs,
  activateOnFocus: activateOnFocus,
  tabsLabel: tabsLabel,
  title: title,
  onClose: onClose,
  closeLabel = DEFAULT_CLOSE_LABEL,
  trailing: trailing,
}: Color.PanelHeaderProps): React.ReactElement {
  useUiLocale();
  let value = tabs !== undefined && tabs.length > 0;
  return (
    <jsxForUiSidePanels.Fragment>
      {[value ? (
          <Tabs.List
            aria-label={tabsLabel}
            activateOnFocus={activateOnFocus}
            className={"min-w-0 flex-1"}
          >
            {tabs!.map((tab) =>
              (() => {
                const _Element = Tabs.Tab;
                const _elementProps = {
                  value: tab.value,
                  onClick: tab.onClick,
                  "data-testid": tab["data-testid"],
                  children: tab.label,
                };
                const _elementKey = tab.value;
                return <_Element key={_elementKey} {..._elementProps} />;
              })(),
            )}
          </Tabs.List>
        ) : title !== undefined && title !== null && title !== false ? (
          <span
            className={
              "min-w-0 flex-1 truncate pl-[calc(var(--pp-gutter-l,var(--cds-pad-lg))-var(--cds-pad-sm))] text-body-semibold text-primary"
            }
          >
            {title}
          </span>
        ) : (
          <span aria-hidden={"true"} className={"flex-1"} />
        ), trailing, onClose !== undefined ? (
          <Button
            variant={"ghost"}
            iconOnly={true}
            icon={
              <Icon
                name={"X"}
                size={"sm"}
                className={"text-secondary"}
              />
            }
            aria-label={closeLabel}
            onClick={onClose}
            className={"relative shrink-0"}
          />
        ) : null]}
    </jsxForUiSidePanels.Fragment>
  );
}
function usePanelHeaderTab(
  props: Color.PanelHeaderProps,
): [string, (tab: string) => void] {
  let [value, setInternalTab] = reactPanelHeader.useState(
    props.tabs?.[0]?.value ?? "",
  );
  return [
    props.tab ?? value,
    (nextTab) => {
      setInternalTab(nextTab);
      props.onTabChange?.(nextTab);
    },
  ];
}
function PanelHeader(props: Color.PanelHeaderProps): React.ReactElement {
  useUiLocale();
  let { tabs: tabs, className: className, "data-testid": value } = props,
    [activeTab, selectTab] = usePanelHeaderTab(props);
  if (tabs !== undefined && tabs.length > 0) {
    return (
      <Tabs.Root
        value={activeTab}
        onValueChange={(nextTab: unknown) => selectTab(nextTab as string)}
        data-kit={"panel-header"}
        data-testid={value}
        className={joinClassNames(PANEL_HEADER_CLASS, className)}
      >
        <PanelHeaderContent {...props} />
      </Tabs.Root>
    );
  }
  return (
    <div
      data-kit={"panel-header"}
      data-testid={value}
      className={joinClassNames(PANEL_HEADER_CLASS, className)}
    >
      <PanelHeaderContent {...props} />
    </div>
  );
}
function SidePanelProvider({
  children: children,
}: React.PropsWithChildren): React.ReactElement {
  useUiLocale();
  let [value, setPanelMeta] =
      reactForUiSidePanels.useState<Color.SidePanelMeta | null>(null),
    [hostElement, setHostElement] = reactForUiSidePanels.useState<HTMLDivElement | null>(
      null,
    ),
    [leadingElement, setLeadingElement] = reactForUiSidePanels.useState<HTMLSpanElement | null>(
      null,
    ),
    [trailingElement, setTrailingElement] = reactForUiSidePanels.useState<HTMLSpanElement | null>(
      null,
    ),
    [isHidden, setIsHidden] = reactForUiSidePanels.useState(false),
    ref = reactForUiSidePanels.useRef<Color.SidePanelMeta | null>(null),
    callback = reactForUiSidePanels.useCallback(
      (panelMeta: Color.SidePanelMeta) => {
        let current = ref.current;
        if (current && current.id !== panelMeta.id) {
          current.onClose();
        }
        ref.current = panelMeta;
        setPanelMeta(panelMeta);
      },
      [],
    ),
    unregisterPanel = reactForUiSidePanels.useCallback((panelId: string) => {
      if (ref.current?.id === panelId) {
        ref.current = null;
        setPanelMeta(null);
      }
    }, []),
    setPanelHidden = reactForUiSidePanels.useCallback(
      (hidden: boolean) => setIsHidden(hidden),
      [],
    );
  return (
    <SidePanelContext.Provider
      value={{
        activeId: value?.id ?? null,
        hostEl: hostElement,
        leadingEl: leadingElement,
        trailingEl: trailingElement,
        openPanel: callback,
        closePanel: unregisterPanel,
        setPanelHidden: setPanelHidden,
      }}
    >
      <SidePanelHostContext.Provider
        value={{
          meta: value,
          hidden: isHidden,
          setHostEl: setHostElement,
          setLeadingEl: setLeadingElement,
          setTrailingEl: setTrailingElement,
        }}
      >
        {children}
      </SidePanelHostContext.Provider>
    </SidePanelContext.Provider>
  );
}
function readPanelPreference<T>(
  key: string,
  validate: (value: unknown) => value is T,
): T | undefined {
  try {
    let value = localStorage.getItem(PANEL_STORAGE_PREFIX + key);
    if (value === null) {
      return;
    }
    let parsedPreference: unknown = JSON.parse(value);
    if (validate(parsedPreference)) {
      return parsedPreference;
    }
  } catch {}
  return;
}
function writePanelPreference(key: string, value: unknown): void {
  try {
    localStorage.setItem(PANEL_STORAGE_PREFIX + key, JSON.stringify(value));
  } catch {}
}
function maximumPanelWidth(): number {
  return Math.max(MIN_PANEL_WIDTH, Math.min(560, window.innerWidth - 120));
}
function clampPanelWidth(width: number): number {
  return Math.max(
    MIN_PANEL_WIDTH,
    Math.min(maximumPanelWidth(), Math.round(width)),
  );
}
function maximumPanelHeight(height: number = window.innerHeight): number {
  return Math.round(height * 0.85);
}
function minimumPanelHeight(
  inset: number,
  height: number = window.innerHeight,
): number {
  return Math.max(
    MIN_PANEL_HEIGHT,
    Math.min(MIN_PANEL_HEIGHT + inset, Math.round(height / 2)),
  );
}
function clampPanelHeight(height: number, inset: number = 0): number {
  return Math.max(
    minimumPanelHeight(inset),
    Math.min(maximumPanelHeight(), Math.round(height)),
  );
}
function panelBottomPadding(element: HTMLElement | null): number {
  let value = element?.ownerDocument.defaultView?.getComputedStyle?.(element);
  return Math.round(parseFloat(value?.paddingBottom ?? "") || 0);
}
function defaultFloatingPanelTop(element: HTMLElement | null): number {
  let value = element
      ?.closest("[data-mc-paned]")
      ?.querySelector<HTMLElement>("header.tb-root"),
    headerBottom =
      value && value.offsetParent !== null
        ? value.getBoundingClientRect().bottom
        : 40;
  return Math.round(headerBottom + 12);
}
function clampFloatingPanelPosition(
  position: Color.PanelPosition,
  element: HTMLElement | null,
  width?: number,
): Color.PanelPosition {
  let value = width ?? element?.offsetWidth ?? 0,
    panelHeight = element?.offsetHeight ?? 0;
  return {
    x: Math.max(
      0,
      Math.min(position.x, window.innerWidth - Math.max(value, 48)),
    ),
    y: Math.max(
      0,
      Math.min(position.y, window.innerHeight - Math.max(panelHeight, 40)),
    ),
  };
}
function beginPanelPointerGesture(
  event: React.PointerEvent<HTMLElement>,
  onMove: "x" | "y",
  onDone: Color.PanelResizeGesture,
  pointerMode: "touch" | "all" = "touch",
): Color.PanelGestureEnd {
  let callback = () => {};
  if (pointerMode === "touch" && event.pointerType === "mouse") {
    return callback;
  }
  if (!event.isPrimary || event.button !== 0) {
    return callback;
  }
  event.preventDefault();
  let { currentTarget: currentTarget, pointerId: pointerId } = event;
  currentTarget.setPointerCapture?.(pointerId);
  let getPointerCoordinate = (pointer: Pick<PointerEvent, "clientX" | "clientY">) =>
      onMove === "x" ? pointer.clientX : pointer.clientY,
    value = getPointerCoordinate(event),
    gestureId = "pointer:" + pointerId,
    flag = false,
    didFinish = false;
  onDone.onResizeStart(gestureId);
  let handlePointerMove = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId !== pointerId) {
        return;
      }
      let resizeDelta = getPointerCoordinate(pointerEvent) - value;
      if (Math.abs(resizeDelta) > 3) {
        flag = true;
      }
      onDone.onResize(resizeDelta, gestureId);
    },
    finishResize = (cancelled?: boolean) => {
      if (didFinish) {
        return;
      }
      didFinish = true;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      currentTarget.removeEventListener("lostpointercapture", handlePointerEnd);
      onDone.onResizeEnd(flag, gestureId, cancelled);
    },
    handlePointerEnd = (pointerEvent: PointerEvent) => {
      if (pointerEvent.pointerId === pointerId) {
        finishResize();
      }
    };
  window.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerEnd);
  window.addEventListener("pointercancel", handlePointerEnd);
  currentTarget.addEventListener("lostpointercapture", handlePointerEnd);
  return finishResize;
}
function holdIframePointerLock(): () => void {
  if (activeIframePointerLocks++ === 0) {
    document.documentElement.classList.add(IFRAME_POINTER_LOCK_CLASS);
  }
  let flag = false;
  return () => {
    if (flag) {
      return;
    }
    flag = true;
    if (--activeIframePointerLocks === 0) {
      document.documentElement.classList.remove(IFRAME_POINTER_LOCK_CLASS);
    }
  };
}
function wrapPanelResizeGestures(
  gesture: Color.PanelResizeGesture,
): Color.PanelResizeGesture {
  let entries = new Map<string, () => void>(),
    callback = (gestureId: string | undefined) =>
      typeof gestureId === "string" ? gestureId : "cds";
  return {
    onResizeStart: (gestureId?: string) => {
      let value = callback(gestureId);
      entries.get(value)?.();
      entries.set(value, holdIframePointerLock());
      gesture.onResizeStart(value);
    },
    onResize: gesture.onResize,
    onResizeEnd: (moved?: boolean, gestureId?: string, cancelled?: boolean) => {
      let value = callback(gestureId);
      entries.get(value)?.();
      entries.delete(value);
      gesture.onResizeEnd(moved, value, cancelled);
    },
  };
}
function usePanelWidth(
  initialWidth: number = 304,
  onResize?: (width: number, previous: number) => void,
): Color.PanelWidthState {
  let [value] = reactForUiSidePanels.useState(() =>
      typeof matchMedia === "function" &&
      matchMedia(COARSE_POINTER_QUERY).matches
        ? Math.max(initialWidth, COARSE_PANEL_WIDTH)
        : initialWidth,
    ),
    [panelWidth, setWidth] = reactForUiSidePanels.useState(
      () => readPanelPreference("width", isFinitePanelNumber) ?? value,
    ),
    [maxWidth, setMaxWidth] = reactForUiSidePanels.useState(maximumPanelWidth);
  reactForUiSidePanels.useLayoutEffect(() => {
    let callback = () => {
      setMaxWidth(maximumPanelWidth());
      setWidth((previousWidth) => clampPanelWidth(previousWidth));
    };
    callback();
    window.addEventListener("resize", callback);
    return () => window.removeEventListener("resize", callback);
  }, []);
  let ref = reactForUiSidePanels.useRef(panelWidth),
    resizeCallbackRef = reactForUiSidePanels.useRef(onResize);
  reactForUiSidePanels.useLayoutEffect(() => {
    ref.current = panelWidth;
    resizeCallbackRef.current = onResize;
  });
  let startingWidthRef = reactForUiSidePanels.useRef(panelWidth),
    memo = reactForUiSidePanels.useMemo(
      () => ({
        onResizeStart: () => {
          startingWidthRef.current = ref.current;
        },
        onResize: (delta: number) => {
          let nextWidth = clampPanelWidth(startingWidthRef.current - delta);
          setWidth(nextWidth);
          resizeCallbackRef.current?.(nextWidth, startingWidthRef.current);
        },
        onResizeEnd: () => {
          setWidth((savedWidth) => {
            writePanelPreference("width", savedWidth);
            return savedWidth;
          });
        },
      }),
      [],
    );
  return {
    width: panelWidth,
    min: MIN_PANEL_WIDTH,
    max: maxWidth,
    defaultWidth: value,
    gesture: memo,
  };
}
function PanelWidthResizeHandle({
  width: width,
  min: min,
  max: max,
  defaultWidth: defaultWidth,
  gesture: gesture,
  label = uiMessage("design-system.sidePanels.resizePanel"),
  className: className,
}: Color.PanelWidthHandleProps): React.ReactElement {
  useUiLocale();
  let callback = (targetWidth: number) => () => {
    gesture.onResizeStart("keys");
    gesture.onResize(width - targetWidth, "keys");
    gesture.onResizeEnd(true, "keys");
  };
  return (
    <PanelResizeHandle
      side={"inline-start"}
      name={"panel"}
      label={label}
      now={width}
      min={min}
      max={max}
      valueText={String(width) + " pixels wide"}
      gesture={gesture}
      onHome={callback(min)}
      onEnd={callback(max)}
      onReset={callback(defaultWidth)}
      className={joinClassNames(
        "[&:not(:focus-visible)>[data-cds-part=resize-pill]]:opacity-0",
        className,
      )}
    />
  );
}
function PanelResizeHandle({
  name: name,
  label: label,
  now: now,
  min: min,
  max: onEnd,
  valueText: valueText,
  side = "top",
  gesture: gesture,
  disabled = false,
  unavailableTip: unavailableTip,
  onHome: onHome,
  onEnd: onReset,
  onReset: resetSize,
  className: className,
  grabClassName: grabHandleClassName = "justify-center pointer-coarse:flex",
  grabTargetClassName: grabTargetClassName,
}: Color.PanelResizeHandleProps): React.ReactElement {
  useUiLocale();
  let value = side === "inline-start",
    grabClassName = reactForUiSidePanels.useRef(gesture);
  grabClassName.current = gesture;
  let ref = reactForUiSidePanels.useRef(disabled);
  ref.current = disabled;
  let [isResizing, setIsResizing] = reactForUiSidePanels.useState(false),
    [isFocused, setIsFocused] = reactForUiSidePanels.useState(false),
    [dismissedTooltip, setDismissedTooltip] = reactForUiSidePanels.useState(false),
    descriptionId = reactForUiSidePanels.useId(),
    activeGestureIdRef = reactForUiSidePanels.useRef<string | null>(null),
    finishPointerGestureRef = reactForUiSidePanels.useRef<Color.PanelGestureEnd | null>(null);
  reactForUiSidePanels.useEffect(() => () => finishPointerGestureRef.current?.(true), []);
  let recentResizeMovesRef = reactForUiSidePanels.useRef([false, false]),
    memo = reactForUiSidePanels.useMemo(
      () => ({
        onResizeStart: (gestureId: string = "keys") => {
          if (ref.current) {
            return;
          }
          if (activeGestureIdRef.current === gestureId) {
            if (finishPointerGestureRef.current) {
              finishPointerGestureRef.current();
            } else {
              activeGestureIdRef.current = null;
              grabClassName.current.onResizeEnd(true, gestureId);
            }
          }
          if (activeGestureIdRef.current !== null) {
            return;
          }
          activeGestureIdRef.current = gestureId;
          setIsResizing(true);
          grabClassName.current.onResizeStart(gestureId);
        },
        onResize: (delta: number, gestureId: string = "keys") => {
          if (activeGestureIdRef.current === gestureId) {
            grabClassName.current.onResize(delta, gestureId);
          }
        },
        onResizeEnd: (
          moved?: boolean,
          gestureId: string = "keys",
          cancelled?: boolean,
        ) => {
          if (activeGestureIdRef.current !== gestureId) {
            return;
          }
          activeGestureIdRef.current = null;
          finishPointerGestureRef.current = null;
          setIsResizing(false);
          if (gestureId !== "keys") {
            recentResizeMovesRef.current = [recentResizeMovesRef.current[1], moved as boolean];
          }
          grabClassName.current.onResizeEnd(moved, gestureId, cancelled);
        },
      }),
      [],
    ),
    callback = (
      event: React.PointerEvent<HTMLElement>,
      pointerMode: "all" | "touch",
    ) => {
      let gestureId = "pointer:" + event.pointerId;
      if (
        ref.current ||
        (activeGestureIdRef.current !== null && activeGestureIdRef.current !== gestureId)
      ) {
        if (
          event.isPrimary &&
          event.button === 0 &&
          !(pointerMode === "touch" && event.pointerType === "mouse")
        ) {
          event.preventDefault();
        }
        return;
      }
      let finishGesture = beginPanelPointerGesture(
        event,
        value ? "x" : "y",
        memo,
        pointerMode,
      );
      if (activeGestureIdRef.current === gestureId) {
        finishPointerGestureRef.current = finishGesture;
      }
    },
    runWhenIdle = (command: (() => void) | undefined) => {
      if (!disabled && activeGestureIdRef.current === null) {
        command?.();
      }
    },
    disabledReason = disabled ? unavailableTip : undefined;
  reactForUiSidePanels.useEffect(() => {
    if (!disabled) {
      setDismissedTooltip(false);
    }
  }, [disabled]);
  let showTooltip = disabledReason !== undefined && isFocused && !dismissedTooltip,
    resizeHandle = (
      <ResizeHandle
        side={side}
        aria-label={label}
        aria-valuenow={now}
        aria-valuemin={min}
        aria-valuemax={onEnd}
        aria-valuetext={valueText}
        aria-disabled={disabled || undefined}
        aria-describedby={disabledReason !== undefined ? descriptionId : undefined}
        data-kit={name + "-resize"}
        onResizeStart={memo.onResizeStart}
        onResize={memo.onResize}
        onResizeEnd={memo.onResizeEnd}
        onPointerDown={(pointerEvent: React.PointerEvent<HTMLElement>) =>
          callback(pointerEvent, "all")
        }
        onFocus={() => {
          setIsFocused(true);
          setDismissedTooltip(false);
        }}
        onBlur={() => setIsFocused(false)}
        onDoubleClick={() => {
          if (!recentResizeMovesRef.current[0] && !recentResizeMovesRef.current[1]) {
            runWhenIdle(resetSize);
          }
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.altKey ||
            event.shiftKey ||
            (event.key !== "Home" && event.key !== "End")
          ) {
            return;
          }
          let keyAction = disabled
            ? undefined
            : event.key === "Home"
              ? onHome
              : onReset;
          if (!keyAction) {
            return;
          }
          event.preventDefault();
          runWhenIdle(keyAction);
        }}
        className={joinClassNames(
          "z-10 touch-none [--cds-ring-outer:1px] [--cds-ring-inner:0px]",
          isResizing && "[--cds-resize-pill-force:1]",
          disabled
            ? "pointer-events-none pointer-coarse:[--cds-resize-pill-force:0.2]"
            : !value &&
                !isResizing &&
                "pointer-coarse:[--cds-resize-pill-force:0.5] [&:hover:not(:focus-visible)>[data-cds-part=resize-pill]]:opacity-50",
          !value &&
            "[&:not(:focus-visible)>[data-cds-part=resize-pill]]:top-[calc(50%+6px)]",
          className,
        )}
      />
    );
  return (
    <SidePanelJsx.Fragment>
      {[disabled ? null : (
          <div
            data-kit={name + "-grab"}
            onPointerDown={(pointerEvent: React.PointerEvent<HTMLElement>) =>
              callback(pointerEvent, value ? "all" : "touch")
            }
            aria-hidden={"true"}
            className={joinClassNames(
              "absolute z-10 hidden touch-none",
              value
                ? "inset-y-0 left-0 w-0 flex-col items-center"
                : "inset-x-0 top-0 h-0 items-start",
              grabHandleClassName,
            )}
          >
            <span
              className={joinClassNames(
                value ? "h-full w-10 cursor-col-resize" : "h-10 w-24",
                grabTargetClassName,
              )}
            />
          </div>
        ), <Tooltip
          content={disabledReason ?? ""}
          side={value ? "left" : "top"}
          open={showTooltip}
          onOpenChange={(nextOpen: boolean) => {
            if (!nextOpen && showTooltip) {
              setDismissedTooltip(true);
            }
          }}
        >
          {resizeHandle}
        </Tooltip>, disabledReason !== undefined ? (
          <SidePanelJsx.Fragment>
            {[<span id={descriptionId} hidden={true}>
                {disabledReason}
              </span>, <TooltipWrapper
                tip={disabledReason}
                side={value ? "left" : "top"}
                className={
                  value
                    ? "absolute! inset-y-0 -left-1.5 z-10 w-3 cursor-default"
                    : "absolute! inset-x-0 -top-1.5 z-10 h-3 cursor-default"
                }
              >
                <span className={"size-full"} />
              </TooltipWrapper>]}
          </SidePanelJsx.Fragment>
        ) : null]}
    </SidePanelJsx.Fragment>
  );
}
function SidePanelHost(): React.ReactElement | null {
  useUiLocale();
  let value = reactForUiSidePanels.useContext(SidePanelHostContext);
  if (!value) {
    throw Error("SidePanelHost requires a SidePanelProvider");
  }
  let {
      meta: meta,
      hidden: hidden,
      setHostEl: setHostEl,
      setLeadingEl: setLeadingEl,
      setTrailingEl: setTrailingEl,
    } = value,
    [storedSheetHeight, setStoredSheetHeight] = reactForUiSidePanels.useState(() => {
      let savedHeight = readPanelPreference("sheetH", isFinitePanelNumber) ?? 0;
      if (savedHeight > 0) {
        return clampPanelHeight(savedHeight);
      } else {
        return 0;
      }
    }),
    [viewportHeight, setViewportHeight] = reactForUiSidePanels.useState(
      () => window.innerHeight,
    ),
    [bottomPadding, setBottomPadding] = reactForUiSidePanels.useState(0),
    resolvedSheetHeight =
      storedSheetHeight > 0 ? Math.max(storedSheetHeight, minimumPanelHeight(bottomPadding, viewportHeight)) : 0,
    [savedDockMode, setDockMode] = reactForUiSidePanels.useState(
      () => readPanelPreference("mode", isPanelDockMode) ?? "docked",
    ),
    canDetach = meta?.detachable === true,
    dockMode = canDetach ? savedDockMode : "docked",
    [floatingPosition, setFloatingPosition] = reactForUiSidePanels.useState(() =>
      readPanelPreference("pos", isPanelPosition),
    ),
    ref = reactForUiSidePanels.useRef<HTMLDivElement | null>(null),
    [isMoving, setIsMoving] = reactForUiSidePanels.useState(false),
    startingPositionRef = reactForUiSidePanels.useRef<Color.PanelPosition | undefined>(
      undefined,
    ),
    panelWidth = usePanelWidth(304, (nextWidth: number, previousWidth: number) => {
      let current = startingPositionRef.current;
      if (dockMode === "floating" && current) {
        setFloatingPosition(
          clampFloatingPanelPosition(
            {
              x: current.x + (previousWidth - nextWidth),
              y: current.y,
            },
            ref.current,
            nextWidth,
          ),
        );
      }
    }),
    { width: width, gesture: gesture } = panelWidth,
    memo = reactForUiSidePanels.useMemo(
      () => ({
        ...gesture,
        onResizeStart: (gestureId?: string) => {
          startingPositionRef.current = floatingPosition;
          gesture.onResizeStart(gestureId);
        },
        onResizeEnd: (
          moved?: boolean,
          gestureId?: string,
          cancelled?: boolean,
        ) => {
          gesture.onResizeEnd(moved, gestureId, cancelled);
          if (dockMode === "floating") {
            setFloatingPosition((position) => {
              if (position) {
                writePanelPreference("pos", position);
              }
              return position;
            });
          }
        },
      }),
      [gesture, floatingPosition, dockMode],
    ),
    startingSheetHeightRef = reactForUiSidePanels.useRef(0),
    startingBottomPaddingRef = reactForUiSidePanels.useRef(0),
    sheetResizeGesture = reactForUiSidePanels.useMemo(
      () =>
        wrapPanelResizeGestures({
          onResizeStart: () => {
            startingSheetHeightRef.current =
              ref.current?.offsetHeight ?? Math.round(window.innerHeight / 2);
            startingBottomPaddingRef.current = panelBottomPadding(ref.current);
            setBottomPadding(startingBottomPaddingRef.current);
          },
          onResize: (delta: number) =>
            setStoredSheetHeight(clampPanelHeight(startingSheetHeightRef.current - delta, startingBottomPaddingRef.current)),
          onResizeEnd: () => {
            setStoredSheetHeight((currentHeight) => {
              let persistedHeight =
                currentHeight > 0 && currentHeight === minimumPanelHeight(startingBottomPaddingRef.current)
                  ? MIN_PANEL_HEIGHT
                  : currentHeight;
              if (persistedHeight > 0) {
                writePanelPreference("sheetH", persistedHeight);
              }
              return persistedHeight;
            });
          },
        }),
      [],
    ),
    [isNarrow, setIsNarrow] = reactForUiSidePanels.useState(
      () => !window.matchMedia("(min-width: 48rem)").matches,
    );
  reactForUiSidePanels.useEffect(() => {
    let wideQuery = window.matchMedia("(min-width: 48rem)"),
      updateViewportMatch = () => setIsNarrow(!wideQuery.matches);
    wideQuery.addEventListener("change", updateViewportMatch);
    return () => wideQuery.removeEventListener("change", updateViewportMatch);
  }, []);
  reactForUiSidePanels.useLayoutEffect(() => {
    let documentElement = document.documentElement;
    if (!meta || hidden) {
      documentElement.removeAttribute("data-mc-presentation");
      documentElement.style.removeProperty("--mc-sheet-h");
      return;
    }
    let presentation =
      dockMode === "floating"
        ? "floating"
        : isNarrow
          ? meta.narrow === "sheet"
            ? "sheet"
            : "overlay"
          : meta.wide === "overlay"
            ? "overlay"
            : "docked";
    if (documentElement.getAttribute("data-mc-presentation") !== presentation) {
      documentElement.setAttribute("data-mc-presentation", presentation);
    }
    if (presentation === "sheet" && meta.sheetFitsContent !== true) {
      documentElement.style.setProperty(
        "--mc-sheet-h",
        resolvedSheetHeight > 0 ? `${resolvedSheetHeight}px` : PANEL_SHEET_MAX_HEIGHT,
      );
    } else {
      documentElement.style.removeProperty("--mc-sheet-h");
    }
  }, [meta, hidden, dockMode, isNarrow, resolvedSheetHeight]);
  reactForUiSidePanels.useLayoutEffect(() => {
    return () => {
      let documentElement = document.documentElement;
      documentElement.removeAttribute("data-mc-presentation");
      documentElement.style.removeProperty("--mc-sheet-h");
    };
  }, []);
  let [isScrolled, setIsScrolled] = reactForUiSidePanels.useState(false),
    hostRef = reactForUiSidePanels.useRef<HTMLDivElement | null>(null),
    scrollCheckFrameRef = reactForUiSidePanels.useRef(0),
    contentObserverRef = reactForUiSidePanels.useRef<MutationObserver | null>(null),
    callback = reactForUiSidePanels.useCallback(() => {
      if (scrollCheckFrameRef.current) {
        return;
      }
      let ownerWindow = hostRef.current?.ownerDocument.defaultView;
      if (!ownerWindow) {
        return;
      }
      scrollCheckFrameRef.current = ownerWindow.requestAnimationFrame(() => {
        scrollCheckFrameRef.current = 0;
        let current = hostRef.current,
          scrolledAtTopEdge = current ? current.scrollTop > 0 : false;
        if (current && !scrolledAtTopEdge) {
          for (let descendant of current.querySelectorAll("*")) {
            let tagName = descendant.tagName;
            if (
              tagName === "TEXTAREA" ||
              tagName === "INPUT" ||
              tagName === "SELECT"
            ) {
              continue;
            }
            if (
              descendant.scrollTop > 0 &&
              descendant.closest(OPEN_OVERLAY_SELECTOR) === null
            ) {
              scrolledAtTopEdge = approximatelyEqualPanelSize(
                descendant.getBoundingClientRect().top,
                current.getBoundingClientRect().top,
              );
              break;
            }
          }
        }
        setIsScrolled(scrolledAtTopEdge);
      });
    }, []),
    attachHost = reactForUiSidePanels.useCallback(
      (hostElement: HTMLDivElement | null) => {
        let current = hostRef.current;
        if (current) {
          current.removeEventListener("scroll", callback, true);
          if (scrollCheckFrameRef.current) {
            current.ownerDocument.defaultView?.cancelAnimationFrame(
              scrollCheckFrameRef.current,
            );
            scrollCheckFrameRef.current = 0;
          }
        }
        contentObserverRef.current?.disconnect();
        contentObserverRef.current = null;
        hostRef.current = hostElement;
        let ownerWindow = hostElement?.ownerDocument.defaultView;
        if (hostElement && ownerWindow) {
          hostElement.addEventListener("scroll", callback, true);
          let contentObserver = new (
            ownerWindow as Window & typeof globalThis
          ).MutationObserver(callback);
          contentObserver.observe(hostElement, {
            childList: true,
            subtree: true,
          });
          contentObserverRef.current = contentObserver;
        }
        setIsScrolled(false);
        setHostEl(hostElement);
      },
      [setHostEl, callback],
    );
  reactForUiSidePanels.useLayoutEffect(() => {
    let handleWindowResize = () => {
      setViewportHeight(window.innerHeight);
      setFloatingPosition((position) =>
        position ? clampFloatingPanelPosition(position, ref.current) : position,
      );
      setStoredSheetHeight((currentHeight) => (currentHeight > 0 ? clampPanelHeight(currentHeight) : currentHeight));
    };
    handleWindowResize();
    window.addEventListener("resize", handleWindowResize);
    return () => window.removeEventListener("resize", handleWindowResize);
  }, []);
  reactForUiSidePanels.useLayoutEffect(
    () => setBottomPadding(panelBottomPadding(ref.current)),
    [meta, hidden, dockMode, isNarrow, viewportHeight],
  );
  let beginPanelMove = reactForUiSidePanels.useCallback(
      (
        event: React.PointerEvent<HTMLDivElement> & {
          target: HTMLElement;
        },
      ) => {
        let target = event.target as
          | (HTMLElement & {
              value?: string;
            })
          | null;
        if (
          target &&
          typeof target.closest === "function" &&
          target.closest("button, a, input, select, textarea")
        ) {
          return;
        }
        if (
          meta?.narrow === "sheet" &&
          !window.matchMedia("(min-width: 48rem)").matches
        ) {
          return;
        }
        if (!canDetach) {
          return;
        }
        event.preventDefault();
        let panelBounds = ref.current?.getBoundingClientRect(),
          grabOffsetX = panelBounds ? event.clientX - panelBounds.left : 24,
          grabOffsetY = panelBounds ? event.clientY - panelBounds.top : 16,
          clientX = event.clientX,
          clientY = event.clientY,
          hasDetached = dockMode === "floating";
        setIsMoving(true);
        let movePanel = (pointerEvent: PointerEvent) => {
            if (!hasDetached) {
              if (
                Math.abs(pointerEvent.clientX - clientX) +
                  Math.abs(pointerEvent.clientY - clientY) <
                8
              ) {
                return;
              }
              hasDetached = true;
              setDockMode("floating");
              writePanelPreference("mode", "floating");
            }
            let nextPosition = clampFloatingPanelPosition(
              {
                x: pointerEvent.clientX - grabOffsetX,
                y: pointerEvent.clientY - grabOffsetY,
              },
              ref.current,
            );
            setFloatingPosition(nextPosition);
          },
          finishPanelMove = (pointerEvent: PointerEvent) => {
            window.removeEventListener("pointermove", movePanel);
            window.removeEventListener("pointerup", finishPanelMove);
            window.removeEventListener("pointercancel", finishPanelMove);
            setIsMoving(false);
            if (hasDetached) {
              let finalPosition = clampFloatingPanelPosition(
                {
                  x: pointerEvent.clientX - grabOffsetX,
                  y: pointerEvent.clientY - grabOffsetY,
                },
                ref.current,
              );
              setFloatingPosition(finalPosition);
              writePanelPreference("pos", finalPosition);
            }
          };
        window.addEventListener("pointermove", movePanel);
        window.addEventListener("pointerup", finishPanelMove);
        window.addEventListener("pointercancel", finishPanelMove);
      },
      [dockMode, meta?.narrow, canDetach],
    ),
    dockPanel = reactForUiSidePanels.useCallback(() => {
      setDockMode("docked");
      writePanelPreference("mode", "docked");
    }, []);
  reactForUiSidePanels.useEffect(() => {
    if (!meta) {
      return;
    }
    let handleEscape = (event: KeyboardEvent) => {
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        event.isComposing
      ) {
        return;
      }
      if (hasOpenOverlay()) {
        return;
      }
      let target = event.target as
        | (HTMLElement & {
            value?: string;
          })
        | null;
      if (
        target &&
        ref.current?.contains(target) === true &&
        (((target.tagName === "TEXTAREA" ||
          (target.tagName === "INPUT" &&
            !NON_TEXT_INPUT_TYPES.test(target.getAttribute("type") ?? ""))) &&
          typeof target.value === "string" &&
          target.value.length > 0) ||
          (target.isContentEditable === true &&
            (target.textContent ?? "") !== ""))
      ) {
        target.blur?.();
        return;
      }
      event.preventDefault();
      meta.onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [meta]);
  if (!meta) {
    return null;
  }
  let isFloating = dockMode === "floating",
    fitsContent = meta.sheetFitsContent === true,
    renderedSheetHeight =
      resolvedSheetHeight > 0 ? resolvedSheetHeight : Math.min(Math.round(viewportHeight / 2), 384 + bottomPadding),
    state = {
      "--mc-side-w": `${width}px`,
      ...(resolvedSheetHeight > 0 && !fitsContent
        ? {
            "--mc-sheet-h": `${resolvedSheetHeight}px`,
          }
        : {}),
    },
    tabs =
      meta.tabs !== undefined && meta.tabs.length > 0 ? meta.tabs : undefined,
    hasTabs = tabs !== undefined,
    panelHeader =
      tabs !== undefined ? (
        <div
          onPointerDown={beginPanelMove}
          className={joinClassNames(
            "shrink-0 touch-none select-none border-b border-border-line",
            canDetach && (isMoving ? "cursor-grabbing" : "cursor-grab"),
          )}
        >
          <CdsRoot density={"compact"} className={"contents"}>
            {(() => {
              const Header = PanelHeader;
              const headerProps = {
                tabs: tabs,
                tab: meta.tab ?? tabs[0]?.value,
                onTabChange: meta.onTabChange,
                tabsLabel: meta.tabsLabel ?? uiMessage("design-system.sidePanels.panelView"),
                trailing: isFloating ? (
                  <Button
                    iconOnly={true}
                    variant={"ghost"}
                    icon={"SidebarRight"}
                    aria-label={uiMessage("design-system.sidePanels.dockPanel")}
                    tooltip={uiMessage("design-system.sidePanels.dockBackToTheSide")}
                    className={"relative shrink-0"}
                    onClick={dockPanel}
                  />
                ) : undefined,
                onClose: () => meta.onClose(),
                get closeLabel() { return uiMessage("design-system.sidePanels.closePanel"); },
              };
              const headerKey = meta.id;
              return <Header key={headerKey} {...headerProps} />;
            })()}
          </CdsRoot>
        </div>
      ) : (
        <div
          data-kit={"panel-header"}
          onPointerDown={beginPanelMove}
          className={joinClassNames(
            "flex h-[38px] shrink-0 touch-none items-center gap-1.5 px-3",
            "pointer-coarse:gap-4",
            "select-none border-b transition-colors",
            isScrolled ? "border-border-line" : "border-transparent",
            meta.wideHeader === false && !canDetach && "md:hidden",
            canDetach && (isMoving ? "cursor-grabbing" : "cursor-grab"),
          )}
        >
          {[<span
              ref={setLeadingEl}
              className={"-ml-[5px] flex shrink-0 items-center empty:hidden"}
            />, <span className={"min-w-0 flex-1 truncate text-body-semibold"}>
              {meta.hideTitle === true ? (null) : (meta.title)}
            </span>, <span
              ref={setTrailingEl}
              className={
                "relative z-20 flex shrink-0 items-center gap-1.5 pointer-coarse:gap-4 empty:hidden"
              }
            />, isFloating ? (
              <PanelIconButton
                icon={"SidebarRight"}
                aria-label={uiMessage("design-system.sidePanels.dockPanel")}
                tooltip={uiMessage("design-system.sidePanels.dockBackToTheSide")}
                onClick={dockPanel}
              />
            ) : null, <PanelIconButton
              icon={"X"}
              aria-label={uiMessage("design-system.sidePanels.closePanel")}
              className={
                meta.closeInset === "shell" ? undefined : "-mr-[5px]"
              }
              onClick={() => meta.onClose()}
            />]}
        </div>
      );
  return (
    <div
      ref={ref}
      role={isFloating ? "dialog" : "complementary"}
      aria-label={meta.title}
      style={{
        ...(isFloating
          ? {
              position: "fixed",
              width: width,
              ...(floatingPosition
                ? {
                    left: floatingPosition.x,
                    top: floatingPosition.y,
                  }
                : {
                    right: 12,
                    top: defaultFloatingPanelTop(ref.current),
                  }),
            }
          : state),
        ...(hidden
          ? {
              display: "none",
            }
          : {}),
      }}
      className={joinClassNames(
        "z-panel flex min-h-0 flex-col",
        isFloating
          ? "max-h-[min(75dvh,42rem)] rounded-lg border border-border-line bg-panel shadow-xl"
          : joinClassNames(
              "bg-surface-panel",
              "relative w-[var(--mc-side-w)] shrink-0 border-l border-border-line",
              meta.wide === "overlay" &&
                "md:absolute md:top-[var(--tb-row-h,0px)] md:right-0 md:bottom-0 md:shadow-xl",
              meta.narrow === "sheet"
                ? joinClassNames(
                    "max-md:relative max-md:z-sheet",
                    fitsContent
                      ? "max-md:max-h-[85dvh]"
                      : "max-md:h-[var(--mc-sheet-h,min(50dvh,calc(24rem_+_var(--mc-foot-inset,0px))))]",
                    "max-md:w-full max-md:shrink-0 max-md:pb-[var(--mc-foot-inset,0px)]",
                    "max-md:border-t max-md:border-l-0 max-md:border-border-line",
                  )
                : "max-md:absolute max-md:top-[var(--tb-row-h,0px)] max-md:right-0 max-md:bottom-0 max-md:shadow-xl",
            ),
      )}
    >
      {[!isFloating && meta.narrow === "sheet" && !fitsContent ? (
          <PanelResizeHandle
            name={"sheet"}
            label={uiMessage("design-system.sidePanels.resizeSheet")}
            now={renderedSheetHeight}
            valueText={String(renderedSheetHeight) + " pixels tall"}
            min={minimumPanelHeight(bottomPadding, viewportHeight)}
            max={maximumPanelHeight(viewportHeight)}
            gesture={sheetResizeGesture}
            className={"hidden max-md:block"}
            grabClassName={joinClassNames(
              "max-md:pointer-coarse:flex pointer-coarse:right-14",
              hasTabs ? "justify-end" : "justify-center",
            )}
            grabTargetClassName={hasTabs ? undefined : "ml-14"}
          />
        ) : null, panelHeader, <div className={"relative flex min-h-0 flex-1 flex-col"}>
          {[<div
              ref={attachHost}
              className={"flex min-h-0 flex-1 flex-col overflow-hidden"}
            />, isNarrow && meta.narrow === "sheet" ? null : (
              <PanelWidthResizeHandle
                {...panelWidth}
                gesture={memo}
                label={meta.resizeLabel}
              />
            )]}
        </div>]}
    </div>
  );
}
function PanedLayout({
  toolbar: toolbar,
  leading: leading,
  toolbarVariant = "docked",
  children: children,
}: Color.PanedLayoutProps): React.ReactElement {
  useUiLocale();
  let value =
      leading == null ? null : (
        <div data-mc-chrome={""} className={"contents"}>
          {leading}
        </div>
      ),
    mainContent = (
      <main
        data-appifact-main={""}
        className={"flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden"}
      >
        {children}
      </main>
    );
  return (
    <SidePanelProvider>
      {toolbarVariant === "floating" ? (<div
          data-mc-paned={""}
          className={"relative flex h-dvh overflow-hidden max-md:flex-col"}
        >
          {[<div className={"flex min-h-0 min-w-0 flex-1"}>
              {[value, <div
                  className={"relative flex min-h-0 min-w-0 flex-1 flex-col"}
                >
                  {[toolbar, mainContent]}
                </div>]}
            </div>, <SidePanelHost />]}
        </div>) : (<div data-mc-paned={""} className={"flex h-dvh overflow-hidden"}>
          {[value, <div className={"flex min-h-0 min-w-0 flex-1 flex-col"}>
              {[toolbar, <div
                  className={"relative flex min-h-0 flex-1 max-md:flex-col"}
                >
                  {[mainContent, <SidePanelHost />]}
                </div>]}
            </div>]}
        </div>)}
    </SidePanelProvider>
  );
}
export {
  activeIframePointerLocks,
  approximatelyEqualPanelSize,
  beginPanelPointerGesture,
  clampFloatingPanelPosition,
  clampPanelHeight,
  clampPanelWidth,
  COARSE_PANEL_WIDTH,
  defaultFloatingPanelTop,
  holdIframePointerLock,
  IFRAME_POINTER_LOCK_CLASS,
  isFinitePanelNumber,
  isPanelDockMode,
  isPanelPosition,
  jsxaZ,
  jsxForUiSidePanels,
  SidePanelJsx as jsxForUiSidePanels2,
  maximumPanelHeight,
  maximumPanelWidth,
  MIN_PANEL_HEIGHT,
  MIN_PANEL_WIDTH,
  minimumPanelHeight,
  NON_TEXT_INPUT_TYPES,
  PanedLayout,
  PANEL_HEADER_CLASS,
  PANEL_SHEET_MAX_HEIGHT,
  PANEL_STORAGE_PREFIX,
  panelBottomPadding,
  PanelHeader,
  PanelHeaderContent,
  PanelIconButton,
  PanelResizeHandle,
  PanelWidthResizeHandle,
  reactDomSidePanels,
  reactForUiSidePanels,
  reactPanelHeader as reactForUiSidePanels2,
  readPanelPreference,
  SidePanelContext,
  SidePanelHost,
  SidePanelHostContext,
  SidePanelProvider,
  usePanelHeaderTab,
  usePanelWidth,
  wrapPanelResizeGestures,
  writePanelPreference,
};
export function installUiSidePanels(): () => void {
  return () => {
    reactForUiSidePanels = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomSidePanels = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    reactPanelHeader = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiSidePanels = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    PANEL_HEADER_CLASS =
      "flex min-w-0 shrink-0 items-center gap-xs py-md pr-sm pl-sm";
    SidePanelJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    PanelIconButton = reactForUiSidePanels.forwardRef(function (
      buttonProps: import("../contracts/controls").ButtonProps,
      forwardedRef: React.ForwardedRef<HTMLButtonElement>,
    ) {
      return (
        <Button
          ref={forwardedRef}
          iconOnly={true}
          size={"xs"}
          variant={"ghost"}
          {...buttonProps}
        />
      );
    });
    SidePanelContext =
      reactForUiSidePanels.createContext<Color.SidePanelState | null>(null);
    SidePanelHostContext =
      reactForUiSidePanels.createContext<Color.SidePanelHostState | null>(null);
    PANEL_STORAGE_PREFIX = "mc-side/";
    isFinitePanelNumber = (preference: unknown): preference is number =>
      typeof preference === "number" && Number.isFinite(preference);
    isPanelDockMode = (preference: unknown): preference is Color.PanelDockMode =>
      preference === "docked" || preference === "floating";
    isPanelPosition = (preference: unknown): preference is Color.PanelPosition =>
      typeof preference === "object" &&
      preference !== null &&
      Number.isFinite((preference as Color.PanelPosition).x) &&
      Number.isFinite((preference as Color.PanelPosition).y);
    MIN_PANEL_WIDTH = 285;
    NON_TEXT_INPUT_TYPES =
      /^(checkbox|radio|range|button|submit|reset|image|color)$/i;
    approximatelyEqualPanelSize = (left: number, right: number) =>
      Math.abs(left - right) < 1;
    MIN_PANEL_HEIGHT = 160;
    PANEL_SHEET_MAX_HEIGHT =
      "min(50dvh, calc(24rem + var(--mc-foot-inset, 0px)))";
    IFRAME_POINTER_LOCK_CLASS = "[&_iframe]:pointer-events-none!";
    activeIframePointerLocks = 0;
    COARSE_PANEL_WIDTH = 376;
    jsxaZ = toModuleNamespace(loadJsxNamespace(), 1);
  };
}
