/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseStyleDeclarations } from "./declarations";
import { getCssRuleProperty } from "./rules";
import { expandCssShorthand } from "./shorthand";

function resolveCssVariable(
  cssRules?: Dynamic,
  selector?: Dynamic,
  varExpression?: Dynamic,
): Dynamic {
  let varMatch: Dynamic = /^var\(\s*(--[\w-]+)\s*(?:,\s*(.+))?\)$/s.exec(
    varExpression.trim(),
  );
  if (!varMatch) return "";
  for (let candidateSelector of [selector, "html", ":root"] as Dynamic) {
    let resolved: Dynamic = getCssRuleProperty(
      cssRules,
      candidateSelector,
      varMatch[1],
    );
    if (resolved && !/^var\(/i.test(resolved)) return resolved;
  }
  return varMatch[2]?.trim() ?? "";
}
function utilityClassSelector(rule?: Dynamic): Dynamic {
  return rule.parent !== undefined
    ? `.${rule.parent} .${rule.className}`
    : rule.also !== undefined
      ? `.${rule.className}.${rule.also}`
      : `.${rule.className}`;
}
function mergeAuthoredStyle(
  utilityRules?: Dynamic,
  classNames?: Dynamic,
  styleText?: Dynamic,
  parentClasses?: Dynamic,
): Dynamic {
  let authored: Dynamic = parseStyleDeclarations(styleText);
  if (classNames.length === 0 || utilityRules.length === 0) return authored;
  let classSet: Dynamic = new Set(classNames),
    entries: Dynamic = new Map(),
    setProperty: Dynamic = (declaration?: Dynamic, selector?: Dynamic): Dynamic => {
      entries.delete(declaration.prop);
      entries.set(
        declaration.prop,
        selector === undefined
          ? {
              prop: declaration.prop,
              value: declaration.value,
            }
          : {
              prop: declaration.prop,
              value: declaration.value,
              selector: selector,
            },
      );
    };
  for (let rule of utilityRules as Dynamic)
    if (
      !(rule.parent !== undefined || rule.also !== undefined) &&
      classSet.has(rule.className)
    )
      for (let declaration of rule.decls as Dynamic)
        setProperty(declaration, utilityClassSelector(rule));
  for (let rule of utilityRules as Dynamic)
    if (classSet.has(rule.className)) {
      if (rule.also !== undefined) {
        if (!classSet.has(rule.also)) continue;
      } else if (rule.parent !== undefined) {
        if (!parentClasses || !parentClasses.has(rule.parent)) continue;
      } else continue;
      for (let declaration of rule.decls as Dynamic)
        setProperty(declaration, utilityClassSelector(rule));
    }
  for (let declaration of authored as Dynamic) setProperty(declaration);
  return [...entries.values()];
}
function getCssPropertySources(declarations?: Dynamic): Dynamic {
  let entries: Dynamic = new Map(),
    recordSource: Dynamic = (prop?: Dynamic, selector?: Dynamic): Dynamic => {
      entries.delete(prop);
      entries.set(prop, selector);
    };
  for (let declaration of declarations as Dynamic) {
    let expanded: Dynamic = expandCssShorthand(declaration);
    if (expanded) {
      recordSource(declaration.prop, declaration.selector);
      for (let longhand of expanded as Dynamic)
        recordSource(longhand.prop, declaration.selector);
    } else recordSource(declaration.prop, declaration.selector);
  }
  let sources: Dynamic = Object.create(null);
  for (let [prop, selector] of entries as Dynamic)
    selector !== undefined && (sources[prop] = selector);
  return sources;
}
export {
  getCssPropertySources,
  mergeAuthoredStyle,
  resolveCssVariable,
  utilityClassSelector,
};
export function installEditorCssInheritance(): () => void {
  return () => {};
}
