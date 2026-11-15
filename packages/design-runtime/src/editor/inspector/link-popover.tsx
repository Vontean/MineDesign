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
  let [value, value2]: Dynamic = (0, reactInspectorLinkPopover.useState)(
      href,
    ),
    [value3, value4]: Dynamic = (0, reactInspectorLinkPopover.useState)(
      false,
    ),
    value5: Dynamic = (0, reactInspectorLinkPopover.useRef)(null),
    value6: Dynamic = (0, reactInspectorLinkPopover.useRef)(null),
    value7: Dynamic = anchorPosition?.x ?? 0,
    value8: Dynamic = anchorPosition?.y ?? 0,
    value9: Dynamic = Math.min(anchorTop ?? value8, value8),
    value10: Dynamic = (0, reactInspectorLinkPopover.useMemo)(
      (): Dynamic => ({
        getBoundingClientRect: (): Dynamic =>
          DOMRect.fromRect({
            x: value7,
            y: value9,
            width: 0,
            height: value8 - value9,
          }),
      }),
      [value7, value8, value9],
    );
  (0, reactInspectorLinkPopover.useEffect)((): Dynamic => {
    open && (value2(href), value4(false));
  }, [open, href]);
  if (!open) return null;
  let value11: Dynamic = href.trim() !== "",
    value12: Dynamic = value11
      ? (0, sanitizeEditableLink)(value)
      : (0, normalizeLinkInput)(value),
    value13: Dynamic = collapsed && !value11,
    value14: Dynamic = isElementLink || value11,
    value15: Dynamic =
      value11 &&
      !value3 &&
      value12 != null &&
      value.trim() !== "" &&
      !/^[a-z][a-z0-9+.-]*:/i.test(value.trim()) &&
      !value.trim().startsWith("//") &&
      !value.trim().startsWith("#"),
    callback: Dynamic = (): Dynamic => {
      if (!value13) {
        if (value14 && value.trim() === "") {
          onApply(null);
          return;
        }
        if (value12 == null) {
          value4(true);
          value5.current?.focus();
          return;
        }
        onApply(value12);
      }
    },
    callback2: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.key !== "Tab") return;
      let current: Dynamic = value6.current;
      if (!current) return;
      let value16: Dynamic = Array.from(
        current.querySelectorAll("input, button:not([disabled])"),
      );
      if (value16.length === 0) return;
      let value17: Dynamic = value16[0],
        value18: Dynamic = value16[value16.length - 1],
        activeElement: Dynamic = (document as Dynamic).activeElement;
      event.shiftKey &&
      (activeElement === value17 || !current.contains(activeElement))
        ? (event.preventDefault(), value18.focus())
        : !event.shiftKey &&
          (activeElement === value18 || !current.contains(activeElement)) &&
          (event.preventDefault(), value17.focus());
    };
  return (
    <CdsIsland density={"compact"} className={"contents"}>
      <PopoverPopoverRootTriggerPopupConfig.Root
        open={true}
        modal={true}
        onOpenChange={(input?: Dynamic, options?: Dynamic): Dynamic => {
          input ||
            (options.reason === "escape-key" &&
              options.event.preventDefault(),
            onCancel());
        }}
      >
        <PopoverPopoverRootTriggerPopupConfig.Popup
          anchor={value10}
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
            ref={value6}
            onKeyDown={(input?: Dynamic): Dynamic => {
              onActivity?.();
              callback2(input);
            }}
            className={"flex flex-col gap-sm"}
          >
            <FieldExports.Root invalid={value3}>
              <div className={"flex items-center gap-sm"}>
                <TextInput
                  ref={value5}
                  size={"sm"}
                  inputMode={"url"}
                  value={value}
                  placeholder={"https://\u2026"}
                  aria-label={uiMessage("inspector.linkPopover.linkURL")}
                  autoFocus={true}
                  onFocus={(input?: Dynamic): Dynamic =>
                    input.currentTarget.select()
                  }
                  onChange={(input?: Dynamic): Dynamic => {
                    onActivity?.();
                    value2(input.currentTarget.value);
                    value4(false);
                  }}
                  onKeyDown={(event?: Dynamic): Dynamic => {
                    event.key === "Enter" &&
                      (event.preventDefault(), callback());
                  }}
                  data-testid={"dc-link-url-input"}
                />
                <Button
                  size={"sm"}
                  disabled={value13}
                  onClick={callback}
                  data-testid={"dc-link-apply"}
                >
                  {uiMessage("inspector.linkPopover.apply")}
                </Button>
              </div>
              {value3 && (<FieldExports.Error match={true}>
                  {uiMessage("inspector.linkPopover.enterAWebAddressLikeHttpsExampleCom")}
                </FieldExports.Error>)}
              {value13 && (<FieldExports.Description className={"text-caption"}>
                  {uiMessage("inspector.linkPopover.selectSomeTextToLinkIt")}
                </FieldExports.Description>)}
              {value15 && !value13 && (<FieldExports.Description
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
    (0, defineLiveExports)(linkPopoverExports, {
      DcLinkPopover: (): Dynamic => DcLinkPopover,
    });
    initializeInspectorLinkPopover = (0, initializeOnce)(
      (): Dynamic => {
        "use strict";

        reactInspectorLinkPopover = (0, toModuleNamespace)(
          (0, load_react)(),
          1,
        );
        (0, initializeCdsIndex)();
        (0, initializePlatformCdsIsland)();
        (0, initializeInspectorContext)();
        (0, initializeEditorAttributeValidation)();
        jsxInspectorLinkPopover = (0, toModuleNamespace)(
          (0, load_react_jsx_runtime)(),
          1,
        );
      },
    );
  };
}
