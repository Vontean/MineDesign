/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { isFrameCaptureDocument } from "../canvas/frame-environment";
import { detectDocumentStorageMode } from "./document-compilation";

var THUMBNAIL_READY_ATTRIBUTE: Dynamic;
var THUMBNAIL_BLANK_ATTRIBUTE: Dynamic;
function watchThumbnailDocumentReady(
  doc?: Dynamic,
  thumbnailOptions: Dynamic = {},
): Dynamic {
  let previewDocument: Dynamic = thumbnailOptions.document ?? document,
    finished: Dynamic = false,
    unsubscribe: Dynamic,
    checkReady: Dynamic = (): Dynamic => {
      if (finished) return;
      let value: Dynamic = doc.loadState();
      value !== "loading" &&
        ((finished = true),
        unsubscribe?.(),
        value === "live"
          ? completeThumbnailAfterPromise(
              thumbnailOptions.whenPainted ??
                ((): Dynamic => waitForThumbnailPaint(previewDocument)),
              previewDocument,
            )
          : initializeDatabaseThumbnail(previewDocument));
    };
  unsubscribe = doc.subscribeLoad(checkReady);
  checkReady();
  return (): Dynamic => {
    finished = true;
    unsubscribe?.();
  };
}
function initializeDatabaseThumbnail(previewDocument: Dynamic = document): Dynamic {
  if (detectDocumentStorageMode(previewDocument) === "db") {
    if (!isFrameCaptureDocument(previewDocument))
      return completeThumbnailAfterPromise(
        (): Dynamic => waitForThumbnailPaint(previewDocument),
        previewDocument,
      );
    blankThumbnailDocument(previewDocument);
    markThumbnailReady(previewDocument);
  }
}
function completeThumbnailAfterPromise(
  whenPainted: Dynamic = (): Dynamic => waitForThumbnailPaint(),
  previewDocument: Dynamic = document,
): Dynamic {
  let callback: Dynamic = (): Dynamic => markThumbnailReady(previewDocument);
  whenPainted().then(callback, callback);
}
function markThumbnailReady(doc: Dynamic = document): Dynamic {
  doc.documentElement.setAttribute(THUMBNAIL_READY_ATTRIBUTE, "");
}
function blankThumbnailDocument(previewDocument?: Dynamic): Dynamic {
  if (previewDocument.querySelector("[" + THUMBNAIL_BLANK_ATTRIBUTE + "]") !== null)
    return;
  for (let element of [previewDocument.documentElement, previewDocument.body] as Dynamic)
    element.style.overflow = "hidden";
  let value: Dynamic = previewDocument.createElement("div");
  value.setAttribute(THUMBNAIL_BLANK_ATTRIBUTE, "");
  value.setAttribute("aria-hidden", "true");
  value.style.cssText =
    "position:fixed;inset:0;z-index:2147483647;background:" +
    hasOpaqueThumbnailBackground(previewDocument);
  previewDocument.body.appendChild(value);
}
function hasOpaqueThumbnailBackground(previewDocument?: Dynamic): Dynamic {
  let previewWindow: Dynamic = previewDocument.defaultView;
  for (let value of [previewDocument.body, previewDocument.documentElement] as Dynamic) {
    let backgroundColor: Dynamic =
      previewWindow?.getComputedStyle(value).backgroundColor ?? "";
    if (
      backgroundColor !== "" &&
      backgroundColor !== "transparent" &&
      !/^rgba\(.*,\s*0\)$/.test(backgroundColor)
    )
      return backgroundColor;
  }
  return "#fff";
}
async function waitForThumbnailPaint(
  previewDocument: Dynamic = document,
): Promise<Dynamic> {
  await waitForRootContent(previewDocument);
  let previewWindow: Dynamic = previewDocument.defaultView,
    nextFrame: Dynamic = (): Dynamic =>
      new Promise(
        (resolve?: Dynamic): Dynamic =>
          previewWindow?.requestAnimationFrame
            ? previewWindow.requestAnimationFrame((): Dynamic => resolve())
            : setTimeout(resolve, 16),
      );
  await nextFrame();
  await nextFrame();
  await previewDocument.fonts?.ready;
  let value: Dynamic = Array.from(previewDocument.images).filter(
    (image?: Dynamic): Dynamic =>
      !(image.loading === "lazy" && !image.complete) &&
      typeof image.decode == "function",
  );
  await Promise.all(
    value.map(
      (image?: Dynamic): Dynamic => image.decode().catch((): Dynamic => {}),
    ),
  );
  await nextFrame();
}
function waitForRootContent(previewDocument?: Dynamic): Dynamic {
  let root: Dynamic = previewDocument.getElementById("root"),
    hasContent: Dynamic = (): Dynamic =>
      root !== null &&
      Array.from(root.children).some(
        (child?: Dynamic): Dynamic => !child.hasAttribute("data-placeholder"),
      );
  if (root === null || hasContent()) return Promise.resolve();
  let value: Dynamic = previewDocument.defaultView?.MutationObserver;
  return value === undefined
    ? Promise.resolve()
    : new Promise((resolve?: Dynamic): Dynamic => {
        let observer: Dynamic = new value((): Dynamic => {
          hasContent() && (observer.disconnect(), resolve());
        });
        observer.observe(root, {
          childList: true,
        });
      });
}
export {
  blankThumbnailDocument,
  completeThumbnailAfterPromise,
  hasOpaqueThumbnailBackground,
  initializeDatabaseThumbnail,
  markThumbnailReady,
  THUMBNAIL_BLANK_ATTRIBUTE,
  THUMBNAIL_READY_ATTRIBUTE,
  waitForRootContent,
  waitForThumbnailPaint,
  watchThumbnailDocumentReady,
};
export function installPlatformThumbnail(): () => void {
  return () => {
    THUMBNAIL_READY_ATTRIBUTE = "data-thumb-ready";
    THUMBNAIL_BLANK_ATTRIBUTE = "data-thumb-blank";
  };
}
