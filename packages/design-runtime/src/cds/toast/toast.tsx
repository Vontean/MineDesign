import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon, initializeIconSizeMetrics, popupSurfaceClassName } from "../components/icon";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { CdsLayer, GLOBAL_LAYER_BASE, initializeOverlaysLayers } from "../overlays/layers";
import { initializeRootFontSizeHooks, PopupSurface } from "../platform/root-font-size";
import { initializeLabelsProviderContext, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeThemeSurfaces, surfaceBackgroundTokens } from "../theme/surfaces";
import { initializeNpm__base_ui_react_oet, load_react, load_react_jsx_runtime, npm_Toast_Ty } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactToastToast: Dynamic;
var jsxToastToast: Dynamic;
var ToastToastConstant: Dynamic;
var ToastToastLimit: Dynamic;
var popupSurfaceClassNameValue: Dynamic;
var ToastToastNeutralWarningDangerConfig: Dynamic;
var toastVariantTextClasses: Dynamic;
var toastVariantIconNames: Dynamic;
var toastVariantIconClasses: Dynamic;
var toastViewportClasses: Dynamic;
var ToastToastClassNames: Dynamic;
var toastMessageClassName: Dynamic;
var toastCloseButtonClassName: Dynamic;
var ToastToastItems: Dynamic;
var ToastContext: Dynamic;
var ToastToastHandler: Dynamic;
var initializeToastToast: Dynamic;
function normalizeToastTimeout(timeoutMs?: Dynamic): Dynamic {
  return timeoutMs === undefined || timeoutMs <= 0
    ? timeoutMs
    : Number.isFinite(timeoutMs)
      ? timeoutMs < 6e3
        ? ToastToastConstant
        : timeoutMs
      : 0;
}
function ToastCard({
  toast: toast,
  front: front,
  frontHeight: frontHeight,
  zIndex: zIndex,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = toast.data?.variant ?? toast.type ?? "neutral",
    icon: Dynamic = toast.data?.icon,
    hasCustomIcon: Dynamic = icon != null && typeof icon != "boolean",
    isBehind: Dynamic = !front,
    lockedHeightFromFront: Dynamic = isBehind && frontHeight ? frontHeight : undefined,
    dismissLabel: Dynamic = useLabel("dismiss", "Dismiss"),
    { update: updateToast }: Dynamic = npm_Toast_Ty.useToastManager(),
    toastContext: Dynamic = (0, reactToastToast.useContext)(ToastContext),
    titleRef: Dynamic = (0, reactToastToast.useRef)(null),
    lastTitleRef: Dynamic = (0, reactToastToast.useRef)(""),
    titleNode: Dynamic = toast.data?.titleNode,
    count: Dynamic = toast.data?.count ?? 1,
    id: Dynamic = toast.id,
    callback: Dynamic = (): Dynamic => {
      let userDismissAt: Dynamic = toastContext?.userDismissAt,
        now: Dynamic = Date.now();
      for (let [dismissedId, dismissedAt] of (userDismissAt ?? []) as Dynamic)
        now - dismissedAt > ToastToastLimit && userDismissAt?.delete(dismissedId);
      userDismissAt?.set(id, now);
    };
  (0, reactToastToast.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = titleRef.current;
    if (titleNode === undefined || !current) return;
    let syncTitle: Dynamic = (): Dynamic => {
      let titleText: Dynamic = current.textContent ?? "";
      titleText !== lastTitleRef.current &&
        ((lastTitleRef.current = titleText),
        updateToast(id, {
          title: titleText,
        }));
    };
    syncTitle();
    let observer: Dynamic = new MutationObserver(syncTitle);
    observer.observe(current, {
      characterData: true,
      childList: true,
      subtree: true,
    });
    return (): Dynamic => observer.disconnect();
  }, [titleNode, id, updateToast]);
  let isEnding: Dynamic = toast.transitionStatus === "ending",
    [frozenState, setFrozenState]: Dynamic = (0, reactToastToast.useState)({
      behind: isBehind,
      lockedHeight: lockedHeightFromFront,
    });
  !isEnding &&
    (frozenState.behind !== isBehind || frozenState.lockedHeight !== lockedHeightFromFront) &&
    setFrozenState({
      behind: isBehind,
      lockedHeight: lockedHeightFromFront,
    });
  let effectiveBehind: Dynamic = isEnding ? frozenState.behind : isBehind,
    effectiveHeight: Dynamic = isEnding ? frozenState.lockedHeight : lockedHeightFromFront;
  return (
    <npm_Toast_Ty.Root
      toast={toast}
      swipeDirection={ToastToastItems}
      className={toastViewportClasses}
      style={{
        zIndex: zIndex,
      }}
      onKeyDown={(event?: Dynamic): Dynamic => {
        event.key === "Escape" &&
          event.currentTarget.contains(
            event.currentTarget.ownerDocument.activeElement,
          ) &&
          callback();
      }}
    >
      <div
        className={`${popupSurfaceClassNameValue} ${ToastToastNeutralWarningDangerConfig[value]} ${toastVariantTextClasses[value]}`}
      >
        <div
          className={ToastToastClassNames}
          data-behind={effectiveBehind ? "" : undefined}
          style={
            effectiveHeight !== undefined
              ? {
                  height: effectiveHeight,
                }
              : undefined
          }
        >
          {icon !== null && (<span
              className={`shrink-0 ${toastVariantIconClasses[value]}`}
            >
              {hasCustomIcon ? (icon) : (<Icon
                  name={toastVariantIconNames[value]}
                  size={"md"}
                />)}
            </span>)}
          <div className={toastMessageClassName}>
            <npm_Toast_Ty.Title
              className={"font-medium"}
              aria-atomic={"true"}
            >
              <span ref={titleRef}>{titleNode ?? (toast.data?.baseTitle)}</span>
              {count > 1 && (<span
                  aria-live={count > 2 ? "off" : undefined}
                  data-cds-toast-count={""}
                >{` (\xD7${count})`}</span>)}
            </npm_Toast_Ty.Title>
            <npm_Toast_Ty.Description />
            {toast.data?.action && (<div className={"mt-pad-md"}>{toast.data.action}</div>)}
          </div>
          <npm_Toast_Ty.Close
            aria-label={dismissLabel}
            className={toastCloseButtonClassName}
            onClick={callback}
          >
            <Icon name={"X"} size={"sm"} />
          </npm_Toast_Ty.Close>
        </div>
      </div>
    </npm_Toast_Ty.Root>
  );
}
function PinnedToastCard({
  pinned: pinned,
  onDismiss: onDismiss,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = pinned.variant ?? "neutral",
    dismissLabel: Dynamic = useLabel("dismiss", "Dismiss");
  return (
    <div
      data-pinned={""}
      className={`pointer-events-auto relative w-full ${popupSurfaceClassNameValue} ${ToastToastNeutralWarningDangerConfig[value]} ${toastVariantTextClasses[value]}`}
    >
      <div className={ToastToastClassNames}>
        <span
          className={`shrink-0 ${toastVariantIconClasses[value]}`}
        >
          <Icon
            name={toastVariantIconNames[value]}
            size={"md"}
          />
        </span>
        <div className={toastMessageClassName}>
          <div className={"font-medium"}>{pinned.title}</div>
          {pinned.description && (<div>{pinned.description}</div>)}
          {pinned.action && (<div className={"mt-pad-md"}>{pinned.action}</div>)}
        </div>
        {pinned.dismissible && (<button
            type={"button"}
            aria-label={pinned.dismissLabel ?? (dismissLabel)}
            onClick={onDismiss}
            className={toastCloseButtonClassName}
          >
            <Icon name={"X"} size={"sm"} />
          </button>)}
      </div>
    </div>
  );
}
function isToastKeyboardFocused(slotElement?: Dynamic): Dynamic {
  let value: Dynamic = slotElement?.ownerDocument.activeElement;
  if (!slotElement || !value || !slotElement.contains(value)) return false;
  try {
    return value.matches(":focus-visible");
  } catch {
    return true;
  }
}
function PinnedToastFocusManager({ ctx: ctx }: Dynamic): Dynamic {
  useUiLocale();
  let {
      pinned: value,
      setPinned: setPinned,
      slotRef: slotRef,
      focusWasInsideRef: focusWasInsideRef,
    }: Dynamic = ctx,
    lastExternalFocusRef: Dynamic = (0, reactToastToast.useRef)(null);
  (0, reactToastToast.useEffect)((): Dynamic => {
    let current: Dynamic = slotRef.current;
    if (!current) return;
    let ownerDocument: Dynamic = current.ownerDocument,
      callback: Dynamic = (event?: Dynamic): Dynamic => {
        let target: Dynamic = event.target;
        target &&
          typeof target.focus == "function" &&
          !current.contains(target) &&
          (lastExternalFocusRef.current = target);
      };
    ownerDocument.addEventListener("focusin", callback);
    return (): Dynamic =>
      ownerDocument.removeEventListener("focusin", callback);
  }, [slotRef]);
  (0, reactToastToast.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = slotRef.current;
    if (
      !current ||
      !focusWasInsideRef.current ||
      ((focusWasInsideRef.current = false),
      current.contains(current.ownerDocument.activeElement))
    )
      return;
    let previousFocus: Dynamic = lastExternalFocusRef.current;
    previousFocus?.isConnected &&
      previousFocus.focus({
        preventScroll: true,
      });
  }, [value, slotRef, focusWasInsideRef]);
  return (
    <div
      ref={(element?: Dynamic): Dynamic => {
        slotRef.current = element;
      }}
      role={"status"}
      className={value ? "w-full" : "sr-only"}
      onKeyDown={(event?: Dynamic): Dynamic => {
        event.key === "Escape" &&
          !event.defaultPrevented &&
          !event.nativeEvent.isComposing &&
          value?.dismissible &&
          event.currentTarget.contains(
            event.currentTarget.ownerDocument.activeElement,
          ) &&
          setPinned(null);
      }}
    >
      {value && (<PinnedToastCard
          pinned={value}
          onDismiss={(): Dynamic => setPinned(null)}
        />)}
    </div>
  );
}
function ToastViewport({ className: className }: Dynamic): Dynamic {
  useUiLocale();
  let { toasts: value }: Dynamic = npm_Toast_Ty.useToastManager(),
    toastContext: Dynamic = (0, reactToastToast.useContext)(ToastContext);
  useIsomorphicLayoutEffect((): Dynamic => {
    toastContext?.syncLiveToasts(value);
  }, [value, toastContext]);
  let frontToast: Dynamic = value.find(
    (toast?: Dynamic): Dynamic => toast.transitionStatus !== "ending",
  );
  return (
    <npm_Toast_Ty.Portal>
      <PopupSurface surface={surfaceBackgroundTokens.popover}>
        <CdsLayer
          base={GLOBAL_LAYER_BASE}
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
          {toastContext && (<PinnedToastFocusManager ctx={toastContext} />)}
          <npm_Toast_Ty.Viewport
            className={
              "pointer-events-auto relative outline-none focus-visible:outline-hidden"
            }
            style={{
              height: frontToast?.height,
            }}
          >
            {value.map(
              (toast?: Dynamic, index?: Dynamic): Dynamic =>
                (() => {
                  const _Component = ToastCard;
                  const _props = {
                    toast: toast,
                    front: toast === frontToast,
                    frontHeight: frontToast?.height,
                    zIndex: value.length - index,
                  } as const;
                  const _key = toast.id;
                  return <_Component key={_key} {..._props} />;
                })(),
            )}
          </npm_Toast_Ty.Viewport>
        </CdsLayer>
      </PopupSurface>
    </npm_Toast_Ty.Portal>
  );
}
function createToastMoveState(): Dynamic {
  let index: Dynamic = 0;
  return {
    allocId: (): Dynamic => `cds-toast-${++index}`,
    movingIds: new Set(),
    userDismissAt: new Map(),
  };
}
function ToastProvider({
  children: children,
  timeout = ToastToastConstant,
  limit: limit,
  viewportClassName: viewportClassName,
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, setPinnedState]: Dynamic = (0, reactToastToast.useState)(null),
    pinnedRef: Dynamic = (0, reactToastToast.useRef)(value),
    slotRef: Dynamic = (0, reactToastToast.useRef)(null),
    focusWasInsideRef: Dynamic = (0, reactToastToast.useRef)(false),
    setPinned: Dynamic = (0, reactToastToast.useCallback)(
      (nextPinned?: Dynamic): Dynamic => {
        let current: Dynamic = pinnedRef.current;
        pinnedRef.current = nextPinned;
        current !== nextPinned &&
          !focusWasInsideRef.current &&
          (focusWasInsideRef.current = isToastKeyboardFocused(slotRef.current));
        setPinnedState(nextPinned);
        current && current !== nextPinned && current.onClose?.();
      },
      [],
    ),
    liveToastsRef: Dynamic = (0, reactToastToast.useRef)([]),
    syncLiveToasts: Dynamic = (0, reactToastToast.useCallback)(
      (toasts?: Dynamic): Dynamic => {
        liveToastsRef.current = toasts;
      },
      [],
    ),
    [moveState]: Dynamic = (0, reactToastToast.useState)(createToastMoveState),
    defaultTimeout: Dynamic = (0, reactToastToast.useMemo)(
      (): Dynamic => normalizeToastTimeout(timeout),
      [timeout],
    ),
    contextValue: Dynamic = (0, reactToastToast.useMemo)(
      (): Dynamic => ({
        pinned: value,
        setPinned: setPinned,
        slotRef: slotRef,
        focusWasInsideRef: focusWasInsideRef,
        liveToasts: liveToastsRef,
        syncLiveToasts: syncLiveToasts,
        defaultTimeout: defaultTimeout,
        ...moveState,
      }),
      [value, setPinned, syncLiveToasts, defaultTimeout, moveState],
    );
  return (
    <npm_Toast_Ty.Provider timeout={defaultTimeout} limit={limit}>
      <ToastContext.Provider value={contextValue}>
        {children}
        <ToastViewport className={viewportClassName} />
      </ToastContext.Provider>
    </npm_Toast_Ty.Provider>
  );
}
function useToastManager(): Dynamic {
  let value: Dynamic = npm_Toast_Ty.useToastManager(),
    toastContext: Dynamic = (0, reactToastToast.useContext)(ToastContext);
  return {
    add: (0, reactToastToast.useCallback)(
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
      }: Dynamic): Dynamic => {
        let toastVariant: Dynamic = variant ?? "neutral",
          hasStringTitle: Dynamic = typeof title == "string",
          dedupeId: Dynamic = dedupeKey ?? (hasStringTitle ? title : undefined),
          state: Dynamic = {
            titleNode: hasStringTitle ? undefined : title,
            baseTitle: hasStringTitle ? title : undefined,
          },
          createdAt: Dynamic = Date.now(),
          callback: Dynamic = (timeoutMs?: Dynamic): Dynamic => {
            let effectiveTimeout: Dynamic = timeoutMs ?? toastContext?.defaultTimeout;
            return effectiveTimeout !== undefined && effectiveTimeout > 0
              ? createdAt + effectiveTimeout
              : undefined;
          };
        if (dedupe && dedupeId !== undefined) {
          let liveToasts: Dynamic = toastContext?.liveToasts.current ?? value.toasts,
            existingToast: Dynamic = liveToasts.find(
              (toast?: Dynamic): Dynamic =>
                toast.data?.dedupeKey === dedupeId &&
                toast.transitionStatus !== "ending",
            );
          if (existingToast) {
            let nextCount: Dynamic = (existingToast.data?.count ?? 1) + 1,
              nextAction: Dynamic = action ?? existingToast.data?.action,
              isPersistent: Dynamic =
                !!existingToast.data?.action ||
                (existingToast.timeout ?? toastContext?.defaultTimeout) === 0,
              normalizedTimeout: Dynamic =
                timeout === undefined
                  ? undefined
                  : normalizeToastTimeout(timeout),
              nextTimeout: Dynamic = nextAction ? 0 : isPersistent ? undefined : normalizedTimeout,
              updatedData: Dynamic = {
                ...existingToast.data,
                ...state,
                variant: variant ?? existingToast.data?.variant,
                ...(icon !== undefined && {
                  icon: icon,
                }),
                action: nextAction,
                count: nextCount,
                ...(nextTimeout !== undefined && {
                  expiresAt: callback(nextTimeout),
                }),
              },
              baseTitle: Dynamic = hasStringTitle ? title : existingToast.title,
              nextTitle: Dynamic =
                nextCount === 2 && typeof baseTitle == "string"
                  ? `${baseTitle} (\xD72)`
                  : hasStringTitle && title !== existingToast.data?.baseTitle
                    ? title
                    : undefined,
              frontToast: Dynamic = liveToasts.find(
                (toast?: Dynamic): Dynamic =>
                  toast.transitionStatus !== "ending",
              ),
              isFocusInsideToast: Dynamic =
                typeof document !== "undefined" &&
                !!(document as Dynamic).activeElement?.closest(
                  '[data-cds="Toast"]',
                );
            if (
              !toastContext ||
              isFocusInsideToast ||
              (frontToast?.id === existingToast.id && !existingToast.limited)
            ) {
              value.update(existingToast.id, {
                ...(nextTitle !== undefined && {
                  title: nextTitle,
                }),
                description: description,
                ...(nextTimeout !== undefined && {
                  timeout: nextTimeout,
                }),
                data: updatedData,
              });
              toastContext?.syncLiveToasts(
                liveToasts.map(
                  (toast?: Dynamic): Dynamic =>
                    toast.id === existingToast.id
                      ? {
                          ...toast,
                          data: updatedData,
                          timeout: nextTimeout ?? toast.timeout,
                        }
                      : toast,
                ),
              );
              return existingToast.id;
            }
            let remainingMs: Dynamic =
                updatedData.expiresAt === undefined
                  ? 0
                  : Math.max(updatedData.expiresAt - createdAt, 1),
              restartTimeout: Dynamic =
                nextTimeout ?? (isPersistent ? 0 : Math.max(remainingMs, 6e3)),
              restartedToast: Dynamic = {
                ...existingToast,
                title: nextTitle ?? existingToast.title,
                description: description,
                timeout: restartTimeout,
                limited: false,
                data: {
                  ...updatedData,
                  expiresAt: callback(restartTimeout),
                },
              };
            toastContext.movingIds.add(existingToast.id);
            value.close(existingToast.id);
            toastContext.movingIds.delete(existingToast.id);
            value.add({
              id: restartedToast.id,
              title: restartedToast.title,
              description: description,
              type: restartedToast.type,
              priority: restartedToast.priority,
              timeout: restartTimeout,
              onClose: restartedToast.onClose,
              data: restartedToast.data,
            });
            toastContext.syncLiveToasts([
              restartedToast,
              ...toastContext.liveToasts.current.filter(
                (toast?: Dynamic): Dynamic => toast.id !== existingToast.id,
              ),
            ]);
            return existingToast.id;
          }
        }
        let hasAction: Dynamic = !!action,
          toastId: Dynamic = toastContext?.allocId(),
          toastTimeout: Dynamic = hasAction ? 0 : normalizeToastTimeout(timeout),
          toastData: Dynamic = {
            variant: toastVariant,
            icon: icon,
            action: action,
            ...state,
            dedupeKey: dedupeId,
            count: 1,
            expiresAt: callback(toastTimeout),
          },
          toastOptions: Dynamic = {
            id: toastId,
            title: hasStringTitle ? title : undefined,
            description: description,
            type: toastVariant,
            timeout: toastTimeout,
            onClose: (): Dynamic => {
              if (toastId === undefined || !toastContext) {
                onClose?.({
                  byUser: false,
                });
                return;
              }
              if (toastContext.movingIds.has(toastId)) return;
              toastContext.syncLiveToasts(
                toastContext.liveToasts.current.map(
                  (toast?: Dynamic): Dynamic =>
                    toast.id === toastId
                      ? {
                          ...toast,
                          transitionStatus: "ending",
                        }
                      : toast,
                ),
              );
              let entry: Dynamic = toastContext.userDismissAt.get(toastId);
              toastContext.userDismissAt.delete(toastId);
              onClose?.({
                byUser:
                  entry !== undefined && Date.now() - entry < ToastToastLimit,
              });
            },
            priority: toastVariant === "danger" ? "high" : "low",
            data: toastData,
          },
          addedId: Dynamic = value.add(toastOptions);
        toastContext?.syncLiveToasts([
          {
            ...toastOptions,
            id: addedId,
          },
          ...toastContext.liveToasts.current,
        ]);
        return addedId;
      },
      [value, toastContext],
    ),
    close: value.close,
    setPinned: toastContext?.setPinned ?? ToastToastHandler,
  };
}
export {
  createToastMoveState,
  initializeToastToast,
  isToastKeyboardFocused,
  jsxToastToast,
  normalizeToastTimeout,
  PinnedToastCard,
  PinnedToastFocusManager,
  popupSurfaceClassNameValue,
  reactToastToast,
  ToastCard,
  ToastContext,
  ToastProvider,
  ToastToastClassNames,
  toastMessageClassName,
  toastCloseButtonClassName,
  ToastToastConstant,
  ToastToastHandler,
  ToastToastItems,
  ToastToastLimit,
  ToastToastNeutralWarningDangerConfig,
  ToastViewport,
  toastViewportClasses,
  useToastManager,
};
export function installCdsToastToast(): () => void {
  return () => {
    initializeToastToast = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeClassNames();
      initializeLabelsProviderContext();
      initializeOverlaysLayers();
      initializeRootFontSizeHooks();
      initializeIconSizeMetrics();
      initializeThemeSurfaces();
      reactToastToast = toModuleNamespace(
        load_react(),
      );
      jsxToastToast = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_oet();
      ToastToastConstant = 6e3;
      ToastToastLimit = 1e3;
      popupSurfaceClassNameValue = popupSurfaceClassName(
        "popover",
      );
      ToastToastNeutralWarningDangerConfig = {
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
      toastVariantIconNames = {
        neutral: "Info",
        get warning() { return uiMessage("canvas.toast.warning"); },
        danger: "WarningCircle",
      };
      toastVariantIconClasses = {
        neutral: "text-secondary",
        warning: "",
        danger: "",
      };
      toastViewportClasses =
        "absolute w-full bottom-0 right-0 origin-bottom [--ty:calc(var(--toast-index)_*_-14px)] [--ts:calc(1_-_var(--toast-index)_*_0.04)] [transform:translateY(var(--ty))_scale(var(--ts))] transition-[transform,opacity] duration-base ease-out motion-reduce:transition-none data-[starting-style]:opacity-0 data-[starting-style]:[--ty:100%] data-[ending-style]:opacity-0 data-[ending-style]:[--ts:0.85] data-[limited]:opacity-0";
      ToastToastClassNames =
        "flex items-start gap-sm px-lg py-md overflow-hidden rounded-[inherit] text-body font-normal transition-[opacity,visibility] duration-base ease-out motion-reduce:transition-none data-[behind]:invisible data-[behind]:opacity-0";
      toastMessageClassName = "min-w-0 flex-1 text-pretty break-words";
      toastCloseButtonClassName =
        "cds-reset -mx-1 -mb-1 -mt-0.5 shrink-0 rounded p-1 outline-none focus-visible:outline-hidden transition duration-fast hover:bg-fill-ghost-hover focus-visible:shadow-focus";
      ToastToastItems = [];
      ToastContext = (0, reactToastToast.createContext)(null);
      ToastToastHandler = (): Dynamic => {};
    });
  };
}
