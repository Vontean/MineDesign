import { canvasShapeReact as React } from "../../canvas/shape";
import { modifierOnlyKeys, sameTidList } from "../inspector/editor";
import { latestSelectionSequence } from "../model/selection-relocation";
import type { Dynamic } from "../../runtime-types";
import { keyConsumesSelectionSync } from "./selection-retarget";

/**
 * 选区 ref 的具名写入动作。每个动作对应调用方原有的一组语句，语句与顺序不变；
 * 组合不同的写入各自成为独立动作，调用方按原先后顺序依次调用。
 * 动作只闭包稳定的 ref 对象，可在渲染间安全复用。
 */
function createSelectionWriters(refs: Dynamic): Dynamic {
  let { selectionRef, selectionSequenceRef, pendingSelectionRef, clearedSelectionSequenceRef, shouldSyncPickerSelectionRef } = refs;
  return {
    /** 序号推进：使进行中的异步选区加载失效；返回推进后的序号。 */
    advanceSelectionSequence: (): Dynamic => ++selectionSequenceRef.current,
    /** 仅清空选区 ref（序号已由调用方推进）。 */
    clearSelectionRef: (): Dynamic => {
      selectionRef.current = null;
    },
    /** 推进序号后清空选区 ref；与 setSelection(null) 的先后由调用方保持。 */
    invalidateSelection: (): Dynamic => {
      selectionSequenceRef.current++;
      selectionRef.current = null;
    },
    /** 记录“当前序号的选区已被清除”。 */
    markSelectionCleared: (): Dynamic => {
      clearedSelectionSequenceRef.current = selectionSequenceRef.current;
    },
    /** 写入已校验的选区 ref。 */
    storeSelection: (selection?: Dynamic): Dynamic => {
      selectionRef.current = selection;
    },
    /** 要求下一次 picker 选区同步（由 pointerdown/keydown 消耗）。 */
    requestPickerSelectionSync: (): Dynamic => {
      shouldSyncPickerSelectionRef.current = true;
    },
    /** 登记待定加载的选区。 */
    setPendingSelection: (pendingSelection?: Dynamic): Dynamic => {
      pendingSelectionRef.current = pendingSelection;
    },
    /** 仅当仍是同一待定选区时清除。 */
    clearPendingSelection: (pendingSelection?: Dynamic): Dynamic => {
      pendingSelectionRef.current === pendingSelection && (pendingSelectionRef.current = null);
    },
  };
}

/** 把当前选区序号记为“待高亮”：高亮 ref 属于画布高亮，由入口持有。 */
function notePendingHighlightAtSequence(pendingHighlightSequenceRef: Dynamic, selectionSequenceRef: Dynamic): Dynamic {
  pendingHighlightSequenceRef.current = selectionSequenceRef.current;
}

/**
 * 会话选区的 ref 所有者：序号、待定加载、已清除序号、picker 同步标记，
 * 以及 document 上的 pointerdown/keydown 捕获监听（消耗 picker 同步标记）。
 * `selection` 与 `setSelection` 的 useState 留在入口（更早的 Hook 依赖它）。
 * 写入点仍由各会话模块通过返回的 ref 完成；调用位置必须保持在原处以保证 Hook 与监听顺序。
 */
function useSessionSelection(selection: Dynamic): Dynamic {
  let selectionRef: Dynamic = (0, React.useRef)(selection);
  selectionRef.current = selection;
  let selectionSequenceRef: Dynamic = (0, React.useRef)(0),
    pendingSelectionRef: Dynamic = (0, React.useRef)(null),
    getLatestSelection: Dynamic = (0, React.useCallback)(
      (): Dynamic =>
        latestSelectionSequence(
          selectionRef.current,
          pendingSelectionRef.current,
          selectionSequenceRef.current,
        ),
      [],
    ),
    isCurrentSelection: Dynamic = (0, React.useCallback)(
      (templateName?: Dynamic, selectedTids?: Dynamic): Dynamic => {
        let latestSelection: Dynamic = getLatestSelection();
        return (
          latestSelection?.name === templateName &&
          sameTidList(latestSelection.tids, selectedTids)
        );
      },
      [getLatestSelection],
    ),
    shouldSyncPickerSelectionRef: Dynamic = (0, React.useRef)(false),
    consumePickerSelectionSync: Dynamic = (0, React.useCallback)((): Dynamic => {
      let shouldSync: Dynamic = shouldSyncPickerSelectionRef.current;
      shouldSyncPickerSelectionRef.current = false;
      return shouldSync;
    }, []);
  (0, React.useEffect)((): Dynamic => {
    let clearSelectionSyncOnKeyDown: Dynamic = (keyEvent?: Dynamic): Dynamic => {
      keyConsumesSelectionSync(keyEvent, modifierOnlyKeys) && consumePickerSelectionSync();
    };
    (document as Dynamic).addEventListener("pointerdown", consumePickerSelectionSync, true);
    (document as Dynamic).addEventListener("keydown", clearSelectionSyncOnKeyDown, true);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("pointerdown", consumePickerSelectionSync, true);
      (document as Dynamic).removeEventListener("keydown", clearSelectionSyncOnKeyDown, true);
    };
  }, [consumePickerSelectionSync]);
  let clearedSelectionSequenceRef: Dynamic = (0, React.useRef)(-1);
  let writersRef: Dynamic = (0, React.useRef)(null);
  writersRef.current ??= createSelectionWriters({
    selectionRef,
    selectionSequenceRef,
    pendingSelectionRef,
    clearedSelectionSequenceRef,
    shouldSyncPickerSelectionRef,
  });
  return {
    ...writersRef.current,
    selectionRef,
    selectionSequenceRef,
    pendingSelectionRef,
    clearedSelectionSequenceRef,
    shouldSyncPickerSelectionRef,
    getLatestSelection,
    isCurrentSelection,
    consumePickerSelectionSync,
  };
}

export { createSelectionWriters, notePendingHighlightAtSequence, useSessionSelection };
