import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type * as React from "react";
import type * as Preview from "../../contracts/preview";
import type * as Model from "../../contracts";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../../dependencies";
import { ComponentPreview } from "../../editor/component-preview";
import { projectFilePath } from "../../editor/files-index";
import { PreviewFitBox } from "../../editor/preview-fit";
import { componentPreviewPath } from "../../editor/preview-runner";
import { generateComponentMountHtml } from "../../model/component-inference";
import { encodeRelativeUrlPath } from "../../model/file-policy";
import { toModuleNamespace } from "../../module-helpers";

var reactFileAvailability: typeof import("react");
var fileAvailabilityCache: Map<string, boolean>;
var fileAvailabilityPending: Set<string>;
var fileAvailabilitySubscribers: Set<() => void>;
var fileAvailabilityRevision: number;
var fileAvailabilityCacheKey: (path: string, bytes: number) => string;
var fileAvailabilityNotifyPending: boolean;
var reactComponentPreviews: typeof import("react");
var jsxComponentPreviews: typeof import("react/jsx-runtime");
var MAX_RESPONSIVE_PREVIEW_HEIGHT: number;
var STATIC_PREVIEW_NOTE: string;
function getFileAvailabilityRevision(): number {
  return fileAvailabilityRevision;
}
function subscribeFileAvailability(subscriber: () => void): () => boolean {
  fileAvailabilitySubscribers.add(subscriber);
  return () => fileAvailabilitySubscribers.delete(subscriber);
}
function fileAvailabilityUrlPath(path: string): string {
  let normalized = encodeRelativeUrlPath(path),
    baseUri = globalThis.document?.baseURI;
  if (typeof baseUri !== "string" || !/^https?:/i.test(baseUri)) {
    return normalized;
  }
  try {
    return new URL(normalized, baseUri).pathname;
  } catch {
    return normalized;
  }
}
function cachedFileAvailability(
  path: string,
  bytes: number,
): boolean | undefined {
  return fileAvailabilityCache.get(fileAvailabilityCacheKey(path, bytes));
}
function finishFileAvailabilityProbe(key: string, available: boolean): void {
  fileAvailabilityPending.delete(key);
  fileAvailabilityCache.set(key, available);
  if (!available) {
    return;
  }
  fileAvailabilityRevision++;
  if (fileAvailabilityNotifyPending) {
    return;
  }
  fileAvailabilityNotifyPending = true;
  queueMicrotask(() => {
    fileAvailabilityNotifyPending = false;
    for (let value of fileAvailabilitySubscribers) {
      value();
    }
  });
}
function probeFileAvailability(
  path: string,
  mimePrefix: string,
  bytes: number,
  headFetch?: Preview.FileHeadFetch,
): boolean | undefined {
  let key = fileAvailabilityCacheKey(path, bytes),
    cached = fileAvailabilityCache.get(key);
  if (cached !== undefined) {
    return cached;
  }
  if (fileAvailabilityPending.has(key)) {
    return;
  }
  let fetchHead =
    headFetch ??
    (typeof fetch === "function"
      ? (url: string) =>
          fetch(url, {
            method: "HEAD",
            credentials: "same-origin",
            cache: "no-cache",
          })
      : undefined);
  if (fetchHead === undefined) {
    fileAvailabilityCache.set(key, false);
    return false;
  }
  fileAvailabilityPending.add(key);
  (async (): Promise<void> => {
    let flag = false;
    try {
      let value = await fetchHead(fileAvailabilityUrlPath(path)),
        contentType = (value.headers?.get("content-type") ?? "").toLowerCase(),
        contentLength = value.headers?.get("content-length") ?? null;
      flag =
        value.ok &&
        contentType.startsWith(mimePrefix) &&
        (bytes <= 0 ||
          (contentLength !== null && contentLength !== "" && Number(contentLength) === bytes));
    } catch {
      flag = false;
    }
    finishFileAvailabilityProbe(key, flag);
  })();
  return;
}
function useFileAvailability(files: Preview.FileAvailabilityEntry[]): number {
  let revision = reactFileAvailability.useSyncExternalStore(
      subscribeFileAvailability,
      getFileAvailabilityRevision,
      getFileAvailabilityRevision,
    ),
    fingerprint = files.map((fileEntry) => fileEntry.path + ":" + String(fileEntry.bytes))
      .join(`
`);
  reactFileAvailability.useEffect(() => {
    for (let value of files) {
      probeFileAvailability(value.path, value.typePrefix, value.bytes);
    }
  }, [fingerprint]);
  return revision;
}
function responsivePreviewHeight(height: number, width: number): number {
  let scale = width <= 0 || width >= 660 ? 1 : width >= 480 ? 1.3 : 1.6;
  return Math.min(MAX_RESPONSIVE_PREVIEW_HEIGHT, Math.round(height * scale));
}
function componentPreviewSource(
  component: Preview.PreviewComponent,
  previewHead: Preview.PreviewHeadResult,
  stage?: Preview.ComponentPreviewStage,
): Preview.ComponentPreviewSource {
  return {
    html:
      stage !== undefined
        ? generateComponentMountHtml(component.name, stage)
        : component.previewHtml,
    file: projectFilePath(
      componentPreviewPath(component.name),
    ),
    fromProps: stage !== undefined,
    staticReason:
      previewHead.staticReason !== "" ? uiMessage("design-system.previewAvailability.staticPreviewSeeTheNote") : undefined,
  };
}
function FluidComponentPreview({
  c: c,
  height: height,
  ph: ph,
  stage: stage,
}: Preview.FluidComponentPreviewProps): React.ReactElement {
  useUiLocale();
  let [value, isReady] = reactComponentPreviews.useState(false);
  reactComponentPreviews.useEffect(() => isReady(true), []);
  let ref = reactComponentPreviews.useRef<HTMLDivElement | null>(null),
    [containerWidth, setContainerWidth] = reactComponentPreviews.useState(0);
  reactComponentPreviews.useEffect(() => {
    let current = ref.current;
    if (current === null) {
      return;
    }
    let callback = () => setContainerWidth(Math.round(current.clientWidth));
    callback();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    let observer = new ResizeObserver(callback);
    observer.observe(current);
    return () => observer.disconnect();
  }, []);
  let previewHeight = responsivePreviewHeight(height, containerWidth),
    previewSource = componentPreviewSource(c, ph, stage);
  return (
    <div
      ref={ref}
      className={"ds-comp-preview-fill"}
      style={{
        minHeight: previewHeight,
      }}
    >
      {value && previewSource.html !== undefined ? (<ComponentPreview
          html={previewSource.html}
          cardFile={previewSource.file}
          fromProps={previewSource.fromProps}
          head={ph.head}
          height={previewHeight}
          title={uiMessage("design-system.previewAvailability.preview", { subject: String(c.name) })}
          {...(previewSource.staticReason !== undefined
            ? {
                staticReason: previewSource.staticReason,
              }
            : {})}
          data-testid={"ds-comp-preview-" + c.name}
        />) : (null)}
    </div>
  );
}
function ScaledComponentPreview({
  c: c,
  width: width,
  height: height,
  ph: ph,
  stage: stage,
}: Preview.ScaledComponentPreviewProps): React.ReactElement {
  useUiLocale();
  let [value, isReady] = reactComponentPreviews.useState(false);
  reactComponentPreviews.useEffect(() => isReady(true), []);
  let [staticNote, setStaticNote] = reactComponentPreviews.useState<string | null>(null),
    previewSource = componentPreviewSource(c, ph, stage);
  return (
    <div className={"ds-comp-preview-fill"}>
      {[<PreviewFitBox
          width={width}
          height={height}
          data-testid={"ds-comp-scaled-" + c.name}
        >
          {value && previewSource.html !== undefined ? (<ComponentPreview
              html={previewSource.html}
              cardFile={previewSource.file}
              fromProps={previewSource.fromProps}
              head={ph.head}
              height={height}
              title={uiMessage("design-system.previewAvailability.preview", { subject: String(c.name) })}
              {...(previewSource.staticReason !== undefined
                ? {
                    staticReason: previewSource.staticReason,
                  }
                : {})}
              staticPageWidth={width}
              onStaticNote={setStaticNote}
              data-testid={"ds-comp-preview-" + c.name}
            />) : (null)}
        </PreviewFitBox>, staticNote !== null ? (
          <p
            className={"ds-swatch-note ds-pad mt-xs text-footnote text-muted"}
            data-testid={"ds-comp-preview-note-" + c.name}
          >
            {staticNote}
          </p>
        ) : null]}
    </div>
  );
}
function renderComponentPreview(
  component: Preview.PreviewComponent,
  dimensions: {
    height: number;
  },
  previewHead: Preview.PreviewHeadResult,
  stage?: Preview.ComponentPreviewStage,
): React.ReactElement | null {
  if (component.previewHtml === undefined) {
    return null;
  }
  if (component.previewWidth !== undefined) {
    return (
      <ScaledComponentPreview
        c={component}
        width={component.previewWidth}
        height={dimensions.height}
        ph={previewHead}
        stage={stage}
      />
    );
  }
  return (
    <FluidComponentPreview
      c={component}
      height={dimensions.height}
      ph={previewHead}
      stage={stage}
    />
  );
}
function get_STATIC_PREVIEW_NOTE() {
  return uiMessage("design-system.previewAvailability.staticPreviewSeeTheNote");
}
export {
  cachedFileAvailability,
  componentPreviewSource,
  fileAvailabilityCache,
  fileAvailabilityCacheKey,
  fileAvailabilityNotifyPending,
  fileAvailabilityPending,
  fileAvailabilityRevision,
  fileAvailabilitySubscribers,
  fileAvailabilityUrlPath,
  finishFileAvailabilityProbe,
  FluidComponentPreview,
  getFileAvailabilityRevision,
  jsxComponentPreviews,
  MAX_RESPONSIVE_PREVIEW_HEIGHT,
  probeFileAvailability,
  reactComponentPreviews,
  reactFileAvailability,
  renderComponentPreview,
  responsivePreviewHeight,
  ScaledComponentPreview,
  get_STATIC_PREVIEW_NOTE,
  subscribeFileAvailability,
  useFileAvailability,
};
export function installFilesUiPreviewAvailability(): () => void {
  return () => {
    reactFileAvailability = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    fileAvailabilityCache = new Map();
    fileAvailabilityPending = new Set();
    fileAvailabilitySubscribers = new Set();
    fileAvailabilityRevision = 0;
    fileAvailabilityCacheKey = (filePath: string, bytes: number) =>
      filePath + "\x00" + String(bytes);
    fileAvailabilityNotifyPending = false;
    reactComponentPreviews = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxComponentPreviews = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    MAX_RESPONSIVE_PREVIEW_HEIGHT = 4000;
    STATIC_PREVIEW_NOTE = "Static preview — see the note above.";
  };
}
