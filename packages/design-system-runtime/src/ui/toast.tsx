import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type {
  ToastVariant,
  ToastData,
  ToastObject,
  PinnedToast,
  ToastMovementState,
  PinnedToastContext,
  ToastNotification,
  ToastProviderProps,
  ToastNotifications,
} from "../contracts/overlays";
/** Restored application module; prepare first, initialize in original order. */
import { baseToast, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { initializeIsomorphicLayoutEffect, useIsomorphicLayoutEffect } from "./foundation";
import { CdsLayer, cn, elevationSurfaceNames, getSurfaceClasses, Icon, initializeClassNames, initializeIcons, initializeLayers, initializePortalRoot, initializeSurfaces, initializeTranslations, PortalRoot, TOAST_LAYER_BASE, useTranslation } from "./interactions";

var reactForUiToast: typeof React;
var jsxForUiToast: typeof import("react/jsx-runtime");
var DEFAULT_TOAST_TIMEOUT_MS: number;
var TOAST_TRANSITION_TIMEOUT_MS: number;
var toastSurfaceClasses: string;
var toastVariantClasses: Record<ToastVariant, string>;
var toastVariantTextClasses: Record<ToastVariant, string>;
var toastDefaultIconNames: Record<ToastVariant, string>;
var toastSecondaryTextClasses: Record<ToastVariant, string>;
var toastStackTransformClasses: string;
var toastContentClasses: string;
var toastBodyClasses: string;
var toastDismissButtonClasses: string;
var emptyToastList: Array<"up" | "down" | "left" | "right">;
var pinnedToastContext: React.Context<PinnedToastContext | null>;
var noopToastPinSetter: (toast: PinnedToast | null) => void;
function normalizeToastTimeout(timeout?: number): number | undefined {
  if (timeout === undefined || timeout <= 0) {
    return timeout;
  }
  if (!Number.isFinite(timeout)) {
    return 0;
  }
  if (timeout < 6000) {
    return DEFAULT_TOAST_TIMEOUT_MS;
  }
  return timeout;
}
function ToastView({
  toast: toast,
  front: front,
  frontHeight: frontHeight,
  zIndex: zIndex,
}: {
  toast: ToastObject;
  front: boolean;
  frontHeight?: number;
  zIndex: number;
}): React.ReactElement {
  useUiLocale();
  let value =
      toast.data?.variant ??
      (toast.type as ToastVariant | undefined) ??
      "neutral",
    icon = toast.data?.icon,
    hasIcon =
      icon !== null && icon !== undefined && typeof icon !== "boolean",
    behindFront = !front,
    lockedHeight = behindFront && frontHeight ? frontHeight : undefined,
    dismissLabel = useTranslation("dismiss", "Dismiss"),
    { update: updateToast } = baseToast.useToastManager<ToastData>(),
    pinnedContext = reactForUiToast.useContext(pinnedToastContext),
    ref = reactForUiToast.useRef<HTMLElement | null>(null),
    previousTitleRef = reactForUiToast.useRef(""),
    customTitle = toast.data?.titleNode,
    repeatCount = toast.data?.count ?? 1,
    id = toast.id,
    callback = () => {
      let userDismissTimes = pinnedContext?.userDismissAt,
        dismissedAt = Date.now();
      for (let [toastId, previousDismissTime] of userDismissTimes ?? []) {
        if (dismissedAt - previousDismissTime > TOAST_TRANSITION_TIMEOUT_MS) {
          userDismissTimes?.delete(toastId);
        }
      }
      userDismissTimes?.set(id, dismissedAt);
    };
  reactForUiToast.useLayoutEffect(() => {
    let current = ref.current;
    if (customTitle === undefined || !current) {
      return;
    }
    let syncTitleText = () => {
      let titleText = current.textContent ?? "";
      if (titleText !== previousTitleRef.current) {
        previousTitleRef.current = titleText;
        updateToast(id, {
          title: titleText,
        });
      }
    };
    syncTitleText();
    let observer = new MutationObserver(syncTitleText);
    observer.observe(current, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    return () => observer.disconnect();
  }, [customTitle, id, updateToast]);
  let isEnding = toast.transitionStatus === "ending",
    [previousStackPosition, setPreviousStackPosition] = reactForUiToast.useState({
      behind: behindFront,
      lockedHeight: lockedHeight,
    });
  if (
    !isEnding &&
    (previousStackPosition.behind !== behindFront || previousStackPosition.lockedHeight !== lockedHeight)
  ) {
    setPreviousStackPosition({
      behind: behindFront,
      lockedHeight: lockedHeight,
    });
  }
  let renderedBehindFront = isEnding ? previousStackPosition.behind : behindFront,
    renderedHeight = isEnding ? previousStackPosition.lockedHeight : lockedHeight;
  return (
    <baseToast.Root
      toast={toast}
      swipeDirection={emptyToastList}
      className={toastStackTransformClasses}
      style={{
        zIndex: zIndex,
      }}
      onKeyDown={(keyEvent: React.KeyboardEvent<HTMLDivElement>) => {
        if (
          keyEvent.key === "Escape" &&
          keyEvent.currentTarget.contains(
            keyEvent.currentTarget.ownerDocument.activeElement,
          )
        ) {
          callback();
        }
      }}
    >
      <div
        className={`${toastSurfaceClasses} ${toastVariantClasses[value]} ${toastVariantTextClasses[value]}`}
      >
        <div
          className={toastContentClasses}
          data-behind={renderedBehindFront ? "" : undefined}
          style={
            renderedHeight !== undefined
              ? {
                  height: renderedHeight,
                }
              : undefined
          }
        >
          {[icon !== null && (
              <span
                className={`shrink-0 ${toastSecondaryTextClasses[value]}`}
              >
                {hasIcon ? (icon) : (<Icon
                    name={toastDefaultIconNames[value]}
                    size={"md"}
                  />)}
              </span>
            ), <div className={toastBodyClasses}>
              {[<baseToast.Title
                  className={"font-medium"}
                  aria-atomic={"true"}
                >
                  {[<span ref={ref}>{customTitle ?? (toast.data?.baseTitle)}</span>, repeatCount > 1 && (
                      <span
                        aria-live={repeatCount > 2 ? "off" : undefined}
                        data-cds-toast-count={""}
                      >{` (×${repeatCount})`}</span>
                    )]}
                </baseToast.Title>, <baseToast.Description />, toast.data?.action && (
                  <div className={"mt-pad-md empty:hidden"}>
                    {toast.data.action}
                  </div>
                )]}
            </div>, <baseToast.Close
              aria-label={dismissLabel}
              className={toastDismissButtonClasses}
              onClick={callback}
            >
              <Icon name={"X"} size={"sm"} />
            </baseToast.Close>]}
        </div>
      </div>
    </baseToast.Root>
  );
}
function PinnedToastView({
  pinned: pinned,
  onDismiss: onDismiss,
}: {
  pinned: PinnedToast;
  onDismiss(): void;
}): React.ReactElement {
  useUiLocale();
  let value = pinned.variant ?? "neutral",
    dismissLabel = useTranslation("dismiss", "Dismiss");
  return (
    <div
      data-pinned={""}
      className={`pointer-events-auto relative w-full ${toastSurfaceClasses} ${toastVariantClasses[value]} ${toastVariantTextClasses[value]}`}
    >
      <div className={toastContentClasses}>
        {[<span className={`shrink-0 ${toastSecondaryTextClasses[value]}`}>
            <Icon name={toastDefaultIconNames[value]} size={"md"} />
          </span>, <div className={toastBodyClasses}>
            {[<div className={"font-medium"}>{pinned.title}</div>, pinned.description && <div>{pinned.description}</div>, pinned.action && (
                <div className={"mt-pad-md empty:hidden"}>
                  {pinned.action}
                </div>
              )]}
          </div>, pinned.dismissible && (
            <button
              type={"button"}
              aria-label={pinned.dismissLabel ?? (dismissLabel)}
              onClick={onDismiss}
              className={toastDismissButtonClasses}
            >
              <Icon name={"X"} size={"sm"} />
            </button>
          )]}
      </div>
    </div>
  );
}
function containsVisibleFocus(
  element: HTMLElement | null | undefined,
): boolean {
  let value = element?.ownerDocument.activeElement;
  if (!element || !value || !element.contains(value)) {
    return false;
  }
  try {
    return value.matches(":focus-visible");
  } catch {
    return true;
  }
}
function PinnedToastSlot({
  ctx: ctx,
}: {
  ctx: PinnedToastContext;
}): React.ReactElement {
  useUiLocale();
  let {
      pinned: value,
      setPinned: setPinned,
      slotRef: slotRef,
      focusWasInsideRef: focusWasInsideRef,
    } = ctx,
    ref = reactForUiToast.useRef<HTMLElement | null>(null);
  reactForUiToast.useEffect(() => {
    let current = slotRef.current;
    if (!current) {
      return;
    }
    let ownerDocument = current.ownerDocument,
      callback = (event: FocusEvent) => {
        let target = event.target as HTMLElement | null;
        if (
          target &&
          typeof target.focus === "function" &&
          !current.contains(target)
        ) {
          ref.current = target;
        }
      };
    ownerDocument.addEventListener("focusin", callback);
    return () => ownerDocument.removeEventListener("focusin", callback);
  }, [slotRef]);
  reactForUiToast.useLayoutEffect(() => {
    let current = slotRef.current;
    if (!current || !focusWasInsideRef.current) {
      return;
    }
    focusWasInsideRef.current = false;
    if (current.contains(current.ownerDocument.activeElement)) {
      return;
    }
    let focusTarget = ref.current;
    if (focusTarget?.isConnected) {
      focusTarget.focus({
        preventScroll: true,
      });
    }
  }, [value, slotRef, focusWasInsideRef]);
  return (
    <div
      ref={(element: HTMLElement | null) => {
        slotRef.current = element;
      }}
      role={"status"}
      className={value ? "w-full" : "sr-only"}
      onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
        if (
          event.key === "Escape" &&
          !event.defaultPrevented &&
          !event.nativeEvent.isComposing &&
          value?.dismissible &&
          event.currentTarget.contains(
            event.currentTarget.ownerDocument.activeElement,
          )
        ) {
          setPinned(null);
        }
      }}
    >
      {value && (<PinnedToastView pinned={value} onDismiss={() => setPinned(null)} />)}
    </div>
  );
}
function ToastViewport({
  className: className,
}: {
  className?: string;
}): React.ReactElement {
  useUiLocale();
  let { toasts: value } = baseToast.useToastManager<ToastData>(),
    pinnedContext = reactForUiToast.useContext(pinnedToastContext);
  useIsomorphicLayoutEffect(() => {
    pinnedContext?.syncLiveToasts(value);
  }, [value, pinnedContext]);
  let frontToast = value.find(
    (toast: ToastObject) => toast.transitionStatus !== "ending",
  );
  return (
    <baseToast.Portal>
      <PortalRoot surface={elevationSurfaceNames.popover}>
        <CdsLayer
          base={TOAST_LAYER_BASE}
          render={
            <div
              data-cds={"Toast"}
              className={cn(
                "cds-reset pointer-events-none fixed right-4 bottom-4 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col-reverse gap-md",
                className,
              )}
            />
          }
        >
          {[pinnedContext && <PinnedToastSlot ctx={pinnedContext} />, <baseToast.Viewport
              className={
                "pointer-events-auto relative outline-none focus-visible:outline-hidden"
              }
              style={{
                height: frontToast?.height,
              }}
            >
              {value.map((toast: ToastObject, index: number) =>
                (() => {
                  const _Element = ToastView;
                  const _elementProps = {
                    toast: toast,
                    front: toast === frontToast,
                    frontHeight: frontToast?.height,
                    zIndex: value.length - index,
                  };
                  const _elementKey = toast.id;
                  return <_Element key={_elementKey} {..._elementProps} />;
                })(),
              )}
            </baseToast.Viewport>]}
        </CdsLayer>
      </PortalRoot>
    </baseToast.Portal>
  );
}
function createToastMovementState(): ToastMovementState {
  let nextId = 0;
  return {
    allocId: () => `cds-toast-${++nextId}`,
    movingIds: new Set(),
    userDismissAt: new Map(),
  };
}
function ToastProvider({
  children: children,
  timeout = DEFAULT_TOAST_TIMEOUT_MS,
  limit: limit,
  viewportClassName: viewportClassName,
}: ToastProviderProps): React.ReactElement {
  useUiLocale();
  let [value, setPinnedToast] = reactForUiToast.useState<PinnedToast | null>(null),
    ref = reactForUiToast.useRef(value),
    slotRef = reactForUiToast.useRef<HTMLElement | null>(null),
    focusWasInsideRef = reactForUiToast.useRef(false),
    callback = reactForUiToast.useCallback((nextPinnedToast: PinnedToast | null) => {
      let current = ref.current;
      ref.current = nextPinnedToast;
      if (current !== nextPinnedToast && !focusWasInsideRef.current) {
        focusWasInsideRef.current = containsVisibleFocus(slotRef.current);
      }
      setPinnedToast(nextPinnedToast);
      if (current && current !== nextPinnedToast) {
        current.onClose?.();
      }
    }, []),
    liveToastsRef = reactForUiToast.useRef<ToastObject[]>([]),
    syncLiveToasts = reactForUiToast.useCallback((liveToasts: ToastObject[]) => {
      liveToastsRef.current = liveToasts;
    }, []),
    [movementState] = reactForUiToast.useState(createToastMovementState),
    memo = reactForUiToast.useMemo(
      () => normalizeToastTimeout(timeout),
      [timeout],
    ),
    pinnedContext = reactForUiToast.useMemo(
      () => ({
        pinned: value,
        setPinned: callback,
        slotRef: slotRef,
        focusWasInsideRef: focusWasInsideRef,
        liveToasts: liveToastsRef,
        syncLiveToasts: syncLiveToasts,
        defaultTimeout: memo,
        ...movementState,
      }),
      [value, callback, syncLiveToasts, memo, movementState],
    );
  return (
    <baseToast.Provider timeout={memo} limit={limit}>
      <pinnedToastContext.Provider value={pinnedContext}>
        {[children, <ToastViewport className={viewportClassName} />]}
      </pinnedToastContext.Provider>
    </baseToast.Provider>
  );
}
function useToastNotifications(): ToastNotifications {
  let value = baseToast.useToastManager<ToastData>(),
    pinnedContext = reactForUiToast.useContext(pinnedToastContext);
  return {
    add: reactForUiToast.useCallback(
      ({
        title: title,
        description: description,
        variant: variant,
        icon: icon,
        action: action,
        timeout: timeout,
        onClose: onClose,
        dedupe = false,
        dedupeKey: dedupeKey,
      }: ToastNotification) => {
        let resolvedVariant = variant ?? "neutral",
          hasTextTitle = typeof title === "string",
          resolvedDedupeKey = dedupeKey ?? (hasTextTitle ? (title as string) : undefined),
          state = {
            titleNode: hasTextTitle ? undefined : title,
            baseTitle: hasTextTitle ? (title as string) : undefined,
          },
          now = Date.now(),
          callback = (duration: number | undefined) => {
            let timeoutMs = duration ?? pinnedContext?.defaultTimeout;
            if (timeoutMs !== undefined && timeoutMs > 0) {
              return now + timeoutMs;
            } else {
              return undefined;
            }
          };
        if (dedupe && resolvedDedupeKey !== undefined) {
          let liveToasts = pinnedContext?.liveToasts.current ?? value.toasts,
            matchingToast = liveToasts.find(
              (toast: ToastObject) =>
                toast.data?.dedupeKey === resolvedDedupeKey &&
                toast.transitionStatus !== "ending",
            );
          if (matchingToast) {
            let repeatCount = (matchingToast.data?.count ?? 1) + 1,
              resolvedAction = action ?? matchingToast.data?.action,
              wasPersistent =
                Boolean(matchingToast.data?.action) ||
                (matchingToast.timeout ?? pinnedContext?.defaultTimeout) === 0,
              requestedTimeout =
                timeout === undefined
                  ? undefined
                  : normalizeToastTimeout(timeout),
              updatedTimeout = resolvedAction ? 0 : wasPersistent ? undefined : requestedTimeout,
              updatedData = {
                ...matchingToast.data,
                ...state,
                variant: variant ?? matchingToast.data?.variant,
                ...(icon !== undefined && {
                  icon: icon,
                }),
                action: resolvedAction,
                count: repeatCount,
                ...(updatedTimeout !== undefined && {
                  expiresAt: callback(updatedTimeout),
                }),
              },
              baseTitle = hasTextTitle ? title : matchingToast.title,
              refreshedTitle =
                repeatCount === 2 && typeof baseTitle === "string"
                  ? `${baseTitle} (×2)`
                  : hasTextTitle && title !== matchingToast.data?.baseTitle
                    ? title
                    : undefined,
              frontToast = liveToasts.find(
                (toast: ToastObject) => toast.transitionStatus !== "ending",
              ),
              focusInsideToasts =
                typeof document !== "undefined" &&
                Boolean(
                  document.activeElement?.closest('[data-cds="Toast"]'),
                );
            if (
              !pinnedContext ||
              focusInsideToasts ||
              (frontToast?.id === matchingToast.id && !matchingToast.limited)
            ) {
              value.update(matchingToast.id, {
                ...(refreshedTitle !== undefined && {
                  title: refreshedTitle,
                }),
                description: description,
                ...(updatedTimeout !== undefined && {
                  timeout: updatedTimeout,
                }),
                data: updatedData,
              });
              pinnedContext?.syncLiveToasts(
                liveToasts.map((toast: ToastObject) =>
                  toast.id === matchingToast.id
                    ? {
                        ...toast,
                        data: updatedData,
                        timeout: updatedTimeout ?? toast.timeout,
                      }
                    : toast,
                ),
              );
              return matchingToast.id;
            }
            let remainingTimeout =
                updatedData.expiresAt === undefined
                  ? 0
                  : Math.max(updatedData.expiresAt - now, 1),
              movedTimeout = updatedTimeout ?? (wasPersistent ? 0 : Math.max(remainingTimeout, 6000)),
              movedToast = {
                ...matchingToast,
                title: refreshedTitle ?? matchingToast.title,
                description: description,
                timeout: movedTimeout,
                limited: false,
                data: {
                  ...updatedData,
                  expiresAt: callback(movedTimeout),
                },
              };
            pinnedContext.movingIds.add(matchingToast.id);
            value.close(matchingToast.id);
            pinnedContext.movingIds.delete(matchingToast.id);
            value.add({
              id: movedToast.id,
              title: movedToast.title,
              description: description,
              type: movedToast.type,
              priority: movedToast.priority,
              timeout: movedTimeout,
              onClose: movedToast.onClose,
              data: movedToast.data,
            });
            pinnedContext.syncLiveToasts([
              movedToast,
              ...pinnedContext.liveToasts.current.filter(
                (toast: ToastObject) => toast.id !== matchingToast.id,
              ),
            ]);
            return matchingToast.id;
          }
        }
        let hasAction = Boolean(action),
          reservedId = pinnedContext?.allocId(),
          resolvedTimeout = hasAction ? 0 : normalizeToastTimeout(timeout),
          toastData = {
            variant: resolvedVariant,
            icon: icon,
            action: action,
            ...state,
            dedupeKey: resolvedDedupeKey,
            count: 1,
            expiresAt: callback(resolvedTimeout),
          },
          addOptions: import("@base-ui/react/toast").ToastManagerAddOptions<ToastData> =
            {
              id: reservedId,
              title: hasTextTitle ? title : undefined,
              description: description,
              type: resolvedVariant,
              timeout: resolvedTimeout,
              onClose: () => {
                if (reservedId === undefined || !pinnedContext) {
                  onClose?.({
                    byUser: false,
                  });
                  return;
                }
                if (pinnedContext.movingIds.has(reservedId)) {
                  return;
                }
                pinnedContext.syncLiveToasts(
                  pinnedContext.liveToasts.current.map((toast: ToastObject) =>
                    toast.id === reservedId
                      ? {
                          ...toast,
                          transitionStatus: "ending",
                        }
                      : toast,
                  ),
                );
                let entry = pinnedContext.userDismissAt.get(reservedId);
                pinnedContext.userDismissAt.delete(reservedId);
                onClose?.({
                  byUser:
                    entry !== undefined &&
                    Date.now() - entry < TOAST_TRANSITION_TIMEOUT_MS,
                });
              },
              priority: resolvedVariant === "danger" ? "high" : "low",
              data: toastData,
            },
          toastId = value.add(addOptions);
        pinnedContext?.syncLiveToasts([
          {
            ...addOptions,
            id: toastId,
          },
          ...pinnedContext.liveToasts.current,
        ]);
        return toastId;
      },
      [value, pinnedContext],
    ),
    close: value.close,
    setPinned: pinnedContext?.setPinned ?? noopToastPinSetter,
  };
}
export {
  containsVisibleFocus,
  createToastMovementState,
  DEFAULT_TOAST_TIMEOUT_MS,
  emptyToastList,
  jsxForUiToast,
  noopToastPinSetter,
  normalizeToastTimeout,
  pinnedToastContext,
  PinnedToastSlot,
  PinnedToastView,
  reactForUiToast,
  TOAST_TRANSITION_TIMEOUT_MS,
  toastBodyClasses,
  toastContentClasses,
  toastDefaultIconNames,
  toastDismissButtonClasses,
  ToastProvider,
  toastSecondaryTextClasses,
  toastStackTransformClasses,
  toastSurfaceClasses,
  toastVariantClasses,
  toastVariantTextClasses,
  ToastView,
  ToastViewport,
  useToastNotifications,
};
export function installUiToast(): () => void {
  return () => {
    initializeIsomorphicLayoutEffect();
    initializeClassNames();
    initializeTranslations();
    initializeLayers();
    initializePortalRoot();
    initializeIcons();
    initializeSurfaces();
    reactForUiToast = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiToast = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    DEFAULT_TOAST_TIMEOUT_MS = 6000;
    TOAST_TRANSITION_TIMEOUT_MS = 1000;
    toastSurfaceClasses = getSurfaceClasses("popover");
    toastVariantClasses = {
      neutral: "shadow-panel-md",
      warning:
        "shadow-ring-warning [background-image:linear-gradient(0deg,var(--cds-bg-warning),var(--cds-bg-warning))]",
      danger:
        "shadow-ring-danger [background-image:linear-gradient(0deg,var(--cds-bg-danger),var(--cds-bg-danger))]",
    };
    toastVariantTextClasses = {
      neutral: "text-primary",
      warning: "text-warning",
      danger: "text-danger",
    };
    toastDefaultIconNames = {
      neutral: "Info",
      warning: "Warning",
      danger: "WarningCircle",
    };
    toastSecondaryTextClasses = {
      neutral: "text-secondary",
      warning: "",
      danger: "",
    };
    toastStackTransformClasses =
      "absolute w-full bottom-0 right-0 origin-bottom [--ty:calc(var(--toast-index)_*_-14px)] [--ts:calc(1_-_var(--toast-index)_*_0.04)] [transform:translateY(var(--ty))_scale(var(--ts))] transition-[transform,opacity] duration-base ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:[--ty:100%] data-[ending-style]:opacity-0 data-[ending-style]:[--ts:0.85] data-[limited]:opacity-0";
    toastContentClasses =
      "flex items-start gap-sm px-lg py-md overflow-hidden rounded-[inherit] text-body font-normal transition-[opacity,visibility] duration-base ease-out motion-reduce:transition-none data-[behind]:invisible data-[behind]:opacity-0";
    toastBodyClasses = "min-w-0 flex-1 text-pretty break-words";
    toastDismissButtonClasses =
      "cds-reset -mx-1 -mb-1 -mt-0.5 shrink-0 rounded p-1 outline-none focus-visible:outline-hidden transition duration-fast hover:bg-fill-ghost-hover focus-visible:shadow-focus";
    emptyToastList = [];
    pinnedToastContext =
      reactForUiToast.createContext<PinnedToastContext | null>(null);
    noopToastPinSetter = () => {
      return;
    };
  };
}
