import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
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
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { Button, ButtonButtonClassNames_2, ButtonButtonClassNames_3, initializeButtonButton, initializeButtonButton_2 } from "../button/button";
import { Badge, initializeComponentsBadge } from "../components/badge";
import { CheckboxVisual, initializeComponentsCheckbox } from "../components/checkbox";
import { Icon, IconRenderer, initializeComponentsIcon_2, popupSurfaceClassName } from "../components/icon";
import { ComponentsSkeletonAssignValue, initializeComponentsSkeleton } from "../components/skeleton";
import { initializeComponentsSpinner, Spinner } from "../components/spinner";
import { ActivityBoundary, initializeDomRefComposition, initializeDomRefComposition_3, useMergedRefs } from "../dom/ref-composition";
import { initializeFieldContext, isInsideField, useFieldDisabled, useFieldInvalid } from "../field/context";
import { initializeHooksLayoutEffect, useIsomorphicLayoutEffect } from "../hooks/layout-effect";
import { initializeMenuPopup_2, useClickToFocus } from "../menu/popup";
import { initializeOverlaysBackdrop, OverlaysBackdropVisibilityOpacityConfig } from "../overlays/backdrop";
import { initializeOverlaysLayers, LayerBaseContext, useLayer } from "../overlays/layers";
import { initializePlatformReducedMotion_2, PlatformReducedMotionCss_2 } from "../platform/reduced-motion";
import { initializePlatformRootFontSize_2, initializePlatformRootFontSize_3, PopupSurface, useRootFontSize } from "../platform/root-font-size";
import { initializePopoverPopover, SheetCapablePopup } from "../popover/popover";
import { initializeSheetsKeyboardViewport, isTextInputElement } from "../sheets/keyboard-viewport";
import { ComfortableValue, initializeSheetsLayout, SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig } from "../sheets/layout";
import { initializeSheetsPopupStack, isInsideSheetPopup, SheetPopupProvider, SheetPopupRender, SheetsPopupStackSheetConcealedChromeConfig, SheetStackContext, useOverlayOpenState, useSheetInteractionMode, useSheetPopup } from "../sheets/popup-stack";
import { initializeSheetsPresentation, sheetScrollAttribute, useOpenSnapshot } from "../sheets/presentation";
import { initializeSheetsStyles_2, LabelsProviderContext, resolveLabel, useLabel } from "../sheets/styles";
import { cn, initializeClassNames } from "../theme/class-names";
import { getControlSizeRank, getSizeAttribute, initializeCdsRoot, useDensity, useOverlayRoot } from "../theme/root";
import { initializeThemeSurfaces, surfaceBackgroundTokens } from "../theme/surfaces";
import { initializeNpm__base_ui_react_wY, initializeNpm__tanstack_react_virtual_h7e, load_react, load_react_jsx_runtime, npm_Combobox_Yi, npm_measureElement_mve, npm_useVirtualizer_m7e } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var ComboboxComboboxFontSizeBodyFontSizeCaptionFontSizeCodeConfig: {
  "font-size-body": {
    compact: number;
    comfortable: number;
    steps: number[];
    textSize: {
      compact: {
        sm: number;
        lg: number;
      };
      comfortable: {
        sm: number;
        lg: number;
      };
    };
  };
  "font-size-caption": {
    compact: number;
    comfortable: number;
    steps: number[];
  };
  "font-size-code": {
    compact: number;
    comfortable: number;
  };
  "font-size-footnote": {
    compact: number;
    comfortable: number;
  };
  "font-size-heading": {
    compact: number;
    comfortable: number;
    textSize: {
      compact: {
        sm: number;
        lg: number;
      };
      comfortable: {
        sm: number;
        lg: number;
      };
    };
  };
  "font-size-prose": {
    compact: number;
    comfortable: number;
    steps: number[];
    textSize: string;
  };
  "font-size-title": {
    compact: number;
    comfortable: number;
  };
  "leading-body": {
    compact: number;
    comfortable: number;
    steps: number[];
    textSize: {
      compact: {
        sm: number;
        lg: number;
      };
      comfortable: {
        sm: number;
        lg: number;
      };
    };
  };
  "leading-caption": {
    compact: number;
    comfortable: number;
  };
  "leading-code": {
    compact: number;
    comfortable: number;
  };
  "leading-footnote": {
    compact: number;
    comfortable: number;
  };
  "leading-heading": {
    compact: number;
    comfortable: number;
    textSize: {
      compact: {
        sm: number;
        lg: number;
      };
      comfortable: {
        sm: number;
        lg: number;
      };
    };
  };
  "leading-prose": {
    compact: number;
    comfortable: number;
    steps: number[];
    textSize: string;
  };
  "leading-title": {
    compact: number;
    comfortable: number;
  };
};
var initializeComboboxCombobox: () => void;
var initializeComboboxCombobox_2: () => void;
var reactComboboxCombobox: typeof React;
var initializeComboboxCombobox_3: () => void;
var reactComboboxCombobox_2: typeof React;
var jsxComboboxCombobox: typeof import("react/jsx-runtime");
var ComboboxComboboxConstant: number;
var ComboboxComboboxClassNames: string;
var ComboboxComboboxCss: string;
var ComboboxStatus: ForwardComponent<HTMLDivElement, ComboboxStatusProps>;
var initializeComboboxCombobox_4: () => void;
var reactComboboxCombobox_3: typeof React;
var jsxComboboxCombobox_2: typeof import("react/jsx-runtime");
var ComboboxVirtualOverscan: number;
var ComboboxSkeletonRowCount: number;
var initializeComboboxCombobox_5: () => void;
var reactComboboxCombobox_4: typeof React;
var jsxComboboxCombobox_3: typeof import("react/jsx-runtime");
var ComboboxComboboxClassNames_2: string;
var ComboboxComboboxOutlineGhostConfig: {
  outline: string;
  ghost: string;
};
var ComboboxComboboxSelectInputConfig: {
  select: string;
  input: string;
};
var ComboboxComboboxCss_2: string;
var ComboboxComboboxClassNames_3: string;
var ComboboxComboboxClassNames_4: string;
var ComboboxComboboxClassNames_5: string;
var ComboboxComboboxLabel: string;
var ComboboxComboboxClassNames_6: string;
var ComboboxComboboxCss_3: string;
var ComboboxComboboxClassNames_7: string;
var ComboboxComboboxClassNames_8: string;
var ComboboxComboboxClassNames_9: string;
var comboboxGroupLabelClasses: string;
var ComboboxListRowHeightCss: string;
var ComboboxComboboxClassNames_10: string;
var SeparatorValue: string;
var ComboboxComboboxClassNames_11: string;
var comboboxInputClasses: string;
var ComboboxComboboxCss_4: string;
var ComboboxComboboxClassNames_12: string;
var ComboboxComboboxClassNames_13: string;
var ComboboxNoResultsLabel: string;
var ComboboxMinRowHeightPx: number;
var ComboboxSeparatorExtraHeightPx: number;
var ComboboxCaptionExtraHeightPx: number;
var ComboboxPrefetchRowsAhead: number;
var ComboboxComboboxToLowerCase: (input: string) => string;
var ComboboxComboboxGetLabel: (input: ComboboxOption<ComboboxKey>) => string;
var ComboboxComboboxGetValue: (input: ComboboxOption<ComboboxKey>) => string;
var ComboboxChip: ForwardComponent<HTMLDivElement, ComboboxChipProps>;
var comboboxOutsideInputClasses: string;
var ComboboxChipRemove: ForwardComponent<
  HTMLButtonElement,
  ComboboxPartProps<"ChipRemove">
>;
var ComboboxItem: GenericComboboxRow;
var ComboboxTrigger: ForwardComponent<
  HTMLButtonElement,
  ComboboxTriggerProps
>;
var ComboboxValue: ForwardComponent<HTMLSpanElement, ComboboxValueProps>;
var ComboboxComboboxAutoCompleteData1pIgnoreDataLpignoreConfig: {
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
var ComboboxItemAlias: ForwardComponent<
  HTMLDivElement,
  ComboboxItemPartProps
>;
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
var ComboboxTriggerHiddenContext: React.Context<boolean>;
var ComboboxInputInsidePopupContext: React.Context<boolean>;
var ComboboxComboboxHandler: () => null;
var ComboboxComboboxAssignValue: typeof Combobox & {
  Root: typeof ComboboxRoot;
  Trigger: typeof ComboboxTrigger;
  Value: typeof ComboboxValue;
  Caret: typeof ComboboxCaret;
  Input: typeof ComboboxInput;
  Popup: typeof ComboboxPopup;
  PopupSearch: typeof ComboboxPopupSearch;
  Clear: typeof ComboboxClear;
  List: typeof ComboboxList;
  Empty: typeof ComboboxEmpty;
  Status: typeof ComboboxStatus;
  Item: typeof ComboboxItemAlias;
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
var initializeComboboxCombobox_6: () => void;
function comboboxLabelProps({
  reactId: reactId,
  label: label,
  triggerPrefix: triggerPrefix,
  mode: mode,
  triggerMode: triggerMode,
  insideField: insideField,
}: ComboboxLabelInput): ComboboxLabelResult {
  let labelId = label ? `${reactId}-label` : undefined,
    isSelectTrigger = mode === "select" && triggerMode !== "chips",
    needsTriggerLabel =
      labelId !== undefined ||
      (!insideField && (triggerPrefix !== undefined || isSelectTrigger)),
    triggerId = needsTriggerLabel ? `${reactId}-trigger` : undefined,
    triggerValueId = needsTriggerLabel && isSelectTrigger ? `${reactId}-trigger-value` : undefined,
    labelledBy =
      (needsTriggerLabel && [labelId, triggerValueId].filter(Boolean).join(" ")) || undefined;
  return {
    labelId: labelId,
    triggerId: triggerId,
    triggerValueId: triggerValueId,
    ownLabelProps:
      needsTriggerLabel && triggerId
        ? {
            id: triggerId,
            "aria-labelledby": labelledBy,
          }
        : undefined,
  };
}
function copyTriggerLabelProps(
  element: Element | null | undefined,
  {
    fallback: fallbackLabel,
    fromTextEntry: isFromTextEntry = false,
  }: {
    fallback?: string;
    fromTextEntry?: boolean;
  } = {},
): AccessibleNameProps {
  if (
    element == null ||
    (!isFromTextEntry && isTextInputElement(element))
  )
    return {};
  let ownerDocument = element.ownerDocument,
    labelledByIds = (element.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .filter((candidateId) => {
        if (candidateId === "") return false;
        let referencedElement = ownerDocument.getElementById(candidateId);
        return referencedElement !== null && !element.contains(referencedElement);
      });
  if (labelledByIds.length > 0)
    return {
      "aria-labelledby": labelledByIds.join(" "),
    };
  for (let candidateLabel of [element.getAttribute("aria-label"), fallbackLabel]) {
    let trimmedLabel = candidateLabel?.trim();
    if (trimmedLabel !== undefined && trimmedLabel !== "")
      return {
        "aria-label": trimmedLabel,
      };
  }
  return {};
}
function useTriggerLabelProps(
  externalRef: React.Ref<HTMLElement> | undefined,
  getTriggerElement: () => Element | null | undefined,
  explicitNameProps: AccessibleNameProps,
  {
    fallback: fallbackLabel,
    fromTextEntry: isFromTextEntry = false,
  }: {
    fallback?: string;
    fromTextEntry?: boolean;
  } = {},
): {
  ref: React.RefCallback<HTMLElement>;
  nameProps: AccessibleNameProps;
} {
  let [copiedNameProps, setCopiedNameProps] = (0,
    reactComboboxCombobox.useState)<AccessibleNameProps>({}),
    hasExplicitName =
      explicitNameProps["aria-label"] !== undefined ||
      explicitNameProps["aria-labelledby"] !== undefined,
    triggerRefCallback = (0, reactComboboxCombobox.useCallback)(
      (triggerNode: HTMLElement | null): void => {
        if (triggerNode === null || hasExplicitName) return;
        let freshNameProps = copyTriggerLabelProps(getTriggerElement(), {
          fallback: fallbackLabel,
          fromTextEntry: isFromTextEntry,
        });
        setCopiedNameProps((previousNameProps) =>
          previousNameProps["aria-labelledby"] === freshNameProps["aria-labelledby"] &&
          previousNameProps["aria-label"] === freshNameProps["aria-label"]
            ? previousNameProps
            : freshNameProps,
        );
      },
      [hasExplicitName, getTriggerElement, fallbackLabel, isFromTextEntry],
    );
  return {
    ref: useMergedRefs(externalRef, triggerRefCallback),
    nameProps: hasExplicitName ? explicitNameProps : copiedNameProps,
  };
}
function useDelayElapsed(delayMs: number): boolean {
  let [hasElapsed, setHasElapsed] = (0, reactComboboxCombobox_2.useState)(delayMs <= 0);
  (0, reactComboboxCombobox_2.useEffect)(() => {
    if (delayMs <= 0) return;
    let timerId = window.setTimeout(() => setHasElapsed(true), delayMs);
    return () => window.clearTimeout(timerId);
  }, [delayMs]);
  return delayMs <= 0 || hasElapsed;
}
function DelayedContent({
  ms: ms2,
  children: children,
}: {
  ms: number;
  children?: React.ReactNode;
}): React.ReactNode {
  return useDelayElapsed(ms2) ? children : null;
}
function VirtualComboboxRows({
  count: count,
  estimateItemSize: estimateItemSize,
  estimateRowSize: estimateRowSize,
  scrollEl: scrollEl,
  actionsRef: actionsRef,
  getItemKey: getItemKey,
  renderRow: renderRow,
}: VirtualComboboxProps): React.ReactElement {
  useUiLocale();
  "use no memo";

  let estimateSizeForIndex = (index: number): number =>
      estimateRowSize?.(index) ?? estimateItemSize,
    virtualizer = npm_useVirtualizer_m7e({
      count: count,
      getItemKey: getItemKey,
      getScrollElement: () => scrollEl,
      estimateSize: estimateSizeForIndex,
      measureElement: (element, entry, instance) =>
        Math.max(
          npm_measureElement_mve(element, entry, instance),
          estimateSizeForIndex(instance.indexFromElement(element)),
        ),
      overscan: ComboboxVirtualOverscan,
      scrollPaddingStart: 28,
      scrollPaddingEnd: 28,
      enabled: scrollEl !== null,
    });
  (0, reactComboboxCombobox_3.useImperativeHandle)(
    actionsRef,
    () => ({
      scrollToIndex: (index) => virtualizer.scrollToIndex(index),
    }),
    [virtualizer],
  );
  useIsomorphicLayoutEffect(() => {
    virtualizer.measure();
  }, [virtualizer, estimateItemSize]);
  let virtualItems = virtualizer.getVirtualItems();
  return (
    <div
      data-row-pitch={estimateItemSize}
      style={{
        minHeight: `${virtualizer.getTotalSize()}px`,
        position: "relative",
      }}
    >
      {virtualItems.length > 0 ? (virtualItems.map((virtualItem) =>
          (() => {
            const _Component = "div";
            const _props = {
              ref: virtualizer.measureElement,
              "data-index": virtualItem.index,
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                transform: `translateY(${virtualItem.start}px)`,
              },
              children: renderRow(virtualItem.index),
            } as const;
            const _key = virtualItem.key;
            return <_Component key={_key} {..._props} />;
          })(),
        )) : (count > 0 ? (<div aria-hidden={true} className={"flex flex-col gap-1 px-md py-1"}>
          {Array.from<undefined, React.ReactElement>(
            {
              length: ComboboxSkeletonRowCount,
            },
            (skeletonItem, skeletonIndex) => (
              <ComponentsSkeletonAssignValue
                key={skeletonIndex}
                height={estimateItemSize - 8}
                className={"w-full"}
              />
            ),
          )}
        </div>) : (null))}
    </div>
  );
}
function comboboxMaxHeightStyle(
  maxVisibleRows?: number,
  rowHeightPx?: number,
): DesignStyle | undefined {
  if (!(maxVisibleRows === undefined || !(maxVisibleRows > 0)))
    return {
      "--cds-popup-max-h": "var(--available-height)",
      "--cds-popup-list-max-h":
        rowHeightPx !== undefined
          ? `calc(${maxVisibleRows} * ${rowHeightPx}px)`
          : `calc(${maxVisibleRows} * ${ComboboxListRowHeightCss})`,
    };
}
function comboboxItemMatchesSearch<Value extends ComboboxKey>(
  option: ComboboxOption<Value>,
  query: string,
): boolean {
  let lowerQuery = ComboboxComboboxToLowerCase(query);
  return (
    ComboboxComboboxToLowerCase(option.label).includes(lowerQuery) ||
    ComboboxComboboxToLowerCase(option.value).includes(lowerQuery)
  );
}
function comboboxSelectionLabel<Value extends ComboboxKey>(
  items: readonly ComboboxOption<Value>[],
  countSuffix?: string,
  labelResolver?: LabelResolver,
): string {
  let [firstItem] = items;
  return firstItem !== undefined && items.length === 1
    ? firstItem.label
    : countSuffix !== undefined
      ? `${items.length} ${countSuffix}`
      : resolveLabel(labelResolver, "nSelected", "{count} selected", {
          count: items.length,
        });
}
function comboboxVisibleGroups<Value extends ComboboxKey>(
  optionList: readonly ComboboxOption<Value>[],
  isVisible: (item: ComboboxOption<Value>) => boolean,
  shouldCarryGroupLabel: boolean,
): ComboboxGroupMap<Value> {
  let entries: Map<Value, string> = new Map(),
    values: Set<Value> = new Set(),
    runLabels: Map<Value, string> = new Map();
  if (!shouldCarryGroupLabel) {
    for (let option of optionList)
      option.groupLabelBefore !== undefined &&
        isVisible(option) &&
        entries.set(option.value, option.groupLabelBefore);
    return {
      captionAbove: entries,
      separatorAbove: values,
      runLabel: runLabels,
    };
  }
  let currentGroupLabel: string | undefined,
    pendingGroup:
      | {
          label: string;
          separator: boolean;
          start: Value;
        }
      | undefined;
  for (let option of optionList) {
    option.groupLabelBefore !== undefined
      ? ((currentGroupLabel = option.groupLabelBefore),
        (pendingGroup = {
          label: currentGroupLabel,
          separator: option.separatorBefore === true,
          start: option.value,
        }))
      : option.separatorBefore && ((currentGroupLabel = undefined), (pendingGroup = undefined));
    currentGroupLabel !== undefined &&
      (runLabels.set(option.value, currentGroupLabel),
      pendingGroup !== undefined &&
        isVisible(option) &&
        (entries.set(option.value, pendingGroup.label),
        pendingGroup.separator &&
          pendingGroup.start !== option.value &&
          values.add(option.value),
        (pendingGroup = undefined)));
  }
  return {
    captionAbove: entries,
    separatorAbove: values,
    runLabel: runLabels,
  };
}
function Combobox<Value extends ComboboxKey>(
  comboboxProps: ComboboxProps<Value>,
): React.ReactElement {
  useUiLocale();
  let {
      "data-cds": dataCds = "Combobox",
      mode: mode = "select",
      variant: variant = "outline",
      items: items,
      searchable: searchable,
      indicator: indicator,
      placeholder: placeholder,
      searchPlaceholder: searchPlaceholder,
      triggerPrefix: triggerPrefix,
      label: label,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledby,
      "aria-describedby": ariaDescribedby,
      "aria-required": ariaRequired,
      clearable: clearable = false,
      clearLabel: clearLabel,
      closeLabel: closeLabel,
      hideCaret: hideCaret = false,
      filter: filter,
      autoHighlight: autoHighlight,
      onInputChange: onInputChange,
      onOpenChange: onOpenChange,
      footerDivider: footerDivider = true,
      emptyMessage: emptyMessage,
      isLoading: isLoading = false,
      loadingStaleAfter: loadingStaleAfter,
      footer: footer,
      renderItem: renderItem,
      announceGroupLabels: announceGroupLabels = false,
      virtualized: virtualized = false,
      estimateItemSize: estimateItemSize,
      hasMore: hasMore = false,
      isFetchingMore: isFetchingMore = false,
      onLoadMore: onLoadMore,
      paginationKey: paginationKey,
      popupClassName: popupClassName,
      layerOffset: layerOffset,
      maxVisibleItems: maxVisibleItems,
      align: align = "start",
      collisionPadding: collisionPadding,
      disabled: disabled,
      required: required,
      name: name,
      size: size,
      fullWidth: fullWidth = true,
      className: className,
    } = comboboxProps,
    labelsContext = (0, reactComboboxCombobox_4.useContext)(
      LabelsProviderContext,
    ),
    defaultClearLabel = useLabel("clearSelection", "Clear selection"),
    resolvedClearLabel = clearLabel ?? defaultClearLabel,
    defaultNoResultsLabel = useLabel("noResults", ComboboxNoResultsLabel),
    resolvedEmptyMessage = emptyMessage ?? defaultNoResultsLabel,
    isSearchable = searchable ?? (items.length > 5 || onInputChange !== undefined),
    isMultiple = comboboxProps.multiple === true,
    triggerMode = comboboxProps.multiple ? (comboboxProps.triggerMode ?? "summary") : null,
    popupSearchInChips = (comboboxProps.multiple && comboboxProps.popupSearchInChips) ?? false,
    groupSelected = (comboboxProps.multiple && comboboxProps.groupSelected) ?? false,
    hasSelectAllFooter = comboboxProps.multiple && (comboboxProps.selectAllFooter ?? false),
    resolvedIndicator = indicator ?? (isMultiple ? "checkbox" : "check"),
    isInvalid = useFieldInvalid(),
    insideField = isInsideField(),
    isFieldDisabled = useFieldDisabled(),
    isDisabled = disabled || isFieldDisabled,
    isControlled = comboboxProps.value !== undefined,
    [internalValue, setInternalValue] = (0, reactComboboxCombobox_4.useState)(() =>
      comboboxProps.multiple
        ? (comboboxProps.defaultValue ?? [])
        : (comboboxProps.defaultValue ?? null),
    ),
    selectedValues: Value[] | undefined = (
      comboboxProps.multiple ? (isControlled ? comboboxProps.value : internalValue) : undefined
    ) as Value[] | undefined,
    selectedValue: Value | null | undefined = (
      comboboxProps.multiple ? undefined : isControlled ? comboboxProps.value : internalValue
    ) as Value | null | undefined,
    optionsByValue = (0, reactComboboxCombobox_4.useMemo)(
      () => new Map(items.map((option) => [option.value, option])),
      [items],
    ),
    selectedOptions = (0, reactComboboxCombobox_4.useMemo)(() => {
      if (comboboxProps.multiple)
        return (selectedValues ?? [])
          .map((selectedKey) => optionsByValue.get(selectedKey))
          .filter((option) => option !== undefined);
      let singleKey = selectedValue ?? null,
        singleOption = singleKey === null ? undefined : optionsByValue.get(singleKey);
      return singleOption ? [singleOption] : [];
    }, [comboboxProps.multiple, selectedValues, selectedValue, optionsByValue]),
    primarySelectedOption = selectedOptions[0] ?? null,
    hasSelection = selectedOptions.length > 0,
    propsRef = (0, reactComboboxCombobox_4.useRef)(comboboxProps);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    propsRef.current = comboboxProps;
  }, [comboboxProps]);
  let selectedOptionsRef = (0, reactComboboxCombobox_4.useRef)(selectedOptions);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    selectedOptionsRef.current = selectedOptions;
  }, [selectedOptions]);
  let selectedValuesRef = (0, reactComboboxCombobox_4.useRef)(selectedValues);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    selectedValuesRef.current = selectedValues;
  }, [selectedValues]);
  let handleValueChange = (0, reactComboboxCombobox_4.useCallback)(
      (
        nextSelection: ComboboxOption<Value> | ComboboxOption<Value>[] | null,
        eventDetails?: import("@base-ui/react/combobox").Combobox.Root.ChangeEventDetails,
      ): void => {
        let current = propsRef.current;
        if (current.multiple) {
          let nextOptions:
              | ComboboxOption<Value>[]
              | ComboboxOption<Value>
              | null = (nextSelection ?? []) as ComboboxOption<Value>[],
            values = new Set(nextOptions.map((nextOption) => nextOption.value)),
            lockedOptions = selectedOptionsRef.current.filter(
              (selectedOption) => selectedOption.disabled && !values.has(selectedOption.value),
            );
          if (lockedOptions.length > 0) {
            nextOptions = [...nextOptions, ...lockedOptions];
            let currentKeys = new Set(selectedValuesRef.current ?? []);
            if (
              nextOptions.length === currentKeys.size &&
              nextOptions.every((nextOption) => currentKeys.has(nextOption.value))
            )
              return;
          }
          let nextValues = nextOptions.map((nextOption) => nextOption.value);
          isControlled || setInternalValue(nextValues);
          current.onChange?.(nextValues);
        } else {
          let singleNextOption:
            | ComboboxOption<Value>[]
            | ComboboxOption<Value>
            | null = nextSelection as ComboboxOption<Value> | null;
          if (singleNextOption?.disabled) {
            eventDetails?.cancel();
            return;
          }
          let singleNextValue = singleNextOption?.value ?? null;
          isControlled || setInternalValue(singleNextValue);
          current.onChange?.(singleNextValue);
        }
      },
      [isControlled],
    ),
    handleSelectAll = (0, reactComboboxCombobox_4.useCallback)(() => {
      let values = new Set(selectedOptions.map((option) => option.value));
      handleValueChange(
        propsRef.current.items.filter(
          (option) => !option.disabled || values.has(option.value),
        ),
      );
    }, [handleValueChange, selectedOptions]),
    handleClearAll = (0, reactComboboxCombobox_4.useCallback)(() => {
      handleValueChange([]);
    }, [handleValueChange]),
    [isOpen, setIsOpen] = (0, reactComboboxCombobox_4.useState)(false),
    [searchQuery, setSearchQuery] = (0, reactComboboxCombobox_4.useState)(""),
    virtualRowsRef = (0,
    reactComboboxCombobox_4.useRef)<VirtualComboboxActions | null>(null),
    handleInputChange = (0, reactComboboxCombobox_4.useCallback)(
      (nextQuery: string): void => {
        setSearchQuery(nextQuery);
        onInputChange?.(nextQuery);
        virtualized && virtualRowsRef.current?.scrollToIndex(0);
      },
      [onInputChange, virtualized],
    ),
    handleOpenChange = (0, reactComboboxCombobox_4.useCallback)(
      (
        nextOpen: boolean,
        eventDetails?: import("@base-ui/react/combobox").Combobox.Root.ChangeEventDetails,
      ): void => {
        if (isMultiple && !nextOpen && eventDetails?.reason === "item-press") {
          eventDetails.cancel?.();
          handleInputChange("");
          return;
        }
        setIsOpen(nextOpen);
        onOpenChange?.(nextOpen);
        nextOpen || setSearchQuery("");
      },
      [isMultiple, onOpenChange, handleInputChange],
    ),
    closePopup = (0, reactComboboxCombobox_4.useCallback)(
      () => handleOpenChange(false),
      [handleOpenChange],
    ),
    imperativeRef = (0, reactComboboxCombobox_4.useRef)<{
      close: () => void;
    } | null>(null);
  (0, reactComboboxCombobox_4.useImperativeHandle)(
    imperativeRef,
    () => ({
      close: closePopup,
    }),
    [closePopup],
  );
  let selectedValueSet = (0, reactComboboxCombobox_4.useMemo)(
      () => new Set(selectedOptions.map((option) => option.value)),
      [selectedOptions],
    ),
    sortedItems = (0, reactComboboxCombobox_4.useMemo)(() => {
      if (!groupSelected) return items;
      let sortedCopy = items.slice();
      sortedCopy.sort(
        (firstItem, secondItem) =>
          (selectedValueSet.has(firstItem.value) ? 0 : 1) -
          (selectedValueSet.has(secondItem.value) ? 0 : 1),
      );
      return sortedCopy;
    }, [items, groupSelected, selectedValueSet]),
    displayedItems = (0, reactComboboxCombobox_4.useMemo)(() => {
      if (!virtualized || !isSearchable) return sortedItems;
      let trimmedQuery = searchQuery.trim();
      if (!trimmedQuery) return sortedItems;
      let matchFilter = filter ?? comboboxItemMatchesSearch;
      return sortedItems.filter((item) => matchFilter(item, trimmedQuery));
    }, [virtualized, isSearchable, sortedItems, searchQuery, filter]),
    displayedItemsRef = (0, reactComboboxCombobox_4.useRef)(displayedItems);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    displayedItemsRef.current = displayedItems;
  }, [displayedItems]);
  let handleItemHighlighted = (0, reactComboboxCombobox_4.useCallback)(
      (
        highlightedItem: ComboboxOption<Value> | undefined,
        highlightDetails: import("@base-ui/react/combobox").Combobox.Root.HighlightEventDetails,
      ): void => {
        if (highlightDetails.reason !== "keyboard" || !highlightedItem) return;
        let highlightedIndex = displayedItemsRef.current.findIndex(
          (item) => item.value === highlightedItem.value,
        );
        highlightedIndex >= 0 && virtualRowsRef.current?.scrollToIndex(highlightedIndex);
      },
      [],
    ),
    comboboxFilter = (0, reactComboboxCombobox_4.useMemo)<
      ((item: ComboboxOption<Value>, query: string) => boolean) | null
    >(() => {
      if (virtualized || (!isSearchable && mode === "select")) return null;
      let baseFilter = filter ?? comboboxItemMatchesSearch;
      return (item, query) => baseFilter(item, query);
    }, [virtualized, isSearchable, mode, filter]),
    renderedItemCount = (0, reactComboboxCombobox_4.useMemo)(() => {
      let trimmedQuery = searchQuery.trim();
      if (!comboboxFilter || trimmedQuery === "") return displayedItems.length;
      let index = 0;
      for (let item of displayedItems)
        comboboxFilter(item, trimmedQuery) && (index += 1);
      return index;
    }, [comboboxFilter, displayedItems, searchQuery]),
    isStale = isLoading && loadingStaleAfter !== undefined,
    customRenderItem = renderItem,
    renderListItem = (0, reactComboboxCombobox_4.useCallback)(
      (
        item: ComboboxOption<Value>,
        groupMap: ComboboxGroupMap<Value> | null,
        leadsList: boolean,
        itemIndex?: number,
      ): React.ReactElement =>
        (() => {
          const _ItemComponent = ComboboxItem;
          const _itemProps = {
            item: item,
            index: itemIndex,
            wrapDescription: itemIndex === undefined,
            selected: selectedValueSet.has(item.value),
            stale: isStale,
            renderItem: customRenderItem,
            searchQuery: customRenderItem ? searchQuery : "",
            indicator: resolvedIndicator,
            leadsList: leadsList,
            separatorAbove:
              groupMap?.separatorAbove.has(item.value) ?? false,
            groupCaption: groupMap?.captionAbove.get(item.value),
            announcedGroupLabel: announceGroupLabels
              ? groupMap?.runLabel.get(item.value)
              : undefined,
          } as const;
          const _itemKey = item.value;
          return <_ItemComponent key={_itemKey} {..._itemProps} />;
        })(),
      [customRenderItem, searchQuery, resolvedIndicator, selectedValueSet, isStale, announceGroupLabels],
    ),
    anchorRef = (0, reactComboboxCombobox_4.useRef)<HTMLDivElement | null>(
      null,
    ),
    wasOpenOnPointerDownRef = (0, reactComboboxCombobox_4.useRef)(false),
    isOpenRef = (0, reactComboboxCombobox_4.useRef)(false);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    if (mode !== "input") return;
    let ownerDocument = anchorRef.current?.ownerDocument ?? document,
      ownerWindow = ownerDocument.defaultView ?? window,
      handlePointerDown = () => {
        wasOpenOnPointerDownRef.current = isOpenRef.current;
        let handlePointerRelease = () => {
          ownerWindow.removeEventListener("pointerup", handlePointerRelease);
          ownerWindow.removeEventListener("pointercancel", handlePointerRelease);
          ownerWindow.setTimeout(() => {
            wasOpenOnPointerDownRef.current = false;
          }, 0);
        };
        ownerWindow.addEventListener("pointerup", handlePointerRelease);
        ownerWindow.addEventListener("pointercancel", handlePointerRelease);
      };
    ownerDocument.addEventListener("pointerdown", handlePointerDown, {
      capture: true,
      passive: true,
    });
    return () => {
      ownerDocument.removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
    };
  }, [mode]);
  let focusInput = (0, reactComboboxCombobox_4.useCallback)(() => {
      anchorRef.current?.querySelector("input")?.focus();
    }, []),
    { clickToFocusProps: clickToFocusProps } = useClickToFocus(
      () => {
        isOpen || wasOpenOnPointerDownRef.current || focusInput();
      },
      {
        disabled: isDisabled,
      },
    ),
    disabledSelectedKeys = (0, reactComboboxCombobox_4.useMemo)(
      () =>
        new Set(
          selectedOptions
            .filter((option) => option.disabled)
            .map((option) => option.value),
        ),
      [selectedOptions],
    ),
    hasRemovableSelection =
      comboboxProps.multiple === true &&
      (selectedValues ?? []).some((selectedKey) => !disabledSelectedKeys.has(selectedKey)),
    hasClearableSelection = hasSelection && (!comboboxProps.multiple || hasRemovableSelection),
    showClear = clearable && hasClearableSelection,
    showCaret = !hideCaret && !(clearable && isControlled && hasClearableSelection),
    showPopupSearch =
      mode === "select" &&
      isSearchable &&
      (triggerMode !== "chips" || popupSearchInChips) &&
      (items.length > 0 || isLoading || onInputChange !== undefined),
    focusListOnOpen = mode === "select" && triggerMode !== "chips" && !showPopupSearch,
    shouldAutoHighlight =
      autoHighlight ??
      (!groupSelected &&
        filter === undefined &&
        (mode === "input" || showPopupSearch)),
    renderTriggerValue = () => {
      let wrapWithIcon = (content: React.ReactNode): React.ReactNode =>
        primarySelectedOption?.icon === undefined ? (
          content
        ) : (
          <span className={"flex min-w-0 items-center gap-2"}>
            <IconRenderer icon={primarySelectedOption.icon} />
            <span className={"min-w-0 truncate"}>{content}</span>
          </span>
        );
      if (comboboxProps.multiple) {
        let multipleLabel =
          comboboxProps.renderTriggerValue?.(selectedOptions) ??
          (selectedOptions.length === 0
            ? (placeholder ?? "\xA0")
            : comboboxSelectionLabel(selectedOptions, comboboxProps.summaryNoun, labelsContext));
        return triggerPrefix !== undefined ? (
          <span className={"flex min-w-0 items-baseline gap-1.5"}>
            <span className={"shrink-0 text-muted"}>{triggerPrefix}</span>
            <span className={"min-w-0 truncate"}>{multipleLabel}</span>
          </span>
        ) : selectedOptions.length === 0 ? (
          <span className={"font-normal text-muted"}>{multipleLabel}</span>
        ) : (
          multipleLabel
        );
      }
      if (triggerPrefix !== undefined) {
        let singleLabel =
          comboboxProps.renderTriggerValue?.(primarySelectedOption) ?? primarySelectedOption?.label ?? placeholder;
        return (
          <span className={"flex min-w-0 items-baseline gap-1.5"}>
            <span className={"shrink-0 text-muted"}>{triggerPrefix}</span>
            {singleLabel !== undefined && (<span className={"min-w-0 truncate"} title={primarySelectedOption?.label}>
                {wrapWithIcon(singleLabel)}
              </span>)}
          </span>
        );
      }
      if (comboboxProps.renderTriggerValue) {
        let customContent = comboboxProps.renderTriggerValue(primarySelectedOption);
        if (customContent != null) return wrapWithIcon(customContent);
      }
      return primarySelectedOption ? (
        wrapWithIcon(primarySelectedOption.label)
      ) : (
        <span className={"font-normal text-muted"}>{placeholder ?? ("\xA0")}</span>
      );
    },
    caretIcon = showCaret && (
      <span
        aria-hidden={true}
        className={
          "pointer-events-none flex size-icon shrink-0 items-center justify-center text-muted"
        }
      >
        <Icon name={"CaretDown"} size={"sm"} />
      </span>
    ),
    isClearSquare = showClear && (mode === "select" || !showCaret),
    text =
      "[--fh:var(--cds-h-control)] [--fhn:var(--cds-h-control-nested)] [--fr:var(--cds-radius)]",
    clearButton = showClear && (
      <span
        className={
          isClearSquare
            ? `flex aspect-square h-control shrink-0 items-center justify-center ${text}`
            : `flex shrink-0 items-center ${text}`
        }
      >
        <npm_Combobox_Yi.Clear
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
    widthClassName = fullWidth ? "w-full min-w-0" : "shrink-0",
    reactId = (0, reactComboboxCombobox_4.useId)(),
    {
      labelId: labelId,
      triggerId: triggerId,
      triggerValueId: triggerValueId,
      ownLabelProps: ownLabelProps,
    } = comboboxLabelProps({
      reactId: reactId,
      label: label,
      triggerPrefix: triggerPrefix,
      mode: mode,
      triggerMode: triggerMode,
      insideField: insideField,
    }),
    state = {
      ...(ariaLabelledby !== undefined
        ? {
            ...(ownLabelProps && {
              id: ownLabelProps.id,
            }),
            ...(ariaLabel !== undefined && {
              "aria-label": ariaLabel,
            }),
            "aria-labelledby": ariaLabelledby,
          }
        : ariaLabel !== undefined && !label
          ? {
              ...(ownLabelProps && {
                id: ownLabelProps.id,
              }),
              "aria-label": ariaLabel,
            }
          : ownLabelProps || ariaLabel !== undefined
            ? {
                ...ownLabelProps,
                ...(ariaLabel !== undefined && {
                  "aria-label": ariaLabel,
                }),
              }
            : ownLabelProps),
      ...(ariaDescribedby !== undefined && {
        "aria-describedby": ariaDescribedby,
      }),
      ...(ariaRequired && {
        "aria-required": true,
      }),
    },
    paddingEndClassName = isClearSquare ? "pr-0" : "pr-sm",
    chipsPaddingStartClassName =
      selectedOptions.length > 0
        ? "pl-[calc((var(--cds-h-control)-var(--cds-h-control-nested))/2)]"
        : "pl-sm",
    rootClassName =
      triggerMode === "chips"
        ? `${ComboboxComboboxCss_2} ${chipsPaddingStartClassName} ${widthClassName}`
        : `${ComboboxComboboxClassNames_2} ${ComboboxComboboxOutlineGhostConfig[variant]} ${ComboboxComboboxSelectInputConfig[mode]} ${paddingEndClassName} ${widthClassName}`,
    isSheetMode = useSheetInteractionMode(),
    comboboxRoot = (
      <npm_Combobox_Yi.Root
        multiple={isMultiple}
        items={virtualized ? displayedItems : sortedItems}
        value={isMultiple ? selectedOptions : primarySelectedOption}
        onValueChange={handleValueChange}
        open={isOpen}
        onOpenChange={handleOpenChange}
        {...(mode === "select"
          ? {
              inputValue: searchQuery,
            }
          : {})}
        onInputValueChange={handleInputChange}
        onItemHighlighted={virtualized ? handleItemHighlighted : undefined}
        virtualized={virtualized}
        filter={comboboxFilter}
        autoHighlight={shouldAutoHighlight}
        itemToStringLabel={ComboboxComboboxGetLabel}
        itemToStringValue={ComboboxComboboxGetValue}
        disabled={isDisabled}
        required={required}
        name={name}
      >
        {triggerMode === "chips" ? (<div
            ref={anchorRef}
            data-cds={dataCds}
            {...getSizeAttribute(size)}
            className={cn(rootClassName, className)}
            data-disabled={isDisabled || undefined}
            data-invalid={isInvalid || undefined}
            onMouseDown={clickToFocusProps.onMouseDown}
            onClick={
              isDisabled
                ? undefined
                : (event: React.MouseEvent<HTMLElement>) => {
                    event.preventDefault();
                    isOpen || (focusInput(), handleOpenChange(true));
                  }
            }
          >
            <npm_Combobox_Yi.Chips
              className={`${ComboboxComboboxClassNames_6} ${isOpen ? "" : "pointer-events-none"}`}
            >
              {selectedOptions.map((chipOption) =>
                (() => {
                  const _ChipComponent = ComboboxChip;
                  const _chipProps = {
                    removable: isOpen && !chipOption.disabled,
                    children: chipOption.label,
                  } as const;
                  const _chipKey = chipOption.value;
                  return <_ChipComponent key={_chipKey} {..._chipProps} />;
                })(),
              )}
              <npm_Combobox_Yi.Input
                className={`${ComboboxComboboxClassNames_5} ${selectedOptions.length === 0 && placeholder === undefined ? "min-w-[2ch]" : ""}`}
                placeholder={selectedOptions.length === 0 ? (placeholder) : (undefined)}
                disabled={isDisabled}
                {...state}
                autoComplete={"off"}
                data-1p-ignore={true}
                data-lpignore={"true"}
              />
            </npm_Combobox_Yi.Chips>
            {caretIcon}
          </div>) : (mode === "input" ? (<div
            ref={anchorRef}
            data-cds={dataCds}
            {...getSizeAttribute(size)}
            className={cn(rootClassName, className)}
            data-disabled={isDisabled || undefined}
            data-invalid={isInvalid || undefined}
            onMouseDown={clickToFocusProps.onMouseDown}
            onClick={
              isDisabled
                ? undefined
                : (event: React.MouseEvent<HTMLElement>) => {
                    let current = wasOpenOnPointerDownRef.current;
                    wasOpenOnPointerDownRef.current = false;
                    let ancestor = (event.target as Element).closest(
                      "button",
                    );
                    (ancestor && event.currentTarget.contains(ancestor)) ||
                      (event.preventDefault(),
                      !isOpen && !current && (focusInput(), handleOpenChange(true)));
                  }
            }
          >
            <npm_Combobox_Yi.Input
              className={ComboboxComboboxClassNames_4}
              placeholder={placeholder}
              disabled={isDisabled}
              {...state}
              autoComplete={"off"}
              data-1p-ignore={true}
              data-lpignore={"true"}
            />
            {clearButton}
            {caretIcon}
          </div>) : (<div
            ref={anchorRef}
            data-cds={dataCds}
            {...getSizeAttribute(size)}
            className={cn(rootClassName, className)}
            data-disabled={isDisabled || undefined}
            data-invalid={isInvalid || undefined}
          >
            <npm_Combobox_Yi.Trigger
              disabled={isDisabled}
              {...state}
              className={ComboboxComboboxClassNames_3}
            >
              <span id={triggerValueId} className={"min-w-0 flex-1 truncate"}>
                {renderTriggerValue()}
              </span>
              {showCaret && (<Icon
                  name={"CaretDown"}
                  size={"sm"}
                  className={
                    "mr-0.5 shrink-0 text-muted transition-colors group-hover/cbx:text-secondary"
                  }
                />)}
            </npm_Combobox_Yi.Trigger>
            {clearButton}
          </div>))}
        <npm_Combobox_Yi.Portal
          container={useOverlayRoot()}
        >
          <ComboboxSheetBridge
            anchorRef={anchorRef}
            align={align}
            collisionPadding={collisionPadding}
            popupClassName={popupClassName}
            layerOffset={layerOffset}
            maxVisibleItems={maxVisibleItems}
            dataCds={dataCds}
            isLoading={isLoading}
            loadingStaleAfter={loadingStaleAfter}
            showPopupSearch={showPopupSearch}
            focusListOnOpen={focusListOnOpen}
            searchPlaceholder={searchPlaceholder ?? placeholder}
            triggerPrefix={triggerPrefix}
            chipsPopupSearch={triggerMode === "chips" && showPopupSearch}
            disabled={isDisabled}
            virtualized={virtualized}
            sortedItems={sortedItems}
            displayedItems={displayedItems}
            renderedItemCount={renderedItemCount}
            estimateItemSize={estimateItemSize}
            hasMore={hasMore}
            isFetchingMore={isFetchingMore}
            onLoadMore={onLoadMore}
            paginationKey={paginationKey}
            virtualRowsRef={virtualRowsRef}
            emptyMessage={resolvedEmptyMessage}
            groupSelected={groupSelected}
            renderListItem={renderListItem}
            valueSet={selectedValueSet}
            searchQuery={searchQuery}
            showSelectAllFooter={hasSelectAllFooter}
            footer={footer}
            footerDivider={footerDivider}
            handleSelectAll={handleSelectAll}
            handleClearAll={handleClearAll}
            selectAllDisabled={items.every(
              (item) => item.disabled || selectedValueSet.has(item.value),
            )}
            clearAllDisabled={!hasRemovableSelection}
            close={closePopup}
            closeLabel={closeLabel}
          />
        </npm_Combobox_Yi.Portal>
      </npm_Combobox_Yi.Root>
    ),
    comboboxContent = (
      <ActivityBoundary actionsRef={imperativeRef}>
        {isSheetMode ? (<SheetPopupRender
            open={isOpen}
            close={closePopup}
            onOpenChange={handleOpenChange}
            structurallyAnchored={mode !== "select" || triggerMode === "chips"}
          >
            {(sheetState: SheetPopupState) =>
              (0, reactComboboxCombobox_4.cloneElement)(
                comboboxRoot as React.ReactElement<{
                  modal?: boolean;
                  onOpenChange?: OverlayChange;
                  onOpenChangeComplete?: (open: boolean) => void;
                }>,
                {
                  modal: sheetState.modal,
                  onOpenChange: sheetState.onOpenChange,
                  onOpenChangeComplete: sheetState.onOpenChangeComplete,
                },
              )
            }
          </SheetPopupRender>) : (comboboxRoot)}
      </ActivityBoundary>
    );
  return labelId === undefined ? (
    comboboxContent
  ) : (
    <div
      className={`gap-xs flex-col font-sans ${fullWidth ? "flex w-full" : "inline-flex"}`}
    >
      <label
        id={labelId}
        htmlFor={triggerId}
        className={"text-body text-primary font-medium leading-none"}
      >
        {label}
      </label>
      {comboboxContent}
    </div>
  );
}
function comboboxTriggerForInputKind(
  inputKind: PopupInputKind,
  popupElement: HTMLElement | null | undefined,
  inputElement: HTMLElement | null | undefined,
  triggerElement: HTMLElement | null | undefined,
): HTMLElement | undefined {
  return inputKind === "touch"
    ? (popupElement ?? undefined)
    : (inputElement ?? triggerElement ?? popupElement ?? undefined);
}
function ComboboxSheetBridge<Value extends ComboboxKey>(
  bridgeProps: ComboboxBridgeProps<Value>,
): React.ReactElement {
  useUiLocale();
  return isInsideSheetPopup() ? (
    <ComboboxSheetPopup {...bridgeProps} />
  ) : (
    <ComboboxPopupHost
      {...bridgeProps}
      sheetPopup={SheetsPopupStackSheetConcealedChromeConfig}
      sheetParts={null}
    />
  );
}
function ComboboxSheetPopup<Value extends ComboboxKey>(
  bridgeProps: ComboboxBridgeProps<Value>,
): React.ReactElement {
  useUiLocale();
  return (
    <SheetCapablePopup kind={"combobox"}>
      {(sheetPopupState: SheetRenderState, sheetPartsState: MobileSheetParts | null) => (
        <ComboboxPopupHost
          {...bridgeProps}
          sheetPopup={sheetPopupState}
          sheetParts={sheetPartsState}
        />
      )}
    </SheetCapablePopup>
  );
}
function ComboboxPopupHost<Value extends ComboboxKey>({
  sheetPopup: sheetPopup,
  sheetParts: sheetParts,
  anchorRef: anchorRef,
  align: align,
  collisionPadding: collisionPadding,
  popupClassName: popupClassName,
  layerOffset: layerOffset,
  maxVisibleItems: maxVisibleItems,
  dataCds: dataCds,
  isLoading: isLoading,
  loadingStaleAfter: loadingStaleAfter,
  showPopupSearch: showPopupSearch,
  focusListOnOpen: focusListOnOpen,
  searchPlaceholder: searchPlaceholder,
  triggerPrefix: triggerPrefix,
  chipsPopupSearch: chipsPopupSearch,
  disabled: isDisabled,
  virtualized: virtualized,
  sortedItems: sortedItems,
  displayedItems: displayedItems,
  renderedItemCount: renderedItemCount,
  estimateItemSize: estimateItemSize,
  hasMore: hasMore,
  isFetchingMore: isFetchingMore,
  onLoadMore: onLoadMore,
  paginationKey: paginationKey,
  virtualRowsRef: virtualRowsRef,
  emptyMessage: emptyMessage,
  groupSelected: groupSelected,
  renderListItem: renderListItem,
  valueSet: valueSet,
  searchQuery: searchQuery,
  showSelectAllFooter: showSelectAllFooter,
  footer: footer,
  footerDivider: footerDivider,
  handleSelectAll: handleSelectAll,
  handleClearAll: handleClearAll,
  selectAllDisabled: selectAllDisabled,
  clearAllDisabled: clearAllDisabled,
  close: close,
  closeLabel: closeLabel,
}: ComboboxHostProps<Value>): React.ReactElement {
  useUiLocale();
  let loadingLabel = useLabel("loadingOptions", "Loading options"),
    loadingMoreLabel = useLabel(
      "loadingMoreOptions",
      "Loading more options",
    ),
    isInitialLoading = isLoading && renderedItemCount === 0,
    selectAllLabel = useLabel("selectAll", "Select all"),
    clearAllLabel = useLabel("clear", "Clear"),
    [scrollElement, setScrollElement] = (0,
    reactComboboxCombobox_4.useState)<HTMLDivElement | null>(null),
    rootFontSize = useRootFontSize(),
    density = useDensity(),
    sheet = sheetPopup.sheet,
    leadingBodyRem = sheet
      ? (ComboboxComboboxFontSizeBodyFontSizeCaptionFontSizeCodeConfig[
          "leading-body"
        ].steps[getControlSizeRank("comfortable", "lg") - 1] ??
        ComboboxComboboxFontSizeBodyFontSizeCaptionFontSizeCodeConfig[
          "leading-body"
        ].comfortable)
      : ComboboxComboboxFontSizeBodyFontSizeCaptionFontSizeCodeConfig[
          "leading-body"
        ][density],
    rowHeightPx =
      estimateItemSize === undefined
        ? Math.ceil(
            Math.max(ComboboxMinRowHeightPx / 16, leadingBodyRem + 0.5) * rootFontSize,
          )
        : rootFontSize === 16
          ? estimateItemSize
          : Math.ceil((estimateItemSize * rootFontSize) / 16),
    filteredItems =
      npm_Combobox_Yi.useFilteredItems<ComboboxOption<Value>>(),
    visibleItems = virtualized ? displayedItems : filteredItems,
    shouldCarryGroupLabel = !(groupSelected && valueSet.size > 0),
    visibleGroups = (0, reactComboboxCombobox_4.useMemo)(() => {
      if (!sortedItems.some((option) => option.groupLabelBefore !== undefined))
        return null;
      let values = new Set(visibleItems.map((option) => option.value));
      return comboboxVisibleGroups(
        sortedItems,
        (option) => values.has(option.value),
        shouldCarryGroupLabel,
      );
    }, [sortedItems, visibleItems, shouldCarryGroupLabel]),
    firstVisibleValue = visibleItems[0]?.value,
    renderItemForList = (0, reactComboboxCombobox_4.useCallback)(
      (item: ComboboxOption<Value>): React.ReactNode =>
        renderListItem(item, visibleGroups, item.value === firstVisibleValue),
      [renderListItem, visibleGroups, firstVisibleValue],
    ),
    getItemKey = (0, reactComboboxCombobox_4.useCallback)(
      (index: number): string | number => {
        let option = displayedItems[index];
        return option === undefined ? index : option.value;
      },
      [displayedItems],
    ),
    renderVirtualRow = (0, reactComboboxCombobox_4.useCallback)(
      (index: number): React.ReactNode => {
        let option = displayedItems[index];
        return option === undefined
          ? null
          : renderListItem(option, visibleGroups, index === 0, index);
      },
      [displayedItems, renderListItem, visibleGroups],
    ),
    hasLoadMore = onLoadMore !== undefined,
    [sentinelElement, setSentinelElement] = (0,
    reactComboboxCombobox_4.useState)<HTMLDivElement | null>(null),
    onLoadMoreRef = (0, reactComboboxCombobox_4.useRef)(onLoadMore);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);
  let loadedAtCountRef: React.RefObject<number | null> = (0,
  reactComboboxCombobox_4.useRef)<number | null>(null);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    loadedAtCountRef.current = null;
  }, [searchQuery, paginationKey]);
  let previousCountRef = (0, reactComboboxCombobox_4.useRef)(renderedItemCount);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    renderedItemCount < previousCountRef.current && (loadedAtCountRef.current = null);
    previousCountRef.current = renderedItemCount;
  }, [renderedItemCount]);
  (0, reactComboboxCombobox_4.useEffect)(() => {
    if (
      !sentinelElement ||
      !scrollElement ||
      !hasLoadMore ||
      isFetchingMore ||
      renderedItemCount === 0 ||
      (loadedAtCountRef.current !== null && renderedItemCount <= loadedAtCountRef.current)
    )
      return;
    let observer = new IntersectionObserver(
      ([entry]) => {
        entry?.isIntersecting &&
          (observer.disconnect(),
          (loadedAtCountRef.current = renderedItemCount),
          onLoadMoreRef.current?.());
      },
      {
        root: scrollElement,
        rootMargin: `0px 0px ${rowHeightPx * ComboboxPrefetchRowsAhead}px 0px`,
      },
    );
    observer.observe(sentinelElement);
    return () => observer.disconnect();
  }, [
    sentinelElement,
    scrollElement,
    hasLoadMore,
    isFetchingMore,
    renderedItemCount,
    searchQuery,
    paginationKey,
    rowHeightPx,
  ]);
  let layer = useLayer("combobox", layerOffset),
    SheetChrome = sheetPopup.sheet ? sheetPopup.chrome : null,
    ActiveSheetParts = sheetPopup.sheet && sheetParts !== null ? sheetParts : null,
    sheetStack = (0, reactComboboxCombobox_4.useContext)(
      SheetStackContext,
    ),
    baseRowHeightPx = sheet
      ? Math.max(rowHeightPx, Math.ceil((40 * rootFontSize) / 16))
      : rowHeightPx,
    estimateRowSize = (0, reactComboboxCombobox_4.useCallback)(
      (index: number): number => {
        let option = displayedItems[index];
        if (option === undefined) return baseRowHeightPx;
        let hasSeparatorAbove =
            index > 0 &&
            (option.separatorBefore ||
              (visibleGroups?.separatorAbove.has(option.value) ?? false)),
          hasCaptionAbove = visibleGroups?.captionAbove.has(option.value) ?? false;
        return (
          baseRowHeightPx +
          (hasSeparatorAbove ? ComboboxSeparatorExtraHeightPx : 0) +
          (hasCaptionAbove ? ComboboxCaptionExtraHeightPx : 0)
        );
      },
      [displayedItems, visibleGroups, baseRowHeightPx],
    ),
    popupRef = (0, reactComboboxCombobox_4.useRef)<HTMLDivElement | null>(
      null,
    ),
    mergedPopupRef = useMergedRefs(popupRef, sheetPopup.ref),
    getTriggerElement = (0, reactComboboxCombobox_4.useCallback)(
      () => anchorRef.current?.querySelector('[role="combobox"]'),
      [anchorRef],
    ),
    triggerRef = (0, reactComboboxCombobox_4.useRef)<HTMLElement | null>(null),
    { ref: triggerLabelRef, nameProps: triggerNameProps } = useTriggerLabelProps(
      triggerRef,
      getTriggerElement,
      {},
      {
        fallback: triggerPrefix,
        fromTextEntry: chipsPopupSearch,
      },
    ),
    getInitialFocusTarget = (0, reactComboboxCombobox_4.useCallback)(
      (inputKind: PopupInputKind): HTMLElement | undefined =>
        comboboxTriggerForInputKind(
          inputKind,
          popupRef.current,
          null,
          triggerRef.current,
        ),
      [],
    );
  return (
    <PopupSurface
      {...layer.portalProps}
      style={
        sheetPopup.concealed
          ? {
              ...layer.portalProps.style,
              ...OverlaysBackdropVisibilityOpacityConfig,
            }
          : layer.portalProps.style
      }
      surface={surfaceBackgroundTokens.popover}
      density={sheet ? ComfortableValue : undefined}
      closeOnActivityHide={true}
    >
      {ActiveSheetParts !== null && sheetPopup.sheet && (<ActiveSheetParts.ComboboxSheetBackdrop sheetPopup={sheetPopup} />)}
      <LayerBaseContext.Provider value={layer.base}>
        <npm_Combobox_Yi.Positioner
          style={
            sheetPopup.positionerStyle !== undefined
              ? {
                  ...layer.style,
                  ...sheetPopup.positionerStyle,
                }
              : layer.style
          }
          anchor={anchorRef}
          side={"bottom"}
          align={align}
          sideOffset={6}
          collisionPadding={collisionPadding}
          positionMethod={"fixed"}
          {...(sheet
            ? SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig
            : {})}
          className={cn(
            popupClassName ?? "w-[var(--anchor-width)] min-w-[12rem]",
            sheet &&
              (
                sheetPopup.state as {
                  depth: number;
                }
              ).depth === 0 &&
              "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[100dvh] after:bg-surface-3",
          )}
        >
          <npm_Combobox_Yi.Popup
            ref={mergedPopupRef}
            data-cds={dataCds}
            initialFocus={focusListOnOpen ? getInitialFocusTarget : undefined}
            {...triggerNameProps}
            {...sheetPopup.attrs}
            className={cn(
              ComboboxComboboxCss_3,
              sheet && PlatformReducedMotionCss_2,
              sheet &&
                "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]",
              sheet &&
                "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
            )}
            style={{
              ...(sheet
                ? undefined
                : comboboxMaxHeightStyle(
                    maxVisibleItems,
                    virtualized ? baseRowHeightPx : undefined,
                  )),
              ...(loadingStaleAfter !== undefined && {
                "--cds-combobox-stale-after": `${loadingStaleAfter}ms`,
              }),
              ...sheetPopup.style,
            }}
            aria-busy={isLoading || isFetchingMore}
          >
            {SheetChrome !== null && (<SheetChrome.Handle />)}
            <SheetStackContext.Provider
              value={sheet ? sheetPopup.stack : sheetStack}
            >
              <div className={ComboboxComboboxClassNames_7}>
                {showPopupSearch && (<npm_Combobox_Yi.Input
                    className={ComboboxComboboxClassNames_9}
                    placeholder={searchPlaceholder}
                    disabled={isDisabled}
                    {...triggerNameProps}
                    autoComplete={"off"}
                    data-1p-ignore={true}
                    data-lpignore={"true"}
                  />)}
                <div
                  ref={virtualized || hasLoadMore ? setScrollElement : undefined}
                  tabIndex={-1}
                  className={ComboboxComboboxClassNames_8}
                  {...{
                    [sheetScrollAttribute]: "",
                  }}
                >
                  <jsxComboboxCombobox_3.Fragment>
                    <npm_Combobox_Yi.Empty
                      className={ComboboxComboboxCss_4}
                    >
                      {isLoading || isFetchingMore ? (null) : (emptyMessage)}
                    </npm_Combobox_Yi.Empty>
                    <npm_Combobox_Yi.List
                      ref={triggerLabelRef}
                      tabIndex={-1}
                      {...triggerNameProps}
                      className={`cds-reset outline-none focus-visible:outline-hidden ${groupSelected ? comboboxInputClasses : ""}`}
                    >
                      {virtualized ? (<VirtualComboboxRows
                          count={displayedItems.length}
                          estimateItemSize={baseRowHeightPx}
                          estimateRowSize={estimateRowSize}
                          scrollEl={scrollElement}
                          actionsRef={virtualRowsRef}
                          getItemKey={getItemKey}
                          renderRow={renderVirtualRow}
                        />) : (renderItemForList)}
                    </npm_Combobox_Yi.List>
                    {hasMore && hasLoadMore && !isLoading && (<div
                        ref={setSentinelElement}
                        aria-hidden={true}
                        className={"h-px"}
                      />)}
                    <ComboboxStatus
                      delay={0}
                      loading={isInitialLoading || isFetchingMore}
                      loadingLabel={isInitialLoading ? loadingLabel : loadingMoreLabel}
                    />
                  </jsxComboboxCombobox_3.Fragment>
                </div>
                {showSelectAllFooter || footer && (<jsxComboboxCombobox_3.Fragment>
                    {footerDivider && (<div
                        aria-hidden={true}
                        className={ComboboxComboboxClassNames_12}
                      />)}
                    <div
                      className={
                        footerDivider
                          ? ComboboxComboboxClassNames_13
                          : "shrink-0"
                      }
                    >
                      {showSelectAllFooter && (<div
                          className={
                            "flex items-center justify-between gap-sm p-1"
                          }
                        >
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            onClick={handleSelectAll}
                            disabled={selectAllDisabled}
                          >
                            {selectAllLabel}
                          </Button>
                          <Button
                            variant={"ghost"}
                            size={"sm"}
                            onClick={handleClearAll}
                            disabled={clearAllDisabled}
                          >
                            {clearAllLabel}
                          </Button>
                        </div>)}
                      {footer && (typeof footer == "function" ? (footer({
                              close: close,
                            })) : (footer))}
                    </div>
                  </jsxComboboxCombobox_3.Fragment>)}
                {SheetChrome !== null && (<SheetChrome.DismissButton
                    onDismiss={close}
                    label={closeLabel}
                  />)}
              </div>
            </SheetStackContext.Provider>
          </npm_Combobox_Yi.Popup>
        </npm_Combobox_Yi.Positioner>
      </LayerBaseContext.Provider>
    </PopupSurface>
  );
}
function registerOutsideComboboxInput(): void {
  let registration = (0, reactComboboxCombobox_4.useContext)(
      ComboboxRegistrationContext,
    ),
    isInsidePopup = (0, reactComboboxCombobox_4.useContext)(
      ComboboxInputInsidePopupContext,
    );
  useIsomorphicLayoutEffect(() => {
    if (!(registration === null || isInsidePopup)) return registration.addOutsideInput();
  }, [registration, isInsidePopup]);
}
function useComboboxTriggerRef(
  externalRef?: React.Ref<HTMLElement>,
): React.RefCallback<HTMLElement> {
  let registration = (0, reactComboboxCombobox_4.useContext)(
      ComboboxRegistrationContext,
    ),
    registeredRef = useRegisteredElementRef(
      (0, reactComboboxCombobox_4.useContext)(ComboboxInputInsidePopupContext)
        ? undefined
        : registration?.setTrigger,
      registration?.getTrigger,
    );
  return useMergedRefs(externalRef, registeredRef);
}
function useComboboxPopupInputRef(
  externalRef?: React.Ref<HTMLElement>,
): React.RefCallback<HTMLElement> {
  let registration = (0, reactComboboxCombobox_4.useContext)(
      ComboboxRegistrationContext,
    ),
    registeredRef = useRegisteredElementRef(
      (0, reactComboboxCombobox_4.useContext)(ComboboxInputInsidePopupContext)
        ? registration?.setPopupInput
        : undefined,
      registration?.getPopupInput,
    );
  return useMergedRefs(externalRef, registeredRef);
}
function useComboboxTriggerGetter(): () => HTMLElement | null {
  let registration = (0, reactComboboxCombobox_4.useContext)(
    ComboboxRegistrationContext,
  );
  return (0, reactComboboxCombobox_4.useContext)(ComboboxTriggerHiddenContext)
    ? ComboboxComboboxHandler
    : (registration?.getTrigger ?? ComboboxComboboxHandler);
}
function useComboboxInputLabel(
  externalRef: React.Ref<HTMLElement> | undefined,
  ariaLabel?: string,
  ariaLabelledby?: string,
): {
  ref: React.RefCallback<HTMLElement>;
  nameProps: AccessibleNameProps;
} {
  let isInsidePopup = (0, reactComboboxCombobox_4.useContext)(
      ComboboxInputInsidePopupContext,
    ),
    getTriggerElement = useComboboxTriggerGetter();
  return useTriggerLabelProps(
    externalRef,
    isInsidePopup ? getTriggerElement : ComboboxComboboxHandler,
    {
      ...(ariaLabel !== undefined && {
        "aria-label": ariaLabel,
      }),
      ...(ariaLabelledby !== undefined && {
        "aria-labelledby": ariaLabelledby,
      }),
    },
  );
}
function useComboboxListRef(
  externalRef?: React.Ref<HTMLElement>,
): React.RefCallback<HTMLElement> {
  let registration = (0, reactComboboxCombobox_4.useContext)(
      ComboboxRegistrationContext,
    ),
    registeredRef = useRegisteredElementRef(registration?.setList, registration?.getList);
  return useMergedRefs(externalRef, registeredRef);
}
function useRegisteredElementRef(
  setElement: ((element: HTMLElement | null) => void) | undefined,
  getElement: (() => HTMLElement | null) | undefined,
): React.RefCallback<HTMLElement> {
  let elementRef = (0, reactComboboxCombobox_4.useRef)<HTMLElement | null>(null);
  return (0, reactComboboxCombobox_4.useCallback)(
    (element: HTMLElement | null) => {
      setElement === undefined ||
        getElement === undefined ||
        (element !== null
          ? ((elementRef.current = element), setElement(element))
          : getElement() === elementRef.current && setElement(null));
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
    <npm_Combobox_Yi.Separator
      className={cn(ComboboxComboboxClassNames_10, className)}
      data-cds-part={SeparatorValue}
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
    <jsxComboboxCombobox_3.Fragment>
      <div aria-hidden={true} className={ComboboxComboboxClassNames_12} />
      <div
        className={cn(ComboboxComboboxClassNames_13, className)}
      >
        {children}
      </div>
    </jsxComboboxCombobox_3.Fragment>
  );
}
function imperativeComboboxCloseDetails(): ImperativeComboboxDetails {
  let state: ImperativeComboboxDetails = {
    reason: "close-press",
    event: new Event("base-ui"),
    trigger: undefined,
    isCanceled: false,
    isPropagationAllowed: false,
    cancel() {
      state.isCanceled = true;
    },
    allowPropagation() {
      state.isPropagationAllowed = true;
    },
  };
  return state;
}
function ComboboxRoot<Value, Multiple extends boolean = false>(
  rootProps: import("@base-ui/react/combobox").Combobox.Root.Props<
    Value,
    Multiple
  >,
): React.ReactElement {
  useUiLocale();
  let registryRef: React.RefObject<{
      inputOutsidePopup: number;
      trigger: HTMLElement | null;
      popupInput: HTMLElement | null;
      list: HTMLElement | null;
    }> = (0, reactComboboxCombobox_4.useRef)({
      inputOutsidePopup: 0,
      trigger: null,
      popupInput: null,
      list: null,
    }),
    [isTriggerHidden, setIsTriggerHidden] = (0, reactComboboxCombobox_4.useState)(false),
    registration: ComboboxRegistration = (0,
    reactComboboxCombobox_4.useMemo)<ComboboxRegistration>(
      () => ({
        addOutsideInput: () => (
          (registryRef.current.inputOutsidePopup += 1),
          setIsTriggerHidden(true),
          () => {
            registryRef.current.inputOutsidePopup -= 1;
            setIsTriggerHidden(registryRef.current.inputOutsidePopup > 0);
          }
        ),
        hasOutsideInput: () => registryRef.current.inputOutsidePopup > 0,
        setTrigger: (element) => {
          registryRef.current.trigger = element;
        },
        getTrigger: () => registryRef.current.trigger,
        setPopupInput: (element) => {
          registryRef.current.popupInput = element;
        },
        getPopupInput: () => registryRef.current.popupInput,
        setList: (element) => {
          registryRef.current.list = element;
        },
        getList: () => registryRef.current.list,
      }),
      [],
    ),
    isSheetMode = useSheetInteractionMode();
  return (
    <ComboboxRegistrationContext.Provider value={registration}>
      <ComboboxTriggerHiddenContext.Provider value={isTriggerHidden}>
        <ComboboxInputInsidePopupContext.Provider value={false}>
          {isSheetMode ? (<RegisteredComboboxRoot rootProps={rootProps} registration={registration} />) : (<npm_Combobox_Yi.Root {...rootProps} />)}
        </ComboboxInputInsidePopupContext.Provider>
      </ComboboxTriggerHiddenContext.Provider>
    </ComboboxRegistrationContext.Provider>
  );
}
function RegisteredComboboxRoot<Value, Multiple extends boolean = false>({
  rootProps: rootProps,
  registration: registration,
}: {
  rootProps: import("@base-ui/react/combobox").Combobox.Root.Props<
    Value,
    Multiple
  >;
  registration: ComboboxRegistration;
}): React.ReactElement {
  useUiLocale();
  let overlayState = useOverlayOpenState(rootProps),
    { onOpenChange: onOverlayOpenChange } = overlayState,
    closePopup = (0, reactComboboxCombobox_4.useCallback)(() => {
      onOverlayOpenChange(
        false,
        imperativeComboboxCloseDetails() as import("@base-ui/react/combobox").Combobox.Root.ChangeEventDetails,
      );
    }, [onOverlayOpenChange]),
    structurallyAnchored = useOpenSnapshot(
      overlayState.open,
      registration.hasOutsideInput,
      false,
    ),
    sheetPopup = useSheetPopup({
      open: overlayState.open,
      close: closePopup,
      onOpenChange: overlayState.onOpenChange,
      onOpenChangeComplete: rootProps.onOpenChangeComplete,
      structurallyAnchored: structurallyAnchored,
      closable: !(
        rootProps.open !== undefined && rootProps.onOpenChange === undefined
      ),
    });
  return (
    <SheetPopupProvider value={sheetPopup}>
      <npm_Combobox_Yi.Root
        {...rootProps}
        open={overlayState.open}
        modal={sheetPopup.modal ?? rootProps.modal}
        onOpenChange={sheetPopup.onOpenChange}
        onOpenChangeComplete={sheetPopup.onOpenChangeComplete}
      />
    </SheetPopupProvider>
  );
}
export {
  Combobox,
  ComboboxCaret,
  ComboboxChip,
  ComboboxChipRemove,
  ComboboxChips,
  ComboboxClear,
  ComboboxComboboxAssignValue,
  ComboboxComboboxAutoCompleteData1pIgnoreDataLpignoreConfig,
  ComboboxComboboxClassNames,
  ComboboxComboboxClassNames_10,
  ComboboxComboboxClassNames_11,
  ComboboxComboboxClassNames_12,
  ComboboxComboboxClassNames_13,
  ComboboxComboboxClassNames_2,
  ComboboxComboboxClassNames_3,
  ComboboxComboboxClassNames_4,
  ComboboxComboboxClassNames_5,
  ComboboxComboboxClassNames_6,
  ComboboxComboboxClassNames_7,
  ComboboxComboboxClassNames_8,
  ComboboxComboboxClassNames_9,
  ComboboxComboboxConstant,
  ComboboxVirtualOverscan as ComboboxComboboxConstant_2,
  ComboboxSkeletonRowCount as ComboboxComboboxConstant_3,
  ComboboxMinRowHeightPx as ComboboxComboboxConstant_4,
  ComboboxSeparatorExtraHeightPx as ComboboxComboboxConstant_5,
  ComboboxCaptionExtraHeightPx as ComboboxComboboxConstant_6,
  ComboboxPrefetchRowsAhead as ComboboxComboboxConstant_7,
  ComboboxComboboxCss,
  ComboboxComboboxCss_2,
  ComboboxComboboxCss_3,
  ComboboxComboboxCss_4,
  ComboboxComboboxFontSizeBodyFontSizeCaptionFontSizeCodeConfig,
  ComboboxComboboxGetLabel,
  ComboboxComboboxGetValue,
  ComboboxComboboxHandler,
  ComboboxComboboxLabel,
  ComboboxListRowHeightCss as ComboboxComboboxLabel_2,
  ComboboxNoResultsLabel as ComboboxComboboxLabel_3,
  ComboboxComboboxOutlineGhostConfig,
  ComboboxComboboxSelectInputConfig,
  ComboboxComboboxToLowerCase,
  ComboboxEmpty,
  ComboboxFooter,
  ComboboxFooterAction,
  ComboboxGroupLabel,
  comboboxGroupLabelClasses,
  ComboboxInput,
  comboboxInputClasses,
  ComboboxInputInsidePopupContext,
  ComboboxItem,
  ComboboxItemAlias,
  ComboboxItemIndicator,
  comboboxItemMatchesSearch,
  comboboxLabelProps,
  ComboboxList,
  comboboxMaxHeightStyle,
  comboboxOutsideInputClasses,
  ComboboxPopup,
  ComboboxPopupHost,
  ComboboxPopupSearch,
  ComboboxPopupView,
  ComboboxRegistrationContext,
  ComboboxRoot,
  comboboxSelectionLabel,
  ComboboxSeparator,
  ComboboxSheetBridge,
  ComboboxSheetCapablePopup,
  ComboboxSheetPopup,
  ComboboxStatus,
  ComboboxTrigger,
  comboboxTriggerForInputKind,
  ComboboxTriggerHiddenContext,
  ComboboxValue,
  comboboxVisibleGroups,
  copyTriggerLabelProps,
  DelayedContent,
  imperativeComboboxCloseDetails,
  initializeComboboxCombobox,
  initializeComboboxCombobox_2,
  initializeComboboxCombobox_3,
  initializeComboboxCombobox_4,
  initializeComboboxCombobox_5,
  initializeComboboxCombobox_6,
  jsxComboboxCombobox,
  jsxComboboxCombobox_2,
  jsxComboboxCombobox_3,
  reactComboboxCombobox,
  reactComboboxCombobox_2,
  reactComboboxCombobox_3,
  reactComboboxCombobox_4,
  RegisteredComboboxRoot,
  registerOutsideComboboxInput,
  SeparatorValue,
  useComboboxInputLabel,
  useComboboxListRef,
  useComboboxPopupInputRef,
  useComboboxTriggerGetter,
  useComboboxTriggerRef,
  useDelayElapsed,
  useRegisteredElementRef,
  useTriggerLabelProps,
  VirtualComboboxRows,
};
export function installCdsComboboxCombobox(): () => void {
  return () => {
    initializeComboboxCombobox = initializeOnce(() => {
      ComboboxComboboxFontSizeBodyFontSizeCaptionFontSizeCodeConfig = {
        "font-size-body": {
          compact: 0.8125,
          comfortable: 0.875,
          steps: [0.75, 0.8125, 0.875, 0.875, 0.9375],
          textSize: {
            compact: {
              sm: 0.8125,
              lg: 0.875,
            },
            comfortable: {
              sm: 0.8125,
              lg: 0.9375,
            },
          },
        },
        "font-size-caption": {
          compact: 0.6875,
          comfortable: 0.75,
          steps: [0.625, 0.6875, 0.75, 0.75, 0.8125],
        },
        "font-size-code": {
          compact: 0.75,
          comfortable: 0.8125,
        },
        "font-size-footnote": {
          compact: 0.75,
          comfortable: 0.8125,
        },
        "font-size-heading": {
          compact: 0.875,
          comfortable: 0.9375,
          textSize: {
            compact: {
              sm: 0.8125,
              lg: 0.9375,
            },
            comfortable: {
              sm: 0.875,
              lg: 1,
            },
          },
        },
        "font-size-prose": {
          compact: 0.875,
          comfortable: 1,
          steps: [0.8125, 0.875, 0.9375, 1, 1.125],
          textSize: "shift",
        },
        "font-size-title": {
          compact: 1.25,
          comfortable: 1.375,
        },
        "leading-body": {
          compact: 1.1875,
          comfortable: 1.25,
          steps: [1.0625, 1.1875, 1.25, 1.25, 1.375],
          textSize: {
            compact: {
              sm: 1.1875,
              lg: 1.25,
            },
            comfortable: {
              sm: 1.1875,
              lg: 1.375,
            },
          },
        },
        "leading-caption": {
          compact: 1.0625,
          comfortable: 1.0625,
        },
        "leading-code": {
          compact: 1.0625,
          comfortable: 1.1875,
        },
        "leading-footnote": {
          compact: 0.9375,
          comfortable: 1.0625,
        },
        "leading-heading": {
          compact: 1.125,
          comfortable: 1.25,
          textSize: {
            compact: {
              sm: 1.125,
              lg: 1.375,
            },
            comfortable: {
              sm: 1.25,
              lg: 1.5,
            },
          },
        },
        "leading-prose": {
          compact: 1.25,
          comfortable: 1.5,
          steps: [1.1875, 1.25, 1.375, 1.5, 1.6875],
          textSize: "shift",
        },
        "leading-title": {
          compact: 1.5625,
          comfortable: 1.75,
        },
      };
    });
    initializeComboboxCombobox_2 = initializeOnce(() => {});
    initializeComboboxCombobox_3 = initializeOnce(() => {
      "use client";

      initializeDomRefComposition();
      initializeSheetsKeyboardViewport();
      reactComboboxCombobox = toModuleNamespace(
        load_react(),
      );
    });
    initializeComboboxCombobox_4 = initializeOnce(() => {
      "use client";

      initializeSheetsStyles_2();
      initializeComponentsSpinner();
      reactComboboxCombobox_2 = toModuleNamespace(
        load_react(),
      );
      jsxComboboxCombobox = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_wY();
      ComboboxComboboxConstant = 500;
      ComboboxComboboxClassNames =
        "px-md py-1.5 text-body text-muted select-none";
      ComboboxComboboxCss = `flex items-center gap-2 ${ComboboxComboboxClassNames}`;
      ComboboxStatus = (0, reactComboboxCombobox_2.forwardRef)<
        HTMLDivElement,
        ComboboxStatusProps
      >(
        (
          {
            loading = false,
            delay = ComboboxComboboxConstant,
            loadingLabel: loadingLabel,
            ...props
          }: ComboboxStatusProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = useLabel(
            "loadingOptions",
            "Loading options",
          );
          return (
            <npm_Combobox_Yi.Status ref={forwardedRef} {...props}>
              {loading && (<DelayedContent ms={delay}>
                  <div className={ComboboxComboboxCss}>
                    <Spinner size={"sm"} />
                    <span>{loadingLabel ?? (value)}</span>
                  </div>
                </DelayedContent>)}
            </npm_Combobox_Yi.Status>
          );
        },
      );
      ComboboxStatus.displayName = "Combobox.Status";
    });
    initializeComboboxCombobox_5 = initializeOnce(() => {
      "use client";

      initializeHooksLayoutEffect();
      initializeComponentsSkeleton();
      reactComboboxCombobox_3 = toModuleNamespace(
        load_react(),
      );
      jsxComboboxCombobox_2 = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__tanstack_react_virtual_h7e();
      ComboboxVirtualOverscan = 5;
      ComboboxSkeletonRowCount = 4;
    });
    initializeComboboxCombobox_6 = initializeOnce(() => {
      "use client";

      initializeHooksLayoutEffect();
      initializeClassNames();
      initializeSheetsStyles_2();
      initializeCdsRoot();
      initializeOverlaysLayers();
      initializeMenuPopup_2();
      initializeDomRefComposition_3();
      initializeDomRefComposition();
      initializePlatformRootFontSize_2();
      initializePlatformRootFontSize_3();
      initializeComponentsIcon_2();
      initializeButtonButton();
      initializeButtonButton_2();
      initializeThemeSurfaces();
      initializeSheetsLayout();
      initializeSheetsPresentation();
      initializeSheetsPopupStack();
      initializePlatformReducedMotion_2();
      initializeOverlaysBackdrop();
      initializePopoverPopover();
      initializeComponentsCheckbox();
      initializeFieldContext();
      initializeComponentsBadge();
      initializeComboboxCombobox();
      initializeComboboxCombobox_2();
      initializeComboboxCombobox_3();
      initializeComboboxCombobox_4();
      initializeComboboxCombobox_5();
      reactComboboxCombobox_4 = toModuleNamespace(
        load_react(),
      );
      jsxComboboxCombobox_3 = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      initializeNpm__base_ui_react_wY();
      ComboboxComboboxClassNames_2 =
        "cds-reset group/cbx inline-flex items-center gap-1.5 h-control rounded font-sans text-body font-normal text-primary outline-none focus-visible:outline-hidden transition duration-fast data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none";
      ComboboxComboboxOutlineGhostConfig = {
        outline: `${ButtonButtonClassNames_2} ${ButtonButtonClassNames_3}`,
        ghost:
          "bg-transparent hover:bg-fill-ghost-hover has-[[aria-haspopup][aria-expanded=true]]:bg-fill-ghost-hover aria-expanded:bg-fill-ghost-hover",
      };
      ComboboxComboboxSelectInputConfig = {
        select:
          "pl-0 has-[:focus-visible]:shadow-focus data-[disabled]:cursor-default",
        input:
          "pl-sm cursor-text has-[:focus-visible]:shadow-focus data-[disabled]:cursor-default",
      };
      ComboboxComboboxCss_2 = `cds-reset group/cbx flex min-w-0 items-center gap-1.5 h-control pr-sm rounded font-sans text-body font-normal text-primary ${ButtonButtonClassNames_2} ${ButtonButtonClassNames_3} cursor-text transition duration-fast has-[:focus-visible]:shadow-focus data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none`;
      ComboboxComboboxClassNames_3 =
        "cds-reset flex min-w-0 flex-1 items-center gap-1.5 self-stretch pl-sm text-left border-0 bg-transparent p-0 outline-none focus-visible:outline-hidden";
      ComboboxComboboxClassNames_4 =
        "cds-reset min-w-0 flex-1 self-stretch bg-transparent border-0 outline-none focus-visible:outline-hidden p-0 text-body font-normal text-primary placeholder:text-muted";
      ComboboxComboboxClassNames_5 =
        "cds-reset min-w-0 flex-1 bg-transparent border-0 outline-none focus-visible:outline-hidden p-0 text-body font-normal text-primary placeholder:text-muted";
      ComboboxComboboxLabel =
        "relative max-w-full shrink-0 outline-none focus-visible:outline-hidden focus-visible:[box-shadow:inset_0_0_0_1px_var(--cds-fill-accent)]";
      ComboboxComboboxClassNames_6 =
        "flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-hidden [&>*]:relative [mask-image:linear-gradient(to_right,#000_calc(100%-24px),transparent)]";
      ComboboxComboboxCss_3 = `draggable-none flex flex-col max-h-[min(var(--available-height,100dvh),var(--cds-popup-max-h,320px))] ${popupSurfaceClassName("popover")} cds-reset text-body font-normal text-primary outline-none focus-visible:outline-hidden`;
      ComboboxComboboxClassNames_7 =
        "flex min-h-0 flex-1 flex-col overflow-hidden rounded-[inherit] p-1";
      ComboboxComboboxClassNames_8 =
        "cds-reset min-h-0 flex-1 overflow-y-auto overflow-x-hidden scroll-fade-y outline-none focus-visible:outline-hidden max-h-[var(--cds-popup-list-max-h,none)]";
      ComboboxComboboxClassNames_9 =
        "-mx-1 -mt-1 mb-1 block w-[calc(100%+8px)] shrink-0 cds-reset bg-transparent border-0 border-b border-b-[var(--cds-border)] outline-none focus-visible:outline-hidden px-[calc(var(--cds-pad-md)+4px)] py-2 text-body font-normal text-primary placeholder:text-muted";
      comboboxGroupLabelClasses =
        "cds-reset group/cbx-item flex w-full items-center gap-2 min-h-control px-md py-1 rounded text-body font-normal text-primary select-none outline-none focus-visible:outline-hidden data-[highlighted]:bg-fill-ghost-hover data-[disabled]:opacity-disabled data-[disabled]:pointer-events-none transition-opacity duration-fast data-[disabled]:transition-none data-[stale]:not-data-[disabled]:opacity-50 data-[stale]:delay-[var(--cds-combobox-stale-after,500ms)] starting:data-[stale]:not-data-[disabled]:opacity-100";
      ComboboxListRowHeightCss =
        "max(var(--cds-h-control), var(--cds-leading-body) + 0.5rem)";
      ComboboxComboboxClassNames_10 = "mx-pad-md my-1 h-px bg-border";
      SeparatorValue = "separator";
      ComboboxComboboxClassNames_11 =
        "px-md pt-2 pb-1 text-footnote font-medium text-muted select-none";
      comboboxInputClasses =
        "[&>[data-selected]+[role=option]:not([data-selected])]:relative [&>[data-selected]+[role=option]:not([data-selected])]:mt-2 [&>[data-selected]+[role=option]:not([data-selected])]:before:absolute [&>[data-selected]+[role=option]:not([data-selected])]:before:-top-1 [&>[data-selected]+[role=option]:not([data-selected])]:before:inset-x-0 [&>[data-selected]+[role=option]:not([data-selected])]:before:border-t";
      ComboboxComboboxCss_4 = `empty:hidden ${ComboboxComboboxClassNames}`;
      ComboboxComboboxClassNames_12 = "mx-pad-md mt-1 h-px shrink-0 bg-border";
      ComboboxComboboxClassNames_13 = "shrink-0 pt-1";
      ComboboxNoResultsLabel = "No results";
      ComboboxMinRowHeightPx = 32;
      ComboboxSeparatorExtraHeightPx = 9;
      ComboboxCaptionExtraHeightPx = 28;
      ComboboxPrefetchRowsAhead = 3;
      ComboboxComboboxToLowerCase = (text: string): string =>
        text
          .normalize("NFD")
          .replace(/\p{Diacritic}/gu, "")
          .toLowerCase();
      ComboboxComboboxGetLabel = (option: ComboboxOption<ComboboxKey>): string =>
        option.label;
      ComboboxComboboxGetValue = (
        option: ComboboxOption<ComboboxKey>,
      ): ComboboxKey => option.value;
      ComboboxChip = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxChipProps
      >(
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
            <npm_Combobox_Yi.Chip
              ref={value}
              {...props}
              className={cn(ComboboxComboboxLabel, className)}
              render={
                render ?? (
                  <Badge
                    variant={"neutral"}
                    truncate={true}
                    removeRender={
                      removable ? (
                        <npm_Combobox_Yi.ChipRemove />
                      ) : undefined
                    }
                  >
                    {children}
                  </Badge>
                )
              }
            >
              {children}
            </npm_Combobox_Yi.Chip>
          );
        },
      );
      ComboboxChip.displayName = "Combobox.Chip";
      comboboxOutsideInputClasses =
        "cds-reset inline-flex size-[calc(var(--cds-h-control-nested)-4px)] shrink-0 items-center justify-center rounded-[calc(var(--cds-h-control-nested)/4-2px)] border-0 bg-transparent p-0 text-muted outline-none focus-visible:outline-hidden transition-colors hover:bg-neutral-hover hover:text-primary focus-visible:bg-neutral-hover focus-visible:text-primary";
      ComboboxChipRemove = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLButtonElement,
        ComboboxPartProps<"ChipRemove">
      >(
        (
          {
            className: className,
            children: children,
            ...props
          }: ComboboxPartProps<"ChipRemove">,
          forwardedRef: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let value = useLabel("removeItem", "Remove {item}", {
            item: "item",
          });
          return (
            <npm_Combobox_Yi.ChipRemove
              ref={forwardedRef}
              aria-label={value}
              {...props}
              className={cn(
                comboboxOutsideInputClasses,
                className,
              )}
            >
              {children ?? (<Icon name={"X"} size={"sm"} />)}
            </npm_Combobox_Yi.ChipRemove>
          );
        },
      );
      ComboboxChipRemove.displayName = "Combobox.ChipRemove";
      (Combobox as React.FC<ComboboxProps<ComboboxKey>>).displayName =
        "Combobox";
      ComboboxItem = (0, reactComboboxCombobox_4.memo)(
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
        }: ComboboxRowProps<Value>): React.ReactElement => {
          let hasCheckbox = indicator === "checkbox",
            announcedGroupSuffix =
              announcedGroupLabel !== undefined ? (
                <span className={"sr-only"}>{`, ${announcedGroupLabel}`}</span>
              ) : null;
          return (
            <jsxComboboxCombobox_3.Fragment>
              {!leadsList && (item.separatorBefore || separatorAbove) && (<npm_Combobox_Yi.Separator
                  className={ComboboxComboboxClassNames_10}
                  data-cds-part={SeparatorValue}
                />)}
              {groupCaption !== undefined && (<div
                  aria-hidden={true}
                  className={ComboboxComboboxClassNames_11}
                >
                  {groupCaption}
                </div>)}
              <npm_Combobox_Yi.Item
                value={item}
                index={index}
                disabled={item.disabled}
                data-stale={stale || undefined}
                className={comboboxGroupLabelClasses}
                title={renderItem ? (undefined) : (item.label)}
              >
                {hasCheckbox && (<span
                    data-size={"xs"}
                    className={
                      "flex shrink-0 -ml-[calc(var(--cds-pad-md)-(var(--cds-h-control)-var(--cds-checkbox))/2)]"
                    }
                  >
                    <CheckboxVisual checked={selected} />
                  </span>)}
                {item.icon !== undefined && (<IconRenderer icon={item.icon} />)}
                {renderItem ? (<div className={"min-w-0 flex-1"}>
                    {renderItem(item, searchQuery)}
                    {announcedGroupSuffix}
                  </div>) : (<div className={"flex min-w-0 flex-1 flex-col gap-0.5"}>
                    <span className={"truncate"}>
                      {item.label}
                      {announcedGroupSuffix}
                    </span>
                    {item.description !== undefined && (<span
                        className={`text-footnote leading-snug text-muted ${wrapDescription ? "whitespace-normal break-words" : "truncate"}`}
                      >
                        {item.description}
                      </span>)}
                  </div>)}
                {indicator === "check" && (<npm_Combobox_Yi.ItemIndicator
                    className={"shrink-0 text-accent"}
                  >
                    <Icon name={"Check"} size={"auto"} bold={true} />
                  </npm_Combobox_Yi.ItemIndicator>)}
              </npm_Combobox_Yi.Item>
            </jsxComboboxCombobox_3.Fragment>
          );
        },
      ) as GenericComboboxRow;
      ComboboxItem.displayName = "ComboboxItem";
      ComboboxTrigger = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLButtonElement,
        ComboboxTriggerProps
      >(
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
          let fallbackLabelId = (0, reactComboboxCombobox_4.useId)(),
            isInField = isInsideField(),
            hasOwnLabel =
              props["aria-label"] !== undefined ||
              props["aria-labelledby"] !== undefined ||
              props.id !== undefined ||
              props.render !== undefined ||
              isInField,
            triggerRef = useComboboxTriggerRef(forwardedRef);
          return (
            <npm_Combobox_Yi.Trigger
              ref={triggerRef}
              {...(hasOwnLabel
                ? {}
                : {
                    "aria-labelledby": fallbackLabelId,
                  })}
              data-cds={"Combobox"}
              {...props}
              {...getSizeAttribute(size)}
              className={cn(
                ComboboxComboboxClassNames_2,
                ComboboxComboboxOutlineGhostConfig[variant],
                "px-sm focus-visible:shadow-focus",
                className,
              )}
            >
              {hasOwnLabel ? (children) : (<span id={fallbackLabelId} className={"contents"}>
                  {children}
                </span>)}
            </npm_Combobox_Yi.Trigger>
          );
        },
      );
      ComboboxTrigger.displayName = "Combobox.Trigger";
      ComboboxValue = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLSpanElement,
        ComboboxValueProps
      >(
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
            {children !== undefined ? (<npm_Combobox_Yi.Value>
                {children}
              </npm_Combobox_Yi.Value>) : (placeholder !== undefined ? (<npm_Combobox_Yi.Value>
                {(renderedValue: React.ReactNode) =>
                  renderedValue == null || renderedValue === "" ? (
                    <span className={"text-muted"}>{placeholder}</span>
                  ) : (
                    renderedValue
                  )
                }
              </npm_Combobox_Yi.Value>) : (<npm_Combobox_Yi.Value />))}
          </span>
        ),
      );
      ComboboxValue.displayName = "Combobox.Value";
      ComboboxComboboxAutoCompleteData1pIgnoreDataLpignoreConfig = {
        autoComplete: "off",
        "data-1p-ignore": true,
        "data-lpignore": "true",
      };
      ComboboxInput = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLInputElement,
        ComboboxPartProps<"Input">
      >(
        (
          {
            className: className,
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledby,
            ...props
          }: ComboboxPartProps<"Input">,
          forwardedRef: React.ForwardedRef<HTMLInputElement>,
        ): React.ReactElement => {
          registerOutsideComboboxInput();
          let { ref: inputRef, nameProps: nameProps } = useComboboxInputLabel(
            useComboboxPopupInputRef(useComboboxTriggerRef(forwardedRef)),
            ariaLabel,
            ariaLabelledby,
          );
          return (
            <npm_Combobox_Yi.Input
              ref={inputRef}
              {...ComboboxComboboxAutoCompleteData1pIgnoreDataLpignoreConfig}
              {...nameProps}
              {...props}
              className={cn(
                ComboboxComboboxClassNames_4,
                className,
              )}
            />
          );
        },
      );
      ComboboxInput.displayName = "Combobox.Input";
      ComboboxPopupSearch = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLInputElement,
        ComboboxPartProps<"Input">
      >(
        (
          {
            className: className,
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledby,
            ...props
          }: ComboboxPartProps<"Input">,
          forwardedRef: React.ForwardedRef<HTMLInputElement>,
        ): React.ReactElement => {
          let { ref: inputRef, nameProps: nameProps } = useComboboxInputLabel(
            useComboboxPopupInputRef(forwardedRef),
            ariaLabel,
            ariaLabelledby,
          );
          return (
            <npm_Combobox_Yi.Input
              ref={inputRef}
              {...ComboboxComboboxAutoCompleteData1pIgnoreDataLpignoreConfig}
              {...nameProps}
              {...props}
              className={cn(
                ComboboxComboboxClassNames_9,
                className,
              )}
            />
          );
        },
      );
      ComboboxPopupSearch.displayName = "Combobox.PopupSearch";
      ComboboxClear = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLButtonElement,
        ComboboxPartProps<"Clear">
      >(
        (
          {
            className: className,
            children: children,
            "aria-label": ariaLabel,
            ...props
          }: ComboboxPartProps<"Clear">,
          forwardedRef: React.ForwardedRef<HTMLButtonElement>,
        ): React.ReactElement => {
          let value = useLabel(
            "clearSelection",
            "Clear selection",
          );
          return (
            <npm_Combobox_Yi.Clear
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
        ComboboxCaret as React.FC<{
          className?: string;
        }>
      ).displayName = "Combobox.Caret";
      ComboboxFooterAction = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLButtonElement,
        ComboboxFooterActionProps
      >(
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
            {icon && (<IconRenderer
                icon={
                  <Icon
                    name={icon}
                    size={"auto"}
                    className={"text-muted"}
                  />
                }
              />)}
            {children}
          </button>
        ),
      );
      ComboboxFooterAction.displayName = "Combobox.FooterAction";
      ComboboxPopup = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxPopupProps
      >(
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
          return isInsideSheetPopup() ? (
            <ComboboxSheetCapablePopup {...state} ref={forwardedRef} />
          ) : (
            <ComboboxPopupView
              {...state}
              ref={forwardedRef}
              sheetPopup={SheetsPopupStackSheetConcealedChromeConfig}
              sheetParts={null}
            />
          );
        },
      );
      ComboboxPopup.displayName = "Combobox.Popup";
      ComboboxSheetCapablePopup = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxPopupProps
      >(
        (
          popupProps: ComboboxPopupProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <SheetCapablePopup kind={"combobox"}>
            {(sheetPopupState: SheetRenderState, sheetPartsState: MobileSheetParts | null) => (
              <ComboboxPopupView
                {...popupProps}
                ref={forwardedRef}
                sheetPopup={sheetPopupState}
                sheetParts={sheetPartsState}
              />
            )}
          </SheetCapablePopup>
        ),
      );
      ComboboxSheetCapablePopup.displayName = "ComboboxSheetCapablePopup";
      ComboboxPopupView = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxPopupViewProps
      >(function (
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
            collisionPadding: collisionPadding,
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
            "aria-labelledby": ariaLabelledby,
            ...restProps
          } = props,
          layer = useLayer("combobox", layerOffset),
          sheet = sheetPopup.sheet,
          SheetChrome = sheetPopup.sheet ? sheetPopup.chrome : null,
          ActiveSheetParts = sheetPopup.sheet && sheetParts !== null ? sheetParts : null,
          popupRef = (0, reactComboboxCombobox_4.useRef)<HTMLDivElement | null>(
            null,
          ),
          registration = (0, reactComboboxCombobox_4.useContext)(
            ComboboxRegistrationContext,
          ),
          isTriggerHidden = (0, reactComboboxCombobox_4.useContext)(
            ComboboxTriggerHiddenContext,
          ),
          { ref: triggerLabelRef, nameProps: triggerNameProps } = useTriggerLabelProps(
            forwardedRef,
            useComboboxTriggerGetter(),
            {
              ...(ariaLabel !== undefined && {
                "aria-label": ariaLabel,
              }),
              ...(ariaLabelledby !== undefined && {
                "aria-labelledby": ariaLabelledby,
              }),
            },
          ),
          mergedPopupRef = useMergedRefs(
            triggerLabelRef,
            popupRef,
            sheetPopup.ref,
          ),
          getTriggerElement = (0, reactComboboxCombobox_4.useCallback)(
            (inputKind: PopupInputKind): HTMLElement | undefined =>
              comboboxTriggerForInputKind(
                inputKind,
                popupRef.current,
                registration?.getPopupInput() ?? null,
                registration?.getList() ?? null,
              ),
            [registration],
          ),
          resolvedInitialFocus = sheet
            ? getTriggerElement
            : initialFocus !== undefined
              ? initialFocus
              : registration === null || isTriggerHidden
                ? false
                : getTriggerElement,
          maxHeightStyle = sheet ? undefined : comboboxMaxHeightStyle(maxVisibleItems),
          maxHeightStyleOrEmpty = maxHeightStyle ?? {},
          sheetStyle = sheetPopup.style ?? {},
          popupStyle: import("@base-ui/react/combobox").Combobox.Popup.Props["style"] =
            maxHeightStyle === undefined && sheetPopup.style === undefined
              ? style
              : typeof style == "function"
                ? (popupState) => ({
                    ...maxHeightStyleOrEmpty,
                    ...style(popupState),
                    ...sheetStyle,
                  })
                : {
                    ...maxHeightStyleOrEmpty,
                    ...style,
                    ...sheetStyle,
                  };
        return (
          <npm_Combobox_Yi.Portal
            container={useOverlayRoot()}
          >
            <PopupSurface
              {...layer.portalProps}
              style={
                sheetPopup.concealed
                  ? {
                      ...layer.portalProps.style,
                      ...OverlaysBackdropVisibilityOpacityConfig,
                    }
                  : layer.portalProps.style
              }
              surface={surfaceBackgroundTokens.popover}
              density={sheet ? ComfortableValue : undefined}
            >
              {ActiveSheetParts !== null && sheetPopup.sheet && (<ActiveSheetParts.ComboboxSheetBackdrop sheetPopup={sheetPopup} />)}
              <LayerBaseContext.Provider value={layer.base}>
                <npm_Combobox_Yi.Positioner
                  style={
                    sheetPopup.positionerStyle !== undefined
                      ? {
                          ...layer.style,
                          ...sheetPopup.positionerStyle,
                        }
                      : layer.style
                  }
                  side={side}
                  align={align}
                  sideOffset={sideOffset}
                  collisionPadding={collisionPadding}
                  collisionAvoidance={collisionAvoidance}
                  positionMethod={"fixed"}
                  {...(sheet
                    ? SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig
                    : {})}
                  className={cn(
                    positionerClassName ?? "w-[var(--anchor-width)] min-w-[12rem]",
                    sheet &&
                      (
                        sheetPopup.state as {
                          depth: number;
                        }
                      ).depth === 0 &&
                      "after:pointer-events-none after:absolute after:inset-x-0 after:top-full after:h-[100dvh] after:bg-surface-3",
                  )}
                >
                  <npm_Combobox_Yi.Popup
                    data-cds={dataCds}
                    ref={mergedPopupRef}
                    initialFocus={resolvedInitialFocus}
                    {...triggerNameProps}
                    {...sheetPopup.attrs}
                    {...restProps}
                    style={popupStyle}
                    className={cn(
                      ComboboxComboboxCss_3,
                      sheet && PlatformReducedMotionCss_2,
                      sheet &&
                        "data-[starting-style]:translate-y-[calc(100%+1.5rem)] data-[ending-style]:translate-y-[calc(100%+1.5rem)]",
                      sheet &&
                        "origin-top [&[data-cds-sheet-covered]:not([data-starting-style]):not([data-ending-style])]:-translate-y-3 data-[cds-sheet-covered]:scale-[0.94] after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-backdrop after:opacity-0 after:transition-opacity after:duration-sheet motion-reduce:after:transition-none data-[cds-sheet-covered]:after:opacity-100",
                      className,
                    )}
                  >
                    <ComboboxInputInsidePopupContext.Provider value={true}>
                      {SheetChrome !== null ? (<SheetStackContext.Provider
                          value={sheetPopup.stack}
                        >
                          <SheetChrome.Handle />
                          <SheetChrome.Body>
                            <div className={ComboboxComboboxClassNames_7}>
                              {children}
                              <SheetChrome.DismissButton
                                onDismiss={sheetPopup.frame?.dismiss}
                                label={closeLabel}
                              />
                            </div>
                          </SheetChrome.Body>
                        </SheetStackContext.Provider>) : (<div className={ComboboxComboboxClassNames_7}>
                          {children}
                        </div>)}
                    </ComboboxInputInsidePopupContext.Provider>
                  </npm_Combobox_Yi.Popup>
                </npm_Combobox_Yi.Positioner>
              </LayerBaseContext.Provider>
            </PopupSurface>
          </npm_Combobox_Yi.Portal>
        );
      });
      ComboboxPopupView.displayName = "ComboboxPopupView";
      ComboboxList = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxPartProps<"List">
      >(
        (
          {
            className: className,
            "aria-label": ariaLabel,
            "aria-labelledby": ariaLabelledby,
            ...props
          }: ComboboxPartProps<"List">,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let { ref: listRef, nameProps: nameProps } = useTriggerLabelProps(
            useComboboxListRef(forwardedRef),
            useComboboxTriggerGetter(),
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
            <npm_Combobox_Yi.List
              ref={listRef}
              {...nameProps}
              {...props}
              className={cn(
                ComboboxComboboxClassNames_8,
                className,
              )}
              {...{
                [sheetScrollAttribute]: "",
              }}
            />
          );
        },
      );
      ComboboxList.displayName = "Combobox.List";
      ComboboxEmpty = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxPartProps<"Empty">
      >(
        (
          {
            className: className,
            children: children,
            ...props
          }: ComboboxPartProps<"Empty">,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = useLabel(
            "noResults",
            ComboboxNoResultsLabel,
          );
          return (
            <npm_Combobox_Yi.Empty
              ref={forwardedRef}
              {...props}
              className={cn(ComboboxComboboxCss_4, className)}
            >
              {children === undefined ? (value) : (children)}
            </npm_Combobox_Yi.Empty>
          );
        },
      );
      ComboboxEmpty.displayName = "Combobox.Empty";
      ComboboxItemAlias = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxItemPartProps
      >(
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
        ): React.ReactElement => (
          <npm_Combobox_Yi.Item
            ref={forwardedRef}
            data-stale={stale || undefined}
            {...props}
            className={cn(comboboxGroupLabelClasses, className)}
          >
            {icon !== undefined && (<IconRenderer icon={icon} />)}
            <div className={"flex min-w-0 flex-1 flex-col gap-0.5"}>
              <span className={"truncate"}>{children}</span>
              {description !== undefined && (<span
                  className={
                    "whitespace-normal break-words text-footnote leading-snug text-muted"
                  }
                >
                  {description}
                </span>)}
            </div>
            <ComboboxItemIndicator />
          </npm_Combobox_Yi.Item>
        ),
      );
      ComboboxItemAlias.displayName = "Combobox.Item";
      ComboboxItemIndicator = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLSpanElement,
        ComboboxPartProps<"ItemIndicator">
      >(
        (
          {
            className: className,
            children: children,
            ...props
          }: ComboboxPartProps<"ItemIndicator">,
          forwardedRef: React.ForwardedRef<HTMLSpanElement>,
        ): React.ReactElement => (
          <npm_Combobox_Yi.ItemIndicator
            ref={forwardedRef}
            {...props}
            className={cn("shrink-0 text-accent", className)}
          >
            {children ?? (<Icon name={"Check"} size={"md"} bold={true} />)}
          </npm_Combobox_Yi.ItemIndicator>
        ),
      );
      ComboboxItemIndicator.displayName = "Combobox.ItemIndicator";
      ComboboxGroupLabel = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxPartProps<"GroupLabel">
      >(
        (
          { className: className, ...props }: ComboboxPartProps<"GroupLabel">,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <npm_Combobox_Yi.GroupLabel
            ref={forwardedRef}
            {...props}
            className={cn(
              ComboboxComboboxClassNames_11,
              className,
            )}
          />
        ),
      );
      ComboboxGroupLabel.displayName = "Combobox.GroupLabel";
      (
        ComboboxSeparator as React.FC<{
          className?: string;
        }>
      ).displayName = "Combobox.Separator";
      (
        ComboboxFooter as React.FC<
          React.PropsWithChildren<{
            className?: string;
          }>
        >
      ).displayName = "Combobox.Footer";
      ComboboxChips = (0, reactComboboxCombobox_4.forwardRef)<
        HTMLDivElement,
        ComboboxChipsProps
      >(
        (
          { size: size, className: className, ...props }: ComboboxChipsProps,
          forwardedRef: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => (
          <npm_Combobox_Yi.Chips
            ref={forwardedRef}
            {...props}
            {...getSizeAttribute(size)}
            className={cn(
              ComboboxComboboxCss_2,
              "h-auto min-h-control flex-wrap py-1 pl-sm [&>*]:relative",
              className,
            )}
          />
        ),
      );
      ComboboxChips.displayName = "Combobox.Chips";
      ComboboxRegistrationContext = (0,
      reactComboboxCombobox_4.createContext)<ComboboxRegistration | null>(null);
      ComboboxTriggerHiddenContext = (0, reactComboboxCombobox_4.createContext)(
        false,
      );
      ComboboxInputInsidePopupContext = (0,
      reactComboboxCombobox_4.createContext)(false);
      ComboboxComboboxHandler = () => null;
      (
        ComboboxRoot as React.ComponentType<
          import("@base-ui/react/combobox").Combobox.Root.Props<never>
        >
      ).displayName = "Combobox.Root";
      ComboboxComboboxAssignValue = Object.assign(Combobox, {
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
        Status: ComboboxStatus,
        Item: ComboboxItemAlias,
        ItemIndicator: ComboboxItemIndicator,
        Group: npm_Combobox_Yi.Group,
        GroupLabel: ComboboxGroupLabel,
        Separator: ComboboxSeparator,
        Footer: ComboboxFooter,
        Chips: ComboboxChips,
        Chip: ComboboxChip,
        ChipRemove: ComboboxChipRemove,
        Collection: npm_Combobox_Yi.Collection,
      });
    });
  };
}
