import { describe, expect, it } from 'vitest';
import {
  canSendFeedback,
  draftAnnotations,
  editAnnotation,
  feedbackContent,
  markAnnotationsResolved,
  markAnnotationsSent,
  normalizeAnnotations,
  visibleAnnotations,
} from './annotations.mjs';

const AT = '2026-11-17T08:00:00.000Z';
const note = (id: string, extra: Record<string, unknown> = {}) => ({ id, anchor: `Main.dc.html#${id}`, label: `目标 ${id}`, text: `意见 ${id}`, sourceVersion: 'v1', ...extra });

describe('批注状态', () => {
  it('旧数据没有状态时视为草稿，未知状态也按草稿处理', () => {
    const input = [note('a'), note('b', { status: 'sent', sentAt: AT }), note('c', { status: 'archived' })];
    expect(normalizeAnnotations(input).map(n => n.status)).toEqual(['draft', 'sent', 'draft']);
    expect(input[0]).not.toHaveProperty('status');
    expect(normalizeAnnotations(undefined)).toEqual([]);
  });

  it('编辑草稿只改文字，目标与来源版本不变', () => {
    const input = [note('a'), note('b')];
    const result = editAnnotation(input, 'a', '  标题再大一点  ');
    expect(result[0]).toEqual({ ...note('a'), text: '标题再大一点', status: 'draft' });
    expect(result[1].text).toBe('意见 b');
    expect(input[0].text).toBe('意见 a');
  });

  it('编辑已发送的评论后回到草稿，去掉发送时间与来源版本', () => {
    const result = editAnnotation([note('a', { status: 'sent', sentAt: AT })], 'a', '再紧凑一些');
    expect(result[0]).toEqual({ id: 'a', anchor: 'Main.dc.html#a', label: '目标 a', text: '再紧凑一些', status: 'draft' });
  });

  it('空文字、文字未变或已解决的评论不保存修改', () => {
    const sent = [note('a', { status: 'sent', sentAt: AT })];
    expect(editAnnotation(sent, 'a', '   ')[0]).toEqual(sent[0]);
    expect(editAnnotation(sent, 'a', '意见 a')[0].status).toBe('sent');
    const resolved = [note('a', { status: 'resolved', resolvedAt: AT })];
    expect(editAnnotation(resolved, 'a', '新意见')[0].text).toBe('意见 a');
  });

  it('发送只把列出的草稿标为已发送，并记录发送时间', () => {
    const input = [note('a'), note('b'), note('c', { status: 'resolved', resolvedAt: AT })];
    const result = markAnnotationsSent(input, ['a', 'c'], AT);
    expect(result.map(n => n.status)).toEqual(['sent', 'draft', 'resolved']);
    expect(result[0].sentAt).toBe(AT);
    expect(result[2]).not.toHaveProperty('sentAt');
    expect(input[0]).not.toHaveProperty('sentAt');
  });

  it('解决可以作用于草稿与已发送的评论，并记录解决时间', () => {
    const input = [note('a'), note('b', { status: 'sent', sentAt: AT }), note('c')];
    const result = markAnnotationsResolved(input, ['a', 'b'], AT);
    expect(result.map(n => n.status)).toEqual(['resolved', 'resolved', 'draft']);
    expect(result[1]).toMatchObject({ sentAt: AT, resolvedAt: AT });
  });

  it('可见列表含草稿与已发送，不含已解决，保持原顺序', () => {
    const input = [note('a', { status: 'sent' }), note('b', { status: 'resolved' }), note('c')];
    expect(visibleAnnotations(input).map(n => n.id)).toEqual(['a', 'c']);
    expect(draftAnnotations(input).map(n => n.id)).toEqual(['c']);
  });

  it('发送内容只含草稿；没有草稿时只有补充说明也能发送', () => {
    const input = [note('a', { status: 'sent' }), note('b')];
    const content = JSON.parse(feedbackContent({ document: '/w/app', editor: 'design', annotations: input, message: '整体更紧凑' }));
    expect(content).toMatchObject({ kind: 'minedesign-feedback', document: '/w/app', editor: 'design', message: '整体更紧凑' });
    expect(content.annotations.map((n: { id: string }) => n.id)).toEqual(['b']);
    expect(canSendFeedback(input, '')).toBe(true);
    expect(canSendFeedback([note('a', { status: 'sent' })], '  ')).toBe(false);
    expect(canSendFeedback([note('a', { status: 'sent' })], '整体更紧凑')).toBe(true);
  });

  it('未知 id 不报错，内容不变', () => {
    const input = [note('a')];
    expect(editAnnotation(input, 'missing', '新意见')).toEqual(normalizeAnnotations(input));
    expect(markAnnotationsSent(input, ['missing'], AT)).toEqual(normalizeAnnotations(input));
    expect(markAnnotationsResolved(input, ['missing'], AT)).toEqual(normalizeAnnotations(input));
  });
});
