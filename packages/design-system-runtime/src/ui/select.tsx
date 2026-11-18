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
function useMediaQuery(input: string): boolean {
  let callback = reactAC.useCallback(
    (input2: () => void) => {
      if (typeof matchMedia !== "function") {
        return () => {
          return;
        };
      }
      let value = matchMedia(input);
      value.addEventListener("change", input2);
      return () => value.removeEventListener("change", input2);
    },
    [input],
  );
  return reactAC.useSyncExternalStore(
    callback,
    () => typeof matchMedia === "function" && matchMedia(input).matches,
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
    value2 =
      hint !== undefined && hint !== "" ? (
        <span className={"flex min-w-0 flex-1 items-center gap-1.5"}>
          {[<span className={"min-w-0 truncate"}>{children}</span>, <span className={"shrink-0 text-footnote text-muted"}>
              {hint}
            </span>]}
        </span>
      ) : (
        children
      ),
    value3:
      | string
      | ((state: import("@base-ui/react/menu").Menu.Item.State) => string) =
      typeof className === "function"
        ? (input: import("@base-ui/react/menu").Menu.Item.State) =>
            joinClassNames(value, className(input))
        : joinClassNames(value, className),
    value4 = disabledReason !== undefined && disabledReason !== "";
  return (
    <Menu.Item
      {...props}
      className={value3}
      disabled={props.disabled === true || value4}
      disabledReason={value4 ? (disabledReason) : (undefined)}
    >
      {value2}
    </Menu.Item>
  );
}
function Select<Value extends string | number>({
  items: items,
  value: value,
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
  let value2 =
      value === null
        ? undefined
        : items.find((input: C.SelectOption<Value>) => input.value === value),
    value3 = value2?.icon ?? icon,
    value4 = items.some((input: C.SelectOption<Value>) => input.icon != null),
    value5 =
      value2?.label ??
      placeholder ??
      (value !== null && value !== "" ? String(value) : undefined),
    value6 = value5 ?? hint ?? "",
    [value7, value8] = (SelectReact as typeof React).useState(""),
    ref = (SelectReact as typeof React).useRef<HTMLInputElement>(
      null,
    ),
    value9 = useCoarsePointer(),
    value10 = searchable ? value7.trim().toLowerCase() : "",
    value11 =
      value10 === ""
        ? items
        : items.filter((input: C.SelectOption<Value>) =>
            input.label.toLowerCase().includes(value10),
          ),
    callback = (input: HTMLElement, options = false) =>
      Array.from<HTMLElement>(
        input
          .closest('[role="menu"]')
          ?.querySelectorAll<HTMLElement>(
            '[role^="menuitem"]' +
              (options ? "" : ':not([aria-disabled="true"])'),
          ) ?? [],
      ),
    callback2 = (event: C.SelectKeyEvent) => {
      let current = ref.current,
        value12 = event.getModifierState("AltGraph");
      if (
        !current ||
        (event.target as HTMLElement).closest("input") ||
        event.nativeEvent.isComposing ||
        event.keyCode === 229 ||
        event.key.length !== 1 ||
        event.key === " " ||
        ((event.ctrlKey || event.altKey) && !value12) ||
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
      value8(current.value + event.key);
    },
    callback3 = (event: C.SelectPointerEvent) => {
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
      onOpenChange={(input: boolean) => {
        if (!input) {
          value8("");
        }
        onOpenChange?.(input);
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
                value6 === "" ? (ariaLabel) : (((ariaLabel) + (": ")) + (value6))
              }
              title={title}
              className={joinClassNames(
                selectTriggerClasses,
                compact ? "w-[4.5rem] shrink-0" : "w-full flex-1",
                className,
              )}
            >
              {[value3 != null ? (
                  <KitIcon
                    name={value3}
                    size={13}
                    className={
                      value2?.icon != null ? "text-primary" : "text-muted"
                    }
                  />
                ) : null, <span
                  className={joinClassNames(
                    "min-w-0 flex-1 truncate",
                    value5 === undefined && "text-muted",
                    value2 === undefined &&
                      value6 === "Mixed" &&
                      "text-muted",
                  )}
                >
                  {value6}
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
          align={align ?? (value4 ? "end" : "start")}
          className={joinClassNames(
            value4
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
                onKeyDown: callback2,
                onMouseDown: callback3,
                header: (
                  <div className={"m-1 mb-2"}>
                    <TextInput
                      ref={ref}
                      value={value7}
                      onChange={(
                        event: React.ChangeEvent<HTMLInputElement>,
                      ) => value8(event.target.value)}
                      onKeyDown={(
                        event: React.KeyboardEvent<HTMLInputElement>,
                      ) => {
                        if (event.nativeEvent.isComposing) {
                          event.stopPropagation();
                          return;
                        }
                        let value12 = callback(event.currentTarget, true),
                          value13 =
                            event.key === "ArrowDown"
                              ? value12[0]
                              : event.key === "ArrowUp"
                                ? value12[value12.length - 1]
                                : undefined;
                        if (value13 !== undefined || event.key === "Enter") {
                          event.preventDefault();
                          event.stopPropagation();
                          if (value13 !== undefined) {
                            value13.focus();
                          } else if (value10 !== "") {
                            callback(event.currentTarget)[
                              optionTypeaheadMatch(
                                value10,
                                value11
                                  .filter(
                                    (input: C.SelectOption<Value>) =>
                                      input.disabled !== true,
                                  )
                                  .map(
                                    (input: C.SelectOption<Value>) =>
                                      input.label,
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
                      onClear={() => value8("")}
                      autoFocus={!value9}
                      tabIndex={value9 ? -1 : undefined}
                      data-kit={"list-search"}
                      className={"w-full"}
                    />
                  </div>
                ),
              }
            : {})}
        >
          {[groupAdjacentSelectOptions(value11).map(
              (
                input: C.SelectOption<Value>[],
                options: number,
                context: C.SelectOption<Value>[][],
              ) => {
                let { group: value12, subgroup: value13 } = input[0];
                return (() => {
                  const _Element2 = SelectReact.Fragment;
                  const _elementProps2 = {
                    children: [
                      value12 !== undefined &&
                      value12 !== context[options - 1]?.[0]?.group ? (
                        <SelectJsx.Fragment>
                          {[options > 0 ? <Menu.Separator /> : null, <ColorPickerHeader
                              text={value12}
                              title={true}
                            />]}
                        </SelectJsx.Fragment>
                      ) : null,
                      <Menu.Group
                        aria-label={
                          value12 !== undefined && value13 !== undefined ? (((value12) + (" · ")) + (value13)) : (value12)
                        }
                      >
                        {[value13 !== undefined ? (
                            <ColorPickerHeader text={value13} />
                          ) : null, input.map((input2: C.SelectOption<Value>) =>
                            (() => {
                              const _Element = SelectJsx.Fragment;
                              const _elementProps = {
                                children: [
                                  input2.separatorBefore === true ? (
                                    <Menu.Separator />
                                  ) : null,
                                  <SelectOptionRow
                                    checked={input2.value === value}
                                    checkedRole={"radio"}
                                    label={input2.label}
                                    icon={input2.icon}
                                    disabled={input2.disabled}
                                    title={input2.title}
                                    disabledReason={
                                      input2.disabled === true ? (input2.title) : (undefined)
                                    }
                                    hint={input2.hint}
                                    rowSize={
                                      input2.labelStyle !== undefined
                                        ? "lg"
                                        : "md"
                                    }
                                    onClick={() => {
                                      if (input2.value !== value) {
                                        onChange(input2.value);
                                      }
                                    }}
                                  >
                                    {input2.labelStyle !== undefined ? (<span
                                        className={
                                          "truncate leading-tight [font-variation-settings:normal]"
                                        }
                                        style={input2.labelStyle}
                                      >
                                        {input2.label}
                                      </span>) : (input2.label)}
                                  </SelectOptionRow>,
                                ],
                              };
                              const _elementKey = input2.value;
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
                  const _elementKey2 =
                    (value12 ?? "") +
                    ":" +
                    (value13 ?? "") +
                    ":" +
                    input[0].value;
                  return <_Element2 key={_elementKey2} {..._elementProps2} />;
                })();
              },
            ), searchable && value11.length === 0 ? (
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
    let value2 = items[items.length - 1];
    if (
      value2 !== undefined &&
      value2[0].group === value.group &&
      value2[0].subgroup === value.subgroup
    ) {
      value2.push(value);
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
