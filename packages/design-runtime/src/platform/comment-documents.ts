/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { parseDocumentComments } from "./comments";
import { structurallyEqual } from "./document-values";

var CommentsValue: Dynamic;
function decomposeComments(
  comments?: Dynamic,
  existingStates?: Dynamic,
  stateCache?: Dynamic,
): Dynamic {
  for (let value of comments as Dynamic) {
    let commentKey: Dynamic = CommentsValue + "/" + value.id,
      state: Dynamic = {};
    for (let [propertyName, propertyValue] of Object.entries(value) as Dynamic)
      propertyValue !== undefined && (state[propertyName] = propertyValue);
    let cachedState: Dynamic = existingStates?.get(commentKey);
    stateCache.set(
      commentKey,
      cachedState !== undefined && structurallyEqual(cachedState, state)
        ? cachedState
        : state,
    );
  }
}
function composeComments(commentStates?: Dynamic): Dynamic {
  let items: Dynamic = [],
    value: Dynamic = CommentsValue + "/";
  for (let [commentKey, commentState] of commentStates as Dynamic)
    !commentKey.startsWith(value) ||
      commentKey.indexOf("/", value.length) >= 0 ||
      items.push({
        ...commentState,
        id: commentKey.slice(value.length),
      });
  return parseDocumentComments(items);
}
export {
  CommentsValue,
  composeComments,
  decomposeComments,
};
export function installPlatformCommentDocuments(): () => void {
  return () => {
    CommentsValue = "comments";
  };
}
