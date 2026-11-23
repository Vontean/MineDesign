import { uiFontWeight } from '@minedesign/contracts/ui-format';
import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { COMMENT_TARGET_PROPS, commentTargetId, commentTargetProps, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { cssLengthInputBounds, cssLengthInputStep, MAX_EDITABLE_CSS_LENGTH, parseEditableCssLength } from "./css-length-input";
import { EditableName } from "./editable-name";
import { EditorActionButton, EmptyEditorList } from "./empty-states";
import { ensureGoogleFonts, GOOGLE_FONT_FAMILY_NAMES, reactGoogleFontCatalog, WEB_SAFE_FONT_CATALOG } from "./font-catalog";
import { fontFamilyStack } from "./font-faces";
import { RemoveRowButton, RowContextMenu, useRowContextMenu } from "./row-context-menu";
import { RemoveSectionButton } from "./section-card";
import { SectionAddButton, SectionHeader } from "./section-headers";
import { UsageNoteEditor } from "./usage-notes";
import { normalizeTypographyProperty } from "../model/tokens";
import { clampTypographyNumber, initializeTypographyPreview, parseTypographyLength, typeStylePreviewStyle } from "./typography-preview";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { TooltipWrapper } from "../ui/color/gradient-stops";
import { Callout } from "../ui/icons";
import { Icon } from "../ui/interactions";
import { PropertyNumberInput } from "../ui/number-controls";
import { CdsRoot } from "../ui/overlays";
import { PropertyPopover, PropertyPopoverPanel, PropertyPopoverTrigger } from "../ui/property-popover-controls";
import { Select } from "../ui/select";
import { TextInput } from "../ui/text-input";

var jsxTypographyEditors: typeof import("react/jsx-runtime");
var FONT_WEIGHT_LABELS: [number, string][];
var DEFAULT_TYPE_SAMPLE: string;
var fontFileDisplayPath: (path: string) => string;
var fontFileSlantLabel: (style: string) => string;
var LineHeightIcon: () => React.ReactElement;
var LetterSpacingIcon: () => React.ReactElement;
var CUSTOM_FONT_FAMILY_SENTINEL: string;
var MAX_TYPE_SAMPLE_LENGTH: number;
var TYPE_CARD_KEY_PREFIX: string;
var TYPOGRAPHY_SECTION_LABEL: string;
function fontWeightLabel(weight: string | number): string { return uiFontWeight(weight); }
function groupFontsByFamily(
  fonts: Token.EditorFont[],
): [string, Token.EditorFont[]][] {
  let entries = new Map<string, Token.EditorFont[]>();
  for (let value of fonts) {
    let entry = entries.get(value.family);
    if (entry === undefined) {
      entries.set(value.family, [value]);
    } else {
      entry.push(value);
    }
  }
  return [...entries.entries()];
}
function MissingFontNotice({
  missing: missing,
  edit: edit,
}: Token.MissingFontNoticeProps): React.ReactElement {
  useUiLocale();
  let value: boolean = missing.length === 1;
  return (
    <div className={"contents"} {...UNCOMMENTABLE_PROPS}>
      <Callout
        variant={"warning"}
        className={"mx-[var(--pp-gutter-l)] my-sm"}
        data-testid={"ds-fonts-missing"}
        action={
          edit !== undefined ? (
            <Button
              onClick={edit.dropMissingFonts}
              data-testid={"ds-fonts-drop-missing"}
            >
              {value ? ("Drop the reference") : ("Drop the references")}
            </Button>
          ) : undefined
        }
      >
        {[value ? (uiMessage("design-system.typography.aFontFileIs")) : (uiMessage("design-system.typography.fontFilesAre", { subject: String(String(missing.length)) })), uiMessage("design-system.typography.referencedButNotUploaded"), <span className={"font-mono"}>
            {missing
              .map((fontInput) => fontFileDisplayPath(fontInput.path))
              .join(", ")}
          </span>, edit !== undefined ? (uiMessage("design-system.typography.addWithUploadFont", { subject: String(value ? (uiMessage("design-system.typography.it")) : (uiMessage("design-system.typography.them"))) })) : (uiMessage("design-system.typography.anEditorCanUpload", { subject: String(value ? (uiMessage("design-system.typography.it")) : (uiMessage("design-system.typography.them"))) }))]}
      </Callout>
    </div>
  );
}
function FontFilesList({
  fams: fams,
  onRemoveFont: onRemoveFont,
}: Token.FontFilesListProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      className={"ds-fontrows flex flex-col"}
      data-testid={"ds-fonts-card"}
    >
      {fams.flatMap(([fontInputA, fontInputB]) => {
        let entries = new Map<string, number>();
        return fontInputB.map((fontInputC, fontOption) => {
          let value: string =
              fontInputA +
              "/" +
              fontInputC.path +
              ":" +
              fontInputC.weight +
              ":" +
              fontInputC.style,
            fontValueC = (entries.get(value) ?? 0) + 1;
          entries.set(value, fontValueC);
          return (() => {
            const _Element = "div";
            const _elementProps = {
              className:
                "ds-frow ds-tokrow group/row flex items-center gap-x-md",
              "data-testid": "ds-font-" + fontInputC.path + "#" + String(fontOption),
              ...commentTargetProps(
                "font",
                value + (fontValueC > 1 ? "#" + String(fontValueC) : ""),
              ),
              children: [
                <TooltipWrapper
                  tip={
                    (fontInputC.path) + (fontInputC.asset === true
                      ? " — a font file under assets/, not a face of the type system"
                      : fontInputC.stray === true
                        ? " — not referenced by any tokens.json font face"
                        : "")
                  }
                  className={"min-w-0 flex-[1_1_10rem]"}
                >
                  <span className={"min-w-0 truncate text-body text-primary"}>
                    {[fontFileDisplayPath(fontInputC.path), fontInputC.asset === true ? (
                        <span className={"text-muted"}>{" · asset"}</span>
                      ) : fontInputC.stray === true ? (
                        <span className={"text-muted"}>
                          {" · unreferenced"}
                        </span>
                      ) : null]}
                  </span>
                </TooltipWrapper>,
                <span
                  className={
                    "ds-fontrow-preview min-w-0 flex-[2_10_6rem] truncate text-body text-muted"
                  }
                  style={{
                    fontFamily: fontFamilyStack(fontInputA, [
                      fontInputC.path,
                    ]),
                    fontWeight: fontInputC.weight.split(" ")[0],
                    fontStyle:
                      fontInputC.style === "italic" ? "italic" : "normal",
                  }}
                  aria-hidden={"true"}
                >
                  {[fontInputA, " ", fontFileSlantLabel(fontInputC.weight), fontInputC.style === "italic" ? " italic" : ""]}
                </span>,
                <RemoveSectionButton
                  label={fontFileDisplayPath(fontInputC.path)}
                  verb={"Remove"}
                  onRemove={
                    onRemoveFont === undefined
                      ? undefined
                      : () => onRemoveFont(fontInputC)
                  }
                />,
              ],
            };
            const _elementKey =
              fontInputA + ":" + String(fontOption) + ":" + fontInputC.path;
            return <_Element key={_elementKey} {..._elementProps} />;
          })();
        });
      })}
    </div>
  );
}
function FontFamilyPicker({
  value: fontValueD,
  familyKey: familyKey,
  families: families,
  familyNames: familyNames,
  fontNames = [],
  onFamily: onFamily,
  onFont: onFont,
  testid: testid,
  disabled: disabled,
}: Token.FontFamilyPickerProps): React.ReactElement {
  useUiLocale();
  let callback = (fontInputD: string) => {
      let fontInputValue = fontInputD.trim().toLowerCase();
      return Object.keys(families).find(
        (fontInputE) =>
          fontInputE === fontInputValue ||
          (familyNames?.[fontInputE] ?? "").toLowerCase() === fontInputValue,
      );
    },
    values = new Set(
      Object.keys(families).map((fontInputF) =>
        (familyNames?.[fontInputF] ?? fontInputF).toLowerCase(),
      ),
    ),
    typeHandler = (fontInputG: string): boolean => {
      let fontInputValueA = fontInputG.toLowerCase();
      if (values.has(fontInputValueA)) {
        return false;
      }
      values.add(fontInputValueA);
      return true;
    },
    items: import("../contracts/controls").SelectOption<string>[] = [
      ...Object.keys(families).map((fontInputH) => ({
        value: "fam:" + fontInputH,
        label: familyNames?.[fontInputH] ?? fontInputH,
        labelStyle: {
          fontFamily: families[fontInputH],
        },
        get group() { return uiMessage("design-system.typography.thisSystem"); },
      })),
      ...fontNames.filter(typeHandler).map((fontInputI) => ({
        value: "font:" + fontInputI,
        label: fontInputI,
        labelStyle: {
          fontFamily: "'" + fontInputI + "'",
        },
        get group() { return uiMessage("design-system.typography.fontFiles"); },
      })),
      ...WEB_SAFE_FONT_CATALOG.map(
        (fontInputJ: { family: string }) => fontInputJ.family,
      )
        .filter(typeHandler)
        .map((fontInputK: string) => ({
          value: "font:" + fontInputK,
          label: fontInputK,
          labelStyle: {
            fontFamily: fontInputK,
          },
          get group() { return uiMessage("design-system.typography.webSafe"); },
        })),
      ...GOOGLE_FONT_FAMILY_NAMES.filter(typeHandler).map(
        (fontInputL: string) => ({
          value: "font:" + fontInputL,
          label: fontInputL,
          labelStyle: {
            fontFamily: "'" + fontInputL + "'",
          },
          group: "Google Fonts",
        }),
      ),
      {
        value: CUSTOM_FONT_FAMILY_SENTINEL,
        get label() { return uiMessage("design-system.typography.custom"); },
        separatorBefore: true,
      },
    ],
    fontValueE =
      familyKey !== undefined && familyKey !== ""
        ? familyKey
        : callback(fontValueD),
    fontStateB: string | string | null =
      fontValueE !== undefined
        ? "fam:" + fontValueE
        : items.some((fontInputM): boolean => fontInputM.value === "font:" + fontValueD)
          ? "font:" + fontValueD
          : null,
    [fontWeightA, fontValueF] = (
      reactGoogleFontCatalog as typeof React
    ).useState(false),
    ref = (reactGoogleFontCatalog as typeof React).useRef(""),
    fontRef = (reactGoogleFontCatalog as typeof React).useRef<ReturnType<
      typeof setTimeout
    > | null>(null),
    typeHandlerA = (): void => {
      if (fontRef.current !== null) {
        clearTimeout(fontRef.current);
        fontRef.current = null;
      }
    };
  (reactGoogleFontCatalog as typeof React).useEffect(
    () => typeHandlerA,
    [],
  );
  let typeHandlerB = (fontInputN: string): void => {
      if (fontInputN === CUSTOM_FONT_FAMILY_SENTINEL) {
        fontValueF(true);
        return;
      }
      let fontInputValueB = fontInputN.startsWith("fam:") ? null : fontInputN.slice(5);
      if (fontInputValueB === null) {
        let fontLabel = fontInputN.slice(4);
        if (fontLabel !== fontValueE) {
          onFamily(fontLabel);
        }
        return;
      }
      let fontOptionValue = callback(fontInputValueB);
      if (fontOptionValue !== undefined) {
        if (fontOptionValue !== fontValueE) {
          onFamily(fontOptionValue);
        }
      } else {
        onFont(fontInputValueB);
      }
    },
    typeHandlerC = (fontInputO: string): void => {
      ref.current = "";
      let fontInputValueC = fontInputO.replace(/\s+/g, " ").trim();
      if (fontInputValueC === "" || fontInputValueC.toLowerCase() === fontValueD.toLowerCase()) {
        return;
      }
      let fontOptionValueA = callback(fontInputValueC);
      if (fontOptionValueA !== undefined) {
        onFamily(fontOptionValueA);
      } else {
        onFont(fontInputValueC);
      }
    },
    fontRefA = (reactGoogleFontCatalog as typeof React).useRef(typeHandlerC);
  fontRefA.current = typeHandlerC;
  (reactGoogleFontCatalog as typeof React).useEffect(
    () => (): void => {
      if (ref.current.trim() !== "") {
        fontRefA.current(ref.current);
      }
    },
    [],
  );
  let fontRefB = (
      reactGoogleFontCatalog as typeof React
    ).useRef<HTMLSpanElement | null>(null),
    typeHandlerD = (): void => {
      typeHandlerA();
      fontValueF(false);
      requestAnimationFrame(() =>
        fontRefB.current?.querySelector<HTMLElement>("button")?.focus({
          preventScroll: true,
        }),
      );
    };
  return (
    <span
      ref={fontRefB}
      className={"ds-fontfield block min-w-0 flex-1"}
      data-testid={testid}
    >
      {[<Select
          aria-label={uiMessage("design-system.typography.font")}
          popupAttrs={UNCOMMENTABLE_PROPS}
          items={items}
          value={fontStateB}
          placeholder={fontValueD === "" ? (undefined) : (fontValueD)}
          hint={fontValueD === "" ? "Font" : undefined}
          disabled={disabled}
          searchable={true}
          searchLabel={"Search fonts…"}
          onOpenChange={(fontInputP: boolean): void => {
            if (fontInputP) {
              ensureGoogleFonts(
                GOOGLE_FONT_FAMILY_NAMES,
              );
            }
          }}
          onChange={typeHandlerB}
          data-testid={testid + "-menu"}
        />, fontWeightA ? (
          <span className={"mt-1 block"}>
            <TextInput
              autoFocus={true}
              placeholder={uiMessage("design-system.typography.fontNameEGSHne")}
              aria-label={uiMessage("design-system.typography.customFontName")}
              spellCheck={false}
              autoComplete={"off"}
              data-1p-ignore={"true"}
              data-lpignore={"true"}
              data-bwignore={"true"}
              data-form-type={"other"}
              data-testid={testid + "-custom"}
              onChange={(
                fontInputQ: React.ChangeEvent<HTMLInputElement>,
              ): void => {
                ref.current = fontInputQ.currentTarget.value;
              }}
              onFocus={typeHandlerA}
              onBlur={(fontInputR: React.FocusEvent<HTMLInputElement>): void => {
                typeHandlerC(fontInputR.currentTarget.value);
                typeHandlerA();
                fontRef.current = setTimeout((): void => {
                  fontRef.current = null;
                  ref.current = "";
                  fontValueF(false);
                }, 250);
              }}
              onKeyDown={(
                event: React.KeyboardEvent<HTMLInputElement>,
              ): void => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  event.stopPropagation();
                  typeHandlerC(event.currentTarget.value);
                  typeHandlerD();
                }
                if (event.key === "Escape") {
                  event.stopPropagation();
                  ref.current = "";
                  typeHandlerD();
                }
              }}
            />
          </span>
        ) : null]}
    </span>
  );
}
function TypeStyleFields({
  v: v,
  families: families,
  familyNames: familyNames,
  fontNames: fontNames,
  fontLabel: fontLabel,
  onField: onField,
  onLive: onLive,
  onLiveEnd: onLiveEnd,
  onFont: onFont,
  testid: testid,
  inputRef: inputRef,
  row: row,
  anchorKey: anchorKey,
}: Token.TypeStyleFieldsProps): React.ReactElement {
  useUiLocale();
  let value = FONT_WEIGHT_LABELS.map(([fontInputS, fontInputT]) => ({
      value: String(fontInputS),
      label: uiFontWeight(fontInputS),
    })),
    fontValueG = parseEditableCssLength(v.fontSize) ?? {
      n: parseTypographyLength(v.fontSize, 16),
      unit: "px",
    },
    fontStateC = parseEditableCssLength(v.lineHeight) ?? {
      n: parseTypographyLength(v.lineHeight, 1.4),
      unit: "",
    },
    fontWeightB =
      v.letterSpacing === undefined ||
      v.letterSpacing === "normal" ||
      v.letterSpacing.trim() === ""
        ? "0"
        : v.letterSpacing,
    fontValueH =
      fontWeightB === "0"
        ? {
            n: 0,
            unit: "em",
          }
        : (parseEditableCssLength(fontWeightB) ?? {
            n: 0,
            unit: "em",
          }),
    fontInputValueD = fontValueH.unit === "" ? "em" : fontValueH.unit,
    callback = (
      fontInputU: Token.TypographyField,
      fontOptionA: string,
      fontValueI: number,
    ) => {
      let fontValueJ: string = String(Math.round(fontValueI * 1e6) / 1e6) + fontOptionA,
        fontValueK =
          fontInputU === "letterSpacing"
            ? (normalizeLetterSpacing(fontValueJ) ?? fontValueJ)
            : fontValueJ;
      if (
        normalizeTypographyProperty(fontInputU, fontValueK, {}) !==
        undefined
      ) {
        return fontValueK;
      } else {
        return undefined;
      }
    },
    typeHandlerE =
      (fontInputV: Token.TypographyField, fontOptionB: string) =>
      (fontInputW: number | undefined): void => {
        let fontValueL =
          fontInputW === undefined ? undefined : callback(fontInputV, fontOptionB, fontInputW);
        if (fontValueL !== undefined) {
          onField(fontInputV, fontValueL);
        }
      },
    typeHandlerF = (fontInputX: Token.TypographyField, fontOptionC: string) =>
      onLive === undefined
        ? {}
        : {
            onScrub: (fontInputY: number): void => {
              let fontValueM = callback(fontInputX, fontOptionC, fontInputY);
              if (fontValueM !== undefined) {
                onLive(fontInputX, fontValueM);
              }
            },
            onScrubEnd: () => onLiveEnd?.(),
          },
    fontOptionValueB =
      v.family === ""
        ? (fontLabel ?? "")
        : (familyNames?.[v.family] ?? v.family),
    typeHandlerG = (fontInputZ: string, fontOptionD: string) =>
      anchorKey !== undefined
        ? {
            role: "group",
            "aria-label": fontOptionD,
            ...commentTargetProps(
              "knob",
              anchorKey + "/" + fontInputZ,
            ),
          }
        : {},
    fontLabelA = (
      <span
        className={"block min-w-0 flex-1"}
        {...typeHandlerG("family", "Font")}
      >
        <FontFamilyPicker
          value={fontOptionValueB}
          familyKey={v.family}
          families={families}
          familyNames={familyNames}
          fontNames={fontNames}
          onFamily={(family: string): void => {
            if (family !== v.family) {
              onField("family", family);
            }
          }}
          onFont={onFont}
          testid={testid + "-family"}
        />
      </span>
    ),
    fontSelection = (
      <span className={"min-w-0"} {...typeHandlerG("weight", "Weight")}>
        <Select
          aria-label={uiMessage("design-system.typography.weight")}
          popupAttrs={UNCOMMENTABLE_PROPS}
          items={value}
          value={String(v.fontWeight)}
          onChange={(fontWeight: string): void => {
            if (fontWeight !== String(v.fontWeight)) {
              onField("fontWeight", fontWeight);
            }
          }}
          data-testid={testid + "-weight"}
        />
      </span>
    ),
    fontText = (
      <span
        data-testid={testid + "-size"}
        data-knob={"size"}
        className={"min-w-0"}
        {...typeHandlerG("size", "Size")}
      >
        <PropertyNumberInput
          aria-label={uiMessage("design-system.typography.size")}
          inputRef={inputRef}
          unit={fontValueG.unit || "px"}
          value={fontValueG.n}
          min={
            cssLengthInputBounds(fontValueG.unit || "px", 1, 400)[0]
          }
          max={MAX_EDITABLE_CSS_LENGTH}
          step={cssLengthInputStep(fontValueG.unit || "px")}
          steppers={false}
          refuseLetters={true}
          fullWidth={true}
          onValue={typeHandlerE("fontSize", fontValueG.unit || "px")}
          {...typeHandlerF("fontSize", fontValueG.unit || "px")}
        />
      </span>
    ),
    fontValueN = (
      <span
        data-testid={testid + "-lh"}
        data-knob={"lh"}
        className={"min-w-0"}
        {...typeHandlerG("line-height", uiMessage("design-system.typography.lineHeight"))}
      >
        <PropertyNumberInput
          aria-label={uiMessage("design-system.typography.lineHeight")}
          inputRef={inputRef}
          prefix={<LineHeightIcon />}
          unit={fontStateC.unit !== "" ? fontStateC.unit : undefined}
          value={fontStateC.n}
          min={
            fontStateC.unit === ""
              ? 0.5
              : cssLengthInputBounds(fontStateC.unit, 0, 400)[0]
          }
          max={fontStateC.unit === "" ? 10 : MAX_EDITABLE_CSS_LENGTH}
          step={
            fontStateC.unit === ""
              ? 0.05
              : cssLengthInputStep(fontStateC.unit)
          }
          steppers={false}
          refuseLetters={true}
          fullWidth={true}
          onValue={typeHandlerE("lineHeight", fontStateC.unit)}
          {...typeHandlerF("lineHeight", fontStateC.unit)}
        />
      </span>
    ),
    fontValueO = (
      <span
        data-testid={testid + "-ls"}
        data-knob={"ls"}
        className={"min-w-0"}
        {...typeHandlerG("letter-spacing", uiMessage("design-system.typography.letterSpacing"))}
      >
        <PropertyNumberInput
          aria-label={uiMessage("design-system.typography.tracking")}
          inputRef={inputRef}
          prefix={<LetterSpacingIcon />}
          unit={fontInputValueD}
          value={fontValueH.n}
          min={fontInputValueD === "px" ? -20 : -1}
          max={fontInputValueD === "px" ? 40 : 2}
          step={fontInputValueD === "px" ? 0.5 : 0.01}
          steppers={false}
          refuseLetters={true}
          fullWidth={true}
          onValue={typeHandlerE("letterSpacing", fontInputValueD)}
          {...typeHandlerF("letterSpacing", fontInputValueD)}
        />
      </span>
    ),
    typeHandlerH = (label: React.ReactNode, fontOptionE: React.ReactNode) => (
      <span className={"grid min-w-0 grid-cols-2 gap-sm"}>
        {[label, fontOptionE]}
      </span>
    );
  if (row !== undefined) {
    return (
      <jsxTypographyEditors.Fragment>
        {[row(uiMessage("design-system.typography.font"), fontLabelA), row(uiMessage("design-system.typography.weight"), typeHandlerH(fontSelection, fontText)), row(uiMessage("design-system.typography.lineHeight"), typeHandlerH(fontValueN, fontValueO))]}
      </jsxTypographyEditors.Fragment>
    );
  }
  return (
    <div className={"ds-tedit grid grid-cols-2 gap-sm"} data-testid={testid}>
      {[<span className={"col-span-2 min-w-0"}>{fontLabelA}</span>, fontSelection, fontText, fontValueN, fontValueO]}
    </div>
  );
}
function TypeStyleMetricEditors({
  s: s,
  famKey: famKey,
  families: families,
  familyNames: familyNames,
  fontNames: fontNames,
  edit: edit,
}: Token.TypeStyleMetricEditorsProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      className={"px-md pb-sm"}
      data-testid={"ds-style-controls-" + s.name}
    >
      <TypeStyleFields
        v={{
          family: famKey,
          fontSize: s.fontSize,
          fontWeight: s.fontWeight,
          lineHeight: s.lineHeight,
          letterSpacing: s.letterSpacing,
        }}
        families={families}
        familyNames={familyNames}
        fontNames={fontNames}
        testid={"ds-strip"}
        anchorKey={s.name}
        onField={(field: Token.TypographyField, fontOptionF: string): void => {
          edit.setField(s.name, field, fontOptionF);
          edit.done();
        }}
        onLive={(fontInput_: Token.TypographyField, fontOptionG: string) =>
          edit.setField(s.name, fontInput_, fontOptionG)
        }
        onLiveEnd={() => edit.done()}
        onFont={(fontFamily: string) => edit.setFont?.(s.name, fontFamily)}
      />
    </div>
  );
}
function TypeStyleSpecimen({
  s: s,
  famKey: famKey,
  families: families,
  familyNames: familyNames,
  fontNames: fontNames,
  edit: edit,
}: Token.TypeStyleSpecimenProps): React.ReactElement {
  useUiLocale();
  let [value, fontValueP] = (
      reactGoogleFontCatalog as typeof React
    ).useState(false),
    ref = (reactGoogleFontCatalog as typeof React).useRef(false),
    fontRefC = (
      reactGoogleFontCatalog as typeof React
    ).useRef<HTMLSpanElement | null>(null),
    fontStateD: string =
      (familyNames?.[famKey] ?? famKey) +
      " · " +
      s.fontSize.replace(/px$/, "");
  if (edit === undefined) {
    let fontWeightC: string =
      (familyNames?.[famKey] ?? famKey) +
      " · " +
      s.fontSize.replace(/px$/, "") +
      "/" +
      s.lineHeight +
      " · " +
      fontWeightLabel(s.fontWeight) +
      (s.letterSpacing !== undefined &&
      s.letterSpacing !== "0" &&
      s.letterSpacing !== "normal"
        ? " · " + s.letterSpacing
        : "");
    return (
      <span
        className={"ds-tchip-read min-w-0 text-footnote text-muted"}
        data-testid={"ds-style-chip-" + s.name}
      >
        {fontWeightC}
      </span>
    );
  }
  return (
    <span
      className={"ds-tchip-anchor relative flex min-w-0"}
      ref={fontRefC}
      data-testid={"ds-style-chip-" + s.name}
    >
      <PropertyPopover
        open={value}
        editsAreUndoSteps={true}
        onOpenChange={fontValueP}
        trigger={
          <PropertyPopoverTrigger
            label={uiMessage("design-system.typography.edit", { subject: String(s.name) })}
            text={fontStateD}
            onClick={(fontInputa: React.MouseEvent<HTMLButtonElement>): void => {
              ref.current = fontInputa.detail === 0;
            }}
          />
        }
        anchor={() => fontRefC.current}
        side={"bottom"}
        focusOnOpen={ref.current}
        className={"w-[17rem]"}
      >
        {value ? (<CdsRoot density={"compact"} className={"contents"}>
            <div
              role={"group"}
              aria-label={uiMessage("design-system.typography.textStyle", { subject: String(s.name) })}
              {...commentTargetProps(
                "editor",
                "style/" + s.name,
              )}
            >
              <PropertyPopoverPanel
                title={uiMessage("design-system.typography.text")}
                onClose={() => fontValueP(false)}
              >
                <TypeStyleMetricEditors
                  s={s}
                  famKey={famKey}
                  families={families}
                  familyNames={familyNames}
                  fontNames={fontNames}
                  edit={edit}
                />
              </PropertyPopoverPanel>
            </div>
          </CdsRoot>) : (null)}
      </PropertyPopover>
    </span>
  );
}
function normalizeLetterSpacing(fontValueQ: string): string | null {
  let fontValueR = fontValueQ.trim().toLowerCase();
  if (fontValueR === "" || fontValueR === "0") {
    return "0";
  }
  if (/^-?(?:\d+|\d*\.\d+)(?:px|rem|em)$/.test(fontValueR)) {
    return fontValueR;
  }
  if (/^-?(?:\d+|\d*\.\d+)$/.test(fontValueR)) {
    return fontValueR + "em";
  }
  return null;
}
function TypeStyleRow({
  s: s,
  g: g,
  families: families,
  familyNames: familyNames,
  fontNames: fontNames,
  taken: taken,
  edit: edit,
}: Token.TypeStyleRowProps): React.ReactElement {
  useUiLocale();
  let familyKey = s.familyKey ?? g.family,
    z = families[familyKey] ?? "system-ui, sans-serif",
    value = typeStylePreviewStyle(s, z),
    fontValueS = clampTypographyNumber(
      parseTypographyLength(s.fontSize, 14),
      6,
      160,
    ),
    fontStateE: number = Math.min(MAX_TYPE_SAMPLE_LENGTH, fontValueS),
    state = {
      ...value,
      fontSize: String(fontStateE) + "px",
      ...(fontStateE < fontValueS && typeof value.lineHeight === "string"
        ? {
            lineHeight:
              String(
                Math.round(
                  (parseTypographyLength(value.lineHeight, fontValueS * 1.3) *
                    fontStateE) /
                    fontValueS,
                ),
              ) + "px",
          }
        : {}),
    },
    fontWeightD = useRowContextMenu(),
    callback = () =>
      document
        .querySelector<HTMLElement>(
          '[data-testid="ds-style-name-' + s.name + '"]',
        )
        ?.click();
  return (
    <div
      role={"row"}
      className={"ds-wrow ds-trow ds-tokrow ds-crow group/row"}
      data-testid={"ds-style-" + s.name}
      {...commentTargetProps("style", s.name)}
      {...fontWeightD.rowProps}
    >
      {[<span
          className={
            "ds-cname ds-shname ds-tname flex min-w-0 items-start font-mono"
          }
          role={"rowheader"}
          data-testid={"ds-style-title-" + s.name}
        >
          <EditableName
            name={s.name}
            taken={taken}
            className={"ds-lname"}
            commit={
              edit === undefined
                ? undefined
                : (fontInputb: string) => edit.rename(s.name, fontInputb)
            }
            data-testid={"ds-style-name-" + s.name}
          />
        </span>, <span
          className={
            "ds-bcell ds-wcell flex min-w-0 flex-col items-start gap-xs"
          }
          role={"cell"}
        >
          {[<span
              className={"ds-tspec truncate text-primary"}
              style={state}
              data-testid={"ds-style-sample-" + s.name}
            >
              {uiMessage("design-system.typography.theQuickBrownFoxJumps")}
            </span>, <TypeStyleSpecimen
              s={s}
              famKey={familyKey}
              families={families}
              familyNames={familyNames}
              fontNames={fontNames}
              edit={edit}
            />]}
        </span>, <span
          className={
            "ds-cacts ds-cgutter relative flex items-start justify-center"
          }
          role={"cell"}
          {...UNCOMMENTABLE_PROPS}
        >
          {[<UsageNoteEditor
              value={s.usage ?? ""}
              label={s.name}
              anchorKey={"style/" + s.name}
              onChange={
                edit === undefined
                  ? undefined
                  : (fontInputc: string) => edit.setUsage(s.name, fontInputc)
              }
              onDone={edit?.done}
              data-testid={"ds-style-usage-" + s.name}
            />, edit !== undefined ? (
              <RemoveRowButton
                label={uiMessage("design-system.typography.remove", { subject: String(s.name) })}
                onRemove={() => edit.remove(s.name)}
                data-testid={"ds-style-remove-" + s.name}
              />
            ) : null]}
        </span>, <RowContextMenu
          title={s.name}
          at={fontWeightD.at}
          anchor={fontWeightD.anchor}
          onClose={fontWeightD.close}
          testid={"ds-style-menu-" + s.name}
          actions={{
            ...(edit !== undefined
              ? {
                  rename: callback,
                  remove: () => edit.remove(s.name),
                  get removeLabel() { return uiMessage("design-system.typography.remove", { subject: String(s.name) }); },
                }
              : {}),
            copy: s.fontSize + " / " + s.lineHeight,
          }}
        />]}
    </div>
  );
}
function TypographySectionHeader({
  edit: edit,
  note: note,
}: Token.EditorSectionHeaderProps<Token.TypographyEdit>): React.ReactElement {
  useUiLocale();
  return (
    <SectionHeader
      title={TYPOGRAPHY_SECTION_LABEL}
      note={note}
      pageId={"type"}
      data-testid={"ds-type-head"}
      actions={
        edit === undefined ? undefined : (
          <jsxTypographyEditors.Fragment>
            {[edit.addSet !== undefined ? (
                <SectionAddButton
                  label={uiMessage("design-system.typography.add")}
                  what={"Add type set"}
                  onClick={() => edit.addSet?.()}
                  data-testid={"ds-add-type-set"}
                />
              ) : null, edit.uploadFont !== undefined ? (
                <SectionAddButton
                  label={uiMessage("design-system.typography.uploadFont")}
                  icon={"Upload"}
                  onClick={() => edit.uploadFont?.()}
                  data-testid={"ds-fonts-upload-menu"}
                />
              ) : null]}
          </jsxTypographyEditors.Fragment>
        )
      }
    />
  );
}
function TypographySection({
  groups: groups,
  families: families,
  familyNames: familyNames,
  fonts: fonts,
  onRemoveFont: onRemoveFont,
  edit: edit,
  headFor: headFor,
}: Token.TypographySectionProps): React.ReactElement | null {
  useUiLocale();
  let value = fonts.filter((fontInputd): boolean => fontInputd.missing === true),
    fontValueT = groupFontsByFamily(
      fonts.filter((fontInpute): boolean => fontInpute.missing !== true),
    );
  if (
    groups.reduce((fontInputf, fontOptionH) => fontInputf + fontOptionH.styles.length, 0) ===
      0 &&
    fonts.length === 0 &&
    groups.length === 0 &&
    edit === undefined
  ) {
    return null;
  }
  let values = new Set(
      groups.flatMap((fontInputg) => fontInputg.styles.map((fontInputh) => fontInputh.name)),
    ),
    fontValueU = new Set(groups.map((fontInputi) => fontInputi.name)),
    items = [
      ...new Set(
        fonts
          .filter((fontInputj): boolean => fontInputj.asset !== true)
          .map((fontInputk) => fontInputk.family),
      ),
    ],
    fontStateF =
      edit?.uploadFont !== undefined ? (
        <EditorActionButton
          onClick={edit.uploadFont}
          label={uiMessage("design-system.typography.uploadFont")}
          icon={"Upload"}
          data-testid={"ds-fonts-upload"}
        />
      ) : undefined,
    fontWeightE = (
      <div
        className={"ds-wrow ds-trow ds-crow ds-chead text-caption text-muted"}
        role={"row"}
        {...UNCOMMENTABLE_PROPS}
      >
        {[<span role={"columnheader"}>{uiMessage("design-system.typography.name")}</span>, <span role={"columnheader"}>{uiMessage("design-system.typography.preview")}</span>, <span
            role={"columnheader"}
            className={"ds-cgutter"}
            aria-hidden={"true"}
          />]}
      </div>
    );
  return (
    <div
      className={"ds-type flex flex-col gap-[48px]"}
      data-testid={"ds-type"}
    >
      {[groups.length === 0 && edit !== undefined ? (
          <EmptyEditorList text={"No type sets yet"} />
        ) : null, groups.map((fontInputl) => {
          let state: Token.SectionHead = {
              title: fontInputl.name,
              defaultTitle: fontInputl.name,
              "data-testid": TYPE_CARD_KEY_PREFIX + fontInputl.name,
              ...headFor?.(fontInputl),
            },
            fontValueV =
              state["data-testid"] ?? TYPE_CARD_KEY_PREFIX + fontInputl.name;
          return (() => {
            const TypographySectionTag = "section";
            const fontValueX = {
              className: "ds-tgroup flex min-w-0 flex-col",
              "aria-label": state.title,
              "data-testid": "ds-type-" + fontInputl.name,
              "data-card-key": "type:" + fontInputl.name,
              "data-id": commentTargetId("tset", fontInputl.name),
              children: [
                <div
                  className={
                    "ds-cgroup-head flex min-h-10 min-w-0 items-center gap-xs pb-xs"
                  }
                  data-testid={"ds-type-" + fontInputl.name + "-head"}
                  {...COMMENT_TARGET_PROPS}
                >
                  {[<span className={"min-w-0 flex-1"}>
                      <EditableName
                        kind={"title"}
                        name={state.title}
                        defaultTitle={state.defaultTitle}
                        taken={fontValueU}
                        className={"ds-gname"}
                        commit={
                          state.onRename === undefined
                            ? undefined
                            : (fontInputm: string) =>
                                state.onRename?.(fontInputm) ?? true
                        }
                        data-testid={fontValueV + "-title"}
                        inputTestId={fontValueV + "-field"}
                      />
                    </span>, state.onRemove !== undefined ? (
                      <RemoveSectionButton
                        label={state.title}
                        icon={"Trash"}
                        why={state.removeWhy}
                        onRemove={state.onRemove}
                        data-testid={fontValueV + "-delete"}
                      />
                    ) : null, edit?.add !== undefined ? (
                      <Button
                        variant={"ghost"}
                        size={"sm"}
                        iconOnly={true}
                        icon={"Add"}
                        aria-label={uiMessage("design-system.typography.addATypeStyleTo", { subject: String(state.title) })}
                        tooltip={uiMessage("design-system.typography.addStyle")}
                        onClick={() => edit.add?.(fontInputl.name)}
                        data-testid={"ds-style-add-" + fontInputl.name}
                        {...UNCOMMENTABLE_PROPS}
                      />
                    ) : null]}
                </div>,
                fontInputl.styles.length === 0 ? (
                  <EmptyEditorList text={"No type styles yet"} />
                ) : null,
                <div className={"ds-cscroll overflow-x-auto"}>
                  <div
                    className={"ds-ttable ds-ctable ds-wtable"}
                    role={"table"}
                    aria-label={(state.title) + (" styles")}
                    hidden={fontInputl.styles.length === 0}
                    data-edit={edit !== undefined ? "" : undefined}
                  >
                    {[fontWeightE, fontInputl.styles.map((fontInputn) =>
                        (() => {
                          const TypographyRowComponent = TypeStyleRow;
                          const fontValueZ = {
                            s: fontInputn,
                            g: fontInputl,
                            families: families,
                            familyNames: familyNames,
                            fontNames: items,
                            taken: values,
                            edit: edit,
                          };
                          const typographyKey = fontInputn.name;
                          return (
                            <TypographyRowComponent
                              key={typographyKey}
                              {...fontValueZ}
                            />
                          );
                        })(),
                      )]}
                  </div>
                </div>,
              ],
            };
            const sectionKey = fontInputl.name;
            return <TypographySectionTag key={sectionKey} {...fontValueX} />;
          })();
        }), fonts.length > 0 || edit !== undefined ? (
          <section
            className={"ds-tgroup flex min-w-0 flex-col"}
            aria-label={uiMessage("design-system.typography.fontFiles")}
            data-testid={"ds-fonts"}
            data-id={commentTargetId("ds", "font-files")}
          >
            {[<div
                className={
                  "ds-cgroup-head flex min-h-10 min-w-0 items-center gap-xs pb-xs"
                }
                {...COMMENT_TARGET_PROPS}
              >
                {[<span
                    className={"ds-gname min-w-0 flex-1"}
                    data-testid={"ds-card-fonts-title"}
                  >
                    {uiMessage("design-system.typography.fontFiles")}
                  </span>, fontStateF]}
              </div>, <div className={"ds-ttable ds-tfonts"}>
                {[value.length > 0 ? (
                    <MissingFontNotice missing={value} edit={edit} />
                  ) : null, fontValueT.length > 0 ? (
                    <FontFilesList
                      fams={fontValueT}
                      onRemoveFont={onRemoveFont}
                    />
                  ) : (
                    <EmptyEditorList text={"No font files yet"} />
                  )]}
              </div>]}
          </section>
        ) : null]}
    </div>
  );
}
function get_DEFAULT_TYPE_SAMPLE() {
  return uiMessage("design-system.typography.theQuickBrownFoxJumps");
}
export {
  clampTypographyNumber,
  CUSTOM_FONT_FAMILY_SENTINEL,
  get_DEFAULT_TYPE_SAMPLE,
  FONT_WEIGHT_LABELS,
  FontFamilyPicker,
  fontFileDisplayPath,
  fontFileSlantLabel,
  FontFilesList,
  fontWeightLabel,
  groupFontsByFamily,
  jsxTypographyEditors,
  LetterSpacingIcon,
  LineHeightIcon,
  MAX_TYPE_SAMPLE_LENGTH,
  MissingFontNotice,
  normalizeLetterSpacing,
  parseTypographyLength,
  TYPE_CARD_KEY_PREFIX,
  TypeStyleFields,
  TypeStyleMetricEditors,
  typeStylePreviewStyle,
  TypeStyleRow,
  TypeStyleSpecimen,
  TYPOGRAPHY_SECTION_LABEL,
  TypographySection,
  TypographySectionHeader,
};
export function installEditorTypography(): () => void {
  return () => {
    jsxTypographyEditors = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    FONT_WEIGHT_LABELS = [
      [300, "Light"],
      [330, "Book"],
      [400, "Regular"],
      [430, "Text"],
      [500, "Medium"],
      [600, "Semibold"],
      [700, "Bold"],
      [800, "Heavy"],
    ];
    initializeTypographyPreview();
    DEFAULT_TYPE_SAMPLE = "The quick brown fox jumps over the lazy dog";
    fontFileDisplayPath = (path: string) =>
      path.replace(/^(?:fonts|assets)\//, "");
    fontFileSlantLabel = (style: string) => style.replace(" ", " – ");
    LineHeightIcon = () => <Icon name={"LineHeight"} size={"xs"} />;
    LetterSpacingIcon = () => (
      <Icon name={"LetterSpacing"} size={"xs"} />
    );
    CUSTOM_FONT_FAMILY_SENTINEL = "\x00custom";
    MAX_TYPE_SAMPLE_LENGTH = 64;
    TYPE_CARD_KEY_PREFIX = "ds-card-type-";
    TYPOGRAPHY_SECTION_LABEL = "Typography";
  };
}
