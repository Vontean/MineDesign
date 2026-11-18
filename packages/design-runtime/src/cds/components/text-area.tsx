import type { ForwardComponent, TextAreaProps } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { ButtonButtonCss_2, initializeButtonButton_2 } from "../button/button";
import { initializeFieldContext, useFieldInvalid } from "../field/context";
import { cn, initializeClassNames } from "../theme/class-names";
import { getSizeAttribute, initializeCdsRoot } from "../theme/root";
import { initializeNpm__base_ui_react_x7, load_react, load_react_jsx_runtime, npm_Field_qg } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsTextArea: typeof React;
var jsxComponentsTextArea: typeof import("react/jsx-runtime");
var TextArea: ForwardComponent<HTMLTextAreaElement, TextAreaProps>;
var initializeComponentsTextArea: () => void;
export {
  initializeComponentsTextArea,
  jsxComponentsTextArea,
  reactComponentsTextArea,
  TextArea,
};
export function installCdsComponentsTextArea(): () => void {
  return () => {
    initializeComponentsTextArea = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeCdsRoot();
      initializeButtonButton_2();
      initializeFieldContext();
      reactComponentsTextArea = toModuleNamespace(
        load_react(),
      );
      jsxComponentsTextArea = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_x7();
      TextArea = (0, reactComponentsTextArea.forwardRef)<
        HTMLTextAreaElement,
        TextAreaProps
      >(
        (
          {
            className: className,
            rows: rows,
            resize = "none",
            autosize = false,
            bare = false,
            size: size,
            fullWidth = true,
            id: id,
            "aria-describedby": ariaDescribedby,
            "aria-invalid": ariaInvalid,
            disabled: disabled2,
            style: style,
            ...props
          }: TextAreaProps,
          options: React.ForwardedRef<HTMLTextAreaElement>,
        ): React.ReactElement => {
          let value = useFieldInvalid(),
            value2 = rows ?? 3,
            value3 = autosize && rows !== undefined,
            value4 = resize === "y" ? "resize-y" : "resize-none",
            value5 = autosize ? "[field-sizing:content]" : "",
            value6 = value3
              ? bare
                ? "min-h-[calc(var(--cds-textarea-rows)*1lh)]"
                : "min-h-[calc(var(--cds-textarea-rows)*1lh+2*var(--cds-pad-sm))]"
              : "",
            value7 = value3
              ? {
                  ...style,
                  "--cds-textarea-rows": value2,
                }
              : style,
            value8 = fullWidth ? "w-full" : "";
          return (
            <npm_Field_qg.Control
              id={id}
              aria-describedby={ariaDescribedby}
              disabled={disabled2}
              render={
                <textarea
                  ref={options}
                  data-cds={"TextArea"}
                  rows={value2}
                  style={value7}
                  {...getSizeAttribute(size)}
                  data-invalid={value || undefined}
                  aria-invalid={value || ariaInvalid}
                  {...props}
                  className={cn(
                    "cds-reset",
                    value8,
                    bare
                      ? "block resize-none border-0 bg-transparent p-0 shadow-none"
                      : `cds-input font-normal ${ButtonButtonCss_2} enabled:[&:hover:not(:focus):not([data-invalid])]:shadow-field-hover focus-visible:shadow-focus ${value4}`,
                    "font-sans text-body text-primary placeholder:text-muted outline-none focus-visible:outline-hidden disabled:opacity-disabled",
                    value5,
                    value6,
                    className,
                  )}
                />
              }
            />
          );
        },
      );
      TextArea.displayName = "TextArea";
    });
  };
}
