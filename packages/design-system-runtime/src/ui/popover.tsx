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
  input: string | undefined,
  options: PopoverPopupProps["style"],
): void {
  let ref = reactForUiPopover.useRef(false);
  reactForUiPopover.useEffect(() => {
    return;
  }, [input, options]);
}
function isPopoverArrow(input: React.ReactNode): boolean {
  return (
    reactForUiPopover.isValidElement(input) &&
    input.type === basePopover.Arrow
  );
}
function usePopoverOverlayStack(input: PopoverRootProps["onOpenChange"]): {
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
        input2: boolean,
        options: import("@base-ui/react/popover").Popover.Root.ChangeEventDetails,
      ): void => {
        if (
          (0, interceptEscapeForInnerOverlay)(value, input2, options)
        ) {
          return;
        }
        input?.(input2, options);
      },
      [value, input],
    ),
  };
}
function resolvePopoverAnchor(
  input: PopoverAnchorState,
): Element | null | "virtual" {
  let anchor = input.anchor;
  if (anchor === undefined || anchor === null) {
    return input.triggerEl;
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
function popoverRefusesFocusOut(input: PopoverAnchorState): boolean {
  if (!input.popupMounted || !input.declinesFocus) {
    return false;
  }
  let value = resolvePopoverAnchor(input);
  if (value === "virtual") {
    return true;
  }
  if (value === null) {
    return false;
  }
  return (
    (0, isEditableElement)(value) ||
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
    value2 = (0, useSheetCapablePresentation)(),
    ref = reactForUiPopover.useRef<OverlayActions | null>(null);
  (0, useForwardedOverlayActions)(ref, actionsRef);
  return (
    <popoverControlledStateContext.Provider value={value.innerOverlays}>
      <CloseOnActivityHideProvider actionsRef={ref}>
        {value2 ? (<ControlledPopoverRoot
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
  let value = (0, useControllableOpen)(props),
    ref = reactForUiPopover.useRef<PopoverAnchorState>({
      popupMounted: false,
      declinesFocus: false,
      anchor: undefined,
      triggerEl: null,
    }),
    memo = reactForUiPopover.useMemo<PopoverAnchorStore>(
      () => ({
        update: (input: Partial<PopoverAnchorState>): void => {
          Object.assign(ref.current, input);
        },
        read: (): PopoverAnchorState => ref.current,
      }),
      [],
    ),
    value2 = (0, useValueCapturedOnOpen)(
      value.open,
      () => {
        let value4 = memo.read();
        return !value4.popupMounted || popoverRefusesFocusOut(value4);
      },
      false,
    ),
    value3 = (0, useAdaptiveSheet)({
      open: value.open,
      actionsRef: props.actionsRef,
      onOpenChange: value.onOpenChange,
      onOpenChangeComplete: props.onOpenChangeComplete,
      structurallyAnchored: value2,
      closable: !(props.open !== undefined && !consumerHandlesOpenChange),
    });
  return (
    <popoverStateContext.Provider value={memo}>
      <SheetContextProvider value={value3}>
        <basePopover.Root
          {...props}
          modal={value3.modal ?? props.modal}
          actionsRef={value3.actionsRef}
          onOpenChange={value3.onOpenChange}
          onOpenChangeComplete={value3.onOpenChangeComplete}
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
    reactForUiPopover = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxForUiPopover = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    popoverPopupClasses = `draggable-none max-w-[320px] max-h-[var(--available-height)] ${(0, getSurfaceClasses)("popover")} cds-reset text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
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
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value =
            reactForUiPopover.useContext<SheetFrameContext | null>(
              sheetFrameContext,
            )?.open ?? true,
          value2 = anchored && finalFocus === undefined,
          value3 = (0, useOverlayFocusReturn)({
            skipRestoreOnOutsideFocus: true,
            open: value,
            registerOpenerReturn: value2,
          }),
          value4 = (0, useMergedRefs)(options, value3.popupRef);
        return (
          <basePopover.Popup
            data-cds={"Popover"}
            {...{
              [OVERLAY_ATTRIBUTE]: "",
            }}
            ref={value4}
            finalFocus={(value2 ? value3.finalFocus : finalFocus) as import("../contracts/overlays").BaseUIPopupFocus}
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
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let state = {
          side: side,
          align: align,
          sideOffset: sideOffset,
          padding: padding,
          scrollFade: scrollFade,
          ...props,
        };
        if ((0, useHasSheetFrame)()) {
          return <PopoverSheetCapablePopup {...state} ref={options} />;
        } else {
          return (
            <PopoverPopupView
              {...state}
              ref={options}
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
        input: PopoverPopupProps,
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => (
        <AdaptiveSheetPopupHost kind={"popover"}>
          {(
            input2: SheetRenderState,
            options2: MobileSheetParts | null,
          ): React.ReactElement => (
            <PopoverPopupView
              {...input}
              ref={options}
              sheetPopup={input2}
              sheetParts={options2}
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
      options: React.ForwardedRef<HTMLDivElement>,
    ): React.ReactElement {
      let {
          side: value12 = "bottom",
          align: value13 = "center",
          sideOffset: value14 = 6,
          alignOffset: value,
          anchor: value2,
          collisionPadding: value3,
          padding: value15 = "lg",
          scrollFade: value16 = true,
          layerOffset: value4,
          closeLabel: value5,
          sheetHeight: value6,
          className: value7,
          children: value8,
          onFocus: value9,
          onMouseDown: value10,
          keepFocus: value17 = false,
          ...value11
        } = props,
        ref = reactForUiPopover.useRef<HTMLDivElement | null>(null),
        sheet = sheetPopup.sheet,
        value18 = reactForUiPopover.useContext<SheetFrameContext | null>(
          sheetFrameContext,
        ),
        value19 = (value18?.open ?? false) && value18?.height !== undefined,
        value20 = value18?.setDetent;
      (0, useIsomorphicLayoutEffect)(() => {
        let current = ref.current;
        if (
          sheet &&
          value19 &&
          value6 === "tall" &&
          current !== null &&
          current.querySelector(
            'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
          ) !== null
        ) {
          value20?.("tall");
        }
      }, [sheet, value19, value6, value20]);
      let value21 = sheetPopup.sheet && sheetParts !== null ? sheetParts : null,
        value22 = reactForUiPopover.useContext(popoverStateContext),
        value23 = value11.initialFocus === false,
        callback: React.MouseEventHandler<HTMLDivElement> = (event) => {
          let value31 = (0, asElement)(event.target);
          if (
            !value17 ||
            value31 === null ||
            !event.currentTarget.contains(value31)
          ) {
            return;
          }
          if (
            !(0, shouldAllowPopupPointerFocus)(event, {
              draggable: true,
            })
          ) {
            event.preventDefault();
          }
        },
        value24 = reactForUiPopover.useContext(popoverControlledStateContext);
      (0, useIsomorphicLayoutEffect)(() => {
        if (value22 === null) {
          return;
        }
        value22.update({
          popupMounted: true,
          declinesFocus: value23,
          anchor: value2,
        });
        return () => {
          value22.update({
            popupMounted: false,
          });
        };
      }, [value22, value23, value2]);
      let value25 = (0, useRefocusAfterPendingSheet)(
          sheetPopup.concealed && !value23,
        ),
        value26 = (0, useMergedRefs)(options, sheetPopup.ref, value25),
        value27 = (0, useOverlayLayer)("popover", value4);
      usePopoverStyleDebug(value7, value11.style);
      let value28 = reactForUiPopover.Children.toArray(value8),
        value29 = value28.filter(isPopoverArrow),
        value30 = (
          <overlayStackContext.Provider value={value24}>
            {value28.filter(
              (input: React.ReactNode): boolean => !isPopoverArrow(input),
            )}
          </overlayStackContext.Provider>
        );
      return (
        <basePopover.Portal
          container={((0, usePortalContainer)()) as import("../contracts/overlays").BaseUIPortalContainer}
        >
          <PortalRoot
            {...value27.portalProps}
            style={
              sheetPopup.concealed
                ? {
                    ...value27.portalProps.style,
                    ...concealedPopupStyle,
                  }
                : value27.portalProps.style
            }
            surface={elevationSurfaceNames.popover}
            density={sheet ? SHEET_DENSITY : undefined}
            companionModalCatcher={!sheet}
            closeOnActivityHide={true}
          >
            {[value21 !== null && sheetPopup.sheet && (
                <value21.PopoverSheetBackdrop sheetPopup={sheetPopup} />
              ), <layerBaseContext.Provider value={value27.base}>
                <basePopover.Positioner
                  style={
                    sheetPopup.positionerStyle !== undefined
                      ? {
                          ...value27.style,
                          ...sheetPopup.positionerStyle,
                        }
                      : value27.style
                  }
                  side={value12}
                  align={value13}
                  sideOffset={value14}
                  alignOffset={value}
                  anchor={value2}
                  collisionPadding={value3}
                  {...(sheet ? sheetPositioningOverrides : {})}
                  className={
                    sheet && sheetPopup.state.depth === 0
                      ? sheetOverflowBackgroundClasses
                      : undefined
                  }
                >
                  <PopoverPopupInner
                    anchored={value2 !== undefined && value2 !== null}
                    ref={value26}
                    {...(sheetPopup.attrs as React.HTMLAttributes<HTMLDivElement>)}
                    {...value11}
                    {...(sheet
                      ? {
                          initialFocus: undefined,
                        }
                      : {})}
                    onMouseDown={
                      sheet
                        ? value10
                        : (
                            input: Parameters<
                              NonNullable<PopoverPopupInnerProps["onMouseDown"]>
                            >[0],
                          ): void => {
                            value10?.(input);
                            callback(input);
                          }
                    }
                    style={
                      sheetPopup.style === undefined
                        ? value11.style
                        : typeof value11.style === "function"
                          ? (
                              input: import("@base-ui/react/popover").Popover.Popup.State,
                            ): React.CSSProperties => ({
                              ...(
                                value11.style as (
                                  state: import("@base-ui/react/popover").Popover.Popup.State,
                                ) => React.CSSProperties
                              )(input),
                              ...sheetPopup.style,
                            })
                          : {
                              ...value11.style,
                              ...sheetPopup.style,
                            }
                    }
                    onFocus={(
                      event: Parameters<
                        NonNullable<PopoverPopupInnerProps["onFocus"]>
                      >[0],
                    ): void => {
                      value9?.(event);
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
                    className={(0, cn)(
                      popoverPopupClasses,
                      sheet && sheetPopupClasses,
                      sheet &&
                        "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]",
                      sheet &&
                        "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
                      sheet && "flex flex-col",
                      !sheet && value7,
                    )}
                  >
                    {value21 !== null && sheetPopup.sheet ? (<value21.PopoverSheetContent
                        sheetPopup={sheetPopup as SheetRenderState & {chrome: NonNullable<SheetRenderState["chrome"]>}}
                        className={value7}
                        bodyRef={ref}
                        bodyClassName={(0, cn)(
                          popoverScrollBodyClasses,
                          value16 && "scroll-fade-y",
                          popoverPaddingClasses[value15],
                        )}
                        closeLabel={value5}
                      >
                        {value30}
                      </value21.PopoverSheetContent>) : (<jsxForUiPopover.Fragment>
                        {[<div
                            ref={ref}
                            tabIndex={-1}
                            data-cds-popover-body={""}
                            {...{
                              [SHEET_SCROLL_ATTRIBUTE]: "",
                            }}
                            className={(0, cn)(
                              popoverScrollBodyClasses,
                              value16 && "scroll-fade-y",
                              popoverPaddingClasses[value15],
                            )}
                          >
                            {value30}
                          </div>, value29]}
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
      input: import("@base-ui/react/popover").Popover.Trigger.Props<void>,
      options: React.ForwardedRef<HTMLButtonElement>,
    ): React.ReactElement {
      let value = reactForUiPopover.useContext(popoverStateContext),
        callback = reactForUiPopover.useCallback(
          (input2: HTMLElement | null): void => {
            value?.update({
              triggerEl: input2,
            });
          },
          [value],
        ),
        value2 = (0, useMergedRefs)(options, callback);
      return <basePopover.Trigger {...input} ref={value2} />;
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
