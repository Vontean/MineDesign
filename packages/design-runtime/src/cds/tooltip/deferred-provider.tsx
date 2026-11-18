import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
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
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { asElement, initializeHooksStableCallback } from "../hooks/stable-callback";
import { DisabledReasonDescription, disabledReasonWrapperProps, initializeTooltipDisabledReason } from "./disabled-reason";
import { tooltipImplementationExports } from "./styles";
import { initializeTooltipTooltip } from "./tooltip";
import { initializeTooltipTrigger, TooltipImplementationContext } from "./trigger";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactTooltipDeferredProvider: typeof React;
var jsxTooltipDeferredProvider: typeof import("react/jsx-runtime");
var TooltipDeferredProviderCurrentState: TooltipImplementation | null;
var tooltipImplementationPromise: Promise<TooltipImplementation> | null;
var TooltipDeferredProviderSubscribers: Set<() => void>;
var tooltipHandoffTimer: ReturnType<
  typeof setTimeout
> | null;
var tooltipHandoffCallbacks: Set<() => void>;
var TooltipDeferredProviderPointermoveKeydownTouchstartValues: string[];
var tooltipPreloadArmed: boolean;
var TooltipDeferredProviderDataCdsTooltipPendingConfig: {
  "data-cds-tooltip-pending": string;
};
var TooltipDeferredProviderDelayMs: number;
var TooltipDeferredProviderContext: React.Context<DeferredTooltipScope | null>;
var initializeTooltipDeferredProvider: () => void;
function scheduleTooltipHandoff(handoffCallback: () => void): void {
  tooltipHandoffCallbacks.add(handoffCallback);
  tooltipHandoffTimer ??= setTimeout(() => {
    tooltipHandoffTimer = null;
    let items = [...tooltipHandoffCallbacks];
    tooltipHandoffCallbacks.clear();
    for (let value of items) value();
  }, 0);
}
function cancelTooltipHandoff(handoffCallback: () => void): void {
  tooltipHandoffCallbacks.delete(handoffCallback);
}
function loadTooltipImplementation(): Promise<TooltipImplementation> {
  tooltipImplementationPromise ??= Promise.resolve()
    .then(
      () => (
        initializeTooltipTooltip(),
        tooltipImplementationExports as TooltipImplementation
      ),
    )
    .then(
      (implementation) => {
        TooltipDeferredProviderCurrentState = implementation;
        for (let value of TooltipDeferredProviderSubscribers) value();
        return implementation;
      },
      (error: unknown) => {
        throw ((tooltipImplementationPromise = null), error);
      },
    );
  return tooltipImplementationPromise;
}
function preloadTooltipsAfterInteraction(): void {
  if (
    !(tooltipPreloadArmed || TooltipDeferredProviderCurrentState !== null) &&
    !(typeof document === "undefined")
  ) {
    tooltipPreloadArmed = true;
    for (let value of TooltipDeferredProviderPointermoveKeydownTouchstartValues)
      document.addEventListener(value, preloadTooltips, {
        capture: true,
        passive: true,
        once: true,
      });
  }
}
function preloadTooltips(): void {
  loadTooltipImplementation().catch(() => {});
}
function trackDeferredTooltipNode(
  tooltipNode: DeferredTooltipNode,
  element: HTMLElement | null,
): void {
  tooltipNode.node = element;
  element !== null &&
    ((tooltipNode.adopted = true),
    tooltipNode.handBack &&
      ((tooltipNode.handBack = false),
      queueMicrotask(() => restoreTooltipFocus(tooltipNode, element))));
}
function restoreTooltipFocus(
  tooltipNode: DeferredTooltipNode,
  element: HTMLElement,
): void {
  if (!element.isConnected || !tooltipNode.focus) return;
  let activeElement = element.ownerDocument.activeElement;
  (activeElement !== null && activeElement !== element.ownerDocument.body) ||
    element.focus({
      preventScroll: true,
    });
}
function cancelTooltipTapHold(tooltipNode: DeferredTooltipNode): void {
  tooltipNode.tapHold !== null &&
    (clearTimeout(tooltipNode.tapHold), (tooltipNode.tapHold = null));
}
function interceptTooltipPointer(
  tooltipNode: DeferredTooltipNode,
  pointerEvent: TooltipPointerEvent,
  release: () => void,
): void {
  cancelTooltipTapHold(tooltipNode);
  if (
    tooltipNode.down &&
    pointerEvent.type === "pointerup" &&
    (pointerEvent.pointerType === "touch" || pointerEvent.pointerType === "pen")
  ) {
    tooltipNode.tapHold = setTimeout(() => {
      tooltipNode.tapHold = null;
      tooltipNode.down = false;
      release();
    }, TooltipDeferredProviderDelayMs);
    return;
  }
  tooltipNode.down = false;
  release();
}
function getTooltipImplementation(
  scope: DeferredTooltipScope | null,
): TooltipImplementation | null {
  return TooltipDeferredProviderCurrentState !== null
    ? TooltipDeferredProviderCurrentState
    : scope === null
      ? null
      : scope.ambientImpl();
}
function DeferredTooltipProvider({
  children: children,
}: React.PropsWithChildren): React.ReactElement {
  useUiLocale();
  let value = (0, reactTooltipDeferredProvider.useContext)(
      TooltipImplementationContext,
    ),
    ambientImplRef = (0, reactTooltipDeferredProvider.useRef)(value);
  (0, reactTooltipDeferredProvider.useEffect)(() => {
    ambientImplRef.current = value;
  }, [value]);
  let [scope] = (0,
  reactTooltipDeferredProvider.useState)<DeferredTooltipScope>(() => {
    let flag = true,
      values: Set<() => void> | null = new Set();
    return {
      ambientImpl: () => ambientImplRef.current,
      isDeferred: () => flag,
      subscribe: (listener) => {
        let currentListeners = values;
        return currentListeners === null
          ? () => {}
          : (currentListeners.add(listener), () => currentListeners.delete(listener));
      },
      engage: () => {
        if (!flag) return;
        flag = false;
        let pendingListeners = values;
        values = null;
        if (pendingListeners !== null) for (let pendingListener of pendingListeners) pendingListener();
      },
    };
  });
  if (!(0, reactTooltipDeferredProvider.isValidElement)(children))
    return (
      <jsxTooltipDeferredProvider.Fragment>
        {children}
      </jsxTooltipDeferredProvider.Fragment>
    );
  let triggerElement: React.ReactElement<TooltipTriggerProps> =
      children as React.ReactElement<TooltipTriggerProps>,
    callback =
      <Event extends React.SyntheticEvent>(
        engage: () => void,
        originalHandler: ((event: Event) => void) | undefined,
      ): ((event: Event) => void) =>
      (event) => {
        engage();
        originalHandler?.(event);
      };
  return (
    <TooltipDeferredProviderContext.Provider value={scope}>
      <TooltipImplementationContext.Provider value={null}>
        {(0, reactTooltipDeferredProvider.cloneElement)(
          triggerElement as React.ReactElement<TooltipTriggerProps>,
          {
            onPointerEnter: callback(
              scope.engage,
              triggerElement.props.onPointerEnter,
            ),
            onFocus: callback(scope.engage, triggerElement.props.onFocus),
          },
        )}
      </TooltipImplementationContext.Provider>
    </TooltipDeferredProviderContext.Provider>
  );
}
function isPointerFocused(element: Element): boolean {
  if (element.ownerDocument.activeElement !== element) return false;
  try {
    return !element.matches(":focus-visible");
  } catch {
    return false;
  }
}
function useDeferredTooltipImplementation(
  shouldTrackNode: boolean,
): DeferredTooltipState {
  let value = (0, reactTooltipDeferredProvider.useContext)(
      TooltipImplementationContext,
    ),
    scope = (0, reactTooltipDeferredProvider.useContext)(
      TooltipDeferredProviderContext,
    ),
    [loadState, setLoadState] = (0,
    reactTooltipDeferredProvider.useState)<DeferredTooltipLoad | null>(() => {
      let initialImpl =
        value ??
        (scope !== null && scope.isDeferred()
          ? null
          : getTooltipImplementation(scope));
      return initialImpl === null
        ? null
        : {
            impl: initialImpl,
            track: undefined,
          };
    }),
    impl = loadState === null ? null : loadState.impl,
    [wasCold] = (0, reactTooltipDeferredProvider.useState)(impl === null),
    nodeStateRef: React.RefObject<DeferredTooltipNode> = (0,
    reactTooltipDeferredProvider.useRef)({
      hover: false,
      focus: false,
      down: false,
      node: null,
      adopted: false,
      handBack: false,
      tapHold: null,
    }),
    hadAmbientImplRef = (0, reactTooltipDeferredProvider.useRef)(false),
    adoptImplementation = (0, reactTooltipDeferredProvider.useCallback)(() => {
      if (nodeStateRef.current.adopted || (scope !== null && scope.isDeferred()))
        return;
      let {
        hover: current,
        focus: isFocused,
        down: isPointerDown,
        node: trackedNode,
      } = nodeStateRef.current;
      if (isPointerDown) return;
      let hadAmbientImpl = hadAmbientImplRef.current;
      hadAmbientImplRef.current = false;
      let needsHandBack =
        isFocused && shouldTrackNode && trackedNode !== null && isPointerFocused(trackedNode);
      if (isFocused && !needsHandBack) return;
      let ambientImpl = getTooltipImplementation(scope);
      if (ambientImpl !== null && (!current || hadAmbientImpl)) {
        let nodeState = nodeStateRef.current;
        nodeState.handBack = needsHandBack;
        setLoadState(
          (previousLoad) =>
            previousLoad ?? {
              impl: ambientImpl,
              track: shouldTrackNode
                ? (element) => trackDeferredTooltipNode(nodeState, element)
                : undefined,
            },
        );
      }
    }, [scope, shouldTrackNode]),
    scheduleAdoption = (0, reactTooltipDeferredProvider.useCallback)(() => {
      getTooltipImplementation(scope) !== null &&
        scheduleTooltipHandoff(adoptImplementation);
    }, [scope, adoptImplementation]),
    onScopeEngaged = (0, reactTooltipDeferredProvider.useCallback)(() => {
      hadAmbientImplRef.current = getTooltipImplementation(scope) !== null;
      scheduleAdoption();
    }, [scheduleAdoption, scope]),
    pointerListenerRef: React.RefObject<((event: PointerEvent) => void) | null> = (0,
    reactTooltipDeferredProvider.useRef)(null),
    removePointerListener = (0, reactTooltipDeferredProvider.useCallback)(() => {
      let current = pointerListenerRef.current;
      current !== null &&
        ((pointerListenerRef.current = null),
        document.removeEventListener("pointerup", current, true),
        document.removeEventListener("pointercancel", current, true));
    }, []),
    addPointerListener = (0, reactTooltipDeferredProvider.useCallback)(
      (expectedPointerId?: number): void => {
        if (pointerListenerRef.current !== null || typeof document === "undefined")
          return;
        let callback = (pointerEvent: PointerEvent): void => {
          let pointerId = pointerEvent.pointerId;
          (expectedPointerId !== undefined &&
            pointerId !== undefined &&
            pointerId !== expectedPointerId) ||
            (removePointerListener(),
            interceptTooltipPointer(nodeStateRef.current, pointerEvent, scheduleAdoption));
        };
        pointerListenerRef.current = callback;
        document.addEventListener("pointerup", callback, {
          capture: true,
        });
        document.addEventListener("pointercancel", callback, {
          capture: true,
        });
      },
      [scheduleAdoption, removePointerListener],
    );
  (0, reactTooltipDeferredProvider.useEffect)(() => {
    if (!wasCold) return;
    preloadTooltipsAfterInteraction();
    let current = nodeStateRef.current,
      callback = (): void => {
        cancelTooltipHandoff(adoptImplementation);
        current.tapHold !== null &&
          (cancelTooltipTapHold(current), (current.down = false));
        removePointerListener();
      },
      items: (() => void)[] = [],
      isScopeDeferred = scope !== null && scope.isDeferred();
    isScopeDeferred &&
      items.push((scope as DeferredTooltipScope).subscribe(onScopeEngaged));
    TooltipDeferredProviderCurrentState === null &&
      (TooltipDeferredProviderSubscribers.add(scheduleAdoption),
      items.push(() => TooltipDeferredProviderSubscribers.delete(scheduleAdoption)));
    !isScopeDeferred &&
      getTooltipImplementation(scope) !== null &&
      (scope !== null && (hadAmbientImplRef.current = true), scheduleAdoption());
    return () => {
      for (let unsubscribe of items) unsubscribe();
      callback();
    };
  }, [scheduleAdoption, onScopeEngaged, scope, removePointerListener, adoptImplementation, wasCold]);
  let startLoading = (0, reactTooltipDeferredProvider.useCallback)(() => {
    loadTooltipImplementation().catch(() => {});
  }, []);
  return {
    impl: impl,
    wasCold: wasCold,
    interceptors: (0, reactTooltipDeferredProvider.useCallback)(
      (triggerProps) => {
        let callback =
          <Event extends React.SyntheticEvent>(
            handler: (event: Event) => void,
            originalHandler: ((event: Event) => void) | undefined,
          ): ((event: Event) => void) =>
          (event) => {
            handler(event);
            originalHandler?.(event);
          };
        return {
          onPointerEnter: callback(() => {
            nodeStateRef.current.hover = true;
            startLoading();
          }, triggerProps.onPointerEnter),
          onPointerLeave: callback(() => {
            nodeStateRef.current.hover = false;
            scheduleAdoption();
          }, triggerProps.onPointerLeave),
          onPointerDown: callback((event) => {
            event.isPrimary !== false &&
              event.button === 0 &&
              (cancelTooltipTapHold(nodeStateRef.current),
              (nodeStateRef.current.down = true),
              addPointerListener(event.pointerId));
          }, triggerProps.onPointerDown),
          onPointerUp: callback((event) => {
            event.isPrimary !== false &&
              interceptTooltipPointer(nodeStateRef.current, event, scheduleAdoption);
          }, triggerProps.onPointerUp),
          onPointerCancel: callback((event) => {
            event.isPrimary !== false &&
              interceptTooltipPointer(nodeStateRef.current, event, scheduleAdoption);
          }, triggerProps.onPointerCancel),
          onClick: callback((event) => {
            nodeStateRef.current.tapHold !== null &&
              interceptTooltipPointer(nodeStateRef.current, event, scheduleAdoption);
          }, triggerProps.onClick),
          onFocus: callback((event) => {
            nodeStateRef.current.focus = true;
            nodeStateRef.current.node = asElement(
              event.currentTarget,
            ) as HTMLElement | null;
            startLoading();
          }, triggerProps.onFocus),
          onBlur: callback(() => {
            nodeStateRef.current.focus = false;
            scheduleAdoption();
          }, triggerProps.onBlur),
        };
      },
      [scheduleAdoption, addPointerListener, startLoading],
    ),
    trackTrigger: loadState?.track,
  };
}
function disableAutoFocus(node: React.ReactNode): React.ReactNode {
  return (0, reactTooltipDeferredProvider.isValidElement)(node)
    ? (0, reactTooltipDeferredProvider.cloneElement)(
        node as React.ReactElement<TooltipTriggerProps>,
        {
          autoFocus: false,
        },
      )
    : node;
}
function DeferredTooltip(props: TooltipProps): React.ReactElement {
  useUiLocale();
  let {
      impl: value,
      wasCold: wasCold,
      interceptors: interceptors,
      trackTrigger: trackTrigger,
    } = useDeferredTooltipImplementation(true),
    hasAutoFocusDisabled = props.autoFocus === false;
  if (value !== null)
    return wasCold || hasAutoFocusDisabled ? (
      <value.Tooltip {...props} triggerRef={trackTrigger}>
        {disableAutoFocus(props.children)}
      </value.Tooltip>
    ) : (
      <value.Tooltip {...props} />
    );
  let { children: children } = props;
  if (!(0, reactTooltipDeferredProvider.isValidElement)(children))
    return (
      <jsxTooltipDeferredProvider.Fragment>
        {children}
      </jsxTooltipDeferredProvider.Fragment>
    );
  let triggerElement: React.ReactElement<TooltipTriggerProps> =
    children as React.ReactElement<TooltipTriggerProps>;
  return (0, reactTooltipDeferredProvider.cloneElement)(
    triggerElement as React.ReactElement<TooltipTriggerProps>,
    {
      ...interceptors(triggerElement.props),
      ...TooltipDeferredProviderDataCdsTooltipPendingConfig,
    },
  );
}
function DeferredDisabledReasonTooltip(
  props: DisabledTooltipProps,
): React.ReactElement {
  useUiLocale();
  let {
      impl: value,
      wasCold: wasCold,
      interceptors: interceptors,
    } = useDeferredTooltipImplementation(false),
    descriptionId = (0, reactTooltipDeferredProvider.useId)();
  if (value !== null)
    return wasCold ? (
      <value.DisabledReasonTooltip {...props}>
        {disableAutoFocus(props.children)}
      </value.DisabledReasonTooltip>
    ) : (
      <value.DisabledReasonTooltip {...props} />
    );
  let { reason: reason, wrapperClassName: wrapperClassName, children: children } = props;
  return (
    <span
      {...disabledReasonWrapperProps(reason, descriptionId, wrapperClassName)}
      title={typeof reason == "string" ? (reason) : (undefined)}
      {...interceptors({})}
      {...TooltipDeferredProviderDataCdsTooltipPendingConfig}
    >
      {children}
      <DisabledReasonDescription id={descriptionId} reason={reason} />
    </span>
  );
}
export {
  cancelTooltipHandoff,
  cancelTooltipTapHold,
  DeferredDisabledReasonTooltip,
  DeferredTooltip,
  DeferredTooltipProvider,
  disableAutoFocus,
  getTooltipImplementation,
  initializeTooltipDeferredProvider,
  interceptTooltipPointer,
  isPointerFocused,
  jsxTooltipDeferredProvider,
  loadTooltipImplementation,
  preloadTooltips,
  preloadTooltipsAfterInteraction,
  reactTooltipDeferredProvider,
  restoreTooltipFocus,
  scheduleTooltipHandoff,
  TooltipDeferredProviderContext,
  TooltipDeferredProviderCurrentState,
  tooltipImplementationPromise as TooltipDeferredProviderCurrentState_2,
  tooltipHandoffTimer as TooltipDeferredProviderCurrentState_3,
  TooltipDeferredProviderDataCdsTooltipPendingConfig,
  TooltipDeferredProviderDelayMs,
  TooltipDeferredProviderPointermoveKeydownTouchstartValues,
  TooltipDeferredProviderSubscribers,
  tooltipHandoffCallbacks as TooltipDeferredProviderSubscribers_2,
  tooltipPreloadArmed,
  trackDeferredTooltipNode,
  useDeferredTooltipImplementation,
};
export function installCdsTooltipDeferredProvider(): () => void {
  return () => {
    initializeTooltipDeferredProvider = initializeOnce(() => {
      "use client";

      initializeHooksStableCallback();
      initializeTooltipDisabledReason();
      initializeTooltipTrigger();
      reactTooltipDeferredProvider = toModuleNamespace(
        load_react(),
      );
      jsxTooltipDeferredProvider = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      TooltipDeferredProviderCurrentState = null;
      tooltipImplementationPromise = null;
      TooltipDeferredProviderSubscribers = new Set();
      tooltipHandoffTimer = null;
      tooltipHandoffCallbacks = new Set();
      TooltipDeferredProviderPointermoveKeydownTouchstartValues = [
        "pointermove",
        "keydown",
        "touchstart",
      ];
      tooltipPreloadArmed = false;
      TooltipDeferredProviderDataCdsTooltipPendingConfig = {
        "data-cds-tooltip-pending": "",
      };
      TooltipDeferredProviderDelayMs = 700;
      TooltipDeferredProviderContext = (0,
      reactTooltipDeferredProvider.createContext)<DeferredTooltipScope | null>(
        null,
      );
    });
  };
}
