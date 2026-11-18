import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactAssetInteractions: typeof import("react");
var reactAssetSelection: typeof import("react");
var EMPTY_ASSET_SELECTION: Model.AssetSelection;
function hasSelectionModifier(
  event: Pick<Editor.SelectionKeys, "metaKey" | "ctrlKey" | "altKey">,
): boolean {
  return event.metaKey || event.ctrlKey || event.altKey;
}
function assetSelectionRange(
  order: string[],
  from: string,
  to2: string,
): string[] {
  let fromIndex = order.indexOf(from),
    toIndex = order.indexOf(to2);
  if (fromIndex < 0 || toIndex < 0) {
    return [to2];
  }
  let value = order.slice(
    Math.min(fromIndex, toIndex),
    Math.max(fromIndex, toIndex) + 1,
  );
  if (fromIndex <= toIndex) {
    return value;
  } else {
    return value.reverse();
  }
}
function selectAssetByClick(
  selection: Model.AssetSelection,
  order: string[],
  id: string,
  event: Editor.SelectionKeys,
): Model.AssetSelection {
  if (
    event.shiftKey &&
    selection.anchor !== null &&
    order.includes(selection.anchor)
  ) {
    return {
      selected: assetSelectionRange(order, selection.anchor, id),
      anchor: selection.anchor,
      focus: id,
    };
  }
  if (hasSelectionModifier(event)) {
    if (selection.selected.includes(id)) {
      return {
        ...selection,
        selected: selection.selected.filter((input): boolean => input !== id),
      };
    } else {
      return {
        selected: [...selection.selected, id],
        anchor: id,
        focus: id,
      };
    }
  }
  return {
    selected: [id],
    anchor: id,
    focus: id,
  };
}
function selectAssetRange(
  selection: Model.AssetSelection,
  order: string[],
  id: string,
): Model.AssetSelection {
  let anchor =
    selection.anchor !== null && order.includes(selection.anchor)
      ? selection.anchor
      : id;
  return {
    selected: assetSelectionRange(order, anchor, id),
    anchor: anchor,
    focus: id,
  };
}
function pruneAssetSelection(
  selection: Model.AssetSelection,
  order: string[],
): Model.AssetSelection {
  let available = new Set(order),
    selected = selection.selected.filter((input) => available.has(input)),
    anchor =
      selection.anchor !== null && available.has(selection.anchor)
        ? selection.anchor
        : (selected.at(-1) ?? null),
    value =
      selection.focus !== null && available.has(selection.focus)
        ? selection.focus
        : anchor;
  if (
    selected.length === selection.selected.length &&
    anchor === selection.anchor &&
    value === selection.focus
  ) {
    return selection;
  } else {
    return {
      selected: selected,
      anchor: anchor,
      focus: value,
    };
  }
}
function useAssetSelection(order: string[]): Editor.AssetSelectionController {
  let [selection, setSelection] = reactAssetSelection.useState(
      EMPTY_ASSET_SELECTION,
    ),
    orderRef = reactAssetSelection.useRef(order);
  orderRef.current = order;
  reactAssetSelection.useEffect((): void => {
    setSelection((input) => pruneAssetSelection(input, order));
  }, [order]);
  let memo = reactAssetSelection.useMemo(
      () => new Set(selection.selected),
      [selection.selected],
    ),
    callback = reactAssetSelection.useCallback(
      (input: string) => memo.has(input),
      [memo],
    ),
    callback2 = reactAssetSelection.useCallback(
      (input: string, options: Editor.SelectionKeys) =>
        setSelection((input2) =>
          selectAssetByClick(input2, orderRef.current, input, options),
        ),
      [],
    ),
    callback3 = reactAssetSelection.useCallback(
      (input: string) =>
        setSelection({
          selected: [input],
          anchor: input,
          focus: input,
        }),
      [],
    ),
    callback4 = reactAssetSelection.useCallback(
      (input: string) =>
        setSelection((input2) =>
          selectAssetRange(input2, orderRef.current, input),
        ),
      [],
    ),
    callback5 = reactAssetSelection.useCallback(
      () =>
        setSelection((input) => ({
          selected: [...orderRef.current],
          anchor: input.anchor ?? orderRef.current[0] ?? null,
          focus: input.focus,
        })),
      [],
    ),
    callback6 = reactAssetSelection.useCallback(
      () =>
        setSelection((input) =>
          input.selected.length === 0
            ? input
            : {
                selected: [],
                anchor: input.anchor,
                focus: input.focus,
              },
        ),
      [],
    ),
    callback7 = reactAssetSelection.useCallback(
      (input: string[]) =>
        setSelection((input2) => ({
          selected: [...input],
          anchor: input.at(-1) ?? input2.anchor,
          focus: input.at(-1) ?? input2.focus,
        })),
      [],
    );
  return {
    ...selection,
    has: callback,
    click: callback2,
    only: callback3,
    extend: callback4,
    all: callback5,
    clear: callback6,
    set: callback7,
  };
}
export {
  assetSelectionRange,
  EMPTY_ASSET_SELECTION,
  hasSelectionModifier,
  pruneAssetSelection,
  reactAssetInteractions,
  reactAssetSelection,
  selectAssetByClick,
  selectAssetRange,
  useAssetSelection,
};
export function installEditorAssetSelection(): () => void {
  return () => {
    reactAssetInteractions = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactAssetSelection = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    EMPTY_ASSET_SELECTION = {
      selected: [],
      anchor: null,
      focus: null,
    };
  };
}
