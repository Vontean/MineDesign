import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactCanvasMeasurements } from "../../canvas/measurements";
import { Button } from "../../cds/button/button";
import { Surface } from "../../cds/components/surface";
import { Tooltip } from "../../cds/tooltip/tooltip";
import { jsxToolbarLayout } from "./layout";
import { ToolbarPrimitivesComponent, useDisabledToolbarItem, useToolbarPress } from "./primitives";
import { ToolbarSyncStatus } from "./save-status";
import { PanelValue } from "../../platform/frame-host-bridge";

function ToolbarPublishControls({
  saveState: saveState,
  saveMode = "manual",
  onSave: onSave,
  syncDot = false,
  editing: editing,
  onToggleEdit: onToggleEdit,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = saveState.status === "readonly",
    hasChanges: Dynamic =
      saveState.status === "dirty" || saveState.status === "error",
    isSaveDisabled: Dynamic = !hasChanges || saveState.status === "saving",
    isSaving: Dynamic = saveState.status === "saving",
    saveLabel: Dynamic = isSaving ? "Saving\u2026" : "Save",
    saveDescription: Dynamic = isSaving
      ? saveLabel
      : hasChanges
        ? uiMessage("inspector.publishControls.publishYourChangesEveryOpen")
        : uiMessage("inspector.publishControls.everythingIsPublished"),
    disabledProps: Dynamic = useDisabledToolbarItem({
      disabled: isSaveDisabled,
      name: saveLabel,
      reason: saveDescription,
    }),
    saveButtonRef: Dynamic = (0, reactCanvasMeasurements.useRef)(null);
  useToolbarPress(saveButtonRef, isSaveDisabled);
  return (
    <jsxToolbarLayout.Fragment>
      {!value && onToggleEdit ? (<ToolbarPrimitivesComponent
          icon={"Edit"}
          label={uiMessage("inspector.publishControls.edit")}
          tip={editing ? (uiMessage("inspector.publishControls.doneEditingBackToThe")) : (uiMessage("inspector.publishControls.edit"))}
          pressed={editing === true}
          onClick={onToggleEdit}
          data-testid={"dc-mode-edit"}
        />) : (null)}
      {!value && syncDot ? (<ToolbarSyncStatus state={saveState} onRetry={onSave} />) : (null)}
      {!value && saveMode === "manual" && !syncDot ? (<Tooltip
          content={saveDescription}
          shortcut={hasChanges ? "cmd+s" : undefined}
          side={"bottom"}
          align={"end"}
          hoverable={false}
        >
          <span
            ref={saveButtonRef}
            tabIndex={isSaveDisabled ? 0 : -1}
            {...disabledProps.props}
            data-tb-save={""}
            className={
              "inline-flex shrink-0 rounded outline-none focus-visible:outline-hidden focus-visible:shadow-focus"
            }
          >
            <Button
              variant={hasChanges ? "primary" : "secondary"}
              disabled={isSaveDisabled}
              onClick={onSave}
              aria-label={saveLabel}
              {...disabledProps.inner}
            >
              {saveLabel}
            </Button>
            {disabledProps.mirror}
          </span>
        </Tooltip>) : (null)}
    </jsxToolbarLayout.Fragment>
  );
}
function ToolbarSurface({ floating: floating, ...props }: Dynamic): Dynamic {
  useUiLocale();
  return floating ? (
    <Surface elevation={PanelValue} {...props} />
  ) : (
    <div {...props} />
  );
}
export {
  ToolbarPublishControls,
  ToolbarSurface,
};
export function installEditorToolbarPublishControls(): () => void {
  return () => {};
}
