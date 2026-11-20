/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";

var issuedUntrustedMarkers: Dynamic;
var MAX_UNTRUSTED_MARKER_HISTORY: Dynamic;
var UNTRUSTED_FENCE_SEPARATOR: Dynamic;
var UNTRUSTED_MARKER_WORD_PATTERN: Dynamic;
var MAX_UNTRUSTED_SANITIZE_PASSES: Dynamic;
var UNTRUSTED_REMOVED_PLACEHOLDER: Dynamic;
function createUntrustedMarker(): Dynamic {
  let value: Dynamic = new Uint8Array(16);
  crypto.getRandomValues(value);
  let marker: Dynamic = Array.from(
    value,
    (byte?: Dynamic): Dynamic => byte.toString(16).padStart(2, "0"),
  ).join("");
  issuedUntrustedMarkers.push(marker);
  issuedUntrustedMarkers.length > MAX_UNTRUSTED_MARKER_HISTORY &&
    issuedUntrustedMarkers.shift();
  return marker;
}
function sanitizeUntrustedText(text?: Dynamic): Dynamic {
  let sanitized: Dynamic = String(text).replace(/\p{Cf}/gu, "");
  for (let index: Dynamic = 0; ; index++) {
    if (index >= MAX_UNTRUSTED_SANITIZE_PASSES)
      return UNTRUSTED_REMOVED_PLACEHOLDER;
    let previousText: Dynamic = sanitized;
    for (let marker of issuedUntrustedMarkers as Dynamic)
      sanitized.includes(marker) &&
        (sanitized = sanitized.split(marker).join(""));
    sanitized = sanitized.replace(UNTRUSTED_MARKER_WORD_PATTERN, "");
    if (sanitized === previousText) return sanitized;
  }
}
function fenceUntrustedContent(
  label?: Dynamic,
  content?: Dynamic,
  marker?: Dynamic,
): Dynamic {
  let sanitized: Dynamic = sanitizeUntrustedText(content)
    .replace(
      /\p{Cc}/gu,
      (character?: Dynamic): Dynamic =>
        character ===
          `
` || character === "	"
          ? character
          : " ",
    )
    .replace(
      /<{2,}|>{2,}/g,
      (text?: Dynamic): Dynamic =>
        text.split("").join(UNTRUSTED_FENCE_SEPARATOR),
    );
  return (
    "<<<" +
    marker +
    " " +
    label.replace(/[^A-Za-z0-9 ]/g, "") +
    `
` +
    sanitized +
    `
` +
    marker +
    ">>>"
  );
}
export {
  createUntrustedMarker,
  fenceUntrustedContent,
  issuedUntrustedMarkers,
  MAX_UNTRUSTED_MARKER_HISTORY,
  MAX_UNTRUSTED_SANITIZE_PASSES,
  sanitizeUntrustedText,
  UNTRUSTED_FENCE_SEPARATOR,
  UNTRUSTED_MARKER_WORD_PATTERN,
  UNTRUSTED_REMOVED_PLACEHOLDER,
};
export function installFastEditUntrustedContent(): () => void {
  return () => {
    issuedUntrustedMarkers = [];
    MAX_UNTRUSTED_MARKER_HISTORY = 2e3;
    UNTRUSTED_FENCE_SEPARATOR = "\u200B";
    UNTRUSTED_MARKER_WORD_PATTERN =
      /end[\s\-_]*untrusted(?:[\s\-_]*data)?|untrusted[\s\-_]*data/gi;
    MAX_UNTRUSTED_SANITIZE_PASSES = 64;
    UNTRUSTED_REMOVED_PLACEHOLDER = "[removed]";
  };
}
