/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { isApplePlatform } from "../keyboard/shortcuts";

var LinksNavigationHttpsPattern: Dynamic;
var LinksNavigationHttpsPattern_2: Dynamic;
var LinksNavigationResolvedValue: Dynamic;
var LinksNavigationResolvedValue_2: Dynamic;
var LinksNavigationKey: Dynamic;
var LinksNavigationKeyValue: Dynamic;
var LinksNavigationKeyValue_2: Dynamic;
function validateNavigableUrl(input?: Dynamic, options?: Dynamic): Dynamic {
  if (
    !(
      options?.storedUrl === true
        ? LinksNavigationHttpsPattern_2
        : LinksNavigationHttpsPattern
    ).test(input)
  )
    return null;
  let value: Dynamic;
  try {
    value = new URL(input);
  } catch {
    return null;
  }
  let value2: Dynamic =
      typeof location === "undefined" ? "" : location.hostname,
    value3: Dynamic = value2.replace(/^[^.]+\./, ""),
    hostname: Dynamic = value.hostname;
  return hostname === "" ||
    hostname.endsWith(".") ||
    hostname === value2 ||
    value.username !== "" ||
    value.password !== "" ||
    hostname === "claudeusercontent.com" ||
    hostname.endsWith(".claudeusercontent.com") ||
    (value3.includes(".") &&
      (hostname === value3 || hostname.endsWith("." + value3)))
    ? null
    : input;
}
function getElementLinkHref(element?: Dynamic): Dynamic {
  let value: Dynamic =
    element.getAttribute("href") || element.getAttribute("data-href") || "";
  return LinksNavigationHttpsPattern.test(value) ? value : "";
}
function openValidatedLink(input?: Dynamic, options?: Dynamic): Dynamic {
  if (validateNavigableUrl(input, options) === null) return;
  let value: Dynamic = (document as Dynamic).createElement("a");
  value.href = input;
  value.target = "_blank";
  value.rel = "noopener noreferrer";
  (document as Dynamic).body.append(value);
  value.click();
  value.remove();
}
export {
  getElementLinkHref,
  LinksNavigationHttpsPattern,
  LinksNavigationHttpsPattern_2,
  LinksNavigationKey,
  LinksNavigationKeyValue,
  LinksNavigationKeyValue_2,
  LinksNavigationResolvedValue,
  LinksNavigationResolvedValue_2,
  openValidatedLink,
  validateNavigableUrl,
};
export function installEditorLinksNavigation(): () => void {
  return () => {
    LinksNavigationHttpsPattern = /^https?:\/\/[^\s)\[]*$/;
    LinksNavigationHttpsPattern_2 = /^https?:\/\/\S*$/;
    LinksNavigationResolvedValue = isApplePlatform()
      ? "\u2318"
      : "Ctrl";
    LinksNavigationResolvedValue_2 =
      " (" +
      LinksNavigationResolvedValue +
      "-click or " +
      LinksNavigationResolvedValue +
      "+Enter to open)";
    LinksNavigationKey =
      (input?: Dynamic): Dynamic =>
      (event?: Dynamic): Dynamic => {
        event.key !== "Enter" ||
          event.nativeEvent?.isComposing ||
          (input && !(event.metaKey || event.ctrlKey)) ||
          (event.preventDefault(),
          openValidatedLink(getElementLinkHref(event.currentTarget)));
      };
    LinksNavigationKeyValue = LinksNavigationKey(true);
    LinksNavigationKeyValue_2 = LinksNavigationKey(false);
  };
}
