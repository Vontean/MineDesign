import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { designCreationTipIndex, timeUntilNextDesignCreationTip } from "./creation-prompt";
import { viewportScaleLimits } from "./viewport-memory";
import { CanvasWorkingStateConstant, CanvasWorkingStateRegistry, subscribeRemoteDocumentUpdates } from "./working-state";
import { PeerBadge } from "../collaboration/peer-badge";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { announce } from "../editor/accessibility/announcer";
import { ClipboardWorkingFilesHandler } from "../editor/clipboard/working-files";
import { toModuleNamespace } from "../module-helpers";
import { claudeActivityStore } from "../platform/claude-activity";
import { getFeatureFlag } from "../platform/feature-flags";
import { designPageId, isArtboardFile, isDesignSystemFile, PlatformFileContentConstant_5 as defaultArtboardWidth, PlatformFileContentConstant_6 as defaultArtboardHeight } from "../platform/file-content";

var jsx_U1e: Dynamic;
var creationCursorContentInset: Dynamic;
var creationCursorHeaderOffset: Dynamic;
var react_Gu: Dynamic;
var emptyCreationProgress: Dynamic;
var supportsListedArtboards: Dynamic;
var getListedArtboards: Dynamic;
var emptyListedArtboards: Dynamic;
var creationProgressStateKey: Dynamic;
var listedArtboardNames: Dynamic;
var emptyPendingArtboards: Dynamic;
var emptyCreationBoxes: Dynamic;
var emptyCreationCoverFiles: Dynamic;
var emptyCreationProgressUi: Dynamic;
var creationProgressRetryMs: Dynamic;
var creationProgressOptions: Dynamic;
var fitArtboardPadding: Dynamic;
var fitArtboardHeaderHeight: Dynamic;
var firstArtboardInReadingOrder: Dynamic;
var creationSequenceFeatureFlagName: Dynamic;
var creationSequenceFeatureFlag: Dynamic;
var creationSequenceEnabled: Dynamic;
function DesignCreationCursor({
  cursor: cursor,
  boards: boards,
  artboards: artboards,
  scale: scale,
}: Dynamic): Dynamic {
  useUiLocale();
  if (cursor.at !== "box" && cursor.at !== "rest") return null;
  let targetBoard: Dynamic = (cursor.at === "box" ? boards : artboards).find(
    (board?: Dynamic): Dynamic => board.file === cursor.file,
  );
  if (targetBoard === undefined) return null;
  let cursorPosition: Dynamic =
    cursor.at === "box"
      ? {
          left: targetBoard.x + creationCursorContentInset / scale,
          top: targetBoard.y + creationCursorContentInset / scale,
        }
      : {
          left: targetBoard.x,
          top: targetBoard.y - creationCursorHeaderOffset / scale,
        };
  return (
    <div
      aria-hidden={"true"}
      data-testid={"dc-creation-cursor"}
      className={"pointer-events-none absolute left-0 top-0"}
    >
      <PeerBadge
        tint={"violet"}
        label={{
          kind: "name",
          // MineDesign: user-facing copy calls the agent "the agent", not Claude.
          text: "Agent",
        }}
        at={cursorPosition}
        glyphScale={1 / scale}
      />
    </div>
  );
}
function computeDesignCreationProgress(progressInput?: Dynamic): Dynamic {
  if (!progressInput.on) return emptyCreationProgress;
  let progressWindowEnd: Dynamic =
      progressInput.lastProgressAt === undefined
        ? undefined
        : progressInput.lastProgressAt + 6e5,
    isAgentActive: Dynamic = progressInput.heard || progressInput.working,
    isInTurn: Dynamic = isAgentActive
      ? progressInput.working
      : progressWindowEnd !== undefined && progressInput.now < progressWindowEnd,
    pageBoxes: Dynamic = isInTurn
      ? progressInput.boxed.filter(
          (box?: Dynamic): Dynamic => box.page === progressInput.page,
        )
      : [],
    boxSpecs: Dynamic = pageBoxes.map((box?: Dynamic): Dynamic => box.spec),
    settledBox: Dynamic = pageBoxes.find(
      (box?: Dynamic): Dynamic => box.arriving !== true,
    ),
    hasBoxed: Dynamic = progressInput.boxedThisTurn || progressInput.boxed.length > 0,
    graceUntil: Dynamic =
      progressInput.lastProgressAt === undefined
        ? undefined
        : progressInput.lastProgressAt + 9e4,
    isInGrace: Dynamic =
      !isAgentActive && isInTurn && graceUntil !== undefined && progressInput.now < graceUntil,
    cursor: Dynamic = {
      at: "none",
    };
  (progressInput.working || isInGrace) &&
    progressInput.editing &&
    (settledBox !== undefined
      ? (cursor = {
          at: "box",
          file: settledBox.spec.file,
        })
      : pageBoxes.length > 0
        ? (cursor = {
            at: "box",
            file: pageBoxes[pageBoxes.length - 1].spec.file,
          })
        : progressInput.working
          ? progressInput.pageEmpty
            ? (cursor = {
                at: "tips",
                rotate: !hasBoxed,
              })
            : (hasBoxed || progressInput.arrivedThisTurn) &&
              progressInput.lastHere !== undefined &&
              (cursor = {
                at: "rest",
                file: progressInput.lastHere,
              })
          : (cursor = {
              at: "none",
            }));
  return {
    boxes: boxSpecs,
    cursor: cursor,
    toCome: isInTurn ? progressInput.boxed.length : 0,
    wakeAt:
      !isInTurn || isAgentActive
        ? undefined
        : isInGrace && graceUntil !== undefined
          ? Math.min(graceUntil, progressWindowEnd ?? graceUntil)
          : progressWindowEnd,
  };
}
function useMemoByKey(key?: Dynamic, compute?: Dynamic): Dynamic {
  let cacheRef: Dynamic = (0, react_Gu.useRef)(undefined);
  cacheRef.current?.key !== key &&
    (cacheRef.current = {
      key: key,
      value: compute(),
    });
  return cacheRef.current.value;
}
function useDesignCreationWorkingState(enabled?: Dynamic): Dynamic {
  let [activity, setActivity]: Dynamic = (0, react_Gu.useState)((): Dynamic => {
    let isWorking: Dynamic =
      enabled && claudeActivityStore.get() === "working";
    return {
      working: isWorking,
      heard: isWorking,
    };
  });
  (0, react_Gu.useEffect)((): Dynamic => {
    if (!enabled) return;
    let graceTimer: Dynamic,
      syncActivity: Dynamic = (): Dynamic => {
        clearTimeout(graceTimer);
        claudeActivityStore.get() === "working"
          ? setActivity(
              (previous?: Dynamic): Dynamic =>
                previous.working && previous.heard
                  ? previous
                  : {
                      working: true,
                      heard: true,
                    },
            )
          : (graceTimer = setTimeout(
              (): Dynamic =>
                setActivity(
                  (previous?: Dynamic): Dynamic =>
                    previous.working
                      ? {
                          ...previous,
                          working: false,
                        }
                      : previous,
                ),
              CanvasWorkingStateRegistry.graceMs ??
                CanvasWorkingStateConstant,
            ));
      },
      unsubscribe: Dynamic = claudeActivityStore.subscribe(syncActivity);
    syncActivity();
    return (): Dynamic => {
      unsubscribe();
      clearTimeout(graceTimer);
    };
  }, [enabled]);
  return activity;
}
function useDesignCreationProgress(progressOptions?: Dynamic): Dynamic {
  let { doc: doc }: Dynamic = progressOptions,
    [, forceUpdate]: Dynamic = (0, react_Gu.useReducer)(
      (previousCount?: Dynamic): Dynamic => previousCount + 1,
      0,
    ),
    [progressState]: Dynamic = (0, react_Gu.useState)((): Dynamic => {
      let listedInfo: Dynamic = progressOptions.flag
        ? getListedArtboards(doc)
        : emptyListedArtboards;
      return {
        creating:
          progressOptions.flag &&
          supportsListedArtboards(doc) &&
          (progressOptions.artboards.length === 0 || listedInfo.awaited.length > 0),
        names: progressOptions.flag ? listedArtboardNames(doc) : new Set(),
        listed: listedInfo.listed,
        needsProgress: new Set(
          listedInfo.awaited.map((board?: Dynamic): Dynamic => board.file),
        ),
        awaitedKey: listedInfo.awaited.map(
          (board?: Dynamic): Dynamic => board.file,
        ).join(`
`),
        boxed: new Map(),
        awaitedNow: new Set(),
        sawProgress: false,
        boxedThisTurn: false,
        arrivedThisTurn: false,
        lastProgressAt: undefined,
        cover: new Set(),
      };
    }),
    creating: Dynamic = progressState.creating,
    workingState: Dynamic = useDesignCreationWorkingState(creating),
    isWorkingRef: Dynamic = (0, react_Gu.useRef)(workingState.working);
  isWorkingRef.current = workingState.working;
  let isShowingTipsRef: Dynamic = (0, react_Gu.useRef)(false);
  (0, react_Gu.useEffect)((): Dynamic => {
    if (creating)
      return subscribeRemoteDocumentUpdates(
        doc,
        (isRemoteUpdate?: Dynamic): Dynamic => {
          let currentNames: Dynamic = listedArtboardNames(doc),
            newNames: Dynamic = [...currentNames].filter(
              (name?: Dynamic): Dynamic => !progressState.names.has(name),
            );
          progressState.names = currentNames;
          let stateKeyBefore: Dynamic = creationProgressStateKey(progressState),
            hadBoxed: Dynamic = progressState.boxed.size > 0,
            { listed: listed, awaited: awaited }: Dynamic =
              getListedArtboards(doc),
            awaitedKey: Dynamic = awaited.map(
              (board?: Dynamic): Dynamic => board.file,
            ).join(`
`);
          isRemoteUpdate &&
            awaitedKey !== progressState.awaitedKey &&
            ((progressState.sawProgress = true),
            (progressState.lastProgressAt = Date.now()));
          progressState.awaitedKey = awaitedKey;
          progressState.listed = listed;
          let entries: Dynamic = new Map();
          for (let board of awaited as Dynamic)
            (progressState.boxed.has(board.file) ||
              (isRemoteUpdate &&
                (progressState.sawProgress ||
                  !progressState.needsProgress.has(board.file)))) &&
              entries.set(board.file, board);
          progressState.awaitedNow = new Set(entries.keys());
          for (let [file, board] of progressState.boxed as Dynamic)
            !entries.has(file) &&
              progressState.listed.has(file) &&
              !currentNames.has(file) &&
              entries.set(file, board);
          progressState.boxed = entries;
          isWorkingRef.current && entries.size > 0 && (progressState.boxedThisTurn = true);
          (isWorkingRef.current ||
            claudeActivityStore.get() === "working") &&
            isRemoteUpdate &&
            newNames.length > 0 &&
            (progressState.arrivedThisTurn = true);
          if (isRemoteUpdate && (hadBoxed || entries.size > 0 || isShowingTipsRef.current))
            for (let name of newNames as Dynamic) progressState.cover.add(name);
          for (let name of progressState.cover as Dynamic)
            currentNames.has(name) || progressState.cover.delete(name);
          stateKeyBefore !== creationProgressStateKey(progressState) && forceUpdate();
        },
      );
  }, [doc, creating, progressState]);
  workingState.working || (progressState.arrivedThisTurn = false);
  if (workingState.working) progressState.boxed.size > 0 && (progressState.boxedThisTurn = true);
  else if (progressState.boxedThisTurn || (workingState.heard && progressState.boxed.size > 0)) {
    for (let file of progressState.boxed.keys() as Dynamic)
      progressState.needsProgress.add(file);
    progressState.boxed = new Map();
    progressState.awaitedNow = new Set();
    progressState.sawProgress = false;
    progressState.boxedThisTurn = false;
  }
  let lastArtboardFile: Dynamic = progressOptions.artboardsHere
      .filter((board?: Dynamic): Dynamic => board.frameless !== true)
      .at(-1)?.file,
    progress: Dynamic = computeDesignCreationProgress({
      on: creating,
      now: Date.now(),
      working: workingState.working,
      heard: workingState.heard,
      lastProgressAt: progressState.lastProgressAt,
      boxedThisTurn: progressState.boxedThisTurn,
      arrivedThisTurn: progressState.arrivedThisTurn,
      boxed: [...progressState.boxed.values()].map(
        (board?: Dynamic): Dynamic => ({
          spec: board,
          page: designPageId(board, progressOptions.pages),
          arriving: !progressState.awaitedNow.has(board.file),
        }),
      ),
      page: progressOptions.pageId,
      pageEmpty: progressOptions.pageEmpty,
      lastHere: lastArtboardFile,
      editing: progressOptions.editing,
    }),
    wakeAt: Dynamic = progress.wakeAt;
  (0, react_Gu.useEffect)((): Dynamic => {
    if (wakeAt === undefined) return;
    let wakeTimer: Dynamic,
      scheduleWake: Dynamic = (): Dynamic => {
        let remainingMs: Dynamic = wakeAt - Date.now();
        remainingMs <= 0 ? forceUpdate() : (wakeTimer = setTimeout(scheduleWake, remainingMs));
      };
    scheduleWake();
    return (): Dynamic => clearTimeout(wakeTimer);
  }, [wakeAt]);
  let isShowingTips: Dynamic = progress.cursor.at === "tips";
  isShowingTipsRef.current = isShowingTips;
  let shouldRotateTips: Dynamic = progress.cursor.at === "tips" && progress.cursor.rotate,
    [tipIndex, setTipIndex]: Dynamic = (0, react_Gu.useState)(-1);
  (0, react_Gu.useEffect)((): Dynamic => {
    setTipIndex(-1);
    if (!isShowingTips || !shouldRotateTips) return;
    let startedAt: Dynamic = Date.now(),
      tipTimer: Dynamic,
      showNextTip: Dynamic = (): Dynamic => {
        let elapsedMs: Dynamic = Date.now() - startedAt;
        setTipIndex(designCreationTipIndex(elapsedMs));
        tipTimer = setTimeout(
          showNextTip,
          timeUntilNextDesignCreationTip(elapsedMs),
        );
      };
    tipTimer = setTimeout(
      showNextTip,
      timeUntilNextDesignCreationTip(0),
    );
    return (): Dynamic => clearTimeout(tipTimer);
  }, [isShowingTips, shouldRotateTips]);
  let toComeRef: Dynamic = (0, react_Gu.useRef)(progress.toCome);
  toComeRef.current = progress.toCome;
  let hasAnnouncedRef: Dynamic = (0, react_Gu.useRef)(false),
    wasHeardRef: Dynamic = (0, react_Gu.useRef)(workingState.heard),
    hasPendingBoards: Dynamic = progress.toCome > 0;
  (0, react_Gu.useEffect)((): Dynamic => {
    let justHeard: Dynamic = workingState.heard && !wasHeardRef.current;
    wasHeardRef.current = workingState.heard;
    if (!hasPendingBoards) {
      workingState.heard &&
        (!workingState.working || justHeard) &&
        (hasAnnouncedRef.current = false);
      return;
    }
    if (hasAnnouncedRef.current) return;
    let isActive: Dynamic = true,
      retryTimer: Dynamic,
      tryAnnounce: Dynamic = (): Dynamic => {
        hasAnnouncedRef.current ||
          (announce(
            (): Dynamic =>
              !isActive || hasAnnouncedRef.current || toComeRef.current === 0
                ? null
                : ((hasAnnouncedRef.current = true),
                  ClipboardWorkingFilesHandler(toComeRef.current)),
            {
              ifIdle: true,
            },
          ),
          (retryTimer = setTimeout(
            tryAnnounce,
            creationProgressOptions.retryMs ?? creationProgressRetryMs,
          )));
      };
    tryAnnounce();
    return (): Dynamic => {
      isActive = false;
      clearTimeout(retryTimer);
    };
  }, [hasPendingBoards, workingState.working, workingState.heard]);
  let activeFile: Dynamic =
      progress.cursor.at === "box" ? progress.cursor.file : null,
    boxesHere: Dynamic = useMemoByKey(
      progress.boxes.map(
        (box?: Dynamic): Dynamic =>
          [
            box.file,
            box.x,
            box.y,
            box.w,
            box.h,
            box.title,
            JSON.stringify(box.radius),
            box.page,
          ].join("	"),
      ).join(`
`),
      (): Dynamic =>
        progress.boxes.length === 0 ? emptyCreationBoxes : progress.boxes,
    ),
    pendingBoards: Dynamic = (0, react_Gu.useMemo)(
      (): Dynamic =>
        boxesHere.length === 0
          ? emptyPendingArtboards
          : boxesHere.map(
              (box?: Dynamic): Dynamic => ({
                spec: box,
                active: box.file === activeFile,
              }),
            ),
      [boxesHere, activeFile],
    ),
    coverFiles: Dynamic = useMemoByKey(
      [...progressState.cover].join(`
`),
      (): Dynamic =>
        progressState.cover.size === 0
          ? emptyCreationCoverFiles
          : new Set(progressState.cover),
    ),
    onArtboardReady: Dynamic = (0, react_Gu.useRef)((file?: Dynamic): Dynamic => {
      progressState.cover.delete(file) && forceUpdate();
    }).current;
  return creating
    ? {
        creating: true,
        pendingBoards: pendingBoards,
        boxesHere: boxesHere,
        coverFiles: coverFiles,
        cursor: progress.cursor,
        workingLabel: workingState.working && boxesHere.length > 0,
        tip: tipIndex,
        onArtboardReady: onArtboardReady,
      }
    : emptyCreationProgressUi;
}
function fitBoundsCamera(bounds?: Dynamic, viewport?: Dynamic): Dynamic {
  let boundsWidth: Dynamic = bounds.maxX - bounds.minX,
    boundsHeight: Dynamic = bounds.maxY - bounds.minY,
    scale: Dynamic = Math.min(
      2,
      Math.max(
        viewportScaleLimits.minScale,
        Math.min(
          (viewport.w - fitArtboardPadding * 2) / boundsWidth,
          (viewport.h - viewport.top - fitArtboardPadding * 2) / boundsHeight,
        ),
      ),
    );
  return {
    x: bounds.minX - (viewport.w / scale - boundsWidth) / 2,
    y:
      bounds.minY -
      viewport.top / scale -
      ((viewport.h - viewport.top) / scale - boundsHeight) / 2,
    scale: scale,
  };
}
function creationFocusedCamera(
  artboards?: Dynamic,
  camera?: Dynamic,
  viewport?: Dynamic,
): Dynamic {
  let firstBoard: Dynamic = firstArtboardInReadingOrder(artboards);
  if (firstBoard === undefined) return;
  let fitCamera: Dynamic = fitBoundsCamera(
      {
        minX: 0,
        minY: -fitArtboardHeaderHeight,
        maxX: defaultArtboardWidth,
        maxY: defaultArtboardHeight,
      },
      viewport,
    ),
    targetScale: Dynamic = Math.min(
      2,
      Math.max(
        viewportScaleLimits.minScale,
        fitCamera.scale *
          Math.min(
            defaultArtboardWidth / firstBoard.w,
            defaultArtboardHeight / firstBoard.h,
          ),
      ),
    );
  if (!(camera.scale < targetScale)) return;
  let offsetX: Dynamic =
      (defaultArtboardWidth / 2 - fitCamera.x) * fitCamera.scale,
    offsetY: Dynamic =
      (defaultArtboardHeight / 2 - fitCamera.y) * fitCamera.scale;
  return {
    x: firstBoard.x + firstBoard.w / 2 - offsetX / targetScale,
    y: firstBoard.y + firstBoard.h / 2 - offsetY / targetScale,
    scale: targetScale,
  };
}
export {
  computeDesignCreationProgress,
  creationCursorContentInset,
  creationCursorHeaderOffset,
  creationFocusedCamera,
  creationProgressOptions,
  creationProgressRetryMs,
  creationProgressStateKey,
  creationSequenceEnabled,
  creationSequenceFeatureFlag,
  creationSequenceFeatureFlagName,
  DesignCreationCursor,
  emptyCreationBoxes,
  emptyCreationCoverFiles,
  emptyCreationProgress,
  emptyCreationProgressUi,
  emptyListedArtboards,
  emptyPendingArtboards,
  firstArtboardInReadingOrder,
  fitArtboardHeaderHeight,
  fitArtboardPadding,
  fitBoundsCamera,
  getListedArtboards,
  jsx_U1e,
  listedArtboardNames,
  react_Gu,
  supportsListedArtboards,
  useDesignCreationProgress,
  useDesignCreationWorkingState,
  useMemoByKey,
};
export function installCanvasCreationProgress(): () => void {
  return () => {
    jsx_U1e = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    creationCursorContentInset = 18;
    creationCursorHeaderOffset = 72;
    react_Gu = toModuleNamespace(load_react(), 1);
    emptyCreationProgress = Object.freeze({
      boxes: Object.freeze([]),
      cursor: Object.freeze({
        at: "none",
      }),
      toCome: 0,
      wakeAt: undefined,
    });
    supportsListedArtboards = (doc?: Dynamic): Dynamic =>
      typeof doc.listedBoards == "function";
    getListedArtboards = (doc?: Dynamic): Dynamic =>
      doc.listedBoards?.() ?? emptyListedArtboards;
    emptyListedArtboards = {
      listed: new Set(),
      awaited: [],
    };
    creationProgressStateKey = (progressState?: Dynamic): Dynamic =>
      [
        [...progressState.boxed.values()]
          .map(
            (box?: Dynamic): Dynamic =>
              [
                box.file,
                box.x,
                box.y,
                box.w,
                box.h,
                box.title,
                box.page,
              ].join(),
          )
          .join(";"),
        [...progressState.awaitedNow].join(),
        [...progressState.cover].join(),
        String(progressState.lastProgressAt),
        String(progressState.arrivedThisTurn),
      ].join("|");
    listedArtboardNames = (doc?: Dynamic): Dynamic =>
      new Set(
        Object.keys(doc.content().files).filter(
          (file?: Dynamic): Dynamic =>
            isArtboardFile(file) &&
            !isDesignSystemFile(file),
        ),
      );
    emptyPendingArtboards = [];
    emptyCreationBoxes = [];
    emptyCreationCoverFiles = new Set();
    emptyCreationProgressUi = {
      creating: false,
      pendingBoards: emptyPendingArtboards,
      boxesHere: emptyCreationBoxes,
      coverFiles: emptyCreationCoverFiles,
      cursor: {
        at: "none",
      },
      workingLabel: false,
      tip: -1,
      onArtboardReady(): Dynamic {},
    };
    creationProgressRetryMs = 1500;
    creationProgressOptions = {};
    fitArtboardPadding = 48;
    fitArtboardHeaderHeight = 40;
    firstArtboardInReadingOrder = (artboards?: Dynamic): Dynamic =>
      artboards.reduce(
        (best?: Dynamic, candidate?: Dynamic): Dynamic =>
          best === undefined ||
          candidate.x + candidate.y < best.x + best.y ||
          (candidate.x + candidate.y === best.x + best.y &&
            candidate.y < best.y)
            ? candidate
            : best,
        undefined,
      );
    creationSequenceFeatureFlagName = "appifact_creation_sequence";
    creationSequenceEnabled = (): Dynamic =>
      (creationSequenceFeatureFlag ??= getFeatureFlag(
        creationSequenceFeatureFlagName,
        false,
      ));
  };
}
