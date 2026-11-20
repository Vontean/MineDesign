import { uiMessage } from '@minedesign/contracts/ui-messages';
import type {
  AccessibleNameProps,
  ComboboxBridgeProps,
  ComboboxChipProps,
  ComboboxChipsProps,
  ComboboxFooterActionProps,
  ComboboxGroupMap,
  ComboboxHostProps,
  ComboboxItemPartProps,
  ComboboxKey,
  ComboboxLabelInput,
  ComboboxLabelResult,
  ComboboxOption,
  ComboboxPartProps,
  ComboboxPopupProps,
  ComboboxPopupViewProps,
  ComboboxProps,
  ComboboxRegistration,
  ComboboxRowProps,
  ComboboxStatusProps,
  ComboboxTriggerProps,
  ComboboxValueProps,
  DesignStyle,
  ForwardComponent,
  GenericComboboxRow,
  ImperativeComboboxDetails,
  LabelResolver,
  MobileSheetParts,
  OverlayChange,
  PopupInputKind,
  SheetPopupState,
  SheetRenderState,
  VirtualComboboxActions,
  VirtualComboboxProps,
} from "../contracts/overlays";
import type * as React from "react";
/** Restored application module; prepare first, initialize in original order. */
import { baseCombobox, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { Spinner } from "./disclosure";
import { initializeAdaptiveSheets, initializeIsomorphicLayoutEffect, initializePresentationMode, initializeSheetClassNames, initializeSheetStyles, initializeVisualKeyboard, isEditableElement } from "./foundation";
import { initializeClassNames, initializeCloseOnActivityHide, initializeIcons, initializeLayers, initializeMergedRefs, initializePortalRoot, initializeRemScale, initializeSurfaces, initializeTranslations, useMergedRefs, useTranslation } from "./interactions";
import { initializeCdsRoot, initializeClickToFocus } from "./overlays";

var typographyThemeValues: {
  "font-size-body": {
    compact: number;
    comfortable: number;
    steps: number[];
    textSize: {
      compact: {
        sm: number;
        md: number;
        lg: number;
      };
      comfortable: {
        sm: number;
        md: number;
        lg: number;
      };
    };
  };
  "font-size-caption": {
    compact: number;
    comfortable: number;
    steps: number[];
  };
  "font-size-code": {
    compact: number;
    comfortable: number;
  };
  "font-size-footnote": {
    compact: number;
    comfortable: number;
  };
  "font-size-heading": {
    compact: number;
    comfortable: number;
    textSize: {
      compact: {
        sm: number;
        md: number;
        lg: number;
      };
      comfortable: {
        sm: number;
        md: number;
        lg: number;
      };
    };
  };
  "font-size-prose": {
    compact: number;
    comfortable: number;
    steps: number[];
    textSize: string;
  };
  "font-size-title": {
    compact: number;
    comfortable: number;
  };
  "leading-body": {
    compact: number;
    comfortable: number;
    steps: number[];
    textSize: {
      compact: {
        sm: number;
        md: number;
        lg: number;
      };
      comfortable: {
        sm: number;
        md: number;
        lg: number;
      };
    };
  };
  "leading-caption": {
    compact: number;
    comfortable: number;
  };
  "leading-code": {
    compact: number;
    comfortable: number;
  };
  "leading-footnote": {
    compact: number;
    comfortable: number;
  };
  "leading-heading": {
    compact: number;
    comfortable: number;
    textSize: {
      compact: {
        sm: number;
        md: number;
        lg: number;
      };
      comfortable: {
        sm: number;
        md: number;
        lg: number;
      };
    };
  };
  "leading-prose": {
    compact: number;
    comfortable: number;
    steps: number[];
    textSize: string;
  };
  "leading-title": {
    compact: number;
    comfortable: number;
  };
};
var reactAccessibleCombobox: typeof React;
var reactComboboxStatus: typeof React;
var jsxComboboxStatus: typeof import("react/jsx-runtime");
var COMBOBOX_STATUS_DELAY_MS: number;
var COMBOBOX_STATUS_CLASS: string;
var COMBOBOX_LOADING_CLASS: string;
var ComboboxStatus: ForwardComponent<HTMLDivElement, ComboboxStatusProps>;
var reactComboboxHandle: typeof React;
var comboboxJsx: typeof import("react/jsx-runtime");
var COMBOBOX_VIRTUAL_OVERSCAN: number;
var COMBOBOX_SKELETON_ROW_COUNT: number;
function comboboxAccessibilityProps({
  reactId: reactId,
  label: label,
  triggerPrefix: triggerPrefix,
  mode: mode,
  triggerMode: triggerMode,
  insideField: insideField,
}: ComboboxLabelInput): ComboboxLabelResult {
  let value = label ? `${reactId}-label` : undefined,
    labelsSelectedValue = mode === "select" && triggerMode !== "chips",
    usesTriggerLabel =
      value !== undefined ||
      (!insideField && (triggerPrefix !== undefined || labelsSelectedValue)),
    triggerId = usesTriggerLabel ? `${reactId}-trigger` : undefined,
    triggerValueId = usesTriggerLabel && labelsSelectedValue ? `${reactId}-trigger-value` : undefined,
    triggerLabelledBy = usesTriggerLabel
      ? [value, triggerValueId].filter(Boolean).join(" ") || undefined
      : undefined;
  return {
    labelId: value,
    triggerId: triggerId,
    triggerValueId: triggerValueId,
    ownLabelProps:
      usesTriggerLabel && triggerId
        ? {
            id: triggerId,
            "aria-labelledby": triggerLabelledBy,
          }
        : undefined,
  };
}
function accessibleNameFromElement(
  element: Element | null | undefined,
  {
    fallback: fallback,
    fromTextEntry = false,
  }: {
    fallback?: string;
    fromTextEntry?: boolean;
  } = {},
): AccessibleNameProps {
  if (
    element === null ||
    element === undefined ||
    (!fromTextEntry && isEditableElement(element))
  ) {
    return {};
  }
  let ownerDocument = element.ownerDocument,
    value = (element.getAttribute("aria-labelledby") ?? "")
      .split(/\s+/)
      .filter((id: string) => {
        if (id === "") {
          return false;
        }
        let labelElement = ownerDocument.getElementById(id);
        return labelElement !== null && !element.contains(labelElement);
      });
  if (value.length > 0) {
    return {
      "aria-labelledby": value.join(" "),
    };
  }
  for (let label of [element.getAttribute("aria-label"), fallback]) {
    let trimmedLabel = label?.trim();
    if (trimmedLabel !== undefined && trimmedLabel !== "") {
      return {
        "aria-label": trimmedLabel,
      };
    }
  }
  return {};
}
function useMirroredAccessibleName(
  ref: React.Ref<HTMLElement> | undefined,
  getFallback: () => Element | null | undefined,
  nameProps: AccessibleNameProps,
  {
    fallback: fallback,
    fromTextEntry = false,
  }: {
    fallback?: string;
    fromTextEntry?: boolean;
  } = {},
): {
  ref: React.RefCallback<HTMLElement>;
  nameProps: AccessibleNameProps;
} {
  let [value, setMirroredName] = reactAccessibleCombobox.useState<AccessibleNameProps>({}),
    hasExplicitName =
      nameProps["aria-label"] !== undefined ||
      nameProps["aria-labelledby"] !== undefined,
    callback = reactAccessibleCombobox.useCallback(
      (trigger: HTMLElement | null): void => {
        if (trigger === null || hasExplicitName) {
          return;
        }
        let mirroredName = accessibleNameFromElement(getFallback(), {
          fallback: fallback,
          fromTextEntry: fromTextEntry,
        });
        setMirroredName((previousName: AccessibleNameProps) =>
          previousName["aria-labelledby"] === mirroredName["aria-labelledby"] &&
          previousName["aria-label"] === mirroredName["aria-label"]
            ? previousName
            : mirroredName,
        );
      },
      [hasExplicitName, getFallback, fallback, fromTextEntry],
    );
  return {
    ref: useMergedRefs(ref, callback),
    nameProps: hasExplicitName ? nameProps : value,
  };
}
function useDelayedVisible(timeoutMs: number): boolean {
  let [value, setStatusVisible] = reactComboboxStatus.useState(timeoutMs <= 0);
  reactComboboxStatus.useEffect(() => {
    if (timeoutMs <= 0) {
      return;
    }
    let revealTimeout = window.setTimeout(() => setStatusVisible(true), timeoutMs);
    return () => window.clearTimeout(revealTimeout);
  }, [timeoutMs]);
  return timeoutMs <= 0 || value;
}
function DelayedVisible({
  ms: ms2,
  children: children,
}: {
  ms: number;
  children?: React.ReactNode;
}): React.ReactNode {
  if (useDelayedVisible(ms2)) {
    return children;
  } else {
    return null;
  }
}
export {
  accessibleNameFromElement,
  COMBOBOX_LOADING_CLASS,
  COMBOBOX_SKELETON_ROW_COUNT,
  COMBOBOX_STATUS_CLASS,
  COMBOBOX_STATUS_DELAY_MS,
  COMBOBOX_VIRTUAL_OVERSCAN,
  comboboxAccessibilityProps,
  ComboboxStatus,
  DelayedVisible,
  jsxComboboxStatus,
  comboboxJsx as jsxForUiInputs23,
  reactComboboxStatus,
  reactAccessibleCombobox as reactForUiInputs222,
  reactComboboxHandle as reactForUiInputs24,
  typographyThemeValues,
  useDelayedVisible,
  useMirroredAccessibleName,
};
export function installUiComboboxPrimitives(): () => void {
  return () => {
    initializeIsomorphicLayoutEffect();
    initializeClassNames();
    initializeTranslations();
    initializeCdsRoot();
    initializeLayers();
    initializeClickToFocus();
    initializeCloseOnActivityHide();
    initializeMergedRefs();
    initializePortalRoot();
    initializeRemScale();
    initializeIcons();
    initializeSurfaces();
    initializeSheetStyles();
    initializePresentationMode();
    initializeAdaptiveSheets();
    initializeSheetClassNames();
    typographyThemeValues = {
      "font-size-body": {
        compact: 0.8125,
        comfortable: 0.875,
        steps: [0.75, 0.8125, 0.875, 0.875, 0.9375],
        textSize: {
          compact: {
            sm: 0.8125,
            md: 0.875,
            lg: 0.9375,
          },
          comfortable: {
            sm: 0.8125,
            md: 0.875,
            lg: 0.9375,
          },
        },
      },
      "font-size-caption": {
        compact: 0.6875,
        comfortable: 0.75,
        steps: [0.625, 0.6875, 0.75, 0.75, 0.8125],
      },
      "font-size-code": {
        compact: 0.75,
        comfortable: 0.8125,
      },
      "font-size-footnote": {
        compact: 0.75,
        comfortable: 0.8125,
      },
      "font-size-heading": {
        compact: 0.875,
        comfortable: 0.9375,
        textSize: {
          compact: {
            sm: 0.8125,
            md: 0.875,
            lg: 0.9375,
          },
          comfortable: {
            sm: 0.875,
            md: 0.9375,
            lg: 1,
          },
        },
      },
      "font-size-prose": {
        compact: 0.875,
        comfortable: 1,
        steps: [0.8125, 0.875, 0.9375, 1, 1.125],
        textSize: "shift",
      },
      "font-size-title": {
        compact: 1.25,
        comfortable: 1.375,
      },
      "leading-body": {
        compact: 1.1875,
        comfortable: 1.25,
        steps: [1.0625, 1.1875, 1.25, 1.25, 1.375],
        textSize: {
          compact: {
            sm: 1.1875,
            md: 1.25,
            lg: 1.375,
          },
          comfortable: {
            sm: 1.1875,
            md: 1.25,
            lg: 1.375,
          },
        },
      },
      "leading-caption": {
        compact: 1.0625,
        comfortable: 1.0625,
      },
      "leading-code": {
        compact: 1.0625,
        comfortable: 1.1875,
      },
      "leading-footnote": {
        compact: 0.9375,
        comfortable: 1.0625,
      },
      "leading-heading": {
        compact: 1.125,
        comfortable: 1.25,
        textSize: {
          compact: {
            sm: 1.125,
            md: 1.125,
            lg: 1.375,
          },
          comfortable: {
            sm: 1.25,
            md: 1.25,
            lg: 1.5,
          },
        },
      },
      "leading-prose": {
        compact: 1.25,
        comfortable: 1.5,
        steps: [1.1875, 1.25, 1.375, 1.5, 1.6875],
        textSize: "shift",
      },
      "leading-title": {
        compact: 1.5625,
        comfortable: 1.75,
      },
    };
    initializeMergedRefs();
    initializeVisualKeyboard();
    reactAccessibleCombobox = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    initializeTranslations();
    reactComboboxStatus = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxComboboxStatus = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    COMBOBOX_STATUS_DELAY_MS = 500;
    COMBOBOX_STATUS_CLASS = "px-md py-1.5 text-body text-muted select-none";
    COMBOBOX_LOADING_CLASS = `flex items-center gap-2 ${COMBOBOX_STATUS_CLASS}`;
    ComboboxStatus = reactComboboxStatus.forwardRef(
      (
        {
          loading = false,
          delay = COMBOBOX_STATUS_DELAY_MS,
          loadingLabel: loadingLabel,
          ...props
        }: ComboboxStatusProps,
        forwardedRef: React.ForwardedRef<HTMLDivElement>,
      ): React.ReactElement => {
        let value = useTranslation(
          "loadingOptions",
          uiMessage("design-system.comboboxPrimitives.loadingOptions"),
        );
        return (
          <baseCombobox.Status ref={forwardedRef} {...props}>
            {loading && (<DelayedVisible ms={delay}>
                <div className={COMBOBOX_LOADING_CLASS}>
                  {[<Spinner size={"sm"} />, <span>{loadingLabel ?? (value)}</span>]}
                </div>
              </DelayedVisible>)}
          </baseCombobox.Status>
        );
      },
    );
    ComboboxStatus.displayName = "Combobox.Status";
    initializeIsomorphicLayoutEffect();
    reactComboboxHandle = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    comboboxJsx = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    COMBOBOX_VIRTUAL_OVERSCAN = 5;
    COMBOBOX_SKELETON_ROW_COUNT = 4;
  };
}
