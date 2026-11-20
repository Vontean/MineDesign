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
import { reactDialog, useDialogVisualKeyboard } from "./tooltips";

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
  let bridgeAbortController = new (ownerDocument.defaultView?.AbortController ??
    AbortController)();
  claudeActivityBridge = bridgeAbortController;
  let { signal: signal } = bridgeAbortController;
  signal.addEventListener(
    "abort",
    () => {
      if (claudeActivityBridge === bridgeAbortController) {
        claudeActivityBridge = null;
      }
    },
    {
      once: true,
    },
  );
  ownerDocument.addEventListener("mousedown", () => bridgeAbortController.abort(), {
    capture: true,
    once: true,
    signal: signal,
  });
  ownerDocument.addEventListener(
    "mouseup",
    (mouseEvent: MouseEvent) => {
      bridgeAbortController.abort();
      if (
        mouseEvent.target !== currentTarget &&
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
      signal: signal,
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
function useDialogStyleDebug(className?: string): void {
  reactDialog.useEffect(() => {
    return;
  }, [className]);
}
function useDialogInitialFocus(
  popupRef: React.RefObject<HTMLElement | null>,
  focusVisible: boolean,
  protectedFocusRef: React.RefObject<HTMLElement | null>,
  openRef: React.RefObject<boolean>,
  hadUserInteractionRef: React.RefObject<boolean>,
  getFocusTarget: () => HTMLElement | null,
): () => HTMLElement | null {
  let ref = reactDialog.useRef<(() => void) | null>(null);
  reactDialog.useEffect(() => () => ref.current?.(), []);
  return reactDialog.useCallback(() => {
    let current = popupRef.current,
      ownerDocument = current?.ownerDocument,
      ownerWindow: BrowserWindow | null | undefined = ownerDocument?.defaultView;
    if (current && ownerDocument && ownerWindow) {
      ownerWindow.requestAnimationFrame(() => {
        if (!openRef.current || !current.isConnected) {
          return;
        }
        let protectedFocus = protectedFocusRef.current,
          activeElement = ownerDocument.activeElement;
        if (
          protectedFocus &&
          activeElement &&
          activeElement !== current &&
          protectedFocus.contains(activeElement)
        ) {
          return;
        }
        current.focus({
          preventScroll: true,
          focusVisible: focusVisible,
        } as FocusOptionsWithVisibility);
      });
      let index = 0,
        flag = false,
        callback = (event: FocusEvent) => {
          let protectedFocus = protectedFocusRef.current,
            target = event.target;
          if (
            flag ||
            !openRef.current ||
            hadUserInteractionRef.current ||
            index >= 3 ||
            !protectedFocus ||
            !(target instanceof ownerWindow.Element) ||
            protectedFocus.contains(target)
          ) {
            return;
          }
          if (!target.closest(DIALOG_HIDDEN_SELECTOR)) {
            flag = true;
            return;
          }
          index += 1;
          ownerWindow.requestAnimationFrame(() => {
            let focusTarget = getFocusTarget();
            if (
              !openRef.current ||
              hadUserInteractionRef.current ||
              !focusTarget?.isConnected ||
              (focusTarget instanceof ownerWindow.HTMLButtonElement && focusTarget.disabled)
            ) {
              return;
            }
            focusTarget.focus({
              preventScroll: true,
              focusVisible: focusTarget !== protectedFocusRef.current,
            } as FocusOptionsWithVisibility);
          });
        };
      ref.current?.();
      ownerDocument.addEventListener("focusin", callback, true);
      let cleanupTimeout = ownerWindow.setTimeout(() => ref.current?.(), 1000);
      ref.current = () => {
        ownerWindow.clearTimeout(cleanupTimeout);
        ownerDocument.removeEventListener("focusin", callback, true);
        ref.current = null;
      };
    }
    return current;
  }, [popupRef, focusVisible, protectedFocusRef, openRef, hadUserInteractionRef, getFocusTarget]);
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
  let value = reactDialog.useContext(
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
  let ref = reactDialog.useRef<HTMLButtonElement | null>(
      null,
    ),
    dialogActionsRef = reactDialog.useRef<OverlayActions | null>(null);
  useForwardedOverlayActions(dialogActionsRef, actionsRef);
  let value =
    disablePointerDismissal ?? (dismissible === false ? true : undefined);
  return (
    <confirmationDialogContext.Provider value={false}>
      <dialogStateContext.Provider value={props.modal}>
        <dialogTriggerRefContext.Provider value={ref}>
          <dialogInitialFocusContext.Provider value={!value}>
            <CloseOnActivityHideProvider actionsRef={dialogActionsRef}>
              <baseAlertDialog.Root
                disablePointerDismissal={value}
                actionsRef={dialogActionsRef}
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
  let ref = reactDialog.useRef<OverlayActions | null>(null);
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
    defaultCancelLabel = useTranslation("cancel", "Cancel"),
    resolvedConfirmLabel = confirmLabel ?? value,
    resolvedCancelLabel = cancelLabel ?? defaultCancelLabel,
    [isConfirming, setIsConfirming] = reactDialog.useState(false),
    ref = reactDialog.useRef<HTMLButtonElement | null>(null),
    confirmButtonRef = reactDialog.useRef<HTMLButtonElement | null>(null),
    { finalFocus: finalFocus, popupRef: popupRef } = useOverlayFinalFocus(open),
    callback = (): ConfirmationFocus =>
      initialFocus === "cancel" ? "cancel" : disabled ? "pending" : "confirm",
    [focusPreference, setFocusPreference] = reactDialog.useState(callback),
    focusPreferenceRef = reactDialog.useRef(focusPreference);
  useIsomorphicLayoutEffect(() => {
    focusPreferenceRef.current = focusPreference;
  }, [focusPreference]);
  let getFocusTarget = reactDialog.useCallback(() => {
      switch (focusPreferenceRef.current) {
        case "confirm":
          return confirmButtonRef.current;
        case "cancel":
          return ref.current;
        default:
          return popupRef.current;
      }
    }, [popupRef]),
    hadUserInteractionRef = reactDialog.useRef(false),
    recordInteraction = reactDialog.useCallback(() => {
      hadUserInteractionRef.current = true;
    }, []);
  useIsomorphicLayoutEffect(() => {
    if (open) {
      hadUserInteractionRef.current = false;
      setFocusPreference(callback());
    }
  }, [open]);
  let updateFocus = reactDialog.useCallback(
    (nextFocus: ConfirmationFocus): void => {
      setFocusPreference(nextFocus);
      let focusButton = nextFocus === "confirm" ? confirmButtonRef.current : ref.current,
        current = popupRef.current;
      if (!focusButton || !current) {
        return;
      }
      let activeElement = focusButton.ownerDocument.activeElement,
        focusIsUnassigned =
          !activeElement ||
          activeElement === current ||
          activeElement === focusButton.ownerDocument.body ||
          (!current.contains(activeElement) &&
            activeElement.closest(DIALOG_HIDDEN_SELECTOR) !== null),
        focusOnAction =
          activeElement === ref.current || activeElement === confirmButtonRef.current;
      if (focusIsUnassigned || (focusOnAction && !hadUserInteractionRef.current)) {
        focusButton.focus({
          preventScroll: true,
          focusVisible: true,
        } as FocusOptionsWithVisibility);
      }
    },
    [popupRef],
  );
  reactDialog.useEffect(() => {
    if (!open || focusPreference !== "pending") {
      return;
    }
    if (!disabled) {
      let confirmationFocusFrame = requestAnimationFrame(() => updateFocus("confirm"));
      return () => cancelAnimationFrame(confirmationFocusFrame);
    }
    let cancelFocusTimeout = setTimeout(
      () => updateFocus("cancel"),
      DIALOG_AUTOFILL_WAIT_MS,
    );
    return () => clearTimeout(cancelFocusTimeout);
  }, [disabled, focusPreference, updateFocus, open]);
  let openRef = reactDialog.useRef(open);
  useIsomorphicLayoutEffect(() => {
    openRef.current = open;
  }, [open]);
  let dialogInitialFocus = useDialogInitialFocus(
      focusPreference === "confirm" ? confirmButtonRef : focusPreference === "cancel" ? ref : popupRef,
      focusPreference !== "pending",
      popupRef,
      openRef,
      hadUserInteractionRef,
      getFocusTarget,
    ),
    handleConfirmKeyDown = reactDialog.useCallback(
      (event: React.KeyboardEvent<HTMLButtonElement>): void => {
        if (event.repeat && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
        }
      },
      [],
    ),
    confirmStartedRef = reactDialog.useRef(false);
  reactDialog.useEffect(() => {
    if (open) {
      confirmStartedRef.current = false;
    }
  }, [open]);
  let portalContainer = usePortalContainer(),
    handleConfirm = reactDialog.useCallback(() => {
      if (isConfirming || disabled || !open || confirmStartedRef.current) {
        return;
      }
      if (closeOnConfirm) {
        confirmStartedRef.current = true;
      } else {
        setIsConfirming(true);
      }
      let confirmation: Promise<void>;
      try {
        confirmation = Promise.resolve(onConfirm());
      } catch (error: unknown) {
        confirmation = Promise.reject(error);
      }
      if (closeOnConfirm) {
        onOpenChange(false, {
          reason: "confirm",
        });
      }
      confirmation.finally(() => {
        if (!closeOnConfirm) {
          setIsConfirming(false);
        }
      });
    }, [isConfirming, closeOnConfirm, disabled, onConfirm, onOpenChange, open]),
    handleOpenChange = reactDialog.useCallback(
      (nextOpen: boolean): void => {
        if (isConfirming || !open) {
          return;
        }
        onOpenChange(nextOpen, {
          reason: "dismiss",
        });
      },
      [isConfirming, onOpenChange, open],
    ),
    overlayLayer = useDefaultOverlayLayer("modal");
  useDialogStyleDebug(portalClassName);
  let dialogActionsRef = reactDialog.useRef<OverlayActions | null>(null),
    closeButton = (
      <Button
        ref={confirmButtonRef}
        variant={confirmVariant}
        busy={isConfirming}
        disabled={disabled}
        disabledReason={confirmDisabledReason}
        data-initial-focus={focusPreference === "confirm" ? "" : undefined}
        onClick={handleConfirm}
        onKeyDown={handleConfirmKeyDown}
      >
        {resolvedConfirmLabel}
      </Button>
    );
  return (
    <CloseOnActivityHideProvider actionsRef={dialogActionsRef}>
      <baseDialog.Root
        open={open}
        onOpenChange={handleOpenChange}
        actionsRef={dialogActionsRef}
      >
        <baseDialog.Portal container={(portalContainer) as import("../contracts/overlays").BaseUIPortalContainer}>
          <PortalRoot
            className={cn("relative", portalClassName)}
            style={overlayLayer.style}
            surface={elevationSurfaceNames.popover}
            closeOnActivityHide={true}
          >
            <layerBaseContext.Provider value={overlayLayer.base}>
              {[<baseDialog.Backdrop
                  forceRender={true}
                  onMouseDown={preventDialogBackdropDefault}
                  className={clsx(
                    dialogBackdropClasses,
                    dialogStartingOpacityClass,
                  )}
                />, <DesktopWindowDragStrip />, <ConfirmationDialogPopupInner
                  data-cds={"ConfirmationDialog"}
                  ref={popupRef as React.Ref<HTMLDivElement>}
                  onKeyDownCapture={recordInteraction}
                  onPointerDownCapture={recordInteraction}
                  initialFocus={dialogInitialFocus}
                  finalFocus={finalFocus as import("../contracts/overlays").BaseUIPopupFocus}
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
                                disabled={isConfirming}
                                data-initial-focus={
                                  focusPreference === "cancel" ? "" : undefined
                                }
                              >
                                {resolvedCancelLabel}
                              </Button>
                            }
                          />, closeButton]}
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
    dialogStateContext = reactDialog.createContext<
      boolean | "trap-focus" | undefined
    >(undefined);
    confirmationDialogContext =
      reactDialog.createContext(false);
    dialogTitleClasses = "text-heading font-medium break-words";
    largeDialogTitleClasses = "text-title font-semibold break-words";
    dialogDescriptionSmallSpacing = "-mt-0.5";
    dialogDescriptionLargeSpacing = "-mt-1";
    dialogDescriptionClasses =
      "mt-1 text-body font-normal text-secondary break-words";
    dialogTriggerRefContext = reactDialog.createContext<
      React.RefObject<HTMLButtonElement | null> | undefined
    >(undefined);
    dialogInitialFocusContext =
      reactDialog.createContext(false);
    DialogTrigger = reactDialog.forwardRef(
      (
        triggerProps: import("@base-ui/react/dialog").Dialog.Trigger.Props<void>,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement => {
        let value = reactDialog.useContext(
            dialogTriggerRefContext,
          ),
          triggerRef = triggerProps.handle ? null : (value ?? null),
          mergedRef = useMergedRefs(forwardedRef, triggerRef);
        return <baseAlertDialog.Trigger ref={mergedRef} {...(triggerProps as import("@base-ui/react/alert-dialog").AlertDialog.Trigger.Props<void>)} />;
      },
    );
    DialogTrigger.displayName = "Dialog.Trigger";
    DIALOG_AUTOFILL_WAIT_MS = 250;
    DIALOG_HIDDEN_SELECTOR = '[aria-hidden="true"], [inert]';
    DialogPopupInner = reactDialog.forwardRef(
      (
        {
          finalFocus: finalFocus,
          fitVisualViewport: fitVisualViewport,
          children: children,
          ...props
        }: DialogPopupInnerProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = reactDialog.useContext(dialogStateContext),
          triggerRef = reactDialog.useContext(
            dialogTriggerRefContext,
          ),
          { finalFocus: returnFocus, popupRef: popupRef } = useOverlayFinalFocus(true, value !== false, triggerRef),
          keyboardRef = useDialogVisualKeyboard(fitVisualViewport),
          mergedRef = useMergedRefs(forwardedRef, popupRef, keyboardRef);
        return (
          <baseAlertDialog.Popup
            {...{
              [OVERLAY_ATTRIBUTE]: "",
            }}
            ref={mergedRef}
            finalFocus={(finalFocus ?? returnFocus) as import("../contracts/overlays").BaseUIPopupFocus}
            aria-modal={value === false ? "false" : undefined}
            {...props}
          >
            {children}
          </baseAlertDialog.Popup>
        );
      },
    );
    DialogPopupInner.displayName = "Dialog.PopupInner";
    ConfirmationDialogPopupInner = reactDialog.forwardRef(
      (
        {
          children: children,
          ...props
        }: import("@base-ui/react/alert-dialog").AlertDialog.Popup.Props,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = useDialogVisualKeyboard(true),
          mergedRef = useMergedRefs(forwardedRef, value);
        return (
          <baseDialog.Popup
            {...{
              [OVERLAY_ATTRIBUTE]: "",
            }}
            ref={mergedRef}
            {...props}
          >
            {children}
          </baseDialog.Popup>
        );
      },
    );
    ConfirmationDialogPopupInner.displayName = "ConfirmationDialog.PopupInner";
    DialogPopup = reactDialog.forwardRef(
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
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = unstyled
            ? ""
            : `${dialogFullHeightClasses} ${dialogPopupTransitionClasses} ${nestedDialogBlurClasses} ${dialogSizeClasses[size]} ${fullHeight ? "h-dvh" : ""}`,
          overlayLayer = useDefaultOverlayLayer("modal");
        useDialogStyleDebug(portalClassName);
        let isOpen = reactDialog.useContext(dialogStateContext),
          keepBackdropBehind = reactDialog.useContext(
            dialogInitialFocusContext,
          ),
          shouldRenderBackdrop = isOpen === undefined || isOpen === true;
        return (
          <baseAlertDialog.Portal
            container={(usePortalContainer()) as import("../contracts/overlays").BaseUIPortalContainer}
          >
            <PortalRoot
              className={cn("relative", portalClassName)}
              style={overlayLayer.style}
              surface={
                surface ??
                (unstyled ? undefined : elevationSurfaceNames.popover)
              }
              closeOnActivityHide={true}
            >
              <layerBaseContext.Provider value={overlayLayer.base}>
                {[<baseAlertDialog.Backdrop
                    forceRender={shouldRenderBackdrop}
                    onMouseDown={
                      keepBackdropBehind
                        ? preserveDialogBackdropFocus
                        : preventDialogBackdropDefault
                    }
                    className={cn(
                      dialogBackdropClasses,
                      !unstyled && dialogStartingOpacityClass,
                      isOpen === false && "pointer-events-none opacity-0",
                      backdropClassName,
                    )}
                    style={backdropStyle}
                  />, <DesktopWindowDragStrip />, <DialogPopupInner
                    data-cds={"Dialog"}
                    ref={forwardedRef}
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
    DialogTitle = reactDialog.forwardRef(
      (
        { className: className, ...props }: DialogTitleProps,
        forwardedRef: React.ForwardedRef<HTMLHeadingElement>,
      ): React.ReactElement => {
        let value = reactDialog.useContext(
          confirmationDialogContext,
        );
        return (
          <baseAlertDialog.Title
            ref={forwardedRef}
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
    DialogDescription = reactDialog.forwardRef(
      (
        { className: className, ...props }: DialogDescriptionProps,
        forwardedRef: React.ForwardedRef<HTMLParagraphElement>,
      ): React.ReactElement => (
        <baseAlertDialog.Description
          ref={forwardedRef}
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
