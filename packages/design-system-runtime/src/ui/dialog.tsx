import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
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
} from "../contracts/overlays";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { baseAlertDialog, baseDialog, clsx } from "../dependencies";
import { Button } from "./buttons";
import { asElement, useForwardedOverlayActions, useIsomorphicLayoutEffect } from "./foundation";
import { CloseOnActivityHideProvider, cn, elevationSurfaceNames, getSurfaceClasses, layerBaseContext, PortalRoot, useDefaultOverlayLayer, useMergedRefs, useTranslation } from "./interactions";
import { OVERLAY_ATTRIBUTE, useOverlayFinalFocus, usePortalContainer } from "./overlays";
import { reactForUiTooltips2, useDialogVisualKeyboard } from "./tooltips";

var dialogSurfaceClasses: string;
var dialogMaximumHeightClasses: string;
var dialogFullHeightClasses: string;
var dialogPopupPositionClasses: string;
var dialogPopupTransitionClasses: string;
var dialogBackdropClasses: string;
var dialogStartingOpacityClass: string;
var claudeActivityBridge: AbortController | null;
var desktopWindowDragStripStyle: React.CSSProperties & {
  WebkitAppRegion: string;
};
var nestedDialogOverlayClasses: string;
var nestedDialogBlurClasses: string;
var dialogSizeClasses: Record<
  "sm" | "md" | "lg" | "xl" | "2xl" | "3xl",
  string
>;
var dialogZIndexClassPattern: RegExp;
var dialogStateContext: React.Context<boolean | "trap-focus" | undefined>;
var confirmationDialogContext: React.Context<boolean>;
var dialogTitleClasses: string;
var largeDialogTitleClasses: string;
var dialogDescriptionSmallSpacing: string;
var dialogDescriptionLargeSpacing: string;
var dialogDescriptionClasses: string;
var dialogTriggerRefContext: React.Context<
  React.RefObject<HTMLButtonElement | null> | undefined
>;
var dialogInitialFocusContext: React.Context<boolean>;
var DialogTrigger: ForwardComponent<
  HTMLButtonElement,
  import("@base-ui/react/dialog").Dialog.Trigger.Props<void>
>;
var DIALOG_AUTOFILL_WAIT_MS: number;
var DIALOG_HIDDEN_SELECTOR: string;
var DialogPopupInner: ForwardComponent<HTMLDivElement, DialogPopupInnerProps>;
var ConfirmationDialogPopupInner: ForwardComponent<
  HTMLDivElement,
  import("@base-ui/react/alert-dialog").AlertDialog.Popup.Props
>;
var DialogPopup: ForwardComponent<HTMLDivElement, DialogPopupProps>;
var DialogTitle: ForwardComponent<HTMLHeadingElement, DialogTitleProps>;
var dialogCloseButtonOutsetClasses: string;
var DialogDescription: ForwardComponent<
  HTMLParagraphElement,
  DialogDescriptionProps
>;
var dialogFooterAlignmentClasses: Record<
  "start" | "center" | "end" | "between",
  string
>;
var Dialog: {
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
var AlertDialog: {
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
  createHandle: typeof import("@base-ui/react/dialog").Dialog.createHandle;
};
function preventDialogBackdropDefault(
  event: React.MouseEvent<HTMLDivElement>,
): void {
  event.preventDefault();
}
function preserveDialogBackdropFocus(
  event: React.MouseEvent<HTMLDivElement>,
): void {
  if (event.button !== 0) {
    event.preventDefault();
    return;
  }
  let currentTarget = event.currentTarget,
    parentElement = currentTarget.parentElement,
    ownerDocument = currentTarget.ownerDocument,
    value = asElement(ownerDocument.activeElement) as
      | HTMLElement
      | SVGElement
      | null;
  if (
    parentElement === null ||
    value === null ||
    !parentElement.contains(value)
  ) {
    return;
  }
  claudeActivityBridge?.abort();
  let value2 = new (ownerDocument.defaultView?.AbortController ??
    AbortController)();
  claudeActivityBridge = value2;
  let { signal: value3 } = value2;
  value3.addEventListener(
    "abort",
    () => {
      if (claudeActivityBridge === value2) {
        claudeActivityBridge = null;
      }
    },
    {
      once: true,
    },
  );
  ownerDocument.addEventListener("mousedown", () => value2.abort(), {
    capture: true,
    once: true,
    signal: value3,
  });
  ownerDocument.addEventListener(
    "mouseup",
    (event2: MouseEvent) => {
      value2.abort();
      if (
        event2.target !== currentTarget &&
        ownerDocument.activeElement === ownerDocument.body &&
        value.isConnected
      ) {
        value.focus({
          preventScroll: true,
        });
      }
    },
    {
      capture: true,
      once: true,
      signal: value3,
    },
  );
}
function DesktopWindowDragStrip(): React.ReactElement {
  useUiLocale();
  return (
    <div
      aria-hidden={true}
      data-cds-window-drag-strip={""}
      className={"fixed inset-x-0 top-0"}
      style={desktopWindowDragStripStyle}
    />
  );
}
function useDialogStyleDebug(input?: string): void {
  reactForUiTooltips2.useEffect(() => {
    return;
  }, [input]);
}
function useDialogInitialFocus(
  input: React.RefObject<HTMLElement | null>,
  options: boolean,
  context: React.RefObject<HTMLElement | null>,
  value: React.RefObject<boolean>,
  extra: React.RefObject<boolean>,
  detail: () => HTMLElement | null,
): () => HTMLElement | null {
  let ref = reactForUiTooltips2.useRef<(() => void) | null>(null);
  reactForUiTooltips2.useEffect(() => () => ref.current?.(), []);
  return reactForUiTooltips2.useCallback(() => {
    let current = input.current,
      value2 = current?.ownerDocument,
      value3: BrowserWindow | null | undefined = value2?.defaultView;
    if (current && value2 && value3) {
      value3.requestAnimationFrame(() => {
        if (!value.current || !current.isConnected) {
          return;
        }
        let current2 = context.current,
          activeElement = value2.activeElement;
        if (
          current2 &&
          activeElement &&
          activeElement !== current &&
          current2.contains(activeElement)
        ) {
          return;
        }
        current.focus({
          preventScroll: true,
          focusVisible: options,
        } as FocusOptionsWithVisibility);
      });
      let index = 0,
        flag = false,
        callback = (event: FocusEvent) => {
          let current2 = context.current,
            target = event.target;
          if (
            flag ||
            !value.current ||
            extra.current ||
            index >= 3 ||
            !current2 ||
            !(target instanceof value3.Element) ||
            current2.contains(target)
          ) {
            return;
          }
          if (!target.closest(DIALOG_HIDDEN_SELECTOR)) {
            flag = true;
            return;
          }
          index += 1;
          value3.requestAnimationFrame(() => {
            let value5 = detail();
            if (
              !value.current ||
              extra.current ||
              !value5?.isConnected ||
              (value5 instanceof value3.HTMLButtonElement && value5.disabled)
            ) {
              return;
            }
            value5.focus({
              preventScroll: true,
              focusVisible: value5 !== context.current,
            } as FocusOptionsWithVisibility);
          });
        };
      ref.current?.();
      value2.addEventListener("focusin", callback, true);
      let value4 = value3.setTimeout(() => ref.current?.(), 1000);
      ref.current = () => {
        value3.clearTimeout(value4);
        value2.removeEventListener("focusin", callback, true);
        ref.current = null;
      };
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
  let value = useTranslation("close", "Close");
  return (
    <baseAlertDialog.Close
      render={
        <Button
          variant={"ghost"}
          iconOnly={true}
          icon={"X"}
          aria-label={ariaLabel ?? (value)}
          tooltip={false}
          className={cn(
            flush && dialogCloseButtonOutsetClasses,
            className,
          )}
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
  let value = reactForUiTooltips2.useContext(
    confirmationDialogContext,
  );
  return (
    <div
      className={cn(
        "mb-pad-md flex items-start gap-2",
        className,
      )}
    >
      {[<div
          className={clsx(
            value
              ? dialogDescriptionSmallSpacing
              : dialogDescriptionLargeSpacing,
            "flex min-w-0 flex-1 flex-col gap-1",
          )}
        >
          {[<DialogTitle>{children}</DialogTitle>, description && (
              <baseAlertDialog.Description
                className={"text-body font-normal text-secondary break-words"}
              >
                {description}
              </baseAlertDialog.Description>
            )]}
        </div>, actions && <div className={"-mt-pad-sm"}>{actions}</div>, showClose && (
          <DialogCloseButton aria-label={closeLabel} flush={true} />
        )]}
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
      className={cn(
        "mt-pad-lg flex flex-col-reverse gap-2 sm:flex-row",
        "max-sm:[&>[data-cds-disabled-reason-wrapper]]:flex-col",
        dialogFooterAlignmentClasses[align],
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
  let ref = reactForUiTooltips2.useRef<HTMLButtonElement | null>(
      null,
    ),
    ref2 = reactForUiTooltips2.useRef<OverlayActions | null>(null);
  useForwardedOverlayActions(ref2, actionsRef);
  let value =
    disablePointerDismissal ?? (dismissible === false ? true : undefined);
  return (
    <confirmationDialogContext.Provider value={false}>
      <dialogStateContext.Provider value={props.modal}>
        <dialogTriggerRefContext.Provider value={ref}>
          <dialogInitialFocusContext.Provider value={!value}>
            <CloseOnActivityHideProvider actionsRef={ref2}>
              <baseAlertDialog.Root
                disablePointerDismissal={value}
                actionsRef={ref2}
                {...(props as import("@base-ui/react/alert-dialog").AlertDialog.Root.Props<Payload>)}
              />
            </CloseOnActivityHideProvider>
          </dialogInitialFocusContext.Provider>
        </dialogTriggerRefContext.Provider>
      </dialogStateContext.Provider>
    </confirmationDialogContext.Provider>
  );
}
function AlertDialogRoot<Payload = void>({
  actionsRef: actionsRef,
  ...props
}: AlertDialogRootProps<Payload>): React.ReactElement {
  useUiLocale();
  let ref = reactForUiTooltips2.useRef<OverlayActions | null>(null);
  useForwardedOverlayActions(ref, actionsRef);
  return (
    <confirmationDialogContext.Provider value={true}>
      <dialogStateContext.Provider value={true}>
        <dialogInitialFocusContext.Provider value={false}>
          <CloseOnActivityHideProvider actionsRef={ref}>
            <baseDialog.Root {...props} actionsRef={ref} />
          </CloseOnActivityHideProvider>
        </dialogInitialFocusContext.Provider>
      </dialogStateContext.Provider>
    </confirmationDialogContext.Provider>
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
  disabled = false,
  confirmDisabledReason: confirmDisabledReason,
  size = "sm",
  className: className,
  portalClassName: portalClassName,
  onConfirm: onConfirm,
  closeOnConfirm = false,
  children: children,
}: ConfirmationDialogProps): React.ReactElement {
  useUiLocale();
  let value = useTranslation("confirm", "Confirm"),
    value2 = useTranslation("cancel", "Cancel"),
    value3 = confirmLabel ?? value,
    value4 = cancelLabel ?? value2,
    [value5, value6] = reactForUiTooltips2.useState(false),
    ref = reactForUiTooltips2.useRef<HTMLButtonElement | null>(null),
    ref2 = reactForUiTooltips2.useRef<HTMLButtonElement | null>(null),
    { finalFocus: value7, popupRef: value8 } = useOverlayFinalFocus(open),
    callback = (): ConfirmationFocus =>
      initialFocus === "cancel" ? "cancel" : disabled ? "pending" : "confirm",
    [value9, value10] = reactForUiTooltips2.useState(callback),
    ref3 = reactForUiTooltips2.useRef(value9);
  useIsomorphicLayoutEffect(() => {
    ref3.current = value9;
  }, [value9]);
  let callback2 = reactForUiTooltips2.useCallback(() => {
      switch (ref3.current) {
        case "confirm":
          return ref2.current;
        case "cancel":
          return ref.current;
        default:
          return value8.current;
      }
    }, [value8]),
    ref4 = reactForUiTooltips2.useRef(false),
    callback3 = reactForUiTooltips2.useCallback(() => {
      ref4.current = true;
    }, []);
  useIsomorphicLayoutEffect(() => {
    if (open) {
      ref4.current = false;
      value10(callback());
    }
  }, [open]);
  let callback4 = reactForUiTooltips2.useCallback(
    (input: ConfirmationFocus): void => {
      value10(input);
      let value15 = input === "confirm" ? ref2.current : ref.current,
        current = value8.current;
      if (!value15 || !current) {
        return;
      }
      let activeElement = value15.ownerDocument.activeElement,
        value16 =
          !activeElement ||
          activeElement === current ||
          activeElement === value15.ownerDocument.body ||
          (!current.contains(activeElement) &&
            activeElement.closest(DIALOG_HIDDEN_SELECTOR) !== null),
        value17 =
          activeElement === ref.current || activeElement === ref2.current;
      if (value16 || (value17 && !ref4.current)) {
        value15.focus({
          preventScroll: true,
          focusVisible: true,
        } as FocusOptionsWithVisibility);
      }
    },
    [value8],
  );
  reactForUiTooltips2.useEffect(() => {
    if (!open || value9 !== "pending") {
      return;
    }
    if (!disabled) {
      let value16 = requestAnimationFrame(() => callback4("confirm"));
      return () => cancelAnimationFrame(value16);
    }
    let value15 = setTimeout(
      () => callback4("cancel"),
      DIALOG_AUTOFILL_WAIT_MS,
    );
    return () => clearTimeout(value15);
  }, [disabled, value9, callback4, open]);
  let ref5 = reactForUiTooltips2.useRef(open);
  useIsomorphicLayoutEffect(() => {
    ref5.current = open;
  }, [open]);
  let value11 = useDialogInitialFocus(
      value9 === "confirm" ? ref2 : value9 === "cancel" ? ref : value8,
      value9 !== "pending",
      value8,
      ref5,
      ref4,
      callback2,
    ),
    callback5 = reactForUiTooltips2.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>): void => {
        if (event.repeat && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
        }
      },
      [],
    ),
    ref6 = reactForUiTooltips2.useRef(false);
  reactForUiTooltips2.useEffect(() => {
    if (open) {
      ref6.current = false;
    }
  }, [open]);
  let value12 = usePortalContainer(),
    callback6 = reactForUiTooltips2.useCallback(() => {
      if (value5 || disabled || !open || ref6.current) {
        return;
      }
      if (closeOnConfirm) {
        ref6.current = true;
      } else {
        value6(true);
      }
      let value15: Promise<void>;
      try {
        value15 = Promise.resolve(onConfirm());
      } catch (value16: unknown) {
        value15 = Promise.reject(value16);
      }
      if (closeOnConfirm) {
        onOpenChange(false, {
          reason: "confirm",
        });
      }
      value15.finally(() => {
        if (!closeOnConfirm) {
          value6(false);
        }
      });
    }, [value5, closeOnConfirm, disabled, onConfirm, onOpenChange, open]),
    callback7 = reactForUiTooltips2.useCallback(
      (input: boolean): void => {
        if (value5 || !open) {
          return;
        }
        onOpenChange(input, {
          reason: "dismiss",
        });
      },
      [value5, onOpenChange, open],
    ),
    value13 = useDefaultOverlayLayer("modal");
  useDialogStyleDebug(portalClassName);
  let ref7 = reactForUiTooltips2.useRef<OverlayActions | null>(null),
    value14 = (
      <Button
        ref={ref2}
        variant={confirmVariant}
        busy={value5}
        disabled={disabled}
        disabledReason={confirmDisabledReason}
        data-initial-focus={value9 === "confirm" ? "" : undefined}
        onClick={callback6}
        onKeyDown={callback5}
      >
        {value3}
      </Button>
    );
  return (
    <CloseOnActivityHideProvider actionsRef={ref7}>
      <baseDialog.Root
        open={open}
        onOpenChange={callback7}
        actionsRef={ref7}
      >
        <baseDialog.Portal container={(value12) as import("../contracts/overlays").BaseUIPortalContainer}>
          <PortalRoot
            className={cn("relative", portalClassName)}
            style={value13.style}
            surface={elevationSurfaceNames.popover}
            closeOnActivityHide={true}
          >
            <layerBaseContext.Provider value={value13.base}>
              {[<baseDialog.Backdrop
                  forceRender={true}
                  onMouseDown={preventDialogBackdropDefault}
                  className={clsx(
                    dialogBackdropClasses,
                    dialogStartingOpacityClass,
                  )}
                />, <DesktopWindowDragStrip />, <ConfirmationDialogPopupInner
                  data-cds={"ConfirmationDialog"}
                  ref={value8 as React.Ref<HTMLDivElement>}
                  onKeyDownCapture={callback3}
                  onPointerDownCapture={callback3}
                  initialFocus={value11}
                  finalFocus={value7 as import("../contracts/overlays").BaseUIPopupFocus}
                  className={cn(
                    "draggable-none",
                    nestedDialogOverlayClasses,
                    dialogFullHeightClasses,
                    dialogPopupTransitionClasses,
                    nestedDialogBlurClasses,
                    dialogSizeClasses[size],
                    className,
                  )}
                >
                  <div className={dialogPopupPositionClasses}>
                    {[<baseDialog.Title
                        className={clsx(
                          dialogDescriptionSmallSpacing,
                          dialogTitleClasses,
                          "text-primary",
                        )}
                      >
                        {title}
                      </baseDialog.Title>, description && (
                        <baseDialog.Description
                          className={dialogDescriptionClasses}
                        >
                          {description}
                        </baseDialog.Description>
                      ), children, <DialogFooter>
                        {[<baseDialog.Close
                            render={
                              <Button
                                ref={ref}
                                variant={"secondary"}
                                disabled={value5}
                                data-initial-focus={
                                  value9 === "cancel" ? "" : undefined
                                }
                              >
                                {value4}
                              </Button>
                            }
                          />, value14]}
                      </DialogFooter>]}
                  </div>
                </ConfirmationDialogPopupInner>]}
            </layerBaseContext.Provider>
          </PortalRoot>
        </baseDialog.Portal>
      </baseDialog.Root>
    </CloseOnActivityHideProvider>
  );
}
export {
  AlertDialog,
  AlertDialogRoot,
  claudeActivityBridge,
  ConfirmationDialog,
  confirmationDialogContext,
  ConfirmationDialogPopupInner,
  DesktopWindowDragStrip,
  desktopWindowDragStripStyle,
  Dialog,
  DIALOG_AUTOFILL_WAIT_MS,
  DIALOG_HIDDEN_SELECTOR,
  dialogBackdropClasses,
  DialogCloseButton,
  dialogCloseButtonOutsetClasses,
  DialogDescription,
  dialogDescriptionClasses,
  dialogDescriptionLargeSpacing,
  dialogDescriptionSmallSpacing,
  DialogFooter,
  dialogFooterAlignmentClasses,
  dialogFullHeightClasses,
  DialogHeader,
  dialogInitialFocusContext,
  dialogMaximumHeightClasses,
  DialogPopup,
  DialogPopupInner,
  dialogPopupPositionClasses,
  dialogPopupTransitionClasses,
  DialogRoot,
  dialogSizeClasses,
  dialogStartingOpacityClass,
  dialogStateContext,
  dialogSurfaceClasses,
  DialogTitle,
  dialogTitleClasses,
  DialogTrigger,
  dialogTriggerRefContext,
  dialogZIndexClassPattern,
  largeDialogTitleClasses,
  nestedDialogBlurClasses,
  nestedDialogOverlayClasses,
  preserveDialogBackdropFocus,
  preventDialogBackdropDefault,
  useDialogInitialFocus,
  useDialogStyleDebug,
};
export function installUiDialog(): () => void {
  return () => {
    dialogSurfaceClasses = `${getSurfaceClasses("popover")} shadow-panel-lg`;
    dialogMaximumHeightClasses =
      "max-h-[calc(100dvh_-_max(2rem,2*var(--desktop-titlebar-inset,0px))_-_2*max(env(safe-area-inset-top,0px),env(safe-area-inset-bottom,0px)))]";
    dialogFullHeightClasses = `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[calc(100vw-2rem)] ${dialogMaximumHeightClasses} ${dialogSurfaceClasses} cds-reset text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
    dialogPopupPositionClasses =
      "isolate flex min-h-0 flex-1 flex-col overflow-y-auto scroll-fade-y rounded-[inherit] p-xl";
    dialogPopupTransitionClasses =
      "transition-[opacity,scale,filter] duration-base ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98] starting:opacity-0 starting:scale-[0.98] motion-reduce:data-[starting-style]:scale-100 data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98]";
    dialogBackdropClasses =
      "draggable-none fixed inset-0 bg-backdrop transition-opacity duration-base ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 has-[~[data-nested]]:bg-transparent has-[~[data-nested]]:backdrop-blur-none";
    dialogStartingOpacityClass = "starting:opacity-0";
    claudeActivityBridge = null;
    desktopWindowDragStripStyle = {
      height: "var(--desktop-titlebar-inset, 0px)",
      WebkitAppRegion: "drag",
    };
    nestedDialogOverlayClasses =
      "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:z-50 after:transition-opacity after:duration-base after:ease-out data-[nested-dialog-open]:after:opacity-100";
    nestedDialogBlurClasses = "data-[nested-dialog-open]:blur-[2px]";
    dialogSizeClasses = {
      sm: "max-w-[400px]",
      md: "max-w-[520px]",
      lg: "max-w-[720px]",
      xl: "max-w-[880px]",
      "2xl": "max-w-[1024px]",
      "3xl": "max-w-[1152px]",
    };
    dialogZIndexClassPattern = /(^|\s)!?-?z-/;
    dialogStateContext = reactForUiTooltips2.createContext<
      boolean | "trap-focus" | undefined
    >(undefined);
    confirmationDialogContext =
      reactForUiTooltips2.createContext(false);
    dialogTitleClasses = "text-heading font-medium break-words";
    largeDialogTitleClasses = "text-title font-semibold break-words";
    dialogDescriptionSmallSpacing = "-mt-0.5";
    dialogDescriptionLargeSpacing = "-mt-1";
    dialogDescriptionClasses =
      "mt-1 text-body font-normal text-secondary break-words";
    dialogTriggerRefContext = reactForUiTooltips2.createContext<
      React.RefObject<HTMLButtonElement | null> | undefined
    >(undefined);
    dialogInitialFocusContext =
      reactForUiTooltips2.createContext(false);
    DialogTrigger = reactForUiTooltips2.forwardRef(
      (
        input: import("@base-ui/react/dialog").Dialog.Trigger.Props<void>,
        options: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement => {
        let value = reactForUiTooltips2.useContext(
            dialogTriggerRefContext,
          ),
          value2 = input.handle ? null : (value ?? null),
          value3 = useMergedRefs(options, value2);
        return <baseAlertDialog.Trigger ref={value3} {...(input as import("@base-ui/react/alert-dialog").AlertDialog.Trigger.Props<void>)} />;
      },
    );
    DialogTrigger.displayName = "Dialog.Trigger";
    DIALOG_AUTOFILL_WAIT_MS = 250;
    DIALOG_HIDDEN_SELECTOR = '[aria-hidden="true"], [inert]';
    DialogPopupInner = reactForUiTooltips2.forwardRef(
      (
        {
          finalFocus: finalFocus,
          fitVisualViewport: fitVisualViewport,
          children: children,
          ...props
        }: DialogPopupInnerProps,
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = reactForUiTooltips2.useContext(dialogStateContext),
          value2 = reactForUiTooltips2.useContext(
            dialogTriggerRefContext,
          ),
          { finalFocus: value3, popupRef: value4 } = useOverlayFinalFocus(true, value !== false, value2),
          value5 = useDialogVisualKeyboard(fitVisualViewport),
          value6 = useMergedRefs(options, value4, value5);
        return (
          <baseAlertDialog.Popup
            {...{
              [OVERLAY_ATTRIBUTE]: "",
            }}
            ref={value6}
            finalFocus={(finalFocus ?? value3) as import("../contracts/overlays").BaseUIPopupFocus}
            aria-modal={value === false ? "false" : undefined}
            {...props}
          >
            {children}
          </baseAlertDialog.Popup>
        );
      },
    );
    DialogPopupInner.displayName = "Dialog.PopupInner";
    ConfirmationDialogPopupInner = reactForUiTooltips2.forwardRef(
      (
        {
          children: children,
          ...props
        }: import("@base-ui/react/alert-dialog").AlertDialog.Popup.Props,
        options: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = useDialogVisualKeyboard(true),
          value2 = useMergedRefs(options, value);
        return (
          <baseDialog.Popup
            {...{
              [OVERLAY_ATTRIBUTE]: "",
            }}
            ref={value2}
            {...props}
          >
            {children}
          </baseDialog.Popup>
        );
      },
    );
    ConfirmationDialogPopupInner.displayName = "ConfirmationDialog.PopupInner";
    DialogPopup = reactForUiTooltips2.forwardRef(
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
            : `${dialogFullHeightClasses} ${dialogPopupTransitionClasses} ${nestedDialogBlurClasses} ${dialogSizeClasses[size]} ${fullHeight ? "h-dvh" : ""}`,
          value2 = useDefaultOverlayLayer("modal");
        useDialogStyleDebug(portalClassName);
        let value3 = reactForUiTooltips2.useContext(dialogStateContext),
          value4 = reactForUiTooltips2.useContext(
            dialogInitialFocusContext,
          ),
          value5 = value3 === undefined || value3 === true;
        return (
          <baseAlertDialog.Portal
            container={(usePortalContainer()) as import("../contracts/overlays").BaseUIPortalContainer}
          >
            <PortalRoot
              className={cn("relative", portalClassName)}
              style={value2.style}
              surface={
                surface ??
                (unstyled ? undefined : elevationSurfaceNames.popover)
              }
              closeOnActivityHide={true}
            >
              <layerBaseContext.Provider value={value2.base}>
                {[<baseAlertDialog.Backdrop
                    forceRender={value5}
                    onMouseDown={
                      value4
                        ? preserveDialogBackdropFocus
                        : preventDialogBackdropDefault
                    }
                    className={cn(
                      dialogBackdropClasses,
                      !unstyled && dialogStartingOpacityClass,
                      value3 === false && "pointer-events-none opacity-0",
                      backdropClassName,
                    )}
                    style={backdropStyle}
                  />, <DesktopWindowDragStrip />, <DialogPopupInner
                    data-cds={"Dialog"}
                    ref={options}
                    {...props}
                    fitVisualViewport={!unstyled}
                    className={cn(
                      "draggable-none",
                      nestedDialogOverlayClasses,
                      value,
                      className,
                    )}
                  >
                    {unstyled ? (children) : (<div className={dialogPopupPositionClasses}>
                        {children}
                      </div>)}
                  </DialogPopupInner>]}
              </layerBaseContext.Provider>
            </PortalRoot>
          </baseAlertDialog.Portal>
        );
      },
    );
    DialogPopup.displayName = "Dialog.Popup";
    DialogTitle = reactForUiTooltips2.forwardRef(
      (
        { className: className, ...props }: DialogTitleProps,
        options: React.ForwardedRef<HTMLHeadingElement>,
      ): React.ReactElement => {
        let value = reactForUiTooltips2.useContext(
          confirmationDialogContext,
        );
        return (
          <baseAlertDialog.Title
            ref={options}
            {...props}
            className={cn(
              "text-primary",
              value ? dialogTitleClasses : largeDialogTitleClasses,
              className,
            )}
          />
        );
      },
    );
    DialogTitle.displayName = "Dialog.Title";
    dialogCloseButtonOutsetClasses = "-me-pad-sm -mt-pad-sm";
    (
      DialogCloseButton as typeof DialogCloseButton & {
        displayName?: string;
      }
    ).displayName = "Dialog.CloseButton";
    (
      DialogHeader as typeof DialogHeader & {
        displayName?: string;
      }
    ).displayName = "Dialog.Header";
    DialogDescription = reactForUiTooltips2.forwardRef(
      (
        { className: className, ...props }: DialogDescriptionProps,
        options: React.ForwardedRef<HTMLParagraphElement>,
      ): React.ReactElement => (
        <baseAlertDialog.Description
          ref={options}
          {...props}
          className={cn(dialogDescriptionClasses, className)}
        />
      ),
    );
    DialogDescription.displayName = "Dialog.Description";
    dialogFooterAlignmentClasses = {
      start: "sm:justify-start",
      center: "sm:justify-center",
      end: "sm:justify-end",
      between: "sm:justify-between",
    };
    (
      DialogFooter as typeof DialogFooter & {
        displayName?: string;
      }
    ).displayName = "Dialog.Footer";
    (
      DialogRoot as typeof DialogRoot & {
        displayName?: string;
      }
    ).displayName = "Dialog.Root";
    Dialog = {
      Root: DialogRoot,
      Trigger: DialogTrigger,
      Popup: DialogPopup,
      Backdrop: baseAlertDialog.Backdrop,
      Header: DialogHeader,
      Title: DialogTitle,
      Description: DialogDescription,
      Footer: DialogFooter,
      Close: baseAlertDialog.Close,
      CloseButton: DialogCloseButton,
    };
    (
      AlertDialogRoot as typeof AlertDialogRoot & {
        displayName?: string;
      }
    ).displayName = "AlertDialog.Root";
    AlertDialog = {
      Root: AlertDialogRoot,
      Trigger: baseDialog.Trigger,
      Popup: DialogPopup,
      Backdrop: baseDialog.Backdrop,
      Header: DialogHeader,
      Title: DialogTitle,
      Description: DialogDescription,
      Footer: DialogFooter,
      Close: baseDialog.Close,
      CloseButton: DialogCloseButton,
      createHandle: baseDialog.createHandle,
    };
  };
}
