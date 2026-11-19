/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var CodeScriptLiteralsAFAFPattern: Dynamic;
var reactCodeScriptLiterals: Dynamic;
function decodeScriptStringEscape(
  source?: Dynamic,
  escapeIndex?: Dynamic,
): Dynamic {
  let escapeChar: Dynamic = source[escapeIndex];
  switch (escapeChar) {
    case "n":
      return {
        ch: `
`,
        next: escapeIndex + 1,
      };
    case "t":
      return {
        ch: "	",
        next: escapeIndex + 1,
      };
    case "r":
      return {
        ch: "\r",
        next: escapeIndex + 1,
      };
    case "b":
      return {
        ch: "\b",
        next: escapeIndex + 1,
      };
    case "f":
      return {
        ch: "\f",
        next: escapeIndex + 1,
      };
    case "v":
      return {
        ch: "\v",
        next: escapeIndex + 1,
      };
    case "0":
      return {
        ch: "\0",
        next: escapeIndex + 1,
      };
    case "x": {
      let hex: Dynamic = source.slice(escapeIndex + 1, escapeIndex + 3);
      return hex.length === 2 &&
        CodeScriptLiteralsAFAFPattern.test(hex[0]) &&
        CodeScriptLiteralsAFAFPattern.test(hex[1])
        ? {
            ch: String.fromCharCode(parseInt(hex, 16)),
            next: escapeIndex + 3,
          }
        : {
            ch: escapeChar,
            next: escapeIndex + 1,
          };
    }
    case "u": {
      if (source[escapeIndex + 1] === "{") {
        let closeBraceIndex: Dynamic = source.indexOf("}", escapeIndex + 2);
        if (closeBraceIndex !== -1) {
          let codePointHex: Dynamic = source.slice(escapeIndex + 2, closeBraceIndex);
          if (
            codePointHex.length > 0 &&
            codePointHex.length <= 6 &&
            /^[0-9a-fA-F]+$/.test(codePointHex)
          ) {
            let codePoint: Dynamic = parseInt(codePointHex, 16);
            if (codePoint <= 1114111)
              return {
                ch: String.fromCodePoint(codePoint),
                next: closeBraceIndex + 1,
              };
          }
        }
        return {
          ch: escapeChar,
          next: escapeIndex + 1,
        };
      }
      let hex: Dynamic = source.slice(escapeIndex + 1, escapeIndex + 5);
      return hex.length === 4 && /^[0-9a-fA-F]+$/.test(hex)
        ? {
            ch: String.fromCharCode(parseInt(hex, 16)),
            next: escapeIndex + 5,
          }
        : {
            ch: escapeChar,
            next: escapeIndex + 1,
          };
    }
    case `
`:
      return {
        ch: "",
        next: escapeIndex + 1,
      };
    case "\r":
      return {
        ch: "",
        next:
          source[escapeIndex + 1] ===
          `
`
            ? escapeIndex + 2
            : escapeIndex + 1,
      };
    default:
      return {
        ch: escapeChar,
        next: escapeIndex + 1,
      };
  }
}
function isScriptRegexPosition(source?: Dynamic, position?: Dynamic): Dynamic {
  let cursor: Dynamic = position - 1;
  for (; cursor >= 0 && (source[cursor] === " " || source[cursor] === "	"); )
    cursor--;
  if (cursor < 0) return true;
  let previousChar: Dynamic = source[cursor];
  if (/[\w$\])]/.test(previousChar)) {
    let wordStart: Dynamic = cursor;
    for (; wordStart >= 0 && /[\w$]/.test(source[wordStart]); ) wordStart--;
    let word: Dynamic = source.slice(wordStart + 1, cursor + 1);
    return (
      word === "return" ||
      word === "typeof" ||
      word === "delete" ||
      word === "void" ||
      word === "throw" ||
      word === "in" ||
      word === "of" ||
      word === "instanceof" ||
      word === "new" ||
      word === "yield" ||
      word === "await" ||
      word === "case" ||
      word === "do" ||
      word === "else"
    );
  }
  return true;
}
function tokenizeScriptLiterals(source?: Dynamic): Dynamic {
  let literals: Dynamic = [],
    index: Dynamic = 0,
    length: Dynamic = source.length;
  for (; index < length; ) {
    let char: Dynamic = source[index];
    if (char === "/" && source[index + 1] === "/") {
      for (
        index += 2;
        index < length &&
        source[index] !==
          `
`;

      )
        index++;
      continue;
    }
    if (char === "/" && source[index + 1] === "*") {
      for (
        index += 2;
        index < length && !(source[index] === "*" && source[index + 1] === "/");

      )
        index++;
      index += 2;
      continue;
    }
    if (char === "/" && isScriptRegexPosition(source, index)) {
      index++;
      let isInCharClass: Dynamic = false;
      for (; index < length; ) {
        let regexChar: Dynamic = source[index];
        if (regexChar === "\\") {
          index += 2;
          continue;
        }
        if (regexChar === "[") isInCharClass = true;
        else if (regexChar === "]") isInCharClass = false;
        else if (regexChar === "/" && !isInCharClass) {
          index++;
          break;
        } else if (
          regexChar ===
          `
`
        )
          break;
        index++;
      }
      for (; index < length && /[a-z]/.test(source[index]); ) index++;
      continue;
    }
    if (char === "'" || char === '"' || char === "`") {
      let quote: Dynamic = char,
        startIndex: Dynamic = index;
      index++;
      let text: Dynamic = "",
        hasInterpolation: Dynamic = false,
        isClosed: Dynamic = false;
      for (; index < length; ) {
        let currentChar: Dynamic = source[index];
        if (currentChar === "\\") {
          let { ch: decodedChar, next: nextIndex }: Dynamic =
            decodeScriptStringEscape(source, index + 1);
          text += decodedChar;
          index = nextIndex;
          continue;
        }
        if (currentChar === quote) {
          index++;
          isClosed = true;
          break;
        }
        if (quote === "`" && currentChar === "$" && source[index + 1] === "{") {
          hasInterpolation = true;
          index += 2;
          let count: Dynamic = 1;
          for (; index < length && count > 0; ) {
            source[index] === "{" ? count++ : source[index] === "}" && count--;
            index++;
          }
          continue;
        }
        if (
          quote !== "`" &&
          (currentChar ===
            `
` ||
            currentChar === "\r")
        )
          break;
        text += currentChar;
        index++;
      }
      isClosed &&
        !hasInterpolation &&
        text.length >= 2 &&
        literals.push({
          value: text,
          start: startIndex,
          end: index,
          quote: quote,
        });
      continue;
    }
    index++;
  }
  return literals;
}
function quoteScriptString(rawText?: Dynamic, preferredQuote?: Dynamic): Dynamic {
  let quote: Dynamic =
      preferredQuote === "`" || preferredQuote === "'" || preferredQuote === '"' ? preferredQuote : "'",
    text: Dynamic = "";
  for (let char of rawText as Dynamic)
    char === "\\"
      ? (text += "\\\\")
      : char === quote
        ? (text += "\\" + quote)
        : char ===
            `
`
          ? (text +=
              quote === "`"
                ? `
`
                : "\\n")
          : char === "\r"
            ? (text += "\\r")
            : quote === "`" && char === "$"
              ? (text += "\\$")
              : (text += char);
  text = text.replace(/<(\/?(?:script|x-dc)|!--)/gi, "\\x3C$1");
  return quote + text + quote;
}
export {
  CodeScriptLiteralsAFAFPattern,
  decodeScriptStringEscape,
  isScriptRegexPosition,
  quoteScriptString,
  reactCodeScriptLiterals,
  tokenizeScriptLiterals,
};
export function installEditorCodeScriptLiterals(): () => void {
  return () => {
    CodeScriptLiteralsAFAFPattern = /[0-9a-fA-F]/;
    reactCodeScriptLiterals = toModuleNamespace(
      load_react(),
      1,
    );
  };
}
