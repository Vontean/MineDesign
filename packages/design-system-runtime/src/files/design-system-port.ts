/** Restored application module; prepare first, initialize in original order. */
import type * as Migration from "../contracts/migration";
import type * as Model from "../contracts";
import type * as Files from "../contracts/files-core";
import { explainUnpublishableFile, isTextMimeType, publishableFileMimeType, relativeProjectFilePath } from "../editor/files-index";
import { sha256 } from "../editor/index-file-store";
import { bytesToFileDataUri, decodeHeldFileDataUri } from "./data-uri";
import { lazyFileReadMode, updateLazyReadListing } from "./lazy-reads";
import { FILE_BINARY_MIME_TYPES, filePublishRejection } from "./paths";
import { assetKindForPath, canUseHeldFilePointer, filePointer, isHeldFilePointer, isTextFilePath } from "../model/file-policy";

var DAMAGED_FILE_REPLACEMENT_CHARACTER: string;
var isBinaryProjectFilePath: (path: string) => boolean;
var isDownloadOnlyPublishInput: (input: Model.FilePublishInput) => boolean;
var fileMayStayByReference: (
  path: string,
  relative: string,
  lazy?: Files.LazyReadState,
) => boolean;
function createDesignSystemFilesPort(
  port: Model.BrowserFilesPort,
  portOptions: Migration.DesignSystemPortOptions = {},
): Migration.DesignSystemFilesPort {
  let extensions = port,
    lazy = portOptions.lazy,
    downloadsRefused = false,
    listingRequestId: number = 0,
    lastListingResponseId = 0,
    lastPublishedVersion = "",
    convertPublishInput = (
      portInput: string,
      portOptionsA: Model.FilePublishInput,
    ):
      | "held"
      | "untyped"
      | "unreadable"
      | {
          value: Model.FilePublishInput;
          bytes?: Uint8Array<ArrayBuffer>;
        } => {
      let value = relativeProjectFilePath(portInput);
      if (
        portOptionsA === null ||
        value === undefined ||
        typeof portOptionsA !== "string"
      ) {
        return {
          value: portOptionsA,
        };
      }
      if (isHeldFilePointer(value, portOptionsA)) {
        return "held";
      }
      let portValue = publishableFileMimeType(value, portOptionsA);
      if (portValue === null) {
        return "untyped";
      }
      if (isTextFilePath(value)) {
        return {
          value: {
            content: portOptions.wireText?.(portInput, portOptionsA) ?? portOptionsA,
            contentType: portValue,
          },
        };
      }
      let portState = decodeHeldFileDataUri(portOptionsA);
      if (portState === null) {
        return "unreadable";
      }
      return {
        value: isTextMimeType(portValue)
          ? {
              content: new TextDecoder("utf-8", {
                ignoreBOM: true,
              }).decode(portState.bytes),
              contentType: portValue,
            }
          : {
              content: new Blob([portState.bytes], {
                type: portValue,
              }),
              contentType: portValue,
            },
        bytes: portState.bytes,
      };
    },
    referenceSha = (portInputA: string) => {
      let value = relativeProjectFilePath(portInputA);
      if (
        value === undefined ||
        !fileMayStayByReference(portInputA, value, lazy) ||
        extensions.wroteSinceAdopt?.(portInputA) !== false
      ) {
        return;
      }
      let portValueA = extensions.liveSha?.(portInputA);
      if (
        lazy !== undefined &&
        isTextFilePath(value) &&
        lazy.rows.get(portInputA)?.sha256 !== portValueA
      ) {
        return;
      }
      if (typeof portValueA === "string" && portValueA !== "") {
        return portValueA;
      } else {
        return undefined;
      }
    },
    entryProblemDetail = (
      portInputB: string,
      portOptionsB: Model.FilePublishInput,
    ): Migration.PublishProblem | undefined => {
      let value = convertPublishInput(portInputB, portOptionsB);
      if (value === "held") {
        if (extensions.liveSha?.(portInputB) === null) {
          return {
            why: "its published copy is missing; add the file again",
            cause: "gone",
          };
        } else {
          return undefined;
        }
      }
      if (value === "unreadable") {
        return {
          why: "its contents could not be read; add the file again",
          cause: "unreadable",
        };
      }
      if (value === "untyped") {
        return (
          explainUnpublishableFile(
            relativeProjectFilePath(portInputB),
            portOptionsB as string,
          ) ?? {
            why: "files of this kind cannot be saved here. Use another format",
            cause: "kind",
          }
        );
      }
      if (downloadsRefused && isDownloadOnlyPublishInput(value.value)) {
        return {
          why: "Word, PowerPoint, Excel, zip and .fig files cannot be saved here at the moment. Keep your own copy of it; to try again later, reload this page and add it again",
          cause: "kind",
          forNow: true,
        };
      }
      if (
        value.value !== null &&
        typeof value.value === "object" &&
        (value.value as { contentType?: unknown }).contentType ===
          "application/zip+dotlottie"
      ) {
        return {
          why: "a packed .lottie archive cannot be saved here yet. Export the animation as Lottie JSON instead",
          cause: "kind",
        };
      }
      return filePublishRejection(portInputB, value.value);
    },
    adapter: Migration.DesignSystemFilesPort = {
      list: () => {
        if (lazy === undefined) {
          return port.list();
        }
        let value = ++listingRequestId;
        return port.list().then((portInputC) => {
          if (value > lastListingResponseId) {
            lastListingResponseId = value;
            updateLazyReadListing(lazy, portInputC);
          }
          return portInputC;
        });
      },
      readBytes: (portInputD) => port.readBytes(portInputD),
      answersByReference: (portInputE) =>
        referenceSha(portInputE) !== undefined ||
        (lazy !== undefined &&
          lazyFileReadMode(lazy, portInputE) === "skipped"),
      async readText(portInputF: string): Promise<Model.FileTextRead> {
        if (
          !isBinaryProjectFilePath(portInputF) &&
          referenceSha(portInputF) === undefined
        ) {
          let portData = await port.readText(portInputF),
            portValueB =
              portOptions.tableText === undefined
                ? portData
                : {
                    text: portOptions.tableText(portInputF, portData.text),
                    sha256: portData.sha256,
                  };
          try {
            portOptions.onReadText?.(portInputF, portValueB.text, portValueB.sha256);
          } catch {}
          return portValueB;
        }
        let value = referenceSha(portInputF);
        if (value !== undefined) {
          try {
            portOptions.onReadText?.(portInputF, filePointer(), value);
          } catch {}
          return {
            text: filePointer(),
            sha256: value,
          };
        }
        let portValueC = await port.readBytes(portInputF),
          portStateA =
            publishableFileMimeType(
              relativeProjectFilePath(portInputF),
            ) ?? "application/octet-stream",
          portResult = bytesToFileDataUri(portValueC.bytes, portStateA);
        try {
          portOptions.onReadText?.(portInputF, portResult, portValueC.sha256);
        } catch {}
        return {
          text: portResult,
          sha256: portValueC.sha256,
        };
      },
      async publish(
        portInputG: Model.FilePublishEntries,
        portOptionsC?: Model.FilePublishPreconditions,
      ): Promise<Model.FilePublishResult> {
        if (lazy !== undefined) {
          return {
            ok: false,
            code: "not_writer",
          };
        }
        let state: Model.FilePublishEntries = {},
          portValueD: Record<string, Promise<string>> = {},
          portValueE: Record<string, string> = {},
          items: string[] = [];
        for (let [portStateB, portResultA] of Object.entries(portInputG)) {
          let portDataA = convertPublishInput(portStateB, portResultA);
          if (portDataA === "held") {
            let portValueF = extensions.liveSha?.(portStateB),
              portValueG = portOptionsC?.ifMatch?.[portStateB];
            if (typeof portValueF === "string" && portValueF !== "") {
              portValueE[portStateB] = portValueF;
            } else if (portValueF !== null && typeof portValueG === "string") {
              portValueE[portStateB] = portValueG;
            }
            items.push(portStateB);
            continue;
          }
          if (portDataA === "untyped" || portDataA === "unreadable") {
            return {
              ok: false,
              code: "invalid_content",
            };
          }
          state[portStateB] = portDataA.value;
          if (portDataA.bytes !== undefined) {
            portValueD[portStateB] = sha256(portDataA.bytes);
          }
        }
        let portValueH: Record<string, string | null> = {};
        for (let [portStateC, portResultB] of Object.entries(portInputG)) {
          if (
            (portResultB === null || typeof portResultB === "string") &&
            !items.includes(portStateC)
          ) {
            portValueH[portStateC] = portResultB;
          }
        }
        try {
          portOptions.onSend?.(portValueH);
        } catch {}
        let value: Model.FilePublishResult =
          items.length > 0 && Object.keys(state).length === 0
            ? {
                ok: true,
                version: lastPublishedVersion,
                unchanged: true,
                shas: {},
              }
            : await port.publish(state, portOptionsC);
        if (
          value.ok &&
          Object.keys(state).length > 0 &&
          value.version !== ""
        ) {
          lastPublishedVersion = value.version;
        }
        let portValueI =
          value.ok && value.shas !== undefined
            ? {
                ...value,
                shas: {
                  ...portValueE,
                  ...value.shas,
                },
              }
            : value;
        if (!portValueI.ok && portValueI.code === "invalid_content") {
          let portStateD = Object.values(state).some(isDownloadOnlyPublishInput);
          if (portStateD && !downloadsRefused) {
            try {
              portOptions.onDownloadsRefused?.();
            } catch {}
          }
          downloadsRefused = portStateD;
        }
        let callback = (portInputH?: Record<string, string>): void => {
          try {
            portOptions.onPublish?.({
              paths: Object.keys(state),
              ok: portValueI.ok,
              ...(items.length > 0
                ? {
                    held: items,
                  }
                : {}),
              ...(portValueI.ok
                ? {
                    version: portValueI.version,
                    texts: portValueH,
                    ...(portInputH !== undefined
                      ? {
                          shas: portInputH,
                        }
                      : {}),
                  }
                : {
                    code: portValueI.code,
                  }),
            });
          } catch {}
        };
        if (!portValueI.ok || portValueI.shas !== undefined) {
          callback(portValueI.ok ? portValueI.shas : undefined);
          return portValueI;
        }
        let portValueJ = {
          ...portValueE,
        };
        for (let [portStateE, portResultC] of Object.entries(portValueD)) {
          portValueJ[portStateE] = await portResultC;
        }
        for (let [portStateF, portResultD] of Object.entries(state)) {
          if (portResultD !== null && portValueJ[portStateF] === undefined) {
            portValueJ[portStateF] = await sha256(
              (
                new TextEncoder().encode as (
                  portInputG: unknown,
                ) => Uint8Array<ArrayBuffer>
              )(
                typeof portResultD === "string"
                  ? portResultD
                  : (portResultD as { content?: unknown }).content,
              ),
            );
          }
        }
        callback(portValueJ);
        return {
          ...portValueI,
          shas: portValueJ,
        };
      },
      onRemoteChange: (portInputI) => port.onRemoteChange(portInputI),
      get canWrite() {
        return port.canWrite;
      },
      get narrowed() {
        return port.narrowed;
      },
      get mayWrite() {
        return port.mayWrite;
      },
      version: () => port.version(),
      entryProblem: (portInputJ, portOptionsD) =>
        entryProblemDetail(portInputJ, portOptionsD)?.why,
      entryProblemDetail: entryProblemDetail,
    };
  if (typeof extensions.liveSha === "function") {
    adapter.liveSha = (portInputK) => extensions.liveSha!(portInputK);
  }
  if (typeof extensions.heldSha === "function") {
    adapter.heldSha = (portInputL) => extensions.heldSha!(portInputL);
  }
  if (typeof extensions.noteRemote === "function") {
    adapter.noteRemote = (portInputM) => extensions.noteRemote!(portInputM);
  }
  if (typeof extensions.noteAdopted === "function") {
    adapter.noteAdopted = (portInputN, portOptionsE) =>
      extensions.noteAdopted!(portInputN, portOptionsE);
  }
  if (typeof extensions.knownListing === "function") {
    adapter.knownListing = () => extensions.knownListing!();
  }
  if (typeof extensions.forgetBootListing === "function") {
    adapter.forgetBootListing = () => extensions.forgetBootListing!();
  }
  if (typeof extensions.listUnlessNarrowed === "function") {
    adapter.listUnlessNarrowed = () => extensions.listUnlessNarrowed!();
  }
  if (typeof extensions.primeRead === "function") {
    adapter.primeRead = (portInputO, portOptionsF) =>
      extensions.primeRead!(portInputO, portOptionsF);
  }
  if (typeof extensions.noteIncoming === "function") {
    adapter.noteIncoming = (portInputP) => extensions.noteIncoming!(portInputP);
  }
  if (typeof extensions.olderThanMyWrite === "function") {
    adapter.olderThanMyWrite = (portInputQ, portOptionsG) =>
      extensions.olderThanMyWrite!(portInputQ, portOptionsG);
  }
  if (typeof extensions.wroteSinceAdopt === "function") {
    adapter.wroteSinceAdopt = (portInputR) => extensions.wroteSinceAdopt!(portInputR);
  }
  return adapter;
}
export {
  createDesignSystemFilesPort,
  DAMAGED_FILE_REPLACEMENT_CHARACTER,
  fileMayStayByReference,
  isBinaryProjectFilePath,
  isDownloadOnlyPublishInput,
};
export function installFilesDesignSystemPort(): () => void {
  return () => {
    DAMAGED_FILE_REPLACEMENT_CHARACTER = String.fromCharCode(65533);
    isBinaryProjectFilePath = (portInputS) => {
      let value = relativeProjectFilePath(portInputS);
      return value !== undefined && !isTextFilePath(value);
    };
    isDownloadOnlyPublishInput = (portInputT) =>
      portInputT !== null &&
      typeof portInputT === "object" &&
      !(portInputT instanceof Blob) &&
      FILE_BINARY_MIME_TYPES.has(portInputT.contentType ?? "");
    fileMayStayByReference = (portInputU, portOptionsH, portValueK) =>
      canUseHeldFilePointer(portOptionsH) &&
      (portValueK === undefined
        ? assetKindForPath(portOptionsH) !== "video"
        : lazyFileReadMode(portValueK, portInputU) === "held");
  };
}
