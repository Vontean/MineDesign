import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { reactCanvasShape_2 } from "../../canvas/shape";
import { MenuMenuAssignValue } from "../../cds/menu/menu";
import { TooltipGroup } from "../../cds/tooltip/tooltip";
import { useUiText } from "../../comments/feedback-panel";
import { ChromeToolIconsRectOvalConfig } from "./tool-icons";
import { jsxInspectorEditor } from "../inspector/editor";
import { SessionStripPopover } from "../session-strip/popover";
import { SessionTouchAndHistoryJsxValue, SessionTouchAndHistoryJsxValue_2 } from "../session/touch-and-history";
import { usePhoneCanvas } from "../toolbar/layout";
import { ToolbarPrimitivesComponent } from "../toolbar/primitives";
import { designToolForShortcut, designToolIcons, designToolLabels, insertDesignTools, insertMenuIcon, isHostOnlyDesignTool, shapeDesignTools, shapesMenuIcon, ShapeToolGlyph } from "../tools";

var CanvasToolSelector: Dynamic;
export {
  CanvasToolSelector,
};
export function installEditorChromeToolSelector(): () => void {
  return () => {
    CanvasToolSelector = (0, reactCanvasShape_2.memo)(function ({
      tool: tool,
      onPick: onPick,
      canvasTools = true,
    }: Dynamic): Dynamic {
      let t: Dynamic = useUiText(),
        value: Dynamic = usePhoneCanvas(),
        value2: Dynamic = value
          ? insertDesignTools
          : shapeDesignTools,
        [value3, value4]: Dynamic = (0, reactCanvasShape_2.useState)(
          false,
        ),
        callback: Dynamic = (input?: Dynamic): Dynamic => {
          value4(false);
          onPick(input);
        },
        value5: Dynamic = undefined,
        value6: Dynamic = undefined,
        callback2: Dynamic = (input?: Dynamic): Dynamic =>
          input === "hand"
            ? value6
            : isHostOnlyDesignTool(input)
              ? value5
              : undefined,
        callback3: Dynamic = (event?: Dynamic): Dynamic => {
          if (!value3 || event.metaKey || event.ctrlKey || event.altKey) return;
          let value7: Dynamic = designToolForShortcut(
            event.key,
            event.shiftKey,
          );
          value7 !== null &&
            (event.preventDefault(),
            event.stopPropagation(),
            callback2(value7) === undefined && callback(value7));
        },
        callback4: Dynamic = (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
          value7?: Dynamic,
          extra?: Dynamic,
        ): Dynamic => (
          <ToolbarPrimitivesComponent
            {...value7}
            iconOnly={true}
            label={options}
            shortcut={context}
            tipSide={"top"}
            pressed={
              tool === input || (input === "select" && tool === "vector")
            }
            disabled={extra !== undefined}
            disabledTip={extra}
            data-testid={"dc-tool-" + input}
            onClick={(): Dynamic => callback(input)}
          />
        ),
        callback5: Dynamic = (request?: Dynamic): Dynamic => {
          let value7: Dynamic = callback2(request.tool);
          return (() => {
            const _Component = MenuMenuAssignValue.Item;
            const _props = {
              "data-testid": "dc-tool-" + request.tool,
              icon: request.icon,
              shortcut: request.shortcut,
              checked: tool === request.tool,
              checkedRole: "radio",
              disabled: value7 !== undefined,
              disabledReason: value7 ?? null,
              onClick: (): Dynamic => callback(request.tool),
              children: request.label,
            } as const;
            const _key = request.tool;
            return <_Component key={_key} {..._props} />;
          })();
        };
      return (
        <TooltipGroup>
          {callback4("select", t.toolSelect, "esc", {
            icon: "Cursor",
          })}
          {value ? (null) : (<jsxInspectorEditor.Fragment>
              {callback4(
                "hand",
                t.toolHand,
                "h",
                {
                  icon: "Hand",
                },
                value6,
              )}
              {callback4(
                "frame",
                t.toolFrame,
                "f",
                {
                  glyph: SessionTouchAndHistoryJsxValue_2,
                },
                value5,
              )}
              {callback4("text", t.toolText, "t", {
                glyph: SessionTouchAndHistoryJsxValue,
              })}
              {callback4(
                "note",
                t.toolNote,
                "n",
                {
                  icon: "Note",
                },
                value5,
              )}
              {callback4("draw", t.toolDraw, "p", {
                icon: "Edit",
              })}
            </jsxInspectorEditor.Fragment>)}
          <span className={"contents"} onKeyDownCapture={callback3}>
            <SessionStripPopover
              {...(value
                ? (designToolIcons[tool] ?? insertMenuIcon)
                : shapesMenuIcon)}
              iconOnly={true}
              caret={true}
              label={
                value ? (designToolLabels[tool] ? (((t.toolTools) + (": ")) + (designToolLabels[tool])) : (t.toolTools)) : (t.toolShapes)
              }
              tip={value ? t.toolsTip : t.shapesTip}
              pressed={value2.includes(tool)}
              data-testid={value ? "dc-tool-add" : "dc-tool-shapes"}
              open={value3}
              onOpenChange={value4}
            >
              <MenuMenuAssignValue.Group
                aria-label={value ? (t.toolTools) : (t.shapesTip)}
                data-dc-tool-menu={""}
              >
                {value ? (<jsxInspectorEditor.Fragment>
                    {callback5({
                      tool: "hand",
                      get label() { return t.toolHand; },
                      shortcut: "h",
                      icon: "Hand",
                    })}
                    <MenuMenuAssignValue.Separator />
                    {callback5({
                      tool: "frame",
                      get label() { return t.toolFrame; },
                      shortcut: "f",
                      icon: SessionTouchAndHistoryJsxValue_2,
                    })}
                    {callback5({
                      tool: "text",
                      get label() { return t.toolText; },
                      shortcut: "t",
                      icon: SessionTouchAndHistoryJsxValue,
                    })}
                    {callback5({
                      tool: "note",
                      get label() { return t.toolNote; },
                      shortcut: "n",
                      icon: "Note",
                    })}
                    {callback5({
                      tool: "draw",
                      get label() { return t.toolDraw; },
                      shortcut: "p",
                      icon: "Edit",
                    })}
                    <MenuMenuAssignValue.Separator />
                  </jsxInspectorEditor.Fragment>) : (null)}
                {callback5({
                  tool: "rect",
                  get label() { return t.shapeRect; },
                  shortcut: "r",
                  icon: ShapeToolGlyph(
                    ChromeToolIconsRectOvalConfig.rect,
                  ),
                })}
                {callback5({
                  tool: "oval",
                  get label() { return t.shapeOval; },
                  shortcut: "o",
                  icon: ShapeToolGlyph(
                    ChromeToolIconsRectOvalConfig.oval,
                  ),
                })}
                <MenuMenuAssignValue.Separator />
                {callback5({
                  tool: "arrow",
                  get label() { return t.shapeArrow; },
                  shortcut: "shift+l",
                  icon: "ArrowLine",
                })}
                {callback5({
                  tool: "line",
                  get label() { return t.shapeLine; },
                  shortcut: "l",
                  icon: "LineSegment",
                })}
              </MenuMenuAssignValue.Group>
            </SessionStripPopover>
          </span>
        </TooltipGroup>
      );
    });
  };
}
