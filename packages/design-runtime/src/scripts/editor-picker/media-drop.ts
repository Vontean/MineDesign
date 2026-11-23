import {
  activateDeckSlide,
  deckRailHitAt,
  deckSlideAddress,
  enclosingDeckSlide,
  eventHitsDeckChrome,
  remapDeckRailHit,
  resolveDeckSlideAddress,
  type DeckSlideAddress,
} from "./deck-target";
import { componentScopeName, unwrapDisplayContentsHost } from "./element-query";
import { createMediaDropTargeting, type MediaDropTarget } from "./media-drop-target";
import { isMediaFile } from "./media-files";
import type { Dynamic } from "../../runtime-types";

const ownDropTarget = 'input[type="file" i], [ondrop], [ondragover], image-slot';

interface MediaDropOptions {
  isEditing(): boolean;
  isReadOnly(): boolean;
  activeTool(): string;
  textMapReady(): boolean;
  eventMatchesSelector(event: Event, selector: string): boolean;
  eventHitsEditorOverlay(event: Event): boolean;
  showParentPlacementBounds(bounds: DOMRect, label: string): void;
  hideParentPlacementBounds(): void;
  normalizeHit(element: Element): Element | null;
  canContainElements(element: Element): boolean;
  elementViewportScale(element: Element): number;
  emit(event: Dynamic): void;
}

function viewportAtDrop(event: DragEvent) {
  return {
    x: event.clientX,
    y: event.clientY,
    sx: window.scrollX,
    sy: window.scrollY,
    w: window.innerWidth,
    h: window.innerHeight,
  };
}

function hasFileTransfer(transfer: DataTransfer | null) {
  return transfer?.types != null && Array.prototype.includes.call(transfer.types, "Files");
}

function mediaFiles(transfer: DataTransfer) {
  return Array.from(transfer.files).filter((file) => isMediaFile(file.type, file.name));
}

type AcceptedTarget = Extract<MediaDropTarget, { el: Element }>;

interface PendingDrop {
  files: File[];
  el: Element | null;
  position: AcceptedTarget["position"] | "root-end";
  point: AcceptedTarget["point"];
  slide: DeckSlideAddress | null;
  at: ReturnType<typeof viewportAtDrop>;
}

export function createPickerMediaDrop(options: MediaDropOptions) {
  const targeting = createMediaDropTargeting(options);
  let pending: PendingDrop | null = null;
  let pendingRevision = 0;
  let hasHighlight = false;
  let highlightRevision = 0;
  let hoverDepth = 0;
  let dragStartedInPreview = false;

  function clearHighlight() {
    highlightRevision++;
    if (hasHighlight) {
      hasHighlight = false;
      options.hideParentPlacementBounds();
    }
  }

  function resetHover() {
    dragStartedInPreview = false;
    hoverDepth = 0;
    clearHighlight();
  }

  function expireHighlight() {
    const revision = ++highlightRevision;
    setTimeout(() => {
      if (highlightRevision === revision) resetHover();
    }, 900);
  }

  function showHighlight(bounds: DOMRect) {
    options.showParentPlacementBounds(bounds, "");
    hasHighlight = true;
    expireHighlight();
  }

  function isPreviewFileDrag(event: DragEvent) {
    return !options.isEditing() && event.isTrusted &&
      hasFileTransfer(event.dataTransfer) &&
      !!document.querySelector("[data-dc-tpl]");
  }

  function onPreviewDragStart(event: DragEvent) {
    if (!event.isTrusted) return;
    dragStartedInPreview = true;
    setTimeout(() => {
      if (event.defaultPrevented) dragStartedInPreview = false;
    }, 0);
    expireHighlight();
  }

  function onPreviewDragEnter(event: DragEvent) {
    if (isPreviewFileDrag(event)) hoverDepth++;
  }

  function onPreviewDragLeave(event: DragEvent) {
    if (!isPreviewFileDrag(event)) return;
    hoverDepth = Math.max(0, hoverDepth - 1);
    if (hoverDepth === 0) clearHighlight();
  }

  function onPreviewDragEnd(event: DragEvent) {
    if (event.isTrusted) resetHover();
  }

  function onPreviewDragOver(event: DragEvent) {
    if (!isPreviewFileDrag(event)) return;
    if (options.eventMatchesSelector(event, ownDropTarget)) {
      clearHighlight();
      return;
    }
    event.preventDefault();
    if (dragStartedInPreview) {
      clearHighlight();
      expireHighlight();
      return;
    }
    const thumbnail = deckRailHitAt(event.clientX, event.clientY);
    const transfer = event.dataTransfer!;
    if (options.eventHitsEditorOverlay(event) && !thumbnail) {
      transfer.dropEffect = "none";
      clearHighlight();
      return;
    }
    transfer.dropEffect = "copy";
    if (!Array.from(transfer.items ?? []).some((item) => item.kind === "file" && isMediaFile(item.type))) {
      clearHighlight();
      return;
    }
    if (thumbnail) {
      if (remapDeckRailHit(event.clientX, event.clientY, thumbnail)) showHighlight(thumbnail.frameRect);
      else clearHighlight();
      return;
    }
    const target = targeting.highlightAt(event.clientX, event.clientY);
    if (target && !target.refuse) showHighlight(unwrapDisplayContentsHost(target.el).getBoundingClientRect());
    else clearHighlight();
  }

  function onPreviewDrop(event: DragEvent) {
    if (!isPreviewFileDrag(event)) return;
    const startedInPreview = dragStartedInPreview;
    resetHover();
    if (options.eventMatchesSelector(event, ownDropTarget)) return;
    const transfer = event.dataTransfer!;
    if (!transfer.files?.length) return;
    event.preventDefault();
    if (startedInPreview || (options.eventHitsEditorOverlay(event) && !deckRailHitAt(event.clientX, event.clientY))) return;
    const files = mediaFiles(transfer);
    if (!files.length) return;

    const target = targeting.targetAt(event.clientX, event.clientY);
    if (target?.refuse) return;
    pending = {
      files,
      el: target?.el ?? null,
      position: target?.position ?? "root-end",
      point: target ? target.point : null,
      at: viewportAtDrop(event),
      slide: target ? deckSlideAddress(target.el) : null,
    };
    const revision = ++pendingRevision;
    setTimeout(() => {
      if (pendingRevision === revision) pending = null;
    }, 8e3);
    options.emit({
      type: "__dc_preview_drop_notice",
      video: files.every((file) => !(file.type || "").startsWith("image/")),
    });
  }

  function emitDrop(drop: PendingDrop, element: Element | null, position: PendingDrop["position"]) {
    options.emit({
      type: "fileDrop",
      files: drop.files,
      name: element ? componentScopeName(element) : null,
      targetTid: element ? parseInt(element.getAttribute("data-dc-tpl")!, 10) : null,
      position: element ? position : "root-end",
      slide: drop.slide,
      point: element ? drop.point ?? null : null,
      at: drop.at,
    });
    if (element) activateDeckSlide(enclosingDeckSlide(element));
  }

  function replayPendingDrop() {
    if (!pending || !options.isEditing()) return;
    if (!options.textMapReady()) {
      pendingRevision++;
      return;
    }
    const drop = pending;
    pending = null;
    let element = drop.el;
    let position = drop.position;
    if (element && (!element.isConnected || !element.hasAttribute("data-dc-tpl"))) element = null;
    if (element && !drop.point) element = options.normalizeHit(element);
    if (!element && drop.slide) {
      const slide = resolveDeckSlideAddress(drop.slide);
      if (slide?.hasAttribute("data-dc-tpl")) {
        element = slide;
        position = "into";
      }
    }
    emitDrop(drop, element, position);
  }

  const acceptsEditorDrop = () => options.isEditing() && options.activeTool() !== "interact";
  const refusesEditorDrop = (event: DragEvent) => options.isReadOnly() ||
    (eventHitsDeckChrome(event) && !deckRailHitAt(event.clientX, event.clientY));

  function onEditorDragOver(event: DragEvent) {
    const transfer = event.dataTransfer;
    if (!acceptsEditorDrop() || !transfer || !hasFileTransfer(transfer)) return;
    event.preventDefault();
    event.stopPropagation();
    transfer.dropEffect = refusesEditorDrop(event) ? "none" : "copy";
  }

  function onEditorDrop(event: DragEvent) {
    const transfer = event.dataTransfer;
    if (!acceptsEditorDrop() || !transfer?.files?.length) return;
    event.preventDefault();
    event.stopPropagation();
    if (refusesEditorDrop(event)) return;

    const files = mediaFiles(transfer);
    const target = files.length ? targeting.targetAt(event.clientX, event.clientY) : null;
    if (!files.length || target?.refuse) {
      options.emit({
        type: "fileDrop",
        files: [],
        ...(target?.refuse ? { refuse: true } : {}),
        name: null,
        targetTid: null,
        position: "root-end",
      });
      return;
    }
    const element = target?.el ?? null;
    const position = target?.position ?? "root-end";
    emitDrop({
      files,
      el: element,
      position,
      slide: element ? deckSlideAddress(element) : null,
      point: target ? target.point : null,
      at: viewportAtDrop(event),
    }, element, position);
  }

  return {
    onEditorDragOver,
    onEditorDrop,
    onPreviewDragStart,
    onPreviewDragEnter,
    onPreviewDragLeave,
    onPreviewDragEnd,
    onPreviewDragOver,
    onPreviewDrop,
    cancelPendingDrop: () => { pending = null; },
    replayPendingDrop,
    resetHover,
  };
}
