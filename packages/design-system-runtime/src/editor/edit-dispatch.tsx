import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { showEditorNotification } from "./editable-name";
import { toModuleNamespace } from "../module-helpers";

var reactAssetGroupEditor: typeof import("react");
var summarizeChangedFileNames: (names: string[]) => string;
function performDesignSystemEdit(
  editDocument: Editor.DesignSystemEditPreparation,
  edit: Application.ContentMutation,
  ready: (options?: { withoutBytes: string[] }) => boolean | void,
  editOptions: Editor.EditPreparationOptions,
  verb: string = "change",
): boolean | void {
  let value = editOptions.say ?? showEditorNotification;
  if (editDocument.busy()) {
    value(uiMessage("design-system.editDispatch.stillWorkingOnYourPrevious"));
    return false;
  }
  if (editDocument.needs(edit).length === 0) {
    return ready();
  }
  editDocument
    .prepare(edit)
    .then((editResult): void => {
      if (editResult.ok) {
        ready();
        return;
      }
      if (editResult.tooMany) {
        value(
          uiMessage("design-system.editDispatch.thatIsTooMuchTo"),
        );
        return;
      }
      let changedNames = summarizeChangedFileNames(
          editResult.failed.map(editOptions.nameOf),
        ),
        pronoun: string = editResult.failed.length === 1 ? "it" : "them";
      if (verb === "removal" && editOptions.ask !== undefined) {
        editOptions.ask({
          get title() { return uiMessage("design-system.editDispatch.removeAnyway"); },
          body:
            changedNames +
            " could not be loaded, so removing " +
            pronoun +
            " cannot be undone.",
          run: (): void => {
            ready({
              withoutBytes: editResult.failed,
            });
          },
        });
        return;
      }
      value(
        changedNames +
          " could not be loaded, so nothing was changed. Try again, or reload the page if it keeps happening.",
      );
    })
    .catch(() => value(uiMessage("design-system.editDispatch.thatChangeCouldNotBe")));
  return true;
}
export {
  performDesignSystemEdit,
  reactAssetGroupEditor,
  summarizeChangedFileNames,
};
export function installEditorEditDispatch(): () => void {
  return () => {
    reactAssetGroupEditor = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    summarizeChangedFileNames = (names: string[]) =>
      names.length <= 3
        ? names.join(", ")
        : names.slice(0, 3).join(", ") +
          " and " +
          String(names.length - 3) +
          " more";
  };
}
