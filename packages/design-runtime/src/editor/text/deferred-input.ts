/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var TextDeferredInputTokenTypedSinkConfig: Dynamic;
var TextDeferredInputConstant: Dynamic;
var TextDeferredInputHandler: Dynamic;
var finishDeferredTextEdit: Dynamic;
var TextDeferredInputNow: Dynamic;
var isEditableHtmlElement: Dynamic;
function eventTargetsInput(event?: Dynamic): Dynamic {
  let value: Dynamic = event.composedPath?.()[0] ?? event.target;
  return (
    isEditableHtmlElement(value) &&
    (value.tagName === "INPUT" ||
      value.tagName === "TEXTAREA" ||
      value.tagName === "SELECT" ||
      value.isContentEditable === true)
  );
}
function removeDeferredTextListeners(): Dynamic {
  (window as Dynamic).removeEventListener(
    "keydown",
    collectDeferredTypedText,
    true,
  );
  (window as Dynamic).removeEventListener(
    "pointerdown",
    TextDeferredInputNow,
    true,
  );
}
function collectDeferredTypedText(event?: Dynamic): Dynamic {
  let value: Dynamic = event.key ?? "";
  if (
    !TextDeferredInputTokenTypedSinkConfig?.keys ||
    !value ||
    event.isComposing ||
    value === "Shift" ||
    value === "Alt" ||
    value === "AltGraph" ||
    value === "Meta" ||
    value === "Control" ||
    value === "CapsLock"
  )
    return;
  let isAltGraph: Dynamic = event.getModifierState?.("AltGraph") === true;
  if (
    ((event.metaKey || event.ctrlKey) && !isAltGraph) ||
    value === "Escape" ||
    eventTargetsInput(event)
  ) {
    finishDeferredTextEdit();
    return;
  }
  if (event.altKey && !isAltGraph && /^[a-z0-9]$/i.test(value)) return;
  let typedKey: Dynamic = value === "Backspace" ? "" : value;
  (typedKey.length > 1 && typedKey !== "Enter" && typedKey !== "Delete") ||
    (event.preventDefault(),
    event.stopImmediatePropagation(),
    !(typedKey.length > 1 || event.repeat) &&
      ((TextDeferredInputTokenTypedSinkConfig.typed = typedKey
        ? TextDeferredInputTokenTypedSinkConfig.typed + typedKey
        : TextDeferredInputTokenTypedSinkConfig.typed.slice(0, -1)),
      TextDeferredInputTokenTypedSinkConfig.sink?.key(typedKey)));
}
function beginDeferredTextInput(): Dynamic {
  return TextDeferredInputTokenTypedSinkConfig?.keys
    ? null
    : (TextDeferredInputTokenTypedSinkConfig &&
        finishDeferredTextInput("edit"),
      (window as Dynamic).addEventListener(
        "keydown",
        collectDeferredTypedText,
        true,
      ),
      (window as Dynamic).addEventListener(
        "pointerdown",
        TextDeferredInputNow,
        true,
      ),
      (TextDeferredInputTokenTypedSinkConfig = {
        token: ++TextDeferredInputConstant,
        typed: "",
        sink: null,
        keys: true,
        timer: setTimeout(TextDeferredInputHandler, 3e3),
        at: performance.now(),
      }),
      TextDeferredInputTokenTypedSinkConfig.token);
}
function hasDeferredTextSink(): Dynamic {
  return TextDeferredInputTokenTypedSinkConfig?.sink != null;
}
function cancelDeferredTextSink(): Dynamic {
  hasDeferredTextSink() && finishDeferredTextInput("edit");
}
function attachDeferredTextSink(token?: Dynamic, sink?: Dynamic): Dynamic {
  return TextDeferredInputTokenTypedSinkConfig?.token !== token
    ? null
    : (clearTimeout(TextDeferredInputTokenTypedSinkConfig.timer),
      (TextDeferredInputTokenTypedSinkConfig.sink = sink),
      (TextDeferredInputTokenTypedSinkConfig.timer = setTimeout(
        finishDeferredTextEdit,
        2100,
      )),
      {
        typed: TextDeferredInputTokenTypedSinkConfig.typed,
        until: Date.now() + 2e3,
      });
}
function resetDeferredTextPointer(): Dynamic {
  TextDeferredInputNow();
}
function finishDeferredTextInput(
  reason?: Dynamic,
  expectedToken?: Dynamic,
): Dynamic {
  if (
    !TextDeferredInputTokenTypedSinkConfig ||
    (expectedToken !== undefined &&
      TextDeferredInputTokenTypedSinkConfig.token !== expectedToken) ||
    (reason === "opened" && !TextDeferredInputTokenTypedSinkConfig.sink)
  )
    return;
  let { sink: value, keys: hasKeys }: Dynamic =
    TextDeferredInputTokenTypedSinkConfig;
  hasKeys && removeDeferredTextListeners();
  if (reason === "keys" && !value) {
    hasKeys &&
      (clearTimeout(TextDeferredInputTokenTypedSinkConfig.timer),
      (TextDeferredInputTokenTypedSinkConfig.keys = false),
      (TextDeferredInputTokenTypedSinkConfig.typed = ""));
    return;
  }
  clearTimeout(TextDeferredInputTokenTypedSinkConfig.timer);
  TextDeferredInputTokenTypedSinkConfig = null;
  reason !== "opened" && value?.drop(reason === "keys");
}
export {
  attachDeferredTextSink,
  beginDeferredTextInput,
  cancelDeferredTextSink,
  collectDeferredTypedText,
  eventTargetsInput,
  finishDeferredTextInput,
  hasDeferredTextSink,
  removeDeferredTextListeners,
  resetDeferredTextPointer,
  TextDeferredInputConstant,
  TextDeferredInputHandler,
  finishDeferredTextEdit,
  isEditableHtmlElement,
  TextDeferredInputNow,
  TextDeferredInputTokenTypedSinkConfig,
};
export function installEditorTextDeferredInput(): () => void {
  return () => {
    TextDeferredInputTokenTypedSinkConfig = null;
    TextDeferredInputConstant = 0;
    TextDeferredInputHandler = (): Dynamic => finishDeferredTextInput("keys");
    finishDeferredTextEdit = (): Dynamic => finishDeferredTextInput("edit");
    TextDeferredInputNow = (event?: Dynamic): Dynamic => {
      TextDeferredInputTokenTypedSinkConfig?.keys &&
        (event?.timeStamp ?? performance.now()) -
          TextDeferredInputTokenTypedSinkConfig.at >
          500 &&
        finishDeferredTextEdit();
    };
    isEditableHtmlElement = (node?: Dynamic): Dynamic =>
      node != null && "tagName" in node && "isContentEditable" in node;
  };
}
