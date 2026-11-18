import type { DocumentInputState, InputFocusEvent } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeOnce } from "../../module-helpers";

var documentInputStates: WeakMap<Document, DocumentInputState>;
var dismissalKeys: Set<string>;
var initializeDomInputObservation: () => void;
function observeDocumentInput(doc?: Document): void {
  if (doc === undefined || documentInputStates.has(doc)) return;
  let state = {
    observedInput: false,
    lastInputDismissing: false,
  };
  documentInputStates.set(doc, state);
  let eventTarget: Pick<Document, "addEventListener"> = doc.defaultView ?? doc;
  eventTarget.addEventListener(
    "keydown",
    (event) => {
      event.isTrusted &&
        ((state.observedInput = true),
        (state.lastInputDismissing =
          !event.isComposing && dismissalKeys.has(event.key)));
    },
    true,
  );
  eventTarget.addEventListener(
    "pointerdown",
    (event) => {
      event.isTrusted &&
        ((state.observedInput = true), (state.lastInputDismissing = true));
    },
    true,
  );
  doc.defaultView?.addEventListener("blur", () => {
    state.observedInput = false;
    state.lastInputDismissing = false;
  });
}
function ensureDocumentInputObserver(element?: Element | null): void {
  observeDocumentInput(element?.ownerDocument);
}
function isRestoredFocus(event: InputFocusEvent): boolean {
  if (event.relatedTarget !== null && event.relatedTarget !== undefined)
    return false;
  let ownerDocument = (event.target as Element | null)?.ownerDocument ?? undefined,
    inputState = ownerDocument == null ? undefined : documentInputStates.get(ownerDocument);
  return inputState === undefined || !inputState.observedInput
    ? false
    : inputState.lastInputDismissing;
}
export {
  dismissalKeys,
  documentInputStates,
  ensureDocumentInputObserver,
  initializeDomInputObservation,
  isRestoredFocus,
  observeDocumentInput,
};
export function installCdsDomInputObservation(): () => void {
  return () => {
    initializeDomInputObservation = initializeOnce(() => {
      documentInputStates = new WeakMap();
      dismissalKeys = new Set(["Escape", "Enter", " "]);
    });
  };
}
