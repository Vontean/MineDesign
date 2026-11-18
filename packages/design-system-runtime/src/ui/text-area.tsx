/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseField, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { initializeIsomorphicLayoutEffect, useIsomorphicLayoutEffect } from "./foundation";
import { cn, initializeClassNames, initializeMergedRefs, initializeTranslations, useMergedRefs } from "./interactions";
import { getControlSizeAttributes, initializeCdsRoot } from "./overlays";
import { textAreaBaseClasses, useFieldInvalid } from "./text-input";

var reactHu: typeof React;
var supportsNativeFieldSizing: boolean;
var reactForUiTextArea: typeof React;
var jsxFu: typeof import("react/jsx-runtime");
var TextArea: C.ForwardComponent<HTMLTextAreaElement, C.TextAreaProps>;
function resizeTextAreaToContent(
  input: HTMLTextAreaElement,
  options: React.RefObject<string>,
) {
  if (
    input.clientWidth === 0 ||
    (input.style.height !== options.current && input.style.height !== "")
  ) {
    return;
  }
  let offsetHeight = input.offsetHeight,
    value = offsetHeight - input.clientHeight,
    { overflowY: style, marginBottom: style2 } = input.style;
  input.style.height = "0px";
  input.style.marginBottom = `${offsetHeight}px`;
  input.style.overflowY = "hidden";
  options.current = `${input.scrollHeight + value}px`;
  input.style.height = options.current;
  input.style.marginBottom = style2;
  input.style.overflowY = style;
}
function observeTextAreaValue(
  input: HTMLTextAreaElement,
  options: () => void,
) {
  let value = Object.getOwnPropertyDescriptor(input, "value"),
    value2 =
      value ??
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(input), "value");
  if (!value2?.set || !value2.configurable) {
    return;
  }
  let flag = true,
    callback = (input2: string) => {
      value2.set?.call(input, input2);
      if (flag) {
        options();
      }
    };
  Object.defineProperty(input, "value", {
    ...value2,
    set: callback,
  });
  return () => {
    flag = false;
    if (Object.getOwnPropertyDescriptor(input, "value")?.set !== callback) {
      return;
    }
    if (value) {
      Object.defineProperty(input, "value", value);
    } else {
      Reflect.deleteProperty(input, "value");
    }
  };
}
function useTextAreaAutosize({
  autosize: autosize,
  value: value,
  defaultValue: defaultValue,
}: C.AutosizeOptions) {
  let value2 = autosize && !supportsNativeFieldSizing,
    value3 = value !== undefined,
    ref = reactHu.useRef<HTMLTextAreaElement>(null),
    ref2 = reactHu.useRef("");
  useIsomorphicLayoutEffect(() => {
    let current = ref.current,
      value4 = current?.ownerDocument.defaultView;
    if (!value2 || !current || !value4) {
      return;
    }
    let callback = () => resizeTextAreaToContent(current, ref2),
      index = 0,
      callback2 = () => {
        value4.cancelAnimationFrame(index);
        index = value4.requestAnimationFrame(callback);
      },
      value5 = new value4.ResizeObserver(callback2);
    value5.observe(current);
    value4.document.fonts.addEventListener("loadingdone", callback);
    let callback3 = (event: Event) => {
        if (event.target === current.form) {
          callback2();
        }
      },
      value6 = current.getRootNode(),
      value7 = value6 instanceof value4.ShadowRoot ? value6 : value4.document,
      value8: (() => void) | undefined;
    if (!value3) {
      value8 = observeTextAreaValue(current, callback);
      current.addEventListener("input", callback);
      value7.addEventListener("reset", callback3, true);
    }
    return () => {
      value8?.();
      value7.removeEventListener("reset", callback3, true);
      value5.disconnect();
      value4.cancelAnimationFrame(index);
      value4.document.fonts.removeEventListener("loadingdone", callback);
      current.removeEventListener("input", callback);
      if (current.style.height === ref2.current) {
        current.style.height = "";
      }
    };
  }, [value2, value3]);
  useIsomorphicLayoutEffect(() => {
    if (value2 && ref.current) {
      resizeTextAreaToContent(ref.current, ref2);
    }
  }, [value2, value2 ? value : null, value2 ? defaultValue : null]);
  return ref;
}
export {
  jsxFu,
  observeTextAreaValue,
  reactForUiTextArea,
  reactHu,
  resizeTextAreaToContent,
  supportsNativeFieldSizing,
  TextArea,
  useTextAreaAutosize,
};
export function installUiTextArea(): () => void {
  return () => {
    initializeClassNames();
    initializeCdsRoot();
    initializeMergedRefs();
    initializeIsomorphicLayoutEffect();
    reactHu = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    supportsNativeFieldSizing =
      typeof CSS === "undefined" ||
      typeof CSS.supports !== "function" ||
      CSS.supports("field-sizing", "content");
    reactForUiTextArea = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxFu = toModuleNamespace(loadJsxNamespace(), 1);
    TextArea = reactForUiTextArea.forwardRef(
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
          disabled: disabled,
          style: style,
          ...props
        }: C.TextAreaProps,
        options: React.ForwardedRef<HTMLTextAreaElement>,
      ) => {
        let value: boolean = useFieldInvalid(),
          value2 = rows ?? 3,
          value3 = autosize && rows !== undefined,
          value4 = resize === "y" ? "resize-y" : "resize-none",
          value5 = autosize ? "[field-sizing:content]" : "",
          value6 = useTextAreaAutosize({
            autosize: autosize,
            value: props.value,
            defaultValue: props.defaultValue,
          }),
          value7: React.Ref<HTMLTextAreaElement> = useMergedRefs(
            options,
            value6,
          ),
          value8 = value3
            ? bare
              ? "min-h-[calc(var(--cds-textarea-rows)*1lh)]"
              : "min-h-[calc(var(--cds-textarea-rows)*1lh+2*var(--cds-pad-sm))]"
            : "",
          value9 = value3
            ? {
                ...style,
                "--cds-textarea-rows": value2,
              }
            : style,
          value10 = fullWidth ? "w-full" : "";
        return (
          <baseField.Control
            id={id}
            aria-describedby={ariaDescribedby}
            disabled={disabled}
            render={
              <textarea
                ref={value7}
                data-cds={"TextArea"}
                rows={value2}
                style={value9}
                {...getControlSizeAttributes(size)}
                data-invalid={value || undefined}
                aria-invalid={value || ariaInvalid}
                {...props}
                className={cn(
                  "cds-reset",
                  value10,
                  bare
                    ? "block resize-none border-0 bg-transparent p-0 shadow-none"
                    : `cds-input font-normal ${textAreaBaseClasses} enabled:[&:hover:not(:focus):not([data-invalid])]:shadow-field-hover focus-visible:shadow-focus data-[invalid]:focus-visible:shadow-focus-danger ${value4}`,
                  "font-sans text-body text-primary placeholder:text-muted outline-none focus-visible:outline-hidden disabled:opacity-disabled",
                  value5,
                  value8,
                  className,
                )}
              />
            }
          />
        );
      },
    );
    TextArea.displayName = "TextArea";
    initializeClassNames();
    initializeTranslations();
  };
}
