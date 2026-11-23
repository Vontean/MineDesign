import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { maxDesignContextBytes, sanitizeDesignContextText } from "./context-publisher";

var emptyArtboardErrors: Dynamic;
var maxArtboardErrorMessages: Dynamic;
var maxArtboardErrorFields: Dynamic;
var serializeErrorMessages: Dynamic;
function sanitizeArtboardErrorContext(errorContext?: Dynamic): Dynamic {
  return Array.isArray(errorContext)
    ? errorContext.map(
        (contextItem?: Dynamic): Dynamic =>
          typeof contextItem == "object" &&
          contextItem !== null &&
          typeof contextItem.label == "string"
            ? {
                ...contextItem,
                label: sanitizeDesignContextText(contextItem.label),
              }
            : contextItem,
      )
    : typeof errorContext == "object" && errorContext !== null
      ? sanitizeDesignContextText(errorContext.text)
      : errorContext;
}
function serializeArtboardErrorContext(
  errors?: Dynamic,
  firstError?: Dynamic,
  baseContext?: Dynamic,
): Dynamic {
  if (errors.length === 0) return [];
  let state: Dynamic = {
      ...Object.fromEntries(
        Object.entries(baseContext).map(
          ([contextKey, contextValue]: Dynamic): Dynamic => [
            contextKey,
            sanitizeArtboardErrorContext(contextValue),
          ],
        ),
      ),
      erroredArtboards: [],
      firstError: sanitizeDesignContextText(firstError),
    },
    usedBytes: Dynamic =
      new TextEncoder().encode(JSON.stringify(state)).length +
      maxArtboardErrorFields,
    items: Dynamic = [];
  for (let message of errors.slice(0, maxArtboardErrorMessages) as Dynamic) {
    usedBytes += message.length + 3;
    if (usedBytes > maxDesignContextBytes) break;
    items.push(message);
  }
  return items;
}
function artboardLoadErrorMessage(
  loadError?: Dynamic,
  previewError?: Dynamic,
): Dynamic {
  return loadError != null
    ? uiMessage("canvas.artboardErrors.couldnTLoadThisArtboard", { error: String(loadError) })
    : previewError != null
      ? uiMessage("canvas.artboardErrors.previewStopped", { error: String(previewError) })
      : null;
}
function artboardLoadErrorMessages(
  loadError?: Dynamic,
  previewError?: Dynamic,
  messages?: Dynamic,
): Dynamic {
  let loadMessage: Dynamic = artboardLoadErrorMessage(loadError, previewError);
  if (loadMessage === null) return messages;
  let sanitizedMessage: Dynamic = sanitizeDesignContextText(loadMessage, 300);
  return sanitizedMessage === "" ? emptyArtboardErrors : [sanitizedMessage];
}
function normalizeArtboardErrorMessages(errors?: Dynamic): Dynamic {
  if (!Array.isArray(errors)) return [];
  let items: Dynamic = [];
  for (let errorEntry of errors.slice(0, 10) as Dynamic) {
    let rawMessage: Dynamic =
      typeof errorEntry == "object" && errorEntry !== null ? errorEntry.message : undefined;
    if (typeof rawMessage != "string") continue;
    let sanitizedMessage: Dynamic = sanitizeDesignContextText(rawMessage, 300);
    sanitizedMessage !== "" && !items.includes(sanitizedMessage) && items.push(sanitizedMessage);
  }
  return items;
}
function reuseEqualStringArray(previous?: Dynamic, next?: Dynamic): Dynamic {
  return previous.length === next.length &&
    previous.every(
      (previousMessage?: Dynamic, messageIndex?: Dynamic): Dynamic =>
        previousMessage === next[messageIndex],
    )
    ? previous
    : next;
}
function updateArtboardErrorMap(
  errorMap?: Dynamic,
  file?: Dynamic,
  messages?: Dynamic,
): Dynamic {
  let entry: Dynamic = errorMap.get(file);
  if (
    messages.length === 0
      ? entry === undefined
      : entry !== undefined &&
        reuseEqualStringArray(entry, messages) === entry
  )
    return errorMap;
  let entries: Dynamic = new Map(errorMap);
  messages.length === 0 ? entries.delete(file) : entries.set(file, messages);
  return entries;
}
function errorMessagesMatch(
  dismissedMap?: Dynamic,
  file?: Dynamic,
  messages?: Dynamic,
): Dynamic {
  return dismissedMap.get(file) === serializeErrorMessages(messages);
}
function setDismissedArtboardErrors(
  dismissedMap?: Dynamic,
  file?: Dynamic,
  messages?: Dynamic,
): Dynamic {
  return errorMessagesMatch(dismissedMap, file, messages)
    ? dismissedMap
    : new Map(dismissedMap).set(file, serializeErrorMessages(messages));
}
function clearDismissedArtboardErrors(
  dismissedMap?: Dynamic,
  file?: Dynamic,
): Dynamic {
  if (!dismissedMap.has(file)) return dismissedMap;
  let entries: Dynamic = new Map(dismissedMap);
  entries.delete(file);
  return entries;
}
function retainMatchingDismissedErrors(
  errors?: Dynamic,
  dismissedMap?: Dynamic,
): Dynamic {
  return new Map(
    [...errors].filter(
      ([file, messages]: Dynamic): Dynamic =>
        errorMessagesMatch(dismissedMap, file, messages),
    ),
  );
}
export {
  artboardLoadErrorMessage,
  artboardLoadErrorMessages,
  clearDismissedArtboardErrors,
  emptyArtboardErrors,
  errorMessagesMatch,
  maxArtboardErrorFields,
  maxArtboardErrorMessages,
  normalizeArtboardErrorMessages,
  retainMatchingDismissedErrors,
  reuseEqualStringArray,
  sanitizeArtboardErrorContext,
  serializeArtboardErrorContext,
  serializeErrorMessages,
  setDismissedArtboardErrors,
  updateArtboardErrorMap,
};
export function installCanvasArtboardErrors(): () => void {
  return () => {
    emptyArtboardErrors = [];
    maxArtboardErrorMessages = 10;
    maxArtboardErrorFields = 32;
    serializeErrorMessages = (messages?: Dynamic): Dynamic =>
      JSON.stringify(messages);
  };
}
