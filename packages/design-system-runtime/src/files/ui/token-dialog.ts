import { uiMessage } from "@minedesign/contracts/ui-messages";
import type {
  AddedToken,
  AddTokenKind,
  ApplicationCommands,
  ApplicationView,
  ScalarScaleGroup,
  ScalarTokenKind,
  TokenDialogState,
} from "../../contracts/application";
import type { ColorTheme, ParsedDesignSystem } from "../../contracts";
import { NEW_TOKEN_GROUP_SENTINEL } from "../../editor/add-token-dialog";
import { showEditorNotification } from "../../editor/editable-name";
import { groupedTokenScale } from "../../editor/token-scales";
import {
  addColorToken,
  addScalarToken,
  addShadowToken,
  addTypographyGroup,
  addTypographyStyle,
  unusedTokenName,
} from "../../model/asset-commands";
import {
  commonTokenNamePrefix,
  PALETTE_GROUP_NAME,
  tokenGroupName,
  tokenHasGroupSuffix,
} from "../../model/component-inference";
import {
  setColorTokenUsage,
  setColorTokenValue,
  setShadowTokenValue,
  setTokenUsage,
  setTypographyFontFamily,
  setTypographyProperty,
  setTypographyStyleUsage,
} from "../../model/token-commands";
import { conflictingTokenNames, tokenNamesForFamily } from "../../model/tokens";
import { reactArtifactRoot as React } from "../../ui/disclosure";

export function nextNumericTokenName(
  inputName: string,
  existingNames: string[],
  fallbackName: string,
): string {
  if (inputName === "") {
    return fallbackName;
  }
  let value = existingNames
    .map((suffix) => /-(\d{1,4})$/.exec(suffix)?.[1])
    .filter((suffix) => suffix !== undefined);
  if (value.length === 0) {
    return inputName + "-2";
  }
  let suffixes = [
      ...new Set(value.map((suffix) => parseInt(suffix, 10))),
    ].sort((suffix, otherSuffix) => suffix - otherSuffix),
    nextSuffix =
      suffixes.length > 1
        ? Math.min(
            ...suffixes
              .slice(1)
              .map((suffix, index) => suffix - suffixes[index]),
          )
        : 100;
  return (
    inputName +
    "-" +
    String(suffixes.at(-1)! + nextSuffix).padStart(
      Math.max(...value.map((items) => items.length)),
      "0",
    )
  );
}

export const TOKEN_DEFAULTS: Record<
  ScalarTokenKind,
  {
    value: string;
    label: string;
  }
> = {
  spacing: {
    value: "8px",
    get label() { return uiMessage("design-system.designSystemApp.spacingValue"); },
  },
  radius: {
    value: "4px",
    get label() { return uiMessage("design-system.designSystemApp.cornerRadius"); },
  },
  extra: {
    value: "1",
    get label() { return uiMessage("design-system.designSystemApp.token"); },
  },
};

function commonNumericNameStem(names: string[]): string {
  let values = new Set(
      names.map((name) => /^(.*)-\d{1,4}$/.exec(name)?.[1] ?? null),
    ),
    [items] = [...values];
  if (values.size === 1 && items !== null && items !== undefined) {
    return items;
  } else {
    return "";
  }
}

interface TokenDialogFlowOptions {
  editable: ApplicationCommands | undefined;
  snapshot: ParsedDesignSystem;
  view: ApplicationView;
  /** 值编辑涉及的主题；无主题时由调用端补一个默认主题。 */
  valueThemes: ColorTheme[];
  defaultValueThemeId: string;
  flashToken(tokenName: string, shouldScroll?: boolean, sectionId?: string): void;
  revealAsset(target: import("../../contracts/application").AssetRevealTarget): void;
}

/**
 * 新增 token 的完整流程：对话框状态、各类别的初始请求、提交后的落点与提示。
 * 调用端只拿对话框事实与打开、提交、关闭动作。
 */
export function useTokenDialogFlow({
  editable,
  snapshot,
  view,
  valueThemes,
  defaultValueThemeId,
  flashToken,
  revealAsset,
}: TokenDialogFlowOptions) {
  const [tokenDialog, setTokenDialog]: [
      TokenDialogState | null,
      (next: TokenDialogState | null) => void,
    ] = React.useState<TokenDialogState | null>(null),
    tokenDialogRef = React.useRef(tokenDialog),
    lastTypeSetRef = React.useRef<string | null>(null);
  // 渲染期写入，素材队列通过 getDialog 惰性读取最新值
  tokenDialogRef.current = tokenDialog;
  let addColorTokenFromSource = (source: AddedToken, namePrefix?: string) => {
      if (editable === undefined || source.kind !== "color") {
        return;
      }
      let value = source.values[defaultValueThemeId] ?? "#888888";
      if (
        editable.exec(
          source.newGroup ? uiMessage("design-system.designSystemApp.addColorGroup") : uiMessage("design-system.designSystemApp.addColor"),
          (candidateName) => {
            let tokenName = addColorToken(
              candidateName,
              source.name,
              value,
              namePrefix,
            );
            if (tokenName === candidateName) {
              return candidateName;
            }
            for (let [themeId, themeValue] of Object.entries(source.values)) {
              if (themeId !== defaultValueThemeId) {
                tokenName = setColorTokenValue(
                  tokenName,
                  source.name,
                  themeId,
                  themeValue,
                );
              }
            }
            if (source.usage !== "") {
              tokenName = setColorTokenUsage(
                tokenName,
                source.name,
                source.usage,
              );
            }
            return tokenName;
          },
        )
      ) {
        flashToken(
          source.name,
          true,
          source.group === "" ? undefined : source.group,
        );
      } else {
        showEditorNotification(
          uiMessage("design-system.designSystemApp.couldNotAdd") + source.name + ".",
        );
      }
    },
    showAddColor = (initialName = "", useSuggestedName = false) => {
      if (editable === undefined) {
        return;
      }
      let value = tokenNamesForFamily(snapshot.tokens, "color"),
        namePrefix = commonTokenNamePrefix(value),
        groups = view.colorGroups.map((group) => ({
          key: group.name,
          label:
            group.name === "" ? PALETTE_GROUP_NAME : group.name,
          seed:
            group.name === ""
              ? namePrefix
              : group.numeric === true
                ? unusedTokenName(
                    snapshot.tokens,
                    "color",
                    nextNumericTokenName(
                      namePrefix + group.name,
                      group.tokens.map((tokenName) => tokenName.name),
                      "color",
                    ),
                  )
                : namePrefix + group.name + "-",
        }));
      if (!groups.some((group) => group.key === "")) {
        groups.unshift({
          key: "",
          label: PALETTE_GROUP_NAME,
          seed: namePrefix,
        });
      }
      let nameSeed = useSuggestedName
          ? {
              key: NEW_TOKEN_GROUP_SENTINEL,
              label: "",
              seed: namePrefix,
            }
          : (groups.find((group) => group.key === initialName) ?? groups[0]),
        callback = (groupName: string) =>
          view.colorGroups
            .find((token) => token.name === groupName)
            ?.tokens.at(-1)?.name;
      setTokenDialog({
        req: {
          kind: "color",
          themes: valueThemes,
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, "color"),
          ),
          names: new Set(value),
          name: nameSeed.seed,
          value: "#888888",
          groups: groups,
          group: nameSeed.key,
          namespace: namePrefix,
          seedFor: (groupName) => namePrefix + groupName + "-",
          groupOf: (tokenName) =>
            tokenHasGroupSuffix(tokenName, namePrefix)
              ? tokenGroupName(tokenName, namePrefix)
              : "",
        },
        land: (source) => {
          if (source.kind === "color") {
            addColorTokenFromSource(source, callback(source.group));
          }
        },
      });
    },
    newTokenNameSeed = (
      tokenKind: AddTokenKind,
      namePrefix: string,
      items: string[],
      nameSeed = "",
    ) => {
      let nameStem = namePrefix !== "" ? namePrefix : commonNumericNameStem(items);
      if (nameStem === "") {
        return nameSeed;
      }
      if (
        items.length > 0 &&
        items.every((name) => /-\d{1,4}$/.test(name))
      ) {
        return unusedTokenName(
          snapshot.tokens,
          tokenKind,
          nextNumericTokenName(nameStem, items, nameStem),
        );
      } else {
        return nameStem + "-";
      }
    },
    showAddScaleToken = (source: ScalarScaleGroup) => {
      if (editable === undefined) {
        return;
      }
      let kind = source.kind,
        value = source.family?.key,
        defaults = TOKEN_DEFAULTS[kind],
        tokens =
          (kind === "spacing"
            ? view.spacing
            : kind === "radius"
              ? view.corners
              : view.extras.find((extraGroup) => extraGroup.key === value)?.scale
          )?.tokens ?? [],
        namePrefix = commonTokenNamePrefix(
          tokens.map((token) => token.name),
        ),
        groups =
          kind === "spacing"
            ? groupedTokenScale(kind, tokens)
            : null,
        selectedGroup =
          groups === null
            ? undefined
            : groups.map((group) => ({
                key: group.name === "" ? "" : namePrefix + group.name,
                get label() { return group.name === "" ? (uiMessage("design-system.designSystemApp.spacing")) : (group.name); },
                seed: newTokenNameSeed(
                  kind,
                  group.name === "" ? "" : namePrefix + group.name,
                  group.tokens.map((token) => token.name),
                  namePrefix,
                ),
              })),
        selectedSource =
          selectedGroup?.find((token) => token.key === source.name) ?? selectedGroup?.[0],
        callback = (tokenName: string) =>
          tokenName === ""
            ? tokens.filter(
                (token) =>
                  !tokenHasGroupSuffix(token.name, namePrefix),
              )
            : tokens.filter((token) => token.name.startsWith(tokenName + "-"));
      setTokenDialog({
        req: {
          kind: kind,
          get label() { return value !== undefined ? ((value) + (" token")) : (defaults.label); },
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, kind),
          ),
          name:
            selectedSource !== undefined
              ? selectedSource.seed
              : newTokenNameSeed(
                  kind,
                  source.name,
                  source.tokens.map((token) => token.name),
                  namePrefix,
                ),
          value:
            source.tokens.at(-1)?.value ??
            tokens.at(-1)?.value ??
            defaults.value,
          ...(kind === "spacing"
            ? {
                namespace: namePrefix,
              }
            : {}),
          ...(selectedGroup !== undefined && selectedSource !== undefined
            ? {
                groups: selectedGroup,
                group: selectedSource.key,
                groupOf: (tokenName: string) =>
                  tokenHasGroupSuffix(tokenName, namePrefix)
                    ? namePrefix + tokenGroupName(tokenName, namePrefix)
                    : "",
              }
            : {}),
        },
        land: (tokenSource: AddedToken) => {
          if (tokenSource.kind !== kind) {
            return;
          }
          let nameSeed = (
            (tokenSource.group !== undefined
              ? callback(tokenSource.group).at(-1)
              : undefined) ??
            source.tokens.at(-1) ??
            tokens.at(-1)
          )?.name;
          if (
            editable.exec("add " + (value ?? kind), (candidateName) => {
              let tokenName = addScalarToken(
                candidateName,
                kind,
                tokenSource.name,
                tokenSource.value,
                nameSeed,
                value,
              );
              if (tokenName === candidateName || tokenSource.usage === "") {
                return tokenName;
              } else {
                return setTokenUsage(
                  tokenName,
                  kind,
                  tokenSource.name,
                  tokenSource.usage,
                );
              }
            })
          ) {
            flashToken(tokenSource.name);
          } else {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.couldNotAdd") + tokenSource.name + ".",
            );
          }
        },
      });
    },
    showAddTypeStyle = (initialName?: string) => {
      if (editable === undefined) {
        return;
      }
      let value = view.typeGroups.map((group) => group.name),
        groupName =
          initialName ??
          (lastTypeSetRef.current !== null &&
          value.includes(lastTypeSetRef.current)
            ? lastTypeSetRef.current
            : (value.at(-1) ?? "")),
        selectedTypeGroup = view.typeGroups.find((group) => group.name === groupName),
        selectedStyle =
          selectedTypeGroup?.styles.at(-1) ?? view.typeGroups.at(-1)?.styles.at(-1),
        familyKey =
          selectedStyle?.familyKey ??
          selectedTypeGroup?.family ??
          Object.keys(view.families)[0] ??
          "",
        fontWeight =
          selectedStyle === undefined
            ? "400"
            : String(
                typeof selectedStyle.fontWeight === "number"
                  ? selectedStyle.fontWeight
                  : parseInt(String(selectedStyle.fontWeight), 10) || 400,
              );
      setTokenDialog({
        req: {
          kind: "type",
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, "type"),
          ),
          name: "",
          families: view.families,
          familyNames: view.familyNames,
          fontNames: [
            ...new Set(
              view.fonts
                .filter((font) => font.asset !== true)
                .map((font) => font.family),
            ),
          ],
          style: {
            family: familyKey,
            fontSize: selectedStyle?.fontSize ?? "16px",
            lineHeight: selectedStyle?.lineHeight ?? "1.5",
            fontWeight: fontWeight,
            fontStyle: selectedStyle?.fontStyle === "italic" ? "italic" : "normal",
            letterSpacing: selectedStyle?.letterSpacing ?? "0",
          },
          sets: value,
          set: groupName,
        },
        land: (source) => {
          if (source.kind !== "type") {
            return;
          }
          let groups = view.typeGroups
              .find((group) => group.name === source.set)
              ?.styles.at(-1)?.name,
            renameConfirmationResult = editable.exec(
              source.newSet ? "add type set" : "add type style",
              (group) => {
                let isNewGroup = source.newSet
                  ? addTypographyGroup(group, source.set)
                  : group;
                if (source.newSet && isNewGroup === group) {
                  return group;
                }
                let style = addTypographyStyle(
                  isNewGroup,
                  source.name,
                  groups,
                  source.set,
                );
                if (style === isNewGroup) {
                  return group;
                }
                style =
                  source.font !== undefined
                    ? setTypographyFontFamily(
                        style,
                        source.name,
                        source.font,
                      )
                    : setTypographyProperty(
                        style,
                        source.name,
                        "family",
                        source.style.family,
                      );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "fontSize",
                  source.style.fontSize,
                );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "lineHeight",
                  source.style.lineHeight,
                );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "fontWeight",
                  source.style.fontWeight,
                );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "fontStyle",
                  source.style.fontStyle,
                );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "letterSpacing",
                  source.style.letterSpacing,
                );
                if (source.usage !== "") {
                  style = setTypographyStyleUsage(
                    style,
                    source.name,
                    source.usage,
                  );
                }
                return style;
              },
            );
          if (renameConfirmationResult) {
            lastTypeSetRef.current = source.set;
          }
          if (renameConfirmationResult && source.newSet) {
            revealAsset({
              kind: "type",
              key: source.set,
            });
          } else if (renameConfirmationResult) {
            flashToken(source.name);
          } else {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.couldNotAdd") + source.name + ".",
            );
          }
        },
      });
    },
    showAddShadow = () => {
      if (editable === undefined) {
        return;
      }
      let value = view.shadows.tokens.at(-1);
      setTokenDialog({
        req: {
          kind: "shadow",
          themes: valueThemes,
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, "shadow"),
          ),
          name: newTokenNameSeed(
            "shadow",
            "",
            view.shadows.tokens.map((token) => token.name),
          ),
          value:
            value?.value[defaultValueThemeId] ??
            "0 1px 2px rgba(0, 0, 0, 0.2)",
        },
        land: (source) => {
          if (source.kind !== "shadow") {
            return;
          }
          if (
            editable.exec("add shadow", (candidateName) => {
              let tokenName = addShadowToken(
                candidateName,
                source.name,
                source.values[defaultValueThemeId] ?? "",
              );
              if (tokenName === candidateName) {
                return candidateName;
              }
              for (let [themeId, themeValue] of Object.entries(source.values)) {
                if (themeId !== defaultValueThemeId) {
                  tokenName = setShadowTokenValue(
                    tokenName,
                    source.name,
                    themeId,
                    themeValue,
                  );
                }
              }
              if (source.usage !== "") {
                tokenName = setTokenUsage(
                  tokenName,
                  "shadow",
                  source.name,
                  source.usage,
                );
              }
              return tokenName;
            })
          ) {
            flashToken(source.name);
          } else {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.couldNotAdd") + source.name + ".",
            );
          }
        },
      });
    };

  return {
    dialog: tokenDialog,
    getDialog: () => tokenDialogRef.current,
    close: () => setTokenDialog(null),
    submit: (token: AddedToken) => {
      if (tokenDialog === null) {
        return;
      }
      let land = tokenDialog.land;
      setTokenDialog(null);
      land(token);
    },
    openColor: showAddColor,
    openScale: showAddScaleToken,
    openTypeStyle: showAddTypeStyle,
    openShadow: showAddShadow,
  };
}
