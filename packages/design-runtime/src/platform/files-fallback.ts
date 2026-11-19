/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { truncateUtf16Safely } from "./comments";

var escapeErrorHtml: Dynamic;
var CANVAS_LOAD_ERROR_TITLE: Dynamic;
var SKIPPED_FILE_NAME_PATTERN: Dynamic;
var EMPTY_FILES_FALLBACK_CONTENT: Dynamic;
var unavailableFilesCache: Dynamic;
var SHARED_RUNTIME_SAVE_REASON: Dynamic;
function createCanvasErrorState(
  failureReason?: Dynamic,
  messagePrefix: Dynamic = "The canvas could not be opened",
): Dynamic {
  return createErrorDocumentState(
    CANVAS_LOAD_ERROR_TITLE,
    messagePrefix + " (" + failureReason + ").",
  );
}
function createErrorDocumentState(
  title?: Dynamic,
  message?: Dynamic,
): Dynamic {
  let html: Dynamic =
    `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<script src="./support.js"><\/script>
</head>
<body>
<x-dc>
<helmet>
<style>body { margin: 0; background: #faf9f5; font-family: system-ui, sans-serif; color: #141413; }</style>
</helmet>
<div style="padding: 56px 64px; max-width: 720px">
<h1 style="margin: 0 0 16px 0; font-size: 32px; font-weight: 600">` +
    escapeErrorHtml(title) +
    `</h1>
<p style="margin: 0; font-size: 16px; line-height: 1.55; color: #5e5d59">` +
    escapeErrorHtml(message) +
    `</p>
</div>
</x-dc>
</body>
</html>
`;
  return {
    title: title,
    content: {
      files: {
        "Main.dc.html": html,
        "canvas.json": JSON.stringify({
          artboards: [
            {
              file: "Main.dc.html",
              x: 0,
              y: 0,
              w: 880,
              h: 360,
            },
          ],
        }),
      },
    },
    comments: [],
  };
}
function readBootstrapTitle(embeddedState?: Dynamic): Dynamic {
  let title: Dynamic = embeddedState.title;
  return typeof title == "string" && title.length > 0
    ? truncateUtf16Safely(title, 200)
    : undefined;
}
function createStaticWritableCache(cachedValue?: Dynamic): Dynamic {
  return {
    read: (): Dynamic => cachedValue,
    write: (): Dynamic => true,
    clear(): Dynamic {},
  };
}
function createFilesFallbackDocument(bootResult?: Dynamic): Dynamic {
  let state: Dynamic =
      bootResult.origin === "failed"
        ? createCanvasErrorState(bootResult.error ?? "")
        : bootResult.state,
    skipped: Dynamic = bootResult.skipped ?? [],
    displayedSkippedFiles: Dynamic = skipped
      .filter(
        (fileName?: Dynamic): Dynamic => SKIPPED_FILE_NAME_PATTERN.test(fileName),
      )
      .slice(0, 5),
    readOnlyReason: Dynamic =
      bootResult.origin === "failed"
        ? "This canvas couldn\u2019t be loaded."
        : (bootResult.origin === "demo" && bootResult.indexFound === true
            ? SHARED_RUNTIME_SAVE_REASON +
              " This is the demo canvas: the canvas\u2019s own design.json couldn\u2019t be used (" +
              truncateUtf16Safely(bootResult.error ?? "", 300) +
              ")."
            : SHARED_RUNTIME_SAVE_REASON) +
          (skipped.length > 0
            ? " " +
              String(skipped.length) +
              " listed file" +
              (skipped.length > 1 ? "s" : "") +
              " couldn\u2019t be loaded" +
              (displayedSkippedFiles.length > 0
                ? " (" +
                  displayedSkippedFiles.join(", ") +
                  (skipped.length > displayedSkippedFiles.length
                    ? ", \u2026"
                    : "") +
                  ")"
                : "") +
              "."
            : "");
  return {
    options: {
      embeddedState: state,
      pageParts: EMPTY_FILES_FALLBACK_CONTENT,
      roFlag: createStaticWritableCache(readOnlyReason),
      stash: unavailableFilesCache,
      canPublish: true,
    },
    title: readBootstrapTitle(state),
  };
}
function logFilesBootstrapError(bootResult?: Dynamic): Dynamic {
  bootResult.error !== undefined &&
    (bootResult.origin === "failed" || bootResult.indexFound === true) &&
    console.warn("design (files mode): " + bootResult.error);
  let { options: fallbackOptions, title: title }: Dynamic =
    createFilesFallbackDocument(bootResult);
  title !== undefined && ((document as Dynamic).title = title);
  return fallbackOptions;
}
export {
  CANVAS_LOAD_ERROR_TITLE,
  createCanvasErrorState,
  createErrorDocumentState,
  createFilesFallbackDocument,
  createStaticWritableCache,
  EMPTY_FILES_FALLBACK_CONTENT,
  escapeErrorHtml,
  logFilesBootstrapError,
  readBootstrapTitle,
  SHARED_RUNTIME_SAVE_REASON,
  SKIPPED_FILE_NAME_PATTERN,
  unavailableFilesCache,
};
export function installPlatformFilesFallback(): () => void {
  return () => {
    escapeErrorHtml = (text?: Dynamic): Dynamic =>
      text.replace(
        /[&<>"'{]/g,
        (character?: Dynamic): Dynamic =>
          "&#" + String(character.charCodeAt(0)) + ";",
      );
    CANVAS_LOAD_ERROR_TITLE = "Couldn\u2019t load this canvas";
    SKIPPED_FILE_NAME_PATTERN = /^[A-Za-z0-9._-]{1,40}$/;
    EMPTY_FILES_FALLBACK_CONTENT = {
      title: "",
      readme: "",
      readmeMeta: "",
      css: "",
      js: "",
      emulator: false,
    };
    unavailableFilesCache = {
      read: (): Dynamic => null,
      write: (): Dynamic => false,
      clear(): Dynamic {},
    };
    SHARED_RUNTIME_SAVE_REASON =
      "This canvas is served from the shared Design runtime. Saving from the page isn\u2019t available yet; it opens here for viewing only.";
  };
}
