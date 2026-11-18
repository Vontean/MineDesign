import { EditorMenuItem } from "../../editor/chrome/menu-item";
import { MenuMenuAssignValue } from "../../cds/menu/menu";
import { PlatformFileContentSlice } from "../../platform/file-content";
import { clearEscapeReleaseSuppression } from "../../editor/chrome/popover";
import { defaultCanvasPage } from "../manifest-history";
import { designPageId } from "../../platform/file-content";
import { promptCanvasValue } from "../dialogs";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { canvasNeedsPageMessage } from "../design-canvas";

/** 页面菜单选择重命名时运行：弹窗输入新页面名，写入清单并恢复焦点。 */
export async function promptRenamePage(deps: { readonly value286: Dynamic; readonly value396: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        let pages: Dynamic = deps.value73.current.pages,
          value653: Dynamic =
            input === "" && (pages === undefined || pages.length === 0)
              ? defaultCanvasPage
              : pages?.find(
                  (input2?: Dynamic): Dynamic => input2.id === input,
                );
        if (!value653) return;
        let value654: Dynamic = await promptCanvasValue({
          get title() { return uiMessage("canvas.designCanvas.renamePage"); },
          initialValue: value653.name,
          inputLabel: "Page name",
          get confirmLabel() { return uiMessage("canvas.designCanvas.rename"); },
          maxLength: 120,
        });
        clearEscapeReleaseSuppression();
        deps.value286.current?.focus({
          preventScroll: true,
        });
        let value655: Dynamic =
          value654 === null
            ? undefined
            : PlatformFileContentSlice(value654);
        if (value655 === undefined || value655 === value653.name) return;
        let current4: Dynamic = deps.value73.current,
          value656: Dynamic =
            current4.pages !== undefined && current4.pages.length > 0,
          value657: Dynamic = value656 ? [...current4.pages] : [value653],
          value658: Dynamic = value657.find(
            (input2?: Dynamic): Dynamic => input2.id === value653.id,
          );
        if (!value658 || value658.name === value655) return;
        let value659: Dynamic = value657.map(
          (input2?: Dynamic): Dynamic =>
            input2.id === value653.id
              ? {
                  ...input2,
                  name: value655,
                }
              : input2,
        );
        deps.value396.current(
          {
            kind: "page-rename",
            id: value658.id,
            from: value658.name,
            to: value655,
            ...(value656
              ? {}
              : {
                  first: value658,
                }),
          },
          new Set(),
        );
        deps.value98({
          ...current4,
          pages: value659,
        });
      }

/** 渲染页面列表中的单个页面项及其操作菜单（重命名、删除）；没有页面时使用默认 Page 1。 */
export function renderPageTabItem(deps: { readonly editing: Dynamic; readonly value275: Dynamic; readonly value281: Dynamic; readonly value283: Dynamic; readonly value298: Dynamic; readonly value299: Dynamic; readonly value301: Dynamic; readonly value306: Dynamic; readonly value455: Dynamic; readonly value67: Dynamic; readonly value77: Dynamic; readonly value79: Dynamic }, input?: Dynamic): Dynamic {
            let value653: Dynamic = input.id === deps.value79 && !deps.value283,
              length: Dynamic = deps.value67.artboards.filter(
                (input2?: Dynamic): Dynamic =>
                  designPageId(input2, deps.value67.pages) ===
                  input.id,
              ).length;
            return (() => {
              const _Component = "div";
              const _props = {
                className: "flex items-center gap-0.5",
                children: [
                  <div className={"min-w-0 flex-1"}>
                    <EditorMenuItem
                      icon={null}
                      checked={value653}
                      onClick={(): Dynamic => {
                        deps.value281(false);
                        deps.value283 && deps.value301();
                        input.id === deps.value79
                          ? deps.value299()
                          : input.id !== "" &&
                            deps.value275((): Dynamic => deps.value298(input.id));
                      }}
                    >
                      <span className={"relative min-w-0 flex-1 truncate"}>
                        {input.name}
                        <span className={"sr-only"}>
                          {", artboards: "}
                          {length}
                        </span>
                      </span>
                    </EditorMenuItem>
                  </div>,
                  deps.editing ? (
                    <MenuMenuAssignValue
                      iconOnly={true}
                      icon={"DotsHorizontal"}
                      variant={"ghost"}
                      align={"end"}
                      disabled={false}
                      disabledReason={undefined}
                      aria-label={
                        uiMessage("canvas.designCanvas.pageActions", { value1: String(input.name) })
                      }
                      className={"shrink-0"}
                      items={[
                        {
                          get label() { return uiMessage("canvas.designCanvas.rename"); },
                          onSelect: (): Dynamic => {
                            deps.value281(false);
                            deps.value306(input.id);
                          },
                        },
                        {
                          get label() { return uiMessage("canvas.designCanvas.delete"); },
                          variant: "danger",
                          disabled: deps.value77.length < 2,
                          disabledReason: canvasNeedsPageMessage,
                          onSelect: (): Dynamic => {
                            deps.value281(false);
                            deps.value275((): Dynamic => {
                              deps.value455(input.id);
                            });
                          },
                        },
                      ]}
                    />
                  ) : null,
                ],
              } as const;
              const _key = input.id || "implicit";
              return <_Component key={_key} {..._props} />;
            })();
          }
