import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { TextInput } from "../../cds/components/text-input";
import { MenuMenuAssignValue } from "../../cds/menu/menu";
import { load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "../chrome/overlay-state";
import { PickerListHeader } from "../color/picker-primitives";
import { reactPropertiesNumericInput } from "./numeric-input";
import { pickerSelectRowClassName, jsxPropertiesPickerSearch, pickerSearchInitialIndex, PropertiesPickerSearchMdLgConfig } from "./picker-search";
import { EditorIcon } from "./primitives";
import { useTouchToolbar } from "../toolbar/layout";
import { toModuleNamespace } from "../../module-helpers";

var jsxPropertiesSelect: Dynamic;
var PropertiesSelectOnKeyDownCaptureConfig: Dynamic;
var PropertiesSelectMin: Dynamic;
function PropertyPickerRow({
  disabledReason: disabledReason,
  className: className,
  rowSize = "md",
  hint: hint,
  children: children,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let sizeClassName: Dynamic = PropertiesPickerSearchMdLgConfig[rowSize],
    rowContent: Dynamic =
      hint !== undefined && hint !== "" ? (
        <span className={"flex min-w-0 flex-1 items-center gap-1.5"}>
          <span className={"min-w-0 truncate"}>{children}</span>
          <span className={"shrink-0 text-footnote text-muted"}>{hint}</span>
        </span>
      ) : (
        children
      ),
    itemClassName: Dynamic =
      typeof className == "function"
        ? (state?: Dynamic): Dynamic =>
            joinClassNames(sizeClassName, className(state))
        : joinClassNames(sizeClassName, className),
    hasDisabledReason: Dynamic = disabledReason !== undefined && disabledReason !== "";
  return (
    <MenuMenuAssignValue.Item
      {...props}
      className={itemClassName}
      disabled={props.disabled === true || hasDisabledReason}
      disabledReason={hasDisabledReason ? (disabledReason) : (undefined)}
    >
      {rowContent}
    </MenuMenuAssignValue.Item>
  );
}
function PropertySelect({
  items: items,
  value: selectedValue,
  onChange: onChange,
  "aria-label": ariaLabel,
  placeholder: placeholder,
  hint: hint,
  icon: icon,
  compact = false,
  disabled: isDisabled,
  title: title,
  align: align,
  popupAttrs: popupAttrs,
  defaultOpen: defaultOpen,
  searchable = false,
  searchLabel = "Search\u2026",
  onOpenChange: onOpenChange,
  className: className,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  let selectedItem: Dynamic =
      selectedValue === null
        ? undefined
        : items.find((item?: Dynamic): Dynamic => item.value === selectedValue),
    displayIcon: Dynamic = selectedItem?.icon ?? icon,
    hasIcons: Dynamic = items.some(
      (item?: Dynamic): Dynamic => item.icon != null,
    ),
    selectedLabel: Dynamic =
      selectedItem?.label ??
      placeholder ??
      (selectedValue !== null && selectedValue !== "" ? String(selectedValue) : undefined),
    triggerText: Dynamic = selectedLabel ?? hint ?? "",
    [searchText, setSearchText]: Dynamic = (0,
    reactPropertiesNumericInput.useState)(""),
    searchInputRef: Dynamic = (0, reactPropertiesNumericInput.useRef)(null),
    isTouchToolbar: Dynamic = useTouchToolbar(),
    normalizedQuery: Dynamic = searchable ? searchText.trim().toLowerCase() : "",
    visibleItems: Dynamic =
      normalizedQuery === ""
        ? items
        : items.filter(
            (item?: Dynamic): Dynamic =>
              item.label.toLowerCase().includes(normalizedQuery),
          ),
    queryMenuItems: Dynamic = (
      menuElement?: Dynamic,
      includeDisabled: Dynamic = false,
    ): Dynamic =>
      Array.from(
        menuElement
          .closest('[role="menu"]')
          ?.querySelectorAll(
            '[role^="menuitem"]' +
              (includeDisabled ? "" : ':not([aria-disabled="true"])'),
          ) ?? [],
      ),
    handleTypeToSearch: Dynamic = (event?: Dynamic): Dynamic => {
      let searchInput: Dynamic = searchInputRef.current,
        isAltGraph: Dynamic = event.getModifierState("AltGraph");
      !searchInput ||
        event.target.closest("input") ||
        event.nativeEvent.isComposing ||
        event.keyCode === 229 ||
        event.key.length !== 1 ||
        event.key === " " ||
        ((event.ctrlKey || event.altKey) && !isAltGraph) ||
        event.metaKey ||
        (event.preventDefault(),
        event.stopPropagation(),
        event.preventBaseUIHandler(),
        searchInput.focus({
          preventScroll: true,
        }),
        setSearchText(searchInput.value + event.key));
    },
    handleMouseDown: Dynamic = (event?: Dynamic): Dynamic => {
      let target: Dynamic = event.target;
      target instanceof
        (target.ownerDocument.defaultView ?? window).HTMLInputElement ||
        target === event.currentTarget ||
        (target.classList.contains("overflow-y-auto") &&
          event.nativeEvent.offsetX >= target.clientWidth) ||
        event.preventDefault();
    };
  return (
    <MenuMenuAssignValue.Root
      disabled={isDisabled}
      defaultOpen={defaultOpen}
      onOpenChange={(isOpen?: Dynamic): Dynamic => {
        isOpen || setSearchText("");
        onOpenChange?.(isOpen);
      }}
    >
      <MenuMenuAssignValue.Trigger
        disabled={isDisabled}
        render={
          <button
            type={"button"}
            data-kit={"PropertySelect"}
            data-testid={dataTestid}
            aria-label={triggerText === "" ? (ariaLabel) : (((ariaLabel) + (": ")) + (triggerText))}
            title={title}
            className={joinClassNames(
              pickerSelectRowClassName,
              compact ? "w-[4.5rem] shrink-0" : "w-full flex-1",
              className,
            )}
          >
            {displayIcon != null ? (<EditorIcon
                name={displayIcon}
                size={13}
                className={
                  selectedItem?.icon != null ? "text-primary" : "text-muted"
                }
              />) : (null)}
            <span
              className={joinClassNames(
                "min-w-0 flex-1 truncate",
                selectedLabel === undefined && "text-muted",
                selectedItem === undefined && triggerText === "Mixed" && "text-muted",
              )}
            >
              {triggerText}
            </span>
            <EditorIcon
              name={"CaretDown"}
              size={16}
              className={
                "mr-0.5 shrink-0 text-muted transition-colors group-enabled/select:group-hover/select:text-secondary"
              }
            />
          </button>
        }
      />
      <MenuMenuAssignValue.Popup
        {...popupAttrs}
        align={align ?? (hasIcons ? "end" : "start")}
        className={joinClassNames(
          hasIcons
            ? "w-[calc(var(--anchor-width)+1.375rem)]"
            : "w-[var(--anchor-width)]",
          "max-w-none min-w-[12rem] [&_.scroll-fade-y]:[scrollbar-width:none]",
          searchable && "[&_.scroll-fade-y]:[--cds-scroll-fade-size:0px]",
        )}
        {...(searchable
          ? {
              stableWhileOpen: true,
              collisionAvoidance: {
                side: "flip",
                align: "shift",
                fallbackAxisSide: "none",
              },
              maxVisibleItems: 10.5,
              onKeyDown: handleTypeToSearch,
              onMouseDown: handleMouseDown,
              header: (
                <div className={"m-1 mb-2"}>
                  <TextInput
                    ref={searchInputRef}
                    value={searchText}
                    onChange={(event?: Dynamic): Dynamic =>
                      setSearchText(event.target.value)
                    }
                    onKeyDown={(event?: Dynamic): Dynamic => {
                      if (event.nativeEvent.isComposing) {
                        event.stopPropagation();
                        return;
                      }
                      let itemElements: Dynamic = queryMenuItems(
                          event.currentTarget,
                          true,
                        ),
                        edgeItem: Dynamic =
                          event.key === "ArrowDown"
                            ? itemElements[0]
                            : event.key === "ArrowUp"
                              ? itemElements[itemElements.length - 1]
                              : undefined;
                      if (edgeItem !== undefined || event.key === "Enter") {
                        event.preventDefault();
                        event.stopPropagation();
                        edgeItem !== undefined
                          ? edgeItem.focus()
                          : normalizedQuery !== "" &&
                            queryMenuItems(event.currentTarget)[
                              pickerSearchInitialIndex(
                                normalizedQuery,
                                visibleItems
                                  .filter(
                                    (item?: Dynamic): Dynamic =>
                                      item.disabled !== true,
                                  )
                                  .map(
                                    (item?: Dynamic): Dynamic => item.label,
                                  ),
                              )
                            ]?.click();
                        return;
                      }
                      event.key === "Escape"
                        ? event.preventDefault()
                        : event.key !== "Tab" && event.stopPropagation();
                    }}
                    slotStart={
                      <EditorIcon
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
                    onClear={(): Dynamic => setSearchText("")}
                    autoFocus={!isTouchToolbar}
                    tabIndex={isTouchToolbar ? -1 : undefined}
                    data-kit={"list-search"}
                    className={"w-full"}
                  />
                </div>
              ),
            }
          : {})}
      >
        {groupPickerRows(visibleItems).map(
          (
            groupItems?: Dynamic,
            groupIndex?: Dynamic,
            groups?: Dynamic,
          ): Dynamic => {
            let { group: groupName, subgroup: subgroupName }: Dynamic = groupItems[0];
            return (() => {
              const GroupFragment =
                reactPropertiesNumericInput.Fragment;
              const groupProps = {
                children: [
                  groupName !== undefined &&
                  groupName !== groups[groupIndex - 1]?.[0]?.group ? (
                    <jsxPropertiesPickerSearch.Fragment>
                      {groupIndex > 0 ? (<MenuMenuAssignValue.Separator />) : (null)}
                      <PickerListHeader text={groupName} title={true} />
                    </jsxPropertiesPickerSearch.Fragment>
                  ) : null,
                  <MenuMenuAssignValue.Group
                    aria-label={
                      groupName !== undefined && subgroupName !== undefined ? (((groupName) + (" \xB7 ")) + (subgroupName)) : (groupName)
                    }
                  >
                    {subgroupName !== undefined ? (<PickerListHeader text={subgroupName} />) : (null)}
                    {groupItems.map(
                      (item?: Dynamic): Dynamic =>
                        (() => {
                          const _Component =
                            reactPropertiesNumericInput.Fragment;
                          const _props = {
                            children: [
                              item.separatorBefore === true ? (
                                <MenuMenuAssignValue.Separator />
                              ) : null,
                              <PropertyPickerRow
                                checked={item.value === selectedValue}
                                checkedRole={"radio"}
                                label={item.label}
                                icon={item.icon}
                                disabled={item.disabled}
                                title={item.title}
                                disabledReason={
                                  item.disabled === true ? (item.title) : (undefined)
                                }
                                hint={item.hint}
                                rowSize={
                                  item.labelStyle !== undefined
                                    ? "lg"
                                    : "md"
                                }
                                onClick={(): Dynamic => {
                                  item.value !== selectedValue &&
                                    onChange(item.value);
                                }}
                              >
                                {item.labelStyle !== undefined ? (<span
                                    className={
                                      "truncate leading-tight [font-variation-settings:normal]"
                                    }
                                    style={item.labelStyle}
                                  >
                                    {item.label}
                                  </span>) : (item.label)}
                              </PropertyPickerRow>,
                            ],
                          } as const;
                          const _key = item.value;
                          return <_Component key={_key} {..._props} />;
                        })(),
                    )}
                  </MenuMenuAssignValue.Group>,
                ],
              } as const;
              const groupKey =
                (groupName ?? "") +
                ":" +
                (subgroupName ?? "") +
                ":" +
                groupItems[0].value;
              return <GroupFragment key={groupKey} {...groupProps} />;
            })();
          },
        )}
        {searchable && visibleItems.length === 0 ? (<MenuMenuAssignValue.Item disabled={true}>
            {uiMessage("inspector.select.noMatches")}
          </MenuMenuAssignValue.Item>) : (null)}
      </MenuMenuAssignValue.Popup>
    </MenuMenuAssignValue.Root>
  );
}
function groupPickerRows(rows?: Dynamic): Dynamic {
  let items: Dynamic = [];
  for (let row of rows as Dynamic) {
    let previousGroup: Dynamic = items[items.length - 1];
    previousGroup !== undefined &&
    previousGroup[0].group === row.group &&
    previousGroup[0].subgroup === row.subgroup
      ? previousGroup.push(row)
      : items.push([row]);
  }
  return items;
}
export {
  groupPickerRows,
  jsxPropertiesSelect,
  PropertiesSelectMin,
  PropertiesSelectOnKeyDownCaptureConfig,
  PropertyPickerRow,
  PropertySelect,
};
export function installEditorPropertiesSelect(): () => void {
  return () => {
    jsxPropertiesSelect = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    PropertiesSelectOnKeyDownCaptureConfig = {
      onKeyDownCapture: (event?: Dynamic): Dynamic => {
        let radioElement: Dynamic =
          event.target instanceof HTMLElement
            ? event.target.closest('[role="radio"]')
            : null;
        if (radioElement)
          if (
            event.key === "ArrowRight" ||
            event.key === "ArrowLeft" ||
            event.key === "ArrowDown" ||
            event.key === "ArrowUp"
          ) {
            event.preventDefault();
            event.stopPropagation();
            let items: Dynamic = [
                ...(radioElement
                  .closest('[role="radiogroup"]')
                  ?.querySelectorAll('[role="radio"]') ?? []),
              ],
              stepDirection: Dynamic =
                event.key === "ArrowRight" || event.key === "ArrowDown"
                  ? 1
                  : -1;
            items[
              (items.indexOf(radioElement) + stepDirection + items.length) % items.length
            ]?.focus();
          } else
            event.key === "Enter" &&
              (event.preventDefault(), event.stopPropagation(), radioElement.click());
      },
    };
    PropertiesSelectMin = (
      valueToClamp?: Dynamic,
      minimum?: Dynamic,
      maximum?: Dynamic,
    ): Dynamic => Math.min(maximum, Math.max(minimum, valueToClamp));
  };
}
