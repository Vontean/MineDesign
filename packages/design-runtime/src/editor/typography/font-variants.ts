/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { getKnownWebFont, TypographyFontCatalogItems, TypographyFontCatalogSerifSansSerifPattern } from "./font-catalog";

var TypographyFontVariants100200300Config: Dynamic;
var TypographyFontVariantsItems: Dynamic;
var DEFAULT_FONT_VARIANTS: Dynamic;
var TypographyFontVariantsFlatMapValue: Dynamic;
var TypographyFontVariantsSubscribers: Dynamic;
var sortFontVariants: Dynamic;
function normalizeFontWeightHundreds(weight?: Dynamic): Dynamic {
  return Math.min(900, Math.max(100, Math.round(weight / 100) * 100));
}
function fontVariantLabel(weight?: Dynamic, italic?: Dynamic): Dynamic {
  let value: Dynamic =
    TypographyFontVariants100200300Config[
      normalizeFontWeightHundreds(weight)
    ] ?? String(weight);
  return italic
    ? normalizeFontWeightHundreds(weight) === 400
      ? "Italic"
      : value + " italic"
    : value;
}
function fontVariantKey(weight?: Dynamic, italic?: Dynamic): Dynamic {
  return String(normalizeFontWeightHundreds(weight)) + (italic ? "i" : "");
}
function parseFontVariantKey(key?: Dynamic): Dynamic {
  let value: Dynamic = /^([1-9]00)(i?)$/.exec(key);
  return value
    ? {
        weight: Number(value[1]),
        italic: value[2] === "i",
      }
    : undefined;
}
function normalizeFirstFontFamily(fontStack?: Dynamic): Dynamic {
  return (fontStack.split(",")[0] ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .trim();
}
function getAvailableFontVariants(
  fonts?: Dynamic,
  familyName?: Dynamic,
): Dynamic {
  let value: Dynamic = normalizeFirstFontFamily(familyName).toLowerCase(),
    entries: Dynamic = new Map();
  for (let font of fonts as Dynamic) {
    if (
      typeof font?.family != "string" ||
      typeof font.weight != "string" ||
      typeof font.style != "string" ||
      font.status === "error" ||
      normalizeFirstFontFamily(font.family).toLowerCase() !== value
    )
      continue;
    let isItalic: Dynamic = /^(?:italic|oblique)/.test(font.style.trim()),
      weightText: Dynamic = font.weight.trim(),
      weightRange: Dynamic = /^(\d+(?:\.\d+)?)(?:\s+(\d+(?:\.\d+)?))?$/.exec(
        weightText,
      ),
      minWeight: Dynamic =
        weightText === "normal"
          ? 400
          : weightText === "bold"
            ? 700
            : weightRange
              ? Number(weightRange[1])
              : NaN;
    if (!Number.isFinite(minWeight)) continue;
    let maxWeight: Dynamic =
        weightRange?.[2] !== undefined ? Number(weightRange[2]) : minWeight,
      matchingWeights: Dynamic = TypographyFontVariantsItems.filter(
        (weight?: Dynamic): Dynamic =>
          weight >= Math.min(minWeight, maxWeight) &&
          weight <= Math.max(minWeight, maxWeight),
      );
    for (let weight of (matchingWeights.length > 0
      ? matchingWeights
      : [normalizeFontWeightHundreds(minWeight)]) as Dynamic)
      entries.set(fontVariantKey(weight, isItalic), {
        weight: weight,
        italic: isItalic,
      });
  }
  return entries.size === 0 ? undefined : sortFontVariants(entries.values());
}
function knownWebFontVariants(fontStack?: Dynamic): Dynamic {
  let value: Dynamic = normalizeFirstFontFamily(fontStack),
    fontRecord: Dynamic = getKnownWebFont(value);
  if (fontRecord !== undefined)
    return (
      fontRecord.wght !== undefined
        ? TypographyFontVariantsItems.filter(
            (weight?: Dynamic): Dynamic =>
              weight >= fontRecord.wght[0] && weight <= fontRecord.wght[1],
          )
        : [...(fontRecord.statics ?? [400])]
    ).flatMap(
      (weight?: Dynamic): Dynamic =>
        fontRecord.italic
          ? [
              {
                weight: weight,
                italic: false,
              },
              {
                weight: weight,
                italic: true,
              },
            ]
          : [
              {
                weight: weight,
                italic: false,
              },
            ],
    );
  let familyName: Dynamic = value.toLowerCase();
  if (
    TypographyFontVariantsSubscribers.has(familyName) ||
    familyName === "helvetica neue" ||
    TypographyFontCatalogSerifSansSerifPattern.test(familyName) ||
    /^(?:-apple-system|blinkmacsystemfont)$/.test(familyName)
  )
    return [...DEFAULT_FONT_VARIANTS];
}
function resolveFontVariants(fontStack?: Dynamic, items?: Dynamic): Dynamic {
  return (
    knownWebFontVariants(fontStack) ??
    (items !== undefined && items.length > 0
      ? items
      : TypographyFontVariantsFlatMapValue)
  );
}
function includeCurrentFontVariant(
  fontVariants?: Dynamic,
  currentVariant?: Dynamic,
): Dynamic {
  let value: Dynamic = sortFontVariants(fontVariants);
  currentVariant !== undefined &&
    !value.some(
      (variant?: Dynamic): Dynamic =>
        variant.weight === normalizeFontWeightHundreds(currentVariant.weight) &&
        variant.italic === currentVariant.italic,
    ) &&
    value.unshift({
      weight: normalizeFontWeightHundreds(currentVariant.weight),
      italic: currentVariant.italic,
    });
  return value.map(
    (variant?: Dynamic): Dynamic => ({
      value: fontVariantKey(variant.weight, variant.italic),
      label: fontVariantLabel(variant.weight, variant.italic),
    }),
  );
}
export {
  fontVariantKey,
  fontVariantLabel,
  getAvailableFontVariants,
  includeCurrentFontVariant,
  knownWebFontVariants,
  normalizeFirstFontFamily,
  normalizeFontWeightHundreds,
  parseFontVariantKey,
  resolveFontVariants,
  sortFontVariants,
  TypographyFontVariants100200300Config,
  TypographyFontVariantsFlatMapValue,
  TypographyFontVariantsItems,
  DEFAULT_FONT_VARIANTS as TypographyFontVariantsItems_2,
  TypographyFontVariantsSubscribers,
};
export function installEditorTypographyFontVariants(): () => void {
  return () => {
    TypographyFontVariants100200300Config = {
      100: "Thin",
      200: "Extra light",
      300: "Light",
      400: "Regular",
      500: "Medium",
      600: "Semibold",
      700: "Bold",
      800: "Extra bold",
      900: "Black",
    };
    TypographyFontVariantsItems = [100, 200, 300, 400, 500, 600, 700, 800, 900];
    DEFAULT_FONT_VARIANTS = [
      {
        weight: 400,
        italic: false,
      },
      {
        weight: 400,
        italic: true,
      },
      {
        weight: 700,
        italic: false,
      },
      {
        weight: 700,
        italic: true,
      },
    ];
    TypographyFontVariantsFlatMapValue = TypographyFontVariantsItems.flatMap(
      (weight?: Dynamic): Dynamic => [
        {
          weight: weight,
          italic: false,
        },
        {
          weight: weight,
          italic: true,
        },
      ],
    );
    TypographyFontVariantsSubscribers = new Set(
      TypographyFontCatalogItems.map(
        (font?: Dynamic): Dynamic => font.family.toLowerCase(),
      ),
    );
    sortFontVariants = (variants?: Dynamic): Dynamic =>
      [...variants].sort(
        (left?: Dynamic, right?: Dynamic): Dynamic =>
          left.weight - right.weight ||
          Number(left.italic) - Number(right.italic),
      );
  };
}
