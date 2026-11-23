import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Icon } from "../../cds/components/icon";
import { load_react_jsx_runtime } from "../../dependencies";
import { announce } from "../accessibility/announcer";
import { editableElementSelector, preventInputEnterSubmit } from "../chrome/focus";
import { EditorMenuItem, getFocusableElements } from "../chrome/menu-item";
import { blockingOverlaySelector, isClosedOverlay, joinClassNames } from "../chrome/overlay-state";
import { EditorPopover } from "../chrome/popover";
import { ColorContrastCopyNoMatchesLabel as noMatchesLabel, ColorContrastCopySearchStylesLabel as searchStylesLabel } from "../color/contrast-copy";
import { summarizeContrastResults } from "../color/contrast-ui";
import { evaluateColorContrast } from "../color/contrast";
import { PickerListHeader } from "../color/picker-primitives";
import { ColorHexInput, ColorPickerConstant, ColorPickerLabel } from "../color/picker";
import { reactForSessionTypographyPopup } from "../inspector/artboard-radius";
import { ColorSwatchPicker, colorWellStyle } from "../properties/color-swatches";
import { NumericInput, PropertiesNumericInputLimit } from "../properties/numeric-input";
import { pickerSearchInitialIndex, PickerSearchInput, pickerSearchKeyHandler, pickerSearchMatches } from "../properties/picker-search";
import { EditorIcon } from "../properties/primitives";
import { PropertySelect } from "../properties/select";
import { PropertyOptionIcon } from "../properties/tool-options";
import { LineHeightValue } from "../properties/tooltip";
import { SessionStripButton, SessionStripButton as SessionStripButton_r } from "./session-strip";
import { fontVariantKey, includeCurrentFontVariant, parseFontVariantKey } from "../typography/font-variants";
import { toModuleNamespace } from "../../module-helpers";

var jsxSessionStripPopups: Dynamic;
var SessionStripPopupsClassNames: Dynamic;
var SessionStripPopupsConstant: Dynamic;
var SessionStripPopupsClosest: Dynamic;
var SessionStripPopupsDataSessionStripConfig: Dynamic;
var SessionStripPopupsItems: Dynamic;
var SessionStripPopupsJoinValue: Dynamic;
var enabledPopupControlSelector: Dynamic;
var SessionStripPopupsHandler: Dynamic;
var SessionStripPopupsTarget: Dynamic;
var SessionStripPopupsLabel: Dynamic;
function useSessionPopupFocus(isOpen?: Dynamic, openPopup?: Dynamic): Dynamic {
  let [isByKey, setIsByKey]: Dynamic = (0,
    reactForSessionTypographyPopup.useState)(false),
    bodyRef: Dynamic = (0, reactForSessionTypographyPopup.useRef)(
      null,
    ),
    findInitialFocus: Dynamic = (): Dynamic =>
      SessionStripPopupsHandler(bodyRef.current);
  return {
    byKey: isByKey,
    body: bodyRef,
    initialFocus: findInitialFocus,
    keyed: {
      onKeyDown: (event?: Dynamic): Dynamic => {
        if (event.key === "Enter" || event.key === " ") setIsByKey(true);
        else if (
          event.key === "ArrowDown" &&
          !event.defaultPrevented &&
          !event.altKey &&
          !event.metaKey &&
          !event.ctrlKey &&
          !event.shiftKey
        ) {
          let currentTarget: Dynamic = event.currentTarget;
          for (let overlay of (document as Dynamic).querySelectorAll(
            blockingOverlaySelector,
          ) as Dynamic)
            if (
              !(
                overlay.matches("[data-mc-scrim]") ||
                isClosedOverlay(overlay)
              ) &&
              !(
                currentTarget instanceof Node &&
                overlay.contains(currentTarget)
              ) &&
              !(
                isOpen &&
                bodyRef.current !== null &&
                overlay.contains(bodyRef.current)
              )
            )
              return;
          if (isOpen) {
            let popoverElement: Dynamic =
                bodyRef.current?.closest("[data-mc-popover]") ?? null,
              focusTarget: Dynamic =
                findInitialFocus() ??
                (popoverElement !== null
                  ? (getFocusableElements(popoverElement)[0] ?? null)
                  : null);
            if (focusTarget === null) return;
            event.preventDefault();
            setIsByKey(true);
            focusTarget.focus();
            return;
          }
          event.preventDefault();
          setIsByKey(true);
          openPopup();
        }
      },
      onPointerDown: (): Dynamic => setIsByKey(false),
    },
  };
}
function SessionPopup({
  testid: testid,
  title: title,
  icon: icon,
  readout: readout,
  disabled: isDisabled,
  align = "left",
  popoverClassName: popoverClassName,
  editsAreUndoSteps: editsAreUndoSteps,
  children: children,
}: Dynamic): Dynamic {
  useUiLocale();
  let [isOpen, setIsOpen]: Dynamic = (0,
    reactForSessionTypographyPopup.useState)(false),
    {
      byKey: usesKeyboard,
      body: bodyRef,
      initialFocus: initialFocus,
      keyed: keyedProps,
    }: Dynamic = useSessionPopupFocus(isOpen, (): Dynamic => setIsOpen(true)),
    iconElement: Dynamic =
      typeof icon == "string" ? (
        icon
      ) : (
        <Icon
          customIcon={icon}
          size={"auto"}
          className={"shrink-0"}
        />
      ),
    trigger: Dynamic =
      readout === undefined ? (
        <SessionStripButton
          data-testid={testid}
          icon={iconElement}
          title={title}
          aria-label={title}
          className={isOpen ? SessionStripPopupsClassNames : undefined}
          disabled={isDisabled}
          {...keyedProps}
        />
      ) : (
        <SessionStripButton
          data-testid={testid}
          icon={iconElement}
          title={title}
          aria-label={title}
          className={isOpen ? SessionStripPopupsClassNames : undefined}
          disabled={isDisabled}
          chevron={true}
          {...keyedProps}
        >
          <span className={"tabular-nums"}>{readout}</span>
        </SessionStripButton>
      );
  return (
    <span className={"relative inline-flex"}>
      <EditorPopover
        open={isOpen}
        onOpen={(): Dynamic => setIsOpen(true)}
        onClose={(): Dynamic => setIsOpen(false)}
        trigger={trigger}
        align={align}
        focusOnOpen={usesKeyboard}
        initialFocus={initialFocus}
        keepFocus={true}
        padding={"none"}
        className={joinClassNames("p-2", popoverClassName)}
        editsAreUndoSteps={editsAreUndoSteps}
      >
        <div
          ref={bodyRef}
          data-session-strip={""}
          onKeyDownCapture={preventInputEnterSubmit}
        >
          {typeof children == "function" ? (children((): Dynamic => setIsOpen(false))) : (children)}
        </div>
      </EditorPopover>
    </span>
  );
}
function SessionChoicePopup({
  testid: testid,
  title: title,
  face: face,
  value: selectedValue,
  options: choices,
  onChange: onChange,
  disabled: isDisabled,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <SessionPopup
      testid={testid}
      title={title}
      icon={face}
      popoverClassName={"min-w-0!"}
      disabled={isDisabled}
    >
      {(closePopup?: Dynamic): Dynamic => (
        <div
          role={"group"}
          aria-label={title}
          data-icon-row={""}
          className={"flex items-center gap-1"}
          onKeyDown={pickerSearchKeyHandler("button", {
            across: true,
          })}
        >
          {choices.map(
            (choice?: Dynamic): Dynamic =>
              (() => {
                const ChoiceButton = SessionStripButton_r;
                const choiceProps = {
                  "data-testid": testid
                    ? testid + "-" + choice.value
                    : undefined,
                  icon:
                    typeof choice.icon == "string" ? (
                      choice.icon
                    ) : (
                      <Icon
                        customIcon={choice.icon}
                        size={"auto"}
                        className={"shrink-0"}
                      />
                    ),
                  title: choice.disabledReason ?? choice.label,
                  "aria-label": choice.label,
                  "aria-pressed":
                    choice.disabledReason !== undefined
                      ? undefined
                      : choice.value === selectedValue,
                  disabled: choice.disabledReason !== undefined,
                  onClick: (): Dynamic => {
                    closePopup();
                    choice.value !== selectedValue && onChange(choice.value);
                  },
                } as const;
                const choiceKey = choice.value;
                return <ChoiceButton key={choiceKey} {...choiceProps} />;
              })(),
          )}
        </div>
      )}
    </SessionPopup>
  );
}
function SessionTypographyPopup({
  testid: testid,
  value: selectedValue,
  chipText: chipText,
  options: typographyOptions,
  onChange: onChange,
  custom: custom,
  systemHeader: systemHeader,
}: Dynamic): Dynamic {
  useUiLocale();
  let [isOpen, setIsOpen]: Dynamic = (0,
    reactForSessionTypographyPopup.useState)(false),
    {
      byKey: usesKeyboard,
      body: bodyRef,
      initialFocus: initialFocus,
      keyed: keyedProps,
    }: Dynamic = useSessionPopupFocus(isOpen, (): Dynamic => setIsOpen(true)),
    hasStylePicker: Dynamic = typographyOptions.length > 0 || systemHeader != null,
    [styleMode, setStyleMode]: Dynamic = (0,
    reactForSessionTypographyPopup.useState)("system"),
    activeMode: Dynamic = hasStylePicker ? styleMode : "custom",
    isSearchable: Dynamic =
      typographyOptions.some((option?: Dynamic): Dynamic => option.group !== undefined) ||
      typographyOptions.length > PropertiesNumericInputLimit,
    [searchText, setSearchText]: Dynamic = (0,
    reactForSessionTypographyPopup.useState)("");
  !isOpen && searchText !== "" && setSearchText("");
  let searchQuery: Dynamic = isSearchable ? searchText.trim().toLowerCase() : "",
    filteredOptions: Dynamic = typographyOptions.filter(
      (option?: Dynamic): Dynamic =>
        pickerSearchMatches(
          searchQuery,
          option.text,
          option.hint,
          option.subgroup,
          option.group,
        ),
    ),
    rowCount: Dynamic = typographyOptions.reduce(
      (count?: Dynamic, option?: Dynamic, index?: Dynamic): Dynamic => {
        let startsGroup: Dynamic =
          option.group !== undefined &&
          option.group !== typographyOptions[index - 1]?.group;
        return (
          count +
          1 +
          (startsGroup ? 1 : 0) +
          (option.subgroup !== undefined &&
          (startsGroup || option.subgroup !== typographyOptions[index - 1]?.subgroup)
            ? 1
            : 0)
        );
      },
      0,
    ),
    planHeight: Dynamic = hasStylePicker
      ? Math.max(
          SessionStripPopupsConstant,
          52 +
            (systemHeader != null ? 40 : 0) +
            (isSearchable ? 36 : 0) +
            Math.min(384, 32 * rowCount),
        )
      : undefined,
    trigger: Dynamic = (
      <SessionStripButton
        data-testid={testid}
        data-mc-bordered={""}
        title={uiMessage("inspector.popups.textStyle")}
        chevron={true}
        className={joinClassNames(
          "rounded-lg border border-border-line px-2",
          isOpen && SessionStripPopupsClassNames,
        )}
        {...keyedProps}
      >
        <span className={"inline-flex items-center gap-1.5"}>
          <EditorIcon
            name={"TextAa"}
            size={13}
            className={"text-muted"}
          />
          <span className={"min-w-14 max-w-40 truncate text-left"}>
            {chipText}
          </span>
        </span>
      </SessionStripButton>
    );
  return (
    <span className={"relative inline-flex"}>
      <EditorPopover
        open={isOpen}
        onOpen={(): Dynamic => setIsOpen(true)}
        onClose={(): Dynamic => setIsOpen(false)}
        trigger={trigger}
        align={"left"}
        focusOnOpen={usesKeyboard}
        initialFocus={initialFocus}
        keepFocus={true}
        padding={"none"}
        planHeight={planHeight}
        className={"w-60 p-2 pointer-coarse:w-auto pointer-coarse:min-w-60"}
      >
        <div
          ref={bodyRef}
          data-session-strip={""}
          onKeyDownCapture={preventInputEnterSubmit}
        >
          {hasStylePicker ? (<ColorHexInput value={activeMode} onChange={setStyleMode} />) : (null)}
          {activeMode === "system" ? (<div role={"group"} aria-label={uiMessage("inspector.popups.textStyle")}>
              {systemHeader}
              <div
                data-search-scope={""}
                onKeyDown={pickerSearchKeyHandler(
                  '[data-kit="MenuItem"]',
                )}
              >
                {isSearchable ? (<PickerSearchInput
                    value={searchText}
                    onChange={setSearchText}
                    label={searchStylesLabel}
                    rowSelector={'[data-kit="MenuItem"]'}
                    onEnterIndex={(): Dynamic =>
                      pickerSearchInitialIndex(
                        searchQuery,
                        filteredOptions.map((option?: Dynamic): Dynamic => option.text),
                      )
                    }
                    data-testid={testid ? testid + "-search" : undefined}
                  />) : (null)}
                {filteredOptions.length === 0 ? (<p
                    role={"status"}
                    className={"px-2 py-1 text-footnote text-muted"}
                  >
                    {noMatchesLabel}
                  </p>) : (null)}
                <div
                  className={
                    "kit-scrollbar max-h-[min(24rem,max(6rem,calc(var(--available-height,100vh)_-_8rem)))] overflow-y-auto"
                  }
                >
                  {filteredOptions.map(
                    (option?: Dynamic, index?: Dynamic): Dynamic => {
                      let startsGroup: Dynamic =
                          option.group !== undefined &&
                          option.group !== filteredOptions[index - 1]?.group,
                        startsSubgroup: Dynamic =
                          option.subgroup !== undefined &&
                          (startsGroup ||
                            option.subgroup !==
                              filteredOptions[index - 1]?.subgroup);
                      return (() => {
                        const OptionFragment =
                          reactForSessionTypographyPopup.Fragment;
                        const optionProps = {
                          children: [
                            startsGroup ? (
                              <PickerListHeader
                                text={option.group}
                                title={true}
                              />
                            ) : null,
                            startsSubgroup ? (
                              <PickerListHeader
                                text={option.subgroup}
                              />
                            ) : null,
                            <EditorMenuItem
                              checked={option.value === selectedValue}
                              title={option.title}
                              data-testid={
                                testid
                                  ? testid + "-" + option.value
                                  : undefined
                              }
                              onClick={(): Dynamic => {
                                setIsOpen(false);
                                option.value !== selectedValue &&
                                  onChange(option.value);
                              }}
                            >
                              <span
                                className={
                                  "flex min-w-0 flex-1 items-center gap-0.5"
                                }
                                style={{
                                  lineHeight: "27px",
                                }}
                              >
                                <span
                                  className={
                                    "flex min-w-0 overflow-x-clip pe-1 [font-variation-settings:normal]"
                                  }
                                >
                                  {option.label}
                                </span>
                                {option.hint !== undefined ? (<span
                                    className={
                                      "shrink-0 text-footnote text-muted"
                                    }
                                  >
                                    {option.hint}
                                  </span>) : (null)}
                              </span>
                            </EditorMenuItem>,
                          ],
                        } as const;
                        const optionKey = option.value;
                        return <OptionFragment key={optionKey} {...optionProps} />;
                      })();
                    },
                  )}
                </div>
              </div>
            </div>) : ("body" in custom ? (<div
              className={"flex flex-col gap-2"}
              aria-label={uiMessage("inspector.popups.customTextStyle")}
            >
              {custom.body}
            </div>) : (<CustomTypographyEditor c={custom} />))}
        </div>
      </EditorPopover>
    </span>
  );
}
function CustomTypographyEditor({ c: c }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <div className={"flex flex-col gap-2"} aria-label={uiMessage("inspector.popups.customTextStyle")}>
      <div className={"flex"}>
        <PropertySelect
          aria-label={uiMessage("inspector.popups.font")}
          items={c.family.options}
          value={c.family.value}
          onChange={c.family.onChange}
          searchable={c.family.searchable}
          searchLabel={"Search fonts"}
          onOpenChange={c.family.onOpenChange}
          popupAttrs={SessionStripPopupsDataSessionStripConfig}
        />
      </div>
      <div className={"grid grid-cols-2 gap-2"}>
        <PropertySelect
          aria-label={uiMessage("inspector.popups.weight")}
          items={includeCurrentFontVariant(c.face.faces, c.face)}
          value={fontVariantKey(c.face.weight, c.face.italic)}
          onOpenChange={c.face.onOpenChange}
          onChange={(variantKey?: Dynamic): Dynamic => {
            let variant: Dynamic = parseFontVariantKey(variantKey);
            variant !== undefined &&
              c.face.onChange(variant.weight, variant.italic);
          }}
          popupAttrs={SessionStripPopupsDataSessionStripConfig}
        />
        <NumericInput
          aria-label={uiMessage("inspector.popups.fontSize")}
          unit={"px"}
          title={uiMessage("inspector.popups.fontSizePxClearItForTheStyleSOwn")}
          clearable={true}
          {...c.size}
        />
        <NumericInput
          prefix={
            <PropertyOptionIcon icon={LineHeightValue} />
          }
          aria-label={uiMessage("inspector.popups.lineHeight")}
          title={uiMessage("inspector.popups.lineHeightTheFontSize")}
          clearable={true}
          {...c.lineHeight}
          step={c.lineHeight.step ?? 0.05}
        />
        <NumericInput
          prefix={<PropertyOptionIcon icon={"LetterSpacing"} />}
          aria-label={uiMessage("inspector.popups.letterSpacing")}
          unit={"px"}
          title={uiMessage("inspector.popups.letterSpacingPx")}
          clearable={true}
          {...c.letterSpacing}
          step={c.letterSpacing.step ?? 0.5}
        />
      </div>
    </div>
  );
}
function SessionActionsPopover(source?: Dynamic): Dynamic {
  useUiLocale();
  let [isOpen, setIsOpen]: Dynamic = (0,
    reactForSessionTypographyPopup.useState)(false),
    onOpenChangeRef: Dynamic = (0, reactForSessionTypographyPopup.useRef)(
      source.onOpenChange,
    );
  onOpenChangeRef.current = source.onOpenChange;
  (0, reactForSessionTypographyPopup.useEffect)(
    (): Dynamic => onOpenChangeRef.current?.(isOpen),
    [isOpen],
  );
  let {
      byKey: usesKeyboard,
      body: bodyRef,
      initialFocus: initialFocus,
      keyed: keyedProps,
    }: Dynamic = useSessionPopupFocus(isOpen, (): Dynamic => setIsOpen(true)),
    hasCustomSwatches: Dynamic =
      source.custom !== undefined &&
      source.swatches.some(
        (swatch?: Dynamic): Dynamic =>
          swatch.empty !== true && swatch.name !== "default",
      ),
    trigger: Dynamic = (
      <SessionStripButton
        data-testid={source.testid}
        title={source.title}
        aria-label={source.title}
        icon={<SessionColorSwatch css={source.paint} />}
        className={isOpen ? SessionStripPopupsClassNames : undefined}
        {...keyedProps}
      />
    );
  return (
    <span className={"relative inline-flex"}>
      <EditorPopover
        open={isOpen}
        onOpen={(): Dynamic => setIsOpen(true)}
        onClose={(): Dynamic => setIsOpen(false)}
        trigger={trigger}
        align={"left"}
        focusOnOpen={usesKeyboard}
        initialFocus={initialFocus}
        keepFocus={true}
        padding={"none"}
        planHeight={
          hasCustomSwatches || source.kind !== undefined
            ? ColorPickerConstant
            : undefined
        }
        className={ColorPickerLabel}
        editsAreUndoSteps={source.editsAreUndoSteps}
      >
        <div
          ref={bodyRef}
          data-session-strip={""}
          onKeyDownCapture={preventInputEnterSubmit}
          onMouseDown={SessionStripPopupsTarget}
        >
          <ColorSwatchPicker
            testid={source.testid}
            title={source.title}
            swatches={source.swatches}
            current={source.value}
            onSwatch={(swatchName?: Dynamic): Dynamic => {
              source.onSwatch(swatchName);
              let contrastBase: Dynamic = source.custom?.contrast;
              if (
                contrastBase === undefined ||
                source.custom?.quietSwatch === true
              )
                return;
              let swatchColor: Dynamic = source.swatches.find(
                (swatch?: Dynamic): Dynamic => swatch.name === swatchName,
              )?.color;
              swatchColor !== undefined &&
                announce((): Dynamic => {
                  let contrastResults: Dynamic = evaluateColorContrast(
                    swatchColor,
                    contrastBase,
                  );
                  return contrastResults === undefined
                    ? null
                    : summarizeContrastResults(contrastResults).spoken;
                });
            }}
            onPicked={(): Dynamic => setIsOpen(false)}
            fold={true}
            color={
              source.custom !== undefined
                ? {
                    value: source.custom.seed,
                    unset: source.custom.unset,
                    opaque: source.custom.opaque,
                    onChange: source.custom.onChange,
                    onPickEnd: source.custom.onPickEnd,
                    contrast: source.custom.contrast,
                  }
                : undefined
            }
            kind={source.kind}
            face={source.face}
          />
        </div>
      </EditorPopover>
    </span>
  );
}
function SessionColorSwatch({ css: css }: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span
      aria-hidden={"true"}
      data-swatch-dot={""}
      className={joinClassNames(
        "inline-block h-4 w-4 shrink-0 rounded-[4px] border border-border-strong pointer-coarse:h-5 pointer-coarse:w-5",
        css === undefined && "border-dashed",
      )}
      style={colorWellStyle(css)}
    />
  );
}
function isScrollbarPointer(event?: Dynamic): Dynamic {
  let target: Dynamic = event.target;
  return (
    target.scrollHeight > target.clientHeight &&
    event.nativeEvent.offsetX >= target.clientWidth
  );
}
function SessionImageReplaceButton({
  src: src,
  title: title,
  onClick: onClick,
  disabled: isDisabled,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <SessionStripButton
      data-testid={"frame-image-replace"}
      title={title}
      aria-label={title}
      disabled={isDisabled}
      onClick={onClick}
      className={"px-1"}
    >
      {src !== undefined ? (<img
          alt={""}
          aria-hidden={"true"}
          src={src}
          draggable={false}
          style={{
            background: SessionStripPopupsLabel,
          }}
          className={
            "h-5 w-5 shrink-0 rounded-[4px] border border-border-strong object-cover pointer-coarse:h-7 pointer-coarse:w-7"
          }
        />) : (<span
          aria-hidden={"true"}
          className={
            "inline-block h-5 w-5 rounded-[4px] border border-dashed border-border-strong pointer-coarse:h-7 pointer-coarse:w-7"
          }
        />)}
    </SessionStripButton>
  );
}
export {
  CustomTypographyEditor,
  isScrollbarPointer,
  jsxSessionStripPopups,
  SessionActionsPopover,
  SessionChoicePopup,
  SessionColorSwatch,
  SessionImageReplaceButton,
  SessionPopup,
  SessionStripPopupsClassNames,
  SessionStripPopupsClosest,
  SessionStripPopupsConstant,
  SessionStripPopupsDataSessionStripConfig,
  SessionStripPopupsHandler,
  SessionStripPopupsItems,
  SessionStripPopupsJoinValue,
  enabledPopupControlSelector,
  SessionStripPopupsLabel,
  SessionStripPopupsTarget,
  SessionTypographyPopup,
  useSessionPopupFocus,
};
export function installEditorSessionStripPopups(): () => void {
  return () => {
    jsxSessionStripPopups = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    SessionStripPopupsClassNames = "bg-fill-ghost-hover";
    SessionStripPopupsConstant = 180;
    SessionStripPopupsClosest = (target?: Dynamic): Dynamic =>
      target instanceof Element &&
      target.closest(editableElementSelector) !== null;
    SessionStripPopupsDataSessionStripConfig = {
      "data-session-strip": "popup",
    };
    SessionStripPopupsItems = [
      '[data-kit="MenuItem"]',
      "[data-swatch]",
      "[data-icon-row] button",
    ];
    SessionStripPopupsJoinValue = SessionStripPopupsItems.map(
      (selector?: Dynamic): Dynamic =>
        selector + '[aria-pressed="true"]:not(:disabled)',
    ).join(", ");
    enabledPopupControlSelector = SessionStripPopupsItems.map(
      (selector?: Dynamic): Dynamic => selector + ":not(:disabled)",
    ).join(", ");
    SessionStripPopupsHandler = (root?: Dynamic): Dynamic =>
      root?.querySelector(SessionStripPopupsJoinValue) ??
      root?.querySelector(enabledPopupControlSelector) ??
      null;
    SessionStripPopupsTarget = (event?: Dynamic): Dynamic => {
      !SessionStripPopupsClosest(event.target) &&
        !isScrollbarPointer(event) &&
        event.preventDefault();
    };
    SessionStripPopupsLabel =
      "repeating-conic-gradient(#a8a6a0 0% 25%, #d2d0ca 0% 50%) 0 / 8px 8px padding-box";
  };
}
