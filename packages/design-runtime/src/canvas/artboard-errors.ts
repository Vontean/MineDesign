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
function sanitizeArtboardErrorContext(value?: Dynamic): Dynamic {
  return Array.isArray(value)
    ? value.map(
        (input?: Dynamic): Dynamic =>
          typeof input == "object" &&
          input !== null &&
          typeof input.label == "string"
            ? {
                ...input,
                label: sanitizeDesignContextText(input.label),
              }
            : input,
      )
    : typeof value == "object" && value !== null
      ? sanitizeDesignContextText(value.text)
      : value;
}
function serializeArtboardErrorContext(
  errors?: Dynamic,
  firstError?: Dynamic,
  context?: Dynamic,
): Dynamic {
  if (errors.length === 0) return [];
  let state: Dynamic = {
      ...Object.fromEntries(
        Object.entries(context).map(
          ([input, input2]: Dynamic): Dynamic => [
            input,
            sanitizeArtboardErrorContext(input2),
          ],
        ),
      ),
      erroredArtboards: [],
      firstError: sanitizeDesignContextText(firstError),
    },
    value: Dynamic =
      new TextEncoder().encode(JSON.stringify(state)).length +
      maxArtboardErrorFields,
    items: Dynamic = [];
  for (let value2 of errors.slice(0, maxArtboardErrorMessages) as Dynamic) {
    value += value2.length + 3;
    if (value > maxDesignContextBytes) break;
    items.push(value2);
  }
  return items;
}
function artboardLoadErrorMessage(
  loadError?: Dynamic,
  previewError?: Dynamic,
): Dynamic {
  return loadError != null
    ? uiMessage("canvas.artboardErrors.couldnTLoadThisArtboard", { value1: String(loadError) })
    : previewError != null
      ? uiMessage("canvas.artboardErrors.previewStoppedValue1", { value1: String(previewError) })
      : null;
}
function artboardLoadErrorMessages(
  loadError?: Dynamic,
  previewError?: Dynamic,
  messages?: Dynamic,
): Dynamic {
  let value: Dynamic = artboardLoadErrorMessage(loadError, previewError);
  if (value === null) return messages;
  let value2: Dynamic = sanitizeDesignContextText(value, 300);
  return value2 === "" ? emptyArtboardErrors : [value2];
}
function normalizeArtboardErrorMessages(errors?: Dynamic): Dynamic {
  if (!Array.isArray(errors)) return [];
  let items: Dynamic = [];
  for (let value of errors.slice(0, 10) as Dynamic) {
    let value2: Dynamic =
      typeof value == "object" && value !== null ? value.message : undefined;
    if (typeof value2 != "string") continue;
    let value3: Dynamic = sanitizeDesignContextText(value2, 300);
    value3 !== "" && !items.includes(value3) && items.push(value3);
  }
  return items;
}
function reuseEqualStringArray(previous?: Dynamic, next?: Dynamic): Dynamic {
  return previous.length === next.length &&
    previous.every(
      (input?: Dynamic, options?: Dynamic): Dynamic =>
        input === next[options],
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
      ([input, input2]: Dynamic): Dynamic =>
        errorMessagesMatch(dismissedMap, input, input2),
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
    serializeErrorMessages = (input?: Dynamic): Dynamic =>
      JSON.stringify(input);
  };
}
