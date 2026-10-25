import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LOCALES, setLocale } from '@minedesign/contracts/i18n';
import { createCommentLabels, localeFromSearch } from './comment-labels.ts';

/** 标注位置标签的词表（docs/design/slides §8.2）：跟随 BaoCut 的界面语言，英文与运行时原文逐字一致。 */

const ROLES = ['display', 'h1', 'h2', 'h3', 'lead', 'eyebrow', 'body', 'caption'];
const ELEMENTS = ['img', 'icon', 'stack', 'grid', 'overlay', 'html', 'spacer'];
const SHAPES = ['rect', 'rounded', 'ellipse', 'diamond', 'arrow-right', 'arrow-left', 'arrow-up', 'arrow-down', 'line', 'connector'];
const PARTS = [
  'left edge', 'right edge', 'top edge', 'bottom edge', 'top half', 'bottom half', 'left side', 'right side',
  'top left', 'top centre', 'top right', 'middle left', 'middle centre', 'middle right',
  'bottom left', 'bottom centre', 'bottom right', 'middle', 'centre', 'part',
];

beforeEach(() => {
  // 测试进程钉在简体中文（vitest.config.ts 的 BAOCUT_LOCALE）；这里要按参数换语言
  vi.stubEnv('BAOCUT_LOCALE', '');
});

afterEach(() => {
  vi.unstubAllEnvs();
  setLocale('zh-Hans');
});

describe('localeFromSearch', () => {
  it('取地址上的 lang，认不出或没带时为 null', () => {
    expect(localeFromSearch('?lang=zh-Hans')).toBe('zh-Hans');
    expect(localeFromSearch('?foo=1&lang=pt-BR')).toBe('pt-BR');
    expect(localeFromSearch('?lang=xx')).toBeNull();
    expect(localeFromSearch('')).toBeNull();
  });
});

describe('createCommentLabels', () => {
  it('按界面语言给词，表里没有的返回 undefined（运行时用英文）', () => {
    const labels = createCommentLabels('zh-Hans');
    expect(labels.slide(3)).toBe('第 3 页');
    expect(labels.textRole('h1')).toBe('一级标题');
    expect(labels.element({ kind: 'shape', shape: 'rect' })).toBe('矩形');
    expect(labels.element({ kind: 'table', rows: 2, cols: 3 })).toBe('表格 2×3');
    expect(labels.areaPart('top left')).toBe('（左上）');
    expect(labels.covered(2)).toBe(' · 2 个元素');
    expect(labels.textRole('unknown')).toBeUndefined();
    expect(labels.element({ kind: 'unknown' })).toBeUndefined();
    expect(labels.element({ kind: 'shape', shape: 'star' })).toBeUndefined();
    expect(labels.areaPart('somewhere')).toBeUndefined();
  });

  it('没有语言时用英文', () => {
    const labels = createCommentLabels(null);
    expect(labels.slide(1)).toBe('Slide 1');
    expect(labels.covered(1)).toBe(' · 1 element');
    expect(labels.covered(2)).toBe(' · 2 elements');
  });

  it.each(LOCALES)('%s 的每个词都有译文', (locale) => {
    const labels = createCommentLabels(locale);
    const words = [
      labels.slide(12),
      ...ROLES.map((role) => labels.textRole(role)),
      ...ELEMENTS.map((kind) => labels.element({ kind })),
      ...SHAPES.map((shape) => labels.element({ kind: 'shape', shape })),
      labels.element({ kind: 'table', rows: 2, cols: 3 }),
      ...PARTS.map((part) => labels.areaPart(part)),
      labels.covered(1),
      labels.covered(5),
    ];
    for (const word of words) expect(word, locale).toMatch(/\S/);
    expect(labels.slide(12)).toContain('12');
    expect(labels.covered(5)).toContain('5');
  });
});

/** 运行时拼标签时用这些词：要先构建编辑器（`npm run build:slides-editor`）。 */
