import type { DoneMessage } from "./types";
/** Fast edit runtime: CSS fidelity, SDK v1/v2/v3, streaming statements and previews. */
import { Window as HappyWindow } from "happy-dom";
import { jQueryFactory as createJQuery } from "jquery/factory";
import {
  collapseFlexShorthand,
  cssDeclarationMap,
  extractBackgroundUrl,
  freshCssDeclaration,
  kebabCaseCssProperty,
  matchesCssDeclarations,
  parseCssDeclarations,
  replaceCssDeclaration,
  serializeCssDeclarations,
} from "./css-declarations";
import { parsePreviewForm, readStringLiteral } from "./preview-form";
import { completeSvgDataUrl } from "./preview-svg";
import * as statementStream from "./statement-stream";
import type {
  Dynamic,
  EditRuntime,
  EmitWorkerMessage,
  RuntimeLimits,
} from "./types";
var DEFAULT_LIMITS: RuntimeLimits = {
  maxLines: 40,
  maxChars: 20000,
  maxHtml: 200000,
  maxStmt: 4000,
  maxMsg: 500,
  maxLogs: 50,
  idleRunMs: 150,
  splitter: "stream",
  previewMs: -1,
};
var WINDOW_INTRINSICS: Dynamic = [
  "Array",
  "Object",
  "Function",
  "Promise",
  "Symbol",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Date",
  "RegExp",
  "Number",
  "String",
  "Boolean",
  "Proxy",
  "Error",
  "TypeError",
  "SyntaxError",
  "RangeError",
  "ReferenceError",
  "EvalError",
  "URIError",
];
var UNITLESS_CSS_PROPERTIES: Dynamic = new Set([
  "lineHeight",
  "opacity",
  "fontWeight",
  "zIndex",
  "flex",
  "flexGrow",
  "flexShrink",
  "order",
  "zoom",
  "columnCount",
  "aspectRatio",
  "gridRow",
  "gridColumn",
  "gridRowStart",
  "gridRowEnd",
  "gridColumnStart",
  "gridColumnEnd",
  "gridArea",
  "fillOpacity",
  "strokeOpacity",
  "floodOpacity",
  "stopOpacity",
  "animationIterationCount",
  "scale",
  "widows",
  "orphans",
]);
var camelCaseCssProperty: Dynamic = (
  cssPropertyName?: Dynamic,
  ..._extraArguments: Dynamic[]
): Dynamic =>
  String(cssPropertyName)
    .replace(/^-ms-/, "ms-")
    .replace(
      /-([a-z])/g,
      (
        _matchedDashAndLetter?: Dynamic,
        propertyName?: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic => propertyName.toUpperCase(),
    );
var CHAIN_CONTINUATION: Dynamic = /^\s*(?:\.(?!\d)|\?|:|&&|\|\||,)/;
var CODE_FENCE: Dynamic = /^\s*```[\w-]*\s*$/;
var CODE_START: Dynamic =
  /^\s*(?:(?:const|let|var|function|if|for|while|do|try|switch|return|throw|new|await|async|class|typeof|delete|void)\s|\/\/|\/\*|[([{$`]|[A-Za-z_$][\w$]*\s*(?:[.(\[=]|\+\+|--))/;
var CODE_LIKE: Dynamic =
  /^\s*(?:(?:const|let|var|function|if|for|while|do|try|switch|return|throw|new|await|async|class|typeof|delete|void)\b|\/\/|\/\*|[([{$`'"!+~-]|[A-Za-z_$][\w$]*\s*(?:[.(\[=;]|\+\+|--|$))/;
var ENABLE_DOM_DECK: Dynamic = false;
function createEditRuntime(
  emit: EmitWorkerMessage,
  initialLimits?: Partial<RuntimeLimits>,
): EditRuntime;
function createEditRuntime(
  emit: EmitWorkerMessage,
  initialLimits?: Partial<RuntimeLimits>,
): EditRuntime {
  let limits: Dynamic = Object.assign({}, DEFAULT_LIMITS, initialLimits || {});
  let window: Dynamic;
  let document: Dynamic;
  let jquery: Dynamic;
  let select: Dynamic;
  let currentElement: Dynamic = null;
  let initialized: Dynamic = false;
  let domDeck: Dynamic = null;
  let deckApi: Dynamic = null;
  let executingStatement: Dynamic = "";
  let chainMode: Dynamic = false;
  let previousValue: Dynamic;
  let project: Dynamic = null;
  let lineTail: Dynamic = "";
  let pendingCode: Dynamic = "";
  let pendingLineCount: Dynamic = 0;
  let compiledPending: Dynamic = null;
  let hasSeenCode: Dynamic = false;
  let sequence: Dynamic = 0;
  let lastHtml: Dynamic = "";
  let idleTimer: Dynamic = 0;
  let finished: Dynamic = false;
  let insideCodeFence: Dynamic = null;
  let originalHadTbody: Dynamic = true;
  let pace: Dynamic = null;
  let nextFrameTime: Dynamic = 0;
  let previewCount: Dynamic = 0;
  let queuedFrames: Dynamic = new Map();
  function sendQueuedFrames(
    flushAll?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (let [slideId, framePayload] of queuedFrames) {
      if (!flushAll && Date.now() < nextFrameTime) return;
      queuedFrames.delete(slideId);
      emit({
        kind: "html" as const,
        seq: sequence++,
        slideId: slideId,
        html: framePayload.html,
        stmt: framePayload.stmt,
      });
      nextFrameTime =
        Date.now() +
        Math.max(
          pace.frameMs,
          (framePayload.html.length + framePayload.stmt.length + slideId.length + 100) /
            pace.frameCharsPerMs,
        );
    }
  }
  let stream: Dynamic = null;
  let useLineSplitter: Dynamic = limits.splitter === "lines";
  let incomingLine: Dynamic = "";
  let consumedLineChars: Dynamic = 0;
  let recognizedCode: Dynamic = false;
  let validFileId: Dynamic = {
    test: (key?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
      /^[A-Za-z0-9_-]{1,64}$/.test(key) &&
      key !== "__proto__" &&
      key !== "constructor" &&
      key !== "prototype",
  };
  let truncate: Dynamic = (
    truncateInput?: Dynamic,
    maxLength?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic => {
    truncateInput = String(truncateInput);
    return truncateInput.length > maxLength ? truncateInput.slice(0, maxLength) : truncateInput;
  };
  let fileTerminology: Dynamic = (
    filePath?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic =>
    String(filePath)
      .replace(/\bdeck: /g, "")
      .replace(/\bslides\b/g, "files")
      .replace(/\bslide\b/g, "file")
      .replace(/\bdeck\b/g, "project");
  let formatError: Dynamic = (
    error?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic =>
    project
      ? truncate(
          (project.v3 ? fileTerminology(error) : String(error)).split(`
`)[0],
          200,
        )
      : truncate(error, limits.maxMsg);
  let emitError: Dynamic = (
    error?: Dynamic,
    statement?: Dynamic,
    metadata?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic =>
    emit(
      Object.assign(
        {
          kind: "error" as const,
          message: formatError(error),
          stmt: truncate(statement || "", limits.maxStmt),
        },
        metadata,
      ),
    );
  let emitStatementError: Dynamic = (
    error?: Dynamic,
    statement?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic => {
    if ((emitError(error, statement), project))
      emit({
        kind: "done" as const,
        seq: sequence++,
        n: ++project.n,
        stmt: truncate(statement || "", limits.maxStmt),
        changed: [],
        logged: 0,
        threw: {
          message: formatError(error),
        },
      });
  };
  function initialize(
    html?: Dynamic,
    domDeckMetadata?: Dynamic,
    metadata?: Dynamic,
    sdk?: Dynamic,
    runtimeOptions?: Dynamic,
    ..._unusedInitializeArgs: Dynamic[]
  ): Dynamic {
    if (runtimeOptions && Number.isFinite(runtimeOptions.previewMs))
      limits.previewMs = runtimeOptions.previewMs;
    let requestedPace: Dynamic = runtimeOptions && runtimeOptions.pace;
    let positiveNumber: Dynamic = (
      positiveValue?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => Number.isFinite(positiveValue) && positiveValue > 0;
    pace =
      requestedPace &&
      typeof requestedPace === "object" &&
      positiveNumber(requestedPace.frameCharsPerMs) &&
      positiveNumber(requestedPace.frameMs) &&
      positiveNumber(requestedPace.previewCharsPerMs) &&
      positiveNumber(requestedPace.maxPreviews)
        ? {
            frameCharsPerMs: requestedPace.frameCharsPerMs,
            frameMs: requestedPace.frameMs,
            previewCharsPerMs: requestedPace.previewCharsPerMs,
            maxPreviews: requestedPace.maxPreviews,
          }
        : null;
    nextFrameTime = 0;
    previewCount = 0;
    queuedFrames.clear();
    chainMode =
      runtimeOptions && typeof runtimeOptions.chains === "boolean"
        ? runtimeOptions.chains
        : !!(sdk && sdk.version === 3);
    window = new HappyWindow({
      url: "about:blank",
      settings: {
        disableJavaScriptEvaluation: true,
        enableJavaScriptEvaluation: false,
        disableJavaScriptFileLoading: true,
        disableCSSFileLoading: true,
        disableComputedStyleRendering: true,
        disableIframePageLoading: true,
        navigation: {
          disableMainFrameNavigation: true,
          disableChildFrameNavigation: true,
          disableChildPageNavigation: true,
          disableFallbackToSetURL: true,
        },
      },
    });
    for (let intrinsicName of WINDOW_INTRINSICS)
      if (window[intrinsicName] === undefined)
        window[intrinsicName] = (globalThis as Dynamic)[intrinsicName];
    window.getComputedStyle = (
      element?: Dynamic,
      ..._unusedStyleArgs: Dynamic[]
    ): Dynamic =>
      new Proxy(element.style, {
        get(styleObject: Dynamic, propertyKey: Dynamic): Dynamic {
          if (propertyKey === "getPropertyValue")
            return (
              propertyName?: Dynamic,
              ..._unusedCallbackArgs: Dynamic[]
            ): Dynamic =>
              styleObject.getPropertyValue(propertyName) ||
              getFallbackStyle(element, String(propertyName));
          let entry: Dynamic = Reflect.get(styleObject, propertyKey);
          if (typeof entry === "function") return entry.bind(styleObject);
          return (entry === "" || entry === undefined) &&
            typeof propertyKey === "string" &&
            /^[a-zA-Z-]+$/.test(propertyKey)
            ? getFallbackStyle(element, kebabCaseCssProperty(propertyKey)) || entry
            : entry;
        },
      });
    document = window.document;
    try {
      window.Element.prototype.toString = function (
        this: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic {
        return (
          "[object " +
          ((this.constructor && this.constructor.name) || "Element") +
          "]"
        );
      };
    } catch (_ignoredError: Dynamic) {}
    if ((collectPlaceholders(html), sdk)) {
      for (let textFile of Object.keys(sdk.texts || {}))
        collectPlaceholders(sdk.texts[textFile]);
      for (let layoutName of Object.keys(sdk.layouts || {}))
        collectPlaceholders(sdk.layouts[layoutName]);
    }
    if (
      ((originalHadTbody = /<tbody[\s>]/i.test(String(html))),
      (document.body.innerHTML = String(html)),
      (currentElement = document.body.querySelector("section")),
      !currentElement)
    ) {
      emitError("no <section> in the slide text", "");
      return false;
    }
    if (
      ENABLE_DOM_DECK &&
      domDeckMetadata &&
      Array.isArray(domDeckMetadata.slides)
    )
      initializeDomDeck(domDeckMetadata);
    else if (metadata && Array.isArray(metadata.slides)) {
      if (sdk && (sdk.version === 2 || sdk.version === 3))
        project = createProjectState(metadata, sdk, html);
      deckApi = createDeckApi(metadata, project);
    }
    jquery = createJQuery(window);
    let style: Dynamic = jquery.style;
    jquery.style = function (
      this: Dynamic,
      element?: Dynamic,
      cssProperty?: Dynamic,
      propertyValue?: Dynamic,
      fallbackValue?: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic {
      if (
        typeof propertyValue === "number" &&
        propertyValue === propertyValue &&
        !UNITLESS_CSS_PROPERTIES.has(camelCaseCssProperty(cssProperty)) &&
        !String(cssProperty).startsWith("--")
      )
        propertyValue = propertyValue + "px";
      if (propertyValue === undefined || !element || element.nodeType !== 1)
        return style.call(this, element, cssProperty, propertyValue, fallbackValue);
      let propertyName: Dynamic = kebabCaseCssProperty(cssProperty);
      let entry: Dynamic = fallbackStyles.get(element);
      if (typeof propertyValue === "string" && /url\(/i.test(propertyValue))
        return setFallbackStyle(element, propertyName, propertyValue);
      if (propertyValue === "" || propertyValue === null) {
        if (entry) entry.delete(propertyName);
        if (!removedStyleProperties.has(element))
          removedStyleProperties.set(element, new Set());
        removedStyleProperties.get(element).add(propertyName);
        return style.call(this, element, cssProperty, propertyValue, fallbackValue);
      }
      if (entry) entry.delete(propertyName);
      let attribute: Dynamic = element.getAttribute("style");
      let cssText: Dynamic = element.style.cssText;
      let styleResult: Dynamic = style.call(
        this,
        element,
        cssProperty,
        propertyValue,
        fallbackValue,
      );
      if (
        typeof propertyValue === "string" &&
        propertyValue.trim() &&
        element.style.cssText === cssText &&
        element.style.getPropertyValue(propertyName) === "" &&
        getFallbackStyle(element, propertyName) !== propertyValue
      )
        setFallbackStyle(element, propertyName, propertyValue);
      else {
        let styleAttribute: Dynamic =
          typeof propertyValue === "string" &&
          !/^[-+]=/.test(propertyValue) &&
          !(jquery.cssHooks[camelCaseCssProperty(cssProperty)] || {}).set
            ? propertyValue.trim()
            : element.style.getPropertyValue(propertyName);
        let normalizedStyle: Dynamic =
          element.style.cssText === cssText || !styleAttribute
            ? attribute
            : mergeCssDeclaration(attribute || "", propertyName, styleAttribute);
        if (normalizedStyle === null) element.removeAttribute("style");
        else element.setAttribute("style", normalizedStyle);
        if (
          attribute === null ||
          (lastJqueryStyles.has(element)
            ? lastJqueryStyles.get(element) === attribute
            : !originalStyles.has(element) ||
              originalStyles.get(element) === attribute)
        )
          lastJqueryStyles.set(element, normalizedStyle);
        else lastJqueryStyles.delete(element);
      }
      return styleResult;
    };
    jquery.attrHooks.style = {
      set: (
        element?: Dynamic,
        styleText?: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic => {
        directStyleWrites.add(element);
        fallbackStyles.delete(element);
        element.setAttribute("style", String(styleText));
        return styleText;
      },
    };
    let throwRemovedSlide: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic => {
      throw Error(project.goneMsg);
    };
    if (
      ((select = function (
        selector?: Dynamic,
        searchContext?: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic {
        if (project && project.v3)
          return project.seen(
            arguments.length
              ? jquery(selector, searchContext)
              : jquery(document.body).children(),
          );
        if (
          project &&
          project.currentRemoved &&
          (!arguments.length ||
            (typeof selector === "string" &&
              searchContext === undefined &&
              !/^\s*</.test(selector)))
        )
          throwRemovedSlide();
        return arguments.length
          ? jquery(selector, searchContext)
          : jquery(currentElement);
      }),
      Object.setPrototypeOf(select, jquery),
      (select.prototype = jquery.prototype),
      Object.defineProperty(select, "slide", {
        get: (..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          project && project.currentRemoved ? throwRemovedSlide() : jquery(currentElement),
      }),
      (scratchElement = document.createElement("div")),
      project && project.v3)
    ) {
      initializeFileSdk(metadata, sdk);
      initialized = true;
      emit({
        kind: "ready" as const,
      });
      return true;
    }
    for (let element of [
      currentElement,
      ...currentElement.querySelectorAll("[style]"),
    ])
      if (element.getAttribute("style") !== null)
        originalStyles.set(element, element.getAttribute("style"));
    if (((lastHtml = serializeCurrentSlide()), project && project.current))
      project.slides.get(project.current).last = lastHtml;
    if (domDeck) {
      let domDeckState: Dynamic = validateDomDeck();
      domDeck.last = domDeckState.ok ? JSON.stringify(domDeckState.state) : "";
    }
    initialized = true;
    emit({
      kind: "ready" as const,
    });
    return true;
  }
  let originalStyles: Dynamic = new WeakMap();
  let scratchElement: Dynamic = null;
  let normalizeCssDeclaration: Dynamic = (
    declaration?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic => {
    scratchElement.setAttribute("style", declaration.text);
    let parsedDeclarations: Dynamic = cssDeclarationMap(scratchElement.style.cssText);
    scratchElement.removeAttribute("style");
    try {
      scratchElement.style.setProperty(
        declaration.prop,
        declaration.value.replace(/\s*!important\s*$/, ""),
        /!important\s*$/.test(declaration.value) ? "important" : "",
      );
    } catch (error: Dynamic) {}
    let normalizedDeclarations: Dynamic = cssDeclarationMap(
      scratchElement.getAttribute("style") || "",
    );
    scratchElement.removeAttribute("style");
    return [parsedDeclarations, normalizedDeclarations];
  };
  let fallbackStyles: Dynamic = new WeakMap();
  let removedStyleProperties: Dynamic = new WeakMap();
  let directStyleWrites: Dynamic = new WeakSet();
  let lastJqueryStyles: Dynamic = new WeakMap();
  let canonicalCss: Dynamic = (
    cssText?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic => {
    scratchElement.setAttribute("style", cssText);
    let declarations: Dynamic = parseCssDeclarations(scratchElement.style.cssText)
      .map(
        (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          declaration.text,
      )
      .sort()
      .join(";");
    scratchElement.removeAttribute("style");
    return declarations;
  };
  function mergeCssDeclaration(
    cssText?: Dynamic,
    propertyName?: Dynamic,
    propertyValue?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    let replacement: Dynamic = propertyName + ": " + propertyValue;
    let canonicalReplacement: Dynamic = canonicalCss(replacement);
    let items: Dynamic = [];
    let insertAt: Dynamic = -1;
    for (let declaration of parseCssDeclarations(cssText))
      if (
        containsKnownPlaceholder(declaration.value) ||
        (declaration.prop !== propertyName &&
          (canonicalCss(declaration.text) === "" ||
            canonicalCss(declaration.text + "; " + replacement) !== canonicalReplacement))
      )
        items.push(declaration);
      else if (insertAt < 0) insertAt = items.length;
    if (
      insertAt < 0 ||
      items
        .slice(insertAt)
        .some(
          (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            declaration.prop === propertyName ||
            canonicalCss(declaration.text + "; " + replacement) !==
              canonicalCss(replacement + "; " + declaration.text),
        )
    )
      insertAt = items.length;
    return [
      ...items
        .slice(0, insertAt)
        .map(
          (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            declaration.text,
        ),
      replacement,
      ...items
        .slice(insertAt)
        .map(
          (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            declaration.text,
        ),
    ].join("; ");
  }
  function setFallbackStyle(
    element?: Dynamic,
    propertyName?: Dynamic,
    propertyValue?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!fallbackStyles.has(element)) fallbackStyles.set(element, new Map());
    if (
      (fallbackStyles.get(element).set(propertyName, propertyValue),
      removedStyleProperties.has(element))
    )
      removedStyleProperties.get(element).delete(propertyName);
    try {
      element.style.removeProperty(propertyName);
    } catch (error: Dynamic) {}
    element.setAttribute(
      "style",
      replaceCssDeclaration(
        element.getAttribute("style") || "",
        propertyName,
        propertyValue,
      ),
    );
  }
  function getFallbackStyle(
    element?: Dynamic,
    propertyName?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    let entry: Dynamic = fallbackStyles.get(element);
    if (entry && entry.has(propertyName)) return entry.get(propertyName);
    let defaultStyles: Dynamic = new Map([
      ...cssDeclarationMap(originalStyles.get(element) || ""),
      ...cssDeclarationMap(element.getAttribute("style") || ""),
    ]);
    if (
      removedStyleProperties.has(element) &&
      removedStyleProperties.get(element).has(propertyName)
    )
      return "";
    if (defaultStyles.has(propertyName)) return defaultStyles.get(propertyName);
    if (propertyName === "background-image") {
      let backgroundValue: Dynamic =
        (entry && entry.get("background")) || defaultStyles.get("background");
      return backgroundValue ? extractBackgroundUrl(backgroundValue) : "";
    }
    return "";
  }
  let TEMPLATE_PLACEHOLDER: Dynamic = /\{\{[^{}]{0,80}\}\}/g;
  let knownPlaceholders: Dynamic = new Set();
  let collectPlaceholders: Dynamic = (
    text?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic => {
    for (let placeholder of String(text).match(TEMPLATE_PLACEHOLDER) || [])
      knownPlaceholders.add(placeholder);
  };
  let containsKnownPlaceholder: Dynamic = (
    text?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic =>
    knownPlaceholders.size > 0 &&
    (text.match(TEMPLATE_PLACEHOLDER) || []).some(
      (placeholder?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
        knownPlaceholders.has(placeholder),
    );
  function reconcileCss(
    cssText?: Dynamic,
    styleText?: Dynamic,
    element?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    let expectedStyles: Dynamic = cssDeclarationMap(styleText);
    let matchedProperties: Dynamic = new Set();
    let items: Dynamic = [];
    let fallbackProperties: Dynamic = (element && fallbackStyles.get(element)) || new Map();
    let removedProperties: Dynamic =
      (element && removedStyleProperties.get(element)) || new Set();
    let hasDirectWrite: Dynamic = !!element && directStyleWrites.has(element);
    for (let [propertyName, propertyValue] of fallbackProperties) expectedStyles.set(propertyName, propertyValue);
    for (let declaration of parseCssDeclarations(cssText)) {
      let [normalDeclarations, fallbackDeclarations]: Dynamic = normalizeCssDeclaration(declaration);
      let matchingProperties: Dynamic = matchesCssDeclarations(normalDeclarations, expectedStyles, matchedProperties)
        ? normalDeclarations
        : matchesCssDeclarations(fallbackDeclarations, expectedStyles, matchedProperties)
          ? fallbackDeclarations
          : null;
      if (containsKnownPlaceholder(declaration.value)) {
        if ((items.push(declaration), matchingProperties))
          for (let propertyName of matchingProperties.keys()) matchedProperties.add(propertyName);
        else if (expectedStyles.get(declaration.prop) === declaration.value)
          matchedProperties.add(declaration.prop);
        continue;
      }
      if (!matchingProperties && !normalDeclarations.size && !fallbackDeclarations.size) {
        if (matchedProperties.has(declaration.prop)) continue;
        if (expectedStyles.has(declaration.prop)) {
          items.push(
            expectedStyles.get(declaration.prop) === declaration.value
              ? declaration
              : freshCssDeclaration(declaration.prop, expectedStyles.get(declaration.prop)),
          );
          matchedProperties.add(declaration.prop);
        } else if (!removedProperties.has(declaration.prop) && !hasDirectWrite) {
          items.push(declaration);
          matchedProperties.add(declaration.prop);
        }
        continue;
      }
      if (matchingProperties) {
        items.push(declaration);
        for (let propertyName of matchingProperties.keys()) matchedProperties.add(propertyName);
        continue;
      }
      for (let propertyName of new Set([...normalDeclarations.keys(), ...fallbackDeclarations.keys()]))
        if (expectedStyles.has(propertyName) && !matchedProperties.has(propertyName)) {
          items.push(freshCssDeclaration(propertyName, expectedStyles.get(propertyName)));
          matchedProperties.add(propertyName);
        }
    }
    for (let [propertyName, propertyValue] of expectedStyles)
      if (!matchedProperties.has(propertyName)) items.push(freshCssDeclaration(propertyName, propertyValue));
    return serializeCssDeclarations(collapseFlexShorthand(items));
  }
  function settleStyles(
    rootElement?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (let element of [rootElement, ...rootElement.querySelectorAll("[style]")]) {
      let attribute: Dynamic = element.getAttribute("style");
      if (attribute === null) continue;
      let entry: Dynamic = originalStyles.get(element);
      if (entry === attribute) continue;
      let styleText: Dynamic = attribute;
      try {
        let styleWasRemoved: Dynamic =
          lastJqueryStyles.get(element) === attribute &&
          !fallbackStyles.has(element) &&
          !removedStyleProperties.has(element);
        if (directStyleWrites.has(element)) styleText = attribute;
        else if (entry !== undefined && !styleWasRemoved)
          styleText = reconcileCss(entry, attribute, element);
        else if (fallbackStyles.has(element)) {
          styleText = attribute;
          for (let [propertyName, propertyValue] of fallbackStyles.get(element))
            styleText = replaceCssDeclaration(styleText, propertyName, propertyValue);
        } else if (
          /flex-basis\s*:\s*0%|flex\s*:\s*[\d.]+\s+1\s+0%/.test(attribute)
        ) {
          let styleProperties: Dynamic = new Set(
            parseCssDeclarations(entry || "").map(
              (declaration?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
                declaration.text,
            ),
          );
          styleText =
            serializeCssDeclarations(
              collapseFlexShorthand(
                parseCssDeclarations(attribute).map(
                  (
                    declaration?: Dynamic,
                    ..._unusedCallbackArgs: Dynamic[]
                  ): Dynamic =>
                    /^flex(-grow|-shrink|-basis)?$/.test(declaration.prop) &&
                    !styleProperties.has(declaration.text)
                      ? freshCssDeclaration(declaration.prop, declaration.value)
                      : declaration,
                ),
              ),
            ) + (/;\s*$/.test(attribute) ? ";" : "");
        }
      } catch (_ignoredError: Dynamic) {
        styleText = attribute;
      }
      if (styleText !== attribute) element.setAttribute("style", styleText);
      originalStyles.set(element, styleText);
      fallbackStyles.delete(element);
      removedStyleProperties.delete(element);
      directStyleWrites.delete(element);
      lastJqueryStyles.delete(element);
    }
  }
  function createDeckApi(
    metadata?: Dynamic,
    state?: Dynamic,
    ..._unusedDeckArgs: Dynamic[]
  ): Dynamic {
    let currentId: Dynamic = String(metadata.current);
    let slides: Dynamic = [];
    let operationCount: Dynamic = 0;
    for (let slideMetadata of metadata.slides) {
      let slideId: Dynamic = String(slideMetadata && slideMetadata.id);
      if (
        validFileId.test(slideId) &&
        !slides.some(
          (entry?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            entry.id === slideId,
        )
      )
        slides.push({
          id: slideId,
          title: String((slideMetadata && slideMetadata.title) || "").slice(0, 300),
        });
    }
    let fail: Dynamic = (
      message?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      throw Error("deck: " + message);
    };
    let slideIndex: Dynamic = (
      slideId?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic =>
      slides.findIndex(
        (entry?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          entry.id === slideId,
      );
    if (state)
      state.order = (..._unusedOrderArgs: Dynamic[]): Dynamic =>
        slides.map(
          (entry?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            entry.id,
        );
    let requireSlideId: Dynamic = (
      slideId?: Dynamic,
      parameterName?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      if (typeof slideId !== "string" || !validFileId.test(slideId))
        fail(parameterName + " must be a slide id (letters, digits, - or _)");
      if (slideIndex(slideId) < 0) fail('no slide with the id "' + slideId + '"');
      return slideId;
    };
    let validatePlace: Dynamic = (
      placement?: Dynamic,
      defaultPlacement?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      if (placement === undefined && defaultPlacement) return defaultPlacement;
      if (!placement || typeof placement !== "object" || Array.isArray(placement))
        fail("the place must be {before: id} or {after: id}");
      let placementKeys: Dynamic = Object.keys(placement);
      if (
        placementKeys.length !== 1 ||
        (placementKeys[0] !== "before" && placementKeys[0] !== "after")
      )
        fail("the place must have exactly one of before / after");
      return {
        [placementKeys[0]]: requireSlideId(placement[placementKeys[0]], placementKeys[0]),
      };
    };
    let insertSlide: Dynamic = (
      slide?: Dynamic,
      placement?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      let neighborId: Dynamic =
        placement.before !== undefined ? placement.before : placement.after;
      let neighborIndex: Dynamic = slideIndex(neighborId);
      slides.splice(
        placement.before !== undefined ? neighborIndex : neighborIndex + 1,
        0,
        slide,
      );
    };
    let queueOperation: Dynamic = (
      operation?: Dynamic,
      slideEntry?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      if (operationCount >= 24) fail("at most 24 deck calls in one run");
      if ((operationCount++, state))
        state.ops.push({
          op: operation,
          entry: slideEntry || null,
        });
      else
        emit({
          kind: "op" as const,
          seq: sequence++,
          stmt: truncate(executingStatement, limits.maxStmt),
          op: operation,
        });
    };
    let requireActiveReply: Dynamic = (
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      if (state && state.halted) fail("the reply ended at deck.undo()");
      if (operationCount >= 24) fail("at most 24 deck calls in one run");
    };
    let mintSlideId: Dynamic = (
      idPrefix?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      let slice: Dynamic = String(idPrefix).slice(0, 56);
      let candidateId: Dynamic = slice;
      for (
        let count: Dynamic = 2;
        slideIndex(candidateId) >= 0 ||
        state.slides.has(candidateId) ||
        !validFileId.test(candidateId);
        count++
      )
        candidateId = slice + "-" + count;
      return candidateId;
    };
    let checkSlideCapacity: Dynamic = (
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      let index: Dynamic = 0;
      for (let slide of state.slides.values()) if (!slide.removed) index++;
      if (index >= 64) fail("a deck holds at most 64 slides here");
    };
    let createSlideEntry: Dynamic = (
      slideId?: Dynamic,
      slideElement?: Dynamic,
      holder?: Dynamic,
      slideHtml?: Dynamic,
      hadTbody?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      let record: Dynamic = {
        id: slideId,
        text: slideHtml,
        holder: holder,
        el: slideElement,
        last: null,
        removed: false,
        hadTbody: hadTbody,
        made: true,
        born: state.n,
      };
      for (let styledElement of [slideElement, ...slideElement.querySelectorAll("[style]")])
        if (styledElement.getAttribute("style") !== null)
          originalStyles.set(styledElement, styledElement.getAttribute("style"));
      record.last = state.text(record);
      state.slides.set(slideId, record);
      return record;
    };
    let api: Dynamic = {
      get slides(): Dynamic {
        return slides.map(
          (entry?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic => ({
            id: entry.id,
            title: entry.title,
          }),
        );
      },
      get current(): Dynamic {
        return currentId;
      },
      move(slideId: Dynamic, placement: Dynamic): Dynamic {
        requireActiveReply();
        requireSlideId(slideId, "id");
        let validatedPlacement: Dynamic = validatePlace(placement);
        if ((validatedPlacement.before || validatedPlacement.after) === slideId)
          fail("a slide cannot be moved next to itself");
        let movedSlide: Dynamic = slides.splice(slideIndex(slideId), 1)[0];
        insertSlide(movedSlide, validatedPlacement);
        queueOperation(
          Object.assign(
            {
              op: "move",
              id: slideId,
            },
            validatedPlacement,
          ),
        );
      },
      remove(slideId: Dynamic): Dynamic {
        if (
          (requireActiveReply(),
          requireSlideId(slideId, "id"),
          slideId === currentId && !state)
        )
          fail('the current slide ("' + currentId + '") cannot be removed');
        if (state && slides.length <= 1)
          fail("the last slide of the deck cannot be removed");
        if (
          (slides.splice(slideIndex(slideId), 1),
          state && state.slides.has(slideId))
        )
          state.slides.get(slideId).removed = true;
        if (state && slideId === currentId) {
          if (
            ((state.currentRemoved = true),
            currentElement && currentElement.parentNode)
          )
            currentElement.parentNode.removeChild(currentElement);
        }
        queueOperation({
          op: "remove",
          id: slideId,
        });
      },
      duplicate(slideId: Dynamic, requestedId: Dynamic): Dynamic {
        if (
          (requireActiveReply(),
          requireSlideId(slideId, "id"),
          requestedId !== undefined)
        ) {
          if (typeof requestedId !== "string" || !validFileId.test(requestedId))
            fail("newId must be letters, digits, - or _ (at most 64)");
          if (slideIndex(requestedId) >= 0 || (state && state.slides.has(requestedId)))
            fail('a slide with the id "' + requestedId + '" exists already');
        }
        if (!state) {
          slides.splice(slideIndex(slideId) + 1, 0, {
            id: requestedId === undefined ? null : requestedId,
            title: slides[slideIndex(slideId)].title,
          });
          queueOperation(
            requestedId === undefined
              ? {
                  op: "duplicate",
                  id: slideId,
                }
              : {
                  op: "duplicate",
                  id: slideId,
                  newId: requestedId,
                },
          );
          return;
        }
        checkSlideCapacity();
        let sourceSlide: Dynamic =
          slideId === currentId ? null : state.ensure(state.slides.get(slideId));
        if (sourceSlide && !sourceSlide.made) state.touch(slideId);
        let duplicateId: Dynamic =
          requestedId === undefined ? mintSlideId(slideId + "-copy") : requestedId;
        let holder: Dynamic = document.createElement("div");
        let duplicateElement: Dynamic = (sourceSlide ? sourceSlide.el : currentElement).cloneNode(
          true,
        );
        if (duplicateElement.getAttribute("id") !== null)
          duplicateElement.setAttribute("id", duplicateId);
        holder.appendChild(duplicateElement);
        let duplicateSlide: Dynamic = createSlideEntry(
          duplicateId,
          duplicateElement,
          holder,
          "",
          sourceSlide ? sourceSlide.hadTbody : originalHadTbody,
        );
        slides.splice(slideIndex(slideId) + 1, 0, {
          id: duplicateId,
          title: slides[slideIndex(slideId)].title,
        });
        queueOperation(
          requestedId === undefined
            ? {
                op: "duplicate",
                id: slideId,
                newId: duplicateId,
                minted: true,
              }
            : {
                op: "duplicate",
                id: slideId,
                newId: requestedId,
              },
          duplicateSlide,
        );
        return jquery(duplicateElement);
      },
      add(slideHtml: Dynamic, placement: Dynamic): Dynamic {
        if ((requireActiveReply(), slideHtml && slideHtml.jquery))
          slideHtml = slideHtml[0] && slideHtml[0].outerHTML;
        else if (
          slideHtml &&
          typeof slideHtml === "object" &&
          typeof slideHtml.outerHTML === "string"
        )
          slideHtml = slideHtml.outerHTML;
        if (typeof slideHtml !== "string")
          fail("add(html) takes ONE <section …>…</section> as a string");
        if (((slideHtml = slideHtml.trim()), slideHtml.length > limits.maxHtml))
          fail("the new slide is over " + limits.maxHtml + " characters");
        if (!/^<section[\s>]/i.test(slideHtml))
          fail("the new slide must start with <section");
        if (state && state.currentRemoved && placement === undefined)
          fail("say where: {before: id} or {after: id}");
        let validatedPlacement: Dynamic = validatePlace(placement, {
          after: currentId,
        });
        scratchElement.innerHTML = slideHtml;
        let children: Dynamic = scratchElement.children;
        let sectionElement: Dynamic =
          children.length === 1 && children[0].tagName === "SECTION"
            ? children[0]
            : null;
        let suppliedId: Dynamic = sectionElement && sectionElement.getAttribute("id");
        if (((scratchElement.innerHTML = ""), !sectionElement))
          fail("add(html) takes exactly one <section>");
        if (suppliedId !== null && suppliedId !== undefined) {
          if (!validFileId.test(suppliedId))
            fail(
              "the new slide's id must be letters, digits, - or _ (at most 64)",
            );
          if (slideIndex(suppliedId) >= 0 || (state && state.slides.has(suppliedId)))
            fail('a slide with the id "' + suppliedId + '" exists already');
        }
        if (!state) {
          insertSlide(
            {
              id: suppliedId || null,
              title: "",
            },
            validatedPlacement,
          );
          queueOperation(
            Object.assign(
              {
                op: "add",
                html: slideHtml,
              },
              suppliedId
                ? {
                    id: suppliedId,
                  }
                : {},
              validatedPlacement,
            ),
          );
          return;
        }
        checkSlideCapacity();
        let slideId: Dynamic = suppliedId || mintSlideId("slide");
        let holder: Dynamic = document.createElement("div");
        holder.innerHTML = slideHtml;
        let newSlide: Dynamic = createSlideEntry(
          slideId,
          holder.querySelector("section"),
          holder,
          slideHtml,
          /<tbody[\s>]/i.test(slideHtml),
        );
        insertSlide(
          {
            id: slideId,
            title: "",
          },
          validatedPlacement,
        );
        queueOperation(
          Object.assign(
            {
              op: "add",
              html: slideHtml,
              id: slideId,
            },
            suppliedId
              ? {}
              : {
                  minted: true,
                },
            validatedPlacement,
          ),
          newSlide,
        );
        return jquery(newSlide.el);
      },
    };
    if (state)
      Object.defineProperties(
        api,
        Object.getOwnPropertyDescriptors({
          slide(slideId: Dynamic): Dynamic {
            requireRunningReply();
            let filtered: Dynamic = [...state.slides.keys()].filter(
              (candidateId?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
                !state.slides.get(candidateId).removed,
            );
            if (slideId === currentId && state.currentRemoved && currentId)
              fail("this slide was removed");
            if (
              typeof slideId !== "string" ||
              !state.slides.has(slideId) ||
              state.slides.get(slideId).removed
            )
              fail(
                "no slide with the id " +
                  JSON.stringify(slideId) +
                  "; the slides are: " +
                  filtered.join(", "),
              );
            if (slideId === currentId) return jquery(currentElement);
            let slideEntry: Dynamic = state.ensure(state.slides.get(slideId));
            state.touch(slideId);
            return jquery(slideEntry.el);
          },
          all(selector: Dynamic): Dynamic {
            if (
              (requireRunningReply(),
              selector !== undefined && typeof selector !== "string")
            )
              fail("all(selector) takes a selector string, or nothing");
            let items: Dynamic = [];
            for (let slide of slides) {
              let slideEntry: Dynamic = slide.id && state.slides.get(slide.id);
              if (!slideEntry || slideEntry.removed) continue;
              if (slide.id === currentId) {
                if (selector === undefined) items.push(currentElement);
                else items.push(...jquery(document.body).find(selector).toArray());
                continue;
              }
              if (
                (state.ensure(slideEntry),
                state.touch(slide.id),
                selector === undefined)
              )
                items.push(slideEntry.el);
              else items.push(...jquery(slideEntry.holder).find(selector).toArray());
            }
            return jquery().pushStack(items);
          },
          get layouts(): Dynamic {
            return Object.keys(state.layouts);
          },
          layout(layoutName: Dynamic): Dynamic {
            if (
              typeof layoutName !== "string" ||
              !Object.prototype.hasOwnProperty.call(state.layouts, layoutName)
            )
              fail(
                "no layout named " +
                  JSON.stringify(layoutName) +
                  "; the layouts are: " +
                  Object.keys(state.layouts).join(", "),
              );
            return state.layouts[layoutName];
          },
          title(titleText: Dynamic): Dynamic {
            if (titleText === undefined) return state.title;
            if (
              (requireActiveReply(),
              typeof titleText !== "string" || !titleText.trim() || titleText.length > 300)
            )
              fail("title(text) takes 1 to 300 characters");
            state.title = titleText.trim();
            queueOperation({
              op: "title",
              title: state.title,
            });
          },
          section(startSlideId: Dynamic, title: Dynamic): Dynamic {
            requireRunningReply();
            requireSlideId(startSlideId, "id");
            let index: Dynamic = state.sections.findIndex(
              (section?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
                section.start === startSlideId,
            );
            let listSectionStartIds: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic =>
              state.sections
                .map(
                  (
                    section?: Dynamic,
                    ..._unusedCallbackArgs: Dynamic[]
                  ): Dynamic => section.start,
                )
                .join(", ") || "(none)";
            let validateSectionTitle: Dynamic = (
              candidateTitle?: Dynamic,
              ..._unusedArgs: Dynamic[]
            ): Dynamic => {
              if (
                typeof candidateTitle !== "string" ||
                !candidateTitle.trim() ||
                candidateTitle.length > 300
              )
                fail("a section title takes 1 to 300 characters");
              return candidateTitle.trim();
            };
            let createSectionHandle: Dynamic = (
              sectionStartId?: Dynamic,
              ..._unusedArgs: Dynamic[]
            ): Dynamic =>
              Object.freeze({
                start: sectionStartId,
                get title(): Dynamic {
                  let match: Dynamic = state.sections.find(
                    (
                      section?: Dynamic,
                      ..._unusedCallbackArgs: Dynamic[]
                    ): Dynamic => section.start === sectionStartId,
                  );
                  return match ? match.title : undefined;
                },
                rename: Object.freeze(
                  (
                    nextTitle?: Dynamic,
                    ..._unusedRenameArgs: Dynamic[]
                  ): Dynamic => {
                    requireActiveReply();
                    let match: Dynamic = state.sections.find(
                      (
                        section?: Dynamic,
                        ..._unusedCallbackArgs: Dynamic[]
                      ): Dynamic => section.start === sectionStartId,
                    );
                    if (!match)
                      fail('no section starts at "' + sectionStartId + '" any more');
                    match.title = validateSectionTitle(nextTitle);
                    queueOperation({
                      op: "section",
                      action: "rename",
                      id: sectionStartId,
                      title: match.title,
                    });
                  },
                ),
                remove: Object.freeze(
                  (..._unusedRemoveArgs: Dynamic[]): Dynamic => {
                    requireActiveReply();
                    let sectionIndex: Dynamic = state.sections.findIndex(
                      (
                        section?: Dynamic,
                        ..._unusedCallbackArgs: Dynamic[]
                      ): Dynamic => section.start === sectionStartId,
                    );
                    if (sectionIndex < 0)
                      fail('no section starts at "' + sectionStartId + '" any more');
                    state.sections.splice(sectionIndex, 1);
                    queueOperation({
                      op: "section",
                      action: "remove",
                      id: sectionStartId,
                    });
                  },
                ),
              });
            if (arguments.length < 2 || title === undefined) {
              if (index < 0)
                fail(
                  'no section starts at "' +
                    startSlideId +
                    '"; sections start at: ' +
                    listSectionStartIds(),
                );
              return createSectionHandle(startSlideId);
            }
            requireActiveReply();
            let sectionTitle: Dynamic = validateSectionTitle(title);
            if (index >= 0)
              fail(
                'a section already starts at "' +
                  startSlideId +
                  '"; use deck.section("' +
                  startSlideId +
                  '").rename(title)',
              );
            if (state.sections.length >= 64) fail("at most 64 sections");
            state.sections.push({
              start: startSlideId,
              title: sectionTitle,
            });
            queueOperation({
              op: "section",
              action: "start",
              id: startSlideId,
              title: sectionTitle,
            });
            return createSectionHandle(startSlideId);
          },
          sections(): Dynamic {
            return state.sections
              .filter(
                (section?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
                  slideIndex(section.start) >= 0,
              )
              .sort(
                (
                  leftSection?: Dynamic,
                  rightSection?: Dynamic,
                  ..._unusedCallbackArgs: Dynamic[]
                ): Dynamic =>
                  slideIndex(leftSection.start) - slideIndex(rightSection.start),
              )
              .map(
                (
                  section?: Dynamic,
                  ..._unusedCallbackArgs: Dynamic[]
                ): Dynamic => ({
                  start: section.start,
                  title: section.title,
                }),
              );
          },
          undo(): Dynamic {
            requireActiveReply();
            queueOperation({
              op: "undo",
            });
            state.halted = true;
          },
        }),
      );
    function requireRunningReply(..._unusedArgs: Dynamic[]): Dynamic {
      if (state && state.halted) fail("the reply ended at deck.undo()");
    }
    for (let methodName of ["move", "remove", "duplicate", "add"].concat(
      state
        ? ["slide", "all", "layout", "title", "undo", "section", "sections"]
        : [],
    ))
      Object.freeze(api[methodName]);
    return Object.freeze(api);
  }
  function createProjectState(
    metadata?: Dynamic,
    sdk?: Dynamic,
    html?: Dynamic,
    ..._unusedProjectArgs: Dynamic[]
  ): Dynamic {
    let state: Dynamic = {
      current: String(metadata.current),
      slides: new Map(),
      layouts: Object.create(null),
      title: "",
      ops: [],
      touched: new Set(),
      n: 0,
      logged: 0,
      logChars: 0,
      logCalls: 0,
      halted: false,
      order: (..._unusedCallbackArgs: Dynamic[]): Dynamic => [],
    };
    let texts: Dynamic = (sdk && sdk.texts) || {};
    for (let slideMetadata of metadata.slides) {
      let slideId: Dynamic = String(slideMetadata && slideMetadata.id);
      if (validFileId.test(slideId) && !state.slides.has(slideId))
        state.slides.set(slideId, {
          id: slideId,
          text: typeof texts[slideId] === "string" ? texts[slideId] : "",
          holder: null,
          el: null,
          last: null,
          removed: false,
          hadTbody: true,
        });
    }
    if (state.current && !state.slides.has(state.current))
      state.slides.set(state.current, {
        id: state.current,
        text: "",
        holder: null,
        el: null,
        last: null,
        removed: false,
        hadTbody: true,
      });
    if (sdk && sdk.layouts && typeof sdk.layouts === "object") {
      for (let layoutName of Object.keys(sdk.layouts))
        if (validFileId.test(layoutName) && typeof sdk.layouts[layoutName] === "string")
          state.layouts[layoutName] = sdk.layouts[layoutName];
    }
    if (sdk && typeof sdk.title === "string")
      state.title = sdk.title.slice(0, 300);
    state.sections = [];
    state.v3 = !!sdk && sdk.version === 3;
    state.paths = new Map();
    state.pathOf = new Map();
    state.kOf = new WeakMap();
    state.elOf = new Map();
    state.kN = 0;
    state.rows = [];
    state.currentRemoved = false;
    state.goneMsg = "deck: this slide was removed";
    let throwRemovedSlide: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic => {
      throw Error(state.goneMsg);
    };
    if (
      ((state.ghost = new Proxy(
        function (..._unusedCallbackArgs: Dynamic[]): Dynamic {},
        {
          get: (
            _target?: Dynamic,
            propertyName?: Dynamic,
            ..._unusedCallbackArgs: Dynamic[]
          ): Dynamic =>
            typeof propertyName === "symbol" || propertyName === "then"
              ? undefined
              : throwRemovedSlide(),
          set: throwRemovedSlide,
          has: throwRemovedSlide,
          apply: throwRemovedSlide,
          construct: throwRemovedSlide,
        },
      )),
      sdk && Array.isArray(sdk.sections))
    ) {
      for (let savedSection of sdk.sections)
        if (
          savedSection &&
          state.slides.has(String(savedSection.start)) &&
          typeof savedSection.title === "string" &&
          !state.sections.some(
            (section?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
              section.start === savedSection.start,
          )
        )
          state.sections.push({
            start: String(savedSection.start),
            title: savedSection.title.slice(0, 300),
          });
    }
    state.ensure = (
      entry?: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic => {
      if (entry.holder) return entry;
      let holder: Dynamic = document.createElement("div");
      holder.innerHTML = entry.text;
      let element: Dynamic = holder.querySelector("section");
      if (!element)
        throw Error('deck: the slide "' + entry.id + '" has no <section>');
      entry.holder = holder;
      entry.el = element;
      entry.hadTbody = /<tbody[\s>]/i.test(entry.text);
      for (let styledElement of [element, ...element.querySelectorAll("[style]")])
        if (styledElement.getAttribute("style") !== null)
          originalStyles.set(styledElement, styledElement.getAttribute("style"));
      entry.last = state.text(entry);
      return entry;
    };
    state.text = (
      entry?: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic => {
      let element: Dynamic = entry.holder.querySelector("section");
      if (!element) {
        entry.holder.innerHTML = entry.last;
        element = entry.holder.querySelector("section");
        entry.el = element;
        for (let styledElement of [element, ...element.querySelectorAll("[style]")])
          if (styledElement.getAttribute("style") !== null)
            originalStyles.set(styledElement, styledElement.getAttribute("style"));
        throw Error(
          'the <section> of the slide "' + entry.id + '" was removed; restored',
        );
      }
      entry.el = element;
      let slideHtml: Dynamic = serializeElement(element);
      return entry.hadTbody ? slideHtml : slideHtml.replace(/<\/?tbody>/g, "");
    };
    state.touch = (
      slideId?: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic => {
      if (
        slideId !== state.current &&
        !state.touched.has(slideId) &&
        !(state.slides.get(slideId) || {}).made
      ) {
        state.touched.add(slideId);
        emit({
          kind: "touch" as const,
          seq: sequence++,
          n: state.n,
          slideId: slideId,
        });
      }
    };
    state.log = Object.freeze(function (
      loggedValue?: Dynamic,
      ..._unusedLogArgs: Dynamic[]
    ): Dynamic {
      let logText: Dynamic;
      try {
        if (loggedValue && loggedValue.jquery)
          logText = loggedValue
            .toArray()
            .map(
              (item?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
                item && typeof item.outerHTML === "string"
                  ? item.outerHTML
                  : String(
                      item && item.textContent !== undefined
                        ? item.textContent
                        : item,
                    ),
            ).join(`
`);
        else if (
          loggedValue &&
          typeof loggedValue === "object" &&
          typeof loggedValue.outerHTML === "string"
        )
          logText = loggedValue.outerHTML;
        else if (typeof loggedValue === "string") logText = loggedValue;
        else if (loggedValue !== null && typeof loggedValue === "object") {
          if (((logText = JSON.stringify(loggedValue)), logText === undefined))
            logText = String(loggedValue);
        } else logText = String(loggedValue);
      } catch (_serializationError: Dynamic) {
        logText = String(loggedValue);
      }
      let count: Dynamic = 12000;
      let totalLogCharacterLimit: Dynamic = 24576;
      let logCallLimit: Dynamic = 12;
      let wasTruncated: Dynamic = logText.length > count;
      if (state.logCalls >= logCallLimit)
        throw Error(
          "log: at most " +
            logCallLimit +
            " values in one run; end the reply and read what you have",
        );
      if (wasTruncated) logText = logText.slice(0, count);
      if (state.logChars + logText.length > totalLogCharacterLimit)
        throw Error(
          "log: over 24 KB of values in this run; end the reply and read what you have",
        );
      state.logChars += logText.length;
      state.logged++;
      state.logCalls++;
      emit({
        kind: "log" as const,
        n: state.n,
        message: logText,
        cut: wasTruncated,
      });
    });
    return state;
  }
  function initializeFileSdk(
    metadata?: Dynamic,
    sdk?: Dynamic,
    ..._unusedInitializeArgs: Dynamic[]
  ): Dynamic {
    let state: Dynamic = project;
    let container: Dynamic = document.body;
    let documentRoot: Dynamic = document.documentElement;
    let head: Dynamic = document.head;
    let currentFileId: Dynamic = String(metadata.current || "");
    if (sdk.paths) {
      for (let pathKey of Object.keys(sdk.paths))
        if (
          state.slides.has(pathKey) &&
          typeof sdk.paths[pathKey] === "string"
        ) {
          state.paths.set(sdk.paths[pathKey], pathKey);
          state.pathOf.set(pathKey, sdk.paths[pathKey]);
        }
    }
    state.one = true;
    state.current = "";
    state.currentRemoved = true;
    state.entryOf = new WeakMap();
    state.origId = new WeakMap();
    state.copyOf = new WeakMap();
    state.whereOf = new WeakMap();
    state.opsLeft = 24;
    state.retired = new Set();
    container.innerHTML = "";
    container.setAttribute("id", "container");
    let textSlides: Dynamic = [...state.slides.values()]
      .map(
        (slide?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          slide.text,
      )
      .concat(
        Object.keys(state.layouts).map(
          (layoutId?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            state.layouts[layoutId],
        ),
      );
    state.P = "k";
    while (
      textSlides.some(
        (text?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          new RegExp(`id\\s*=\\s*["']?` + state.P + "\\d").test(text),
      )
    )
      state.P =
        "k" +
        Math.random()
          .toString(36)
          .replace(/[^a-z]/g, "")
          .slice(0, 2)
          .padEnd(2, "q");
    let hasOwnedId: Dynamic = (
      elementId?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic =>
      typeof elementId === "string" &&
      elementId.startsWith(state.P) &&
      /^\d{1,6}$/.test(elementId.slice(state.P.length));
    let captureStyles: Dynamic = (
      rootElement?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      for (let element of [rootElement, ...rootElement.querySelectorAll("[style]")])
        if (element.getAttribute("style") !== null)
          originalStyles.set(element, element.getAttribute("style"));
    };
    let registerElement: Dynamic = (
      entry?: Dynamic,
      element?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      entry.el = element;
      entry.holder = container;
      state.entryOf.set(element, entry);
      captureStyles(element);
    };
    for (let slide of state.slides.values()) {
      let slideContainer: Dynamic = document.createElement("div");
      slideContainer.innerHTML = slide.text;
      let slideElement: Dynamic =
        slideContainer.children.length === 1 && slide.id !== "container"
          ? slideContainer.children[0]
          : null;
      if (!slideElement) {
        emitError(
          'the file "' +
            slide.id +
            '" must be ONE element (it has ' +
            slideContainer.children.length +
            ")",
          "",
        );
        slide.removed = true;
        continue;
      }
      slide.rootId = slideElement.getAttribute("id");
      slide.hadTbody = /<tbody[\s>]/i.test(slide.text);
      slide.hadSection = slideElement.getAttribute("data-section") !== null;
      slide.section = null;
      slideElement.setAttribute("id", slide.id);
      slide.idAt = [...slideElement.attributes].findIndex(
        (attribute?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          attribute.name === "id",
      );
      container.appendChild(slideElement);
      registerElement(slide, slideElement);
      for (let element of slideElement.querySelectorAll("[id]"))
        if (state.slides.has(element.getAttribute("id"))) {
          state.origId.set(element, element.getAttribute("id"));
          element.removeAttribute("id");
        }
    }
    for (let section of state.sections) {
      let entry: Dynamic = state.slides.get(section.start);
      if (entry && !entry.removed) {
        if (((entry.section = section.title), !entry.hadSection))
          entry.el.setAttribute("data-section", section.title);
      }
    }
    let setOrder: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic =>
      [...container.children]
        .map(
          (element?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            state.entryOf.get(element),
        )
        .filter(
          (entry?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            entry && !entry.removed,
        )
        .map(
          (entry?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
            entry.id,
        );
    state.order = setOrder;
    state.fileOf = (
      element?: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic => {
      let ancestorElement: Dynamic = element;
      while (ancestorElement && ancestorElement.parentNode && ancestorElement.parentNode !== container)
        ancestorElement = ancestorElement.parentNode;
      let currentEntry: Dynamic =
        ancestorElement && ancestorElement.parentNode === container
          ? state.entryOf.get(ancestorElement)
          : null;
      return currentEntry && !currentEntry.removed ? currentEntry.id : null;
    };
    state.used = new Set();
    state.started = false;
    state.assign = (..._unusedCallbackArgs: Dynamic[]): Dynamic => {
      let unhandledElements: Dynamic = [];
      for (let fileElement of container.children) {
        let fileEntry: Dynamic = state.entryOf.get(fileElement);
        if (!fileEntry || fileEntry.removed) continue;
        for (let element of fileElement.querySelectorAll("*")) {
          let oldHandle: Dynamic = state.kOf.get(element);
          let elementId: Dynamic = element.getAttribute("id");
          if (
            oldHandle !== undefined &&
            elementId !== null &&
            elementId !== oldHandle &&
            hasOwnedId(elementId) &&
            !state.used.has(elementId) &&
            /^[1-9]/.test(elementId.slice(state.P.length))
          ) {
            state.used.add(elementId);
            state.elOf.delete(oldHandle);
            state.kOf.set(element, elementId);
            state.elOf.set(elementId, element);
            state.rehandled.add(fileEntry.id);
            continue;
          }
          if (oldHandle !== undefined) {
            if (elementId === oldHandle) continue;
            if (
              elementId === null ||
              (hasOwnedId(elementId) && state.elOf.get(elementId) !== element)
            ) {
              element.setAttribute("id", oldHandle);
              continue;
            }
            state.kOf.delete(element);
            state.elOf.delete(oldHandle);
            state.rehandled.add(fileEntry.id);
            continue;
          }
          if (
            elementId !== null &&
            !(hasOwnedId(elementId) && state.elOf.get(elementId) !== element)
          )
            continue;
          if (
            elementId !== null &&
            state.started &&
            !state.used.has(elementId) &&
            /^[1-9]/.test(elementId.slice(state.P.length))
          ) {
            state.used.add(elementId);
            state.kOf.set(element, elementId);
            state.elOf.set(elementId, element);
            state.rows.push(element);
            state.rehandled.add(fileEntry.id);
            continue;
          }
          unhandledElements.push([element, fileEntry]);
        }
      }
      for (let [fileElement, fileEntry] of unhandledElements) {
        let element: Dynamic;
        do element = state.P + ++state.kN;
        while (state.used.has(element));
        state.used.add(element);
        fileElement.setAttribute("id", element);
        state.kOf.set(fileElement, element);
        state.elOf.set(element, fileElement);
        state.rows.push(fileElement);
        state.rehandled.add(fileEntry.id);
      }
    };
    state.clean = (
      entry?: Dynamic,
      ..._unusedCleanArgs: Dynamic[]
    ): Dynamic => {
      serializeElement(entry.el);
      let clonedElement: Dynamic = entry.el.cloneNode(true);
      let elements: Dynamic = [entry.el, ...entry.el.querySelectorAll("*")];
      let clonedElements: Dynamic = [clonedElement, ...clonedElement.querySelectorAll("*")];
      if (
        (elements.forEach(
          (
            element?: Dynamic,
            index?: Dynamic,
            ..._unusedCallbackArgs: Dynamic[]
          ): Dynamic => {
            if (!clonedElements[index] || index === 0) return;
            if (state.origId.has(element))
              clonedElements[index].setAttribute(
                "id",
                state.origId.get(element),
              );
            else if (
              state.kOf.get(element) !== undefined &&
              clonedElements[index].getAttribute("id") ===
                state.kOf.get(element)
            )
              clonedElements[index].removeAttribute("id");
            else if (hasOwnedId(clonedElements[index].getAttribute("id")))
              clonedElements[index].removeAttribute("id");
          },
        ),
        entry.rootId === null || entry.rootId === undefined)
      ) {
        if (entry.made) clonedElement.setAttribute("id", entry.id);
        else clonedElement.removeAttribute("id");
      } else clonedElement.setAttribute("id", entry.rootId);
      if (!entry.hadSection) clonedElement.removeAttribute("data-section");
      let html: Dynamic = clonedElement.outerHTML;
      return entry.hadTbody ? html : html.replace(/<\/?tbody>/g, "");
    };
    state.text = state.clean;
    state.ensure = (
      id?: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic => id;
    state.view = (id?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic => {
      let entry: Dynamic = state.slides.get(id);
      if (!entry || entry.removed) return null;
      serializeElement(entry.el);
      let outerHTML: Dynamic = entry.el.outerHTML;
      return entry.hadTbody
        ? outerHTML
        : outerHTML.replace(/<(\/?)tbody( id="[^"]*")?>/g, "");
    };
    state.list = (
      since?: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic => {
      let rows: Dynamic = [];
      for (let element of state.rows) {
        let handle: Dynamic = state.kOf.get(element);
        if (handle === undefined || +handle.slice(state.P.length) <= since)
          continue;
        let fileId: Dynamic = state.fileOf(element);
        if (fileId)
          rows.push({
            k: handle,
            file: fileId,
            tag: element.tagName
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "")
              .slice(0, 20),
            words: truncate(
              (element.textContent || "").replace(/\s+/g, " ").trim(),
              40,
            ),
          });
        if (rows.length >= 4000) break;
      }
      return rows;
    };
    state.attr = "id";
    state.seen = (
      elements?: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic => {
      if (state.previewing) return elements;
      for (
        let index: Dynamic = 0;
        index < elements.length && index < 200;
        index++
      ) {
        let fileId: Dynamic =
          elements[index] && elements[index].nodeType === 1
            ? state.fileOf(elements[index])
            : null;
        if (
          fileId &&
          !state.touched.has(fileId) &&
          !state.slides.get(fileId).made
        ) {
          state.touched.add(fileId);
          emit({
            kind: "touch" as const,
            seq: sequence++,
            n: state.n,
            slideId: fileId,
          });
        }
      }
      return elements;
    };
    let find: Dynamic = jquery.find;
    jquery.find = Object.assign(function (
      this: Dynamic,
      ..._unusedCallbackArgs: Dynamic[]
    ): Dynamic {
      return state.seen(find.apply(this, arguments));
    }, find);
    let clone: Dynamic = jquery.fn.clone;
    jquery.fn.clone = function (
      this: Dynamic,
      ..._unusedCloneArgs: Dynamic[]
    ): Dynamic {
      let clones: Dynamic = clone.apply(this, arguments);
      this.each(
        (
          cloneIndex?: Dynamic,
          sourceElement?: Dynamic,
          ..._unusedCallbackArgs: Dynamic[]
        ): Dynamic => {
          let entry: Dynamic = state.entryOf.get(sourceElement);
          if (entry && !entry.removed && clones[cloneIndex]) {
            if ((state.copyOf.set(clones[cloneIndex], entry.id), !entry.hadSection))
              clones[cloneIndex].removeAttribute("data-section");
          }
        },
      );
      return clones;
    };
    let validateIdChange: Dynamic = (
      element?: Dynamic,
      nextId?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      if (element === container) throw Error("#container keeps its id");
      let entry: Dynamic = state.entryOf.get(element);
      if (
        entry &&
        !entry.removed &&
        element.parentNode === container &&
        nextId !== entry.id
      )
        throw Error(
          'a file keeps its id ("' +
            entry.id +
            '"); clone it and give the COPY a new id',
        );
    };
    jquery.attrHooks.id = {
      set: (
        element?: Dynamic,
        id?: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic => {
        validateIdChange(element, String(id));
        element.setAttribute("id", String(id));
        return id;
      },
    };
    let removeAttr: Dynamic = jquery.fn.removeAttr;
    jquery.fn.removeAttr = function (
      this: Dynamic,
      styleValue?: Dynamic,
      ..._unusedRemoveAttrArgs: Dynamic[]
    ): Dynamic {
      if (/(^|\s)id(\s|$)/i.test(String(styleValue)))
        this.each(
          (
            id?: Dynamic,
            fallback?: Dynamic,
            ..._unusedCallbackArgs: Dynamic[]
          ): Dynamic => validateIdChange(fallback, null),
        );
      return removeAttr.apply(this, arguments);
    };
    let removeElements: Dynamic = (
      elements?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      for (let index: Dynamic = 0; index < elements.length; index++)
        if (
          elements[index] === container ||
          elements[index] === documentRoot ||
          elements[index] === head
        )
          throw Error(
            "change the files, not the page: $('#id')… for one file, $('body > *')… for all of them",
          );
    };
    for (let method of ["empty", "replaceWith", "remove", "detach"]) {
      let originalMethod: Dynamic = jquery.fn[method];
      jquery.fn[method] = function (
        this: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic {
        removeElements(this);
        return originalMethod.apply(this, arguments);
      };
    }
    for (let method of ["html", "text"]) {
      let originalMethod: Dynamic = jquery.fn[method];
      jquery.fn[method] = function (
        this: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic {
        if (arguments.length) removeElements(this);
        return originalMethod.apply(this, arguments);
      };
    }
    for (let method of ["write", "writeln", "open", "close"])
      document[method] = (..._unusedCallbackArgs: Dynamic[]): Dynamic => {
        throw Error(
          "document." + method + " is not available: change the elements",
        );
      };
    document.title = state.title;
    state.rehandled = new Set();
    state.assign();
    state.rehandled.clear();
    state.kN += 1e5;
    state.started = true;
    for (let slide of state.slides.values())
      if (!slide.removed) {
        slide.last = state.clean(slide);
        slide.raw = slide.el.outerHTML;
      }
    state.prev = setOrder();
    state.settle = (..._unusedSettleArgs: Dynamic[]): Dynamic => {
      let operations: Dynamic = [];
      let frames: Dynamic = [];
      let problems: Dynamic = [];
      if (document.documentElement !== documentRoot) {
        try {
          document.replaceChild(documentRoot, document.documentElement);
        } catch (expectedOrder: Dynamic) {}
        problems.push("the document element cannot be replaced; put back");
      }
      if (head && head.parentNode !== documentRoot) {
        documentRoot.insertBefore(head, documentRoot.firstChild);
        problems.push("head cannot be removed; put back");
      }
      if (container.getAttribute("id") !== "container") {
        container.setAttribute("id", "container");
        problems.push("#container keeps its id; put back");
      }
      if (container.parentNode !== documentRoot) {
        for (let expectedOrder of [...documentRoot.children])
          if (expectedOrder.tagName === "BODY" && expectedOrder !== container)
            documentRoot.removeChild(expectedOrder);
        documentRoot.appendChild(container);
        problems.push("body cannot be replaced; put back");
      }
      let restoreOrder: Dynamic = (
        order?: Dynamic,
        ..._unusedArgs: Dynamic[]
      ): Dynamic => {
        for (let slideId of order)
          container.appendChild(state.slides.get(slideId).el);
      };
      let rollbackStructure: Dynamic = (
        problem?: Dynamic,
        suffix: Dynamic = "; the files are as they were",
        ..._unusedArgs: Dynamic[]
      ): Dynamic => {
        for (let child of [...container.children])
          if (!state.entryOf.get(child) || state.entryOf.get(child).removed)
            container.removeChild(child);
        restoreOrder(state.prev);
        problems.push(problem + suffix);
      };
      let children: Dynamic = [...container.children];
      let newElements: Dynamic = [];
      let activeEntry: Dynamic = (
        slideId?: Dynamic,
        ..._unusedArgs: Dynamic[]
      ): Dynamic => {
        let entry: Dynamic = state.slides.get(slideId);
        return entry && !entry.removed ? entry : null;
      };
      for (let expectedOrder of children) {
        let mintId: Dynamic = state.entryOf.get(expectedOrder);
        let actualOrder: Dynamic = expectedOrder.getAttribute("id");
        if (mintId && !mintId.removed) {
          if (actualOrder !== mintId.id) {
            if (actualOrder !== null)
              expectedOrder.setAttribute("id", mintId.id);
            else {
              let mapped: Dynamic = [...expectedOrder.attributes].map(
                (
                  attribute?: Dynamic,
                  ..._unusedCallbackArgs: Dynamic[]
                ): Dynamic => [attribute.name, attribute.value],
              );
              for (let [attributeName] of mapped)
                expectedOrder.removeAttribute(attributeName);
              mapped.splice(Math.min(mintId.idAt, mapped.length), 0, [
                "id",
                mintId.id,
              ]);
              for (let [attributeName, attributeValue] of mapped)
                expectedOrder.setAttribute(attributeName, attributeValue);
            }
            problems.push('a file keeps its id ("' + mintId.id + '")');
          }
          continue;
        }
        let activeSlide: Dynamic = actualOrder !== null && activeEntry(actualOrder);
        if (activeSlide && activeSlide.el.parentNode !== container) {
          registerElement(activeSlide, expectedOrder);
          continue;
        }
        newElements.push(expectedOrder);
      }
      let removedIds: Dynamic = state.prev.filter(
        (slideId?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          activeEntry(slideId) && activeEntry(slideId).el.parentNode !== container,
      );
      let PLAIN_FILE_ID: Dynamic = /^[A-Za-z][A-Za-z0-9_-]{0,23}$/;
      let RESERVED_HANDLE_ID: Dynamic = /^k[a-z]{0,2}\d{1,6}$/;
      let RESERVED_NAMES: Dynamic = [
        "container",
        "constructor",
        "prototype",
        "__proto__",
        "body",
        "html",
        "head",
      ];
      let proposedId: Dynamic = (
        element?: Dynamic,
        ..._unusedArgs: Dynamic[]
      ): Dynamic => {
        let attribute: Dynamic = element.getAttribute("id");
        return attribute === state.copyOf.get(element) ? null : attribute;
      };
      let validateNewFileId: Dynamic = (
        proposedSlideId?: Dynamic,
        ..._unusedValidationArgs: Dynamic[]
      ): Dynamic => {
        let slideId: Dynamic = proposedId(proposedSlideId);
        let existingSlide: Dynamic = slideId !== null && state.slides.get(slideId);
        let createError: Dynamic = (
          errorCode?: Dynamic,
          message?: Dynamic,
          ..._unusedArgs: Dynamic[]
        ): Dynamic => [
          message,
          Object.assign(
            {
              code: errorCode,
            },
            errorCode !== "not_plain" && validFileId.test(slideId)
              ? {
                  id: slideId,
                }
              : {},
          ),
        ];
        return slideId === null
          ? null
          : existingSlide && existingSlide.removed && existingSlide.el
            ? createError(
                "removed",
                "#" +
                  slideId +
                  " was removed earlier in this reply; its id is free again in the next reply.",
              )
            : existingSlide
              ? createError(
                  "exists",
                  "#" +
                    slideId +
                    " exists. Write to it to change it, or pick another id.",
                )
              : RESERVED_NAMES.includes(slideId.toLowerCase()) ||
                  RESERVED_HANDLE_ID.test(slideId)
                ? createError(
                    "own",
                    "#" +
                      slideId +
                      " is one of the page's own names. Pick another id.",
                  )
                : PLAIN_FILE_ID.test(slideId)
                  ? null
                  : createError(
                      "not_plain",
                      "#" +
                        truncate(
                          slideId.replace(
                            /[\x00-\x1f\x7f-\x9f\u2028\u2029]/g,
                            "",
                          ),
                          24,
                        ) +
                        " cannot be an id (letters, digits, - and _; a letter first; 24 at most). Pick another id.",
                    );
      };
      let idProblem: Dynamic = newElements.map(validateNewFileId).find(Boolean);
      let newFileCount: Dynamic = newElements.length;
      if (idProblem) {
        rollbackStructure(
          idProblem[0],
          " Nothing was added; other changes stand; the rest of the reply was not run.",
        );
        problems.push([problems.pop(), idProblem[1]]);
        state.halted = true;
      } else if (
        state.prev.length - removedIds.length + newElements.length >
        512
      )
        rollbackStructure("at most 512 files");
      else if (newFileCount > state.opsLeft)
        rollbackStructure(
          "this would make " +
            newFileCount +
            " new file" +
            (newFileCount === 1 ? "" : "s") +
            ", and " +
            state.opsLeft +
            " structural change" +
            (state.opsLeft === 1 ? " is" : "s are") +
            " left in this run (a remove is free)",
        );
      else {
        for (let slideId of removedIds) {
          let slide: Dynamic = activeEntry(slideId);
          slide.removed = true;
          operations.push({
            op: "remove",
            id: slideId,
          });
        }
        let expectedOrder: Dynamic = state.prev.filter(
          (slideId?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
            !removedIds.includes(slideId),
        );
        let mintId: Dynamic = (
          sourceId?: Dynamic,
          prefix?: Dynamic,
          ..._unusedArgs: Dynamic[]
        ): Dynamic => {
          if (proposedId(sourceId) !== null) return [proposedId(sourceId), false];
          let baseId: Dynamic = prefix
            ? (/^[A-Za-z]/.test(prefix) ? prefix.slice(0, 16) : "file") +
              "-copy"
            : "new";
          let candidateId: Dynamic = baseId;
          for (
            let count: Dynamic = 2;
            state.slides.has(candidateId) || !PLAIN_FILE_ID.test(candidateId);
            count++
          )
            candidateId = baseId + "-" + count;
          return [candidateId, true];
        };
        for (let child of [...container.children]) {
          if (!newElements.includes(child)) continue;
          let childEntry: Dynamic =
            state.copyOf.get(child) && activeEntry(state.copyOf.get(child))
              ? state.copyOf.get(child)
              : null;
          let [newId, wasMinted]: Dynamic = mintId(child, childEntry);
          child.setAttribute("id", newId);
          let slideRecord: Dynamic = {
            id: newId,
            text: "",
            holder: container,
            el: child,
            last: null,
            removed: false,
            hadTbody: childEntry
              ? state.slides.get(childEntry).hadTbody
              : /<tbody[\s>]/i.test(child.outerHTML),
            made: true,
            born: state.n,
            rootId: null,
            section: null,
            hadSection: false,
            raw: null,
            title: childEntry ? state.slides.get(childEntry).title : "",
          };
          state.slides.set(newId, slideRecord);
          registerElement(slideRecord, child);
          let afterId: Dynamic =
            child.previousElementSibling &&
            state.fileOf(child.previousElementSibling);
          let beforeId: Dynamic =
            child.nextElementSibling &&
            state.fileOf(child.nextElementSibling);
          let entry: Dynamic = state.whereOf.get(child);
          let operation: Dynamic = childEntry
            ? {
                op: "duplicate",
                id: childEntry,
                newId: newId,
              }
            : Object.assign(
                {
                  op: "add",
                  html: "",
                  id: newId,
                },
                entry
                  ? {
                      where: entry,
                    }
                  : afterId
                    ? {
                        after: afterId,
                      }
                    : beforeId
                      ? {
                          before: beforeId,
                        }
                      : {},
              );
          if (childEntry && entry) operation.where = entry;
          if (wasMinted) operation.minted = true;
          if (
            (operations.push(operation),
            (slideRecord.op = operation),
            (slideRecord.src = childEntry),
            childEntry)
          )
            expectedOrder.splice(
              expectedOrder.indexOf(childEntry) + 1,
              0,
              newId,
            );
          else if (afterId && expectedOrder.includes(afterId))
            expectedOrder.splice(
              expectedOrder.indexOf(afterId) + 1,
              0,
              newId,
            );
          else if (beforeId && expectedOrder.includes(beforeId))
            expectedOrder.splice(expectedOrder.indexOf(beforeId), 0, newId);
          else expectedOrder.push(newId);
        }
        let actualOrder: Dynamic = setOrder();
        if (actualOrder.join() !== expectedOrder.join()) {
          let match: Dynamic = actualOrder.find(
            (candidateMovedId?: Dynamic, ..._unusedFilterArgs: Dynamic[]): Dynamic =>
              actualOrder
                .filter(
                  (
                    slideId?: Dynamic,
                    ..._unusedArgs: Dynamic[]
                  ): Dynamic => slideId !== candidateMovedId,
                )
                .join() ===
              expectedOrder
                .filter(
                  (
                    slideId?: Dynamic,
                    ..._unusedArgs: Dynamic[]
                  ): Dynamic => slideId !== candidateMovedId,
                )
                .join(),
          );
          let matchIndex: Dynamic = actualOrder.indexOf(match);
          operations.push(
            match !== undefined && actualOrder.length > 1
              ? Object.assign(
                  {
                    op: "move",
                    id: match,
                  },
                  matchIndex > 0
                    ? {
                        after: actualOrder[matchIndex - 1],
                      }
                    : {
                        before: actualOrder[1],
                      },
                )
              : {
                  op: "order",
                  ids: actualOrder,
                },
          );
        }
        state.prev = actualOrder;
      }
      state.assign();
      for (let expectedOrder of state.prev) {
        let mintId: Dynamic = state.slides.get(expectedOrder);
        if (mintId.el.outerHTML === mintId.raw) continue;
        let html: Dynamic;
        try {
          html = state.clean(mintId);
        } catch (error: Dynamic) {
          problems.push(String(error));
          continue;
        }
        if (
          ((mintId.raw = mintId.el.outerHTML),
          mintId.born === state.n && mintId.op)
        ) {
          if (html.length > limits.maxHtml) {
            problems.push(
              'the text of the file "' +
                expectedOrder +
                '" is over ' +
                limits.maxHtml +
                " characters; not sent",
            );
            continue;
          }
          if (((mintId.last = html), mintId.op.op === "add"))
            mintId.op.html = html;
          else {
            let entry: Dynamic = state.slides.get(mintId.src);
            let normalizedHtml: Dynamic =
              entry.rootId === null
                ? entry.last.replace(
                    /^(<[a-z][a-z0-9-]*)/i,
                    '$1 id="' + expectedOrder + '"',
                  )
                : entry.last.replace(
                    'id="' + entry.rootId + '"',
                    'id="' + expectedOrder + '"',
                  );
            if (html !== normalizedHtml) mintId.op.html = html;
          }
          continue;
        }
        if (html === mintId.last) continue;
        if (html.length > limits.maxHtml) {
          problems.push(
            'the text of the file "' +
              expectedOrder +
              '" is over ' +
              limits.maxHtml +
              " characters; not sent",
          );
          continue;
        }
        mintId.last = html;
        frames.push({
          id: expectedOrder,
          html: html,
        });
      }
      for (let expectedOrder of state.prev) {
        let mintId: Dynamic = state.slides.get(expectedOrder);
        if (mintId.born === state.n && mintId.op && mintId.last === null) {
          if (
            ((mintId.last = state.clean(mintId)),
            (mintId.raw = mintId.el.outerHTML),
            mintId.op.op === "add")
          )
            mintId.op.html = mintId.last;
        }
      }
      let documentTitle: Dynamic = String(document.title || "");
      if (documentTitle !== state.title)
        if (documentTitle.trim() && documentTitle.length <= 300) {
          state.title = documentTitle;
          operations.push({
            op: "title",
            title: documentTitle.trim(),
          });
        } else {
          document.title = state.title;
          problems.push("the title takes 1 to 300 characters");
        }
      for (let expectedOrder of state.prev) {
        let mintId: Dynamic = state.slides.get(expectedOrder);
        if (mintId.hadSection) continue;
        let actualOrder: Dynamic = mintId.el.getAttribute("data-section");
        let section: Dynamic = mintId.section;
        if (actualOrder === section) continue;
        if (
          actualOrder !== null &&
          (!actualOrder.trim() || actualOrder.length > 300)
        ) {
          if (section === null) mintId.el.removeAttribute("data-section");
          else mintId.el.setAttribute("data-section", section);
          problems.push("a section title takes 1 to 300 characters");
          continue;
        }
        mintId.section = actualOrder;
        operations.push(
          actualOrder === null
            ? {
                op: "section",
                action: "remove",
                id: expectedOrder,
              }
            : {
                op: "section",
                action: section === null ? "start" : "rename",
                id: expectedOrder,
                title: actualOrder.trim(),
              },
        );
        mintId.raw = mintId.el.outerHTML;
      }
      let removalCount: Dynamic = operations.filter(
        (operation?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
          operation.op === "remove",
      ).length;
      if (operations.length - removalCount > state.opsLeft) {
        problems.push(
          "at most 24 structural changes in one run (a remove is free)",
        );
        operations.length = removalCount + state.opsLeft;
      }
      state.opsLeft -= operations.length - removalCount;
      return {
        frames: frames,
        ops: operations,
        problems: problems,
      };
    };
    let findEntry: Dynamic = (
      slideId?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      let entry: Dynamic = state.slides.get(slideId);
      return Object.freeze({
        id: slideId,
        path: state.pathOf.has(slideId) ? state.pathOf.get(slideId) : null,
        title: (entry && entry.title) || "",
      });
    };
    for (let slideMetadata of metadata.slides) {
      let entry: Dynamic = state.slides.get(String(slideMetadata && slideMetadata.id));
      if (entry)
        entry.title = String((slideMetadata && slideMetadata.title) || "").slice(0, 300);
    }
    let errorList: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic =>
      state.order().join(", ");
    let resolveEntry: Dynamic = (
      slideId?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      let normalizedId: Dynamic =
        typeof slideId === "string" && state.paths.has(slideId)
          ? state.paths.get(slideId)
          : slideId;
      let entry: Dynamic =
        typeof normalizedId === "string" ? state.slides.get(normalizedId) : null;
      if (!entry || entry.removed || entry.el.parentNode !== container)
        throw Error(
          "no file " +
            JSON.stringify(slideId === undefined ? null : slideId).slice(0, 80) +
            (errorList()
              ? "; the files are: " + errorList()
              : "; there is no file yet"),
        );
      return entry;
    };
    let decorateElement: Dynamic = (
      entryInput?: Dynamic,
      entry?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic =>
      Object.defineProperties(entryInput, {
        id: {
          value: entry.id,
        },
        path: {
          value: findEntry(entry.id).path,
        },
        title: {
          value: findEntry(entry.id).title,
        },
      });
    let getEntryById: Dynamic = (
      slideId?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      let entry: Dynamic = resolveEntry(slideId);
      return decorateElement(state.seen(jquery(entry.el)), entry);
    };
    let selectSlides: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic =>
      state.seen(
        jquery().pushStack(
          state
            .order()
            .map(
              (slideId?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
                state.slides.get(slideId).el,
            ),
        ),
      );
    let selectByInput: Dynamic = (...selection: Dynamic[]): Dynamic => {
      let items: Dynamic = [];
      for (let selectionValue of selection.length ? selection : [undefined]) {
        if (typeof selectionValue !== "number" && typeof selectionValue !== "string")
          throw Error(
            'handles are numbers or strings: k(7), k(3, 5), k("k7 k9")',
          );
        for (let slideId of typeof selectionValue === "number"
          ? [String(selectionValue)]
          : selectionValue.split(/[\s,#]+/).filter(Boolean)) {
          if (items.length >= 200)
            throw Error("at most 200 handles in one call");
          let normalizedSlideId: Dynamic = /^\d{1,6}$/.test(slideId)
            ? state.P + slideId
            : slideId;
          let element: Dynamic = state.elOf.has(normalizedSlideId)
            ? state.elOf.get(normalizedSlideId)
            : null;
          if (!element || !state.fileOf(element))
            throw Error(
              "no element " +
                slideId.slice(0, 20) +
                " (handles look like " +
                state.P +
                "1, " +
                state.P +
                "2 …; a removed element's handle is not given again)",
            );
          items.push(element);
        }
      }
      return state.seen(jquery().pushStack(items));
    };
    let validateOptions: Dynamic = (
      styleProperties?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic =>
      styleProperties !== null &&
      typeof styleProperties === "object" &&
      !Array.isArray(styleProperties) &&
      Object.keys(styleProperties).length <= 100 &&
      Object.keys(styleProperties).every(
        (key?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
          typeof styleProperties[key] === "string" ||
          (typeof styleProperties[key] === "number" &&
            styleProperties[key] === styleProperties[key]),
      );
    let validateHandleMap: Dynamic = (
      handles?: Dynamic,
      methodName?: Dynamic,
      validateValue?: Dynamic,
      onHandle?: Dynamic,
      ..._unusedHandleArgs: Dynamic[]
    ): Dynamic => {
      if (!handles || typeof handles !== "object" || Array.isArray(handles))
        throw Error(methodName + " takes { k7: … }");
      let handleKeys: Dynamic = Object.keys(handles);
      if (handleKeys.length > 200)
        throw Error(methodName + ": at most 200 handles in one call");
      let mapped: Dynamic = handleKeys.map(
        (handleKey?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic => {
          if (!validateValue(handles[handleKey]))
            throw Error(
              methodName +
                ": the value for " +
                handleKey.slice(0, 20) +
                " must be " +
                (methodName === "style"
                  ? "an object like { color: '#fff', 'font-size': 40 }"
                  : "a string"),
            );
          return [selectByInput(handleKey), handles[handleKey]];
        },
      );
      for (let [key, handleValue] of mapped) onHandle(key, handleValue);
    };
    let insertElements: Dynamic = (
      element?: Dynamic,
      position?: Dynamic,
      relativeTo?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      if (position === undefined) {
        if (relativeTo) jquery(relativeTo).after(element);
        else container.appendChild(element);
        return;
      }
      if (!position || typeof position !== "object" || Array.isArray(position))
        throw Error(
          "the place is {before: name}, {after: name}, or a flat object the page understands",
        );
      let positionKeys: Dynamic = Object.keys(position);
      if (
        positionKeys.length === 1 &&
        (positionKeys[0] === "before" || positionKeys[0] === "after")
      ) {
        let el: Dynamic = resolveEntry(position[positionKeys[0]]).el;
        if (el === element) throw Error("a file cannot go next to itself");
        if (positionKeys[0] === "before") jquery(el).before(element);
        else jquery(el).after(element);
        return;
      }
      let positionRecord: Dynamic = {};
      if (!positionKeys.length || positionKeys.length > 8)
        throw Error(
          "the place is {before: name}, {after: name}, or a flat object of short strings / numbers",
        );
      for (let key of positionKeys) {
        let positionValue: Dynamic = position[key];
        if (
          !/^[A-Za-z][\w-]{0,31}$/.test(key) ||
          key === "before" ||
          key === "after" ||
          !(
            (typeof positionValue === "string" && positionValue.length <= 100) ||
            (typeof positionValue === "number" && positionValue === positionValue)
          )
        )
          throw Error(
            "the place is {before: name}, {after: name}, or a flat object of short strings / numbers",
          );
        positionRecord[key] = positionValue;
      }
      if ((state.whereOf.set(element, positionRecord), element.parentNode !== container))
        if (relativeTo) jquery(relativeTo).after(element);
        else container.appendChild(element);
      return positionRecord;
    };
    let parseElement: Dynamic = (
      element?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      if (element && element.jquery) element = element[0];
      if (typeof element === "string") {
        if (element.length > limits.maxHtml)
          throw Error("the new file is over " + limits.maxHtml + " characters");
        let parsedElement: Dynamic = document.createElement("div");
        if (
          ((parsedElement.innerHTML = element.trim()), parsedElement.children.length !== 1)
        )
          throw Error("add(html) takes ONE element");
        element = parsedElement.children[0];
      }
      if (!element || element.nodeType !== 1)
        throw Error("add(html) takes ONE element, as text or as a jQuery set");
      return element;
    };
    let refreshOrder: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic => {
      if (state.halted) throw Error("the reply ended at undo()");
    };
    let record: Dynamic = {
      file: getEntryById,
      files: selectSlides,
      all: (selection?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
        selection === undefined ? selectSlides() : select(selection),
      k: selectByInput,
      fileOf: (element?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic => {
        let domElement: Dynamic = element && element.jquery ? element[0] : element;
        let entry: Dynamic =
          domElement && domElement.nodeType === 1 ? state.fileOf(domElement) : null;
        if (!entry)
          throw Error(
            "fileOf takes an element (or a set) that is inside a file",
          );
        return findEntry(entry);
      },
      add: (
        element?: Dynamic,
        position?: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic => {
        refreshOrder();
        let insertedElement: Dynamic = parseElement(element);
        insertElements(insertedElement, position);
        return jquery(insertedElement);
      },
      copy: (
        element?: Dynamic,
        requestedId?: Dynamic,
        relativeTo?: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic => {
        if (
          (refreshOrder(),
          requestedId !== null &&
            typeof requestedId === "object" &&
            relativeTo === undefined)
        ) {
          relativeTo = requestedId;
          requestedId = undefined;
        }
        let sourceEntry: Dynamic = resolveEntry(element);
        let clonedElement: Dynamic = jquery(sourceEntry.el).clone();
        if (requestedId !== undefined) {
          if (
            typeof requestedId !== "string" ||
            !validFileId.test(requestedId) ||
            state.slides.has(requestedId)
          )
            throw Error(
              "the new id must be letters, digits, - or _ (at most 64) and not taken",
            );
          clonedElement.attr("id", requestedId);
        }
        insertElements(clonedElement[0], relativeTo, sourceEntry.el);
        return clonedElement;
      },
      move: (
        element?: Dynamic,
        id?: Dynamic,
        ..._unusedCallbackArgs: Dynamic[]
      ): Dynamic => {
        refreshOrder();
        let sourceEntry: Dynamic = resolveEntry(element);
        let positionRecord: Dynamic = insertElements(
          sourceEntry.el,
          id === undefined ? null : id,
        );
        if (positionRecord) {
          state.whereOf.delete(sourceEntry.el);
          state.ops.push({
            op: {
              op: "move",
              id: sourceEntry.id,
              where: positionRecord,
            },
            entry: null,
          });
        }
      },
      remove: (slideId?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic => {
        refreshOrder();
        jquery(resolveEntry(slideId).el).remove();
      },
      index: Object.freeze({
        get title(): Dynamic {
          return String(document.title);
        },
        set title(title: Dynamic) {
          if (typeof title !== "string" || !title.trim() || title.length > 300)
            throw Error("the title takes 1 to 300 characters");
          document.title = title;
        },
        sections: (..._unusedSectionArgs: Dynamic[]): Dynamic =>
          state
            .order()
            .map(
              (slideId?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
                state.slides.get(slideId),
            )
            .filter(
              (sectionEntry?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
                sectionEntry.el.getAttribute("data-section") !== null &&
                !sectionEntry.hadSection,
            )
            .map(
              (entry?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic => ({
                start: entry.id,
                title: entry.el.getAttribute("data-section"),
              }),
            ),
        section: (
          slideId?: Dynamic,
          sectionTitle?: Dynamic,
          ..._unusedSectionArgs: Dynamic[]
        ): Dynamic => {
          let entry: Dynamic = resolveEntry(slideId);
          let sectionRecord: Dynamic = Object.freeze({
            start: entry.id,
            get title(): Dynamic {
              return entry.el.getAttribute("data-section");
            },
            rename: (
              title?: Dynamic,
              ..._unusedArgs: Dynamic[]
            ): Dynamic => {
              if (
                typeof title !== "string" ||
                !title.trim() ||
                title.length > 300
              )
                throw Error("a section title takes 1 to 300 characters");
              if (entry.el.getAttribute("data-section") === null)
                throw Error('no section starts at "' + entry.id + '"');
              entry.el.setAttribute("data-section", title.trim());
            },
            remove: (..._unusedArgs: Dynamic[]): Dynamic => {
              if (entry.el.getAttribute("data-section") === null)
                throw Error('no section starts at "' + entry.id + '"');
              entry.el.removeAttribute("data-section");
            },
          });
          if (sectionTitle === undefined) {
            if (entry.el.getAttribute("data-section") === null)
              throw Error('no section starts at "' + entry.id + '"');
            return sectionRecord;
          }
          if (
            typeof sectionTitle !== "string" ||
            !sectionTitle.trim() ||
            sectionTitle.length > 300
          )
            throw Error("a section title takes 1 to 300 characters");
          if (entry.el.getAttribute("data-section") !== null)
            throw Error(
              'a section already starts at "' + entry.id + '"; rename it',
            );
          entry.el.setAttribute("data-section", sectionTitle.trim());
          return sectionRecord;
        },
      }),
      style: (styleValue?: Dynamic, ..._unusedStyleArgs: Dynamic[]): Dynamic =>
        validateHandleMap(
          styleValue,
          "style",
          validateOptions,
          (
            element?: Dynamic,
            styleOptions?: Dynamic,
            ..._unusedArgs: Dynamic[]
          ): Dynamic => element.css(Object.assign({}, styleOptions)),
        ),
      text: (textContent?: Dynamic, ..._unusedTextArgs: Dynamic[]): Dynamic =>
        validateHandleMap(
          textContent,
          "text",
          (candidateValue?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
            typeof candidateValue === "string" ||
            (typeof candidateValue === "number" && candidateValue === candidateValue),
          (
            element?: Dynamic,
            textValue?: Dynamic,
            ..._unusedArgs: Dynamic[]
          ): Dynamic => element.text(String(textValue)),
        ),
      read: state.log,
      document: document,
      layout: (layoutName?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic => {
        if (
          typeof layoutName !== "string" ||
          !Object.prototype.hasOwnProperty.call(state.layouts, layoutName)
        )
          throw Error(
            "no layout named " +
              JSON.stringify(layoutName) +
              "; the layouts are: " +
              Object.keys(state.layouts).join(", "),
          );
        return state.layouts[layoutName];
      },
      layouts: (..._unusedArgs: Dynamic[]): Dynamic =>
        Object.keys(state.layouts),
      undo: (..._unusedArgs: Dynamic[]): Dynamic => {
        refreshOrder();
        state.ops.push({
          op: {
            op: "undo",
          },
          entry: null,
        });
        state.halted = true;
      },
      askClaude: (
        prompt?: Dynamic,
        ..._unusedArgs: Dynamic[]
      ): Dynamic => {
        refreshOrder();
        state.ops.push({
          op:
            typeof prompt === "string" && prompt.trim()
              ? {
                  op: "askClaude",
                  prompt: prompt.trim().slice(0, 1000),
                }
              : {
                  op: "askClaude",
                },
          entry: null,
        });
        state.halted = true;
      },
    };
    deckApi = Object.freeze({
      slide: record.file,
      all: record.all,
      add: record.add,
      duplicate: record.copy,
      move: record.move,
      remove: record.remove,
      title: (title?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
        title === undefined
          ? record.index.title
          : void (record.index.title = title),
      section: record.index.section,
      sections: record.index.sections,
      layout: record.layout,
      get layouts(): Dynamic {
        return record.layouts();
      },
      undo: record.undo,
      get slides(): Dynamic {
        return state.order().map(
          (slideId?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic => ({
            id: slideId,
            title: findEntry(slideId).title,
          }),
        );
      },
      get current(): Dynamic {
        return currentFileId;
      },
    });
    state.me = (..._unusedArgs: Dynamic[]): Dynamic => {
      let currentEntry: Dynamic = currentFileId
        ? state.slides.get(currentFileId)
        : null;
      if (currentEntry && !currentEntry.removed && currentEntry.el.parentNode === container)
        return decorateElement(jquery(currentEntry.el), currentEntry);
      state.goneMsg = currentFileId
        ? "this file was removed"
        : "there is no current file: say which, $('#goals h2'), or every file, $('h2'), or a handle, $('#k7')";
      return state.ghost;
    };
    let sdkNames: Dynamic = Object.assign({}, DEFAULT_SDK_NAMES);
    let customNames: Dynamic = (sdk && sdk.names) || {};
    for (let name of Object.keys(customNames))
      if (customNames[name] === null) delete sdkNames[name];
      else if (
        /^[A-Za-z_$][\w$]{0,30}$/.test(name) &&
        !["$", "slide", "deck", "log"].includes(name) &&
        Object.prototype.hasOwnProperty.call(record, customNames[name])
      )
        sdkNames[name] = customNames[name];
    state.pub = Object.keys(sdkNames);
    try {
      Function(...state.pub, "");
    } catch (ignoredError: Dynamic) {
      state.pub = Object.keys(DEFAULT_SDK_NAMES);
      Object.assign(sdkNames, DEFAULT_SDK_NAMES);
    }
    state.pubVals = state.pub.map(
      (sdkName?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
        record[sdkNames[sdkName]],
    );
  }
  function executeFileStatement(
    statement?: Dynamic,
    compiledStatement?: Dynamic,
    compileContext?: Dynamic,
    ..._unusedExecuteArgs: Dynamic[]
  ): Dynamic {
    let statementText: Dynamic = String(statement);
    let projectState: Dynamic = project;
    let statementNumber: Dynamic = ++projectState.n;
    let shortStatement: Dynamic = truncate(statementText, limits.maxStmt);
    if (((projectState.logged = 0), (projectState.ops = []), projectState.halted)) {
      emit({
        kind: "done" as const,
        seq: sequence++,
        n: statementNumber,
        stmt: shortStatement,
        changed: [],
        logged: 0,
        skipped: true,
      });
      return false;
    }
    let error: Dynamic = null;
    if (!compiledStatement)
      try {
        compiledStatement = compileStatement(statementText, compileContext);
      } catch (compileError: Dynamic) {
        error = String(compileError);
      }
    if (((executingStatement = statementText), compiledStatement))
      try {
        invokeStatement(
          compiledStatement,
          [select, projectState.me(), deckApi, projectState.log, ...projectState.pubVals],
          compileContext,
        );
      } catch (runtimeCompileError: Dynamic) {
        error = String(runtimeCompileError);
      }
    let executionResult: Dynamic;
    try {
      executionResult = projectState.settle();
    } catch (executionFailure: Dynamic) {
      executionResult = {
        frames: [],
        ops: [],
        problems: [
          "the box could not read the document after this statement: " +
            String(executionFailure),
        ],
      };
    }
    if (error !== null) emitError(error, statementText);
    let mapped: Dynamic = executionResult.problems.map(
      (items?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
        [].concat(items),
    );
    let hasManyOperations: Dynamic = mapped.length > 6;
    for (let [problemCode, problemDetail] of hasManyOperations
      ? [
          ...mapped.filter(
            (item?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
              item[1],
          ),
          ...mapped.filter(
            (item?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
              !item[1],
          ),
        ].slice(0, 5)
      : mapped)
      emitError(problemCode, statementText, problemDetail);
    if (hasManyOperations)
      emitError(
        "and " + (mapped.length - 5) + " more problems in this statement",
        statementText,
      );
    if (error === null && mapped.length) error = mapped[0][0];
    for (let operation of projectState.ops)
      if (operation.op.op === "undo" || operation.op.op === "askClaude")
        executionResult.ops.push(operation.op);
      else if (projectState.opsLeft > 0) {
        projectState.opsLeft--;
        executionResult.ops.push(operation.op);
      }
    if (!pace)
      for (let frame of executionResult.frames)
        emit({
          kind: "html" as const,
          seq: sequence++,
          slideId: frame.id,
          html: frame.html,
          stmt: shortStatement,
        });
    else {
      for (let frame of executionResult.frames)
        queuedFrames.set(frame.id, {
          html: frame.html,
          stmt: shortStatement,
        });
      for (let operation of executionResult.ops)
        if (operation && operation.op === "remove" && queuedFrames.has(operation.id)) {
          let entry: Dynamic = queuedFrames.get(operation.id);
          queuedFrames.delete(operation.id);
          emit({
            kind: "html" as const,
            seq: sequence++,
            slideId: operation.id,
            html: entry.html,
            stmt: entry.stmt,
          });
        }
      sendQueuedFrames(false);
    }
    for (let operation of executionResult.ops) {
      let normalizedOperation: Dynamic = Object.assign({}, operation);
      delete normalizedOperation.where;
      emit({
        kind: "op" as const,
        seq: sequence++,
        stmt: shortStatement,
        op: operation.where
          ? Object.assign(normalizedOperation, {
              where: operation.where,
            })
          : normalizedOperation,
      });
    }
    let record: DoneMessage = {
      kind: "done" as const,
      seq: sequence++,
      n: statementNumber,
      stmt: shortStatement,
      changed: executionResult.frames.map(
        (entry?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
          entry.id,
      ),
      logged: projectState.logged,
    };
    if (projectState.rehandled.size) {
      if (
        ((record.handles = [...projectState.rehandled].filter(
          (slideId?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
            projectState.slides.get(slideId) && !projectState.slides.get(slideId).removed,
        )),
        projectState.rehandled.clear(),
        !record.handles.length)
      )
        delete record.handles;
    }
    if (error !== null)
      record.threw = {
        message: formatError(error),
      };
    emit(record);
    return error === null;
  }
  function sendFileView(
    fileId?: Dynamic,
    requestOptions?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!initialized || !project || !project.v3) return;
    fileId = project.paths.has(fileId) ? project.paths.get(fileId) : String(fileId);
    let fileView: Dynamic = project.view(fileId);
    emit({
      kind: "view" as const,
      req: requestOptions,
      slideId: fileId,
      attr: "id",
      prefix: project.P,
      html: fileView === null ? "" : fileView,
    });
  }
  function sendHandles(
    count?: Dynamic,
    requestOptions?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!initialized || !project || !project.v3) return;
    emit({
      kind: "handles" as const,
      req: requestOptions,
      attr: "id",
      prefix: project.P,
      rows: project.list(Number.isInteger(count) && count > 0 ? count : 0),
    });
  }
  function executeSlideStatement(
    statement?: Dynamic,
    compiledStatement?: Dynamic,
    compileContext?: Dynamic,
    ..._unusedSlideArgs: Dynamic[]
  ): Dynamic {
    let statementText: Dynamic = String(statement);
    let projectState: Dynamic = project;
    let statementNumber: Dynamic = ++projectState.n;
    let shortStatement: Dynamic = truncate(statementText, limits.maxStmt);
    if (((projectState.logged = 0), (projectState.ops = []), projectState.halted)) {
      emit({
        kind: "done" as const,
        seq: sequence++,
        n: statementNumber,
        stmt: shortStatement,
        changed: [],
        logged: 0,
        skipped: true,
      });
      return false;
    }
    let executionError: Dynamic = null;
    if (!compiledStatement)
      try {
        compiledStatement = compileStatement(statementText, compileContext);
      } catch (compileError: Dynamic) {
        executionError = String(compileError);
      }
    if (((executingStatement = statementText), compiledStatement))
      try {
        invokeStatement(
          compiledStatement,
          [
            select,
            projectState.currentRemoved ? projectState.ghost : jquery(currentElement),
            deckApi,
            projectState.log,
          ],
          compileContext,
        );
      } catch (runtimeCompileError: Dynamic) {
        executionError = String(runtimeCompileError);
      }
    if (executionError !== null) emitError(executionError, statementText);
    let items: Dynamic = [];
    let emitOperation: Dynamic = (
      slideId?: Dynamic,
      html?: Dynamic,
      appendContext?: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic => {
      if (html.length > limits.maxHtml) {
        emitError(
          'the text of the slide "' +
            slideId +
            '" is over ' +
            limits.maxHtml +
            " characters; not sent",
          statementText,
        );
        return;
      }
      appendContext(html);
      items.push(slideId);
      emit({
        kind: "html" as const,
        seq: sequence++,
        slideId: slideId,
        html: html,
        stmt: shortStatement,
      });
    };
    if (!projectState.currentRemoved)
      try {
        let serializedSlide: Dynamic = serializeCurrentSlide();
        if (serializedSlide !== null && serializedSlide !== lastHtml)
          emitOperation(
            projectState.current,
            serializedSlide,
            (serializedHtml?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic => {
              lastHtml = serializedHtml;
              projectState.slides.get(projectState.current).last = serializedHtml;
            },
          );
      } catch (error: Dynamic) {
        emitError(String(error), statementText);
      }
    for (let slideId of projectState.order()) {
      let entry: Dynamic = slideId && projectState.slides.get(slideId);
      if (
        !entry ||
        slideId === projectState.current ||
        !entry.holder ||
        entry.removed ||
        entry.born === statementNumber
      )
        continue;
      try {
        let slideHtml: Dynamic = projectState.text(entry);
        if (slideHtml !== entry.last)
          emitOperation(
            slideId,
            slideHtml,
            (serializedHtml?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic => {
              entry.last = serializedHtml;
            },
          );
      } catch (error: Dynamic) {
        emitError(String(error), statementText);
      }
    }
    for (let operation of projectState.ops) {
      let op: Dynamic = operation.op;
      if (operation.entry && operation.entry.born === statementNumber && !operation.entry.removed)
        try {
          let operationHtml: Dynamic = projectState.text(operation.entry);
          if (operationHtml !== operation.entry.last)
            if (operationHtml.length > limits.maxHtml)
              emitError(
                'the text of the slide "' +
                  operation.entry.id +
                  '" is over ' +
                  limits.maxHtml +
                  " characters; not sent",
                statementText,
              );
            else {
              op = Object.assign({}, op, {
                html: operationHtml,
              });
              operation.entry.last = operationHtml;
            }
        } catch (error: Dynamic) {
          emitError(String(error), statementText);
        }
      emit({
        kind: "op" as const,
        seq: sequence++,
        stmt: shortStatement,
        op: op,
      });
    }
    projectState.ops = [];
    let record: DoneMessage = {
      kind: "done" as const,
      seq: sequence++,
      n: statementNumber,
      stmt: shortStatement,
      changed: items,
      logged: projectState.logged,
    };
    if (executionError !== null)
      record.threw = {
        message: formatError(executionError),
      };
    emit(record);
    return executionError === null;
  }
  function initializeDomDeck(
    state?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    let deckElement: Dynamic = document.createElement("main");
    let currentSlideId: Dynamic = String(state.current);
    let seenIds: Dynamic = new Set();
    if (
      (deckElement.setAttribute("id", "deck"),
      currentElement.getAttribute("id") !== currentSlideId)
    )
      currentElement.setAttribute("id", currentSlideId);
    for (let slide of state.slides) {
      let slideId: Dynamic = String(slide && slide.id);
      if (!validFileId.test(slideId) || seenIds.has(slideId)) continue;
      if ((seenIds.add(slideId), slideId === currentSlideId)) {
        deckElement.appendChild(currentElement);
        continue;
      }
      let sectionElement: Dynamic = document.createElement("section");
      sectionElement.setAttribute("id", slideId);
      sectionElement.setAttribute("data-shell", "");
      sectionElement.setAttribute(
        "data-title",
        String((slide && slide.title) || "").slice(0, 300),
      );
      sectionElement.setAttribute("data-src", slideId);
      deckElement.appendChild(sectionElement);
    }
    if (currentElement.parentNode !== deckElement) {
      deckElement.appendChild(currentElement);
      seenIds.add(currentSlideId);
    }
    document.body.innerHTML = "";
    document.body.appendChild(deckElement);
    domDeck = {
      main: deckElement,
      current: currentSlideId,
      initial: seenIds,
      last: "",
    };
  }
  function findCurrentSection(..._unusedArgs: Dynamic[]): Dynamic {
    if (!domDeck) return document.body.querySelector("section");
    if (currentElement && currentElement.parentNode === domDeck.main)
      return currentElement;
    for (let section of domDeck.main.children)
      if (
        section.tagName === "SECTION" &&
        section.getAttribute("id") === domDeck.current
      )
        return section;
    return null;
  }
  let invalidDeck: Dynamic = (
    message?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic => ({
    ok: false,
    message: message,
  });
  function validateDomDeck(..._unusedValidationArgs: Dynamic[]): Dynamic {
    let main: Dynamic = domDeck.main;
    if (main.parentNode !== document.body || main.getAttribute("id") !== "deck")
      return invalidDeck(
        "main#deck itself cannot be removed, moved or renamed",
      );
    let currentSection: Dynamic = findCurrentSection();
    if (currentSection && currentSection.getAttribute("id") !== domDeck.current)
      return invalidDeck(
        'the current slide keeps its id "' + domDeck.current + '"',
      );
    let items: Dynamic = [];
    let addedSlides: Dynamic = [];
    let clonedSlides: Dynamic = [];
    let seenIds: Dynamic = new Set();
    let index: Dynamic = 0;
    for (let section of main.children) {
      if (section.tagName !== "SECTION") continue;
      let slideId: Dynamic = section.getAttribute("id") || "";
      if (!validFileId.test(slideId))
        return invalidDeck(
          "every slide <section> needs an id of letters, digits, - or _ (at most 64 characters)",
        );
      if (seenIds.has(slideId))
        return invalidDeck(
          'two slides have the id "' +
            slideId +
            '": give the new one its own id',
        );
      if ((seenIds.add(slideId), items.push(slideId), items.length > 500))
        return invalidDeck("a deck holds at most 500 slides");
      if (section === currentSection || domDeck.initial.has(slideId)) continue;
      if (addedSlides.length + clonedSlides.length >= 8)
        return invalidDeck("at most 8 new slides in one run");
      if (
        section.hasAttribute("data-shell") &&
        domDeck.initial.has(section.getAttribute("data-src") || "")
      ) {
        clonedSlides.push({
          id: slideId,
          cloneOf: section.getAttribute("data-src"),
        });
        continue;
      }
      let serializedHtml: Dynamic = serializeElement(section);
      if (serializedHtml.length > limits.maxHtml || (index += serializedHtml.length) > 1e6)
        return invalidDeck(
          "a new slide is over " + limits.maxHtml + " characters",
        );
      addedSlides.push({
        id: slideId,
        html: serializedHtml,
      });
    }
    let filtered: Dynamic = [...domDeck.initial].filter(
      (slideId?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic =>
        !seenIds.has(slideId),
    );
    return {
      ok: true,
      state: {
        order: items,
        added: addedSlides,
        clones: clonedSlides,
        removed: filtered,
      },
    };
  }
  function restoreDomDeck(
    html?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      ((document.body.innerHTML = html),
      (domDeck.main = document.body.querySelector("main")),
      (currentElement = null),
      (currentElement = findCurrentSection()),
      currentElement)
    ) {
      for (let element of [
        currentElement,
        ...currentElement.querySelectorAll("[style]"),
      ])
        if (element.getAttribute("style") !== null)
          originalStyles.set(element, element.getAttribute("style"));
    }
  }
  function serializeElement(
    element?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    settleStyles(element);
    for (let descendant of [
      element,
      ...element.querySelectorAll('[style], [class=""]'),
    ]) {
      if (
        descendant.getAttribute("style") !== null &&
        descendant.getAttribute("style").trim() === ""
      )
        descendant.removeAttribute("style");
      if (descendant.getAttribute("class") === "") descendant.removeAttribute("class");
    }
    return element.outerHTML;
  }
  function serializeCurrentSlide(..._unusedArgs: Dynamic[]): Dynamic {
    let currentSection: Dynamic = findCurrentSection();
    if (!currentSection && domDeck) {
      currentElement = null;
      return null;
    }
    if (!currentSection)
      throw (
        (document.body.innerHTML = lastHtml),
        (currentSection = document.body.querySelector("section")),
        (currentElement = currentSection),
        Error("the slide <section> was removed; restored")
      );
    currentElement = currentSection;
    let serializedHtml: Dynamic = serializeElement(currentSection);
    return originalHadTbody ? serializedHtml : serializedHtml.replace(/<\/?tbody>/g, "");
  }
  function resetPendingCode(..._unusedArgs: Dynamic[]): Dynamic {
    pendingCode = "";
    pendingLineCount = 0;
    compiledPending = null;
  }
  let stripVariableDeclaration: Dynamic = (
    statement?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic =>
    statement.replace(
      /^(\s*)(?:const|let|var)\s+(?=[A-Za-z_$][\w$]*\s*(?:=|,|;|$))/,
      "$1",
    );
  let DEFAULT_SDK_NAMES: Dynamic = {
    read: "read",
    document: "document",
    file: "file",
    files: "files",
    all: "all",
    k: "k",
    $k: "k",
    fileOf: "fileOf",
    add: "add",
    copy: "copy",
    move: "move",
    remove: "remove",
    index: "index",
    style: "style",
    text: "text",
    layout: "layout",
    layouts: "layouts",
    undo: "undo",
    askClaude: "askClaude",
  };
  let STATEMENT_ONLY: Dynamic =
    /^\s*(?:function|class|if|for|while|do|switch|try|return|throw|import|export|async\s+function|\{|\/\/|\/\*)/;
  function compileStatement(
    code?: Dynamic,
    continuesPrevious?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    let argumentNames: Dynamic = [
      "$",
      "slide",
      "deck",
      "log",
      ...(project && project.v3 ? project.pub : []),
    ];
    if (!chainMode)
      return Function(...argumentNames, stripVariableDeclaration(code));
    let expression: Dynamic = stripVariableDeclaration(code).replace(
      /[;\s]+$/,
      "",
    );
    if (continuesPrevious)
      return Function(
        ...argumentNames,
        "__prev",
        "return (__prev" +
          expression.replace(/^\s+/, "") +
          `
);`,
      );
    if (!STATEMENT_ONLY.test(expression))
      try {
        return Function(
          ...argumentNames,
          "return (" +
            expression +
            `
);`,
        );
      } catch (error: Dynamic) {}
    return Function(...argumentNames, stripVariableDeclaration(code));
  }
  function invokeStatement(
    compiled?: Dynamic,
    argumentsForStatement?: Dynamic,
    continuesPrevious?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (
      continuesPrevious &&
      (previousValue === undefined || previousValue === null)
    )
      throw Error(
        "a line that starts with . continues the statement before it, and that one gave no value",
      );
    try {
      let result: Dynamic = compiled.call(
        undefined,
        ...argumentsForStatement,
        ...(continuesPrevious ? [previousValue] : []),
      );
      previousValue = chainMode ? result : undefined;
    } catch (result: Dynamic) {
      if (!continuesPrevious) previousValue = undefined;
      throw result;
    }
  }
  function execute(
    code?: Dynamic,
    compiled?: Dynamic,
    continuesPrevious?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    let statement: Dynamic = String(code);
    if (!initialized) return false;
    if (project && project.one)
      return executeFileStatement(code, compiled, continuesPrevious);
    if (project)
      return executeSlideStatement(code, compiled, continuesPrevious);
    if (!compiled)
      try {
        compiled = compileStatement(statement, continuesPrevious);
      } catch (compileError: Dynamic) {
        emitError(String(compileError), statement);
        return false;
      }
    let originalDeckHtml: Dynamic = domDeck ? document.body.innerHTML : null;
    let deckValidation: Dynamic = null;
    executingStatement = statement;
    try {
      invokeStatement(
        compiled,
        [select, jquery(currentElement), deckApi || undefined, undefined],
        continuesPrevious,
      );
    } catch (executionError: Dynamic) {
      if ((emitError(String(executionError), statement), domDeck)) {
        if (
          ((deckValidation = validateDomDeck()),
          !deckValidation.ok || JSON.stringify(deckValidation.state) !== domDeck.last)
        )
          restoreDomDeck(originalDeckHtml);
      }
      try {
        serializeCurrentSlide();
      } catch (_ignoredSerializationError: Dynamic) {}
      return false;
    }
    if (domDeck) {
      if (((deckValidation = validateDomDeck()), !deckValidation.ok)) {
        emitError(deckValidation.message + "; undone", statement);
        restoreDomDeck(originalDeckHtml);
        return false;
      }
    }
    let slideHtml: Dynamic;
    try {
      slideHtml = serializeCurrentSlide();
    } catch (serializationError: Dynamic) {
      emitError(String(serializationError), statement);
      return false;
    }
    if (slideHtml !== null && slideHtml.length > limits.maxHtml) {
      emitError(
        "the slide text is over " + limits.maxHtml + " characters; not sent",
        statement,
      );
      return false;
    }
    if (slideHtml !== null && slideHtml !== lastHtml) {
      lastHtml = slideHtml;
      emit({
        kind: "html" as const,
        seq: sequence++,
        html: slideHtml,
        stmt: truncate(statement, limits.maxStmt),
      });
    }
    if (deckValidation) {
      let serializedDeckState: Dynamic = JSON.stringify(deckValidation.state);
      if (serializedDeckState !== domDeck.last) {
        domDeck.last = serializedDeckState;
        emit(
          Object.assign(
            {
              kind: "deck" as const,
              seq: sequence++,
              stmt: truncate(statement, limits.maxStmt),
            },
            deckValidation.state,
          ),
        );
      }
    }
    return true;
  }
  function executePending(..._unusedArgs: Dynamic[]): Dynamic {
    if ((clearTimeout(idleTimer), !compiledPending)) return;
    let compiledStatement: Dynamic = compiledPending;
    let statement: Dynamic = pendingCode;
    resetPendingCode();
    execute(statement, compiledStatement);
  }
  function acceptLine(
    line?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (((line = line.replace(/\r$/, "")), CODE_FENCE.test(line))) {
      flushPending();
      insideCodeFence = insideCodeFence !== true;
      return;
    }
    if (insideCodeFence === false) return;
    if (compiledPending)
      if (CHAIN_CONTINUATION.test(line)) compiledPending = null;
      else executePending();
    if (!pendingCode && line.trim() === "") return;
    pendingCode +=
      (pendingCode
        ? `
`
        : "") + line;
    pendingLineCount++;
    compilePending(false);
  }
  function compilePending(
    runImmediately?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    try {
      compiledPending = compileStatement(pendingCode);
      hasSeenCode = true;
    } catch (compileError: Dynamic) {
      if (
        ((compiledPending = null),
        !hasSeenCode &&
          pendingLineCount === 1 &&
          !pendingCode.includes("$(") &&
          !CODE_LIKE.test(pendingCode))
      ) {
        resetPendingCode();
        return;
      }
      if (
        !runImmediately &&
        compileError instanceof SyntaxError &&
        pendingLineCount < limits.maxLines &&
        pendingCode.length < limits.maxChars
      )
        return;
      emitStatementError(String(compileError), pendingCode);
      resetPendingCode();
      return;
    }
    if (runImmediately) executePending();
    else if (limits.idleRunMs > 0) {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(executePending, limits.idleRunMs);
    }
  }
  function flushPending(..._unusedArgs: Dynamic[]): Dynamic {
    if (compiledPending) executePending();
    else if (pendingCode) compilePending(true);
  }
  function acceptLineChunk(
    lineChunk?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    lineTail += String(lineChunk);
    let newlineIndex: Dynamic;
    while (
      (newlineIndex = lineTail.indexOf(`
`)) >= 0
    ) {
      let slice: Dynamic = lineTail.slice(0, newlineIndex);
      lineTail = lineTail.slice(newlineIndex + 1);
      acceptLine(slice);
    }
    if (
      compiledPending &&
      /\S/.test(lineTail) &&
      !CHAIN_CONTINUATION.test(lineTail) &&
      !/^\s*[.?:&|]$/.test(lineTail)
    )
      executePending();
    if (lineTail.length > limits.maxChars) {
      emitError(
        "a line is over " + limits.maxChars + " characters; dropped",
        lineTail,
      );
      lineTail = "";
    }
  }
  function endLineInput(..._unusedArgs: Dynamic[]): Dynamic {
    if (lineTail) {
      let finalLine: Dynamic = lineTail;
      lineTail = "";
      acceptLine(finalLine);
    }
    flushPending();
  }
  function createSplitter(..._unusedArgs: Dynamic[]): Dynamic {
    return statementStream.createStatementStream({
      joinChains: !chainMode,
      onStatement(statement: Dynamic, _statementIndex: Dynamic, metadata: Dynamic): Dynamic {
        hasSeenCode = true;
        execute(statement, undefined, chainMode && !!(metadata && metadata.chain));
      },
      onError(error: Dynamic): Dynamic {
        if (error && error.code === "INCOMPLETE")
          emitStatementError(
            "the reply ended inside a statement (open: " + error.open + ")",
            error.tail,
          );
        else
          emitError(
            "splitter: " + String((error && error.message) || error),
            "",
          );
      },
    });
  }
  let isCompilable: Dynamic = (
    statement?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic => {
    try {
      compileStatement(statement);
      return true;
    } catch (_compileError: Dynamic) {
      return false;
    }
  };
  let isProse: Dynamic = (
    line?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic =>
    !line.includes("$(") && !CODE_LIKE.test(line) && !isCompilable(line);
  let skippedLineCount: Dynamic = 0;
  let reportSkippedProse: Dynamic = (
    skippedLine?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic => {
    if (skippedLine.trim() && skippedLineCount++ < 5)
      emit({
        kind: "log" as const,
        message: truncate("skipped, not code: " + skippedLine.trim(), 200),
      });
  };
  let insideTemplate: Dynamic = (..._unusedArgs: Dynamic[]): Dynamic => {
    let pendingStatement: Dynamic = stream ? stream.tail() : "";
    let index: Dynamic = 0;
    for (let characterIndex: Dynamic = 0; characterIndex < pendingStatement.length; characterIndex++)
      if (pendingStatement[characterIndex] === "\\") characterIndex++;
      else if (pendingStatement[characterIndex] === "`") index++;
    return index % 2 === 1;
  };
  function pushStream(
    streamChunk?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    try {
      stream.push(streamChunk);
    } catch (_streamError: Dynamic) {
      useLineSplitter = true;
      let pendingTail: Dynamic = stream.tail();
      stream = null;
      acceptLineChunk(pendingTail + streamChunk);
      return;
    }
    let pendingStatement: Dynamic = stream.tail();
    if (
      pendingStatement.length > limits.maxChars ||
      (pendingStatement.length > limits.maxLines &&
        pendingStatement.split(`
`).length > limits.maxLines)
    ) {
      emitStatementError(
        "a statement is over " +
          limits.maxLines +
          " lines / " +
          limits.maxChars +
          " characters; dropped",
        pendingStatement,
      );
      stream.reset();
    }
  }
  function restartStream(..._unusedArgs: Dynamic[]): Dynamic {
    if (stream) {
      stream.end();
      stream = createSplitter();
    }
  }
  function acceptStreamChunk(
    streamChunk?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (let index: Dynamic = 0; index < streamChunk.length; ) {
      let newlineIndex: Dynamic = streamChunk.indexOf(
        `
`,
        index,
      );
      let lineFragment: Dynamic =
        newlineIndex < 0 ? streamChunk.slice(index) : streamChunk.slice(index, newlineIndex + 1);
      index += lineFragment.length;
      incomingLine += lineFragment;
      let completesLine: Dynamic = lineFragment.endsWith(`
`);
      let firstCharacter: Dynamic = incomingLine.trimStart()[0];
      if (
        !recognizedCode &&
        insideCodeFence !== true &&
        insideCodeFence !== false &&
        CODE_START.test(incomingLine)
      )
        recognizedCode = true;
      let holdForLineClassification: Dynamic =
        insideCodeFence === false ||
        (!recognizedCode && insideCodeFence !== true) ||
        firstCharacter === undefined ||
        firstCharacter === "`";
      if (useLineSplitter) {
        acceptLineChunk(incomingLine.slice(consumedLineChars));
        consumedLineChars = incomingLine.length;
      } else if (!holdForLineClassification) {
        pushStream(incomingLine.slice(consumedLineChars));
        consumedLineChars = incomingLine.length;
      }
      if (!completesLine) continue;
      if (consumedLineChars === 0 && !useLineSplitter) {
        let completedLine: Dynamic = incomingLine.replace(/\r?\n$/, "");
        if (CODE_FENCE.test(completedLine) && !insideTemplate()) {
          if (
            (restartStream(),
            (insideCodeFence = insideCodeFence !== true),
            insideCodeFence)
          )
            recognizedCode = true;
        } else if (insideCodeFence === false) reportSkippedProse(completedLine);
        else if (!recognizedCode && insideCodeFence !== true && isProse(completedLine))
          reportSkippedProse(completedLine);
        else {
          if (completedLine.trim()) recognizedCode = true;
          pushStream(incomingLine);
        }
      }
      incomingLine = "";
      consumedLineChars = 0;
    }
  }
  let previewState: Dynamic = null;
  let previewElement: Dynamic = null;
  function sanitizePreviewHtml(
    html?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    let insideTag: Dynamic = false;
    let text: Dynamic = "";
    let index: Dynamic = 0;
    for (let characterIndex: Dynamic = 0; characterIndex < html.length; characterIndex++) {
      let character: Dynamic = html[characterIndex];
      if (!insideTag) {
        if (character === "<") {
          insideTag = true;
          index = characterIndex;
          text = "";
        }
      } else if (text) {
        if (character === text) text = "";
      } else if (character === '"' || character === "'") text = character;
      else if (character === ">") insideTag = false;
    }
    let completedSvgTag: Dynamic =
      insideTag && previewState && previewState.form && previewState.form.steps
        ? completeSvgDataUrl(html, index, previewState)
        : null;
    let completeHtml: Dynamic =
      completedSvgTag !== null
        ? html.slice(0, index) + completedSvgTag
        : (insideTag ? html.slice(0, index) : html).replace(/&[#\w]{0,12}$/, "");
    if (!previewElement) previewElement = document.createElement("div");
    previewElement.innerHTML = completeHtml;
    let innerHTML: Dynamic = previewElement.innerHTML;
    previewElement.innerHTML = "";
    return innerHTML;
  }
  function resolvePreviewTarget(
    selectionSteps?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    let projectState: Dynamic = project;
    let usesFileMode: Dynamic = projectState && projectState.one;
    let selection: Dynamic;
    if (projectState) projectState.previewing = true;
    try {
      for (let [method, argument] of selectionSteps)
        if (method === "prev") {
          if (!(previousValue instanceof jquery)) return null;
          selection = previousValue;
        } else if (method === "$") selection = jquery(argument);
        else if (method === "files")
          selection = usesFileMode
            ? jquery(document.body).children()
            : jquery(currentElement);
        else if (method === "me") {
          let slideElement: Dynamic = usesFileMode ? null : currentElement;
          if (!slideElement) return null;
          selection = jquery(slideElement);
        } else if (method === "k") {
          if (!usesFileMode) return null;
          let filtered: Dynamic = String(argument)
            .split(/[\s,]+/)
            .filter(Boolean)
            .map(
              (elementKey?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
                projectState.elOf.get(
                  /^\d+$/.test(elementKey) ? projectState.P + elementKey : elementKey,
                ),
            )
            .filter(
              (element?: Dynamic, ..._unusedCallbackArgs: Dynamic[]): Dynamic =>
                element && projectState.fileOf(element),
            );
          selection = jquery().pushStack(filtered);
        } else if (method === "file") {
          if (!projectState) return null;
          let fileId: Dynamic =
            projectState.paths && projectState.paths.has(argument)
              ? projectState.paths.get(argument)
              : argument;
          let entry: Dynamic = projectState.slides.get(fileId);
          if (
            !entry ||
            entry.removed ||
            !(fileId === projectState.current ? currentElement : entry.el)
          )
            return null;
          selection = jquery(
            fileId === projectState.current && !usesFileMode ? currentElement : entry.el,
          );
        } else
          selection =
            argument === undefined ? selection[method]() : selection[method](argument);
    } catch (_selectionError: Dynamic) {
      return null;
    } finally {
      if (projectState) projectState.previewing = false;
    }
    let targetElement: Dynamic = selection && selection[0];
    if (!targetElement || targetElement.nodeType !== 1) return null;
    if (usesFileMode && targetElement === document.body)
      return {
        root: true,
      };
    return {
      file: usesFileMode
        ? projectState.fileOf(targetElement)
        : projectState
          ? projectState.current || null
          : null,
      id: targetElement.getAttribute("id"),
    };
  }
  function previewPending(..._unusedArgs: Dynamic[]): Dynamic {
    if (
      !(limits.previewMs >= 0) ||
      finished ||
      !initialized ||
      (project && project.halted)
    )
      return;
    let pendingStatement: Dynamic = useLineSplitter
      ? (pendingCode
          ? pendingCode +
            `
`
          : "") + lineTail
      : stream
        ? stream.tail()
        : "";
    if (!pendingStatement.trim()) {
      previewState = null;
      return;
    }
    let statementCount: Dynamic = stream ? stream.count : 0;
    if (
      !previewState ||
      previewState.key !== statementCount ||
      !pendingStatement.startsWith(previewState.head)
    )
      previewState = {
        key: statementCount,
        head: pendingStatement.slice(0, Math.min(pendingStatement.length, 24)),
        form: undefined,
        dead: false,
        at: 0,
        last: "",
        target: undefined,
        g: undefined,
      };
    if (previewState.dead) return;
    if (previewState.form === undefined) {
      if (
        ((previewState.form = parsePreviewForm(pendingStatement, chainMode)),
        previewState.form === null ||
          (previewState.form === undefined && pendingStatement.length > 400))
      )
        previewState.dead = true;
      if (!previewState.form) return;
    }
    let literal: Dynamic = readStringLiteral(pendingStatement, previewState.form.at);
    if (!literal) {
      previewState.dead = true;
      return;
    }
    if (literal.closed) {
      let trailingCharacter: Dynamic = (pendingStatement.slice(literal.end + 1).match(/^\s*(\S)/) ||
        [])[1];
      if (trailingCharacter === undefined) return;
      if (trailingCharacter !== ")" && trailingCharacter !== ",") {
        previewState.dead = true;
        return;
      }
    }
    let now: Dynamic = Date.now();
    if (
      !literal.closed &&
      now - previewState.at <
        (pace
          ? Math.max(
              limits.previewMs,
              previewState.last.length / pace.previewCharsPerMs,
            )
          : limits.previewMs)
    )
      return;
    if (pace && previewCount >= pace.maxPreviews) {
      previewState.dead = true;
      return;
    }
    if (previewState.form.steps && previewState.target === undefined) {
      if (
        ((previewState.target = resolvePreviewTarget(previewState.form.steps)),
        !previewState.target)
      ) {
        previewState.dead = true;
        return;
      }
    }
    if (previewState.target && previewState.target.root) {
      if (
        previewState.form.method !== "append" &&
        previewState.form.method !== "prepend"
      ) {
        previewState.dead = true;
        return;
      }
      previewState.form = {
        method: "create",
        at: previewState.form.at,
        steps: null,
      };
      previewState.target = null;
    }
    let previewHtml: Dynamic = truncate(
      sanitizePreviewHtml(literal.value),
      limits.maxHtml,
    );
    if (literal.closed) previewState.dead = true;
    if (
      previewHtml === previewState.last ||
      !previewHtml ||
      (!literal.closed && previewHtml.length < previewState.last.length)
    )
      return;
    previewState.last = previewHtml;
    previewState.at = now;
    previewCount++;
    emit({
      kind: "preview" as const,
      seq: sequence++,
      method: previewState.form.method,
      target: previewState.target || null,
      html: previewHtml,
      head: pendingStatement.trimStart().slice(0, 80),
    });
  }
  function chunk(textChunk?: Dynamic, ..._unusedArgs: Dynamic[]): Dynamic {
    if (finished || !initialized) return;
    if (queuedFrames.size) sendQueuedFrames(false);
    if (((textChunk = String(textChunk)), useLineSplitter && !incomingLine)) {
      acceptLineChunk(textChunk);
      previewPending();
      return;
    }
    if (!stream && !useLineSplitter) stream = createSplitter();
    if (
      limits.previewMs >= 0 &&
      textChunk.includes(`
`)
    ) {
      for (let index: Dynamic = 0; index < textChunk.length; ) {
        let newlineIndex: Dynamic = textChunk.indexOf(
          `
`,
          index,
        );
        let lineFragment: Dynamic =
          newlineIndex < 0 ? textChunk.slice(index) : textChunk.slice(index, newlineIndex);
        if (lineFragment) {
          acceptStreamChunk(lineFragment);
          previewPending();
        }
        if (newlineIndex < 0) break;
        acceptStreamChunk(`
`);
        index = newlineIndex + 1;
      }
      previewPending();
      return;
    }
    acceptStreamChunk(textChunk);
    previewPending();
  }
  function endInput(..._unusedArgs: Dynamic[]): Dynamic {
    if (finished || !initialized) return;
    if (incomingLine)
      acceptStreamChunk(`
`);
    if (useLineSplitter) endLineInput();
    else if (stream) {
      stream.end();
      stream = null;
    }
    finish();
  }
  function flush(..._unusedArgs: Dynamic[]): Dynamic {
    if (finished || !initialized) return;
    if (queuedFrames.size) sendQueuedFrames(false);
    if (useLineSplitter) {
      if (compiledPending) executePending();
      return;
    }
    if (stream && stream.tail().trim() === "") restartStream();
  }
  function finish(..._unusedArgs: Dynamic[]): Dynamic {
    if (finished || !initialized) return;
    if (((finished = true), clearTimeout(idleTimer), queuedFrames.size))
      sendQueuedFrames(true);
    emit(
      Object.assign(
        {
          kind: "html" as const,
          seq: sequence++,
          html: project && project.one ? "" : lastHtml,
          stmt: "",
          final: true,
        },
        project
          ? {
              slideId: project.current,
            }
          : {},
      ),
    );
  }
  return {
    init: initialize,
    chunk: chunk,
    end: endInput,
    flush: flush,
    exec: execute,
    finish: finish,
    view: sendFileView,
    handles: sendHandles,
    get html(): Dynamic {
      return lastHtml;
    },
  };
}
export { createEditRuntime, DEFAULT_LIMITS };
