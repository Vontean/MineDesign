import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeNpm_usehooks_ts_p0, load_react } from "../../dependencies";
import { parseNoteBlocks } from "../notes/blocks";
import { NotesDomHandler_2 } from "../notes/dom";
import { parseNoteInlineMarkdown } from "../notes/inline-markdown";
import { OutlineNativeMenuLabelGlyphConfig, OutlineNativeMenuLabelGlyphConfig_2, OutlineNativeMenuLimit, OutlineNativeMenuReplace, OutlineNativeMenuSlice, OutlineNativeMenuTitle1RectOvalConfig } from "./native-menu";
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
      NotesDomHandler_2(source.text).trim().split(`
`)[0] ?? ""
    );
  let value: Dynamic = parseNoteBlocks(source.text.trim())[0],
    value2: Dynamic =
      value == null
        ? ""
        : value.kind === "p"
          ? value.text
          : (value.items[0] ?? "");
  return parseNoteInlineMarkdown(value2, {
    escapes: true,
    literalUnsafeLinks: true,
  })
    .map((input?: Dynamic): Dynamic => input.text)
    .join("");
}
function annotationOutlineDetail(source?: Dynamic): Dynamic {
  if (source.kind === "image") {
    let value2: Dynamic = OutlineNativeMenuReplace(
      source.alt ?? "",
    );
    return value2
      ? {
          detail: OutlineAnnotationsSlice(value2),
          ...(value2.length > OutlineNativeMenuLimit
            ? {
                detailTitle: value2,
              }
            : {}),
        }
      : {};
  }
  if (!("text" in source)) return {};
  let value: Dynamic = annotationFirstTextLine(source).trim();
  return value
    ? {
        detail: `\u201C${OutlineNativeMenuSlice(value)}\u201D`,
      }
    : {};
}
function annotationOutlineNode(source?: Dynamic): Dynamic {
  let value: Dynamic =
    source.kind === undefined
      ? OutlineNativeMenuLabelGlyphConfig
      : source.kind === "image" && source.video !== undefined
        ? OutlineNativeMenuLabelGlyphConfig_2
        : OutlineNativeMenuTitle1RectOvalConfig[source.kind];
  return {
    id: source.id,
    label: value.label,
    glyph: value.glyph,
    ...annotationOutlineDetail(source),
  };
}
function reconcileAnnotationOutline(
  input?: Dynamic,
  options?: Dynamic,
): Dynamic {
  let values: Dynamic = new Set(),
    value: Dynamic = input.map((source?: Dynamic): Dynamic => {
      values.add(source.id);
      let value2: Dynamic =
          source.kind === "image"
            ? (source.video !== undefined ? "video:" : "") +
              (source.alt ?? "")
            : "text" in source
              ? source.text
              : undefined,
        entry: Dynamic = options.get(source.id);
      if (entry && entry.kind === source.kind && entry.text === value2)
        return entry.row;
      let value3: Dynamic = annotationOutlineNode(source);
      options.set(source.id, {
        kind: source.kind,
        text: value2,
        row: value3,
      });
      return value3;
    });
  for (let value2 of options.keys() as Dynamic)
    values.has(value2) || options.delete(value2);
  return value;
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
      emitOmEvent(input: Dynamic, options: Dynamic): Dynamic {
        (window as Dynamic).dispatchEvent(
          new CustomEvent(input, {
            detail: options,
          }),
        );
      },
      onOmEvent(input: Dynamic, options: Dynamic): Dynamic {
        let callback: Dynamic = (input2?: Dynamic): Dynamic =>
          options(input2.detail);
        (window as Dynamic).addEventListener(input, callback);
        return (): Dynamic =>
          (window as Dynamic).removeEventListener(input, callback);
      },
      roundtrip(input: Dynamic): Dynamic {
        return new Promise((input2?: Dynamic): Dynamic => {
          let callback: Dynamic = (): Dynamic => {
            value();
            input2({
              ok: false,
              error: "Aborted",
            });
          };
          function value(): Dynamic {
            clearTimeout(value2);
            (window as Dynamic).removeEventListener(
              input.responseEvent,
              value3,
            );
            input.signal?.removeEventListener("abort", callback);
          }
          let value2: Dynamic = setTimeout((): Dynamic => {
            value();
            input2({
              ok: false,
              error: input.timeoutError,
            });
          }, input.timeout);
          function value3(input3?: Dynamic): Dynamic {
            let detail: Dynamic = input3.detail;
            if (input.filter && !input.filter(detail)) return;
            value();
            let value4: Dynamic = input.reject?.(detail);
            input2(
              value4
                ? {
                    ok: false,
                    error: value4,
                  }
                : {
                    ok: true,
                    value: input.extract(detail),
                  },
            );
          }
          (window as Dynamic).addEventListener(input.responseEvent, value3);
          input.signal?.addEventListener("abort", callback, {
            once: true,
          });
          (window as Dynamic).dispatchEvent(
            new CustomEvent(input.dispatch.name, {
              detail: input.dispatch.detail,
            }),
          );
        });
      },
      execToolInTab(): Dynamic {
        return Promise.reject(new Error("execToolInTab called from tab host"));
      },
      mirrorPreviewFile(): Dynamic {},
      broadcastSubagents(): Dynamic {},
      readSetting(input: Dynamic): Dynamic {
        try {
          return localStorage.getItem(input) ?? sessionStorage.getItem(input);
        } catch {
          return null;
        }
      },
      trackTurnEvent(
        input: Dynamic,
        options: Dynamic,
        context: Dynamic,
        value: Dynamic,
      ): Dynamic {
        (window as Dynamic).dispatchEvent(
          new CustomEvent("telemetry:track", {
            detail: {
              eventType: input,
              properties: options,
              chatId: context,
              projectId: value,
            },
          }),
        );
      },
      reportSpan(
        input: Dynamic,
        options: Dynamic,
        context: Dynamic,
        value: Dynamic,
      ): Dynamic {
        (window as Dynamic).dispatchEvent(
          new CustomEvent("telemetry:span", {
            detail: {
              name: input,
              opts: options,
              chatId: context,
              projectId: value,
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
