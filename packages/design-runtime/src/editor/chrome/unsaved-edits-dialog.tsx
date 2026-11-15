import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { ComponentsRadioGroupAssignValue } from "../../cds/components/radio-group";
import { DialogDialogRootTriggerPopupConfig } from "../../cds/dialog/dialog";
import { reactCodeDesignColorTokens } from "../code/design-color-tokens";
import { CdsIsland } from "../../platform/cds-island";

function UnsavedEditsDialog({
  open: open,
  editCount: editCount,
  onChoose: onChoose,
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, value2]: Dynamic = (0,
  reactCodeDesignColorTokens.useState)("keep");
  (0, reactCodeDesignColorTokens.useEffect)((): Dynamic => {
    open || value2("keep");
  }, [open]);
  let value3: Dynamic =
    editCount === 1
      ? uiMessage("inspector.unsavedEditsDialog.yourUnsavedEdit")
      : editCount > 1
        ? `your ${editCount} unsaved edits`
        : uiMessage("inspector.unsavedEditsDialog.yourUnsavedEdits");
  return (
    <CdsIsland className={"contents"}>
      <DialogDialogRootTriggerPopupConfig.Root
        open={open}
        onOpenChange={(input?: Dynamic): Dynamic =>
          !input && onChoose("keep")
        }
      >
        <DialogDialogRootTriggerPopupConfig.Popup size={"sm"}>
          <DialogDialogRootTriggerPopupConfig.Header
            showClose={false}
            description={uiMessage("inspector.unsavedEditsDialog.itWasUpdatedOutsideThisEditorWhatDoYouWantToDoWith", { value1: String(value3) })}
          >
            {uiMessage("inspector.unsavedEditsDialog.thisFileChanged")}
          </DialogDialogRootTriggerPopupConfig.Header>
          <ComponentsRadioGroupAssignValue
            value={value}
            onChange={value2}
            options={[
              {
                value: "reload",
                get label() { return uiMessage("inspector.unsavedEditsDialog.discardAndReload"); },
                get description() { return uiMessage("inspector.unsavedEditsDialog.loadTheLatestVersionThe"); },
              },
              {
                value: "keep",
                get label() { return uiMessage("inspector.unsavedEditsDialog.keepThem"); },
                get description() { return uiMessage("inspector.unsavedEditsDialog.yourEditsStayInThis"); },
              },
            ]}
          />
          <DialogDialogRootTriggerPopupConfig.Footer>
            <Button
              variant={"primary"}
              onClick={(): Dynamic => onChoose(value)}
            >
              {uiMessage("inspector.unsavedEditsDialog.okay")}
            </Button>
          </DialogDialogRootTriggerPopupConfig.Footer>
        </DialogDialogRootTriggerPopupConfig.Popup>
      </DialogDialogRootTriggerPopupConfig.Root>
    </CdsIsland>
  );
}
export {
  UnsavedEditsDialog,
};
export function installEditorChromeUnsavedEditsDialog(): () => void {
  return () => {};
}
