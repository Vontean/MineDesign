/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function captureReadableText(
  document?: Dynamic,
  getComputedStyle?: Dynamic,
  root?: Dynamic,
  maxTextHeight?: Dynamic,
  maxTextWidth?: Dynamic,
  maxLineHeight?: Dynamic,
  textRuns?: Dynamic,
  baselineOffset?: Dynamic,
  textCache?: Dynamic,
): Dynamic {
  let state: Dynamic = {
      SCRIPT: 1,
      STYLE: 1,
      NOSCRIPT: 1,
      TEMPLATE: 1,
      IFRAME: 1,
      HEAD: 1,
      TITLE: 1,
    },
    lineHeightFactor: Dynamic = 511 / 2 / 1e3,
    count: Dynamic = 2e3,
    bounds: Dynamic = root.getBoundingClientRect(),
    layoutWidth: Dynamic = root.offsetWidth || 0,
    layoutHeight: Dynamic = root.offsetHeight || 0,
    scale: Dynamic =
      layoutWidth > 0 && bounds.width > 0 ? bounds.width / layoutWidth : 1,
    textWidthLimit: Dynamic = maxTextWidth || layoutWidth || bounds.width / scale,
    textHeightLimit: Dynamic = maxLineHeight || layoutHeight || bounds.height / scale,
    range: Dynamic = document.createRange(),
    items: Dynamic = [],
    index: Dynamic = 0,
    flag: Dynamic = false,
    callback: Dynamic = (node?: Dynamic): Dynamic => {
      if (node.parentElement) return node.parentElement;
      let parentNode: Dynamic = node.parentNode;
      return (
        (parentNode !== null &&
          parentNode.nodeType === 11 &&
          parentNode.host) ||
        null
      );
    },
    entries: Dynamic = new Map(),
    inspectAncestor: Dynamic = (node?: Dynamic): Dynamic => {
      let entry: Dynamic = entries.get(node);
      if (entry !== undefined) return entry;
      let parent: Dynamic = node === root ? null : callback(node),
        ancestorEntry: Dynamic =
          parseFloat(getComputedStyle(node).opacity) <= 0 ||
          (parent !== null && inspectAncestor(parent));
      entries.set(node, ancestorEntry);
      return ancestorEntry;
    },
    layoutEntries: Dynamic = new Map(),
    getScrollOffset: Dynamic = (node?: Dynamic, maxScroll?: Dynamic): Dynamic => {
      let entry: Dynamic = layoutEntries.get(node);
      if (entry === undefined) {
        let element: Dynamic = node;
        entry =
          element.scrollHeight - element.clientHeight > maxScroll
            ? 1 / 0
            : (node.getBoundingClientRect().bottom - bounds.top) / scale;
        layoutEntries.set(node, entry);
      }
      return entry;
    },
    styleEntries: Dynamic = new Map(),
    getElementMetrics: Dynamic = (element?: Dynamic): Dynamic => {
      let entry: Dynamic = styleEntries.get(element);
      if (entry === undefined) {
        let styles: Dynamic = getComputedStyle(element),
          whiteSpace: Dynamic = styles.whiteSpace,
          display: Dynamic = styles.display,
          isDisplayNone: Dynamic = display === "none",
          fontSize: Dynamic = parseFloat(styles.fontSize),
          transform: Dynamic =
            element instanceof SVGGraphicsElement &&
            !(element instanceof SVGSVGElement)
              ? element.getScreenCTM()
              : null;
        transform && (fontSize = (fontSize * Math.abs(transform.d)) / scale);
        entry = {
          none: isDisplayNone,
          inline:
            display.indexOf("inline") >= 0 ||
            display === "contents" ||
            display.indexOf("ruby") === 0,
          atomic: display.indexOf("inline-") === 0,
          ok:
            !isDisplayNone &&
            styles.visibility === "visible" &&
            !inspectAncestor(element),
          size: fontSize,
          collapse:
            whiteSpace !== "pre" &&
            whiteSpace !== "pre-wrap" &&
            whiteSpace !== "break-spaces",
          tt: styles.textTransform,
        };
        styleEntries.set(element, entry);
      }
      return entry;
    },
    textSegments: Dynamic = [],
    headingRoles: Dynamic = {
      H1: 1,
      H2: 2,
      H3: 3,
      H4: 4,
      H5: 5,
      H6: 6,
    },
    headingNames: Dynamic = ["H1", "H2", "H3", "H4", "H5", "H6"],
    listRoles: Dynamic = {
      UL: 1,
      OL: 1,
      MENU: 1,
    },
    getHeadingLevel: Dynamic = (element?: Dynamic): Dynamic => {
      let ariaRole: Dynamic = element.getAttribute("role") || null,
        headingLevel: Dynamic = headingRoles[element.tagName.toUpperCase()];
      if (headingLevel !== undefined && ariaRole === null) return headingLevel;
      if (ariaRole !== "heading") return 0;
      let numericLevel: Dynamic = Math.floor(
        Number(element.getAttribute("aria-level")),
      );
      return numericLevel >= 1
        ? Math.min(numericLevel, 6)
        : headingLevel !== undefined
          ? headingLevel
          : 2;
    },
    headingEntries: Dynamic = new Map(),
    getHeadingInfo: Dynamic = (node?: Dynamic): Dynamic => {
      let entry: Dynamic = headingEntries.get(node);
      if (entry === undefined) {
        let parent: Dynamic = node === root ? null : callback(node);
        entry =
          getHeadingLevel(node) > 0
            ? node
            : parent === null
              ? null
              : getHeadingInfo(parent);
        headingEntries.set(node, entry);
      }
      return entry;
    },
    isListElement: Dynamic = (element?: Dynamic): Dynamic => {
      let ariaRole: Dynamic = element.getAttribute("role") || null;
      return (
        ariaRole === "list" ||
        (ariaRole === null && listRoles[element.tagName.toUpperCase()] === 1)
      );
    },
    isListItem: Dynamic = (element?: Dynamic): Dynamic => {
      let ariaRole: Dynamic = element.getAttribute("role") || null;
      return (
        ariaRole === "listitem" ||
        (ariaRole === null && element.tagName.toUpperCase() === "LI")
      );
    },
    listEntries: Dynamic = new Map(),
    getListParent: Dynamic = (node?: Dynamic): Dynamic => {
      let entry: Dynamic = listEntries.get(node);
      if (entry === undefined) {
        let parent: Dynamic = node === root ? null : callback(node),
          listParent: Dynamic = parent === null ? null : getListParent(parent);
        entry =
          listParent !== null ? listParent : isListElement(node) ? node : null;
        listEntries.set(node, entry);
      }
      return entry;
    },
    tableEntries: Dynamic = new Map(),
    tableCounts: Dynamic = new Map(),
    getTableCellInfo: Dynamic = (node?: Dynamic): Dynamic => {
      let entry: Dynamic = tableEntries.get(node);
      if (entry === undefined) {
        let parent: Dynamic = node === root ? null : callback(node),
          cellInfo: Dynamic = isListItem(node)
            ? parent && getListParent(parent)
            : null;
        if (cellInfo) {
          let cellIndex: Dynamic = tableCounts.get(cellInfo) || 0;
          tableCounts.set(cellInfo, cellIndex + 1);
          entry = {
            list: cellInfo,
            index: cellIndex,
          };
        } else entry = parent === null ? null : getTableCellInfo(parent);
        tableEntries.set(node, entry);
      }
      return entry;
    },
    inlineEntries: Dynamic = new Map(),
    getInlineAncestor: Dynamic = (node?: Dynamic): Dynamic => {
      let entry: Dynamic = inlineEntries.get(node);
      if (entry === undefined) {
        let parent: Dynamic = node === root ? null : callback(node),
          isSvgElement: Dynamic =
            node.namespaceURI === "http://www.w3.org/2000/svg"
              ? node.tagName !== "text"
              : getElementMetrics(node).inline;
        entry = parent === null || !isSvgElement ? node : getInlineAncestor(parent);
        inlineEntries.set(node, entry);
      }
      return entry;
    },
    visibilityEntries: Dynamic = new Map(),
    getVisibleAncestor: Dynamic = (element?: Dynamic): Dynamic => {
      let entry: Dynamic = visibilityEntries.get(element);
      if (entry === undefined) {
        let parent: Dynamic = element === root ? null : callback(element),
          visibleAncestor: Dynamic = parent === null ? null : getVisibleAncestor(parent);
        entry =
          visibleAncestor !== null
            ? visibleAncestor
            : element.getAttribute("aria-hidden") === "true" ||
                element.getAttribute("role") === "img"
              ? element
              : null;
        visibilityEntries.set(element, entry);
      }
      return entry;
    },
    inlineMetricEntries: Dynamic = new Map(),
    getInlineMetrics: Dynamic = (node?: Dynamic): Dynamic => {
      let entry: Dynamic = inlineMetricEntries.get(node);
      if (entry === undefined) {
        let metrics: Dynamic = getElementMetrics(node),
          inlineAncestor: Dynamic =
            node === root || !metrics.inline ? null : callback(node);
        entry =
          metrics.inline && metrics.atomic
            ? node
            : inlineAncestor === null
              ? null
              : getInlineMetrics(inlineAncestor);
        inlineMetricEntries.set(node, entry);
      }
      return entry;
    },
    textEntries: Dynamic = new Map(),
    getTextContent: Dynamic = (node?: Dynamic): Dynamic => {
      if (textCache === undefined) return;
      let entry: Dynamic = textEntries.get(node);
      if (entry === undefined) {
        let cachedText: Dynamic = textCache.get(node),
          parent: Dynamic = node === root ? null : callback(node),
          textValue: Dynamic =
            cachedText !== undefined || parent === null
              ? undefined
              : getTextContent(parent);
        entry =
          cachedText !== undefined
            ? cachedText
            : textValue === undefined
              ? null
              : textValue;
        textEntries.set(node, entry);
      }
      return entry === null ? undefined : entry;
    },
    getAccessibleLabel: Dynamic = (
      element?: Dynamic,
      tagName?: Dynamic,
    ): Dynamic => {
      let attribute: Dynamic = element.getAttribute("aria-labelledby");
      if (attribute !== null) {
        let attributeValue: Dynamic = attribute
          .split(/\s+/)
          .map(
            (id?: Dynamic): Dynamic =>
              id === "" ? null : document.getElementById(id),
          )
          .map(
            (textId?: Dynamic): Dynamic =>
              textId === null ? "" : (textId.textContent || "").trim(),
          )
          .filter((part?: Dynamic): Dynamic => part !== "")
          .join(" ")
          .slice(0, 2e3);
        if (attributeValue !== "") return attributeValue;
      }
      let ariaLabel: Dynamic = element.getAttribute("aria-label");
      if (ariaLabel !== null && ariaLabel.trim() !== "")
        return ariaLabel.trim();
      if (tagName === "IMG") {
        let altText: Dynamic = element.getAttribute("alt");
        if (altText !== null) return altText.trim();
      } else
        for (
          let firstElementChild: Dynamic = element.firstElementChild;
          firstElementChild !== null;
          firstElementChild = firstElementChild.nextElementSibling
        )
          if (firstElementChild.tagName.toLowerCase() === "title")
            return (firstElementChild.textContent || "").trim();
      let titleText: Dynamic = element.getAttribute("title");
      return titleText !== null && titleText.trim() !== ""
        ? titleText.trim()
        : undefined;
    },
    classificationEntries: Dynamic = [new Map(), new Map(), new Map()],
    labelEntries: Dynamic = new Map(),
    bestIndex: Dynamic = 0,
    bestPriority: Dynamic = -1,
    classifyTextNode: Dynamic = (node?: Dynamic, isFallback?: Dynamic): Dynamic => {
      let visibleAncestor: Dynamic = getVisibleAncestor(node);
      if (visibleAncestor !== null) {
        let classEntry: Dynamic = labelEntries.get(visibleAncestor);
        classEntry === undefined &&
          ((classEntry = textSegments.length),
          textSegments.push("Artifact"),
          labelEntries.set(visibleAncestor, classEntry));
        return {
          b: classEntry,
        };
      }
      let headingInfo: Dynamic = getHeadingInfo(node),
        tableCellInfo: Dynamic = headingInfo === null ? getTableCellInfo(node) : null,
        classification: Dynamic = headingInfo !== null ? 0 : tableCellInfo !== null ? 1 : 2,
        label: Dynamic =
          headingInfo !== null
            ? headingInfo
            : tableCellInfo !== null
              ? tableCellInfo.list
              : getInlineAncestor(node),
        entry: Dynamic = classificationEntries[classification].get(label);
      entry === undefined ||
      (!isFallback &&
        (entry !== bestPriority || (tableCellInfo !== null && tableCellInfo.index < bestIndex)))
        ? ((entry = textSegments.length),
          textSegments.push(
            headingInfo !== null
              ? headingNames[getHeadingLevel(headingInfo) - 1]
              : tableCellInfo !== null
                ? "L"
                : "P",
          ),
          classificationEntries[classification].set(label, entry),
          (bestPriority = entry))
        : isFallback || (bestPriority = entry);
      tableCellInfo !== null && !isFallback && (bestIndex = tableCellInfo.index);
      return tableCellInfo !== null
        ? {
            b: entry,
            i: tableCellInfo.index,
          }
        : {
            b: entry,
          };
    },
    hasWhitespace: Dynamic = false,
    lastBlockIndex: Dynamic = -1,
    lastBlockType: Dynamic = null,
    text: Dynamic = "",
    isPunctuationBoundary: Dynamic = (leftChar?: Dynamic, rightChar?: Dynamic): Dynamic =>
      /[\p{Ps}\p{Pi}]/u.test(leftChar) ||
      /[\p{Pe}\p{Pf}\p{Po}]/u.test(rightChar),
    formControlState: Dynamic = {
      SVG: 1,
      CANVAS: 1,
      VIDEO: 1,
      AUDIO: 1,
      INPUT: 1,
      SELECT: 1,
      TEXTAREA: 1,
      BUTTON: 1,
      OBJECT: 1,
      EMBED: 1,
      HR: 1,
      METER: 1,
      PROGRESS: 1,
    },
    countVisibleRects: Dynamic = (): Dynamic => {
      let rectCount: Dynamic = 0,
        rects: Dynamic = range.getClientRects();
      for (let rectIndex: Dynamic = 0; rectIndex < rects.length; rectIndex++) {
        let rect: Dynamic = rects[rectIndex];
        rect.width > 0.01 && rect.height > 0.01 && rectCount++;
      }
      return rectCount;
    },
    getTextRanges: Dynamic = (textNode?: Dynamic): Dynamic => {
      let length: Dynamic = textNode.data.length;
      range.setStart(textNode, 0);
      range.setEnd(textNode, length);
      if (countVisibleRects() <= 1) return [[0, length]];
      let ranges: Dynamic = [],
        rangeStart: Dynamic = 0;
      for (let rangeEnd: Dynamic = 1; rangeEnd <= length; rangeEnd++) {
        range.setStart(textNode, rangeStart);
        range.setEnd(textNode, rangeEnd);
        countVisibleRects() > 1 && rangeEnd - 1 > rangeStart
          ? (ranges.push([rangeStart, rangeEnd - 1]), (rangeStart = rangeEnd - 1))
          : rangeEnd - rangeStart >= count &&
            (ranges.push([rangeStart, rangeEnd]), (rangeStart = rangeEnd));
      }
      length > rangeStart && ranges.push([rangeStart, length]);
      return ranges;
    },
    isWhitespace: Dynamic = (character?: Dynamic): Dynamic =>
      character === " " ||
      character ===
        `
` ||
      character === "	" ||
      character === "\r" ||
      character === "\f",
    captureTextNode: Dynamic = (textNode?: Dynamic): Dynamic => {
      let data: Dynamic = textNode.data;
      if (data.trim() === "") {
        data !== "" && (hasWhitespace = true);
        return;
      }
      let element: Dynamic = callback(textNode);
      if (element === null) return;
      let metrics: Dynamic = getElementMetrics(element),
        textLabel: Dynamic = getTextContent(element);
      if (!metrics.ok || !(metrics.size > 0)) {
        hasWhitespace = true;
        return;
      }
      index += data.length;
      if (index > maxTextHeight) {
        flag = true;
        if (textRuns) {
          range.setStart(textNode, 0);
          range.setEnd(textNode, data.length);
          let rects: Dynamic = range.getClientRects();
          for (let rectIndex: Dynamic = 0; rectIndex < rects.length; rectIndex++) {
            let rect: Dynamic = rects[rectIndex];
            rect.height > 0.01 &&
              textRuns.push([
                (rect.top - bounds.top) / scale,
                Math.min(
                  (rect.bottom - bounds.top) / scale,
                  getScrollOffset(element, metrics.size),
                ),
              ]);
          }
        }
        return;
      }
      let classification: Dynamic,
        textStart: Dynamic = 0;
      for (let textRange of getTextRanges(textNode) as Dynamic) {
        let rangeStart: Dynamic = textRange[0],
          rangeEnd: Dynamic = textRange[1];
        for (; rangeStart < rangeEnd && isWhitespace(data.charAt(rangeStart)); )
          rangeStart++;
        for (; rangeEnd > rangeStart && isWhitespace(data.charAt(rangeEnd - 1)); )
          rangeEnd--;
        if (rangeStart >= rangeEnd) {
          textRange[1] > textRange[0] && (hasWhitespace = true);
          continue;
        }
        rangeStart > textStart &&
          (hasWhitespace = hasWhitespace || /[ \n\t\r\f]/.test(data.slice(textStart, rangeStart)));
        let textContent: Dynamic = data.slice(rangeStart, rangeEnd);
        metrics.collapse && (textContent = textContent.replace(/[ \n\t\r\f]+/g, " "));
        metrics.tt === "uppercase"
          ? (textContent = textContent.toUpperCase())
          : metrics.tt === "lowercase"
            ? (textContent = textContent.toLowerCase())
            : metrics.tt === "capitalize" &&
              (textContent = textContent.replace(
                /(^|[^A-Za-z0-9\u00C0-\u024F'])([a-z\u00DF-\u00FF])/g,
                (
                  suffixCharacter?: Dynamic,
                  prefix?: Dynamic,
                  character?: Dynamic,
                ): Dynamic => prefix + character.toUpperCase(),
              ));
        range.setStart(textNode, rangeStart);
        range.setEnd(textNode, rangeEnd);
        let textBounds: Dynamic = range.getBoundingClientRect(),
          textX: Dynamic = (textBounds.left - bounds.left) / scale,
          textY: Dynamic = (textBounds.top - bounds.top) / scale,
          textHeight: Dynamic = textBounds.height / scale,
          textWidth: Dynamic = textBounds.width / scale;
        if (
          textBounds.width <= 0.01 ||
          textBounds.height <= 0.01 ||
          textX >= textWidthLimit ||
          textX + textWidth <= 0
        ) {
          hasWhitespace = true;
          continue;
        }
        let baselineY: Dynamic = textY + (baselineOffset || 0);
        if (baselineY < textHeightLimit && baselineY + textHeight > 0) {
          let visibleWidth: Dynamic = Math.min(textWidth, textWidthLimit - textX),
            visibleHeight: Dynamic = Math.min(metrics.size, textHeight),
            lineY: Dynamic = Math.min(
              textHeightLimit,
              Math.max(0, baselineY + textHeight / 2 + visibleHeight * lineHeightFactor),
            );
          classification === undefined && (classification = classifyTextNode(element));
          let blockType: Dynamic = getInlineMetrics(element) || getInlineAncestor(element),
            segment: Dynamic =
              classification.i === undefined
                ? {
                    t: textContent,
                    x: textX,
                    y: lineY,
                    s: visibleHeight,
                    w: visibleWidth,
                    b: classification.b,
                  }
                : {
                    t: textContent,
                    x: textX,
                    y: lineY,
                    s: visibleHeight,
                    w: visibleWidth,
                    b: classification.b,
                    i: classification.i,
                  };
          classification.b === lastBlockIndex &&
            (segment.sp =
              hasWhitespace ||
              (blockType !== lastBlockType && !isPunctuationBoundary(text, textContent.charAt(0))));
          textLabel !== undefined && (segment.a = textLabel);
          items.push(segment);
          textSegments[classification.b] === "Artifact"
            ? (hasWhitespace = true)
            : ((hasWhitespace = false),
              (lastBlockIndex = classification.b),
              (lastBlockType = blockType),
              (text = textContent.charAt(textContent.length - 1)));
        } else hasWhitespace = true;
        textStart = rangeEnd;
        textRuns &&
          textY < textHeightLimit &&
          textY + textHeight > 0 &&
          textRuns.push([
            textY,
            Math.min(textY + textHeight, getScrollOffset(element, metrics.size)),
          ]);
      }
      textStart > 0 && textStart < data.length && (hasWhitespace = true);
    },
    captureElementText: Dynamic = (
      element?: Dynamic,
      tagName?: Dynamic,
    ): Dynamic => {
      let attribute: Dynamic = element.getAttribute("role"),
        parent: Dynamic = element === root ? null : callback(element);
      if (
        attribute === "presentation" ||
        attribute === "none" ||
        element.getAttribute("aria-hidden") === "true" ||
        (parent !== null && getVisibleAncestor(parent) !== null) ||
        !getElementMetrics(element).ok
      )
        return;
      let accessibleLabel: Dynamic = getAccessibleLabel(element, tagName);
      if (accessibleLabel === "") return;
      let elementBounds: Dynamic = element.getBoundingClientRect(),
        elementX: Dynamic = (elementBounds.left - bounds.left) / scale,
        elementY: Dynamic =
          (elementBounds.top - bounds.top) / scale + (baselineOffset || 0),
        elementWidth: Dynamic = elementBounds.width / scale,
        elementHeight: Dynamic = elementBounds.height / scale;
      if (
        elementWidth <= 0.01 ||
        elementHeight <= 0.01 ||
        elementX >= textWidthLimit ||
        elementX + elementWidth <= 0 ||
        elementY >= textHeightLimit ||
        elementY + elementHeight <= 0
      )
        return;
      parent !== null &&
        (getHeadingInfo(parent) !== null || getTableCellInfo(parent) !== null) &&
        classifyTextNode(parent, true);
      let textSegment: Dynamic =
          accessibleLabel === undefined
            ? {
                r: "Figure",
                x: elementX,
                y: elementY,
                w: elementWidth,
                h: elementHeight,
              }
            : {
                r: "Figure",
                a: accessibleLabel,
                x: elementX,
                y: elementY,
                w: elementWidth,
                h: elementHeight,
              },
        elementText: Dynamic = getTextContent(element);
      elementText !== undefined && (textSegment.l = elementText);
      textSegments.push(textSegment);
    },
    cloneAndCapture: Dynamic = (node?: Dynamic): Dynamic => {
      if (flag && !textRuns) return;
      if (node.nodeType === 3) {
        captureTextNode(node);
        return;
      }
      if (node.nodeType !== 1) return;
      let element: Dynamic = node,
        tagName: Dynamic = element.tagName.toUpperCase();
      if (
        state[tagName] === 1 ||
        element.hasAttribute("data-omelette-chrome") ||
        element.hasAttribute("data-noncommentable") ||
        element.hasAttribute("data-dc-editor-overlay") ||
        (element !== root && getElementMetrics(element).none)
      )
        return;
      if (tagName === "BR") {
        hasWhitespace = true;
        return;
      }
      let childText: Dynamic =
        element !== root &&
        (!getElementMetrics(element).inline || formControlState[tagName] === 1);
      childText && (hasWhitespace = true);
      getHeadingInfo(element);
      getListParent(element);
      getTableCellInfo(element);
      getInlineAncestor(element);
      getInlineMetrics(element);
      getTextContent(element);
      if (
        (tagName === "IMG" || element.getAttribute("role") === "img") &&
        (captureElementText(element, tagName), (hasWhitespace = true), tagName === "IMG")
      )
        return;
      getVisibleAncestor(element);
      let assignedNodes: Dynamic;
      if (element.shadowRoot) assignedNodes = element.shadowRoot.childNodes;
      else if (tagName === "SLOT") {
        let assignedContent: Dynamic = element.assignedNodes({
          flatten: true,
        });
        assignedNodes = assignedContent.length ? assignedContent : element.childNodes;
      } else assignedNodes = element.childNodes;
      for (let nodeIndex: Dynamic = 0; nodeIndex < assignedNodes.length; nodeIndex++) {
        let assignedNode: Dynamic = assignedNodes[nodeIndex];
        assignedNode && cloneAndCapture(assignedNode);
      }
      childText && (hasWhitespace = true);
    };
  cloneAndCapture(root);
  return {
    runs: items,
    truncated: flag,
    blocks: textSegments,
  };
}
export {
  captureReadableText,
};
export function installExportCaptureText(): () => void {
  return () => {};
}
