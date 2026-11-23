import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { Dynamic } from '../../runtime-types';
import { reactChromeTheme as React } from '../../editor/chrome/theme';
import { emitEditorEvent } from '../../editor/events/runtime';
import { artboardStorePath, currentEditingArtboardPath, SessionArtboardStateConstant, setArtboardWritableCheck, setCurrentEditingArtboard } from '../../editor/session/artboard-state';
import { canvasMetadataFile } from '../../platform/file-content';
import { remoteFilesEventName } from '../frame-environment';
import { setFilePublishHandler } from '../working-state';

/** 跟踪当前画板的编辑占用，并向预览转发文件变化。 */
export function useCanvasDocumentActivity({ doc, supportsLoadState, editing, selectedFile, documentStateRef, focusedFileRef, markArtboardDropped, showToast }: {
  doc: Dynamic;
  supportsLoadState: boolean;
  editing: boolean;
  selectedFile: string | null;
  documentStateRef: Dynamic;
  focusedFileRef: Dynamic;
  markArtboardDropped: (file: string) => void;
  showToast: (message: string) => void;
}) {
  let [activityRevision, setActivityRevision]: Dynamic = (0, React.useState)(0),
    recentActivityRef: Dynamic = (0, React.useRef)(null),
    trackActivityRef: Dynamic = (0, React.useRef)(false);
  trackActivityRef.current = supportsLoadState && editing;
  let recordArtboardActivity: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        documentStateRef.current.artboards.some(
          (artboard?: Dynamic): Dynamic =>
            artboard.file === input && artboard.frameless,
        ) && markArtboardDropped(input);
        input === focusedFileRef.current &&
          ((recentActivityRef.current = {
            file: input,
            at: Date.now(),
          }),
          trackActivityRef.current &&
            currentEditingArtboardPath() !==
              artboardStorePath(input) &&
            setActivityRevision((revision?: Dynamic): Dynamic => revision + 1));
      },
      [],
    ),
    refreshArtboardActivity: Dynamic = (0, React.useCallback)(
      (input?: Dynamic): Dynamic => {
        input !== focusedFileRef.current ||
          currentEditingArtboardPath() !==
            artboardStorePath(input) ||
          (recentActivityRef.current = {
            file: input,
            at: Date.now(),
          });
      },
      [],
    );
  (0, React.useEffect)((): Dynamic => {
    let changed: Dynamic,
      expireActivity: Dynamic = (): Dynamic => {
        let previous: Dynamic = recentActivityRef.current,
          remaining: Dynamic =
            previous !== null && previous.file === selectedFile
              ? SessionArtboardStateConstant -
                (Date.now() - previous.at)
              : 0,
          active: Dynamic =
            supportsLoadState && editing && selectedFile !== null && remaining > 0;
        active || (recentActivityRef.current = null);
        let released: Dynamic = setCurrentEditingArtboard(
          active ? selectedFile : null,
        );
        released !== null && doc.releaseHold?.(released);
        active &&
          (changed = (window as Dynamic).setTimeout(expireActivity, remaining));
      };
    expireActivity();
    return (): Dynamic => (window as Dynamic).clearTimeout(changed);
  }, [supportsLoadState, editing, selectedFile, activityRevision, doc]);
  (0, React.useEffect)(
    (): Dynamic => (): Dynamic => {
      let changed: Dynamic = setCurrentEditingArtboard(null);
      changed !== null && doc.releaseHold?.(changed);
    },
    [doc],
  );
  (0, React.useEffect)((): Dynamic => {
    let changed: Dynamic = doc;
    setArtboardWritableCheck(
      changed.theirsOnItsWay
        ? (input?: Dynamic): Dynamic => changed.theirsOnItsWay(input)
        : changed.releaseHold
          ? uiMessage("canvas.designCanvas.cannotTell")
          : null,
    );
    return (): Dynamic => setArtboardWritableCheck(null);
  }, [doc]);
  let previousFilesRef: Dynamic = (0, React.useRef)(
    doc.content().files,
  );
  (0, React.useEffect)(
    (): Dynamic =>
      doc.subscribe((input?: Dynamic): Dynamic => {
        let files: Dynamic = doc.content().files,
          previous: Dynamic = previousFilesRef.current;
        previousFilesRef.current = files;
        if (previous === files) return;
        let changed: Dynamic = Object.keys(files).filter(
          (file?: Dynamic): Dynamic =>
            file !== canvasMetadataFile &&
            files[file] !== previous[file],
        );
        for (let remaining of Object.keys(previous) as Dynamic)
          remaining !== canvasMetadataFile &&
            !(remaining in files) &&
            changed.push(remaining);
        if (changed.length !== 0) {
          if (input?.remote !== true) {
            let focused: Dynamic = focusedFileRef.current;
            focused !== null &&
              changed.includes(focused) &&
              recordArtboardActivity(focused);
            return;
          }
          emitEditorEvent("files-changed", {
            projectPath: "appifact",
            paths: changed,
          });
          (window as Dynamic).dispatchEvent(
            new CustomEvent(remoteFilesEventName, {
              detail: {
                paths: changed,
              },
            }),
          );
        }
      }),
    [doc, recordArtboardActivity],
  );
  (0, React.useEffect)(
    (): Dynamic => (
      setFilePublishHandler((input?: Dynamic): Dynamic => {
        showToast(
          uiMessage("canvas.designCanvas.storedACompressedCopyOf") +
            (input === "unavailable"
              ? uiMessage("canvas.designCanvas.uploadsAreUnavailableHere")
              : input === "unsupported_type" || input === "too_large"
                ? uiMessage("canvas.designCanvas.thisFileTypeOrSize")
                : uiMessage("canvas.designCanvas.theUploadDidNotGo")) +
            ").",
        );
      }),
      (): Dynamic => setFilePublishHandler(null)
    ),
    [showToast],
  );
  return { recordArtboardActivity, refreshArtboardActivity };
}
