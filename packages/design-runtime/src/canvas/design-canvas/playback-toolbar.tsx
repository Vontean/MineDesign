import { uiMessage } from "@minedesign/contracts/ui-messages";
import { SegmentedControl } from "../../cds/components/selection-points";
import { MenuMenuAssignValue as Menu, renderMenuItems } from "../../cds/menu/menu";
import { SessionStripPopover } from "../../editor/session-strip/popover";
import { ToolbarPrimitivesComponent } from "../../editor/toolbar/primitives";
import { artboardExportMenuItems } from "../../export/artboard-menu";
import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { jsx_Gn } from "../../assets/image-placement";
import type { Dynamic } from "../../runtime-types";
import { artboardNavigationGroupLabels } from "../navigation";

export function FullscreenPlaybackHeading({
  file,
  artboards,
  toolbarCollapsed,
  commenting,
  onExit,
}: Dynamic) {
  const title = artboards.find((item: Dynamic) => item.file === file)?.title ??
    file.replace(/\.dc\.html$/, "");
  return (
    <jsx_Gn.Fragment>
      <ToolbarPrimitivesComponent
        icon="CaretLeft"
        label={uiMessage("canvas.designCanvas.backToCanvas")}
        shortcut={commenting ? undefined : "esc"}
        iconOnly={true}
        data-testid="mega-collapse"
        data-view-control=""
        onClick={onExit}
      />
      {!toolbarCollapsed && (
        <span data-testid="mega-expanded-name" className="tb-yields min-w-0 max-w-[40vw] truncate px-1 text-sm text-fg">
          {title}
        </span>
      )}
    </jsx_Gn.Fragment>
  );
}

export function CanvasPlayMenu({
  groups: { prototypes, others },
  getTitle,
  onOpen,
  disabledTip,
}: Dynamic) {
  const renderItems = (artboards: Dynamic[]) => artboards.map(({ file }) => (
    <Menu.Item key={file} onClick={() => onOpen(file)}>{getTitle(file)}</Menu.Item>
  ));
  return (
    <span data-view-control="" className="contents">
      <SessionStripPopover
        icon="Play"
        label={uiMessage("canvas.designCanvas.play")}
        iconOnly={true}
        tip={uiMessage("canvas.designCanvas.playAnArtboard")}
        disabled={prototypes.length + others.length === 0}
        disabledTip={disabledTip}
        align="end"
        data-testid="dc-play"
      >
        {prototypes.length > 0 && (
          <Menu.Group>
            <Menu.GroupLabel>{artboardNavigationGroupLabels.prototypes}</Menu.GroupLabel>
            {renderItems(prototypes)}
          </Menu.Group>
        )}
        {prototypes.length > 0 && others.length > 0 && <Menu.Separator />}
        {others.length > 0 && (
          <Menu.Group>
            <Menu.GroupLabel>{artboardNavigationGroupLabels.others}</Menu.GroupLabel>
            {renderItems(others)}
          </Menu.Group>
        )}
      </SessionStripPopover>
    </span>
  );
}

export function FullscreenPlaybackControls({
  file,
  fit,
  artboards,
  exportRules,
  downloadsWithheld,
  exportActions,
  onFitChange,
}: Dynamic) {
  return (
    <jsx_Gn.Fragment>
      <SessionStripPopover
        icon="Download"
        label={uiMessage("canvas.designCanvas.export")}
        iconOnly={true}
        tip={uiMessage("canvas.designCanvas.exportThisArtboard")}
        disabled={downloadsWithheld}
        disabledTip={DownloadsArenTAvailableToYouForMessage}
        align="end"
        data-testid="mega-export"
      >
        {renderMenuItems(artboardExportMenuItems(file, artboards, exportActions, undefined, exportRules))}
      </SessionStripPopover>
      <span data-testid="mega-fit" data-view-control="" className="inline-flex shrink-0">
        <SegmentedControl
          aria-label={uiMessage("canvas.designCanvas.artboardSize")}
          tooltipSide="bottom"
          segments={[
            {
              value: "fill",
              get label() { return uiMessage("canvas.designCanvas.fill"); },
              get tooltip() { return uiMessage("canvas.designCanvas.fillTheWindow"); },
            },
            {
              value: "fit",
              get label() { return uiMessage("canvas.designCanvas.fit"); },
              get tooltip() { return uiMessage("canvas.designCanvas.atItsOwnSizeScaled"); },
            },
          ]}
          value={fit ? "fit" : "fill"}
          onChange={(value: string) => onFitChange(value === "fit")}
        />
      </span>
    </jsx_Gn.Fragment>
  );
}
