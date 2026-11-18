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
export async function promptRenamePage(deps: { readonly value286: Dynamic; readonly value396: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, pageId?: Dynamic): Promise<Dynamic> {
        let pages: Dynamic = deps.value73.current.pages,
          targetPage: Dynamic =
            pageId === "" && (pages === undefined || pages.length === 0)
              ? defaultCanvasPage
              : pages?.find(
                  (page?: Dynamic): Dynamic => page.id === pageId,
                );
        if (!targetPage) return;
        let enteredName: Dynamic = await promptCanvasValue({
          get title() { return uiMessage("canvas.designCanvas.renamePage"); },
          initialValue: targetPage.name,
          inputLabel: "Page name",
          get confirmLabel() { return uiMessage("canvas.designCanvas.rename"); },
          maxLength: 120,
        });
        clearEscapeReleaseSuppression();
        deps.value286.current?.focus({
          preventScroll: true,
        });
        let newName: Dynamic =
          enteredName === null
            ? undefined
            : PlatformFileContentSlice(enteredName);
        if (newName === undefined || newName === targetPage.name) return;
        let manifest: Dynamic = deps.value73.current,
          hasPages: Dynamic =
            manifest.pages !== undefined && manifest.pages.length > 0,
          pageList: Dynamic = hasPages ? [...manifest.pages] : [targetPage],
          currentPage: Dynamic = pageList.find(
            (page?: Dynamic): Dynamic => page.id === targetPage.id,
          );
        if (!currentPage || currentPage.name === newName) return;
        let renamedPages: Dynamic = pageList.map(
          (page?: Dynamic): Dynamic =>
            page.id === targetPage.id
              ? {
                  ...page,
                  name: newName,
                }
              : page,
        );
        deps.value396.current(
          {
            kind: "page-rename",
            id: currentPage.id,
            from: currentPage.name,
            to: newName,
            ...(hasPages
              ? {}
              : {
                  first: currentPage,
                }),
          },
          new Set(),
        );
        deps.value98({
          ...manifest,
          pages: renamedPages,
        });
      }

/** 渲染页面列表中的单个页面项及其操作菜单（重命名、删除）；没有页面时使用默认 Page 1。 */
export function renderPageTabItem(deps: { readonly editing: Dynamic; readonly value275: Dynamic; readonly value281: Dynamic; readonly value283: Dynamic; readonly value298: Dynamic; readonly value299: Dynamic; readonly value301: Dynamic; readonly value306: Dynamic; readonly value455: Dynamic; readonly value67: Dynamic; readonly value77: Dynamic; readonly value79: Dynamic }, page?: Dynamic): Dynamic {
            let isActivePage: Dynamic = page.id === deps.value79 && !deps.value283,
              artboardCount: Dynamic = deps.value67.artboards.filter(
                (artboard?: Dynamic): Dynamic =>
                  designPageId(artboard, deps.value67.pages) ===
                  page.id,
              ).length;
            return (() => {
              const RowTag = "div";
              const rowProps = {
                className: "flex items-center gap-0.5",
                children: [
                  <div className={"min-w-0 flex-1"}>
                    <EditorMenuItem
                      icon={null}
                      checked={isActivePage}
                      onClick={(): Dynamic => {
                        deps.value281(false);
                        deps.value283 && deps.value301();
                        page.id === deps.value79
                          ? deps.value299()
                          : page.id !== "" &&
                            deps.value275((): Dynamic => deps.value298(page.id));
                      }}
                    >
                      <span className={"relative min-w-0 flex-1 truncate"}>
                        {page.name}
                        <span className={"sr-only"}>
                          {", artboards: "}
                          {artboardCount}
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
                        uiMessage("canvas.designCanvas.pageActions", { value1: String(page.name) })
                      }
                      className={"shrink-0"}
                      items={[
                        {
                          get label() { return uiMessage("canvas.designCanvas.rename"); },
                          onSelect: (): Dynamic => {
                            deps.value281(false);
                            deps.value306(page.id);
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
                              deps.value455(page.id);
                            });
                          },
                        },
                      ]}
                    />
                  ) : null,
                ],
              } as const;
              const rowKey = page.id || "implicit";
              return <RowTag key={rowKey} {...rowProps} />;
            })();
          }
