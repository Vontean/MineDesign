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
  let value = useAvailableSheetParts(),
    { pending: value2 } = useSheetState();
  return value !== null ? (
    <value.SheetPopupHost>
      {(input: SheetRenderState) => children(input, value)}
    </value.SheetPopupHost>
  ) : (
    <jsxPopoverPopover.Fragment>
      {children(
        value2
          ? SheetsPopupStackConcealedConfig
          : SheetsPopupStackSheetConcealedChromeConfig,
        null,
      )}
      {value2 ? (<OverlayBackdrop kind={kind} />) : (null)}
    </jsxPopoverPopover.Fragment>
  );
}
function usePopoverAnimation(
  input: string | undefined,
  options: import("@base-ui/react/popover").Popover.Popup.Props["style"],
): void {
  let value = (0, reactPopoverPopover.useRef)(false);
  (0, reactPopoverPopover.useEffect)(() => {}, [input, options]);
}
function isPopoverArrow(input: React.ReactNode): boolean {
  return (
    (0, reactPopoverPopover.isValidElement)(input) &&
    input.type === npm_Popover_$f.Arrow
  );
}
function usePopoverInnerOverlays(
  input: import("@base-ui/react/popover").Popover.Root.Props<void>["onOpenChange"],
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
      (input2, options) => {
        closeInnerOverlayOnEscape(value, input2, options) ||
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
  if (anchor == null) return input.triggerEl;
  if (anchor instanceof Element) return anchor;
  if (typeof anchor == "object" && "current" in anchor) {
    let current = anchor.current;
    return current instanceof Element ? current : null;
  }
  return "virtual";
}
function hasPopoverInputAnchor(input: PopoverAnchorState): boolean {
  if (!input.popupMounted || !input.declinesFocus) return false;
  let value = resolvePopoverAnchor(input);
  return value === "virtual"
    ? true
    : value === null
      ? false
      : isTextInputElement(value) ||
        value.querySelector(
          'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
        ) !== null ||
        value.closest(
          'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
        ) !== null;
}
function PopoverRoot<Payload = void>({
  onOpenChange: onOpenChange,
  actionsRef: actionsRef,
  ...props
}: PopoverRootProps<Payload>): React.ReactElement {
  useUiLocale();
  let value = usePopoverInnerOverlays(onOpenChange),
    value2 = useSheetInteractionMode(),
    value3 = (0, reactPopoverPopover.useRef)<OverlayActions | null>(null);
  useOverlayImperativeHandle(value3, actionsRef);
  return (
    <PopoverPopoverContext_2.Provider value={value.innerOverlays}>
      <ActivityBoundary actionsRef={value3}>
        {value2 ? ((() => {
            const _Component = usePopoverRoot;
            return (
              <_Component
                {...props}
                actionsRef={value3}
                onOpenChange={value.onOpenChange}
                consumerHandlesOpenChange={onOpenChange !== undefined}
              />
            );
          })()) : (<npm_Popover_$f.Root
            {...props}
            actionsRef={value3}
            onOpenChange={value.onOpenChange}
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
    value2: React.RefObject<PopoverAnchorState> = (0,
    reactPopoverPopover.useRef)({
      popupMounted: false,
      declinesFocus: false,
      anchor: undefined,
      triggerEl: null,
    }),
    value3: PopoverAnchorStore = (0, reactPopoverPopover.useMemo)(
      () => ({
        update: (input) => {
          Object.assign(value2.current, input);
        },
        read: () => value2.current,
      }),
      [],
    ),
    value4 = useOpenSnapshot(
      value.open,
      () => {
        let value6 = value3.read();
        return !value6.popupMounted || hasPopoverInputAnchor(value6);
      },
      false,
    ),
    value5 = useSheetPopup({
      open: value.open,
      actionsRef: props.actionsRef,
      onOpenChange: value.onOpenChange,
      onOpenChangeComplete: props.onOpenChangeComplete,
      structurallyAnchored: value4,
      closable: !(props.open !== undefined && !consumerHandlesOpenChange),
    });
  return (
    <PopoverPopoverContext.Provider value={value3}>
      <SheetPopupProvider value={value5}>
        <npm_Popover_$f.Root
          {...props}
          modal={value5.modal ?? props.modal}
          actionsRef={value5.actionsRef}
          onOpenChange={value5.onOpenChange}
          onOpenChangeComplete={value5.onOpenChangeComplete}
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
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value =
              (0, reactPopoverPopover.useContext)(SheetPopupContext)
                ?.open ?? true,
            value2 = anchored && finalFocus === undefined,
            value3 = useOpenerReturn({
              skipRestoreOnOutsideFocus: true,
              open: value,
              registerOpenerReturn: value2,
            }),
            value4 = useMergedRefs(options, value3.popupRef);
          return (
            <npm_Popover_$f.Popup
              data-cds={"Popover"}
              {...{
                [overlayAttribute]: "",
              }}
              ref={value4}
              finalFocus={value2 ? value3.finalFocus : finalFocus}
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
          return isInsideSheetPopup() ? (
            <PopoverSheetCapablePopup {...state} ref={options} />
          ) : (
            <PopoverPopupView
              {...state}
              ref={options}
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
          input: PopoverPopupProps,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <SheetCapablePopup kind={"popover"}>
            {(input2: SheetRenderState, options2: MobileSheetParts | null) => (
              <PopoverPopupView
                {...input}
                ref={options}
                sheetPopup={input2}
                sheetParts={options2}
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
          value18 = (0, reactPopoverPopover.useRef)<HTMLDivElement | null>(
            null,
          ),
          sheet = sheetPopup.sheet,
          value19 = (0, reactPopoverPopover.useContext)(
            SheetPopupContext,
          ),
          value20 = (value19?.open ?? false) && value19?.height !== undefined,
          value21 = value19?.setDetent;
        useIsomorphicLayoutEffect(() => {
          let current = value18.current;
          sheet &&
            value20 &&
            value6 === "tall" &&
            current !== null &&
            current.querySelector(
              'input:not([type=button],[type=checkbox],[type=radio],[type=range],[type=submit],[type=reset],[type=color],[type=file],[type=image],[type=hidden],[readonly]), textarea:not([readonly]), [contenteditable=""], [contenteditable="true"], [contenteditable="plaintext-only"]',
            ) !== null &&
            value21?.("tall");
        }, [sheet, value20, value6, value21]);
        let value22 =
            sheetPopup.sheet && sheetParts !== null ? sheetParts : null,
          value23 = (0, reactPopoverPopover.useContext)(PopoverPopoverContext),
          value24 = value11.initialFocus === false,
          callback: React.MouseEventHandler<HTMLDivElement> = (event) => {
            let value32 = asElement(event.target);
            !value17 ||
              value32 === null ||
              !event.currentTarget.contains(value32) ||
              isInteractivePressTarget(event, {
                draggable: true,
              }) ||
              event.preventDefault();
          },
          value25 = (0, reactPopoverPopover.useContext)(
            PopoverPopoverContext_2,
          );
        useIsomorphicLayoutEffect(() => {
          if (value23 !== null) {
            value23.update({
              popupMounted: true,
              declinesFocus: value24,
              anchor: value2,
            });
            return () => {
              value23.update({
                popupMounted: false,
              });
            };
          }
        }, [value23, value24, value2]);
        let value26 = useRestoreFocusOnClose(
            sheetPopup.concealed && !value24,
          ),
          value27 = useMergedRefs(
            options,
            sheetPopup.ref,
            value26,
          ),
          value28 = useLayer("popover", value4);
        usePopoverAnimation(
          value7,
          (
            value11 as {
              style: (
                state: import("@base-ui/react/popover").Popover.Popup.State,
              ) => React.CSSProperties;
            }
          ).style,
        );
        let value29 = reactPopoverPopover.Children.toArray(value8),
          value30 = value29.filter(isPopoverArrow),
          value31 = (
            <InnerOverlaysContext.Provider value={value25}>
              {value29.filter((input) => !isPopoverArrow(input))}
            </InnerOverlaysContext.Provider>
          );
        return (
          <npm_Popover_$f.Portal
            container={useOverlayRoot()}
          >
            <PopupSurface
              {...value28.portalProps}
              style={
                sheetPopup.concealed
                  ? {
                      ...value28.portalProps.style,
                      ...OverlaysBackdropVisibilityOpacityConfig,
                    }
                  : value28.portalProps.style
              }
              surface={surfaceBackgroundTokens.popover}
              density={sheet ? ComfortableValue : undefined}
              companionModalCatcher={!sheet}
              closeOnActivityHide={true}
            >
              {value22 !== null && sheetPopup.sheet && (<value22.PopoverSheetBackdrop sheetPopup={sheetPopup} />)}
              <LayerBaseContext.Provider value={value28.base}>
                <npm_Popover_$f.Positioner
                  style={
                    sheetPopup.positionerStyle !== undefined
                      ? {
                          ...value28.style,
                          ...sheetPopup.positionerStyle,
                        }
                      : value28.style
                  }
                  side={value12}
                  align={value13}
                  sideOffset={value14}
                  alignOffset={value}
                  anchor={value2}
                  collisionPadding={value3}
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
                    anchored={value2 != null}
                    ref={value27}
                    {...sheetPopup.attrs}
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
                              NonNullable<
                                import("@base-ui/react/popover").Popover.Popup.Props["onMouseDown"]
                              >
                            >[0],
                          ) => {
                            value10?.(input);
                            callback(input);
                          }
                    }
                    style={
                      sheetPopup.style === undefined
                        ? (
                            value11 as {
                              style: (
                                state: import("@base-ui/react/popover").Popover.Popup.State,
                              ) => React.CSSProperties;
                            }
                          ).style
                        : typeof (
                              value11 as {
                                style: (
                                  state: import("@base-ui/react/popover").Popover.Popup.State,
                                ) => React.CSSProperties;
                              }
                            ).style == "function"
                          ? (
                              input: import("@base-ui/react/popover").Popover.Popup.State,
                            ) => ({
                              ...(
                                value11 as {
                                  style: (
                                    state: import("@base-ui/react/popover").Popover.Popup.State,
                                  ) => React.CSSProperties;
                                }
                              ).style(input),
                              ...sheetPopup.style,
                            })
                          : {
                              ...(
                                value11 as {
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
                      value9?.(event);
                      let currentTarget = event.currentTarget;
                      event.target === currentTarget &&
                        currentTarget.ownerDocument.activeElement ===
                          currentTarget &&
                        value18.current?.focus({
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
                      !sheet && value7,
                    )}
                  >
                    {value22 !== null && sheetPopup.sheet ? (<value22.PopoverSheetContent
                        sheetPopup={sheetPopup}
                        className={value7}
                        bodyRef={value18}
                        bodyClassName={cn(
                          popoverPopupClassNames,
                          value16 && "scroll-fade-y",
                          PopoverPopoverNoneXsSmConfig[value15],
                        )}
                        closeLabel={value5}
                      >
                        {value31}
                      </value22.PopoverSheetContent>) : (<jsxPopoverPopover_2.Fragment>
                        <div
                          ref={value18}
                          tabIndex={-1}
                          data-cds-popover-body={""}
                          {...{
                            [sheetScrollAttribute]: "",
                          }}
                          className={cn(
                            popoverPopupClassNames,
                            value16 && "scroll-fade-y",
                            PopoverPopoverNoneXsSmConfig[value15],
                          )}
                        >
                          {value31}
                        </div>
                        {value30}
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
        input: import("@base-ui/react/popover").Popover.Trigger.Props<void>,
        options: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement {
        let value = (0, reactPopoverPopover.useContext)(PopoverPopoverContext),
          value2 = (0, reactPopoverPopover.useCallback)(
            (input2: HTMLElement | null): void => {
              value?.update({
                triggerEl: input2,
              });
            },
            [value],
          ),
          value3 = useMergedRefs(options, value2);
        return <npm_Popover_$f.Trigger {...input} ref={value3} />;
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
