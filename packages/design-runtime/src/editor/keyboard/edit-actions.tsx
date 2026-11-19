import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";
import { initializePlatformCdsIsland } from "../../platform/cds-island";

var reactKeyboardEditActions: Dynamic;
var jsxKeyboardEditActions: Dynamic;
var KeyboardEditActionsCutCopyPasteConfig: Dynamic;
var isContextMenuShortcut: Dynamic;
export {
  isContextMenuShortcut,
  jsxKeyboardEditActions,
  KeyboardEditActionsCutCopyPasteConfig,
  reactKeyboardEditActions,
};
export function installEditorKeyboardEditActions(): () => void {
  return () => {
    reactKeyboardEditActions = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    initializePlatformCdsIsland();
    initializeCdsIndex();
    jsxKeyboardEditActions = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    KeyboardEditActionsCutCopyPasteConfig = {
      cut: {
        get label() { return uiMessage("inspector.editActions.cut"); },
        shortcut: "cmd+x",
      },
      copy: {
        get label() { return uiMessage("inspector.editActions.copy"); },
        shortcut: "cmd+c",
      },
      paste: {
        get label() { return uiMessage("inspector.editActions.paste"); },
        shortcut: "cmd+v",
      },
      duplicate: {
        get label() { return uiMessage("inspector.editActions.duplicate"); },
        shortcut: "cmd+d",
      },
      front: {
        get label() { return uiMessage("inspector.editActions.bringToFront"); },
        shortcut: "]",
      },
      back: {
        get label() { return uiMessage("inspector.editActions.sendToBack"); },
        shortcut: "[",
      },
      group: {
        get label() { return uiMessage("inspector.editActions.group"); },
        shortcut: "cmd+g",
      },
      ungroup: {
        get label() { return uiMessage("inspector.editActions.ungroup"); },
        shortcut: "shift+cmd+g",
      },
      delete: {
        get label() { return uiMessage("inspector.editActions.delete"); },
        shortcut: "backspace",
      },
      "select-all": {
        get label() { return uiMessage("inspector.editActions.selectAll"); },
        shortcut: "cmd+a",
      },
    };
    isContextMenuShortcut = (keyEvent?: Dynamic): Dynamic =>
      keyEvent.key === "ContextMenu" || (keyEvent.key === "F10" && keyEvent.shiftKey);
    initializeCdsIndex();
  };
}
