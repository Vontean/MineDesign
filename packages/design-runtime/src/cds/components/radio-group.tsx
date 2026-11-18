import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type {
  ForwardComponent,
  RadioCardProps,
  RadioGlyphProps,
  RadioGroupProps,
  RadioItemProps,
  RadioRootProps,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeDomSelectionPrevention, withSelectionPrevention } from "../dom/selection-prevention";
import { initializeFieldContext, isInsideField } from "../field/context";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot } from "../theme/root";
import { initializeNpm__base_ui_react_H5, initializeNpm__base_ui_react_jve, initializeNpm__base_ui_react_zve, initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea, npm_LabelableProvider_NR as R_npm_LabelableProvider_NR, npm_Radio_iP, npm_RadioGroup_uF as R_npm_RadioGroup_uF } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsRadioGroup: typeof React;
var jsxComponentsRadioGroup: typeof import("react/jsx-runtime");
var radioGlyphClasses: string;
var RadioGroupItem: ForwardComponent<HTMLButtonElement, RadioItemProps>;
var radioItemClasses: string;
var RadioGroupCard: ForwardComponent<HTMLButtonElement, RadioCardProps>;
var RadioGroupRoot: ForwardComponent<HTMLDivElement, RadioRootProps>;
var ComponentsRadioGroupAssignValue: typeof RadioGroup & {
  Root: typeof RadioGroupRoot;
  Item: typeof RadioGroupItem;
  Card: typeof RadioGroupCard;
};
var initializeComponentsRadioGroup: () => void;
function RadioGlyph({
  topAlign = false,
  focusRing = false,
}: RadioGlyphProps): React.ReactElement {
  useUiLocale();
  return (
    <span
      className={npm_clsx_Ea(
        radioGlyphClasses,
        focusRing && "group-focus-visible/rd:shadow-focus",
        topAlign && "mt-[calc((1lh_-_var(--cds-checkbox,1rem))_/_2)]",
      )}
    >
      <npm_Radio_iP.Indicator
        className={
          "size-[calc(var(--cds-checkbox,1rem)-calc(0.625rem*var(--cds-rem-scale,1)))] rounded-full bg-[var(--cds-on-accent)] data-[unchecked]:hidden"
        }
        keepMounted={true}
      />
    </span>
  );
}
var RadioGroup: React.FC<RadioGroupProps> = function (
  groupProps: RadioGroupProps,
): React.ReactElement {
  useUiLocale();
  let {
    value: selectedValue,
    defaultValue: defaultValue,
    onChange: onChange,
    options: options,
    disabled: isDisabled,
    size: size,
    name: name,
    className: className,
  } = groupProps;
  return (
    <R_npm_RadioGroup_uF
      data-cds={"RadioGroup"}
      value={selectedValue}
      defaultValue={defaultValue}
      onValueChange={onChange ? (nextValue: string) => onChange(nextValue) : undefined}
      disabled={isDisabled}
      name={name}
      {...getSizeAttribute(size)}
      className={cn("flex flex-col gap-2 font-sans", className)}
    >
      {options.map((option) =>
        (() => {
          const _Component = RadioGroupItem;
          const _props = {
            value: option.value,
            label: option.label,
            description: option.description,
            disabled: option.disabled,
          } as const;
          const _key = option.value;
          return <_Component key={_key} {..._props} />;
        })(),
      )}
    </R_npm_RadioGroup_uF>
  );
};
export {
  ComponentsRadioGroupAssignValue,
  initializeComponentsRadioGroup,
  jsxComponentsRadioGroup,
  RadioGlyph,
  radioGlyphClasses,
  RadioGroup,
  RadioGroupCard,
  RadioGroupItem,
  RadioGroupRoot,
  radioItemClasses,
  reactComponentsRadioGroup,
};
export function installCdsComponentsRadioGroup(): () => void {
  return () => {
    initializeComponentsRadioGroup = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeCdsRoot();
      initializeDomSelectionPrevention();
      initializeFieldContext();
      reactComponentsRadioGroup = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxComponentsRadioGroup = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_H5();
      initializeNpm__base_ui_react_zve();
      initializeNpm__base_ui_react_jve();
      radioGlyphClasses =
        "flex shrink-0 size-[var(--cds-checkbox)] items-center justify-center rounded-full border border-strong bg-transparent group-hover/rd:border-stronger group-data-[checked]/rd:bg-fill-accent group-data-[checked]/rd:border-0 group-data-[checked]/rd:group-hover/rd:bg-fill-accent-hover group-data-[disabled]/rd:group-hover/rd:border-strong";
      RadioGroupItem = (0, reactComponentsRadioGroup.forwardRef)<
        HTMLButtonElement,
        RadioItemProps
      >(
        (
          {
            value: radioValue,
            label: label,
            description: description,
            disabled: isDisabled,
            className: className,
          }: RadioItemProps,
          forwardedRef: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let isInField = isInsideField(),
            labelId = (0, reactComponentsRadioGroup.useId)(),
            descriptionId = (0, reactComponentsRadioGroup.useId)(),
            radioControl = (
              <npm_Radio_iP.Root
                ref={forwardedRef}
                value={radioValue}
                disabled={isDisabled}
                aria-labelledby={labelId}
                aria-describedby={description ? descriptionId : undefined}
                onMouseDown={withSelectionPrevention(undefined)}
                className={cn(
                  "cds-reset group/rd inline-flex",
                  description ? "items-start" : "items-center",
                  "gap-2 border-0 outline-none focus-visible:outline-hidden text-start text-body font-normal text-primary data-[disabled]:opacity-disabled",
                  className,
                )}
              >
                <RadioGlyph focusRing={true} topAlign={!!description} />
                <span className={"flex min-w-0 flex-col"}>
                  <span id={labelId}>{label}</span>
                  {description && (<span
                      id={descriptionId}
                      className={"text-footnote leading-snug text-muted"}
                    >
                      {description}
                    </span>)}
                </span>
              </npm_Radio_iP.Root>
            );
          return isInField ? (
            <R_npm_LabelableProvider_NR>
              {radioControl}
            </R_npm_LabelableProvider_NR>
          ) : (
            radioControl
          );
        },
      );
      RadioGroupItem.displayName = "RadioGroup.Item";
      radioItemClasses =
        "cds-reset group/rd flex w-full items-start gap-md rounded-card border bg-surface-1 p-md text-start text-body font-normal text-primary outline-none focus-visible:outline-hidden hover:border-strong focus-visible:shadow-focus data-[checked]:border-accent data-[checked]:bg-[var(--cds-radio-group-card-selected)] data-[checked]:hover:border-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-disabled";
      RadioGroupCard = (0, reactComponentsRadioGroup.forwardRef)<
        HTMLButtonElement,
        RadioCardProps
      >(
        (
          {
            value: radioValue,
            label: label,
            description: description,
            leading: leading,
            trailing: trailing,
            children: children,
            disabled: isDisabled,
            className: className,
          }: RadioCardProps,
          forwardedRef: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let isInField = isInsideField(),
            labelId = (0, reactComponentsRadioGroup.useId)(),
            descriptionId = (0, reactComponentsRadioGroup.useId)(),
            radioControl = (
              <npm_Radio_iP.Root
                ref={forwardedRef}
                value={radioValue}
                disabled={isDisabled}
                aria-labelledby={labelId}
                aria-describedby={description ? descriptionId : undefined}
                onMouseDown={withSelectionPrevention(undefined)}
                className={cn(radioItemClasses, className)}
              >
                <RadioGlyph topAlign={true} />
                {leading ? (<span className={"shrink-0"}>{leading}</span>) : (null)}
                <span className={"flex min-w-0 flex-1 flex-col gap-xs"}>
                  <span className={"flex min-w-0 flex-col"}>
                    <span className={"flex items-start justify-between gap-sm"}>
                      <span id={labelId} className={"min-w-0 font-medium"}>
                        {label}
                      </span>
                      {trailing ? (<span className={"shrink-0"}>{trailing}</span>) : (null)}
                    </span>
                    {description && (<span
                        id={descriptionId}
                        className={"text-footnote leading-snug text-muted"}
                      >
                        {description}
                      </span>)}
                  </span>
                  {children}
                </span>
              </npm_Radio_iP.Root>
            );
          return isInField ? (
            <R_npm_LabelableProvider_NR>
              {radioControl}
            </R_npm_LabelableProvider_NR>
          ) : (
            radioControl
          );
        },
      );
      RadioGroupCard.displayName = "RadioGroup.Card";
      RadioGroup.displayName = "RadioGroup";
      RadioGroupRoot = (0, reactComponentsRadioGroup.forwardRef)<
        HTMLDivElement,
        RadioRootProps
      >(
        (
          { className: className, size: size, ...props }: RadioRootProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <R_npm_RadioGroup_uF
            data-cds={"RadioGroup"}
            ref={forwardedRef}
            {...props}
            {...getSizeAttribute(size)}
            className={cn(
              "flex flex-col gap-2 font-sans",
              className,
            )}
          />
        ),
      );
      RadioGroupRoot.displayName = "RadioGroup.Root";
      ComponentsRadioGroupAssignValue = Object.assign(RadioGroup, {
        Root: RadioGroupRoot,
        Item: RadioGroupItem,
        Card: RadioGroupCard,
      });
    });
  };
}
