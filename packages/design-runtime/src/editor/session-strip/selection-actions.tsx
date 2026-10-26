import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";
export function installEditorSessionStripSelectionActions(
  runtime: RuntimeBindings,
): () => void {
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
    let value: Dynamic = (0, runtime.useTouchToolbar)() ? onDelete : undefined,
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
      <runtime.SessionStripGroup>
        {lead}
        {onComment !== null && (<runtime.SessionStripButton
            icon={"ChatAdd"}
            data-testid={testids?.comment}
            title={value2.comment ?? (uiMessage("inspector.selectionActions.commentOnThisElement"))}
            aria-label={uiMessage("inspector.selectionActions.comment")}
            disabled={value2.comment !== undefined}
            onClick={(input?: Dynamic): Dynamic =>
              onComment(input.currentTarget)
            }
          />)}
        {value !== undefined && (<runtime.SessionStripButton
            icon={"Trash"}
            data-testid={testids?.delete ?? "frame-delete"}
            title={value2.delete ?? (deleteTitle)}
            aria-label={uiMessage("inspector.selectionActions.delete")}
            disabled={value2.delete !== undefined}
            onClick={value}
          />)}
        {onOpenInspector !== undefined || value2.more !== undefined && (<runtime.SessionStripButton
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
      </runtime.SessionStripGroup>
    );
  }
  bindRuntimeValue(
    runtime,
    "SelectionSessionActions",
    () => SelectionSessionActions,
  );
  return () => {};
}
