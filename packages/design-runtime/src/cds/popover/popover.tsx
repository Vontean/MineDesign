import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type {
  ForwardComponent,
  InnerOverlayStack,
  MobileSheetParts,
  OverlayActions,
  OverlayKind,
  PopoverAnchorState,
  PopoverAnchorStore,
  PopoverPopupInnerProps,
  PopoverPopupProps,
  PopoverPopupViewProps,
  PopoverRootProps,
  SheetRenderState,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { popupSurfaceClassName } from "../components/icon";
import { ActivityBoundary, initializeDomRefComposition, initializeDomRefComposition_3, useMergedRefs } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { asElement, initializeHooksStableCallback } from "../hooks/stable-callback";
import { initializeMenuPopup_3, isInteractivePressTarget } from "../menu/popup";
import { initializeOverlaysBackdrop, OverlayBackdrop, OverlaysBackdropVisibilityOpacityConfig, useRestoreFocusOnClose } from "../overlays/backdrop";
import { initializeOverlaysImperativeHandle, useOverlayImperativeHandle } from "../overlays/imperative-handle";
import { initializeOverlaysLayers, LayerBaseContext, useLayer } from "../overlays/layers";
import { initializePlatformReducedMotion_2, PlatformReducedMotionClassNames_3, PlatformReducedMotionCss_2 } from "../platform/reduced-motion";
import { initializePlatformRootFontSize_2, PopupSurface } from "../platform/root-font-size";
import { initializeSheetsKeyboardViewport, isTextInputElement } from "../sheets/keyboard-viewport";
import { ComfortableValue, initializeSheetsLayout, SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig } from "../sheets/layout";
import { initializeSheetsPopupStack, isInsideSheetPopup, SheetPopupContext, SheetPopupProvider, SheetsPopupStackConcealedConfig, SheetsPopupStackSheetConcealedChromeConfig, useAvailableSheetParts, useOverlayOpenState, useSheetInteractionMode, useSheetPopup, useSheetState } from "../sheets/popup-stack";
import { initializeSheetsPresentation, sheetScrollAttribute, useOpenSnapshot } from "../sheets/presentation";
import { closeInnerOverlayOnEscape, createInnerOverlayStack, initializeOverlayAttributes, initializeSheetsScrollArea_6, initializeSheetsScrollArea_7, InnerOverlaysContext, overlayAttribute, useOpenerReturn } from "../sheets/scroll-area";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeCdsRoot, useOverlayRoot } from "../theme/root";
import { initializeThemeSurfaces, surfaceBackgroundTokens } from "../theme/surfaces";
import { initializeNpm__base_ui_react_pge, load_react, load_react_jsx_runtime, npm_Popover_$f } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var jsxPopoverPopover: typeof import("react/jsx-runtime");
var initializePopoverPopover: () => void;
var reactPopoverPopover: typeof React;
var jsxPopoverPopover_2: typeof import("react/jsx-runtime");
var PopoverPopoverCss: string;
var popoverPopupClassNames: string;
var PopoverPopoverNoneXsSmConfig: {
  none: string;
  xs: string;
  sm: string;
  md: string;
  lg: string;
};
var PopoverPopoverXysetrblOverflowPattern: RegExp;
var PopoverPopoverPaddingOverflowPattern: RegExp;
var PopoverPopupInner: ForwardComponent<
  HTMLDivElement,
  PopoverPopupInnerProps
>;
var PopoverPopup: ForwardComponent<HTMLDivElement, PopoverPopupProps>;
var PopoverSheetCapablePopup: ForwardComponent<
  HTMLDivElement,
  PopoverPopupProps
>;
var PopoverPopupView: ForwardComponent<HTMLDivElement, PopoverPopupViewProps>;
var PopoverPopoverContext: React.Context<PopoverAnchorStore | null>;
var PopoverPopoverContext_2: React.Context<InnerOverlayStack | null>;
var PopoverTrigger: ForwardComponent<
  HTMLButtonElement,
  import("@base-ui/react/popover").Popover.Trigger.Props<void>
>;
var PopoverTriggerAlias: typeof PopoverTrigger;
var PopoverPopoverRootTriggerPopupConfig: {
  Root: typeof PopoverRoot;
  Trigger: typeof PopoverTrigger;
  Popup: typeof PopoverPopup;
  Title: typeof import("@base-ui/react/popover").Popover.Title;
  Description: typeof import("@base-ui/react/popover").Popover.Description;
  Close: typeof import("@base-ui/react/popover").Popover.Close;
  Arrow: typeof import("@base-ui/react/popover").Popover.Arrow;
  createHandle: typeof import("@base-ui/react/popover").Popover.createHandle;
};
var initializePopoverPopover_2: () => void;
function SheetCapablePopup({
  kind: kind,
  children: children,
}: {
  kind: OverlayKind;
  children: (
    state: SheetRenderState,
    parts: MobileSheetParts | null,
  ) => React.ReactNode;
}): React.ReactElement {
  useUiLocale();
  let SheetParts = useAvailableSheetParts(),
    { pending: isSheetPending } = useSheetState();
  return SheetParts !== null ? (
    <SheetParts.SheetPopupHost>
      {(sheetState: SheetRenderState) => children(sheetState, SheetParts)}
    </SheetParts.SheetPopupHost>
  ) : (
    <jsxPopoverPopover.Fragment>
      {children(
        isSheetPending
          ? SheetsPopupStackConcealedConfig
          : SheetsPopupStackSheetConcealedChromeConfig,
        null,
      )}
      {isSheetPending ? (<OverlayBackdrop kind={kind} />) : (null)}
    </jsxPopoverPopover.Fragment>
  );
}
function usePopoverAnimation(
  className: string | undefined,
  style: import("@base-ui/react/popover").Popover.Popup.Props["style"],
): void {
  let value = (0, reactPopoverPopover.useRef)(false);
  (0, reactPopoverPopover.useEffect)(() => {}, [className, style]);
}
function isPopoverArrow(node: React.ReactNode): boolean {
  return (
    (0, reactPopoverPopover.isValidElement)(node) &&
    node.type === npm_Popover_$f.Arrow
  );
}
function usePopoverInnerOverlays(
  userOnOpenChange: import("@base-ui/react/popover").Popover.Root.Props<void>["onOpenChange"],
): {
  innerOverlays: InnerOverlayStack;
  onOpenChange: NonNullable<
    import("@base-ui/react/popover").Popover.Root.Props<void>["onOpenChange"]
  >;
} {
  let [value] = (0, reactPopoverPopover.useState)<InnerOverlayStack>(
    createInnerOverlayStack,
  );
  return {
    innerOverlays: value,
    onOpenChange: (0, reactPopoverPopover.useCallback)(
      (isOpen, changeDetails) => {
        closeInnerOverlayOnEscape(value, isOpen, changeDetails) ||
          userOnOpenChange?.(isOpen, changeDetails);
      },
      [value, userOnOpenChange],
    ),
  };
}
function resolvePopoverAnchor(
  anchorState: PopoverAnchorState,
): Element | null | "virtual" {
  let anchor = anchorState.anchor;
  if (anchor == null) return anchorState.triggerEl;
  if (anchor instanceof Element) return anchor;
  if (typeof anchor == "object" && "current" in anchor) {
    let current = anchor.current;
    return current instanceof Element ? current : null;
  }
  return "virtual";
}
function hasPopoverInputAnchor(anchorState: PopoverAnchorState): boolean {
  if (!anchorState.popupMounted || !anchorState.declinesFocus) return false;
  let anchorElement = resolvePopoverAnchor(anchorState);
  return anchorElement === "virtual"
    ? true
    : anchorElement === null
      ? false
      : isTextInputElement(anchorElement) ||
        anchorElement.querySelector(
          'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
        ) !== null ||
        anchorElement.closest(
          'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
        ) !== null;
}
function PopoverRoot<Payload = void>({
  onOpenChange: onOpenChange,
  actionsRef: actionsRef,
  ...props
}: PopoverRootProps<Payload>): React.ReactElement {
  useUiLocale();
  let innerOverlayHandlers = usePopoverInnerOverlays(onOpenChange),
    isSheetMode = useSheetInteractionMode(),
    overlayActionsRef = (0, reactPopoverPopover.useRef)<OverlayActions | null>(null);
  useOverlayImperativeHandle(overlayActionsRef, actionsRef);
  return (
    <PopoverPopoverContext_2.Provider value={innerOverlayHandlers.innerOverlays}>
      <ActivityBoundary actionsRef={overlayActionsRef}>
        {isSheetMode ? ((() => {
            const _Component = usePopoverRoot;
            return (
              <_Component
                {...props}
                actionsRef={overlayActionsRef}
                onOpenChange={innerOverlayHandlers.onOpenChange}
                consumerHandlesOpenChange={onOpenChange !== undefined}
              />
            );
          })()) : (<npm_Popover_$f.Root
            {...props}
            actionsRef={overlayActionsRef}
            onOpenChange={innerOverlayHandlers.onOpenChange}
          />)}
      </ActivityBoundary>
    </PopoverPopoverContext_2.Provider>
  );
}
function usePopoverRoot<Payload = void>({
  consumerHandlesOpenChange: consumerHandlesOpenChange,
  ...props
}: PopoverRootProps<Payload> & {
  consumerHandlesOpenChange: boolean;
}): React.ReactElement {
  let value = useOverlayOpenState(props),
    anchorStateRef: React.RefObject<PopoverAnchorState> = (0,
    reactPopoverPopover.useRef)({
      popupMounted: false,
      declinesFocus: false,
      anchor: undefined,
      triggerEl: null,
    }),
    anchorStore: PopoverAnchorStore = (0, reactPopoverPopover.useMemo)(
      () => ({
        update: (anchorPatch) => {
          Object.assign(anchorStateRef.current, anchorPatch);
        },
        read: () => anchorStateRef.current,
      }),
      [],
    ),
    isStructurallyAnchored = useOpenSnapshot(
      value.open,
      () => {
        let currentAnchorState = anchorStore.read();
        return !currentAnchorState.popupMounted || hasPopoverInputAnchor(currentAnchorState);
      },
      false,
    ),
    sheetPopup = useSheetPopup({
      open: value.open,
      actionsRef: props.actionsRef,
      onOpenChange: value.onOpenChange,
      onOpenChangeComplete: props.onOpenChangeComplete,
      structurallyAnchored: isStructurallyAnchored,
      closable: !(props.open !== undefined && !consumerHandlesOpenChange),
    });
  return (
    <PopoverPopoverContext.Provider value={anchorStore}>
      <SheetPopupProvider value={sheetPopup}>
        <npm_Popover_$f.Root
          {...props}
          modal={sheetPopup.modal ?? props.modal}
          actionsRef={sheetPopup.actionsRef}
          onOpenChange={sheetPopup.onOpenChange}
          onOpenChangeComplete={sheetPopup.onOpenChangeComplete}
        />
      </SheetPopupProvider>
    </PopoverPopoverContext.Provider>
  );
}
export {
  hasPopoverInputAnchor,
  initializePopoverPopover,
  initializePopoverPopover_2,
  isPopoverArrow,
  jsxPopoverPopover,
  jsxPopoverPopover_2,
  PopoverPopoverContext,
  PopoverPopoverContext_2,
  PopoverPopoverCss,
  PopoverPopoverNoneXsSmConfig,
  PopoverPopoverPaddingOverflowPattern,
  PopoverPopoverRootTriggerPopupConfig,
  PopoverPopoverXysetrblOverflowPattern,
  PopoverPopup,
  popoverPopupClassNames,
  PopoverPopupInner,
  PopoverPopupView,
  PopoverRoot,
  PopoverSheetCapablePopup,
  PopoverTrigger,
  PopoverTriggerAlias,
  reactPopoverPopover,
  resolvePopoverAnchor,
  SheetCapablePopup,
  usePopoverAnimation,
  usePopoverInnerOverlays,
  usePopoverRoot,
};
export function installCdsPopoverPopover(): () => void {
  return () => {
    initializePopoverPopover = initializeOnce(() => {
      "use client";

      initializeSheetsPopupStack();
      initializeOverlaysBackdrop();
      jsxPopoverPopover = toModuleNamespace(
        load_react_jsx_runtime(),
      );
    });
    initializePopoverPopover_2 = initializeOnce(() => {
      "use client";

      initializeHooksLayoutEffect();
      initializeClassNames();
      initializeCdsRoot();
      initializeHooksStableCallback();
      initializeOverlaysLayers();
      initializeOverlayAttributes();
      initializeDomRefComposition_3();
      initializeDomRefComposition();
      initializePlatformRootFontSize_2();
      initializeThemeSurfaces();
      initializeOverlaysImperativeHandle();
      initializeSheetsKeyboardViewport();
      initializeSheetsLayout();
      initializeSheetsPresentation();
      initializeSheetsPopupStack();
      initializePlatformReducedMotion_2();
      initializeOverlaysBackdrop();
      initializePopoverPopover();
      initializeSheetsScrollArea_6();
      initializeSheetsScrollArea_7();
      initializeMenuPopup_3();
      reactPopoverPopover = toModuleNamespace(
        load_react(),
      );
      jsxPopoverPopover_2 = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_pge();
      PopoverPopoverCss = `draggable-none max-w-[320px] max-h-[var(--available-height)] ${popupSurfaceClassName("popover")} cds-reset text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
      popoverPopupClassNames =
        "[display:inherit] [flex-direction:inherit] [flex-wrap:inherit] [align-items:inherit] [justify-content:inherit] [justify-items:inherit] [gap:inherit] [grid-template-columns:inherit] [grid-template-rows:inherit] [grid-auto-flow:inherit] [grid-auto-columns:inherit] [grid-auto-rows:inherit] col-span-full row-span-full self-stretch justify-self-stretch max-h-[inherit] min-h-0 min-w-0 flex-auto overflow-y-auto rounded-[inherit] outline-none focus-visible:outline-hidden";
      PopoverPopoverNoneXsSmConfig = {
        none: "p-0",
        xs: "p-xs",
        sm: "p-sm",
        md: "p-md",
        lg: "p-lg",
      };
      PopoverPopoverXysetrblOverflowPattern =
        /(?:^|\s)!?(?:-?p[xysetrbl]?-[^\s:]+|overflow-[^\s:]+)!?(?=\s|$)/;
      PopoverPopoverPaddingOverflowPattern = /^(?:padding|overflow[XY]?$)/;
      PopoverPopupInner = (0, reactPopoverPopover.forwardRef)<
        HTMLDivElement,
        PopoverPopupInnerProps
      >(
        (
          {
            anchored: anchored,
            finalFocus: finalFocus,
            className: className,
            children: children,
            ...props
          }: PopoverPopupInnerProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value =
              (0, reactPopoverPopover.useContext)(SheetPopupContext)
                ?.open ?? true,
            shouldRegisterOpenerReturn = anchored && finalFocus === undefined,
            openerReturn = useOpenerReturn({
              skipRestoreOnOutsideFocus: true,
              open: value,
              registerOpenerReturn: shouldRegisterOpenerReturn,
            }),
            mergedRef = useMergedRefs(forwardedRef, openerReturn.popupRef);
          return (
            <npm_Popover_$f.Popup
              data-cds={"Popover"}
              {...{
                [overlayAttribute]: "",
              }}
              ref={mergedRef}
              finalFocus={shouldRegisterOpenerReturn ? openerReturn.finalFocus : finalFocus}
              {...props}
              className={className}
            >
              {children}
            </npm_Popover_$f.Popup>
          );
        },
      );
      PopoverPopupInner.displayName = "Popover.PopupInner";
      PopoverPopup = (0, reactPopoverPopover.forwardRef)<
        HTMLDivElement,
        PopoverPopupProps
      >(
        (
          {
            side = "bottom",
            align = "center",
            sideOffset = 6,
            padding = "lg",
            scrollFade = true,
            ...props
          }: PopoverPopupProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let state = {
            side: side,
            align: align,
            sideOffset: sideOffset,
            padding: padding,
            scrollFade: scrollFade,
            ...props,
          };
          return isInsideSheetPopup() ? (
            <PopoverSheetCapablePopup {...state} ref={forwardedRef} />
          ) : (
            <PopoverPopupView
              {...state}
              ref={forwardedRef}
              sheetPopup={SheetsPopupStackSheetConcealedChromeConfig}
              sheetParts={null}
            />
          );
        },
      );
      PopoverPopup.displayName = "Popover.Popup";
      PopoverSheetCapablePopup = (0, reactPopoverPopover.forwardRef)<
        HTMLDivElement,
        PopoverPopupProps
      >(
        (
          popupProps: PopoverPopupProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <SheetCapablePopup kind={"popover"}>
            {(sheetPopup: SheetRenderState, sheetParts: MobileSheetParts | null) => (
              <PopoverPopupView
                {...popupProps}
                ref={forwardedRef}
                sheetPopup={sheetPopup}
                sheetParts={sheetParts}
              />
            )}
          </SheetCapablePopup>
        ),
      );
      PopoverSheetCapablePopup.displayName = "PopoverSheetCapablePopup";
      PopoverPopupView = (0, reactPopoverPopover.forwardRef)<
        HTMLDivElement,
        PopoverPopupViewProps
      >(function (
        {
          sheetPopup: sheetPopup,
          sheetParts: sheetParts,
          ...props
        }: PopoverPopupViewProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement {
        let {
            side: side = "bottom",
            align: align = "center",
            sideOffset: sideOffset = 6,
            alignOffset: alignOffset,
            anchor: anchor,
            collisionPadding: collisionPadding,
            padding: padding = "lg",
            scrollFade: hasScrollFade = true,
            layerOffset: layerOffset,
            closeLabel: closeLabel,
            sheetHeight: sheetHeight,
            className: className,
            children: children,
            onFocus: onFocusProp,
            onMouseDown: onMouseDownProp,
            keepFocus: shouldKeepFocus = false,
            ...popupProps
          } = props,
          bodyRef = (0, reactPopoverPopover.useRef)<HTMLDivElement | null>(
            null,
          ),
          sheet = sheetPopup.sheet,
          sheetPopupContext = (0, reactPopoverPopover.useContext)(
            SheetPopupContext,
          ),
          hasSheetHeight = (sheetPopupContext?.open ?? false) && sheetPopupContext?.height !== undefined,
          setDetent = sheetPopupContext?.setDetent;
        useIsomorphicLayoutEffect(() => {
          let current = bodyRef.current;
          sheet &&
            hasSheetHeight &&
            sheetHeight === "tall" &&
            current !== null &&
            current.querySelector(
              'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
            ) !== null &&
            setDetent?.("tall");
        }, [sheet, hasSheetHeight, sheetHeight, setDetent]);
        let ActiveSheetParts =
            sheetPopup.sheet && sheetParts !== null ? sheetParts : null,
          anchorStore = (0, reactPopoverPopover.useContext)(PopoverPopoverContext),
          declinesInitialFocus = popupProps.initialFocus === false,
          callback: React.MouseEventHandler<HTMLDivElement> = (event) => {
            let targetElement = asElement(event.target);
            !shouldKeepFocus ||
              targetElement === null ||
              !event.currentTarget.contains(targetElement) ||
              isInteractivePressTarget(event, {
                draggable: true,
              }) ||
              event.preventDefault();
          },
          innerOverlays = (0, reactPopoverPopover.useContext)(
            PopoverPopoverContext_2,
          );
        useIsomorphicLayoutEffect(() => {
          if (anchorStore !== null) {
            anchorStore.update({
              popupMounted: true,
              declinesFocus: declinesInitialFocus,
              anchor: anchor,
            });
            return () => {
              anchorStore.update({
                popupMounted: false,
              });
            };
          }
        }, [anchorStore, declinesInitialFocus, anchor]);
        let restoreFocusRef = useRestoreFocusOnClose(
            sheetPopup.concealed && !declinesInitialFocus,
          ),
          mergedRef = useMergedRefs(
            forwardedRef,
            sheetPopup.ref,
            restoreFocusRef,
          ),
          layer = useLayer("popover", layerOffset);
        usePopoverAnimation(
          className,
          (
            popupProps as {
              style: (
                state: import("@base-ui/react/popover").Popover.Popup.State,
              ) => React.CSSProperties;
            }
          ).style,
        );
        let childArray = reactPopoverPopover.Children.toArray(children),
          arrowChildren = childArray.filter(isPopoverArrow),
          bodyContent = (
            <InnerOverlaysContext.Provider value={innerOverlays}>
              {childArray.filter((child) => !isPopoverArrow(child))}
            </InnerOverlaysContext.Provider>
          );
        return (
          <npm_Popover_$f.Portal
            container={useOverlayRoot()}
          >
            <PopupSurface
              {...layer.portalProps}
              style={
                sheetPopup.concealed
                  ? {
                      ...layer.portalProps.style,
                      ...OverlaysBackdropVisibilityOpacityConfig,
                    }
                  : layer.portalProps.style
              }
              surface={surfaceBackgroundTokens.popover}
              density={sheet ? ComfortableValue : undefined}
              companionModalCatcher={!sheet}
              closeOnActivityHide={true}
            >
              {ActiveSheetParts !== null && sheetPopup.sheet && (<ActiveSheetParts.PopoverSheetBackdrop sheetPopup={sheetPopup} />)}
              <LayerBaseContext.Provider value={layer.base}>
                <npm_Popover_$f.Positioner
                  style={
                    sheetPopup.positionerStyle !== undefined
                      ? {
                          ...layer.style,
                          ...sheetPopup.positionerStyle,
                        }
                      : layer.style
                  }
                  side={side}
                  align={align}
                  sideOffset={sideOffset}
                  alignOffset={alignOffset}
                  anchor={anchor}
                  collisionPadding={collisionPadding}
                  {...(sheet
                    ? SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig
                    : {})}
                  className={
                    sheet &&
                    (
                      sheetPopup.state as {
                        depth: number;
                      }
                    ).depth === 0
                      ? PlatformReducedMotionClassNames_3
                      : undefined
                  }
                >
                  <PopoverPopupInner
                    anchored={anchor != null}
                    ref={mergedRef}
                    {...sheetPopup.attrs}
                    {...popupProps}
                    {...(sheet
                      ? {
                          initialFocus: undefined,
                        }
                      : {})}
                    onMouseDown={
                      sheet
                        ? onMouseDownProp
                        : (
                            event: Parameters<
                              NonNullable<
                                import("@base-ui/react/popover").Popover.Popup.Props["onMouseDown"]
                              >
                            >[0],
                          ) => {
                            onMouseDownProp?.(event);
                            callback(event);
                          }
                    }
                    style={
                      sheetPopup.style === undefined
                        ? (
                            popupProps as {
                              style: (
                                state: import("@base-ui/react/popover").Popover.Popup.State,
                              ) => React.CSSProperties;
                            }
                          ).style
                        : typeof (
                              popupProps as {
                                style: (
                                  state: import("@base-ui/react/popover").Popover.Popup.State,
                                ) => React.CSSProperties;
                              }
                            ).style == "function"
                          ? (
                              popupState: import("@base-ui/react/popover").Popover.Popup.State,
                            ) => ({
                              ...(
                                popupProps as {
                                  style: (
                                    state: import("@base-ui/react/popover").Popover.Popup.State,
                                  ) => React.CSSProperties;
                                }
                              ).style(popupState),
                              ...sheetPopup.style,
                            })
                          : {
                              ...(
                                popupProps as {
                                  style: (
                                    state: import("@base-ui/react/popover").Popover.Popup.State,
                                  ) => React.CSSProperties;
                                }
                              ).style,
                              ...sheetPopup.style,
                            }
                    }
                    onFocus={(
                      event: Parameters<
                        NonNullable<
                          import("@base-ui/react/popover").Popover.Popup.Props["onFocus"]
                        >
                      >[0],
                    ) => {
                      onFocusProp?.(event);
                      let currentTarget = event.currentTarget;
                      event.target === currentTarget &&
                        currentTarget.ownerDocument.activeElement ===
                          currentTarget &&
                        bodyRef.current?.focus({
                          preventScroll: true,
                        });
                    }}
                    className={cn(
                      PopoverPopoverCss,
                      sheet && PlatformReducedMotionCss_2,
                      sheet &&
                        "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]",
                      sheet &&
                        "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
                      sheet && "flex flex-col",
                      !sheet && className,
                    )}
                  >
                    {ActiveSheetParts !== null && sheetPopup.sheet ? (<ActiveSheetParts.PopoverSheetContent
                        sheetPopup={sheetPopup}
                        className={className}
                        bodyRef={bodyRef}
                        bodyClassName={cn(
                          popoverPopupClassNames,
                          hasScrollFade && "scroll-fade-y",
                          PopoverPopoverNoneXsSmConfig[padding],
                        )}
                        closeLabel={closeLabel}
                      >
                        {bodyContent}
                      </ActiveSheetParts.PopoverSheetContent>) : (<jsxPopoverPopover_2.Fragment>
                        <div
                          ref={bodyRef}
                          tabIndex={-1}
                          data-cds-popover-body={""}
                          {...{
                            [sheetScrollAttribute]: "",
                          }}
                          className={cn(
                            popoverPopupClassNames,
                            hasScrollFade && "scroll-fade-y",
                            PopoverPopoverNoneXsSmConfig[padding],
                          )}
                        >
                          {bodyContent}
                        </div>
                        {arrowChildren}
                      </jsxPopoverPopover_2.Fragment>)}
                  </PopoverPopupInner>
                </npm_Popover_$f.Positioner>
              </LayerBaseContext.Provider>
            </PopupSurface>
          </npm_Popover_$f.Portal>
        );
      });
      PopoverPopupView.displayName = "PopoverPopupView";
      PopoverPopoverContext = (0,
      reactPopoverPopover.createContext)<PopoverAnchorStore | null>(null);
      PopoverPopoverContext_2 = (0,
      reactPopoverPopover.createContext)<InnerOverlayStack | null>(null);
      (PopoverRoot as React.FC<PopoverRootProps>).displayName = "Popover.Root";
      PopoverTrigger = (0, reactPopoverPopover.forwardRef)<
        HTMLButtonElement,
        import("@base-ui/react/popover").Popover.Trigger.Props<void>
      >(function (
        triggerProps: import("@base-ui/react/popover").Popover.Trigger.Props<void>,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement {
        let anchorStore = (0, reactPopoverPopover.useContext)(PopoverPopoverContext),
          setTriggerElement = (0, reactPopoverPopover.useCallback)(
            (element: HTMLElement | null): void => {
              anchorStore?.update({
                triggerEl: element,
              });
            },
            [anchorStore],
          ),
          mergedRef = useMergedRefs(forwardedRef, setTriggerElement);
        return <npm_Popover_$f.Trigger {...triggerProps} ref={mergedRef} />;
      });
      PopoverTrigger.displayName = "Popover.Trigger";
      PopoverTriggerAlias = PopoverTrigger;
      PopoverPopoverRootTriggerPopupConfig = {
        Root: PopoverRoot,
        Trigger: PopoverTriggerAlias,
        Popup: PopoverPopup,
        Title: npm_Popover_$f.Title,
        Description: npm_Popover_$f.Description,
        Close: npm_Popover_$f.Close,
        Arrow: npm_Popover_$f.Arrow,
        createHandle: npm_Popover_$f.createHandle,
      };
    });
  };
}
