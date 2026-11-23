import type { Dynamic } from "./types";
/** CSS 声明文本的纯计算：解析、折叠 flex 简写、序列化与替换。不依赖 DOM。 */
export function parseCssDeclarations(
  css?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  let declarations: Dynamic = [];
  let parenthesisDepth: Dynamic = 0;
  let quote: Dynamic = "";
  let declarationStart: Dynamic = 0;
  for (let index: Dynamic = 0; index <= css.length; index++) {
    let character: Dynamic = css[index];
    if (
      index === css.length ||
      (character === ";" && !parenthesisDepth && !quote)
    ) {
      let text: Dynamic = css.slice(declarationStart, index).trim();
      let colonIndex: Dynamic = text.indexOf(":");
      if (((declarationStart = index + 1), colonIndex > 0))
        declarations.push({
          prop: text.slice(0, colonIndex).trim().toLowerCase(),
          value: text.slice(colonIndex + 1).trim(),
          text: text,
        });
    } else if (quote) {
      if (character === quote) quote = "";
    } else if (character === '"' || character === "'") quote = character;
    else if (character === "(") parenthesisDepth++;
    else if (character === ")" && parenthesisDepth) parenthesisDepth--;
  }
  return declarations;
}
export const cssDeclarationMap: Dynamic = (
  declarations?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic =>
  new Map(
    parseCssDeclarations(declarations).map(
      (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic => [
        declaration.prop,
        declaration.value,
      ],
    ),
  );
export const matchesCssDeclarations: Dynamic = (
  declarations?: Dynamic,
  expectedDeclarations?: Dynamic,
  seenProperties?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic => {
  if (!declarations.size) return false;
  for (let [propertyName, declaration] of declarations)
    if (expectedDeclarations.get(propertyName) !== declaration || seenProperties.has(propertyName)) return false;
  return true;
};
export const freshCssDeclaration: Dynamic = (
  property?: Dynamic,
  cssValue?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic => ({
  prop: property,
  value: cssValue,
  fresh: true,
});
export function collapseFlexShorthand(
  declarations?: Dynamic,
  ..._unusedCollapseArgs: Dynamic[]
): Dynamic {
  let findDeclaration: Dynamic = (
    property?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic =>
    declarations.find(
      (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
        declaration.fresh && declaration.prop === property,
    );
  let flexGrow: Dynamic = findDeclaration("flex-grow");
  let flexShrink: Dynamic = findDeclaration("flex-shrink");
  let flexBasis: Dynamic = findDeclaration("flex-basis");
  if (
    flexGrow &&
    flexShrink &&
    flexBasis &&
    flexShrink.value === "1" &&
    flexBasis.value === "0%"
  ) {
    flexGrow.prop = "flex";
    declarations = declarations.filter(
      (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
        declaration !== flexShrink && declaration !== flexBasis,
    );
  }
  for (let declaration of declarations)
    if (declaration.fresh && declaration.prop === "flex")
      declaration.value = declaration.value.replace(/^(\d+(?:\.\d+)?) 1 0%$/, "$1");
  return declarations;
}
export const serializeCssDeclarations: Dynamic = (
  declarations?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic =>
  declarations
    .map(
      (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
        declaration.fresh
          ? declaration.prop + ": " + declaration.value
          : declaration.text,
    )
    .join("; ");
export const kebabCaseCssProperty: Dynamic = (
  propertyName?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic =>
  String(propertyName)
    .replace(/^ms(?=[A-Z])/, "-ms")
    .replace(
      /[A-Z]/g,
      (character?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
        "-" + character.toLowerCase(),
    );
export const extractBackgroundUrl: Dynamic = (
  cssText?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic => {
  let urlStart: Dynamic = cssText.search(/url\(/i);
  if (urlStart < 0) return "";
  let text: Dynamic = "";
  for (let index: Dynamic = urlStart + 4; index < cssText.length; index++) {
    let character: Dynamic = cssText[index];
    if (text) {
      if (character === text) text = "";
    } else if (character === '"' || character === "'") text = character;
    else if (character === ")") return cssText.slice(urlStart, index + 1);
  }
  return "";
};
export function replaceCssDeclaration(
  cssText?: Dynamic,
  propertyName?: Dynamic,
  propertyValue?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  let declarations: Dynamic = parseCssDeclarations(cssText);
  let replaced: Dynamic = false;
  let items: Dynamic = [];
  for (let declaration of declarations)
    if (declaration.prop !== propertyName) items.push(declaration.text);
    else if (!replaced) {
      items.push(propertyName + ": " + propertyValue);
      replaced = true;
    }
  if (!replaced) items.push(propertyName + ": " + propertyValue);
  return items.join("; ");
}
