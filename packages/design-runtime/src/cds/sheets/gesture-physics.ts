import type {
  SheetDetents,
  SheetGestureRelease,
  SheetGestureResult,
  SheetPosition,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeOnce } from "../../module-helpers";

var sheetGestureConstants: {
  detentThreshold: number;
  dismissFraction: number;
  flingVelocity: number;
  rubberBand: number;
  overshootRoom: number;
};
var initializeSheetsGesturePhysics: () => void;
function rubberBandDistance(distance: number, room: number): number {
  return distance <= 0 || room <= 0
    ? 0
    : (1 - 1 / ((distance * sheetGestureConstants.rubberBand) / room + 1)) *
        room;
}
function inverseRubberBandDistance(distance: number, room: number): number {
  return distance <= 0 || room <= 0
    ? 0
    : ((1 / (1 - Math.min(distance, room * 0.9) / room) - 1) * room) /
        sheetGestureConstants.rubberBand;
}
function calculateSheetDetents(
  restHeight: number,
  viewportHeight: number,
  tallFraction: number,
  allowTall: boolean = true,
): SheetDetents {
  let candidateTallHeight = Math.max(
      viewportHeight * tallFraction,
      restHeight,
    ),
    tallHeight =
      !allowTall ||
      candidateTallHeight - restHeight < sheetGestureConstants.detentThreshold
        ? restHeight
        : candidateTallHeight;
  return {
    rest: restHeight,
    tall: tallHeight,
    room: Math.max(
      0,
      (viewportHeight - tallHeight) * sheetGestureConstants.overshootRoom,
    ),
  };
}
function sheetHasTallDetent(detents: SheetDetents): boolean {
  return detents.tall > detents.rest;
}
function calculateSheetPosition(
  detents: SheetDetents,
  rawHeight: number,
): SheetPosition {
  if (rawHeight > detents.tall)
    return {
      height:
        detents.tall +
        rubberBandDistance(rawHeight - detents.tall, detents.room),
      slide: 0,
      shown: 1,
    };
  if (rawHeight >= detents.rest)
    return {
      height: rawHeight,
      slide: 0,
      shown: 1,
    };
  let slide = detents.rest - rawHeight;
  return {
    height: detents.rest,
    slide: slide,
    shown: 1 - Math.min(1, slide / Math.max(1, detents.rest)),
  };
}
function sheetPositionToRawHeight(
  detents: SheetDetents,
  height: number,
  slide: number,
): number {
  return height > detents.tall
    ? detents.tall +
        inverseRubberBandDistance(height - detents.tall, detents.room)
    : Math.min(height, detents.tall) - Math.max(0, slide);
}
function settleSheetGesture(
  detents: SheetDetents,
  release: SheetGestureRelease,
): SheetGestureResult {
  let { slide: currentSlide } = calculateSheetPosition(detents, release.rawAtRelease),
    shouldDismiss =
      release.commit &&
      currentSlide > 0 &&
      (currentSlide - release.caughtSlide >
        detents.rest * sheetGestureConstants.dismissFraction ||
        (release.detent === "default" &&
          release.velocity > sheetGestureConstants.flingVelocity));
  if (!release.commit || shouldDismiss)
    return {
      dismiss: shouldDismiss,
      detent: release.detent,
    };
  if (release.rawAtGrab > detents.rest && release.rawAtGrab < detents.tall) {
    let dragDelta = release.rawAtRelease - release.rawAtGrab;
    return dragDelta > sheetGestureConstants.detentThreshold &&
      sheetHasTallDetent(detents)
      ? {
          dismiss: false,
          detent: "tall",
        }
      : dragDelta < -sheetGestureConstants.detentThreshold
        ? {
            dismiss: false,
            detent: "default",
          }
        : {
            dismiss: false,
            detent: release.detent,
          };
  }
  return release.detent === "default" &&
    sheetHasTallDetent(detents) &&
    release.rawAtRelease > detents.rest + sheetGestureConstants.detentThreshold
    ? {
        dismiss: false,
        detent: "tall",
      }
    : release.detent === "tall" &&
        release.rawAtRelease <
          detents.tall - sheetGestureConstants.detentThreshold
      ? {
          dismiss: false,
          detent: "default",
        }
      : {
          dismiss: false,
          detent: release.detent,
        };
}
export {
  calculateSheetDetents,
  calculateSheetPosition,
  initializeSheetsGesturePhysics,
  inverseRubberBandDistance,
  rubberBandDistance,
  settleSheetGesture,
  sheetGestureConstants,
  sheetHasTallDetent,
  sheetPositionToRawHeight,
};
export function installCdsSheetsGesturePhysics(): () => void {
  return () => {
    initializeSheetsGesturePhysics = initializeOnce(() => {
      sheetGestureConstants = {
        detentThreshold: 40,
        dismissFraction: 0.25,
        flingVelocity: 0.8,
        rubberBand: 0.55,
        overshootRoom: 0.5,
      };
    });
  };
}
