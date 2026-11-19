/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

function captureElementStyle(
  doc?: Dynamic,
  getComputedStyle?: Dynamic,
  rootContext?: Dynamic,
  styleOutput?: Dynamic,
  extraOutput?: Dynamic,
  detailElement?: Dynamic,
  deviceScale?: Dynamic,
): Dynamic {
  let cssUnitPattern: Dynamic =
      /^((border-(top|right|bottom|left)|outline|column-rule)-width|outline-offset)$/,
    count: Dynamic = 1,
    index: Dynamic = 0,
    ancestorDepth: Dynamic = 0,
    previousParent: Dynamic = null,
    previousStyles: Dynamic = null,
    items: Dynamic = [1, 1],
    callback: Dynamic = (element?: Dynamic): Dynamic =>
      element.assignedSlot ||
      element.parentElement ||
      (element.getRootNode().host ?? null),
    transformPoint: Dynamic = (point?: Dynamic, styles?: Dynamic): Dynamic => {
      let matrixMatch: Dynamic = /^matrix\(([^)]+)\)$/.exec(
          styles.transform || "none",
        ),
        matrixValues: Dynamic = matrixMatch
          ? matrixMatch[1].split(",").map(Number)
          : [1, 0, 0, 1],
        scaleValues: Dynamic =
          (styles.scale || "none") === "none"
            ? [1, 1]
            : styles.scale.split(" ").map(Number),
        transformScale: Dynamic =
          (matrixMatch !== null || (styles.transform || "none") === "none") &&
          matrixValues[1] === 0 &&
          matrixValues[2] === 0 &&
          (styles.rotate || "none") === "none" &&
          scaleValues.length < 3,
        [scaleFactorsX, scaleFactorsY]: Dynamic = [
          Math.abs(matrixValues[0] * scaleValues[0]),
          Math.abs(matrixValues[3] * (scaleValues[1] ?? scaleValues[0])),
        ];
      return point && transformScale && scaleFactorsX > 0 && scaleFactorsY > 0
        ? [point[0] * scaleFactorsX, point[1] * scaleFactorsY]
        : null;
    },
    formatDimension: Dynamic = (
      rawValue?: Dynamic,
      boundsElement?: Dynamic,
      styles?: Dynamic,
      fallback?: Dynamic,
    ): Dynamic => {
      let parsedValue: Dynamic = parseFloat(rawValue),
        precisionFactor: Dynamic = 64 * (deviceScale || 1) * count,
        roundingEpsilon: Dynamic =
          0.5 *
            Math.pow(
              10,
              Math.max(1, Math.floor(Math.log10(Math.max(parsedValue, 1))) + 1) -
                6,
            ) +
          parsedValue * 24e-8,
        lowerBound: Dynamic = Math.ceil((parsedValue - roundingEpsilon) * precisionFactor),
        upperBound: Dynamic = Math.floor((parsedValue + roundingEpsilon) * precisionFactor);
      if (upperBound > lowerBound) {
        if (fallback === undefined) return rawValue;
        let parseDimension: Dynamic = (cssValue?: Dynamic): Dynamic => {
            let numericValue: Dynamic = parseFloat(cssValue) || 0,
              epsilon: Dynamic =
                (0.5 *
                  Math.pow(
                    10,
                    Math.max(
                      1,
                      Math.floor(Math.log10(Math.max(numericValue, 1))) + 1,
                    ) - 6,
                  ) +
                  numericValue * 24e-8) *
                precisionFactor,
              [roundedValues, roundedFallback]: Dynamic = [
                Math.floor(numericValue * precisionFactor - epsilon),
                Math.floor(numericValue * precisionFactor + epsilon),
              ];
            return Math.abs(
              numericValue * precisionFactor - Math.round(numericValue * precisionFactor),
            ) < 1e-6
              ? Math.round(numericValue * precisionFactor)
              : roundedValues === roundedFallback
                ? roundedValues
                : NaN;
          },
          parseBorderWidth: Dynamic = (cssValue?: Dynamic): Dynamic =>
            Math.round((parseFloat(cssValue) || 0) * precisionFactor),
          bounds: Dynamic = boundsElement.getBoundingClientRect(),
          subpixelOffset: Dynamic =
            styles.boxSizing === "border-box"
              ? 0
              : fallback
                ? parseDimension(styles.paddingLeft) +
                  parseDimension(styles.paddingRight) +
                  parseBorderWidth(styles.borderLeftWidth) +
                  parseBorderWidth(styles.borderRightWidth)
                : parseDimension(styles.paddingTop) +
                  parseDimension(styles.paddingBottom) +
                  parseBorderWidth(styles.borderTopWidth) +
                  parseBorderWidth(styles.borderBottomWidth),
          candidateValue: Dynamic = items
            ? Math.round(
                (fallback
                  ? bounds.width / items[0]
                  : bounds.height / items[1]) *
                  64 *
                  (deviceScale || 1),
              ) - subpixelOffset
            : -1;
        lowerBound =
          candidateValue >= lowerBound && candidateValue <= upperBound ? candidateValue : upperBound;
      }
      return upperBound < lowerBound
        ? rawValue
        : ((lowerBound + 0.25) / precisionFactor).toFixed(7) + "px";
    },
    urlPattern: Dynamic =
      /^[A-Z_a-z\xC0-\xD6\xD8-\xF6\xF8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}][-.0-9A-Z_a-z\xB7\xC0-\xD6\xD8-\xF6\xF8-\u037D\u037F-\u1FFF\u200C\u200D\u203F\u2040\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u{10000}-\u{EFFFF}]*$/u,
    hasUnsafeQuote: Dynamic = (text?: Dynamic): Dynamic =>
      text.indexOf("]]>") >= 0 ||
      /[{};"'\x00-\x1f]|\/\*/.test(
        text.replace(/"(?:[^"\\\n\r\f]|\\.)*"|'(?:[^'\\\n\r\f]|\\.)*'/g, ""),
      ),
    cssUrlPattern: Dynamic = /(^|[\s,(/])url\((?!\s*["']?(data:|#))/,
    captureCssProperties: Dynamic = (styles?: Dynamic, properties?: Dynamic): Dynamic => {
      let text: Dynamic = "";
      for (let propertyIndex: Dynamic = 0; propertyIndex < properties.length; propertyIndex++) {
        let propertyName: Dynamic = properties[propertyIndex],
          propertyValue: Dynamic = styles.getPropertyValue(propertyName);
        !propertyValue ||
          propertyName === "content" ||
          propertyName === "-webkit-border-image" ||
          propertyName.slice(0, 2) === "--" ||
          hasUnsafeQuote(propertyValue) ||
          (cssUrlPattern.test(propertyValue)
            ? styleOutput.push(
                "pseudo-element " +
                  propertyName +
                  " image not rendered (only data: images are carried): " +
                  propertyValue,
              )
            : (text += propertyName + ":" + propertyValue + ";"));
      }
      return text + "animation:none;transition:none;";
    },
    firstLetterIndex: Dynamic = 0,
    styleProperties: Dynamic = [
      "color",
      "font-family",
      "font-feature-settings",
      "font-kerning",
      "font-size",
      "font-stretch",
      "font-style",
      "font-variant-caps",
      "font-variant-ligatures",
      "font-variant-numeric",
      "font-weight",
      "letter-spacing",
      "line-height",
      "text-shadow",
      "text-transform",
      "word-spacing",
      "-webkit-text-fill-color",
      "-webkit-text-stroke-color",
      "-webkit-text-stroke-width",
    ],
    state: Dynamic = {
      float: "none",
      "vertical-align": "baseline",
      opacity: "1",
      "background-color": "rgba(0, 0, 0, 0)",
      "background-image": "none",
      "box-shadow": "none",
      "text-decoration-line": "none",
      "margin-top": "0px",
      "margin-right": "0px",
      "margin-bottom": "0px",
      "margin-left": "0px",
      "padding-top": "0px",
      "padding-right": "0px",
      "padding-bottom": "0px",
      "padding-left": "0px",
      "border-top-width": "0px",
      "border-right-width": "0px",
      "border-bottom-width": "0px",
      "border-left-width": "0px",
    },
    allProperties: Dynamic = styleProperties.concat(Object.keys(state), [
      "border-top-style",
      "border-right-style",
      "border-bottom-style",
      "border-left-style",
      "border-top-color",
      "border-right-color",
      "border-bottom-color",
      "border-left-color",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
      "background-clip",
      "text-decoration-color",
      "text-decoration-style",
    ]),
    firstLetterRuleIndex: Dynamic = 0,
    customPropertyPattern: Dynamic =
      /^(fill|stroke|marker|color|clip-rule$|visibility$|paint-order$|shape-rendering$|text-rendering$|font-|letter-spacing$|word-spacing$|text-anchor$|dominant-baseline$|writing-mode$|direction$)/,
    inheritedValues: Dynamic = {
      "overflow-x": "hidden",
      "overflow-y": "hidden",
      opacity: "1",
      "clip-path": "none",
      "mask-image": "none",
      filter: "none",
      transform: "none",
      "transform-origin": "0px 0px",
      "mix-blend-mode": "normal",
      isolation: "auto",
    };
  function captureFirstLetterStyle(element?: Dynamic, previousStyleSnapshot?: Dynamic): Dynamic {
    let computedStyles: Dynamic;
    try {
      computedStyles = getComputedStyle(element, "::first-letter");
    } catch {
      return "";
    }
    let flag: Dynamic = false;
    for (let propertyIndex: Dynamic = 0; propertyIndex < styleProperties.length && !flag; propertyIndex++) {
      let propertyValue: Dynamic = computedStyles.getPropertyValue(styleProperties[propertyIndex]);
      flag =
        !!propertyValue && propertyValue !== previousStyleSnapshot.getPropertyValue(styleProperties[propertyIndex]);
    }
    for (let propertyName in state)
      !flag &&
        (computedStyles.getPropertyValue(propertyName) || state[propertyName]) !==
          state[propertyName] &&
        (flag = true);
    return flag ? captureCssProperties(computedStyles, allProperties) : "";
  }
  function capturePseudoElement(
    element?: Dynamic,
    pseudo?: Dynamic,
    pseudoStyleContainer?: Dynamic,
  ): Dynamic {
    let computedStyles: Dynamic = getComputedStyle(element, pseudo),
      content: Dynamic = computedStyles.content;
    if (!content || content === "none" || content === "normal") return null;
    let contentValue: Dynamic;
    try {
      contentValue = JSON.parse(content);
    } catch {}
    let animationStyles: Dynamic =
      detailElement &&
      computedStyles.getPropertyValue("visibility") === "hidden" &&
      getComputedStyle(element).getPropertyValue("visibility") === "hidden"
        ? "visibility:inherit;"
        : "";
    if (
      typeof contentValue != "string" &&
      extraOutput &&
      !hasUnsafeQuote(content) &&
      !cssUrlPattern.test(computedStyles.getPropertyValue("background-image"))
    ) {
      cssUrlPattern.test(content) &&
        styleOutput.push(
          "::before/::after content image not rendered (only data: images are carried): " +
            content,
        );
      let attributeName: Dynamic =
        pseudo === "::before" ? "data-om-cap-pb" : "data-om-cap-pa";
      pseudoStyleContainer.setAttribute(attributeName, String(firstLetterIndex));
      extraOutput.push(
        "[" +
          attributeName +
          '="' +
          firstLetterIndex +
          '"]' +
          pseudo +
          "{" +
          captureCssProperties(computedStyles, computedStyles) +
          animationStyles +
          "content:" +
          content +
          ";}",
      );
      firstLetterIndex++;
      return null;
    }
    let styleElement: Dynamic = doc.createElement("span"),
      text: Dynamic = "";
    for (let propertyIndex: Dynamic = 0; propertyIndex < computedStyles.length; propertyIndex++) {
      let propertyName: Dynamic = computedStyles[propertyIndex];
      propertyName !== "-webkit-border-image" &&
        (text += propertyName + ":" + computedStyles.getPropertyValue(propertyName) + ";");
    }
    text += "animation:none;transition:none;" + animationStyles;
    styleElement.setAttribute("style", text);
    typeof contentValue == "string"
      ? (styleElement.textContent = contentValue)
      : styleOutput.push(
          "::before/::after content not rendered (only single quoted-string content is synthesized): " +
            content,
        );
    return styleElement;
  }
  let placeholderRuleIndex: Dynamic = 0;
  function capturePlaceholderStyle(element?: Dynamic): Dynamic {
    try {
      if (!element.getAttribute("placeholder") || element.value) return "";
      let placeholderStyles: Dynamic = getComputedStyle(element, "::placeholder"),
        placeholderProperties: Dynamic = [
          "color",
          "opacity",
          "font-family",
          "font-size",
          "font-style",
          "font-weight",
          "letter-spacing",
          "text-transform",
          "-webkit-text-fill-color",
        ],
        text: Dynamic = "";
      for (let propertyIndex: Dynamic = 0; propertyIndex < placeholderProperties.length; propertyIndex++) {
        let propertyValue: Dynamic = placeholderStyles.getPropertyValue(placeholderProperties[propertyIndex]);
        propertyValue && (text += placeholderProperties[propertyIndex] + ":" + propertyValue + ";");
      }
      let sanitizedText: Dynamic = text;
      for (; sanitizedText.indexOf("]]>") >= 0; )
        sanitizedText = sanitizedText.split("]]>").join("");
      return sanitizedText;
    } catch {
      return "";
    }
  }
  function cloneElement(sourceNode?: Dynamic): Dynamic {
    if (sourceNode.nodeType === 8 || sourceNode.nodeType === 7)
      return doc.createTextNode("");
    if (sourceNode.nodeType !== 1) {
      let clonedNode: Dynamic = sourceNode.cloneNode(false);
      for (
        let firstChild: Dynamic = sourceNode.firstChild;
        firstChild;
        firstChild = firstChild.nextSibling
      )
        clonedNode.appendChild(cloneElement(firstChild));
      return clonedNode;
    }
    let sourceElement: Dynamic = sourceNode,
      tagName: Dynamic = sourceElement.tagName.toUpperCase();
    if (
      tagName === "SCRIPT" ||
      tagName === "STYLE" ||
      sourceElement.hasAttribute("data-omelette-chrome") ||
      sourceElement.hasAttribute("data-noncommentable") ||
      sourceElement.hasAttribute("data-dc-editor-overlay")
    )
      return doc.createTextNode("");
    tagName === "IFRAME" &&
      styleOutput.push(
        "<iframe> content is not captured (src=" +
          (sourceElement.getAttribute("src") || "about:blank") +
          ")",
      );
    let attributeList: Dynamic;
    if (urlPattern.test(sourceElement.localName)) attributeList = sourceElement.cloneNode(false);
    else if (sourceElement.namespaceURI === "http://www.w3.org/1999/xhtml")
      attributeList = doc.createElement("span");
    else return doc.createTextNode("");
    for (
      let attributeIndex: Dynamic = attributeList.attributes.length - 1;
      attributeIndex >= 0;
      attributeIndex--
    ) {
      let attribute: Dynamic = attributeList.attributes[attributeIndex];
      (attribute.namespaceURI === null
        ? attribute.name === "xmlns" ||
          !urlPattern.test(attribute.name) ||
          attribute.name.indexOf("data-om-cap-") === 0
        : !attribute.value &&
          attribute.namespaceURI === "http://www.w3.org/2000/xmlns/") &&
        attributeList.removeAttributeNode(attribute);
    }
    let namespaceNode: Dynamic =
        sourceElement.namespaceURI === "http://www.w3.org/2000/svg",
      localName: Dynamic =
        namespaceNode &&
        /^(clipPath|mask|pattern|marker|linearGradient|radialGradient|filter)$/.test(
          sourceElement.localName,
        );
    if (
      namespaceNode &&
      (ancestorDepth > 0 ? !localName : /^(symbol|defs)$/.test(sourceElement.localName))
    ) {
      let isSymbol: Dynamic = sourceElement.localName === "symbol",
        computedStyles: Dynamic = getComputedStyle(sourceElement);
      sourceElement.parentElement !== previousParent &&
        ((previousParent = sourceElement.parentElement),
        (previousStyles = previousParent ? getComputedStyle(previousParent) : null));
      let styleText: Dynamic = "";
      for (let propertyIndex: Dynamic = 0; propertyIndex < computedStyles.length; propertyIndex++) {
        let propertyName: Dynamic = computedStyles[propertyIndex],
          propertyValue: Dynamic = computedStyles.getPropertyValue(propertyName);
        !propertyValue ||
          propertyName.slice(0, 2) === "--" ||
          propertyName === "-webkit-border-image" ||
          ((isSymbol || ancestorDepth === 0) && !customPropertyPattern.test(propertyName)
            ? !isSymbol ||
              inheritedValues[propertyName] === undefined ||
              inheritedValues[propertyName] === propertyValue
            : previousStyles && previousStyles.getPropertyValue(propertyName) === propertyValue) ||
          (propertyValue === computedStyles.color &&
            (/currentcolor/i.test(sourceElement.getAttribute(propertyName) || "") ||
              /currentcolor/i.test(
                (sourceElement.style && sourceElement.style.getPropertyValue(propertyName)) ||
                  "",
              )) &&
            (propertyValue = "currentcolor"),
          (styleText += propertyName + ":" + propertyValue + ";"));
      }
      let attribute: Dynamic = sourceElement.getAttribute("style");
      styleText &&
        attributeList.setAttribute(
          "style",
          (attribute ? attribute.replace(/[;\s]*$/, ";") : "") + styleText,
        );
      ancestorDepth++;
      try {
        for (
          let firstChild: Dynamic = sourceElement.firstChild;
          firstChild;
          firstChild = firstChild.nextSibling
        )
          attributeList.appendChild(cloneElement(firstChild));
      } finally {
        ancestorDepth--;
      }
      return attributeList;
    }
    if (sourceElement.namespaceURI === "http://www.w3.org/1999/xhtml")
      if (tagName === "INPUT") {
        let formControl: Dynamic = sourceElement,
          controlType: Dynamic = (formControl.type || "").toLowerCase();
        controlType === "checkbox" || controlType === "radio"
          ? formControl.checked
            ? attributeList.setAttribute("checked", "")
            : attributeList.removeAttribute("checked")
          : !/^(file|submit|reset|button|image|hidden)$/.test(controlType) &&
            typeof formControl.value == "string" &&
            attributeList.setAttribute(
              "value",
              controlType === "password"
                ? "\u2022".repeat(formControl.value.length)
                : formControl.value,
            );
      } else
        tagName === "OPTION" &&
          (sourceElement.selected
            ? attributeList.setAttribute("selected", "")
            : attributeList.removeAttribute("selected"));
    let elementStyles: Dynamic = getComputedStyle(sourceElement),
      hasBackgroundStyle: Dynamic =
        (tagName === "PROGRESS" || tagName === "METER") &&
        elementStyles.appearance === "auto" &&
        /^(transparent|rgba\(0, 0, 0, 0\))$/.test(elementStyles.backgroundColor) &&
        elementStyles.backgroundImage === "none" &&
        elementStyles.borderImageSource === "none" &&
        elementStyles.borderTopStyle === "none" &&
        elementStyles.borderRightStyle === "none" &&
        elementStyles.borderBottomStyle === "none" &&
        elementStyles.borderLeftStyle === "none" &&
        elementStyles.borderTopLeftRadius === "0px" &&
        elementStyles.borderTopRightRadius === "0px" &&
        elementStyles.borderBottomRightRadius === "0px" &&
        elementStyles.borderBottomLeftRadius === "0px",
      pixelRatio: Dynamic = count,
      scaledPixelRatio: Dynamic = pixelRatio * (parseFloat(elementStyles.zoom) || 1),
      writingMode: Dynamic =
        !!deviceScale && sourceElement.namespaceURI === "http://www.w3.org/1999/xhtml",
      isVerticalWriting: Dynamic = !/^(vertical|sideways)/.test(
        elementStyles.writingMode || "",
      ),
      boxSizing: Dynamic =
        (elementStyles.columnCount || "auto") !== "auto" ||
        (elementStyles.columnWidth || "auto") !== "auto" ||
        (/flex$/.test(elementStyles.display) &&
          /^column/.test(elementStyles.flexDirection || "") &&
          (elementStyles.flexWrap || "nowrap") !== "nowrap"),
      isLogicalDimension: Dynamic = (propertyName?: Dynamic): Dynamic =>
        propertyName === "inline-size" ||
        propertyName === (isVerticalWriting ? "width" : "height") ||
        (boxSizing &&
          (propertyName === "block-size" ||
            propertyName === (isVerticalWriting ? "height" : "width"))),
      originalItems: Dynamic = items;
    if (writingMode && index === 0)
      for (
        let transformOrigin: Dynamic = callback(sourceElement);
        transformOrigin && items;
        transformOrigin = callback(transformOrigin)
      )
        items = transformPoint(items, getComputedStyle(transformOrigin));
    let transformedItems: Dynamic = transformPoint(items, elementStyles),
      text: Dynamic = "";
    count = scaledPixelRatio;
    items = transformedItems;
    for (let propertyIndex: Dynamic = 0; propertyIndex < elementStyles.length; propertyIndex++) {
      let propertyName: Dynamic = elementStyles[propertyIndex];
      if (
        propertyName === "-webkit-border-image" ||
        (hasBackgroundStyle && /^(background|border)/.test(propertyName))
      )
        continue;
      let propertyValue: Dynamic = elementStyles.getPropertyValue(propertyName);
      propertyName === "-webkit-text-fill-color" &&
        propertyValue === elementStyles.color &&
        (propertyValue = "currentcolor");
      let logicalDimension: Dynamic = isLogicalDimension(propertyName)
        ? propertyName === "width" ||
          (propertyName !== "height" && (propertyName === "inline-size") === isVerticalWriting)
        : undefined;
      text +=
        propertyName +
        ":" +
        (writingMode &&
        (logicalDimension !== undefined || cssUnitPattern.test(propertyName)) &&
        /^\d+(\.\d+)?px$/.test(propertyValue) &&
        parseFloat(propertyValue) > 0
          ? formatDimension(propertyValue, sourceElement, elementStyles, logicalDimension)
          : propertyValue) +
        ";";
    }
    count = pixelRatio;
    items = originalItems;
    text += "animation:none;transition:none;";
    if (detailElement) {
      if (sourceElement === detailElement) text += "visibility:visible;opacity:1;";
      else if (elementStyles.getPropertyValue("visibility") === "hidden") {
        let rootNode: Dynamic = sourceElement.getRootNode(),
          hiddenAncestor: Dynamic =
            sourceElement.parentElement || (rootNode && rootNode.host);
        hiddenAncestor &&
          getComputedStyle(hiddenAncestor).getPropertyValue("visibility") === "hidden" &&
          (text += "visibility:inherit;");
      }
    }
    rootContext &&
      (sourceElement === doc.documentElement || sourceElement === doc.body) &&
      (text += "background:transparent;");
    sourceElement === doc.documentElement &&
      sourceElement.hasAttribute("data-dc-canvas") &&
      (text += "overflow:visible;");
    attributeList.setAttribute("style", text);
    if (extraOutput && (tagName === "INPUT" || tagName === "TEXTAREA")) {
      let placeholderCss: Dynamic = capturePlaceholderStyle(sourceElement);
      placeholderCss &&
        (attributeList.setAttribute("data-om-cap-ph", String(placeholderRuleIndex)),
        extraOutput.push(
          '[data-om-cap-ph="' + placeholderRuleIndex + '"]::placeholder{' + placeholderCss + "}",
        ),
        placeholderRuleIndex++);
    }
    if (
      extraOutput &&
      sourceElement.firstChild &&
      sourceElement.namespaceURI === "http://www.w3.org/1999/xhtml" &&
      /^(block|list-item|inline-block|flow-root|table-cell|table-caption)$/.test(
        elementStyles.display,
      )
    ) {
      let firstLetterCss: Dynamic = captureFirstLetterStyle(sourceElement, elementStyles);
      firstLetterCss &&
        (attributeList.setAttribute("data-om-cap-fl", String(firstLetterRuleIndex)),
        extraOutput.push(
          '[data-om-cap-fl="' + firstLetterRuleIndex + '"]::first-letter{' + firstLetterCss + "}",
        ),
        firstLetterRuleIndex++);
    }
    if (tagName === "CANVAS")
      try {
        let __omCapGl: Dynamic = sourceElement.__omCapGl,
          imageElement: Dynamic = doc.createElement("img");
        if (__omCapGl && __omCapGl.url) imageElement.src = __omCapGl.url;
        else {
          let dataUrl: Dynamic = sourceElement.toDataURL();
          if (__omCapGl && !__omCapGl.url) {
            let comparisonCanvas: Dynamic = doc.createElement("canvas");
            comparisonCanvas.width = sourceElement.width;
            comparisonCanvas.height = sourceElement.height;
            dataUrl === comparisonCanvas.toDataURL() &&
              styleOutput.push(
                "canvas read back blank (either empty, or a WebGL canvas whose buffer cannot be read without preserveDrawingBuffer) \u2014 it may render blank in the export",
              );
          }
          imageElement.src = dataUrl;
        }
        imageElement.setAttribute("style", text);
        return imageElement;
      } catch {
        styleOutput.push(
          "<canvas> could not be serialized (tainted by cross-origin content)",
        );
      }
    if (tagName === "VIDEO" && sourceElement.readyState >= 2)
      try {
        let videoElement: Dynamic = sourceElement,
          videoCanvas: Dynamic = doc.createElement("canvas");
        videoCanvas.width = videoElement.videoWidth || videoElement.clientWidth;
        videoCanvas.height = videoElement.videoHeight || videoElement.clientHeight;
        let canvasContext: Dynamic = videoCanvas.getContext("2d");
        if (canvasContext) {
          canvasContext.drawImage(videoElement, 0, 0, videoCanvas.width, videoCanvas.height);
          let imageElement: Dynamic = doc.createElement("img");
          imageElement.src = videoCanvas.toDataURL();
          imageElement.setAttribute("style", text);
          imageElement.width = videoElement.clientWidth;
          imageElement.height = videoElement.clientHeight;
          return imageElement;
        }
      } catch {
        styleOutput.push(
          "<video> frame could not be serialized (tainted by cross-origin content)",
        );
      }
    tagName === "VIDEO" &&
      sourceElement.readyState < 2 &&
      styleOutput.push(
        "<video> had no frame to draw: its image could not be embedded (renders blank in the export)",
      );
    if (
      tagName === "SVG" &&
      sourceElement.ownerSVGElement == null &&
      sourceElement.hasAttribute("data-om-exportable-video-with-duration-secs")
    ) {
      let element: Dynamic = sourceElement.querySelector("foreignObject");
      if (element)
        try {
          let containerElement: Dynamic = doc.createElement("div");
          containerElement.setAttribute("style", text);
          count = scaledPixelRatio;
          items = transformedItems;
          index++;
          try {
            for (
              let firstChild: Dynamic = element.firstChild;
              firstChild;
              firstChild = firstChild.nextSibling
            )
              containerElement.appendChild(cloneElement(firstChild));
          } finally {
            count = pixelRatio;
            items = originalItems;
            index--;
          }
          return containerElement;
        } catch (error: Dynamic) {
          styleOutput.push(
            "inline <svg><foreignObject> could not be unwrapped: " +
              ((error && error.message) || String(error)),
          );
        }
    }
    let beforePseudoElement: Dynamic = capturePseudoElement(sourceElement, "::before", attributeList);
    beforePseudoElement && attributeList.appendChild(beforePseudoElement);
    let assignedNodes: Dynamic;
    if (sourceElement.shadowRoot) assignedNodes = sourceElement.shadowRoot.childNodes;
    else if (tagName === "TEXTAREA" && typeof sourceElement.value == "string")
      assignedNodes = [doc.createTextNode(sourceElement.value)];
    else if (tagName === "SLOT") {
      let assignedContent: Dynamic = sourceElement.assignedNodes({
        flatten: true,
      });
      assignedNodes = assignedContent.length ? assignedContent : sourceElement.childNodes;
    } else assignedNodes = sourceElement.childNodes;
    count = scaledPixelRatio;
    items = transformedItems;
    let previousDepth: Dynamic = ancestorDepth;
    localName && (ancestorDepth = 0);
    index++;
    try {
      for (let nodeIndex: Dynamic = 0; nodeIndex < assignedNodes.length; nodeIndex++) {
        let assignedNode: Dynamic = assignedNodes[nodeIndex];
        assignedNode && attributeList.appendChild(cloneElement(assignedNode));
      }
    } finally {
      count = pixelRatio;
      items = originalItems;
      ancestorDepth = previousDepth;
      index--;
    }
    let afterPseudoElement: Dynamic = capturePseudoElement(sourceElement, "::after", attributeList);
    afterPseudoElement && attributeList.appendChild(afterPseudoElement);
    return attributeList;
  }
  return cloneElement;
}
export {
  captureElementStyle,
};
export function installExportCaptureStyle(): () => void {
  return () => {};
}
