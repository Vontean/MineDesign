import { InspectorEditorResolvedValue_2 } from "../inspector/editor";
import { deferSelectionClear } from "../model/selection-relocation";
import { relocateModelElementIds } from "../model/selection-relocation";
import { relocateSelectionRef } from "../model/selection-relocation";
import { setPickerSelection } from "../picker/bridge";
import { type Dynamic } from "../../runtime-types";
import { verifyPickerSelection } from "../picker/bridge";

/** 每次向画板推送实时模型后运行：防抖 250ms，把模板大纲与画板中实际渲染的元素逐一比对，发现缺失、父子或顺序不一致时只在控制台告警，不改动作品。 */
export function scheduleLiveDomSyncCheck(deps: { readonly delegatedFileRef: Dynamic; readonly modelRef: Dynamic; readonly value67: Dynamic; readonly value89: Dynamic }, input?: Dynamic): Dynamic {
        deps.delegatedFileRef.current ||
          (deps.value89.current && clearTimeout(deps.value89.current),
          (deps.value89.current = setTimeout((): Dynamic => {
            deps.value89.current = null;
            (async (): Promise<Dynamic> => {
              let value307: Dynamic = deps.modelRef.current.state(input),
                value308: Dynamic = deps.value67();
              if (!value307 || !value308) return;
              let state: Dynamic = {},
                state2: Dynamic = {},
                values: Dynamic = new Set(["sc-for", "sc-if"]),
                callback7: Dynamic = (input2?: Dynamic): Dynamic =>
                  input2.flatMap(
                    (input3?: Dynamic): Dynamic =>
                      values.has(input3.tag)
                        ? callback7(input3.children)
                        : [input3.tid],
                  ),
                callback8: Dynamic = (
                  input2?: Dynamic,
                  options?: Dynamic,
                ): Dynamic => {
                  for (let value314 of input2 as Dynamic) {
                    if (values.has(value314.tag)) {
                      callback8(value314.children, options);
                      continue;
                    }
                    state[value314.tid] = options;
                    let value315: Dynamic = callback7(value314.children);
                    value315.length > 0 && (state2[value314.tid] = value315);
                    callback8(value314.children, value314.tid);
                  }
                };
              callback8(value307.model.outline(), null);
              let value309: Dynamic = await (0,
              verifyPickerSelection)(value308, input, state, state2);
              if (!value309) return;
              let {
                parentMismatches: value310,
                unknownTids: value311,
                orderMismatches: value312,
                missingTids: value313,
              }: Dynamic = value309;
              value313.length > 0 &&
                console.warn(
                  "[dc-editor] template tids with no rendered instance:",
                  value313,
                );
              (value310.length > 0 ||
                value311.length > 0 ||
                value312.length > 0) &&
                console.error(
                  `[dc-editor] live DOM is out of sync with the ${input} template after an edit`,
                  {
                    parentMismatches: value310,
                    unknownTids: value311,
                    orderMismatches: value312,
                  },
                );
            })();
          }, 250)));
      }

/** 画板模型被替换或外部重新解析后运行：递增会话代次，把文字编辑目标和当前选中元素的 id 迁移到新模型，选中失效时清空，否则稍后在画板里重新高亮选中。 */
export function remapSelectionAfterModelSwap(deps: { readonly incrementSessionEpoch: Dynamic; readonly modelRef: Dynamic; readonly rootName: Dynamic; readonly textEditRef: Dynamic; readonly value107: Dynamic; readonly value3: Dynamic; readonly value38: Dynamic; readonly value46: Dynamic; readonly value48: Dynamic; readonly value49: Dynamic; readonly value5: Dynamic; readonly value50: Dynamic; readonly value51: Dynamic; readonly value67: Dynamic; readonly value91: Dynamic }, input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic): Dynamic {
      let value307: Dynamic = deps.modelRef.current.state(input)?.model;
      if (!value307 || value307 === options) return;
      deps.incrementSessionEpoch();
      deps.value48((input2?: Dynamic): Dynamic => input2 + 1);
      input === deps.rootName && (deps.value107.current = null);
      (deps.value49.current?.name === input || deps.value51.current?.name === input) &&
        deps.value50.current++;
      let value308: Dynamic = deps.value67();
      input === deps.rootName &&
        deps.textEditRef.current != null &&
        ((deps.textEditRef.current =
          (options &&
            (0, relocateModelElementIds)(options, value307, [
              deps.textEditRef.current,
            ])[0]) ??
          null),
        deps.value5(deps.textEditRef.current));
      let current: Dynamic = deps.value49.current,
        value309: Dynamic = (0, relocateSelectionRef)(
          deps.value49,
          input,
          options,
          value307,
        );
      if (value309 === undefined) return;
      deps.value3(value309);
      deps.value46.current = null;
      if (value309 === null) {
        value308 &&
          (0, setPickerSelection)(
            value308,
            null,
            null,
            InspectorEditorResolvedValue_2,
          );
        return;
      }
      let { tids: value310 }: Dynamic = value309;
      deps.value38.shown() ||
        deps.value91.current?.(input, value310, undefined, undefined, true);
      if (
        !value308 ||
        (input === deps.rootName && value310.join() !== current?.tids.join())
      )
        return;
      let current2: Dynamic = deps.value50.current;
      (0, deferSelectionClear)(
        deps.value46,
        input,
        (): Dynamic => {
          setTimeout((): Dynamic => {
            deps.value50.current === current2 &&
              (0, setPickerSelection)(
                value308,
                value310,
                input,
                InspectorEditorResolvedValue_2,
              );
          }, 60);
        },
        context ? 600 : null,
      );
    }
