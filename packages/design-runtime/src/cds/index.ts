/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { initializeButtonButton } from "./button/button";
import { initializeButtonGroupComponent } from "./button/group";
import { initializeComponentsBadge } from "./components/badge";
import { initializeComponentsCollapsible } from "./components/collapsible";
import { initializeCounter, initializeAlert } from "./components/counter";
import { initializeIconSizeMetrics } from "./components/icon";
import { initializeComponentsRadioGroup } from "./components/radio-group";
import { initializeComponentsSelectionPoints } from "./components/selection-points";
import { initializeComponentsSelectionRing, initializeSelectionPointMetrics, initializeSelectionPoints, initializeSelectionRingComponent, initializeNumberInput } from "./components/selection-ring";
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
import { initializeFieldComponents } from "./field/field";
import { initializeMenuItemStyles } from "./menu/item-styles";
import { initializeMenuComponents } from "./menu/menu";
import { initializePopoverPopupInner } from "./popover/popover";
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
      initializeIconSizeMetrics();
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
      initializeMenuComponents();
      initializePopoverPopupInner();
      initializeComponentsTextArea();
      initializeComponentsBadge();
      initializeCounter();
      initializeAlert();
      initializeComponentsTextLink();
      initializeDialogDialog();
      initializeButtonGroupComponent();
      initializeComponentsSwitch();
      initializeComponentsRadioGroup();
      initializeComponentsSelectionPoints();
      initializeComponentsSelectionRing();
      initializeSelectionPointMetrics();
      initializeSelectionPoints();
      initializeSelectionRingComponent();
      initializeNumberInput();
      initializeTabsTabs();
      initializeToastToast();
      initializeFieldComponents();
    });
  };
}
