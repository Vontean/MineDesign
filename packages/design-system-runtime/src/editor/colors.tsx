import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { reactColorEditors } from "./claude-delivery";
import { artifactPageAddress, get_FIX_WITH_CLAUDE_LABEL, ownerColorContrastFixPrompt, viewerColorContrastFixPrompt } from "./claude-prompts";
import { inferColorContrastPairs } from "./color-contrast-pairs";
import { COMMENT_TARGET_PROPS, commentTargetId, commentTargetProps, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { EditableName, showEditorNotification } from "./editable-name";
import { copyTextToClipboard, RemoveRowButton, RowContextMenu, useRowContextMenu } from "./row-context-menu";
import { RemoveSectionButton } from "./section-card";
import { SectionAddButton, SectionHeader } from "./section-headers";
import { UsageNoteEditor } from "./usage-notes";
import { PALETTE_GROUP_NAME } from "../model/component-inference";
import { isColorLiteral } from "../model/tokens";
import { toModuleNamespace } from "../module-helpers";
import { DisabledReasonTooltip } from "../ui/avatars";
import { Button } from "../ui/buttons";
import { ContrastCaption, ContrastMark } from "../ui/color/contrast-controls";
import { colorContrastResults, contrastRatioReadout, parseContrastColor, worstContrastResult } from "../ui/color/contrast";
import { TextLink } from "../ui/links";
import { joinClassNames } from "../ui/property-icons";
import { ColorChip, ColorTextPropertyRow } from "../ui/property-rows";

var jsxColorEditors: typeof import("react/jsx-runtime");
var COLORS_SECTION_LABEL: string;
var COLOR_REQUEST_PENDING_MESSAGE: string;
var colorCssConversionCache: Map<string, string | undefined>;
function colorValueForTheme(
  token: Token.EditorColorToken,
  theme: string,
  firstThemeId?: string,
): Token.ThemeColorValue {
  let themeValue = token.value[theme],
    isInherited = (themeValue === undefined || themeValue === "") && theme !== firstThemeId,
    declaredCss = !isInherited
      ? (themeValue ?? "")
      : firstThemeId !== undefined
        ? (token.value[firstThemeId] ?? "")
        : "",
    themeAlias = token.alias?.[theme];
  if (themeAlias !== undefined) {
    return {
      css: themeAlias.css,
      to: themeAlias.to,
      declared: declaredCss,
      inherited: isInherited,
    };
  }
  return {
    css: declaredCss !== "" ? declaredCss : undefined,
    declared: declaredCss,
    inherited: isInherited,
  };
}
function ColorSwatch({
  css: css,
  inherited: inherited,
  small: small,
}: Token.ColorSwatchProps): React.ReactElement {
  useUiLocale();
  let literalColor = isColorLiteral(css as string) ? css! : null;
  return (
    <span
      className={joinClassNames(
        "ds-chip inline-flex",
        inherited && "ds-cchip-inh",
      )}
      data-color={literalColor ?? undefined}
    >
      <ColorChip
        hex={literalColor}
        className={joinClassNames(
          small ? "size-4!" : "size-5! rounded-[4px]!",
          inherited &&
            "outline-1 outline-offset-1 outline-dashed outline-border-strong",
        )}
      />
    </span>
  );
}
function colorCssForPicker(css: string | undefined): string | undefined {
  if (!isColorLiteral(css as string)) {
    return;
  }
  if (/^#[0-9a-f]{3,8}$/i.test(css!) || /^rgba?\(/i.test(css!)) {
    return css;
  }
  let entry = colorCssConversionCache.get(css!);
  if (entry !== undefined || colorCssConversionCache.has(css!)) {
    return entry;
  }
  let rgbaColor = colorCssToRgba(css!);
  if (colorCssConversionCache.size > 2000) {
    colorCssConversionCache.clear();
  }
  colorCssConversionCache.set(css!, rgbaColor);
  return rgbaColor;
}
function colorCssToRgba(css: string): string {
  try {
    let canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    let canvasContext = canvas.getContext("2d", {
      willReadFrequently: true,
    });
    if (canvasContext === null) {
      return css;
    }
    canvasContext.fillStyle = css;
    canvasContext.fillRect(0, 0, 1, 1);
    let [redChannel, greenChannel, blueChannel, alphaChannel] = canvasContext.getImageData(0, 0, 1, 1).data,
      formatHexChannel = (channel: number | undefined) =>
        (channel ?? 0).toString(16).padStart(2, "0");
    return (
      "#" +
      formatHexChannel(redChannel) +
      formatHexChannel(greenChannel) +
      formatHexChannel(blueChannel) +
      (alphaChannel !== undefined && alphaChannel < 255 ? formatHexChannel(alphaChannel) : "")
    );
  } catch {
    return css;
  }
}
function useColorContrastReport(
  groups: Token.TokenNameGroup<Token.EditorColorToken>[],
  themes: Model.ColorTheme[],
  firstThemeId?: string,
): Token.ColorContrastFor {
  let colorTokens = (reactColorEditors as typeof React).useMemo(
      () => groups.flatMap((group) => group.tokens),
      [groups],
    ),
    usageSignature = colorTokens
      .map((token): string => token.name + "\x00" + (token.usage ?? ""))
      .join("\x01"),
    contrastPairMap = (reactColorEditors as typeof React).useMemo<
      Map<
        string,
        {
          against: string[];
        }
      >
    >(() => inferColorContrastPairs(colorTokens), [usageSignature]);
  return (reactColorEditors as typeof React).useMemo(() => {
    let tokensByName = new Map<string, Token.EditorColorToken>(
        colorTokens.map((token) => [token.name, token]),
      ),
      hasMultipleThemes: boolean = themes.length > 1;
    return (token: Token.EditorColorToken, themeId: string) => {
      let entry = contrastPairMap.get(token.name);
      if (entry === undefined) {
        return;
      }
      let themeName =
          themes.find((candidateTheme): boolean => candidateTheme.id === themeId)?.name ??
          themeId,
        againstColors = entry.against.flatMap((againstName) => {
          let againstToken = tokensByName.get(againstName),
            againstCss =
              againstToken === undefined
                ? undefined
                : colorCssForPicker(
                    colorValueForTheme(againstToken, themeId, firstThemeId).css,
                  );
          if (
            againstCss === undefined ||
            (parseContrastColor(againstCss)?.a ?? 0) < 1
          ) {
            return [];
          }
          return [
            {
              css: againstCss,
              get label() { return hasMultipleThemes ? ((((againstName) + (" (")) + (themeName)) + (")")) : (againstName); },
            },
          ];
        });
      if (againstColors.length === 0) {
        return undefined;
      } else {
        return {
          against: againstColors,
          role: "text",
        };
      }
    };
  }, [contrastPairMap, colorTokens, themes, firstThemeId]);
}
function ColorValueCell({
  token: token,
  theme: theme,
  themes: themes,
  firstId: firstId,
  edit: edit,
  onGoto: onGoto,
  contrastFor: contrastFor,
  askClaude: askClaude,
  busy = false,
}: Token.ColorValueCellProps): React.ReactElement {
  useUiLocale();
  let themeColor = colorValueForTheme(token, theme.id, firstId),
    [isEditing, setIsEditing] = (reactColorEditors as typeof React).useState(
      false,
    );
  if (isEditing && !busy) {
    setIsEditing(false);
  }
  let contrast = contrastFor(token, theme.id),
    contrastJson = contrast === undefined ? undefined : JSON.stringify(contrast),
    stableContrast = (reactColorEditors as typeof React).useMemo(
      () => contrast,
      [contrastJson],
    ),
    ref = (
      reactColorEditors as typeof React
    ).useRef<HTMLSpanElement | null>(null),
    ariaLabel: string =
      token.name +
      " · " +
      theme.name +
      ": " +
      (themeColor.to !== undefined
        ? uiMessage("design-system.colors.aliasOf2") + themeColor.to
        : (themeColor.css ?? uiMessage("design-system.colors.noValue"))) +
      (themeColor.inherited ? " (inherited)" : ""),
    copyColor = (): void => {
      let cssValue = themeColor.css ?? "";
      if (cssValue !== "") {
        copyTextToClipboard(cssValue).then((copySucceeded: boolean) =>
          showEditorNotification(
            copySucceeded ? cssValue + " copied" : cssValue,
          ),
        );
      }
    },
    editControl =
      themes[0] !== undefined && themes[0].id !== theme.id
        ? themes[0]
        : undefined,
    editField = (
      <Button
        variant={"ghost"}
        size={"sm"}
        iconOnly={true}
        icon={<ColorSwatch css={themeColor.css} inherited={themeColor.inherited} />}
        className={joinClassNames(
          "ds-cchip",
          themeColor.inherited && "ds-cchip-inh",
        )}
        aria-label={ariaLabel}
        tooltip={
          uiMessage("design-system.colors.copy", { subject: String(themes.length > 1 ? (theme.name + ": ") : ("")), detail: String(themeColor.css ?? ("")) })
        }
        data-testid={"ds-chip-" + token.name + "-" + theme.id}
        onClick={(event: React.MouseEvent<HTMLButtonElement>): void => {
          event.preventDefault();
          event.stopPropagation();
          copyColor();
        }}
      />
    ),
    foregroundContrast = (reactColorEditors as typeof React).useMemo(
      () =>
        themeColor.css !== undefined && isColorLiteral(themeColor.css)
          ? /^#|^rgba?\(/i.test(themeColor.css)
            ? themeColor.css
            : (colorCssForPicker(themeColor.css) ?? themeColor.css)
          : undefined,
      [themeColor.css],
    ),
    contrastResult = themeColor.inherited ? undefined : foregroundContrast,
    worstResult = (reactColorEditors as typeof React).useMemo(
      () =>
        foregroundContrast === undefined || stableContrast === undefined
          ? undefined
          : colorContrastResults(foregroundContrast, stableContrast),
      [foregroundContrast, stableContrast],
    ),
    worstContrast =
      worstResult === undefined
        ? undefined
        : worstContrastResult(worstResult),
    contrastLabel = (
      <jsxColorEditors.Fragment>
        {[edit !== undefined ? (
            <span
              className={
                "ds-crowfield min-w-0 flex-1 [--pp-label-w:0px] [--pp-gutter-l:0px] [--pp-gutter-r:0px]"
              }
              data-testid={"ds-hex-" + token.name + "-" + theme.id}
            >
              <ColorTextPropertyRow
                label={((token.name) + (" · ")) + (theme.name)}
                value={contrastResult}
                editsAreUndoSteps={true}
                popupAttrs={commentTargetProps(
                  "picker",
                  token.name + ":" + theme.id,
                )}
                {...(themeColor.inherited && foregroundContrast !== undefined
                  ? {
                      placeholder: foregroundContrast,
                    }
                  : {})}
                {...(themeColor.inherited && editControl !== undefined
                  ? {
                      clearLabel: uiMessage("design-system.colors.inherits") + editControl.name,
                    }
                  : {})}
                {...(themeColor.to !== undefined
                  ? {
                      title: uiMessage("design-system.colors.aliasOf") + themeColor.to,
                      description: uiMessage("design-system.colors.aliasOf") + themeColor.to,
                    }
                  : {})}
                {...(stableContrast !== undefined
                  ? {
                      contrast: stableContrast,
                      contrastMark: true,
                    }
                  : {})}
                onChange={(cssValue: string): void => {
                  if (cssValue === undefined) {
                    edit.clear?.(token.name, theme.id);
                    return;
                  }
                  edit.value(token.name, theme.id, cssValue);
                  edit.done?.();
                }}
                onLive={(liveCssValue: string) =>
                  edit.value(token.name, theme.id, liveCssValue)
                }
                onLiveEnd={() => edit.done?.()}
              />
            </span>
          ) : (
            <span
              className={"ds-cchip-anchor relative inline-flex"}
              ref={ref}
            >
              {editField}
            </span>
          ), edit !== undefined ? null : themeColor.to !== undefined ? (
            <TextLink
              className={joinClassNames(
                "ds-calias min-w-0 truncate font-mono text-footnote",
                themeColor.inherited && "text-muted",
              )}
              icon={"ArrowRight"}
              iconPosition={"start"}
              onClick={() => onGoto(themeColor.to!)}
              data-testid={"ds-alias-" + token.name + "-" + theme.id}
            >
              {themeColor.to}
            </TextLink>
          ) : themeColor.css !== undefined ? (
            <span
              className={joinClassNames(
                "ds-chex min-w-0 truncate font-mono text-footnote",
                themeColor.inherited ? "text-muted" : "text-secondary",
              )}
              title={themeColor.css}
              data-testid={"ds-hex-" + token.name + "-" + theme.id}
            >
              {themeColor.css}
            </span>
          ) : null, edit === undefined && worstResult !== undefined ? (
            <ContrastMark results={worstResult} />
          ) : null]}
      </jsxColorEditors.Fragment>
    );
  return (
    <span
      className={"ds-ccell flex min-w-0 items-center gap-sm"}
      role={"cell"}
      data-theme={themes.length > 1 ? theme.name : undefined}
      data-testid={"ds-cell-" + token.name + "-" + theme.id}
      data-id={commentTargetId(
        "cell",
        token.name + ":" + theme.id,
      )}
    >
      <span className={"flex min-w-0 flex-1 flex-col gap-0.5"}>
        {[<span className={"flex min-w-0 items-center gap-sm"}>
            {contrastLabel}
          </span>, worstResult !== undefined && worstContrast !== undefined && !worstContrast.passes ? (
            <span
              className={
                "flex min-w-0 flex-wrap items-center gap-x-sm gap-y-0.5"
              }
            >
              {[<ContrastCaption
                  result={worstContrast}
                  name={stripThemeSuffixFromColorLabel(
                    worstContrast.ground.label,
                    theme,
                    themes,
                  )}
                />, edit !== undefined && askClaude !== undefined ? (
                  <DisabledReasonTooltip
                    reason={
                      busy && !isEditing
                        ? uiMessage("design-system.colors.aRequestToTheAgent")
                        : undefined
                    }
                  >
                    <Button
                      variant={"secondary"}
                      aria-label={
                        get_FIX_WITH_CLAUDE_LABEL() + ": " + token.name + (themes.length > 1 ? ", " + theme.name + uiMessage("design-system.colors.theme2") : "")
                      }
                      data-testid={"ds-fix-" + token.name + "-" + theme.id}
                      busy={busy && isEditing}
                      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
                      busyLabel={"Asking the agent"}
                      disabled={busy && !isEditing}
                      onClick={(
                        event: React.MouseEvent<HTMLButtonElement>,
                      ): void => {
                        setIsEditing(true);
                        askClaude(
                          colorContrastSummary(
                            token.name,
                            theme,
                            themes,
                            worstResult,
                          ),
                          event.currentTarget,
                        );
                      }}
                    >
                      {get_FIX_WITH_CLAUDE_LABEL()}
                    </Button>
                  </DisabledReasonTooltip>
                ) : null]}
            </span>
          ) : null]}
      </span>
    </span>
  );
}
function stripThemeSuffixFromColorLabel(
  label: string,
  theme: Model.ColorTheme,
  themes: Model.ColorTheme[],
): string {
  let themeSuffix: string = " (" + theme.name + ")";
  if (themes.length > 1 && label.endsWith(themeSuffix)) {
    return label.slice(0, -themeSuffix.length);
  } else {
    return label;
  }
}
function colorContrastSummary(
  token: string,
  theme: Model.ColorTheme,
  themes: Model.ColorTheme[],
  checks: Color.ContrastResult[],
): Token.ContrastRequest {
  let failedChecks = checks
      .filter((contrastResult): boolean => !contrastResult.passes)
      .sort((leftResult, rightResult) => leftResult.ratio - rightResult.ratio)
      .map((contrastResult) => ({
        ground: stripThemeSuffixFromColorLabel(
          contrastResult.ground.label,
          theme,
          themes,
        ),
        ratio: contrastRatioReadout(contrastResult.ratio),
      })),
    contrastRequest = {
      token: token,
      theme: themes.length > 1 ? theme.id : undefined,
      failing: failedChecks,
      min: contrastRatioReadout(
        worstContrastResult(checks).min,
      ),
    },
    pageAddress = artifactPageAddress();
  return {
    label: get_FIX_WITH_CLAUDE_LABEL(),
    request: viewerColorContrastFixPrompt(contrastRequest, pageAddress),
    prompt: ownerColorContrastFixPrompt(contrastRequest, pageAddress),
  };
}
function ColorTokenRow({
  token: token,
  themes: themes,
  firstId: firstId,
  edit: edit,
  names: names,
  onGoto: onGoto,
  flash: flash,
  rowRef: rowRef,
  gridStyle: gridStyle,
  contrastFor: contrastFor,
  askClaude: askClaude,
  busy: busy,
}: Token.ColorTokenRowProps): React.ReactElement {
  useUiLocale();
  let firstThemeColor = colorValueForTheme(token, firstId ?? "", firstId),
    rowContextMenu = useRowContextMenu(
      edit !== undefined || (firstThemeColor.css ?? "") !== "",
    ),
    openRename = () =>
      document
        .querySelector<HTMLElement>(
          '[data-testid="ds-color-name-' + token.name + '"]',
        )
        ?.click();
  return (
    <div
      ref={rowRef}
      role={"row"}
      className={joinClassNames(
        "ds-crow ds-tokrow group/row",
        flash && "ds-flash",
      )}
      style={gridStyle}
      data-testid={"ds-color-" + token.name}
      {...commentTargetProps("token", token.name)}
      {...rowContextMenu.rowProps}
    >
      {[<span className={"ds-cname min-w-0 font-mono"} role={"rowheader"}>
          <EditableName
            name={token.name}
            taken={names}
            commit={
              edit === undefined
                ? undefined
                : (name: string) => edit.rename(token.name, name)
            }
            data-testid={"ds-color-name-" + token.name}
          />
        </span>, <span className={"ds-ccells contents"} role={"none"}>
          {themes.map((theme) =>
            (() => {
              const _Element = ColorValueCell;
              const _elementProps = {
                token: token,
                theme: theme,
                themes: themes,
                firstId: firstId,
                edit: edit,
                onGoto: onGoto,
                contrastFor: contrastFor,
                ...(askClaude !== undefined
                  ? {
                      askClaude: askClaude,
                    }
                  : {}),
                ...(busy !== undefined
                  ? {
                      busy: busy,
                    }
                  : {}),
              };
              const _elementKey = theme.id;
              return <_Element key={_elementKey} {..._elementProps} />;
            })(),
          )}
        </span>, <span
          className={
            "ds-cacts ds-cgutter relative flex items-center justify-center"
          }
          role={"cell"}
          {...UNCOMMENTABLE_PROPS}
        >
          {[<UsageNoteEditor
              value={token.usage ?? ""}
              label={token.name}
              anchorKey={"color/" + token.name}
              onChange={
                edit === undefined
                  ? undefined
                  : (usage: string) => edit.usage(token.name, usage)
              }
              onDone={edit?.done}
              data-testid={"ds-color-usage-" + token.name}
            />, edit !== undefined ? (
              <RemoveRowButton
                label={uiMessage("design-system.colors.remove", { subject: String(token.name) })}
                onRemove={() => edit.remove(token.name)}
                data-testid={"ds-color-remove-" + token.name}
              />
            ) : null]}
        </span>, <RowContextMenu
          title={token.name}
          at={rowContextMenu.at}
          anchor={rowContextMenu.anchor}
          onClose={rowContextMenu.close}
          testid={"ds-color-menu-" + token.name}
          actions={{
            ...(edit !== undefined
              ? {
                  rename: openRename,
                  remove: () => edit.remove(token.name),
                  get removeLabel() { return uiMessage("design-system.colors.remove", { subject: String(token.name) }); },
                }
              : {}),
            copy: firstThemeColor.css ?? "",
            ...(firstThemeColor.to !== undefined
              ? {
                  goto: () => onGoto(firstThemeColor.to!),
                  gotoLabel: "Go to " + firstThemeColor.to,
                }
              : {}),
            ...(edit?.clear !== undefined && themes[0] !== undefined
              ? {
                  inherit: themes
                    .slice(1)
                    .filter(
                      (theme): boolean =>
                        !colorValueForTheme(token, theme.id, firstId)
                          .inherited,
                    )
                    .map((theme) => ({
                      get label() { return ((theme.name) + (": inherit ")) + (themes[0].name); },
                      run: () => edit.clear?.(token.name, theme.id),
                    })),
                }
              : {}),
          }}
        />]}
    </div>
  );
}
function colorThemeGridStyle(themeCount: number): {
  style: import("../contracts/controls").DesignStyle;
} {
  return {
    style: {
      "--ds-themes": String(Math.max(1, themeCount)),
    },
  };
}
function normalizeThemeId(themeIdValue: string): string {
  return themeIdValue
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}
function ColorsSectionHeader({
  edit: edit,
  note: note,
}: Token.EditorSectionHeaderProps<Token.ColorEdit>): React.ReactElement {
  useUiLocale();
  let addGroup = edit?.addGroup;
  return (
    <SectionHeader
      title={COLORS_SECTION_LABEL}
      note={note}
      pageId={"colors"}
      data-testid={"ds-colors-head"}
      actions={
        addGroup === undefined ? undefined : (
          <jsxColorEditors.Fragment>
            <SectionAddButton
              label={uiMessage("design-system.colors.add")}
              what={"Add color group"}
              onClick={() => addGroup(true)}
              data-testid={"ds-add-color-group"}
            />
          </jsxColorEditors.Fragment>
        )
      }
    />
  );
}
function ColorsSection({
  themes: themes,
  groups: groups,
  edit: edit,
  names: names,
  askClaude: askClaude,
  busy: busy,
}: Token.ColorsSectionProps): React.ReactElement | null {
  useUiLocale();
  let visibleThemes =
      themes.length > 0
        ? themes
        : [
            {
              id: "light",
              name: "Value",
            },
          ],
    firstThemeId = themes[0]?.id,
    contrastReport = useColorContrastReport(groups, visibleThemes, firstThemeId),
    [flashedToken, setFlashedToken] = (reactColorEditors as typeof React).useState<
      string | null
    >(null),
    [selectedTokenName, setSelectedTokenName] = (reactColorEditors as typeof React).useState<
      string | null
    >(null),
    ref = (reactColorEditors as typeof React).useRef(
      new Map<string, HTMLDivElement>(),
    ),
    tokenNames = (reactColorEditors as typeof React).useMemo(
      () =>
        names ??
        new Set(
          groups.flatMap((group) =>
            group.tokens.map((token) => token.name),
          ),
        ),
      [names, groups],
    ),
    gotoToken = (tokenName: string): void => {
      if (
        !groups.some((group) =>
          group.tokens.some((token): boolean => token.name === tokenName),
        )
      ) {
        showEditorNotification(tokenName + " is not in this file");
        return;
      }
      setSelectedTokenName(tokenName);
    };
  (reactColorEditors as typeof React).useLayoutEffect((): void => {
    if (selectedTokenName === null) {
      return;
    }
    let entry = ref.current.get(selectedTokenName);
    setSelectedTokenName(null);
    if (entry === undefined) {
      return;
    }
    if (typeof entry.scrollIntoView === "function") {
      entry.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    setFlashedToken(selectedTokenName);
  }, [selectedTokenName]);
  (reactColorEditors as typeof React).useEffect(() => {
    if (flashedToken === null) {
      return;
    }
    let clearFlashTimer = window.setTimeout(() => setFlashedToken(null), 1200);
    return () => window.clearTimeout(clearFlashTimer);
  }, [flashedToken]);
  if (
    groups.reduce((group, groupIndex) => group + groupIndex.tokens.length, 0) === 0
  ) {
    return null;
  }
  let gridStyle = colorThemeGridStyle(visibleThemes.length),
    tokenRows = (
      <div
        className={"ds-crow ds-chead text-caption text-muted"}
        role={"row"}
        style={gridStyle.style}
        {...UNCOMMENTABLE_PROPS}
      >
        {[<span role={"columnheader"}>{uiMessage("design-system.colors.name")}</span>, visibleThemes.map((token) =>
            (() => {
              const ColorNameTag = "span";
              const colorNameProps = {
                role: "columnheader",
                className: "ds-chead-th truncate",
                children: token.name,
              };
              const colorNameKey = token.id;
              return <ColorNameTag key={colorNameKey} {...colorNameProps} />;
            })(),
          ), <span
            role={"columnheader"}
            className={"ds-cgutter"}
            aria-hidden={"true"}
          />]}
      </div>
    ),
    renderColorRows = (tokens: Token.EditorColorToken[], themeId: string) => (
      <div className={"ds-cscroll overflow-x-auto"}>
        <div
          className={"ds-ctable"}
          role={"table"}
          aria-label={uiMessage("design-system.colors.colors", { subject: String(themeId) })}
          data-edit={edit !== undefined ? "" : undefined}
        >
          {[tokenRows, tokens.map((token) => {
              return (() => {
                const ColorTokenRowComponent = ColorTokenRow;
                const colorTokenRowProps = {
                  token: token,
                  themes: visibleThemes,
                  firstId: firstThemeId,
                  edit: edit,
                  names: tokenNames,
                  onGoto: gotoToken,
                  flash: flashedToken === token.name,
                  rowRef: (element: HTMLDivElement | null): void => {
                    if (element === null) {
                      ref.current.delete(token.name);
                    } else {
                      ref.current.set(token.name, element);
                    }
                  },
                  gridStyle: gridStyle.style,
                  contrastFor: contrastReport,
                  ...(askClaude !== undefined
                    ? {
                        askClaude: askClaude,
                      }
                    : {}),
                  ...(busy !== undefined
                    ? {
                        busy: busy,
                      }
                    : {}),
                };
                const tokenKey = token.name;
                return <ColorTokenRowComponent key={tokenKey} {...colorTokenRowProps} />;
              })();
            })]}
        </div>
      </div>
    ),
    getGroupLabel = (group: Token.TokenNameGroup<Token.EditorColorToken>) =>
      group.name === "" ? PALETTE_GROUP_NAME : group.name,
    getGroupKey = (group: Token.TokenNameGroup<Token.EditorColorToken>) =>
      group.name === ""
        ? PALETTE_GROUP_NAME.toLowerCase()
        : group.name,
    values = new Set(groups.map((group) => getGroupKey(group))),
    renameGroup = (group: Token.TokenNameGroup<Token.EditorColorToken>) => {
      let renameGroupAction = edit?.renameGroup;
      if (renameGroupAction === undefined) {
        return;
      }
      return (nextGroupName: string) => {
        let normalizedGroupName = normalizeThemeId(nextGroupName);
        if (normalizedGroupName === "") {
          showEditorNotification(uiMessage("design-system.colors.aGroupNeedsAName"));
          return true;
        }
        if (
          normalizedGroupName === group.name ||
          (group.name === "" &&
            normalizedGroupName === PALETTE_GROUP_NAME.toLowerCase())
        ) {
          return true;
        }
        if (values.has(normalizedGroupName)) {
          showEditorNotification(
            uiMessage("design-system.colors.thereIsAlreadyA") + normalizedGroupName + " group",
          );
          return true;
        }
        if (!renameGroupAction(group, normalizedGroupName)) {
          showEditorNotification(
            uiMessage("design-system.colors.couldNotRename") +
              getGroupLabel(group) +
              " — a token name is already taken.",
          );
          return true;
        }
        return normalizedGroupName;
      };
    };
  return (
    <div
      className={"ds-colors flex flex-col gap-[48px]"}
      data-testid={"ds-colors"}
    >
      {groups.map((group) => {
        let groupDataKey = getGroupKey(group),
          groupLabel = getGroupLabel(group);
        return (() => {
          const ColorGroupSection = "section";
          const groupSectionProps = {
            className: joinClassNames(
              "ds-cgroup flex min-w-0 flex-col",
              group.name === "" && "ds-cgroup-loose",
            ),
            "aria-label": groupLabel,
            "data-testid": "ds-color-group-" + groupDataKey,
            "data-id": commentTargetId("cgroup", group.name),
            children: [
              <div
                className={
                  "ds-cgroup-head flex min-h-10 min-w-0 items-center gap-xs pb-xs"
                }
                data-testid={"ds-color-group-" + groupDataKey + "-head"}
                {...COMMENT_TARGET_PROPS}
              >
                {[<span className={"min-w-0 flex-1"}>
                    <EditableName
                      name={groupLabel}
                      taken={values}
                      commit={renameGroup(group)}
                      className={"ds-gname"}
                      data-testid={"ds-color-group-" + groupDataKey + "-name"}
                    />
                  </span>, edit?.removeGroup !== undefined ? (
                    <RemoveSectionButton
                      label={groupLabel}
                      icon={"Trash"}
                      verb={"Delete"}
                      onRemove={() => edit.removeGroup?.(group)}
                      data-testid={"ds-color-group-" + groupDataKey + "-delete"}
                    />
                  ) : null, edit?.addTo !== undefined ? (
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      iconOnly={true}
                      icon={"Add"}
                      aria-label={uiMessage("design-system.colors.addColorTo", { subject: String(groupLabel) })}
                      tooltip={uiMessage("design-system.colors.addColor")}
                      onClick={() => edit.addTo?.(group)}
                      data-testid={"ds-add-color-" + groupDataKey}
                      {...UNCOMMENTABLE_PROPS}
                    />
                  ) : null]}
              </div>,
              renderColorRows(group.tokens, groupLabel),
            ],
          };
          const groupKey = groupDataKey;
          return <ColorGroupSection key={groupKey} {...groupSectionProps} />;
        })();
      })}
    </div>
  );
}
function get_COLOR_REQUEST_PENDING_MESSAGE() {
  return uiMessage("design-system.colors.aRequestToTheAgent");
}
export {
  get_COLOR_REQUEST_PENDING_MESSAGE,
  colorContrastSummary,
  colorCssConversionCache,
  colorCssForPicker,
  colorCssToRgba,
  COLORS_SECTION_LABEL,
  ColorsSection,
  ColorsSectionHeader,
  ColorSwatch,
  colorThemeGridStyle,
  ColorTokenRow,
  ColorValueCell,
  colorValueForTheme,
  jsxColorEditors,
  normalizeThemeId,
  stripThemeSuffixFromColorLabel,
  useColorContrastReport,
};
export function installEditorColors(): () => void {
  return () => {
    jsxColorEditors = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    COLORS_SECTION_LABEL = "Colors";
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    COLOR_REQUEST_PENDING_MESSAGE = "A request to the agent is on its way";
    colorCssConversionCache = new Map();
  };
}
