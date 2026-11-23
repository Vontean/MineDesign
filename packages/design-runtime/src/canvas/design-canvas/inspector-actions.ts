import { addContrastToAnnouncement, propertyEditAnnouncement } from "../../editor/accessibility/announcements";
import { announce } from "../../editor/accessibility/announcer";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { routeStyleEditsByElementKind } from "../../editor/css/edit-validation";
import {
  CropIsNotAvailableHereForMessage,
  SessionElementStateUnloadedTurnedAutoConfig,
} from "../../editor/session/element-state";
import type { Dynamic } from "../../runtime-types";
import { pickReplacementImage, pickReplacementVideo } from "./inspector-media";

export function useCanvasInspectorEdits(
  readSelection: () => [string, Dynamic][],
  artboardEntriesRef: { current: Map<string, Dynamic> },
  contrastRef: { current: Dynamic },
) {
  const { useCallback, useRef } = React;
  const applyPropertyEdit = useCallback(
    (edits: Dynamic, options?: Dynamic) => {
      const undo = !options?.live;
      const selectedKinds = new Set();
      const targets = [...readSelection()].map(([file, selection]) => {
        const entry = artboardEntriesRef.current.get(file);
        const nodes = entry ? entry.describeTids(selection.tids) : [];
        for (const node of nodes) selectedKinds.add(node.kind);
        return { entry, nodes };
      });
      const mixedKinds = selectedKinds.size > 1;
      const contrast = contrastRef.current;
      const updates = targets.map(({ entry, nodes }) =>
        entry ? entry.setStylePropsPerTid(
          routeStyleEditsByElementKind(edits, nodes, mixedKinds),
          { undo },
        ) : Promise.resolve(false),
      );
      return Promise.all(updates).then((results) => {
        const applied = results.some(Boolean);
        if (applied && undo) {
          const properties = edits.map(([prop, value]: Dynamic) => ({ prop, value: value ?? null }));
          announce(addContrastToAnnouncement(
            propertyEditAnnouncement(properties),
            properties,
            contrast?.check,
            contrast?.resolve,
          ));
        }
        return applied;
      });
    },
    [readSelection],
  );

  const gestureFiles = useRef(null);
  const handleStyleGesture = useCallback((phase: string) => {
    if (phase === "start") {
      const files = readSelection().map(([file]) => file);
      gestureFiles.current = files;
      for (const file of files) artboardEntriesRef.current.get(file)?.beginStyleGesture();
      return;
    }
    const files = gestureFiles.current ?? [];
    gestureFiles.current = null;
    for (const file of files) artboardEntriesRef.current.get(file)?.endStyleGesture();
  }, [readSelection]);

  return { applyPropertyEdit, handleStyleGesture };
}

export function createCanvasQuickProperties({
  selectionProbe,
  seed,
  elementSessionState,
  contrastRef,
  acrossFiles,
  artboardEntriesRef,
  selectionSource,
  canvasActionsRef,
  onApply,
  onGesture,
  showRejection,
  framePickState,
  framePickStateRef,
  dropTargetRef,
}: Dynamic) {
  if (!selectionProbe) return null;

  const { text, shape, box, image, other, line, primaryTag, primaryText, primaryEditable, probeEl } =
    selectionProbe;
  const allowImage = probeEl?.kind === "image" && !acrossFiles;
  const allowVideo = primaryTag === "video" && probeEl != null && !acrossFiles;
  const { cropping, target } = elementSessionState;
  return {
    text, shape, box, image, other, line, primaryTag, seed, contrastRef, onApply, onGesture,
    onEditText: primaryText && primaryEditable && !acrossFiles
      ? () => {
          artboardEntriesRef.current.get(primaryText.file)?.startTextEdit(
            selectionSource(primaryText.file), primaryText.tid,
          );
        }
      : null,
    onElementLink: primaryTag === "a" && primaryText && !acrossFiles
      ? (href: Dynamic) => { canvasActionsRef.current?.setElementLink(primaryText.tid, href); }
      : undefined,
    onCrop: (allowImage || allowVideo) && probeEl != null
      ? () => { artboardEntriesRef.current.get(probeEl.file)?.toggleCrop(probeEl.tid); }
      : undefined,
    cropping: cropping !== null && cropping === probeEl?.tid,
    cropReason: target !== null && "off" in target
      ? SessionElementStateUnloadedTurnedAutoConfig[target.off]
      : target?.tid === probeEl?.tid ? undefined : CropIsNotAvailableHereForMessage,
    onReplaceImage: allowImage
      ? () => pickReplacementImage({
          artboardEntriesRef, showRejection, selectionProbe, framePickState, framePickStateRef,
        })
      : undefined,
    findVideo: allowVideo
      ? () => artboardEntriesRef.current.get(probeEl.file)?.videoEl(probeEl.tid) ?? null
      : undefined,
    onReplaceVideo: allowVideo
      ? () => pickReplacementVideo({ artboardEntriesRef, showRejection, selectionProbe, dropTargetRef })
      : undefined,
  };
}
