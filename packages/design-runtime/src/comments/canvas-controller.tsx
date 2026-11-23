import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { prefersDragGesture, watchPointerRelease } from "../canvas/image-decode-scheduler";
import { buttonKeyboardActivation } from "../canvas/keyboard-activation";
import { isArtboardInViewport, useViewport } from "../canvas/viewport-store";
import { parseDesignCommentAnchor, serializeDesignCommentAnchor } from "./anchor-codec";
import { CommentAreaOutline, react_mi, useCommentAreaMarquee, usePendingCommentArea } from "./area-drawing";
import { artboardsCoveredByCommentArea, commentAreaHandlePoint, commentAreaWithinArtboardContent, createCommentOperationToken, describeCommentAreaLocation, nearestCommentAreaCorner, normalizeCommentArea, unionCommentRects } from "./area-geometry";
import { commentRectsEqual, commentScopeKey, createCommentAnchorResolver, createCommentBoardLookup } from "./anchor-resolution";
import { useCommentElementRects } from "./element-rects";
import { bindCustomAnchors } from "./host-controller";
import { useCommentModeShortcuts } from "./mode-shortcuts";
import { canvasToLayerPoint as toLayerPoint, commentAreaOutline, commentCardTargets, commentRevealTarget, computeThreadPlacements, revealFallbackPoint } from "./thread-placement";
import { clampCommentAreaToViewport, commentAnchorShortLabel, commentArtboardAreaDetail, commentArtboardAreaShortLabel, commentArtboardElementDetail, commentCanvasPointDetail, commentObjectAreaDetail, commentObjectAreaShortLabel, commentObjectPointDetail, commentSurfaceAriaLabel, commentTargetKeyboardHint, defaultArtboardCommentPoint, describeCommentElement, isCommentTargetEvent } from "./labels";
import { moveObjectCommentArea, normalizeObjectCommentArea, normalizeObjectCommentPoint, objectCommentAreaRect, objectsCoveredByCommentArea, pointWithinCommentObject } from "./object-geometry";
import { CommentPointer, commentPointerCursor } from "./pointer";
import { CommentCardLayer, isCommentCardEvent } from "./comment-cards";
import { load_react_jsx_runtime } from "../dependencies";
import { commentModePausedMessage } from "../editor/accessibility/announcements";
import { announce } from "../editor/accessibility/announcer";
import { pickerCommentAt, pickerCommentIn } from "../editor/picker/bridge";
import { toolbarOverlayHeight } from "../editor/toolbar/layout";
import { toModuleNamespace } from "../module-helpers";
import { rotatedAnnotationBounds } from "../platform/file-content";
import { createPreviewHandle } from "../preview/evaluation";

var jsx_mg: Dynamic;
var commentRevealTimeoutMs: Dynamic;
var canvasCommentScopeKey: Dynamic;
var commentPointerStrokeInset: Dynamic;
var commentPointerMovementThreshold: Dynamic;
var commentClickMovementThresholdPixels: Dynamic;
var maxCommentAreaElementLabels: Dynamic;
function useCanvasComments(hookOptions?: Dynamic): Dynamic {
  let {
      manifest: manifest,
      pageKey: pageKey,
      camera: camera,
      surfaceRef: surfaceRef,
      handlesRef: handlesRef,
      fullscreenFile: fullscreenFile,
      fullscreenFrame: fullscreenFrame,
      armedTool: armedTool,
    }: Dynamic = hookOptions,
    value: Dynamic = (0, react_mi.useRef)(hookOptions);
  value.current = hookOptions;
  let controllerRef: Dynamic = (0, react_mi.useRef)(null),
    [hasController, setHasController]: Dynamic = (0, react_mi.useState)(false),
    lastComposeAtRef: Dynamic = (0, react_mi.useRef)(Number.NEGATIVE_INFINITY),
    callback: Dynamic = (controller?: Dynamic): Dynamic =>
      new Proxy(controller, {
        get(target: Dynamic, property: Dynamic): Dynamic {
          if (property === "compose")
            return (
              composeAnchor?: Dynamic,
              composeLocation?: Dynamic,
              composeExtras?: Dynamic,
            ): Dynamic => (
              (lastComposeAtRef.current = performance.now()),
              target.compose(composeAnchor, composeLocation, composeExtras)
            );
          let entry: Dynamic = Reflect.get(target, property, target);
          return typeof entry == "function" ? entry.bind(target) : entry;
        },
      }),
    [isCommentMode, setIsCommentMode]: Dynamic = (0, react_mi.useState)(false),
    viewport: Dynamic = useViewport(isCommentMode, camera),
    isCommentModeRef: Dynamic = (0, react_mi.useRef)(isCommentMode);
  isCommentModeRef.current = isCommentMode;
  let [isComposing, setIsComposing]: Dynamic = (0, react_mi.useState)(false),
    [threads, setThreads]: Dynamic = (0, react_mi.useState)([]),
    threadsRef: Dynamic = (0, react_mi.useRef)(threads);
  threadsRef.current = threads;
  let [hoverRect, setHoverRect]: Dynamic = (0, react_mi.useState)(null),
    // MineDesign：点中元素后输入评论期间，继续框住这个元素（同 Codex），输入框关掉再放开
    [mdnHeldRect, mdnSetHeldRect]: Dynamic = (0, react_mi.useState)(
      null,
    ),
    updateHoverRect: Dynamic = (rect?: Dynamic): Dynamic =>
      setHoverRect(
        (previous?: Dynamic): Dynamic =>
          commentRectsEqual(previous, rect) ? previous : rect,
      ),
    hoverGenerationRef: Dynamic = (0, react_mi.useRef)(0),
    lastPointerRef: Dynamic = (0, react_mi.useRef)(null),
    [revealThreadId, setRevealThreadId]: Dynamic = (0, react_mi.useState)(null),
    lastPlacedJsonRef: Dynamic = (0, react_mi.useRef)("");
  (0, react_mi.useEffect)((): Dynamic => {
    let flag: Dynamic = false;
    bindCustomAnchors({
      mode: (isModeOn?: Dynamic): Dynamic => {
        setIsCommentMode(isModeOn);
        value.current.onModeChange?.(isModeOn);
        hoverGenerationRef.current += 1;
        lastPointerRef.current = null;
        updateHoverRect(null);
        lastPlacedJsonRef.current = "";
      },
      threads: (nextThreads?: Dynamic): Dynamic => {
        lastPlacedJsonRef.current = "";
        setThreads(nextThreads);
        nextThreads.some((thread?: Dynamic): Dynamic => thread.active) &&
          pendingAreaRef.current.show(null);
      },
      composing: setIsComposing,
      move: (threadId?: Dynamic, position?: Dynamic): Dynamic =>
        resolveThreadMoveRef.current(threadId, position),
      hotkey: true,
      reveal: (threadId?: Dynamic): Dynamic => {
        let foundThread: Dynamic = threadsRef.current.find(
            (thread?: Dynamic): Dynamic => thread.id === threadId,
          ),
          parsedAnchor: Dynamic = foundThread
            ? parseDesignCommentAnchor(foundThread.anchor)
            : null;
        if (!parsedAnchor) return;
        let revealTarget: Dynamic = commentRevealTarget(parsedAnchor);
        value.current.onReveal?.(revealTarget) !== false && setRevealThreadId(threadId);
      },
    }).then((controller?: Dynamic): Dynamic => {
      if (flag) {
        controller?.release();
        return;
      }
      controllerRef.current = controller;
      setHasController(controller != null);
      value.current.onController?.(controller && callback(controller));
    });
    return (): Dynamic => {
      flag = true;
      controllerRef.current?.release();
      controllerRef.current = null;
      value.current.onController?.(null);
    };
  }, []);
  useCommentModeShortcuts({
    isCommentMode,
    armedTool,
    hasController,
    controllerRef,
    isCommentModeRef,
    optionsRef: value,
  });
  let boardLookup: Dynamic = createCommentBoardLookup({ manifest, fullscreenFile, fullscreenFrame }),
    {
      findArtboardByFile,
      findFileByHash,
      findNoteByHash,
      findNoteById,
      isFileVisible,
      getArtboardFrame,
    }: Dynamic = boardLookup,
    findFileByHashRef: Dynamic = (0, react_mi.useRef)(findFileByHash);
  findFileByHashRef.current = findFileByHash;
  // 评论模式下定时重测元素与页面矩形；状态与定时器都归该 Hook 所有
  let { elementRects, pageRects, setPageRect }: Dynamic = useCommentElementRects({
    isCommentMode,
    fullscreenFile,
    threads,
    threadsRef,
    findFileByHashRef,
    getHandlesRef: (): Dynamic => value.current.handlesRef,
  });
  let { resolveAreaRect, resolveAnchorPoint, artboardRectToCanvas }: Dynamic = createCommentAnchorResolver({
      manifest,
      pageKey,
      fullscreenFile,
      lookup: boardLookup,
      annBox: (note?: Dynamic): Dynamic => hookOptions.annBox(note),
      elementRects,
      pageRects,
    }),
    canvasToLayerPoint: Dynamic = (point?: Dynamic): Dynamic => toLayerPoint(point, viewport);
  (0, react_mi.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = controllerRef.current,
      surfaceElement: Dynamic = surfaceRef.current;
    if (!isCommentMode || !current || !surfaceElement) return;
    let state: Dynamic = computeThreadPlacements({
        threads,
        resolveAnchorPoint,
        viewport,
        bounds: surfaceElement.getBoundingClientRect(),
        toolbarHeight: toolbarOverlayHeight(surfaceElement),
        window: window as Dynamic,
      }),
      placedJson: Dynamic = JSON.stringify(state);
    placedJson !== lastPlacedJsonRef.current &&
      ((lastPlacedJsonRef.current = placedJson), current.placed(state));
  });
  (0, react_mi.useEffect)((): Dynamic => {
    if (revealThreadId == null) return;
    let foundThread: Dynamic = threads.find(
        (thread?: Dynamic): Dynamic => thread.id === revealThreadId,
      ),
      parsedAnchor: Dynamic = foundThread
        ? parseDesignCommentAnchor(foundThread.anchor)
        : null,
      current: Dynamic = surfaceRef.current;
    if (!parsedAnchor || !current) {
      setRevealThreadId(null);
      return;
    }
    let targetPoint: Dynamic = resolveAnchorPoint(parsedAnchor);
    targetPoint || (targetPoint = revealFallbackPoint(parsedAnchor, boardLookup));
    if (!targetPoint || (setRevealThreadId(null), fullscreenFile != null)) return;
    let toolbarHeight: Dynamic = toolbarOverlayHeight(current),
      viewWidth: Dynamic = current.clientWidth || 1,
      viewHeight: Dynamic = (current.clientHeight || 1) - toolbarHeight,
      targetScale: Dynamic = Math.max(camera.get().scale, 0.5);
    camera.set(
      {
        x: targetPoint.x - viewWidth / (2 * targetScale),
        y: targetPoint.y - (toolbarHeight + viewHeight / 2) / targetScale,
        scale: targetScale,
      },
      true,
    );
  }, [revealThreadId, threads, manifest, elementRects, fullscreenFile, pageKey, camera]);
  let hitTestPoint: Dynamic = (
      clientX?: Dynamic,
      clientY?: Dynamic,
    ): Dynamic => {
      let current: Dynamic = surfaceRef.current;
      if (!current) return null;
      let bounds: Dynamic = current.getBoundingClientRect(),
        canvasX: Dynamic = viewport.x + (clientX - bounds.left) / viewport.scale,
        canvasY: Dynamic = viewport.y + (clientY - bounds.top) / viewport.scale;
      for (let element of (document as Dynamic).elementsFromPoint(
        clientX,
        clientY,
      ) as Dynamic) {
        if (element.closest('[data-mega-chrome="comments"]')) continue;
        if (!current.contains(element)) return null;
        let ancestor: Dynamic = element.closest("[data-mega-annotation]");
        if (ancestor)
          return {
            kind: "note",
            id: ancestor.getAttribute("data-mega-annotation") ?? "",
            el: ancestor,
            x: canvasX,
            y: canvasY,
          };
        let artboardElement: Dynamic = element.closest("[data-mega-artboard]");
        if (artboardElement) {
          let file: Dynamic =
              artboardElement.getAttribute("data-mega-artboard") ?? "",
            artboard: Dynamic = findArtboardByFile(file);
          if (!artboard) return null;
          let frame: Dynamic = getArtboardFrame(artboard),
            localX: Dynamic = canvasX - frame.x,
            localY: Dynamic = canvasY - frame.y,
            isInsideFrame: Dynamic =
              localX >= 0 &&
              localY >= 0 &&
              localX <= frame.w &&
              localY <= frame.h,
            entry: Dynamic = handlesRef.current.get(file);
          return isInsideFrame
            ? {
                kind:
                  entry?.isReady() && !entry.isBlocked() ? "face" : "offFace",
                file: file,
                lx: localX,
                ly: localY,
              }
            : {
                kind: "artboard",
                file: file,
                fx: Math.min(1, Math.max(0, localX / (frame.w || 1))),
                fy: 0,
              };
        }
        if (element === current || element.parentElement === current)
          return fullscreenFile == null
            ? {
                kind: "canvas",
                x: canvasX,
                y: canvasY,
              }
            : null;
      }
      return null;
    },
    pickElementAt: Dynamic = async (
      file?: Dynamic,
      localX?: Dynamic,
      localY?: Dynamic,
      timeoutMs?: Dynamic,
    ): Promise<Dynamic> => {
      let entry: Dynamic = handlesRef.current.get(file),
        handle: Dynamic = entry
          ? createPreviewHandle(entry.previewFrameRef.current)
          : null;
      return handle
        ? pickerCommentAt(handle, localX, localY, timeoutMs)
        : null;
    },
    hoverProbeRef: Dynamic = (0, react_mi.useRef)({
      busy: false,
      next: null,
    }),
    updateHoverAt: Dynamic = (clientX?: Dynamic, clientY?: Dynamic): Dynamic => {
      let hit: Dynamic = hitTestPoint(clientX, clientY);
      hit?.kind !== "face" &&
        ((hoverGenerationRef.current += 1), (hoverProbeRef.current.next = null));
      if (!hit || hit.kind === "canvas") return updateHoverRect(null);
      if (hit.kind === "note") {
        let bounds: Dynamic = surfaceRef.current.getBoundingClientRect(),
          elementBounds: Dynamic = hit.el.getBoundingClientRect();
        return updateHoverRect({
          x: viewport.x + (elementBounds.left - bounds.left) / viewport.scale,
          y: viewport.y + (elementBounds.top - bounds.top) / viewport.scale,
          w: elementBounds.width / viewport.scale,
          h: elementBounds.height / viewport.scale,
        });
      }
      if (hit.kind === "artboard" || hit.kind === "offFace") {
        let frame: Dynamic = getArtboardFrame(findArtboardByFile(hit.file));
        return updateHoverRect(
          artboardRectToCanvas(hit.file, {
            x: 0,
            y: 0,
            w: frame.w,
            h: frame.h,
          }),
        );
      }
      let current: Dynamic = hoverGenerationRef.current,
        probeElement: Dynamic = (): Dynamic => {
          hoverProbeRef.current.busy = true;
          pickElementAt(hit.file, hit.lx, hit.ly, 600).then(
            (pickResult?: Dynamic): Dynamic => {
              hoverProbeRef.current.busy = false;
              let next: Dynamic = hoverProbeRef.current.next;
              hoverProbeRef.current.next = null;
              next
                ? next()
                : current === hoverGenerationRef.current &&
                  updateHoverRect(
                    pickResult && pickResult.path != null
                      ? artboardRectToCanvas(hit.file, pickResult.rect)
                      : null,
                  );
            },
          );
        };
      hoverProbeRef.current.busy
        ? (hoverProbeRef.current.next = probeElement)
        : probeElement();
    },
    updateHoverAtRef: Dynamic = (0, react_mi.useRef)(updateHoverAt);
  updateHoverAtRef.current = updateHoverAt;
  let handleLayerPointerMove: Dynamic = (event?: Dynamic): Dynamic => {
    lastPointerRef.current = {
      x: event.clientX,
      y: event.clientY,
    };
    areaMarquee.drawing() || updateHoverAt(event.clientX, event.clientY);
  };
  (0, react_mi.useEffect)((): Dynamic => {
    let current: Dynamic = lastPointerRef.current;
    isCommentMode && current && updateHoverAt(current.x, current.y);
  }, [viewport.x, viewport.y, viewport.scale]);
  let resolveClickTarget: Dynamic = async (
      clientX?: Dynamic,
      clientY?: Dynamic,
      timeoutMs: Dynamic = 3e3,
    ): Promise<Dynamic> => {
      let hit: Dynamic = hitTestPoint(clientX, clientY);
      if (!hit) return null;
      if (hit.kind === "canvas")
        return {
          anchor: {
            kind: "canvas",
            page: pageKey,
            x: hit.x,
            y: hit.y,
          },
          label: commentAnchorShortLabel({
            kind: "canvas",
            pages: manifest.pages,
            pageKey: pageKey,
          }),
          detail: commentCanvasPointDetail(hit.x, hit.y),
        };
      if (hit.kind === "note") {
        let note: Dynamic = findNoteById(hit.id),
          noteInfo: Dynamic = note ?? {
            text: "",
          },
          notePoint: Dynamic = note
            ? normalizeObjectCommentPoint(
                note,
                hookOptions.annBox(note),
                hit,
              )
            : undefined;
        return {
          anchor: {
            kind: "note",
            id: hit.id,
            ...notePoint,
          },
          label: commentAnchorShortLabel({
            kind: "note",
            note: noteInfo,
          }),
          detail: commentObjectPointDetail(noteInfo, notePoint),
        };
      }
      let artboard: Dynamic = findArtboardByFile(hit.file);
      if (!artboard) return null;
      let artboardLabel: Dynamic = commentAnchorShortLabel({
        kind: "artboard",
        board: artboard,
      });
      if (hit.kind === "artboard")
        return {
          anchor: hit,
          label: artboardLabel,
          detail: commentArtboardElementDetail(artboard),
        };
      let frame: Dynamic = getArtboardFrame(artboard),
        artboardPointTarget: Dynamic = (pageRect?: Dynamic): Dynamic => ({
          anchor: pageRect
            ? {
                kind: "artboard",
                file: hit.file,
                px: hit.lx - pageRect.x,
                py: hit.ly - pageRect.y,
              }
            : {
                kind: "artboard",
                file: hit.file,
                fx: Math.min(1, Math.max(0, hit.lx / (frame.w || 1))),
                fy: Math.min(1, Math.max(0, hit.ly / (frame.h || 1))),
              },
          label: artboardLabel,
          detail: commentArtboardElementDetail(artboard),
        });
      if (hit.kind === "offFace")
        return artboardPointTarget(
          handlesRef.current.get(hit.file)?.previewFrameRef.current
            ? null
            : {
                x: 0,
                y: 0,
              },
        );
      let picked: Dynamic = await pickElementAt(
        hit.file,
        hit.lx,
        hit.ly,
        timeoutMs,
      );
      picked?.page && setPageRect(hit.file, picked.page);
      if (!picked || picked.path == null)
        return artboardPointTarget(picked?.page ?? null);
      let state: Dynamic = {
        kind: "el",
        file: hit.file,
        path: picked.path,
        tid: picked.tid,
        fp: picked.fp,
        fx: picked.fx,
        fy: picked.fy,
      };
      if (!serializeDesignCommentAnchor(state))
        return artboardPointTarget(picked.page ?? null);
      let entry: Dynamic = handlesRef.current.get(hit.file),
        elementLabel: Dynamic = describeCommentElement(
          entry,
          picked,
        );
      return {
        anchor: state,
        label: commentAnchorShortLabel({
          kind: "el",
          board: artboard,
          el: elementLabel,
        }),
        detail: commentArtboardElementDetail(
          artboard,
          describeElementEntry(entry, picked.tid, elementLabel),
        ),
      };
    },
    composeAtPointer: Dynamic = (event?: Dynamic): Dynamic => {
      operationTokenRef.current.cancel();
      let current: Dynamic = controllerRef.current;
      if (!current || !isCommentMode) return;
      let state: Dynamic = {
        x: event.clientX + (window as Dynamic).scrollX,
        y: event.clientY + (window as Dynamic).scrollY,
      };
      resolveClickTarget(event.clientX, event.clientY).then(
        (target?: Dynamic): Dynamic => {
          let serializedAnchor: Dynamic = target
            ? serializeDesignCommentAnchor(target.anchor)
            : null;
          serializedAnchor &&
            current
              .compose(serializedAnchor, state, {
                label: target.label,
                ...(target.detail
                  ? {
                      detail: target.detail,
                    }
                  : {}),
              })
              .then(
                (result?: Dynamic): Dynamic => {
                  result.opened && pendingArea.clear();
                },
                (): Dynamic => {},
              );
        },
        (): Dynamic => {},
      );
    },
    describeElementEntry: Dynamic = (
      entry?: Dynamic,
      templateId?: Dynamic,
      label?: Dynamic,
    ): Dynamic => {
      let viewEntry: Dynamic =
        templateId != null ? entry?.viewEntries([templateId])[0] : undefined;
      return viewEntry
        ? {
            path: viewEntry.path,
            kind: label?.kind ?? viewEntry.kind,
            text: label?.text ?? viewEntry.words(),
          }
        : null;
    },
    operationTokenRef: Dynamic = (0, react_mi.useRef)(
      createCommentOperationToken(),
    ),
    pendingArea: Dynamic = usePendingCommentArea(
      isComposing,
      pageKey +
        `
` +
        (fullscreenFile ?? ""),
    ),
    pendingAreaRef: Dynamic = (0, react_mi.useRef)(pendingArea);
  pendingAreaRef.current = pendingArea;
  let { drawn: drawnAreaRect }: Dynamic = pendingArea,
    layerRef: Dynamic = (0, react_mi.useRef)(null),
    clientToCanvas: Dynamic = (clientX?: Dynamic, clientY?: Dynamic): Dynamic => {
      let bounds: Dynamic = surfaceRef.current?.getBoundingClientRect(),
        entry: Dynamic = camera.get();
      return bounds
        ? {
            x: entry.x + (clientX - bounds.left) / entry.scale,
            y: entry.y + (clientY - bounds.top) / entry.scale,
          }
        : null;
    },
    canvasToClient: Dynamic = (point?: Dynamic): Dynamic => {
      let bounds: Dynamic = surfaceRef.current?.getBoundingClientRect(),
        entry: Dynamic = camera.get();
      return bounds
        ? {
            x: bounds.left + (point.x - entry.x) * entry.scale,
            y: bounds.top + (point.y - entry.y) * entry.scale,
          }
        : null;
    },
    areaMarquee: Dynamic = useCommentAreaMarquee({
      toLocal: clientToCanvas,
      toClient: canvasToClient,
      stage: (): Dynamic => surfaceRef.current,
      slopPx: 10,
      onClick: (event?: Dynamic): Dynamic =>
        composeAtPointerRef.current({
          clientX: event.clientX,
          clientY: event.clientY,
        }),
      onNothing: (): Dynamic => pendingArea.restore(),
      onLive: (): Dynamic => pendingArea.show(null),
      onArea: ({
        c0: c02,
        c1: c12,
        at: at,
        resizing: resizing,
      }: Dynamic): Dynamic => {
        let state: Dynamic = {
            x: Math.min(c02.x, c12.x),
            y: Math.min(c02.y, c12.y),
            w: Math.abs(c12.x - c02.x),
            h: Math.abs(c12.y - c02.y),
          },
          pinPoint: Dynamic = resizing ? c12 : c02,
          areaWithOrigin: Dynamic = {
            ...state,
            ox: pinPoint.x,
            oy: pinPoint.y,
          };
        pendingArea.show(areaWithOrigin);
        composeAreaCommentRef.current(
          areaWithOrigin,
          {
            x: at.x + (window as Dynamic).scrollX,
            y: at.y + (window as Dynamic).scrollY,
          },
          nearestCommentAreaCorner(state, resizing ? c02 : c12),
          operationTokenRef.current.begin(),
        );
      },
    }),
    { marquee: marqueeState }: Dynamic = areaMarquee;
  (0, react_mi.useEffect)((): Dynamic => {
    areaMarquee.cancel();
    operationTokenRef.current.cancel();
    isCommentMode || pendingArea.clear();
  }, [isCommentMode, pageKey, fullscreenFile]);
  let startAreaDrag: Dynamic = (
      event?: Dynamic,
      resizeAnchor?: Dynamic,
    ): Dynamic => {
      let current: Dynamic = controllerRef.current,
        layerElement: Dynamic = layerRef.current;
      return !current ||
        !layerElement ||
        event.button !== 0 ||
        hookOptions.spaceHeld ||
        prefersDragGesture(event, !!current.areas)
        ? false
        : (mdnSetHeldRect(hoverRect),
          updateHoverRect(null),
          (hoverGenerationRef.current += 1),
          areaMarquee.start(event.nativeEvent, layerElement, resizeAnchor));
    },
    composeAreaComment: Dynamic = async (
      rect?: Dynamic,
      position?: Dynamic,
      corner?: Dynamic,
      operation?: Dynamic,
    ): Promise<Dynamic> => {
      let current: Dynamic = controllerRef.current;
      if (!current || !isCommentMode) return;
      let isOperationLive: Dynamic = (): Dynamic =>
          controllerRef.current === current && isCommentModeRef.current && operation.live,
        scopeKey: Dynamic =
          pageKey +
          `
` +
          (fullscreenFile ?? ""),
        restorePending: Dynamic = (): Dynamic => {
          operation.live && pendingArea.restore();
        },
        flag: Dynamic = false,
        target: Dynamic = await resolveAreaTarget(rect, corner, (): Dynamic => {
          flag = true;
          pendingArea.show(null);
        });
      if (!target && flag) return;
      let serializedAnchor: Dynamic = target
        ? serializeDesignCommentAnchor(target.anchor)
        : null;
      if (!target || !serializedAnchor || !isOperationLive()) return restorePending();
      current
        .compose(serializedAnchor, position, {
          label: target.label,
          ...(target.detail
            ? {
                detail: target.detail,
              }
            : {}),
          area: true,
        })
        .then((result?: Dynamic): Dynamic => {
          if (!result.opened) return restorePending();
          operation.live && pendingArea.hold(rect, scopeKey);
        }, restorePending);
    },
    resolveAreaTarget: Dynamic = async (
      area?: Dynamic,
      corner?: Dynamic,
      onNoBoards?: Dynamic,
      pickTimeoutMs: Dynamic = 3e3,
    ): Promise<Dynamic> => {
      let artboardFrames: Dynamic = manifest.artboards
          .filter((board?: Dynamic): Dynamic => isFileVisible(board.file))
          .map(
            (board?: Dynamic): Dynamic => ({
              board: board,
              frame: getArtboardFrame(board),
            }),
          ),
        coveredBoards: Dynamic = artboardsCoveredByCommentArea(
          area,
          artboardFrames,
          7,
        ),
        hasCoveredBoards: Dynamic = coveredBoards.length > 0,
        isAnnotationUnder: Dynamic = (annotation?: Dynamic): Dynamic =>
          hookOptions.annUnder?.(annotation) === true,
        annotations: Dynamic =
          fullscreenFile != null ? [] : (manifest.annotations ?? []),
        candidateObjects: Dynamic = [
          ...annotations.filter(isAnnotationUnder),
          ...annotations.filter(
            (annotation?: Dynamic): Dynamic => !isAnnotationUnder(annotation),
          ),
        ]
          .filter(
            (source?: Dynamic): Dynamic =>
              source.kind !== "line" &&
              source.kind !== "arrow" &&
              !(hasCoveredBoards && isAnnotationUnder(source)),
          )
          .map(
            (source?: Dynamic): Dynamic => ({
              object: source,
              bounds: rotatedAnnotationBounds(
                source,
                hookOptions.annBox(source),
              ),
              solid: source.kind !== "pen",
              hides: source.kind === "image" || source.kind === undefined,
              on: (point?: Dynamic): Dynamic =>
                pointWithinCommentObject(
                  source,
                  hookOptions.annBox(source),
                  point,
                ),
            }),
          );
      for (let commentObject of objectsCoveredByCommentArea(
        area,
        candidateObjects,
        hasCoveredBoards,
      ) as Dynamic) {
        let objectBox: Dynamic = normalizeObjectCommentArea(
            commentObject,
            hookOptions.annBox(commentObject),
            area,
            corner,
          ),
          objectArea: Dynamic = normalizeCommentArea(
            area,
            rotatedAnnotationBounds(
              commentObject,
              hookOptions.annBox(commentObject),
            ),
          );
        if (objectBox)
          return {
            anchor: {
              kind: "notearea",
              id: commentObject.id,
              box: objectBox,
            },
            label: commentObjectAreaShortLabel(commentObject, objectArea),
            detail: commentObjectAreaDetail(commentObject, objectBox),
          };
      }
      if (coveredBoards.length === 0) {
        onNoBoards?.();
        if (fullscreenFile != null) return null;
        let centerX: Dynamic = area.x + area.w / 2,
          centerY: Dynamic = area.y + area.h / 2;
        return {
          anchor: {
            kind: "canvas",
            page: pageKey,
            x: centerX,
            y: centerY,
          },
          label: commentAnchorShortLabel({
            kind: "canvas",
            pages: manifest.pages,
            pageKey: pageKey,
          }),
          detail: commentCanvasPointDetail(centerX, centerY),
        };
      }
      let pickEnclosing: Dynamic = async (
          covered?: Dynamic,
        ): Promise<Dynamic> => {
          let entry: Dynamic = handlesRef.current.get(covered.board.file),
            handle: Dynamic =
              entry?.isReady() && !entry.isBlocked()
                ? createPreviewHandle(entry.previewFrameRef.current)
                : null;
          if (!handle) return null;
          let left: Dynamic = covered.inter.x - covered.frame.x,
            top: Dynamic = covered.inter.y - covered.frame.y;
          return pickerCommentIn(
            handle,
            left,
            top,
            left + covered.inter.w,
            top + covered.inter.h,
            pickTimeoutMs,
          );
        },
        describeCoveredElements: Dynamic = (
          covered?: Dynamic,
          picked?: Dynamic,
        ): Dynamic => {
          if (!picked) return {};
          let entry: Dynamic = handlesRef.current.get(covered.board.file),
            items: Dynamic = [];
          for (let coveredElement of picked.covered as Dynamic) {
            let viewEntry: Dynamic = entry?.viewEntries([coveredElement.tid])[0];
            viewEntry &&
              viewEntry.path.startsWith(String(coveredElement.tid) + ":") &&
              items.push({
                path: viewEntry.path,
                kind: viewEntry.kind,
                text: viewEntry.words(),
              });
          }
          return {
            els: items.slice(0, maxCommentAreaElementLabels),
            total: Math.max(
              items.length,
              picked.total - (picked.covered.length - items.length),
            ),
          };
        };
      if (coveredBoards.length === 1) {
        let covered: Dynamic = coveredBoards[0],
          picked: Dynamic =
            covered.cov >= 0.85 ? null : await pickEnclosing(covered),
          enclosing: Dynamic = picked?.enclosing,
          state: Dynamic = {
            kind: "area",
            file: covered.board.file,
            path: null,
            tid: null,
            box: {
              ...covered.b,
              ...(corner != null
                ? {
                    corner: corner,
                  }
                : {}),
            },
          };
        if (enclosing && enclosing.path != null) {
          let contentBox: Dynamic = commentAreaWithinArtboardContent(covered, enclosing.rect),
            enclosingAnchor: Dynamic = contentBox && {
              kind: "area",
              file: covered.board.file,
              path: enclosing.path,
              tid: enclosing.tid,
              fp: enclosing.fp,
              box: {
                ...contentBox,
                ...(corner != null
                  ? {
                      corner: corner,
                    }
                  : {}),
              },
            };
          enclosingAnchor &&
            serializeDesignCommentAnchor(enclosingAnchor) &&
            (state = enclosingAnchor);
        }
        let boardSummary: Dynamic = {
          board: covered.board,
          cov: covered.cov,
          part: describeCommentAreaLocation(
            covered.b,
            covered.cov,
          ),
          ...describeCoveredElements(covered, picked),
        };
        return {
          anchor: state,
          label: commentArtboardAreaShortLabel([boardSummary]),
          detail: commentArtboardAreaDetail([boardSummary]),
        };
      }
      let pickedList: Dynamic = await Promise.all(
          coveredBoards.map(
            (board?: Dynamic): Dynamic =>
              board.cov < 0.85 ? pickEnclosing(board) : Promise.resolve(null),
          ),
        ),
        boardSummaries: Dynamic = coveredBoards.map(
          (covered?: Dynamic, index?: Dynamic): Dynamic => ({
            board: covered.board,
            cov: covered.cov,
            part: describeCommentAreaLocation(
              covered.b,
              covered.cov,
            ),
            ...describeCoveredElements(covered, pickedList[index] ?? null),
          }),
        ),
        framesUnion: Dynamic = unionCommentRects(
          coveredBoards.map((covered?: Dynamic): Dynamic => covered.frame),
        );
      return {
        anchor: {
          kind: "boards",
          page: pageKey,
          boards: coveredBoards.map(
            (covered?: Dynamic): Dynamic => ({
              file: covered.board.file,
              cov: covered.cov,
            }),
          ),
          box: {
            ...normalizeCommentArea(area, framesUnion),
            ...(corner != null
              ? {
                  corner: corner,
                }
              : {}),
          },
        },
        label: commentArtboardAreaShortLabel(boardSummaries),
        detail: commentArtboardAreaDetail(boardSummaries),
      };
    },
    composeAreaCommentRef: Dynamic = (0, react_mi.useRef)(composeAreaComment);
  composeAreaCommentRef.current = composeAreaComment;
  let composeAtPointerRef: Dynamic = (0, react_mi.useRef)(composeAtPointer);
  composeAtPointerRef.current = composeAtPointer;
  let resolveThreadMove: Dynamic = async (
      threadId?: Dynamic,
      position?: Dynamic,
    ): Promise<Dynamic> => {
      if (!controllerRef.current || !isCommentMode) return null;
      let foundThread: Dynamic = threads.find(
          (thread?: Dynamic): Dynamic => thread.id === threadId,
        ),
        parsedAnchor: Dynamic = foundThread
          ? parseDesignCommentAnchor(foundThread.anchor)
          : null;
      if (!parsedAnchor) return null;
      let state: Dynamic = {
        x: position.x - (window as Dynamic).scrollX,
        y: position.y - (window as Dynamic).scrollY,
      };
      if (!hitTestPoint(state.x, state.y)) return null;
      let resolvedTarget: Dynamic;
      if (
        parsedAnchor.kind === "area" ||
        parsedAnchor.kind === "boards" ||
        parsedAnchor.kind === "notearea"
      ) {
        let areaRect: Dynamic = resolveAreaRect(parsedAnchor),
          handlePoint: Dynamic =
            parsedAnchor.kind === "notearea"
              ? resolveAnchorPoint(parsedAnchor)
              : areaRect
                ? commentAreaHandlePoint(
                    areaRect,
                    parsedAnchor.box.corner,
                  )
                : null,
          pointerCanvas: Dynamic = clientToCanvas(state.x, state.y);
        if (
          !areaRect ||
          !handlePoint ||
          !pointerCanvas ||
          (parsedAnchor.kind === "notearea" &&
            Math.round(pointerCanvas.x - handlePoint.x) === 0 &&
            Math.round(pointerCanvas.y - handlePoint.y) === 0)
        )
          return null;
        let pixelUnitX: Dynamic =
            areaRect.w / ((parsedAnchor.box.x1 - parsedAnchor.box.x0) * 100),
          pixelUnitY: Dynamic =
            areaRect.h / ((parsedAnchor.box.y1 - parsedAnchor.box.y0) * 100),
          deltaX: Dynamic =
            parsedAnchor.kind === "notearea"
              ? pointerCanvas.x - handlePoint.x
              : Math.round((pointerCanvas.x - handlePoint.x) / pixelUnitX) * pixelUnitX,
          deltaY: Dynamic =
            parsedAnchor.kind === "notearea"
              ? pointerCanvas.y - handlePoint.y
              : Math.round((pointerCanvas.y - handlePoint.y) / pixelUnitY) * pixelUnitY;
        resolvedTarget = await resolveAreaTarget(
          {
            x: areaRect.x + deltaX,
            y: areaRect.y + deltaY,
            w: areaRect.w,
            h: areaRect.h,
          },
          parsedAnchor.kind === "notearea"
            ? nearestCommentAreaCorner(areaRect, handlePoint)
            : parsedAnchor.box.corner,
          undefined,
          1500,
        );
        let note: Dynamic =
          parsedAnchor.kind === "notearea" ? findNoteByHash(parsedAnchor.idHash) : null;
        if (
          note &&
          resolvedTarget?.anchor.kind === "notearea" &&
          resolvedTarget.anchor.id === note.id
        ) {
          let movedBox: Dynamic = moveObjectCommentArea(
            note,
            hookOptions.annBox(note),
            parsedAnchor.box,
            handlePoint,
            pointerCanvas,
          );
          if (movedBox.x0 === parsedAnchor.box.x0 && movedBox.y0 === parsedAnchor.box.y0)
            return null;
          let movedArea: Dynamic = normalizeCommentArea(
            rotatedAnnotationBounds(
              note,
              objectCommentAreaRect(
                note,
                hookOptions.annBox(note),
                movedBox,
              ),
            ),
            rotatedAnnotationBounds(
              note,
              hookOptions.annBox(note),
            ),
          );
          resolvedTarget = {
            anchor: {
              kind: "notearea",
              id: note.id,
              box: movedBox,
            },
            label: commentObjectAreaShortLabel(note, movedArea),
            detail: commentObjectAreaDetail(note, movedBox),
          };
        }
        resolvedTarget &&
          resolvedTarget.anchor.kind !== "area" &&
          resolvedTarget.anchor.kind !== "boards" &&
          resolvedTarget.anchor.kind !== "notearea" &&
          (resolvedTarget = null);
      } else resolvedTarget = await resolveClickTarget(state.x, state.y, 1500);
      let serializedAnchor: Dynamic = resolvedTarget
        ? serializeDesignCommentAnchor(resolvedTarget.anchor)
        : null;
      if (!resolvedTarget || !serializedAnchor || controllerRef.current == null || !isCommentModeRef.current)
        return null;
      let isAreaTarget: Dynamic =
          resolvedTarget.anchor.kind === "area" ||
          resolvedTarget.anchor.kind === "boards" ||
          resolvedTarget.anchor.kind === "notearea",
        reparsedAnchor: Dynamic = parseDesignCommentAnchor(serializedAnchor),
        flag: Dynamic = false;
      if (
        reparsedAnchor &&
        (reparsedAnchor.kind === "el" || reparsedAnchor.kind === "area") &&
        reparsedAnchor.path != null
      ) {
        let file: Dynamic = findFileByHash(reparsedAnchor.fileHash);
        flag =
          file == null ||
          elementRects
            .get(file)
            ?.get(commentScopeKey(reparsedAnchor.path, reparsedAnchor.tid, reparsedAnchor.fp)) ===
            undefined;
      }
      let anchorPoint: Dynamic = reparsedAnchor && !flag ? resolveAnchorPoint(reparsedAnchor) : null,
        clientPoint: Dynamic = anchorPoint ? canvasToClient(anchorPoint) : null,
        placePosition: Dynamic = clientPoint
          ? {
              x: Math.round(clientPoint.x + (window as Dynamic).scrollX),
              y: Math.round(clientPoint.y + (window as Dynamic).scrollY),
            }
          : position;
      return {
        anchor: serializedAnchor,
        at: placePosition,
        label: resolvedTarget.label,
        ...(resolvedTarget.detail
          ? {
              detail: resolvedTarget.detail,
            }
          : {}),
        ...(isAreaTarget
          ? {
              area: true,
            }
          : {}),
      };
    },
    resolveThreadMoveRef: Dynamic = (0, react_mi.useRef)(resolveThreadMove);
  resolveThreadMoveRef.current = resolveThreadMove;
  let visibleArtboards: Dynamic =
      isCommentMode && hasController
        ? manifest.artboards.filter(
            (artboard?: Dynamic): Dynamic => isFileVisible(artboard.file),
          )
        : [],
    hasCanvasTarget: Dynamic =
      isCommentMode && hasController && visibleArtboards.length === 0 && fullscreenFile == null,
    targetKeys: Dynamic = hasCanvasTarget
      ? [canvasCommentScopeKey]
      : visibleArtboards.map((artboard?: Dynamic): Dynamic => artboard.file),
    targetKeysRef: Dynamic = (0, react_mi.useRef)(targetKeys);
  targetKeysRef.current = targetKeys;
  let targetElementsRef: Dynamic = (0, react_mi.useRef)(new Map()),
    targetRefCallbacksRef: Dynamic = (0, react_mi.useRef)(new Map()),
    getTargetRef: Dynamic = (key?: Dynamic): Dynamic => {
      let entry: Dynamic = targetRefCallbacksRef.current.get(key);
      entry ||
        ((entry = (element?: Dynamic): Dynamic => {
          element
            ? targetElementsRef.current.set(key, element)
            : (targetElementsRef.current.delete(key), targetRefCallbacksRef.current.delete(key));
        }),
        targetRefCallbacksRef.current.set(key, entry));
      return entry;
    },
    findFocusTarget: Dynamic = (): Dynamic => {
      let current: Dynamic = surfaceRef.current,
        entry: Dynamic = camera.get(),
        toolbarHeight: Dynamic = current
          ? toolbarOverlayHeight(current)
          : 0,
        viewWidth: Dynamic = (current?.clientWidth || 0) / entry.scale,
        viewHeight: Dynamic = (current?.clientHeight || 0) / entry.scale,
        isTargetInView: Dynamic = (key?: Dynamic): Dynamic => {
          let artboard: Dynamic =
            key === canvasCommentScopeKey ? null : findArtboardByFile(key);
          if (!artboard || !current) return true;
          let frame: Dynamic = getArtboardFrame(artboard);
          return (
            frame.x < entry.x + viewWidth &&
            frame.x + frame.w > entry.x &&
            frame.y < entry.y + viewHeight &&
            frame.y + frame.h > entry.y + toolbarHeight / entry.scale
          );
        },
        firstTarget: Dynamic = null;
      for (let key of targetKeysRef.current as Dynamic) {
        let targetElement: Dynamic = targetElementsRef.current.get(key);
        if (targetElement && ((firstTarget ??= targetElement), isTargetInView(key)))
          return targetElement;
      }
      return firstTarget;
    },
    [focusedTargetKey, setFocusedTargetKey]: Dynamic = (0, react_mi.useState)(null),
    lastComposeTargetRef: Dynamic = (0, react_mi.useRef)(null),
    restoreTargetFocus: Dynamic = (): Dynamic => {
      setTimeout((): Dynamic => {
        let current: Dynamic = lastComposeTargetRef.current,
          activeElement: Dynamic = (document as Dynamic).activeElement;
        current == null ||
          !isCommentModeRef.current ||
          !(document as Dynamic).hasFocus() ||
          ((activeElement === null ||
            activeElement === (document as Dynamic).body ||
            activeElement === (document as Dynamic).documentElement) &&
            targetElementsRef.current.get(current)?.focus({
              preventScroll: true,
            }));
      }, 0);
    };
  (0, react_mi.useEffect)((): Dynamic => {
    isComposing || restoreTargetFocus();
    isComposing || mdnSetHeldRect(null);
  }, [isComposing]);
  let [isRingVisible, setIsRingVisible]: Dynamic = (0, react_mi.useState)(false),
    [isMarkerVisible, setIsMarkerVisible]: Dynamic = (0, react_mi.useState)(false),
    focusVisualRef: Dynamic = (0, react_mi.useRef)({
      ring: false,
      marker: false,
    }),
    markerWantedRef: Dynamic = (0, react_mi.useRef)(false),
    pointerOriginRef: Dynamic = (0, react_mi.useRef)(null),
    setFocusVisuals: Dynamic = (
      showRing?: Dynamic,
      showMarker: Dynamic = showRing,
    ): Dynamic => {
      let current: Dynamic = focusVisualRef.current;
      showMarker && !current.marker && (pointerOriginRef.current = null);
      markerWantedRef.current = showMarker;
      current.ring !== showRing && setIsRingVisible((current.ring = showRing));
      current.marker !== showMarker && setIsMarkerVisible((current.marker = showMarker));
    },
    tabPressedRef: Dynamic = (0, react_mi.useRef)(false);
  (0, react_mi.useEffect)((): Dynamic => {
    if (!isCommentMode) {
      lastComposeTargetRef.current = null;
      setFocusVisuals(false);
      return;
    }
    let handlePointerMove: Dynamic = (event?: Dynamic): Dynamic => {
        if (!focusVisualRef.current.marker) return;
        let current: Dynamic = pointerOriginRef.current;
        current
          ? Math.abs(event.clientX - current.x) +
              Math.abs(event.clientY - current.y) >
              commentClickMovementThresholdPixels &&
            setFocusVisuals(focusVisualRef.current.ring, false)
          : (pointerOriginRef.current = {
              x: event.clientX,
              y: event.clientY,
            });
      },
      handlePointerDown: Dynamic = (event?: Dynamic): Dynamic => {
        isCommentTargetEvent(event) ||
          (setFocusVisuals(false), (lastComposeTargetRef.current = null));
      },
      handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
        event.key === "Tab" &&
          ((tabPressedRef.current = true),
          setTimeout((): Dynamic => (tabPressedRef.current = false), 0));
      };
    (document as Dynamic).addEventListener("pointermove", handlePointerMove, {
      capture: true,
      passive: true,
    });
    (document as Dynamic).addEventListener("pointerdown", handlePointerDown, {
      capture: true,
      passive: true,
    });
    (document as Dynamic).addEventListener("keydown", handleKeyDown, true);
    (window as Dynamic).addEventListener("focus", restoreTargetFocus);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("pointermove", handlePointerMove, {
        capture: true,
      });
      (document as Dynamic).removeEventListener("pointerdown", handlePointerDown, {
        capture: true,
      });
      (document as Dynamic).removeEventListener("keydown", handleKeyDown, true);
      (window as Dynamic).removeEventListener("focus", restoreTargetFocus);
    };
  }, [isCommentMode]);
  let hintId: Dynamic = (0, react_mi.useId)(),
    wasCommentModeReadyRef: Dynamic = (0, react_mi.useRef)(false);
  (0, react_mi.useEffect)((): Dynamic => {
    let justEntered: Dynamic = isCommentMode && hasController && !wasCommentModeReadyRef.current;
    wasCommentModeReadyRef.current = isCommentMode && hasController;
    if (!justEntered) return;
    let composedRecently: Dynamic =
      performance.now() - lastComposeAtRef.current < commentRevealTimeoutMs;
    lastComposeAtRef.current = Number.NEGATIVE_INFINITY;
    if (composedRecently || !(document as Dynamic).hasFocus()) return;
    let activeElement: Dynamic = (document as Dynamic).activeElement,
      isBodyFocused: Dynamic =
        activeElement === null ||
        activeElement === (document as Dynamic).body ||
        activeElement === (document as Dynamic).documentElement,
      isArtboardIframeFocused: Dynamic =
        activeElement?.tagName === "IFRAME" &&
        !!activeElement.closest("[data-mega-artboard]") &&
        !!surfaceRef.current?.contains(activeElement);
    isArtboardIframeFocused && activeElement.blur();
    (isBodyFocused || isArtboardIframeFocused) &&
      (findFocusTarget()?.focus({
        preventScroll: true,
      }),
      typeof matchMedia == "function" &&
        matchMedia("(hover: none)").matches &&
        (setFocusVisuals(false), (markerWantedRef.current = true)));
  }, [isCommentMode, hasController]);
  (0, react_mi.useLayoutEffect)((): Dynamic => {
    if (focusedTargetKey == null || targetElementsRef.current.has(focusedTargetKey)) return;
    setFocusedTargetKey(null);
    let activeElement: Dynamic = (document as Dynamic).activeElement;
    !(document as Dynamic).hasFocus() ||
      !(
        activeElement === null ||
        activeElement === (document as Dynamic).body ||
        activeElement === (document as Dynamic).documentElement
      ) ||
      (isCommentMode
        ? findFocusTarget()?.focus({
            preventScroll: true,
          })
        : surfaceRef.current
            ?.querySelector(
              '[data-mega-artboard="' +
                CSS.escape(focusedTargetKey) +
                '"] [data-mega-title-text]',
            )
            ?.focus({
              preventScroll: true,
            }));
  });
  let panToRect: Dynamic = (
      rect?: Dynamic,
      instant: Dynamic = false,
    ): Dynamic => {
      let current: Dynamic = surfaceRef.current;
      if (!current || value.current.fullscreenFile != null) return;
      let computeCamera: Dynamic = (viewCamera?: Dynamic): Dynamic => {
        let state: Dynamic = {
            w: current.clientWidth || 1,
            h: current.clientHeight || 1,
            top: toolbarOverlayHeight(current),
          },
          fitsView: Dynamic =
            rect.w <= state.w / viewCamera.scale &&
            rect.h <= (state.h - state.top) / viewCamera.scale;
        return isArtboardInViewport(
          viewCamera,
          fitsView
            ? rect
            : {
                x: rect.x + rect.w / 2,
                y: rect.y,
                w: rect.w / 2,
                h: rect.h / 2,
              },
          state,
        );
      };
      instant ? camera.set(computeCamera, true) : camera.glide(computeCamera);
    },
    defaultTargetFor: Dynamic = (key?: Dynamic): Dynamic => {
      let current: Dynamic = surfaceRef.current;
      if (!current) return null;
      let entry: Dynamic = camera.get();
      if (key === canvasCommentScopeKey) {
        let toolbarHeight: Dynamic = toolbarOverlayHeight(current),
          centerX: Dynamic =
            entry.x + (current.clientWidth || 1) / 2 / entry.scale,
          centerY: Dynamic =
            entry.y +
            (toolbarHeight + ((current.clientHeight || 1) - toolbarHeight) / 2) /
              entry.scale;
        return {
          anchor: {
            kind: "canvas",
            page: pageKey,
            x: centerX,
            y: centerY,
          },
          label: commentAnchorShortLabel({
            kind: "canvas",
            pages: manifest.pages,
            pageKey: pageKey,
          }),
          detail: commentCanvasPointDetail(centerX, centerY),
          p: {
            x: centerX,
            y: centerY,
          },
        };
      }
      let artboard: Dynamic = findArtboardByFile(key);
      if (!artboard) return null;
      let frame: Dynamic = getArtboardFrame(artboard),
        { fx: fx, fy: fy }: Dynamic = defaultArtboardCommentPoint(frame, entry.scale);
      return {
        anchor: {
          kind: "artboard",
          file: artboard.file,
          fx: fx,
          fy: fy,
        },
        label: commentAnchorShortLabel({
          kind: "artboard",
          board: artboard,
        }),
        detail: commentArtboardElementDetail(artboard),
        p: {
          x: frame.x + fx * frame.w,
          y: frame.y + fy * frame.h,
        },
      };
    },
    composeAtTarget: Dynamic = (key?: Dynamic): Dynamic => {
      operationTokenRef.current.cancel();
      let current: Dynamic = controllerRef.current,
        layerElement: Dynamic = surfaceRef.current;
      if (!current || !isCommentMode || !layerElement) return;
      let target: Dynamic = defaultTargetFor(key),
        serializedAnchor: Dynamic = target
          ? serializeDesignCommentAnchor(target.anchor)
          : null;
      if (!target || !serializedAnchor) return;
      let bounds: Dynamic = layerElement.getBoundingClientRect(),
        entry: Dynamic = camera.get(),
        toolbarHeight: Dynamic = toolbarOverlayHeight(layerElement),
        clampBetween: Dynamic = (
          candidate?: Dynamic,
          min?: Dynamic,
          max?: Dynamic,
        ): Dynamic =>
          Math.max(min, Math.min(Math.max(min, max), candidate)),
        state: Dynamic = {
          x: Math.round(
            clampBetween(
              bounds.left + (target.p.x - entry.x) * entry.scale,
              bounds.left + commentPointerMovementThreshold,
              bounds.right - commentPointerMovementThreshold,
            ) + (window as Dynamic).scrollX,
          ),
          y: Math.round(
            clampBetween(
              bounds.top + (target.p.y - entry.y) * entry.scale,
              bounds.top + toolbarHeight + commentPointerMovementThreshold,
              bounds.bottom - commentPointerMovementThreshold,
            ) + (window as Dynamic).scrollY,
          ),
        };
      lastComposeTargetRef.current = key;
      current
        .compose(serializedAnchor, state, {
          label: target.label,
          detail: target.detail,
        })
        .then(
          (result?: Dynamic): Dynamic => {
            result.opened && pendingArea.clear();
          },
          (): Dynamic => {},
        );
    },
    activateTarget: Dynamic = (key?: Dynamic, fromKeyboard?: Dynamic): Dynamic => {
      let current: Dynamic = markerWantedRef.current;
      setFocusVisuals(true);
      if (fromKeyboard && !current) return;
      let artboard: Dynamic =
        key === canvasCommentScopeKey ? null : findArtboardByFile(key);
      artboard &&
        panToRect(
          {
            x: artboard.x,
            y: artboard.y,
            w: artboard.w,
            h: artboard.h,
          },
          true,
        );
      composeAtTarget(key);
    },
    getTargetHandlers: Dynamic = (key?: Dynamic): Dynamic => {
      let activation: Dynamic = buttonKeyboardActivation(
        (): Dynamic => activateTarget(key, true),
      );
      return {
        onKeyDown(event: Dynamic): Dynamic {
          event.key !== "Enter" && event.key !== " " && setFocusVisuals(true);
          activation.onKeyDown(event);
        },
        onKeyUp: activation.onKeyUp,
        onClick(event: Dynamic): Dynamic {
          event.target === event.currentTarget &&
            (event.currentTarget.focus({
              preventScroll: true,
            }),
            activateTarget(key, false));
        },
        onFocus(event: Dynamic): Dynamic {
          lastComposeTargetRef.current = null;
          setFocusedTargetKey(key);
          pointerOriginRef.current = null;
          setFocusVisuals(true);
          let artboard: Dynamic =
            key === canvasCommentScopeKey ? null : findArtboardByFile(key);
          artboard &&
            event.relatedTarget != null &&
            panToRect({
              x: artboard.x,
              y: artboard.y,
              w: artboard.w,
              h: artboard.h,
            });
        },
        onBlur(event: Dynamic): Dynamic {
          activation.onBlur(event);
          setFocusedTargetKey(
            (previous?: Dynamic): Dynamic => (previous === key ? null : previous),
          );
          let relatedTarget: Dynamic = event.relatedTarget;
          tabPressedRef.current &&
            relatedTarget &&
            !layerRef.current?.contains(relatedTarget) &&
            announce(
              (): Dynamic =>
                isCommentModeRef.current
                  ? commentModePausedMessage
                  : null,
            );
        },
      };
    },
    wheelAccumulatorRef: Dynamic = (0, react_mi.useRef)({
      dx: 0,
      dy: 0,
      raf: null,
    }),
    handleWheel: Dynamic = (event?: Dynamic): Dynamic => {
      if (fullscreenFile == null) return;
      let deltaScale: Dynamic =
          event.deltaMode === 1
            ? 16
            : event.deltaMode === 2
              ? (window as Dynamic).innerHeight
              : 1,
        current: Dynamic = wheelAccumulatorRef.current;
      current.dx += event.deltaX * deltaScale;
      current.dy += event.deltaY * deltaScale;
      current.raf == null &&
        (current.raf = requestAnimationFrame((): Dynamic => {
          let { dx: deltaX, dy: deltaY }: Dynamic = current;
          wheelAccumulatorRef.current = {
            dx: 0,
            dy: 0,
            raf: null,
          };
          let latestFullscreenFile: Dynamic = value.current.fullscreenFile,
            handle: Dynamic =
              latestFullscreenFile == null
                ? undefined
                : handlesRef.current.get(latestFullscreenFile);
          createPreviewHandle(
            handle?.previewFrameRef.current ?? null,
          )?.executeJavaScriptUnchecked(
            "scrollBy(" +
              JSON.stringify(deltaX) +
              "," +
              JSON.stringify(deltaY) +
              ")",
          );
          let lastPointer: Dynamic = lastPointerRef.current;
          lastPointer && updateHoverAtRef.current(lastPointer.x, lastPointer.y);
        }));
    },
    activeThreadAreaRect: Dynamic = ((): Dynamic => {
      let activeThread: Dynamic = threads.find(
          (thread?: Dynamic): Dynamic => thread.active,
        ),
        parsedAnchor: Dynamic = activeThread
          ? parseDesignCommentAnchor(activeThread.anchor)
          : null,
        note: Dynamic =
          parsedAnchor?.kind === "notearea" && fullscreenFile == null
            ? findNoteByHash(parsedAnchor.idHash)
            : null;
      return parsedAnchor?.kind === "notearea"
        ? note
          ? objectCommentAreaRect(
              note,
              hookOptions.annBox(note),
              parsedAnchor.box,
            )
          : null
        : parsedAnchor && (parsedAnchor.kind === "area" || parsedAnchor.kind === "boards")
          ? (resolveAreaRect(parsedAnchor) ?? null)
          : null;
    })();
  if (!isCommentMode) return null;
  let layerWidth: Dynamic =
      surfaceRef.current?.clientWidth || (window as Dynamic).innerWidth,
    layerHeight: Dynamic =
      surfaceRef.current?.clientHeight || (window as Dynamic).innerHeight,
    focusRing: Dynamic = ((): Dynamic => {
      if (focusedTargetKey == null || !isRingVisible) return null;
      if (focusedTargetKey === canvasCommentScopeKey) {
        if (!hasCanvasTarget) return null;
        let canvasTarget: Dynamic = defaultTargetFor(canvasCommentScopeKey);
        return canvasTarget
          ? {
              inset: commentPointerStrokeInset,
              px: (canvasTarget.p.x - viewport.x) * viewport.scale,
              py: (canvasTarget.p.y - viewport.y) * viewport.scale,
            }
          : null;
      }
      let artboard: Dynamic = findArtboardByFile(focusedTargetKey);
      if (!artboard || !isFileVisible(artboard.file)) return null;
      let frame: Dynamic = getArtboardFrame(artboard),
        { fx: fx, fy: fy }: Dynamic = defaultArtboardCommentPoint(frame, viewport.scale);
      return {
        x: (frame.x - viewport.x) * viewport.scale,
        y: (frame.y - viewport.y) * viewport.scale,
        w: frame.w * viewport.scale,
        h: frame.h * viewport.scale,
        px: (frame.x + fx * frame.w - viewport.x) * viewport.scale,
        py: (frame.y + fy * frame.h - viewport.y) * viewport.scale,
      };
    })(),
    areaOutline: Dynamic = commentAreaOutline({
      marquee: marqueeState,
      activeThreadAreaRect,
      drawnAreaRect,
      viewport,
    });
  let mdnTargetRect: Dynamic =
    hoverRect ?? (isComposing && !drawnAreaRect ? mdnHeldRect : null);
  // MineDesign：评论卡片的目标点与编号圆点同一位置，换成本图层的屏幕坐标；只给可视区域内的
  let mdnCardTop: Dynamic = surfaceRef.current
      ? toolbarOverlayHeight(surfaceRef.current)
      : 0,
    mdnCardTargets: Dynamic = commentCardTargets({
      threads,
      resolveAnchorPoint,
      viewport,
      layerWidth,
      layerHeight,
      cardTop: mdnCardTop,
    });
  return (
    <div
      ref={layerRef}
      data-mega-chrome={"comments"}
      data-testid={"mega-comment-layer"}
      className={"absolute inset-0 z-[48]"}
      style={{
        cursor: commentPointerCursor,
      }}
      onPointerDown={(event?: Dynamic): Dynamic => {
        event.button !== 0 ||
          isCommentTargetEvent(event.nativeEvent) ||
          startAreaDrag(event) ||
          watchPointerRelease(
            event.nativeEvent,
            (releaseEvent?: Dynamic): Dynamic => composeAtPointerRef.current(releaseEvent),
          );
      }}
      onPointerMove={(event?: Dynamic): Dynamic => {
        // MineDesign：指针在评论卡片上时不高亮卡片下面的对象
        if (!isCommentCardEvent(event.nativeEvent)) return handleLayerPointerMove(event);
        lastPointerRef.current = null;
        updateHoverRect(null);
      }}
      onPointerLeave={(): Dynamic => {
        hoverGenerationRef.current += 1;
        hoverProbeRef.current.next = null;
        lastPointerRef.current = null;
        updateHoverRect(null);
      }}
      onWheel={handleWheel}
    >
      {areaOutline?.deg ? (<div
          className={"pointer-events-none absolute h-0 w-0"}
          style={{
            left: areaOutline.x + areaOutline.w / 2,
            top: areaOutline.y + areaOutline.h / 2,
            transform: "rotate(" + String(areaOutline.deg) + "deg)",
          }}
        >
          <CommentAreaOutline
            rect={{
              left: -areaOutline.w / 2,
              top: -areaOutline.h / 2,
              width: areaOutline.w,
              height: areaOutline.h,
            }}
            kind={"thread"}
          />
        </div>) : (areaOutline && (<CommentAreaOutline
            rect={{
              left: areaOutline.x,
              top: areaOutline.y,
              width: areaOutline.w,
              height: areaOutline.h,
            }}
            origin={
              areaOutline.ox != null && areaOutline.oy != null
                ? {
                    x: areaOutline.ox,
                    y: areaOutline.oy,
                  }
                : null
            }
            handle={!!drawnAreaRect && !marqueeState && !activeThreadAreaRect}
            onHandlePointerDown={(event?: Dynamic): Dynamic => {
              !drawnAreaRect ||
                event.button !== 0 ||
                event.pointerType !== "mouse" ||
                (event.stopPropagation(),
                startAreaDrag(event, {
                  x:
                    drawnAreaRect.ox <= drawnAreaRect.x + drawnAreaRect.w / 2
                      ? drawnAreaRect.x + drawnAreaRect.w
                      : drawnAreaRect.x,
                  y:
                    drawnAreaRect.oy <= drawnAreaRect.y + drawnAreaRect.h / 2
                      ? drawnAreaRect.y + drawnAreaRect.h
                      : drawnAreaRect.y,
                }));
            }}
            kind={marqueeState ? "marquee" : activeThreadAreaRect ? "thread" : "drawn"}
          />))}
      {mdnTargetRect && !marqueeState && (<div
          aria-hidden={true}
          className={
            "pointer-events-none absolute rounded border-2 border-editor-comment-target"
          }
          style={{
            // MineDesign：与 Codex 原生评论一致，蓝色描边之外再盖一层浅蓝，突出正指着的对象
            background: "var(--cds-bg-editor-comment-target, transparent)",
            left: (mdnTargetRect.x - viewport.x) * viewport.scale,
            top: (mdnTargetRect.y - viewport.y) * viewport.scale,
            width: mdnTargetRect.w * viewport.scale,
            height: mdnTargetRect.h * viewport.scale,
          }}
        />)}
      {visibleArtboards.map((artboard?: Dynamic): Dynamic => {
        let frame: Dynamic = getArtboardFrame(artboard),
          clampedFrame: Dynamic = clampCommentAreaToViewport(
            {
              x: (frame.x - viewport.x) * viewport.scale,
              y: (frame.y - viewport.y) * viewport.scale,
              w: frame.w * viewport.scale,
              h: frame.h * viewport.scale,
            },
            layerWidth,
            layerHeight,
          );
        return (() => {
          const _Component = "div";
          const _props = {
            ref: getTargetRef(artboard.file),
            role: "button",
            tabIndex: 0,
            "data-mega-comment-target": artboard.file,
            "data-testid": "mega-comment-target-" + artboard.file,
            "aria-label": commentSurfaceAriaLabel({
              kind: "artboard",
              board: artboard,
            }),
            "aria-describedby": hintId,
            className: "pointer-events-none absolute outline-none",
            style: {
              left: clampedFrame.x,
              top: clampedFrame.y,
              width: clampedFrame.w,
              height: clampedFrame.h,
            },
            ...getTargetHandlers(artboard.file),
          } as const;
          const _key = artboard.file;
          return <_Component key={_key} {..._props} />;
        })();
      })}
      {hasCanvasTarget && (<div
          ref={getTargetRef(canvasCommentScopeKey)}
          role={"button"}
          tabIndex={0}
          data-mega-comment-target={""}
          data-testid={"mega-comment-target-canvas"}
          aria-label={commentSurfaceAriaLabel({
            kind: "canvas",
            pages: manifest.pages,
            pageKey: pageKey,
          })}
          aria-describedby={hintId}
          className={"pointer-events-none absolute inset-0 outline-none"}
          {...getTargetHandlers(canvasCommentScopeKey)}
        />)}
      {targetKeys.length > 0 && (<span id={hintId} hidden={true}>
          {commentTargetKeyboardHint({
            several: targetKeys.length > 1,
            canvas: hasCanvasTarget,
          })}
        </span>)}
      {focusRing && (<jsx_mg.Fragment>
          <div
            aria-hidden={true}
            data-testid={"mega-comment-focus-ring"}
            className={
              "pointer-events-none absolute rounded border-2 border-editor-comment-target"
            }
            style={{
              ...("inset" in focusRing
                ? {
                    top: focusRing.inset,
                    right: focusRing.inset,
                    bottom: focusRing.inset,
                    left: focusRing.inset,
                  }
                : {
                    left: focusRing.x,
                    top: focusRing.y,
                    width: focusRing.w,
                    height: focusRing.h,
                  }),
              boxShadow: `0 0 0 ${commentPointerStrokeInset}px #fff`,
              background: "var(--cds-bg-editor-comment-target, transparent)",
            }}
          />
          {isMarkerVisible && (<CommentPointer
              data-testid={"mega-comment-focus-pin"}
              at={{
                x: focusRing.px,
                y: focusRing.py,
              }}
            />)}
        </jsx_mg.Fragment>)}
      <CommentCardLayer
        targets={mdnCardTargets}
        bounds={{
          left: 8,
          top: mdnCardTop + 8,
          right: layerWidth - 8,
          // 底部留出画布工具栏（距底 16px、高 44px）
          bottom: layerHeight - 68,
        }}
        scale={viewport.scale}
        suppressed={fullscreenFile != null || !!hookOptions.mdnHideCommentCards}
      />
    </div>
  );
}
export {
  canvasCommentScopeKey,
  commentClickMovementThresholdPixels,
  commentPointerMovementThreshold,
  commentPointerStrokeInset,
  commentRevealTimeoutMs,
  jsx_mg,
  maxCommentAreaElementLabels,
  useCanvasComments,
};
export function installCommentsCanvasController(): () => void {
  return () => {
    jsx_mg = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    commentRevealTimeoutMs = 1500;
    canvasCommentScopeKey = "\0canvas";
    commentPointerStrokeInset = 2;
    commentPointerMovementThreshold = 8;
    commentClickMovementThresholdPixels = 4;
    maxCommentAreaElementLabels = 8;
  };
}
