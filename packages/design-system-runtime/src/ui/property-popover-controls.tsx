import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  PropertyPopoverPanelProps,
  ShadowPropertyEditorProps,
  PropertyPopoverProps,
  RemovePropertyButtonProps,
  PropertyPopoverTriggerProps,
  ShadowValue,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "./buttons";
import { hsvaToHexColor, parseCssColorToHsva } from "./color/picker";
import { PropertyNumberInput } from "./number-controls";
import { joinClassNames } from "./property-icons";
import { COLOR_LABEL } from "./property-labels";
import { PropertyPopup } from "./property-popover";
import { FieldButton, PropertyRow } from "./property-row";
import { ColorChip, ColorTextPropertyRow, NumberPropertyRow } from "./property-rows";

var reactPropertyPopoverControls: ReactNamespace;
var jsxPropertyPopoverControls: JsxNamespace;
var jsxPropertyPopoverActions: JsxNamespace;
var reactdC: ReactNamespace;
var jsxcC: JsxNamespace;
var PropertyPopoverTrigger: React.ForwardRefExoticComponent<
  PropertyPopoverTriggerProps & React.RefAttributes<HTMLButtonElement>
>;
function PropertyPopoverPanel({
  title: title,
  onClose: onClose,
  labelWidth = "3rem",
  children: children,
}: PropertyPopoverPanelProps) {
  useUiLocale();
  return (
    <div
      role={"dialog"}
      aria-label={typeof title === "string" ? (title) : (undefined)}
      className={"flex flex-col py-sm"}
      style={{
        ["--pp-label-w"]: labelWidth,
        ["--pp-gutter-l"]: "var(--cds-pad-md)",
      } as import("../contracts/controls").DesignStyle}
      data-kit={"effect-editor"}
    >
      {[<div className={"flex items-center pr-xs pb-xs pl-md"}>
          {[<h3
              className={
                "min-w-0 flex-1 truncate text-body-semibold text-primary"
              }
            >
              {title}
            </h3>, <Button
              variant={"ghost"}
              size={"sm"}
              iconOnly={true}
              icon={"X"}
              aria-label={uiMessage("design-system.propertyPopoverControls.close")}
              tooltip={uiMessage("design-system.propertyPopoverControls.close")}
              onClick={onClose}
            />]}
        </div>, children]}
    </div>
  );
}
function ShadowPropertyEditor({
  title: title,
  value: value,
  onChange: onChange,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  onClose: onClose,
  spread = true,
  bounds = {},
  disabled: disabled,
  swatches: swatches,
  unifiedPopover: unifiedPopover,
  editsAreUndoSteps: editsAreUndoSteps,
}: ShadowPropertyEditorProps) {
  useUiLocale();
  let callback = (input: Partial<ShadowValue>) =>
      onChange({
        ...value,
        ...input,
      }),
    callback2 = (input: "x" | "y" | "blur" | "spread") =>
      onLive && onLiveEnd
        ? {
            onScrub: (input2: number) =>
              onLive({
                ...value,
                [input]: input2,
              }),
            onScrubEnd: onLiveEnd,
          }
        : {};
  return (
    <PropertyPopoverPanel title={title} onClose={onClose}>
      {[<PropertyRow
          label={uiMessage("design-system.propertyPopoverControls.offset")}
          disabled={disabled}
          onPress={(element: HTMLElement) =>
            element.querySelector("input")?.focus()
          }
        >
          <div className={"flex min-w-0 flex-1 items-center gap-2"}>
            {[<PropertyNumberInput
                aria-label={uiMessage("design-system.propertyPopoverControls.horizontalOffset")}
                prefix={"X"}
                steppers={false}
                value={value.x}
                onValue={(input: number | undefined) =>
                  input !== undefined &&
                  callback({
                    x: input,
                  })
                }
                disabled={disabled}
                {...bounds.x}
                {...callback2("x")}
              />, <PropertyNumberInput
                aria-label={uiMessage("design-system.propertyPopoverControls.verticalOffset")}
                prefix={"Y"}
                steppers={false}
                value={value.y}
                onValue={(input: number | undefined) =>
                  input !== undefined &&
                  callback({
                    y: input,
                  })
                }
                disabled={disabled}
                {...bounds.y}
                {...callback2("y")}
              />]}
          </div>
        </PropertyRow>, <NumberPropertyRow
          label={uiMessage("design-system.propertyPopoverControls.blur")}
          unit={"px"}
          value={value.blur}
          onValue={(input: number | undefined) =>
            input !== undefined &&
            callback({
              blur: input,
            })
          }
          disabled={disabled}
          min={0}
          {...bounds.blur}
          {...callback2("blur")}
        />, spread && (
          <NumberPropertyRow
            label={uiMessage("design-system.propertyPopoverControls.spread")}
            unit={"px"}
            value={value.spread ?? 0}
            onValue={(input: number | undefined) =>
              input !== undefined &&
              callback({
                spread: input,
              })
            }
            disabled={disabled}
            {...bounds.spread}
            {...callback2("spread")}
          />
        ), <ColorTextPropertyRow
          label={uiMessage("design-system.propertyPopoverControls.color")}
          value={value.color}
          disabled={disabled}
          swatches={swatches}
          popoverTitle={unifiedPopover ? COLOR_LABEL : undefined}
          editsAreUndoSteps={editsAreUndoSteps}
          onChange={(input: string | undefined) =>
            input !== undefined &&
            callback({
              color: input,
            })
          }
          {...(onLive && onLiveEnd
            ? {
                onLive: (input: string) =>
                  onLive({
                    ...value,
                    color: input,
                  }),
                onLiveEnd: () => onLiveEnd!(),
              }
            : {})}
        />]}
    </PropertyPopoverPanel>
  );
}
function PropertyPopover({
  open: open,
  onOpenChange: onOpenChange,
  trigger: trigger,
  anchor: anchor,
  side = "left",
  focusOnOpen: focusOnOpen,
  className: className,
  editsAreUndoSteps: editsAreUndoSteps,
  children: children,
}: PropertyPopoverProps) {
  useUiLocale();
  return (
    <PropertyPopup
      open={open}
      onOpen={() => onOpenChange(true)}
      onClose={() => onOpenChange(false)}
      trigger={trigger}
      side={side}
      positionAnchor={anchor}
      focusOnOpen={focusOnOpen}
      padding={"none"}
      className={joinClassNames(
        "w-[14.5rem] pointer-coarse:w-[17rem]",
        className,
      )}
      editsAreUndoSteps={editsAreUndoSteps}
    >
      {children}
    </PropertyPopup>
  );
}
function RemovePropertyButton({
  label: label,
  onClick: onClick,
  disabled: disabled,
  disabledReason: disabledReason,
}: RemovePropertyButtonProps) {
  useUiLocale();
  let value = uiMessage("design-system.propertyPopoverControls.remove") + label.toLowerCase();
  return (
    <Button
      variant={"ghost"}
      iconOnly={true}
      icon={"Minus"}
      aria-label={value}
      tooltip={value}
      disabled={disabled}
      disabledReason={disabledReason}
      onClick={onClick}
      className={"shrink-0"}
    />
  );
}
export {
  jsxcC,
  jsxPropertyPopoverActions,
  jsxPropertyPopoverControls,
  PropertyPopover,
  PropertyPopoverPanel,
  PropertyPopoverTrigger,
  reactdC,
  reactPropertyPopoverControls,
  RemovePropertyButton,
  ShadowPropertyEditor,
};
export function installUiPropertyPopoverControls(): () => void {
  return () => {
    reactPropertyPopoverControls = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxPropertyPopoverControls = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    jsxPropertyPopoverActions = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactdC = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxcC = toModuleNamespace(loadJsxNamespace(), 1);
    PropertyPopoverTrigger = reactdC.forwardRef(function (
      {
        label: label,
        color: color,
        text: text,
        open: open,
        onClick: onClick,
        disabled: disabled,
        ...props
      }: PropertyPopoverTriggerProps,
      options: React.ForwardedRef<HTMLButtonElement>,
    ) {
      let memo = reactdC.useMemo(
        () =>
          typeof color === "string"
            ? parseCssColorToHsva(color)
            : undefined,
        [color],
      );
      return (
        <FieldButton
          {...(open !== undefined
            ? {
                "aria-haspopup": "dialog",
                "aria-expanded": open,
              }
            : undefined)}
          {...props}
          ref={options}
          aria-label={((label) + (": ")) + (text)}
          disabled={disabled}
          onClick={onClick}
          chip={
            color !== undefined ? (
              <ColorChip
                hex={memo ? hsvaToHexColor(memo) : null}
                alpha={(memo?.a ?? 1) * 100}
              />
            ) : undefined
          }
          caption={
            memo !== undefined ? Math.round(memo.a * 100) + "%" : undefined
          }
        >
          {text}
        </FieldButton>
      );
    });
  };
}
