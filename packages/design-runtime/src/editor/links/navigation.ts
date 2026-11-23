/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { isApplePlatform } from "../keyboard/shortcuts";

var linkUrlPattern: Dynamic;
var storedLinkUrlPattern: Dynamic;
var modifierKeyLabel: Dynamic;
var openLinkHint: Dynamic;
var createOpenLinkKeyHandler: Dynamic;
var openLinkWithModifierKeyHandler: Dynamic;
var openLinkKeyHandler: Dynamic;
function validateNavigableUrl(url?: Dynamic, validationOptions?: Dynamic): Dynamic {
  if (
    !(
      validationOptions?.storedUrl === true
        ? storedLinkUrlPattern
        : linkUrlPattern
    ).test(url)
  )
    return null;
  let parsedUrl: Dynamic;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }
  let currentHostname: Dynamic =
      typeof location === "undefined" ? "" : location.hostname,
    currentParentDomain: Dynamic = currentHostname.replace(/^[^.]+\./, ""),
    hostname: Dynamic = parsedUrl.hostname;
  return hostname === "" ||
    hostname.endsWith(".") ||
    hostname === currentHostname ||
    parsedUrl.username !== "" ||
    parsedUrl.password !== "" ||
    hostname === "claudeusercontent.com" ||
    hostname.endsWith(".claudeusercontent.com") ||
    (currentParentDomain.includes(".") &&
      (hostname === currentParentDomain || hostname.endsWith("." + currentParentDomain)))
    ? null
    : url;
}
function getElementLinkHref(element?: Dynamic): Dynamic {
  let href: Dynamic =
    element.getAttribute("href") || element.getAttribute("data-href") || "";
  return linkUrlPattern.test(href) ? href : "";
}
function openValidatedLink(url?: Dynamic, validationOptions?: Dynamic): Dynamic {
  if (validateNavigableUrl(url, validationOptions) === null) return;
  let anchor: Dynamic = (document as Dynamic).createElement("a");
  anchor.href = url;
  anchor.target = "_blank";
  anchor.rel = "noopener noreferrer";
  (document as Dynamic).body.append(anchor);
  anchor.click();
  anchor.remove();
}
export {
  getElementLinkHref,
  linkUrlPattern as LinksNavigationHttpsPattern,
  storedLinkUrlPattern,
  createOpenLinkKeyHandler as LinksNavigationKey,
  openLinkWithModifierKeyHandler as LinksNavigationKeyValue,
  openLinkKeyHandler,
  modifierKeyLabel as LinksNavigationResolvedValue,
  openLinkHint,
  openValidatedLink,
  validateNavigableUrl,
};
export function installEditorLinksNavigation(): () => void {
  return () => {
    linkUrlPattern = /^https?:\/\/[^\s)\[]*$/;
    storedLinkUrlPattern = /^https?:\/\/\S*$/;
    modifierKeyLabel = isApplePlatform()
      ? "\u2318"
      : "Ctrl";
    openLinkHint =
      " (" +
      modifierKeyLabel +
      "-click or " +
      modifierKeyLabel +
      "+Enter to open)";
    createOpenLinkKeyHandler =
      (requiresModifier?: Dynamic): Dynamic =>
      (event?: Dynamic): Dynamic => {
        event.key !== "Enter" ||
          event.nativeEvent?.isComposing ||
          (requiresModifier && !(event.metaKey || event.ctrlKey)) ||
          (event.preventDefault(),
          openValidatedLink(getElementLinkHref(event.currentTarget)));
      };
    openLinkWithModifierKeyHandler = createOpenLinkKeyHandler(true);
    openLinkKeyHandler = createOpenLinkKeyHandler(false);
  };
}
