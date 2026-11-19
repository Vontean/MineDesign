/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { camelToKebabCss, compileTemplateExpression, HtmlTagNormalizationFromEntriesValue, HtmlTagNormalizationSubscribers, kebabToCamelCase, ScCamelValue } from "../editor/html/tag-normalization";
import { evaluateTemplateExpression } from "../editor/template-expressions";
import { isDesignRuntimeSource } from "./asset-resolver";

var exportNonRenderedTags: Dynamic;
var exportSafeContentSelector: Dynamic;
var cssIdentifierTokenPattern: Dynamic;
var unsafeCssPropertyPattern: Dynamic;
var cssWhitespacePattern: Dynamic;
var rootCssSelectorPattern: Dynamic;
var cssCustomPropertyNamePattern: Dynamic;
var cssCustomPropertyDeclarationPattern: Dynamic;
var cssCustomPropertyReferencePattern: Dynamic;
var exportMetadataTagPattern: Dynamic;
var staticCssDeclarationAtRulePattern: Dynamic;
var dynamicCssMutationPattern: Dynamic;
var interpolatedCssPropertyPattern: Dynamic;
var externalExportAssetPattern: Dynamic;
var cssAssetUuidPattern: Dynamic;
var unresolvedCssKeywordPattern: Dynamic;
var cssVariablePrefixBoundaryPattern: Dynamic;
var cssVariableSuffixBoundaryPattern: Dynamic;
var staticTemplateExpressionPattern: Dynamic;
var staticExportAttribute: Dynamic;
var forbiddenStaticExportTagPattern: Dynamic;
var dynamicStaticExportAttributePattern: Dynamic;
var staticExportIdSuffix: Dynamic;
var exportSvgNamespace: Dynamic;
var exportHtmlNamespace: Dynamic;
var staticTemplateLiteralKeywords: Dynamic;
var maxStaticExportTemplateLength: Dynamic;
var importantVisibleCssPattern: Dynamic;
var dynamicStaticExportTagPattern: Dynamic;
function removeUnsafeCssDeclarations(css?: Dynamic): Dynamic {
  let text: Dynamic = "",
    index: Dynamic = 0,
    bracketDepth: Dynamic = 0,
    flag: Dynamic = true,
    length: Dynamic = css.length;
  for (; index < length; ) {
    if (flag) {
      let cursor: Dynamic = index;
      for (; cursor < length && cssWhitespacePattern.test(css[cursor]); )
        cursor++;
      if (css[cursor] === "/" && css[cursor + 1] === "*") {
        let commentEnd: Dynamic = css.indexOf("*/", cursor + 2),
          nextIndex: Dynamic = commentEnd < 0 ? length : commentEnd + 2;
        text += css.slice(index, nextIndex);
        index = nextIndex;
        continue;
      }
      flag = false;
      cssIdentifierTokenPattern.lastIndex = cursor;
      let identifierMatch: Dynamic = cssIdentifierTokenPattern.exec(css);
      if (identifierMatch) {
        let afterIdentifier: Dynamic = cursor + identifierMatch[0].length;
        for (;;) {
          for (; afterIdentifier < length && cssWhitespacePattern.test(css[afterIdentifier]); )
            afterIdentifier++;
          if (css[afterIdentifier] !== "/" || css[afterIdentifier + 1] !== "*") break;
          let commentEnd: Dynamic = css.indexOf("*/", afterIdentifier + 2);
          afterIdentifier = commentEnd < 0 ? length : commentEnd + 2;
        }
        if (css[afterIdentifier] === ":") {
          let propertyName: Dynamic = camelToKebabCss(identifierMatch[0]);
          text +=
            css.slice(index, cursor) +
            (unsafeCssPropertyPattern.test(propertyName) ? identifierMatch[0] : propertyName);
          index = cursor + identifierMatch[0].length;
          continue;
        }
      }
    }
    let value: Dynamic = css[index];
    if (value === '"' || value === "'") {
      let valueStart: Dynamic = index + 1;
      for (; valueStart < length && css[valueStart] !== value; )
        valueStart += css[valueStart] === "\\" ? 2 : 1;
      text += css.slice(index, valueStart + 1);
      index = valueStart + 1;
      continue;
    }
    if (value === "/" && css[index + 1] === "*") {
      let commentEnd: Dynamic = css.indexOf("*/", index + 2),
        afterComment: Dynamic = commentEnd < 0 ? length : commentEnd + 2;
      text += css.slice(index, afterComment);
      index = afterComment;
      continue;
    }
    if (value === "\\") {
      text += css.slice(index, index + 2);
      index += 2;
      continue;
    }
    value === "(" || value === "{" || value === "["
      ? bracketDepth++
      : value === ")" || value === "}" || value === "]"
        ? (bracketDepth = Math.max(0, bracketDepth - 1))
        : value === ";" && bracketDepth === 0 && (flag = true);
    text += value;
    index++;
  }
  return text;
}
function parseExportTweakMetadata(json?: Dynamic): Dynamic {
  if (!json)
    return {
      props: null,
      preview: null,
    };
  let value: Dynamic;
  try {
    value = JSON.parse(json);
  } catch {
    return {
      props: null,
      preview: null,
    };
  }
  if (!value || typeof value != "object" || Array.isArray(value))
    return {
      props: null,
      preview: null,
    };
  let metadata: Dynamic = value,
    previewMetadata: Dynamic =
      metadata.$preview && typeof metadata.$preview == "object"
        ? metadata.$preview
        : null,
    state: Dynamic = {};
  for (let key of Object.keys(metadata) as Dynamic)
    key[0] !== "$" && (state[key] = metadata[key]);
  return {
    props: Object.keys(state).length ? state : null,
    preview: previewMetadata,
  };
}
function scanQuotedStringEnd(source?: Dynamic, start?: Dynamic): Dynamic {
  let value: Dynamic = source[start];
  for (let cursor: Dynamic = start + 1; cursor < source.length; cursor++)
    if (source[cursor] === "\\") cursor++;
    else if (source[cursor] === value) return cursor;
  return source.length;
}
function splitCssRuleBlocks(css?: Dynamic): Dynamic {
  let items: Dynamic = [],
    index: Dynamic = 0;
  for (; index < css.length; ) {
    let value: Dynamic = -1;
    for (let characterIndex: Dynamic = index; characterIndex < css.length; characterIndex++) {
      let character: Dynamic = css[characterIndex];
      if (character === '"' || character === "'")
        characterIndex = scanQuotedStringEnd(css, characterIndex);
      else if (character === "{") {
        value = characterIndex;
        break;
      }
    }
    if (value < 0) break;
    let selector: Dynamic = css
        .slice(index, value)
        .replace(/^(\s*@[^;{}]*;)+/, ""),
      count: Dynamic = 1,
      cursor: Dynamic = value + 1;
    for (; cursor < css.length && count > 0; cursor++) {
      let character: Dynamic = css[cursor];
      character === '"' || character === "'"
        ? (cursor = scanQuotedStringEnd(css, cursor))
        : character === "{"
          ? count++
          : character === "}" && count--;
    }
    items.push({
      selector: selector.trim(),
      body: css.slice(value + 1, count === 0 ? cursor - 1 : cursor),
      clean: count === 0 && !selector.includes(";"),
    });
    index = cursor;
  }
  return items;
}
function splitCssDeclarations(declarations?: Dynamic): Dynamic {
  let items: Dynamic = [],
    index: Dynamic = 0,
    bracketDepth: Dynamic = 0,
    text: Dynamic = "",
    flag: Dynamic = false,
    callback: Dynamic = (endIndex?: Dynamic): Dynamic => {
      let value: Dynamic = declarations.slice(index, endIndex),
        colonIndex: Dynamic = value.indexOf(":");
      colonIndex > 0 &&
        items.push({
          name: value.slice(0, colonIndex).trim(),
          value: value.slice(colonIndex + 1).trim(),
          balanced: bracketDepth === 0 && text === "" && !flag,
        });
    };
  for (let cursor: Dynamic = 0; cursor < declarations.length; cursor++) {
    let value: Dynamic = declarations[cursor];
    text !== ""
      ? value === "\\"
        ? cursor++
        : value === text && (text = "")
      : value === '"' || value === "'"
        ? (text = value)
        : value === "(" || value === "["
          ? bracketDepth++
          : value === ")" || value === "]"
            ? bracketDepth === 0
              ? (flag = true)
              : bracketDepth--
            : value === ";" &&
              bracketDepth === 0 &&
              (callback(cursor), (index = cursor + 1), (flag = false));
  }
  callback(declarations.length);
  return items;
}
function collectStaticRootCssVariables(
  rootDocument?: Dynamic,
  additionalCss?: Dynamic,
): Dynamic {
  let entries: Dynamic = new Map(),
    values: Dynamic = new Set(),
    callback: Dynamic = (propertyName?: Dynamic, propertyValue?: Dynamic): Dynamic => {
      !cssCustomPropertyNamePattern.test(propertyName) ||
      propertyValue === "" ||
      unresolvedCssKeywordPattern.test(propertyValue) ||
      /!\s*important\s*$/i.test(propertyValue) ||
      (entries.has(propertyName) && entries.get(propertyName) !== propertyValue)
        ? values.add(propertyName)
        : entries.set(propertyName, propertyValue);
    },
    collectReferences: Dynamic = (cssText?: Dynamic): Dynamic => {
      for (let match of cssText.matchAll(
        cssCustomPropertyDeclarationPattern,
      ) as Dynamic)
        values.add(match[1]);
    },
    collectAtRules: Dynamic = (cssText?: Dynamic): Dynamic => {
      for (let match of cssText.matchAll(
        cssCustomPropertyReferencePattern,
      ) as Dynamic)
        for (
          let variableName: Dynamic = match[0];
          variableName.startsWith("--");
          variableName = variableName.slice(1)
        )
          values.add(variableName);
    },
    collectDeclarations: Dynamic = (declarations?: Dynamic): Dynamic => {
      for (let declaration of declarations as Dynamic)
        declaration.name.startsWith("--") &&
          (declaration.balanced
            ? callback(declaration.name, declaration.value)
            : values.add(declaration.name));
    },
    scanCssText: Dynamic = (cssText?: Dynamic): Dynamic => {
      collectReferences(cssText);
      for (let atRule of (cssText.match(/@[^{};]*/g) ?? []) as Dynamic)
        collectAtRules(atRule);
    },
    value: Dynamic = additionalCss
      .filter((resource?: Dynamic): Dynamic => resource.mime === "text/html")
      .map(
        (resource?: Dynamic): Dynamic =>
          new DOMParser().parseFromString(resource.text, "text/html"),
      );
  if (
    hasUnresolvedExportDependencies(rootDocument, true) ||
    value.some(
      (resource?: Dynamic): Dynamic =>
        hasUnresolvedExportDependencies(resource, false),
    )
  )
    return new Map();
  for (let resource of additionalCss as Dynamic) {
    if (
      resource.mime === "text/css" &&
      hasNonGoogleFontsCssImports(
        resource.text.replace(/\/\*[\s\S]*?\*\//g, " "),
      )
    )
      return new Map();
    if (
      resource.mime !== "text/css" &&
      resource.mime !== "text/html" &&
      interpolatedCssPropertyPattern.test(resource.text)
    )
      return new Map();
  }
  for (let styleElement of Array.from(
    rootDocument.querySelectorAll("style"),
  ) as Dynamic) {
    let cssText: Dynamic = (styleElement.textContent ?? "").replace(
        /\/\*[\s\S]*?\*\//g,
        " ",
      ),
      media: Dynamic = (styleElement.getAttribute("media") ?? "")
        .trim()
        .toLowerCase(),
      styleType: Dynamic = (styleElement.getAttribute("type") ?? "text/css")
        .trim()
        .toLowerCase();
    if (
      (media !== "" && media !== "all") ||
      styleType !== "text/css" ||
      styleElement.closest(
        "noscript, template, sc-if, sc-for, dc-import, x-import",
      ) !== null
    ) {
      scanCssText(cssText);
      continue;
    }
    for (let rule of splitCssRuleBlocks(cssText) as Dynamic) {
      if (
        !rule.clean ||
        rule.selector.startsWith("@") ||
        !rootCssSelectorPattern.test(rule.selector) ||
        rule.body.includes("{")
      ) {
        rule.selector.startsWith("@") && collectAtRules(rule.selector);
        staticCssDeclarationAtRulePattern.test(rule.selector) &&
          collectAtRules(rule.body);
        scanCssText(rule.body);
        continue;
      }
      collectDeclarations(splitCssDeclarations(rule.body));
    }
  }
  let scanDocument: Dynamic = (doc?: Dynamic, isRootDocument?: Dynamic): Dynamic => {
    for (let element of Array.from(doc.querySelectorAll("*")) as Dynamic)
      for (let attribute of Array.from(element.attributes) as Dynamic)
        attribute.name === "style" && isRootDocument && element === doc.documentElement
          ? collectDeclarations(splitCssDeclarations(attribute.value))
          : attribute.name === "style"
            ? collectReferences(attribute.value)
            : collectAtRules(attribute.name + " " + attribute.value);
    for (let script of Array.from(doc.querySelectorAll("script")) as Dynamic)
      collectAtRules(script.textContent ?? "");
    for (let styleElement of Array.from(
      doc.querySelectorAll("template"),
    ) as Dynamic)
      collectAtRules(styleElement.innerHTML);
  };
  scanDocument(rootDocument, true);
  for (let document of value as Dynamic) {
    for (let styleElement of Array.from(
      document.querySelectorAll("style"),
    ) as Dynamic)
      scanCssText((styleElement.textContent ?? "").replace(/\/\*[\s\S]*?\*\//g, " "));
    scanDocument(document, false);
  }
  for (let resource of additionalCss as Dynamic)
    resource.mime === "text/css"
      ? scanCssText(resource.text)
      : resource.mime !== "text/html" && collectAtRules(resource.text);
  for (let variableName of values as Dynamic) entries.delete(variableName);
  for (let flag: Dynamic = true; flag; ) {
    flag = false;
    for (let [variableName, expression] of entries as Dynamic)
      for (let reference of expression.matchAll(/var\(\s*(--[\w-]+)/gi) as Dynamic)
        if (
          !entries.has(reference[1]) ||
          cssVariableReferencesProperty(entries, reference[1], variableName)
        ) {
          entries.delete(variableName);
          flag = true;
          break;
        }
  }
  return entries;
}
function isGoogleFontsCssUrl(url?: Dynamic): Dynamic {
  return /^https:\/\/fonts\.googleapis\.com\//i.test(url.trim());
}
function hasNonGoogleFontsCssImports(css?: Dynamic): Dynamic {
  return Array.from(
    css.matchAll(/@import\s*(?:url\()?\s*["']?([^"')\s;]+)/gi),
  ).some((entry?: Dynamic): Dynamic => !isGoogleFontsCssUrl(entry[1]));
}
function hasUnresolvedExportDependencies(
  document?: Dynamic,
  files?: Dynamic,
): Dynamic {
  if (hasExternalExportStylesheets(document)) return true;
  for (let value of Array.from(
    document.querySelectorAll("x-import"),
  ) as Dynamic)
    for (let attributeName of ["from", "src", "import"] as Dynamic)
      if (
        (value.getAttribute(attributeName) ?? "")
          .split(/\s+/)
          .some(
            (url?: Dynamic): Dynamic =>
              externalExportAssetPattern.test(url),
          )
      )
        return true;
  for (let value of Array.from(
    document.querySelectorAll("script"),
  ) as Dynamic)
    if (value.hasAttribute("src")) {
      if (
        (files || value.closest("helmet, sc-helmet") !== null) &&
        !cssAssetUuidPattern.test(value.getAttribute("src") ?? "")
      )
        return true;
    } else if (dynamicCssMutationPattern.test(value.textContent ?? ""))
      return true;
  return false;
}
function hasExternalExportStylesheets(document?: Dynamic): Dynamic {
  for (let value of Array.from(
    document.querySelectorAll("link[href]"),
  ) as Dynamic)
    if (
      /\bstylesheet\b/i.test(value.getAttribute("rel") ?? "") &&
      !isGoogleFontsCssUrl(value.getAttribute("href") ?? "")
    )
      return true;
  return Array.from(document.querySelectorAll("style")).some(
    (styleElement?: Dynamic): Dynamic =>
      hasNonGoogleFontsCssImports(
        (styleElement.textContent ?? "").replace(/\/\*[\s\S]*?\*\//g, " "),
      ),
  );
}
function cssVariableReferencesProperty(
  variables?: Dynamic,
  property?: Dynamic,
  target?: Dynamic,
  visited: Dynamic = new Set(),
): Dynamic {
  if (property === target) return true;
  if (visited.has(property)) return false;
  visited.add(property);
  for (let value of (variables.get(property) ?? "").matchAll(
    /var\(\s*(--[\w-]+)/gi,
  ) as Dynamic)
    if (cssVariableReferencesProperty(variables, value[1], target, visited))
      return true;
  return false;
}
function substituteStaticCssVariables(
  css?: Dynamic,
  variables?: Dynamic,
  depth: Dynamic = 0,
): Dynamic {
  if (depth > 8) return css;
  let text: Dynamic = "",
    index: Dynamic = 0;
  for (; index < css.length; ) {
    let value: Dynamic = css[index];
    if (value === "/" && css[index + 1] === "*") {
      let commentEnd: Dynamic = css.indexOf("*/", index + 2),
        nextIndex: Dynamic = commentEnd < 0 ? css.length : commentEnd + 2;
      text += css.slice(index, nextIndex);
      index = nextIndex;
      continue;
    }
    if (value === '"' || value === "'") {
      let quoteEnd: Dynamic = scanQuotedStringEnd(css, index);
      text += css.slice(index, quoteEnd + 1);
      index = quoteEnd + 1;
      continue;
    }
    if (/^url\(\s*[^"'\s)]/i.test(css.slice(index, index + 24))) {
      let closeParenIndex: Dynamic = css.indexOf(")", index),
        nextIndex: Dynamic = closeParenIndex < 0 ? css.length : closeParenIndex + 1;
      text += css.slice(index, nextIndex);
      index = nextIndex;
      continue;
    }
    if (
      css.slice(index, index + 4).toLowerCase() !== "var(" ||
      /[\w-]/.test(css[index - 1] ?? " ")
    ) {
      text += value;
      index++;
      continue;
    }
    let parenDepth: Dynamic = 0,
      cursor: Dynamic = index + 4;
    for (; cursor < css.length; cursor++) {
      let character: Dynamic = css[cursor];
      if (character === "/" && css[cursor + 1] === "*") {
        let commentEnd: Dynamic = css.indexOf("*/", cursor + 2);
        cursor = commentEnd < 0 ? css.length : commentEnd + 1;
      } else if (character === '"' || character === "'")
        cursor = scanQuotedStringEnd(css, cursor);
      else if (character === "(") parenDepth++;
      else if (character === ")") {
        if (parenDepth === 0) break;
        parenDepth--;
      }
    }
    if (cursor >= css.length) {
      text += css.slice(index);
      break;
    }
    let variableExpression: Dynamic = css.slice(index + 4, cursor),
      fallbackIndex: Dynamic = variableExpression.indexOf(","),
      variableName: Dynamic = (
        fallbackIndex < 0 ? variableExpression : variableExpression.slice(0, fallbackIndex)
      ).trim(),
      entry: Dynamic = variables.get(variableName),
      fallbackValue: Dynamic =
        cssVariablePrefixBoundaryPattern.test(css[index - 1] ?? "") &&
        cssVariableSuffixBoundaryPattern.test(css[cursor + 1] ?? "");
    text +=
      entry === undefined || !fallbackValue
        ? css.slice(index, cursor + 1)
        : substituteStaticCssVariables(entry, variables, depth + 1);
    index = cursor + 1;
  }
  return text;
}
function escapeStaticExportStyleTag(css?: Dynamic): Dynamic {
  return css.replace(/<\/(style)/gi, "<\\/$1");
}
function collectStaticExportTweakValues(document?: Dynamic): Dynamic {
  let element: Dynamic = document.querySelector("script[data-dc-script]"),
    { props: value }: Dynamic = parseExportTweakMetadata(
      element?.getAttribute("data-props") ?? null,
    ),
    state: Dynamic = {};
  for (let [name, entry] of Object.entries(value ?? {}) as Dynamic)
    entry !== null &&
      typeof entry == "object" &&
      entry.default !== undefined &&
      (state[name] = entry.default);
  let values: Dynamic = new Set(
    Object.keys(state).filter(
      (name?: Dynamic): Dynamic => state[name] === null,
    ),
  );
  for (let name of mutatedRenderValueNames(
    element?.textContent ?? "",
    Object.keys(state),
    values,
  ) as Dynamic)
    delete state[name];
  return state;
}
function mutatedRenderValueNames(
  source?: Dynamic,
  names?: Dynamic,
  values?: Dynamic,
): Dynamic {
  let mutatedNames: Dynamic = new Set();
  if (!/\brenderVals\b/.test(source)) return mutatedNames;
  let value: Dynamic = maskStaticTemplateJavaScript(source);
  if (value === null) return new Set(names);
  let callback: Dynamic = (operator?: Dynamic): Dynamic =>
      /^(?:[-+*/%&|^]|\*\*|<<|>>>?|&&|\|\||\?\?)?=(?![=>])/.test(operator) ||
      /^(?:\+\+|--|of\b|in\b)/.test(operator),
    isMutationExpression: Dynamic = (expression?: Dynamic): Dynamic =>
      /^(?:(?:\.[A-Za-z_$][\w$]*|\[[^\]]*\])+\s*(?:[-+*/%&|^]|\*\*|<<|>>>?|&&|\|\||\?\?)?=(?![=>])|(?:\.[A-Za-z_$][\w$]*|\[[^\]]*\])*\.(?:push|pop|shift|unshift|splice|sort|reverse|fill|copyWithin)\s*\()/.test(
        expression,
      ),
    knownNames: Dynamic = new Set(["this.props"]);
  for (let match of value.matchAll(
    /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*this\.props\s*(?=[;,\n)]|$)/g,
  ) as Dynamic)
    (
      value.match(
        new RegExp(
          "(?<![\\w$.])" +
            match[1].replace(/\$/g, "\\$") +
            "\\s*(?:[-+*/%&|^]|\\*\\*|<<|>>>?|&&|\\|\\||\\?\\?)?=(?![=>])",
          "g",
        ),
      ) ?? []
    ).length === 1 && knownNames.add(match[1]);
  /[{,]\s*props\s*[},][^=]*=\s*this\b/.test(value) &&
    !/(?<![\w$.])props\s*=(?![=>])/.test(value) &&
    knownNames.add("props");
  if (
    Array.from(knownNames).some(
      (name?: Dynamic): Dynamic =>
        value.includes("Object.assign(" + name + ",") ||
        value.includes("Object.assign(" + name + ")") ||
        new RegExp(
          "\\bin\\s+" + name.replace(/[$.]/g, "\\$&") + "\\s*\\)",
        ).test(value),
    )
  )
    return new Set(names);
  let isMutatedName: Dynamic = (name?: Dynamic, operator?: Dynamic): Dynamic => {
      let match: Dynamic =
        /^\(?\s*([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\.([A-Za-z_$][\w$]*)\s*(\?\?\s*(?:'[\w$]*'|"[\w$]*"|``|\[[^\]A-Za-z_$]*\]|-?\d+(?:\.\d+)?|true|false|null|undefined)\s*)?\)?$/.exec(
          name.trim(),
        );
      return (
        match !== null &&
        match[2] === operator &&
        knownNames.has(match[1]) &&
        !(match[3] !== undefined && values.has(operator))
      );
    },
    declarationPattern: Dynamic = /\b(?:const|let|var)$/,
    mutationNames: Dynamic = new Set(
      Array.from(
        value.matchAll(
          /\b(?:const|let|var)\s*\{([^{}=]*)\}\s*=\s*([\w$.]+)/g,
        ),
      ).flatMap(
        (match?: Dynamic): Dynamic =>
          knownNames.has(match[2])
            ? match[1]
                .split(",")
                .map((name?: Dynamic): Dynamic => name.trim())
            : [],
      ),
    );
  for (let name of names as Dynamic) {
    if (!/^[A-Za-z_$][\w$]*$/.test(name)) continue;
    let namePattern: Dynamic = new RegExp(
        "(?<![\\w$])" + name.replace(/\$/g, "\\$") + "(?![\\w$])",
        "g",
      ),
      isKnownName: Dynamic = mutationNames.has(name);
    Array.from(value.matchAll(namePattern)).some((match?: Dynamic): Dynamic => {
      let prefix: Dynamic = value
          .slice(Math.max(0, match.index - 240), match.index)
          .trimEnd(),
        suffix: Dynamic = value
          .slice(match.index + name.length)
          .trimStart();
      if (/['"`]$/.test(prefix)) {
        let expression: Dynamic = suffix.slice(1).trimStart();
        return expression.startsWith(":")
          ? !isMutatedName(
              expression.slice(1, scanJavaScriptExpressionEnd(expression, 1)),
              name,
            )
          : expression.startsWith("]")
            ? callback(expression.slice(1).trimStart())
              ? true
              : !knownNames.has(
                  /[\w$.]*$/.exec(
                    prefix.slice(0, -1).replace(/\s*\[\s*$/, ""),
                  )![0],
                )
            : false;
      }
      if (callback(suffix) || /(?:\+\+|--)$/.test(prefix)) {
        let expression: Dynamic =
          /^=(?![=>])/.test(suffix) && declarationPattern.test(prefix)
            ? suffix.slice(1)
            : null;
        return expression === null ||
          !isMutatedName(
            expression.slice(0, scanJavaScriptExpressionEnd(expression, 0)),
            name,
          )
          ? true
          : ((isKnownName = true), false);
      }
      return /^(?:,[^=;{}]*)?[}\]]\s*=(?![=>])/.test(suffix) &&
        !/\b(?:const|let|var)\s*[{[][^{}[\]]*$/.test(prefix)
        ? true
        : prefix.endsWith(".")
          ? !knownNames.has(/[\w$.]*$/.exec(prefix.slice(0, -1))![0]) ||
            /\bdelete\s*[\w$.]*$/.test(prefix) ||
            isMutationExpression(suffix)
          : suffix.startsWith(":")
            ? !isMutatedName(
                suffix.slice(1, scanJavaScriptExpressionEnd(suffix, 1)),
                name,
              )
            : !isKnownName || isMutationExpression(suffix);
    }) && mutatedNames.add(name);
  }
  return mutatedNames;
}
function maskStaticTemplateJavaScript(source?: Dynamic): Dynamic {
  let text: Dynamic = "";
  for (let index: Dynamic = 0; index < source.length; index++) {
    let value: Dynamic = source[index];
    if (value === "/" && source[index + 1] === "/") {
      let commentStart: Dynamic = source.indexOf(
        `
`,
        index,
      );
      index = commentStart < 0 ? source.length : commentStart - 1;
      text += " ";
    } else if (value === "/" && source[index + 1] === "*") {
      let commentEnd: Dynamic = source.indexOf("*/", index + 2);
      if (commentEnd < 0) return null;
      index = commentEnd + 1;
      text += " ";
    } else if (
      value === "/" &&
      /(?:^|[(,=:[!&|?{};+\-*%<>~^]|\breturn|\btypeof|\bcase)\s*$/.test(text)
    ) {
      let cursor: Dynamic = index + 1;
      for (
        let flag: Dynamic = false;
        cursor < source.length &&
        (flag || source[cursor] !== "/") &&
        source[cursor] !==
          `
`;
        cursor++
      )
        source[cursor] === "\\"
          ? cursor++
          : source[cursor] === "["
            ? (flag = true)
            : source[cursor] === "]" && (flag = false);
      if (source[cursor] !== "/") return null;
      text += "/ /";
      index = cursor;
    } else if (value === '"' || value === "'" || value === "`") {
      let quoteEnd: Dynamic = scanQuotedStringEnd(source, index);
      if (quoteEnd >= source.length) return null;
      let identifier: Dynamic = source.slice(index + 1, quoteEnd);
      text +=
        value + (/^[A-Za-z_$][\w$]*$/.test(identifier) ? identifier : "") + value;
      index = quoteEnd;
    } else
      value === "?" &&
      source[index + 1] === "." &&
      !/\d/.test(source[index + 2] ?? "")
        ? ((text += "."), index++)
        : (text += value);
  }
  return text;
}
function scanJavaScriptExpressionEnd(
  source?: Dynamic,
  start?: Dynamic,
): Dynamic {
  let index: Dynamic = 0;
  for (; start < source.length; start++) {
    let value: Dynamic = source[start];
    if (value === "(" || value === "[" || value === "{") index++;
    else if (value === ")" || value === "]" || value === "}") {
      if (index === 0) return start;
      index--;
    } else if ((value === "," || value === ";") && index === 0) return start;
  }
  return start;
}
function staticTemplateValueString(templateValue?: Dynamic): Dynamic {
  return typeof templateValue == "string" || typeof templateValue == "number"
    ? String(templateValue)
    : Array.isArray(templateValue)
      ? templateValue
          .filter(
            (candidateValue?: Dynamic): Dynamic =>
              typeof candidateValue == "string" || typeof candidateValue == "number",
          )
          .join("")
      : null;
}
function interpolateStaticExportTemplate(
  template?: Dynamic,
  values?: Dynamic,
  templateOptions?: Dynamic,
): Dynamic {
  let index: Dynamic = 0,
    callback: Dynamic = (expression?: Dynamic, scope?: Dynamic): Dynamic => {
      let value: Dynamic = Array.from(
        expression
          .replace(/'[^']*'|"[^"]*"/g, "")
          .matchAll(/(?<![\w$.])[A-Za-z_$][\w$]*/g),
        (match?: Dynamic): Dynamic => match[0],
      ).filter(
        (keyword?: Dynamic): Dynamic =>
          !staticTemplateLiteralKeywords.has(keyword),
      );
      return value.every(
        (key?: Dynamic): Dynamic =>
          Object.prototype.hasOwnProperty.call(scope, key),
      )
        ? (value.length > 0 && index++, true)
        : false;
    },
    evaluateExpression: Dynamic = (expression?: Dynamic, scope?: Dynamic): Dynamic => {
      let flag: Dynamic = true;
      for (let value of expression.matchAll(
        staticTemplateExpressionPattern,
      ) as Dynamic)
        flag = callback(value[1], scope) && flag;
      return {
        v: compileTemplateExpression(expression)(scope),
        known: flag,
      };
    },
    renderNode: Dynamic = (
      text?: Dynamic,
      scope?: Dynamic,
      renderContext?: Dynamic,
    ): Dynamic =>
      text.includes("{{")
        ? text
            .split(staticTemplateExpressionPattern)
            .flatMap((part?: Dynamic, partIndex?: Dynamic): Dynamic => {
              if (!(partIndex & 1))
                return part === "" ? [] : [template.createTextNode(part)];
              if (!callback(part, scope))
                return [template.createTextNode("{{" + part + "}}")];
              let value: Dynamic = staticTemplateValueString(
                evaluateTemplateExpression(scope, part),
              );
              if (value === null) return [];
              if (!renderContext) return [template.createTextNode(value)];
              let interpolationNode: Dynamic = template.createElement("span");
              interpolationNode.setAttribute("class", "sc-interp");
              interpolationNode.textContent = value;
              return [interpolationNode];
            })
        : [template.createTextNode(text)],
    renderChildren: Dynamic = (element?: Dynamic, scope?: Dynamic): Dynamic =>
      Array.from(element.childNodes).flatMap(
        (child?: Dynamic): Dynamic =>
          renderElement(
            child,
            scope,
            (element.namespaceURI ?? exportHtmlNamespace) ===
              exportHtmlNamespace && element.localName !== "textarea",
          ),
      ),
    renderElement: Dynamic = (
      node?: Dynamic,
      scope?: Dynamic,
      renderContext?: Dynamic,
    ): Dynamic => {
      if (node.nodeType === 3)
        return renderNode(node.nodeValue ?? "", scope, renderContext);
      if (node.nodeType !== 1) return [];
      let value: Dynamic = node,
        tagName: Dynamic = value.localName.toLowerCase();
      if (
        forbiddenStaticExportTagPattern.test(tagName) ||
        value.hasAttribute(staticExportAttribute)
      )
        return [];
      if (tagName === "sc-if") {
        let { v: evaluatedValue, known: isKnown }: Dynamic = evaluateExpression(
          value.getAttribute("value") ?? "",
          scope,
        );
        return (isKnown ? evaluatedValue : value.hasAttribute("value"))
          ? renderChildren(value, scope)
          : [];
      }
      if (tagName === "sc-for") {
        let { v: evaluatedValues, known: isKnown }: Dynamic = evaluateExpression(
            value.getAttribute("list") ?? "",
            scope,
          ),
          itemName: Dynamic = value.getAttribute("as") || "item";
        return !isKnown || !Array.isArray(evaluatedValues)
          ? renderChildren(value, scope)
          : evaluatedValues.flatMap(
              (item?: Dynamic, itemIndex?: Dynamic): Dynamic =>
                renderChildren(value, {
                  ...scope,
                  [itemName]: item,
                  $index: itemIndex,
                }),
            );
      }
      let outputTag: Dynamic =
          HtmlTagNormalizationFromEntriesValue[tagName],
        outputElement: Dynamic =
          outputTag === undefined
            ? value.cloneNode(false)
            : template.createElement(outputTag);
      for (let attribute of Array.from(outputElement.attributes) as Dynamic)
        outputElement.removeAttribute(attribute.name);
      for (let { name: attributeName, value: attributeValue } of Array.from(
        value.attributes,
      ) as Dynamic) {
        let normalizedAttributeName: Dynamic = attributeName.startsWith(ScCamelValue)
          ? kebabToCamelCase(
              attributeName.slice(ScCamelValue.length),
            )
          : attributeName;
        if (
          dynamicStaticExportAttributePattern.test(normalizedAttributeName) ||
          (tagName === "x-import" && /^(from|src|import)$/.test(normalizedAttributeName))
        )
          continue;
        let normalizedValue: Dynamic = attributeValue;
        (attributeValue.includes("{{") &&
          ((normalizedValue = evaluateExpression(attributeValue, scope).v),
          typeof normalizedValue == "string" && normalizedValue.includes("<"))) ||
          (typeof normalizedValue == "string" || typeof normalizedValue == "number"
            ? outputElement.setAttribute(
                normalizedAttributeName,
                normalizedAttributeName === "style"
                  ? removeUnsafeCssDeclarations(String(normalizedValue))
                  : String(normalizedValue),
              )
            : typeof normalizedValue == "boolean" && /^(data-|aria-)/.test(normalizedAttributeName)
              ? outputElement.setAttribute(normalizedAttributeName, String(normalizedValue))
              : normalizedValue === true && outputElement.setAttribute(normalizedAttributeName, ""));
      }
      for (let child of renderChildren(value, scope) as Dynamic)
        outputElement.appendChild(child);
      return [outputElement];
    },
    items: Dynamic = [];
  for (let value of Array.from(values.childNodes) as Dynamic) {
    if (value.nodeType === 3 && (value.nodeValue ?? "").trim() !== "")
      return null;
    items.push(...renderElement(value, templateOptions, true));
  }
  return {
    nodes: items,
    resolved: index,
  };
}
function collectReferencedElementIds(element?: Dynamic): Dynamic {
  let items: Dynamic = [
      element,
      ...Array.from(element.querySelectorAll("*")),
    ],
    values: Dynamic = new Set();
  for (let value of items as Dynamic)
    for (let { name: attributeName, value: attributeValue } of Array.from(
      value.attributes,
    ) as Dynamic) {
      for (let referenceMatch of attributeValue.matchAll(
        /url\(\s*['"]?#([^'")\s]+)/g,
      ) as Dynamic)
        values.add(referenceMatch[1]);
      (attributeName === "href" || attributeName === "xlink:href") &&
        attributeValue.startsWith("#") &&
        values.add(attributeValue.slice(1));
    }
  let referencedIds: Dynamic = new Set(
    items
      .filter(
        (svgElement?: Dynamic): Dynamic =>
          svgElement.namespaceURI === exportSvgNamespace &&
          values.has(svgElement.getAttribute("id") ?? ""),
      )
      .map((svgNode?: Dynamic): Dynamic => svgNode.getAttribute("id")),
  );
  if (referencedIds.size !== 0)
    for (let value of items as Dynamic)
      for (let { name: attributeName, value: attributeValue } of Array.from(
        value.attributes,
      ) as Dynamic) {
        let normalizedValue: Dynamic = attributeValue.replace(
          /url\(\s*(['"]?)#([^'")\s]+)\1\s*\)/g,
          (referenceValue?: Dynamic, prefix?: Dynamic, idPrefix?: Dynamic): Dynamic =>
            referencedIds.has(idPrefix)
              ? "url(" +
                prefix +
                "#" +
                idPrefix +
                staticExportIdSuffix +
                prefix +
                ")"
              : referenceValue,
        );
        (attributeName === "href" || attributeName === "xlink:href") &&
          referencedIds.has(attributeValue.slice(1)) &&
          attributeValue.startsWith("#") &&
          (normalizedValue = attributeValue + staticExportIdSuffix);
        attributeName === "id" &&
          value.namespaceURI === exportSvgNamespace &&
          referencedIds.has(attributeValue) &&
          (normalizedValue = attributeValue + staticExportIdSuffix);
        normalizedValue !== attributeValue && value.setAttribute(attributeName, normalizedValue);
      }
}
function hasImportantStaticVisibilityStyles(
  document?: Dynamic,
  stage?: Dynamic,
): Dynamic {
  let value: Dynamic = Array.from(stage.children).filter(
    (element?: Dynamic): Dynamic => !element.hasAttribute(staticExportAttribute),
  );
  if (
    value.some(
      (element?: Dynamic): Dynamic =>
        importantVisibleCssPattern.test(element.getAttribute("style") ?? ""),
    )
  )
    return true;
  let callback: Dynamic = (cssText?: Dynamic): Dynamic =>
    splitCssRuleBlocks(cssText).some((rule?: Dynamic): Dynamic => {
      if (
        !importantVisibleCssPattern.test(rule.body) ||
        staticCssDeclarationAtRulePattern.test(rule.selector) ||
        /^@(-\w+-)?keyframes\b/i.test(rule.selector)
      )
        return false;
      if (rule.selector.startsWith("@")) return callback(rule.body);
      if (rule.body.includes("{")) return true;
      try {
        return value.some(
          (element?: Dynamic): Dynamic => element.matches(rule.selector),
        );
      } catch {
        return true;
      }
    });
  return Array.from(document.querySelectorAll("style"))
    .filter(
      (element?: Dynamic): Dynamic =>
        element.closest("[" + staticExportAttribute + "]") === null,
    )
    .some(
      (styleElement?: Dynamic): Dynamic =>
        callback((styleElement.textContent ?? "").replace(/\/\*[\s\S]*?\*\//g, " ")),
    );
}
function buildStaticArtboardCopy(
  document?: Dynamic,
  stage?: Dynamic,
): Dynamic {
  for (let child of Array.from(stage.children).filter(
    (node?: Dynamic): Dynamic => node.hasAttribute(staticExportAttribute),
  ) as Dynamic)
    child.remove();
  if (!stage.innerHTML.includes("{{")) return null;
  let callback: Dynamic = (node?: Dynamic): Dynamic => (
      console.info(
        "[design/export] This export has no static copy of the board (tweak values filled in, for importers that run no script): " +
          node,
      ),
      null
    ),
    value: Dynamic = interpolateStaticExportTemplate(
      document,
      stage,
      collectStaticExportTweakValues(document),
    );
  if (value === null)
    return callback(
      "the board has text directly inside <x-dc>, outside any element; wrap that text in an element to include the copy",
    );
  if (value.resolved === 0) return null;
  let elements: Dynamic = value.nodes.filter(
    (node?: Dynamic): Dynamic => node.nodeType === 1,
  );
  if (elements.length === 0) return null;
  let container: Dynamic, fallbackNodes: Dynamic;
  if (
    elements.length === 1 &&
    value.nodes.every(
      (node?: Dynamic): Dynamic =>
        node === elements[0] || (node.nodeValue ?? "").trim() === "",
    )
  ) {
    container = elements[0];
    fallbackNodes = value.nodes;
  } else {
    container = document.createElement("div");
    for (let node of value.nodes as Dynamic) container.appendChild(node);
    fallbackNodes = [container];
  }
  collectReferencedElementIds(container);
  let conditionalElement: Dynamic = document.createElement("sc-if");
  conditionalElement.setAttribute(staticExportAttribute, "");
  conditionalElement.setAttribute("value", "{{ false }}");
  let styleElement: Dynamic = document.createElement("style");
  styleElement.textContent =
    "x-dc>*{display:none!important}x-dc>[" +
    staticExportAttribute +
    "]{display:block!important}";
  conditionalElement.appendChild(styleElement);
  for (let node of fallbackNodes as Dynamic) conditionalElement.appendChild(node);
  return conditionalElement.outerHTML.length > maxStaticExportTemplateLength
    ? callback("the copy would be over 512K characters, too large to include")
    : hasExternalExportStylesheets(document)
      ? callback(
          "the page links or @imports a stylesheet the export cannot read, so it cannot tell whether the board would stay hidden behind the copy; inline or remove that stylesheet to include the copy",
        )
      : (stage.appendChild(conditionalElement),
        hasImportantStaticVisibilityStyles(document, stage)
          ? (conditionalElement.remove(),
            callback(
              "one of the board's top-level elements has a display or all declaration marked !important (inline or in a stylesheet), which could show the board beside the copy; drop the !important to include the copy",
            ))
          : container);
}
function prepareStaticArtboardExport(
  document?: Dynamic,
  artboard?: Dynamic,
  additionalCss: Dynamic = [],
): Dynamic {
  let value: Dynamic = String(Math.max(1, Math.round(artboard.w))),
    canvasHeight: Dynamic = String(Math.max(1, Math.round(artboard.h))),
    cssVariables: Dynamic = collectStaticRootCssVariables(document, additionalCss);
  if (cssVariables.size > 0) {
    for (let styleElement of Array.from(
      document.querySelectorAll("style"),
    ) as Dynamic) {
      let styleText: Dynamic = styleElement.textContent ?? "";
      styleText.includes("var(") &&
        (styleElement.textContent = escapeStaticExportStyleTag(
          substituteStaticCssVariables(styleText, cssVariables),
        ));
    }
    for (let styleElementNode of Array.from(
      document.querySelectorAll('[style*="var("]'),
    ) as Dynamic)
      styleElementNode.setAttribute(
        "style",
        substituteStaticCssVariables(
          styleElementNode.getAttribute("style") ?? "",
          cssVariables,
        ),
      );
  }
  let element: Dynamic = document.querySelector("x-dc");
  for (let styleElementNode of Array.from(
    document.querySelectorAll(
      '[data-canvas-width], [data-canvas-height], [data-document-role="page"]',
    ),
  ) as Dynamic)
    for (let attributeName of [
      "data-canvas-width",
      "data-canvas-height",
      "data-document-role",
    ] as Dynamic)
      styleElementNode.removeAttribute(attributeName);
  for (let removableElement of Array.from(
    document.head.querySelectorAll('meta[name^="hz:"]'),
  ) as Dynamic)
    removableElement.remove();
  let contentElements: Dynamic =
      element === null
        ? []
        : Array.from(element.children).filter(
            (candidateElement?: Dynamic): Dynamic =>
              !exportMetadataTagPattern.test(candidateElement.tagName) &&
              !candidateElement.hasAttribute(staticExportAttribute),
          ),
    canvasElement: Dynamic =
      contentElements.length === 1 &&
      !dynamicStaticExportTagPattern.test(contentElements[0].localName)
        ? contentElements[0]
        : document.body;
  canvasElement.setAttribute("data-canvas-width", value);
  canvasElement.setAttribute("data-canvas-height", canvasHeight);
  let existingCanvas: Dynamic = null;
  if (
    element !== null &&
    additionalCss.some(
      (resource?: Dynamic): Dynamic =>
        /javascript/i.test(resource.mime) &&
        isDesignRuntimeSource(resource.text),
    )
  )
    try {
      existingCanvas = buildStaticArtboardCopy(document, element);
    } catch {
      for (let exportChild of Array.from(element.children).filter(
        (child?: Dynamic): Dynamic =>
          child.hasAttribute(staticExportAttribute),
      ) as Dynamic)
        exportChild.remove();
      console.warn(
        "[design/export] Building the static copy of the board for importers that run no script failed; exported without it",
      );
    }
  let hasCanvas: Dynamic =
      existingCanvas !== null && existingCanvas.hasAttribute("data-canvas-width"),
    pageElement: Dynamic = hasCanvas ? existingCanvas : canvasElement;
  pageElement.setAttribute("data-document-role", "page");
  let pageLabel: Dynamic = artboard.label?.trim() ?? "";
  pageLabel !== "" &&
    (pageElement.getAttribute("data-label") ?? "").trim() === "" &&
    pageElement.setAttribute("data-label", pageLabel);
  for (let [metaName, metaContent] of [
    [
      "hz:slide-selector",
      hasCanvas ? ":not(x-dc)>[data-canvas-width]" : "[data-canvas-width]",
    ],
    ["hz:canvas-width", value],
    ["hz:canvas-height", canvasHeight],
  ] as Dynamic) {
    let metaElement: Dynamic = document.createElement("meta");
    metaElement.setAttribute("name", metaName);
    metaElement.setAttribute("content", metaContent);
    document.head.appendChild(metaElement);
  }
}
export {
  buildStaticArtboardCopy,
  collectReferencedElementIds,
  collectStaticExportTweakValues,
  collectStaticRootCssVariables,
  cssAssetUuidPattern,
  cssCustomPropertyDeclarationPattern,
  cssCustomPropertyNamePattern,
  cssCustomPropertyReferencePattern,
  cssIdentifierTokenPattern,
  cssVariablePrefixBoundaryPattern,
  cssVariableReferencesProperty,
  cssVariableSuffixBoundaryPattern,
  cssWhitespacePattern,
  dynamicCssMutationPattern,
  dynamicStaticExportAttributePattern,
  dynamicStaticExportTagPattern,
  escapeStaticExportStyleTag,
  exportHtmlNamespace,
  exportMetadataTagPattern,
  exportNonRenderedTags,
  exportSafeContentSelector,
  exportSvgNamespace,
  externalExportAssetPattern,
  forbiddenStaticExportTagPattern,
  hasExternalExportStylesheets,
  hasImportantStaticVisibilityStyles,
  hasNonGoogleFontsCssImports,
  hasUnresolvedExportDependencies,
  importantVisibleCssPattern,
  interpolatedCssPropertyPattern,
  interpolateStaticExportTemplate,
  isGoogleFontsCssUrl,
  maskStaticTemplateJavaScript,
  maxStaticExportTemplateLength,
  mutatedRenderValueNames,
  parseExportTweakMetadata,
  prepareStaticArtboardExport,
  removeUnsafeCssDeclarations,
  rootCssSelectorPattern,
  scanJavaScriptExpressionEnd,
  scanQuotedStringEnd,
  splitCssDeclarations,
  splitCssRuleBlocks,
  staticCssDeclarationAtRulePattern,
  staticExportAttribute,
  staticExportIdSuffix,
  staticTemplateExpressionPattern,
  staticTemplateLiteralKeywords,
  staticTemplateValueString,
  substituteStaticCssVariables,
  unresolvedCssKeywordPattern,
  unsafeCssPropertyPattern,
};
export function installExportStaticArtboard(): () => void {
  return () => {
    exportNonRenderedTags = new Set(
      "script style textarea option title select canvas iframe video audio".split(
        " ",
      ),
    );
    exportSafeContentSelector =
      ":not(" + [...HtmlTagNormalizationSubscribers].join(",") + ")";
    cssIdentifierTokenPattern = /-{0,2}[A-Za-z_][A-Za-z0-9_-]*/y;
    unsafeCssPropertyPattern = /^(?:behavior|-moz-binding)$/i;
    cssWhitespacePattern = /[ \t\n\r\f]/;
    rootCssSelectorPattern = /^\s*(?::root|html)(?:\s*,\s*(?::root|html))*\s*$/;
    cssCustomPropertyNamePattern = /^--[\w-]+$/;
    cssCustomPropertyDeclarationPattern = /(--[\w-]+)\s*:/g;
    cssCustomPropertyReferencePattern = /--[\w-]+/g;
    exportMetadataTagPattern =
      /^(helmet|sc-helmet|noscript|script|style|template|link|meta)$/i;
    staticCssDeclarationAtRulePattern =
      /^@(font-face|page|counter-style|font-palette-values|font-feature-values|property)\b/i;
    dynamicCssMutationPattern =
      /setProperty\((?!\s*(['"`])[\w-]+\1\s*[,)])|--[\w-]*(['"`])\s*\+|--[\w-]*\$\{|\.cssText\s*\+?=(?!=)/;
    interpolatedCssPropertyPattern = /--[\w-]*(['"`])\s*\+|--[\w-]*\$\{/;
    externalExportAssetPattern = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
    cssAssetUuidPattern =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    unresolvedCssKeywordPattern =
      /^(initial|inherit|unset|revert|revert-layer)$/i;
    cssVariablePrefixBoundaryPattern = /^$|[\s,(:;{/]/;
    cssVariableSuffixBoundaryPattern = /^$|[\s,);}!/]/;
    staticTemplateExpressionPattern = /\{\{([\s\S]+?)\}\}/g;
    staticExportAttribute = "data-dc-static";
    forbiddenStaticExportTagPattern =
      /^(helmet|sc-helmet|script|style|noscript|template|link|meta|base|title|iframe|frame|object|embed|audio|video|xmp|noembed|noframes|plaintext)$/i;
    dynamicStaticExportAttributePattern =
      /^(on|style-|data-keyframes-|ref$|autofocus$)/i;
    staticExportIdSuffix = "-dc-static";
    exportSvgNamespace = "http://www.w3.org/2000/svg";
    exportHtmlNamespace = "http://www.w3.org/1999/xhtml";
    staticTemplateLiteralKeywords = new Set([
      "true",
      "false",
      "null",
      "undefined",
    ]);
    maxStaticExportTemplateLength = 512 * 1024;
    importantVisibleCssPattern =
      /(?<![\w-])(?:display\s*:(?!\s*none\b)|all\s*:)[^;{}]*!\s*important/i;
    dynamicStaticExportTagPattern = /^(sc-if|sc-for|dc-import|x-import)$/i;
  };
}
