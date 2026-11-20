/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var caseFoldSlowPathPattern: Dynamic;
var caseFoldReplacementPattern: Dynamic;
var replaceCaseFoldCharacter: Dynamic;
var findBlockBoundaryTags: Dynamic;
var findExcludedTags: Dynamic;
var findMaxTextRunLength: Dynamic;
var findMaxVisitedNodes: Dynamic;
var findCollapsibleWhitespacePattern: Dynamic;
function foldFindText(text?: Dynamic): Dynamic {
  let value: Dynamic = text.toLowerCase();
  if (value.length === text.length && !caseFoldSlowPathPattern.test(text))
    return value.replace(
      caseFoldReplacementPattern,
      replaceCaseFoldCharacter,
    );
  let foldedText: Dynamic = "";
  for (let index: Dynamic = 0; index < text.length; index++) {
    let foldedCharacter: Dynamic = text[index].toLowerCase();
    foldedText += foldedCharacter.length === 1 ? foldedCharacter : text[index];
  }
  return foldedText.replace(caseFoldReplacementPattern, replaceCaseFoldCharacter);
}
function findTextOffsets(text?: Dynamic, query?: Dynamic): Dynamic {
  if (query === "") return [];
  let value: Dynamic = foldFindText(text),
    foldedQuery: Dynamic = foldFindText(query),
    items: Dynamic = [];
  for (
    let matchOffset: Dynamic = value.indexOf(foldedQuery);
    matchOffset !== -1;
    matchOffset = value.indexOf(foldedQuery, matchOffset + foldedQuery.length)
  )
    items.push(matchOffset);
  return items;
}
function collapseFindWhitespace(text?: Dynamic): Dynamic {
  return text.replace(findCollapsibleWhitespacePattern, " ");
}
function findWhitespaceCollapseMode(
  whiteSpace?: Dynamic,
  element?: Dynamic,
): Dynamic {
  return whiteSpace === "pre-line"
    ? "keep-newlines"
    : whiteSpace === "normal" ||
        whiteSpace === "nowrap" ||
        (whiteSpace === "" && element.closest("pre, textarea") === null)
      ? "all"
      : "none";
}
function isFindBlockBoundary(element?: Dynamic, display?: Dynamic): Dynamic {
  return element.tagName === "BR"
    ? true
    : display === ""
      ? findBlockBoundaryTags.has(element.tagName)
      : display !== "inline" &&
        display !== "contents" &&
        display !== "inline-block" &&
        display !== "inline-flex";
}
function isElementPermanentlyTransparent(element?: Dynamic): Dynamic {
  let defaultView: Dynamic = element.ownerDocument.defaultView,
    flag: Dynamic = false;
  for (
    let value: Dynamic = element;
    value !== null;
    value = value.parentElement
  ) {
    if (parseFloat(defaultView?.getComputedStyle(value).opacity ?? "") !== 0)
      continue;
    if (
      !(value.getAnimations?.() ?? []).some(
        (animation?: Dynamic): Dynamic =>
          animation.playState === "running" &&
          animation.effect
            ?.getKeyframes?.()
            .some((child?: Dynamic): Dynamic => "opacity" in child) ===
            true,
      )
    )
      return false;
    flag = true;
  }
  return flag;
}
function isFindElementVisible(element?: Dynamic, style?: Dynamic): Dynamic {
  let value: Dynamic = style?.visibility ?? "";
  if (value !== "" && value !== "visible") return false;
  let currentElement: Dynamic = element;
  for (
    ;
    currentElement !== null &&
    (currentElement === element
      ? style?.display
      : currentElement.ownerDocument.defaultView?.getComputedStyle(currentElement)
          .display) === "contents";

  )
    currentElement = currentElement.parentElement;
  let visibilityCheck: Dynamic = currentElement?.checkVisibility;
  return currentElement === null ||
    typeof visibilityCheck != "function" ||
    visibilityCheck.call(currentElement, {
      opacityProperty: true,
      checkOpacity: true,
    })
    ? true
    : visibilityCheck.call(currentElement, {}) && isElementPermanentlyTransparent(currentElement);
}
function visitRenderedTextRuns(
  element?: Dynamic,
  skip?: Dynamic,
  visit?: Dynamic,
): Dynamic {
  let defaultView: Dynamic = element.ownerDocument.defaultView,
    items: Dynamic = [],
    state: Dynamic = {
      text: "",
      nodes: [],
      nodeAt: [],
      offsetAt: [],
      collapses: false,
    },
    text: Dynamic = "",
    index: Dynamic = 0,
    value: Dynamic = findMaxVisitedNodes,
    flag: Dynamic = true,
    callback: Dynamic = (): Dynamic => {
      state.collapses &&
        text === " " &&
        (items.pop(), state.nodeAt.pop(), state.offsetAt.pop());
      items.length > 0 &&
        flag &&
        ((state.text = items.join("")), (flag = visit(state)));
      items = [];
      state = {
        text: "",
        nodes: [],
        nodeAt: [],
        offsetAt: [],
        collapses: false,
      };
      text = "";
    },
    visitTextNode: Dynamic = (node?: Dynamic, collapseMode?: Dynamic): Dynamic => {
      let data: Dynamic = node.data,
        nodeIndex: Dynamic = state.nodes.push(node) - 1;
      collapseMode !== "none" && (state.collapses = true);
      for (
        let characterIndex: Dynamic = 0;
        characterIndex < data.length && value > 0;
        characterIndex++, value--
      ) {
        let character: Dynamic = data[characterIndex];
        if (
          collapseMode !== "none" &&
          (character === " " ||
            character === "	" ||
            character === "\r" ||
            character === "\f" ||
            character === "\xA0" ||
            character === "\u2007" ||
            character === "\u202F" ||
            (character ===
              `
` &&
              collapseMode === "all"))
        ) {
          if (
            text === "" ||
            text === " " ||
            text ===
              `
`
          )
            continue;
          character = " ";
        }
        items.push(character);
        state.nodeAt.push(nodeIndex);
        state.offsetAt.push(characterIndex);
        text = character;
      }
    },
    visitElement: Dynamic = (elementNode?: Dynamic): Dynamic => {
      if (
        !flag ||
        findExcludedTags.has(elementNode.tagName.toUpperCase()) ||
        skip?.(elementNode) === true
      )
        return;
      let computedStyle: Dynamic = defaultView?.getComputedStyle(elementNode),
        displayMode: Dynamic = computedStyle?.display ?? "";
      if (displayMode === "none") return;
      let isBlockBoundary: Dynamic =
        elementNode !== element && isFindBlockBoundary(elementNode, displayMode);
      isBlockBoundary && callback();
      let collapseWhitespace: Dynamic,
        textCollapseMode: Dynamic = "none";
      for (
        let firstChild: Dynamic = elementNode.firstChild;
        firstChild !== null && flag;
        firstChild = firstChild.nextSibling
      ) {
        if (++index > findMaxTextRunLength) {
          flag = false;
          return;
        }
        firstChild.nodeType === 3
          ? (collapseWhitespace === undefined &&
              ((collapseWhitespace = isFindElementVisible(elementNode, computedStyle)),
              (textCollapseMode = collapseWhitespace
                ? findWhitespaceCollapseMode(computedStyle?.whiteSpace ?? "", elementNode)
                : "none")),
            collapseWhitespace && visitTextNode(firstChild, textCollapseMode))
          : firstChild.nodeType === 1 && visitElement(firstChild);
      }
      isBlockBoundary && callback();
    };
  visitElement(element);
  callback();
}
function findRenderedTextRanges(
  element?: Dynamic,
  query?: Dynamic,
  rangeOptions: Dynamic = {},
): Dynamic {
  let items: Dynamic = [],
    value: Dynamic = rangeOptions.limit ?? 1 / 0,
    StaticRangeConstructor: Dynamic = element.ownerDocument.defaultView?.StaticRange,
    collapsedQuery: Dynamic = collapseFindWhitespace(query);
  visitRenderedTextRuns(element, rangeOptions.skip, (textRun?: Dynamic): Dynamic => {
    let effectiveQuery: Dynamic = textRun.collapses ? collapsedQuery : query;
    for (let startOffset of findTextOffsets(textRun.text, effectiveQuery) as Dynamic) {
      if (items.length >= value) return false;
      let endOffset: Dynamic = startOffset + effectiveQuery.length - 1,
        state: Dynamic = {
          node: textRun.nodes[textRun.nodeAt[startOffset]],
          offset: textRun.offsetAt[startOffset],
        },
        endPosition: Dynamic = {
          node: textRun.nodes[textRun.nodeAt[endOffset]],
          offset: textRun.offsetAt[endOffset] + 1,
        };
      if (typeof StaticRangeConstructor == "function") {
        items.push(
          new StaticRangeConstructor({
            startContainer: state.node,
            startOffset: state.offset,
            endContainer: endPosition.node,
            endOffset: endPosition.offset,
          }),
        );
        continue;
      }
      let range: Dynamic = element.ownerDocument.createRange();
      range.setStart(state.node, state.offset);
      range.setEnd(endPosition.node, endPosition.offset);
      items.push(range);
    }
    return true;
  });
  return items;
}
function liveRangeFromStaticRange(range?: Dynamic): Dynamic {
  let ownerDocument: Dynamic = range.startContainer.ownerDocument;
  if (
    !ownerDocument ||
    !range.startContainer.isConnected ||
    !range.endContainer.isConnected
  )
    return null;
  let value: Dynamic = ownerDocument.createRange();
  value.setStart(range.startContainer, range.startOffset);
  value.setEnd(range.endContainer, range.endOffset);
  return value;
}
function safeRangeClientRect(range?: Dynamic): Dynamic {
  try {
    return liveRangeFromStaticRange(range)?.getBoundingClientRect() ?? null;
  } catch {
    return null;
  }
}
export {
  caseFoldReplacementPattern,
  caseFoldSlowPathPattern,
  collapseFindWhitespace,
  findBlockBoundaryTags,
  findCollapsibleWhitespacePattern,
  findExcludedTags,
  findMaxTextRunLength,
  findMaxVisitedNodes,
  findRenderedTextRanges,
  findTextOffsets,
  findWhitespaceCollapseMode,
  foldFindText,
  isElementPermanentlyTransparent,
  isFindBlockBoundary,
  isFindElementVisible,
  liveRangeFromStaticRange,
  replaceCaseFoldCharacter,
  safeRangeClientRect,
  visitRenderedTextRuns,
};
export function installFindTextRanges(): () => void {
  return () => {
    caseFoldSlowPathPattern = /[\u03a3\ud800-\udfff]/;
    caseFoldReplacementPattern = /[\u00a0\u2007\u202f\u03c2]/g;
    replaceCaseFoldCharacter = (character?: Dynamic): Dynamic =>
      character === "\u03C2" ? "\u03C3" : " ";
    findBlockBoundaryTags = new Set([
      "ADDRESS",
      "ARTICLE",
      "ASIDE",
      "BLOCKQUOTE",
      "DD",
      "DIV",
      "DL",
      "DT",
      "FIGCAPTION",
      "FIGURE",
      "FOOTER",
      "H1",
      "H2",
      "H3",
      "H4",
      "H5",
      "H6",
      "HEADER",
      "HR",
      "LI",
      "MAIN",
      "NAV",
      "OL",
      "P",
      "PRE",
      "SECTION",
      "TABLE",
      "TBODY",
      "TD",
      "TFOOT",
      "TH",
      "THEAD",
      "TR",
      "UL",
    ]);
    findExcludedTags = new Set([
      "SCRIPT",
      "STYLE",
      "TEMPLATE",
      "NOSCRIPT",
      "TEXTAREA",
      "IFRAME",
    ]);
    findMaxTextRunLength = 2e5;
    findMaxVisitedNodes = 2e6;
    findCollapsibleWhitespacePattern = /[ \t\n\r\f\u00a0\u2007\u202f]+/g;
  };
}
