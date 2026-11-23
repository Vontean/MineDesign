import type { Dynamic } from "./types";
/** 流式预览：补全未闭合标签里的 SVG data URL。扫描进度存在传入的 previewState.g。 */
export const HTML_ENTITIES: Dynamic = {
  "&quot;": '"',
  "&#39;": "'",
  "&apos;": "'",
  "&lt;": "<",
  "&gt;": ">",
};
export const UNSAFE_SVG_ELEMENTS: Dynamic = new Set([
  "style",
  "script",
  "foreignobject",
  "text",
]);
export const VOID_ELEMENTS: Dynamic = new Set([
  "img",
  "input",
  "br",
  "hr",
  "source",
  "embed",
]);
export function completeSvgDataUrl(
  html?: Dynamic,
  tagStart?: Dynamic,
  previewState?: Dynamic,
  ..._unusedCompleteSvgArgs: Dynamic[]
): Dynamic {
  let scanner: Dynamic = previewState.g;
  if (scanner === null) return null;
  let abandon: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic => {
    previewState.g = null;
    return null;
  };
  if (scanner && scanner.from !== tagStart) return abandon();
  if (!scanner) {
    let attributeMatch: Dynamic =
      /^<([A-Za-z][\w-]*)((?:\s+[\w:-]+(?:=(?:"[^"]*"|'[^']*'))?)*)\s+[\w:-]+=(["'])/.exec(
        html.slice(tagStart),
      );
    if (!attributeMatch) return html.length - tagStart > 400 ? abandon() : null;
    let attributeStart: Dynamic = tagStart + attributeMatch[0].length;
    let slice: Dynamic = html.slice(attributeStart);
    if (slice.includes(attributeMatch[3])) return abandon();
    let svgUrlMatch: Dynamic =
      /url\(\s*(&quot;|&#39;|&apos;|'|")data:image\/svg\+xml((?:;[\w=-]+)*),/i.exec(
        slice,
      );
    if (!svgUrlMatch) return slice.length > 2000 ? abandon() : null;
    if (
      /;base64/i.test(svgUrlMatch[2]) ||
      /url\(/i.test(slice.slice(0, svgUrlMatch.index))
    )
      return abandon();
    scanner = previewState.g = {
      from: tagStart,
      i: attributeStart + svgUrlMatch.index + svgUrlMatch[0].length,
      Q: svgUrlMatch[1],
      aq: attributeMatch[3],
      depth: 0,
      tag: 0,
      q: "",
      name: "",
      closing: false,
      slash: false,
      cut: -1,
      done: false,
      was: -2,
      out: null,
      s0: attributeStart + svgUrlMatch.index + svgUrlMatch[0].length,
      tail:
        svgUrlMatch[1] +
        ")" +
        attributeMatch[3] +
        ">" +
        (VOID_ELEMENTS.has(attributeMatch[1].toLowerCase())
          ? ""
          : "</" + attributeMatch[1] + ">"),
    };
  }
  while (scanner.i < html.length && !scanner.done) {
    let decodedCharacter: Dynamic = html[scanner.i];
    let count: Dynamic = 1;
    let sourceToken: Dynamic = decodedCharacter;
    if (decodedCharacter === "&") {
      let match: Dynamic = Object.keys(HTML_ENTITIES).find(
        (entity?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          html.startsWith(entity, scanner.i),
      );
      if (match) {
        decodedCharacter = HTML_ENTITIES[match];
        count = match.length;
        sourceToken = match;
      } else if (html.length - scanner.i < 6) break;
    }
    if (sourceToken === scanner.Q || sourceToken === scanner.aq) return abandon();
    if (scanner.i - scanner.s0 > 12000) return abandon();
    if (!scanner.tag) {
      if (decodedCharacter === "<") {
        let svgTagMatch: Dynamic = /^(\/?)([A-Za-z][\w:.-]*)(?=[\s/>]|&gt;)/.exec(
          html.slice(scanner.i + count, scanner.i + count + 40),
        );
        if (!svgTagMatch) {
          if (
            html.length - scanner.i - count < 40 &&
            /^\/?[\w:.-]*$/.test(html.slice(scanner.i + count))
          )
            break;
          return abandon();
        }
        if (
          ((scanner.name = svgTagMatch[2].toLowerCase()),
          (scanner.closing = svgTagMatch[1] === "/"),
          UNSAFE_SVG_ELEMENTS.has(scanner.name) ||
            (scanner.depth === 0 &&
              (scanner.closing || scanner.name !== "svg")))
        )
          return abandon();
        scanner.tag = 1;
        scanner.slash = false;
        scanner.i += count + svgTagMatch[0].length;
        continue;
      }
    } else if (scanner.q) {
      if (decodedCharacter === scanner.q) scanner.q = "";
    } else if (decodedCharacter === '"' || decodedCharacter === "'") scanner.q = decodedCharacter;
    else if (decodedCharacter === "<") return abandon();
    else if (decodedCharacter === ">") {
      if (((scanner.tag = 0), scanner.closing)) scanner.depth--;
      else if (!scanner.slash) scanner.depth++;
      if (scanner.depth < 0) return abandon();
      if (scanner.depth === 1) scanner.cut = scanner.i + count;
      if (scanner.depth === 0) {
        scanner.cut = scanner.i + count;
        scanner.done = true;
      }
    } else scanner.slash = decodedCharacter === "/";
    scanner.i += count;
  }
  if (scanner.cut < 0) return null;
  if (scanner.was !== scanner.cut) {
    scanner.was = scanner.cut;
    scanner.out =
      html.slice(tagStart, scanner.cut) +
      (scanner.done ? "" : "</svg>") +
      scanner.tail;
  }
  return scanner.out;
}
