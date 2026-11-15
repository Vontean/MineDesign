import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { fitArtboardsLabel } from "./design-canvas";
import { CanvasZoomControl } from "./zoom";
import { Icon } from "../cds/components/icon";
import { ChromeSkeleton, ChromeTextSkeleton, DocumentLoadGate } from "../editor/chrome/loading";
import { reactChromeTheme } from "../editor/chrome/theme";
import { SessionStripPopover } from "../editor/session-strip/popover";
import { ToolbarDivider } from "../editor/toolbar/layout";
import { ToolbarPrimitivesComponent } from "../editor/toolbar/primitives";
import { ToolbarPublishControls } from "../editor/toolbar/publish-controls";
import { EditorToolbar } from "../editor/toolbar/toolbar";
import { useFrameSaveState } from "../platform/frame-host-bridge";

var canvasNotLoadedMessage: Dynamic;
var unavailableCanvasHistory: Dynamic;
function useCanvasLoadState(document2?: Dynamic): Dynamic {
  let callback: Dynamic = (): Dynamic => {
      let value3: Dynamic =
        "loadState" in document2 ? document2.loadState() : "live";
      return value3 === "cached" ? "live" : value3;
    },
    [value, value2]: Dynamic = (0, reactChromeTheme.useState)(
      callback,
    );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => (
      value2(callback()),
      "subscribeLoad" in document2
        ? document2.subscribeLoad((): Dynamic => value2(callback()))
        : undefined
    ),
    [document2],
  );
  return value;
}
function CanvasLoadingPlaceholder(): Dynamic {
  useUiLocale();
  return (
    <div
      className={
        "flex h-full w-full items-start justify-center overflow-hidden px-8 pt-10"
      }
    >
      <div className={"flex w-full max-w-[45rem] flex-col gap-1.5"}>
        <span className={"text-sm leading-none"}>
          <ChromeTextSkeleton chars={9} />
        </span>
        <div className={"aspect-[11/7] w-full"}>
          <ChromeSkeleton className={"h-full w-full rounded-md"} />
        </div>
      </div>
    </div>
  );
}
function CanvasLoadFailure({
  doc: doc,
  filePath: filePath,
}: Dynamic): Dynamic {
  useUiLocale();
  let [value, value2]: Dynamic = (0, reactChromeTheme.useState)(
    doc.saveState(),
  );
  (0, reactChromeTheme.useEffect)(
    (): Dynamic => doc.subscribeSave(value2),
    [doc],
  );
  let callback: Dynamic = (): Dynamic => {
    doc.save();
  };
  (0, useFrameSaveState)(value.status, callback);
  return (
    <div
      className={
        "relative flex h-screen w-screen flex-col bg-page text-primary"
      }
    >
      <EditorToolbar
        title={(document as Dynamic).title || (filePath)}
        saveState={value}
        saveMode={doc.saveMode()}
        syncDot={true}
        onSave={callback}
        undo={unavailableCanvasHistory}
        publishControls={false}
        undoButtons={false}
        touchTargets={"square"}
        variant={"floating"}
        extrasEnd={
          <SessionStripPopover
            icon={"Play"}
            label={uiMessage("canvas.loadState.play")}
            iconOnly={true}
            disabled={true}
            disabledTip={canvasNotLoadedMessage}
          >
            {null}
          </SessionStripPopover>
        }
        trailing={
          <span className={"flex shrink-0 items-center gap-1"}>
            <fieldset disabled={true} className={"contents"}>
              <ToolbarPrimitivesComponent
                glyph={
                  <Icon
                    name={"SidebarRight"}
                    size={"auto"}
                    className={"max-[599px]:rotate-90"}
                  />
                }
                label={uiMessage("canvas.loadState.properties")}
                iconOnly={true}
                tip={canvasNotLoadedMessage}
                onClick={(): Dynamic => {}}
              />
            </fieldset>
            <ToolbarDivider />
            <span data-view-control={""} className={"contents"}>
              <CanvasZoomControl
                readout={true}
                getScale={(): Dynamic => 1}
                onPickScale={(): Dynamic => {}}
                onFit={(): Dynamic => {}}
                fitLabel={fitArtboardsLabel}
                disabled={true}
                disabledTip={canvasNotLoadedMessage}
              />
            </span>
            <ToolbarPublishControls
              saveState={value}
              saveMode={doc.saveMode()}
              syncDot={true}
              onSave={callback}
            />
          </span>
        }
      />
      <div className={"relative min-h-0 flex-1 pt-[var(--tb-overlay-h,0px)]"}>
        <DocumentLoadGate
          doc={doc}
          skeleton={<CanvasLoadingPlaceholder />}
        >
          {null}
        </DocumentLoadGate>
      </div>
    </div>
  );
}
export {
  CanvasLoadFailure,
  CanvasLoadingPlaceholder,
  canvasNotLoadedMessage,
  unavailableCanvasHistory,
  useCanvasLoadState,
};
export function installCanvasLoadState(): () => void {
  return () => {
    canvasNotLoadedMessage = uiMessage("canvas.loadState.availableOnceTheCanvasHas");
    unavailableCanvasHistory = {
      exec(): Dynamic {},
      seed(): Dynamic {},
      undo(): Dynamic {},
      redo(): Dynamic {},
      canUndo: (): Dynamic => false,
      canRedo: (): Dynamic => false,
      redoDepth: (): Dynamic => 0,
      clear(): Dynamic {},
      subscribe: (): Dynamic => (): Dynamic => {},
    };
  };
}
