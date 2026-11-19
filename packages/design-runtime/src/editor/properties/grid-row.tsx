import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseEqualGridColumns, serializeEqualGridColumns } from "../css/grid";
import { PropertyTextInput } from "./css-number-row";
import { PropertyRow } from "./row";

function PropertyGridColumnsRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let columnCount: Dynamic = parseEqualGridColumns(
      state.mixed ? null : state.value,
    ),
    fallbackColumnCount: Dynamic = parseEqualGridColumns(state.fallback),
    minColumns: Dynamic = state.spec?.min ?? 1,
    maxColumns: Dynamic = state.spec?.max ?? 12,
    commitColumnsText: Dynamic = (text?: Dynamic): Dynamic => {
      let trimmedText: Dynamic = text.trim();
      if (!trimmedText) {
        onCommit(state.prop, null);
        return;
      }
      let parsedCount: Dynamic = /^\d{1,3}$/.test(trimmedText)
        ? parseInt(trimmedText, 10)
        : null;
      onCommit(
        state.prop,
        parsedCount != null && parsedCount >= 1
          ? serializeEqualGridColumns(
              Math.min(maxColumns, Math.max(minColumns, parsedCount)),
            )
          : trimmedText,
      );
    };
  return (
    <PropertyRow {...shell}>
      <PropertyTextInput
        display={state.mixed || columnCount == null ? "" : String(columnCount)}
        placeholder={
          state.mixed ? (uiMessage("inspector.gridRow.mixed")) : (fallbackColumnCount != null ? (String(fallbackColumnCount)) : (uiMessage("inspector.gridRow.auto")))
        }
        title={state.spec?.hint}
        aria-label={state.label}
        disabled={state.disabled}
        onCommitText={commitColumnsText}
        onArrowStep={(text?: Dynamic, step?: Dynamic): Dynamic => {
          if (state.mixed) return null;
          let baseCount: Dynamic = /^\d{1,3}$/.test(text.trim())
            ? parseInt(text.trim(), 10)
            : (columnCount ?? fallbackColumnCount ?? 1);
          return String(Math.min(maxColumns, Math.max(minColumns, baseCount + step)));
        }}
      />
    </PropertyRow>
  );
}
function parseGridSpan(spanText?: Dynamic): Dynamic {
  let normalizedText: Dynamic = (spanText ?? "").trim().toLowerCase(),
    spanMatch: Dynamic = /^span\s+(\d{1,2})$/.exec(normalizedText);
  if (!spanMatch) return null;
  let spanCount: Dynamic = parseInt(spanMatch[1], 10);
  return spanCount >= 1 ? spanCount : null;
}
function PropertyGridSpanRow({
  state: state,
  onCommit: onCommit,
  shell: shell,
}: Dynamic): Dynamic {
  useUiLocale();
  let span: Dynamic = parseGridSpan(state.mixed ? null : state.value),
    fallbackSpan: Dynamic = state.inheritedFrom
      ? parseGridSpan(state.fallback ?? null)
      : null,
    minSpan: Dynamic = state.spec?.min ?? 1,
    maxSpan: Dynamic = state.spec?.max ?? 12,
    commitSpan: Dynamic = (spanCount?: Dynamic): Dynamic =>
      onCommit(
        state.prop,
        spanCount <= 1 ? (state.inheritedFrom ? "auto" : null) : `span ${spanCount}`,
      );
  return (
    <PropertyRow {...shell}>
      <PropertyTextInput
        display={state.mixed || span == null ? "" : String(span)}
        placeholder={
          state.mixed ? (uiMessage("inspector.gridRow.mixed")) : (String(parseGridSpan(state.fallback ?? null) ?? 1))
        }
        aria-label={state.label}
        disabled={state.disabled}
        onCommitText={(text?: Dynamic): Dynamic => {
          let trimmedText: Dynamic = text.trim();
          if (!trimmedText) return commitSpan(1);
          let parsedSpan: Dynamic = /^\d{1,2}$/.test(trimmedText)
            ? parseInt(trimmedText, 10)
            : null;
          parsedSpan != null
            ? commitSpan(Math.min(maxSpan, Math.max(minSpan, parsedSpan)))
            : onCommit(state.prop, trimmedText);
        }}
        onArrowStep={(text?: Dynamic, step?: Dynamic): Dynamic => {
          if (state.mixed) return null;
          let baseSpan: Dynamic = /^\d{1,2}$/.test(text.trim())
            ? parseInt(text.trim(), 10)
            : (span ?? fallbackSpan ?? 1);
          return String(Math.min(maxSpan, Math.max(minSpan, baseSpan + step)));
        }}
      />
    </PropertyRow>
  );
}
export {
  parseGridSpan,
  PropertyGridColumnsRow,
  PropertyGridSpanRow,
};
export function installEditorPropertiesGridRow(): () => void {
  return () => {};
}
