/** Restored injected script; compiled as an isolated IIFE before insertion into a preview. */
import type { Dynamic } from "../runtime-types";
(function (this: Dynamic, ..._extraArguments: Dynamic[]): Dynamic {
  var nativeFetch: Dynamic = (window as Dynamic).fetch.bind(window);
  var projectRoot: Dynamic =
    typeof (window as Dynamic).__dcProjectRoot === "string"
      ? (window as Dynamic).__dcProjectRoot
      : null;
  var imageMimeTypes: Dynamic = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    avif: "image/avif",
    bmp: "image/bmp",
    svg: "image/svg+xml",
  };
  var textMimeTypes: Dynamic = {
    html: "text/html",
    css: "text/css",
    js: "text/javascript",
    mjs: "text/javascript",
    json: "application/json",
  };
  /* The requested URL as a project key: relative to the root file's folder ('../x' too, and the
   * runtime's encoded '..%2FName.dc.html'), or absolute under <base> (/appifact/...) - resolveRef in preview.ts. */
  var toProjectFileKey: Dynamic = function (
    this: Dynamic,
    requestUrl?: Dynamic,
    ..._normalizeArgs: Dynamic[]
  ): Dynamic {
    if (requestUrl && typeof requestUrl === "object" && typeof requestUrl.url === "string")
      requestUrl = requestUrl.url;
    requestUrl = String(requestUrl).split("#")[0]!.split("?")[0];
    // dc-runtime boot() re-fetches location.href to re-adopt its own raw
    // bytes (camelCase attr repair). In a srcdoc document that URL is
    // about:srcdoc, which fetch() can't load - serve the root source from
    // the map instead, keeping the fidelity pass working.
    if (requestUrl === "about:srcdoc" || requestUrl === String(location.href)) {
      return (window as Dynamic).__dcRootPath || requestUrl;
    }
    var directory: Dynamic = String(
      (window as Dynamic).__dcRootPath || "",
    ).replace(/[^/]*$/, "");
    /* an absolute URL counts only on this document's own base origin, under /appifact/ or under the stamped project folder */
    if (/^[a-z][a-z0-9+.-]*:/i.test(requestUrl) || requestUrl.slice(0, 2) === "//") {
      try {
        var absoluteUrl: Dynamic = new URL(requestUrl, (document as Dynamic).baseURI),
          baseUrl: Dynamic = new URL((document as Dynamic).baseURI);
        if (
          absoluteUrl.origin !== baseUrl.origin ||
          (absoluteUrl.pathname.indexOf("/appifact/") !== 0 &&
            (projectRoot === null ||
              absoluteUrl.pathname.indexOf(projectRoot) !== 0))
        )
          return null;
        requestUrl = absoluteUrl.pathname;
      } catch (value_e: Dynamic) {
        return null;
      }
    }
    /* with the published base, a path under the project folder is read as the same path under /appifact/ */
    if (projectRoot !== null && requestUrl.indexOf(projectRoot) === 0)
      requestUrl = "/appifact/" + requestUrl.slice(projectRoot.length);
    if (requestUrl.indexOf("/appifact/") === 0) {
      requestUrl = requestUrl.slice(10);
      directory = "";
    } else if (requestUrl.charAt(0) === "/") directory = "";
    try {
      requestUrl = decodeURIComponent(requestUrl);
    } catch (value_e: Dynamic) {}
    var normalizedSegments: Dynamic = [];
    var segments: Dynamic = (directory + requestUrl).split("/");
    for (var index: Dynamic = 0; index < segments.length; index += 1) {
      if (segments[index] === "" || segments[index] === ".") continue;
      if (segments[index] === "..") normalizedSegments.pop();
      else normalizedSegments.push(segments[index]);
    }
    return normalizedSegments.join("/");
  };
  /* the stored file a URL names, read live from the map: {key, mime, text, bytes (images)} or null */
  var __dcLookup: Dynamic = function (
    this: Dynamic,
    requestUrl?: Dynamic,
    ..._lookupArgs: Dynamic[]
  ): Dynamic {
    var fileKey: Dynamic = toProjectFileKey(requestUrl);
    var files: Dynamic = (window as Dynamic).__dcFiles || {};
    if (
      fileKey === null ||
      !(Object as Dynamic).prototype.hasOwnProperty.call(files, fileKey)
    )
      return null;
    var extension: Dynamic = fileKey
      .slice(fileKey.lastIndexOf(".") + 1)
      .toLowerCase();
    var imageMimeType: Dynamic = imageMimeTypes[extension];
    var fileText: Dynamic = String(files[fileKey]);
    var fileBytes: Dynamic = null;
    if (imageMimeType) {
      try {
        var decodedImage: Dynamic = atob(fileText);
        fileBytes = new Uint8Array(decodedImage.length);
        for (var index: Dynamic = 0; index < decodedImage.length; index += 1)
          fileBytes[index] = decodedImage.charCodeAt(index);
      } catch (value_e: Dynamic) {
        imageMimeType = "";
        fileBytes = null;
      }
    }
    return {
      key: fileKey,
      mime: imageMimeType || textMimeTypes[extension] || "text/plain",
      text: fileText,
      bytes: fileBytes,
    };
  };
  (window as Dynamic).__dcLookup = __dcLookup;
  (window as Dynamic).fetch = function (
    this: Dynamic,
    request?: Dynamic,
    requestOptions?: Dynamic,
    ..._fetchArgs: Dynamic[]
  ): Dynamic {
    var localFile: Dynamic = __dcLookup(request);
    if (localFile)
      return Promise.resolve(
        new Response(localFile.bytes || localFile.text, {
          status: 200,
          headers: {
            "Content-Type": localFile.mime,
          },
        }),
      );
    if (projectRoot === null) return nativeFetch(request, requestOptions);
    /* a document with the published base reports to the editor a file under the project folder that was answered 403, 404 or 410 (ADDRESS_REFUSED) */
    return nativeFetch(request, requestOptions).then(function (
      this: Dynamic,
      response?: Dynamic,
      ..._responseArgs: Dynamic[]
    ): Dynamic {
      if (
        response &&
        (response.status === 403 ||
          response.status === 404 ||
          response.status === 410) &&
        String(response.url).indexOf((window as Dynamic).origin + projectRoot) ===
          0
      ) {
        try {
          (window as Dynamic).parent.postMessage(
            {
              __dc_address_refused: 1,
              u: response.url,
            },
            "*",
          );
        } catch (value_e: Dynamic) {}
      }
      return response;
    });
  };
})();
