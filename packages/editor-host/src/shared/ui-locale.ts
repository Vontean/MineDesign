import { getUiLocale, setUiLocale, subscribeUiLocale } from '@minedesign/contracts/ui-locale';
import { resolveUiLocale } from '@minedesign/contracts/ui-text';
import { setLocale } from '@minedesign/contracts/i18n';
import type { ParentLink } from './comments-bridge.ts';

export function installUiLocale(win: Window & typeof globalThis, link: ParentLink | null): () => void {
  const sync = () => {
    const locale = getUiLocale();
    win.document.documentElement.lang = locale === 'zh-Hans' ? 'zh-CN' : 'en';
    setLocale(locale);
  };
  setUiLocale(resolveUiLocale('system', [new URLSearchParams(win.location.search).get('lang'), win.navigator.language]));
  sync();
  const stopLocale = subscribeUiLocale(sync);
  const stopMessages = link?.onMessage(message => {
    if (message.type === 'editor:locale') setUiLocale(message.locale);
  });
  return () => { stopLocale(); stopMessages?.(); };
}
