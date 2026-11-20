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
  textarea: HTMLTextAreaElement,
  appliedHeightRef: React.RefObject<string>,
) {
  if (
    textarea.clientWidth === 0 ||
    (textarea.style.height !== appliedHeightRef.current && textarea.style.height !== "")
  ) {
    return;
  }
  let offsetHeight = textarea.offsetHeight,
    value = offsetHeight - textarea.clientHeight,
    { overflowY: style, marginBottom: originalMarginBottom } = textarea.style;
  textarea.style.height = "0px";
  textarea.style.marginBottom = `${offsetHeight}px`;
  textarea.style.overflowY = "hidden";
  appliedHeightRef.current = `${textarea.scrollHeight + value}px`;
  textarea.style.height = appliedHeightRef.current;
  textarea.style.marginBottom = originalMarginBottom;
  textarea.style.overflowY = style;
}
function observeTextAreaValue(
  textarea: HTMLTextAreaElement,
  onValueChange: () => void,
) {
  let value = Object.getOwnPropertyDescriptor(textarea, "value"),
    valueDescriptor =
      value ??
      Object.getOwnPropertyDescriptor(Object.getPrototypeOf(textarea), "value");
  if (!valueDescriptor?.set || !valueDescriptor.configurable) {
    return;
  }
  let flag = true,
    callback = (nextText: string) => {
      valueDescriptor.set?.call(textarea, nextText);
      if (flag) {
        onValueChange();
      }
    };
  Object.defineProperty(textarea, "value", {
    ...valueDescriptor,
    set: callback,
  });
  return () => {
    flag = false;
    if (Object.getOwnPropertyDescriptor(textarea, "value")?.set !== callback) {
      return;
    }
    if (value) {
      Object.defineProperty(textarea, "value", value);
    } else {
      Reflect.deleteProperty(textarea, "value");
    }
  };
}
function useTextAreaAutosize({
  autosize: autosize,
  value: text,
  defaultValue: defaultValue,
}: C.AutosizeOptions) {
  let shouldMeasureHeight = autosize && !supportsNativeFieldSizing,
    isControlled = text !== undefined,
    ref = reactHu.useRef<HTMLTextAreaElement>(null),
    appliedHeightRef = reactHu.useRef("");
  useIsomorphicLayoutEffect(() => {
    let current = ref.current,
      ownerWindow = current?.ownerDocument.defaultView;
    if (!shouldMeasureHeight || !current || !ownerWindow) {
      return;
    }
    let callback = () => resizeTextAreaToContent(current, appliedHeightRef),
      index = 0,
      scheduleResize = () => {
        ownerWindow.cancelAnimationFrame(index);
        index = ownerWindow.requestAnimationFrame(callback);
      },
      resizeObserver = new ownerWindow.ResizeObserver(scheduleResize);
    resizeObserver.observe(current);
    ownerWindow.document.fonts.addEventListener("loadingdone", callback);
    let handleFormReset = (event: Event) => {
        if (event.target === current.form) {
          scheduleResize();
        }
      },
      rootNode = current.getRootNode(),
      resetEventRoot = rootNode instanceof ownerWindow.ShadowRoot ? rootNode : ownerWindow.document,
      restoreValueSetter: (() => void) | undefined;
    if (!isControlled) {
      restoreValueSetter = observeTextAreaValue(current, callback);
      current.addEventListener("input", callback);
      resetEventRoot.addEventListener("reset", handleFormReset, true);
    }
    return () => {
      restoreValueSetter?.();
      resetEventRoot.removeEventListener("reset", handleFormReset, true);
      resizeObserver.disconnect();
      ownerWindow.cancelAnimationFrame(index);
      ownerWindow.document.fonts.removeEventListener("loadingdone", callback);
      current.removeEventListener("input", callback);
      if (current.style.height === appliedHeightRef.current) {
        current.style.height = "";
      }
    };
  }, [shouldMeasureHeight, isControlled]);
  useIsomorphicLayoutEffect(() => {
    if (shouldMeasureHeight && ref.current) {
      resizeTextAreaToContent(ref.current, appliedHeightRef);
    }
  }, [shouldMeasureHeight, shouldMeasureHeight ? text : null, shouldMeasureHeight ? defaultValue : null]);
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
        forwardedRef: React.ForwardedRef<HTMLTextAreaElement>,
      ) => {
        let value: boolean = useFieldInvalid(),
          resolvedRows = rows ?? 3,
          enforceMinimumRows = autosize && rows !== undefined,
          resizeClassName = resize === "y" ? "resize-y" : "resize-none",
          autosizeClassName = autosize ? "[field-sizing:content]" : "",
          autosizeRef = useTextAreaAutosize({
            autosize: autosize,
            value: props.value,
            defaultValue: props.defaultValue,
          }),
          mergedRef: React.Ref<HTMLTextAreaElement> = useMergedRefs(
            forwardedRef,
            autosizeRef,
          ),
          minimumHeightClassName = enforceMinimumRows
            ? bare
              ? "min-h-[calc(var(--cds-textarea-rows)*1lh)]"
              : "min-h-[calc(var(--cds-textarea-rows)*1lh+2*var(--cds-pad-sm))]"
            : "",
          textareaStyle = enforceMinimumRows
            ? {
                ...style,
                "--cds-textarea-rows": resolvedRows,
              }
            : style,
          widthClassName = fullWidth ? "w-full" : "";
        return (
          <baseField.Control
            id={id}
            aria-describedby={ariaDescribedby}
            disabled={disabled}
            render={
              <textarea
                ref={mergedRef}
                data-cds={"TextArea"}
                rows={resolvedRows}
                style={textareaStyle}
                {...getControlSizeAttributes(size)}
                data-invalid={value || undefined}
                aria-invalid={value || ariaInvalid}
                {...props}
                className={cn(
                  "cds-reset",
                  widthClassName,
                  bare
                    ? "block resize-none border-0 bg-transparent p-0 shadow-none"
                    : `cds-input font-normal ${textAreaBaseClasses} enabled:[&:hover:not(:focus):not([data-invalid])]:shadow-field-hover focus-visible:shadow-focus data-[invalid]:focus-visible:shadow-focus-danger ${resizeClassName}`,
                  "font-sans text-body text-primary placeholder:text-muted outline-none focus-visible:outline-hidden disabled:opacity-disabled",
                  autosizeClassName,
                  minimumHeightClassName,
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
