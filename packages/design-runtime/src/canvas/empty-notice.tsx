import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { CreationWorkingAnnouncement, EmptyCanvasPrompt } from "./creation-prompt";
import { getCanvasLoadFailure, subscribeCanvasLoadFailure } from "../platform/migration-input";

var react_HAt: Dynamic;
var jsx_H_: Dynamic;
function EmptyCanvasReadOnlyNotice({
  editable: editable,
  reason: reason,
  wholeCanvas: wholeCanvas,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, react_HAt.useSyncExternalStore)(
    subscribeCanvasLoadFailure,
    getCanvasLoadFailure,
    (): Dynamic => {},
  );
  return !editable && wholeCanvas && value !== undefined ? (
    <p
      data-testid={"dc-empty-page-note"}
      className={"max-w-sm text-[12.5px] text-secondary"}
    >
      {value}
    </p>
  ) : (
    <jsx_H_.Fragment>
      <p
        data-testid={"dc-empty-page-note"}
        className={"text-[12.5px] text-secondary"}
      >
        {editable ? (uiMessage("canvas.emptyNotice.noArtboardsYet")) : (uiMessage("canvas.emptyNotice.noArtboardsToShowIn"))}
      </p>
      {!editable && reason !== undefined && (<p className={"max-w-sm text-[11.5px] text-secondary"}>{reason}</p>)}
    </jsx_H_.Fragment>
  );
}
export {
  EmptyCanvasReadOnlyNotice,
  jsx_H_,
  react_HAt,
};
export function installCanvasEmptyNotice(): () => void {
  return () => {
    react_HAt = toModuleNamespace(load_react(), 1);
    jsx_H_ = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}

interface EmptyStateOptions {
  editing: boolean;
  editable: boolean;
  hasArtboards: boolean;
  hasIncomingArtboards: boolean;
  hasAnnotations: boolean;
  wholeCanvasEmpty: boolean;
  wholeCanvasWithoutArtboards: boolean;
  showEditingPrompt: boolean;
  reserveToolbarSpace: boolean;
  workingLabel: boolean;
  readOnlyReason?: Dynamic;
  addArtboard(): void;
}

export function CanvasEmptyState({
  editing, editable, hasArtboards, hasIncomingArtboards, hasAnnotations, wholeCanvasEmpty,
  wholeCanvasWithoutArtboards, showEditingPrompt, reserveToolbarSpace, workingLabel,
  readOnlyReason, addArtboard,
}: EmptyStateOptions) {
  const emptyPage = !hasArtboards && !hasIncomingArtboards;
  const showPrompt = emptyPage && editing && hasAnnotations && showEditingPrompt;
  const showNotice = emptyPage && !editing;
  const space = reserveToolbarSpace ? " top-[var(--tb-overlay-h,0px)] [container-type:size]" : "";
  return (
    <>
      {showPrompt && (
        <div className={"pointer-events-none absolute inset-0 z-[35] flex flex-col items-center justify-center gap-3 text-center" + space}>
          <EmptyCanvasPrompt
            sentence={(wholeCanvasWithoutArtboards ? uiMessage("canvas.designCanvas.thisCanvas") :
              uiMessage("canvas.designCanvas.thisPage")) + " has no artboards yet. Add one, or let the agent add some."}
            onAdd={addArtboard}
          />
        </div>
      )}
      {showNotice && (
        <div className="pointer-events-none absolute inset-0 z-[35] flex flex-col items-center justify-center gap-1 text-center">
          <EmptyCanvasReadOnlyNotice editable={editable} reason={readOnlyReason} wholeCanvas={wholeCanvasEmpty} />
        </div>
      )}
      {workingLabel && <CreationWorkingAnnouncement />}
    </>
  );
}
