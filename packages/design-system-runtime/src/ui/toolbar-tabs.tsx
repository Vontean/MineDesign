import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  JsxNamespace,
  ToolbarTabsProps,
  ToolbarTab,
} from "../contracts/composition";
import { loadJsxNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { Tabs } from "./tabs";

var jsxT_: JsxNamespace;
function ToolbarTabs({
  tabs: tabs,
  value: value,
  onChange: onChange,
  label: label,
}: ToolbarTabsProps) {
  useUiLocale();
  return (
    <div className={"mc-tabbar"}>
      <Tabs.Root
        value={value}
        onValueChange={(input: unknown) => onChange(input as string)}
      >
        <Tabs.List
          aria-label={label}
          activateOnFocus={true}
          className={
            "mx-auto w-fit max-w-full min-w-0 overflow-x-auto [scrollbar-width:none]"
          }
        >
          {tabs.map((input: ToolbarTab) =>
            (() => {
              const _Element = Tabs.Tab;
              const _elementProps = {
                value: input.value,
                title: input.title,
                children: input.label,
              };
              const _elementKey = input.value;
              return <_Element key={_elementKey} {..._elementProps} />;
            })(),
          )}
        </Tabs.List>
      </Tabs.Root>
    </div>
  );
}
export {
  jsxT_,
  ToolbarTabs,
};
export function installUiToolbarTabs(): () => void {
  return () => {
    jsxT_ = (0, toModuleNamespace)((0, loadJsxNamespace)(), 1);
  };
}
