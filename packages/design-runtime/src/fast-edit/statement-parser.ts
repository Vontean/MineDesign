/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { fromParserHtml } from "../editor/html/authoring";
import { camelToKebabCss, toParserHtml } from "../editor/html/tag-normalization";
import { validatePageColor } from "./page-style";
import { splitStyleDeclarations } from "./template-validation";

var splitCssPropertyValue: Dynamic;
var joinCssDeclarations: Dynamic;
var PAGE_STYLE_PROPERTY_ALIASES: Dynamic;
var BLOCK_LAYOUT_ELEMENT_TAGS: Dynamic;
var OWNED_ELEMENT_ID_PREFIX: Dynamic;
var OWNED_ELEMENT_ID_PATTERN: Dynamic;
var PARTIAL_INSERTION_METHODS: Dynamic;
var READONLY_JQUERY_CHAIN_METHODS: Dynamic;
var TARGET_JQUERY_INSERTION_METHODS: Dynamic;
var HTML_INSERTION_METHODS: Dynamic;
var isOutsideArtboardSelector: Dynamic;
function parseScopedTemplate(html?: Dynamic): Dynamic {
  let template: Dynamic = (document as Dynamic).createElement("template");
  template.innerHTML = toParserHtml(html);
  return template;
}
function mapFastEditCssChanges(
  before?: Dynamic,
  after?: Dynamic,
  prefix?: Dynamic,
  families?: Dynamic,
  styleOptions?: Dynamic,
): Dynamic {
  let changes: Dynamic = [];
  try {
    let callback: Dynamic = (declaration?: Dynamic): Dynamic =>
        camelToKebabCss(
          declaration.slice(0, Math.max(0, declaration.indexOf(":"))).trim(),
        ).toLowerCase(),
      readStyleDeclarations: Dynamic = (element?: Dynamic): Dynamic =>
        splitStyleDeclarations(
          element?.getAttribute("style") ?? "",
        ),
      matchesViewportSize: Dynamic = (
        cssValue?: Dynamic,
        expected?: Dynamic,
        minimum?: Dynamic,
      ): Dynamic =>
        cssValue === "100%" ||
        cssValue === expected ||
        (cssValue !== undefined &&
          /^\d+(\.\d+)?px$/.test(cssValue) &&
          parseFloat(cssValue) >= minimum),
      rewriteBackgroundStyles: Dynamic = (declarations?: Dynamic): Dynamic => {
        let entries: Dynamic = new Map(
          readStyleDeclarations(declarations).map(
            (declaration?: Dynamic): Dynamic => [
              callback(declaration),
              splitCssPropertyValue(declaration)[1].toLowerCase(),
            ],
          ),
        );
        return (
          ![
            "max-width",
            "max-height",
            "max-inline-size",
            "max-block-size",
            "inline-size",
            "block-size",
          ].some((propertyName?: Dynamic): Dynamic => entries.has(propertyName)) &&
          matchesViewportSize(entries.get("width"), "100vw", styleOptions.w) &&
          (matchesViewportSize(entries.get("height"), "100vh", styleOptions.h) ||
            matchesViewportSize(entries.get("min-height"), "100vh", styleOptions.h))
        );
      },
      injectBackgroundColor: Dynamic = (declarations?: Dynamic, backgroundColor?: Dynamic): Dynamic => {
        let isBackgroundAlias: Dynamic = (declaration?: Dynamic): Dynamic =>
            PAGE_STYLE_PROPERTY_ALIASES.background.includes(callback(declaration)),
          isBackgroundColor: Dynamic = (declaration?: Dynamic): Dynamic =>
            callback(declaration) === "background" &&
            validatePageColor(
              splitCssPropertyValue(declaration)[1],
            ) === null,
          backgroundIndex: Dynamic = declarations.map(isBackgroundColor).lastIndexOf(true),
          rewrittenDeclarations: Dynamic = declarations.map(
            (declaration?: Dynamic): Dynamic =>
              isBackgroundAlias(declaration) && !isBackgroundColor(declaration)
                ? callback(declaration) + ": " + backgroundColor
                : declaration,
          );
        backgroundIndex >= 0 &&
          !declarations.slice(backgroundIndex + 1).some(isBackgroundAlias) &&
          rewrittenDeclarations.splice(backgroundIndex + 1, 0, "background-color: " + backgroundColor);
        return rewrittenDeclarations;
      },
      findTemplateRoot: Dynamic = (element?: Dynamic): Dynamic =>
        element.content.children.length === 1
          ? element.content.children[0]
          : undefined,
      value: Dynamic = parseScopedTemplate(after),
      templateRoot: Dynamic = findTemplateRoot(value),
      beforeRoot: Dynamic = findTemplateRoot(parseScopedTemplate(before));
    if (
      templateRoot === undefined ||
      !(
        rewriteBackgroundStyles(templateRoot) ||
        (BLOCK_LAYOUT_ELEMENT_TAGS.has(templateRoot.localName) &&
          !readStyleDeclarations(templateRoot).some(
            (styleElement?: Dynamic): Dynamic =>
              PAGE_STYLE_PROPERTY_ALIASES.background.includes(
                callback(styleElement),
              ),
          ))
      )
    )
      return {
        text: after,
        own: changes,
      };
    let flag: Dynamic = false;
    for (let styleKey of ["background", "color", "font"] as Dynamic) {
      let stylePrefix: Dynamic = prefix[styleKey],
        hasStyleFamily: Dynamic = (propertyName?: Dynamic): Dynamic =>
          PAGE_STYLE_PROPERTY_ALIASES[styleKey].includes(callback(propertyName)),
        styleDeclarations: Dynamic = readStyleDeclarations(templateRoot),
        hasStyleFamilyMatch: Dynamic = styleDeclarations.some(hasStyleFamily);
      if (stylePrefix !== undefined) {
        if (
          styleDeclarations
            .filter(hasStyleFamily)
            .map((declaration?: Dynamic): Dynamic => declaration.trim())
            .join(";") !==
          readStyleDeclarations(beforeRoot)
            .filter(hasStyleFamily)
            .map((declaration?: Dynamic): Dynamic => declaration.trim())
            .join(";")
        ) {
          changes.push(styleKey);
          continue;
        }
        (!hasStyleFamilyMatch && !families.includes(styleKey)) ||
          (templateRoot.setAttribute(
            "style",
            joinCssDeclarations(
              hasStyleFamilyMatch
                ? styleKey === "background"
                  ? injectBackgroundColor(styleDeclarations, stylePrefix)
                  : styleDeclarations.map(
                      (declaration?: Dynamic): Dynamic =>
                        hasStyleFamily(declaration)
                          ? callback(declaration) + ": " + stylePrefix
                          : declaration,
                    )
                : [
                    ...styleDeclarations,
                    PAGE_STYLE_PROPERTY_ALIASES[styleKey][0] + ": " + stylePrefix,
                  ],
            ),
          ),
          (flag = true));
      }
    }
    return {
      text: flag ? fromParserHtml(value.innerHTML) : after,
      own: changes,
    };
  } catch {
    return {
      text: after,
      own: [],
    };
  }
}
function collectOwnedElementIds(htmls?: Dynamic): Dynamic {
  let pattern: Dynamic = new RegExp(
    "(?<![\\w-])" + OWNED_ELEMENT_ID_PATTERN + "(?![\\w-])",
    "g",
  );
  return new Set(
    htmls.flatMap((html?: Dynamic): Dynamic => html.match(pattern) ?? []),
  );
}
function nextHandleSequence(htmls?: Dynamic, prefix?: Dynamic): Dynamic {
  let pattern: Dynamic = new RegExp("^" + prefix + "(\\d{1,6})$"),
    next: Dynamic = 0;
  for (let value of htmls as Dynamic) {
    let templateElement: Dynamic = (document as Dynamic).createElement("template");
    templateElement.innerHTML = toParserHtml(value);
    for (let element of Array.from(
      templateElement.content.querySelectorAll("[id]"),
    ) as Dynamic)
      next = Math.max(
        next,
        Number(pattern.exec(element.getAttribute("id") ?? "")?.[1] ?? 0),
      );
  }
  return next;
}
function adoptHandleIds(
  html?: Dynamic,
  prefix?: Dynamic,
  sequence?: Dynamic,
  reservedIdOptions?: Dynamic,
  reservedIds: Dynamic = new Set(),
): Dynamic {
  let availableOwnedId: Dynamic = (baseId?: Dynamic): Dynamic => {
      let candidateId: Dynamic = OWNED_ELEMENT_ID_PREFIX + baseId;
      for (let count: Dynamic = 2; reservedIds.has(candidateId); count++)
        candidateId = OWNED_ELEMENT_ID_PREFIX + baseId + "_" + String(count);
      return candidateId;
    },
    htmlLength: Dynamic = html.length;
  if (!reservedIdOptions) {
    let length: Dynamic = /\d{0,6}$/.exec(html)![0].length,
      prefixText: Dynamic = html.slice(0, htmlLength - length);
    for (let prefixLength: Dynamic = prefix.length; prefixLength > 0; prefixLength--)
      if (
        (length === 0 || prefixLength === prefix.length) &&
        prefixText.endsWith(prefix.slice(0, prefixLength))
      ) {
        htmlLength -= length + prefixLength;
        break;
      }
  }
  let values: Dynamic = new Set(),
    value: Dynamic = prefix + "(\\d{1,6})(?![A-Za-z0-9_-])",
    text: Dynamic = "",
    index: Dynamic = 0;
  for (let match of html.matchAll(
    new RegExp(
      `((?<![\\w-])[iI][dD]\\s*=\\s*\\\\?["'])` +
        value +
        `|(#|\\[\\s*[iI][dD]\\s*=\\s*\\\\?["']?)` +
        value,
      "g",
    ),
  ) as Dynamic) {
    let [fullMatch, matchPrefix, sequenceText, suffix, suffixSequence]: Dynamic = match;
    if (match.index + fullMatch.length > htmlLength) break;
    matchPrefix !== undefined &&
      sequenceText !== undefined &&
      Number(sequenceText) > sequence &&
      values.add(sequenceText);
    text +=
      html.slice(index, match.index) +
      (matchPrefix !== undefined && sequenceText !== undefined
        ? Number(sequenceText) > sequence
          ? matchPrefix + availableOwnedId(sequenceText)
          : fullMatch
        : suffix !== undefined && suffixSequence !== undefined && values.has(suffixSequence)
          ? suffix + availableOwnedId(suffixSequence)
          : fullMatch);
    index = match.index + fullMatch.length;
  }
  return text + html.slice(index, htmlLength);
}
function isIncompleteInsertionStatement(
  text?: Dynamic,
  complete?: Dynamic,
): Dynamic {
  let lastDot: Dynamic = text.lastIndexOf("."),
    partialMethod: Dynamic = lastDot < 0 ? "" : text.slice(lastDot);
  return (
    !complete &&
    lastDot >= 0 &&
    PARTIAL_INSERTION_METHODS.some(
      (items?: Dynamic): Dynamic =>
        items.startsWith(partialMethod) ||
        (partialMethod.startsWith(items) &&
          /^\s*[`'"]?$/.test(partialMethod.slice(items.length))),
    )
      ? text.slice(0, lastDot)
      : text
  ).replace(
    /(\$\(\s*(?:'[^'<\n][^'\n]*'|"[^"<\n][^"\n]*"|`[^`<\n][^`\n]*`)\s*\))\.insert(After|Before)\((?=\s*[`'"]<)/g,
    (name?: Dynamic, objectName?: Dynamic, methodName?: Dynamic): Dynamic =>
      objectName + "." + methodName.toLowerCase() + "(",
  );
}
function parseAppendedArtboardSection(statement?: Dynamic): Dynamic {
  let sectionMatch: Dynamic =
    /^\s*<section((?:\s+[\w:-]+(?:\s*=\s*(?:"[^"]*"|'[^']*'))?)*)\s*>/.exec(
      statement,
    );
  if (
    sectionMatch === null ||
    !/<\/section>\s*$/.test(statement) ||
    statement.split(/<section[\s>]/i).length !== 2 ||
    statement.split(/<\/section>/i).length !== 2
  )
    return null;
  let value: Dynamic = Array.from(
    sectionMatch[1].matchAll(
      /\s+([\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g,
    ),
  )
    .filter((attribute?: Dynamic): Dynamic => attribute[1].toLowerCase() === "id")
    .map((attributeMatch?: Dynamic): Dynamic => attributeMatch[2] ?? attributeMatch[3] ?? "");
  return value.length === 1 && /^[A-Za-z][\w-]*$/.test(value[0])
    ? value[0]
    : null;
}
function classifyFastEditStatement(
  statement?: Dynamic,
  complete?: Dynamic,
  target?: Dynamic,
  html?: Dynamic,
): Dynamic {
  let pendingResult: Dynamic = complete ? "aim" : "wait",
    classifyChain: Dynamic = (items?: Dynamic): Dynamic => {
      let chainMatch: Dynamic = /^\s*\.([A-Za-z]*)/.exec(items);
      return chainMatch === null
        ? /^\s*$/.test(items)
          ? pendingResult
          : "aim"
        : chainMatch[0].length === items.length
          ? pendingResult
          : items[chainMatch[0].length] === "("
            ? {
                name: chainMatch[1],
                to: chainMatch[0].length + 1,
              }
            : "aim";
    },
    value: Dynamic = classifyChain(statement);
  if (typeof value == "string") return value;
  if (TARGET_JQUERY_INSERTION_METHODS.has(value.name)) return "leave";
  if (
    !READONLY_JQUERY_CHAIN_METHODS.has(value.name) &&
    !HTML_INSERTION_METHODS.has(value.name)
  )
    return "aim";
  let statementBody: Dynamic = statement.slice(value.to).replace(/^\s+/, ""),
    statementPrefix: Dynamic = statementBody[0];
  if (statementPrefix === undefined) return pendingResult;
  if (HTML_INSERTION_METHODS.has(value.name)) {
    let sectionPrefix: Dynamic =
      statementPrefix === "`" || statementPrefix === "'" || statementPrefix === '"'
        ? statementBody.slice(1).replace(/^\s+/, "")
        : "x";
    return sectionPrefix.length < 9 && "<section".startsWith(sectionPrefix.slice(0, 8))
      ? pendingResult
      : /^<section[\s>]/.test(sectionPrefix)
        ? "leave"
        : "aim";
  }
  let selector: Dynamic = null,
    selectorBody: Dynamic = statementBody.slice(1);
  if (statementPrefix !== ")") {
    if (statementPrefix !== "`" && statementPrefix !== "'" && statementPrefix !== '"') return "aim";
    let count: Dynamic = 1;
    for (
      ;
      count < statementBody.length &&
      statementBody[count] !== statementPrefix &&
      statementBody[count] !== "\\" &&
      statementBody[count] !==
        `
`;

    )
      count += 1;
    if (count === statementBody.length) return pendingResult;
    if (statementBody[count] !== statementPrefix) return "aim";
    let selectorTail: Dynamic = statementBody.slice(count + 1).replace(/^\s+/, "");
    if (selectorTail === "") return pendingResult;
    if (selectorTail[0] !== ")") return "aim";
    selector = statementBody.slice(1, count).trim();
    selectorBody = selectorTail.slice(1);
  }
  if (
    selector !== null &&
    (isOutsideArtboardSelector(selector, target, html) ||
      (value.name === "children" &&
        (selector === ":last-child" || selector === ":last")))
  )
    return "leave";
  if (
    !(value.name === "children"
      ? selector === null || selector === "section"
      : selector === "section" || selector === "> section")
  )
    return "aim";
  let chainResult: Dynamic = classifyChain(selectorBody);
  if (typeof chainResult == "string") return chainResult;
  let closingParenIndex: Dynamic = selectorBody.indexOf(")", chainResult.to),
    remainingSelector: Dynamic = selectorBody
      .slice(chainResult.to, closingParenIndex < 0 ? undefined : closingParenIndex + 1)
      .replace(/\s+/g, "");
  return chainResult.name !== "eq"
    ? chainResult.name !== "last"
      ? "aim"
      : remainingSelector === ""
        ? pendingResult
        : remainingSelector[0] === ")"
          ? "leave"
          : "aim"
    : remainingSelector.length < 3 && "-1)".startsWith(remainingSelector)
      ? pendingResult
      : remainingSelector.startsWith("-1)")
        ? "leave"
        : "aim";
}
function rewriteContainerAppendStatements(
  reply?: Dynamic,
  target?: Dynamic,
  newline: Dynamic = `
`,
): Dynamic {
  let appendPattern: Dynamic =
      /^[ \t]*\$\(\s*(['"])#container\1\s*\)\s*\.append\(\s*/gm,
    replyLength: Dynamic = reply.length,
    rewritten: Dynamic = "",
    offset: Dynamic = 0;
  for (
    let value: Dynamic = appendPattern.exec(reply);
    value !== null;
    value = appendPattern.exec(reply)
  ) {
    let lastIndex: Dynamic = appendPattern.lastIndex,
      quote: Dynamic = reply[lastIndex] ?? "";
    if (quote !== "`" && quote !== "'" && quote !== '"') continue;
    let scanIndex: Dynamic = lastIndex + 1;
    for (
      ;
      scanIndex < replyLength &&
      reply[scanIndex] !== quote &&
      reply[scanIndex] !== "\\" &&
      !(quote === "`"
        ? reply[scanIndex] === "$" && reply[scanIndex + 1] === "{"
        : reply[scanIndex] ===
          `
`);

    )
      scanIndex += 1;
    appendPattern.lastIndex = scanIndex;
    if (scanIndex >= replyLength) break;
    let matchStart: Dynamic =
        reply[scanIndex] === quote
          ? /^\s*\)(\s*)\.(?!\d)/.exec(reply.slice(scanIndex + 1))
          : null,
      matchEnd: Dynamic =
        matchStart === null
          ? null
          : parseAppendedArtboardSection(reply.slice(lastIndex + 1, scanIndex));
    if (matchStart === null || matchEnd === null) continue;
    let statementEnd: Dynamic = scanIndex + matchStart[0].length,
      statementKind: Dynamic = classifyFastEditStatement(
        reply.slice(statementEnd),
        target,
        matchEnd,
        reply.slice(lastIndex + 1, scanIndex),
      );
    if (statementKind === "wait") return rewritten + reply.slice(offset, statementEnd);
    appendPattern.lastIndex = statementEnd;
    statementKind !== "leave" &&
      ((rewritten +=
        reply.slice(offset, statementEnd) +
        (matchStart[1].includes(`
`)
          ? ""
          : newline) +
        "$('#" +
        matchEnd +
        "')"),
      (offset = statementEnd));
  }
  return rewritten + reply.slice(offset);
}
function resolveOwnedElementIdCollisions(
  before?: Dynamic,
  after?: Dynamic,
  prefix?: Dynamic,
): Dynamic {
  if (!after.includes(' id="' + OWNED_ELEMENT_ID_PREFIX)) return after;
  let usedIds: Dynamic = collectOwnedElementIds([before]),
    replacements: Dynamic = new Map(
      Array.from(
        after.matchAll(
          new RegExp(' id="(' + OWNED_ELEMENT_ID_PATTERN + ')"', "g"),
        ),
        (match?: Dynamic): Dynamic => [match[2], match[1]],
      ).filter(
        ([, id]: Dynamic): Dynamic => !(prefix ?? usedIds).has(id),
      ),
    ),
    value: Dynamic = after.replace(
      /(?<![\w-])k(?:[a-z]{2})?(\d{1,6})(?![\w-])/g,
      (sourceValue?: Dynamic, replacementId?: Dynamic): Dynamic =>
        replacements.get(replacementId) ?? sourceValue,
    ),
    templateElement: Dynamic = (document as Dynamic).createElement("template");
  templateElement.innerHTML = toParserHtml(value);
  let callback: Dynamic = (id?: Dynamic): Dynamic =>
      (
        value.match(new RegExp("(?<![\\w-])" + id + "(?![\\w-])", "g")) ??
        []
      ).length,
    entries: Dynamic = new Map(),
    ownedIdPattern: Dynamic = new RegExp("^" + OWNED_ELEMENT_ID_PATTERN + "$"),
    scanElement: Dynamic = (element?: Dynamic): Dynamic => {
      for (let elementNode of Array.from(element.querySelectorAll("*")) as Dynamic) {
        let elementId: Dynamic = elementNode.getAttribute("id") ?? "";
        ownedIdPattern.test(elementId) &&
          entries.set(elementId, [...(entries.get(elementId) ?? []), elementNode]);
        let content: Dynamic = elementNode.content;
        content !== undefined && scanElement(content);
      }
    };
  scanElement(templateElement.content);
  let flag: Dynamic = false;
  for (let [duplicateId, duplicateNodes] of entries as Dynamic)
    if (!usedIds.has(duplicateId) && callback(duplicateId) <= duplicateNodes.length) {
      for (let duplicateNode of duplicateNodes as Dynamic) duplicateNode.removeAttribute("id");
      flag = true;
    }
  return flag ? fromParserHtml(templateElement.innerHTML) : value;
}
export {
  adoptHandleIds,
  BLOCK_LAYOUT_ELEMENT_TAGS,
  classifyFastEditStatement,
  collectOwnedElementIds,
  HTML_INSERTION_METHODS,
  isIncompleteInsertionStatement,
  isOutsideArtboardSelector,
  joinCssDeclarations,
  mapFastEditCssChanges,
  nextHandleSequence,
  OWNED_ELEMENT_ID_PATTERN,
  OWNED_ELEMENT_ID_PREFIX,
  PAGE_STYLE_PROPERTY_ALIASES,
  parseAppendedArtboardSection,
  parseScopedTemplate,
  PARTIAL_INSERTION_METHODS,
  READONLY_JQUERY_CHAIN_METHODS,
  resolveOwnedElementIdCollisions,
  rewriteContainerAppendStatements,
  splitCssPropertyValue,
  TARGET_JQUERY_INSERTION_METHODS,
};
export function installFastEditStatementParser(): () => void {
  return () => {
    splitCssPropertyValue = (declarations?: Dynamic): Dynamic => {
      let value: Dynamic = declarations.indexOf(":");
      return value < 0
        ? ["", declarations.trim()]
        : [
            declarations.slice(0, value).trim().toLowerCase(),
            declarations.slice(value + 1).trim(),
          ];
    };
    joinCssDeclarations = (declarations?: Dynamic): Dynamic =>
      declarations
        .map((declaration?: Dynamic): Dynamic => declaration.trim())
        .filter((declaration?: Dynamic): Dynamic => declaration !== "")
        .join("; ");
    PAGE_STYLE_PROPERTY_ALIASES = {
      background: ["background", "background-color"],
      color: ["color"],
      font: ["font-family"],
    };
    BLOCK_LAYOUT_ELEMENT_TAGS = new Set([
      "div",
      "section",
      "main",
      "article",
      "header",
      "footer",
      "aside",
      "nav",
    ]);
    OWNED_ELEMENT_ID_PREFIX = "own";
    OWNED_ELEMENT_ID_PATTERN =
      OWNED_ELEMENT_ID_PREFIX + "(\\d{1,6})(?:_\\d{1,6})?";
    PARTIAL_INSERTION_METHODS = [".insertAfter(", ".insertBefore("];
    READONLY_JQUERY_CHAIN_METHODS = new Set(["find", "children"]);
    TARGET_JQUERY_INSERTION_METHODS = new Set([
      "appendTo",
      "prependTo",
      "insertAfter",
      "insertBefore",
      "replaceAll",
    ]);
    HTML_INSERTION_METHODS = new Set(["append", "prepend", "after", "before"]);
    isOutsideArtboardSelector = (
      selectorText?: Dynamic,
      expectedTag?: Dynamic,
      selectorPattern?: Dynamic,
    ): Dynamic => {
      let values: Dynamic = new Set(
        Array.from(
          selectorPattern.matchAll(
            /\sid\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi,
          ),
          (match?: Dynamic): Dynamic =>
            match[1] ?? match[2] ?? match[3] ?? "",
        ),
      );
      return (
        !/[[\]()"']/.test(selectorText) &&
        selectorText.split(",").every((selector?: Dynamic): Dynamic => {
          let value: Dynamic = /^#([A-Za-z][\w-]*)/.exec(selector.trim())?.[1];
          return (
            value !== undefined && (value === expectedTag || !values.has(value))
          );
        })
      );
    };
  };
}
