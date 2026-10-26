import { resolveUiLocale, type UiLocale } from './ui-text.ts';

// 每个编辑器页面独立维护语言；切换只通知视图，不重新打开或写入作品。
let locale: UiLocale = resolveUiLocale('system', [typeof navigator === 'undefined' ? null : navigator.language]);
const listeners = new Set<() => void>();
export const getUiLocale = (): UiLocale => locale;
export function subscribeUiLocale(listener: () => void): () => void {
  listeners.add(listener);
  return () => void listeners.delete(listener);
}
export function setUiLocale(next: UiLocale): void {
  if (next === locale) return;
  locale = next;
  for (const listener of listeners) listener();
}
