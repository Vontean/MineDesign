import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { swatchHtmlAttributes } from "./swatch-runtime";
import { toModuleNamespace } from "../module-helpers";

var reactStaticPreview: typeof import("react");
var jsxStaticPreview: typeof import("react/jsx-runtime");
var EMPTY_STATIC_PREVIEW_HTML: string;
var validatedPreviewDimension: (
  value: number | undefined,
  fallback: number,
) => number;
function staticPreviewDocumentHtml(
  html: string,
  head: Editor.PreviewRuntimeHead,
): string {
  let callback = (htmlContent: string): string =>
    htmlContent === ""
      ? ""
      : "<style>" + htmlContent.replace(/<\/(?=style)/gi, "<\\/") + "</style>";
  return (
    "<!doctype html><html" +
    swatchHtmlAttributes(head) +
    '><head><meta name="referrer" content="no-referrer">' +
    callback("html{overflow:hidden!important}") +
    callback(head.tokensCss) +
    callback(head.bundleCss) +
    "</head><body>" +
    html +
    "</body></html>"
  );
}
function StaticPreviewFrame({
  html: html,
  head: head,
  pageW: pageW,
  pageH: pageH,
  fitWidth: fitWidth,
  title: title,
  ...props
}: Editor.StaticPreviewFrameProps): React.ReactElement {
  useUiLocale();
  let memo = reactStaticPreview.useMemo(
      () =>
        head === undefined ? html : staticPreviewDocumentHtml(html, head),
      [html, head],
    ),
    value = validatedPreviewDimension(pageW, 1280),
    pageHeight = validatedPreviewDimension(pageH, 720),
    scale = fitWidth / value,
    state: React.CSSProperties = {
      width: fitWidth,
      height: pageHeight * scale,
      overflow: "hidden",
      position: "relative",
    },
    containerStyle: React.CSSProperties = {
      width: value,
      height: pageHeight,
      transform: "scale(" + String(scale) + ")",
      transformOrigin: "top left",
      border: "0",
      display: "block",
    };
  return (
    <div className={"ds-page-box"} style={state}>
      {[<iframe
          {...props}
          sandbox={EMPTY_STATIC_PREVIEW_HTML}
          srcDoc={memo}
          title={title}
          loading={"lazy"}
          tabIndex={-1}
          style={containerStyle}
        />, <span className={"ds-page-shield"} />]}
    </div>
  );
}
export {
  EMPTY_STATIC_PREVIEW_HTML,
  jsxStaticPreview,
  reactStaticPreview,
  staticPreviewDocumentHtml,
  StaticPreviewFrame,
  validatedPreviewDimension,
};
export function installEditorStaticPreview(): () => void {
  return () => {
    reactStaticPreview = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxStaticPreview = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    EMPTY_STATIC_PREVIEW_HTML = "";
    validatedPreviewDimension = (
      dimension: number | undefined,
      fallback: number,
    ) =>
      Number.isFinite(dimension) &&
      (dimension as number) >= 16 &&
      (dimension as number) <= 1e4
        ? dimension!
        : fallback;
  };
}
