import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type {
  CollisionPadding,
  DisabledTooltipProps,
  EmptyTooltipContent,
  ForwardComponent,
  OverflowTooltipProps,
  PolymorphicTooltipTrigger,
  TooltipBodyState,
  TooltipBodyUpdate,
  TooltipImplementation,
  TooltipInstantActions,
  TooltipProps,
  TooltipTriggerProps,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { CollisionPaddingProvider, initializeIconContext } from "../components/icon";
import { initializeComponentsShortcut, Shortcut } from "../components/shortcut";
import { initializeShrinkWrapComponent, useShrinkWrap } from "../components/shrink-wrap";
import { initializeDomInputObservation, isRestoredFocus } from "../dom/input-observation";
import { initializeDomRefComposition, useMergedRefs } from "../dom/ref-composition";
import { initializeStableCallbackReact, useOptionalStableCallback } from "../hooks/stable-callback";
import { initializeOverlaysLayers, LayerBaseContext, useDefaultLayer } from "../overlays/layers";
import { initializeRootFontSizeHooks, PopupSurface } from "../platform/root-font-size";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeCdsRoot, useOverlayRoot } from "../theme/root";
import { DisabledReasonDescription, disabledReasonWrapperProps, hasDisabledReason, initializeTooltipDisabledReason } from "./disabled-reason";
import { DarkScope, initializeTooltipStyles, tooltipImplementationExports, tooltipPopupClasses, TooltipStylesCss, compactTooltipClassName, tooltipTextWrapClasses } from "./styles";
import { initializeTooltipTrigger, initializeTooltipTriggerElementCache, initializeTooltipDelayReact, measureContentRect, TooltipImplementationContext, TooltipTriggerContext, useTooltipDelay, useTooltipTrigger } from "./trigger";
import { initializeNpm__base_ui_react_V8e, load_react, load_react_jsx_runtime, npm_Tooltip_Ax } from "../../dependencies";
import { defineLiveExports, initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactTooltipTooltip: typeof React;
var jsxTooltipTooltip: typeof import("react/jsx-runtime");
var TooltipTooltipCurrentState: React.RefObject<TooltipInstantActions> | null;
var emptyTooltipContent: EmptyTooltipContent;
var TooltipTooltipOpenBodyConfig: TooltipBodyState;
var TooltipTooltipOpen: TooltipBodyUpdate;
var closeTooltipBodyState: TooltipBodyUpdate;
var TooltipTooltipBody: TooltipBodyUpdate;
var openTooltipBodyUpdate: (input: React.ReactNode) => TooltipBodyUpdate;
var TooltipTooltipIs: (input: React.ReactNode) => TooltipBodyUpdate;
var clearTooltipBodyState: TooltipBodyUpdate;
var TooltipStylesCssAlias: string;
var TooltipTooltipClassNames: string;
var TooltipTooltipAlias: string;
var tooltipBodyClassName: string;
var SelfStartValue: string;
var TooltipTooltipCss: string;
var OverflowTooltip: ForwardComponent<HTMLSpanElement, OverflowTooltipProps>;
var TooltipTooltipTooltipDisabledReasonTooltipConfig: Pick<
  TooltipImplementation,
  "Tooltip" | "DisabledReasonTooltip"
>;
var TooltipTooltipContext: React.Context<boolean>;
var initializeTooltipTooltip: () => void;
function cancelRestoredTooltipFocus(
  isOpening: boolean,
  eventDetails: import("@base-ui/react/tooltip").Tooltip.Root.ChangeEventDetails,
): boolean {
  return isOpening &&
    eventDetails.reason === "trigger-focus" &&
    isRestoredFocus(eventDetails.event)
    ? (eventDetails.cancel(), true)
    : false;
}
function activateTooltip(
  actions: React.RefObject<TooltipInstantActions>,
): void {
  TooltipTooltipCurrentState !== null &&
    TooltipTooltipCurrentState !== actions &&
    TooltipTooltipCurrentState.current?.closeInstant();
  TooltipTooltipCurrentState = actions;
}
function isEmptyTooltipContent(content: React.ReactNode): boolean {
  return (
    content == null ||
    content === "" ||
    typeof content == "boolean" ||
    (Array.isArray(content) && content.every(isEmptyTooltipContent))
  );
}
function resolveTooltipContent(
  readContent: () => React.ReactNode,
): React.ReactNode | EmptyTooltipContent {
  let value = readContent();
  return isEmptyTooltipContent(value as React.ReactNode)
    ? emptyTooltipContent
    : value;
}
function TooltipShortcut({
  keys: keys,
  className: className,
}: {
  keys?: string | readonly string[];
  className?: string;
}): React.ReactElement {
  useUiLocale();
  return (
    <Shortcut
      keys={keys}
      variant={"text"}
      className={cn(
        "text-[calc(0.75rem*var(--cds-rem-scale,1))] [--cds-shortcut-cap-ink:var(--cds-text-muted)]",
        className,
      )}
    />
  );
}
function Tooltip({
  content: content,
  detail: detailText,
  secondaryHint: secondaryHint,
  multiline: multiline,
  shortcut: shortcut,
  side = "top",
  align: align,
  sideOffset = 4,
  collisionPadding: collisionPadding,
  trackCursorAxis: trackCursorAxis,
  delay = 300,
  open: open,
  onOpenChange: onOpenChange,
  closeDelay: closeDelay,
  hoverable = true,
  closeOnClick: closeOnClick,
  lazy = false,
  openOnHandedBackFocus = false,
  triggerRef: triggerRef,
  container: container,
  className: className,
  children: children,
}: TooltipProps): React.ReactElement {
  useUiLocale();
  let value = useOverlayRoot(),
    shrinkWrapRef = useShrinkWrap({
      immediate: true,
    }),
    triggerId = (0, reactTooltipTooltip.useId)(),
    actionsRef = (0, reactTooltipTooltip.useRef)<
      import("@base-ui/react/tooltip").Tooltip.Root.Actions | null
    >(null),
    [skipTransition, setSkipTransition] = (0, reactTooltipTooltip.useState)(false),
    instantActionsRef: React.RefObject<TooltipInstantActions> = (0,
    reactTooltipTooltip.useRef)({
      closeInstant: () => {
        setSkipTransition(true);
        actionsRef.current?.close();
      },
    }),
    [hoverTrigger, setHoverTrigger] = (0, reactTooltipTooltip.useState)<Element | null>(
      null,
    ),
    [bodyState, setBodyState] = (0, reactTooltipTooltip.useState)(
      TooltipTooltipOpenBodyConfig,
    );
  open === false && bodyState.open && setBodyState(closeTooltipBodyState);
  let isContentFunction = typeof content == "function",
    hasContent = isContentFunction || !isEmptyTooltipContent(content as React.ReactNode),
    displayedBody: React.ReactNode = (
      !isContentFunction && hasContent ? content : bodyState.body
    ) as React.ReactNode,
    hasDisplayedBody = !isEmptyTooltipContent(displayedBody as React.ReactNode),
    isOpen = (open ?? bodyState.open) && (!isContentFunction || hasDisplayedBody);
  !isContentFunction &&
    hasContent &&
    isOpen &&
    !Object.is(bodyState.body, content) &&
    setBodyState(TooltipTooltipIs(content as React.ReactNode));
  let handleOpenChange = (0, reactTooltipTooltip.useCallback)(
      (
        nextOpen: boolean,
        eventDetails: import("@base-ui/react/tooltip").Tooltip.Root.ChangeEventDetails,
      ): boolean => {
        if (
          !openOnHandedBackFocus &&
          cancelRestoredTooltipFocus(nextOpen, eventDetails)
        )
          return false;
        if (nextOpen) {
          if (typeof content != "function")
            setBodyState(openTooltipBodyUpdate(content));
          else if (isOpen) setBodyState(TooltipTooltipOpen);
          else {
            let resolvedContent = resolveTooltipContent(content);
            if (resolvedContent === emptyTooltipContent) {
              eventDetails.cancel();
              return false;
            }
            setBodyState(openTooltipBodyUpdate(resolvedContent));
          }
          setSkipTransition(false);
          activateTooltip(instantActionsRef);
        } else {
          setBodyState(isOpen ? closeTooltipBodyState : clearTooltipBodyState);
          TooltipTooltipCurrentState === instantActionsRef &&
            (TooltipTooltipCurrentState = null);
        }
        setHoverTrigger(
          nextOpen && eventDetails.reason === "trigger-hover"
            ? (eventDetails.trigger ?? null)
            : null,
        );
        onOpenChange?.(nextOpen);
        return true;
      },
      [onOpenChange, openOnHandedBackFocus, content, isOpen],
    ),
    isControlled = open !== undefined,
    bodyOpen = bodyState.open;
  (0, reactTooltipTooltip.useEffect)(() => {
    if (!(!isControlled || !hasContent || !hasDisplayedBody)) {
      open
        ? activateTooltip(instantActionsRef)
        : TooltipTooltipCurrentState === instantActionsRef &&
          (TooltipTooltipCurrentState = null);
      return () => {
        !bodyOpen &&
          TooltipTooltipCurrentState === instantActionsRef &&
          (TooltipTooltipCurrentState = null);
      };
    }
  }, [isControlled, open, hasContent, hasDisplayedBody, bodyOpen, isContentFunction]);
  let handleOpenChangeComplete = (0, reactTooltipTooltip.useCallback)(
    (nextOpen: boolean): void => {
      nextOpen || (setSkipTransition(false), setHoverTrigger(null), setBodyState(TooltipTooltipBody));
    },
    [],
  );
  (0, reactTooltipTooltip.useEffect)(() => {
    if (!hoverTrigger) return;
    let ownerDocument = hoverTrigger.ownerDocument,
      callback = (event: Event): void => {
        let target = event.target;
        target &&
          target !== hoverTrigger &&
          (target as Node).contains(hoverTrigger) &&
          instantActionsRef.current.closeInstant();
      };
    ownerDocument.addEventListener("scroll", callback, {
      capture: true,
      passive: true,
    });
    return () => {
      ownerDocument.removeEventListener("scroll", callback, {
        capture: true,
      });
    };
  }, [hoverTrigger]);
  (0, reactTooltipTooltip.useEffect)(
    () => () => {
      TooltipTooltipCurrentState === instantActionsRef &&
        (TooltipTooltipCurrentState = null);
    },
    [],
  );
  let layer = useDefaultLayer("tooltip"),
    [lazyHandle] = (0, reactTooltipTooltip.useState)(() =>
      lazy && open === undefined
        ? npm_Tooltip_Ax.createHandle()
        : null,
    ),
    [lazyMounted, setLazyMounted] = (0, reactTooltipTooltip.useState)(false),
    isRootMounted = lazyMounted || lazyHandle === null,
    mountRequestedRef = (0, reactTooltipTooltip.useRef)(false),
    mountRoot = (0, reactTooltipTooltip.useCallback)(() => {
      mountRequestedRef.current = true;
      setLazyMounted(true);
    }, []),
    delayTimer = useTooltipDelay(),
    pendingTriggerRef = (0, reactTooltipTooltip.useRef)<HTMLElement | null>(null),
    openedByDelayRef = (0, reactTooltipTooltip.useRef)(false);
  (0, reactTooltipTooltip.useEffect)(() => {
    open === false && (openedByDelayRef.current = false);
  }, [open]);
  let openAfterDelay = useOptionalStableCallback(() => {
      if (mountRequestedRef.current || isRootMounted || !hasContent || open !== undefined)
        return;
      let delayedContent: React.ReactNode;
      if (typeof content == "function") {
        let resolvedDelayedContent = resolveTooltipContent(content);
        if (resolvedDelayedContent === emptyTooltipContent) return;
        delayedContent = resolvedDelayedContent;
      } else delayedContent = content;
      mountRoot();
      setSkipTransition(false);
      activateTooltip(instantActionsRef);
      setHoverTrigger(pendingTriggerRef.current);
      setBodyState(openTooltipBodyUpdate(delayedContent));
      openedByDelayRef.current = true;
      onOpenChange?.(true);
    }),
    handlePointerEnter: (event: React.PointerEvent<HTMLElement>) => void = useOptionalStableCallback((event) => {
      isRootMounted ||
        event.pointerType === "touch" ||
        (hasContent &&
          ((pendingTriggerRef.current = event.currentTarget),
          delayTimer.start(delay, openAfterDelay)));
    }),
    handlePointerDown = useOptionalStableCallback(() => {
      closeOnClick !== false && delayTimer.cancel();
    }),
    handleFocus: (event: React.FocusEvent<HTMLElement>) => void = useOptionalStableCallback((event) => {
      isRootMounted ||
        ((event.target as Element).matches(":focus-visible") &&
          ((!openOnHandedBackFocus &&
            isRestoredFocus(event.nativeEvent)) ||
            ((pendingTriggerRef.current = null), delayTimer.cancel(), openAfterDelay())));
    });
  lazyHandle !== null && open === true && !lazyMounted && setLazyMounted(true);
  let handleLazyOpenChange = (0, reactTooltipTooltip.useCallback)(
      (
        nextOpen: boolean,
        eventDetails: import("@base-ui/react/tooltip").Tooltip.Root.ChangeEventDetails,
      ): void => {
        if (
          !(
            !openOnHandedBackFocus &&
            cancelRestoredTooltipFocus(nextOpen, eventDetails)
          )
        ) {
          if (nextOpen && openedByDelayRef.current && isOpen) {
            setBodyState(TooltipTooltipOpen);
            return;
          }
          handleOpenChange(nextOpen, eventDetails) && (openedByDelayRef.current = nextOpen);
        }
      },
      [handleOpenChange, openOnHandedBackFocus, isOpen],
    ),
    triggerRender: import("@base-ui/react/tooltip").Tooltip.Trigger.Props<void>["render"] =
      (0, reactTooltipTooltip.isValidElement)(children) &&
      children.type !== reactTooltipTooltip.Fragment
        ? children
        : (triggerProps: TooltipTriggerProps): React.ReactElement => (
            <span {...triggerProps} className={"inline-flex"}>
              {children}
            </span>
          ),
    trigger = (() => {
      const _Component = npm_Tooltip_Ax
        .Trigger as PolymorphicTooltipTrigger;
      return (
        <_Component
          ref={triggerRef}
          id={triggerId}
          delay={delay}
          closeDelay={closeDelay}
          closeOnClick={closeOnClick}
          handle={lazyHandle ?? undefined}
          disabled={lazyHandle !== null && !isRootMounted ? !hasContent : undefined}
          onPointerEnter={lazyHandle ? handlePointerEnter : undefined}
          onPointerLeave={lazyHandle ? delayTimer.cancel : undefined}
          onPointerDown={lazyHandle ? handlePointerDown : undefined}
          onFocus={lazyHandle ? handleFocus : undefined}
          render={triggerRender}
        />
      );
    })(),
    portal =
      isRootMounted && hasDisplayedBody ? (
        <npm_Tooltip_Ax.Portal container={container ?? value}>
          <PopupSurface>
            <CollisionPaddingProvider
              override={collisionPadding}
              container={container ?? value}
            >
              {(padding: CollisionPadding) => (
                <LayerBaseContext.Provider value={layer.base}>
                  <npm_Tooltip_Ax.Positioner
                    data-cds={"Tooltip"}
                    className={"data-[anchor-hidden]:invisible"}
                    style={layer.style}
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    collisionPadding={padding}
                  >
                    <npm_Tooltip_Ax.Popup
                      ref={shrinkWrapRef}
                      role={"tooltip"}
                      style={
                        skipTransition
                          ? {
                              transitionDuration: "0s",
                            }
                          : undefined
                      }
                      className={cn(
                        TooltipStylesCssAlias,
                        TooltipTooltipAlias,
                        multiline || detailText || secondaryHint
                          ? TooltipTooltipCss
                          : tooltipBodyClassName,
                        !shortcut && TooltipTooltipClassNames,
                        className,
                      )}
                    >
                      <DarkScope>
                        {multiline || detailText || secondaryHint ? (<jsxTooltipTooltip.Fragment>
                            <span
                              className={
                                "inline-flex min-w-0 items-center gap-2"
                              }
                            >
                              <span className={tooltipTextWrapClasses}>
                                {displayedBody}
                              </span>
                              {shortcut && (<TooltipShortcut keys={shortcut} />)}
                            </span>
                            {secondaryHint && (<span
                                className={
                                  "inline-flex min-w-0 items-center gap-2"
                                }
                              >
                                <span className={"min-w-0 break-words"}>
                                  {secondaryHint.label}
                                </span>
                                <TooltipShortcut
                                  keys={secondaryHint.shortcut}
                                />
                              </span>)}
                            {detailText && (<span
                                className={
                                  "break-words text-[calc(0.6875rem*var(--cds-rem-scale,1))]/[calc(0.875rem*var(--cds-rem-scale,1))] text-secondary"
                                }
                              >
                                {detailText}
                              </span>)}
                          </jsxTooltipTooltip.Fragment>) : (<jsxTooltipTooltip.Fragment>
                            <span className={tooltipTextWrapClasses}>
                              {displayedBody}
                            </span>
                            {shortcut && (<TooltipShortcut
                                keys={shortcut}
                                className={SelfStartValue}
                              />)}
                          </jsxTooltipTooltip.Fragment>)}
                      </DarkScope>
                    </npm_Tooltip_Ax.Popup>
                  </npm_Tooltip_Ax.Positioner>
                </LayerBaseContext.Provider>
              )}
            </CollisionPaddingProvider>
          </PopupSurface>
        </npm_Tooltip_Ax.Portal>
      ) : null;
  return lazyHandle ? (
    <jsxTooltipTooltip.Fragment>
      <TooltipImplementationContext.Provider
        value={TooltipTooltipTooltipDisabledReasonTooltipConfig}
      >
        <TooltipTriggerContext.Provider value={hasContent}>
          {trigger}
        </TooltipTriggerContext.Provider>
      </TooltipImplementationContext.Provider>
      {isRootMounted && (<npm_Tooltip_Ax.Root
          handle={lazyHandle}
          open={isOpen}
          disableHoverablePopup={!hoverable}
          trackCursorAxis={trackCursorAxis}
          disabled={!hasContent}
          actionsRef={actionsRef}
          onOpenChange={handleLazyOpenChange}
          onOpenChangeComplete={handleOpenChangeComplete}
          triggerId={triggerId}
        >
          {portal}
        </npm_Tooltip_Ax.Root>)}
    </jsxTooltipTooltip.Fragment>
  ) : (
    <npm_Tooltip_Ax.Root
      open={isOpen}
      disableHoverablePopup={!hoverable}
      trackCursorAxis={trackCursorAxis}
      disabled={!hasContent}
      actionsRef={actionsRef}
      onOpenChange={handleOpenChange}
      onOpenChangeComplete={handleOpenChangeComplete}
      triggerId={triggerId}
    >
      <TooltipImplementationContext.Provider
        value={TooltipTooltipTooltipDisabledReasonTooltipConfig}
      >
        <TooltipTriggerContext.Provider value={hasContent}>
          {trigger}
        </TooltipTriggerContext.Provider>
      </TooltipImplementationContext.Provider>
      {portal}
    </npm_Tooltip_Ax.Root>
  );
}
function DisabledReasonTooltip({
  reason: reason,
  side: side,
  align: align,
  sideOffset: sideOffset,
  multiline = true,
  delay: delay,
  collisionPadding: collisionPadding,
  hoverable: hoverable,
  className: className,
  wrapperClassName: wrapperClassName,
  children: children,
}: DisabledTooltipProps): React.ReactElement {
  useUiLocale();
  let value = (0, reactTooltipTooltip.useId)();
  return (
    <Tooltip
      content={hasDisabledReason(reason) ? reason : undefined}
      side={side}
      align={align}
      sideOffset={sideOffset}
      multiline={multiline}
      delay={delay}
      collisionPadding={collisionPadding}
      hoverable={hoverable}
      className={className}
      closeOnClick={false}
      openOnHandedBackFocus={true}
    >
      <span
        {...disabledReasonWrapperProps(
          reason,
          value,
          wrapperClassName,
        )}
      >
        {children}
        <DisabledReasonDescription id={value} reason={reason} />
      </span>
    </Tooltip>
  );
}
function TooltipImplProvider({
  children: children,
}: React.PropsWithChildren): React.ReactElement {
  useUiLocale();
  return (
    <TooltipImplementationContext.Provider
      value={TooltipTooltipTooltipDisabledReasonTooltipConfig}
    >
      {children}
    </TooltipImplementationContext.Provider>
  );
}
function useTooltipGroup(): boolean {
  return (0, reactTooltipTooltip.useContext)(TooltipTooltipContext);
}
function TooltipGroup({
  delay = 600,
  closeDelay = 200,
  children: children,
}: React.PropsWithChildren<{
  delay?: number;
  closeDelay?: number;
}>): React.ReactElement {
  useUiLocale();
  return (
    <TooltipTooltipContext.Provider value={true}>
      <npm_Tooltip_Ax.Provider delay={delay} closeDelay={closeDelay}>
        {children}
      </npm_Tooltip_Ax.Provider>
    </TooltipTooltipContext.Provider>
  );
}
export {
  activateTooltip,
  cancelRestoredTooltipFocus,
  DisabledReasonTooltip,
  emptyTooltipContent,
  initializeTooltipTooltip,
  isEmptyTooltipContent,
  jsxTooltipTooltip,
  OverflowTooltip,
  reactTooltipTooltip,
  resolveTooltipContent,
  SelfStartValue,
  Tooltip,
  TooltipGroup,
  TooltipImplProvider,
  TooltipShortcut,
  TooltipStylesCssAlias,
  TooltipTooltipAlias,
  TooltipTooltipBody,
  TooltipTooltipClassNames,
  tooltipBodyClassName,
  TooltipTooltipContext,
  TooltipTooltipCss,
  TooltipTooltipCurrentState,
  TooltipTooltipIs,
  TooltipTooltipOpen,
  closeTooltipBodyState,
  openTooltipBodyUpdate,
  clearTooltipBodyState,
  TooltipTooltipOpenBodyConfig,
  TooltipTooltipTooltipDisabledReasonTooltipConfig,
  useTooltipGroup,
};
export function installCdsTooltipTooltip(): () => void {
  return () => {
    defineLiveExports(tooltipImplementationExports, {
      DisabledReasonTooltip: () => DisabledReasonTooltip,
      OverflowTooltip: () => OverflowTooltip,
      Tooltip: () => Tooltip,
      TooltipGroup: () => TooltipGroup,
      TooltipImplProvider: () => TooltipImplProvider,
      useTooltipGroup: () => useTooltipGroup,
      useTooltipTrigger: () => useTooltipTrigger,
    });
    initializeTooltipTooltip = initializeOnce(() => {
      "use client";

      initializeDomInputObservation();
      initializeClassNames();
      initializeCdsRoot();
      initializeOverlaysLayers();
      initializeStableCallbackReact();
      initializeDomRefComposition();
      initializeRootFontSizeHooks();
      initializeIconContext();
      initializeTooltipTriggerElementCache();
      initializeTooltipDelayReact();
      initializeComponentsShortcut();
      initializeShrinkWrapComponent();
      initializeTooltipDisabledReason();
      initializeTooltipStyles();
      initializeTooltipTrigger();
      reactTooltipTooltip = toModuleNamespace(
        load_react(),
      );
      jsxTooltipTooltip = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_V8e();
      TooltipTooltipCurrentState = null;
      emptyTooltipContent = Symbol("cds.Tooltip.noShow") as EmptyTooltipContent;
      TooltipTooltipOpenBodyConfig = {
        open: false,
        body: undefined,
      };
      TooltipTooltipOpen = (state: TooltipBodyState): TooltipBodyState =>
        state.open
          ? state
          : {
              ...state,
              open: true,
            };
      closeTooltipBodyState = (state: TooltipBodyState): TooltipBodyState =>
        state.open
          ? {
              ...state,
              open: false,
            }
          : state;
      TooltipTooltipBody = (state: TooltipBodyState): TooltipBodyState =>
        state.body === undefined
          ? state
          : {
              ...state,
              body: undefined,
            };
      openTooltipBodyUpdate =
        (body: React.ReactNode): TooltipBodyUpdate =>
        (state) =>
          state.open && Object.is(state.body, body)
            ? state
            : {
                open: true,
                body: body,
              };
      TooltipTooltipIs =
        (body: React.ReactNode): TooltipBodyUpdate =>
        (state) =>
          Object.is(state.body, body)
            ? state
            : {
                ...state,
                body: body,
              };
      clearTooltipBodyState = (state: TooltipBodyState): TooltipBodyState =>
        state.open || state.body !== undefined
          ? TooltipTooltipOpenBodyConfig
          : state;
      TooltipStylesCssAlias = TooltipStylesCss;
      TooltipTooltipClassNames = "text-balance";
      TooltipTooltipAlias = tooltipPopupClasses;
      tooltipBodyClassName =
        "inline-flex items-center gap-2 min-h-[calc(1.5rem*var(--cds-rem-scale,1))] max-w-[240px] py-[calc(0.1875rem*var(--cds-rem-scale,1))]";
      SelfStartValue = "self-start";
      TooltipTooltipCss = `flex flex-col gap-0.5 ${compactTooltipClassName}`;
      OverflowTooltip = (0, reactTooltipTooltip.forwardRef)<
        HTMLSpanElement,
        OverflowTooltipProps
      >(function (
        {
          className: className,
          side: side,
          align: align,
          sideOffset: sideOffset,
          delay: delay,
          collisionPadding: collisionPadding,
          hoverable: hoverable,
          lazy: lazy,
          children: children,
          ...props
        }: OverflowTooltipProps,
        forwardedRef: React.ForwardedRef<HTMLSpanElement>,
      ): React.ReactElement {
        let value = (0, reactTooltipTooltip.useRef)<HTMLSpanElement | null>(
            null,
          ),
          mergedRef = useMergedRefs(value, forwardedRef),
          isInsideTooltipTrigger = useTooltipTrigger();
        return (
          <Tooltip
            content={
              isInsideTooltipTrigger
                ? undefined
                : () => {
                    let current = value.current;
                    if (current !== null)
                      return current.scrollWidth > current.clientWidth ||
                        measureContentRect(current)
                        ? children
                        : undefined;
                  }
            }
            side={side}
            align={align}
            sideOffset={sideOffset}
            delay={delay}
            collisionPadding={collisionPadding}
            hoverable={hoverable}
            lazy={lazy}
          >
            <span
              {...props}
              ref={mergedRef}
              data-cds={"OverflowTooltip"}
              className={cn(
                "block min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap",
                className,
              )}
            >
              {children}
            </span>
          </Tooltip>
        );
      });
      OverflowTooltip.displayName = "OverflowTooltip";
      TooltipTooltipTooltipDisabledReasonTooltipConfig = {
        Tooltip: Tooltip,
        DisabledReasonTooltip: DisabledReasonTooltip,
      };
      TooltipTooltipContext = (0, reactTooltipTooltip.createContext)<boolean>(
        false,
      );
    });
  };
}
