import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { isComposingEvent } from "./markdown-toolbar";
import { normalizeTokenName } from "../model/token-commands";
import { TOKEN_NAME_PATTERN } from "../model/tokens";
import { toModuleNamespace } from "../module-helpers";
import { EditableText } from "../ui/commit-text-input";
import { clearAllToasts, clearNonActionToasts, showActionToast, showToast } from "../ui/toasts";

var reactTokenRename: typeof import("react");
var jsxTokenRename: typeof import("react/jsx-runtime");
var TOKEN_ROW_SELECTOR: string;
var RENAME_NAME_SELECTOR: string;
var RENAME_BUTTON_SELECTOR: string;
function showEditorNotification(message: string, toastOptions?: number): void {
  clearNonActionToasts();
  showToast(message, toastOptions);
}
function showEditorPromiseNotification(
  promise: string,
  toastOptions: Parameters<typeof showActionToast>[1],
): number {
  clearAllToasts();
  return showActionToast(promise, toastOptions);
}
function validateTokenRename(
  name: string,
  currentName: string,
  taken: ReadonlySet<string>,
): string | null {
  if (name === "") {
    return uiMessage("design-system.editableName.aTokenNeedsAName");
  }
  if (!TOKEN_NAME_PATTERN.test(name)) {
    return (
      "“" + name + "” is not a token name — letters, digits, . _ and - only."
    );
  }
  if (name !== currentName && taken.has(name)) {
    return "“" + name + "” already exists.";
  }
  return null;
}
function normalizeSectionTitle(title: string, defaultTitle?: string): string {
  let value = title.replace(/\s+/g, " ").trim();
  if (value === defaultTitle) {
    return "";
  } else {
    return value;
  }
}
function captureRenameFocusContext(
  inputElement: HTMLElement,
): Token.RenameFocusContext {
  return {
    doc: inputElement.ownerDocument,
    scope: inputElement.closest('section, table, [role="table"]'),
    inRow: inputElement.closest(TOKEN_ROW_SELECTOR) !== null,
  };
}
function restoreRenameFocus(
  { doc: doc, scope: scope, inRow: inRow }: Token.RenameFocusContext,
  committedName: string,
  originalName: string,
): void {
  let callback = (parentNode: ParentNode, renameScope: string) => {
    return (
      [...parentNode.querySelectorAll<HTMLElement>(RENAME_NAME_SELECTOR)]
        .find(
          (candidate) =>
            candidate.dataset.rnName === renameScope &&
            (candidate.closest(TOKEN_ROW_SELECTOR) !== null) === inRow,
        )
        ?.querySelector<HTMLElement>('[role="button"]') ?? undefined
    );
  };
  requestAnimationFrame((): void => {
    if (doc.activeElement !== null && doc.activeElement !== doc.body) {
      return;
    }
    let value = scope?.isConnected === true ? scope : doc;
    (
      callback(value, committedName) ??
      callback(doc, committedName) ??
      (originalName !== committedName
        ? (callback(value, originalName) ?? callback(doc, originalName))
        : undefined)
    )?.focus({
      preventScroll: true,
    });
  });
}
function EditableName({
  name: name,
  taken: taken,
  commit: commit,
  kind = "token",
  defaultTitle: defaultTitle,
  placeholder: placeholder,
  onEditing: onEditing,
  autoEdit = false,
  className: className,
  inputTestId: inputTestId,
  tabIndex = 0,
  ...props
}: Token.EditableNameProps): React.ReactElement {
  useUiLocale();
  let ref = reactTokenRename.useRef<Token.RenameFocusContext | null>(null),
    value: string =
      "ds-rn" +
      (kind === "title" ? " ds-rn-title" : "") +
      (className !== undefined ? " " + className : ""),
    callback = (rawName: string) => {
      if (commit === undefined) {
        return name;
      }
      if (kind === "title") {
        let normalizedName = rawName.replace(/\s+/g, " ").trim();
        if (normalizedName === name || (autoEdit && normalizedName === "")) {
          return name;
        }
        let sectionName = normalizeSectionTitle(rawName, defaultTitle),
          commitResult = commit(sectionName);
        if (commitResult === false) {
          showEditorNotification(uiMessage("design-system.editableName.couldNotRename") + name + ".");
          return name;
        }
        if (typeof commitResult === "string") {
          return commitResult;
        } else {
          if (sectionName === "") {
            return defaultTitle ?? name;
          } else {
            return normalizedName;
          }
        }
      }
      let normalizedTokenName = normalizeTokenName(rawName).replace(
        /\s+/g,
        "-",
      );
      if (normalizedTokenName === name) {
        return name;
      }
      let validationError = validateTokenRename(normalizedTokenName, name, taken);
      if (validationError !== null) {
        showEditorNotification(validationError);
        return name;
      }
      let tokenCommitResult = commit(normalizedTokenName);
      if (tokenCommitResult === false) {
        showEditorNotification(uiMessage("design-system.editableName.couldNotRename") + name + ".");
        return name;
      }
      if (typeof tokenCommitResult === "string") {
        return tokenCommitResult;
      } else {
        return normalizedTokenName;
      }
    },
    commitRename = (nextName: string): void => {
      let current = ref.current;
      ref.current = null;
      if (current !== null && tabIndex === 0) {
        restoreRenameFocus(current, nextName, name);
      }
    };
  return (
    <span
      className={"contents"}
      data-rn-name={commit !== undefined ? name : undefined}
      onKeyDownCapture={(
        event: React.KeyboardEvent<HTMLSpanElement> & {
          target: HTMLElement;
        },
      ): void => {
        let target = event.target;
        if (target.tagName !== "INPUT") {
          if (event.repeat && (event.key === "Enter" || event.key === " ")) {
            event.preventDefault();
            event.stopPropagation();
          }
          return;
        }
        if (isComposingEvent(event)) {
          return;
        }
        if (
          event.key === "Enter" ||
          event.key === "Tab" ||
          event.key === "Escape"
        ) {
          ref.current = captureRenameFocusContext(target);
        }
      }}
    >
      <EditableText
        value={name}
        readOnly={commit === undefined}
        onCommit={(committedName: string) => commitRename(callback(committedName))}
        onEditingChange={(isEditing: boolean): void => {
          if (isEditing) {
            ref.current = null;
          }
          onEditing?.(isEditing);
          if (!isEditing) {
            commitRename(name);
          }
        }}
        defaultEditing={autoEdit}
        initialDraft={autoEdit ? "" : undefined}
        placeholder={
          kind === "title" ? (placeholder ?? (defaultTitle)) : (undefined)
        }
        tabIndex={tabIndex}
        className={value}
        inputTestId={inputTestId}
        data-testid={props["data-testid"]}
      />
    </span>
  );
}
export {
  captureRenameFocusContext,
  EditableName,
  jsxTokenRename,
  normalizeSectionTitle,
  reactTokenRename,
  RENAME_BUTTON_SELECTOR,
  RENAME_NAME_SELECTOR,
  restoreRenameFocus,
  showEditorNotification,
  showEditorPromiseNotification,
  TOKEN_ROW_SELECTOR,
  validateTokenRename,
};
export function installEditorEditableName(): () => void {
  return () => {
    reactTokenRename = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxTokenRename = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    TOKEN_ROW_SELECTOR = ".ds-tokrow, tr";
    RENAME_NAME_SELECTOR = "[data-rn-name]";
    RENAME_BUTTON_SELECTOR = RENAME_NAME_SELECTOR + ' [role="button"]';
  };
}
