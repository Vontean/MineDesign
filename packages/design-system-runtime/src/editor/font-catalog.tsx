import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactGoogleFontCatalog: typeof import("react");
var WEB_SAFE_FONT_CATALOG: Editor.FontCatalogEntry[];
var GOOGLE_FONT_CATALOG: Editor.FontCatalogEntry[];
var GOOGLE_FONT_FAMILY_NAMES: string[];
var KNOWN_FONT_FAMILY_MAP: Map<string, Editor.FontCatalogEntry>;
var GOOGLE_FONT_VARIANTS: Record<
  string,
  {
    italic?: boolean;
    wght?: number[];
    statics?: number[];
  }
>;
var LOADABLE_FONT_FAMILY_PATTERN: RegExp;
var WEB_SAFE_FONT_FAMILY_PATTERN: RegExp;
function knownFontFamily(
  family: string,
): Editor.FontCatalogEntry | undefined {
  return KNOWN_FONT_FAMILY_MAP.get(family.trim().toLowerCase());
}
function knownWebFontFamily(family: string): string | undefined {
  return knownFontFamily(family)?.family;
}
function googleFontStylesheetUrl(family: string): string {
  let value = knownFontFamily(family),
    stylesheetUrl: string = value
      ? ":wght@" + (value.weights ?? [400, 500, 600, 700]).join(";")
      : "";
  return (
    "https://fonts.googleapis.com/css2?family=" +
    (value?.family ?? family.trim()).replace(/ +/g, "+") +
    stylesheetUrl +
    "&display=swap"
  );
}
function ensureGoogleFonts(
  families: string[],
  documentRef: Document = document,
): void {
  for (let value of families) {
    if (
      WEB_SAFE_FONT_FAMILY_PATTERN.test(value) ||
      !LOADABLE_FONT_FAMILY_PATTERN.test(value)
    ) {
      continue;
    }
    let stylesheetUrl = googleFontStylesheetUrl(value);
    if (documentRef.head.querySelector('link[href="' + stylesheetUrl + '"]')) {
      continue;
    }
    let linkElement = documentRef.createElement("link");
    linkElement.rel = "stylesheet";
    linkElement.href = stylesheetUrl;
    documentRef.head.appendChild(linkElement);
  }
}
export {
  ensureGoogleFonts,
  GOOGLE_FONT_CATALOG,
  GOOGLE_FONT_FAMILY_NAMES,
  GOOGLE_FONT_VARIANTS,
  googleFontStylesheetUrl,
  KNOWN_FONT_FAMILY_MAP,
  knownFontFamily,
  knownWebFontFamily,
  LOADABLE_FONT_FAMILY_PATTERN,
  reactGoogleFontCatalog,
  WEB_SAFE_FONT_CATALOG,
  WEB_SAFE_FONT_FAMILY_PATTERN,
};
export function installEditorFontCatalog(): () => void {
  return () => {
    reactGoogleFontCatalog = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    WEB_SAFE_FONT_CATALOG = [
      {
        family: "Arial",
        generic: "sans",
      },
      {
        family: "Helvetica",
        generic: "sans",
      },
      {
        family: "Georgia",
        generic: "serif",
      },
      {
        family: "Times New Roman",
        generic: "serif",
      },
      {
        family: "Garamond",
        generic: "serif",
      },
      {
        family: "Courier New",
        generic: "mono",
      },
      {
        family: "Verdana",
        generic: "sans",
      },
      {
        family: "Tahoma",
        generic: "sans",
      },
      {
        family: "Trebuchet MS",
        generic: "sans",
      },
    ];
    GOOGLE_FONT_CATALOG = [
      {
        family: "Inter",
        generic: "sans",
        wght: [100, 900],
        italic: true,
      },
      {
        family: "Roboto",
        generic: "sans",
        weights: [400, 500, 700],
        wght: [100, 900],
        italic: true,
      },
      {
        family: "Open Sans",
        generic: "sans",
        wght: [300, 800],
        italic: true,
      },
      {
        family: "Lato",
        generic: "sans",
        weights: [400, 700],
        statics: [100, 300, 400, 700, 900],
        italic: true,
      },
      {
        family: "Montserrat",
        generic: "sans",
        wght: [100, 900],
        italic: true,
      },
      {
        family: "Poppins",
        generic: "sans",
        statics: [100, 200, 300, 400, 500, 600, 700, 800, 900],
        italic: true,
      },
      {
        family: "Raleway",
        generic: "sans",
        wght: [100, 900],
        italic: true,
      },
      {
        family: "Nunito",
        generic: "sans",
        wght: [200, 1000],
        italic: true,
      },
      {
        family: "Playfair Display",
        generic: "serif",
        wght: [400, 900],
        italic: true,
      },
      {
        family: "Merriweather",
        generic: "serif",
        weights: [400, 700],
        wght: [300, 900],
        italic: true,
      },
      {
        family: "Work Sans",
        generic: "sans",
        wght: [100, 900],
        italic: true,
      },
      {
        family: "DM Sans",
        generic: "sans",
        wght: [100, 1000],
        italic: true,
      },
      {
        family: "Manrope",
        generic: "sans",
        wght: [200, 800],
        italic: false,
      },
      {
        family: "Space Grotesk",
        generic: "sans",
        wght: [300, 700],
        italic: false,
      },
      {
        family: "Lora",
        generic: "serif",
        wght: [400, 700],
        italic: true,
      },
      {
        family: "Bebas Neue",
        generic: "sans",
        weights: [400],
        statics: [400],
        italic: false,
      },
      {
        family: "Caveat",
        generic: "sans",
        wght: [400, 700],
        italic: false,
      },
    ];
    GOOGLE_FONT_FAMILY_NAMES = GOOGLE_FONT_CATALOG.map((font) => font.family);
    KNOWN_FONT_FAMILY_MAP = new Map(
      GOOGLE_FONT_CATALOG.map((font) => [font.family.toLowerCase(), font]),
    );
    GOOGLE_FONT_VARIANTS = Object.fromEntries(
      GOOGLE_FONT_CATALOG.map((font) => [
        font.family.toLowerCase(),
        {
          ...(font.wght !== undefined
            ? {
                wght: font.wght,
              }
            : {
                statics: font.statics ?? [400],
              }),
          italic: font.italic,
        },
      ]),
    );
    LOADABLE_FONT_FAMILY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ]*$/;
    WEB_SAFE_FONT_FAMILY_PATTERN =
      /^(?:ui-)?(?:serif|sans-serif|monospace|rounded|cursive|fantasy|system-ui|math|emoji|fangsong)$/;
  };
}
