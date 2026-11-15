import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { loadJsxNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { cn, Icon } from "./interactions";

var jsxsM: typeof import("react/jsx-runtime");
var checkboxVisualClasses: string;
var CONTROL_LABEL_CLASS: string;
var CHECKBOX_LABEL_ALIGNMENT_CLASS: string;
function CheckboxGlyph({ indeterminate = false }: C.CheckboxGlyphProps) {
  useUiLocale();
  return (
    <Icon
      name={indeterminate ? "Minus" : "Check"}
      size={"sm"}
      bold={true}
      style={{
        fontSize: "var(--cds-checkbox-glyph)",
      }}
    />
  );
}
function CheckboxVisual({
  checked: checked,
  indeterminate = false,
  className: className,
}: C.CheckboxVisualProps) {
  useUiLocale();
  let value = checked || indeterminate;
  return (
    <span
      data-checked={checked && !indeterminate ? "" : undefined}
      data-indeterminate={indeterminate ? "" : undefined}
      data-unchecked={value ? undefined : ""}
      className={(0, cn)(
        checkboxVisualClasses,
        value && "bg-fill-accent border-transparent",
        className,
      )}
    >
      {value && (<span className={"text-on-accent"}>
          <CheckboxGlyph indeterminate={indeterminate} />
        </span>)}
    </span>
  );
}
export {
  CHECKBOX_LABEL_ALIGNMENT_CLASS,
  CheckboxGlyph,
  CheckboxVisual,
  checkboxVisualClasses,
  CONTROL_LABEL_CLASS,
  jsxsM,
};
export function installUiControlLabels(): () => void {
  return () => {
    jsxsM = (0, toModuleNamespace)((0, loadJsxNamespace)(), 1);
    checkboxVisualClasses =
      "flex shrink-0 size-[var(--cds-checkbox)] items-center justify-center rounded-[var(--cds-checkbox-radius)] border border-strong bg-transparent";
    CONTROL_LABEL_CLASS =
      "inline-flex gap-xs text-start font-sans text-body font-normal text-primary";
    CHECKBOX_LABEL_ALIGNMENT_CLASS =
      "mt-[calc((1lh_-_var(--cds-checkbox,1rem))_/_2)]";
  };
}
