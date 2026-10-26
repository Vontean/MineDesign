import { en as en0 } from './ui-text/canvas.en.ts';
import { zh as zh0 } from './ui-text/canvas.zh-Hans.ts';
import { en as en1 } from './ui-text/inspector.en.ts';
import { zh as zh1 } from './ui-text/inspector.zh-Hans.ts';
import { en as en2 } from './ui-text/design-system.en.ts';
import { zh as zh2 } from './ui-text/design-system.zh-Hans.ts';
import { en as en3 } from './ui-text/feedback.en.ts';
import { zh as zh3 } from './ui-text/feedback.zh-Hans.ts';
import { en as en4 } from './ui-text/errors.en.ts';
import { zh as zh4 } from './ui-text/errors.zh-Hans.ts';
import { getUiLocale } from './ui-locale.ts';
export const englishMessages = { ...en0, ...en1, ...en2, ...en3, ...en4 };
export const chineseMessages: Record<keyof typeof englishMessages, string> = { ...zh0, ...zh1, ...zh2, ...zh3, ...zh4 };
export type MessageKey = keyof typeof englishMessages;
type Parameters<S extends string> = S extends `${string}{${infer Key}}${infer Rest}` ? (Key extends `${string},${string}` | `${string} ${string}` ? never : Key) | Parameters<Rest> : never;
export function uiMessage<K extends MessageKey>(key: K, ...args: [Parameters<(typeof englishMessages)[K]>] extends [never] ? [] : [values: Record<Parameters<(typeof englishMessages)[K]>, string | number>]): string {
  const text = getUiLocale() === 'zh-Hans' ? chineseMessages[key] : englishMessages[key];
  const values = args[0] as Record<string, string | number> | undefined;
  return text.replace(/\{(\w+)\}/g, (token, name) => values?.[name] === undefined ? token : String(values[name]));
}
