/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { emitEditorEvent } from "../events/runtime";

var feedbackControlCharacterPattern: Dynamic;
var FeedbackAttachmentsCache: Dynamic;
function escapeFeedbackHtml(input?: Dynamic): Dynamic {
  return String(input ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function normalizeFeedbackText(input?: Dynamic): Dynamic {
  return String(input ?? "").replace(feedbackControlCharacterPattern, "?");
}
function rememberFeedbackLabel(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
): Dynamic {
  if (context.delegated) return;
  let value: Dynamic = normalizeFeedbackText(input.trim());
  value && FeedbackAttachmentsCache.set(options ?? value, value);
}
function sendEditorAttachments(
  input?: Dynamic,
  options?: Dynamic,
  context?: Dynamic,
  value?: Dynamic,
): Dynamic {
  emitEditorEvent("autosend-attachments", {
    label: input,
    attachments: options,
    kind: context,
    via: value.via,
    queueOnly: value.queueOnly,
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
