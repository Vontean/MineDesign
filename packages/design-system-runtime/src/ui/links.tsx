import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as C from "../contracts/controls";
import { baseButton as R_baseButton, baseUseRender, clsx, loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { reactLinkElements } from "./icons";
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
var TextLinkJsx: typeof import("react/jsx-runtime");
var textLinkResetClasses: string;
var textLinkUnderlineClass: string;
var inlineTextLinkClasses: string;
var inheritedTextLinkColorClasses: string;
var textLinkDecorationTransitionClasses: string;
var textLinkWithIconClasses: string;
var textLinkDecorationAlias: string;
var TextLink: C.ForwardComponent<HTMLElement, C.TextLinkProps>;
function omitProps<Props extends object, Key extends string>(
  props: Props,
  omittedKeys: readonly Key[],
): Omit<Props, Extract<keyof Props, Key>> {
  let value = props as Record<string, unknown>,
    state: Record<string, unknown> = {};
  for (let propName of Object.keys(value)) {
    if (!(omittedKeys as readonly string[]).includes(propName)) {
      state[propName] = value[propName];
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
  let value = reactLinkElements.isValidElement(render),
    anchorAttributes: import("../contracts/overlays").LinkAttributes = useCdsLink({
      ...linkInput,
      ...pickLinkEventProps(rest),
      href: value ? undefined : linkInput.href,
    }),
    customRenderProps = omitProps(rest, [...interactiveLinkReservedProps, "disabled"]),
    customLink = baseUseRender({
      enabled: value,
      render: render,
      ref: forwardedRef,
      props: {
        ...customRenderProps,
        ...stamp,
        className: className,
        children: body,
      },
    });
  if (value) {
    return customLink;
  }
  if (linkInput.href !== undefined) {
    let anchorProps = omitProps(rest, [
      ...interactiveLinkReservedProps,
      ...linkEventPropNames,
    ]);
    return (
      <a
        ref={forwardedRef as React.Ref<HTMLAnchorElement>}
        {...stamp}
        {...anchorProps}
        {...anchorAttributes}
        className={className}
      >
        {body}
      </a>
    );
  }
  let actionProps = omitProps(rest, ["href", "disabled"]);
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
      {...(actionProps as Omit<typeof actionProps, "type">)}
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
      {useTranslation("opensInNewTab", "(opens in new tab)")}
    </span>
  );
}
function TextLinkIcon(icon: React.ReactNode) {
  useUiLocale();
  if (isIconName(icon)) {
    return (
      <Icon
        name={icon}
        size={"sm"}
        className={"self-center"}
        style={{
          fontSize: "1lh",
        }}
      />
    );
  } else {
    return <span className={"self-center"}>{icon}</span>;
  }
}
export {
  inheritedTextLinkColorClasses,
  inlineTextLinkClasses,
  InteractiveLinkElement,
  interactiveLinkReservedProps,
  jsxForUiLinks,
  TextLinkJsx,
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
    initializeTranslations();
    jsxForUiLinks = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactyq = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    TextLinkJsx = toModuleNamespace(
      loadJsxNamespace(),
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
        forwardedRef: React.ForwardedRef<HTMLElement>,
      ) => {
        let value = "href" in props && props.href !== undefined,
          inheritsContextColor = reactyq.useContext<boolean>(pointerDismissalContext),
          shouldInheritColor = inheritColor ?? inheritsContextColor,
          resolvedExternal =
            external &&
            !(
              value &&
              !reactyq.isValidElement(render) &&
              isSanitizedHrefFallback(
                props.href,
                sanitizeHref(props.href),
              )
            )
              ? external
              : false,
          linkTarget = value
            ? (props.target ?? (resolvedExternal ? "_blank" : undefined))
            : undefined,
          linkRel: string | undefined = value
            ? (props.rel ??
              (resolvedExternal &&
              linkTarget !== undefined &&
              !opensInSeparateBrowsingContext(linkTarget)
                ? getAutomaticLinkRel(props.href, linkTarget)
                : undefined))
            : undefined,
          newTabAnnouncementId = reactyq.useId(),
          newTabAnnouncement = <NewTabAnnouncement id={newTabAnnouncementId} />,
          linkIcon =
            icon || (resolvedExternal === "with-icon" ? "ArrowUpRight" : undefined),
          hasIcon = !!linkIcon,
          textLinkClasses = `${cn(hasIcon ? clsx(textLinkWithIconClasses, icon ? "gap-[0.25em]" : "gap-0") : inlineTextLinkClasses, shouldInheritColor && inheritedTextLinkColorClasses)}`,
          linkBody = hasIcon ? (
            <TextLinkJsx.Fragment>
              {[iconPosition === "start" && TextLinkIcon(linkIcon), <span
                  className={clsx(
                    textLinkDecorationAlias,
                    shouldInheritColor && textLinkDecorationTransitionClasses,
                  )}
                >
                  {children}
                </span>, iconPosition === "end" && TextLinkIcon(linkIcon), resolvedExternal && newTabAnnouncement]}
            </TextLinkJsx.Fragment>
          ) : resolvedExternal ? (
            <TextLinkJsx.Fragment>
              {[children, newTabAnnouncement]}
            </TextLinkJsx.Fragment>
          ) : (
            children
          ),
          linkClassName: string = cn(
            textLinkClasses,
            "cursor-pointer",
            className,
          ),
          isDisabled = props.disabled ?? false;
        return (
          <InteractiveLinkElement
            stamp={{
              "data-cds": "TextLink",
            }}
            forwardedRef={forwardedRef}
            linkInput={{
              href: value ? props.href : undefined,
              routerOptions: value ? props.routerOptions : undefined,
              target: linkTarget,
              rel: linkRel,
              download: value ? props.download : undefined,
            }}
            render={render}
            body={linkBody}
            className={linkClassName}
            actionClassName={cn(
              textLinkClasses,
              isDisabled ? "cursor-default opacity-disabled" : "cursor-pointer",
              className,
            )}
            actionDisabled={isDisabled}
            rest={{
              ...props,
              ...(shouldInheritColor && {
                "data-inherit-color": "",
              }),
              "aria-describedby":
                [ariaDescribedby, resolvedExternal ? newTabAnnouncementId : undefined]
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
