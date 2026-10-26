import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";

export function installEditorOutlineNativeMenu(
  runtime: RuntimeBindings,
): () => void {
  var OutlineNativeMenuTitle1RectOvalConfig: Dynamic;
  var OutlineNativeMenuLabelGlyphConfig: Dynamic;
  var OutlineNativeMenuLabelGlyphConfig_2: Dynamic;
  var OutlineNativeMenuLimit: Dynamic;
  var OutlineNativeMenuReplace: Dynamic;
  var OutlineNativeMenuSlice: Dynamic;
  function suppressNativeContextMenu(input?: Dynamic): Dynamic {
    runtime.nativeContextMenuTimeout != null &&
      clearTimeout(runtime.nativeContextMenuTimeout);
    (window as Dynamic).addEventListener(
      "contextmenu",
      runtime.OutlineDcOutlineTarget,
      true,
    );
    runtime.nativeContextMenuTimeout = setTimeout(
      runtime.OutlineDcOutlineRemoveEventListener,
      input
        ? runtime.OutlineDcOutlineConstant_2
        : runtime.OutlineDcOutlineConstant,
    );
  }
  bindRuntimeValue(
    runtime,
    "suppressNativeContextMenu",
    () => suppressNativeContextMenu,
  );
  bindRuntimeValue(
    runtime,
    "OutlineNativeMenuTitle1RectOvalConfig",
    () => OutlineNativeMenuTitle1RectOvalConfig,
    (value) => {
      OutlineNativeMenuTitle1RectOvalConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "OutlineNativeMenuLabelGlyphConfig",
    () => OutlineNativeMenuLabelGlyphConfig,
    (value) => {
      OutlineNativeMenuLabelGlyphConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "OutlineNativeMenuLabelGlyphConfig_2",
    () => OutlineNativeMenuLabelGlyphConfig_2,
    (value) => {
      OutlineNativeMenuLabelGlyphConfig_2 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "OutlineNativeMenuLimit",
    () => OutlineNativeMenuLimit,
    (value) => {
      OutlineNativeMenuLimit = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "OutlineNativeMenuReplace",
    () => OutlineNativeMenuReplace,
    (value) => {
      OutlineNativeMenuReplace = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "OutlineNativeMenuSlice",
    () => OutlineNativeMenuSlice,
    (value) => {
      OutlineNativeMenuSlice = value;
    },
  );
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
