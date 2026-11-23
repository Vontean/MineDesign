import { beforeAll, describe, expect, it } from 'vitest';
import { DELETE_DOCUMENT, installPlatformDocumentValues } from './document-values';
import {
  applyPendingPatch,
  combinePendingPatches,
  createEffectiveDocuments,
  effectivePathValue,
  rebaseReplacementPatch,
  type PathState,
} from './live-document-effective';

beforeAll(() => {
  installPlatformDocumentValues()();
});

function pathState(fields: Partial<PathState> = {}): PathState {
  return {
    removedSeen: false, held: false, acked: [],
    due: false, lastAt: 0, firstAt: 0, notBefore: 0, seq: 0,
    ...fields,
  };
}

describe('applyPendingPatch', () => {
  it('没有本地改动时原样返回基准文档', () => {
    const base = { a: 1 };
    expect(applyPendingPatch(base, undefined)).toBe(base);
  });
  it('补丁合并进基准，整体替换则直接取补丁', () => {
    expect(applyPendingPatch({ a: 1, b: 2 }, { patch: { b: 3 } })).toEqual({ a: 1, b: 3 });
    expect(applyPendingPatch({ a: 1 }, { patch: { z: 9 }, replace: true })).toEqual({ z: 9 });
  });
  it('文档不存在时补丁成为新文档；删除则没有结果', () => {
    expect(applyPendingPatch(undefined, { patch: { a: 1 } })).toEqual({ a: 1 });
    expect(applyPendingPatch({ a: 1 }, { patch: DELETE_DOCUMENT })).toBeUndefined();
  });
  it('已被他人删除的文档不被普通补丁复活，整体替换可以', () => {
    expect(applyPendingPatch(undefined, { patch: { a: 1 } }, true)).toBeUndefined();
    expect(applyPendingPatch(undefined, { patch: { a: 1 }, replace: true }, true)).toEqual({ a: 1 });
  });
});

describe('effectivePathValue', () => {
  it('没有路径状态时没有值', () => {
    expect(effectivePathValue(undefined)).toBeUndefined();
  });
  it('依次叠加已确认、在途、待发三层', () => {
    const entry = pathState({
      server: { a: 1 },
      acked: [{ patch: { b: 2 } }],
      inflight: { patch: { c: 3 } },
      pending: { patch: { d: 4 } },
    });
    expect(effectivePathValue(entry)).toEqual({ a: 1, b: 2, c: 3, d: 4 });
  });
  it('在途写入已被服务端回显后不再叠加', () => {
    const entry = pathState({
      server: { a: 1, c: 3 },
      inflight: { patch: { c: 99 } },
      inflightEchoed: true,
    });
    expect(effectivePathValue(entry)).toEqual({ a: 1, c: 3 });
  });
  it('已确认的删除让后续补丁从空白开始', () => {
    const entry = pathState({
      server: { a: 1 },
      acked: [{ patch: {}, del: true }],
      pending: { patch: { z: 1 } },
    });
    expect(effectivePathValue(entry)).toEqual({ z: 1 });
  });
  it('占位期间以占位时的基准为准，忽略服务端的新内容', () => {
    const entry = pathState({
      server: { a: 'remote' },
      held: true,
      heldBase: { a: 'held' },
      pending: { patch: { b: 1 } },
    });
    expect(effectivePathValue(entry)).toEqual({ a: 'held', b: 1 });
  });
});

describe('combinePendingPatches', () => {
  it('不冲突的两个补丁合成一个', () => {
    expect(combinePendingPatches({ a: 1 }, { b: 2 }, { a: 0 })).toEqual({
      patch: { a: 1, b: 2 },
      replace: false,
    });
  });
  it('同一字段先后改动时，后一个值胜出', () => {
    expect(combinePendingPatches({ a: 1 }, { a: 2 }, { a: 0 })).toEqual({ patch: { a: 2 }, replace: false });
  });
  it('两个补丁类型冲突且最终回到基准时，按基准重新比较后互相抵消', () => {
    expect(combinePendingPatches({ a: 'text' }, { a: { x: 1 } }, { a: { x: 1 } })).toBeUndefined();
  });
  it('没有基准文档时直接深合并', () => {
    expect(combinePendingPatches({ a: 'text' }, { a: { x: 1 } }, undefined)).toEqual({
      patch: { a: { x: 1 } },
      replace: false,
    });
  });
});

describe('rebaseReplacementPatch', () => {
  it('没有差异时返回 null', () => {
    expect(rebaseReplacementPatch({ a: 1 }, { a: 1 }, { a: 5 })).toBeNull();
  });
  it('字符串列表保留远端内容并追加本地新增项', () => {
    const patch = rebaseReplacementPatch(
      { tags: ['x'], n: 1 },
      { tags: ['x', 'local'], n: 2 },
      { tags: ['x', 'remote'], n: 1 },
    );
    expect(patch).toEqual({ tags: ['x', 'remote', 'local'], n: 2 });
  });
  it('本地新增项远端已有时，该字段不再需要发送', () => {
    expect(
      rebaseReplacementPatch({ tags: [] }, { tags: ['a'] }, { tags: ['a'] }),
    ).toBeNull();
  });
});

describe('createEffectiveDocuments', () => {
  it('update 报告缓存是否变化，并同步字节数', () => {
    const states = new Map<string, PathState>();
    const effective = createEffectiveDocuments(states);
    states.set('docs/a', pathState({ server: { v: 1 } }));
    expect(effective.update('docs/a')).toBe(true);
    expect(effective.documents.get('docs/a')).toEqual({ v: 1 });
    expect(effective.update('docs/a')).toBe(false);
    expect(effective.totalBytes()).toBeGreaterThan(0);
    states.get('docs/a')!.server = undefined;
    expect(effective.update('docs/a')).toBe(true);
    expect(effective.documents.has('docs/a')).toBe(false);
    expect(effective.totalBytes()).toBe(0);
    expect(effective.update('docs/a')).toBe(false);
  });
  it('null 字段在缓存里被清除', () => {
    const states = new Map<string, PathState>([['docs/a', pathState({ server: { v: 1, gone: null } })]]);
    const effective = createEffectiveDocuments(states);
    effective.update('docs/a');
    expect(effective.documents.get('docs/a')).toEqual({ v: 1 });
  });
  it('集合字节数排除指定路径，被拒绝的写入按服务端内容计', () => {
    const states = new Map<string, PathState>([
      ['docs/a', pathState({ server: { v: 'aaaa' } })],
      ['docs/b', pathState({ server: { v: 'b' }, pending: { patch: { v: 'bbbbbbbbbbbb' } } })],
      ['other/c', pathState({ server: { v: 'c' } })],
    ]);
    const effective = createEffectiveDocuments(states);
    for (const path of states.keys()) effective.update(path);
    const all = effective.collectionContentSize('docs');
    const withoutB = effective.collectionContentSize('docs', 'docs/b');
    expect(withoutB).toBeLessThan(all);
    expect(effective.collectionContentSize('other')).toBe(effective.sizes.get('other/c'));
    states.get('docs/b')!.parked = 'too large';
    // 被拒绝后按服务端的 { v: 'b' } 计，小于本地待发内容
    expect(effective.collectionContentSize('docs')).toBeLessThan(all);
  });
});
