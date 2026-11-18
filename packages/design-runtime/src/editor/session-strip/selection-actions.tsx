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
  let value: Dynamic = useTouchToolbar() ? onDelete : undefined,
    value2: Dynamic =
      typeof disabledReason == "string"
        ? {
            more: disabledReason,
          }
        : (disabledReason ?? {});
  return lead == null &&
    onComment === null &&
    value === undefined &&
    onOpenInspector === undefined &&
    value2.more === undefined ? null : (
    <SessionStripGroup>
      {lead}
      {onComment !== null && (<SessionStripButton
          icon={"ChatAdd"}
          data-testid={testids?.comment}
          title={value2.comment ?? (uiMessage("inspector.selectionActions.commentOnThisElement"))}
          aria-label={uiMessage("inspector.selectionActions.comment")}
          disabled={value2.comment !== undefined}
          onClick={(input?: Dynamic): Dynamic =>
            onComment(input.currentTarget)
          }
        />)}
      {value !== undefined && (<SessionStripButton
          icon={"Trash"}
          data-testid={testids?.delete ?? "frame-delete"}
          title={value2.delete ?? (deleteTitle)}
          aria-label={uiMessage("inspector.selectionActions.delete")}
          disabled={value2.delete !== undefined}
          onClick={value}
        />)}
      {onOpenInspector !== undefined || value2.more !== undefined && (<SessionStripButton
          icon={"DotsVertical"}
          data-testid={testids?.more ?? "frame-more"}
          title={
            value2.more ?? moreMenu?.label ?? (uiMessage("inspector.selectionActions.openThePropertiesPanel"))
          }
          aria-label={moreMenu?.label ?? (uiMessage("inspector.selectionActions.properties"))}
          aria-haspopup={moreMenu ? "menu" : undefined}
          aria-expanded={moreMenu?.open}
          disabled={value2.more !== undefined}
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
