import { uiMessage } from "@minedesign/contracts/ui-messages";
import {
  noteDeletedMessage as noteDeleted,
  shapeDeletedMessage as shapeDeleted,
  pictureDeletedMessage as imageDeleted,
  videoDeletedMessage as videoDeleted,
} from "../../editor/accessibility/announcements";
import { reactChromeTheme as React } from "../../editor/chrome/theme";
import {
  boardSelectionItems,
  emptyCanvasSelection,
  selectionFromBoards,
} from "../../editor/selection/canvas-selection";
import {
  annotationKindCategory,
  annotationLineEndpoints,
  createAnnotationId,
  isShapeAnnotation,
  defaultTextAnnotationWidth as defaultNoteWidth,
  minShapeDimension,
  maxAnnotations as annotationLimit,
  maxCanvasItemDimension as maxShapeDimension,
  PlatformFileContentRectOvalLineConfig as defaultShapeDimensions,
  PlatformFileContentSMLConfig as textSizes,
} from "../../platform/file-content";
import type { Dynamic } from "../../runtime-types";

export function useCanvasAnnotationCommands({
  documentStateRef,
  persistCanvasState,
  supportsLoadState,
  savePageSelection,
  recordHistory,
  finishBoundOperationRef,
  boundSelectionsRef,
  selectDefaultTool,
  reportRejection,
  abandonSelectionGesture,
  clearFrameSelection,
  setSelection,
  announce,
}: Dynamic) {
  const { useCallback, useRef } = React;

  const addAnnotation = useCallback(
    (annotation: Dynamic, options: Dynamic = {}) => {
      const annotations = documentStateRef.current.annotations ?? [];
      if (annotations.length >= annotationLimit) {
        reportRejection(
          uiMessage("canvas.designCanvas.thisCanvasIsAtIts2") +
            String(annotationLimit) +
            ").",
        );
        if (!options.quiet) selectDefaultTool();
        if (options.bound !== undefined) {
          finishBoundOperationRef.current.get(options.bound)?.();
        }
        return null;
      }

      const item = {
        ...annotation,
        id: createAnnotationId(
          annotations,
          supportsLoadState,
          annotationKindCategory(annotation),
        ),
      };
      recordHistory({ kind: "ann-add", spec: item }, options.bound);
      persistCanvasState({
        ...documentStateRef.current,
        annotations: [...annotations, item],
      });
      if (!options.quiet) {
        abandonSelectionGesture();
        clearFrameSelection();
        setSelection(
          options.keepTool
            ? emptyCanvasSelection
            : selectionFromBoards(boardSelectionItems({ note: item.id })),
        );
        if (!options.keepTool) selectDefaultTool();
      }
      return item.id;
    },
    [persistCanvasState, clearFrameSelection, reportRejection, abandonSelectionGesture],
  );
  const addAnnotationRef = useRef(addAnnotation);
  addAnnotationRef.current = addAnnotation;

  const addAnnotationAtPoint = useCallback(
    (x: number, y: number) => {
      addAnnotation({
        x: Math.round(x),
        y: Math.round(y),
        w: defaultNoteWidth,
        text: "",
        ...savePageSelection(),
      });
    },
    [addAnnotation],
  );

  const duplicateAnnotation = useCallback(
    (id: string, x: number, y: number, boundId?: Dynamic, quiet = false) => {
      const trackSelection = quiet && boundId !== undefined;
      const source = (documentStateRef.current.annotations ?? []).find(
        (item: Dynamic) => item.id === id,
      );
      if (!source) {
        if (trackSelection) {
          boundSelectionsRef.current.set(boundId, {
            files: new Set(),
            notes: new Set(),
          });
        }
        if (boundId !== undefined) finishBoundOperationRef.current.get(boundId)?.();
        return false;
      }

      const { id: sourceId, ...annotation } = source;
      const left = Math.round(x);
      const top = Math.round(y);
      const endpoints = annotation.kind === "line" || annotation.kind === "arrow"
        ? { x2: annotation.x2 + left - annotation.x, y2: annotation.y2 + top - annotation.y }
        : {};
      const newId = addAnnotation(
        { ...annotation, x: left, y: top, ...endpoints },
        { bound: boundId, quiet: trackSelection },
      );
      if (trackSelection) {
        boundSelectionsRef.current.set(boundId, {
          files: new Set(),
          notes: new Set(newId !== null ? [newId] : []),
        });
      }
      return newId !== null;
    },
    [addAnnotation],
  );

  const addShape = useCallback(
    (kind: Dynamic, geometry: Dynamic, context: Dynamic) => {
      selectDefaultTool();
      const savedPageSelection = savePageSelection();
      if (kind === "text") {
        addAnnotation({
          kind: "title1",
          size: textSizes.m,
          bold: false,
          x: geometry.x,
          y: geometry.y,
          w: defaultNoteWidth,
          text: "",
          ...savedPageSelection,
        });
        return;
      }
      if (kind === "rect" || kind === "oval") {
        const [width, height] = geometry.w > 0 || geometry.h > 0
          ? [geometry.w, geometry.h]
          : defaultShapeDimensions[kind];
        const clampDimension = (dimension: number) =>
          Math.min(maxShapeDimension, Math.max(minShapeDimension, dimension));
        addAnnotation({
          kind,
          x: geometry.x,
          y: geometry.y,
          w: clampDimension(width),
          h: clampDimension(height),
          ...savedPageSelection,
        });
        return;
      }
      addAnnotation({
        kind,
        ...annotationLineEndpoints(kind, geometry, context),
        ...savedPageSelection,
      });
    },
    [addAnnotation],
  );

  const addPenAnnotation = useCallback(
    (stroke: Dynamic) => {
      addAnnotation(
        { kind: "pen", ...stroke, ...savePageSelection() },
        { keepTool: true },
      );
    },
    [addAnnotation],
  );

  const deleteAnnotation = useCallback(
    (id: string, boundId?: Dynamic) => {
      const annotations = documentStateRef.current.annotations ?? [];
      const index = annotations.findIndex((item: Dynamic) => item.id === id);
      if (index < 0) return false;

      const item = annotations[index];
      recordHistory({ kind: "ann-delete", spec: item, index }, boundId);
      persistCanvasState({
        ...documentStateRef.current,
        annotations: annotations.filter((entry: Dynamic) => entry.id !== id),
      });
      const message = item.kind === "image"
        ? item.video !== undefined ? videoDeleted : imageDeleted
        : isShapeAnnotation(item) ? shapeDeleted : noteDeleted;
      announce(message);
      return true;
    },
    [persistCanvasState],
  );

  return {
    addAnnotationAtPoint,
    addAnnotationRef,
    addPenAnnotation,
    addShape,
    deleteAnnotation,
    duplicateAnnotation,
  };
}
