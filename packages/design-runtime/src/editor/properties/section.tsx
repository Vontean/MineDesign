import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { ComponentsCollapsibleRootTriggerPanelConfig } from "../../cds/components/collapsible";
import { initializeCdsIndex } from "../../cds/index";
import { load_react, load_react_jsx_runtime } from "../../dependencies";
import { joinClassNames } from "../chrome/overlay-state";
import { reactInspectorContext_4 } from "../inspector/context-part-2";
import { EditorIcon, isNestedPropertyControl, jsxPropertiesPrimitives_2, PropertiesPrimitivesClassNames_3, PropertiesPrimitivesClassNames_4, PropertyActions } from "./primitives";
import { toModuleNamespace } from "../../module-helpers";

var sectionControlWarningShown: Dynamic;
var sectionTitleWarningShown: Dynamic;
var reactPropertiesSection: Dynamic;
var jsxPropertiesSection: Dynamic;
function PropertySectionHeader({
  title: title,
  actions: actions,
  collapsed: collapsed,
  onToggle: onToggle,
  subsection: subsection,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let isToggleable: Dynamic = onToggle !== undefined,
    headerClassName: Dynamic = joinClassNames(
      "flex min-w-0 shrink-0 items-center gap-xs select-none",
      PropertiesPrimitivesClassNames_3,
      subsection
        ? "pt-2 pb-1 text-footnote font-semibold text-secondary"
        : "min-h-10 border-t border-alpha-2 py-2 text-body-semibold text-primary first:border-t-0",
      className,
    ),
    expandIcon: Dynamic = isToggleable ? (
      <span
        aria-hidden={"true"}
        className={
          "-my-1 flex size-control shrink-0 items-center justify-center"
        }
      >
        <EditorIcon
          name={"CaretRight"}
          size={16}
          className={joinClassNames(
            "text-secondary transition-transform duration-fast",
            !collapsed && "rotate-90",
          )}
        />
      </span>
    ) : null;
  return isToggleable && !actions ? (
    <h3 className={"contents"}>
      <button
        type={"button"}
        aria-expanded={!collapsed}
        onClick={onToggle}
        className={joinClassNames(
          headerClassName,
          "w-full cursor-default text-left outline-none focus-visible:outline-hidden focus-visible:shadow-focus",
        )}
      >
        <span className={"min-w-0 flex-1 truncate"}>{title}</span>
        {expandIcon}
      </button>
    </h3>
  ) : (
    <div
      onClick={
        isToggleable
          ? (event?: Dynamic): Dynamic => {
              isNestedPropertyControl(
                event.currentTarget,
                event.target,
              ) || onToggle();
            }
          : undefined
      }
      className={joinClassNames(
        headerClassName,
        isToggleable && "cursor-default",
      )}
    >
      <h3 className={"contents"}>
        {isToggleable ? (<button
            type={"button"}
            aria-expanded={!collapsed}
            onClick={(event?: Dynamic): Dynamic => {
              event.stopPropagation();
              onToggle();
            }}
            className={
              "-my-1 min-w-0 flex-1 cursor-default truncate rounded-sm py-1 text-left text-inherit outline-none focus-visible:outline-hidden focus-visible:shadow-focus"
            }
          >
            {title}
          </button>) : (<span className={"min-w-0 flex-1 truncate"}>{title}</span>)}
      </h3>
      {actions ? (<span
          className={joinClassNames(
            "-my-1 flex shrink-0 items-center gap-0.5",
            PropertiesPrimitivesClassNames_4,
          )}
          onClick={
            isToggleable
              ? (event?: Dynamic): Dynamic => event.stopPropagation()
              : undefined
          }
        >
          {actions}
        </span>) : (null)}
      {expandIcon}
    </div>
  );
}
function warnConflictingSectionControl(): Dynamic {
  sectionControlWarningShown ||
    ((sectionControlWarningShown = true),
    console.error(
      "PropertySection: pass either collapsed/onToggle (controlled) or collapsible/defaultOpen (uncontrolled), not both \u2014 collapsed wins.",
    ));
}
function warnMissingSectionTitle(): Dynamic {
  sectionTitleWarningShown ||
    ((sectionTitleWarningShown = true),
    console.error(
      "PropertySection: collapsible needs a title (the header is the toggle) \u2014 ignored on a title-less section.",
    ));
}
function PropertySection({
  title: title,
  addItems: addItems,
  addLabel: addLabel,
  defaultAddOpen: defaultAddOpen,
  actions: actions,
  action: action,
  collapsed: collapsed,
  onToggle: onToggle,
  collapsible = false,
  defaultOpen = false,
  subsection: subsection,
  iconColumn = false,
  children: children,
  className: className,
  "data-testid": dataTestid,
}: Dynamic): Dynamic {
  useUiLocale();
  let hasChildren: Dynamic =
      reactInspectorContext_4.Children.toArray(children).length > 0,
    [isOpen, setIsOpen]: Dynamic = (0, reactInspectorContext_4.useState)(
      defaultOpen,
    ),
    isControlled: Dynamic = collapsed !== undefined;
  isControlled && collapsible && warnConflictingSectionControl();
  collapsible && title === undefined && warnMissingSectionTitle();
  let isSelfControlled: Dynamic = !isControlled && !!collapsible && title !== undefined,
    isCollapsed: Dynamic = isControlled ? collapsed : isSelfControlled ? !isOpen : undefined,
    handleToggle: Dynamic = isSelfControlled
      ? (): Dynamic => {
          setIsOpen((wasOpen?: Dynamic): Dynamic => !wasOpen);
          onToggle?.();
        }
      : onToggle,
    isExpanded: Dynamic = isCollapsed !== true,
    sectionName: Dynamic = typeof title == "string" ? title : undefined,
    headerActions: Dynamic = actions ?? action,
    hasHeaderActions: Dynamic = headerActions != null && headerActions !== false,
    addMenu: Dynamic =
      addItems !== undefined && addItems.length > 0 ? (
        <PropertyActions
          section={sectionName}
          aria-label={addLabel}
          items={addItems}
          defaultOpen={defaultAddOpen}
        />
      ) : null,
    headerTrailing: Dynamic =
      addMenu !== null || hasHeaderActions ? (
        <jsxPropertiesPrimitives_2.Fragment>
          {addMenu}
          {hasHeaderActions ? (headerActions) : (null)}
        </jsxPropertiesPrimitives_2.Fragment>
      ) : undefined,
    sectionClassName: Dynamic = joinClassNames(
      "flex min-w-0 shrink-0 flex-col",
      !subsection && "border-alpha-2 [&:not(:first-child)]:border-t",
      title === undefined && !subsection && "[&:not(:first-child)]:pt-2",
      iconColumn && "[--pp-iconcol:var(--cds-h-control)]",
      className,
    ),
    header: Dynamic =
      title !== undefined ? (
        <PropertySectionHeader
          title={title}
          actions={headerTrailing}
          collapsed={isCollapsed}
          onToggle={handleToggle}
          subsection={subsection}
        />
      ) : null,
    body: Dynamic = (
      <div data-pp-section-body={""} className={"flex min-w-0 flex-col pb-2"}>
        {children}
      </div>
    );
  return isCollapsed !== undefined ? (
    <ComponentsCollapsibleRootTriggerPanelConfig.Root
      open={isExpanded}
      data-testid={dataTestid}
      className={sectionClassName}
    >
      {header}
      {hasChildren ? (<ComponentsCollapsibleRootTriggerPanelConfig.Panel>
          {body}
        </ComponentsCollapsibleRootTriggerPanelConfig.Panel>) : (null)}
    </ComponentsCollapsibleRootTriggerPanelConfig.Root>
  ) : (
    <div data-testid={dataTestid} className={sectionClassName}>
      {header}
      {hasChildren ? (body) : (null)}
    </div>
  );
}
export {
  jsxPropertiesSection,
  PropertySection,
  PropertySectionHeader,
  reactPropertiesSection,
  sectionControlWarningShown,
  sectionTitleWarningShown,
  warnConflictingSectionControl,
  warnMissingSectionTitle,
};
export function installEditorPropertiesSection(): () => void {
  return () => {
    sectionControlWarningShown = false;
    sectionTitleWarningShown = false;
    reactPropertiesSection = toModuleNamespace(
      load_react(),
      1,
    );
    initializeCdsIndex();
    initializeCdsIndex();
    initializeCdsIndex();
    jsxPropertiesSection = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
  };
}
