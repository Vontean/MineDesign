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
      className={(0, npm_clsx_Ea)(
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
  input: RadioGroupProps,
): React.ReactElement {
  useUiLocale();
  let {
    value: value,
    defaultValue: value2,
    onChange: value3,
    options: value4,
    disabled: value5,
    size: value6,
    name: value7,
    className: value8,
  } = input;
  return (
    <R_npm_RadioGroup_uF
      data-cds={"RadioGroup"}
      value={value}
      defaultValue={value2}
      onValueChange={value3 ? (input2: string) => value3(input2) : undefined}
      disabled={value5}
      name={value7}
      {...(0, getSizeAttribute)(value6)}
      className={(0, cn)("flex flex-col gap-2 font-sans", value8)}
    >
      {value4.map((input2) =>
        (() => {
          const _Component = RadioGroupItem;
          const _props = {
            value: input2.value,
            label: input2.label,
            description: input2.description,
            disabled: input2.disabled,
          } as const;
          const _key = input2.value;
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
    initializeComponentsRadioGroup = (0, initializeOnce)(() => {
      "use client";

      (0, initializeClassNames)();
      (0, initializeCdsRoot)();
      (0, initializeDomSelectionPrevention)();
      (0, initializeFieldContext)();
      reactComponentsRadioGroup = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      (0, initializeNpm_clsx_xh)();
      jsxComponentsRadioGroup = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
      (0, initializeNpm__base_ui_react_H5)();
      (0, initializeNpm__base_ui_react_zve)();
      (0, initializeNpm__base_ui_react_jve)();
      radioGlyphClasses =
        "flex shrink-0 size-[var(--cds-checkbox)] items-center justify-center rounded-full border border-strong bg-transparent group-hover/rd:border-stronger group-data-[checked]/rd:bg-fill-accent group-data-[checked]/rd:border-0 group-data-[checked]/rd:group-hover/rd:bg-fill-accent-hover group-data-[disabled]/rd:group-hover/rd:border-strong";
      RadioGroupItem = (0, reactComponentsRadioGroup.forwardRef)<
        HTMLButtonElement,
        RadioItemProps
      >(
        (
          {
            value: value,
            label: label,
            description: description,
            disabled: disabled2,
            className: className,
          }: RadioItemProps,
          options: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let value2 = (0, isInsideField)(),
            value3 = (0, reactComponentsRadioGroup.useId)(),
            value4 = (0, reactComponentsRadioGroup.useId)(),
            value5 = (
              <npm_Radio_iP.Root
                ref={options}
                value={value}
                disabled={disabled2}
                aria-labelledby={value3}
                aria-describedby={description ? value4 : undefined}
                onMouseDown={(0, withSelectionPrevention)(undefined)}
                className={(0, cn)(
                  "cds-reset group/rd inline-flex",
                  description ? "items-start" : "items-center",
                  "gap-2 border-0 outline-none focus-visible:outline-hidden text-start text-body font-normal text-primary data-[disabled]:opacity-disabled",
                  className,
                )}
              >
                <RadioGlyph focusRing={true} topAlign={!!description} />
                <span className={"flex min-w-0 flex-col"}>
                  <span id={value3}>{label}</span>
                  {description && (<span
                      id={value4}
                      className={"text-footnote leading-snug text-muted"}
                    >
                      {description}
                    </span>)}
                </span>
              </npm_Radio_iP.Root>
            );
          return value2 ? (
            <R_npm_LabelableProvider_NR>
              {value5}
            </R_npm_LabelableProvider_NR>
          ) : (
            value5
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
            value: value,
            label: label,
            description: description,
            leading: leading,
            trailing: trailing,
            children: children,
            disabled: disabled2,
            className: className,
          }: RadioCardProps,
          options: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let value2 = (0, isInsideField)(),
            value3 = (0, reactComponentsRadioGroup.useId)(),
            value4 = (0, reactComponentsRadioGroup.useId)(),
            value5 = (
              <npm_Radio_iP.Root
                ref={options}
                value={value}
                disabled={disabled2}
                aria-labelledby={value3}
                aria-describedby={description ? value4 : undefined}
                onMouseDown={(0, withSelectionPrevention)(undefined)}
                className={(0, cn)(radioItemClasses, className)}
              >
                <RadioGlyph topAlign={true} />
                {leading ? (<span className={"shrink-0"}>{leading}</span>) : (null)}
                <span className={"flex min-w-0 flex-1 flex-col gap-xs"}>
                  <span className={"flex min-w-0 flex-col"}>
                    <span className={"flex items-start justify-between gap-sm"}>
                      <span id={value3} className={"min-w-0 font-medium"}>
                        {label}
                      </span>
                      {trailing ? (<span className={"shrink-0"}>{trailing}</span>) : (null)}
                    </span>
                    {description && (<span
                        id={value4}
                        className={"text-footnote leading-snug text-muted"}
                      >
                        {description}
                      </span>)}
                  </span>
                  {children}
                </span>
              </npm_Radio_iP.Root>
            );
          return value2 ? (
            <R_npm_LabelableProvider_NR>
              {value5}
            </R_npm_LabelableProvider_NR>
          ) : (
            value5
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
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <R_npm_RadioGroup_uF
            data-cds={"RadioGroup"}
            ref={options}
            {...props}
            {...(0, getSizeAttribute)(size)}
            className={(0, cn)(
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
