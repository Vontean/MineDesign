import { useSyncExternalStore } from 'react';
import { getUiLocale, subscribeUiLocale } from '@minedesign/contracts/ui-locale';
export function useUiLocale() { return useSyncExternalStore(subscribeUiLocale, getUiLocale, getUiLocale); }
