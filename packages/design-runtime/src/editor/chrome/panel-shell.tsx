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
  let hasTabs: Dynamic = tabs !== undefined && tabs.length > 0;
  return (
    <jsxChromePanelShell.Fragment>
      {hasTabs ? (<TabsTabsRootListTabConfig.List
          aria-label={tabsLabel}
          activateOnFocus={activateOnFocus}
          className={"min-w-0 flex-1"}
        >
          {tabs.map(
            (tab?: Dynamic): Dynamic =>
              (() => {
                const _Component = TabsTabsRootListTabConfig.Tab;
                const _props = {
                  value: tab.value,
                  onClick: tab.onClick,
                  "data-testid": tab["data-testid"],
                  children: tab.label,
                } as const;
                const _key = tab.value;
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
function usePanelTab(props?: Dynamic): Dynamic {
  let [internalTab, setInternalTab]: Dynamic = (0, reactChromePanelShell_2.useState)(
    props.tabs?.[0]?.value ?? "",
  );
  return [
    props.tab ?? internalTab,
    (nextTab?: Dynamic): Dynamic => {
      setInternalTab(nextTab);
      props.onTabChange?.(nextTab);
    },
  ];
}
function PanelShell(props?: Dynamic): Dynamic {
  useUiLocale();
  let {
      tabs: tabItems,
      className: shellClassName,
      "data-testid": testId,
    }: Dynamic = props,
    [activeTab, setActiveTab]: Dynamic = usePanelTab(props);
  return tabItems !== undefined && tabItems.length > 0 ? (
    <TabsTabsRootListTabConfig.Root
      value={activeTab}
      onValueChange={(nextTab?: Dynamic): Dynamic => setActiveTab(nextTab)}
      data-kit={"panel-header"}
      data-testid={testId}
      className={joinClassNames(
        ChromePanelShellClassNames,
        shellClassName,
      )}
    >
      <PanelHeader {...props} />
    </TabsTabsRootListTabConfig.Root>
  ) : (
    <div
      data-kit={"panel-header"}
      data-testid={testId}
      className={joinClassNames(
        ChromePanelShellClassNames,
        shellClassName,
      )}
    >
      <PanelHeader {...props} />
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
    initializeCdsIndex();
    reactChromePanelShell = toModuleNamespace(
      load_react(),
      1,
    );
    reactDomChromePanelShell = toModuleNamespace(
      load_react_dom(),
      1,
    );
    reactChromePanelShell_2 = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    jsxChromePanelShell = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromePanelShellClassNames =
      "flex min-w-0 shrink-0 items-center gap-xs py-md pr-sm pl-sm";
    jsxChromePanelShell_2 = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ChromePanelShellComponent = (0, reactChromePanelShell.forwardRef)(function (
      props?: Dynamic,
      forwardedRef?: Dynamic,
    ): Dynamic {
      return (
        <Button
          ref={forwardedRef}
          iconOnly={true}
          size={"xs"}
          variant={"ghost"}
          {...props}
        />
      );
    });
    ChromePanelShellContext = (0, reactChromePanelShell.createContext)(null);
    ChromePanelShellContext_2 = (0, reactChromePanelShell.createContext)(null);
  };
}
