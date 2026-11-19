/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { getStyleProperty, parseStyleDeclarations } from "./declarations";
import { resolveCssVariable } from "./inheritance";

var CssRulesNoneTransparentPattern: Dynamic;
function isUnescapedCharacter(text?: Dynamic, index?: Dynamic): Dynamic {
  let precedingIndex: Dynamic = index - 1;
  for (; precedingIndex >= 0 && text[precedingIndex] === "\\"; )
    precedingIndex--;
  return (index - 1 - precedingIndex) % 2 === 0;
}
function stripCssComments(css?: Dynamic): Dynamic {
  let stripped: Dynamic = "",
    position: Dynamic = 0,
    quoteChar: Dynamic = null;
  for (; position < css.length; ) {
    let char: Dynamic = css[position];
    if (quoteChar) {
      stripped += char;
      char === quoteChar &&
        isUnescapedCharacter(css, position) &&
        (quoteChar = null);
      position++;
    } else if (char === '"' || char === "'") {
      quoteChar = char;
      stripped += char;
      position++;
    } else if (char === "/" && css[position + 1] === "*") {
      let commentEnd: Dynamic = css.indexOf("*/", position + 2);
      position = commentEnd === -1 ? css.length : commentEnd + 2;
    } else {
      stripped += char;
      position++;
    }
  }
  return stripped;
}
function parseUtilityClasses(css?: Dynamic): Dynamic {
  let strippedCss: Dynamic = stripCssComments(css),
    rules: Dynamic = [],
    position: Dynamic = 0;
  for (; position < strippedCss.length; ) {
    let braceIndex: Dynamic = strippedCss.indexOf("{", position);
    if (braceIndex === -1) break;
    let semicolonIndex: Dynamic = strippedCss.indexOf(";", position);
    if (semicolonIndex !== -1 && semicolonIndex < braceIndex) {
      position = semicolonIndex + 1;
      continue;
    }
    let selectorList: Dynamic = strippedCss.slice(position, braceIndex).trim(),
      braceDepth: Dynamic = 1,
      bodyPosition: Dynamic = braceIndex + 1,
      quoteChar: Dynamic = null;
    for (; bodyPosition < strippedCss.length && braceDepth > 0; ) {
      let char: Dynamic = strippedCss[bodyPosition++];
      quoteChar
        ? char === quoteChar &&
          isUnescapedCharacter(strippedCss, bodyPosition - 1) &&
          (quoteChar = null)
        : char === '"' || char === "'"
          ? (quoteChar = char)
          : char === "{"
            ? braceDepth++
            : char === "}" && braceDepth--;
    }
    let ruleBody: Dynamic = strippedCss.slice(
      braceIndex + 1,
      braceDepth === 0 ? bodyPosition - 1 : bodyPosition,
    );
    position = bodyPosition;
    if (selectorList.startsWith("@")) continue;
    let decls: Dynamic = parseStyleDeclarations(ruleBody);
    for (let selectorPart of selectorList.split(",") as Dynamic) {
      let selector: Dynamic = selectorPart.trim(),
        simpleMatch: Dynamic = /^\.(-?[_A-Za-z][\w-]*)$/.exec(selector);
      if (simpleMatch) {
        rules.push({
          className: simpleMatch[1],
          decls: decls,
        });
        continue;
      }
      let compoundMatch: Dynamic =
        /^\.(-?[_A-Za-z][\w-]*)\.(-?[_A-Za-z][\w-]*)$/.exec(selector);
      if (compoundMatch) {
        rules.push({
          className: compoundMatch[1],
          also: compoundMatch[2],
          decls: decls,
        });
        continue;
      }
      let descendantMatch: Dynamic =
        /^\.(-?[_A-Za-z][\w-]*)\s+\.(-?[_A-Za-z][\w-]*)$/.exec(selector);
      descendantMatch &&
        rules.push({
          parent: descendantMatch[1],
          className: descendantMatch[2],
          decls: decls,
        });
    }
  }
  return rules;
}
function findCssRules(css?: Dynamic, selector?: Dynamic): Dynamic {
  let ruleRanges: Dynamic = [],
    targetSelector: Dynamic = selector.toLowerCase(),
    preludeText: Dynamic = "",
    braceDepth: Dynamic = 0,
    parenDepth: Dynamic = 0,
    bodyStart: Dynamic = -1,
    isTargetRule: Dynamic = false,
    isOnlyTarget: Dynamic = false,
    isConditionalBlock: Dynamic = false,
    quoteChar: Dynamic = null;
  for (let position: Dynamic = 0; position < css.length; position++) {
    let char: Dynamic = css[position];
    if (quoteChar) {
      char === quoteChar &&
        isUnescapedCharacter(css, position) &&
        (quoteChar = null);
      continue;
    }
    if (char === '"' || char === "'") {
      quoteChar = char;
      braceDepth === 0 && (preludeText += char);
      continue;
    }
    if (char === "/" && css[position + 1] === "*") {
      let commentEnd: Dynamic = css.indexOf("*/", position + 2);
      position = commentEnd === -1 ? css.length : commentEnd + 1;
      continue;
    }
    if (braceDepth === 0) {
      if (char === ";") preludeText = "";
      else if (char === "{") {
        let selectors: Dynamic = preludeText
          .trim()
          .split(",")
          .map((selectorText?: Dynamic): Dynamic => selectorText.trim().toLowerCase());
        isTargetRule = !selectors[0].startsWith("@") && selectors.includes(targetSelector);
        isOnlyTarget = selectors.every(
          (selectorText?: Dynamic): Dynamic => selectorText === targetSelector || selectorText === "html",
        );
        let atRuleName: Dynamic = /^@(media|supports|layer|container)\b/i
            .exec(selectors[0])?.[1]
            ?.toLowerCase(),
          mediaConditions: Dynamic = [
            selectors[0].replace(/^@media\b/i, ""),
            ...selectors.slice(1),
          ].map((condition?: Dynamic): Dynamic => condition.trim());
        isConditionalBlock =
          atRuleName !== undefined &&
          !(
            atRuleName === "media" &&
            mediaConditions.every(
              (condition?: Dynamic): Dynamic => /^(only\s+)?print\b/.test(condition),
            )
          );
        bodyStart = position + 1;
        braceDepth = 1;
        parenDepth = 0;
        preludeText = "";
      } else preludeText += char;
      continue;
    }
    if (char === "(") parenDepth++;
    else if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    else {
      if (parenDepth > 0) continue;
      if (char === "{") braceDepth++;
      else if (char === "}" && --braceDepth === 0) {
        if (isTargetRule)
          ruleRanges.push({
            start: bodyStart,
            end: position,
            only: isOnlyTarget,
          });
        else if (isConditionalBlock)
          for (let nestedRange of findCssRules(
            css.slice(bodyStart, position),
            selector,
          ) as Dynamic)
            ruleRanges.push({
              start: nestedRange.start + bodyStart,
              end: nestedRange.end + bodyStart,
              only: false,
              cond: true,
            });
        isTargetRule = false;
      }
    }
  }
  braceDepth > 0 &&
    isTargetRule &&
    ruleRanges.push({
      start: bodyStart,
      end: css.length,
      only: isOnlyTarget,
    });
  return ruleRanges;
}
function stripCssNestedContent(css?: Dynamic): Dynamic {
  let depth: Dynamic = 0,
    quoteChar: Dynamic = null,
    currentText: Dynamic = "";
  for (let position: Dynamic = 0; position < css.length; position++) {
    let char: Dynamic = css[position];
    if (quoteChar)
      char === quoteChar &&
        isUnescapedCharacter(css, position) &&
        (quoteChar = null);
    else if (char === '"' || char === "'") {
      quoteChar = char;
      depth === 0 && (currentText += char);
    } else if (char === "/" && css[position + 1] === "*") {
      let commentEnd: Dynamic = css.indexOf("*/", position + 2);
      if (commentEnd === -1) return true;
      position = commentEnd + 1;
    } else if (char === "{") {
      depth++;
      currentText = "";
    } else if (char === "}") {
      if (depth === 0) return true;
      depth--;
      currentText = "";
    } else depth === 0 && (currentText = char === ";" ? "" : currentText + char);
  }
  return depth > 0 || quoteChar !== null || currentText.trim() !== "";
}
function parseCssRuleDeclarations(css?: Dynamic): Dynamic {
  let declarations: Dynamic = [],
    declarationStart: Dynamic = 0,
    parenDepth: Dynamic = 0,
    braceDepth: Dynamic = 0,
    quoteChar: Dynamic = null,
    pushDeclaration: Dynamic = (
      end?: Dynamic,
      shouldRecord: Dynamic = true,
    ): Dynamic => {
      let declarationText: Dynamic = stripCssComments(css.slice(declarationStart, end)),
        colonIndex: Dynamic = declarationText.indexOf(":"),
        prop: Dynamic =
          colonIndex > 0 ? declarationText.slice(0, colonIndex).trim().toLowerCase() : "";
      shouldRecord &&
        /^-{0,2}[_a-z][\w-]*$/i.test(prop) &&
        declarationText.slice(colonIndex + 1).trim() &&
        declarations.push({
          prop: prop,
          start: declarationStart,
          end: end,
        });
      declarationStart = end;
    };
  for (let position: Dynamic = 0; position < css.length; position++) {
    let char: Dynamic = css[position];
    if (quoteChar)
      char === quoteChar &&
        isUnescapedCharacter(css, position) &&
        (quoteChar = null);
    else if (char === '"' || char === "'") quoteChar = char;
    else if (char === "/" && css[position + 1] === "*") {
      let commentEnd: Dynamic = css.indexOf("*/", position + 2);
      position = commentEnd === -1 ? css.length : commentEnd + 1;
    } else if (char === "(") parenDepth++;
    else if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
    else {
      if (parenDepth > 0) continue;
      char === "{"
        ? braceDepth++
        : char === "}" && braceDepth > 0
          ? --braceDepth === 0 && pushDeclaration(position + 1, false)
          : char === ";" && braceDepth === 0 && pushDeclaration(position + 1);
    }
  }
  pushDeclaration(Math.max(declarationStart, css.trimEnd().length));
  return declarations;
}
function getCssRuleProperties(
  css?: Dynamic,
  selector?: Dynamic,
  props?: Dynamic,
): Dynamic {
  let properties: Dynamic = [];
  for (let rule of findCssRules(css, selector) as Dynamic) {
    let ruleText: Dynamic = css.slice(rule.start, rule.end);
    for (let declaration of parseCssRuleDeclarations(ruleText) as Dynamic) {
      if (!props.includes(declaration.prop)) continue;
      let declarationText: Dynamic = getStyleProperty(
          stripCssComments(ruleText.slice(declaration.start, declaration.end)).replace(
            /;\s*$/,
            "",
          ),
          declaration.prop,
        ),
        isImportant: Dynamic = /!\s*important\s*$/i.test(declarationText);
      properties.push({
        prop: declaration.prop,
        value: declarationText.replace(/\s*!\s*important\s*$/i, ""),
        important: isImportant,
        rule: rule,
        start: rule.start + declaration.start,
        end: rule.start + declaration.end,
      });
    }
  }
  return properties
    .filter((entry?: Dynamic): Dynamic => !entry.important)
    .concat(properties.filter((entry?: Dynamic): Dynamic => entry.important));
}
function getUnconditionalCssDeclarations(
  css?: Dynamic,
  selector?: Dynamic,
  props?: Dynamic,
): Dynamic {
  return getCssRuleProperties(
    css,
    selector,
    props.map((prop?: Dynamic): Dynamic => prop.toLowerCase()),
  )
    .filter((entry?: Dynamic): Dynamic => !entry.rule.cond)
    .map(
      (entry?: Dynamic): Dynamic => ({
        prop: entry.prop,
        value: entry.value,
      }),
    );
}
function getCssRuleProperty(
  css?: Dynamic,
  selector?: Dynamic,
  prop?: Dynamic,
): Dynamic {
  return (
    getCssRuleProperties(css, selector, [prop.toLowerCase()])
      .filter((entry?: Dynamic): Dynamic => !entry.rule.cond)
      .at(-1)?.value ?? ""
  );
}
function updateCssRuleProperties(
  css?: Dynamic,
  selector?: Dynamic,
  updates?: Dynamic,
  propsToClear: Dynamic = updates.map((update?: Dynamic): Dynamic => update.prop),
  shouldClearOverrides: Dynamic = true,
): Dynamic {
  let propList: Dynamic = [
      ...new Set(
        [
          ...propsToClear,
          ...updates.map((update?: Dynamic): Dynamic => update.prop),
        ].map((prop?: Dynamic): Dynamic => prop.toLowerCase()),
      ),
    ],
    readProperties: Dynamic = (): Dynamic =>
      getCssRuleProperties(css, selector, propList),
    removeRanges: Dynamic = (ranges?: Dynamic): Dynamic => {
      for (let range of [...ranges].sort(
        (rangeA?: Dynamic, rangeB?: Dynamic): Dynamic =>
          rangeB.start - rangeA.start,
      ) as Dynamic)
        css = css.slice(0, range.start) + css.slice(range.end);
    };
  for (let update of updates as Dynamic) {
    if (update.value == null || update.value === "") continue;
    let propLower: Dynamic = update.prop.toLowerCase(),
      existing: Dynamic = readProperties(),
      newDeclaration: Dynamic =
        propLower +
        ": " +
        update.value +
        (existing.some(
          (entry?: Dynamic): Dynamic => entry.important && !entry.rule.only,
        )
          ? " !important"
          : "") +
        ";",
      lastExisting: Dynamic = existing
        .filter((entry?: Dynamic): Dynamic => entry.prop === propLower)
        .at(-1);
    if (
      lastExisting?.rule.only &&
      !lastExisting.important &&
      !existing.some(
        (entry?: Dynamic): Dynamic =>
          (!entry.rule.only || entry.important) &&
          existing.indexOf(entry) > existing.indexOf(lastExisting),
      )
    ) {
      if (lastExisting.value === update.value) continue;
      let existingText: Dynamic = css.slice(lastExisting.start, lastExisting.end),
        leadingSpace: Dynamic = /^(?:\s+|\/\*[\s\S]*?\*\/)*/.exec(existingText)![0];
      css =
        css.slice(0, lastExisting.start) +
        leadingSpace +
        newDeclaration +
        css.slice(lastExisting.end);
      continue;
    }
    removeRanges(
      existing.filter(
        (entry?: Dynamic): Dynamic =>
          entry.prop === propLower && entry.rule.only,
      ),
    );
    let lastRule: Dynamic = readProperties()
        .sort(
          (entryA?: Dynamic, entryB?: Dynamic): Dynamic =>
            entryA.start - entryB.start,
        )
        .at(-1)?.rule,
      targetRule: Dynamic = lastRule?.only
        ? lastRule
        : findCssRules(css, selector)
            .filter(
              (rule?: Dynamic): Dynamic =>
                rule.only && rule.start > (lastRule?.end ?? -1),
            )
            .at(-1);
    if (!targetRule) {
      css +=
        (css.length === 0 || /\n\s*$/.test(css)
          ? ""
          : `
`) +
        selector +
        " { " +
        newDeclaration +
        ` }
`;
      continue;
    }
    let ruleText: Dynamic = css.slice(targetRule.start, targetRule.end),
      trailingSpace: Dynamic = /\s*$/.exec(ruleText)![0],
      ruleBody: Dynamic = ruleText.slice(0, ruleText.length - trailingSpace.length),
      trimmedBody: Dynamic = stripCssComments(ruleBody).trim(),
      separator: Dynamic = trimmedBody === "" || /[;}]$/.test(trimmedBody) ? " " : "; ";
    css =
      css.slice(0, targetRule.start) +
      ruleBody +
      separator +
      newDeclaration +
      (trailingSpace || " ") +
      css.slice(targetRule.end);
  }
  let removedProps: Dynamic = updates
    .filter(
      (update?: Dynamic): Dynamic => update.value == null || update.value === "",
    )
    .map((update?: Dynamic): Dynamic => update.prop.toLowerCase());
  if (
    removedProps.length === 0 ||
    (removeRanges(
      readProperties().filter(
        (entry?: Dynamic): Dynamic =>
          removedProps.includes(entry.prop) && entry.rule.only,
      ),
    ),
    !shouldClearOverrides)
  )
    return css;
  let isSimpleValue: Dynamic = (cssValue?: Dynamic): Dynamic => {
      let resolvedValue: Dynamic = /^var\(/i.test(cssValue)
        ? resolveCssVariable(css, selector, cssValue)
        : cssValue;
      return (
        resolvedValue !== "" &&
        !/\b(url|[\w-]*gradient|image-set|image|cross-fade|element|paint)\(/i.test(
          resolvedValue,
        )
      );
    },
    overrides: Dynamic = (overridingEntry?: Dynamic, targetEntry?: Dynamic): Dynamic =>
      (!targetEntry.important || overridingEntry.important) &&
      (overridingEntry.prop === targetEntry.prop ||
        overridingEntry.prop === "background" ||
        (targetEntry.prop === "background" && isSimpleValue(targetEntry.value)));
  for (let pass: Dynamic = 0; pass < 4; pass++) {
    let currentEntries: Dynamic = readProperties(),
      overridden: Dynamic = removedProps.flatMap((prop?: Dynamic): Dynamic => {
        let lastForProp: Dynamic = currentEntries
          .filter((entry?: Dynamic): Dynamic => entry.prop === prop)
          .at(-1);
        return lastForProp &&
          !lastForProp.rule.only &&
          !CssRulesNoneTransparentPattern.test(lastForProp.value) &&
          !currentEntries.some(
            (entry?: Dynamic): Dynamic =>
              entry.rule.only &&
              entry.start > lastForProp.start &&
              overrides(entry, lastForProp),
          )
          ? [lastForProp]
          : [];
      });
    if (overridden.length === 0) break;
    removeRanges(overridden);
  }
  return css;
}
export {
  CssRulesNoneTransparentPattern,
  findCssRules,
  getCssRuleProperties,
  getCssRuleProperty,
  getUnconditionalCssDeclarations,
  isUnescapedCharacter,
  parseCssRuleDeclarations,
  parseUtilityClasses,
  stripCssComments,
  stripCssNestedContent,
  updateCssRuleProperties,
};
export function installEditorCssRules(): () => void {
  return () => {
    CssRulesNoneTransparentPattern =
      /^(none|transparent|initial|inherit|unset|revert)$/i;
  };
}
