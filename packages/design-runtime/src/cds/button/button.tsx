import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { ControlSize } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { buttonBackgroundClassName, focusRingClassName, dangerFocusRingClassName, focusInsetOverlayClassName, pressedFieldShadowClassName, pressedAccentBackgroundClassName, secondaryFillClassName, CdsCompactableAttribute, initializeButtonContext, initializeButtonAnimationReact, initializeButtonFocusClassNames, useButtonAnimation, useButtonGroup } from "./context";
import { Icon, iconSizeMetrics, initializeIconSizeMetrics, isIconName, useIconSize } from "../components/icon";
import { initializeComponentsShortcut, parseSingleShortcut, Shortcut, useAppleKeyboard } from "../components/shortcut";
import { initializeComponentsSpinner, Spinner } from "../components/spinner";
import { initializeDomSelectionPrevention, withSelectionPrevention } from "../dom/selection-prevention";
import { initializeLinkRouter, pickRouterOptions, useLinkProps } from "../links";
import { initializeRootFontScaleProbe, scaleCssPixels } from "../platform/root-font-size";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot } from "../theme/root";
import { DeferredDisabledReasonTooltip, DeferredTooltip, initializeTooltipDeferredProvider } from "../tooltip/deferred-provider";
import { initializeTooltipTrigger, useTooltipTrigger } from "../tooltip/trigger";
import { initializeNpm__base_ui_react_SY, initializeNpm_class_variance_authority_Zhe, initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea, npm_cva_Kj, npm_useRender_LL } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactButtonButton: Dynamic;
var jsxButtonButton: Dynamic;
var ButtonButtonPreventDefault: Dynamic;
var ButtonButtonClassNames: Dynamic;
var MeCalcVarCdsHControl1em6px2VarCdsPadMdValue: Dynamic;
var buttonContentClassNames: Dynamic;
var buttonStyleVariants: Dynamic;
var buttonIconOnlyVariants: Dynamic;
var ButtonGroupOptionsContext: Dynamic;
var ButtonButtonStartEndMiddleConfig: Dynamic;
var ButtonButtonStartEndBothConfig: Dynamic;
var ButtonButtonCdsOutsetXConfig: Dynamic;
var ButtonIconSizeContext: Dynamic;
var Button: Dynamic;
var initializeButtonButton: Dynamic;
var fieldSurfaceClassName: Dynamic;
var fieldHoverShadowClassName: Dynamic;
var ButtonButtonCss: Dynamic;
var inlineInputClassName: Dynamic;
var fieldBoxClassName: Dynamic;
var fieldFocusWithinClassName: Dynamic;
var initializeFieldBoxClassNames: Dynamic;
function isButtonActivationKey(
  event: Pick<React.KeyboardEvent, "key">,
): boolean {
  return event.key === "Enter" || event.key === " ";
}
function isUnmodifiedButtonActivationKey(
  event: Pick<
    React.KeyboardEvent,
    "key" | "ctrlKey" | "metaKey" | "altKey" | "shiftKey"
  >,
): boolean {
  return (
    isButtonActivationKey(event) &&
    !event.ctrlKey &&
    !event.metaKey &&
    !event.altKey &&
    !event.shiftKey
  );
}
function useButtonGroupOptions(): Dynamic {
  return (0, reactButtonButton.useContext)(ButtonGroupOptionsContext);
}
function buttonSizeToIconSize(
  size?: ControlSize,
): "auto-sm" | "md" | "auto" {
  return size === "xs" || size === "xxs"
    ? "auto-sm"
    : size === "lg"
      ? "md"
      : "auto";
}
function useButtonIconSize(size?: Dynamic): Dynamic {
  let groupOptions: Dynamic = useButtonGroupOptions(),
    inheritedIconSize: Dynamic = (0, reactButtonButton.useContext)(
      ButtonIconSizeContext,
    );
  return useIconSize(
    size !== undefined
      ? buttonSizeToIconSize(size)
      : (inheritedIconSize ??
          (groupOptions?.size !== undefined
            ? buttonSizeToIconSize(groupOptions.size)
            : "auto")),
  );
}
function buttonIconPadding(iconSize?: Dynamic): Dynamic {
  return `calc((var(--cds-h-control) - ${scaleCssPixels(iconSizeMetrics[iconSize].px)}) / 2)`;
}
export {
  Button,
  ButtonButtonCdsOutsetXConfig,
  ButtonButtonClassNames,
  fieldSurfaceClassName,
  fieldHoverShadowClassName,
  inlineInputClassName,
  ButtonButtonCss,
  fieldBoxClassName,
  fieldFocusWithinClassName,
  ButtonButtonPreventDefault,
  ButtonButtonStartEndBothConfig,
  ButtonButtonStartEndMiddleConfig,
  buttonContentClassNames,
  ButtonGroupOptionsContext,
  buttonIconOnlyVariants,
  buttonIconPadding,
  ButtonIconSizeContext,
  buttonSizeToIconSize,
  buttonStyleVariants,
  initializeButtonButton,
  initializeFieldBoxClassNames,
  isButtonActivationKey,
  isUnmodifiedButtonActivationKey,
  jsxButtonButton,
  MeCalcVarCdsHControl1em6px2VarCdsPadMdValue,
  reactButtonButton,
  useButtonGroupOptions,
  useButtonIconSize,
};
export function installCdsButtonButton(): () => void {
  return () => {
    initializeButtonButton = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeLinkRouter();
      initializeCdsRoot();
      initializeDomSelectionPrevention();
      initializeRootFontScaleProbe();
      initializeIconSizeMetrics();
      initializeComponentsShortcut();
      initializeTooltipTrigger();
      initializeButtonContext();
      initializeButtonAnimationReact();
      initializeComponentsSpinner();
      initializeTooltipDeferredProvider();
      initializeButtonFocusClassNames();
      initializeNpm__base_ui_react_SY();
      reactButtonButton = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxButtonButton = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm_class_variance_authority_Zhe();
      ButtonButtonPreventDefault = (event?: Dynamic): Dynamic => {
        event.preventDefault();
        event.stopPropagation();
      };
      ButtonButtonClassNames =
        "text-primary font-medium focus-visible:shadow-[0_0_0_2px_rgb(255_255_255/0.7)] [&[data-initial-focus]:focus]:shadow-[0_0_0_2px_rgb(255_255_255/0.7)]";
      MeCalcVarCdsHControl1em6px2VarCdsPadMdValue =
        "me-[calc((var(--cds-h-control)-1em-6px)/2-var(--cds-pad-md))]";
      buttonContentClassNames = npm_cva_Kj(
        "cds-reset group/btn relative isolate inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap select-none cursor-[var(--cds-cursor-interactive)] aria-disabled:cursor-default data-[disabled]:cursor-default border-0 outline-none focus-visible:outline-hidden [&[data-initial-focus]:focus]:outline-hidden rounded h-control font-sans text-body [&:disabled:not([aria-busy])]:opacity-disabled disabled:pointer-events-none transition-shadow duration-fast",
        {
          variants: {
            variant: {
              primary: `text-on-primary font-medium [--cds-shortcut-cap-ink:currentColor] ${focusRingClassName}`,
              secondary: `text-primary font-normal aria-pressed:text-accent ${focusRingClassName}`,
              ghost: `text-primary font-normal aria-pressed:text-accent ${focusRingClassName}`,
              danger: `text-on-danger font-medium [--cds-shortcut-cap-ink:currentColor] ${dangerFocusRingClassName}`,
              brand: `text-on-brand font-medium [--cds-shortcut-cap-ink:currentColor] ${focusRingClassName}`,
              onContent: ButtonButtonClassNames,
              onAccent: ButtonButtonClassNames,
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
      buttonStyleVariants =
        "bg-[var(--cds-button-on-content)] backdrop-blur-md shadow-[inset_0_0_0_1px_var(--cds-button-on-content-ring)] group-focus-visible/btn:!shadow-[inset_0_0_0_1px_var(--cds-button-on-content-ring)] group-[[data-initial-focus]:focus]/btn:!shadow-[inset_0_0_0_1px_var(--cds-button-on-content-ring)] group-hover/btn:bg-[var(--cds-button-on-content-hover)] group-[[aria-haspopup][aria-expanded=true]]/btn:bg-[var(--cds-button-on-content-hover)]";
      buttonIconOnlyVariants = npm_cva_Kj(
        focusInsetOverlayClassName,
        {
          variants: {
            variant: {
              primary:
                "bg-fill-primary group-hover/btn:bg-fill-primary-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-primary-hover",
              secondary: secondaryFillClassName,
              ghost:
                "bg-transparent group-hover/btn:bg-fill-ghost-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-ghost-hover",
              danger:
                "bg-fill-danger group-hover/btn:bg-fill-danger-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-danger-hover",
              brand:
                "bg-fill-brand group-hover/btn:bg-fill-brand-hover group-[[aria-haspopup][aria-expanded=true]]/btn:bg-fill-brand-hover",
              onContent: buttonStyleVariants,
              onAccent: buttonStyleVariants,
            },
          },
          defaultVariants: {
            variant: "secondary",
          },
        },
      );
      ButtonGroupOptionsContext = (0, reactButtonButton.createContext)(null);
      ButtonButtonStartEndMiddleConfig = {
        start: "rounded-e-none",
        end: "rounded-s-none",
        middle: "rounded-none",
      };
      ButtonButtonStartEndBothConfig = {
        start: "ms-outset",
        end: "me-outset",
        both: "mx-outset",
      };
      ButtonButtonCdsOutsetXConfig = {
        "--cds-outset-x": "var(--cds-pad-md)",
      };
      ButtonIconSizeContext = (0, reactButtonButton.createContext)(undefined);
      Button = (0, reactButtonButton.forwardRef)(
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
            disabled: isDisabled,
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
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => {
          let groupOptions: Dynamic = useButtonGroupOptions(),
            joinedPosition: Dynamic = groupOptions?.joined;
          groupOptions &&
            ((size = size ?? groupOptions.size),
            groupOptions.enforceVariant
              ? (variant = groupOptions.buttonVariant)
              : (variant = variant ?? groupOptions.buttonVariant));
          let resolvedVariant: Dynamic = variant ?? "secondary",
            buttonGroup: Dynamic = useButtonGroup(),
            groupIcon: Dynamic = iconOnly === true ? undefined : buttonGroup.icon,
            isCompact: Dynamic = groupIcon !== undefined && buttonGroup.compact,
            isIconOnly: Dynamic = iconOnly === true || isCompact,
            resolvedIcon: Dynamic = isCompact ? groupIcon : icon,
            compactLabel: Dynamic = isCompact ? (
              <span data-cds-part={"compact-name"} className={"contents"}>
                {children}
              </span>
            ) : null,
            flushPosition: Dynamic =
              flush === true ? "start" : flush === false ? undefined : flush,
            validFlushPosition: Dynamic =
              flushPosition !== undefined &&
              Object.hasOwn(ButtonButtonStartEndBothConfig, flushPosition)
                ? flushPosition
                : undefined,
            outsetPosition: Dynamic =
              validFlushPosition !== undefined && !joinedPosition && resolvedVariant === "ghost"
                ? validFlushPosition
                : undefined,
            isAppleKeyboard: Dynamic = useAppleKeyboard(),
            paintRef: Dynamic = (0, reactButtonButton.useRef)(null);
          useButtonAnimation(paintRef, "Button");
          let iconSize: Dynamic = useButtonIconSize(size),
            iconOnlyContent: Dynamic =
              isIconOnly && resolvedIcon ? (
                isIconName(resolvedIcon) ? (
                  <Icon name={resolvedIcon} size={iconSize} />
                ) : (
                  resolvedIcon
                )
              ) : null,
            tooltipTrigger: Dynamic = useTooltipTrigger(),
            hasTooltip: Dynamic =
              (isIconOnly && ariaLabel && tooltip !== false) ||
              groupIcon !== undefined,
            tooltipContent: Dynamic =
              groupIcon !== undefined
                ? isCompact
                  ? compactLabel
                  : undefined
                : typeof tooltip == "string"
                  ? tooltip
                  : ariaLabel,
            showsDisabledReason: Dynamic =
              href === undefined && !!isDisabled && !!disabledReason,
            isNativeButton: Dynamic = href === undefined && render === undefined,
            isBusyBlocked: Dynamic = busy && isNativeButton,
            handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
              if (isButtonActivationKey(event)) {
                if (isBusyBlocked && isUnmodifiedButtonActivationKey(event)) {
                  event.preventDefault();
                  event.stopPropagation();
                  return;
                }
                event.repeat && isNativeButton && event.preventDefault();
              }
              props.onKeyDown?.(event);
            },
            handleKeyUp: Dynamic = (event?: Dynamic): Dynamic => {
              if (isBusyBlocked && isUnmodifiedButtonActivationKey(event)) {
                event.preventDefault();
                event.stopPropagation();
                return;
              }
              props.onKeyUp?.(event);
            },
            outsetStyle: Dynamic =
              outsetPosition === undefined
                ? undefined
                : isIconOnly
                  ? {
                      "--cds-outset-x": buttonIconPadding(iconSize),
                    }
                  : ButtonButtonCdsOutsetXConfig,
            buttonClassName: Dynamic = cn(
              buttonContentClassNames({
                variant: variant,
                iconOnly: isIconOnly,
              }),
              isBusyBlocked ? "pointer-events-none" : "",
              outsetPosition ? ButtonButtonStartEndBothConfig[outsetPosition] : "",
              joinedPosition && resolvedVariant !== "ghost"
                ? ButtonButtonStartEndMiddleConfig[joinedPosition]
                : "",
              className,
            ),
            buttonContent: Dynamic = (
              <jsxButtonButton.Fragment>
                <span
                  aria-hidden={true}
                  className={buttonBackgroundClassName({
                    joined: !!joinedPosition,
                    solid:
                      resolvedVariant === "primary" ||
                      resolvedVariant === "danger" ||
                      resolvedVariant === "brand",
                  })}
                >
                  <span
                    ref={paintRef}
                    data-cds-part={"paint"}
                    className={`${buttonIconOnlyVariants({
                      variant: resolvedVariant,
                    })} ${pressedAccentBackgroundClassName} ${resolvedVariant === "secondary" && !joinedPosition ? pressedFieldShadowClassName : ""}`}
                  />
                </span>
                <span
                  className={`inline-flex min-w-0 items-center gap-1 ${busy ? "opacity-0" : ""}`}
                >
                  <ButtonIconSizeContext.Provider value={iconSize}>
                    {iconOnlyContent ? (indicator ? (<span className={"grid"}>
                          <span
                            className={
                              "col-start-1 row-start-1 [--btn-dot-r:calc(0.1875rem*var(--cds-rem-scale,1))] [--btn-dot-x:calc(100%_-_var(--btn-dot-r)_+_1px)] [&:dir(rtl)]:[--btn-dot-x:calc(var(--btn-dot-r)_-_1px)] not-forced-colors:has-[~[data-cds-part=indicator]>[data-cds=Pulse]]:[mask-image:radial-gradient(circle_at_var(--btn-dot-x)_calc(var(--btn-dot-r)_-_1px),transparent_calc(var(--btn-dot-r)_+_2px),black_calc(var(--btn-dot-r)_+_2.5px))]"
                            }
                          >
                            {iconOnlyContent}
                          </span>
                          <span
                            aria-hidden={true}
                            data-cds-part={"indicator"}
                            className={
                              "relative col-start-1 row-start-1 -me-px -mt-px self-start justify-self-end has-[>[data-cds=Pulse]]:[--cds-page-bg:transparent]"
                            }
                          >
                            {indicator}
                          </span>
                        </span>) : (isCompact ? (<jsxButtonButton.Fragment>
                          {iconOnlyContent}
                          <span className={"sr-only"}>{compactLabel}</span>
                        </jsxButtonButton.Fragment>) : (iconOnlyContent))) : (<jsxButtonButton.Fragment>
                        {resolvedIcon &&
                          iconPosition === "start" && (isIconName(resolvedIcon) ? (<Icon
                              name={resolvedIcon}
                              size={iconSize}
                              className={"-ms-1"}
                            />) : (<span className={"-ms-1 inline-flex"}>
                              {resolvedIcon}
                            </span>))}
                        {children}
                        {resolvedIcon &&
                          iconPosition === "end" && (isIconName(resolvedIcon) ? (<Icon
                              name={resolvedIcon}
                              size={iconSize}
                              className={"-me-1"}
                            />) : (<span className={"-me-1 inline-flex"}>
                              {resolvedIcon}
                            </span>))}
                        {shortcut && (<Shortcut
                            keys={shortcut}
                            aria-hidden={true}
                            className={npm_clsx_Ea(
                              "pointer-coarse:hidden ms-1",
                              (!joinedPosition || joinedPosition === "end") &&
                                MeCalcVarCdsHControl1em6px2VarCdsPadMdValue,
                            )}
                          />)}
                      </jsxButtonButton.Fragment>)}
                  </ButtonIconSizeContext.Provider>
                </span>
                {busy && (<span
                    className={
                      "absolute inset-0 grid place-items-center leading-[0]"
                    }
                  >
                    <Spinner
                      size={"sm"}
                      inheritColor={true}
                      label={busyLabel}
                    />
                  </span>)}
              </jsxButtonButton.Fragment>
            ),
            linkProps: Dynamic = useLinkProps({
              href: href,
              routerOptions: routerOptions,
              target: target,
              rel: rel,
              download: download,
              ...pickRouterOptions(props),
            }),
            renderedButton: Dynamic = npm_useRender_LL({
              render:
                render ??
                (href !== undefined ? (
                  <a />
                ) : (
                  <button type={type ?? "button"} disabled={isDisabled} />
                )),
              ref: forwardedRef,
              props: {
                "data-cds": "Button",
                ...(isIconOnly
                  ? {
                      "data-cds-icon-only": "",
                    }
                  : undefined),
                ...(groupIcon !== undefined
                  ? {
                      [CdsCompactableAttribute]: "",
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
                  : getSizeAttribute(size)),
                className: buttonClassName,
                style: outsetStyle
                  ? {
                      ...outsetStyle,
                      ...style,
                    }
                  : style,
                "aria-busy": busy || undefined,
                "aria-pressed": href === undefined ? pressed : undefined,
                "aria-disabled": isBusyBlocked || undefined,
                "aria-label": ariaLabel,
                "aria-keyshortcuts": shortcut
                  ? parseSingleShortcut(shortcut, isAppleKeyboard)
                  : undefined,
                children: buttonContent,
                ...props,
                onMouseDown: withSelectionPrevention(
                  props.onMouseDown,
                ),
                onClick: isBusyBlocked ? ButtonButtonPreventDefault : props.onClick,
                onKeyDown: handleKeyDown,
                onKeyUp: handleKeyUp,
                ...(href !== undefined ? linkProps : undefined),
              },
            }),
            buttonWithTooltip: Dynamic = hasTooltip ? (
              <DeferredTooltip
                side={tooltipSide}
                hoverable={false}
                content={tooltipTrigger || showsDisabledReason ? undefined : tooltipContent}
                shortcut={shortcut}
              >
                {renderedButton}
              </DeferredTooltip>
            ) : (
              renderedButton
            );
          return disabledReason === undefined || href !== undefined ? (
            buttonWithTooltip
          ) : (
            <DeferredDisabledReasonTooltip
              side={disabledReasonSide}
              reason={showsDisabledReason ? disabledReason : undefined}
            >
              {buttonWithTooltip}
            </DeferredDisabledReasonTooltip>
          );
        },
      );
      Button.displayName = "Button";
    });
    initializeFieldBoxClassNames = initializeOnce((): Dynamic => {
      fieldSurfaceClassName =
        "bg-fill-field shadow-field-ring data-[invalid]:shadow-field-invalid";
      fieldHoverShadowClassName =
        "[&:hover:not(:focus-visible):not(:has(:focus-visible)):not([data-invalid]):not([data-disabled])]:shadow-field-hover";
      ButtonButtonCss = `h-control pl-md rounded ${fieldSurfaceClassName} font-sans text-body font-normal text-primary transition duration-fast`;
      inlineInputClassName =
        "cds-input cds-reset min-w-0 flex-1 h-full bg-transparent border-0 p-0 outline-none focus-visible:outline-hidden text-body font-normal text-primary focus-visible:shadow-none placeholder:text-muted disabled:opacity-disabled";
      fieldBoxClassName = `rounded ${fieldSurfaceClassName} px-md py-sm transition duration-fast`;
      fieldFocusWithinClassName = `${fieldBoxClassName} [&:hover:not(:focus-within):not([data-invalid]):not([data-disabled])]:shadow-field-hover focus-within:shadow-focus font-sans text-body text-primary`;
    });
  };
}
