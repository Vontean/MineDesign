import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { ColorPickerHeader } from "./color/picker";
import { Menu } from "./menu";
import { joinClassNames, KitIcon } from "./property-icons";
import { FIELD_SURFACE_CLASS } from "./property-row";
import { optionTypeaheadMatch, SelectReact } from "./property-search";
import { TextInput } from "./text-input";

var reactAC: typeof React;
var COARSE_POINTER_QUERY: string;
var SelectJsx: typeof import("react/jsx-runtime");
var selectTriggerClasses: string;
var selectRowSizes: Record<"md" | "lg", string>;
function useMediaQuery(query: string): boolean {
  let callback = reactAC.useCallback(
    (listener: () => void) => {
      if (typeof matchMedia !== "function") {
        return () => {
          return;
        };
      }
      let value = matchMedia(query);
      value.addEventListener("change", listener);
      return () => value.removeEventListener("change", listener);
    },
    [query],
  );
  return reactAC.useSyncExternalStore(
    callback,
    () => typeof matchMedia === "function" && matchMedia(query).matches,
    () => false,
  );
}
function useCoarsePointer() {
  return useMediaQuery(COARSE_POINTER_QUERY);
}
function SelectOptionRow({
  disabledReason: disabledReason,
  className: className,
  rowSize = "md",
  hint: hint,
  children: children,
  ...props
}: C.SelectOptionRowProps) {
  useUiLocale();
  let value = selectRowSizes[rowSize],
    optionContent =
      hint !== undefined && hint !== "" ? (
        <span className={"flex min-w-0 flex-1 items-center gap-1.5"}>
          {[<span className={"min-w-0 truncate"}>{children}</span>, <span className={"shrink-0 text-footnote text-muted"}>
              {hint}
            </span>]}
        </span>
      ) : (
        children
      ),
    rowClassName:
      | string
      | ((state: import("@base-ui/react/menu").Menu.Item.State) => string) =
      typeof className === "function"
        ? (itemState: import("@base-ui/react/menu").Menu.Item.State) =>
            joinClassNames(value, className(itemState))
        : joinClassNames(value, className),
    hasDisabledReason = disabledReason !== undefined && disabledReason !== "";
  return (
    <Menu.Item
      {...props}
      className={rowClassName}
      disabled={props.disabled === true || hasDisabledReason}
      disabledReason={hasDisabledReason ? (disabledReason) : (undefined)}
    >
      {optionContent}
    </Menu.Item>
  );
}
function Select<Value extends string | number>({
  items: items,
  value: selectedValue,
  onChange: onChange,
  "aria-label": ariaLabel,
  placeholder: placeholder,
  hint: hint,
  icon: icon,
  compact = false,
  disabled: disabled,
  title: title,
  align: align,
  popupAttrs: popupAttrs,
  defaultOpen: defaultOpen,
  searchable = false,
  searchLabel = "Search…",
  onOpenChange: onOpenChange,
  className: className,
  "data-testid": dataTestid,
}: C.SelectProps<Value>) {
  useUiLocale();
  let selectedOption =
      selectedValue === null
        ? undefined
        : items.find((option: C.SelectOption<Value>) => option.value === selectedValue),
    triggerIcon = selectedOption?.icon ?? icon,
    hasOptionIcons = items.some((option: C.SelectOption<Value>) => option.icon != null),
    selectedLabel =
      selectedOption?.label ??
      placeholder ??
      (selectedValue !== null && selectedValue !== "" ? String(selectedValue) : undefined),
    triggerText = selectedLabel ?? hint ?? "",
    [searchQuery, setSearchQuery] = (SelectReact as typeof React).useState(""),
    ref = (SelectReact as typeof React).useRef<HTMLInputElement>(
      null,
    ),
    usesCoarsePointer = useCoarsePointer(),
    normalizedQuery = searchable ? searchQuery.trim().toLowerCase() : "",
    visibleOptions =
      normalizedQuery === ""
        ? items
        : items.filter((option: C.SelectOption<Value>) =>
            option.label.toLowerCase().includes(normalizedQuery),
          ),
    callback = (element: HTMLElement, includeDisabled = false) =>
      Array.from<HTMLElement>(
        element
          .closest('[role="menu"]')
          ?.querySelectorAll<HTMLElement>(
            '[role^="menuitem"]' +
              (includeDisabled ? "" : ':not([aria-disabled="true"])'),
          ) ?? [],
      ),
    redirectTypingToSearch = (event: C.SelectKeyEvent) => {
      let current = ref.current,
        usesAltGraph = event.getModifierState("AltGraph");
      if (
        !current ||
        (event.target as HTMLElement).closest("input") ||
        event.nativeEvent.isComposing ||
        event.keyCode === 229 ||
        event.key.length !== 1 ||
        event.key === " " ||
        ((event.ctrlKey || event.altKey) && !usesAltGraph) ||
        event.metaKey
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      event.preventBaseUIHandler();
      current.focus({
        preventScroll: true,
      });
      setSearchQuery(current.value + event.key);
    },
    preserveSearchFocus = (event: C.SelectPointerEvent) => {
      let target = event.target as HTMLElement;
      if (
        target instanceof
          (target.ownerDocument.defaultView ?? window).HTMLInputElement ||
        target === event.currentTarget
      ) {
        return;
      }
      if (
        target.classList.contains("overflow-y-auto") &&
        event.nativeEvent.offsetX >= target.clientWidth
      ) {
        return;
      }
      event.preventDefault();
    };
  return (
    <Menu.Root
      disabled={disabled}
      defaultOpen={defaultOpen}
      onOpenChange={(nextOpen: boolean) => {
        if (!nextOpen) {
          setSearchQuery("");
        }
        onOpenChange?.(nextOpen);
      }}
    >
      {[<Menu.Trigger
          disabled={disabled}
          render={
            <button
              type={"button"}
              data-kit={"PropertySelect"}
              data-testid={dataTestid}
              aria-label={
                triggerText === "" ? (ariaLabel) : (((ariaLabel) + (": ")) + (triggerText))
              }
              title={title}
              className={joinClassNames(
                selectTriggerClasses,
                compact ? "w-[4.5rem] shrink-0" : "w-full flex-1",
                className,
              )}
            >
              {[triggerIcon != null ? (
                  <KitIcon
                    name={triggerIcon}
                    size={13}
                    className={
                      selectedOption?.icon != null ? "text-primary" : "text-muted"
                    }
                  />
                ) : null, <span
                  className={joinClassNames(
                    "min-w-0 flex-1 truncate",
                    selectedLabel === undefined && "text-muted",
                    selectedOption === undefined &&
                      triggerText === "Mixed" &&
                      "text-muted",
                  )}
                >
                  {triggerText}
                </span>, <KitIcon
                  name={"CaretDown"}
                  size={16}
                  className={
                    "mr-0.5 shrink-0 text-muted transition-colors group-enabled/select:group-hover/select:text-secondary"
                  }
                />]}
            </button>
          }
        />, <Menu.Popup
          {...popupAttrs}
          align={align ?? (hasOptionIcons ? "end" : "start")}
          className={joinClassNames(
            hasOptionIcons
              ? "w-[calc(var(--anchor-width)+1.375rem)]"
              : "w-[var(--anchor-width)]",
            "max-w-none min-w-[12rem] [&_.scroll-fade-y]:[scrollbar-width:none]",
            searchable && "[&_.scroll-fade-y]:[--cds-scroll-fade-size:0px]",
          )}
          {...(searchable
            ? {
                stableWhileOpen: true,
                collisionAvoidance: {
                  side: "flip" as const,
                  align: "shift" as const,
                  fallbackAxisSide: "none" as const,
                },
                maxVisibleItems: 10.5,
                onKeyDown: redirectTypingToSearch,
                onMouseDown: preserveSearchFocus,
                header: (
                  <div className={"m-1 mb-2"}>
                    <TextInput
                      ref={ref}
                      value={searchQuery}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                      ) => setSearchQuery(event.target.value)}
                      onKeyDown={(
                        event: React.KeyboardEvent<HTMLInputElement>,
                      ) => {
                        if (event.nativeEvent.isComposing) {
                          event.stopPropagation();
                          return;
                        }
                        let menuItems = callback(event.currentTarget, true),
                          itemToFocus =
                            event.key === "ArrowDown"
                              ? menuItems[0]
                              : event.key === "ArrowUp"
                                ? menuItems[menuItems.length - 1]
                                : undefined;
                        if (itemToFocus !== undefined || event.key === "Enter") {
                          event.preventDefault();
                          event.stopPropagation();
                          if (itemToFocus !== undefined) {
                            itemToFocus.focus();
                          } else if (normalizedQuery !== "") {
                            callback(event.currentTarget)[
                              optionTypeaheadMatch(
                                normalizedQuery,
                                visibleOptions
                                  .filter(
                                    (option: C.SelectOption<Value>) =>
                                      option.disabled !== true,
                                  )
                                  .map(
                                    (option: C.SelectOption<Value>) =>
                                      option.label,
                                  ),
                              )
                            ]?.click();
                          }
                          return;
                        }
                        if (event.key === "Escape") {
                          event.preventDefault();
                        } else if (event.key !== "Tab") {
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
                      placeholder={searchLabel}
                      aria-label={searchLabel}
                      autoComplete={"off"}
                      spellCheck={false}
                      clearable={true}
                      onClear={() => setSearchQuery("")}
                      autoFocus={!usesCoarsePointer}
                      tabIndex={usesCoarsePointer ? -1 : undefined}
                      data-kit={"list-search"}
                      className={"w-full"}
                    />
                  </div>
                ),
              }
            : {})}
        >
          {[groupAdjacentSelectOptions(visibleOptions).map(
              (
                groupOptions: C.SelectOption<Value>[],
                groupIndex: number,
                optionGroups: C.SelectOption<Value>[][],
              ) => {
                let { group: group, subgroup: subgroup } = groupOptions[0];
                return (() => {
                  const GroupFragment = SelectReact.Fragment;
                  const groupFragmentProps = {
                    children: [
                      group !== undefined &&
                      group !== optionGroups[groupIndex - 1]?.[0]?.group ? (
                        <SelectJsx.Fragment>
                          {[groupIndex > 0 ? <Menu.Separator /> : null, <ColorPickerHeader
                              text={group}
                              title={true}
                            />]}
                        </SelectJsx.Fragment>
                      ) : null,
                      <Menu.Group
                        aria-label={
                          group !== undefined && subgroup !== undefined ? (((group) + (" · ")) + (subgroup)) : (group)
                        }
                      >
                        {[subgroup !== undefined ? (
                            <ColorPickerHeader text={subgroup} />
                          ) : null, groupOptions.map((option: C.SelectOption<Value>) =>
                            (() => {
                              const _Element = SelectJsx.Fragment;
                              const _elementProps = {
                                children: [
                                  option.separatorBefore === true ? (
                                    <Menu.Separator />
                                  ) : null,
                                  <SelectOptionRow
                                    checked={option.value === selectedValue}
                                    checkedRole={"radio"}
                                    label={option.label}
                                    icon={option.icon}
                                    disabled={option.disabled}
                                    title={option.title}
                                    disabledReason={
                                      option.disabled === true ? (option.title) : (undefined)
                                    }
                                    hint={option.hint}
                                    rowSize={
                                      option.labelStyle !== undefined
                                        ? "lg"
                                        : "md"
                                    }
                                    onClick={() => {
                                      if (option.value !== selectedValue) {
                                        onChange(option.value);
                                      }
                                    }}
                                  >
                                    {option.labelStyle !== undefined ? (<span
                                        className={
                                          "truncate leading-tight [font-variation-settings:normal]"
                                        }
                                        style={option.labelStyle}
                                      >
                                        {option.label}
                                      </span>) : (option.label)}
                                  </SelectOptionRow>,
                                ],
                              };
                              const _elementKey = option.value;
                              return (
                                <_Element
                                  key={_elementKey}
                                  {..._elementProps}
                                />
                              );
                            })(),
                          )]}
                      </Menu.Group>,
                    ],
                  };
                  const groupKey =
                    (group ?? "") +
                    ":" +
                    (subgroup ?? "") +
                    ":" +
                    groupOptions[0].value;
                  return <GroupFragment key={groupKey} {...groupFragmentProps} />;
                })();
              },
            ), searchable && visibleOptions.length === 0 ? (
              <Menu.Item disabled={true}>
                {uiMessage("design-system.select.noMatches")}
              </Menu.Item>
            ) : null]}
        </Menu.Popup>]}
    </Menu.Root>
  );
}
function groupAdjacentSelectOptions<Option extends C.SelectOption>(
  options: readonly Option[],
): Option[][] {
  let items: Option[][] = [];
  for (let value of options) {
    let previousGroup = items[items.length - 1];
    if (
      previousGroup !== undefined &&
      previousGroup[0].group === value.group &&
      previousGroup[0].subgroup === value.subgroup
    ) {
      previousGroup.push(value);
    } else {
      items.push([value]);
    }
  }
  return items;
}
export {
  COARSE_POINTER_QUERY,
  groupAdjacentSelectOptions,
  reactAC,
  Select,
  SelectJsx,
  SelectOptionRow,
  selectRowSizes,
  selectTriggerClasses,
  useCoarsePointer,
  useMediaQuery,
};
export function installUiSelect(): () => void {
  return () => {
    reactAC = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    COARSE_POINTER_QUERY = "(pointer: coarse)";
    SelectJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    selectTriggerClasses = joinClassNames(
      "group/select flex h-control min-w-0 items-center gap-1.5 border-0 pl-md pr-sm text-left font-sans text-body enabled:cursor-default pointer-coarse:h-10",
      FIELD_SURFACE_CLASS,
    );
    selectRowSizes = {
      md: "min-h-6",
      lg: "min-h-7",
    };
  };
}
