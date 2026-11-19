/** Restored injected script; compiled as an isolated IIFE before insertion into a preview. */
import type { Dynamic } from "../runtime-types";
(function (): Dynamic {
  "use strict";

  var parent: Dynamic = (window as Dynamic).parent;
  if (!parent || parent === window) return;
  /* Authored script CAN run between write steps, in this realm (when the head loads its runtime by URL the parser instead
   * buffers every later chunk behind that fetch and runs them after the writer has closed: stricter, same order). So:
   * strict mode throughout (a sloppy step would be reachable through Function#caller from script running inside its write); everything a step touches is captured HERE, before the
   * first authored byte, and used only through these locals - no step evaluates a property an authored script could have
   * redefined (MessageChannel#port2, MessagePort#postMessage/onmessage, Array.prototype indices, String, ...); a step that
   * finds the parser already ended writes nothing more (a write then would re-open the document and parse the remaining
   * chunks as a fresh one); a finished writer holds no native and answers nothing. */
  var value_doc: Dynamic = document,
    prototype: Dynamic = Document.prototype,
    open: Dynamic = prototype.open,
    write: Dynamic = prototype.write,
    close: Dynamic = prototype.close,
    applyMethod: Dynamic = Reflect.apply,
    value_Str: Dynamic = String;
  var get: Dynamic = (Object as Dynamic).getOwnPropertyDescriptor(
    prototype,
    "readyState",
  ).get;
  /* every chunk is written as TrustedHTML minted by the loader's own policy: a write of TrustedHTML never consults the realm's
   * 'default' policy, which an authored script could otherwise register (and switch enforcement on with a <meta> CSP) to
   * rewrite the remaining chunks on their way into the parser */
  var value_mint: Dynamic = null;
  try {
    if (
      (window as Dynamic).trustedTypes &&
      (window as Dynamic).trustedTypes.createPolicy
    ) {
      var value_policy: Dynamic = (window as Dynamic).trustedTypes.createPolicy(
        "dc-boot#" + Math.random().toString(36).slice(2),
        {
          createHTML: function (
            this: Dynamic,
            html?: Dynamic,
            ..._extraArguments: Dynamic[]
          ): Dynamic {
            return html;
          },
        },
      );
      value_mint = function (
        this: Dynamic,
        html?: Dynamic,
        ..._policyArgs: Dynamic[]
      ): Dynamic {
        return value_policy.createHTML(html);
      };
    }
  } catch (value_e: Dynamic) {
    value_mint = null;
  }
  var value_ch: Dynamic = new MessageChannel(),
    receivePort: Dynamic = value_ch.port1,
    sendPort: Dynamic = value_ch.port2,
    postMessage: Dynamic = MessagePort.prototype.postMessage,
    closePort: Dynamic = MessagePort.prototype.close;
  var value_fail: Dynamic = function (
    this: Dynamic,
    html?: Dynamic,
    ..._normalizeArgs: Dynamic[]
  ): Dynamic {
    var text: Dynamic = "boot failed";
    try {
      text = value_Str(html);
    } catch (value_e: Dynamic) {}
    try {
      parent.postMessage(
        {
          __dc_boot_failed: 1,
          e: text,
        },
        "*",
      );
    } catch (value_e: Dynamic) {}
  };
  var value_writeDoc: Dynamic = function (
    this: Dynamic,
    html?: Dynamic,
    ..._writeArgs: Dynamic[]
  ): Dynamic {
    var value_re: Dynamic = /<\/script[^>]*>/gi,
      items: Dynamic = [],
      index: Dynamic = 0;
    while (value_re.exec(html) !== null) {
      items.push(html.slice(index, value_re.lastIndex));
      index = value_re.lastIndex;
    }
    items.push(html.slice(index));
    if (value_mint) {
      for (var chunkIndex: Dynamic = 0; chunkIndex < items.length; chunkIndex += 1)
        items[chunkIndex] = value_mint(items[chunkIndex]);
    }
    var nextChunkIndex: Dynamic = 0,
      length: Dynamic = items.length,
      value_closed: Dynamic = false;
    var onmessage: Dynamic = function (
      this: Dynamic,
      ..._pumpArgs: Dynamic[]
    ): Dynamic {
      if (value_closed || nextChunkIndex >= length) return;
      var value_chunk: Dynamic = items[nextChunkIndex];
      nextChunkIndex += 1;
      try {
        /* window.stop() or a navigation start ended the parser between steps (or an authored document.close did):
         * another write would re-open the document and parse the rest as a fresh one - stop instead */
        if (nextChunkIndex > 1 && applyMethod(get, value_doc, []) !== "loading")
          throw "the document was closed before it was fully written";
        applyMethod(write, value_doc, [value_chunk]);
        if (nextChunkIndex < length) {
          applyMethod(postMessage, sendPort, [0]);
          return;
        }
        value_closed = true;
        applyMethod(closePort, receivePort, []);
        applyMethod(close, value_doc, []);
      } catch (value_err: Dynamic) {
        value_closed = true;
        try {
          applyMethod(closePort, receivePort, []);
        } catch (value_e: Dynamic) {}
        value_fail(value_err);
      }
      open =
        write =
        close =
        get =
        postMessage =
        closePort =
        applyMethod =
        value_Str =
        value_fail =
        value_mint =
        items =
        receivePort =
        sendPort =
        value_doc =
          null;
    };
    receivePort.onmessage = onmessage;
    applyMethod(open, value_doc, []);
    onmessage();
  };
  var value_onDoc: Dynamic = function (
    this: Dynamic,
    event?: Dynamic,
    ..._messageArgs: Dynamic[]
  ): Dynamic {
    if (event.source !== parent) return;
    var data: Dynamic = event.data;
    if (!data || data.__dc_doc !== 1 || typeof data.doc !== "string") return;
    (window as Dynamic).removeEventListener("message", value_onDoc);
    var value_parts: Dynamic =
      data.parts && typeof data.parts === "object" ? data.parts : {};
    /* script parts the host minted a page URL for (part-blobs.ts partScriptUrls): project path to blob: URL */
    var __dcPartUrls: Dynamic = {},
      value_given: Dynamic =
        data.urls && typeof data.urls === "object" ? data.urls : {};
    for (var value_k in value_given) {
      if (
        (Object as Dynamic).prototype.hasOwnProperty.call(
          value_given,
          value_k,
        ) &&
        typeof value_given[value_k] === "string" &&
        value_given[value_k].indexOf("blob:") === 0
      )
        __dcPartUrls[value_k] = value_given[value_k];
    }
    (window as Dynamic).__dcPartUrls = __dcPartUrls;
    var value_ids: Dynamic = (Object as Dynamic).keys(value_parts);
    Promise.all(
      value_ids.map(function (
        this: Dynamic,
        key?: Dynamic,
        ..._lookupArgs: Dynamic[]
      ): Dynamic {
        var value_b: Dynamic = value_parts[key];
        return value_b instanceof Blob ? value_b.text() : String(value_b);
      }),
    )
      .then(function (
        this: Dynamic,
        parts?: Dynamic,
        ..._partsArgs: Dynamic[]
      ): Dynamic {
        var __dcParts: Dynamic = {},
          __dcPartBlobs: Dynamic = {};
        for (var index: Dynamic = 0; index < value_ids.length; index += 1) {
          __dcParts[value_ids[index]] = parts[index];
          if (
            value_ids[index].indexOf("file:") === 0 &&
            value_parts[value_ids[index]] instanceof Blob
          )
            __dcPartBlobs[value_ids[index].slice(5)] =
              value_parts[value_ids[index]];
        }
        (window as Dynamic).__dcParts = __dcParts;
        (window as Dynamic).__dcPartBlobs = __dcPartBlobs;
        value_writeDoc(data.doc);
      })
      .then(null, value_fail);
  };
  (window as Dynamic).addEventListener("message", value_onDoc);
})();
