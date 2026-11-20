import type { StatementFailure, StatementLocation } from "./types";
interface ControlRule {
  kws: string[];
  re: RegExp;
}
interface PendingStatement {
  code: string;
  start: number;
  end: number;
  chain: boolean;
}
import type { SplitStatementsResult, DetailedStatement } from "./types";
/** Streaming JavaScript statement splitter. Source byte range: 5377–10516. */
import type { StatementStream, StatementStreamOptions } from "./types";
var BLOCK_COMMENT: string = String.raw`\/\*(?:[^*]|\*(?!\/))*\*\/`;
var TRAILING_COMMENTS: RegExp = new RegExp(
  String.raw`(?:\s|${BLOCK_COMMENT}|\/\/[^\n]*(?:\n|$))+$`,
);
var CONTROL_STATEMENT: RegExp = new RegExp(
  String.raw`^(?:\s|${BLOCK_COMMENT}|\/\/[^\n]*\n)*(if|try|do)\b`,
);
function hasUnfilledControlBody(code: string): boolean {
  let tail = code.slice(code.lastIndexOf("}") + 1);
  let controlHeader = /(?<![.\w$])(if|for|while|catch|switch|with)\s*\(/g;
  for (
    let match = controlHeader.exec(tail);
    match;
    match = controlHeader.exec(tail)
  ) {
    if (
      match[1] === "while" &&
      (CONTROL_STATEMENT.exec(code) || [])[1] === "do"
    )
      continue;
    let depth = 0;
    let index = match.index + match[0].length - 1;
    for (; index < tail.length; index++) {
      let character = tail[index];
      if (character === "(") depth++;
      else if (character === ")" && --depth === 0) break;
    }
    if (depth === 0 && index < tail.length && !tail.slice(index + 1).trim())
      return true;
  }
  return false;
}
var CONTROL_CONTINUATIONS: Record<string, ControlRule> = {
  if: {
    kws: ["else"],
    re: /^else\b/,
  },
  try: {
    kws: ["catch", "finally"],
    re: /^(catch|finally)\b/,
  },
  do: {
    kws: ["while"],
    re: /^while\b/,
  },
};
var REGEX_PREFIX_KEYWORDS: RegExp =
  /(?:^|[^\w$.])(?:return|typeof|instanceof|in|of|new|delete|void|throw|case|do|else|yield|await)\s*$/;
var isWhitespace: (input: string) => boolean = (character) =>
  character === " " ||
  character === "\t" ||
  character === "\r" ||
  character ===
    `
`;
function createStatementStream(
  options?: StatementStreamOptions,
): StatementStream;
function createStatementStream(
  streamOptions?: StatementStreamOptions,
): StatementStream {
  let settings: StatementStreamOptions = streamOptions || {};
  let joinChains = !!settings.joinChains;
  let regexAfterKeywords = settings.regexAfterKeywords !== false;
  let buffer: string;
  let parenDepth: number;
  let braceDepth: number;
  let bracketDepth: number;
  let quote: string | null;
  let escapedString: boolean;
  let lineComment: boolean;
  let statementStart: number;
  let templateDepths: number[];
  let templateDollar: boolean;
  let blockComment: boolean;
  let regex: boolean;
  let regexCharacterClass: boolean;
  let escapedRegex: boolean;
  let pendingSlash: boolean;
  let lastSignificantChar: string;
  let arrowBodyPending: boolean;
  let controlEnd: number;
  let continuationStart: number;
  let lineCommentStart: number;
  let continuationRule: ControlRule | null;
  let statementCount: number;
  let ended: boolean;
  let pendingChain: PendingStatement | null;
  let bufferOffset: number;
  function reset(): void {
    buffer = "";
    parenDepth = braceDepth = bracketDepth = 0;
    quote = null;
    escapedString = false;
    lineComment = false;
    statementStart = 0;
    templateDepths = [];
    templateDollar = false;
    blockComment = false;
    regex = regexCharacterClass = escapedRegex = false;
    pendingSlash = false;
    lastSignificantChar = "";
    arrowBodyPending = false;
    controlEnd = -1;
    continuationStart = 0;
    lineCommentStart = 0;
    continuationRule = null;
    statementCount = 0;
    ended = false;
    pendingChain = null;
    bufferOffset = 0;
  }
  reset();
  let atTopLevel = () =>
    parenDepth === 0 && braceDepth === 0 && bracketDepth === 0;
  function emitStatement(
    statement: string,
    isChain: boolean,
    startOffset: number,
    endOffset: number,
  ): void {
    let statementIndex = statementCount++;
    if (settings.onStatement)
      try {
        settings.onStatement(statement, statementIndex, {
          chain: isChain,
          start: startOffset,
          end: endOffset,
        });
      } catch (error: unknown) {
        if (settings.onError) settings.onError(error);
        else throw error;
      }
  }
  function queueStatement(
    statement: string,
    statementOffset: number,
    unusedContext: number,
  ): void {
    let leadingWhitespace = statement.length - statement.trimStart().length;
    let trimmedStatement = statement.trim();
    let isChained = trimmedStatement[0] === ".";
    let absoluteStart = bufferOffset + statementOffset + leadingWhitespace;
    let absoluteEnd = absoluteStart + trimmedStatement.length;
    if (!joinChains) {
      emitStatement(trimmedStatement, isChained, absoluteStart, absoluteEnd);
      return;
    }
    if (isChained && pendingChain) {
      pendingChain.code +=
        `
` + trimmedStatement;
      pendingChain.end = absoluteEnd;
      return;
    }
    if (pendingChain)
      emitStatement(
        pendingChain.code,
        false,
        pendingChain.start,
        pendingChain.end,
      );
    pendingChain = {
      code: trimmedStatement,
      start: absoluteStart,
      end: absoluteEnd,
      chain: isChained,
    };
  }
  function flushChain(): void {
    if (pendingChain) {
      let chain = pendingChain;
      pendingChain = null;
      emitStatement(chain.code, chain.chain, chain.start, chain.end);
    }
  }
  function flushControlStatement(): void {
    let controlStart = statementStart;
    let slice = buffer.slice(statementStart, controlEnd);
    if (((statementStart = continuationStart), (controlEnd = -1), slice.trim()))
      queueStatement(slice, controlStart, controlStart + slice.length);
  }
  function finishStatement(endOffset: number): boolean {
    let statementStartOffset = statementStart;
    let slice = buffer.slice(statementStart, endOffset);
    let trimmedCode = slice.replace(TRAILING_COMMENTS, "");
    if (
      /(?<!\.)\b(else|try|do|finally)$/.test(trimmedCode) ||
      hasUnfilledControlBody(trimmedCode)
    )
      return false;
    let controlKeyword = (CONTROL_STATEMENT.exec(slice) || [])[1];
    if (controlKeyword) {
      controlEnd = endOffset;
      continuationStart = buffer.length;
      continuationRule = CONTROL_CONTINUATIONS[controlKeyword]!;
      return true;
    }
    if (((statementStart = buffer.length), !slice.trim())) return false;
    queueStatement(slice, statementStartOffset, endOffset);
    return true;
  }
  function checkControlContinuation(): void {
    if (controlEnd < 0) return;
    let continuation = continuationRule!;
    let remainingCode = buffer.slice(continuationStart).replace(/^\s+/, "");
    if (remainingCode === "/" || continuation.kws.some((keyword) => keyword.startsWith(remainingCode)))
      return;
    if (continuation.re.test(remainingCode)) {
      controlEnd = -1;
      return;
    }
    flushControlStatement();
  }
  function finishAtDelimiter(): void {
    if (controlEnd < 0) finishStatement(buffer.length - 1);
  }
  function acceptCharacter(character: string): void {
    if (pendingSlash) {
      if (((pendingSlash = false), character === "/")) {
        if (
          ((lineComment = true),
          (lineCommentStart = buffer.length - 2),
          atTopLevel() && controlEnd < 0)
        )
          finishStatement(lineCommentStart);
        return;
      }
      if (character === "*") {
        blockComment = true;
        return;
      }
      if (
        lastSignificantChar === "" ||
        "([{,;=!&|?:+-*%^~<>".indexOf(lastSignificantChar) >= 0 ||
        (regexAfterKeywords &&
          REGEX_PREFIX_KEYWORDS.test(
            buffer.slice(Math.max(0, buffer.length - 16), buffer.length - 2),
          ))
      )
        regex = true;
      else lastSignificantChar = "/";
    }
    if (blockComment) {
      if (character === "/" && buffer[buffer.length - 2] === "*") {
        if (((blockComment = false), controlEnd >= 0 && atTopLevel()))
          continuationStart = buffer.length;
      }
      return;
    }
    if (lineComment) {
      if (
        character ===
        `
`
      ) {
        if (((lineComment = false), atTopLevel())) {
          if (controlEnd >= 0) continuationStart = buffer.length;
          else if (statementStart >= lineCommentStart)
            statementStart = buffer.length;
        }
      }
      return;
    }
    if (quote !== null) {
      if (escapedString) {
        escapedString = character === "\\";
        templateDollar = false;
        return;
      }
      if (character === "\\") {
        escapedString = true;
        templateDollar = false;
        return;
      }
      if (quote === "`") {
        if (character === "{" && templateDollar) {
          templateDollar = false;
          templateDepths.push(braceDepth);
          braceDepth++;
          quote = null;
          return;
        }
        templateDollar = character === "$";
      }
      if (character === quote) {
        lastSignificantChar = character;
        quote = null;
      }
      return;
    }
    if (regex) {
      if (escapedRegex) {
        escapedRegex = false;
        return;
      }
      if (character === "\\") {
        escapedRegex = true;
        return;
      }
      if (regexCharacterClass) {
        if (character === "]") regexCharacterClass = false;
        return;
      }
      if (character === "[") {
        regexCharacterClass = true;
        return;
      }
      if (character === "/") {
        regex = false;
        lastSignificantChar = "/";
      }
      return;
    }
    if (arrowBodyPending && !isWhitespace(character)) arrowBodyPending = false;
    switch ((checkControlContinuation(), character)) {
      case "'":
      case '"':
      case "`":
        quote = character;
        lastSignificantChar = character;
        return;
      case "(":
        parenDepth++;
        lastSignificantChar = character;
        return;
      case ")":
        if (parenDepth > 0) parenDepth--;
        lastSignificantChar = character;
        return;
      case "{":
        braceDepth++;
        lastSignificantChar = character;
        return;
      case "}":
        if (braceDepth > 0) braceDepth--;
        if (
          templateDepths.length > 0 &&
          braceDepth === templateDepths[templateDepths.length - 1]
        ) {
          templateDepths.pop();
          quote = "`";
        }
        lastSignificantChar = character;
        return;
      case "[":
        bracketDepth++;
        lastSignificantChar = character;
        return;
      case "]":
        if (bracketDepth > 0) bracketDepth--;
        lastSignificantChar = character;
        return;
      case "/":
        pendingSlash = true;
        return;
      case ">":
        if (buffer[buffer.length - 2] === "=" && atTopLevel())
          arrowBodyPending = true;
        lastSignificantChar = character;
        return;
      case `
`:
        if (arrowBodyPending) return;
        if (atTopLevel()) finishAtDelimiter();
        return;
      case ";":
        if (atTopLevel()) finishAtDelimiter();
        lastSignificantChar = character;
        return;
      case " ":
      case "\t":
      case "\r":
        return;
      default:
        lastSignificantChar = character;
    }
  }
  function compactBuffer(): void {
    if (controlEnd >= 0 || statementStart < 4096) return;
    let trimLength = Math.min(
      statementStart,
      lineCommentStart > statementStart || !lineComment
        ? statementStart
        : lineCommentStart,
    );
    if (trimLength <= 0) return;
    buffer = buffer.slice(trimLength);
    bufferOffset += trimLength;
    statementStart -= trimLength;
    continuationStart = Math.max(0, continuationStart - trimLength);
    lineCommentStart = Math.max(0, lineCommentStart - trimLength);
  }
  function push(chunk: string): void {
    if (ended) {
      let error = Error(
        "stmtstream: push() after end(); call reset() to start a new program",
      ) as StatementFailure;
      if (((error.code = "ENDED"), settings.onError)) settings.onError(error);
      else throw error;
      return;
    }
    chunk = String(chunk);
    for (let index = 0; index < chunk.length; index++) {
      buffer += chunk[index];
      acceptCharacter(chunk[index]!);
    }
    compactBuffer();
  }
  function describeOpenSyntax(): string {
    let items = [];
    if (quote)
      items.push(
        quote === "`" ? "a template literal" : "a string (" + quote + ")",
      );
    if (blockComment) items.push("a block comment");
    if (regex) items.push("a regular expression");
    if (parenDepth) items.push(parenDepth + " × (");
    if (bracketDepth) items.push(bracketDepth + " × [");
    if (braceDepth) items.push(braceDepth + " × {");
    return items.join(", ");
  }
  function value(): void {
    if (ended) return;
    ended = true;
    let hasOpenSyntax = quote !== null || blockComment || regex;
    if (!hasOpenSyntax) {
      if (pendingSlash) {
        pendingSlash = false;
        lastSignificantChar = "/";
      }
      buffer += `
`;
      acceptCharacter(`
`);
    }
    if (controlEnd >= 0) flushControlStatement();
    let slice = buffer.slice(statementStart);
    let trimmedStatement = slice.replace(TRAILING_COMMENTS, "").trim();
    let incomplete = false;
    if (trimmedStatement) {
      let openSyntax = describeOpenSyntax();
      if (openSyntax || hasOpenSyntax) incomplete = true;
      else if (
        /(?<!\.)\b(else|try|do|finally)$/.test(trimmedStatement) ||
        hasUnfilledControlBody(trimmedStatement) ||
        arrowBodyPending
      )
        incomplete = true;
      if (incomplete) {
        flushChain();
        let error = Error(
          "stmtstream: the program ends in the middle of a statement" +
            (openSyntax
              ? " (still open: " + openSyntax + ")"
              : " (its body has not arrived)"),
        ) as StatementFailure;
        if (
          ((error.code = "INCOMPLETE"),
          (error.tail = slice.trim()),
          (error.open = openSyntax),
          settings.onError)
        )
          settings.onError(error);
      } else {
        let statementStartOffset = statementStart;
        statementStart = buffer.length;
        queueStatement(slice, statementStartOffset, statementStartOffset + slice.length);
      }
    }
    if ((flushChain(), settings.onDone))
      settings.onDone({
        statements: statementCount,
        incomplete: incomplete,
      });
  }
  return {
    push: push,
    end: value,
    reset: reset,
    tail: () => buffer.slice(statementStart),
    get count() {
      return statementCount;
    },
  };
}
function splitStatements(
  code: string,
  options: StatementStreamOptions & {
    detailed: true;
  },
): SplitStatementsResult<DetailedStatement>;
function splitStatements(
  code: string,
  options?: StatementStreamOptions & {
    detailed?: false;
  },
): SplitStatementsResult;
function splitStatements(
  code: string,
  options: StatementStreamOptions,
): SplitStatementsResult<string | DetailedStatement>;
function splitStatements(
  code: string,
  streamOptions?: StatementStreamOptions,
): SplitStatementsResult<string | DetailedStatement> {
  let statements: (string | DetailedStatement)[] = [];
  let settings: StatementStreamOptions = Object.assign({}, streamOptions);
  let incomplete: string | null = null;
  let stream = createStatementStream(
    Object.assign(settings, {
      onStatement: (
        statement: string,
        index: number,
        location: StatementLocation,
      ): number =>
        statements.push(
          settings.detailed
            ? Object.assign(
                {
                  code: statement,
                  index: index,
                },
                location,
              )
            : statement,
        ),
      onError: (streamError: unknown) => {
        const error = streamError as StatementFailure;
        if (error.code === "INCOMPLETE") incomplete = error.tail!;
        else throw streamError;
      },
    }),
  );
  stream.push(code);
  stream.end();
  return {
    statements: statements,
    incomplete: incomplete,
  };
}
export { createStatementStream, splitStatements };
