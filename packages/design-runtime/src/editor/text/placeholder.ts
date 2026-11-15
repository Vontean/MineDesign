import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var TextPlaceholderLabel: Dynamic;
function placeholderTextElement(input?: Dynamic, options?: Dynamic): Dynamic {
  return options !== null && input?.text(options) === TextPlaceholderLabel
    ? options
    : null;
}
export {
  placeholderTextElement,
  TextPlaceholderLabel,
};
export function installEditorTextPlaceholder(): () => void {
  return () => {
    TextPlaceholderLabel = uiMessage("inspector.placeholder.yourTextHere");
  };
}
