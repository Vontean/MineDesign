/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";

var StyleSchemaNodeTypesStartsWith: Dynamic;
var StyleSchemaNodeTypesParagraphHeadingCodeBlockValues: Dynamic;
var StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues: Dynamic;
var StyleSchemaNodeTypesTableValues: Dynamic;
var StyleSchemaNodeTypesTableTableCellTableHeaderValues: Dynamic;
var StyleSchemaNodeTypesSlidesTextValues: Dynamic;
var StyleSchemaNodeTypesSlidesImgValues: Dynamic;
var StyleSchemaNodeTypesSlidesIconValues: Dynamic;
var StyleSchemaNodeTypesSlidesStackValues: Dynamic;
var StyleSchemaNodeTypesSlidesTableValues: Dynamic;
var StyleSchemaNodeTypesSlidesShapeValues: Dynamic;
var StyleSchemaNodeTypesFlat: Dynamic;
var StyleSchemaNodeTypesFlatValue: Dynamic;
var nodesSupportingBorderSidesAndTransform: Dynamic;
var typographyNodes: Dynamic;
var effectNodes: Dynamic;
var richDocumentLayoutNodes: Dynamic;
var StyleSchemaNodeTypesNormalItalicValues: Dynamic;
var StyleSchemaNodeTypesLeftCenterRightValues: Dynamic;
var StyleSchemaNodeTypesNoneUppercaseLowercaseValues: Dynamic;
var StyleSchemaNodeTypesNoneUnderlineLineThroughValues: Dynamic;
var StyleSchemaNodeTypesSolidDoubleDottedValues: Dynamic;
var StyleSchemaNodeTypesSansSerifMonoValues: Dynamic;
var StyleSchemaNodeTypesAZaZAZaZPattern: Dynamic;
var StyleSchemaNodeTypesSubscribers: Dynamic;
var StyleSchemaNodeTypesNormalTabularNumsValues: Dynamic;
var StyleSchemaNodeTypesNoneSolidDashedValues: Dynamic;
var StyleSchemaNodeTypesItems: Dynamic;
var StyleSchemaNodeTypesNormalMultiplyScreenValues: Dynamic;
var StyleSchemaNodeTypesStaticRelativeAbsoluteValues: Dynamic;
var StyleSchemaNodeTypesNoneLeftRightValues: Dynamic;
var StyleSchemaNodeTypesBlockInlineBlockFlexValues: Dynamic;
var StyleSchemaNodeTypesVisibleHiddenValues: Dynamic;
var StyleSchemaNodeTypesVisibleHiddenClipValues: Dynamic;
var StyleSchemaNodeTypesAutoNoneValues: Dynamic;
var StyleSchemaNodeTypesDefaultPointerTextValues: Dynamic;
var StyleSchemaNodeTypesLinearEaseEaseInValues: Dynamic;
export {
  StyleSchemaNodeTypesAutoNoneValues,
  StyleSchemaNodeTypesAZaZAZaZPattern,
  StyleSchemaNodeTypesBlockInlineBlockFlexValues,
  StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
  StyleSchemaNodeTypesDefaultPointerTextValues,
  StyleSchemaNodeTypesFlat,
  StyleSchemaNodeTypesFlatValue,
  nodesSupportingBorderSidesAndTransform,
  typographyNodes,
  effectNodes,
  richDocumentLayoutNodes,
  StyleSchemaNodeTypesItems,
  StyleSchemaNodeTypesLeftCenterRightValues,
  StyleSchemaNodeTypesLinearEaseEaseInValues,
  StyleSchemaNodeTypesNoneLeftRightValues,
  StyleSchemaNodeTypesNoneSolidDashedValues,
  StyleSchemaNodeTypesNoneUnderlineLineThroughValues,
  StyleSchemaNodeTypesNoneUppercaseLowercaseValues,
  StyleSchemaNodeTypesNormalItalicValues,
  StyleSchemaNodeTypesNormalMultiplyScreenValues,
  StyleSchemaNodeTypesNormalTabularNumsValues,
  StyleSchemaNodeTypesParagraphHeadingCodeBlockValues,
  StyleSchemaNodeTypesSansSerifMonoValues,
  StyleSchemaNodeTypesSlidesIconValues,
  StyleSchemaNodeTypesSlidesImgValues,
  StyleSchemaNodeTypesSlidesShapeValues,
  StyleSchemaNodeTypesSlidesStackValues,
  StyleSchemaNodeTypesSlidesTableValues,
  StyleSchemaNodeTypesSlidesTextValues,
  StyleSchemaNodeTypesSolidDoubleDottedValues,
  StyleSchemaNodeTypesStartsWith,
  StyleSchemaNodeTypesStaticRelativeAbsoluteValues,
  StyleSchemaNodeTypesSubscribers,
  StyleSchemaNodeTypesTableTableCellTableHeaderValues,
  StyleSchemaNodeTypesTableValues,
  StyleSchemaNodeTypesVisibleHiddenClipValues,
  StyleSchemaNodeTypesVisibleHiddenValues,
};
export function installEditorStyleSchemaNodeTypes(): () => void {
  return () => {
    StyleSchemaNodeTypesStartsWith = (nodeType?: Dynamic): Dynamic =>
      nodeType.startsWith("slides-");
    StyleSchemaNodeTypesParagraphHeadingCodeBlockValues = [
      "paragraph",
      "heading",
      "codeBlock",
    ];
    StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues = [
      ...StyleSchemaNodeTypesParagraphHeadingCodeBlockValues,
      "blockquote",
      "bulletList",
      "orderedList",
      "image",
    ];
    StyleSchemaNodeTypesTableValues = ["table"];
    StyleSchemaNodeTypesTableTableCellTableHeaderValues = [
      "table",
      "tableCell",
      "tableHeader",
    ];
    StyleSchemaNodeTypesSlidesTextValues = ["slides-text"];
    StyleSchemaNodeTypesSlidesImgValues = ["slides-img"];
    StyleSchemaNodeTypesSlidesIconValues = ["slides-icon"];
    StyleSchemaNodeTypesSlidesStackValues = ["slides-stack"];
    StyleSchemaNodeTypesSlidesTableValues = ["slides-table"];
    StyleSchemaNodeTypesSlidesShapeValues = ["slides-shape"];
    StyleSchemaNodeTypesFlat = (...nodeTypes: Dynamic[]): Dynamic => nodeTypes.flat();
    StyleSchemaNodeTypesFlatValue = StyleSchemaNodeTypesFlat(
      StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      StyleSchemaNodeTypesTableTableCellTableHeaderValues,
      StyleSchemaNodeTypesSlidesTextValues,
      StyleSchemaNodeTypesSlidesImgValues,
      StyleSchemaNodeTypesSlidesIconValues,
      StyleSchemaNodeTypesSlidesStackValues,
      StyleSchemaNodeTypesSlidesTableValues,
      StyleSchemaNodeTypesSlidesShapeValues,
    );
    nodesSupportingBorderSidesAndTransform = StyleSchemaNodeTypesFlat(
      StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      StyleSchemaNodeTypesTableTableCellTableHeaderValues,
      StyleSchemaNodeTypesSlidesTextValues,
      StyleSchemaNodeTypesSlidesImgValues,
      StyleSchemaNodeTypesSlidesIconValues,
      StyleSchemaNodeTypesSlidesStackValues,
      StyleSchemaNodeTypesSlidesTableValues,
    );
    typographyNodes = StyleSchemaNodeTypesFlat(
      StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      StyleSchemaNodeTypesTableTableCellTableHeaderValues,
      StyleSchemaNodeTypesSlidesTextValues,
      StyleSchemaNodeTypesSlidesTableValues,
    );
    effectNodes = StyleSchemaNodeTypesFlat(
      StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      StyleSchemaNodeTypesTableValues,
      StyleSchemaNodeTypesSlidesTextValues,
      StyleSchemaNodeTypesSlidesImgValues,
      StyleSchemaNodeTypesSlidesIconValues,
      StyleSchemaNodeTypesSlidesStackValues,
      StyleSchemaNodeTypesSlidesTableValues,
      StyleSchemaNodeTypesSlidesShapeValues,
    );
    richDocumentLayoutNodes = StyleSchemaNodeTypesFlat(
      StyleSchemaNodeTypesBlockquoteBulletListOrderedListValues,
      StyleSchemaNodeTypesTableTableCellTableHeaderValues,
    );
    StyleSchemaNodeTypesNormalItalicValues = ["normal", "italic"];
    StyleSchemaNodeTypesLeftCenterRightValues = [
      "left",
      "center",
      "right",
      "justify",
    ];
    StyleSchemaNodeTypesNoneUppercaseLowercaseValues = [
      "none",
      "uppercase",
      "lowercase",
      "capitalize",
    ];
    StyleSchemaNodeTypesNoneUnderlineLineThroughValues = [
      "none",
      "underline",
      "line-through",
    ];
    StyleSchemaNodeTypesSolidDoubleDottedValues = [
      "solid",
      "double",
      "dotted",
      "dashed",
      "wavy",
    ];
    StyleSchemaNodeTypesSansSerifMonoValues = [
      "sans",
      "serif",
      "mono",
      "helvetica",
    ];
    StyleSchemaNodeTypesAZaZAZaZPattern = /^[A-Za-z][A-Za-z0-9 _-]{0,39}$/;
    StyleSchemaNodeTypesSubscribers = new Set([
      "inherit",
      "initial",
      "unset",
      "revert",
      "revert-layer",
      "default",
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
    StyleSchemaNodeTypesNormalTabularNumsValues = ["normal", "tabular-nums"];
    StyleSchemaNodeTypesNoneSolidDashedValues = [
      "none",
      "solid",
      "dashed",
      "dotted",
      "double",
    ];
    StyleSchemaNodeTypesItems = [
      "top",
      "right",
      "bottom",
      "left",
      "top right",
      "top bottom",
      "top left",
      "right bottom",
      "right left",
      "bottom left",
      "top right bottom",
      "top right left",
      "top bottom left",
      "right bottom left",
    ];
    StyleSchemaNodeTypesNormalMultiplyScreenValues = [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
    ];
    StyleSchemaNodeTypesStaticRelativeAbsoluteValues = [
      "static",
      "relative",
      "absolute",
      "sticky",
      "fixed",
    ];
    StyleSchemaNodeTypesNoneLeftRightValues = ["none", "left", "right"];
    StyleSchemaNodeTypesBlockInlineBlockFlexValues = [
      "block",
      "inline-block",
      "flex",
      "grid",
      "none",
    ];
    StyleSchemaNodeTypesVisibleHiddenValues = ["visible", "hidden"];
    StyleSchemaNodeTypesVisibleHiddenClipValues = [
      "visible",
      "hidden",
      "clip",
      "auto",
      "scroll",
    ];
    StyleSchemaNodeTypesAutoNoneValues = ["auto", "none"];
    StyleSchemaNodeTypesDefaultPointerTextValues = [
      "default",
      "pointer",
      "text",
      "move",
      "grab",
      "grabbing",
      "crosshair",
      "not-allowed",
      "zoom-in",
      "zoom-out",
      "help",
      "wait",
    ];
    StyleSchemaNodeTypesLinearEaseEaseInValues = [
      "linear",
      "ease",
      "ease-in",
      "ease-out",
      "ease-in-out",
    ];
  };
}
