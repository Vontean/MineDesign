import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  UsageNoteEditorProps,
  NotesPopoverEditorProps,
} from "../contracts/file-browser";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { commentTargetProps } from "./comment-anchors";
import { flushMarkdownCommitQueues } from "./markdown-commit";
import { MarkdownEditor } from "./markdown-editor";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { Icon } from "../ui/interactions";
import { joinClassNames } from "../ui/property-icons";
import { PropertyPopup } from "../ui/property-popover";

var reactUsageEditor: typeof import("react");
var jsxUsageEditor: typeof import("react/jsx-runtime");
var prefersCoarsePointer: () => boolean;
function hasUsageNote(note: string | undefined) {
  return note !== undefined && note.trim() !== "";
}
function focusUsageEditorBackground(
  event: React.MouseEvent<HTMLDivElement>,
): void {
  if (event.button !== 0 || event.target !== event.currentTarget) {
    return;
  }
  if (
    event.nativeEvent.offsetX >= event.currentTarget.clientWidth ||
    event.nativeEvent.offsetY >= event.currentTarget.clientHeight
  ) {
    return;
  }
  let element = event.currentTarget.querySelector<HTMLElement>(
    ".ds-readme-editable",
  );
  if (element === null) {
    return;
  }
  event.preventDefault();
  element.focus();
  let value = element.ownerDocument.getSelection();
  value?.selectAllChildren(element);
  value?.collapseToEnd();
}
function UsageNoteEditor({
  value: note,
  label: label,
  onChange: onChange,
  onDone: onDone,
  title = uiMessage("design-system.usageNotes.usageNotes"),
  placeholder = uiMessage("design-system.usageNotes.whenToUseItAnd"),
  size = "note",
  "data-testid": dataTestid,
  anchorKey: anchorKey,
}: UsageNoteEditorProps) {
  useUiLocale();
  let canEdit: boolean = onChange !== undefined,
    hasNote = hasUsageNote(note),
    [isOpen, setIsOpen] = reactUsageEditor.useState(false),
    ref = reactUsageEditor.useRef(false),
    pointerDownRef = reactUsageEditor.useRef(false);
  reactUsageEditor.useEffect(() => {
    let handleKeyDown = (): void => {
        pointerDownRef.current = true;
      },
      handlePointerDown = (): void => {
        pointerDownRef.current = false;
      };
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("pointerdown", handlePointerDown, true);
    return (): void => {
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("pointerdown", handlePointerDown, true);
    };
  }, []);
  let labelRef = reactUsageEditor.useRef<HTMLSpanElement | null>(null),
    popupRef = reactUsageEditor.useRef<HTMLElement | null>(null),
    stripPressRef = reactUsageEditor.useRef(false);
  if (!canEdit && !hasNote) {
    return null;
  }
  let ariaLabel =
      isOpen || hasNote || !canEdit ? title : uiMessage("design-system.usageNotes.add") + title.toLowerCase(),
    callback = (): void => {
      setIsOpen(false);
      if (!ref.current && !pointerDownRef.current) {
        return;
      }
      let current = popupRef.current,
        scheduleFocus = (): void => {
          let activeElement = document.activeElement;
          if (
            activeElement === null ||
            activeElement === document.body ||
            !activeElement.isConnected ||
            (current !== null && current.contains(activeElement))
          ) {
            labelRef.current?.querySelector("button")?.focus({
              preventScroll: true,
            });
          }
        };
      requestAnimationFrame(scheduleFocus);
      setTimeout(scheduleFocus, 200);
    };
  return (
    <span
      ref={labelRef}
      className={"ds-nmark-anchor relative inline-flex"}
      onClick={(event: React.MouseEvent<HTMLElement>) =>
        event.stopPropagation()
      }
    >
      <PropertyPopup
        open={isOpen}
        onOpen={() => setIsOpen(true)}
        onClose={(): void => {
          if (stripPressRef.current) {
            stripPressRef.current = false;
            return;
          }
          callback();
        }}
        align={"right"}
        padding={"none"}
        focusOnOpen={ref.current}
        aria-label={((title) + (": ")) + (label)}
        trigger={
          <Button
            variant={"ghost"}
            size={"sm"}
            iconOnly={true}
            icon={
              <Icon
                name={"Note"}
                size={"sm"}
                className={hasNote ? "text-warning" : "text-muted"}
              />
            }
            aria-label={((ariaLabel) + (": ")) + (label)}
            tooltip={ariaLabel}
            className={joinClassNames(
              "ds-nmark",
              !hasNote &&
                "opacity-0 group-hover/row:opacity-100 group-focus-within/row:opacity-100 focus-visible:opacity-100 aria-expanded:opacity-100 pointer-coarse:opacity-100",
            )}
            data-has={hasNote ? "" : undefined}
            data-testid={
              dataTestid !== undefined ? dataTestid + "-mark" : undefined
            }
            onClick={(event: React.MouseEvent<HTMLElement>): void => {
              ref.current = event.detail === 0;
            }}
          />
        }
      >
        {isOpen ? (<NotesPopoverEditor
            value={note}
            label={label}
            title={title}
            placeholder={placeholder}
            size={size}
            onChange={onChange}
            onDone={onDone}
            takeCaret={
              ref.current || (canEdit && !hasNote && !prefersCoarsePointer())
            }
            stripPress={stripPressRef}
            popup={popupRef}
            onClose={callback}
            testid={dataTestid}
            anchorKey={anchorKey}
          />) : (null)}
      </PropertyPopup>
    </span>
  );
}
function NotesPopoverEditor({
  value: note,
  label: label,
  title: title,
  placeholder = "",
  size: size,
  onChange: onChange,
  onDone: onDone,
  takeCaret: takeCaret,
  stripPress: stripPress,
  popup: popup,
  onClose: onClose,
  testid: testid,
  anchorKey: anchorKey,
}: NotesPopoverEditorProps) {
  useUiLocale();
  let canEdit: boolean = onChange !== undefined,
    ref = reactUsageEditor.useRef<{
      open: boolean;
      done?: () => void;
    }>({
      open: false,
    });
  ref.current.done = onDone;
  reactUsageEditor.useEffect(
    () => (): void => {
      if (ref.current.open) {
        ref.current.done?.();
      }
    },
    [],
  );
  let popupRef = reactUsageEditor.useRef<HTMLDivElement | null>(null);
  reactUsageEditor.useEffect((): void => {
    popup.current =
      popupRef.current?.closest('[data-cds="Popover"]')?.parentElement ??
      popupRef.current?.closest(".ds-postit") ??
      null;
  }, [popup]);
  reactUsageEditor.useEffect(() => {
    if (!takeCaret || !canEdit) {
      return;
    }
    let animationFrame = requestAnimationFrame((): void => {
      let editorElement = popupRef.current?.querySelector<HTMLElement>(
        ".ds-readme-editable",
      );
      if (editorElement === null || editorElement === undefined) {
        return;
      }
      editorElement.focus({
        preventScroll: true,
      });
      let selection = editorElement.ownerDocument.getSelection();
      selection?.selectAllChildren(editorElement);
      selection?.collapseToEnd();
    });
    return () => cancelAnimationFrame(animationFrame);
  }, []);
  reactUsageEditor.useEffect(() => {
    let isEditorFocused = () => {
        let activeElement = document.activeElement;
        return (
          activeElement !== null &&
          (popupRef.current?.contains(activeElement) ?? false)
        );
      },
      handleEditorFocus = (): void => {
        stripPress.current = true;
        setTimeout((): void => {
          stripPress.current = false;
        }, 0);
      },
      handlePointerDown = (event: PointerEvent): void => {
        let focusedElement =
            event.target instanceof Element
              ? event.target.closest("[data-mc-strip]")
              : null,
          activeElement = document.activeElement;
        if (
          focusedElement !== null &&
          activeElement !== null &&
          (isEditorFocused() || focusedElement.contains(activeElement))
        ) {
          handleEditorFocus();
        }
      },
      handleResize = (): void => {
        if (isEditorFocused()) {
          handleEditorFocus();
        }
      },
      handleScroll = (event: Event): void => {
        if (
          isEditorFocused() &&
          prefersCoarsePointer() &&
          !(
            event.target instanceof Node &&
            (popupRef.current?.contains(event.target) ?? false)
          )
        ) {
          handleEditorFocus();
        }
      };
    window.addEventListener("pointerdown", handlePointerDown, true);
    window.addEventListener("resize", handleResize, true);
    window.addEventListener("scroll", handleScroll, true);
    return (): void => {
      window.removeEventListener("pointerdown", handlePointerDown, true);
      window.removeEventListener("resize", handleResize, true);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [stripPress]);
  let callback = (): void => {
    ref.current.open = false;
    onDone?.();
  };
  return (
    <div
      className={joinClassNames(
        "ds-postit flex flex-col",
        size === "doc" ? "ds-postit-doc" : undefined,
      )}
      role={"group"}
      aria-label={((title) + (": ")) + (label)}
      data-testid={testid !== undefined ? testid + "-note" : undefined}
      {...(anchorKey !== undefined
        ? commentTargetProps("note", anchorKey)
        : {})}
    >
      {[<div className={"ds-postit-head flex items-center gap-xs"}>
          {[<Icon
              name={"Note"}
              size={"sm"}
              className={"text-muted"}
            />, <span
              className={
                "min-w-0 flex-1 truncate text-footnote font-semibold text-primary"
              }
            >
              {title}
            </span>, canEdit && hasUsageNote(note) ? (
              <Button
                variant={"ghost"}
                size={"xs"}
                iconOnly={true}
                icon={"Trash"}
                aria-label={uiMessage("design-system.usageNotes.delete2", { subject: String(title.toLowerCase()) })}
                tooltip={uiMessage("design-system.usageNotes.delete")}
                onMouseDown={(event: React.MouseEvent<HTMLButtonElement>) =>
                  event.preventDefault()
                }
                onClick={(): void => {
                  flushMarkdownCommitQueues();
                  onChange!("");
                  ref.current.open = false;
                  onDone?.();
                  onClose();
                }}
                data-testid={
                  testid !== undefined ? testid + "-delete" : undefined
                }
              />
            ) : null, <Button
              variant={"ghost"}
              size={"xs"}
              iconOnly={true}
              icon={"X"}
              aria-label={uiMessage("design-system.usageNotes.close")}
              tooltip={uiMessage("design-system.usageNotes.close")}
              onClick={onClose}
              data-note-close={""}
              data-testid={
                testid !== undefined ? testid + "-close" : undefined
              }
            />]}
        </div>, <div
          ref={popupRef}
          className={"ds-postit-body ds-desc ds-comp-about prose min-w-0"}
          onMouseDown={canEdit ? focusUsageEditorBackground : undefined}
          data-testid={testid !== undefined ? testid + "-cell" : undefined}
        >
          <MarkdownEditor
            markdown={note!}
            readOnly={!canEdit}
            placeholder={placeholder}
            label={((label) + (" ")) + (title.toLowerCase())}
            {...(testid !== undefined
              ? {
                  testId: testid,
                }
              : {})}
            {...(onChange !== undefined
              ? {
                  onMarkdown: (markdown: string): void => {
                    ref.current.open = true;
                    onChange(markdown);
                  },
                }
              : {})}
            onDone={callback}
          />
        </div>]}
    </div>
  );
}
export {
  focusUsageEditorBackground,
  hasUsageNote,
  jsxUsageEditor,
  NotesPopoverEditor,
  prefersCoarsePointer,
  reactUsageEditor,
  UsageNoteEditor,
};
export function installEditorUsageNotes(): () => void {
  return () => {
    reactUsageEditor = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxUsageEditor = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    prefersCoarsePointer = () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(pointer: coarse)").matches;
  };
}
