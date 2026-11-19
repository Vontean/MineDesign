/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var FAST_EDIT_INPUT_LIMITS: Dynamic;
var FAST_EDIT_WORKER_SHA256: Dynamic;
var FAST_EDIT_IFRAME_BRIDGE_SOURCE: Dynamic;
var FAST_EDIT_SANDBOX_CSP: Dynamic;
var FAST_EDIT_SANDBOX_LIMITS: Dynamic;
var FAST_EDIT_SDK3_LIMITS: Dynamic;
var FAST_EDIT_ID_PATTERN: Dynamic;
var UNSAFE_FAST_EDIT_IDS: Dynamic;
var isSafeFastEditId: Dynamic;
var FAST_EDIT_NAME_PATTERN: Dynamic;
var FAST_EDIT_HANDLE_ID_PATTERN: Dynamic;
var RESERVED_FAST_EDIT_NAMES: Dynamic;
var isReservedFastEditName: Dynamic;
var FAST_EDIT_WORKER_MESSAGE_KINDS: Dynamic;
var jsonForInlineScript: Dynamic;
var fastEditWorkerSource: Dynamic;
var verifiedFastEditWorkerBytes: Dynamic;
var installFastEditWorker: Dynamic;
var FAST_EDIT_WORKER_LIFETIME_LIMITS: Dynamic;
var FAST_EDIT_PREVIEW_PACING: Dynamic;
var deriveSandboxBridgeLimits: Dynamic;
var FAST_EDIT_CANVAS_SANDBOX_LIMITS: Dynamic;
async function verifyFastEditWorker(bytes?: Dynamic): Promise<Dynamic> {
  if (fastEditWorkerSource !== "" || verifiedFastEditWorkerBytes !== null)
    return true;
  let copiedBytes: Dynamic, computedSha256: Dynamic;
  try {
    if (
      !(bytes instanceof Uint8Array) ||
      typeof crypto != "object" ||
      crypto === null ||
      !crypto.subtle
    )
      return false;
    copiedBytes = new Uint8Array(bytes);
    computedSha256 = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", copiedBytes)),
      (byte?: Dynamic): Dynamic => byte.toString(16).padStart(2, "0"),
    ).join("");
  } catch {
    return false;
  }
  return computedSha256 !== FAST_EDIT_WORKER_SHA256
    ? false
    : (fastEditWorkerSource === "" &&
        verifiedFastEditWorkerBytes === null &&
        (verifiedFastEditWorkerBytes = copiedBytes),
      true);
}
function createFastEditSandbox({
  html: html,
  deck: deck,
  verbs: verbs,
  sdk: sdk,
  files: files,
  current: current,
  index: index,
  layouts: layouts,
  names: names,
  onHtml: onHtml,
  onDeck: onDeck,
  onOp: onOp,
  onDone: onDone,
  onTouch: onTouch,
  onPreview: onPreview,
  onError: onError,
  onLog: onLog,
  limits: limits,
}: Dynamic = {}): Dynamic {
  if (sdk !== undefined && sdk !== 2 && sdk !== 3)
    throw new Error("createReplBox: sdk must be 2, 3 or absent");
  let hasSdk: Dynamic = sdk === 2 || sdk === 3,
    filePathsById: Dynamic = null,
    noCurrent: Dynamic = false;
  if (sdk === 3) {
    if (verbs !== undefined || deck !== undefined)
      throw new Error(
        "createReplBox: sdk:3 takes files / current / index / layouts, not verbs or deck",
      );
    if (
      !Array.isArray(files) ||
      (current !== undefined && typeof current != "string")
    )
      throw new Error(
        "createReplBox: sdk:3 needs files: [{ id, path, title?, html }], which may be empty (current: id is optional: it only serves the old names slide / $(sel) / deck.current)",
      );
    if (
      files.some(
        (file?: Dynamic): Dynamic => file && file.id === "container",
      )
    )
      throw new Error(
        "createReplBox: a file cannot be named container: #container is the root they attach to",
      );
    filePathsById = Object.create(null);
    let knownPaths: Dynamic = new Set();
    for (let fileEntry of files as Dynamic) {
      if (
        !fileEntry ||
        typeof fileEntry.path != "string" ||
        !fileEntry.path ||
        fileEntry.path.length > 300 ||
        knownPaths.has(fileEntry.path) ||
        files.some(
          (file?: Dynamic): Dynamic => file && file.id === fileEntry.path,
        )
      )
        throw new Error(
          "createReplBox: every file needs a path (1 to 300 characters) that is unique and is not another file's id",
        );
      knownPaths.add(fileEntry.path);
      typeof fileEntry.id == "string" &&
        (filePathsById[fileEntry.id] = fileEntry.path);
    }
    noCurrent = current === undefined;
    verbs = {
      current: noCurrent ? "" : current,
      slides: files,
      layouts: layouts,
      title: index && index.title,
      sections: index && index.sections,
    };
    html = "<section></section>";
  }
  let effectiveLimits: Dynamic = Object.assign(
    {},
    FAST_EDIT_SANDBOX_LIMITS,
    hasSdk ? FAST_EDIT_SDK3_LIMITS : {},
    limits || {},
  );
  if (typeof html != "string" || html.length > effectiveLimits.maxHtml)
    throw new Error(
      "createReplBox: html must be a string of at most " +
        effectiveLimits.maxHtml +
        " characters",
    );
  let hasValue: Dynamic = (predicateValue?: Dynamic): Dynamic => predicateValue != null;
  if (hasValue(deck))
    throw new Error(
      "createReplBox: the deck (shell) mode is not in this build; use verbs",
    );
  if (hasValue(deck) && hasValue(verbs))
    throw new Error("createReplBox: pass deck or verbs, not both");
  let validateDeck: Dynamic = (
      verbsInput?: Dynamic,
      modeName?: Dynamic,
      allowMissingCurrent?: Dynamic,
    ): Dynamic => {
      let slideIds: Dynamic = new Set(),
        normalizedSlides: Dynamic = [];
      if (
        typeof verbsInput != "object" ||
        !(allowMissingCurrent || isSafeFastEditId(verbsInput.current)) ||
        !Array.isArray(verbsInput.slides) ||
        verbsInput.slides.length > effectiveLimits.maxSlides
      )
        throw new Error(
          "createReplBox: " +
            modeName +
            " must be { current: id, slides: [{ id, title }] } with at most " +
            effectiveLimits.maxSlides +
            " slides",
        );
      for (let slide of verbsInput.slides as Dynamic) {
        if (
          !slide ||
          !isSafeFastEditId(slide.id) ||
          slideIds.has(slide.id)
        )
          throw new Error(
            "createReplBox: " +
              modeName +
              " slide ids must be unique, match " +
              FAST_EDIT_ID_PATTERN +
              " and not be __proto__ / constructor / prototype",
          );
        slideIds.add(slide.id);
        normalizedSlides.push({
          id: slide.id,
          title: String(
            slide.title === undefined ? "" : slide.title,
          ).slice(0, 300),
        });
      }
      if (!allowMissingCurrent && !slideIds.has(verbsInput.current))
        throw new Error(
          "createReplBox: " +
            modeName +
            ".current must be one of " +
            modeName +
            ".slides",
        );
      return {
        current: verbsInput.current,
        slides: normalizedSlides,
      };
    },
    mode: Dynamic = hasValue(deck)
      ? "deck"
      : hasValue(verbs)
        ? "verbs"
        : "plain";
  if (hasSdk && mode !== "verbs")
    throw new Error(
      "createReplBox: sdk:2 needs verbs: { current, slides: [{ id, title, html }] }",
    );
  let normalizedDeck: Dynamic =
      mode === "verbs"
        ? validateDeck(verbs, sdk === 3 ? "files" : "verbs", noCurrent)
        : null,
    sandboxConfig: Dynamic = null,
    stopped: Dynamic = false,
    knownIds: Dynamic = new Set(),
    createdIds: Dynamic = new Set();
  if (hasSdk) {
    let slideHtml: Dynamic = Object.create(null),
      layoutHtml: Dynamic = Object.create(null),
      textLength: Dynamic = sdk === 3 ? 0 : html.length;
    for (let slide of verbs.slides as Dynamic)
      if (
        (knownIds.add(slide.id),
        !(sdk !== 3 && slide.id === verbs.current))
      ) {
        if (
          typeof slide.html != "string" ||
          slide.html.length > effectiveLimits.maxHtml
        )
          throw new Error(
            "createReplBox: sdk:2 needs html (a string of at most " +
              effectiveLimits.maxHtml +
              ' characters) on every slide; "' +
              slide.id +
              '" has none',
          );
        slideHtml[slide.id] = slide.html;
        textLength += slide.html.length;
      }
    if (hasValue(verbs.layouts)) {
      if (
        typeof verbs.layouts != "object" ||
        Array.isArray(verbs.layouts) ||
        Object.keys(verbs.layouts).length > effectiveLimits.maxLayouts
      )
        throw new Error(
          "createReplBox: verbs.layouts must be { name: html } with at most " +
            effectiveLimits.maxLayouts +
            " names",
        );
      for (let layoutName of Object.keys(verbs.layouts) as Dynamic) {
        let layoutContent: Dynamic = verbs.layouts[layoutName];
        if (
          !isSafeFastEditId(layoutName) ||
          typeof layoutContent != "string" ||
          layoutContent.length > effectiveLimits.maxHtml
        )
          throw new Error(
            'createReplBox: layout "' +
              layoutName +
              '" must have a name like an id (not __proto__ / constructor / prototype) and html of at most ' +
              effectiveLimits.maxHtml +
              " characters",
          );
        layoutHtml[layoutName] = layoutContent;
        textLength += layoutContent.length;
      }
    }
    if (
      hasValue(verbs.title) &&
      (typeof verbs.title != "string" || verbs.title.length > 300)
    )
      throw new Error(
        "createReplBox: verbs.title must be a string of at most 300 characters",
      );
    let sections: Dynamic = [];
    if (hasValue(verbs.sections)) {
      if (
        !Array.isArray(verbs.sections) ||
        verbs.sections.length > effectiveLimits.maxSlides
      )
        throw new Error(
          "createReplBox: verbs.sections must be [{ start: slideId, title }] with at most " +
            effectiveLimits.maxSlides +
            " entries",
        );
      for (let section of verbs.sections as Dynamic) {
        if (
          !section ||
          !isSafeFastEditId(section.start) ||
          !knownIds.has(section.start) ||
          typeof section.title != "string" ||
          section.title.length > 300 ||
          sections.some(
            (sectionItem?: Dynamic): Dynamic => sectionItem.start === section.start,
          )
        )
          throw new Error(
            "createReplBox: every section needs a start that is one of the slides (each at most once) and a title of at most 300 characters",
          );
        sections.push({
          start: section.start,
          title: section.title,
        });
        textLength += section.title.length;
      }
    }
    if (textLength > effectiveLimits.maxInputChars)
      throw new Error(
        "createReplBox: sdk:2 takes at most " +
          effectiveLimits.maxInputChars +
          " characters of slide and layout text in all",
      );
    let nameAliases: Dynamic = null;
    if (sdk === 3 && hasValue(names)) {
      if (
        typeof names != "object" ||
        Array.isArray(names) ||
        Object.keys(names).length > 40
      )
        throw new Error(
          "createReplBox: names must be { spelling: implementation | null } with at most 40 entries",
        );
      nameAliases = Object.create(null);
      for (let nameValue of Object.keys(names) as Dynamic) {
        if (
          !/^[A-Za-z_$][\w$]{0,30}$/.test(nameValue) ||
          UNSAFE_FAST_EDIT_IDS.has(nameValue) ||
          !(
            names[nameValue] === null ||
            (typeof names[nameValue] == "string" &&
              /^[A-Za-z]{1,20}$/.test(names[nameValue]))
          )
        )
          throw new Error(
            'createReplBox: names: "' +
              nameValue +
              '" must be an identifier and name an implementation (or null)',
          );
        nameAliases[nameValue] = names[nameValue];
      }
    }
    sandboxConfig = {
      version: sdk,
      paths: filePathsById,
      names: nameAliases,
      texts: slideHtml,
      layouts: layoutHtml,
      title: hasValue(verbs.title) ? verbs.title : "",
      sections: sections,
    };
  }
  let value: Dynamic =
      typeof onPreview == "function" &&
      Number.isFinite(effectiveLimits.previewMs) &&
      effectiveLimits.previewMs >= 0,
    hasPreview: Dynamic = JSON.stringify({
      deck: mode === "deck" ? validateDeck(deck, "deck") : null,
      verbs: normalizedDeck,
      sdk: sandboxConfig,
      previewMs: value ? Math.round(effectiveLimits.previewMs) : -1,
      pace:
        effectiveLimits.pace && typeof effectiveLimits.pace == "object"
          ? {
              frameCharsPerMs: effectiveLimits.pace.frameCharsPerMs,
              frameMs: effectiveLimits.pace.frameMs,
              previewCharsPerMs: effectiveLimits.pace.previewCharsPerMs,
              maxPreviews: effectiveLimits.pace.maxPreviews,
            }
          : undefined,
      chains:
        typeof effectiveLimits.chains == "boolean"
          ? effectiveLimits.chains
          : undefined,
    }),
    nonce: Dynamic = Array.from(
      crypto.getRandomValues(new Uint8Array(16)),
      (randomByte?: Dynamic): Dynamic => randomByte.toString(16).padStart(2, "0"),
    ).join(""),
    origin: Dynamic = /^https?:/.test(location.origin)
      ? location.origin
      : "*";
  if (fastEditWorkerSource === "") {
    if (verifiedFastEditWorkerBytes === null)
      throw new Error(
        "createReplBox: the Worker's text has not been accepted (acceptWorker)",
      );
    fastEditWorkerSource = jsonForInlineScript(
      new TextDecoder("utf-8", {
        fatal: true,
      }).decode(verifiedFastEditWorkerBytes),
    );
    verifiedFastEditWorkerBytes = null;
  }
  let sandboxDocument: Dynamic =
      '<!doctype html><meta http-equiv="Content-Security-Policy" content="' +
      FAST_EDIT_SANDBOX_CSP +
      '"><meta charset="utf-8"><script type="text/plain" id="w">' +
      fastEditWorkerSource +
      '<\/script><script type="text/plain" id="h">' +
      jsonForInlineScript(html) +
      '<\/script><script type="text/plain" id="d">' +
      jsonForInlineScript(hasPreview) +
      "<\/script><script>" +
      FAST_EDIT_IFRAME_BRIDGE_SOURCE.replace("__NONCE__", nonce).replace(
        "__ORIGIN__",
        origin,
      ) +
      "<\/script>",
    iframe: Dynamic = (document as Dynamic).createElement("iframe");
  iframe.setAttribute("sandbox", "allow-scripts");
  iframe.setAttribute("aria-hidden", "true");
  iframe.setAttribute("tabindex", "-1");
  iframe.style.display = "none";
  if (
    !(
      iframe.sandbox &&
      iframe.sandbox.length === 1 &&
      iframe.sandbox.contains("allow-scripts")
    )
  )
    throw new Error(
      'createReplBox: the frame must carry sandbox="allow-scripts" and nothing else',
    );
  let flag: Dynamic = false,
    didAbort: Dynamic = false,
    didLoad: Dynamic = false,
    didFail: Dynamic = false,
    text: Dynamic = "destroyed",
    loadCount: Dynamic = 0,
    protocolErrorCount: Dynamic = 0,
    frameCount: Dynamic = 0,
    messageCount: Dynamic = 0,
    lastFrameId: Dynamic = -1,
    createdAt: Dynamic = Date.now(),
    lastActivityAt: Dynamic = createdAt,
    items: Dynamic = [],
    htmlBytes: Dynamic = 0,
    resultBytes: Dynamic = 0,
    frameBytes: Dynamic = 0,
    statementCount: Dynamic = 0,
    htmlStatementCount: Dynamic = 0,
    protocolStatementCount: Dynamic = 0,
    responseCount: Dynamic = 0,
    activeRequestCount: Dynamic = 0,
    frameCharacterCount: Dynamic = 0,
    runCharacterCount: Dynamic = 0,
    values: Dynamic = new Set(),
    resolveSandbox: Dynamic,
    promise: Dynamic = new Promise((callbackValue?: Dynamic): Dynamic => {
      resolveSandbox = callbackValue;
    }),
    callback: Dynamic = (callbackInput?: Dynamic, callbackOptions?: Dynamic): Dynamic => {
      if (typeof callbackInput == "function")
        try {
          callbackInput(callbackOptions);
        } catch (callbackError: Dynamic) {
          setTimeout((): Dynamic => {
            throw callbackError;
          });
        }
    };
  function stopSandbox(): Dynamic {
    if (!flag) {
      flag = true;
      (window as Dynamic).removeEventListener("message", handleMessage);
      iframe.removeEventListener("load", handleIframeLoad);
      clearInterval(sandboxTimer);
      iframe.remove();
      items.length = 0;
      for (let pendingEntry of entries.values() as Dynamic) pendingEntry.resolve(null);
      entries.clear();
      resolveSandbox({
        ok: false,
        code: text,
      });
    }
  }
  function failSandbox(failureCode?: Dynamic, failureMessage?: Dynamic): Dynamic {
    flag ||
      ((text = failureCode),
      stopSandbox(),
      callback(onError, {
        code: failureCode,
        message: failureMessage || failureCode,
        fatal: true,
      }));
  }
  function handleProtocolError(): Dynamic {
    ++protocolErrorCount >= effectiveLimits.maxDrops &&
      failSandbox("protocol", "too many malformed messages");
  }
  function handleIframeLoad(): Dynamic {
    if (++loadCount > 1)
      return failSandbox(
        "navigated",
        "the sandbox frame loaded a second document",
      );
    let isSameOrigin: Dynamic = false;
    try {
      isSameOrigin = iframe.contentDocument !== null;
    } catch {
      isSameOrigin = false;
    }
    isSameOrigin && failSandbox("same-origin", "the sandbox frame is not cross-origin");
  }
  let isWithinMessageLimit: Dynamic = (message?: Dynamic, maxMessageLength?: Dynamic): Dynamic =>
    typeof message == "string" && message.length <= maxMessageLength;
  function measureNestedData(data?: Dynamic): Dynamic {
    if (typeof data == "string") return data.length;
    if (!data || typeof data != "object") return 0;
    let characterCount: Dynamic = 0,
      propertyCount: Dynamic = 0;
    for (let propertyName in data) {
      let propertyValue: Dynamic = data[propertyName];
      if (typeof propertyValue == "string") characterCount += propertyValue.length;
      else if (propertyValue && typeof propertyValue == "object")
        for (let nestedKey in propertyValue) {
          let nestedValue: Dynamic = propertyValue[nestedKey];
          if (++propertyCount > 5e4) return characterCount + 1e9;
          if (typeof nestedValue == "string") characterCount += nestedValue.length;
          else if (nestedValue && typeof nestedValue == "object")
            for (let deepKey in nestedValue) {
              if (++propertyCount > 5e4) return characterCount + 1e9;
              typeof nestedValue[deepKey] == "string" &&
                (characterCount += nestedValue[deepKey].length);
            }
        }
    }
    return characterCount;
  }
  function handleMessage(dataset?: Dynamic): Dynamic {
    if (flag || dataset.source !== iframe.contentWindow) return;
    let data: Dynamic = dataset.data;
    if (data && typeof data == "object" && data.kind === "html") {
      let messageSize: Dynamic = measureNestedData(data);
      if (
        messageSize > effectiveLimits.maxHtml + effectiveLimits.maxStmt + 1e3 ||
        (frameCharacterCount += messageSize) > effectiveLimits.maxFrameChars
      )
        return failSandbox(
          "flood",
          "over " +
            effectiveLimits.maxFrameChars +
            " characters of result frames came out of the sandbox in one run",
        );
    } else if ((activeRequestCount += measureNestedData(data)) > effectiveLimits.maxOutChars)
      return failSandbox(
        "flood",
        "over " +
          effectiveLimits.maxOutChars +
          " characters came out of the sandbox in one run",
      );
    if (
      dataset.origin !== "null" ||
      !data ||
      typeof data != "object" ||
      data.nonce !== nonce ||
      !FAST_EDIT_WORKER_MESSAGE_KINDS.has(data.kind)
    )
      return handleProtocolError();
    if (++frameCount > effectiveLimits.maxMessages)
      return failSandbox(
        "flood",
        "over " + effectiveLimits.maxMessages + " messages in one run",
      );
    createdAt = Date.now();
    if (data.kind !== "beat") {
      if (data.kind === "fault")
        return failSandbox(
          "no-worker",
          isWithinMessageLimit(data.message, effectiveLimits.maxMessage)
            ? data.message
            : "no worker",
        );
      if (data.kind === "ready") {
        if (didAbort) return handleProtocolError();
        didAbort = true;
        resolveSandbox({
          ok: true,
        });
        for (let queuedMessage of items.splice(0) as Dynamic) postMessage(queuedMessage);
        return;
      }
      if (data.kind === "log") {
        if (!hasSdk)
          return isWithinMessageLimit(data.message, effectiveLimits.maxMessage)
            ? callback(onLog, {
                message: data.message,
              })
            : handleProtocolError();
        if (
          !isWithinMessageLimit(data.message, effectiveLimits.maxLogMessage) ||
          (data.n !== undefined &&
            !(Number.isInteger(data.n) && data.n >= 0 && data.n <= 1e5)) ||
          (data.cut !== undefined && typeof data.cut != "boolean")
        )
          return handleProtocolError();
        if (data.n !== undefined) {
          if (
            responseCount + 1 > effectiveLimits.maxLogCalls ||
            protocolStatementCount + data.message.length > effectiveLimits.maxLogChars
          )
            return handleProtocolError();
          responseCount++;
          protocolStatementCount += data.message.length;
        } else if (data.message.length > effectiveLimits.maxMessage)
          return handleProtocolError();
        return callback(
          onLog,
          data.n === undefined
            ? {
                message: data.message,
              }
            : {
                message: data.message,
                n: data.n,
                cut: data.cut === true,
              },
        );
      }
      if (data.kind === "error") {
        if (
          !isWithinMessageLimit(data.message, effectiveLimits.maxMessage) ||
          (data.stmt !== undefined &&
            !isWithinMessageLimit(data.stmt, effectiveLimits.maxStmt))
        )
          return handleProtocolError();
        let messageSize: Dynamic =
            data.code !== undefined || data.id !== undefined,
          id: Dynamic = data.id;
        if (
          messageSize &&
          !(
            sdk === 3 &&
            (id === undefined || isSafeFastEditId(id)) &&
            (data.code === "exists"
              ? knownIds.has(id)
              : data.code === "removed"
                ? createdIds.has(id)
                : data.code === "own"
                  ? id === undefined || isReservedFastEditName(id)
                  : data.code === "not_plain" && id === undefined)
          )
        )
          return handleProtocolError();
        callback(
          onError,
          Object.assign(
            {
              code: "statement",
              message: hasSdk
                ? data.message
                    .split(
                      `
`,
                    )[0]
                    .slice(0, effectiveLimits.maxErrorChars)
                : data.message,
              stmt: data.stmt || "",
              fatal: false,
            },
            messageSize
              ? id === undefined
                ? {
                    refused: data.code,
                  }
                : {
                    refused: data.code,
                    id: id,
                  }
              : {},
          ),
        );
        !hasSdk &&
          ++messageCount >= effectiveLimits.maxStatements &&
          failSandbox("maxStatements");
        return;
      }
      if (data.kind === "deck") return handleDeckMessage(data);
      if (data.kind === "op") return handleOperationMessage(data);
      if (data.kind === "view" || data.kind === "handles")
        return handleSourceMessage(data);
      if (data.kind === "preview") return handlePreviewMessage(data);
      if (data.kind === "done") return handleDoneMessage(data);
      if (data.kind === "touch") return handleTouchMessage(data);
      if (
        !isWithinMessageLimit(data.html, effectiveLimits.maxHtml) ||
        !Number.isInteger(data.seq) ||
        data.seq < 0 ||
        data.seq <= lastFrameId ||
        !isWithinMessageLimit(data.stmt, effectiveLimits.maxStmt) ||
        (data.final !== undefined && typeof data.final != "boolean") ||
        didFail ||
        (data.final === true && !didLoad) ||
        (hasSdk &&
          !(
            typeof data.slideId == "string" &&
            (knownIds.has(data.slideId) ||
              (data.final === true &&
                (sdk === 3
                  ? data.slideId === "" && data.html === ""
                  : data.slideId === verbs.current)))
          ))
      )
        return handleProtocolError();
      lastFrameId = data.seq;
      data.final === true && (didFail = true);
      callback(
        onHtml,
        hasSdk
          ? {
              seq: data.seq,
              slideId: sdk === 3 && data.final === true ? null : data.slideId,
              html: data.html,
              stmt: data.stmt,
              final: data.final === true,
            }
          : {
              seq: data.seq,
              html: data.html,
              stmt: data.stmt,
              final: data.final === true,
            },
      );
      !hasSdk &&
        !data.final &&
        ++messageCount >= effectiveLimits.maxStatements &&
        failSandbox("maxStatements");
    }
  }
  let isBoundedArray: Dynamic = (arrayValue?: Dynamic, maxArrayLength?: Dynamic): Dynamic =>
    Array.isArray(arrayValue) &&
    arrayValue.length <= maxArrayLength &&
    arrayValue.every(
      (idValue?: Dynamic): Dynamic =>
        typeof idValue == "string" && FAST_EDIT_ID_PATTERN.test(idValue),
    ) &&
    new Set(arrayValue).size === arrayValue.length;
  function handleDeckMessage(deckMessage?: Dynamic): Dynamic {
    if (
      mode !== "deck" ||
      didFail ||
      !Number.isInteger(deckMessage.seq) ||
      deckMessage.seq < 0 ||
      deckMessage.seq <= lastFrameId ||
      (deckMessage.stmt !== undefined &&
        !isWithinMessageLimit(deckMessage.stmt, effectiveLimits.maxStmt)) ||
      !isBoundedArray(deckMessage.order, effectiveLimits.maxSlides) ||
      !isBoundedArray(deckMessage.removed, effectiveLimits.maxSlides) ||
      !Array.isArray(deckMessage.added) ||
      !Array.isArray(deckMessage.clones) ||
      deckMessage.added.length > effectiveLimits.maxNewSlides ||
      deckMessage.clones.length > effectiveLimits.maxNewSlides
    )
      return handleProtocolError();
    let deckCharacterCount: Dynamic = 0,
      addedSlides: Dynamic = [],
      clonedSlides: Dynamic = [];
    for (let addedSlide of deckMessage.added as Dynamic) {
      if (
        !addedSlide ||
        typeof addedSlide != "object" ||
        !FAST_EDIT_ID_PATTERN.test(addedSlide.id) ||
        !isWithinMessageLimit(addedSlide.html, effectiveLimits.maxHtml)
      )
        return handleProtocolError();
      deckCharacterCount += addedSlide.html.length;
      addedSlides.push({
        id: addedSlide.id,
        html: addedSlide.html,
      });
    }
    for (let clonedSlide of deckMessage.clones as Dynamic) {
      if (
        !clonedSlide ||
        typeof clonedSlide != "object" ||
        !FAST_EDIT_ID_PATTERN.test(clonedSlide.id) ||
        !FAST_EDIT_ID_PATTERN.test(clonedSlide.cloneOf)
      )
        return handleProtocolError();
      clonedSlides.push({
        id: clonedSlide.id,
        cloneOf: clonedSlide.cloneOf,
      });
    }
    for (let orderedId of deckMessage.order as Dynamic) deckCharacterCount += orderedId.length;
    for (let removedId of deckMessage.removed as Dynamic) deckCharacterCount += removedId.length;
    if (deckCharacterCount > effectiveLimits.maxDeckChars) return handleProtocolError();
    lastFrameId = deckMessage.seq;
    callback(onDeck, {
      seq: deckMessage.seq,
      stmt: deckMessage.stmt || "",
      order: deckMessage.order.slice(),
      added: addedSlides,
      clones: clonedSlides,
      removed: deckMessage.removed.slice(),
    });
    ++resultBytes >= effectiveLimits.maxStatements && failSandbox("maxStatements");
  }
  let state: Dynamic = {
      move: ["id"],
      remove: ["id"],
      duplicate: ["id"],
      add: ["html"],
    },
    deckState: Dynamic = {
      move: ["before", "after"],
      remove: [],
      duplicate: ["newId"],
      add: ["before", "after", "id"],
    };
  hasSdk &&
    ((state.title = ["title"]),
    (deckState.title = []),
    (state.undo = []),
    (deckState.undo = []),
    (state.section = ["action", "id"]),
    (deckState.section = ["title"]),
    (deckState.duplicate = ["newId", "minted", "html"]),
    (deckState.add = ["before", "after", "id", "minted"]));
  sdk === 3 &&
    ((state.askClaude = []),
    (deckState.askClaude = ["prompt"]),
    (state.order = ["ids"]),
    (deckState.order = []),
    (deckState.move = ["before", "after", "where"]),
    (deckState.add = ["before", "after", "where", "id", "minted"]),
    (deckState.duplicate = ["newId", "minted", "html", "where"]));
  let isValidOperation: Dynamic = (operation?: Dynamic): Dynamic =>
    operation !== null &&
    typeof operation == "object" &&
    !Array.isArray(operation) &&
    Object.keys(operation).length >= 1 &&
    Object.keys(operation).length <= 8 &&
    Object.keys(operation).every(
      (fieldName?: Dynamic): Dynamic =>
        /^[A-Za-z][\w-]{0,31}$/.test(fieldName) &&
        fieldName !== "before" &&
        fieldName !== "after" &&
        (isWithinMessageLimit(operation[fieldName], 100) ||
          (typeof operation[fieldName] == "number" &&
            operation[fieldName] === operation[fieldName])),
    );
  function handleOperationMessage(operationMessage?: Dynamic): Dynamic {
    let op2: Dynamic = operationMessage.op;
    if (
      mode !== "verbs" ||
      didFail ||
      !Number.isInteger(operationMessage.seq) ||
      operationMessage.seq < 0 ||
      operationMessage.seq <= lastFrameId ||
      (operationMessage.stmt !== undefined &&
        !isWithinMessageLimit(operationMessage.stmt, effectiveLimits.maxStmt)) ||
      !op2 ||
      typeof op2 != "object" ||
      Array.isArray(op2) ||
      typeof op2.op != "string" ||
      !Object.prototype.hasOwnProperty.call(state, op2.op)
    )
      return handleProtocolError();
    let allowedFields: Dynamic = state[op2.op],
      stateFields: Dynamic = deckState[op2.op],
      operationFields: Dynamic = Object.keys(op2),
      nextState: Dynamic = {
        op: op2.op,
      };
    for (let fieldName of operationFields as Dynamic)
      if (
        fieldName !== "op" &&
        !allowedFields.includes(fieldName) &&
        !stateFields.includes(fieldName)
      )
        return handleProtocolError();
    for (let fieldName of allowedFields as Dynamic)
      if (!(fieldName in op2)) return handleProtocolError();
    for (let fieldName of operationFields as Dynamic) {
      if (fieldName === "op") continue;
      let fieldValue: Dynamic = op2[fieldName];
      if (
        !(fieldName === "html"
          ? isWithinMessageLimit(fieldValue, effectiveLimits.maxHtml) &&
            (sdk === 3 ? /^<[a-z][a-z0-9-]*[\s>]/i : /^<section[\s>]/i).test(
              fieldValue,
            )
          : fieldName === "ids"
            ? isBoundedArray(fieldValue, effectiveLimits.maxSlides) &&
              fieldValue.every(
                (knownId?: Dynamic): Dynamic => knownIds.has(knownId),
              )
            : fieldName === "where"
              ? isValidOperation(fieldValue)
              : fieldName === "title"
                ? isWithinMessageLimit(fieldValue, 300) && fieldValue.length > 0
                : fieldName === "prompt"
                  ? isWithinMessageLimit(fieldValue, 1e3) && fieldValue.length > 0
                  : fieldName === "minted"
                    ? fieldValue === true
                    : fieldName === "action"
                      ? fieldValue === "start" ||
                        fieldValue === "rename" ||
                        fieldValue === "remove"
                      : isSafeFastEditId(fieldValue))
      )
        return handleProtocolError();
      nextState[fieldName] =
        fieldName === "where"
          ? Object.assign({}, fieldValue)
          : fieldName === "ids"
            ? fieldValue.slice()
            : fieldValue;
    }
    if (hasSdk) {
      for (let requiredField of ["id", "before", "after"] as Dynamic)
        if (
          requiredField in op2 &&
          !(op2.op === "add" && requiredField === "id") &&
          !knownIds.has(op2[requiredField])
        )
          return handleProtocolError();
      let targetId: Dynamic =
        op2.op === "add"
          ? op2.id
          : op2.op === "duplicate"
            ? op2.newId
            : undefined;
      if (
        (targetId !== undefined &&
          (knownIds.has(targetId) ||
            knownIds.size >= effectiveLimits.maxSlides)) ||
        (sdk === 3 &&
          targetId !== undefined &&
          (!FAST_EDIT_NAME_PATTERN.test(targetId) ||
            isReservedFastEditName(targetId))) ||
        (op2.op === "section" && (op2.action === "remove") == "title" in op2)
      )
        return handleProtocolError();
    }
    if (
      sdk === 3
        ? op2.op === "move"
          ? +(+("before" in op2) + +("after" in op2)) + +("where" in op2) != 1
          : op2.op === "add" &&
            +(+("before" in op2) + +("after" in op2)) + +("where" in op2) > 1
        : (op2.op === "move" || op2.op === "add") &&
          "before" in op2 == "after" in op2
    )
      return handleProtocolError();
    let htmlLength: Dynamic = typeof op2.html == "string" ? op2.html.length : 0,
      operationIsStopped: Dynamic =
        sdk === 3 && (op2.op === "undo" || op2.op === "askClaude");
    if (operationIsStopped && stopped) return handleProtocolError();
    let isRemoveOperation: Dynamic = operationIsStopped || (sdk === 3 && op2.op === "remove");
    if (
      (!isRemoveOperation && frameBytes + 1 > effectiveLimits.maxOps) ||
      statementCount + htmlLength > effectiveLimits.maxDeckChars
    )
      return handleProtocolError();
    isRemoveOperation || frameBytes++;
    operationIsStopped && (stopped = true);
    statementCount += htmlLength;
    lastFrameId = operationMessage.seq;
    hasSdk &&
      (op2.op === "add" && op2.id !== undefined && knownIds.add(op2.id),
      op2.op === "duplicate" &&
        op2.newId !== undefined &&
        knownIds.add(op2.newId),
      op2.op === "remove" &&
        (knownIds.delete(op2.id), createdIds.add(op2.id)));
    callback(onOp, {
      seq: operationMessage.seq,
      stmt: operationMessage.stmt || "",
      op: nextState,
    });
  }
  function handleDoneMessage(doneMessage?: Dynamic): Dynamic {
    if (
      !hasSdk ||
      didFail ||
      !Number.isInteger(doneMessage.seq) ||
      doneMessage.seq < 0 ||
      doneMessage.seq <= lastFrameId ||
      !Number.isInteger(doneMessage.n) ||
      doneMessage.n <= htmlStatementCount ||
      doneMessage.n > 1e5 ||
      !isWithinMessageLimit(doneMessage.stmt, effectiveLimits.maxStmt) ||
      !isBoundedArray(doneMessage.changed, effectiveLimits.maxSlides) ||
      !doneMessage.changed.every(
        (knownId?: Dynamic): Dynamic => knownIds.has(knownId),
      ) ||
      !Number.isInteger(doneMessage.logged) ||
      doneMessage.logged < 0 ||
      doneMessage.logged > 1e4 ||
      (doneMessage.skipped !== undefined && typeof doneMessage.skipped != "boolean") ||
      (doneMessage.handles !== undefined &&
        !(
          sdk === 3 &&
          isBoundedArray(doneMessage.handles, effectiveLimits.maxSlides) &&
          doneMessage.handles.every(
            (knownId?: Dynamic): Dynamic => knownIds.has(knownId),
          )
        )) ||
      (doneMessage.threw !== undefined &&
        !(
          doneMessage.threw &&
          typeof doneMessage.threw == "object" &&
          !Array.isArray(doneMessage.threw) &&
          Object.keys(doneMessage.threw).length === 1 &&
          isWithinMessageLimit(doneMessage.threw.message, effectiveLimits.maxMessage)
        ))
    )
      return handleProtocolError();
    lastFrameId = doneMessage.seq;
    htmlStatementCount = doneMessage.n;
    let doneState: Dynamic = {
      seq: doneMessage.seq,
      n: doneMessage.n,
      stmt: doneMessage.stmt,
      changed: doneMessage.changed.slice(),
      logged: doneMessage.logged,
    };
    doneMessage.threw &&
      (doneState.threw = {
        message: doneMessage.threw.message
          .split(
            `
`,
          )[0]
          .slice(0, effectiveLimits.maxErrorChars),
      });
    doneMessage.skipped === true && (doneState.skipped = true);
    doneMessage.handles !== undefined && (doneState.handles = doneMessage.handles.slice());
    callback(onDone, doneState);
    ++messageCount >= effectiveLimits.maxStatements && failSandbox("maxStatements");
  }
  function handleTouchMessage(touchMessage?: Dynamic): Dynamic {
    if (
      !hasSdk ||
      didFail ||
      !Number.isInteger(touchMessage.seq) ||
      touchMessage.seq < 0 ||
      touchMessage.seq <= lastFrameId ||
      !Number.isInteger(touchMessage.n) ||
      touchMessage.n < 0 ||
      touchMessage.n > 1e5 ||
      typeof touchMessage.slideId != "string" ||
      !knownIds.has(touchMessage.slideId) ||
      values.has(touchMessage.slideId)
    )
      return handleProtocolError();
    lastFrameId = touchMessage.seq;
    values.add(touchMessage.slideId);
    callback(onTouch, {
      seq: touchMessage.seq,
      n: touchMessage.n,
      slideId: touchMessage.slideId,
    });
  }
  let allowedEventMethods: Dynamic = new Set([
    "html",
    "append",
    "prepend",
    "after",
    "before",
    "create",
    "add",
  ]);
  function handlePreviewMessage(event?: Dynamic): Dynamic {
    if (
      !value ||
      didFail ||
      !Number.isInteger(event.seq) ||
      event.seq < 0 ||
      event.seq <= lastFrameId ||
      !allowedEventMethods.has(event.method) ||
      !isWithinMessageLimit(event.html, effectiveLimits.maxHtml) ||
      !isWithinMessageLimit(event.head, 80)
    )
      return handleProtocolError();
    let previewTarget: Dynamic = null;
    if (event.target !== null && event.target !== undefined) {
      let target: Dynamic = event.target;
      if (
        typeof target != "object" ||
        Array.isArray(target) ||
        Object.keys(target).some(
          (propertyName?: Dynamic): Dynamic => propertyName !== "file" && propertyName !== "id",
        ) ||
        !(
          target.file === null ||
          (typeof target.file == "string" &&
            hasSdk &&
            knownIds.has(target.file))
        ) ||
        !(target.id === null || isWithinMessageLimit(target.id, 128))
      )
        return handleProtocolError();
      previewTarget = {
        file: target.file,
        id: target.id,
      };
    }
    if (
      (event.method === "create" || event.method === "add") !=
        (previewTarget === null) ||
      ++runCharacterCount > effectiveLimits.maxPreviews
    )
      return handleProtocolError();
    lastFrameId = event.seq;
    callback(onPreview, {
      seq: event.seq,
      method: event.method,
      target: previewTarget,
      html: event.html,
      head: event.head,
    });
  }
  let entries: Dynamic = new Map(),
    requestCount: Dynamic = 0,
    requestKeyPattern: Dynamic = /^k[a-z]{0,2}$/;
  function handleSourceMessage(source?: Dynamic): Dynamic {
    let requestSource: Dynamic = Number.isInteger(source.req)
      ? entries.get(source.req)
      : undefined;
    if (
      sdk !== 3 ||
      !requestSource ||
      requestSource.kind !== source.kind ||
      source.attr !== "id" ||
      !(typeof source.prefix == "string" && requestKeyPattern.test(source.prefix))
    )
      return handleProtocolError();
    let requestResult: Dynamic;
    if (source.kind === "view") {
      if (
        typeof source.slideId != "string" ||
        source.slideId !== requestSource.id ||
        !knownIds.has(source.slideId) ||
        !isWithinMessageLimit(source.html, effectiveLimits.maxViewChars)
      )
        return handleProtocolError();
      requestResult = {
        id: source.slideId,
        attr: "id",
        prefix: source.prefix,
        html: source.html,
      };
    } else {
      if (
        !Array.isArray(source.rows) ||
        source.rows.length > effectiveLimits.maxHandleRows
      )
        return handleProtocolError();
      let requestRows: Dynamic = [];
      for (let row of source.rows as Dynamic) {
        if (
          !row ||
          typeof row != "object" ||
          !(
            typeof row.k == "string" &&
            row.k.startsWith(source.prefix) &&
            /^\d{1,6}$/.test(row.k.slice(source.prefix.length))
          ) ||
          typeof row.file != "string" ||
          !knownIds.has(row.file) ||
          !isWithinMessageLimit(row.tag, 20) ||
          !/^[a-z0-9]*$/.test(row.tag) ||
          !isWithinMessageLimit(row.words, 40)
        )
          return handleProtocolError();
        requestRows.push({
          k: row.k,
          file: row.file,
          tag: row.tag,
          words: row.words,
        });
      }
      requestResult = {
        attr: "id",
        prefix: source.prefix,
        rows: requestRows,
      };
    }
    entries.delete(source.req);
    requestSource.resolve(requestResult);
  }
  function requestData(requestKind?: Dynamic, requestOptions?: Dynamic): Dynamic {
    return sdk !== 3
      ? Promise.reject(
          new Error("createReplBox: view() and handles() are sdk:3"),
        )
      : promise.then(
          (requestResponse?: Dynamic): Dynamic =>
            new Promise((resolveRequest?: Dynamic): Dynamic => {
              if (!requestResponse.ok || flag || requestCount >= effectiveLimits.maxAsks)
                return resolveRequest(null);
              let requestId: Dynamic = ++requestCount;
              entries.set(requestId, {
                kind: requestKind,
                id: requestOptions.id,
                resolve: resolveRequest,
              });
              postMessage(
                Object.assign(
                  {
                    kind: requestKind,
                    req: requestId,
                  },
                  requestOptions,
                ),
              );
            }),
        );
  }
  function postMessage(message?: Dynamic): Dynamic {
    message.nonce = nonce;
    iframe.contentWindow.postMessage(message, "*");
  }
  function postSourceMessage(source?: Dynamic): Dynamic {
    flag ||
      didFail ||
      (didLoad && source.kind === "chunk") ||
      (didAbort ? postMessage(source) : items.push(source));
  }
  let sandboxTimer: Dynamic = setInterval((): Dynamic => {
    if (flag) return;
    let now: Dynamic = Date.now();
    if (now - lastActivityAt > effectiveLimits.maxMs)
      return didFail
        ? stopSandbox()
        : failSandbox("maxMs", "the run passed " + effectiveLimits.maxMs + " ms");
    if (!didFail) {
      if (!didAbort && now - lastActivityAt > effectiveLimits.bootMs)
        return failSandbox(
          "no-worker",
          "the sandbox was not ready in " + effectiveLimits.bootMs + " ms",
        );
      if (now - createdAt > effectiveLimits.silenceMs)
        return failSandbox(
          "timeout",
          "the sandbox went silent for " + effectiveLimits.silenceMs + " ms",
        );
    }
  }, 250);
  (window as Dynamic).addEventListener("message", handleMessage);
  iframe.addEventListener("load", handleIframeLoad);
  iframe.srcdoc = sandboxDocument;
  (document as Dynamic).body.appendChild(iframe);
  return {
    feed(feedChunk: Dynamic): Dynamic {
      if (!(typeof feedChunk != "string" || !feedChunk || flag || didLoad)) {
        if ((htmlBytes += feedChunk.length) > effectiveLimits.maxFeedChars)
          return failSandbox(
            "flood",
            "over " +
              effectiveLimits.maxFeedChars +
              " characters fed in one run",
          );
        postSourceMessage({
          kind: "chunk",
          text: feedChunk,
        });
      }
    },
    view(viewValue: Dynamic): Dynamic {
      let viewFileId: Dynamic =
        (filePathsById &&
          typeof viewValue == "string" &&
          Object.keys(filePathsById).find(
            (filePath?: Dynamic): Dynamic => filePathsById[filePath] === viewValue,
          )) ||
        viewValue;
      return requestData("view", {
        id: viewFileId,
      });
    },
    handles(handleCount: Dynamic): Dynamic {
      return requestData("handles", {
        since: Number.isInteger(handleCount) && handleCount > 0 ? handleCount : 0,
      });
    },
    flush(): Dynamic {
      didAbort &&
        !didLoad &&
        postSourceMessage({
          kind: "flush",
        });
    },
    end(): Dynamic {
      didLoad ||
        ((didLoad = true),
        postSourceMessage({
          kind: "end",
        }));
    },
    stop: stopSandbox,
    destroy: stopSandbox,
    ready: promise,
    get alive(): Dynamic {
      return !flag;
    },
  };
}
export {
  createFastEditSandbox,
  deriveSandboxBridgeLimits,
  FAST_EDIT_CANVAS_SANDBOX_LIMITS,
  FAST_EDIT_HANDLE_ID_PATTERN,
  FAST_EDIT_ID_PATTERN,
  FAST_EDIT_IFRAME_BRIDGE_SOURCE,
  FAST_EDIT_INPUT_LIMITS,
  FAST_EDIT_NAME_PATTERN,
  FAST_EDIT_PREVIEW_PACING,
  FAST_EDIT_SANDBOX_CSP,
  FAST_EDIT_SANDBOX_LIMITS,
  FAST_EDIT_SDK3_LIMITS,
  FAST_EDIT_WORKER_LIFETIME_LIMITS,
  FAST_EDIT_WORKER_MESSAGE_KINDS,
  FAST_EDIT_WORKER_SHA256,
  fastEditWorkerSource,
  installFastEditWorker,
  isReservedFastEditName,
  isSafeFastEditId,
  jsonForInlineScript,
  RESERVED_FAST_EDIT_NAMES,
  UNSAFE_FAST_EDIT_IDS,
  verifiedFastEditWorkerBytes,
  verifyFastEditWorker,
};
export function installFastEditSandbox(): () => void {
  return () => {
    FAST_EDIT_INPUT_LIMITS = {
      maxSection: 2e5,
      maxBoxChars: 6e5,
      maxFiles: 512,
      maxFed: 2e5,
    };
    FAST_EDIT_WORKER_SHA256 =
      "18e7e4395b5e25f4a482f14c74fa91959d4772ce7ca3a23411abeb1505efc8b1";
    FAST_EDIT_IFRAME_BRIDGE_SOURCE =
      '(function fastEditIframeBridge() {\n  const nonce = "__NONCE__";\n  const origin = "__ORIGIN__";\n  const parentWindow = window.parent;\n  const postToParent = (message) => {\n    message.nonce = nonce;\n    parentWindow.postMessage(message, origin);\n  };\n  const readJsonScript = (id) => {\n    return JSON.parse(document.getElementById(id).textContent);\n  };\n  let worker;\n  let ready = false;\n  const fault = (message) => postToParent({ kind: "fault", message });\n  try {\n    worker = new Worker(\n      URL.createObjectURL(\n        new Blob([readJsonScript("w")], { type: "text/javascript" })\n      )\n    );\n  } catch {\n    fault("no worker");\n    return;\n  }\n  worker.onerror = (event) => {\n    const message = String(event && event.message || "failed").slice(0, 300);\n    if (ready)\n      postToParent({\n        kind: "error",\n        message: "uncaught: " + message,\n        stmt: ""\n      });\n    else fault("worker: " + message);\n  };\n  worker.onmessage = (event) => {\n    const data = event.data;\n    const kind = data && data.kind;\n    if (kind === "ready") {\n      ready = true;\n      postToParent({ kind });\n    } else if (kind === "beat") postToParent({ kind });\n    else if (kind === "html")\n      postToParent({\n        kind,\n        seq: data.seq,\n        slideId: data.slideId,\n        html: data.html,\n        stmt: data.stmt,\n        final: data.final === true\n      });\n    else if (kind === "done")\n      postToParent({\n        kind,\n        seq: data.seq,\n        n: data.n,\n        stmt: data.stmt,\n        changed: data.changed,\n        logged: data.logged,\n        threw: data.threw,\n        skipped: data.skipped,\n        handles: data.handles\n      });\n    else if (kind === "touch")\n      postToParent({ kind, seq: data.seq, n: data.n, slideId: data.slideId });\n    else if (kind === "preview")\n      postToParent({\n        kind,\n        seq: data.seq,\n        method: data.method,\n        target: data.target,\n        html: data.html,\n        head: data.head\n      });\n    else if (kind === "view")\n      postToParent({\n        kind,\n        req: data.req,\n        slideId: data.slideId,\n        attr: data.attr,\n        prefix: data.prefix,\n        html: data.html\n      });\n    else if (kind === "handles")\n      postToParent({\n        kind,\n        req: data.req,\n        attr: data.attr,\n        prefix: data.prefix,\n        rows: data.rows\n      });\n    else if (kind === "op")\n      postToParent({ kind, seq: data.seq, stmt: data.stmt, op: data.op });\n    else if (kind === "error")\n      postToParent({\n        kind,\n        message: data.message,\n        stmt: data.stmt,\n        code: data.code,\n        id: data.id\n      });\n    else if (kind === "log")\n      postToParent({ kind, message: data.message, n: data.n, cut: data.cut });\n  };\n  addEventListener("message", (event) => {\n    const data = event.data;\n    if (event.source !== parentWindow || !data || data.nonce !== nonce) return;\n    if (data.kind === "chunk" && typeof data.text === "string")\n      worker.postMessage({ kind: "chunk", text: data.text });\n    else if (data.kind === "flush") worker.postMessage({ kind: "flush" });\n    else if (data.kind === "view" && typeof data.id === "string")\n      worker.postMessage({ kind: "view", id: data.id, req: data.req });\n    else if (data.kind === "handles")\n      worker.postMessage({ kind: "handles", since: data.since, req: data.req });\n    else if (data.kind === "end") worker.postMessage({ kind: "end" });\n  });\n  const configuration = JSON.parse(readJsonScript("d")) || {};\n  worker.postMessage({\n    kind: "init",\n    html: readJsonScript("h"),\n    deck: configuration.deck || null,\n    verbs: configuration.verbs || null,\n    sdk: configuration.sdk || null,\n    previewMs: configuration.previewMs,\n    pace: configuration.pace,\n    chains: configuration.chains\n  });\n})()';
    FAST_EDIT_SANDBOX_CSP =
      "default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; child-src blob:; style-src 'unsafe-inline'; img-src data:; base-uri 'none'; form-action 'none'";
    FAST_EDIT_SANDBOX_LIMITS = {
      silenceMs: 4e3,
      bootMs: 1500,
      maxStatements: 200,
      maxMs: 12e4,
      maxHtml: 2e5,
      maxMessage: 2e3,
      maxStmt: 4e3,
      maxDrops: 5,
      maxMessages: 2e3,
      maxFeedChars: 2e5,
      maxSlides: 500,
      maxNewSlides: 8,
      maxDeckChars: 1e6,
      maxOps: 24,
      maxOutChars: 8e6,
      previewMs: 120,
      maxPreviews: 1500,
    };
    FAST_EDIT_SDK3_LIMITS = {
      maxMessages: 6e3,
      maxSlides: 512,
      maxInputChars: 2e6,
      maxLayouts: 32,
      maxLogMessage: 12e3,
      maxLogChars: 24576,
      maxLogCalls: 12,
      maxErrorChars: 200,
      maxStatements: 400,
      maxOutChars: 16e6,
      maxFrameChars: 16e6,
      maxViewChars: 3e5,
      maxHandleRows: 4e3,
      maxAsks: 400,
    };
    FAST_EDIT_ID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;
    UNSAFE_FAST_EDIT_IDS = new Set(["__proto__", "constructor", "prototype"]);
    isSafeFastEditId = (candidateId?: Dynamic): Dynamic =>
      typeof candidateId == "string" &&
      FAST_EDIT_ID_PATTERN.test(candidateId) &&
      !UNSAFE_FAST_EDIT_IDS.has(candidateId);
    FAST_EDIT_NAME_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,23}$/;
    FAST_EDIT_HANDLE_ID_PATTERN = /^k[a-z]{0,2}\d{1,6}$/;
    RESERVED_FAST_EDIT_NAMES = [
      "container",
      "constructor",
      "prototype",
      "body",
      "html",
      "head",
    ];
    isReservedFastEditName = (candidateName?: Dynamic): Dynamic =>
      FAST_EDIT_HANDLE_ID_PATTERN.test(candidateName) ||
      RESERVED_FAST_EDIT_NAMES.includes(candidateName.toLowerCase());
    FAST_EDIT_WORKER_MESSAGE_KINDS = new Set(
      [
        "ready",
        "html",
        "op",
        "done",
        "touch",
        "preview",
        "view",
        "handles",
        "error",
        "log",
        "beat",
        "fault",
      ].concat([]),
    );
    jsonForInlineScript = (scriptInput?: Dynamic): Dynamic =>
      JSON.stringify(String(scriptInput)).replace(/</g, "\\u003c");
    fastEditWorkerSource = "";
    verifiedFastEditWorkerBytes = null;
    installFastEditWorker = (workerBytes?: Dynamic): Dynamic =>
      verifyFastEditWorker(workerBytes);
    FAST_EDIT_WORKER_LIFETIME_LIMITS = {
      lifeMs: 27 * 6e4,
      maxSection: FAST_EDIT_INPUT_LIMITS.maxSection,
      maxFed: FAST_EDIT_INPUT_LIMITS.maxFed,
      maxStmt: 4e3,
      maxFiles: FAST_EDIT_INPUT_LIMITS.maxFiles,
      maxStatements: 400,
      maxOps: 24,
      beatMs: 500,
    };
    FAST_EDIT_PREVIEW_PACING = {
      frameCharsPerMs: 100,
      frameMs: 250,
      previewCharsPerMs: 5,
      maxPreviews: 1e3,
    };
    deriveSandboxBridgeLimits = (
      limitConfig?: Dynamic,
      paceConfig?: Dynamic,
    ): Dynamic => ({
      maxMs: limitConfig.lifeMs,
      previewMs: 250,
      pace: paceConfig,
      maxFrameChars:
        paceConfig.frameCharsPerMs * limitConfig.lifeMs +
        (limitConfig.maxFiles + limitConfig.maxOps + 1) *
          (limitConfig.maxSection + limitConfig.maxStmt + 200),
      maxMessages: 16e3,
    });
    FAST_EDIT_CANVAS_SANDBOX_LIMITS = deriveSandboxBridgeLimits(
      FAST_EDIT_WORKER_LIFETIME_LIMITS,
      FAST_EDIT_PREVIEW_PACING,
    );
  };
}
