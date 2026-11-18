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
          options?: Dynamic,
        ): Dynamic {
          let value: Dynamic = normalizeSelectionScale(scale),
            guide: Dynamic = selectionMetrics.guide,
            value2: Dynamic = 1 / value;
          return (
            <div
              {...props}
              ref={options}
              data-cds={"AlignmentGuides"}
              aria-hidden={"true"}
              className={cn("absolute inset-0", className)}
              style={{
                ...style,
                pointerEvents: "none",
              }}
            >
              {guides.map(
                (input?: Dynamic, options2?: Dynamic): Dynamic =>
                  (() => {
                    const _Component = "span";
                    const _props = {
                      "data-axis": input.axis,
                      children: [
                        <span
                          data-guide-line={""}
                          className={"absolute block bg-fill-accent"}
                          style={
                            input.axis === "x"
                              ? {
                                  left: 0,
                                  top: 0,
                                  bottom: 0,
                                  width: guide,
                                  transformOrigin: "0 0",
                                  transform: `translateX(${input.pos}px) scaleX(${value2})`,
                                  pointerEvents: "none",
                                }
                              : {
                                  top: 0,
                                  left: 0,
                                  right: 0,
                                  height: guide,
                                  transformOrigin: "0 0",
                                  transform: `translateY(${input.pos}px) scaleY(${value2})`,
                                  pointerEvents: "none",
                                }
                          }
                        />,
                        input.label !== undefined ? (
                          <SelectionPoint
                            data-guide-label={""}
                            scale={value}
                            anchor={"start"}
                            at={
                              input.axis === "x"
                                ? {
                                    left: input.pos + 6 / value,
                                    top: 8 / value,
                                  }
                                : {
                                    left: 8 / value,
                                    top: input.pos + 6 / value,
                                  }
                            }
                          >
                            {input.label}
                          </SelectionPoint>
                        ) : null,
                      ],
                    } as const;
                    const _key = `${input.axis}-${input.pos}-${options2}`;
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
