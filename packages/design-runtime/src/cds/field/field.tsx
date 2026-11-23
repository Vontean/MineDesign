import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ComboboxComboboxAssignValue, initializeComboboxFieldClassNames } from "../combobox/combobox";
import { Icon, initializeIconSizeMetrics } from "../components/icon";
import { initializeNumberInput, NumberInput } from "../components/selection-ring";
import { initializeComponentsTextArea, TextArea } from "../components/text-area";
import { initializeComponentsTextInput, TextInput } from "../components/text-input";
import { FieldStateContext, initializeFieldContext } from "./context";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeNpm__base_ui_react_x7, load_react, load_react_jsx_runtime, npm_Field_qg } from "../../dependencies";
import { defineLiveExports, initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactFieldField: Dynamic;
var jsxFieldField: Dynamic;
var FieldFieldFalseTrueConfig: Dynamic;
var FieldRoot: Dynamic;
var FieldLabel: Dynamic;
var FieldDescription: Dynamic;
var FieldError: Dynamic;
var Field: Dynamic;
var FieldControl: Dynamic;
var FieldValidity: Dynamic;
var initializeFieldField: Dynamic;
var reactForFieldTextInput: Dynamic;
var jsxForFieldTextInput: Dynamic;
var FieldTextInput: Dynamic;
var initializeFieldTextInput: Dynamic;
var reactForFieldTextArea: Dynamic;
var jsxForFieldTextArea: Dynamic;
var FieldTextArea: Dynamic;
var initializeFieldTextArea: Dynamic;
var reactForFieldNumberInput: Dynamic;
var jsxForFieldNumberInput: Dynamic;
var FieldNumberInput: Dynamic;
var initializeFieldNumberInput: Dynamic;
var jsxForFieldCombobox: Dynamic;
var initializeFieldCombobox: Dynamic;
var FieldExports: Dynamic;
var initializeFieldComponents: Dynamic;
function FieldCombobox({
  label: label,
  hint: hint,
  error: error,
  required: required,
  fieldClassName: fieldClassName,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  return label == null &&
    hint == null &&
    !error &&
    fieldClassName === undefined &&
    props.mode !== "input" &&
    props.triggerMode !== "chips" ? (
    <ComboboxComboboxAssignValue required={required} {...props} />
  ) : (
    <Field
      label={label}
      hint={hint}
      error={error}
      fieldClassName={fieldClassName}
    >
      <ComboboxComboboxAssignValue required={required} {...props} />
    </Field>
  );
}
export {
  Field,
  FieldCombobox,
  FieldControl,
  FieldDescription,
  FieldError,
  FieldExports,
  FieldFieldFalseTrueConfig,
  FieldLabel,
  FieldNumberInput,
  FieldRoot,
  FieldTextArea,
  FieldTextInput,
  FieldValidity,
  initializeFieldField,
  initializeFieldTextInput,
  initializeFieldTextArea,
  initializeFieldNumberInput,
  initializeFieldCombobox,
  initializeFieldComponents,
  jsxFieldField,
  jsxForFieldTextInput,
  jsxForFieldTextArea,
  jsxForFieldNumberInput,
  jsxForFieldCombobox,
  reactFieldField,
  reactForFieldTextInput,
  reactForFieldTextArea,
  reactForFieldNumberInput,
};
export function installCdsFieldField(): () => void {
  return () => {
    initializeFieldField = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      initializeIconSizeMetrics();
      initializeFieldContext();
      reactFieldField = toModuleNamespace(
        load_react(),
      );
      jsxFieldField = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_x7();
      FieldFieldFalseTrueConfig = {
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
      FieldRoot = (0, reactFieldField.forwardRef)(
        (
          {
            className: className,
            validationMode = "onBlur",
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => (
          <npm_Field_qg.Root
            ref={forwardedRef}
            data-cds={"Field"}
            validationMode={validationMode}
            {...props}
            className={cn(
              "flex flex-col gap-xs font-sans",
              className,
            )}
            render={(domProps?: Dynamic, fieldState?: Dynamic): Dynamic => (
              <FieldStateContext.Provider
                value={
                  FieldFieldFalseTrueConfig[`${fieldState.disabled}`][
                    `${fieldState.valid === false}`
                  ]
                }
              >
                <div {...domProps} />
              </FieldStateContext.Provider>
            )}
          />
        ),
      );
      FieldRoot.displayName = "Field.Root";
      FieldLabel = (0, reactFieldField.forwardRef)(
        (
          { className: className, ...props }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => (
          <npm_Field_qg.Label
            ref={forwardedRef}
            {...props}
            className={cn(
              "text-body font-medium leading-none text-primary",
              className,
            )}
          />
        ),
      );
      FieldLabel.displayName = "Field.Label";
      FieldDescription = (0, reactFieldField.forwardRef)(
        (
          { className: className, ...props }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => (
          <npm_Field_qg.Description
            ref={forwardedRef}
            {...props}
            className={cn(
              "text-footnote font-normal leading-snug text-muted",
              className,
            )}
          />
        ),
      );
      FieldDescription.displayName = "Field.Description";
      FieldError = (0, reactFieldField.forwardRef)(
        (
          { className: className, children: children, ...props }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => (
          <npm_Field_qg.Error
            ref={forwardedRef}
            {...props}
            className={cn(
              "flex items-start gap-1 text-footnote font-normal leading-snug text-danger",
              className,
            )}
            render={(domProps?: Dynamic): Dynamic => (
              <div {...domProps}>
                <Icon
                  name={"WarningCircle"}
                  size={"sm"}
                  className={"mt-px shrink-0"}
                />
                <span>{children ?? (domProps.children)}</span>
              </div>
            )}
          />
        ),
      );
      FieldError.displayName = "Field.Error";
      Field = ({
        label: label,
        hint: hint,
        error: error,
        fieldClassName: fieldClassName,
        children: children,
      }: Dynamic): Dynamic => (
        <FieldRoot invalid={!!error || undefined} className={fieldClassName}>
          {label != null && (<FieldLabel>{label}</FieldLabel>)}
          {children}
          {hint != null && (<FieldDescription>{hint}</FieldDescription>)}
          {!!error && (<FieldError match={true}>{error}</FieldError>)}
        </FieldRoot>
      );
      FieldControl = npm_Field_qg.Control;
      FieldValidity = npm_Field_qg.Validity;
    });
    initializeFieldTextInput = initializeOnce((): Dynamic => {
      "use client";

      initializeComponentsTextInput();
      initializeFieldField();
      reactForFieldTextInput = toModuleNamespace(
        load_react(),
      );
      jsxForFieldTextInput = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      FieldTextInput = (0, reactForFieldTextInput.forwardRef)(
        (
          {
            label: label,
            hint: hint,
            error: error,
            required: required,
            fieldClassName: fieldClassName,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => (
          <Field
            label={label}
            hint={hint}
            error={error}
            fieldClassName={fieldClassName}
          >
            <TextInput ref={forwardedRef} required={required} {...props} />
          </Field>
        ),
      );
      FieldTextInput.displayName = "Field.TextInput";
    });
    initializeFieldTextArea = initializeOnce((): Dynamic => {
      "use client";

      initializeComponentsTextArea();
      initializeFieldField();
      reactForFieldTextArea = toModuleNamespace(
        load_react(),
      );
      jsxForFieldTextArea = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      FieldTextArea = (0, reactForFieldTextArea.forwardRef)(
        (
          {
            label: label,
            hint: hint,
            error: error,
            required: required,
            fieldClassName: fieldClassName,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => (
          <Field
            label={label}
            hint={hint}
            error={error}
            fieldClassName={fieldClassName}
          >
            <TextArea ref={forwardedRef} required={required} {...props} />
          </Field>
        ),
      );
      FieldTextArea.displayName = "Field.TextArea";
    });
    initializeFieldNumberInput = initializeOnce((): Dynamic => {
      "use client";

      initializeNumberInput();
      initializeFieldField();
      reactForFieldNumberInput = toModuleNamespace(
        load_react(),
      );
      jsxForFieldNumberInput = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      FieldNumberInput = (0, reactForFieldNumberInput.forwardRef)(
        (
          {
            label: label,
            hint: hint,
            error: error,
            required: required,
            fieldClassName: fieldClassName,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic => (
          <Field
            label={label}
            hint={hint}
            error={error}
            fieldClassName={fieldClassName}
          >
            <NumberInput ref={forwardedRef} required={required} {...props} />
          </Field>
        ),
      );
      FieldNumberInput.displayName = "Field.NumberInput";
    });
    initializeFieldCombobox = initializeOnce((): Dynamic => {
      "use client";

      initializeComboboxFieldClassNames();
      initializeFieldField();
      jsxForFieldCombobox = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      (FieldCombobox as Dynamic).displayName = "Field.Combobox";
    });
    FieldExports = {};
    defineLiveExports(FieldExports, {
      Combobox: (): Dynamic => FieldCombobox,
      Control: (): Dynamic => FieldControl,
      Description: (): Dynamic => FieldDescription,
      Error: (): Dynamic => FieldError,
      Label: (): Dynamic => FieldLabel,
      NumberInput: (): Dynamic => FieldNumberInput,
      Root: (): Dynamic => FieldRoot,
      TextArea: (): Dynamic => FieldTextArea,
      TextInput: (): Dynamic => FieldTextInput,
      Validity: (): Dynamic => FieldValidity,
    });
    initializeFieldComponents = initializeOnce((): Dynamic => {
      initializeFieldField();
      initializeFieldTextInput();
      initializeFieldTextArea();
      initializeFieldNumberInput();
      initializeFieldCombobox();
    });
  };
}
