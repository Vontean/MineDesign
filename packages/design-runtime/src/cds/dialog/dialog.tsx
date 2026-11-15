import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type {
  AlertDialogRootProps,
  BrowserWindow,
  ConfirmationDialogProps,
  ConfirmationFocus,
  DialogDescriptionProps,
  DialogFooterProps,
  DialogHeaderProps,
  DialogPopupInnerProps,
  DialogPopupProps,
  DialogRootProps,
  DialogTitleProps,
  FocusOptionsWithVisibility,
  ForwardComponent,
  OverlayActions,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { Button, initializeButtonButton } from "../button/button";
import { popupSurfaceClassName } from "../components/icon";
import { initializeComponentsTextLink_2, preserveDialogFocus, preventDialogMouseSelection, useDialogKeyboardViewport } from "../components/text-link";
import { ActivityBoundary, initializeDomRefComposition, initializeDomRefComposition_3, useMergedRefs } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeHooksStableCallback } from "../hooks/stable-callback";
import { initializeOverlaysImperativeHandle, useOverlayImperativeHandle } from "../overlays/imperative-handle";
import { initializeOverlaysLayers, LayerBaseContext, useDefaultLayer } from "../overlays/layers";
import { initializePlatformRootFontSize_2, PopupSurface } from "../platform/root-font-size";
import { initializeOverlayAttributes, initializeSheetsScrollArea_6, overlayAttribute, useFinalFocus } from "../sheets/scroll-area";
import { initializeSheetsStyles_2, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeCdsRoot, useOverlayRoot } from "../theme/root";
import { initializeThemeSurfaces, surfaceBackgroundTokens } from "../theme/surfaces";
import { DeferredDisabledReasonTooltip, initializeTooltipDeferredProvider } from "../tooltip/deferred-provider";
import { initializeNpm__base_ui_react_sYe, initializeNpm__base_ui_react_uYe, initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_AlertDialog_Dh, npm_clsx_Ea, npm_Dialog_Xg } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactDialogDialog: typeof React;
var jsxDialogDialog: typeof import("react/jsx-runtime");
var DialogDialogCss: string;
var DialogDialogClassNames: string;
var DialogDialogCss_2: string;
var DialogDialogClassNames_2: string;
var dialogBackdropClasses: string;
var DialogDialogClassNames_3: string;
var StartingOpacity0Value: string;
var DialogDialogCurrentState: AbortController | null;
var DialogDialogHeightWebkitAppRegionConfig: React.CSSProperties & {
  WebkitAppRegion: string;
};
var DialogDialogClassNames_4: string;
var DataNestedDialogOpenBlur2pxValue: string;
var DialogDialogSmMdLgConfig: {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
  "3xl": string;
};
var DialogDialogPattern: RegExp;
var DialogDialogContext: React.Context<boolean | "trap-focus" | undefined>;
var DialogDialogContext_2: React.Context<boolean>;
var DialogDialogClassNames_5: string;
var DialogDialogClassNames_6: string;
var Mt05Value: string;
var Mt1Value: string;
var DialogDialogClassNames_7: string;
var DialogDialogContext_3: React.Context<
  React.RefObject<HTMLButtonElement | null> | undefined
>;
var DialogDialogContext_4: React.Context<boolean>;
var DialogTrigger: ForwardComponent<
  HTMLButtonElement,
  import("@base-ui/react/dialog").Dialog.Trigger.Props<void>
>;
var DialogDialogDelayMs: number;
var DialogDialogLabel: string;
var DialogPopupInner: ForwardComponent<HTMLDivElement, DialogPopupInnerProps>;
var ConfirmationDialogPopupInner: ForwardComponent<
  HTMLDivElement,
  import("@base-ui/react/alert-dialog").AlertDialog.Popup.Props
>;
var DialogPopup: ForwardComponent<HTMLDivElement, DialogPopupProps>;
var DialogTitle: ForwardComponent<HTMLHeadingElement, DialogTitleProps>;
var DialogDialogLabel_2: string;
var DialogDescription: ForwardComponent<
  HTMLParagraphElement,
  DialogDescriptionProps
>;
var DialogDialogStartCenterEndConfig: {
  start: string;
  center: string;
  end: string;
  between: string;
};
var DialogDialogRootTriggerPopupConfig: {
  Root: typeof DialogRoot;
  Trigger: typeof DialogTrigger;
  Popup: typeof DialogPopup;
  Backdrop: typeof import("@base-ui/react/dialog").Dialog.Backdrop;
  Header: typeof DialogHeader;
  Title: typeof DialogTitle;
  Description: typeof DialogDescription;
  Footer: typeof DialogFooter;
  Close: typeof import("@base-ui/react/dialog").Dialog.Close;
  CloseButton: typeof DialogCloseButton;
};
var DialogDialogRootTriggerPopupConfig_2: {
  Root: typeof AlertDialogRoot;
  Trigger: typeof import("@base-ui/react/alert-dialog").AlertDialog.Trigger;
  Popup: typeof DialogPopup;
  Backdrop: typeof import("@base-ui/react/alert-dialog").AlertDialog.Backdrop;
  Header: typeof DialogHeader;
  Title: typeof DialogTitle;
  Description: typeof DialogDescription;
  Footer: typeof DialogFooter;
  Close: typeof import("@base-ui/react/alert-dialog").AlertDialog.Close;
  CloseButton: typeof DialogCloseButton;
  createHandle: typeof import("@base-ui/react/alert-dialog").AlertDialog.createHandle;
};
var initializeDialogDialog: () => void;
function WindowDragStrip(): React.ReactElement {
  useUiLocale();
  return (
    <div
      aria-hidden={true}
      data-cds-window-drag-strip={""}
      className={"fixed inset-x-0 top-0"}
      style={DialogDialogHeightWebkitAppRegionConfig}
    />
  );
}
function useDialogPresence(input?: string): void {
  (0, reactDialogDialog.useEffect)(() => {}, [input]);
}
function useDialogOpenAutofocus(
  input: React.RefObject<HTMLElement | null>,
  options: boolean,
  context: React.RefObject<HTMLElement | null>,
  value: React.RefObject<boolean>,
  extra: React.RefObject<boolean>,
  detail: () => HTMLElement | null,
): () => HTMLElement | null {
  return (0, reactDialogDialog.useCallback)(() => {
    let current = input.current,
      value2 = current?.ownerDocument,
      value3: BrowserWindow | null | undefined = value2?.defaultView as
        | BrowserWindow
        | null
        | undefined;
    if (current && value2 && value3) {
      value3.requestAnimationFrame(() => {
        if (!value.current || !current.isConnected) return;
        let current2 = context.current,
          activeElement = value2.activeElement;
        (current2 &&
          activeElement &&
          activeElement !== current &&
          current2.contains(activeElement)) ||
          current.focus({
            preventScroll: true,
            focusVisible: options,
          } as FocusOptionsWithVisibility);
      });
      let index = 0,
        flag = false,
        callback = (event: FocusEvent): void => {
          let current2 = context.current,
            target = event.target;
          if (
            !(
              flag ||
              !value.current ||
              extra.current ||
              index >= 3 ||
              !current2 ||
              !(target instanceof value3.Element) ||
              current2.contains(target)
            )
          ) {
            if (!(target as Element).closest(DialogDialogLabel)) {
              flag = true;
              return;
            }
            index += 1;
            value3.requestAnimationFrame(() => {
              let value4 = detail();
              !value.current ||
                extra.current ||
                !value4?.isConnected ||
                (value4 instanceof value3.HTMLButtonElement &&
                  value4.disabled) ||
                value4.focus({
                  preventScroll: true,
                  focusVisible: value4 !== context.current,
                } as FocusOptionsWithVisibility);
            });
          }
        };
      value2.addEventListener("focusin", callback, true);
      value3.setTimeout(() => {
        value2.removeEventListener("focusin", callback, true);
      }, 1e3);
    }
    return current;
  }, [input, options, context, value, extra, detail]);
}
function DialogCloseButton({
  "aria-label": ariaLabel,
  className: className,
  flush = false,
}: {
  "aria-label"?: string;
  className?: string;
  flush?: boolean;
}): React.ReactElement {
  useUiLocale();
  let value = (0, useLabel)("close", "Close");
  return (
    <npm_Dialog_Xg.Close
      render={
        <Button
          variant={"ghost"}
          iconOnly={true}
          icon={"X"}
          aria-label={ariaLabel ?? (value)}
          tooltip={false}
          className={(0, cn)(flush && DialogDialogLabel_2, className)}
        />
      }
    />
  );
}
function DialogHeader({
  actions: actions,
  description: description,
  showClose = true,
  closeLabel: closeLabel,
  className: className,
  children: children,
}: DialogHeaderProps): React.ReactElement {
  useUiLocale();
  let value = (0, reactDialogDialog.useContext)(DialogDialogContext_2);
  return (
    <div
      className={(0, cn)(
        "mb-pad-md flex items-start gap-2",
        className,
      )}
    >
      <div
        className={(0, npm_clsx_Ea)(
          value ? Mt05Value : Mt1Value,
          "flex min-w-0 flex-1 flex-col gap-1",
        )}
      >
        <DialogTitle className={"break-words"}>{children}</DialogTitle>
        {description && (<npm_Dialog_Xg.Description
            className={"text-body font-normal text-secondary"}
          >
            {description}
          </npm_Dialog_Xg.Description>)}
      </div>
      {actions && (<div className={"-mt-pad-sm"}>{actions}</div>)}
      {showClose && (<DialogCloseButton aria-label={closeLabel} flush={true} />)}
    </div>
  );
}
function DialogFooter({
  align = "end",
  className: className,
  children: children,
}: DialogFooterProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      className={(0, cn)(
        "mt-pad-lg flex flex-col-reverse gap-2 sm:flex-row",
        DialogDialogStartCenterEndConfig[align],
        className,
      )}
    >
      {children}
    </div>
  );
}
function DialogRoot<Payload = void>({
  dismissible: dismissible,
  disablePointerDismissal: disablePointerDismissal,
  actionsRef: actionsRef,
  ...props
}: DialogRootProps<Payload>): React.ReactElement {
  useUiLocale();
  let value = (0, reactDialogDialog.useRef)<HTMLButtonElement | null>(null),
    value2 = (0, reactDialogDialog.useRef)<OverlayActions | null>(null);
  (0, useOverlayImperativeHandle)(value2, actionsRef);
  let value3 =
    disablePointerDismissal ?? (dismissible === false ? true : undefined);
  return (
    <DialogDialogContext_2.Provider value={false}>
      <DialogDialogContext.Provider value={props.modal}>
        <DialogDialogContext_3.Provider value={value}>
          <DialogDialogContext_4.Provider value={!value3}>
            <ActivityBoundary actionsRef={value2}>
              <npm_Dialog_Xg.Root
                disablePointerDismissal={value3}
                actionsRef={value2}
                {...props}
              />
            </ActivityBoundary>
          </DialogDialogContext_4.Provider>
        </DialogDialogContext_3.Provider>
      </DialogDialogContext.Provider>
    </DialogDialogContext_2.Provider>
  );
}
function AlertDialogRoot<Payload = void>({
  actionsRef: actionsRef,
  ...props
}: AlertDialogRootProps<Payload>): React.ReactElement {
  useUiLocale();
  let value = (0, reactDialogDialog.useRef)<OverlayActions | null>(null);
  (0, useOverlayImperativeHandle)(value, actionsRef);
  return (
    <DialogDialogContext_2.Provider value={true}>
      <DialogDialogContext.Provider value={true}>
        <DialogDialogContext_4.Provider value={false}>
          <ActivityBoundary actionsRef={value}>
            <npm_AlertDialog_Dh.Root {...props} actionsRef={value} />
          </ActivityBoundary>
        </DialogDialogContext_4.Provider>
      </DialogDialogContext.Provider>
    </DialogDialogContext_2.Provider>
  );
}
function ConfirmationDialog({
  open: open,
  onOpenChange: onOpenChange,
  title: title,
  description: description,
  confirmLabel: confirmLabel,
  cancelLabel: cancelLabel,
  confirmVariant = "primary",
  initialFocus = "confirm",
  disabled: disabled2 = false,
  confirmDisabledReason: confirmDisabledReason,
  size = "sm",
  className: className,
  portalClassName: portalClassName,
  onConfirm: onConfirm,
  closeOnConfirm = false,
  children: children,
}: ConfirmationDialogProps): React.ReactElement {
  useUiLocale();
  let value = (0, useLabel)("confirm", "Confirm"),
    value2 = (0, useLabel)("cancel", "Cancel"),
    value3 = confirmLabel ?? value,
    value4 = cancelLabel ?? value2,
    [value5, value6] = (0, reactDialogDialog.useState)(false),
    value7 = (0, reactDialogDialog.useRef)<HTMLButtonElement | null>(null),
    value8 = (0, reactDialogDialog.useRef)<HTMLButtonElement | null>(null),
    { finalFocus: value9, popupRef: value10 } = (0, useFinalFocus)(
      open,
    ),
    callback = (): ConfirmationFocus =>
      initialFocus === "cancel"
        ? "cancel"
        : disabled2
          ? "pending"
          : "confirm",
    [value11, value12] = (0, reactDialogDialog.useState)(callback),
    value13 = (0, reactDialogDialog.useRef)(value11);
  (0, useIsomorphicLayoutEffect)(() => {
    value13.current = value11;
  }, [value11]);
  let value14 = (0, reactDialogDialog.useCallback)(() => {
      switch (value13.current) {
        case "confirm":
          return value8.current;
        case "cancel":
          return value7.current;
        default:
          return value10.current;
      }
    }, [value10]),
    value15 = (0, reactDialogDialog.useRef)(false),
    value16 = (0, reactDialogDialog.useCallback)(() => {
      value15.current = true;
    }, []);
  (0, useIsomorphicLayoutEffect)(() => {
    open && ((value15.current = false), value12(callback()));
  }, [open]);
  let value17 = (0, reactDialogDialog.useCallback)(
    (input: ConfirmationFocus): void => {
      value12(input);
      let value28 = input === "confirm" ? value8.current : value7.current,
        current = value10.current;
      if (!value28 || !current) return;
      let activeElement = value28.ownerDocument.activeElement,
        value29 =
          !activeElement ||
          activeElement === current ||
          activeElement === value28.ownerDocument.body ||
          (!current.contains(activeElement) &&
            activeElement.closest(DialogDialogLabel) !== null),
        value30 =
          activeElement === value7.current ||
          activeElement === value8.current;
      (value29 || (value30 && !value15.current)) &&
        value28.focus({
          preventScroll: true,
          focusVisible: true,
        } as FocusOptionsWithVisibility);
    },
    [value10],
  );
  (0, reactDialogDialog.useEffect)(() => {
    if (!open || value11 !== "pending") return;
    if (!disabled2) {
      let value29 = requestAnimationFrame(() => value17("confirm"));
      return () => cancelAnimationFrame(value29);
    }
    let value28: ReturnType<typeof setTimeout> = setTimeout(
      () => value17("cancel"),
      DialogDialogDelayMs,
    );
    return () => clearTimeout(value28);
  }, [disabled2, value11, value17, open]);
  let value18 = (0, reactDialogDialog.useRef)(open);
  (0, useIsomorphicLayoutEffect)(() => {
    value18.current = open;
  }, [open]);
  let value19 = useDialogOpenAutofocus(
      value11 === "confirm"
        ? value8
        : value11 === "cancel"
          ? value7
          : value10,
      value11 !== "pending",
      value10,
      value18,
      value15,
      value14,
    ),
    value20 = (0, reactDialogDialog.useCallback)(
      (event: React.KeyboardEvent<HTMLButtonElement>): void => {
        event.repeat &&
          (event.key === "Enter" || event.key === " ") &&
          event.preventDefault();
      },
      [],
    ),
    value21 = (0, reactDialogDialog.useRef)(false);
  (0, reactDialogDialog.useEffect)(() => {
    open && (value21.current = false);
  }, [open]);
  let value22 = (0, useOverlayRoot)(),
    value23 = (0, reactDialogDialog.useCallback)(() => {
      if (value5 || disabled2 || !open || value21.current) return;
      closeOnConfirm ? (value21.current = true) : value6(true);
      let value28: Promise<void>;
      try {
        value28 = Promise.resolve(onConfirm());
      } catch (value29) {
        value28 = Promise.reject(value29);
      }
      closeOnConfirm &&
        onOpenChange(false, {
          reason: "confirm",
        });
      value28.finally(() => {
        closeOnConfirm || value6(false);
      });
    }, [value5, closeOnConfirm, disabled2, onConfirm, onOpenChange, open]),
    value24 = (0, reactDialogDialog.useCallback)(
      (input: boolean): void => {
        value5 ||
          !open ||
          onOpenChange(input, {
            reason: "dismiss",
          });
      },
      [value5, onOpenChange, open],
    ),
    value25 = (0, useDefaultLayer)("modal");
  useDialogPresence(portalClassName);
  let value26 = (0, reactDialogDialog.useRef)<OverlayActions | null>(null),
    value27 = (
      <Button
        ref={value8}
        variant={confirmVariant}
        busy={value5}
        disabled={disabled2}
        data-initial-focus={value11 === "confirm" ? "" : undefined}
        onClick={value23}
        onKeyDown={value20}
      >
        {value3}
      </Button>
    );
  return (
    <ActivityBoundary actionsRef={value26}>
      <npm_AlertDialog_Dh.Root
        open={open}
        onOpenChange={value24}
        actionsRef={value26}
      >
        <npm_AlertDialog_Dh.Portal container={value22}>
          <PopupSurface
            className={(0, cn)("relative", portalClassName)}
            style={value25.style}
            surface={surfaceBackgroundTokens.popover}
            closeOnActivityHide={true}
          >
            <LayerBaseContext.Provider value={value25.base}>
              <npm_AlertDialog_Dh.Backdrop
                forceRender={true}
                onMouseDown={preventDialogMouseSelection}
                className={(0, npm_clsx_Ea)(
                  DialogDialogClassNames_3,
                  StartingOpacity0Value,
                )}
              />
              <WindowDragStrip />
              <ConfirmationDialogPopupInner
                data-cds={"ConfirmationDialog"}
                ref={value10}
                onKeyDownCapture={value16}
                onPointerDownCapture={value16}
                initialFocus={value19}
                finalFocus={value9}
                className={(0, cn)(
                  "draggable-none",
                  DialogDialogClassNames_4,
                  DialogDialogCss_2,
                  dialogBackdropClasses,
                  DataNestedDialogOpenBlur2pxValue,
                  DialogDialogSmMdLgConfig[size],
                  className,
                )}
              >
                <div className={DialogDialogClassNames_2}>
                  <npm_AlertDialog_Dh.Title
                    className={(0, npm_clsx_Ea)(
                      Mt05Value,
                      DialogDialogClassNames_5,
                      "text-primary",
                    )}
                  >
                    {title}
                  </npm_AlertDialog_Dh.Title>
                  {description && (<npm_AlertDialog_Dh.Description
                      className={DialogDialogClassNames_7}
                    >
                      {description}
                    </npm_AlertDialog_Dh.Description>)}
                  {children}
                  <DialogFooter>
                    <npm_AlertDialog_Dh.Close
                      render={
                        <Button
                          ref={value7}
                          variant={"secondary"}
                          disabled={value5}
                          data-initial-focus={
                            value11 === "cancel" ? "" : undefined
                          }
                        >
                          {value4}
                        </Button>
                      }
                    />
                    {confirmDisabledReason === undefined ? (value27) : (<DeferredDisabledReasonTooltip
                        reason={disabled2 ? confirmDisabledReason : undefined}
                        wrapperClassName={"flex-col"}
                      >
                        {value27}
                      </DeferredDisabledReasonTooltip>)}
                  </DialogFooter>
                </div>
              </ConfirmationDialogPopupInner>
            </LayerBaseContext.Provider>
          </PopupSurface>
        </npm_AlertDialog_Dh.Portal>
      </npm_AlertDialog_Dh.Root>
    </ActivityBoundary>
  );
}
export {
  AlertDialogRoot,
  ConfirmationDialog,
  ConfirmationDialogPopupInner,
  DataNestedDialogOpenBlur2pxValue,
  dialogBackdropClasses,
  DialogCloseButton,
  DialogDescription,
  DialogDialogClassNames,
  DialogDialogClassNames_2,
  DialogDialogClassNames_3,
  DialogDialogClassNames_4,
  DialogDialogClassNames_5,
  DialogDialogClassNames_6,
  DialogDialogClassNames_7,
  DialogDialogContext,
  DialogDialogContext_2,
  DialogDialogContext_3,
  DialogDialogContext_4,
  DialogDialogCss,
  DialogDialogCss_2,
  DialogDialogCurrentState,
  DialogDialogDelayMs,
  DialogDialogHeightWebkitAppRegionConfig,
  DialogDialogLabel,
  DialogDialogLabel_2,
  DialogDialogPattern,
  DialogDialogRootTriggerPopupConfig,
  DialogDialogRootTriggerPopupConfig_2,
  DialogDialogSmMdLgConfig,
  DialogDialogStartCenterEndConfig,
  DialogFooter,
  DialogHeader,
  DialogPopup,
  DialogPopupInner,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
  initializeDialogDialog,
  jsxDialogDialog,
  Mt05Value,
  Mt1Value,
  reactDialogDialog,
  StartingOpacity0Value,
  useDialogOpenAutofocus,
  useDialogPresence,
  WindowDragStrip,
};
export function set_DialogDialogCurrentState(value: any): any {
  DialogDialogCurrentState = value;
  return value;
}
export function installCdsDialogDialog(): () => void {
  return () => {
    initializeDialogDialog = (0, initializeOnce)(() => {
      "use client";

      (0, initializeHooksLayoutEffect)();
      (0, initializeClassNames)();
      (0, initializeSheetsStyles_2)();
      (0, initializeCdsRoot)();
      (0, initializeHooksStableCallback)();
      (0, initializeOverlaysLayers)();
      (0, initializeOverlayAttributes)();
      (0, initializeDomRefComposition_3)();
      (0, initializeDomRefComposition)();
      (0, initializePlatformRootFontSize_2)();
      (0, initializeTooltipDeferredProvider)();
      (0, initializeButtonButton)();
      (0, initializeThemeSurfaces)();
      (0, initializeOverlaysImperativeHandle)();
      (0, initializeSheetsScrollArea_6)();
      (0, initializeComponentsTextLink_2)();
      reactDialogDialog = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      (0, initializeNpm_clsx_xh)();
      jsxDialogDialog = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
      (0, initializeNpm__base_ui_react_sYe)();
      (0, initializeNpm__base_ui_react_uYe)();
      DialogDialogCss = `${(0, popupSurfaceClassName)("popover")} shadow-panel-lg`;
      DialogDialogClassNames =
        "max-h-[calc(100dvh_-_max(2rem,2*var(--desktop-titlebar-inset,0px))_-_2*max(env(safe-area-inset-top,0px),env(safe-area-inset-bottom,0px)))]";
      DialogDialogCss_2 = `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[calc(100vw-2rem)] ${DialogDialogClassNames} ${DialogDialogCss} cds-reset text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
      DialogDialogClassNames_2 =
        "isolate flex min-h-0 flex-1 flex-col overflow-y-auto scroll-fade-y rounded-[inherit] p-xl";
      dialogBackdropClasses =
        "transition-[opacity,scale,filter] duration-base ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98] starting:opacity-0 starting:scale-[0.98] motion-reduce:data-[starting-style]:scale-100 data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98]";
      DialogDialogClassNames_3 =
        "draggable-none fixed inset-0 bg-backdrop backdrop-blur-[2px] transition-opacity duration-base ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 has-[~[data-nested]]:bg-transparent has-[~[data-nested]]:backdrop-blur-none";
      StartingOpacity0Value = "starting:opacity-0";
      DialogDialogCurrentState = null;
      DialogDialogHeightWebkitAppRegionConfig = {
        height: "var(--desktop-titlebar-inset, 0px)",
        WebkitAppRegion: "drag",
      };
      DialogDialogClassNames_4 =
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:z-50 after:transition-opacity after:duration-base after:ease-out data-[nested-dialog-open]:after:opacity-100";
      DataNestedDialogOpenBlur2pxValue = "data-[nested-dialog-open]:blur-[2px]";
      DialogDialogSmMdLgConfig = {
        sm: "max-w-[400px]",
        md: "max-w-[520px]",
        lg: "max-w-[720px]",
        xl: "max-w-[880px]",
        "2xl": "max-w-[1024px]",
        "3xl": "max-w-[1152px]",
      };
      DialogDialogPattern = /(^|\s)!?-?z-/;
      DialogDialogContext = (0, reactDialogDialog.createContext)<
        boolean | "trap-focus" | undefined
      >(undefined);
      DialogDialogContext_2 = (0, reactDialogDialog.createContext)(false);
      DialogDialogClassNames_5 = "text-heading font-medium";
      DialogDialogClassNames_6 = "text-title font-semibold";
      Mt05Value = "-mt-0.5";
      Mt1Value = "-mt-1";
      DialogDialogClassNames_7 = "mt-1 text-body font-normal text-secondary";
      DialogDialogContext_3 = (0, reactDialogDialog.createContext)<
        React.RefObject<HTMLButtonElement | null> | undefined
      >(undefined);
      DialogDialogContext_4 = (0, reactDialogDialog.createContext)(false);
      DialogTrigger = (0, reactDialogDialog.forwardRef)<
        HTMLButtonElement,
        import("@base-ui/react/dialog").Dialog.Trigger.Props<void>
      >(
        (
          input: import("@base-ui/react/dialog").Dialog.Trigger.Props<void>,
          options: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let value = (0, reactDialogDialog.useContext)(DialogDialogContext_3),
            value2 = input.handle ? null : (value ?? null),
            value3 = (0, useMergedRefs)(options, value2);
          return <npm_Dialog_Xg.Trigger ref={value3} {...input} />;
        },
      );
      DialogTrigger.displayName = "Dialog.Trigger";
      DialogDialogDelayMs = 250;
      DialogDialogLabel = '[aria-hidden="true"], [inert]';
      DialogPopupInner = (0, reactDialogDialog.forwardRef)<
        HTMLDivElement,
        DialogPopupInnerProps
      >(
        (
          {
            finalFocus: finalFocus,
            fitVisualViewport: fitVisualViewport,
            children: children,
            ...props
          }: DialogPopupInnerProps,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = (0, reactDialogDialog.useContext)(DialogDialogContext),
            value2 = (0, reactDialogDialog.useContext)(DialogDialogContext_3),
            { finalFocus: value3, popupRef: value4 } = (0,
            useFinalFocus)(true, value !== false, value2),
            value5 = (0, useDialogKeyboardViewport)(fitVisualViewport),
            value6 = (0, useMergedRefs)(options, value4, value5);
          return (
            <npm_Dialog_Xg.Popup
              {...{
                [overlayAttribute]: "",
              }}
              ref={value6}
              finalFocus={finalFocus ?? value3}
              aria-modal={value === false ? "false" : undefined}
              {...props}
            >
              {children}
            </npm_Dialog_Xg.Popup>
          );
        },
      );
      DialogPopupInner.displayName = "Dialog.PopupInner";
      ConfirmationDialogPopupInner = (0, reactDialogDialog.forwardRef)<
        HTMLDivElement,
        import("@base-ui/react/alert-dialog").AlertDialog.Popup.Props
      >(
        (
          {
            children: children,
            ...props
          }: import("@base-ui/react/alert-dialog").AlertDialog.Popup.Props,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = (0, useDialogKeyboardViewport)(true),
            value2 = (0, useMergedRefs)(options, value);
          return (
            <npm_AlertDialog_Dh.Popup
              {...{
                [overlayAttribute]: "",
              }}
              ref={value2}
              {...props}
            >
              {children}
            </npm_AlertDialog_Dh.Popup>
          );
        },
      );
      ConfirmationDialogPopupInner.displayName =
        "ConfirmationDialog.PopupInner";
      DialogPopup = (0, reactDialogDialog.forwardRef)<
        HTMLDivElement,
        DialogPopupProps
      >(
        (
          {
            size = "md",
            fullHeight = false,
            unstyled = false,
            surface: surface,
            backdropClassName: backdropClassName,
            backdropStyle: backdropStyle,
            portalClassName: portalClassName,
            className: className,
            children: children,
            ...props
          }: DialogPopupProps,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = unstyled
              ? ""
              : `${DialogDialogCss_2} ${dialogBackdropClasses} ${DataNestedDialogOpenBlur2pxValue} ${DialogDialogSmMdLgConfig[size]} ${fullHeight ? "h-dvh" : ""}`,
            value2 = (0, useDefaultLayer)("modal");
          useDialogPresence(portalClassName);
          let value3 = (0, reactDialogDialog.useContext)(DialogDialogContext),
            value4 = (0, reactDialogDialog.useContext)(DialogDialogContext_4),
            value5 = value3 === undefined || value3 === true;
          return (
            <npm_Dialog_Xg.Portal
              container={(0, useOverlayRoot)()}
            >
              <PopupSurface
                className={(0, cn)("relative", portalClassName)}
                style={value2.style}
                surface={
                  surface ??
                  (unstyled
                    ? undefined
                    : surfaceBackgroundTokens.popover)
                }
                closeOnActivityHide={true}
              >
                <LayerBaseContext.Provider value={value2.base}>
                  <npm_Dialog_Xg.Backdrop
                    forceRender={value5}
                    onMouseDown={
                      value4
                        ? preserveDialogFocus
                        : preventDialogMouseSelection
                    }
                    className={(0, cn)(
                      DialogDialogClassNames_3,
                      !unstyled && StartingOpacity0Value,
                      value3 === false && "pointer-events-none opacity-0",
                      backdropClassName,
                    )}
                    style={backdropStyle}
                  />
                  <WindowDragStrip />
                  <DialogPopupInner
                    data-cds={"Dialog"}
                    ref={options}
                    {...props}
                    fitVisualViewport={!unstyled}
                    className={(0, cn)(
                      "draggable-none",
                      DialogDialogClassNames_4,
                      value,
                      className,
                    )}
                  >
                    {unstyled ? (children) : (<div className={DialogDialogClassNames_2}>{children}</div>)}
                  </DialogPopupInner>
                </LayerBaseContext.Provider>
              </PopupSurface>
            </npm_Dialog_Xg.Portal>
          );
        },
      );
      DialogPopup.displayName = "Dialog.Popup";
      DialogTitle = (0, reactDialogDialog.forwardRef)<
        HTMLHeadingElement,
        DialogTitleProps
      >(
        (
          { className: className, ...props }: DialogTitleProps,
          options: React.ForwardedRef<HTMLHeadingElement>,
        ): React.ReactElement => {
          let value = (0, reactDialogDialog.useContext)(DialogDialogContext_2);
          return (
            <npm_Dialog_Xg.Title
              ref={options}
              {...props}
              className={(0, cn)(
                "text-primary",
                value ? DialogDialogClassNames_5 : DialogDialogClassNames_6,
                className,
              )}
            />
          );
        },
      );
      DialogTitle.displayName = "Dialog.Title";
      DialogDialogLabel_2 = "-me-pad-sm -mt-pad-sm";
      (
        DialogCloseButton as React.FC<{
          "aria-label"?: string;
          className?: string;
          flush?: boolean;
        }>
      ).displayName = "Dialog.CloseButton";
      (DialogHeader as React.FC<DialogHeaderProps>).displayName =
        "Dialog.Header";
      DialogDescription = (0, reactDialogDialog.forwardRef)<
        HTMLParagraphElement,
        DialogDescriptionProps
      >(
        (
          { className: className, ...props }: DialogDescriptionProps,
          options: React.ForwardedRef<HTMLParagraphElement>,
        ): React.ReactElement => (
          <npm_Dialog_Xg.Description
            ref={options}
            {...props}
            className={(0, cn)(DialogDialogClassNames_7, className)}
          />
        ),
      );
      DialogDescription.displayName = "Dialog.Description";
      DialogDialogStartCenterEndConfig = {
        start: "sm:justify-start",
        center: "sm:justify-center",
        end: "sm:justify-end",
        between: "sm:justify-between",
      };
      (DialogFooter as React.FC<DialogFooterProps>).displayName =
        "Dialog.Footer";
      (DialogRoot as React.FC<DialogRootProps>).displayName = "Dialog.Root";
      DialogDialogRootTriggerPopupConfig = {
        Root: DialogRoot,
        Trigger: DialogTrigger,
        Popup: DialogPopup,
        Backdrop: npm_Dialog_Xg.Backdrop,
        Header: DialogHeader,
        Title: DialogTitle,
        Description: DialogDescription,
        Footer: DialogFooter,
        Close: npm_Dialog_Xg.Close,
        CloseButton: DialogCloseButton,
      };
      (AlertDialogRoot as React.FC<AlertDialogRootProps>).displayName =
        "AlertDialog.Root";
      DialogDialogRootTriggerPopupConfig_2 = {
        Root: AlertDialogRoot,
        Trigger: npm_AlertDialog_Dh.Trigger,
        Popup: DialogPopup,
        Backdrop: npm_AlertDialog_Dh.Backdrop,
        Header: DialogHeader,
        Title: DialogTitle,
        Description: DialogDescription,
        Footer: DialogFooter,
        Close: npm_AlertDialog_Dh.Close,
        CloseButton: DialogCloseButton,
        createHandle: npm_AlertDialog_Dh.createHandle,
      };
    });
  };
}
