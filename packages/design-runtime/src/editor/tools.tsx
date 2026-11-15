import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { Icon } from "../cds/components/icon";
import { npm_useEventListener_bc } from "../dependencies";
import { ChromeToolIconsRectOvalConfig } from "./chrome/tool-icons";
import { CanvasToolSelector } from "./chrome/tool-selector";
import { useLatestCallback } from "./hooks/latest-callback";
import { isPropertyEditorTarget } from "./keyboard/find";
import { shouldKeepLocalKeyboardEvent } from "./keyboard/paste";
import { B6b0a7Value, defaultAnnotationStrokeColor } from "./media/video-playback";
import { SessionTouchAndHistoryJsxValue, SessionTouchAndHistoryJsxValue_2 } from "./session/touch-and-history";
import { lineDrawingHtml } from "./svg/drawing";
import { TextPlaceholderLabel } from "./text/placeholder";
import { hasBlockingEditorOverlay } from "./text/typing-target";
import { toolbarDensity } from "./toolbar/layout";
import { CdsIsland } from "../platform/cds-island";

var isHostOnlyDesignTool: Dynamic;
var runtimeDesignTool: Dynamic;
var shapeDesignTools: Dynamic;
var insertDesignTools: Dynamic;
var designToolLabels: Dynamic;
var ShapeToolGlyph: Dynamic;
var shapesMenuIcon: Dynamic;
var insertMenuIcon: Dynamic;
var designToolIcons: Dynamic;
var defaultRectangleSize: Dynamic;
var defaultOvalSize: Dynamic;
var defaultLineLength: Dynamic;
var drawToolExitGracePeriodMs: Dynamic;
var defaultToolTemplates: Dynamic;
var passiveEditorEvents: Dynamic;
var clickPlacementTools: Dynamic;
var defaultClickPlacementSizes: Dynamic;
function DesignToolToolbar({ tool: tool, onTool: onTool }: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, toolbarDensity)(),
    value2: Dynamic = (0, useLatestCallback)(
      (input?: Dynamic): Dynamic =>
        onTool(input === tool && input !== "select" ? "select" : input),
    );
  (0, npm_useEventListener_bc)(
    "keydown",
    (event?: Dynamic): Dynamic => {
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.metaKey ||
        event.ctrlKey ||
        event.altKey
      )
        return;
      let value3: Dynamic =
        event.target instanceof HTMLElement ? event.target : null;
      if (
        value3 !== null &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(value3.tagName) ||
          value3.isContentEditable)
      )
        return;
      if (event.key === "Escape") {
        if (tool === "select" || (0, hasBlockingEditorOverlay)())
          return;
        event.preventDefault();
        onTool("select");
        return;
      }
      if (
        (0, isPropertyEditorTarget)(value3) ||
        value3?.closest("[data-mega-selection-strip]") != null ||
        (0, shouldKeepLocalKeyboardEvent)(event) ||
        (0, hasBlockingEditorOverlay)()
      )
        return;
      let value4: Dynamic = designToolForShortcut(event.key, event.shiftKey);
      value4 !== null && (event.preventDefault(), value2(value4));
    },
  );
  return (
    <CdsIsland density={value} className={"contents"}>
      <CanvasToolSelector tool={tool} onPick={value2} />
    </CdsIsland>
  );
}
function designToolForShortcut(key?: Dynamic, shiftKey?: Dynamic): Dynamic {
  let value: Dynamic = key.toLowerCase();
  if (shiftKey) return value === "l" ? "arrow" : null;
  switch (value) {
    case "h":
      return "hand";
    case "r":
      return "rect";
    case "f":
      return "frame";
    case "n":
      return "note";
    case "o":
      return "oval";
    case "t":
      return "text";
    case "l":
      return "line";
    case "p":
      return "draw";
    default:
      return null;
  }
}
function supportsClickPlacement(tool?: Dynamic): Dynamic {
  return tool != null && clickPlacementTools.has(tool);
}
function focusProModeButton(editorRoot?: Dynamic): Dynamic {
  (document as Dynamic).hasFocus() &&
    editorRoot?.querySelector('[data-testid="dc-mode-pro"]')?.focus({
      preventScroll: true,
    });
}
export {
  clickPlacementTools,
  defaultClickPlacementSizes,
  defaultLineLength,
  defaultOvalSize,
  defaultRectangleSize,
  defaultToolTemplates,
  designToolForShortcut,
  designToolIcons,
  designToolLabels,
  DesignToolToolbar,
  drawToolExitGracePeriodMs,
  focusProModeButton,
  insertDesignTools,
  insertMenuIcon,
  isHostOnlyDesignTool,
  passiveEditorEvents,
  runtimeDesignTool,
  shapeDesignTools,
  shapesMenuIcon,
  ShapeToolGlyph,
  supportsClickPlacement,
};
export function installEditorTools(): () => void {
  return () => {
    isHostOnlyDesignTool = (input?: Dynamic): Dynamic =>
      input === "frame" || input === "note" || input === "hand";
    runtimeDesignTool = (input?: Dynamic): Dynamic =>
      input === "note" || input === "hand" ? "select" : input;
    shapeDesignTools = ["rect", "oval", "arrow", "line"];
    insertDesignTools = [
      "hand",
      "text",
      "frame",
      "note",
      "draw",
      ...shapeDesignTools,
    ];
    designToolLabels = {
      get hand() { return uiMessage("inspector.tools.hand"); },
      get text() { return uiMessage("inspector.tools.text"); },
      get frame() { return uiMessage("inspector.tools.frame"); },
      get note() { return uiMessage("inspector.tools.note"); },
      get draw() { return uiMessage("inspector.tools.draw"); },
      get rect() { return uiMessage("inspector.tools.rectangle"); },
      get oval() { return uiMessage("inspector.tools.oval"); },
      get arrow() { return uiMessage("inspector.tools.arrow"); },
      get line() { return uiMessage("inspector.tools.line"); },
    };
    ShapeToolGlyph = (input?: Dynamic): Dynamic => (
      <Icon customIcon={input} size={"auto"} className={"shrink-0"} />
    );
    shapesMenuIcon = {
      icon: "Shapes",
    };
    insertMenuIcon = {
      icon: "Add",
    };
    designToolIcons = {
      hand: {
        icon: "Hand",
      },
      text: {
        glyph: SessionTouchAndHistoryJsxValue,
      },
      frame: {
        glyph: SessionTouchAndHistoryJsxValue_2,
      },
      note: {
        icon: "Note",
      },
      draw: {
        icon: "Edit",
      },
      rect: {
        glyph: (
          <Icon
            customIcon={ChromeToolIconsRectOvalConfig.rect}
            size={"auto"}
          />
        ),
      },
      oval: {
        glyph: (
          <Icon
            customIcon={ChromeToolIconsRectOvalConfig.oval}
            size={"auto"}
          />
        ),
      },
      arrow: {
        icon: "ArrowLine",
      },
      line: {
        icon: "LineSegment",
      },
    };
    defaultRectangleSize = 120;
    defaultOvalSize = 96;
    defaultLineLength = 160;
    drawToolExitGracePeriodMs = 5e3;
    defaultToolTemplates = {
      rect: `<div style="box-sizing: border-box; display: flex; flex-direction: column; width: ${defaultRectangleSize}px; height: ${defaultRectangleSize}px; background-color: ${B6b0a7Value}; border-radius: 8px"></div>`,
      frame:
        '<div style="box-sizing: border-box; display: flex; flex-direction: column; gap: 12px; padding: 16px; background-color: #ffffff; border-radius: 2px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08)"></div>',
      grid: '<div style="box-sizing: border-box; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 16px; background-color: #ffffff; border-radius: 2px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08)"></div>',
      oval: `<div style="box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; width: ${defaultOvalSize}px; height: ${defaultOvalSize}px; background-color: ${B6b0a7Value}; border-radius: 50%"></div>`,
      text: `<div style="font-size: 16px; line-height: 1">${TextPlaceholderLabel}</div>`,
      arrow: "",
      line: (0, lineDrawingHtml)(
        defaultLineLength,
        0,
        1,
        1,
        "",
        defaultAnnotationStrokeColor,
      ),
      draw: "",
      note: "",
      interact: "",
      vector: "",
    };
    passiveEditorEvents = new Set([
      "select",
      "chrome",
      "directiveState",
      "zoom",
      "panZoom",
      "pointerPresence",
      "pointerAt",
      "dragState",
      "canvasPointerDown",
      "contextMenu",
    ]);
    clickPlacementTools = new Set(["text", "rect", "oval", "arrow", "line"]);
    defaultClickPlacementSizes = {
      text: [0, 0],
      rect: [defaultRectangleSize, defaultRectangleSize],
      oval: [defaultOvalSize, defaultOvalSize],
      arrow: [defaultLineLength, 0],
      line: [defaultLineLength, 0],
    };
  };
}
