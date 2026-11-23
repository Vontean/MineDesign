import type { Dynamic } from "../../runtime-types";

import { isMediaFile } from "./media-files";

interface ClipboardOptions {
  overlayRoot(): HTMLElement;
  canHandle(): boolean;
  isReadOnly(): boolean;
  selection(): { templateIds: (number | string)[]; componentName: string | null };
  findInstances(templateId: number | string, componentName: string | null): Element[];
  emit(event: Dynamic): void;
}

export function createPickerClipboard(options: ClipboardOptions) {
  let pasteResetTimer: ReturnType<typeof setTimeout> | undefined;
  let lastClipboardEventAt = 0;
  let clipboardSink: HTMLTextAreaElement | null = null;
  let clipboardPreviousFocus: Element | null = null;
  function createClipboardSink(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    removeClipboardSink();
    clipboardPreviousFocus = document.activeElement;
    clipboardSink = document.createElement("textarea");
    clipboardSink.setAttribute("data-dc-editor-copy-sink", "");
    clipboardSink.setAttribute("aria-hidden", "true");
    clipboardSink.value = " ";
    clipboardSink.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0";
    options.overlayRoot().appendChild(clipboardSink);
    try {
      clipboardSink.focus({
        preventScroll: true,
      });
      clipboardSink.select();
    } catch {}
    setTimeout(removeClipboardSink, 0);
  }
  function removeClipboardSink(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (clipboardSink) {
      const clipboardElement = clipboardSink;
      const previousFocus = clipboardPreviousFocus;
      clipboardSink = null;
      clipboardPreviousFocus = null;
      clipboardElement.remove();
      if (
        previousFocus &&
        previousFocus !== document.body &&
        previousFocus.isConnected &&
        "focus" in previousFocus && typeof previousFocus.focus === "function"
      )
        try {
          previousFocus.focus({
            preventScroll: true,
          });
        } catch {}
    }
  }
  var clipboardDataAttribute: Dynamic = "data-appifact-object";
  var clipboardMarkerPattern: Dynamic = /data-appifact-object="([A-Za-z0-9+\/=]+)"/;
  var maxClipboardHtmlSize: Dynamic = 34 * 1024 * 1024;
  function shouldHandleClipboard(
    this: Dynamic,
    clipboardEvent?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!clipboardEvent.isTrusted || !options.canHandle()) return false;
    var eventTarget: Dynamic = clipboardEvent.target;
    return eventTarget && eventTarget === clipboardSink
      ? true
      : !(
          eventTarget &&
          (eventTarget.tagName === "INPUT" ||
            eventTarget.tagName === "TEXTAREA" ||
            eventTarget.tagName === "SELECT" ||
            eventTarget.isContentEditable)
        );
  }
  function selectionClipboardText(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const { templateIds, componentName } = options.selection();
    for (
      var labels: Dynamic = [], templateIndex: Dynamic = 0;
      templateIndex < templateIds.length && labels.length < 200;
      templateIndex++
    )
      for (
        var instances: Dynamic = options.findInstances(
            templateIds[templateIndex],
            componentName,
          ),
          instanceIndex: Dynamic = 0;
        instanceIndex < instances.length;
        instanceIndex++
      ) {
        var instanceElement: Dynamic = instances[instanceIndex];
        var instanceText: Dynamic = (
          instanceElement.innerText ||
          instanceElement.getAttribute("alt") ||
          instanceElement.getAttribute("aria-label") ||
          instanceElement.getAttribute("title") ||
          ""
        ).trim();
        if (instanceText) {
          labels.push(instanceText);
        }
      }
    return labels
      .join(
        `
  `,
      )
      .slice(0, 2e4);
  }
  function onEditorCopyCut(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var clipboardWasFocused: Dynamic =
      clipboardSink !== null && event.target === clipboardSink;
    if (
      !shouldHandleClipboard(event) ||
      options.selection().templateIds.length === 0 ||
      (event.type === "cut" && options.isReadOnly())
    ) {
      if (clipboardWasFocused) {
        event.preventDefault();
      }
      return;
    }
    var clipboardAction: Dynamic = event.type === "cut" ? "x" : "c";
    var clipboardStamp: Dynamic =
      Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    var clipboardText: Dynamic = selectionClipboardText() || " ";
    try {
      var encodedData: Dynamic = btoa(
        unescape(
          encodeURIComponent(
            JSON.stringify({
              appifact: 1,
              kind: "design-elements",
              data: {
                stamp: clipboardStamp,
              },
            }),
          ),
        ),
      );
      event.clipboardData.setData("text/plain", clipboardText);
      event.clipboardData.setData(
        "text/html",
        "<span " +
          clipboardDataAttribute +
          '="' +
          encodedData +
          '">' +
          clipboardText
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;") +
          "</span>",
      );
      event.preventDefault();
      event.stopPropagation();
    } catch {
      clipboardStamp = null;
      if (clipboardWasFocused) {
        event.preventDefault();
      }
    }
    if (clipboardStamp) {
      options.emit({
        type: "clipboardKey",
        key: clipboardAction,
        stamp: clipboardStamp,
        text: clipboardText,
        mark: Date.now() - lastClipboardEventAt < 1e3,
      });
    }
    lastClipboardEventAt = 0;
  }
  function decodeEditorClipboard(
    this: Dynamic,
    clipboardData?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    try {
      var htmlText: Dynamic = clipboardData.getData("text/html") || "";
      var markerMatch: Dynamic =
        htmlText.length > maxClipboardHtmlSize ? null : clipboardMarkerPattern.exec(htmlText);
      if (!markerMatch) return null;
      var decodedPayload: Dynamic = JSON.parse(
        new TextDecoder().decode(
          Uint8Array.from(
            atob(markerMatch[1]),
            function (
              this: Dynamic,
              byte?: Dynamic,
              ..._unusedNestedArgs: Dynamic[]
            ): Dynamic {
              return byte.charCodeAt(0);
            },
          ),
        ),
      );
      if (
        !decodedPayload ||
        decodedPayload.appifact !== 1 ||
        (decodedPayload.kind !== "design-elements" &&
          decodedPayload.kind !== "design-artboards") ||
        !decodedPayload.data
      )
        return null;
      var stamp: Dynamic = decodedPayload.data.stamp;
      var validStamp: Dynamic =
        typeof stamp == "string" && stamp.length > 0 && stamp.length <= 64
          ? stamp
          : null;
      var foreignArtboardCount: Dynamic =
        decodedPayload.kind === "design-artboards"
          ? Math.min(
              [decodedPayload.data.artboards, decodedPayload.data.annotations].reduce(function (
                this: Dynamic,
                totalCount?: Dynamic,
                payloadEntries?: Dynamic,
                ..._unusedNestedArgs: Dynamic[]
              ): Dynamic {
                return (
                  totalCount + ((Array as Dynamic).isArray(payloadEntries) ? payloadEntries.length : 0)
                );
              }, 0),
              999,
            )
          : 0;
      return validStamp || foreignArtboardCount > 0
        ? {
            stamp: validStamp,
            foreignArtboards: foreignArtboardCount,
          }
        : null;
    } catch {
      return null;
    }
  }
  function onEditorPaste(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (shouldHandleClipboard(event) && (cancelPendingPaste(), !options.isReadOnly())) {
      for (
        var clipboardData: Dynamic = event.clipboardData,
          files: Dynamic = [],
          mediaFileCount: Dynamic = 0,
          fileIndex: Dynamic = 0;
        clipboardData && clipboardData.files && fileIndex < clipboardData.files.length;
        fileIndex++
      ) {
        files.push(clipboardData.files[fileIndex]);
        if (isMediaFile(clipboardData.files[fileIndex].type, clipboardData.files[fileIndex].name)) {
          mediaFileCount++;
        }
      }
      var plainText: Dynamic = clipboardData
        ? String(clipboardData.getData("text/plain") || "")
        : "";
      var decodedSelection: Dynamic = clipboardData ? decodeEditorClipboard(clipboardData) : null;
      event.preventDefault();
      event.stopPropagation();
      var pastePayload: Dynamic = mediaFileCount
        ? {
            type: "filePaste",
            files: files,
            text: plainText,
          }
        : {
            type: "clipboardKey",
            key: "v",
            text: plainText,
          };
      if (decodedSelection && decodedSelection.stamp) {
        pastePayload.stamp = decodedSelection.stamp;
      }
      if (decodedSelection && decodedSelection.foreignArtboards > 0) {
        pastePayload.foreignArtboards = decodedSelection.foreignArtboards;
      }
      options.emit(pastePayload);
    }
  }

  function prepareCopyOrCut() {
    lastClipboardEventAt = Date.now();
    createClipboardSink();
  }

  function cancelPendingPaste() {
    clearTimeout(pasteResetTimer);
  }

  function schedulePasteFallback() {
    cancelPendingPaste();
    pasteResetTimer = setTimeout(() => {
      options.emit({ type: "clipboardKey", key: "v" });
    }, 100);
  }

  return { prepareCopyOrCut, schedulePasteFallback, cancelPendingPaste, onEditorCopyCut, onEditorPaste };
}
