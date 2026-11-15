import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type {
  AdaptiveSheetPopupHostProps,
  SheetRenderState,
  MobileSheetParts,
} from "../contracts/overlays";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { concealedSheetHost, defaultSheetHost, initializeAdaptiveSheets, initializePresentationMode, initializeSheetClassNames, initializeSheetStyles, useSheetImplementation, useSheetState } from "./foundation";
import { initializeOverlayFocus, initializeOverlayStack, initializePopupPointerFocus } from "./overlays";
import { PendingSheetBackdrop } from "./text-input-overlay";

var jsxtK: typeof import("react/jsx-runtime");
function AdaptiveSheetPopupHost({
  kind: kind,
  children: children,
}: AdaptiveSheetPopupHostProps): React.ReactElement {
  useUiLocale();
  let value: MobileSheetParts | null = (0, useSheetImplementation)(),
    { pending: value2 } = (0, useSheetState)();
  if (value !== null) {
    return (
      <value.SheetPopupHost>
        {(input: SheetRenderState): React.ReactNode => children(input, value)}
      </value.SheetPopupHost>
    );
  }
  return (
    <jsxtK.Fragment>
      {[children(
          value2 ? concealedSheetHost : defaultSheetHost,
          null,
        ), value2 ? <PendingSheetBackdrop kind={kind} /> : null]}
    </jsxtK.Fragment>
  );
}
export {
  AdaptiveSheetPopupHost,
  jsxtK,
};
export function installUiAdaptiveSheets(): () => void {
  return () => {
    (0, initializeSheetStyles)();
    (0, initializePresentationMode)();
    (0, initializeAdaptiveSheets)();
    (0, initializeSheetClassNames)();
    (0, initializeAdaptiveSheets)();
    jsxtK = (0, toModuleNamespace)((0, loadJsxNamespace)(), 1);
    (0, initializeOverlayFocus)();
    (0, initializeOverlayStack)();
    (0, initializePopupPointerFocus)();
  };
}
