import type { Dynamic } from "../runtime-types";
import { npm_useEventListener_bc } from "../dependencies";
import { artboardComponentName } from "../editor/html/dc-document";
import { isEditableComponentName } from "../editor/media/object-crop";
import { isPreviewMessage } from "../platform/file-content";
import { openPreviewExternalLink } from "../platform/link-navigation";
import { normalizeArtboardErrorMessages, reuseEqualStringArray } from "./artboard-errors";
import { routeFrameGesture, type FrameGestureOptions } from "./frame-gesture-events";
import { normalizeArtboardMeasuredSize, type ArtboardBox } from "./frame-payloads";

interface TextFormatState {
  formats: {
    bold: boolean;
    italic: boolean;
    underline: boolean;
    ul: boolean;
    ol: boolean;
    link: boolean;
  } | null;
}

export interface FrameSelection {
  tids: number[] | null;
  name: string | null;
  tag?: string;
  part?: "text";
  rect: { x: number; y: number; w: number; h: number } | null;
  re?: string;
  additive: boolean;
  s?: number;
  artboard: boolean;
}

interface FrameMessageOptions extends FrameGestureOptions {
  iframeRef: { current: HTMLIFrameElement | null };
  canEditPreview: boolean;
  editing: boolean;
  frameless: boolean;
  box?: ArtboardBox | null;
  onRecoveryMessage(message: Dynamic, source: MessageEventSource | null): boolean;
  onBooted(message: Record<string, unknown> & { rootName: string }): void;
  setArtboardErrors(update: (previous: string[]) => string[]): void;
  onPreviewDropNotice(file: string, video: boolean): void;
  onPreviewClick?(file: string, additive: boolean): void;
  onTextEditState?(file: string, state: TextFormatState | null): void;
  onLocalEdit?(file: string): void;
  onChrome(message: Record<string, unknown>, box: ArtboardBox): void;
  onCropRequest(tid: unknown): void;
  onContentHull?(file: string, bounds: ArtboardBox | null): void;
  onGestureStream?(file: string, live: boolean): void;
  onSelection?(file: string, selection: FrameSelection): void;
  onSelectionSeq?(file: string, sequence: number): void;
}

function textFormats(event: Record<string, Dynamic>): TextFormatState {
  const formats = event.formats;
  return {
    formats: event.plain === true ? null : {
      bold: formats?.bold === true,
      italic: formats?.italic === true,
      underline: formats?.underline === true,
      ul: formats?.ul === true,
      ol: formats?.ol === true,
      link: formats?.link === true,
    },
  };
}

function selectionRect(rect: Dynamic): FrameSelection["rect"] {
  const coordinate = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value) && Math.abs(value) < 1e6 ? value : null;
  const x = coordinate(rect?.x);
  const y = coordinate(rect?.y);
  const w = coordinate(rect?.w);
  const h = coordinate(rect?.h);
  return x !== null && y !== null && w !== null && h !== null ? { x, y, w, h } : null;
}

function routeSelection(event: Record<string, Dynamic>, options: FrameMessageOptions) {
  const sequence = typeof event.s === "number" && Number.isSafeInteger(event.s) && event.s >= 0
    ? event.s
    : undefined;
  if (sequence !== undefined) options.onSelectionSeq?.(options.file, sequence);
  const rect = selectionRect(event.rect);
  if (!options.panelMounted) return;
  const tids = Array.isArray(event.tids)
    ? event.tids.filter((tid) => typeof tid === "number" && Number.isInteger(tid) && tid >= 0 && tid < 1e6).slice(0, 512)
    : null;
  if (event.name != null && (
    typeof event.name !== "string" ||
    !isEditableComponentName(event.name) ||
    event.name !== artboardComponentName(options.file)
  )) return;
  options.onSelection?.(options.file, {
    tids,
    name: typeof event.name === "string" ? event.name : null,
    tag: typeof event.tag === "string" ? event.tag : undefined,
    part: event.part === "text" ? "text" : undefined,
    rect,
    re: typeof event.re === "string" && /^[A-Za-z0-9:._-]{1,32}$/.test(event.re) ? event.re : undefined,
    additive: event.additive === true,
    s: sequence,
    artboard: event.artboard === true && tids === null,
  });
}

const commitGestureEvents = new Set([
  "move", "resize", "rotate", "groupTransform", "styleRevert", "movePreviewCancel",
]);

/** Keep source validation, dispatch order and payload validation at the iframe boundary. */
export function useArtboardFrameMessages(options: FrameMessageOptions) {
  const { file, panelMounted, readOnly, canEditPreview } = options;

  npm_useEventListener_bc("message", (event: MessageEvent) => {
    if (!isPreviewMessage(event, options.iframeRef.current)) return;

    const message = event.data;
    if (message != null && typeof message === "object" && "__om_link" in message) {
      openPreviewExternalLink(message.__om_link);
      return;
    }
    if (options.onRecoveryMessage(message, event.source)) return;
    if (message?.type === "__dc_render_errors") {
      const errors = normalizeArtboardErrorMessages(message.errors);
      options.setArtboardErrors((previous) => reuseEqualStringArray(previous, errors));
      return;
    }

    const edit = message?.__dcEditorEvt;
    if (edit?.type === "__dc_preview_drop_notice") {
      if (canEditPreview) options.onPreviewDropNotice(file, edit.video === true);
      return;
    }
    if (edit?.type === "previewClick") {
      if (!panelMounted) options.onPreviewClick?.(file, edit.shift === true || edit.meta === true);
      return;
    }
    if (message?.type === "__dc_booted" && typeof message.rootName === "string") {
      options.onBooted(message);
      return;
    }

    if (routeFrameGesture(edit, options)) return;
    if (edit?.type === "textEditState" && options.onTextEditState) {
      if (!panelMounted || readOnly) return;
      if (edit.active === true) {
        options.onLocalEdit?.(file);
        options.onTextEditState(file, textFormats(edit));
      } else {
        options.onTextEditState(file, null);
      }
      return;
    }
    if (edit?.type === "chrome") {
      if (options.box && (panelMounted || (canEditPreview && options.editing))) {
        options.onChrome(edit, options.box);
      }
      return;
    }
    if (edit?.type === "cropRequest") {
      if (panelMounted) options.onCropRequest(edit.tid);
      return;
    }
    if (edit?.type === "contentHull") {
      if (!options.frameless) return;
      if (edit.empty === true) {
        options.onContentHull?.(file, null);
      } else {
        const size = normalizeArtboardMeasuredSize(edit);
        if (size) options.onContentHull?.(file, size);
      }
      return;
    }

    if (edit && options.onGestureStream && panelMounted && !readOnly) {
      if (edit.type === "stylePreview" || edit.type === "movePreview") {
        options.onGestureStream(file, true);
      } else if (commitGestureEvents.has(edit.type)) {
        options.onGestureStream(file, false);
      }
    }
    if (edit?.type === "select" && options.onSelection) routeSelection(edit, options);
  });
}
