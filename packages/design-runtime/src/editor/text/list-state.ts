import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function getTextListKind(element?: Dynamic): Dynamic {
  if (!element) return "none";
  let value: Dynamic = element.tagName.toLowerCase(),
    listElement: Dynamic =
      value === "ul" || value === "ol"
        ? element
        : value === "li"
          ? element.parentElement
          : element.children.length === 1 &&
              /^(ul|ol)$/i.test(element.children[0].tagName)
            ? element.children[0]
            : null;
  return listElement == null
    ? "none"
    : listElement.tagName.toLowerCase() === "ol"
      ? "number"
      : "bullet";
}
function listKindToTag(listKind?: Dynamic, fallbackKind?: Dynamic): Dynamic {
  return listKind === "number"
    ? "ol"
    : listKind === "bullet"
      ? "ul"
      : fallbackKind === "number"
        ? "ol"
        : fallbackKind === "bullet"
          ? "ul"
          : null;
}
function normalizeTextEditListState(state?: Dynamic): Dynamic {
  if (state.active !== true) return null;
  let value: Dynamic = state.plain === true;
  return {
    tid: Number.isInteger(state.tid) ? state.tid : null,
    plain: value,
    ul: !value && state.formats?.ul === true,
    ol: !value && state.formats?.ol === true,
  };
}
function createPendingTextListCounter(): Dynamic {
  let index: Dynamic = 0;
  return {
    begin: (hasPending?: Dynamic): Dynamic => {
      let value: Dynamic = hasPending ? 1 : 0;
      index += value;
      return (): Dynamic => {
        index -= value;
      };
    },
    pending: (): Dynamic => index > 0,
  };
}
function sameTextEditListState(firstState?: Dynamic, secondState?: Dynamic): Dynamic {
  return (
    firstState === secondState ||
    (firstState !== null &&
      secondState !== null &&
      firstState.tid === secondState.tid &&
      firstState.plain === secondState.plain &&
      firstState.ul === secondState.ul &&
      firstState.ol === secondState.ol)
  );
}
function resolveTextListState(
  items?: Dynamic,
  candidate?: Dynamic,
  transactionId?: Dynamic,
  editingMode?: Dynamic,
): Dynamic {
  let matchedState: Dynamic =
      candidate !== null && transactionId !== undefined && candidate.tid === transactionId
        ? candidate
        : null,
    activeList: Dynamic = matchedState !== null && !matchedState.plain ? matchedState : null,
    listKind: Dynamic = activeList
      ? activeList.ol
        ? "number"
        : activeList.ul
          ? "bullet"
          : "none"
      : (items[0] ?? "none"),
    isMixed: Dynamic =
      activeList === null &&
      items.some((item?: Dynamic): Dynamic => item !== items[0]),
    disabledReason: Dynamic =
      items.length !== 1
        ? uiMessage("inspector.listState.makeListsOneTextAt")
        : matchedState?.plain
          ? uiMessage("inspector.listState.thisTextIsBoundTo")
          : activeList === null && !editingMode
            ? uiMessage("inspector.listState.thisTextIsNotEditable")
            : null;
  return {
    value: listKind,
    mixed: isMixed,
    live: activeList !== null,
    off: disabledReason,
  };
}
function classifyTextListEdit(beforeState?: Dynamic, afterState?: Dynamic): Dynamic {
  return beforeState === null || afterState === null
    ? "refused"
    : beforeState.undoLength !== afterState.undoLength ||
        beforeState.template !== afterState.template ||
        beforeState.pendingScript !== afterState.pendingScript ||
        beforeState.pendingProps !== afterState.pendingProps ||
        beforeState.pendingPropsJson !== afterState.pendingPropsJson
      ? "applied"
      : "refused";
}
function isSuccessfulTextListEdit(
  status?: Dynamic,
  hasOptions?: Dynamic,
): Dynamic {
  return status === "applied" || (status === "none" && !hasOptions);
}
export {
  classifyTextListEdit,
  createPendingTextListCounter,
  getTextListKind,
  isSuccessfulTextListEdit,
  listKindToTag,
  normalizeTextEditListState,
  resolveTextListState,
  sameTextEditListState,
};
export function installEditorTextListState(): () => void {
  return () => {};
}
