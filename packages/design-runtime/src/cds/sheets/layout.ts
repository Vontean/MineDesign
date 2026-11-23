import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { DesignStyle, SheetFrameState } from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { initializeSheetsGesturePhysics, sheetGestureConstants } from "./gesture-physics";
import { initializeOnce } from "../../module-helpers";

var SheetsLayoutPositionTopRightConfig: DesignStyle;
var SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig: Pick<
  import("@base-ui/react/combobox").Combobox.Positioner.Props,
  "disableAnchorTracking" | "collisionAvoidance"
>;
var SheetsLayoutConstant: number;
var SheetsLayoutCss: string;
var overshootHeightViewportCss: string;
var ComfortableValue: string;
var halfHeightFraction: number;
var halfHeightViewportCss: string;
var initializeSheetsLayout: () => void;
function getSheetFixedPosition(frameState?: SheetFrameState | null): DesignStyle {
  let value = frameState?.keyboard?.inset ?? 0;
  return value > 0
    ? {
        ...SheetsLayoutPositionTopRightConfig,
        bottom: value,
      }
    : SheetsLayoutPositionTopRightConfig;
}
function getSheetFrameStyle(
  frameState: SheetFrameState | null,
  {
    floor: floor,
    parentFrameHeight: parentFrameHeight,
  }: {
    floor?: "half" | "content";
    parentFrameHeight?: number;
  },
): DesignStyle {
  let keyboard = frameState?.keyboard ?? null,
    minHeight =
      floor === "half"
        ? `min(${halfHeightViewportCss}, ${SheetsLayoutCss})`
        : "0px";
  return {
    "--available-height": SheetsLayoutCss,
    width: "100%",
    maxWidth: "none",
    minWidth: 0,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    paddingBottom: keyboard !== null ? "0.5rem" : undefined,
    minHeight:
      keyboard !== null
        ? undefined
        : parentFrameHeight !== undefined
          ? `max(${minHeight}, ${parentFrameHeight}px)`
          : floor === "half"
            ? minHeight
            : undefined,
    maxHeight:
      keyboard !== null
        ? `${Math.max(0, keyboard.visible - 8)}px`
        : frameState?.height !== undefined
          ? overshootHeightViewportCss
          : floor === "half"
            ? minHeight
            : SheetsLayoutCss,
    height:
      frameState?.detent === "tall"
        ? SheetsLayoutCss
        : frameState?.height !== undefined
          ? `${frameState.height}px`
          : undefined,
  };
}
export {
  ComfortableValue,
  getSheetFixedPosition,
  getSheetFrameStyle,
  initializeSheetsLayout,
  SheetsLayoutConstant,
  halfHeightFraction,
  SheetsLayoutCss,
  overshootHeightViewportCss,
  halfHeightViewportCss,
  SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig,
  SheetsLayoutPositionTopRightConfig,
};
export function installCdsSheetsLayout(): () => void {
  return () => {
    initializeSheetsLayout = initializeOnce(() => {
      initializeSheetsGesturePhysics();
      SheetsLayoutPositionTopRightConfig = {
        position: "fixed",
        get top() { return uiMessage("canvas.layout.auto"); },
        right: 0,
        bottom: 0,
        left: 0,
        width: "auto",
        minWidth: 0,
        maxWidth: "none",
        get transform() { return uiMessage("canvas.layout.none"); },
      };
      SheetsLayoutDisableAnchorTrackingCollisionAvoidanceConfig = {
        disableAnchorTracking: true,
        collisionAvoidance: {
          side: "none",
          get align() { return uiMessage("canvas.layout.none"); },
        },
      };
      SheetsLayoutConstant = 0.9;
      SheetsLayoutCss = `${SheetsLayoutConstant * 100}dvh`;
      overshootHeightViewportCss = `${(SheetsLayoutConstant + 0.09999999999999998 * sheetGestureConstants.overshootRoom) * 100}dvh`;
      ComfortableValue = "comfortable";
      halfHeightFraction = 0.5;
      halfHeightViewportCss = `${halfHeightFraction * 100}dvh`;
    });
  };
}
