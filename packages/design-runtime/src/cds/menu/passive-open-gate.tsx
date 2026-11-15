import type {
  PassiveOpenCell,
  PassivePopupProps,
  PassivePopupTransform,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeHooksStableCallback } from "../hooks/stable-callback";
import { initializeMenuPopup_3, PassiveOpenGate } from "./popup";
import { initializeSheetsScrollArea_4 } from "../sheets/scroll-area";
import { load_react, load_react_dom, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactMenuPassiveOpenGate: typeof React;
var jsxMenuPassiveOpenGate: typeof import("react/jsx-runtime");
var reactDomMenuPassiveOpenGate: typeof import("react-dom");
var TriggerHoverValue: string;
var FocusOutValue: string;
var PassiveOpenCellContext: React.Context<PassiveOpenCell | null>;
var PassiveOpenDisabledContext: React.Context<boolean>;
var MenuPassiveOpenGateTabIndexConfig: Pick<PassivePopupProps, "tabIndex">;
var MenuPassiveOpenGateRegistry: Pick<PassivePopupProps, "tabIndex">;
var MenuPassiveOpenGateArrowDownArrowUpHomeSet: Set<string>;
var MenuPassiveOpenGateSubscribers: Set<string>;
var MenuPassiveOpenGateHandler: (listener: () => void) => () => void;
var MenuPassiveOpenGateDefaultText: () => "off";
var MenuPassiveOpenGateHandler_2: PassivePopupTransform;
var initializeMenuPassiveOpenGate: typeof import("react-dom");
export {
  FocusOutValue,
  initializeMenuPassiveOpenGate,
  jsxMenuPassiveOpenGate,
  MenuPassiveOpenGateArrowDownArrowUpHomeSet,
  MenuPassiveOpenGateDefaultText,
  MenuPassiveOpenGateHandler,
  MenuPassiveOpenGateHandler_2,
  MenuPassiveOpenGateRegistry,
  MenuPassiveOpenGateSubscribers,
  MenuPassiveOpenGateTabIndexConfig,
  PassiveOpenCellContext,
  PassiveOpenDisabledContext,
  reactDomMenuPassiveOpenGate,
  reactMenuPassiveOpenGate,
  TriggerHoverValue,
};
export function installCdsMenuPassiveOpenGate(): () => void {
  return () => {
    initializeMenuPassiveOpenGate = (0, initializeOnce)(() => {
      "use client";

      (0, initializeHooksStableCallback)();
      (0, initializeSheetsScrollArea_4)();
      (0, initializeMenuPopup_3)();
      reactMenuPassiveOpenGate = (0, toModuleNamespace)(
        (0, load_react)(),
      );
      jsxMenuPassiveOpenGate = (0, toModuleNamespace)(
        (0, load_react_jsx_runtime)(),
      );
      reactDomMenuPassiveOpenGate = (0, toModuleNamespace)(
        (0, load_react_dom)(),
      );
      TriggerHoverValue = "trigger-hover";
      FocusOutValue = "focus-out";
      PassiveOpenCellContext = (0,
      reactMenuPassiveOpenGate.createContext)<PassiveOpenCell | null>(null);
      PassiveOpenDisabledContext = (0, reactMenuPassiveOpenGate.createContext)(
        false,
      );
      MenuPassiveOpenGateTabIndexConfig = {
        tabIndex: undefined,
      };
      MenuPassiveOpenGateRegistry = {};
      MenuPassiveOpenGateArrowDownArrowUpHomeSet = new Set([
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
      ]);
      PassiveOpenGate.displayName = "PassiveOpenGate";
      MenuPassiveOpenGateSubscribers = new Set([
        "Shift",
        "Control",
        "Alt",
        "Meta",
        "AltGraph",
        "CapsLock",
        "NumLock",
        "ScrollLock",
        "Fn",
        "FnLock",
        "Hyper",
        "Super",
        "Symbol",
        "SymbolLock",
      ]);
      MenuPassiveOpenGateHandler = () => () => {};
      MenuPassiveOpenGateDefaultText = () => "off";
      MenuPassiveOpenGateHandler_2 = (
        input: PassivePopupProps,
      ): PassivePopupProps => input;
    });
  };
}
