/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function inspectCaptureLayout(
  doc?: Dynamic,
  getComputedStyle?: Dynamic,
  root?: Dynamic,
  artboardHeight?: Dynamic,
  timeoutMs: Dynamic = 300,
): Dynamic {
  let mediaElementPattern: Dynamic = /^(IMG|SVG|CANVAS|VIDEO)$/i,
    text: Dynamic =
      "[data-dc-editor-overlay],[data-omelette-chrome],[data-noncommentable]",
    state: Dynamic = {
      ic: 0,
      sr: 0,
      cd: 0,
      ur: 0,
    },
    body: Dynamic = doc.body,
    documentElement: Dynamic = doc.documentElement;
  if (!body) return state;
  let defaultView: Dynamic = doc.defaultView,
    scrollY: Dynamic = defaultView ? defaultView.scrollY : 0,
    startedAt: Dynamic = Date.now(),
    callback: Dynamic = (): Dynamic => Date.now() - startedAt > timeoutMs,
    hasScrollableOverflow: Dynamic = (element?: Dynamic): Dynamic =>
      getComputedStyle(element).overflowY,
    hasClippingOverflow: Dynamic = /hidden|clip/.test(
      hasScrollableOverflow(documentElement) + hasScrollableOverflow(body),
    ),
    clippingMode: Dynamic =
      /auto|scroll/.test(hasScrollableOverflow(body)) &&
      body.scrollHeight > body.clientHeight + 1,
    hasLineClamp: Dynamic = (propertyValue?: Dynamic): Dynamic =>
      propertyValue !== undefined && propertyValue !== "" && propertyValue !== "none",
    getClampInfo: Dynamic = (element?: Dynamic): Dynamic => {
      let styles: Dynamic = element;
      return (
        hasLineClamp(styles.webkitLineClamp) ||
        hasLineClamp(styles.lineClamp) ||
        element.textOverflow === "ellipsis"
      );
    },
    entries: Dynamic = new Map(),
    inspectScrollableElement: Dynamic = (element?: Dynamic): Dynamic => {
      let entry: Dynamic = entries.get(element);
      if (entry !== undefined) return entry;
      let styles: Dynamic = getComputedStyle(element),
        isScrollable: Dynamic = /auto|scroll/.test(styles.overflowY);
      if (isScrollable || /hidden|clip/.test(styles.overflowY)) {
        let bounds: Dynamic = element.getBoundingClientRect();
        entry = {
          el: element,
          scrolls: isScrollable,
          clamps: getClampInfo(styles),
          top: bounds.top + scrollY,
          bottom: bounds.bottom + scrollY,
          width: bounds.width,
          height: bounds.height,
        };
      } else entry = null;
      entries.set(element, entry);
      return entry;
    },
    ancestorEntries: Dynamic = new Map(),
    findRelevantAncestor: Dynamic = (element?: Dynamic): Dynamic => {
      let items: Dynamic = [],
        relevantEntry: Dynamic = null;
      for (
        let ancestor: Dynamic = element;
        ancestor !== null && ancestor !== body && ancestor !== documentElement;
        ancestor = ancestor.parentElement
      ) {
        let entry: Dynamic = ancestorEntries.get(ancestor);
        if (entry !== undefined) {
          relevantEntry = entry;
          break;
        }
        items.push(ancestor);
        relevantEntry = inspectScrollableElement(ancestor);
        if (relevantEntry !== null) break;
      }
      for (let ancestor of items as Dynamic) ancestorEntries.set(ancestor, relevantEntry);
      return relevantEntry;
    },
    values: Dynamic = new Set(),
    inspectAncestor: Dynamic = (
      top?: Dynamic,
      bottom?: Dynamic,
      element?: Dynamic,
    ): Dynamic => {
      for (
        let ancestorInfo: Dynamic = findRelevantAncestor(element);
        ancestorInfo !== null;
        ancestorInfo = findRelevantAncestor(ancestorInfo.el.parentElement)
      ) {
        if (ancestorInfo.width < 8 && ancestorInfo.height < 8) return;
        if (!(top < ancestorInfo.bottom - 2)) {
          if (ancestorInfo.clamps) return;
          ancestorInfo.height < 16
            ? values.has(ancestorInfo.el) ||
              (values.add(ancestorInfo.el), (state.cd += 1))
            : bottom >= ancestorInfo.bottom + 24 &&
              (ancestorInfo.scrolls ? (state.sr += 1) : (state.ic += 1));
          return;
        }
      }
      hasClippingOverflow &&
        top >= artboardHeight - 2 &&
        bottom >= artboardHeight + 24 &&
        (clippingMode ? (state.sr += 1) : (state.ic += 1));
    },
    isVisible: Dynamic = (element?: Dynamic): Dynamic => {
      let checkVisibility: Dynamic = element.checkVisibility;
      return typeof checkVisibility == "function"
        ? checkVisibility.call(element)
        : getComputedStyle(element).display !== "none";
    },
    isInsideClosedDetails: Dynamic = (element?: Dynamic): Dynamic => {
      let ancestor: Dynamic = element.closest("details:not([open])");
      if (ancestor === null || ancestor === element) return false;
      let summary: Dynamic = element.closest("summary");
      return !(summary !== null && summary.parentElement === ancestor);
    },
    hasVisibleContent: Dynamic = (element?: Dynamic): Dynamic => {
      for (
        let firstChild: Dynamic = element.firstChild;
        firstChild !== null;
        firstChild = firstChild.nextSibling
      ) {
        if (firstChild.nodeType === 3 && firstChild.data.trim() !== "")
          return true;
        if (firstChild.nodeType !== 1 || firstChild.tagName === "SUMMARY")
          continue;
        let child: Dynamic = firstChild;
        if (
          (child.textContent ?? "").trim() !== "" ||
          mediaElementPattern.test(child.tagName) ||
          child.querySelector("img,svg,canvas,video") !== null
        )
          return true;
      }
      return false;
    },
    isNearlyTransparent: Dynamic = (element?: Dynamic): Dynamic =>
      parseFloat(getComputedStyle(element).opacity) <= 0.05,
    isInsideClippedAncestor: Dynamic = (element?: Dynamic): Dynamic => {
      for (
        let parentElement: Dynamic = element.parentElement;
        parentElement !== null && parentElement !== body;
        parentElement = parentElement.parentElement
      )
        if (isNearlyTransparent(parentElement)) return true;
      return false;
    },
    hasRunningAnimation: Dynamic = (element?: Dynamic): Dynamic => {
      try {
        let documentTimeline: Dynamic = defaultView && defaultView.DocumentTimeline;
        return element
          .getAnimations()
          .some(
            (animation?: Dynamic): Dynamic =>
              animation.timeline !== null &&
              !(documentTimeline && animation.timeline instanceof documentTimeline),
          );
      } catch {
        return false;
      }
    },
    elements: Dynamic = root.querySelectorAll("*");
  for (
    let elementIndex: Dynamic = 0;
    elementIndex < elements.length && elementIndex < 2e4 && !callback();
    elementIndex++
  ) {
    let element: Dynamic = elements[elementIndex];
    if (
      (element.namespaceURI !== "http://www.w3.org/1999/xhtml" &&
        !mediaElementPattern.test(element.tagName)) ||
      element.closest(text) !== null ||
      isInsideClosedDetails(element) ||
      !isVisible(element)
    )
      continue;
    let styles: Dynamic = getComputedStyle(element);
    if (element.tagName === "DETAILS" && !element.open) {
      hasVisibleContent(element) && (state.cd += 1);
      continue;
    }
    if (mediaElementPattern.test(element.tagName)) {
      let bounds: Dynamic = element.getBoundingClientRect();
      bounds.width > 0 &&
        bounds.height > 0 &&
        styles.visibility === "visible" &&
        inspectAncestor(
          bounds.top + scrollY,
          bounds.bottom + scrollY,
          element.parentElement,
        );
      continue;
    }
    parseFloat(styles.opacity) <= 0.05 &&
      /^(static|relative|sticky)$/.test(styles.position) &&
      element.getBoundingClientRect().height >= 40 &&
      (element.textContent ?? "").trim().length >= 20 &&
      !isInsideClippedAncestor(element) &&
      !hasRunningAnimation(element) &&
      (state.ur += 1);
  }
  let textWalker: Dynamic = doc.createTreeWalker(root, 4),
    range: Dynamic = doc.createRange(),
    index: Dynamic = 0;
  for (
    let textNode: Dynamic = textWalker.nextNode();
    textNode !== null && index < 2e4 && !callback();
    textNode = textWalker.nextNode()
  ) {
    if (textNode.data.trim() === "") continue;
    let parentElement: Dynamic = textNode.parentElement;
    if (
      parentElement === null ||
      parentElement.closest("script,style,template,noscript") !== null ||
      parentElement.closest(text) !== null ||
      isInsideClosedDetails(parentElement)
    )
      continue;
    let parentStyles: Dynamic = getComputedStyle(parentElement);
    if (parentStyles.display === "none" || parentStyles.visibility !== "visible")
      continue;
    range.selectNodeContents(textNode);
    let clientRects: Dynamic = range.getClientRects();
    for (let rectIndex: Dynamic = 0; rectIndex < clientRects.length; rectIndex++) {
      let rect: Dynamic = clientRects[rectIndex];
      rect.height < 0.5 ||
        rect.width < 0.5 ||
        ((index += 1),
        inspectAncestor(
          rect.top + scrollY,
          rect.bottom + scrollY,
          parentElement,
        ));
    }
  }
  return state;
}
export {
  inspectCaptureLayout,
};
export function installExportCaptureLayout(): () => void {
  return () => {};
}
