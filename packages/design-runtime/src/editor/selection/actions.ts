import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var SelectionActionsReplace: Dynamic;
var SelectionActionsHelmetScHelmetPattern: Dynamic;
function selectionActionFailureMessage(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  let value: Dynamic = input === "delete" ? uiMessage("inspector.actions.pressDelete") : "duplicate";
  if (!context)
    return (
      uiMessage("inspector.actions.couldnT") +
      input +
      " the elements you selected: someone else\u2019s edit arrived first. Select them again and " +
      value +
      "."
    );
  let value2: Dynamic =
    options === 1 ? uiMessage("inspector.actions.oneArtboard") : options + " artboards";
  return (
    (input === "delete" ? "Deleted" : "Duplicated") +
    ", except in " +
    value2 +
    " that someone else just changed. Select the elements there again and " +
    value +
    (input === "delete" ? "." : " again.")
  );
}
export {
  selectionActionFailureMessage,
  SelectionActionsHelmetScHelmetPattern,
  SelectionActionsReplace,
};
export function installEditorSelectionActions(): () => void {
  return () => {
    SelectionActionsReplace = (input?: Dynamic): Dynamic =>
      (input.split("/").pop() ?? input).replace(/\.dc\.html$/, "");
    SelectionActionsHelmetScHelmetPattern =
      /^(helmet|sc-helmet|script|style|link|noscript|template)$/i;
  };
}
