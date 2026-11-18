import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { Surface } from "../cds/components/surface";
import { TextInput } from "../cds/components/text-input";
import { initializeCdsIndex } from "../cds/index";
import { CdsRoot } from "../cds/theme/root";
import { TooltipGroup } from "../cds/tooltip/tooltip";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { editableElementSelector } from "../editor/chrome/focus";
import { findDirectionShortcut, isFindShortcut, McFindAttribute, registerFindOwner } from "../editor/keyboard/find";
import { ToolbarPrimitivesComponent } from "../editor/toolbar/primitives";
import { toModuleNamespace } from "../module-helpers";
import { PanelValue } from "../platform/frame-host-bridge";

var react_Kw: Dynamic;
var findInPageLabel: Dynamic;
var previousFindMatchLabel: Dynamic;
var nextFindMatchLabel: Dynamic;
var closeFindBarLabel: Dynamic;
var findFieldPlaceholder: Dynamic;
var noFindMatchesLabel: Dynamic;
var jsx_tv: Dynamic;
var findBarStyle: Dynamic;
var findFieldStyle: Dynamic;
var findCountStyle: Dynamic;
var findLiveAnnouncementStyle: Dynamic;
function findMatchAriaStatus(
  current?: Dynamic,
  total?: Dynamic,
  capped?: Dynamic,
  description?: Dynamic,
): Dynamic {
  return total === 0
    ? noFindMatchesLabel
    : String(current) +
        " of " +
        String(total) +
        (capped ? " or more" : "") +
        (description === undefined ? "" : ", " + description);
}
function findMatchCountText(status?: Dynamic): Dynamic {
  return status.query === "" || status.searching
    ? ""
    : String(status.current) +
        "/" +
        String(status.total) +
        (status.capped ? "+" : "");
}
function FindBar(props?: Dynamic): Dynamic {
  useUiLocale();
  let { onMounted: value }: Dynamic = props;
  (0, react_Kw.useEffect)(
    (): Dynamic => (value(true), (): Dynamic => value(false)),
    [value],
  );
  return props.open ? <FindBarContents {...props} /> : null;
}
function createStableFindStatusReader(getStatus?: Dynamic): Dynamic {
  let value: Dynamic = null;
  return (): Dynamic => {
    let value2: Dynamic = getStatus();
    value2.query === ""
      ? (value = null)
      : value2.searching || (value = value2);
    return value2.searching && value !== null ? value : value2;
  };
}
function FindBarContents({
  subscribe: subscribe,
  getStatus: getStatus,
  fieldRef: fieldRef,
  onQuery: onQuery,
  onStep: onStep,
  onClose: onClose,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, react_Kw.useMemo)(
      (): Dynamic => createStableFindStatusReader(getStatus),
      [getStatus],
    ),
    value2: Dynamic = (0, react_Kw.useSyncExternalStore)(subscribe, value),
    [value3, value4]: Dynamic = (0, react_Kw.useState)(""),
    value5: Dynamic = (0, react_Kw.useRef)(null),
    value6: Dynamic = (0, react_Kw.useRef)((): Dynamic => false);
  value6.current = (event?: Dynamic): Dynamic => {
    if (event.isComposing || event.keyCode === 229) return false;
    let current: Dynamic = fieldRef.current,
      value9: Dynamic =
        event.key === "Enter" && event.target === current
          ? event.shiftKey
            ? -1
            : 1
          : findDirectionShortcut(event);
    if (event.key === "Escape") onClose();
    else if (value9 !== undefined) onStep(value9);
    else if (isFindShortcut(event)) {
      current?.focus();
      current?.select();
    } else return false;
    event.preventDefault();
    return true;
  };
  (0, react_Kw.useEffect)(
    (): Dynamic =>
      value5.current === null
        ? undefined
        : registerFindOwner(
            value5.current,
            (input?: Dynamic): Dynamic => value6.current(input),
          ),
    [],
  );
  let callback: Dynamic = (event?: Dynamic): Dynamic => {
      event.target.closest(editableElementSelector) === null &&
        event.preventDefault();
    },
    value7: Dynamic = value2.total === 0,
    value8: Dynamic =
      value2.query === ""
        ? findFieldPlaceholder
        : value2.searching
          ? undefined
          : noFindMatchesLabel;
  return (
    <CdsRoot
      density={"compact"}
      render={
        <Surface
          elevation={PanelValue}
          role={"search"}
          aria-label={findInPageLabel}
          data-mc-chrome={""}
          {...{
            [McFindAttribute]: "",
          }}
          style={findBarStyle}
          ref={value5}
          onMouseDown={callback}
        />
      }
    >
      <TooltipGroup>
        <TextInput
          ref={fieldRef}
          value={value3}
          onChange={(event?: Dynamic): Dynamic => {
            value4(event.target.value);
            event.nativeEvent.isComposing || onQuery(event.target.value);
          }}
          onCompositionEnd={(input?: Dynamic): Dynamic =>
            onQuery(input.currentTarget.value)
          }
          placeholder={findInPageLabel}
          aria-label={findInPageLabel}
          autoComplete={"off"}
          spellCheck={false}
          maxLength={200}
          className={"pointer-coarse:h-10"}
          style={findFieldStyle}
        />
        <span
          role={"status"}
          aria-atomic={"true"}
          className={"text-muted text-caption"}
          style={findCountStyle}
        >
          <span aria-hidden={"true"}>{findMatchCountText(value2)}</span>
          <span style={findLiveAnnouncementStyle}>
            {findMatchCountText(value2) === "" ? ("") : (findMatchAriaStatus(
                  value2.current,
                  value2.total,
                  value2.capped,
                  value2.place,
                ))}
          </span>
        </span>
        <ToolbarPrimitivesComponent
          iconOnly={true}
          icon={"ArrowUp"}
          label={previousFindMatchLabel}
          disabled={value7}
          disabledTip={value8}
          onClick={(): Dynamic => onStep(-1)}
        />
        <ToolbarPrimitivesComponent
          iconOnly={true}
          icon={"ArrowDown"}
          label={nextFindMatchLabel}
          disabled={value7}
          disabledTip={value8}
          onClick={(): Dynamic => onStep(1)}
        />
        <ToolbarPrimitivesComponent
          iconOnly={true}
          icon={"X"}
          label={closeFindBarLabel}
          onClick={onClose}
        />
      </TooltipGroup>
    </CdsRoot>
  );
}
export {
  closeFindBarLabel,
  createStableFindStatusReader,
  FindBar,
  FindBarContents,
  findBarStyle,
  findCountStyle,
  findFieldPlaceholder,
  findFieldStyle,
  findInPageLabel,
  findLiveAnnouncementStyle,
  findMatchAriaStatus,
  findMatchCountText,
  jsx_tv,
  nextFindMatchLabel,
  noFindMatchesLabel,
  previousFindMatchLabel,
  react_Kw,
};
export function installFindBar(): () => void {
  return () => {
    react_Kw = toModuleNamespace(load_react(), 1);
    initializeCdsIndex();
    findInPageLabel = "Find in page";
    previousFindMatchLabel = "Previous match";
    nextFindMatchLabel = "Next match";
    closeFindBarLabel = "Close find bar";
    findFieldPlaceholder = "Type to search";
    noFindMatchesLabel = "No matches";
    jsx_tv = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    findBarStyle = {
      position: "absolute",
      top: "max(var(--tb-overlay-h, 0px), 8px)",
      insetInlineEnd: 12,
      zIndex: 49,
      display: "flex",
      alignItems: "center",
      gap: 4,
      padding: 5,
      width: 320,
      maxWidth: "calc(100% - 24px)",
    };
    findFieldStyle = {
      flex: "1 1 0",
      minWidth: 0,
    };
    findCountStyle = {
      minWidth: "3.5em",
      textAlign: "end",
      fontVariantNumeric: "tabular-nums",
      whiteSpace: "nowrap",
    };
    findLiveAnnouncementStyle = {
      position: "absolute",
      width: 1,
      height: 1,
      overflow: "hidden",
      clipPath: "inset(50%)",
      whiteSpace: "nowrap",
    };
  };
}
