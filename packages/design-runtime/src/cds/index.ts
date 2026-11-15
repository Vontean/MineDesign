/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeButtonButton } from "./button/button";
import { initializeButtonGroup_4 } from "./button/group";
import { initializeComponentsBadge } from "./components/badge";
import { initializeComponentsCollapsible } from "./components/collapsible";
import { initializeComponentsCounter_3, initializeComponentsCounter_5 } from "./components/counter";
import { initializeComponentsIcon_2 } from "./components/icon";
import { initializeComponentsRadioGroup } from "./components/radio-group";
import { initializeComponentsSelectionPoints } from "./components/selection-points";
import { initializeComponentsSelectionRing, initializeComponentsSelectionRing_2, initializeComponentsSelectionRing_3, initializeComponentsSelectionRing_5, initializeComponentsSelectionRing_7 } from "./components/selection-ring";
import { initializeComponentsShortcut } from "./components/shortcut";
import { initializeComponentsSkeleton } from "./components/skeleton";
import { initializeComponentsSpinner } from "./components/spinner";
import { initializeComponentsSurface } from "./components/surface";
import { initializeComponentsSwitch } from "./components/switch";
import { initializeComponentsTextArea } from "./components/text-area";
import { initializeComponentsTextInput } from "./components/text-input";
import { initializeComponentsTextLink } from "./components/text-link";
import { initializeDialogDialog } from "./dialog/dialog";
import { initializeEditorAlignmentGuides } from "./editor/alignment-guides";
import { initializeFieldField_6 } from "./field/field";
import { initializeMenuItemStyles } from "./menu/item-styles";
import { initializeMenuMenu_5 } from "./menu/menu";
import { initializePopoverPopover_2 } from "./popover/popover";
import { initializeTabsTabs } from "./tabs/tabs";
import { initializeClassNames } from "./theme/class-names";
import { initializeCdsRoot } from "./theme/root";
import { initializeTokens } from "./theme/tokens";
import { initializeToastToast } from "./toast/toast";
import { initializeTooltipDeferredProvider } from "./tooltip/deferred-provider";
import { initializeTooltipTooltip } from "./tooltip/tooltip";
import { initializeOnce } from "../module-helpers";

var initializeCdsIndex: Dynamic;
export {
  initializeCdsIndex,
};
export function installCdsIndex(): () => void {
  return () => {
    initializeCdsIndex = (0, initializeOnce)((): Dynamic => {
      (0, initializeClassNames)();
      (0, initializeCdsRoot)();
      (0, initializeTokens)();
      (0, initializeComponentsIcon_2)();
      (0, initializeEditorAlignmentGuides)();
      (0, initializeComponentsShortcut)();
      (0, initializeTooltipTooltip)();
      (0, initializeComponentsCollapsible)();
      (0, initializeComponentsSpinner)();
      (0, initializeTooltipDeferredProvider)();
      (0, initializeButtonButton)();
      (0, initializeComponentsSkeleton)();
      (0, initializeComponentsSurface)();
      (0, initializeComponentsTextInput)();
      (0, initializeMenuItemStyles)();
      (0, initializeMenuMenu_5)();
      (0, initializePopoverPopover_2)();
      (0, initializeComponentsTextArea)();
      (0, initializeComponentsBadge)();
      (0, initializeComponentsCounter_3)();
      (0, initializeComponentsCounter_5)();
      (0, initializeComponentsTextLink)();
      (0, initializeDialogDialog)();
      (0, initializeButtonGroup_4)();
      (0, initializeComponentsSwitch)();
      (0, initializeComponentsRadioGroup)();
      (0, initializeComponentsSelectionPoints)();
      (0, initializeComponentsSelectionRing)();
      (0, initializeComponentsSelectionRing_2)();
      (0, initializeComponentsSelectionRing_3)();
      (0, initializeComponentsSelectionRing_5)();
      (0, initializeComponentsSelectionRing_7)();
      (0, initializeTabsTabs)();
      (0, initializeToastToast)();
      (0, initializeFieldField_6)();
    });
  };
}
