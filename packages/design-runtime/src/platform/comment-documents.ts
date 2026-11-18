/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { parseDocumentComments } from "./comments";
import { structurallyEqual } from "./document-values";

var CommentsValue: Dynamic;
function decomposeComments(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  for (let value of input as Dynamic) {
    let value2: Dynamic = CommentsValue + "/" + value.id,
      state: Dynamic = {};
    for (let [value4, value5] of Object.entries(value) as Dynamic)
      value5 !== undefined && (state[value4] = value5);
    let value3: Dynamic = options?.get(value2);
    context.set(
      value2,
      value3 !== undefined && structurallyEqual(value3, state)
        ? value3
        : state,
    );
  }
}
function composeComments(input?: Dynamic): Dynamic {
  let items: Dynamic = [],
    value: Dynamic = CommentsValue + "/";
  for (let [value2, value3] of input as Dynamic)
    !value2.startsWith(value) ||
      value2.indexOf("/", value.length) >= 0 ||
      items.push({
        ...value3,
        id: value2.slice(value.length),
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
