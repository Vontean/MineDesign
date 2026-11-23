/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { FAST_EDIT_ARTBOARD_ID_PATTERN } from "./artboard-operations";
import { closeHistoryTurn, createFastEditHistory, MAX_LISTED_HISTORY_TURN_IDS, summarizeTurnIds } from "./history";
import { SAFE_PROMPT_HTML_TAGS, truncateLargeDataUris } from "./prompt-context";
import { splitStyleDeclarations } from "./template-validation";
import { sanitizeUntrustedText } from "./untrusted-content";

var MAX_JOURNAL_CHANGE_LINES: Dynamic;
var MAX_JOURNAL_TEXT_CHARS: Dynamic;
var MAX_JOURNAL_ATTRIBUTE_CHARS: Dynamic;
var MAX_JOURNAL_ELEMENT_LABEL_CHARS: Dynamic;
var MAX_JOURNAL_DIFF_CHARS: Dynamic;
var MAX_JOURNAL_LINE_CHARS: Dynamic;
var NEW_ARTBOARD_JOURNAL_LABEL: Dynamic;
var REMOVED_ARTBOARD_JOURNAL_LABEL: Dynamic;
var UNTRUSTED_TEXT_PATTERN: Dynamic;
var sanitizeJournalText: Dynamic;
var normalizeJournalWhitespace: Dynamic;
var normalizeJournalText: Dynamic;
var truncateJournalText: Dynamic;
var journalUtf8Size: Dynamic;
var immediateElementText: Dynamic;
var normalizeJournalTagName: Dynamic;
var describeJournalElement: Dynamic;
var MAX_DECORATIVE_ELEMENT_COUNT: Dynamic;
var NON_DECORATIVE_ELEMENT_SELECTOR: Dynamic;
var hasBackgroundImage: Dynamic;
var relativeElementIndexPath: Dynamic;
var hashElementStructure: Dynamic;
var hashHtmlStructure: Dynamic;
var equalElementAttributes: Dynamic;
var journalElementAttributes: Dynamic;
var MAX_REORDER_TRACKING_ITEMS: Dynamic;
var longestIncreasingSubsequenceLength: Dynamic;
var allJournalArtboards: Dynamic;
var formatJournalTime: Dynamic;
var createFastEditJournalState: Dynamic;
var MAX_FAST_EDIT_JOURNAL_ENTRIES: Dynamic;
var HISTORY_TURN_COMPLETION_MESSAGES: Dynamic;
var FAST_EDIT_TURN_STATUS_LABELS: Dynamic;
function parseJournalRoot(html?: Dynamic): Dynamic {
  let template: Dynamic = (document as Dynamic).createElement("template");
  template.innerHTML = html;
  return template.content.firstElementChild;
}
function createElementTextSummarizer(root?: Dynamic): Dynamic {
  let text: Dynamic = root.textContent ?? "";
  if (/\p{Cf}/u.test(text) || UNTRUSTED_TEXT_PATTERN.test(text)) {
    let entries: Dynamic = new Map();
    return (element?: Dynamic, maxChars?: Dynamic): Dynamic => {
      let rawText: Dynamic = element.textContent ?? "",
        entry: Dynamic = entries.get(rawText);
      entry === undefined &&
        entries.set(rawText, (entry = normalizeJournalText(rawText)));
      return truncateJournalText(entry, maxChars);
    };
  }
  return (element?: Dynamic, maxChars?: Dynamic): Dynamic => {
    let summary: Dynamic = "",
      collectText: Dynamic = (parent?: Dynamic): Dynamic => {
        for (let value of Array.from(parent.childNodes) as Dynamic) {
          if (value.nodeType === 1 && !collectText(value)) return false;
          if (value.nodeType !== 3 && value.nodeType !== 4) continue;
          let nodeText: Dynamic = value.textContent ?? "";
          for (let index: Dynamic = 0; index < nodeText.length; index += 1024)
            if (
              ((summary = normalizeJournalWhitespace(
                summary + nodeText.slice(index, index + 1024),
              ).trimStart()),
              summary.trimEnd().length > maxChars)
            )
              return false;
        }
        return true;
      };
    collectText(element);
    return truncateJournalText(summary.trimEnd(), maxChars);
  };
}
function isDecorativeElement(element?: Dynamic): Dynamic {
  let descendantCount: Dynamic = element.querySelectorAll("*").length;
  return descendantCount === 0 ||
    element.parentElement?.parentElement == null ||
    /^sc-(?!raw-)/.test(element.localName) ||
    element.querySelector(NON_DECORATIVE_ELEMENT_SELECTOR) !== null ||
    hasBackgroundImage(element) ||
    Array.from(element.querySelectorAll("[style]")).some(hasBackgroundImage)
    ? false
    : element.localName === "svg" ||
        ((element.textContent ?? "").trim() === "" &&
          descendantCount <= MAX_DECORATIVE_ELEMENT_COUNT);
}
function parseJournalStyle(style?: Dynamic): Dynamic {
  let properties: Dynamic = new Map();
  for (let value of splitStyleDeclarations(
    style ?? "",
  ) as Dynamic) {
    let colonIndex: Dynamic = value.indexOf(":");
    if (colonIndex > 0) {
      let property: Dynamic = value.slice(0, colonIndex).trim().toLowerCase();
      properties.delete(property);
      properties.set(property, normalizeJournalText(value.slice(colonIndex + 1)));
    }
  }
  return properties;
}
function describeStyleChanges(before?: Dynamic, after?: Dynamic): Dynamic {
  let changes: Dynamic = [];
  for (let [value, newValue] of after as Dynamic) {
    let entry: Dynamic = before.get(value);
    entry !== newValue &&
      changes.push(
        value +
          ": " +
          truncateJournalText(
            truncateLargeDataUris(newValue),
            100,
          ) +
          " (was " +
          (entry === undefined
            ? "not set"
            : truncateJournalText(
                truncateLargeDataUris(entry),
                40,
              )) +
          ")",
      );
  }
  for (let [value, oldValue] of before as Dynamic)
    after.has(value) ||
      changes.push(
        value +
          ": removed (was " +
          truncateJournalText(
            truncateLargeDataUris(oldValue),
            40,
          ) +
          ")",
      );
  return changes;
}
function matchJournalElements(
  before?: Dynamic,
  after?: Dynamic,
  elementKey?: Dynamic,
): Dynamic {
  let describe: Dynamic = (element?: Dynamic): Dynamic =>
      element.localName + "|" + elementKey(element),
    beforeKeys: Dynamic = before.map(describe),
    afterKeys: Dynamic = after.map(describe),
    beforeCount: Dynamic = beforeKeys.length,
    afterCount: Dynamic = afterKeys.length,
    matches: Dynamic = [];
  if (beforeCount * afterCount <= 25e4) {
    let lengths: Dynamic = Array.from(
      {
        length: beforeCount + 1,
      },
      (): Dynamic => new Array(afterCount + 1).fill(0),
    );
    for (let beforeIndex: Dynamic = beforeCount - 1; beforeIndex >= 0; beforeIndex--)
      for (let afterIndex: Dynamic = afterCount - 1; afterIndex >= 0; afterIndex--)
        lengths[beforeIndex][afterIndex] =
          beforeKeys[beforeIndex] === afterKeys[afterIndex]
            ? lengths[beforeIndex + 1][afterIndex + 1] + 1
            : Math.max(lengths[beforeIndex + 1][afterIndex], lengths[beforeIndex][afterIndex + 1]);
    for (
      let beforeIndex: Dynamic = 0, afterIndex: Dynamic = 0;
      beforeIndex < beforeCount && afterIndex < afterCount;

    )
      beforeKeys[beforeIndex] === afterKeys[afterIndex]
        ? (matches.push([beforeIndex, afterIndex]), beforeIndex++, afterIndex++)
        : lengths[beforeIndex + 1][afterIndex] >= lengths[beforeIndex][afterIndex + 1]
          ? beforeIndex++
          : afterIndex++;
  }
  let pairedIndices: Dynamic = [],
    matchUnpairedTags: Dynamic = (
      beforeStart?: Dynamic,
      beforeEnd?: Dynamic,
      afterStart?: Dynamic,
      afterEnd?: Dynamic,
    ): Dynamic => {
      let nextUnpairedAfterIndex: Dynamic = afterStart;
      for (let beforeIndex: Dynamic = beforeStart; beforeIndex < beforeEnd; beforeIndex++)
        for (let afterIndex: Dynamic = nextUnpairedAfterIndex; afterIndex < afterEnd; afterIndex++)
          if (before[beforeIndex].localName === after[afterIndex].localName) {
            pairedIndices.push([beforeIndex, afterIndex]);
            nextUnpairedAfterIndex = afterIndex + 1;
            break;
          }
    },
    nextBeforeIndex: Dynamic = 0,
    nextAfterIndex: Dynamic = 0;
  for (let [beforeIndex, afterIndex] of matches as Dynamic) {
    matchUnpairedTags(nextBeforeIndex, beforeIndex, nextAfterIndex, afterIndex);
    pairedIndices.push([beforeIndex, afterIndex]);
    nextBeforeIndex = beforeIndex + 1;
    nextAfterIndex = afterIndex + 1;
  }
  matchUnpairedTags(nextBeforeIndex, beforeCount, nextAfterIndex, afterCount);
  return pairedIndices;
}
function detectMovedJournalElements(
  indices?: Dynamic,
  priorityFor?: Dynamic,
): Dynamic {
  let subsequenceLength: Dynamic =
      longestIncreasingSubsequenceLength(indices),
    moved: Dynamic = new Set();
  if (
    subsequenceLength === indices.length ||
    indices.length > MAX_REORDER_TRACKING_ITEMS
  )
    return {
      moved: moved,
    };
  let items: Dynamic = [...indices];
  for (let candidate of [...indices].sort(
    (leftIndex?: Dynamic, rightIndex?: Dynamic): Dynamic =>
      priorityFor(leftIndex) - priorityFor(rightIndex),
  ) as Dynamic) {
    if (items.length === subsequenceLength) break;
    let remainingIndices: Dynamic = items.filter(
      (candidateIndex?: Dynamic): Dynamic => candidateIndex !== candidate,
    );
    longestIncreasingSubsequenceLength(remainingIndices) === subsequenceLength &&
      ((items = remainingIndices), moved.add(candidate));
  }
  let [value]: Dynamic = moved,
    alternateMovedIndex: Dynamic =
      moved.size !== 1
        ? undefined
        : indices.find(
            (candidate?: Dynamic): Dynamic =>
              candidate !== value &&
              priorityFor(candidate) === priorityFor(value) &&
              longestIncreasingSubsequenceLength(
                indices.filter(
                  (candidateIndex?: Dynamic): Dynamic => candidateIndex !== candidate,
                ),
              ) === subsequenceLength,
          );
  return {
    moved: moved,
    ...(alternateMovedIndex !== undefined
      ? {
          other: alternateMovedIndex,
        }
      : {}),
  };
}
function describeArtboardHtmlChanges(
  beforeHtml?: Dynamic,
  afterHtml?: Dynamic,
  generatedIdPrefix?: Dynamic,
  limits?: Dynamic,
): Dynamic {
  if (beforeHtml === afterHtml) return [];
  let beforeRoot: Dynamic = parseJournalRoot(beforeHtml),
    afterRoot: Dynamic = parseJournalRoot(afterHtml);
  if (beforeRoot === null || afterRoot === null)
    return ["the artboard changed"];
  let generatedIdPattern: Dynamic =
      generatedIdPrefix !== undefined && /^[a-z]{1,8}$/.test(generatedIdPrefix)
        ? new RegExp("^" + generatedIdPrefix + "\\d{1,6}$")
        : null,
    buildStableIdMap: Dynamic = (
      root?: Dynamic,
      taggedHtml?: Dynamic,
      idPattern?: Dynamic,
    ): Dynamic => {
      let taggedRoot: Dynamic = parseJournalRoot(taggedHtml),
        elements: Dynamic = Array.from(root.querySelectorAll("*")),
        taggedElements: Dynamic =
          taggedRoot === null ? [] : Array.from(taggedRoot.querySelectorAll("*"));
      return taggedRoot === null ||
        elements.length !== taggedElements.length ||
        elements.some(
          (element?: Dynamic, elementIndex?: Dynamic): Dynamic =>
            element.localName !== taggedElements[elementIndex].localName,
        ) ||
        normalizeJournalWhitespace(root.textContent ?? "") !==
          normalizeJournalWhitespace(taggedRoot.textContent ?? "")
        ? null
        : new Map(
            elements.flatMap(
              (element?: Dynamic, elementIndex?: Dynamic): Dynamic => {
                let taggedId: Dynamic =
                  taggedElements[elementIndex].getAttribute("id") ?? "";
                return idPattern.test(taggedId) ? [[element, taggedId]] : [];
              },
            ),
          );
    },
    stableIdPattern: Dynamic =
      limits !== undefined && /^[a-z]{1,8}$/.test(limits.prefix)
        ? new RegExp("^" + limits.prefix + "\\d{1,6}$")
        : null,
    beforeIds: Dynamic =
      stableIdPattern === null ? null : buildStableIdMap(beforeRoot, limits.before, stableIdPattern),
    afterIds: Dynamic =
      stableIdPattern === null ? null : buildStableIdMap(afterRoot, limits.after, stableIdPattern),
    entries: Dynamic = new Map(
      (limits?.acted ?? [])
        .map(
          (action?: Dynamic, actionIndex?: Dynamic): Dynamic => [action, actionIndex],
        )
        .reverse(),
    ),
    hasStableIds: Dynamic = beforeIds !== null && afterIds !== null,
    beforeElementsById: Dynamic = new Map(
      hasStableIds
        ? Array.from(
            beforeIds,
            ([element, stableId]: Dynamic): Dynamic => [stableId, element],
          )
        : [],
    ),
    afterElementsById: Dynamic = new Map(
      hasStableIds
        ? Array.from(
            afterIds,
            ([element, stableId]: Dynamic): Dynamic => [stableId, element],
          )
        : [],
    ),
    items: Dynamic = [],
    appendChangeLine: Dynamic = (formatLine?: Dynamic): Dynamic => {
      items.push(
        items.length < MAX_JOURNAL_CHANGE_LINES
          ? truncateJournalText(formatLine(), MAX_JOURNAL_ATTRIBUTE_CHARS)
          : "",
      );
    },
    immediateTextCache: Dynamic = new Map(),
    getImmediateText: Dynamic = (element?: Dynamic): Dynamic => {
      let entry: Dynamic = immediateTextCache.get(element);
      entry === undefined &&
        immediateTextCache.set(element, (entry = immediateElementText(element)));
      return entry;
    },
    summarizeBeforeText: Dynamic = createElementTextSummarizer(beforeRoot),
    summarizeAfterText: Dynamic = createElementTextSummarizer(afterRoot),
    describeElement: Dynamic = (
      summarizeText?: Dynamic,
      element?: Dynamic,
      qualifier?: Dynamic,
    ): Dynamic =>
      describeJournalElement(
        element.localName,
        summarizeText(element, MAX_JOURNAL_ELEMENT_LABEL_CHARS),
        qualifier,
      ) +
      (summarizeText === summarizeAfterText &&
      summarizeAfterText(element, 1) === "" &&
      element !== afterRoot
        ? " @" + relativeElementIndexPath(element, afterRoot)
        : ""),
    describeAddedElement: Dynamic = (addedElement?: Dynamic): Dynamic => {
      let length: Dynamic = addedElement.querySelectorAll("*").length;
      return isDecorativeElement(addedElement)
        ? "drawing @" +
            relativeElementIndexPath(addedElement, afterRoot) +
            " (" +
            String(length) +
            (length === 1 ? " part)" : " parts)")
        : describeElement(summarizeAfterText, addedElement, "");
    },
    compareElements: Dynamic = (
      beforeElement?: Dynamic,
      afterElement?: Dynamic,
      isArtboardRoot?: Dynamic,
    ): Dynamic => {
      let beforeText: Dynamic = getImmediateText(beforeElement),
        afterText: Dynamic = getImmediateText(afterElement),
        elementChanges: Dynamic = equalElementAttributes(beforeElement, afterElement)
          ? []
          : [
              ...describeStyleChanges(
                parseJournalStyle(beforeElement.getAttribute("style")),
                parseJournalStyle(afterElement.getAttribute("style")),
              ),
              ...describeStyleChanges(
                journalElementAttributes(beforeElement, generatedIdPattern),
                journalElementAttributes(afterElement, generatedIdPattern),
              ),
            ].map(
              (change?: Dynamic): Dynamic =>
                truncateJournalText(change, MAX_JOURNAL_ATTRIBUTE_CHARS),
            );
      beforeText !== afterText &&
        elementChanges.push(
          truncateJournalText(
            "text: " +
              (afterText === ""
                ? "removed"
                : '"' +
                  truncateJournalText(
                    afterText,
                    MAX_JOURNAL_ELEMENT_LABEL_CHARS,
                  ) +
                  '"') +
              ' (was "' +
              truncateJournalText(beforeText, MAX_JOURNAL_DIFF_CHARS) +
              '")',
            MAX_JOURNAL_LINE_CHARS,
          ),
        );
      elementChanges.length > 0 &&
        (appendChangeLine(
          (): Dynamic =>
            isArtboardRoot ? "the artboard:" : describeElement(summarizeAfterText, afterElement) + ":",
        ),
        items.push(
          ...elementChanges.map((change?: Dynamic): Dynamic => "  " + change),
        ));
      let beforeChildren: Dynamic = Array.from(beforeElement.children),
        afterChildren: Dynamic = Array.from(afterElement.children);
      if (beforeChildren.length === 0 && afterChildren.length === 0) return;
      let hasStableChildIds: Dynamic =
          hasStableIds &&
          beforeChildren.every((child?: Dynamic): Dynamic => beforeIds.has(child)) &&
          afterChildren.every((child?: Dynamic): Dynamic => afterIds.has(child)),
        afterIndexById: Dynamic = new Map(
          hasStableChildIds
            ? afterChildren.map(
                (child?: Dynamic, childIndex?: Dynamic): Dynamic => [
                  afterIds.get(child),
                  childIndex,
                ],
              )
            : [],
        ),
        childPairs: Dynamic = hasStableChildIds
          ? beforeChildren.flatMap(
              (child?: Dynamic, beforeIndex?: Dynamic): Dynamic => {
                let entry: Dynamic = afterIndexById.get(beforeIds.get(child));
                return entry === undefined ? [] : [[beforeIndex, entry]];
              },
            )
          : matchJournalElements(beforeChildren, afterChildren, getImmediateText).filter(
              ([beforeIndex, afterIndex]: Dynamic): Dynamic => {
                let beforeId: Dynamic = beforeIds?.get(beforeChildren[beforeIndex]),
                  afterId: Dynamic = afterIds?.get(afterChildren[afterIndex]);
                return (
                  beforeId === undefined ||
                  afterId === undefined ||
                  beforeId === afterId
                );
              },
            );
      if (!hasStableChildIds) {
        let pairedBeforeIndices: Dynamic = new Set(
            childPairs.map((pair?: Dynamic): Dynamic => pair[0]),
          ),
          pairedAfterIndices: Dynamic = new Set(
            childPairs.map((pair?: Dynamic): Dynamic => pair[1]),
          ),
          unmatchedBeforeByHtml: Dynamic = new Map();
        for (
          let beforeIndex: Dynamic = beforeChildren.length - 1;
          beforeIndex >= 0;
          beforeIndex--
        )
          if (!pairedBeforeIndices.has(beforeIndex)) {
            let outerHTML: Dynamic = beforeChildren[beforeIndex].outerHTML,
              entry: Dynamic = unmatchedBeforeByHtml.get(outerHTML);
            entry === undefined
              ? unmatchedBeforeByHtml.set(outerHTML, [beforeIndex])
              : entry.push(beforeIndex);
          }
        unmatchedBeforeByHtml.size > 0 &&
          afterChildren.forEach((child?: Dynamic, afterIndex?: Dynamic): Dynamic => {
            let beforeIndex: Dynamic = pairedAfterIndices.has(afterIndex)
              ? undefined
              : unmatchedBeforeByHtml.get(child.outerHTML)?.pop();
            beforeIndex !== undefined && childPairs.push([beforeIndex, afterIndex]);
          });
        childPairs.sort(
          (leftPair?: Dynamic, rightPair?: Dynamic): Dynamic =>
            leftPair[0] - rightPair[0],
        );
      }
      let getMovePriority: Dynamic = (afterIndex?: Dynamic): Dynamic =>
          (hasStableChildIds ? entries.get(afterIds.get(afterChildren[afterIndex])) : undefined) ??
          1 / 0,
        { moved: movedChildIndices, other: alternateMovedIndex }: Dynamic =
          detectMovedJournalElements(
            childPairs.map((pair?: Dynamic): Dynamic => pair[1]),
            getMovePriority,
          ),
        values: Dynamic = new Set(
          childPairs.map((pair?: Dynamic): Dynamic => pair[0]),
        ),
        beforeIndexByAfterIndex: Dynamic = new Map(
          childPairs.map((pair?: Dynamic): Dynamic => [pair[1], pair[0]]),
        ),
        describePosition: Dynamic = (afterIndex?: Dynamic): Dynamic => {
          let previousChild: Dynamic = afterChildren[afterIndex - 1],
            nextChild: Dynamic = afterChildren[afterIndex + 1];
          return previousChild !== undefined
            ? " after " + describeElement(summarizeAfterText, previousChild)
            : nextChild !== undefined
              ? " before " + describeElement(summarizeAfterText, nextChild)
              : isArtboardRoot
                ? " in the artboard"
                : " in " + describeElement(summarizeAfterText, afterElement);
        };
      beforeChildren.forEach((child?: Dynamic, beforeIndex?: Dynamic): Dynamic => {
        !values.has(beforeIndex) &&
          !(hasStableIds && afterElementsById.has(beforeIds.get(child) ?? "")) &&
          appendChangeLine((): Dynamic => "removed " + describeElement(summarizeBeforeText, child));
      });
      afterChildren.forEach((child?: Dynamic, afterIndex?: Dynamic): Dynamic => {
        let entry: Dynamic = beforeIndexByAfterIndex.get(afterIndex),
          previousChild: Dynamic =
            entry !== undefined
              ? beforeChildren[entry]
              : hasStableIds
                ? beforeElementsById.get(afterIds.get(child) ?? "")
                : undefined;
        if (previousChild === undefined)
          return appendChangeLine(
            (): Dynamic => "new " + describeAddedElement(child) + describePosition(afterIndex),
          );
        (entry === undefined || movedChildIndices.has(afterIndex)) &&
          appendChangeLine(
            (): Dynamic =>
              entry !== undefined && alternateMovedIndex !== undefined
                ? describeElement(summarizeAfterText, child) +
                  " and " +
                  describeElement(summarizeAfterText, afterChildren[alternateMovedIndex]) +
                  " changed places"
                : "moved " + describeElement(summarizeAfterText, child) + describePosition(afterIndex),
          );
        compareElements(previousChild, child, false);
      });
    };
  compareElements(beforeRoot, afterRoot, true);
  if (items.length === 0) return ["the artboard changed"];
  let visibleChanges: Dynamic = items.slice(0, MAX_JOURNAL_CHANGE_LINES);
  return items.length > MAX_JOURNAL_CHANGE_LINES
    ? [
        ...visibleChanges,
        "and " + String(items.length - MAX_JOURNAL_CHANGE_LINES) + " more",
      ]
    : visibleChanges;
}
function classifyJournalChangeSource(
  before?: Dynamic,
  expected?: Dynamic,
  after?: Dynamic,
  other?: Dynamic,
): Dynamic {
  return before === undefined || before === after
    ? "nothing"
    : expected !== undefined && expected === after
      ? "undone"
      : other
        ? "other"
        : "hand";
}
function normalizeJournalChanges(changes?: Dynamic): Dynamic {
  let result: Dynamic = [],
    remainingChars: Dynamic = 1e3;
  for (let value of changes
    .slice(0, MAX_JOURNAL_CHANGE_LINES + 1)
    .map(
      (change?: Dynamic): Dynamic =>
        (change.startsWith("  ") ? "  " : "") +
        truncateJournalText(
          normalizeJournalText(change),
          MAX_JOURNAL_LINE_CHARS,
        ),
    )
    .filter((change?: Dynamic): Dynamic => change.trim() !== "") as Dynamic) {
    if ((remainingChars -= journalUtf8Size(value)) < 0) {
      result.push("and more");
      break;
    }
    result.push(value);
  }
  return result;
}
function appendTurnJournalEntry(
  journal?: Dynamic,
  entry?: Dynamic,
  now: Dynamic = new Date(),
): Dynamic {
  let otherBoards: Dynamic =
    entry.end !== "done"
      ? []
      : (entry.also ?? [])
          .map(
            (board?: Dynamic): Dynamic => ({
              ...board,
              changes: normalizeJournalChanges(board.changes),
            }),
          )
          .filter((board?: Dynamic): Dynamic => board.changes.length > 0);
  journal.push({
    ...(entry.shape !== undefined
      ? {
          shape: entry.shape,
        }
      : {}),
    ...(otherBoards.length > 0
      ? {
          also: otherBoards,
        }
      : {}),
    kind: "comment",
    at: formatJournalTime(now),
    file: entry.file,
    changes:
      entry.end === "done" ? normalizeJournalChanges(entry.changes) : [],
  });
}
function appendExternalJournalEntry(
  journal?: Dynamic,
  entry?: Dynamic,
  now: Dynamic = new Date(),
): Dynamic {
  let otherBoards: Dynamic = (entry.also ?? []).map(
    (board?: Dynamic): Dynamic => ({
      ...board,
      changes:
        entry.who === "undone" ? [] : normalizeJournalChanges(board.changes),
    }),
  );
  journal.push({
    ...(entry.shape !== undefined
      ? {
          shape: entry.shape,
        }
      : {}),
    ...(otherBoards.length > 0
      ? {
          also: otherBoards,
        }
      : {}),
    ...(entry.opened === true
      ? {
          opened: true,
        }
      : {}),
    kind: "between",
    at: formatJournalTime(now),
    file: entry.file,
    who: entry.who,
    changes:
      entry.who === "undone" ? [] : normalizeJournalChanges(entry.changes),
  });
}
function summarizeArtboardText(
  html?: Dynamic,
  maxWords: Dynamic = 40,
): Dynamic {
  let walk: Dynamic = (parent?: Dynamic): Dynamic => {
      for (let child of Array.from(parent.childNodes) as Dynamic) {
        let text: Dynamic =
          child.nodeType === 3
            ? normalizeJournalText(child.textContent ?? "")
            : child.nodeType === 1 &&
                !/^(?:style|script)$/.test(child.localName)
              ? walk(child)
              : "";
        if (text !== "") return text;
      }
      return "";
    },
    value: Dynamic = parseJournalRoot(html);
  return value === null ? "" : truncateJournalText(walk(value), maxWords);
}
function collectJournalChanges(
  session?: Dynamic,
  boards?: Dynamic,
  artboardExists?: Dynamic,
): Dynamic {
  let changes: Dynamic = new Map();
  if (artboardExists !== undefined) {
    let values: Dynamic = new Set(
        session.journal.flatMap(
          (source?: Dynamic): Dynamic =>
            source.kind === "between" && source.who === "undone"
              ? allJournalArtboards(source).map(
                  (board?: Dynamic): Dynamic => board.file,
                )
              : [],
        ),
      ),
      value: Dynamic = session.journal
        .filter((source?: Dynamic): Dynamic => source.kind === "comment")
        .flatMap(allJournalArtboards)
        .filter(
          (board?: Dynamic): Dynamic =>
            board.changes.length === 1 &&
            !values.has(board.file) &&
            (board.changes[0] === REMOVED_ARTBOARD_JOURNAL_LABEL
              ? artboardExists(board.file)
              : board.changes[0] === NEW_ARTBOARD_JOURNAL_LABEL &&
                !artboardExists(board.file)),
        );
    value.length > 0 &&
      changes.set("undonefalse", {
        who: "undone",
        opened: false,
        parts: value.map(
          (board?: Dynamic): Dynamic => ({
            file: board.file,
            changes: [],
          }),
        ),
      });
  }
  for (let { file: artboardPath, now: currentHtml, other: isOther } of boards as Dynamic) {
    let entry: Dynamic = session.seen.get(artboardPath),
      changeSource: Dynamic = classifyJournalChangeSource(
        entry,
        session.beforeLast.get(artboardPath),
        currentHtml,
        isOther,
      );
    if (changeSource !== "nothing") {
      let wasOpened: Dynamic = changeSource !== "undone" && session.opened.has(artboardPath),
        changeGroupKey: Dynamic = changeSource + String(wasOpened);
      changes.has(changeGroupKey) ||
        changes.set(changeGroupKey, {
          who: changeSource,
          opened: wasOpened,
          parts: [],
        });
      changes.get(changeGroupKey).parts.push({
        file: artboardPath,
        changes:
          changeSource === "undone"
            ? []
            : describeArtboardHtmlChanges(entry, currentHtml),
        shape: hashHtmlStructure(currentHtml),
      });
      session.beforeLast.delete(artboardPath);
    }
    session.opened.delete(artboardPath);
    session.seen.set(artboardPath, currentHtml);
  }
  for (let value of changes.values() as Dynamic)
    appendExternalJournalEntry(
      session.journal,
      {
        ...value.parts[0],
        who: value.who,
        opened: value.opened,
        also: value.parts.slice(1),
      },
      session.clock(),
    );
}
function finishFastEditJournalTurn(
  session?: Dynamic,
  status?: Dynamic,
  threadId?: Dynamic,
): Dynamic {
  let turn: Dynamic = session.turn;
  session.turn = null;
  turn?.open === true &&
    closeHistoryTurn(
      session.history,
      status === null ? null : HISTORY_TURN_COMPLETION_MESSAGES[status],
    );
  if (turn === null || status === null) return;
  threadId !== undefined &&
    (session.threads.delete(threadId),
    session.threads.add(threadId),
    session.threads.size > MAX_FAST_EDIT_JOURNAL_ENTRIES &&
      session.threads.delete(session.threads.values().next().value));
  let value: Dynamic =
      status === "done" || status === "left" || status === "left_changed",
    [mainBoard, ...otherBoards]: Dynamic = [turn, ...(turn.also ?? [])].map(
      (board?: Dynamic): Dynamic => {
        let hasComparableHtml: Dynamic =
          value && board.before !== undefined && board.after !== undefined;
        hasComparableHtml
          ? (session.beforeLast.set(board.file, board.before),
            session.seen.set(board.file, board.after))
          : value && board.how === "new" && board.after !== undefined
            ? session.seen.set(board.file, board.after)
            : (value || status === "unconfirmed") &&
              (session.seen.delete(board.file),
              session.beforeLast.delete(board.file));
        return {
          file: board.file,
          changes:
            board.how !== undefined
              ? [
                  board.how === "new"
                    ? NEW_ARTBOARD_JOURNAL_LABEL
                    : REMOVED_ARTBOARD_JOURNAL_LABEL,
                ]
              : hasComparableHtml
                ? describeArtboardHtmlChanges(
                    board.before,
                    board.after,
                    undefined,
                    board.ids,
                  )
                : [],
          ...(board.after !== undefined
            ? {
                shape: hashHtmlStructure(board.after),
              }
            : {}),
        };
      },
    );
  session.journal.length = 0;
  appendTurnJournalEntry(
    session.journal,
    {
      ...mainBoard,
      end: status,
      also: otherBoards,
    },
    session.clock(),
  );
}
function recordFastEditReadResult(
  session?: Dynamic,
  readResult?: Dynamic,
  readArtboardId?: Dynamic,
): Dynamic {
  let root: Dynamic = parseJournalRoot(readResult.html),
    handlePattern: Dynamic = /^[a-z]{1,8}$/.test(readResult.prefix)
      ? new RegExp("^" + readResult.prefix + "\\d{1,6}$")
      : null,
    value: Dynamic = null,
    callback: Dynamic = (elementDescription?: Dynamic): Dynamic => {
      if (root === null || handlePattern === null) return "";
      if (value === null) {
        value = new Map();
        let summarizeText: Dynamic = createElementTextSummarizer(root);
        for (let element of Array.from(
          root.querySelectorAll("*"),
        ) as Dynamic) {
          if (summarizeText(element, 1) === "") continue;
          let description: Dynamic = describeJournalElement(
            element.localName,
            summarizeText(element, MAX_JOURNAL_ELEMENT_LABEL_CHARS),
          );
          value.set(
            description,
            value.has(description) ? "" : (element.getAttribute("id") ?? ""),
          );
        }
      }
      let elementId: Dynamic = value.get(elementDescription) ?? "";
      return handlePattern.test(elementId) ? "#" + elementId : "";
    },
    rootStructureHash: Dynamic = null,
    formatArtboardHandle: Dynamic = (filePath?: Dynamic): Dynamic => {
      let artboardId: Dynamic = readArtboardId(filePath);
      return (
        "#" +
        (FAST_EDIT_ARTBOARD_ID_PATTERN.test(artboardId)
          ? artboardId
          : "artboard")
      );
    },
    summarizeArtboardHandles: Dynamic = (filePaths?: Dynamic): Dynamic => {
      let handles: Dynamic = filePaths.map(formatArtboardHandle),
        maxListedHandles: Dynamic = MAX_LISTED_HISTORY_TURN_IDS;
      for (
        ;
        maxListedHandles > 1 &&
        summarizeTurnIds(handles, maxListedHandles).length >
          MAX_JOURNAL_ATTRIBUTE_CHARS;

      )
        maxListedHandles -= 1;
      return summarizeTurnIds(handles, maxListedHandles);
    },
    values: Dynamic = new Set(),
    isArtboardCreationOrRemoval: Dynamic = (board?: Dynamic): Dynamic =>
      board.changes.length === 1 &&
      (board.changes[0] === NEW_ARTBOARD_JOURNAL_LABEL ||
        board.changes[0] === REMOVED_ARTBOARD_JOURNAL_LABEL),
    revertedCreationPaths: Dynamic = new Set();
  session.forEach((source?: Dynamic, sourceIndex?: Dynamic): Dynamic => {
    if (!(source.kind !== "between" || source.who !== "undone"))
      for (let board of allJournalArtboards(source) as Dynamic) {
        let earlierEntry: Dynamic = session
          .slice(0, sourceIndex)
          .reverse()
          .find(
            (entry?: Dynamic): Dynamic =>
              allJournalArtboards(entry).some(
                (earlierBoard?: Dynamic): Dynamic =>
                  earlierBoard.file === board.file &&
                  (entry.kind === "between" || earlierBoard.changes.length > 0),
              ),
          );
        earlierEntry?.kind === "comment" &&
          (values.add(earlierEntry),
          allJournalArtboards(earlierEntry).some(
            (earlierBoard?: Dynamic): Dynamic =>
              earlierBoard.file === board.file && isArtboardCreationOrRemoval(earlierBoard),
          ) && revertedCreationPaths.add(board.file));
      }
  });
  let lastEntry: Dynamic = null;
  return {
    text: session
      .map((source?: Dynamic): Dynamic => {
        if (source.kind === "between" && source.who === "undone") {
          let artboardPaths: Dynamic = allJournalArtboards(source)
            .map((board?: Dynamic): Dynamic => board.file)
            .filter(
              (filePath?: Dynamic): Dynamic =>
                filePath !== readResult.file || revertedCreationPaths.has(filePath),
            );
          return truncateJournalText(
            source.at +
              " " +
              FAST_EDIT_TURN_STATUS_LABELS.undone +
              (artboardPaths.length > 0 ? ", on " + summarizeArtboardHandles(artboardPaths) : "") +
              ": that edit was undone",
            MAX_JOURNAL_TEXT_CHARS,
          );
        }
        let formatBoardChanges: Dynamic = (board?: Dynamic): Dynamic => {
            let isCurrentArtboard: Dynamic = board.file === readResult.file,
              hasMatchingStructure: Dynamic =
                isCurrentArtboard &&
                root !== null &&
                handlePattern !== null &&
                board.shape !== undefined &&
                board.shape === (rootStructureHash ??= hashElementStructure(root)),
              elementHandleAtPath: Dynamic = (elementPath?: Dynamic): Dynamic => {
                let elementAtPath: Dynamic = hasMatchingStructure ? root : undefined;
                for (let childNumber of elementPath.split(".") as Dynamic)
                  elementAtPath = elementAtPath?.children[Number(childNumber) - 1];
                let elementId: Dynamic = elementAtPath?.getAttribute("id") ?? "";
                return hasMatchingStructure && handlePattern.test(elementId)
                  ? "#" + elementId
                  : "";
              },
              resolveElementDescription: Dynamic = (
                description?: Dynamic,
                fallbackDescription: Dynamic = description,
              ): Dynamic => {
                let pathMatch: Dynamic =
                  /^(the [a-z][a-z0-9]*|an element) @([\d.]+)$/.exec(description);
                return pathMatch !== null
                  ? elementHandleAtPath(pathMatch[2]) || pathMatch[1]
                  : (isCurrentArtboard && callback(description)) || fallbackDescription;
              },
              resolvePositionDescription: Dynamic = (changeLine?: Dynamic): Dynamic => {
                for (let positionMatch of changeLine.matchAll(
                  / (?:after|before|in) /g,
                ) as Dynamic) {
                  let positionEnd: Dynamic = positionMatch.index + positionMatch[0].length,
                    positionDescription: Dynamic = changeLine.slice(positionEnd),
                    resolvedPosition: Dynamic = resolveElementDescription(positionDescription);
                  if (resolvedPosition !== positionDescription)
                    return changeLine.slice(0, positionEnd) + resolvedPosition;
                }
                return changeLine;
              },
              formatCreatedElement: Dynamic = (changeLine?: Dynamic): Dynamic =>
                resolvePositionDescription(
                  changeLine.replace(
                    /^(new [a-z][a-z0-9]*) @([\d.]+)/,
                    (
                      _match?: Dynamic,
                      elementLabel?: Dynamic,
                      elementPath?: Dynamic,
                    ): Dynamic =>
                      elementLabel +
                      (elementHandleAtPath(elementPath) === ""
                        ? ""
                        : " " + elementHandleAtPath(elementPath)),
                  ),
                ),
              formatMovedElement: Dynamic = (changeLine?: Dynamic): Dynamic => {
                let positionMatches: Dynamic = Array.from(
                    changeLine.matchAll(/ (?:after|before|in) /g),
                  ),
                  positionMatch: Dynamic =
                    positionMatches.find((match?: Dynamic): Dynamic => {
                      let positionDescription: Dynamic = changeLine.slice(
                        match.index + match[0].length,
                      );
                      return resolveElementDescription(positionDescription) !== positionDescription;
                    }) ?? positionMatches[positionMatches.length - 1],
                  movedDescription: Dynamic = changeLine.slice(
                    6,
                    positionMatch?.index ?? changeLine.length,
                  ),
                  resolvedElement: Dynamic = resolveElementDescription(movedDescription);
                return [
                  "moved " +
                    (/ @[\d.]+$/.test(movedDescription) ? resolvedElement : movedDescription) +
                    (positionMatch === undefined
                      ? ""
                      : positionMatch[0] +
                        resolveElementDescription(
                          changeLine.slice(positionMatch.index + positionMatch[0].length),
                        )),
                  resolvedElement.startsWith("#") ? resolvedElement.slice(1) : "",
                ];
              },
              items: Dynamic = [],
              changedHandles: Dynamic = [],
              text: Dynamic = "";
            for (let changeLine of board.changes as Dynamic)
              if (changeLine.startsWith("  ")) {
                items.push(
                  text +
                    changeLine
                      .slice(2)
                      .replace(
                        ": ",
                        changeLine.startsWith("  text: ") ? " " : " \u2192 ",
                      ),
                );
                text = "";
              } else if (changeLine.endsWith(":")) {
                text = resolveElementDescription(changeLine.slice(0, -1)) + " ";
                changedHandles.push(/^#([a-z]{1,8}\d{1,6}) $/.exec(text)?.[1] ?? "");
              } else if (changeLine.startsWith("moved ")) {
                let [formattedChange, movedHandle]: Dynamic = formatMovedElement(changeLine);
                items.push(formattedChange);
                changedHandles.push(movedHandle);
                text = "";
              } else {
                items.push(
                  changeLine === NEW_ARTBOARD_JOURNAL_LABEL ||
                    changeLine === REMOVED_ARTBOARD_JOURNAL_LABEL
                    ? changeLine + " " + formatArtboardHandle(board.file)
                    : changeLine.startsWith("new ")
                      ? formatCreatedElement(changeLine)
                      : changeLine,
                );
                changedHandles.push(
                  /^new [a-z][a-z0-9]* #([a-z]{1,8}\d{1,6})(?= |$)/.exec(
                    items[items.length - 1],
                  )?.[1] ?? "",
                );
                text = "";
              }
            return {
              here: isCurrentArtboard,
              what: items,
              heads: changedHandles,
              now: resolveElementDescription,
            };
          },
          createdOrRemoved: Dynamic = [
            NEW_ARTBOARD_JOURNAL_LABEL,
            REMOVED_ARTBOARD_JOURNAL_LABEL,
          ].flatMap((changeLabel?: Dynamic): Dynamic => {
            let artboardPaths: Dynamic = allJournalArtboards(source)
              .filter(
                (changedBoard?: Dynamic): Dynamic =>
                  isArtboardCreationOrRemoval(changedBoard) && changedBoard.changes[0] === changeLabel,
              )
              .map((changedBoard?: Dynamic): Dynamic => changedBoard.file);
            return artboardPaths.length > 0
              ? [changeLabel + " " + summarizeArtboardHandles(artboardPaths)]
              : [];
          }),
          { here: isMainBoardHere, what: boardChanges }: Dynamic = formatBoardChanges(source),
          otherBoardChanges: Dynamic = allJournalArtboards(source)
            .slice(1)
            .filter((changedBoard?: Dynamic): Dynamic => !isArtboardCreationOrRemoval(changedBoard))
            .map((changedBoard?: Dynamic): Dynamic => {
              let formattedBoard: Dynamic = formatBoardChanges(changedBoard);
              return (
                (formattedBoard.here ? "" : "on " + formatArtboardHandle(changedBoard.file) + ": ") +
                formattedBoard.what.join(", ")
              );
            }),
          formattedChanges: Dynamic = [
            ...createdOrRemoved,
            ...(boardChanges.length > 0 && !isArtboardCreationOrRemoval(source)
              ? [boardChanges.join(", ")]
              : []),
            ...otherBoardChanges,
          ].join("; "),
          changedBoards: Dynamic = allJournalArtboards(source).filter(
            (changedBoard?: Dynamic): Dynamic => changedBoard.changes.length > 0,
          );
        (changedBoards.length > 0 || values.has(source)) &&
          (lastEntry = values.has(source)
            ? null
            : {
                file: changedBoards[0].file,
                handle:
                  changedBoards.length > 1 ||
                  new Set(formatBoardChanges(changedBoards[0]).heads).size !== 1
                    ? ""
                    : formatBoardChanges(changedBoards[0]).heads[0],
              });
        return source.kind === "comment" && formattedChanges === ""
          ? ""
          : truncateJournalText(
              source.at +
                " " +
                (source.kind === "comment"
                  ? "you"
                  : FAST_EDIT_TURN_STATUS_LABELS[source.who]) +
                (source.kind !== "comment" && source.opened === true
                  ? ", since the design was opened"
                  : "") +
                (isMainBoardHere ||
                isArtboardCreationOrRemoval(source) ||
                (boardChanges.length === 0 && otherBoardChanges.length + createdOrRemoved.length > 0)
                  ? ""
                  : ", on " + formatArtboardHandle(source.file)) +
                ": " +
                (formattedChanges !== "" ? formattedChanges : "the artboard changed"),
              MAX_JOURNAL_TEXT_CHARS,
            );
      })
      .filter((line?: Dynamic): Dynamic => line !== "").join(`
`),
    last: lastEntry,
  };
}
export {
  allJournalArtboards,
  appendExternalJournalEntry,
  appendTurnJournalEntry,
  classifyJournalChangeSource,
  collectJournalChanges,
  createElementTextSummarizer,
  createFastEditJournalState,
  describeArtboardHtmlChanges,
  describeJournalElement,
  describeStyleChanges,
  detectMovedJournalElements,
  equalElementAttributes,
  FAST_EDIT_TURN_STATUS_LABELS,
  finishFastEditJournalTurn,
  formatJournalTime,
  hasBackgroundImage,
  hashElementStructure,
  hashHtmlStructure,
  HISTORY_TURN_COMPLETION_MESSAGES,
  immediateElementText,
  isDecorativeElement,
  journalElementAttributes,
  journalUtf8Size,
  longestIncreasingSubsequenceLength,
  matchJournalElements,
  MAX_DECORATIVE_ELEMENT_COUNT,
  MAX_FAST_EDIT_JOURNAL_ENTRIES,
  MAX_JOURNAL_ATTRIBUTE_CHARS,
  MAX_JOURNAL_CHANGE_LINES,
  MAX_JOURNAL_DIFF_CHARS,
  MAX_JOURNAL_ELEMENT_LABEL_CHARS,
  MAX_JOURNAL_LINE_CHARS,
  MAX_JOURNAL_TEXT_CHARS,
  MAX_REORDER_TRACKING_ITEMS,
  NEW_ARTBOARD_JOURNAL_LABEL,
  NON_DECORATIVE_ELEMENT_SELECTOR,
  normalizeJournalChanges,
  normalizeJournalTagName,
  normalizeJournalText,
  normalizeJournalWhitespace,
  parseJournalRoot,
  parseJournalStyle,
  recordFastEditReadResult,
  relativeElementIndexPath,
  REMOVED_ARTBOARD_JOURNAL_LABEL,
  sanitizeJournalText,
  summarizeArtboardText,
  truncateJournalText,
  UNTRUSTED_TEXT_PATTERN,
};
export function installFastEditJournal(): () => void {
  return () => {
    MAX_JOURNAL_CHANGE_LINES = 10;
    MAX_JOURNAL_TEXT_CHARS = 300;
    MAX_JOURNAL_ATTRIBUTE_CHARS = 160;
    MAX_JOURNAL_ELEMENT_LABEL_CHARS = 60;
    MAX_JOURNAL_DIFF_CHARS = 240;
    MAX_JOURNAL_LINE_CHARS = 340;
    NEW_ARTBOARD_JOURNAL_LABEL = "new artboard";
    REMOVED_ARTBOARD_JOURNAL_LABEL = "removed artboard";
    UNTRUSTED_TEXT_PATTERN = /untrusted|[0-9a-f]{32}/i;
    sanitizeJournalText = (text?: Dynamic): Dynamic => {
      let value: Dynamic = text.replace(/\p{Cf}/gu, "");
      return UNTRUSTED_TEXT_PATTERN.test(value)
        ? sanitizeUntrustedText(value)
        : value;
    };
    normalizeJournalWhitespace = (text?: Dynamic): Dynamic =>
      text.replace(/[\s\p{Cc}]+/gu, " ");
    normalizeJournalText = (text?: Dynamic): Dynamic =>
      normalizeJournalWhitespace(sanitizeJournalText(text)).trim();
    truncateJournalText = (text?: Dynamic, maxChars?: Dynamic): Dynamic =>
      text.length > maxChars ? text.slice(0, maxChars - 1) + "\u2026" : text;
    journalUtf8Size = (text?: Dynamic): Dynamic =>
      new TextEncoder().encode(text).length;
    immediateElementText = (element?: Dynamic): Dynamic =>
      normalizeJournalText(
        Array.from(element.childNodes)
          .filter((child?: Dynamic): Dynamic => child.nodeType === 3)
          .map((child?: Dynamic): Dynamic => child.textContent ?? "")
          .join(" "),
      );
    normalizeJournalTagName = (tagName?: Dynamic): Dynamic =>
      tagName.replace(/^sc-raw-/, "");
    describeJournalElement = (
      tagName?: Dynamic,
      labelText?: Dynamic,
      article: Dynamic = "the ",
    ): Dynamic =>
      (SAFE_PROMPT_HTML_TAGS.has(normalizeJournalTagName(tagName))
        ? article + normalizeJournalTagName(tagName)
        : article === "the "
          ? "an element"
          : "element") +
      (labelText !== ""
        ? ' "' +
          truncateJournalText(labelText, MAX_JOURNAL_ELEMENT_LABEL_CHARS) +
          '"'
        : "");
    MAX_DECORATIVE_ELEMENT_COUNT = 40;
    NON_DECORATIVE_ELEMENT_SELECTOR =
      "img, picture, video, canvas, dc-import, x-import, input, textarea, select, sc-raw-select, button";
    hasBackgroundImage = (element?: Dynamic): Dynamic =>
      /(?:^|;)\s*background(?:-image)?\s*:[^;]*url\(/i.test(
        element.getAttribute("style") ?? "",
      );
    relativeElementIndexPath = (
      element?: Dynamic,
      root?: Dynamic,
    ): Dynamic => {
      let items: Dynamic = [];
      for (
        let value: Dynamic = element;
        value !== root && value.parentElement !== null;
        value = value.parentElement
      )
        items.unshift(
          Array.prototype.indexOf.call(value.parentElement.children, value) + 1,
        );
      return items.join(".");
    };
    hashElementStructure = (root?: Dynamic): Dynamic => {
      let count: Dynamic = 2166136261;
      for (let value of [
        root,
        ...Array.from(root.querySelectorAll("*")),
      ] as Dynamic)
        for (let character of (value.localName +
          String(value.children.length) +
          " ") as Dynamic)
          count = Math.imul(count ^ character.charCodeAt(0), 16777619);
      return String(count >>> 0);
    };
    hashHtmlStructure = (html?: Dynamic): Dynamic => {
      let value: Dynamic = parseJournalRoot(html);
      return value === null ? "" : hashElementStructure(value);
    };
    equalElementAttributes = (left?: Dynamic, right?: Dynamic): Dynamic => {
      let attributes: Dynamic = left.attributes,
        rightAttributes: Dynamic = right.attributes;
      if (attributes.length !== rightAttributes.length) return false;
      for (let index: Dynamic = 0; index < attributes.length; index++)
        if (
          attributes[index].name !== rightAttributes[index].name ||
          attributes[index].value !== rightAttributes[index].value
        )
          return false;
      return true;
    };
    journalElementAttributes = (element?: Dynamic, generatedIdPattern?: Dynamic): Dynamic =>
      new Map(
        Array.from(element.attributes)
          .filter(
            (attribute?: Dynamic): Dynamic =>
              attribute.name !== "style" &&
              !(
                attribute.name === "id" &&
                generatedIdPattern !== null &&
                generatedIdPattern.test(attribute.value)
              ),
          )
          .map(
            (attribute?: Dynamic): Dynamic => [
              attribute.name,
              normalizeJournalText(attribute.value),
            ],
          ),
      );
    MAX_REORDER_TRACKING_ITEMS = 400;
    longestIncreasingSubsequenceLength = (sequence?: Dynamic): Dynamic => {
      let items: Dynamic = [];
      for (let value of sequence as Dynamic) {
        let index: Dynamic = 0,
          length: Dynamic = items.length;
        for (; index < length; ) {
          let midpoint: Dynamic = (index + length) >> 1;
          items[midpoint] < value ? (index = midpoint + 1) : (length = midpoint);
        }
        items[index] = value;
      }
      return items.length;
    };
    allJournalArtboards = (mainArtboard?: Dynamic): Dynamic => [
      mainArtboard,
      ...(mainArtboard.also ?? []),
    ];
    formatJournalTime = (date?: Dynamic): Dynamic =>
      String(date.getHours()).padStart(2, "0") +
      ":" +
      String(date.getMinutes()).padStart(2, "0");
    createFastEditJournalState = (
      clock: Dynamic = (): Dynamic => new Date(),
      historyOptions?: Dynamic,
    ): Dynamic => ({
      journal: [],
      history: createFastEditHistory(historyOptions),
      seen: new Map(),
      beforeLast: new Map(),
      opened: new Set(),
      unrecorded: new Map(),
      threads: new Set(),
      first: null,
      turn: null,
      clock: clock,
    });
    MAX_FAST_EDIT_JOURNAL_ENTRIES = 200;
    HISTORY_TURN_COMPLETION_MESSAGES = {
      done: "done",
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      handed: "handed to the agent, nothing changed here",
      not_applied: "not done here, it went to the agent",
      unconfirmed: "made, but the save was not confirmed",
      nothing: "not done, nothing changed",
      left: "what was made of it here still stands; it also went to the agent",
      left_changed:
        "it went to the agent; what stands of it here is what the artboards show",
    };
    FAST_EDIT_TURN_STATUS_LABELS = {
      hand: "by hand",
      other: "someone else",
      undone: "undo",
    };
  };
}
