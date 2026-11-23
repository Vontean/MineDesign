/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var OutlineTreeHandler: Dynamic;
var outlineObjectRowKey: Dynamic;
var outlineElementRowKey: Dynamic;
var OutlineTreeMatches: Dynamic;
function flattenOutlineRows(
  focusedTree?: Dynamic,
  outlineState?: Dynamic,
  getOpenTids?: Dynamic,
): Dynamic {
  let items: Dynamic = [],
    callback: Dynamic = (
      nodes?: Dynamic,
      level?: Dynamic,
      parentKey?: Dynamic,
      fileKey?: Dynamic,
    ): Dynamic => {
      let openTids: Dynamic = getOpenTids(fileKey);
      for (let node of nodes as Dynamic) {
        let rowKey: Dynamic = outlineElementRowKey(fileKey, node.tid),
          isExpandable: Dynamic = node.children.length > 0,
          isOpen: Dynamic = isExpandable && openTids.has(node.tid);
        items.push({
          key: rowKey,
          level: level,
          parentKey: parentKey,
          file: fileKey,
          tid: node.tid,
          expandable: isExpandable,
          open: isOpen,
        });
        isOpen && callback(node.children, level + 1, rowKey, fileKey);
      }
    };
  if (!outlineState) {
    callback(focusedTree, 1, null, null);
    return items;
  }
  for (let value of outlineState.objects as Dynamic)
    items.push({
      key: outlineObjectRowKey(value.id),
      level: 1,
      parentKey: null,
      file: null,
      tid: null,
      object: value.id,
      expandable: false,
      open: false,
    });
  for (let value of outlineState.rows as Dynamic) {
    let fileTree: Dynamic =
        value.file === outlineState.focused ? focusedTree : outlineState.trees[value.file],
      hasChildren: Dynamic = fileTree != null && fileTree.length > 0,
      isFileOpen: Dynamic = hasChildren && outlineState.open.has(value.file),
      fileRowKey: Dynamic = OutlineTreeHandler(value.file);
    items.push({
      key: fileRowKey,
      level: 1,
      parentKey: null,
      file: value.file,
      tid: null,
      expandable: hasChildren,
      open: isFileOpen,
    });
    isFileOpen && callback(fileTree, 2, fileRowKey, value.file);
  }
  return items;
}
function scrollOutlineRowIntoView(
  scroller?: Dynamic,
  row?: Dynamic,
  shouldSmoothScroll: Dynamic = false,
): Dynamic {
  if (!scroller) return false;
  let rowBounds: Dynamic = row.getBoundingClientRect(),
    scrollerBounds: Dynamic = scroller.getBoundingClientRect(),
    value: Dynamic =
      rowBounds.top < scrollerBounds.top
        ? rowBounds.top - scrollerBounds.top
        : rowBounds.bottom > scrollerBounds.bottom
          ? rowBounds.bottom - scrollerBounds.bottom
          : 0;
  return value === 0
    ? false
    : (shouldSmoothScroll && !OutlineTreeMatches() && typeof scroller.scrollTo == "function"
        ? scroller.scrollTo({
            top: scroller.scrollTop + value,
            behavior: "smooth",
          })
        : (scroller.scrollTop += value),
      true);
}
function outlineAncestorMap(nodes?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(),
    callback: Dynamic = (node?: Dynamic, ancestors?: Dynamic): Dynamic => {
      entries.set(node.tid, ancestors);
      for (let value of node.children as Dynamic)
        callback(value, [...ancestors, node.tid]);
    };
  for (let value of nodes as Dynamic) callback(value, []);
  return entries;
}
function isOutlineRowTarget(element?: Dynamic): Dynamic {
  return (
    element.closest('[data-testid="dc-outline"] [role="treeitem"]') != null &&
    element.closest("button, input") == null
  );
}
export {
  flattenOutlineRows,
  isOutlineRowTarget,
  outlineAncestorMap,
  OutlineTreeHandler,
  outlineObjectRowKey,
  outlineElementRowKey,
  OutlineTreeMatches,
  scrollOutlineRowIntoView,
};
export function installEditorOutlineTree(): () => void {
  return () => {
    OutlineTreeHandler = (fileKey?: Dynamic): Dynamic => `ab:${fileKey}`;
    outlineObjectRowKey = (objectId?: Dynamic): Dynamic => `ob:${objectId}`;
    outlineElementRowKey = (fileKey?: Dynamic, tid?: Dynamic): Dynamic =>
      `el:${fileKey ?? ""}:${tid}`;
    OutlineTreeMatches = (): Dynamic =>
      typeof matchMedia == "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
  };
}
