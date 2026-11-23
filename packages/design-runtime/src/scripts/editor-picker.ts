/** Restored injected script; compiled as an isolated IIFE before insertion into a preview. */
import type { Dynamic } from "../runtime-types";
import {
  getDropStyleReset,
} from "./editor-picker/layout-insertion";
import { createTextFormatting } from "./editor-picker/text-formatting";
import { createAbsoluteDragSnapping } from "./editor-picker/absolute-drag-snapping";
import { authoredPositioning, autoDimensions } from "./editor-picker/authored-layout";
import { createFreehandEditing } from "./editor-picker/freehand-editing";
import { observeFramelessContentHull } from "./editor-picker/frameless-content-hull";
import { createPlacementOverlay, createDrawingContainerFinder } from "./editor-picker/drawing-placement";
import { createPendingInsertOverlays } from "./editor-picker/pending-insert-overlay";
import { createInsertedTextEditor } from "./editor-picker/inserted-text";
import { createDropContainerFinder, hasSvgAncestor, isUneditableElement } from "./editor-picker/drop-container";
import { allowedTableChildren, canContainElements, forbiddenInParagraph, permitsElementNesting } from "./editor-picker/drop-nesting";
import { createDrawingGestures } from "./editor-picker/drawing-gestures";
import { createPickerMediaDrop } from "./editor-picker/media-drop";
import {
  eventHitsDeckChrome,
  isDeckManagedElement,
} from "./editor-picker/deck-target";
import { createPickerClipboard } from "./editor-picker/clipboard";
import { createEditDoubleClick } from "./editor-picker/edit-double-click";
import { createPreviewPanZoom, panZoomRoot } from "./editor-picker/preview-pan-zoom";
import { createViewportWheel } from "./editor-picker/viewport-wheel";
import { canPageScrollAxis, eventHitsEditorOverlay, eventMatchesSelector } from "./editor-picker/wheel-targets";
import { createForwardedDoubleClick, createPreviewClicks, togglePreviewVideo } from "./editor-picker/preview-clicks";
import { createDirectiveSelection } from "./editor-picker/directive-selection";
import { createPointerPresence } from "./editor-picker/pointer-presence";
import { createPickerLifecycle } from "./editor-picker/lifecycle";
import { createViewportGestures } from "./editor-picker/viewport-gestures";
import { isSelectableContainer, removeAncestorSelections, selectableDescendants } from "./editor-picker/selection-candidates";
import { createSelectionQueries, type PickerHit } from "./editor-picker/selection-queries";
import { createMarqueeSelection } from "./editor-picker/marquee-selection";
import { editableSvgGeometry, svgGeometryBounds } from "./editor-picker/editable-svg-line";
import { createStrokeEndpointGesture } from "./editor-picker/stroke-endpoint-gesture";
import { createSvgPreviewRollback } from "./editor-picker/svg-line-preview";
import { createElementInspector, firstTextFont, inheritedTextStyle } from "./editor-picker/element-inspection";
import { bodySnapshot, stampLive, verifyPreviewStructure } from "./editor-picker/preview-document";
import { createElementTransform } from "./editor-picker/element-transform";

import {
  parseTransformFunctions,
  fractionalTransformOrigin,
} from "./editor-picker/element-transform-geometry";
import { createViewportScaleReader } from "./editor-picker/viewport-scale";

import {
  componentScopeName,
  createElementQuery,
  nearestComponentName,
  normalizeSvgHit,
  outerSvgElement,
  unwrapDisplayContentsHost,
} from "./editor-picker/element-query";
import {
} from "./editor-picker/text-edit-dom";
import { createCommentAnchors } from "./editor-picker/comment-anchors";
import {
  createSelectionBounds,
  firstRenderedInstance,
  isRenderedElement,
} from "./editor-picker/element-bounds";
import { createTextEditSession } from "./editor-picker/text-edit-session";
import { createPickerContextMenu } from "./editor-picker/context-menu";
import { createTextPlacementInputGuard } from "./editor-picker/text-placement-input";
import { createPickerKeyboard } from "./editor-picker/keyboard";
import { createSelectionChrome } from "./editor-picker/selection-chrome";
import { createSelectionTransformChrome } from "./editor-picker/selection-transform-chrome";
import { createSelectionClick } from "./editor-picker/selection-click";
import { createSelectionPress } from "./editor-picker/selection-press";
import { createSelectionHit } from "./editor-picker/selection-hit";
import { createEditorBackdrop } from "./editor-picker/editor-backdrop";
import { createStylePreview } from "./editor-picker/style-preview";
import { createSourceDragMotion } from "./editor-picker/source-drag-motion";
import { createSourceDragRelease } from "./editor-picker/source-drag-release";
import { createSourceDragPreview, markDraggedElements } from "./editor-picker/source-drag-preview";
import { createSourceDragStart } from "./editor-picker/source-drag-start";
import { createDragProxyCapture, hasCustomElementDescendant, hideDragProxy, positionDragProxy } from "./editor-picker/drag-proxy";
import { createFlowDropPreview } from "./editor-picker/flow-drop-preview";
import { createCrossBoardDropPlanner } from "./editor-picker/cross-board-drop";
import { createHostDragCommands } from "./editor-picker/host-drag-commands";
import { createHostDragSession } from "./editor-picker/host-drag-session";

interface PickerInspection {
  tag: string;
  instances: number;
  computed: Record<string, string>;
  parent: {
    display: string;
    flexDirection: string;
  } | null;
  rendered: boolean;
  missing?: boolean;
  ground?: Dynamic;
  pose?: Dynamic;
}
interface EditorPickerApi {
  [method: string]: Dynamic;
  enable(): void;
  disable(keepPreview?: boolean): void;
  enableRingsOnly(): void;
  disableRingsOnly(): void;
  pickAt(
    x: number,
    y: number,
    mode?: "plain" | "deep" | "deeper",
    selectedIds?: number[],
    textIds?: number[],
  ): Promise<
    | PickerHit
    | {
        empty: true;
      }
    | null
  > | null;
  pickIn(
    left: number,
    top: number,
    right: number,
    bottom: number,
    mode?: "plain" | "deep",
  ): Array<{
    tid: number;
    tag: string;
  }>;
  select(
    templateIds: number[] | number | null,
    componentName?: string | null,
    reason?: string,
    sequence?: number,
  ): void;
  hover(templateId: number | null, componentName?: string | null): void;
  hoverAt(
    x: number,
    y: number,
    selectedIds?: number[],
    deep?: boolean,
    textIds?: number[],
  ): void;
  setTool(tool: string, freehand?: boolean): void;
  setReadOnly(readOnly: boolean): void;
  setHostScale(scale: number): void;
  inspect(
    templateId: number,
    componentName: string | null,
    properties: string[],
    normalizeColors?: boolean,
    inherited?: boolean,
    ground?: boolean,
    pose?: boolean,
  ): PickerInspection | null;
}
(function (this: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic {
  if ((window as Dynamic).__dcEditorPicker) return;
  var DRAW_CURSOR: Dynamic =
    "url('data:image/svg+xml,%3Csvg%20xmlns=%22http://www.w3.org/2000/svg%22%20width=%2216%22%20height=%2216%22%20viewBox=%220%200%2016%2016%22%3E%3Cpath%20d=%22M2%2014l1-4%208-8a2.1%202.1%200%200%201%203%203l-8%208-4%201z%22%20fill=%22%23333%22%20stroke=%22%23fff%22%20stroke-width=%221%22/%3E%3C/svg%3E') 1 15, crosshair";
  var TOOL_CURSORS: Dynamic = {
    rect: "crosshair",
    frame: "crosshair",
    grid: "crosshair",
    oval: "crosshair",
    text: "text",
    arrow: "crosshair",
    line: "crosshair",
    draw: DRAW_CURSOR,
    interact: "",
  };
  var editorStylesheet: Dynamic = (document as Dynamic).createElement("style");
  editorStylesheet.setAttribute("data-dc-editor-style", "");
  editorStylesheet.textContent =
    'body:not([data-dc-editor-overlay-hidden]) [data-dc-editor-hover][data-dc-editor-hover-stroke]:not([data-dc-editor-selected]){filter:drop-shadow(0 0 calc(1*var(--dc-chrome-unit,1px)) color-mix(in srgb,#2a78d6 90%,transparent)) drop-shadow(0 0 calc(2*var(--dc-chrome-unit,1px)) color-mix(in srgb,#2a78d6 55%,transparent))!important;}body:not([data-dc-editor-overlay-hidden]):not([data-dc-editor-proxy="copy"]) [data-dc-editor-dragging],body:not([data-dc-editor-overlay-hidden]):not([data-dc-editor-proxy]) [data-dc-dragging],body[data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-drag-follower]{outline:calc(2*var(--dc-chrome-unit,1px)) solid #2a78d6!important;outline-offset:calc(-1*var(--dc-chrome-unit,1px))!important;opacity:0.55!important;}body[data-dc-editor-proxy="move"]:not([data-dc-editor-overlay-hidden]) [data-dc-editor-dragging],body[data-dc-editor-proxy="move"]:not([data-dc-editor-overlay-hidden]) [data-dc-dragging],body[data-dc-editor-proxy="move"]:not([data-dc-editor-overlay-hidden]) [data-dc-editor-dragging]>*,body[data-dc-editor-proxy="move"]:not([data-dc-editor-overlay-hidden]) [data-dc-dragging]>*{opacity:0!important;outline:none!important;}[data-dc-editor-drag-proxy],[data-dc-editor-drag-proxy] *{pointer-events:none!important;}body[data-dc-editor-on]:not([data-dc-editor-tool="interact"]) *{cursor:default!important;user-select:none!important;}body[data-dc-editor-on]:not([data-dc-editor-tool="interact"]) :not([data-dc-editor-overlay-root]):not([data-dc-editor-overlay-root] *){pointer-events:auto!important;transition:none!important;animation:none!important;}body[data-dc-editor-on][data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-editor-dragging]:not([data-dc-editor-overlay-root]) :not([data-dc-editor-overlay-root]),body[data-dc-editor-on][data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-dragging]:not([data-dc-editor-overlay-root]) :not([data-dc-editor-overlay-root]),body[data-dc-editor-on][data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-drag-follower]:not([data-dc-editor-overlay-root]),body[data-dc-editor-on][data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-drag-follower]:not([data-dc-editor-overlay-root]) :not([data-dc-editor-overlay-root]),body[data-dc-editor-move][data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-editor-dragging]:not([data-dc-editor-overlay-root]) :not([data-dc-editor-overlay-root]),body[data-dc-editor-move][data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-dragging]:not([data-dc-editor-overlay-root]) :not([data-dc-editor-overlay-root]),body[data-dc-editor-move][data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-drag-follower]:not([data-dc-editor-overlay-root]),body[data-dc-editor-move][data-dc-editor-brk]:not([data-dc-editor-overlay-hidden]) [data-dc-drag-follower]:not([data-dc-editor-overlay-root]) :not([data-dc-editor-overlay-root]){pointer-events:none!important;}body[data-dc-editor-move] :not([data-dc-editor-overlay-root]):not([data-dc-editor-overlay-root] *){pointer-events:auto!important;transition:none!important;animation-duration:0s!important;animation-delay:0s!important;}body[data-dc-editor-on][data-dc-editor-tool="rect"] *,body[data-dc-editor-on][data-dc-editor-tool="frame"] *,body[data-dc-editor-on][data-dc-editor-tool="grid"] *,body[data-dc-editor-on][data-dc-editor-tool="oval"] *,body[data-dc-editor-on][data-dc-editor-tool="arrow"] *,body[data-dc-editor-on][data-dc-editor-tool="line"] *{cursor:crosshair!important;}body[data-dc-editor-on][data-dc-editor-tool="text"] *{cursor:text!important;}body[data-dc-editor-on][data-dc-editor-tool="draw"] *{cursor:' +
    DRAW_CURSOR +
    '!important;}body[data-dc-editor-on]:not([data-dc-editor-tool]) [data-drags-parent],body[data-dc-editor-on]:not([data-dc-editor-tool]) [data-drags-parent] *{cursor:grab!important;}body[data-dc-editor-on]:not([data-dc-editor-tool]) [data-drags-parent]:active,body[data-dc-editor-on]:not([data-dc-editor-tool]) [data-drags-parent]:active *{cursor:grabbing!important;}body[data-dc-editor-on] [data-dc-editor-editing][contenteditable][contenteditable],body[data-dc-editor-on] [data-dc-editor-editing][contenteditable][contenteditable] *,body[data-dc-editor-on] [data-dc-editor-svg-editing]{cursor:text!important;}body[data-dc-editor-on] [data-dc-editor-editing="import"]{outline:none!important;}html:not([data-dc-canvas]):has(body[data-dc-editor-on]:not([data-dc-capturing]) .sc-host){background:var(--dc-editor-backdrop,#ededeb);}html:not([data-dc-canvas]) body[data-dc-editor-on]:not([data-dc-capturing]):has(.sc-host){background:var(--dc-editor-backdrop,#ededeb);}html:not([data-dc-canvas]) body[data-dc-editor-on] .sc-host:not(.sc-host .sc-host){min-height:calc(100vh - var(--dc-editor-host-vpad,0px));}html:not([data-dc-canvas]) body[data-dc-editor-on]:not([data-dc-capturing]) .sc-host:not(.sc-host .sc-host){background:var(--dc-editor-host-bg,#fff);}html[data-dc-frameless],html[data-dc-frameless] body[data-dc-editor-on],html[data-dc-frameless] body[data-dc-editor-on] .sc-host:not(.sc-host .sc-host){background:transparent!important;min-height:0!important;}html:has(body[data-dc-capturing]),body[data-dc-capturing]{transition:none!important;}html[data-dc-canvas]{overflow:hidden;}html[data-dc-canvas] body[data-dc-editor-on] .sc-host:not(.sc-host .sc-host)::before{content:"";position:absolute;left:-100000px;top:-100000px;width:200000px;height:200000px;pointer-events:none;background:repeating-linear-gradient(45deg,var(--dc-editor-hatch-ink,rgba(0,0,0,.05)) 0 8px,transparent 8px 16px);clip-path:polygon(0 0,100% 0,100% 50%,50% 50%,50% 100%,0 100%);}';
  var isMacPlatform: Dynamic = /Mac|iPhone|iPad/.test(
    (navigator as Dynamic).platform || "",
  );
  var supportsCommentShortcut: Dynamic =
    typeof MessageEvent == "function" &&
    "userActivation" in MessageEvent.prototype;
  var activeDropTokens: Dynamic = {};
  var activeDropTokenCount: Dynamic = 0;
  var readOnly: Dynamic = false;
  var hostPanZoom: Dynamic = false;
  var nativeScrollMode: Dynamic = false;
  var playbackPanZoom: Dynamic = false;
  var selectedTemplateIds: Dynamic = [];
  var selectedComponentName: Dynamic = null;
  var selectedPart: Dynamic = null;
  var selectedScopeElement: Dynamic = null;
  var textEditableTemplates: Dynamic = {};
  var textSeedByTemplate: Dynamic = {};
  var scriptTextValues: Dynamic = [];
  var tokenValueByName: Dynamic = {};
  var textTargetsByTemplate: Dynamic = {};
  var textMapReady: Dynamic = false;
  var describeComponentImport: Dynamic = function (
    this: Dynamic,
    tagName?: Dynamic,
    attributes?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (tagName !== "dc-import" && tagName !== "x-import") return null;
    const isCanvasImport: Dynamic = tagName === "dc-import";
    const globalComponent: Dynamic = attributes["component-from-global-scope"] || "";
    const component: Dynamic = attributes.component || "";
    const reference: Dynamic = isCanvasImport
      ? attributes.name || component
      : globalComponent || (attributes.from != null ? component : "");
    if (
      ((attributes.from || "") + " " + globalComponent + " " + component)
        .toLowerCase()
        .includes("deck-stage") ||
      reference.toLowerCase() === "image-slot"
    )
      return null;
    const scopeEndIndex: Dynamic = reference.lastIndexOf(isCanvasImport ? "/" : ".");
    const componentName: Dynamic = reference.slice(scopeEndIndex + 1);
    if (componentName === "" || reference.includes("{{")) return null;
    const descriptor: Dynamic = {
      kind: isCanvasImport
        ? "canvas"
        : attributes.from == null && globalComponent.includes(".")
          ? "system"
          : "module",
      ref: reference,
      name: componentName,
    };
    const rawScope: Dynamic = reference.slice(0, Math.max(scopeEndIndex, 0));
    const importScope: Dynamic = isCanvasImport
      ? rawScope
          .split("/")
          .filter(function (
            this: Dynamic,
            segment?: Dynamic,
            ..._unusedFilterArgs: Dynamic[]
          ): Dynamic {
            return segment !== "" && segment !== "." && segment !== "..";
          })
          .join("/")
      : rawScope;
    if (importScope !== "") {
      descriptor.scope = importScope;
    }
    return descriptor;
  };
  var collectImportedTemplateIds: Dynamic = function (
    this: Dynamic,
    html?: Dynamic,
    describeImport?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const importedTemplateIds: Dynamic = {};
    const importTagPattern: Dynamic = /<x-import\b((?:[^>"']|"[^"]*"|'[^']*')*)>/gi;
    const attributePattern: Dynamic = /\s([^\s=>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'))?/g;
    let importMatch: Dynamic;
    for (; (importMatch = importTagPattern.exec(html)) !== null; ) {
      const attributes: Dynamic = {};
      let attributeMatch: Dynamic;
      for (attributePattern.lastIndex = 0; (attributeMatch = attributePattern.exec(importMatch[1])) !== null; )
        attributes[attributeMatch[1].toLowerCase()] =
          attributeMatch[2] !== undefined
            ? attributeMatch[2]
            : attributeMatch[3] !== undefined
              ? attributeMatch[3]
              : "";
      const importedTemplateId: Dynamic = attributes["data-dc-tpl"];
      if (
        importedTemplateId !== undefined &&
        /^\d+$/.test(importedTemplateId) &&
        describeImport("x-import", attributes)
      ) {
        importedTemplateIds[importedTemplateId] = 1;
      }
    }
    return importedTemplateIds;
  };
  const elementQuery = createElementQuery({
    document,
    readAnnotatedTemplate: (name) => (window as Dynamic).__dcAnnotatedTemplate?.(name),
    describeImport: describeComponentImport,
    collectImportedIds: (template) => collectImportedTemplateIds(template, describeComponentImport),
    isUneditable: isUneditableElement,
    isDeckManaged: isDeckManagedElement,
    hasCustomElementDescendant,
    isTextTag: (tag) => textTagPattern.test(tag),
    isSelectableContainer,
  });
  const {
    editorRootName,
    findOuterComponentHost,
    findTemplateInstances,
    isEmptyArtboard,
    isNestedComponentImport,
    isUnselectedEmptyArtboard,
    normalizeComponentHit,
    singleRootStampedElement,
    stampedAncestorChain,
  } = elementQuery;
  const commentAnchors = createCommentAnchors(elementQuery);
  var CHROME_STROKE: Dynamic = "#2a78d6";
  let waitingAfterTextDetach = false;
  const textSession = createTextEditSession({
    readOnly: () => readOnly,
    canEditText: (id, name) => !!textEditableTemplates[templateKey(id, name)],
    textSeed: (id, name) => textSeedByTemplate[templateKey(id, name)],
    scriptTargets: (id, name) => textTargetsByTemplate[templateKey(id, name)],
    scriptValues: () => scriptTextValues,
    tokenValues: () => tokenValueByName,
    findTemplateInstances,
    elementViewportScale: (element) => elementViewportScale(element),
    overlayRoot: ensureOverlayRoot,
    chromePixels,
    chromeStroke: CHROME_STROKE,
    emit: emitEditorEvent,
    updateTouchPolicy: () => viewportGestures.updateTouchPolicy(),
    clearHover,
    resetLinkEdit: () => textFormatting.reset(),
    onDetachedImportedEdit: () => {
      waitingAfterTextDetach = document.hasFocus();
      if (!waitingAfterTextDetach) return;
      selectedTemplateIds = [];
      selectedComponentName = null;
      selectedPart = null;
      clearForeignSelection();
      repaintSelection();
      emitSelection();
    },
  });
  const svgTextEditor = textSession.svg;
  var hostScale: Dynamic = 1;
  function chromePixels(
    this: Dynamic,
    pixels?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return pixels / hostScale;
  }
  var measurementEnabled: Dynamic = false;
  function setMeasurementEnabled(
    this: Dynamic,
    nextEnabled?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (measurementEnabled !== !!nextEnabled) {
      measurementEnabled = !!nextEnabled;
      onContentMutation();
    }
  }
  var deepPickingEnabled: Dynamic = false;
  var lastPointer: Dynamic = null;
  var artboardHovered: Dynamic = false;
  function setDeepPickingEnabled(
    this: Dynamic,
    nextEnabled?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (deepPickingEnabled !== !!nextEnabled) {
      deepPickingEnabled = !!nextEnabled;
      refreshPointerHover();
    }
  }
  function refreshPointerHover(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      !(
        !lifecycle.enabled ||
        textSession.current ||
        activeTool !== "select" ||
        !pointerPresence.inside ||
        !lastPointer ||
        pendingDrag ||
        drawing.shapePending ||
        marquee.pending ||
        marquee.active ||
        drawing.penActive ||
        elementTransform.active ||
        strokeEndpoint.active ||
        drawing.shapeActive ||
        dragGesture
      )
    ) {
      hoverHitElement(
        (document as Dynamic).elementFromPoint(lastPointer.x, lastPointer.y),
      );
    }
  }
  function hoverHitElement(
    this: Dynamic,
    eventOrElement?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var hit: Dynamic = resolveHitTarget(
      eventOrElement,
      deepPickingEnabled ? "deep" : "click",
      selectedTemplateIds,
      selectedComponentName,
    );
    if (hit && hit.el && !hit.page) {
      setHoveredTemplate(
        hit.el.getAttribute("data-dc-tpl"),
        componentScopeName(hit.el),
      );
      return;
    }
    var targetElement: Dynamic =
      eventOrElement && eventOrElement.nodeType === 1
        ? eventOrElement
        : eventOrElement
          ? eventOrElement.target
          : null;
    hoverArtboard(
      hit === "empty" ||
        !!(hit && hit.page) ||
        (deepPickingEnabled &&
          hit === "unstamped" &&
          classifyForeignHit(targetElement) === "artboard"),
    );
  }
  function hoverArtboard(
    this: Dynamic,
    isHovered?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    artboardHovered = !!isHovered;
    clearHoverAttributes();
    selectionChrome.paint();
  }
  var pendingDrag: Dynamic = null;
  var dragGesture: Dynamic = null;
  const placementOverlay = createPlacementOverlay({
    overlayRoot: ensureOverlayRoot,
    strokeColor: CHROME_STROKE,
    cssPixels: chromePixels,
  });
  const {
    ensure: ensurePlacementOverlay,
    hide: hidePlacementOverlay,
    hideParent: hideParentPlacementBounds,
    showParent: showParentPlacementBounds,
  } = placementOverlay;
  const editorBackdrop = createEditorBackdrop(editorStylesheet, () => lifecycle.enabled);
  const stylePreview = createStylePreview({
    overlayRoot: ensureOverlayRoot,
    findTemplateInstances,
    isRootComponent,
    refreshChrome,
    emit: emitEditorEvent,
    reapplyActiveGestures() {
      elementTransform.reapply();
      sourceDragPreview.reapplyStyles();
    },
  });
  const {
    patch: patchElementStyles,
    clearPatches: clearStylePatches,
    queue: queueStylePreview,
  } = stylePreview;
  const sourceDragPreview = createSourceDragPreview({
    activeGesture: () => dragGesture,
    findInstances: findTemplateInstances,
    isFlowVisible: () => flowDropPreview.visible,
    paintFlow: (container, source, plan, group) => paintFlowInsertion(container, source, plan, group),
    clearPendingStyles: stylePreview.clearPending,
    patch: patchElementStyles,
    emit: emitEditorEvent,
  });
  const { dragged: currentDraggedElement, followerInstances: connectedFollowerInstances } = sourceDragPreview;
  const sourceDrag = createSourceDragRelease({
    releasePointer,
    clearSnapGuides() {
      if (absoluteDragSnapping.clear()) onContentMutation();
    },
    clearPendingStyles: stylePreview.clearPending,
    clearStylePatches,
    cancelMovePreview: sourceDragPreview.cancel,
    clearFlowOverlay: () => clearFlowOverlay(),
    hideParentPlacementBounds,
    hidePlacementBox: placementOverlay.hideBox,
    hideDragProxy,
    findTemplateInstances,
    currentDraggedElement,
    markDraggedElements,
    clearAttributeEverywhere,
    emit: emitEditorEvent,
    refreshChrome,
  });
  const hostTransfer = createHostDragSession({
    stroke: CHROME_STROKE,
    finishSource(key, commit) {
      if (!dragGesture || dragGesture.hostKey !== key) return false;
      finishDragGesture(commit);
      return true;
    },
    clearIndicators() {
      clearFlowOverlay();
      hideParentPlacementBounds();
    },
    clearPreview() {
      clearStylePatches();
      refreshChrome();
    },
    clearPress() { pendingDrag = null; },
  });
  const flowDropPreview = createFlowDropPreview({
    unwrap: unwrapDisplayContentsHost,
    templateId,
    overlayRoot: ensureOverlayRoot,
    isParked: () => Boolean(dragGesture?.parked),
    stroke: CHROME_STROKE,
  });
  const {
    children: flowChildren,
    plan: flowInsertionPlan,
    paint: paintFlowInsertion,
    clear: clearFlowOverlay,
  } = flowDropPreview;
  function hasControlModifier(
    this: Dynamic,
    keyEvent?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return !!keyEvent.ctrlKey;
  }
  function restoreResizeDimensions(
    this: Dynamic,
    style?: Dynamic,
    resizeState?: Dynamic,
    containerDisplay?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (resizeState.startW > 0) {
      style.width = +resizeState.startW.toFixed(2) + "px";
    }
    if (resizeState.startH > 0) {
      style.height = +resizeState.startH.toFixed(2) + "px";
    }
    var resetProperties: Dynamic = getDropStyleReset(resizeState.startLines, containerDisplay);
    for (var property in resetProperties) style[property] = resetProperties[property];
    return style;
  }
  const absoluteDragSnapping = createAbsoluteDragSnapping({
    gesture: () => dragGesture,
    usesNativeScroll: () => nativeScrollMode,
    chromePixels,
  });
  var mousePointerId: Dynamic = null;
  var isTouchPointer: Dynamic = false;
  const textPlacementInput = createTextPlacementInputGuard(() => lifecycle.enabled);
  function onEditorPointerDown(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    waitingAfterTextDetach = false;
    if (event.pointerType === "mouse") {
      mousePointerId = event.pointerId;
    }
    isTouchPointer = event.pointerType === "touch";
    suppressClick = false;
    if (event.button === 0) {
      pressedInsideTextEditor = eventInsideTextEditor(event);
    }
    textPlacementInput.beginFreshPress(event);
  }
  function onEditorPointerMove(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (event.pointerType === "mouse") {
      isTouchPointer = false;
    }
  }
  function capturePointer(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (mousePointerId != null)
      try {
        (document as Dynamic).documentElement.setPointerCapture(mousePointerId);
      } catch {}
  }
  function releasePointer(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (mousePointerId != null)
      try {
        (document as Dynamic).documentElement.releasePointerCapture(mousePointerId);
      } catch {}
  }
  var suppressClick: Dynamic = false;
  var pressedInsideTextEditor: Dynamic = false;
  var gestureKey: Dynamic = null;
  const forwardedDoubleClick = createForwardedDoubleClick();
  var foreignSelection: Dynamic = null;
  var activeTool: Dynamic = "select";
  var chromeRefreshPending: Dynamic = false;
  var layoutGeneration: Dynamic = 0;
  const { inferredElementScale, parentLayoutScale, elementViewportScale } =
    createViewportScaleReader(() => previewPanZoom.scale);
  const svgPreviewRollback = createSvgPreviewRollback();
  var overlayRoot: Dynamic = null;
  function ensureOverlayRoot(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!(overlayRoot && overlayRoot.isConnected)) {
      overlayRoot = (document as Dynamic).createElement("div");
      overlayRoot.setAttribute("data-dc-editor-overlay-root", "");
      overlayRoot.setAttribute("data-dc-editor-overlay", "");
      (document as Dynamic).documentElement.appendChild(overlayRoot);
    }
    return overlayRoot;
  }
  function templateKey(
    this: Dynamic,
    requestedTemplateId?: Dynamic,
    componentName?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return String(componentName || "") + "\0" + String(requestedTemplateId);
  }
  function clearAttributeEverywhere(
    this: Dynamic,
    attribute?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var elements: Dynamic = (document as Dynamic).querySelectorAll(
          "[" + attribute + "]",
        ),
        index: Dynamic = 0;
      index < elements.length;
      index++
    )
      elements[index].removeAttribute(attribute);
  }
  function selectElement(
    this: Dynamic,
    element?: Dynamic,
    additive?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    clearForeignSelection();
    var selectedTid: Dynamic = parseInt(element.getAttribute("data-dc-tpl"), 10);
    var componentName: Dynamic = componentScopeName(element);
    if (
      additive &&
      selectedComponentName === componentName &&
      selectedTemplateIds.length > 0
    ) {
      if (selectedTemplateIds.indexOf(selectedTid) < 0) {
        selectedTemplateIds.push(selectedTid);
      }
    } else {
      selectedTemplateIds = [selectedTid];
      selectedComponentName = componentName;
    }
    selectedPart = null;
    repaintSelection();
    emitSelection(sourceElementTag(element), undefined, additive);
  }
  const freehand = createFreehandEditing({
    isEnabled: () => lifecycle.enabled,
    selection: () => ({ ids: selectedTemplateIds, component: selectedComponentName }),
    findTemplateInstances,
    repaint: refreshChrome,
    emit: emitEditorEvent,
  });
  const {
    classifyForeignHit,
    editableDescendantAncestor,
    invalidateSelectionCache,
    lastFreehandAncestor,
    normalizePickElement,
    resolveHitTarget,
    resolvePickTarget,
    resolveSelectionAncestor,
    resolveTextPickTarget,
  } = createSelectionHit({
    document,
    elements: elementQuery,
    eventHitsOverlay: eventHitsEditorOverlay,
    isTouchPointer: () => isTouchPointer,
    isFreehandMode: () => freehand.inMode,
    isEditableFreehandPath: freehand.isEditable,
    isTextEditable,
  });
  function isTextEditable(
    this: Dynamic,
    element?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return !!textEditableTemplates[
      templateKey(
        parseInt(element.getAttribute("data-dc-tpl"), 10),
        nearestComponentName(element),
      )
    ];
  }
  const directiveSelection = createDirectiveSelection(findTemplateInstances, emitEditorEvent, repaintSelection);
  const { instances: templateOrDirectiveInstances, isRepeated: isRepeatedDirectiveElement } = directiveSelection;
  function clearHoverAttributes(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    clearAttributeEverywhere("data-dc-editor-hover");
    clearAttributeEverywhere("data-dc-editor-hover-stroke");
  }
  function clearHover(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    artboardHovered = false;
    clearHoverAttributes();
    selectionChrome.paint();
  }
  function setHoveredTemplate(
    this: Dynamic,
    requestedTemplateId?: Dynamic,
    componentName?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    artboardHovered = false;
    clearHoverAttributes();
    if (requestedTemplateId == null) {
      selectionChrome.paint();
      return;
    }
    templateOrDirectiveInstances(
      requestedTemplateId,
      componentName || null,
    ).forEach(function (
      this: Dynamic,
      element?: Dynamic,
      ..._unusedNestedArgs: Dynamic[]
    ): Dynamic {
      var layoutElement: Dynamic = unwrapDisplayContentsHost(element);
      var svgElement: Dynamic = outerSvgElement(layoutElement);
      var isEditableSvg: Dynamic = !!editableSvgGeometry(svgElement);
      if (isEditableSvg && !lifecycle.enabled) {
        if (layoutElement.hasAttribute("data-dc-editor-selected")) return;
        layoutElement = svgElement;
      }
      layoutElement.setAttribute("data-dc-editor-hover", "");
      if (isEditableSvg && lifecycle.enabled) {
        layoutElement.setAttribute("data-dc-editor-hover-stroke", "");
      }
    });
    selectionChrome.paint();
  }
  function repaintSelection(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    invalidateSelectionCache();
    clearAttributeEverywhere("data-dc-editor-selected");
    for (
      var selectionIndex: Dynamic = 0;
      selectionIndex < selectedTemplateIds.length;
      selectionIndex++
    )
      templateOrDirectiveInstances(
        selectedTemplateIds[selectionIndex],
        selectedComponentName,
      ).forEach(function (
        this: Dynamic,
        element?: Dynamic,
        ..._unusedNestedArgs: Dynamic[]
      ): Dynamic {
        unwrapDisplayContentsHost(element).setAttribute(
          "data-dc-editor-selected",
          "",
        );
      });
    refreshChrome();
  }
  function selectedInstanceCount(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var instanceCount: Dynamic = 0, selectionIndex: Dynamic = 0;
      selectionIndex < selectedTemplateIds.length;
      selectionIndex++
    )
      instanceCount += findTemplateInstances(
        selectedTemplateIds[selectionIndex],
        selectedComponentName,
      ).length;
    return instanceCount;
  }
  function stampedEventTarget(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var target: Dynamic = event.target;
    return !target || !target.closest || eventHitsEditorOverlay(event)
      ? null
      : target.closest("[data-dc-tpl]");
  }
  function emitEditorEvent(
    this: Dynamic,
    message?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (hostTransfer.intercept(message)) return;
    if (message.type !== "pointerAt")
      try {
        var debugState: Dynamic = ((window as Dynamic).__dcEditorDebug =
          (window as Dynamic).__dcEditorDebug || {});
        (debugState.lastEvents = debugState.lastEvents || []).push(message);
        if (debugState.lastEvents.length > 20) {
          debugState.lastEvents.shift();
        }
      } catch {}
    try {
      parent.postMessage(
        {
          __dcEditorEvt: message,
        },
        "*",
      );
    } catch {}
  }
  const { pickElementBounds, selectionBounds } = createSelectionBounds({
    findTemplateInstances,
    svgGeometryBounds,
  });
  function randomGestureKey(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var randomBytes: Dynamic = new Uint8Array(8);
    if (((window as Dynamic).crypto || {}).getRandomValues) {
      crypto.getRandomValues(randomBytes);
    } else {
      randomBytes.forEach(function (
        this: Dynamic,
        unusedByte?: Dynamic,
        byteIndex?: Dynamic,
        ..._unusedNestedArgs: Dynamic[]
      ): Dynamic {
        randomBytes[byteIndex] = (Math.random() * 256) | 0;
      });
    }
    for (
      var hexKey: Dynamic = "", index: Dynamic = 0;
      index < randomBytes.length;
      index++
    )
      hexKey += ("0" + randomBytes[index].toString(16)).slice(-2);
    return hexKey;
  }
  function sourceElementTag(
    this: Dynamic,
    element?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return element.hasAttribute("data-sc-name")
      ? "dc-import"
      : element.tagName.toLowerCase();
  }
  function editorElementTag(
    this: Dynamic,
    element?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return element.classList && element.classList.contains("sc-host-x")
      ? "x-import"
      : sourceElementTag(element);
  }
  var textTagPattern: Dynamic =
    /^(h[1-6]|p|button|label|li|blockquote|td|th|dt|dd|caption|figcaption|pre|time|a|abbr|b|bdi|bdo|br|cite|code|del|dfn|em|i|ins|kbd|mark|q|s|samp|small|span|strike|strong|sub|sup|u|var|wbr)$/i;
  function isTextElement(
    this: Dynamic,
    element?: Dynamic,
    textTemplateId?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return (
      textTagPattern.test(element.tagName) ||
      !!textEditableTemplates[
        templateKey(textTemplateId, nearestComponentName(element))
      ]
    );
  }
  var selectionSequence: Dynamic = 0;
  function emitSelection(
    this: Dynamic,
    selectionTag?: Dynamic,
    reason?: Dynamic,
    additive?: Dynamic,
    preserveSequence?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var tag: Dynamic =
      selectedComponentName + "|" + selectedTemplateIds.join(",");
    if (tag !== text) {
      elementTransform.resetSelectionRotation();
      text = tag;
    }
    if (reason == null && !preserveSequence) {
      selectionSequence++;
    }
    if (selectedTemplateIds.length === 0) {
      emitEditorEvent({
        type: "select",
        tids: null,
        re: reason,
        additive: !!additive,
        s: selectionSequence,
      });
      return;
    }
    emitEditorEvent({
      type: "select",
      tids: selectedTemplateIds.slice(),
      name: selectedComponentName,
      tag: selectionTag,
      instances: selectedInstanceCount(),
      rect: selectionBounds(selectedTemplateIds, selectedComponentName, selectedPart),
      part: selectedPart,
      embed: selectedEmbeddedTemplate(),
      re: reason,
      additive: !!additive,
      s: selectionSequence,
    });
  }
  function emitArtboardSelection(
    this: Dynamic,
    fillStyle?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    selectionSequence++;
    emitEditorEvent({
      type: "select",
      tids: null,
      artboard: true,
      additive: !!fillStyle,
      s: selectionSequence,
    });
  }
  function selectedEmbeddedTemplate(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!selectedScopeElement || !selectedScopeElement.isConnected || !selectedTemplateIds.length)
      return null;
    for (
      var fillStyle: Dynamic = findTemplateInstances(
          selectedTemplateIds[0],
          selectedComponentName,
        ),
        innerHTML: Dynamic = 0;
      innerHTML < fillStyle.length;
      innerHTML++
    )
      if (selectedScopeElement.contains(fillStyle[innerHTML]))
        return parseInt(selectedScopeElement.getAttribute("data-dc-tpl"), 10);
    return null;
  }
  var inlineBoxTags: Dynamic = {
    img: 1,
    svg: 1,
    video: 1,
    canvas: 1,
    iframe: 1,
    embed: 1,
    object: 1,
    input: 1,
    textarea: 1,
    select: 1,
    button: 1,
  };
  const { resolve: resolveDropContainer, ancestors: dropContainerAncestors } = createDropContainerFinder({
    findOuterComponentHost,
    findTemplateInstances,
  });
  function templateId(
    this: Dynamic,
    fillStyle?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    return parseInt(fillStyle.getAttribute("data-dc-tpl"), 10);
  }
  const captureDragProxy = createDragProxyCapture({
    overlayRoot: ensureOverlayRoot,
    parentScale: parentLayoutScale,
    strokeColor: CHROME_STROKE,
  });
  function isRootComponent(
    this: Dynamic,
    fillStyle?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var innerHTML: Dynamic =
      (window as Dynamic).__dcRootName && (window as Dynamic).__dcRootName();
    return !!innerHTML && fillStyle === innerHTML;
  }
  function afterPush() {
    svgPreviewRollback.clear();
    textSession.afterPush();
    invalidateSelectionCache();
    stylePreview.afterPush();
  }
  function exitDragGesture(copy: boolean) {
    if (dragGesture) sourceDrag.exit(dragGesture, copy);
  }
  function finishDragGesture(commit: boolean) {
    if (!dragGesture) return;
    const ended = dragGesture;
    dragGesture = null;
    sourceDrag.finish(ended, commit);
  }
  const marquee = createMarqueeSelection({
    rootName: () => findOuterComponentHost()?.getAttribute("data-sc-name") ?? null,
    selection: () => ({ tids: selectedTemplateIds, name: selectedComponentName }),
    foreignSelection: () => foreignSelection,
    takeGestureKey() {
      const key = gestureKey || randomGestureKey();
      gestureKey = null;
      return key;
    },
    overlayRoot: ensureOverlayRoot,
    chromePixels,
    stroke: CHROME_STROKE,
    candidates: selectableDescendants,
    findInstances: findTemplateInstances,
    unwrap: unwrapDisplayContentsHost,
    isRendered: isRenderedElement,
    removeAncestors: removeAncestorSelections,
    clearHover,
    clearForeignSelection,
    restoreForeignSelection: (element) => { foreignSelection = element; },
    replaceSelection({ tids, name }) {
      selectedTemplateIds = tids;
      selectedPart = null;
      selectedComponentName = name;
      repaintSelection();
    },
    notifySelection: (toggle, reason) => emitSelection(undefined, reason, toggle),
    emit: emitEditorEvent,
    refreshChrome,
  });
  const pendingInsertOverlays = createPendingInsertOverlays(repaintSelection);
  const drawing = createDrawingGestures({
    activeTool: () => activeTool,
    hostScale: () => hostScale,
    previewScale: () => previewPanZoom.scale,
    elementViewportScale,
    overlayRoot: ensureOverlayRoot,
    strokeColor: CHROME_STROKE,
    findContainer: createDrawingContainerFinder({
      activeTool: () => activeTool,
      canContainElements,
      forbiddenInParagraph,
      allowedChildTags: allowedTableChildren,
    }),
    hidePlacement: hidePlacementOverlay,
    watchPendingInsert: pendingInsertOverlays.watch,
    hasPendingInserts: () => pendingInsertOverlays.active,
    emit: emitEditorEvent,
  });
  function refreshChrome(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    selectionChrome.paint();
  }
  var text: Dynamic = "";
  const transformChrome = createSelectionTransformChrome({
    selection: () => ({ tids: selectedTemplateIds, name: selectedComponentName }),
    generation: () => layoutGeneration,
    canDrawHandles: () => lifecycle.enabled && selectedPart !== "text" && !textSession.current &&
      !dragGesture && !drawing.shapeActive && !marquee.active &&
      !document.body.hasAttribute("data-dc-editor-overlay-hidden"),
    isRootComponent,
    findTemplateInstances,
    isUneditableElement,
    isRepeatedDirectiveElement,
    authoredPositioning,
    editableLine: editableSvgGeometry,
    penInfo: freehand.penInfo,
    isInlineBox: (tag) => !!inlineBoxTags[tag],
    autoDimensions,
    viewportScale: elementViewportScale,
    parentScale: parentLayoutScale,
    readGroupPreview: () => elementTransform.groupPreview(),
    readSinglePreview: () => elementTransform.singlePreview(),
    selectionRotation: (members) => elementTransform.selectionRotation(members),
  });
  const elementTransform = createElementTransform({
    canStart: () => lifecycle.enabled && !textSession.current && !strokeEndpoint.active,
    selection: {
      read: () => ({ tids: selectedTemplateIds, name: selectedComponentName }),
      members: transformChrome.transformableMembers,
      findInstances: findTemplateInstances,
    },
    elements: {
      outerSvg: outerSvgElement,
      firstRendered: firstRenderedInstance,
      componentName: componentScopeName,
      unwrap: unwrapDisplayContentsHost,
      viewportScale: elementViewportScale,
      parentScale: parentLayoutScale,
      editableLine: editableSvgGeometry,
      isRoot: isRootComponent,
    },
    styles: {
      patch: patchElementStyles,
      queue: queueStylePreview,
      clearPending: stylePreview.clearPending,
    },
    svgRollback: svgPreviewRollback,
    activeTool: () => activeTool,
    emit: emitEditorEvent,
    refreshChrome,
  });
  const strokeEndpoint = createStrokeEndpointGesture({
    selectedLine() {
      if (!lifecycle.enabled || textSession.current || elementTransform.active || selectedTemplateIds.length !== 1) return null;
      const instances = findTemplateInstances(String(selectedTemplateIds[0]), selectedComponentName);
      const svg = instances.length ? outerSvgElement(firstRenderedInstance(instances) || instances[0]) : null;
      const geometry = svg ? editableSvgGeometry(svg) : null;
      if (!geometry) return null;
      return {
        svg,
        geometry,
        componentName: componentScopeName(svg),
        viewportScale: elementViewportScale(svg.parentElement) || elementViewportScale(svg) || 1,
      };
    },
    clearPendingPreview: svgPreviewRollback.clear,
    retainPreview: (snapshot) => svgPreviewRollback.retain([snapshot]),
    activeTool: () => activeTool,
    emit: emitEditorEvent,
    refreshChrome,
  });
  const selectionChrome = createSelectionChrome({
    isVisible: () => (lifecycle.enabled || lifecycle.ringsOnly) && !document.body.hasAttribute("data-dc-editor-overlay-hidden"),
    isArtboardHovered: () => artboardHovered,
    isGroupDragging: () => !!dragGesture?.group,
    readTransform: transformChrome.selectedTransformChrome,
    transformActive: () => elementTransform.active,
    endpointActive: () => strokeEndpoint.active,
    isTextPartSelected: () => selectedPart === "text" && selectedTemplateIds.length === 1,
    canMeasure: () => measurementEnabled && pointerPresence.inside && lifecycle.enabled && activeTool === "select" &&
      !textSession.current && selectedTemplateIds.length > 0 && !dragGesture &&
      !elementTransform.active && !strokeEndpoint.active && !marquee.active &&
      !drawing.shapeActive && !drawing.penActive && !drawing.hasPenOverlay,
    busyDrops: () => activeDropTokenCount > 0 ? activeDropTokens : null,
    readGuides: () => dragGesture && absoluteDragSnapping.guides,
    findOuterComponentHost,
    isNestedComponentImport,
    editableLine: editableSvgGeometry,
    svgBounds: svgGeometryBounds,
    rotatedPose: transformChrome.rotatedElementPose,
    onResize: onContentMutation,
    emit: emitEditorEvent,
  });
  function hasContentMutations(
    this: Dynamic,
    fillStyle?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var innerHTML: Dynamic = 0;
      innerHTML < fillStyle.length;
      innerHTML++
    ) {
      var position: Dynamic = fillStyle[innerHTML];
      if (
        position.type !== "attributes" ||
        String(position.attributeName || "").indexOf("data-dc-editor") !== 0
      )
        return true;
    }
    return false;
  }
  function onContentMutation(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    stylePreview.onContentMutation(event);
    if (event && event.length && hasContentMutations(event)) {
      layoutGeneration++;
    }
    if (!chromeRefreshPending) {
      chromeRefreshPending = true;
      requestAnimationFrame(function (
        this: Dynamic,
        ..._unusedNestedArgs: Dynamic[]
      ): Dynamic {
        chromeRefreshPending = false;
        sourceDragPreview.refreshParked();
        refreshChrome();
        directiveSelection.report();
      });
    }
  }
  function onEditorMouseUp(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    gestureKey = null;
    if (contextMenu.finishMouseUp(event, !!pendingDrag && !dragGesture, () => { suppressClick = true; })) return;
    pendingDrag = null;
    drawing.cancelPendingShape();
    marquee.cancelPending();
    svgTextEditor.releaseSelection();
    if (marquee.active) {
      suppressClick = true;
      selectionPress.clear();
      marquee.finish();
      return;
    }
    selectionPress.expire();
    if (drawing.penActive) {
      suppressClick = true;
      drawing.finishPenStroke(true);
      return;
    }
    if (strokeEndpoint.active) {
      suppressClick = true;
      strokeEndpoint.finish(true);
      return;
    }
    if (elementTransform.active) {
      suppressClick = true;
      elementTransform.finish(true);
      return;
    }
    if (drawing.shapeActive) {
      suppressClick = true;
      drawing.finishShape(true);
      return;
    }
    if (dragGesture) {
      suppressClick = true;
      if (dragGesture.exited) {
        dragGesture.droppedOut = true;
        emitEditorEvent({
          type: "dragDrop",
          gestureKey: dragGesture.gestureKey,
          x: event.clientX,
          y: event.clientY,
          alt: !!(dragGesture.alt || event.altKey),
          ctrl: !!event.ctrlKey,
        });
        finishDragGesture(false);
      } else {
        finishDragGesture(true);
      }
    }
  }
  const contextMenu = createPickerContextMenu({
    isMac: isMacPlatform,
    isEditing: () => lifecycle.enabled,
    isTextEditing: () => !!textSession.current,
    activeTool: () => activeTool,
    selection: () => ({ tids: selectedTemplateIds, name: selectedComponentName }),
    selectionBeforePress: () => selectionPress.previousSelection(),
    pendingDrag: () => pendingDrag,
    findTemplateInstances,
    eventTarget: stampedEventTarget,
    normalizeTarget: normalizePickElement,
    resolveAncestor: resolveSelectionAncestor,
    stampedAncestors: stampedAncestorChain,
    isNestedImport: isNestedComponentImport,
    suppressViewportMenu: () => viewportGestures.suppressContextMenu(),
    deferViewportMenu: (event) => viewportGestures.deferContextMenu(event),
    cancelGestures() {
      if (dragGesture) finishDragGesture(false);
      drawing.finishShape(false);
      elementTransform.finish(false);
      strokeEndpoint.finish(false);
      drawing.finishPenStroke(false);
      pendingDrag = null;
      drawing.cancelPendingShape();
      marquee.cancelPending();
      selectionPress.clear();
      marquee.finish(true);
    },
    replaceSelection(element) {
      clearForeignSelection();
      selectedTemplateIds = [templateId(element)];
      selectedPart = null;
      selectedComponentName = componentScopeName(element);
      repaintSelection();
      emitSelection(element.hasAttribute("data-sc-name") ? "dc-import" : element.tagName.toLowerCase());
    },
    emit: emitEditorEvent,
  });
  const previewPanZoom = createPreviewPanZoom({ isLocal: () => lifecycle.panZoomOnly, refreshChrome });
  const { scrollbars } = previewPanZoom;

  function onPreviewMessage(event: MessageEvent) {
    const message = event.data;
    if (message?.type === "__dc_cancel_preview_dbl") {
      previewClicks.cancel();
      mediaDrop.cancelPendingDrop();
      return;
    }
    if (!lifecycle.panZoomOnly) return;
    if (message?.type === "__dc_set_zoom") {
      if (message.fit === "width") previewPanZoom.fitWidth();
      else if (typeof message.scale === "number") previewPanZoom.zoomAt(message.scale, innerWidth / 2, innerHeight / 2);
    } else if (message?.type === "__dc_probe") {
      previewPanZoom.probe();
    }
  }
  function emitPanZoom(
    this: Dynamic,
    panZoomEnabled?: Dynamic,
    deltaX?: Dynamic,
    deltaY?: Dynamic,
    scaleDelta?: Dynamic,
    clientX?: Dynamic,
    clientY?: Dynamic,
    isImmediate?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    emitEditorEvent({
      type: "panZoom",
      pinch: !!panZoomEnabled,
      touch: !!isImmediate,
      dx: deltaX,
      dy: deltaY,
      dz: scaleDelta,
      x: clientX,
      y: clientY,
    });
  }
  const viewportMode = () => ({
    editing: lifecycle.enabled,
    tool: activeTool,
    local: lifecycle.panZoomOnly,
    host: hostPanZoom,
    playback: playbackPanZoom,
    nativeScroll: nativeScrollMode,
    textEditing: Boolean(textSession.current),
  });
  const onEditorWheel = createViewportWheel({
    mode: viewportMode,
    isPinching: () => viewportGestures.isPinching(),
    zoomLocally(delta, x, y) {
      previewPanZoom.zoomAt(previewPanZoom.scale * Math.exp(-delta * 0.01), x, y);
    },
    panLocally: previewPanZoom.panBy,
    clearGuides: clearFlowOverlay,
    sendPanZoom: emitPanZoom,
  });
  const viewportGestures = createViewportGestures({
    mode: viewportMode,
    scale: () => previewPanZoom.scale,
    zoomLocally(scale, x, y) {
      clearFlowOverlay();
      previewPanZoom.zoomAt(scale, x, y);
    },
    panZoom: emitPanZoom,
    holdPan: (on) => emitEditorEvent({ type: "panHold", on }),
    isOverlay: eventHitsEditorOverlay,
    pickTarget: stampedEventTarget,
    openMenu: contextMenu.openAt,
  });
  const mediaDrop = createPickerMediaDrop({
    isEditing: () => lifecycle.enabled,
    isReadOnly: () => readOnly,
    activeTool: () => activeTool,
    textMapReady: () => textMapReady,
    eventMatchesSelector,
    eventHitsEditorOverlay,
    showParentPlacementBounds,
    hideParentPlacementBounds,
    normalizeHit: normalizeComponentHit,
    canContainElements,
    elementViewportScale,
    emit: emitEditorEvent,
  });
  const {
    onEditorDragOver,
    onEditorDrop,
    onPreviewDragOver,
    onPreviewDrop,
    onPreviewDragStart,
    onPreviewDragEnter,
    onPreviewDragLeave,
    onPreviewDragEnd,
  } = mediaDrop;
  const clipboard = createPickerClipboard({
    overlayRoot: ensureOverlayRoot,
    canHandle: () =>
      lifecycle.enabled &&
      activeTool !== "interact" &&
      !textSession.current &&
      !dragGesture &&
      !drawing.shapeActive &&
      !elementTransform.active &&
      !strokeEndpoint.active &&
      !drawing.penActive &&
      !drawing.hasPenOverlay &&
      !marquee.active &&
      !marquee.pending,
    isReadOnly: () => readOnly,
    selection: () => ({ templateIds: selectedTemplateIds, componentName: selectedComponentName }),
    findInstances: findTemplateInstances,
    emit: emitEditorEvent,
  });
  const pointerPresence = createPointerPresence({
    hostIsDragging: () => hostTransfer.active,
    beforePointerLeaves() {
      contextMenu.cancelPending();
      lastPointer = null;
    },
    afterPointerLeaves() {
      clearHover();
      hidePlacementOverlay();
    },
    emit: emitEditorEvent,
  });
  const startSourceDrag = createSourceDragStart({
    createKey: randomGestureKey,
    activate(gesture) { dragGesture = gesture; },
    clearPress() { pendingDrag = null; },
    hostKey: () => hostTransfer.active ? hostTransfer.key : null,
    masksScroll: (axis) => Boolean(nativeScrollMode && canPageScrollAxis(axis)),
    elements: {
      find: findTemplateInstances,
      layoutBox: unwrapDisplayContentsHost,
      isRendered: isRenderedElement,
      isUneditable: isUneditableElement,
      isDeckManaged: isDeckManagedElement,
      isRepeated: isRepeatedDirectiveElement,
      enclosingDirective: directiveSelection.enclosingId,
      componentName: componentScopeName,
      id: templateId,
      isDrawing: hasSvgAncestor,
      outerHost: findOuterComponentHost,
      clearAttribute: clearAttributeEverywhere,
      lift: captureDragProxy,
    },
    layout: {
      parentScale: parentLayoutScale,
      elementScale: inferredElementScale,
      dropAncestors: dropContainerAncestors,
    },
    styles: {
      clearForeignSelection,
      authoredPosition: authoredPositioning,
      inheritedText: inheritedTextStyle,
    },
    selection: {
      read: () => ({ ids: selectedTemplateIds, name: selectedComponentName }),
      replace(id, name) {
        selectedTemplateIds = [id];
        selectedComponentName = name;
        selectedPart = null;
        repaintSelection();
      },
      emit(element, changed) {
        emitSelection(
          selectedTemplateIds.length === 1 ? sourceElementTag(element) : undefined,
          undefined,
          !changed,
        );
      },
    },
    emit: emitEditorEvent,
    capturePointer,
    finishPress() {
      contextMenu.cancelPending();
      selectionPress.clear();
      document.body.style.cursor = "grabbing";
      clearHover();
    },
  });
  function beginPendingDrag(pointer: Dynamic) {
    return startSourceDrag(pendingDrag, pointer);
  }
  const updateSourceDrag = createSourceDragMotion({
    exit: exitDragGesture,
    refreshChrome,
    emit: emitEditorEvent,
    isBreakoutModifier: hasControlModifier,
    preview: {
      cancel: sourceDragPreview.cancel,
      syncCopy: sourceDragPreview.syncCopy,
      positionProxy: (event, invalid) => positionDragProxy(dragGesture, event, invalid),
      hideProxy: hideDragProxy,
      emitFlow: sourceDragPreview.emitFlow,
    },
    elements: {
      dragged: currentDraggedElement,
      breakoutFollowers: sourceDragPreview.breakoutFollowers,
      group: sourceDragPreview.group,
      mark: markDraggedElements,
      isRootComponent,
      find: findTemplateInstances,
      followerInstances: connectedFollowerInstances,
    },
    drop: {
      resolve: resolveDropContainer,
      clearFlow: clearFlowOverlay,
      planFlow: flowInsertionPlan,
      paintFlow: paintFlowInsertion,
    },
    guides: {
      clearSnap: absoluteDragSnapping.clear,
      hideParent: hideParentPlacementBounds,
      showParent: showParentPlacementBounds,
      snapAbsolute: absoluteDragSnapping.snap,
      hideBox: placementOverlay.hideBox,
      ensureBox: ensurePlacementOverlay,
      cssPixels: chromePixels,
    },
    styles: {
      patch: patchElementStyles,
      queue: queueStylePreview,
      clearPending: stylePreview.clearPending,
      restoreResizeDimensions,
      inheritedText: inheritedTextStyle,
    },
  });
  function onEditorMouseMove(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!hostTransfer.active) {
      pointerPresence.noteInside();
    }
    if (!((!lifecycle.enabled && !hostTransfer.active) || textSession.current)) {
      setMeasurementEnabled(event.altKey);
      deepPickingEnabled = isMacPlatform ? !!event.metaKey : !!event.ctrlKey;
      lastPointer = {
        x: event.clientX,
        y: event.clientY,
      };
      if (
        event.buttons === 0 &&
        (pendingDrag ||
          drawing.shapePending ||
          marquee.pending ||
          marquee.active ||
          drawing.penActive ||
          elementTransform.active ||
          strokeEndpoint.active ||
          drawing.shapeActive ||
          dragGesture)
      ) {
        onEditorMouseUp(event);
      }
      if (drawing.move(event)) return;
      if (marquee.move(event)) return;
      if (activeTool !== "select" && activeTool !== "interact" && !hostTransfer.active) {
        placementOverlay.previewShape(activeTool, event);
        return;
      }
      if (activeTool !== "interact") {
        if (dragGesture) {
          updateSourceDrag(dragGesture, event);
          return;
        }
        if (pendingDrag) {
          var draggedElement: Dynamic = event.clientX - pendingDrag.x;
          var dropTarget: Dynamic = event.clientY - pendingDrag.y;
          if (
            draggedElement * draggedElement + dropTarget * dropTarget >
            (contextMenu.pending
              ? chromePixels(8) * chromePixels(8)
              : chromePixels(4) * chromePixels(4))
          ) {
            beginPendingDrag(event);
            return;
          }
        }
        if (activeTool !== "select") {
          clearHover();
          return;
        }
        hoverHitElement(event);
      }
    }
  }
  const textFormatting = createTextFormatting({
    current: () => textSession.current,
    templateId: () => textSession.templateId,
    emitState: () => textSession.emitState(true),
    emit: emitEditorEvent,
    finish: () => textSession.finish(),
  });
  const {
    onDoubleClick: onEditorDoubleClick,
    insideText: eventInsideTextEditor,
    insideSvg: eventInsideSvgTextEditor,
  } = createEditDoubleClick({
    isEditing: () => lifecycle.enabled,
    isReadOnly: () => readOnly,
    activeTool: () => activeTool,
    cancelForwarded: forwardedDoubleClick.cancel,
    suppressStale: textPlacementInput.suppressEditClick,
    currentText: () => textSession.current,
    pressedInsideTextEditor: () => pressedInsideTextEditor,
    isTextEditable,
    svgDoubleClick: (event) => svgTextEditor.onSvgTextDoubleClick(event),
    beginImported: textSession.beginImported,
    beginTemplate: textSession.beginTemplate,
    stampedTarget: stampedEventTarget,
    outerComponent: findOuterComponentHost,
    selection: () => ({ ids: selectedTemplateIds, component: selectedComponentName }),
    select: (element) => selectElement(element, false),
    selectScope(element, scope) {
      selectedScopeElement = scope;
      selectedTemplateIds = [templateId(element)];
      selectedPart = null;
      selectedComponentName = componentScopeName(element);
      repaintSelection();
      emitSelection(element.tagName.toLowerCase());
    },
    enterFreehand(element) {
      freehand.enter();
      if (selectedTemplateIds.length !== 1 || selectedTemplateIds[0] !== templateId(element) ||
          selectedComponentName !== componentScopeName(element)) selectElement(element, false);
    },
    normalizeComponent: normalizeComponentHit,
    normalizePick: normalizePickElement,
    resolveAncestor: resolveSelectionAncestor,
    lastFreehandAncestor,
    stampedAncestors: stampedAncestorChain,
    isRootComponent,
    emit: emitEditorEvent,
  });
  const previewClicks = createPreviewClicks({
    isEditing: () => lifecycle.enabled,
    isReadOnly: () => readOnly,
    isPlaying: () => playbackPanZoom,
    blocksDoubleClick: textPlacementInput.blocksPreviewDoubleClick,
    stampedTarget: stampedEventTarget,
    normalizeTarget: normalizeComponentHit,
    selectForEditing(element) {
      const id = templateId(element);
      const component = componentScopeName(element);
      if (selectedTemplateIds.length === 1 && selectedTemplateIds[0] === id &&
          selectedComponentName === component) return;
      clearForeignSelection();
      selectedTemplateIds = [id];
      selectedPart = null;
      selectedComponentName = component;
      repaintSelection();
      emitSelection(element.hasAttribute("data-sc-name") ? "dc-import" : element.tagName.toLowerCase());
    },
    textMapReady: () => textMapReady,
    beginTextEdit(element) {
      if (textEditableTemplates[templateKey(templateId(element), nearestComponentName(element))]) {
        textSession.beginTemplate(element);
      }
    },
    click: emitEditorEvent,
  });
  const insertedText = createInsertedTextEditor({
    enabled: () => lifecycle.enabled,
    readOnly: () => readOnly,
    editedElement: () => textSession.current?.el ?? null,
    findTemplateInstances,
    canEditText: (id, element) => !!textEditableTemplates[templateKey(id, nearestComponentName(element))],
    beginTextEdit: textSession.beginTemplate,
  });
  function onSlideChange(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      !(!lifecycle.enabled || (selectedTemplateIds.length === 0 && !foreignSelection)) &&
      !(
        textSession.current ||
        dragGesture ||
        marquee.active ||
        elementTransform.active ||
        strokeEndpoint.active ||
        drawing.penActive ||
        drawing.shapeActive ||
        drawing.hasPenOverlay
      )
    ) {
      var innerHTML: Dynamic = event.detail || {};
      if (
        !(
          innerHTML.reason === "init" ||
          innerHTML.index === innerHTML.previousIndex
        ) &&
        !(!innerHTML.slide || typeof innerHTML.slide.contains != "function")
      ) {
        var position: Dynamic = event.target;
        if (!(!position || !position.contains)) {
          for (
            var shaft: Dynamic =
                foreignSelection && foreignSelection.isConnected
                  ? [foreignSelection]
                  : [],
              tag: Dynamic = 0;
            tag < selectedTemplateIds.length + (shaft.length ? 1 : 0);
            tag++
          )
            for (
              var rot: Dynamic =
                  tag < selectedTemplateIds.length
                    ? templateOrDirectiveInstances(
                        selectedTemplateIds[tag],
                        selectedComponentName,
                      )
                    : shaft,
                ref: Dynamic = 0;
              ref < rot.length;
              ref++
            )
              if (
                rot[ref] === position ||
                !position.contains(rot[ref]) ||
                innerHTML.slide.contains(rot[ref])
              )
                return;
          selectedTemplateIds = [];
          selectedComponentName = null;
          selectedPart = null;
          clearForeignSelection();
          repaintSelection();
          emitSelection("slidechange");
        }
      }
    }
  }
  const planCrossBoardDrop = createCrossBoardDropPlanner({
    transfer: hostTransfer,
    textEditing: () => Boolean(textSession.current),
    rootName: () => (window as Dynamic).__dcRootName && (window as Dynamic).__dcRootName(),
    excludedElements(key, root) {
      const gesture = dragGesture;
      if (!gesture || gesture.hostKey !== key) return [];
      const excluded: Element[] = [];
      const dragged = currentDraggedElement();
      if (dragged) excluded.push(dragged);
      if (gesture.brkFollowers) {
        const followers = sourceDragPreview.breakoutFollowers(gesture);
        if (followers) {
          for (const id in followers) {
            if (followers[id]) excluded.push(followers[id]);
          }
        }
      }
      for (const follower of gesture.followers || []) {
        excluded.push(...connectedFollowerInstances(follower, gesture.name));
      }
      for (const member of gesture.group || []) {
        const instance = findTemplateInstances(String(member.tid), root)[0];
        if (instance) excluded.push(instance);
      }
      return excluded;
    },
    identify: templateId,
    resolve: (x, y, candidate, excluded) => resolveDropContainer(x, y, candidate, null, excluded),
    containerLocked: (element) =>
      isUneditableElement(element) ||
      isRepeatedDirectiveElement(element) ||
      element.namespaceURI === "http://www.w3.org/2000/svg",
    canNest: permitsElementNesting,
    insertion: (element, tid, x, y, previous, excluded) =>
      flowInsertionPlan(element, tid, null, x, y, previous, false, excluded),
    children: (element, excluded) => flowChildren(element, null, excluded),
    paintInsertion: (element, insertion, excluded, placeholderIndex) =>
      paintFlowInsertion(element, null, insertion, excluded, placeholderIndex),
    clearInsertion: clearFlowOverlay,
    showContainer: showParentPlacementBounds,
    clearContainer: hideParentPlacementBounds,
  });
  function updateDragModifiers(
    this: Dynamic,
    fillStyle?: Dynamic,
    innerHTML?: Dynamic,
    position?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      !(
        !dragGesture ||
        dragGesture.exited ||
        dragGesture.hostParked ||
        !dragGesture.lastPt
      )
    ) {
      var shaft: Dynamic = dragGesture.lastPt;
      onEditorMouseMove({
        clientX: shaft.x,
        clientY: shaft.y,
        buttons: 1,
        altKey: !!fillStyle,
        ctrlKey: !!innerHTML,
        metaKey: !!position,
        shiftKey: shaft.shift,
        target: null,
      });
    }
  }
  function onEditorBlur(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    waitingAfterTextDetach = false;
    setMeasurementEnabled(false);
    setDeepPickingEnabled(false);
    if (lifecycle.enabled) {
      emitEditorEvent({
        type: "modifierKey",
        key: "deep",
        on: false,
        blur: true,
      });
    }
    contextMenu.cancelPending();
    if (textSession.current && contextMenu.canNotifyTextBlur()) {
      emitEditorEvent({
        type: "textEditBlur",
      });
    }
  }
  const { onKeyDown: onEditorKeyDown, onKeyUp: onEditorKeyUp } = createPickerKeyboard({
    isMacPlatform,
    commentsEnabled: supportsCommentShortcut,
    isEnabled: () => lifecycle.enabled,
    readTextEdit: () => textSession.current,
    readState: () => ({
      readOnly,
      interacting: activeTool === "interact",
      waitingAfterTextDetach,
      textEdit: textSession.current,
      textPartSelected: selectedPart === "text",
      selectionCount: selectedTemplateIds.length,
      dragging: !!dragGesture,
      marquee: marquee.active,
      marqueePending: marquee.pending,
      drawing: !!drawing.shapeActive,
      transforming: elementTransform.active,
      movingStrokeEndpoint: strokeEndpoint.active,
      drawingPen: !!drawing.penActive,
      penOverlay: !!drawing.hasPenOverlay,
      penPathPreview: freehand.previewActive,
    }),
    setMeasurementEnabled,
    setDeepPickingEnabled,
    updateDragModifiers,
    finishDetachedTextEdit: textSession.finishDetachedImportedEdit,
    finishDetachedSvgEdit: textSession.finishDetachedSvgEdit,
    finishTextEdit: textSession.finish,
    clearTextDetachWait: () => { waitingAfterTextDetach = false; },
    suppressClick: () => { suppressClick = true; },
    cancelDrag: () => finishDragGesture(false),
    cancelMarquee: () => marquee.finish(true),
    cancelDrawingAndTransforms: () => {
      drawing.finishShape(false);
      elementTransform.finish(false);
      strokeEndpoint.finish(false);
      drawing.finishPenStroke(false);
    },
    cancelPenOverlay: () => drawing.finishPenDrawing(true, true),
    clearTextPartSelection: () => {
      selectedPart = null;
      repaintSelection();
      const [element] = findTemplateInstances(selectedTemplateIds[0], selectedComponentName);
      emitSelection(element ? sourceElementTag(element) : undefined, undefined, true);
    },
    hasRenderedSelection: () => selectedTemplateIds.some((id: number) =>
      !!firstRenderedInstance(templateOrDirectiveInstances(id, selectedComponentName)),
    ),
    openSelectionMenu: contextMenu.openForSelection,
    prepareCopyOrCut: clipboard.prepareCopyOrCut,
    schedulePasteFallback: clipboard.schedulePasteFallback,
    emit: emitEditorEvent,
  });
  const selectionPress = createSelectionPress({
    isMac: isMacPlatform,
    selection: () => ({ tids: selectedTemplateIds, name: selectedComponentName }),
    rootName: editorRootName,
    rootElement: singleRootStampedElement,
    resolveHit: resolveHitTarget,
    editableDescendant: editableDescendantAncestor,
    isTextEditable,
    isSelectableContainer,
    selectElement,
    selectArtboard: emitArtboardSelection,
    armMarquee: marquee.arm,
    armDrag(event, element, alreadySelected) {
      let target = declaredDragParent(event.target, element);
      if (!alreadySelected) target = normalizeInlineDragTarget(target);
      if (isUneditableElement(target) || isDeckManagedElement(target)) return;
      pendingDrag = {
        el: target,
        tid: templateId(target),
        name: componentScopeName(target),
        x: event.clientX,
        y: event.clientY,
      };
    },
  });
  textPlacementInput.install();
  function onEditorMouseDown(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      lifecycle.enabled &&
      !textPlacementInput.suppressEditClick(event) &&
      (event.type === "mousedown" &&
        ((suppressClick = false),
        (contextMenu.cancelPending()),
        event.button === 0 && (pressedInsideTextEditor = eventInsideTextEditor(event))),
      event.type === "mousedown" &&
        event.isTrusted &&
        (previewClicks.cancel(), (mediaDrop.cancelPendingDrop())),
      activeTool !== "interact")
    ) {
      if (eventInsideSvgTextEditor(event)) {
        event.preventDefault();
        event.stopPropagation();
        suppressClick = true;
        svgTextEditor.onSvgTextMouseDown(event);
        return;
      }
      if (
        !eventInsideTextEditor(event) &&
        !eventHitsEditorOverlay(event) &&
        (event.type === "mousedown" &&
          event.isTrusted &&
          ((gestureKey = event.button === 0 ? randomGestureKey() : null),
          emitEditorEvent(
            gestureKey
              ? {
                  type: "canvasPointerDown",
                  gestureKey: gestureKey,
                }
              : {
                  type: "canvasPointerDown",
                },
          )),
        event.preventDefault(),
        event.stopPropagation(),
        !readOnly)
      ) {
        if (
          event.type === "mousedown" &&
          event.button === 0 &&
          !textSession.current &&
          activeTool !== "select"
        ) {
          drawing.start(event);
          return;
        }
        if (
          event.type === "mousedown" &&
          event.button === 0 &&
          !textSession.current &&
          activeTool === "select"
        ) {
          selectionPress.start(event);
        }
      }
    }
  }
  var inlineBoxTags: Dynamic = {
    img: 1,
    svg: 1,
    video: 1,
    canvas: 1,
    iframe: 1,
    picture: 1,
    object: 1,
    embed: 1,
    audio: 1,
  };
  function normalizeInlineDragTarget(
    this: Dynamic,
    fillStyle?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var innerHTML: Dynamic = nearestComponentName(fillStyle);
      fillStyle &&
      getComputedStyle(fillStyle).display === "inline" &&
      !inlineBoxTags[(fillStyle.tagName || "").toLowerCase()];

    ) {
      var position: Dynamic = fillStyle.parentElement;
      if (
        !position ||
        !position.getAttribute ||
        position.getAttribute("data-dc-tpl") == null ||
        nearestComponentName(position) !== innerHTML
      )
        break;
      fillStyle = position;
    }
    return fillStyle;
  }
  function declaredDragParent(
    this: Dynamic,
    fillStyle?: Dynamic,
    innerHTML?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var position: Dynamic =
      fillStyle &&
      fillStyle.closest &&
      fillStyle.closest("[data-drags-parent]");
    if (!position) return innerHTML;
    var shaft: Dynamic = parseInt(
      position.getAttribute("data-drags-parent"),
      10,
    );
    if (!(shaft > 0)) return innerHTML;
    for (
      var tag: Dynamic = componentScopeName(position),
        rot: Dynamic = position,
        ref: Dynamic = 0;
      ref < shaft;
      ref++
    ) {
      var top: Dynamic = rot.parentElement;
      if (
        !top ||
        !top.getAttribute ||
        top.getAttribute("data-dc-tpl") == null ||
        componentScopeName(top) !== tag
      )
        break;
      rot = top;
    }
    return rot.getAttribute && rot.getAttribute("data-dc-tpl") != null
      ? rot
      : innerHTML;
  }
  function clearForeignSelection(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (foreignSelection) {
      try {
        foreignSelection.removeAttribute("data-dc-editor-selected");
      } catch {}
      foreignSelection = null;
    }
  }
  function onEditorAuxClick(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      !(
        !lifecycle.enabled ||
        activeTool === "interact" ||
        eventHitsEditorOverlay(event) ||
        eventInsideTextEditor(event)
      )
    ) {
      event.preventDefault();
    }
  }
  const selectOnClick = createSelectionClick({
    isMac: isMacPlatform,
    selection: () => ({ tids: selectedTemplateIds, name: selectedComponentName }),
    setSelection(tids, name, part) {
      selectedTemplateIds = tids;
      selectedComponentName = name;
      selectedPart = part;
    },
    takePress: selectionPress.take,
    resolveHit: resolveHitTarget,
    editableDescendant: editableDescendantAncestor,
    classifyForeignHit,
    isTextEditable,
    isTextElement,
    sourceElementTag,
    selectElement,
    selectArtboard: emitArtboardSelection,
    selectForeign(element, additive) {
      if (!additive) {
        selectedTemplateIds = [];
        selectedComponentName = null;
        selectedPart = null;
      }
      clearForeignSelection();
      repaintSelection();
      foreignSelection = element;
      const html = element.outerHTML;
      element.setAttribute("data-dc-editor-selected", "");
      emitEditorEvent({
        type: "select",
        tids: null,
        foreign: { tag: element.tagName.toLowerCase(), html, text: "" },
        additive,
        s: ++selectionSequence,
      });
    },
    emitSelection,
    clearForeignSelection,
    repaint: repaintSelection,
    doubleClick: onEditorDoubleClick,
  });
  function onEditorClick(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    (window as Dynamic).__dcEditorDebug = {
      clicks: (((window as Dynamic).__dcEditorDebug || {}).clicks || 0) + 1,
      enabled: lifecycle.enabled,
      tool: activeTool,
      suppressClick: suppressClick,
      editing: !!textSession.current,
    };
    if (!!lifecycle.enabled && !textPlacementInput.suppressEditClick(event)) {
      if (activeTool === "interact") {
        togglePreviewVideo(event);
        return;
      }
      if (!eventHitsEditorOverlay(event)) {
        if (suppressClick) {
          suppressClick = false;
          selectionPress.clear();
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (!textSession.current && activeTool === "select" && event.detail === 1 &&
            forwardedDoubleClick.take(event, chromePixels(5))) {
          selectionPress.clear();
          onEditorDoubleClick(event);
          return;
        }
        if (textSession.current) {
          if (eventInsideTextEditor(event)) {
            if (textSession.current.el.contains(event.target)) {
              event.stopPropagation();
            }
            if (textSession.current.importTarget) {
              event.preventDefault();
            }
            return;
          }
          var position: Dynamic = !!(
            event.target &&
            event.target.contains &&
            event.target.contains(textSession.current.el)
          );
          if (pressedInsideTextEditor && event.detail > 0 && position) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          if (event.detail === 0 && position) {
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          textSession.finish();
          return;
        }
        if (activeTool === "draw") {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        if (activeTool !== "select") {
          event.preventDefault();
          event.stopPropagation();
          if (activeTool === "text") {
            textPlacementInput.holdFrom(event.timeStamp);
          }
          drawing.insertAt(event);
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        selectOnClick(event);
      }
    }
  }
  function clearPendingSelection() {
    selectedTemplateIds = [];
    selectedComponentName = null;
    selectedPart = null;
    previewClicks.cancel();
    mediaDrop.cancelPendingDrop();
    insertedText.cancelWatch();
    mediaDrop.resetHover();
    textMapReady = false;
  }

  const lifecycle = createPickerLifecycle({
    stylesheet: editorStylesheet,
    editorInput: [
      [document, "mousemove", onEditorMouseMove, true],
      [document, "mouseover", pointerPresence.onMouseOver, true],
      [document, "mouseout", pointerPresence.onMouseOut, true],
      [document, "pointerdown", onEditorPointerDown, true],
      [document, "pointermove", onEditorPointerMove, { capture: true, passive: true }],
      [document, "mousedown", onEditorMouseDown, true],
      [document, "mouseup", onEditorMouseUp, true],
      [document, "click", onEditorClick, true],
      [document, "auxclick", onEditorAuxClick, true],
      [document, "contextmenu", contextMenu.onContextMenu, true],
      [document, "dblclick", onEditorDoubleClick, true],
      [document, "keydown", onEditorKeyDown, true],
      [document, "keyup", onEditorKeyUp, true],
      [window, "blur", onEditorBlur],
    ],
    editorTransfer: [
      [document, "dragover", onEditorDragOver, true],
      [document, "drop", onEditorDrop, true],
      [window, "paste", clipboard.onEditorPaste, true],
      [window, "copy", clipboard.onEditorCopyCut, true],
      [window, "cut", clipboard.onEditorCopyCut, true],
    ],
    previewInput: [
      [document, "dblclick", previewClicks.onDoubleClick, true],
      [document, "click", previewClicks.onClick, true],
      [document, "dragover", onPreviewDragOver, true],
      [document, "drop", onPreviewDrop, true],
      [document, "dragstart", onPreviewDragStart, true],
      [document, "dragenter", onPreviewDragEnter, true],
      [document, "dragleave", onPreviewDragLeave, true],
      [document, "dragend", onPreviewDragEnd, true],
    ],
    observeSlides: onSlideChange,
    onWheel: onEditorWheel,
    onPreviewMessage,
    onContentMutation,
    refreshChrome,
    clearHover,
    backdrop: editorBackdrop,
    chrome: selectionChrome,
    viewportGestures,
    preview: previewPanZoom,
    scrollbars,
    replayPendingInput() {
      previewClicks.replay();
      mediaDrop.replayPendingDrop();
      mediaDrop.resetHover();
    },
    cancelHostTransfer() {
      if (hostTransfer.active) hostTransfer.finish(false);
    },
    cancelEditingGestures() {
      if (textSession.current) textSession.finish(false);
      if (dragGesture) finishDragGesture(false);
      drawing.finishShape(false);
      elementTransform.finish(false);
      strokeEndpoint.finish(false);
      drawing.finishPenStroke(false);
      drawing.finishPenDrawing(false, false);
      pendingInsertOverlays.cancel();
      drawing.cancelPendingShape();
      marquee.cancelPending();
      marquee.finish(true);
      hidePlacementOverlay();
      clearFlowOverlay();
      clearForeignSelection();
    },
    clearStylePatches,
    clearEditingState() {
      pendingDrag = null;
      contextMenu.cancelPending();
      selectionPress.clear();
      freehand.reset();
      selectionChrome.clear();
      clipboard.cancelPendingPaste();
      clearPendingSelection();
      clearHover();
      clearAttributeEverywhere("data-dc-editor-selected");
    },
    clearPendingSelection,
    clearPointerModes() {
      measurementEnabled = false;
      waitingAfterTextDetach = false;
      deepPickingEnabled = false;
      lastPointer = null;
    },
    restoreAuthoredTemplate() {
      try {
        const page = window as Dynamic;
        const rootName = page.__dcRootName?.();
        const template = rootName && page.__dcTemplateSource?.(rootName);
        if (template != null) page.__dcUpdate(rootName, "html", template, false);
      } catch {}
    },
  });
  const selectionQueries = createSelectionQueries({
    isUnselectedEmptyArtboard,
    isEmptyArtboard,
    editorRootName,
    singleRootStampedElement,
    findOuterComponentHost,
    resolvePickTarget,
    resolveTextPickTarget,
    pickElementBounds,
    editorElementTag,
    findInstances: templateOrDirectiveInstances,
  });
  const hostDragCommands = createHostDragCommands({
    transfer: hostTransfer,
    activeDrag: () => dragGesture,
    canStart: () => !textSession.current && (!lifecycle.enabled || activeTool === "select"),
    rootName: () => (window as Dynamic).__dcRootName && (window as Dynamic).__dcRootName(),
    findInstances: findTemplateInstances,
    declaredDragParent,
    elementTag: editorElementTag,
    armSource(element, x, y) {
      pendingDrag = { el: element, tid: templateId(element), name: componentScopeName(element), x, y };
      contextMenu.cancelPending();
      selectionPress.clear();
    },
    beginSource: beginPendingDrag,
    updateSource: onEditorMouseMove,
    finishSource: finishDragGesture,
    exitSource: exitDragGesture,
    parkSource: sourceDrag.park,
    unparkSource: sourceDrag.unpark,
    clearDropIndicators() {
      clearFlowOverlay();
      hideParentPlacementBounds();
    },
    settlePreview() {
      clearStylePatches();
      svgPreviewRollback.settle();
      refreshChrome();
    },
  });
  var __dcEditorPicker: EditorPickerApi = {
    setHostPanZoom: function (
      this: Dynamic,
      mode?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (nativeScrollMode && mode !== "scroll" && mode !== "play") {
        (window as Dynamic).scrollTo(0, 0);
      }
      hostPanZoom = mode === true;
      playbackPanZoom = mode === "play";
      nativeScrollMode = mode === "scroll" || playbackPanZoom;
      viewportGestures.updateTouchPolicy();
    },
    enable: lifecycle.enable,
    disable: lifecycle.disable,
    enablePanZoomOnly: lifecycle.enablePanZoomOnly,
    setPanZoomArmed: lifecycle.setPanZoomArmed,
    setAppTheme: function (
      this: Dynamic,
      theme?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      var innerHTML: Dynamic = (document as Dynamic).documentElement;
      if (theme === "dark") {
        innerHTML.style.setProperty("--dc-editor-backdrop", "#171717");
        innerHTML.style.setProperty(
          "--dc-editor-hatch-ink",
          "rgba(250,249,245,.07)",
        );
      } else {
        innerHTML.style.removeProperty("--dc-editor-backdrop");
        innerHTML.style.removeProperty("--dc-editor-hatch-ink");
      }
    },
    setBusyDrops: function (
      this: Dynamic,
      busy?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      activeDropTokens = {};
      activeDropTokenCount = 0;
      for (
        var innerHTML: Dynamic = 0;
        busy && innerHTML < busy.length && innerHTML < 32;
        innerHTML++
      )
        if (
          typeof busy[innerHTML] == "string" &&
          /^[a-z0-9-]{1,48}$/.test(busy[innerHTML]) &&
          activeDropTokens[busy[innerHTML]] !== 1
        ) {
          activeDropTokens[busy[innerHTML]] = 1;
          activeDropTokenCount++;
        }
      refreshChrome();
    },
    enableRingsOnly: lifecycle.enableRingsOnly,
    disableRingsOnly: lifecycle.disableRingsOnly,
    ...selectionQueries,
    ...commentAnchors,
    getPanZoom: previewPanZoom.get,
    setPanZoom: previewPanZoom.set,
    repostChrome: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      selectionChrome.forgetPayload();
      refreshChrome();
    },
    cancelDrag: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (dragGesture) {
        suppressClick = true;
        finishDragGesture(false);
      }
    },
    cancelBox: function (
      this: Dynamic,
      restore?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (marquee.matchesGesture(restore)) {
        suppressClick = true;
        selectionPress.clear();
        pendingDrag = null;
        marquee.finish(true);
      }
    },
    armedByClick: forwardedDoubleClick.arm,
    dragModifiers: function (
      this: Dynamic,
      alt?: Dynamic,
      ctrl?: Dynamic,
      meta?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      updateDragModifiers(alt, ctrl, meta);
    },
    ...hostDragCommands,
    dropPlanAt: planCrossBoardDrop,
    contextMenuAt: function (
      this: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (!(!lifecycle.enabled || activeTool === "interact" || textSession.current)) {
        elementTransform.finish(false);
        strokeEndpoint.finish(false);
        emitEditorEvent({
          type: "contextMenu",
          x: +x || 0,
          y: +y || 0,
        });
      }
    },
    contextMenuBySelection: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (
        !(
          !lifecycle.enabled ||
          activeTool === "interact" ||
          textSession.current ||
          dragGesture ||
          marquee.active ||
          marquee.pending ||
          drawing.shapeActive ||
          elementTransform.active ||
          strokeEndpoint.active ||
          drawing.penActive ||
          drawing.hasPenOverlay ||
          freehand.previewActive
        )
      ) {
        contextMenu.openForSelection();
      }
    },
    resizeStart: function (
      this: Dynamic,
      direction?: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      elementTransform.startResize(String(direction), +x, +y);
    },
    resizeMove: function (
      this: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      preserveRatio?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      elementTransform.moveResize(+x, +y, !!preserveRatio);
    },
    resizeWith: function (
      this: Dynamic,
      options?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      elementTransform.setCropStyles(options);
    },
    resizeEnd: function (
      this: Dynamic,
      commit?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      elementTransform.finish(!!commit);
    },
    rotateStart: function (
      this: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      options?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      elementTransform.startRotation(+y, +options);
    },
    rotateMove: function (
      this: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      snap?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      elementTransform.moveRotation(+x, +y, !!snap);
    },
    rotateEnd: function (
      this: Dynamic,
      commit?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      elementTransform.finish(!!commit);
    },
    endpointStart: function (
      this: Dynamic,
      which?: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      strokeEndpoint.start(+which == 1 ? 1 : 0, +x, +y);
    },
    endpointMove: function (
      this: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      snap?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      strokeEndpoint.move(+x, +y, !!snap);
    },
    endpointEnd: function (
      this: Dynamic,
      commit?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      strokeEndpoint.finish(!!commit);
    },
    penPreview: freehand.preview,
    penCommit: freehand.commit,
    setHostScale: function (
      this: Dynamic,
      scale?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      var innerHTML: Dynamic = Number(scale);
      var position: Dynamic =
        isFinite(innerHTML) && innerHTML > 0 ? innerHTML : 1;
      if (position !== hostScale) {
        hostScale = position;
        (document as Dynamic).documentElement.style.setProperty(
          "--dc-chrome-unit",
          1 / hostScale + "px",
        );
      }
    },
    setTextEditable: function (
      this: Dynamic,
      templates?: Dynamic,
      componentName?: Dynamic,
      imports?: Dynamic,
      metadata?: Dynamic,
      scriptTargets?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      textEditableTemplates = {};
      textSeedByTemplate = {};
      scriptTextValues = imports || [];
      tokenValueByName = metadata || {};
      textTargetsByTemplate = {};
      (scriptTargets || []).forEach(function (
        this: Dynamic,
        rot?: Dynamic,
        ..._unusedNestedArgs: Dynamic[]
      ): Dynamic {
        textTargetsByTemplate[templateKey(rot.tid, componentName)] = rot.targets;
      });
      textMapReady = true;
      (templates || []).forEach(function (
        this: Dynamic,
        rot?: Dynamic,
        ..._unusedNestedArgs: Dynamic[]
      ): Dynamic {
        var ref: Dynamic = typeof rot == "number" ? rot : rot.tid;
        textEditableTemplates[templateKey(ref, componentName)] = true;
        if (rot && rot.seed != null) {
          textSeedByTemplate[templateKey(ref, componentName)] = rot.seed;
        }
      });
      previewClicks.replay();
      mediaDrop.replayPendingDrop();
      insertedText.markMapped();
    },
    setDirectiveMap: directiveSelection.setMap,
    setMeasure: function (
      this: Dynamic,
      requestedEnabled?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (lifecycle.enabled) {
        setMeasurementEnabled(requestedEnabled);
      }
    },
    setDeep: function (
      this: Dynamic,
      requestedEnabled?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (lifecycle.enabled) {
        setDeepPickingEnabled(requestedEnabled);
      }
    },
    setReadOnly: function (
      this: Dynamic,
      requestedReadOnly?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      readOnly = !!requestedReadOnly;
      if (readOnly) {
        if (activeTool !== "select") {
          __dcEditorPicker.setTool("select");
        }
        previewClicks.cancel();
        mediaDrop.cancelPendingDrop();
        insertedText.cancelWatch();
        if (textSession.current) {
          textSession.finish(false);
        }
        if (hostTransfer.active) {
          hostTransfer.finish(false);
        }
        if (dragGesture) {
          finishDragGesture(false);
        }
        drawing.finishShape(false);
        elementTransform.finish(false);
        strokeEndpoint.finish(false);
        drawing.finishPenStroke(false);
        drawing.finishPenDrawing(false, false);
        pendingInsertOverlays.cancel();
        drawing.cancelPendingShape();
        marquee.cancelPending();
        marquee.finish(true);
        hidePlacementOverlay();
      }
    },
    setTool: function (
      this: Dynamic,
      tool?: Dynamic,
      freehandMode?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      var position: Dynamic = readOnly ? "select" : tool || "select";
      if (activeTool === "draw" && position !== "draw") {
        drawing.finishPenDrawing(true, false);
      }
      freehand.setMode(freehandMode);
      activeTool = position;
      if (activeTool === "select") {
        (document as Dynamic).body.removeAttribute("data-dc-editor-tool");
      } else {
        (document as Dynamic).body.setAttribute(
          "data-dc-editor-tool",
          activeTool,
        );
      }
      (document as Dynamic).body.style.cursor = TOOL_CURSORS[activeTool] || "";
      if (
        activeTool !== "rect" &&
        activeTool !== "oval" &&
        activeTool !== "frame" &&
        activeTool !== "grid" &&
        activeTool !== "text"
      ) {
        hidePlacementOverlay();
      }
      if (activeTool !== "select") {
        clearHover();
      }
      viewportGestures.updateTouchPolicy();
    },
    patchStyle: stylePreview.patchStyle,
    holdStyle: stylePreview.holdStyle,
    unpatchStyle: stylePreview.unpatchStyle,
    setScrubbing: stylePreview.setScrubbing,
    afterPush: afterPush,
    dropLeftCopy: textSession.dropLeftCopy,
    setOverlayHidden: function (
      this: Dynamic,
      hidden?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (hidden) {
        (document as Dynamic).body.setAttribute(
          "data-dc-editor-overlay-hidden",
          "",
        );
      } else {
        (document as Dynamic).body.removeAttribute(
          "data-dc-editor-overlay-hidden",
        );
      }
      scrollbars.setHidden(hidden);
      refreshChrome();
    },
    startTextEdit: function (
      this: Dynamic,
      requestedTemplateId?: Dynamic,
      componentName?: Dynamic,
      caret?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      var shaft: Dynamic = findTemplateInstances(
        String(requestedTemplateId),
        componentName || null,
      );
      if (textSession.current && shaft.indexOf(textSession.current.svg || textSession.current.el) >= 0) {
        textSession.focus(caret);
        return;
      }
      if (shaft.length > 0) {
        textSession.beginTemplate(shaft[0], caret);
      }
    },
    textPlacing: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      textPlacementInput.holdFrom(performance.now());
    },
    noteTextInsert: insertedText.noteInsert,
    startInsertedTextEdit: insertedText.start,
    heldTextKey: insertedText.heldTextKey,
    dropInsertedTextEdit: insertedText.drop,
    startTextEditAt: function (
      this: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      mode?: Dynamic,
      selectedIds?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      var tag: Dynamic = (document as Dynamic).elementFromPoint(x, y);
      var rot: Dynamic =
        tag && tag.closest ? tag.closest("[data-dc-tpl]") : null;
      var ref: Dynamic =
        rot &&
        normalizeComponentHit(rot) === rot &&
        textEditableTemplates[
          templateKey(
            parseInt(rot.getAttribute("data-dc-tpl"), 10),
            nearestComponentName(rot),
          )
        ];
      if (!ref && mode != null) {
        rot =
          findTemplateInstances(String(mode), selectedIds || null)[0] || null;
      }
      if (!(!rot || normalizeComponentHit(rot) !== rot)) {
        var top: Dynamic = parseInt(rot.getAttribute("data-dc-tpl"), 10);
        if (
          textEditableTemplates[templateKey(top, nearestComponentName(rot))]
        ) {
          clearForeignSelection();
          selectedTemplateIds = [top];
          selectedPart = null;
          selectedComponentName = componentScopeName(rot);
          repaintSelection();
          emitSelection(rot.tagName.toLowerCase());
          textSession.beginTemplate(rot);
        }
      }
    },
    clearPart: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      selectedPart = null;
      repaintSelection();
      var fillStyle: Dynamic =
        selectedTemplateIds.length === 1
          ? findTemplateInstances(selectedTemplateIds[0], selectedComponentName)
          : [];
      emitSelection(
        fillStyle.length ? sourceElementTag(fillStyle[0]) : undefined,
      );
    },
    repaintSelected: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      repaintSelection();
      if (foreignSelection && foreignSelection.isConnected) {
        foreignSelection.setAttribute("data-dc-editor-selected", "");
        refreshChrome();
      }
    },
    select: function (
      this: Dynamic,
      templateIds?: Dynamic,
      componentName?: Dynamic,
      reason?: Dynamic,
      sequence?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (
        !marquee.active &&
        !(typeof sequence == "number" && sequence < selectionSequence)
      ) {
        if (
          (templateIds == null ||
            ((Array as Dynamic).isArray(templateIds) &&
              templateIds.length === 0)) &&
          pendingDrag &&
          !dragGesture
        ) {
          pendingDrag = null;
          selectionPress.clear();
        }
        clearForeignSelection();
        var tag: Dynamic = (Array as Dynamic).isArray(templateIds)
          ? templateIds.slice()
          : templateIds == null
            ? []
            : [templateIds];
        var rot: Dynamic = (tag.length && componentName) || null;
        var ref: Dynamic =
          tag.length === selectedTemplateIds.length &&
          rot === selectedComponentName &&
          tag.every(function (
            this: Dynamic,
            bottom?: Dynamic,
            left?: Dynamic,
            ..._unusedNestedArgs: Dynamic[]
          ): Dynamic {
            return bottom === selectedTemplateIds[left];
          });
        if (!ref) {
          waitingAfterTextDetach = false;
        }
        selectedTemplateIds = tag;
        if (!ref) {
          selectedPart = null;
        }
        selectedComponentName = rot;
        repaintSelection();
        if (!ref) {
          emitSelection(
            undefined,
            typeof reason == "string" ? reason : undefined,
            false,
            true,
          );
        }
        textSession.restoreScroll();
      }
    },
    hover: function (
      this: Dynamic,
      requestedTemplateId?: Dynamic,
      componentName?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      setHoveredTemplate(requestedTemplateId, componentName);
    },
    hoverAt: function (
      this: Dynamic,
      x?: Dynamic,
      y?: Dynamic,
      selectedIds?: Dynamic,
      deep?: Dynamic,
      textIds?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (!(!lifecycle.ringsOnly && !lifecycle.enabled)) {
        var clientX: Dynamic = Number(x);
        var clientY: Dynamic = Number(y);
        if (isFinite(clientX) && isFinite(clientY)) {
          lastPointer = {
            x: clientX,
            y: clientY,
          };
        }
        var pointElement: Dynamic =
          isFinite(clientX) && isFinite(clientY)
            ? (document as Dynamic).elementFromPoint(clientX, clientY)
            : null;
        var validSelectedIds: Dynamic = (Array as Dynamic).isArray(selectedIds)
          ? selectedIds.filter(function (
              this: Dynamic,
              tid?: Dynamic,
              ..._unusedNestedArgs: Dynamic[]
            ): Dynamic {
              return typeof tid == "number" && isFinite(tid);
            })
          : [];
        var target: Dynamic = resolvePickTarget(
          pointElement,
          deep ? "deep" : "plain",
          validSelectedIds,
        );
        if (!target) {
          hoverArtboard(!!pointElement && (!!deep || isUnselectedEmptyArtboard(validSelectedIds)));
          return;
        }
        if (target.page) {
          hoverArtboard(true);
          return;
        }
        var hoveredElement: Dynamic =
          (!deep && resolveTextPickTarget(target.el, target.hit, textIds)) ||
          target.el;
        setHoveredTemplate(
          hoveredElement.getAttribute("data-dc-tpl"),
          componentScopeName(hoveredElement),
        );
      }
    },
    finishEdit: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      return textSession.detach();
    },
    repostTextEditState: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      textSession.emitState(true);
    },
    format: textFormatting.format,
    applyLink: textFormatting.applyLink,
    cancelLinkEdit: textFormatting.cancelLinkEdit,
    deleteForeign: function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (!foreignSelection || !foreignSelection.parentElement) return null;
      textSession.discardInside(foreignSelection);
      foreignSelection.removeAttribute("data-dc-editor-selected");
      foreignSelection.removeAttribute("data-dc-editor-hover");
      foreignSelection.removeAttribute("data-dc-editor-hover-stroke");
      var fillStyle: Dynamic = {
        tag: foreignSelection.tagName.toLowerCase(),
        html: foreignSelection.outerHTML.slice(0, 4e3),
        text: (foreignSelection.innerText || "").slice(0, 4e3),
      };
      foreignSelection.parentElement.removeChild(foreignSelection);
      foreignSelection = null;
      return fillStyle;
    },
    stampLive,
    applyBody: function (
      this: Dynamic,
      html?: Dynamic,
      keepScroll?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      var position: Dynamic =
        (document as Dynamic).scrollingElement ||
        (document as Dynamic).documentElement;
      var shaft: Dynamic = position ? position.scrollLeft : 0;
      var tag: Dynamic = position ? position.scrollTop : 0;
      if (textSession.current) {
        textSession.finish();
      }
      (document as Dynamic).body.innerHTML = html;
      __dcEditorPicker.stampLive(keepScroll);
      repaintSelection();
      refreshChrome();
      if (position) {
        position.scrollLeft = shaft;
        position.scrollTop = tag;
      }
    },
    bodySnapshot,
    firstTextFont,
    inspect: createElementInspector(findTemplateInstances),
    verify: verifyPreviewStructure,
  };
  observeFramelessContentHull(previewPanZoom.isIdentity, emitEditorEvent);
  pointerPresence.install();
  (window as Dynamic).__dcEditorPicker = __dcEditorPicker;
})();
