import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { COMMENT_TARGET_PROPS, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { EMPTY_DOC_LINKS } from "./document-sections";
import { EditableName } from "./editable-name";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonTooltip } from "../ui/avatars";
import { Button } from "../ui/buttons";
import { Collapsible } from "../ui/disclosure";
import { joinClassNames } from "../ui/property-icons";
import { PropertySectionHeader } from "../ui/property-row";

var reactSectionCollapse: typeof import("react");
var jsxSectionCard: typeof import("react/jsx-runtime");
var SECTION_CARD_CLASS_NAME: string;
var SECTION_HEAD_INTERACTIVE_SELECTOR: string;
function restoreFocusAfterRemoval(
  element: HTMLElement,
  force: boolean = false,
): () => void {
  let ownerDocument = element.ownerDocument,
    ancestor = element.closest(".ds-tokrow, tr, [data-card-key]");
  if (
    ancestor === null ||
    (!force && !ancestor.contains(ownerDocument.activeElement))
  ) {
    return (): void => {
      return;
    };
  }
  let parentElement = ancestor.parentElement,
    value =
      parentElement === null
        ? -1
        : [...parentElement.children]
            .filter((childElement) =>
              childElement.matches(".ds-tokrow, tr, [data-card-key]"),
            )
            .indexOf(ancestor),
    items: Element[] = [];
  for (
    let focusTarget = parentElement;
    focusTarget !== null && focusTarget !== ownerDocument.body;
    focusTarget = focusTarget.parentElement
  ) {
    if (focusTarget.matches('section, table, [role="table"]')) {
      items.push(
        ...[
          focusTarget,
          focusTarget.nextElementSibling,
          focusTarget.previousElementSibling,
        ].filter((candidateElement): candidateElement is Element => candidateElement !== null),
      );
    }
  }
  let index: number = 0,
    callback = (): void => {
      let activeElement = ownerDocument.activeElement;
      if (
        ancestor.isConnected ||
        (activeElement !== null &&
          activeElement !== ownerDocument.body &&
          activeElement.closest('[role="menu"]') !== null)
      ) {
        if (++index < 20) {
          requestAnimationFrame(callback);
        }
        return;
      }
      if (activeElement !== null && activeElement !== ownerDocument.body) {
        return;
      }
      let siblings =
        parentElement !== null && parentElement.isConnected
          ? [...parentElement.children].filter((childElement) =>
              childElement.matches(".ds-tokrow, tr, [data-card-key]"),
            )
          : [];
      for (let candidate of [siblings[value], siblings[value - 1], ...items]) {
        if (candidate === undefined || !candidate.isConnected) {
          continue;
        }
        let focusable =
          candidate instanceof HTMLElement && candidate.tabIndex >= 0
            ? candidate
            : candidate.querySelector<HTMLElement>(
                'button:not([disabled]), input:not([disabled]), [contenteditable="true"], [tabindex]:not([tabindex="-1"])',
              );
        if (focusable !== null) {
          focusable.focus();
          return;
        }
      }
    };
  return () => requestAnimationFrame(callback);
}
function nearestScrollableAncestor(element: HTMLElement): HTMLElement {
  let parentElement = element.parentElement;
  while (parentElement !== null) {
    let overflowY = getComputedStyle(parentElement).overflowY;
    if (overflowY === "auto" || overflowY === "scroll") {
      return parentElement;
    }
    parentElement = parentElement.parentElement;
  }
  return document.documentElement;
}
function scrollEditorElementIntoView(element: HTMLElement | null): void {
  if (element === null) {
    return;
  }
  let value = nearestScrollableAncestor(element),
    scrollTop =
      value === document.documentElement
        ? 0
        : value.getBoundingClientRect().top,
    offsetTop = element.getBoundingClientRect().top - scrollTop;
  if (offsetTop >= 0) {
    return;
  }
  let nextScrollTop: number = Math.max(0, value.scrollTop + offsetTop);
  if (typeof value.scrollTo === "function") {
    value.scrollTo({
      top: nextScrollTop,
      behavior: "instant",
    });
  } else {
    value.scrollTop = nextScrollTop;
  }
}
function isSectionHeadBackgroundEvent(
  event: React.MouseEvent<HTMLElement>,
): boolean {
  let target = event.target as Element;
  if (!event.currentTarget.contains(target)) {
    return false;
  }
  let ancestor = target.closest(SECTION_HEAD_INTERACTIVE_SELECTOR);
  return (
    ancestor === null ||
    !event.currentTarget.contains(ancestor) ||
    ancestor === event.currentTarget
  );
}
function SectionCollapseButton({
  open: open,
  onToggle: onToggle,
  label: label,
  "data-testid": dataTestid,
}: Token.SectionCollapseButtonProps): React.ReactElement {
  useUiLocale();
  return (
    <Button
      variant={"ghost"}
      size={"sm"}
      iconOnly={true}
      icon={"CaretRight"}
      aria-label={(open ? uiMessage("design-system.sectionCard.collapse") : uiMessage("design-system.sectionCard.expand")) + label}
      aria-expanded={open}
      tooltip={false}
      className={joinClassNames(
        "transition-transform duration-fast",
        open && "rotate-90",
      )}
      onClick={onToggle}
      data-testid={dataTestid}
      {...UNCOMMENTABLE_PROPS}
    />
  );
}
function RemoveSectionButton({
  label: label,
  why: why,
  onRemove: onRemove,
  icon = "X",
  verb = uiMessage("design-system.sectionCard.delete"),
  "data-testid": dataTestid,
}: Token.RemoveSectionButtonProps): React.ReactElement {
  useUiLocale();
  let value = why !== undefined || onRemove === undefined;
  return (
    <DisabledReasonTooltip
      reason={value ? (why ?? uiMessage("design-system.sectionCard.readOnly")) : undefined}
    >
      <Button
        variant={"ghost"}
        size={"sm"}
        iconOnly={true}
        icon={icon}
        aria-label={((verb) + (" ")) + (label)}
        tooltip={verb}
        disabled={value}
        onClick={
          onRemove === undefined
            ? undefined
            : (event: React.MouseEvent<HTMLButtonElement>): void => {
                let restoreFocus = restoreFocusAfterRemoval(event.currentTarget);
                onRemove();
                restoreFocus();
              }
        }
        onKeyDown={(event: React.KeyboardEvent<HTMLButtonElement>): void => {
          if (event.repeat && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
          }
        }}
        data-testid={dataTestid}
        {...UNCOMMENTABLE_PROPS}
      />
    </DisabledReasonTooltip>
  );
}
function SectionCard({
  head: head,
  actions: actions,
  className: className,
  cardKey: cardKey,
  anchorId: anchorId,
  dropGroup: dropGroup,
  overlay: overlay,
  dropHandlers: dropHandlers,
  "data-testid": dataTestid,
  flat = false,
  children: children,
}: Token.SectionCardProps): React.ReactElement {
  useUiLocale();
  let [value, setCollapsed] = reactSectionCollapse.useState(false),
    ref = reactSectionCollapse.useRef<HTMLDivElement | null>(null);
  reactSectionCollapse.useLayoutEffect((): void => {
    if (value) {
      scrollEditorElementIntoView(ref.current?.parentElement ?? null);
    }
  }, [value]);
  let callback = () => setCollapsed((isOpen): boolean => !isOpen),
    testId = head["data-testid"],
    hasRename: boolean = head.onRename !== undefined,
    renameInput = hasRename ? (
      (() => {
        const _Element = EditableName;
        const _elementProps = {
          kind: "title" as const,
          name: head.title,
          defaultTitle: head.defaultTitle,
          placeholder: head.autoEdit?.placeholder ?? head.placeholder,
          taken: EMPTY_DOC_LINKS,
          commit: (name: string) => head.onRename?.(name) ?? true,
          autoEdit: head.autoEdit !== undefined,
          onEditing:
            head.autoEdit !== undefined
              ? (isOpen: boolean): void => {
                  if (!isOpen) {
                    head.autoEdit?.onEnd();
                  }
                }
              : undefined,
          "data-testid": testId !== undefined ? testId + "-title" : undefined,
          inputTestId: testId !== undefined ? testId + "-field" : undefined,
        };
        const _elementKey = head.autoEdit !== undefined ? "naming" : "named";
        return <_Element key={_elementKey} {..._elementProps} />;
      })()
    ) : (
      <span
        data-testid={testId !== undefined ? testId + "-title" : undefined}
      >
        {head.title}
      </span>
    ),
    cardActions =
      actions !== undefined || head.onRemove !== undefined || hasRename ? (
        <jsxSectionCard.Fragment>
          {[actions, head.onRemove !== undefined ? (
              <RemoveSectionButton
                label={head.title}
                why={head.removeWhy}
                onRemove={head.onRemove}
                icon={flat ? "Trash" : "X"}
                data-testid={
                  testId !== undefined ? testId + "-delete" : undefined
                }
              />
            ) : null, hasRename && !flat ? (
              <SectionCollapseButton
                open={!value}
                onToggle={callback}
                label={head.title}
              />
            ) : null]}
        </jsxSectionCard.Fragment>
      ) : undefined;
  return (
    <Collapsible.Root
      open={!value}
      className={joinClassNames(
        SECTION_CARD_CLASS_NAME,
        className,
      )}
      data-testid={dataTestid}
      data-card-key={cardKey}
      data-id={anchorId}
      data-drop-group={dropGroup}
      data-collapsed={value ? "" : undefined}
      {...dropHandlers}
    >
      {[<div
          ref={ref}
          className={joinClassNames(
            "ds-sh sticky top-0 z-[2] bg-surface-1",
            !value && "border-b border-alpha-2",
          )}
          data-expanded={String(!value)}
          data-testid={testId}
          onClick={
            hasRename && !flat
              ? (
                  event: React.MouseEvent<HTMLDivElement>,
                ): void => {
                  if (isSectionHeadBackgroundEvent(event)) {
                    callback();
                  }
                }
              : undefined
          }
          {...(anchorId !== undefined ? COMMENT_TARGET_PROPS : {})}
        >
          <PropertySectionHeader
            title={renameInput}
            actions={cardActions}
            collapsed={value}
            onToggle={hasRename || flat ? undefined : callback}
          />
        </div>, <Collapsible.Panel keepMounted={true}>
          <div className={"flex min-w-0 flex-col"}>{children}</div>
        </Collapsible.Panel>, overlay]}
    </Collapsible.Root>
  );
}
export {
  isSectionHeadBackgroundEvent,
  jsxSectionCard,
  nearestScrollableAncestor,
  reactSectionCollapse,
  RemoveSectionButton,
  restoreFocusAfterRemoval,
  scrollEditorElementIntoView,
  SECTION_CARD_CLASS_NAME,
  SECTION_HEAD_INTERACTIVE_SELECTOR,
  SectionCard,
  SectionCollapseButton,
};
export function installEditorSectionCard(): () => void {
  return () => {
    reactSectionCollapse = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxSectionCard = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    SECTION_CARD_CLASS_NAME =
      "ds-sec relative flex min-w-0 flex-col overflow-clip rounded-card bg-surface-1 shadow-card-ring";
    SECTION_HEAD_INTERACTIVE_SELECTOR =
      'button,input,textarea,select,label,a,[role="button"],[role="radio"],[role="switch"],[role="checkbox"],[role="slider"],[role="menuitem"],[contenteditable="true"]';
  };
}
