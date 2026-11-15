/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { currentHttpOrigin, getEmbedContext } from "./file-content";
import { externalLinkLimiter } from "./rate-limiter";

function openPreviewExternalLink(
  items?: Dynamic,
  options: Dynamic = externalLinkLimiter,
): Dynamic {
  if (
    typeof items != "string" ||
    items.length > 8192 ||
    navigator.userActivation?.isActive !== true
  )
    return;
  let value: Dynamic;
  try {
    value = new URL(items);
  } catch {
    return;
  }
  if (
    (value.protocol !== "http:" && value.protocol !== "https:") ||
    value.origin === (0, currentHttpOrigin)() ||
    !options.take()
  )
    return;
  let value2: Dynamic =
      (0, getEmbedContext)() !== null &&
      (window as Dynamic).parent !== window
        ? (window as Dynamic).parent.document
        : document,
    value3: Dynamic = value2.createElement("a");
  value3.href = value.href;
  value3.target = "_blank";
  value3.rel = "noopener noreferrer";
  value2.body.append(value3);
  value3.click();
  value3.remove();
}
export {
  openPreviewExternalLink,
};
export function installPlatformLinkNavigation(): () => void {
  return () => {};
}
