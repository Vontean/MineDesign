import type { FieldState } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { load_react } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactFieldContext: typeof React;
var FieldStateContext: React.Context<FieldState | null>;
var initializeFieldContext: () => void;
function useFieldInvalid(): boolean {
  return (
    (0, reactFieldContext.useContext)(FieldStateContext)?.invalid ?? false
  );
}
function useFieldDisabled(): boolean {
  return (
    (0, reactFieldContext.useContext)(FieldStateContext)?.disabled ?? false
  );
}
function isInsideField(): boolean {
  return (0, reactFieldContext.useContext)(FieldStateContext) !== null;
}
export {
  FieldStateContext,
  initializeFieldContext,
  isInsideField,
  reactFieldContext,
  useFieldDisabled,
  useFieldInvalid,
};
export function installCdsFieldContext(): () => void {
  return () => {
    initializeFieldContext = initializeOnce(() => {
      "use client";

      reactFieldContext = toModuleNamespace(
        load_react(),
      );
      FieldStateContext = (0,
      reactFieldContext.createContext)<FieldState | null>(null);
    });
  };
}
