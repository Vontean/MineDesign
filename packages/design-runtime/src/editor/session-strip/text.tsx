import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  bindRuntimeValue,
  type Dynamic,
  type RuntimeBindings,
} from "../../runtime-types";
export function installEditorSessionStripText(
  runtime: RuntimeBindings,
): () => void {
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
          <runtime.EditorIcon name={"Link"} />
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
        {onRemove !== undefined && (<runtime.SessionStripButton
            icon={"Trash"}
            aria-label={uiMessage("inspector.text.removeLink")}
            title={uiMessage("inspector.text.removeTheLink")}
            onClick={onRemove}
          />)}
        <runtime.SessionStripButton
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
      runtime.reactInspectorArtboardRadius.useState)(null),
      [value4, value5]: Dynamic = (0,
      runtime.reactInspectorArtboardRadius.useState)(false),
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
        <runtime.SessionStripButton
          data-testid={value + "-" + input2.toLowerCase()}
          title={
            (context.disabledReason) ?? ((context.title ?? ({ Bold: uiMessage("inspector.text.bold"), Italic: uiMessage("inspector.text.italic"), Underline: uiMessage("inspector.text.underline"), Link: uiMessage("inspector.text.link") }[input2])) + (value8 !== undefined && input.shortcuts !== false ? (((" (") + ((0, runtime.keyboardShortcutLabel)(value8))) + (")")) : ("")))
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
        <runtime.SessionStripGroup wrap={true}>
          {input.style !== undefined && (<runtime.SessionTypographyPopup
              key={"ts:" + selKey}
              testid={value + "-style"}
              value={input.style.value}
              chipText={input.style.chipText}
              options={input.style.options}
              onChange={input.style.onChange}
              custom={input.style.custom}
            />)}
          {input.color !== undefined && (<runtime.SessionActionsPopover
              key={"c:" + selKey}
              {...input.color}
              testid={input.color.testid ?? value + "-color"}
            />)}
          {callback2("Bold", "TextBold", input.bold, "B")}
          {callback2("Italic", "TextItalics", input.italic, "I")}
          {input.underline !== undefined && (callback2("Underline", "TextUnderline", input.underline, "U"))}
          {input.link !== undefined && (value6 !== null ? (<runtime.SessionStripButton
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
        </runtime.SessionStripGroup>
        {input.list !== undefined || input.align !== undefined && (<jsxSessionStripText.Fragment>
            {input.compact ? (null) : (<runtime.SessionStripDivider />)}
            <runtime.SessionStripGroup wrap={true}>
              {input.list !== undefined && (<runtime.SessionChoicePopup
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
              {input.align !== undefined && (<runtime.SessionChoicePopup
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
            </runtime.SessionStripGroup>
          </jsxSessionStripText.Fragment>)}
        {input.extra != null && (<jsxSessionStripText.Fragment>
            {input.compact ? (null) : (<runtime.SessionStripDivider />)}
            <runtime.reactInspectorArtboardRadius.Fragment key={"x:" + selKey}>
              {input.extra}
            </runtime.reactInspectorArtboardRadius.Fragment>
          </jsxSessionStripText.Fragment>)}
        {input.trailing != null && (<jsxSessionStripText.Fragment>
            {input.compact ? (null) : (<runtime.SessionStripDivider />)}
            {input.trailing}
          </jsxSessionStripText.Fragment>)}
        {input.onEdit !== undefined ||
          input.onComment !== null ||
          input.onOpenInspector !== undefined ||
          input.inspectorDisabledReason !== undefined && (<jsxSessionStripText.Fragment>
            {input.compact ? (null) : (<runtime.SessionStripDivider />)}
            <runtime.SelectionSessionActions
              lead={
                input.onEdit !== undefined ? (
                  <runtime.SessionStripButton
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
  bindRuntimeValue(
    runtime,
    "jsxSessionStripText",
    () => jsxSessionStripText,
    (value) => {
      jsxSessionStripText = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "SessionStripTextNoneBulletNumberConfig",
    () => SessionStripTextNoneBulletNumberConfig,
    (value) => {
      SessionStripTextNoneBulletNumberConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "SessionStripTextItems",
    () => SessionStripTextItems,
    (value) => {
      SessionStripTextItems = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "SessionStripTextStartCenterEndConfig",
    () => SessionStripTextStartCenterEndConfig,
    (value) => {
      SessionStripTextStartCenterEndConfig = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "SessionStripTextStartCenterEndConfig_2",
    () => SessionStripTextStartCenterEndConfig_2,
    (value) => {
      SessionStripTextStartCenterEndConfig_2 = value;
    },
  );
  bindRuntimeValue(
    runtime,
    "SessionStripTextClassNames",
    () => SessionStripTextClassNames,
    (value) => {
      SessionStripTextClassNames = value;
    },
  );
  bindRuntimeValue(runtime, "SessionLinkInput", () => SessionLinkInput);
  bindRuntimeValue(runtime, "normalizeSessionLink", () => normalizeSessionLink);
  bindRuntimeValue(runtime, "TextSessionStrip", () => TextSessionStrip);
  return () => {
    jsxSessionStripText = (0, runtime.toModuleNamespace)(
      (0, runtime.load_react_jsx_runtime)(),
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
      start: runtime.TextAlignLeftValue,
      center: runtime.TextAlignCenterValue,
      end: runtime.TextAlignRightValue,
      justify: runtime.TextAlignJustifyValue,
    };
    SessionStripTextClassNames =
      "h-control w-72 rounded bg-fill-field px-2 text-body text-primary shadow-field-ring outline-none placeholder:text-muted focus-visible:outline-hidden focus-visible:shadow-focus aria-[invalid]:shadow-[0_0_0_2px_var(--cds-color-border-danger,#d9534f)] pointer-coarse:h-10 pointer-coarse:w-56";
  };
}
