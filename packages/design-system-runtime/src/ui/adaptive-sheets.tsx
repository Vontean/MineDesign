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
  let value: MobileSheetParts | null = useSheetImplementation(),
    { pending: isPending } = useSheetState();
  if (value !== null) {
    return (
      <value.SheetPopupHost>
        {(sheetState: SheetRenderState): React.ReactNode => children(sheetState, value)}
      </value.SheetPopupHost>
    );
  }
  return (
    <jsxtK.Fragment>
      {[children(
          isPending ? concealedSheetHost : defaultSheetHost,
          null,
        ), isPending ? <PendingSheetBackdrop kind={kind} /> : null]}
    </jsxtK.Fragment>
  );
}
export {
  AdaptiveSheetPopupHost,
  jsxtK,
};
export function installUiAdaptiveSheets(): () => void {
  return () => {
    initializeSheetStyles();
    initializePresentationMode();
    initializeAdaptiveSheets();
    initializeSheetClassNames();
    initializeAdaptiveSheets();
    jsxtK = toModuleNamespace(loadJsxNamespace(), 1);
    initializeOverlayFocus();
    initializeOverlayStack();
    initializePopupPointerFocus();
  };
}
