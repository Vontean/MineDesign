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
import { SessionTouchAndHistoryJsxValue, frameToolGlyph as frameHashGlyph } from "./session/touch-and-history";
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
  let value: Dynamic = toolbarDensity(),
    pickTool: Dynamic = useLatestCallback(
      (nextTool?: Dynamic): Dynamic =>
        onTool(nextTool === tool && nextTool !== "select" ? "select" : nextTool),
    );
  npm_useEventListener_bc(
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
      let eventTarget: Dynamic =
        event.target instanceof HTMLElement ? event.target : null;
      if (
        eventTarget !== null &&
        (/^(INPUT|TEXTAREA|SELECT)$/.test(eventTarget.tagName) ||
          eventTarget.isContentEditable)
      )
        return;
      if (event.key === "Escape") {
        if (tool === "select" || hasBlockingEditorOverlay())
          return;
        event.preventDefault();
        onTool("select");
        return;
      }
      if (
        isPropertyEditorTarget(eventTarget) ||
        eventTarget?.closest("[data-mega-selection-strip]") != null ||
        shouldKeepLocalKeyboardEvent(event) ||
        hasBlockingEditorOverlay()
      )
        return;
      let shortcutTool: Dynamic = designToolForShortcut(event.key, event.shiftKey);
      shortcutTool !== null && (event.preventDefault(), pickTool(shortcutTool));
    },
  );
  return (
    <CdsIsland density={value} className={"contents"}>
      <CanvasToolSelector tool={tool} onPick={pickTool} />
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
    isHostOnlyDesignTool = (tool?: Dynamic): Dynamic =>
      tool === "frame" || tool === "note" || tool === "hand";
    runtimeDesignTool = (tool?: Dynamic): Dynamic =>
      tool === "note" || tool === "hand" ? "select" : tool;
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
    ShapeToolGlyph = (iconName?: Dynamic): Dynamic => (
      <Icon customIcon={iconName} size={"auto"} className={"shrink-0"} />
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
        glyph: frameHashGlyph,
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
      line: lineDrawingHtml(
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
