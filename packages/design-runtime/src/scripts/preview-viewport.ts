/** Restored injected script; compiled as an isolated IIFE before insertion into a preview. */
import type { Dynamic } from "../runtime-types";
(function (this: Dynamic, ..._scriptArgs: Dynamic[]): Dynamic {
  /* Viewport guard */
  var previewDocument: Dynamic = document;
  var scrollDelta: Dynamic = function (
    this: Dynamic,
    targetStart?: Dynamic,
    targetEnd?: Dynamic,
    viewportStart?: Dynamic,
    viewportEnd?: Dynamic,
    alignment?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (alignment === "start") return targetStart - viewportStart;
    if (alignment === "end") return targetEnd - viewportEnd;
    if (alignment === "center")
      return (targetStart + targetEnd) / 2 - (viewportStart + viewportEnd) / 2;
    if (
      (targetStart >= viewportStart && targetEnd <= viewportEnd) ||
      (targetStart < viewportStart && targetEnd > viewportEnd)
    )
      return 0; /* fully visible, or covering */
    /* center-if-needed centres only a fully hidden target; a partly visible one moves to the nearest edge */
    if (alignment === "center-if-needed" && (targetEnd <= viewportStart || targetStart >= viewportEnd))
      return (targetStart + targetEnd) / 2 - (viewportStart + viewportEnd) / 2;
    var targetFits: Dynamic = targetEnd - targetStart <= viewportEnd - viewportStart;
    if (targetStart < viewportStart) return targetFits ? targetStart - viewportStart : targetEnd - viewportEnd;
    return targetFits ? targetEnd - viewportEnd : targetStart - viewportStart;
  };
  var tryComputedStyle: Dynamic = function (
    this: Dynamic,
    element?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    try {
      return getComputedStyle(element);
    } catch (_error: Dynamic) {
      return null;
    }
  };
  var isActiveCssValue: Dynamic = function (
    this: Dynamic,
    cssValue?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return !!cssValue && cssValue !== "none" && cssValue !== "auto";
  };
  /* transform-like properties make a box the containing block of its absolute AND fixed descendants */
  var createsFixedContainingBlock: Dynamic = function (
    this: Dynamic,
    style?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return (
      isActiveCssValue(style.transform) ||
      isActiveCssValue(style.translate) ||
      isActiveCssValue(style.rotate) ||
      isActiveCssValue(style.scale) ||
      isActiveCssValue(style.perspective) ||
      isActiveCssValue(style.filter) ||
      isActiveCssValue(style.backdropFilter) ||
      style.transformStyle === "preserve-3d" ||
      /layout|paint|strict|content/.test(style.contain || "") ||
      /(^|,)\s*(transform|translate|rotate|scale|perspective|filter|backdrop-filter)\s*(,|$)/.test(
        style.willChange || "",
      )
    );
  };
  var canScroll: Dynamic = function (
    this: Dynamic,
    element?: Dynamic,
    style?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var overflow: Dynamic =
      style.overflow + " " + style.overflowX + " " + style.overflowY;
    return (
      /auto|scroll|hidden/.test(overflow) &&
      (element.scrollHeight > element.clientHeight ||
        element.scrollWidth > element.clientWidth)
    );
  };
  var composedParent: Dynamic = function (
    this: Dynamic,
    node?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (node.assignedSlot) return node.assignedSlot;
    var parentNode: Dynamic = node.parentNode;
    return parentNode && parentNode.nodeType === 11 && parentNode.host
      ? parentNode.host
      : parentNode;
  };
  /* Reveal el inside this document only: each scrolling ancestor, then the frame's own viewport. Never the parent's. */
  var revealInPreview: Dynamic = function (
    this: Dynamic,
    element?: Dynamic,
    blockAlignment?: Dynamic,
    inlineAlignment?: Dynamic,
    smoothViewport?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      !element ||
      typeof element.getClientRects !== "function" ||
      element.getClientRects().length === 0
    )
      return; /* no box: nothing to reveal */
    var ownerDocument: Dynamic = element.ownerDocument || previewDocument;
    var scrollingRoot: Dynamic =
      ownerDocument.scrollingElement || ownerDocument.documentElement;
    /* Only boxes in el's containing-block chain can move it: an absolute box skips static ancestors up to a positioned or
     * transform-like one; a fixed box skips everything up to a transform-like one (none: not even the viewport moves it). */
    var elementStyle: Dynamic = tryComputedStyle(element);
    var position: Dynamic = (elementStyle && elementStyle.position) || "static";
    var seekingAbsoluteContainer: Dynamic = position === "absolute",
      seekingFixedContainer: Dynamic = position === "fixed";
    for (
      var ancestor: Dynamic = composedParent(element);
      ancestor && ancestor !== scrollingRoot && ancestor.nodeType === 1;
      ancestor = composedParent(ancestor)
    ) {
      var ancestorStyle: Dynamic = tryComputedStyle(ancestor);
      if (!ancestorStyle) continue;
      position = ancestorStyle.position || "static";
      if (
        seekingFixedContainer
          ? !createsFixedContainingBlock(ancestorStyle)
          : seekingAbsoluteContainer &&
            position === "static" &&
            !createsFixedContainingBlock(ancestorStyle)
      )
        continue;
      seekingAbsoluteContainer = position === "absolute";
      seekingFixedContainer = position === "fixed";
      if (!canScroll(ancestor, ancestorStyle)) continue;
      var bounds: Dynamic = element.getBoundingClientRect();
      var ancestorBounds: Dynamic = ancestor.getBoundingClientRect();
      var scrollportTop: Dynamic = ancestorBounds.top + ancestor.clientTop,
        scrollportLeft: Dynamic = ancestorBounds.left + ancestor.clientLeft;
      var scrollTop: Dynamic = scrollDelta(
        bounds.top,
        bounds.bottom,
        scrollportTop,
        scrollportTop + ancestor.clientHeight,
        blockAlignment,
      );
      var scrollLeft: Dynamic = scrollDelta(
        bounds.left,
        bounds.right,
        scrollportLeft,
        scrollportLeft + ancestor.clientWidth,
        inlineAlignment,
      );
      if (!scrollLeft && !scrollTop) continue;
      /* instant even under CSS scroll-behavior:smooth: the next step must read the settled position ('smooth' applies to the viewport step) */
      if (typeof ancestor.scrollTo === "function")
        ancestor.scrollTo({
          left: ancestor.scrollLeft + scrollLeft,
          top: ancestor.scrollTop + scrollTop,
          behavior: "instant",
        });
      else {
        ancestor.scrollTop += scrollTop;
        ancestor.scrollLeft += scrollLeft;
      }
    }
    if (seekingFixedContainer) return;
    var viewportTargetBounds: Dynamic = element.getBoundingClientRect();
    var viewportWidth: Dynamic =
        (scrollingRoot && scrollingRoot.clientWidth) ||
        (window as Dynamic).innerWidth,
      viewportHeight: Dynamic =
        (scrollingRoot && scrollingRoot.clientHeight) ||
        (window as Dynamic).innerHeight;
    var top: Dynamic = scrollDelta(
      viewportTargetBounds.top,
      viewportTargetBounds.bottom,
      0,
      viewportHeight,
      blockAlignment,
    );
    var left: Dynamic = scrollDelta(
      viewportTargetBounds.left,
      viewportTargetBounds.right,
      0,
      viewportWidth,
      inlineAlignment,
    );
    if (left || top)
      (window as Dynamic).scrollBy({
        left: left,
        top: top,
        behavior: smoothViewport ? "smooth" : "auto",
      });
  };
  var findDeepActiveElement: Dynamic = function (
    this: Dynamic,
    element?: Dynamic,
    fallbackDocument?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var root: Dynamic = element.getRootNode
      ? element.getRootNode()
      : fallbackDocument; /* el's own (possibly closed) shadow root sees its activeElement */
    var activeElement: Dynamic = (
      root && "activeElement" in root ? root : fallbackDocument
    ).activeElement;
    while (
      activeElement &&
      activeElement.shadowRoot &&
      activeElement.shadowRoot.activeElement
    )
      activeElement = activeElement.shadowRoot.activeElement;
    return activeElement;
  };
  var isWithinComposedTree: Dynamic = function (
    this: Dynamic,
    element?: Dynamic,
    ancestor?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (var currentNode: Dynamic = element; currentNode; currentNode = composedParent(currentNode))
      if (currentNode === ancestor) return true;
    return false;
  };
  var guardFocusScroll: Dynamic = function (
    this: Dynamic,
    prototype?: Dynamic,
    ..._setupArgs: Dynamic[]
  ): Dynamic {
    if (!prototype || typeof prototype.focus !== "function") return;
    var focus: Dynamic = prototype.focus;
    /* reveal only what actually took focus (el, or its delegate inside it), and only if focus moved - as the native does */
    prototype.focus = function value_focus(
      this: Dynamic,
      focusOptions?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      var ownerDocument: Dynamic = this.ownerDocument || previewDocument;
      var previousActiveElement: Dynamic = findDeepActiveElement(this, ownerDocument);
      // MineDesign: restorer fix — call the saved native focus, as the original script does (`native.call`); the restored
      // code called the wrapper itself and recursed until the stack overflowed whenever an artboard element was focused.
      focus.call(
        this,
        focusOptions && focusOptions.focusVisible !== undefined
          ? {
              preventScroll: true,
              focusVisible: focusOptions.focusVisible,
            }
          : {
              preventScroll: true,
            },
      );
      if (focusOptions && focusOptions.preventScroll) return;
      try {
        var activeElement: Dynamic = findDeepActiveElement(this, ownerDocument);
        if (activeElement && activeElement !== previousActiveElement && isWithinComposedTree(activeElement, this))
          revealInPreview(activeElement, "center-if-needed", "center-if-needed", false);
      } catch (_error: Dynamic) {}
    };
  };
  guardFocusScroll(
    (window as Dynamic).HTMLElement &&
      (window as Dynamic).HTMLElement.prototype,
  );
  guardFocusScroll(
    (window as Dynamic).SVGElement && (window as Dynamic).SVGElement.prototype,
  );
  guardFocusScroll(
    (window as Dynamic).MathMLElement &&
      (window as Dynamic).MathMLElement.prototype,
  );
  var Element: Dynamic = (window as Dynamic).Element;
  if (Element) {
    Element.prototype.scrollIntoView = function value_scrollIntoView(
      this: Dynamic,
      scrollOptions?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      var usesOptionsObject: Dynamic = scrollOptions == null || typeof scrollOptions === "object";
      var normalizedOptions: Dynamic = (usesOptionsObject && scrollOptions) || {};
      var blockAlignment: Dynamic = usesOptionsObject
        ? normalizedOptions.block || "start"
        : scrollOptions
          ? "start"
          : "end";
      try {
        revealInPreview(
          this,
          blockAlignment,
          normalizedOptions.inline || "nearest",
          normalizedOptions.behavior === "smooth",
        );
      } catch (_error: Dynamic) {}
    };
    Element.prototype.scrollIntoViewIfNeeded =
      function value_scrollIntoViewIfNeeded(
        this: Dynamic,
        centerIfNeeded?: Dynamic,
        ..._unusedArgs: Dynamic[]
      ): Dynamic {
        var alignment: Dynamic =
          centerIfNeeded === undefined || centerIfNeeded ? "center-if-needed" : "nearest";
        try {
          revealInPreview(this, alignment, alignment, false);
        } catch (_error: Dynamic) {}
      };
  }
})();
