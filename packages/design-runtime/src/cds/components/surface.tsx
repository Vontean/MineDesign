import type {
  DesignStyle,
  ForwardComponent,
  SurfaceProps,
} from "../../contracts/ui";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { popupSurfaceClassName } from "./icon";
import { cn, initializeClassNames } from "../theme/class-names";
import { initializeCdsRoot, PageBackgroundContext, pageBackgroundStyle, useResolvedColorMode } from "../theme/root";
import { dangerFocusShadowTokens, focusShadowTokens, initializeThemeSurfaces, surfaceBackgroundTokens } from "../theme/surfaces";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsSurface: typeof React;
var jsxComponentsSurface: typeof import("react/jsx-runtime");
var Surface: ForwardComponent<HTMLDivElement, SurfaceProps>;
var initializeComponentsSurface: () => void;
function surfaceFocusStyle(input?: string): DesignStyle {
  let value = useResolvedColorMode();
  return {
    ...pageBackgroundStyle(input),
    "--cds-focus-shadow": focusShadowTokens[value],
    "--cds-focus-shadow-danger": dangerFocusShadowTokens[value],
  };
}
export {
  initializeComponentsSurface,
  jsxComponentsSurface,
  reactComponentsSurface,
  Surface,
  surfaceFocusStyle,
};
export function installCdsComponentsSurface(): () => void {
  return () => {
    initializeComponentsSurface = initializeOnce(() => {
      "use client";

      initializeClassNames();
      initializeCdsRoot();
      initializeThemeSurfaces();
      reactComponentsSurface = toModuleNamespace(
        load_react(),
      );
      jsxComponentsSurface = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      Surface = (0, reactComponentsSurface.forwardRef)<
        HTMLDivElement,
        SurfaceProps
      >(
        (
          {
            elevation: elevation,
            className: className,
            style: style,
            children: children,
            ...props
          }: SurfaceProps,
          options: React.ForwardedRef<HTMLDivElement>,
        ): React.ReactElement => {
          let value = surfaceFocusStyle(
            surfaceBackgroundTokens[elevation],
          );
          return (
            <div
              ref={options}
              data-cds={"Surface"}
              data-surface={elevation}
              {...props}
              className={cn(
                popupSurfaceClassName(elevation),
                className,
              )}
              style={{
                ...value,
                ...style,
              }}
            >
              <PageBackgroundContext.Provider
                value={surfaceBackgroundTokens[elevation]}
              >
                {children}
              </PageBackgroundContext.Provider>
            </div>
          );
        },
      );
      Surface.displayName = "Surface";
    });
  };
}
