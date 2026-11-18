import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { load_react_jsx_runtime } from "../../dependencies";
import { reactInspectorArtboardRadius } from "../inspector/artboard-radius";
import { keyboardShortcutLabel } from "../keyboard/shortcuts";
import { EditorIcon } from "../properties/primitives";
import { TextAlignCenterValue, TextAlignJustifyValue, TextAlignLeftValue, TextAlignRightValue } from "../properties/tooltip";
import { SessionActionsPopover, SessionChoicePopup, SessionTypographyPopup } from "./popups";
import { SelectionSessionActions } from "./selection-actions";
import { SessionStripButton, SessionStripDivider, SessionStripGroup } from "./session-strip";
import { toModuleNamespace } from "../../module-helpers";

var jsxSessionStripText: Dynamic;
var SessionStripTextNoneBulletNumberConfig: Dynamic;
var SessionStripTextItems: Dynamic;
var SessionStripTextStartCenterEndConfig: Dynamic;
var SessionStripTextStartCenterEndConfig_2: Dynamic;
var SessionStripTextClassNames: Dynamic;
function SessionLinkInput({
  value: value,
  invalid: invalid,
  invalidHint: invalidHint,
  onChange: onChange,
  onKeyDown: onKeyDown,
  onBlur: onBlur,
  onCancel: onCancel,
  onRemove: onRemove,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <span
      className={"flex items-center gap-1"}
      data-link-mode={""}
      onKeyDown={(event?: Dynamic): Dynamic => {
        event.key !== "Escape" ||
          event.defaultPrevented ||
          (event.preventDefault(), event.stopPropagation(), onCancel());
      }}
    >
      <span
        aria-hidden={"true"}
        className={
          "inline-flex h-6 w-6 items-center justify-center text-muted"
        }
      >
        <EditorIcon name={"Link"} />
      </span>
      <input
        autoFocus={true}
        aria-label={uiMessage("inspector.text.linkURL")}
        placeholder={"https://\u2026"}
        value={value}
        aria-invalid={invalid || undefined}
        onChange={(event?: Dynamic): Dynamic => onChange(event.target.value)}
        onPointerDown={(input?: Dynamic): Dynamic => input.stopPropagation()}
        onBlur={onBlur}
        onKeyDown={(input?: Dynamic): Dynamic => {
          input.stopPropagation();
          onKeyDown(input);
        }}
        className={SessionStripTextClassNames}
        title={
          invalid ? (invalidHint ?? (uiMessage("inspector.text.enterAnHttpOrHttps"))) : (undefined)
        }
      />
      {onRemove !== undefined && (<SessionStripButton
          icon={"Trash"}
          aria-label={uiMessage("inspector.text.removeLink")}
          title={uiMessage("inspector.text.removeTheLink")}
          onClick={onRemove}
        />)}
      <SessionStripButton
        icon={"X"}
        aria-label={uiMessage("inspector.text.cancelLink")}
        title={uiMessage("inspector.text.cancelEsc")}
        onClick={onCancel}
      />
    </span>
  );
}
function normalizeSessionLink(input?: Dynamic): Dynamic {
  let value: Dynamic = /^https?:\/\//i.test(input.trim())
    ? input.trim()
    : "https://" + input.trim();
  value = value.replace(
    /^https?:\/\//i,
    (input2?: Dynamic): Dynamic => input2.toLowerCase(),
  );
  return /^https?:\/\/\S+$/.test(value) && value.length <= 2048
    ? value
    : null;
}
function TextSessionStrip(input?: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = input.testidPrefix ?? "frame-text",
    [value2, value3]: Dynamic = (0,
    reactInspectorArtboardRadius.useState)(null),
    [value4, value5]: Dynamic = (0,
    reactInspectorArtboardRadius.useState)(false),
    callback: Dynamic = (): Dynamic => {
      value3(null);
      value5(false);
    },
    value6: Dynamic =
      input.link !== undefined && "onChange" in input.link
        ? input.link
        : null;
  if (value6 !== null && value2 !== null)
    return (
      <SessionLinkInput
        value={value2}
        invalid={value4}
        invalidHint={value6.invalidHint}
        onChange={(input2?: Dynamic): Dynamic => {
          value5(false);
          value3(input2);
        }}
        onBlur={(input2?: Dynamic): Dynamic => {
          input2.relatedTarget?.closest("[data-link-mode]") || callback();
        }}
        onCancel={callback}
        onRemove={
          value6.editable && value6.href !== undefined
            ? (): Dynamic => {
                value6.onChange(undefined);
                callback();
              }
            : undefined
        }
        onKeyDown={(event?: Dynamic): Dynamic => {
          event.key === "Escape" && (event.preventDefault(), callback());
          if (event.key === "Enter") {
            event.preventDefault();
            let value8: Dynamic = (value6.normalize ?? normalizeSessionLink)(
              value2,
            );
            if (value8 === null) return value5(true);
            value6.onChange(value8);
            callback();
          }
        }}
      />
    );
  let selKey: Dynamic = input.selKey,
    callback2: Dynamic = (
      input2?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value8?: Dynamic,
    ): Dynamic => (
      <SessionStripButton
        data-testid={value + "-" + input2.toLowerCase()}
        title={
          (context.disabledReason) ?? ((context.title ?? ({ Bold: uiMessage("inspector.text.bold"), Italic: uiMessage("inspector.text.italic"), Underline: uiMessage("inspector.text.underline"), Link: uiMessage("inspector.text.link") }[input2])) + (value8 !== undefined && input.shortcuts !== false ? (((" (") + (keyboardShortcutLabel(value8))) + (")")) : ("")))
        }
        aria-label={({ Bold: uiMessage("inspector.text.bold"), Italic: uiMessage("inspector.text.italic"), Underline: uiMessage("inspector.text.underline"), Link: uiMessage("inspector.text.link") }[input2])}
        aria-pressed={
          context.disabledReason != null ? undefined : context.pressed
        }
        disabled={context.disabledReason != null}
        icon={options}
        onClick={context.onClick}
      />
    ),
    value7: Dynamic = (
      input.align?.options ?? ["start", "center", "end", "justify"]
    ).map(
      (input2?: Dynamic): Dynamic => ({
        value: input2,
        label: SessionStripTextStartCenterEndConfig[input2],
        icon: SessionStripTextStartCenterEndConfig_2[input2],
        disabledReason: input.align?.disabledReasons?.[input2],
      }),
    );
  return (
    <jsxSessionStripText.Fragment>
      <SessionStripGroup wrap={true}>
        {input.style !== undefined && (<SessionTypographyPopup
            key={"ts:" + selKey}
            testid={value + "-style"}
            value={input.style.value}
            chipText={input.style.chipText}
            options={input.style.options}
            onChange={input.style.onChange}
            custom={input.style.custom}
          />)}
        {input.color !== undefined && (<SessionActionsPopover
            key={"c:" + selKey}
            {...input.color}
            testid={input.color.testid ?? value + "-color"}
          />)}
        {callback2("Bold", "TextBold", input.bold, "B")}
        {callback2("Italic", "TextItalics", input.italic, "I")}
        {input.underline !== undefined && (callback2("Underline", "TextUnderline", input.underline, "U"))}
        {input.link !== undefined && (value6 !== null ? (<SessionStripButton
              data-testid={value + "-link"}
              icon={"Link"}
              aria-label={uiMessage("inspector.text.link")}
              title={
                value6.disabledReason ?? (value6.editable ? (value6.href !== undefined ? (uiMessage("inspector.text.editTheLink", { value1: String(value6.href) })) : (uiMessage("inspector.text.setTheLink"))) : (value6.href !== undefined ? (uiMessage("inspector.text.removeTheLink2", { value1: String(value6.href) })) : (uiMessage("inspector.text.linkTheWholeText"))))
              }
              aria-pressed={value6.href !== undefined}
              disabled={value6.disabledReason != null}
              onClick={(): Dynamic =>
                value6.editable
                  ? value3(value6.href ?? "")
                  : value6.href !== undefined
                    ? value6.onChange(undefined)
                    : value3("")
              }
            />) : (callback2("Link", "Link", input.link)))}
      </SessionStripGroup>
      {input.list !== undefined || input.align !== undefined && (<jsxSessionStripText.Fragment>
          {input.compact ? (null) : (<SessionStripDivider />)}
          <SessionStripGroup wrap={true}>
            {input.list !== undefined && (<SessionChoicePopup
                key={"li:" + selKey}
                testid={value + "-list"}
                title={
                  input.list.disabledReason ?? (uiMessage("inspector.text.list", { value1: String(input.list.value === null ? (uiMessage("inspector.text.mixed")) : (SessionStripTextNoneBulletNumberConfig[
                          input.list.value
                        ])) }))
                }
                face={
                  input.list.value === "number"
                    ? "ListNumbered"
                    : "ListBullet"
                }
                value={input.list.value}
                options={SessionStripTextItems}
                onChange={input.list.onChange}
                disabled={input.list.disabledReason != null}
              />)}
            {input.align !== undefined && (<SessionChoicePopup
                key={"al:" + selKey}
                testid={value + "-align"}
                title={
                  uiMessage("inspector.text.alignment", { value1: String(input.align.value === null ? (uiMessage("inspector.text.mixed")) : (SessionStripTextStartCenterEndConfig[input.align.value])) })
                }
                face={
                  SessionStripTextStartCenterEndConfig_2[
                    input.align.value ?? "start"
                  ]
                }
                value={input.align.value}
                options={value7}
                onChange={input.align.onChange}
              />)}
          </SessionStripGroup>
        </jsxSessionStripText.Fragment>)}
      {input.extra != null && (<jsxSessionStripText.Fragment>
          {input.compact ? (null) : (<SessionStripDivider />)}
          <reactInspectorArtboardRadius.Fragment key={"x:" + selKey}>
            {input.extra}
          </reactInspectorArtboardRadius.Fragment>
        </jsxSessionStripText.Fragment>)}
      {input.trailing != null && (<jsxSessionStripText.Fragment>
          {input.compact ? (null) : (<SessionStripDivider />)}
          {input.trailing}
        </jsxSessionStripText.Fragment>)}
      {input.onEdit !== undefined ||
        input.onComment !== null ||
        input.onOpenInspector !== undefined ||
        input.inspectorDisabledReason !== undefined && (<jsxSessionStripText.Fragment>
          {input.compact ? (null) : (<SessionStripDivider />)}
          <SelectionSessionActions
            lead={
              input.onEdit !== undefined ? (
                <SessionStripButton
                  data-testid={value + "-edit"}
                  icon={"Edit"}
                  title={uiMessage("inspector.text.editTheText")}
                  aria-label={uiMessage("inspector.text.editText")}
                  onClick={input.onEdit}
                />
              ) : undefined
            }
            onComment={input.onComment}
            onOpenInspector={input.onOpenInspector}
            disabledReason={input.inspectorDisabledReason}
            testids={input.tailTestids}
          />
        </jsxSessionStripText.Fragment>)}
    </jsxSessionStripText.Fragment>
  );
}
export {
  jsxSessionStripText,
  normalizeSessionLink,
  SessionLinkInput,
  SessionStripTextClassNames,
  SessionStripTextItems,
  SessionStripTextNoneBulletNumberConfig,
  SessionStripTextStartCenterEndConfig,
  SessionStripTextStartCenterEndConfig_2,
  TextSessionStrip,
};
export function installEditorSessionStripText(): () => void {
  return () => {
    jsxSessionStripText = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    SessionStripTextNoneBulletNumberConfig = {
      get none() { return uiMessage("inspector.text.none"); },
      get bullet() { return uiMessage("inspector.text.bulletedList"); },
      get number() { return uiMessage("inspector.text.numberedList"); },
    };
    SessionStripTextItems = [
      {
        value: "none",
        get label() { return SessionStripTextNoneBulletNumberConfig.none; },
        icon: "Prohibit",
      },
      {
        value: "bullet",
        get label() { return SessionStripTextNoneBulletNumberConfig.bullet; },
        icon: "ListBullet",
      },
      {
        value: "number",
        get label() { return SessionStripTextNoneBulletNumberConfig.number; },
        icon: "ListNumbered",
      },
    ];
    SessionStripTextStartCenterEndConfig = {
      start: "Left",
      center: "Center",
      end: "Right",
      get justify() { return uiMessage("inspector.text.justify"); },
    };
    SessionStripTextStartCenterEndConfig_2 = {
      start: TextAlignLeftValue,
      center: TextAlignCenterValue,
      end: TextAlignRightValue,
      justify: TextAlignJustifyValue,
    };
    SessionStripTextClassNames =
      "h-control w-72 rounded bg-fill-field px-2 text-body text-primary shadow-field-ring outline-none placeholder:text-muted focus-visible:outline-hidden focus-visible:shadow-focus aria-[invalid]:shadow-[0_0_0_2px_var(--cds-color-border-danger,#d9534f)] pointer-coarse:h-10 pointer-coarse:w-56";
  };
}
