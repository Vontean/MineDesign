import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon } from "../../cds/components/icon";
import { cn } from "../../cds/theme/class-names";
import { load_react_jsx_runtime } from "../../dependencies";
import { blockingOverlaySelector } from "../chrome/overlay-state";
import { editorThemeTokens } from "../chrome/theme";
import { toModuleNamespace } from "../../module-helpers";

var CanTReadThisArtboardSFileAskMessage: Dynamic;
var OutlineGlyphsTest: Dynamic;
var jsxOutlineGlyphs: Dynamic;
var OutlineGlyphsResolvedValue: Dynamic;
var OutlineGlyphsConstant: Dynamic;
var layersListMaxSize: Dynamic;
var layersListDefaultSize: Dynamic;
var OutlineGlyphsClassNames: Dynamic;
var OutlineGlyphsColorConfig: Dynamic;
var OutlineGlyphsScForScIfDcImportSet: Dynamic;
var outlineRowClassName: Dynamic;
var outlineTreeRowClasses: Dynamic;
var outlineSelectedRowForcedColorsClassName: Dynamic;
var selectedRowClasses: Dynamic;
var outlineGhostButtonClassName: Dynamic;
var selectedRowSecondaryClasses: Dynamic;
var treeRowBaseIndent: Dynamic;
var treeIndentPerLevel: Dynamic;
var treeToggleColumnWidth: Dynamic;
var OutlineGlyphsSubscribers: Dynamic;
var OutlineGlyphsNativeEvent: Dynamic;
var OutlineGlyphsLabel: Dynamic;
function OutlineElementGlyph({ dimmed: dimmed }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span
      aria-hidden={true}
      className={cn(
        OutlineGlyphsClassNames,
        dimmed ? "opacity-50" : "opacity-100",
      )}
    >
      <span
        className={cn(
          "box-border h-[9px] w-[9px] border border-dotted border-strong",
          outlineSelectedRowForcedColorsClassName,
          "forced-colors:group-aria-selected:border-[color:HighlightText]",
        )}
      />
    </span>
  );
}
function OutlineIconGlyph({
  icon: icon,
  dimmed: dimmed,
  ink: ink,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = cn(
      OutlineGlyphsClassNames,
      dimmed ? "opacity-50" : "opacity-100",
    ),
    iconClassName: Dynamic = cn(
      ink == null && "text-disabled",
      outlineSelectedRowForcedColorsClassName,
    ),
    iconStyle: Dynamic =
      ink != null
        ? {
            color: ink,
          }
        : undefined;
  return (
    <span aria-hidden={true} className={value}>
      {icon.custom ? (<Icon
          customIcon={icon.custom}
          size={"xs"}
          className={iconClassName}
          style={iconStyle}
        />) : (<Icon
          name={icon.name}
          size={"xs"}
          className={iconClassName}
          style={iconStyle}
        />)}
    </span>
  );
}
export {
  CanTReadThisArtboardSFileAskMessage,
  jsxOutlineGlyphs,
  OutlineElementGlyph,
  OutlineGlyphsClassNames,
  outlineRowClassName,
  outlineSelectedRowForcedColorsClassName,
  outlineGhostButtonClassName,
  OutlineGlyphsColorConfig,
  OutlineGlyphsConstant,
  layersListMaxSize,
  layersListDefaultSize,
  treeRowBaseIndent,
  treeIndentPerLevel,
  treeToggleColumnWidth,
  OutlineGlyphsLabel,
  OutlineGlyphsNativeEvent,
  OutlineGlyphsResolvedValue,
  selectedRowClasses,
  selectedRowSecondaryClasses,
  OutlineGlyphsScForScIfDcImportSet,
  OutlineGlyphsSubscribers,
  OutlineGlyphsTest,
  OutlineIconGlyph,
  outlineTreeRowClasses,
};
export function installEditorOutlineGlyphs(): () => void {
  return () => {
    CanTReadThisArtboardSFileAskMessage =
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      uiMessage("inspector.glyphs.canTReadThisArtboard");
    OutlineGlyphsTest = (source?: Dynamic): Dynamic =>
      /<x-dc[\s/>]/i.test(source);
    jsxOutlineGlyphs = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    OutlineGlyphsResolvedValue =
      blockingOverlaySelector + ',[aria-hidden="true"]';
    OutlineGlyphsConstant = 72;
    layersListMaxSize = 480;
    layersListDefaultSize = 168;
    OutlineGlyphsClassNames =
      "-ml-1 mr-1.5 inline-flex h-4 w-4 shrink-0 items-center justify-center";
    OutlineGlyphsColorConfig = {
      color: editorThemeTokens.accent.componentText,
    };
    OutlineGlyphsScForScIfDcImportSet = new Set([
      "sc-for",
      "sc-if",
      "dc-import",
      "x-import",
      "helmet",
    ]);
    outlineRowClassName =
      "group flex h-control select-none items-center rounded pr-1 text-footnote outline-none focus-visible:outline-hidden focus-visible:shadow-focus forced-colors:focus-visible:-outline-offset-2";
    outlineTreeRowClasses =
      "forced-colors:bg-[color:Highlight] forced-colors:text-[color:HighlightText] forced-colors:focus-visible:outline-[color:HighlightText] forced-colors:[&_button:focus-visible]:outline-[color:HighlightText] forced-colors:[&_input:focus-visible]:outline-[color:HighlightText] forced-colors:[&_input]:bg-[color:Canvas]";
    outlineSelectedRowForcedColorsClassName =
      "forced-colors:group-aria-selected:forced-color-adjust-none forced-colors:group-aria-selected:text-[color:HighlightText]!";
    selectedRowClasses =
      "bg-fill-ghost-selected font-medium text-primary " +
      outlineTreeRowClasses;
    outlineGhostButtonClassName =
      "bg-transparent text-secondary hover:bg-fill-ghost-hover";
    selectedRowSecondaryClasses =
      "bg-fill-ghost-selected text-secondary " + outlineTreeRowClasses;
    treeRowBaseIndent = 6;
    treeIndentPerLevel = 16;
    treeToggleColumnWidth = 20;
    OutlineGlyphsSubscribers = new Set();
    OutlineGlyphsNativeEvent = (event?: Dynamic): Dynamic => {
      let value: Dynamic =
        "pointerType" in event.nativeEvent &&
        ["touch", "pen"].includes(String(event.nativeEvent.pointerType));
      if (
        (event.clientX !== 0 || event.clientY !== 0) &&
        (event.button >= 0 || value)
      )
        return {
          x: event.clientX,
          y: event.clientY,
          keyboard: false,
        };
      let bounds: Dynamic = event.currentTarget.getBoundingClientRect();
      return {
        x: bounds.left + treeToggleColumnWidth,
        y: bounds.bottom,
        keyboard: true,
      };
    };
    OutlineGlyphsLabel = (menuItem?: Dynamic): Dynamic => ({
      get label() { return menuItem.label; },
      shortcut: menuItem.hotkey,
      disabled: menuItem.disabled,
      disabledReason: menuItem.disabledReason,
      separatorBefore: menuItem.separatorBefore,
      variant: menuItem.danger === true ? "danger" : undefined,
      onSelect: menuItem.onClick,
    });
  };
}
