import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactComponentsPropsPanel } from "../components/props-panel";
import { classifyStyleValue, parseCssNumber } from "../css/values";
import { useInspectorContext } from "../inspector/context-part-2";
import { DropShadowEditor } from "./drop-shadow-editor";
import { EffectsSection } from "./effects-section";
import { jsxPropertiesLiveScrub, useStyleCommitScrub } from "./live-scrub";
import { equalStyleBags } from "./style-bag";
import { validateStyleColor } from "../style-schema/color-and-font";
import { styleObjectToCss } from "../style-schema/css";
import { styleFieldBoundsValue, StyleSchemaShadowXYBlurConfig } from "../style-schema/shadow";
import { StyleSchemaValuesLimit } from "../style-schema/values";

var ParagraphValue: Dynamic;
var PropertiesCssEffectsMin: Dynamic;
var PropertiesCssEffectsBoxShadowTextShadowFilterConfig: Dynamic;
var PropertiesCssEffectsBoxShadowFilterBackdropFilterValues: Dynamic;
var PropertiesCssEffectsBoxShadowTextShadowFilterValues: Dynamic;
var ThisTextAlreadyHasAShadowMessage: Dynamic;
var NotOnShapesInsideAGraphicMessage: Dynamic;
var WebkitBackdropFilterValue: Dynamic;
var PropertiesCssEffectsXYBlurConfig: Dynamic;
var PropertiesCssEffectsXYBlurConfig_2: Dynamic;
function useEditorColorSwatches(): Dynamic {
  let { designColorTokens: designColorTokens }: Dynamic = useInspectorContext();
  return (0, reactComponentsPropsPanel.useMemo)(
    (): Dynamic =>
      designColorTokens.map(
        (token?: Dynamic): Dynamic => ({
          name: token.name,
          value: token.value,
          label: token.name.startsWith("#")
            ? token.name.toUpperCase()
            : token.name,
        }),
      ),
    [designColorTokens],
  );
}
function splitEffectTokens(
  source?: Dynamic,
  separatorPattern?: Dynamic,
  keepEmpty: Dynamic = false,
): Dynamic {
  let items: Dynamic = [],
    index: Dynamic = 0,
    text: Dynamic = "";
  for (let char of source as Dynamic) {
    char === "("
      ? index++
      : char === ")" && (index = Math.max(0, index - 1));
    if (index === 0 && separatorPattern.test(char)) {
      (text.trim() || keepEmpty) && items.push(text.trim());
      text = "";
      continue;
    }
    text += char;
  }
  (text.trim() || keepEmpty) && items.push(text.trim());
  return items;
}
function parseCssShadow(shadowText?: Dynamic, allowSpreadAndInset?: Dynamic): Dynamic {
  let hasInset: Dynamic = false,
    lengthsEnded: Dynamic = false,
    lengths: Dynamic = [],
    colorTokensBefore: Dynamic = [],
    colorTokensAfter: Dynamic = [];
  for (let token of splitEffectTokens(shadowText, /\s/) as Dynamic) {
    let parsedLength: Dynamic = parseCssNumber(token);
    if (
      !!parsedLength &&
      (parsedLength.unit === "px" || (parsedLength.unit === "" && parsedLength.value === 0))
    ) {
      if (lengthsEnded || lengths.length >= 4) return null;
      lengths.push(parsedLength.value);
      continue;
    }
    if (parsedLength) return null;
    lengths.length > 0 && (lengthsEnded = true);
    if (token.toLowerCase() === "inset") {
      if (hasInset) return null;
      hasInset = true;
      continue;
    }
    (lengths.length === 0 ? colorTokensBefore : colorTokensAfter).push(token);
  }
  if (
    lengths.length < 2 ||
    (colorTokensBefore.length > 0 && colorTokensAfter.length > 0) ||
    (!allowSpreadAndInset && (hasInset || lengths.length > 3))
  )
    return null;
  let colorText: Dynamic = [...colorTokensBefore, ...colorTokensAfter].join(" "),
    color: Dynamic = validateStyleColor(
      colorText || "currentcolor",
    );
  if (color === undefined) return null;
  let [offsetX, offsetY, blurRadius = 0, spreadRadius = 0]: Dynamic = lengths;
  return !PropertiesCssEffectsMin(
    offsetX,
    StyleSchemaShadowXYBlurConfig.x,
  ) ||
    !PropertiesCssEffectsMin(
      offsetY,
      StyleSchemaShadowXYBlurConfig.y,
    ) ||
    !PropertiesCssEffectsMin(
      blurRadius,
      StyleSchemaShadowXYBlurConfig.blur,
    ) ||
    !PropertiesCssEffectsMin(
      spreadRadius,
      StyleSchemaShadowXYBlurConfig.spread,
    )
    ? null
    : allowSpreadAndInset
      ? hasInset
        ? {
            x: offsetX,
            y: offsetY,
            blur: blurRadius,
            spread: spreadRadius,
            inset: true,
            color: color,
          }
        : {
            x: offsetX,
            y: offsetY,
            blur: blurRadius,
            spread: spreadRadius,
            color: color,
          }
      : {
          x: offsetX,
          y: offsetY,
          blur: blurRadius,
          color: color,
        };
}
function parseCssShadows(shadowText?: Dynamic, allowSpreadAndInset?: Dynamic): Dynamic {
  let trimmedText: Dynamic = (shadowText ?? "").trim();
  if (!trimmedText || trimmedText === "none") return [];
  if (classifyStyleValue(trimmedText).kind !== "literal") return null;
  let shadowTokens: Dynamic = splitEffectTokens(trimmedText, /,/, true);
  if (shadowTokens.length === 0 || shadowTokens.length > StyleSchemaValuesLimit)
    return null;
  let items: Dynamic = [];
  for (let shadowToken of shadowTokens as Dynamic) {
    let parsedShadow: Dynamic =
      shadowToken === "" ? null : parseCssShadow(shadowToken, allowSpreadAndInset);
    if (!parsedShadow) return null;
    items.push(parsedShadow);
  }
  return items;
}
function parseCssBlur(blurText?: Dynamic): Dynamic {
  let trimmedText: Dynamic = (blurText ?? "").trim();
  if (!trimmedText || trimmedText === "none") return {};
  if (classifyStyleValue(trimmedText).kind !== "literal") return null;
  let blurMatch: Dynamic = /^blur\(\s*([^)]+)\)$/i.exec(trimmedText);
  if (!blurMatch) return null;
  let blurValue: Dynamic = parseCssNumber(blurMatch[1].trim());
  return !blurValue ||
    !(blurValue.unit === "px" || (blurValue.unit === "" && blurValue.value === 0)) ||
    !PropertiesCssEffectsMin(blurValue.value, styleFieldBoundsValue.blur)
    ? null
    : {
        blur: blurValue.value,
      };
}
function parseCssFilters(filterText?: Dynamic): Dynamic {
  if (/[^\S \t\n\r\f]/.test(filterText ?? "")) return null;
  let trimmedText: Dynamic = (filterText ?? "").trim();
  if (!trimmedText || trimmedText === "none")
    return {
      shadows: [],
      filter: {},
    };
  if (classifyStyleValue(trimmedText).kind !== "literal") return null;
  let items: Dynamic = [],
    filterTokens: Dynamic = splitEffectTokens(trimmedText, /\s/);
  for (let [tokenIndex, token] of filterTokens.entries() as Dynamic) {
    let dropShadowMatch: Dynamic = /^drop-shadow\(([\s\S]*)\)$/i.exec(token);
    if (!dropShadowMatch) {
      let trailingBlur: Dynamic =
        tokenIndex === filterTokens.length - 1 ? parseCssBlur(token) : null;
      return trailingBlur?.blur === undefined
        ? null
        : {
            shadows: items,
            filter: trailingBlur,
          };
    }
    let parsedShadow: Dynamic =
      items.length < StyleSchemaValuesLimit
        ? parseCssShadow(dropShadowMatch[1], false)
        : null;
    if (!parsedShadow) return null;
    items.push(parsedShadow);
  }
  return {
    shadows: items,
    filter: {},
  };
}
function serializeEffectValue(propName?: Dynamic, effectValue?: Dynamic): Dynamic {
  if (effectValue === undefined) return null;
  let cssValue: Dynamic = styleObjectToCss(
    {
      [propName]: effectValue,
    },
    ParagraphValue,
  )[propName];
  return cssValue === undefined || cssValue === "none" ? null : String(cssValue);
}
function serializeDropShadowFilters(
  shadows?: Dynamic,
  blurFilter?: Dynamic,
): Dynamic {
  let serializedShadows: Dynamic = (Array.isArray(shadows) ? shadows : []).map(
    (shadow?: Dynamic): Dynamic =>
      serializeEffectValue("textShadow", [shadow]),
  );
  if (serializedShadows.some((serialized?: Dynamic): Dynamic => serialized === null)) return [];
  let serializedBlur: Dynamic = serializeEffectValue("filter", blurFilter),
    items: Dynamic = [
      ...serializedShadows.map((serialized?: Dynamic): Dynamic => `drop-shadow(${serialized})`),
      ...(serializedBlur !== null ? [serializedBlur] : []),
    ];
  return [
    {
      prop: "filter",
      value: items.length > 0 ? items.join(" ") : null,
    },
  ];
}
function CssEffectsSection({
  rows: rows,
  shadowTarget = "box",
  dropShadowReason: dropShadowReason,
  onCommitMany: onCommitMany,
  renderRows: renderRows,
  addItemsFor: addItemsFor,
  fallback: fallback,
}: Dynamic): Dynamic {
  useUiLocale();
  let colorSwatches: Dynamic = useEditorColorSwatches(),
    rowsByProp: Dynamic = new Map(
      rows.map((row?: Dynamic): Dynamic => [row.prop, row]),
    ),
    isTextTarget: Dynamic = shadowTarget === "text",
    isShapeTarget: Dynamic = shadowTarget === "shape",
    boxShadowRow: Dynamic = rowsByProp.get("box-shadow"),
    textShadowRow: Dynamic = rowsByProp.get("text-shadow"),
    isUnparsableRow: Dynamic = (row?: Dynamic): Dynamic =>
      !!row && (row.mixed === true || row.varSource !== undefined),
    shapeFilters: Dynamic =
      isShapeTarget && !isUnparsableRow(rowsByProp.get("filter"))
        ? parseCssFilters(rowsByProp.get("filter")?.value)
        : null,
    parsedEffects: Dynamic = {
      boxShadow: isShapeTarget
        ? []
        : isUnparsableRow(boxShadowRow)
          ? null
          : parseCssShadows(boxShadowRow?.value, true),
      filter: isShapeTarget
        ? (shapeFilters?.filter ?? null)
        : isUnparsableRow(rowsByProp.get("filter"))
          ? null
          : parseCssBlur(rowsByProp.get("filter")?.value),
      backdropFilter: isShapeTarget
        ? {}
        : isUnparsableRow(rowsByProp.get("backdrop-filter"))
          ? null
          : parseCssBlur(rowsByProp.get("backdrop-filter")?.value),
      textShadow: isShapeTarget
        ? (shapeFilters?.shadows ?? null)
        : isUnparsableRow(textShadowRow)
          ? null
          : parseCssShadows(textShadowRow?.value, false),
    },
    isTextShadowUnparsable: Dynamic = parsedEffects.textShadow === null,
    usesTextShadowProp: Dynamic = (isTextTarget || isShapeTarget) && !isTextShadowUnparsable,
    effectKeys: Dynamic = usesTextShadowProp
      ? PropertiesCssEffectsBoxShadowTextShadowFilterValues
      : PropertiesCssEffectsBoxShadowFilterBackdropFilterValues,
    scrub: Dynamic = useStyleCommitScrub(
      (commits?: Dynamic): Dynamic => onCommitMany(commits),
    ),
    liveValuesRef: Dynamic = (0, reactComponentsPropsPanel.useRef)({}),
    [openEditor, setOpenEditor]: Dynamic = (0,
    reactComponentsPropsPanel.useState)(undefined),
    isTextEditorOpen: Dynamic = openEditor?.key === "textShadow",
    setTextEditorOpen: Dynamic = (isOpen?: Dynamic): Dynamic =>
      setOpenEditor(
        (current?: Dynamic): Dynamic =>
          isOpen
            ? {
                key: "textShadow",
                index: 0,
              }
            : current?.key === "textShadow"
              ? undefined
              : current,
      );
  if (
    parsedEffects.boxShadow === null ||
    parsedEffects.filter === null ||
    parsedEffects.backdropFilter === null
  )
    return (
      <jsxPropertiesLiveScrub.Fragment>
        {fallback}
      </jsxPropertiesLiveScrub.Fragment>
    );
  let cannotEditTextShadow: Dynamic =
      !usesTextShadowProp && (parsedEffects.textShadow === null || parsedEffects.textShadow.length > 1),
    effectBag: Dynamic = {
      ...(parsedEffects.boxShadow.length > 0
        ? {
            boxShadow: parsedEffects.boxShadow,
          }
        : {}),
      ...(usesTextShadowProp && parsedEffects.textShadow && parsedEffects.textShadow.length > 0
        ? {
            textShadow: parsedEffects.textShadow,
          }
        : {}),
      ...(parsedEffects.filter.blur !== undefined
        ? {
            filter: parsedEffects.filter,
          }
        : {}),
      ...(parsedEffects.backdropFilter.blur !== undefined
        ? {
            backdropFilter: parsedEffects.backdropFilter,
          }
        : {}),
    },
    toCommits: Dynamic = (nextBagInput?: Dynamic): Dynamic => {
      let commits: Dynamic = [],
        currentBag: Dynamic = effectBag,
        nextBag: Dynamic = nextBagInput ?? {},
        hasChanged: Dynamic = (effectKey?: Dynamic): Dynamic =>
          !equalStyleBags(
            nextBag[effectKey],
            effectKey in liveValuesRef.current
              ? liveValuesRef.current[effectKey]
              : currentBag[effectKey],
          );
      for (let effectKey of effectKeys as Dynamic) {
        if (
          !hasChanged(effectKey) ||
          (isShapeTarget && (effectKey === "textShadow" || effectKey === "filter"))
        )
          continue;
        let serialized: Dynamic = serializeEffectValue(
          effectKey,
          nextBag[effectKey],
        );
        commits.push({
          prop: PropertiesCssEffectsBoxShadowTextShadowFilterConfig[effectKey],
          value: serialized,
        });
        effectKey === "backdropFilter" &&
          commits.push({
            prop: WebkitBackdropFilterValue,
            value: serialized,
          });
      }
      isShapeTarget &&
        (hasChanged("textShadow") || hasChanged("filter")) &&
        commits.push(
          ...serializeDropShadowFilters(nextBag.textShadow, nextBag.filter),
        );
      return commits;
    },
    isNoneRow: Dynamic = (row?: Dynamic): Dynamic =>
      (row.value ?? "").trim().toLowerCase() === "none",
    isShapeOwnedRow: Dynamic = (row?: Dynamic): Dynamic =>
      isShapeTarget &&
      ["box-shadow", "backdrop-filter", "text-shadow"].includes(row.prop),
    visibleRows: Dynamic = rows.filter(
      (row?: Dynamic): Dynamic =>
        isShapeOwnedRow(row)
          ? !!row.value || row.mixed === true
          : ["box-shadow", "filter", "backdrop-filter"].includes(row.prop)
            ? isNoneRow(row)
            : row.prop === "text-shadow"
              ? cannotEditTextShadow || isNoneRow(row)
              : true,
    ),
    singleTextShadow: Dynamic = usesTextShadowProp || cannotEditTextShadow ? undefined : parsedEffects.textShadow?.[0],
    commitTextShadow: Dynamic = (shadow?: Dynamic): Dynamic => {
      let serialized: Dynamic = shadow
        ? serializeEffectValue("textShadow", [shadow])
        : null;
      (shadow && serialized === null) ||
        onCommitMany([
          {
            prop: "text-shadow",
            value: serialized,
          },
        ]);
    },
    items: Dynamic = [
      ...(textShadowRow && !isTextTarget && !isShapeTarget && !cannotEditTextShadow && !singleTextShadow
        ? [
            {
              get label() { return uiMessage("inspector.cssEffects.textShadow"); },
              disabled: textShadowRow.disabled,
              disabledReason: textShadowRow.disabled
                ? textShadowRow.whyDisabled
                : undefined,
              onSelect: (): Dynamic => {
                setTextEditorOpen(true);
                commitTextShadow(PropertiesCssEffectsXYBlurConfig);
              },
            },
          ]
        : []),
      ...addItemsFor(visibleRows),
    ];
  return (
    <EffectsSection
      kind={ParagraphValue}
      bag={effectBag}
      shadowTarget={isShapeTarget ? "text" : shadowTarget}
      silhouette={isShapeTarget}
      silhouetteReason={isShapeTarget ? NotOnShapesInsideAGraphicMessage : undefined}
      dropShadowDisabledReason={
        dropShadowReason ??
        (isTextTarget && isTextShadowUnparsable ? ThisTextAlreadyHasAShadowMessage : undefined)
      }
      openEditor={openEditor}
      setOpenEditor={setOpenEditor}
      unifiedColorPopover={true}
      swatches={colorSwatches}
      onCommit={(nextBag?: Dynamic): Dynamic => {
        let commits: Dynamic = toCommits(nextBag);
        liveValuesRef.current = {};
        commits.length > 0 && onCommitMany(commits);
      }}
      onLive={(liveBag?: Dynamic): Dynamic => {
        let commits: Dynamic = toCommits(liveBag);
        for (let effectKey of effectKeys as Dynamic)
          liveValuesRef.current[effectKey] = liveBag?.[effectKey];
        commits.length > 0 && scrub.onScrub(commits);
      }}
      onLiveEnd={(): Dynamic => {
        liveValuesRef.current = {};
        scrub.onScrubEnd();
      }}
      addItems={items}
    >
      {textShadowRow && singleTextShadow !== undefined && (<DropShadowEditor
          value={singleTextShadow}
          open={isTextEditorOpen}
          onOpenChange={setTextEditorOpen}
          disabled={textShadowRow.disabled}
          onChange={commitTextShadow}
          onLive={(liveShadow?: Dynamic): Dynamic => {
            let serialized: Dynamic = serializeEffectValue("textShadow", [
                liveShadow,
              ]),
              previousSerialized: Dynamic =
                "textShadow" in liveValuesRef.current
                  ? liveValuesRef.current.textShadow
                  : (textShadowRow.value ?? null);
            liveValuesRef.current.textShadow = serialized;
            serialized !== null &&
              serialized !== previousSerialized &&
              scrub.onScrub([
                {
                  prop: "text-shadow",
                  value: serialized,
                },
              ]);
          }}
          onLiveEnd={(): Dynamic => {
            liveValuesRef.current = {};
            scrub.onScrubEnd();
          }}
        />)}
      {renderRows(visibleRows)}
    </EffectsSection>
  );
}
export {
  CssEffectsSection,
  NotOnShapesInsideAGraphicMessage,
  ParagraphValue,
  parseCssBlur,
  parseCssFilters,
  parseCssShadow,
  parseCssShadows,
  PropertiesCssEffectsBoxShadowFilterBackdropFilterValues,
  PropertiesCssEffectsBoxShadowTextShadowFilterConfig,
  PropertiesCssEffectsBoxShadowTextShadowFilterValues,
  PropertiesCssEffectsMin,
  PropertiesCssEffectsXYBlurConfig,
  PropertiesCssEffectsXYBlurConfig_2,
  serializeDropShadowFilters,
  serializeEffectValue,
  splitEffectTokens,
  ThisTextAlreadyHasAShadowMessage,
  useEditorColorSwatches,
  WebkitBackdropFilterValue,
};
export function installEditorPropertiesCssEffects(): () => void {
  return () => {
    ParagraphValue = "paragraph";
    PropertiesCssEffectsMin = (candidate?: Dynamic, bounds?: Dynamic): Dynamic =>
      candidate >= bounds.min &&
      candidate <= bounds.max &&
      Math.round(candidate * 10) / 10 === candidate;
    PropertiesCssEffectsBoxShadowTextShadowFilterConfig = {
      boxShadow: "box-shadow",
      textShadow: "text-shadow",
      filter: "filter",
      backdropFilter: "backdrop-filter",
    };
    PropertiesCssEffectsBoxShadowFilterBackdropFilterValues = [
      "boxShadow",
      "filter",
      "backdropFilter",
    ];
    PropertiesCssEffectsBoxShadowTextShadowFilterValues = [
      "boxShadow",
      "textShadow",
      "filter",
      "backdropFilter",
    ];
    ThisTextAlreadyHasAShadowMessage =
      uiMessage("inspector.cssEffects.thisTextAlreadyHasA");
    NotOnShapesInsideAGraphicMessage = uiMessage("inspector.cssEffects.notOnShapesInsideA");
    WebkitBackdropFilterValue = "-webkit-backdrop-filter";
    PropertiesCssEffectsXYBlurConfig = {
      x: 0,
      y: 1,
      blur: 3,
      color: "#00000033",
    };
    PropertiesCssEffectsXYBlurConfig_2 = {
      x: {
        ...StyleSchemaShadowXYBlurConfig.x,
        step: 1,
      },
      y: {
        ...StyleSchemaShadowXYBlurConfig.y,
        step: 1,
      },
      blur: {
        ...StyleSchemaShadowXYBlurConfig.blur,
        step: 1,
      },
    };
  };
}
