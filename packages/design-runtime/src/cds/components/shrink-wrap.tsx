/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeDomRefComposition, useMergedRefs } from "../dom/ref-composition";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var MaxWidthValue: Dynamic;
var ComponentsShrinkWrapElementCache: Dynamic;
var appliedWidthByElement: Dynamic;
var ComponentsShrinkWrapLimit: Dynamic;
var ShrinkwrapAttribute: Dynamic;
var ancestorDepthLimit: Dynamic;
var ComponentsShrinkWrapSubscribers: Dynamic;
var shrinkWrapQueueByView: Dynamic;
var shrinkWrapResizeObserverByView: Dynamic;
var initializeComponentsShrinkWrap: Dynamic;
var reactComponentsShrinkWrap: Dynamic;
var jsxComponentsShrinkWrap: Dynamic;
var ShrinkWrap: Dynamic;
var initializeShrinkWrapComponent: Dynamic;
function applyShrinkWrapWidth(element?: Dynamic, width?: Dynamic): Dynamic {
  element.style[MaxWidthValue] = width;
  appliedWidthByElement.set(element, width);
}
function rememberOriginalWidth(element?: Dynamic): Dynamic {
  let inlineMaxWidth: Dynamic = element.style[MaxWidthValue];
  (!ComponentsShrinkWrapElementCache.has(element) ||
    inlineMaxWidth !== appliedWidthByElement.get(element)) &&
    ComponentsShrinkWrapElementCache.set(element, inlineMaxWidth);
}
function measureInlineContent(element?: Dynamic): Dynamic {
  let ownerDocument: Dynamic = element.ownerDocument,
    defaultView: Dynamic = ownerDocument.defaultView,
    rects: Dynamic = [],
    clippedOverflow: Dynamic = 0,
    minLeft: Dynamic = Number.POSITIVE_INFINITY,
    maxRight: Dynamic = Number.NEGATIVE_INFINITY,
    expandBounds: Dynamic = (rect?: Dynamic): Dynamic => {
      rect.left < minLeft && (minLeft = rect.left);
      rect.right > maxRight && (maxRight = rect.right);
    },
    isInsideFillElement: Dynamic = (node?: Dynamic): Dynamic => {
      for (
        let ancestor: Dynamic =
          node.nodeType === 1 ? node : node.parentElement;
        ancestor && ancestor !== element;
        ancestor = ancestor.parentElement
      )
        if (ancestor.getAttribute("data-shrinkwrap") === "fill") return true;
      return false;
    },
    textRange: Dynamic = ownerDocument.createRange(),
    treeWalker: Dynamic = ownerDocument.createTreeWalker(element, 5, {
      acceptNode: (node?: Dynamic): Dynamic => {
        if (node.nodeType === 1) {
          let nodeStyle: Dynamic = defaultView?.getComputedStyle(node);
          return nodeStyle &&
            (nodeStyle.display === "none" ||
              nodeStyle.position === "absolute" ||
              nodeStyle.position === "fixed")
            ? 2
            : 1;
        }
        return isInsideFillElement(node) ? 2 : 1;
      },
    }),
    currentNode: Dynamic = treeWalker.nextNode();
  for (; currentNode; ) {
    if (currentNode.nodeType === 3) {
      textRange.selectNodeContents(currentNode);
      for (let textRect of (textRange.getClientRects?.() ?? []) as Dynamic)
        textRect.width > 0 && (rects.push(textRect), expandBounds(textRect));
    } else {
      let currentElement: Dynamic = currentNode,
        elementStyle: Dynamic = defaultView?.getComputedStyle(currentElement),
        bounds: Dynamic = currentElement.getBoundingClientRect();
      bounds.width > 0 && expandBounds(bounds);
      if (elementStyle && !isInsideFillElement(currentElement) && isInlineBox(currentElement, elementStyle))
        for (let boxRect of currentElement.getClientRects() as Dynamic)
          boxRect.width > 0 && rects.push(boxRect);
      elementStyle &&
        (elementStyle.overflowX !== "visible" || elementStyle.overflowY !== "visible") &&
        (clippedOverflow +=
          Math.max(0, currentElement.scrollWidth - currentElement.clientWidth) +
          Math.max(0, currentElement.scrollHeight - currentElement.clientHeight));
    }
    currentNode = treeWalker.nextNode();
  }
  return {
    rects: rects,
    clipped: clippedOverflow,
    boundLeft: minLeft,
    boundRight: maxRight,
  };
}
function isInlineBox(element?: Dynamic, computedStyle?: Dynamic): Dynamic {
  return ComponentsShrinkWrapSubscribers.has(element.tagName.toUpperCase())
    ? true
    : computedStyle.display.startsWith("inline");
}
function measureShrinkWrapCandidate(
  element: Dynamic,
  {
    rects: rects,
    clipped: clipped,
    boundLeft: boundLeft,
    boundRight: boundRight,
  }: Dynamic,
): Dynamic {
  let computedStyle: Dynamic =
      element.ownerDocument.defaultView?.getComputedStyle(element),
    bounds: Dynamic = element.getBoundingClientRect(),
    spill: Dynamic = 0;
  if (computedStyle && Number.isFinite(boundLeft)) {
    let contentWidth: Dynamic = parseFloat(computedStyle.width),
      borderBoxWidth: Dynamic =
        computedStyle.boxSizing === "border-box"
          ? contentWidth
          : contentWidth +
            parseFloat(computedStyle.paddingLeft) +
            parseFloat(computedStyle.paddingRight) +
            parseFloat(computedStyle.borderLeftWidth) +
            parseFloat(computedStyle.borderRightWidth),
      layoutScale: Dynamic = (borderBoxWidth > 0 && bounds.width / borderBoxWidth) || 1,
      contentLeft: Dynamic =
        bounds.left +
        (parseFloat(computedStyle.borderLeftWidth) + parseFloat(computedStyle.paddingLeft)) *
          layoutScale,
      contentRight: Dynamic =
        bounds.right -
        (parseFloat(computedStyle.borderRightWidth) +
          parseFloat(computedStyle.paddingRight)) *
          layoutScale;
    spill =
      Math.max(0, boundRight - contentRight) + Math.max(0, contentLeft - boundLeft);
  }
  return {
    height: element.scrollHeight,
    overflow: element.scrollWidth,
    client: element.clientWidth,
    spill: spill,
    clipped: clipped,
    widths: rects.map((rect?: Dynamic): Dynamic => rect.width),
  };
}
function preservesContentLayout(natural?: Dynamic, candidate?: Dynamic): Dynamic {
  return candidate.height > natural.height ||
    candidate.overflow > candidate.client + 0.5 ||
    candidate.spill > natural.spill + 0.5 ||
    candidate.clipped > natural.clipped + 0.5
    ? false
    : natural.widths.length === candidate.widths.length &&
        natural.widths.every(
          (naturalWidth?: Dynamic, widthIndex?: Dynamic): Dynamic =>
            Math.abs(naturalWidth - (candidate.widths[widthIndex] ?? NaN)) <= 0.5,
        );
}
function restoreShrinkWrapWidth(element?: Dynamic): Dynamic {
  ComponentsShrinkWrapElementCache.has(element) &&
    (rememberOriginalWidth(element),
    applyShrinkWrapWidth(
      element,
      ComponentsShrinkWrapElementCache.get(element) ?? "",
    ));
}
function createShrinkWrapJob(element?: Dynamic, onDone?: Dynamic): Dynamic {
  return {
    el: element,
    done: onDone,
    boxWidth: 0,
    borderBoxSizing: true,
    natural: null,
    candidate: 0,
    stage: "read",
    lo: 0,
    hi: 0,
    probes: 0,
    resizeDue: false,
  };
}
function settleShrinkWrapJob(job?: Dynamic, width?: Dynamic): Dynamic {
  width === null
    ? restoreShrinkWrapWidth(job.el)
    : applyShrinkWrapWidth(job.el, `${width}px`);
  job.stage = "settled";
  job.done(width);
}
function measureShrinkWrapJob(job?: Dynamic): Dynamic {
  let { el: element }: Dynamic = job,
    defaultView: Dynamic = element.ownerDocument.defaultView;
  if (!defaultView || typeof element.getBoundingClientRect != "function") {
    settleShrinkWrapJob(job, null);
    return;
  }
  let style: Dynamic = defaultView.getComputedStyle(element),
    computedWidth: Dynamic = parseFloat(style.width);
  if (!Number.isFinite(computedWidth) || computedWidth <= 0) {
    settleShrinkWrapJob(job, null);
    return;
  }
  let isBorderBox: Dynamic = style.boxSizing === "border-box",
    paddingAndBorder: Dynamic =
      parseFloat(style.paddingLeft) +
      parseFloat(style.paddingRight) +
      parseFloat(style.borderLeftWidth) +
      parseFloat(style.borderRightWidth),
    measurement: Dynamic = measureInlineContent(element),
    { rects: rects }: Dynamic = measurement;
  if (rects.length === 0) {
    settleShrinkWrapJob(job, null);
    return;
  }
  job.natural = measureShrinkWrapCandidate(element, measurement);
  job.boxWidth = computedWidth;
  job.borderBoxSizing = isBorderBox;
  let minLeft: Dynamic = Number.POSITIVE_INFINITY,
    maxRight: Dynamic = Number.NEGATIVE_INFINITY;
  for (let rect of rects as Dynamic) {
    rect.left < minLeft && (minLeft = rect.left);
    rect.right > maxRight && (maxRight = rect.right);
  }
  let borderBoxWidth: Dynamic = isBorderBox ? computedWidth : computedWidth + paddingAndBorder,
    layoutScale: Dynamic = element.getBoundingClientRect().width / borderBoxWidth || 1,
    contentWidth: Dynamic = (maxRight - minLeft) / layoutScale,
    candidateWidth: Dynamic = isBorderBox ? contentWidth + paddingAndBorder : contentWidth,
    roundedWidth: Dynamic = Math.ceil(candidateWidth - 0.001);
  if (roundedWidth >= computedWidth - 0.5) {
    settleShrinkWrapJob(job, null);
    return;
  }
  job.candidate = roundedWidth;
  job.stage = "verify";
}
function verifyShrinkWrapJob(job?: Dynamic): Dynamic {
  return (
    job.natural !== null &&
    preservesContentLayout(
      job.natural,
      measureShrinkWrapCandidate(job.el, measureInlineContent(job.el)),
    )
  );
}
function nextShrinkWrapCandidate(
  job?: Dynamic,
  preserved?: Dynamic,
): Dynamic {
  let { boxWidth: boxWidth }: Dynamic = job;
  if (job.stage === "verify") {
    if (preserved) {
      settleShrinkWrapJob(job, job.candidate);
      return null;
    }
    job.stage = "nudge1";
    if (job.candidate + 1 < boxWidth) return job.candidate + 1;
    job.stage = "bisect";
  } else if (job.stage === "nudge1") {
    if (preserved) {
      settleShrinkWrapJob(job, job.candidate + 1);
      return null;
    }
    job.stage = "nudge2";
    if (job.candidate + 2 < boxWidth) return job.candidate + 2;
    job.stage = "bisect";
  } else if (job.stage === "nudge2") {
    if (preserved) {
      settleShrinkWrapJob(job, job.candidate + 2);
      return null;
    }
    job.stage = "bisect";
  } else if (job.stage === "bisect") {
    job.probes += 1;
    let midpoint: Dynamic =
      job.lo > 0 ? Math.floor((job.lo + job.hi) / 2) : NaN;
    preserved ? (job.hi = midpoint) : (job.lo = midpoint);
  }
  return job.stage === "bisect"
    ? (job.lo === 0 &&
        ((job.lo = job.candidate + 2), (job.hi = Math.ceil(boxWidth))),
      job.probes >= ComponentsShrinkWrapLimit || job.hi - job.lo <= 1
        ? (job.hi < boxWidth - 0.5
            ? settleShrinkWrapJob(job, job.hi)
            : settleShrinkWrapJob(job, null),
          null)
        : Math.floor((job.lo + job.hi) / 2))
    : null;
}
function runShrinkWrapBatch(jobs?: Dynamic): Dynamic {
  for (let job of jobs as Dynamic) {
    rememberOriginalWidth(job.el);
    restoreShrinkWrapWidth(job.el);
  }
  for (let job of jobs as Dynamic) measureShrinkWrapJob(job);
  let verifying: Dynamic = jobs.filter(
    (job?: Dynamic): Dynamic => job.stage === "verify",
  );
  for (let job of verifying as Dynamic)
    applyShrinkWrapWidth(job.el, `${job.candidate}px`);
  for (let index: Dynamic = 0; verifying.length > 0 && index < 16; index++) {
    let verifications: Dynamic = verifying.map(
        (job?: Dynamic): Dynamic => [job, verifyShrinkWrapJob(job)],
      ),
      nextWidths: Dynamic = [];
    for (let [job, preserved] of verifications as Dynamic) {
      let nextWidth: Dynamic = nextShrinkWrapCandidate(job, preserved);
      nextWidth !== null && nextWidths.push([job, nextWidth]);
    }
    for (let [job, width] of nextWidths as Dynamic)
      applyShrinkWrapWidth(job.el, `${width}px`);
    verifying = nextWidths.map(([job]: Dynamic): Dynamic => job);
  }
  for (let job of verifying as Dynamic)
    job.stage !== "settled" && settleShrinkWrapJob(job, null);
}
function shrinkWrapElement(element?: Dynamic): Dynamic {
  let measuredWidth: Dynamic = null;
  runShrinkWrapBatch([
    createShrinkWrapJob(element, (width?: Dynamic): Dynamic => {
      measuredWidth = width;
    }),
  ]);
  return measuredWidth;
}
function getShrinkWrapQueue(view?: Dynamic): Dynamic {
  let entry: Dynamic = shrinkWrapQueueByView.get(view);
  entry ||
    ((entry = {
      queue: new Map(),
      microtaskQueued: false,
      frameQueued: 0,
    }),
    shrinkWrapQueueByView.set(view, entry));
  return entry;
}
function flushShrinkWrapJobs(
  view?: Dynamic,
  queueEntry?: Dynamic,
  jobs?: Dynamic,
): Dynamic {
  jobs.length > 0 && runShrinkWrapBatch(jobs);
  !(queueEntry.queue.size > 0) &&
    (queueEntry.frameQueued &&
      (view.cancelAnimationFrame(queueEntry.frameQueued),
      (queueEntry.frameQueued = 0)),
    queueEntry.microtaskQueued ||
      shrinkWrapQueueByView.delete(view));
}
function flushShrinkWrapMicrotask(view?: Dynamic): Dynamic {
  let entry: Dynamic = shrinkWrapQueueByView.get(view);
  if (!entry) return;
  entry.microtaskQueued = false;
  entry.frameQueued &&
    (view.cancelAnimationFrame(entry.frameQueued), (entry.frameQueued = 0));
  let jobs: Dynamic = [...entry.queue.values()];
  entry.queue.clear();
  flushShrinkWrapJobs(view, entry, jobs);
}
function flushShrinkWrapResizeJobs(view?: Dynamic): Dynamic {
  let entry: Dynamic = shrinkWrapQueueByView.get(view);
  if (!entry) return;
  let jobs: Dynamic = [];
  for (let [element, job] of entry.queue as Dynamic)
    job.resizeDue && (entry.queue.delete(element), jobs.push(job));
  flushShrinkWrapJobs(view, entry, jobs);
}
function scheduleShrinkWrapJob(
  element?: Dynamic,
  onDone?: Dynamic,
  reason?: Dynamic,
): Dynamic {
  let defaultView: Dynamic = element.ownerDocument.defaultView;
  if (!defaultView) {
    onDone(shrinkWrapElement(element));
    return;
  }
  let viewQueue: Dynamic = getShrinkWrapQueue(defaultView),
    entry: Dynamic = viewQueue.queue.get(element);
  entry
    ? (entry.done = onDone)
    : ((entry = createShrinkWrapJob(element, onDone)),
      viewQueue.queue.set(element, entry));
  reason === "microtask"
    ? viewQueue.microtaskQueued ||
      ((viewQueue.microtaskQueued = true),
      queueMicrotask((): Dynamic => {
        flushShrinkWrapMicrotask(defaultView);
      }))
    : reason === "resize"
      ? (entry.resizeDue = true)
      : !viewQueue.frameQueued &&
        !viewQueue.microtaskQueued &&
        (viewQueue.frameQueued = defaultView.requestAnimationFrame(
          (): Dynamic => {
            flushShrinkWrapMicrotask(defaultView);
          },
        ));
}
function cancelShrinkWrapJob(element?: Dynamic): Dynamic {
  let defaultView: Dynamic = element.ownerDocument.defaultView;
  if (!defaultView) return;
  let entry: Dynamic = shrinkWrapQueueByView.get(defaultView);
  entry &&
    (entry.queue.delete(element),
    flushShrinkWrapJobs(defaultView, entry, []));
}
function shrinkWrapNeedsResize(change?: Dynamic): Dynamic {
  if (change.self) {
    let isAtAppliedWidth: Dynamic =
      change.applied !== null && Math.abs(change.inline - change.applied) <= 1;
    return (
      Math.abs(change.block - change.prevBlock) > 1 ||
      (!isAtAppliedWidth && Math.abs(change.inline - change.prevInline) > 1)
    );
  }
  return Math.abs(change.inline - change.prevInline) > 1;
}
function observeShrinkWrapResize(
  view?: Dynamic,
  element?: Dynamic,
  handler?: Dynamic,
): Dynamic {
  let entry: Dynamic = shrinkWrapResizeObserverByView.get(view);
  if (!entry) {
    let entries: Dynamic = new Map();
    entry = {
      observer: new view.ResizeObserver((resizeEntries?: Dynamic): Dynamic => {
        for (let resizeEntry of resizeEntries as Dynamic)
          for (let listener of (entries.get(resizeEntry.target) ?? []) as Dynamic)
            listener(resizeEntry);
        flushShrinkWrapResizeJobs(view);
      }),
      handlers: entries,
      paused: new Set(),
      resumeQueued: 0,
    };
    shrinkWrapResizeObserverByView.set(view, entry);
  }
  let elementHandlers: Dynamic = entry.handlers.get(element);
  elementHandlers ||
    ((elementHandlers = new Set()),
    entry.handlers.set(element, elementHandlers),
    entry.observer.observe(element));
  elementHandlers.add(handler);
}
function unobserveShrinkWrapResize(
  view?: Dynamic,
  element?: Dynamic,
  handler?: Dynamic,
): Dynamic {
  let entry: Dynamic = shrinkWrapResizeObserverByView.get(view),
    elementHandlers: Dynamic = entry?.handlers.get(element);
  !entry ||
    !elementHandlers ||
    (elementHandlers.delete(handler),
    elementHandlers.size === 0 &&
      (entry.handlers.delete(element),
      entry.paused.delete(element),
      entry.observer.unobserve(element)),
    entry.handlers.size === 0 &&
      (entry.observer.disconnect(),
      entry.resumeQueued && view.cancelAnimationFrame(entry.resumeQueued),
      shrinkWrapResizeObserverByView.delete(view)));
}
function pauseShrinkWrapResize(view?: Dynamic, element?: Dynamic): Dynamic {
  let entry: Dynamic = shrinkWrapResizeObserverByView.get(view);
  !entry ||
    !entry.handlers.has(element) ||
    entry.paused.has(element) ||
    (entry.observer.unobserve(element),
    entry.paused.add(element),
    entry.resumeQueued ||
      (entry.resumeQueued = view.requestAnimationFrame((): Dynamic => {
        entry.resumeQueued = 0;
        for (let pausedElement of entry.paused as Dynamic)
          entry.handlers.has(pausedElement) && entry.observer.observe(pausedElement);
        entry.paused.clear();
      })));
}
function observeShrinkWrap(
  element?: Dynamic,
  { immediate: isImmediate = false }: Dynamic = {},
): Dynamic {
  let isDisposed: Dynamic = false,
    appliedWidth: Dynamic = null,
    defaultView: Dynamic = element.ownerDocument.defaultView,
    sizeByElement: Dynamic = new Map(),
    observedElements: Dynamic = [],
    recordSize: Dynamic = (target?: Dynamic): Dynamic => {
      let targetElement: Dynamic = target;
      sizeByElement.set(target, {
        inline: targetElement.offsetWidth ?? 0,
        block: targetElement.offsetHeight ?? 0,
      });
    },
    resizeHost: Dynamic = defaultView?.ResizeObserver ? defaultView : null,
    resizedAncestorIndex: Dynamic = 0,
    applyWidth: Dynamic = (width?: Dynamic): Dynamic => {
      if (!isDisposed) {
        appliedWidth = width;
        for (let observed of observedElements as Dynamic) recordSize(observed);
        if (resizeHost && resizedAncestorIndex > 0)
          for (let pausedElement of observedElements.slice(resizedAncestorIndex) as Dynamic)
            pauseShrinkWrapResize(resizeHost, pausedElement);
        resizedAncestorIndex = 0;
      }
    },
    schedule: Dynamic = (reason?: Dynamic): Dynamic => {
      isDisposed || scheduleShrinkWrapJob(element, applyWidth, reason);
    };
  isImmediate ? (appliedWidth = shrinkWrapElement(element)) : schedule("microtask");
  let handleResize: Dynamic = (event?: Dynamic): Dynamic => {
      let borderBox: Dynamic = event.borderBoxSize?.[0],
        inlineSize: Dynamic = borderBox
          ? borderBox.inlineSize
          : event.contentRect.width,
        blockSize: Dynamic = borderBox
          ? borderBox.blockSize
          : event.contentRect.height,
        previousSize: Dynamic = sizeByElement.get(event.target) ?? {
          inline: inlineSize,
          block: blockSize,
        };
      sizeByElement.set(event.target, {
        inline: inlineSize,
        block: blockSize,
      });
      let isSelf: Dynamic = event.target === element;
      shrinkWrapNeedsResize({
        self: isSelf,
        inline: inlineSize,
        block: blockSize,
        prevInline: previousSize.inline,
        prevBlock: previousSize.block,
        applied: appliedWidth,
      }) &&
        (isSelf || (resizedAncestorIndex = Math.max(resizedAncestorIndex, observedElements.indexOf(event.target))),
        schedule(isSelf ? "frame" : "resize"));
    },
    observeElement: Dynamic = (target?: Dynamic): Dynamic => {
      resizeHost && observeShrinkWrapResize(resizeHost, target, handleResize);
      observedElements.push(target);
      isImmediate && recordSize(target);
    };
  observeElement(element);
  for (
    let parentElement: Dynamic = element.parentElement, depth: Dynamic = 0;
    parentElement && depth < ancestorDepthLimit;
    parentElement = parentElement.parentElement, depth++
  )
    observeElement(parentElement);
  let mutationObserver: Dynamic = defaultView?.MutationObserver
    ? new defaultView.MutationObserver((): Dynamic => {
        schedule("microtask");
      })
    : null;
  mutationObserver?.observe(element, {
    subtree: true,
    childList: true,
    characterData: true,
    attributes: true,
    attributeFilter: [ShrinkwrapAttribute],
  });
  let fonts: Dynamic = element.ownerDocument.fonts,
    scheduleAfterFonts: Dynamic = (): Dynamic => schedule("microtask");
  fonts?.addEventListener?.("loadingdone", scheduleAfterFonts);
  fonts && fonts.status !== "loaded" && fonts.ready.then(scheduleAfterFonts);
  return (): Dynamic => {
    isDisposed = true;
    cancelShrinkWrapJob(element);
    if (resizeHost)
      for (let observed of observedElements as Dynamic)
        unobserveShrinkWrapResize(resizeHost, observed, handleResize);
    mutationObserver?.disconnect();
    fonts?.removeEventListener?.("loadingdone", scheduleAfterFonts);
    restoreShrinkWrapWidth(element);
  };
}
function useShrinkWrap({
  enabled: enabled = true,
  immediate: immediate = false,
}: Dynamic = {}): Dynamic {
  let disposeRef: Dynamic = (0, reactComponentsShrinkWrap.useRef)(null);
  return (0, reactComponentsShrinkWrap.useCallback)(
    (element?: Dynamic): Dynamic => {
      disposeRef.current?.();
      disposeRef.current = null;
      if (!!element) {
        if (!enabled) {
          restoreShrinkWrapWidth(element);
          return;
        }
        disposeRef.current = observeShrinkWrap(element, {
          immediate: immediate,
        });
      }
    },
    [enabled, immediate],
  );
}
export {
  applyShrinkWrapWidth,
  cancelShrinkWrapJob,
  ComponentsShrinkWrapElementCache,
  appliedWidthByElement,
  shrinkWrapQueueByView,
  shrinkWrapResizeObserverByView,
  ComponentsShrinkWrapLimit,
  ComponentsShrinkWrapSubscribers,
  createShrinkWrapJob,
  flushShrinkWrapJobs,
  flushShrinkWrapMicrotask,
  flushShrinkWrapResizeJobs,
  getShrinkWrapQueue,
  initializeComponentsShrinkWrap,
  initializeShrinkWrapComponent,
  isInlineBox,
  jsxComponentsShrinkWrap,
  MaxWidthValue,
  measureInlineContent,
  measureShrinkWrapCandidate,
  measureShrinkWrapJob,
  nextShrinkWrapCandidate,
  observeShrinkWrap,
  observeShrinkWrapResize,
  pauseShrinkWrapResize,
  preservesContentLayout,
  reactComponentsShrinkWrap,
  rememberOriginalWidth,
  restoreShrinkWrapWidth,
  runShrinkWrapBatch,
  scheduleShrinkWrapJob,
  settleShrinkWrapJob,
  ShrinkWrap,
  ShrinkwrapAttribute,
  shrinkWrapElement,
  shrinkWrapNeedsResize,
  unobserveShrinkWrapResize,
  useShrinkWrap,
  verifyShrinkWrapJob,
};
export function installCdsComponentsShrinkWrap(): () => void {
  return () => {
    initializeComponentsShrinkWrap = initializeOnce(
      (): Dynamic => {
        MaxWidthValue = "maxWidth";
        ComponentsShrinkWrapElementCache = new WeakMap();
        appliedWidthByElement = new WeakMap();
        ComponentsShrinkWrapLimit = 12;
        ShrinkwrapAttribute = "data-shrinkwrap";
        ancestorDepthLimit = 16;
        ComponentsShrinkWrapSubscribers = new Set([
          "IMG",
          "SVG",
          "VIDEO",
          "AUDIO",
          "CANVAS",
          "IFRAME",
          "EMBED",
          "OBJECT",
          "PICTURE",
          "INPUT",
          "TEXTAREA",
          "SELECT",
          "PROGRESS",
          "METER",
        ]);
        shrinkWrapQueueByView = new WeakMap();
        shrinkWrapResizeObserverByView = new WeakMap();
      },
    );
    initializeShrinkWrapComponent = initializeOnce(
      (): Dynamic => {
        "use client";

        initializeDomRefComposition();
        initializeComponentsShrinkWrap();
        reactComponentsShrinkWrap = toModuleNamespace(
          load_react(),
        );
        jsxComponentsShrinkWrap = toModuleNamespace(
          load_react_jsx_runtime(),
        );
        ShrinkWrap = (0, reactComponentsShrinkWrap.forwardRef)(
          (
            {
              enabled = true,
              immediate = false,
              children: children,
              ...props
            }: Dynamic,
            forwardedRef?: Dynamic,
          ): Dynamic => {
            let shrinkWrapRef: Dynamic = useShrinkWrap({
                enabled: enabled,
                immediate: immediate,
              }),
              mergedRef: Dynamic = useMergedRefs(forwardedRef, shrinkWrapRef);
            return (
              <div ref={mergedRef} data-cds={"ShrinkWrap"} {...props}>
                {children}
              </div>
            );
          },
        );
        ShrinkWrap.displayName = "ShrinkWrap";
      },
    );
  };
}
