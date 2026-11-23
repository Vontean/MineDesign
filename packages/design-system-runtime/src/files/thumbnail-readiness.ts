import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { detectCompiledPageStorageMode, truncateUtf16Safely } from "../platform/compiled-page";

const THUMBNAIL_READY_ATTRIBUTE = "data-thumb-ready";
const BLANK_THUMBNAIL_ATTRIBUTE = "data-thumb-blank";
function stateEnvelopeTitle(envelope: Boot.RawEnvelope): string | undefined {
  let title = envelope.title;
  if (typeof title === "string" && title.length > 0) {
    return truncateUtf16Safely(title, 200);
  } else {
    return undefined;
  }
}
function isFrameCaptureMode(pageDocument: Document = document): boolean {
  return pageDocument.documentElement.hasAttribute("data-frame-capture");
}
function observeDocumentThumbnailReadiness(
  documentState: Boot.ThumbnailLoadDocument,
  thumbnailOptions: Boot.ThumbnailOptions = {},
): () => void {
  let value = thumbnailOptions.document ?? document,
    flag: boolean = false,
    unsubscribe: (() => void) | undefined,
    callback = (): void => {
      if (flag) {
        return;
      }
      let loadState = documentState.loadState();
      if (loadState === "loading") {
        return;
      }
      flag = true;
      unsubscribe?.();
      if (loadState === "live") {
        waitForThumbnailResources(
          thumbnailOptions.whenPainted ?? (() => waitForThumbnailAssets(value)),
          value,
        );
      } else {
        prepareDesignSystemThumbnailCapture(value);
      }
    };
  unsubscribe = documentState.subscribeLoad(callback);
  callback();
  return (): void => {
    flag = true;
    unsubscribe?.();
  };
}
function prepareDesignSystemThumbnailCapture(
  pageDocument: Document = document,
): void {
  if (detectCompiledPageStorageMode(pageDocument) !== "db") {
    return;
  }
  if (!isFrameCaptureMode(pageDocument)) {
    return waitForThumbnailResources(
      () => waitForThumbnailAssets(pageDocument),
      pageDocument,
    );
  }
  createBlankThumbnailOverlay(pageDocument);
  markThumbnailReady(pageDocument);
}
function waitForThumbnailResources(
  ready: () => PromiseLike<unknown> = () => waitForThumbnailAssets(),
  pageDocument: Document = document,
): void {
  let callback = () => markThumbnailReady(pageDocument);
  ready().then(callback, callback);
}
function markThumbnailReady(pageDocument: Document = document): void {
  pageDocument.documentElement.setAttribute(THUMBNAIL_READY_ATTRIBUTE, "");
}
function createBlankThumbnailOverlay(pageDocument: Document): void {
  if (
    pageDocument.querySelector("[" + BLANK_THUMBNAIL_ATTRIBUTE + "]") !== null
  ) {
    return;
  }
  for (let value of [pageDocument.documentElement, pageDocument.body]) {
    value.style.overflow = "hidden";
  }
  let overlay = pageDocument.createElement("div");
  overlay.setAttribute(BLANK_THUMBNAIL_ATTRIBUTE, "");
  overlay.setAttribute("aria-hidden", "true");
  overlay.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;background:" +
    getThumbnailPageBackground(pageDocument);
  pageDocument.body.appendChild(overlay);
}
function getThumbnailPageBackground(pageDocument: Document): string {
  let pageWindow = pageDocument.defaultView;
  for (let value of [pageDocument.body, pageDocument.documentElement]) {
    let backgroundColor = pageWindow?.getComputedStyle(value).backgroundColor ?? "";
    if (
      backgroundColor !== "" &&
      backgroundColor !== "transparent" &&
      !/^rgba\(.*,\s*0\)$/.test(backgroundColor)
    ) {
      return backgroundColor;
    }
  }
  return "#fff";
}
async function waitForThumbnailAssets(
  nextFrame: Document = document,
): Promise<void> {
  await waitForDesignSystemRootContent(nextFrame);
  let pageWindow = nextFrame.defaultView,
    images = () =>
      new Promise<void>((resolve) =>
        pageWindow?.requestAnimationFrame
          ? pageWindow.requestAnimationFrame(() => resolve())
          : setTimeout(resolve, 16),
      );
  await images();
  await images();
  await nextFrame.fonts?.ready;
  let value = Array.from(nextFrame.images).filter(
    (image) =>
      !(image.loading === "lazy" && !image.complete) &&
      typeof image.decode === "function",
  );
  await Promise.all(
    value.map((image) =>
      image.decode().catch((): void => {
        return;
      }),
    ),
  );
  await images();
}
function waitForDesignSystemRootContent(pageDocument: Document): Promise<void> {
  let root = pageDocument.getElementById("root"),
    hasContent = () =>
      root !== null &&
      Array.from(root.children).some(
        (element): boolean => !element.hasAttribute("data-placeholder"),
      );
  if (root === null || hasContent()) {
    return Promise.resolve();
  }
  let Observer = (pageDocument.defaultView as Dom.BrowserWindow | null)
    ?.MutationObserver;
  if (Observer === undefined) {
    return Promise.resolve();
  }
  return new Promise<void>((resolve): void => {
    let value = new Observer((): void => {
      if (!hasContent()) {
        return;
      }
      value.disconnect();
      resolve();
    });
    value.observe(root, {
      childList: true,
    });
  });
}
export {
  BLANK_THUMBNAIL_ATTRIBUTE,
  createBlankThumbnailOverlay,
  getThumbnailPageBackground,
  isFrameCaptureMode,
  markThumbnailReady,
  observeDocumentThumbnailReadiness,
  prepareDesignSystemThumbnailCapture,
  stateEnvelopeTitle,
  THUMBNAIL_READY_ATTRIBUTE,
  waitForDesignSystemRootContent,
  waitForThumbnailAssets,
  waitForThumbnailResources,
};
