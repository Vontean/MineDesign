/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function calculateFlowTail(
  doc?: Dynamic,
  getComputedStyle?: Dynamic,
  flowRoot?: Dynamic,
): Dynamic {
  if (flowRoot !== doc.body) return 0;
  let callback: Dynamic = (cssValue?: Dynamic): Dynamic =>
      parseFloat(cssValue) || 0,
    value: Dynamic = getComputedStyle(flowRoot),
    isFlowBlock: Dynamic = (styles?: Dynamic): Dynamic =>
      /^(block|list-item)$/.test(styles.display) &&
      callback(styles.paddingTop) === 0 &&
      callback(styles.borderTopWidth) === 0;
  if (!isFlowBlock(value) || getComputedStyle(doc.documentElement).display !== "block")
    return 0;
  let isUnsetTransform: Dynamic = (propertyValue?: Dynamic): Dynamic =>
    propertyValue === undefined || propertyValue === "" || propertyValue === "none";
  if (
    value.position !== "static" ||
    value.float !== "none" ||
    !isUnsetTransform(value.transform) ||
    !isUnsetTransform(value.translate) ||
    !isUnsetTransform(value.rotate) ||
    !isUnsetTransform(value.scale)
  )
    return 0;
  let findFirstFlowChild: Dynamic = (element?: Dynamic): Dynamic => {
      for (
        let firstChild: Dynamic = element.firstChild;
        firstChild !== null;
        firstChild = firstChild.nextSibling
      ) {
        if (firstChild.nodeType === 3 && firstChild.data.trim() !== "")
          return null;
        if (firstChild.nodeType !== 1) continue;
        let childStyles: Dynamic = getComputedStyle(firstChild);
        if (
          !(
            childStyles.display === "none" ||
            childStyles.position === "absolute" ||
            childStyles.position === "fixed" ||
            childStyles.float !== "none"
          )
        )
          return /^(inline|contents|ruby)/.test(childStyles.display)
            ? null
            : firstChild;
      }
      return null;
    },
    firstFlowChild: Dynamic = findFirstFlowChild(flowRoot);
  if (firstFlowChild === null) return 0;
  let bounds: Dynamic = flowRoot.getBoundingClientRect(),
    layoutScale: Dynamic = flowRoot.offsetWidth || 0,
    documentScale: Dynamic =
      layoutScale > 0 && bounds.width > 0 ? bounds.width / layoutScale : 1;
  if (firstFlowChild.getBoundingClientRect().top - bounds.top > 0.5) return 0;
  let documentElement: Dynamic = doc.documentElement,
    rootStyles: Dynamic = getComputedStyle(documentElement),
    flowOffset: Dynamic =
      (bounds.top -
        (documentElement.getBoundingClientRect().top +
          callback(rootStyles.borderTopWidth) +
          callback(rootStyles.paddingTop))) /
      documentScale,
    marginTop: Dynamic = callback(value.marginTop);
  if (
    doc.compatMode !== "BackCompat" &&
    (marginTop <= 0 || flowOffset > marginTop + 0.5)
  )
    return Math.max(0, flowOffset);
  let index: Dynamic = 0,
    currentChild: Dynamic = firstFlowChild;
  for (
    let depth: Dynamic = 0;
    currentChild !== null &&
    depth < 32 &&
    !(currentChild.getBoundingClientRect().top - bounds.top > 0.5);
    depth++
  ) {
    let currentStyles: Dynamic = getComputedStyle(currentChild);
    if (callback(currentStyles.marginTop) < 0) return 0;
    index = Math.max(index, callback(currentStyles.marginTop));
    if (!isFlowBlock(currentStyles) || currentStyles.overflowY !== "visible") break;
    currentChild = findFirstFlowChild(currentChild);
  }
  return doc.compatMode === "BackCompat"
    ? index
    : Math.min(index, Math.max(0, flowOffset));
}
export {
  calculateFlowTail,
};
export function installExportCaptureFlow(): () => void {
  return () => {};
}
