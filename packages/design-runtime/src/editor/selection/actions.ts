import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var SelectionActionsReplace: Dynamic;
var SelectionActionsHelmetScHelmetPattern: Dynamic;
function selectionActionFailureMessage(
  actionKind?: Dynamic,
  conflictedArtboardCount?: Dynamic,
  hasConflicts?: Dynamic,
): Dynamic {
  let retryVerb: Dynamic = actionKind === "delete" ? uiMessage("inspector.actions.pressDelete") : "duplicate";
  if (!hasConflicts)
    return (
      uiMessage("inspector.actions.couldnT") +
      actionKind +
      " the elements you selected: someone else\u2019s edit arrived first. Select them again and " +
      retryVerb +
      "."
    );
  let artboardCountLabel: Dynamic =
    conflictedArtboardCount === 1 ? uiMessage("inspector.actions.oneArtboard") : conflictedArtboardCount + " artboards";
  return (
    (actionKind === "delete" ? "Deleted" : "Duplicated") +
    ", except in " +
    artboardCountLabel +
    " that someone else just changed. Select the elements there again and " +
    retryVerb +
    (actionKind === "delete" ? "." : " again.")
  );
}
export {
  selectionActionFailureMessage,
  SelectionActionsHelmetScHelmetPattern,
  SelectionActionsReplace,
};
export function installEditorSelectionActions(): () => void {
  return () => {
    SelectionActionsReplace = (filePath?: Dynamic): Dynamic =>
      (filePath.split("/").pop() ?? filePath).replace(/\.dc\.html$/, "");
    SelectionActionsHelmetScHelmetPattern =
      /^(helmet|sc-helmet|script|style|link|noscript|template)$/i;
  };
}
