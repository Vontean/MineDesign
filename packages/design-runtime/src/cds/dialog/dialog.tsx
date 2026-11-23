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
import { initializeDialogKeyboardViewport, preserveDialogFocus, preventDialogMouseSelection, useDialogKeyboardViewport } from "../components/text-link";
import { ActivityBoundary, initializeDomRefComposition, initializeActivityVisibilityContext, useMergedRefs } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeHooksStableCallback } from "../hooks/stable-callback";
import { initializeOverlaysImperativeHandle, useOverlayImperativeHandle } from "../overlays/imperative-handle";
import { initializeOverlaysLayers, LayerBaseContext, useDefaultLayer } from "../overlays/layers";
import { initializeRootFontSizeHooks, PopupSurface } from "../platform/root-font-size";
import { initializeOverlayAttributes, initializeFocusHooks, overlayAttribute, useFinalFocus } from "../sheets/scroll-area";
import { initializeLabelsProviderContext, useLabel } from "../sheets/styles";
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
var dialogPopupClassName: string;
var dialogBodyClassName: string;
var dialogBackdropClasses: string;
var dialogBackdropClassName: string;
var StartingOpacity0Value: string;
var DialogDialogCurrentState: AbortController | null;
var DialogDialogHeightWebkitAppRegionConfig: React.CSSProperties & {
  WebkitAppRegion: string;
};
var dialogNestedOverlayClassName: string;
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
var alertDialogContext: React.Context<boolean>;
var dialogHeadingTextClassName: string;
var dialogTitleTextClassName: string;
var Mt05Value: string;
var Mt1Value: string;
var dialogDescriptionClassName: string;
var dialogTriggerElementRefContext: React.Context<
  React.RefObject<HTMLButtonElement | null> | undefined
>;
var dialogPointerDismissalContext: React.Context<boolean>;
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
var closeButtonFlushClasses: string;
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
var alertDialogParts: {
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
function useDialogPresence(portalClassName?: string): void {
  (0, reactDialogDialog.useEffect)(() => {}, [portalClassName]);
}
function useDialogOpenAutofocus(
  targetRef: React.RefObject<HTMLElement | null>,
  shouldShowFocusRing: boolean,
  popupRef: React.RefObject<HTMLElement | null>,
  isOpenRef: React.RefObject<boolean>,
  hasUserInteractedRef: React.RefObject<boolean>,
  getFallbackTarget: () => HTMLElement | null,
): () => HTMLElement | null {
  return (0, reactDialogDialog.useCallback)(() => {
    let targetElement = targetRef.current,
      ownerDocument = targetElement?.ownerDocument,
      view: BrowserWindow | null | undefined = ownerDocument?.defaultView as
        | BrowserWindow
        | null
        | undefined;
    if (targetElement && ownerDocument && view) {
      view.requestAnimationFrame(() => {
        if (!isOpenRef.current || !targetElement.isConnected) return;
        let popupElement = popupRef.current,
          activeElement = ownerDocument.activeElement;
        (popupElement &&
          activeElement &&
          activeElement !== targetElement &&
          popupElement.contains(activeElement)) ||
          targetElement.focus({
            preventScroll: true,
            focusVisible: shouldShowFocusRing,
          } as FocusOptionsWithVisibility);
      });
      let retryCount = 0,
        isHandled = false,
        handleFocusIn = (event: FocusEvent): void => {
          let popupElement = popupRef.current,
            target = event.target;
          if (
            !(
              isHandled ||
              !isOpenRef.current ||
              hasUserInteractedRef.current ||
              retryCount >= 3 ||
              !popupElement ||
              !(target instanceof view.Element) ||
              popupElement.contains(target)
            )
          ) {
            if (!(target as Element).closest(DialogDialogLabel)) {
              isHandled = true;
              return;
            }
            retryCount += 1;
            view.requestAnimationFrame(() => {
              let fallbackTarget = getFallbackTarget();
              !isOpenRef.current ||
                hasUserInteractedRef.current ||
                !fallbackTarget?.isConnected ||
                (fallbackTarget instanceof view.HTMLButtonElement &&
                  fallbackTarget.disabled) ||
                fallbackTarget.focus({
                  preventScroll: true,
                  focusVisible: fallbackTarget !== popupRef.current,
                } as FocusOptionsWithVisibility);
            });
          }
        };
      ownerDocument.addEventListener("focusin", handleFocusIn, true);
      view.setTimeout(() => {
        ownerDocument.removeEventListener("focusin", handleFocusIn, true);
      }, 1e3);
    }
    return targetElement;
  }, [targetRef, shouldShowFocusRing, popupRef, isOpenRef, hasUserInteractedRef, getFallbackTarget]);
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
  let defaultCloseLabel = useLabel("close", "Close");
  return (
    <npm_Dialog_Xg.Close
      render={
        <Button
          variant={"ghost"}
          iconOnly={true}
          icon={"X"}
          aria-label={ariaLabel ?? (defaultCloseLabel)}
          tooltip={false}
          className={cn(flush && closeButtonFlushClasses, className)}
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
  let isAlertDialog = (0, reactDialogDialog.useContext)(alertDialogContext);
  return (
    <div
      className={cn(
        "mb-pad-md flex items-start gap-2",
        className,
      )}
    >
      <div
        className={npm_clsx_Ea(
          isAlertDialog ? Mt05Value : Mt1Value,
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
      className={cn(
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
  let triggerRef = (0, reactDialogDialog.useRef)<HTMLButtonElement | null>(null),
    actionsHandleRef = (0, reactDialogDialog.useRef)<OverlayActions | null>(null);
  useOverlayImperativeHandle(actionsHandleRef, actionsRef);
  let resolvedDisablePointerDismissal =
    disablePointerDismissal ?? (dismissible === false ? true : undefined);
  return (
    <alertDialogContext.Provider value={false}>
      <DialogDialogContext.Provider value={props.modal}>
        <dialogTriggerElementRefContext.Provider value={triggerRef}>
          <dialogPointerDismissalContext.Provider value={!resolvedDisablePointerDismissal}>
            <ActivityBoundary actionsRef={actionsHandleRef}>
              <npm_Dialog_Xg.Root
                disablePointerDismissal={resolvedDisablePointerDismissal}
                actionsRef={actionsHandleRef}
                {...props}
              />
            </ActivityBoundary>
          </dialogPointerDismissalContext.Provider>
        </dialogTriggerElementRefContext.Provider>
      </DialogDialogContext.Provider>
    </alertDialogContext.Provider>
  );
}
function AlertDialogRoot<Payload = void>({
  actionsRef: actionsRef,
  ...props
}: AlertDialogRootProps<Payload>): React.ReactElement {
  useUiLocale();
  let actionsHandleRef = (0, reactDialogDialog.useRef)<OverlayActions | null>(null);
  useOverlayImperativeHandle(actionsHandleRef, actionsRef);
  return (
    <alertDialogContext.Provider value={true}>
      <DialogDialogContext.Provider value={true}>
        <dialogPointerDismissalContext.Provider value={false}>
          <ActivityBoundary actionsRef={actionsHandleRef}>
            <npm_AlertDialog_Dh.Root {...props} actionsRef={actionsHandleRef} />
          </ActivityBoundary>
        </dialogPointerDismissalContext.Provider>
      </DialogDialogContext.Provider>
    </alertDialogContext.Provider>
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
  disabled: disabledProp = false,
  confirmDisabledReason: confirmDisabledReason,
  size = "sm",
  className: className,
  portalClassName: portalClassName,
  onConfirm: onConfirm,
  closeOnConfirm = false,
  children: children,
}: ConfirmationDialogProps): React.ReactElement {
  useUiLocale();
  let defaultConfirmLabel = useLabel("confirm", "Confirm"),
    defaultCancelLabel = useLabel("cancel", "Cancel"),
    confirmText = confirmLabel ?? defaultConfirmLabel,
    cancelText = cancelLabel ?? defaultCancelLabel,
    [isPending, setIsPending] = (0, reactDialogDialog.useState)(false),
    cancelButtonRef = (0, reactDialogDialog.useRef)<HTMLButtonElement | null>(null),
    confirmButtonRef = (0, reactDialogDialog.useRef)<HTMLButtonElement | null>(null),
    { finalFocus: finalFocusTarget, popupRef: popupRef } = useFinalFocus(
      open,
    ),
    getDefaultFocus = (): ConfirmationFocus =>
      initialFocus === "cancel"
        ? "cancel"
        : disabledProp
          ? "pending"
          : "confirm",
    [focusTarget, setFocusTarget] = (0, reactDialogDialog.useState)(getDefaultFocus),
    focusTargetRef = (0, reactDialogDialog.useRef)(focusTarget);
  useIsomorphicLayoutEffect(() => {
    focusTargetRef.current = focusTarget;
  }, [focusTarget]);
  let getFocusTargetElement = (0, reactDialogDialog.useCallback)(() => {
      switch (focusTargetRef.current) {
        case "confirm":
          return confirmButtonRef.current;
        case "cancel":
          return cancelButtonRef.current;
        default:
          return popupRef.current;
      }
    }, [popupRef]),
    hasUserInteractedRef = (0, reactDialogDialog.useRef)(false),
    markUserInteracted = (0, reactDialogDialog.useCallback)(() => {
      hasUserInteractedRef.current = true;
    }, []);
  useIsomorphicLayoutEffect(() => {
    open && ((hasUserInteractedRef.current = false), setFocusTarget(getDefaultFocus()));
  }, [open]);
  let moveFocusTo = (0, reactDialogDialog.useCallback)(
    (target: ConfirmationFocus): void => {
      setFocusTarget(target);
      let targetButton = target === "confirm" ? confirmButtonRef.current : cancelButtonRef.current,
        popupElement = popupRef.current;
      if (!targetButton || !popupElement) return;
      let activeElement = targetButton.ownerDocument.activeElement,
        isFocusLost =
          !activeElement ||
          activeElement === popupElement ||
          activeElement === targetButton.ownerDocument.body ||
          (!popupElement.contains(activeElement) &&
            activeElement.closest(DialogDialogLabel) !== null),
        isFocusOnFooterButton =
          activeElement === cancelButtonRef.current ||
          activeElement === confirmButtonRef.current;
      (isFocusLost || (isFocusOnFooterButton && !hasUserInteractedRef.current)) &&
        targetButton.focus({
          preventScroll: true,
          focusVisible: true,
        } as FocusOptionsWithVisibility);
    },
    [popupRef],
  );
  (0, reactDialogDialog.useEffect)(() => {
    if (!open || focusTarget !== "pending") return;
    if (!disabledProp) {
      let frameId = requestAnimationFrame(() => moveFocusTo("confirm"));
      return () => cancelAnimationFrame(frameId);
    }
    let timerId: ReturnType<typeof setTimeout> = setTimeout(
      () => moveFocusTo("cancel"),
      DialogDialogDelayMs,
    );
    return () => clearTimeout(timerId);
  }, [disabledProp, focusTarget, moveFocusTo, open]);
  let isOpenRef = (0, reactDialogDialog.useRef)(open);
  useIsomorphicLayoutEffect(() => {
    isOpenRef.current = open;
  }, [open]);
  let openAutofocus = useDialogOpenAutofocus(
      focusTarget === "confirm"
        ? confirmButtonRef
        : focusTarget === "cancel"
          ? cancelButtonRef
          : popupRef,
      focusTarget !== "pending",
      popupRef,
      isOpenRef,
      hasUserInteractedRef,
      getFocusTargetElement,
    ),
    blockRepeatedKey = (0, reactDialogDialog.useCallback)(
      (event: React.KeyboardEvent<HTMLButtonElement>): void => {
        event.repeat &&
          (event.key === "Enter" || event.key === " ") &&
          event.preventDefault();
      },
      [],
    ),
    hasConfirmedRef = (0, reactDialogDialog.useRef)(false);
  (0, reactDialogDialog.useEffect)(() => {
    open && (hasConfirmedRef.current = false);
  }, [open]);
  let overlayRoot = useOverlayRoot(),
    handleConfirm = (0, reactDialogDialog.useCallback)(() => {
      if (isPending || disabledProp || !open || hasConfirmedRef.current) return;
      closeOnConfirm ? (hasConfirmedRef.current = true) : setIsPending(true);
      let confirmPromise: Promise<void>;
      try {
        confirmPromise = Promise.resolve(onConfirm());
      } catch (error) {
        confirmPromise = Promise.reject(error);
      }
      closeOnConfirm &&
        onOpenChange(false, {
          reason: "confirm",
        });
      confirmPromise.finally(() => {
        closeOnConfirm || setIsPending(false);
      });
    }, [isPending, closeOnConfirm, disabledProp, onConfirm, onOpenChange, open]),
    handleOpenChange = (0, reactDialogDialog.useCallback)(
      (nextOpen: boolean): void => {
        isPending ||
          !open ||
          onOpenChange(nextOpen, {
            reason: "dismiss",
          });
      },
      [isPending, onOpenChange, open],
    ),
    layer = useDefaultLayer("modal");
  useDialogPresence(portalClassName);
  let confirmActionsRef = (0, reactDialogDialog.useRef)<OverlayActions | null>(null),
    confirmButton = (
      <Button
        ref={confirmButtonRef}
        variant={confirmVariant}
        busy={isPending}
        disabled={disabledProp}
        data-initial-focus={focusTarget === "confirm" ? "" : undefined}
        onClick={handleConfirm}
        onKeyDown={blockRepeatedKey}
      >
        {confirmText}
      </Button>
    );
  return (
    <ActivityBoundary actionsRef={confirmActionsRef}>
      <npm_AlertDialog_Dh.Root
        open={open}
        onOpenChange={handleOpenChange}
        actionsRef={confirmActionsRef}
      >
        <npm_AlertDialog_Dh.Portal container={overlayRoot}>
          <PopupSurface
            className={cn("relative", portalClassName)}
            style={layer.style}
            surface={surfaceBackgroundTokens.popover}
            closeOnActivityHide={true}
          >
            <LayerBaseContext.Provider value={layer.base}>
              <npm_AlertDialog_Dh.Backdrop
                forceRender={true}
                onMouseDown={preventDialogMouseSelection}
                className={npm_clsx_Ea(
                  dialogBackdropClassName,
                  StartingOpacity0Value,
                )}
              />
              <WindowDragStrip />
              <ConfirmationDialogPopupInner
                data-cds={"ConfirmationDialog"}
                ref={popupRef}
                onKeyDownCapture={markUserInteracted}
                onPointerDownCapture={markUserInteracted}
                initialFocus={openAutofocus}
                finalFocus={finalFocusTarget}
                className={cn(
                  "draggable-none",
                  dialogNestedOverlayClassName,
                  dialogPopupClassName,
                  dialogBackdropClasses,
                  DataNestedDialogOpenBlur2pxValue,
                  DialogDialogSmMdLgConfig[size],
                  className,
                )}
              >
                <div className={dialogBodyClassName}>
                  <npm_AlertDialog_Dh.Title
                    className={npm_clsx_Ea(
                      Mt05Value,
                      dialogHeadingTextClassName,
                      "text-primary",
                    )}
                  >
                    {title}
                  </npm_AlertDialog_Dh.Title>
                  {description && (<npm_AlertDialog_Dh.Description
                      className={dialogDescriptionClassName}
                    >
                      {description}
                    </npm_AlertDialog_Dh.Description>)}
                  {children}
                  <DialogFooter>
                    <npm_AlertDialog_Dh.Close
                      render={
                        <Button
                          ref={cancelButtonRef}
                          variant={"secondary"}
                          disabled={isPending}
                          data-initial-focus={
                            focusTarget === "cancel" ? "" : undefined
                          }
                        >
                          {cancelText}
                        </Button>
                      }
                    />
                    {confirmDisabledReason === undefined ? (confirmButton) : (<DeferredDisabledReasonTooltip
                        reason={disabledProp ? confirmDisabledReason : undefined}
                        wrapperClassName={"flex-col"}
                      >
                        {confirmButton}
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
  dialogBodyClassName,
  dialogBackdropClassName,
  dialogNestedOverlayClassName,
  dialogHeadingTextClassName,
  dialogTitleTextClassName,
  dialogDescriptionClassName,
  DialogDialogContext,
  alertDialogContext,
  dialogTriggerElementRefContext,
  dialogPointerDismissalContext,
  DialogDialogCss,
  dialogPopupClassName,
  DialogDialogCurrentState,
  DialogDialogDelayMs,
  DialogDialogHeightWebkitAppRegionConfig,
  DialogDialogLabel,
  DialogDialogPattern,
  DialogDialogRootTriggerPopupConfig,
  alertDialogParts,
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
export function set_DialogDialogCurrentState(nextState: any): any {
  DialogDialogCurrentState = nextState;
  return nextState;
}
export function installCdsDialogDialog(): () => void {
  return () => {
    initializeDialogDialog = initializeOnce(() => {
      "use client";

      initializeHooksLayoutEffect();
      initializeClassNames();
      initializeLabelsProviderContext();
      initializeCdsRoot();
      initializeHooksStableCallback();
      initializeOverlaysLayers();
      initializeOverlayAttributes();
      initializeActivityVisibilityContext();
      initializeDomRefComposition();
      initializeRootFontSizeHooks();
      initializeTooltipDeferredProvider();
      initializeButtonButton();
      initializeThemeSurfaces();
      initializeOverlaysImperativeHandle();
      initializeFocusHooks();
      initializeDialogKeyboardViewport();
      reactDialogDialog = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxDialogDialog = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_sYe();
      initializeNpm__base_ui_react_uYe();
      DialogDialogCss = `${popupSurfaceClassName("popover")} shadow-panel-lg`;
      DialogDialogClassNames =
        "max-h-[calc(100dvh_-_max(2rem,2*var(--desktop-titlebar-inset,0px))_-_2*max(env(safe-area-inset-top,0px),env(safe-area-inset-bottom,0px)))]";
      dialogPopupClassName = `fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col w-[calc(100vw-2rem)] ${DialogDialogClassNames} ${DialogDialogCss} cds-reset text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
      dialogBodyClassName =
        "isolate flex min-h-0 flex-1 flex-col overflow-y-auto scroll-fade-y rounded-[inherit] p-xl";
      dialogBackdropClasses =
        "transition-[opacity,scale,filter] duration-base ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:scale-[0.98] starting:opacity-0 starting:scale-[0.98] motion-reduce:data-[starting-style]:scale-100 data-[ending-style]:opacity-0 data-[ending-style]:scale-[0.98]";
      dialogBackdropClassName =
        "draggable-none fixed inset-0 bg-backdrop backdrop-blur-[2px] transition-opacity duration-base ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[ending-style]:opacity-0 has-[~[data-nested]]:bg-transparent has-[~[data-nested]]:backdrop-blur-none";
      StartingOpacity0Value = "starting:opacity-0";
      DialogDialogCurrentState = null;
      DialogDialogHeightWebkitAppRegionConfig = {
        height: "var(--desktop-titlebar-inset, 0px)",
        WebkitAppRegion: "drag",
      };
      dialogNestedOverlayClassName =
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
      alertDialogContext = (0, reactDialogDialog.createContext)(false);
      dialogHeadingTextClassName = "text-heading font-medium";
      dialogTitleTextClassName = "text-title font-semibold";
      Mt05Value = "-mt-0.5";
      Mt1Value = "-mt-1";
      dialogDescriptionClassName = "mt-1 text-body font-normal text-secondary";
      dialogTriggerElementRefContext = (0, reactDialogDialog.createContext)<
        React.RefObject<HTMLButtonElement | null> | undefined
      >(undefined);
      dialogPointerDismissalContext = (0, reactDialogDialog.createContext)(false);
      DialogTrigger = (0, reactDialogDialog.forwardRef)<
        HTMLButtonElement,
        import("@base-ui/react/dialog").Dialog.Trigger.Props<void>
      >(
        (
          props: import("@base-ui/react/dialog").Dialog.Trigger.Props<void>,
          forwardedRef: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let defaultTriggerRef = (0, reactDialogDialog.useContext)(dialogTriggerElementRefContext),
            triggerRef = props.handle ? null : (defaultTriggerRef ?? null),
            mergedRef = useMergedRefs(forwardedRef, triggerRef);
          return <npm_Dialog_Xg.Trigger ref={mergedRef} {...props} />;
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
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let modalMode = (0, reactDialogDialog.useContext)(DialogDialogContext),
            triggerRef = (0, reactDialogDialog.useContext)(dialogTriggerElementRefContext),
            { finalFocus: defaultFinalFocus, popupRef: popupRef } = useFinalFocus(true, modalMode !== false, triggerRef),
            keyboardViewportRef = useDialogKeyboardViewport(fitVisualViewport),
            mergedRef = useMergedRefs(forwardedRef, popupRef, keyboardViewportRef);
          return (
            <npm_Dialog_Xg.Popup
              {...{
                [overlayAttribute]: "",
              }}
              ref={mergedRef}
              finalFocus={finalFocus ?? defaultFinalFocus}
              aria-modal={modalMode === false ? "false" : undefined}
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
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let keyboardViewportRef = useDialogKeyboardViewport(true),
            mergedRef = useMergedRefs(forwardedRef, keyboardViewportRef);
          return (
            <npm_AlertDialog_Dh.Popup
              {...{
                [overlayAttribute]: "",
              }}
              ref={mergedRef}
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
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let popupClassName = unstyled
              ? ""
              : `${dialogPopupClassName} ${dialogBackdropClasses} ${DataNestedDialogOpenBlur2pxValue} ${DialogDialogSmMdLgConfig[size]} ${fullHeight ? "h-dvh" : ""}`,
            layer = useDefaultLayer("modal");
          useDialogPresence(portalClassName);
          let modalMode = (0, reactDialogDialog.useContext)(DialogDialogContext),
            isDismissible = (0, reactDialogDialog.useContext)(dialogPointerDismissalContext),
            shouldForceRenderBackdrop = modalMode === undefined || modalMode === true;
          return (
            <npm_Dialog_Xg.Portal
              container={useOverlayRoot()}
            >
              <PopupSurface
                className={cn("relative", portalClassName)}
                style={layer.style}
                surface={
                  surface ??
                  (unstyled
                    ? undefined
                    : surfaceBackgroundTokens.popover)
                }
                closeOnActivityHide={true}
              >
                <LayerBaseContext.Provider value={layer.base}>
                  <npm_Dialog_Xg.Backdrop
                    forceRender={shouldForceRenderBackdrop}
                    onMouseDown={
                      isDismissible
                        ? preserveDialogFocus
                        : preventDialogMouseSelection
                    }
                    className={cn(
                      dialogBackdropClassName,
                      !unstyled && StartingOpacity0Value,
                      modalMode === false && "pointer-events-none opacity-0",
                      backdropClassName,
                    )}
                    style={backdropStyle}
                  />
                  <WindowDragStrip />
                  <DialogPopupInner
                    data-cds={"Dialog"}
                    ref={forwardedRef}
                    {...props}
                    fitVisualViewport={!unstyled}
                    className={cn(
                      "draggable-none",
                      dialogNestedOverlayClassName,
                      popupClassName,
                      className,
                    )}
                  >
                    {unstyled ? (children) : (<div className={dialogBodyClassName}>{children}</div>)}
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
          forwardedRef: React.ForwardedRef<HTMLHeadingElement>,
        ): React.ReactElement => {
          let isAlertDialog = (0, reactDialogDialog.useContext)(alertDialogContext);
          return (
            <npm_Dialog_Xg.Title
              ref={forwardedRef}
              {...props}
              className={cn(
                "text-primary",
                isAlertDialog ? dialogHeadingTextClassName : dialogTitleTextClassName,
                className,
              )}
            />
          );
        },
      );
      DialogTitle.displayName = "Dialog.Title";
      closeButtonFlushClasses = "-me-pad-sm -mt-pad-sm";
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
          forwardedRef: React.ForwardedRef<HTMLParagraphElement>,
        ): React.ReactElement => (
          <npm_Dialog_Xg.Description
            ref={forwardedRef}
            {...props}
            className={cn(dialogDescriptionClassName, className)}
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
      alertDialogParts = {
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
