/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var HtmlEscapingConfig: Dynamic;
function escapeHtml(text?: Dynamic): Dynamic {
  return text.replace(
    /[&<>"']/g,
    (character?: Dynamic): Dynamic => HtmlEscapingConfig[character],
  );
}
function escapeHtmlAttributeValue(attributeValue?: Dynamic): Dynamic {
  return attributeValue
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
export {
  escapeHtml,
  escapeHtmlAttributeValue,
  HtmlEscapingConfig,
};
export function installEditorHtmlEscaping(): () => void {
  return () => {
    HtmlEscapingConfig = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
  };
}
