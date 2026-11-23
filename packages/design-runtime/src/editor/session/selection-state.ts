import { canvasShapeReact as React } from "../../canvas/shape";
import { modifierOnlyKeys, sameTidList } from "../inspector/editor";
import { latestSelectionSequence } from "../model/selection-relocation";
import type { Dynamic } from "../../runtime-types";
import { keyConsumesSelectionSync } from "./selection-retarget";

/** 与 React.RefObject 结构一致；不引入 react 类型以免依赖声明缺失。 */
export interface Ref<T> {
  current: T;
}

/** 会话选区：模板名加元素 tid 列表。 */
export interface SessionSelection {
  readonly name: string;
  readonly tids: number[];
}

/** 画板预览 iframe；编辑器通过 picker/bridge 的消息协议与它通信。 */
export type PreviewFrame = HTMLIFrameElement;

/** 待定加载的选区：序号用于判断是否仍是最新，done 在加载结束时兑现。 */
export interface PendingSelection {
  readonly seq: number;
  readonly done: Promise<unknown>;
}

/** 写入动作只按引用比较待定选区，不读取 done。 */
type PendingSelectionHandle = Pick<PendingSelection, "seq">;

/** createSelectionWriters 操作的 ref；选区与待定选区在此只被写入，因此按 unknown 接收。 */
export interface SelectionWriterRefs {
  readonly selectionRef: Ref<unknown>;
  readonly selectionSequenceRef: Ref<number>;
  readonly pendingSelectionRef: Ref<unknown>;
  readonly clearedSelectionSequenceRef: Ref<number>;
  readonly shouldSyncPickerSelectionRef: Ref<boolean>;
}

export interface SelectionWriters {
  advanceSelectionSequence(): number;
  clearSelectionRef(): void;
  invalidateSelection(): void;
  markSelectionCleared(): void;
  storeSelection(selection: SessionSelection | null): void;
  requestPickerSelectionSync(): void;
  setPendingSelection(pendingSelection: PendingSelectionHandle | null): void;
  clearPendingSelection(pendingSelection: PendingSelectionHandle): void;
}

export interface SessionSelectionState extends SelectionWriters {
  readonly selectionRef: Ref<SessionSelection | null>;
  readonly selectionSequenceRef: Ref<number>;
  readonly pendingSelectionRef: Ref<PendingSelection | null>;
  readonly clearedSelectionSequenceRef: Ref<number>;
  readonly shouldSyncPickerSelectionRef: Ref<boolean>;
  getLatestSelection(): SessionSelection | null | undefined;
  isCurrentSelection(templateName: string, selectedTids: number[]): boolean;
  consumePickerSelectionSync(): boolean;
}

/**
 * 选区 ref 的具名写入动作。每个动作对应调用方原有的一组语句，语句与顺序不变；
 * 组合不同的写入各自成为独立动作，调用方按原先后顺序依次调用。
 * 动作只闭包稳定的 ref 对象，可在渲染间安全复用。
 */
function createSelectionWriters(refs: SelectionWriterRefs): SelectionWriters {
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
    storeSelection: (selection?: SessionSelection | null): Dynamic => {
      selectionRef.current = selection;
    },
    /** 要求下一次 picker 选区同步（由 pointerdown/keydown 消耗）。 */
    requestPickerSelectionSync: (): Dynamic => {
      shouldSyncPickerSelectionRef.current = true;
    },
    /** 登记待定加载的选区。 */
    setPendingSelection: (pendingSelection?: PendingSelectionHandle | null): Dynamic => {
      pendingSelectionRef.current = pendingSelection;
    },
    /** 仅当仍是同一待定选区时清除。 */
    clearPendingSelection: (pendingSelection?: PendingSelectionHandle): Dynamic => {
      pendingSelectionRef.current === pendingSelection && (pendingSelectionRef.current = null);
    },
  };
}

/** 把当前选区序号记为“待高亮”：高亮 ref 属于画布高亮，由入口持有。 */
function notePendingHighlightAtSequence(pendingHighlightSequenceRef: Ref<number>, selectionSequenceRef: Ref<number>): void {
  pendingHighlightSequenceRef.current = selectionSequenceRef.current;
}

/**
 * 会话选区的 ref 所有者：序号、待定加载、已清除序号、picker 同步标记，
 * 以及 document 上的 pointerdown/keydown 捕获监听（消耗 picker 同步标记）。
 * `selection` 与 `setSelection` 的 useState 留在入口（更早的 Hook 依赖它）。
 * 写入点仍由各会话模块通过返回的 ref 完成；调用位置必须保持在原处以保证 Hook 与监听顺序。
 */
function useSessionSelection(selection: SessionSelection | null): SessionSelectionState {
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
