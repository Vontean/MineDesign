import type { Dynamic } from '../runtime-types';
import { deepMerge, DELETE_DOCUMENT, diffRecord, dirname, mergeCompatibleRecords, removeNullValues, serializedDocumentBytes, structurallyEqual } from './document-values';

/** 一次本地改动：补丁、整体替换或删除，同一结构用于待发、在途与已确认的写入。 */
export interface PendingWrite {
  patch: Dynamic;
  replace?: boolean;
  del?: boolean;
}

/** 单个文档路径的同步状态；只列出本模块读取的字段，其余由入口维护。 */
export interface PathState {
  server?: Dynamic;
  removedSeen: boolean;
  held: boolean;
  heldBase?: Dynamic;
  acked: PendingWrite[];
  inflight?: PendingWrite;
  inflightEchoed?: boolean;
  pending?: PendingWrite;
  parked?: string;
  /** 写入调度：到期标记、最近与最早入队时间、退避下限、入队序号 */
  due: boolean;
  lastAt: number;
  firstAt: number;
  notBefore: number;
  seq: number;
  [key: string]: Dynamic;
}

/** 把一次本地改动叠到基准文档上；删除、或"已被他人删除后的补丁"得到 undefined。 */
export function applyPendingPatch(
  baseDocument: Dynamic,
  pending: PendingWrite | undefined,
  wasRemoved = false,
): Dynamic {
  if (pending === undefined) return baseDocument;
  if (
    pending.patch !== DELETE_DOCUMENT &&
    !(baseDocument === undefined && !pending.replace && wasRemoved)
  )
    return pending.replace || baseDocument === undefined
      ? pending.patch
      : deepMerge(baseDocument, pending.patch);
}

/** 服务端文档（或被占位的基准）依次叠加已确认、在途、待发三层本地改动后的结果。 */
export function effectivePathValue(entry: PathState | undefined): Dynamic {
  if (entry === undefined) return;
  let document: Dynamic =
      entry.held && entry.heldBase !== undefined
        ? (entry.heldBase ?? undefined)
        : entry.server,
    wasRemoved = entry.removedSeen && entry.server === undefined;
  for (const acknowledgedWrite of entry.acked)
    document = acknowledgedWrite.del
      ? undefined
      : applyPendingPatch(document, acknowledgedWrite, wasRemoved);
  entry.inflightEchoed !== true &&
    (document = applyPendingPatch(document, entry.inflight, wasRemoved));
  document = applyPendingPatch(document, entry.pending, wasRemoved);
  return document;
}

/** 合并同一路径上先后两次补丁；互相抵消时返回 undefined。 */
export function combinePendingPatches(
  earlierPatch: Dynamic,
  laterPatch: Dynamic,
  baseDocument: Dynamic,
): PendingWrite | undefined {
  const compatiblePatch = mergeCompatibleRecords(earlierPatch, laterPatch);
  if (compatiblePatch !== null)
    return { patch: compatiblePatch, replace: false };
  if (baseDocument === undefined)
    return { patch: deepMerge(earlierPatch, laterPatch), replace: false };
  const combinedPatch = diffRecord(
    baseDocument,
    deepMerge(deepMerge(baseDocument, earlierPatch), laterPatch),
  );
  return combinedPatch === null ? undefined : { patch: combinedPatch, replace: false };
}

/** 整体替换被远端先改过时，把本地补丁改写到远端文档上；字符串列表按"远端在前，本地新增在后"合并。 */
export function rebaseReplacementPatch(
  baseDocument: Dynamic,
  replacement: Dynamic,
  remoteDocument: Dynamic,
): Dynamic {
  const patch = diffRecord(baseDocument, replacement);
  if (patch === null) return null;
  const rebasedPatch: Record<string, Dynamic> = { ...patch };
  const isStringList = (candidate: Dynamic): boolean =>
    Array.isArray(candidate) && candidate.every((item: Dynamic) => typeof item == 'string');
  for (const key of Object.keys(rebasedPatch)) {
    const baseValue = baseDocument[key],
      localValue = replacement[key],
      remoteValue = remoteDocument[key];
    if (!isStringList(baseValue) || !isStringList(localValue) || !isStringList(remoteValue))
      continue;
    const mergedList = [
      ...remoteValue,
      ...localValue.filter(
        (item: string) => !baseValue.includes(item) && !remoteValue.includes(item),
      ),
    ];
    structurallyEqual(mergedList, remoteValue)
      ? delete rebasedPatch[key]
      : (rebasedPatch[key] = mergedList);
  }
  return Object.keys(rebasedPatch).length === 0 ? null : rebasedPatch;
}

/**
 * 各路径"本地视角下应有的文档"缓存及其字节数。
 * pathStates 由入口持有并修改；这里只在 update 时读取，不保存副本。
 */
export function createEffectiveDocuments(pathStates: Map<string, PathState>) {
  const documents = new Map<string, Dynamic>();
  const sizes = new Map<string, number>();

  /** 重算一个路径；缓存内容有变化返回 true。 */
  function update(path: string): boolean {
    const effective = effectivePathValue(pathStates.get(path)),
      normalized: Dynamic = effective === undefined ? undefined : removeNullValues(effective),
      entry = documents.get(path);
    if (normalized === undefined) {
      if (entry === undefined) return false;
      documents.delete(path);
      sizes.delete(path);
      return true;
    }
    if (entry !== undefined && structurallyEqual(entry, normalized)) return false;
    documents.set(path, normalized);
    sizes.set(path, serializedDocumentBytes(normalized));
    return true;
  }

  /** 某集合的内容字节数；被拒绝的写入按服务端当前内容计，不算本地改动。 */
  function collectionContentSize(collectionPath: string, excludePath?: string): number {
    let bytes = 0;
    for (const [path, documentBytes] of sizes) {
      if (path === excludePath || dirname(path) !== collectionPath) continue;
      const entry = pathStates.get(path);
      bytes +=
        entry?.parked !== undefined
          ? entry.server !== undefined
            ? serializedDocumentBytes(entry.server)
            : 0
          : documentBytes;
    }
    return bytes;
  }

  function totalBytes(): number {
    let total = 0;
    for (const bytes of sizes.values()) total += bytes;
    return total;
  }

  return { documents, sizes, update, collectionContentSize, totalBytes };
}
