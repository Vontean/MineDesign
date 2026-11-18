/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { createDesignDatabaseCodec, DESIGN_SYSTEM_DOCUMENT_PATH } from "./database-codec";
import { INDEX_LEFT_OUT_KEY } from "./design-index";
import { BoardsValue, encodeStorePathSegment, FilesValue, isArtboardFile, NotesValue, PlatformFileContentResolvedValue_4, PlatformFileContentResolvedValue_5, splitPublishBatches } from "./file-content";
import { projectMetadataPaths, projectPathPrefix } from "./project-paths";
import { MAX_SNAPSHOT_COLLECTION_DOCS } from "./snapshot-database";
import { CreatedOnFilesValue } from "./storage-migration";

var DESIGN_CONVERSION_TIMEOUT_MS: Dynamic;
var NONCOPYABLE_PUBLISH_ERRORS: Dynamic;
var noDesignConversion: Dynamic;
async function convertDatabaseDesignToFiles(
  options?: Dynamic,
): Promise<Dynamic> {
  let conversionLock: Dynamic,
    lockHeld: Dynamic = false;
  try {
    if (options.listing === undefined || options.listing === null)
      return {
        did: "nothing",
        why: "list-unread",
      };
    let value: Dynamic = Object.keys(options.listing ?? {}).filter(
      (input?: Dynamic): Dynamic =>
        input.startsWith(projectPathPrefix),
    );
    if (value.includes(projectMetadataPaths.design))
      return {
        did: "nothing",
        why: "has-index",
      };
    let value2: Dynamic =
        options.firstReadLimitMs ?? DESIGN_CONVERSION_TIMEOUT_MS,
      promise: Dynamic = new Promise(
        (input?: Dynamic, options2?: Dynamic): Dynamic => {
          conversionLock = setTimeout(
            (): Dynamic =>
              options2(
                new Error(
                  "no answer within " +
                    String(value2) +
                    " ms (may I write, the store, or its first read)",
                ),
              ),
            value2,
          );
        },
      ),
      callback: Dynamic = (input?: Dynamic): Dynamic =>
        Promise.race([input, promise]);
    if (!(await callback(options.canWrite())))
      return {
        did: "nothing",
        why: "cannot-write",
      };
    let value3: Dynamic = await callback(options.store());
    if (value3 === null)
      return {
        did: "nothing",
        why: "no-store",
      };
    let value4: Dynamic = await callback(
      value3.get(PlatformFileContentResolvedValue_4),
    );
    clearTimeout(conversionLock);
    if (value4 === null)
      return {
        did: "nothing",
        why: "store-empty",
      };
    lockHeld = true;
    if (value4.data.v !== 2)
      return noDesignConversion(
        "design/meta is not the layout this copy knows",
      );
    if (options.holdOff !== undefined)
      return noDesignConversion(options.holdOff, true);
    let entries: Dynamic = new Map([
      [PlatformFileContentResolvedValue_4, value4],
    ]);
    for (let value11 of [
      DESIGN_SYSTEM_DOCUMENT_PATH,
      PlatformFileContentResolvedValue_5,
    ] as Dynamic) {
      let value12: Dynamic = await value3.get(value11);
      value12 !== null && entries.set(value12.path, value12);
    }
    for (let value11 of [
      BoardsValue,
      FilesValue,
      NotesValue,
    ] as Dynamic) {
      let value12: Dynamic = await value3.list(value11);
      if (value12.length >= MAX_SNAPSHOT_COLLECTION_DOCS)
        return noDesignConversion(
          "the store holds " +
            String(MAX_SNAPSHOT_COLLECTION_DOCS) +
            " " +
            value11 +
            " or more",
        );
      for (let value13 of value12 as Dynamic)
        value13.path.startsWith(value11 + "/") &&
          !value13.path.slice(value11.length + 1).includes("/") &&
          entries.set(value13.path, value13);
    }
    for (let value11 of (Array.isArray(value4.data.boardOrder)
      ? value4.data.boardOrder
      : []) as Dynamic) {
      let value12: Dynamic =
        typeof value11 == "string"
          ? BoardsValue +
            "/" +
            encodeStorePathSegment(value11)
          : undefined;
      if (value12 !== undefined && !entries.has(value12)) {
        let value13: Dynamic = await value3.get(value12);
        value13 !== null && entries.set(value13.path, value13);
      }
    }
    let value5: Dynamic = createDesignDatabaseCodec({
        readBlob: options.readBlob,
        ...(options.defaultTitle !== undefined
          ? {
              defaultTitle: options.defaultTitle,
            }
          : {}),
      }),
      value6: Dynamic = await value5.toTree(entries);
    if (Object.keys(value6.index.boards).length === 0)
      return {
        did: "nothing",
        why: "store-empty",
      };
    let value7: Dynamic = value.find(
      (input?: Dynamic): Dynamic =>
        isArtboardFile(input) && !value6.files.has(input),
    );
    if (value7 !== undefined)
      return {
        did: "nothing",
        why: "other-files",
        reason:
          value7 +
          " is an artboard the old store does not hold; nothing was changed",
      };
    let state: Dynamic = {
      ...value6.index,
      [CreatedOnFilesValue]: {
        v: 1,
        at: (options.now?.() ?? new Date()).toISOString(),
      },
    };
    delete state[INDEX_LEFT_OUT_KEY];
    let value8: Dynamic = options.port(),
      value9: Dynamic = Object.fromEntries(
        [...value6.files].filter(
          ([input]: Dynamic): Dynamic => !value.includes(input),
        ),
      ),
      index: Dynamic = 0;
    for (let value11 of splitPublishBatches(
      value9,
      (): Dynamic => false,
    ) as Dynamic) {
      let value12: Dynamic = Object.entries(value11);
      for (
        let index2: Dynamic = 0;
        index2 < 2 && value12.length > 0;
        index2 += 1
      ) {
        let value13: Dynamic = await value8.publish(
          Object.fromEntries(value12),
          {
            ifMatch: Object.fromEntries(
              value12.map(([input]: Dynamic): Dynamic => [input, null]),
            ),
          },
        );
        if (value13.ok) {
          if (value13.preconditionsChecked !== true)
            return noDesignConversion(
              "the host did not check the conditions of a save",
              true,
            );
          index += value12.length;
          break;
        }
        let values: Dynamic = new Set(
          (value13.paths ?? []).map((input?: Dynamic): Dynamic => input.path),
        );
        if (value13.code !== "conflict" || values.size === 0 || index2 === 1)
          return noDesignConversion(
            "content: " + value13.code,
            !NONCOPYABLE_PUBLISH_ERRORS.has(value13.code),
          );
        value12 = value12.filter(
          ([input]: Dynamic): Dynamic => !values.has(input),
        );
      }
    }
    let value10: Dynamic = await value8.publish(
      {
        [projectMetadataPaths.design]: value5.serializeIndex(state),
      },
      {
        ifMatch: {
          [projectMetadataPaths.design]: null,
        },
      },
    );
    return value10.ok
      ? {
          did: "restored",
          files: index + 1,
        }
      : value10.code === "conflict"
        ? {
            did: "nothing",
            why: "someone-else-finished",
          }
        : noDesignConversion("index: " + value10.code, true);
  } catch (value: Dynamic) {
    return noDesignConversion(
      value instanceof Error
        ? value.message
        : typeof value?.message == "string"
          ? String(value.message)
          : String(value),
      lockHeld,
    );
  } finally {
    clearTimeout(conversionLock);
  }
}
export {
  convertDatabaseDesignToFiles,
  DESIGN_CONVERSION_TIMEOUT_MS,
  noDesignConversion,
  NONCOPYABLE_PUBLISH_ERRORS,
};
export function installPlatformDatabaseConversion(): () => void {
  return () => {
    DESIGN_CONVERSION_TIMEOUT_MS = 5e3;
    NONCOPYABLE_PUBLISH_ERRORS = new Set(["too_large", "read_only_path"]);
    noDesignConversion = (
      input?: Dynamic,
      options: Dynamic = false,
    ): Dynamic => ({
      did: "nothing",
      why: "not-copied",
      reason: input,
      ...(options
        ? {
            pastMeta: true,
          }
        : {}),
    });
  };
}
