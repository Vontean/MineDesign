/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { cn, dangerFocusShadowByMode, elevationSurfaceNames, focusShadowByMode, getSurfaceClasses, initializeClassNames, initializeSurfaces, initializeTranslations } from "./interactions";
import { getSurfaceBackgroundStyle, initializeCdsRoot, surfaceBackgroundContext, useResolvedColorMode } from "./overlays";

var reactForUiSurfaces: typeof React;
var jsxrm: typeof import("react/jsx-runtime");
var Surface: C.ForwardComponent<HTMLDivElement, C.SurfaceProps>;
function useSurfaceStyle(input: C.SurfaceBackground): C.DesignStyle {
  let value: "light" | "dark" = (0, useResolvedColorMode)();
  return {
    ...(0, getSurfaceBackgroundStyle)(input),
    "--cds-focus-shadow": focusShadowByMode[value],
    "--cds-focus-shadow-danger": dangerFocusShadowByMode[value],
  };
}
export {
  jsxrm,
  reactForUiSurfaces,
  Surface,
  useSurfaceStyle,
};
export function installUiSurfaces(): () => void {
  return () => {
    (0, initializeCdsRoot)();
    (0, initializeSurfaces)();
    reactForUiSurfaces = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxrm = (0, toModuleNamespace)((0, loadJsxNamespace)(), 1);
    Surface = reactForUiSurfaces.forwardRef(
      (
        {
          elevation: elevation,
          className: className,
          style: style,
          children: children,
          ...props
        }: C.SurfaceProps,
        options: React.ForwardedRef<HTMLDivElement>,
      ) => {
        let value = useSurfaceStyle(elevationSurfaceNames[elevation]);
        return (
          <div
            ref={options}
            data-cds={"Surface"}
            data-surface={elevation}
            {...props}
            className={(0, cn)(
              (0, getSurfaceClasses)(elevation),
              className,
            )}
            style={{
              ...value,
              ...style,
            }}
          >
            <surfaceBackgroundContext.Provider
              value={elevationSurfaceNames[elevation]}
            >
              {children}
            </surfaceBackgroundContext.Provider>
          </div>
        );
      },
    );
    Surface.displayName = "Surface";
    (0, initializeClassNames)();
    (0, initializeTranslations)();
    (0, initializeCdsRoot)();
  };
}
