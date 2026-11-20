import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type {
  ForwardComponent,
  InnerOverlayStack,
  OverlayActions,
  PopoverAnchorState,
  PopoverAnchorStore,
  PopoverPopupInnerProps,
  PopoverPopupProps,
  PopoverPopupViewProps,
  PopoverRootProps,
  SheetRenderState,
  MobileSheetParts,
  SheetFrameContext,
  LayerValue,
  OpenerReturnState,
  SheetPopupResult,
} from "../contracts/overlays";
/** Restored application module; prepare first, initialize in original order. */
import { basePopover, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { AdaptiveSheetPopupHost } from "./adaptive-sheets";
import { asElement, defaultSheetHost, isEditableElement, SHEET_DENSITY, SHEET_SCROLL_ATTRIBUTE, SheetContextProvider, sheetFrameContext, sheetOverflowBackgroundClasses, sheetPopupClasses, sheetPositioningOverrides, useAdaptiveSheet, useControllableOpen, useForwardedOverlayActions, useHasSheetFrame, useIsomorphicLayoutEffect, useSheetCapablePresentation, useValueCapturedOnOpen } from "./foundation";
import { CloseOnActivityHideProvider, cn, elevationSurfaceNames, getSurfaceClasses, layerBaseContext, PortalRoot, useMergedRefs, useOverlayLayer } from "./interactions";
import { createOverlayStack, interceptEscapeForInnerOverlay, OVERLAY_ATTRIBUTE, overlayStackContext, shouldAllowPopupPointerFocus, useOverlayFocusReturn, usePortalContainer } from "./overlays";
import { concealedPopupStyle, useRefocusAfterPendingSheet } from "./text-input-overlay";

var reactForUiPopover: typeof React;
var jsxForUiPopover: typeof import("react/jsx-runtime");
var popoverPopupClasses: string;
var popoverScrollBodyClasses: string;
var popoverPaddingClasses: Record<
  NonNullable<PopoverPopupProps["padding"]>,
  string
>;
var popoverPaddingClassPattern: RegExp;
var popoverPaddingStylePattern: RegExp;
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
var popoverStateContext: React.Context<PopoverAnchorStore | null>;
var popoverControlledStateContext: React.Context<InnerOverlayStack | null>;
var PopoverTrigger: ForwardComponent<
  HTMLButtonElement,
  import("@base-ui/react/popover").Popover.Trigger.Props<void>
>;
var PopoverTriggerAlias: typeof PopoverTrigger;
var PopoverComponents: {
  Root: typeof PopoverRoot;
  Trigger: typeof PopoverTrigger;
  Popup: typeof PopoverPopup;
  Title: typeof import("@base-ui/react/popover").Popover.Title;
  Description: typeof import("@base-ui/react/popover").Popover.Description;
  Close: typeof import("@base-ui/react/popover").Popover.Close;
  Arrow: typeof import("@base-ui/react/popover").Popover.Arrow;
  createHandle: typeof import("@base-ui/react/popover").Popover.createHandle;
};
function usePopoverStyleDebug(
  className: string | undefined,
  style: PopoverPopupProps["style"],
): void {
  let ref = reactForUiPopover.useRef(false);
  reactForUiPopover.useEffect(() => {
    return;
  }, [className, style]);
}
function isPopoverArrow(node: React.ReactNode): boolean {
  return (
    reactForUiPopover.isValidElement(node) &&
    node.type === basePopover.Arrow
  );
}
function usePopoverOverlayStack(notifyOpenChange: PopoverRootProps["onOpenChange"]): {
  innerOverlays: InnerOverlayStack;
  onOpenChange: NonNullable<PopoverRootProps["onOpenChange"]>;
} {
  let [value] = reactForUiPopover.useState<InnerOverlayStack>(
    createOverlayStack,
  );
  return {
    innerOverlays: value,
    onOpenChange: reactForUiPopover.useCallback(
      (
        nextOpen: boolean,
        changeDetails: import("@base-ui/react/popover").Popover.Root.ChangeEventDetails,
      ): void => {
        if (
          interceptEscapeForInnerOverlay(value, nextOpen, changeDetails)
        ) {
          return;
        }
        notifyOpenChange?.(nextOpen, changeDetails);
      },
      [value, notifyOpenChange],
    ),
  };
}
function resolvePopoverAnchor(
  anchorState: PopoverAnchorState,
): Element | null | "virtual" {
  let anchor = anchorState.anchor;
  if (anchor === undefined || anchor === null) {
    return anchorState.triggerEl;
  }
  if (anchor instanceof Element) {
    return anchor;
  }
  if (typeof anchor === "object" && "current" in anchor) {
    let current = anchor.current;
    if (current instanceof Element) {
      return current;
    } else {
      return null;
    }
  }
  return "virtual";
}
function popoverRefusesFocusOut(anchorState: PopoverAnchorState): boolean {
  if (!anchorState.popupMounted || !anchorState.declinesFocus) {
    return false;
  }
  let value = resolvePopoverAnchor(anchorState);
  if (value === "virtual") {
    return true;
  }
  if (value === null) {
    return false;
  }
  return (
    isEditableElement(value) ||
    value.querySelector(
      'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
    ) !== null ||
    value.closest(
      'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
    ) !== null
  );
}
function PopoverRoot<Payload = void>({
  onOpenChange: onOpenChange,
  actionsRef: actionsRef,
  ...props
}: PopoverRootProps<Payload>): React.ReactElement {
  useUiLocale();
  let value = usePopoverOverlayStack(onOpenChange),
    canShowSheet = useSheetCapablePresentation(),
    ref = reactForUiPopover.useRef<OverlayActions | null>(null);
  useForwardedOverlayActions(ref, actionsRef);
  return (
    <popoverControlledStateContext.Provider value={value.innerOverlays}>
      <CloseOnActivityHideProvider actionsRef={ref}>
        {canShowSheet ? (<ControlledPopoverRoot
            {...props}
            actionsRef={ref}
            onOpenChange={value.onOpenChange}
            consumerHandlesOpenChange={onOpenChange !== undefined}
          />) : (<basePopover.Root
            {...props}
            actionsRef={ref}
            onOpenChange={value.onOpenChange}
          />)}
      </CloseOnActivityHideProvider>
    </popoverControlledStateContext.Provider>
  );
}
function ControlledPopoverRoot<Payload = void>({
  consumerHandlesOpenChange: consumerHandlesOpenChange,
  ...props
}: PopoverRootProps<Payload> & {
  consumerHandlesOpenChange: boolean;
}): React.ReactElement {
  useUiLocale();
  let value = useControllableOpen(props),
    ref = reactForUiPopover.useRef<PopoverAnchorState>({
      popupMounted: false,
      declinesFocus: false,
      anchor: undefined,
      triggerEl: null,
    }),
    memo = reactForUiPopover.useMemo<PopoverAnchorStore>(
      () => ({
        update: (changes: Partial<PopoverAnchorState>): void => {
          Object.assign(ref.current, changes);
        },
        read: (): PopoverAnchorState => ref.current,
      }),
      [],
    ),
    structurallyAnchored = useValueCapturedOnOpen(
      value.open,
      () => {
        let anchorState = memo.read();
        return !anchorState.popupMounted || popoverRefusesFocusOut(anchorState);
      },
      false,
    ),
    sheetState = useAdaptiveSheet({
      open: value.open,
      actionsRef: props.actionsRef,
      onOpenChange: value.onOpenChange,
      onOpenChangeComplete: props.onOpenChangeComplete,
      structurallyAnchored: structurallyAnchored,
      closable: !(props.open !== undefined && !consumerHandlesOpenChange),
    });
  return (
    <popoverStateContext.Provider value={memo}>
      <SheetContextProvider value={sheetState}>
        <basePopover.Root
          {...props}
          modal={sheetState.modal ?? props.modal}
          actionsRef={sheetState.actionsRef}
          onOpenChange={sheetState.onOpenChange}
          onOpenChangeComplete={sheetState.onOpenChangeComplete}
        />
      </SheetContextProvider>
    </popoverStateContext.Provider>
  );
}
export {
  ControlledPopoverRoot,
  isPopoverArrow,
  jsxForUiPopover,
  PopoverComponents,
  popoverControlledStateContext,
  popoverPaddingClasses,
  popoverPaddingClassPattern,
  popoverPaddingStylePattern,
  PopoverPopup,
  popoverPopupClasses,
  PopoverPopupInner,
  PopoverPopupView,
  popoverRefusesFocusOut,
  PopoverRoot,
  popoverScrollBodyClasses,
  PopoverSheetCapablePopup,
  popoverStateContext,
  PopoverTrigger,
  PopoverTriggerAlias,
  reactForUiPopover,
  resolvePopoverAnchor,
  usePopoverOverlayStack,
  usePopoverStyleDebug,
};
export function installUiPopover(): () => void {
  return () => {
    reactForUiPopover = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiPopover = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    popoverPopupClasses = `draggable-none max-w-[320px] max-h-[var(--available-height)] ${getSurfaceClasses("popover")} cds-reset text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
    popoverScrollBodyClasses =
      "[display:inherit] [flex-direction:inherit] [flex-wrap:inherit] [align-items:inherit] [justify-content:inherit] [justify-items:inherit] [gap:inherit] [grid-template-columns:inherit] [grid-template-rows:inherit] [grid-auto-flow:inherit] [grid-auto-columns:inherit] [grid-auto-rows:inherit] col-span-full row-span-full self-stretch justify-self-stretch max-h-[inherit] min-h-0 min-w-0 flex-auto overflow-y-auto rounded-[inherit] outline-none focus-visible:outline-hidden";
    popoverPaddingClasses = {
      none: "p-0",
      xs: "p-xs",
      sm: "p-sm",
      md: "p-md",
      lg: "p-lg",
    };
    popoverPaddingClassPattern =
      /(?:^|\s)!?(?:-?p[xysetrbl]?-[^\s:]+|overflow-[^\s:]+)!?(?=\s|$)/;
    popoverPaddingStylePattern = /^(?:padding|overflow[XY]?$)/;
    PopoverPopupInner = reactForUiPopover.forwardRef(
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
            reactForUiPopover.useContext<SheetFrameContext | null>(
              sheetFrameContext,
            )?.open ?? true,
          shouldRestoreFocus = anchored && finalFocus === undefined,
          focusReturn = useOverlayFocusReturn({
            skipRestoreOnOutsideFocus: true,
            open: value,
            registerOpenerReturn: shouldRestoreFocus,
          }),
          mergedRef = useMergedRefs(forwardedRef, focusReturn.popupRef);
        return (
          <basePopover.Popup
            data-cds={"Popover"}
            {...{
              [OVERLAY_ATTRIBUTE]: "",
            }}
            ref={mergedRef}
            finalFocus={(shouldRestoreFocus ? focusReturn.finalFocus : finalFocus) as import("../contracts/overlays").BaseUIPopupFocus}
            {...props}
            className={className}
          >
            {children}
          </basePopover.Popup>
        );
      },
    );
    PopoverPopupInner.displayName = "Popover.PopupInner";
    PopoverPopup = reactForUiPopover.forwardRef(
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
        if (useHasSheetFrame()) {
          return <PopoverSheetCapablePopup {...state} ref={forwardedRef} />;
        } else {
          return (
            <PopoverPopupView
              {...state}
              ref={forwardedRef}
              sheetPopup={defaultSheetHost}
              sheetParts={null}
            />
          );
        }
      },
    );
    PopoverPopup.displayName = "Popover.Popup";
    PopoverSheetCapablePopup = reactForUiPopover.forwardRef(
      (
        popupProps: PopoverPopupProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => (
        <AdaptiveSheetPopupHost kind={"popover"}>
          {(
            sheetPopup: SheetRenderState,
            sheetParts: MobileSheetParts | null,
          ): React.ReactElement => (
            <PopoverPopupView
              {...popupProps}
              ref={forwardedRef}
              sheetPopup={sheetPopup}
              sheetParts={sheetParts}
            />
          )}
        </AdaptiveSheetPopupHost>
      ),
    );
    PopoverSheetCapablePopup.displayName = "PopoverSheetCapablePopup";
    PopoverPopupView = reactForUiPopover.forwardRef(function (
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
          alignOffset: value,
          anchor: anchor,
          collisionPadding: collisionPadding,
          padding: padding = "lg",
          scrollFade: scrollFade = true,
          layerOffset: layerOffset,
          closeLabel: closeLabel,
          sheetHeight: sheetHeight,
          className: className,
          children: children,
          onFocus: onFocus,
          onMouseDown: onMouseDown,
          keepFocus: keepFocus = false,
          ...popupProps
        } = props,
        ref = reactForUiPopover.useRef<HTMLDivElement | null>(null),
        sheet = sheetPopup.sheet,
        sheetFrame = reactForUiPopover.useContext<SheetFrameContext | null>(
          sheetFrameContext,
        ),
        hasPinnedSheetHeight = (sheetFrame?.open ?? false) && sheetFrame?.height !== undefined,
        setSheetDetent = sheetFrame?.setDetent;
      useIsomorphicLayoutEffect(() => {
        let current = ref.current;
        if (
          sheet &&
          hasPinnedSheetHeight &&
          sheetHeight === "tall" &&
          current !== null &&
          current.querySelector(
            'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
          ) !== null
        ) {
          setSheetDetent?.("tall");
        }
      }, [sheet, hasPinnedSheetHeight, sheetHeight, setSheetDetent]);
      let ActiveSheetParts = sheetPopup.sheet && sheetParts !== null ? sheetParts : null,
        anchorStore = reactForUiPopover.useContext(popoverStateContext),
        declinesInitialFocus = popupProps.initialFocus === false,
        callback: React.MouseEventHandler<HTMLDivElement> = (event) => {
          let targetElement = asElement(event.target);
          if (
            !keepFocus ||
            targetElement === null ||
            !event.currentTarget.contains(targetElement)
          ) {
            return;
          }
          if (
            !shouldAllowPopupPointerFocus(event, {
              draggable: true,
            })
          ) {
            event.preventDefault();
          }
        },
        overlayStack = reactForUiPopover.useContext(popoverControlledStateContext);
      useIsomorphicLayoutEffect(() => {
        if (anchorStore === null) {
          return;
        }
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
      }, [anchorStore, declinesInitialFocus, anchor]);
      let refocusAfterPendingSheet = useRefocusAfterPendingSheet(
          sheetPopup.concealed && !declinesInitialFocus,
        ),
        mergedPopupRef = useMergedRefs(forwardedRef, sheetPopup.ref, refocusAfterPendingSheet),
        overlayLayer = useOverlayLayer("popover", layerOffset);
      usePopoverStyleDebug(className, popupProps.style);
      let popupChildren = reactForUiPopover.Children.toArray(children),
        arrows = popupChildren.filter(isPopoverArrow),
        body = (
          <overlayStackContext.Provider value={overlayStack}>
            {popupChildren.filter(
              (child: React.ReactNode): boolean => !isPopoverArrow(child),
            )}
          </overlayStackContext.Provider>
        );
      return (
        <basePopover.Portal
          container={(usePortalContainer()) as import("../contracts/overlays").BaseUIPortalContainer}
        >
          <PortalRoot
            {...overlayLayer.portalProps}
            style={
              sheetPopup.concealed
                ? {
                    ...overlayLayer.portalProps.style,
                    ...concealedPopupStyle,
                  }
                : overlayLayer.portalProps.style
            }
            surface={elevationSurfaceNames.popover}
            density={sheet ? SHEET_DENSITY : undefined}
            companionModalCatcher={!sheet}
            closeOnActivityHide={true}
          >
            {[ActiveSheetParts !== null && sheetPopup.sheet && (
                <ActiveSheetParts.PopoverSheetBackdrop sheetPopup={sheetPopup} />
              ), <layerBaseContext.Provider value={overlayLayer.base}>
                <basePopover.Positioner
                  style={
                    sheetPopup.positionerStyle !== undefined
                      ? {
                          ...overlayLayer.style,
                          ...sheetPopup.positionerStyle,
                        }
                      : overlayLayer.style
                  }
                  side={side}
                  align={align}
                  sideOffset={sideOffset}
                  alignOffset={value}
                  anchor={anchor}
                  collisionPadding={collisionPadding}
                  {...(sheet ? sheetPositioningOverrides : {})}
                  className={
                    sheet && sheetPopup.state.depth === 0
                      ? sheetOverflowBackgroundClasses
                      : undefined
                  }
                >
                  <PopoverPopupInner
                    anchored={anchor !== undefined && anchor !== null}
                    ref={mergedPopupRef}
                    {...(sheetPopup.attrs as React.HTMLAttributes<HTMLDivElement>)}
                    {...popupProps}
                    {...(sheet
                      ? {
                          initialFocus: undefined,
                        }
                      : {})}
                    onMouseDown={
                      sheet
                        ? onMouseDown
                        : (
                            mouseEvent: Parameters<
                              NonNullable<PopoverPopupInnerProps["onMouseDown"]>
                            >[0],
                          ): void => {
                            onMouseDown?.(mouseEvent);
                            callback(mouseEvent);
                          }
                    }
                    style={
                      sheetPopup.style === undefined
                        ? popupProps.style
                        : typeof popupProps.style === "function"
                          ? (
                              popupState: import("@base-ui/react/popover").Popover.Popup.State,
                            ): React.CSSProperties => ({
                              ...(
                                popupProps.style as (
                                  state: import("@base-ui/react/popover").Popover.Popup.State,
                                ) => React.CSSProperties
                              )(popupState),
                              ...sheetPopup.style,
                            })
                          : {
                              ...popupProps.style,
                              ...sheetPopup.style,
                            }
                    }
                    onFocus={(
                      event: Parameters<
                        NonNullable<PopoverPopupInnerProps["onFocus"]>
                      >[0],
                    ): void => {
                      onFocus?.(event);
                      let currentTarget = event.currentTarget;
                      if (
                        event.target === currentTarget &&
                        currentTarget.ownerDocument.activeElement ===
                          currentTarget
                      ) {
                        ref.current?.focus({
                          preventScroll: true,
                        });
                      }
                    }}
                    className={cn(
                      popoverPopupClasses,
                      sheet && sheetPopupClasses,
                      sheet &&
                        "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]",
                      sheet &&
                        "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
                      sheet && "flex flex-col",
                      !sheet && className,
                    )}
                  >
                    {ActiveSheetParts !== null && sheetPopup.sheet ? (<ActiveSheetParts.PopoverSheetContent
                        sheetPopup={sheetPopup as SheetRenderState & {chrome: NonNullable<SheetRenderState["chrome"]>}}
                        className={className}
                        bodyRef={ref}
                        bodyClassName={cn(
                          popoverScrollBodyClasses,
                          scrollFade && "scroll-fade-y",
                          popoverPaddingClasses[padding],
                        )}
                        closeLabel={closeLabel}
                      >
                        {body}
                      </ActiveSheetParts.PopoverSheetContent>) : (<jsxForUiPopover.Fragment>
                        {[<div
                            ref={ref}
                            tabIndex={-1}
                            data-cds-popover-body={""}
                            {...{
                              [SHEET_SCROLL_ATTRIBUTE]: "",
                            }}
                            className={cn(
                              popoverScrollBodyClasses,
                              scrollFade && "scroll-fade-y",
                              popoverPaddingClasses[padding],
                            )}
                          >
                            {body}
                          </div>, arrows]}
                      </jsxForUiPopover.Fragment>)}
                  </PopoverPopupInner>
                </basePopover.Positioner>
              </layerBaseContext.Provider>]}
          </PortalRoot>
        </basePopover.Portal>
      );
    });
    PopoverPopupView.displayName = "PopoverPopupView";
    popoverStateContext =
      reactForUiPopover.createContext<PopoverAnchorStore | null>(null);
    popoverControlledStateContext =
      reactForUiPopover.createContext<InnerOverlayStack | null>(null);
    (PopoverRoot as React.FC<PopoverRootProps>).displayName = "Popover.Root";
    PopoverTrigger = reactForUiPopover.forwardRef(function (
      triggerProps: import("@base-ui/react/popover").Popover.Trigger.Props<void>,
      forwardedRef: React.ForwardedRef<HTMLButtonElement>,
    ): React.ReactElement {
      let value = reactForUiPopover.useContext(popoverStateContext),
        callback = reactForUiPopover.useCallback(
          (triggerElement: HTMLElement | null): void => {
            value?.update({
              triggerEl: triggerElement,
            });
          },
          [value],
        ),
        mergedRef = useMergedRefs(forwardedRef, callback);
      return <basePopover.Trigger {...triggerProps} ref={mergedRef} />;
    });
    PopoverTrigger.displayName = "Popover.Trigger";
    PopoverTriggerAlias = PopoverTrigger;
    PopoverComponents = {
      Root: PopoverRoot,
      Trigger: PopoverTriggerAlias,
      Popup: PopoverPopup,
      Title: basePopover.Title,
      Description: basePopover.Description,
      Close: basePopover.Close,
      Arrow: basePopover.Arrow,
      createHandle: basePopover.createHandle,
    };
  };
}
