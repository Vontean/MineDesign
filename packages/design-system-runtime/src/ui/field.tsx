import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseField, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { defineLiveExports, toModuleNamespace } from "../module-helpers";
import { FieldCheckbox } from "./checkbox";
import { FieldCombobox } from "./combobox";
import { cn, Icon, initializeClassNames, initializeIcons } from "./interactions";
import { NumberInput } from "./number-input";
import { TextArea } from "./text-area";
import { textFieldStateContext, TextInput, useFieldLabelId } from "./text-input";

var FieldComponents: C.FieldComponents;
var reactField: typeof React;
var jsxField: typeof import("react/jsx-runtime");
var FIELD_DISABLED_INVALID_STATES: Record<
  "true" | "false",
  Record<"true" | "false", C.FieldState>
>;
var FieldRoot: C.ForwardComponent<HTMLDivElement, C.FieldRootProps>;
var FieldLabel: C.ForwardComponent<HTMLLabelElement, C.FieldLabelProps>;
var FieldDescription: C.ForwardComponent<
  HTMLParagraphElement,
  C.FieldDescriptionProps
>;
var FieldError: C.ForwardComponent<HTMLDivElement, C.FieldErrorProps>;
var FieldWrapper: React.FunctionComponent<C.FieldWrapperProps>;
var FieldRootWithLabel: typeof import("@base-ui/react/field").Field.Control;
var FieldRow: typeof import("@base-ui/react/field").Field.Validity;
var reactFieldTextInput: typeof React;
var jsxFieldTextInput: typeof import("react/jsx-runtime");
var FieldTextInput: C.ForwardComponent<
  HTMLInputElement,
  C.FieldTextInputProps
>;
var reactFieldTextArea: typeof React;
var jsxFieldTextArea: typeof import("react/jsx-runtime");
var FieldTextArea: C.ForwardComponent<
  HTMLTextAreaElement,
  C.FieldTextAreaProps
>;
var reactFieldNumberInput: typeof React;
var jsxFieldNumberInput: typeof import("react/jsx-runtime");
var FieldNumberInput: C.ForwardComponent<
  HTMLInputElement,
  C.FieldNumberInputProps
>;
export {
  FIELD_DISABLED_INVALID_STATES,
  FieldComponents,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldNumberInput,
  FieldRoot,
  FieldRootWithLabel,
  FieldRow,
  FieldTextArea,
  FieldTextInput,
  FieldWrapper,
  jsxField,
  jsxFieldNumberInput,
  jsxFieldTextArea,
  jsxFieldTextInput,
  reactField,
  reactFieldNumberInput,
  reactFieldTextArea,
  reactFieldTextInput,
};
export function installUiField(): () => void {
  return () => {
    FieldComponents = {} as C.FieldComponents;
    (0, defineLiveExports)(FieldComponents, {
      Validity: () => FieldRow,
      TextInput: () => FieldTextInput,
      TextArea: () => FieldTextArea,
      Root: () => FieldRoot,
      NumberInput: () => FieldNumberInput,
      Label: () => FieldLabel,
      Error: () => FieldError,
      Description: () => FieldDescription,
      Control: () => FieldRootWithLabel,
      Combobox: () => FieldCombobox,
      Checkbox: () => FieldCheckbox,
    });
    (0, initializeClassNames)();
    (0, initializeIcons)();
    reactField = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxField = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    FIELD_DISABLED_INVALID_STATES = {
      false: {
        false: {
          invalid: false,
          disabled: false,
        },
        true: {
          invalid: true,
          disabled: false,
        },
      },
      true: {
        false: {
          invalid: false,
          disabled: true,
        },
        true: {
          invalid: true,
          disabled: true,
        },
      },
    };
    FieldRoot = reactField.forwardRef(
      (
        {
          className: className,
          validationMode = "onBlur",
          ...props
        }: C.FieldRootProps,
        options: React.ForwardedRef<HTMLDivElement>,
      ) => (
        <baseField.Root
          ref={options}
          data-cds={"Field"}
          validationMode={validationMode}
          {...props}
          className={(0, cn)(
            "flex flex-col gap-xs font-sans",
            className,
          )}
          render={(
            input: React.HTMLAttributes<HTMLDivElement>,
            options2: import("@base-ui/react/field").Field.Root.State,
          ) => (
            <textFieldStateContext.Provider
              value={
                FIELD_DISABLED_INVALID_STATES[`${options2.disabled}`][
                  `${options2.valid === false}`
                ]
              }
            >
              <div {...input} />
            </textFieldStateContext.Provider>
          )}
        />
      ),
    );
    FieldRoot.displayName = "Field.Root";
    FieldLabel = reactField.forwardRef(
      (
        { className: className, id: id, ...props }: C.FieldLabelProps,
        options: React.ForwardedRef<HTMLLabelElement>,
      ) => {
        let value: string | undefined = (0, useFieldLabelId)();
        return (
          <baseField.Label
            ref={options}
            id={id ?? value}
            {...props}
            className={(0, cn)(
              "text-body font-medium leading-none text-primary",
              className,
            )}
          />
        );
      },
    );
    FieldLabel.displayName = "Field.Label";
    FieldDescription = reactField.forwardRef(
      (
        { className: className, ...props }: C.FieldDescriptionProps,
        options: React.ForwardedRef<HTMLParagraphElement>,
      ) => (
        <baseField.Description
          ref={options}
          {...props}
          className={(0, cn)(
            "text-footnote font-normal leading-snug text-muted",
            className,
          )}
        />
      ),
    );
    FieldDescription.displayName = "Field.Description";
    FieldError = reactField.forwardRef(
      (
        {
          className: className,
          children: children,
          ...props
        }: C.FieldErrorProps,
        options: React.ForwardedRef<HTMLDivElement>,
      ) => (
        <baseField.Error
          ref={options}
          {...props}
          className={(0, cn)(
            "flex items-start gap-1 text-footnote font-normal leading-snug text-danger",
            className,
          )}
          render={(input: React.HTMLAttributes<HTMLDivElement>) => (
            <div {...input}>
              {[<Icon
                  name={"WarningCircle"}
                  size={"sm"}
                  className={"mt-px shrink-0"}
                />, <span>{children ?? (input.children)}</span>]}
            </div>
          )}
        />
      ),
    );
    FieldError.displayName = "Field.Error";
    FieldWrapper = ({
      label: label,
      hint: hint,
      error: error,
      fieldClassName: fieldClassName,
      children: children,
    }: C.FieldWrapperProps) => (
      <FieldRoot
        invalid={Boolean(error) || undefined}
        className={fieldClassName}
      >
        {[label !== undefined && label !== null && (
            <FieldLabel>{label}</FieldLabel>
          ), children, hint !== undefined && hint !== null && (
            <FieldDescription>{hint}</FieldDescription>
          ), Boolean(error) && <FieldError match={true}>{error}</FieldError>]}
      </FieldRoot>
    );
    FieldRootWithLabel = baseField.Control;
    FieldRow = baseField.Validity;
    reactFieldTextInput = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxFieldTextInput = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    FieldTextInput = reactFieldTextInput.forwardRef(
      (
        {
          label: label,
          hint: hint,
          error: error,
          required: required,
          fieldClassName: fieldClassName,
          ...props
        }: C.FieldTextInputProps,
        options: React.ForwardedRef<HTMLInputElement>,
      ) => (
        <FieldWrapper
          label={label}
          hint={hint}
          error={error}
          fieldClassName={fieldClassName}
        >
          <TextInput ref={options} required={required} {...props} />
        </FieldWrapper>
      ),
    );
    FieldTextInput.displayName = "Field.TextInput";
    reactFieldTextArea = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxFieldTextArea = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    FieldTextArea = reactFieldTextArea.forwardRef(
      (
        {
          label: label,
          hint: hint,
          error: error,
          required: required,
          fieldClassName: fieldClassName,
          ...props
        }: C.FieldTextAreaProps,
        options: React.ForwardedRef<HTMLTextAreaElement>,
      ) => (
        <FieldWrapper
          label={label}
          hint={hint}
          error={error}
          fieldClassName={fieldClassName}
        >
          <TextArea ref={options} required={required} {...props} />
        </FieldWrapper>
      ),
    );
    FieldTextArea.displayName = "Field.TextArea";
    reactFieldNumberInput = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxFieldNumberInput = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    FieldNumberInput = reactFieldNumberInput.forwardRef(
      (
        {
          label: label,
          hint: hint,
          error: error,
          required: required,
          fieldClassName: fieldClassName,
          ...props
        }: C.FieldNumberInputProps,
        options: React.ForwardedRef<HTMLInputElement>,
      ) => (
        <FieldWrapper
          label={label}
          hint={hint}
          error={error}
          fieldClassName={fieldClassName}
        >
          <NumberInput ref={options} required={required} {...props} />
        </FieldWrapper>
      ),
    );
    FieldNumberInput.displayName = "Field.NumberInput";
  };
}
