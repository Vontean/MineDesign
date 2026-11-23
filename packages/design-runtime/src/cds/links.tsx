/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { load_react } from "../dependencies";
import { initializeOnce, toModuleNamespace } from "../module-helpers";

var CdsLinksPattern: Dynamic;
var initializeCdsLinks: Dynamic;
var CdsLinksSubscribers: Dynamic;
var CdsLinksOpenerReferrerPattern: Dynamic;
var initializeLinkTargetPatterns: Dynamic;
var reactCdsLinks: Dynamic;
var LinkRouterContext: Dynamic;
var controlCharPattern: Dynamic;
var leadingWhitespacePattern: Dynamic;
var protocolRelativePattern: Dynamic;
var singleLeadingSlashPattern: Dynamic;
var relativePathPattern: Dynamic;
var dotSegmentPattern: Dynamic;
var dotSegmentOnlyPattern: Dynamic;
var backslashOrEncodedDotPattern: Dynamic;
var CdsLinksHttpsMailtoPattern: Dynamic;
var CdsLinksIntentPattern: Dynamic;
var CdsLinksVscodeCursorPattern: Dynamic;
var vscodeSettingsUrlPattern: Dynamic;
var intentExtraKeys: Dynamic;
var absoluteUrlPattern: Dynamic;
var CdsLinksItems: Dynamic;
var trustedAndroidPackages: Dynamic;
var trustedClaudeOrigin: Dynamic;
var trustedClaudeAlternateOrigin: Dynamic;
var routerOptionKeys: Dynamic;
var CdsLinksOnPointerEnterOnPointerLeaveOnPointerDownConfig: Dynamic;
var CdsLinksKeysValue: Dynamic;
var initializeLinkRouter: Dynamic;
function trimHrefControls(href?: Dynamic): Dynamic {
  let cleaned: Dynamic = href.replace(CdsLinksPattern, ""),
    start: Dynamic = 0,
    end: Dynamic = cleaned.length;
  for (; start < end && cleaned.charCodeAt(start) <= 32; ) start++;
  for (; end > start && cleaned.charCodeAt(end - 1) <= 32; ) end--;
  return start === 0 && end === cleaned.length
    ? cleaned
    : cleaned.slice(start, end);
}
function isBlockedHref(originalHref?: Dynamic, safeHref?: Dynamic): Dynamic {
  return (
    safeHref === "#" &&
    originalHref !== undefined &&
    trimHrefControls(originalHref) !== "#"
  );
}
function isNewBrowsingContext(target?: Dynamic): Dynamic {
  return !!target && !CdsLinksSubscribers.has(target.toLowerCase());
}
function normalizeLinkRel(
  target?: Dynamic,
  rel?: Dynamic,
  defaultRel?: Dynamic,
): Dynamic {
  if (!isNewBrowsingContext(target)) return rel ?? undefined;
  if (rel == null) return defaultRel();
  let relTokens: Dynamic = rel
    .split(/\s+/)
    .filter(
      (token?: Dynamic): Dynamic =>
        token !== "" && token.toLowerCase() !== "opener",
    );
  relTokens.some(
    (token?: Dynamic): Dynamic => CdsLinksOpenerReferrerPattern.test(token),
  ) || relTokens.push("noopener");
  return relTokens.join(" ");
}
function useLinkRouter(): Dynamic {
  return (0, reactCdsLinks.useContext)(LinkRouterContext);
}
function sanitizeHref(href?: Dynamic): Dynamic {
  if (!href) return href;
  let normalizedHref: Dynamic = trimHrefControls(href);
  return controlCharPattern.test(normalizedHref)
    ? blockUnsafeHref(normalizedHref, "it contains a control character")
    : leadingWhitespacePattern.test(normalizedHref)
      ? blockUnsafeHref(
          normalizedHref,
          "it starts with whitespace the browser keeps",
        )
      : absoluteUrlPattern.test(normalizedHref)
        ? normalizedHref.startsWith("//")
          ? normalizedHref
          : CdsLinksIntentPattern.test(normalizedHref)
            ? isValidAndroidIntentUrl(normalizedHref)
              ? normalizedHref
              : blockUnsafeHref(
                  normalizedHref,
                  "only an Anthropic Android app's own sign-in intent: shape is followed",
                )
            : CdsLinksVscodeCursorPattern.test(normalizedHref)
              ? isSafeDataUrl(normalizedHref)
                ? normalizedHref
                : blockUnsafeHref(
                    normalizedHref,
                    "only an Anthropic extension's marketplace page or a VS Code settings link is followed",
                  )
              : CdsLinksHttpsMailtoPattern.test(normalizedHref)
                ? normalizedHref
                : blockUnsafeHref(
                    normalizedHref,
                    "its scheme is not one CDS links navigate",
                  )
        : normalizeHttpHref(normalizedHref);
}
function blockUnsafeHref(href?: Dynamic, reason?: Dynamic): Dynamic {
  return "#";
}
function normalizeHttpHref(href?: Dynamic): Dynamic {
  let isProtocolRelative: Dynamic = protocolRelativePattern.test(href);
  try {
    let parsedUrl: Dynamic = new URL(href, trustedClaudeOrigin),
      normalizedPath: Dynamic =
        parsedUrl.pathname.replace(/^\/{2,}/, "/") + parsedUrl.search + parsedUrl.hash;
    if (
      isProtocolRelative ||
      parsedUrl.origin !== trustedClaudeOrigin ||
      parsedUrl.pathname.startsWith("//")
    ) {
      isProtocolRelative || parsedUrl.origin;
      return normalizedPath;
    }
    if (hasUnsafeNetworkPath(href)) return normalizedPath;
    let hrefWithoutQuery: Dynamic = stripHrefQueryAndHash(href);
    if (
      relativePathPattern.test(href) &&
      backslashOrEncodedDotPattern.test(hrefWithoutQuery) &&
      !parsedUrl.pathname.startsWith("//")
    ) {
      let cleanedPath: Dynamic = hrefWithoutQuery
        .replaceAll("\\", "/")
        .split("/")
        .map(
          (segment?: Dynamic): Dynamic =>
            dotSegmentOnlyPattern.test(segment)
              ? segment.replace(/%2e/gi, ".")
              : segment,
        )
        .join("/");
      if (cleanedPath !== hrefWithoutQuery) {
        let result: Dynamic = cleanedPath + href.slice(hrefWithoutQuery.length);
        return result;
      }
    }
  } catch {
    if (isProtocolRelative)
      return blockUnsafeHref(
        href,
        "it names a host this URL parser cannot parse",
      );
  }
  return href;
}
function hasUnsafeNetworkPath(href?: Dynamic): Dynamic {
  if (!singleLeadingSlashPattern.test(href)) return false;
  let pathOnly: Dynamic = stripHrefQueryAndHash(href);
  return pathOnly.includes("\\") || dotSegmentPattern.test(pathOnly);
}
function stripHrefQueryAndHash(href?: Dynamic): Dynamic {
  let queryIndex: Dynamic = href.search(/[?#]/);
  return queryIndex < 0 ? href : href.slice(0, queryIndex);
}
function isSafeDataUrl(href?: Dynamic): Dynamic {
  return vscodeSettingsUrlPattern.test(
    href.replace(
      CdsLinksVscodeCursorPattern,
      (scheme?: Dynamic): Dynamic => scheme.toLowerCase(),
    ),
  );
}
function isValidAndroidIntentUrl(href?: Dynamic): Dynamic {
  if (!CdsLinksIntentPattern.test(href)) return false;
  let hashIndex: Dynamic = href.indexOf("#");
  if (hashIndex < 0 || href.indexOf("#", hashIndex + 1) >= 0) return false;
  let intentBody: Dynamic = href.slice(hashIndex + 1);
  if (!intentBody.startsWith("Intent;") || !intentBody.endsWith(";end")) return false;
  let params: Dynamic = intentBody.slice(7, -4),
    paramsByKey: Dynamic = new Map();
  for (let param of params.split(";") as Dynamic) {
    let separatorIndex: Dynamic = param.indexOf("=");
    if (separatorIndex <= 0) return false;
    let key: Dynamic = param.slice(0, separatorIndex);
    if (paramsByKey.has(key) || !intentExtraKeys.has(key))
      return false;
    paramsByKey.set(key, param.slice(separatorIndex + 1));
  }
  let packageName: Dynamic = paramsByKey.get("package");
  if (
    packageName === undefined ||
    !trustedAndroidPackages.has(packageName) ||
    paramsByKey.get("scheme") !== "https"
  )
    return false;
  let fallbackUrl: Dynamic = paramsByKey.get("S.browser_fallback_url");
  if (fallbackUrl === undefined) return true;
  try {
    return new URL(decodeURIComponent(fallbackUrl)).protocol === "https:";
  } catch {
    return false;
  }
}
function classifyLinkDestination(
  href?: Dynamic,
  baseOrigin?: Dynamic,
): Dynamic {
  let url: Dynamic;
  try {
    url = new URL(href, baseOrigin);
  } catch {
    return "other";
  }
  if (url.origin === baseOrigin) return "relative";
  if (url.protocol !== "https:" && url.protocol !== "http:")
    return "other";
  let hostname: Dynamic = url.hostname;
  return CdsLinksItems.some(
    (domain?: Dynamic): Dynamic =>
      hostname === domain || hostname.endsWith("." + domain),
  )
    ? "first-party"
    : "other";
}
function isTrustedLink(href?: Dynamic): Dynamic {
  if (!href) return false;
  let destination: Dynamic = classifyLinkDestination(href, trustedClaudeOrigin);
  return (
    destination !== "other" &&
    destination === classifyLinkDestination(href, trustedClaudeAlternateOrigin)
  );
}
function getExternalLinkRel(href?: Dynamic): Dynamic {
  return isTrustedLink(href) ? "noopener" : "noopener noreferrer";
}
function getLinkRel(href?: Dynamic, target?: Dynamic): Dynamic {
  let safeHref: Dynamic = sanitizeHref(href);
  return isNewBrowsingContext(target)
    ? getExternalLinkRel(safeHref)
    : isTrustedLink(safeHref)
      ? undefined
      : "noreferrer";
}
function isSameOriginHref(href?: Dynamic): Dynamic {
  if (typeof window === "undefined") return false;
  try {
    let url: Dynamic = new URL(href, (window as Dynamic).location.href);
    return (
      url.origin !== "null" &&
      url.protocol === (window as Dynamic).location.protocol &&
      url.origin === (window as Dynamic).location.origin
    );
  } catch {
    return false;
  }
}
function shouldHandleLinkWithRouter(event?: Dynamic): Dynamic {
  return !event.router ||
    !event.href ||
    event.href.startsWith("#") ||
    (event.target && event.target.toLowerCase() !== "_self") ||
    (event.download !== null &&
      event.download !== undefined &&
      event.download !== false)
    ? false
    : isSameOriginHref(event.href);
}
function toRouterPath(href?: Dynamic): Dynamic {
  if (!absoluteUrlPattern.test(href)) return href;
  let url: Dynamic = new URL(href, (window as Dynamic).location.href);
  return url.pathname.replace(/^\/{2,}/, "/") + url.search + url.hash;
}
function isModifiedClick(event?: Dynamic): Dynamic {
  return (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  );
}
function pickRouterOptions(props?: Dynamic): Dynamic {
  let source: Dynamic = props,
    picked: Dynamic = {};
  for (let key of routerOptionKeys as Dynamic)
    source[key] !== undefined && (picked[key] = source[key]);
  return picked;
}
function omitRouterOptions(props?: Dynamic): Dynamic {
  let rest: Dynamic = {
    ...props,
  };
  for (let key of routerOptionKeys as Dynamic) delete rest[key];
  return rest;
}
function composeEventHandlers(
  ownHandler?: Dynamic,
  routerHandler?: Dynamic,
  skipWhenPrevented?: Dynamic,
): Dynamic {
  return routerHandler
    ? (event?: Dynamic): Dynamic => {
        ownHandler?.(event);
        (!skipWhenPrevented || !event.defaultPrevented) && routerHandler(event);
      }
    : ownHandler;
}
function useLinkProps({
  href: href,
  routerOptions: routerOptions,
  target: target,
  rel: rel,
  download: download,
  onClick: onClick,
  onPointerEnter: onPointerEnter,
  onPointerLeave: onPointerLeave,
  onPointerDown: onPointerDown,
  onFocus: onFocus,
  onBlur: onBlur,
}: Dynamic): Dynamic {
  "use no memo";

  let router: Dynamic = useLinkRouter(),
    safeHref: Dynamic = sanitizeHref(href),
    isBlocked: Dynamic = isBlockedHref(href, safeHref),
    safeTarget: Dynamic = isBlocked ? undefined : target,
    safeDownload: Dynamic = isBlocked ? undefined : download,
    resolvedHref: Dynamic =
      router?.resolveHref &&
      safeHref &&
      !safeHref.startsWith("#") &&
      !absoluteUrlPattern.test(safeHref)
        ? router.resolveHref(safeHref)
        : safeHref,
    hasRouter: Dynamic = router !== undefined,
    routerPath: Dynamic = (0, reactCdsLinks.useMemo)((): Dynamic => {
      let navigationState: Dynamic = {
        href: safeHref,
        target: safeTarget,
        download: safeDownload,
        router: hasRouter,
      };
      return shouldHandleLinkWithRouter(navigationState)
        ? toRouterPath(navigationState.href)
        : undefined;
    }, [safeHref, safeTarget, safeDownload, hasRouter]),
    handleClick: Dynamic = (0, reactCdsLinks.useCallback)(
      (event?: Dynamic): Dynamic => {
        onClick?.(event);
        !(isModifiedClick(event) || routerPath === undefined || !router) &&
          (event.preventDefault(), router.navigate(routerPath, routerOptions));
      },
      [onClick, routerPath, router, routerOptions],
    ),
    intentHandlersFor: Dynamic = router?.intentHandlers,
    intentHandlers: Dynamic = (0, reactCdsLinks.useMemo)(
      (): Dynamic =>
        intentHandlersFor && routerPath !== undefined ? intentHandlersFor(routerPath) : undefined,
      [intentHandlersFor, routerPath],
    ),
    pointerHandlers: Dynamic = (0, reactCdsLinks.useMemo)((): Dynamic => {
      let ownHandlers: Dynamic = {
          onPointerEnter: onPointerEnter,
          onPointerLeave: onPointerLeave,
          onPointerDown: onPointerDown,
          onFocus: onFocus,
          onBlur: onBlur,
        },
        composedHandlers: Dynamic = {};
      for (let eventName of CdsLinksKeysValue as Dynamic) {
        let handler: Dynamic = composeEventHandlers(
          ownHandlers[eventName],
          intentHandlers?.[eventName],
          CdsLinksOnPointerEnterOnPointerLeaveOnPointerDownConfig[eventName],
        );
        handler && (composedHandlers[eventName] = handler);
      }
      return composedHandlers;
    }, [
      intentHandlers,
      onPointerEnter,
      onPointerLeave,
      onPointerDown,
      onFocus,
      onBlur,
    ]);
  return {
    href: resolvedHref,
    target: safeTarget,
    rel: normalizeLinkRel(
      safeTarget,
      rel,
      (): Dynamic => getExternalLinkRel(resolvedHref),
    ),
    download: safeDownload,
    onClick: handleClick,
    ...pointerHandlers,
  };
}
export {
  blockUnsafeHref,
  CdsLinksHttpsMailtoPattern,
  CdsLinksIntentPattern,
  CdsLinksItems,
  CdsLinksKeysValue,
  CdsLinksOnPointerEnterOnPointerLeaveOnPointerDownConfig,
  CdsLinksOpenerReferrerPattern,
  CdsLinksPattern,
  CdsLinksSubscribers,
  CdsLinksVscodeCursorPattern,
  classifyLinkDestination,
  composeEventHandlers,
  getExternalLinkRel,
  getLinkRel,
  hasUnsafeNetworkPath,
  initializeCdsLinks,
  initializeLinkTargetPatterns,
  initializeLinkRouter,
  isBlockedHref,
  isModifiedClick,
  isNewBrowsingContext,
  isSafeDataUrl,
  isSameOriginHref,
  isTrustedLink,
  isValidAndroidIntentUrl,
  LinkRouterContext,
  normalizeHttpHref,
  normalizeLinkRel,
  omitRouterOptions,
  pickRouterOptions,
  reactCdsLinks,
  routerOptionKeys,
  sanitizeHref,
  shouldHandleLinkWithRouter,
  stripHrefQueryAndHash,
  toRouterPath,
  trimHrefControls,
  trustedClaudeAlternateOrigin,
  trustedClaudeOrigin,
  useLinkProps,
  useLinkRouter,
};
export function installCdsLinks(): () => void {
  return () => {
    initializeCdsLinks = initializeOnce((): Dynamic => {
      CdsLinksPattern = /[\t\n\r]/g;
    });
    initializeLinkTargetPatterns = initializeOnce((): Dynamic => {
      CdsLinksSubscribers = new Set(["_self", "_parent", "_top"]);
      CdsLinksOpenerReferrerPattern = /^no(?:opener|referrer)$/i;
    });
    initializeLinkRouter = initializeOnce((): Dynamic => {
      "use client";

      initializeCdsLinks();
      initializeLinkTargetPatterns();
      reactCdsLinks = toModuleNamespace(load_react());
      LinkRouterContext = (0, reactCdsLinks.createContext)(undefined);
      controlCharPattern = /[\x00-\x1f\x7f-\x9f]/;
      leadingWhitespacePattern = /^\s/;
      protocolRelativePattern = /^[/\\]{2}/;
      singleLeadingSlashPattern = /^[/\\](?![/\\])/;
      relativePathPattern = /^[^/\\]/;
      dotSegmentPattern = /\/(?:\.|%2e){1,2}(?:\/|$)/i;
      dotSegmentOnlyPattern = /^(?:\.|%2e){1,2}$/i;
      backslashOrEncodedDotPattern = /\\|%2e/i;
      // MineDesign: the Claude app schemes (claude, claude-cli, claude-nest) are not link targets here.
      CdsLinksHttpsMailtoPattern = /^(?:https?|mailto|tel|slack|blob):/i;
      CdsLinksIntentPattern = /^intent:/i;
      CdsLinksVscodeCursorPattern = /^(?:vscode|cursor):/i;
      // MineDesign: no first-party editor extensions; only VS Code settings links are followed.
      vscodeSettingsUrlPattern =
        /^vscode:\/\/settings\/[A-Za-z0-9][A-Za-z0-9_.-]*$/;
      intentExtraKeys = new Set([
        "scheme",
        "package",
        "S.browser_fallback_url",
      ]);
      absoluteUrlPattern = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
      // MineDesign: no first-party web domains or Android apps; every external link is treated as "other".
      CdsLinksItems = [];
      trustedAndroidPackages = new Set();
      trustedClaudeOrigin = "https://cds-relative-href.invalid";
      trustedClaudeAlternateOrigin = "http://cds-relative-href.invalid";
      routerOptionKeys = [
        "onClick",
        "onPointerEnter",
        "onPointerLeave",
        "onPointerDown",
        "onFocus",
        "onBlur",
      ];
      CdsLinksOnPointerEnterOnPointerLeaveOnPointerDownConfig = {
        onPointerEnter: true,
        onPointerLeave: false,
        onPointerDown: true,
        onFocus: true,
        onBlur: false,
      };
      CdsLinksKeysValue = Object.keys(
        CdsLinksOnPointerEnterOnPointerLeaveOnPointerDownConfig,
      );
    });
  };
}
