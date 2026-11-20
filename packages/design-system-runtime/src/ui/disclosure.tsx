import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type {
  BrowserWindow,
  CompactableControlState,
} from "../contracts/overlays";
import type * as React from "react";
import type {
  DeferredTooltipLoad,
  DeferredTooltipNode,
  DeferredTooltipScope,
  DeferredTooltipState,
  DisabledTooltipProps,
  TooltipImplementation,
  TooltipPointerEvent,
  TooltipProps,
  TooltipTriggerProps,
  CollapsiblePanelProps,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
  ForwardComponent,
  DelayedSpinnerProps,
  SpinnerProps,
  SelectionMouseEvent,
} from "../contracts/overlays";
/** Restored application module; prepare first, initialize in original order. */
import { baseCollapsible, clsx, loadJsxNamespace, loadReactDomClientNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonAnnouncement, getDisabledReasonWrapperProps, initializeDisabledReason, initializeDisabledReasonDebug, initializeShortcuts, initializeTooltip, initializeTooltipContext, tooltipExports, tooltipImplementationContext } from "./avatars";
import { asElement, initializeElementAccess } from "./foundation";
import { cn, Icon, initializeClassNames, initializeIcons, initializeLayers, initializeMergedRefs, initializeRemScale, pixelsToScaledRem, useMergedRefs } from "./interactions";
import { initializeCdsLink, initializeCdsRoot } from "./overlays";

var reactDOMClientForUiDisclosure: typeof import("react-dom/client");
var reactArtifactRoot: typeof React;
var reactForUiDisclosure: typeof React;
var repeatedClickSelectionProps: Readonly<{
  onMouseDown: typeof preventRepeatedClickSelection;
}>;
var react_k: typeof React;
var reactXk: typeof React;
var disclosurePanelClasses: string;
var isHeightTransition: (input: Animation) => boolean;
var observeDisclosureAnimation: (element: HTMLElement) => () => void;
var useDisclosureAnimationRef: () => React.RefCallback<HTMLElement>;
var useDisclosurePanelRef: (
  ref: React.Ref<HTMLElement> | undefined,
) => React.RefCallback<HTMLElement>;
var reactCollapsible: typeof React;
var reactDOMForUiDisclosure: typeof import("react/jsx-runtime");
var CollapsibleRoot: ForwardComponent<HTMLDivElement, CollapsibleRootProps>;
var collapsibleTriggerClasses: string;
var collapsibleIconClasses: string;
var CollapsibleTrigger: ForwardComponent<
  HTMLButtonElement,
  CollapsibleTriggerProps
>;
var collapsiblePanelClasses: string;
var CollapsiblePanel: ForwardComponent<HTMLDivElement, CollapsiblePanelProps>;
var Collapsible: {
  Root: typeof CollapsibleRoot;
  Trigger: typeof CollapsibleTrigger;
  Panel: typeof CollapsiblePanel;
};
var reactcK: typeof React;
var jsxEq: typeof import("react/jsx-runtime");
var spinnerSizeAliases: Partial<
  Record<NonNullable<SpinnerProps["size"]>, "sm" | "md" | "lg">
>;
var spinnerSizeMetrics: {
  sm: {
    box: number;
    stroke: number;
  };
  md: {
    box: number;
    stroke: number;
  };
  lg: {
    box: number;
    stroke: number;
  };
};
var reactfk: typeof React;
var compactableControlContext: React.Context<CompactableControlState>;
var COMPACTABLE_ATTRIBUTE: string;
var reactCompactableDebug: typeof React;
var reactDeferredTooltip: typeof React;
var jsxForUiDisclosure: typeof import("react/jsx-runtime");
var loadedTooltipImplementation: TooltipImplementation | null;
var tooltipImplementationPromise: Promise<TooltipImplementation> | null;
var tooltipImplementationListeners: Set<() => void>;
var tooltipBatchTimer: ReturnType<typeof setTimeout> | null;
var tooltipBatchCallbacks: Set<() => void>;
var tooltipPreloadEvents: string[];
var tooltipPreloadStarted: boolean;
var pendingTooltipProps: {
  "data-cds-tooltip-pending": string;
};
var TOUCH_TOOLTIP_HOLD_MS: number;
var deferredTooltipImplementationContext: React.Context<DeferredTooltipScope | null>;
function preventRepeatedClickSelection(event: SelectionMouseEvent): void {
  if (event.detail <= 1 || event.button !== 0) {
    return;
  }
  if (
    (event.target as Element).closest?.(
      "input:not([type='hidden']):not([disabled]),[contenteditable]:not([contenteditable='false']),textarea:not([disabled])",
    )
  ) {
    return;
  }
  event.preventDefault();
}
function withRepeatedClickSelectionPrevention<
  Event extends SelectionMouseEvent,
>(onMouseDown?: (event: Event) => void): (event: Event) => void {
  if (!onMouseDown) {
    return preventRepeatedClickSelection;
  }
  return (mouseEvent: Event) => {
    onMouseDown(mouseEvent);
    preventRepeatedClickSelection(mouseEvent);
  };
}
function useHiddenUntilFoundRef(): React.RefCallback<HTMLElement> {
  let ref = react_k.useRef<{
    node: HTMLElement;
    detach(): void;
  } | null>(null);
  return react_k.useCallback((element: HTMLElement | null) => {
    if (!element || element === ref.current?.node) {
      return;
    }
    ref.current?.detach();
    ref.current = {
      node: element,
      detach: attachBeforeMatchStyleRecovery(element),
    };
  }, []);
}
function attachBeforeMatchStyleRecovery(element: HTMLElement): () => void {
  let value: (() => void) | undefined,
    openAttributeObserver: MutationObserver | undefined,
    callback = () => {
      openAttributeObserver?.disconnect();
      openAttributeObserver = undefined;
      value?.();
      value = undefined;
    },
    handleBeforeMatch = (event: Event) => {
      if (event.target !== element || value) {
        return;
      }
      value = overrideInlineStyles(element, {
        height: "auto",
        "transition-property": "none",
      });
      openAttributeObserver = new (element.ownerDocument.defaultView?.MutationObserver ??
        MutationObserver)(() => {
        if (element.hasAttribute("data-open")) {
          callback();
        }
      });
      openAttributeObserver.observe(element, {
        attributes: true,
        attributeFilter: ["data-open"],
      });
    };
  element.addEventListener("beforematch", handleBeforeMatch);
  return () => {
    element.removeEventListener("beforematch", handleBeforeMatch);
    callback();
  };
}
function overrideInlineStyles(
  element: HTMLElement,
  styles: Readonly<Record<string, string>>,
): () => void {
  let previousStyles = Object.keys(styles).map(
    (property: string): [string, string, string] => [
      property,
      element.style.getPropertyValue(property),
      element.style.getPropertyPriority(property),
    ],
  );
  for (let [value, cssValue] of Object.entries(styles)) {
    element.style.setProperty(value, cssValue);
  }
  return () => {
    for (let [value, previousValue, previousPriority] of previousStyles) {
      if (previousValue) {
        element.style.setProperty(value, previousValue, previousPriority);
      } else {
        element.style.removeProperty(value);
      }
    }
  };
}
function Spinner({
  size = "sm",
  delay = 0,
  inheritColor = false,
  label: label,
  className: className,
}: SpinnerProps): React.ReactElement | null {
  useUiLocale();
  let [value, setDelayElapsed] = reactcK.useState(delay <= 0),
    [previousDelay, setPreviousDelay] = reactcK.useState(delay);
  if (delay !== previousDelay) {
    setPreviousDelay(delay);
    if (delay > 0 && value) {
      setDelayElapsed(false);
    }
  }
  let shouldShowSpinner = delay <= 0 || value;
  reactcK.useEffect(() => {
    if (delay <= 0) {
      return;
    }
    let delayTimeout = window.setTimeout(() => setDelayElapsed(true), delay);
    return () => window.clearTimeout(delayTimeout);
  }, [delay]);
  let sizeMetrics =
      spinnerSizeMetrics[
        (spinnerSizeAliases[size] ?? size) as "sm" | "md" | "lg"
      ],
    spinnerColor = inheritColor ? "currentColor" : "var(--cds-text-muted)",
    trackColor = inheritColor
      ? "color-mix(in srgb, currentColor 25%, transparent)"
      : "var(--cds-border)",
    boxSize = pixelsToScaledRem(sizeMetrics.box),
    strokeWidth = pixelsToScaledRem(sizeMetrics.stroke),
    maskInnerEdge = `calc(100% - ${strokeWidth})`,
    strokeMask = `radial-gradient(farthest-side, transparent ${maskInnerEdge}, #000 calc(${maskInnerEdge} + 0.5px))`,
    spinner = !shouldShowSpinner ? null : (
      <span
        data-cds={"Spinner"}
        className={cn(
          "relative inline-block shrink-0 align-middle",
          className,
        )}
        style={{
          width: boxSize,
          height: boxSize,
        }}
        aria-hidden={true}
      >
        {[<span
            className={"absolute inset-0 rounded-full"}
            style={{
              border: `${strokeWidth} solid ${trackColor}`,
            }}
          />, <span
            className={
              "absolute inset-0 rounded-full animate-[spin_1s_linear_infinite] motion-reduce:animate-none"
            }
            style={{
              background: `conic-gradient(transparent 40%, ${spinnerColor})`,
              WebkitMask: strokeMask,
              mask: strokeMask,
            }}
          />]}
      </span>
    );
  if (!label) {
    return spinner;
  }
  return (
    <span role={"status"} className={"leading-[0]"}>
      {[spinner, <DelayedScreenReaderLabel show={shouldShowSpinner}>
          {label}
        </DelayedScreenReaderLabel>]}
    </span>
  );
}
function DelayedScreenReaderLabel({
  show: show,
  children: children,
}: DelayedSpinnerProps): React.ReactElement | null {
  useUiLocale();
  let [value, setLabelReady] = reactcK.useState(false);
  reactcK.useEffect(() => {
    let labelTimeout = window.setTimeout(() => setLabelReady(true), 100);
    return () => window.clearTimeout(labelTimeout);
  }, []);
  if (show && value) {
    return <span className={"sr-only"}>{children}</span>;
  } else {
    return null;
  }
}
function useCompactableControl(): CompactableControlState {
  return reactfk.useContext(compactableControlContext);
}
function useCompactableControlDebug(
  controlRef: React.RefObject<Element | null>,
  controlName: string,
): void {
  reactCompactableDebug.useEffect(() => {
    return;
  }, [controlRef, controlName]);
}
function scheduleTooltipUpdate(update: () => void): void {
  tooltipBatchCallbacks.add(update);
  tooltipBatchTimer ??= setTimeout(() => {
    tooltipBatchTimer = null;
    let items = [...tooltipBatchCallbacks];
    tooltipBatchCallbacks.clear();
    for (let value of items) {
      value();
    }
  }, 0);
}
function cancelTooltipUpdate(update: () => void): void {
  tooltipBatchCallbacks.delete(update);
}
function loadTooltipImplementation(): Promise<TooltipImplementation> {
  tooltipImplementationPromise ??= Promise.resolve()
    .then(() => {
      initializeTooltip();
      return tooltipExports;
    })
    .then(
      (implementation: TooltipImplementation) => {
        loadedTooltipImplementation = implementation;
        for (let value of tooltipImplementationListeners) {
          value();
        }
        return implementation;
      },
      (error: unknown) => {
        throw ((tooltipImplementationPromise = null), error);
      },
    );
  return tooltipImplementationPromise;
}
function preloadTooltipsOnInteraction(): void {
  if (tooltipPreloadStarted || loadedTooltipImplementation !== null) {
    return;
  }
  if (typeof document === "undefined") {
    return;
  }
  tooltipPreloadStarted = true;
  for (let value of tooltipPreloadEvents) {
    document.addEventListener(value, requestTooltipPreload, {
      capture: true,
      passive: true,
      once: true,
    });
  }
}
function requestTooltipPreload(): void {
  loadTooltipImplementation().catch(() => {
    return;
  });
}
function adoptTooltipTrigger(
  triggerState: DeferredTooltipNode,
  triggerElement: HTMLElement | null,
): void {
  triggerState.node = triggerElement;
  if (triggerElement === null) {
    return;
  }
  triggerState.adopted = true;
  if (triggerState.handBack) {
    triggerState.handBack = false;
    queueMicrotask(() => restoreDeferredTooltipFocus(triggerState, triggerElement));
  }
}
function restoreDeferredTooltipFocus(
  triggerState: DeferredTooltipNode,
  element: HTMLElement,
): void {
  if (!element.isConnected || !triggerState.focus) {
    return;
  }
  let activeElement = element.ownerDocument.activeElement;
  if (
    activeElement !== null &&
    activeElement !== element.ownerDocument.body
  ) {
    return;
  }
  element.focus({
    preventScroll: true,
  });
}
function cancelTooltipTouchHold(triggerState: DeferredTooltipNode): void {
  if (triggerState.tapHold !== null) {
    clearTimeout(triggerState.tapHold);
    triggerState.tapHold = null;
  }
}
function releaseTooltipTouchHold(
  triggerState: DeferredTooltipNode,
  pointerEvent: TooltipPointerEvent,
  scheduleUpdate: () => void,
): void {
  cancelTooltipTouchHold(triggerState);
  if (
    triggerState.down &&
    pointerEvent.type === "pointerup" &&
    (pointerEvent.pointerType === "touch" || pointerEvent.pointerType === "pen")
  ) {
    triggerState.tapHold = setTimeout(() => {
      triggerState.tapHold = null;
      triggerState.down = false;
      scheduleUpdate();
    }, TOUCH_TOOLTIP_HOLD_MS);
    return;
  }
  triggerState.down = false;
  scheduleUpdate();
}
function resolveTooltipImplementation(
  deferredScope: DeferredTooltipScope | null,
): TooltipImplementation | null {
  if (loadedTooltipImplementation !== null) {
    return loadedTooltipImplementation;
  }
  if (deferredScope === null) {
    return null;
  } else {
    return deferredScope.ambientImpl();
  }
}
function hasNonVisibleFocus(element: Element): boolean {
  if (element.ownerDocument.activeElement !== element) {
    return false;
  }
  try {
    return !element.matches(":focus-visible");
  } catch {
    return false;
  }
}
function useDeferredTooltipImplementation(
  shouldTrackTrigger: boolean,
): DeferredTooltipState {
  let value = reactDeferredTooltip.useContext<TooltipImplementation | null>(
      tooltipImplementationContext,
    ),
    deferredScope = reactDeferredTooltip.useContext(
      deferredTooltipImplementationContext,
    ),
    [loadedTooltip, setLoadedTooltip] =
      reactDeferredTooltip.useState<DeferredTooltipLoad | null>(() => {
        let availableImplementation =
          value ??
          (deferredScope !== null && deferredScope.isDeferred()
            ? null
            : resolveTooltipImplementation(deferredScope));
        if (availableImplementation === null) {
          return null;
        } else {
          return {
            impl: availableImplementation,
            track: undefined,
          };
        }
      }),
    tooltipImplementation = loadedTooltip === null ? null : loadedTooltip.impl,
    [wasCold] = reactDeferredTooltip.useState(tooltipImplementation === null),
    ref = reactDeferredTooltip.useRef<DeferredTooltipNode>({
      hover: false,
      focus: false,
      down: false,
      node: null,
      adopted: false,
      handBack: false,
      tapHold: null,
    }),
    shouldAdoptWhileHoveredRef = reactDeferredTooltip.useRef(false),
    callback = reactDeferredTooltip.useCallback(() => {
      if (ref.current.adopted || (deferredScope !== null && deferredScope.isDeferred())) {
        return;
      }
      let {
        hover: current,
        focus: hasFocus,
        down: isPointerDown,
        node: triggerElement,
      } = ref.current;
      if (isPointerDown) {
        return;
      }
      let shouldAdoptWhileHovered = shouldAdoptWhileHoveredRef.current;
      shouldAdoptWhileHoveredRef.current = false;
      let shouldRestoreFocus =
        hasFocus &&
        shouldTrackTrigger &&
        triggerElement !== null &&
        hasNonVisibleFocus(triggerElement);
      if (hasFocus && !shouldRestoreFocus) {
        return;
      }
      let availableImplementation = resolveTooltipImplementation(deferredScope);
      if (availableImplementation !== null && (!current || shouldAdoptWhileHovered)) {
        let triggerState = ref.current;
        triggerState.handBack = shouldRestoreFocus;
        setLoadedTooltip(
          (previousLoad: DeferredTooltipLoad | null) =>
            previousLoad ?? {
              impl: availableImplementation,
              track: shouldTrackTrigger
                ? (element: HTMLElement | null) =>
                    adoptTooltipTrigger(triggerState, element)
                : undefined,
            },
        );
      }
    }, [deferredScope, shouldTrackTrigger]),
    scheduleAdoption = reactDeferredTooltip.useCallback(() => {
      if (resolveTooltipImplementation(deferredScope) === null) {
        return;
      }
      scheduleTooltipUpdate(callback);
    }, [deferredScope, callback]),
    handleScopeReady = reactDeferredTooltip.useCallback(() => {
      shouldAdoptWhileHoveredRef.current = resolveTooltipImplementation(deferredScope) !== null;
      scheduleAdoption();
    }, [scheduleAdoption, deferredScope]),
    pointerReleaseListenerRef = reactDeferredTooltip.useRef<{
      doc: Document;
      release(event: PointerEvent): void;
    } | null>(null),
    removePointerReleaseListeners = reactDeferredTooltip.useCallback(() => {
      let current = pointerReleaseListenerRef.current;
      if (current === null) {
        return;
      }
      pointerReleaseListenerRef.current = null;
      current.doc.removeEventListener("pointerup", current.release, true);
      current.doc.removeEventListener("pointercancel", current.release, true);
    }, []),
    listenForPointerRelease = reactDeferredTooltip.useCallback(
      (ownerDocument: Document, trackedPointerId?: number) => {
        if (pointerReleaseListenerRef.current !== null) {
          return;
        }
        let handlePointerRelease = (pointerEvent: PointerEvent): void => {
          let pointerId = pointerEvent.pointerId;
          if (
            trackedPointerId !== undefined &&
            pointerId !== undefined &&
            pointerId !== trackedPointerId
          ) {
            return;
          }
          removePointerReleaseListeners();
          releaseTooltipTouchHold(ref.current, pointerEvent, scheduleAdoption);
        };
        pointerReleaseListenerRef.current = {
          doc: ownerDocument,
          release: handlePointerRelease,
        };
        ownerDocument.addEventListener("pointerup", handlePointerRelease, {
          capture: true,
        });
        ownerDocument.addEventListener("pointercancel", handlePointerRelease, {
          capture: true,
        });
      },
      [scheduleAdoption, removePointerReleaseListeners],
    );
  reactDeferredTooltip.useEffect(() => {
    if (!wasCold) {
      return;
    }
    preloadTooltipsOnInteraction();
    let current = ref.current,
      cleanupDeferredTooltip = (): void => {
        cancelTooltipUpdate(callback);
        if (current.tapHold !== null) {
          cancelTooltipTouchHold(current);
          current.down = false;
        }
        removePointerReleaseListeners();
      },
      items = [],
      isScopeDeferred = deferredScope !== null && deferredScope.isDeferred();
    if (isScopeDeferred) {
      items.push(deferredScope!.subscribe(handleScopeReady));
    }
    if (loadedTooltipImplementation === null) {
      tooltipImplementationListeners.add(scheduleAdoption);
      items.push(() => tooltipImplementationListeners.delete(scheduleAdoption));
    }
    if (!isScopeDeferred && resolveTooltipImplementation(deferredScope) !== null) {
      if (deferredScope !== null) {
        shouldAdoptWhileHoveredRef.current = true;
      }
      scheduleAdoption();
    }
    return () => {
      for (let unsubscribe of items) {
        unsubscribe();
      }
      cleanupDeferredTooltip();
    };
  }, [scheduleAdoption, handleScopeReady, deferredScope, removePointerReleaseListeners, callback, wasCold]);
  let requestImplementation = reactDeferredTooltip.useCallback(() => {
    loadTooltipImplementation().catch(() => {
      return;
    });
  }, []);
  return {
    impl: tooltipImplementation,
    wasCold: wasCold,
    interceptors: reactDeferredTooltip.useCallback(
      (triggerProps: TooltipTriggerProps) => {
        let withTriggerHandler =
          <Event extends React.SyntheticEvent<HTMLElement>>(
            interceptor: (event: Event) => void,
            originalHandler: ((event: Event) => void) | undefined,
          ): ((event: Event) => void) =>
          (triggerEvent: Event) => {
            interceptor(triggerEvent);
            originalHandler?.(triggerEvent);
          };
        return {
          onPointerEnter: withTriggerHandler(() => {
            ref.current.hover = true;
            requestImplementation();
          }, triggerProps.onPointerEnter),
          onPointerLeave: withTriggerHandler(() => {
            ref.current.hover = false;
            scheduleAdoption();
          }, triggerProps.onPointerLeave),
          onPointerDown: withTriggerHandler(
            (pointerEvent: React.PointerEvent<HTMLElement>) => {
              if (pointerEvent.isPrimary !== false && pointerEvent.button === 0) {
                cancelTooltipTouchHold(ref.current);
                ref.current.down = true;
                listenForPointerRelease(
                  pointerEvent.currentTarget.ownerDocument,
                  pointerEvent.pointerId,
                );
              }
            },
            triggerProps.onPointerDown,
          ),
          onPointerUp: withTriggerHandler(
            (pointerEvent: React.PointerEvent<HTMLElement>) => {
              if (pointerEvent.isPrimary !== false) {
                releaseTooltipTouchHold(ref.current, pointerEvent, scheduleAdoption);
              }
            },
            triggerProps.onPointerUp,
          ),
          onPointerCancel: withTriggerHandler(
            (pointerEvent: React.PointerEvent<HTMLElement>) => {
              if (pointerEvent.isPrimary !== false) {
                releaseTooltipTouchHold(ref.current, pointerEvent, scheduleAdoption);
              }
            },
            triggerProps.onPointerCancel,
          ),
          onClick: withTriggerHandler((mouseEvent: React.MouseEvent<HTMLElement>) => {
            if (ref.current.tapHold !== null) {
              releaseTooltipTouchHold(ref.current, mouseEvent, scheduleAdoption);
            }
          }, triggerProps.onClick),
          onFocus: withTriggerHandler((focusEvent: React.FocusEvent<HTMLElement>) => {
            ref.current.focus = true;
            ref.current.node = asElement(
              focusEvent.currentTarget,
            ) as HTMLElement | null;
            requestImplementation();
          }, triggerProps.onFocus),
          onBlur: withTriggerHandler(() => {
            ref.current.focus = false;
            scheduleAdoption();
          }, triggerProps.onBlur),
        };
      },
      [scheduleAdoption, listenForPointerRelease, requestImplementation],
    ),
    trackTrigger: loadedTooltip?.track,
  };
}
function disableElementAutofocus(element: React.ReactNode): React.ReactNode {
  if (reactDeferredTooltip.isValidElement(element)) {
    return reactDeferredTooltip.cloneElement(
      element as React.ReactElement<{
        autoFocus?: boolean;
      }>,
      {
        autoFocus: false,
      },
    );
  } else {
    return element;
  }
}
function DeferredTooltip(tooltipProps: TooltipProps): React.ReactElement {
  useUiLocale();
  let {
      impl: value,
      wasCold: wasCold,
      interceptors: interceptors,
      trackTrigger: trackTrigger,
    } = useDeferredTooltipImplementation(true),
    disableAutofocus = tooltipProps.autoFocus === false;
  if (value !== null) {
    if (wasCold || disableAutofocus) {
      return (
        <value.Tooltip {...tooltipProps} triggerRef={trackTrigger}>
          {disableElementAutofocus(tooltipProps.children)}
        </value.Tooltip>
      );
    } else {
      return <value.Tooltip {...tooltipProps} />;
    }
  }
  let { children: children } = tooltipProps;
  if (!reactDeferredTooltip.isValidElement(children)) {
    return (
      <jsxForUiDisclosure.Fragment>{children}</jsxForUiDisclosure.Fragment>
    );
  }
  let trigger = children as React.ReactElement<TooltipTriggerProps>;
  return reactDeferredTooltip.cloneElement(trigger, {
    ...interceptors(trigger.props),
    ...pendingTooltipProps,
  });
}
function DeferredDisabledReasonTooltip(
  tooltipProps: DisabledTooltipProps,
): React.ReactElement {
  useUiLocale();
  let {
      impl: value,
      wasCold: wasCold,
      interceptors: interceptors,
    } = useDeferredTooltipImplementation(false),
    announcementId = reactDeferredTooltip.useId();
  if (value !== null) {
    if (wasCold) {
      return (
        <value.DisabledReasonTooltip {...tooltipProps}>
          {disableElementAutofocus(tooltipProps.children)}
        </value.DisabledReasonTooltip>
      );
    } else {
      return <value.DisabledReasonTooltip {...tooltipProps} />;
    }
  }
  let { reason: reason, wrapperClassName: wrapperClassName, children: children } = tooltipProps;
  return (
    <span
      {...getDisabledReasonWrapperProps(reason, announcementId, wrapperClassName)}
      title={typeof reason === "string" ? (reason) : (undefined)}
      {...interceptors({})}
      {...pendingTooltipProps}
    >
      {[children, <DisabledReasonAnnouncement id={announcementId} reason={reason} />]}
    </span>
  );
}
export {
  adoptTooltipTrigger,
  attachBeforeMatchStyleRecovery,
  cancelTooltipTouchHold,
  cancelTooltipUpdate,
  Collapsible,
  collapsibleIconClasses,
  CollapsiblePanel,
  collapsiblePanelClasses,
  CollapsibleRoot,
  CollapsibleTrigger,
  collapsibleTriggerClasses,
  COMPACTABLE_ATTRIBUTE,
  compactableControlContext,
  DeferredDisabledReasonTooltip,
  DeferredTooltip,
  deferredTooltipImplementationContext,
  DelayedScreenReaderLabel,
  disableElementAutofocus,
  disclosurePanelClasses,
  hasNonVisibleFocus,
  isHeightTransition,
  jsxEq,
  jsxForUiDisclosure,
  loadedTooltipImplementation,
  loadTooltipImplementation,
  observeDisclosureAnimation,
  overrideInlineStyles,
  pendingTooltipProps,
  preloadTooltipsOnInteraction,
  preventRepeatedClickSelection,
  react_k,
  reactArtifactRoot,
  reactcK,
  reactDOMClientForUiDisclosure,
  reactDOMForUiDisclosure,
  reactfk,
  reactForUiDisclosure,
  reactCollapsible,
  reactCompactableDebug,
  reactDeferredTooltip,
  reactXk,
  releaseTooltipTouchHold,
  repeatedClickSelectionProps,
  requestTooltipPreload,
  resolveTooltipImplementation,
  restoreDeferredTooltipFocus,
  scheduleTooltipUpdate,
  Spinner,
  spinnerSizeAliases,
  spinnerSizeMetrics,
  tooltipBatchCallbacks,
  tooltipBatchTimer,
  tooltipImplementationListeners,
  tooltipImplementationPromise,
  tooltipPreloadEvents,
  tooltipPreloadStarted,
  TOUCH_TOOLTIP_HOLD_MS,
  useCompactableControl,
  useCompactableControlDebug,
  useDeferredTooltipImplementation,
  useDisclosureAnimationRef,
  useDisclosurePanelRef,
  useHiddenUntilFoundRef,
  withRepeatedClickSelectionPrevention,
};
export function installUiDisclosure(): () => void {
  return () => {
    reactDOMClientForUiDisclosure = toModuleNamespace(
      loadReactDomClientNamespace(),
      1,
    );
    reactArtifactRoot = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactForUiDisclosure = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    initializeCdsRoot();
    initializeLayers();
    initializeIcons();
    initializeShortcuts();
    initializeTooltip();
    initializeClassNames();
    repeatedClickSelectionProps = Object.freeze({
      onMouseDown: preventRepeatedClickSelection,
    });
    initializeMergedRefs();
    react_k = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactXk = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    disclosurePanelClasses =
      "break-words h-[var(--cds-disclosure-panel-height)] transition-[height] duration-base ease-out motion-reduce:transition-none data-[starting-style]:h-0 data-[ending-style]:h-0 data-[starting-style]:[clip-path:inset(-8px_-100vw_0_-100vw)] data-[ending-style]:[clip-path:inset(-8px_-100vw_0_-100vw)] data-[animating]:[clip-path:inset(-8px_-100vw_0_-100vw)] data-[starting-style]:contain-layout data-[ending-style]:contain-layout data-[animating]:contain-layout";
    isHeightTransition = (animation: Animation) =>
      "transitionProperty" in animation && animation.transitionProperty === "height";
    observeDisclosureAnimation = (element: HTMLElement) => {
      let callback = () => {
          let isAnimating =
            element.hasAttribute("data-starting-style") ||
            element.hasAttribute("data-ending-style") ||
            (element.getAnimations?.().some(isHeightTransition) ?? false);
          element.toggleAttribute("data-animating", isAnimating);
        },
        value = new (element.ownerDocument.defaultView?.MutationObserver ??
          MutationObserver)(callback);
      value.observe(element, {
        attributeFilter: ["data-starting-style", "data-ending-style"],
      });
      callback();
      let handleTransitionStart = (event: TransitionEvent) => {
          if (event.target === element && event.propertyName === "height") {
            element.setAttribute("data-animating", "");
          }
        },
        handleTransitionFinish = (event: TransitionEvent) => {
          if (event.target === element && event.propertyName === "height") {
            callback();
          }
        };
      element.addEventListener("transitionrun", handleTransitionStart);
      element.addEventListener("transitionend", handleTransitionFinish);
      element.addEventListener("transitioncancel", handleTransitionFinish);
      return () => {
        value.disconnect();
        element.removeEventListener("transitionrun", handleTransitionStart);
        element.removeEventListener("transitionend", handleTransitionFinish);
        element.removeEventListener("transitioncancel", handleTransitionFinish);
        element.removeAttribute("data-animating");
      };
    };
    useDisclosureAnimationRef = () => {
      let ref = reactXk.useRef<(() => void) | null>(null);
      return reactXk.useCallback((element: HTMLElement | null) => {
        ref.current?.();
        ref.current = element ? observeDisclosureAnimation(element) : null;
      }, []);
    };
    useDisclosurePanelRef = (forwardedRef: React.Ref<HTMLElement> | undefined) =>
      useMergedRefs(
        forwardedRef,
        useDisclosureAnimationRef(),
        useHiddenUntilFoundRef(),
      );
    initializeIcons();
    reactCollapsible = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDOMForUiDisclosure = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    CollapsibleRoot = reactCollapsible.forwardRef(
      (
        rootProps: CollapsibleRootProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => (
        <baseCollapsible.Root
          ref={forwardedRef}
          data-cds={"Collapsible"}
          {...rootProps}
        />
      ),
    );
    CollapsibleRoot.displayName = "Collapsible.Root";
    collapsibleTriggerClasses =
      "cds-reset group/clp inline-flex w-fit items-center gap-1.5 border-0 select-none outline-none focus-visible:outline-hidden font-sans text-body font-normal text-secondary hover:text-primary transition-shadow duration-fast focus-visible:shadow-focus rounded data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none";
    collapsibleIconClasses =
      "shrink-0 transition-transform rtl:rotate-180 group-data-[panel-open]/clp:rotate-90";
    CollapsibleTrigger = reactCollapsible.forwardRef(
      (
        {
          className: className,
          children: children,
          caretPosition: caretPosition,
          hideCaret: hideCaret,
          render: render,
          ...props
        }: CollapsibleTriggerProps,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement => {
        let value = withRepeatedClickSelectionPrevention(props.onMouseDown),
          caretIcon = hideCaret ? null : (
            <Icon
              name={"CaretRight"}
              size={"sm"}
              className={clsx(
                collapsibleIconClasses,
                caretPosition === "end" && "ms-auto",
              )}
            />
          );
        if (render) {
          return (
            <baseCollapsible.Trigger
              ref={forwardedRef}
              render={render}
              className={className}
              {...props}
              onMouseDown={value}
            />
          );
        } else {
          return (
            <baseCollapsible.Trigger
              ref={forwardedRef}
              {...props}
              className={cn(collapsibleTriggerClasses, className)}
              onMouseDown={value}
            >
              {[caretPosition !== "end" && caretIcon, children, caretPosition === "end" && caretIcon]}
            </baseCollapsible.Trigger>
          );
        }
      },
    );
    CollapsibleTrigger.displayName = "Collapsible.Trigger";
    collapsiblePanelClasses = `${disclosurePanelClasses} [--cds-disclosure-panel-height:var(--collapsible-panel-height)]`;
    CollapsiblePanel = reactCollapsible.forwardRef(
      (
        { className: className, ...props }: CollapsiblePanelProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = useDisclosurePanelRef(forwardedRef);
        return (
          <baseCollapsible.Panel
            ref={value}
            {...props}
            className={cn(collapsiblePanelClasses, className)}
          />
        );
      },
    );
    CollapsiblePanel.displayName = "Collapsible.Panel";
    Collapsible = {
      Root: CollapsibleRoot,
      Trigger: CollapsibleTrigger,
      Panel: CollapsiblePanel,
    };
    initializeClassNames();
    initializeRemScale();
    reactcK = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxEq = toModuleNamespace(loadJsxNamespace(), 1);
    spinnerSizeAliases = {
      s: "sm",
      m: "md",
      l: "lg",
    };
    spinnerSizeMetrics = {
      sm: {
        box: 12,
        stroke: 1.5,
      },
      md: {
        box: 16,
        stroke: 1.75,
      },
      lg: {
        box: 20,
        stroke: 2,
      },
    };
    initializeClassNames();
    initializeCdsLink();
    initializeCdsRoot();
    initializeRemScale();
    initializeIcons();
    initializeShortcuts();
    initializeDisabledReasonDebug();
    initializeTooltipContext();
    reactfk = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    compactableControlContext = reactfk.createContext<CompactableControlState>({
      compact: false,
    });
    COMPACTABLE_ATTRIBUTE = "data-cds-compactable";
    reactCompactableDebug = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    initializeElementAccess();
    initializeDisabledReason();
    initializeTooltipContext();
    reactDeferredTooltip = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiDisclosure = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    loadedTooltipImplementation = null;
    tooltipImplementationPromise = null;
    tooltipImplementationListeners = new Set();
    tooltipBatchTimer = null;
    tooltipBatchCallbacks = new Set();
    tooltipPreloadEvents = ["pointermove", "keydown", "touchstart"];
    tooltipPreloadStarted = false;
    pendingTooltipProps = {
      "data-cds-tooltip-pending": "",
    };
    TOUCH_TOOLTIP_HOLD_MS = 700;
    deferredTooltipImplementationContext =
      reactDeferredTooltip.createContext<DeferredTooltipScope | null>(null);
  };
}
