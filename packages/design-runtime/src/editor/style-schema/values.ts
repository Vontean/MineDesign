/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaNodeTypesAutoNoneValues, StyleSchemaNodeTypesBlockInlineBlockFlexValues, StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues, StyleSchemaNodeTypesDefaultPointerTextValues, StyleSchemaNodeTypesFlat, StyleSchemaNodeTypesFlatValue, nodesSupportingBorderSidesAndTransform, typographyNodes, effectNodes, richDocumentLayoutNodes, StyleSchemaNodeTypesItems, StyleSchemaNodeTypesLeftCenterRightValues, StyleSchemaNodeTypesNoneLeftRightValues, StyleSchemaNodeTypesNoneSolidDashedValues, StyleSchemaNodeTypesNoneUnderlineLineThroughValues, StyleSchemaNodeTypesNoneUppercaseLowercaseValues, StyleSchemaNodeTypesNormalItalicValues, StyleSchemaNodeTypesNormalMultiplyScreenValues, StyleSchemaNodeTypesNormalTabularNumsValues, StyleSchemaNodeTypesParagraphHeadingCodeBlockValues, StyleSchemaNodeTypesSansSerifMonoValues, StyleSchemaNodeTypesSlidesIconValues, StyleSchemaNodeTypesSlidesImgValues, StyleSchemaNodeTypesSlidesShapeValues, StyleSchemaNodeTypesSlidesStackValues, StyleSchemaNodeTypesSlidesTableValues, StyleSchemaNodeTypesSlidesTextValues, StyleSchemaNodeTypesSolidDoubleDottedValues, StyleSchemaNodeTypesStaticRelativeAbsoluteValues, StyleSchemaNodeTypesTableTableCellTableHeaderValues, StyleSchemaNodeTypesVisibleHiddenClipValues, StyleSchemaNodeTypesVisibleHiddenValues } from "./node-types";

var StyleSchemaValuesSansSerifMonoConfig: Dynamic;
var StyleSchemaValuesHandler: Dynamic;
var numberRangeSpec: Dynamic;
var integerRangeSpec: Dynamic;
var enumSpec: Dynamic;
var StyleSchemaValuesKindConfig: Dynamic;
var StyleSchemaValuesLimit: Dynamic;
var StyleSchemaValuesClosestSideClosestCornerFarthestSideValues: Dynamic;
var StyleSchemaValuesItems: Dynamic;
var transformFieldSpecs: Dynamic;
var supportedStyleProperties: Dynamic;
var StyleSchemaValuesBoxShadowTextShadowFilterValues: Dynamic;
var StyleSchemaValuesTransformOpacityColorValues: Dynamic;
var StyleSchemaValuesColorBackgroundColorBackgroundGradientValues: Dynamic;
var StyleSchemaValuesSubscribers: Dynamic;
var effectProperties: Dynamic;
var animatableProperties: Dynamic;
var hoverProperties: Dynamic;
var StyleSchemaValuesRegistry: Dynamic;
export {
  StyleSchemaValuesBoxShadowTextShadowFilterValues,
  StyleSchemaValuesClosestSideClosestCornerFarthestSideValues,
  StyleSchemaValuesColorBackgroundColorBackgroundGradientValues,
  StyleSchemaValuesHandler,
  numberRangeSpec,
  integerRangeSpec,
  enumSpec,
  StyleSchemaValuesItems,
  transformFieldSpecs,
  supportedStyleProperties,
  StyleSchemaValuesKindConfig,
  StyleSchemaValuesLimit,
  StyleSchemaValuesRegistry,
  StyleSchemaValuesSansSerifMonoConfig,
  StyleSchemaValuesSubscribers,
  effectProperties,
  animatableProperties,
  hoverProperties,
  StyleSchemaValuesTransformOpacityColorValues,
};
export function installEditorStyleSchemaValues(): () => void {
  return () => {
    StyleSchemaValuesSansSerifMonoConfig = {
      sans: "ui-sans-serif, system-ui, sans-serif",
      serif: "ui-serif, Georgia, serif",
      mono: "ui-monospace, Menlo, Consolas, monospace",
      helvetica: "Helvetica Neue, Helvetica, Arial, sans-serif",
    };
    StyleSchemaValuesHandler = (
      minValue?: Dynamic,
      maxValue?: Dynamic,
    ): Dynamic => ({
      kind: "len",
      lo: minValue,
      hi: maxValue,
    });
    numberRangeSpec = (
      minValue?: Dynamic,
      maxValue?: Dynamic,
    ): Dynamic => ({
      kind: "num",
      lo: minValue,
      hi: maxValue,
    });
    integerRangeSpec = (
      minValue?: Dynamic,
      maxValue?: Dynamic,
      stepValue?: Dynamic,
    ): Dynamic => ({
      kind: "int",
      lo: minValue,
      hi: maxValue,
      step: stepValue,
    });
    enumSpec = (enumValues?: Dynamic): Dynamic => ({
      kind: "enum",
      values: enumValues,
    });
    StyleSchemaValuesKindConfig = {
      kind: "color",
    };
    StyleSchemaValuesLimit = 8;
    StyleSchemaValuesClosestSideClosestCornerFarthestSideValues = [
      "closest-side",
      "closest-corner",
      "farthest-side",
    ];
    StyleSchemaValuesItems = [
      {
        field: "blur",
        cls: StyleSchemaValuesHandler(0, 20),
        fn: "blur",
        unit: "px",
      },
      {
        field: "brightness",
        cls: numberRangeSpec(0, 2),
        fn: "brightness",
        unit: "",
      },
      {
        field: "contrast",
        cls: numberRangeSpec(0, 2),
        fn: "contrast",
        unit: "",
      },
      {
        field: "saturate",
        cls: numberRangeSpec(0, 3),
        fn: "saturate",
        unit: "",
      },
      {
        field: "grayscale",
        cls: numberRangeSpec(0, 1),
        fn: "grayscale",
        unit: "",
      },
      {
        field: "sepia",
        cls: numberRangeSpec(0, 1),
        fn: "sepia",
        unit: "",
      },
      {
        field: "invert",
        cls: numberRangeSpec(0, 1),
        fn: "invert",
        unit: "",
      },
      {
        field: "hueRotate",
        cls: numberRangeSpec(0, 360),
        fn: "hue-rotate",
        unit: "deg",
      },
    ];
    transformFieldSpecs = [
      {
        field: "translateX",
        cls: StyleSchemaValuesHandler(-4096, 4096),
      },
      {
        field: "translateY",
        cls: StyleSchemaValuesHandler(-4096, 4096),
      },
      {
        field: "rotate",
        cls: numberRangeSpec(-180, 180),
      },
      {
        field: "scale",
        cls: numberRangeSpec(0.5, 2),
      },
      {
        field: "skewX",
        cls: numberRangeSpec(-60, 60),
      },
      {
        field: "skewY",
        cls: numberRangeSpec(-60, 60),
      },
    ];
    supportedStyleProperties = [
      "fontSize",
      "fontWeight",
      "fontStyle",
      "lineHeight",
      "letterSpacing",
      "textAlign",
      "textTransform",
      "textDecorationLine",
      "textDecorationStyle",
      "textDecorationColor",
      "fontFamily",
      "fontVariantNumeric",
      "color",
      "backgroundColor",
      "backgroundGradient",
      "marginTop",
      "marginRight",
      "marginBottom",
      "marginLeft",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "borderWidth",
      "borderStyle",
      "borderColor",
      "borderSides",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "borderRadius",
      "borderTopLeftRadius",
      "borderTopRightRadius",
      "borderBottomRightRadius",
      "borderBottomLeftRadius",
      "opacity",
      "boxShadow",
      "textShadow",
      "textStrokeWidth",
      "textStrokeColor",
      "filter",
      "backdropFilter",
      "transform",
      "mixBlendMode",
      "position",
      "top",
      "right",
      "bottom",
      "left",
      "zIndex",
      "float",
      "display",
      "visibility",
      "overflow",
      "pointerEvents",
      "cursor",
      "width",
      "height",
      "minWidth",
      "minHeight",
      "maxWidth",
      "maxHeight",
      "transition",
      "animation",
    ];
    StyleSchemaValuesBoxShadowTextShadowFilterValues = [
      "boxShadow",
      "textShadow",
      "filter",
      "backdropFilter",
      "mixBlendMode",
    ];
    StyleSchemaValuesTransformOpacityColorValues = [
      "transform",
      "opacity",
      "color",
      "backgroundColor",
      "filter",
      "boxShadow",
    ];
    StyleSchemaValuesColorBackgroundColorBackgroundGradientValues = [
      "color",
      "backgroundColor",
      "backgroundGradient",
      "borderColor",
      "textDecorationLine",
      "textDecorationStyle",
      "textDecorationColor",
      "opacity",
      "boxShadow",
      "textShadow",
      "filter",
      "cursor",
    ];
    StyleSchemaValuesSubscribers = new Set(supportedStyleProperties);
    effectProperties = new Set(
      StyleSchemaValuesBoxShadowTextShadowFilterValues,
    );
    animatableProperties = new Set(
      StyleSchemaValuesTransformOpacityColorValues,
    );
    hoverProperties = new Set(
      StyleSchemaValuesColorBackgroundColorBackgroundGradientValues,
    );
    StyleSchemaValuesRegistry = {
      fontSize: {
        v: StyleSchemaValuesHandler(8, 128),
        slides: StyleSchemaValuesHandler(8, 400),
        on: typographyNodes,
      },
      fontWeight: {
        v: integerRangeSpec(100, 900, 100),
        on: typographyNodes,
      },
      fontStyle: {
        v: enumSpec(
          StyleSchemaNodeTypesNormalItalicValues,
        ),
        on: typographyNodes,
      },
      lineHeight: {
        v: numberRangeSpec(0.75, 4),
        slides: numberRangeSpec(0.5, 4),
        on: typographyNodes,
      },
      letterSpacing: {
        v: StyleSchemaValuesHandler(-4, 32),
        slides: StyleSchemaValuesHandler(-24, 32),
        on: typographyNodes,
      },
      textAlign: {
        v: enumSpec(
          StyleSchemaNodeTypesLeftCenterRightValues,
        ),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
        routed: StyleSchemaNodeTypesSlidesTextValues,
      },
      textTransform: {
        v: enumSpec(
          StyleSchemaNodeTypesNoneUppercaseLowercaseValues,
        ),
        on: typographyNodes,
      },
      textDecorationLine: {
        v: enumSpec(
          StyleSchemaNodeTypesNoneUnderlineLineThroughValues,
        ),
        on: typographyNodes,
      },
      textDecorationStyle: {
        v: enumSpec(
          StyleSchemaNodeTypesSolidDoubleDottedValues,
        ),
        on: typographyNodes,
      },
      textDecorationColor: {
        v: StyleSchemaValuesKindConfig,
        on: typographyNodes,
      },
      fontFamily: {
        v: enumSpec(
          StyleSchemaNodeTypesSansSerifMonoValues,
        ),
        slides: {
          kind: "fontFamily",
        },
        on: typographyNodes,
      },
      fontVariantNumeric: {
        v: enumSpec(
          StyleSchemaNodeTypesNormalTabularNumsValues,
        ),
        on: typographyNodes,
      },
      color: {
        v: StyleSchemaValuesKindConfig,
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
        routed: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesIconValues,
        ),
      },
      backgroundColor: {
        v: StyleSchemaValuesKindConfig,
        on: StyleSchemaNodeTypesFlatValue,
      },
      backgroundGradient: {
        v: {
          kind: "gradient",
        },
        slides: {
          kind: "gradient",
          repeat: true,
        },
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesImgValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
      },
      marginTop: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      },
      marginRight: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      },
      marginBottom: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      },
      marginLeft: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      },
      paddingTop: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
      },
      paddingRight: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
      },
      paddingBottom: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
      },
      paddingLeft: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
      },
      borderWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        shape: StyleSchemaValuesHandler(0, 32),
        on: StyleSchemaNodeTypesFlatValue,
      },
      borderStyle: {
        v: enumSpec(
          StyleSchemaNodeTypesNoneSolidDashedValues,
        ),
        on: StyleSchemaNodeTypesFlatValue,
      },
      borderColor: {
        v: StyleSchemaValuesKindConfig,
        on: StyleSchemaNodeTypesFlatValue,
      },
      borderSides: {
        v: enumSpec(StyleSchemaNodeTypesItems),
        on: nodesSupportingBorderSidesAndTransform,
      },
      borderTopWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        on: nodesSupportingBorderSidesAndTransform,
      },
      borderRightWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        on: nodesSupportingBorderSidesAndTransform,
      },
      borderBottomWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        on: nodesSupportingBorderSidesAndTransform,
      },
      borderLeftWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        on: nodesSupportingBorderSidesAndTransform,
      },
      borderRadius: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesImgValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
          StyleSchemaNodeTypesSlidesShapeValues,
        ),
      },
      borderTopLeftRadius: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesImgValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
          StyleSchemaNodeTypesSlidesShapeValues,
        ),
      },
      borderTopRightRadius: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesImgValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
          StyleSchemaNodeTypesSlidesShapeValues,
        ),
      },
      borderBottomRightRadius: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesImgValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
          StyleSchemaNodeTypesSlidesShapeValues,
        ),
      },
      borderBottomLeftRadius: {
        v: StyleSchemaValuesHandler(0, 256),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesImgValues,
          StyleSchemaNodeTypesSlidesStackValues,
          StyleSchemaNodeTypesSlidesTableValues,
          StyleSchemaNodeTypesSlidesShapeValues,
        ),
      },
      opacity: {
        v: numberRangeSpec(0, 1),
        on: StyleSchemaNodeTypesFlatValue,
      },
      boxShadow: {
        v: {
          kind: "shadow",
          spread: true,
        },
        slides: {
          kind: "shadow",
          spread: true,
          blur: StyleSchemaValuesHandler(0, 160),
        },
        on: effectNodes,
      },
      textShadow: {
        v: {
          kind: "shadow",
          spread: false,
        },
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesParagraphHeadingCodeBlockValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
      },
      textStrokeWidth: {
        v: StyleSchemaValuesHandler(0, 8),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesParagraphHeadingCodeBlockValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
      },
      textStrokeColor: {
        v: StyleSchemaValuesKindConfig,
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesParagraphHeadingCodeBlockValues,
          StyleSchemaNodeTypesSlidesTextValues,
          StyleSchemaNodeTypesSlidesTableValues,
        ),
      },
      filter: {
        v: {
          kind: "filter",
        },
        on: effectNodes,
      },
      backdropFilter: {
        v: {
          kind: "filter",
        },
        on: effectNodes,
      },
      transform: {
        v: {
          kind: "transform",
        },
        on: nodesSupportingBorderSidesAndTransform,
        routed: StyleSchemaNodeTypesSlidesShapeValues,
      },
      mixBlendMode: {
        v: enumSpec(
          StyleSchemaNodeTypesNormalMultiplyScreenValues,
        ),
        on: effectNodes,
      },
      position: {
        v: enumSpec(
          StyleSchemaNodeTypesStaticRelativeAbsoluteValues,
        ),
        on: richDocumentLayoutNodes,
      },
      top: {
        v: StyleSchemaValuesHandler(-4096, 4096),
        on: richDocumentLayoutNodes,
      },
      right: {
        v: StyleSchemaValuesHandler(-4096, 4096),
        on: richDocumentLayoutNodes,
      },
      bottom: {
        v: StyleSchemaValuesHandler(-4096, 4096),
        on: richDocumentLayoutNodes,
      },
      left: {
        v: StyleSchemaValuesHandler(-4096, 4096),
        on: richDocumentLayoutNodes,
      },
      zIndex: {
        v: integerRangeSpec(-999, 999, 1),
        on: richDocumentLayoutNodes,
      },
      float: {
        v: enumSpec(
          StyleSchemaNodeTypesNoneLeftRightValues,
        ),
        on: richDocumentLayoutNodes,
      },
      display: {
        v: enumSpec(
          StyleSchemaNodeTypesBlockInlineBlockFlexValues,
        ),
        on: richDocumentLayoutNodes,
      },
      visibility: {
        v: enumSpec(
          StyleSchemaNodeTypesVisibleHiddenValues,
        ),
        on: StyleSchemaNodeTypesFlatValue,
      },
      overflow: {
        v: enumSpec(
          StyleSchemaNodeTypesVisibleHiddenClipValues,
        ),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesStackValues,
        ),
      },
      pointerEvents: {
        v: enumSpec(
          StyleSchemaNodeTypesAutoNoneValues,
        ),
        on: StyleSchemaNodeTypesFlatValue,
      },
      cursor: {
        v: enumSpec(
          StyleSchemaNodeTypesDefaultPointerTextValues,
        ),
        on: StyleSchemaNodeTypesFlatValue,
      },
      width: {
        v: {
          kind: "size",
        },
        on: richDocumentLayoutNodes,
      },
      height: {
        v: {
          kind: "size",
        },
        on: richDocumentLayoutNodes,
      },
      minWidth: {
        v: {
          kind: "size",
        },
        on: richDocumentLayoutNodes,
      },
      minHeight: {
        v: {
          kind: "size",
        },
        on: richDocumentLayoutNodes,
      },
      maxWidth: {
        v: {
          kind: "size",
        },
        on: richDocumentLayoutNodes,
      },
      maxHeight: {
        v: {
          kind: "size",
        },
        on: richDocumentLayoutNodes,
      },
      transition: {
        v: {
          kind: "transition",
        },
        on: StyleSchemaNodeTypesFlatValue,
      },
      animation: {
        v: {
          kind: "animation",
        },
        on: StyleSchemaNodeTypesFlatValue,
      },
    };
  };
}
