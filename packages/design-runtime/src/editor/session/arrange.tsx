import { ADrawnLineOrPathCannotMessage } from "../outline/annotations";
import { CouldnTDetachThisInstanceRightNowMessage } from "../components/detach";
import { CouldnTFindThisComponentSArtboardOnMessage } from "../components/detach";
import { CutValue } from "../accessibility/announcements";
import { DownloadsArenTAvailableToYouForMessage } from "../../export/downloads";
import { FinishEditingThisDrawingSPointsToMessage } from "../geometry/flip-elements";
import { GeometryFlipElementsLabel_6 } from "../geometry/flip-elements";
import { InspectorEditorEvery } from "../inspector/editor";
import { InspectorEditorLabel_2 } from "../inspector/editor";
import { InspectorEditorLabel_3 } from "../inspector/editor";
import { KeyboardEditActionsCutCopyPasteConfig } from "../keyboard/edit-actions";
import { OutlineAnnotationsLabel } from "../outline/annotations";
import { PartsOfThisComponentCanTBeMessage } from "../components/detach";
import { SelectionStackingEvery } from "../selection/stacking";
import { ThisInstanceCanTBeDetachedWhereMessage } from "../components/detach";
import { ThisInstanceIsnTShownOnTheMessage } from "../components/detach";
import { ViewOnlyYouCanInspectThisMessage } from "../outline/annotations";
import { activeCropElement } from "../session/element-state";
import { announce } from "../accessibility/announcer";
import { canFlipSelection } from "../geometry/flip-elements";
import { canMovePositionedSelection } from "../selection/nudge";
import { commonSelectedAncestor } from "../layout/grouping";
import { detachComponentRefusal } from "../components/detach";
import { detachImportedComponent } from "../components/detach";
import { detachableComponentProps } from "../components/detach";
import { emptyArtboardDropTarget } from "../insert/drop-targets";
import { flipDirectionAnnouncement } from "../accessibility/announcements";
import { flipModelSelection } from "../geometry/flip-elements";
import { getPickerComponentScript } from "../picker/inspection";
import { groupModelElements } from "../layout/grouping";
import { importedComponentName } from "../components/detach";
import { inspectFlipSelection } from "../geometry/flip-elements";
import { inspectGroupLayout } from "../layout/grouping";
import { inspectPickerSelection } from "../picker/bridge";
import { isDetachableDcImport } from "../components/detach";
import { isEditableComponentName } from "../media/object-crop";
import { normalizeComputedStyleCarry } from "../clipboard/layout-snapshots";
import { parseDcHtmlDocument } from "../html/dc-document";
import { partialFlipMessage } from "../geometry/flip-elements";
import { promoteSvgShapeToRoot } from "../selection/element-order";
import { promotedSvgSelection } from "../selection/tree-navigation";
import { selectInstanceMessage } from "../components/detach";
import { selectedElementsInDocumentOrder } from "../selection/element-order";
import { selectedRootElementIds } from "../selection/element-order";
import { selectionDetachRefusal } from "../components/detach";
import { selectionUngroupRefusal } from "../layout/ungrouping";
import { setPickerSelection } from "../picker/bridge";
import { stackingAnnouncement } from "../accessibility/announcements";
import { supportsClipboardImages } from "../clipboard/png-copy";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { ungroupElementRefusal } from "../layout/ungrouping";
import { ungroupModelElement } from "../layout/ungrouping";

/** 按 Cmd+D 或选择“复制一份”时运行：在模型中逐个复制选中的顶层元素，记录撤销、推送实时模型并选中新副本。 */
export function duplicateSelectedModelElements(deps: { readonly incrementSessionEpoch: Dynamic; readonly markModelDirty: Dynamic; readonly modelRef: Dynamic; readonly pushLiveModel: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value106: Dynamic; readonly value49: Dynamic; readonly value50: Dynamic; readonly value62: Dynamic; readonly value66: Dynamic; readonly value67: Dynamic }): Dynamic {
      let current: Dynamic = deps.value49.current;
      if (
        !current ||
        deps.readOnlyRef.current ||
        current.name !== deps.rootName ||
        current.tids.length === 0
      )
        return;
      let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
      if (!value307) return;
      let value308: Dynamic = selectedRootElementIds(
        value307.model,
        [
          ...new Set(
            current.tids
              .filter(
                (input?: Dynamic): Dynamic =>
                  value307.model.element(input) != null,
              )
              .map(
                (input?: Dynamic): Dynamic =>
                  promoteSvgShapeToRoot(value307.model, input),
              ),
          ),
        ],
      );
      if (value308.length === 0) return;
      let redo: Dynamic = value307.redo,
        value309: Dynamic = deps.value101(
          deps.rootName,
          `duplicate-${Date.now()}`,
          value307,
        ),
        value310: Dynamic = value308
          .map(
            (input?: Dynamic): Dynamic =>
              value307.model.duplicateElement(input),
          )
          .filter((input?: Dynamic): Dynamic => input != null);
      if (value310.length === 0) {
        deps.value102(value307, value309, redo);
        return;
      }
      value307.model.restamp();
      let value311: Dynamic = value310
        .map(
          (element?: Dynamic): Dynamic =>
            parseInt(element.getAttribute("data-dc-tpl") ?? "-1", 10),
        )
        .filter((input?: Dynamic): Dynamic => input >= 0);
      deps.value66.current = deps.rootName;
      deps.pushLiveModel(deps.rootName, value307);
      deps.markModelDirty(deps.rootName);
      deps.incrementSessionEpoch();
      if (value311.length > 0) {
        let value312: Dynamic = deps.value67(),
          value313: Dynamic = deps.value106(value307, value311);
        deps.value105(deps.rootName, value311);
        value313 && (deps.value62.current = deps.value50.current);
        value312 &&
          setTimeout((): Dynamic => {
            let current2: Dynamic = deps.value49.current;
            current2?.name === deps.rootName &&
              InspectorEditorEvery(current2.tids, value311) &&
              setPickerSelection(value312, value311, deps.rootName);
          }, 60);
      }
    }

/** 选择“编组”时运行：检查选中元素是否同属一个可编组的父级，把它们包进一个新容器并按原有布局计算容器尺寸与定位，无法编组时提示原因。 */
export async function groupSelectedModelElements(deps: { readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value250: Dynamic; readonly value49: Dynamic; readonly value67: Dynamic }): Promise<Dynamic> {
      let current: Dynamic = deps.value49.current;
      if (
        !current ||
        deps.readOnlyRef.current ||
        current.name !== deps.rootName ||
        current.tids.length === 0
      )
        return;
      let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
      if (!value307) return;
      let value308: Dynamic = selectedElementsInDocumentOrder(
          value307.model,
          selectedRootElementIds(value307.model, [
            ...new Set(
              current.tids.map(
                (input?: Dynamic): Dynamic =>
                  promoteSvgShapeToRoot(value307.model, input),
              ),
            ),
          ]),
        ),
        value309: Dynamic =
          new Set(
            value308.map(
              (input?: Dynamic): Dynamic => value307.model.parentTid(input),
            ),
          ).size === 1,
        model: Dynamic = value307.model,
        value310: Dynamic = value308.map(
          (input?: Dynamic): Dynamic => model.element(input),
        ),
        value311: Dynamic = deps.value67(),
        value312: Dynamic = value309
          ? value307.model.parentTid(value308[0])
          : null,
        value313: Dynamic = value311
          ? await Promise.all(
              value308.map(
                (input?: Dynamic): Dynamic =>
                  inspectPickerSelection(
                    value311,
                    input,
                    deps.rootName,
                    ["position", "left", "top", "width", "height"],
                  ),
              ),
            )
          : [],
        value314: Dynamic =
          value311 && value312 != null
            ? await inspectPickerSelection(
                value311,
                value312,
                deps.rootName,
                [
                  "display",
                  "flexDirection",
                  "gap",
                  "justifyContent",
                  "alignItems",
                ],
              )
            : null,
        callback7: Dynamic = (input?: Dynamic): Dynamic =>
          (typeof input == "string" ? input : "").replace(/"/g, "'"),
        value315: Dynamic = normalizeComputedStyleCarry({
          display: callback7(value314?.computed.display),
          "flex-direction": callback7(value314?.computed.flexDirection),
          gap: callback7(value314?.computed.gap),
          "justify-content": callback7(value314?.computed.justifyContent),
          "align-items": callback7(value314?.computed.alignItems),
        }),
        value316: Dynamic = value315.display ?? "",
        value317: Dynamic = value316.includes("flex")
          ? `; display: ${value316}; flex-direction: ${value315["flex-direction"] || "row"}; gap: ${value315.gap || "0px"}; justify-content: ${value315["justify-content"] || "flex-start"}; align-items: ${value315["align-items"] || "stretch"}`
          : "",
        callback8: Dynamic = (input?: Dynamic): Dynamic => {
          let value322: Dynamic = parseFloat(input ?? "");
          return Number.isFinite(value322) ? value322 : 0;
        },
        callback9: Dynamic = (input?: Dynamic): Dynamic =>
          !!input &&
          (input.computed.position === "absolute" ||
            input.computed.position === "fixed");
      if (!value309 && value313.some(callback9)) {
        let value322: Dynamic = value311
            ? await inspectGroupLayout(
                value311,
                deps.rootName,
                value308,
                commonSelectedAncestor(value307.model, value308),
              )
            : null,
          current2: Dynamic = deps.value49.current;
        if (
          current2?.name !== current.name ||
          current2.tids.join() !== current.tids.join() ||
          deps.readOnlyRef.current ||
          deps.modelRef.current.state(deps.rootName) !== value307 ||
          value307.model !== model ||
          value308.some(
            (input?: Dynamic, options?: Dynamic): Dynamic =>
              model.element(input) !== value310[options],
          )
        )
          return;
        if (value322 === undefined) {
          deps.showToast(uiMessage("inspector.session.couldnTGroupTheseRight"));
          return;
        }
        let value323: Dynamic =
          value322?.filter((input?: Dynamic): Dynamic => input !== null) ??
          [];
        if (value323.length !== value308.length) {
          deps.showToast(uiMessage("inspector.session.canTGroupTheseElements"));
          return;
        }
        if (value323.some((input?: Dynamic): Dynamic => !input.liftable)) {
          deps.showToast(uiMessage("inspector.session.listItemsAndTableCells"));
          return;
        }
        if (
          value323.some(
            (input?: Dynamic): Dynamic => input.position === "fixed",
          )
        ) {
          deps.showToast(uiMessage("inspector.session.canTGroupTheseOne"));
          return;
        }
        if (value323.some((input?: Dynamic): Dynamic => input.transformed)) {
          deps.showToast(
            uiMessage("inspector.session.canTGroupTheseOne2"),
          );
          return;
        }
        let redo2: Dynamic = value307.redo,
          value324: Dynamic = deps.value101(
            deps.rootName,
            `group-${Date.now()}`,
            value307,
          ),
          value325: Dynamic = groupModelElements(
            value307.model,
            value308,
            value323,
          );
        if (!value325) {
          deps.value102(value307, value324, redo2);
          deps.showToast(uiMessage("inspector.session.canTGroupTheseElements"));
          return;
        }
        deps.value250(value307, [value325]);
        return;
      }
      if (
        deps.readOnlyRef.current ||
        deps.modelRef.current.state(deps.rootName) !== value307 ||
        value307.model !== model ||
        value308.some(
          (input?: Dynamic, options?: Dynamic): Dynamic =>
            model.element(input) !== value310[options],
        )
      ) {
        deps.readOnlyRef.current ||
          deps.showToast(uiMessage("inspector.session.couldnTGroupTheseRight"));
        return;
      }
      let value318: Dynamic =
          value313.length === value308.length && value313.every(callback9),
        redo: Dynamic = value307.redo,
        value319: Dynamic = deps.value101(
          deps.rootName,
          `group-${Date.now()}`,
          value307,
        ),
        value320: Dynamic = `<div data-dc-group style="box-sizing: border-box${value317}"></div>`,
        index: Dynamic = 0,
        index2: Dynamic = 0;
      if (value318) {
        index = Math.min(
          ...value313.map(
            (input?: Dynamic): Dynamic => callback8(input?.computed.left),
          ),
        );
        index2 = Math.min(
          ...value313.map(
            (input?: Dynamic): Dynamic => callback8(input?.computed.top),
          ),
        );
        let value322: Dynamic = Math.max(
            ...value313.map(
              (input?: Dynamic): Dynamic =>
                callback8(input?.computed.left) +
                callback8(input?.computed.width),
            ),
          ),
          value323: Dynamic = Math.max(
            ...value313.map(
              (input?: Dynamic): Dynamic =>
                callback8(input?.computed.top) +
                callback8(input?.computed.height),
            ),
          );
        value320 = `<div data-dc-group style="box-sizing: border-box; position: absolute; left: ${Math.round(index)}px; top: ${Math.round(index2)}px; width: ${Math.round(value322 - index)}px; height: ${Math.round(value323 - index2)}px"></div>`;
      }
      let value321: Dynamic = value307.model.wrapElements(value308, value320);
      if (!value321) {
        deps.value102(value307, value319, redo);
        deps.showToast(uiMessage("inspector.session.canTGroupTheseElements"));
        return;
      }
      value318 &&
        value308.forEach((input?: Dynamic, options?: Dynamic): Dynamic => {
          let value322: Dynamic = value313[options];
          value322 &&
            (value307.model.setStyleProperty(
              input,
              "left",
              `${Math.round(callback8(value322.computed.left) - index)}px`,
            ),
            value307.model.setStyleProperty(
              input,
              "top",
              `${Math.round(callback8(value322.computed.top) - index2)}px`,
            ),
            value307.model.setStyleProperty(input, "right", null),
            value307.model.setStyleProperty(input, "bottom", null));
        });
      deps.value250(value307, [value321]);
    }

/** 选择“解除组件实例”时运行：确认选中的是可解除的组件实例并读取组件源文件，把实例替换为展开后的普通标记，必要时带上依赖资源，无法解除时提示原因。 */
export async function detachSelectedComponentInstances(deps: { readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value250: Dynamic; readonly value49: Dynamic; readonly value67: Dynamic }): Promise<Dynamic> {
      let current: Dynamic = deps.value49.current;
      if (
        !current ||
        deps.readOnlyRef.current ||
        current.name !== deps.rootName ||
        current.tids.length === 0
      )
        return;
      let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
      if (!value307) return;
      let model: Dynamic = value307.model,
        value308: Dynamic = selectedElementsInDocumentOrder(
          model,
          selectedRootElementIds(model, current.tids),
        ),
        value309: Dynamic = value308.filter(
          (input?: Dynamic): Dynamic =>
            isDetachableDcImport(model, input),
        );
      if (value309.length === 0)
        return void deps.showToast(
          selectionDetachRefusal(model, value308) ??
            selectInstanceMessage,
        );
      let value310: Dynamic = value309.map(
          (input?: Dynamic): Dynamic => model.element(input),
        ),
        value311: Dynamic = deps.value67(),
        value312: Dynamic = await Promise.all(
          value309.map(async (input?: Dynamic): Promise<Dynamic> => {
            let value317: Dynamic = importedComponentName(
              model.attributes(input),
            );
            if (
              !isEditableComponentName(value317) ||
              value317 === deps.rootName
            )
              return {
                blocked: CouldnTFindThisComponentSArtboardOnMessage,
              };
            let outcome: Dynamic = (
                await deps.modelRef.current.entryCheck(value317)
              ).outcome,
              value318: Dynamic = deps.modelRef.current.state(value317);
            if (
              !value318 ||
              value318.path.replace(/[^/]*$/, "") !==
                value307.path.replace(/[^/]*$/, "")
            )
              return {
                blocked: CouldnTFindThisComponentSArtboardOnMessage,
              };
            if (
              ![
                "cold",
                "fresh",
                "rebuilt",
                "self-write",
                "src-advanced",
              ].includes(outcome)
            )
              return {
                blocked: CouldnTDetachThisInstanceRightNowMessage,
              };
            let model2: Dynamic = value318.model,
              value319: Dynamic =
                parseDcHtmlDocument(value318.src)?.js ?? "";
            if (/componentDidMount|this\.state\b/.test(value319))
              return {
                blocked: PartsOfThisComponentCanTBeMessage,
              };
            let value320: Dynamic = value311
              ? await getPickerComponentScript(
                  value311,
                  value317,
                  detachableComponentProps(
                    model.attributes(input),
                  ),
                )
              : null;
            return value320 === "missing"
              ? {
                  blocked: ThisInstanceIsnTShownOnTheMessage,
                }
              : value320 === "big"
                ? {
                    blocked: PartsOfThisComponentCanTBeMessage,
                  }
                : !value320 ||
                    (!value320.hasLogic && value319.trim() !== "") ||
                    deps.modelRef.current.state(value317) !== value318 ||
                    value318.model !== model2
                  ? {
                      blocked:
                        CouldnTDetachThisInstanceRightNowMessage,
                    }
                  : {
                      model: model2,
                      vals: value320.vals,
                      held: value320.held,
                    };
          }),
        ),
        current2: Dynamic = deps.value49.current;
      if (
        current2?.name !== current.name ||
        current2.tids.join() !== current.tids.join() ||
        deps.readOnlyRef.current ||
        deps.modelRef.current.state(deps.rootName) !== value307 ||
        value307.model !== model ||
        value309.some(
          (input?: Dynamic, options?: Dynamic): Dynamic =>
            model.element(input) !== value310[options],
        )
      )
        return;
      let callback7: Dynamic = (
        input?: Dynamic,
        options?: Dynamic,
      ): Dynamic =>
        !("blocked" in input) &&
        deps.modelRef.current.state(
          importedComponentName(model.attributes(options)),
        )?.model !== input.model;
      if (
        value312.some(
          (input?: Dynamic, options?: Dynamic): Dynamic =>
            callback7(input, value309[options]),
        )
      )
        return void deps.showToast(
          CouldnTDetachThisInstanceRightNowMessage,
        );
      let redo: Dynamic = value307.redo,
        value313: Dynamic = deps.value101(
          deps.rootName,
          `detach-${Date.now()}`,
          value307,
        ),
        items2: Dynamic = [],
        value314: Dynamic = model.survivesReparse(),
        value315: Dynamic = value308.find(
          (input?: Dynamic): Dynamic =>
            model.tagName(input) === "dc-import" &&
            !isDetachableDcImport(model, input),
        ),
        value316: Dynamic =
          value315 != null
            ? detachComponentRefusal(model, value315)
            : undefined;
      value309.forEach((input?: Dynamic, options?: Dynamic): Dynamic => {
        let value317: Dynamic = value312[options],
          value318: Dynamic =
            "blocked" in value317
              ? value317
              : detachImportedComponent(model, input, value317),
          value319: Dynamic =
            value318.blocked === undefined
              ? model.insertHtml(value318.html, input, "before")
              : null;
        if (value318.blocked !== undefined || !value319) {
          value316 ??=
            value318.blocked ??
            CouldnTDetachThisInstanceRightNowMessage;
          return;
        }
        let value320: Dynamic = value314 && !model.survivesReparse();
        if (value320 || !model.carryHelmet(value318.assets)) {
          for (let value321 of value319 as Dynamic) value321.remove();
          value316 ??= value320
            ? ThisInstanceCanTBeDetachedWhereMessage
            : PartsOfThisComponentCanTBeMessage;
          return;
        }
        model.removeElement(input);
        value318.atomics && model.ensureHelmetAtomics();
        items2.push(...value319);
      });
      value316 !== undefined &&
        deps.showToast(
          items2.length === 0
            ? value316
            : `${value316.replace(/\.?$/, ".")} ${items2.length} of ${value308.filter((input?: Dynamic): Dynamic => model.tagName(input) === "dc-import").length} instances ${items2.length === 1 ? "was" : "were"} detached.`,
        );
      if (items2.length === 0) {
        deps.value102(value307, value313, redo);
        return;
      }
      deps.value250(
        value307,
        items2,
        items2.length === 1
          ? uiMessage("inspector.session.detachedAComponentInstanceInto")
          : `detached ${items2.length} component instances into plain markup`,
      );
    }

/** 选择“取消编组”时运行：检查选中的容器可以拆开，把子元素提升到父级并移除容器，记录撤销；无法取消编组时提示。 */
export async function ungroupSelectedModelElements(deps: { readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value250: Dynamic; readonly value49: Dynamic; readonly value67: Dynamic }): Promise<Dynamic> {
      let current: Dynamic = deps.value49.current;
      if (
        !current ||
        deps.readOnlyRef.current ||
        current.name !== deps.rootName ||
        current.tids.length === 0
      )
        return;
      let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
      if (!value307) return;
      let model: Dynamic = value307.model,
        value308: Dynamic = selectionUngroupRefusal(
          model,
          current.tids,
        );
      if (value308 !== undefined)
        return void deps.showToast(
          value308.endsWith(".") ? value308 : value308 + ".",
        );
      let value309: Dynamic = selectedRootElementIds(
          model,
          current.tids,
        ).filter(
          (input?: Dynamic): Dynamic =>
            ungroupElementRefusal(model, input) === undefined,
        ),
        value310: Dynamic = value309
          .flatMap(
            (input?: Dynamic): Dynamic => [input, ...model.childTids(input)],
          )
          .map((input?: Dynamic): Dynamic => [input, model.element(input)]),
        value311: Dynamic = deps.value67(),
        value312: Dynamic = await Promise.all(
          value309.map(async (input?: Dynamic): Promise<Dynamic> => {
            let value314: Dynamic = model.childTids(input),
              value315: Dynamic =
                value311 && value314.length > 0
                  ? await inspectGroupLayout(
                      value311,
                      deps.rootName,
                      value314,
                      commonSelectedAncestor(model, [input]),
                      false,
                    )
                  : null;
            return value315 === undefined
              ? undefined
              : new Map(
                  value314.flatMap(
                    (input2?: Dynamic, options?: Dynamic): Dynamic =>
                      value315?.[options]
                        ? [[input2, value315[options]]]
                        : [],
                  ),
                );
          }),
        ),
        current2: Dynamic = deps.value49.current;
      if (
        current2?.name !== current.name ||
        current2.tids.join() !== current.tids.join() ||
        deps.readOnlyRef.current ||
        deps.modelRef.current.state(deps.rootName) !== value307 ||
        value307.model !== model ||
        value310.some(
          ([input, input2]: Dynamic): Dynamic =>
            model.element(input) !== input2,
        )
      )
        return;
      if (value312.some((input?: Dynamic): Dynamic => input === undefined)) {
        deps.showToast(uiMessage("inspector.session.couldnTUngroupTheseRight"));
        return;
      }
      let redo: Dynamic = value307.redo,
        value313: Dynamic = deps.value101(
          deps.rootName,
          `ungroup-${Date.now()}`,
          value307,
        ),
        items2: Dynamic = [],
        flag: Dynamic = false;
      value309.forEach((input?: Dynamic, options?: Dynamic): Dynamic => {
        let value314: Dynamic = ungroupModelElement(
          model,
          input,
          value312[options] ?? null,
        );
        value314 && (items2.push(...value314), (flag = true));
      });
      if (!flag) {
        deps.value102(value307, value313, redo);
        return;
      }
      deps.value250(value307, items2);
    }

/** 水平或垂直翻转选中元素时运行：排除矢量编辑与裁剪中的情况，读取当前姿态后在模型中翻转，部分元素无法翻转时提示并播报翻转方向。 */
export async function flipSelectedModelElements(deps: { readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly toolRef: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value105: Dynamic; readonly value149: Dynamic; readonly value49: Dynamic; readonly value67: Dynamic; readonly value8: Dynamic }, input?: Dynamic): Promise<Dynamic> {
        let current: Dynamic = deps.value49.current;
        if (
          !current ||
          deps.readOnlyRef.current ||
          current.name !== deps.rootName ||
          current.tids.length === 0
        )
          return;
        let value307: Dynamic =
          deps.toolRef.current === "vector"
            ? FinishEditingThisDrawingSPointsToMessage
            : activeCropElement() !== null
              ? GeometryFlipElementsLabel_6
              : undefined;
        if (value307 !== undefined) return void deps.showToast(value307 + ".");
        let value308: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value308) return;
        let model: Dynamic = value308.model,
          value309: Dynamic = current.tids.map(
            (input2?: Dynamic): Dynamic => model.element(input2),
          ),
          value310: Dynamic = deps.value67(),
          value311: Dynamic = await inspectFlipSelection(
            model,
            current.tids,
            (
              input2?: Dynamic,
              options?: Dynamic,
              context?: Dynamic,
            ): Dynamic =>
              value310
                ? inspectPickerSelection(
                    value310,
                    input2,
                    deps.rootName,
                    options,
                    {
                      pose: true,
                      afterPaint: context,
                    },
                  )
                : Promise.resolve(null),
          ),
          current2: Dynamic = deps.value49.current;
        if (
          deps.readOnlyRef.current ||
          deps.toolRef.current === "vector" ||
          activeCropElement() !== null ||
          current2?.name !== current.name ||
          current2.tids.join() !== current.tids.join() ||
          deps.modelRef.current.state(deps.rootName) !== value308 ||
          value308.model !== model ||
          current.tids.some(
            (input2?: Dynamic, options?: Dynamic): Dynamic =>
              model.element(input2) !== value309[options],
          )
        )
          return;
        let redo: Dynamic = value308.redo,
          value312: Dynamic = deps.value101(
            deps.rootName,
            `flip-${Date.now()}`,
            value308,
          ),
          { flipped: value313, refused: value314 }: Dynamic = flipModelSelection(model, current.tids, input, value311);
        value314 !== undefined &&
          deps.showToast(
            partialFlipMessage(value314, value313.length > 0),
          );
        if (value313.length === 0)
          return void deps.value102(value308, value312, redo);
        deps.value149(current2, value308);
        deps.value105(deps.rootName, current2.tids);
        announce(flipDirectionAnnouncement(input));
        deps.value8(
          `${value308.path}: flipped ${value313.length > 1 ? `${value313.length} elements` : (model.tagName(value313[0]) ?? "element")} ${input === "horizontal" ? "horizontally" : "vertically"}`,
        );
      }

/** 选择“包进 Flex/Grid”时运行：把选中元素包进一个自动布局容器（flex 或 grid），按元素原位置推断方向、排序与间距，记录撤销；无法包裹时提示。 */
export async function wrapSelectionInAutoLayout(deps: { readonly modelRef: Dynamic; readonly readOnlyRef: Dynamic; readonly rootName: Dynamic; readonly showToast: Dynamic; readonly value101: Dynamic; readonly value102: Dynamic; readonly value250: Dynamic; readonly value49: Dynamic; readonly value67: Dynamic }, input: Dynamic = "flex"): Promise<Dynamic> {
        let current: Dynamic = deps.value49.current;
        if (
          !current ||
          deps.readOnlyRef.current ||
          current.name !== deps.rootName ||
          current.tids.length === 0
        )
          return;
        let value307: Dynamic = deps.modelRef.current.state(deps.rootName);
        if (!value307) return;
        let items2: Dynamic = [
            ...new Set(
              current.tids.map(
                (input2?: Dynamic): Dynamic =>
                  promoteSvgShapeToRoot(value307.model, input2),
              ),
            ),
          ],
          value308: Dynamic =
            items2.length !== current.tids.length ||
            items2.some(
              (input2?: Dynamic, options?: Dynamic): Dynamic =>
                input2 !== current.tids[options],
            ),
          value309: Dynamic = selectedElementsInDocumentOrder(
            value307.model,
            selectedRootElementIds(value307.model, items2),
          ),
          value310: Dynamic =
            new Set(
              value309.map(
                (input2?: Dynamic): Dynamic =>
                  value307.model.parentTid(input2),
              ),
            ).size === 1,
          value311: Dynamic =
            value309.length === 1
              ? value307.model.element(value309[0])
              : null;
        if (
          !value308 &&
          value311 &&
          value307.model.childTids(value309[0]).length > 0
        ) {
          let redo2: Dynamic = value307.redo,
            value320: Dynamic = deps.value101(
              deps.rootName,
              `autolayout-${Date.now()}`,
              value307,
            ),
            value321: Dynamic =
              input === "grid"
                ? [
                    ["display", "grid"],
                    ["grid-template-columns", "repeat(2, minmax(0, 1fr))"],
                    ["gap", "12px"],
                  ]
                : [
                    ["display", "flex"],
                    ["flex-direction", "column"],
                    ["gap", "12px"],
                  ],
            flag: Dynamic = false;
          for (let [value322, value323] of value321 as Dynamic)
            flag =
              value307.model.setStyleProperty(
                value309[0],
                value322,
                value323,
              ) || flag;
          flag
            ? deps.value250(value307, [value311])
            : deps.value102(value307, value320, redo2);
          return;
        }
        let value312: Dynamic = deps.value67(),
          value313: Dynamic =
            value312 && value310
              ? await Promise.all(
                  value309.map(
                    (input2?: Dynamic): Dynamic =>
                      inspectPickerSelection(
                        value312,
                        input2,
                        deps.rootName,
                        ["position", "left", "top", "width", "height"],
                      ),
                  ),
                )
              : [],
          callback7: Dynamic = (input2?: Dynamic): Dynamic => {
            let value320: Dynamic = parseFloat(input2 ?? "");
            return Number.isFinite(value320) ? value320 : 0;
          },
          value314: Dynamic =
            value313.length === value309.length && value313.every(Boolean),
          value315: Dynamic =
            value314 &&
            value313.every(
              (input2?: Dynamic): Dynamic =>
                input2 &&
                (input2.computed.position === "absolute" ||
                  input2.computed.position === "fixed"),
            ),
          text2: Dynamic = "column";
        if (value314 && value315) {
          let value320: Dynamic = value313.map(
              (input2?: Dynamic): Dynamic =>
                callback7(input2?.computed.left) +
                callback7(input2?.computed.width) / 2,
            ),
            value321: Dynamic = value313.map(
              (input2?: Dynamic): Dynamic =>
                callback7(input2?.computed.top) +
                callback7(input2?.computed.height) / 2,
            );
          text2 =
            Math.max(...value320) - Math.min(...value320) >
            Math.max(...value321) - Math.min(...value321)
              ? "row"
              : "column";
        }
        let count: Dynamic = 2;
        if (input === "grid" && value315) {
          let value320: Dynamic = value309
              .map(
                (input2?: Dynamic, options?: Dynamic): Dynamic => ({
                  t: input2,
                  l: callback7(value313[options]?.computed.left),
                  tp: callback7(value313[options]?.computed.top),
                  b:
                    callback7(value313[options]?.computed.top) +
                    callback7(value313[options]?.computed.height),
                }),
              )
              .sort(
                (input2?: Dynamic, options?: Dynamic): Dynamic =>
                  input2.tp - options.tp,
              ),
            items3: Dynamic = [],
            value321: Dynamic = -1 / 0;
          for (let value322 of value320 as Dynamic)
            items3.length === 0 || value322.tp >= value321
              ? (items3.push([value322]), (value321 = value322.b))
              : (items3[items3.length - 1].push(value322),
                (value321 = Math.max(value321, value322.b)));
          count = Math.max(
            1,
            ...items3.map((items4?: Dynamic): Dynamic => items4.length),
          );
        }
        let redo: Dynamic = value307.redo,
          value316: Dynamic = deps.value101(
            deps.rootName,
            `autolayout-${Date.now()}`,
            value307,
          ),
          value317: Dynamic =
            input === "grid"
              ? `display: grid; grid-template-columns: repeat(${count}, minmax(0, 1fr)); gap: 12px`
              : `display: flex; flex-direction: ${text2}; gap: 12px`,
          value318: Dynamic = `<div style="box-sizing: border-box; ${value317}"></div>`;
        if (value315) {
          let value320: Dynamic = Math.min(
              ...value313.map(
                (input2?: Dynamic): Dynamic =>
                  callback7(input2?.computed.left),
              ),
            ),
            value321: Dynamic = Math.min(
              ...value313.map(
                (input2?: Dynamic): Dynamic =>
                  callback7(input2?.computed.top),
              ),
            );
          value318 = `<div style="box-sizing: border-box; position: absolute; left: ${Math.round(value320)}px; top: ${Math.round(value321)}px; ${value317}"></div>`;
        }
        let value319: Dynamic = value307.model.wrapElements(
          value309,
          value318,
        );
        if (!value319) {
          deps.value102(value307, value316, redo);
          deps.showToast(uiMessage("inspector.session.canTAutoLayoutThese"));
          return;
        }
        for (let value320 of value309 as Dynamic) {
          value307.model.setStyleProperty(value320, "position", null);
          value307.model.setStyleProperty(value320, "left", null);
          value307.model.setStyleProperty(value320, "top", null);
          value307.model.setStyleProperty(value320, "right", null);
          value307.model.setStyleProperty(value320, "bottom", null);
        }
        deps.value250(value307, [value319]);
      }

/** 打开选中元素的右键菜单时运行：按只读、选中类型与可用能力生成菜单项（层级前后移动、剪切复制、复制为 PNG/SVG、粘贴、复制一份、编组与取消编组、翻转、解除实例、包进 Flex/Grid、删除）及其禁用原因。 */
export function buildElementContextActions(deps: { readonly canvasTools: Dynamic; readonly insertAtPoint: Dynamic; readonly modelRef: Dynamic; readonly readOnly: Dynamic; readonly rootName: Dynamic; readonly toolRef: Dynamic; readonly value153: Dynamic; readonly value154: Dynamic; readonly value164: Dynamic; readonly value167: Dynamic; readonly value169: Dynamic; readonly value170: Dynamic; readonly value171: Dynamic; readonly value174: Dynamic; readonly value251: Dynamic; readonly value259: Dynamic; readonly value260: Dynamic; readonly value261: Dynamic; readonly value262: Dynamic; readonly value268: Dynamic; readonly value49: Dynamic; readonly value77: Dynamic; readonly value78: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let current: Dynamic = deps.value49.current,
          value307: Dynamic =
            input != null ||
            (!!current &&
              current.name === deps.rootName &&
              current.tids.length > 0),
          value308: Dynamic = deps.readOnly
            ? {
                disabled: true,
                disabledReason: ViewOnlyYouCanInspectThisMessage,
              }
            : null,
          value309: Dynamic = deps.modelRef.current.state(deps.rootName)?.model,
          value310: Dynamic = current?.name === deps.rootName ? current.tids : [],
          value311: Dynamic =
            input != null && !value310.includes(input) ? [input] : value310,
          value312: Dynamic =
            value309 && value307
              ? selectionDetachRefusal(
                  value309,
                  selectedElementsInDocumentOrder(
                    value309,
                    selectedRootElementIds(value309, [
                      ...value311,
                    ]),
                  ),
                )
              : undefined,
          value313: Dynamic =
            input != null && !value310.includes(input)
              ? undefined
              : deps.toolRef.current === "vector"
                ? FinishEditingThisDrawingSPointsToMessage
                : activeCropElement() !== null
                  ? GeometryFlipElementsLabel_6
                  : undefined,
          value314: Dynamic = value307
            ? null
            : {
                disabled: true,
                disabledReason: OutlineAnnotationsLabel,
              },
          value315: Dynamic =
            !!value309 &&
            value307 &&
            canMovePositionedSelection(value309, value311),
          value316: Dynamic =
            !!value309 &&
            promotedSvgSelection(value309, value311).promoted &&
            value311.every(
              (input2?: Dynamic): Dynamic =>
                value309
                  .childTids(value309.parentTid(input2))
                  .filter(
                    (input3?: Dynamic): Dynamic =>
                      value309.isOutlineRow(input3) &&
                      value309.tagName(input3) !== "defs",
                  ).length === 1,
            ),
          callback7: Dynamic = (input2?: Dynamic): Dynamic => ({
            get label() { return value315 ? (KeyboardEditActionsCutCopyPasteConfig[
                  input2 > 0 ? "front" : "back"
                ].label) : (input2 > 0 ? (uiMessage("inspector.session.moveToLast")) : (uiMessage("inspector.session.moveToFirst"))); },
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig[
                input2 > 0 ? "front" : "back"
              ].shortcut,
            get disabledReason() { return !value309 || !value307 ? (undefined) : (value316 ? (ADrawnLineOrPathCannotMessage) : (SelectionStackingEvery(
                        value309,
                        value311,
                        input2,
                      ) ? (value315 ? (stackingAnnouncement(
                          input2 > 0 ? "front" : "back",
                          false,
                        )) : (input2 > 0 ? (uiMessage("inspector.session.alreadyLast")) : (uiMessage("inspector.session.alreadyFirst")))) : (undefined))); },
            onClick: (): Dynamic => deps.value251(input2, true),
            ...value314,
            ...value308,
          }),
          callback8: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic => ({
            label:
              KeyboardEditActionsCutCopyPasteConfig[input2].label,
            hotkey:
              KeyboardEditActionsCutCopyPasteConfig[input2].shortcut,
            onClick: options2,
          });
        return [
          {
            ...callback8("cut", (): Dynamic => {
              deps.value164() != null && deps.value153(CutValue);
            }),
            ...value314,
            ...value308,
          },
          {
            ...callback8("copy", (): Dynamic => {
              deps.value164();
            }),
            ...value314,
          },
          ...(deps.value78 && supportsClipboardImages()
            ? [
                {
                  get label() { return uiMessage("inspector.session.copyAsPNG"); },
                  disabledReason: deps.value77
                    ? DownloadsArenTAvailableToYouForMessage
                    : value311.length > 1
                      ? InspectorEditorLabel_2
                      : undefined,
                  onClick: (): Dynamic => deps.value170(value311),
                  ...value314,
                },
                {
                  get label() { return uiMessage("inspector.session.copyAsSVG"); },
                  disabledReason: deps.value77
                    ? DownloadsArenTAvailableToYouForMessage
                    : value311.length > 1
                      ? InspectorEditorLabel_3
                      : undefined,
                  onClick: (): Dynamic => deps.value171(value311),
                  ...value314,
                },
              ]
            : []),
          {
            ...callback8("paste", (): Dynamic => {
              deps.value167({
                menu: true,
              });
            }),
            ...value308,
          },
          ...(deps.value78 &&
          options &&
          deps.insertAtPoint &&
          deps.canvasTools &&
          value309 &&
          emptyArtboardDropTarget(value309) != null
            ? [
                {
                  get label() { return uiMessage("inspector.session.pasteHere"); },
                  onClick: (): Dynamic => {
                    deps.value169(options);
                  },
                  ...value308,
                },
              ]
            : []),
          {
            ...callback8("duplicate", (): Dynamic => deps.value174()),
            ...value314,
            ...value308,
          },
          {
            ...callback7(1),
            separatorBefore: true,
          },
          callback7(-1),
          {
            get label() { return uiMessage("inspector.session.group"); },
            hotkey: "cmd+g",
            onClick: (): Dynamic => {
              deps.value260();
            },
            ...value314,
            ...value308,
          },
          {
            get label() { return uiMessage("inspector.session.ungroup"); },
            hotkey: "shift+cmd+g",
            disabledReason: value309
              ? selectionUngroupRefusal(value309, value311)
              : undefined,
            onClick: (): Dynamic => {
              deps.value262();
            },
            ...value314,
            ...value308,
          },
          ...["horizontal", "vertical"].map(
            (input2?: Dynamic): Dynamic => ({
              get label() { return uiMessage("inspector.session.flip", { value1: String(input2) }); },
              hotkey: input2 === "horizontal" ? "shift+h" : "shift+v",
              disabledReason:
                value313 ??
                (value309
                  ? canFlipSelection(value309, value311, input2)
                  : undefined),
              onClick: (): Dynamic => deps.value259(input2),
              ...value314,
              ...value308,
            }),
          ),
          {
            get label() { return uiMessage("inspector.session.detachInstance"); },
            separatorBefore: true,
            disabled: !value309,
            ...(value312 != null
              ? {
                  disabled: true,
                  disabledReason: value312,
                }
              : null),
            onClick: (): Dynamic => {
              deps.value261();
            },
            ...value314,
            ...value308,
          },
          {
            get label() { return uiMessage("inspector.session.wrapInFlex"); },
            hotkey: "shift+a",
            onClick: (): Dynamic => {
              deps.value268();
            },
            ...value314,
            ...value308,
          },
          {
            get label() { return uiMessage("inspector.session.wrapInGrid"); },
            onClick: (): Dynamic => {
              deps.value268("grid");
            },
            ...value314,
            ...value308,
          },
          {
            ...callback8("delete", deps.value154),
            separatorBefore: true,
            danger: true,
            ...value314,
            ...value308,
          },
        ];
      }
