import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { DesignCanvas } from "../canvas/design-canvas";
import { CanvasDialogHost } from "../canvas/dialogs";
import { CanvasLoadFailure, useCanvasLoadState } from "../canvas/load-state";
import { ScreenReaderAnnouncer } from "../editor/accessibility/announcer";
import { PendingEditorToasts } from "../editor/chrome/pending-toasts";
import { EditorChromeRoot } from "../editor/chrome/root";
import { reactChromeTheme } from "../editor/chrome/theme";
import { EditorToastProvider } from "../editor/chrome/toast";
import { CodePasteTrustDialog } from "../editor/clipboard/trust-dialog";
import { blurTextOutsideFind } from "../editor/keyboard/find";
import { NotesLinkEditingLabel } from "../editor/notes/link-editing";
import { useExportDeliveries as R_useExportDeliveries } from "../export/delivery-ui";

function initializeDesignKeyboardBindings(): Dynamic {
  (0, blurTextOutsideFind)(
    document,
    undefined,
    (document as Dynamic).querySelector("[data-note-typing-strip]") !== null
      ? NotesLinkEditingLabel
      : undefined,
  );
}
function DesignDocumentRoot(props?: Dynamic): Dynamic {
  useUiLocale();
  let loadState: Dynamic = (0, useCanvasLoadState)(props.doc),
    [restoreCount, setRestoreCount]: Dynamic = (0,
    reactChromeTheme.useState)(
      (): Dynamic => props.doc.restoreCount(),
    );
  (0, reactChromeTheme.useEffect)((): Dynamic => {
    let callback: Dynamic = (): Dynamic => {
      setRestoreCount(props.doc.restoreCount());
      let value: Dynamic = props.doc.title();
      value !== "" &&
        value !== (document as Dynamic).title &&
        ((document as Dynamic).title = value);
    };
    callback();
    return props.doc.subscribe(callback);
  }, [props.doc]);
  return (
    <EditorChromeRoot>
      <EditorToastProvider>
        {loadState === "live" ? (<DesignCanvas key={restoreCount} {...props} />) : (<CanvasLoadFailure
            doc={props.doc}
            filePath={props.filePath}
          />)}
        <R_useExportDeliveries />
        <PendingEditorToasts />
        <ScreenReaderAnnouncer />
        <CanvasDialogHost />
        <CodePasteTrustDialog />
      </EditorToastProvider>
    </EditorChromeRoot>
  );
}
export {
  DesignDocumentRoot,
  initializeDesignKeyboardBindings,
};
export function installApplicationDocumentRoot(): () => void {
  return () => {};
}
