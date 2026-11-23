import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { Dynamic } from '../runtime-types';

export function formatSyncTime(timestamp?: Dynamic): Dynamic {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return new Date(timestamp).toISOString().slice(11, 16);
  }
}

export function pluralizeSyncCount(count?: Dynamic, noun?: Dynamic): Dynamic {
  return count + ' ' + noun + (count === 1 ? '' : 's');
}

export type LiveLoadState = 'loading' | 'live' | 'cached' | 'failed';

export interface LiveSaveState {
  status: 'readonly' | 'loading' | 'error' | 'cached' | 'saving' | 'dirty' | 'ready';
  message: string;
}

/** 保存状态依赖的事实；每项都是函数，调用时才读取入口里的当前值。 */
export interface SaveStateFacts {
  canWrite: boolean;
  readOnlyReason(): string | undefined;
  liveSyncEnded(): boolean;
  loadState(): LiveLoadState;
  reconnecting(): boolean;
  pendingWriteCount(): number;
  inFlightCount(): number;
  /** 被拒绝的写入：路径 → 原因 */
  parkedWrites(): Map<string, string>;
  collectionsWithPendingWritesCount(): number;
  lastErrorCode(): string | undefined;
  hasWriteBackoffError(): boolean;
  firstRateLimitAt(): number | undefined;
  lastAcknowledgedAt(): number | undefined;
  lastSyncedAt(): number | undefined;
  hasSyncedWrite(): boolean;
  now(): number;
  errorSurfaceDelayMs(): number;
  writeAckTimeoutMs(): number;
  syncExplanation(): string;
}

/**
 * 按事实推出当前保存状态。分支顺序即优先级，不能调整。
 * 唯一的副作用是"刚确认写入、等本地同步完成"时请求一次延后刷新。
 */
export function describeSaveState(
  facts: SaveStateFacts,
  scheduleRefresh: (delayMs: number) => void,
): LiveSaveState {
  if (facts.liveSyncEnded())
    return {
      status: 'readonly',
      get message() { return uiMessage('canvas.liveDocument.liveSyncEndedForThisViewReloadToContinue'); },
    };
  const loadState = facts.loadState();
  if (loadState === 'loading')
    return {
      status: 'loading',
      get message() { return uiMessage('canvas.liveDocument.loadingTheLatestContent'); },
    };
  if (loadState === 'failed')
    return {
      status: 'error',
      get message() { return uiMessage('canvas.liveDocument.theLatestContentFailedToLoadClickToRetry'); },
    };
  if (loadState === 'cached') {
    if (!facts.canWrite)
      return {
        status: 'readonly',
        get message() { return uiMessage('canvas.liveDocument.showingASavedCopyReconnecting'); },
      };
    if (
      facts.pendingWriteCount() === 0 &&
      facts.inFlightCount() === 0 &&
      facts.parkedWrites().size === 0
    )
      return facts.collectionsWithPendingWritesCount() > 0
        ? {
            status: 'cached',
            get message() { return uiMessage('canvas.liveDocument.showingYourSavedCopyYourChangesWillSyncWhenYouReBackOnline'); },
          }
        : {
            status: 'cached',
            get message() { return uiMessage('canvas.liveDocument.showingYourSavedCopyReconnecting'); },
          };
  }
  if (facts.reconnecting())
    return facts.canWrite
      ? {
          status: 'error',
          get message() { return uiMessage('canvas.liveDocument.liveUpdatesStoppedReconnectingClickToRetryNowYourEditsAreKeptOnThisScreen'); },
        }
      : {
          status: 'readonly',
          get message() { return uiMessage('canvas.liveDocument.liveUpdatesStoppedReconnecting'); },
        };
  if (!facts.canWrite)
    return {
      status: 'readonly',
      message: facts.readOnlyReason() ?? 'Read-only. You’re seeing live changes.',
    };
  const pendingCount = facts.pendingWriteCount();
  const parkedWrites = facts.parkedWrites();
  if (parkedWrites.size > 0) {
    const [parkedReason] = parkedWrites.values(),
      wasRefused = facts.lastErrorCode() === 'refused';
    return {
      status: 'error',
      message:
        (parkedReason ?? 'A change could not be stored.') +
        (pendingCount > parkedWrites.size ? ' Other changes keep syncing.' : '') +
        (wasRefused
          ? ' Shorten it to resume syncing this item.'
          : ' Click to retry.'),
    };
  }
  const firstRateLimitAt = facts.firstRateLimitAt();
  if (
    facts.hasWriteBackoffError() ||
    (firstRateLimitAt !== undefined &&
      facts.now() - firstRateLimitAt > facts.errorSurfaceDelayMs())
  )
    return {
      status: 'error',
      message:
        (facts.inFlightCount() > 0
          ? 'The store is unreachable. Retrying now.'
          : 'The store is unreachable. Retrying shortly; click to retry now.') +
        ' Your edits are kept on this screen.',
    };
  if (facts.inFlightCount() > 0)
    return {
      status: 'saving',
      get message() { return uiMessage('canvas.liveDocument.syncing'); },
    };
  if (pendingCount > 0)
    return {
      status: 'dirty',
      message: pluralizeSyncCount(pendingCount, 'change') + ' waiting to sync.',
    };
  if (facts.collectionsWithPendingWritesCount() > 0) {
    const lastAcknowledgedAt = facts.lastAcknowledgedAt();
    if (
      lastAcknowledgedAt !== undefined &&
      facts.now() - lastAcknowledgedAt < facts.writeAckTimeoutMs()
    ) {
      scheduleRefresh(lastAcknowledgedAt + facts.writeAckTimeoutMs() - facts.now());
      return {
        status: 'saving',
        get message() { return uiMessage('canvas.liveDocument.syncing'); },
      };
    }
    return {
      status: 'dirty',
      get message() { return uiMessage('canvas.liveDocument.changesSavedOnThisDeviceNotYetSynced'); },
    };
  }
  const lastSyncedAt = facts.lastSyncedAt();
  return {
    status: 'ready',
    message:
      (lastSyncedAt !== undefined
        ? 'All changes synced \xB7 ' + formatSyncTime(lastSyncedAt)
        : facts.hasSyncedWrite()
          ? 'All changes synced'
          : 'Synced') +
      '. ' +
      facts.syncExplanation(),
  };
}

export interface SaveStateTimers {
  setTimeout(run: () => void, delayMs: number): Dynamic;
  clearTimeout(timer: Dynamic): void;
}

/**
 * 保存状态的订阅与去重：状态（status 与 message）没变就不通知。
 * 延后刷新只保留一个定时器，已有时不重复安装。
 */
export function createSaveStateReporter(facts: SaveStateFacts, timers: SaveStateTimers) {
  const listeners = new Set<(state: LiveSaveState) => void>();
  let lastKey = '';
  let refreshTimer: Dynamic;

  function scheduleRefresh(delayMs: number) {
    refreshTimer ??= timers.setTimeout((): void => {
      refreshTimer = undefined;
      notify();
    }, delayMs);
  }
  function current(): LiveSaveState {
    return describeSaveState(facts, scheduleRefresh);
  }
  function notify() {
    const saveState = current(),
      nextKey = saveState.status + '|' + (saveState.message ?? '');
    if (nextKey !== lastKey) {
      lastKey = nextKey;
      for (const listener of [...listeners]) listener(saveState);
    }
  }
  return {
    current,
    notify,
    subscribe(listener: (state: LiveSaveState) => void): () => boolean {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** 与其他定时器一起在结束同步或释放时回收。 */
    clearTimer() {
      refreshTimer !== undefined && timers.clearTimeout(refreshTimer);
      refreshTimer = undefined;
    },
    /** 测试与诊断用：是否有待触发的延后刷新。 */
    hasPendingRefresh: () => refreshTimer !== undefined,
  };
}
