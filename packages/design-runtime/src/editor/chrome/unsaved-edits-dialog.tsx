import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";
export function installEditorChromeUnsavedEditsDialog(
  runtime: RuntimeBindings,
): () => void {
  function UnsavedEditsDialog({
    open: open,
    editCount: editCount,
    onChoose: onChoose,
  }: Dynamic): Dynamic {
    useUiLocale();
    let [value, value2]: Dynamic = (0,
    runtime.reactCodeDesignColorTokens.useState)("keep");
    (0, runtime.reactCodeDesignColorTokens.useEffect)((): Dynamic => {
      open || value2("keep");
    }, [open]);
    let value3: Dynamic =
      editCount === 1
        ? uiMessage("inspector.unsavedEditsDialog.yourUnsavedEdit")
        : editCount > 1
          ? `your ${editCount} unsaved edits`
          : uiMessage("inspector.unsavedEditsDialog.yourUnsavedEdits");
    return (
      <runtime.CdsIsland className={"contents"}>
        <runtime.DialogDialogRootTriggerPopupConfig.Root
          open={open}
          onOpenChange={(input?: Dynamic): Dynamic =>
            !input && onChoose("keep")
          }
        >
          <runtime.DialogDialogRootTriggerPopupConfig.Popup size={"sm"}>
            <runtime.DialogDialogRootTriggerPopupConfig.Header
              showClose={false}
              description={uiMessage("inspector.unsavedEditsDialog.itWasUpdatedOutsideThisEditorWhatDoYouWantToDoWith", { value1: String(value3) })}
            >
              {uiMessage("inspector.unsavedEditsDialog.thisFileChanged")}
            </runtime.DialogDialogRootTriggerPopupConfig.Header>
            <runtime.ComponentsRadioGroupAssignValue
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
            <runtime.DialogDialogRootTriggerPopupConfig.Footer>
              <runtime.Button
                variant={"primary"}
                onClick={(): Dynamic => onChoose(value)}
              >
                {uiMessage("inspector.unsavedEditsDialog.okay")}
              </runtime.Button>
            </runtime.DialogDialogRootTriggerPopupConfig.Footer>
          </runtime.DialogDialogRootTriggerPopupConfig.Popup>
        </runtime.DialogDialogRootTriggerPopupConfig.Root>
      </runtime.CdsIsland>
    );
  }
  bindRuntimeValue(runtime, "UnsavedEditsDialog", () => UnsavedEditsDialog);
  return () => {};
}
