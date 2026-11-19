import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var TextPlaceholderLabel: Dynamic;
function placeholderTextElement(textElement?: Dynamic, textNode?: Dynamic): Dynamic {
  return textNode !== null && textElement?.text(textNode) === TextPlaceholderLabel
    ? textNode
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
