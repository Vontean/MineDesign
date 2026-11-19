/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { createDesignDatabaseCodec, DESIGN_SYSTEM_DOCUMENT_PATH } from "./database-codec";
import { INDEX_LEFT_OUT_KEY } from "./design-index";
import { BoardsValue, encodeStorePathSegment, FilesValue, isArtboardFile, NotesValue, PlatformFileContentResolvedValue_4 as designMetadataPath, PlatformFileContentResolvedValue_5 as designSourceDocumentPath, splitPublishBatches } from "./file-content";
import { projectMetadataPaths, projectPathPrefix } from "./project-paths";
import { MAX_SNAPSHOT_COLLECTION_DOCS } from "./snapshot-database";
import { CreatedOnFilesValue } from "./storage-migration";

var DESIGN_CONVERSION_TIMEOUT_MS: Dynamic;
var NONCOPYABLE_PUBLISH_ERRORS: Dynamic;
var noDesignConversion: Dynamic;
async function convertDatabaseDesignToFiles(
  conversionOptions?: Dynamic,
): Promise<Dynamic> {
  let initialReadTimer: Dynamic,
    didReadMetadata: Dynamic = false;
  try {
    if (conversionOptions.listing === undefined || conversionOptions.listing === null)
      return {
        did: "nothing",
        why: "list-unread",
      };
    let publishedPaths: Dynamic = Object.keys(conversionOptions.listing ?? {}).filter(
      (path?: Dynamic): Dynamic =>
        path.startsWith(projectPathPrefix),
    );
    if (publishedPaths.includes(projectMetadataPaths.design))
      return {
        did: "nothing",
        why: "has-index",
      };
    let initialReadLimitMs: Dynamic =
        conversionOptions.firstReadLimitMs ?? DESIGN_CONVERSION_TIMEOUT_MS,
      readDeadline: Dynamic = new Promise(
        (_resolve?: Dynamic, reject?: Dynamic): Dynamic => {
          initialReadTimer = setTimeout(
            (): Dynamic =>
              reject(
                new Error(
                  "no answer within " +
                    String(initialReadLimitMs) +
                    " ms (may I write, the store, or its first read)",
                ),
              ),
            initialReadLimitMs,
          );
        },
      ),
      beforeReadDeadline: Dynamic = (operation?: Dynamic): Dynamic =>
        Promise.race([operation, readDeadline]);
    if (!(await beforeReadDeadline(conversionOptions.canWrite())))
      return {
        did: "nothing",
        why: "cannot-write",
      };
    let databaseStore: Dynamic = await beforeReadDeadline(conversionOptions.store());
    if (databaseStore === null)
      return {
        did: "nothing",
        why: "no-store",
      };
    let metadataEntry: Dynamic = await beforeReadDeadline(
      databaseStore.get(designMetadataPath),
    );
    clearTimeout(initialReadTimer);
    if (metadataEntry === null)
      return {
        did: "nothing",
        why: "store-empty",
      };
    didReadMetadata = true;
    if (metadataEntry.data.v !== 2)
      return noDesignConversion(
        "design/meta is not the layout this copy knows",
      );
    if (conversionOptions.holdOff !== undefined)
      return noDesignConversion(conversionOptions.holdOff, true);
    let entriesByPath: Dynamic = new Map([
      [designMetadataPath, metadataEntry],
    ]);
    for (let metadataPath of [
      DESIGN_SYSTEM_DOCUMENT_PATH,
      designSourceDocumentPath,
    ] as Dynamic) {
      let entry: Dynamic = await databaseStore.get(metadataPath);
      entry !== null && entriesByPath.set(entry.path, entry);
    }
    for (let collectionPath of [
      BoardsValue,
      FilesValue,
      NotesValue,
    ] as Dynamic) {
      let collectionEntries: Dynamic = await databaseStore.list(collectionPath);
      if (collectionEntries.length >= MAX_SNAPSHOT_COLLECTION_DOCS)
        return noDesignConversion(
          "the store holds " +
            String(MAX_SNAPSHOT_COLLECTION_DOCS) +
            " " +
            collectionPath +
            " or more",
        );
      for (let entry of collectionEntries as Dynamic)
        entry.path.startsWith(collectionPath + "/") &&
          !entry.path.slice(collectionPath.length + 1).includes("/") &&
          entriesByPath.set(entry.path, entry);
    }
    for (let orderedBoardName of (Array.isArray(metadataEntry.data.boardOrder)
      ? metadataEntry.data.boardOrder
      : []) as Dynamic) {
      let boardEntryPath: Dynamic =
        typeof orderedBoardName == "string"
          ? BoardsValue +
            "/" +
            encodeStorePathSegment(orderedBoardName)
          : undefined;
      if (boardEntryPath !== undefined && !entriesByPath.has(boardEntryPath)) {
        let boardEntry: Dynamic = await databaseStore.get(boardEntryPath);
        boardEntry !== null && entriesByPath.set(boardEntry.path, boardEntry);
      }
    }
    let codec: Dynamic = createDesignDatabaseCodec({
        readBlob: conversionOptions.readBlob,
        ...(conversionOptions.defaultTitle !== undefined
          ? {
              defaultTitle: conversionOptions.defaultTitle,
            }
          : {}),
      }),
      convertedTree: Dynamic = await codec.toTree(entriesByPath);
    if (Object.keys(convertedTree.index.boards).length === 0)
      return {
        did: "nothing",
        why: "store-empty",
      };
    let unmatchedArtboard: Dynamic = publishedPaths.find(
      (path?: Dynamic): Dynamic =>
        isArtboardFile(path) && !convertedTree.files.has(path),
    );
    if (unmatchedArtboard !== undefined)
      return {
        did: "nothing",
        why: "other-files",
        reason:
          unmatchedArtboard +
          " is an artboard the old store does not hold; nothing was changed",
      };
    let convertedIndex: Dynamic = {
      ...convertedTree.index,
      [CreatedOnFilesValue]: {
        v: 1,
        at: (conversionOptions.now?.() ?? new Date()).toISOString(),
      },
    };
    delete convertedIndex[INDEX_LEFT_OUT_KEY];
    let filePort: Dynamic = conversionOptions.port(),
      unpublishedFiles: Dynamic = Object.fromEntries(
        [...convertedTree.files].filter(
          ([path]: Dynamic): Dynamic => !publishedPaths.includes(path),
        ),
      ),
      publishedFileCount: Dynamic = 0;
    for (let batch of splitPublishBatches(
      unpublishedFiles,
      (): Dynamic => false,
    ) as Dynamic) {
      let batchEntries: Dynamic = Object.entries(batch);
      for (
        let attemptIndex: Dynamic = 0;
        attemptIndex < 2 && batchEntries.length > 0;
        attemptIndex += 1
      ) {
        let publishResult: Dynamic = await filePort.publish(
          Object.fromEntries(batchEntries),
          {
            ifMatch: Object.fromEntries(
              batchEntries.map(([path]: Dynamic): Dynamic => [path, null]),
            ),
          },
        );
        if (publishResult.ok) {
          if (publishResult.preconditionsChecked !== true)
            return noDesignConversion(
              "the host did not check the conditions of a save",
              true,
            );
          publishedFileCount += batchEntries.length;
          break;
        }
        let conflictPaths: Dynamic = new Set(
          (publishResult.paths ?? []).map((conflict?: Dynamic): Dynamic => conflict.path),
        );
        if (publishResult.code !== "conflict" || conflictPaths.size === 0 || attemptIndex === 1)
          return noDesignConversion(
            "content: " + publishResult.code,
            !NONCOPYABLE_PUBLISH_ERRORS.has(publishResult.code),
          );
        batchEntries = batchEntries.filter(
          ([path]: Dynamic): Dynamic => !conflictPaths.has(path),
        );
      }
    }
    let indexPublishResult: Dynamic = await filePort.publish(
      {
        [projectMetadataPaths.design]: codec.serializeIndex(convertedIndex),
      },
      {
        ifMatch: {
          [projectMetadataPaths.design]: null,
        },
      },
    );
    return indexPublishResult.ok
      ? {
          did: "restored",
          files: publishedFileCount + 1,
        }
      : indexPublishResult.code === "conflict"
        ? {
            did: "nothing",
            why: "someone-else-finished",
          }
        : noDesignConversion("index: " + indexPublishResult.code, true);
  } catch (conversionError: Dynamic) {
    return noDesignConversion(
      conversionError instanceof Error
        ? conversionError.message
        : typeof conversionError?.message == "string"
          ? String(conversionError.message)
          : String(conversionError),
      didReadMetadata,
    );
  } finally {
    clearTimeout(initialReadTimer);
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
      reason?: Dynamic,
      isPastMetadata: Dynamic = false,
    ): Dynamic => ({
      did: "nothing",
      why: "not-copied",
      reason: reason,
      ...(isPastMetadata
        ? {
            pastMeta: true,
          }
        : {}),
    });
  };
}
