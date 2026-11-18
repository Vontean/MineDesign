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
function schedulePreviewIdleTask(callback: () => void): () => void {
  let value = window;
  if (typeof value.requestIdleCallback === "function") {
    let value3 = value.requestIdleCallback(callback, {
      timeout: 500,
    });
    return () => value.cancelIdleCallback?.(value3);
  }
  let value2 = setTimeout(callback, 0);
  return () => clearTimeout(value2);
}
function useDebouncedPreviewValue<Value>(
  value: Value,
  key: unknown,
  delay: number,
): Value {
  let [debouncedValue, setDebouncedValue] = (
      reactSwatchPreview as typeof React
    ).useState(value),
    keyRef = (reactSwatchPreview as typeof React).useRef(key),
    valueRef = (reactSwatchPreview as typeof React).useRef(value);
  valueRef.current = value;
  (reactSwatchPreview as typeof React).useEffect((): void => {
    if (key === keyRef.current) {
      setDebouncedValue(value);
    }
  }, [key, value]);
  (reactSwatchPreview as typeof React).useEffect(() => {
    if (key === keyRef.current) {
      return;
    }
    let value2 = setTimeout((): void => {
      keyRef.current = key;
      setDebouncedValue(valueRef.current);
    }, delay);
    return () => clearTimeout(value2);
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
          : (input: () => void) => previewPool.subscribe(input),
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
        (input: HTMLDivElement | null): void => {
          let current = ownerIdRef.current;
          containerRef.current = input;
          intersectionObserverRef.current?.disconnect();
          intersectionObserverRef.current = null;
          if (input === null) {
            return;
          }
          if (typeof IntersectionObserver === "undefined") {
            previewPool.visible(current, true);
            return;
          }
          let value = new IntersectionObserver(
            (input2: IntersectionObserverEntry[]): void => {
              for (let value2 of input2) {
                previewPool.visible(current, value2.isIntersecting);
              }
            },
            {
              rootMargin: "200px",
            },
          );
          value.observe(input);
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
    let current2 = mountRef.current;
    if (current2 === null) {
      return;
    }
    setReady(false);
    let value: Editor.LiveSwatch | null = null,
      value2: ReturnType<typeof setTimeout> | undefined,
      value3 = schedulePreviewIdleTask((): void => {
        let value4: number = Date.now(),
          callback = () => clearTimeout(value2);
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
          onUrlMissed: (input: Editor.SwatchUrlReference) =>
            notePublishedPreviewFailure(input.url, input.file),
          urlOffered: isPublishedPreviewStillOffered,
          onNavigated: (): void => {
            callback();
            previewPool.booted(current);
            setNavigated(true);
          },
          onReady: (input?: number): void => {
            callback();
            if (
              !initialHeightCapturedRef.current &&
              Date.now() - value4 <= PREVIEW_POOL_IDLE_TTL_MS
            ) {
              initialHeightCapturedRef.current = true;
              if (input !== undefined) {
                setInitialHeight((input2): number =>
                  Math.max(input2 ?? 0, input),
                );
              }
            }
            previewPool.booted(current);
            setReady(true);
          },
          onContentHeight: setContentHeight,
          declaredHeight: normalizedPreviewHeight(heightRef.current),
          onError: (input?: "react"): void => {
            callback();
            previewPool.booted(current);
            if (input === "react") {
              showPreviewStaticNotice();
            }
            setBootFailed(true);
          },
          onUndelivered: (): void => {
            callback();
            setUndeliveredKey(previewKey);
          },
        });
        current2.appendChild(value!.iframe);
        let value5 = value!,
          index = 0,
          callback2 = (input: number): boolean => {
            if ((index += 1) > MAX_PREVIEW_HEAD_STALL_RETRIES) {
              return false;
            }
            value2 = setTimeout(callback3, input);
            return true;
          },
          flag: boolean = false,
          callback3 = () => {
            let value6 = value5.headProgress();
            if (value6.state === "placed" || value6.state === "gone") {
              return;
            }
            let value7 = value5.documentAgeMs();
            if (
              (value7 === undefined && value6.state === "no-document") ||
              value6.state === "not-reached"
            ) {
              flag = value6.state === "not-reached";
              return void (value2 = setTimeout(
                callback3,
                PREVIEW_HEAD_STALL_TIMEOUT_MS,
              ));
            }
            if (
              (document.hidden || value6.state === "no-document") &&
              callback2(PREVIEW_HEAD_STALL_TIMEOUT_MS)
            ) {
              return;
            }
            if (value6.state !== "waiting") {
              return;
            }
            if (flag) {
              flag = false;
              return void (value2 = setTimeout(
                callback3,
                PREVIEW_HEAD_STALL_TIMEOUT_MS,
              ));
            }
            if (
              value7 !== undefined &&
              value7 < PREVIEW_HEAD_STALL_TIMEOUT_MS
            ) {
              return void (value2 = setTimeout(
                callback3,
                Math.max(50, PREVIEW_HEAD_STALL_TIMEOUT_MS - value7),
              ));
            }
            let value8 = value6.on ?? value5.awaited[0];
            if (
              value8 === undefined ||
              failedUrlRef.current.has(value8.url)
            ) {
              return;
            }
            failedUrlRef.current.add(value8.url);
            notePublishedPreviewFailure(
              value8.url,
              value8.file,
              String(PREVIEW_HEAD_STALL_TIMEOUT_MS / 1000),
            );
            setUrlFailureGeneration((input) => input + 1);
          };
        if (
          value5.awaited.some(
            (input): boolean => !failedUrlRef.current.has(input.url),
          )
        ) {
          value2 = setTimeout(callback3, PREVIEW_HEAD_STALL_TIMEOUT_MS);
        }
      });
    return (): void => {
      value3();
      clearTimeout(value2);
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
    renderStaticPreview = (input: string | null) => (
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
              {input}
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
