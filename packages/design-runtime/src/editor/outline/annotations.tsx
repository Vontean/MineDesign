import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeNpm_usehooks_ts_p0, load_react } from "../../dependencies";
import { parseNoteBlocks } from "../notes/blocks";
import { unescapeNoteText } from "../notes/dom";
import { parseNoteInlineMarkdown } from "../notes/inline-markdown";
import { OutlineNativeMenuLabelGlyphConfig as elementLabelGlyph, OutlineNativeMenuVideoLabelGlyphConfig as videoLabelGlyph, OutlineNativeMenuLimit, OutlineNativeMenuReplace, OutlineNativeMenuSlice, OutlineNativeMenuTitle1RectOvalConfig } from "./native-menu";
import { toModuleNamespace } from "../../module-helpers";

var OutlineAnnotationsSlice: Dynamic;
var ViewOnlyYouCanInspectThisMessage: Dynamic;
var OutlineAnnotationsLabel: Dynamic;
var ADrawnLineOrPathCannotMessage: Dynamic;
var reactOutlineAnnotations: Dynamic;
var OutlineAnnotationsIsWorkerConfig: Dynamic;
var OutlineAnnotationsIsWorkerOnOmEventRoundtripConfig: Dynamic;
var OutlineAnnotationsResolvedValue: Dynamic;
function annotationFirstTextLine(source?: Dynamic): Dynamic {
  if (source.kind === "title1")
    return (
      unescapeNoteText(source.text).trim().split(`
`)[0] ?? ""
    );
  let firstBlock: Dynamic = parseNoteBlocks(source.text.trim())[0],
    firstLineMarkdown: Dynamic =
      firstBlock == null
        ? ""
        : firstBlock.kind === "p"
          ? firstBlock.text
          : (firstBlock.items[0] ?? "");
  return parseNoteInlineMarkdown(firstLineMarkdown, {
    escapes: true,
    literalUnsafeLinks: true,
  })
    .map((token?: Dynamic): Dynamic => token.text)
    .join("");
}
function annotationOutlineDetail(source?: Dynamic): Dynamic {
  if (source.kind === "image") {
    let altText: Dynamic = OutlineNativeMenuReplace(
      source.alt ?? "",
    );
    return altText
      ? {
          detail: OutlineAnnotationsSlice(altText),
          ...(altText.length > OutlineNativeMenuLimit
            ? {
                detailTitle: altText,
              }
            : {}),
        }
      : {};
  }
  if (!("text" in source)) return {};
  let firstLine: Dynamic = annotationFirstTextLine(source).trim();
  return firstLine
    ? {
        detail: `\u201C${OutlineNativeMenuSlice(firstLine)}\u201D`,
      }
    : {};
}
function annotationOutlineNode(source?: Dynamic): Dynamic {
  let nodeStyle: Dynamic =
    source.kind === undefined
      ? elementLabelGlyph
      : source.kind === "image" && source.video !== undefined
        ? videoLabelGlyph
        : OutlineNativeMenuTitle1RectOvalConfig[source.kind];
  return {
    id: source.id,
    label: nodeStyle.label,
    glyph: nodeStyle.glyph,
    ...annotationOutlineDetail(source),
  };
}
function reconcileAnnotationOutline(
  annotations?: Dynamic,
  rowCache?: Dynamic,
): Dynamic {
  let currentIds: Dynamic = new Set(),
    rows: Dynamic = annotations.map((source?: Dynamic): Dynamic => {
      currentIds.add(source.id);
      let cacheKey: Dynamic =
          source.kind === "image"
            ? (source.video !== undefined ? "video:" : "") +
              (source.alt ?? "")
            : "text" in source
              ? source.text
              : undefined,
        entry: Dynamic = rowCache.get(source.id);
      if (entry && entry.kind === source.kind && entry.text === cacheKey)
        return entry.row;
      let row: Dynamic = annotationOutlineNode(source);
      rowCache.set(source.id, {
        kind: source.kind,
        text: cacheKey,
        row: row,
      });
      return row;
    });
  for (let cachedId of rowCache.keys() as Dynamic)
    currentIds.has(cachedId) || rowCache.delete(cachedId);
  return rows;
}
export {
  ADrawnLineOrPathCannotMessage,
  annotationFirstTextLine,
  annotationOutlineDetail,
  annotationOutlineNode,
  OutlineAnnotationsIsWorkerConfig,
  OutlineAnnotationsIsWorkerOnOmEventRoundtripConfig,
  OutlineAnnotationsLabel,
  OutlineAnnotationsResolvedValue,
  OutlineAnnotationsSlice,
  reactOutlineAnnotations,
  reconcileAnnotationOutline,
  ViewOnlyYouCanInspectThisMessage,
};
export function installEditorOutlineAnnotations(): () => void {
  return () => {
    OutlineAnnotationsSlice = (items?: Dynamic): Dynamic =>
      items.length > OutlineNativeMenuLimit
        ? `${items.slice(0, 13)}\u2026${items.slice(-12)}`
        : items;
    ViewOnlyYouCanInspectThisMessage =
      uiMessage("inspector.annotations.viewOnlyYouCanInspect");
    OutlineAnnotationsLabel = uiMessage("inspector.annotations.selectAnElementFirst");
    ADrawnLineOrPathCannotMessage =
      uiMessage("inspector.annotations.aDrawnLineOrPath");
    reactOutlineAnnotations = toModuleNamespace(
      load_react(),
      1,
    );
    initializeNpm_usehooks_ts_p0();
    OutlineAnnotationsIsWorkerConfig = {
      isWorker: false,
      emitOmEvent(eventName: Dynamic, eventDetail: Dynamic): Dynamic {
        (window as Dynamic).dispatchEvent(
          new CustomEvent(eventName, {
            detail: eventDetail,
          }),
        );
      },
      onOmEvent(eventName: Dynamic, handler: Dynamic): Dynamic {
        let handleEvent: Dynamic = (event?: Dynamic): Dynamic =>
          handler(event.detail);
        (window as Dynamic).addEventListener(eventName, handleEvent);
        return (): Dynamic =>
          (window as Dynamic).removeEventListener(eventName, handleEvent);
      },
      roundtrip(request: Dynamic): Dynamic {
        return new Promise((resolve?: Dynamic): Dynamic => {
          let handleAbort: Dynamic = (): Dynamic => {
            cleanup();
            resolve({
              ok: false,
              error: "Aborted",
            });
          };
          function cleanup(): Dynamic {
            clearTimeout(timeoutId);
            (window as Dynamic).removeEventListener(
              request.responseEvent,
              handleResponse,
            );
            request.signal?.removeEventListener("abort", handleAbort);
          }
          let timeoutId: Dynamic = setTimeout((): Dynamic => {
            cleanup();
            resolve({
              ok: false,
              error: request.timeoutError,
            });
          }, request.timeout);
          function handleResponse(event?: Dynamic): Dynamic {
            let detail: Dynamic = event.detail;
            if (request.filter && !request.filter(detail)) return;
            cleanup();
            let rejection: Dynamic = request.reject?.(detail);
            resolve(
              rejection
                ? {
                    ok: false,
                    error: rejection,
                  }
                : {
                    ok: true,
                    value: request.extract(detail),
                  },
            );
          }
          (window as Dynamic).addEventListener(request.responseEvent, handleResponse);
          request.signal?.addEventListener("abort", handleAbort, {
            once: true,
          });
          (window as Dynamic).dispatchEvent(
            new CustomEvent(request.dispatch.name, {
              detail: request.dispatch.detail,
            }),
          );
        });
      },
      execToolInTab(): Dynamic {
        return Promise.reject(new Error("execToolInTab called from tab host"));
      },
      mirrorPreviewFile(): Dynamic {},
      broadcastSubagents(): Dynamic {},
      readSetting(key: Dynamic): Dynamic {
        try {
          return localStorage.getItem(key) ?? sessionStorage.getItem(key);
        } catch {
          return null;
        }
      },
      trackTurnEvent(
        eventType: Dynamic,
        properties: Dynamic,
        chatId: Dynamic,
        projectId: Dynamic,
      ): Dynamic {
        (window as Dynamic).dispatchEvent(
          new CustomEvent("telemetry:track", {
            detail: {
              eventType: eventType,
              properties: properties,
              chatId: chatId,
              projectId: projectId,
            },
          }),
        );
      },
      reportSpan(
        name: Dynamic,
        spanOptions: Dynamic,
        chatId: Dynamic,
        projectId: Dynamic,
      ): Dynamic {
        (window as Dynamic).dispatchEvent(
          new CustomEvent("telemetry:span", {
            detail: {
              name: name,
              opts: spanOptions,
              chatId: chatId,
              projectId: projectId,
            },
          }),
        );
      },
      captureTranscript(): Dynamic {},
    };
    OutlineAnnotationsIsWorkerOnOmEventRoundtripConfig = {
      isWorker: false,
      emitOmEvent(): Dynamic {},
      onOmEvent: (): Dynamic => (): Dynamic => {},
      roundtrip: (): Dynamic =>
        Promise.resolve({
          ok: false,
          error: uiMessage("inspector.annotations.noHost"),
        }),
      execToolInTab: (): Dynamic => Promise.reject(new Error("no host")),
      mirrorPreviewFile(): Dynamic {},
      broadcastSubagents(): Dynamic {},
      readSetting: (): Dynamic => null,
      trackTurnEvent(): Dynamic {},
      reportSpan(): Dynamic {},
      captureTranscript(): Dynamic {},
    };
    OutlineAnnotationsResolvedValue =
      typeof window !== "undefined"
        ? OutlineAnnotationsIsWorkerConfig
        : OutlineAnnotationsIsWorkerOnOmEventRoundtripConfig;
  };
}
