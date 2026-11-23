import type { Dynamic } from "./types";
/** 流式预览：识别未完成语句里的编辑形态与字符串字面量。纯文本计算，不触碰 DOM。 */
export const quotedStringPattern: Dynamic = (
  captureGroupIndex?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic => `(['"])((?:\\\\.|(?!\\` + captureGroupIndex + ")[^\\\\\\n])*)\\" + captureGroupIndex;
export const PREVIEW_PATTERNS: Dynamic = {
  assign: /^(?:(?:var|let|const)\s+)?(?:[A-Za-z_$][\w$]*\s*=\s*)?/,
  sel: new RegExp("^\\$\\(\\s*" + quotedStringPattern(1) + "\\s*\\)"),
  all: /^\$\(\s*\)/,
  me: /^(?:\$\.slide|slide)\b/,
  k: /^(?:k|\$k)\(\s*([\w\s,'"]*?)\s*\)/,
  file: new RegExp(
    "^(?:file|deck\\.slide)\\(\\s*" + quotedStringPattern(1) + "\\s*\\)",
  ),
  step: new RegExp(
    "^\\s*\\.(find|children|eq|first|last|parent|next|prev|closest|filter|not)\\(\\s*(?:" +
      quotedStringPattern(2) +
      "|(-?\\d+))?\\s*\\)",
  ),
  into: /^\s*\.(html|append|prepend|after|before)\(\s*(?=['"`])/,
  make: /^(?:\$|(?:deck\.)?add)\(\s*(?=['"`])/,
};
export const unescapeSelector: Dynamic = (
  selector?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic => selector.replace(/\\(.)/g, "$1");
export function parsePreviewForm(
  code?: Dynamic,
  chainMode?: Dynamic,
  ..._unusedPreviewFormArgs: Dynamic[]
): Dynamic {
  let offset: Dynamic = (code.match(/^\s*/) || [""])[0].length;
  offset += (code.slice(offset).match(PREVIEW_PATTERNS.assign) || [""])[0]
    .length;
  let remaining: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic =>
    code.slice(offset);
  let match: Dynamic;
  if ((match = remaining().match(PREVIEW_PATTERNS.make))) {
    let literalOffset: Dynamic = offset + match[0].length;
    let usesJquery: Dynamic = match[0][0] === "$";
    let literal: Dynamic = readStringLiteral(code, literalOffset);
    if (!literal) return null;
    let firstCharacter: Dynamic = (literal.value.match(/^\s*(\S)/) || [])[1];
    if (firstCharacter === undefined) return literal.closed ? null : undefined;
    if (!usesJquery || firstCharacter === "<")
      return {
        method: usesJquery ? "create" : "add",
        at: literalOffset,
        steps: null,
      };
  }
  let steps: Dynamic = [];
  if (chainMode && remaining()[0] === ".") {
    steps.push(["prev"]);
    match = [""];
  } else if ((match = remaining().match(PREVIEW_PATTERNS.sel))) {
    let selectorLiteral: Dynamic = readStringLiteral(
      code,
      offset + match[0].indexOf(match[1]),
    );
    if (!selectorLiteral || !selectorLiteral.closed || /^\s*</.test(selectorLiteral.value)) return null;
    steps.push(["$", selectorLiteral.value]);
  } else if ((match = remaining().match(PREVIEW_PATTERNS.all)))
    steps.push(["files"]);
  else if ((match = remaining().match(PREVIEW_PATTERNS.me)))
    steps.push(["me"]);
  else if ((match = remaining().match(PREVIEW_PATTERNS.k)))
    steps.push(["k", match[1].replace(/['"]/g, " ")]);
  else if ((match = remaining().match(PREVIEW_PATTERNS.file)))
    steps.push(["file", unescapeSelector(match[2])]);
  else
    return code.length - offset < 80 &&
      /^[$\w.]*\(?\s*['"]?[^'"]*$/.test(remaining())
      ? undefined
      : null;
  offset += match[0].length;
  while ((match = remaining().match(PREVIEW_PATTERNS.step))) {
    steps.push([
      match[1],
      match[3] !== undefined
        ? unescapeSelector(match[3])
        : match[4] !== undefined
          ? +match[4]
          : undefined,
    ]);
    offset += match[0].length;
  }
  if ((match = remaining().match(PREVIEW_PATTERNS.into)))
    return {
      method: match[1],
      at: offset + match[0].length,
      steps: steps,
    };
  return /^\s*(?:\.\w*(?:\(\s*(?:['"][^'"\n]*|-?\d*)?\s*)?)?$/.test(
    remaining(),
  )
    ? undefined
    : null;
}
export function readStringLiteral(
  code?: Dynamic,
  start?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  let quote: Dynamic = code[start];
  let escapes: Dynamic = {
    n: `
`,
    t: "\t",
    r: "\r",
    b: "\b",
    f: "\f",
    v: "\v",
    0: "\x00",
  };
  let literalText: Dynamic = "";
  for (let index: Dynamic = start + 1; index < code.length; index++) {
    let character: Dynamic = code[index];
    if (character === "\\") {
      let escapedCharacter: Dynamic = code[++index];
      if (escapedCharacter === undefined) break;
      if (escapedCharacter === "u" || escapedCharacter === "x") {
        let hexLength: Dynamic = escapedCharacter === "x" ? 2 : 4;
        let hexDigits: Dynamic = code.slice(index + 1, index + 1 + hexLength);
        if (code[index + 1] === "{") {
          let braceEnd: Dynamic = code.indexOf("}", index);
          if (braceEnd < 0) break;
          literalText += String.fromCodePoint(
            parseInt(code.slice(index + 2, braceEnd), 16) || 65533,
          );
          index = braceEnd;
          continue;
        }
        if (hexDigits.length < hexLength) break;
        literalText += String.fromCharCode(parseInt(hexDigits, 16) || 65533);
        index += hexLength;
        continue;
      }
      literalText +=
        escapedCharacter ===
        `
`
          ? ""
          : escapes[escapedCharacter] !== undefined
            ? escapes[escapedCharacter]
            : escapedCharacter;
      continue;
    }
    if (character === quote)
      return {
        value: literalText,
        closed: true,
        end: index,
      };
    if (quote === "`" && character === "$") {
      if (code[index + 1] === "{") return null;
      if (code[index + 1] === undefined) break;
    }
    if (
      quote !== "`" &&
      character ===
        `
`
    )
      return null;
    literalText += character;
  }
  return {
    value: literalText,
    closed: false,
  };
}
