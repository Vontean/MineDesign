/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  TextCommitKey,
  TextCommitOptions,
  TextCommitController,
  UseTextCommitOptions,
  TextEditorElement,
} from "../contracts/composition";
import { loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactTextCommitController: ReactNamespace;
var reactTextCommit: ReactNamespace;
var observedAutoResizeTextareas: WeakSet<Element>;
function createTextCommitController(
  options: TextCommitOptions,
): TextCommitController {
  let errorRef = options.error ?? {
      current: null,
    },
    isEditing = false,
    validateDraft = (draft: string) =>
      options.validate !== undefined && draft !== options.value()
        ? options.validate(draft)
        : null,
    commitDraft = () => {
      let value = isEditing ? options.draft.current : null;
      options.draft.current = null;
      isEditing = false;
      errorRef.current = null;
      if (value === null || value === options.value()) {
        return;
      }
      if (value.trim() === "" && options.allowEmpty !== true) {
        return;
      }
      if (validateDraft(value) !== null) {
        return;
      }
      options.commit(value);
    },
    finishEditing = (forced: boolean) => {
      if (options.escaped.current) {
        options.escaped.current = false;
        options.draft.current = null;
        isEditing = false;
        errorRef.current = null;
      } else if (
        forced &&
        isEditing &&
        (options.draft.current ?? "").trim() === ""
      ) {
        options.draft.current = null;
        isEditing = false;
        errorRef.current = null;
      } else {
        commitDraft();
      }
      options.rerender();
    };
  return {
    display: () => options.draft.current ?? options.value(),
    onFocus() {
      options.draft.current = options.value();
      options.escaped.current = false;
      isEditing = false;
      errorRef.current = null;
      options.rerender();
    },
    onChange(nextDraft: string) {
      options.draft.current = nextDraft;
      isEditing = true;
      if (errorRef.current !== null) {
        errorRef.current = validateDraft(nextDraft);
      }
      options.rerender();
    },
    onBlur() {
      finishEditing(false);
    },
    onForcedExit() {
      finishEditing(true);
    },
    onKeyDown(keyEvent: TextCommitKey) {
      if (keyEvent.key === "Enter") {
        let current = options.draft.current,
          value = current === null ? null : validateDraft(current);
        if (value !== null) {
          errorRef.current = value;
          options.rerender();
          return {};
        }
        return {
          blur: true,
        };
      }
      if (keyEvent.key === "Escape") {
        options.escaped.current = true;
        return {
          blur: true,
        };
      }
      if (
        (keyEvent.metaKey || keyEvent.ctrlKey) &&
        keyEvent.key.toLowerCase() === "s"
      ) {
        let current = options.draft.current,
          value = current === null ? null : validateDraft(current);
        if (value !== null) {
          errorRef.current = value;
        } else {
          commitDraft();
        }
        options.rerender();
      }
      return {};
    },
  };
}
function resizeTextareaToContent(textarea: TextEditorElement) {
  textarea.style.height = "";
  textarea.style.height = String(textarea.scrollHeight) + "px";
}
function observeAutoResizeTextarea(element: TextEditorElement | null) {
  if (
    element === null ||
    element.tagName !== "TEXTAREA" ||
    (typeof CSS !== "undefined" && CSS.supports("field-sizing", "content"))
  ) {
    return;
  }
  resizeTextareaToContent(element);
  if (
    typeof ResizeObserver === "undefined" ||
    observedAutoResizeTextareas.has(element)
  ) {
    return;
  }
  observedAutoResizeTextareas.add(element);
  new ResizeObserver(() =>
    requestAnimationFrame(() => resizeTextareaToContent(element)),
  ).observe(element);
}
function useTextCommit({
  value: committedValue,
  commit: commit,
  fold: fold,
  allowEmpty: allowEmpty,
  validate: validate,
  readOnly: readOnly,
}: UseTextCommitOptions) {
  let [, rerender] = reactTextCommit.useState(0),
    draftRef = reactTextCommit.useRef<string | null>(null),
    escapedRef = reactTextCommit.useRef(false),
    errorRef = reactTextCommit.useRef<string | null>(null),
    valueRef = reactTextCommit.useRef(committedValue);
  valueRef.current = committedValue;
  let commitRef = reactTextCommit.useRef(commit);
  commitRef.current = commit;
  let validateRef = reactTextCommit.useRef(validate);
  validateRef.current = validate;
  let foldRef = reactTextCommit.useRef(fold);
  foldRef.current = fold;
  let normalizeDraft = (draft: string) =>
      foldRef.current === true ? draft.replace(/\s+/g, " ").trim() : draft,
    controllerOptionsRef = reactTextCommit.useRef<TextCommitOptions | null>(
      null,
    );
  controllerOptionsRef.current ??= {
    value: () => valueRef.current,
    commit: (draft: string) => {
      if (normalizeDraft(draft) !== valueRef.current) {
        commitRef.current(normalizeDraft(draft));
      }
    },
    validate: (draft: string) =>
      validateRef.current?.(normalizeDraft(draft)) ?? null,
    draft: draftRef,
    escaped: escapedRef,
    error: errorRef,
    rerender: () => rerender((revision: number) => revision + 1),
  };
  controllerOptionsRef.current.allowEmpty = allowEmpty;
  let controllerRef = reactTextCommit.useRef<TextCommitController | null>(
    null,
  );
  controllerRef.current ??= createTextCommitController(
    controllerOptionsRef.current,
  );
  let controller = controllerRef.current;
  reactTextCommit.useEffect(() => {
    if (readOnly === true && draftRef.current !== null) {
      controller.onForcedExit();
    }
  }, [readOnly === true]);
  reactTextCommit.useEffect(
    () => () => {
      if (draftRef.current !== null) {
        controller.onForcedExit();
      }
    },
    [],
  );
  return {
    props: {
      ref: (editorElement: TextEditorElement | null) =>
        observeAutoResizeTextarea(editorElement),
      value: controller.display(),
      onFocus: () => {
        if (readOnly === true || draftRef.current !== null) {
          return;
        }
        controller.onFocus();
      },
      onChange: (event: React.ChangeEvent<TextEditorElement>) => {
        if (readOnly === true) {
          return;
        }
        controller.onChange(
          foldRef.current === true
            ? event.target.value.replace(/[\r\n]+/g, " ")
            : event.target.value,
        );
      },
      onBlur: () => {
        if (draftRef.current !== null) {
          controller.onBlur();
        }
      },
      onKeyDown: (event: React.KeyboardEvent<TextEditorElement>) => {
        if (
          readOnly === true ||
          event.nativeEvent.isComposing ||
          event.keyCode === 229
        ) {
          return;
        }
        if (event.key === "Escape" && draftRef.current === null) {
          return;
        }
        let keyResult = controller.onKeyDown(event);
        if (event.key === "Enter" || event.key === "Escape") {
          event.preventDefault();
        }
        if (keyResult.blur === true) {
          controller.onBlur();
        }
      },
    },
    error: errorRef.current,
  };
}
export {
  createTextCommitController,
  observeAutoResizeTextarea,
  observedAutoResizeTextareas,
  reactTextCommit,
  reactTextCommitController,
  resizeTextareaToContent,
  useTextCommit,
};
export function installUiTextCommit(): () => void {
  return () => {
    reactTextCommitController = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactTextCommit = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    observedAutoResizeTextareas = new WeakSet();
  };
}
