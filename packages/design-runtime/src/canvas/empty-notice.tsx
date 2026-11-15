import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
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
    react_HAt = (0, toModuleNamespace)((0, load_react)(), 1);
    jsx_H_ = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
  };
}
