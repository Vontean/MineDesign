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
  document2: Editor.DesignSystemEditPreparation,
  edit: Application.ContentMutation,
  ready: (options?: { withoutBytes: string[] }) => boolean | void,
  options: Editor.EditPreparationOptions,
  verb: string = "change",
): boolean | void {
  let value = options.say ?? showEditorNotification;
  if (document2.busy()) {
    value(uiMessage("design-system.editDispatch.stillWorkingOnYourPrevious"));
    return false;
  }
  if (document2.needs(edit).length === 0) {
    return ready();
  }
  document2
    .prepare(edit)
    .then((input): void => {
      if (input.ok) {
        ready();
        return;
      }
      if (input.tooMany) {
        value(
          uiMessage("design-system.editDispatch.thatIsTooMuchTo"),
        );
        return;
      }
      let value2 = summarizeChangedFileNames(
          input.failed.map(options.nameOf),
        ),
        value3: string = input.failed.length === 1 ? "it" : "them";
      if (verb === "removal" && options.ask !== undefined) {
        options.ask({
          get title() { return uiMessage("design-system.editDispatch.removeAnyway"); },
          body:
            value2 +
            " could not be loaded, so removing " +
            value3 +
            " cannot be undone.",
          run: (): void => {
            ready({
              withoutBytes: input.failed,
            });
          },
        });
        return;
      }
      value(
        value2 +
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
    reactAssetGroupEditor = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
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
