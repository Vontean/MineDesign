import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
import type * as React from "react";
import type * as Preview from "../../contracts/preview";
import type * as Model from "../../contracts";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../../dependencies";
import { UNCOMMENTABLE_PROPS } from "../../editor/comment-anchors";
import { toModuleNamespace } from "../../module-helpers";
import { DisabledReasonTooltip } from "../../ui/avatars";
import { Button } from "../../ui/buttons";
import { Icon } from "../../ui/interactions";
import { Menu } from "../../ui/menu";

var reactHostTheme: typeof import("react");
var reactPreviewThemeMenu: typeof import("react");
var jsxPreviewThemeMenu: typeof import("react/jsx-runtime");
function readHostThemeMode(): Preview.PreviewMode {
  let attribute = document.documentElement.getAttribute("data-theme");
  if (attribute === "light" || attribute === "dark") {
    return attribute;
  }
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    return "dark";
  } else {
    return "light";
  }
}
function useHostThemeMode(): Preview.PreviewMode {
  let [value, notifyThemeModeChange] = reactHostTheme.useState(readHostThemeMode);
  reactHostTheme.useEffect(() => {
    let callback = () => notifyThemeModeChange(readHostThemeMode()),
      mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", callback);
    let mutationObserver = new (window as Window & typeof globalThis).MutationObserver(
      callback,
    );
    mutationObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    callback();
    return () => {
      mediaQuery.removeEventListener("change", callback);
      mutationObserver.disconnect();
    };
  }, []);
  return value;
}
function isDarkThemeName(name: string): boolean {
  return /dark|night/i.test(name);
}
function previewThemeDisabledReason(
  themeCount: number,
  components: Preview.PreviewComponent[],
  runnable: boolean,
): string | undefined {
  if (themeCount < 2) {
    return uiMessage("design-system.theme.thisDesignSystemHasNo");
  }
  if (!components.some((component) => component.previewHtml !== undefined)) {
    return uiMessage("design-system.theme.noComponentsToPreviewYet");
  }
  if (!runnable) {
    return uiMessage("design-system.theme.theseComponentPreviewsAreStatic");
  }
  return;
}
function resolvePreviewTheme(
  themes: Preview.PreviewTheme[],
  hostMode: Preview.PreviewMode,
  selectedId?: string | null,
): Preview.PreviewThemeResolution {
  let modeOf = (
      theme: Preview.PreviewTheme | undefined,
    ): Preview.PreviewMode =>
      themes.length > 1 && theme !== undefined
        ? isDarkThemeName(theme.name)
          ? "dark"
          : "light"
        : hostMode,
    hostTheme =
      themes.find(
        (theme) => isDarkThemeName(theme.name) === (hostMode === "dark"),
      ) ?? themes[0],
    previewTheme =
      themes.find((theme) => theme.id === selectedId) ?? hostTheme,
    stageMode = modeOf(previewTheme);
  return {
    hostThemeId: hostTheme?.id,
    hostThemeMode: modeOf(hostTheme),
    previewThemeId: previewTheme?.id,
    stageMode: stageMode,
    needsGround: previewTheme?.id !== hostTheme?.id || stageMode !== hostMode,
  };
}
function PreviewThemeMenu({
  themes: themes,
  value: themeId,
  onChange: onChange,
  disabledWhy: disabledWhy,
}: Preview.PreviewThemeMenuProps): React.ReactElement {
  useUiLocale();
  let availableThemes =
      themes.length > 0
        ? themes
        : [
            {
              id: "light",
              name: "Light",
            },
          ],
    selectedTheme = availableThemes.find((theme) => theme.id === themeId) ?? availableThemes[0],
    [menuOpen, setMenuOpen] = reactPreviewThemeMenu.useState(false);
  if (menuOpen && disabledWhy !== undefined) {
    setMenuOpen(false);
  }
  return (
    <Menu.Root open={menuOpen} onOpenChange={setMenuOpen}>
      {[<DisabledReasonTooltip reason={disabledWhy}>
          <Menu.Trigger
            disabled={disabledWhy !== undefined}
            render={
              <Button
                variant={"secondary"}
                disabled={disabledWhy !== undefined}
                aria-label={uiMessage("design-system.theme.previewTheme", { value1: String(selectedTheme.name) })}
                className={"max-w-56"}
                data-testid={"ds-theme-menu"}
              >
                {[<span className={"min-w-0 truncate text-left"}>
                    {selectedTheme.name}
                  </span>, <Icon
                    name={"CaretDown"}
                    size={"xs"}
                    className={"shrink-0 text-muted"}
                  />]}
              </Button>
            }
          />
        </DisabledReasonTooltip>, <Menu.Popup
          side={"bottom"}
          align={"end"}
          {...UNCOMMENTABLE_PROPS}
        >
          <Menu.Group data-testid={"ds-theme-menu-list"}>
            {[<Menu.GroupLabel>
                {availableThemes.length > 1 ? (uiMessage("design-system.theme.themesInThisSystem")) : (uiMessage("design-system.theme.theme"))}
              </Menu.GroupLabel>, availableThemes.map((theme) =>
                (() => {
                  const _Element = Menu.Item;
                  const _elementProps = {
                    checkedRole: "radio" as const,
                    checked: theme.id === selectedTheme.id,
                    "data-testid": "ds-theme-" + theme.id,
                    onClick: () => onChange(theme.id),
                    children: (
                      <span className={"ds-menu-label"}>{theme.name}</span>
                    ),
                  };
                  const _elementKey = theme.id;
                  return <_Element key={_elementKey} {..._elementProps} />;
                })(),
              )]}
          </Menu.Group>
        </Menu.Popup>]}
    </Menu.Root>
  );
}
export {
  isDarkThemeName,
  jsxPreviewThemeMenu,
  previewThemeDisabledReason,
  PreviewThemeMenu,
  reactHostTheme,
  reactPreviewThemeMenu,
  readHostThemeMode,
  resolvePreviewTheme,
  useHostThemeMode,
};
export function installFilesUiTheme(): () => void {
  return () => {
    reactHostTheme = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactPreviewThemeMenu = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxPreviewThemeMenu = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
  };
}
