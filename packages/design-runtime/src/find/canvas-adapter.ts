/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { sortArtboardsInReadingOrder } from "../canvas/navigation";
import { CanvasPanZoomRound } from "../canvas/pan-zoom";
import { parseDcHtmlDocument } from "../editor/html/dc-document";
import { DcEditorModel } from "../editor/model/dc-editor-model";
import { NotesBlocksHandler, parseNoteBlocks } from "../editor/notes/blocks";
import { NotesDomHandler_2 } from "../editor/notes/dom";
import { applyFindHighlights, clearFindHighlights } from "./highlights";
import { classifyTextRangeVisibility, rangeCanvasRect, revealTextRange } from "./scroll-reveal";
import { collapseFindWhitespace, findRenderedTextRanges, findTextOffsets } from "./text-ranges";
import { isLoadingArtboardHtml } from "../platform/design-document-adapter";
import { annotationTextStyle, annotationVisibleBounds, designPageId, isShapeAnnotation } from "../platform/file-content";

var findExcludedEditorSelector: Dynamic;
var findFrameProbeTimeoutMs: Dynamic;
var findFrameCaptureTimeoutMs: Dynamic;
var findViewportRestoreTimeoutMs: Dynamic;
var findViewportTransformTolerance: Dynamic;
var findArtboardTitle: Dynamic;
var waitForFindReveal: Dynamic;
var textRunCacheLimit: Dynamic;
var cachedDesignTextRuns: Dynamic;
function normalizedElementBox(element?: Dynamic, box?: Dynamic): Dynamic {
  let value: Dynamic = element.clientWidth || 1,
    elementHeight: Dynamic = element.clientHeight || 1,
    clampedX: Dynamic = Math.min(Math.max(box.x, 0), value),
    clampedY: Dynamic = Math.min(Math.max(box.y, 0), elementHeight);
  return {
    x: clampedX / value,
    y: clampedY / elementHeight,
    w: (Math.min(Math.max(box.x + box.w, clampedX), value) - clampedX) / value,
    h: (Math.min(Math.max(box.y + box.h, clampedY), elementHeight) - clampedY) / elementHeight,
  };
}
function annotationTextLines(annotation?: Dynamic): Dynamic {
  if (annotation.kind === "title1")
    return NotesDomHandler_2(annotation.text).split(`
`);
  let callback: Dynamic = (note?: Dynamic): Dynamic =>
    NotesBlocksHandler(note)
      .map((noteLine?: Dynamic): Dynamic => noteLine.text)
      .join("");
  return parseNoteBlocks(annotation.text).flatMap(
    (source?: Dynamic): Dynamic =>
      source.kind === "p"
        ? [callback(source.text)]
        : source.items.map(callback),
  );
}
function canRevealFindMatch(
  settled?: Dynamic,
  target?: Dynamic,
  range?: Dynamic,
): Dynamic {
  return settled || !target || !range;
}
function revealFindMatchAfterTextEdit(
  event?: Dynamic,
  textEditOpen?: Dynamic,
  reveal?: Dynamic,
  settle?: Dynamic,
  commit?: Dynamic,
): Dynamic {
  if (textEditOpen || event.target?.isContentEditable !== true)
    return reveal();
  settle((): Dynamic => {
    reveal();
    commit();
  });
}
function revealFindMatchAfterSettle(
  needsSettle?: Dynamic,
  reveal?: Dynamic,
  settle?: Dynamic,
  commit?: Dynamic,
): Dynamic {
  if (!needsSettle) return reveal();
  settle((): Dynamic => {
    reveal();
    commit();
  });
}
function runFindRevealAfterSettle(
  needsSettle?: Dynamic,
  signal?: Dynamic,
  settle?: Dynamic,
  reveal?: Dynamic,
): Dynamic {
  if (!needsSettle) {
    reveal();
    return;
  }
  return new Promise(
    (notify?: Dynamic): Dynamic =>
      settle((): Dynamic => {
        let flag: Dynamic = false;
        try {
          signal.aborted || (reveal(), (flag = true));
        } finally {
          notify(flag);
        }
      }),
  );
}
function createCanvasFindAdapter(
  environment?: Dynamic,
  timeoutMs: Dynamic = findViewportRestoreTimeoutMs,
): Dynamic {
  let values: Dynamic = new Set(),
    entries: Dynamic = new Map(),
    activeSubscriptions: Dynamic = new Set(),
    value: Dynamic = null,
    text: Dynamic = "",
    previousText: Dynamic = "",
    matchedIds: Dynamic = new Set(),
    scrollEntries: Dynamic = new Map(),
    callback: Dynamic = (scrollTarget?: Dynamic): Dynamic =>
      "scrollY" in scrollTarget
        ? [scrollTarget.scrollX, scrollTarget.scrollY]
        : [scrollTarget.scrollLeft, scrollTarget.scrollTop],
    getScrollContainer: Dynamic = (target?: Dynamic): Dynamic =>
      ("scrollY" in target
        ? target.document.documentElement
        : target
      ).getClientRects().length !== 0,
    revealRange: Dynamic = (
      range?: Dynamic,
      revealOptions?: Dynamic,
      isReleased?: Dynamic,
    ): Dynamic =>
      revealTextRange(range, {
        ...revealOptions,
        onScroll: (scrollTarget?: Dynamic): Dynamic => {
          let isWindowTarget: Dynamic =
            "scrollY" in scrollTarget || scrollTarget === revealOptions.card;
          scrollEntries.set(scrollTarget, {
            from:
              scrollEntries.get(scrollTarget)?.from ??
              (isWindowTarget && isReleased() ? [0, 0] : callback(scrollTarget)),
            free: isReleased,
            owed: false,
          });
        },
      }),
    releaseScrollEntries: Dynamic = (
      range: Dynamic = null,
      forceRelease: Dynamic = false,
    ): Dynamic => {
      for (let [scrollTarget, scrollState] of [...scrollEntries] as Dynamic)
        try {
          if (
            "scrollY" in scrollTarget
              ? scrollTarget.closed || scrollTarget.frameElement?.isConnected !== true
              : !scrollTarget.isConnected ||
                scrollTarget.ownerDocument.defaultView === null
          ) {
            scrollEntries.delete(scrollTarget);
            continue;
          }
          if (
            (forceRelease && !scrollState.owed) ||
            (range !== null &&
              ("scrollY" in scrollTarget
                ? range.startContainer.ownerDocument?.defaultView === scrollTarget
                : scrollTarget.contains(range.startContainer)))
          )
            continue;
          if (!getScrollContainer(scrollTarget) || scrollState.free()) {
            scrollEntries.set(scrollTarget, {
              ...scrollState,
              owed: true,
            });
            continue;
          }
          scrollEntries.delete(scrollTarget);
          scrollTarget.scrollTo({
            left: scrollState.from[0],
            top: scrollState.from[1],
            behavior: "instant",
          });
        } catch {
          scrollEntries.delete(scrollTarget);
        }
    },
    notifySubscribers: Dynamic = (): Dynamic => {
      releaseScrollEntries(null, true);
      matchedIds.clear();
      for (let unsubscribe of [...values] as Dynamic) unsubscribe();
    },
    findInRange: Dynamic = (
      element?: Dynamic,
      limit?: Dynamic,
      query: Dynamic = text,
    ): Dynamic => {
      if (!element) return null;
      try {
        return findRenderedTextRanges(element, query, {
          limit: limit,
          skip: (node?: Dynamic): Dynamic =>
            node.matches(findExcludedEditorSelector),
        });
      } catch {
        return null;
      }
    },
    getElementBody: Dynamic = (fileKey?: Dynamic): Dynamic => {
      try {
        return environment.frame(fileKey)?.contentDocument?.body ?? null;
      } catch {
        return null;
      }
    },
    extractText: Dynamic = (
      lines?: Dynamic,
      query: Dynamic = text,
    ): Dynamic =>
      (lines ?? []).flatMap(
        (line?: Dynamic): Dynamic =>
          findTextOffsets(line, query).map(
            (): Dynamic => null,
          ),
      ),
    findTitleElement: Dynamic = (fileKey?: Dynamic): Dynamic => {
      for (let element of (environment
        .canvasRoot()
        ?.querySelectorAll("[data-mega-artboard]") ?? []) as Dynamic)
        if (element.getAttribute("data-mega-artboard") === fileKey)
          return element.querySelector("[data-mega-title-text]");
      return null;
    },
    findAnnotationElement: Dynamic = (annotationId?: Dynamic): Dynamic => {
      for (let element of (environment
        .canvasRoot()
        ?.querySelectorAll("[data-mega-annotation]") ?? []) as Dynamic)
        if (element.getAttribute("data-mega-annotation") === annotationId)
          return element;
      return null;
    },
    searchCanvas: Dynamic = async (
      query?: Dynamic,
      searchOptions?: Dynamic,
    ): Promise<Dynamic> => {
      let pageId: Dynamic = environment.pageId();
      query !== text && ((previousText = pageId), matchedIds.clear(), releaseScrollEntries());
      text = query;
      if (query === "") return [];
      let manifest: Dynamic = environment.manifest(),
        windowFile: Dynamic = environment.windowFile(),
        hasWindowFile: Dynamic = windowFile !== null,
        pageIds: Dynamic =
          manifest.pages && manifest.pages.length > 0
            ? manifest.pages.map((page?: Dynamic): Dynamic => page.id)
            : [""],
        items: Dynamic = [],
        remainingCapacity: Dynamic = (): Dynamic => 1001 - items.length,
        appendResults: Dynamic = (
          source?: Dynamic,
          resultOptions?: Dynamic,
        ): Dynamic => {
          let resultKey: Dynamic =
            source.kind === "note" ? source.id : source.file;
          resultOptions
            .slice(0, remainingCapacity())
            .forEach((range?: Dynamic, rangeIndex?: Dynamic): Dynamic => {
              let resultId: Dynamic = [
                source.page,
                source.kind,
                resultKey,
                rangeIndex,
              ].join("|");
              matchedIds.has(resultId) ||
                items.push({
                  ...source,
                  query: query,
                  index: rangeIndex,
                  range: range,
                  key: resultId,
                });
            });
        },
        searchStartedAt: Dynamic = performance.now(),
        activePageId: Dynamic = pageIds.includes(previousText) ? previousText : pageId;
      for (let pageCandidate of [
        activePageId,
        ...pageIds.filter((otherPageId?: Dynamic): Dynamic => otherPageId !== activePageId),
      ] as Dynamic) {
        let isCurrentPage: Dynamic = pageCandidate === pageId,
          artboards: Dynamic = manifest.artboards
            .filter(
              (board?: Dynamic): Dynamic =>
                designPageId(board, manifest.pages) === pageCandidate &&
                !(hasWindowFile && board.frameless),
            )
            .map(
              (annotation?: Dynamic): Dynamic => ({
                ...annotation,
                board: annotation,
                note: undefined,
              }),
            ),
          windowEntries: Dynamic = hasWindowFile
            ? []
            : (manifest.annotations ?? [])
                .filter(
                  (annotation?: Dynamic): Dynamic =>
                    !isShapeAnnotation(annotation) &&
                    annotation.text !== "" &&
                    designPageId(annotation, manifest.pages) ===
                      pageCandidate,
                )
                .map(
                  (annotation?: Dynamic): Dynamic => ({
                    ...annotationVisibleBounds(annotation),
                    note: annotation,
                    board: undefined,
                  }),
                );
        for (let { board: board, note: note } of sortArtboardsInReadingOrder([
          ...artboards,
          ...windowEntries,
        ]) as Dynamic) {
          if (searchOptions.aborted || remainingCapacity() <= 0) return items;
          note &&
            appendResults(
              {
                page: pageCandidate,
                kind: "note",
                id: note.id,
              },
              (isCurrentPage
                ? findInRange(
                    findAnnotationElement(note.id)?.querySelector("[data-note-text]"),
                    remainingCapacity(),
                  )
                : null) ?? extractText(annotationTextLines(note)),
            );
          board &&
            !hasWindowFile &&
            !board.frameless &&
            appendResults(
              {
                page: pageCandidate,
                kind: "name",
                file: board.file,
              },
              (isCurrentPage
                ? findInRange(findTitleElement(board.file), remainingCapacity())
                : null) ?? extractText([findArtboardTitle(board)]),
            );
          let hasTextResults: Dynamic =
            isCurrentPage && (!hasWindowFile || board?.file === windowFile);
          board &&
            appendResults(
              {
                page: pageCandidate,
                kind: "text",
                file: board.file,
              },
              (hasTextResults
                ? findInRange(getElementBody(board.file), remainingCapacity())
                : null) ??
                extractText(
                  environment.storedText?.(board.file),
                  collapseFindWhitespace(text),
                ),
            );
          !(performance.now() - searchStartedAt < findViewportTransformTolerance) &&
            (await waitForFindReveal(0), (searchStartedAt = performance.now()));
        }
      }
      return items;
    },
    waitForFrame: Dynamic = (fileKey?: Dynamic, waitOptions?: Dynamic): Dynamic =>
      new Promise((resolveFrame?: Dynamic): Dynamic => {
        let frameWindow: Dynamic = environment.frame(fileKey);
        if (frameWindow !== null || waitOptions.aborted)
          return resolveFrame(waitOptions.aborted ? null : frameWindow);
        let cancelProbe: Dynamic = (): Dynamic => {
            clearTimeout(probeTimer);
            waitOptions.removeEventListener("abort", cancelProbe);
            entries.get(fileKey)?.delete(cancelProbe);
            resolveFrame(waitOptions.aborted ? null : environment.frame(fileKey));
          },
          probeTimer: Dynamic = setTimeout(cancelProbe, findFrameProbeTimeoutMs);
        waitOptions.addEventListener("abort", cancelProbe);
        entries.set(fileKey, (entries.get(fileKey) ?? new Set()).add(cancelProbe));
      }),
    waitUntil: Dynamic = async (
      condition?: Dynamic,
      waitOptions?: Dynamic,
      frameTimeoutMs: Dynamic = findFrameCaptureTimeoutMs,
    ): Promise<Dynamic> => {
      let deadline: Dynamic = performance.now() + frameTimeoutMs;
      for (; !condition(); ) {
        if (waitOptions.aborted || performance.now() > deadline) return false;
        await waitForFindReveal(50);
      }
      return !waitOptions.aborted;
    },
    updateRange: Dynamic = (source?: Dynamic, element?: Dynamic): Dynamic => {
      let range: Dynamic = source.range;
      try {
        if (
          range !== null &&
          element &&
          range.startContainer.isConnected &&
          range.startContainer.ownerDocument === element.ownerDocument
        )
          return range;
      } catch {}
      let ranges: Dynamic =
        findInRange(element, source.index + 1, source.query) ?? [];
      source.range = ranges[Math.min(source.index, ranges.length - 1)] ?? null;
      return source.range;
    },
    isVisible: Dynamic = (element?: Dynamic): Dynamic =>
      element !== null &&
      element.clientWidth > 0 &&
      element.getClientRects().length > 0,
    revealInWindow: Dynamic = async (
      source?: Dynamic,
      revealOptions?: Dynamic,
    ): Promise<Dynamic> => {
      let windowFile: Dynamic = environment.windowFile(),
        frameWindow: Dynamic =
          windowFile === null || windowFile === source.file
            ? null
            : (environment.frame(windowFile)?.contentWindow ?? null);
      frameWindow !== null &&
        !scrollEntries.has(frameWindow) &&
        scrollEntries.set(frameWindow, {
          from: [0, 0],
          free: (): Dynamic => environment.scrollsItself(windowFile),
          owed: false,
        });
      let revealResult: Dynamic = environment.showInWindow(
        source.page,
        source.file,
        revealOptions,
      );
      if (
        (revealResult !== undefined && !(await revealResult)) ||
        !(await waitUntil(
          (): Dynamic => environment.windowFile() === source.file,
          revealOptions,
        )) ||
        (await waitForFrame(source.file, revealOptions)) === null
      )
        return true;
      await waitForFindReveal(50);
      let elementRange: Dynamic =
        revealOptions.aborted || environment.windowFile() !== source.file
          ? null
          : updateRange(source, getElementBody(source.file));
      return elementRange === null
        ? true
        : (revealRange(
            elementRange,
            {
              viewport: true,
            },
            (): Dynamic => environment.scrollsItself(source.file),
          ),
          !isVisible(environment.frame(source.file)) ||
            classifyTextRangeVisibility(elementRange) !== "never");
    },
    revealFileRange: Dynamic = async (
      source?: Dynamic,
      revealOptions?: Dynamic,
    ): Promise<Dynamic> => {
      let fileEntry: Dynamic = environment
        .manifest()
        .artboards.find(
          (candidate?: Dynamic): Dynamic => candidate.file === source.file,
        );
      if (!fileEntry) return true;
      environment.showsTextMatchesOnCanvas() &&
        environment.keepRunning(fileEntry.file);
      if (
        environment.windowFile() !== null ||
        !environment.showsTextMatchesOnCanvas()
      )
        return revealInWindow(source, revealOptions);
      if (source.page !== environment.pageId()) {
        let pageRevealResult: Dynamic = environment.showPage(
          source.page,
          fileEntry.file,
          revealOptions,
        );
        if (pageRevealResult !== undefined && !(await pageRevealResult)) return true;
        value = fileEntry.file;
      }
      environment.panTo(fileEntry);
      let frameElement: Dynamic = await waitForFrame(fileEntry.file, revealOptions);
      if (
        value === fileEntry.file &&
        frameElement !== null &&
        environment.editorOn !== undefined
      ) {
        let paintResult: Dynamic = await waitUntil(
          (): Dynamic => environment.editorOn?.(fileEntry.file) === true,
          revealOptions,
          timeoutMs,
        );
        if (revealOptions.aborted) return true;
        value = null;
        frameElement = environment.frame(fileEntry.file);
        paintResult && notifySubscribers();
      }
      let textRange: Dynamic =
        frameElement === null ? null : updateRange(source, getElementBody(fileEntry.file));
      if (frameElement === null || textRange === null || !isVisible(frameElement))
        return true;
      classifyTextRangeVisibility(textRange) !== "never" &&
        revealRange(
          textRange,
          {
            viewport: true,
          },
          (): Dynamic => environment.scrollsItself(fileEntry.file),
        );
      let sourceBox: Dynamic =
        classifyTextRangeVisibility(textRange) === "shown"
          ? rangeCanvasRect(textRange)
          : null;
      if (sourceBox === null) return false;
      let normalizedBox: Dynamic = normalizedElementBox(frameElement, sourceBox);
      environment.panTo(
        {
          x: fileEntry.x + normalizedBox.x * fileEntry.w,
          y: fileEntry.y + normalizedBox.y * fileEntry.h,
          w: normalizedBox.w * fileEntry.w,
          h: normalizedBox.h * fileEntry.h,
        },
        true,
      );
      return true;
    },
    findSourceById: Dynamic = (sourceId?: Dynamic): Dynamic =>
      (environment.manifest().annotations ?? []).find(
        (source?: Dynamic): Dynamic => source.id === sourceId,
      ),
    findSourceBounds: Dynamic = (source?: Dynamic): Dynamic => {
      let manifest: Dynamic = environment.manifest();
      if (source.kind === "name")
        return (
          manifest.artboards.find(
            (sourceEntry?: Dynamic): Dynamic => sourceEntry.file === source.file,
          ) ?? null
        );
      let annotation: Dynamic = findSourceById(source.id);
      return annotation ? annotationVisibleBounds(annotation) : null;
    },
    revealSource: Dynamic = async (
      source?: Dynamic,
      revealOptions?: Dynamic,
    ): Promise<Dynamic> => {
      if (environment.windowFile() !== null) return true;
      let sourceBounds: Dynamic = findSourceBounds(source);
      if (sourceBounds === null) return true;
      let getSourceElement: Dynamic = (): Dynamic =>
        source.kind === "note"
          ? findAnnotationElement(source.id)
          : findTitleElement(source.file);
      if (source.page !== environment.pageId()) {
        let pageReveal: Dynamic = environment.showPage(
          source.page,
          undefined,
          revealOptions,
        );
        if (pageReveal !== undefined && !(await pageReveal)) return true;
        await waitUntil((): Dynamic => getSourceElement() !== null, revealOptions);
      }
      if (revealOptions.aborted) return true;
      let sourceElementForNote: Dynamic = getSourceElement(),
        sourceRange: Dynamic = updateRange(
          source,
          source.kind === "note"
            ? sourceElementForNote?.querySelector("[data-note-text]")
            : sourceElementForNote,
        ),
        sourceEntry: Dynamic =
          source.kind === "note" ? findSourceById(source.id) : undefined,
        sourceElement: Dynamic = sourceEntry
          ? sourceElementForNote?.querySelector("[data-note-scroll]")
          : null,
        keepSourceVisible: Dynamic = (): Dynamic =>
          sourceElement == null ||
          /auto|scroll/.test(
            sourceElement.ownerDocument.defaultView?.getComputedStyle(sourceElement)
              .overflowY ?? "",
          );
      sourceRange !== null &&
        sourceElementForNote &&
        sourceEntry &&
        revealRange(
          sourceRange,
          {
            viewport: false,
            within: sourceElementForNote,
            fade: isShapeAnnotation(sourceEntry)
              ? 0
              : CanvasPanZoomRound(
                  annotationTextStyle(sourceEntry).size,
                ),
            card: sourceElement,
          },
          keepSourceVisible,
        );
      let isRangeHidden: Dynamic =
        sourceRange !== null &&
        sourceElementForNote !== null &&
        classifyTextRangeVisibility(sourceRange, {
          within: sourceElementForNote,
        }) === "never";
      if (isRangeHidden && source.kind === "note") return false;
      let rangeRectangle: Dynamic =
        sourceRange === null || isRangeHidden
          ? null
          : rangeCanvasRect(sourceRange);
      environment.panTo(
        rangeRectangle === null ? sourceBounds : environment.toCanvas(rangeRectangle),
      );
      return true;
    };
  return {
    search: searchCanvas,
    async reveal(source: Dynamic, revealOptions: Dynamic): Promise<Dynamic> {
      let flag: Dynamic = true;
      try {
        flag = await (source.kind === "text"
          ? revealFileRange(source, revealOptions)
          : revealSource(source, revealOptions));
      } finally {
        revealOptions.aborted || releaseScrollEntries(flag ? source.range : null);
      }
      !flag && !revealOptions.aborted && matchedIds.add(source.key);
      return flag || revealOptions.aborted;
    },
    paint(ranges: Dynamic, highlightIndex: Dynamic): Dynamic {
      let rangesByDocument: Dynamic = new Map();
      for (let { range: range } of ranges as Dynamic)
        try {
          let document: Dynamic = range?.startContainer.ownerDocument;
          range &&
            document &&
            range.startContainer.isConnected &&
            rangesByDocument.set(document, [...(rangesByDocument.get(document) ?? []), range]);
        } catch {
          continue;
        }
      let selectedRange: Dynamic = ranges[highlightIndex]?.range ?? null,
        documents: Dynamic = new Set(rangesByDocument.keys());
      for (let document of new Set([
        ...activeSubscriptions,
        ...rangesByDocument.keys(),
      ]) as Dynamic) {
        let entry: Dynamic = rangesByDocument.get(document);
        try {
          entry
            ? applyFindHighlights(
                document,
                entry,
                selectedRange !== null && entry.includes(selectedRange) ? selectedRange : null,
              )
            : clearFindHighlights(document);
        } catch {
          documents.add(document);
        }
      }
      activeSubscriptions = documents;
    },
    clear(): Dynamic {
      releaseScrollEntries();
      for (let document of activeSubscriptions as Dynamic)
        try {
          clearFindHighlights(document);
        } catch {}
      activeSubscriptions = new Set();
      text = "";
      matchedIds.clear();
      value = null;
      environment.keepRunning(null);
    },
    subscribe(subscriber: Dynamic): Dynamic {
      values.add(subscriber);
      return (): Dynamic => {
        values.delete(subscriber);
      };
    },
    describe(source: Dynamic): Dynamic {
      let manifest: Dynamic = environment.manifest(),
        label: Dynamic =
          source.page === environment.pageId()
            ? ""
            : (manifest.pages?.find(
                (board?: Dynamic): Dynamic => board.id === source.page,
              )?.name ?? ""),
        artboard: Dynamic =
          source.kind === "note"
            ? undefined
            : manifest.artboards.find(
                (annotation?: Dynamic): Dynamic => annotation.file === source.file,
              ),
        note: Dynamic =
          source.kind === "note"
            ? (manifest.annotations ?? []).find(
                (annotation?: Dynamic): Dynamic => annotation.id === source.id,
              )
            : undefined,
        labelSuffix: Dynamic = artboard
          ? (/^artboard\b/i.test(findArtboardTitle(artboard))
              ? ""
              : "Artboard ") + findArtboardTitle(artboard)
          : note
            ? note.kind === "title1"
              ? "Canvas text"
              : "Note"
            : undefined;
      return labelSuffix === undefined
        ? undefined
        : label === ""
          ? labelSuffix
          : label + ", " + labelSuffix;
    },
    changed: notifySubscribers,
    frameBooted(fileKey: Dynamic): Dynamic {
      for (let releaseCallback of [...(entries.get(fileKey) ?? [])] as Dynamic) releaseCallback();
      notifySubscribers();
    },
  };
}
function findRestoreCamera(camera?: Dynamic, glide?: Dynamic): Dynamic {
  return glide !== null && isCompatibleFindCameraGlide(camera, glide)
    ? glide.from
    : camera;
}
function isCompatibleFindCameraGlide(
  camera?: Dynamic,
  glide?: Dynamic,
): Dynamic {
  if (
    camera.scale !== glide.from.scale ||
    glide.to.scale !== glide.from.scale
  )
    return false;
  let value: Dynamic = glide.to.x - glide.from.x,
    deltaY: Dynamic = glide.to.y - glide.from.y,
    deltaX: Dynamic = camera.x - glide.from.x,
    deltaCameraY: Dynamic = camera.y - glide.from.y,
    distance: Dynamic = Math.hypot(value, deltaY),
    tolerance: Dynamic = 0.5 / camera.scale,
    minProjection: Dynamic =
      distance === 0
        ? Math.hypot(deltaX, deltaCameraY)
        : Math.abs(value * deltaCameraY - deltaY * deltaX) / distance,
    projection: Dynamic =
      distance === 0 ? 0 : (value * deltaX + deltaY * deltaCameraY) / distance;
  return minProjection <= tolerance && projection >= -tolerance && projection <= distance + tolerance;
}
function designFileTextRuns(file?: Dynamic, source?: Dynamic): Dynamic {
  if (source === undefined || isLoadingArtboardHtml(source))
    return null;
  let entry: Dynamic = cachedDesignTextRuns.get(file);
  if (entry?.src === source) return entry.runs;
  try {
    let value: Dynamic = parseDcHtmlDocument(source),
      textRuns: Dynamic = (
        value
          ? new DcEditorModel(value.template)
          : new DcEditorModel(source, {
              raw: true,
            })
      )
        .textRuns()
        .map(
          (line?: Dynamic): Dynamic =>
            collapseFindWhitespace(line).trim(),
        );
    cachedDesignTextRuns.delete(file);
    cachedDesignTextRuns.set(file, {
      src: source,
      runs: textRuns,
    });
    for (let fileKey of cachedDesignTextRuns.keys() as Dynamic) {
      if (cachedDesignTextRuns.size <= textRunCacheLimit) break;
      cachedDesignTextRuns.delete(fileKey);
    }
    return textRuns;
  } catch {
    return null;
  }
}
export {
  annotationTextLines,
  cachedDesignTextRuns,
  canRevealFindMatch,
  createCanvasFindAdapter,
  designFileTextRuns,
  findArtboardTitle,
  findExcludedEditorSelector,
  findFrameCaptureTimeoutMs,
  findFrameProbeTimeoutMs,
  findRestoreCamera,
  findViewportRestoreTimeoutMs,
  findViewportTransformTolerance,
  isCompatibleFindCameraGlide,
  normalizedElementBox,
  revealFindMatchAfterSettle,
  revealFindMatchAfterTextEdit,
  runFindRevealAfterSettle,
  textRunCacheLimit,
  waitForFindReveal,
};
export function installFindCanvasAdapter(): () => void {
  return () => {
    findExcludedEditorSelector =
      "[data-dc-editor-overlay],[data-dc-editor-overlay-root],[data-omelette-chrome],[data-omelette-injected],[data-dc-editor-drag-proxy],[data-dc-editor-copy-sink]";
    findFrameProbeTimeoutMs = 8e3;
    findFrameCaptureTimeoutMs = 3e3;
    findViewportRestoreTimeoutMs = 600;
    findViewportTransformTolerance = 8;
    findArtboardTitle = (artboard?: Dynamic): Dynamic =>
      artboard.title ?? artboard.file.replace(/\.dc\.html$/, "");
    waitForFindReveal = (milliseconds?: Dynamic): Dynamic =>
      new Promise((resolve?: Dynamic): Dynamic => setTimeout(resolve, milliseconds));
    textRunCacheLimit = 200;
    cachedDesignTextRuns = new Map();
  };
}
