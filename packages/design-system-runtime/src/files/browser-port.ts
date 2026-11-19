/** Restored application module; prepare first, initialize in original order. */
import type {
  PortListingMetadata,
  PortListingCache,
  PublishedFileOverride,
  PortRawListingValue,
  PortRawListing,
  PublishErrorWire,
  FilesPublishCapability,
  BrowserFilesPortOptions,
  BrowserFilesPortExtended,
  PublishCapabilityEntry,
  NormalizedFilePublishInput,
  FileRetryError,
} from "../contracts/files-core";
import type * as Files from "../contracts";
import { sha256 } from "../editor/index-file-store";
import { encodeFileUrlPath, fileContentBytes, fileContentContainsRuntimeMarkers, fileMimeTypeFromPath, isHtmlFilePath, normalizeFilePublishInput, stripFrameRuntimeBlock, validateFilePublishBatch } from "./paths";
import { capabilityHasMethod, getOrLoadClaudeCapability } from "../host/claude-capabilities";

var FILE_LISTING_PATH: string;
var supportsFilesPublish: (value: unknown) => value is FilesPublishCapability;
var FILE_PUBLISH_WRITE_REVOKED_CODES: Set<Files.FilePublishFailureCode>;
var FILE_PUBLISH_ERROR_CODE_MAP: Record<string, Files.FilePublishFailureCode>;
var FILE_SHA256_PATTERN: RegExp;
var normalizeFileSha256: (value: unknown) => string | null | undefined;
var FILE_SCOPE_PATH_PATTERN: RegExp;
var FILE_FETCH_TIMEOUT_MS: number;
var fileTextDecoder: TextDecoder;
async function getFilesPublishCapability(): Promise<FilesPublishCapability | null> {
  return (
    (await getOrLoadClaudeCapability(
      "artifact",
      supportsFilesPublish,
    )) ??
    (await getOrLoadClaudeCapability(
      "self",
      supportsFilesPublish,
    ))
  );
}
function parseFileShaListing(portValue: unknown) {
  if (!Array.isArray(portValue)) {
    return;
  }
  let entries: Files.ChangedFileRow[] = [];
  for (let portValueA of portValue as (PortRawListingValue | null)[]) {
    let portState = normalizeFileSha256(portValueA?.sha256);
    if (typeof portValueA?.path !== "string" || portState === undefined) {
      return;
    }
    entries.push({
      path: portValueA!.path as string,
      sha256: portState,
    });
  }
  return entries;
}
function parseFilePublishConflicts(portValueB: unknown) {
  if (!Array.isArray(portValueB)) {
    return;
  }
  let conflicts: NonNullable<Files.FilePublishFailure["paths"]> = [];
  for (let portValueC of portValueB as (PortRawListingValue | null)[]) {
    let portStateA = normalizeFileSha256(
      "actual" in (portValueC ?? {}) ? portValueC!.actual : portValueC?.liveSha,
    );
    if (typeof portValueC?.path !== "string" || portStateA === undefined) {
      return;
    }
    let portResult = normalizeFileSha256(portValueC!.expected);
    conflicts.push({
      path: portValueC!.path as string,
      liveSha: portStateA,
      ...(portResult !== undefined
        ? {
            expected: portResult,
          }
        : {}),
    });
  }
  return conflicts;
}
function normalizeFilesPublishError(
  error: unknown,
): Files.FilePublishFailure {
  let record =
      typeof error === "object" && error !== null
        ? (error as PublishErrorWire)
        : {},
    code =
      (typeof record.code === "string"
        ? FILE_PUBLISH_ERROR_CODE_MAP[record.code]
        : undefined) ?? "upstream_error",
    retryAfterMs =
      typeof record.retryAfterMs === "number"
        ? record.retryAfterMs
        : typeof record.retry_after_ms === "number"
          ? record.retry_after_ms
          : undefined,
    value = parseFilePublishConflicts(record.paths),
    portValueD = parseFileShaListing(record.changed);
  return {
    ok: false,
    code: code,
    ...(typeof record.live === "string"
      ? {
          live: record.live,
        }
      : {}),
    ...(retryAfterMs !== undefined
      ? {
          retryAfterMs: retryAfterMs,
        }
      : {}),
    ...(value !== undefined
      ? {
          paths: value,
        }
      : {}),
    ...(portValueD !== undefined
      ? {
          changed: portValueD,
        }
      : {}),
  };
}
function createBrowserFilesPort(portOptions: BrowserFilesPortOptions = {}) {
  let fetchFile =
      portOptions.fetch ?? ((portInput: string) => globalThis.fetch(portInput)),
    fetchFresh = portOptions.fetchFresh ?? fetchFile,
    freshReads: boolean = false,
    now = () => globalThis.performance?.now() ?? Date.now(),
    fetchWithReadTelemetry = async (portInputA: string): Promise<Response> => {
      let value: boolean = freshReads,
        portValueE = now();
      try {
        let portStateB = await (value ? fetchFresh : fetchFile)(portInputA);
        try {
          portOptions.onRead?.(portInputA, now() - portValueE, portStateB.status, value);
        } catch {}
        return portStateB;
      } catch (portStateC: unknown) {
        try {
          portOptions.onRead?.(portInputA, now() - portValueE, 0, value);
        } catch {}
        throw portStateC;
      }
    },
    resolvePublishCapability = portOptions.resolveNs ?? getFilesPublishCapability,
    pageLocation = portOptions.location ?? globalThis.location,
    version = portOptions.bootVersion ?? {
      version:
        FILE_SCOPE_PATH_PATTERN.exec(pageLocation?.pathname ?? "")?.[1] ?? "",
    },
    canWrite = portOptions.canWrite ?? true,
    bootFiles = portOptions.bootFiles,
    bootNarrowed: boolean = portOptions.bootNarrowed === true,
    listingNarrowed = false,
    listingCache: PortListingCache | undefined,
    heldFileShas: Map<string, string | null> = new Map(),
    publishedFileOverrides: Map<string, PublishedFileOverride | null> =
      new Map(),
    ownPublishedVersions: Set<string> = new Set(),
    publishGeneration = 0,
    maxRetainedVersions: number = 64,
    publishGenerationByVersion: Map<string, number> = new Map(),
    lastPublishedGenerationByPath: Map<string, number> = new Map(),
    fileReadCache: Map<string, Files.FileBytesRead> = new Map(),
    remoteChangeSubscribers: Set<(change: Files.FileRemoteChange) => void> =
      new Set(),
    listingEntryDiffers = (portInputB: Files.ChangedFileRow) => {
      let entry = publishedFileOverrides.get(portInputB.path);
      return (
        entry !== undefined &&
        !provisionalFileShas.has(portInputB.path) &&
        (entry === null ? null : entry.sha256) !== portInputB.sha256
      );
    },
    parseListingEntry = (
      portInputC: string,
      portOptionsA: PortRawListingValue | null | undefined,
    ) =>
      typeof portOptionsA?.sha256 === "string"
        ? {
            sha256: portOptionsA.sha256,
            size: typeof portOptionsA.size === "number" ? portOptionsA.size : 0,
            contentType:
              typeof portOptionsA.contentType === "string"
                ? portOptionsA.contentType
                : (fileMimeTypeFromPath(portInputC) ??
                  "application/octet-stream"),
          }
        : undefined;
  async function fetchListing(): Promise<{
    files: PortListingCache;
    narrowed: boolean;
  }> {
    let entries: PortListingCache = new Map();
    if (bootFiles !== undefined) {
      let portStateD: boolean = bootNarrowed,
        portResultA = Array.isArray(bootFiles)
          ? bootFiles.map(
              (
                portInputD: { path: string } & PortRawListingValue,
              ): [string, PortRawListingValue] => [portInputD.path, portInputD],
            )
          : Object.entries(bootFiles);
      for (let [portData, portValueF] of portResultA) {
        let portEntry = parseListingEntry(portData, portValueF);
        if (portEntry) {
          entries.set(portData, portEntry);
        }
      }
      return {
        files: entries,
        narrowed: portStateD,
      };
    }
    let value = await fetchWithReadTelemetry(FILE_LISTING_PATH);
    if (!value.ok) {
      throw {
        code: value.status === 404 ? "not_found" : "http",
        status: value.status,
        message: FILE_LISTING_PATH + ": HTTP " + String(value.status),
      };
    }
    let portValueG: PortRawListing | null = await value.json();
    if (
      portValueG === null ||
      typeof portValueG !== "object" ||
      portValueG.files === null ||
      typeof portValueG.files !== "object" ||
      Array.isArray(portValueG.files)
    ) {
      throw {
        code: "http",
        status: value.status,
        malformed: true,
        message: FILE_LISTING_PATH + ": no files object",
      };
    }
    if (typeof portValueG.ver === "string" && version.version === "") {
      version = {
        version: portValueG.ver,
      };
    }
    let files = portValueG.files;
    for (let [portStateE, portResultB] of Object.entries(files)) {
      let portDataA = parseListingEntry(portStateE, portResultB);
      if (portDataA) {
        entries.set(portStateE, portDataA);
      }
    }
    return {
      files: entries,
      narrowed: portValueG.narrowed === true,
    };
  }
  function overlayPublishedFiles(portInputE: PortListingCache): void {
    for (let [value, portValueH] of publishedFileOverrides) {
      if (portValueH === null) {
        portInputE.delete(value);
      } else {
        portInputE.set(value, {
          sha256: portValueH.sha256,
          size: portValueH.bytes.length,
          contentType: portValueH.contentType,
        });
      }
    }
  }
  async function readListing(
    portInputF: boolean = false,
  ): Promise<PortListingCache> {
    let value = listingGeneration;
    if (portInputF && canWrite && bootNarrowed) {
      bootFiles = undefined;
      bootNarrowed = false;
    }
    let portValueI = await fetchListing();
    if (portInputF && canWrite && portValueI.narrowed) {
      throw {
        code: "http",
        status: 403,
        narrowed: true,
        message: FILE_LISTING_PATH + ": marked as narrowed",
      };
    }
    let portStateF = Object.defineProperty(portValueI.files, "narrowed", {
      value: portValueI.narrowed,
    });
    overlayPublishedFiles(portStateF);
    if (
      value === listingGeneration &&
      !(
        canWrite &&
        portValueI.narrowed &&
        listingCache !== undefined &&
        !listingNarrowed
      )
    ) {
      listingCache = portStateF;
      listingNarrowed = portValueI.narrowed;
      listingCacheGeneration = listingGeneration;
    }
    return portStateF;
  }
  let listingReadPromise:
      | { at: number; p: Promise<PortListingCache | void> }
      | undefined,
    lastUnavailableListingGeneration = -1;
  function ensureListing() {
    let value = listingGeneration;
    if (!canWrite && lastUnavailableListingGeneration === value) {
      return Promise.resolve(undefined);
    }
    if (listingReadPromise?.at === value) {
      return listingReadPromise.p;
    }
    let state = {
      at: value,
      p: readListing()
        .catch((portInputG: unknown): void => {
          let portValueJ: unknown = (portInputG as FileRetryError | null)?.status;
          if (!canWrite && (portValueJ === 401 || portValueJ === 403)) {
            lastUnavailableListingGeneration = value;
          }
          return;
        })
        .finally((): void => {
          if (listingReadPromise === state) {
            listingReadPromise = undefined;
          }
        }),
    };
    listingReadPromise = state;
    return state.p;
  }
  let currentFrameVersion = () =>
    FILE_SCOPE_PATH_PATTERN.exec(pageLocation?.pathname ?? "")?.[1];
  function checkReadRedirect(
    portInputH: Response,
    portOptionsB: string,
    portValueK: string | undefined,
  ): void {
    if (
      portInputH.redirected !== true ||
      !freshReads ||
      !canWrite ||
      portValueK === undefined
    ) {
      return;
    }
    let value: string | undefined;
    try {
      value = FILE_SCOPE_PATH_PATTERN.exec(
        new URL(portInputH.url ?? "", "https://page.invalid").pathname,
      )?.[1];
    } catch {
      value = undefined;
    }
    if (value !== undefined && value !== portValueK) {
      throw {
        code: "redirected",
        status: 403,
        redirectedTo: portInputH.url,
        message:
          portOptionsB +
          ": answered by a redirect to /_f/" +
          value +
          "/, not the version this page addresses (/_f/" +
          portValueK +
          "/); asked for again",
      };
    }
  }
  async function readFileBytes(
    portInputI: string,
    portOptionsC: boolean = false,
  ): Promise<Files.FileBytesRead & { raw: boolean }> {
    let entry = publishedFileOverrides.get(portInputI);
    if (entry === null) {
      throw {
        code: "not_found",
        status: 404,
        message: portInputI + ": deleted by this tab",
      };
    }
    if (entry !== undefined) {
      heldFileShas.set(portInputI, entry.sha256);
      return {
        bytes: entry.bytes,
        sha256: entry.sha256,
        contentType: entry.contentType,
        raw: false,
      };
    }
    let portValueL = fileReadCache.get(portInputI);
    if (
      portValueL !== undefined &&
      (listingCache?.get(portInputI)?.sha256 ?? portValueL.sha256) === portValueL.sha256
    ) {
      return {
        ...portValueL,
        raw: true,
      };
    }
    let value = currentFrameVersion(),
      [portValueM, portStateG] = await Promise.all([
        fetchWithReadTelemetry(encodeFileUrlPath(portInputI)),
        listingCache !== undefined
          ? Promise.resolve(listingCache)
          : ensureListing(),
      ]);
    if (!portOptionsC) {
      checkReadRedirect(portValueM, portInputI, value);
    }
    if (!portValueM.ok) {
      throw {
        code: portValueM.status === 404 ? "not_found" : "http",
        status: portValueM.status,
        message: portInputI + ": HTTP " + String(portValueM.status),
      };
    }
    let portResultC = new Uint8Array(await portValueM.arrayBuffer()),
      portDataB = portStateG?.get(portInputI),
      portValueN = portDataB?.sha256 ?? "",
      portEntryA =
        portDataB?.contentType ??
        portValueM.headers?.get("content-type")?.split(";")[0]?.trim() ??
        fileMimeTypeFromPath(portInputI) ??
        "application/octet-stream";
    return {
      bytes: portResultC,
      sha256: portValueN,
      contentType: portEntryA,
      raw: true,
    };
  }
  let publishSupportsDelete: boolean = false,
    provisionalFileShas = new Set(),
    publishChain: Promise<unknown> = Promise.resolve(),
    listingGeneration = 0,
    listingCacheGeneration = 0,
    remoteVersionGeneration = 0,
    hotChangeGeneration = 0;
  function enqueuePublish(
    portInputJ: Files.FilePublishEntries,
    portOptionsD?: Files.FilePublishPreconditions,
  ) {
    let value = remoteVersionGeneration,
      portValueO = publishChain.then(() => publish(portInputJ, portOptionsD, value));
    publishChain = portValueO.catch((): void => {
      return;
    });
    return portValueO;
  }
  async function publish(
    portInputK: Files.FilePublishEntries,
    portOptionsE: Files.FilePublishPreconditions | undefined,
    portValueP: number,
  ): Promise<Files.FilePublishResult> {
    if (canWrite && (listingCache === undefined || listingNarrowed)) {
      await Promise.race([
        readListing().catch((): void => {
          return;
        }),
        new Promise<void>(
          (portInputL: () => void) =>
            void setTimeout(portInputL, FILE_FETCH_TIMEOUT_MS),
        ),
      ]);
    }
    if (!canWrite || listingNarrowed) {
      return {
        ok: false,
        code: "not_writer",
      };
    }
    let value = validateFilePublishBatch(portInputK);
    if (value) {
      return value;
    }
    if (
      portValueP !== remoteVersionGeneration &&
      portOptionsE?.ifMatch !== undefined
    ) {
      return {
        ok: false,
        code: "conflict",
        live: version.version,
      };
    }
    let portValueQ = await resolvePublishCapability();
    if (portValueQ === null) {
      canWrite = false;
      return {
        ok: false,
        code: "capability_disabled",
      };
    }
    let portStateH = Object.keys(portInputK).flatMap((portInputM: string) => {
      let entry = publishedFileOverrides.get(portInputM),
        portValueR =
          portOptionsE?.ifMatch !== undefined &&
          Object.hasOwn(portOptionsE.ifMatch, portInputM)
            ? portOptionsE.ifMatch[portInputM]
            : undefined,
        portValueS =
          entry === undefined
            ? undefined
            : entry === null
              ? null
              : entry.sha256;
      if (
        portValueR === undefined ||
        portValueS === undefined ||
        provisionalFileShas.has(portInputM) ||
        portValueR === portValueS
      ) {
        return [];
      } else {
        return [
          {
            path: portInputM,
            liveSha: portValueS,
            expected: portValueR,
          },
        ];
      }
    });
    if (portStateH.length > 0) {
      return {
        ok: false,
        code: "conflict",
        live: version.version,
        paths: portStateH,
      };
    }
    let state: Record<string, NormalizedFilePublishInput | null> = {};
    for (let [portValueT, portValueU] of Object.entries(portInputK)) {
      state[portValueT] = normalizeFilePublishInput(
        portValueT,
        portValueU,
      ) as NormalizedFilePublishInput | null;
    }
    let portValueV: Record<string, PublishCapabilityEntry> = {},
      items: string[] = [],
      portResultD =
        portOptions.preconditions === undefined
          ? {
              writes: true,
              deletes: true,
            }
          : portOptions.preconditions === false
            ? {}
            : portOptions.preconditions,
      portDataC: boolean = portResultD.writes === true,
      portValueW = portDataC && portResultD.deletes === true;
    for (let [portValueX, portValueY] of Object.entries(state)) {
      let portValueZ =
          portOptionsE?.ifMatch !== undefined &&
          Object.hasOwn(portOptionsE.ifMatch, portValueX)
            ? portOptionsE.ifMatch[portValueX]
            : undefined,
        overrideSha256 = portValueZ;
      if (
        typeof overrideSha256 === "string" &&
        provisionalFileShas.has(portValueX) &&
        publishedFileOverrides.get(portValueX)?.sha256 === overrideSha256
      ) {
        overrideSha256 = undefined;
      }
      if (typeof overrideSha256 === "string" && !FILE_SHA256_PATTERN.test(overrideSha256)) {
        overrideSha256 = undefined;
      }
      if (portValueY !== null) {
        portValueV[portValueX] =
          portDataC && overrideSha256 !== undefined
            ? {
                ...portValueY,
                ifMatch: overrideSha256,
              }
            : portValueY;
      } else {
        portValueV[portValueX] =
          portValueW && publishSupportsDelete && typeof overrideSha256 === "string"
            ? {
                delete: true,
                ifMatch: overrideSha256,
              }
            : null;
      }
      let publishedEntry = portValueV[portValueX];
      if (
        portValueZ !== undefined &&
        (publishedEntry === null || publishedEntry === undefined || !("ifMatch" in publishedEntry))
      ) {
        items.push(portValueX);
      }
    }
    let entries: Map<
      string,
      { bytes: Uint8Array<ArrayBufferLike>; hash: string }
    > = new Map();
    for (let [filePath, fileEntry] of Object.entries(state)) {
      if (fileEntry !== null) {
        let portValue_ = await fileContentBytes(fileEntry.content);
        entries.set(filePath, {
          bytes: portValue_,
          hash: await sha256(portValue_),
        });
      }
    }
    if (
      portValueP !== remoteVersionGeneration &&
      portOptionsE?.ifMatch !== undefined
    ) {
      return {
        ok: false,
        code: "conflict",
        live: version.version,
      };
    }
    let currentVersion = version.version,
      portEntryB = hotChangeGeneration,
      portValuea: import("../contracts/files-core").FilePublishReply;
    try {
      portValuea = await portValueQ.publish(portValueV);
    } catch (portValueb: unknown) {
      try {
        portOptions.onPublishError?.(portValueb);
      } catch {}
      let portValuec = normalizeFilesPublishError(portValueb);
      if (FILE_PUBLISH_WRITE_REVOKED_CODES.has(portValuec.code)) {
        canWrite = false;
      }
      return portValuec;
    }
    let portValued: Record<string, string> = {},
      portValuee: boolean = hotChangeGeneration !== portEntryB,
      portItems: string[] = [];
    for (let [portValuef, portValueg] of Object.entries(state)) {
      if (portValueg === null) {
        heldFileShas.set(portValuef, null);
        if (!portValuee) {
          publishedFileOverrides.set(portValuef, null);
          listingCache?.delete(portValuef);
          provisionalFileShas.delete(portValuef);
        }
        continue;
      }
      let { bytes: entry, hash: portValueh } = entries.get(portValuef)!,
        portValuei = portValuea.shas?.[portValuef],
        portValuej = portValuei ?? portValueh;
      if (portValuei === undefined) {
        portItems.push(portValuef);
      }
      portValued[portValuef] = portValuej;
      heldFileShas.set(portValuef, portValuej);
      if (portValuee) {
        continue;
      }
      if (
        portValuei === undefined &&
        fileContentContainsRuntimeMarkers(portValueg)
      ) {
        provisionalFileShas.add(portValuef);
      } else {
        provisionalFileShas.delete(portValuef);
      }
      publishedFileOverrides.set(portValuef, {
        sha256: portValuej,
        bytes: entry,
        contentType: portValueg.contentType,
      });
      listingCache?.set(portValuef, {
        sha256: portValuej,
        size: entry.length,
        contentType: portValueg.contentType,
      });
    }
    bootFiles = undefined;
    if (!portValuee) {
      version = {
        version: portValuea.version,
        ...(typeof portValuea.seq === "number"
          ? {
              seq: portValuea.seq,
            }
          : {}),
      };
    }
    let portValuek =
      portValuea.shas !== undefined &&
      portValuea.shas !== null &&
      typeof portValuea.shas === "object" &&
      !Array.isArray(portValuea.shas);
    if (portValuek) {
      publishSupportsDelete = true;
    }
    let portValuel = parseFileShaListing(portValuea.changed);
    if (
      !(portValuel !== undefined
        ? portValuel.length > 0
        : portValuek && items.length === 0) &&
      !portValuee &&
      portValuea.unchanged !== true &&
      portValuea.version !== currentVersion
    ) {
      ownPublishedVersions.add(portValuea.version);
    }
    publishGeneration += 1;
    if (portValuea.unchanged !== true && portValuea.version !== currentVersion) {
      publishGenerationByVersion.set(portValuea.version, publishGeneration);
      if (publishGenerationByVersion.size > maxRetainedVersions) {
        publishGenerationByVersion.delete(
          publishGenerationByVersion.keys().next().value!,
        );
      }
    }
    for (let portValuem of Object.keys(state)) {
      lastPublishedGenerationByPath.set(portValuem, publishGeneration);
    }
    return {
      ok: true,
      version: portValuea.version,
      ...(typeof portValuea.seq === "number"
        ? {
            seq: portValuea.seq,
          }
        : {}),
      shas: portValued,
      ...(portItems.length > 0
        ? {
            computed: portItems,
          }
        : {}),
      ...(portValuea.unchanged === true
        ? {
            unchanged: true,
          }
        : {}),
      ...(portValuek && items.length === 0
        ? {
            preconditionsChecked: true,
          }
        : {}),
      ...(portValuek && items.length > 0
        ? {
            unguarded: items,
          }
        : {}),
      ...(portValuel !== undefined
        ? {
            changed: portValuel,
          }
        : {}),
    };
  }
  async function readFileText(
    portInputN: string,
    portOptionsF?: boolean,
  ): Promise<Files.FileTextRead> {
    let value = await readFileBytes(portInputN, portOptionsF),
      portValuen = fileTextDecoder.decode(value.bytes);
    if (value.raw && isHtmlFilePath(portInputN)) {
      portValuen = stripFrameRuntimeBlock(portValuen);
    }
    let portStateI =
      value.sha256 !== "" ? value.sha256 : await sha256(portValuen);
    heldFileShas.set(portInputN, portStateI);
    return {
      text: portValuen,
      sha256: portStateI,
    };
  }
  let listingToFiles = (portInputO: PortListingCache) => {
    let value = [...portInputO]
      .sort(
        (
          [portInputP]: [string, PortListingMetadata],
          [portOptionsG]: [string, PortListingMetadata],
        ): number => (portInputP < portOptionsG ? -1 : 1),
      )
      .map(([portInputQ, portInputR]: [string, PortListingMetadata]) => ({
        path: portInputQ,
        ...portInputR,
        ...(provisionalFileShas.has(portInputQ) &&
        publishedFileOverrides.get(portInputQ)?.sha256 === portInputR.sha256
          ? {
              provisional: true,
            }
          : {}),
      }));
    return Object.defineProperty(value, "narrowed", {
      value: portInputO.narrowed === true,
    });
  };
  return {
    get canWrite() {
      return canWrite && !listingNarrowed;
    },
    get narrowed() {
      return listingNarrowed;
    },
    get mayWrite() {
      return canWrite;
    },
    forgetBootListing(): void {
      bootFiles = undefined;
      bootNarrowed = false;
    },
    async listUnlessNarrowed(): Promise<Files.FileListing> {
      return listingToFiles(await readListing(true));
    },
    version: () => version,
    async list(): Promise<Files.FileListing> {
      return listingToFiles(await readListing());
    },
    async readBytes(portInputS: string): Promise<Files.FileBytesRead> {
      let value = await readFileBytes(portInputS),
        portValueo =
          value.sha256 !== ""
            ? value.sha256
            : await sha256(value.bytes);
      heldFileShas.set(portInputS, portValueo);
      return {
        bytes: value.bytes,
        sha256: portValueo,
        contentType: value.contentType,
      };
    },
    async peekBytes(portInputT: string): Promise<{
      bytes: Uint8Array<ArrayBufferLike>;
      sha256?: string;
      contentType: string;
    }> {
      let callback = () => {
          let portValuep = publishedFileOverrides.get(portInputT);
          if (portValuep === null) {
            throw {
              code: "not_found",
              status: 404,
              message: portInputT + ": deleted by this tab",
            };
          }
          if (portValuep === undefined) {
            return undefined;
          } else {
            return {
              bytes: portValuep.bytes.slice(),
              ...(provisionalFileShas.has(portInputT)
                ? {}
                : {
                    sha256: portValuep.sha256,
                  }),
              contentType: portValuep.contentType,
            };
          }
        },
        value = callback();
      if (value !== undefined) {
        return value;
      }
      let entry = fileReadCache.get(portInputT);
      if (
        entry !== undefined &&
        (listingCache?.get(portInputT)?.sha256 ?? entry.sha256) === entry.sha256
      ) {
        return {
          bytes: entry.bytes.slice(),
          sha256: entry.sha256,
          contentType: entry.contentType,
        };
      }
      let portValueq = listingGeneration,
        portStateJ = listingCache?.get(portInputT)?.sha256,
        portResultE = currentFrameVersion(),
        portDataD = await fetchWithReadTelemetry(
          encodeFileUrlPath(portInputT),
        );
      checkReadRedirect(portDataD, portInputT, portResultE);
      if (!portDataD.ok) {
        throw {
          code: portDataD.status === 404 ? "not_found" : "http",
          status: portDataD.status,
          message: portInputT + ": HTTP " + String(portDataD.status),
        };
      }
      let portValuer = new Uint8Array(await portDataD.arrayBuffer()),
        portEntryC = callback();
      if (portEntryC !== undefined) {
        return portEntryC;
      }
      let portValues = listingCache?.get(portInputT),
        portValuet =
          portValueq === listingGeneration &&
          listingCacheGeneration === listingGeneration &&
          portValues?.sha256 === portStateJ &&
          portStateJ !== ""
            ? portStateJ
            : undefined;
      return {
        bytes: portValuer,
        ...(portValuet !== undefined
          ? {
              sha256: portValuet,
            }
          : {}),
        contentType:
          portValues?.contentType ??
          portDataD.headers?.get("content-type")?.split(";")[0]?.trim() ??
          fileMimeTypeFromPath(portInputT) ??
          "application/octet-stream",
      };
    },
    peekRows: () =>
      listingCache === undefined ? undefined : listingToFiles(listingCache),
    readText: (portInputU: string) => readFileText(portInputU, false),
    readTextUnchecked: (portInputV: string) => readFileText(portInputV, true),
    publish: enqueuePublish,
    onRemoteChange(portInputW: (change: Files.FileRemoteChange) => void) {
      remoteChangeSubscribers.add(portInputW);
      return () => void remoteChangeSubscribers.delete(portInputW);
    },
    liveSha: (portInputX: string) => {
      if (listingCache === undefined) {
        return publishedFileOverrides.get(portInputX)?.sha256;
      }
      let value = listingCache.get(portInputX)?.sha256;
      if (value === "") {
        return undefined;
      } else {
        return value ?? (listingNarrowed ? undefined : null);
      }
    },
    heldSha: (portInputY: string) => heldFileShas.get(portInputY),
    olderThanMyWrite: (portInputZ: string, portOptionsH: string) => {
      let entry = publishGenerationByVersion.get(portInputZ),
        portValueu = lastPublishedGenerationByPath.get(portOptionsH);
      return entry !== undefined && portValueu !== undefined && portValueu > entry;
    },
    wroteSinceAdopt: (filePath: string) =>
      publishedFileOverrides.get(filePath) !== undefined &&
      publishedFileOverrides.get(filePath) !== null,
    knownListing: () =>
      new Map(
        [...(listingCache ?? [])].map(
          ([filePath, metadata]: [string, PortListingMetadata]) => [
            filePath,
            metadata.sha256,
          ],
        ),
      ),
    primeRead(filePath: string, portOptionsI: Files.FileBytesRead): void {
      if (publishedFileOverrides.has(filePath)) {
        return;
      }
      fileReadCache.set(filePath, portOptionsI);
      if (listingCache !== undefined && portOptionsI.sha256 !== "") {
        listingCache.set(filePath, {
          sha256: portOptionsI.sha256,
          size: portOptionsI.bytes.length,
          contentType: portOptionsI.contentType,
        });
      }
    },
    noteIncoming(portInput_: Files.ChangedFileRow[]): void {
      for (let value of portInput_) {
        if (listingEntryDiffers(value)) {
          continue;
        }
        if (value.sha256 === null) {
          heldFileShas.delete(value.path);
          fileReadCache.delete(value.path);
          listingCache?.delete(value.path);
          continue;
        }
        if (listingCache !== undefined) {
          let entry = listingCache.get(value.path);
          if (entry?.sha256 !== value.sha256) {
            listingCache.set(value.path, {
              sha256: value.sha256,
              size: 0,
              contentType:
                entry?.contentType ??
                fileMimeTypeFromPath(value.path) ??
                "application/octet-stream",
            });
          }
        }
      }
      listingCacheGeneration = listingGeneration;
    },
    noteAdopted(fileVersion: Files.FileVersion): void {
      freshReads = true;
      listingGeneration += 1;
      if (
        ownPublishedVersions.has(fileVersion.version) &&
        listingCacheGeneration === listingGeneration - 1
      ) {
        listingCacheGeneration = listingGeneration;
      }
      fileReadCache.clear();
      bootFiles = undefined;
      if (!ownPublishedVersions.has(fileVersion.version)) {
        let entry = publishGenerationByVersion.get(fileVersion.version);
        for (let [value, portValuev] of [...publishedFileOverrides]) {
          if (
            entry !== undefined &&
            (lastPublishedGenerationByPath.get(value) ?? 0) > entry
          ) {
            continue;
          }
          if (listingCache !== undefined && portValuev !== null) {
            listingCache.set(value, {
              sha256: "",
              size: listingCache.get(value)?.size ?? 0,
              contentType:
                listingCache.get(value)?.contentType ??
                fileMimeTypeFromPath(value) ??
                "application/octet-stream",
            });
          }
          publishedFileOverrides.delete(value);
          provisionalFileShas.delete(value);
        }
        if (entry !== undefined && listingCache !== undefined) {
          for (let [value, portValuew] of lastPublishedGenerationByPath) {
            if (
              portValuew >= entry &&
              !publishedFileOverrides.has(value) &&
              listingCache.has(value)
            ) {
              listingCache.set(value, {
                sha256: "",
                size: listingCache.get(value)?.size ?? 0,
                contentType:
                  listingCache.get(value)?.contentType ??
                  fileMimeTypeFromPath(value) ??
                  "application/octet-stream",
              });
            }
          }
        }
        for (let value of [...ownPublishedVersions]) {
          if (
            entry === undefined ||
            (publishGenerationByVersion.get(value) ?? 0) <= entry
          ) {
            ownPublishedVersions.delete(value);
          }
        }
        remoteVersionGeneration += 1;
        if (entry === undefined) {
          hotChangeGeneration += 1;
        }
      }
      version = fileVersion;
    },
    noteRemote(portInputa: Files.FileRemoteChange): void {
      let value = portInputa.changed.filter(
        (portInputb: Files.ChangedFileRow): boolean =>
          listingEntryDiffers(portInputb) === false,
      );
      for (let portStateK of value) {
        if (listingCache !== undefined) {
          if (portStateK.sha256 === null) {
            listingCache.delete(portStateK.path);
          } else {
            let entry = listingCache.get(portStateK.path);
            listingCache.set(portStateK.path, {
              sha256: portStateK.sha256,
              size: entry?.sha256 === portStateK.sha256 ? entry.size : 0,
              contentType:
                entry?.contentType ??
                fileMimeTypeFromPath(portStateK.path) ??
                "application/octet-stream",
            });
          }
        }
      }
      let portValuex =
        value.length === portInputa.changed.length
          ? portInputa
          : {
              ...portInputa,
              changed: value,
            };
      for (let portStateL of [...remoteChangeSubscribers]) {
        try {
          portStateL(portValuex);
        } catch {}
      }
    },
  };
}
export {
  createBrowserFilesPort,
  FILE_FETCH_TIMEOUT_MS,
  FILE_LISTING_PATH,
  FILE_PUBLISH_ERROR_CODE_MAP,
  FILE_PUBLISH_WRITE_REVOKED_CODES,
  FILE_SCOPE_PATH_PATTERN,
  FILE_SHA256_PATTERN,
  fileTextDecoder,
  getFilesPublishCapability,
  normalizeFileSha256,
  normalizeFilesPublishError,
  parseFilePublishConflicts,
  parseFileShaListing,
  supportsFilesPublish,
};
export function installFilesBrowserPort(): () => void {
  return () => {
    FILE_LISTING_PATH = "_files.json";
    supportsFilesPublish = capabilityHasMethod("publish") as (
      value: unknown,
    ) => value is FilesPublishCapability;
    FILE_PUBLISH_WRITE_REVOKED_CODES = new Set([
      "not_writer",
      "not_declared",
      "capability_disabled",
    ]);
    FILE_PUBLISH_ERROR_CODE_MAP = {
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
    FILE_SHA256_PATTERN = /^[0-9a-f]{64}$/;
    normalizeFileSha256 = (portInputc: unknown) =>
      portInputc === null
        ? null
        : typeof portInputc === "string" && FILE_SHA256_PATTERN.test(portInputc)
          ? portInputc
          : undefined;
    FILE_SCOPE_PATH_PATTERN = /\/_f\/([^/]+)\//;
    FILE_FETCH_TIMEOUT_MS = 1e4;
    fileTextDecoder = new TextDecoder();
  };
}
