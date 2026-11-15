import * as npm0 from "react";
import * as npm1 from "scheduler";
import * as npm2 from "react-dom";
import * as npm3 from "react-dom/client";
import * as npm4 from "react/jsx-runtime";
import * as npm5 from "clsx";
import * as npm6 from "tailwind-merge";
import * as npm7 from "class-variance-authority";
import * as npm8 from "@base-ui/react";
import * as npm9 from "@base-ui/react/merge-props";
import * as npm10 from "@base-ui/react/use-render";
import * as npm11 from "@base-ui/react/internals/labelable-provider";
import * as npm12 from "@tanstack/react-virtual";
import * as npm13 from "@tanstack/virtual-core";
import npm14 from "lodash.debounce";
import * as npm15 from "usehooks-ts";
import injected_E7t from "./generated/editor-picker.js?raw";
import injected_$7t from "./generated/preview-fetch.js?raw";
import injected_q7t from "./generated/preview-xhr.js?raw";
import injected_X7t from "./generated/preview-storage.js?raw";
import injected_Y7t from "./generated/preview-viewport.js?raw";
import injected_Z7t from "./generated/preview-script-runner.js?raw";
import injected_wZt from "./generated/preview-channel.js?raw";
import injected_svgCapture from "./generated/svg-capture.js?raw";
import injected_PTt from "./generated/export-page-loader.js?raw";
import injected_K7t from "./generated/preview-bridge.js?raw";
import react18UmdSource from "./generated/react.js?raw";
import reactDom18UmdSource from "./generated/react-dom.js?raw";
import dcSupportSource from "./generated/support.js?raw";
import propertyScrubberSource from "./generated/property-scrubber.js?raw";
import { buildCaptureTemplate } from "./scripts/page-capture";
import type { Dynamic, } from "./runtime-types";

const load_react = () => (npm0 as Dynamic).default ?? npm0;
const load_scheduler = () => (npm1 as Dynamic).default ?? npm1;
const load_react_dom = () => (npm2 as Dynamic).default ?? npm2;
const load_react_dom_client = () => (npm3 as Dynamic).default ?? npm3;
const load_react_jsx_runtime = () => (npm4 as Dynamic).default ?? npm4;
const npm_clsx_hfe = npm5["clsx"];
const npm_clsx_Ea = npm5["clsx"];
const initializeNpm_clsx_xh = () => {};
const npm_extendTailwindMerge_Wze = npm6["extendTailwindMerge"];
const npm_validators_Efe = npm6["validators"];
const initializeNpm_tailwind_merge_Kze = () => {};
const npm_cva_Kj = npm7["cva"];
const initializeNpm_class_variance_authority_Zhe = () => {};
const npm_Menu_La = npm8["Menu"];
const npm_ContextMenu_Ex = npm8["ContextMenu"];
const npm_Popover_$f = npm8["Popover"];
const npm_Combobox_Yi = npm8["Combobox"];
const npm_Tooltip_Ax = npm8["Tooltip"];
const npm_Collapsible_a1 = npm8["Collapsible"];
const npm_Field_qg = npm8["Field"];
const npm_AlertDialog_Dh = npm8["AlertDialog"];
const npm_Dialog_Xg = npm8["Dialog"];
const npm_Switch_sU = npm8["Switch"];
const npm_Radio_iP = npm8["Radio"];
const npm_RadioGroup_uF = npm8["RadioGroup"];
const npm_NumberField_mU = npm8["NumberField"];
const npm_Tabs_C1 = npm8["Tabs"];
const npm_Toast_Ty = npm8["Toast"];
const npm_Menubar_yye = npm8["Menubar"];
const npm_Button_Dye = npm8["Button"];
const initializeNpm__base_ui_react_gx = () => {};
const initializeNpm__base_ui_react_jj = () => {};
const initializeNpm__base_ui_react_jhe = () => {};
const initializeNpm__base_ui_react_pge = () => {};
const initializeNpm__base_ui_react_wY = () => {};
const initializeNpm__base_ui_react_SY = () => {};
const initializeNpm__base_ui_react_V8e = () => {};
const initializeNpm__base_ui_react_iqe = () => {};
const initializeNpm__base_ui_react_H5 = () => {};
const initializeNpm__base_ui_react_x7 = () => {};
const initializeNpm__base_ui_react_BXe = () => {};
const initializeNpm__base_ui_react_R9e = () => {};
const initializeNpm__base_ui_react_sYe = () => {};
const initializeNpm__base_ui_react_uYe = () => {};
const initializeNpm__base_ui_react_CZe = () => {};
const initializeNpm__base_ui_react_zve = () => {};
const initializeNpm__base_ui_react_jve = () => {};
const initializeNpm__base_ui_react_VJe = () => {};
const initializeNpm__base_ui_react_oQe = () => {};
const initializeNpm__base_ui_react_oet = () => {};
const npm_mergeProps_Ac = npm9["mergeProps"];
const npm_useRender_LL = npm10["useRender"];
const npm_LabelableProvider_NR = npm11["LabelableProvider"];
const npm_useVirtualizer_m7e = npm12["useVirtualizer"];
const initializeNpm__tanstack_react_virtual_h7e = () => {};
const npm_measureElement_mve = npm13["measureElement"];
const load_lodash_debounce = () => (npm14 as Dynamic).default ?? npm14;
const npm_useEventListener_bc = npm15["useEventListener"];
const npm_useEventCallback_Gpt = npm15["useEventCallback"];
const npm_useLocalStorage_QP = npm15["useLocalStorage"];
const npm_useMediaQuery_Wpt = npm15["useMediaQuery"];
const initializeNpm_usehooks_ts_p0 = () => {};
export {
  buildCaptureTemplate,
  dcSupportSource,
  initializeNpm__base_ui_react_BXe,
  initializeNpm__base_ui_react_CZe,
  initializeNpm__base_ui_react_gx,
  initializeNpm__base_ui_react_H5,
  initializeNpm__base_ui_react_iqe,
  initializeNpm__base_ui_react_jhe,
  initializeNpm__base_ui_react_jj,
  initializeNpm__base_ui_react_jve,
  initializeNpm__base_ui_react_oet,
  initializeNpm__base_ui_react_oQe,
  initializeNpm__base_ui_react_pge,
  initializeNpm__base_ui_react_R9e,
  initializeNpm__base_ui_react_SY,
  initializeNpm__base_ui_react_sYe,
  initializeNpm__base_ui_react_uYe,
  initializeNpm__base_ui_react_V8e,
  initializeNpm__base_ui_react_VJe,
  initializeNpm__base_ui_react_wY,
  initializeNpm__base_ui_react_x7,
  initializeNpm__base_ui_react_zve,
  initializeNpm__tanstack_react_virtual_h7e,
  initializeNpm_class_variance_authority_Zhe,
  initializeNpm_clsx_xh,
  initializeNpm_tailwind_merge_Kze,
  initializeNpm_usehooks_ts_p0,
  injected_$7t,
  injected_E7t,
  injected_K7t,
  injected_PTt,
  injected_q7t,
  injected_svgCapture,
  injected_wZt,
  injected_X7t,
  injected_Y7t,
  injected_Z7t,
  load_lodash_debounce,
  load_react,
  load_react_dom,
  load_react_dom_client,
  load_react_jsx_runtime,
  load_scheduler,
  npm_AlertDialog_Dh,
  npm_Button_Dye,
  npm_clsx_Ea,
  npm_clsx_hfe,
  npm_Collapsible_a1,
  npm_Combobox_Yi,
  npm_ContextMenu_Ex,
  npm_cva_Kj,
  npm_Dialog_Xg,
  npm_extendTailwindMerge_Wze,
  npm_Field_qg,
  npm_LabelableProvider_NR,
  npm_measureElement_mve,
  npm_Menu_La,
  npm_Menubar_yye,
  npm_mergeProps_Ac,
  npm_NumberField_mU,
  npm_Popover_$f,
  npm_Radio_iP,
  npm_RadioGroup_uF,
  npm_Switch_sU,
  npm_Tabs_C1,
  npm_Toast_Ty,
  npm_Tooltip_Ax,
  npm_useEventCallback_Gpt,
  npm_useEventListener_bc,
  npm_useLocalStorage_QP,
  npm_useMediaQuery_Wpt,
  npm_useRender_LL,
  npm_useVirtualizer_m7e,
  npm_validators_Efe,
  propertyScrubberSource,
  react18UmdSource,
  reactDom18UmdSource,
};
export function installDependencies(): void {
}
