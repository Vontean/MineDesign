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
  value: activeTab,
  onChange: onChange,
  label: label,
}: ToolbarTabsProps) {
  useUiLocale();
  return (
    <div className={"mc-tabbar"}>
      <Tabs.Root
        value={activeTab}
        onValueChange={(nextTab: unknown) => onChange(nextTab as string)}
      >
        <Tabs.List
          aria-label={label}
          activateOnFocus={true}
          className={
            "mx-auto w-fit max-w-full min-w-0 overflow-x-auto [scrollbar-width:none]"
          }
        >
          {tabs.map((tab: ToolbarTab) =>
            (() => {
              const _Element = Tabs.Tab;
              const _elementProps = {
                value: tab.value,
                title: tab.title,
                children: tab.label,
              };
              const _elementKey = tab.value;
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
    jsxT_ = toModuleNamespace(loadJsxNamespace(), 1);
  };
}
