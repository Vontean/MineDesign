import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { SessionStripButton, SessionStripGroup } from "./session-strip";
import { useTouchToolbar } from "../toolbar/layout";

function SelectionSessionActions({
  lead: lead,
  onComment: onComment,
  onDelete: onDelete,
  deleteTitle = uiMessage("inspector.selectionActions.deleteThisElement"),
  onOpenInspector: onOpenInspector,
  disabledReason: disabledReason,
  moreMenu: moreMenu,
  testids: testids,
}: Dynamic): Dynamic {
  useUiLocale();
  let touchDeleteHandler: Dynamic = useTouchToolbar() ? onDelete : undefined,
    disabledReasons: Dynamic =
      typeof disabledReason == "string"
        ? {
            more: disabledReason,
          }
        : (disabledReason ?? {});
  return lead == null &&
    onComment === null &&
    touchDeleteHandler === undefined &&
    onOpenInspector === undefined &&
    disabledReasons.more === undefined ? null : (
    <SessionStripGroup>
      {lead}
      {onComment !== null && (<SessionStripButton
          icon={"ChatAdd"}
          data-testid={testids?.comment}
          title={disabledReasons.comment ?? (uiMessage("inspector.selectionActions.commentOnThisElement"))}
          aria-label={uiMessage("inspector.selectionActions.comment")}
          disabled={disabledReasons.comment !== undefined}
          onClick={(event?: Dynamic): Dynamic =>
            onComment(event.currentTarget)
          }
        />)}
      {touchDeleteHandler !== undefined && (<SessionStripButton
          icon={"Trash"}
          data-testid={testids?.delete ?? "frame-delete"}
          title={disabledReasons.delete ?? (deleteTitle)}
          aria-label={uiMessage("inspector.selectionActions.delete")}
          disabled={disabledReasons.delete !== undefined}
          onClick={touchDeleteHandler}
        />)}
      {onOpenInspector !== undefined || disabledReasons.more !== undefined && (<SessionStripButton
          icon={"DotsVertical"}
          data-testid={testids?.more ?? "frame-more"}
          title={
            disabledReasons.more ?? moreMenu?.label ?? (uiMessage("inspector.selectionActions.openThePropertiesPanel"))
          }
          aria-label={moreMenu?.label ?? (uiMessage("inspector.selectionActions.properties"))}
          aria-haspopup={moreMenu ? "menu" : undefined}
          aria-expanded={moreMenu?.open}
          disabled={disabledReasons.more !== undefined}
          onClick={onOpenInspector}
        />)}
    </SessionStripGroup>
  );
}
export {
  SelectionSessionActions,
};
export function installEditorSessionStripSelectionActions(): () => void {
  return () => {};
}
