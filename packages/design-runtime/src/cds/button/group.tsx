import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button, Button as Button_r, ButtonGroupOptionsContext, buttonIconPadding, initializeButtonButton, useButtonIconSize } from "./button";
import { Icon, initializeIconSizeMetrics } from "../components/icon";
import { initializeXmlNamespaceUris, isHtmlElement, isSvgElement } from "../dom/ref-composition";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeMenuComponents, menuCaretSize, MenuMenuAssignValue } from "../menu/menu";
import { initializeLabelsProviderContext, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot, useDensity } from "../theme/root";
import { initializeTooltipTooltip, TooltipGroup } from "../tooltip/tooltip";
import { getResizeObserver, initializeTooltipTriggerPlaceholder } from "../tooltip/trigger";
import { initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactButtonGroup: Dynamic;
var jsxButtonGroup: Dynamic;
var ButtonGroupClassNames: Dynamic;
var ButtonGroupSecondaryPrimaryDangerConfig: Dynamic;
var buttonGroupJoinClasses: Dynamic;
var ButtonGroupLabel: Dynamic;
var initializeButtonGroup: Dynamic;
var reactForSplitButton: Dynamic;
var jsxForSplitButton: Dynamic;
var ButtonGroupAspectRatioPaddingInlineMinWidthConfig: Dynamic;
var ButtonGroupWidthConfig: Dynamic;
var ButtonGroupPaddingInlineEndConfig: Dynamic;
var splitLabelShrinkClassName: Dynamic;
var splitStatusPaddingStyle: Dynamic;
var ButtonGroupPrimarySecondaryGhostConfig: Dynamic;
var splitStatusTransitionClassName: Dynamic;
var PeerDisabledNotAriaBusySlotOpacityDisabledValue: Dynamic;
var ButtonGroupPaddingInlineStartConfig: Dynamic;
var splitSeparatorHitAreaClassName: Dynamic;
var splitCaretGhostHitAreaClassName: Dynamic;
var GroupDataPopupOpenSplitPointerEventsNoneValue: Dynamic;
var squareEndRadiusClassName: Dynamic;
var roundedEndClassName: Dynamic;
var ButtonGroupJoinValue: Dynamic;
var splitJoinedSegmentPaddingClassName: Dynamic;
var initializeSplitButton: Dynamic;
var ButtonGroupObservedElements: Dynamic;
var initializeButtonGroupObserver: Dynamic;
var reactForButtonGroup: Dynamic;
var jsxForButtonGroup: Dynamic;
var initializeButtonGroupComponent: Dynamic;
function ButtonGroupDivider({ variant: variant }: Dynamic): Dynamic {
  useUiLocale();
  let seamStyle: Dynamic = ButtonGroupSecondaryPrimaryDangerConfig[variant];
  if (!seamStyle)
    return (
      <span aria-hidden={true} className={"w-px shrink-0 self-stretch"} />
    );
  let seamOpacityClassName: Dynamic = variant === "secondary" ? "" : ButtonGroupLabel;
  return (
    <span
      aria-hidden={true}
      className={`relative w-px shrink-0 self-stretch ${seamStyle.seam} ${buttonGroupJoinClasses} ${seamOpacityClassName}`}
    >
      <span
        data-cds-seam-line={""}
        className={`absolute inset-x-0 inset-y-[4px] ${seamStyle.line}`}
      />
    </span>
  );
}
function ButtonGroupLayout({
  "aria-label": ariaLabel,
  variant = "spaced",
  orientation = "horizontal",
  size: size,
  buttonVariant = "secondary",
  className: className,
  children: children,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let isJoined: Dynamic = variant === "joined",
    childArray: Dynamic = reactButtonGroup.Children.toArray(children),
    lastChildIndex: Dynamic = childArray.length - 1,
    hasJoinedSeams: Dynamic = isJoined && lastChildIndex > 0,
    optionsByPosition: Dynamic = (0, reactButtonGroup.useMemo)((): Dynamic => {
      let state: Dynamic = {
        size: size,
        buttonVariant: buttonVariant,
        enforceVariant: isJoined,
      };
      return {
        start: {
          ...state,
          joined: hasJoinedSeams ? "start" : undefined,
        },
        middle: {
          ...state,
          joined: hasJoinedSeams ? "middle" : undefined,
        },
        end: {
          ...state,
          joined: hasJoinedSeams ? "end" : undefined,
        },
      };
    }, [size, buttonVariant, isJoined, hasJoinedSeams]);
  return (
    <div
      data-cds={"ButtonGroup"}
      {...props}
      role={"group"}
      aria-label={ariaLabel}
      {...getSizeAttribute(size)}
      className={cn(
        "relative inline-flex w-fit shrink-0",
        orientation === "vertical"
          ? "flex-col items-stretch"
          : "items-stretch",
        hasJoinedSeams
          ? `rounded ${buttonVariant === "secondary" ? `shadow-field-drop ${ButtonGroupClassNames}` : ""}`
          : isJoined
            ? ""
            : "gap-xs",
        className,
      )}
    >
      <TooltipGroup>
        {childArray.map((childElement?: Dynamic, childIndex?: Dynamic): Dynamic => {
          let segmentPosition: Dynamic =
            childIndex === 0 ? "start" : childIndex === lastChildIndex ? "end" : "middle";
          return (() => {
            const _Component = reactButtonGroup.Fragment;
            const _props = {
              children: [
                hasJoinedSeams && childIndex > 0 && (
                  <ButtonGroupDivider variant={buttonVariant} />
                ),
                <ButtonGroupOptionsContext.Provider
                  value={optionsByPosition[segmentPosition]}
                >
                  <div data-cds-segment={""} className={"contents"}>
                    {childElement}
                  </div>
                </ButtonGroupOptionsContext.Provider>,
              ],
            } as const;
            const _key = (0, reactButtonGroup.isValidElement)(childElement)
              ? childElement.key
              : childIndex;
            return <_Component key={_key} {..._props} />;
          })();
        })}
      </TooltipGroup>
    </div>
  );
}
function SplitButton({
  variant = "secondary",
  size: size,
  label: label,
  icon: icon,
  shortcut: shortcut,
  tooltip = false,
  tooltipSide: tooltipSide,
  "aria-label": ariaLabel,
  "aria-expanded": ariaExpanded,
  "aria-haspopup": ariaHaspopup,
  "aria-controls": ariaControls,
  "aria-keyshortcuts": ariaKeyshortcuts,
  onPrimaryClick: onPrimaryClick,
  onPrimaryPointerDown: onPrimaryPointerDown,
  onPrimaryMouseDown: onPrimaryMouseDown,
  pressed: pressed,
  menuLabel: menuLabel,
  items: items,
  disabled: isDisabled,
  busy: busy,
  status: status,
  caretSize: caretSize,
  side: side,
  align = "end",
  collisionPadding: collisionPadding,
  open: open,
  onOpenChange: onOpenChange,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let defaultMenuLabel: Dynamic = useLabel("moreOptions", "More options"),
    resolvedMenuLabel: Dynamic = menuLabel ?? defaultMenuLabel,
    density: Dynamic = useDensity(),
    resolvedCaretSize: Dynamic = caretSize ?? menuCaretSize(density, size),
    isCaretMuted: Dynamic =
      !isDisabled && (variant === "secondary" || variant === "ghost"),
    [internalOpen, setInternalOpen]: Dynamic = (0, reactForSplitButton.useState)(false),
    isOpen: Dynamic = open ?? internalOpen,
    handleOpenChange: Dynamic = (nextOpen?: Dynamic): Dynamic => {
      setInternalOpen(nextOpen);
      onOpenChange?.(nextOpen);
    },
    hasStatus: Dynamic = status != null && status !== false,
    isGhostWithLabel: Dynamic = variant === "ghost" && label !== undefined && !hasStatus,
    isGhostIconOnly: Dynamic = variant === "ghost" && label === undefined && !hasStatus,
    isGhostWithStatus: Dynamic = variant === "ghost" && hasStatus,
    isGhostCompact: Dynamic = isGhostWithLabel || isGhostIconOnly,
    iconPadding: Dynamic = buttonIconPadding(
      useButtonIconSize(size),
    ),
    caretButtonStyle: Dynamic =
      variant !== "ghost"
        ? ButtonGroupAspectRatioPaddingInlineMinWidthConfig
        : isGhostWithLabel
          ? ButtonGroupPaddingInlineStartConfig
          : isGhostIconOnly
            ? {
                ...ButtonGroupWidthConfig,
                "--cds-split-caret-tuck": iconPadding,
                marginInlineStart: `calc(-1 * ${iconPadding})`,
              }
            : ButtonGroupWidthConfig,
    primarySegment: Dynamic = (
      <div className={"contents"}>
        {label === undefined ? (<Button
            busy={busy}
            disabled={isDisabled}
            pressed={pressed}
            onClick={onPrimaryClick}
            onPointerDown={onPrimaryPointerDown}
            onMouseDown={onPrimaryMouseDown}
            icon={icon}
            iconOnly={true}
            aria-label={ariaLabel ?? ("")}
            aria-expanded={ariaExpanded}
            aria-haspopup={ariaHaspopup}
            aria-controls={ariaControls}
            {...(ariaKeyshortcuts !== undefined
              ? {
                  "aria-keyshortcuts": ariaKeyshortcuts,
                }
              : undefined)}
            tooltip={tooltip}
            tooltipSide={tooltipSide}
            className={npm_clsx_Ea(
              hasStatus && "peer/slot",
              isGhostWithStatus && squareEndRadiusClassName,
              isGhostIconOnly && GroupDataPopupOpenSplitPointerEventsNoneValue,
            )}
          />) : (<Button
            busy={busy}
            disabled={isDisabled}
            pressed={pressed}
            onClick={onPrimaryClick}
            onPointerDown={onPrimaryPointerDown}
            onMouseDown={onPrimaryMouseDown}
            aria-expanded={ariaExpanded}
            aria-haspopup={ariaHaspopup}
            aria-controls={ariaControls}
            {...(ariaKeyshortcuts !== undefined
              ? {
                  "aria-keyshortcuts": ariaKeyshortcuts,
                }
              : undefined)}
            icon={icon}
            shortcut={shortcut}
            className={npm_clsx_Ea(
              splitLabelShrinkClassName,
              hasStatus && "peer/slot",
              isGhostWithStatus && squareEndRadiusClassName,
            )}
            style={
              isGhostWithLabel
                ? ButtonGroupPaddingInlineEndConfig
                : hasStatus
                  ? splitStatusPaddingStyle
                  : undefined
            }
          >
            {label}
          </Button>)}
        {hasStatus && (<span
            className={cn(
              "flex shrink-0 items-center self-stretch pe-md",
              isGhostWithStatus && roundedEndClassName,
              ButtonGroupSecondaryPrimaryDangerConfig[variant]?.seam,
              ButtonGroupPrimarySecondaryGhostConfig[variant],
              splitStatusTransitionClassName,
              PeerDisabledNotAriaBusySlotOpacityDisabledValue,
            )}
          >
            {status}
          </span>)}
      </div>
    );
  return (
    <ButtonGroupLayout
      data-cds={"SplitDropdownButton"}
      aria-label={typeof label == "string" ? (label) : (ariaLabel ?? (resolvedMenuLabel))}
      variant={"joined"}
      buttonVariant={variant}
      size={size}
      className={cn(
        "group/split",
        isGhostCompact && ButtonGroupJoinValue,
        isGhostWithLabel && splitJoinedSegmentPaddingClassName,
        className,
      )}
      data-popup-open={isOpen ? "" : undefined}
      data-disabled={isDisabled || undefined}
      style={
        isGhostCompact
          ? {
              "--cds-split-inset": `min(calc(${iconPadding} / 2), calc(0.1875rem * var(--cds-rem-scale, 1)))`,
            }
          : undefined
      }
    >
      {primarySegment}
      <MenuMenuAssignValue
        iconOnly={true}
        icon={
          <Icon
            name={"CaretDown"}
            size={resolvedCaretSize}
            className={isCaretMuted ? "text-muted" : undefined}
          />
        }
        aria-label={resolvedMenuLabel}
        tooltip={false}
        disabled={isDisabled}
        className={
          variant === "ghost"
            ? cn(
                splitSeparatorHitAreaClassName,
                isGhostIconOnly && splitCaretGhostHitAreaClassName,
              )
            : undefined
        }
        items={items}
        side={side}
        align={align}
        collisionPadding={collisionPadding}
        open={open}
        onOpenChange={handleOpenChange}
        style={caretButtonStyle}
      />
    </ButtonGroupLayout>
  );
}
function isSingleRowFlex(element?: Dynamic): Dynamic {
  let computedStyle: Dynamic = getComputedStyle(element);
  return (
    computedStyle.display.endsWith("flex") &&
    !computedStyle.flexDirection.startsWith("column") &&
    !computedStyle.flexWrap.startsWith("wrap")
  );
}
function elementInnerWidth(element?: Dynamic): Dynamic {
  let computedStyle: Dynamic = getComputedStyle(element);
  return (
    element.getBoundingClientRect().width -
    (Number.parseFloat(computedStyle.paddingLeft) || 0) -
    (Number.parseFloat(computedStyle.paddingRight) || 0) -
    (Number.parseFloat(computedStyle.borderLeftWidth) || 0) -
    (Number.parseFloat(computedStyle.borderRightWidth) || 0)
  );
}
function flexRowWidth(
  container?: Dynamic,
  excludedElement?: Dynamic,
  firstChildWidth?: Dynamic,
): Dynamic {
  return (
    firstChildWidth +
    flexSiblingWidth(
      container,
      excludedElement,
      Number.parseFloat(getComputedStyle(container).columnGap) || 0,
    )
  );
}
function flexSiblingWidth(
  container?: Dynamic,
  excludedElement?: Dynamic,
  gap?: Dynamic,
): Dynamic {
  let index: Dynamic = 0;
  for (let child of Array.from(container.children) as Dynamic) {
    if (child === excludedElement || !isHtmlElement(child)) continue;
    let childStyle: Dynamic = getComputedStyle(child);
    if (
      childStyle.position === "absolute" ||
      childStyle.position === "fixed" ||
      childStyle.display === "none"
    )
      continue;
    if (childStyle.display === "contents") {
      index += flexSiblingWidth(child, excludedElement, gap);
      continue;
    }
    if (childStyle.flexShrink === "0" && childStyle.flexGrow === "0") {
      index += child.getBoundingClientRect().width + gap;
      continue;
    }
    let flexBasisWidth: Dynamic = parsePixelLength(childStyle.flexBasis),
      attribute: Dynamic = child.getAttribute("style"),
      cssText: Dynamic = child.style.cssText;
    child.style.flex = "0 0 auto";
    child.style.width = "min-content";
    let width: Dynamic = child.getBoundingClientRect().width;
    restoreFlexInlineStyle(child, attribute, cssText);
    index += Math.max(width, flexBasisWidth) + gap;
  }
  return index;
}
function restoreFlexInlineStyle(
  element?: Dynamic,
  originalStyleAttribute?: Dynamic,
  originalCssText?: Dynamic,
): Dynamic {
  if (originalStyleAttribute === null) {
    element.removeAttribute("style");
    return;
  }
  let cssText: Dynamic = element.style.cssText;
  if (!ButtonGroupObservedElements.has(element.ownerDocument)) {
    element.setAttribute("style", originalStyleAttribute);
    if (!(cssText !== originalCssText && element.style.cssText === cssText)) return;
    ButtonGroupObservedElements.add(element.ownerDocument);
  }
  element.style.cssText = originalCssText;
}
function parsePixelLength(cssLength?: Dynamic): Dynamic {
  return /^\d*\.?\d+px$/.test(cssLength) ? Number.parseFloat(cssLength) : 0;
}
function flexContentBounds(container?: Dynamic): Dynamic {
  let minLeft: Dynamic = Number.POSITIVE_INFINITY,
    maxRight: Dynamic = Number.NEGATIVE_INFINITY;
  for (let child of Array.from(container.children) as Dynamic) {
    if (
      !isHtmlElement(child) &&
      !isSvgElement(child)
    )
      continue;
    let position: Dynamic = getComputedStyle(child).position;
    if (position === "absolute" || position === "fixed") continue;
    let bounds: Dynamic = child.getBoundingClientRect();
    (bounds.width <= 0 && bounds.height <= 0) ||
      ((minLeft = Math.min(minLeft, bounds.left)),
      (maxRight = Math.max(maxRight, bounds.right)));
  }
  if (maxRight < minLeft) return 0;
  let containerStyle: Dynamic = getComputedStyle(container);
  return (
    maxRight -
    minLeft +
    (Number.parseFloat(containerStyle.paddingLeft) || 0) +
    (Number.parseFloat(containerStyle.paddingRight) || 0)
  );
}
function ButtonGroup(groupProps?: Dynamic): Dynamic {
  useUiLocale();
  let {
      variant: variant = "spaced",
      orientation: orientation = "horizontal",
      children: children,
      size: size,
      buttonVariant: buttonVariant = "secondary",
    }: Dynamic = groupProps,
    isSpacedHorizontal: Dynamic = variant === "spaced" && orientation === "horizontal",
    parsedChildren: Dynamic = (0, reactForButtonGroup.useMemo)(
      (): Dynamic => (isSpacedHorizontal ? parseButtonGroupChildren(children) : null),
      [isSpacedHorizontal, children],
    ),
    isCollapsible: Dynamic = parsedChildren !== null && parsedChildren !== "unrecognised";
  parsedChildren === "unrecognised" && undefined;
  let containerRef: Dynamic = (0, reactForButtonGroup.useRef)(null),
    [isCollapsed, setIsCollapsed]: Dynamic = (0, reactForButtonGroup.useState)(false),
    expandedWidthRef: Dynamic = (0, reactForButtonGroup.useRef)(0);
  useIsomorphicLayoutEffect((): Dynamic => {
    if (!isCollapsible) return;
    let current: Dynamic = containerRef.current,
      parentElement: Dynamic = current?.parentElement ?? null;
    if (current === null || parentElement === null) return;
    let ResizeObserverClass: Dynamic = getResizeObserver(parentElement);
    if (ResizeObserverClass === undefined) return;
    let checkOverflow: Dynamic = (): Dynamic => {
      let availableWidth: Dynamic = elementInnerWidth(parentElement);
      if (availableWidth <= 0) return;
      if (!isSingleRowFlex(parentElement)) {
        isCollapsed && setIsCollapsed(false);
        return;
      }
      if (isCollapsed) {
        availableWidth >= expandedWidthRef.current + 64 && setIsCollapsed(false);
        return;
      }
      let firstSegment: Dynamic = current.firstElementChild;
      if (!isHtmlElement(firstSegment)) return;
      let requiredWidth: Dynamic = flexRowWidth(
        parentElement,
        current,
        firstSegment.getBoundingClientRect().width,
      );
      expandedWidthRef.current = requiredWidth;
      availableWidth < requiredWidth && setIsCollapsed(true);
    };
    checkOverflow();
    let observer: Dynamic = new ResizeObserverClass(checkOverflow);
    observer.observe(parentElement);
    let firstElementChild: Dynamic = current.firstElementChild;
    isHtmlElement(firstElementChild) &&
      observer.observe(firstElementChild);
    return (): Dynamic => observer.disconnect();
  }, [isCollapsible, isCollapsed]);
  if (!isSpacedHorizontal) return <ButtonGroupLayout {...groupProps} />;
  let showsCollapsed: Dynamic = isCollapsible && isCollapsed;
  return (
    <span
      ref={containerRef}
      className={"contents"}
      data-cds-collapsing={isCollapsible ? "" : undefined}
      data-collapsed={showsCollapsed ? "" : undefined}
    >
      {showsCollapsed ? (<SplitButton
          {...(parsedChildren.primary.iconOnly && parsedChildren.primary.icon !== undefined
            ? {
                icon: parsedChildren.primary.icon,
                "aria-label": parsedChildren.primary.label,
              }
            : {
                label: parsedChildren.primary.label,
              })}
          variant={parsedChildren.primary.variant ?? buttonVariant}
          size={size}
          pressed={parsedChildren.primary.pressed}
          disabled={parsedChildren.primary.disabled}
          onPrimaryClick={parsedChildren.primary.onClick}
          items={parsedChildren.overflow}
          className={groupProps.className}
        />) : (<ButtonGroupLayout {...groupProps} />)}
    </span>
  );
}
function componentHasDisplayName(
  element?: Dynamic,
  displayName?: Dynamic,
): Dynamic {
  return element.type?.displayName === displayName;
}
function sameComponentType(element?: Dynamic, componentType?: Dynamic): Dynamic {
  let displayName: Dynamic = element.type?.displayName;
  return element.type === componentType || (!!displayName && displayName === componentType.displayName);
}
function flattenReactFragments(children?: Dynamic): Dynamic {
  return reactForButtonGroup.Children.toArray(children).flatMap(
    (child?: Dynamic): Dynamic =>
      (0, reactForButtonGroup.isValidElement)(child) &&
      child.type === reactForButtonGroup.Fragment
        ? reactForButtonGroup.Children.toArray(child.props.children)
        : [child],
  );
}
function parseButtonGroupChildren(children?: Dynamic): Dynamic {
  let flatChildren: Dynamic = flattenReactFragments(children);
  if (flatChildren.length < 2) return null;
  let items: Dynamic = [],
    primaryButton: Dynamic = null;
  for (let child of flatChildren as Dynamic) {
    if (!(0, reactForButtonGroup.isValidElement)(child))
      return "unrecognised";
    if (sameComponentType(child, Button_r)) {
      let props: Dynamic = child.props;
      if ("href" in props && props.href !== undefined) return "unrecognised";
      let iconName: Dynamic =
          typeof props.icon == "string" ? props.icon : undefined,
        buttonLabel: Dynamic =
          props.iconOnly === true
            ? props["aria-label"]
            : typeof props.children == "string"
              ? props.children
              : null;
      if (buttonLabel === null) return "unrecognised";
      let onClick: Dynamic = props.onClick;
      if (
        onClick === undefined ||
        props.type === "submit" ||
        props.type === "reset" ||
        "render" in props
      )
        return null;
      primaryButton === null
        ? (primaryButton = {
            label: buttonLabel,
            icon: iconName,
            iconOnly: props.iconOnly === true,
            onClick: onClick,
            pressed: props.pressed,
            disabled: props.disabled,
            variant: props.variant,
          })
        : items.push({
            icon: iconName,
            label: buttonLabel,
            disabled: props.disabled,
            onSelect: onClick,
            shortcut: "shortcut" in props ? props.shortcut : undefined,
            ...(props.pressed !== undefined && {
              checked: props.pressed,
              checkedRole: "checkbox",
              keepOpen: true,
            }),
          });
    } else if (componentHasDisplayName(child, "DropdownButton")) {
      let props: Dynamic = child.props;
      if (!Array.isArray(props.items)) return "unrecognised";
      let dropdownLabel: Dynamic =
        props.trigger === "label" || props.trigger === undefined
          ? typeof props.label == "string"
            ? props.label
            : null
          : props["aria-label"];
      if (dropdownLabel === null) return "unrecognised";
      items.push({
        icon: "icon" in props ? props.icon : undefined,
        label: dropdownLabel,
        disabled: props.disabled,
        items: props.items,
      });
    } else return "unrecognised";
  }
  return primaryButton === null ||
    (primaryButton.disabled === true &&
      items.some((item?: Dynamic): Dynamic => item.disabled !== true))
    ? null
    : {
        primary: primaryButton,
        overflow: items,
      };
}
export {
  ButtonGroup,
  ButtonGroupAspectRatioPaddingInlineMinWidthConfig,
  ButtonGroupClassNames,
  splitSeparatorHitAreaClassName,
  squareEndRadiusClassName,
  roundedEndClassName,
  ButtonGroupDivider,
  buttonGroupJoinClasses,
  ButtonGroupJoinValue,
  ButtonGroupLabel,
  ButtonGroupLayout,
  ButtonGroupObservedElements,
  ButtonGroupPaddingInlineEndConfig,
  ButtonGroupPaddingInlineStartConfig,
  ButtonGroupPrimarySecondaryGhostConfig,
  ButtonGroupSecondaryPrimaryDangerConfig,
  ButtonGroupWidthConfig,
  componentHasDisplayName,
  elementInnerWidth,
  flattenReactFragments,
  flexContentBounds,
  flexRowWidth,
  flexSiblingWidth,
  GroupDataPopupOpenSplitPointerEventsNoneValue,
  initializeButtonGroup,
  initializeSplitButton,
  initializeButtonGroupObserver,
  initializeButtonGroupComponent,
  isSingleRowFlex,
  jsxButtonGroup,
  jsxForSplitButton,
  jsxForButtonGroup,
  parseButtonGroupChildren,
  parsePixelLength,
  PeerDisabledNotAriaBusySlotOpacityDisabledValue,
  reactButtonGroup,
  reactForSplitButton,
  reactForButtonGroup,
  restoreFlexInlineStyle,
  sameComponentType,
  SplitButton,
};
export function installCdsButtonGroup(): () => void {
  return () => {
    initializeButtonGroup = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeCdsRoot();
      initializeTooltipTooltip();
      initializeButtonButton();
      reactButtonGroup = toModuleNamespace(
        load_react(),
      );
      jsxButtonGroup = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ButtonGroupClassNames =
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:[box-shadow:inset_0_0_0_1px_var(--cds-fill-secondary-ring)]";
      ButtonGroupSecondaryPrimaryDangerConfig = {
        secondary: {
          seam: "bg-fill-secondary",
          line: "bg-border",
        },
        primary: {
          seam: "bg-fill-primary",
          line: "bg-[var(--cds-on-primary)] opacity-25",
        },
        danger: {
          seam: "bg-fill-danger",
          line: "bg-[var(--cds-on-danger)] opacity-25",
        },
        brand: {
          seam: "bg-fill-brand",
          line: "bg-[var(--cds-on-brand)] opacity-25",
        },
      };
      buttonGroupJoinClasses =
        "[[data-cds-segment]:hover+&>[data-cds-seam-line]]:opacity-0 [&:has(+[data-cds-segment]:hover)>[data-cds-seam-line]]:opacity-0 [[data-cds-segment]:has([aria-haspopup][aria-expanded=true])+&>[data-cds-seam-line]]:opacity-0 [&:has(+[data-cds-segment]_[aria-haspopup][aria-expanded=true])>[data-cds-seam-line]]:opacity-0 [[data-cds-segment]:has([aria-pressed=true])+&>[data-cds-seam-line]]:opacity-0 [&:has(+[data-cds-segment]_[aria-pressed=true])>[data-cds-seam-line]]:opacity-0";
      ButtonGroupLabel =
        "[[data-cds-segment]:has(:disabled:not([aria-busy]))+&:has(+[data-cds-segment]_:disabled:not([aria-busy]))]:opacity-disabled";
    });
    initializeSplitButton = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeLabelsProviderContext();
      initializeCdsRoot();
      initializeIconSizeMetrics();
      initializeButtonButton();
      initializeMenuComponents();
      initializeButtonGroup();
      reactForSplitButton = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxForSplitButton = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ButtonGroupAspectRatioPaddingInlineMinWidthConfig = {
        get aspectRatio() { return uiMessage("canvas.group.auto"); },
        paddingInline: 4,
        minWidth: 0,
      };
      ButtonGroupWidthConfig = {
        ...ButtonGroupAspectRatioPaddingInlineMinWidthConfig,
        width: "auto",
      };
      ButtonGroupPaddingInlineEndConfig = {
        paddingInlineEnd: 5,
      };
      splitLabelShrinkClassName = "min-w-0 shrink";
      splitStatusPaddingStyle = {
        paddingInlineEnd: 4,
      };
      ButtonGroupPrimarySecondaryGhostConfig = {
        primary: "peer-hover/slot:bg-fill-primary-hover",
        secondary: "peer-hover/slot:bg-fill-secondary-hover",
        ghost: "peer-hover/slot:bg-fill-ghost-hover",
        danger: "peer-hover/slot:bg-fill-danger-hover",
        brand: "peer-hover/slot:bg-fill-brand-hover",
      };
      splitStatusTransitionClassName = "transition-colors duration-fast ease-out";
      PeerDisabledNotAriaBusySlotOpacityDisabledValue =
        "peer-[:disabled:not([aria-busy])]/slot:opacity-disabled";
      ButtonGroupPaddingInlineStartConfig = {
        ...ButtonGroupWidthConfig,
        paddingInlineStart: 0,
      };
      splitSeparatorHitAreaClassName =
        "after:absolute after:inset-y-0 after:start-0 after:-end-2 after:content-['']";
      splitCaretGhostHitAreaClassName =
        "pointer-events-none after:pointer-events-auto after:start-[calc(var(--cds-split-caret-tuck)-1px)] after:-end-[calc(3px+var(--cds-split-caret-tuck))]";
      GroupDataPopupOpenSplitPointerEventsNoneValue =
        "group-data-[popup-open]/split:pointer-events-none";
      squareEndRadiusClassName = "rounded-e-none";
      roundedEndClassName = "rounded-e";
      ButtonGroupJoinValue = [
        "shadow-[inset_0_0_0_1px_var(--cds-split-ring,transparent)] transition-[box-shadow] duration-fast ease-out",
        "[&:not([data-disabled])]:hover:[--cds-split-ring:var(--cds-border)]",
        "data-[popup-open]:[--cds-split-ring:var(--cds-border)]",
        "[&:not([data-disabled])]:has-[[aria-pressed=true]]:[--cds-split-ring:var(--cds-border)]",
        "[&_[data-cds-part=paint]]:p-(--cds-split-inset) [&_[data-cds-part=paint]]:bg-clip-content",
      ].join(" ");
      splitJoinedSegmentPaddingClassName =
        "[&>[data-cds-segment]:first-child_[data-cds-part=paint]]:pe-0 [&>[data-cds-segment]:last-child_[data-cds-part=paint]]:ps-0";
    });
    initializeButtonGroupObserver = initializeOnce((): Dynamic => {
      initializeXmlNamespaceUris();
      ButtonGroupObservedElements = new WeakSet();
    });
    initializeButtonGroupComponent = initializeOnce((): Dynamic => {
      "use client";

      initializeHooksLayoutEffect();
      initializeXmlNamespaceUris();
      initializeTooltipTriggerPlaceholder();
      initializeButtonButton();
      initializeButtonGroupObserver();
      initializeButtonGroup();
      initializeSplitButton();
      reactForButtonGroup = toModuleNamespace(
        load_react(),
      );
      jsxForButtonGroup = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      (ButtonGroup as Dynamic).displayName = "ButtonGroup";
    });
  };
}
