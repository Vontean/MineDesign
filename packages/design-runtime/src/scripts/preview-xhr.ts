/** Restored injected script; compiled as an isolated IIFE before insertion into a preview. */
import type { Dynamic } from "../runtime-types";
(function (this: Dynamic, ..._scriptArgs: Dynamic[]): Dynamic {
  var XMLHttpRequest: Dynamic = (window as Dynamic).XMLHttpRequest,
    __dcLookup: Dynamic = (window as Dynamic).__dcLookup;
  if (
    !XMLHttpRequest ||
    !XMLHttpRequest.prototype ||
    typeof __dcLookup !== "function"
  )
    return;
  var prototype: Dynamic = XMLHttpRequest.prototype,
    open: Dynamic = prototype.open,
    send: Dynamic = prototype.send,
    setRequestHeader: Dynamic = prototype.setRequestHeader,
    overrideMimeType: Dynamic = prototype.overrideMimeType,
    abort: Dynamic = prototype.abort;
  var overriddenProperties: Dynamic = [
    "readyState",
    "status",
    "statusText",
    "response",
    "responseText",
    "responseXML",
    "responseURL",
    "getResponseHeader",
    "getAllResponseHeaders",
  ];
  var setLocalResponseProperty: Dynamic = function (
    this: Dynamic,
    request?: Dynamic,
    propertyName?: Dynamic,
    propertyValue?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    try {
      (Object as Dynamic).defineProperty(request, propertyName, {
        value: propertyValue,
        configurable: true,
        writable: true,
      });
    } catch (_error: Dynamic) {}
  };
  /* a reused object gets its native accessors back before each open */
  var clearLocalResponse: Dynamic = function (
    this: Dynamic,
    request?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    for (var index: Dynamic = 0; index < overriddenProperties.length; index += 1) {
      try {
        delete request[overriddenProperties[index]];
      } catch (_error: Dynamic) {}
    }
  };
  var dispatchRequestEvent: Dynamic = function (
    this: Dynamic,
    request?: Dynamic,
    eventName?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    try {
      request.dispatchEvent(new Event(eventName));
    } catch (_error: Dynamic) {}
  };
  prototype.open = function (
    this: Dynamic,
    method?: Dynamic,
    url?: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    clearLocalResponse(this);
    var localFile: Dynamic = /^get$/i.test(String(method))
      ? __dcLookup(url)
      : null;
    if (!localFile) {
      this.__dcHit = null;
      return open.apply(this, arguments);
    }
    /* a reused object: quiesce any native request still in flight, as a native open would */
    if (this.__dcHit === null) {
      try {
        abort.apply(this);
      } catch (_error: Dynamic) {}
    }
    this.__dcHit = {
      f: localFile,
      async: arguments.length < 3 || !!arguments[2],
    };
    setLocalResponseProperty(this, "readyState", 1);
    setLocalResponseProperty(this, "status", 0);
    dispatchRequestEvent(this, "readystatechange");
  };
  prototype.setRequestHeader = function (
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    if (!this.__dcHit) return setRequestHeader.apply(this, arguments);
  };
  if (overrideMimeType)
    prototype.overrideMimeType = function (
      this: Dynamic,
      ..._unusedArgs: Dynamic[]
    ): Dynamic {
      if (!this.__dcHit) return overrideMimeType.apply(this, arguments);
    };
  prototype.abort = function (
    this: Dynamic,
    ..._unusedArgs: Dynamic[]
  ): Dynamic {
    var __dcHit: Dynamic = this.__dcHit;
    if (!__dcHit) return abort.apply(this, arguments);
    this.__dcHit = null;
    if (__dcHit.sent && !__dcHit.done) {
      setLocalResponseProperty(this, "readyState", 4);
      dispatchRequestEvent(this, "readystatechange");
      dispatchRequestEvent(this, "abort");
      dispatchRequestEvent(this, "loadend");
    }
    clearLocalResponse(this);
  };
  prototype.send = function (
    this: Dynamic,
    ..._sendArgs: Dynamic[]
  ): Dynamic {
    var __dcHit: Dynamic = this.__dcHit;
    if (!__dcHit) return send.apply(this, arguments);
    if (__dcHit.sent) return;
    __dcHit.sent = true;
    var request: Dynamic = this,
      localFile: Dynamic = __dcHit.f,
      responseType: Dynamic = "";
    try {
      responseType = String(request.responseType || "");
    } catch (_error: Dynamic) {}
    var finishLocalRequest: Dynamic = function (
      this: Dynamic,
      ..._completionArgs: Dynamic[]
    ): Dynamic {
      if (request.__dcHit !== __dcHit) return; /* aborted or re-opened */
      /* as text: the file's characters (an image's bytes decoded, as fetch().text() gives), never the map's base64 */
      var responseText: Dynamic = localFile.bytes
        ? new TextDecoder().decode(localFile.bytes)
        : localFile.text;
      var responseBody: Dynamic = responseText;
      // MineDesign: restorer fix — the branches below test the request's responseType (`text`, `rt` in the original script);
      // the restored code tested the response text, so arraybuffer / blob / json / document responses came back as text.
      try {
        if (responseType === "arraybuffer")
          responseBody = localFile.bytes
            ? localFile.bytes.buffer.slice(0)
            : new TextEncoder().encode(localFile.text).buffer;
        else if (responseType === "blob")
          responseBody = new Blob([localFile.bytes || localFile.text], {
            type: localFile.mime,
          });
        else if (responseType === "json") responseBody = JSON.parse(responseText);
        else if (responseType === "document")
          responseBody = new DOMParser().parseFromString(
            responseText,
            localFile.mime === "text/html"
              ? "text/html"
              : localFile.mime === "image/svg+xml"
                ? "image/svg+xml"
                : "application/xml",
          );
      } catch (_error: Dynamic) {
        responseBody = null;
      }
      setLocalResponseProperty(request, "status", 200);
      setLocalResponseProperty(request, "statusText", "OK");
      try {
        setLocalResponseProperty(
          request,
          "responseURL",
          String(
            new URL(
              "/appifact/" +
                localFile.key.split("/").map(encodeURIComponent).join("/"),
              (document as Dynamic).baseURI,
            ),
          ),
        );
      } catch (_error: Dynamic) {}
      setLocalResponseProperty(request, "response", responseBody);
      if (responseType === "" || responseType === "text")
        setLocalResponseProperty(request, "responseText", responseText);
      if (responseType === "document")
        setLocalResponseProperty(request, "responseXML", responseBody);
      request.getResponseHeader = function (
        this: Dynamic,
        headerName?: Dynamic,
        ..._unusedArgs: Dynamic[]
      ): Dynamic {
        return /^content-type$/i.test(String(headerName)) ? localFile.mime : null;
      };
      request.getAllResponseHeaders = function (
        this: Dynamic,
        ..._unusedArgs: Dynamic[]
      ): Dynamic {
        return "content-type: " + localFile.mime + "\r\n";
      };
      setLocalResponseProperty(request, "readyState", 4);
      __dcHit.done = true;
      dispatchRequestEvent(request, "readystatechange");
      dispatchRequestEvent(request, "load");
      dispatchRequestEvent(request, "loadend");
    };
    if (__dcHit.async) setTimeout(finishLocalRequest, 0);
    else finishLocalRequest();
  };
})();
