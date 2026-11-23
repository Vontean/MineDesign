import { uiMessage } from "@minedesign/contracts/ui-messages";
import { type Dynamic } from "../runtime-types";
import { inlineImagePreview } from "../assets/image-previews";
import { announce } from "../editor/accessibility/announcer";
import { normalizeStyleEdits } from "../editor/css/edit-validation";
import { DcTplAttribute } from "../editor/html/authoring";
import { cropFromObjectStyles, imageCropStyleEdits, MediaObjectCropEvery, MediaObjectCropSupports, MediaObjectCropZoom, ThisBrowserCanTZoomAPictureMessage, YouCanTCropAnyFurtherAtMessage } from "../editor/media/object-crop";
import { holdPickerStyle, patchPickerStyle, repostPickerChrome, setPickerScrubbing, unpatchPickerStyle } from "../editor/picker/bridge";
import { CropIsNotAvailableHereForMessage, SessionElementStateGet, SessionElementStateUnloadedTurnedAutoConfig, updateElementSessionState } from "../editor/session/element-state";
import { createPreviewHandle } from "../preview/evaluation";
import { inlineImageUrl } from "../properties/quick-panel-bindings";
import type { ArtboardCropPointerHandler } from "./artboard-pointer-gestures";
import { focusCanvasDocument } from "./focus";
import { parseSelectionChromePayload, type ArtboardBox, type SelectionChrome } from "./frame-payloads";
import { updateDropGhostDemand } from "./working-state";
import { reactCanvasShape } from "./shape";

interface ArtboardCropOptions {
  previewFile: string;
  iframeRef: { current: HTMLIFrameElement | null };
  artboardComponentId: string;
  activeMediaRef: { current: Dynamic };
  resolveComponentState(component: string): Dynamic;
  hasObjectViewBox(tid: number): boolean;
  applyStyleEdit(element: Element): number;
  setStyleProperty(element: Element, edits: Dynamic): Promise<string>;
  showToast(message: string): void;
  canEdit: boolean;
  displayedGeneration: number;
  panelMounted: boolean;
  onHostGesture?: (type: "element-crop", gesture: Dynamic) => void;
  startSideGesture: ArtboardCropPointerHandler;
}

export function useArtboardCrop({
  previewFile,
  iframeRef,
  artboardComponentId,
  activeMediaRef,
  resolveComponentState,
  hasObjectViewBox,
  applyStyleEdit,
  setStyleProperty,
  showToast,
  canEdit,
  displayedGeneration,
  panelMounted,
  onHostGesture,
  startSideGesture,
}: ArtboardCropOptions) {
  let [selectedMediaSnapshot, setSelectedMedia]: Dynamic = (0, reactCanvasShape.useState)(
      null,
    ),
    selectedMediaRef: Dynamic = (0, reactCanvasShape.useRef)(null),
    cropActiveRef: Dynamic = (0, reactCanvasShape.useRef)(false),
    lastCropChangeRef: Dynamic = (0, reactCanvasShape.useRef)(0),
    readCropState: Dynamic = (0,
    reactCanvasShape.useCallback)((): Dynamic => {
      let [selectedMedia, currentState]: Dynamic = [selectedMediaRef.current, resolveComponentState(artboardComponentId)],
        cropTid: Dynamic = parseInt(
          selectedMedia?.el.getAttribute(DcTplAttribute) ?? "",
          10,
        );
      return selectedMedia &&
        currentState &&
        Number.isSafeInteger(cropTid) &&
        currentState.model.element(cropTid) === selectedMedia.el
        ? cropTid
        : null;
    }, [artboardComponentId, resolveComponentState]);
  let finishCrop: Dynamic = (0, reactCanvasShape.useCallback)(
      (cropState?: Dynamic): Dynamic => {
        let selectedMedia: Dynamic = selectedMediaRef.current;
        if (!selectedMedia) return;
        let isCropActive: Dynamic = readCropState() !== null;
        selectedMediaRef.current = null;
        setSelectedMedia(null);
        updateElementSessionState(previewFile, {
          cropping: null,
        });
        let previewHandle: Dynamic = createPreviewHandle(
          iframeRef.current,
        );
        previewHandle && setPickerScrubbing(previewHandle, false);
        let finishWrite: Dynamic = (): Dynamic => {
            if (previewHandle)
              for (let tid of selectedMedia.tids as Dynamic)
                unpatchPickerStyle(
                  previewHandle,
                  artboardComponentId,
                  [tid],
                  selectedMedia.token,
                );
          },
          normalizedEdits: Dynamic = normalizeStyleEdits(
            imageCropStyleEdits(
              selectedMedia.at.frame,
              selectedMedia.at.natural,
              selectedMedia.live,
            ),
          ),
          didWrite: Dynamic = JSON.stringify(normalizedEdits) !== selectedMedia.wrote;
        cropState &&
          didWrite &&
          !isCropActive &&
          (announce(
            uiMessage("canvas.artboardFrame.thePictureChangedWhileYou"),
          ),
          showToast(
            uiMessage("canvas.artboardFrame.thePictureChangedWhileYou"),
          ));
        selectedMedia.closed =
          !cropState || !isCropActive ? "dropped" : didWrite ? "wrote" : "held";
        if (selectedMedia.closed !== "wrote") return finishWrite();
        cropActiveRef.current = true;
        activeMediaRef.current = null;
        updateElementSessionState(previewFile, {
          target: null,
        });
        setStyleProperty(selectedMedia.el, normalizedEdits)
          .then((mutationStatus?: Dynamic): Dynamic => {
            mutationStatus === "applied" || mutationStatus === "applied-dirty"
              ? announce("Cropped.", {
                  ifIdle: true,
                })
              : finishWrite();
          }, finishWrite)
          .finally((): Dynamic => {
            cropActiveRef.current = false;
            previewHandle && repostPickerChrome(previewHandle);
          });
      },
      [previewFile, artboardComponentId, readCropState, setStyleProperty, showToast],
    ),
    canEditRef: Dynamic = (0, reactCanvasShape.useRef)(canEdit);
  canEditRef.current = canEdit;
  let toggleCrop: Dynamic = (0, reactCanvasShape.useCallback)(
      (tid?: Dynamic, isLive: Dynamic = false): Dynamic => {
        if (selectedMediaRef.current) return finishCrop(true);
        let activeMedia: Dynamic = activeMediaRef.current,
          tagName: Dynamic = resolveComponentState(artboardComponentId)
            ?.model.tagName(tid)
            ?.toLowerCase(),
          previewHandle: Dynamic = createPreviewHandle(
            iframeRef.current,
          );
        if (
          !canEdit ||
          cropActiveRef.current ||
          !previewHandle ||
          !activeMedia?.media ||
          activeMedia.media.tid !== tid ||
          SessionElementStateGet(previewFile).target === null ||
          "off" in SessionElementStateGet(previewFile).target ||
          (tagName !== "img" && tagName !== "video")
        )
          return;
        let element: Dynamic = resolveComponentState(artboardComponentId)?.model.element(tid);
        if (!element) return;
        let { media: media }: Dynamic = activeMedia,
          cropState: Dynamic = {
            w: activeMedia.w * (1 - media.inset[0] - media.inset[2]),
            h: activeMedia.h * (1 - media.inset[1] - media.inset[3]),
          },
          cropGeometry: Dynamic = MediaObjectCropEvery(
            cropState,
            media,
            cropFromObjectStyles(
              cropState,
              media,
              media.view,
            ),
          );
        isLive
          ? ((document as Dynamic).activeElement instanceof HTMLElement &&
              (document as Dynamic).activeElement.tagName === "IFRAME" &&
              (document as Dynamic).activeElement.blur(),
            (window as Dynamic).focus())
          : focusCanvasDocument();
        let cropToken: Dynamic = "crop-" + String(Date.now());
        setPickerScrubbing(previewHandle, true);
        patchPickerStyle(
          previewHandle,
          artboardComponentId,
          [tid],
          Object.fromEntries(
            imageCropStyleEdits(
              cropState,
              media,
              cropGeometry,
            ).map(
              ([property, propertyValue]: Dynamic): Dynamic => [
                property,
                propertyValue ?? "none",
              ],
            ),
          ),
          cropToken,
        );
        applyStyleEdit(element);
        selectedMediaRef.current = {
          tid: tid,
          tids: new Set([tid]),
          token: cropToken,
          el: element,
          live: cropGeometry,
          wrote: JSON.stringify(
            normalizeStyleEdits(
              imageCropStyleEdits(cropState, media, cropGeometry),
            ),
          ),
          at: {
            frame: cropState,
            natural: {
              w: media.w,
              h: media.h,
            },
          },
        };
        let imageSource: Dynamic =
            resolveComponentState(artboardComponentId)?.model.attributes(tid)?.src,
          supportsCropZoom: Dynamic = MediaObjectCropSupports()
            ? undefined
            : ThisBrowserCanTZoomAPictureMessage;
        setSelectedMedia({
          tid: tid,
          live: cropGeometry,
          src:
            inlineImageUrl(imageSource) ??
            (imageSource !== undefined
              ? inlineImagePreview(imageSource)
              : null),
          noZoom: supportsCropZoom,
        });
        updateElementSessionState(previewFile, {
          cropping: tid,
        });
      },
      [previewFile, artboardComponentId, resolveComponentState, canEdit, finishCrop],
    ),
    readCropEnabled: Dynamic = (0,
    reactCanvasShape.useCallback)((): Dynamic => {
      let [selectedMedia, previewHandle, currentCropTid]: Dynamic = [
        selectedMediaRef.current,
        createPreviewHandle(iframeRef.current),
        readCropState(),
      ];
      return !selectedMedia || !previewHandle || currentCropTid === null
        ? false
        : (currentCropTid === selectedMedia.tid ||
            (unpatchPickerStyle(
              previewHandle,
              artboardComponentId,
              [selectedMedia.tid],
              selectedMedia.token,
            ),
            (selectedMedia.tid = currentCropTid),
            selectedMedia.tids.add(currentCropTid),
            patchPickerStyle(
              previewHandle,
              artboardComponentId,
              [currentCropTid],
              Object.fromEntries(
                imageCropStyleEdits(
                  selectedMedia.at.frame,
                  selectedMedia.at.natural,
                  selectedMedia.live,
                ).map(
                  ([property, propertyValue]: Dynamic): Dynamic => [
                    property,
                    propertyValue ?? "none",
                  ],
                ),
              ),
              selectedMedia.token,
            ),
            setSelectedMedia(
              (media?: Dynamic): Dynamic =>
                media && {
                  ...media,
                  tid: currentCropTid,
                },
            ),
            updateElementSessionState(previewFile, {
              cropping: currentCropTid,
            })),
          true);
    }, [previewFile, artboardComponentId, readCropState]),
    readCropEnabledRef: Dynamic = (0, reactCanvasShape.useRef)(readCropEnabled);
  readCropEnabledRef.current = readCropEnabled;
  let finishCropRef: Dynamic = (0, reactCanvasShape.useRef)(finishCrop);
  finishCropRef.current = finishCrop;
  let toggleCropRef: Dynamic = (0, reactCanvasShape.useRef)(toggleCrop);
  toggleCropRef.current = toggleCrop;
  (0, reactCanvasShape.useEffect)(
    (): Dynamic => (): Dynamic => finishCropRef.current(false),
    [],
  );
  (0, reactCanvasShape.useEffect)((): Dynamic => {
    canEdit || finishCropRef.current(false);
  }, [canEdit]);
  (0, reactCanvasShape.useEffect)(
    (): Dynamic => (): Dynamic => finishCropRef.current(false),
    [displayedGeneration],
  );
  (0, reactCanvasShape.useEffect)((): Dynamic => {
    panelMounted !== true && finishCropRef.current(true);
  }, [panelMounted]);
  let cropModel: Dynamic = (0, reactCanvasShape.useMemo)(
      (): Dynamic =>
        selectedMediaSnapshot && {
          tid: selectedMediaSnapshot.tid,
          live: selectedMediaSnapshot.live,
          src: selectedMediaSnapshot.src,
          zoomDisabledReason: selectedMediaSnapshot.noZoom,
          onLive: (
            liveCrop?: Dynamic,
            frame?: Dynamic,
            naturalSize?: Dynamic,
          ): Dynamic => {
            let selectedMedia: Dynamic = selectedMediaRef.current,
              previewHandle: Dynamic = createPreviewHandle(
                iframeRef.current,
              );
            if (!(!selectedMedia || !previewHandle || !readCropEnabled())) {
              if (
                liveCrop.zoom > selectedMedia.live.zoom &&
                MediaObjectCropZoom(frame, naturalSize, liveCrop)
              ) {
                Date.now() - lastCropChangeRef.current > 2e3 &&
                  announce(
                    YouCanTCropAnyFurtherAtMessage,
                  );
                lastCropChangeRef.current = Date.now();
                return;
              }
              selectedMedia.live = liveCrop;
              selectedMedia.at = {
                frame: frame,
                natural: naturalSize,
              };
              setSelectedMedia(
                (cropState?: Dynamic): Dynamic =>
                  cropState && {
                    ...cropState,
                    live: liveCrop,
                  },
              );
              holdPickerStyle(
                previewHandle,
                artboardComponentId,
                [selectedMedia.tid],
                Object.fromEntries(
                  imageCropStyleEdits(
                    frame,
                    naturalSize,
                    liveCrop,
                  ).map(
                    ([property, propertyValue]: Dynamic): Dynamic => [
                      property,
                      propertyValue ?? "none",
                    ],
                  ),
                ),
                selectedMedia.token,
              );
            }
          },
          onDone: finishCrop,
          onGesture: (gesture?: Dynamic): Dynamic =>
            onHostGesture?.("element-crop", gesture),
          onSideStart: startSideGesture,
        },
      [selectedMediaSnapshot, artboardComponentId, readCropEnabled, finishCrop, onHostGesture],
    );
  const lastCropRequest = (0, reactCanvasShape.useRef)(0);
  const lastCropRefusal = (0, reactCanvasShape.useRef)({ reason: "", at: 0 });

  function acceptSelectionChrome(
    event: Record<string, unknown>,
    box: ArtboardBox,
    gripless: boolean,
  ): SelectionChrome {
    const rawChrome = parseSelectionChromePayload(event, box);
    updateDropGhostDemand(previewFile, rawChrome.rings.filter((ring) => ring.k === "busy").length);

    const chrome = parseSelectionChromePayload(event, box, {
      gripless,
      cropTid: selectedMediaRef.current?.tid,
    });
    const selected = chrome.rings.find((ring) => ring.media !== undefined || ring.cropOff !== undefined);
    const media = selected?.media;
    activeMediaRef.current = media ? selected : null;
    const hasUnsupportedZoom = media !== undefined &&
      !MediaObjectCropSupports() &&
      hasObjectViewBox(media.tid);
    updateElementSessionState(previewFile, {
      target: media
        ? hasUnsupportedZoom ? { off: "foreign-zoom" } : { tid: media.tid }
        : selected?.cropOff ? { off: selected.cropOff } : null,
    });
    if (
      selectedMediaRef.current &&
      (!readCropEnabledRef.current() || media?.tid !== selectedMediaRef.current.tid)
    ) finishCropRef.current(true);
    return chrome;
  }

  function requestCropFromPreview(tid: unknown) {
    const hasActivation = navigator.userActivation === undefined || navigator.userActivation.isActive;
    if (
      selectedMediaRef.current ||
      !hasActivation ||
      !Number.isSafeInteger(tid) ||
      SessionElementStateGet(previewFile).selected !== tid ||
      Date.now() - lastCropRequest.current < 500
    ) return;
    lastCropRequest.current = Date.now();

    const { target } = SessionElementStateGet(previewFile);
    if (target !== null && "tid" in target && target.tid === tid) {
      toggleCropRef.current(tid, true);
      return;
    }
    if (!canEditRef.current) return;
    const reason = target !== null && "off" in target
      ? SessionElementStateUnloadedTurnedAutoConfig[target.off]
      : CropIsNotAvailableHereForMessage;
    if (lastCropRefusal.current.reason !== reason || Date.now() - lastCropRefusal.current.at > 5e3) {
      showToast(reason);
    }
    lastCropRefusal.current = { reason, at: Date.now() };
  }

  return {
    selectedMediaRef,
    setSelectedMedia,
    readCropState,
    finishCropRef,
    toggleCrop,
    readCropEnabled,
    cropModel,
    acceptSelectionChrome,
    requestCropFromPreview,
  };
}
