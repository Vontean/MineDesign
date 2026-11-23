import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { commentTargetProps, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { cssLengthInputStep, MAX_EDITABLE_CSS_LENGTH, parseEditableCssLength } from "./css-length-input";
import { EditableName } from "./editable-name";
import { RemoveRowButton, RowContextMenu, useRowContextMenu } from "./row-context-menu";
import { TokenTableSection } from "./section-headers";
import { UsageNoteEditor } from "./usage-notes";
import { groupTokensByName } from "../model/component-inference";
import { normalizeScalarTokenValue } from "../model/tokens";
import { toModuleNamespace } from "../module-helpers";
import { FieldComponents } from "../ui/field";
import { PropertyNumberInput } from "../ui/number-controls";
import { useTextCommit } from "../ui/text-commit";
import { TextInput } from "../ui/text-input";

var jsxTokenScales: typeof import("react/jsx-runtime");
var TOKEN_SCALE_CSS_LENGTH_PATTERN: RegExp;
var TOKEN_SCALE_SECTION_IDS: Record<Token.ScaleKind, string>;
var TOKEN_SCALE_VALIDATION_MESSAGES: Record<Token.ScaleKind, string>;
var TOKEN_SCALE_LABELS: Record<Token.ScaleKind, string>;
var GROUPABLE_TOKEN_SCALE_KINDS: Set<Token.ScaleKind>;
function cssLengthPreviewPixels(cssLength: string): number | null {
  if (cssLength === "0") {
    return 0;
  }
  let match = TOKEN_SCALE_CSS_LENGTH_PATTERN.exec(cssLength);
  if (match === null) {
    return null;
  }
  let number: number = Number(match[1] ?? "0");
  switch (match[2] ?? "px") {
    case "px":
      return number;
    case "rem":
    case "em":
      return number * 16;
    default:
      return (number / 100) * 320;
  }
}
function PlainTokenValueEditor({
  t: t,
  edit: edit,
  testid: testid,
}: Token.PlainTokenValueEditorProps): React.ReactElement {
  useUiLocale();
  let value = useTextCommit({
    value: t.value,
    validate: (rawValue: string) =>
      normalizeScalarTokenValue("extra", rawValue) === undefined
        ? TOKEN_SCALE_VALIDATION_MESSAGES.extra
        : null,
    commit: (newValue: string): void => {
      edit.value(t.name, newValue);
      edit.done();
    },
  });
  return (
    <FieldComponents.Root
      invalid={value.error !== null}
      className={"min-w-0 flex-1"}
      data-testid={"ds-strip-value"}
    >
      {[<TextInput
          {...value.props}
          className={"font-mono"}
          aria-label={uiMessage("design-system.tokenScales.tokenValue", { subject: String(t.name) })}
          data-testid={testid}
          spellCheck={false}
          autoComplete={"off"}
        />, value.error !== null ? (
          <FieldComponents.Error match={true}>
            {value.error}
          </FieldComponents.Error>
        ) : null]}
    </FieldComponents.Root>
  );
}
function LengthTokenValueEditor({
  t: t,
  kind: kind,
  edit: edit,
  testid: testid,
}: Token.LengthTokenValueEditorProps): React.ReactElement {
  useUiLocale();
  let value = parseEditableCssLength(t.value) ?? {
      n: 0,
      unit: "px",
    },
    callback = (scalarValue: number): string =>
      String(Math.round(scalarValue * 1000) / 1000) + value.unit,
    handleValue = (inputValue: number | undefined): void => {
      if (inputValue === undefined) {
        return;
      }
      let normalizedValue = callback(inputValue);
      if (
        normalizeScalarTokenValue(kind, normalizedValue) !== undefined
      ) {
        edit.value(t.name, normalizedValue);
        edit.done();
      }
    };
  return (
    <span
      className={"block w-full min-w-0 max-w-[9rem]"}
      data-testid={testid}
    >
      <PropertyNumberInput
        aria-label={uiMessage("design-system.tokenScales.tokenValue", { subject: String(t.name) })}
        refuseLetters={true}
        fullWidth={true}
        unit={value.unit}
        value={value.n}
        min={0}
        max={MAX_EDITABLE_CSS_LENGTH}
        step={cssLengthInputStep(value.unit)}
        steppers={false}
        onValue={handleValue}
        onScrub={(scrubValue: number): void => {
          let normalizedValue = callback(scrubValue);
          if (
            normalizeScalarTokenValue(kind, normalizedValue) !== undefined
          ) {
            edit.value(t.name, normalizedValue);
          }
        }}
        onScrubEnd={() => edit.done()}
      />
    </span>
  );
}
function TokenScaleRow({
  t: t,
  kind: kind,
  section: section,
  taken: taken,
  edit: edit,
}: Token.TokenScaleRowProps): React.ReactElement {
  useUiLocale();
  let value = TOKEN_SCALE_SECTION_IDS[kind],
    rowContext = useRowContextMenu(
      edit !== undefined || t.value !== "",
    ),
    callback = () =>
      document
        .querySelector<HTMLElement>(
          '[data-testid="ds-' + value + "-name-" + t.name + '"]',
        )
        ?.click(),
    testId: string = "ds-" + value + "-value-" + t.name;
  return (
    <div
      className={"ds-brow ds-tokrow ds-crow group/row"}
      role={"row"}
      data-testid={"ds-" + value + "-" + t.name}
      {...commentTargetProps("token", t.name)}
      {...rowContext.rowProps}
    >
      {[<span
          className={"ds-cname ds-brow-name min-w-0 font-mono"}
          role={"rowheader"}
        >
          <EditableName
            name={t.name}
            taken={taken}
            commit={
              edit === undefined
                ? undefined
                : (name: string) => edit.rename(t.name, name)
            }
            data-testid={"ds-" + value + "-name-" + t.name}
          />
        </span>, <span className={"ds-bcell ds-brow-val min-w-0 gap-xs"} role={"cell"}>
          {edit === undefined ? (<span
              className={
                "ds-brow-value min-w-0 truncate font-mono text-body text-muted"
              }
              data-testid={testId}
            >
              {t.value}
            </span>) : (kind === "extra" ? (<PlainTokenValueEditor t={t} edit={edit} testid={testId} />) : (<LengthTokenValueEditor
              t={t}
              kind={kind}
              edit={edit}
              testid={testId}
            />))}
        </span>, <span
          className={
            "ds-cacts ds-cgutter ds-brow-trash relative flex items-center justify-center"
          }
          role={"cell"}
          {...UNCOMMENTABLE_PROPS}
        >
          {[<UsageNoteEditor
              value={t.usage ?? ""}
              label={t.name}
              anchorKey={section + "/" + t.name}
              onChange={
                edit === undefined
                  ? undefined
                  : (usage: string) => edit.usage(t.name, usage)
              }
              onDone={edit?.done}
              data-testid={"ds-" + value + "-usage-" + t.name}
            />, edit !== undefined ? (
              <RemoveRowButton
                label={uiMessage("design-system.tokenScales.remove", { subject: String(t.name) })}
                onRemove={() => edit.remove(t.name)}
                data-testid={"ds-" + value + "-remove-" + t.name}
              />
            ) : null]}
        </span>, <RowContextMenu
          title={t.name}
          at={rowContext.at}
          anchor={rowContext.anchor}
          onClose={rowContext.close}
          testid={"ds-" + value + "-menu-" + t.name}
          actions={{
            ...(edit !== undefined
              ? {
                  rename: callback,
                  remove: () => edit.remove(t.name),
                  get removeLabel() { return uiMessage("design-system.tokenScales.remove", { subject: String(t.name) }); },
                }
              : {}),
            copy: t.value,
          }}
        />]}
    </div>
  );
}
function tokenScaleGroups(
  kind: Token.ScaleKind,
  scale: Token.EditorScale,
): Token.ScaleGroup[] {
  if (scale.tokens.length === 0) {
    return [];
  } else {
    return [
      {
        kind: kind,
        name: "",
        tokens: scale.tokens,
      },
    ];
  }
}
function extraTokenScaleGroups(
  families: Token.ExtraScaleFamily[],
): Token.ScaleGroup[] {
  return families.map((family) => ({
    kind: "extra",
    name: "",
    tokens: family.scale.tokens,
    family: {
      key: family.key,
      title: family.title,
    },
  }));
}
function tokenScaleGroupId(group: Token.ScaleGroup): string {
  if (group.family !== undefined) {
    return "family:" + group.family.key;
  }
  return group.kind + (group.name === "" ? "" : ":" + group.name);
}
function tokenScaleGroupLabel(group: Token.ScaleGroup): string {
  if (group.name !== "") {
    return group.name;
  } else {
    return group.family?.title ?? TOKEN_SCALE_LABELS[group.kind];
  }
}
function groupedTokenScale(
  kind: Token.ScaleKind,
  tokens: Token.EditorScalarToken[],
): Token.TokenNameGroup<Token.EditorScalarToken>[] | null {
  if (!GROUPABLE_TOKEN_SCALE_KINDS.has(kind)) {
    return null;
  }
  let groups = groupTokensByName(tokens);
  if (groups.length > 1) {
    return groups;
  } else {
    return null;
  }
}
function TokenScaleSections({
  groups: groups,
  editFor: editFor,
  headFor: headFor,
}: Token.TokenScaleSectionsProps): React.ReactElement | null {
  useUiLocale();
  if (groups.length === 0) {
    return null;
  }
  return (
    <div className={"ds-scales flex flex-col"}>
      {groups.map((source) => {
        let value = editFor?.(source),
          values = new Set(source.tokens.map((token) => token.name)),
          sectionHeader = headFor?.(source) ?? {
            title: tokenScaleGroupLabel(source),
          },
          sectionTestId: string =
            source.family !== undefined
              ? "ds-family-" + source.family.key
              : "ds-" + TOKEN_SCALE_SECTION_IDS[source.kind];
        return (() => {
          const TokenSection = TokenTableSection;
          const sectionProps = {
            className: "ds-scale ds-scale-" + source.kind,
            name: null,
            "data-testid": sectionTestId,
            "aria-label": sectionHeader.title,
            children: (
              <div className={"ds-srows"}>
                <div
                  className={"ds-bars ds-ctable"}
                  role={"table"}
                  aria-label={
                    source.family?.title ?? (TOKEN_SCALE_LABELS[source.kind])
                  }
                  data-edit={value !== undefined ? "" : undefined}
                >
                  {[<div
                      className={
                        "ds-brow ds-crow ds-chead text-caption text-muted"
                      }
                      role={"row"}
                      {...UNCOMMENTABLE_PROPS}
                    >
                      {[<span role={"columnheader"}>{uiMessage("design-system.tokenScales.name")}</span>, <span role={"columnheader"}>{uiMessage("design-system.tokenScales.value")}</span>, <span
                          className={"ds-cgutter"}
                          aria-hidden={"true"}
                        />]}
                    </div>, source.tokens.map((token) =>
                      (() => {
                        const _Element = TokenScaleRow;
                        const _elementProps = {
                          t: token,
                          kind: source.kind,
                          section:
                            source.family !== undefined
                              ? "family-" + source.family.key
                              : TOKEN_SCALE_SECTION_IDS[source.kind],
                          taken: values,
                          edit: value,
                        };
                        const _elementKey = token.name;
                        return (
                          <_Element key={_elementKey} {..._elementProps} />
                        );
                      })(),
                    )]}
                </div>
              </div>
            ),
          };
          const sectionKey = tokenScaleGroupId(source);
          return <TokenSection key={sectionKey} {...sectionProps} />;
        })();
      })}
    </div>
  );
}
export {
  cssLengthPreviewPixels,
  extraTokenScaleGroups,
  GROUPABLE_TOKEN_SCALE_KINDS,
  groupedTokenScale,
  jsxTokenScales,
  LengthTokenValueEditor,
  PlainTokenValueEditor,
  TOKEN_SCALE_CSS_LENGTH_PATTERN,
  TOKEN_SCALE_LABELS,
  TOKEN_SCALE_SECTION_IDS,
  TOKEN_SCALE_VALIDATION_MESSAGES,
  tokenScaleGroupId,
  tokenScaleGroupLabel,
  tokenScaleGroups,
  TokenScaleRow,
  TokenScaleSections,
};
export function installEditorTokenScales(): () => void {
  return () => {
    jsxTokenScales = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    TOKEN_SCALE_CSS_LENGTH_PATTERN = /^(\d{1,4}(?:\.\d{1,6})?)(px|rem|em|%)$/;
    TOKEN_SCALE_SECTION_IDS = {
      spacing: "spacing",
      radius: "corners",
      extra: "family",
    };
    TOKEN_SCALE_VALIDATION_MESSAGES = {
      spacing: "Not a length",
      radius: "Not a length",
      extra: "Not a plain CSS value",
    };
    TOKEN_SCALE_LABELS = {
      spacing: "Spacing",
      radius: "Corner radius",
      extra: "Tokens",
    };
    GROUPABLE_TOKEN_SCALE_KINDS = new Set(["spacing"]);
  };
}
