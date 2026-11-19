import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { commentTargetProps, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { ComponentPreview } from "./component-preview";
import { clampComponentStageHeight } from "./components";
import { projectFilePath } from "./files-index";
import { PreviewFitBox } from "./preview-fit";
import { componentPreviewPath, reactPreviewComponents } from "./preview-runner";
import { COVER_COMPONENT_NAME } from "../model/file-policy";
import { toModuleNamespace } from "../module-helpers";

var jsxCoverPreview: typeof import("react/jsx-runtime");
var COVER_PREVIEW_WIDTH: number;
function coverPreviewHead(
  cover: import("../contracts/preview").PreviewHeadResult,
): import("../contracts/preview").PreviewHead {
  if (cover.staticReason === "") {
    return cover.head;
  } else {
    return {
      ...cover.head,
      runtimeScripts: [],
      bundleJs: "",
    };
  }
}
function CoverPreview({
  cover: cover,
  head: head,
}: Editor.CoverPreviewProps): React.ReactElement {
  useUiLocale();
  let [value, setIsOpen] = (
    reactPreviewComponents as typeof React
  ).useState(false);
  (reactPreviewComponents as typeof React).useEffect(
    () => setIsOpen(true),
    [],
  );
  let stageHeight = clampComponentStageHeight(cover.height),
    memo = (reactPreviewComponents as typeof React).useMemo(
      () => coverPreviewHead(head),
      [head],
    ),
    [staticNote, setStaticNote] = (
      reactPreviewComponents as typeof React
    ).useState<string | null>(null);
  return (
    <jsxCoverPreview.Fragment>
      {[<div
          className={"ds-cover ds-comp-preview-box relative"}
          role={"group"}
          aria-label={uiMessage("design-system.coverPreview.cover")}
          data-testid={"ds-cover"}
          {...commentTargetProps("ds", "cover")}
        >
          {[<PreviewFitBox
              width={COVER_PREVIEW_WIDTH}
              height={stageHeight}
              data-testid={"ds-cover"}
            >
              {value ? (<ComponentPreview
                  html={cover.previewHtml}
                  cardFile={projectFilePath(
                    componentPreviewPath(
                      COVER_COMPONENT_NAME,
                    ),
                  )}
                  head={memo}
                  height={stageHeight}
                  staticPageWidth={COVER_PREVIEW_WIDTH}
                  onStaticNote={setStaticNote}
                  title={uiMessage("design-system.coverPreview.cover")}
                  data-testid={"ds-cover-preview"}
                />) : (null)}
            </PreviewFitBox>, <span
              className={"ds-page-shield rounded-[inherit]"}
              aria-hidden={"true"}
              data-testid={"ds-cover-shield"}
            />]}
        </div>, staticNote !== null ? (
          <p
            className={"ds-swatch-note text-footnote text-muted"}
            role={"note"}
            data-testid={"ds-cover-note"}
            {...UNCOMMENTABLE_PROPS}
          >
            {staticNote}
          </p>
        ) : null]}
    </jsxCoverPreview.Fragment>
  );
}
export {
  COVER_PREVIEW_WIDTH,
  CoverPreview,
  coverPreviewHead,
  jsxCoverPreview,
};
export function installEditorCoverPreview(): () => void {
  return () => {
    jsxCoverPreview = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    COVER_PREVIEW_WIDTH = 960;
  };
}
