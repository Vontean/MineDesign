import { uiMessage } from "@minedesign/contracts/ui-messages";
import { Counter } from "../../cds/components/counter";
import { MenuMenuAssignValue } from "../../cds/menu/menu";
import { EditorMenuItem } from "../../editor/chrome/menu-item";
import { clearEscapeReleaseSuppression, EditorPopover } from "../../editor/chrome/popover";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { Tooltip } from "../../cds/tooltip/tooltip";
import { Button } from "../../cds/button/button";
import { keyboardShortcutLabel } from "../../editor/keyboard/shortcuts";
import { ToolbarCaret, useToolbarItemAccessibility } from "../../editor/toolbar/primitives";
import { designPageId, PlatformFileContentSlice } from "../../platform/file-content";
import type { Dynamic } from "../../runtime-types";
import { confirmCanvasAction, promptCanvasValue } from "../dialogs";
import { canvasNeedsPageMessage, staleDeleteFailureMessage } from "./messages";
import { defaultCanvasPage } from "../manifest-history";
import type { CanvasManifest, CanvasHistoryStep, DesignPage } from "../manifest-history";
import { canvasPageDeleteConfirmation, canvasPageDeleteSnapshot, planCanvasPageAddition } from "../page-operations";
import type { useCanvasPageMenu } from "./page-menu";

type Ref<T> = { current: T };
interface PageActionOptions {
  manifest: Ref<CanvasManifest>;
  editing: Ref<boolean>;
  trigger: Ref<HTMLElement | null>;
  supportsLoadState: boolean;
  record(step: CanvasHistoryStep, excludedFiles: Set<string>): void;
  persist(manifest: CanvasManifest): void;
  switchPage(page: string): void;
  scheduleFirstArtboard(): void;
  showToast(message: string): void;
  deleteBoards(files: Set<string>, notes: Set<string>, page: { spec: DesignPage; index: number }): void;
}

export function useCanvasPageActions(options: PageActionOptions) {
  const { persist, switchPage, scheduleFirstArtboard, supportsLoadState, showToast } = options;
  const create = React.useCallback(() => {
    const addition = planCanvasPageAddition(options.manifest.current, supportsLoadState);
    if (!addition.ok) {
      showToast(uiMessage("canvas.designCanvas.thisCanvasIsAtIts") + String(addition.limit) + ").");
      return;
    }
    options.record(addition.history, new Set());
    persist(addition.manifest);
    scheduleFirstArtboard();
    switchPage(addition.history.page.id);
  }, [persist, switchPage, showToast, scheduleFirstArtboard]);

  const rename = React.useCallback(async (pageId: string) => {
    const initialPages = options.manifest.current.pages;
    const target = pageId === "" && !initialPages?.length
      ? defaultCanvasPage
      : initialPages?.find(({ id }) => id === pageId);
    if (!target) return;

    const entered = await promptCanvasValue({
      get title() { return uiMessage("canvas.designCanvas.renamePage"); },
      initialValue: target.name,
      inputLabel: "Page name",
      get confirmLabel() { return uiMessage("canvas.designCanvas.rename"); },
      maxLength: 120,
    });
    clearEscapeReleaseSuppression();
    options.trigger.current?.focus({ preventScroll: true });
    const name = entered === null ? undefined : PlatformFileContentSlice(entered);
    if (name === undefined || name === target.name) return;

    const manifest = options.manifest.current;
    const hasPages = Boolean(manifest.pages?.length);
    const pages = hasPages ? manifest.pages! : [target];
    const current = pages.find(({ id }) => id === target.id);
    if (!current || current.name === name) return;
    options.record({
      kind: "page-rename",
      id: current.id,
      from: current.name,
      to: name,
      ...(hasPages ? {} : { first: current }),
    }, new Set());
    persist({ ...manifest, pages: pages.map((page) => page.id === target.id ? { ...page, name } : page) });
  }, [persist]);

  const remove = React.useCallback(async function removePage(pageId: string): Promise<void> {
    const requested = canvasPageDeleteSnapshot(options.manifest.current, pageId);
    if (!requested || !options.editing.current) return;
    if (requested.files.size + requested.notes.size > 0) {
      const allowed = await confirmCanvasAction(canvasPageDeleteConfirmation(
        requested.spec.name, requested.files.size, requested.notes.size, keyboardShortcutLabel("Z"),
      ));
      clearEscapeReleaseSuppression();
      options.trigger.current?.focus({ preventScroll: true });
      if (!allowed) return;
    }

    const current = canvasPageDeleteSnapshot(options.manifest.current, pageId);
    if (!current) {
      const page = options.editing.current && options.manifest.current.pages?.find(({ id }) => id === pageId);
      if (page) showToast(staleDeleteFailureMessage(page.name));
      return;
    }
    if (!options.editing.current) return;
    if ([...current.files].some((file) => !requested.files.has(file)) ||
      [...current.notes].some((id) => !requested.notes.has(id))) {
      return removePage(pageId);
    }
    options.deleteBoards(current.files, current.notes, { spec: current.spec, index: current.index });
    requestAnimationFrame(() => {
      if (document.activeElement === document.body || document.activeElement === null) {
        options.trigger.current?.focus({ preventScroll: true });
      }
    });
  }, []);

  return { create, rename, remove };
}

interface PageControlOptions {
  menu: ReturnType<typeof useCanvasPageMenu>;
  manifest: CanvasManifest;
  pages: DesignPage[];
  activePage: string;
  pageTitle: string;
  compact: boolean;
  editing: boolean;
  afterLeavingEdit(run: () => void): void;
  showPage(pageId: string): void;
  createPage(): void;
  renamePage(pageId: string): void;
  removePage(pageId: string): void;
}

const PageRow = "div";
const implicitPage = { ...defaultCanvasPage, id: "" };

export function useCanvasPageControl(options: PageControlOptions) {
  const { menu, manifest, pages, pageTitle, compact, editing, afterLeavingEdit } = options;
  const pageCount = pages.length > 1 && !menu.filesOpen ? pages.length : 0;
  const tip = editing ? "Pages: switch, add, rename or delete a page" : "Pages: switch pages";
  const visibleName = menu.filesOpen ? uiMessage("canvas.designCanvas.allFiles") : pageTitle;
  const ariaLabel = menu.filesOpen ? uiMessage("canvas.designCanvas.allFilesPages") : uiMessage("canvas.designCanvas.pages3");
  const accessibility = useToolbarItemAccessibility({ disabled: false, name: visibleName, tip });

  function showPage(page: DesignPage) {
    menu.setMenuOpen(false);
    if (menu.filesOpen) menu.closeFiles();
    if (page.id !== options.activePage && page.id !== "") afterLeavingEdit(() => options.showPage(page.id));
  }

  return (
    <span className="relative">
      <EditorPopover
        open={menu.menuOpen}
        onOpen={() => menu.setMenuOpen(true)}
        onClose={() => menu.setMenuOpen(false)}
        trigger={(trigger: Dynamic) => {
          menu.forwardTriggerRef(trigger.ref);
          return (
            <Tooltip content={tip} side="bottom" hoverable={false} open={menu.menuOpen ? false : undefined}>
              <Button
                {...trigger}
                ref={menu.attachTrigger}
                variant="ghost"
                icon={compact ? "Files" : undefined}
                data-testid="dc-pages"
                aria-label={ariaLabel}
                className="shrink-0"
                onClick={(event: MouseEvent) => {
                  if (!menu.menuOpen) menu.setOpenedByKeyboard(event.detail === 0);
                  trigger.onClick?.(event);
                }}
                aria-describedby={accessibility.describedBy}
              >
                <Counter value={pageCount} variant="neutral" size="xs" data-testid="dc-pages-count" />
                {!compact && <span className="max-w-[10rem] truncate">{visibleName}</span>}
                <ToolbarCaret />
              </Button>
            </Tooltip>
          );
        }}
        align="left"
        className="w-60 p-1"
        aria-label={uiMessage("canvas.designCanvas.pages")}
        focusOnOpen={menu.openedByKeyboard}
        initialFocus={() => {
          const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-dc-pages-list] button")];
          return buttons.find((button) => button.getAttribute("aria-pressed") === "true") ??
            buttons.find((button) => !button.disabled) ?? null;
        }}
        popupAttrs={{ "data-dc-pages-list": "" }}
      >
        {(pages.length > 0 ? pages : [implicitPage]).map((page) => (
          <PageRow key={page.id || "implicit"} className="flex items-center gap-0.5">
            <div className="min-w-0 flex-1">
              <EditorMenuItem icon={null} checked={page.id === options.activePage && !menu.filesOpen} onClick={() => showPage(page)}>
                <span className="relative min-w-0 flex-1 truncate">
                  {page.name}
                  <span className="sr-only">
                    {uiMessage("canvas.designCanvas.pageArtboardCount", {
                      count: manifest.artboards.filter((artboard) => designPageId(artboard, manifest.pages) === page.id).length,
                    })}
                  </span>
                </span>
              </EditorMenuItem>
            </div>
            {editing && (
              <MenuMenuAssignValue
                iconOnly={true}
                icon="DotsHorizontal"
                variant="ghost"
                align="end"
                disabled={false}
                disabledReason={undefined}
                aria-label={uiMessage("canvas.designCanvas.pageActions", { pageName: String(page.name) })}
                className="shrink-0"
                items={[
                  {
                    get label() { return uiMessage("canvas.designCanvas.rename"); },
                    onSelect() {
                      menu.setMenuOpen(false);
                      options.renamePage(page.id);
                    },
                  },
                  {
                    get label() { return uiMessage("canvas.designCanvas.delete"); },
                    variant: "danger",
                    disabled: pages.length < 2,
                    disabledReason: canvasNeedsPageMessage,
                    onSelect() {
                      menu.setMenuOpen(false);
                      afterLeavingEdit(() => options.removePage(page.id));
                    },
                  },
                ]}
              />
            )}
          </PageRow>
        ))}
        {editing && (
          <>
            <div aria-hidden="true" className="mx-2 my-1 h-px bg-border-line" />
            <EditorMenuItem
              icon="Add"
              disabled={false}
              title={undefined}
              onClick={() => {
                menu.setMenuOpen(false);
                afterLeavingEdit(options.createPage);
              }}
            >
              {uiMessage("canvas.designCanvas.newPage")}
            </EditorMenuItem>
          </>
        )}
      </EditorPopover>
      {accessibility.mirror}
    </span>
  );
}
