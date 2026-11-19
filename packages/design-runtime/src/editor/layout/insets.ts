/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { getStyleProperty } from "../css/declarations";
import { HtmlTagNormalizationSubscribers } from "../html/tag-normalization";
import { SelectionActionsHelmetScHelmetPattern } from "../selection/actions";

function parseAuthoredInsets(styleText?: Dynamic): Dynamic {
  let state: Dynamic = {
    inset: {
      top: "auto",
      right: "auto",
      bottom: "auto",
      left: "auto",
    },
    margin: {
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
    },
  };
  for (let declaration of styleText.split(";") as Dynamic) {
    let colonIndex: Dynamic = declaration.indexOf(":"),
      propertyName: Dynamic =
        colonIndex < 0 ? "" : declaration.slice(0, colonIndex).trim().toLowerCase(),
      valueTokens: Dynamic =
        colonIndex < 0
          ? []
          : declaration
              .slice(colonIndex + 1)
              .replace(/!important/i, "")
              .trim()
              .toLowerCase()
              .split(/\s+/),
      sideName: Dynamic = /^(?:margin-)?(top|right|bottom|left)$/.exec(
        propertyName,
      )?.[1],
      axisName: Dynamic = /^(?:inset|margin)-(inline|block)$/.exec(propertyName)?.[1],
      boxKind: Dynamic =
        /^(inset|margin)(-inline|-block)?$/.exec(propertyName)?.[1] ??
        (sideName == null
          ? null
          : propertyName.startsWith("margin-")
            ? "margin"
            : "inset");
    (boxKind !== "inset" && boxKind !== "margin") ||
      valueTokens[0] == null ||
      (sideName
        ? (state[boxKind][sideName] = valueTokens[0])
        : axisName === "inline"
          ? Object.assign(state[boxKind], {
              left: valueTokens[0],
              right: valueTokens[1] ?? valueTokens[0],
            })
          : axisName === "block"
            ? Object.assign(state[boxKind], {
                top: valueTokens[0],
                bottom: valueTokens[1] ?? valueTokens[0],
              })
            : Object.assign(state[boxKind], {
                top: valueTokens[0],
                right: valueTokens[1] ?? valueTokens[0],
                bottom: valueTokens[2] ?? valueTokens[0],
                left: valueTokens[3] ?? valueTokens[1] ?? valueTokens[0],
              }));
  }
  return state;
}
function isUnconstrainedAbsoluteElement(
  element?: Dynamic,
  allowConstrainedChildren?: Dynamic,
): Dynamic {
  let styleText: Dynamic = element.getAttribute("style") ?? "",
    positionValue: Dynamic = getStyleProperty(styleText, "position").trim();
  if (positionValue !== "absolute" && positionValue !== "fixed") return false;
  let { inset: insets, margin: margins }: Dynamic = parseAuthoredInsets(styleText),
    isFullSpanOnSide: Dynamic = (side?: Dynamic): Dynamic =>
      /^0(px)?$/.test(insets[side]) &&
      /^100(%|vw|vh)$/.test(
        getStyleProperty(
          styleText,
          side === "left" ? "width" : "height",
        ).trim(),
      ),
    isFullBleed: Dynamic = isFullSpanOnSide("left") && isFullSpanOnSide("top"),
    isConstrainedOnAxis: Dynamic = (startSide?: Dynamic, endSide?: Dynamic): Dynamic =>
      ((insets[startSide] !== "auto" && insets[endSide] !== "auto") || isFullBleed) &&
      !(margins[startSide] === "auto" && margins[endSide] === "auto"),
    hasContentChildren: Dynamic = [...element.children].some(
      (child?: Dynamic): Dynamic =>
        !SelectionActionsHelmetScHelmetPattern.test(child.tagName) &&
        !HtmlTagNormalizationSubscribers.has(
          child.tagName.toLowerCase(),
        ),
    );
  return !(
    (isConstrainedOnAxis("left", "right") || isConstrainedOnAxis("top", "bottom")) &&
    (hasContentChildren || allowConstrainedChildren)
  );
}
export {
  isUnconstrainedAbsoluteElement,
  parseAuthoredInsets,
};
export function installEditorLayoutInsets(): () => void {
  return () => {};
}
