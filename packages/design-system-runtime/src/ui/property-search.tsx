import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  OptionListProps,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { KitIcon } from "./property-icons";
import { TextInput } from "./text-input";

var SelectReact: ReactNamespace;
var jsxCommentSelection: JsxNamespace;
var COMMENT_AREA_RESIZE_MIN_PX: number;
function optionMatchesQuery(
  query: string,
  ...values: (string | undefined)[]
) {
  let value = query.trim().toLowerCase();
  return (
    value === "" ||
    values.some(
      (candidate: string | undefined) =>
        candidate !== undefined && candidate.toLowerCase().includes(value),
    )
  );
}
function optionTypeaheadMatch(query: string, options: readonly string[]) {
  let value = query.trim().toLowerCase(),
    callback = (matches: (value: string) => boolean) =>
      options.findIndex((option: string) => matches(option.toLowerCase()));
  return (
    [
      callback((option: string) => option === value),
      callback((option: string) => option.startsWith(value)),
    ].find((optionIndex: number) => optionIndex >= 0) ?? 0
  );
}
function createOptionListKeyHandler(
  command: string,
  {
    across: across = false,
  }: {
    across?: boolean;
  } = {},
) {
  return (event: React.KeyboardEvent<HTMLElement>) => {
    if (
      event.defaultPrevented ||
      event.altKey ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.nativeEvent.isComposing
    ) {
      return;
    }
    let value =
        event.key === "ArrowUp" || (across && event.key === "ArrowLeft"),
      moveForward =
        event.key === "ArrowDown" || (across && event.key === "ArrowRight");
    if (!value && !moveForward && event.key !== "Home" && event.key !== "End") {
      return;
    }
    let target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }
    let focusableOptions = Array.from<HTMLElement>(
        event.currentTarget.querySelectorAll<HTMLElement>(command),
      ).flatMap((option: HTMLElement) => {
        if (!option.matches(":disabled")) {
          return [option];
        }
        let parentElement = option.parentElement;
        if (
          parentElement !== null &&
          parentElement !== event.currentTarget &&
          parentElement.tabIndex >= 0 &&
          parentElement.firstElementChild === option &&
          parentElement.querySelectorAll<HTMLElement>(command).length === 1
        ) {
          return [parentElement];
        } else {
          return [];
        }
      }),
      currentIndex = focusableOptions.indexOf(target);
    if (currentIndex === -1) {
      return;
    }
    let nextIndex =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? focusableOptions.length - 1
          : (currentIndex + (moveForward ? 1 : -1) + focusableOptions.length) % focusableOptions.length;
    event.preventDefault();
    focusableOptions[nextIndex].focus();
  };
}
function OptionList({
  value: query,
  onChange: onChange,
  label: label,
  rowSelector: rowSelector,
  onEnterIndex: onEnterIndex,
  className: className,
  "data-testid": dataTestid,
}: OptionListProps) {
  useUiLocale();
  return (
    <div className={className ?? "mt-0.5 mb-2 w-0 min-w-full"}>
      <TextInput
        value={query}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onChange(event.target.value)
        }
        onKeyDown={(event: React.KeyboardEvent<HTMLElement>) => {
          if (event.nativeEvent.isComposing) {
            return;
          }
          let enabledOptions = Array.from<HTMLElement>(
              event.currentTarget
                .closest("[data-search-scope]")
                ?.querySelectorAll<HTMLElement>(rowSelector) ?? [],
            ).filter((option: HTMLElement) => !option.matches(":disabled")),
            optionToFocus =
              event.key === "ArrowDown"
                ? enabledOptions[0]
                : event.key === "ArrowUp"
                  ? enabledOptions[enabledOptions.length - 1]
                  : undefined;
          if (optionToFocus !== undefined) {
            event.preventDefault();
            optionToFocus.focus();
          } else if (
            event.key === "Enter" &&
            query.trim() !== "" &&
            enabledOptions.length > 0
          ) {
            event.preventDefault();
            enabledOptions[onEnterIndex?.() ?? 0]?.click();
          } else if (event.key === "Escape" && query !== "") {
            event.preventDefault();
            event.stopPropagation();
            onChange("");
            return;
          }
          if (event.key !== "Escape" && event.key !== "Tab") {
            event.stopPropagation();
          }
        }}
        slotStart={
          <KitIcon
            name={"Search"}
            size={14}
            className={"text-muted"}
          />
        }
        placeholder={label}
        aria-label={label}
        clearable={true}
        onClear={() => onChange("")}
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
  COMMENT_AREA_RESIZE_MIN_PX,
  createOptionListKeyHandler,
  jsxCommentSelection,
  OptionList,
  optionMatchesQuery,
  optionTypeaheadMatch,
  SelectReact,
};
export function installUiPropertySearch(): () => void {
  return () => {
    SelectReact = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxCommentSelection = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    COMMENT_AREA_RESIZE_MIN_PX = 12;
  };
}
