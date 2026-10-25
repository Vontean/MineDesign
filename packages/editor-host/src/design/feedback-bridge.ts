/**
 * MineDesign 的 `feedback` 能力：设计稿编辑器把属性面板与评论合成一个右侧面板，评论列表在 iframe 里显示，
 * 草稿的保存、版本核对与发送仍由父窗口负责（src/frontend/app.mjs）。
 *
 * 父窗口经 `editor:feedback` 推送草稿与发送状态，运行时用 `read`/`subscribe` 显示；面板里的定位、删除、复制、发送
 * 转成 `editor:feedback-action` 交回父窗口。面板显示与否经 `editor:panel` 告诉父窗口，父窗口顶栏的开关经 `editor:set-panel` 请求开关。
 * 缩放与播放也在父窗口顶栏：运行时经 `viewChanged` 报告视图状态（`editor:view`），顶栏的操作经 `editor:view-action` 交给 `onViewAction`。
 * 界面语言由父窗口经 `editor:locale` 推送，运行时用 `locale`/`subscribeLocale` 读取；没收到前按英文。
 */
import type { EditorView, FeedbackItem, ViewAction } from '@minedesign/contracts/editor-messages';
import type { ParentLink } from '@minedesign/editor-host';

export interface HostFeedbackState {
  items: FeedbackItem[];
  status: string;
  canSend: boolean;
  busy: boolean;
}

export interface HostFeedbackCapability {
  read(): HostFeedbackState;
  subscribe(listener: () => void): () => void;
  reveal(id: string): void;
  remove(id: string): void;
  copy(message: string): void;
  send(message: string): void;
  /** 运行时报告右侧面板是否显示；相同的值不重复发送。 */
  panelChanged(open: boolean): void;
  /** 父窗口请求打开或关上右侧面板。 */
  onPanelRequest(listener: (open: boolean) => void): () => void;
  viewChanged(view: EditorView): void;
  locale(): 'zh-Hans' | 'en';
  subscribeLocale(listener: () => void): () => void;
  onViewAction(listener: (action: ViewAction) => void): () => void;
}

export interface FeedbackBridge {
  capability: HostFeedbackCapability;
  dispose(): void;
}

const EMPTY: HostFeedbackState = { items: [], status: '', canSend: false, busy: false };

export function createFeedbackBridge(link: ParentLink): FeedbackBridge {
  let state = EMPTY;
  let panel: boolean | null = null;
  const listeners = new Set<() => void>();
  const panelListeners = new Set<(open: boolean) => void>();
  const viewListeners = new Set<(action: ViewAction) => void>();
  const localeListeners = new Set<() => void>();
  let locale: 'zh-Hans' | 'en' = 'en';
  const stop = link.onMessage(message => {
    if (message.type === 'editor:feedback') {
      state = { items: message.items, status: message.status, canSend: message.canSend, busy: message.busy };
      for (const listener of listeners) listener();
    } else if (message.type === 'editor:set-panel') {
      for (const listener of panelListeners) listener(message.open);
    } else if (message.type === 'editor:locale') {
      if (locale === message.locale) return;
      locale = message.locale;
      for (const listener of localeListeners) listener();
    } else if (message.type === 'editor:view-action') {
      const { type: _type, ...action } = message;
      for (const listener of viewListeners) listener(action);
    }
  });
  const subscribe = <T>(set: Set<T>, listener: T) => {
    set.add(listener);
    return () => void set.delete(listener);
  };
  return {
    capability: {
      read: () => state,
      subscribe: listener => subscribe(listeners, listener),
      reveal: id => link.post({ type: 'editor:feedback-action', action: 'reveal', id }),
      remove: id => link.post({ type: 'editor:feedback-action', action: 'remove', id }),
      copy: message => link.post({ type: 'editor:feedback-action', action: 'copy', message }),
      send: message => link.post({ type: 'editor:feedback-action', action: 'send', message }),
      panelChanged(open) {
        if (panel === open) return;
        panel = open;
        link.post({ type: 'editor:panel', open });
      },
      onPanelRequest: listener => subscribe(panelListeners, listener),
      viewChanged: view => link.post({ type: 'editor:view', ...view }),
      onViewAction: listener => subscribe(viewListeners, listener),
      locale: () => locale,
      subscribeLocale: listener => subscribe(localeListeners, listener),
    },
    dispose() {
      stop();
      listeners.clear();
      panelListeners.clear();
      viewListeners.clear();
      localeListeners.clear();
    },
  };
}
