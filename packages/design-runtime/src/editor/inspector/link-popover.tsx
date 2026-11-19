import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { TextInput } from "../../cds/components/text-input";
import { FieldExports } from "../../cds/field/field";
import { initializeCdsIndex } from "../../cds/index";
import { PopoverPopoverRootTriggerPopupConfig } from "../../cds/popover/popover";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeEditorAttributeValidation, normalizeLinkInput, sanitizeEditableLink } from "../attribute-validation";
import { initializeInspectorContext, linkPopoverAttribute } from "./context";
import { defineLiveExports, initializeOnce, toModuleNamespace } from "../../module-helpers";
import { CdsIsland, initializePlatformCdsIsland } from "../../platform/cds-island";

var linkPopoverExports: Dynamic;
var reactInspectorLinkPopover: Dynamic;
var jsxInspectorLinkPopover: Dynamic;
var initializeInspectorLinkPopover: Dynamic;
function DcLinkPopover({
  open: open,
  href: href,
  collapsed: collapsed,
  isElementLink = false,
  anchorPosition: anchorPosition,
  anchorTop: anchorTop,
  canvasTop: canvasTop,
  onApply: onApply,
  onCancel: onCancel,
  onActivity: onActivity,
}: Dynamic): Dynamic {
  useUiLocale();
  let [linkText, setLinkText]: Dynamic = (0, reactInspectorLinkPopover.useState)(
      href,
    ),
    [hasError, setHasError]: Dynamic = (0, reactInspectorLinkPopover.useState)(
      false,
    ),
    inputRef: Dynamic = (0, reactInspectorLinkPopover.useRef)(null),
    popoverBodyRef: Dynamic = (0, reactInspectorLinkPopover.useRef)(null),
    anchorX: Dynamic = anchorPosition?.x ?? 0,
    anchorY: Dynamic = anchorPosition?.y ?? 0,
    anchorTopY: Dynamic = Math.min(anchorTop ?? anchorY, anchorY),
    virtualAnchor: Dynamic = (0, reactInspectorLinkPopover.useMemo)(
      (): Dynamic => ({
        getBoundingClientRect: (): Dynamic =>
          DOMRect.fromRect({
            x: anchorX,
            y: anchorTopY,
            width: 0,
            height: anchorY - anchorTopY,
          }),
      }),
      [anchorX, anchorY, anchorTopY],
    );
  (0, reactInspectorLinkPopover.useEffect)((): Dynamic => {
    open && (setLinkText(href), setHasError(false));
  }, [open, href]);
  if (!open) return null;
  let hasExistingLink: Dynamic = href.trim() !== "",
    normalizedLink: Dynamic = hasExistingLink
      ? sanitizeEditableLink(linkText)
      : normalizeLinkInput(linkText),
    isApplyDisabled: Dynamic = collapsed && !hasExistingLink,
    canClearLink: Dynamic = isElementLink || hasExistingLink,
    isRelativeLink: Dynamic =
      hasExistingLink &&
      !hasError &&
      normalizedLink != null &&
      linkText.trim() !== "" &&
      !/^[a-z][a-z0-9+.-]*:/i.test(linkText.trim()) &&
      !linkText.trim().startsWith("//") &&
      !linkText.trim().startsWith("#"),
    applyLink: Dynamic = (): Dynamic => {
      if (!isApplyDisabled) {
        if (canClearLink && linkText.trim() === "") {
          onApply(null);
          return;
        }
        if (normalizedLink == null) {
          setHasError(true);
          inputRef.current?.focus();
          return;
        }
        onApply(normalizedLink);
      }
    },
    trapTabFocus: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.key !== "Tab") return;
      let current: Dynamic = popoverBodyRef.current;
      if (!current) return;
      let focusableElements: Dynamic = Array.from(
        current.querySelectorAll("input, button:not([disabled])"),
      );
      if (focusableElements.length === 0) return;
      let firstFocusable: Dynamic = focusableElements[0],
        lastFocusable: Dynamic = focusableElements[focusableElements.length - 1],
        activeElement: Dynamic = (document as Dynamic).activeElement;
      event.shiftKey &&
      (activeElement === firstFocusable || !current.contains(activeElement))
        ? (event.preventDefault(), lastFocusable.focus())
        : !event.shiftKey &&
          (activeElement === lastFocusable || !current.contains(activeElement)) &&
          (event.preventDefault(), firstFocusable.focus());
    };
  return (
    <CdsIsland density={"compact"} className={"contents"}>
      <PopoverPopoverRootTriggerPopupConfig.Root
        open={true}
        modal={true}
        onOpenChange={(isOpen?: Dynamic, changeDetails?: Dynamic): Dynamic => {
          isOpen ||
            (changeDetails.reason === "escape-key" &&
              changeDetails.event.preventDefault(),
            onCancel());
        }}
      >
        <PopoverPopoverRootTriggerPopupConfig.Popup
          anchor={virtualAnchor}
          side={"bottom"}
          align={"start"}
          sideOffset={6}
          collisionPadding={{
            top: Math.max(8, (canvasTop ?? 0) + 8),
            right: 8,
            bottom: 8,
            left: 8,
          }}
          padding={"sm"}
          finalFocus={false}
          aria-label={uiMessage("inspector.linkPopover.editLink")}
          className={"w-80"}
          {...{
            [linkPopoverAttribute]: "",
          }}
        >
          <div
            ref={popoverBodyRef}
            onKeyDown={(keyEvent?: Dynamic): Dynamic => {
              onActivity?.();
              trapTabFocus(keyEvent);
            }}
            className={"flex flex-col gap-sm"}
          >
            <FieldExports.Root invalid={hasError}>
              <div className={"flex items-center gap-sm"}>
                <TextInput
                  ref={inputRef}
                  size={"sm"}
                  inputMode={"url"}
                  value={linkText}
                  placeholder={"https://\u2026"}
                  aria-label={uiMessage("inspector.linkPopover.linkURL")}
                  autoFocus={true}
                  onFocus={(focusEvent?: Dynamic): Dynamic =>
                    focusEvent.currentTarget.select()
                  }
                  onChange={(changeEvent?: Dynamic): Dynamic => {
                    onActivity?.();
                    setLinkText(changeEvent.currentTarget.value);
                    setHasError(false);
                  }}
                  onKeyDown={(event?: Dynamic): Dynamic => {
                    event.key === "Enter" &&
                      (event.preventDefault(), applyLink());
                  }}
                  data-testid={"dc-link-url-input"}
                />
                <Button
                  size={"sm"}
                  disabled={isApplyDisabled}
                  onClick={applyLink}
                  data-testid={"dc-link-apply"}
                >
                  {uiMessage("inspector.linkPopover.apply")}
                </Button>
              </div>
              {hasError && (<FieldExports.Error match={true}>
                  {uiMessage("inspector.linkPopover.enterAWebAddressLikeHttpsExampleCom")}
                </FieldExports.Error>)}
              {isApplyDisabled && (<FieldExports.Description className={"text-caption"}>
                  {uiMessage("inspector.linkPopover.selectSomeTextToLinkIt")}
                </FieldExports.Description>)}
              {isRelativeLink && !isApplyDisabled && (<FieldExports.Description
                  className={"text-caption"}
                  data-testid={"dc-link-relative-hint"}
                >
                  {
                    uiMessage("inspector.linkPopover.linksToAPageInside")
                  }
                </FieldExports.Description>)}
            </FieldExports.Root>
            {isElementLink || href.trim() !== "" && (<div className={"flex"}>
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  className={"text-danger hover:underline"}
                  onClick={(): Dynamic => onApply(null)}
                  data-testid={"dc-link-remove"}
                >
                  {uiMessage("inspector.linkPopover.removeLink")}
                </Button>
              </div>)}
          </div>
        </PopoverPopoverRootTriggerPopupConfig.Popup>
      </PopoverPopoverRootTriggerPopupConfig.Root>
    </CdsIsland>
  );
}
export {
  DcLinkPopover,
  initializeInspectorLinkPopover,
  jsxInspectorLinkPopover,
  linkPopoverExports,
  reactInspectorLinkPopover,
};
export function installEditorInspectorLinkPopover(): () => void {
  return () => {
    linkPopoverExports = {};
    defineLiveExports(linkPopoverExports, {
      DcLinkPopover: (): Dynamic => DcLinkPopover,
    });
    initializeInspectorLinkPopover = initializeOnce(
      (): Dynamic => {
        "use strict";

        reactInspectorLinkPopover = toModuleNamespace(
          load_react(),
          1,
        );
        initializeCdsIndex();
        initializePlatformCdsIsland();
        initializeInspectorContext();
        initializeEditorAttributeValidation();
        jsxInspectorLinkPopover = toModuleNamespace(
          load_react_jsx_runtime(),
          1,
        );
      },
    );
  };
}
