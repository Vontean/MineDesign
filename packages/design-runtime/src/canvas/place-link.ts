/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { getDocumentStashKey } from "../platform/document-stash";
import { isTrustedHostOrigin, postToFrameHost } from "../platform/frame-host-bridge";

var defaultPlaceLinkReportingEnabled: Dynamic;
var placeLinkReportDebounceMs: Dynamic;
var placeLinkReportRetryDelays: Dynamic;
var placeFragmentPattern: Dynamic;
var reservedPlaceFragments: Dynamic;
var getPlaceLinkStorage: Dynamic;
var placeLinkStorageFields: Dynamic;
var schedulePlaceLinkReport: Dynamic;
var cancelPlaceLinkReport: Dynamic;
var placeLinkReportingEnabled: Dynamic;
function isValidPlaceFragment(fragment?: Dynamic): Dynamic {
  return (
    typeof fragment == "string" &&
    placeFragmentPattern.test(fragment) &&
    !fragment.startsWith("comment-") &&
    !reservedPlaceFragments.has(fragment)
  );
}
function placeLinkStorageKey(scope: Dynamic = ""): Dynamic {
  let pathname: Dynamic =
    typeof location === "undefined" ? "/" : location.pathname;
  return (
    "place-link/" +
    getDocumentStashKey(pathname).slice(
      getDocumentStashKey("").length,
    ) +
    (scope ? "/" + scope : "")
  );
}
function readPlaceLinkHistory(scope?: Dynamic, storage?: Dynamic): Dynamic {
  try {
    return (storage?.getItem(placeLinkStorageKey(scope)) ?? "").split("|");
  } catch {
    return [];
  }
}
function rememberPlaceLink(
  field?: Dynamic,
  fragment?: Dynamic,
  scope?: Dynamic,
  storage: Dynamic = getPlaceLinkStorage(),
): Dynamic {
  let storedFields: Dynamic = readPlaceLinkHistory(scope, storage),
    isNewLink: Dynamic = field === "link" && storedFields[0] !== fragment;
  try {
    storage?.setItem(
      placeLinkStorageKey(scope),
      placeLinkStorageFields
        .map(
          (fieldName?: Dynamic, fieldIndex?: Dynamic): Dynamic =>
            fieldName === field
              ? fragment
              : isNewLink && fieldName === "goto"
                ? ""
                : (storedFields[fieldIndex] ?? ""),
        )
        .join("|"),
    );
  } catch {}
}
function classifyPlaceLink(
  scope?: Dynamic,
  hash: Dynamic = typeof location === "undefined" ? "" : location.hash,
  storage: Dynamic = getPlaceLinkStorage(),
): Dynamic {
  let fragment: Dynamic = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!isValidPlaceFragment(fragment)) return null;
  let [linkFragment, gotoFragment, sentFragment, atFragment]: Dynamic = readPlaceLinkHistory(
    scope,
    storage,
  );
  return {
    place: fragment,
    why:
      fragment === atFragment
        ? "here"
        : [linkFragment, gotoFragment, sentFragment].includes(fragment)
          ? "known"
          : "new",
  };
}
function createPlaceLinkReporter(reporterOptions: Dynamic = {}): Dynamic {
  let postMessage: Dynamic = reporterOptions.post ?? postToFrameHost,
    isEnabled: Dynamic = reporterOptions.enabled ?? placeLinkReportingEnabled,
    getStorage: Dynamic = (): Dynamic =>
      reporterOptions.store === undefined ? getPlaceLinkStorage() : reporterOptions.store,
    lastSentFragment: Dynamic = null,
    debounceTimer: Dynamic = null,
    retryTimers: Dynamic = [],
    cancelDebounce: Dynamic = (): Dynamic => {
      debounceTimer !== null && cancelPlaceLinkReport(debounceTimer);
      debounceTimer = null;
    },
    sendFragment: Dynamic = (fragment?: Dynamic): Dynamic => {
      let isFirstSend: Dynamic = lastSentFragment === null;
      lastSentFragment = fragment;
      rememberPlaceLink("sent", fragment, reporterOptions.scope, getStorage());
      postMessage({
        type: "current_anchor",
        fragment: fragment,
      });
      isFirstSend &&
        (retryTimers = placeLinkReportRetryDelays.map(
          (retryDelay?: Dynamic): Dynamic =>
            schedulePlaceLinkReport(
              (): Dynamic =>
                lastSentFragment !== null &&
                postMessage({
                  type: "current_anchor",
                  fragment: lastSentFragment,
                }),
              retryDelay,
            ),
        ));
    };
  return {
    report(fragment: Dynamic): Dynamic {
      !isEnabled ||
        !isValidPlaceFragment(fragment) ||
        (rememberPlaceLink("at", fragment, reporterOptions.scope, getStorage()),
        cancelDebounce(),
        (debounceTimer = schedulePlaceLinkReport((): Dynamic => {
          debounceTimer = null;
          fragment !== lastSentFragment && sendFragment(fragment);
        }, placeLinkReportDebounceMs)));
    },
    answer(fragment: Dynamic): Dynamic {
      !isEnabled ||
        !isValidPlaceFragment(fragment) ||
        (rememberPlaceLink("at", fragment, reporterOptions.scope, getStorage()),
        cancelDebounce(),
        sendFragment(fragment));
    },
    stop(): Dynamic {
      cancelDebounce();
      retryTimers.forEach(cancelPlaceLinkReport);
    },
  };
}
function parseGotoAnchorMessage(
  event?: Dynamic,
  parentWindow?: Dynamic,
  allowedOrigin?: Dynamic,
): Dynamic {
  if (
    parentWindow === null ||
    event.source !== parentWindow ||
    !allowedOrigin(event.origin)
  )
    return null;
  let data: Dynamic = event.data;
  return data !== null &&
    typeof data == "object" &&
    data.type === "goto_anchor" &&
    isValidPlaceFragment(data.fragment)
    ? data.fragment
    : null;
}
function observeGotoAnchorMessages(
  onGoto?: Dynamic,
  targetWindow: Dynamic = window,
): Dynamic {
  if (targetWindow.parent === targetWindow) return (): Dynamic => {};
  let handleMessage: Dynamic = (messageEvent?: Dynamic): Dynamic => {
    if (
      messageEvent.source !== targetWindow.parent ||
      !isTrustedHostOrigin(messageEvent.origin)
    )
      return;
    let gotoFragment: Dynamic = parseGotoAnchorMessage(
      messageEvent,
      targetWindow.parent,
      isTrustedHostOrigin,
    );
    gotoFragment !== null && onGoto(gotoFragment);
  };
  targetWindow.addEventListener("message", handleMessage);
  return (): Dynamic => targetWindow.removeEventListener("message", handleMessage);
}
export {
  cancelPlaceLinkReport,
  classifyPlaceLink,
  createPlaceLinkReporter,
  defaultPlaceLinkReportingEnabled,
  getPlaceLinkStorage,
  isValidPlaceFragment,
  observeGotoAnchorMessages,
  parseGotoAnchorMessage,
  placeFragmentPattern,
  placeLinkReportDebounceMs,
  placeLinkReportingEnabled,
  placeLinkReportRetryDelays,
  placeLinkStorageFields,
  placeLinkStorageKey,
  readPlaceLinkHistory,
  rememberPlaceLink,
  reservedPlaceFragments,
  schedulePlaceLinkReport,
};
export function installCanvasPlaceLink(): () => void {
  return () => {
    defaultPlaceLinkReportingEnabled = true;
    placeLinkReportDebounceMs = 250;
    placeLinkReportRetryDelays = [1500, 6e3];
    placeFragmentPattern = /^[A-Za-z0-9._~-]{1,128}$/;
    reservedPlaceFragments = new Set([
      "sidebar",
      "settings",
      "customize",
      "upgrade",
      "downloads",
    ]);
    getPlaceLinkStorage = (): Dynamic => {
      try {
        return sessionStorage;
      } catch {
        return null;
      }
    };
    placeLinkStorageFields = ["link", "goto", "sent", "at"];
    schedulePlaceLinkReport = (task?: Dynamic, delayMs?: Dynamic): Dynamic =>
      setTimeout(task, delayMs);
    cancelPlaceLinkReport = (timerId?: Dynamic): Dynamic => clearTimeout(timerId);
    placeLinkReportingEnabled = defaultPlaceLinkReportingEnabled;
  };
}
