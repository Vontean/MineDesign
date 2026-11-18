/**
 * 设计稿画布上的评论卡片：每条可见评论（草稿与已发送）一张卡片，用虚线连到评论的编号圆点。
 *
 * - 位置由 card-layout.ts 计算，这里只负责渲染与就地编辑；
 * - 评论文字与状态来自宿主的 feedback 能力（editor-host/src/design/feedback-bridge.ts），
 *   编辑、标为已解决、删除走同一能力的 edit / resolve / remove，不另存状态；
 * - 卡片固定屏幕尺寸，画布缩放只影响位置；缩放低于 COMMENT_CARD_MIN_SCALE 时只留编号圆点。
 */
import { useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent } from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { FeedbackItem } from '@minedesign/contracts/editor-messages';
import { useUiLocale } from '../ui-locale.ts';
import { Button } from '../cds/button/button';
import { Icon } from '../cds/components/icon';
import { CdsIsland } from '../platform/cds-island';
import { getCachedHostCapability } from '../platform/host-capabilities';
import { type CardBounds, type CardPlacement, type CardSize, type CardTarget, layoutCommentCards } from './card-layout';

/** 卡片用到的 feedback 能力（宿主实现见 editor-host/src/design/feedback-bridge.ts；runtime 不依赖宿主包，只声明所需部分）。 */
interface HostFeedbackState {
  items: FeedbackItem[];
  status: string;
  canSend: boolean;
  busy: boolean;
}
interface HostFeedbackCapability {
  read(): HostFeedbackState;
  subscribe(listener: () => void): () => void;
  edit(id: string, text: string): void;
  resolve(id: string): void;
  remove(id: string): void;
}

/** 低于这个画布缩放比例时卡片会挤成一团，只显示编号圆点。 */
export const COMMENT_CARD_MIN_SCALE = 0.3;
export const COMMENT_CARD_WIDTH = 200;
const COMMENT_CARD_ESTIMATED_HEIGHT = 56;
const VISIBLE_STORAGE_KEY = 'mdn-comment-cards-visible';
const EMPTY_STATE: HostFeedbackState = { items: [], status: '', canSend: false, busy: false };
const noSubscription = () => () => {};

/** 显示或隐藏全部卡片的开关，记在本机（与布局参考线同样用 localStorage）。同一键名的各处 hook 会同步。 */
export function useCommentCardsVisible(): [boolean, (next: boolean | ((current: boolean) => boolean)) => void] {
  const [visible, setVisible] = useLocalStorage<boolean>(VISIBLE_STORAGE_KEY, true);
  return [visible, setVisible];
}

function feedbackCapability(): HostFeedbackCapability | null {
  return (getCachedHostCapability('feedback') as HostFeedbackCapability | undefined) ?? null;
}

function useFeedbackItems(feedback: HostFeedbackCapability | null): FeedbackItem[] {
  const state = useSyncExternalStore(
    feedback?.subscribe ?? noSubscription,
    feedback?.read ?? (() => EMPTY_STATE),
    feedback?.read ?? (() => EMPTY_STATE),
  );
  return state.items;
}

export interface CommentCardsViewToggle {
  readonly label: string;
  checked: boolean;
  onToggle: () => void;
}

/** 缩放菜单里的「评论卡片」开关；画布上没有评论时不出现（开关没有可作用的对象）。 */
export function useCommentCardsViewToggle(): CommentCardsViewToggle[] {
  const feedback = feedbackCapability();
  const hasComments = useFeedbackItems(feedback).length > 0;
  const [visible, setVisible] = useCommentCardsVisible();
  return useMemo(
    () =>
      hasComments
        ? [
            {
              get label() {
                return uiMessage('canvas.designCanvas.commentCards');
              },
              checked: visible,
              onToggle: () => setVisible(current => !current),
            },
          ]
        : [],
    [hasComments, visible, setVisible],
  );
}

/** 指针事件是否落在评论卡片上（画布的评论图层据此不把它当作点选目标）。 */
export function isCommentCardEvent(event: { target: EventTarget | null }): boolean {
  return event.target instanceof Element && event.target.closest('[data-mdn-comment-card]') !== null;
}

export interface CommentCardLayerProps {
  /** 各评论目标点在评论图层里的屏幕坐标；不在可视区域内的不要传。 */
  targets: readonly CardTarget[];
  /** 卡片可以占用的区域（避开顶部与底部工具栏）。 */
  bounds: CardBounds;
  /** 当前画布缩放比例。 */
  scale: number;
  /** 播放原型或全屏查看时为 true，不显示卡片。 */
  suppressed: boolean;
}

export function CommentCardLayer({ targets, bounds, scale, suppressed }: CommentCardLayerProps) {
  useUiLocale();
  const feedback = feedbackCapability();
  const items = useFeedbackItems(feedback);
  const [visible] = useCommentCardsVisible();
  const [sizes, setSizes] = useState<Record<string, CardSize>>({});
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  // 悬停或聚焦而展开全文的卡片：展开时不重新排布，避免其他卡片跟着跳动
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const cardRefs = useRef(new Map<string, HTMLElement>());

  const shown = feedback != null && visible && !suppressed && scale >= COMMENT_CARD_MIN_SCALE;
  const itemsById = useMemo(() => new Map(items.map(item => [item.id, item])), [items]);
  const cardTargets = useMemo(() => targets.filter(target => itemsById.has(target.id)), [targets, itemsById]);
  const placements = useMemo(
    () =>
      layoutCommentCards(cardTargets, sizes, bounds, {
        defaultSize: { width: COMMENT_CARD_WIDTH, height: COMMENT_CARD_ESTIMATED_HEIGHT },
      }),
    [cardTargets, sizes, bounds.left, bounds.top, bounds.right, bounds.bottom],
  );

  // 渲染后量出卡片实际高度（文字行数不同），在绘制前重新排布
  useLayoutEffect(() => {
    let changed = false;
    const next: Record<string, CardSize> = {};
    for (const [id, element] of cardRefs.current) {
      const previous = sizes[id];
      if (id === expandedId && editing?.id !== id && previous) {
        next[id] = previous;
        continue;
      }
      const size = { width: COMMENT_CARD_WIDTH, height: element.offsetHeight };
      next[id] = size;
      if (!previous || previous.height !== size.height) changed = true;
    }
    if (changed || Object.keys(next).length !== Object.keys(sizes).length) setSizes(next);
  });

  const editingGone = editing !== null && !itemsById.has(editing.id);
  useLayoutEffect(() => {
    if (editingGone) setEditing(null);
  }, [editingGone]);

  if (!shown || placements.length === 0) return null;

  const finishEdit = (save: boolean) => {
    if (!editing) return;
    if (save) {
      if (!editing.text.trim()) return;
      feedback.edit(editing.id, editing.text);
    }
    const id = editing.id;
    setEditing(null);
    // 保存或取消后焦点回到该卡片的编辑按钮
    requestAnimationFrame(() =>
      cardRefs.current.get(id)?.querySelector<HTMLElement>('[data-testid="mdn-comment-card-edit"]')?.focus(),
    );
  };

  return (
    <CdsIsland density={'compact'} className={'contents'}>
      <div className={'mdn-comment-cards'} data-testid={'mdn-comment-cards'}>
        <svg className={'mdn-comment-card-leaders'} aria-hidden={true}>
          {placements.map(placement => (
            <line
              key={placement.id}
              data-testid={'mdn-comment-card-leader'}
              data-id={placement.id}
              x1={placement.leader.from.x}
              y1={placement.leader.from.y}
              x2={placement.leader.to.x}
              y2={placement.leader.to.y}
            />
          ))}
        </svg>
        {placements.map(placement => (
          <CommentCard
            key={placement.id}
            item={itemsById.get(placement.id)!}
            placement={placement}
            expanded={expandedId === placement.id}
            editingText={editing?.id === placement.id ? editing.text : null}
            cardRef={element => {
              if (element) cardRefs.current.set(placement.id, element);
              else cardRefs.current.delete(placement.id);
            }}
            onExpand={expand => setExpandedId(current => (expand ? placement.id : current === placement.id ? null : current))}
            onEditStart={() => setEditing({ id: placement.id, text: itemsById.get(placement.id)!.text })}
            onEditChange={text => setEditing({ id: placement.id, text })}
            onEditFinish={finishEdit}
            onResolve={() => feedback.resolve(placement.id)}
            onRemove={() => feedback.remove(placement.id)}
          />
        ))}
      </div>
    </CdsIsland>
  );
}

interface CommentCardProps {
  item: FeedbackItem;
  placement: CardPlacement;
  expanded: boolean;
  /** 正在编辑时为输入框内容，否则 null。 */
  editingText: string | null;
  cardRef: (element: HTMLElement | null) => void;
  onExpand: (expand: boolean) => void;
  onEditStart: () => void;
  onEditChange: (text: string) => void;
  onEditFinish: (save: boolean) => void;
  onResolve: () => void;
  onRemove: () => void;
}

function CommentCard({
  item,
  placement,
  expanded,
  editingText,
  cardRef,
  onExpand,
  onEditStart,
  onEditChange,
  onEditFinish,
  onResolve,
  onRemove,
}: CommentCardProps) {
  const editing = editingText !== null;
  const fieldRef = useRef<HTMLTextAreaElement | null>(null);
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!editing || !field) return;
    field.focus({ preventScroll: true });
    field.setSelectionRange(field.value.length, field.value.length);
  }, [editing]);

  const onFieldKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    // 与评论面板一致：Enter 保存，Shift+Enter 换行，Esc 取消；Esc 不再交给画布（不退出评论模式）
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      onEditFinish(false);
    } else if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      onEditFinish(true);
    }
  };

  // 向上放的卡片以底边定位，展开全文时向上长，不盖住自己的目标点
  const anchoredBottom = placement.direction === 'up';
  return (
    <section
      ref={cardRef}
      className={'mdn-comment-card'}
      data-mdn-comment-card={''}
      data-testid={'mdn-comment-card'}
      data-id={item.id}
      data-status={item.status}
      data-expanded={expanded || undefined}
      data-editing={editing || undefined}
      aria-label={uiMessage('feedback.comments.card', { n: item.n })}
      style={{
        left: placement.x,
        top: anchoredBottom ? placement.y + placement.height : placement.y,
        width: placement.width,
        transform: anchoredBottom ? 'translateY(-100%)' : undefined,
      }}
      // 卡片上的按下不交给画布（不选择、不拖动、不新建评论）
      onPointerDown={event => event.stopPropagation()}
      onPointerEnter={() => onExpand(true)}
      onPointerLeave={() => onExpand(false)}
      onFocus={() => onExpand(true)}
      onBlur={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) onExpand(false);
      }}
    >
      <div className={'mdn-comment-card-head'}>
        <span className={'mdn-comment-card-index'}>{item.n}</span>
        {item.status === 'sent' ? (
          <span className={'mdn-comment-card-state'} data-testid={'mdn-comment-card-sent'}>
            {uiMessage('feedback.comments.sent')}
          </span>
        ) : null}
        <div className={'mdn-comment-card-actions'}>
          {editing ? null : (
            <Button
              variant={'ghost'}
              size={'xxs'}
              iconOnly={true}
              icon={<Icon name={'Edit'} size={'sm'} />}
              aria-label={uiMessage('feedback.comments.editN', { n: item.n })}
              title={uiMessage('feedback.comments.edit')}
              className={'mdn-comment-card-action'}
              data-testid={'mdn-comment-card-edit'}
              onClick={onEditStart}
            />
          )}
          <Button
            variant={'ghost'}
            size={'xxs'}
            iconOnly={true}
            icon={<Icon name={'Check'} size={'sm'} />}
            aria-label={uiMessage('feedback.comments.resolveN', { n: item.n })}
            title={uiMessage('feedback.comments.resolve')}
            className={'mdn-comment-card-action'}
            data-testid={'mdn-comment-card-resolve'}
            onClick={onResolve}
          />
          <Button
            variant={'ghost'}
            size={'xxs'}
            iconOnly={true}
            icon={<Icon name={'Trash'} size={'sm'} />}
            aria-label={uiMessage('feedback.comments.deleteN', { n: item.n })}
            title={uiMessage('feedback.comments.delete')}
            className={'mdn-comment-card-action'}
            data-testid={'mdn-comment-card-remove'}
            onClick={onRemove}
          />
        </div>
      </div>
      {editing ? (
        <div className={'mdn-comment-card-edit'}>
          <textarea
            ref={fieldRef}
            rows={2}
            maxLength={4000}
            value={editingText}
            aria-label={uiMessage('feedback.comments.editField', { n: item.n })}
            data-testid={'mdn-comment-card-edit-field'}
            onChange={event => onEditChange(event.target.value)}
            onKeyDown={onFieldKeyDown}
          />
          <div className={'mdn-comment-card-edit-actions'}>
            <Button variant={'ghost'} size={'sm'} data-testid={'mdn-comment-card-edit-cancel'} onClick={() => onEditFinish(false)}>
              {uiMessage('feedback.comments.cancel')}
            </Button>
            <Button
              variant={'primary'}
              size={'sm'}
              disabled={!editingText.trim()}
              data-testid={'mdn-comment-card-edit-save'}
              onClick={() => onEditFinish(true)}
            >
              {uiMessage('feedback.comments.save')}
            </Button>
          </div>
        </div>
      ) : (
        <p className={'mdn-comment-card-text'}>{item.text}</p>
      )}
    </section>
  );
}
