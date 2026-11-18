/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeEditorSelectionGeometry, normalizeSelectionScale, selectionMetrics, SelectionPoint } from "./selection-geometry";
import { cn, initializeClassNames } from "../theme/class-names";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactEditorAlignmentGuides: Dynamic;
var jsxEditorAlignmentGuides: Dynamic;
var AlignmentGuides: Dynamic;
var initializeEditorAlignmentGuides: Dynamic;
export {
  AlignmentGuides,
  initializeEditorAlignmentGuides,
  jsxEditorAlignmentGuides,
  reactEditorAlignmentGuides,
};
export function installCdsEditorAlignmentGuides(): () => void {
  return () => {
    initializeEditorAlignmentGuides = initializeOnce(
      (): Dynamic => {
        "use client";

        initializeClassNames();
        initializeEditorSelectionGeometry();
        reactEditorAlignmentGuides = toModuleNamespace(
          load_react(),
        );
        jsxEditorAlignmentGuides = toModuleNamespace(
          load_react_jsx_runtime(),
        );
        AlignmentGuides = (0, reactEditorAlignmentGuides.forwardRef)(function (
          {
            guides: guides,
            scale = 1,
            className: className,
            style: style,
            ...props
          }: Dynamic,
          forwardedRef?: Dynamic,
        ): Dynamic {
          let safeScale: Dynamic = normalizeSelectionScale(scale),
            guide: Dynamic = selectionMetrics.guide,
            inverseScale: Dynamic = 1 / safeScale;
          return (
            <div
              {...props}
              ref={forwardedRef}
              data-cds={"AlignmentGuides"}
              aria-hidden={"true"}
              className={cn("absolute inset-0", className)}
              style={{
                ...style,
                pointerEvents: "none",
              }}
            >
              {guides.map(
                (alignmentGuide?: Dynamic, guideIndex?: Dynamic): Dynamic =>
                  (() => {
                    const _Component = "span";
                    const _props = {
                      "data-axis": alignmentGuide.axis,
                      children: [
                        <span
                          data-guide-line={""}
                          className={"absolute block bg-fill-accent"}
                          style={
                            alignmentGuide.axis === "x"
                              ? {
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: guide,
                                  transformOrigin: "0 0",
                                  transform: `translateX(${alignmentGuide.pos}px) scaleX(${inverseScale})`,
                                  pointerEvents: "none",
                                }
                              : {
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: guide,
                                  transformOrigin: "0 0",
                                  transform: `translateY(${alignmentGuide.pos}px) scaleY(${inverseScale})`,
                                  pointerEvents: "none",
                                }
                          }
                        />,
                        alignmentGuide.label !== undefined ? (
                          <SelectionPoint
                            data-guide-label={""}
                            scale={safeScale}
                            anchor={"start"}
                            at={
                              alignmentGuide.axis === "x"
                                ? {
                                    left: alignmentGuide.pos + 6 / safeScale,
                                    top: 8 / safeScale,
                                  }
                                : {
                                    left: 8 / safeScale,
                                    top: alignmentGuide.pos + 6 / safeScale,
                                  }
                            }
                          >
                            {alignmentGuide.label}
                          </SelectionPoint>
                        ) : null,
                      ],
                    } as const;
                    const _key = `${alignmentGuide.axis}-${alignmentGuide.pos}-${guideIndex}`;
                    return <_Component key={_key} {..._props} />;
                  })(),
              )}
            </div>
          );
        });
        AlignmentGuides.displayName = "AlignmentGuides";
      },
    );
  };
}
