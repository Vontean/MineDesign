import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Core from "../contracts";
import type * as M from "../contracts/documentation";
import type * as Files from "../contracts/file-browser";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { externalLinkProps, safeLinkUrlFromElement } from "./external-links";
import { applyMarkdownFormat, applyMarkdownLink, EMPTY_MARKDOWN_FORMAT_STATE, isComposingEvent, normalizeExternalLinkInput, reactDomMarkdownToolbar, reactMarkdownToolbar, readMarkdownSelectionFormat, selectedMarkdownBlockKinds, ToolbarSelect } from "./markdown-toolbar";
import { toModuleNamespace } from "../module-helpers";
import { useCdsLayerAwareZIndex } from "../ui/interactions";
import { anyMenuOrPopoverOpen } from "../ui/property-focus";
import { joinClassNames, KitIcon } from "../ui/property-icons";
import { useSelectionToolbar } from "../ui/selection-toolbar";
import { ToolbarDivider, ToolbarStrip, ToolbarStripButton } from "../ui/toolbar-controls";

var jsxMarkdownToolbar: typeof import("react/jsx-runtime");
var MARKDOWN_BLOCK_LABELS: Record<Core.MarkdownFormatState["block"], string>;
var README_TOOLBAR_MENU_ATTRIBUTE: string;
var README_TOOLBAR_MENU_PROPS: {
  [attribute: `data-${string}`]: string;
};
var TOOLBAR_FOCUSABLE_SELECTOR: string;
var EDITABLE_MARKDOWN_BLOCK_TYPES: ("p" | "h2" | "h3" | "quote")[];
var isEditableMarkdownBlock: (
  kind: Core.MarkdownFormatState["block"],
) => boolean;
var EMPTY_SELECTION_STYLE_STATE: M.SelectionStyleState;
function disabledMarkdownFormats(
  format: Core.MarkdownFormatState,
  hasSelection: boolean,
  selectedStyles: M.SelectionStyleState = EMPTY_SELECTION_STYLE_STATE,
) {
  let hasLink: boolean = format.link !== undefined;
  return {
    bold:
      selectedStyles.italic ||
      selectedStyles.code ||
      selectedStyles.link ||
      (!format.bold && (hasLink || format.italic || format.code))
        ? uiMessage("design-system.markdownFormatting.theREADMECanTShow")
        : undefined,
    italic:
      selectedStyles.bold ||
      selectedStyles.code ||
      selectedStyles.link ||
      (!format.italic && (hasLink || format.bold || format.code))
        ? uiMessage("design-system.markdownFormatting.theREADMECanTShow")
        : undefined,
    link: hasLink
      ? undefined
      : format.code
        ? uiMessage("design-system.markdownFormatting.codeCanTCarryA")
        : format.bold ||
            format.italic ||
            selectedStyles.bold ||
            selectedStyles.italic ||
            selectedStyles.code ||
            selectedStyles.link
          ? uiMessage("design-system.markdownFormatting.theREADMECanTShow")
          : !hasSelection
            ? uiMessage("design-system.markdownFormatting.selectSomeTextToLink")
            : undefined,
  };
}
function selectedMarkdownStyles(
  root: HTMLElement | null,
): M.SelectionStyleState {
  let selection = root?.ownerDocument.getSelection();
  if (
    selection == null ||
    selection.rangeCount === 0 ||
    selection.isCollapsed ||
    root === null
  ) {
    return EMPTY_SELECTION_STYLE_STATE;
  }
  let selectedContent = selection.getRangeAt(0).cloneContents();
  return {
    bold: selectedContent.querySelector("b, strong") !== null,
    italic: selectedContent.querySelector("i, em") !== null,
    code: selectedContent.querySelector("code") !== null,
    link: selectedContent.querySelector("a, [data-href]") !== null,
  };
}
function MarkdownFormattingToolbar({
  root: root,
  hold: hold,
  onApplied: onApplied,
  onLeave: onLeave,
  className: className,
}: M.MarkdownFormattingToolbarProps) {
  useUiLocale();
  let value = useSelectionToolbar(root, {
      holdWhileFocusIn: hold,
    }),
    layerZIndex = useCdsLayerAwareZIndex(45),
    [selectionState, setSelectionState] = reactMarkdownToolbar.useState(
      EMPTY_MARKDOWN_FORMAT_STATE,
    ),
    [linkUrl, setLinkUrl] = reactMarkdownToolbar.useState<string | null>(
      null,
    ),
    [linkInvalid, setLinkInvalid] = reactMarkdownToolbar.useState(false),
    [formatDisabled, setFormatDisabled] = reactMarkdownToolbar.useState(
      EMPTY_SELECTION_STYLE_STATE,
    ),
    [blockType, setBlockType] = reactMarkdownToolbar.useState<
      Files.MarkdownBlockKind[]
    >([]);
  reactMarkdownToolbar.useEffect(() => {
    let refreshSelection = (): void => {
      let current = root.current,
        selectionRange =
          current === null
            ? null
            : readMarkdownSelectionFormat(current);
      if (selectionRange !== null) {
        setSelectionState(selectionRange);
      }
      setFormatDisabled(selectedMarkdownStyles(current));
      setBlockType(
        current === null
          ? []
          : selectedMarkdownBlockKinds(current),
      );
    };
    refreshSelection();
    document.addEventListener("selectionchange", refreshSelection);
    return () => document.removeEventListener("selectionchange", refreshSelection);
  }, [root]);
  reactMarkdownToolbar.useEffect((): void => {
    if (value.open) {
      return;
    }
    setLinkUrl(null);
    setLinkInvalid(false);
  }, [value.open]);
  let callback = (command: Files.MarkdownCommand): void => {
      if (
        root.current !== null &&
        !root.current.contains(document.activeElement)
      ) {
        restoreSelection();
      }
      applyMarkdownFormat(
        command,
        document,
        blockType.includes("quote") ? "quote" : selectionState.block,
      );
      let current = root.current;
      if (current !== null) {
        setSelectionState(
          readMarkdownSelectionFormat(current) ??
            EMPTY_MARKDOWN_FORMAT_STATE,
        );
      }
      onApplied();
      value.refresh();
    },
    restoreSelection = (): void => {
      let savedRange = value.range(),
        selection = document.getSelection();
      if (savedRange === null || selection === null) {
        return;
      }
      root.current?.focus();
      selection.removeAllRanges();
      selection.addRange(savedRange);
    },
    openLinkEditor = () => {
      if (normalizeExternalLinkInput(linkUrl ?? "") === null) {
        return setLinkInvalid(true);
      }
      restoreSelection();
      applyMarkdownLink(
        linkUrl ?? "",
        document,
        root.current ?? undefined,
      );
      setLinkUrl(null);
      onApplied();
    },
    isList = selectionState.ul || selectionState.ol,
    selectedBlock = blockType.length === 1 ? blockType[0] : undefined,
    isParagraph: boolean = selectionState.block === "p",
    disabledFormats = disabledMarkdownFormats(selectionState, true, formatDisabled);
  return reactDomMarkdownToolbar.createPortal(
    <div
      ref={value.stripRef as React.Ref<HTMLDivElement>}
      style={{
        ...value.style,
        zIndex: layerZIndex,
      }}
      className={className}
      data-testid={"ds-readme-strip"}
      {...UNCOMMENTABLE_PROPS}
    >
      <div
        ref={hold}
        onBlur={(event: React.FocusEvent<HTMLElement>): void => {
          let relatedTarget = event.relatedTarget;
          if (
            relatedTarget !== null &&
            (root.current?.contains(relatedTarget) ||
              hold.current?.contains(relatedTarget) ||
              relatedTarget.closest(
                "[" +
                  README_TOOLBAR_MENU_ATTRIBUTE +
                  "], [data-base-ui-focus-guard]",
              ) !== null)
          ) {
            return;
          }
          if (
            relatedTarget === null &&
            document.activeElement !== null &&
            hold.current?.contains(document.activeElement)
          ) {
            return;
          }
          setLinkUrl(null);
          onLeave();
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>): void => {
          if (
            event.defaultPrevented ||
            isComposingEvent(event)
          ) {
            return;
          }
          let target = event.target as HTMLElement;
          if (target.tagName === "INPUT" && event.key !== "Tab") {
            return;
          }
          let items = [
              ...event.currentTarget.querySelectorAll<HTMLElement>(
                TOOLBAR_FOCUSABLE_SELECTOR,
              ),
            ],
            itemIndex = items.indexOf(target);
          if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
            if (itemIndex < 0 || items.length === 0) {
              return;
            }
            event.preventDefault();
            items[
              (itemIndex +
                (event.key === "ArrowRight" ? 1 : items.length - 1)) %
                items.length
            ]?.focus();
          } else if (event.key === "Escape") {
            if (anyMenuOrPopoverOpen(document)) {
              return;
            }
            event.preventDefault();
            event.stopPropagation();
            restoreSelection();
          } else if (event.key === "Tab" && itemIndex >= 0) {
            event.preventDefault();
            event.stopPropagation();
            root.current?.focus();
            document.getSelection()?.collapseToEnd();
          }
        }}
      >
        <ToolbarStrip aria-label={uiMessage("design-system.markdownFormatting.format")} placed={value.placed}>
          {linkUrl !== null ? (<jsxMarkdownToolbar.Fragment>
              {[<input
                  autoFocus={true}
                  value={linkUrl}
                  placeholder={uiMessage("design-system.markdownFormatting.pasteALinkThenEnter")}
                  aria-label={uiMessage("design-system.markdownFormatting.linkURL")}
                  aria-invalid={linkInvalid}
                  spellCheck={false}
                  className={joinClassNames(
                    "h-7 w-56 min-w-0 bg-transparent px-2 text-xs text-fg outline-none placeholder:text-fg-muted",
                    "pointer-coarse:h-10 pointer-coarse:text-sm",
                    linkInvalid && "text-bad",
                  )}
                  onChange={(
                    event: React.ChangeEvent<HTMLInputElement>,
                  ): void => {
                    setLinkUrl(event.target.value);
                    setLinkInvalid(false);
                  }}
                  onBlur={(event: React.FocusEvent<HTMLElement>): void => {
                    let relatedTarget = event.relatedTarget;
                    if (
                      relatedTarget !== null &&
                      (root.current?.contains(relatedTarget) ||
                        hold.current?.contains(relatedTarget))
                    ) {
                      return;
                    }
                    setLinkUrl(null);
                    onLeave();
                  }}
                  onKeyDown={(
                    event: React.KeyboardEvent<HTMLInputElement>,
                  ): void => {
                    if (isComposingEvent(event)) {
                      return;
                    }
                    if (event.key === "Enter") {
                      event.preventDefault();
                      openLinkEditor();
                    } else if (event.key === "Escape") {
                      event.preventDefault();
                      event.stopPropagation();
                      setLinkUrl(null);
                      setLinkInvalid(false);
                      restoreSelection();
                    }
                  }}
                />, <ToolbarStripButton
                  title={uiMessage("design-system.markdownFormatting.cancel")}
                  aria-label={uiMessage("design-system.markdownFormatting.cancel")}
                  icon={"X"}
                  onClick={(): void => {
                    setLinkUrl(null);
                    setLinkInvalid(false);
                    restoreSelection();
                  }}
                />]}
            </jsxMarkdownToolbar.Fragment>) : (<jsxMarkdownToolbar.Fragment>
              {[<ToolbarStripButton
                  title={disabledFormats.bold ?? (uiMessage("design-system.markdownFormatting.bold"))}
                  aria-label={uiMessage("design-system.markdownFormatting.bold")}
                  icon={"TextBold"}
                  aria-pressed={selectionState.bold}
                  disabled={disabledFormats.bold !== undefined}
                  onClick={() => callback("bold")}
                />, <ToolbarStripButton
                  title={disabledFormats.italic ?? (uiMessage("design-system.markdownFormatting.italic"))}
                  aria-label={uiMessage("design-system.markdownFormatting.italic")}
                  icon={"TextItalics"}
                  aria-pressed={selectionState.italic}
                  disabled={disabledFormats.italic !== undefined}
                  onClick={() => callback("italic")}
                />, <ToolbarStripButton
                  title={
                    disabledFormats.link ?? (selectionState.link !== undefined ? (uiMessage("design-system.markdownFormatting.removeLink")) : (uiMessage("design-system.markdownFormatting.link")))
                  }
                  aria-label={
                    selectionState.link !== undefined ? (uiMessage("design-system.markdownFormatting.removeLink")) : (uiMessage("design-system.markdownFormatting.link"))
                  }
                  icon={"Link"}
                  aria-pressed={selectionState.link !== undefined}
                  disabled={disabledFormats.link !== undefined}
                  onClick={(): void => {
                    if (selectionState.link !== undefined) {
                      callback("unlink");
                    } else {
                      setLinkInvalid(false);
                      setLinkUrl("");
                    }
                  }}
                />, <ToolbarDivider />, (() => {
                  const _Element = ToolbarSelect;
                  const _elementProps = {
                    get title() { return isList ? (uiMessage("design-system.markdownFormatting.aListItemStaysA")) : (uiMessage("design-system.markdownFormatting.blockStyle")); },
                    testid: "ds-readme-block-menu",
                    disabled: isList,
                    value:
                      selectedBlock !== undefined &&
                      isEditableMarkdownBlock(selectedBlock)
                        ? selectedBlock
                        : null,
                    chipLabel: MARKDOWN_BLOCK_LABELS[selectedBlock ?? selectionState.block],
                    options: EDITABLE_MARKDOWN_BLOCK_TYPES.map(
                      (block: Core.MarkdownFormatState["block"]) => ({
                        value: block,
                        label: MARKDOWN_BLOCK_LABELS[block],
                      }),
                    ),
                    onChange: (command: Files.MarkdownCommand) =>
                      callback(command),
                    popupAttrs: README_TOOLBAR_MENU_PROPS,
                  };
                  const _elementKey = value.open ? "open" : "shut";
                  return <_Element key={_elementKey} {..._elementProps} />;
                })(), <ToolbarStripButton
                  title={
                    isParagraph ? (uiMessage("design-system.markdownFormatting.bulletedList")) : (uiMessage("design-system.markdownFormatting.onlyParagraphsBecomeLists"))
                  }
                  aria-label={uiMessage("design-system.markdownFormatting.bulletedList")}
                  icon={"ListBullet"}
                  aria-pressed={selectionState.ul}
                  disabled={!isParagraph}
                  onClick={() => callback("ul")}
                />, <ToolbarStripButton
                  title={
                    isParagraph ? (uiMessage("design-system.markdownFormatting.numberedList")) : (uiMessage("design-system.markdownFormatting.onlyParagraphsBecomeLists"))
                  }
                  aria-label={uiMessage("design-system.markdownFormatting.numberedList")}
                  icon={"ListNumbered"}
                  aria-pressed={selectionState.ol}
                  disabled={!isParagraph}
                  onClick={() => callback("ol")}
                />]}
            </jsxMarkdownToolbar.Fragment>)}
        </ToolbarStrip>
      </div>
    </div>,
    document.body,
  );
}
function MarkdownLinkPopover({
  root: root,
  className: className,
}: M.MarkdownLinkPopoverProps) {
  useUiLocale();
  let value = useCdsLayerAwareZIndex(45),
    ref = reactMarkdownToolbar.useRef<HTMLDivElement>(null),
    [linkState, setLinkState] =
      reactMarkdownToolbar.useState<M.MarkdownLinkState | null>(null),
    [popoverStyle, setPopoverStyle] =
      reactMarkdownToolbar.useState<React.CSSProperties>({
        position: "fixed",
        top: 0,
        left: 0,
        visibility: "hidden",
      });
  reactMarkdownToolbar.useEffect(() => {
    let ownerDocument = root.current?.ownerDocument ?? document,
      windowRef = ownerDocument.defaultView ?? window,
      callback = () => {
        let current = root.current,
          selection = ownerDocument.getSelection();
        if (
          current === null ||
          selection === null ||
          selection.rangeCount === 0 ||
          !selection.isCollapsed
        ) {
          return setLinkState(null);
        }
        let startContainer = selection.getRangeAt(0).startContainer,
          linkElement =
            (startContainer.nodeType === 1
              ? (startContainer as Element)
              : startContainer.parentElement
            )?.closest("a[data-href]") ?? null,
          linkHref: string =
            linkElement === null || !current.contains(linkElement)
              ? ""
              : safeLinkUrlFromElement(linkElement);
        if (linkElement === null || linkHref === "") {
          return setLinkState(null);
        }
        let bounds = linkElement.getBoundingClientRect();
        setLinkState((nextLinkState: M.MarkdownLinkState | null) =>
          nextLinkState !== null &&
          nextLinkState.href === linkHref &&
          nextLinkState.rect.top === bounds.top &&
          nextLinkState.rect.left === bounds.left
            ? nextLinkState
            : {
                href: linkHref,
                rect: bounds,
              },
        );
      };
    callback();
    ownerDocument.addEventListener("selectionchange", callback);
    windowRef.addEventListener("scroll", callback, {
      capture: true,
      passive: true,
    });
    windowRef.addEventListener("resize", callback);
    return (): void => {
      ownerDocument.removeEventListener("selectionchange", callback);
      windowRef.removeEventListener("scroll", callback, {
        capture: true,
      });
      windowRef.removeEventListener("resize", callback);
    };
  }, [root]);
  reactMarkdownToolbar.useLayoutEffect((): void => {
    if (linkState === null) {
      return;
    }
    let popoverWidth = ref.current?.offsetWidth ?? 0,
      popoverHeight = ref.current?.offsetHeight ?? 0,
      clientWidth = document.documentElement.clientWidth,
      clientHeight = document.documentElement.clientHeight,
      popoverAbove: boolean = linkState.rect.bottom + 6 + popoverHeight <= clientHeight - 8;
    setPopoverStyle({
      position: "fixed",
      top: Math.round(
        popoverAbove ? linkState.rect.bottom + 6 : linkState.rect.top - 6 - popoverHeight,
      ),
      left: Math.round(
        Math.max(8, Math.min(linkState.rect.left, clientWidth - popoverWidth - 8)),
      ),
    });
  }, [linkState]);
  if (linkState === null) {
    return null;
  }
  return reactDomMarkdownToolbar.createPortal(
    <div
      ref={ref}
      style={{
        ...popoverStyle,
        zIndex: value,
      }}
      className={className}
      data-testid={"ds-readme-link-bubble"}
    >
      <ToolbarStrip
        aria-label={uiMessage("design-system.markdownFormatting.link")}
        surface={"popover"}
        style={
          {
            "--mc-strip-pad": "9px",
            borderRadius: "0.75rem",
          } as M.MarkdownStripStyle
        }
      >
        <a
          {...externalLinkProps(linkState.href)}
          title={linkState.href}
          className={
            "inline-flex max-w-64 items-center gap-1 px-1 text-xs text-blue-text hover:underline pointer-coarse:min-h-10 pointer-coarse:text-sm"
          }
        >
          {[<span className={"truncate"}>
              {externalLinkDisplayLabel(linkState.href)}
            </span>, <KitIcon name={"ArrowUpRight"} size={12} />]}
        </a>
      </ToolbarStrip>
    </div>,
    document.body,
  );
}
function externalLinkDisplayLabel(url: string): string {
  try {
    let value = new URL(url);
    return (
      value.host.replace(/^www\./, "") +
      (value.pathname === "/" && value.search === ""
        ? ""
        : value.pathname + value.search)
    );
  } catch {
    return url;
  }
}
export {
  disabledMarkdownFormats,
  EDITABLE_MARKDOWN_BLOCK_TYPES,
  EMPTY_SELECTION_STYLE_STATE,
  externalLinkDisplayLabel,
  isEditableMarkdownBlock,
  jsxMarkdownToolbar,
  MARKDOWN_BLOCK_LABELS,
  MarkdownFormattingToolbar,
  MarkdownLinkPopover,
  README_TOOLBAR_MENU_ATTRIBUTE,
  README_TOOLBAR_MENU_PROPS,
  selectedMarkdownStyles,
  TOOLBAR_FOCUSABLE_SELECTOR,
};
export function installEditorMarkdownFormatting(): () => void {
  return () => {
    jsxMarkdownToolbar = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    MARKDOWN_BLOCK_LABELS = {
      p: "Paragraph",
      h1: "Title",
      h2: "Heading",
      h3: "Subheading",
      quote: "Quote",
      pre: "Code",
    };
    README_TOOLBAR_MENU_ATTRIBUTE = "data-readme-strip-menu";
    README_TOOLBAR_MENU_PROPS = {
      ...UNCOMMENTABLE_PROPS,
      [README_TOOLBAR_MENU_ATTRIBUTE]: "",
    };
    TOOLBAR_FOCUSABLE_SELECTOR =
      'button:not(:disabled), [role="button"][aria-disabled="true"], input';
    EDITABLE_MARKDOWN_BLOCK_TYPES = ["p", "h2", "h3", "quote"];
    isEditableMarkdownBlock = (block: Core.MarkdownFormatState["block"]) =>
      (
        EDITABLE_MARKDOWN_BLOCK_TYPES as readonly Core.MarkdownFormatState["block"][]
      ).includes(block);
    EMPTY_SELECTION_STYLE_STATE = {
      bold: false,
      italic: false,
      code: false,
      link: false,
    };
  };
}
