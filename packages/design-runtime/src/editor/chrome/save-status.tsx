import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";
import { CdsIsland, initializePlatformCdsIsland } from "../../platform/cds-island";

var reactChromeSaveStatus: Dynamic;
var jsxChromeSaveStatus: Dynamic;
function DocumentSaveStatus({
  doc: doc,
  onSave: onSave,
  docked = false,
  belowPickerBar = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let [, rerender]: Dynamic = (0, reactChromeSaveStatus.useState)(0);
  (0, reactChromeSaveStatus.useEffect)((): Dynamic => {
    let unsubscribeDoc: Dynamic = doc.subscribe(
        (): Dynamic => rerender((tick?: Dynamic): Dynamic => tick + 1),
      ),
      unsubscribeSave: Dynamic = doc.subscribeSave(
        (): Dynamic => rerender((tick?: Dynamic): Dynamic => tick + 1),
      );
    return (): Dynamic => {
      unsubscribeDoc();
      unsubscribeSave();
    };
  }, [doc]);
  (0, reactChromeSaveStatus.useEffect)((): Dynamic => {
    let handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      event.defaultPrevented ||
        ((event.metaKey || event.ctrlKey) &&
          event.key.toLowerCase() === "s" &&
          (event.preventDefault(),
          doc.readOnly() || (onSave ? onSave() : doc.save())));
    };
    (window as Dynamic).addEventListener("keydown", handleKeyDown);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", handleKeyDown);
  }, [doc]);
  if (!doc.stashOffer()) return null;
  let isReadOnly: Dynamic = doc.readOnly();
  return (
    <CdsIsland className={"contents"}>
      <div
        className={
          (belowPickerBar
            ? "top-[52px] pointer-coarse:top-[68px]"
            : docked
              ? "top-11 pointer-coarse:top-[52px]"
              : "top-[calc(var(--tb-overlay-h,54px)+4px)]") +
          " absolute inset-x-3 z-40 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-x-3 gap-y-2 rounded-lg bg-surface-panel px-4 py-2 shadow-panel-sm"
        }
      >
        <span className={"min-w-0 text-footnote text-secondary"}>
          {uiMessage("inspector.saveStatus.youHaveUnsavedWorkFromAPreviousSession")}
          {isReadOnly ? (uiMessage("inspector.saveStatus.thisViewCanTSave")) : ("")}
        </span>
        <span className={"ml-auto flex shrink-0 items-center gap-1"}>
          <Button
            type={"button"}
            variant={"primary"}
            onClick={(): Dynamic => doc.restoreStash()}
          >
            {uiMessage("inspector.saveStatus.restore")}
          </Button>
          <Button
            type={"button"}
            variant={"ghost"}
            onClick={(): Dynamic => doc.discardStash()}
          >
            {uiMessage("inspector.saveStatus.discard")}
          </Button>
        </span>
      </div>
    </CdsIsland>
  );
}
export {
  DocumentSaveStatus,
  jsxChromeSaveStatus,
  reactChromeSaveStatus,
};
export function installEditorChromeSaveStatus(): () => void {
  return () => {
    reactChromeSaveStatus = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    initializePlatformCdsIsland();
    jsxChromeSaveStatus = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
