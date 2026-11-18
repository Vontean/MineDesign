import { uiMessage } from '@minedesign/contracts/ui-messages';
import type {
  CollapsiblePanelProps,
  CollapsibleRootProps,
  CollapsibleTriggerProps,
  ForwardComponent,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { Icon, initializeComponentsIcon_2 } from "./icon";
import { initializeDomSelectionPrevention, withSelectionPrevention } from "../dom/selection-prevention";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeNpm__base_ui_react_iqe, initializeNpm_clsx_xh, load_react, load_react_jsx_runtime, npm_clsx_Ea, npm_Collapsible_a1 } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsCollapsible: typeof React;
var jsxComponentsCollapsible: typeof import("react/jsx-runtime");
var CollapsibleRoot: ForwardComponent<HTMLDivElement, CollapsibleRootProps>;
var collapsibleTriggerClasses: string;
var ComponentsCollapsibleLabel: string;
var CollapsibleTrigger: ForwardComponent<
  HTMLButtonElement,
  CollapsibleTriggerProps
>;
var collapsiblePanelClasses: string;
var CollapsiblePanel: ForwardComponent<HTMLDivElement, CollapsiblePanelProps>;
var ComponentsCollapsibleRootTriggerPanelConfig: {
  Root: typeof CollapsibleRoot;
  Trigger: typeof CollapsibleTrigger;
  Panel: typeof CollapsiblePanel;
};
var initializeComponentsCollapsible: () => void;
export {
  CollapsiblePanel,
  collapsiblePanelClasses,
  CollapsibleRoot,
  CollapsibleTrigger,
  collapsibleTriggerClasses,
  ComponentsCollapsibleLabel,
  ComponentsCollapsibleRootTriggerPanelConfig,
  initializeComponentsCollapsible,
  jsxComponentsCollapsible,
  reactComponentsCollapsible,
};
export function installCdsComponentsCollapsible(): () => void {
  return () => {
    initializeComponentsCollapsible = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeDomSelectionPrevention();
      initializeComponentsIcon_2();
      reactComponentsCollapsible = toModuleNamespace(
        load_react(),
      );
      initializeNpm_clsx_xh();
      jsxComponentsCollapsible = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_iqe();
      CollapsibleRoot = (0, reactComponentsCollapsible.forwardRef)<
        HTMLDivElement,
        CollapsibleRootProps
      >(
        (
          rootProps: CollapsibleRootProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <npm_Collapsible_a1.Root
            ref={forwardedRef}
            data-cds={"Collapsible"}
            {...rootProps}
          />
        ),
      );
      CollapsibleRoot.displayName = "Collapsible.Root";
      collapsibleTriggerClasses =
        "cds-reset group/clp inline-flex w-fit items-center gap-1.5 border-0 select-none outline-none focus-visible:outline-hidden font-sans text-body font-normal text-secondary hover:text-primary transition-shadow duration-fast focus-visible:shadow-focus rounded data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none";
      ComponentsCollapsibleLabel =
        "shrink-0 transition-transform group-data-[panel-open]/clp:rotate-90";
      CollapsibleTrigger = (0, reactComponentsCollapsible.forwardRef)<
        HTMLButtonElement,
        CollapsibleTriggerProps
      >(
        (
          {
            className: className,
            children: children,
            caretPosition: caretPosition,
            hideCaret: hideCaret,
            render: render,
            ...props
          }: CollapsibleTriggerProps,
          forwardedRef: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let onMouseDownWithPrevention = withSelectionPrevention(props.onMouseDown),
            caretIcon = hideCaret ? null : (
              <Icon
                name={"CaretRight"}
                size={"sm"}
                className={npm_clsx_Ea(
                  ComponentsCollapsibleLabel,
                  caretPosition === "end" && "ms-auto",
                )}
              />
            );
          return render ? (
            <npm_Collapsible_a1.Trigger
              ref={forwardedRef}
              render={render}
              className={className}
              {...props}
              onMouseDown={onMouseDownWithPrevention}
            />
          ) : (
            <npm_Collapsible_a1.Trigger
              ref={forwardedRef}
              {...props}
              className={cn(collapsibleTriggerClasses, className)}
              onMouseDown={onMouseDownWithPrevention}
            >
              {caretPosition !== "end" && (caretIcon)}
              {children}
              {caretPosition === "end" && (caretIcon)}
            </npm_Collapsible_a1.Trigger>
          );
        },
      );
      CollapsibleTrigger.displayName = "Collapsible.Trigger";
      collapsiblePanelClasses =
        "overflow-hidden h-[var(--collapsible-panel-height)] transition-[height] duration-base ease-out motion-reduce:transition-none data-[starting-style]:h-0 data-[ending-style]:h-0";
      CollapsiblePanel = (0, reactComponentsCollapsible.forwardRef)<
        HTMLDivElement,
        CollapsiblePanelProps
      >(
        (
          { className: className, ...props }: CollapsiblePanelProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <npm_Collapsible_a1.Panel
            ref={forwardedRef}
            {...props}
            className={cn(collapsiblePanelClasses, className)}
          />
        ),
      );
      CollapsiblePanel.displayName = "Collapsible.Panel";
      ComponentsCollapsibleRootTriggerPanelConfig = {
        Root: CollapsibleRoot,
        Trigger: CollapsibleTrigger,
        Panel: CollapsiblePanel,
      };
    });
  };
}
