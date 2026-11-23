import type { Dynamic } from "../../runtime-types";

interface SvgTextEditorOptions {
  readSession(): Dynamic;
  finishDetachedEdit(): boolean;
  overlayRoot(): HTMLElement;
  chromePixels(size: number): number;
  chromeStroke: string;
}

export function createSvgTextEditorController(options: SvgTextEditorOptions) {
  function svgPointToViewport(
    this: Dynamic,
    element?: Dynamic,
    x?: Dynamic,
    y?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var screenMatrix: Dynamic = element.getScreenCTM();
    if (screenMatrix && (screenMatrix.b || screenMatrix.c)) {
      var projectedPoint: Dynamic = new DOMPoint(x, y).matrixTransform(screenMatrix);
      return {
        x: projectedPoint.x,
        y: projectedPoint.y,
      };
    }
    var textElement: Dynamic = (element.closest && element.closest("text")) || element;
    var localBounds: Dynamic = textElement.getBBox();
    var viewportBounds: Dynamic = textElement.getBoundingClientRect();
    var viewportScale: Dynamic =
      localBounds.width > 0 && viewportBounds.width > 0 ? viewportBounds.width / localBounds.width : 1;
    return {
      x: viewportBounds.left + (x - localBounds.x) * viewportScale,
      y: viewportBounds.top + (y - localBounds.y) * viewportScale,
    };
  }
  function svgCharacterPositions(
    this: Dynamic,
    svgText?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var glyphStops: Dynamic = [];
    var caretStops: Dynamic = [];
    var characterCount: Dynamic = 0;
    var characterIndex: Dynamic;
    var firstDrawnIndex: Dynamic = -1;
    var lastDrawnIndex: Dynamic = -1;
    try {
      characterCount = svgText.getNumberOfChars();
    } catch {}
    for (characterIndex = 0; characterIndex < characterCount; characterIndex++) {
      var glyphStop: Dynamic = null;
      try {
        if (svgText.getExtentOfChar(characterIndex).width > 0) {
          var localStart: Dynamic = svgText.getStartPositionOfChar(characterIndex);
          var localEnd: Dynamic = svgText.getEndPositionOfChar(characterIndex);
          var viewportStart: Dynamic = svgPointToViewport(svgText, localStart.x, localStart.y);
          var viewportEnd: Dynamic = svgPointToViewport(
            svgText,
            localEnd.x,
            localEnd.y,
          );
          glyphStop = {
            x: viewportStart.x,
            y: viewportStart.y,
            ex: viewportEnd.x,
            ey: viewportEnd.y,
            ang: Math.atan2(viewportEnd.y - viewportStart.y, viewportEnd.x - viewportStart.x),
            w: Math.sqrt(
              (viewportEnd.x - viewportStart.x) * (viewportEnd.x - viewportStart.x) +
                (viewportEnd.y - viewportStart.y) * (viewportEnd.y - viewportStart.y),
            ),
            drawn: true,
          };
          if (firstDrawnIndex < 0) {
            firstDrawnIndex = characterIndex;
          }
          lastDrawnIndex = characterIndex;
        }
      } catch {}
      glyphStops.push(glyphStop);
    }
    if (firstDrawnIndex < 0) return caretStops;
    var afterLastStop: Dynamic = {
      x: glyphStops[lastDrawnIndex].ex,
      y: glyphStops[lastDrawnIndex].ey,
      ang: glyphStops[lastDrawnIndex].ang,
      w: 0,
      drawn: true,
    };
    for (characterIndex = 0; characterIndex <= characterCount; characterIndex++)
      if (characterIndex < characterCount && glyphStops[characterIndex]) caretStops.push(glyphStops[characterIndex]);
      else if (characterIndex > lastDrawnIndex)
        caretStops.push(
          characterIndex === lastDrawnIndex + 1
            ? afterLastStop
            : {
                x: afterLastStop.x,
                y: afterLastStop.y,
                ang: afterLastStop.ang,
                w: 0,
                drawn: false,
              },
        );
      else {
        for (var nextDrawnIndex: Dynamic = characterIndex; !glyphStops[nextDrawnIndex]; ) nextDrawnIndex++;
        caretStops.push({
          x: glyphStops[nextDrawnIndex].x,
          y: glyphStops[nextDrawnIndex].y,
          ang: glyphStops[nextDrawnIndex].ang,
          w: 0,
          drawn: false,
        });
      }
    return caretStops;
  }
  function svgCaretAtPointer(
    this: Dynamic,
    svgText?: Dynamic,
    pointer?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var caretStops: Dynamic = svgCharacterPositions(svgText),
        nearestIndex: Dynamic = 0,
        nearestDistanceSquared: Dynamic = 1 / 0,
        stopIndex: Dynamic = 0;
      stopIndex < caretStops.length;
      stopIndex++
    )
      if (caretStops[stopIndex].drawn) {
        var distanceSquared: Dynamic =
          (caretStops[stopIndex].x - pointer.clientX) *
            (caretStops[stopIndex].x - pointer.clientX) +
          (caretStops[stopIndex].y - pointer.clientY) *
            (caretStops[stopIndex].y - pointer.clientY);
        if (distanceSquared < nearestDistanceSquared) {
          nearestDistanceSquared = distanceSquared;
          nearestIndex = stopIndex;
        }
      }
    return nearestIndex;
  }
  function textEditSelectionOffsets(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const textEdit = options.readSession();
    var editor: Dynamic = textEdit.el;
    var selection: Dynamic = getSelection();
    var textLength: Dynamic = (editor.textContent || "").length;
    function textOffset(
      this: Dynamic,
      selectionNode?: Dynamic,
      nodeOffset?: Dynamic,
      ..._unusedNestedArgs: Dynamic[]
    ): Dynamic {
      if (!selectionNode || !editor.contains(selectionNode)) return textLength;
      if (selectionNode === editor) {
        for (
          var precedingLength: Dynamic = 0, childIndex: Dynamic = 0;
          childIndex < nodeOffset && childIndex < editor.childNodes.length;
          childIndex++
        )
          precedingLength += (editor.childNodes[childIndex].textContent || "").length;
        return precedingLength;
      }
      for (
        var textWalker: Dynamic = (document as Dynamic).createTreeWalker(
            editor,
            NodeFilter.SHOW_TEXT,
          ),
          textNode: Dynamic,
          scannedLength: Dynamic = 0;
        (textNode = textWalker.nextNode());

      ) {
        if (textNode === selectionNode) return scannedLength + nodeOffset;
        scannedLength += textNode.nodeValue.length;
      }
      return textLength;
    }
    return !selection ||
      !selection.rangeCount ||
      !editor.contains(selection.anchorNode)
      ? [textLength, textLength]
      : [
          textOffset(selection.anchorNode, selection.anchorOffset),
          textOffset(selection.focusNode, selection.focusOffset),
        ];
  }
  function setTextEditSelection(
    this: Dynamic,
    anchorOffset?: Dynamic,
    focusOffset?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const textEdit = options.readSession();
    var editor: Dynamic = textEdit.el;
    var selection: Dynamic = getSelection();
    function locateOffset(
      this: Dynamic,
      offset?: Dynamic,
      ..._unusedNestedArgs: Dynamic[]
    ): Dynamic {
      var textWalker: Dynamic = (document as Dynamic).createTreeWalker(
        editor,
        NodeFilter.SHOW_TEXT,
      );
      var textNode: Dynamic;
      var lastNode: Dynamic = null;
      for (offset = Math.max(0, offset); (textNode = textWalker.nextNode()); ) {
        if (offset <= textNode.nodeValue.length) return [textNode, offset];
        offset -= textNode.nodeValue.length;
        lastNode = textNode;
      }
      return lastNode ? [lastNode, lastNode.nodeValue.length] : [editor, 0];
    }
    var anchor: Dynamic = locateOffset(anchorOffset);
    var focus: Dynamic = locateOffset(focusOffset);
    editor.focus();
    selection.setBaseAndExtent(anchor[0], anchor[1], focus[0], focus[1]);
    repaintSvgTextSelection();
  }
  var svgTextMarks: Dynamic = [];
  var svgTextMarkCount: Dynamic = 0;
  function clearSvgTextMarks(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var markIndex: Dynamic = 0;
      markIndex < svgTextMarks.length;
      markIndex++
    )
      svgTextMarks[markIndex].remove();
    svgTextMarks = [];
    svgTextMarkCount = 0;
  }
  function hideUnusedSvgTextMarks(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (
      var markIndex: Dynamic = svgTextMarkCount;
      markIndex < svgTextMarks.length;
      markIndex++
    )
      svgTextMarks[markIndex].style.display = "none";
  }
  function appendSvgTextMark(
    this: Dynamic,
    stop?: Dynamic,
    markWidth?: Dynamic,
    fontSize?: Dynamic,
    isCaret?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var mark: Dynamic = svgTextMarks[svgTextMarkCount++];
    if (!mark) {
      mark = (document as Dynamic).createElement("div");
      mark.setAttribute("data-dc-editor-overlay", "");
      options.overlayRoot().appendChild(mark);
      svgTextMarks.push(mark);
    }
    mark.setAttribute("data-dc-editor-svg-mark", isCaret ? "caret" : "sel");
    mark.style.cssText =
      "position:fixed;left:0;top:0;pointer-events:none;z-index:2147483646;transform-origin:0 0;width:" +
      (isCaret ? options.chromePixels(1.5) : markWidth) +
      "px;height:" +
      fontSize * 1.05 +
      "px;background:" +
      (isCaret
        ? options.chromeStroke
        : "color-mix(in srgb," + options.chromeStroke + " 32%,transparent)") +
      ";transform:translate(" +
      stop.x +
      "px," +
      stop.y +
      "px) rotate(" +
      stop.ang +
      "rad) translate(0," +
      -fontSize * 0.88 +
      "px);";
    var animations: Dynamic = mark.getAnimations ? mark.getAnimations() : [];
    if (isCaret && !animations.length && mark.animate) {
      mark.animate(
        [
          {
            opacity: 1,
          },
          {
            opacity: 1,
            offset: 0.5,
          },
          {
            opacity: 0,
            offset: 0.5,
          },
          {
            opacity: 0,
          },
        ],
        {
          duration: 1e3,
          iterations: 1 / 0,
        },
      );
    }
    for (var animationIndex: Dynamic = 0; animationIndex < animations.length; animationIndex++)
      if (isCaret) {
        animations[animationIndex].currentTime = 0;
      } else {
        animations[animationIndex].cancel();
      }
  }
  function repaintSvgTextSelection(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const textEdit = options.readSession();
    svgTextMarkCount = 0;
    if (!textEdit || !textEdit.svg || !textEdit.svg.isConnected) {
      hideUnusedSvgTextMarks();
      return;
    }
    var svgText: Dynamic = textEdit.svg;
    var caretStops: Dynamic = svgCharacterPositions(svgText);
    var fontSize: Dynamic =
      (parseFloat(getComputedStyle(svgText).fontSize) || 16) *
      svgTextViewportScale(svgText);
    var offsets: Dynamic = textEditSelectionOffsets();
    var rangeStart: Dynamic = Math.min(offsets[0], offsets[1]);
    var rangeEnd: Dynamic = Math.max(offsets[0], offsets[1]);
    var lastStopIndex: Dynamic = caretStops.length - 1;
    if (lastStopIndex < 0) {
      if (textEdit.lastStop) {
        appendSvgTextMark(textEdit.lastStop, 0, fontSize, true);
      }
    } else if (rangeStart === rangeEnd || rangeEnd > lastStopIndex + 1) {
      textEdit.lastStop = caretStops[Math.min(rangeStart, lastStopIndex)];
      appendSvgTextMark(textEdit.lastStop, 0, fontSize, true);
    } else {
      for (var stopIndex: Dynamic = rangeStart; stopIndex < rangeEnd && stopIndex < lastStopIndex; stopIndex++)
        if (
          caretStops[stopIndex].w > 0 &&
          !(
            stopIndex > rangeStart &&
            caretStops[stopIndex].x === caretStops[stopIndex - 1].x &&
            caretStops[stopIndex].y === caretStops[stopIndex - 1].y
          )
        ) {
          appendSvgTextMark(caretStops[stopIndex], caretStops[stopIndex].w, fontSize, false);
        }
      textEdit.lastStop = caretStops[Math.min(rangeEnd, lastStopIndex)];
    }
    hideUnusedSvgTextMarks();
  }
  var svgSelectionAnchor: Dynamic = null;
  var svgClickState: Dynamic = null;
  function onSvgTextMouseDown(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const textEdit = options.readSession();
    if (event.button === 0) {
      if (event.detail >= 3) {
        svgSelectionAnchor = null;
        setTextEditSelection(0, (textEdit.el.textContent || "").length);
        return;
      }
      var hitOffset: Dynamic = svgCaretAtPointer(textEdit.svg, event);
      var offsets: Dynamic = textEditSelectionOffsets();
      svgClickState = {
        x: event.clientX,
        y: event.clientY,
        moved: false,
      };
      svgSelectionAnchor = event.shiftKey ? offsets[0] : hitOffset;
      setTextEditSelection(svgSelectionAnchor, hitOffset);
    }
  }
  function onSvgTextMouseMove(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const textEdit = options.readSession();
    if (svgSelectionAnchor == null || !textEdit || !textEdit.svg) {
      svgSelectionAnchor = null;
      return;
    }
    if (!(event.buttons & 1)) {
      svgSelectionAnchor = null;
      return;
    }
    if (
      svgClickState &&
      Math.abs(event.clientX - svgClickState.x) +
        Math.abs(event.clientY - svgClickState.y) >
        4
    ) {
      svgClickState.moved = true;
    }
    setTextEditSelection(
      svgSelectionAnchor,
      svgCaretAtPointer(textEdit.svg, event),
    );
  }
  function onSvgTextDoubleClick(
    this: Dynamic,
    event?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const textEdit = options.readSession();
    if (!(svgClickState && svgClickState.moved)) {
      for (
        var text: Dynamic = textEdit.el.textContent || "",
          hitOffset: Dynamic = svgCaretAtPointer(textEdit.svg, event),
          wordStart: Dynamic = hitOffset,
          wordEnd: Dynamic = hitOffset;
        wordStart > 0 && /\S/.test(text.charAt(wordStart - 1));

      )
        wordStart--;
      for (; wordEnd < text.length && /\S/.test(text.charAt(wordEnd)); )
        wordEnd++;
      setTextEditSelection(wordStart, wordEnd);
    }
  }
  function positionSvgTextEditor(
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const textEdit = options.readSession();
    if (!(!textEdit || !textEdit.svg || options.finishDetachedEdit())) {
      var bounds: Dynamic = textEdit.svg.getBoundingClientRect();
      var editor: Dynamic = textEdit.el;
      if (bounds.width > 0) {
        editor.style.left = bounds.left + "px";
        editor.style.top = bounds.top + "px";
        editor.style.width = bounds.width + "px";
        editor.style.height = Math.max(bounds.height, 1) + "px";
      }
      repaintSvgTextSelection();
    }
  }
  function createSvgTextEditor(
    this: Dynamic,
    svgText?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    const textEdit = options.readSession();
    var computedStyle: Dynamic = getComputedStyle(svgText);
    var editor: Dynamic = (document as Dynamic).createElement("div");
    textEdit.svgPre = /^(pre|pre-wrap|break-spaces)$/.test(
      computedStyle.whiteSpace,
    );
    textEdit.startText = textEdit.svgPre
      ? svgText.textContent
      : normalizedSvgText(svgText);
    textEdit.svgWs = svgText.style.getPropertyValue("white-space");
    svgText.style.setProperty("white-space", "pre");
    svgText.setAttribute("data-dc-editor-svg-editing", "");
    editor.setAttribute("data-dc-editor-overlay", "");
    editor.setAttribute("data-dc-editor-svg-text", "");
    editor.setAttribute("role", "textbox");
    editor.setAttribute("aria-label", "Edit text");
    editor.style.cssText =
      "position:fixed;left:0;top:0;z-index:2147483646;opacity:0;pointer-events:none;overflow:hidden;white-space:pre;outline:none;font-size:" +
      computedStyle.fontSize +
      ";";
    svgText.textContent = "";
    textEdit.svgText = svgText.appendChild(
      (document as Dynamic).createTextNode(textEdit.startText),
    );
    editor.textContent = textEdit.startText;
    options.overlayRoot().appendChild(editor);
    return editor;
  }

  function attach(element: SVGElement) {
    const editor = createSvgTextEditor(element);
    const session = options.readSession();
    session.svg = element;
    session.el = editor;
    document.addEventListener("scroll", positionSvgTextEditor, true);
    document.addEventListener("mousemove", onSvgTextMouseMove, true);
    return editor;
  }

  function detach(session: Dynamic) {
    document.removeEventListener("scroll", positionSvgTextEditor, true);
    document.removeEventListener("mousemove", onSvgTextMouseMove, true);
    clearSvgTextMarks();
    svgSelectionAnchor = null;
    session.el.remove();
    session.el = session.svg;
    session.svg.removeAttribute("data-dc-editor-svg-editing");
    if (session.svgWs) session.svg.style.setProperty("white-space", session.svgWs);
    else session.svg.style.removeProperty("white-space");
    if (!session.svg.getAttribute("style")) session.svg.removeAttribute("style");
    if (!session.svgPre) session.svg.textContent = normalizedSvgText(session.svg);
  }

  return {
    attach,
    detach,
    releaseSelection() { svgSelectionAnchor = null; },
    repaintSvgTextSelection,
    positionSvgTextEditor,
    onSvgTextDoubleClick,
    onSvgTextMouseDown,
  };
}

export function svgTextViewportScale(
  this: Dynamic,
  svgText?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  try {
    var screenMatrix: Dynamic = svgText.getScreenCTM();
    var matrixScale: Dynamic =
      (screenMatrix &&
        Math.sqrt(screenMatrix.a * screenMatrix.a + screenMatrix.b * screenMatrix.b)) ||
      1;
    if (screenMatrix && (screenMatrix.b || screenMatrix.c)) return matrixScale;
    var textElement: Dynamic =
      (svgText.closest && svgText.closest("text")) || svgText;
    var localBounds: Dynamic = textElement.getBBox();
    var viewportBounds: Dynamic = textElement.getBoundingClientRect();
    return localBounds.width > 0 && viewportBounds.width > 0 ? viewportBounds.width / localBounds.width : matrixScale;
  } catch {
    return 1;
  }
}
function normalizedSvgText(
  this: Dynamic,
  svgText?: Dynamic,
  ..._unusedArgs: Dynamic[]
): Dynamic {
  var collapsedText: Dynamic = (svgText.textContent || "").replace(
    /[ \t\r\n\f]+/g,
    " ",
  );
  var characterCount: Dynamic = -1;
  try {
    characterCount = svgText.getNumberOfChars();
  } catch {}
  if (collapsedText.length === characterCount) return collapsedText;
  if (
    collapsedText.length > 1 &&
    collapsedText.charAt(0) === " " &&
    collapsedText.charAt(collapsedText.length - 1) === " " &&
    collapsedText.length - 1 === characterCount
  ) {
    var textElement: Dynamic = svgText.closest && svgText.closest("text");
    var precedingText: Dynamic = "";
    if (textElement && textElement !== svgText) {
      var precedingRange: Dynamic = (document as Dynamic).createRange();
      precedingRange.setStart(textElement, 0);
      precedingRange.setEndBefore(svgText);
      precedingText = precedingRange.toString();
    }
    return /\S/.test(precedingText) ? collapsedText.slice(0, -1) : collapsedText.slice(1);
  }
  return collapsedText.replace(/^ | $/g, "");
}
