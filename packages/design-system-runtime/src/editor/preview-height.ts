import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */

var clampPreviewHeight: (height: number) => number;
var DEFAULT_PREVIEW_HEIGHT: number;
var MAX_AUTO_PREVIEW_HEIGHT: number;
var PREVIEW_RESIZE_SETTLE_MS: number;
var PREVIEW_RESIZE_ANIMATION_WINDOW_MS: number;
var PREVIEW_RESIZE_MIN_DELAY_MS: number;
var PREVIEW_RESIZE_MARGIN_PX: number;
var PREVIEW_RESIZE_MAX_HEIGHT: number;
var NON_LAYOUT_TRANSITION_PROPERTIES: RegExp;
var PREVIEW_FONT_WAIT_TIMEOUT_MS: number;
var PREVIEW_RESIZE_ACTIVITY_EVENTS: (keyof DocumentEventMap)[];
var isNormalFlowStyle: (style: CSSStyleDeclaration) => boolean;
function elementDocumentBottom(
  element: Element,
  frameWindow: Window,
): number {
  let offsetElement = element as HTMLElement,
    body = element.ownerDocument.body;
  if (typeof offsetElement.offsetTop !== "number" || element === body) {
    return (
      element.getBoundingClientRect().bottom + (frameWindow.scrollY || 0)
    );
  }
  let bottom = offsetElement.offsetTop + offsetElement.offsetHeight;
  for (
    let offsetParent = offsetElement.offsetParent as HTMLElement | null;
    offsetParent !== null && offsetParent !== undefined;
    offsetParent = offsetParent.offsetParent as HTMLElement | null
  ) {
    if (offsetParent === body) {
      if (frameWindow.getComputedStyle(offsetParent).position !== "static") {
        bottom +=
          offsetParent.getBoundingClientRect().top +
          (frameWindow.scrollY || 0) +
          offsetParent.clientTop;
      }
      break;
    }
    bottom += offsetParent.offsetTop + offsetParent.clientTop;
  }
  return bottom;
}
function* normalFlowChildren(
  element: Element,
  frameWindow: Window,
  depth: number = 0,
): Generator<Element, void, unknown> {
  for (
    let firstElementChild = element.firstElementChild;
    firstElementChild !== null;
    firstElementChild = firstElementChild.nextElementSibling
  ) {
    let style = frameWindow.getComputedStyle(firstElementChild);
    if (style.display === "contents" && depth < 4) {
      yield* normalFlowChildren(firstElementChild, frameWindow, depth + 1);
    } else if (isNormalFlowStyle(style)) {
      yield firstElementChild;
    }
  }
}
function collapsedBottomMargin(
  element: Element,
  frameWindow: Window,
): number {
  let margin: number = 0,
    current: Element | null = element;
  for (let index: number = 0; current !== null && index < 8; index++) {
    let style = frameWindow.getComputedStyle(current);
    if (style.display !== "inline") {
      margin = Math.max(margin, parseFloat(style.marginBottom) || 0);
    }
    if (
      style.display !== "block" ||
      style.overflow !== "visible" ||
      (parseFloat(style.paddingBottom) || 0) > 0 ||
      (parseFloat(style.borderBottomWidth) || 0) > 0
    ) {
      break;
    }
    let lastElementChild: Element | null = current.lastElementChild;
    while (
      lastElementChild !== null &&
      !isNormalFlowStyle(frameWindow.getComputedStyle(lastElementChild))
    ) {
      lastElementChild = lastElementChild.previousElementSibling;
    }
    if (
      lastElementChild !== null &&
      elementDocumentBottom(current, frameWindow) -
        elementDocumentBottom(lastElementChild, frameWindow) >
        1
    ) {
      break;
    }
    current = lastElementChild;
  }
  return margin;
}
function measurePreviewDocumentHeight(
  previewDocument: Document,
  frameWindow: Window,
): number {
  let body = previewDocument.body;
  if (body === null) {
    return Math.ceil(
      elementDocumentBottom(previewDocument.documentElement, frameWindow),
    );
  }
  let bodyStyle = frameWindow.getComputedStyle(body),
    bottomBox =
      (parseFloat(bodyStyle.paddingBottom) || 0) +
      (parseFloat(bodyStyle.borderBottomWidth) || 0),
    bottomMargin = parseFloat(bodyStyle.marginBottom) || 0,
    childBottom = -1 / 0,
    childMargin = 0;
  for (let value of normalFlowChildren(body, frameWindow)) {
    let resizeObserver = elementDocumentBottom(value, frameWindow),
      documentHeight = collapsedBottomMargin(value, frameWindow);
    if (resizeObserver + documentHeight > childBottom + childMargin) {
      childBottom = resizeObserver;
      childMargin = documentHeight;
    }
  }
  let bodyBottom = elementDocumentBottom(body, frameWindow) + bottomMargin,
    shortBodyBottom =
      bodyBottom + 1 < (frameWindow.scrollY || 0) + frameWindow.innerHeight
        ? bodyBottom
        : -1 / 0;
  if (childBottom === -1 / 0) {
    return Math.ceil(Math.max(bodyBottom, 0));
  }
  return Math.ceil(
    Math.max(
      childBottom +
        bottomBox +
        (bottomBox > 0
          ? childMargin + bottomMargin
          : Math.max(childMargin, bottomMargin)),
      shortBodyBottom,
    ),
  );
}
function accessiblePreviewDocument(iframe: HTMLIFrameElement): {
  d: Editor.PreviewAnimationDocument;
  fw: Editor.PreviewFrameWindow;
} | null {
  try {
    let { contentDocument: value, contentWindow: resizeObserverA } = iframe;
    if (value !== null && resizeObserverA !== null && value.body !== null) {
      return {
        d: value as Editor.PreviewAnimationDocument,
        fw: resizeObserverA as Editor.PreviewFrameWindow,
      };
    } else {
      return null;
    }
  } catch {
    return null;
  }
}
function observePreviewHeight(
  iframe: HTMLIFrameElement,
  onHeight: (height: number) => void,
  heightLimit?: number,
): () => void {
  let value = accessiblePreviewDocument(iframe),
    resizeObserverB = value?.fw.ResizeObserver;
  if (value === null || typeof resizeObserverB !== "function") {
    return (): void => {
      return;
    };
  }
  let { d: documentHeightA, fw: frameWindow } = value,
    documentElement = documentHeightA.documentElement,
    body = documentHeightA.body,
    callback = () => measurePreviewDocumentHeight(documentHeightA, frameWindow),
    flag: boolean = false,
    innerHeight = frameWindow.innerHeight,
    measuredHeight = callback(),
    index = 0,
    heightDelta =
      heightLimit !== undefined && innerHeight > heightLimit
        ? innerHeight - heightLimit
        : 0,
    clampedHeight = clampPreviewHeight(measuredHeight),
    resizeIndex = 0,
    previousHeight = measuredHeight,
    resizeIndexA = 0,
    items: Editor.AnimatedPreviewHeight[] = [],
    isStable: boolean = false,
    resizeIndexB: number = 0,
    resizeIndexC: number = 0,
    isStableA: boolean = false,
    resizeIndexD: number = 0,
    resizeIndexE = 0,
    resizeIndexF = 0,
    settleTimer: ReturnType<typeof setTimeout> | undefined,
    isStableB: boolean = false,
    isStableC: boolean = false,
    fontWaitTimeout = PREVIEW_FONT_WAIT_TIMEOUT_MS,
    fontWaitTimer: ReturnType<typeof setTimeout> | undefined,
    resizeIndexG = 0,
    minimumHeight: number | undefined = Math.max(
      documentElement.scrollHeight,
      body.scrollHeight,
    ),
    resizeTimer: ReturnType<typeof setTimeout> | undefined = setTimeout(
      () => scheduleUpdate(handleResizeA),
      MAX_AUTO_PREVIEW_HEIGHT,
    ),
    isStableD = false,
    resizeIndexH: number = 0,
    isStableE: boolean = true,
    handleResize = (): void => {
      let previewValue: boolean =
        Math.max(frameWindow.innerHeight, minimumHeight ?? 0) + 1 <
        Math.max(documentElement.scrollHeight, body.scrollHeight);
      if (previewValue === isStableD) {
        return;
      }
      isStableD = previewValue;
      if (previewValue) {
        if (Date.now() - resizeIndexH < PREVIEW_FONT_WAIT_TIMEOUT_MS) {
          documentElement.style.setProperty("scrollbar-gutter", "stable");
        }
        documentElement.style.setProperty("overflow", "auto", "important");
      } else {
        resizeIndexH = Date.now();
        frameWindow.scrollTo(0, 0);
        documentElement.style.removeProperty("overflow");
      }
    },
    handleResizeA = (): void => {
      if (resizeTimer !== undefined) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = undefined;
      minimumHeight = undefined;
      if (fontWaitTimer === undefined) {
        handleResize();
      }
    },
    handleResizeB = () =>
      documentElement.getClientRects().length > 0 && frameWindow.innerHeight > 0,
    hasChanged = handleResizeB(),
    handleResizeC = (): void => {
      let viewportHeight = frameWindow.innerHeight;
      if (!handleResizeB()) {
        return;
      }
      let previewValueA = callback();
      if (!hasChanged) {
        hasChanged = true;
        innerHeight = viewportHeight;
        measuredHeight = previewValueA;
        clampedHeight = clampPreviewHeight(previewValueA);
        return;
      }
      if (viewportHeight === innerHeight) {
        measuredHeight = previewValueA;
        return;
      }
      resizeIndexA = previewValueA - measuredHeight;
      index = Math.max(0, index + resizeIndexA);
      resizeIndex = viewportHeight - innerHeight;
      previousHeight = measuredHeight;
      resizeIndexC = Date.now();
      isStableA = true;
      isStable = false;
      items = resizeIndexC - resizeIndexB <= PREVIEW_RESIZE_MARGIN_PX ? [] : handleResizeK();
      innerHeight = viewportHeight;
      measuredHeight = previewValueA;
      handleResizeA();
      if (resizeIndexA < -1) {
        handleResizeL();
      }
    },
    handleResizeD = (): string => {
      if (resizeIndex === 0) {
        return "judged";
      }
      if (
        items.some(
          ({ a: a, el: el2 }) =>
            el2.isConnected && (a.playState === "running" || a.pending),
        ) &&
        Date.now() - resizeIndexC < PREVIEW_RESIZE_MAX_HEIGHT
      ) {
        return "deferred";
      }
      let previewValueB = measuredHeight - previousHeight,
        isStableF: boolean = false;
      if (!isStable && Math.abs(previewValueB) <= 1 && Math.abs(resizeIndex) >= 2) {
        isStableF = index !== 0;
        handleResizeE();
        index = 0;
      } else if (items.length > 0) {
        index = Math.max(
          0,
          index +
            items.reduce(
              (event, { el: el2, h0: h02 }) =>
                event + (el2.offsetHeight - h02),
              0,
            ),
        );
      }
      items = [];
      if (heightDelta > 0 && Math.abs(resizeIndex) >= 2) {
        index += Math.round(
          Math.max(0, Math.min(1, previewValueB / resizeIndex)) * heightDelta,
        );
        heightDelta = 0;
      }
      resizeIndex = 0;
      resizeIndexA = 0;
      if (isStableF) {
        return "healed";
      } else {
        return "judged";
      }
    },
    handleResizeE = (): void => {
      index -= resizeIndexF;
      resizeIndexF = 0;
      if (settleTimer !== undefined) {
        clearTimeout(settleTimer);
      }
      settleTimer = undefined;
    },
    handleResizeF = () =>
      resizeIndexD !== 0 &&
      Date.now() - resizeIndexD < PREVIEW_RESIZE_ANIMATION_WINDOW_MS,
    isStableG: boolean = false,
    handleResizeG = (eventA: Event & { repeat?: boolean }): void => {
      if (!eventA.isTrusted) {
        return;
      }
      if (eventA.type === "pointerdown" || eventA.type === "pointercancel") {
        isStableG = eventA.type === "pointercancel";
        return;
      }
      if (eventA.type === "pointerup" && isStableG) {
        return;
      }
      if (eventA.type === "keydown" && eventA.repeat) {
        return;
      }
      resizeIndexD = Date.now();
    },
    handleResizeH = (): void => {
      fontWaitTimer = undefined;
      if (!handleResizeB()) {
        return;
      }
      handleResizeC();
      measuredHeight = callback();
      let previewValueC = handleResizeD();
      if (previewValueC === "deferred") {
        handleResize();
        return;
      }
      let previewValueD: boolean = previewValueC === "healed",
        previewValueE = clampPreviewHeight(measuredHeight - index);
      if (previewValueE > clampedHeight + 1 && !previewValueD) {
        let previewValueF: boolean = isStableA;
        isStableA = false;
        if (previewValueF && handleResizeF()) {
          isStableC = false;
          if (resizeIndexF > 0) {
            handleResizeE();
          }
          previewValueE = clampPreviewHeight(measuredHeight - index);
        } else if (previewValueF) {
          resizeIndexE += 1;
          if (resizeIndexE > 2) {
            resizeIndexF += previewValueE - clampedHeight;
            index += previewValueE - clampedHeight;
            previewValueE = clampedHeight;
            if (isStableC) {
              fontWaitTimeout *= 3;
            }
            if (settleTimer === undefined) {
              settleTimer = setTimeout(
                () =>
                  scheduleUpdate((): void => {
                    settleTimer = undefined;
                    isStableB = true;
                    handleResizeE();
                    handleResizeL();
                  }),
                fontWaitTimeout,
              );
            }
          }
          isStableC = false;
        } else if (isStableB) {
          isStableB = false;
          isStableC = true;
        } else {
          isStableC = false;
          fontWaitTimeout = PREVIEW_FONT_WAIT_TIMEOUT_MS;
          if (resizeIndexF > 0) {
            handleResizeE();
          } else {
            resizeIndexE = 0;
          }
          previewValueE = clampPreviewHeight(measuredHeight - index);
        }
      } else if (previewValueE < clampedHeight - 1) {
        resizeIndexE = 0;
      }
      let previewValueG = heightLimit !== undefined && innerHeight <= heightLimit + 1;
      if (
        Math.abs(previewValueE - clampedHeight) >= 2 ||
        (isStableE &&
          (previewValueE < innerHeight - 1 ||
            (previewValueG && previewValueE > innerHeight + 1)))
      ) {
        clampedHeight = previewValueE;
        minimumHeight = previewValueE;
        resizeIndexD = 0;
        if (resizeTimer !== undefined) {
          clearTimeout(resizeTimer);
        }
        resizeTimer = setTimeout(
          () => scheduleUpdate(handleResizeA),
          MAX_AUTO_PREVIEW_HEIGHT,
        );
        onHeight(previewValueE);
      }
      isStableE = false;
      handleResize();
    },
    handleResizeI = (): Editor.PreviewAnimation[] => {
      try {
        if (typeof documentHeightA.getAnimations === "function") {
          return documentHeightA
            .getAnimations()
            .filter(
              (eventB) =>
                eventB.playState === "running" &&
                eventB.effect?.getTiming().iterations !== 1 / 0,
            );
        } else {
          return [];
        }
      } catch {
        return [];
      }
    },
    handleResizeJ = (): boolean => handleResizeI().length > 0,
    handleResizeK = () => {
      let previewValueH = handleResizeI()
        .filter(
          (eventC) =>
            Number(eventC.currentTime ?? 0) <= PREVIEW_RESIZE_MIN_DELAY_MS &&
            !NON_LAYOUT_TRANSITION_PROPERTIES.test(
              eventC.transitionProperty ?? "",
            ),
        )
        .map((eventD) => ({
          a: eventD,
          el: eventD.effect?.target,
        }))
        .filter(
          (eventE: {
            a: Editor.PreviewAnimation;
            el: Element | null | undefined;
          }): eventE is { a: Editor.PreviewAnimation; el: HTMLElement } =>
            eventE.el !== null &&
            eventE.el !== undefined &&
            typeof (eventE.el as HTMLElement).offsetHeight === "number",
        );
      return previewValueH
        .filter(
          ({ el: el2 }, heightLimitA) =>
            previewValueH.findIndex((eventF): boolean => eventF.el === el2) ===
              heightLimitA &&
            !previewValueH.some(
              (eventG) => eventG.el !== el2 && eventG.el.contains(el2),
            ),
        )
        .map(({ a: a, el: el2 }) => ({
          a: a,
          el: el2,
          h0: el2.offsetHeight,
        }));
    },
    handleResizeL = (): void => {
      scheduleUpdate(handleResizeC);
      if (flag) {
        return;
      }
      let previewValueI: number = Date.now();
      if (fontWaitTimer === undefined) {
        resizeIndexG = previewValueI;
      } else if (
        previewValueI - resizeIndexG >
        (handleResizeJ() ? PREVIEW_RESIZE_SETTLE_MS : MAX_AUTO_PREVIEW_HEIGHT) -
          DEFAULT_PREVIEW_HEIGHT
      ) {
        return;
      } else {
        clearTimeout(fontWaitTimer);
      }
      fontWaitTimer = setTimeout(() => scheduleUpdate(handleResizeH), DEFAULT_PREVIEW_HEIGHT);
    },
    observer = new resizeObserverB(handleResizeL);
  observer.observe(body);
  for (
    let firstElementChild = body.firstElementChild;
    firstElementChild !== null;
    firstElementChild = firstElementChild.nextElementSibling
  ) {
    observer.observe(firstElementChild);
  }
  let mutationObserver =
    typeof frameWindow.MutationObserver === "function"
      ? new frameWindow.MutationObserver((eventH: MutationRecord[]): void => {
          isStable = true;
          resizeIndexB = Date.now();
          for (let previewValueJ of eventH) {
            if (previewValueJ.target !== body || previewValueJ.type !== "childList") {
              continue;
            }
            previewValueJ.addedNodes.forEach((eventI): void => {
              if (eventI.nodeType === 1) {
                observer.observe(eventI as Element);
              }
            });
            previewValueJ.removedNodes.forEach((eventJ): void => {
              if (eventJ.nodeType === 1) {
                observer.unobserve(eventJ as Element);
              }
            });
          }
          handleResizeL();
        })
      : null;
  mutationObserver?.observe(body, {
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
  });
  frameWindow.addEventListener("resize", handleResizeL);
  documentHeightA.addEventListener("transitionend", handleResizeL, true);
  documentHeightA.addEventListener("animationend", handleResizeL, true);
  for (let previewValueK of PREVIEW_RESIZE_ACTIVITY_EVENTS) {
    documentHeightA.addEventListener(previewValueK, handleResizeG, true);
  }
  function scheduleUpdate(eventK: () => void): void {
    if (flag) {
      return;
    }
    try {
      eventK();
    } catch {
      cleanup();
    }
  }
  function cleanup(): void {
    if (flag) {
      return;
    }
    flag = true;
    if (fontWaitTimer !== undefined) {
      clearTimeout(fontWaitTimer);
    }
    if (resizeTimer !== undefined) {
      clearTimeout(resizeTimer);
    }
    if (settleTimer !== undefined) {
      clearTimeout(settleTimer);
    }
    observer.disconnect();
    mutationObserver?.disconnect();
    try {
      frameWindow.removeEventListener("resize", handleResizeL);
      documentHeightA.removeEventListener("transitionend", handleResizeL, true);
      documentHeightA.removeEventListener("animationend", handleResizeL, true);
      for (let previewValueL of PREVIEW_RESIZE_ACTIVITY_EVENTS) {
        documentHeightA.removeEventListener(previewValueL, handleResizeG, true);
      }
    } catch {}
  }
  return cleanup;
}
export {
  accessiblePreviewDocument,
  clampPreviewHeight,
  collapsedBottomMargin,
  DEFAULT_PREVIEW_HEIGHT,
  elementDocumentBottom,
  isNormalFlowStyle,
  MAX_AUTO_PREVIEW_HEIGHT,
  measurePreviewDocumentHeight,
  NON_LAYOUT_TRANSITION_PROPERTIES,
  normalFlowChildren,
  observePreviewHeight,
  PREVIEW_FONT_WAIT_TIMEOUT_MS,
  PREVIEW_RESIZE_ACTIVITY_EVENTS,
  PREVIEW_RESIZE_ANIMATION_WINDOW_MS,
  PREVIEW_RESIZE_MARGIN_PX,
  PREVIEW_RESIZE_MAX_HEIGHT,
  PREVIEW_RESIZE_MIN_DELAY_MS,
  PREVIEW_RESIZE_SETTLE_MS,
};
export function installEditorPreviewHeight(): () => void {
  return () => {
    clampPreviewHeight = (height: number): number =>
      Math.min(4000, Math.max(40, Math.round(height)));
    DEFAULT_PREVIEW_HEIGHT = 120;
    MAX_AUTO_PREVIEW_HEIGHT = 480;
    PREVIEW_RESIZE_SETTLE_MS = 1500;
    PREVIEW_RESIZE_ANIMATION_WINDOW_MS = 1500;
    PREVIEW_RESIZE_MIN_DELAY_MS = 120;
    PREVIEW_RESIZE_MARGIN_PX = 50;
    PREVIEW_RESIZE_MAX_HEIGHT = 4000;
    NON_LAYOUT_TRANSITION_PROPERTIES =
      /^(opacity|color|background|box-shadow|outline|transform|filter|backdrop-filter|fill|stroke|visibility|text-decoration|caret-color|accent-color|border-\w+-color)/;
    PREVIEW_FONT_WAIT_TIMEOUT_MS = 1000;
    PREVIEW_RESIZE_ACTIVITY_EVENTS = [
      "click",
      "pointerup",
      "pointercancel",
      "pointerdown",
      "keydown",
    ];
    isNormalFlowStyle = (style: CSSStyleDeclaration) =>
      style.display !== "none" &&
      style.position !== "absolute" &&
      style.position !== "fixed";
  };
}
