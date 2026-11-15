/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { loadJsxNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var COLLABORATOR_TINTS: C.CollaboratorTint[];
var COLLABORATOR_TINTS_WITH_MUTED: (C.CollaboratorTint | "muted")[];
var jsxCollaboratorTints: typeof import("react/jsx-runtime");
export {
  COLLABORATOR_TINTS,
  COLLABORATOR_TINTS_WITH_MUTED,
  jsxCollaboratorTints,
};
export function installUiCollaboratorTints(): () => void {
  return () => {
    COLLABORATOR_TINTS = [
      "categorical-1",
      "categorical-2",
      "categorical-3",
      "categorical-4",
      "categorical-5",
      "categorical-6",
      "categorical-7",
      "categorical-8",
    ];
    COLLABORATOR_TINTS_WITH_MUTED = [...COLLABORATOR_TINTS, "muted"];
    jsxCollaboratorTints = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
  };
}
