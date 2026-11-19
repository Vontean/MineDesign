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
function createWorkingFileMap(files?: Dynamic): Dynamic {
  let artboardFiles: Dynamic = new Set(
      parseCanvasMetadata(files[canvasMetadataFile], {
        ...files,
      }).artboards.map((artboard?: Dynamic): Dynamic => artboard.file),
    ),
    entries: Dynamic = new Map();
  for (let [fileName, fileContent] of Object.entries(files) as Dynamic)
    entries.set(artboardFiles.has(fileName) ? fileName : Value_5 + fileName, fileContent);
  return entries;
}
function createCurrentWorkingGeneration(): Dynamic {
  let generation: Dynamic = ++ClipboardWorkingFilesConstant;
  return (): Dynamic => generation === ClipboardWorkingFilesConstant;
}
function useClipboardFeatureFlag(): Dynamic {
  let [isEnabled, setIsEnabled]: Dynamic = (0, reactClipboardWorkingFiles.useState)(
    false,
  );
  (0, reactClipboardWorkingFiles.useEffect)((): Dynamic => {
    let isMounted: Dynamic = true;
    awaitFeatureFlag(
      AppifactExtraExportFormatsValue,
      false,
    ).then((enabled?: Dynamic): Dynamic => {
      isMounted && setIsEnabled(enabled);
    });
    return (): Dynamic => {
      isMounted = false;
    };
  }, []);
  return isEnabled;
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
    ClipboardWorkingFilesHandler = (announcementDetail?: Dynamic): Dynamic =>
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      uiMessage("inspector.workingFiles.theAgentIsAdding") +
      AccessibilityAnnouncementsHandler(announcementDetail);
    reactClipboardWorkingFiles = toModuleNamespace(
      load_react(),
      1,
    );
    AppifactExtraExportFormatsValue = "appifact_extra_export_formats";
    ClipboardWorkingFilesConstant = 0;
  };
}
