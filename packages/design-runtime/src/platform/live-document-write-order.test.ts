import { beforeAll, describe, expect, it } from 'vitest';
import { DELETE_DOCUMENT, installPlatformDocumentValues } from './document-values';
import type { PathState } from './live-document-effective';
import { markDueWrites, selectNextWrite } from './live-document-write-order';

beforeAll(() => {
  installPlatformDocumentValues()();
});

function pathState(fields: Partial<PathState> = {}): PathState {
  return {
    removedSeen: false, held: false, acked: [],
    due: false, lastAt: 0, firstAt: 0, notBefore: 0, seq: 0,
    pending: { patch: { v: 1 } },
    ...fields,
  };
}
const debounce = { debounceMs: 350, maxWaitMs: 1500 };

describe('markDueWrites', () => {
  it('防抖时间到后标记到期，未到则返回唤醒时间', () => {
    const waiting = pathState({ firstAt: 1000, lastAt: 1000 });
    expect(markDueWrites([waiting], 1100, debounce)).toBe(1350);
    expect(waiting.due).toBe(false);
    expect(markDueWrites([waiting], 1350, debounce)).toBe(Infinity);
    expect(waiting.due).toBe(true);
  });
  it('持续编辑时最长等待到点也到期', () => {
    const busy = pathState({ firstAt: 0, lastAt: 1490 });
    expect(markDueWrites([busy], 1500, debounce)).toBe(Infinity);
    expect(busy.due).toBe(true);
  });
  it('已到期但处于退避期的路径返回退避结束时间', () => {
    const backoff = pathState({ due: true, notBefore: 5000 });
    expect(markDueWrites([backoff], 2000, debounce)).toBe(5000);
  });
  it('没有待发内容或已被拒绝的路径不参与', () => {
    const idle = pathState({ pending: undefined, firstAt: 0, lastAt: 0 });
    const parked = pathState({ parked: 'refused', firstAt: 0, lastAt: 0 });
    expect(markDueWrites([idle, parked], 9999, debounce)).toBe(Infinity);
    expect(idle.due).toBe(false);
    expect(parked.due).toBe(false);
  });
});

describe('selectNextWrite', () => {
  const base = { now: 1000, collections: ['docs', 'assets'], metaPath: 'docs/meta', isInFlight: () => false };
  const due = (fields: Partial<PathState> = {}) => pathState({ due: true, ...fields });

  it('没有可发送的路径时返回 undefined', () => {
    expect(selectNextWrite([['docs/a', pathState()]], base)).toBeUndefined();
  });
  it('跳过未到期、退避中、被拒绝与已在途的路径', () => {
    const states: [string, PathState][] = [
      ['docs/a', pathState()],
      ['docs/b', due({ notBefore: 2000 })],
      ['docs/c', due({ parked: 'x' })],
      ['docs/d', due()],
      ['docs/e', due({ seq: 5 })],
    ];
    expect(selectNextWrite(states, { ...base, isInFlight: path => path === 'docs/d' })).toBe('docs/e');
  });
  it('写入先于删除，写入按集合顺序，元数据排在同集合文档之后', () => {
    const states: [string, PathState][] = [
      ['assets/x', due({ seq: 1 })],
      ['docs/meta', due({ seq: 2 })],
      ['docs/a', due({ seq: 3 })],
      ['docs/gone', due({ seq: 0, pending: { patch: DELETE_DOCUMENT } })],
    ];
    expect(selectNextWrite(states, base)).toBe('docs/a');
    expect(selectNextWrite(states.slice(0, 2), base)).toBe('docs/meta');
    expect(selectNextWrite([states[3]], base)).toBe('docs/gone');
  });
  it('删除按集合逆序，同级按入队序号', () => {
    const del = (seq: number) => due({ seq, pending: { patch: DELETE_DOCUMENT } });
    expect(selectNextWrite([['docs/a', del(1)], ['assets/b', del(2)]], base)).toBe('assets/b');
    expect(selectNextWrite([['docs/a', due({ seq: 9 })], ['docs/b', due({ seq: 4 })]], base)).toBe('docs/b');
  });
  it('不在已知集合里的路径排在最后', () => {
    expect(
      selectNextWrite([['misc/a', due({ seq: 0 })], ['assets/b', due({ seq: 7 })]], base),
    ).toBe('assets/b');
  });
});
