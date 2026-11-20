import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type { RestoredComboboxRootProps } from "../contracts/overlays";
import type { SheetPopupResult } from "../contracts/overlays";
import type { FieldComboboxProps } from "../contracts/overlays";
import type {
  AccessibleNameProps,
  ComboboxBridgeProps,
  ComboboxChipProps,
  ComboboxChipsProps,
  ComboboxFooterActionProps,
  ComboboxGroupMap,
  ComboboxHostProps,
  ComboboxItemPartProps,
  ComboboxKey,
  ComboboxLabelInput,
  ComboboxLabelResult,
  ComboboxOption,
  ComboboxPartProps,
  ComboboxPopupProps,
  ComboboxPopupViewProps,
  ComboboxProps,
  ComboboxRegistration,
  ComboboxRowProps,
  ComboboxStatusProps,
  ComboboxTriggerProps,
  ComboboxValueProps,
  DesignStyle,
  ForwardComponent,
  GenericComboboxRow,
  ImperativeComboboxDetails,
  LabelResolver,
  MobileSheetParts,
  OverlayChange,
  PopupInputKind,
  SheetPopupState,
  SheetRenderState,
  VirtualComboboxActions,
  VirtualComboboxProps,
} from "../contracts/overlays";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { baseCombobox, loadJsxNamespace, loadReactNamespace, measureVirtualElement, useVirtualizer } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { AdaptiveSheetPopupHost } from "./adaptive-sheets";
import { Badge } from "./badges";
import { Button } from "./buttons";
import { COMBOBOX_SKELETON_ROW_COUNT, COMBOBOX_STATUS_CLASS, COMBOBOX_VIRTUAL_OVERSCAN, comboboxAccessibilityProps, ComboboxStatus, ComboboxStatus as ComboboxStatus_r, reactComboboxHandle, typographyThemeValues, useMirroredAccessibleName } from "./combobox-primitives";
import { CheckboxVisual } from "./control-labels";
import { FieldWrapper } from "./field";
import { defaultSheetHost, FloatingPositionRenderProp, SHEET_DENSITY, SHEET_SCROLL_ATTRIBUTE, SheetContextProvider, sheetParentContext, sheetPopupClasses, sheetPositioningOverrides, useAdaptiveSheet, useControllableOpen, useHasSheetFrame, useIsomorphicLayoutEffect, useSheetCapablePresentation, useValueCapturedOnOpen } from "./foundation";
import { CloseOnActivityHideProvider, cn, elevationSurfaceNames, getSurfaceClasses, Icon, IconSlot, layerBaseContext, PortalRoot, translateWithFallback, translationContext, useMergedRefs, useOverlayLayer, useRootRemSize, useTranslation } from "./interactions";
import { getControlSizeAttributes, getDensitySizeIndex, useClickToFocus, useDensity, usePortalContainer } from "./overlays";
import { SkeletonPrimitive } from "./skeleton";
import { concealedPopupStyle } from "./text-input-overlay";
import { fieldHoverClasses, fieldRingClasses, useFieldDisabled, useFieldInvalid, useHasFieldContext } from "./text-input";

var reactCombobox: typeof React;
var ComboboxJsx: typeof import("react/jsx-runtime");
var COMBOBOX_TRIGGER_CLASS: string;
var COMBOBOX_VARIANT_CLASSES: {
  outline: string;
  ghost: string;
};
var COMBOBOX_FOCUS_CLASS: string;
var COMBOBOX_MODE_CLASSES: {
  select: string;
  input: string;
};
var COMBOBOX_CHIPS_INPUT_CLASS: string;
var COMBOBOX_TRIGGER_BUTTON_CLASS: string;
var COMBOBOX_INLINE_INPUT_CLASS: string;
var COMBOBOX_SEARCH_INPUT_CLASS: string;
var COMBOBOX_CHIP_CLASS: string;
var COMBOBOX_CHIP_LIST_CLASS: string;
var COMBOBOX_POPUP_CLASS: string;
var COMBOBOX_POPUP_BODY_CLASS: string;
var COMBOBOX_ANCHOR_HIDDEN_CLASS: string;
var COMBOBOX_LIST_CLASS: string;
var COMBOBOX_POPUP_SEARCH_CLASS: string;
var COMBOBOX_ITEM_CLASS: string;
var COMBOBOX_ROW_HEIGHT_CSS: string;
var COMBOBOX_SEPARATOR_CLASS: string;
var COMBOBOX_SEPARATOR_PART: string;
var COMBOBOX_GROUP_LABEL_CLASS: string;
var COMBOBOX_SELECTED_SEPARATOR_CLASS: string;
var COMBOBOX_EMPTY_CLASS: string;
var COMBOBOX_FOOTER_DIVIDER_CLASS: string;
var COMBOBOX_FOOTER_CLASS: string;
var COMBOBOX_NO_RESULTS_LABEL: string;
var COMBOBOX_DEFAULT_ROW_HEIGHT: number;
var COMBOBOX_DEFAULT_VISIBLE_ROWS: number;
var COMBOBOX_CHIP_LABEL_MAX_LENGTH: number;
var COMBOBOX_DEFAULT_CHIP_COUNT: number;
var normalizeComboboxSearchText: (input: string) => string;
var comboboxItemLabel: (input: ComboboxOption) => string;
var comboboxItemValue: (input: ComboboxOption) => string;
var ComboboxChip: ForwardComponent<HTMLDivElement, ComboboxChipProps>;
var COMBOBOX_CHIP_REMOVE_CLASS: string;
var ComboboxChipRemove: ForwardComponent<
  HTMLButtonElement,
  ComboboxPartProps<"ChipRemove">
>;
var ComboboxOptionRow: GenericComboboxRow;
var ComboboxTrigger: ForwardComponent<
  HTMLButtonElement,
  ComboboxTriggerProps
>;
var ComboboxValue: ForwardComponent<HTMLSpanElement, ComboboxValueProps>;
var COMBOBOX_AUTOCOMPLETE_INPUT_PROPS: {
  autoComplete: string;
  "data-1p-ignore": boolean;
  "data-lpignore": string;
};
var ComboboxInput: ForwardComponent<
  HTMLInputElement,
  ComboboxPartProps<"Input">
>;
var ComboboxPopupSearch: ForwardComponent<
  HTMLInputElement,
  ComboboxPartProps<"Input">
>;
var ComboboxClear: ForwardComponent<
  HTMLButtonElement,
  ComboboxPartProps<"Clear">
>;
var ComboboxFooterAction: ForwardComponent<
  HTMLButtonElement,
  ComboboxFooterActionProps
>;
var ComboboxPopup: ForwardComponent<HTMLDivElement, ComboboxPopupProps>;
var ComboboxSheetCapablePopup: ForwardComponent<
  HTMLDivElement,
  ComboboxPopupProps
>;
var ComboboxPopupView: ForwardComponent<
  HTMLDivElement,
  ComboboxPopupViewProps
>;
var ComboboxList: ForwardComponent<HTMLDivElement, ComboboxPartProps<"List">>;
var ComboboxEmpty: ForwardComponent<
  HTMLDivElement,
  ComboboxPartProps<"Empty">
>;
var ComboboxItem: ForwardComponent<HTMLDivElement, ComboboxItemPartProps>;
var ComboboxItemIndicator: ForwardComponent<
  HTMLSpanElement,
  ComboboxPartProps<"ItemIndicator">
>;
var ComboboxGroupLabel: ForwardComponent<
  HTMLDivElement,
  ComboboxPartProps<"GroupLabel">
>;
var ComboboxChips: ForwardComponent<HTMLDivElement, ComboboxChipsProps>;
var ComboboxRegistrationContext: React.Context<ComboboxRegistration | null>;
var ComboboxChipsContext: React.Context<boolean>;
var ComboboxPopupInputContext: React.Context<boolean>;
var nullComboboxElement: () => null;
var ComboboxComponents: typeof Combobox & {
  Root: typeof ComboboxRoot;
  Trigger: typeof ComboboxTrigger;
  Value: typeof ComboboxValue;
  Caret: typeof ComboboxCaret;
  Input: typeof ComboboxInput;
  PopupSearch: typeof ComboboxPopupSearch;
  Popup: typeof ComboboxPopup;
  Clear: typeof ComboboxClear;
  List: typeof ComboboxList;
  Empty: typeof ComboboxEmpty;
  Status: ForwardComponent<HTMLDivElement, ComboboxStatusProps>;
  Item: typeof ComboboxItem;
  ItemIndicator: typeof ComboboxItemIndicator;
  Group: typeof import("@base-ui/react/combobox").Combobox.Group;
  GroupLabel: typeof ComboboxGroupLabel;
  Chips: typeof ComboboxChips;
  Chip: typeof ComboboxChip;
  ChipRemove: typeof ComboboxChipRemove;
  Separator: typeof ComboboxSeparator;
  Footer: typeof ComboboxFooter;
  FooterAction: typeof ComboboxFooterAction;
  Collection: typeof import("@base-ui/react/combobox").Combobox.Collection;
};
var comboboxVirtualJsx: typeof import("react/jsx-runtime");
function VirtualizedComboboxRows({
  count: count,
  estimateItemSize: estimateItemSize,
  estimateRowSize: estimateRowSize,
  scrollEl: scrollEl,
  actionsRef: actionsRef,
  getItemKey: getItemKey,
  renderRow: renderRow,
}: VirtualComboboxProps): React.ReactElement {
  useUiLocale();
  let callback = (rowIndex: number): number =>
      estimateRowSize?.(rowIndex) ?? estimateItemSize,
    value = useVirtualizer({
      count: count,
      getItemKey: getItemKey,
      getScrollElement: () => scrollEl,
      estimateSize: callback,
      measureElement: (
        row: Element,
        resizeEntry: ResizeObserverEntry | undefined,
        virtualizer: import("@tanstack/virtual-core").Virtualizer<
          HTMLDivElement,
          Element
        >,
      ) =>
        Math.max(
          measureVirtualElement(row, resizeEntry, virtualizer),
          callback(virtualizer.indexFromElement(row)),
        ),
      overscan: COMBOBOX_VIRTUAL_OVERSCAN,
      scrollPaddingStart: 28,
      scrollPaddingEnd: 28,
      enabled: scrollEl !== null,
    });
  reactComboboxHandle.useImperativeHandle(
    actionsRef,
    () => ({
      scrollToIndex: (rowIndex: number) => value.scrollToIndex(rowIndex),
    }),
    [value],
  );
  useIsomorphicLayoutEffect(() => {
    value.measure();
  }, [value, estimateItemSize]);
  let virtualRows = value.getVirtualItems();
  return (
    <div
      data-row-pitch={estimateItemSize}
      style={{
        minHeight: `${value.getTotalSize()}px`,
        position: "relative",
      }}
    >
      {virtualRows.length > 0 ? (virtualRows.map((virtualRow: import("@tanstack/virtual-core").VirtualItem) =>
          (() => {
            const _Element = "div";
            const _elementProps = {
              ref: value.measureElement,
              "data-index": virtualRow.index,
              style: {
                position: "absolute" as const,
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualRow.start}px)`,
              },
              children: renderRow(virtualRow.index),
            };
            const _elementKey = virtualRow.key;
            return <_Element key={_elementKey} {..._elementProps} />;
          })(),
        )) : (count > 0 ? (<div aria-hidden={true} className={"flex flex-col gap-1 px-md py-1"}>
          {Array.from(
            {
              length: COMBOBOX_SKELETON_ROW_COUNT,
            },
            (unusedRow: unknown, rowIndex: number) =>
              (() => {
                const SkeletonRow = SkeletonPrimitive;
                const skeletonRowProps = {
                  height: estimateItemSize - 8,
                  className: "w-full",
                };
                const skeletonRowKey = rowIndex;
                return <SkeletonRow key={skeletonRowKey} {...skeletonRowProps} />;
              })(),
          )}
        </div>) : (null))}
    </div>
  );
}
function comboboxListHeightStyle(
  visibleItems?: number,
  rowHeight?: number,
): DesignStyle | undefined {
  if (visibleItems === undefined || !(visibleItems > 0)) {
    return;
  }
  return {
    "--cds-popup-max-h": "var(--available-height)",
    "--cds-popup-list-max-h":
      rowHeight !== undefined
        ? `calc(${visibleItems} * ${rowHeight}px)`
        : `calc(${visibleItems} * ${COMBOBOX_ROW_HEIGHT_CSS})`,
  };
}
function comboboxItemMatchesQuery<Value extends ComboboxKey>(
  item: ComboboxOption<Value>,
  query: string,
): boolean {
  let value = normalizeComboboxSearchText(query);
  return (
    normalizeComboboxSearchText(item.label).includes(value) ||
    normalizeComboboxSearchText(item.value).includes(value)
  );
}
function comboboxSelectionLabel<Value extends ComboboxKey>(
  selected: readonly ComboboxOption<Value>[],
  noun?: string,
  locale?: LabelResolver,
): string {
  let [value] = selected;
  if (value !== undefined && selected.length === 1) {
    return value.label;
  }
  if (noun !== undefined) {
    return `${selected.length} ${noun}`;
  }
  return translateWithFallback(
    locale,
    "nSelected",
    "{count} selected",
    {
      count: selected.length,
    },
  );
}
function comboboxGroupMetadata<Value extends ComboboxKey>(
  items: readonly ComboboxOption<Value>[],
  isSelected: (item: ComboboxOption<Value>) => boolean,
  selectedFirst: boolean,
): ComboboxGroupMap<Value> {
  let entries: Map<Value, string> = new Map(),
    values: Set<Value> = new Set(),
    runLabelByValue: Map<Value, string> = new Map();
  if (!selectedFirst) {
    for (let item of items) {
      if (item.groupLabelBefore !== undefined && isSelected(item)) {
        entries.set(item.value, item.groupLabelBefore);
      }
    }
    return {
      captionAbove: entries,
      separatorAbove: values,
      runLabel: runLabelByValue,
    };
  }
  let value: string | undefined,
    activeGroup:
      | {
          label: string;
          separator: boolean;
          start: Value;
        }
      | undefined;
  for (let item of items) {
    if (item.groupLabelBefore !== undefined) {
      value = item.groupLabelBefore;
      activeGroup = {
        label: value,
        separator: item.separatorBefore === true,
        start: item.value,
      };
    } else if (item.separatorBefore) {
      value = undefined;
      activeGroup = undefined;
    }
    if (value === undefined) {
      continue;
    }
    runLabelByValue.set(item.value, value);
    if (activeGroup !== undefined && isSelected(item)) {
      entries.set(item.value, activeGroup.label);
      if (activeGroup.separator && activeGroup.start !== item.value) {
        values.add(item.value);
      }
      activeGroup = undefined;
    }
  }
  return {
    captionAbove: entries,
    separatorAbove: values,
    runLabel: runLabelByValue,
  };
}
function Combobox<Value extends ComboboxKey>(
  props: ComboboxProps<Value>,
): React.ReactElement {
  useUiLocale();
  let {
      "data-cds": dataCds = "Combobox",
      mode = "select",
      variant = "outline",
      items: items,
      searchable: searchable,
      indicator: indicator,
      placeholder: placeholder,
      searchPlaceholder: searchPlaceholder,
      triggerPrefix: triggerPrefix,
      label: label,
      "aria-label": value,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-required": ariaRequired,
      clearable = false,
      clearLabel: clearLabel,
      closeLabel: closeLabel,
      hideCaret = false,
      filter: filter,
      autoHighlight: autoHighlight,
      onInputChange: onInputChange,
      onOpenChange: onOpenChange,
      footerDivider = true,
      emptyMessage: emptyMessage,
      isLoading = false,
      loadingStaleAfter: loadingStaleAfter,
      footer: footer,
      renderItem: renderItem,
      announceGroupLabels = false,
      virtualized = false,
      estimateItemSize: estimateItemSize,
      hasMore = false,
      isFetchingMore = false,
      onLoadMore: onLoadMore,
      paginationKey: paginationKey,
      popupClassName: popupClassName,
      layerOffset: layerOffset,
      maxVisibleItems: maxVisibleItems,
      align = "start",
      collisionPadding: collisionPadding,
      disabled: disabled,
      required: required,
      name: name,
      size: size,
      fullWidth = true,
      className: className,
    } = props,
    labelResolver = reactCombobox.useContext<LabelResolver | undefined>(
      translationContext,
    ),
    defaultClearLabel = useTranslation("clearSelection", uiMessage("design-system.combobox.clearSelection")),
    resolvedClearLabel = clearLabel ?? defaultClearLabel,
    defaultEmptyMessage = useTranslation(
      "noResults",
      uiMessage("design-system.combobox.noResults"),
    ),
    resolvedEmptyMessage = emptyMessage ?? defaultEmptyMessage,
    searchEnabled = searchable ?? (items.length > 5 || onInputChange !== undefined),
    isMultiple = props.multiple === true,
    multipleTriggerMode = props.multiple ? (props.triggerMode ?? "summary") : null,
    chipsUsePopupSearch = (props.multiple && props.popupSearchInChips) ?? false,
    groupSelectedFirst = (props.multiple && props.groupSelected) ?? false,
    keepSelectionQuery = (props.multiple && props.keepQueryOnSelect) ?? false,
    chipsUseInlineSearch = multipleTriggerMode === "chips" && !chipsUsePopupSearch && searchable !== false,
    autoHighlightByDefault = !groupSelectedFirst && filter === undefined,
    highlightInlineChips = chipsUseInlineSearch && (autoHighlight ?? autoHighlightByDefault),
    closeOnInlineChipSelection = highlightInlineChips && !keepSelectionQuery,
    showSelectAllFooter = props.multiple && (props.selectAllFooter ?? false),
    selectionIndicator = indicator ?? (isMultiple ? "checkbox" : "check"),
    fieldInvalid = useFieldInvalid(),
    hasFieldContext = useHasFieldContext(),
    fieldDisabled = useFieldDisabled(),
    isDisabled = disabled || fieldDisabled,
    isControlled = props.value !== undefined,
    [internalSelection, setInternalSelection] = reactCombobox.useState(() =>
      props.multiple
        ? (props.defaultValue ?? [])
        : (props.defaultValue ?? null),
    ),
    selectedValues = props.multiple ? (isControlled ? props.value : internalSelection) : undefined,
    selectedValue = props.multiple ? undefined : isControlled ? props.value : internalSelection,
    memo = reactCombobox.useMemo(
      () =>
        new Map(
          items.map((item: ComboboxOption<Value>) => [item.value, item]),
        ),
      [items],
    ),
    selectedItems = reactCombobox.useMemo(() => {
      if (props.multiple) {
        return ((selectedValues ?? []) as Value[])
          .map((selectedKey: Value) => memo.get(selectedKey))
          .filter(
            (selectedOption: ComboboxOption<Value> | undefined) => selectedOption !== undefined,
          );
      }
      let itemValue = selectedValue ?? null,
        item = itemValue === null ? undefined : memo.get(itemValue as Value);
      if (item) {
        return [item];
      } else {
        return [];
      }
    }, [props.multiple, selectedValues, selectedValue, memo]),
    selectedItem = selectedItems[0] ?? null,
    hasSelection = selectedItems.length > 0,
    ref = reactCombobox.useRef(props);
  reactCombobox.useEffect(() => {
    ref.current = props;
  }, [props]);
  let selectedItemsRef = reactCombobox.useRef(selectedItems);
  reactCombobox.useEffect(() => {
    selectedItemsRef.current = selectedItems;
  }, [selectedItems]);
  let preserveNextQueryResetRef = reactCombobox.useRef(false),
    selectedValuesRef = reactCombobox.useRef(selectedValues);
  reactCombobox.useEffect(() => {
    selectedValuesRef.current = selectedValues;
  }, [selectedValues]);
  let callback = reactCombobox.useCallback(
      (
        nextSelection: ComboboxOption<Value> | ComboboxOption<Value>[] | null,
        changeDetails?: import("@base-ui/react/combobox").Combobox.Root.ChangeEventDetails,
      ) => {
        let current = ref.current;
        if (current.multiple) {
          preserveNextQueryResetRef.current =
            current.keepQueryOnSelect === true &&
            changeDetails?.reason === "item-press";
          let nextItems = (nextSelection ?? []) as ComboboxOption<Value>[],
            values = new Set(
              nextItems.map((item: ComboboxOption<Value>) => item.value),
            ),
            preservedDisabledItems = selectedItemsRef.current.filter(
              (item: ComboboxOption<Value>) =>
                item.disabled && !values.has(item.value),
            );
          if (preservedDisabledItems.length > 0) {
            nextItems = [...nextItems, ...preservedDisabledItems];
            let previousValues = new Set(selectedValuesRef.current ?? []);
            if (
              nextItems.length === previousValues.size &&
              nextItems.every((item: ComboboxOption<Value>) =>
                previousValues.has(item.value),
              )
            ) {
              return;
            }
          }
          let nextValues = nextItems.map(
            (item: ComboboxOption<Value>) => item.value,
          );
          if (!isControlled) {
            setInternalSelection(nextValues);
          }
          current.onChange?.(nextValues);
        } else {
          let nextItem = nextSelection as ComboboxOption<Value> | null;
          if (nextItem?.disabled) {
            changeDetails?.cancel();
            return;
          }
          let nextValue = nextItem?.value ?? null;
          if (!isControlled) {
            setInternalSelection(nextValue);
          }
          current.onChange?.(nextValue);
        }
      },
      [isControlled],
    ),
    selectAll = reactCombobox.useCallback(() => {
      let values = new Set(selectedItems.map((item: ComboboxOption) => item.value));
      callback(
        ref.current.items.filter(
          (item: ComboboxOption<Value>) =>
            !item.disabled || values.has(item.value),
        ),
      );
    }, [callback, selectedItems]),
    clearAll = reactCombobox.useCallback(() => {
      callback([]);
    }, [callback]),
    [isOpen, setIsOpen] = reactCombobox.useState(false),
    [searchQuery, setSearchQuery] = reactCombobox.useState(""),
    virtualListActionsRef = reactCombobox.useRef<VirtualComboboxActions | null>(null),
    skipDuplicateEmptyQueryRef = reactCombobox.useRef(false),
    handleInputChange = reactCombobox.useCallback(
      (
        nextQuery: string,
        changeDetails?: import("@base-ui/react/combobox").Combobox.Root.ChangeEventDetails,
      ) => {
        let current = preserveNextQueryResetRef.current;
        preserveNextQueryResetRef.current = false;
        if (current && nextQuery === "" && changeDetails?.reason === "input-clear") {
          changeDetails.cancel();
          return;
        }
        setSearchQuery(nextQuery);
        if (nextQuery !== "") {
          skipDuplicateEmptyQueryRef.current = false;
        }
        if (nextQuery !== "" || !skipDuplicateEmptyQueryRef.current) {
          onInputChange?.(nextQuery);
        }
        if (virtualized) {
          virtualListActionsRef.current?.scrollToIndex(0);
        }
      },
      [onInputChange, virtualized],
    ),
    handleOpenChange = reactCombobox.useCallback(
      (
        nextOpen: boolean,
        changeDetails?: import("@base-ui/react/combobox").Combobox.Root.ChangeEventDetails,
      ) => {
        preserveNextQueryResetRef.current = false;
        let closesOnItemPress = !nextOpen && changeDetails?.reason === "item-press";
        if (isMultiple && closesOnItemPress && !closeOnInlineChipSelection) {
          changeDetails!.cancel?.();
          if (!keepSelectionQuery) {
            handleInputChange("");
          }
          return;
        }
        setIsOpen(nextOpen);
        onOpenChange?.(nextOpen);
        if (!nextOpen) {
          if (closesOnItemPress && closeOnInlineChipSelection) {
            handleInputChange("");
            skipDuplicateEmptyQueryRef.current = true;
          } else if (keepSelectionQuery) {
            handleInputChange("");
            skipDuplicateEmptyQueryRef.current = true;
          } else {
            setSearchQuery("");
          }
        }
      },
      [isMultiple, keepSelectionQuery, onOpenChange, handleInputChange, closeOnInlineChipSelection],
    ),
    closeCombobox = reactCombobox.useCallback(
      () => handleOpenChange(false),
      [handleOpenChange],
    ),
    overlayActionsRef = reactCombobox.useRef<{
      close(): void;
    } | null>(null);
  reactCombobox.useImperativeHandle(
    overlayActionsRef,
    () => ({
      close: closeCombobox,
    }),
    [closeCombobox],
  );
  let selectedValueSet = reactCombobox.useMemo(
      () => new Set(selectedItems.map((item: ComboboxOption) => item.value)),
      [selectedItems],
    ),
    sortedItems = reactCombobox.useMemo(() => {
      if (!groupSelectedFirst) {
        return items;
      }
      let reorderedItems = items.slice();
      reorderedItems.sort(
        (leftItem: ComboboxOption<Value>, rightItem: ComboboxOption<Value>) => {
          return (
            (selectedValueSet.has(leftItem.value) ? 0 : 1) -
            (selectedValueSet.has(rightItem.value) ? 0 : 1)
          );
        },
      );
      return reorderedItems;
    }, [items, groupSelectedFirst, selectedValueSet]),
    virtualItems = reactCombobox.useMemo(() => {
      if (!virtualized || !(searchEnabled || chipsUseInlineSearch)) {
        return sortedItems;
      }
      let normalizedQuery = searchQuery.trim();
      if (!normalizedQuery) {
        return sortedItems;
      }
      let matchesItem = filter ?? comboboxItemMatchesQuery;
      return sortedItems.filter((item: ComboboxOption<Value>) =>
        matchesItem(item, normalizedQuery),
      );
    }, [virtualized, searchEnabled, chipsUseInlineSearch, sortedItems, searchQuery, filter]),
    ref8 = reactCombobox.useRef(virtualItems);
  reactCombobox.useEffect(() => {
    ref8.current = virtualItems;
  }, [virtualItems]);
  let scrollToKeyboardHighlight = reactCombobox.useCallback(
      (
        highlightedItem: ComboboxOption<Value> | undefined,
        highlightDetails: import("@base-ui/react/combobox").Combobox.Root.HighlightEventDetails,
      ) => {
        if (highlightDetails.reason !== "keyboard" || !highlightedItem) {
          return;
        }
        let highlightedIndex = ref8.current.findIndex(
          (item: ComboboxOption<Value>) => item.value === highlightedItem.value,
        );
        if (highlightedIndex >= 0) {
          virtualListActionsRef.current?.scrollToIndex(highlightedIndex);
        }
      },
      [],
    ),
    filterNonVirtualItem = reactCombobox.useMemo(() => {
      if (virtualized) {
        return null;
      }
      if (!searchEnabled && !chipsUseInlineSearch && mode === "select") {
        return null;
      }
      let matchesItem = filter ?? comboboxItemMatchesQuery;
      return (item: ComboboxOption<Value>, query: string) =>
        matchesItem(item, query);
    }, [virtualized, searchEnabled, chipsUseInlineSearch, mode, filter]),
    displayedItemCount = reactCombobox.useMemo(() => {
      let normalizedQuery = searchQuery.trim();
      if (!filterNonVirtualItem || normalizedQuery === "") {
        return virtualItems.length;
      }
      let index = 0;
      for (let item of virtualItems) {
        if (filterNonVirtualItem(item, normalizedQuery)) {
          index += 1;
        }
      }
      return index;
    }, [filterNonVirtualItem, virtualItems, searchQuery]),
    showsStaleResults = isLoading && loadingStaleAfter !== undefined,
    customRenderItem = renderItem,
    renderOption = reactCombobox.useCallback(
      (
        item: ComboboxOption<Value>,
        groupMetadata: ComboboxGroupMap<Value> | null,
        leadsList: boolean,
        rowIndex?: number,
      ) =>
        (() => {
          const OptionRow = ComboboxOptionRow;
          const optionRowProps = {
            item: item,
            index: rowIndex,
            wrapDescription: rowIndex === undefined,
            selected: selectedValueSet.has(item.value),
            stale: showsStaleResults,
            renderItem: customRenderItem,
            searchQuery: customRenderItem ? searchQuery : "",
            indicator: selectionIndicator,
            leadsList: leadsList,
            separatorAbove: groupMetadata?.separatorAbove.has(item.value) ?? false,
            groupCaption: groupMetadata?.captionAbove.get(item.value),
            announcedGroupLabel: announceGroupLabels
              ? groupMetadata?.runLabel.get(item.value)
              : undefined,
          };
          const optionRowKey = item.value;
          return <OptionRow key={optionRowKey} {...optionRowProps} />;
        })(),
      [customRenderItem, searchQuery, selectionIndicator, selectedValueSet, showsStaleResults, announceGroupLabels],
    ),
    inputWrapperRef = reactCombobox.useRef<HTMLDivElement | null>(null),
    wasOpenAtPointerDownRef = reactCombobox.useRef(false),
    openRef = reactCombobox.useRef(false);
  reactCombobox.useEffect(() => {
    openRef.current = isOpen;
  }, [isOpen]);
  reactCombobox.useEffect(() => {
    if (mode !== "input") {
      return;
    }
    let ownerDocument = inputWrapperRef.current?.ownerDocument ?? document,
      ownerWindow = ownerDocument.defaultView ?? window,
      captureOpenOnPointerDown = () => {
        wasOpenAtPointerDownRef.current = openRef.current;
        let resetPointerOpenState = () => {
          ownerWindow.removeEventListener("pointerup", resetPointerOpenState);
          ownerWindow.removeEventListener("pointercancel", resetPointerOpenState);
          ownerWindow.setTimeout(() => {
            wasOpenAtPointerDownRef.current = false;
          }, 0);
        };
        ownerWindow.addEventListener("pointerup", resetPointerOpenState);
        ownerWindow.addEventListener("pointercancel", resetPointerOpenState);
      };
    ownerDocument.addEventListener("pointerdown", captureOpenOnPointerDown, {
      capture: true,
      passive: true,
    });
    return () => {
      ownerDocument.removeEventListener("pointerdown", captureOpenOnPointerDown, {
        capture: true,
      });
    };
  }, [mode]);
  let focusInput = reactCombobox.useCallback(() => {
      inputWrapperRef.current?.querySelector("input")?.focus();
    }, []),
    { clickToFocusProps: clickToFocusProps } = useClickToFocus(
      () => {
        if (isOpen || wasOpenAtPointerDownRef.current) {
          return;
        }
        focusInput();
      },
      {
        disabled: isDisabled,
      },
    ),
    memo8 = reactCombobox.useMemo(
      () =>
        new Set(
          selectedItems
            .filter((item: ComboboxOption<Value>) => item.disabled)
            .map((item: ComboboxOption) => item.value),
        ),
      [selectedItems],
    ),
    hasClearableValues =
      props.multiple === true &&
      ((selectedValues ?? []) as Value[]).some((itemValue: Value) => !memo8.has(itemValue)),
    hasClearableSelection = hasSelection && (!props.multiple || hasClearableValues),
    showClear = clearable && hasClearableSelection,
    showCaret = !hideCaret && !(clearable && isControlled && hasClearableSelection),
    showPopupSearch =
      mode === "select" &&
      searchEnabled &&
      (multipleTriggerMode !== "chips" || chipsUsePopupSearch) &&
      (items.length > 0 || isLoading || onInputChange !== undefined),
    usesSimpleSelectTrigger = mode === "select" && multipleTriggerMode !== "chips" && !showPopupSearch,
    shouldAutoHighlight = chipsUseInlineSearch
      ? highlightInlineChips
      : (autoHighlight ?? (autoHighlightByDefault && (mode === "input" || showPopupSearch))),
    renderTriggerContent = () => {
      let addSelectedIcon = (content: React.ReactNode, baselineAligned: boolean = false) =>
        !selectedItem?.icon ? (
          content
        ) : (
          <span className={"flex min-w-0 items-center gap-2"}>
            {[<IconSlot icon={selectedItem.icon} />, <span
                className={cn(
                  "min-w-0 truncate",
                  baselineAligned && "self-baseline",
                )}
              >
                {content}
              </span>]}
          </span>
        );
      if (props.multiple) {
        let selectionSummary =
          props.renderTriggerValue?.(selectedItems) ??
          (selectedItems.length === 0
            ? (placeholder ?? " ")
            : comboboxSelectionLabel(selectedItems, props.summaryNoun, labelResolver));
        if (triggerPrefix !== undefined) {
          return (
            <span className={"flex min-w-0 items-baseline gap-1.5"}>
              {[<span className={"shrink-0 text-muted"}>
                  {triggerPrefix}
                </span>, <span className={"min-w-0 truncate"}>{selectionSummary}</span>]}
            </span>
          );
        }
        if (selectedItems.length === 0) {
          return <span className={"font-normal text-muted"}>{selectionSummary}</span>;
        }
        return selectionSummary;
      }
      if (triggerPrefix !== undefined) {
        let selectedLabel =
          props.renderTriggerValue?.(selectedItem) ??
          selectedItem?.label ??
          placeholder;
        return (
          <span className={"flex min-w-0 items-baseline gap-1.5"}>
            {[<span className={"shrink-0 text-muted"}>{triggerPrefix}</span>, selectedLabel !== undefined && (
                <span className={"min-w-0 truncate"} title={selectedItem?.label}>
                  {addSelectedIcon(selectedLabel, true)}
                </span>
              )]}
          </span>
        );
      }
      if (props.renderTriggerValue) {
        let customContent = props.renderTriggerValue(selectedItem);
        if (customContent !== undefined && customContent !== null) {
          return addSelectedIcon(customContent);
        }
      }
      if (!selectedItem) {
        return (
          <span className={"font-normal text-muted"}>
            {placeholder ?? (" ")}
          </span>
        );
      }
      return addSelectedIcon(selectedItem.label);
    },
    caret = showCaret && (
      <span
        aria-hidden={true}
        className={
          "pointer-events-none flex size-icon shrink-0 items-center justify-center text-muted"
        }
      >
        <Icon name={"CaretDown"} size={"sm"} />
      </span>
    ),
    useSquareClearSlot = showClear && (mode === "select" || !showCaret),
    text =
      "[--fh:var(--cds-h-control)] [--fhn:var(--cds-h-control-nested)] [--fr:var(--cds-radius)]",
    clearControl = showClear && (
      <span
        className={
          useSquareClearSlot
            ? `flex aspect-square h-control shrink-0 items-center justify-center ${text}`
            : `flex shrink-0 items-center ${text}`
        }
      >
        <baseCombobox.Clear
          render={
            <Button
              iconOnly={true}
              variant={"ghost"}
              size={size === "sm" || size === "xs" ? "xs" : "sm"}
              icon={"X"}
              aria-label={resolvedClearLabel}
              tooltip={false}
              className={
                "!size-[var(--fhn)] !rounded-[calc(var(--fr)-(var(--fh)-var(--fhn))/2)] data-[ending-style]:hidden"
              }
            />
          }
        />
      </span>
    ),
    widthClasses = fullWidth ? "w-full min-w-0" : "shrink-0",
    comboboxId = reactCombobox.useId(),
    {
      labelId: labelId,
      triggerId: triggerId,
      triggerValueId: triggerValueId,
      ownLabelProps: ownLabelProps,
    } = comboboxAccessibilityProps({
      reactId: comboboxId,
      label: label,
      triggerPrefix: triggerPrefix,
      mode: mode,
      triggerMode: multipleTriggerMode,
      insideField: hasFieldContext,
    }),
    state = {
      ...(ariaLabelledBy !== undefined
        ? {
            ...(ownLabelProps && {
              id: ownLabelProps.id,
            }),
            ...(value !== undefined && {
              "aria-label": value,
            }),
            "aria-labelledby": ariaLabelledBy,
          }
        : value !== undefined && !label
          ? {
              ...(ownLabelProps && {
                id: ownLabelProps.id,
              }),
              "aria-label": value,
            }
          : ownLabelProps || value !== undefined
            ? {
                ...ownLabelProps,
                ...(value !== undefined && {
                  "aria-label": value,
                }),
              }
            : ownLabelProps),
      ...(ariaDescribedBy !== undefined && {
        "aria-describedby": ariaDescribedBy,
      }),
      ...(ariaRequired && {
        "aria-required": true,
      }),
    },
    rightPadding = useSquareClearSlot ? "pr-0" : "pr-sm",
    chipPadding =
      selectedItems.length > 0
        ? "pl-[calc((var(--cds-h-control)-var(--cds-h-control-nested))/2)]"
        : "pl-sm",
    triggerClasses =
      multipleTriggerMode === "chips"
        ? `${COMBOBOX_CHIPS_INPUT_CLASS} ${chipPadding} ${widthClasses}`
        : `${COMBOBOX_TRIGGER_CLASS} ${COMBOBOX_VARIANT_CLASSES[variant]} ${COMBOBOX_MODE_CLASSES[mode]} ${rightPadding} ${widthClasses}`,
    canShowSheet = useSheetCapablePresentation(),
    comboboxRoot = (
      <baseCombobox.Root
        multiple={isMultiple}
        items={virtualized ? virtualItems : sortedItems}
        value={isMultiple ? selectedItems : selectedItem}
        onValueChange={callback}
        open={isOpen}
        onOpenChange={handleOpenChange}
        {...(mode === "select"
          ? {
              inputValue: searchQuery,
            }
          : {})}
        onInputValueChange={handleInputChange}
        onItemHighlighted={virtualized ? scrollToKeyboardHighlight : undefined}
        virtualized={virtualized}
        filter={filterNonVirtualItem}
        autoHighlight={shouldAutoHighlight}
        itemToStringLabel={comboboxItemLabel}
        itemToStringValue={comboboxItemValue}
        disabled={isDisabled}
        required={required}
        name={name}
      >
        {[multipleTriggerMode === "chips" ? (
            <div
              ref={inputWrapperRef}
              data-cds={dataCds}
              {...getControlSizeAttributes(size)}
              className={cn(triggerClasses, className)}
              data-disabled={isDisabled || undefined}
              data-invalid={fieldInvalid || undefined}
              onMouseDown={clickToFocusProps.onMouseDown}
              onClick={
                isDisabled
                  ? undefined
                  : (event: React.MouseEvent<HTMLDivElement>) => {
                      event.preventDefault();
                      if (!isOpen) {
                        focusInput();
                        handleOpenChange(true);
                      }
                    }
              }
            >
              {[<baseCombobox.Chips
                  className={`${COMBOBOX_CHIP_LIST_CLASS} ${isOpen ? "" : "pointer-events-none"}`}
                >
                  {[selectedItems.map((item: ComboboxOption<Value>) =>
                      (() => {
                        const Chip = ComboboxChip;
                        const chipProps = {
                          removable: isOpen && !item.disabled,
                          children: item.label,
                        };
                        const chipKey = item.value;
                        return (
                          <Chip key={chipKey} {...chipProps} />
                        );
                      })(),
                    ), <baseCombobox.Input
                      className={`${COMBOBOX_SEARCH_INPUT_CLASS} ${selectedItems.length === 0 && placeholder === undefined ? "min-w-[2ch]" : ""}`}
                      placeholder={
                        selectedItems.length === 0 ? (placeholder) : (undefined)
                      }
                      disabled={isDisabled}
                      {...state}
                      autoComplete={"off"}
                      data-1p-ignore={true}
                      data-lpignore={"true"}
                    />]}
                </baseCombobox.Chips>, caret]}
            </div>
          ) : mode === "input" ? (
            <div
              ref={inputWrapperRef}
              data-cds={dataCds}
              {...getControlSizeAttributes(size)}
              className={cn(triggerClasses, className)}
              data-disabled={isDisabled || undefined}
              data-invalid={fieldInvalid || undefined}
              onMouseDown={clickToFocusProps.onMouseDown}
              onClick={
                isDisabled
                  ? undefined
                  : (event: React.MouseEvent<HTMLDivElement>) => {
                      let current = wasOpenAtPointerDownRef.current;
                      wasOpenAtPointerDownRef.current = false;
                      let ancestor = (event.target as HTMLElement).closest(
                        "button",
                      );
                      if (
                        ancestor &&
                        event.currentTarget.contains(ancestor)
                      ) {
                        return;
                      }
                      event.preventDefault();
                      if (!isOpen && !current) {
                        focusInput();
                        handleOpenChange(true);
                      }
                    }
              }
            >
              {[<baseCombobox.Input
                  className={COMBOBOX_INLINE_INPUT_CLASS}
                  placeholder={placeholder}
                  disabled={isDisabled}
                  {...state}
                  autoComplete={"off"}
                  data-1p-ignore={true}
                  data-lpignore={"true"}
                />, clearControl, caret]}
            </div>
          ) : (
            <div
              ref={inputWrapperRef}
              data-cds={dataCds}
              {...getControlSizeAttributes(size)}
              className={cn(triggerClasses, className)}
              data-disabled={isDisabled || undefined}
              data-invalid={fieldInvalid || undefined}
            >
              {[<baseCombobox.Trigger
                  disabled={isDisabled}
                  {...state}
                  className={COMBOBOX_TRIGGER_BUTTON_CLASS}
                >
                  {[(() => {
                      const SelectionSummary = "span";
                      const selectionSummaryProps = {
                        id: triggerValueId,
                        className: "min-w-0 flex-1 truncate",
                        children: renderTriggerContent(),
                      };
                      const selectionSummaryKey = selectedItems
                        .map((item: ComboboxOption) => item.value)
                        .join("\x00");
                      return (
                        <SelectionSummary key={selectionSummaryKey} {...selectionSummaryProps} />
                      );
                    })(), showCaret && (
                      <Icon
                        name={"CaretDown"}
                        size={"sm"}
                        className={
                          "mr-0.5 shrink-0 text-muted transition-colors group-hover/cbx:text-secondary"
                        }
                      />
                    )]}
                </baseCombobox.Trigger>, clearControl]}
            </div>
          ), <baseCombobox.Portal
            container={(usePortalContainer()) as import("../contracts/overlays").BaseUIPortalContainer}
          >
            <ComboboxPopupResponsive
              anchorRef={inputWrapperRef}
              align={align}
              collisionPadding={collisionPadding}
              popupClassName={popupClassName}
              layerOffset={layerOffset}
              maxVisibleItems={maxVisibleItems}
              dataCds={dataCds}
              isLoading={isLoading}
              loadingStaleAfter={loadingStaleAfter}
              showPopupSearch={showPopupSearch}
              focusListOnOpen={usesSimpleSelectTrigger}
              searchPlaceholder={searchPlaceholder ?? placeholder}
              triggerPrefix={triggerPrefix}
              chipsPopupSearch={multipleTriggerMode === "chips" && showPopupSearch}
              disabled={isDisabled}
              virtualized={virtualized}
              sortedItems={sortedItems}
              displayedItems={virtualItems}
              renderedItemCount={displayedItemCount}
              estimateItemSize={estimateItemSize}
              hasMore={hasMore}
              isFetchingMore={isFetchingMore}
              onLoadMore={onLoadMore}
              paginationKey={paginationKey}
              virtualRowsRef={virtualListActionsRef}
              emptyMessage={resolvedEmptyMessage}
              groupSelected={groupSelectedFirst}
              renderListItem={renderOption}
              valueSet={selectedValueSet}
              searchQuery={searchQuery}
              showSelectAllFooter={showSelectAllFooter}
              footer={footer}
              footerDivider={footerDivider}
              handleSelectAll={selectAll}
              handleClearAll={clearAll}
              selectAllDisabled={items.every(
                (item: ComboboxOption<Value>) =>
                  item.disabled || selectedValueSet.has(item.value),
              )}
              clearAllDisabled={!hasClearableValues}
              close={closeCombobox}
              closeLabel={closeLabel}
            />
          </baseCombobox.Portal>]}
      </baseCombobox.Root>
    ),
    comboboxWithOverlay = (
      <CloseOnActivityHideProvider actionsRef={overlayActionsRef}>
        {canShowSheet ? (<FloatingPositionRenderProp
            open={isOpen}
            close={closeCombobox}
            onOpenChange={handleOpenChange}
            structurallyAnchored={mode !== "select" || multipleTriggerMode === "chips"}
          >
            {(
              sheetResult: SheetPopupResult<
                import("@base-ui/react/combobox").Combobox.Root.ChangeEventDetails
              >,
            ) =>
              reactCombobox.cloneElement(
                comboboxRoot as React.ReactElement<
                  Pick<
                    import("@base-ui/react/combobox").Combobox.Root.Props<
                      ComboboxOption<Value>
                    >,
                    "modal" | "onOpenChange" | "onOpenChangeComplete"
                  >
                >,
                {
                  modal: sheetResult.modal,
                  onOpenChange: sheetResult.onOpenChange,
                  onOpenChangeComplete: sheetResult.onOpenChangeComplete,
                },
              )
            }
          </FloatingPositionRenderProp>) : (comboboxRoot)}
      </CloseOnActivityHideProvider>
    );
  if (labelId === undefined) {
    return comboboxWithOverlay;
  }
  return (
    <div
      className={`gap-xs flex-col font-sans ${fullWidth ? "flex w-full" : "inline-flex"}`}
    >
      {[<label
          id={labelId}
          htmlFor={triggerId}
          className={"text-body text-primary font-medium leading-none"}
        >
          {label}
        </label>, comboboxWithOverlay]}
    </div>
  );
}
function comboboxSheetLabel(
  pointerType: PopupInputKind,
  touch: HTMLElement | null | undefined,
  desktop: HTMLElement | null | undefined,
  fallback: HTMLElement | null | undefined,
): HTMLElement | undefined {
  if (pointerType === "touch") {
    return touch ?? undefined;
  }
  return desktop ?? fallback ?? touch ?? undefined;
}
function ComboboxPopupResponsive<Value extends ComboboxKey>(
  props: ComboboxBridgeProps<Value>,
): React.ReactElement {
  useUiLocale();
  if (useHasSheetFrame()) {
    return <ComboboxPopupAsSheet {...props} />;
  } else {
    return (
      <ComboboxPopupFrame
        {...props}
        sheetPopup={defaultSheetHost}
        sheetParts={null}
      />
    );
  }
}
function ComboboxPopupAsSheet<Value extends ComboboxKey>(
  props: ComboboxBridgeProps<Value>,
): React.ReactElement {
  useUiLocale();
  return (
    <AdaptiveSheetPopupHost kind={"combobox"}>
      {(sheetPopup: SheetRenderState, sheetParts: MobileSheetParts | null) => (
        <ComboboxPopupFrame
          {...props}
          sheetPopup={sheetPopup}
          sheetParts={sheetParts}
        />
      )}
    </AdaptiveSheetPopupHost>
  );
}
function ComboboxPopupFrame<Value extends ComboboxKey>({
  sheetPopup: anchorRef,
  sheetParts: sheetParts,
  anchorRef: align,
  align: inputAlign,
  collisionPadding: showPopupSearch,
  popupClassName: popupClassName,
  layerOffset: collisionPadding,
  maxVisibleItems: maxVisibleItems,
  dataCds: layerOffset,
  isLoading: isLoading,
  loadingStaleAfter: dataCds,
  showPopupSearch: focusListOnOpen,
  focusListOnOpen: loadingStaleAfter,
  searchPlaceholder: searchPlaceholder,
  triggerPrefix: chipsPopupSearch,
  chipsPopupSearch: sortedItems,
  disabled: disabled,
  virtualized: triggerPrefix,
  sortedItems: estimateItemSize,
  displayedItems: virtualized,
  renderedItemCount: displayedItems,
  estimateItemSize: hasMore,
  hasMore: virtualRowsRef,
  isFetchingMore: onLoadMore,
  onLoadMore: renderListItem,
  paginationKey: groupSelected,
  virtualRowsRef: renderedItemCount,
  emptyMessage: isFetchingMore,
  groupSelected: paginationKey,
  renderListItem: valueSet,
  valueSet: searchQuery,
  searchQuery: emptyMessage,
  showSelectAllFooter: footer,
  footer: footerContent,
  footerDivider: handleSelectAll,
  handleSelectAll: footerDivider,
  handleClearAll: handleClearAll,
  selectAllDisabled: selectAllDisabled,
  clearAllDisabled: clearAllDisabled,
  close: close,
  closeLabel: closeLabel,
}: ComboboxHostProps<Value>): React.ReactElement {
  useUiLocale();
  let loadingLabel = useTranslation(
      "loadingOptions",
      uiMessage("design-system.combobox.loadingOptions"),
    ),
    value = useTranslation(
      "loadingMoreOptions",
      uiMessage("design-system.combobox.loadingMoreOptions"),
    ),
    isInitiallyLoading = isLoading && displayedItems === 0,
    selectAllLabel = useTranslation("selectAll", uiMessage("design-system.combobox.selectAll")),
    clearAllLabel = useTranslation("clear", "Clear"),
    [scrollElement, setScrollElement] = reactCombobox.useState<HTMLDivElement | null>(
      null,
    ),
    rootRemSize = useRootRemSize(),
    density = useDensity(),
    sheet = anchorRef.sheet,
    rowLineHeight = sheet
      ? (typographyThemeValues["leading-body"].steps[
          getDensitySizeIndex("comfortable", "lg") - 1
        ] ?? typographyThemeValues["leading-body"].comfortable)
      : typographyThemeValues["leading-body"][density],
    estimatedRowHeight =
      hasMore === undefined
        ? Math.ceil(
            Math.max(COMBOBOX_DEFAULT_ROW_HEIGHT / 16, rowLineHeight + 0.5) * rootRemSize,
          )
        : rootRemSize === 16
          ? hasMore
          : Math.ceil((hasMore * rootRemSize) / 16),
    filteredItems = baseCombobox.useFilteredItems<ComboboxOption<Value>>(),
    visibleItems = triggerPrefix ? virtualized : filteredItems,
    shouldStartNewGroups = !(paginationKey && searchQuery.size > 0),
    memo = reactCombobox.useMemo(() => {
      if (
        !estimateItemSize.some(
          (item: ComboboxOption<Value>) =>
            item.groupLabelBefore !== undefined,
        )
      ) {
        return null;
      }
      let values = new Set(
        visibleItems.map((item: ComboboxOption) => item.value),
      );
      return comboboxGroupMetadata(
        estimateItemSize,
        (item: ComboboxOption<Value>) => values.has(item.value),
        shouldStartNewGroups,
      );
    }, [estimateItemSize, visibleItems, shouldStartNewGroups]),
    firstVisibleValue = visibleItems[0]?.value,
    callback = reactCombobox.useCallback(
      (item: ComboboxOption<Value>): React.ReactNode =>
        valueSet(item, memo, item.value === firstVisibleValue),
      [valueSet, memo, firstVisibleValue],
    ),
    getVirtualItemKey = reactCombobox.useCallback(
      (rowIndex: number): string | number => {
        let item = virtualized[rowIndex];
        if (item === undefined) {
          return rowIndex;
        } else {
          return item.value;
        }
      },
      [virtualized],
    ),
    renderVirtualRow = reactCombobox.useCallback(
      (rowIndex: number): React.ReactNode => {
        let item = virtualized[rowIndex];
        if (item === undefined) {
          return null;
        } else {
          return valueSet(item, memo, rowIndex === 0, rowIndex);
        }
      },
      [virtualized, valueSet, memo],
    ),
    hasLoadMoreHandler = renderListItem !== undefined,
    [paginationSentinel, setPaginationSentinel] = reactCombobox.useState<HTMLElement | null>(
      null,
    ),
    ref = reactCombobox.useRef(renderListItem);
  reactCombobox.useEffect(() => {
    ref.current = renderListItem;
  }, [renderListItem]);
  let lastRequestedItemCountRef = reactCombobox.useRef<number | null>(null);
  reactCombobox.useEffect(() => {
    lastRequestedItemCountRef.current = null;
  }, [emptyMessage, groupSelected]);
  let previousItemCountRef = reactCombobox.useRef(displayedItems);
  reactCombobox.useEffect(() => {
    if (displayedItems < previousItemCountRef.current) {
      lastRequestedItemCountRef.current = null;
    }
    previousItemCountRef.current = displayedItems;
  }, [displayedItems]);
  reactCombobox.useEffect(() => {
    if (
      !paginationSentinel ||
      !scrollElement ||
      !hasLoadMoreHandler ||
      onLoadMore ||
      displayedItems === 0 ||
      (lastRequestedItemCountRef.current !== null && displayedItems <= lastRequestedItemCountRef.current)
    ) {
      return;
    }
    let paginationObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => {
        if (!entries.at(-1)?.isIntersecting) {
          return;
        }
        paginationObserver.disconnect();
        lastRequestedItemCountRef.current = displayedItems;
        ref.current?.();
      },
      {
        root: scrollElement,
        rootMargin: `0px 0px ${estimatedRowHeight * COMBOBOX_DEFAULT_CHIP_COUNT}px 0px`,
      },
    );
    paginationObserver.observe(paginationSentinel);
    return () => paginationObserver.disconnect();
  }, [
    paginationSentinel,
    scrollElement,
    hasLoadMoreHandler,
    onLoadMore,
    displayedItems,
    emptyMessage,
    groupSelected,
    estimatedRowHeight,
  ]);
  let overlayLayer = useOverlayLayer("combobox", collisionPadding),
    SheetChrome = anchorRef.sheet ? anchorRef.chrome : null,
    ActiveSheetParts = anchorRef.sheet && sheetParts !== null ? sheetParts : null,
    parentSheet = reactCombobox.useContext(sheetParentContext),
    popupRowHeight = sheet
      ? Math.max(estimatedRowHeight, Math.ceil((40 * rootRemSize) / 16))
      : estimatedRowHeight,
    estimateVirtualRowHeight = reactCombobox.useCallback(
      (rowIndex: number): number => {
        let item = virtualized[rowIndex];
        if (item === undefined) {
          return popupRowHeight;
        }
        let hasSeparator =
            rowIndex > 0 &&
            (item.separatorBefore ||
              (memo?.separatorAbove.has(item.value) ?? false)),
          hasCaption = memo?.captionAbove.has(item.value) ?? false;
        return (
          popupRowHeight +
          (hasSeparator ? COMBOBOX_DEFAULT_VISIBLE_ROWS : 0) +
          (hasCaption ? COMBOBOX_CHIP_LABEL_MAX_LENGTH : 0)
        );
      },
      [virtualized, memo, popupRowHeight],
    ),
    popupRef = reactCombobox.useRef(null),
    mergedPopupRef = useMergedRefs(popupRef, anchorRef.ref),
    getTrigger = reactCombobox.useCallback(
      () => align.current?.querySelector('[role="combobox"]'),
      [align],
    ),
    searchInputRef = reactCombobox.useRef(null),
    { ref: namedSearchRef, nameProps: searchNameProps } = useMirroredAccessibleName(
      searchInputRef,
      getTrigger,
      {},
      {
        fallback: chipsPopupSearch,
        fromTextEntry: sortedItems,
      },
    ),
    getInitialFocus = reactCombobox.useCallback(
      (inputKind: PopupInputKind): HTMLElement | undefined =>
        comboboxSheetLabel(inputKind, popupRef.current, null, searchInputRef.current),
      [],
    );
  return (
    <PortalRoot
      {...overlayLayer.portalProps}
      style={
        anchorRef.concealed
          ? {
              ...overlayLayer.portalProps.style,
              ...concealedPopupStyle,
            }
          : overlayLayer.portalProps.style
      }
      surface={elevationSurfaceNames.popover}
      density={sheet ? SHEET_DENSITY : undefined}
      closeOnActivityHide={true}
    >
      {[ActiveSheetParts !== null && anchorRef.sheet && (
          <ActiveSheetParts.ComboboxSheetBackdrop sheetPopup={anchorRef} />
        ), <layerBaseContext.Provider value={overlayLayer.base}>
          <baseCombobox.Positioner
            style={
              anchorRef.positionerStyle !== undefined
                ? {
                    ...overlayLayer.style,
                    ...anchorRef.positionerStyle,
                  }
                : overlayLayer.style
            }
            anchor={align}
            side={"bottom"}
            align={inputAlign}
            sideOffset={6}
            collisionPadding={showPopupSearch}
            positionMethod={"fixed"}
            {...(sheet ? (sheetPositioningOverrides as Partial<typeof sheetPositioningOverrides>) : {})}
            className={cn(
              popupClassName ?? "w-[var(--anchor-width)] min-w-[12rem]",
              !sheet && COMBOBOX_ANCHOR_HIDDEN_CLASS,
              sheet &&
                anchorRef.state.depth === 0 &&
                "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[100dvh] after:bg-surface-3",
            )}
          >
            <baseCombobox.Popup
              ref={mergedPopupRef}
              data-cds={layerOffset}
              initialFocus={loadingStaleAfter ? getInitialFocus : undefined}
              {...searchNameProps}
              {...(anchorRef.attrs as React.HTMLAttributes<HTMLDivElement>)}
              className={cn(
                COMBOBOX_POPUP_CLASS,
                sheet && sheetPopupClasses,
                sheet &&
                  "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]",
                sheet &&
                  "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
              )}
              style={{
                ...(sheet
                  ? undefined
                  : comboboxListHeightStyle(
                      maxVisibleItems,
                      triggerPrefix ? popupRowHeight : undefined,
                    )),
                ...(dataCds !== undefined && {
                  "--cds-combobox-stale-after": `${dataCds}ms`,
                }),
                ...anchorRef.style,
              }}
              aria-busy={isLoading || onLoadMore}
            >
              {[SheetChrome !== null && <SheetChrome.Handle />, <sheetParentContext.Provider
                  value={sheet ? anchorRef.stack : parentSheet}
                >
                  <div className={COMBOBOX_POPUP_BODY_CLASS}>
                    {[focusListOnOpen && (
                        <baseCombobox.Input
                          className={COMBOBOX_POPUP_SEARCH_CLASS}
                          placeholder={searchPlaceholder}
                          disabled={disabled}
                          {...searchNameProps}
                          autoComplete={"off"}
                          data-1p-ignore={true}
                          data-lpignore={"true"}
                        />
                      ), <div
                        ref={triggerPrefix || hasLoadMoreHandler ? setScrollElement : undefined}
                        tabIndex={-1}
                        className={COMBOBOX_LIST_CLASS}
                        {...{
                          [SHEET_SCROLL_ATTRIBUTE]: "",
                        }}
                      >
                        <ComboboxJsx.Fragment>
                          {[<baseCombobox.Empty
                              className={COMBOBOX_EMPTY_CLASS}
                            >
                              {isLoading || onLoadMore ? (null) : (isFetchingMore)}
                            </baseCombobox.Empty>, <baseCombobox.List
                              ref={namedSearchRef}
                              tabIndex={-1}
                              {...searchNameProps}
                              className={`cds-reset outline-none focus-visible:outline-hidden ${paginationKey ? COMBOBOX_SELECTED_SEPARATOR_CLASS : ""}`}
                            >
                              {triggerPrefix ? (<VirtualizedComboboxRows
                                  count={virtualized.length}
                                  estimateItemSize={popupRowHeight}
                                  estimateRowSize={estimateVirtualRowHeight}
                                  scrollEl={scrollElement}
                                  actionsRef={renderedItemCount}
                                  getItemKey={getVirtualItemKey}
                                  renderRow={renderVirtualRow}
                                />) : (callback)}
                            </baseCombobox.List>, virtualRowsRef && hasLoadMoreHandler && !isLoading && (
                              <div
                                ref={setPaginationSentinel}
                                aria-hidden={true}
                                className={"h-px"}
                              />
                            ), <ComboboxStatus
                              delay={0}
                              loading={isInitiallyLoading || onLoadMore}
                              loadingLabel={
                                isInitiallyLoading ? loadingLabel : value
                              }
                            />]}
                        </ComboboxJsx.Fragment>
                      </div>, (footer || footerContent) && (
                        <ComboboxJsx.Fragment>
                          {[handleSelectAll && (
                              <div
                                aria-hidden={true}
                                className={COMBOBOX_FOOTER_DIVIDER_CLASS}
                              />
                            ), <div
                              className={
                                handleSelectAll
                                  ? COMBOBOX_FOOTER_CLASS
                                  : "shrink-0"
                              }
                            >
                              {[footer && (
                                  <div
                                    className={
                                      "flex items-center justify-between gap-sm p-1"
                                    }
                                  >
                                    {[<Button
                                        variant={"ghost"}
                                        size={"sm"}
                                        onClick={footerDivider}
                                        disabled={selectAllDisabled}
                                      >
                                        {selectAllLabel}
                                      </Button>, <Button
                                        variant={"ghost"}
                                        size={"sm"}
                                        onClick={handleClearAll}
                                        disabled={clearAllDisabled}
                                      >
                                        {clearAllLabel}
                                      </Button>]}
                                  </div>
                                ), footerContent &&
                                  (typeof footerContent === "function"
                                    ? footerContent({
                                        close: close,
                                      })
                                    : footerContent)]}
                            </div>]}
                        </ComboboxJsx.Fragment>
                      ), SheetChrome !== null && (
                        <SheetChrome.DismissButton
                          onDismiss={close}
                          label={closeLabel}
                        />
                      )]}
                  </div>
                </sheetParentContext.Provider>]}
            </baseCombobox.Popup>
          </baseCombobox.Positioner>
        </layerBaseContext.Provider>]}
    </PortalRoot>
  );
}
function useComboboxOutsideInputRegistration(): void {
  let value = reactCombobox.useContext(ComboboxRegistrationContext),
    insidePopup = reactCombobox.useContext(ComboboxPopupInputContext);
  useIsomorphicLayoutEffect(() => {
    if (value === null || insidePopup) {
      return;
    }
    return value.addOutsideInput();
  }, [value, insidePopup]);
}
function useComboboxTriggerRef(
  ref?: React.Ref<HTMLElement>,
): React.RefCallback<HTMLElement> {
  let value = reactCombobox.useContext(ComboboxRegistrationContext),
    registrationRef = useComboboxRegistrationRef(
      reactCombobox.useContext(ComboboxPopupInputContext)
        ? undefined
        : value?.setTrigger,
      value?.getTrigger,
    );
  return useMergedRefs(ref, registrationRef);
}
function useComboboxPopupInputRef(
  ref?: React.Ref<HTMLElement>,
): React.RefCallback<HTMLElement> {
  let value = reactCombobox.useContext(ComboboxRegistrationContext),
    registrationRef = useComboboxRegistrationRef(
      reactCombobox.useContext(ComboboxPopupInputContext)
        ? value?.setPopupInput
        : undefined,
      value?.getPopupInput,
    );
  return useMergedRefs(ref, registrationRef);
}
function useComboboxTriggerElement(): () => HTMLElement | null {
  let value = reactCombobox.useContext(ComboboxRegistrationContext);
  if (reactCombobox.useContext(ComboboxChipsContext)) {
    return nullComboboxElement;
  } else {
    return value?.getTrigger ?? nullComboboxElement;
  }
}
function useComboboxAccessibleName(
  ref: React.Ref<HTMLElement> | undefined,
  label?: string,
  labelledBy?: string,
): {
  ref: React.RefCallback<HTMLElement>;
  nameProps: AccessibleNameProps;
} {
  let value = reactCombobox.useContext(ComboboxPopupInputContext),
    getTrigger = useComboboxTriggerElement();
  return useMirroredAccessibleName(
    ref,
    value ? getTrigger : nullComboboxElement,
    {
      ...(label !== undefined && {
        "aria-label": label,
      }),
      ...(labelledBy !== undefined && {
        "aria-labelledby": labelledBy,
      }),
    },
  );
}
function useComboboxListRef(
  ref?: React.Ref<HTMLElement>,
): React.RefCallback<HTMLElement> {
  let value = reactCombobox.useContext(ComboboxRegistrationContext),
    registrationRef = useComboboxRegistrationRef(value?.setList, value?.getList);
  return useMergedRefs(ref, registrationRef);
}
function useComboboxRegistrationRef(
  setElement: ((element: HTMLElement | null) => void) | undefined,
  getElement: (() => HTMLElement | null) | undefined,
): React.RefCallback<HTMLElement> {
  let ref = reactCombobox.useRef<HTMLElement | null>(null);
  return reactCombobox.useCallback(
    (element: HTMLElement | null) => {
      if (setElement === undefined || getElement === undefined) {
        return;
      }
      if (element !== null) {
        ref.current = element;
        setElement(element);
      } else if (getElement() === ref.current) {
        setElement(null);
      }
    },
    [setElement, getElement],
  );
}
function ComboboxCaret({
  className: className,
}: {
  className?: string;
}): React.ReactElement {
  useUiLocale();
  return (
    <span
      aria-hidden={true}
      className={cn(
        "pointer-events-none flex size-icon shrink-0 items-center justify-center text-muted",
        className,
      )}
    >
      <Icon name={"CaretDown"} size={"sm"} />
    </span>
  );
}
function ComboboxSeparator({
  className: className,
}: {
  className?: string;
}): React.ReactElement {
  useUiLocale();
  return (
    <baseCombobox.Separator
      className={cn(COMBOBOX_SEPARATOR_CLASS, className)}
      data-cds-part={COMBOBOX_SEPARATOR_PART}
    />
  );
}
function ComboboxFooter({
  className: className,
  children: children,
}: React.PropsWithChildren<{
  className?: string;
}>): React.ReactElement {
  useUiLocale();
  return (
    <ComboboxJsx.Fragment>
      {[<div aria-hidden={true} className={COMBOBOX_FOOTER_DIVIDER_CLASS} />, <div className={cn(COMBOBOX_FOOTER_CLASS, className)}>
          {children}
        </div>]}
    </ComboboxJsx.Fragment>
  );
}
function comboboxCloseEventDetails(): ImperativeComboboxDetails {
  let state: ImperativeComboboxDetails = {
    reason: "close-press",
    event: new Event("base-ui"),
    trigger: undefined,
    isCanceled: false,
    isPropagationAllowed: false,
    cancel(): void {
      state.isCanceled = true;
    },
    allowPropagation(): void {
      state.isPropagationAllowed = true;
    },
  };
  return state;
}
function ComboboxRoot<Value, Multiple extends boolean = false>(
  props: RestoredComboboxRootProps<Value, Multiple>,
): React.ReactElement {
  useUiLocale();
  let ref = reactCombobox.useRef<{
      inputOutsidePopup: number;
      trigger: HTMLElement | null;
      popupInput: HTMLElement | null;
      list: HTMLElement | null;
    }>({
      inputOutsidePopup: 0,
      trigger: null,
      popupInput: null,
      list: null,
    }),
    [value, setHasOutsideInput] = reactCombobox.useState(false),
    memo = reactCombobox.useMemo(
      () => ({
        addOutsideInput: () => {
          ref.current.inputOutsidePopup += 1;
          setHasOutsideInput(true);
          return () => {
            ref.current.inputOutsidePopup -= 1;
            setHasOutsideInput(ref.current.inputOutsidePopup > 0);
          };
        },
        hasOutsideInput: () => ref.current.inputOutsidePopup > 0,
        setTrigger: (element: HTMLElement | null) => {
          ref.current.trigger = element;
        },
        getTrigger: () => ref.current.trigger,
        setPopupInput: (element: HTMLElement | null) => {
          ref.current.popupInput = element;
        },
        getPopupInput: () => ref.current.popupInput,
        setList: (element: HTMLElement | null) => {
          ref.current.list = element;
        },
        getList: () => ref.current.list,
      }),
      [],
    ),
    canShowSheet = useSheetCapablePresentation();
  return (
    <ComboboxRegistrationContext.Provider value={memo}>
      <ComboboxChipsContext.Provider value={value}>
        <ComboboxPopupInputContext.Provider value={false}>
          {canShowSheet ? (<ComboboxRootRegistration rootProps={props} registration={memo} />) : (<baseCombobox.Root {...props} />)}
        </ComboboxPopupInputContext.Provider>
      </ComboboxChipsContext.Provider>
    </ComboboxRegistrationContext.Provider>
  );
}
function ComboboxRootRegistration<Value, Multiple extends boolean = false>({
  rootProps: rootProps,
  registration: registration,
}: {
  rootProps: RestoredComboboxRootProps<Value, Multiple>;
  registration: ComboboxRegistration;
}): React.ReactElement {
  useUiLocale();
  let value = useControllableOpen(rootProps),
    { onOpenChange: onOpenChange } = value,
    callback = reactCombobox.useCallback(() => {
      onOpenChange(false, comboboxCloseEventDetails());
    }, [onOpenChange]),
    structurallyAnchored = useValueCapturedOnOpen(
      value.open,
      registration.hasOutsideInput,
      false,
    ),
    sheetState = useAdaptiveSheet({
      open: value.open,
      close: callback,
      onOpenChange: value.onOpenChange,
      onOpenChangeComplete: rootProps.onOpenChangeComplete,
      structurallyAnchored: structurallyAnchored,
      closable: !(
        rootProps.open !== undefined && rootProps.onOpenChange === undefined
      ),
    });
  return (
    <SheetContextProvider value={sheetState}>
      <baseCombobox.Root
        {...rootProps}
        open={value.open}
        modal={sheetState.modal ?? rootProps.modal}
        onOpenChange={sheetState.onOpenChange}
        onOpenChangeComplete={sheetState.onOpenChangeComplete}
      />
    </SheetContextProvider>
  );
}
function FieldCombobox({
  label: error,
  hint: hint,
  error: required,
  required: label,
  fieldClassName: fieldClassName,
  ...remainingProps
}: FieldComboboxProps): React.ReactElement {
  useUiLocale();
  if (
    (error === undefined || error === null) &&
    (hint === undefined || hint === null) &&
    !required &&
    fieldClassName === undefined &&
    remainingProps.mode !== "input" &&
    (
      remainingProps as {
        triggerMode?: "summary" | "chips";
      }
    ).triggerMode !== "chips"
  ) {
    return <ComboboxComponents required={label} {...remainingProps} />;
  }
  return (
    <FieldWrapper
      label={error}
      hint={hint}
      error={required}
      fieldClassName={fieldClassName}
    >
      <ComboboxComponents required={label} {...remainingProps} />
    </FieldWrapper>
  );
}
function get_COMBOBOX_NO_RESULTS_LABEL() {
  return uiMessage("design-system.combobox.noResults");
}
export {
  Combobox,
  COMBOBOX_ANCHOR_HIDDEN_CLASS,
  COMBOBOX_AUTOCOMPLETE_INPUT_PROPS,
  COMBOBOX_CHIP_CLASS,
  COMBOBOX_CHIP_LABEL_MAX_LENGTH,
  COMBOBOX_CHIP_LIST_CLASS,
  COMBOBOX_CHIP_REMOVE_CLASS,
  COMBOBOX_CHIPS_INPUT_CLASS,
  COMBOBOX_DEFAULT_CHIP_COUNT,
  COMBOBOX_DEFAULT_ROW_HEIGHT,
  COMBOBOX_DEFAULT_VISIBLE_ROWS,
  COMBOBOX_EMPTY_CLASS,
  COMBOBOX_FOCUS_CLASS,
  COMBOBOX_FOOTER_CLASS,
  COMBOBOX_FOOTER_DIVIDER_CLASS,
  COMBOBOX_GROUP_LABEL_CLASS,
  COMBOBOX_INLINE_INPUT_CLASS,
  COMBOBOX_ITEM_CLASS,
  COMBOBOX_LIST_CLASS,
  COMBOBOX_MODE_CLASSES,
  get_COMBOBOX_NO_RESULTS_LABEL,
  COMBOBOX_POPUP_BODY_CLASS,
  COMBOBOX_POPUP_CLASS,
  COMBOBOX_POPUP_SEARCH_CLASS,
  COMBOBOX_ROW_HEIGHT_CSS,
  COMBOBOX_SEARCH_INPUT_CLASS,
  COMBOBOX_SELECTED_SEPARATOR_CLASS,
  COMBOBOX_SEPARATOR_CLASS,
  COMBOBOX_SEPARATOR_PART,
  COMBOBOX_TRIGGER_BUTTON_CLASS,
  COMBOBOX_TRIGGER_CLASS,
  COMBOBOX_VARIANT_CLASSES,
  ComboboxCaret,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxChipsContext,
  ComboboxClear,
  comboboxCloseEventDetails,
  ComboboxComponents,
  ComboboxEmpty,
  ComboboxFooter,
  ComboboxFooterAction,
  ComboboxGroupLabel,
  comboboxGroupMetadata,
  ComboboxInput,
  ComboboxItem,
  ComboboxItemIndicator,
  comboboxItemLabel,
  comboboxItemMatchesQuery,
  comboboxItemValue,
  ComboboxList,
  comboboxListHeightStyle,
  ComboboxOptionRow,
  ComboboxPopup,
  ComboboxPopupAsSheet,
  ComboboxPopupFrame,
  ComboboxPopupInputContext,
  ComboboxPopupResponsive,
  ComboboxPopupSearch,
  ComboboxPopupView,
  ComboboxRegistrationContext,
  ComboboxRoot,
  ComboboxRootRegistration,
  comboboxSelectionLabel,
  ComboboxSeparator,
  ComboboxSheetCapablePopup,
  comboboxSheetLabel,
  ComboboxTrigger,
  ComboboxValue,
  FieldCombobox,
  ComboboxJsx,
  comboboxVirtualJsx,
  normalizeComboboxSearchText,
  nullComboboxElement,
  reactCombobox,
  useComboboxAccessibleName,
  useComboboxListRef,
  useComboboxOutsideInputRegistration,
  useComboboxPopupInputRef,
  useComboboxRegistrationRef,
  useComboboxTriggerElement,
  useComboboxTriggerRef,
  VirtualizedComboboxRows,
};
export function installUiCombobox(): () => void {
  return () => {
    reactCombobox = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    ComboboxJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    COMBOBOX_TRIGGER_CLASS =
      "cds-reset group/cbx inline-flex items-center gap-1.5 h-control rounded font-sans text-body font-normal text-primary outline-none focus-visible:outline-hidden transition duration-fast data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none";
    COMBOBOX_VARIANT_CLASSES = {
      outline: `${fieldRingClasses} ${fieldHoverClasses}`,
      ghost:
        "bg-transparent hover:bg-fill-ghost-hover has-[[aria-haspopup][aria-expanded=true]]:bg-fill-ghost-hover aria-expanded:bg-fill-ghost-hover",
    };
    COMBOBOX_FOCUS_CLASS =
      "has-[:focus-visible]:shadow-focus data-[invalid]:has-[:focus-visible]:shadow-focus-danger";
    COMBOBOX_MODE_CLASSES = {
      select: `pl-0 ${COMBOBOX_FOCUS_CLASS} data-[disabled]:cursor-default`,
      input: `pl-sm cursor-text ${COMBOBOX_FOCUS_CLASS} data-[disabled]:cursor-default`,
    };
    COMBOBOX_CHIPS_INPUT_CLASS = `cds-reset group/cbx flex min-w-0 items-center gap-1.5 h-control pr-sm rounded font-sans text-body font-normal text-primary ${fieldRingClasses} ${fieldHoverClasses} cursor-text transition duration-fast ${COMBOBOX_FOCUS_CLASS} data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none`;
    COMBOBOX_TRIGGER_BUTTON_CLASS =
      "cds-reset flex min-w-0 flex-1 items-center gap-1.5 self-stretch pl-sm text-left border-0 bg-transparent p-0 outline-none focus-visible:outline-hidden";
    COMBOBOX_INLINE_INPUT_CLASS =
      "cds-reset min-w-0 flex-1 self-stretch bg-transparent border-0 outline-none focus-visible:outline-hidden p-0 text-body font-normal text-primary placeholder:text-muted";
    COMBOBOX_SEARCH_INPUT_CLASS =
      "cds-reset min-w-0 flex-1 bg-transparent border-0 outline-none focus-visible:outline-hidden p-0 text-body font-normal text-primary placeholder:text-muted";
    COMBOBOX_CHIP_CLASS =
      "relative max-w-full shrink-0 outline-none focus-visible:outline-hidden focus-visible:[box-shadow:inset_0_0_0_1px_var(--cds-fill-accent)]";
    COMBOBOX_CHIP_LIST_CLASS =
      "flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden [&>*]:relative [mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)]";
    COMBOBOX_POPUP_CLASS = `draggable-none flex flex-col max-h-[min(var(--available-height,100dvh),var(--cds-popup-max-h,320px))] ${getSurfaceClasses("popover")} cds-reset text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
    COMBOBOX_POPUP_BODY_CLASS =
      "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit] p-1";
    COMBOBOX_ANCHOR_HIDDEN_CLASS = "data-[anchor-hidden]:invisible";
    COMBOBOX_LIST_CLASS =
      "cds-reset min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-fade-y outline-none focus-visible:outline-hidden max-h-[var(--cds-popup-list-max-h,none)]";
    COMBOBOX_POPUP_SEARCH_CLASS =
      "-mx-1 -mt-1 mb-1 block w-[calc(100%+8px)] shrink-0 cds-reset bg-transparent border-0 border-b border-b-[var(--cds-border)] outline-none focus-visible:outline-hidden px-[calc(var(--cds-pad-md)+4px)] py-2 text-body font-normal text-primary placeholder:text-muted";
    COMBOBOX_ITEM_CLASS =
      "cds-reset group/cbx-item flex w-full items-center gap-2 min-h-control px-md py-1 rounded text-body font-normal text-primary select-none outline-none focus-visible:outline-hidden data-[highlighted]:bg-fill-ghost-hover data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none transition-opacity duration-fast data-[disabled]:transition-none data-[stale]:not-data-[disabled]:opacity-50 data-[stale]:delay-[var(--cds-combobox-stale-after,500ms)] starting:data-[stale]:not-data-[disabled]:opacity-100";
    COMBOBOX_ROW_HEIGHT_CSS =
      "max(var(--cds-h-control), var(--cds-leading-body) + 0.5rem)";
    COMBOBOX_SEPARATOR_CLASS = "mx-pad-md my-1 h-px bg-border";
    COMBOBOX_SEPARATOR_PART = "separator";
    COMBOBOX_GROUP_LABEL_CLASS =
      "px-md pt-2 pb-1 text-footnote font-medium text-muted select-none";
    COMBOBOX_SELECTED_SEPARATOR_CLASS =
      "[&>[data-selected]+[role=option]:not([data-selected])]:relative [&>[data-selected]+[role=option]:not([data-selected])]:mt-2 [&>[data-selected]+[role=option]:not([data-selected])]:before:absolute [&>[data-selected]+[role=option]:not([data-selected])]:before:-top-1 [&>[data-selected]+[role=option]:not([data-selected])]:before:inset-x-0 [&>[data-selected]+[role=option]:not([data-selected])]:before:border-t";
    COMBOBOX_EMPTY_CLASS = `empty:hidden ${COMBOBOX_STATUS_CLASS}`;
    COMBOBOX_FOOTER_DIVIDER_CLASS = "mx-pad-md mt-1 h-px shrink-0 bg-border";
    COMBOBOX_FOOTER_CLASS = "shrink-0 pt-1";
    COMBOBOX_NO_RESULTS_LABEL = "No results";
    COMBOBOX_DEFAULT_ROW_HEIGHT = 32;
    COMBOBOX_DEFAULT_VISIBLE_ROWS = 9;
    COMBOBOX_CHIP_LABEL_MAX_LENGTH = 28;
    COMBOBOX_DEFAULT_CHIP_COUNT = 3;
    normalizeComboboxSearchText = (text: string) =>
      text
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase();
    comboboxItemLabel = (item: ComboboxOption) => item.label;
    comboboxItemValue = (item: ComboboxOption) => item.value;
    ComboboxChip = reactCombobox.forwardRef(
      (
        {
          removable = true,
          className: className,
          render: render,
          children: children,
          ...props
        }: ComboboxChipProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = forwardedRef;
        return (
          <baseCombobox.Chip
            ref={value}
            {...props}
            className={cn(COMBOBOX_CHIP_CLASS, className)}
            render={
              render ?? (
                <Badge
                  variant={"neutral"}
                  truncate={true}
                  removeRender={
                    removable ? <baseCombobox.ChipRemove /> : undefined
                  }
                >
                  {children}
                </Badge>
              )
            }
          >
            {children}
          </baseCombobox.Chip>
        );
      },
    );
    ComboboxChip.displayName = "Combobox.Chip";
    COMBOBOX_CHIP_REMOVE_CLASS =
      "cds-reset inline-flex size-[calc(var(--cds-h-control-nested)-4px)] shrink-0 items-center justify-center rounded-[calc(var(--cds-h-control-nested)/4-2px)] border-0 bg-transparent p-0 text-muted outline-none focus-visible:outline-hidden transition-colors hover:bg-neutral-hover hover:text-primary focus-visible:bg-neutral-hover focus-visible:text-primary";
    ComboboxChipRemove = reactCombobox.forwardRef(
      (
        {
          className: className,
          children: children,
          ...props
        }: ComboboxPartProps<"ChipRemove">,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement => {
        let value = useTranslation("removeItem", uiMessage("design-system.combobox.removeItem", { item: uiMessage("design-system.badges.item") }), {
          item: "item",
        });
        return (
          <baseCombobox.ChipRemove
            ref={forwardedRef}
            aria-label={value}
            {...props}
            className={cn(COMBOBOX_CHIP_REMOVE_CLASS, className)}
          >
            {children ?? (<Icon name={"X"} size={"sm"} />)}
          </baseCombobox.ChipRemove>
        );
      },
    );
    ComboboxChipRemove.displayName = "Combobox.ChipRemove";
    (
      Combobox as typeof Combobox & {
        displayName?: string;
      }
    ).displayName = "Combobox";
    ComboboxOptionRow = reactCombobox.memo(
      <Value extends ComboboxKey>({
        item: item,
        index: index,
        selected: selected,
        stale: stale,
        renderItem: renderItem,
        searchQuery: searchQuery,
        indicator: indicator,
        leadsList = false,
        separatorAbove = false,
        groupCaption: groupCaption,
        announcedGroupLabel: announcedGroupLabel,
        wrapDescription = true,
      }: ComboboxRowProps<Value>) => {
        let value = indicator === "checkbox",
          groupAnnouncement =
            announcedGroupLabel !== undefined ? (
              <span className={"sr-only"}>{`, ${announcedGroupLabel}`}</span>
            ) : null;
        return (
          <ComboboxJsx.Fragment>
            {[!leadsList && (item.separatorBefore || separatorAbove) && (
                <baseCombobox.Separator
                  className={COMBOBOX_SEPARATOR_CLASS}
                  data-cds-part={COMBOBOX_SEPARATOR_PART}
                />
              ), groupCaption !== undefined && (
                <div aria-hidden={true} className={COMBOBOX_GROUP_LABEL_CLASS}>
                  {groupCaption}
                </div>
              ), <baseCombobox.Item
                value={item}
                index={index}
                disabled={item.disabled}
                data-stale={stale || undefined}
                className={COMBOBOX_ITEM_CLASS}
                title={renderItem ? (undefined) : (item.label)}
              >
                {[value && (
                    <span
                      data-size={"xs"}
                      className={
                        "flex shrink-0 -ml-[calc(var(--cds-pad-md)-(var(--cds-h-control)-var(--cds-checkbox))/2)]"
                      }
                    >
                      <CheckboxVisual checked={selected} />
                    </span>
                  ), item.icon !== undefined && (
                    <IconSlot icon={item.icon} />
                  ), renderItem ? (
                    <div className={"min-w-0 flex-1"}>
                      {[renderItem(item, searchQuery), groupAnnouncement]}
                    </div>
                  ) : (
                    <div className={"flex min-w-0 flex-1 flex-col gap-0.5"}>
                      {[<span className={"truncate"}>
                          {[item.label, groupAnnouncement]}
                        </span>, item.description !== undefined && (
                          <span
                            className={`text-footnote leading-snug text-muted ${wrapDescription ? "whitespace-normal break-words" : "truncate"}`}
                          >
                            {item.description}
                          </span>
                        )]}
                    </div>
                  ), indicator === "check" && (
                    <baseCombobox.ItemIndicator
                      className={"shrink-0 text-accent"}
                    >
                      <Icon name={"Check"} size={"auto"} bold={true} />
                    </baseCombobox.ItemIndicator>
                  )]}
              </baseCombobox.Item>]}
          </ComboboxJsx.Fragment>
        );
      },
    ) as GenericComboboxRow;
    ComboboxOptionRow.displayName = "ComboboxItem";
    ComboboxTrigger = reactCombobox.forwardRef(
      (
        {
          variant = "outline",
          size: size,
          className: className,
          children: children,
          ...props
        }: ComboboxTriggerProps,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement => {
        let value = reactCombobox.useId(),
          hasFieldContext = useHasFieldContext(),
          hasExplicitIdentity =
            props["aria-label"] !== undefined ||
            props["aria-labelledby"] !== undefined ||
            props.id !== undefined ||
            props.render !== undefined ||
            hasFieldContext,
          triggerRef = useComboboxTriggerRef(forwardedRef);
        return (
          <baseCombobox.Trigger
            ref={triggerRef}
            {...(hasExplicitIdentity
              ? {}
              : {
                  "aria-labelledby": value,
                })}
            data-cds={"Combobox"}
            {...props}
            {...getControlSizeAttributes(size)}
            className={cn(
              COMBOBOX_TRIGGER_CLASS,
              COMBOBOX_VARIANT_CLASSES[variant],
              "px-sm focus-visible:shadow-focus data-[invalid]:focus-visible:shadow-focus-danger",
              className,
            )}
          >
            {hasExplicitIdentity ? (children) : (<span id={value} className={"contents"}>
                {children}
              </span>)}
          </baseCombobox.Trigger>
        );
      },
    );
    ComboboxTrigger.displayName = "Combobox.Trigger";
    ComboboxValue = reactCombobox.forwardRef(
      (
        {
          className: className,
          placeholder: placeholder,
          children: children,
        }: ComboboxValueProps,
        forwardedRef: React.ForwardedRef<HTMLSpanElement>,
      ): React.ReactElement => (
        <span
          ref={forwardedRef}
          className={cn(
            "min-w-0 flex-1 truncate text-left",
            className,
          )}
        >
          {children !== undefined ? (<baseCombobox.Value>{children}</baseCombobox.Value>) : (placeholder !== undefined ? (<baseCombobox.Value>
              {(selection: React.ReactNode) =>
                selection === null || selection === undefined || selection === "" ? (
                  <span className={"text-muted"}>{placeholder}</span>
                ) : (
                  selection
                )
              }
            </baseCombobox.Value>) : (<baseCombobox.Value />))}
        </span>
      ),
    );
    ComboboxValue.displayName = "Combobox.Value";
    COMBOBOX_AUTOCOMPLETE_INPUT_PROPS = {
      autoComplete: "off",
      "data-1p-ignore": true,
      "data-lpignore": "true",
    };
    ComboboxInput = reactCombobox.forwardRef(
      (
        {
          className: className,
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledby,
          ...props
        }: ComboboxPartProps<"Input">,
        forwardedRef: React.ForwardedRef<HTMLInputElement>,
      ): React.ReactElement => {
        useComboboxOutsideInputRegistration();
        let { ref: value, nameProps: accessibleNameProps } = useComboboxAccessibleName(
          useComboboxPopupInputRef(useComboboxTriggerRef(forwardedRef)),
          ariaLabel,
          ariaLabelledby,
        );
        return (
          <baseCombobox.Input
            ref={value}
            {...COMBOBOX_AUTOCOMPLETE_INPUT_PROPS}
            {...accessibleNameProps}
            {...props}
            className={cn(COMBOBOX_INLINE_INPUT_CLASS, className)}
          />
        );
      },
    );
    ComboboxInput.displayName = "Combobox.Input";
    ComboboxPopupSearch = reactCombobox.forwardRef(
      (
        {
          className: className,
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledby,
          ...props
        }: ComboboxPartProps<"Input">,
        forwardedRef: React.ForwardedRef<HTMLInputElement>,
      ): React.ReactElement => {
        let { ref: value, nameProps: accessibleNameProps } = useComboboxAccessibleName(
          useComboboxPopupInputRef(forwardedRef),
          ariaLabel,
          ariaLabelledby,
        );
        return (
          <baseCombobox.Input
            ref={value}
            {...COMBOBOX_AUTOCOMPLETE_INPUT_PROPS}
            {...accessibleNameProps}
            {...props}
            className={cn(COMBOBOX_POPUP_SEARCH_CLASS, className)}
          />
        );
      },
    );
    ComboboxPopupSearch.displayName = "Combobox.PopupSearch";
    ComboboxClear = reactCombobox.forwardRef(
      (
        {
          className: className,
          children: children,
          "aria-label": ariaLabel,
          ...props
        }: ComboboxPartProps<"Clear">,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement => {
        let value = useTranslation(
          "clearSelection",
          uiMessage("design-system.combobox.clearSelection"),
        );
        return (
          <baseCombobox.Clear
            ref={forwardedRef}
            {...props}
            render={
              <Button
                iconOnly={true}
                variant={"ghost"}
                size={"sm"}
                icon={children || "X"}
                aria-label={ariaLabel ?? (value)}
                tooltip={false}
                className={cn(
                  "data-[ending-style]:hidden",
                  className,
                )}
              />
            }
          />
        );
      },
    );
    ComboboxClear.displayName = "Combobox.Clear";
    (
      ComboboxCaret as typeof ComboboxCaret & {
        displayName?: string;
      }
    ).displayName = "Combobox.Caret";
    ComboboxFooterAction = reactCombobox.forwardRef(
      (
        {
          icon: icon,
          children: children,
          className: className,
          ...props
        }: ComboboxFooterActionProps,
        forwardedRef: React.ForwardedRef<HTMLButtonElement>,
      ): React.ReactElement => (
        <button
          ref={forwardedRef}
          type={"button"}
          {...props}
          className={cn(
            "cds-reset flex w-full items-center gap-2 min-h-control px-md rounded",
            "text-body font-normal text-primary select-none outline-none focus-visible:outline-hidden",
            "hover:bg-fill-ghost-hover focus-visible:bg-fill-ghost-hover",
            className,
          )}
        >
          {[icon && (
              <IconSlot
                icon={
                  <Icon
                    name={icon}
                    size={"auto"}
                    className={"text-muted"}
                  />
                }
              />
            ), children]}
        </button>
      ),
    );
    ComboboxFooterAction.displayName = "Combobox.FooterAction";
    ComboboxPopup = reactCombobox.forwardRef(
      (
        {
          side = "bottom",
          align = "start",
          sideOffset = 6,
          "data-cds": dataCds = "Combobox",
          ...props
        }: ComboboxPopupProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let state = {
          side: side,
          align: align,
          sideOffset: sideOffset,
          "data-cds": dataCds,
          ...props,
        };
        if (useHasSheetFrame()) {
          return <ComboboxSheetCapablePopup {...state} ref={forwardedRef} />;
        } else {
          return (
            <ComboboxPopupView
              {...state}
              ref={forwardedRef}
              sheetPopup={defaultSheetHost}
              sheetParts={null}
            />
          );
        }
      },
    );
    ComboboxPopup.displayName = "Combobox.Popup";
    ComboboxSheetCapablePopup = reactCombobox.forwardRef(
      (
        popupProps: ComboboxPopupProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => (
        <AdaptiveSheetPopupHost kind={"combobox"}>
          {(sheetPopup: SheetRenderState, sheetParts: MobileSheetParts | null) => (
            <ComboboxPopupView
              {...popupProps}
              ref={forwardedRef}
              sheetPopup={sheetPopup}
              sheetParts={sheetParts}
            />
          )}
        </AdaptiveSheetPopupHost>
      ),
    );
    ComboboxSheetCapablePopup.displayName = "ComboboxSheetCapablePopup";
    ComboboxPopupView = reactCombobox.forwardRef(function (
      {
        sheetPopup: sheetPopup,
        sheetParts: sheetParts,
        ...props
      }: ComboboxPopupViewProps,
      forwardedRef: React.ForwardedRef<HTMLDivElement>,
    ): React.ReactElement {
      let {
          side: side = "bottom",
          align: align = "start",
          sideOffset: sideOffset = 6,
          collisionPadding: value,
          collisionAvoidance: collisionAvoidance,
          initialFocus: initialFocus,
          positionerClassName: positionerClassName,
          layerOffset: layerOffset,
          maxVisibleItems: maxVisibleItems,
          closeLabel: closeLabel,
          className: className,
          style: style,
          children: children,
          "data-cds": dataCds = "Combobox",
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledBy,
          ...popupProps
        } = props,
        overlayLayer = useOverlayLayer("combobox", layerOffset),
        sheet = sheetPopup.sheet,
        SheetChrome = sheetPopup.sheet ? sheetPopup.chrome : null,
        ActiveSheetParts = sheetPopup.sheet && sheetParts !== null ? sheetParts : null,
        ref = reactCombobox.useRef(null),
        registration = reactCombobox.useContext(ComboboxRegistrationContext),
        usesChips = reactCombobox.useContext(ComboboxChipsContext),
        { ref: accessibleNameRef, nameProps: accessibleNameProps } = useMirroredAccessibleName(
          forwardedRef,
          useComboboxTriggerElement(),
          {
            ...(ariaLabel !== undefined && {
              "aria-label": ariaLabel,
            }),
            ...(ariaLabelledBy !== undefined && {
              "aria-labelledby": ariaLabelledBy,
            }),
          },
        ),
        mergedPopupRef = useMergedRefs(accessibleNameRef, ref, sheetPopup.ref),
        callback = reactCombobox.useCallback(
          (inputKind: PopupInputKind): HTMLElement | undefined =>
            comboboxSheetLabel(
              inputKind,
              ref.current,
              registration?.getPopupInput() ?? null,
              registration?.getList() ?? null,
            ),
          [registration],
        ),
        resolvedInitialFocus = sheet
          ? callback
          : initialFocus !== undefined
            ? initialFocus
            : registration === null || usesChips
              ? false
              : callback,
        listHeightStyle = sheet ? undefined : comboboxListHeightStyle(maxVisibleItems),
        listStyle = listHeightStyle ?? {},
        sheetStyle = sheetPopup.style ?? {},
        popupStyle =
          listHeightStyle === undefined && sheetPopup.style === undefined
            ? style
            : typeof style === "function"
              ? (
                  popupState: import("@base-ui/react/combobox").Combobox.Popup.State,
                ) => ({
                  ...listStyle,
                  ...(
                    style as (
                      state: import("@base-ui/react/combobox").Combobox.Popup.State,
                    ) => React.CSSProperties
                  )(popupState),
                  ...sheetStyle,
                })
              : {
                  ...listStyle,
                  ...style,
                  ...sheetStyle,
                };
      return (
        <baseCombobox.Portal
          container={(usePortalContainer()) as import("../contracts/overlays").BaseUIPortalContainer}
        >
          <PortalRoot
            {...overlayLayer.portalProps}
            style={
              sheetPopup.concealed
                ? {
                    ...overlayLayer.portalProps.style,
                    ...concealedPopupStyle,
                  }
                : overlayLayer.portalProps.style
            }
            surface={elevationSurfaceNames.popover}
            density={sheet ? SHEET_DENSITY : undefined}
          >
            {[ActiveSheetParts !== null && sheetPopup.sheet && (
                <ActiveSheetParts.ComboboxSheetBackdrop sheetPopup={sheetPopup} />
              ), <layerBaseContext.Provider value={overlayLayer.base}>
                <baseCombobox.Positioner
                  style={
                    sheetPopup.positionerStyle !== undefined
                      ? {
                          ...overlayLayer.style,
                          ...sheetPopup.positionerStyle,
                        }
                      : overlayLayer.style
                  }
                  side={side}
                  align={align}
                  sideOffset={sideOffset}
                  collisionPadding={value}
                  collisionAvoidance={collisionAvoidance}
                  positionMethod={"fixed"}
                  {...(sheet ? (sheetPositioningOverrides as Partial<typeof sheetPositioningOverrides>) : {})}
                  className={cn(
                    positionerClassName ?? "w-[var(--anchor-width)] min-w-[12rem]",
                    !sheet && COMBOBOX_ANCHOR_HIDDEN_CLASS,
                    sheet &&
                      sheetPopup.state.depth === 0 &&
                      "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[100dvh] after:bg-surface-3",
                  )}
                >
                  <baseCombobox.Popup
                    data-cds={dataCds}
                    ref={mergedPopupRef}
                    initialFocus={resolvedInitialFocus}
                    {...accessibleNameProps}
                    {...(sheetPopup.attrs as React.HTMLAttributes<HTMLDivElement>)}
                    {...popupProps}
                    style={popupStyle}
                    className={cn(
                      COMBOBOX_POPUP_CLASS,
                      sheet && sheetPopupClasses,
                      sheet &&
                        "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]",
                      sheet &&
                        "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
                      className,
                    )}
                  >
                    <ComboboxPopupInputContext.Provider value={true}>
                      {SheetChrome !== null ? (<sheetParentContext.Provider
                          value={sheetPopup.stack}
                        >
                          {[<SheetChrome.Handle />, <SheetChrome.Body>
                              <div className={COMBOBOX_POPUP_BODY_CLASS}>
                                {[children, <SheetChrome.DismissButton
                                    onDismiss={sheetPopup.frame?.dismiss}
                                    label={closeLabel}
                                  />]}
                              </div>
                            </SheetChrome.Body>]}
                        </sheetParentContext.Provider>) : (<div className={COMBOBOX_POPUP_BODY_CLASS}>
                          {children}
                        </div>)}
                    </ComboboxPopupInputContext.Provider>
                  </baseCombobox.Popup>
                </baseCombobox.Positioner>
              </layerBaseContext.Provider>]}
          </PortalRoot>
        </baseCombobox.Portal>
      );
    });
    ComboboxPopupView.displayName = "ComboboxPopupView";
    ComboboxList = reactCombobox.forwardRef(
      (
        {
          className: className,
          "aria-label": ariaLabel,
          "aria-labelledby": ariaLabelledby,
          ...props
        }: ComboboxPartProps<"List">,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let { ref: value, nameProps: accessibleNameProps } = useMirroredAccessibleName(
          useComboboxListRef(forwardedRef),
          useComboboxTriggerElement(),
          {
            ...(ariaLabel !== undefined && {
              "aria-label": ariaLabel,
            }),
            ...(ariaLabelledby !== undefined && {
              "aria-labelledby": ariaLabelledby,
            }),
          },
        );
        return (
          <baseCombobox.List
            ref={value}
            {...accessibleNameProps}
            {...props}
            className={cn(COMBOBOX_LIST_CLASS, className)}
            {...{
              [SHEET_SCROLL_ATTRIBUTE]: "",
            }}
          />
        );
      },
    );
    ComboboxList.displayName = "Combobox.List";
    ComboboxEmpty = reactCombobox.forwardRef(
      (
        {
          className: className,
          children: children,
          ...props
        }: ComboboxPartProps<"Empty">,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = useTranslation(
          "noResults",
          uiMessage("design-system.combobox.noResults"),
        );
        return (
          <baseCombobox.Empty
            ref={forwardedRef}
            {...props}
            className={cn(COMBOBOX_EMPTY_CLASS, className)}
          >
            {children === undefined ? (value) : (children)}
          </baseCombobox.Empty>
        );
      },
    );
    ComboboxEmpty.displayName = "Combobox.Empty";
    ComboboxItem = reactCombobox.forwardRef(
      (
        {
          description: description,
          icon: icon,
          stale = false,
          className: className,
          children: children,
          ...props
        }: ComboboxItemPartProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ) => (
        <baseCombobox.Item
          ref={forwardedRef}
          data-stale={stale || undefined}
          {...props}
          className={cn(COMBOBOX_ITEM_CLASS, className)}
        >
          {[icon !== undefined && <IconSlot icon={icon} />, <div className={"flex min-w-0 flex-1 flex-col gap-0.5"}>
              {[<span className={"truncate"}>{children}</span>, description !== undefined && (
                  <span
                    className={
                      "whitespace-normal break-words text-footnote leading-snug text-muted"
                    }
                  >
                    {description}
                  </span>
                )]}
            </div>, <ComboboxItemIndicator />]}
        </baseCombobox.Item>
      ),
    );
    ComboboxItem.displayName = "Combobox.Item";
    ComboboxItemIndicator = reactCombobox.forwardRef(
      (
        {
          className: className,
          children: children,
          ...props
        }: ComboboxPartProps<"ItemIndicator">,
        forwardedRef: React.ForwardedRef<HTMLSpanElement>,
      ): React.ReactElement => (
        <baseCombobox.ItemIndicator
          ref={forwardedRef}
          {...props}
          className={cn("shrink-0 text-accent", className)}
        >
          {children ?? (<Icon name={"Check"} size={"md"} bold={true} />)}
        </baseCombobox.ItemIndicator>
      ),
    );
    ComboboxItemIndicator.displayName = "Combobox.ItemIndicator";
    ComboboxGroupLabel = reactCombobox.forwardRef(
      (
        { className: className, ...props }: ComboboxPartProps<"GroupLabel">,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => (
        <baseCombobox.GroupLabel
          ref={forwardedRef}
          {...props}
          className={cn(COMBOBOX_GROUP_LABEL_CLASS, className)}
        />
      ),
    );
    ComboboxGroupLabel.displayName = "Combobox.GroupLabel";
    (
      ComboboxSeparator as typeof ComboboxSeparator & {
        displayName?: string;
      }
    ).displayName = "Combobox.Separator";
    (
      ComboboxFooter as typeof ComboboxFooter & {
        displayName?: string;
      }
    ).displayName = "Combobox.Footer";
    ComboboxChips = reactCombobox.forwardRef(
      (
        { size: size, className: className, ...props }: ComboboxChipsProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => (
        <baseCombobox.Chips
          ref={forwardedRef}
          {...props}
          {...getControlSizeAttributes(size)}
          className={cn(
            COMBOBOX_CHIPS_INPUT_CLASS,
            "h-auto min-h-control flex-wrap py-1 pl-sm [&>*]:relative",
            className,
          )}
        />
      ),
    );
    ComboboxChips.displayName = "Combobox.Chips";
    ComboboxRegistrationContext =
      reactCombobox.createContext<ComboboxRegistration | null>(null);
    ComboboxChipsContext = reactCombobox.createContext(false);
    ComboboxPopupInputContext = reactCombobox.createContext(false);
    nullComboboxElement = () => null;
    (
      ComboboxRoot as typeof ComboboxRoot & {
        displayName?: string;
      }
    ).displayName = "Combobox.Root";
    ComboboxComponents = Object.assign(Combobox, {
      Root: ComboboxRoot,
      Trigger: ComboboxTrigger,
      Value: ComboboxValue,
      Input: ComboboxInput,
      PopupSearch: ComboboxPopupSearch,
      Clear: ComboboxClear,
      Caret: ComboboxCaret,
      FooterAction: ComboboxFooterAction,
      Popup: ComboboxPopup,
      List: ComboboxList,
      Empty: ComboboxEmpty,
      Status: ComboboxStatus_r,
      Item: ComboboxItem,
      ItemIndicator: ComboboxItemIndicator,
      Group: baseCombobox.Group,
      GroupLabel: ComboboxGroupLabel,
      Separator: ComboboxSeparator,
      Footer: ComboboxFooter,
      Chips: ComboboxChips,
      Chip: ComboboxChip,
      ChipRemove: ComboboxChipRemove,
      Collection: baseCombobox.Collection,
    });
    comboboxVirtualJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    (
      FieldCombobox as typeof FieldCombobox & {
        displayName?: string;
      }
    ).displayName = "Field.Combobox";
  };
}
