import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";
export function installEditorChromeToolSelector(
  runtime: RuntimeBindings,
): () => void {
  var CanvasToolSelector: Dynamic;
  bindRuntimeValue(
    runtime,
    "CanvasToolSelector",
    () => CanvasToolSelector,
    (value) => {
      CanvasToolSelector = value;
    },
  );
  return () => {
    CanvasToolSelector = (0, runtime.reactCanvasShape_2.memo)(function ({
      tool: tool,
      onPick: onPick,
      canvasTools = true,
    }: Dynamic): Dynamic {
      let t: Dynamic = (0, runtime.useUiText)(),
        value: Dynamic = (0, runtime.usePhoneCanvas)(),
        value2: Dynamic = value
          ? runtime.insertDesignTools
          : runtime.shapeDesignTools,
        [value3, value4]: Dynamic = (0, runtime.reactCanvasShape_2.useState)(
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
            : (0, runtime.isHostOnlyDesignTool)(input)
              ? value5
              : undefined,
        callback3: Dynamic = (event?: Dynamic): Dynamic => {
          if (!value3 || event.metaKey || event.ctrlKey || event.altKey) return;
          let value7: Dynamic = (0, runtime.designToolForShortcut)(
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
          <runtime.ToolbarPrimitivesComponent
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
            const _Component = runtime.MenuMenuAssignValue.Item;
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
        <runtime.TooltipGroup>
          {callback4("select", t.toolSelect, "esc", {
            icon: "Cursor",
          })}
          {value ? (null) : (<runtime.jsxInspectorEditor.Fragment>
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
                  glyph: runtime.SessionTouchAndHistoryJsxValue_2,
                },
                value5,
              )}
              {callback4("text", t.toolText, "t", {
                glyph: runtime.SessionTouchAndHistoryJsxValue,
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
            </runtime.jsxInspectorEditor.Fragment>)}
          <span className={"contents"} onKeyDownCapture={callback3}>
            <runtime.SessionStripPopover
              {...(value
                ? (runtime.designToolIcons[tool] ?? runtime.insertMenuIcon)
                : runtime.shapesMenuIcon)}
              iconOnly={true}
              caret={true}
              label={
                value ? (runtime.designToolLabels[tool] ? (((t.toolTools) + (": ")) + (runtime.designToolLabels[tool])) : (t.toolTools)) : (t.toolShapes)
              }
              tip={value ? t.toolsTip : t.shapesTip}
              pressed={value2.includes(tool)}
              data-testid={value ? "dc-tool-add" : "dc-tool-shapes"}
              open={value3}
              onOpenChange={value4}
            >
              <runtime.MenuMenuAssignValue.Group
                aria-label={value ? (t.toolTools) : (t.shapesTip)}
                data-dc-tool-menu={""}
              >
                {value ? (<runtime.jsxInspectorEditor.Fragment>
                    {callback5({
                      tool: "hand",
                      get label() { return t.toolHand; },
                      shortcut: "h",
                      icon: "Hand",
                    })}
                    <runtime.MenuMenuAssignValue.Separator />
                    {callback5({
                      tool: "frame",
                      get label() { return t.toolFrame; },
                      shortcut: "f",
                      icon: runtime.SessionTouchAndHistoryJsxValue_2,
                    })}
                    {callback5({
                      tool: "text",
                      get label() { return t.toolText; },
                      shortcut: "t",
                      icon: runtime.SessionTouchAndHistoryJsxValue,
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
                    <runtime.MenuMenuAssignValue.Separator />
                  </runtime.jsxInspectorEditor.Fragment>) : (null)}
                {callback5({
                  tool: "rect",
                  get label() { return t.shapeRect; },
                  shortcut: "r",
                  icon: (0, runtime.ShapeToolGlyph)(
                    runtime.ChromeToolIconsRectOvalConfig.rect,
                  ),
                })}
                {callback5({
                  tool: "oval",
                  get label() { return t.shapeOval; },
                  shortcut: "o",
                  icon: (0, runtime.ShapeToolGlyph)(
                    runtime.ChromeToolIconsRectOvalConfig.oval,
                  ),
                })}
                <runtime.MenuMenuAssignValue.Separator />
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
              </runtime.MenuMenuAssignValue.Group>
            </runtime.SessionStripPopover>
          </span>
        </runtime.TooltipGroup>
      );
    });
  };
}
