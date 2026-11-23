import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { ViewportScale } from "../canvas/viewport-store";
import { reactCollaborationPeerCursors } from "./peer-cursors";
import { PeerSelectionRings, usePeerSelectionGroups } from "./peer-selections";
import { load_react_jsx_runtime } from "../dependencies";
import { pickerPeerRects } from "../editor/picker/bridge";
import { toModuleNamespace } from "../module-helpers";
import { embedMemoryPrefix } from "../platform/file-content";
import { createPreviewHandle } from "../preview/evaluation";

var AZaZ0909AF21200Value: Dynamic;
var encodedArtboardPathPattern: Dynamic;
var encodedElementPathPattern: Dynamic;
var CollaborationSelectionPathsLimit: Dynamic;
var jsxCollaborationSelectionPaths: Dynamic;
var CollaborationSelectionPathsConstant: Dynamic;
var selectionRefreshDirtyDelayMs: Dynamic;
var CollaborationSelectionPathsItems: Dynamic;
var CollaborationSelectionPathsCache: Dynamic;
var CanvasPeerSelectionRings: Dynamic;
function parseSelectedElementPath(path?: Dynamic): Dynamic {
  if (!encodedElementPathPattern.test(path)) return null;
  let hashIndex: Dynamic = path.indexOf("#");
  return {
    name: path.slice(0, hashIndex),
    tid: parseInt(path.slice(hashIndex + 1), 10),
  };
}
function normalizeSelectedArtboardPaths(paths?: Dynamic): Dynamic {
  let items: Dynamic = [];
  for (let path of paths as Dynamic) {
    let encodedPath: Dynamic = encodeArtboardSelectionPath(path);
    encodedPath !== null && items.push(encodedPath);
    if (items.length === 20) break;
  }
  return items;
}
function encodeArtboardSelectionPath(path?: Dynamic): Dynamic {
  if (!path.endsWith(".dc.html")) return null;
  let encoded: Dynamic;
  try {
    encoded = encodeURIComponent(path.slice(0, -8)) + ".dc.html";
  } catch {
    return null;
  }
  return encoded.length <= CollaborationSelectionPathsLimit &&
    encodedArtboardPathPattern.test(encoded)
    ? encoded
    : null;
}
function createPeerSelectionStore(): Dynamic {
  let entries: Dynamic = new Map(),
    values: Dynamic = new Set();
  return {
    get: (): Dynamic => entries,
    set(nextEntries: Dynamic): Dynamic {
      entries = nextEntries;
      for (let listener of [...values] as Dynamic) listener();
    },
    subscribe(listener: Dynamic): Dynamic {
      values.add(listener);
      return (): Dynamic => values.delete(listener);
    },
  };
}
function resolvePeerElementSelections(
  groups?: Dynamic,
  artboardsByName?: Dynamic,
  rectsByFile?: Dynamic,
  targetFile: Dynamic = null,
): Dynamic {
  let entries: Dynamic = new Map();
  for (let group of groups as Dynamic) {
    let items: Dynamic = [],
      values: Dynamic = new Set();
    for (let selectedPath of group.selected as Dynamic) {
      let parsedPath: Dynamic = parseSelectedElementPath(selectedPath),
        artboard: Dynamic = parsedPath ? artboardsByName.get(parsedPath.name) : undefined;
      if (!parsedPath || !artboard || (targetFile !== null && artboard.file !== targetFile))
        continue;
      let isFullCanvas: Dynamic = targetFile === null;
      (rectsByFile.get(artboard.file)?.get(parsedPath.tid) ?? []).forEach(
        (rect?: Dynamic, rectIndex?: Dynamic): Dynamic => {
          let left: Dynamic = isFullCanvas ? Math.max(0, rect.x) : rect.x,
            top: Dynamic = isFullCanvas ? Math.max(0, rect.y) : rect.y,
            right: Dynamic = isFullCanvas
              ? Math.min(artboard.w, rect.x + rect.w)
              : rect.x + rect.w,
            bottom: Dynamic = isFullCanvas
              ? Math.min(artboard.h, rect.y + rect.h)
              : rect.y + rect.h;
          if (right <= left || bottom <= top) return;
          values.add(parsedPath.name);
          let state: Dynamic = {
            key: group.peer + "|" + selectedPath + "|" + String(rectIndex),
            x: left,
            y: top,
            w: right - left,
            h: bottom - top,
            collaborator: group.collaborator,
          };
          items.push({
            file: artboard.file,
            ring: state,
          });
        },
      );
    }
    let artboardItems: Dynamic = [];
    for (let artboardName of (targetFile !== null
      ? []
      : (group.lists.selectedArtboards ?? [])) as Dynamic) {
      let entry: Dynamic = artboardsByName.get(artboardName);
      !entry ||
        values.has(artboardName) ||
        artboardItems.push({
          file: entry.file,
          ring: {
            key: group.peer + "|" + artboardName,
            x: 0,
            y: 0,
            w: entry.w,
            h: entry.h,
            collaborator: group.collaborator,
          },
        });
    }
    for (let { file: file, ring: ring } of [
      ...artboardItems,
      ...items,
    ] as Dynamic) {
      let entry: Dynamic = entries.get(file);
      entry ? entry.push(ring) : entries.set(file, [ring]);
    }
  }
  return entries;
}
function useCanvasPeerSelections({
  pageId: pageId,
  artboards: artboards,
  handlesRef: handlesRef,
  store: store,
  fullFile = null,
}: Dynamic): Dynamic {
  let liveGroups: Dynamic = usePeerSelectionGroups(
      {
        page: pageId === "" ? null : pageId,
      },
      ["selectedArtboards"],
    ),
    visibleGroups: Dynamic =
      embedMemoryPrefix() === ""
        ? liveGroups
        : CollaborationSelectionPathsItems,
    artboardsByName: Dynamic = (0,
    reactCollaborationPeerCursors.useMemo)((): Dynamic => {
      let byName: Dynamic = new Map();
      for (let artboardItem of artboards as Dynamic) {
        let encodedFile: Dynamic = encodeArtboardSelectionPath(artboardItem.file);
        encodedFile !== null && byName.set(encodedFile, artboardItem);
      }
      return byName;
    }, [artboards]),
    entries: Dynamic = new Map();
  for (let group of visibleGroups as Dynamic)
    for (let selectedPath of group.selected as Dynamic) {
      let parsedPath: Dynamic = parseSelectedElementPath(selectedPath),
        artboardEntry: Dynamic = parsedPath ? artboardsByName.get(parsedPath.name) : undefined;
      if (
        !parsedPath ||
        !artboardEntry ||
        (fullFile !== null && artboardEntry.file !== fullFile)
      )
        continue;
      let tids: Dynamic = entries.get(artboardEntry.file) ?? [];
      tids.includes(parsedPath.tid) || tids.push(parsedPath.tid);
      entries.set(artboardEntry.file, tids);
    }
  for (let tidList of entries.values() as Dynamic)
    tidList.sort(
      (first?: Dynamic, second?: Dynamic): Dynamic => first - second,
    );
  let selectionKey: Dynamic = JSON.stringify([
      fullFile,
      ...[...entries].sort(
        ([fileA]: Dynamic, [fileB]: Dynamic): Dynamic =>
          fileA < fileB ? -1 : fileA > fileB ? 1 : 0,
      ),
    ]),
    fullFileRef: Dynamic = (0, reactCollaborationPeerCursors.useRef)(
      fullFile,
    );
  fullFileRef.current = fullFile;
  let selectedTidsRef: Dynamic = (0, reactCollaborationPeerCursors.useRef)(
    entries,
  );
  selectedTidsRef.current = entries;
  let hasSelection: Dynamic = entries.size > 0,
    [measured, setMeasured]: Dynamic = (0,
    reactCollaborationPeerCursors.useState)({
      full: null,
      rects: CollaborationSelectionPathsCache,
    }),
    currentRects: Dynamic =
      measured.full === fullFile
        ? measured.rects
        : CollaborationSelectionPathsCache,
    scheduleRefreshRef: Dynamic = (0, reactCollaborationPeerCursors.useRef)(
      (): Dynamic => {},
    );
  (0, reactCollaborationPeerCursors.useEffect)((): Dynamic => {
    if (!hasSelection) {
      setMeasured(
        (prev?: Dynamic): Dynamic =>
          prev.rects.size === 0
            ? prev
            : {
                full: prev.full,
                rects: CollaborationSelectionPathsCache,
              },
      );
      return;
    }
    let flag: Dynamic = false,
      isMeasuring: Dynamic = false,
      isRefreshQueued: Dynamic = false,
      lastRunAt: Dynamic = 0,
      refreshTimer: Dynamic,
      scheduleMeasure: Dynamic = (delayMs?: Dynamic): Dynamic => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout((): Dynamic => {
          measureRects();
        }, delayMs);
      },
      measureRects: Dynamic = async (): Promise<Dynamic> => {
        isMeasuring = true;
        isRefreshQueued = false;
        lastRunAt = Date.now();
        let targets: Dynamic = selectedTidsRef.current,
          activeFullFile: Dynamic = fullFileRef.current,
          measuredRects: Dynamic = new Map();
        try {
          await Promise.all(
            [...targets].map(
              async ([file, tids]: Dynamic): Promise<Dynamic> => {
                let entry: Dynamic = handlesRef.current.get(file),
                  handle: Dynamic =
                    entry?.isReady() && !entry.isBlocked()
                      ? createPreviewHandle(
                          entry.previewFrameRef.current,
                        )
                      : null;
                if (!handle) return;
                let rects: Dynamic = await pickerPeerRects(
                  handle,
                  tids,
                  file === activeFullFile,
                );
                rects &&
                  measuredRects.set(
                    file,
                    new Map(
                      rects.map(
                        (rect?: Dynamic, index?: Dynamic): Dynamic => [
                          tids[index],
                          rect,
                        ],
                      ),
                    ),
                  );
              },
            ),
          );
        } finally {
          isMeasuring = false;
          flag ||
            scheduleMeasure(
              isRefreshQueued
                ? selectionRefreshDirtyDelayMs
                : CollaborationSelectionPathsConstant,
            );
        }
        flag ||
          activeFullFile !== fullFileRef.current ||
          setMeasured((prev?: Dynamic): Dynamic => {
            let prevRects: Dynamic =
                prev.full === activeFullFile
                  ? prev.rects
                  : CollaborationSelectionPathsCache,
              nextRects: Dynamic = new Map();
            for (let file of selectedTidsRef.current.keys() as Dynamic) {
              let fileRects: Dynamic =
                measuredRects.get(file) ?? prevRects.get(file);
              fileRects && nextRects.set(file, fileRects);
            }
            return prev.full === activeFullFile &&
              JSON.stringify(
                [...prevRects].map(
                  ([file, rects]: Dynamic): Dynamic => [
                    file,
                    [...rects],
                  ],
                ),
              ) ===
                JSON.stringify(
                  [...nextRects].map(
                    ([file, rects]: Dynamic): Dynamic => [
                      file,
                      [...rects],
                    ],
                  ),
                )
              ? prev
              : {
                  full: activeFullFile,
                  rects: nextRects,
                };
          });
      };
    scheduleRefreshRef.current = (): Dynamic => {
      isMeasuring
        ? (isRefreshQueued = true)
        : scheduleMeasure(
            Math.max(
              0,
              Math.min(
                selectionRefreshDirtyDelayMs,
                lastRunAt + CollaborationSelectionPathsConstant - Date.now(),
              ),
            ),
          );
    };
    scheduleMeasure(0);
    return (): Dynamic => {
      flag = true;
      clearTimeout(refreshTimer);
      scheduleRefreshRef.current = (): Dynamic => {};
    };
  }, [hasSelection]);
  (0, reactCollaborationPeerCursors.useEffect)(
    (): Dynamic => scheduleRefreshRef.current(),
    [selectionKey],
  );
  let peerRings: Dynamic = resolvePeerElementSelections(
      visibleGroups,
      artboardsByName,
      currentRects,
      fullFile,
    ),
    ringsKey: Dynamic = JSON.stringify([...peerRings]),
    lastRingsKeyRef: Dynamic = (0, reactCollaborationPeerCursors.useRef)(
      null,
    );
  (0, reactCollaborationPeerCursors.useLayoutEffect)((): Dynamic => {
    ringsKey !== lastRingsKeyRef.current &&
      ((lastRingsKeyRef.current = ringsKey), store.set(peerRings));
  });
  (0, reactCollaborationPeerCursors.useEffect)(
    (): Dynamic => (): Dynamic => store.set(new Map()),
    [store],
  );
  return null;
}
function clipPeerRects(
  rects?: Dynamic,
  scroll?: Dynamic,
  box?: Dynamic,
): Dynamic {
  return rects.flatMap((rect?: Dynamic): Dynamic => {
    let left: Dynamic = Math.max(0, rect.x - scroll.x),
      top: Dynamic = Math.max(0, rect.y - scroll.y),
      right: Dynamic = Math.min(box.w, rect.x - scroll.x + rect.w),
      bottom: Dynamic = Math.min(box.h, rect.y - scroll.y + rect.h);
    return right <= left || bottom <= top
      ? []
      : [
          {
            ...rect,
            x: left,
            y: top,
            w: right - left,
            h: bottom - top,
          },
        ];
  });
}
function ArtboardPeerSelectionRings({
  store: store,
  file: file,
  box: box,
  scroll: scroll,
}: Dynamic): Dynamic {
  useUiLocale();
  let entry: Dynamic = (0,
    reactCollaborationPeerCursors.useSyncExternalStore)(
      store.subscribe,
      store.get,
      store.get,
    ).get(file),
    scrollOffset: Dynamic = (0,
    reactCollaborationPeerCursors.useSyncExternalStore)(
      scroll.subscribe,
      (): Dynamic => scroll.get(file),
      (): Dynamic => scroll.get(file),
    ),
    clippedRects: Dynamic = entry ? clipPeerRects(entry, scrollOffset, box) : [];
  return clippedRects.length > 0 ? (
    <ViewportScale>
      {(scale?: Dynamic): Dynamic => (
        <PeerSelectionRings rings={clippedRects} scale={scale} />
      )}
    </ViewportScale>
  ) : null;
}
export {
  ArtboardPeerSelectionRings,
  AZaZ0909AF21200Value,
  CanvasPeerSelectionRings,
  clipPeerRects,
  CollaborationSelectionPathsCache,
  CollaborationSelectionPathsConstant,
  CollaborationSelectionPathsItems,
  CollaborationSelectionPathsLimit,
  createPeerSelectionStore,
  encodeArtboardSelectionPath,
  encodedArtboardPathPattern,
  encodedElementPathPattern,
  jsxCollaborationSelectionPaths,
  normalizeSelectedArtboardPaths,
  parseSelectedElementPath,
  resolvePeerElementSelections,
  useCanvasPeerSelections,
};
export function installCollaborationSelectionPaths(): () => void {
  return () => {
    AZaZ0909AF21200Value = "(?:[A-Za-z0-9_.!~*'()-]|%[0-9A-F]{2}){1,200}";
    encodedArtboardPathPattern = new RegExp(
      "^" + AZaZ0909AF21200Value + "\\.dc\\.html$",
    );
    encodedElementPathPattern = new RegExp(
      "^" +
        AZaZ0909AF21200Value +
        "\\.dc\\.html#\\d{1,4}:\\d{1,2}(\\/\\d{1,2}){0,8}(@\\d{1,3})?$",
    );
    CollaborationSelectionPathsLimit = 220;
    jsxCollaborationSelectionPaths = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    CollaborationSelectionPathsConstant = 1e3;
    selectionRefreshDirtyDelayMs = 150;
    CollaborationSelectionPathsItems = [];
    CollaborationSelectionPathsCache = new Map();
    CanvasPeerSelectionRings = (0, reactCollaborationPeerCursors.memo)(
      function ({ store: store, file: file }: Dynamic): Dynamic {
        let entry: Dynamic = (0,
        reactCollaborationPeerCursors.useSyncExternalStore)(
          store.subscribe,
          store.get,
          store.get,
        ).get(file);
        return entry && entry.length > 0 ? (
          <ViewportScale>
            {(scale?: Dynamic): Dynamic => (
              <PeerSelectionRings rings={entry} scale={scale} />
            )}
          </ViewportScale>
        ) : null;
      },
    );
  };
}
