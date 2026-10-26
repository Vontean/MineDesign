import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import { getUiLocale, subscribeUiLocale } from '@minedesign/contracts/ui-locale';
/**
 * MineDesign：设计稿右侧面板的「评论」标签，与 Properties / Code / Tweaks 并列；切到这个标签即进入评论模式。
 * 草稿由父窗口经宿主的 `feedback` 能力推送（packages/editor-host/src/design/feedback-bridge.ts），保存、版本核对与发送也在父窗口。
 */
import { uiText } from "@minedesign/contracts/ui-text";
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../runtime-types";

export function installCommentsFeedbackPanel(
  runtime: RuntimeBindings,
): () => void {
  function useUiText(): Dynamic {
    const locale = runtime.reactCanvasShape_2.useSyncExternalStore(subscribeUiLocale, getUiLocale, getUiLocale);
    return uiText(locale);
  }
  // 补充说明跨评论模式开关保留：离开「评论」标签时视图会卸载
  let draft = "";
  // 评论模式由画布持有（canvas/design-canvas.tsx），属性面板的标签栏在编辑会话里（editor/session.tsx），经这里共享
  let commenting = false;
  const commentListeners = new Set<() => void>();
  const commentMode = {
    // 从「评论」切到别的标签时为 true：退出评论模式后面板保持打开，停在所选标签
    keepPanelOnExit: false,
    get: (): boolean => commenting,
    set(on: boolean): void {
      if (commenting === on) return;
      commenting = on;
      for (const listener of commentListeners) listener();
    },
    subscribe(listener: () => void): () => void {
      commentListeners.add(listener);
      return () => void commentListeners.delete(listener);
    },
  };
  // 进出评论模式与快捷键 C 走同一个入口（comments/canvas-controller.tsx）
  const toggleCommentMode = (): void =>
    void window.dispatchEvent(new Event("canvas-comment-key"));
  function FeedbackPanel({ host }: Dynamic): Dynamic {
    useUiLocale();
    const react: Dynamic = runtime.reactCanvasShape_2;
    const state: Dynamic = react.useSyncExternalStore(
      host.subscribe,
      host.read,
      host.read,
    );
    const [message, setMessage]: Dynamic = react.useState(draft);
    const t: Dynamic = useUiText();
    const items: Dynamic[] = state.items;
    return (
      <runtime.CdsIsland density={"compact"} className={"contents"}>
        <section
          className={"mdn-feedback"}
          aria-label={t.comment}
          data-mega-chrome={"comments"}
          data-testid={"mdn-feedback"}
        >
          {items.length > 0 ? (<ol className={"mdn-feedback-list"}>
              {items.map(
                (item: Dynamic): Dynamic => (
                  <li key={item.id}>
                    <span className={"mdn-feedback-index"}>{item.n}</span>
                    <button
                      type={"button"}
                      className={"mdn-feedback-target"}
                      title={t.locate(item.label)}
                      onClick={(): Dynamic => host.reveal(item.id)}
                    >
                      {item.label}
                    </button>
                    <p className={"mdn-feedback-text"}>{item.text}</p>
                    <runtime.Button
                      variant={"ghost"}
                      size={"xxs"}
                      iconOnly={true}
                      icon={<runtime.Icon name={"Trash"} size={"sm"} />}
                      aria-label={t.removeCommentN(item.n)}
                      title={t.removeComment}
                      className={"mdn-feedback-remove"}
                      onClick={(): Dynamic => host.remove(item.id)}
                    />
                  </li>
                ),
              )}
            </ol>) : (<div className={"mdn-feedback-empty"}>
              <p className={"mdn-feedback-empty-title"}>{t.noComments}</p>
              <p>{t.noCommentsEditorHint}</p>
            </div>)}
          <div className={"mdn-feedback-composer"}>
            <textarea
              rows={3}
              value={message}
              aria-label={t.messageLabel}
              placeholder={t.messagePlaceholder}
              onChange={(event: Dynamic): Dynamic => {
                draft = event.target.value;
                setMessage(draft);
              }}
            />
            <div className={"mdn-feedback-actions"}>
              <runtime.Button
                variant={"ghost"}
                size={"sm"}
                iconOnly={true}
                icon={<runtime.Icon name={"Copy"} size={"sm"} />}
                aria-label={t.copyFeedback}
                title={t.copyFeedback}
                onClick={(): Dynamic => host.copy(message)}
              />
              <runtime.Button
                variant={"primary"}
                size={"sm"}
                disabled={!state.canSend || state.busy}
                data-testid={"mdn-feedback-send"}
                onClick={(): Dynamic => host.send(message)}
              >
                {t.send}
              </runtime.Button>
            </div>
          </div>
          <p className={"mdn-feedback-status"} role={"status"}>
            {state.status}
          </p>
        </section>
      </runtime.CdsIsland>
    );
  }
  bindRuntimeValue(runtime, "FeedbackPanel", () => FeedbackPanel);
  bindRuntimeValue(runtime, "useUiText", () => useUiText);
  bindRuntimeValue(runtime, "mdnCommentMode", () => commentMode);
  bindRuntimeValue(runtime, "mdnToggleCommentMode", () => toggleCommentMode);
  return () => {};
}
