// @vitest-environment happy-dom
import { afterEach, expect, it } from 'vitest';
import { getUiLocale, setUiLocale, subscribeUiLocale } from '@minedesign/contracts/ui-locale';
import { installUiLocale } from './ui-locale.ts';
import type { HostToEditorMessage } from '@minedesign/contracts/editor-messages';

afterEach(() => setUiLocale('en'));
it('语言独立于评论能力，父窗口切换只通知一次，卸载后不再接收', () => {
  const listeners = new Set<(message: HostToEditorMessage) => void>();
  const dispose = installUiLocale(window, { post() {}, onMessage(listener) { listeners.add(listener); return () => void listeners.delete(listener); } });
  let changes = 0;
  const stop = subscribeUiLocale(() => changes++);
  const deliver = (locale: 'en' | 'zh-Hans') => listeners.forEach(fn => fn({ type: 'editor:locale', locale }));
  deliver('zh-Hans'); deliver('zh-Hans');
  expect(getUiLocale()).toBe('zh-Hans');
  expect(document.documentElement.lang).toBe('zh-CN');
  expect(changes).toBe(1);
  deliver('en');
  expect(document.documentElement.lang).toBe('en');
  dispose(); stop();
  expect(listeners.size).toBe(0);
});
it('独立打开也按浏览器语言初始化，不要求 feedback 或聊天连接', () => {
  const dispose = installUiLocale(window, null);
  expect(['en','zh-Hans']).toContain(getUiLocale());
  dispose();
});
