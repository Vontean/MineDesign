import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { canvasShapeReact as React } from "../../canvas/shape";
import { MenuMenuAssignValue } from "../../cds/menu/menu";
import { TooltipGroup } from "../../cds/tooltip/tooltip";
import { useUiText } from "../../comments/feedback-panel";
import { ChromeToolIconsRectOvalConfig } from "./tool-icons";
import { jsxInspectorEditor } from "../inspector/editor";
import { SessionStripPopover } from "../session-strip/popover";
import { SessionTouchAndHistoryJsxValue as TextToolGlyph, frameToolGlyph as FrameToolGlyph } from "../session/touch-and-history";
import { usePhoneCanvas } from "../toolbar/layout";
import { ToolbarPrimitivesComponent } from "../toolbar/primitives";
import { designToolForShortcut, designToolIcons, designToolLabels, insertDesignTools, insertMenuIcon, isHostOnlyDesignTool, shapeDesignTools, shapesMenuIcon, ShapeToolGlyph } from "../tools";

var CanvasToolSelector: Dynamic;
export {
  CanvasToolSelector,
};
export function installEditorChromeToolSelector(): () => void {
  return () => {
    CanvasToolSelector = (0, React.memo)(function ({
      tool: tool,
      onPick: onPick,
      canvasTools = true,
    }: Dynamic): Dynamic {
      let t: Dynamic = useUiText(),
        isPhoneCanvas: Dynamic = usePhoneCanvas(),
        menuTools: Dynamic = isPhoneCanvas
          ? insertDesignTools
          : shapeDesignTools,
        [isMenuOpen, setIsMenuOpen]: Dynamic = (0, React.useState)(
          false,
        ),
        pickTool: Dynamic = (pickedTool?: Dynamic): Dynamic => {
          setIsMenuOpen(false);
          onPick(pickedTool);
        },
        frameDisabledReason: Dynamic = undefined,
        handDisabledReason: Dynamic = undefined,
        getDisabledReason: Dynamic = (toolName?: Dynamic): Dynamic =>
          toolName === "hand"
            ? handDisabledReason
            : isHostOnlyDesignTool(toolName)
              ? frameDisabledReason
              : undefined,
        handleMenuKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
          if (!isMenuOpen || event.metaKey || event.ctrlKey || event.altKey) return;
          let shortcutTool: Dynamic = designToolForShortcut(
            event.key,
            event.shiftKey,
          );
          shortcutTool !== null &&
            (event.preventDefault(),
            event.stopPropagation(),
            getDisabledReason(shortcutTool) === undefined && pickTool(shortcutTool));
        },
        renderToolButton: Dynamic = (
          toolName?: Dynamic,
          label?: Dynamic,
          shortcut?: Dynamic,
          iconProps?: Dynamic,
          disabledReason?: Dynamic,
        ): Dynamic => (
          <ToolbarPrimitivesComponent
            {...iconProps}
            iconOnly={true}
            label={label}
            shortcut={shortcut}
            tipSide={"top"}
            pressed={
              tool === toolName || (toolName === "select" && tool === "vector")
            }
            disabled={disabledReason !== undefined}
            disabledTip={disabledReason}
            data-testid={"dc-tool-" + toolName}
            onClick={(): Dynamic => pickTool(toolName)}
          />
        ),
        renderMenuItem: Dynamic = (request?: Dynamic): Dynamic => {
          let disabledReason: Dynamic = getDisabledReason(request.tool);
          return (() => {
            const _Component = MenuMenuAssignValue.Item;
            const _props = {
              "data-testid": "dc-tool-" + request.tool,
              icon: request.icon,
              shortcut: request.shortcut,
              checked: tool === request.tool,
              checkedRole: "radio",
              disabled: disabledReason !== undefined,
              disabledReason: disabledReason ?? null,
              onClick: (): Dynamic => pickTool(request.tool),
              children: request.label,
            } as const;
            const _key = request.tool;
            return <_Component key={_key} {..._props} />;
          })();
        };
      return (
        <TooltipGroup>
          {renderToolButton("select", t.toolSelect, "esc", {
            icon: "Cursor",
          })}
          {isPhoneCanvas ? (null) : (<jsxInspectorEditor.Fragment>
              {renderToolButton(
                "hand",
                t.toolHand,
                "h",
                {
                  icon: "Hand",
                },
                handDisabledReason,
              )}
              {renderToolButton(
                "frame",
                t.toolFrame,
                "f",
                {
                  glyph: FrameToolGlyph,
                },
                frameDisabledReason,
              )}
              {renderToolButton("text", t.toolText, "t", {
                glyph: TextToolGlyph,
              })}
              {renderToolButton(
                "note",
                t.toolNote,
                "n",
                {
                  icon: "Note",
                },
                frameDisabledReason,
              )}
              {renderToolButton("draw", t.toolDraw, "p", {
                icon: "Edit",
              })}
            </jsxInspectorEditor.Fragment>)}
          <span className={"contents"} onKeyDownCapture={handleMenuKeyDown}>
            <SessionStripPopover
              {...(isPhoneCanvas
                ? (designToolIcons[tool] ?? insertMenuIcon)
                : shapesMenuIcon)}
              iconOnly={true}
              caret={true}
              label={
                isPhoneCanvas ? (designToolLabels[tool] ? (((t.toolTools) + (": ")) + (designToolLabels[tool])) : (t.toolTools)) : (t.toolShapes)
              }
              tip={isPhoneCanvas ? t.toolsTip : t.shapesTip}
              pressed={menuTools.includes(tool)}
              data-testid={isPhoneCanvas ? "dc-tool-add" : "dc-tool-shapes"}
              open={isMenuOpen}
              onOpenChange={setIsMenuOpen}
            >
              <MenuMenuAssignValue.Group
                aria-label={isPhoneCanvas ? (t.toolTools) : (t.shapesTip)}
                data-dc-tool-menu={""}
              >
                {isPhoneCanvas ? (<jsxInspectorEditor.Fragment>
                    {renderMenuItem({
                      tool: "hand",
                      get label() { return t.toolHand; },
                      shortcut: "h",
                      icon: "Hand",
                    })}
                    <MenuMenuAssignValue.Separator />
                    {renderMenuItem({
                      tool: "frame",
                      get label() { return t.toolFrame; },
                      shortcut: "f",
                      icon: FrameToolGlyph,
                    })}
                    {renderMenuItem({
                      tool: "text",
                      get label() { return t.toolText; },
                      shortcut: "t",
                      icon: TextToolGlyph,
                    })}
                    {renderMenuItem({
                      tool: "note",
                      get label() { return t.toolNote; },
                      shortcut: "n",
                      icon: "Note",
                    })}
                    {renderMenuItem({
                      tool: "draw",
                      get label() { return t.toolDraw; },
                      shortcut: "p",
                      icon: "Edit",
                    })}
                    <MenuMenuAssignValue.Separator />
                  </jsxInspectorEditor.Fragment>) : (null)}
                {renderMenuItem({
                  tool: "rect",
                  get label() { return t.shapeRect; },
                  shortcut: "r",
                  icon: ShapeToolGlyph(
                    ChromeToolIconsRectOvalConfig.rect,
                  ),
                })}
                {renderMenuItem({
                  tool: "oval",
                  get label() { return t.shapeOval; },
                  shortcut: "o",
                  icon: ShapeToolGlyph(
                    ChromeToolIconsRectOvalConfig.oval,
                  ),
                })}
                <MenuMenuAssignValue.Separator />
                {renderMenuItem({
                  tool: "arrow",
                  get label() { return t.shapeArrow; },
                  shortcut: "shift+l",
                  icon: "ArrowLine",
                })}
                {renderMenuItem({
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
