/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeNpm_usehooks_ts_p0, load_react, npm_useLocalStorage_QP } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactInspectorContext: Dynamic;
var inspectorPanelId: Dynamic;
var editorToolbarId: Dynamic;
var inspectorToggleId: Dynamic;
var linkPopoverAttribute: Dynamic;
var inspectorOpenStorageKey: Dynamic;
var DcEditorModeKey: Dynamic;
var DcEditorGuidesVisibleKey: Dynamic;
var defaultInspectorOpen: Dynamic;
var InspectorOpenContext: Dynamic;
var initializeInspectorContext: Dynamic;
function getTweakSelection(
  isInspectorOpen?: Dynamic,
  hasSelection?: Dynamic,
  mode?: Dynamic,
  selection?: Dynamic,
): Dynamic {
  return isInspectorOpen && hasSelection && mode === "tweaks" ? selection : null;
}
function useInspectorOpen(): Dynamic {
  let storedOpenState: Dynamic = npm_useLocalStorage_QP(
    inspectorOpenStorageKey,
    defaultInspectorOpen,
  );
  return (
    (0, reactInspectorContext.useContext)(InspectorOpenContext) ?? [
      storedOpenState[0],
      storedOpenState[1],
    ]
  );
}
function hasInspectorOpenProvider(): Dynamic {
  return (0, reactInspectorContext.useContext)(InspectorOpenContext) != null;
}
export {
  DcEditorGuidesVisibleKey,
  DcEditorModeKey,
  defaultInspectorOpen,
  editorToolbarId,
  getTweakSelection,
  hasInspectorOpenProvider,
  initializeInspectorContext,
  InspectorOpenContext,
  inspectorOpenStorageKey,
  inspectorPanelId,
  inspectorToggleId,
  linkPopoverAttribute,
  reactInspectorContext,
  useInspectorOpen,
};
export function installEditorInspectorContext(): () => void {
  return () => {
    initializeInspectorContext = initializeOnce((): Dynamic => {
      "use strict";

      reactInspectorContext = toModuleNamespace(
        load_react(),
        1,
      );
      initializeNpm_usehooks_ts_p0();
      inspectorPanelId = "dc-panel-aside";
      editorToolbarId = "dc-toolbar-tools";
      inspectorToggleId = "dc-props-toggle";
      linkPopoverAttribute = "data-dc-link-popover";
      inspectorOpenStorageKey = "dc-editor-props-open-v2";
      DcEditorModeKey = "dc-editor-mode";
      DcEditorGuidesVisibleKey = "dc-editor-guides-visible";
      defaultInspectorOpen = false;
      InspectorOpenContext = (0, reactInspectorContext.createContext)(null);
    });
  };
}
