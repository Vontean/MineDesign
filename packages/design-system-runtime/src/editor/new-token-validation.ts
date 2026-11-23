import { uiMessage } from "@minedesign/contracts/ui-messages";
import type { ScalarTokenKind } from "../contracts/application";
import { normalizeTokenName } from "../model/token-commands";
import { colorAliasTarget, isColorOrAlias, normalizeColorEditorInput, normalizeCssLength, normalizeLineHeight, normalizeScalarTokenValue } from "../model/tokens";

export function normalizeNewTokenName(rawName: string): string {
  return normalizeTokenName(rawName).replace(/\s+/g, "-");
}
export function validateNewColorValue(
  rawColor: string,
  allowEmpty: boolean,
  currentTokenName: string,
  existingTokenNames: ReadonlySet<string>,
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
  if (aliasTarget === currentTokenName) {
    return uiMessage("design-system.addTokenDialog.selfAlias");
  }
  if (!existingTokenNames.has(aliasTarget)) {
    return uiMessage("design-system.addTokenDialog.namesNoColorToken");
  }
  return null;
}
export function normalizeNewColorValue(rawColorValue: string): string {
  return normalizeColorEditorInput(rawColorValue);
}
export function appendDefaultLengthUnit(rawLength: string): string {
  let trimmedLength = rawLength.trim();
  if (/^-?\d{1,4}(?:\.\d{1,6})?$/.test(trimmedLength) && trimmedLength !== "0") {
    return trimmedLength + "px";
  } else {
    return trimmedLength;
  }
}
export function validateNewTokenValue(
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
export function validateNewTypeField(
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
