import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as Boot from "../contracts/boot";
import type * as Model from "../contracts";
import type * as Storage from "../contracts/model-storage";
import type * as Dom from "../contracts/dom";
import type * as Host from "../contracts/platform-host";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactDomClientNamespace, loadReactNamespace } from "../dependencies";
import { clampComponentStageHeight } from "../editor/components";
import { projectFilePath } from "../editor/files-index";
import { StaticPreviewFrame } from "../editor/static-preview";
import { markThumbnailReady, prepareDesignSystemThumbnailCapture } from "./thumbnail-readiness";
import { createPreviewHead, preferLivePreviewUrls, supportsLivePreviewUrls } from "./ui/preview-head";
import { resolvePreviewTheme, useHostThemeMode } from "./ui/theme";
import { parseDesignSystemFiles } from "../model/derive-system";
import { assetKindForPath, COMPONENT_FILENAMES, COVER_COMPONENT_NAME, DESIGN_SYSTEM_PATHS, encodeRelativeUrlPath, mimeTypeForPath } from "../model/file-policy";
import { toModuleNamespace } from "../module-helpers";

var reactCoverCapture: typeof React;
var reactDomCoverCapture: typeof import("react-dom/client");
var jsxCoverCapture: typeof import("react/jsx-runtime");
var COVER_COMPONENT_DIRECTORY: string;
var COVER_CAPTURE_REQUIRED_PATHS: string[];
var COVER_CAPTURE_FETCH_TIMEOUT_MS: number;
var COVER_CAPTURE_FONT_LIMITS: Boot.CoverFontLimits;
var COVER_CAPTURE_TIMEOUT_MS: number;
var COVER_CAPTURE_PAGE_WIDTH: number;
var COVER_CAPTURE_VIEWPORT_RATIO: {
  width: number;
  height: number;
};
var defaultCoverCaptureReader: Boot.CoverCaptureReader;
async function fetchCoverCaptureFile(url: string): Promise<Response | null> {
  let response = await fetch(url, {
    signal: AbortSignal.timeout(COVER_CAPTURE_FETCH_TIMEOUT_MS),
  });
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw Error(url + " answered " + String(response.status));
  }
  return response;
}
function coverHtmlContainsScript(html: string): boolean {
  return /<script[\s/>]/i.test(html);
}
function coverFontDataUri(bytes: Uint8Array, mime: string): string {
  let base64 = "";
  for (let index = 0; index < bytes.length; index += 32768) {
    base64 += String.fromCharCode(...bytes.subarray(index, index + 32768));
  }
  return "data:" + mime + ";base64," + btoa(base64);
}
async function readCoverCaptureFonts(
  paths: string[],
  reader: Boot.CoverCaptureReader,
  limits: Boot.CoverFontLimits,
): Promise<Record<string, string>> {
  let fonts: Record<string, string> = {},
    remainingBytes = limits.bytes,
    done: boolean = false,
    reads = [...new Set(paths)]
      .filter(
        (fileInput) =>
          assetKindForPath(fileInput) === "font" &&
          !COVER_CAPTURE_REQUIRED_PATHS.includes(fileInput) &&
          !/[%?#]/.test(fileInput),
      )
      .slice(0, limits.files)
      .map(async (fileInputA): Promise<void> => {
        try {
          let value = await reader.bytes(
              projectFilePath(
                encodeRelativeUrlPath(fileInputA),
              ),
            ),
            fileValue =
              value === null
                ? 0
                : value.length *
                  paths.filter((fileInputB): boolean => fileInputB === fileInputA).length;
          if (done || value === null || fileValue > remainingBytes) {
            return;
          }
          remainingBytes -= fileValue;
          fonts[fileInputA] = coverFontDataUri(
            value,
            mimeTypeForPath(fileInputA),
          );
        } catch {}
      });
  await Promise.race([
    Promise.all(reads),
    new Promise((fileInputC) => setTimeout(fileInputC, limits.deadlineMs)),
  ]);
  done = true;
  return {
    ...fonts,
  };
}
async function readCoverCaptureSystem(
  reader: Boot.CoverCaptureReader = defaultCoverCaptureReader,
  limits: Boot.CoverFontLimits = COVER_CAPTURE_FONT_LIMITS,
): Promise<Boot.CapturedCover | null> {
  let textFiles = await Promise.all(
      COVER_CAPTURE_REQUIRED_PATHS.map((fileInputD) =>
        reader.text(projectFilePath(fileInputD)),
      ),
    ),
    files: Record<string, string> = {};
  COVER_CAPTURE_REQUIRED_PATHS.forEach((fileInputE, fileOptions): void => {
    let value = textFiles[fileOptions];
    if (typeof value === "string") {
      files[fileInputE] = value;
    }
  });
  let system = parseDesignSystemFiles(files);
  if (
    system.cover === null ||
    system.cover.previewHtml.trim() === "" ||
    coverHtmlContainsScript(system.cover.previewHtml)
  ) {
    return null;
  }
  let fontFiles = await readCoverCaptureFonts(
      system.tokens.type.fonts.map((fileInputF) => fileInputF.file),
      reader,
      limits,
    ),
    fontPaths = Object.keys(fontFiles),
    capturedSystem =
      fontPaths.length === 0
        ? system
        : parseDesignSystemFiles({
            ...files,
            ...fontFiles,
          });
  if (capturedSystem.cover === null) {
    return null;
  } else {
    return {
      system: capturedSystem,
      fonts: fontPaths,
    };
  }
}
function loadCoverCaptureFontFaces({
  system,
  fonts,
}: Boot.CapturedCover): Promise<void | PromiseSettledResult<FontFace>[]> {
  if (typeof FontFace === "undefined") {
    return Promise.resolve();
  }
  let loads = system.tokens.type.fonts
    .filter((fileInputG) => fonts.includes(fileInputG.file))
    .map((fileInputH) =>
      new FontFace(
        fileInputH.family,
        'url("' + (system.files[fileInputH.file] ?? "") + '")',
        {
          weight: fileInputH.weight,
          style: fileInputH.style,
        },
      ).load(),
    );
  return Promise.allSettled(loads);
}
function coverCaptureFitWidth(
  viewportWidth: number,
  viewportHeight: number,
  pageHeight: number,
): number {
  return Math.floor(
    Math.min(
      viewportWidth * COVER_CAPTURE_VIEWPORT_RATIO.width,
      (viewportHeight *
        COVER_CAPTURE_VIEWPORT_RATIO.height *
        COVER_CAPTURE_PAGE_WIDTH) /
        pageHeight,
    ),
  );
}
function CapturedDesignSystemCover({
  captured,
  onPainted,
}: {
  captured: Boot.CapturedCover;
  onPainted(): void;
}): React.ReactElement | null {
  useUiLocale();
  let { system: value } = captured,
    ref = reactCoverCapture.useRef<HTMLDivElement | null>(null),
    fileValueA = useHostThemeMode(),
    { hostThemeId: fileResult, hostThemeMode: fileRecord } = resolvePreviewTheme(value.tokens.color.themes, fileValueA, null),
    head = createPreviewHead(
      value,
      fileRecord,
      fileResult,
      false,
      undefined,
      !(
        preferLivePreviewUrls &&
        supportsLivePreviewUrls()
      ),
    ).head,
    memo = reactCoverCapture.useMemo(
      () => ({
        ...head,
        tokensCss:
          (head.fontsCss ?? "") +
          head.tokensCss +
          "html{overflow:hidden!important}",
      }),
      [head],
    ),
    fileValueB = reactCoverCapture.useMemo(
      () => loadCoverCaptureFontFaces(captured),
      [captured],
    );
  reactCoverCapture.useLayoutEffect(() => {
    let fileEntry = ref.current?.querySelector("iframe");
    if (fileEntry == null) {
      return;
    }
    let flag: boolean = true,
      callback = (fileInputI: () => void) =>
        void requestAnimationFrame(() => requestAnimationFrame(fileInputI)),
      fileValueC = () =>
        void fileValueB.then((): void => {
          if (flag) {
            callback((): void => {
              if (flag) {
                onPainted();
              }
            });
          }
        });
    fileEntry.addEventListener("load", fileValueC, {
      once: true,
    });
    return (): void => {
      flag = false;
      fileEntry.removeEventListener("load", fileValueC);
    };
  }, [memo, fileValueB, onPainted]);
  if (value.cover === null) {
    return null;
  }
  let fileName = clampComponentStageHeight(value.cover.height),
    fileBytes = coverCaptureFitWidth(
      document.documentElement.clientWidth,
      document.documentElement.clientHeight,
      fileName,
    );
  return (
    <div
      className={"flex h-screen items-center justify-center"}
      data-testid={"ds-capture-cover"}
    >
      <div
        ref={ref}
        className={
          "ds-comp-preview-box overflow-hidden rounded-lg border border-border-line"
        }
      >
        <StaticPreviewFrame
          html={value.cover.previewHtml}
          head={memo}
          pageW={COVER_CAPTURE_PAGE_WIDTH}
          pageH={fileName}
          fitWidth={fileBytes}
          title={uiMessage("design-system.coverCapture.cover")}
        />
      </div>
    </div>
  );
}
async function renderDesignSystemCoverCapture(
  root: HTMLElement | null = document.getElementById("root"),
  reader: Boot.CoverCaptureReader = defaultCoverCaptureReader,
  timeoutMs: number = COVER_CAPTURE_TIMEOUT_MS,
): Promise<void> {
  let fallbackTimer = setTimeout(
      () => prepareDesignSystemThumbnailCapture(),
      timeoutMs,
    ),
    captured = await readCoverCaptureSystem(reader).catch((): null => null);
  if (captured === null || root === null) {
    clearTimeout(fallbackTimer);
    return prepareDesignSystemThumbnailCapture();
  }
  let painted = (): void => {
    clearTimeout(fallbackTimer);
    markThumbnailReady();
  };
  reactDomCoverCapture
    .createRoot(root)
    .render(
      <CapturedDesignSystemCover captured={captured} onPainted={painted} />,
    );
}
async function captureDesignSystemAndHoldBoot(): Promise<void> {
  await renderDesignSystemCoverCapture().catch(() =>
    prepareDesignSystemThumbnailCapture(),
  );
  return new Promise((): void => {
    return;
  });
}
export {
  CapturedDesignSystemCover,
  captureDesignSystemAndHoldBoot,
  COVER_CAPTURE_FETCH_TIMEOUT_MS,
  COVER_CAPTURE_FONT_LIMITS,
  COVER_CAPTURE_PAGE_WIDTH,
  COVER_CAPTURE_REQUIRED_PATHS,
  COVER_CAPTURE_TIMEOUT_MS,
  COVER_CAPTURE_VIEWPORT_RATIO,
  COVER_COMPONENT_DIRECTORY,
  coverCaptureFitWidth,
  coverFontDataUri,
  coverHtmlContainsScript,
  defaultCoverCaptureReader,
  fetchCoverCaptureFile,
  jsxCoverCapture,
  loadCoverCaptureFontFaces,
  reactCoverCapture,
  reactDomCoverCapture,
  readCoverCaptureFonts,
  readCoverCaptureSystem,
  renderDesignSystemCoverCapture,
};
export function installFilesCoverCapture(): () => void {
  return () => {
    reactCoverCapture = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomCoverCapture = toModuleNamespace(
      loadReactDomClientNamespace(),
      1,
    );
    jsxCoverCapture = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    COVER_COMPONENT_DIRECTORY =
      DESIGN_SYSTEM_PATHS.componentsDir +
      COVER_COMPONENT_NAME +
      "/";
    COVER_CAPTURE_REQUIRED_PATHS = [
      COVER_COMPONENT_DIRECTORY + COMPONENT_FILENAMES.preview,
      DESIGN_SYSTEM_PATHS.tokens,
      DESIGN_SYSTEM_PATHS.bundleCss,
      COVER_COMPONENT_DIRECTORY + COMPONENT_FILENAMES.readme,
      COVER_COMPONENT_DIRECTORY + COVER_COMPONENT_NAME + ".d.ts",
      DESIGN_SYSTEM_PATHS.bundleJs,
    ];
    COVER_CAPTURE_FETCH_TIMEOUT_MS = 3000;
    COVER_CAPTURE_FONT_LIMITS = {
      files: 12,
      bytes: 4194304,
      deadlineMs: 2500,
    };
    COVER_CAPTURE_TIMEOUT_MS = 6000;
    COVER_CAPTURE_PAGE_WIDTH = 960;
    COVER_CAPTURE_VIEWPORT_RATIO = {
      width: 0.78,
      height: 0.76,
    };
    defaultCoverCaptureReader = {
      text: async (fileInputJ) =>
        (await fetchCoverCaptureFile(fileInputJ))?.text() ?? null,
      bytes: async (fileInputK) => {
        let value = await fetchCoverCaptureFile(fileInputK);
        if (value === null) {
          return null;
        } else {
          return new Uint8Array(await value.arrayBuffer());
        }
      },
    };
  };
}
