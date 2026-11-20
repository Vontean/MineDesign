import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  PropertyColorPreviewProps,
  PropertyRowProps,
  PropertySectionHeaderProps,
  FieldButtonProps,
  PropertyAction,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { OPEN_OVERLAY_SELECTOR } from "../platform/frame-chrome";
import { Button } from "./buttons";
import { Menu } from "./menu";
import { joinClassNames, KitIcon } from "./property-icons";
import { get_MORE_ACTIONS_LABEL, RESET_LABEL } from "./property-labels";

var reactPropertyRow: ReactNamespace;
var PROPERTY_ROW_INTERACTIVE_SELECTOR: string;
var reactPropertyRowHelpers: ReactNamespace;
var jsxPropertyRowHelpers: JsxNamespace;
var PropertyRowJsx: JsxNamespace;
var FIELD_SURFACE_CLASS: string;
var TEXT_FIELD_BUTTON_CLASS: string;
var CHIP_FIELD_BUTTON_CLASS: string;
var COLOR_SWATCH_CLASS: string;
var FieldButton: React.ForwardRefExoticComponent<
  FieldButtonProps & React.RefAttributes<HTMLButtonElement>
>;
var PROPERTY_SECTION_GUTTER_CLASS: string;
var PROPERTY_ACTIONS_CLASS: string;
function propertyRowPressShouldIgnore(row: HTMLElement, target: Element) {
  if (target.closest(PROPERTY_ROW_INTERACTIVE_SELECTOR)) {
    return true;
  }
  if (target.closest('[data-kit="row-trailing"]')) {
    return true;
  }
  if (target.closest("[data-mc-scrim], [data-base-ui-inert]")) {
    return true;
  }
  let ancestor = target.closest(OPEN_OVERLAY_SELECTOR);
  return ancestor !== null && !ancestor.contains(row);
}
function PropertyColorPreview({
  background: background,
  className: className,
  children: children,
  ...remainingProps
}: PropertyColorPreviewProps) {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      {...remainingProps}
      className={joinClassNames(COLOR_SWATCH_CLASS, className)}
    >
      {[background !== undefined ? (
          <span
            className={"absolute inset-0"}
            style={{
              background: background,
            }}
          />
        ) : null, children]}
    </span>
  );
}
function PropertyRow({
  label: label,
  children: children,
  onReset: onReset,
  resetLabel: resetLabel,
  description: description,
  onPress: onPress,
  disabled: disabled,
  title: title,
  labelProps: labelProps,
  actions: actions,
  actionsLabel = get_MORE_ACTIONS_LABEL(),
  defaultActionsOpen = false,
  trailing: trailing,
  className: className,
  ...remainingProps
}: PropertyRowProps) {
  useUiLocale();
  let value = typeof label === "string" ? label : undefined,
    ref = reactPropertyRow.useRef<HTMLDivElement | null>(null),
    descriptionId = reactPropertyRow.useId(),
    hadDescriptionRef = reactPropertyRow.useRef(false);
  reactPropertyRow.useLayoutEffect(() => {
    if (!description && !hadDescriptionRef.current) {
      return;
    }
    let current = ref.current;
    if (!current) {
      return;
    }
    let controls = current.querySelectorAll(
      'input:not([type="hidden"]), textarea, select, [role="combobox"], [role="radiogroup"], [role="switch"], button[aria-haspopup], button[aria-expanded]',
    );
    for (let control of controls) {
      let descriptionIds = (control.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter((id: string) => id && id !== descriptionId);
      if (description) {
        descriptionIds.push(descriptionId);
      }
      if (descriptionIds.length > 0) {
        control.setAttribute("aria-describedby", descriptionIds.join(" "));
      } else {
        control.removeAttribute("aria-describedby");
      }
    }
    hadDescriptionRef.current = !!description;
  });
  let [actionsOpen, setActionsOpen] = reactPropertyRow.useState(defaultActionsOpen),
    availableActions =
      actions !== undefined && actions.length > 0 ? actions : undefined;
  if (availableActions === undefined && actionsOpen) {
    setActionsOpen(false);
  }
  let resetTouchedRef = reactPropertyRow.useRef(false);
  return (
    <div
      data-property-row={""}
      {...remainingProps}
      title={title}
      onClick={
        onPress && !disabled
          ? (event: React.MouseEvent<HTMLDivElement>) => {
              if (
                propertyRowPressShouldIgnore(
                  event.currentTarget,
                  event.target as Element,
                )
              ) {
                return;
              }
              onPress(event.currentTarget);
            }
          : undefined
      }
      className={joinClassNames(
        "group/row grid min-w-0 shrink-0 items-center gap-x-sm py-px",
        PROPERTY_SECTION_GUTTER_CLASS,
        label !== undefined
          ? "grid-cols-[var(--pp-label-w,80px)_minmax(0,1fr)] pointer-coarse:grid-cols-[calc(var(--pp-label-w,80px)*13/12)_minmax(0,1fr)]"
          : "grid-cols-[minmax(0,1fr)]",
        "min-h-[var(--prop-row-h,32px)] pointer-coarse:min-h-[var(--prop-row-h,40px)]",
        disabled && "cursor-not-allowed",
        className,
      )}
    >
      {[label !== undefined && (
          <div
            className={joinClassNames(
              "flex min-w-0 items-center",
              disabled && "opacity-50",
            )}
          >
            {[<span
                title={title === undefined ? (value) : (undefined)}
                {...labelProps}
                className={joinClassNames(
                  "min-w-0 truncate text-footnote text-muted select-none",
                  labelProps?.className,
                )}
              >
                {label}
              </span>, onReset && !disabled && (
                <span
                  className={joinClassNames(
                    "flex w-0 shrink-0 overflow-hidden",
                    "focus-within:w-auto focus-within:overflow-visible",
                    "group-hover/row:w-auto group-hover/row:overflow-visible",
                    "pointer-coarse:w-auto pointer-coarse:overflow-visible",
                  )}
                >
                  <Button
                    variant={"ghost"}
                    size={"xs"}
                    iconOnly={true}
                    icon={"ArrowCounterClockwise"}
                    aria-label={
                      (resetLabel) ?? (value ? (((RESET_LABEL) + (" ")) + (value)) : (RESET_LABEL))
                    }
                    tooltipSide={"left"}
                    disabled={disabled}
                    onPointerDown={(
                      pointerEvent: React.PointerEvent<HTMLButtonElement>,
                    ) => {
                      resetTouchedRef.current = pointerEvent.pointerType === "touch";
                    }}
                    onClick={(mouseEvent: React.MouseEvent<HTMLButtonElement>) => {
                      let focusTarget = mouseEvent.currentTarget
                          .closest("[data-property-row]")
                          ?.querySelector<HTMLElement>(
                            'input, button:not([data-kit="row-reset"]), [tabindex="0"]',
                          ),
                        current = resetTouchedRef.current;
                      resetTouchedRef.current = false;
                      let targetsEditable =
                        focusTarget?.matches(
                          "input, textarea, [contenteditable]",
                        ) ?? false;
                      if (focusTarget && !(current && targetsEditable)) {
                        focusTarget.focus();
                      }
                      onReset();
                    }}
                    data-kit={"row-reset"}
                    className={"ml-xs shrink-0"}
                  />
                </span>
              )]}
          </div>
        ), <div
          ref={ref}
          className={joinClassNames(
            "flex min-w-0 items-center gap-2",
            trailing === undefined &&
              "pr-[calc(var(--pp-iconcol,-4px)+4px)] pointer-coarse:pr-[calc(var(--pp-iconcol,-8px)+8px)]",
          )}
        >
          {[children, description ? (
              <span id={descriptionId} hidden={true} data-kit={"row-description"}>
                {description}
              </span>
            ) : null, availableActions !== undefined ? (
              <Menu
                iconOnly={true}
                icon={"DotsHorizontal"}
                variant={"ghost"}
                aria-label={actionsLabel}
                tooltip={actionsLabel}
                align={"end"}
                disabled={disabled}
                open={actionsOpen}
                onOpenChange={setActionsOpen}
                items={availableActions.map((action: PropertyAction) => ({
                  label: action.label,
                  onSelect: action.onSelect,
                  variant: action.variant,
                  disabled: action.disabled,
                  separatorBefore: action.separatorBefore,
                }))}
                className={"-ml-1 pointer-coarse:ml-0 shrink-0"}
              />
            ) : null, trailing !== undefined ? (
              <span
                data-kit={"row-trailing"}
                className={joinClassNames(
                  "-ml-1 pointer-coarse:ml-0 flex w-[var(--pp-iconcol,auto)] shrink-0 items-center justify-center",
                  PROPERTY_ACTIONS_CLASS,
                )}
              >
                {trailing}
              </span>
            ) : null]}
        </div>]}
    </div>
  );
}
function PropertySectionHeader({
  title: title,
  actions: actions,
  collapsed: collapsed,
  onToggle: onToggle,
  subsection: subsection,
  className: className,
}: PropertySectionHeaderProps) {
  useUiLocale();
  let value = onToggle !== undefined,
    headerClasses = joinClassNames(
      "flex min-w-0 shrink-0 items-center gap-xs select-none",
      PROPERTY_SECTION_GUTTER_CLASS,
      subsection
        ? "pt-2 pb-1 text-footnote font-semibold text-secondary"
        : "min-h-10 border-t border-alpha-2 py-2 text-body-semibold text-primary first:border-t-0",
      className,
    ),
    collapseCaret = value ? (
      <span
        aria-hidden={"true"}
        className={
          "-my-1 flex size-control shrink-0 items-center justify-center"
        }
      >
        <KitIcon
          name={"CaretRight"}
          size={16}
          className={joinClassNames(
            "text-secondary transition-transform duration-fast",
            !collapsed && "rotate-90",
          )}
        />
      </span>
    ) : null;
  if (value && !actions) {
    return (
      <h3 className={"contents"}>
        <button
          type={"button"}
          aria-expanded={!collapsed}
          onClick={onToggle}
          className={joinClassNames(
            headerClasses,
            "w-full cursor-default text-left outline-none focus-visible:outline-hidden focus-visible:shadow-focus",
          )}
        >
          {[<span className={"min-w-0 flex-1 truncate"}>{title}</span>, collapseCaret]}
        </button>
      </h3>
    );
  }
  return (
    <div
      onClick={
        value
          ? (event: React.MouseEvent<HTMLDivElement>) => {
              if (
                propertyRowPressShouldIgnore(
                  event.currentTarget,
                  event.target as Element,
                )
              ) {
                return;
              }
              onToggle!();
            }
          : undefined
      }
      className={joinClassNames(
        headerClasses,
        value && "cursor-default",
      )}
    >
      {[<h3 className={"contents"}>
          {value ? (<button
              type={"button"}
              aria-expanded={!collapsed}
              onClick={(mouseEvent: React.MouseEvent<HTMLElement>) => {
                mouseEvent.stopPropagation();
                onToggle!();
              }}
              className={
                "-my-1 min-w-0 flex-1 cursor-default truncate rounded-sm py-1 text-left text-inherit outline-none focus-visible:outline-hidden focus-visible:shadow-focus"
              }
            >
              {title}
            </button>) : (<span className={"min-w-0 flex-1 truncate"}>{title}</span>)}
        </h3>, actions ? (
          <span
            className={joinClassNames(
              "-my-1 flex shrink-0 items-center gap-0.5",
              PROPERTY_ACTIONS_CLASS,
            )}
            onClick={
              value
                ? (mouseEvent: React.MouseEvent<HTMLElement>) =>
                    mouseEvent.stopPropagation()
                : undefined
            }
          >
            {actions}
          </span>
        ) : null, collapseCaret]}
    </div>
  );
}
export {
  CHIP_FIELD_BUTTON_CLASS,
  COLOR_SWATCH_CLASS,
  FIELD_SURFACE_CLASS,
  FieldButton,
  PropertyRowJsx as jsxForUiPropertyRow2,
  jsxPropertyRowHelpers,
  PROPERTY_ACTIONS_CLASS,
  PROPERTY_ROW_INTERACTIVE_SELECTOR,
  PROPERTY_SECTION_GUTTER_CLASS,
  PropertyColorPreview,
  PropertyRow,
  propertyRowPressShouldIgnore,
  PropertySectionHeader,
  reactPropertyRow as reactForUiPropertyRow2,
  reactPropertyRowHelpers,
  TEXT_FIELD_BUTTON_CLASS,
};
export function installUiPropertyRow(): () => void {
  return () => {
    reactPropertyRow = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    PROPERTY_ROW_INTERACTIVE_SELECTOR =
      'button,input,select,textarea,label,[role="slider"],[role="switch"],[role="radio"],[role="checkbox"],[role="menuitem"]';
    reactPropertyRowHelpers = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxPropertyRowHelpers = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    PropertyRowJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    FIELD_SURFACE_CLASS =
      "rounded bg-fill-field text-primary shadow-field-ring outline-none transition duration-fast placeholder:text-muted enabled:hover:shadow-field-hover focus-visible:outline-hidden focus-visible:shadow-focus aria-expanded:shadow-field-hover disabled:opacity-50";
    TEXT_FIELD_BUTTON_CLASS = joinClassNames(
      "h-control min-w-0 px-md text-body pointer-coarse:h-10",
      FIELD_SURFACE_CLASS,
    );
    CHIP_FIELD_BUTTON_CLASS = joinClassNames(
      "flex h-control min-w-0 items-center gap-sm pr-md pl-1 text-left text-body pointer-coarse:h-10",
      FIELD_SURFACE_CLASS,
    );
    COLOR_SWATCH_CLASS =
      "relative inline-block h-4 w-4 shrink-0 overflow-hidden rounded-[4px] shadow-card-ring bg-[repeating-conic-gradient(var(--cds-alpha-2)_0_25%,transparent_0_50%)] bg-[length:8px_8px]";
    FieldButton = reactPropertyRow.forwardRef(function (
      {
        chip: chip,
        children: children,
        caption: caption,
        muted: muted,
        trailing: trailing,
        className: className,
        type = "button",
        ...props
      }: FieldButtonProps,
      forwardedRef: React.ForwardedRef<HTMLButtonElement>,
    ) {
      return (
        <button
          {...props}
          ref={forwardedRef}
          type={type}
          className={joinClassNames(
            chip != null
              ? CHIP_FIELD_BUTTON_CLASS
              : joinClassNames(
                  TEXT_FIELD_BUTTON_CLASS,
                  "flex items-center gap-sm text-left",
                ),
            "flex-1",
            className,
          )}
        >
          {[chip, <span
              className={joinClassNames(
                "min-w-0 flex-1 truncate",
                muted && "text-muted",
              )}
            >
              {children}
            </span>, caption !== undefined && caption !== null ? (
              <span className={"text-caption text-muted"}>{caption}</span>
            ) : null, trailing]}
        </button>
      );
    });
    PROPERTY_SECTION_GUTTER_CLASS =
      "pl-[var(--pp-gutter-l,var(--cds-pad-lg))] pr-[var(--pp-gutter-r,var(--cds-pad-md))]";
    PROPERTY_ACTIONS_CLASS =
      "[&_[data-cds=Button][aria-label]:not([aria-pressed=true])]:text-secondary";
  };
}
