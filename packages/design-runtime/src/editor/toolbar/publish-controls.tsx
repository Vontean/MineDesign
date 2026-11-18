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
    value2: Dynamic =
      saveState.status === "dirty" || saveState.status === "error",
    value3: Dynamic = !value2 || saveState.status === "saving",
    value4: Dynamic = saveState.status === "saving",
    value5: Dynamic = value4 ? "Saving\u2026" : "Save",
    value6: Dynamic = value4
      ? value5
      : value2
        ? uiMessage("inspector.publishControls.publishYourChangesEveryOpen")
        : uiMessage("inspector.publishControls.everythingIsPublished"),
    value7: Dynamic = useDisabledToolbarItem({
      disabled: value3,
      name: value5,
      reason: value6,
    }),
    value8: Dynamic = (0, reactCanvasMeasurements.useRef)(null);
  useToolbarPress(value8, value3);
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
          content={value6}
          shortcut={value2 ? "cmd+s" : undefined}
          side={"bottom"}
          align={"end"}
          hoverable={false}
        >
          <span
            ref={value8}
            tabIndex={value3 ? 0 : -1}
            {...value7.props}
            data-tb-save={""}
            className={
              "inline-flex shrink-0 rounded outline-none focus-visible:outline-hidden focus-visible:shadow-focus"
            }
          >
            <Button
              variant={value2 ? "primary" : "secondary"}
              disabled={value3}
              onClick={onSave}
              aria-label={value5}
              {...value7.inner}
            >
              {value5}
            </Button>
            {value7.mirror}
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
