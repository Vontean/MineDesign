import type { Dynamic } from '../runtime-types';
import { DELETE_DOCUMENT, dirname } from './document-values';
import type { PathState } from './live-document-effective';

export interface WriteDebounce {
  debounceMs: number;
  maxWaitMs: number;
}

/**
 * 标记已到发送时间的路径（due），并返回最早需要再次唤醒的时间；没有则为 Infinity。
 * 有挂起补丁且未被拒绝的路径才参与；防抖到点或超过最长等待即到期，到期后受 notBefore 退避约束。
 */
export function markDueWrites(
  pathStates: Iterable<PathState>,
  now: number,
  debounce: WriteDebounce,
): number {
  let nextWakeAt = Infinity;
  for (const pathState of pathStates) {
    if (pathState.pending === undefined || pathState.parked !== undefined) continue;
    if (!pathState.due) {
      const dueAt = Math.min(
        pathState.lastAt + debounce.debounceMs,
        pathState.firstAt + debounce.maxWaitMs,
      );
      dueAt <= now ? (pathState.due = true) : (nextWakeAt = Math.min(nextWakeAt, dueAt));
    }
    pathState.due &&
      pathState.notBefore > now &&
      (nextWakeAt = Math.min(nextWakeAt, pathState.notBefore));
  }
  return nextWakeAt;
}

export interface WriteOrderContext {
  now: number;
  /** 集合的写入先后，下标小的先写 */
  collections: string[];
  metaPath: string;
  isInFlight(path: string): boolean;
}

function collectionWriteOrder(path: string, collections: string[]): number {
  const collectionIndex = collections.indexOf(dirname(path));
  return collectionIndex < 0 ? collections.length : collectionIndex;
}

/**
 * 选出下一条要发送的路径。
 * 排序：先写入后删除；写入按集合顺序（元数据排在同集合文档之后），删除按集合逆序；同级按入队序号。
 */
export function selectNextWrite(
  pathStates: Iterable<[string, PathState]>,
  context: WriteOrderContext,
): string | undefined {
  let nextPath: string | undefined,
    nextDeleteRank = 0,
    nextCollectionRank = 0,
    nextSequence = 0;
  for (const [path, pathState] of pathStates) {
    if (
      pathState.pending === undefined ||
      !pathState.due ||
      pathState.notBefore > context.now ||
      pathState.parked !== undefined ||
      context.isInFlight(path)
    )
      continue;
    const deleteRank = pathState.pending.patch === DELETE_DOCUMENT ? 1 : 0,
      collectionIndex = collectionWriteOrder(path, context.collections),
      collectionRank: Dynamic = deleteRank
        ? -collectionIndex
        : collectionIndex + (path === context.metaPath ? 0.5 : 0);
    if (
      nextPath === undefined ||
      deleteRank < nextDeleteRank ||
      (deleteRank === nextDeleteRank &&
        (collectionRank < nextCollectionRank ||
          (collectionRank === nextCollectionRank && pathState.seq < nextSequence)))
    ) {
      nextPath = path;
      nextDeleteRank = deleteRank;
      nextCollectionRank = collectionRank;
      nextSequence = pathState.seq;
    }
  }
  return nextPath;
}
