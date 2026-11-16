import { CanvasWorkingStateConstant_8 } from "../working-state";
import { PlatformFileContentConstant_16 } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentLimit_6 } from "../../platform/file-content";
import { PlatformFileContentSlice } from "../../platform/file-content";
import { artboardTextSnapshotLimit } from "../content-snapshots";
import { blankDcDocument } from "../../platform/file-content";
import { designPageContents } from "../../platform/file-content";
import { distanceBetweenRects } from "../preview-mounting";
import { encodeArtboardSelectionPath } from "../../collaboration/selection-paths";
import { encodedElementPathPattern } from "../../collaboration/selection-paths";
import { getEmbeddedPresence } from "../../platform/file-content";
import { getKvClient } from "../../platform/file-content";
import { isCanvasPageMatch } from "../page-operations";
import { nextArtboardTitle } from "../../platform/file-content";
import { normalizeSelectedArtboardPaths } from "../../collaboration/selection-paths";
import { randomSessionToken } from "../working-state";
import { serializeArtboardErrorContext } from "../artboard-errors";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uniqueArtboardFile } from "../../platform/file-content";
import { nextArtboardPlacementPoint } from "../design-canvas";

/** 视口、页面、选择或错误变化时运行：汇总可见画板、选中元素的文字摘要与画板错误，通过上下文发布器上报给外壳。 */
export function reportDesignContextSnapshot(deps: { readonly flag: Dynamic; readonly selection: Dynamic; readonly value103: Dynamic; readonly value120: Dynamic; readonly value168: Dynamic; readonly value172: Dynamic; readonly value177: Dynamic; readonly value266: Dynamic; readonly value347: Dynamic; readonly value356: Dynamic; readonly value365: Dynamic; readonly value375: Dynamic; readonly value79: Dynamic; readonly value81: Dynamic; readonly value86: Dynamic }): Dynamic {
    let { w: value653, h: value654, top: value655 }: Dynamic = deps.value120(),
      state: Dynamic = {
        x: deps.value103.x,
        y: deps.value103.y + value655 / deps.value103.scale,
        w: value653 / deps.value103.scale,
        h: (value654 - value655) / deps.value103.scale,
      },
      value656: Dynamic = deps.value347
        ? [deps.value347.file]
        : deps.value86.artboards
            .filter(
              (input?: Dynamic): Dynamic =>
                (0, distanceBetweenRects)(input, state) === 0,
            )
            .map((input?: Dynamic): Dynamic => input.file),
      items: Dynamic = [],
      items2: Dynamic = [],
      value657: Dynamic = !deps.value347 || (deps.flag && deps.value356);
    if (deps.selection.primary != null && value657) {
      let value662: Dynamic = [...deps.selection.elements.keys()].filter(
        (input?: Dynamic): Dynamic => input !== deps.selection.primary,
      );
      value662.push(deps.selection.primary);
      for (let value663 of value662 as Dynamic) {
        let value664: Dynamic = deps.selection.elements.get(value663)?.tids ?? [],
          value665: Dynamic = (0, encodeArtboardSelectionPath)(
            value663,
          );
        if (value665 !== null)
          for (let value666 of (deps.value177.current
            .get(value663)
            ?.viewEntries(value664) ?? []) as Dynamic) {
            let value667: Dynamic = value665 + "#" + value666.path;
            encodedElementPathPattern.test(value667) &&
              (items.push(value667),
              items2.push({
                id: value667,
                kind: value666.kind,
                words: value666.words,
              }));
          }
      }
    }
    let value658: Dynamic = value657 ? [...deps.value168, ...deps.value172] : [],
      current4: Dynamic = deps.value365.current;
    if (current4 === null) return;
    let state2: Dynamic = {
        mode: deps.value347 ? "focused" : "canvas",
        page: deps.value79 === "" ? null : deps.value79,
        pageName: {
          text: deps.value79 === "" ? "" : deps.value81,
        },
        visibleArtboards: (0, normalizeSelectedArtboardPaths)(
          value656,
        ),
        selectedArtboards: (0, normalizeSelectedArtboardPaths)(
          value658,
        ),
        ...(0, getEmbeddedPresence)(),
        dirty: deps.value375,
        selected: items.slice(-20),
        selection: items2.slice(-5).map(
          (source?: Dynamic): Dynamic => ({
            id: source.id,
            kind: source.kind,
            label: source.words(artboardTextSnapshotLimit),
          }),
        ),
      },
      value659: Dynamic = deps.value266.flatMap((input?: Dynamic): Dynamic => {
        let value662: Dynamic = (0, encodeArtboardSelectionPath)(
          input.file,
        );
        return value662 === null
          ? []
          : [
              {
                name: value662,
                first: input.messages[0] ?? "",
              },
            ];
      }),
      value660: Dynamic = value659[0]?.first ?? "",
      value661: Dynamic = (0, serializeArtboardErrorContext)(
        value659.map((input?: Dynamic): Dynamic => input.name),
        value660,
        state2,
      );
    current4.report(
      value661.length === 0
        ? state2
        : {
            ...state2,
            erroredArtboards: value661,
            firstError: {
              text: value660,
            },
          },
    );
  }

/** 文档或页面变化时计算（useMemo）：为 HostedEditor 提供画布接口，包括画板列表、分组、撤销重做、显示/聚焦、放置、重命名、新增、复制与删除。 */
export function buildHostedEditorCanvasApi(deps: { readonly doc: Dynamic; readonly supportsLoadState: Dynamic; readonly value155: Dynamic; readonly value156: Dynamic; readonly value202: Dynamic; readonly value274: Dynamic; readonly value383: Dynamic; readonly value396: Dynamic; readonly value405: Dynamic; readonly value406: Dynamic; readonly value409: Dynamic; readonly value410: Dynamic; readonly value432: Dynamic; readonly value440: Dynamic; readonly value447: Dynamic; readonly value450: Dynamic; readonly value451: Dynamic; readonly value452: Dynamic; readonly value453: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }): Dynamic {
      let callback15: Dynamic = async (
          input?: Dynamic,
          options: Dynamic = 5e3,
        ): Promise<Dynamic> => {
          let value653: Dynamic = Date.now();
          for (; !input(); ) {
            if (Date.now() - value653 > options) return false;
            await new Promise(
              (input2?: Dynamic): Dynamic => setTimeout(input2, 40),
            );
          }
          return true;
        },
        callback16: Dynamic = (): Dynamic =>
          (0, designPageContents)(deps.value73.current, deps.value80.current)
            .artboards,
        callback17: Dynamic = (input?: Dynamic): Dynamic =>
          Math.min(
            PlatformFileContentLimit_6,
            Math.max(
              PlatformFileContentConstant_16,
              Math.round(input),
            ),
          );
      return {
        boards: (): Dynamic =>
          callback16().map(
            (input?: Dynamic): Dynamic => ({
              file: input.file,
              x: input.x,
              y: input.y,
              w: input.w,
              h: input.h,
              title: input.title ?? input.file.replace(/\.dc\.html$/, ""),
            }),
          ),
        pageIs: (input?: Dynamic): Dynamic =>
          (0, isCanvasPageMatch)(
            input,
            deps.value80.current,
            deps.value73.current.pages?.[0]?.id ?? "",
          ),
        token: (): Dynamic => (0, randomSessionToken)(),
        group: (input?: Dynamic, options?: Dynamic): Dynamic =>
          deps.value432.current?.group(
            input,
            options !== undefined
              ? {
                  bound: options,
                }
              : undefined,
          ) ?? null,
        hold: async (): Promise<Dynamic> => (
          await callback15(
            (): Dynamic =>
              deps.value155.current <= 0 &&
              !deps.value202.current &&
              !(deps.value432.current?.busy() ?? false),
          ),
          deps.value156(CanvasWorkingStateConstant_8)
        ),
        undo: (): Dynamic => deps.value447.current?.undo(),
        redo: (): Dynamic => deps.value447.current?.redo(),
        mark: (): Dynamic => {
          let current4: Dynamic = deps.value405.current,
            value653: Dynamic = current4[current4.length - 1];
          value653 !== undefined &&
            !deps.value453.has(value653) &&
            deps.value453.set(value653, deps.value453.next++);
          return (
            String(current4.length) +
            ":" +
            (value653 === undefined ? "" : String(deps.value453.get(value653))) +
            "/" +
            String(deps.value406.current.length) +
            "|" +
            [...deps.value440.current]
              .filter(([, input]: Dynamic): Dynamic => input !== 0)
              .map(
                ([input, input2]: Dynamic): Dynamic =>
                  input + "=" + String(input2),
              )
              .sort()
              .join(",") +
            "#" +
            String(deps.value409.current)
          );
        },
        depth: (): Dynamic =>
          deps.value410.current +
          deps.value405.current.length +
          [...deps.value440.current.values()].reduce(
            (input?: Dynamic, options?: Dynamic): Dynamic => input + options,
            0,
          ),
        revealRect: (input?: Dynamic): Dynamic => {
          deps.value383.current?.({
            x: input.x,
            y: input.y,
            w: input.w,
            h: input.h,
          });
        },
        reveal: (input?: Dynamic): Dynamic => {
          let value653: Dynamic = deps.value73.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
          value653 !== undefined &&
            deps.value383.current?.({
              x: value653.x,
              y: value653.y,
              w: value653.w,
              h: value653.h,
            });
        },
        focus: (input?: Dynamic): Dynamic => {
          deps.value274.current(input);
        },
        place: (input?: Dynamic, options?: Dynamic): Dynamic => {
          let items: Dynamic = [],
            value653: Dynamic = deps.value73.current.artboards.map(
              (input2?: Dynamic): Dynamic => {
                let value654: Dynamic = input.find(
                  (input3?: Dynamic): Dynamic => input3.file === input2.file,
                );
                if (value654 === undefined) return input2;
                let state: Dynamic = {};
                value654.x !== undefined &&
                  Math.round(value654.x) !== Math.round(input2.x) &&
                  (state.x = Math.round(value654.x));
                value654.y !== undefined &&
                  Math.round(value654.y) !== Math.round(input2.y) &&
                  (state.y = Math.round(value654.y));
                value654.w !== undefined &&
                  input2.frameless !== true &&
                  callback17(value654.w) !== Math.round(input2.w) &&
                  (state.w = callback17(value654.w));
                value654.h !== undefined &&
                  input2.frameless !== true &&
                  callback17(value654.h) !== Math.round(input2.h) &&
                  (state.h = callback17(value654.h));
                let value655: Dynamic = Object.keys(state);
                return value655.length === 0
                  ? input2
                  : (items.push({
                      file: input2.file,
                      from: Object.fromEntries(
                        value655.map(
                          (input3?: Dynamic): Dynamic => [
                            input3,
                            input2[input3],
                          ],
                        ),
                      ),
                      to: state,
                    }),
                    {
                      ...input2,
                      ...state,
                    });
              },
            );
          return items.length === 0
            ? []
            : (deps.value396.current(
                {
                  kind: "transform",
                  get label() { return uiMessage("canvas.designCanvas.resize"); },
                  boards: items,
                  anns: [],
                },
                new Set(),
                undefined,
                options,
              ),
              deps.value98({
                artboards: value653,
              }),
              items.map((input2?: Dynamic): Dynamic => input2.file));
        },
        rename: (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Dynamic => {
          let value653: Dynamic = (0, PlatformFileContentSlice)(
              options,
            ),
            value654: Dynamic = deps.value73.current.artboards.find(
              (input2?: Dynamic): Dynamic => input2.file === input,
            );
          if (value653 === undefined || value654 === undefined) return false;
          let value655: Dynamic =
            value653 !== input.replace(/\.dc\.html$/, "")
              ? value653
              : undefined;
          return (value654.title ?? undefined) === value655
            ? false
            : (deps.value396.current(
                {
                  kind: "rename",
                  file: input,
                  from: value654.title,
                  to: value655,
                },
                new Set(),
                undefined,
                context,
              ),
              deps.value98({
                artboards: deps.value73.current.artboards.map(
                  (input2?: Dynamic): Dynamic => {
                    if (input2.file !== input) return input2;
                    let { title: value656, ...value657 }: Dynamic = input2;
                    return value655 !== undefined
                      ? {
                          ...value657,
                          title: value655,
                        }
                      : value657;
                  },
                ),
              }),
              true);
        },
        add: async (input?: Dynamic, options?: Dynamic): Promise<Dynamic> => {
          let value653: Dynamic =
              /^\/\*ask:page\*\/body\{(?:(?:background|color):(?:#[0-9a-fA-F]{3,8}|[a-z]{3,24}|(?:rgb|rgba|hsl|hsla)\([0-9.,%\s-]{1,60}(?:deg)?[0-9.,%\s-]{0,60}\))|font-family:(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})(?:,(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})){0,2})(?:;(?:(?:background|color):(?:#[0-9a-fA-F]{3,8}|[a-z]{3,24}|(?:rgb|rgba|hsl|hsla)\([0-9.,%\s-]{1,60}(?:deg)?[0-9.,%\s-]{0,60}\))|font-family:(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})(?:,(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})){0,2})){0,2}\}\/\*ask:page-end\*\/$/i,
            state: Dynamic = {
              ...deps.doc.content().files,
            },
            items: Dynamic = [...callback16()],
            items2: Dynamic = [];
          for (let value654 of input as Dynamic) {
            let value655: Dynamic = (0, uniqueArtboardFile)(
                state,
                "Artboard",
                deps.supportsLoadState,
              ),
              value656: Dynamic = value653.test(value654.pageRule ?? "")
                ? (0, blankDcDocument)().replace(
                    /[ \t]*<\/style>/,
                    (input2?: Dynamic): Dynamic =>
                      value654.pageRule +
                      `
` +
                      input2,
                  )
                : (0, blankDcDocument)(),
              value657: Dynamic =
                value654.body.trim() === ""
                  ? value656
                  : value656.replace(
                      /[ \t]*<section class="stage"[^>]*><\/section>/,
                      (): Dynamic => value654.body,
                    );
            state[value655] = value657;
            let value658: Dynamic =
                typeof value654.x == "number" &&
                typeof value654.y == "number" &&
                Number.isFinite(value654.x) &&
                Number.isFinite(value654.y)
                  ? {
                      x: value654.x,
                      y: value654.y,
                    }
                  : nextArtboardPlacementPoint(items),
              state2: Dynamic = {
                file: value655,
                x: Math.round(value658.x),
                y: Math.round(value658.y),
                w: callback17(value654.w),
                h: callback17(value654.h),
                title:
                  (0, PlatformFileContentSlice)(value654.title) ??
                  (0, nextArtboardTitle)(items),
                ...deps.value452.current(),
              };
            items.push(state2);
            items2.push({
              file: value655,
              src: value657,
              spec: state2,
            });
          }
          if (
            items2.length === 0 ||
            Object.keys(deps.doc.content().files).length + items2.length >
              PlatformFileContentFilesValue
          )
            return [];
          let values: Dynamic = new Set();
          try {
            for (let value654 of items2 as Dynamic) {
              await (0, getKvClient)().set(
                (0, PlatformFileContentHandler_4)(value654.file),
                value654.src,
              );
              values.add(value654.file);
            }
          } catch {
            for (let value654 of values as Dynamic)
              await (0, getKvClient)()
                .delete((0, PlatformFileContentHandler_4)(value654))
                .catch((): Dynamic => false);
            return [];
          }
          deps.value98({
            artboards: [
              ...deps.value73.current.artboards.filter(
                (input2?: Dynamic): Dynamic => !values.has(input2.file),
              ),
              ...items2.map((input2?: Dynamic): Dynamic => input2.spec),
            ],
          });
          deps.value396.current(
            {
              kind: "add",
              entries: items2,
            },
            values,
            undefined,
            options,
          );
          return items2.map((input2?: Dynamic): Dynamic => input2.file);
        },
        duplicate: async (
          input?: Dynamic,
          options?: Dynamic,
          context?: Dynamic,
        ): Promise<Dynamic> => {
          let values: Dynamic = new Set(
              deps.value73.current.artboards.map(
                (input2?: Dynamic): Dynamic => input2.file,
              ),
            ),
            items: Dynamic = [...callback16()],
            value653: Dynamic = input.flatMap(
              (
                { file: file, title: title }: Dynamic,
                options2?: Dynamic,
              ): Dynamic => {
                let value654: Dynamic = items.find(
                  (input2?: Dynamic): Dynamic => input2.file === file,
                );
                if (value654 === undefined) return [];
                let value655: Dynamic = context?.[options2],
                  value656: Dynamic =
                    value655 !== undefined &&
                    Number.isFinite(value655.x) &&
                    Number.isFinite(value655.y)
                      ? {
                          x: Math.round(value655.x),
                          y: Math.round(value655.y),
                        }
                      : nextArtboardPlacementPoint(items);
                items.push({
                  ...value654,
                  file: file + "#copy",
                  x: value656.x,
                  y: value656.y,
                });
                return [
                  {
                    file: file,
                    x: value656.x,
                    y: value656.y,
                    title: title,
                  },
                ];
              },
            );
          return value653.length === 0
            ? []
            : (deps.value451.current(value653, [], options),
              await callback15(
                (): Dynamic =>
                  deps.value73.current.artboards.length >=
                  values.size + value653.length,
              ),
              deps.value73.current.artboards
                .map((input2?: Dynamic): Dynamic => input2.file)
                .filter((input2?: Dynamic): Dynamic => !values.has(input2)));
        },
        remove: async (
          input?: Dynamic,
          options?: Dynamic,
        ): Promise<Dynamic> => {
          let values: Dynamic = new Set(
            input.filter(
              (input2?: Dynamic): Dynamic =>
                deps.value73.current.artboards.some(
                  (input3?: Dynamic): Dynamic => input3.file === input2,
                ),
            ),
          );
          return values.size === 0 ||
            !deps.value450.current(values, undefined, options)
            ? 0
            : (await callback15(
                (): Dynamic =>
                  !deps.value73.current.artboards.some(
                    (input2?: Dynamic): Dynamic => values.has(input2.file),
                  ),
              ),
              [...values].filter(
                (input2?: Dynamic): Dynamic =>
                  !deps.value73.current.artboards.some(
                    (input3?: Dynamic): Dynamic => input3.file === input2,
                  ),
              ).length);
        },
      };
    }
