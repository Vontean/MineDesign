import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { load_react } from "../../dependencies";
import { ChromeScrollbarLabel, FloatingScrollbar } from "../chrome/scrollbar";
import { ComponentPropInput } from "./prop-editors";
import { equalPropValues, isEditablePropMetadata } from "./prop-validation";
import { jsxPropertiesRows } from "../properties/rows";
import { PropertySection } from "../properties/section";
import { toModuleNamespace } from "../../module-helpers";

var reactComponentsPropsPanel: Dynamic;
var ComponentsPropsPanelCategorical1Categorical2Categorical3Values: Dynamic;
var ComponentsPropsPanelMutedValues: Dynamic;
function groupComponentProps(input?: Dynamic): Dynamic {
  let items: Dynamic = [],
    entries: Dynamic = new Map(),
    items2: Dynamic = [];
  for (let value of input as Dynamic) {
    let section: Dynamic = value[1].section;
    if (typeof section == "string" && section !== "") {
      let entry: Dynamic = entries.get(section);
      entry ||
        ((entry = []),
        entries.set(section, entry),
        items.push({
          section: section,
          rows: entry,
        }));
      entry.push(value);
    } else items2.push(value);
  }
  return items2.length > 0
    ? [
        {
          section: null,
          rows: items2,
        },
        ...items,
      ]
    : items;
}
function ComponentPropsPanel({ dcProps: dcProps }: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = Object.entries(dcProps.propsMeta).filter(
    ([, input]: Dynamic): Dynamic =>
      (0, isEditablePropMetadata)(input),
  );
  if (value.length === 0)
    return (
      <div className={"px-lg py-4 text-center text-caption text-muted"}>
        {uiMessage("inspector.propsPanel.thisComponentHasNoTweakableProps")}
      </div>
    );
  let value2: Dynamic = groupComponentProps(value);
  return (
    <jsxPropertiesRows.Fragment>
      <div
        data-testid={"dc-props-panel"}
        data-tweaks-surface={""}
        className={
          "flex min-h-0 flex-col overflow-y-auto pt-1 " +
          ChromeScrollbarLabel
        }
      >
        {value2.map(
          (input?: Dynamic): Dynamic =>
            (() => {
              const _Component = PropertySection;
              const _props = {
                title: input.section ?? undefined,
                "data-testid":
                  input.section != null ? "dc-props-section" : undefined,
                children: input.rows.map(
                  ([input2, input3]: Dynamic): Dynamic => (
                    <ComponentPropInput
                      key={input2}
                      name={input2}
                      meta={input3}
                      value={dcProps.values[input2]}
                      onChange={(input4?: Dynamic): Dynamic =>
                        dcProps.setProp(input2, input4)
                      }
                      tweak={true}
                      onReset={
                        !dcProps.saving &&
                        dcProps.values[input2] !== undefined &&
                        !(0, equalPropValues)(
                          dcProps.values[input2],
                          input3.default,
                        )
                          ? (): Dynamic => dcProps.setProp(input2, undefined)
                          : undefined
                      }
                    />
                  ),
                ),
              } as const;
              const _key = input.section ?? "__loose";
              return <_Component key={_key} {..._props} />;
            })(),
        )}
        <FloatingScrollbar />
      </div>
      {dcProps.dirty && !dcProps.autoSavesDefaults && (<div
          data-tweaks-surface={""}
          className={
            "flex shrink-0 justify-end gap-1.5 border-t border-alpha-2 px-md py-3"
          }
        >
          <Button
            variant={"ghost"}
            onClick={dcProps.reset}
            disabled={dcProps.saving}
          >
            {uiMessage("inspector.propsPanel.reset")}
          </Button>
          <Button
            variant={"primary"}
            busy={dcProps.saving}
            busyLabel={"Saving\u2026"}
            onClick={(): Dynamic => {
              dcProps.saveAsDefaults();
            }}
          >
            {uiMessage("inspector.propsPanel.saveAsDefaults")}
          </Button>
        </div>)}
    </jsxPropertiesRows.Fragment>
  );
}
export {
  ComponentPropsPanel,
  ComponentsPropsPanelCategorical1Categorical2Categorical3Values,
  ComponentsPropsPanelMutedValues,
  groupComponentProps,
  reactComponentsPropsPanel,
};
export function installEditorComponentsPropsPanel(): () => void {
  return () => {
    reactComponentsPropsPanel = (0, toModuleNamespace)(
      (0, load_react)(),
      1,
    );
    ComponentsPropsPanelCategorical1Categorical2Categorical3Values = [
      "categorical-1",
      "categorical-2",
      "categorical-3",
      "categorical-4",
      "categorical-5",
      "categorical-6",
      "categorical-7",
      "categorical-8",
    ];
    ComponentsPropsPanelMutedValues = [
      ...ComponentsPropsPanelCategorical1Categorical2Categorical3Values,
      "muted",
    ];
  };
}
