import type { NormalizedTokens } from "../../contracts";
import { googleFontStylesheetUrl, knownWebFontFamily } from "../../editor/font-catalog";

export function googleFontStylesheetUrls(
  familyNames: Record<string, string>,
  fonts: {
    family: string;
  }[],
  typeTokens: NormalizedTokens["type"],
) {
  let localFamilies = new Set(
      fonts.map((font) => font.family.toLowerCase()),
    ),
    urls = [
      ...new Set(
        Object.entries(familyNames).flatMap(([familyName, fontFamily]) => {
          let value = knownWebFontFamily(fontFamily);
          if (
            value === undefined ||
            localFamilies.has(fontFamily.toLowerCase())
          ) {
            return [];
          }
          let stylesheetUrl = googleFontStylesheetUrl(value),
            values = new Set(
              (/wght@([\d;]+)/.exec(stylesheetUrl)?.[1] ?? "400")
                .split(";")
                .map(Number),
            ),
            fontSources = [
              ...new Set(
                typeTokens.groups.flatMap((typeGroup) =>
                  typeGroup.styles
                    .filter(
                      (font) =>
                        (font.family !== ""
                          ? font.family
                          : typeGroup.family) === familyName,
                    )
                    .map((font) => parseInt(String(font.fontWeight), 10)),
                ),
              ),
            ]
              .filter(
                (weight) =>
                  weight >= 100 && weight <= 900 && !values.has(weight),
              )
              .sort((leftWeight, rightWeight) => leftWeight - rightWeight);
          return [
            stylesheetUrl,
            ...fontSources.map(
              (weight) =>
                "https://fonts.googleapis.com/css2?family=" +
                value.replace(/ +/g, "+") +
                ":wght@" +
                String(weight) +
                "&display=swap",
            ),
          ];
        }),
      ),
    ].sort();
  return urls;
}

export function syncGoogleFontStylesheets(urls: string[]): void {
    let entries = new Map(
      [
        ...document.querySelectorAll<HTMLLinkElement>(
          "link[data-ds-google-font]",
        ),
      ].map((link) => [link.href, link]),
    );
    for (let [value, link] of entries) {
      if (!urls.includes(value)) {
        link.remove();
      }
    }
    for (let value of urls) {
      if (entries.has(value)) {
        continue;
      }
      let existingLink = [
        ...document.head.querySelectorAll<HTMLLinkElement>(
          'link[rel="stylesheet"]',
        ),
      ].find((link) => link.href === value);
      if (existingLink !== undefined) {
        existingLink.dataset.dsGoogleFont = "1";
        continue;
      }
      let stylesheetLink = document.createElement("link");
      stylesheetLink.rel = "stylesheet";
      stylesheetLink.dataset.dsGoogleFont = "1";
      stylesheetLink.href = value;
      document.head.appendChild(stylesheetLink);
    }
}
