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
var OutlineGlyphsConstant_2: Dynamic;
var OutlineGlyphsConstant_3: Dynamic;
var OutlineGlyphsClassNames: Dynamic;
var OutlineGlyphsColorConfig: Dynamic;
var OutlineGlyphsScForScIfDcImportSet: Dynamic;
var OutlineGlyphsClassNames_2: Dynamic;
var outlineTreeRowClasses: Dynamic;
var OutlineGlyphsClassNames_3: Dynamic;
var OutlineGlyphsResolvedValue_2: Dynamic;
var OutlineGlyphsClassNames_4: Dynamic;
var OutlineGlyphsResolvedValue_3: Dynamic;
var OutlineGlyphsConstant_4: Dynamic;
var OutlineGlyphsConstant_5: Dynamic;
var OutlineGlyphsConstant_6: Dynamic;
var OutlineGlyphsSubscribers: Dynamic;
var OutlineGlyphsNativeEvent: Dynamic;
var OutlineGlyphsLabel: Dynamic;
function OutlineElementGlyph({ dimmed: dimmed }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span
      aria-hidden={true}
      className={(0, cn)(
        OutlineGlyphsClassNames,
        dimmed ? "opacity-50" : "opacity-100",
      )}
    >
      <span
        className={(0, cn)(
          "box-border h-[9px] w-[9px] border border-dotted border-strong",
          OutlineGlyphsClassNames_3,
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
  let value: Dynamic = (0, cn)(
      OutlineGlyphsClassNames,
      dimmed ? "opacity-50" : "opacity-100",
    ),
    value2: Dynamic = (0, cn)(
      ink == null && "text-disabled",
      OutlineGlyphsClassNames_3,
    ),
    value3: Dynamic =
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
          className={value2}
          style={value3}
        />) : (<Icon
          name={icon.name}
          size={"xs"}
          className={value2}
          style={value3}
        />)}
    </span>
  );
}
export {
  CanTReadThisArtboardSFileAskMessage,
  jsxOutlineGlyphs,
  OutlineElementGlyph,
  OutlineGlyphsClassNames,
  OutlineGlyphsClassNames_2,
  OutlineGlyphsClassNames_3,
  OutlineGlyphsClassNames_4,
  OutlineGlyphsColorConfig,
  OutlineGlyphsConstant,
  OutlineGlyphsConstant_2,
  OutlineGlyphsConstant_3,
  OutlineGlyphsConstant_4,
  OutlineGlyphsConstant_5,
  OutlineGlyphsConstant_6,
  OutlineGlyphsLabel,
  OutlineGlyphsNativeEvent,
  OutlineGlyphsResolvedValue,
  OutlineGlyphsResolvedValue_2,
  OutlineGlyphsResolvedValue_3,
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
    OutlineGlyphsTest = (input?: Dynamic): Dynamic =>
      /<x-dc[\s/>]/i.test(input);
    jsxOutlineGlyphs = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    OutlineGlyphsResolvedValue =
      blockingOverlaySelector + ',[aria-hidden="true"]';
    OutlineGlyphsConstant = 72;
    OutlineGlyphsConstant_2 = 480;
    OutlineGlyphsConstant_3 = 168;
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
    OutlineGlyphsClassNames_2 =
      "group flex h-control select-none items-center rounded pr-1 text-footnote outline-none focus-visible:outline-hidden focus-visible:shadow-focus forced-colors:focus-visible:-outline-offset-2";
    outlineTreeRowClasses =
      "forced-colors:bg-[color:Highlight] forced-colors:text-[color:HighlightText] forced-colors:focus-visible:outline-[color:HighlightText] forced-colors:[&_button:focus-visible]:outline-[color:HighlightText] forced-colors:[&_input:focus-visible]:outline-[color:HighlightText] forced-colors:[&_input]:bg-[color:Canvas]";
    OutlineGlyphsClassNames_3 =
      "forced-colors:group-aria-selected:forced-color-adjust-none forced-colors:group-aria-selected:text-[color:HighlightText]!";
    OutlineGlyphsResolvedValue_2 =
      "bg-fill-ghost-selected font-medium text-primary " +
      outlineTreeRowClasses;
    OutlineGlyphsClassNames_4 =
      "bg-transparent text-secondary hover:bg-fill-ghost-hover";
    OutlineGlyphsResolvedValue_3 =
      "bg-fill-ghost-selected text-secondary " + outlineTreeRowClasses;
    OutlineGlyphsConstant_4 = 6;
    OutlineGlyphsConstant_5 = 16;
    OutlineGlyphsConstant_6 = 20;
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
        x: bounds.left + OutlineGlyphsConstant_6,
        y: bounds.bottom,
        keyboard: true,
      };
    };
    OutlineGlyphsLabel = (input?: Dynamic): Dynamic => ({
      get label() { return input.label; },
      shortcut: input.hotkey,
      disabled: input.disabled,
      disabledReason: input.disabledReason,
      separatorBefore: input.separatorBefore,
      variant: input.danger === true ? "danger" : undefined,
      onSelect: input.onClick,
    });
  };
}
