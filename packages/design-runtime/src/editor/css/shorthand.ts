/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { normalizeCssProperty, parseStyleDeclarations, serializeStyleDeclarations, splitCssTokens } from "./declarations";
import { classifyStyleValue, parseCssNumber } from "./values";

var CssShorthandTopRightBottomValues: Dynamic;
var CssShorthandTopLeftTopRightBottomRightValues: Dynamic;
var CssShorthandNoneHiddenDottedSet: Dynamic;
var CssShorthandBorderBorderWidthBorderStyleSet: Dynamic;
var CssShorthandTextDecorationLineTextDecorationStyleTextDecorationColorConfig: Dynamic;
function expandCssSides(sides?: Dynamic): Dynamic {
  if (sides.length === 0 || sides.length > 4) return null;
  let [top, right = top, bottom = top, left = right]: Dynamic =
    sides;
  return [top, right, bottom, left];
}
function expandCssShorthand(declaration?: Dynamic): Dynamic {
  let { prop: prop, value: cssValue }: Dynamic = declaration;
  if (classifyStyleValue(cssValue).kind !== "literal") return null;
  let tokens: Dynamic = splitCssTokens(cssValue, " ")
    .map((token?: Dynamic): Dynamic => token.trim())
    .filter(Boolean);
  switch (prop) {
    case "margin":
    case "padding":
    case "inset": {
      let sides: Dynamic = expandCssSides(tokens);
      if (!sides) return null;
      let propPrefix: Dynamic = prop === "inset" ? "" : `${prop}-`;
      return CssShorthandTopRightBottomValues.map(
        (side?: Dynamic, index?: Dynamic): Dynamic => ({
          prop: prop === "inset" ? side : `${propPrefix}${side}`,
          value: sides[index],
        }),
      );
    }
    case "border-width": {
      if (tokens.length < 2) return null;
      let sides: Dynamic = expandCssSides(tokens);
      return sides
        ? CssShorthandTopRightBottomValues.map(
            (side?: Dynamic, index?: Dynamic): Dynamic => ({
              prop: `border-${side}-width`,
              value: sides[index],
            }),
          )
        : null;
    }
    case "border-radius": {
      if (cssValue.includes("/") || tokens.length < 2) return null;
      let corners: Dynamic = expandCssSides(tokens);
      return corners
        ? CssShorthandTopLeftTopRightBottomRightValues.map(
            (corner?: Dynamic, index?: Dynamic): Dynamic => ({
              prop: `border-${corner}-radius`,
              value: corners[index],
            }),
          )
        : null;
    }
    case "border": {
      let items: Dynamic = [];
      for (let token of tokens as Dynamic)
        CssShorthandNoneHiddenDottedSet.has(token.toLowerCase())
          ? items.push({
              prop: "border-style",
              value: token,
            })
          : parseCssNumber(token) ||
              ["thin", "medium", "thick"].includes(token.toLowerCase())
            ? items.push({
                prop: "border-width",
                value: token,
              })
            : items.push({
                prop: "border-color",
                value: token,
              });
      return items.length ? items : null;
    }
    case "border-top":
    case "border-right":
    case "border-bottom":
    case "border-left": {
      let items: Dynamic = [];
      for (let token of tokens as Dynamic)
        CssShorthandNoneHiddenDottedSet.has(token.toLowerCase())
          ? items.push({
              prop: `${prop}-style`,
              value: token,
            })
          : parseCssNumber(token) ||
              ["thin", "medium", "thick"].includes(token.toLowerCase())
            ? items.push({
                prop: `${prop}-width`,
                value: token,
              })
            : items.push({
                prop: `${prop}-color`,
                value: token,
              });
      return items.length ? items : null;
    }
    case "list-style": {
      let items: Dynamic = [];
      for (let token of tokens as Dynamic) {
        let lowerToken: Dynamic = token.toLowerCase();
        lowerToken === "inside" || lowerToken === "outside"
          ? items.push({
              prop: "list-style-position",
              value: token,
            })
          : /^url\(/i.test(token)
            ? items.push({
                prop: "list-style-image",
                value: token,
              })
            : items.push({
                prop: "list-style-type",
                value: token,
              });
      }
      return items.length ? items : null;
    }
    case "text-decoration": {
      let lineKeywords: Dynamic = new Set([
          "none",
          "underline",
          "overline",
          "line-through",
        ]),
        styleKeywords: Dynamic = new Set([
          "solid",
          "double",
          "dotted",
          "dashed",
          "wavy",
        ]),
        lineParts: Dynamic = [],
        longhands: Dynamic = [];
      for (let token of tokens as Dynamic) {
        let lowerToken: Dynamic = token.toLowerCase();
        lineKeywords.has(lowerToken)
          ? lineParts.push(lowerToken)
          : styleKeywords.has(lowerToken)
            ? longhands.push({
                prop: "text-decoration-style",
                value: token,
              })
            : parseCssNumber(token) ||
                lowerToken === "auto" ||
                lowerToken === "from-font"
              ? longhands.push({
                  prop: "text-decoration-thickness",
                  value: token,
                })
              : longhands.push({
                  prop: "text-decoration-color",
                  value: token,
                });
      }
      lineParts.length &&
        longhands.unshift({
          prop: "text-decoration-line",
          value: lineParts.join(" "),
        });
      return longhands.length ? longhands : null;
    }
    default:
      return null;
  }
}
function expandShorthandForProperty(
  styleText?: Dynamic,
  property?: Dynamic,
  includeBorderShorthands: Dynamic = false,
): Dynamic {
  property = normalizeCssProperty(property);
  let shorthands: Dynamic = (
    CssShorthandTextDecorationLineTextDecorationStyleTextDecorationColorConfig[
      property
    ] ?? []
  ).filter(
    (name?: Dynamic): Dynamic =>
      includeBorderShorthands || !CssShorthandBorderBorderWidthBorderStyleSet.has(name),
  );
  if (shorthands.length === 0 || !styleText) return styleText ?? "";
  let declarations: Dynamic = parseStyleDeclarations(styleText),
    hasExpanded: Dynamic = false;
  for (let shorthandName of shorthands as Dynamic)
    declarations.some((declaration?: Dynamic): Dynamic => declaration.prop === shorthandName) &&
      (declarations = declarations.flatMap((declaration?: Dynamic): Dynamic => {
        if (declaration.prop !== shorthandName) return [declaration];
        let longhands: Dynamic = expandCssShorthand(declaration);
        longhands && (hasExpanded = true);
        return longhands ?? [declaration];
      }));
  return hasExpanded &&
    includeBorderShorthands &&
    !declarations.some((declaration?: Dynamic): Dynamic => declaration.prop === property)
    ? styleText
    : hasExpanded
      ? serializeStyleDeclarations(declarations)
      : styleText;
}
function expandCssDeclarations(declarations?: Dynamic): Dynamic {
  let expanded: Dynamic = [];
  for (let declaration of declarations as Dynamic) {
    let longhands: Dynamic = expandCssShorthand(declaration);
    longhands ? expanded.push(...longhands) : expanded.push(declaration);
  }
  return expanded;
}
export {
  CssShorthandBorderBorderWidthBorderStyleSet,
  CssShorthandNoneHiddenDottedSet,
  CssShorthandTextDecorationLineTextDecorationStyleTextDecorationColorConfig,
  CssShorthandTopLeftTopRightBottomRightValues,
  CssShorthandTopRightBottomValues,
  expandCssDeclarations,
  expandCssShorthand,
  expandCssSides,
  expandShorthandForProperty,
};
export function installEditorCssShorthand(): () => void {
  return () => {
    CssShorthandTopRightBottomValues = ["top", "right", "bottom", "left"];
    CssShorthandTopLeftTopRightBottomRightValues = [
      "top-left",
      "top-right",
      "bottom-right",
      "bottom-left",
    ];
    CssShorthandNoneHiddenDottedSet = new Set([
      "none",
      "hidden",
      "dotted",
      "dashed",
      "solid",
      "double",
      "groove",
      "ridge",
      "inset",
      "outset",
    ]);
    CssShorthandBorderBorderWidthBorderStyleSet = new Set([
      "border",
      "border-width",
      "border-style",
      "border-color",
      "border-radius",
    ]);
    CssShorthandTextDecorationLineTextDecorationStyleTextDecorationColorConfig =
      {
        "text-decoration-line": ["text-decoration"],
        "text-decoration-style": ["text-decoration"],
        "text-decoration-color": ["text-decoration"],
        "text-decoration-thickness": ["text-decoration"],
        "border-width": ["border"],
        "border-style": ["border"],
        "border-color": ["border"],
        ...Object.fromEntries(
          ["top", "right", "bottom", "left"].flatMap(
            (side?: Dynamic): Dynamic =>
              ["width", "style", "color"].map(
                (kind?: Dynamic): Dynamic => [
                  `border-${side}-${kind}`,
                  ["border", `border-${kind}`, `border-${side}`],
                ],
              ),
          ),
        ),
        ...Object.fromEntries(
          CssShorthandTopLeftTopRightBottomRightValues.map(
            (corner?: Dynamic): Dynamic => [
              `border-${corner}-radius`,
              ["border-radius"],
            ],
          ),
        ),
        "list-style-type": ["list-style"],
        "list-style-position": ["list-style"],
        "list-style-image": ["list-style"],
      };
  };
}
