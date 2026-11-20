import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactForUiContrastControls: typeof import("react");
var RESET_LABEL: string;
var MORE_ACTIONS_LABEL: string;
var DEFAULT_CLOSE_LABEL: string;
var TYPE_LABEL: string;
var MIXED_LABEL: string;
var COLOR_LABEL: string;
var COLOR_SEARCH_LABEL: string;
var NO_COLOR_MATCHES_LABEL: string;
var INCREASE_LABEL: string;
var DECREASE_LABEL: string;
var CONTRAST_GROUND_PREPOSITION: string;
var CONTRAST_POOR_GROUND_PREPOSITION: string;
var CONTRAST_PASSES_LABEL: string;
var CONTRAST_FAILS_LABEL: string;
var COLOR_FIX_LABEL: string;
var UNDO_COMPLETE_LABEL: string;
var REDO_COMPLETE_LABEL: string;
var UNDO_UNAVAILABLE_LABEL: string;
var REDO_UNAVAILABLE_LABEL: string;
function numberChangeRefusalMessage(label?: string, unit?: string): string {
  return (
    uiMessage("design-system.propertyLabels.nothingChanged") +
    (label ?? uiMessage("design-system.propertyLabels.thisField")) +
    " takes a number " +
    (unit ? uiMessage("design-system.propertyLabels.in") + unit : "only") +
    "."
  );
}
function additionalPassingGroundsMessage(count: number): string {
  if (count > 0) {
    return (
      "; " +
      String(count) +
      (count === 1 ? " more ground passes" : " more grounds pass")
    );
  } else {
    return "";
  }
}
function contrastResultSummary(result: Color.ContrastSentence): string {
  return (
    (result.passes ? uiMessage("design-system.propertyLabels.goodContrast") : uiMessage("design-system.propertyLabels.poorContrast")) +
    ", " +
    result.ratio +
    " " +
    CONTRAST_GROUND_PREPOSITION +
    " " +
    result.ground +
    (result.passes ? "" : ", below " + result.min)
  );
}
function contrastResultDetails(
  result: Color.ContrastDetailsSentence,
): string {
  let value = contrastResultSummary(result),
    failingGrounds = result.alsoFailing ?? [];
  if (failingGrounds.length > 0) {
    value += "; also below " + result.min + " on " + failingGrounds.join(" and ");
  }
  return value + additionalPassingGroundsMessage(result.alsoPassing ?? 0);
}
function contrastResultCountSummary(
  result: Color.ContrastCountSentence,
): string {
  let value = result.alsoFailing ?? 0;
  return (
    contrastResultSummary(result) +
    (value > 0
      ? "; also too low on " +
        String(value) +
        (value === 1 ? " more ground" : " more grounds")
      : "") +
    additionalPassingGroundsMessage(result.alsoPassing ?? 0)
  );
}
function contrastFixDescription(fix: {
  hex: string;
  ratio: string;
  ground: string;
}): string {
  return (
    uiMessage("design-system.propertyLabels.changesTheColorTo") +
    fix.hex +
    ", contrast " +
    fix.ratio +
    " on " +
    fix.ground
  );
}
function get_MORE_ACTIONS_LABEL() {
  return uiMessage("design-system.propertyLabels.moreActions");
}
function get_COLOR_SEARCH_LABEL() {
  return uiMessage("design-system.propertyLabels.searchColors");
}
function get_NO_COLOR_MATCHES_LABEL() {
  return uiMessage("design-system.propertyLabels.noMatches");
}
function get_CONTRAST_POOR_GROUND_PREPOSITION() {
  return uiMessage("design-system.propertyLabels.hardToReadOn");
}
function get_CONTRAST_PASSES_LABEL() {
  return uiMessage("design-system.propertyLabels.goodContrast");
}
function get_CONTRAST_FAILS_LABEL() {
  return uiMessage("design-system.propertyLabels.poorContrast");
}
function get_COLOR_FIX_LABEL() {
  return uiMessage("design-system.propertyLabels.useAReadableShade");
}
function get_UNDO_UNAVAILABLE_LABEL() {
  return uiMessage("design-system.propertyLabels.nothingToUndo");
}
function get_REDO_UNAVAILABLE_LABEL() {
  return uiMessage("design-system.propertyLabels.nothingToRedo");
}
export {
  additionalPassingGroundsMessage,
  get_COLOR_FIX_LABEL,
  COLOR_LABEL,
  get_COLOR_SEARCH_LABEL,
  get_CONTRAST_FAILS_LABEL,
  CONTRAST_GROUND_PREPOSITION,
  get_CONTRAST_PASSES_LABEL,
  get_CONTRAST_POOR_GROUND_PREPOSITION,
  contrastFixDescription,
  contrastResultCountSummary,
  contrastResultDetails,
  contrastResultSummary,
  DECREASE_LABEL,
  DEFAULT_CLOSE_LABEL,
  INCREASE_LABEL,
  MIXED_LABEL,
  get_MORE_ACTIONS_LABEL,
  get_NO_COLOR_MATCHES_LABEL,
  numberChangeRefusalMessage,
  reactForUiContrastControls,
  REDO_COMPLETE_LABEL,
  get_REDO_UNAVAILABLE_LABEL,
  RESET_LABEL,
  TYPE_LABEL,
  UNDO_COMPLETE_LABEL,
  get_UNDO_UNAVAILABLE_LABEL,
};
export function installUiPropertyLabels(): () => void {
  return () => {
    reactForUiContrastControls = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    RESET_LABEL = "Reset";
    MORE_ACTIONS_LABEL = "More actions";
    DEFAULT_CLOSE_LABEL = "Close";
    TYPE_LABEL = "Type";
    MIXED_LABEL = "Mixed";
    COLOR_LABEL = "Color";
    COLOR_SEARCH_LABEL = "Search colors";
    NO_COLOR_MATCHES_LABEL = "No matches";
    INCREASE_LABEL = "Increase";
    DECREASE_LABEL = "Decrease";
    CONTRAST_GROUND_PREPOSITION = "on";
    CONTRAST_POOR_GROUND_PREPOSITION = "hard to read on";
    CONTRAST_PASSES_LABEL = "Good contrast";
    CONTRAST_FAILS_LABEL = "Poor contrast";
    COLOR_FIX_LABEL = "Use a readable shade";
    UNDO_COMPLETE_LABEL = "Undone";
    REDO_COMPLETE_LABEL = "Redone";
    UNDO_UNAVAILABLE_LABEL = "Nothing to undo";
    REDO_UNAVAILABLE_LABEL = "Nothing to redo";
  };
}
