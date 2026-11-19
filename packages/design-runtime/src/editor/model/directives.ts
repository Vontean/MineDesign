/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

function buildDirectiveMap(templateNodes?: Dynamic): Dynamic {
  let isDirectiveTag: Dynamic = (tagName?: Dynamic): Dynamic =>
      tagName === "sc-if" || tagName === "sc-for",
    collectDirectiveIds: Dynamic = (nodes?: Dynamic): Dynamic =>
      nodes.flatMap(
        (node?: Dynamic): Dynamic =>
          isDirectiveTag(node.tag) ? collectDirectiveIds(node.children) : [node.tid],
      ),
    directiveMap: Dynamic = {},
    visitNodes: Dynamic = (nodes?: Dynamic, isInsideLoop?: Dynamic): Dynamic => {
      for (let node of nodes as Dynamic) {
        if (isDirectiveTag(node.tag)) {
          let directiveIds: Dynamic = collectDirectiveIds(node.children);
          directiveIds.length > 0 &&
            (directiveMap[node.tid] = {
              kind: node.tag === "sc-if" ? "if" : "for",
              kids: directiveIds,
              countKids: isInsideLoop
                ? []
                : node.children
                    .filter(
                      (child?: Dynamic): Dynamic => !isDirectiveTag(child.tag),
                    )
                    .map((child?: Dynamic): Dynamic => child.tid),
            });
        }
        visitNodes(node.children, isInsideLoop || node.tag === "sc-for");
      }
    };
  visitNodes(templateNodes, false);
  return directiveMap;
}
export {
  buildDirectiveMap,
};
export function installEditorModelDirectives(): () => void {
  return () => {};
}
