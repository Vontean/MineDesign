import { PickerBridgeInspectTimeoutMs as pickerInspectTimeoutMs } from "../../editor/picker/bridge";
import { TokenBucket } from "../../platform/rate-limiter";
import type { Dynamic } from "../../runtime-types";

/**
 * 画布入口与 design-canvas/ 子模块、canvas/load-state、editor/session 共用的常量、纯函数与占位值。
 *
 * 这些是 `export let`：由入口的 installCanvasDesignCanvas 在启动时调用 installCanvasShared() 赋值
 * （赋值依赖其他安装步骤先就绪，所以不在导入时求值），使用方在调用时读取（ESM live binding）。
 */
export let noopCanvasSubscription: Dynamic;
export let zeroCanvasRevision: Dynamic;
export let artboardRevealSettleTimeoutMs: Dynamic;
/** emptyCanvasSelectionFiles 与 emptyCanvasFileSet 是同一个共享的空集合实例。 */
export let emptyCanvasFileSet: Dynamic;
export let emptyCanvasSelectionFiles: Dynamic;
export let singleCanvasCaptureSemaphore: Dynamic;
export let parallelCanvasCaptureSemaphore: Dynamic;
export let hasActiveUserGesture: Dynamic;

export function installCanvasShared(): void {
  noopCanvasSubscription = (): Dynamic => (): Dynamic => {};
  zeroCanvasRevision = (): Dynamic => 0;
  artboardRevealSettleTimeoutMs = 2 * pickerInspectTimeoutMs + 2e3;
  emptyCanvasFileSet = new Set();
  emptyCanvasSelectionFiles = emptyCanvasFileSet;
  singleCanvasCaptureSemaphore = new TokenBucket(1, 1);
  parallelCanvasCaptureSemaphore = new TokenBucket(6, 6);
  hasActiveUserGesture = (): Dynamic =>
    navigator.userActivation?.isActive === true;
}

export async function readCanvasClipboardText(): Promise<Dynamic> {
  try {
    return (await navigator.clipboard?.readText()) ?? "";
  } catch {
    return "";
  }
}

export function canvasSelectionsEqual(first?: Dynamic, second?: Dynamic): Dynamic {
  return first === second
    ? true
    : first.artboards.size !== second.artboards.size ||
        first.notes.size !== second.notes.size ||
        first.elements.size !== second.elements.size
      ? false
      : [...first.artboards].every(
          (artboardId?: Dynamic): Dynamic => second.artboards.has(artboardId),
        ) &&
        [...first.notes].every(
          (noteId?: Dynamic): Dynamic => second.notes.has(noteId),
        ) &&
        [...first.elements].every(
          ([elementId, element]: Dynamic): Dynamic =>
            second.elements.get(elementId)?.tids.join() === element.tids.join(),
        );
}
