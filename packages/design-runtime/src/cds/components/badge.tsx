import { uiMessage } from '@minedesign/contracts/ui-messages';
import type {
  AccentColor,
  BadgeProps,
  BadgeVariant,
  ControlSize,
  Density,
  ForwardComponent,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { Icon, initializeIconSizeMetrics, isIconName } from "./icon";
import { initializeLabelsProviderContext, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { getControlSizeRank, getSizeAttribute, initializeCdsRoot, useDensity } from "../theme/root";
import { initializeNpm__base_ui_react_gx, initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea, npm_mergeProps_Ac } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsBadge: typeof React;
var jsxComponentsBadge: typeof import("react/jsx-runtime");
var ComponentsBadgeNeutralAccentSuccessConfig: Record<BadgeVariant, string>;
var ComponentsBadgeSolidVariantClassNames: Record<BadgeVariant, string>;
var ComponentsBadgeRedOrangeYellowConfig: Record<AccentColor, string>;
var ComponentsBadgeTintAccentClassNames: Record<AccentColor, string>;
var ComponentsBadgeXsSmMdConfig: Record<"xs" | "sm" | "md", string>;
var ComponentsBadgeClassNames: string;
var ComponentsBadgeComfortableCompactConfig: Record<
  Density,
  Record<ControlSize, "xs" | "sm" | "md">
>;
var Badge: ForwardComponent<HTMLSpanElement, BadgeProps>;
var initializeComponentsBadge: () => void;
function isBadgeVariant(
  variant: BadgeVariant | AccentColor,
): variant is BadgeVariant {
  return Object.hasOwn(ComponentsBadgeNeutralAccentSuccessConfig, variant);
}
export {
  Badge,
  ComponentsBadgeClassNames,
  ComponentsBadgeComfortableCompactConfig,
  ComponentsBadgeNeutralAccentSuccessConfig,
  ComponentsBadgeRedOrangeYellowConfig,
  ComponentsBadgeXsSmMdConfig,
  initializeComponentsBadge,
  isBadgeVariant,
  jsxComponentsBadge,
  reactComponentsBadge,
};
export function installCdsComponentsBadge(): () => void {
  return () => {
    initializeComponentsBadge = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeLabelsProviderContext();
      initializeCdsRoot();
      initializeIconSizeMetrics();
      reactComponentsBadge = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxComponentsBadge = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_gx();
      ComponentsBadgeNeutralAccentSuccessConfig = {
        neutral: "bg-neutral text-secondary",
        accent: "bg-tint-blue text-accent",
        success: "bg-tint-green text-tint-green",
        warning: "bg-tint-yellow text-warning",
        danger: "bg-tint-red text-danger",
        pro: "bg-tint-violet text-pro",
      };
      ComponentsBadgeSolidVariantClassNames = {
        neutral: "bg-gray-700 dark:bg-gray-550 text-gray-0",
        accent: "bg-blue-500 text-gray-0",
        success: "bg-green-500 text-gray-0",
        warning: "bg-yellow-500 text-gray-0",
        danger: "bg-red-450 text-gray-0",
        pro: "bg-violet-450 text-gray-0",
      };
      ComponentsBadgeRedOrangeYellowConfig = {
        red: "bg-red-450 text-gray-0",
        orange: "bg-orange-450 text-gray-0",
        yellow: "bg-yellow-500 text-gray-0",
        green: "bg-green-500 text-gray-0",
        aqua: "bg-aqua-500 text-gray-0",
        blue: "bg-blue-500 text-gray-0",
        violet: "bg-violet-450 text-gray-0",
        magenta: "bg-magenta-450 text-gray-0",
      };
      ComponentsBadgeTintAccentClassNames = {
        red: "bg-tint-red text-tint-red",
        orange: "bg-tint-orange text-tint-orange",
        yellow: "bg-tint-yellow text-tint-yellow",
        green: "bg-tint-green text-tint-green",
        aqua: "bg-tint-aqua text-tint-aqua",
        blue: "bg-tint-blue text-tint-blue",
        violet: "bg-tint-violet text-tint-violet",
        magenta: "bg-tint-magenta text-tint-magenta",
      };
      ComponentsBadgeXsSmMdConfig = {
        xs: "ml-[calc((var(--cds-h-control-nested)-calc(0.75rem*var(--cds-rem-scale,1)))/2-var(--cds-pad-sm)+1px)] mr-[-0.8px] shrink-0",
        sm: "ml-[calc((var(--cds-h-control-nested)-calc(1rem*var(--cds-rem-scale,1)))/2-var(--cds-pad-sm)+1px)] mr-[-0.8px] shrink-0",
        md: "ml-[calc((var(--cds-h-control-nested)-calc(1.25rem*var(--cds-rem-scale,1)))/2-var(--cds-pad-sm)+1px)] mr-[-0.8px] shrink-0",
      };
      ComponentsBadgeClassNames =
        "leading-[calc(0.75rem*var(--cds-rem-scale,1))] py-[0.125em] -my-[0.125em]";
      ComponentsBadgeComfortableCompactConfig = {
        comfortable: {
          lg: "md",
          base: "sm",
          sm: "sm",
          xs: "xs",
          xxs: "xs",
        },
        compact: {
          lg: "sm",
          base: "xs",
          sm: "xs",
          xs: "xs",
          xxs: "xs",
        },
      };
      Badge = (0, reactComponentsBadge.forwardRef)<HTMLSpanElement, BadgeProps>(
        (
          {
            variant: variant,
            icon: icon,
            iconOnly = false,
            onRemove: onRemove,
            removeLabel: removeLabel,
            removeRender: removeRender,
            bold: bold,
            size: size,
            truncate: truncate,
            className: className,
            children: children,
            ...props
          }: BadgeProps,
          forwardedRef: React.ForwardedRef<HTMLSpanElement>,
        ): React.ReactElement => {
          let resolvedVariant = variant ?? "accent",
            defaultRemoveLabel = useLabel("removeItem", "Remove {item}", {
              item: typeof children == "string" ? children : "item",
            }),
            density = useDensity(),
            iconSize =
              ComponentsBadgeComfortableCompactConfig[density][size ?? "base"],
            length = reactComponentsBadge.Children.toArray(children).length,
            iconClassName =
              !iconOnly &&
              (length > 0 ||
                onRemove !== undefined ||
                removeRender !== undefined)
                ? ComponentsBadgeXsSmMdConfig[iconSize]
                : "shrink-0",
            labelClassName =
              (size === "xxs"
                ? 1
                : getControlSizeRank(density, size)) === 1
                ? ComponentsBadgeClassNames
                : "pb-[0.05em]",
            resolvedRemoveLabel = removeLabel || defaultRemoveLabel,
            removeButtonClassName = npm_clsx_Ea(
              "cds-reset relative inline-flex shrink-0 items-center justify-center",
              "before:absolute before:left-[-2px] before:top-1/2 before:-translate-y-1/2 before:content-['']",
              "before:h-[max(24px,100%)] before:w-[max(24px,calc(100%+2px))]",
              "size-[max(calc(var(--cds-h-control-nested)-calc(0.375rem*var(--cds-rem-scale,1))),calc(0.75rem*var(--cds-rem-scale,1)))]",
              "rounded-[calc(var(--cds-h-control-nested)/4-min(calc(0.1875rem*var(--cds-rem-scale,1)),(var(--cds-h-control-nested)-calc(0.75rem*var(--cds-rem-scale,1)))/2))]",
              "-ml-0.5 mr-[calc(min(calc(0.1875rem*var(--cds-rem-scale,1)),(var(--cds-h-control-nested)-calc(0.75rem*var(--cds-rem-scale,1)))/2)-var(--cds-pad-sm))]",
              "text-current outline-none focus-visible:outline-hidden",
              "[--cds-badge-x-wght:577.8] hover:[--cds-badge-x-wght:700]",
              "transition-[color,background-color,box-shadow,--cds-badge-x-wght]",
              bold === true
                ? "hover:bg-[color-mix(in_srgb,currentColor_20%,transparent)]"
                : "hover:bg-[color-mix(in_srgb,currentColor_10%,transparent)]",
              "focus-visible:shadow-focus",
            ),
            {
              className: removeRenderClassName,
              ...removeRenderProps
            }: React.ComponentPropsWithoutRef<"button"> = Object.fromEntries(
              Object.entries(removeRender?.props ?? {}).filter(
                ([, propValue]) => propValue !== undefined,
              ),
            ),
            removeIcon = (
              <Icon
                name={"X"}
                size={"xs"}
                style={{
                  fontVariationSettings:
                    "'opsz' 12, 'wght' var(--cds-badge-x-wght, 577.8)",
                }}
              />
            ),
            removeControl =
              removeRender !== undefined
                ? (0, reactComponentsBadge.cloneElement)(
                    removeRender,
                    npm_mergeProps_Ac(
                      {
                        className: cn(removeButtonClassName, removeRenderClassName),
                        "aria-label": resolvedRemoveLabel,
                        children: removeIcon,
                      },
                      removeRenderProps,
                    ),
                  )
                : onRemove !== undefined && (
                    <button
                      type={"button"}
                      aria-label={resolvedRemoveLabel}
                      onClick={(event: React.MouseEvent<HTMLElement>) => {
                        event.stopPropagation();
                        onRemove();
                      }}
                      onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
                        (event.key === "Enter" || event.key === " ") &&
                          event.stopPropagation();
                      }}
                      onKeyUp={(event: React.KeyboardEvent<HTMLElement>) => {
                        (event.key === "Enter" || event.key === " ") &&
                          event.stopPropagation();
                      }}
                      className={removeButtonClassName}
                    >
                      {removeIcon}
                    </button>
                  ),
            isNamedVariant = isBadgeVariant(resolvedVariant),
            colorClassName =
              bold === true
                ? isNamedVariant
                  ? ComponentsBadgeSolidVariantClassNames[
                      resolvedVariant as BadgeVariant
                    ]
                  : ComponentsBadgeRedOrangeYellowConfig[resolvedVariant as AccentColor]
                : isNamedVariant
                  ? ComponentsBadgeNeutralAccentSuccessConfig[
                      resolvedVariant as BadgeVariant
                    ]
                  : ComponentsBadgeTintAccentClassNames[
                      resolvedVariant as AccentColor
                    ];
          return (
            <span
              ref={forwardedRef}
              data-cds={"Badge"}
              role={iconOnly ? "img" : undefined}
              {...(size === "xxs"
                ? {
                    "data-step": "1",
                  }
                : getSizeAttribute(size))}
              {...props}
              className={cn(
                "inline-flex items-center gap-1 align-middle h-control-nested whitespace-nowrap rounded-chip",
                iconOnly
                  ? "aspect-square w-control-nested justify-center px-0"
                  : "px-sm",
                "font-sans text-caption font-medium leading-[round(1.25em,1px)]",
                truncate ? "min-w-0" : "shrink-0",
                colorClassName,
                className,
              )}
            >
              {typeof icon != "number" &&
                icon && (isIconName(icon) ? (<Icon name={icon} size={iconSize} className={iconClassName} />) : (<span
                    aria-hidden={true}
                    className={cn("inline-flex", iconClassName)}
                  >
                    {icon}
                  </span>))}
              {truncate ? (<span
                  className={cn(
                    labelClassName,
                    "min-w-0 overflow-x-clip text-ellipsis whitespace-nowrap",
                  )}
                >
                  {children}
                </span>) : (length === 1 ? (<span className={labelClassName}>{children}</span>) : (children))}
              {removeControl}
            </span>
          );
        },
      );
      Badge.displayName = "Badge";
    });
  };
}
