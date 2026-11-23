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
var textAlignmentIcons: Dynamic;
var SessionStripTextClassNames: Dynamic;
function SessionLinkInput({
  value: linkText,
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
        value={linkText}
        aria-invalid={invalid || undefined}
        onChange={(event?: Dynamic): Dynamic => onChange(event.target.value)}
        onPointerDown={(event?: Dynamic): Dynamic => event.stopPropagation()}
        onBlur={onBlur}
        onKeyDown={(event?: Dynamic): Dynamic => {
          event.stopPropagation();
          onKeyDown(event);
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
function normalizeSessionLink(rawLink?: Dynamic): Dynamic {
  let url: Dynamic = /^https?:\/\//i.test(rawLink.trim())
    ? rawLink.trim()
    : "https://" + rawLink.trim();
  url = url.replace(
    /^https?:\/\//i,
    (scheme?: Dynamic): Dynamic => scheme.toLowerCase(),
  );
  return /^https?:\/\/\S+$/.test(url) && url.length <= 2048
    ? url
    : null;
}
function TextSessionStrip(props?: Dynamic): Dynamic {
  useUiLocale();
  let testidPrefix: Dynamic = props.testidPrefix ?? "frame-text",
    [linkDraft, setLinkDraft]: Dynamic = (0,
    reactInspectorArtboardRadius.useState)(null),
    [isLinkInvalid, setIsLinkInvalid]: Dynamic = (0,
    reactInspectorArtboardRadius.useState)(false),
    closeLinkEditor: Dynamic = (): Dynamic => {
      setLinkDraft(null);
      setIsLinkInvalid(false);
    },
    linkConfig: Dynamic =
      props.link !== undefined && "onChange" in props.link
        ? props.link
        : null;
  if (linkConfig !== null && linkDraft !== null)
    return (
      <SessionLinkInput
        value={linkDraft}
        invalid={isLinkInvalid}
        invalidHint={linkConfig.invalidHint}
        onChange={(text?: Dynamic): Dynamic => {
          setIsLinkInvalid(false);
          setLinkDraft(text);
        }}
        onBlur={(event?: Dynamic): Dynamic => {
          event.relatedTarget?.closest("[data-link-mode]") || closeLinkEditor();
        }}
        onCancel={closeLinkEditor}
        onRemove={
          linkConfig.editable && linkConfig.href !== undefined
            ? (): Dynamic => {
                linkConfig.onChange(undefined);
                closeLinkEditor();
              }
            : undefined
        }
        onKeyDown={(event?: Dynamic): Dynamic => {
          event.key === "Escape" && (event.preventDefault(), closeLinkEditor());
          if (event.key === "Enter") {
            event.preventDefault();
            let normalizedLink: Dynamic = (linkConfig.normalize ?? normalizeSessionLink)(
              linkDraft,
            );
            if (normalizedLink === null) return setIsLinkInvalid(true);
            linkConfig.onChange(normalizedLink);
            closeLinkEditor();
          }
        }}
      />
    );
  let selKey: Dynamic = props.selKey,
    renderFormatButton: Dynamic = (
      label?: Dynamic,
      iconName?: Dynamic,
      buttonConfig?: Dynamic,
      shortcutKey?: Dynamic,
    ): Dynamic => (
      <SessionStripButton
        data-testid={testidPrefix + "-" + label.toLowerCase()}
        title={
          (buttonConfig.disabledReason) ?? ((buttonConfig.title ?? ({ Bold: uiMessage("inspector.text.bold"), Italic: uiMessage("inspector.text.italic"), Underline: uiMessage("inspector.text.underline"), Link: uiMessage("inspector.text.link") }[label])) + (shortcutKey !== undefined && props.shortcuts !== false ? (((" (") + (keyboardShortcutLabel(shortcutKey))) + (")")) : ("")))
        }
        aria-label={({ Bold: uiMessage("inspector.text.bold"), Italic: uiMessage("inspector.text.italic"), Underline: uiMessage("inspector.text.underline"), Link: uiMessage("inspector.text.link") }[label])}
        aria-pressed={
          buttonConfig.disabledReason != null ? undefined : buttonConfig.pressed
        }
        disabled={buttonConfig.disabledReason != null}
        icon={iconName}
        onClick={buttonConfig.onClick}
      />
    ),
    alignOptions: Dynamic = (
      props.align?.options ?? ["start", "center", "end", "justify"]
    ).map(
      (alignment?: Dynamic): Dynamic => ({
        value: alignment,
        label: SessionStripTextStartCenterEndConfig[alignment],
        icon: textAlignmentIcons[alignment],
        disabledReason: props.align?.disabledReasons?.[alignment],
      }),
    );
  return (
    <jsxSessionStripText.Fragment>
      <SessionStripGroup wrap={true}>
        {props.style !== undefined && (<SessionTypographyPopup
            key={"ts:" + selKey}
            testid={testidPrefix + "-style"}
            value={props.style.value}
            chipText={props.style.chipText}
            options={props.style.options}
            onChange={props.style.onChange}
            custom={props.style.custom}
          />)}
        {props.color !== undefined && (<SessionActionsPopover
            key={"c:" + selKey}
            {...props.color}
            testid={props.color.testid ?? testidPrefix + "-color"}
          />)}
        {renderFormatButton("Bold", "TextBold", props.bold, "B")}
        {renderFormatButton("Italic", "TextItalics", props.italic, "I")}
        {props.underline !== undefined && (renderFormatButton("Underline", "TextUnderline", props.underline, "U"))}
        {props.link !== undefined && (linkConfig !== null ? (<SessionStripButton
              data-testid={testidPrefix + "-link"}
              icon={"Link"}
              aria-label={uiMessage("inspector.text.link")}
              title={
                linkConfig.disabledReason ?? (linkConfig.editable ? (linkConfig.href !== undefined ? (uiMessage("inspector.text.editTheLink", { url: String(linkConfig.href) })) : (uiMessage("inspector.text.setTheLink"))) : (linkConfig.href !== undefined ? (uiMessage("inspector.text.removeLinkWithUrl", { url: String(linkConfig.href) })) : (uiMessage("inspector.text.linkTheWholeText"))))
              }
              aria-pressed={linkConfig.href !== undefined}
              disabled={linkConfig.disabledReason != null}
              onClick={(): Dynamic =>
                linkConfig.editable
                  ? setLinkDraft(linkConfig.href ?? "")
                  : linkConfig.href !== undefined
                    ? linkConfig.onChange(undefined)
                    : setLinkDraft("")
              }
            />) : (renderFormatButton("Link", "Link", props.link)))}
      </SessionStripGroup>
      {props.list !== undefined || props.align !== undefined && (<jsxSessionStripText.Fragment>
          {props.compact ? (null) : (<SessionStripDivider />)}
          <SessionStripGroup wrap={true}>
            {props.list !== undefined && (<SessionChoicePopup
                key={"li:" + selKey}
                testid={testidPrefix + "-list"}
                title={
                  props.list.disabledReason ?? (uiMessage("inspector.text.list", { style: String(props.list.value === null ? (uiMessage("inspector.text.mixed")) : (SessionStripTextNoneBulletNumberConfig[
                          props.list.value
                        ])) }))
                }
                face={
                  props.list.value === "number"
                    ? "ListNumbered"
                    : "ListBullet"
                }
                value={props.list.value}
                options={SessionStripTextItems}
                onChange={props.list.onChange}
                disabled={props.list.disabledReason != null}
              />)}
            {props.align !== undefined && (<SessionChoicePopup
                key={"al:" + selKey}
                testid={testidPrefix + "-align"}
                title={
                  uiMessage("inspector.text.alignment", { alignment: String(props.align.value === null ? (uiMessage("inspector.text.mixed")) : (SessionStripTextStartCenterEndConfig[props.align.value])) })
                }
                face={
                  textAlignmentIcons[
                    props.align.value ?? "start"
                  ]
                }
                value={props.align.value}
                options={alignOptions}
                onChange={props.align.onChange}
              />)}
          </SessionStripGroup>
        </jsxSessionStripText.Fragment>)}
      {props.extra != null && (<jsxSessionStripText.Fragment>
          {props.compact ? (null) : (<SessionStripDivider />)}
          <reactInspectorArtboardRadius.Fragment key={"x:" + selKey}>
            {props.extra}
          </reactInspectorArtboardRadius.Fragment>
        </jsxSessionStripText.Fragment>)}
      {props.trailing != null && (<jsxSessionStripText.Fragment>
          {props.compact ? (null) : (<SessionStripDivider />)}
          {props.trailing}
        </jsxSessionStripText.Fragment>)}
      {props.onEdit !== undefined ||
        props.onComment !== null ||
        props.onOpenInspector !== undefined ||
        props.inspectorDisabledReason !== undefined && (<jsxSessionStripText.Fragment>
          {props.compact ? (null) : (<SessionStripDivider />)}
          <SelectionSessionActions
            lead={
              props.onEdit !== undefined ? (
                <SessionStripButton
                  data-testid={testidPrefix + "-edit"}
                  icon={"Edit"}
                  title={uiMessage("inspector.text.editTheText")}
                  aria-label={uiMessage("inspector.text.editText")}
                  onClick={props.onEdit}
                />
              ) : undefined
            }
            onComment={props.onComment}
            onOpenInspector={props.onOpenInspector}
            disabledReason={props.inspectorDisabledReason}
            testids={props.tailTestids}
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
  textAlignmentIcons,
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
    textAlignmentIcons = {
      start: TextAlignLeftValue,
      center: TextAlignCenterValue,
      end: TextAlignRightValue,
      justify: TextAlignJustifyValue,
    };
    SessionStripTextClassNames =
      "h-control w-72 rounded bg-fill-field px-2 text-body text-primary shadow-field-ring outline-none placeholder:text-muted focus-visible:outline-hidden focus-visible:shadow-focus aria-[invalid]:shadow-[0_0_0_2px_var(--cds-color-border-danger,#d9534f)] pointer-coarse:h-10 pointer-coarse:w-56";
  };
}
