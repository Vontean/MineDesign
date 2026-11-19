/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react } from "../../dependencies";
import { toModuleNamespace } from "../../module-helpers";

var reactClipboardNative: Dynamic;
var ClipboardNativeAlias: Dynamic;
var ClipboardNativeObservedElements: Dynamic;
var AppifactObjectAttribute: Dynamic;
var clipboardObjectAttributePattern: Dynamic;
var ClipboardNativeResolvedValue: Dynamic;
function setClipboardMirror(mirror?: Dynamic): Dynamic {
  ClipboardNativeAlias = mirror;
  if (mirror === undefined || ClipboardNativeObservedElements.has(document))
    return;
  ClipboardNativeObservedElements.add(document);
  let clearMirror: Dynamic = (): Dynamic => setClipboardMirror(undefined);
  (document as Dynamic).addEventListener("copy", clearMirror, true);
  (document as Dynamic).addEventListener("cut", clearMirror, true);
  (window as Dynamic).addEventListener("blur", clearMirror);
}
async function writeClipboardText(text?: Dynamic): Promise<Dynamic> {
  try {
    await navigator.clipboard.writeText(text);
    setClipboardMirror(undefined);
    return true;
  } catch {}
  try {
    let textarea: Dynamic = (document as Dynamic).createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    (document as Dynamic).body.appendChild(textarea);
    textarea.select();
    let didCopy: Dynamic = (document as Dynamic).execCommand("copy");
    textarea.remove();
    return didCopy;
  } catch {
    return false;
  }
}
function encodeClipboardUtf8(plainText?: Dynamic): Dynamic {
  let bytes: Dynamic = new TextEncoder().encode(plainText),
    text: Dynamic = "";
  for (let index: Dynamic = 0; index < bytes.length; index += 32768)
    text += String.fromCharCode(...bytes.subarray(index, index + 32768));
  return btoa(text);
}
function decodeClipboardUtf8(encoded?: Dynamic): Dynamic {
  try {
    let binary: Dynamic = atob(encoded),
      bytes: Dynamic = new Uint8Array(binary.length);
    for (let index: Dynamic = 0; index < binary.length; index++)
      bytes[index] = binary.charCodeAt(index);
    return new TextDecoder().decode(bytes);
  } catch {
    return;
  }
}
function escapeClipboardHtml(html?: Dynamic): Dynamic {
  return html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
function writeClipboardObject(
  event?: Dynamic,
  kind?: Dynamic,
  payload?: Dynamic,
): Dynamic {
  let clipboardData: Dynamic = event.clipboardData;
  if (!clipboardData) return false;
  let state: Dynamic = {
    appifact: 1,
    kind: kind,
    data: payload.data,
  };
  try {
    clipboardData.setData("text/plain", payload.text);
    clipboardData.setData(
      "text/html",
      "<span " +
        AppifactObjectAttribute +
        '="' +
        encodeClipboardUtf8(JSON.stringify(state)) +
        '">' +
        escapeClipboardHtml(payload.text) +
        "</span>",
    );
  } catch {
    return false;
  }
  ClipboardNativeResolvedValue =
    payload.text === ""
      ? undefined
      : {
          kind: kind,
          data: payload.data,
          text: payload.text,
        };
  setClipboardMirror({
    kind: kind,
    data: payload.data,
  });
  return true;
}
function readClipboardObject(event?: Dynamic): Dynamic {
  let clipboardData: Dynamic = event.clipboardData;
  if (!clipboardData) return;
  let html: Dynamic = clipboardData.getData("text/html"),
    match: Dynamic =
      html === "" ? null : clipboardObjectAttributePattern.exec(html);
  if (match?.[1] !== undefined) {
    let decodedJson: Dynamic = decodeClipboardUtf8(match[1]);
    if (decodedJson !== undefined)
      try {
        let parsed: Dynamic = JSON.parse(decodedJson);
        if (
          typeof parsed == "object" &&
          parsed !== null &&
          parsed.appifact === 1 &&
          typeof parsed.kind == "string" &&
          Object.hasOwn(parsed, "data")
        )
          return {
            kind: parsed.kind,
            data: parsed.data,
          };
      } catch {}
  }
  if (
    ClipboardNativeResolvedValue !== undefined &&
    ClipboardNativeResolvedValue.text !== "" &&
    clipboardData.getData("text/plain") === ClipboardNativeResolvedValue.text
  )
    return {
      kind: ClipboardNativeResolvedValue.kind,
      data: ClipboardNativeResolvedValue.data,
    };
}
function clipboardContainsFileNames(
  files?: Dynamic,
  text?: Dynamic,
): Dynamic {
  let trimmedText: Dynamic = text.trim();
  if (trimmedText === "" || /^https?:\/\/\S+$/.test(trimmedText)) return true;
  let fileNames: Dynamic = new Set(
    files.map((file?: Dynamic): Dynamic => file.name),
  );
  return trimmedText
    .split(/\r\n|\r|\n/)
    .every(
      (line?: Dynamic): Dynamic =>
        fileNames.has(normalizeClipboardFileName(line)),
    );
}
function normalizeClipboardFileName(fileName?: Dynamic): Dynamic {
  let name: Dynamic = fileName.trim().replace(/^"(.*)"$/, "$1");
  if (!/^(file:\/\/|\/|\\\\|[A-Za-z]:[\\/])/i.test(name)) return name;
  if (/^file:/i.test(name))
    try {
      name = decodeURIComponent(name);
    } catch {}
  return name.slice(
    Math.max(name.lastIndexOf("/"), name.lastIndexOf("\\")) + 1,
  );
}
function copyClipboardObject(kind?: Dynamic, payload?: Dynamic): Dynamic {
  let didWrite: Dynamic = false,
    handleCopy: Dynamic = (event?: Dynamic): Dynamic => {
      event.preventDefault();
      didWrite = writeClipboardObject(event, kind, payload);
    },
    activeElement: Dynamic = (document as Dynamic).activeElement,
    textarea: Dynamic = (document as Dynamic).createElement("textarea");
  textarea.value = payload.text === "" ? " " : payload.text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  (document as Dynamic).body.appendChild(textarea);
  textarea.select();
  (document as Dynamic).addEventListener("copy", handleCopy, {
    capture: true,
    once: true,
  });
  try {
    (document as Dynamic).execCommand("copy");
  } catch {}
  (document as Dynamic).removeEventListener("copy", handleCopy, {
    capture: true,
  });
  textarea.remove();
  activeElement instanceof HTMLElement &&
    activeElement.isConnected &&
    activeElement.focus({
      preventScroll: true,
    });
  return didWrite;
}
export {
  AppifactObjectAttribute,
  clipboardContainsFileNames,
  ClipboardNativeAlias,
  ClipboardNativeObservedElements,
  ClipboardNativeResolvedValue,
  clipboardObjectAttributePattern,
  copyClipboardObject,
  decodeClipboardUtf8,
  encodeClipboardUtf8,
  escapeClipboardHtml,
  normalizeClipboardFileName,
  reactClipboardNative,
  readClipboardObject,
  setClipboardMirror,
  writeClipboardObject,
  writeClipboardText,
};
export function installEditorClipboardNative(): () => void {
  return () => {
    reactClipboardNative = toModuleNamespace(
      load_react(),
      1,
    );
    ClipboardNativeObservedElements = new WeakSet();
    AppifactObjectAttribute = "data-appifact-object";
    clipboardObjectAttributePattern = new RegExp(
      AppifactObjectAttribute + '="([A-Za-z0-9+/=]+)"',
    );
  };
}
