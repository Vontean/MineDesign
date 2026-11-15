import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type {
  CollisionPadding,
  DisabledTooltipProps,
  EmptyTooltipContent,
  ForwardComponent,
  OverflowTooltipProps,
  PolymorphicTooltipTrigger,
  TooltipBodyState,
  TooltipBodyUpdate,
  TooltipImplementation,
  TooltipInstantActions,
  TooltipProps,
  TooltipTriggerProps,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { CollisionPaddingProvider, initializeComponentsIcon_3 } from "../components/icon";
import { initializeComponentsShortcut, Shortcut } from "../components/shortcut";
import { initializeComponentsShrinkWrap_2, useShrinkWrap } from "../components/shrink-wrap";
import { initializeDomInputObservation, isRestoredFocus } from "../dom/input-observation";
import { initializeDomRefComposition, useMergedRefs } from "../dom/ref-composition";
import { initializeHooksStableCallback_2, useOptionalStableCallback } from "../hooks/stable-callback";
import { initializeOverlaysLayers, LayerBaseContext, useDefaultLayer } from "../overlays/layers";
import { initializePlatformRootFontSize_2, PopupSurface } from "../platform/root-font-size";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeCdsRoot, useOverlayRoot } from "../theme/root";
import { DisabledReasonDescription, disabledReasonWrapperProps, hasDisabledReason, initializeTooltipDisabledReason } from "./disabled-reason";
import { DarkScope, initializeTooltipStyles, tooltipImplementationExports, tooltipPopupClasses, TooltipStylesCss, TooltipStylesCss_2, TooltipStylesLabel_2 } from "./styles";
import { initializeTooltipTrigger, initializeTooltipTrigger_3, initializeTooltipTrigger_4, measureContentRect, TooltipImplementationContext, TooltipTriggerContext, useTooltipDelay, useTooltipTrigger } from "./trigger";
import { initializeNpm__base_ui_react_V8e, load_react, load_react_jsx_runtime, npm_Tooltip_Ax } from "../../dependencies";
import { defineLiveExports, initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactTooltipTooltip: typeof React;
var jsxTooltipTooltip: typeof import("react/jsx-runtime");
var TooltipTooltipCurrentState: React.RefObject<TooltipInstantActions> | null;
var emptyTooltipContent: EmptyTooltipContent;
var TooltipTooltipOpenBodyConfig: TooltipBodyState;
var TooltipTooltipOpen: TooltipBodyUpdate;
var TooltipTooltipOpen_2: TooltipBodyUpdate;
var TooltipTooltipBody: TooltipBodyUpdate;
var TooltipTooltipOpen_3: (input: React.ReactNode) => TooltipBodyUpdate;
var TooltipTooltipIs: (input: React.ReactNode) => TooltipBodyUpdate;
var TooltipTooltipOpen_4: TooltipBodyUpdate;
var TooltipStylesCssAlias: string;
var TooltipTooltipClassNames: string;
var TooltipTooltipAlias: string;
var TooltipTooltipClassNames_2: string;
var SelfStartValue: string;
var TooltipTooltipCss: string;
var OverflowTooltip: ForwardComponent<HTMLSpanElement, OverflowTooltipProps>;
var TooltipTooltipTooltipDisabledReasonTooltipConfig: Pick<
  TooltipImplementation,
  "Tooltip" | "DisabledReasonTooltip"
>;
var TooltipTooltipContext: React.Context<boolean>;
var initializeTooltipTooltip: () => void;
function cancelRestoredTooltipFocus(
  input: boolean,
  options: import("@base-ui/react/tooltip").Tooltip.Root.ChangeEventDetails,
): boolean {
  return input &&
    options.reason === "trigger-focus" &&
    (0, isRestoredFocus)(options.event)
    ? (options.cancel(), true)
    : false;
}
function activateTooltip(
  input: React.RefObject<TooltipInstantActions>,
): void {
  TooltipTooltipCurrentState !== null &&
    TooltipTooltipCurrentState !== input &&
    TooltipTooltipCurrentState.current?.closeInstant();
  TooltipTooltipCurrentState = input;
}
function isEmptyTooltipContent(input: React.ReactNode): boolean {
  return (
    input == null ||
    input === "" ||
    typeof input == "boolean" ||
    (Array.isArray(input) && input.every(isEmptyTooltipContent))
  );
}
function resolveTooltipContent(
  input: () => React.ReactNode,
): React.ReactNode | EmptyTooltipContent {
  let value = input();
  return isEmptyTooltipContent(value as React.ReactNode)
    ? emptyTooltipContent
    : value;
}
function TooltipShortcut({
  keys: keys,
  className: className,
}: {
  keys?: string | readonly string[];
  className?: string;
}): React.ReactElement {
  useUiLocale();
  return (
    <Shortcut
      keys={keys}
      variant={"text"}
      className={(0, cn)(
        "text-[calc(0.75rem*var(--cds-rem-scale,1))] [--cds-shortcut-cap-ink:var(--cds-text-muted)]",
        className,
      )}
    />
  );
}
function Tooltip({
  content: content,
  detail: detail,
  secondaryHint: secondaryHint,
  multiline: multiline,
  shortcut: shortcut,
  side = "top",
  align: align,
  sideOffset = 4,
  collisionPadding: collisionPadding,
  trackCursorAxis: trackCursorAxis,
  delay = 300,
  open: open,
  onOpenChange: onOpenChange,
  closeDelay: closeDelay,
  hoverable = true,
  closeOnClick: closeOnClick,
  lazy = false,
  openOnHandedBackFocus = false,
  triggerRef: triggerRef,
  container: container,
  className: className,
  children: children,
}: TooltipProps): React.ReactElement {
  useUiLocale();
  let value = (0, useOverlayRoot)(),
    value2 = (0, useShrinkWrap)({
      immediate: true,
    }),
    value3 = (0, reactTooltipTooltip.useId)(),
    value4 = (0, reactTooltipTooltip.useRef)<
      import("@base-ui/react/tooltip").Tooltip.Root.Actions | null
    >(null),
    [value5, value6] = (0, reactTooltipTooltip.useState)(false),
    value7: React.RefObject<TooltipInstantActions> = (0,
    reactTooltipTooltip.useRef)({
      closeInstant: () => {
        value6(true);
        value4.current?.close();
      },
    }),
    [value8, value9] = (0, reactTooltipTooltip.useState)<Element | null>(
      null,
    ),
    [value10, value11] = (0, reactTooltipTooltip.useState)(
      TooltipTooltipOpenBodyConfig,
    );
  open === false && value10.open && value11(TooltipTooltipOpen_2);
  let value12 = typeof content == "function",
    value13 = value12 || !isEmptyTooltipContent(content as React.ReactNode),
    value14: React.ReactNode = (
      !value12 && value13 ? content : value10.body
    ) as React.ReactNode,
    value15 = !isEmptyTooltipContent(value14 as React.ReactNode),
    value16 = (open ?? value10.open) && (!value12 || value15);
  !value12 &&
    value13 &&
    value16 &&
    !Object.is(value10.body, content) &&
    value11(TooltipTooltipIs(content as React.ReactNode));
  let value17 = (0, reactTooltipTooltip.useCallback)(
      (
        input: boolean,
        options: import("@base-ui/react/tooltip").Tooltip.Root.ChangeEventDetails,
      ): boolean => {
        if (
          !openOnHandedBackFocus &&
          cancelRestoredTooltipFocus(input, options)
        )
          return false;
        if (input) {
          if (typeof content != "function")
            value11(TooltipTooltipOpen_3(content));
          else if (value16) value11(TooltipTooltipOpen);
          else {
            let value38 = resolveTooltipContent(content);
            if (value38 === emptyTooltipContent) {
              options.cancel();
              return false;
            }
            value11(TooltipTooltipOpen_3(value38));
          }
          value6(false);
          activateTooltip(value7);
        } else {
          value11(value16 ? TooltipTooltipOpen_2 : TooltipTooltipOpen_4);
          TooltipTooltipCurrentState === value7 &&
            (TooltipTooltipCurrentState = null);
        }
        value9(
          input && options.reason === "trigger-hover"
            ? (options.trigger ?? null)
            : null,
        );
        onOpenChange?.(input);
        return true;
      },
      [onOpenChange, openOnHandedBackFocus, content, value16],
    ),
    value18 = open !== undefined,
    open2 = value10.open;
  (0, reactTooltipTooltip.useEffect)(() => {
    if (!(!value18 || !value13 || !value15)) {
      open
        ? activateTooltip(value7)
        : TooltipTooltipCurrentState === value7 &&
          (TooltipTooltipCurrentState = null);
      return () => {
        !open2 &&
          TooltipTooltipCurrentState === value7 &&
          (TooltipTooltipCurrentState = null);
      };
    }
  }, [value18, open, value13, value15, open2, value12]);
  let value19 = (0, reactTooltipTooltip.useCallback)(
    (input: boolean): void => {
      input || (value6(false), value9(null), value11(TooltipTooltipBody));
    },
    [],
  );
  (0, reactTooltipTooltip.useEffect)(() => {
    if (!value8) return;
    let ownerDocument = value8.ownerDocument,
      callback = (event: Event): void => {
        let target = event.target;
        target &&
          target !== value8 &&
          (target as Node).contains(value8) &&
          value7.current.closeInstant();
      };
    ownerDocument.addEventListener("scroll", callback, {
      capture: true,
      passive: true,
    });
    return () => {
      ownerDocument.removeEventListener("scroll", callback, {
        capture: true,
      });
    };
  }, [value8]);
  (0, reactTooltipTooltip.useEffect)(
    () => () => {
      TooltipTooltipCurrentState === value7 &&
        (TooltipTooltipCurrentState = null);
    },
    [],
  );
  let value20 = (0, useDefaultLayer)("tooltip"),
    [value21] = (0, reactTooltipTooltip.useState)(() =>
      lazy && open === undefined
        ? npm_Tooltip_Ax.createHandle()
        : null,
    ),
    [value22, value23] = (0, reactTooltipTooltip.useState)(false),
    value24 = value22 || value21 === null,
    value25 = (0, reactTooltipTooltip.useRef)(false),
    value26 = (0, reactTooltipTooltip.useCallback)(() => {
      value25.current = true;
      value23(true);
    }, []),
    value27 = (0, useTooltipDelay)(),
    value28 = (0, reactTooltipTooltip.useRef)<HTMLElement | null>(null),
    value29 = (0, reactTooltipTooltip.useRef)(false);
  (0, reactTooltipTooltip.useEffect)(() => {
    open === false && (value29.current = false);
  }, [open]);
  let value30 = (0, useOptionalStableCallback)(() => {
      if (value25.current || value24 || !value13 || open !== undefined)
        return;
      let value38: React.ReactNode;
      if (typeof content == "function") {
        let value39 = resolveTooltipContent(content);
        if (value39 === emptyTooltipContent) return;
        value38 = value39;
      } else value38 = content;
      value26();
      value6(false);
      activateTooltip(value7);
      value9(value28.current);
      value11(TooltipTooltipOpen_3(value38));
      value29.current = true;
      onOpenChange?.(true);
    }),
    value31: (event: React.PointerEvent<HTMLElement>) => void = (0,
    useOptionalStableCallback)((input) => {
      value24 ||
        input.pointerType === "touch" ||
        (value13 &&
          ((value28.current = input.currentTarget),
          value27.start(delay, value30)));
    }),
    value32 = (0, useOptionalStableCallback)(() => {
      closeOnClick !== false && value27.cancel();
    }),
    value33: (event: React.FocusEvent<HTMLElement>) => void = (0,
    useOptionalStableCallback)((event) => {
      value24 ||
        ((event.target as Element).matches(":focus-visible") &&
          ((!openOnHandedBackFocus &&
            (0, isRestoredFocus)(event.nativeEvent)) ||
            ((value28.current = null), value27.cancel(), value30())));
    });
  value21 !== null && open === true && !value22 && value23(true);
  let value34 = (0, reactTooltipTooltip.useCallback)(
      (
        input: boolean,
        options: import("@base-ui/react/tooltip").Tooltip.Root.ChangeEventDetails,
      ): void => {
        if (
          !(
            !openOnHandedBackFocus &&
            cancelRestoredTooltipFocus(input, options)
          )
        ) {
          if (input && value29.current && value16) {
            value11(TooltipTooltipOpen);
            return;
          }
          value17(input, options) && (value29.current = input);
        }
      },
      [value17, openOnHandedBackFocus, value16],
    ),
    value35: import("@base-ui/react/tooltip").Tooltip.Trigger.Props<void>["render"] =
      (0, reactTooltipTooltip.isValidElement)(children) &&
      children.type !== reactTooltipTooltip.Fragment
        ? children
        : (input: TooltipTriggerProps): React.ReactElement => (
            <span {...input} className={"inline-flex"}>
              {children}
            </span>
          ),
    value36 = (() => {
      const _Component = npm_Tooltip_Ax
        .Trigger as PolymorphicTooltipTrigger;
      return (
        <_Component
          ref={triggerRef}
          id={value3}
          delay={delay}
          closeDelay={closeDelay}
          closeOnClick={closeOnClick}
          handle={value21 ?? undefined}
          disabled={value21 !== null && !value24 ? !value13 : undefined}
          onPointerEnter={value21 ? value31 : undefined}
          onPointerLeave={value21 ? value27.cancel : undefined}
          onPointerDown={value21 ? value32 : undefined}
          onFocus={value21 ? value33 : undefined}
          render={value35}
        />
      );
    })(),
    value37 =
      value24 && value15 ? (
        <npm_Tooltip_Ax.Portal container={container ?? value}>
          <PopupSurface>
            <CollisionPaddingProvider
              override={collisionPadding}
              container={container ?? value}
            >
              {(input: CollisionPadding) => (
                <LayerBaseContext.Provider value={value20.base}>
                  <npm_Tooltip_Ax.Positioner
                    data-cds={"Tooltip"}
                    className={"data-[anchor-hidden]:invisible"}
                    style={value20.style}
                    side={side}
                    align={align}
                    sideOffset={sideOffset}
                    collisionPadding={input}
                  >
                    <npm_Tooltip_Ax.Popup
                      ref={value2}
                      role={"tooltip"}
                      style={
                        value5
                          ? {
                              transitionDuration: "0s",
                            }
                          : undefined
                      }
                      className={(0, cn)(
                        TooltipStylesCssAlias,
                        TooltipTooltipAlias,
                        multiline || detail || secondaryHint
                          ? TooltipTooltipCss
                          : TooltipTooltipClassNames_2,
                        !shortcut && TooltipTooltipClassNames,
                        className,
                      )}
                    >
                      <DarkScope>
                        {multiline || detail || secondaryHint ? (<jsxTooltipTooltip.Fragment>
                            <span
                              className={
                                "inline-flex min-w-0 items-center gap-2"
                              }
                            >
                              <span className={TooltipStylesLabel_2}>
                                {value14}
                              </span>
                              {shortcut && (<TooltipShortcut keys={shortcut} />)}
                            </span>
                            {secondaryHint && (<span
                                className={
                                  "inline-flex min-w-0 items-center gap-2"
                                }
                              >
                                <span className={"min-w-0 break-words"}>
                                  {secondaryHint.label}
                                </span>
                                <TooltipShortcut
                                  keys={secondaryHint.shortcut}
                                />
                              </span>)}
                            {detail && (<span
                                className={
                                  "break-words text-[calc(0.6875rem*var(--cds-rem-scale,1))]/[calc(0.875rem*var(--cds-rem-scale,1))] text-secondary"
                                }
                              >
                                {detail}
                              </span>)}
                          </jsxTooltipTooltip.Fragment>) : (<jsxTooltipTooltip.Fragment>
                            <span className={TooltipStylesLabel_2}>
                              {value14}
                            </span>
                            {shortcut && (<TooltipShortcut
                                keys={shortcut}
                                className={SelfStartValue}
                              />)}
                          </jsxTooltipTooltip.Fragment>)}
                      </DarkScope>
                    </npm_Tooltip_Ax.Popup>
                  </npm_Tooltip_Ax.Positioner>
                </LayerBaseContext.Provider>
              )}
            </CollisionPaddingProvider>
          </PopupSurface>
        </npm_Tooltip_Ax.Portal>
      ) : null;
  return value21 ? (
    <jsxTooltipTooltip.Fragment>
      <TooltipImplementationContext.Provider
        value={TooltipTooltipTooltipDisabledReasonTooltipConfig}
      >
        <TooltipTriggerContext.Provider value={value13}>
          {value36}
        </TooltipTriggerContext.Provider>
      </TooltipImplementationContext.Provider>
      {value24 && (<npm_Tooltip_Ax.Root
          handle={value21}
          open={value16}
          disableHoverablePopup={!hoverable}
          trackCursorAxis={trackCursorAxis}
          disabled={!value13}
          actionsRef={value4}
          onOpenChange={value34}
          onOpenChangeComplete={value19}
          triggerId={value3}
        >
          {value37}
        </npm_Tooltip_Ax.Root>)}
    </jsxTooltipTooltip.Fragment>
  ) : (
    <npm_Tooltip_Ax.Root
      open={value16}
      disableHoverablePopup={!hoverable}
      trackCursorAxis={trackCursorAxis}
      disabled={!value13}
      actionsRef={value4}
      onOpenChange={value17}
      onOpenChangeComplete={value19}
      triggerId={value3}
    >
      <TooltipImplementationContext.Provider
        value={TooltipTooltipTooltipDisabledReasonTooltipConfig}
      >
        <TooltipTriggerContext.Provider value={value13}>
          {value36}
        </TooltipTriggerContext.Provider>
      </TooltipImplementationContext.Provider>
      {value37}
    </npm_Tooltip_Ax.Root>
  );
}
function DisabledReasonTooltip({
  reason: reason,
  side: side,
  align: align,
  sideOffset: sideOffset,
  multiline = true,
  delay: delay,
  collisionPadding: collisionPadding,
  hoverable: hoverable,
  className: className,
  wrapperClassName: wrapperClassName,
  children: children,
}: DisabledTooltipProps): React.ReactElement {
  useUiLocale();
  let value = (0, reactTooltipTooltip.useId)();
  return (
    <Tooltip
      content={(0, hasDisabledReason)(reason) ? reason : undefined}
      side={side}
      align={align}
      sideOffset={sideOffset}
      multiline={multiline}
      delay={delay}
      collisionPadding={collisionPadding}
      hoverable={hoverable}
      className={className}
      closeOnClick={false}
      openOnHandedBackFocus={true}
    >
      <span
        {...(0, disabledReasonWrapperProps)(
          reason,
          value,
          wrapperClassName,
        )}
      >
        {children}
        <DisabledReasonDescription id={value} reason={reason} />
      </span>
    </Tooltip>
  );
}
function TooltipImplProvider({
  children: children,
}: React.PropsWithChildren): React.ReactElement {
  useUiLocale();
  return (
    <TooltipImplementationContext.Provider
      value={TooltipTooltipTooltipDisabledReasonTooltipConfig}
    >
      {children}
    </TooltipImplementationContext.Provider>
  );
}
function useTooltipGroup(): boolean {
  return (0, reactTooltipTooltip.useContext)(TooltipTooltipContext);
}
function TooltipGroup({
  delay = 600,
  closeDelay = 200,
  children: children,
}: React.PropsWithChildren<{
  delay?: number;
  closeDelay?: number;
}>): React.ReactElement {
  useUiLocale();
  return (
    <TooltipTooltipContext.Provider value={true}>
      <npm_Tooltip_Ax.Provider delay={delay} closeDelay={closeDelay}>
        {children}
      </npm_Tooltip_Ax.Provider>
    </TooltipTooltipContext.Provider>
  );
}
export {
  activateTooltip,
  cancelRestoredTooltipFocus,
  DisabledReasonTooltip,
  emptyTooltipContent,
  initializeTooltipTooltip,
  isEmptyTooltipContent,
  jsxTooltipTooltip,
  OverflowTooltip,
  reactTooltipTooltip,
  resolveTooltipContent,
  SelfStartValue,
  Tooltip,
  TooltipGroup,
  TooltipImplProvider,
  TooltipShortcut,
  TooltipStylesCssAlias,
  TooltipTooltipAlias,
  TooltipTooltipBody,
  TooltipTooltipClassNames,
  TooltipTooltipClassNames_2,
  TooltipTooltipContext,
  TooltipTooltipCss,
  TooltipTooltipCurrentState,
  TooltipTooltipIs,
  TooltipTooltipOpen,
  TooltipTooltipOpen_2,
  TooltipTooltipOpen_3,
  TooltipTooltipOpen_4,
  TooltipTooltipOpenBodyConfig,
  TooltipTooltipTooltipDisabledReasonTooltipConfig,
  useTooltipGroup,
};
export function installCdsTooltipTooltip(): () => void {
  return () => {
    (0, defineLiveExports)(tooltipImplementationExports, {
      DisabledReasonTooltip: () => DisabledReasonTooltip,
      OverflowTooltip: () => OverflowTooltip,
      Tooltip: () => Tooltip,
      TooltipGroup: () => TooltipGroup,
      TooltipImplProvider: () => TooltipImplProvider,
      useTooltipGroup: () => useTooltipGroup,
      useTooltipTrigger: () => useTooltipTrigger,
    });
    initializeTooltipTooltip = (0, initializeOnce)(() => {
      "use client";

      (0, initializeDomInputObservation)();
      (0, initializeClassNames)();
      (0, initializeCdsRoot)();
      (0, initializeOverlaysLayers)();
      (0, initializeHooksStableCallback_2)();
      (0, initializeDomRefComposition)();
      (0, initializePlatformRootFontSize_2)();
      (0, initializeComponentsIcon_3)();
      (0, initializeTooltipTrigger_3)();
      (0, initializeTooltipTrigger_4)();
      (0, initializeComponentsShortcut)();
      (0, initializeComponentsShrinkWrap_2)();
      (0, initializeTooltipDisabledReason)();
      (0, initializeTooltipStyles)();
      (0, initializeTooltipTrigger)();
      reactTooltipTooltip = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      jsxTooltipTooltip = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
      (0, initializeNpm__base_ui_react_V8e)();
      TooltipTooltipCurrentState = null;
      emptyTooltipContent = Symbol("cds.Tooltip.noShow") as EmptyTooltipContent;
      TooltipTooltipOpenBodyConfig = {
        open: false,
        body: undefined,
      };
      TooltipTooltipOpen = (input: TooltipBodyState): TooltipBodyState =>
        input.open
          ? input
          : {
              ...input,
              open: true,
            };
      TooltipTooltipOpen_2 = (input: TooltipBodyState): TooltipBodyState =>
        input.open
          ? {
              ...input,
              open: false,
            }
          : input;
      TooltipTooltipBody = (input: TooltipBodyState): TooltipBodyState =>
        input.body === undefined
          ? input
          : {
              ...input,
              body: undefined,
            };
      TooltipTooltipOpen_3 =
        (input: React.ReactNode): TooltipBodyUpdate =>
        (input2) =>
          input2.open && Object.is(input2.body, input)
            ? input2
            : {
                open: true,
                body: input,
              };
      TooltipTooltipIs =
        (input: React.ReactNode): TooltipBodyUpdate =>
        (input2) =>
          Object.is(input2.body, input)
            ? input2
            : {
                ...input2,
                body: input,
              };
      TooltipTooltipOpen_4 = (input: TooltipBodyState): TooltipBodyState =>
        input.open || input.body !== undefined
          ? TooltipTooltipOpenBodyConfig
          : input;
      TooltipStylesCssAlias = TooltipStylesCss;
      TooltipTooltipClassNames = "text-balance";
      TooltipTooltipAlias = tooltipPopupClasses;
      TooltipTooltipClassNames_2 =
        "inline-flex items-center gap-2 min-h-[calc(1.5rem*var(--cds-rem-scale,1))] max-w-[240px] py-[calc(0.1875rem*var(--cds-rem-scale,1))]";
      SelfStartValue = "self-start";
      TooltipTooltipCss = `flex flex-col gap-0.5 ${TooltipStylesCss_2}`;
      OverflowTooltip = (0, reactTooltipTooltip.forwardRef)<
        HTMLSpanElement,
        OverflowTooltipProps
      >(function (
        {
          className: className,
          side: side,
          align: align,
          sideOffset: sideOffset,
          delay: delay,
          collisionPadding: collisionPadding,
          hoverable: hoverable,
          lazy: lazy,
          children: children,
          ...props
        }: OverflowTooltipProps,
        options: React.ForwardedRef<HTMLSpanElement>,
      ): React.ReactElement {
        let value = (0, reactTooltipTooltip.useRef)<HTMLSpanElement | null>(
            null,
          ),
          value2 = (0, useMergedRefs)(value, options),
          value3 = (0, useTooltipTrigger)();
        return (
          <Tooltip
            content={
              value3
                ? undefined
                : () => {
                    let current = value.current;
                    if (current !== null)
                      return current.scrollWidth > current.clientWidth ||
                        (0, measureContentRect)(current)
                        ? children
                        : undefined;
                  }
            }
            side={side}
            align={align}
            sideOffset={sideOffset}
            delay={delay}
            collisionPadding={collisionPadding}
            hoverable={hoverable}
            lazy={lazy}
          >
            <span
              {...props}
              ref={value2}
              data-cds={"OverflowTooltip"}
              className={(0, cn)(
                "block min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap",
                className,
              )}
            >
              {children}
            </span>
          </Tooltip>
        );
      });
      OverflowTooltip.displayName = "OverflowTooltip";
      TooltipTooltipTooltipDisabledReasonTooltipConfig = {
        Tooltip: Tooltip,
        DisabledReasonTooltip: DisabledReasonTooltip,
      };
      TooltipTooltipContext = (0, reactTooltipTooltip.createContext)<boolean>(
        false,
      );
    });
  };
}
