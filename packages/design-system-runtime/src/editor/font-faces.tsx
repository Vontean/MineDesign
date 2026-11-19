import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { addressedProjectFileUrl, resolveFileVersion, subscribeAddressedFiles } from "./addressed-files";
import { cachedBlobDataUrl } from "./asset-resources";
import { reactFontFaces } from "./files-index";
import { isDataUriUrl } from "../model/derive-system";
import { assetKindForPath, fileExtension, mimeTypeForPath } from "../model/file-policy";
import { HELD_BINARY_MIME_TYPES } from "../model/file-table";

var CSS_GENERIC_FONT_FAMILIES: Set<string>;
var FONT_DATA_URL_PATTERN: RegExp;
var fontFileUrl: (font: Model.ParsedFont) => string;
function quoteCssFontFamily(family: string): string {
  let normalizedFamily = family.trim().toLowerCase();
  if (CSS_GENERIC_FONT_FAMILIES.has(normalizedFamily)) {
    return normalizedFamily;
  }
  return '"' + family.replace(/[\\"]/g, "\\$&") + '"';
}
function fontFileCssFamilyName(path: string): string {
  return (
    "ds-font-" +
    path
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}
function fontFamilyStack(family: string, fontPaths: string[] = []): string {
  let fallbackStack: string =
    quoteCssFontFamily(family) + ", ui-sans-serif, system-ui, sans-serif";
  if (fontPaths.length === 0) {
    return fallbackStack;
  }
  return (
    fontPaths
      .map((font) => quoteCssFontFamily(fontFileCssFamilyName(font)))
      .join(", ") +
    ", " +
    fallbackStack
  );
}
function decodeFontDataUrl(dataUrl: string): ArrayBuffer | null {
  if (!FONT_DATA_URL_PATTERN.test(dataUrl)) {
    return null;
  }
  try {
    let value = dataUrl.slice(dataUrl.indexOf(",") + 1),
      base64Data = atob(value),
      fontBytes = new Uint8Array(base64Data.length);
    for (let index: number = 0; index < base64Data.length; index++) {
      fontBytes[index] = base64Data.charCodeAt(index);
    }
    return fontBytes.buffer;
  } catch {
    return null;
  }
}
function resolvedFontDataUrl(font: Model.ParsedFont): string {
  if (font.src === "") {
    return "";
  }
  if (isDataUriUrl(font.src)) {
    return font.src;
  } else {
    return cachedBlobDataUrl(font.src) ?? "";
  }
}
function useInlineFontFaces(
  fonts: Model.ParsedFont[],
  generation: number = 0,
): void {
  let fontsKey: string =
      fonts
        .map(
          (font): string =>
            font.path +
            ":" +
            String(resolvedFontDataUrl(font).length) +
            ":" +
            font.family +
            ":" +
            font.weight +
            ":" +
            font.style,
        )
        .join("|") +
      "#" +
      String(generation),
    fontsRef = (reactFontFaces as typeof React).useRef(fonts);
  fontsRef.current = fonts;
  (reactFontFaces as typeof React).useEffect(() => {
    let items: FontFace[] = [];
    for (let value of fontsRef.current) {
      let dataUrl = resolvedFontDataUrl(value);
      if (dataUrl === "") {
        continue;
      }
      let fontData = decodeFontDataUrl(dataUrl);
      if (fontData === null) {
        continue;
      }
      try {
        let fontFace = new FontFace(fontFileCssFamilyName(value.path), fontData, {
          weight: value.weight,
          style: value.style,
        });
        document.fonts.add(fontFace);
        items.push(fontFace);
      } catch {}
    }
    return (): void => {
      for (let value of items) {
        document.fonts.delete(value);
      }
    };
  }, [fontsKey]);
  useAddressedFontFaces(fonts);
}
function useAddressedFontFaces(fonts: Model.ParsedFont[]): void {
  let [value, setRevision] = (reactFontFaces as typeof React).useReducer(
      (revision: number) => revision + 1,
      0,
    ),
    ref = (reactFontFaces as typeof React).useRef(
      new Map<string, Editor.AddressedFontFace>(),
    ),
    entries = new Map<string, Editor.AddressedFontSource>(
      fonts
        .filter(
          (font) =>
            font.store === "file" &&
            font.src !== "" &&
            !["image", "video", "audio"].includes(
              assetKindForPath(font.path),
            ) &&
            mimeTypeForPath(font.path) !== "application/pdf" &&
            !Object.hasOwn(
              HELD_BINARY_MIME_TYPES,
              fileExtension(font.path),
            ),
        )
        .map((font) => [
          font.path +
            `
` +
            font.weight +
            `
` +
            font.style,
          {
            path: font.path,
            of: resolveFileVersion(font.path) ?? "",
            at: fontFileUrl(font),
            weight: font.weight,
            style: font.style,
          },
        ]),
    ),
    previousEntriesRef = (reactFontFaces as typeof React).useRef(entries);
  previousEntriesRef.current = entries;
  let hasEntries: boolean = entries.size > 0;
  (reactFontFaces as typeof React).useEffect(
    () => (hasEntries ? subscribeAddressedFiles(setRevision) : undefined),
    [hasEntries],
  );
  let entryList = [...entries]
    .map(
      ([fontKey, fontAddress]): string => fontKey + ":" + fontAddress.of + ":" + fontAddress.at,
    )
    .join("|");
  (reactFontFaces as typeof React).useEffect((): void => {
    for (let [fontKey, fontEntry] of ref.current) {
      let entry = previousEntriesRef.current.get(fontKey);
      if (
        entry !== undefined &&
        entry.of === fontEntry.of &&
        (entry.at === fontEntry.at ||
          fontEntry.face.status === "loaded" ||
          fontEntry.face.status === "loading")
      ) {
        continue;
      }
      document.fonts.delete(fontEntry.face);
      ref.current.delete(fontKey);
    }
    for (let [fontKey, fontEntry] of previousEntriesRef.current) {
      if (ref.current.has(fontKey) || fontEntry.at === "") {
        continue;
      }
      try {
        let fontFace = new FontFace(
          fontFileCssFamilyName(fontEntry.path),
          'url("' + fontEntry.at + '")',
          {
            weight: fontEntry.weight,
            style: fontEntry.style,
            display: "swap",
          },
        );
        document.fonts.add(fontFace);
        ref.current.set(fontKey, {
          face: fontFace,
          of: fontEntry.of,
          at: fontEntry.at,
        });
        fontFace.loaded.catch((): void => {
          if (ref.current.get(fontKey)?.face !== fontFace) {
            return;
          }
          if (previousEntriesRef.current.get(fontKey)?.at !== fontEntry.at) {
            document.fonts.delete(fontFace);
            ref.current.delete(fontKey);
            setRevision();
            return;
          }
          console.warn(
            "design-system: could not load the font " +
              fontEntry.path +
              " from its address (" +
              fontEntry.at +
              "), so text in it is shown in a fallback font. Reload the page; if that does not help, the file may not be a usable font.",
          );
        });
      } catch {}
    }
  }, [entryList, value]);
  (reactFontFaces as typeof React).useEffect(
    () => (): void => {
      for (let fontEntry of ref.current.values()) {
        document.fonts.delete(fontEntry.face);
      }
      ref.current.clear();
    },
    [],
  );
}
export {
  CSS_GENERIC_FONT_FAMILIES,
  decodeFontDataUrl,
  FONT_DATA_URL_PATTERN,
  fontFamilyStack,
  fontFileCssFamilyName,
  fontFileUrl,
  quoteCssFontFamily,
  resolvedFontDataUrl,
  useAddressedFontFaces,
  useInlineFontFaces,
};
export function installEditorFontFaces(): () => void {
  return () => {
    CSS_GENERIC_FONT_FAMILIES = new Set([
      "serif",
      "sans-serif",
      "monospace",
      "cursive",
      "fantasy",
      "system-ui",
      "math",
      "emoji",
      "fangsong",
      "ui-serif",
      "ui-sans-serif",
      "ui-monospace",
      "ui-rounded",
    ]);
    FONT_DATA_URL_PATTERN =
      /^data:(?:font\/(?:woff2|woff|ttf|otf|sfnt)|application\/(?:font-woff2?|x-font-(?:ttf|otf|woff))|application\/octet-stream);base64,[A-Za-z0-9+/=]+$/;
    fontFileUrl = (font: Model.ParsedFont) => {
      try {
        return new URL(
          addressedProjectFileUrl(font.path) ?? font.src,
          document.baseURI,
        ).href;
      } catch {
        return "";
      }
    };
  };
}
