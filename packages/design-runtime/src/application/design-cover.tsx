import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { ArtboardFrame } from "../canvas/artboard-frame";
import { markCaptureFramesReady } from "../canvas/frame-readiness";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { EditorChromeRoot } from "../editor/chrome/root";
import { EditorToastProvider } from "../editor/chrome/toast";
import { toModuleNamespace } from "../module-helpers";
import { isLoadingArtboardHtml } from "../platform/design-document-adapter";
import { artboardRadiusCss, canvasMetadataFile, designPageContents, designPageId, isArtboardFile, parseCanvasMetadata, primaryDesignFile } from "../platform/file-content";

var ReactCover: Dynamic;
var MAX_COVER_ARTBOARDS: Dynamic;
var COVER_VIEWPORT_PADDING: Dynamic;
var COVER_ASPECT_LIMITS: Dynamic;
var coverJsxRuntime: Dynamic;
var ignoreCoverCallback: Dynamic;
var COVER_PAINT_TIMEOUT_MS: Dynamic;
function computeCoverBounds(
  boards?: Dynamic,
  viewportWidth?: Dynamic,
  viewportHeight?: Dynamic,
): Dynamic {
  let left: Dynamic = Math.min(
      ...boards.map((board?: Dynamic): Dynamic => board.x),
    ),
    top: Dynamic = Math.min(
      ...boards.map((board?: Dynamic): Dynamic => board.y),
    ),
    width: Dynamic =
      Math.max(
        ...boards.map((board?: Dynamic): Dynamic => board.x + board.w),
      ) - left,
    height: Dynamic =
      Math.max(
        ...boards.map((board?: Dynamic): Dynamic => board.y + board.h),
      ) - top,
    availableWidth: Dynamic = Math.min(
      viewportWidth - 2 * COVER_VIEWPORT_PADDING,
      viewportHeight * COVER_ASPECT_LIMITS.narrow,
    ),
    availableHeight: Dynamic = Math.min(
      viewportHeight - 2 * COVER_VIEWPORT_PADDING,
      viewportWidth / COVER_ASPECT_LIMITS.wide,
    );
  return {
    left: left,
    top: top,
    w: width,
    h: height,
    scale:
      availableWidth > 0 && availableHeight > 0 && width > 0 && height > 0
        ? Math.min(availableWidth / width, availableHeight / height)
        : 0,
  };
}
function selectCoverArtboard(content?: Dynamic): Dynamic {
  let manifest: Dynamic = parseCanvasMetadata(
      content.files[canvasMetadataFile] ?? null,
      content.files,
    ),
    hasContent: Dynamic = (board?: Dynamic): Dynamic =>
      !isLoadingArtboardHtml(content.files[board.file] ?? ""),
    coverBoard: Dynamic = manifest.artboards.find(
      (board?: Dynamic): Dynamic => board.file === manifest.cover,
    );
  return coverBoard !== undefined && hasContent(coverBoard)
    ? coverBoard
    : (manifest.artboards.find(
        (board?: Dynamic): Dynamic => !board.frameless && hasContent(board),
      ) ?? manifest.artboards.find(hasContent));
}
function selectCoverSnapshotBoards(content?: Dynamic): Dynamic {
  let manifest: Dynamic = parseCanvasMetadata(
    content.files[canvasMetadataFile] ?? null,
    content.files,
  );
  if (manifest.cover !== undefined) return;
  let isSnapshotBoard: Dynamic = (board?: Dynamic): Dynamic =>
      !board.frameless &&
      !isLoadingArtboardHtml(content.files[board.file] ?? ""),
    firstBoard: Dynamic = manifest.artboards.find(isSnapshotBoard);
  if (firstBoard === undefined) return;
  let boardsForPage: Dynamic = (pageId?: Dynamic): Dynamic =>
      designPageContents(manifest, pageId)
        .artboards.filter(isSnapshotBoard)
        .slice(0, MAX_COVER_ARTBOARDS),
    launchFile: Dynamic =
      manifest.launch?.view === "focused"
        ? manifest.launch.file
        : primaryDesignFile(content),
    launchBoard: Dynamic = manifest.artboards.find(
      (board?: Dynamic): Dynamic => board.file === launchFile,
    ),
    launchPage: Dynamic =
      manifest.launch?.view === "canvas" && manifest.launch.page !== undefined
        ? manifest.launch.page
        : launchBoard !== undefined
          ? designPageId(launchBoard, manifest.pages)
          : undefined,
    pageBoards: Dynamic =
      launchPage !== undefined ? boardsForPage(launchPage) : [];
  return pageBoards.length > 0
    ? pageBoards
    : boardsForPage(designPageId(firstBoard, manifest.pages));
}
function selectDesignCover(
  content?: Dynamic,
  allowSnapshot: Dynamic = true,
): Dynamic {
  let snapshotBoards: Dynamic = allowSnapshot
    ? selectCoverSnapshotBoards(content)
    : undefined;
  if (snapshotBoards !== undefined)
    return {
      boards: snapshotBoards,
      snapshot: true,
    };
  let coverBoard: Dynamic = selectCoverArtboard(content);
  return coverBoard !== undefined
    ? {
        boards: [coverBoard],
        snapshot: false,
      }
    : undefined;
}
function DesignCover({
  doc: doc,
  assets: assets,
  maySnapshot = true,
  Board = ArtboardFrame,
}: Dynamic): Dynamic {
  useUiLocale();
  let exitGuardRef: Dynamic = (0, ReactCover.useRef)(null),
    textEditOpenRef: Dynamic = (0, ReactCover.useRef)(null),
    settleSessionRef: Dynamic = (0, ReactCover.useRef)(null),
    actionsRef: Dynamic = (0, ReactCover.useRef)(null),
    content: Dynamic = (0, ReactCover.useSyncExternalStore)(
      (0, ReactCover.useCallback)(
        (onChange?: Dynamic): Dynamic => doc.subscribe((): Dynamic => onChange()),
        [doc],
      ),
      (): Dynamic => doc.content(),
    ),
    isLoaded: Dynamic = (0, ReactCover.useSyncExternalStore)(
      (0, ReactCover.useCallback)(
        (onChange?: Dynamic): Dynamic =>
          "subscribeLoad" in doc
            ? doc.subscribeLoad(onChange)
            : (): Dynamic => {},
        [doc],
      ),
      (): Dynamic => !("loadState" in doc) || doc.loadState() === "live",
    );
  (0, ReactCover.useEffect)((): Dynamic => {
    let value: Dynamic = doc.title();
    value !== "" &&
      value !== (document as Dynamic).title &&
      ((document as Dynamic).title = value);
  }, [doc, content]);
  let coverRef: Dynamic = (0, ReactCover.useRef)(undefined);
  isLoaded &&
    coverRef.current === undefined &&
    (coverRef.current = selectDesignCover(content, maySnapshot));
  let hasCover: Dynamic = coverRef.current !== undefined,
    boards: Dynamic = coverRef.current?.boards ?? [],
    isSnapshot: Dynamic = coverRef.current?.snapshot ?? false,
    hasArtboards: Dynamic = Object.keys(content.files).some(
      isArtboardFile,
    ),
    [paintStates, setPaintStates]: Dynamic = (0, ReactCover.useState)(
      (): Dynamic => new Map(),
    ),
    onBoardPainted: Dynamic = (0, ReactCover.useCallback)(
      (file?: Dynamic): Dynamic =>
        setPaintStates(
          (previousStates?: Dynamic): Dynamic =>
            previousStates.get(file) === "painted"
              ? previousStates
              : new Map(previousStates).set(file, "painted"),
        ),
      [],
    ),
    onBoardBlocked: Dynamic = (0, ReactCover.useCallback)(
      (file?: Dynamic, isBlocked?: Dynamic): Dynamic => {
        isBlocked &&
          setPaintStates(
            (previousStates?: Dynamic): Dynamic =>
              previousStates.get(file) === "failed"
                ? previousStates
                : new Map(previousStates).set(file, "failed"),
          );
      },
      [],
    ),
    hasPaintedBoard: Dynamic = [...paintStates.values()].includes("painted"),
    [paintTimeoutElapsed, setPaintTimeoutElapsed]: Dynamic = (0,
    ReactCover.useState)(false);
  (0, ReactCover.useEffect)((): Dynamic => {
    if (!hasCover) return;
    let value: Dynamic = setTimeout(
      (): Dynamic => setPaintTimeoutElapsed(true),
      COVER_PAINT_TIMEOUT_MS,
    );
    return (): Dynamic => clearTimeout(value);
  }, [hasCover]);
  let thumbnailReady: Dynamic = hasCover
    ? paintStates.size >= boards.length ||
      (paintTimeoutElapsed && hasPaintedBoard)
    : isLoaded && !hasArtboards;
  (0, ReactCover.useEffect)((): Dynamic => {
    thumbnailReady &&
      requestAnimationFrame(
        (): Dynamic => markCaptureFramesReady(),
      );
  }, [thumbnailReady]);
  let renderBoard: Dynamic = (board?: Dynamic): Dynamic =>
      (() => {
        const _Component = Board;
        const _props = {
          file: board.file,
          displayTitle: board.title ?? board.file,
          assets: assets,
          doc: doc,
          focused: false,
          editable: false,
          panelMounted: false,
          frameArmed: true,
          expanded: true,
          onReadyGen: onBoardPainted,
          onBlockedChange: onBoardBlocked,
          onHandle: ignoreCoverCallback,
          onPreviewDropNotice: ignoreCoverCallback,
          onSessionDirtyChange: ignoreCoverCallback,
          onUndoStack: ignoreCoverCallback,
          exitGuardRef: exitGuardRef,
          textEditOpenRef: textEditOpenRef,
          settleSessionRef: settleSessionRef,
          actionsRef: actionsRef,
        } as const;
        const _key = board.file;
        return <_Component key={_key} {..._props} />;
      })(),
    firstBoard: Dynamic = boards[0];
  return (
    <EditorChromeRoot>
      <EditorToastProvider>
        {isSnapshot ? (<CanvasSnapshotCover
            boards={boards}
            veiled={!hasPaintedBoard}
            empty={(board?: Dynamic): Dynamic =>
              paintStates.get(board.file) !== "painted"
            }
          >
            {renderBoard}
          </CanvasSnapshotCover>) : (<SingleArtboardCover
            w={firstBoard?.w}
            h={firstBoard?.h}
            veiled={firstBoard !== undefined && !hasPaintedBoard}
          >
            {firstBoard !== undefined ? (renderBoard(firstBoard)) : (null)}
          </SingleArtboardCover>)}
      </EditorToastProvider>
    </EditorChromeRoot>
  );
}
function SingleArtboardCover({
  w: width,
  h: height,
  veiled: veiled,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let containerRef: Dynamic = (0, ReactCover.useRef)(null),
    [scale, setScale]: Dynamic = (0, ReactCover.useState)(1);
  (0, ReactCover.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = containerRef.current;
    if (!current || width === undefined || height === undefined) return;
    let callback: Dynamic = (): Dynamic =>
      setScale(
        Math.max(
          current.clientWidth / width,
          current.clientHeight / height,
        ) || 1,
      );
    callback();
    let observer: Dynamic = new ResizeObserver(callback);
    observer.observe(current);
    return (): Dynamic => observer.disconnect();
  }, [width, height]);
  return (
    <div
      ref={containerRef}
      data-design-cover={""}
      className={
        "fixed inset-0 flex items-start justify-center overflow-clip bg-om-bg-canvas"
      }
    >
      {width === undefined || height === undefined ? (children) : (<div
          style={{
            width: width * scale,
            height: height * scale,
            flex: "none",
          }}
        >
          <div
            className={"relative flex flex-col overflow-hidden bg-white"}
            style={{
              width: width,
              height: height,
              transform: "scale(" + String(scale) + ")",
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>)}
      {veiled ? (<div
          data-design-cover-veil={""}
          className={"absolute inset-0 bg-om-bg-canvas"}
        />) : (null)}
    </div>
  );
}
function CanvasSnapshotCover({
  boards: boards,
  veiled: veiled,
  empty: isEmptyBoard,
  children: renderBoard,
}: Dynamic): Dynamic {
  useUiLocale();
  let containerRef: Dynamic = (0, ReactCover.useRef)(null),
    [viewport, setViewport]: Dynamic = (0, ReactCover.useState)({
      w: 0,
      h: 0,
    });
  (0, ReactCover.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = containerRef.current;
    if (!current) return;
    let callback: Dynamic = (): Dynamic =>
      setViewport({
        w: current.clientWidth,
        h: current.clientHeight,
      });
    callback();
    let observer: Dynamic = new ResizeObserver(callback);
    observer.observe(current);
    return (): Dynamic => observer.disconnect();
  }, []);
  let {
      left: left,
      top: top,
      w: width,
      h: height,
      scale: scale,
    }: Dynamic = computeCoverBounds(boards, viewport.w, viewport.h),
    borderShadow: Dynamic =
      "0 0 0 " + String(scale > 0 ? 1 / scale : 0) + "px var(--cds-border)";
  return (
    <div
      ref={containerRef}
      data-design-cover={""}
      className={
        "fixed inset-0 flex items-center justify-center overflow-clip bg-om-bg-canvas"
      }
    >
      <div
        style={{
          width: width * scale,
          height: height * scale,
          flex: "none",
        }}
      >
        <div
          className={"relative"}
          style={{
            width: width,
            height: height,
            transform: "scale(" + String(scale) + ")",
            transformOrigin: "top left",
          }}
        >
          {boards.map(
            (board?: Dynamic): Dynamic =>
              (() => {
                const BoardElement = "div";
                const boardProps = {
                  className:
                    "absolute isolate flex flex-col overflow-hidden bg-white",
                  style: {
                    left: board.x - left,
                    top: board.y - top,
                    width: board.w,
                    height: board.h,
                    boxShadow: borderShadow,
                    borderRadius: artboardRadiusCss(
                      board.radius,
                    ),
                  },
                  children: [
                    renderBoard(board),
                    isEmptyBoard(board) ? (
                      <div
                        data-design-cover-empty={""}
                        className={"absolute inset-0 z-20 bg-om-bg-canvas"}
                      />
                    ) : null,
                  ],
                } as const;
                const boardKey = board.file;
                return <BoardElement key={boardKey} {...boardProps} />;
              })(),
          )}
        </div>
      </div>
      {veiled ? (<div
          data-design-cover-veil={""}
          className={"absolute inset-0 bg-om-bg-canvas"}
        />) : (null)}
    </div>
  );
}
export {
  CanvasSnapshotCover,
  computeCoverBounds,
  COVER_ASPECT_LIMITS,
  COVER_PAINT_TIMEOUT_MS,
  COVER_VIEWPORT_PADDING,
  coverJsxRuntime,
  DesignCover,
  ignoreCoverCallback,
  MAX_COVER_ARTBOARDS,
  ReactCover,
  selectCoverArtboard,
  selectCoverSnapshotBoards,
  selectDesignCover,
  SingleArtboardCover,
};
export function installApplicationDesignCover(): () => void {
  return () => {
    ReactCover = toModuleNamespace(load_react(), 1);
    MAX_COVER_ARTBOARDS = 24;
    COVER_VIEWPORT_PADDING = 24;
    COVER_ASPECT_LIMITS = {
      narrow: 1.5,
      wide: 2.5,
    };
    coverJsxRuntime = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    ignoreCoverCallback = (): Dynamic => {};
    COVER_PAINT_TIMEOUT_MS = 6e3;
  };
}
