/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { encodePathSegments, fileContentToBytes, getMimeTypeForPath, hasInjectedRuntime, isHtmlPath, normalizeFileEntry, stripFrameRuntime, validatePublishFileMap } from "./file-content";
import { hasCapabilityMethod, resolveHostCapability } from "./host-capabilities";
import { sha256 } from "./sha256";

var ARTIFACT_FILE_LIST_PATH: Dynamic;
var publishCapabilityName: Dynamic;
var PUBLISH_ACCESS_ERROR_CODES: Dynamic;
var PUBLISH_ERROR_CODE_ALIASES: Dynamic;
var SHA256_PATTERN: Dynamic;
var normalizeSha256: Dynamic;
var VERSIONED_ARTIFACT_PATH_PATTERN: Dynamic;
var FILE_PORT_REQUEST_TIMEOUT_MS: Dynamic;
var filePortTextDecoder: Dynamic;
async function resolvePublishCapability(): Promise<Dynamic> {
  return (
    (await resolveHostCapability(
      "artifact",
      publishCapabilityName,
    )) ??
    (await resolveHostCapability("self", publishCapabilityName))
  );
}
function parsePublishedFileHashes(rawHashes?: Dynamic): Dynamic {
  if (!Array.isArray(rawHashes)) return;
  let entries: Dynamic = [];
  for (let fileHash of rawHashes as Dynamic) {
    let fileSha: Dynamic = normalizeSha256(fileHash?.sha256);
    if (typeof fileHash?.path != "string" || fileSha === undefined) return;
    entries.push({
      path: fileHash.path,
      sha256: fileSha,
    });
  }
  return entries;
}
function parsePublishConflictHashes(rawConflicts?: Dynamic): Dynamic {
  if (!Array.isArray(rawConflicts)) return;
  let entries: Dynamic = [];
  for (let conflict of rawConflicts as Dynamic) {
    let liveSha: Dynamic = normalizeSha256(
      "actual" in (conflict ?? {}) ? conflict.actual : conflict?.liveSha,
    );
    if (typeof conflict?.path != "string" || liveSha === undefined) return;
    let expectedSha: Dynamic = normalizeSha256(conflict.expected);
    entries.push({
      path: conflict.path,
      liveSha: liveSha,
      ...(expectedSha !== undefined
        ? {
            expected: expectedSha,
          }
        : {}),
    });
  }
  return entries;
}
function normalizePublishError_2(error?: Dynamic): Dynamic {
  let record: Dynamic =
      typeof error == "object" && error !== null ? error : {},
    code: Dynamic =
      (typeof record.code == "string"
        ? PUBLISH_ERROR_CODE_ALIASES[record.code]
        : undefined) ?? "upstream_error",
    value: Dynamic =
      typeof record.retryAfterMs == "number"
        ? record.retryAfterMs
        : typeof record.retry_after_ms == "number"
          ? record.retry_after_ms
          : undefined,
    conflictPaths: Dynamic = parsePublishConflictHashes(record.paths),
    changedFiles: Dynamic = parsePublishedFileHashes(record.changed);
  return {
    ok: false,
    code: code,
    ...(typeof record.live == "string"
      ? {
          live: record.live,
        }
      : {}),
    ...(value !== undefined
      ? {
          retryAfterMs: value,
        }
      : {}),
    ...(conflictPaths !== undefined
      ? {
          paths: conflictPaths,
        }
      : {}),
    ...(changedFiles !== undefined
      ? {
          changed: changedFiles,
        }
      : {}),
  };
}
function createDesignFilesPort(portOptions: Dynamic = {}): Dynamic {
  let fetchFile: Dynamic =
      portOptions.fetch ??
      ((url?: Dynamic): Dynamic => (globalThis as Dynamic).fetch(url)),
    fetchFresh: Dynamic = portOptions.fetchFresh ?? fetchFile,
    useFreshReads: Dynamic = false,
    now: Dynamic = (): Dynamic =>
      (globalThis as Dynamic).performance?.now() ?? Date.now(),
    readResponse: Dynamic = async (filePath?: Dynamic): Promise<Dynamic> => {
      let shouldFetchFresh: Dynamic = useFreshReads,
        readStartedAt: Dynamic = now();
      try {
        let response: Dynamic = await (shouldFetchFresh ? fetchFresh : fetchFile)(filePath);
        try {
          portOptions.onRead?.(filePath, now() - readStartedAt, response.status, shouldFetchFresh);
        } catch {}
        return response;
      } catch (readError: Dynamic) {
        try {
          portOptions.onRead?.(filePath, now() - readStartedAt, 0, shouldFetchFresh);
        } catch {}
        throw readError;
      }
    },
    resolvePublisher: Dynamic = portOptions.resolveNs ?? resolvePublishCapability,
    pageLocation: Dynamic = portOptions.location ?? (globalThis as Dynamic).location,
    version: Dynamic = portOptions.bootVersion ?? {
      version:
        VERSIONED_ARTIFACT_PATH_PATTERN.exec(
          pageLocation?.pathname ?? "",
        )?.[1] ?? "",
    },
    canWrite: Dynamic = portOptions.canWrite ?? true,
    bootFiles: Dynamic = portOptions.bootFiles,
    bootNarrowed: Dynamic = portOptions.bootNarrowed === true,
    listingNarrowed: Dynamic = false,
    listing: Dynamic,
    readHashes: Dynamic = new Map(),
    localFiles: Dynamic = new Map(),
    changeListeners: Dynamic = new Set(),
    listenerSequence: Dynamic = 0,
    maxReadCacheEntries: Dynamic = 64,
    readCache: Dynamic = new Map(),
    pendingReads: Dynamic = new Map(),
    publishedBytes: Dynamic = new Map(),
    dirtyPaths: Dynamic = new Set(),
    isChangedLocalFile: Dynamic = (change?: Dynamic): Dynamic => {
      let entry: Dynamic = localFiles.get(change.path);
      return (
        entry !== undefined &&
        !publishingPaths.has(change.path) &&
        (entry === null ? null : entry.sha256) !== change.sha256
      );
    },
    normalizeFileMetadata: Dynamic = (
      filePath?: Dynamic,
      metadata?: Dynamic,
    ): Dynamic =>
      typeof metadata?.sha256 == "string"
        ? {
            sha256: metadata.sha256,
            size: typeof metadata.size == "number" ? metadata.size : 0,
            contentType:
              typeof metadata.contentType == "string"
                ? metadata.contentType
                : (getMimeTypeForPath(filePath) ??
                  "application/octet-stream"),
          }
        : undefined;
  async function readListing(): Promise<Dynamic> {
    let entries: Dynamic = new Map();
    if (bootFiles !== undefined) {
      let isNarrowed: Dynamic = bootNarrowed,
        bootEntries: Dynamic = Array.isArray(bootFiles)
          ? bootFiles.map((file?: Dynamic): Dynamic => [file.path, file])
          : Object.entries(bootFiles);
      for (let [filePath, metadata] of bootEntries as Dynamic) {
        let fileMetadata: Dynamic = normalizeFileMetadata(filePath, metadata);
        fileMetadata && entries.set(filePath, fileMetadata);
      }
      return {
        files: entries,
        narrowed: isNarrowed,
      };
    }
    let value: Dynamic = await readResponse(ARTIFACT_FILE_LIST_PATH);
    if (!value.ok)
      throw {
        code: value.status === 404 ? "not_found" : "http",
        status: value.status,
        message: ARTIFACT_FILE_LIST_PATH + ": HTTP " + String(value.status),
      };
    let listingDocument: Dynamic = await value.json();
    if (
      listingDocument === null ||
      typeof listingDocument != "object" ||
      listingDocument.files === null ||
      typeof listingDocument.files != "object" ||
      Array.isArray(listingDocument.files)
    )
      throw {
        code: "http",
        status: value.status,
        malformed: true,
        message: ARTIFACT_FILE_LIST_PATH + ": no files object",
      };
    typeof listingDocument.ver == "string" &&
      version.version === "" &&
      (version = {
        version: listingDocument.ver,
      });
    let files: Dynamic = listingDocument.files;
    for (let [filePath, metadata] of Object.entries(files) as Dynamic) {
      let fileMetadata: Dynamic = normalizeFileMetadata(filePath, metadata);
      fileMetadata && entries.set(filePath, fileMetadata);
    }
    return {
      files: entries,
      narrowed: listingDocument.narrowed === true,
    };
  }
  function overlayLocalFileMetadata(fileListing?: Dynamic): Dynamic {
    for (let [value, localFile] of localFiles as Dynamic)
      localFile === null
        ? fileListing.delete(value)
        : fileListing.set(value, {
            sha256: localFile.sha256,
            size: localFile.bytes.length,
            contentType: localFile.contentType,
          });
  }
  async function refreshListing(shouldRefresh: Dynamic = false): Promise<Dynamic> {
    let value: Dynamic = listingGeneration;
    shouldRefresh &&
      canWrite &&
      bootNarrowed &&
      ((bootFiles = undefined), (bootNarrowed = false));
    let fetchedListing: Dynamic = await readListing();
    if (shouldRefresh && canWrite && fetchedListing.narrowed)
      throw {
        code: "http",
        status: 403,
        narrowed: true,
        message: ARTIFACT_FILE_LIST_PATH + ": marked as narrowed",
      };
    let updatedListing: Dynamic = Object.defineProperty(fetchedListing.files, "narrowed", {
      value: fetchedListing.narrowed,
    });
    overlayLocalFileMetadata(updatedListing);
    value === listingGeneration &&
      !(
        canWrite &&
        fetchedListing.narrowed &&
        listing !== undefined &&
        !listingNarrowed
      ) &&
      ((listing = updatedListing),
      (listingNarrowed = fetchedListing.narrowed),
      (cachedListingGeneration = listingGeneration));
    return updatedListing;
  }
  let listingRequest: Dynamic,
    deniedListingGeneration: Dynamic = -1;
  function getListing(): Dynamic {
    let value: Dynamic = listingGeneration;
    if (!canWrite && deniedListingGeneration === value)
      return Promise.resolve(undefined);
    if (listingRequest?.at === value) return listingRequest.p;
    let state: Dynamic = {
      at: value,
      p: refreshListing()
        .catch((listingError?: Dynamic): Dynamic => {
          let status: Dynamic = listingError?.status;
          !canWrite &&
            (status === 401 || status === 403) &&
            (deniedListingGeneration = value);
        })
        .finally((): Dynamic => {
          listingRequest === state && (listingRequest = undefined);
        }),
    };
    listingRequest = state;
    return state.p;
  }
  let addressedVersion: Dynamic = (): Dynamic =>
    VERSIONED_ARTIFACT_PATH_PATTERN.exec(pageLocation?.pathname ?? "")?.[1];
  function rejectWrongVersionRedirect(
    response?: Dynamic,
    filePath?: Dynamic,
    expectedVersion?: Dynamic,
  ): Dynamic {
    if (
      response.redirected !== true ||
      !useFreshReads ||
      !canWrite ||
      expectedVersion === undefined
    )
      return;
    let redirectedVersion: Dynamic;
    try {
      redirectedVersion = VERSIONED_ARTIFACT_PATH_PATTERN.exec(
        new URL(response.url ?? "", "https://page.invalid").pathname,
      )?.[1];
    } catch {
      redirectedVersion = undefined;
    }
    if (redirectedVersion !== undefined && redirectedVersion !== expectedVersion)
      throw {
        code: "redirected",
        status: 403,
        redirectedTo: response.url,
        message:
          filePath +
          ": answered by a redirect to /_f/" +
          redirectedVersion +
          "/, not the version this page addresses (/_f/" +
          expectedVersion +
          "/); asked for again",
      };
  }
  async function readFileBytes(
    filePath?: Dynamic,
    shouldAllowRedirect: Dynamic = false,
  ): Promise<Dynamic> {
    let entry: Dynamic = localFiles.get(filePath);
    if (entry === null)
      throw {
        code: "not_found",
        status: 404,
        message: filePath + ": deleted by this tab",
      };
    if (entry !== undefined) {
      readHashes.set(filePath, entry.sha256);
      return {
        bytes: entry.bytes,
        sha256: entry.sha256,
        contentType: entry.contentType,
        raw: false,
      };
    }
    let cachedPublishedFile: Dynamic = publishedBytes.get(filePath);
    if (
      cachedPublishedFile !== undefined &&
      (listing?.get(filePath)?.sha256 ?? cachedPublishedFile.sha256) === cachedPublishedFile.sha256
    )
      return {
        ...cachedPublishedFile,
        raw: true,
      };
    let value: Dynamic = addressedVersion(),
      [response, currentListing]: Dynamic = await Promise.all([
        readResponse(encodePathSegments(filePath)),
        listing !== undefined ? Promise.resolve(listing) : getListing(),
      ]);
    shouldAllowRedirect || rejectWrongVersionRedirect(response, filePath, value);
    if (!response.ok)
      throw {
        code: response.status === 404 ? "not_found" : "http",
        status: response.status,
        message: filePath + ": HTTP " + String(response.status),
      };
    let fileBytes: Dynamic = new Uint8Array(await response.arrayBuffer()),
      metadata: Dynamic = currentListing?.get(filePath),
      fileSha: Dynamic = metadata?.sha256 ?? "",
      contentType: Dynamic =
        metadata?.contentType ??
        response.headers?.get("content-type")?.split(";")[0]?.trim() ??
        getMimeTypeForPath(filePath) ??
        "application/octet-stream";
    return {
      bytes: fileBytes,
      sha256: fileSha,
      contentType: contentType,
      raw: true,
    };
  }
  let closed: Dynamic = false,
    publishingPaths: Dynamic = new Set(),
    publishQueue: Dynamic = Promise.resolve(),
    listingGeneration: Dynamic = 0,
    cachedListingGeneration: Dynamic = 0,
    publishGeneration: Dynamic = 0,
    versionGeneration: Dynamic = 0;
  function enqueuePublish(files?: Dynamic, publishOptions?: Dynamic): Dynamic {
    let value: Dynamic = publishGeneration,
      queuedPublish: Dynamic = publishQueue.then(
        (): Dynamic => publishFiles(files, publishOptions, value),
      );
    publishQueue = queuedPublish.catch((): Dynamic => {});
    return queuedPublish;
  }
  async function publishFiles(
    requestedFiles?: Dynamic,
    publishOptions?: Dynamic,
    requestedGeneration?: Dynamic,
  ): Promise<Dynamic> {
    canWrite &&
      (listing === undefined || listingNarrowed) &&
      (await Promise.race([
        refreshListing().catch((): Dynamic => {}),
        new Promise((resolve?: Dynamic): Dynamic => {
          setTimeout(resolve, FILE_PORT_REQUEST_TIMEOUT_MS);
        }),
      ]));
    if (!canWrite || listingNarrowed)
      return {
        ok: false,
        code: "not_writer",
      };
    let value: Dynamic = validatePublishFileMap(requestedFiles);
    if (value) return value;
    if (requestedGeneration !== publishGeneration && publishOptions?.ifMatch !== undefined)
      return {
        ok: false,
        code: "conflict",
        live: version.version,
      };
    let publisher: Dynamic = await resolvePublisher();
    if (publisher === null) {
      canWrite = false;
      return {
        ok: false,
        code: "capability_disabled",
      };
    }
    let conflicts: Dynamic = Object.keys(requestedFiles).flatMap(
      (filePath?: Dynamic): Dynamic => {
        let entry: Dynamic = localFiles.get(filePath),
          expectedSha: Dynamic =
            publishOptions?.ifMatch !== undefined &&
            Object.hasOwn(publishOptions.ifMatch, filePath)
              ? publishOptions.ifMatch[filePath]
              : undefined,
          liveSha: Dynamic =
            entry === undefined
              ? undefined
              : entry === null
                ? null
                : entry.sha256;
        return expectedSha === undefined ||
          liveSha === undefined ||
          publishingPaths.has(filePath) ||
          expectedSha === liveSha
          ? []
          : [
              {
                path: filePath,
                liveSha: liveSha,
                expected: expectedSha,
              },
            ];
      },
    );
    if (conflicts.length > 0)
      return {
        ok: false,
        code: "conflict",
        live: version.version,
        paths: conflicts,
      };
    let state: Dynamic = {};
    for (let [filePath, file] of Object.entries(requestedFiles) as Dynamic)
      state[filePath] = normalizeFileEntry(filePath, file);
    let publishEntries: Dynamic = {},
      items: Dynamic = [],
      preconditionSupport: Dynamic =
        portOptions.preconditions === undefined
          ? {
              writes: true,
              deletes: true,
            }
          : portOptions.preconditions === false
            ? {}
            : portOptions.preconditions,
      supportsWritePreconditions: Dynamic = preconditionSupport.writes === true,
      supportsDeletePreconditions: Dynamic = supportsWritePreconditions && preconditionSupport.deletes === true;
    for (let [filePath, file] of Object.entries(state) as Dynamic) {
      let requestedSha: Dynamic =
          publishOptions?.ifMatch !== undefined &&
          Object.hasOwn(publishOptions.ifMatch, filePath)
            ? publishOptions.ifMatch[filePath]
            : undefined,
        preconditionSha: Dynamic = requestedSha;
      typeof preconditionSha == "string" &&
        publishingPaths.has(filePath) &&
        localFiles.get(filePath)?.sha256 === preconditionSha &&
        (preconditionSha = undefined);
      typeof preconditionSha == "string" &&
        !SHA256_PATTERN.test(preconditionSha) &&
        (preconditionSha = undefined);
      file !== null
        ? (publishEntries[filePath] =
            supportsWritePreconditions && preconditionSha !== undefined
              ? {
                  ...file,
                  ifMatch: preconditionSha,
                }
              : file)
        : (publishEntries[filePath] =
            supportsDeletePreconditions && closed && typeof preconditionSha == "string"
              ? {
                  delete: true,
                  ifMatch: preconditionSha,
                }
              : null);
      let publishEntry: Dynamic = publishEntries[filePath];
      requestedSha !== undefined &&
        (publishEntry == null || !("ifMatch" in publishEntry)) &&
        items.push(filePath);
    }
    let entries: Dynamic = new Map();
    for (let [filePath, file] of Object.entries(state) as Dynamic)
      if (file !== null) {
        let fileBytes: Dynamic = await fileContentToBytes(
          file.content,
        );
        entries.set(filePath, {
          bytes: fileBytes,
          hash: await sha256(fileBytes),
        });
      }
    if (requestedGeneration !== publishGeneration && publishOptions?.ifMatch !== undefined)
      return {
        ok: false,
        code: "conflict",
        live: version.version,
      };
    let previousVersion: Dynamic = version.version,
      publishVersionGeneration: Dynamic = versionGeneration,
      publishResult: Dynamic;
    try {
      publishResult = await publisher.publish(publishEntries);
    } catch (publishError: Dynamic) {
      try {
        portOptions.onPublishError?.(publishError);
      } catch {}
      let normalizedError: Dynamic = normalizePublishError_2(publishError);
      PUBLISH_ACCESS_ERROR_CODES.has(normalizedError.code) && (canWrite = false);
      return normalizedError;
    }
    let publishedHashes: Dynamic = {},
      didVersionEpochChange: Dynamic = versionGeneration !== publishVersionGeneration,
      locallyHashedPaths: Dynamic = [];
    for (let [filePath, file] of Object.entries(state) as Dynamic) {
      if (file === null) {
        readHashes.set(filePath, null);
        didVersionEpochChange ||
          (localFiles.set(filePath, null),
          listing?.delete(filePath),
          publishingPaths.delete(filePath));
        continue;
      }
      let { bytes: entry, hash: computedSha }: Dynamic = entries.get(filePath),
        reportedSha: Dynamic = publishResult.shas?.[filePath],
        publishedSha: Dynamic = reportedSha ?? computedSha;
      reportedSha === undefined && locallyHashedPaths.push(filePath);
      publishedHashes[filePath] = publishedSha;
      readHashes.set(filePath, publishedSha);
      !didVersionEpochChange &&
        (reportedSha === undefined && hasInjectedRuntime(file)
          ? publishingPaths.add(filePath)
          : publishingPaths.delete(filePath),
        localFiles.set(filePath, {
          sha256: publishedSha,
          bytes: entry,
          contentType: file.contentType,
        }),
        listing?.set(filePath, {
          sha256: publishedSha,
          size: entry.length,
          contentType: file.contentType,
        }));
    }
    bootFiles = undefined;
    didVersionEpochChange ||
      (version = {
        version: publishResult.version,
        ...(typeof publishResult.seq == "number"
          ? {
              seq: publishResult.seq,
            }
          : {}),
      });
    let didReturnHashes: Dynamic =
      publishResult.shas !== undefined &&
      publishResult.shas !== null &&
      typeof publishResult.shas == "object" &&
      !Array.isArray(publishResult.shas);
    didReturnHashes && (closed = true);
    let changedFiles: Dynamic = parsePublishedFileHashes(publishResult.changed);
    !(changedFiles !== undefined
      ? changedFiles.length > 0
      : didReturnHashes && items.length === 0) &&
      !didVersionEpochChange &&
      publishResult.unchanged !== true &&
      publishResult.version !== previousVersion &&
      changeListeners.add(publishResult.version);
    listenerSequence += 1;
    publishResult.unchanged !== true &&
      publishResult.version !== previousVersion &&
      (readCache.set(publishResult.version, listenerSequence),
      readCache.size > maxReadCacheEntries &&
        readCache.delete(readCache.keys().next().value));
    for (let filePath of Object.keys(state) as Dynamic)
      pendingReads.set(filePath, listenerSequence);
    return {
      ok: true,
      version: publishResult.version,
      ...(typeof publishResult.seq == "number"
        ? {
            seq: publishResult.seq,
          }
        : {}),
      shas: publishedHashes,
      ...(locallyHashedPaths.length > 0
        ? {
            computed: locallyHashedPaths,
          }
        : {}),
      ...(publishResult.unchanged === true
        ? {
            unchanged: true,
          }
        : {}),
      ...(didReturnHashes && items.length === 0
        ? {
            preconditionsChecked: true,
          }
        : {}),
      ...(didReturnHashes && items.length > 0
        ? {
            unguarded: items,
          }
        : {}),
      ...(changedFiles !== undefined
        ? {
            changed: changedFiles,
          }
        : {}),
    };
  }
  async function readFileText(
    filePath?: Dynamic,
    shouldAllowRedirect?: Dynamic,
  ): Promise<Dynamic> {
    let value: Dynamic = await readFileBytes(filePath, shouldAllowRedirect),
      fileText: Dynamic = filePortTextDecoder.decode(value.bytes);
    value.raw &&
      isHtmlPath(filePath) &&
      (fileText = stripFrameRuntime(fileText));
    let fileSha: Dynamic =
      value.sha256 !== "" ? value.sha256 : await sha256(fileText);
    readHashes.set(filePath, fileSha);
    return {
      text: fileText,
      sha256: fileSha,
    };
  }
  let callback: Dynamic = (listingEntries?: Dynamic): Dynamic => {
    let value: Dynamic = [...listingEntries]
      .sort(
        ([earlierPath]: Dynamic, [laterPath]: Dynamic): Dynamic =>
          earlierPath < laterPath ? -1 : 1,
      )
      .map(
        ([filePath, metadata]: Dynamic): Dynamic => ({
          path: filePath,
          ...metadata,
          ...(publishingPaths.has(filePath) &&
          localFiles.get(filePath)?.sha256 === metadata.sha256
            ? {
                provisional: true,
              }
            : {}),
        }),
      );
    return Object.defineProperty(value, "narrowed", {
      value: listingEntries.narrowed === true,
    });
  };
  return {
    get canWrite(): Dynamic {
      return canWrite && !listingNarrowed;
    },
    get narrowed(): Dynamic {
      return listingNarrowed;
    },
    get mayWrite(): Dynamic {
      return canWrite;
    },
    forgetBootListing(): Dynamic {
      bootFiles = undefined;
      bootNarrowed = false;
    },
    async listUnlessNarrowed(): Promise<Dynamic> {
      return callback(await refreshListing(true));
    },
    version: (): Dynamic => version,
    async list(): Promise<Dynamic> {
      return callback(await refreshListing());
    },
    async readBytes(filePath: Dynamic): Promise<Dynamic> {
      let value: Dynamic = await readFileBytes(filePath),
        fileSha: Dynamic =
          value.sha256 !== ""
            ? value.sha256
            : await sha256(value.bytes);
      readHashes.set(filePath, fileSha);
      return {
        bytes: value.bytes,
        sha256: fileSha,
        contentType: value.contentType,
      };
    },
    async peekBytes(filePath: Dynamic): Promise<Dynamic> {
      let peekLocalFile: Dynamic = (): Dynamic => {
          let pendingLocalFile: Dynamic = localFiles.get(filePath);
          if (pendingLocalFile === null)
            throw {
              code: "not_found",
              status: 404,
              message: filePath + ": deleted by this tab",
            };
          return pendingLocalFile === undefined
            ? undefined
            : {
                bytes: pendingLocalFile.bytes.slice(),
                ...(publishingPaths.has(filePath)
                  ? {}
                  : {
                      sha256: pendingLocalFile.sha256,
                    }),
                contentType: pendingLocalFile.contentType,
              };
        },
        value: Dynamic = peekLocalFile();
      if (value !== undefined) return value;
      let entry: Dynamic = publishedBytes.get(filePath);
      if (
        entry !== undefined &&
        (listing?.get(filePath)?.sha256 ?? entry.sha256) === entry.sha256
      )
        return {
          bytes: entry.bytes.slice(),
          sha256: entry.sha256,
          contentType: entry.contentType,
        };
      let peekGeneration: Dynamic = listingGeneration,
        expectedSha: Dynamic = listing?.get(filePath)?.sha256,
        expectedVersion: Dynamic = addressedVersion(),
        response: Dynamic = await readResponse(
          encodePathSegments(filePath),
        );
      rejectWrongVersionRedirect(response, filePath, expectedVersion);
      if (!response.ok)
        throw {
          code: response.status === 404 ? "not_found" : "http",
          status: response.status,
          message: filePath + ": HTTP " + String(response.status),
        };
      let fileBytes: Dynamic = new Uint8Array(await response.arrayBuffer()),
        localFile: Dynamic = peekLocalFile();
      if (localFile !== undefined) return localFile;
      let metadata: Dynamic = listing?.get(filePath),
        fileSha: Dynamic =
          peekGeneration === listingGeneration &&
          cachedListingGeneration === listingGeneration &&
          metadata?.sha256 === expectedSha &&
          expectedSha !== ""
            ? expectedSha
            : undefined;
      return {
        bytes: fileBytes,
        ...(fileSha !== undefined
          ? {
              sha256: fileSha,
            }
          : {}),
        contentType:
          metadata?.contentType ??
          response.headers?.get("content-type")?.split(";")[0]?.trim() ??
          getMimeTypeForPath(filePath) ??
          "application/octet-stream",
      };
    },
    peekRows: (): Dynamic =>
      listing === undefined ? undefined : callback(listing),
    readText: (filePath?: Dynamic): Dynamic => readFileText(filePath, false),
    readTextUnchecked: (filePath?: Dynamic): Dynamic =>
      readFileText(filePath, true),
    publish: enqueuePublish,
    onRemoteChange(listener: Dynamic): Dynamic {
      dirtyPaths.add(listener);
      return (): Dynamic => {
        dirtyPaths.delete(listener);
      };
    },
    liveSha: (filePath?: Dynamic): Dynamic => {
      if (listing === undefined) return localFiles.get(filePath)?.sha256;
      let value: Dynamic = listing.get(filePath)?.sha256;
      return value === ""
        ? undefined
        : (value ?? (listingNarrowed ? undefined : null));
    },
    heldSha: (filePath?: Dynamic): Dynamic => readHashes.get(filePath),
    olderThanMyWrite: (versionId?: Dynamic, filePath?: Dynamic): Dynamic => {
      let entry: Dynamic = readCache.get(versionId),
        writeSequence: Dynamic = pendingReads.get(filePath);
      return entry !== undefined && writeSequence !== undefined && writeSequence > entry;
    },
    wroteSinceAdopt: (filePath?: Dynamic): Dynamic =>
      localFiles.get(filePath) !== undefined && localFiles.get(filePath) !== null,
    knownListing: (): Dynamic =>
      new Map(
        [...(listing ?? [])].map(
          ([filePath, metadata]: Dynamic): Dynamic => [filePath, metadata.sha256],
        ),
      ),
    primeRead(filePath: Dynamic, cachedFile: Dynamic): Dynamic {
      localFiles.has(filePath) ||
        (publishedBytes.set(filePath, cachedFile),
        listing !== undefined &&
          cachedFile.sha256 !== "" &&
          listing.set(filePath, {
            sha256: cachedFile.sha256,
            size: cachedFile.bytes.length,
            contentType: cachedFile.contentType,
          }));
    },
    noteIncoming(changes: Dynamic): Dynamic {
      for (let value of changes as Dynamic)
        if (!isChangedLocalFile(value)) {
          if (value.sha256 === null) {
            readHashes.delete(value.path);
            publishedBytes.delete(value.path);
            listing?.delete(value.path);
            continue;
          }
          if (listing !== undefined) {
            let entry: Dynamic = listing.get(value.path);
            entry?.sha256 !== value.sha256 &&
              listing.set(value.path, {
                sha256: value.sha256,
                size: 0,
                contentType:
                  entry?.contentType ??
                  getMimeTypeForPath(value.path) ??
                  "application/octet-stream",
              });
          }
        }
      cachedListingGeneration = listingGeneration;
    },
    noteAdopted(adoptedVersion: Dynamic): Dynamic {
      useFreshReads = true;
      listingGeneration += 1;
      changeListeners.has(adoptedVersion.version) &&
        cachedListingGeneration === listingGeneration - 1 &&
        (cachedListingGeneration = listingGeneration);
      publishedBytes.clear();
      bootFiles = undefined;
      if (!changeListeners.has(adoptedVersion.version)) {
        let entry: Dynamic = readCache.get(adoptedVersion.version);
        for (let [value, localFile] of [...localFiles] as Dynamic)
          (entry !== undefined && (pendingReads.get(value) ?? 0) > entry) ||
            (listing !== undefined &&
              localFile !== null &&
              listing.set(value, {
                sha256: "",
                size: listing.get(value)?.size ?? 0,
                contentType:
                  listing.get(value)?.contentType ??
                  getMimeTypeForPath(value) ??
                  "application/octet-stream",
              }),
            localFiles.delete(value),
            publishingPaths.delete(value));
        if (entry !== undefined && listing !== undefined)
          for (let [value, writeSequence] of pendingReads as Dynamic)
            writeSequence >= entry &&
              !localFiles.has(value) &&
              listing.has(value) &&
              listing.set(value, {
                sha256: "",
                size: listing.get(value)?.size ?? 0,
                contentType:
                  listing.get(value)?.contentType ??
                  getMimeTypeForPath(value) ??
                  "application/octet-stream",
              });
        for (let value of [...changeListeners] as Dynamic)
          (entry === undefined || (readCache.get(value) ?? 0) <= entry) &&
            changeListeners.delete(value);
        publishGeneration += 1;
        entry === undefined && (versionGeneration += 1);
      }
      version = adoptedVersion;
    },
    noteRemote(remoteChange: Dynamic): Dynamic {
      let value: Dynamic = remoteChange.changed.filter(
        (fileChange?: Dynamic): Dynamic => isChangedLocalFile(fileChange) === false,
      );
      for (let fileChange of value as Dynamic)
        if (listing !== undefined)
          if (fileChange.sha256 === null) listing.delete(fileChange.path);
          else {
            let entry: Dynamic = listing.get(fileChange.path);
            listing.set(fileChange.path, {
              sha256: fileChange.sha256,
              size: entry?.sha256 === fileChange.sha256 ? entry.size : 0,
              contentType:
                entry?.contentType ??
                getMimeTypeForPath(fileChange.path) ??
                "application/octet-stream",
            });
          }
      let filteredChange: Dynamic =
        value.length === remoteChange.changed.length
          ? remoteChange
          : {
              ...remoteChange,
              changed: value,
            };
      for (let listener of [...dirtyPaths] as Dynamic)
        try {
          listener(filteredChange);
        } catch {}
    },
  };
}
export {
  ARTIFACT_FILE_LIST_PATH,
  createDesignFilesPort,
  FILE_PORT_REQUEST_TIMEOUT_MS,
  filePortTextDecoder,
  normalizePublishError_2,
  normalizeSha256,
  parsePublishConflictHashes,
  parsePublishedFileHashes,
  PUBLISH_ACCESS_ERROR_CODES,
  PUBLISH_ERROR_CODE_ALIASES,
  publishCapabilityName,
  resolvePublishCapability,
  SHA256_PATTERN,
  VERSIONED_ARTIFACT_PATH_PATTERN,
};
export function installPlatformDesignFilesPort(): () => void {
  return () => {
    ARTIFACT_FILE_LIST_PATH = "_files.json";
    publishCapabilityName = hasCapabilityMethod("publish");
    PUBLISH_ACCESS_ERROR_CODES = new Set([
      "not_writer",
      "not_declared",
      "capability_disabled",
    ]);
    PUBLISH_ERROR_CODE_ALIASES = {
      conflict: "conflict",
      rate_limited: "rate_limited",
      too_large: "too_large",
      not_writer: "not_writer",
      not_declared: "not_declared",
      invalid_content: "invalid_content",
      read_only_path: "read_only_path",
      capability_disabled: "capability_disabled",
      upstream_error: "upstream_error",
      not_granted: "capability_disabled",
      consent_required: "capability_disabled",
      capability_removed: "capability_disabled",
      transform_error: "invalid_content",
    };
    SHA256_PATTERN = /^[0-9a-f]{64}$/;
    normalizeSha256 = (candidate?: Dynamic): Dynamic =>
      candidate === null
        ? null
        : typeof candidate == "string" && SHA256_PATTERN.test(candidate)
          ? candidate
          : undefined;
    VERSIONED_ARTIFACT_PATH_PATTERN = /\/_f\/([^/]+)\//;
    FILE_PORT_REQUEST_TIMEOUT_MS = 1e4;
    filePortTextDecoder = new TextDecoder();
  };
}
