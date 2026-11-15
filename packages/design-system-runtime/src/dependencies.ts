import * as NpmLoadReactNamespace from "react";
import * as NpmLoadReactDomNamespace from "react-dom";
import * as NpmLoadReactDomClientNamespace from "react-dom/client";
import * as NpmLoadJsxNamespace from "react/jsx-runtime";
import { Menu as NpmBaseMenu } from "@base-ui/react/menu";
import { ContextMenu as NpmBaseContextMenu } from "@base-ui/react/context-menu";
import { Popover as NpmBasePopover } from "@base-ui/react/popover";
import { Combobox as NpmBaseCombobox } from "@base-ui/react/combobox";
import { Tooltip as NpmBaseTooltip } from "@base-ui/react/tooltip";
import { Collapsible as NpmBaseCollapsible } from "@base-ui/react/collapsible";
import { Field as NpmBaseField } from "@base-ui/react/field";
import { Dialog as NpmBaseDialog } from "@base-ui/react/dialog";
import { AlertDialog as NpmBaseAlertDialog } from "@base-ui/react/alert-dialog";
import { Radio as NpmBaseRadio } from "@base-ui/react/radio";
import { Checkbox as NpmBaseCheckbox } from "@base-ui/react/checkbox";
import { Tabs as NpmBaseTabs } from "@base-ui/react/tabs";
import { Toast as NpmBaseToast } from "@base-ui/react/toast";
import { RadioGroup as NpmBaseRadioGroup } from "@base-ui/react/radio-group";
import { Button as NpmBaseButton } from "@base-ui/react/button";
import { useRender as NpmBaseUseRender } from "@base-ui/react/use-render";
import { mergeProps as NpmBaseMergeProps } from "@base-ui/react/merge-props";
import { LabelableProvider as NpmBaseLabelableProvider } from "@base-ui/react/internals/labelable-provider";
import { Switch as NpmBaseSwitch } from "@base-ui/react/switch";
import { NumberField as NpmBaseNumberField } from "@base-ui/react/number-field";
import { useLabelableContext as NpmBaseUseLabelableContext } from "@base-ui/react/internals/labelable-provider";
import { Menubar as NpmBaseMenubarRoot } from "@base-ui/react/menubar";
import { clsx as NpmClsx } from "clsx";
import { extendTailwindMerge as NpmExtendTailwindMerge } from "tailwind-merge";
import { validators as NpmValidators } from "tailwind-merge";
import { cva as NpmCva } from "class-variance-authority";
import { useVirtualizer as NpmUseVirtualizer } from "@tanstack/react-virtual";
import { measureElement as NpmMeasureVirtualElement } from "@tanstack/virtual-core";

/** Load the npm packages that replace the original bundle's third-party modules. */

const loadReactNamespace = () => NpmLoadReactNamespace;
const loadReactDomNamespace = () => NpmLoadReactDomNamespace;
const loadReactDomClientNamespace = () => NpmLoadReactDomClientNamespace;
const loadJsxNamespace = () => NpmLoadJsxNamespace;
const initializeNpmDependency = () => {};
export {
  NpmBaseAlertDialog as baseAlertDialog,
  NpmBaseButton as baseButton,
  NpmBaseCheckbox as baseCheckbox,
  NpmBaseCollapsible as baseCollapsible,
  NpmBaseCombobox as baseCombobox,
  NpmBaseContextMenu as baseContextMenu,
  NpmBaseDialog as baseDialog,
  NpmBaseField as baseField,
  NpmBaseLabelableProvider as baseLabelableProvider,
  NpmBaseMenu as baseMenu,
  NpmBaseMenubarRoot as baseMenubarRoot,
  NpmBaseMergeProps as baseMergeProps,
  NpmBaseNumberField as baseNumberField,
  NpmBasePopover as basePopover,
  NpmBaseRadio as baseRadio,
  NpmBaseRadioGroup as baseRadioGroup,
  NpmBaseSwitch as baseSwitch,
  NpmBaseTabs as baseTabs,
  NpmBaseToast as baseToast,
  NpmBaseTooltip as baseTooltip,
  NpmBaseUseLabelableContext as baseUseLabelableContext,
  NpmBaseUseRender as baseUseRender,
  NpmClsx as clsx,
  NpmCva as cva,
  NpmExtendTailwindMerge as extendTailwindMerge,
  initializeNpmDependency,
  loadJsxNamespace,
  loadReactDomClientNamespace,
  loadReactDomNamespace,
  loadReactNamespace,
  NpmMeasureVirtualElement as measureVirtualElement,
  NpmUseVirtualizer as useVirtualizer,
  NpmValidators as validators,
};
export function installDependencies(): void {
}
