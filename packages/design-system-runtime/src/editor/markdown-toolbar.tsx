import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ToolbarSelectProps,
  ToolbarSelectOption,
  MarkdownBlockKind,
  MarkdownCommand,
  ComposingEvent,
} from "../contracts/file-browser";
import { loadJsxNamespace, loadReactDomNamespace, loadReactNamespace } from "../dependencies";
import { classifyExternalLink, linkUrlFromElement, prepareEditableLinks } from "./external-links";
import { toModuleNamespace } from "../module-helpers";
import { Menu } from "../ui/menu";
import { ToolbarTooltipSideContext } from "../ui/property-focus";
import { PopupScrim } from "../ui/property-popover";
import { ToolbarStripButton } from "../ui/toolbar-controls";

var reactMarkdownToolbar: typeof import("react");
var reactDomMarkdownToolbar: typeof import("react-dom");
var reactToolbarPicker: typeof import("react");
var jsxToolbarPicker: typeof import("react/jsx-runtime");
var EMPTY_MARKDOWN_FORMAT_STATE: import("../contracts").MarkdownFormatState;
function ToolbarSelect({
  value: selectedValue,
  options: selectOptions,
  onChange: onChange,
  title: title,
  testid: testid,
  chipLabel: chipLabel,
  popoverClassName: popoverClassName,
  disabled = false,
  popupAttrs: popupAttrs,
}: ToolbarSelectProps) {
  useUiLocale();
  let initialValue =
      reactToolbarPicker.useContext(ToolbarTooltipSideContext) ??
      "bottom",
    [menuSide, setSelectedValue] = reactToolbarPicker.useState(initialValue),
    [isOpen, setIsOpen] = reactToolbarPicker.useState(false),
    ref = reactToolbarPicker.useRef<HTMLDivElement | null>(null),
    triggerRef = reactToolbarPicker.useRef<HTMLElement | SVGElement | null>(null),
    isMenuOpen = isOpen && !disabled;
  reactToolbarPicker.useEffect((): void => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);
  let selectedOption = selectOptions.find(
      (option: ToolbarSelectOption): boolean => option.value === selectedValue,
    ),
    optionLabel =
      selectedOption === undefined
        ? (selectedValue ?? "")
        : (selectedOption.text ??
          (typeof selectedOption.label === "string" ? selectedOption.label : selectedValue)),
    displayValue = chipLabel ?? optionLabel,
    optionTitle: string | undefined =
      typeof displayValue === "string" || typeof displayValue === "number"
        ? String(displayValue)
        : undefined,
    ariaLabel =
      disabled || optionTitle === undefined
        ? undefined
        : optionTitle === ""
          ? title
          : title + ": " + optionTitle;
  return (
    <span className={"inline-flex"}>
      {[isMenuOpen ? <PopupScrim onClose={() => setIsOpen(false)} /> : null, <Menu.Root
          open={isMenuOpen}
          disabled={disabled}
          modal={false}
          onOpenChange={(
            open: boolean,
            changeDetails: import("@base-ui/react/menu").Menu.Root.ChangeEventDetails,
          ): void => {
            if (!open && changeDetails.reason === "outside-press") {
              let eventTarget = changeDetails.event?.target;
              if (
                eventTarget instanceof Element &&
                eventTarget.hasAttribute("data-mc-scrim")
              ) {
                changeDetails.cancel();
                return;
              }
            }
            if (open) {
              setSelectedValue(initialValue);
              triggerRef.current = null;
            }
            setIsOpen(open);
          }}
        >
          {[<Menu.Trigger
              render={
                <ToolbarStripButton
                  data-testid={testid}
                  title={title}
                  aria-label={ariaLabel}
                  chevron={true}
                  disabled={disabled}
                >
                  {displayValue}
                </ToolbarStripButton>
              }
            />, <Menu.Popup
              {...popupAttrs}
              ref={ref}
              aria-label={title}
              data-mc-menu={""}
              side={menuSide}
              initialFocus={(focusTarget: string): boolean => focusTarget === "keyboard"}
              finalFocus={() => triggerRef.current ?? true}
              onKeyDown={(event: React.KeyboardEvent<HTMLElement>): void => {
                if (event.key !== "Tab" && !event.metaKey && !event.ctrlKey) {
                  event.stopPropagation();
                }
              }}
              className={popoverClassName}
            >
              <Menu.Group>
                {selectOptions.map((option: ToolbarSelectOption) =>
                  (() => {
                    const _Element = Menu.Item;
                    const _elementProps = {
                      checkedRole: "radio" as const,
                      checked: option.value === selectedValue,
                      "data-testid": testid
                        ? testid + "-" + option.value
                        : undefined,
                      onClick: (): void => {
                        if (option.value !== selectedValue) {
                          onChange(option.value);
                        }
                        let ownerDocument = ref.current?.ownerDocument
                          .activeElement as HTMLElement | SVGElement | null;
                        triggerRef.current =
                          ownerDocument !== null &&
                          ownerDocument !== ownerDocument.ownerDocument.body &&
                          !(ref.current?.contains(ownerDocument) ?? false)
                            ? ownerDocument
                            : null;
                      },
                      children:
                        typeof option.label === "string" ? (
                          option.label
                        ) : (
                          <span
                            className={
                              "flex min-w-0 flex-1 items-center gap-xs"
                            }
                          >
                            {option.label}
                          </span>
                        ),
                    };
                    const _elementKey = option.value;
                    return <_Element key={_elementKey} {..._elementProps} />;
                  })(),
                )}
              </Menu.Group>
            </Menu.Popup>]}
        </Menu.Root>]}
    </span>
  );
}
function markdownBlockAtNode(
  node: Node,
  root: HTMLElement,
): MarkdownBlockKind {
  let element = node.nodeType === 3 ? node.parentElement : (node as Element);
  for (
    ;
    element !== null && element !== root;
    element = element.parentElement
  ) {
    let tagName = element.tagName;
    if (tagName === "H1") {
      return "h1";
    }
    if (tagName === "H2") {
      return "h2";
    }
    if (/^H[3-6]$/.test(tagName)) {
      return "h3";
    }
    if (tagName === "BLOCKQUOTE") {
      return "quote";
    }
    if (tagName === "PRE") {
      return "pre";
    }
  }
  return "p";
}
function selectedMarkdownBlockKinds(root: HTMLElement) {
  let selection = root.ownerDocument.getSelection();
  if (
    selection === null ||
    selection.rangeCount === 0 ||
    selection.isCollapsed
  ) {
    return [];
  }
  let range = selection.getRangeAt(0);
  if (
    !root.contains(range.startContainer) ||
    !root.contains(range.endContainer)
  ) {
    return [];
  }
  let blockTypes: MarkdownBlockKind[] = [],
    textWalker = root.ownerDocument.createTreeWalker(root, 4);
  for (
    let value = textWalker.nextNode();
    value !== null;
    value = textWalker.nextNode()
  ) {
    if (!range.intersectsNode(value)) {
      continue;
    }
    let selectionOffset = value === range.startContainer ? range.startOffset : 0;
    if (
      (value === range.endContainer
        ? range.endOffset
        : (value.textContent?.length ?? 0)) <= selectionOffset
    ) {
      continue;
    }
    let blockKind = markdownBlockAtNode(value, root);
    if (!blockTypes.includes(blockKind)) {
      blockTypes.push(blockKind);
    }
  }
  return blockTypes;
}
function readMarkdownSelectionFormat(root: HTMLElement) {
  let selection = root.ownerDocument.getSelection();
  if (selection === null || selection.rangeCount === 0) {
    return null;
  }
  let selectionNode = selection.getRangeAt(0).startContainer;
  if (!root.contains(selectionNode)) {
    return null;
  }
  let format = {
      ...EMPTY_MARKDOWN_FORMAT_STATE,
    },
    element =
      selectionNode.nodeType === 3
        ? selectionNode.parentElement
        : (selectionNode as Element);
  for (
    ;
    element !== null && element !== root;
    element = element.parentElement
  ) {
    let tagName = element.tagName;
    if (tagName === "B" || tagName === "STRONG") {
      format.bold = true;
    } else if (tagName === "I" || tagName === "EM") {
      format.italic = true;
    } else if (tagName === "CODE") {
      format.code = true;
    } else if (tagName === "UL") {
      [format.ul, format.ol] = [true, false];
    } else if (tagName === "OL") {
      [format.ul, format.ol] = [false, true];
    } else if (tagName === "A" && format.link === undefined) {
      format.link = linkUrlFromElement(element);
    } else if (format.block === "p") {
      if (tagName === "H1") {
        format.block = "h1";
      } else if (tagName === "H2") {
        format.block = "h2";
      } else if (/^H[3-6]$/.test(tagName)) {
        format.block = "h3";
      } else if (tagName === "BLOCKQUOTE") {
        format.block = "quote";
      } else if (tagName === "PRE") {
        format.block = "pre";
      }
    }
  }
  return format;
}
function normalizeExternalLinkInput(urlInput: string) {
  let url = urlInput.trim();
  if (url === "") {
    return null;
  }
  if (!/^[a-z][a-z0-9+.-]*:/i.test(url)) {
    url = "https://" + url;
  }
  return classifyExternalLink(url);
}
function executeMarkdownCommand(
  documentRef: Document,
  command: string,
  commandValue?: string,
): void {
  documentRef.execCommand("styleWithCSS", false, "false");
  documentRef.execCommand(command, false, commandValue);
}
function applyMarkdownFormat(
  format: MarkdownCommand,
  documentRef: Document = document,
  currentBlock?: MarkdownBlockKind,
) {
  if (
    currentBlock === "quote" &&
    format !== "quote" &&
    format !== "bold" &&
    format !== "italic" &&
    format !== "unlink"
  ) {
    executeMarkdownCommand(documentRef, "outdent");
  }
  switch (format) {
    case "bold":
    case "italic":
      return executeMarkdownCommand(documentRef, format);
    case "ul":
      return executeMarkdownCommand(documentRef, "insertUnorderedList");
    case "ol":
      return executeMarkdownCommand(documentRef, "insertOrderedList");
    case "p":
    case "h2":
    case "h3":
      return executeMarkdownCommand(
        documentRef,
        "formatBlock",
        format.toUpperCase(),
      );
    case "quote":
      return executeMarkdownCommand(documentRef, "formatBlock", "BLOCKQUOTE");
    case "unlink":
      return executeMarkdownCommand(documentRef, "unlink");
  }
}
function applyMarkdownLink(
  urlInput: string,
  documentRef: Document = document,
  root?: HTMLElement,
): boolean {
  let value = normalizeExternalLinkInput(urlInput);
  if (value === null) {
    return false;
  }
  executeMarkdownCommand(documentRef, "createLink", value);
  if (root !== undefined) {
    prepareEditableLinks(root);
  }
  return true;
}
function isComposingEvent(event: ComposingEvent) {
  return (
    event.nativeEvent?.isComposing === true ||
    event.isComposing === true ||
    event.keyCode === 229
  );
}
export {
  applyMarkdownFormat,
  applyMarkdownLink,
  EMPTY_MARKDOWN_FORMAT_STATE,
  executeMarkdownCommand,
  isComposingEvent,
  jsxToolbarPicker,
  markdownBlockAtNode,
  normalizeExternalLinkInput,
  reactDomMarkdownToolbar,
  reactMarkdownToolbar,
  reactToolbarPicker,
  readMarkdownSelectionFormat,
  selectedMarkdownBlockKinds,
  ToolbarSelect,
};
export function installEditorMarkdownToolbar(): () => void {
  return () => {
    reactMarkdownToolbar = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactDomMarkdownToolbar = toModuleNamespace(
      loadReactDomNamespace(),
      1,
    );
    reactToolbarPicker = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxToolbarPicker = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    EMPTY_MARKDOWN_FORMAT_STATE = {
      bold: false,
      italic: false,
      ul: false,
      ol: false,
      code: false,
      block: "p",
    };
  };
}
