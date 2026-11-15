import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { type RuntimeBindings } from "../runtime-types";
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
function showEditorNotification(message: string, options?: number): void {
  (0, clearNonActionToasts)();
  (0, showToast)(message, options);
}
function showEditorPromiseNotification(
  promise: string,
  options: Parameters<RuntimeBindings["showActionToast"]>[1],
): number {
  (0, clearAllToasts)();
  return (0, showActionToast)(promise, options);
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
  input: HTMLElement,
): Token.RenameFocusContext {
  return {
    doc: input.ownerDocument,
    scope: input.closest('section, table, [role="table"]'),
    inRow: input.closest(TOKEN_ROW_SELECTOR) !== null,
  };
}
function restoreRenameFocus(
  { doc: doc, scope: scope, inRow: inRow }: Token.RenameFocusContext,
  committedName: string,
  originalName: string,
): void {
  let callback = (input: ParentNode, options: string) => {
    return (
      [...input.querySelectorAll<HTMLElement>(RENAME_NAME_SELECTOR)]
        .find(
          (input2) =>
            input2.dataset.rnName === options &&
            (input2.closest(TOKEN_ROW_SELECTOR) !== null) === inRow,
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
    callback = (input: string) => {
      if (commit === undefined) {
        return name;
      }
      if (kind === "title") {
        let value5 = input.replace(/\s+/g, " ").trim();
        if (value5 === name || (autoEdit && value5 === "")) {
          return name;
        }
        let value6 = normalizeSectionTitle(input, defaultTitle),
          value7 = commit(value6);
        if (value7 === false) {
          showEditorNotification(uiMessage("design-system.editableName.couldNotRename") + name + ".");
          return name;
        }
        if (typeof value7 === "string") {
          return value7;
        } else {
          if (value6 === "") {
            return defaultTitle ?? name;
          } else {
            return value5;
          }
        }
      }
      let value2 = (0, normalizeTokenName)(input).replace(
        /\s+/g,
        "-",
      );
      if (value2 === name) {
        return name;
      }
      let value3 = validateTokenRename(value2, name, taken);
      if (value3 !== null) {
        showEditorNotification(value3);
        return name;
      }
      let value4 = commit(value2);
      if (value4 === false) {
        showEditorNotification(uiMessage("design-system.editableName.couldNotRename") + name + ".");
        return name;
      }
      if (typeof value4 === "string") {
        return value4;
      } else {
        return value2;
      }
    },
    callback2 = (input: string): void => {
      let current = ref.current;
      ref.current = null;
      if (current !== null && tabIndex === 0) {
        restoreRenameFocus(current, input, name);
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
        if ((0, isComposingEvent)(event)) {
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
        onCommit={(input: string) => callback2(callback(input))}
        onEditingChange={(input: boolean): void => {
          if (input) {
            ref.current = null;
          }
          onEditing?.(input);
          if (!input) {
            callback2(name);
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
    reactTokenRename = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxTokenRename = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    TOKEN_ROW_SELECTOR = ".ds-tokrow, tr";
    RENAME_NAME_SELECTOR = "[data-rn-name]";
    RENAME_BUTTON_SELECTOR = RENAME_NAME_SELECTOR + ' [role="button"]';
  };
}
