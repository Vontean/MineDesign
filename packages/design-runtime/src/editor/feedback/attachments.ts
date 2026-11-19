/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { emitEditorEvent } from "../events/runtime";

var feedbackControlCharacterPattern: Dynamic;
var FeedbackAttachmentsCache: Dynamic;
function escapeFeedbackHtml(text?: Dynamic): Dynamic {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function normalizeFeedbackText(text?: Dynamic): Dynamic {
  return String(text ?? "").replace(feedbackControlCharacterPattern, "?");
}
function rememberFeedbackLabel(
  label?: Dynamic,
  cacheKey?: Dynamic,
  labelOptions?: Dynamic,
): Dynamic {
  if (labelOptions.delegated) return;
  let normalizedLabel: Dynamic = normalizeFeedbackText(label.trim());
  normalizedLabel && FeedbackAttachmentsCache.set(cacheKey ?? normalizedLabel, normalizedLabel);
}
function sendEditorAttachments(
  label?: Dynamic,
  attachments?: Dynamic,
  attachmentKind?: Dynamic,
  sendOptions?: Dynamic,
): Dynamic {
  emitEditorEvent("autosend-attachments", {
    label: label,
    attachments: attachments,
    kind: attachmentKind,
    via: sendOptions.via,
    queueOnly: sendOptions.queueOnly,
  });
}
export {
  escapeFeedbackHtml,
  FeedbackAttachmentsCache,
  feedbackControlCharacterPattern,
  normalizeFeedbackText,
  rememberFeedbackLabel,
  sendEditorAttachments,
};
export function installEditorFeedbackAttachments(): () => void {
  return () => {
    feedbackControlCharacterPattern = new RegExp(
      `[<>\r
\x85\u2028\u2029]`,
      "g",
    );
    FeedbackAttachmentsCache = new Map();
  };
}
