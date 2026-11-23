import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { cn, initializeClassNames } from "../theme/class-names";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { initializeOnce, toModuleNamespace } from "../../module-helpers";

var reactComponentsShortcut: Dynamic;
var jsxComponentsShortcut: Dynamic;
var ComponentsShortcutClassNames: Dynamic;
var singleKeyWidthClassName: Dynamic;
var multiKeyMinWidthClassName: Dynamic;
var ComponentsShortcutLabel: Dynamic;
var ComponentsShortcutKeycapTextConfig: Dynamic;
var ThenValue: Dynamic;
var Value: Dynamic;
var ComponentsShortcutIphoneIpadPattern: Dynamic;
var ComponentsShortcutHandler: Dynamic;
var ComponentsShortcutCmdCommandMetaValues: Dynamic;
var ComponentsShortcutIncludes: Dynamic;
var ComponentsShortcutCtrlControlAltValues: Dynamic;
var ComponentsShortcutCtrlControlAltConfig: Dynamic;
var pcModifierLabels: Dynamic;
var ComponentsShortcutSpaceEnterReturnConfig: Dynamic;
var pcKeyLabels: Dynamic;
var ComponentsShortcutCmdCommandMetaConfig: Dynamic;
var eventKeyNames: Dynamic;
var initializeComponentsShortcut: Dynamic;
function shortcutKeycapClassName(label?: Dynamic): Dynamic {
  return `${ComponentsShortcutClassNames} ${Array.from(label ?? "").length === 1 ? singleKeyWidthClassName : multiKeyMinWidthClassName}`;
}
function Shortcut({
  keys: keys,
  variant = "keycap",
  onFill = false,
  className: className,
  ...props
}: Dynamic): Dynamic {
  useUiLocale();
  let isAppleKeyboard: Dynamic = useAppleKeyboard(),
    chords: Dynamic = splitShortcutChords(keys).map(
      (chord?: Dynamic): Dynamic => formatShortcutChord(chord, isAppleKeyboard),
    ),
    isPlainText: Dynamic = variant === "text" && !isAppleKeyboard;
  return (
    <span
      {...props}
      data-cds={"Shortcut"}
      data-variant={variant}
      className={cn(
        ComponentsShortcutKeycapTextConfig[variant],
        onFill && "[--cds-shortcut-cap-ink:currentColor]",
        className,
      )}
    >
      {chords.map(
        (chord?: Dynamic, chordIndex?: Dynamic): Dynamic => (
          <reactComponentsShortcut.Fragment key={chordIndex}>
            {chordIndex > 0 && (<span
                className={"px-[2px] [color:var(--cds-shortcut-cap-ink)]"}
              >
                {ThenValue}
              </span>)}
            {chord.map(
              (
                { label: label, spoken: spoken }: Dynamic,
                keyIndex?: Dynamic,
              ): Dynamic => (
                <reactComponentsShortcut.Fragment key={keyIndex}>
                  {isPlainText && keyIndex > 0 && (<span
                      className={
                        "mx-[-0.3em] [color:var(--cds-shortcut-cap-ink)]"
                      }
                    >
                      {Value}
                    </span>)}
                  <kbd
                    className={
                      variant === "text"
                        ? ComponentsShortcutLabel
                        : shortcutKeycapClassName(label)
                    }
                  >
                    {spoken === undefined ? (label) : (isPlainText ? (spoken) : (<jsxComponentsShortcut.Fragment>
                        <span aria-hidden={"true"}>{label}</span>
                        <span className={"sr-only select-none"}>
                          {spoken}
                        </span>
                      </jsxComponentsShortcut.Fragment>))}
                  </kbd>
                </reactComponentsShortcut.Fragment>
              ),
            )}
          </reactComponentsShortcut.Fragment>
        ),
      )}
    </span>
  );
}
function useAppleKeyboard(): Dynamic {
  return (0, reactComponentsShortcut.useSyncExternalStore)(
    ComponentsShortcutHandler,
    (): Dynamic =>
      ComponentsShortcutIphoneIpadPattern.test(navigator.userAgent),
    (): Dynamic => false,
  );
}
function getOwnPropertyValue(table?: Dynamic, key?: Dynamic): Dynamic {
  return Object.hasOwn(table, key) ? table[key] : undefined;
}
function getShortcutKeyLabel(key?: Dynamic, isApple?: Dynamic): Dynamic {
  let mappedLabel: Dynamic = getOwnPropertyValue(
    isApple
      ? ComponentsShortcutSpaceEnterReturnConfig
      : pcKeyLabels,
    key,
  );
  return mappedLabel !== undefined
    ? mappedLabel
    : /^f\d+$/.test(key) || key.length === 1
      ? key.toUpperCase()
      : key.charAt(0).toUpperCase() + key.slice(1);
}
function splitShortcutChords(shortcut?: Dynamic): Dynamic {
  let normalized: Dynamic = shortcut.trim().replace(/\s*\+\s*/g, "+");
  return normalized ? normalized.split(/\s+/) : [];
}
function parseShortcutChord(chord?: Dynamic, isApple?: Dynamic): Dynamic {
  let tokens: Dynamic = chord
      .toLowerCase()
      .split("+")
      .map((token?: Dynamic): Dynamic => token.trim())
      .filter((token?: Dynamic): Dynamic => token !== ""),
    modifierTokens: Dynamic = [],
    keyTokens: Dynamic = [];
  for (let token of tokens as Dynamic)
    ComponentsShortcutIncludes(token)
      ? modifierTokens.push(token)
      : keyTokens.push(token);
  let modifierOrder: Dynamic = (token?: Dynamic): Dynamic =>
    ComponentsShortcutCtrlControlAltValues.indexOf(
      !isApple &&
        (token === "cmd" || token === "command" || token === "meta")
        ? "ctrl"
        : token,
    );
  modifierTokens.sort(
    (first?: Dynamic, second?: Dynamic): Dynamic =>
      modifierOrder(first) - modifierOrder(second),
  );
  return {
    modifiers: modifierTokens,
    keys: keyTokens,
  };
}
function formatShortcutChord(chord?: Dynamic, isApple?: Dynamic): Dynamic {
  let { modifiers: modifiers, keys: keys }: Dynamic = parseShortcutChord(
      chord,
      isApple,
    ),
    modifierLabels: Dynamic = isApple
      ? ComponentsShortcutCtrlControlAltConfig
      : pcModifierLabels,
    toKeycap: Dynamic = (token?: Dynamic, label?: Dynamic): Dynamic => {
      if (/^[A-Za-z0-9 ]+$/.test(label))
        return {
          label: label,
        };
      let spoken: Dynamic = getOwnPropertyValue(
        ComponentsShortcutCmdCommandMetaConfig,
        token,
      );
      return spoken === undefined
        ? {
            label: label,
          }
        : {
            label: label,
            spoken: spoken,
          };
    };
  return [
    ...modifiers.map(
      (token?: Dynamic): Dynamic => toKeycap(token, modifierLabels[token]),
    ),
    ...keys.map(
      (token?: Dynamic): Dynamic =>
        toKeycap(token, getShortcutKeyLabel(token, isApple)),
    ),
  ];
}
function parseSingleShortcut(shortcut?: Dynamic, isApple?: Dynamic): Dynamic {
  let [firstChord, ...extraChords]: Dynamic = splitShortcutChords(shortcut);
  if (firstChord === undefined || extraChords.length > 0) return;
  let { modifiers: modifiers, keys: keys }: Dynamic = parseShortcutChord(
    firstChord,
    isApple,
  );
  if (keys.length !== 1) return;
  let commandKey: Dynamic = isApple ? "Meta" : "Control",
    toEventKey: Dynamic = (token?: Dynamic): Dynamic =>
      token === "cmd" || token === "command" || token === "meta"
        ? commandKey
        : (getOwnPropertyValue(
            eventKeyNames,
            token,
          ) ??
          (/^f\d+$/.test(token)
            ? token.toUpperCase()
            : token.length === 1
              ? token
              : token.charAt(0).toUpperCase() + token.slice(1)));
  return [...modifiers, ...keys].map(toEventKey).join("+");
}
export {
  ComponentsShortcutClassNames,
  singleKeyWidthClassName,
  multiKeyMinWidthClassName,
  ComponentsShortcutCmdCommandMetaConfig,
  ComponentsShortcutCmdCommandMetaValues,
  ComponentsShortcutCtrlControlAltConfig,
  ComponentsShortcutCtrlControlAltValues,
  ComponentsShortcutHandler,
  ComponentsShortcutIncludes,
  ComponentsShortcutIphoneIpadPattern,
  ComponentsShortcutKeycapTextConfig,
  ComponentsShortcutLabel,
  ComponentsShortcutSpaceEnterReturnConfig,
  formatShortcutChord,
  getOwnPropertyValue,
  getShortcutKeyLabel,
  initializeComponentsShortcut,
  jsxComponentsShortcut,
  parseShortcutChord,
  parseSingleShortcut,
  reactComponentsShortcut,
  Shortcut,
  shortcutKeycapClassName,
  splitShortcutChords,
  ThenValue,
  useAppleKeyboard,
  Value,
};
export function installCdsComponentsShortcut(): () => void {
  return () => {
    initializeComponentsShortcut = initializeOnce((): Dynamic => {
      "use client";

      initializeClassNames();
      reactComponentsShortcut = toModuleNamespace(
        load_react(),
      );
      jsxComponentsShortcut = toModuleNamespace(
        load_react_jsx_runtime(),
      );
      ComponentsShortcutClassNames =
        "inline-flex shrink-0 items-center justify-center h-[calc(1em+6px)] rounded-[var(--cds-keycap-radius,4px)] [color:var(--cds-shortcut-cap-ink)] bg-[color:var(--cds-shortcut-cap-fill)] border border-[color:var(--cds-shortcut-cap-line)] font-inherit [font-variation-settings:inherit] [line-height:1]";
      singleKeyWidthClassName = "w-[calc(1em+6px)] px-0";
      multiKeyMinWidthClassName = "min-w-[calc(1em+6px)] px-[3px]";
      ComponentsShortcutLabel =
        "font-inherit [font-variation-settings:inherit] [color:var(--cds-shortcut-cap-ink)]";
      ComponentsShortcutKeycapTextConfig = {
        keycap: "inline-flex shrink-0 items-center gap-[2px] text-caption",
        text: "inline-flex shrink-0 items-baseline gap-[0.3em] text-caption",
      };
      ThenValue = "then";
      Value = "+";
      ComponentsShortcutIphoneIpadPattern = /mac|iphone|ipad|ipod/i;
      ComponentsShortcutHandler = (): Dynamic => (): Dynamic => {};
      ComponentsShortcutCmdCommandMetaValues = [
        "cmd",
        "command",
        "meta",
        "ctrl",
        "control",
        "alt",
        "option",
        "shift",
      ];
      ComponentsShortcutIncludes = (token?: Dynamic): Dynamic =>
        ComponentsShortcutCmdCommandMetaValues.includes(token);
      ComponentsShortcutCtrlControlAltValues = [
        "ctrl",
        "control",
        "alt",
        "option",
        "shift",
        "cmd",
        "command",
        "meta",
      ];
      ComponentsShortcutCtrlControlAltConfig = {
        ctrl: "\u2303",
        control: "\u2303",
        alt: "\u2325",
        option: "\u2325",
        shift: "\u21E7",
        cmd: "\u2318",
        command: "\u2318",
        meta: "\u2318",
      };
      pcModifierLabels = {
        ctrl: "Ctrl",
        control: "Ctrl",
        alt: "Alt",
        option: "Alt",
        shift: "Shift",
        cmd: "Ctrl",
        command: "Ctrl",
        meta: "Ctrl",
      };
      ComponentsShortcutSpaceEnterReturnConfig = {
        space: "\u2423",
        enter: "\u23CE",
        return: "\u23CE",
        delete: "\u232B",
        backspace: "\u232B",
        escape: "Esc",
        esc: "Esc",
        tab: "\u21E5",
        up: "\u2191",
        down: "\u2193",
        left: "\u2190",
        right: "\u2192",
        pageup: "Page Up",
        pagedown: "Page Down",
        home: "Home",
        end: "End",
        insert: "Insert",
      };
      pcKeyLabels = {
        space: "Space",
        enter: "\u23CE",
        return: "\u23CE",
        delete: "Backspace",
        backspace: "Backspace",
        escape: "Esc",
        esc: "Esc",
        tab: "Tab",
        up: "\u2191",
        down: "\u2193",
        left: "\u2190",
        right: "\u2192",
        pageup: "Page Up",
        pagedown: "Page Down",
        home: "Home",
        end: "End",
        insert: "Insert",
      };
      ComponentsShortcutCmdCommandMetaConfig = {
        cmd: "Command",
        command: "Command",
        meta: "Command",
        get ctrl() { return uiMessage("canvas.shortcut.control"); },
        get control() { return uiMessage("canvas.shortcut.control"); },
        alt: "Option",
        option: "Option",
        shift: "Shift",
        enter: "Enter",
        return: "Enter",
        space: "Space",
        tab: "Tab",
        get delete() { return uiMessage("canvas.shortcut.delete"); },
        get backspace() { return uiMessage("canvas.shortcut.delete"); },
        up: "Up",
        down: "Down",
        left: "Left",
        right: "Right",
      };
      eventKeyNames = {
        get ctrl() { return uiMessage("canvas.shortcut.control"); },
        get control() { return uiMessage("canvas.shortcut.control"); },
        alt: "Alt",
        option: "Alt",
        shift: "Shift",
        enter: "Enter",
        return: "Enter",
        escape: "Escape",
        esc: "Escape",
        space: "Space",
        tab: "Tab",
        delete: "Backspace",
        backspace: "Backspace",
        up: "ArrowUp",
        down: "ArrowDown",
        left: "ArrowLeft",
        right: "ArrowRight",
        home: "Home",
        end: "End",
        pageup: "PageUp",
        pagedown: "PageDown",
        insert: "Insert",
      };
    });
  };
}
