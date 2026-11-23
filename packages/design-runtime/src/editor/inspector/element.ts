import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { parseStyleDeclarations } from "../css/declarations";
import { expandCssDeclarations } from "../css/shorthand";
import { classifyStyleValue, replaceCssVariables } from "../css/values";
import { getPropertySpecification, hasTextBackgroundClip, InspectorPropertySchemaBackgroundFontWeightFontStyleConfig, InspectorPropertySchemaCursorPointerEventsObjectFitValues, InspectorPropertySchemaItems, propertySpecifications as propertySpecs } from "./property-schema";
import { orderInspectorSections, resolveInspectorInheritedValues } from "./selection";
import { cssPropertyToComputedKey, formatPropertyKey, hasVisiblePaint, InspectorStyleMetadataBackgroundColorPattern, InspectorStyleMetadataDataDcTplStyleSet, InspectorStyleMetadataInputTextareaButtonSet, InspectorStyleMetadataLabel, InspectorStyleMetadataLineHeightTextAlignSet, InspectorStyleMetadataStrokeStrokeWidthFillValues, InspectorStyleMetadataSubscribers, intrinsicContentTags as nonContainerTags, InspectorStyleMetadataTextTspanTextpathSet, isTransparentColor, svgShapeTags } from "./style-metadata";
import { arrowHeadPropertyRows } from "../svg/arrow-properties";
import { firstFontFamily } from "../typography/font-family";
import { getAvailableFontVariants, resolveFontVariants } from "../typography/font-variants";
import { sanitizeCssBackground } from "../../platform/css-sanitization";

function getElementInspector(
  element?: Dynamic,
  inspectorOptions: Dynamic = {},
): Dynamic {
  let declarations: Dynamic = expandCssDeclarations(
      parseStyleDeclarations(element.authoredStyle),
    ),
    authoredValues: Dynamic = new Map();
  for (let declaration of declarations as Dynamic)
    authoredValues.set(declaration.prop, declaration.value);
  let computedValue: Dynamic = (propName?: Dynamic): Dynamic =>
      element.computed[cssPropertyToComputedKey(propName)] ?? "",
    resolveCssVariables: Dynamic = (rawValue?: Dynamic): Dynamic => {
      if (!rawValue || !rawValue.includes("var("))
        return {
          value: rawValue,
        };
      let resolvedValue: Dynamic = replaceCssVariables(
        rawValue,
        element.varValues ?? {},
      );
      return resolvedValue != null && resolvedValue !== rawValue
        ? {
            value: resolvedValue,
            varSource: rawValue,
          }
        : {
            value: rawValue,
          };
    },
    buildPropertyRow: Dynamic = (propName?: Dynamic): Dynamic => {
      let propertySpec: Dynamic = getPropertySpecification(propName);
      return {
        prop: propName,
        label: propertySpec?.label ?? propName,
        spec: propertySpec,
        ...resolveCssVariables(authoredValues.get(propName) ?? null),
        fallback: computedValue(propName) || propertySpec?.defaultValue || "",
        disabled: element.disabled,
      };
    },
    sections: Dynamic = [],
    objectFitRow: Dynamic = {
      prop: "object-fit",
      get label() { return uiMessage("inspector.element.fit"); },
      spec: {
        prop: "object-fit",
        get label() { return uiMessage("inspector.element.fit"); },
        editor: "select",
        section: "advanced",
        options: ["fill", "contain", "cover", "none", "scale-down"],
      },
      value: authoredValues.get("object-fit") ?? null,
      fallback: computedValue("object-fit"),
      disabled: element.disabled,
    };
  element.tag === "img" &&
    sections.push({
      id: "image",
      get title() { return uiMessage("inspector.element.image"); },
      rows: [
        {
          prop: "@src",
          get label() { return uiMessage("inspector.element.source"); },
          spec: {
            prop: "@src",
            get label() { return uiMessage("inspector.element.source"); },
            editor: "image",
            section: "advanced",
          },
          value: element.attrs.src ?? null,
          disabled: element.disabled,
        },
        objectFitRow,
      ],
    });
  let buildAttributeRow: Dynamic = (
      attrName?: Dynamic,
      label?: Dynamic,
      editor?: Dynamic,
      attrConfig?: Dynamic,
    ): Dynamic => ({
      prop: `@${attrName}`,
      label: label,
      spec: {
        prop: `@${attrName}`,
        label: label,
        editor: editor,
        section: "advanced",
        ...(attrConfig?.options
          ? {
              options: attrConfig.options,
            }
          : {}),
      },
      value: element.attrs[attrName] ?? null,
      hint: attrConfig?.placeholder,
      disabled: element.disabled,
    }),
    opensInNewTab: Dynamic = false;
  if (element.tag === "a") {
    let isDynamicValue: Dynamic = (rawValue?: Dynamic): Dynamic => {
        let kind: Dynamic = classifyStyleValue(rawValue).kind;
        return kind === "template" || kind === "var";
      },
      target: Dynamic = element.attrs.target,
      canEditTarget: Dynamic = !isDynamicValue(target),
      rel: Dynamic = element.attrs.rel,
      canEditRel: Dynamic = !isDynamicValue(rel),
      securityRelTokens: Dynamic = ["noopener", "noreferrer"],
      relTokens: Dynamic = (rel ?? "").trim().split(/\s+/).filter(Boolean),
      lowerRelTokens: Dynamic = relTokens.map(
        (token?: Dynamic): Dynamic => token.toLowerCase(),
      ),
      relWithSecurity: Dynamic = [
        ...relTokens,
        ...securityRelTokens.filter(
          (token?: Dynamic): Dynamic => !lowerRelTokens.includes(token),
        ),
      ].join(" "),
      relWithoutSecurity: Dynamic = relTokens.filter(
        (token?: Dynamic): Dynamic => !securityRelTokens.includes(token.toLowerCase()),
      ),
      linkRows: Dynamic = [
        buildAttributeRow("href", "Destination", "string", {
          placeholder: "https://\u2026",
        }),
      ];
    canEditTarget &&
      ((opensInNewTab = target == null || target.trim().toLowerCase() === "_blank"),
      linkRows.push({
        prop: "@target",
        get label() { return uiMessage("inspector.element.openInNewTab"); },
        spec: {
          prop: "@target",
          get label() { return uiMessage("inspector.element.openInNewTab"); },
          editor: "bool",
          section: "advanced",
          boolOnValue: "_blank",
        },
        value: target ?? null,
        disabled: element.disabled,
        ...(canEditRel
          ? {
              alsoCommit: [
                {
                  prop: "@rel",
                  value: relWithSecurity,
                },
              ],
              alsoCommitOnClear: [
                {
                  prop: "@rel",
                  value: relWithoutSecurity.length ? relWithoutSecurity.join(" ") : null,
                },
              ],
            }
          : {}),
      }));
    sections.push({
      id: "link",
      get title() { return uiMessage("inspector.element.link"); },
      rows: linkRows,
    });
  }
  (element.tag === "video" || element.tag === "iframe") &&
    sections.push({
      id: "media",
      get title() { return element.tag === "video" ? (uiMessage("inspector.element.video")) : ("Embed"); },
      rows: [
        buildAttributeRow("src", "Source", "string", {
          placeholder: "https://\u2026",
        }),
        ...(element.tag === "video" ? [objectFitRow] : []),
      ],
    });
  if (element.tag === "ul" || element.tag === "ol") {
    let isOrderedList: Dynamic = element.tag === "ol";
    sections.push({
      id: "list",
      get title() { return uiMessage("inspector.element.list"); },
      rows: [
        {
          prop: "list-style-type",
          get label() { return uiMessage("inspector.element.style"); },
          spec: {
            prop: "list-style-type",
            get label() { return uiMessage("inspector.element.style"); },
            editor: "select",
            section: "advanced",
            options: isOrderedList
              ? [
                  "decimal",
                  "lower-alpha",
                  "lower-roman",
                  "upper-alpha",
                  "none",
                ]
              : ["disc", "circle", "square", "none"],
            optionLabels: isOrderedList
              ? {
                  decimal: "1",
                  "lower-alpha": "a",
                  "lower-roman": "i",
                  "upper-alpha": "A",
                  none: "\u2013",
                }
              : {
                  disc: "\u2022",
                  circle: "\u25CB",
                  square: "\u25AA",
                  none: "\u2013",
                },
          },
          ...resolveCssVariables(authoredValues.get("list-style-type") ?? null),
          fallback: computedValue("list-style-type"),
          disabled: element.disabled,
        },
      ],
    });
  }
  if (element.tag === "hr") {
    let buildBorderRow: Dynamic = (
      propName?: Dynamic,
      label?: Dynamic,
      editor?: Dynamic,
      extraSpec: Dynamic = {},
    ): Dynamic => ({
      prop: propName,
      label: label,
      spec: {
        prop: propName,
        label: label,
        editor: editor,
        section: "border",
        ...extraSpec,
      },
      ...resolveCssVariables(authoredValues.get(propName) ?? null),
      fallback: computedValue(propName),
      disabled: element.disabled,
    });
    sections.push({
      id: "divider",
      get title() { return uiMessage("inspector.element.divider"); },
      rows: [
        buildBorderRow("border-top-width", "Thickness", "number", {
          unit: "px",
          min: 0,
        }),
        buildBorderRow("border-top-color", "Color", "color"),
        buildBorderRow("border-top-style", "Style", "select", {
          options: ["solid", "dashed", "dotted", "double"],
        }),
      ],
    });
  }
  let containerTags: Dynamic = new Set([
      "ul",
      "ol",
      "dl",
      "table",
      "thead",
      "tbody",
      "tfoot",
      "tr",
    ]),
    hasEditableText: Dynamic =
      element.text != null &&
      !containerTags.has(element.tag) &&
      element.tag !== "textarea",
    contentRow: Dynamic =
      hasEditableText && element.canvasEditable === false
        ? {
            prop: "__text",
            get label() { return uiMessage("inspector.element.content"); },
            value: element.text,
            disabled: element.disabled,
          }
        : null,
    isSvgShape: Dynamic = svgShapeTags.has(element.tag),
    isUnfilledSvg: Dynamic =
      (element.tag === "svg" &&
        (authoredValues.get("fill") ?? computedValue("fill")) === "none") ||
      (isSvgShape &&
        (element.attrs.fill ?? element.computed.fill ?? "").toLowerCase() ===
          "none"),
    isSvgText: Dynamic = InspectorStyleMetadataTextTspanTextpathSet.has(
      element.tag,
    ),
    isSvgPaintTarget: Dynamic = isUnfilledSvg || isSvgShape || isSvgText,
    svgPaintProp: Dynamic = (propName?: Dynamic): Dynamic =>
      inspectorOptions.cssPaint?.has(propName)
        ? propName
        : formatPropertyKey(
            propName,
            (attrName?: Dynamic): Dynamic => authoredValues.get(attrName),
          );
  if (element.tag === "svg") {
    let buildStrokeRow: Dynamic = (
      propName?: Dynamic,
      label?: Dynamic,
      editor?: Dynamic,
    ): Dynamic => ({
      prop: propName,
      label: label,
      spec: {
        prop: propName,
        label: label,
        editor: editor,
        section: "stroke",
        ...(editor === "number"
          ? {
              unit: "px",
              min: 0,
            }
          : {}),
      },
      ...resolveCssVariables(authoredValues.get(propName) ?? null),
      fallback: computedValue(propName),
      disabled: element.disabled,
    });
    sections.push({
      id: "svgPaint",
      get title() { return isUnfilledSvg ? (uiMessage("inspector.element.stroke")) : (uiMessage("inspector.element.fillStroke")); },
      rows: [
        ...(isUnfilledSvg ? [] : [buildStrokeRow("fill", "Fill", "color")]),
        buildStrokeRow("stroke", isUnfilledSvg ? "Color" : "Stroke", "color"),
        buildStrokeRow("stroke-width", "Thickness", "number"),
        ...arrowHeadPropertyRows(element),
      ],
    });
  }
  let isFormControl: Dynamic =
      InspectorStyleMetadataInputTextareaButtonSet.has(element.tag),
    inputType: Dynamic = (element.attrs.type ?? "text").toLowerCase(),
    isCheckable: Dynamic =
      element.tag === "input" && (inputType === "checkbox" || inputType === "radio"),
    isTextLikeInput: Dynamic =
      element.tag === "input" &&
      [
        "text",
        "search",
        "email",
        "password",
        "number",
        "tel",
        "url",
        "date",
        "time",
        "datetime-local",
        "month",
        "week",
      ].includes(inputType),
    handledAttrs: Dynamic = new Set();
  if (isFormControl) {
    let buildControlRow: Dynamic = (
        attrName?: Dynamic,
        label?: Dynamic,
        editor?: Dynamic,
        choices?: Dynamic,
      ): Dynamic => (
        handledAttrs.add(attrName),
        {
          prop: `@${attrName}`,
          label: label,
          spec: {
            prop: `@${attrName}`,
            label: label,
            editor: editor,
            section: "advanced",
            ...(choices
              ? {
                  options: choices,
                }
              : {}),
          },
          value: element.attrs[attrName] ?? null,
          disabled: element.disabled,
        }
      ),
      controlRows: Dynamic = [];
    ((element.tag === "input" && !isCheckable) || element.tag === "textarea") &&
      controlRows.push(buildControlRow("placeholder", "Placeholder", "string"));
    element.tag === "input" &&
      classifyStyleValue(element.attrs.type ?? "").kind ===
        "literal" &&
      handledAttrs.add("type");
    if (isCheckable) {
      let checked: Dynamic = element.attrs.checked,
        isCheckedLiteral: Dynamic =
          checked == null ||
          checked === "" ||
          classifyStyleValue(checked).kind === "literal";
      isCheckedLiteral && handledAttrs.add("checked");
      isCheckedLiteral &&
        controlRows.push({
          prop: "@checked",
          get label() { return uiMessage("inspector.element.checked"); },
          spec: {
            prop: "@checked",
            get label() { return uiMessage("inspector.element.checked"); },
            editor: "bool",
            section: "advanced",
            boolOnValue: "checked",
          },
          value: "checked" in element.attrs ? "checked" : null,
          disabled: element.disabled,
        });
    } else
      element.tag === "input" &&
        controlRows.push(buildControlRow("value", uiMessage("inspector.element.prefilledText"), "string"));
    element.tag === "textarea" &&
      controlRows.push({
        prop: "__text",
        get label() { return uiMessage("inspector.element.prefilledText"); },
        value: element.text,
        disabled: element.disabled,
      });
    element.tag === "button" &&
      controlRows.push(
        buildControlRow("type", "Type", "select", ["button", "submit", "reset"]),
      );
    controlRows.length &&
      sections.push({
        id: "control",
        get title() { return uiMessage("inspector.element.control"); },
        rows: controlRows,
      });
  }
  let strokeRows: Dynamic = [];
  if (svgShapeTags.has(element.tag)) {
    let buildShapeStrokeRow: Dynamic = (
        propName?: Dynamic,
        label?: Dynamic,
        editor?: Dynamic,
        choices?: Dynamic,
      ): Dynamic => {
        let resolvedProp: Dynamic = svgPaintProp(propName);
        return {
          prop: resolvedProp,
          label: label,
          spec: {
            prop: resolvedProp,
            label: label,
            editor: editor,
            section: "stroke",
            ...(editor === "number"
              ? {
                  unit: "",
                  min: 0,
                  step: 0.5,
                  scrub: 0.5,
                }
              : {}),
            ...(choices
              ? {
                  options: choices,
                }
              : {}),
          },
          ...(resolvedProp === propName
            ? resolveCssVariables(authoredValues.get(propName) ?? element.attrs[propName] ?? null)
            : {
                value: element.attrs[propName] ?? null,
              }),
          ...(inspectorOptions.cssPaint?.has(propName)
            ? {
                alsoCommitOnClear: [
                  {
                    prop: `@${propName}`,
                    value: null,
                  },
                ],
              }
            : {}),
          fallback: computedValue(propName),
          disabled: element.disabled,
        };
      },
      fillValueRaw: Dynamic = resolveCssVariables(authoredValues.get("fill") ?? null).value,
      fillValue: Dynamic = fillValueRaw?.includes("var(")
        ? element.computed.fill
        : (fillValueRaw ?? element.attrs.fill ?? element.computed.fill),
      hasVisibleFill: Dynamic = !/^none\b/i.test((fillValue ?? "").trim());
    strokeRows = [
      buildShapeStrokeRow("stroke", hasVisibleFill ? "Stroke" : "Color", "color"),
      buildShapeStrokeRow("stroke-width", "Thickness", "number"),
      ...arrowHeadPropertyRows(element),
      ...(hasVisibleFill ? [buildShapeStrokeRow("fill", "Fill", "color")] : []),
      buildShapeStrokeRow("stroke-linecap", "Cap", "select", [
        "butt",
        "round",
        "square",
      ]),
    ];
    sections.push({
      id: "stroke",
      get title() { return hasVisibleFill ? (uiMessage("inspector.element.fillStroke")) : (uiMessage("inspector.element.stroke")); },
      rows: strokeRows,
    });
  }
  let position: Dynamic = (
      authoredValues.get("position") ||
      element.computed.position ||
      "static"
    ).toLowerCase(),
    display: Dynamic = (
      authoredValues.get("display") ||
      element.computed.display ||
      ""
    ).toLowerCase(),
    isFlex: Dynamic = display.includes("flex"),
    isGrid: Dynamic = display.includes("grid"),
    valueOnlyProps: Dynamic = new Set([
      "background",
      "border-radius",
      "border-top-left-radius",
      "border-top-right-radius",
      "border-bottom-right-radius",
      "border-bottom-left-radius",
      "overflow",
      "text-shadow",
      "flex-grow",
      "align-self",
      "position",
      "min-width",
      "max-width",
      "min-height",
      "max-height",
    ]),
    hasInlineTextClip: Dynamic = hasTextBackgroundClip(
      (propName?: Dynamic): Dynamic => authoredValues.get(propName),
    ),
    isTextClipped: Dynamic =
      !isSvgText &&
      (hasInlineTextClip ||
        hasTextBackgroundClip(
          (propName?: Dynamic): Dynamic =>
            propName === "background-clip"
              ? element.computed.backgroundClip
              : element.computed.webkitBackgroundClip,
        )),
    inlineColor: Dynamic = (authoredValues.get("color") ?? "").trim().toLowerCase(),
    backgroundImage: Dynamic = isTextClipped
      ? sanitizeCssBackground(
          element.computed.backgroundImage ?? "",
        )
      : "transparent",
    gradientLayer: Dynamic =
      /^(?:repeating-)?(?:linear|radial|conic)-gradient\(/i.test(backgroundImage)
        ? backgroundImage
        : undefined,
    textFillState: Dynamic = {
      clipped: isTextClipped,
      inlineClip: hasInlineTextClip,
      layer: resolveCssVariables(
        authoredValues.get("background-image") ?? authoredValues.get("background") ?? null,
      ).value,
      ...(gradientLayer !== undefined
        ? {
            computedLayer: gradientLayer,
          }
        : {}),
      size: authoredValues.get("background-size") ?? null,
      ...(isTransparentColor(inlineColor)
        ? {
            transparentInk: "inline",
          }
        : isTransparentColor(
              (element.computed.color ?? "").trim().toLowerCase(),
            )
          ? {
              transparentInk: "computed",
            }
          : {}),
    },
    buildInspectorRow: Dynamic = (propertySpec?: Dynamic): Dynamic => {
      let row: Dynamic = buildPropertyRow(propertySpec.prop);
      propertySpec.prop === "color" &&
        (isTextClipped ||
          (element.textual ??
            InspectorStyleMetadataSubscribers.has(element.tag))) &&
        (row.textFill = textFillState);
      propertySpec.prop === "text-shadow" &&
        isTextClipped &&
        !row.value &&
        ((row.disabled = true),
        (row.whyDisabled = InspectorStyleMetadataLabel));
      propertySpec.prop === "width" && isTextLikeInput && (row.noHug = true);
      if (propertySpec.prop === "backdrop-filter" && !row.value) {
        let webkitBackdropFilter: Dynamic = resolveCssVariables(
          authoredValues.get("-webkit-backdrop-filter") ?? null,
        );
        webkitBackdropFilter.value && Object.assign(row, webkitBackdropFilter);
      }
      if (propertySpec.prop === "background") {
        let backgroundColorValue: Dynamic = resolveCssVariables(
          authoredValues.get("background-color") ?? null,
        );
        row.companionValue = backgroundColorValue.value;
        backgroundColorValue.varSource !== undefined &&
          (row.companionVarSource = backgroundColorValue.varSource);
        row.fallback = element.computed.backgroundColor ?? "";
        isTextClipped &&
          ((row.disabled = true),
          (row.whyDisabled =
            uiMessage("inspector.element.thisBackgroundFillsTheText")));
      }
      propertySpec.prop === "font-style" &&
        ((row.companionValue = resolveCssVariables(
          authoredValues.get("text-decoration-line") ?? null,
        ).value),
        (row.companionFallback =
          element.computed.textDecorationLine ?? ""));
      if (propertySpec.prop === "font-weight") {
        row.companionValue = resolveCssVariables(
          authoredValues.get("font-style") ?? null,
        ).value;
        row.companionFallback = element.computed.fontStyle ?? "";
        let fontFamilyValue: Dynamic =
            resolveCssVariables(authoredValues.get("font-family") ?? null).value ?? "",
          literalFontFamily: Dynamic =
            classifyStyleValue(fontFamilyValue).kind === "literal" &&
            !/^(?:inherit|initial|unset|revert|revert-layer)\b/i.test(
              fontFamilyValue.trim(),
            )
              ? fontFamilyValue
              : "",
          primaryFontFamily: Dynamic = firstFontFamily(
            literalFontFamily || element.computed.fontFamily || "",
          );
        row.faces = resolveFontVariants(
          primaryFontFamily,
          getAvailableFontVariants(
            element.fontFaces ?? [],
            primaryFontFamily,
          ),
        );
      }
      (propertySpec.prop === "justify-content" || propertySpec.prop === "align-items") &&
        (row.flexDirection =
          authoredValues.get("flex-direction") ||
          element.computed.flexDirection ||
          "row");
      position === "static" &&
        ["top", "left", "bottom", "right"].includes(propertySpec.prop) &&
        (row.alsoCommit = [
          {
            prop: "position",
            value: "relative",
          },
        ]);
      element.tag === "select" &&
        (authoredValues.get("appearance") ?? "").trim() === "" &&
        (authoredValues.get("-webkit-appearance") ?? "").trim() === "" &&
        (propertySpec.prop === "background" ||
          propertySpec.section === "border" ||
          propertySpec.section === "borderSides") &&
        (row.alsoCommit = [
          {
            prop: "appearance",
            value: "base-select",
          },
        ]);
      return row;
    },
    rowsForSection: Dynamic = (sectionName?: Dynamic): Dynamic =>
      propertySpecs.filter(
        (propertySpec?: Dynamic): Dynamic => propertySpec.section === sectionName,
      ).map(buildInspectorRow),
    hasValue: Dynamic = (row?: Dynamic): Dynamic =>
      !!row && row.value != null && row.value !== "",
    staleRows: Dynamic = [],
    addStaleRow: Dynamic = (row?: Dynamic): Dynamic => {
      let companionProp: Dynamic = Object.hasOwn(
          InspectorPropertySchemaBackgroundFontWeightFontStyleConfig,
          row.prop,
        )
          ? InspectorPropertySchemaBackgroundFontWeightFontStyleConfig[
              row.prop
            ]
          : undefined,
        hasOrphanCompanionValue: Dynamic =
          row.companionValue != null &&
          row.companionValue !== "" &&
          !(companionProp && getPropertySpecification(companionProp));
      (hasValue(row) || hasOrphanCompanionValue) &&
        staleRows.push({
          ...row,
          stale: true,
        });
    },
    isPlainTextTag: Dynamic =
      !(sections.length > 0) &&
      InspectorStyleMetadataSubscribers.has(element.tag),
    inlineDisplay: Dynamic = (authoredValues.get("display") ?? "").trim().toLowerCase(),
    showsLayoutControls: Dynamic =
      !nonContainerTags.has(element.tag) &&
      (!isPlainTextTag ||
        isFlex ||
        isGrid ||
        inlineDisplay === "block" ||
        inlineDisplay === "flex" ||
        inlineDisplay === "grid"),
    isTextual: Dynamic =
      element.textual ??
      InspectorStyleMetadataSubscribers.has(element.tag),
    typographyRows: Dynamic = isSvgText
      ? ((rows?: Dynamic): Dynamic =>
          rows.flatMap((row?: Dynamic): Dynamic => {
            if (
              row.prop !== "color" &&
              !InspectorStyleMetadataLineHeightTextAlignSet.has(
                row.prop,
              )
            )
              return [row];
            let rowWithoutTextFill: Dynamic = {
              ...row,
            };
            delete rowWithoutTextFill.textFill;
            addStaleRow(rowWithoutTextFill);
            return row.prop !== "color"
              ? []
              : [
                  {
                    prop: "fill",
                    get label() { return uiMessage("inspector.element.color"); },
                    spec: {
                      prop: "fill",
                      get label() { return uiMessage("inspector.element.color"); },
                      editor: "color",
                      section: "typography",
                    },
                    ...resolveCssVariables(authoredValues.get("fill") ?? null),
                    fallback: computedValue("fill"),
                    disabled: element.disabled,
                  },
                ];
          }))(rowsForSection("typography"))
      : isSvgPaintTarget || isCheckable
        ? []
        : rowsForSection("typography");
  if (
    (!isSvgPaintTarget || isSvgText) &&
    !isCheckable &&
    (isPlainTextTag ||
      isSvgText ||
      isTextual ||
      hasEditableText ||
      (isFormControl && element.tag !== "button") ||
      (element.tag === "hr" ? false : typographyRows.some(hasValue)))
  ) {
    let textSection: Dynamic = {
      id: "text",
      get title() { return uiMessage("inspector.element.text"); },
      rows: [...(contentRow ? [contentRow] : []), ...typographyRows],
    };
    isPlainTextTag ? sections.unshift(textSection) : sections.push(textSection);
  } else
    for (let row of rowsForSection("typography") as Dynamic)
      addStaleRow(row);
  {
    let sizingRows: Dynamic = rowsForSection("sizing"),
      spacingRows: Dynamic =
        isSvgPaintTarget ||
        (element.tag === "hr" && !rowsForSection("padding").some(hasValue))
          ? isSvgPaintTarget
            ? []
            : rowsForSection("margin")
          : [...rowsForSection("padding"), ...rowsForSection("margin")];
    if (isSvgPaintTarget)
      for (let row of [
        ...rowsForSection("padding"),
        ...rowsForSection("margin"),
      ] as Dynamic)
        addStaleRow(row);
    let positionRows: Dynamic = rowsForSection("position"),
      rowsByProp: Dynamic = new Map(
        [...sizingRows, ...positionRows].map(
          (row?: Dynamic): Dynamic => [row.prop, row],
        ),
      ),
      sizeRows: Dynamic = sizingRows.filter(
        (row?: Dynamic): Dynamic =>
          row.prop === "width" || row.prop === "height",
      ),
      minMaxRows: Dynamic = sizingRows.filter(
        (row?: Dynamic): Dynamic => /^(min|max)-/.test(row.prop),
      ),
      layoutRows: Dynamic = rowsForSection("layout"),
      pickedLayoutRows: Dynamic = [],
      layoutMode: Dynamic;
    if (showsLayoutControls) {
      let layoutRowsByProp: Dynamic = new Map(
        layoutRows.map((row?: Dynamic): Dynamic => [row.prop, row]),
      );
      layoutMode = isGrid ? "grid" : isFlex ? "flex" : "block";
      let entry: Dynamic = layoutRowsByProp.get("display");
      hasValue(entry) &&
        !(entry.spec?.options ?? []).includes(
          entry.value.trim().toLowerCase(),
        ) &&
        (addStaleRow({
          ...entry,
          get label() { return uiMessage("inspector.element.display"); },
        }),
        (entry = {
          ...entry,
          value: null,
          fallback: entry.value,
          varSource: undefined,
        }));
      let directionRows: Dynamic =
          layoutMode === "flex"
            ? [layoutRowsByProp.get("flex-direction"), layoutRowsByProp.get("flex-wrap")]
            : layoutMode === "grid"
              ? [
                  layoutRowsByProp.get("grid-template-columns"),
                  layoutRowsByProp.get("grid-template-rows"),
                ]
              : [],
        markLongTail: Dynamic = (row?: Dynamic): Dynamic => ({
          ...row,
          spec: {
            ...row.spec,
            longTail: true,
          },
        }),
        spacingLayoutRows: Dynamic =
          layoutMode === "block"
            ? []
            : layoutMode === "grid"
              ? [
                  layoutRowsByProp.get("gap"),
                  markLongTail(layoutRowsByProp.get("justify-items")),
                  markLongTail(layoutRowsByProp.get("align-items")),
                ]
              : [
                  layoutRowsByProp.get("justify-content"),
                  layoutRowsByProp.get("align-items"),
                  layoutRowsByProp.get("gap"),
                ];
      pickedLayoutRows.push(entry, ...directionRows, ...spacingLayoutRows);
      for (let row of layoutRows as Dynamic)
        row.prop !== "display" &&
          !pickedLayoutRows.some(
            (pickedRow?: Dynamic): Dynamic => pickedRow.prop === row.prop,
          ) &&
          addStaleRow(row);
    } else
      for (let row of layoutRows as Dynamic)
        addStaleRow(
          row.prop === "display"
            ? {
                ...row,
                get label() { return uiMessage("inspector.element.display"); },
              }
            : row,
        );
    let parentDisplay: Dynamic = (element.parentDisplay ?? "").toLowerCase(),
      parentIsFlexOrUnknown: Dynamic =
        element.parentDisplay === undefined || parentDisplay.includes("flex"),
      childLayoutProps: Dynamic = parentDisplay.includes("grid")
        ? ["grid-column", "grid-row"]
        : parentIsFlexOrUnknown
          ? ["flex-grow"]
          : [];
    for (let childProp of [
      "align-self",
      "flex-grow",
      "grid-column",
      "grid-row",
      "justify-self",
    ] as Dynamic)
      childLayoutProps.includes(childProp) || addStaleRow(rowsByProp.get(childProp));
    let paddingRows: Dynamic = spacingRows.filter(
        (row?: Dynamic): Dynamic => row.prop.startsWith("padding-"),
      ),
      marginRows: Dynamic = spacingRows.filter(
        (row?: Dynamic): Dynamic => row.prop.startsWith("margin-"),
      ),
      sizeSectionRows: Dynamic = [
        ...sizeRows,
        ...minMaxRows,
        rowsByProp.get("position"),
        rowsByProp.get("top"),
        rowsByProp.get("left"),
        rowsByProp.get("bottom"),
        rowsByProp.get("right"),
        ...childLayoutProps.map((propName?: Dynamic): Dynamic => rowsByProp.get(propName)),
      ],
      layoutSectionRows: Dynamic = [...pickedLayoutRows, ...paddingRows, ...marginRows];
    if (
      isSvgPaintTarget &&
      ((layoutSectionRows = layoutSectionRows.filter(
        (row?: Dynamic): Dynamic =>
          hasValue(row) || !valueOnlyProps.has(row.prop),
      )),
      (sizeSectionRows = sizeSectionRows
        .map(
          (row?: Dynamic): Dynamic =>
            row.prop === "width" || row.prop === "height"
              ? {
                  ...row,
                  spec: {
                    ...row.spec,
                    editor: "number",
                    unit: "px",
                  },
                }
              : row,
        )
        .filter(
          (row?: Dynamic): Dynamic =>
            row.prop === element.hiddenSizingAxis
              ? false
              : hasValue(row)
                ? true
                : !valueOnlyProps.has(row.prop),
        )),
      isSvgShape || isSvgText)
    ) {
      let isEmptyRow: Dynamic = (row?: Dynamic): Dynamic =>
        !hasValue(row);
      if (inspectorOptions.forMulti) sizeSectionRows.every(isEmptyRow) && (sizeSectionRows = []);
      else
        for (let axisName of ["sizing", "position"] as Dynamic) {
          let belongsToAxis: Dynamic = (row?: Dynamic): Dynamic =>
            (row.spec?.section === "position" ? "position" : "sizing") ===
            axisName;
          sizeSectionRows.filter(belongsToAxis).every(isEmptyRow) &&
            (sizeSectionRows = sizeSectionRows.filter(
              (row?: Dynamic): Dynamic => !belongsToAxis(row),
            ));
        }
    }
    sizeSectionRows.length > 0 &&
      sections.push({
        id: "size",
        get title() { return uiMessage("inspector.element.size"); },
        rows: sizeSectionRows,
      });
    layoutSectionRows.length > 0 &&
      sections.push({
        id: "sizing",
        get title() { return uiMessage("inspector.element.layout"); },
        rows: layoutSectionRows,
        ...(layoutMode !== undefined
          ? {
              mode: layoutMode,
            }
          : {}),
      });
  }
  {
    let borderRows: Dynamic =
      element.tag === "hr"
        ? []
        : [...rowsForSection("border"), ...rowsForSection("borderSides")];
    if (element.tag === "hr")
      for (let row of [
        ...rowsForSection("border"),
        ...rowsForSection("borderSides"),
      ] as Dynamic)
        row.prop !== "border-top-width" && addStaleRow(row);
    let appearanceRows: Dynamic = [
      ...rowsForSection("appearance"),
      ...rowsForSection("radius"),
      ...borderRows,
    ];
    isSvgPaintTarget &&
      (appearanceRows = appearanceRows.filter((row?: Dynamic): Dynamic => {
        if (hasValue(row)) return true;
        let isPlainAppearanceRow: Dynamic =
          row.spec?.section !== "border" &&
          row.spec?.section !== "borderSides" &&
          !valueOnlyProps.has(row.prop);
        isPlainAppearanceRow ||
          addStaleRow({
            ...row,
            label: row.prop,
          });
        return isPlainAppearanceRow;
      }));
    (appearanceRows.length > 0 || !isSvgPaintTarget) &&
      sections.push({
        id: "appearance",
        get title() { return uiMessage("inspector.element.appearance"); },
        rows: appearanceRows,
      });
  }
  {
    let effectRows: Dynamic = rowsForSection("effects");
    isSvgPaintTarget &&
      !isSvgText &&
      (effectRows = effectRows.filter(
        (row?: Dynamic): Dynamic =>
          hasValue(row) || !valueOnlyProps.has(row.prop),
      ));
    let computed: Dynamic = element.computed,
      hasVisibleBoxPaint: Dynamic =
        [
          ...(isTextClipped
            ? []
            : [computed.backgroundColor, computed.backgroundImage]),
          computed.borderTopWidth,
          computed.borderRightWidth,
          computed.borderBottomWidth,
          computed.borderLeftWidth,
        ].some(hasVisiblePaint) ||
        [...authoredValues].some(
          ([propName, propValue]: Dynamic): Dynamic =>
            InspectorStyleMetadataBackgroundColorPattern.test(
              propName,
            ) &&
            !(isTextClipped && /^background(?:-color|-image)?$/.test(propName)) &&
            hasVisiblePaint(resolveCssVariables(propValue).value),
        ),
      isTextLeaf: Dynamic = element.textLeaf ?? element.text != null,
      shadowTargetsText: Dynamic =
        isSvgText ||
        (isTextual &&
          isTextLeaf &&
          !isSvgPaintTarget &&
          !hasVisibleBoxPaint &&
          (element.rendered ?? true)),
      dropShadowReason: Dynamic =
        shadowTargetsText && isTextClipped ? InspectorStyleMetadataLabel : undefined,
      isShapeShadowRow: Dynamic = (row?: Dynamic): Dynamic =>
        isSvgShape &&
        !inspectorOptions.forMulti &&
        (row.prop === "box-shadow" || row.prop === "backdrop-filter");
    effectRows.filter(isShapeShadowRow).forEach(addStaleRow);
    sections.push({
      id: "effects",
      get title() { return uiMessage("inspector.element.effects"); },
      rows: effectRows.filter(
        (row?: Dynamic): Dynamic => !isShapeShadowRow(row),
      ),
      ...(shadowTargetsText
        ? {
            shadowTarget: "text",
            ...(dropShadowReason
              ? {
                  dropShadowReason: dropShadowReason,
                }
              : {}),
          }
        : {}),
      ...(isSvgShape
        ? {
            shadowTarget: "shape",
          }
        : {}),
    });
  }
  let knownProps: Dynamic = new Set(
    propertySpecs.map(
      (propertySpec?: Dynamic): Dynamic => propertySpec.prop,
    ),
  );
  for (let prop of Object.values(
    InspectorPropertySchemaBackgroundFontWeightFontStyleConfig,
  ) as Dynamic)
    knownProps.add(prop);
  if (isTextClipped)
    for (let prop of InspectorPropertySchemaItems as Dynamic)
      knownProps.add(prop);
  (element.tag === "img" || element.tag === "video") && knownProps.add("object-fit");
  isFormControl && knownProps.add("appearance");
  element.tag === "svg" &&
    (knownProps.add("fill"), knownProps.add("stroke"), knownProps.add("stroke-width"));
  for (let prop of strokeRows as Dynamic)
    prop.prop.startsWith("@") || knownProps.add(prop.prop);
  isSvgText && knownProps.add("fill");
  (element.tag === "ul" || element.tag === "ol") &&
    knownProps.add("list-style-type");
  if (element.tag === "hr")
    for (let prop of [
      "border-top-width",
      "border-top-color",
      "border-top-style",
    ] as Dynamic)
      knownProps.add(prop);
  let passthroughProps: Dynamic = new Set(
      InspectorPropertySchemaCursorPointerEventsObjectFitValues,
    ),
    advancedRows: Dynamic = [
      ...staleRows,
      ...rowsForSection("advanced").filter(
        (propertySpec?: Dynamic): Dynamic =>
          !(isSvgPaintTarget && !isSvgText && propertySpec.prop === "overflow"),
      ),
    ];
  for (let declaration of declarations as Dynamic)
    knownProps.has(declaration.prop) ||
      passthroughProps.has(declaration.prop) ||
      advancedRows.push({
        prop: declaration.prop,
        label: declaration.prop,
        ...resolveCssVariables(declaration.value),
        fallback: computedValue(declaration.prop),
        disabled: element.disabled,
      });
  for (let prop of InspectorPropertySchemaCursorPointerEventsObjectFitValues as Dynamic)
    knownProps.has(prop) ||
      advancedRows.push({
        prop: prop,
        label: prop,
        ...resolveCssVariables(authoredValues.get(prop) ?? null),
        fallback: computedValue(prop),
        disabled: element.disabled,
      });
  let specialAttrs: Dynamic = new Set(
    svgShapeTags.has(element.tag)
      ? InspectorStyleMetadataStrokeStrokeWidthFillValues.filter(
          (prop?: Dynamic): Dynamic => !authoredValues.has(prop),
        )
      : element.tag === "svg"
        ? ["preserveAspectRatio"]
        : element.tag === "a"
          ? ["href", ...(opensInNewTab ? ["target"] : [])]
          : element.tag === "video" || element.tag === "iframe"
            ? ["src"]
            : [],
  );
  for (let [attrName, attrValue] of Object.entries(element.attrs) as Dynamic)
    InspectorStyleMetadataDataDcTplStyleSet.has(attrName) ||
      (element.tag === "img" && attrName === "src") ||
      handledAttrs.has(attrName) ||
      specialAttrs.has(attrName) ||
      advancedRows.push({
        prop: `@${attrName}`,
        label:
          (isSvgShape || isSvgText) && authoredValues.has(attrName)
            ? `@${attrName}`
            : attrName,
        value: attrValue,
        disabled: element.disabled,
      });
  orderInspectorSections(sections);
  resolveInspectorInheritedValues(
    sections,
    advancedRows,
    element.classSources,
    authoredValues,
  );
  return {
    sections: sections,
    advanced: advancedRows,
  };
}
export {
  getElementInspector,
};
export function installEditorInspectorElement(): () => void {
  return () => {};
}
