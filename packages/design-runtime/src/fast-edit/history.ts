/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var createFastEditHistory: Dynamic;
var countHistoryCharacters: Dynamic;
var formatHistoryCharacterCount: Dynamic;
var HISTORY_TURN_ID_PATTERN: Dynamic;
var MAX_LISTED_HISTORY_TURN_IDS: Dynamic;
var summarizeTurnIds: Dynamic;
var describeAutomaticallyDroppedTurns: Dynamic;
var FORGET_STATEMENT_PATTERN: Dynamic;
var MAX_FORGET_ERRORS: Dynamic;
function summarizeHistoryTurns(turns?: Dynamic): Dynamic {
  let lastUserIndex: Dynamic = turns
      .map((input?: Dynamic): Dynamic => input.role)
      .lastIndexOf("user"),
    groups: Dynamic = [];
  turns.forEach((input?: Dynamic, options?: Dynamic): Dynamic => {
    if (
      input.role !== "user" ||
      input.first === true ||
      input.id === undefined
    )
      return;
    let length: Dynamic = input.content.length,
      flag: Dynamic = false;
    for (
      let value: Dynamic = options + 1;
      value < turns.length && turns[value].role === "assistant";
      value++
    ) {
      length += turns[value].content.length;
      flag = flag || turns[value].notes === true;
    }
    groups.push({
      id: input.id,
      done: options !== lastUserIndex,
      notes: flag,
      chars: length,
    });
  });
  return groups;
}
function describeHistoryPressure(turns?: Dynamic, limit?: Dynamic): Dynamic {
  let chars: Dynamic = countHistoryCharacters(turns),
    ratio: Dynamic = chars / limit;
  if (ratio < 0.8) return "";
  let value: Dynamic = summarizeHistoryTurns(turns).filter(
    (input?: Dynamic): Dynamic => input.done,
  );
  if (value.length === 0) return "";
  let usedPercent: Dynamic = Math.round(ratio * 100),
    targetReductionChars: Dynamic = Math.round((chars * (ratio - 0.5)) / ratio),
    index: Dynamic = 0,
    suggestedTurnCount: Dynamic = 0;
  for (; suggestedTurnCount < value.length && index < targetReductionChars; )
    index += value[suggestedTurnCount++].chars;
  let turnDescriptions: Dynamic = value
      .map(
        (input?: Dynamic): Dynamic =>
          input.id +
          " " +
          formatHistoryCharacterCount(input.chars) +
          (input.notes ? " (holds your earlier notes)" : ""),
      )
      .join(" \xB7 "),
    pressureDescription: Dynamic =
      "~" + String(chars) + " of " + String(limit) + " characters",
    reductionDescription: Dynamic =
      "A turn is a message that starts with [tN], with your reply to it. The turns you name leave your context; this reply, with its notes, stays where you write it, and you go on with the task in the same reply. Remove about ~" +
      formatHistoryCharacterCount(targetReductionChars) +
      " so it drops to about " +
      String(Math.round(0.5 * 100)) +
      "%: the oldest and the spent turns (finished exchanges, failed attempts); keep the turns you still work from, the latest among them. " +
      String(value.length) +
      " turn" +
      (value.length === 1 ? "" : "s") +
      " you can name, oldest first: " +
      turnDescriptions +
      "." +
      (index >= targetReductionChars
        ? " The oldest " +
          String(suggestedTurnCount) +
          " (through " +
          value[suggestedTurnCount - 1].id +
          ") add up to ~" +
          formatHistoryCharacterCount(index) +
          "."
        : "") +
      " You choose which. Notes are much shorter than the turns they stand for: the user's words, what is done and what is open, names you rely on. When you forget a turn that holds earlier notes, carry what you still need of them into the new notes.";
  return ratio >= 0.92
    ? "[context " +
        String(usedPercent) +
        "% (" +
        pressureDescription +
        ') \u2014 full. Call forget(["tN", ...], "notes") first, before anything else. ' +
        reductionDescription +
        "]"
    : "[context " +
        String(usedPercent) +
        "% (" +
        pressureDescription +
        '): clean up the older turns carefully: call forget(["tN", ...], "notes") in this reply. ' +
        reductionDescription +
        "]";
}
function queueForgottenTurns(
  history?: Dynamic,
  ids?: Dynamic,
  notes?: Dynamic,
  statement: Dynamic = "",
): Dynamic {
  if (ids.length === 0)
    throw new Error(
      'forget needs a list of turn ids, e.g. forget(["t2", "t3"], "notes")',
    );
  let value: Dynamic = notes.trim();
  if (value === "")
    throw new Error(
      "forget needs notes: what you still need from those turns",
    );
  let entries: Dynamic = new Map(
      summarizeHistoryTurns(history.turns).map(
        (input?: Dynamic): Dynamic => [input.id, input],
      ),
    ),
    items: Dynamic = [...new Set(ids)],
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      entries.get(input)?.done === true,
    invalidIds: Dynamic = items.filter(
      (input?: Dynamic): Dynamic => !callback(input),
    ),
    eligibleIds: Dynamic = items.filter(callback);
  eligibleIds.length > 0 &&
    history.pending.push({
      ids: eligibleIds,
      notes: value,
      line: statement,
    });
  if (invalidIds.length > 0)
    throw new Error(
      "forget: no such turn" +
        (invalidIds.length === 1 ? "" : "s") +
        ": " +
        summarizeTurnIds(
          invalidIds.map(
            (input?: Dynamic): Dynamic =>
              HISTORY_TURN_ID_PATTERN.test(input) ? input : "(not an id)",
          ),
        ) +
        " (the first turn and the turn you are answering cannot be named; " +
        (eligibleIds.length > 0
          ? summarizeTurnIds(eligibleIds) + " will be forgotten"
          : "nothing was forgotten") +
        ")",
    );
}
function applyPendingForgottenTurns(
  history?: Dynamic,
  marker?: Dynamic,
): Dynamic {
  let pending: Dynamic = history.pending.splice(0);
  if (pending.length === 0) return null;
  let ids: Dynamic = new Set(
      pending.flatMap((input?: Dynamic): Dynamic => input.ids),
    ),
    beforeChars: Dynamic = countHistoryCharacters(history.turns),
    callback: Dynamic = (input?: Dynamic): Dynamic =>
      (input.role === "user" &&
        input.id !== undefined &&
        ids.has(input.id)) ||
      (input.role === "assistant" &&
        input.of !== undefined &&
        ids.has(input.of)),
    value: Dynamic = history.turns.filter(callback);
  history.turns.splice(
    0,
    history.turns.length,
    ...history.turns.filter((input?: Dynamic): Dynamic => !callback(input)),
  );
  marker.notes = true;
  let state: Dynamic = {
    ids: [...ids].sort(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        Number(input.slice(1)) - Number(options.slice(1)),
    ),
    noteChars: pending.reduce(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        input + options.notes.length,
      0,
    ),
    removedChars: countHistoryCharacters(value),
    before: beforeChars,
    after: countHistoryCharacters(history.turns),
  };
  history.trace.forgets.push(state);
  return state;
}
function trimHistoryTurns(turns?: Dynamic, maxChars?: Dynamic): Dynamic {
  let dropped: Dynamic = [];
  for (; countHistoryCharacters(turns) > maxChars; ) {
    let value: Dynamic = summarizeHistoryTurns(turns).find(
      (input?: Dynamic): Dynamic => input.done,
    );
    if (value === undefined) break;
    dropped.push(value.id);
    turns.splice(
      0,
      turns.length,
      ...turns.filter(
        (input?: Dynamic): Dynamic =>
          !(
            (input.role === "user" && input.id === value.id) ||
            (input.role === "assistant" && input.of === value.id)
          ),
      ),
    );
  }
  return dropped;
}
function parseForgetStatement(statement?: Dynamic): Dynamic {
  let offset: Dynamic = 0,
    text: Dynamic = statement.trim(),
    skipWhitespace: Dynamic = (): Dynamic => {
      for (; text[offset] === " " || text[offset] === "	"; ) offset += 1;
    },
    consume: Dynamic = (token?: Dynamic): Dynamic => (
      skipWhitespace(),
      text.startsWith(token, offset)
        ? ((offset += token.length), true)
        : false
    ),
    parseQuotedString: Dynamic = (): Dynamic => {
      skipWhitespace();
      let quote: Dynamic = text[offset];
      if (quote !== '"' && quote !== "'") return null;
      let decoded: Dynamic = "";
      for (
        offset += 1;
        offset < text.length && text[offset] !== quote;
        offset++
      ) {
        if (text[offset] !== "\\") {
          decoded += text[offset];
          continue;
        }
        let escapedCharacter: Dynamic = text[++offset];
        if (
          escapedCharacter !== '"' &&
          escapedCharacter !== "'" &&
          escapedCharacter !== "\\" &&
          escapedCharacter !== "n"
        )
          return null;
        decoded +=
          escapedCharacter === "n"
            ? `
`
            : escapedCharacter;
      }
      return text[offset++] === quote ? decoded : null;
    };
  if (!consume("forget(") || !consume("[")) return null;
  let items: Dynamic = [];
  for (; !consume("]"); ) {
    if (items.length > 0 && !consume(",")) return null;
    let parsedId: Dynamic = parseQuotedString();
    if (parsedId === null) return null;
    items.push(parsedId);
  }
  if (!consume(",")) return null;
  let value: Dynamic = parseQuotedString();
  return value === null || !consume(")")
    ? null
    : (consume(";"),
      skipWhitespace(),
      offset === text.length
        ? {
            ids: items,
            notes: value,
          }
        : null);
}
function extractForgetStatements(
  text?: Dynamic,
  complete?: Dynamic,
): Dynamic {
  let endOffset: Dynamic = complete
      ? text.length
      : text.lastIndexOf(`
`) + 1,
    partialLine: Dynamic = text.slice(endOffset),
    statements: Dynamic = [];
  return {
    rest:
      text
        .slice(0, endOffset)
        .split(/(?<=\n)/)
        .filter(
          (input?: Dynamic): Dynamic =>
            !FORGET_STATEMENT_PATTERN.test(input) ||
            (statements.push(input.trim()), false),
        )
        .join("") +
      ("forget(".startsWith(partialLine.trimStart().slice(0, 7))
        ? ""
        : partialLine),
    calls: statements,
  };
}
function applyForgetStatements(
  history?: Dynamic,
  statements?: Dynamic,
  alreadyApplied?: Dynamic,
): Dynamic {
  for (let value of statements.slice(alreadyApplied) as Dynamic) {
    let forgetRequest: Dynamic = parseForgetStatement(value);
    try {
      if (forgetRequest === null)
        throw new Error(
          'forget: write it on one line, as forget(["t2", "t3"], "notes"), with plain quotes',
        );
      queueForgottenTurns(history, forgetRequest.ids, forgetRequest.notes, value);
    } catch (error: Dynamic) {
      history.told.length - history.shown < MAX_FORGET_ERRORS &&
        history.told.push(error.message);
    }
  }
}
function resetHistoryNotes(history?: Dynamic): Dynamic {
  Object.assign(history, {
    told: [],
    base: 0,
    shown: 0,
  });
}
function beginHistoryTurn(history?: Dynamic): Dynamic {
  history.open
    ? history.turns.pop()
    : ((history.n += 1), (history.base = history.told.length));
  history.open = false;
  return "t" + String(history.n);
}
function appendHistoryUserTurn(
  history?: Dynamic,
  turnId?: Dynamic,
  content?: Dynamic,
): Dynamic {
  history.turns.push({
    role: "user",
    id: turnId,
    content: content,
  });
  Object.assign(history, {
    open: true,
    shown: history.told.length,
    said: "",
    replied: false,
  });
}
function closeHistoryTurn(history?: Dynamic, status?: Dynamic): Dynamic {
  if (!history.open) return;
  let userTurn: Dynamic = history.turns[history.turns.length - 1],
    forgetStatements: Dynamic = history.pending
      .map((input?: Dynamic): Dynamic => input.line)
      .filter(
        (input?: Dynamic): Dynamic =>
          input !== "" && !history.said.includes(input),
      );
  history.open = false;
  if (status === null) {
    history.turns.pop();
    history.pending = [];
    history.told.length = history.base;
    return;
  }
  if (history.replied) {
    let state: Dynamic = {
      role: "assistant",
      of: userTurn.id,
      content:
        [...forgetStatements, history.said.trim()].filter(
          (input?: Dynamic): Dynamic => input !== "",
        ).join(`
`) || "(no action)",
    };
    history.turns.push(state);
    applyPendingForgottenTurns(history, state);
  }
  history.told = [
    "[your last reply] " + status,
    ...history.told.slice(history.shown),
  ];
}
export {
  appendHistoryUserTurn,
  applyForgetStatements,
  applyPendingForgottenTurns,
  beginHistoryTurn,
  closeHistoryTurn,
  countHistoryCharacters,
  createFastEditHistory,
  describeAutomaticallyDroppedTurns,
  describeHistoryPressure,
  extractForgetStatements,
  FORGET_STATEMENT_PATTERN,
  formatHistoryCharacterCount,
  HISTORY_TURN_ID_PATTERN,
  MAX_FORGET_ERRORS,
  MAX_LISTED_HISTORY_TURN_IDS,
  parseForgetStatement,
  queueForgottenTurns,
  resetHistoryNotes,
  summarizeHistoryTurns,
  summarizeTurnIds,
  trimHistoryTurns,
};
export function installFastEditHistory(): () => void {
  return () => {
    createFastEditHistory = (input: Dynamic = 4e4): Dynamic => ({
      turns: [],
      n: 0,
      open: false,
      pending: [],
      told: [],
      base: 0,
      shown: 0,
      said: "",
      replied: false,
      chars: input,
      trace: {
        forgets: [],
        blind: [],
      },
    });
    countHistoryCharacters = (input?: Dynamic): Dynamic =>
      input.reduce(
        (total?: Dynamic, options?: Dynamic): Dynamic =>
          total + options.content.length,
        0,
      );
    formatHistoryCharacterCount = (input?: Dynamic): Dynamic =>
      input < 1e3 ? "<1K" : (input / 1e3).toFixed(1) + "K";
    HISTORY_TURN_ID_PATTERN = /^t\d{1,6}$/;
    MAX_LISTED_HISTORY_TURN_IDS = 8;
    summarizeTurnIds = (
      items?: Dynamic,
      options: Dynamic = MAX_LISTED_HISTORY_TURN_IDS,
    ): Dynamic =>
      items.slice(0, options).join(", ") +
      (items.length > options
        ? ", and " + String(items.length - options) + " more"
        : "");
    describeAutomaticallyDroppedTurns = (input?: Dynamic): Dynamic =>
      "[the oldest turns were dropped to fit the limit: " +
      summarizeTurnIds(input) +
      "]";
    FORGET_STATEMENT_PATTERN = /^\s*forget\(/;
    MAX_FORGET_ERRORS = 8;
  };
}
