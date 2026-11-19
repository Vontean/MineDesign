import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { MenuMenuAssignValue } from "../../cds/menu/menu";
import { joinClassNames } from "../chrome/overlay-state";
import { ColorContrastCopyLabel, ResetValue } from "../color/contrast-copy";
import { reactInspectorContext_4 } from "../inspector/context-part-2";
import { isNestedPropertyControl, PropertiesPrimitivesClassNames_3, PropertiesPrimitivesClassNames_4 } from "./primitives";

function PropertyRow({
  label: label,
  children: children,
  onReset: onReset,
  resetLabel: resetLabel,
  description: description,
  onPress: onPress,
  disabled: isDisabled,
  title: title,
  labelProps: labelProps,
  actions: actions,
  actionsLabel = ColorContrastCopyLabel,
  defaultActionsOpen = false,
  trailing: trailing,
  className: className,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let labelText: Dynamic = typeof label == "string" ? label : undefined,
    contentRef: Dynamic = (0, reactInspectorContext_4.useRef)(null),
    descriptionId: Dynamic = (0, reactInspectorContext_4.useId)(),
    hadDescriptionRef: Dynamic = (0, reactInspectorContext_4.useRef)(false);
  (0, reactInspectorContext_4.useLayoutEffect)((): Dynamic => {
    if (!description && !hadDescriptionRef.current) return;
    let rowElement: Dynamic = contentRef.current;
    if (!rowElement) return;
    let focusableControls: Dynamic = rowElement.querySelectorAll(
      'input:not([type="hidden"]), textarea, select, [role="combobox"], [role="radiogroup"], [role="switch"], button[aria-haspopup], button[aria-expanded]',
    );
    for (let control of focusableControls as Dynamic) {
      let describedByIds: Dynamic = (control.getAttribute("aria-describedby") ?? "")
        .split(/\s+/)
        .filter((id?: Dynamic): Dynamic => id && id !== descriptionId);
      description && describedByIds.push(descriptionId);
      describedByIds.length > 0
        ? control.setAttribute("aria-describedby", describedByIds.join(" "))
        : control.removeAttribute("aria-describedby");
    }
    hadDescriptionRef.current = !!description;
  });
  let [isActionsOpen, setIsActionsOpen]: Dynamic = (0,
    reactInspectorContext_4.useState)(defaultActionsOpen),
    menuActions: Dynamic =
      actions !== undefined && actions.length > 0 ? actions : undefined;
  menuActions === undefined && isActionsOpen && setIsActionsOpen(false);
  let isTouchPressRef: Dynamic = (0, reactInspectorContext_4.useRef)(false);
  return (
    <div
      data-property-row={""}
      {...props}
      title={title}
      onClick={
        onPress && !isDisabled
          ? (event?: Dynamic): Dynamic => {
              isNestedPropertyControl(
                event.currentTarget,
                event.target,
              ) || onPress(event.currentTarget);
            }
          : undefined
      }
      className={joinClassNames(
        "group/row grid min-w-0 shrink-0 items-center gap-x-sm py-px",
        PropertiesPrimitivesClassNames_3,
        label !== undefined
          ? "grid-cols-[var(--pp-label-w,80px)_minmax(0,1fr)] pointer-coarse:grid-cols-[calc(var(--pp-label-w,80px)*13/12)_minmax(0,1fr)]"
          : "grid-cols-[minmax(0,1fr)]",
        "min-h-[var(--prop-row-h,32px)] pointer-coarse:min-h-[var(--prop-row-h,40px)]",
        isDisabled && "cursor-not-allowed",
        className,
      )}
    >
      {label !== undefined && (<div
          className={joinClassNames(
            "flex min-w-0 items-center",
            isDisabled && "opacity-50",
          )}
        >
          <span
            title={title === undefined ? (labelText) : (undefined)}
            {...labelProps}
            className={joinClassNames(
              "min-w-0 truncate text-footnote text-muted select-none",
              labelProps?.className,
            )}
          >
            {label}
          </span>
          {onReset && !isDisabled && (<span
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
                  (resetLabel) ?? (labelText ? (((ResetValue) + (" ")) + (labelText)) : (ResetValue))
                }
                tooltipSide={"left"}
                disabled={isDisabled}
                onPointerDown={(event?: Dynamic): Dynamic => {
                  isTouchPressRef.current = event.pointerType === "touch";
                }}
                onClick={(event?: Dynamic): Dynamic => {
                  let firstControl: Dynamic = event.currentTarget
                      .closest("[data-property-row]")
                      ?.querySelector(
                        'input, button:not([data-kit="row-reset"]), [tabindex="0"]',
                      ),
                    wasTouchPress: Dynamic = isTouchPressRef.current;
                  isTouchPressRef.current = false;
                  let isTextEntry: Dynamic =
                    firstControl?.matches("input, textarea, [contenteditable]") ??
                    false;
                  firstControl && !(wasTouchPress && isTextEntry) && firstControl.focus();
                  onReset();
                }}
                data-kit={"row-reset"}
                className={"ml-xs shrink-0"}
              />
            </span>)}
        </div>)}
      <div
        ref={contentRef}
        className={joinClassNames(
          "flex min-w-0 items-center gap-2",
          trailing === undefined &&
            "pr-[calc(var(--pp-iconcol,-4px)+4px)] pointer-coarse:pr-[calc(var(--pp-iconcol,-8px)+8px)]",
        )}
      >
        {children}
        {description ? (<span id={descriptionId} hidden={true} data-kit={"row-description"}>
            {description}
          </span>) : (null)}
        {menuActions !== undefined ? (<MenuMenuAssignValue
            iconOnly={true}
            icon={"DotsHorizontal"}
            variant={"ghost"}
            aria-label={actionsLabel}
            tooltip={actionsLabel}
            align={"end"}
            disabled={isDisabled}
            open={isActionsOpen}
            onOpenChange={setIsActionsOpen}
            items={menuActions.map(
              (action?: Dynamic): Dynamic => ({
                label: action.label,
                onSelect: action.onSelect,
                variant: action.variant,
                disabled: action.disabled,
                separatorBefore: action.separatorBefore,
              }),
            )}
            className={"-ml-1 pointer-coarse:ml-0 shrink-0"}
          />) : (null)}
        {trailing !== undefined ? (<span
            data-kit={"row-trailing"}
            className={joinClassNames(
              "-ml-1 pointer-coarse:ml-0 flex w-[var(--pp-iconcol,auto)] shrink-0 items-center justify-center",
              PropertiesPrimitivesClassNames_4,
            )}
          >
            {trailing}
          </span>) : (null)}
      </div>
    </div>
  );
}
export {
  PropertyRow,
};
export function installEditorPropertiesRow(): () => void {
  return () => {};
}
