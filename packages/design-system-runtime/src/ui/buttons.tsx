import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseUseRender, clsx, cva, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { buttonFillLayerClasses, buttonFocusClasses, buttonJoinedFillClasses, buttonPressedFillClasses, dangerButtonFocusClasses, getButtonBackgroundLayerClasses, secondaryButtonFillClasses, Shortcut, shortcutToAriaKeyShortcuts, useAppleKeyboard, useTooltipsDisabled } from "./avatars";
import { COMPACTABLE_ATTRIBUTE, DeferredDisabledReasonTooltip, DeferredTooltip, Spinner, useCompactableControl, useCompactableControlDebug, withRepeatedClickSelectionPrevention } from "./disclosure";
import { initializeErrorReporting, initializeSafeObservers } from "./foundation";
import { cn, Icon, iconSizeMetrics, isIconName, pixelsToScaledRem, useIconSize } from "./interactions";
import { getControlSizeAttributes, pickLinkEventProps, useCdsLink } from "./overlays";

var reacttJ: typeof React;
var jsxForUiButtons: typeof import("react/jsx-runtime");
var preventAndStopEvent: (event: React.SyntheticEvent) => void;
var onContentButtonTextClasses: string;
var buttonIndicatorMarginClass: string;
var buttonVariants: C.VariantClasses<{
  variant?: C.ButtonVariant;
  iconOnly?: boolean;
}>;
var onContentButtonBackgroundClasses: string;
var buttonBackgroundVariants: C.VariantClasses<{
  variant?: C.ButtonVariant;
}>;
var buttonGroupContext: React.Context<C.ButtonGroupState | null>;
var joinedButtonRadiusClasses: Record<"start" | "middle" | "end", string>;
var buttonOutsetClasses: Record<"start" | "end" | "both", string>;
var buttonOutsetStyle: C.DesignStyle;
var buttonIconSizeContext: React.Context<C.ResolvedIconSize | undefined>;
var Button: C.ForwardComponent<C.ButtonElement, C.ButtonProps>;
function isButtonActivationKey(
  keyEvent: Pick<C.ButtonKeyEvent, "key">,
): boolean {
  return keyEvent.key === "Enter" || keyEvent.key === " ";
}
function isUnmodifiedButtonActivation(keyEvent: C.ButtonKeyEvent): boolean {
  return (
    isButtonActivationKey(keyEvent) &&
    !keyEvent.ctrlKey &&
    !keyEvent.metaKey &&
    !keyEvent.altKey &&
    !keyEvent.shiftKey
  );
}
function useButtonGroup() {
  return reacttJ.useContext(buttonGroupContext);
}
function getButtonIconSize(controlSize?: C.ControlSize): C.IconSize {
  if (controlSize === "xs" || controlSize === "xxs") {
    return "auto-sm";
  }
  if (controlSize === "lg") {
    return "md";
  } else {
    return "auto";
  }
}
function useButtonIconSize(controlSize?: C.ControlSize): C.ResolvedIconSize {
  let value = useButtonGroup(),
    contextIconSize = reacttJ.useContext(buttonIconSizeContext);
  return useIconSize(
    controlSize !== undefined
      ? getButtonIconSize(controlSize)
      : (contextIconSize ??
          (value?.size !== undefined
            ? getButtonIconSize(value.size)
            : "auto")),
  );
}
function getButtonIconVerticalPadding(iconSize: C.ResolvedIconSize): string {
  return `calc((var(--cds-h-control) - ${pixelsToScaledRem(iconSizeMetrics[iconSize].px)}) / 2)`;
}
export {
  Button,
  buttonBackgroundVariants,
  buttonGroupContext,
  buttonIconSizeContext,
  buttonIndicatorMarginClass,
  buttonOutsetClasses,
  buttonOutsetStyle,
  buttonVariants,
  getButtonIconSize,
  getButtonIconVerticalPadding,
  isButtonActivationKey,
  isUnmodifiedButtonActivation,
  joinedButtonRadiusClasses,
  jsxForUiButtons,
  onContentButtonBackgroundClasses,
  onContentButtonTextClasses,
  preventAndStopEvent,
  reacttJ,
  useButtonGroup,
  useButtonIconSize,
};
export function installUiButtons(): () => void {
  return () => {
    reacttJ = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiButtons = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    preventAndStopEvent = (event: React.SyntheticEvent) => {
      event.preventDefault();
      event.stopPropagation();
    };
    onContentButtonTextClasses =
      "text-primary font-medium focus-visible:shadow-[0_0_0_2px_rgb(255_255_255/0.7)] [&[data-initial-focus]:focus]:shadow-[0_0_0_2px_rgb(255_255_255/0.7)]";
    buttonIndicatorMarginClass =
      "me-[calc((var(--cds-h-control)-1em-6px)/2-var(--cds-pad-md))]";
    buttonVariants = cva(
      "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast",
      {
        variants: {
          variant: {
            primary: `text-on-primary font-medium [--cds-shortcut-cap-ink:currentColor] ${buttonFocusClasses}`,
            secondary: `text-primary font-normal aria-pressed:text-accent ${buttonFocusClasses}`,
            ghost: `text-primary font-normal aria-pressed:text-accent ${buttonFocusClasses}`,
            danger: `text-on-danger font-medium [--cds-shortcut-cap-ink:currentColor] ${dangerButtonFocusClasses}`,
            brand: `text-on-brand font-medium [--cds-shortcut-cap-ink:currentColor] ${buttonFocusClasses}`,
            onContent: onContentButtonTextClasses,
            onAccent: onContentButtonTextClasses,
          },
          iconOnly: {
            true: "aspect-square w-control px-0",
            false: "px-md",
          },
        },
        defaultVariants: {
          variant: "secondary",
          iconOnly: false,
        },
      },
    );
    onContentButtonBackgroundClasses =
      "bg-[var(--cds-button-on-content)] backdrop-blur-md shadow-[inset_0_0_0_1px_var(--cds-button-on-content-ring)] group-focus-visible/btn:!shadow-[inset_0_0_0_1px_var(--cds-button-on-content-ring)] group-[[data-initial-focus]:focus]/btn:!shadow-[inset_0_0_0_1px_var(--cds-button-on-content-ring)] group-hover/btn:bg-[var(--cds-button-on-content-hover)] group-[[aria-haspopup][aria-expanded=true]]/btn:bg-[var(--cds-button-on-content-hover)]";
    buttonBackgroundVariants = cva(
      buttonFillLayerClasses,
      {
        variants: {
          variant: {
            primary:
              "bg-fill-primary group-hover/btn:bg-fill-primary-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-primary-hover",
            secondary: secondaryButtonFillClasses,
            ghost:
              "bg-transparent group-hover/btn:bg-fill-ghost-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-ghost-hover",
            danger:
              "bg-fill-danger group-hover/btn:bg-fill-danger-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-danger-hover",
            brand:
              "bg-fill-brand group-hover/btn:bg-fill-brand-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-brand-hover",
            onContent: onContentButtonBackgroundClasses,
            onAccent: onContentButtonBackgroundClasses,
          },
        },
        defaultVariants: {
          variant: "secondary",
        },
      },
    );
    buttonGroupContext = reacttJ.createContext<C.ButtonGroupState | null>(null);
    joinedButtonRadiusClasses = {
      start: "rounded-e-none",
      end: "rounded-s-none",
      middle: "rounded-none",
    };
    buttonOutsetClasses = {
      start: "ms-outset",
      end: "me-outset",
      both: "mx-outset",
    };
    buttonOutsetStyle = {
      "--cds-outset-x": "var(--cds-pad-md)",
    };
    buttonIconSizeContext = reacttJ.createContext<
      C.ResolvedIconSize | undefined
    >(undefined);
    Button = reacttJ.forwardRef(
      (
        {
          variant: variant,
          size: size,
          icon: icon,
          iconOnly = false,
          iconPosition = "start",
          tooltip: tooltip,
          tooltipSide: tooltipSide,
          indicator: indicator,
          shortcut: shortcut,
          busy = false,
          busyLabel: busyLabel,
          pressed: pressed,
          flush = false,
          style: style,
          disabled: disabled,
          disabledReason: disabledReason,
          disabledReasonSide: disabledReasonSide,
          type: type,
          href: href,
          routerOptions: routerOptions,
          target: target,
          rel: rel,
          download: download,
          render: render,
          className: className,
          children: children,
          "aria-label": ariaLabel,
          ...props
        }: C.ButtonProps,
        forwardedRef: React.ForwardedRef<C.ButtonElement>,
      ) => {
        let value = useButtonGroup(),
          joinedPosition = value?.joined;
        if (value) {
          if (((size = size ?? value.size), value.enforceVariant)) {
            variant = value.buttonVariant;
          } else {
            variant = variant ?? value.buttonVariant;
          }
        }
        let resolvedVariant = variant ?? "secondary",
          compactableControl: {
            icon?: React.ReactNode;
            compact: boolean;
          } = useCompactableControl(),
          compactIcon = iconOnly === true ? undefined : compactableControl.icon,
          isCompact = compactIcon !== undefined && compactableControl.compact,
          rendersIconOnly = iconOnly === true || isCompact,
          activeIcon = isCompact ? compactIcon : icon,
          compactLabel = isCompact ? (
            <span data-cds-part={"compact-name"} className={"contents"}>
              {children}
            </span>
          ) : null,
          requestedOutset =
            flush === true ? "start" : flush === false ? undefined : flush,
          supportedOutset =
            requestedOutset !== undefined && Object.hasOwn(buttonOutsetClasses, requestedOutset)
              ? requestedOutset
              : undefined,
          appliedOutset =
            supportedOutset !== undefined && !joinedPosition && resolvedVariant === "ghost"
              ? supportedOutset
              : undefined,
          usesAppleKeyboard: boolean = useAppleKeyboard(),
          ref = reacttJ.useRef<HTMLSpanElement>(null);
        useCompactableControlDebug(ref, "Button");
        let resolvedIconSize = useButtonIconSize(size),
          iconOnlyContent =
            rendersIconOnly && activeIcon ? (
              isIconName(activeIcon) ? (
                <Icon name={activeIcon} size={resolvedIconSize} />
              ) : (
                activeIcon
              )
            ) : null,
          tooltipsDisabled: boolean = useTooltipsDisabled(),
          showTooltip =
            (rendersIconOnly && ariaLabel && tooltip !== false) || compactIcon !== undefined,
          tooltipContent =
            compactIcon !== undefined
              ? isCompact
                ? compactLabel
                : undefined
              : typeof tooltip === "string"
                ? tooltip
                : ariaLabel,
          hasDisabledReason = href === undefined && !!disabled && !!disabledReason,
          isNativeButton = href === undefined && render === undefined,
          blocksActivation = busy && isNativeButton,
          callback = (event: React.KeyboardEvent<C.ButtonElement>) => {
            if (isButtonActivationKey(event)) {
              if (blocksActivation && isUnmodifiedButtonActivation(event)) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              if (event.repeat && isNativeButton) {
                event.preventDefault();
              }
            }
            props.onKeyDown?.(event);
          },
          handleKeyUp = (event: React.KeyboardEvent<C.ButtonElement>) => {
            if (blocksActivation && isUnmodifiedButtonActivation(event)) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            props.onKeyUp?.(event);
          },
          outsetStyle =
            appliedOutset === undefined
              ? undefined
              : rendersIconOnly
                ? {
                    "--cds-outset-x": getButtonIconVerticalPadding(resolvedIconSize),
                  }
                : buttonOutsetStyle,
          buttonClassName: string = cn(
            buttonVariants({
              variant: variant,
              iconOnly: rendersIconOnly,
            }),
            blocksActivation ? "pointer-events-none" : "",
            appliedOutset ? buttonOutsetClasses[appliedOutset] : "",
            joinedPosition && resolvedVariant !== "ghost"
              ? joinedButtonRadiusClasses[joinedPosition]
              : "",
            className,
          ),
          buttonContent = (
            <jsxForUiButtons.Fragment>
              {[<span
                  aria-hidden={true}
                  className={getButtonBackgroundLayerClasses({
                    joined: !!joinedPosition,
                    solid:
                      resolvedVariant === "primary" ||
                      resolvedVariant === "danger" ||
                      resolvedVariant === "brand",
                  })}
                >
                  <span
                    ref={ref}
                    data-cds-part={"paint"}
                    className={`${buttonBackgroundVariants({
                      variant: resolvedVariant,
                    })} ${buttonPressedFillClasses} ${resolvedVariant === "secondary" && !joinedPosition ? buttonJoinedFillClasses : ""}`}
                  />
                </span>, <span
                  className={`inline-flex min-w-0 items-center gap-1 ${busy ? "opacity-0" : ""}`}
                >
                  <buttonIconSizeContext.Provider value={resolvedIconSize}>
                    {iconOnlyContent ? (indicator ? (<span className={"grid"}>
                          {[<span
                              className={
                                "col-start-1 row-start-1 [--btn-dot-r:calc(0.1875rem*var(--cds-rem-scale,1))] [--btn-dot-x:calc(100%_-_var(--btn-dot-r)_+_1px)] [&:dir(rtl)]:[--btn-dot-x:calc(var(--btn-dot-r)_-_1px)] not-forced-colors:has-[~[data-cds-part=indicator]>[data-cds=Pulse]]:[mask-image:radial-gradient(circle_at_var(--btn-dot-x)_calc(var(--btn-dot-r)_-_1px),transparent_calc(var(--btn-dot-r)_+_2px),black_calc(var(--btn-dot-r)_+_2.5px))]"
                              }
                            >
                              {iconOnlyContent}
                            </span>, <span
                              aria-hidden={true}
                              data-cds-part={"indicator"}
                              className={
                                "relative col-start-1 row-start-1 -me-px -mt-px self-start justify-self-end has-[>[data-cds=Pulse]]:[--cds-page-bg:transparent]"
                              }
                            >
                              {indicator}
                            </span>]}
                        </span>) : (isCompact ? (<jsxForUiButtons.Fragment>
                          {[iconOnlyContent, <span className={"sr-only"}>{compactLabel}</span>]}
                        </jsxForUiButtons.Fragment>) : (iconOnlyContent))) : (<jsxForUiButtons.Fragment>
                        {[activeIcon &&
                            iconPosition === "start" &&
                            (isIconName(activeIcon) ? (
                              <Icon
                                name={activeIcon}
                                size={resolvedIconSize}
                                className={"-ms-1"}
                              />
                            ) : (
                              <span className={"-ms-1 inline-flex"}>
                                {activeIcon}
                              </span>
                            )), children, activeIcon &&
                            iconPosition === "end" &&
                            (isIconName(activeIcon) ? (
                              <Icon
                                name={activeIcon}
                                size={resolvedIconSize}
                                className={"-me-1"}
                              />
                            ) : (
                              <span className={"-me-1 inline-flex"}>
                                {activeIcon}
                              </span>
                            )), shortcut && (
                            <Shortcut
                              keys={shortcut}
                              aria-hidden={true}
                              className={clsx(
                                "pointer-coarse:hidden ms-1",
                                (!joinedPosition || joinedPosition === "end") &&
                                  buttonIndicatorMarginClass,
                              )}
                            />
                          )]}
                      </jsxForUiButtons.Fragment>)}
                  </buttonIconSizeContext.Provider>
                </span>, busy && (
                  <span
                    className={
                      "absolute inset-0 grid place-items-center leading-[0]"
                    }
                  >
                    <Spinner
                      size={"sm"}
                      inheritColor={true}
                      label={busyLabel}
                    />
                  </span>
                )]}
            </jsxForUiButtons.Fragment>
          ),
          anchorAttributes: React.AnchorHTMLAttributes<HTMLAnchorElement> = useCdsLink({
            href: href,
            routerOptions: routerOptions,
            target: target,
            rel: rel,
            download: download,
            ...pickLinkEventProps(props),
          }),
          renderedButton = baseUseRender({
            render:
              render ??
              (href !== undefined ? (
                <a />
              ) : (
                <button type={type ?? "button"} disabled={disabled} />
              )),
            ref: forwardedRef,
            props: {
              "data-cds": "Button",
              ...(rendersIconOnly
                ? {
                    "data-cds-icon-only": "",
                  }
                : undefined),
              ...(compactIcon !== undefined
                ? {
                    [COMPACTABLE_ATTRIBUTE]: "",
                  }
                : undefined),
              ...(resolvedVariant === "ghost"
                ? {
                    "data-cds-ghost": "",
                  }
                : undefined),
              ...(size === "xxs"
                ? {
                    "data-step": "1",
                  }
                : getControlSizeAttributes(size)),
              className: buttonClassName,
              style: outsetStyle
                ? {
                    ...outsetStyle,
                    ...style,
                  }
                : style,
              "aria-busy": busy || undefined,
              "aria-pressed": href === undefined ? pressed : undefined,
              "aria-disabled": blocksActivation || undefined,
              "aria-label": ariaLabel,
              "aria-keyshortcuts": shortcut
                ? shortcutToAriaKeyShortcuts(shortcut, usesAppleKeyboard)
                : undefined,
              children: buttonContent,
              ...props,
              onMouseDown: withRepeatedClickSelectionPrevention(
                props.onMouseDown,
              ),
              onClick: blocksActivation ? preventAndStopEvent : props.onClick,
              onKeyDown: callback,
              onKeyUp: handleKeyUp,
              ...(href !== undefined ? anchorAttributes : undefined),
            },
          }),
          buttonWithTooltip = showTooltip ? (
            <DeferredTooltip
              side={tooltipSide}
              hoverable={false}
              content={tooltipsDisabled || hasDisabledReason ? undefined : tooltipContent}
              shortcut={shortcut}
            >
              {renderedButton}
            </DeferredTooltip>
          ) : (
            renderedButton
          );
        if (disabledReason === undefined || href !== undefined) {
          return buttonWithTooltip;
        }
        return (
          <DeferredDisabledReasonTooltip
            side={disabledReasonSide}
            reason={hasDisabledReason ? disabledReason : undefined}
          >
            {buttonWithTooltip}
          </DeferredDisabledReasonTooltip>
        );
      },
    );
    Button.displayName = "Button";
    initializeErrorReporting();
    initializeSafeObservers();
  };
}
