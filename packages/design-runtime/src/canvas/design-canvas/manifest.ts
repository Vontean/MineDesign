import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { Dynamic } from '../../runtime-types';
import type { CanvasManifest } from '../manifest-history';
import { reactChromeTheme as React } from '../../editor/chrome/theme';
import { structurallyEqual } from '../../platform/document-values';
import { canvasMetadataFile, designArtboardsMatchFiles, getKvClient, parseCanvasMetadata, projectFileKey, serializeCanvasMetadata } from '../../platform/file-content';
import { mergeMissingCanvasManifestMetadata, reconcileCanvasManifestHistory } from '../manifest-history';

/** 画布清单所在的实时文档：读取全部文件内容并订阅变更。 */
interface CanvasManifestDocument {
  content(): { readonly files: Record<string, string | undefined> };
  subscribe(listener: (documentEvent?: { remote?: boolean }) => void): () => void;
  /** 编辑器确认已看到的清单状态；宿主不支持时缺省。 */
  editorSaw?(documentState: CanvasManifest): void;
}

/** 保持本地画布清单与远端文件同步，并在保存前合并并发的元数据。 */
export function useCanvasManifest({ doc, markLocalWrite, showToast }: {
  doc: CanvasManifestDocument;
  markLocalWrite: () => void;
  showToast: (message: string, variant: 'error') => unknown;
}) {
  let [canvasDocumentState, setCanvasDocumentState]: Dynamic = (0, React.useState)(
      (): Dynamic =>
        parseCanvasMetadata(
          doc.content().files[canvasMetadataFile],
          doc.content().files,
        ),
    ),
    remoteMetadataHashRef: Dynamic = (0, React.useRef)(
      doc.content().files[canvasMetadataFile],
    ),
    previousDocumentStateRef: Dynamic = (0, React.useRef)(null);
  previousDocumentStateRef.current === null && (previousDocumentStateRef.current = canvasDocumentState);
  let latestDocumentStateRef: Dynamic = (0, React.useRef)(null),
    serializeDocumentState: Dynamic = (0, React.useCallback)(
      (documentState?: Dynamic): Dynamic =>
        latestDocumentStateRef.current
          ? reconcileCanvasManifestHistory(
              documentState,
              latestDocumentStateRef.current,
              previousDocumentStateRef.current,
            )
          : documentState,
      [],
    );
  (0, React.useEffect)(
    (): Dynamic =>
      doc.subscribe((documentEvent?: Dynamic): Dynamic => {
        let files: Dynamic = doc.content().files,
          metadataFileContent: Dynamic = files[canvasMetadataFile],
          metadataMatchesArtboards: Dynamic =
            documentEvent?.remote === true && metadataFileContent !== remoteMetadataHashRef.current;
        remoteMetadataHashRef.current = metadataFileContent;
        let serializedMetadata: Dynamic,
          updateDocumentState: Dynamic = (nextState?: Dynamic): Dynamic =>
            designArtboardsMatchFiles(nextState, files) && !metadataMatchesArtboards
              ? nextState
              : metadataFileContent === undefined
                ? parseCanvasMetadata(
                    serializeCanvasMetadata(nextState),
                    files,
                  )
                : (serializedMetadata ??= parseCanvasMetadata(
                    metadataFileContent,
                    files,
                  )),
          previousState: Dynamic = previousDocumentStateRef.current;
        previousDocumentStateRef.current = updateDocumentState(previousState);
        documentEvent?.remote === true &&
          previousDocumentStateRef.current !== previousState &&
          (latestDocumentStateRef.current ??= previousState);
        setCanvasDocumentState(updateDocumentState);
      }),
    [doc],
  );
  let documentStateRef: Dynamic = (0, React.useRef)(canvasDocumentState),
    getArtboardTitle: Dynamic = (fileKey?: Dynamic): Dynamic =>
      documentStateRef.current.artboards.find(
        (artboard?: Dynamic): Dynamic => artboard.file === fileKey,
      )?.title ?? fileKey.replace(/\.dc\.html$/, "");
  documentStateRef.current = canvasDocumentState;
  (0, React.useLayoutEffect)((): Dynamic => {
    doc.editorSaw?.(canvasDocumentState);
  }, [doc, canvasDocumentState]);
  (0, React.useLayoutEffect)((): Dynamic => {
    let manifestState: Dynamic = latestDocumentStateRef.current;
    latestDocumentStateRef.current = null;
    if (!manifestState) return;
    let reconciledState: Dynamic = reconcileCanvasManifestHistory(
      canvasDocumentState,
      manifestState,
      previousDocumentStateRef.current,
    );
    structurallyEqual(reconciledState, canvasDocumentState) || setCanvasDocumentState(reconciledState);
  }, [canvasDocumentState]);
  let persistCanvasState: Dynamic = (0, React.useCallback)(
      (nextState?: Dynamic, baseState?: Dynamic): Dynamic => {
        let mergedState: Dynamic = mergeMissingCanvasManifestMetadata(
            nextState,
            baseState ?? documentStateRef.current,
          ),
          serializedState: Dynamic =
            baseState === undefined ? serializeDocumentState(mergedState) : mergedState;
        previousDocumentStateRef.current = serializedState;
        documentStateRef.current = serializedState;
        setCanvasDocumentState(serializedState);
        markLocalWrite();
        getKvClient()
          .set(
            projectFileKey(
              canvasMetadataFile,
            ),
            serializeCanvasMetadata(serializedState),
          )
          .catch(
            (error?: Dynamic): Dynamic =>
              showToast(
                uiMessage("canvas.designCanvas.couldnTSaveTheLayout") + String(error),
                "error",
              ),
          );
      },
      [showToast, serializeDocumentState],
    );
  return {
    canvasDocumentState, setCanvasDocumentState, documentStateRef, previousDocumentStateRef,
    serializeDocumentState, persistCanvasState, getArtboardTitle,
  };
}
