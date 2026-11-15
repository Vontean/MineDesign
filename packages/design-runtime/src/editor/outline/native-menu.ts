import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { nativeContextMenuTimeout, OutlineDcOutlineConstant, OutlineDcOutlineConstant_2, OutlineDcOutlineRemoveEventListener, OutlineDcOutlineTarget } from "./dc-outline";

import { set_nativeContextMenuTimeout } from "./dc-outline";
var OutlineNativeMenuTitle1RectOvalConfig: Dynamic;
var OutlineNativeMenuLabelGlyphConfig: Dynamic;
var OutlineNativeMenuLabelGlyphConfig_2: Dynamic;
var OutlineNativeMenuLimit: Dynamic;
var OutlineNativeMenuReplace: Dynamic;
var OutlineNativeMenuSlice: Dynamic;
function suppressNativeContextMenu(input?: Dynamic): Dynamic {
  nativeContextMenuTimeout != null &&
    clearTimeout(nativeContextMenuTimeout);
  (window as Dynamic).addEventListener(
    "contextmenu",
    OutlineDcOutlineTarget,
    true,
  );
  set_nativeContextMenuTimeout(setTimeout(
    OutlineDcOutlineRemoveEventListener,
    input
      ? OutlineDcOutlineConstant_2
      : OutlineDcOutlineConstant,
  ));
}
export {
  OutlineNativeMenuLabelGlyphConfig,
  OutlineNativeMenuLabelGlyphConfig_2,
  OutlineNativeMenuLimit,
  OutlineNativeMenuReplace,
  OutlineNativeMenuSlice,
  OutlineNativeMenuTitle1RectOvalConfig,
  suppressNativeContextMenu,
};
export function installEditorOutlineNativeMenu(): () => void {
  return () => {
    OutlineNativeMenuTitle1RectOvalConfig = {
      title1: {
        get label() { return uiMessage("inspector.nativeMenu.title"); },
        glyph: "title",
      },
      rect: {
        get label() { return uiMessage("inspector.nativeMenu.rectangle"); },
        glyph: "rect",
      },
      oval: {
        get label() { return uiMessage("inspector.nativeMenu.oval"); },
        glyph: "oval",
      },
      line: {
        get label() { return uiMessage("inspector.nativeMenu.line"); },
        glyph: "line",
      },
      arrow: {
        get label() { return uiMessage("inspector.nativeMenu.arrow"); },
        glyph: "arrow",
      },
      pen: {
        get label() { return uiMessage("inspector.nativeMenu.drawing"); },
        glyph: "pen",
      },
      image: {
        get label() { return uiMessage("inspector.nativeMenu.image"); },
        glyph: "image",
      },
    };
    OutlineNativeMenuLabelGlyphConfig = {
      get label() { return uiMessage("inspector.nativeMenu.note"); },
      glyph: "note",
    };
    OutlineNativeMenuLabelGlyphConfig_2 = {
      get label() { return uiMessage("inspector.nativeMenu.video"); },
      glyph: "image",
    };
    OutlineNativeMenuLimit = 26;
    OutlineNativeMenuReplace = (input?: Dynamic): Dynamic =>
      input.trim().replace(/\s+/g, " ");
    OutlineNativeMenuSlice = (input?: Dynamic): Dynamic => {
      let value: Dynamic = OutlineNativeMenuReplace(input);
      return value.length > OutlineNativeMenuLimit
        ? `${value.slice(0, OutlineNativeMenuLimit)}\u2026`
        : value;
    };
  };
}
