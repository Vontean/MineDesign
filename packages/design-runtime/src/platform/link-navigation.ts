/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { currentHttpOrigin, getEmbedContext } from "./file-content";
import { externalLinkLimiter } from "./rate-limiter";

function openPreviewExternalLink(
  targetUrl?: Dynamic,
  rateLimiter: Dynamic = externalLinkLimiter,
): Dynamic {
  if (
    typeof targetUrl != "string" ||
    targetUrl.length > 8192 ||
    navigator.userActivation?.isActive !== true
  )
    return;
  let url: Dynamic;
  try {
    url = new URL(targetUrl);
  } catch {
    return;
  }
  if (
    (url.protocol !== "http:" && url.protocol !== "https:") ||
    url.origin === currentHttpOrigin() ||
    !rateLimiter.take()
  )
    return;
  let ownerDocument: Dynamic =
      getEmbedContext() !== null &&
      (window as Dynamic).parent !== window
        ? (window as Dynamic).parent.document
        : document,
    link: Dynamic = ownerDocument.createElement("a");
  link.href = url.href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  ownerDocument.body.append(link);
  link.click();
  link.remove();
}
export {
  openPreviewExternalLink,
};
export function installPlatformLinkNavigation(): () => void {
  return () => {};
}
