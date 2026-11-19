import { useUiLocale } from '../ui-locale.ts';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";

var reactPreviewFit: typeof import("react");
var jsxPreviewFit: typeof import("react/jsx-runtime");
var previewFitScale: (containerWidth: number, previewWidth: number) => number;
function PreviewFitBox({
  width: width,
  height: height,
  "data-testid": dataTestid,
  children: children,
}: Editor.PreviewFitBoxProps): React.ReactElement {
  useUiLocale();
  let ref = reactPreviewFit.useRef<HTMLDivElement | null>(null),
    containerRef = reactPreviewFit.useRef<HTMLDivElement | null>(null),
    [value, setHeight] = reactPreviewFit.useState(height);
  reactPreviewFit.useLayoutEffect(() => {
    let current = ref.current,
      container = containerRef.current;
    if (current === null || container === null) {
      return;
    }
    let callback = (): void => {
      container.style.transform =
        "scale(" +
        String(
          previewFitScale(current.getBoundingClientRect().width, width),
        ) +
        ")";
      let offsetHeight = container.offsetHeight;
      if (offsetHeight > 0) {
        setHeight(offsetHeight);
      }
    };
    callback();
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    let observer = new ResizeObserver(callback);
    observer.observe(current);
    observer.observe(container);
    return () => observer.disconnect();
  }, [width]);
  let maxHeight: number = Math.max(height, value);
  return (
    <div
      ref={ref}
      className={"relative w-full overflow-hidden"}
      style={{
        maxWidth: width,
        aspectRatio: String(width) + " / " + String(maxHeight),
        maxHeight: maxHeight,
      }}
      data-testid={dataTestid + "-box"}
    >
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: width,
          minHeight: height,
          transformOrigin: "top left",
        }}
        data-testid={dataTestid + "-stage"}
      >
        {children}
      </div>
    </div>
  );
}
export {
  jsxPreviewFit,
  PreviewFitBox,
  previewFitScale,
  reactPreviewFit,
};
export function installEditorPreviewFit(): () => void {
  return () => {
    reactPreviewFit = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxPreviewFit = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    previewFitScale = (containerWidth: number, previewWidth: number) =>
      containerWidth <= 0 || containerWidth >= previewWidth - 2
        ? 1
        : containerWidth / previewWidth;
  };
}
