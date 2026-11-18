import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type {
  CheckboxGlyphProps,
  CheckboxVisualProps,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { Icon, initializeComponentsIcon_2 } from "./icon";
import { cn, initializeClassNames } from "../theme/class-names";
import { load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var jsxComponentsCheckbox: typeof import("react/jsx-runtime");
var ComponentsCheckboxClassNames: string;
var initializeComponentsCheckbox: () => void;
function CheckboxGlyph({
  indeterminate = false,
}: CheckboxGlyphProps): React.ReactElement {
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
}: CheckboxVisualProps): React.ReactElement {
  useUiLocale();
  let value = checked || indeterminate;
  return (
    <span
      data-checked={checked && !indeterminate ? "" : undefined}
      data-indeterminate={indeterminate ? "" : undefined}
      data-unchecked={value ? undefined : ""}
      className={cn(
        ComponentsCheckboxClassNames,
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
  CheckboxGlyph,
  CheckboxVisual,
  ComponentsCheckboxClassNames,
  initializeComponentsCheckbox,
  jsxComponentsCheckbox,
};
export function installCdsComponentsCheckbox(): () => void {
  return () => {
    initializeComponentsCheckbox = initializeOnce(() => {
      initializeClassNames();
      initializeComponentsIcon_2();
      jsxComponentsCheckbox = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsCheckboxClassNames =
        "flex shrink-0 size-[var(--cds-checkbox)] items-center justify-center rounded-[var(--cds-checkbox-radius)] border border-strong bg-transparent";
    });
  };
}
