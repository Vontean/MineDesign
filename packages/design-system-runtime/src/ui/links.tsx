import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseButton as R_baseButton, baseUseRender, clsx, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { reactForUiIcons2 } from "./icons";
import { cn, Icon, initializeTranslations, isIconName, pointerDismissalContext, useTranslation } from "./interactions";
import { getAutomaticLinkRel, isSanitizedHrefFallback, linkEventPropNames, opensInSeparateBrowsingContext, pickLinkEventProps, sanitizeHref, useCdsLink } from "./overlays";

var interactiveLinkReservedProps: (
  | "href"
  | "routerOptions"
  | "target"
  | "rel"
  | "download"
)[];
var jsxForUiLinks: typeof import("react/jsx-runtime");
var reactyq: typeof React;
var jsxForUiLinks2: typeof import("react/jsx-runtime");
var textLinkResetClasses: string;
var textLinkUnderlineClass: string;
var inlineTextLinkClasses: string;
var inheritedTextLinkColorClasses: string;
var textLinkDecorationTransitionClasses: string;
var textLinkWithIconClasses: string;
var textLinkDecorationAlias: string;
var TextLink: C.ForwardComponent<HTMLElement, C.TextLinkProps>;
function omitProps<Props extends object, Key extends string>(
  input: Props,
  options: readonly Key[],
): Omit<Props, Extract<keyof Props, Key>> {
  let value = input as Record<string, unknown>,
    state: Record<string, unknown> = {};
  for (let value2 of Object.keys(value)) {
    if (!(options as readonly string[]).includes(value2)) {
      state[value2] = value[value2];
    }
  }
  return state as Omit<Props, Extract<keyof Props, Key>>;
}
function InteractiveLinkElement({
  stamp: stamp,
  forwardedRef: forwardedRef,
  linkInput: linkInput,
  render: render,
  body: body,
  className: className,
  actionClassName: actionClassName,
  actionDisabled: actionDisabled,
  rest: rest,
}: C.InteractiveLinkElementProps) {
  useUiLocale();
  let value = reactForUiIcons2.isValidElement(render),
    value2: import("../contracts/overlays").LinkAttributes = (0,
    useCdsLink)({
      ...linkInput,
      ...(0, pickLinkEventProps)(rest),
      href: value ? undefined : linkInput.href,
    }),
    value3 = omitProps(rest, [...interactiveLinkReservedProps, "disabled"]),
    value4 = (0, baseUseRender)({
      enabled: value,
      render: render,
      ref: forwardedRef,
      props: {
        ...value3,
        ...stamp,
        className: className,
        children: body,
      },
    });
  if (value) {
    return value4;
  }
  if (linkInput.href !== undefined) {
    let value6 = omitProps(rest, [
      ...interactiveLinkReservedProps,
      ...linkEventPropNames,
    ]);
    return (
      <a
        ref={forwardedRef as React.Ref<HTMLAnchorElement>}
        {...stamp}
        {...value6}
        {...value2}
        className={className}
      >
        {body}
      </a>
    );
  }
  let value5 = omitProps(rest, ["href", "disabled"]);
  return (
    <R_baseButton
      render={<span {...stamp} />}
      nativeButton={false}
      {...(actionDisabled !== undefined
        ? {
            disabled: actionDisabled,
          }
        : {})}
      ref={forwardedRef}
      {...(value5 as Omit<typeof value5, "type">)}
      className={actionClassName}
    >
      {body}
    </R_baseButton>
  );
}
function NewTabAnnouncement({ id: id }: { id: string }) {
  useUiLocale();
  return (
    <span id={id} hidden={true} className={"sr-only"}>
      {(0, useTranslation)("opensInNewTab", "(opens in new tab)")}
    </span>
  );
}
function TextLinkIcon(input: React.ReactNode) {
  useUiLocale();
  if ((0, isIconName)(input)) {
    return (
      <Icon
        name={input}
        size={"sm"}
        className={"self-center"}
        style={{
          fontSize: "1lh",
        }}
      />
    );
  } else {
    return <span className={"self-center"}>{input}</span>;
  }
}
export {
  inheritedTextLinkColorClasses,
  inlineTextLinkClasses,
  InteractiveLinkElement,
  interactiveLinkReservedProps,
  jsxForUiLinks,
  jsxForUiLinks2,
  NewTabAnnouncement,
  omitProps,
  reactyq,
  TextLink,
  textLinkDecorationAlias,
  textLinkDecorationTransitionClasses,
  TextLinkIcon,
  textLinkResetClasses,
  textLinkUnderlineClass,
  textLinkWithIconClasses,
};
export function installUiLinks(): () => void {
  return () => {
    interactiveLinkReservedProps = [
      "href",
      "routerOptions",
      "target",
      "rel",
      "download",
    ];
    (0, initializeTranslations)();
    jsxForUiLinks = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    reactyq = (0, toModuleNamespace)(
      (0, loadReactNamespace)(),
      1,
    );
    jsxForUiLinks2 = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
      1,
    );
    textLinkResetClasses = "cds-reset cds-text-link";
    textLinkUnderlineClass = "cds-text-link-underline";
    inlineTextLinkClasses = `${textLinkResetClasses} ${textLinkUnderlineClass} inline`;
    inheritedTextLinkColorClasses =
      "text-inherit [transition-property:text-decoration-color,box-shadow]";
    textLinkDecorationTransitionClasses =
      "[transition-property:text-decoration-color]";
    textLinkWithIconClasses = `${textLinkResetClasses} inline-flex items-baseline`;
    textLinkDecorationAlias = textLinkUnderlineClass;
    TextLink = reactyq.forwardRef(
      (
        {
          className: className,
          children: children,
          icon: icon,
          iconPosition = "end",
          external: external,
          inheritColor: inheritColor,
          render: render,
          "aria-describedby": ariaDescribedby,
          ...props
        }: C.TextLinkProps,
        options: React.ForwardedRef<HTMLElement>,
      ) => {
        let value = "href" in props && props.href !== undefined,
          value2 = reactyq.useContext<boolean>(pointerDismissalContext),
          value3 = inheritColor ?? value2,
          value4 =
            external &&
            !(
              value &&
              !reactyq.isValidElement(render) &&
              (0, isSanitizedHrefFallback)(
                props.href,
                (0, sanitizeHref)(props.href),
              )
            )
              ? external
              : false,
          value5 = value
            ? (props.target ?? (value4 ? "_blank" : undefined))
            : undefined,
          value6: string | undefined = value
            ? (props.rel ??
              (value4 &&
              value5 !== undefined &&
              !(0, opensInSeparateBrowsingContext)(value5)
                ? (0, getAutomaticLinkRel)(props.href, value5)
                : undefined))
            : undefined,
          value7 = reactyq.useId(),
          value8 = <NewTabAnnouncement id={value7} />,
          value9 =
            icon || (value4 === "with-icon" ? "ArrowUpRight" : undefined),
          value10 = !!value9,
          value11 = `${(0, cn)(value10 ? (0, clsx)(textLinkWithIconClasses, icon ? "gap-[0.25em]" : "gap-0") : inlineTextLinkClasses, value3 && inheritedTextLinkColorClasses)}`,
          value12 = value10 ? (
            <jsxForUiLinks2.Fragment>
              {[iconPosition === "start" && TextLinkIcon(value9), <span
                  className={(0, clsx)(
                    textLinkDecorationAlias,
                    value3 && textLinkDecorationTransitionClasses,
                  )}
                >
                  {children}
                </span>, iconPosition === "end" && TextLinkIcon(value9), value4 && value8]}
            </jsxForUiLinks2.Fragment>
          ) : value4 ? (
            <jsxForUiLinks2.Fragment>
              {[children, value8]}
            </jsxForUiLinks2.Fragment>
          ) : (
            children
          ),
          value13: string = (0, cn)(
            value11,
            "cursor-pointer",
            className,
          ),
          value14 = props.disabled ?? false;
        return (
          <InteractiveLinkElement
            stamp={{
              "data-cds": "TextLink",
            }}
            forwardedRef={options}
            linkInput={{
              href: value ? props.href : undefined,
              routerOptions: value ? props.routerOptions : undefined,
              target: value5,
              rel: value6,
              download: value ? props.download : undefined,
            }}
            render={render}
            body={value12}
            className={value13}
            actionClassName={(0, cn)(
              value11,
              value14 ? "cursor-default opacity-disabled" : "cursor-pointer",
              className,
            )}
            actionDisabled={value14}
            rest={{
              ...props,
              ...(value3 && {
                "data-inherit-color": "",
              }),
              "aria-describedby":
                [ariaDescribedby, value4 ? value7 : undefined]
                  .filter(Boolean)
                  .join(" ") || undefined,
            }}
          />
        );
      },
    );
    TextLink.displayName = "TextLink";
  };
}
