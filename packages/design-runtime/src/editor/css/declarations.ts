/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { camelToKebabCss } from "../html/tag-normalization";

var CssDeclarationsAZaZPattern: Dynamic;
var CssDeclarationsBehaviorMozBindingPattern: Dynamic;
function normalizeCssProperty(property?: Dynamic): Dynamic {
  return property.startsWith("--")
    ? property
    : CssDeclarationsAZaZPattern.test(property)
      ? camelToKebabCss(property).toLowerCase()
      : property.toLowerCase();
}
function isUnsafeCssProperty(property?: Dynamic): Dynamic {
  return (
    CssDeclarationsBehaviorMozBindingPattern.test(property) ||
    CssDeclarationsBehaviorMozBindingPattern.test(normalizeCssProperty(property))
  );
}
function splitCssTokens(css?: Dynamic, separator?: Dynamic): Dynamic {
  let tokens: Dynamic = [],
    parenDepth: Dynamic = 0,
    braceDepth: Dynamic = 0,
    quoteChar: Dynamic = null,
    text: Dynamic = "";
  for (let position: Dynamic = 0; position < css.length; position++) {
    let char: Dynamic = css[position];
    if (quoteChar) {
      text += char;
      char === quoteChar && css[position - 1] !== "\\" && (quoteChar = null);
      continue;
    }
    if (char === '"' || char === "'") {
      quoteChar = char;
      text += char;
      continue;
    }
    char === "("
      ? parenDepth++
      : char === ")"
        ? (parenDepth = Math.max(0, parenDepth - 1))
        : char === "{"
          ? braceDepth++
          : char === "}" && (braceDepth = Math.max(0, braceDepth - 1));
    if (char === separator && parenDepth === 0 && braceDepth === 0) {
      tokens.push(text);
      text = "";
      continue;
    }
    text += char;
  }
  tokens.push(text);
  return tokens;
}
function parseStyleDeclarations(style?: Dynamic): Dynamic {
  if (!style) return [];
  let declarations: Dynamic = [];
  for (let part of splitCssTokens(style, ";") as Dynamic) {
    let trimmed: Dynamic = part.trim();
    if (!trimmed) continue;
    let colonIndex: Dynamic = trimmed.indexOf(":");
    if (colonIndex <= 0) continue;
    let propName: Dynamic = trimmed.slice(0, colonIndex).trim(),
      propValue: Dynamic = trimmed.slice(colonIndex + 1).trim();
    !propName ||
      !propValue ||
      isUnsafeCssProperty(propName) ||
      declarations.push({
        prop: normalizeCssProperty(propName),
        value: propValue,
      });
  }
  return declarations;
}
function serializeStyleDeclarations(declarations?: Dynamic): Dynamic {
  return declarations
    .map((declaration?: Dynamic): Dynamic => `${declaration.prop}: ${declaration.value}`)
    .join("; ");
}
function getStyleProperty(style?: Dynamic, property?: Dynamic): Dynamic {
  let declarations: Dynamic = parseStyleDeclarations(style),
    normalizedProperty: Dynamic = normalizeCssProperty(property);
  for (let index: Dynamic = declarations.length - 1; index >= 0; index--)
    if (declarations[index].prop === normalizedProperty)
      return declarations[index].value;
  return "";
}
export {
  CssDeclarationsAZaZPattern,
  CssDeclarationsBehaviorMozBindingPattern,
  getStyleProperty,
  isUnsafeCssProperty,
  normalizeCssProperty,
  parseStyleDeclarations,
  serializeStyleDeclarations,
  splitCssTokens,
};
export function installEditorCssDeclarations(): () => void {
  return () => {
    CssDeclarationsAZaZPattern = /^-?[A-Za-z_][\w-]*$/;
    CssDeclarationsBehaviorMozBindingPattern =
      /^(?:behavior|-moz-binding)$|<\/?script|data-dc-script|<\/?x-dc|<\!--/i;
  };
}
