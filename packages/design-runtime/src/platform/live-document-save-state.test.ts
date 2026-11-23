import { describe, expect, it, vi } from 'vitest';
import {
  createSaveStateReporter,
  describeSaveState,
  formatSyncTime,
  pluralizeSyncCount,
  type SaveStateFacts,
} from './live-document-save-state';

/** 默认是一份已同步、可写的实时文档；各用例只改影响分支的事实。 */
function facts(overrides: Partial<SaveStateFacts> = {}): SaveStateFacts {
  return {
    canWrite: true,
    readOnlyReason: () => undefined,
    liveSyncEnded: () => false,
    loadState: () => 'live',
    reconnecting: () => false,
    pendingWriteCount: () => 0,
    inFlightCount: () => 0,
    parkedWrites: () => new Map(),
    collectionsWithPendingWritesCount: () => 0,
    lastErrorCode: () => undefined,
    hasWriteBackoffError: () => false,
    firstRateLimitAt: () => undefined,
    lastAcknowledgedAt: () => undefined,
    lastSyncedAt: () => undefined,
    hasSyncedWrite: () => false,
    now: () => 100_000,
    errorSurfaceDelayMs: () => 30_000,
    writeAckTimeoutMs: () => 5000,
    syncExplanation: () => 'EXPLAIN',
    ...overrides,
  };
}
const describeOnly = (overrides: Partial<SaveStateFacts>, refresh = vi.fn()) =>
  describeSaveState(facts(overrides), refresh);

describe('describeSaveState 分支优先级', () => {
  it('实时同步已结束时只读，优先于其他状态', () => {
    expect(describeOnly({ liveSyncEnded: () => true, loadState: () => 'loading' }).status).toBe('readonly');
  });
  it('加载中与加载失败', () => {
    expect(describeOnly({ loadState: () => 'loading' }).status).toBe('loading');
    expect(describeOnly({ loadState: () => 'failed' }).status).toBe('error');
  });
  it('缓存模式：只读用户只读；可写且无待写入显示 cached；有待写入继续往下判断', () => {
    expect(describeOnly({ loadState: () => 'cached', canWrite: false }).status).toBe('readonly');
    expect(describeOnly({ loadState: () => 'cached' }).status).toBe('cached');
    expect(
      describeOnly({ loadState: () => 'cached', collectionsWithPendingWritesCount: () => 1 }).status,
    ).toBe('cached');
    expect(
      describeOnly({ loadState: () => 'cached', pendingWriteCount: () => 2, reconnecting: () => true }).status,
    ).toBe('error');
  });
  it('重连中：可写为错误，只读为 readonly', () => {
    expect(describeOnly({ reconnecting: () => true }).status).toBe('error');
    expect(describeOnly({ reconnecting: () => true, canWrite: false }).status).toBe('readonly');
  });
  it('只读用户显示自定义原因，没有则用默认文案', () => {
    expect(describeOnly({ canWrite: false, readOnlyReason: () => 'View only' }).message).toBe('View only');
    expect(describeOnly({ canWrite: false }).message).toContain('Read-only');
  });
  it('被拒绝的写入显示原因，拒绝类错误提示缩短内容，且提示其他改动仍在同步', () => {
    const parked = new Map([['docs/a', 'Too long.']]);
    const retry = describeOnly({ parkedWrites: () => parked, pendingWriteCount: () => 1 });
    expect(retry.status).toBe('error');
    expect(retry.message).toBe('Too long. Click to retry.');
    const refused = describeOnly({
      parkedWrites: () => parked, pendingWriteCount: () => 3, lastErrorCode: () => 'refused',
    });
    expect(refused.message).toBe('Too long. Other changes keep syncing. Shorten it to resume syncing this item.');
  });
  it('写入退避或限流持续超过阈值时报告存储不可达，文案随是否在途变化', () => {
    expect(describeOnly({ hasWriteBackoffError: () => true, inFlightCount: () => 1 }).message)
      .toBe('The store is unreachable. Retrying now. Your edits are kept on this screen.');
    expect(describeOnly({ hasWriteBackoffError: () => true }).message)
      .toContain('click to retry now');
    expect(describeOnly({ firstRateLimitAt: () => 60_000 }).status).toBe('error');
    expect(describeOnly({ firstRateLimitAt: () => 80_000 }).status).not.toBe('error');
  });
  it('在途为 saving，仅有待发为 dirty 并按数量变复数', () => {
    expect(describeOnly({ inFlightCount: () => 1 }).status).toBe('saving');
    expect(describeOnly({ pendingWriteCount: () => 1 }).message).toBe('1 change waiting to sync.');
    expect(describeOnly({ pendingWriteCount: () => 3 }).message).toBe('3 changes waiting to sync.');
  });
  it('最近刚确认写入时显示 saving 并请求在确认窗口结束时刷新', () => {
    const refresh = vi.fn();
    const state = describeOnly(
      { collectionsWithPendingWritesCount: () => 1, lastAcknowledgedAt: () => 98_000 },
      refresh,
    );
    expect(state.status).toBe('saving');
    expect(refresh).toHaveBeenCalledWith(3000);
  });
  it('确认窗口已过仍有集合未同步时显示 dirty，且不请求刷新', () => {
    const refresh = vi.fn();
    const state = describeOnly(
      { collectionsWithPendingWritesCount: () => 1, lastAcknowledgedAt: () => 1000 },
      refresh,
    );
    expect(state.status).toBe('dirty');
    expect(refresh).not.toHaveBeenCalled();
  });
  it('全部同步：按有无同步时间与是否写过给出三种文案并附说明', () => {
    expect(describeOnly({}).message).toBe('Synced. EXPLAIN');
    expect(describeOnly({ hasSyncedWrite: () => true }).message).toBe('All changes synced. EXPLAIN');
    const withTime = describeOnly({ lastSyncedAt: () => 1_700_000_000_000 });
    expect(withTime.status).toBe('ready');
    expect(withTime.message).toContain('All changes synced \xB7 ');
  });
});

describe('createSaveStateReporter', () => {
  function setup(overrides: Partial<SaveStateFacts> = {}) {
    const queue: { run: () => void; delay: number; id: number }[] = [];
    const cleared: number[] = [];
    let nextId = 1;
    const timers = {
      setTimeout: (run: () => void, delay: number) => {
        const id = nextId++;
        queue.push({ run, delay, id });
        return id;
      },
      clearTimeout: (id: number) => { cleared.push(id); },
    };
    const reporter = createSaveStateReporter(facts(overrides), timers);
    return { reporter, queue, cleared };
  }

  it('状态没变时不重复通知，变化后再通知', () => {
    let pending = 0;
    const { reporter } = setup({ pendingWriteCount: () => pending });
    const listener = vi.fn();
    reporter.subscribe(listener);
    reporter.notify();
    reporter.notify();
    expect(listener).toHaveBeenCalledTimes(1);
    pending = 2;
    reporter.notify();
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener.mock.calls[1][0].message).toBe('2 changes waiting to sync.');
  });
  it('取消订阅后不再收到通知', () => {
    let pending = 0;
    const { reporter } = setup({ pendingWriteCount: () => pending });
    const listener = vi.fn();
    const unsubscribe = reporter.subscribe(listener);
    unsubscribe();
    pending = 1;
    reporter.notify();
    expect(listener).not.toHaveBeenCalled();
  });
  it('延后刷新只安装一个定时器，触发后重新通知；回收时清除', () => {
    const { reporter, queue, cleared } = setup({
      collectionsWithPendingWritesCount: () => 1,
      lastAcknowledgedAt: () => 98_000,
    });
    reporter.current();
    reporter.current();
    expect(queue).toHaveLength(1);
    expect(reporter.hasPendingRefresh()).toBe(true);
    reporter.clearTimer();
    expect(cleared).toEqual([1]);
    expect(reporter.hasPendingRefresh()).toBe(false);
    reporter.clearTimer();
    expect(cleared).toEqual([1]);
    // 触发刷新：先清空引用，再重新计算并通知
    reporter.current();
    const listener = vi.fn();
    reporter.subscribe(listener);
    queue[1].run();
    expect(listener).toHaveBeenCalledTimes(1);
  });
});

describe('同步文案工具', () => {
  it('pluralizeSyncCount 只在数量为 1 时用单数', () => {
    expect(pluralizeSyncCount(1, 'change')).toBe('1 change');
    expect(pluralizeSyncCount(0, 'change')).toBe('0 changes');
  });
  it('formatSyncTime 对无效时间不抛错', () => {
    expect(() => formatSyncTime(Number.NaN)).not.toThrow();
  });
});
