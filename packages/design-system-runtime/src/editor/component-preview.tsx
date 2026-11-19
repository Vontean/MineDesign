import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { getPreviewFramePool, PREVIEW_POOL_IDLE_TTL_MS } from "./preview-pool";
import { isPublishedPreviewStillOffered, notePublishedPreviewFailure } from "./published-preview";
import { StaticPreviewFrame } from "./static-preview";
import { createLiveSwatch, reactSwatchPreview, swatchHeadKey, swatchRuntimeKey } from "./swatch-runtime";
import { toModuleNamespace } from "../module-helpers";

var reactPreviewNotice: typeof import("react");
var previewStaticNoticeShown: boolean;
var previewStaticNoticeSubscribers: Set<() => void>;
var jsxSwatchPreview: typeof import("react/jsx-runtime");
var previewOwnerSequence: number;
var PREVIEW_UPDATE_DEBOUNCE_MS: number;
var normalizedPreviewHeight: (height: number) => number;
var DEFAULT_STATIC_PREVIEW_PAGE_WIDTH: number;
var PREVIEW_POOL_ENABLED_BY_DEFAULT: boolean;
var STATIC_PREVIEW_NOTICE: string;
var PREVIEW_HEAD_STALL_TIMEOUT_MS: number;
var MAX_PREVIEW_HEAD_STALL_RETRIES: number;
var subscribePreviewPoolNoop: () => () => void;
function previewStaticNoticeSnapshot(): boolean {
  return previewStaticNoticeShown;
}
function showPreviewStaticNotice(): void {
  if (previewStaticNoticeShown) {
    return;
  }
  previewStaticNoticeShown = true;
  for (let value of [...previewStaticNoticeSubscribers]) {
    value();
  }
}
function subscribePreviewStaticNotice(listener: () => void): () => void {
  previewStaticNoticeSubscribers.add(listener);
  return (): void => {
    previewStaticNoticeSubscribers.delete(listener);
  };
}
function usePreviewStaticNotice(): boolean {
  return reactPreviewNotice.useSyncExternalStore(
    subscribePreviewStaticNotice,
    previewStaticNoticeSnapshot,
    (): boolean => false,
  );
}
function schedulePreviewIdleTask(idleCallback: () => void): () => void {
  let value = window;
  if (typeof value.requestIdleCallback === "function") {
    let idleRequestId = value.requestIdleCallback(idleCallback, {
      timeout: 500,
    });
    return () => value.cancelIdleCallback?.(idleRequestId);
  }
  let timeoutId = setTimeout(idleCallback, 0);
  return () => clearTimeout(timeoutId);
}
function useDebouncedPreviewValue<Value>(
  previewValue: Value,
  key: unknown,
  delay: number,
): Value {
  let [debouncedValue, setDebouncedValue] = (
      reactSwatchPreview as typeof React
    ).useState(previewValue),
    keyRef = (reactSwatchPreview as typeof React).useRef(key),
    valueRef = (reactSwatchPreview as typeof React).useRef(previewValue);
  valueRef.current = previewValue;
  (reactSwatchPreview as typeof React).useEffect((): void => {
    if (key === keyRef.current) {
      setDebouncedValue(previewValue);
    }
  }, [key, previewValue]);
  (reactSwatchPreview as typeof React).useEffect(() => {
    if (key === keyRef.current) {
      return;
    }
    let debounceTimer = setTimeout((): void => {
      keyRef.current = key;
      setDebouncedValue(valueRef.current);
    }, delay);
    return () => clearTimeout(debounceTimer);
  }, [key, delay]);
  return debouncedValue;
}
function ComponentPreview({
  html: html,
  cardFile: cardFile,
  fromProps: fromProps,
  head: head,
  height: height,
  title: title,
  staticReason: staticReason,
  staticPageWidth = DEFAULT_STATIC_PREVIEW_PAGE_WIDTH,
  onStaticNote: onStaticNote,
  "data-testid": dataTestid,
}: Editor.ComponentPreviewProps): React.ReactElement {
  useUiLocale();
  let debouncedHead = useDebouncedPreviewValue(
      head,
      swatchHeadKey(head),
      PREVIEW_UPDATE_DEBOUNCE_MS,
    ),
    ownerIdRef = (reactSwatchPreview as typeof React).useRef(""),
    heightRef = (reactSwatchPreview as typeof React).useRef(height);
  heightRef.current = height;
  if (ownerIdRef.current === "") {
    ownerIdRef.current = "p" + String(++previewOwnerSequence);
  }
  let previewPool: Editor.PreviewFramePool = (
      reactSwatchPreview as typeof React
    ).useMemo(() => getPreviewFramePool(), []),
    isLive: boolean =
      (reactSwatchPreview as typeof React).useSyncExternalStore(
        typeof window === "undefined"
          ? subscribePreviewPoolNoop
          : (listener: () => void) => previewPool.subscribe(listener),
        () => previewPool.phase(ownerIdRef.current),
        (): string => "idle",
      ) === "live",
    [navigated, setNavigated] = (
      reactSwatchPreview as typeof React
    ).useState(false),
    [bootFailed, setBootFailed] = (
      reactSwatchPreview as typeof React
    ).useState(false),
    [ready, setReady] = (reactSwatchPreview as typeof React).useState(
      false,
    ),
    [undeliveredKey, setUndeliveredKey] = (
      reactSwatchPreview as typeof React
    ).useState<string | null>(null),
    [urlFailureGeneration, setUrlFailureGeneration] = (
      reactSwatchPreview as typeof React
    ).useState(0),
    failedUrlRef = (reactSwatchPreview as typeof React).useRef(
      new Set<string>(),
    ),
    [initialHeight, setInitialHeight] = (
      reactSwatchPreview as typeof React
    ).useState<number | undefined>(undefined),
    initialHeightCapturedRef = (
      reactSwatchPreview as typeof React
    ).useRef(false),
    [contentHeight, setContentHeight] = (
      reactSwatchPreview as typeof React
    ).useState<number | undefined>(undefined),
    containerRef = (
      reactSwatchPreview as typeof React
    ).useRef<HTMLDivElement | null>(null),
    mountRef = (
      reactSwatchPreview as typeof React
    ).useRef<HTMLDivElement | null>(null),
    intersectionObserverRef = (
      reactSwatchPreview as typeof React
    ).useRef<IntersectionObserver | null>(null),
    observeContainer = (reactSwatchPreview as typeof React).useMemo(
      () =>
        (container: HTMLDivElement | null): void => {
          let current = ownerIdRef.current;
          containerRef.current = container;
          intersectionObserverRef.current?.disconnect();
          intersectionObserverRef.current = null;
          if (container === null) {
            return;
          }
          if (typeof IntersectionObserver === "undefined") {
            previewPool.visible(current, true);
            return;
          }
          let value = new IntersectionObserver(
            (entries: IntersectionObserverEntry[]): void => {
              for (let entry of entries) {
                previewPool.visible(current, entry.isIntersecting);
              }
            },
            {
              rootMargin: "200px",
            },
          );
          value.observe(container);
          intersectionObserverRef.current = value;
        },
      [previewPool],
    );
  (reactSwatchPreview as typeof React).useEffect(
    () => (): void => {
      intersectionObserverRef.current?.disconnect();
      previewPool.remove(ownerIdRef.current);
    },
    [previewPool],
  );
  (reactSwatchPreview as typeof React).useEffect(() => {
    if (!isLive) {
      return;
    }
    let value = setTimeout(
      () => previewPool.tick(),
      PREVIEW_POOL_IDLE_TTL_MS + 50,
    );
    return () => clearTimeout(value);
  }, [isLive, previewPool]);
  let headKey = (reactSwatchPreview as typeof React).useMemo(
      () => swatchHeadKey(debouncedHead),
      [debouncedHead],
    ),
    headRef = (reactSwatchPreview as typeof React).useRef(
      debouncedHead,
    );
  headRef.current = debouncedHead;
  let hasStaticReason = staticReason !== undefined && staticReason !== "",
    runtimeKey = swatchRuntimeKey(debouncedHead);
  (reactSwatchPreview as typeof React).useEffect((): void => {
    setBootFailed(false);
    setNavigated(false);
    setUndeliveredKey(null);
  }, [html, runtimeKey]);
  let previewKey: string =
      runtimeKey +
      `
` +
      html,
    skipCardAddress: boolean = undeliveredKey === previewKey;
  (reactSwatchPreview as typeof React).useEffect((): void => {
    setInitialHeight(undefined);
    setContentHeight(undefined);
  }, [html]);
  (reactSwatchPreview as typeof React).useEffect((): void => {
    initialHeightCapturedRef.current = false;
  }, [html, headKey]);
  (reactSwatchPreview as typeof React).useEffect(() => {
    let current = ownerIdRef.current;
    if (!isLive) {
      return;
    }
    if (
      PREVIEW_POOL_ENABLED_BY_DEFAULT ||
      hasStaticReason ||
      navigated ||
      bootFailed
    ) {
      previewPool.remove(current);
      return;
    }
    let mountElement = mountRef.current;
    if (mountElement === null) {
      return;
    }
    setReady(false);
    let value: Editor.LiveSwatch | null = null,
      stallTimer: ReturnType<typeof setTimeout> | undefined,
      scheduleStallCheck = schedulePreviewIdleTask((): void => {
        let stallStartTime: number = Date.now(),
          callback = () => clearTimeout(stallTimer);
        value = createLiveSwatch({
          html: html,
          ...(cardFile !== undefined && !skipCardAddress
            ? {
                cardFile: cardFile,
              }
            : {}),
          ...(fromProps === true
            ? {
                fromProps: fromProps,
              }
            : {}),
          head: headRef.current,
          title: title,
          onUrlMissed: (reference: Editor.SwatchUrlReference) =>
            notePublishedPreviewFailure(reference.url, reference.file),
          urlOffered: isPublishedPreviewStillOffered,
          onNavigated: (): void => {
            callback();
            previewPool.booted(current);
            setNavigated(true);
          },
          onReady: (readyHeight?: number): void => {
            callback();
            if (
              !initialHeightCapturedRef.current &&
              Date.now() - stallStartTime <= PREVIEW_POOL_IDLE_TTL_MS
            ) {
              initialHeightCapturedRef.current = true;
              if (readyHeight !== undefined) {
                setInitialHeight((measuredHeight): number =>
                  Math.max(measuredHeight ?? 0, readyHeight),
                );
              }
            }
            previewPool.booted(current);
            setReady(true);
          },
          onContentHeight: setContentHeight,
          declaredHeight: normalizedPreviewHeight(heightRef.current),
          onError: (errorType?: "react"): void => {
            callback();
            previewPool.booted(current);
            if (errorType === "react") {
              showPreviewStaticNotice();
            }
            setBootFailed(true);
          },
          onUndelivered: (): void => {
            callback();
            setUndeliveredKey(previewKey);
          },
        });
        mountElement.appendChild(value!.iframe);
        let preview = value!,
          index = 0,
          scheduleHeadStall = (delayMs: number): boolean => {
            if ((index += 1) > MAX_PREVIEW_HEAD_STALL_RETRIES) {
              return false;
            }
            stallTimer = setTimeout(checkHeadStall, delayMs);
            return true;
          },
          flag: boolean = false,
          checkHeadStall = () => {
            let headProgress = preview.headProgress();
            if (headProgress.state === "placed" || headProgress.state === "gone") {
              return;
            }
            let documentAge = preview.documentAgeMs();
            if (
              (documentAge === undefined && headProgress.state === "no-document") ||
              headProgress.state === "not-reached"
            ) {
              flag = headProgress.state === "not-reached";
              return void (stallTimer = setTimeout(
                checkHeadStall,
                PREVIEW_HEAD_STALL_TIMEOUT_MS,
              ));
            }
            if (
              (document.hidden || headProgress.state === "no-document") &&
              scheduleHeadStall(PREVIEW_HEAD_STALL_TIMEOUT_MS)
            ) {
              return;
            }
            if (headProgress.state !== "waiting") {
              return;
            }
            if (flag) {
              flag = false;
              return void (stallTimer = setTimeout(
                checkHeadStall,
                PREVIEW_HEAD_STALL_TIMEOUT_MS,
              ));
            }
            if (
              documentAge !== undefined &&
              documentAge < PREVIEW_HEAD_STALL_TIMEOUT_MS
            ) {
              return void (stallTimer = setTimeout(
                checkHeadStall,
                Math.max(50, PREVIEW_HEAD_STALL_TIMEOUT_MS - documentAge),
              ));
            }
            let pendingFrame = headProgress.on ?? preview.awaited[0];
            if (
              pendingFrame === undefined ||
              failedUrlRef.current.has(pendingFrame.url)
            ) {
              return;
            }
            failedUrlRef.current.add(pendingFrame.url);
            notePublishedPreviewFailure(
              pendingFrame.url,
              pendingFrame.file,
              String(PREVIEW_HEAD_STALL_TIMEOUT_MS / 1000),
            );
            setUrlFailureGeneration((generation) => generation + 1);
          };
        if (
          preview.awaited.some(
            (reference): boolean => !failedUrlRef.current.has(reference.url),
          )
        ) {
          stallTimer = setTimeout(checkHeadStall, PREVIEW_HEAD_STALL_TIMEOUT_MS);
        }
      });
    return (): void => {
      scheduleStallCheck();
      clearTimeout(stallTimer);
      value?.dispose();
      setContentHeight(undefined);
    };
  }, [
    isLive,
    navigated,
    bootFailed,
    hasStaticReason,
    html,
    cardFile,
    fromProps,
    headKey,
    title,
    previewPool,
    skipCardAddress,
    urlFailureGeneration,
  ]);
  let staticNotice: string | null = PREVIEW_POOL_ENABLED_BY_DEFAULT
    ? uiMessage("design-system.componentPreview.staticPreviewInteractiveSwatchesAre")
    : hasStaticReason
      ? staticReason!
      : navigated
        ? uiMessage("design-system.componentPreview.livePreviewStoppedThePreview")
        : bootFailed
          ? uiMessage("design-system.componentPreview.thisPreviewCouldNotRun")
          : null;
  (reactSwatchPreview as typeof React).useEffect((): void => {
    onStaticNote?.(staticNotice);
  }, [onStaticNote, staticNotice]);
  let effectiveHeight = normalizedPreviewHeight(
      Math.max(height, initialHeight ?? 0, contentHeight ?? 0),
    ),
    containerStyle: React.CSSProperties = {
      width: "100%",
      height: effectiveHeight,
      overflow: "hidden",
      position: "relative",
    },
    mountStyle: React.CSSProperties = {
      width: "100%",
      height: effectiveHeight,
    },
    renderStaticPreview = (htmlContent: string | null) => (
      <div data-testid={dataTestid}>
        {[<StaticPreviewFrame
            html={html}
            head={debouncedHead}
            pageW={staticPageWidth}
            pageH={effectiveHeight}
            fitWidth={staticPageWidth}
            title={uiMessage("design-system.componentPreview.staticPreview", { value1: String(title) })}
          />, onStaticNote === undefined ? (
            <p
              className={
                "ds-swatch-note ds-pad mt-xs text-footnote text-muted"
              }
            >
              {htmlContent}
            </p>
          ) : null]}
      </div>
    );
  if (
    PREVIEW_POOL_ENABLED_BY_DEFAULT ||
    hasStaticReason ||
    navigated ||
    bootFailed
  ) {
    return renderStaticPreview(staticNotice);
  }
  return (
    <div
      ref={observeContainer}
      className={
        "ds-page-box ds-swatch-box" + (ready ? " ds-swatch-ready" : "")
      }
      style={containerStyle}
      data-testid={dataTestid}
    >
      <div ref={mountRef} style={mountStyle} />
    </div>
  );
}
function get_STATIC_PREVIEW_NOTICE() {
  return uiMessage("design-system.componentPreview.staticPreviewInteractiveSwatchesAre");
}
export {
  ComponentPreview,
  DEFAULT_STATIC_PREVIEW_PAGE_WIDTH,
  jsxSwatchPreview,
  MAX_PREVIEW_HEAD_STALL_RETRIES,
  normalizedPreviewHeight,
  PREVIEW_HEAD_STALL_TIMEOUT_MS,
  PREVIEW_POOL_ENABLED_BY_DEFAULT,
  PREVIEW_UPDATE_DEBOUNCE_MS,
  previewOwnerSequence,
  previewStaticNoticeShown,
  previewStaticNoticeSnapshot,
  previewStaticNoticeSubscribers,
  reactPreviewNotice,
  schedulePreviewIdleTask,
  showPreviewStaticNotice,
  get_STATIC_PREVIEW_NOTICE,
  subscribePreviewPoolNoop,
  subscribePreviewStaticNotice,
  useDebouncedPreviewValue,
  usePreviewStaticNotice,
};
export function installEditorComponentPreview(): () => void {
  return () => {
    reactPreviewNotice = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    previewStaticNoticeShown = false;
    previewStaticNoticeSubscribers = new Set();
    jsxSwatchPreview = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    previewOwnerSequence = 0;
    PREVIEW_UPDATE_DEBOUNCE_MS = 400;
    normalizedPreviewHeight = (height: number): number =>
      Number.isFinite(height)
        ? Math.min(4000, Math.max(40, Math.round(height)))
        : 120;
    DEFAULT_STATIC_PREVIEW_PAGE_WIDTH = 720;
    PREVIEW_POOL_ENABLED_BY_DEFAULT = false;
    STATIC_PREVIEW_NOTICE =
      "Static preview — interactive swatches are temporarily switched off.";
    PREVIEW_HEAD_STALL_TIMEOUT_MS = PREVIEW_POOL_IDLE_TTL_MS;
    MAX_PREVIEW_HEAD_STALL_RETRIES = 5;
    subscribePreviewPoolNoop = () => (): void => {
      return;
    };
  };
}
