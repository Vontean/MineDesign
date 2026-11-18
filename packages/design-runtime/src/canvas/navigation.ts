import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { stableAnchorHash } from "../comments/anchor-codec";
import { designPageId } from "../platform/file-content";

var artboardFragmentPrefix: Dynamic;
var prototypeFragmentPrefix: Dynamic;
var canvasPageFragmentPrefix: Dynamic;
var artboardPlaceFragment: Dynamic;
var prototypePlaceFragment: Dynamic;
var canvasPagePlaceFragment: Dynamic;
var artboardPlaybackPlaceFragment: Dynamic;
var artboardNavigationGroupLabels: Dynamic;
function defaultPageArtboard(manifest?: Dynamic, pageId?: Dynamic): Dynamic {
  let pageArtboards: Dynamic = manifest.artboards.filter(
      (artboard?: Dynamic): Dynamic =>
        designPageId(artboard, manifest.pages) === pageId,
    ),
    launchFile: Dynamic =
      manifest.launch?.view === "focused" ? manifest.launch.file : undefined;
  return (
    pageArtboards.find((artboard?: Dynamic): Dynamic => artboard.file === launchFile) ??
    pageArtboards.find((artboard?: Dynamic): Dynamic => !artboard.frameless) ??
    pageArtboards[0]
  );
}
function phoneCanvasFallbackArtboard(
  manifest?: Dynamic,
  pageId?: Dynamic,
  entryFile?: Dynamic,
  laidOut?: Dynamic,
): Dynamic {
  let entryArtboard: Dynamic = manifest.artboards.find(
      (artboard?: Dynamic): Dynamic =>
        artboard.file === entryFile &&
        !artboard.frameless &&
        designPageId(artboard, manifest.pages) === pageId,
    ),
    preferredArtboard: Dynamic =
      (laidOut ? undefined : entryArtboard) ?? defaultPageArtboard(manifest, pageId);
  return preferredArtboard?.frameless
    ? (entryArtboard ??
        manifest.artboards.find(
          (artboard?: Dynamic): Dynamic =>
            !artboard.frameless &&
            designPageId(artboard, manifest.pages) === pageId,
        ))
    : preferredArtboard;
}
function oversizedPhoneCanvasFallbackArtboard(
  manifest?: Dynamic,
  pageId?: Dynamic,
  entryFile?: Dynamic,
  areaBudget?: Dynamic,
): Dynamic {
  let pageArtboards: Dynamic = manifest.artboards.filter(
    (artboard?: Dynamic): Dynamic =>
      !artboard.frameless &&
      designPageId(artboard, manifest.pages) === pageId,
  );
  if (
    !pageArtboards.some((artboard?: Dynamic): Dynamic => artboard.w * artboard.h <= areaBudget)
  )
    return (
      pageArtboards.find((artboard?: Dynamic): Dynamic => artboard.file === entryFile) ??
      pageArtboards[0]
    );
}
function initialFocusedArtboard(launchState?: Dynamic): Dynamic {
  let {
      manifest: manifest,
      pageId: pageId,
      entryFile: entryFile,
    }: Dynamic = launchState,
    isLaidOutFocused: Dynamic = launchState.laidOut && manifest.launch?.view === "focused";
  if (launchState.phoneCanvas && launchState.killedBefore)
    return (
      phoneCanvasFallbackArtboard(manifest, pageId, entryFile, isLaidOutFocused)?.file ?? null
    );
  let phoneFallbackFile: Dynamic = launchState.phoneCanvas
    ? (oversizedPhoneCanvasFallbackArtboard(
        manifest,
        pageId,
        entryFile,
        launchState.budget,
      )?.file ?? null)
    : null;
  if (launchState.embedded) return phoneFallbackFile;
  let firstArtboardFile: Dynamic =
    (
      manifest.artboards.find(
        (artboard?: Dynamic): Dynamic => artboard.file === entryFile,
      ) ?? manifest.artboards[0]
    )?.file ?? null;
  return launchState.laidOut
    ? manifest.launch?.view === "focused"
      ? manifest.launch.file
      : launchState.phoneCanvas
        ? phoneFallbackFile
        : launchState.migrated
          ? firstArtboardFile
          : null
    : firstArtboardFile;
}
function parseCanvasPlaceFragment(
  fragment?: Dynamic,
  manifest?: Dynamic,
): Dynamic {
  let [fragmentHead = ""]: Dynamic = fragment.split(".", 1),
    matchedPrefix: Dynamic = [artboardFragmentPrefix, prototypeFragmentPrefix].find(
      (prefix?: Dynamic): Dynamic => fragmentHead.startsWith(prefix),
    );
  if (matchedPrefix !== undefined) {
    let artboardHash: Dynamic = fragmentHead.slice(matchedPrefix.length),
      matchedArtboard: Dynamic = manifest.artboards.find(
        (artboard?: Dynamic): Dynamic =>
          stableAnchorHash(artboard.file) === artboardHash,
      );
    return matchedArtboard
      ? {
          kind: "artboard",
          file: matchedArtboard.file,
          play: matchedPrefix === prototypeFragmentPrefix,
        }
      : undefined;
  }
  if (fragmentHead.startsWith(canvasPageFragmentPrefix)) {
    let pageHash: Dynamic = fragmentHead.slice(canvasPageFragmentPrefix.length),
      matchedPageId: Dynamic = [
        "",
        ...(manifest.pages ?? []).map((page?: Dynamic): Dynamic => page.id),
      ].find(
        (pageId?: Dynamic): Dynamic =>
          stableAnchorHash(pageId) === pageHash,
      );
    return matchedPageId === undefined
      ? undefined
      : {
          kind: "page",
          id: matchedPageId,
        };
  }
}
function currentCanvasPlaceFragment(
  selection?: Dynamic,
  focusedFile?: Dynamic,
  pageId?: Dynamic,
  playing?: Dynamic,
): Dynamic {
  if (focusedFile !== null)
    return artboardPlaybackPlaceFragment(focusedFile, playing);
  let selectedFiles: Dynamic = new Set([
      ...selection.artboards,
      ...selection.elements.keys(),
    ]),
    singleFile: Dynamic =
      selectedFiles.size === 1 && selection.notes.size === 0
        ? [...selectedFiles][0]
        : undefined;
  return singleFile !== undefined
    ? artboardPlaceFragment(singleFile)
    : canvasPagePlaceFragment(pageId);
}
function resolveCanvasPlaceAction(
  fragment?: Dynamic,
  manifest?: Dynamic,
  state?: Dynamic,
): Dynamic {
  let parsed: Dynamic = parseCanvasPlaceFragment(fragment, manifest);
  if (parsed === undefined) return null;
  let artboard: Dynamic =
      parsed.kind === "artboard"
        ? manifest.artboards.find(
            (candidate?: Dynamic): Dynamic => candidate.file === parsed.file,
          )
        : undefined,
    shouldMoveCamera: Dynamic = state.restoring !== true;
  if (
    artboard &&
    state.filling === null &&
    state.plays &&
    parsed.kind === "artboard" &&
    parsed.play &&
    artboard.frameless !== true
  )
    return {
      do: "play",
      file: artboard.file,
      page: designPageId(artboard, manifest.pages),
      lands: prototypePlaceFragment(artboard.file),
    };
  if (artboard && state.filling === null)
    return {
      do: "artboard",
      file: artboard.file,
      page: designPageId(artboard, manifest.pages),
      focus: state.mayFocus && artboard.frameless !== true,
      camera: shouldMoveCamera,
      lands: artboardPlaceFragment(artboard.file),
    };
  if (artboard && artboard.frameless !== true) {
    let playbackFragment: Dynamic = artboardPlaybackPlaceFragment(
      artboard.file,
      state.plays,
    );
    return artboard.file === state.filling
      ? {
          do: "nothing",
          lands: playbackFragment,
        }
      : {
          do: "window",
          file: artboard.file,
          page: designPageId(artboard, manifest.pages),
          lands: playbackFragment,
        };
  }
  let targetPageId: Dynamic = artboard
    ? designPageId(artboard, manifest.pages)
    : parsed.kind === "page" && parsed.id !== ""
      ? parsed.id
      : (manifest.pages?.[0]?.id ?? "");
  if (state.filling === null)
    return {
      do: "page",
      id: targetPageId,
      camera: shouldMoveCamera,
      lands: canvasPagePlaceFragment(targetPageId),
    };
  if (targetPageId === state.pageId)
    return {
      do: "nothing",
      lands: artboardPlaybackPlaceFragment(state.filling, state.plays),
    };
  let defaultArtboard: Dynamic = defaultPageArtboard(manifest, targetPageId);
  return {
    do: "page",
    id: targetPageId,
    camera: shouldMoveCamera,
    lands: defaultArtboard
      ? artboardPlaybackPlaceFragment(defaultArtboard.file, state.plays)
      : canvasPagePlaceFragment(targetPageId),
  };
}
function prototypeFileFromPlaceFragment(
  fragment?: Dynamic,
  manifest?: Dynamic,
): Dynamic {
  let parsed: Dynamic = parseCanvasPlaceFragment(fragment, manifest);
  return parsed?.kind !== "artboard" ||
    !parsed.play ||
    manifest.artboards.find(
      (artboard?: Dynamic): Dynamic => artboard.file === parsed.file,
    )?.frameless === true
    ? null
    : parsed.file;
}
function sortArtboardsInReadingOrder(artboards?: Dynamic): Dynamic {
  let sortedArtboards: Dynamic = [...artboards].sort(
      (first?: Dynamic, second?: Dynamic): Dynamic =>
        first.y - second.y || first.x - second.x,
    ),
    orderedArtboards: Dynamic = [],
    currentRow: Dynamic = [];
  for (let artboard of sortedArtboards as Dynamic) {
    let rowAnchor: Dynamic = currentRow[0];
    rowAnchor !== undefined &&
      artboard.y >= rowAnchor.y + rowAnchor.h / 2 &&
      (orderedArtboards.push(
        ...currentRow.sort(
          (first?: Dynamic, second?: Dynamic): Dynamic =>
            first.x - second.x,
        ),
      ),
      (currentRow = []));
    currentRow.push(artboard);
  }
  orderedArtboards.push(
    ...currentRow.sort(
      (first?: Dynamic, second?: Dynamic): Dynamic => first.x - second.x,
    ),
  );
  return orderedArtboards;
}
function groupNavigableArtboards(artboards?: Dynamic): Dynamic {
  let navigableArtboards: Dynamic = sortArtboardsInReadingOrder(
    artboards.filter((artboard?: Dynamic): Dynamic => artboard.frameless !== true),
  );
  return {
    prototypes: navigableArtboards.filter(
      (artboard?: Dynamic): Dynamic => artboard.is_interactive === true,
    ),
    others: navigableArtboards.filter(
      (artboard?: Dynamic): Dynamic => artboard.is_interactive !== true,
    ),
  };
}
export {
  artboardFragmentPrefix,
  artboardNavigationGroupLabels,
  artboardPlaceFragment,
  artboardPlaybackPlaceFragment,
  canvasPageFragmentPrefix,
  canvasPagePlaceFragment,
  currentCanvasPlaceFragment,
  defaultPageArtboard,
  groupNavigableArtboards,
  initialFocusedArtboard,
  oversizedPhoneCanvasFallbackArtboard,
  parseCanvasPlaceFragment,
  phoneCanvasFallbackArtboard,
  prototypeFileFromPlaceFragment,
  prototypeFragmentPrefix,
  prototypePlaceFragment,
  resolveCanvasPlaceAction,
  sortArtboardsInReadingOrder,
};
export function installCanvasNavigation(): () => void {
  return () => {
    artboardFragmentPrefix = "artboard-";
    prototypeFragmentPrefix = "play-";
    canvasPageFragmentPrefix = "page-";
    artboardPlaceFragment = (file?: Dynamic): Dynamic =>
      artboardFragmentPrefix + stableAnchorHash(file);
    prototypePlaceFragment = (file?: Dynamic): Dynamic =>
      prototypeFragmentPrefix + stableAnchorHash(file);
    canvasPagePlaceFragment = (pageId?: Dynamic): Dynamic =>
      canvasPageFragmentPrefix + stableAnchorHash(pageId);
    artboardPlaybackPlaceFragment = (
      file?: Dynamic,
      isPlaying?: Dynamic,
    ): Dynamic =>
      isPlaying ? prototypePlaceFragment(file) : artboardPlaceFragment(file);
    artboardNavigationGroupLabels = {
      prototypes: "Prototypes",
      get others() { return uiMessage("canvas.navigation.staticArtboards"); },
    };
  };
}
