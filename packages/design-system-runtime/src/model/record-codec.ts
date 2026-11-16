import type { ArtifactComment } from "../contracts/platform-host";
import type {
  DatabaseChange,
  DatabaseError,
  DatabaseQuerySnapshot,
  DatabasePort,
  DatabaseRecord,
  DatabaseSnapshotInfo,
  DocumentRecords,
  NativeDatabase,
  RawComment,
} from "../contracts/model-storage";
import { normalizeComments } from "../host/claude-session";

/** 内嵌进 HTML 时 JSON 里的 <、>、& 会被转义成 \uXXXX（每个多 5 字节） */
export const JSON_HTML_ESCAPE_PATTERN = /[<>&]/g;
/** U+2028、U+2029 内嵌时同样被转义（每个多 3 字节） */
export const JSON_LINE_SEPARATOR_ESCAPE_PATTERN = /[\u2028\u2029]/g;
/** 同步时标记"删除这个文档"的记录 */
export const DELETE_DOCUMENT_RECORD = Symbol("DELETE_DOC");
/** 规范化 JSON 的缓存，以对象身份为键 */
export const canonicalJsonCache = new WeakMap<object, string>();
/** 评论在数据库里存放的集合名 */
export const COMMENT_DOCUMENT_PREFIX = "comments";
export const MAX_COLLECTION_DOCUMENTS = 1000;
export const DB_ERROR_CODES: string[] = [
  "invalid_argument",
  "resource_exhausted",
  "quota_exceeded",
  "unavailable",
  "revoked",
  "not_granted",
  "capability_disabled",
  "capability_removed",
  "transform_error",
];

/** 估算 JSON 内嵌进 HTML 后的字节数：UTF-8 长度加上转义增加的部分 */
export function estimateEmbeddedJsonBytes(value: unknown): number {
  const json = JSON.stringify(value)!;
  const escapeBytes =
    5 * (json.match(JSON_HTML_ESCAPE_PATTERN)?.length ?? 0) +
    3 * (json.match(JSON_LINE_SEPARATOR_ESCAPE_PATTERN)?.length ?? 0);
  return new TextEncoder().encode(json).length + escapeBytes;
}

export function isCanonicalJsonObject(
  input: unknown,
): input is DatabaseRecord {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

/** JSON.stringify 的 replacer：对象的键按字典序排列 */
export function sortJsonObjectKeys(_key: string, value: unknown): unknown {
  if (!isCanonicalJsonObject(value)) {
    return value;
  }
  const sorted: DatabaseRecord = {};
  for (const key of Object.keys(value).sort()) {
    sorted[key] = value[key];
  }
  return sorted;
}

export function canonicalJsonString(value: object): string {
  const cached = canonicalJsonCache.get(value);
  if (cached !== undefined) {
    return cached;
  }
  const canonical = JSON.stringify(value, sortJsonObjectKeys) ?? "undefined";
  canonicalJsonCache.set(value, canonical);
  return canonical;
}

/** 两条记录是否相同；对象按键序无关的规范化 JSON 比较 */
export function documentRecordsEqual(left: unknown, right: unknown): boolean {
  if (left === right) {
    return true;
  }
  if (
    typeof left !== "object" ||
    typeof right !== "object" ||
    left === null ||
    right === null
  ) {
    return false;
  }
  return canonicalJsonString(left) === canonicalJsonString(right);
}

/** 嵌套深度，叶子为 0；深度达到 maxDepth 即停止下探 */
export function jsonValueDepth(value: unknown, maxDepth: number = 64): number {
  if (typeof value !== "object" || value === null) {
    return 0;
  }
  let depth = 0;
  for (const child of Array.isArray(value)
    ? (value as readonly unknown[])
    : Object.values<unknown>(value as DatabaseRecord)) {
    depth = Math.max(depth, jsonValueDepth(child, maxDepth - 1));
    if (depth >= maxDepth) {
      break;
    }
  }
  return depth + 1;
}

/** 每条评论写成一个文档；内容未变时沿用上一份对象，便于后续按身份比较 */
export function decomposeCommentDocuments(
  comments: readonly ArtifactComment[],
  previous: ReadonlyMap<string, DatabaseRecord> | undefined,
  documents: DocumentRecords,
): void {
  for (const comment of comments) {
    const path = COMMENT_DOCUMENT_PREFIX + "/" + comment.id;
    const state: DatabaseRecord = {};
    for (const [field, fieldValue] of Object.entries(comment) as [
      string,
      unknown,
    ][]) {
      if (fieldValue !== undefined) {
        state[field] = fieldValue;
      }
    }
    const earlier = previous?.get(path);
    documents.set(
      path,
      earlier !== undefined && documentRecordsEqual(earlier, state)
        ? earlier
        : state,
    );
  }
}

/** 从文档集合里取出 comments/<id> 一层的文档，还原成评论列表 */
export function composeCommentDocuments(
  documents: ReadonlyMap<string, DatabaseRecord>,
): ArtifactComment[] {
  const comments: RawComment[] = [];
  const prefix = COMMENT_DOCUMENT_PREFIX + "/";
  for (const [path, record] of documents) {
    if (!path.startsWith(prefix) || path.indexOf("/", prefix.length) >= 0) {
      continue;
    }
    comments.push({
      ...record,
      id: path.slice(prefix.length),
    });
  }
  return normalizeComments(comments);
}

/** 数据库错误统一成 { code, message }；"db " 开头的 TypeError 视为参数错误，其余未知错误视为不可用 */
export function normalizeDatabaseError(error: unknown): DatabaseError {
  const object: DatabaseRecord =
    typeof error === "object" && error !== null
      ? (error as DatabaseRecord)
      : {};
  const isDbTypeError =
    object.name === "TypeError" &&
    typeof object.message === "string" &&
    object.message.startsWith("db ");
  const code =
    typeof object.code === "string" && DB_ERROR_CODES.includes(object.code)
      ? object.code
      : isDbTypeError
        ? "invalid_argument"
        : "unavailable";
  const message =
    typeof object.message === "string"
      ? object.message
      : error instanceof Error
        ? error.message
        : String(code);
  return {
    code,
    message,
  };
}

export function createDatabaseAdapter(database: NativeDatabase): DatabasePort {
  return {
    subscribe(
      collection: string,
      onChanges: (
        changes: DatabaseChange[],
        info: DatabaseSnapshotInfo,
      ) => void,
      onError: (error: DatabaseError) => void,
    ): () => void {
      let initial = true;
      let unsubscribe: (() => void) | undefined;
      try {
        unsubscribe = database
          .collection(collection)
          .limit(MAX_COLLECTION_DOCUMENTS)
          .onSnapshot(
            (snapshot: DatabaseQuerySnapshot): void => {
              const changes: DatabaseChange[] = [];
              for (const change of snapshot.docChanges()) {
                const path: string = collection + "/" + change.doc.id;
                if (change.type === "removed") {
                  changes.push({
                    type: "removed",
                    path,
                  });
                } else {
                  changes.push({
                    type: change.type,
                    path,
                    data: change.doc.data() ?? {},
                  });
                }
              }
              const isInitial = initial;
              initial = false;
              onChanges(changes, {
                initial: isInitial,
                fromCache: snapshot.metadata?.fromCache === true,
                hasPendingWrites: snapshot.metadata?.hasPendingWrites === true,
              });
            },
            (error: unknown) => onError(normalizeDatabaseError(error)),
          );
      } catch (error: unknown) {
        queueMicrotask(() => onError(normalizeDatabaseError(error)));
      }
      return (): void => {
        try {
          unsubscribe?.();
        } catch {}
      };
    },
    async set(path: string, data: DatabaseRecord): Promise<void> {
      try {
        await database.doc(path).set({
          ...data,
        });
      } catch (error: unknown) {
        throw normalizeDatabaseError(error);
      }
    },
    async update(path: string, data: DatabaseRecord): Promise<void> {
      try {
        await database.doc(path).update({
          ...data,
        });
      } catch (error: unknown) {
        throw normalizeDatabaseError(error);
      }
    },
    async del(path: string): Promise<void> {
      try {
        await database.doc(path).delete();
      } catch (error: unknown) {
        throw normalizeDatabaseError(error);
      }
    },
  };
}
