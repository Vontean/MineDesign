import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";

export function installEditorKeyboardEditActions(
  runtime: RuntimeBindings,
): () => void {
  var reactKeyboardEditActions: Dynamic;
  var jsxKeyboardEditActions: Dynamic;
  var KeyboardEditActionsCutCopyPasteConfig: Dynamic;
  var isContextMenuShortcut: Dynamic;

  bindRuntimeValue(
    runtime,
    "reactKeyboardEditActions",
    () => reactKeyboardEditActions,
    (value) => {
      reactKeyboardEditActions = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "jsxKeyboardEditActions",
    () => jsxKeyboardEditActions,
    (value) => {
      jsxKeyboardEditActions = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "KeyboardEditActionsCutCopyPasteConfig",
    () => KeyboardEditActionsCutCopyPasteConfig,
    (value) => {
      KeyboardEditActionsCutCopyPasteConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "isContextMenuShortcut",
    () => isContextMenuShortcut,
    (value) => {
      isContextMenuShortcut = value;
    },
  );
  return () => {
    reactKeyboardEditActions = (0, runtime.toModuleNamespace)(
      (0, runtime.load_react)(),
      1,
    );
    (0, runtime.initializeCdsIndex)();
    (0, runtime.initializePlatformCdsIsland)();
    (0, runtime.initializeCdsIndex)();
    jsxKeyboardEditActions = (0, runtime.toModuleNamespace)(
      (0, runtime.load_react_jsx_runtime)(),
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
    isContextMenuShortcut = (input?: Dynamic): Dynamic =>
      input.key === "ContextMenu" || (input.key === "F10" && input.shiftKey);
    (0, runtime.initializeCdsIndex)();
  };
}
