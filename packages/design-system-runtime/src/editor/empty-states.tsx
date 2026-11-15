import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Token from "../contracts/token-editors";
import type * as Model from "../contracts";
import type * as Color from "../contracts/color-controls";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace } from "../dependencies";
import { UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";

var jsxEditorEmptyStates: typeof import("react/jsx-runtime");
var EMPTY_SECTION_HINTS: Record<Token.EmptySectionKind, string>;
var READ_ONLY_EMPTY_SECTION_HINTS: Record<Token.EmptySectionKind, string>;
function EmptyEditorList({
  text: text,
}: {
  text: React.ReactNode;
}): React.ReactElement {
  useUiLocale();
  return (
    <p
      className={"ds-empty-list ds-pad py-md text-body text-secondary"}
      {...UNCOMMENTABLE_PROPS}
    >
      {text}
    </p>
  );
}
function EditorActionButton({
  onClick: onClick,
  label: label,
  icon: icon,
  "data-testid": dataTestid,
  disabled: disabled,
  why: why,
}: Token.EditorActionButtonProps): React.ReactElement {
  useUiLocale();
  return (
    <Button
      variant={"ghost"}
      size={"sm"}
      icon={icon}
      disabled={disabled}
      disabledReason={why}
      onClick={onClick}
      data-testid={dataTestid}
      {...UNCOMMENTABLE_PROPS}
    >
      {label}
    </Button>
  );
}
function SectionUsageNote({
  note: note,
  edgeRef: edgeRef,
}: {
  note: React.ReactNode;
  edgeRef?: React.Ref<HTMLDivElement>;
}): React.ReactElement {
  useUiLocale();
  return (
    <div
      ref={edgeRef}
      className={"ds-handoff-note ds-sec min-w-0 px-xs"}
      data-testid={"ds-handoff-note-row"}
      {...UNCOMMENTABLE_PROPS}
    >
      {note}
    </div>
  );
}
function EmptySectionHint({
  kind: kind,
  readOnly = false,
}: {
  kind: Token.EmptySectionKind;
  readOnly?: boolean;
}): React.ReactElement {
  useUiLocale();
  return (
    <p
      className={"text-body text-secondary"}
      data-testid={"ds-empty-" + kind}
      {...UNCOMMENTABLE_PROPS}
    >
      {readOnly ? (uiMessage("design-system.emptyStates.nothingHereYet")) : (READ_ONLY_EMPTY_SECTION_HINTS[kind])}
    </p>
  );
}
export {
  EditorActionButton,
  EMPTY_SECTION_HINTS,
  EmptyEditorList,
  EmptySectionHint,
  jsxEditorEmptyStates,
  READ_ONLY_EMPTY_SECTION_HINTS,
  SectionUsageNote,
};
export function installEditorEmptyStates(): () => void {
  return () => {
    jsxEditorEmptyStates = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    EMPTY_SECTION_HINTS = {
      get colors() { return uiMessage("design-system.emptyStates.askTheAgentForAPaletteADarkOrHighContrastThemeACheckForContrastAndColourBlindSaf"); },
      get type() { return uiMessage("design-system.emptyStates.askTheAgentToPickATypePairingSetUpDisplayHeadingAndBodyStylesOrLoadYourBrandFont"); },
      get spacing() { return uiMessage("design-system.emptyStates.askTheAgentForASpacingScaleAFewStepsFromTightToRoomyOrAddValuesYourselfWithANote"); },
      get corners() { return uiMessage("design-system.emptyStates.askTheAgentForTheCornerRadiiFromSharpToFullyRoundOrAddThemYourself"); },
      get shadows() { return uiMessage("design-system.emptyStates.askTheAgentForAnElevationScaleOneShadowPerLevelInEachThemeOrAddThemYourself"); },
      get components() { return uiMessage("design-system.emptyStates.askTheAgentToBuildComponentsFromYourCodeOrADescriptionButtonsInputsCardsAndTheir"); },
      get assets() { return uiMessage("design-system.emptyStates.askTheAgentToGatherYourLogosAndIconsFromARepoOrDropFilesAnywhereOnThePage"); },
      get family() { return uiMessage("design-system.emptyStates.askTheAgentToFillThisInOrAddValuesWithANoteOnWhenToUseEach"); },
    };
    READ_ONLY_EMPTY_SECTION_HINTS = {
      get colors() { return uiMessage("design-system.emptyStates.noColorsYet"); },
      get type() { return uiMessage("design-system.emptyStates.noTypeStylesOrFontFilesYet"); },
      get spacing() { return uiMessage("design-system.emptyStates.noSpacingValuesYet"); },
      get corners() { return uiMessage("design-system.emptyStates.noCornerRadiiYet"); },
      get shadows() { return uiMessage("design-system.emptyStates.noShadowsYet"); },
      get components() { return uiMessage("design-system.emptyStates.noComponentsYet"); },
      get assets() { return uiMessage("design-system.emptyStates.noFilesYet"); },
      get family() { return uiMessage("design-system.emptyStates.noTokensYet"); },
    };
  };
}
