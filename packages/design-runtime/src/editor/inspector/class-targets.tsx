import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { Icon } from "../../cds/components/icon";
import { load_react_jsx_runtime } from "../../dependencies";
import { normalizeCssColor } from "../../design-system/type-declarations";
import { ChromeToolIconsColumnRowTextConfig } from "../chrome/tool-icons";
import { InspectorAnnotationFontFontSizeFontWeightSet, InspectorAnnotationLargerSmallerPattern, reactForClassStyleTargets } from "./annotation";
import { ColorWellFace } from "../properties/rows";
import { EditorTooltip } from "../properties/tooltip";
import { toModuleNamespace } from "../../module-helpers";
import { CdsIsland } from "../../platform/cds-island";

var InspectorClassTargetsLimit: Dynamic;
var InspectorClassTargetsLabel: Dynamic;
var jsxInspectorClassTargets: Dynamic;
var InspectorClassTargetsDataDcDataScPattern: Dynamic;
function isTextStyleProperty(propName?: Dynamic, propValue?: Dynamic): Dynamic {
  return (
    InspectorAnnotationFontFontSizeFontWeightSet.has(propName) &&
    InspectorAnnotationLargerSmallerPattern.test(propValue)
  );
}
function sharedInheritedTextStyle(model?: Dynamic, tids?: Dynamic): Dynamic {
  if (tids.length === 0 || tids.length > InspectorClassTargetsLimit)
    return [];
  let styleLists: Dynamic = tids.map(
      (tid?: Dynamic): Dynamic => model.inheritedTextStyle?.(tid) ?? [],
    ),
    firstStyleList: Dynamic = styleLists[0];
  if (
    styleLists.some(
      (styleList?: Dynamic): Dynamic =>
        JSON.stringify(styleList) !== JSON.stringify(firstStyleList),
    )
  )
    return [];
  let groups: Dynamic = [];
  for (let declaration of firstStyleList as Dynamic) {
    let lastGroup: Dynamic = groups.at(-1),
      cleanValue: Dynamic = declaration.value
        .replace(/\s+/g, " ")
        .replace(/\s*!\s*important\s*$/i, "");
    lastGroup && lastGroup.from === declaration.from && lastGroup.fromTid === declaration.fromTid
      ? lastGroup.decls.push({
          prop: declaration.prop,
          value: cleanValue,
        })
      : groups.push({
          from: declaration.from,
          fromTid: declaration.fromTid,
          decls: [
            {
              prop: declaration.prop,
              value: cleanValue,
            },
          ],
        });
  }
  return groups;
}
function findInspectorOutlineNode(
  nodes?: Dynamic,
  tid?: Dynamic,
): Dynamic {
  for (let value of (nodes ?? []) as Dynamic) {
    if (value.tid === tid) return value;
    let found: Dynamic = findInspectorOutlineNode(value.children, tid);
    if (found) return found;
  }
  return null;
}
function ClassStyleTargets({
  groups: groups,
  outline: outline,
  many = false,
  lockFor: lockFor,
  onSet: onSet,
  onSelectTid: onSelectTid,
  onHoverTid: onHoverTid,
}: Dynamic): Dynamic {
  useUiLocale();
  let hoverCallbackRef: Dynamic = (0, reactForClassStyleTargets.useRef)(
    onHoverTid,
  );
  hoverCallbackRef.current = onHoverTid;
  (0, reactForClassStyleTargets.useEffect)(
    (): Dynamic => (): Dynamic => hoverCallbackRef.current?.(null),
    [],
  );
  if (groups.length === 0) return null;
  let targetLabel: Dynamic = many ? uiMessage("inspector.classTargets.theseElements") : uiMessage("inspector.classTargets.thisElement");
  return (
    <CdsIsland density={"compact"} className={"contents"}>
      <div
        data-testid={"dc-code-inherited"}
        className={
          "flex flex-col gap-2 border-t px-3.5 pt-2.5 pb-3 text-footnote"
        }
        onKeyDown={(keyEvent?: Dynamic): Dynamic => {
          !keyEvent.metaKey &&
            !keyEvent.ctrlKey &&
            !keyEvent.altKey &&
            keyEvent.key !== "Tab" &&
            keyEvent.key !== "Escape" &&
            keyEvent.stopPropagation();
        }}
      >
        {groups.map((group?: Dynamic): Dynamic => {
          let sourceNode: Dynamic =
              group.fromTid != null
                ? findInspectorOutlineNode(outline, group.fromTid)
                : null,
            glyphIcon: Dynamic = sourceNode?.glyph
              ? ChromeToolIconsColumnRowTextConfig[sourceNode.glyph]
              : undefined,
            iconElement: Dynamic = glyphIcon ? (
              glyphIcon.custom ? (
                <Icon customIcon={glyphIcon.custom} size={"sm"} />
              ) : (
                <Icon name={glyphIcon.name} size={"sm"} />
              )
            ) : undefined;
          return (() => {
            const GroupComponent = "div";
            const groupProps = {
              role: "group",
              get "aria-label"() { return uiMessage("inspector.classTargets.inheritedFrom", { source: String(group.from) }); },
              className: "flex min-w-0 flex-col",
              children: [
                <div className={"flex min-w-0 items-center gap-1 text-muted"}>
                  <span className={"shrink-0"}>{uiMessage("inspector.classTargets.from")}</span>
                  {group.fromTid != null && onSelectTid ? (<EditorTooltip
                      tip={uiMessage("inspector.classTargets.select", { source: String(group.from) })}
                      className={"min-w-0"}
                    >
                      <Button
                        variant={"ghost"}
                        size={"xs"}
                        icon={iconElement}
                        aria-label={uiMessage("inspector.classTargets.select", { source: String(group.from) })}
                        className={
                          "min-w-0 font-mono " + InspectorClassTargetsLabel
                        }
                        onClick={(): Dynamic => {
                          onHoverTid?.(null);
                          onSelectTid(group.fromTid);
                        }}
                        onMouseEnter={(): Dynamic =>
                          onHoverTid?.(group.fromTid)
                        }
                        onMouseLeave={(): Dynamic => onHoverTid?.(null)}
                        onFocus={(): Dynamic => onHoverTid?.(group.fromTid)}
                        onBlur={(): Dynamic => onHoverTid?.(null)}
                      >
                        {group.from}
                      </Button>
                    </EditorTooltip>) : (<span
                      className={
                        "min-w-0 truncate px-1.5 font-mono text-secondary"
                      }
                    >
                      {group.from}
                    </span>)}
                </div>,
                group.decls.map((declaration?: Dynamic): Dynamic => {
                  let colorHex: Dynamic =
                      declaration.prop === "color"
                        ? normalizeCssColor(declaration.value)
                        : undefined,
                    lockReason: Dynamic = lockFor(declaration.prop, declaration.value);
                  return (() => {
                    const DeclarationComponent = "div";
                    const declarationProps = {
                      "data-testid": "dc-code-inherited-" + declaration.prop,
                      className:
                        "flex h-control min-w-0 items-center gap-2 pl-2 font-mono text-[11.5px] pointer-coarse:h-10",
                      children: [
                        <span
                          className={
                            "w-[6.25rem] shrink-0 truncate text-muted"
                          }
                        >
                          {declaration.prop}
                        </span>,
                        colorHex !== undefined && (
                          <ColorWellFace
                            hex={colorHex.slice(0, 7)}
                            alpha={
                              colorHex.length === 9
                                ? (parseInt(colorHex.slice(7), 16) / 255) * 100
                                : 100
                            }
                          />
                        ),
                        <span
                          className={
                            "min-w-0 flex-1 truncate text-secondary select-text"
                          }
                          title={declaration.value}
                        >
                          {declaration.value}
                        </span>,
                        <Button
                          variant={"ghost"}
                          size={"xs"}
                          iconOnly={true}
                          icon={"Add"}
                          data-inherited-set={""}
                          aria-label={uiMessage("inspector.classTargets.setOn", { property: String(declaration.prop), target: String(targetLabel) })}
                          tooltip={uiMessage("inspector.classTargets.setOnTarget", { target: String(targetLabel) })}
                          disabled={lockReason !== undefined}
                          disabledReason={(lockReason) ?? (uiMessage("inspector.classTargets.setOnTarget", { target: String(targetLabel) }))}
                          className={"shrink-0 " + InspectorClassTargetsLabel}
                          onClick={(): Dynamic =>
                            onSet(declaration.prop, declaration.value)
                          }
                        />,
                      ],
                    } as const;
                    const declarationKey = declaration.prop;
                    return <DeclarationComponent key={declarationKey} {...declarationProps} />;
                  })();
                }),
              ],
            } as const;
            const groupKey = group.from + ":" + String(group.fromTid);
            return <GroupComponent key={groupKey} {...groupProps} />;
          })();
        })}
      </div>
    </CdsIsland>
  );
}
export {
  ClassStyleTargets,
  findInspectorOutlineNode,
  InspectorClassTargetsDataDcDataScPattern,
  InspectorClassTargetsLabel,
  InspectorClassTargetsLimit,
  isTextStyleProperty,
  jsxInspectorClassTargets,
  sharedInheritedTextStyle,
};
export function installEditorInspectorClassTargets(): () => void {
  return () => {
    InspectorClassTargetsLimit = 20;
    InspectorClassTargetsLabel = "pointer-coarse:h-10 pointer-coarse:min-w-10";
    jsxInspectorClassTargets = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    InspectorClassTargetsDataDcDataScPattern =
      /^(data-dc-|data-sc-|sc-camel-|style$)/;
  };
}
