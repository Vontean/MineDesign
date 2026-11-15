import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Value_5 } from "../../canvas/working-state";
import { load_react } from "../../dependencies";
import { AccessibilityAnnouncementsHandler } from "../accessibility/announcements";
import { toModuleNamespace } from "../../module-helpers";
import { awaitFeatureFlag } from "../../platform/feature-flags";
import { canvasMetadataFile, parseCanvasMetadata } from "../../platform/file-content";

var ClipboardWorkingFilesHandler: Dynamic;
var reactClipboardWorkingFiles: Dynamic;
var AppifactExtraExportFormatsValue: Dynamic;
var ClipboardWorkingFilesConstant: Dynamic;
function createWorkingFileMap(input?: Dynamic): Dynamic {
  let values: Dynamic = new Set(
      (0, parseCanvasMetadata)(input[canvasMetadataFile], {
        ...input,
      }).artboards.map((input2?: Dynamic): Dynamic => input2.file),
    ),
    entries: Dynamic = new Map();
  for (let [value, value2] of Object.entries(input) as Dynamic)
    entries.set(values.has(value) ? value : Value_5 + value, value2);
  return entries;
}
function createCurrentWorkingGeneration(): Dynamic {
  let value: Dynamic = ++ClipboardWorkingFilesConstant;
  return (): Dynamic => value === ClipboardWorkingFilesConstant;
}
function useClipboardFeatureFlag(): Dynamic {
  let [value, value2]: Dynamic = (0, reactClipboardWorkingFiles.useState)(
    false,
  );
  (0, reactClipboardWorkingFiles.useEffect)((): Dynamic => {
    let flag: Dynamic = true;
    (0, awaitFeatureFlag)(
      AppifactExtraExportFormatsValue,
      false,
    ).then((input?: Dynamic): Dynamic => {
      flag && value2(input);
    });
    return (): Dynamic => {
      flag = false;
    };
  }, []);
  return value;
}
export {
  AppifactExtraExportFormatsValue,
  ClipboardWorkingFilesConstant,
  ClipboardWorkingFilesHandler,
  createCurrentWorkingGeneration,
  createWorkingFileMap,
  reactClipboardWorkingFiles,
  useClipboardFeatureFlag,
};
export function installEditorClipboardWorkingFiles(): () => void {
  return () => {
    ClipboardWorkingFilesHandler = (input?: Dynamic): Dynamic =>
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      uiMessage("inspector.workingFiles.theAgentIsAdding") +
      (0, AccessibilityAnnouncementsHandler)(input);
    reactClipboardWorkingFiles = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    AppifactExtraExportFormatsValue = "appifact_extra_export_formats";
    ClipboardWorkingFilesConstant = 0;
  };
}
