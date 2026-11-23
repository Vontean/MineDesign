import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import { getUiLocale, subscribeUiLocale } from '@minedesign/contracts/ui-locale';
import { canSendFeedback } from '@minedesign/contracts/annotations';
/**
 * MineDesign：设计稿右侧面板的「评论」标签，与 Properties / Code / Tweaks 并列；切到这个标签即进入评论模式。
 * 评论列表（草稿与已发送）由父窗口经宿主的 `feedback` 能力推送（packages/editor-host/src/design/feedback-bridge.ts），保存、编辑、解决、版本核对与发送也在父窗口。
 */
import { uiText } from "@minedesign/contracts/ui-text";
import {
  type Dynamic,
} from "../runtime-types";
import { canvasShapeReact as React } from "../canvas/shape";
import { Button } from "../cds/button/button";
import { Icon } from "../cds/components/icon";
import { CdsIsland } from "../platform/cds-island";

function useUiText(): Dynamic {
  const locale = React.useSyncExternalStore(subscribeUiLocale, getUiLocale, getUiLocale);
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
  const react: Dynamic = React;
  const state: Dynamic = react.useSyncExternalStore(
    host.subscribe,
    host.read,
    host.read,
  );
  const [message, setMessage]: Dynamic = react.useState(draft);
  // 正在编辑的一条：{ id, text }；同一时间只编辑一条
  const [editing, setEditing]: Dynamic = react.useState(null);
  const listRef: Dynamic = react.useRef(null);
  const editFieldRef: Dynamic = react.useRef(null);
  // 保存或取消后把焦点交回该条的编辑按钮
  const focusAfterEdit: Dynamic = react.useRef(null);
  const t: Dynamic = useUiText();
  const items: Dynamic[] = state.items;
  const editingId: Dynamic = editing?.id ?? null;
  const editingGone: boolean = editingId !== null && !items.some((item: Dynamic): boolean => item.id === editingId);
  react.useEffect((): void => {
    if (editingGone) setEditing(null);
  }, [editingGone]);
  react.useEffect((): void => {
    const field: Dynamic = editFieldRef.current;
    if (!field) return;
    field.focus();
    field.setSelectionRange(field.value.length, field.value.length);
  }, [editingId]);
  react.useEffect((): void => {
    const id: Dynamic = focusAfterEdit.current;
    if (id === null || editingId !== null) return;
    focusAfterEdit.current = null;
    const row: Dynamic = [...(listRef.current?.children ?? [])].find((li: Dynamic): boolean => li.dataset.id === id);
    row?.querySelector('[data-testid="mdn-feedback-edit"]')?.focus();
  });
  const finishEdit = (save: boolean): void => {
    if (!editing) return;
    if (save) {
      if (!editing.text.trim()) return;
      host.edit(editing.id, editing.text);
    }
    focusAfterEdit.current = editing.id;
    setEditing(null);
  };
  return (
    <CdsIsland density={"compact"} className={"contents"}>
      <section
        className={"mdn-feedback"}
        aria-label={t.comment}
        data-mega-chrome={"comments"}
        data-testid={"mdn-feedback"}
      >
        {items.length > 0 ? (<ol className={"mdn-feedback-list"} ref={listRef}>
            {items.map(
              (item: Dynamic): Dynamic => (
                <li key={item.id} data-id={item.id} data-status={item.status}>
                  <span className={"mdn-feedback-index"}>{item.n}</span>
                  <div className={"mdn-feedback-meta"}>
                    <button
                      type={"button"}
                      className={"mdn-feedback-target"}
                      title={t.locate(item.label)}
                      onClick={(): Dynamic => host.reveal(item.id)}
                    >
                      {item.label}
                    </button>
                    {item.status === "sent" ? (<span className={"mdn-feedback-state"} data-testid={"mdn-feedback-sent"}>
                        {uiMessage("feedback.comments.sent")}
                      </span>) : null}
                  </div>
                  {editingId === item.id ? (<div className={"mdn-feedback-edit"}>
                      <textarea
                        ref={editFieldRef}
                        rows={2}
                        maxLength={4000}
                        value={editing.text}
                        aria-label={uiMessage("feedback.comments.editField", { n: item.n })}
                        data-testid={"mdn-feedback-edit-field"}
                        onChange={(event: Dynamic): void => setEditing({ id: item.id, text: event.target.value })}
                        onKeyDown={(event: Dynamic): void => {
                          // Enter 保存，Shift+Enter 换行，Esc 取消；Esc 不再交给画布（不退出评论模式）
                          if (event.key === "Escape") {
                            event.preventDefault();
                            event.stopPropagation();
                            finishEdit(false);
                          } else if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                            event.preventDefault();
                            finishEdit(true);
                          }
                        }}
                      />
                      <div className={"mdn-feedback-edit-actions"}>
                        <Button
                          variant={"ghost"}
                          size={"sm"}
                          data-testid={"mdn-feedback-edit-cancel"}
                          onClick={(): void => finishEdit(false)}
                        >
                          {uiMessage("feedback.comments.cancel")}
                        </Button>
                        <Button
                          variant={"primary"}
                          size={"sm"}
                          disabled={!editing.text.trim()}
                          data-testid={"mdn-feedback-edit-save"}
                          onClick={(): void => finishEdit(true)}
                        >
                          {uiMessage("feedback.comments.save")}
                        </Button>
                      </div>
                    </div>) : (<p className={"mdn-feedback-text"}>{item.text}</p>)}
                  <div className={"mdn-feedback-row-actions"}>
                    {editingId === item.id ? null : (<Button
                        variant={"ghost"}
                        size={"xxs"}
                        iconOnly={true}
                        icon={<Icon name={"Edit"} size={"sm"} />}
                        aria-label={uiMessage("feedback.comments.editN", { n: item.n })}
                        title={uiMessage("feedback.comments.edit")}
                        className={"mdn-feedback-row-action"}
                        data-testid={"mdn-feedback-edit"}
                        onClick={(): void => setEditing({ id: item.id, text: item.text })}
                      />)}
                    <Button
                      variant={"ghost"}
                      size={"xxs"}
                      iconOnly={true}
                      icon={<Icon name={"Check"} size={"sm"} />}
                      aria-label={uiMessage("feedback.comments.resolveN", { n: item.n })}
                      title={uiMessage("feedback.comments.resolve")}
                      className={"mdn-feedback-row-action"}
                      data-testid={"mdn-feedback-resolve"}
                      onClick={(): Dynamic => host.resolve(item.id)}
                    />
                    <Button
                      variant={"ghost"}
                      size={"xxs"}
                      iconOnly={true}
                      icon={<Icon name={"Trash"} size={"sm"} />}
                      aria-label={t.removeCommentN(item.n)}
                      title={t.removeComment}
                      className={"mdn-feedback-row-action mdn-feedback-remove"}
                      onClick={(): Dynamic => host.remove(item.id)}
                    />
                  </div>
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
            <Button
              variant={"ghost"}
              size={"sm"}
              iconOnly={true}
              icon={<Icon name={"Copy"} size={"sm"} />}
              aria-label={t.copyFeedback}
              title={t.copyFeedback}
              onClick={(): Dynamic => host.copy(message)}
            />
            <Button
              variant={"primary"}
              size={"sm"}
              // 没有草稿也没有补充说明时不能发送
              disabled={!state.canSend || state.busy || !canSendFeedback(items, message)}
              title={state.canSend && !canSendFeedback(items, message) ? uiMessage("feedback.send.empty") : undefined}
              data-testid={"mdn-feedback-send"}
              onClick={(): Dynamic => host.send(message)}
            >
              {t.send}
            </Button>
          </div>
        </div>
        <p className={"mdn-feedback-status"} role={"status"}>
          {state.status}
        </p>
      </section>
    </CdsIsland>
  );
}
export {
  FeedbackPanel,
  commentMode as mdnCommentMode,
  toggleCommentMode as mdnToggleCommentMode,
  useUiText,
};
export function installCommentsFeedbackPanel(): () => void {
  return () => {};
}
