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
            disabled: disabledProp,
            style: style,
            ...props
          }: TextAreaProps,
          forwardedRef: React.ForwardedRef<HTMLTextAreaElement>,
        ): React.ReactElement => {
          let isFieldInvalid = useFieldInvalid(),
            rowCount = rows ?? 3,
            hasMinRows = autosize && rows !== undefined,
            resizeClass = resize === "y" ? "resize-y" : "resize-none",
            autosizeClass = autosize ? "[field-sizing:content]" : "",
            minHeightClass = hasMinRows
              ? bare
                ? "min-h-[calc(var(--cds-textarea-rows)*1lh)]"
                : "min-h-[calc(var(--cds-textarea-rows)*1lh+2*var(--cds-pad-sm))]"
              : "",
            textareaStyle = hasMinRows
              ? {
                  ...style,
                  "--cds-textarea-rows": rowCount,
                }
              : style,
            widthClass = fullWidth ? "w-full" : "";
          return (
            <npm_Field_qg.Control
              id={id}
              aria-describedby={ariaDescribedby}
              disabled={disabledProp}
              render={
                <textarea
                  ref={forwardedRef}
                  data-cds={"TextArea"}
                  rows={rowCount}
                  style={textareaStyle}
                  {...getSizeAttribute(size)}
                  data-invalid={isFieldInvalid || undefined}
                  aria-invalid={isFieldInvalid || ariaInvalid}
                  {...props}
                  className={cn(
                    "cds-reset",
                    widthClass,
                    bare
                      ? "block resize-none border-0 bg-transparent p-0 shadow-none"
                      : `cds-input font-normal ${ButtonButtonCss_2} enabled:[&:hover:not(:focus):not([data-invalid])]:shadow-field-hover focus-visible:shadow-focus ${resizeClass}`,
                    "font-sans text-body text-primary placeholder:text-muted outline-none focus-visible:outline-hidden disabled:opacity-disabled",
                    autosizeClass,
                    minHeightClass,
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
