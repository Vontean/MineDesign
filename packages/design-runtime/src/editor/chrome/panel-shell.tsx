import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { Icon } from "../../cds/components/icon";
import { initializeCdsIndex } from "../../cds/index";
import { TabsTabsRootListTabConfig } from "../../cds/tabs/tabs";
import { load_react, load_react_dom, load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "./overlay-state";
import { CloseValue } from "../color/contrast-copy";
import { toModuleNamespace } from "../../module-helpers";

var reactChromePanelShell: Dynamic;
var reactDomChromePanelShell: Dynamic;
var reactChromePanelShell_2: Dynamic;
var jsxChromePanelShell: Dynamic;
var ChromePanelShellClassNames: Dynamic;
var jsxChromePanelShell_2: Dynamic;
var ChromePanelShellComponent: Dynamic;
var ChromePanelShellContext: Dynamic;
var ChromePanelShellContext_2: Dynamic;
function PanelHeader({
  tabs: tabs,
  activateOnFocus: activateOnFocus,
  tabsLabel: tabsLabel,
  title: title,
  onClose: onClose,
  closeLabel = CloseValue,
  trailing: trailing,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = tabs !== undefined && tabs.length > 0;
  return (
    <jsxChromePanelShell.Fragment>
      {value ? (<TabsTabsRootListTabConfig.List
          aria-label={tabsLabel}
          activateOnFocus={activateOnFocus}
          className={"min-w-0 flex-1"}
        >
          {tabs.map(
            (input?: Dynamic): Dynamic =>
              (() => {
                const _Component = TabsTabsRootListTabConfig.Tab;
                const _props = {
                  value: input.value,
                  onClick: input.onClick,
                  "data-testid": input["data-testid"],
                  children: input.label,
                } as const;
                const _key = input.value;
                return <_Component key={_key} {..._props} />;
              })(),
          )}
        </TabsTabsRootListTabConfig.List>) : (title != null && title !== false ? (<span
          className={
            "min-w-0 flex-1 truncate pl-[calc(var(--pp-gutter-l,var(--cds-pad-lg))-var(--cds-pad-sm))] text-body-semibold text-primary"
          }
        >
          {title}
        </span>) : (<span aria-hidden={"true"} className={"flex-1"} />))}
      {trailing}
      {onClose !== undefined ? (<Button
          variant={"ghost"}
          iconOnly={true}
          icon={
            <Icon
              name={"X"}
              size={"sm"}
              className={"text-secondary"}
            />
          }
          aria-label={closeLabel}
          onClick={onClose}
          className={"relative shrink-0"}
        />) : (null)}
    </jsxChromePanelShell.Fragment>
  );
}
function usePanelTab(input?: Dynamic): Dynamic {
  let [value, value2]: Dynamic = (0, reactChromePanelShell_2.useState)(
    input.tabs?.[0]?.value ?? "",
  );
  return [
    input.tab ?? value,
    (input2?: Dynamic): Dynamic => {
      value2(input2);
      input.onTabChange?.(input2);
    },
  ];
}
function PanelShell(input?: Dynamic): Dynamic {
  useUiLocale();
  let {
      tabs: value,
      className: value2,
      "data-testid": value3,
    }: Dynamic = input,
    [value4, value5]: Dynamic = usePanelTab(input);
  return value !== undefined && value.length > 0 ? (
    <TabsTabsRootListTabConfig.Root
      value={value4}
      onValueChange={(input2?: Dynamic): Dynamic => value5(input2)}
      data-kit={"panel-header"}
      data-testid={value3}
      className={(0, joinClassNames)(
        ChromePanelShellClassNames,
        value2,
      )}
    >
      <PanelHeader {...input} />
    </TabsTabsRootListTabConfig.Root>
  ) : (
    <div
      data-kit={"panel-header"}
      data-testid={value3}
      className={(0, joinClassNames)(
        ChromePanelShellClassNames,
        value2,
      )}
    >
      <PanelHeader {...input} />
    </div>
  );
}
export {
  ChromePanelShellClassNames,
  ChromePanelShellComponent,
  ChromePanelShellContext,
  ChromePanelShellContext_2,
  jsxChromePanelShell,
  jsxChromePanelShell_2,
  PanelHeader,
  PanelShell,
  reactChromePanelShell,
  reactChromePanelShell_2,
  reactDomChromePanelShell,
  usePanelTab,
};
export function installEditorChromePanelShell(): () => void {
  return () => {
    (0, initializeCdsIndex)();
    reactChromePanelShell = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    reactDomChromePanelShell = (0, toModuleNamespace)(
      (0, load_react_dom)(),
      1,
    );
    reactChromePanelShell_2 = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    (0, initializeCdsIndex)();
    jsxChromePanelShell = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    ChromePanelShellClassNames =
      "flex min-w-0 shrink-0 items-center gap-xs py-md pr-sm pl-sm";
    jsxChromePanelShell_2 = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    ChromePanelShellComponent = (0, reactChromePanelShell.forwardRef)(function (
      input?: Dynamic,
      options?: Dynamic,
    ): Dynamic {
      return (
        <Button
          ref={options}
          iconOnly={true}
          size={"xs"}
          variant={"ghost"}
          {...input}
        />
      );
    });
    ChromePanelShellContext = (0, reactChromePanelShell.createContext)(null);
    ChromePanelShellContext_2 = (0, reactChromePanelShell.createContext)(null);
  };
}
