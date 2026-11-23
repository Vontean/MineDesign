import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { commentTargetProps, UNCOMMENTABLE_PROPS } from "./comment-anchors";
import { UsageNoteEditor } from "./usage-notes";
import { coerceControlOption } from "../model/component-inference";
import { toModuleNamespace } from "../module-helpers";
import { Button } from "../ui/buttons";
import { PropertyNumberInput } from "../ui/number-controls";
import { joinClassNames } from "../ui/property-icons";
import { PropertyPopup } from "../ui/property-popover";
import { PropertyRow, PropertySectionHeader } from "../ui/property-row";
import { Select } from "../ui/select";
import { Switch } from "../ui/switch";
import { TextInput } from "../ui/text-input";

var reactComponentsSection: typeof import("react");
var DEFAULT_EDITOR_FEATURE_FLAGS: Partial<Record<string, boolean>>;
var isEditorFeatureEnabled: (flag: string, queryKey: string) => boolean;
var editorFeatureFlags: {
  componentProps: boolean;
};
var jsxComponentsSection: typeof import("react/jsx-runtime");
var normalizedComponentTitle: (title: string) => string;
var DEFAULT_COMPONENT_STAGE_HEIGHT: number;
var MAX_COMPONENT_STAGE_HEIGHT: number;
var clampComponentStageHeight: (height: number | undefined) => number;
var componentStageStyle: (
  component: Application.EditorComponent,
) => React.CSSProperties;
var EMPTY_COMPONENT_PROPS: Model.InferredPropControl[];
function hasEditorFlagInLocation(
  location: Pick<Location, "search" | "hash"> | undefined,
  key: string,
): boolean {
  try {
    if (location === undefined) {
      return false;
    }
    if (new URLSearchParams(location.search).get(key) === "1") {
      return true;
    }
    return location.hash.replace(/^#/, "").split(/[&;]/).includes(key);
  } catch {
    return false;
  }
}
function hasEditorFlagInParentLocation(key: string): boolean {
  let value: Location | undefined, parentLocation: Location | undefined;
  try {
    value = globalThis.location;
  } catch {
    value = undefined;
  }
  try {
    parentLocation =
      globalThis.parent !== undefined && globalThis.parent !== globalThis.self
        ? globalThis.parent.location
        : undefined;
  } catch {
    parentLocation = undefined;
  }
  return (
    hasEditorFlagInLocation(value, key) ||
    hasEditorFlagInLocation(parentLocation, key)
  );
}
function hasEditorFlagInStorage(key: string): boolean {
  try {
    return globalThis.localStorage?.getItem("ds.flags." + key) === "1";
  } catch {
    return false;
  }
}
function stripMatchingComponentHeading(
  markdown: string,
  name: string,
): string {
  let value = /^\s*#[ \t]+([^\n]*)\n?/.exec(markdown);
  if (value === null) {
    return markdown;
  }
  let normalizedHeading = normalizedComponentTitle(value[1] ?? ""),
    componentName = normalizedComponentTitle(name);
  if (
    componentName === "" ||
    (normalizedHeading !== componentName && normalizedHeading !== componentName + "s" && normalizedHeading !== componentName + "es")
  ) {
    return markdown;
  }
  return markdown.slice(value[0].length);
}
function ensureComponentGuidelinesHeading(
  markdown: string,
  name: string,
  heading: string,
): string {
  let value = heading.trim() !== "" ? heading.trim() : "# " + name;
  if (markdown.trim() === "") {
    return (
      value +
      `
`
    );
  }
  if (stripMatchingComponentHeading(markdown, name) !== markdown) {
    return markdown;
  }
  return (
    value +
    `

` +
    markdown
  );
}
function EmptyComponentPreview({
  name: name,
}: {
  name: string;
}): React.ReactElement {
  useUiLocale();
  return (
    <p className={"ds-stage-doc ds-pad py-md text-body text-secondary"}>
      {[uiMessage("design-system.components.noPreviewYetAskThe"), name, uiMessage("design-system.components.previewHtml")]}
    </p>
  );
}
function ComponentStage({
  c: c,
  mode: mode,
  tweaks: tweaks,
  renderPreview: renderPreview,
}: Editor.ComponentStageProps): React.ReactElement {
  useUiLocale();
  if (c.previewHtml === undefined) {
    return <EmptyComponentPreview name={c.name} />;
  }
  let value = clampComponentStageHeight(c.previewHeight);
  return (
    <div
      className={"ds-comp-preview-box"}
      style={
        c.previewWidth === undefined
          ? {
              minHeight: value,
            }
          : undefined
      }
      data-mode={mode}
      data-tweaked={tweaks !== undefined ? "" : undefined}
    >
      {renderPreview(
        c,
        {
          height: value,
        },
        mode,
        tweaks,
      )}
    </div>
  );
}
function ComponentGuidelines({
  c: c,
  edit: edit,
}: Editor.ComponentGuidelinesProps): React.ReactElement {
  useUiLocale();
  let guidelines = c.guidelines ?? "",
    value = stripMatchingComponentHeading(guidelines, c.name),
    guidelineLines = guidelines.slice(0, guidelines.length - value.length),
    ref = reactComponentsSection.useRef<string | null>(null);
  return (
    <UsageNoteEditor
      value={value}
      label={c.name}
      anchorKey={"comp/" + c.name}
      size={"doc"}
      placeholder={uiMessage("design-system.components.usageGuidelinesWhenToUseItDoDonT")}
      data-testid={"ds-comp-guide-" + c.name}
      {...(edit !== undefined
        ? {
            onChange: (markdown: string): void => {
              ref.current = markdown.trim();
              edit.setGuidelines(
                c.name,
                ensureComponentGuidelinesHeading(markdown, c.name, guidelineLines),
              );
            },
            onDone: (): void => {
              if (ref.current === "") {
                edit.setGuidelines(c.name, "");
              }
              ref.current = null;
              edit.done();
            },
          }
        : {})}
    />
  );
}
function ComponentPropField({
  spec: spec,
  value: propValue,
  placeholder: placeholder,
  onChange: onChange,
}: Editor.ComponentPropFieldProps): React.ReactElement {
  useUiLocale();
  let testId: string = "ds-prop-" + spec.name;
  if (spec.kind === "boolean") {
    return (
      <Switch
        checked={propValue === true}
        onCheckedChange={(checked: boolean) => onChange(checked)}
        aria-label={spec.name}
      />
    );
  }
  if (spec.kind === "enum") {
    return (
      <Select
        aria-label={spec.name}
        popupAttrs={UNCOMMENTABLE_PROPS}
        items={[
          {
            value: "",
            label: "—",
          },
          ...(spec.options ?? []).map((option) => ({
            value: option,
            label: option,
          })),
        ]}
        value={propValue === undefined ? "" : String(propValue)}
        onChange={(selectedValue: string) =>
          onChange(
            selectedValue === ""
              ? undefined
              : coerceControlOption(spec, selectedValue),
          )
        }
        data-testid={testId}
      />
    );
  }
  if (spec.kind === "number") {
    return (
      <span data-testid={testId} className={"contents"}>
        <PropertyNumberInput
          aria-label={spec.name}
          value={typeof propValue === "number" ? propValue : undefined}
          clearable={true}
          steppers={false}
          onValue={(numberValue: number | undefined) => onChange(numberValue)}
        />
      </span>
    );
  }
  return (
    <TextInput
      aria-label={spec.name}
      value={typeof propValue === "string" ? propValue : ""}
      placeholder={placeholder ?? spec.typeName ?? ("")}
      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
        onChange(
          event.currentTarget.value === ""
            ? undefined
            : event.currentTarget.value,
        )
      }
      data-testid={testId}
    />
  );
}
function ComponentPropsEditor({
  c: c,
  specs: specs,
  values: values,
  onChange: onChange,
  onReset: onReset,
}: Editor.ComponentPropsEditorProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      className={
        "ds-props-pop flex w-[min(18rem,calc(100vw-2rem))] flex-col py-xs [--pp-label-w:6rem]"
      }
      role={"group"}
      aria-label={uiMessage("design-system.components.props2", { subject: String(c.name) })}
      data-testid={"ds-comp-props-" + c.name}
      {...commentTargetProps("props", c.name)}
    >
      {[<PropertySectionHeader
          title={<span className={"ds-pop-name"}>{uiMessage("design-system.components.props")}</span>}
          actions={
            values !== undefined ? (
              <Button
                variant={"ghost"}
                size={"xs"}
                onClick={onReset}
                data-testid={"ds-comp-props-reset-" + c.name}
              >
                {uiMessage("design-system.components.reset")}
              </Button>
            ) : undefined
          }
        />, specs.length === 0 ? (
          <p className={"px-lg py-sm text-footnote text-muted"}>
            {uiMessage("design-system.components.thisComponentDeclaresNoProps")}
          </p>
        ) : (
          <div className={"ds-props-list flex flex-col"}>
            {specs.map((source) =>
              (() => {
                const _Element = PropertyRow;
                const _elementProps = {
                  label: source.name,
                  title: source.typeName ?? source.kind,
                  labelProps: {
                    className: "font-mono",
                  },
                  className: "ds-prow",
                  ...commentTargetProps(
                    "prop",
                    c.name + "/" + source.name,
                  ),
                  children: (
                    <ComponentPropField
                      spec={source}
                      value={values?.[source.name] ?? source.default}
                      {...(source.name === "children"
                        ? {
                            placeholder: c.name,
                          }
                        : {})}
                      onChange={(
                        propValue: Editor.ComponentPropValue | undefined,
                      ) => onChange(source.name, propValue)}
                    />
                  ),
                };
                const _elementKey = source.name;
                return <_Element key={_elementKey} {..._elementProps} />;
              })(),
            )}
          </div>
        )]}
    </div>
  );
}
function ComponentsSection({
  components: components,
  mode: mode,
  renderPreview: renderPreview,
  propsOf: propsOf,
  edit: edit,
  head: head,
  staticNote: staticNote,
  staticFiles: staticFiles,
}: Editor.ComponentsSectionProps): React.ReactElement | null {
  useUiLocale();
  let [value, selectedComponent] = reactComponentsSection.useState<string | null>(null),
    [componentValueMap, setComponentProps] = reactComponentsSection.useState<
      Record<string, Editor.ComponentPropValues>
    >({});
  if (components.length === 0) {
    return null;
  }
  let callback = (
      componentName: string,
      propName: string,
      propValue: Editor.ComponentPropValue | undefined,
    ) =>
      setComponentProps((currentProps) => {
        let state = {
          ...(currentProps[componentName] ?? {}),
        };
        if (propValue === undefined) {
          delete state[propName];
        } else {
          state[propName] = propValue;
        }
        let nextProps = {
          ...currentProps,
        };
        if (Object.keys(state).length === 0) {
          delete nextProps[componentName];
        } else {
          nextProps[componentName] = state;
        }
        return nextProps;
      }),
    resetComponent = (componentName: string) =>
      setComponentProps((currentProps) => {
        if (!(componentName in currentProps)) {
          return currentProps;
        }
        let state = {
          ...currentProps,
        };
        delete state[componentName];
        return state;
      });
  return (
    <section
      className={"ds-components-sec"}
      aria-label={head?.title ?? (uiMessage("design-system.components.components"))}
      data-testid={"ds-components-pane"}
    >
      {[staticNote !== undefined &&
        staticNote !== "" &&
        components.some(
          (component): boolean => component.previewHtml !== undefined,
        ) ? (
          <div
            className={"ds-pad py-sm text-footnote text-muted"}
            role={"note"}
            data-testid={"ds-components-static-note"}
            {...UNCOMMENTABLE_PROPS}
          >
            {staticFiles !== undefined && staticFiles.length > 0 ? (<details>
                {[<summary className={"cursor-pointer"}>
                    {staticNote}
                  </summary>, <ul
                    role={"list"}
                    className={"mt-xs font-mono break-all"}
                    data-testid={"ds-components-static-files"}
                  >
                    {staticFiles.map((file, fileIndex) =>
                      (() => {
                        const FileListItem = "li";
                        const fileProps = {
                          children: file,
                        };
                        const fileKey = fileIndex;
                        return (
                          <FileListItem key={fileKey} {...fileProps} />
                        );
                      })(),
                    )}
                  </ul>]}
              </details>) : (staticNote)}
          </div>
        ) : null, <div
          className={"ds-comptable"}
          role={"table"}
          aria-label={uiMessage("design-system.components.components")}
          data-testid={"ds-components"}
        >
          {[<div
              className={"ds-cmrow ds-chead text-caption text-muted"}
              role={"row"}
              {...UNCOMMENTABLE_PROPS}
            >
              {[<span role={"columnheader"}>{uiMessage("design-system.components.name")}</span>, <span role={"columnheader"}>{uiMessage("design-system.components.preview")}</span>, <span className={"ds-cgutter"} aria-hidden={"true"} />]}
            </div>, components.map((component) => {
              let componentProps = editorFeatureFlags.componentProps,
                propSpecs = componentProps
                  ? (propsOf?.(component) ?? EMPTY_COMPONENT_PROPS)
                  : EMPTY_COMPONENT_PROPS,
                componentValues = componentProps ? componentValueMap[component.name] : undefined,
                tweaks: Editor.ComponentPropValues | undefined =
                  componentValues === undefined
                    ? undefined
                    : Object.fromEntries([
                        ...propSpecs.flatMap((spec) =>
                          spec.default !== undefined
                            ? [[spec.name, spec.default]]
                            : [],
                        ),
                        ...(propSpecs.some(
                          (spec): boolean => spec.name === "children",
                        )
                          ? [["children", component.name]]
                          : []),
                        ...Object.entries(componentValues),
                      ]);
              return (() => {
                const ComponentPreviewContainer = "div";
                const previewProps = {
                  className: "ds-cmrow ds-tokrow ds-comprow group/row",
                  role: "row",
                  "data-testid": "ds-comp-" + component.name,
                  ...commentTargetProps("comp", component.name),
                  children: [
                    <span
                      className={"ds-cmname flex min-w-0 flex-col gap-0.5"}
                      role={"rowheader"}
                    >
                      {[<span className={"flex min-w-0 items-center gap-xs"}>
                          {[<span
                              className={"ds-comprow-name min-w-0 truncate"}
                              data-testid={"ds-comp-name-" + component.name}
                            >
                              {component.name}
                            </span>, componentProps ? (
                              <span
                                className={
                                  "ds-cact-anchor relative inline-flex"
                                }
                                {...UNCOMMENTABLE_PROPS}
                              >
                                {[<Button
                                    variant={"ghost"}
                                    size={"sm"}
                                    iconOnly={true}
                                    icon={"Filter"}
                                    className={joinClassNames(
                                      "ds-cact",
                                      componentValues !== undefined &&
                                        "ds-cact-on text-accent",
                                    )}
                                    pressed={value === component.name}
                                    aria-label={("Props: ") + (component.name)}
                                    tooltip={uiMessage("design-system.components.props")}
                                    aria-expanded={value === component.name}
                                    onClick={(
                                      event: React.MouseEvent<HTMLButtonElement>,
                                    ): void => {
                                      event.stopPropagation();
                                      selectedComponent(
                                        value !== component.name
                                          ? component.name
                                          : null,
                                      );
                                    }}
                                    data-testid={
                                      "ds-comp-props-btn-" + component.name
                                    }
                                  />, <PropertyPopup
                                    open={value === component.name}
                                    onClose={() => selectedComponent(null)}
                                    align={"left"}
                                    padding={"none"}
                                    aria-label={("Props: ") + (component.name)}
                                  >
                                    {value === component.name ? (<ComponentPropsEditor
                                        c={component}
                                        specs={propSpecs}
                                        values={componentValues}
                                        onChange={(
                                          componentName: string,
                                          componentOptions:
                                            | Editor.ComponentPropValue
                                            | undefined,
                                        ) =>
                                          callback(
                                            component.name,
                                            componentName,
                                            componentOptions,
                                          )
                                        }
                                        onReset={() => resetComponent(component.name)}
                                      />) : (null)}
                                  </PropertyPopup>]}
                              </span>
                            ) : null]}
                        </span>, component.floor === true ? (
                          <span
                            className={
                              "ds-comp-floor w-fit text-caption text-muted"
                            }
                            data-floor={""}
                            title={
                              uiMessage("design-system.components.aGeneratedFloorCardTheRepositoryHasNoStoryOrDocsExampleForThisComponent")
                            }
                          >
                            {uiMessage("design-system.components.noExample")}
                          </span>
                        ) : null]}
                    </span>,
                    <span className={"ds-cmprev min-w-0"} role={"cell"}>
                      <StickyComponentNote
                        reserve={
                          component.previewHtml !== undefined
                            ? componentStageStyle(component)
                            : undefined
                        }
                      >
                        <ComponentStage
                          c={component}
                          mode={mode}
                          tweaks={tweaks}
                          renderPreview={renderPreview}
                        />
                      </StickyComponentNote>
                    </span>,
                    <span
                      className={
                        "ds-cacts ds-cgutter relative flex items-start justify-center"
                      }
                      role={"cell"}
                      {...UNCOMMENTABLE_PROPS}
                    >
                      <ComponentGuidelines
                        c={component}
                        {...(edit !== undefined
                          ? {
                              edit: edit,
                            }
                          : {})}
                      />
                    </span>,
                  ],
                };
                const componentKey = component.name;
                return <ComponentPreviewContainer key={componentKey} {...previewProps} />;
              })();
            })]}
        </div>]}
    </section>
  );
}
function StickyComponentNote({
  children: children,
  reserve: reserve,
}: {
  children: React.ReactNode;
  reserve?: React.CSSProperties;
}): React.ReactElement {
  useUiLocale();
  let ref = reactComponentsSection.useRef<HTMLSpanElement | null>(null),
    [value, setSticky] = reactComponentsSection.useState(false);
  reactComponentsSection.useLayoutEffect(() => {
    if (value) {
      return;
    }
    let current = ref.current;
    if (current === null) {
      return;
    }
    if (
      typeof IntersectionObserver === "undefined" ||
      current.getBoundingClientRect().top < (window.innerHeight || 800) + 400
    ) {
      setSticky(true);
      return;
    }
    let observer = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSticky(true);
          observer.disconnect();
        }
      },
      {
        root: current.closest(".ds-main"),
        rootMargin: "400px 0px",
      },
    );
    observer.observe(current);
    return () => observer.disconnect();
  }, [value]);
  return (
    <span ref={ref} className={"ds-cmstage block"}>
      {value ? (children) : (<span
          className={"ds-cmstage-ph block"}
          style={reserve}
          aria-hidden={"true"}
        />)}
    </span>
  );
}
export {
  clampComponentStageHeight,
  ComponentGuidelines,
  ComponentPropField,
  ComponentPropsEditor,
  ComponentsSection,
  ComponentStage,
  componentStageStyle,
  DEFAULT_COMPONENT_STAGE_HEIGHT,
  DEFAULT_EDITOR_FEATURE_FLAGS,
  editorFeatureFlags,
  EMPTY_COMPONENT_PROPS,
  EmptyComponentPreview,
  ensureComponentGuidelinesHeading,
  hasEditorFlagInLocation,
  hasEditorFlagInParentLocation,
  hasEditorFlagInStorage,
  isEditorFeatureEnabled,
  jsxComponentsSection,
  MAX_COMPONENT_STAGE_HEIGHT,
  normalizedComponentTitle,
  reactComponentsSection,
  StickyComponentNote,
  stripMatchingComponentHeading,
};
export function installEditorComponents(): () => void {
  return () => {
    reactComponentsSection = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    DEFAULT_EDITOR_FEATURE_FLAGS = {
      componentProps: false,
    };
    isEditorFeatureEnabled = (flag: string, queryKey: string) =>
      DEFAULT_EDITOR_FEATURE_FLAGS[flag] ||
      hasEditorFlagInParentLocation(queryKey) ||
      hasEditorFlagInStorage(flag);
    editorFeatureFlags = {
      componentProps: isEditorFeatureEnabled("componentProps", "ds_props"),
    };
    jsxComponentsSection = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    normalizedComponentTitle = (title: string) =>
      title.toLowerCase().replace(/[^a-z0-9]+/g, "");
    DEFAULT_COMPONENT_STAGE_HEIGHT = 120;
    MAX_COMPONENT_STAGE_HEIGHT = 4000;
    clampComponentStageHeight = (height: number | undefined): number =>
      height !== undefined && Number.isFinite(height)
        ? Math.min(MAX_COMPONENT_STAGE_HEIGHT, Math.max(40, Math.round(height)))
        : DEFAULT_COMPONENT_STAGE_HEIGHT;
    componentStageStyle = (component: Application.EditorComponent) => {
      let value = clampComponentStageHeight(component.previewHeight);
      if (component.previewWidth === undefined) {
        return {
          height: value,
        };
      } else {
        return {
          aspectRatio: String(component.previewWidth) + " / " + String(value),
          maxHeight: value,
        };
      }
    };
    EMPTY_COMPONENT_PROPS = [];
  };
}
