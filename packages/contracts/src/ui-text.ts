/**
 * MineDesign 界面文案：外壳与编辑器里由 MineDesign 接管的界面共用。只出中文与英文；英文目录决定键，中文必须逐键对上（类型检查）。
 * 语言偏好为 `system` 时跟随 Codex（宿主上下文的 locale），取不到再看系统语言。
 */
export const UI_LOCALES = ['zh-Hans', 'en'] as const;
export type UiLocale = (typeof UI_LOCALES)[number];
export type LanguagePreference = 'system' | UiLocale;

export function isLanguagePreference(value: unknown): value is LanguagePreference {
  return value === 'system' || (UI_LOCALES as readonly unknown[]).includes(value);
}

/** 偏好不是 `system` 时直接用；否则按语言标签的先后取第一个有效的，中文系一律用简体中文，其余用英文。 */
export function resolveUiLocale(preference: LanguagePreference | null | undefined, tags: readonly (string | null | undefined)[]): UiLocale {
  if (preference && preference !== 'system') return preference;
  const tag = tags.find(t => typeof t === 'string' && t.trim() !== '');
  return tag && /^zh(?:[-_]|$)/i.test(tag.trim()) ? 'zh-Hans' : 'en';
}


import { en as shellEn } from './ui-text/shell.legacy.en.ts';
import { zh as shellZh } from './ui-text/shell.legacy.zh-Hans.ts';
import { en as feedbackEn } from './ui-text/feedback.legacy.en.ts';
import { zh as feedbackZh } from './ui-text/feedback.legacy.zh-Hans.ts';
import { en as canvasEn } from './ui-text/canvas.legacy.en.ts';
import { zh as canvasZh } from './ui-text/canvas.legacy.zh-Hans.ts';
const en = { ...shellEn, ...feedbackEn, ...canvasEn };
export type UiText = typeof en;
const zh: UiText = { ...shellZh, ...feedbackZh, ...canvasZh };
const TEXT = { en, 'zh-Hans': zh };
export function uiText(locale: UiLocale): UiText { return TEXT[locale]; }
/** MineDesign 的项目与联系信息，About 里展示。 */
export const PROJECT_LINKS = {
  repository: 'https://github.com/Vontean/MineDesign',
  author: 'https://github.com/Vontean',
  authorName: 'Vontean',
  email: 'vontean0802@outlook.com',
} as const;
