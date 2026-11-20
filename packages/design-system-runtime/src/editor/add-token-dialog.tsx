import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as JsxRuntime from "react/jsx-runtime";
import type {
  AddTokenDialogRuntime,
  AddTokenDialogProps,
  AddTokenRequest,
  AddDialogFieldProps,
  ScalarTokenKind,
  NewTypeStyle,
} from "../contracts/application";
import { loadJsxNamespace } from "../dependencies";
import { reactDesignSystemEditors } from "./claude-delivery";
import { normalizeThemeId } from "./colors";
import { commentTargetProps, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { cssLengthInputStep, MAX_EDITABLE_CSS_LENGTH, parseEditableCssLength } from "./css-length-input";
import { validateTokenRename } from "./editable-name";
import { isComposingEvent } from "./markdown-toolbar";
import { BLOCK_FILE_DROP_HANDLERS, ShadowValueEditor } from "./shadows";
import { cssLengthPreviewPixels } from "./token-scales";
import { TypeStyleFields, typeStylePreviewStyle } from "./typography";
import { normalizeTokenName, validateNewFontFamily } from "../model/token-commands";
import { colorAliasTarget, isColorLiteral, isColorOrAlias, isSafeBoxShadow, MAX_TOKEN_LABEL_LENGTH, normalizeBoxShadow, normalizeColorEditorInput, normalizeCssLength, normalizeLineHeight, normalizeScalarTokenValue } from "../model/tokens";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { Dialog } from "../ui/dialog";
import { FieldComponents } from "../ui/field";
import { TextLink } from "../ui/links";
import { PropertyNumberInput } from "../ui/number-controls";
import { CdsRoot } from "../ui/overlays";
import { ColorTextPropertyRow } from "../ui/property-rows";
import { Select } from "../ui/select";
import { TextArea } from "../ui/text-area";
import { TextInput } from "../ui/text-input";

var jsxAddTokenDialog: typeof JsxRuntime;
var NEW_TOKEN_GROUP_SENTINEL: string;
var TOKEN_LENGTH_VALIDATION_MESSAGES: Record<ScalarTokenKind, string>;
var PASSWORD_MANAGER_IGNORE_PROPS: Record<string, string>;
var formatNumberWithUnit: (value: number, unit: string) => string;
var NUMBER_INPUT_SELECTOR: string;
var stripAddDialogNamespace: (name: string, namespace: string) => string;
var ADD_DIALOG_ROW_CLASS_NAME: string;
var ADD_DIALOG_HELP_CLASS_NAME: string;
function addTokenDialogTitle(request: AddTokenRequest): string {
  switch (request.kind) {
    case "color":
      return uiMessage("design-system.addTokenDialog.newColor");
    case "type":
      return uiMessage("design-system.addTokenDialog.newTypeStyle");
    case "shadow":
      return uiMessage("design-system.addTokenDialog.newShadow");
    default:
      return uiMessage("design-system.addTokenDialog.new2") + request.label;
  }
}
function normalizeNewTokenName(rawName: string): string {
  return normalizeTokenName(rawName).replace(/\s+/g, "-");
}
function validateNewColorValue(
  rawColor: string,
  allowEmpty: boolean,
  names: string,
  tokenName: ReadonlySet<string>,
) {
  let normalizedColor = normalizeNewColorValue(rawColor);
  if (normalizedColor === "") {
    if (allowEmpty) {
      return null;
    } else {
      return uiMessage("design-system.addTokenDialog.colorRequired");
    }
  }
  if (!isColorOrAlias(normalizedColor)) {
    return uiMessage("design-system.addTokenDialog.notAColorTryRrggbb", { token: "{token}" });
  }
  let aliasTarget = colorAliasTarget(normalizedColor);
  if (aliasTarget === undefined) {
    return null;
  }
  if (aliasTarget === names) {
    return uiMessage("design-system.addTokenDialog.selfAlias");
  }
  if (!tokenName.has(aliasTarget)) {
    return uiMessage("design-system.addTokenDialog.namesNoColorToken");
  }
  return null;
}
function normalizeNewColorValue(rawColorValue: string): string {
  return normalizeColorEditorInput(rawColorValue);
}
function appendDefaultLengthUnit(rawLength: string): string {
  let trimmedLength = rawLength.trim();
  if (/^-?\d{1,4}(?:\.\d{1,6})?$/.test(trimmedLength) && trimmedLength !== "0") {
    return trimmedLength + "px";
  } else {
    return trimmedLength;
  }
}
function validateNewTokenValue(
  kind: ScalarTokenKind,
  rawValue: string,
): string | undefined {
  return normalizeScalarTokenValue(
    kind,
    kind === "spacing" || kind === "radius"
      ? appendDefaultLengthUnit(rawValue)
      : rawValue.trim(),
  );
}
function validateNewTypeField(
  field: "fontSize" | "lineHeight" | "letterSpacing",
  rawTypeValue: string,
): string | null {
  let trimmedTypeValue = rawTypeValue.trim();
  switch (field) {
    case "fontSize":
      if (
        normalizeCssLength(
          appendDefaultLengthUnit(trimmedTypeValue),
          false,
        ) === undefined
      ) {
        return uiMessage("design-system.addTokenDialog.notASizeTry16");
      } else {
        return null;
      }
    case "lineHeight":
      if (normalizeLineHeight(trimmedTypeValue) === undefined) {
        return uiMessage("design-system.addTokenDialog.notALineHeightTry");
      } else {
        return null;
      }
    case "letterSpacing":
      if (
        trimmedTypeValue === "" ||
        normalizeCssLength(
          appendDefaultLengthUnit(trimmedTypeValue),
          false,
        ) !== undefined
      ) {
        return null;
      } else {
        return uiMessage("design-system.addTokenDialog.notALengthTry0");
      }
  }
}
function ignorePasswordManagerForInput(
  element: HTMLInputElement | null,
): void {
  if (element === null) {
    return;
  }
  for (let [value, ignoredProperty] of Object.entries(PASSWORD_MANAGER_IGNORE_PROPS)) {
    element.setAttribute(
      value === "autoComplete" ? "autocomplete" : value,
      ignoredProperty,
    );
  }
}
function AddDialogField({
  label: label,
  hint = null,
  testid: testid,
  knob: knob,
  top = false,
  children: children,
}: AddDialogFieldProps) {
  useUiLocale();
  return (
    <FieldComponents.Root
      invalid={hint !== null || undefined}
      className={ADD_DIALOG_ROW_CLASS_NAME}
      style={
        top
          ? {
              alignItems: "start",
            }
          : undefined
      }
      data-testid={testid}
      data-knob={knob}
    >
      {[<FieldComponents.Label
          className={ADD_DIALOG_HELP_CLASS_NAME + (top ? " pt-[5px]" : "")}
          title={label}
        >
          {label}
        </FieldComponents.Label>, <div className={"flex min-w-0 items-center gap-1"}>{children}</div>, hint !== null ? (
          <FieldComponents.Error
            match={true}
            className={"col-start-2"}
          >
            {hint}
          </FieldComponents.Error>
        ) : null]}
    </FieldComponents.Root>
  );
}
function AddDialogFieldGroup({
  label: label,
  testid: testid,
  children: children,
}: AddDialogFieldProps) {
  useUiLocale();
  return (
    <div className={ADD_DIALOG_ROW_CLASS_NAME} data-testid={testid}>
      {[<span className={ADD_DIALOG_HELP_CLASS_NAME} title={label}>
          {label}
        </span>, <div className={"flex min-w-0 items-center gap-1"}>{children}</div>]}
    </div>
  );
}
function AddTokenDialog({
  req: req,
  onSubmit: onSubmit,
  onClose: onClose,
  "data-testid": dataTestid = "ds-add-dialog",
}: AddTokenDialogProps) {
  useUiLocale();
  let ref = reactDesignSystemEditors.useRef<HTMLFormElement | null>(
      null,
    ),
    nameInputRef = reactDesignSystemEditors.useRef<HTMLInputElement | null>(
      null,
    ),
    [value, stepCounter] = reactDesignSystemEditors.useState(0);
  reactDesignSystemEditors.useEffect(() => {
    if (value === 0) {
      return;
    }
    let focusTimeout = setTimeout(() => {
      let current = nameInputRef.current;
      current?.focus();
      current?.setSelectionRange(current.value.length, current.value.length);
    }, 50);
    return () => clearTimeout(focusTimeout);
  }, [value]);
  let tokenSets =
      req.kind === "color"
        ? req.groups
        : req.kind !== "type" && req.kind !== "shadow"
          ? (req.groups ?? [])
          : [],
    isEmptyTypeSet = req.kind === "type" && req.sets.length === 0,
    defaultGroupName =
      req.kind === "color"
        ? req.namespace
        : req.kind !== "type" && req.kind !== "shadow"
          ? (req.namespace ?? "")
          : "",
    [selectedGroup, setSelectedGroup] = reactDesignSystemEditors.useState(
      req.kind === "color"
        ? req.group
        : req.kind === "type"
          ? isEmptyTypeSet
            ? NEW_TOKEN_GROUP_SENTINEL
            : req.set
          : req.kind !== "shadow"
            ? (req.group ?? "")
            : "",
    ),
    [themeId, setThemeId] = reactDesignSystemEditors.useState(
      isEmptyTypeSet ? "Styles" : "",
    ),
    [fontFamily, setFontFamily] = reactDesignSystemEditors.useState<
      string | null
    >(null),
    fontFamilyRef = reactDesignSystemEditors.useRef<string | null>(null),
    callback = (fontFamilyValue: string | null) => {
      fontFamilyRef.current = fontFamilyValue;
      setFontFamily(fontFamilyValue);
    },
    fontValidationError =
      fontFamily === null || req.kind !== "type"
        ? null
        : validateNewFontFamily(fontFamily, req.families),
    [showAdvanced, setShowAdvanced] = reactDesignSystemEditors.useState(false),
    [tokenName, setTokenName] = reactDesignSystemEditors.useState(req.name),
    [isTypeToken, setIsTypeToken] = reactDesignSystemEditors.useState(false),
    initialNameRef = reactDesignSystemEditors.useRef(req.name),
    seedForGroup = (groupKey: string, themeKey: string) => {
      let normalizedNamespace = stripAddDialogNamespace(
        normalizeThemeId(themeKey),
        defaultGroupName,
      );
      if (req.kind === "color" && groupKey === NEW_TOKEN_GROUP_SENTINEL) {
        if (normalizedNamespace === "") {
          return "";
        } else {
          return req.seedFor(normalizedNamespace);
        }
      }
      return tokenSets.find((tokenSet) => tokenSet.key === groupKey)?.seed ?? "";
    },
    updateTokenName = (groupKey: string, themeKey: string) => {
      if (req.kind === "type" || tokenName !== initialNameRef.current) {
        return;
      }
      let nextTokenName = seedForGroup(groupKey, themeKey);
      initialNameRef.current = nextTokenName;
      setTokenName(nextTokenName);
    },
    handleGroupChange = (groupKey: string) => {
      setSelectedGroup(groupKey);
      updateTokenName(groupKey, themeId);
      requestAnimationFrame(() => {
        let groupInput =
          groupKey === NEW_TOKEN_GROUP_SENTINEL
            ? ref.current?.querySelector<HTMLInputElement>(
                '[data-field="fresh"]',
              )
            : nameInputRef.current;
        groupInput?.focus();
        if (
          groupInput !== null &&
          groupInput !== undefined &&
          groupInput === nameInputRef.current
        ) {
          groupInput.setSelectionRange(
            groupInput.value.length,
            groupInput.value.length,
          );
        }
      });
    },
    [description, setDescription] = reactDesignSystemEditors.useState(""),
    [colorValues, setColorValues] = reactDesignSystemEditors.useState<
      Record<string, string>
    >(() => {
      if (req.kind === "color" || req.kind === "shadow") {
        let initialThemeId = req.themes[0]?.id;
        if (initialThemeId !== undefined) {
          return {
            [initialThemeId]: req.value,
          };
        } else {
          return {};
        }
      }
      return {};
    }),
    [tokenValue, setTokenValue] = reactDesignSystemEditors.useState(
      req.kind === "type" || req.kind === "color" || req.kind === "shadow"
        ? ""
        : req.value,
    ),
    [typeStyle, setTypeStyle] =
      reactDesignSystemEditors.useState<NewTypeStyle>(
        req.kind === "type"
          ? {
              ...req.style,
              letterSpacing:
                req.style.letterSpacing === "0"
                  ? ""
                  : req.style.letterSpacing,
            }
          : {
              family: "",
              fontSize: "16px",
              lineHeight: "1.5",
              fontWeight: "400",
              fontStyle: "normal",
              letterSpacing: "",
            },
      ),
    typeStyleRef = reactDesignSystemEditors.useRef({
      style: typeStyle,
      value: tokenValue,
    }),
    updateTypeStyle = (styleUpdater: (style: NewTypeStyle) => NewTypeStyle) => {
      typeStyleRef.current = {
        ...typeStyleRef.current,
        style: styleUpdater(typeStyleRef.current.style),
      };
      setTypeStyle(typeStyleRef.current.style);
    },
    updateTypeField = (fieldValue: React.SetStateAction<string>) => {
      typeStyleRef.current = {
        ...typeStyleRef.current,
        value:
          typeof fieldValue === "function" ? fieldValue(typeStyleRef.current.value) : fieldValue,
      };
      setTokenValue(typeStyleRef.current.value);
    };
  reactDesignSystemEditors.useEffect(() => {
    let focusFrame = requestAnimationFrame(() => {
      let focusableElement =
        selectedGroup === NEW_TOKEN_GROUP_SENTINEL && !isEmptyTypeSet
          ? (ref.current?.querySelector<HTMLInputElement>(
              '[data-field="fresh"]',
            ) ?? nameInputRef.current)
          : nameInputRef.current;
      if (focusableElement === null) {
        return;
      }
      focusableElement.focus();
      focusableElement.setSelectionRange(focusableElement.value.length, focusableElement.value.length);
    });
    return () => cancelAnimationFrame(focusFrame);
  }, []);
  let isNewGroup = selectedGroup === NEW_TOKEN_GROUP_SENTINEL,
    selectedGroupName =
      req.kind === "type"
        ? themeId.replace(/\s+/g, " ").trim()
        : stripAddDialogNamespace(
            normalizeThemeId(themeId),
            defaultGroupName,
          ),
    normalizedGroupName = selectedGroupName.toLowerCase(),
    groupNameError =
      req.kind === "color"
        ? tokenSets.some(
            (tokenSet) =>
              tokenSet.key.toLowerCase() === normalizedGroupName ||
              tokenSet.label.toLowerCase() === normalizedGroupName,
          )
        : req.kind === "type"
          ? req.sets.some((groupName) => groupName.toLowerCase() === normalizedGroupName)
          : false,
    groupKindLabel = req.kind === "type" ? "set" : "group",
    missingGroupName = isNewGroup && selectedGroupName === "",
    groupNameValidation = !isNewGroup
      ? null
      : missingGroupName
        ? showAdvanced
          ? uiMessage("design-system.addTokenDialog.a") + groupKindLabel + " needs a name."
          : null
        : groupNameError
          ? uiMessage("design-system.addTokenDialog.thereIsAlreadyA") + groupKindLabel + " called " + selectedGroupName + "."
          : null,
    normalizedTokenName = normalizeNewTokenName(tokenName),
    invalidTokenName = normalizedTokenName === "" || /[-.]$/.test(normalizedTokenName),
    nameErrorRequired = invalidTokenName && !isTypeToken,
    nameError: React.ReactNode = nameErrorRequired
      ? null
      : (validateTokenRename(normalizedTokenName, "", req.taken) ??
        (invalidTokenName ? uiMessage("design-system.addTokenDialog.finishTheNameEG") + normalizedTokenName + "500." : null)),
    nameAction = nameErrorRequired || nameError !== null ? null : buildNameAction();
  if (nameAction !== null) {
    let runNameAction = () => {
      nameAction.run();
      stepCounter((count) => count + 1);
    };
    nameError =
      nameAction.verb === "" ? (
        nameAction.say
      ) : (
        <jsxAddTokenDialog.Fragment>
          {[nameAction.say, " ", <TextLink
              onClick={runNameAction}
              data-testid={dataTestid + "-regroup"}
            >
              {nameAction.verb}
            </TextLink>]}
        </jsxAddTokenDialog.Fragment>
      );
  }
  function buildNameAction(): {
    say: string;
    verb: string;
    run(): void;
  } | null {
    let groupPrefix = defaultGroupName,
      quotedTokenName = "“" + normalizedTokenName + "”";
    if (groupPrefix !== "" && !normalizedTokenName.startsWith(groupPrefix)) {
      let suffixAfterPrefix = normalizedTokenName.toLowerCase().startsWith(groupPrefix.toLowerCase())
        ? normalizedTokenName.slice(groupPrefix.length)
        : normalizedTokenName;
      return {
        say:
          uiMessage("design-system.addTokenDialog.everyNameHereStartsWith") +
          groupPrefix +
          "; without it this one would regroup the card.",
        verb: uiMessage("design-system.addTokenDialog.startItWith") + groupPrefix,
        run: () => setTokenName(groupPrefix + suffixAfterPrefix),
      };
    }
    if (
      req.kind === "type" ||
      req.kind === "shadow" ||
      tokenSets.length === 0 ||
      groupNameValidation !== null ||
      missingGroupName
    ) {
      return null;
    }
    let effectiveGroup = isNewGroup ? selectedGroupName : selectedGroup,
      effectiveGroupKey =
        req.kind === "color"
          ? req.groupOf(normalizedTokenName)
          : (req.groupOf?.(normalizedTokenName) ?? selectedGroup);
    if (effectiveGroupKey === effectiveGroup) {
      return null;
    }
    if (
      groupPrefix !== "" &&
      normalizedTokenName.toLowerCase().startsWith((groupPrefix + groupPrefix).toLowerCase())
    ) {
      return {
        say: quotedTokenName + " has " + groupPrefix + " twice.",
        verb: uiMessage("design-system.addTokenDialog.use") + groupPrefix + normalizedTokenName.slice(2 * groupPrefix.length),
        run: () => setTokenName(groupPrefix + normalizedTokenName.slice(2 * groupPrefix.length)),
      };
    }
    let groupPrefixLabel = isNewGroup
        ? selectedGroupName
        : (tokenSets.find((tokenSet) => tokenSet.key === selectedGroup)?.label ?? selectedGroup),
      matchingTokenSet = tokenSets.find((tokenSet) => tokenSet.key === effectiveGroupKey);
    if (matchingTokenSet !== undefined) {
      return {
        say:
          quotedTokenName +
          " would file under " +
          matchingTokenSet.label +
          ", not " +
          groupPrefixLabel +
          ".",
        verb: uiMessage("design-system.addTokenDialog.putItIn") + matchingTokenSet.label,
        run: () => setSelectedGroup(matchingTokenSet.key),
      };
    }
    if (req.kind !== "color") {
      return null;
    }
    if (
      effectiveGroupKey !== "" &&
      normalizeThemeId(effectiveGroupKey) === effectiveGroupKey &&
      stripAddDialogNamespace(effectiveGroupKey, groupPrefix) === effectiveGroupKey &&
      !tokenSets.some((tokenSet) => tokenSet.label.toLowerCase() === effectiveGroupKey)
    ) {
      return {
        say: quotedTokenName + " would start a new group, " + effectiveGroupKey + ".",
        verb: uiMessage("design-system.addTokenDialog.make") + effectiveGroupKey + " a new group",
        run: () => {
          setThemeId(effectiveGroupKey);
          setSelectedGroup(NEW_TOKEN_GROUP_SENTINEL);
        },
      };
    }
    let groupSuffix =
      effectiveGroup === ""
        ? groupPrefix !== ""
          ? groupPrefix + " and one plain word"
          : uiMessage("design-system.addTokenDialog.onePlainWord")
        : groupPrefix + effectiveGroup + "-";
    return {
      say:
        quotedTokenName +
        " would not file under " +
        groupPrefixLabel +
        " — names there start with " +
        groupSuffix +
        (effectiveGroupKey !== "" && normalizeThemeId(effectiveGroupKey) !== effectiveGroupKey
          ? " (group prefixes are lowercase letters, digits and single hyphens)"
          : "") +
        ".",
      verb: "",
      run: () => {},
    };
  }
  let colorTokenSets =
      req.kind === "color" || req.kind === "shadow" ? req.themes : [],
    primaryColorId = colorTokenSets[0]?.id,
    state: Record<string, string | null> = {};
  if (req.kind === "color") {
    for (let colorSet of colorTokenSets) {
      state[colorSet.id] = validateNewColorValue(
        colorValues[colorSet.id] ?? "",
        colorSet.id !== primaryColorId,
        normalizedTokenName,
        req.names,
      );
    }
  }
  if (req.kind === "shadow") {
    for (let colorSet of colorTokenSets) {
      let rawColorValue = (colorValues[colorSet.id] ?? "").trim();
      state[colorSet.id] =
        rawColorValue === ""
          ? colorSet.id === primaryColorId
            ? uiMessage("design-system.addTokenDialog.aBoxShadowIsNeeded")
            : null
          : normalizeBoxShadow(rawColorValue) === undefined
            ? uiMessage("design-system.addTokenDialog.notABoxShadowTry")
            : null;
    }
  }
  let colorValidationError =
      req.kind === "spacing" || req.kind === "radius" || req.kind === "extra"
        ? validateNewTokenValue(req.kind, tokenValue) === undefined
          ? TOKEN_LENGTH_VALIDATION_MESSAGES[req.kind]
          : null
        : null,
    validatedColorValues =
      req.kind === "type"
        ? {
            fontSize: validateNewTypeField("fontSize", typeStyle.fontSize),
            lineHeight: validateNewTypeField(
              "lineHeight",
              typeStyle.lineHeight,
            ),
            letterSpacing: validateNewTypeField(
              "letterSpacing",
              typeStyle.letterSpacing,
            ),
          }
        : null,
    isValueValid =
      groupNameValidation === null &&
      !missingGroupName &&
      !invalidTokenName &&
      nameError === null &&
      colorValidationError === null &&
      Object.values(state).every((stateValue) => stateValue === null) &&
      fontValidationError === null &&
      (validatedColorValues === null ||
        Object.values(validatedColorValues).every((validatedValue) => validatedValue === null)),
    readCssLength = (element: HTMLInputElement) => {
      let knobName = element.closest("[data-knob]")?.getAttribute("data-knob"),
        style = typeStyleRef.current.style;
      if (knobName === "size") {
        return style.fontSize;
      } else {
        if (knobName === "lh") {
          return style.lineHeight;
        } else {
          if (knobName === "ls") {
            if (style.letterSpacing.trim() === "") {
              return "0";
            } else {
              return style.letterSpacing;
            }
          } else {
            return typeStyleRef.current.value;
          }
        }
      }
    },
    validateCssLength = (element: HTMLInputElement, rawInput: string) => {
      let knob = readCssLength(element).trim();
      if (rawInput === "") {
        return false;
      }
      let numericValue = Number(rawInput.replace(/,/g, "")),
        parsedLength = parseEditableCssLength(knob)?.n;
      return (
        parsedLength !== undefined && Math.abs(numericValue - parsedLength) < 0.000000001
      );
    },
    commitCssLength = () => {
      let inputElement =
        ref.current?.querySelector<HTMLInputElement>(
          NUMBER_INPUT_SELECTOR + ":focus",
        ) ?? null;
      if (inputElement === null) {
        return true;
      }
      let inputValue = inputElement.value.trim();
      inputElement.blur();
      inputElement.focus();
      return validateCssLength(inputElement, inputValue);
    },
    handleSubmit = (event?: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      let focusedElement =
        ref.current?.querySelector<HTMLInputElement>(
          '[data-testid$="-family-custom"]:focus',
        ) ?? null;
      if (focusedElement !== null) {
        focusedElement.blur();
        if (
          fontFamilyRef.current !== null &&
          validateNewFontFamily(
            fontFamilyRef.current,
            req.kind === "type" ? req.families : {},
          ) !== null
        ) {
          return;
        }
      }
      if (!commitCssLength() || !isValueValid) {
        return;
      }
      let { style: current, value: currentValue } = typeStyleRef.current,
        descriptionValue = description
          .replace(
            /[ \t]+\n/g,
            `
`,
          )
          .trim();
      switch (req.kind) {
        case "color": {
          let normalizedValues: Record<string, string> = {};
          for (let colorSet of colorTokenSets) {
            let normalizedValue = normalizeNewColorValue(
              colorValuesRef.current[colorSet.id] ?? "",
            );
            if (normalizedValue !== "") {
              normalizedValues[colorSet.id] = normalizedValue;
            }
          }
          onSubmit({
            kind: "color",
            name: normalizedTokenName,
            group: isNewGroup ? selectedGroupName : selectedGroup,
            newGroup: isNewGroup,
            values: normalizedValues,
            usage: descriptionValue,
          });
          return;
        }
        case "shadow": {
          let normalizedValues: Record<string, string> = {};
          for (let colorSet of colorTokenSets) {
            let normalizedValue = (colorValuesRef.current[colorSet.id] ?? "").trim();
            if (
              normalizedValue !== "" &&
              normalizeBoxShadow(normalizedValue) !== undefined
            ) {
              normalizedValues[colorSet.id] = normalizedValue;
            }
          }
          onSubmit({
            kind: "shadow",
            name: normalizedTokenName,
            values: normalizedValues,
            usage: descriptionValue,
          });
          return;
        }
        case "type":
          onSubmit({
            kind: "type",
            name: normalizedTokenName,
            set: isNewGroup ? selectedGroupName : selectedGroup,
            newSet: isNewGroup,
            style: {
              ...current,
              fontSize: appendDefaultLengthUnit(current.fontSize),
              letterSpacing:
                current.letterSpacing.trim() === ""
                  ? "0"
                  : appendDefaultLengthUnit(current.letterSpacing),
              lineHeight: current.lineHeight.trim(),
            },
            ...(fontFamilyRef.current !== null
              ? {
                  font: fontFamilyRef.current,
                }
              : {}),
            usage: descriptionValue,
          });
          return;
        default:
          onSubmit({
            kind: req.kind,
            name: normalizedTokenName,
            value: validateNewTokenValue(req.kind, currentValue),
            usage: descriptionValue,
            ...(tokenSets.length > 0
              ? {
                  group: selectedGroup,
                }
              : {}),
          });
      }
    },
    handleKeyboard = (event: React.KeyboardEvent) => {
      if (
        event.key === "Enter" &&
        (event.metaKey || event.ctrlKey) &&
        !isComposingEvent(event)
      ) {
        event.preventDefault();
        handleSubmit();
      }
    },
    colorValuesRef = reactDesignSystemEditors.useRef(colorValues),
    updateColorValue = (tokenId: string, colorValue: string) => {
      colorValuesRef.current = {
        ...colorValuesRef.current,
        [tokenId]: colorValue,
      };
      setColorValues(colorValuesRef.current);
    },
    handleColorKeyboard = (event: React.KeyboardEvent) => {
      if (
        event.key !== "Enter" ||
        !event.isDefaultPrevented() ||
        event.metaKey ||
        event.ctrlKey ||
        isComposingEvent(event)
      ) {
        return;
      }
      if (
        !(event.target instanceof HTMLInputElement) ||
        !event.target.matches(NUMBER_INPUT_SELECTOR)
      ) {
        return;
      }
      if (validateCssLength(event.target, event.target.value.trim())) {
        handleSubmit();
      }
    },
    fieldPlaceholderValues: Record<string, string> = {
      color: selectedGroup === "" ? "e.g. white" : "e.g. brand-500",
      type: "e.g. heading-lg",
      spacing: "e.g. space-md",
      radius: "e.g. radius-md",
      shadow: "e.g. shadow-sm",
      extra: "e.g. token-1",
    },
    dialogFields = (
      <AddDialogField
        label={
          (
            {
              type: "Style name",
              color: "Color name",
            } as Record<string, string>
          )[req.kind] ?? (uiMessage("design-system.addTokenDialog.name"))
        }
        hint={nameError}
      >
        <TextInput
          {...PASSWORD_MANAGER_IGNORE_PROPS}
          ref={nameInputRef}
          className={"font-mono"}
          value={tokenName}
          placeholder={fieldPlaceholderValues[req.kind]}
          spellCheck={false}
          aria-label={uiMessage("design-system.addTokenDialog.name")}
          data-testid={dataTestid + "-name"}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => {
            setIsTypeToken(true);
            setTokenName(event.currentTarget.value);
          }}
        />
      </AddDialogField>
    ),
    renderField = (
      fieldName: string,
      items: {
        value: string;
        label: string;
      }[],
      fieldContext: string,
      required = true,
    ) => (
      <jsxAddTokenDialog.Fragment>
        {[<AddDialogFieldGroup
            label={fieldName}
            testid={dataTestid + "-" + fieldName.toLowerCase() + "-row"}
          >
            <Select
              popupAttrs={UNCOMMENTABLE_PROPS}
              items={
                required
                  ? [
                      ...items,
                      {
                        value: NEW_TOKEN_GROUP_SENTINEL,
                        get label() { return uiMessage("design-system.addTokenDialog.new", { value1: String(fieldName.toLowerCase()) }); },
                        separatorBefore: items.length > 0,
                      },
                    ]
                  : items
              }
              value={selectedGroup}
              aria-label={fieldName}
              data-testid={dataTestid + "-" + fieldName.toLowerCase()}
              onChange={handleGroupChange}
            />
          </AddDialogFieldGroup>, isNewGroup ? (
            <AddDialogField label={uiMessage("design-system.addTokenDialog.name2", { value1: String(fieldName) })} hint={groupNameValidation}>
              <TextInput
                {...PASSWORD_MANAGER_IGNORE_PROPS}
                data-field={"fresh"}
                value={themeId}
                placeholder={fieldContext}
                maxLength={MAX_TOKEN_LABEL_LENGTH}
                spellCheck={false}
                aria-label={uiMessage("design-system.addTokenDialog.name2", { value1: String(fieldName) })}
                data-testid={
                  dataTestid +
                  "-" +
                  (fieldName === "Set" ? "set" : "group") +
                  "-name"
                }
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                  let themeValue = event.currentTarget.value;
                  setShowAdvanced(true);
                  setThemeId(themeValue);
                  updateTokenName(NEW_TOKEN_GROUP_SENTINEL, themeValue);
                }}
              />
            </AddDialogField>
          ) : null]}
      </jsxAddTokenDialog.Fragment>
    ),
    dialogContent = (
      <AddDialogField label={uiMessage("design-system.addTokenDialog.usageNote")} top={true}>
        <TextArea
          {...PASSWORD_MANAGER_IGNORE_PROPS}
          rows={2}
          autosize={true}
          resize={"none"}
          value={description}
          placeholder={
            // MineDesign: user-facing copy calls the agent "the agent", not Claude.
            uiMessage("design-system.addTokenDialog.optionalWhenShouldTheAgent", { value1: String(invalidTokenName ? (uiMessage("design-system.addTokenDialog.it")) : (normalizedTokenName)) })
          }
          aria-label={uiMessage("design-system.addTokenDialog.usageNote")}
          data-testid={dataTestid + "-usage"}
          onChange={(
            event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => setDescription(event.currentTarget.value)}
          onKeyDown={handleKeyboard}
        />
      </AddDialogField>
    ),
    dialogFooter: React.ReactNode,
    dialogError: React.ReactNode = null;
  switch (req.kind) {
    case "color": {
      dialogError = (
        <div
          className={"ds-well ds-addd-well"}
          aria-hidden={"true"}
          data-testid={dataTestid + "-preview"}
        >
          {colorTokenSets.map((tokenSet, setIndex) => {
            let normalizedValue = normalizeColorEditorInput(
                colorValues[tokenSet.id] ?? "",
              ),
              fallbackValue = normalizeColorEditorInput(
                colorValues[primaryColorId ?? ""] ?? "",
              ),
              backgroundColor = isColorLiteral(normalizedValue)
                ? normalizedValue
                : setIndex > 0 && isColorLiteral(fallbackValue)
                  ? fallbackValue
                  : undefined;
            return (() => {
              const _Element = "span";
              const _elementProps = {
                className: "ds-addd-swatch",
                style:
                  backgroundColor !== undefined
                    ? {
                        background: backgroundColor,
                      }
                    : undefined,
                title: tokenSet.name,
              };
              const _elementKey = tokenSet.id;
              return <_Element key={_elementKey} {..._elementProps} />;
            })();
          })}
        </div>
      );
      dialogFooter = (
        <jsxAddTokenDialog.Fragment>
          {[renderField(
              "Group",
              req.groups.map((group) => ({
                value: group.key,
                label: group.label,
              })),
              "e.g. brand",
            ), dialogFields, colorTokenSets.map((tokenSet, setIndex) => {
              let normalizedValue = normalizeColorEditorInput(
                  colorValues[tokenSet.id] ?? "",
                ),
                placeholderValue = normalizeColorEditorInput(
                  colorValues[primaryColorId ?? ""] ?? "",
                );
              return (() => {
                const FieldElement = "div";
                const fieldProps = {
                  className:
                    "ds-addd-crow [--pp-gutter-l:0px] [--pp-gutter-r:0px] [--prop-row-h:24px]",
                  "data-testid": dataTestid + "-value-" + tokenSet.id,
                  children: (
                    <ColorTextPropertyRow
                      label={colorTokenSets.length > 1 ? (tokenSet.name) : (uiMessage("design-system.addTokenDialog.value"))}
                      popupAttrs={commentTargetProps(
                        "picker",
                        "add-dialog:" + tokenSet.id,
                      )}
                      value={
                        normalizedValue !== "" && isColorLiteral(normalizedValue)
                          ? normalizedValue
                          : undefined
                      }
                      {...(setIndex > 0
                        ? {
                            clearLabel:
                              uiMessage("design-system.addTokenDialog.inherits") + (colorTokenSets[0]?.name ?? ""),
                            ...(isColorLiteral(placeholderValue)
                              ? {
                                  placeholder: placeholderValue,
                                }
                              : {}),
                          }
                        : {})}
                      onChange={(colorValue: string | undefined) =>
                        updateColorValue(tokenSet.id, colorValue ?? "")
                      }
                    />
                  ),
                };
                const fieldKey = tokenSet.id;
                return <FieldElement key={fieldKey} {...fieldProps} />;
              })();
            }), dialogContent]}
        </jsxAddTokenDialog.Fragment>
      );
      break;
    }
    case "shadow": {
      dialogFooter = (
        <jsxAddTokenDialog.Fragment>
          {[dialogFields, colorTokenSets.map((field, fieldIndex) =>
              (() => {
                const FieldComponent = AddDialogField;
                const fieldProps = {
                  label: colorTokenSets.length > 1 ? field.name : uiMessage("design-system.addTokenDialog.value"),
                  hint: state[field.id] ?? null,
                  testid: dataTestid + "-value-" + field.id,
                  children: (
                    <ShadowValueEditor
                      label={uiMessage("design-system.addTokenDialog.value2", { value1: String(field.name) })}
                      anchorKey={"add-dialog:" + field.id}
                      value={colorValues[field.id] ?? ""}
                      onChange={(colorValue: string | undefined) =>
                        updateColorValue(field.id, colorValue as string)
                      }
                      testid={dataTestid + "-chip-" + field.id}
                      {...(fieldIndex > 0
                        ? {
                            clear: {
                              label: uiMessage("design-system.addTokenDialog.inherit") + (colorTokenSets[0]?.name ?? ""),
                              run: () => updateColorValue(field.id, ""),
                            },
                          }
                        : {})}
                    />
                  ),
                };
                const fieldKey = field.id;
                return <FieldComponent key={fieldKey} {...fieldProps} />;
              })(),
            ), dialogContent]}
        </jsxAddTokenDialog.Fragment>
      );
      let boxShadowValue = (colorValues[primaryColorId ?? ""] ?? "").trim();
      dialogError = (
        <div
          className={"ds-well ds-addd-well"}
          aria-hidden={"true"}
          data-testid={dataTestid + "-preview"}
        >
          <span
            className={"ds-shadow-surface"}
            style={
              isSafeBoxShadow(boxShadowValue)
                ? {
                    boxShadow: boxShadowValue,
                  }
                : undefined
            }
          />
        </div>
      );
      break;
    }
    case "type": {
      let fontFamilyValue =
          fontFamily !== null
            ? "'" + fontFamily + "', sans-serif"
            : (req.families[typeStyle.family] ??
              Object.values(req.families)[0] ??
              "system-ui, sans-serif"),
        previewStyle = typeStylePreviewStyle(
          {
            name: normalizedTokenName,
            fontSize: appendDefaultLengthUnit(typeStyle.fontSize),
            lineHeight: typeStyle.lineHeight,
            fontWeight: typeStyle.fontWeight,
            letterSpacing:
              typeStyle.letterSpacing.trim() === ""
                ? "0"
                : appendDefaultLengthUnit(typeStyle.letterSpacing),
            fontStyle: typeStyle.fontStyle,
          },
          fontFamilyValue,
        ),
        previewFontSize = Math.min(
          56,
          Math.max(
            14,
            parseEditableCssLength(
              appendDefaultLengthUnit(typeStyle.fontSize),
            )?.unit === "px"
              ? (parseEditableCssLength(
                  appendDefaultLengthUnit(typeStyle.fontSize),
                )?.n ?? 16)
              : 16 *
                  (parseEditableCssLength(
                    appendDefaultLengthUnit(typeStyle.fontSize),
                  )?.n ?? 1),
          ),
        );
      dialogError = (
        <div
          className={"ds-well ds-twell ds-addd-well"}
          data-testid={dataTestid + "-specimen"}
        >
          <span
            className={"ds-spec ds-taa text-primary"}
            style={{
              ...previewStyle,
              fontSize: String(previewFontSize) + "px",
              lineHeight: 1,
            }}
          >
            {"Aa"}
          </span>
        </div>
      );
      let handleTypeFieldChange = (field: keyof NewTypeStyle, fieldValue: string) => {
        if (field === "family") {
          callback(null);
        }
        updateTypeStyle((style) =>
          field === "family"
            ? {
                ...style,
                family: fieldValue,
              }
            : field === "fontSize"
              ? {
                  ...style,
                  fontSize: fieldValue,
                }
              : field === "fontWeight"
                ? {
                    ...style,
                  fontWeight: fieldValue,
                  }
                : field === "lineHeight"
                  ? {
                      ...style,
                    lineHeight: fieldValue,
                    }
                  : field === "letterSpacing"
                    ? {
                        ...style,
                        letterSpacing: fieldValue,
                      }
                    : style,
        );
      };
      dialogFooter = (
        <jsxAddTokenDialog.Fragment>
          {[renderField(
              "Set",
              req.sets.map((setName) => ({
                value: setName,
                label: setName,
              })),
              "e.g. Display",
            ), dialogFields, <TypeStyleFields
              v={{
                family: fontFamily !== null ? "" : typeStyle.family,
                fontSize: appendDefaultLengthUnit(typeStyle.fontSize),
                fontWeight: typeStyle.fontWeight,
                lineHeight: typeStyle.lineHeight,
                letterSpacing: typeStyle.letterSpacing,
              }}
              fontLabel={fontFamily ?? undefined}
              families={req.families}
              familyNames={req.familyNames}
              fontNames={req.fontNames}
              onField={handleTypeFieldChange}
              onFont={(selectedFontFamily: string) => {
                callback(selectedFontFamily);
                updateTypeStyle((style) => ({
                  ...style,
                  family: "",
                }));
              }}
              testid={dataTestid}
              inputRef={ignorePasswordManagerForInput}
              row={(label: string, children: React.ReactNode) =>
                label === "Font" ? (
                  <AddDialogField label={label} hint={fontValidationError}>
                    {children}
                  </AddDialogField>
                ) : (
                  <AddDialogFieldGroup label={label}>
                    {children}
                  </AddDialogFieldGroup>
                )
              }
            />, dialogContent]}
        </jsxAddTokenDialog.Fragment>
      );
      break;
    }
    default: {
      let validatedValue = validateNewTokenValue(req.kind, tokenValue),
        previewPixels =
          validatedValue !== undefined
            ? cssLengthPreviewPixels(validatedValue)
            : null;
      if (req.kind === "spacing") {
        dialogError = (
          <div
            className={"ds-well ds-addd-well"}
            aria-hidden={"true"}
            data-testid={dataTestid + "-preview"}
          >
            <span
              className={"ds-addd-gap"}
              style={{
                gap:
                  String(previewPixels === null ? 0 : Math.min(120, previewPixels)) +
                  "px",
              }}
            >
              {[<span className={"ds-addd-card"} />, <span className={"ds-addd-card"} />]}
            </span>
          </div>
        );
      } else if (req.kind === "radius") {
        dialogError = (
          <div
            className={"ds-well ds-addd-well"}
            aria-hidden={"true"}
            data-testid={dataTestid + "-preview"}
          >
            <span
              className={"ds-addd-card ds-addd-corner"}
              style={{
                borderTopLeftRadius:
                  previewPixels === null ? 0 : Math.min(60, previewPixels),
              }}
            />
          </div>
        );
      }
      let typeFields: React.ReactNode;
      if (req.kind === "spacing" || req.kind === "radius") {
        let parsedLength = parseEditableCssLength(
          appendDefaultLengthUnit(tokenValue),
        ) ?? {
          n: 0,
          unit: "px",
        };
        typeFields = (
          <AddDialogField
            label={uiMessage("design-system.addTokenDialog.value")}
            hint={colorValidationError}
            testid={dataTestid + "-value"}
            knob={"value"}
          >
            <PropertyNumberInput
              aria-label={uiMessage("design-system.addTokenDialog.value")}
              inputRef={ignorePasswordManagerForInput}
              refuseLetters={true}
              unit={parsedLength.unit}
              value={parsedLength.n}
              min={0}
              max={MAX_EDITABLE_CSS_LENGTH}
              step={cssLengthInputStep(parsedLength.unit)}
              onValue={(numberValue: number | undefined) => {
                if (numberValue !== undefined) {
                  updateTypeField(formatNumberWithUnit(numberValue, parsedLength.unit));
                }
              }}
            />
          </AddDialogField>
        );
      } else {
        typeFields = (
          <AddDialogField label={uiMessage("design-system.addTokenDialog.value")} hint={colorValidationError}>
            <TextInput
              {...PASSWORD_MANAGER_IGNORE_PROPS}
              className={"font-mono"}
              value={tokenValue}
              spellCheck={false}
              aria-label={uiMessage("design-system.addTokenDialog.value")}
              data-testid={dataTestid + "-value"}
              onChange={(
                event: React.ChangeEvent<
                  HTMLInputElement | HTMLTextAreaElement
                >,
              ) => updateTypeField(event.currentTarget.value)}
            />
          </AddDialogField>
        );
      }
      dialogFooter = (
        <jsxAddTokenDialog.Fragment>
          {[tokenSets.length > 1
              ? renderField(
                  "Group",
                  tokenSets.map((tokenSet) => ({
                    value: tokenSet.key,
                    label: tokenSet.label,
                  })),
                  "",
                  false,
                )
              : null, dialogFields, typeFields, dialogContent]}
        </jsxAddTokenDialog.Fragment>
      );
    }
  }
  return (
    <div className={"contents"} {...BLOCK_FILE_DROP_HANDLERS}>
      <CdsRoot density={"compact"} className={"contents"}>
        <Dialog.Root
          open={true}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              onClose();
            }
          }}
        >
          <Dialog.Popup
            size={"sm"}
            className={"max-w-[22.5rem]"}
            aria-label={addTokenDialogTitle(req)}
            data-testid={dataTestid}
            {...commentTargetProps("dialog", "add")}
          >
            {[<Dialog.Header showClose={true}>
                {addTokenDialogTitle(req)}
              </Dialog.Header>, <form
                ref={ref}
                className={
                  "ds-addd-form flex flex-col gap-2 [--pp-label-w:6rem]"
                }
                autoComplete={"off"}
                noValidate={true}
                onSubmit={handleSubmit}
                onKeyDown={handleColorKeyboard}
              >
                {[dialogError, dialogFooter, <Dialog.Footer align={"end"}>
                    {[<Button
                        variant={"ghost"}
                        onClick={onClose}
                        data-testid={dataTestid + "-cancel"}
                      >
                        {uiMessage("design-system.addTokenDialog.cancel")}
                      </Button>, <Button
                        variant={"primary"}
                        type={"submit"}
                        disabled={!isValueValid}
                        data-testid={dataTestid + "-submit"}
                      >
                        {uiMessage("design-system.addTokenDialog.add")}
                      </Button>]}
                  </Dialog.Footer>]}
              </form>]}
          </Dialog.Popup>
        </Dialog.Root>
      </CdsRoot>
    </div>
  );
}
export {
  ADD_DIALOG_HELP_CLASS_NAME,
  ADD_DIALOG_ROW_CLASS_NAME,
  AddDialogField,
  AddDialogFieldGroup,
  AddTokenDialog,
  addTokenDialogTitle,
  appendDefaultLengthUnit,
  formatNumberWithUnit,
  ignorePasswordManagerForInput,
  jsxAddTokenDialog,
  NEW_TOKEN_GROUP_SENTINEL,
  normalizeNewColorValue,
  normalizeNewTokenName,
  NUMBER_INPUT_SELECTOR,
  PASSWORD_MANAGER_IGNORE_PROPS,
  stripAddDialogNamespace,
  TOKEN_LENGTH_VALIDATION_MESSAGES,
  validateNewColorValue,
  validateNewTokenValue,
  validateNewTypeField,
};
export function installEditorAddTokenDialog(): () => void {
  return () => {
    jsxAddTokenDialog = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    NEW_TOKEN_GROUP_SENTINEL = "\x00new";
    TOKEN_LENGTH_VALIDATION_MESSAGES = {
      spacing: "Not a length — try 8px or 0.5rem.",
      radius: "Not a length — try 8px or 0.5rem.",
      extra: "Not a plain CSS value.",
    };
    PASSWORD_MANAGER_IGNORE_PROPS = {
      autoComplete: "off",
      "data-1p-ignore": "true",
      "data-lpignore": "true",
      "data-bwignore": "true",
      "data-form-type": "other",
    };
    formatNumberWithUnit = (numberValue: number, unit: string) =>
      String(Math.round(numberValue * 1e6) / 1e6) + unit;
    NUMBER_INPUT_SELECTOR = '[data-cds="NumberInput"] input';
    stripAddDialogNamespace = (name: string, namespace: string) =>
      namespace !== "" &&
      name.startsWith(namespace) &&
      name.length > namespace.length
        ? name.slice(namespace.length)
        : name;
    ADD_DIALOG_ROW_CLASS_NAME =
      "ds-addd-row grid grid-cols-[var(--pp-label-w)_minmax(0,1fr)] items-center gap-x-sm gap-y-1";
    ADD_DIALOG_HELP_CLASS_NAME =
      "truncate text-footnote font-normal leading-normal text-muted select-none";
  };
}
