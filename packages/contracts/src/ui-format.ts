import { getUiLocale } from './ui-locale.ts';
import { uiMessage, type MessageKey } from './ui-messages.ts';
const weightKeys: Record<number, Extract<MessageKey, `inspector.fontWeight.${string}`>> = { 100: 'inspector.fontWeight.thin', 200: 'inspector.fontWeight.extraLight', 300: 'inspector.fontWeight.light', 400: 'inspector.fontWeight.regular', 500: 'inspector.fontWeight.medium', 600: 'inspector.fontWeight.semibold', 700: 'inspector.fontWeight.bold', 800: 'inspector.fontWeight.extraBold', 900: 'inspector.fontWeight.black' };
export function uiFontWeight(weight: string | number): string {
  const number = Number.parseInt(String(weight), 10), key = weightKeys[number];
  return key ? uiMessage(key) : String(weight);
}
export function uiRelativeTime(timestamp: string, now = Date.now()): string {
  const elapsed = Math.max(0, now - Date.parse(timestamp));
  if (!Number.isFinite(elapsed)) return '';
  const minutes = Math.floor(elapsed / 60000);
  const [value, unit]: [number, Intl.RelativeTimeFormatUnit] = minutes < 60 ? [minutes, 'minute'] : minutes < 1440 ? [Math.floor(minutes / 60), 'hour'] : [Math.floor(minutes / 1440), 'day'];
  return new Intl.RelativeTimeFormat(getUiLocale() === 'zh-Hans' ? 'zh-CN' : 'en', { numeric: 'auto' }).format(-value, unit);
}
