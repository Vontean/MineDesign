import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { TextInput } from "../../cds/components/text-input";
import { load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "../chrome/overlay-state";
import { EditorIcon, PropertiesPrimitivesClassNames } from "./primitives";
import { toModuleNamespace } from "../../module-helpers";

var jsxPropertiesPickerSearch: Dynamic;
var joinClassNamesValue_3: Dynamic;
var PropertiesPickerSearchMdLgConfig: Dynamic;
function pickerSearchMatches(
  query?: Dynamic,
  ...candidates: Dynamic[]
): Dynamic {
  let normalizedQuery: Dynamic = query.trim().toLowerCase();
  return (
    normalizedQuery === "" ||
    candidates.some(
      (candidate?: Dynamic): Dynamic =>
        candidate !== undefined && candidate.toLowerCase().includes(normalizedQuery),
    )
  );
}
function pickerSearchInitialIndex(
  query?: Dynamic,
  labels?: Dynamic,
): Dynamic {
  let normalizedQuery: Dynamic = query.trim().toLowerCase(),
    findLabelIndex: Dynamic = (predicate?: Dynamic): Dynamic =>
      labels.findIndex(
        (label?: Dynamic): Dynamic => predicate(label.toLowerCase()),
      );
  return (
    [
      findLabelIndex((label?: Dynamic): Dynamic => label === normalizedQuery),
      findLabelIndex((label?: Dynamic): Dynamic => label.startsWith(normalizedQuery)),
    ].find((index?: Dynamic): Dynamic => index >= 0) ?? 0
  );
}
function pickerSearchKeyHandler(
  itemSelector?: Dynamic,
  { across: acrossColumns = false }: Dynamic = {},
): Dynamic {
  return (event?: Dynamic): Dynamic => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    )
      return;
    let isPrevious: Dynamic =
        event.key === "ArrowUp" || (acrossColumns && event.key === "ArrowLeft"),
      isNext: Dynamic =
        event.key === "ArrowDown" || (acrossColumns && event.key === "ArrowRight");
    if (!isPrevious && !isNext && event.key !== "Home" && event.key !== "End")
      return;
    let target: Dynamic = event.target;
    if (!(target instanceof HTMLElement)) return;
    let focusableItems: Dynamic = Array.from(
        event.currentTarget.querySelectorAll(itemSelector),
      ).flatMap((item?: Dynamic): Dynamic => {
        if (!item.matches(":disabled")) return [item];
        let parentElement: Dynamic = item.parentElement;
        return parentElement !== null &&
          parentElement !== event.currentTarget &&
          parentElement.tabIndex >= 0 &&
          parentElement.firstElementChild === item &&
          parentElement.querySelectorAll(itemSelector).length === 1
          ? [parentElement]
          : [];
      }),
      currentIndex: Dynamic = focusableItems.indexOf(target);
    if (currentIndex === -1) return;
    let nextIndex: Dynamic =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? focusableItems.length - 1
          : (currentIndex + (isNext ? 1 : -1) + focusableItems.length) % focusableItems.length;
    event.preventDefault();
    focusableItems[nextIndex].focus();
  };
}
function PickerSearchInput({
  value: searchText,
  onChange: onChange,
  label: label,
  rowSelector: rowSelector,
  onEnterIndex: onEnterIndex,
  className: className,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div className={className ?? "mt-0.5 mb-2 w-0 min-w-full"}>
      <TextInput
        value={searchText}
        onChange={(event?: Dynamic): Dynamic => onChange(event.target.value)}
        onKeyDown={(event?: Dynamic): Dynamic => {
          if (event.nativeEvent.isComposing) return;
          let rows: Dynamic = Array.from(
              event.currentTarget
                .closest("[data-search-scope]")
                ?.querySelectorAll(rowSelector) ?? [],
            ).filter(
              (row?: Dynamic): Dynamic => !row.matches(":disabled"),
            ),
            edgeRow: Dynamic =
              event.key === "ArrowDown"
                ? rows[0]
                : event.key === "ArrowUp"
                  ? rows[rows.length - 1]
                  : undefined;
          if (edgeRow !== undefined) {
            event.preventDefault();
            edgeRow.focus();
          } else if (
            event.key === "Enter" &&
            searchText.trim() !== "" &&
            rows.length > 0
          ) {
            event.preventDefault();
            rows[onEnterIndex?.() ?? 0]?.click();
          } else if (event.key === "Escape" && searchText !== "") {
            event.preventDefault();
            event.stopPropagation();
            onChange("");
            return;
          }
          event.key !== "Escape" &&
            event.key !== "Tab" &&
            event.stopPropagation();
        }}
        slotStart={
          <EditorIcon
            name={"Search"}
            size={14}
            className={"text-muted"}
          />
        }
        placeholder={label}
        aria-label={label}
        clearable={true}
        onClear={(): Dynamic => onChange("")}
        autoComplete={"off"}
        spellCheck={false}
        data-testid={dataTestid}
        data-kit-search={""}
        data-kit={"list-search"}
        className={"w-full"}
      />
    </div>
  );
}
export {
  joinClassNamesValue_3,
  jsxPropertiesPickerSearch,
  pickerSearchInitialIndex,
  PickerSearchInput,
  pickerSearchKeyHandler,
  pickerSearchMatches,
  PropertiesPickerSearchMdLgConfig,
};
export function installEditorPropertiesPickerSearch(): () => void {
  return () => {
    jsxPropertiesPickerSearch = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    joinClassNamesValue_3 = joinClassNames(
      "group/select flex h-control min-w-0 items-center gap-1.5 border-0 pl-md pr-sm text-left font-sans text-body enabled:cursor-default pointer-coarse:h-10",
      PropertiesPrimitivesClassNames,
    );
    PropertiesPickerSearchMdLgConfig = {
      md: "min-h-6",
      lg: "min-h-7",
    };
  };
}
