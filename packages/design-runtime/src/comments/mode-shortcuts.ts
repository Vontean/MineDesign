import type { Dynamic } from "../runtime-types";
import { blockingOverlaySelector } from "../editor/chrome/overlay-state";
import { isEditingInputTarget } from "../editor/keyboard/find";
import { shouldKeepLocalKeyboardEvent } from "../editor/keyboard/paste";
import { hasBlockingEditorOverlay } from "../editor/text/typing-target";
import { react_mi } from "./area-drawing";

/**
 * 评论模式的进出入口：点击评论图层之外退出、选中绘制工具时退出、快捷键 C 切换。
 * 本模块拥有三组全局监听及其清理；模式本身由宿主 controller 管理，这里只发出请求。
 */

export interface CommentModeShortcutsOptions {
  isCommentMode: boolean;
  armedTool: Dynamic;
  /** controller 已就绪后才监听快捷键。 */
  hasController: boolean;
  controllerRef: { readonly current: Dynamic };
  /** 始终指向最新渲染的 isCommentMode。 */
  isCommentModeRef: { readonly current: boolean };
  /** 始终指向最新渲染的宿主选项，读取 keyHeld。 */
  optionsRef: { readonly current: Dynamic };
}

/** 评论模式里点击这些区域不退出：评论自身界面、视图控件与浮层遮罩。 */
const keepCommentModeSelector = '[data-mega-chrome="comments"],[data-view-control],[data-mc-scrim]';

export function useCommentModeShortcuts(options: CommentModeShortcutsOptions): void {
  const { isCommentMode, armedTool, hasController, controllerRef, isCommentModeRef, optionsRef } = options;
  const exitCommentMode = (): void => {
    const current: Dynamic = controllerRef.current;
    typeof current?.exitMode == "function" && current.exitMode();
  };
  (0, react_mi.useEffect)((): Dynamic => {
    if (!isCommentMode) return;
    const handlePointerDown = (event?: Dynamic): Dynamic => {
      if (event.button !== 0) return;
      const target: Dynamic = event.target instanceof Element ? event.target : null;
      target?.closest(keepCommentModeSelector) ||
        (target?.closest(blockingOverlaySelector) &&
          (document as Dynamic).querySelector('[data-view-control] [aria-expanded="true"]')) ||
        exitCommentMode();
    };
    (document as Dynamic).addEventListener("pointerdown", handlePointerDown, true);
    return (): Dynamic => (document as Dynamic).removeEventListener("pointerdown", handlePointerDown, true);
  }, [isCommentMode]);
  (0, react_mi.useEffect)((): Dynamic => {
    isCommentMode && armedTool != null && armedTool !== "select" && exitCommentMode();
  }, [armedTool]);
  (0, react_mi.useEffect)((): Dynamic => {
    if (!hasController) return;
    // 返回 true 表示已处理（切换了模式）
    const toggleCommentMode = (): boolean => {
      const current: Dynamic = controllerRef.current;
      return typeof current?.enterMode != "function" || optionsRef.current.keyHeld || hasBlockingEditorOverlay()
        ? false
        : (isCommentModeRef.current ? current.exitMode?.() : current.enterMode(), true);
    };
    const handleCommentKeyDown = (event?: Dynamic): Dynamic => {
      (event.key !== "c" && event.key !== "C") ||
        event.shiftKey ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey ||
        event.defaultPrevented ||
        event.repeat ||
        event.isComposing ||
        isEditingInputTarget(event.target) ||
        shouldKeepLocalKeyboardEvent(event) ||
        (event.target instanceof Element && event.target.closest("[data-mega-selection-strip]") !== null) ||
        (toggleCommentMode() && event.preventDefault());
    };
    const handleCommentKeyEvent = (): Dynamic => {
      toggleCommentMode();
    };
    (window as Dynamic).addEventListener("keydown", handleCommentKeyDown);
    (window as Dynamic).addEventListener("canvas-comment-key", handleCommentKeyEvent);
    return (): Dynamic => {
      (window as Dynamic).removeEventListener("keydown", handleCommentKeyDown);
      (window as Dynamic).removeEventListener("canvas-comment-key", handleCommentKeyEvent);
    };
  }, [hasController]);
}
