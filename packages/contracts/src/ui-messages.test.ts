import { afterEach, expect, it } from 'vitest';
import { chineseMessages, englishMessages, uiMessage } from './ui-messages.ts';
import { getUiLocale, setUiLocale } from './ui-locale.ts';
import { resolveUiLocale, uiText } from './ui-text.ts';
import { uiError } from './ui-error.ts';
import { uiFontWeight, uiRelativeTime } from './ui-format.ts';

afterEach(() => setUiLocale('en'));
it('所有领域词条具有同形的中英键和相同的命名参数，代码示例不算参数', () => {
  expect(Object.keys(chineseMessages).sort()).toEqual(Object.keys(englishMessages).sort());
  const params = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  for (const key of Object.keys(englishMessages) as (keyof typeof englishMessages)[]) {
    expect(params(chineseMessages[key]), key).toEqual(params(englishMessages[key]));
  }
});
it('显式偏好优先，宿主和浏览器回退只解析为英文或简体中文', () => {
  expect(resolveUiLocale('en',['zh-CN'])).toBe('en');
  expect(resolveUiLocale('zh-Hans',['en'])).toBe('zh-Hans');
  expect(resolveUiLocale('system',[null,'zh-TW'])).toBe('zh-Hans');
  expect(resolveUiLocale('system',['fr'])).toBe('en');
  expect(resolveUiLocale('system',[])).toBe('en');
});
it('完整动态句子保留零值，用户传入文本保持原样，不当作第二次翻译模板', () => {
  setUiLocale('zh-Hans');
  expect(uiText(getUiLocale()).tabComments(0)).toBe('评论');
  expect(uiText(getUiLocale()).tabComments(1)).toBe('评论 1');
  expect(uiText(getUiLocale()).tabComments(3)).toBe('评论 3');
  expect(uiMessage('inspector.unsavedEditsDialog.itWasUpdatedOutsideThisEditorWhatDoYouWantToDoWith',{value1:'Fill {private}'})).toContain('Fill {private}');
  setUiLocale('en');
  expect(uiText(getUiLocale()).tabComments(3)).toBe('Comments 3');
});
it('后端错误只按稳定码本地化；未知详情不泄露到普通状态提示中', () => {
  setUiLocale('zh-Hans');
  expect(uiError({code:'unknown_document',message:'/private/raw failure'})).toContain('重新打开');
  expect(uiError({code:'unknown_code',message:'/private/raw failure'})).not.toContain('/private');
  expect(uiError({code:'feedback_stale'})).toContain('评论');
  setUiLocale('en');
  expect(uiError({code:'unknown_document'})).toContain('Open it again');
});
it('字重与相对时间使用界面语言，CSS 数值和未知字重保持原值', () => {
  setUiLocale('en');expect(uiFontWeight(400)).toBe('Regular');
  setUiLocale('zh-Hans');expect(uiFontWeight(400)).toBe('常规');expect(uiFontWeight(445)).toBe('445');
  const now=Date.parse('2026-10-26T03:00:00Z');
  expect(uiRelativeTime('2026-10-26T02:58:00Z',now)).toContain('2分钟前');
  expect(uiRelativeTime('bad-date',now)).toBe('');
});
