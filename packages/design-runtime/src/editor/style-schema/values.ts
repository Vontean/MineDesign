/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { StyleSchemaNodeTypesAutoNoneValues, StyleSchemaNodeTypesBlockInlineBlockFlexValues, StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues, StyleSchemaNodeTypesDefaultPointerTextValues, StyleSchemaNodeTypesFlat, StyleSchemaNodeTypesFlatValue, StyleSchemaNodeTypesFlatValue_2, StyleSchemaNodeTypesFlatValue_3, StyleSchemaNodeTypesFlatValue_4, StyleSchemaNodeTypesFlatValue_5, StyleSchemaNodeTypesItems, StyleSchemaNodeTypesLeftCenterRightValues, StyleSchemaNodeTypesNoneLeftRightValues, StyleSchemaNodeTypesNoneSolidDashedValues, StyleSchemaNodeTypesNoneUnderlineLineThroughValues, StyleSchemaNodeTypesNoneUppercaseLowercaseValues, StyleSchemaNodeTypesNormalItalicValues, StyleSchemaNodeTypesNormalMultiplyScreenValues, StyleSchemaNodeTypesNormalTabularNumsValues, StyleSchemaNodeTypesParagraphHeadingCodeBlockValues, StyleSchemaNodeTypesSansSerifMonoValues, StyleSchemaNodeTypesSlidesIconValues, StyleSchemaNodeTypesSlidesImgValues, StyleSchemaNodeTypesSlidesShapeValues, StyleSchemaNodeTypesSlidesStackValues, StyleSchemaNodeTypesSlidesTableValues, StyleSchemaNodeTypesSlidesTextValues, StyleSchemaNodeTypesSolidDoubleDottedValues, StyleSchemaNodeTypesStaticRelativeAbsoluteValues, StyleSchemaNodeTypesTableTableCellTableHeaderValues, StyleSchemaNodeTypesVisibleHiddenClipValues, StyleSchemaNodeTypesVisibleHiddenValues } from "./node-types";

var StyleSchemaValuesSansSerifMonoConfig: Dynamic;
var StyleSchemaValuesHandler: Dynamic;
var StyleSchemaValuesHandler_2: Dynamic;
var StyleSchemaValuesHandler_3: Dynamic;
var StyleSchemaValuesHandler_4: Dynamic;
var StyleSchemaValuesKindConfig: Dynamic;
var StyleSchemaValuesLimit: Dynamic;
var StyleSchemaValuesClosestSideClosestCornerFarthestSideValues: Dynamic;
var StyleSchemaValuesItems: Dynamic;
var StyleSchemaValuesItems_2: Dynamic;
var StyleSchemaValuesItems_3: Dynamic;
var StyleSchemaValuesBoxShadowTextShadowFilterValues: Dynamic;
var StyleSchemaValuesTransformOpacityColorValues: Dynamic;
var StyleSchemaValuesColorBackgroundColorBackgroundGradientValues: Dynamic;
var StyleSchemaValuesSubscribers: Dynamic;
var StyleSchemaValuesSubscribers_2: Dynamic;
var StyleSchemaValuesSubscribers_3: Dynamic;
var StyleSchemaValuesSubscribers_4: Dynamic;
var StyleSchemaValuesRegistry: Dynamic;
export {
  StyleSchemaValuesBoxShadowTextShadowFilterValues,
  StyleSchemaValuesClosestSideClosestCornerFarthestSideValues,
  StyleSchemaValuesColorBackgroundColorBackgroundGradientValues,
  StyleSchemaValuesHandler,
  StyleSchemaValuesHandler_2,
  StyleSchemaValuesHandler_3,
  StyleSchemaValuesHandler_4,
  StyleSchemaValuesItems,
  StyleSchemaValuesItems_2,
  StyleSchemaValuesItems_3,
  StyleSchemaValuesKindConfig,
  StyleSchemaValuesLimit,
  StyleSchemaValuesRegistry,
  StyleSchemaValuesSansSerifMonoConfig,
  StyleSchemaValuesSubscribers,
  StyleSchemaValuesSubscribers_2,
  StyleSchemaValuesSubscribers_3,
  StyleSchemaValuesSubscribers_4,
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
      input?: Dynamic,
      options?: Dynamic,
    ): Dynamic => ({
      kind: "len",
      lo: input,
      hi: options,
    });
    StyleSchemaValuesHandler_2 = (
      input?: Dynamic,
      options?: Dynamic,
    ): Dynamic => ({
      kind: "num",
      lo: input,
      hi: options,
    });
    StyleSchemaValuesHandler_3 = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
    ): Dynamic => ({
      kind: "int",
      lo: input,
      hi: options,
      step: context,
    });
    StyleSchemaValuesHandler_4 = (input?: Dynamic): Dynamic => ({
      kind: "enum",
      values: input,
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
        cls: StyleSchemaValuesHandler_2(0, 2),
        fn: "brightness",
        unit: "",
      },
      {
        field: "contrast",
        cls: StyleSchemaValuesHandler_2(0, 2),
        fn: "contrast",
        unit: "",
      },
      {
        field: "saturate",
        cls: StyleSchemaValuesHandler_2(0, 3),
        fn: "saturate",
        unit: "",
      },
      {
        field: "grayscale",
        cls: StyleSchemaValuesHandler_2(0, 1),
        fn: "grayscale",
        unit: "",
      },
      {
        field: "sepia",
        cls: StyleSchemaValuesHandler_2(0, 1),
        fn: "sepia",
        unit: "",
      },
      {
        field: "invert",
        cls: StyleSchemaValuesHandler_2(0, 1),
        fn: "invert",
        unit: "",
      },
      {
        field: "hueRotate",
        cls: StyleSchemaValuesHandler_2(0, 360),
        fn: "hue-rotate",
        unit: "deg",
      },
    ];
    StyleSchemaValuesItems_2 = [
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
        cls: StyleSchemaValuesHandler_2(-180, 180),
      },
      {
        field: "scale",
        cls: StyleSchemaValuesHandler_2(0.5, 2),
      },
      {
        field: "skewX",
        cls: StyleSchemaValuesHandler_2(-60, 60),
      },
      {
        field: "skewY",
        cls: StyleSchemaValuesHandler_2(-60, 60),
      },
    ];
    StyleSchemaValuesItems_3 = [
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
    StyleSchemaValuesSubscribers = new Set(StyleSchemaValuesItems_3);
    StyleSchemaValuesSubscribers_2 = new Set(
      StyleSchemaValuesBoxShadowTextShadowFilterValues,
    );
    StyleSchemaValuesSubscribers_3 = new Set(
      StyleSchemaValuesTransformOpacityColorValues,
    );
    StyleSchemaValuesSubscribers_4 = new Set(
      StyleSchemaValuesColorBackgroundColorBackgroundGradientValues,
    );
    StyleSchemaValuesRegistry = {
      fontSize: {
        v: StyleSchemaValuesHandler(8, 128),
        slides: StyleSchemaValuesHandler(8, 400),
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      fontWeight: {
        v: StyleSchemaValuesHandler_3(100, 900, 100),
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      fontStyle: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesNormalItalicValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      lineHeight: {
        v: StyleSchemaValuesHandler_2(0.75, 4),
        slides: StyleSchemaValuesHandler_2(0.5, 4),
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      letterSpacing: {
        v: StyleSchemaValuesHandler(-4, 32),
        slides: StyleSchemaValuesHandler(-24, 32),
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      textAlign: {
        v: StyleSchemaValuesHandler_4(
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
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesNoneUppercaseLowercaseValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      textDecorationLine: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesNoneUnderlineLineThroughValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      textDecorationStyle: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesSolidDoubleDottedValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      textDecorationColor: {
        v: StyleSchemaValuesKindConfig,
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      fontFamily: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesSansSerifMonoValues,
        ),
        slides: {
          kind: "fontFamily",
        },
        on: StyleSchemaNodeTypesFlatValue_3,
      },
      fontVariantNumeric: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesNormalTabularNumsValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_3,
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
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesNoneSolidDashedValues,
        ),
        on: StyleSchemaNodeTypesFlatValue,
      },
      borderColor: {
        v: StyleSchemaValuesKindConfig,
        on: StyleSchemaNodeTypesFlatValue,
      },
      borderSides: {
        v: StyleSchemaValuesHandler_4(StyleSchemaNodeTypesItems),
        on: StyleSchemaNodeTypesFlatValue_2,
      },
      borderTopWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        on: StyleSchemaNodeTypesFlatValue_2,
      },
      borderRightWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        on: StyleSchemaNodeTypesFlatValue_2,
      },
      borderBottomWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        on: StyleSchemaNodeTypesFlatValue_2,
      },
      borderLeftWidth: {
        v: StyleSchemaValuesHandler(0, 16),
        on: StyleSchemaNodeTypesFlatValue_2,
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
        v: StyleSchemaValuesHandler_2(0, 1),
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
        on: StyleSchemaNodeTypesFlatValue_4,
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
        on: StyleSchemaNodeTypesFlatValue_4,
      },
      backdropFilter: {
        v: {
          kind: "filter",
        },
        on: StyleSchemaNodeTypesFlatValue_4,
      },
      transform: {
        v: {
          kind: "transform",
        },
        on: StyleSchemaNodeTypesFlatValue_2,
        routed: StyleSchemaNodeTypesSlidesShapeValues,
      },
      mixBlendMode: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesNormalMultiplyScreenValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_4,
      },
      position: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesStaticRelativeAbsoluteValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      top: {
        v: StyleSchemaValuesHandler(-4096, 4096),
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      right: {
        v: StyleSchemaValuesHandler(-4096, 4096),
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      bottom: {
        v: StyleSchemaValuesHandler(-4096, 4096),
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      left: {
        v: StyleSchemaValuesHandler(-4096, 4096),
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      zIndex: {
        v: StyleSchemaValuesHandler_3(-999, 999, 1),
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      float: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesNoneLeftRightValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      display: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesBlockInlineBlockFlexValues,
        ),
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      visibility: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesVisibleHiddenValues,
        ),
        on: StyleSchemaNodeTypesFlatValue,
      },
      overflow: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesVisibleHiddenClipValues,
        ),
        on: StyleSchemaNodeTypesFlat(
          StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
          StyleSchemaNodeTypesTableTableCellTableHeaderValues,
          StyleSchemaNodeTypesSlidesStackValues,
        ),
      },
      pointerEvents: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesAutoNoneValues,
        ),
        on: StyleSchemaNodeTypesFlatValue,
      },
      cursor: {
        v: StyleSchemaValuesHandler_4(
          StyleSchemaNodeTypesDefaultPointerTextValues,
        ),
        on: StyleSchemaNodeTypesFlatValue,
      },
      width: {
        v: {
          kind: "size",
        },
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      height: {
        v: {
          kind: "size",
        },
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      minWidth: {
        v: {
          kind: "size",
        },
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      minHeight: {
        v: {
          kind: "size",
        },
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      maxWidth: {
        v: {
          kind: "size",
        },
        on: StyleSchemaNodeTypesFlatValue_5,
      },
      maxHeight: {
        v: {
          kind: "size",
        },
        on: StyleSchemaNodeTypesFlatValue_5,
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
