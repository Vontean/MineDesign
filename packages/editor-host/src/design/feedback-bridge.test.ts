import { describe, expect, it } from 'vitest';
import type { EditorToHostMessage, HostToEditorMessage } from '@minedesign/contracts/editor-messages';
import type { ParentLink } from '@minedesign/editor-host';
import { createFeedbackBridge } from './feedback-bridge.ts';

function fakeLink() {
  const sent: EditorToHostMessage[] = [];
  const listeners = new Set<(message: HostToEditorMessage) => void>();
  const link: ParentLink = {
    post: message => sent.push(message),
    onMessage: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  const deliver = (message: HostToEditorMessage) => listeners.forEach(l => l(message));
  return { link, sent, deliver, listeners };
}

describe('createFeedbackBridge', () => {
  it('父窗口推送的草稿可读，变化时通知订阅者', () => {
    const parent = fakeLink();
    const { capability } = createFeedbackBridge(parent.link);
    expect(capability.read().items).toEqual([]);
    let notified = 0;
    capability.subscribe(() => notified++);
    const items = [{ id: 'a', n: 1, label: '工作台', text: '更醒目' }];
    parent.deliver({ type: 'editor:feedback', items, status: '', canSend: true, busy: false });
    expect(notified).toBe(1);
    expect(capability.read()).toEqual({ items, status: '', canSend: true, busy: false });
  });

  it('面板里的操作交回父窗口，面板状态只在变化时报告', () => {
    const parent = fakeLink();
    const { capability } = createFeedbackBridge(parent.link);
    capability.remove('a');
    capability.send('整体更紧凑');
    capability.panelChanged(true);
    capability.panelChanged(true);
    capability.panelChanged(false);
    expect(parent.sent).toEqual([
      { type: 'editor:feedback-action', action: 'remove', id: 'a' },
      { type: 'editor:feedback-action', action: 'send', message: '整体更紧凑' },
      { type: 'editor:panel', open: true },
      { type: 'editor:panel', open: false },
    ]);
  });

  it('父窗口的面板开关交给运行时；dispose 后不再收消息', () => {
    const parent = fakeLink();
    const bridge = createFeedbackBridge(parent.link);
    const requests: boolean[] = [];
    bridge.capability.onPanelRequest(open => requests.push(open));
    parent.deliver({ type: 'editor:set-panel', open: false });
    expect(requests).toEqual([false]);
    bridge.dispose();
    expect(parent.listeners.size).toBe(0);
  });
});

describe('createFeedbackBridge 的界面语言', () => {
  it('没收到前按英文，父窗口切换后通知订阅者', () => {
    const parent = fakeLink();
    const { capability } = createFeedbackBridge(parent.link);
    expect(capability.locale()).toBe('en');
    let notified = 0;
    capability.subscribeLocale(() => notified++);
    parent.deliver({ type: 'editor:locale', locale: 'zh-Hans' });
    parent.deliver({ type: 'editor:locale', locale: 'zh-Hans' });
    expect(capability.locale()).toBe('zh-Hans');
    expect(notified).toBe(1);
  });
});

describe('createFeedbackBridge 的视图状态与操作', () => {
  it('视图状态发给父窗口，父窗口的操作去掉消息类型交给运行时', () => {
    const parent = fakeLink();
    const { capability } = createFeedbackBridge(parent.link);
    const view = { scale: 1, minScale: 0.05, maxScale: 8, presets: [1], toggles: [], canUndo: false, canRedo: false, play: [] };
    capability.viewChanged(view);
    expect(parent.sent).toEqual([{ type: 'editor:view', ...view }]);
    const actions: unknown[] = [];
    capability.onViewAction(action => actions.push(action));
    parent.deliver({ type: 'editor:view-action', action: 'zoom', scale: 2 });
    parent.deliver({ type: 'editor:view-action', action: 'play', file: 'Login.dc.html' });
    expect(actions).toEqual([
      { action: 'zoom', scale: 2 },
      { action: 'play', file: 'Login.dc.html' },
    ]);
  });
});
