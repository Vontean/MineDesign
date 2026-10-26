import { uiText, type UiLocale } from './ui-text.ts';
import { getUiLocale } from './ui-locale.ts';
import { englishMessages, chineseMessages, type MessageKey } from './ui-messages.ts';
const feedbackErrors = { feedback_stale: 'stale', feedback_duplicate: 'duplicate', feedback_rejected: 'rejected', save_timeout: 'saveTimeout', not_saved: 'notSaved' } as const;
export function uiError(error: unknown, locale: UiLocale = getUiLocale()): string {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : 'operation_failed';
  const feedbackKey = feedbackErrors[code as keyof typeof feedbackErrors];
  if (feedbackKey) return uiText(locale)[feedbackKey];
  const key = `errors.${code}` as MessageKey;
  const messages = locale === 'zh-Hans' ? chineseMessages : englishMessages;
  return messages[key] ?? messages['errors.operation_failed'];
}
