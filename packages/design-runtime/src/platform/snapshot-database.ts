/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { resolveDatabaseCapability } from "./database-adapter";
import { stringifyCanonicalIndex } from "./index-state";
import { migrationMetadataPath } from "./project-paths";
import { sha256 } from "./sha256";

var MAX_PUBLISH_BUNDLE_BYTES: Dynamic;
var PUBLISH_BUNDLE_EXPIRY_MS: Dynamic;
var MAX_SNAPSHOT_COLLECTION_DOCS: Dynamic;
var readPortVersion: Dynamic;
var SNAPSHOT_MAX_CACHE_RETRIES: Dynamic;
var SNAPSHOT_CACHE_RETRY_DELAY_MS: Dynamic;
function hashCanonicalIndex(index?: Dynamic): Dynamic {
  return sha256(
    stringifyCanonicalIndex(index === undefined ? null : index),
  );
}
function parsePublishedIndexMetadata(text?: Dynamic): Dynamic {
  if (text === null) return null;
  try {
    let value: Dynamic = JSON.parse(text),
      callback: Dynamic = (candidate?: Dynamic): Dynamic =>
        typeof candidate == "object" && candidate !== null && !Array.isArray(candidate);
    return value !== null &&
      (value.v === 1 || value.v === 2) &&
      callback(value.documents) &&
      callback(value.files)
      ? value
      : null;
  } catch {
    return null;
  }
}
async function readServerSnapshot(readSnapshot?: Dynamic): Promise<Dynamic> {
  for (let index: Dynamic = 0; ; index++) {
    let value: Dynamic = await readSnapshot();
    if (
      value.metadata?.fromCache !== true &&
      value.metadata?.hasPendingWrites !== true
    )
      return value;
    if (index + 1 >= SNAPSHOT_MAX_CACHE_RETRIES)
      throw Object.assign(
        new Error("the store answered from its cache only"),
        {
          code: "not_authoritative",
        },
      );
    await new Promise((resolve?: Dynamic): Dynamic => {
      setTimeout(resolve, SNAPSHOT_CACHE_RETRY_DELAY_MS);
    });
  }
}
function createSnapshotDatabaseAdapter(database?: Dynamic): Dynamic {
  return {
    async list(collectionPath: Dynamic): Promise<Dynamic> {
      let value: Dynamic = await readServerSnapshot(
          (): Dynamic =>
            database
              .collection(collectionPath)
              .limit(MAX_SNAPSHOT_COLLECTION_DOCS)
              .get(),
        ),
        items: Dynamic = [];
      for (let doc of value.docs as Dynamic)
        doc.exists &&
          items.push({
            path: collectionPath + "/" + doc.id,
            data: {
              ...(doc.data() ?? {}),
            },
          });
      return items;
    },
    async get(documentPath: Dynamic): Promise<Dynamic> {
      let value: Dynamic = await readServerSnapshot(
        (): Dynamic => database.doc(documentPath).get(),
      );
      return value.exists
        ? {
            path: documentPath,
            data: {
              ...(value.data() ?? {}),
            },
          }
        : null;
    },
    async update(documentPath: Dynamic, changes: Dynamic): Promise<Dynamic> {
      await database.doc(documentPath).update({
        ...changes,
      });
    },
    async set(documentPath: Dynamic, data: Dynamic): Promise<Dynamic> {
      await database.doc(documentPath).set({
        ...data,
      });
    },
    async acquire(documentPath: Dynamic, leaseOptions: Dynamic): Promise<Dynamic> {
      let value: Dynamic = database.doc(documentPath);
      if (typeof value.acquire != "function") return "unsupported";
      let lease: Dynamic = await value.acquire(leaseOptions);
      return {
        acquired: lease.acquired === true,
        ...(typeof lease.expiresAt == "string"
          ? {
              expiresAt: lease.expiresAt,
            }
          : {}),
      };
    },
    watch(collectionPath: Dynamic, onChange: Dynamic): Dynamic {
      let flag: Dynamic = true,
        value: Dynamic,
        callback: Dynamic = (snapshot?: Dynamic): Dynamic => {
          try {
            return snapshot
              .docChanges?.()
              .map(
                (change?: Dynamic): Dynamic => collectionPath + "/" + change.doc.id,
              );
          } catch {
            return;
          }
        };
      try {
        value = database
          .collection(collectionPath)
          .limit(MAX_SNAPSHOT_COLLECTION_DOCS)
          .onSnapshot(
            (snapshot?: Dynamic): Dynamic => {
              flag ? (flag = false) : onChange(callback(snapshot));
            },
            (): Dynamic => {},
          );
      } catch {
        value = undefined;
      }
      return (): Dynamic => {
        try {
          value?.();
        } catch {}
      };
    },
  };
}
async function getSnapshotDatabaseAdapter(): Promise<Dynamic> {
  let value: Dynamic = await resolveDatabaseCapability();
  return value === null ? null : createSnapshotDatabaseAdapter(value);
}
export {
  createSnapshotDatabaseAdapter,
  getSnapshotDatabaseAdapter,
  hashCanonicalIndex,
  MAX_PUBLISH_BUNDLE_BYTES,
  MAX_SNAPSHOT_COLLECTION_DOCS,
  parsePublishedIndexMetadata,
  PUBLISH_BUNDLE_EXPIRY_MS,
  readPortVersion,
  readServerSnapshot,
  SNAPSHOT_CACHE_RETRY_DELAY_MS,
  SNAPSHOT_MAX_CACHE_RETRIES,
};
export function installPlatformSnapshotDatabase(): () => void {
  return () => {
    MAX_PUBLISH_BUNDLE_BYTES = 15 * 1024 * 1024;
    PUBLISH_BUNDLE_EXPIRY_MS = 5 * 6e4;
    MAX_SNAPSHOT_COLLECTION_DOCS = 1e3;
    readPortVersion = migrationMetadataPath;
    SNAPSHOT_MAX_CACHE_RETRIES = 5;
    SNAPSHOT_CACHE_RETRY_DELAY_MS = 400;
  };
}
