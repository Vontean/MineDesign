/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { getEditCount, subscribeEditCount } from "../platform/edit-count";
import { hasRoomCapability, publishRoomPresence } from "../platform/file-content";

var maxDesignContextBytes: Dynamic;
var maxDesignContextFields: Dynamic;
var maxDesignContextSelectionItems: Dynamic;
var defaultDesignContextLabelLength: Dynamic;
var maxDesignContextValueBytes: Dynamic;
var maxDesignContextIdLength: Dynamic;
var designContextFieldNamePattern: Dynamic;
var reservedDesignContextFields: Dynamic;
var designContextIdPattern: Dynamic;
var forbiddenDesignContextIdCodepoints: Dynamic;
var forbiddenDesignContextLabelCharacters: Dynamic;
var blankDesignContextLabelPattern: Dynamic;
var extendedPictographicPattern: Dynamic;
function isValidDesignContextId(contextId?: Dynamic): Dynamic {
  if (
    typeof contextId != "string" ||
    contextId.length > maxDesignContextIdLength ||
    !designContextIdPattern.test(contextId)
  )
    return false;
  try {
    return !forbiddenDesignContextIdCodepoints.test(
      decodeURIComponent(contextId).normalize("NFKD"),
    );
  } catch {
    return false;
  }
}
function normalizedSingleContextCharacter(character?: Dynamic): Dynamic {
  let normalized: Dynamic = character.normalize("NFKD");
  return [...normalized].length === 1 ? normalized : character;
}
function isUnicodeTagCodepoint(codepoint?: Dynamic): Dynamic {
  return (
    codepoint !== undefined && codepoint >= 917536 && codepoint <= 917631
  );
}
function isForbiddenContextCodepoint(codepoint?: Dynamic): Dynamic {
  return (
    (codepoint >= 55296 && codepoint <= 57343) ||
    (codepoint & 65534) === 65534 ||
    (codepoint >= 64976 && codepoint <= 65007) ||
    (codepoint >= 65520 && codepoint <= 65528) ||
    (codepoint >= 917504 && codepoint <= 921599)
  );
}
function sanitizeDesignContextText(
  rawText?: Dynamic,
  limit: Dynamic = defaultDesignContextLabelLength,
): Dynamic {
  let text: Dynamic = "",
    charCount: Dynamic = 0,
    hasPendingSpace: Dynamic = false,
    appendCharacter: Dynamic = (character?: Dynamic, nextCharacter?: Dynamic): Dynamic => {
      let codepoint: Dynamic = character.codePointAt(0) ?? 0;
      return codepoint <= 32 ||
        (codepoint >= 127 && codepoint <= 160) ||
        /\s/u.test(character)
        ? ((hasPendingSpace = text !== ""), false)
        : isForbiddenContextCodepoint(codepoint) ||
            forbiddenDesignContextLabelCharacters.test(character)
          ? false
          : forbiddenDesignContextLabelCharacters.test(
                normalizedSingleContextCharacter(character),
              ) ||
              (isUnicodeTagCodepoint(nextCharacter.codePointAt(0)) &&
                extendedPictographicPattern.test(character))
            ? ((hasPendingSpace = text !== ""), false)
            : (hasPendingSpace && ((text += " "), (charCount += 1), (hasPendingSpace = false)),
              (text += character),
              (charCount += 1),
              charCount > limit);
    },
    previousCharacter: Dynamic = "";
  for (let nextChar of rawText.normalize("NFC") as Dynamic) {
    if (previousCharacter !== "" && appendCharacter(previousCharacter, nextChar)) {
      previousCharacter = "";
      break;
    }
    previousCharacter = nextChar;
  }
  previousCharacter !== "" && appendCharacter(previousCharacter, "");
  return blankDesignContextLabelPattern.test(text)
    ? ""
    : charCount <= limit
      ? text
      : [...text]
          .slice(0, limit - 1)
          .join("")
          .trimEnd() + "\u2026";
}
function sanitizeDesignContextSelection(selection?: Dynamic): Dynamic {
  return selection
    .filter(
      (item?: Dynamic): Dynamic =>
        typeof item == "object" &&
        item !== null &&
        isValidDesignContextId(item.id),
    )
    .slice(-maxDesignContextSelectionItems)
    .map(({ id: id, kind: kind, label: label }: Dynamic): Dynamic => {
      let selectionItem: Dynamic = {
        id: id,
      };
      isValidDesignContextId(kind) && (selectionItem.kind = kind);
      let sanitizedLabel: Dynamic =
        typeof label == "string" ? sanitizeDesignContextText(label) : "";
      sanitizedLabel !== "" && (selectionItem.label = sanitizedLabel);
      return selectionItem;
    });
}
function sanitizeDesignContextFields(fields?: Dynamic): Dynamic {
  let fullFields: Dynamic = {},
    leanFields: Dynamic = {};
  for (let fieldName of Object.keys(fields) as Dynamic) {
    if (
      !designContextFieldNamePattern.test(fieldName) ||
      fieldName === "prototype" ||
      fieldName in Object.prototype ||
      reservedDesignContextFields.includes(fieldName)
    )
      continue;
    let fieldValue: Dynamic = fields[fieldName];
    if (typeof fieldValue == "boolean" || fieldValue === null)
      fullFields[fieldName] = leanFields[fieldName] = fieldValue;
    else if (typeof fieldValue == "number")
      fullFields[fieldName] = leanFields[fieldName] = Number.isSafeInteger(fieldValue)
        ? fieldValue
        : null;
    else if (Array.isArray(fieldValue)) {
      let listValue: Dynamic = fieldValue;
      listValue.some(
        (item?: Dynamic): Dynamic =>
          typeof item == "object" && item !== null,
      )
        ? (fullFields[fieldName] = sanitizeDesignContextSelection(listValue))
        : (fullFields[fieldName] = leanFields[fieldName] =
            listValue
              .filter(isValidDesignContextId)
              .slice(-maxDesignContextFields));
    } else if (typeof fieldValue == "object") {
      let textValue: Dynamic =
        typeof fieldValue.text == "string"
          ? sanitizeDesignContextText(fieldValue.text)
          : "";
      textValue !== "" && (fullFields[fieldName] = textValue);
    } else
      fullFields[fieldName] = leanFields[fieldName] = isValidDesignContextId(fieldValue)
        ? fieldValue
        : null;
  }
  return {
    full: fullFields,
    lean: leanFields,
  };
}
function createDesignContextPublisher(): Dynamic {
  let isDisabled: Dynamic = !hasRoomCapability(),
    latestContext: Dynamic = null,
    lastFullJson: Dynamic = "",
    lastLeanJson: Dynamic = "",
    lastPublishedJson: Dynamic = "",
    isPublishing: Dynamic = false,
    hasWarnedOverflow: Dynamic = false,
    isDisposed: Dynamic = false,
    flushTimer: Dynamic,
    needsRetry: Dynamic = false,
    unsubscribeEditCount: Dynamic = (): Dynamic => {};
  isDisabled ||
    (unsubscribeEditCount = subscribeEditCount((): Dynamic => {
      flush();
    }));
  function withEditCount(fields?: Dynamic): Dynamic {
    let editCount: Dynamic = getEditCount();
    return editCount > 0
      ? {
          ...fields,
          edits: editCount,
        }
      : fields;
  }
  let fitsByteLimit: Dynamic = (json?: Dynamic): Dynamic =>
    new TextEncoder().encode(json).length <= maxDesignContextBytes;
  function pickPublishableView(fieldSets?: Dynamic): Dynamic {
    for (let candidateView of [
      withEditCount(fieldSets.full),
      withEditCount(fieldSets.lean),
      fieldSets.lean,
    ] as Dynamic) {
      let candidateJson: Dynamic = JSON.stringify(candidateView);
      if (fitsByteLimit(candidateJson))
        return {
          view: candidateView,
          json: candidateJson,
        };
    }
    return {
      view: null,
      json: "",
    };
  }
  function scheduleFlush(): Dynamic {
    clearTimeout(flushTimer);
    flushTimer = setTimeout((): Dynamic => {
      flush();
    }, maxDesignContextValueBytes);
  }
  async function flush(): Promise<Dynamic> {
    clearTimeout(flushTimer);
    flushTimer = undefined;
    if (isDisabled || isPublishing || latestContext === null) return;
    isPublishing = true;
    let { view: view, json: json }: Dynamic = pickPublishableView(latestContext);
    view === null &&
      !hasWarnedOverflow &&
      ((hasWarnedOverflow = true),
      console.warn(
        "appifact presence: context over 3 KiB \u2014 cleared, not published",
      ));
    let fullJsonBefore: Dynamic = JSON.stringify(withEditCount(latestContext.full)),
      leanJsonBefore: Dynamic = lastLeanJson,
      editCountBefore: Dynamic = getEditCount();
    try {
      if (json === lastPublishedJson) return;
      let publishResult: Dynamic = await publishRoomPresence({
        context: view,
      });
      publishResult === "off" &&
        ((isDisabled = true),
        unsubscribeEditCount(),
        !isDisposed &&
          lastPublishedJson !== "" &&
          publishRoomPresence({
            context: null,
          }));
      publishResult === "ok" && (lastPublishedJson = json);
      needsRetry = publishResult === "retry";
    } finally {
      isPublishing = false;
      latestContext !== null &&
        JSON.stringify(withEditCount(latestContext.full)) !== fullJsonBefore &&
        (lastLeanJson === leanJsonBefore && getEditCount() === editCountBefore
          ? flushTimer === undefined && scheduleFlush()
          : flush());
    }
  }
  return {
    report(fields: Dynamic): Dynamic {
      if (isDisabled) return;
      let sanitized: Dynamic = sanitizeDesignContextFields(fields),
        fullJson: Dynamic = JSON.stringify(sanitized.full);
      if (fullJson === lastFullJson) {
        needsRetry && flushTimer === undefined && flush();
        return;
      }
      let leanJson: Dynamic = JSON.stringify(sanitized.lean),
        isLeanOnlyChange: Dynamic = !needsRetry && latestContext !== null && leanJson === lastLeanJson;
      latestContext = sanitized;
      lastFullJson = fullJson;
      lastLeanJson = leanJson;
      isLeanOnlyChange ? scheduleFlush() : flush();
    },
    dispose(): Dynamic {
      clearTimeout(flushTimer);
      unsubscribeEditCount();
      !isDisabled &&
        (lastPublishedJson !== "" || isPublishing) &&
        publishRoomPresence({
          context: null,
        });
      latestContext = null;
      isDisabled = isDisposed = true;
    },
  };
}
export {
  blankDesignContextLabelPattern,
  createDesignContextPublisher,
  defaultDesignContextLabelLength,
  designContextFieldNamePattern,
  designContextIdPattern,
  extendedPictographicPattern,
  forbiddenDesignContextIdCodepoints,
  forbiddenDesignContextLabelCharacters,
  isForbiddenContextCodepoint,
  isUnicodeTagCodepoint,
  isValidDesignContextId,
  maxDesignContextBytes,
  maxDesignContextFields,
  maxDesignContextIdLength,
  maxDesignContextSelectionItems,
  maxDesignContextValueBytes,
  normalizedSingleContextCharacter,
  reservedDesignContextFields,
  sanitizeDesignContextFields,
  sanitizeDesignContextSelection,
  sanitizeDesignContextText,
};
export function installCanvasContextPublisher(): () => void {
  return () => {
    maxDesignContextBytes = 3072;
    maxDesignContextFields = 20;
    maxDesignContextSelectionItems = 5;
    defaultDesignContextLabelLength = 60;
    maxDesignContextValueBytes = 400;
    maxDesignContextIdLength = 256;
    designContextFieldNamePattern = /^[A-Za-z_][A-Za-z0-9_-]{0,63}$/;
    reservedDesignContextFields = ["edits"];
    designContextIdPattern = /^(?:[A-Za-z0-9_./#:@+!~*'()-]|%[0-9A-Fa-f]{2})*$/;
    forbiddenDesignContextIdCodepoints =
      /[\p{Cc}\p{Co}\p{Cs}]|[^\P{Cf}\u200C\u200D]|["`<>\\\p{Zl}\p{Zp}]/u;
    forbiddenDesignContextLabelCharacters =
      /[<>"`\\]|[^\P{Cf}\u200C\u200D]|[\p{Co}\u034F\u115F\u1160\u17B4\u17B5\u2065\u2800\u3164\uFFA0\uFFFC\uFFFD\u{16FE4}\u{1D159}]/u;
    blankDesignContextLabelPattern =
      /^[ \u200C\u200D\p{Variation_Selector}]*$/u;
    extendedPictographicPattern = /\p{Extended_Pictographic}/u;
  };
}
