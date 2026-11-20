import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  CommitTextInputProps,
  EditableTextProps,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { TooltipImplementationProvider } from "./avatars";
import { APP_DENSITY } from "./color-mode";
import { CdsRoot } from "./overlays";
import { joinClassNames } from "./property-icons";
import { ToastProvider } from "./toast";

var jsxSC: JsxNamespace;
var reactJW: ReactNamespace;
var jsxForUiCommitTextInput: JsxNamespace;
function AppDesignProvider({ children: children }: React.PropsWithChildren) {
  useUiLocale();
  return (
    <CdsRoot
      density={APP_DENSITY}
      font={"anthropic"}
      className={"contents"}
    >
      <TooltipImplementationProvider>
        <ToastProvider>{children}</ToastProvider>
      </TooltipImplementationProvider>
    </CdsRoot>
  );
}
function CommitTextInput({
  value: initialText,
  onCommit: onCommit,
  onCancel: onCancel,
  onChange: onChange,
  selectOnOpen = true,
  className: className,
  placeholder: placeholder,
  onKeyDown: onKeyDown,
  onBlur: onBlur,
  ...remainingProps
}: CommitTextInputProps) {
  useUiLocale();
  let [draft, setDraft] = reactJW.useState(initialText),
    ref = reactJW.useRef(false),
    committedByEnterRef = reactJW.useRef(false),
    finishedRef = reactJW.useRef(false),
    inputRef = reactJW.useRef<HTMLInputElement | null>(null);
  reactJW.useEffect(() => {
    let current = inputRef.current;
    if (current === null) {
      return;
    }
    current.focus({
      preventScroll: true,
    });
    if (selectOnOpen) {
      current.select();
    } else {
      current.setSelectionRange(current.value.length, current.value.length);
    }
  }, [selectOnOpen]);
  let callback = () => {
      if (finishedRef.current) {
        return;
      }
      finishedRef.current = true;
      if (ref.current) {
        ref.current = false;
        onCancel?.();
        return;
      }
      onCommit(draft, committedByEnterRef.current ? "enter" : "blur");
    },
    displayText = draft !== "" ? draft : (placeholder ?? "");
  return (
    <input
      {...remainingProps}
      ref={inputRef}
      className={joinClassNames("kit-rn-in", className)}
      value={draft}
      placeholder={placeholder}
      spellCheck={false}
      autoComplete={"off"}
      size={Math.max(2, displayText.length + 1)}
      onChange={(changeEvent: React.ChangeEvent<HTMLInputElement>) => {
        setDraft(changeEvent.currentTarget.value);
        onChange?.(changeEvent.currentTarget.value);
      }}
      onBlur={(focusEvent: React.FocusEvent<HTMLInputElement>) => {
        onBlur?.(focusEvent);
        callback();
      }}
      onKeyDown={(event: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(event);
        event.stopPropagation();
        if (event.nativeEvent.isComposing || event.keyCode === 229) {
          return;
        }
        if (event.key === "Enter") {
          event.preventDefault();
          committedByEnterRef.current = true;
          event.currentTarget.blur();
        } else if (event.key === "Escape") {
          event.preventDefault();
          ref.current = true;
          event.currentTarget.blur();
        }
      }}
    />
  );
}
function EditableText({
  value: committedText,
  onCommit: onCommit,
  readOnly = false,
  onEditingChange: onEditingChange,
  defaultEditing = false,
  initialDraft: initialDraft,
  placeholder: placeholder,
  maxLength: maxLength,
  tabIndex = 0,
  className: className,
  inputTestId: inputTestId,
  "aria-label": ariaLabel,
  "data-testid": testId,
}: EditableTextProps) {
  useUiLocale();
  let [editing, setEditing] = reactJW.useState(defaultEditing && !readOnly),
    initialRenderRef = reactJW.useRef(true),
    editingChangeRef = reactJW.useRef(onEditingChange);
  editingChangeRef.current = onEditingChange;
  let previousEditingRef = reactJW.useRef(false),
    inputRef = reactJW.useRef<HTMLSpanElement | null>(null),
    cancelledRef = reactJW.useRef(false);
  reactJW.useLayoutEffect(() => {
    if (editing !== previousEditingRef.current) {
      previousEditingRef.current = editing;
      editingChangeRef.current?.(editing);
    }
    if (!editing && cancelledRef.current) {
      cancelledRef.current = false;
      inputRef.current?.focus({
        preventScroll: true,
      });
    }
  }, [editing]);
  let callback = (restoreFocus: boolean) => {
    initialRenderRef.current = false;
    cancelledRef.current = restoreFocus;
    setEditing(false);
  };
  if (readOnly) {
    return (
      <span
        className={joinClassNames("kit-rn", className)}
        data-testid={testId}
      >
        {committedText}
      </span>
    );
  }
  if (!editing) {
    return (
      <span
        ref={inputRef}
        className={joinClassNames(
          "kit-rn kit-rn-editable",
          className,
        )}
        role={"button"}
        tabIndex={tabIndex}
        aria-description={uiMessage("design-system.commitTextInput.clickToRename")}
        data-testid={testId}
        onClick={(clickEvent: React.MouseEvent<HTMLSpanElement>) => {
          clickEvent.stopPropagation();
          setEditing(true);
        }}
        onKeyDown={(event: React.KeyboardEvent<HTMLSpanElement>) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            event.stopPropagation();
            setEditing(true);
          }
        }}
      >
        {committedText}
      </span>
    );
  }
  return (
    <span
      className={joinClassNames("kit-rn-on", className)}
      onClick={(clickEvent: React.MouseEvent<HTMLSpanElement>) =>
        clickEvent.stopPropagation()
      }
    >
      <CommitTextInput
        value={
          initialRenderRef.current && initialDraft !== undefined
            ? initialDraft
            : committedText
        }
        placeholder={placeholder}
        maxLength={maxLength}
        aria-label={ariaLabel ?? (uiMessage("design-system.commitTextInput.rename", { value1: String(committedText) }))}
        data-testid={
          inputTestId ??
          (testId !== undefined ? testId + "-input" : undefined)
        }
        onCommit={(nextText: string, reason: "enter" | "blur") => {
          callback(reason === "enter");
          onCommit(nextText);
        }}
        onCancel={() => callback(true)}
      />
    </span>
  );
}
export {
  AppDesignProvider,
  CommitTextInput,
  EditableText,
  jsxForUiCommitTextInput,
  jsxSC,
  reactJW,
};
export function installUiCommitTextInput(): () => void {
  return () => {
    jsxSC = toModuleNamespace(loadJsxNamespace(), 1);
    reactJW = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxForUiCommitTextInput = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
  };
}
