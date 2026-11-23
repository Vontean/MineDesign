import { uiMessage } from "@minedesign/contracts/ui-messages";
import type {
  AddTokenKind,
  ApplicationCommands,
  ApplicationView,
  ColorEditActions,
  ComponentEditActions,
  ConfirmationState,
  ScalarEditActions,
  ScalarScaleGroup,
  ScalarTokenKind,
  ShadowEditActions,
  TypographyEditActions,
} from "../../contracts/application";
import type { ParsedDesignSystem } from "../../contracts";
import { showEditorNotification } from "../../editor/editable-name";
import { tokenGroupRenamePairs } from "../../editor/view-model";
import {
  commonTokenNamePrefix,
  PALETTE_GROUP_NAME,
} from "../../model/component-inference";
import {
  removeMissingFontReferences,
  setComponentGuidelines,
} from "../../model/font-component-commands";
import {
  clearColorThemeOverride,
  deleteColorTokens,
  deleteToken,
  renameColorTokensAtomically,
  renameToken,
  setColorTokenUsage,
  setColorTokenValue,
  setScalarTokenValue,
  setShadowTokenValue,
  setTokenFamilyNote,
  setTokenUsage,
  setTypographyFontFamily,
  setTypographyProperty,
  setTypographyStyleUsage,
  validateNewFontFamily,
} from "../../model/token-commands";
import { tokenNamesForFamily } from "../../model/tokens";
import { announceLiveMessage } from "../../ui/announcements";
import { reactArtifactRoot as React } from "../../ui/disclosure";

// 宿主 React 命名空间的类型较宽，这里补上泛型，让各动作的参数得到契约类型。
function useTypedMemo<T>(factory: () => T, deps: unknown[]): T {
  return React.useMemo(factory, deps) as T;
}

interface TokenEditorsOptions {
  editable: ApplicationCommands | undefined;
  snapshot: ParsedDesignSystem;
  viewRef: { current: ApplicationView };
  setConfirmation(confirmation: ConfirmationState | null): void;
  focusTestId(testId: string): void;
  announceUndoableChange(message: string): void;
  /** 添加令牌对话框在调用处声明得更晚，动作触发时才读取。 */
  getTokenFlow(): {
    openColor(group: string, isNewGroup?: boolean): void;
    openScale(source: ScalarScaleGroup): void;
  };
}

/**
 * 令牌编辑适配器：把颜色、间距、圆角、阴影、字体与组件说明的界面动作映射为文档命令，
 * 并处理删除、重命名、整组删除后的提示与撤销播报。
 * 各 useMemo 的依赖保持 [editable, snapshot]，与原先内联时一致，动作内读到的是上次依赖变化时的闭包。
 */
export function useTokenEditors({ editable, snapshot, viewRef, setConfirmation, focusTestId,
  announceUndoableChange, getTokenFlow }: TokenEditorsOptions) {
  const removeToken = (tokenKind: AddTokenKind) => (tokenName: string) => {
      if (
        editable?.exec(uiMessage("design-system.designSystemApp.remove") + tokenName, (deleteConfirmation) =>
          deleteToken(deleteConfirmation, tokenKind, tokenName),
        ) === true
      ) {
        announceUndoableChange(uiMessage("design-system.designSystemApp.removed") + tokenName);
      }
    },
    renameTokenFactory =
      (tokenKind: AddTokenKind) => (tokenName: string, newName: string) =>
        editable?.exec(uiMessage("design-system.designSystemApp.rename") + tokenName, (renameConfirmation) =>
          renameToken(renameConfirmation, tokenKind, tokenName, newName),
        ) ?? false,
    colorEdit = useTypedMemo<
      ColorEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              usage: (tokenName, usage) =>
                void editable.set("usage:color:" + tokenName, (nextUsage) =>
                  setColorTokenUsage(nextUsage, tokenName, usage),
                ),
              value: (tokenName, field, fallback) =>
                void editable.set(
                  "color:" + tokenName + ":" + field,
                  (nextValue) =>
                    setColorTokenValue(
                      nextValue,
                      tokenName,
                      field,
                      fallback,
                    ),
                ),
              clear: (tokenName, field) =>
                void editable.exec(
                  uiMessage("design-system.designSystemApp.clear") + tokenName + " " + field,
                  (nextValue) =>
                    clearColorThemeOverride(
                      nextValue,
                      tokenName,
                      field,
                    ),
                ),
              done: () => editable.seal(),
              remove: removeToken("color"),
              rename: renameTokenFactory("color"),
              addTo: (group) => getTokenFlow().openColor(group.name),
              addGroup: (isNewGroup) => getTokenFlow().openColor("", isNewGroup === true),
              removeGroup: (group) => {
                let value =
                    group.name === ""
                      ? PALETTE_GROUP_NAME
                      : group.name,
                  length = group.tokens.length;
                setConfirmation({
                  get title() { return uiMessage("design-system.designSystemApp.deleteAndIts", { subject: String(value), detail: String(String(length)), suffix: String(length === 1 ? " color?" : " colors?") }); },
                  get confirmLabel() { return uiMessage("design-system.designSystemApp.delete"); },
                  body:
                    (length === 1
                      ? uiMessage("design-system.designSystemApp.itIs")
                      : uiMessage("design-system.designSystemApp.all") + String(length) + " are") +
                    " removed from tokens.json; colors in other groups that alias them keep their resolved values. Undo brings the group back.",
                  run: () => {
                    let tokenNames = (
                      viewRef.current.colorGroups.find(
                        (candidate) => candidate.name === group.name,
                      )?.tokens ?? []
                    ).map((tokenName) => tokenName.name);
                    if (
                      tokenNames.length > 0 &&
                      editable.exec(uiMessage("design-system.designSystemApp.removeGroup") + value, (groupRemovalConfirmation) =>
                        deleteColorTokens(groupRemovalConfirmation, tokenNames),
                      )
                    ) {
                      announceUndoableChange(uiMessage("design-system.designSystemApp.deleted") + value);
                    } else {
                      showEditorNotification(
                        value + " changed meanwhile. Nothing was deleted.",
                      );
                    }
                    requestAnimationFrame(() =>
                      focusTestId("ds-add-color-group"),
                    );
                  },
                });
              },
              renameGroup: (group, newName) => {
                let value = tokenGroupRenamePairs(
                  group.tokens.map((tokenName) => tokenName.name),
                  commonTokenNamePrefix(
                    tokenNamesForFamily(
                      snapshot.tokens,
                      "color",
                    ),
                  ),
                  group.name,
                  newName,
                );
                if (value.length === 0) {
                  return false;
                }
                return editable.exec(
                  uiMessage("design-system.designSystemApp.renameGroup") +
                    (group.name === "" ? "palette" : group.name),
                  (tokenName) =>
                    renameColorTokensAtomically(tokenName, value),
                );
              },
            },
      [editable, snapshot],
    ),
    scaleEdit = (
      scaleKind: ScalarTokenKind,
      noteLabel?: string,
    ): ScalarEditActions | undefined =>
      editable === undefined
        ? undefined
        : {
            value: (field, fieldValue) =>
              void editable.set(scaleKind + ":" + field, (nextValue) =>
                setScalarTokenValue(
                  nextValue,
                  scaleKind,
                  field,
                  fieldValue,
                ),
              ),
            done: () => editable.seal(),
            usage: (field, usage) =>
              void editable.set("usage:" + scaleKind + ":" + field, (nextUsage) =>
                setTokenUsage(nextUsage, scaleKind, field, usage),
              ),
            note: (noteValue) =>
              void editable.exec(
                uiMessage("design-system.designSystemApp.edit") + (noteLabel ?? scaleKind) + " note",
                (note) =>
                  setTokenFamilyNote(
                    note,
                    scaleKind,
                    noteValue,
                    noteLabel,
                  ),
              ),
            remove: removeToken(scaleKind),
            rename: renameTokenFactory(scaleKind),
          },
    spacingEdit = useTypedMemo<
      ScalarEditActions | undefined
    >(() => scaleEdit("spacing"), [editable, snapshot]),
    radiusEdit = useTypedMemo<
      ScalarEditActions | undefined
    >(() => scaleEdit("radius"), [editable, snapshot]),
    extraScaleEdit = (extraValue: string) => {
      let value = scaleEdit("extra", extraValue);
      if (value === undefined) {
        return undefined;
      } else {
        return {
          ...value,
          add: (source: ScalarScaleGroup) => getTokenFlow().openScale(source),
        };
      }
    },
    shadowEdit = useTypedMemo<
      ShadowEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              value: (field, fieldValue, fallback) =>
                void editable.exec(
                  uiMessage("design-system.designSystemApp.edit") + field + " " + fieldValue,
                  (nextValue) =>
                    setShadowTokenValue(
                      nextValue,
                      field,
                      fieldValue,
                      fallback,
                    ),
                ),
              live: (field, shadowValue, fallback) =>
                void editable.set(
                  "shadow:" + field + ":" + shadowValue,
                  (nextValue) =>
                    setShadowTokenValue(
                      nextValue,
                      field,
                      shadowValue,
                      fallback,
                    ),
                ),
              done: () => editable.seal(),
              usage: (tokenName, usage) =>
                void editable.set("usage:shadow:" + tokenName, (nextUsage) =>
                  setTokenUsage(
                    nextUsage,
                    "shadow",
                    tokenName,
                    usage,
                  ),
                ),
              remove: removeToken("shadow"),
              rename: renameTokenFactory("shadow"),
            },
      [editable, snapshot],
    ),
    typeEdit = useTypedMemo<
      TypographyEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              setField: (field, styleValue, fallback) =>
                void editable.set(
                  "style:" + field + ":" + styleValue,
                  (nextValue) =>
                    setTypographyProperty(
                      nextValue,
                      field,
                      styleValue,
                      fallback,
                    ),
                ),
              setFont: (fontFamily, fontWeight) => {
                let value = validateNewFontFamily(
                  fontWeight,
                  snapshot.tokens.type.families,
                );
                if (value !== null) {
                  showEditorNotification(value);
                  return;
                }
                editable.exec(uiMessage("design-system.designSystemApp.font") + fontFamily, (fontRemovalConfirmation) =>
                  setTypographyFontFamily(
                    fontRemovalConfirmation,
                    fontFamily,
                    fontWeight,
                  ),
                );
              },
              done: () => editable.seal(),
              setUsage: (fontFamily, usage) =>
                void editable.set("usage:style:" + fontFamily, (nextUsage) =>
                  setTypographyStyleUsage(
                    nextUsage,
                    fontFamily,
                    usage,
                  ),
                ),
              remove: removeToken("type"),
              rename: renameTokenFactory("type"),
              dropMissingFonts: () => {
                if (
                  editable.exec(uiMessage("design-system.designSystemApp.dropMissingFontReferences"), (missingFontConfirmation) =>
                    removeMissingFontReferences(missingFontConfirmation),
                  )
                ) {
                  announceLiveMessage(uiMessage("design-system.designSystemApp.referenceRemoved"));
                }
              },
            },
      [editable, snapshot],
    ),
    componentEdit = useTypedMemo<
      ComponentEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              setGuidelines: (componentName, guidelines) =>
                void editable.set("guide:" + componentName, (nextGuidelines) =>
                  setComponentGuidelines(nextGuidelines, componentName, guidelines),
                ),
              done: () => editable.seal(),
            },
      [editable],
    );
  return { colorEdit, spacingEdit, radiusEdit, shadowEdit, typeEdit, componentEdit, extraScaleEdit };
}
