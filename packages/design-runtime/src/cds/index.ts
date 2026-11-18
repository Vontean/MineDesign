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
    initializeCdsIndex = initializeOnce((): Dynamic => {
      initializeClassNames();
      initializeCdsRoot();
      initializeTokens();
      initializeComponentsIcon_2();
      initializeEditorAlignmentGuides();
      initializeComponentsShortcut();
      initializeTooltipTooltip();
      initializeComponentsCollapsible();
      initializeComponentsSpinner();
      initializeTooltipDeferredProvider();
      initializeButtonButton();
      initializeComponentsSkeleton();
      initializeComponentsSurface();
      initializeComponentsTextInput();
      initializeMenuItemStyles();
      initializeMenuMenu_5();
      initializePopoverPopover_2();
      initializeComponentsTextArea();
      initializeComponentsBadge();
      initializeComponentsCounter_3();
      initializeComponentsCounter_5();
      initializeComponentsTextLink();
      initializeDialogDialog();
      initializeButtonGroup_4();
      initializeComponentsSwitch();
      initializeComponentsRadioGroup();
      initializeComponentsSelectionPoints();
      initializeComponentsSelectionRing();
      initializeComponentsSelectionRing_2();
      initializeComponentsSelectionRing_3();
      initializeComponentsSelectionRing_5();
      initializeComponentsSelectionRing_7();
      initializeTabsTabs();
      initializeToastToast();
      initializeFieldField_6();
    });
  };
}
