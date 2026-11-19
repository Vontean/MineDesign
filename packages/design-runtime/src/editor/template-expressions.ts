/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var EditorTemplateExpressionsAZaZAZaZPattern: Dynamic;
var EditorTemplateExpressionsPattern: Dynamic;
function evaluateTemplateExpression(
  scope?: Dynamic,
  expression?: Dynamic,
): Dynamic {
  let value: Dynamic = String(expression).trim();
  if (!value) return;
  if (
    value[0] === "(" &&
    value[value.length - 1] === ")" &&
    hasOuterExpressionParentheses(value)
  )
    return evaluateTemplateExpression(scope, value.slice(1, -1));
  let comparison: Dynamic = findExpressionComparison(value);
  if (comparison) {
    let leftValue: Dynamic = evaluateTemplateExpression(
        scope,
        value.slice(0, comparison.index),
      ),
      rightValue: Dynamic = evaluateTemplateExpression(
        scope,
        value.slice(comparison.index + comparison.op.length),
      );
    switch (comparison.op) {
      case "===":
        return leftValue === rightValue;
      case "!==":
        return leftValue !== rightValue;
      case "==":
        return leftValue == rightValue;
      default:
        return leftValue != rightValue;
    }
  }
  if (value[0] === "!")
    return !evaluateTemplateExpression(scope, value.slice(1));
  if (value === "true") return true;
  if (value === "false") return false;
  if (value === "null") return null;
  if (value !== "undefined")
    return EditorTemplateExpressionsPattern.test(value)
      ? Number(value)
      : value.length >= 2 &&
          (value[0] === '"' || value[0] === "'") &&
          value[value.length - 1] === value[0]
        ? value.slice(1, -1)
        : resolveExpressionPath(scope, value);
}
function hasOuterExpressionParentheses(items?: Dynamic): Dynamic {
  let index: Dynamic = 0;
  for (let position: Dynamic = 0; position < items.length - 1; position++)
    if (items[position] === "(") index++;
    else if (items[position] === ")" && (index--, index === 0)) return false;
  return true;
}
function findExpressionComparison(items?: Dynamic): Dynamic {
  let index: Dynamic = 0;
  for (let position: Dynamic = 0; position < items.length; position++) {
    let value: Dynamic = items[position];
    if (value === "[" || value === "(") index++;
    else if (value === "]" || value === ")") index--;
    else if (
      index === 0 &&
      (value === "=" || value === "!") &&
      items[position + 1] === "="
    ) {
      if (
        (position > 0 &&
          (items[position - 1] === "=" || items[position - 1] === "!")) ||
        !items.slice(0, position).trim()
      )
        continue;
      let operator: Dynamic =
        items[position + 2] === "=" ? value + "==" : value + "=";
      return {
        index: position,
        op: operator,
      };
    }
  }
  return null;
}
function resolveExpressionPath(scope?: Dynamic, items?: Dynamic): Dynamic {
  let value: Dynamic = items.match(EditorTemplateExpressionsAZaZAZaZPattern);
  if (!value) return;
  let resolvedValue: Dynamic = scope?.[value[0]],
    length: Dynamic = value[0].length;
  for (; length < items.length; )
    if (items[length] === ".") {
      let pathSegment: Dynamic =
        items
          .slice(length + 1)
          .match(EditorTemplateExpressionsAZaZAZaZPattern) ||
        items.slice(length + 1).match(/^\d+/);
      if (!pathSegment) return;
      resolvedValue = resolvedValue?.[pathSegment[0]];
      length += 1 + pathSegment[0].length;
    } else if (items[length] === "[") {
      let count: Dynamic = 1,
        bracketEnd: Dynamic = length + 1;
      for (; bracketEnd < items.length && count > 0; ) {
        if (items[bracketEnd] === "[") count++;
        else if (items[bracketEnd] === "]" && (count--, count === 0)) break;
        bracketEnd++;
      }
      if (count !== 0) return;
      let indexExpression: Dynamic = evaluateTemplateExpression(
        scope,
        items.slice(length + 1, bracketEnd),
      );
      resolvedValue = resolvedValue?.[indexExpression];
      length = bracketEnd + 1;
    } else return;
  return resolvedValue;
}
export {
  EditorTemplateExpressionsAZaZAZaZPattern,
  EditorTemplateExpressionsPattern,
  evaluateTemplateExpression,
  findExpressionComparison,
  hasOuterExpressionParentheses,
  resolveExpressionPath,
};
export function installEditorTemplateExpressions(): () => void {
  return () => {
    EditorTemplateExpressionsAZaZAZaZPattern = /^[A-Za-z_$][A-Za-z0-9_$]*/;
    EditorTemplateExpressionsPattern = /^-?\d+(\.\d+)?$/;
  };
}
