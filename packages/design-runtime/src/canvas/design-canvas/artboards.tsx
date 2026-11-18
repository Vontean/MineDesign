import { ModelModelStateLimit } from "../../editor/model/model-state";
import { PlatformFileContentConstant_16 } from "../../platform/file-content";
import { PlatformFileContentConstant_5 } from "../../platform/file-content";
import { PlatformFileContentConstant_6 } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentHas } from "../../platform/file-content";
import { PlatformFileContentLimit_5 } from "../../platform/file-content";
import { PlatformFileContentLimit_6 } from "../../platform/file-content";
import { PlatformFileContentSlice } from "../../platform/file-content";
import { annotationGeometry } from "../../platform/file-content";
import { annotationTextStyle } from "../../platform/file-content";
import { annotationTransformSnapshot } from "../../geometry/selection-transform";
import { annotationVisibleBounds } from "../../platform/file-content";
import { announce } from "../../editor/accessibility/announcer";
import { artboardAppearanceProperties } from "../../platform/file-content";
import { artboardResizeAnnouncement } from "../../editor/accessibility/announcements";
import { artboardTransformSnapshot } from "../../geometry/selection-transform";
import { artboardsDeletedAnnouncement } from "../../editor/accessibility/announcements";
import { blankDcDocument } from "../../platform/file-content";
import { boardSelectionKey } from "../working-state";
import { canvasMetadataFile } from "../../platform/file-content";
import { createPreviewHandle } from "../../preview/evaluation";
import { designAnalyticsEvents } from "../../platform/health-and-analytics";
import { duplicateArtboardTitle } from "../../platform/file-content";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { exportHeightTolerance } from "../../export/paper-and-scale";
import { fitContentResultMessage } from "../../editor/accessibility/announcements";
import { frameAnalyticsReporter } from "../../platform/health-and-analytics";
import { getKvClient } from "../../platform/file-content";
import { insertBlankArtboardMarkup } from "../paste-placement";
import { isFillPagedExport } from "../../export/paper-and-scale";
import { isLoadingArtboardHtml } from "../../platform/design-document-adapter";
import { isShapeAnnotation } from "../../platform/file-content";
import { measureExpandedContentHeight } from "../../export/capture-viewport";
import { measureFlowExportHeight } from "../../export/capture-viewport";
import { needsPagedExport } from "../../export/paper-and-scale";
import { neighboringCanvasPageId } from "../page-operations";
import { nextArtboardTitle } from "../../platform/file-content";
import { nudgeCanvasObjects } from "../working-state";
import { objectsDeletedAnnouncement } from "../../editor/accessibility/announcements";
import { pageDeletedAnnouncement } from "../../editor/accessibility/announcements";
import { remainingCanvasPageObjects } from "../page-operations";
import { repairCanvasLaunchAfterDeletion } from "../manifest-history";
import { replaceDesignArtboards } from "../../platform/file-content";
import { replaceDesignPageContents } from "../../platform/file-content";
import { resolveMeasuredExportHeight } from "../../export/paper-and-scale";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { serializeCanvasMetadata } from "../../platform/file-content";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uniqueArtboardFile } from "../../platform/file-content";
import { emptyCanvasSelectionFiles, exportAlreadyRunningMessage, nextArtboardPlacementPoint, staleDeleteFailureMessage } from "../design-canvas";

/** 绘制画板或点击新增画板时运行（onDrawArtboard/onAdd）：生成空白 dc 文件与唯一标题，放到指定或下一个位置并选中，失败时提示。 */
export function addBlankArtboard(deps: { readonly callback3: Dynamic; readonly doc: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value189: Dynamic; readonly value273: Dynamic; readonly value310: Dynamic; readonly value338: Dynamic; readonly value341: Dynamic; readonly value396: Dynamic; readonly value73: Dynamic; readonly value90: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic {
        let files: Dynamic = deps.doc.content().files,
          value653: Dynamic = uniqueArtboardFile(
            files,
            "Artboard",
            deps.supportsLoadState,
          );
        input && (deps.value310.current = true);
        (async (): Promise<Dynamic> => {
          try {
            let value654: Dynamic = options
              ? insertBlankArtboardMarkup(
                  blankDcDocument(),
                  options,
                )
              : blankDcDocument();
            await getKvClient().set(
              PlatformFileContentHandler_4(value653),
              value654,
            );
            let value655: Dynamic = deps.value90.current.filter(
                (input2?: Dynamic): Dynamic => input2.file !== value653,
              ),
              value656: Dynamic =
                input ?? nextArtboardPlacementPoint(value655),
              state: Dynamic = {
                file: value653,
                x: Math.round(value656.x),
                y: Math.round(value656.y),
                w:
                  input && input.w > 0
                    ? input.w
                    : PlatformFileContentConstant_5,
                h:
                  input && input.h > 0
                    ? input.h
                    : PlatformFileContentConstant_6,
                title:
                  context?.title ?? nextArtboardTitle(value655),
                ...deps.callback3(),
              };
            deps.value396.current(
              {
                kind: "add",
                entries: [
                  {
                    file: value653,
                    src: value654,
                    spec: state,
                  },
                ],
              },
              new Set([value653]),
              context?.siblings,
            );
            deps.value98({
              artboards: [
                ...deps.value73.current.artboards.filter(
                  (input2?: Dynamic): Dynamic => input2.file !== value653,
                ),
                state,
              ],
            });
            context?.auto !== true &&
              frameAnalyticsReporter(
                designAnalyticsEvents.artboardInserted,
              );
            deps.value273(value653);
            deps.value338("select");
            deps.value341((input2?: Dynamic): Dynamic => input2 + 1);
            context?.doneSay && deps.value189(context.doneSay);
          } catch (value654: Dynamic) {
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTAddAnArtboard") + String(value654),
              "error",
            );
          }
        })();
        return value653;
      }

/** 复制快捷键选中画板或画布说明时运行：计算偏移后的位置，交给 onDuplicateObjects 生成副本。 */
export function duplicateSelectedBoards(deps: { readonly value344: Dynamic; readonly value383: Dynamic; readonly value87: Dynamic; readonly value90: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let value653: Dynamic = deps.value87.current.artboards.filter(
            (input2?: Dynamic): Dynamic => input.files.has(input2.file),
          ),
          value654: Dynamic = (deps.value87.current.annotations ?? []).filter(
            (input2?: Dynamic): Dynamic => input.notes.has(input2.id),
          ),
          items: Dynamic = [
            ...value653,
            ...value654.map(annotationVisibleBounds),
          ];
        if (items.length === 0) return false;
        let [items2, items3]: Dynamic = [
            Math.min(...items.map((input2?: Dynamic): Dynamic => input2.x)),
            Math.min(...items.map((input2?: Dynamic): Dynamic => input2.y)),
          ],
          value655: Dynamic =
            value653.length > 0
              ? nextArtboardPlacementPoint(deps.value90.current)
              : {
                  x: items2 + 24,
                  y: items3 + 24,
                },
          [items4, items5]: Dynamic = [
            value655.x - items2,
            value655.y - items3,
          ];
        deps.value383.current({
          x: value655.x,
          y: value655.y,
          w:
            Math.max(
              ...items.map(
                (input2?: Dynamic): Dynamic => input2.x + input2.w,
              ),
            ) - items2,
          h:
            Math.max(
              ...items.map(
                (input2?: Dynamic): Dynamic => input2.y + input2.h,
              ),
            ) - items3,
        });
        return deps.value344.current(
          value653.map(
            (input2?: Dynamic): Dynamic => ({
              file: input2.file,
              x: input2.x + items4,
              y: input2.y + items5,
            }),
          ),
          value654.map(
            (input2?: Dynamic): Dynamic => ({
              id: input2.id,
              x: input2.x + items4,
              y: input2.y + items5,
            }),
          ),
          options,
        );
      }

/** 复制画板时运行：为每个画板写入新的 dc 文件与唯一标题，放到指定位置并选中，记录分析事件，失败时提示。 */
export function duplicateArtboardFiles(deps: { readonly callback9: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value140: Dynamic; readonly value142: Dynamic; readonly value177: Dynamic; readonly value413: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        items: Dynamic = [],
        context?: Dynamic,
        value653: Dynamic = false): Dynamic {
        let value654: Dynamic =
          value653 && context !== undefined ? context : undefined;
        (async (): Promise<Dynamic> => {
          try {
            let value655: Dynamic = input.flatMap(
              (input2?: Dynamic): Dynamic => {
                let value658: Dynamic = deps.value73.current.artboards.find(
                  (input3?: Dynamic): Dynamic => input3.file === input2.file,
                );
                return value658
                  ? [
                      {
                        a: value658,
                        x: input2.x,
                        y: input2.y,
                        title: input2.title,
                      },
                    ]
                  : [];
              },
            );
            if (value655.length === 0) return;
            if (
              Object.keys(deps.doc.content().files).length + value655.length >
              PlatformFileContentFilesValue
            ) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTDuplicateTheCanvas") +
                  String(PlatformFileContentFilesValue) +
                  "-file limit; delete something first",
                "error",
              );
              return;
            }
            await Promise.all(
              value655.map(
                (input2?: Dynamic): Dynamic =>
                  deps.value177.current.get(input2.a.file)?.flushPending(),
              ),
            );
            let state: Dynamic = {
                ...deps.doc.content().files,
              },
              items2: Dynamic = [];
            for (let {
              a: value658,
              x: value659,
              y: value660,
              title: value661,
            } of value655 as Dynamic) {
              let value662: Dynamic =
                (await getKvClient().get(
                  PlatformFileContentHandler_4(value658.file),
                )) ?? state[value658.file];
              if (
                typeof value662 != "string" ||
                isLoadingArtboardHtml(value662)
              ) {
                let value665: Dynamic =
                  value655.length === 1 ? uiMessage("canvas.designCanvas.theArtboard") : uiMessage("canvas.designCanvas.anArtboard");
                deps.showToast(
                  typeof value662 == "string"
                    ? uiMessage("canvas.designCanvas.couldnTDuplicate") +
                        value665 +
                        " is still loading"
                    : uiMessage("canvas.designCanvas.couldnTDuplicate") +
                        value665 +
                        " has no source",
                  "error",
                );
                return;
              }
              let value663: Dynamic = value658.file.replace(
                  /\.dc\.html$/,
                  "",
                ),
                value664: Dynamic = uniqueArtboardFile(
                  state,
                  value663,
                  deps.supportsLoadState,
                );
              state[value664] = value662;
              let state2: Dynamic = {
                file: value664,
                x: Math.round(value659),
                y: Math.round(value660),
                w: value658.w,
                h: value658.h,
                title:
                  PlatformFileContentSlice(value661) ??
                  duplicateArtboardTitle(
                    value658.title ?? value663,
                    [
                      ...deps.value87.current.artboards,
                      ...items2.map(
                        (input2?: Dynamic): Dynamic => input2.spec,
                      ),
                    ],
                  ),
                ...artboardAppearanceProperties(value658),
                ...(value658.page
                  ? {
                      page: value658.page,
                    }
                  : {}),
              };
              items2.push({
                file: value664,
                src: value662,
                spec: state2,
              });
            }
            let values: Dynamic = new Set();
            try {
              for (let value658 of items2 as Dynamic) {
                await getKvClient().set(
                  PlatformFileContentHandler_4(value658.file),
                  value658.src,
                );
                values.add(value658.file);
              }
            } catch (value658: Dynamic) {
              for (let value659 of values as Dynamic)
                await getKvClient()
                  .delete(PlatformFileContentHandler_4(value659))
                  .catch((): Dynamic => false);
              throw value658;
            }
            let value656: Dynamic =
                (deps.value73.current.annotations ?? []).length + items.length <=
                PlatformFileContentLimit_5,
              value657: Dynamic = value656 ? deps.callback9(items) : [];
            !value656 &&
              items.length > 0 &&
              deps.showToast(
                uiMessage("canvas.designCanvas.theArtboardsWereCopiedThe") +
                  String(PlatformFileContentLimit_5) +
                  ").",
                "error",
              );
            deps.value98({
              artboards: [
                ...deps.value73.current.artboards.filter(
                  (input2?: Dynamic): Dynamic => !values.has(input2.file),
                ),
                ...items2.map((input2?: Dynamic): Dynamic => input2.spec),
              ],
              ...(value657.length > 0
                ? {
                    annotations: [
                      ...(deps.value73.current.annotations ?? []),
                      ...value657,
                    ],
                  }
                : {}),
            });
            deps.value413(
              {
                kind: "add",
                entries: items2,
                ...(value657.length > 0
                  ? {
                      anns: [...value657],
                    }
                  : {}),
              },
              values,
              undefined,
              context,
            );
            value654 !== undefined
              ? deps.value142.current.set(value654, {
                  files: values,
                  notes: new Set(
                    value657.map((input2?: Dynamic): Dynamic => input2.id),
                  ),
                })
              : deps.setSelection(
                  selectionFromBoards({
                    files: values,
                    notes: new Set(
                      value657.map((input2?: Dynamic): Dynamic => input2.id),
                    ),
                  }),
                );
            values.size > 0 &&
              frameAnalyticsReporter(
                designAnalyticsEvents.artboardInserted,
              );
          } catch (value655: Dynamic) {
            deps.showToast(uiMessage("canvas.designCanvas.couldnTDuplicate2") + String(value655), "error");
          } finally {
            value654 !== undefined &&
              !deps.value142.current.has(value654) &&
              deps.value142.current.set(value654, {
                files: new Set(),
                notes: new Set(),
              });
            context !== undefined && deps.value140.current.get(context)?.();
          }
        })();
      }

/** onDuplicateObjects 的实现（Alt 拖动或复制快捷键）：在给定位置复制画板与画布说明，并更新选择。 */
export function duplicateBoardsAndNotes(deps: { readonly callback9: Dynamic; readonly setSelection: Dynamic; readonly value140: Dynamic; readonly value142: Dynamic; readonly value188: Dynamic; readonly value318: Dynamic; readonly value342: Dynamic; readonly value396: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, items?: Dynamic,
        items2?: Dynamic,
        context?: Dynamic,
        value653: Dynamic = false): Dynamic {
        if (items.length === 0 && items2.length === 1) {
          let value659: Dynamic = items2[0];
          return deps.value318(
            value659.id,
            value659.x,
            value659.y,
            context,
            value653,
          );
        }
        let value654: Dynamic =
            value653 && context !== undefined ? context : undefined,
          value655: Dynamic = deps.value73.current.annotations ?? [],
          value656: Dynamic = items2.flatMap((input?: Dynamic): Dynamic => {
            let value659: Dynamic = value655.find(
              (input2?: Dynamic): Dynamic => input2.id === input.id,
            );
            return value659
              ? [
                  {
                    src: value659,
                    x: input.x,
                    y: input.y,
                  },
                ]
              : [];
          }),
          callback15: Dynamic = (): Dynamic => (
            value654 !== undefined &&
              deps.value142.current.set(value654, {
                files: new Set(),
                notes: new Set(),
              }),
            context !== undefined && deps.value140.current.get(context)?.(),
            false
          );
        if (
          value656.length > 0 &&
          value655.length + value656.length >
            PlatformFileContentLimit_5
        ) {
          deps.value188(
            uiMessage("canvas.designCanvas.couldnTCopyThisCanvas") +
              String(PlatformFileContentLimit_5) +
              ").",
          );
          return callback15();
        }
        let value657: Dynamic = items.filter(
          (input?: Dynamic): Dynamic =>
            deps.value73.current.artboards.some(
              (input2?: Dynamic): Dynamic => input2.file === input.file,
            ),
        );
        if (value657.length > 0) {
          deps.value342(value657, value656, context, value653);
          return true;
        }
        let value658: Dynamic = deps.callback9(value656);
        return value658.length === 0
          ? callback15()
          : (deps.value396.current(
              {
                kind: "add",
                entries: [],
                anns: value658,
              },
              new Set(),
              undefined,
              context,
            ),
            deps.value98({
              ...deps.value73.current,
              annotations: [...value655, ...value658],
            }),
            value654 !== undefined
              ? deps.value142.current.set(value654, {
                  files: new Set(),
                  notes: new Set(
                    value658.map((input?: Dynamic): Dynamic => input.id),
                  ),
                })
              : (deps.value62(),
                deps.setSelection(
                  selectionFromBoards({
                    files: emptyCanvasSelectionFiles,
                    notes: new Set(
                      value658.map((input?: Dynamic): Dynamic => input.id),
                    ),
                  }),
                )),
            true);
      }

/** 在画板属性中输入宽高时运行：按上下限钳制尺寸，写回清单并播报调整结果。 */
export function resizeArtboardFromInput(deps: { readonly value396: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic, options?: Dynamic, context?: Dynamic): Dynamic {
        let value653: Dynamic = deps.value73.current.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        if (
          !value653 ||
          !Number.isFinite(options.w ?? 0) ||
          !Number.isFinite(options.h ?? 0)
        )
          return;
        let callback15: Dynamic = (
            input2?: Dynamic,
            options2?: Dynamic,
          ): Dynamic =>
            input2 === undefined
              ? options2
              : Math.min(
                  PlatformFileContentLimit_6,
                  Math.max(
                    PlatformFileContentConstant_16,
                    Math.round(input2),
                  ),
                ),
          value654: Dynamic = callback15(options.w, value653.w),
          value655: Dynamic = callback15(options.h, value653.h),
          value656: Dynamic = deps.value73.current.artboards.map(
            (input2?: Dynamic): Dynamic =>
              input2.file === input
                ? {
                    ...input2,
                    w: value654,
                    h: value655,
                  }
                : input2,
          );
        if (!context) {
          deps.value68(
            replaceDesignArtboards(deps.value73.current, value656),
          );
          return;
        }
        let value657: Dynamic =
          (deps.value70.current ?? deps.value73.current).artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          ) ?? value653;
        if (
          Math.round(value657.w) === value654 &&
          Math.round(value657.h) === value655
        ) {
          (value653.w !== value654 || value653.h !== value655) &&
            deps.value68(
              replaceDesignArtboards(deps.value73.current, value656),
            );
          return;
        }
        deps.value396.current(
          {
            kind: "resize",
            file: input,
            from: {
              x: value653.x,
              y: value653.y,
              w: value657.w,
              h: value657.h,
            },
            to: {
              x: value653.x,
              y: value653.y,
              w: value654,
              h: value655,
            },
          },
          new Set(),
        );
        deps.value98({
          artboards: value656,
        });
        let value658: Dynamic = artboardResizeAnnouncement(
          value657,
          {
            w: value654,
            h: value655,
          },
        );
        value658 != null && announce(value658);
      }

/** 方向键微移选中的画板或画布说明时运行：更新位置，并把连续微移合并为同一条移动历史。 */
export function nudgeBoardsWithHistory(deps: { readonly value405: Dynamic; readonly value412: Dynamic; readonly value413: Dynamic; readonly value415: Dynamic; readonly value440: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let value654: Dynamic = nudgeCanvasObjects(
          deps.value73.current,
          input,
          options,
          context,
        );
        if (!value654) return false;
        let value655: Dynamic = boardSelectionKey(input),
          value656: Dynamic = deps.value405.current[deps.value405.current.length - 1],
          callback15: Dynamic = (): Dynamic =>
            value656 != null &&
            value656.depths.every(([input2, input3]: Dynamic): Dynamic => {
              let value657: Dynamic = deps.value440.current.get(input2) ?? 0;
              return value653.has(input2)
                ? value657 === value653.get(input2)
                : value657 === (input3 ?? 0);
            });
        if (
          value656?.op.kind === "move" &&
          value656.nudgeKey === value655 &&
          !value656.sealed &&
          Date.now() - value656.at < ModelModelStateLimit &&
          (deps.value415("undo") === value656 || callback15()) &&
          value654.moves.every(
            (input2?: Dynamic): Dynamic =>
              value656.op.kind === "move" &&
              value656.op.moves.some(
                (input3?: Dynamic): Dynamic => input3.file === input2.file,
              ),
          ) &&
          value654.anns.every(
            (input2?: Dynamic): Dynamic =>
              value656.op.kind === "move" &&
              (value656.op.anns ?? []).some(
                (input3?: Dynamic): Dynamic => input3.id === input2.id,
              ),
          )
        ) {
          let entries: Dynamic = new Map(
              value654.moves.map(
                (input2?: Dynamic): Dynamic => [input2.file, input2.to],
              ),
            ),
            entries2: Dynamic = new Map(
              value654.anns.map(
                (input2?: Dynamic): Dynamic => [input2.id, input2.to],
              ),
            );
          value656.op = {
            ...value656.op,
            moves: value656.op.moves.map(
              (input2?: Dynamic): Dynamic => ({
                ...input2,
                to: entries.get(input2.file) ?? input2.to,
              }),
            ),
            ...(value656.op.anns
              ? {
                  anns: value656.op.anns.map(
                    (input2?: Dynamic): Dynamic => ({
                      ...input2,
                      to: entries2.get(input2.id) ?? input2.to,
                    }),
                  ),
                }
              : {}),
          };
          value656.at = Date.now();
          deps.value412();
        } else {
          deps.value413(
            {
              kind: "move",
              moves: value654.moves,
              ...(value654.anns.length > 0
                ? {
                    anns: value654.anns,
                  }
                : {}),
            },
            new Set(),
          );
          let value657: Dynamic =
            deps.value405.current[deps.value405.current.length - 1];
          value657 && (value657.nudgeKey = value655);
        }
        deps.value98(value654.manifest);
        return true;
      }

/** 删除选中的画板、画布说明或整个页面时运行：移除文件与清单条目，修复启动画板、切换到相邻页面，并播报与记录分析。 */
export function deleteBoardsAndNotes(deps: { readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly value140: Dynamic; readonly value177: Dynamic; readonly value298: Dynamic; readonly value413: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options: Dynamic = emptyCanvasSelectionFiles,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let artboards: Dynamic = deps.value73.current.artboards,
          value654: Dynamic = artboards.filter(
            (input2?: Dynamic): Dynamic => input.has(input2.file),
          );
        return value654.length === 0 && value653 === undefined
          ? false
          : ((async (): Promise<Dynamic> => {
              try {
                let items: Dynamic = [],
                  callback15: Dynamic = async (
                    input2?: Dynamic,
                    options2?: Dynamic,
                  ): Promise<Dynamic> => {
                    await deps.value177.current.get(input2.file)?.flushPending();
                    let value663: Dynamic =
                      (await getKvClient().get(
                        PlatformFileContentHandler_4(
                          input2.file,
                        ),
                      )) ??
                      deps.doc.content().files[input2.file] ??
                      "";
                    items.push({
                      file: input2.file,
                      src: value663,
                      spec: input2,
                      index: options2.findIndex(
                        (input3?: Dynamic): Dynamic =>
                          input3.file === input2.file,
                      ),
                    });
                  };
                for (let value663 of value654 as Dynamic)
                  await callback15(value663, artboards);
                let value655: Dynamic =
                  value653 !== undefined
                    ? remainingCanvasPageObjects(
                        deps.value73.current,
                        value653.spec.id,
                        new Set(
                          items.map(
                            (input2?: Dynamic): Dynamic => input2.file,
                          ),
                        ),
                        options,
                      )
                    : undefined;
                for (let value663 of (value655?.artboards ?? []) as Dynamic)
                  await callback15(value663, deps.value73.current.artboards);
                let values: Dynamic = new Set(
                    items.map((input2?: Dynamic): Dynamic => input2.file),
                  ),
                  value656: Dynamic =
                    value655 !== undefined && value655.notes.length > 0
                      ? new Set([...options, ...value655.notes])
                      : options,
                  current4: Dynamic = deps.value73.current;
                if (
                  value653 !== undefined &&
                  !(current4.pages ?? []).some(
                    (input2?: Dynamic): Dynamic =>
                      input2.id !== value653.spec.id,
                  )
                ) {
                  deps.showToast(staleDeleteFailureMessage(value653.spec.name));
                  return;
                }
                let value657: Dynamic = (current4.annotations ?? []).flatMap(
                    (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                      value656.has(input2.id)
                        ? [
                            {
                              spec: input2,
                              index: options2,
                            },
                          ]
                        : [],
                  ),
                  value658: Dynamic =
                    current4.cover !== undefined && values.has(current4.cover)
                      ? current4.cover
                      : undefined,
                  value659: Dynamic = repairCanvasLaunchAfterDeletion(
                    current4,
                    values,
                    value653?.spec.id,
                  );
                deps.value413(
                  {
                    kind: "delete",
                    entries: items,
                    ...(value657.length > 0
                      ? {
                          anns: value657,
                        }
                      : {}),
                    ...(value658 !== undefined
                      ? {
                          cover: value658,
                        }
                      : {}),
                    ...(value659 !== undefined
                      ? {
                          launch: value659,
                        }
                      : {}),
                    ...(value653 !== undefined
                      ? {
                          page: value653,
                        }
                      : {}),
                  },
                  new Set(
                    items.map((input2?: Dynamic): Dynamic => input2.file),
                  ),
                  undefined,
                  context,
                );
                for (let value663 of items as Dynamic)
                  await getKvClient().delete(
                    PlatformFileContentHandler_4(value663.file),
                  );
                let value660: Dynamic = deps.value73.current.pages ?? [],
                  value661: Dynamic =
                    value653 !== undefined
                      ? value660.filter(
                          (input2?: Dynamic): Dynamic =>
                            input2.id !== value653.spec.id,
                        )
                      : [];
                deps.value98({
                  artboards: deps.value73.current.artboards.filter(
                    (input2?: Dynamic): Dynamic => !values.has(input2.file),
                  ),
                  ...(value657.length > 0
                    ? {
                        annotations: (
                          deps.value73.current.annotations ?? []
                        ).filter(
                          (input2?: Dynamic): Dynamic =>
                            !value656.has(input2.id),
                        ),
                      }
                    : {}),
                  ...(value661.length > 0
                    ? {
                        pages: value661,
                      }
                    : {}),
                });
                value653 !== undefined &&
                  value661.length === 0 &&
                  (value653.relisted = true);
                let value662: Dynamic =
                  value653 !== undefined &&
                  deps.value80.current === value653.spec.id;
                value653 !== undefined &&
                  value662 &&
                  value661.length > 0 &&
                  deps.value298(
                    neighboringCanvasPageId(
                      value660,
                      value653.spec.id,
                    ) ?? value661[0].id,
                  );
                (value653 === undefined || value662) &&
                  deps.setSelection(emptyCanvasSelection);
                announce(
                  value653 !== undefined
                    ? pageDeletedAnnouncement(
                        value653.spec.name,
                        items.length,
                        value657.length,
                      )
                    : value657.length > 0
                      ? objectsDeletedAnnouncement(
                          value654.length + value657.length,
                        )
                      : artboardsDeletedAnnouncement(
                          value654.map(
                            (input2?: Dynamic): Dynamic =>
                              input2.title ??
                              input2.file.replace(/\.dc\.html$/, ""),
                          ),
                        ),
                );
                items.length > 0 &&
                  frameAnalyticsReporter(
                    designAnalyticsEvents.artboardDeleted,
                  );
              } catch (value655: Dynamic) {
                deps.showToast(
                  uiMessage("canvas.designCanvas.couldnTDeleteThe") +
                    (value653 !== undefined ? "page" : "artboard") +
                    ": " +
                    String(value655),
                  "error",
                );
              } finally {
                context !== undefined && deps.value140.current.get(context)?.();
              }
            })(),
            true);
      }

/** 执行适应内容高度时运行：测量画板展开后的内容高度并调整画板尺寸，播报变高、变矮或已匹配等结果。 */
export async function fitArtboardHeightToContent(deps: { readonly callback2: Dynamic; readonly editableRef: Dynamic; readonly hideToast: Dynamic; readonly showToast: Dynamic; readonly value177: Dynamic; readonly value399: Dynamic; readonly value479: Dynamic; readonly value483: Dynamic; readonly value494: Dynamic; readonly value495: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic }, items?: Dynamic, options?: Dynamic): Promise<Dynamic> {
        if (deps.value494()) {
          deps.showToast(exportAlreadyRunningMessage);
          return;
        }
        options?.();
        if (!deps.editableRef.current) {
          deps.showToast(
            uiMessage("canvas.designCanvas.thisCanvasIsReadOnly"),
          );
          return;
        }
        deps.value479(true);
        let value653: Dynamic =
            items.length === 1
              ? deps.value73.current.artboards.find(
                  (input?: Dynamic): Dynamic => input.file === items[0],
                )
              : undefined,
          value654: Dynamic =
            items.length > 1
              ? deps.showToast(
                  uiMessage("canvas.designCanvas.measuring") + String(items.length) + " artboards\u2026",
                  "info",
                  {
                    pinned: true,
                  },
                )
              : value653 && isFillPagedExport(value653)
                ? deps.showToast(
                    uiMessage("canvas.designCanvas.measuring2") + deps.callback2(value653.file) + '"\u2026',
                    "info",
                    {
                      pinned: true,
                    },
                  )
                : undefined,
          items2: Dynamic = [],
          items3: Dynamic = [],
          flag2: Dynamic = false;
        try {
          await deps.value495(
            items.map(
              (input?: Dynamic): Dynamic => ({
                file: input,
              }),
            ),
            async (): Promise<Dynamic> => {
              for (let value656 of items as Dynamic) {
                let value657: Dynamic = deps.value73.current.artboards.find(
                  (input?: Dynamic): Dynamic => input.file === value656,
                );
                items3.push(deps.callback2(value656));
                if (!value657 || !needsPagedExport(value657)) {
                  items2.push(value657 ? "keeps" : "gone");
                  continue;
                }
                let value658: Dynamic = await deps.value483(value656),
                  value659: Dynamic = value658
                    ? createPreviewHandle(value658)
                    : null;
                if (!value658 || !value659) {
                  items2.push(
                    deps.value87.current.artboards.some(
                      (input?: Dynamic): Dynamic => input.file === value656,
                    )
                      ? deps.value177.current.get(value656)?.isBlocked()
                        ? "stopped"
                        : "unmeasured"
                      : "gone",
                  );
                  continue;
                }
                if (value658.getBoundingClientRect().width === 0) {
                  items2.push("hidden");
                  continue;
                }
                let value660: Dynamic = await measureExpandedContentHeight(value659, {
                    w: value657.w,
                    h: value657.h,
                  }),
                  value661: Dynamic =
                    typeof value660 == "number" &&
                    value660 <= value657.h + exportHeightTolerance &&
                    isFillPagedExport(value657)
                      ? await measureFlowExportHeight(value659, {
                          w: value657.w,
                          h: value657.h,
                        })
                      : undefined;
                if (!deps.editableRef.current) {
                  flag2 = true;
                  break;
                }
                let value662: Dynamic = deps.value73.current.artboards.find(
                  (input?: Dynamic): Dynamic => input.file === value656,
                );
                if (
                  !value662 ||
                  !needsPagedExport(value662) ||
                  value662.w !== value657.w
                ) {
                  items2.push(
                    value662
                      ? value662.w !== value657.w
                        ? "unmeasured"
                        : "keeps"
                      : "gone",
                  );
                  continue;
                }
                if (value660 === null || value660 === "unsettled") {
                  items2.push(value660 === null ? "unmeasured" : "unsettled");
                  continue;
                }
                if (
                  value661 === "unsettled" ||
                  value661 === "empty" ||
                  value661 === null
                ) {
                  items2.push(
                    value661 === "unsettled"
                      ? "unsized"
                      : value661 === "empty"
                        ? "empty"
                        : "unmeasured",
                  );
                  continue;
                }
                if (
                  value661 !== undefined &&
                  (value662.h !== value657.h ||
                    !isFillPagedExport(value662))
                ) {
                  items2.push("changed");
                  continue;
                }
                let value663: Dynamic = resolveMeasuredExportHeight(
                  Math.max(value662.h, value657.h),
                  value660,
                  value661,
                );
                typeof value663 == "number" &&
                  deps.value399(
                    value656,
                    {
                      h: value663,
                    },
                    true,
                  );
                items2.push(
                  typeof value663 == "number"
                    ? value663 < value662.h
                      ? "shrunk"
                      : "grown"
                    : value663 === "fits" && value661 !== undefined
                      ? "matches"
                      : value663,
                );
              }
            },
          );
        } catch (value656: Dynamic) {
          console.error("[fit-height]", value656);
          items2.push("unmeasured");
        } finally {
          deps.value479(false);
          value654 !== undefined && deps.hideToast(value654);
        }
        if (flag2) {
          deps.showToast(
            uiMessage("canvas.designCanvas.thisCanvasIsReadOnly"),
          );
          return;
        }
        let value655: Dynamic = fitContentResultMessage(
          items2,
          items3,
        );
        value655 !== null &&
          (items2.every(
            (input?: Dynamic): Dynamic =>
              input === "grown" || input === "shrunk",
          )
            ? announce(value655)
            : deps.showToast(value655));
      }

/** 无框画板上报内容外包框时运行（onContentHull）：防抖后按内容调整画板尺寸，并保存画布元数据。 */
export function syncFramelessArtboardHull(deps: { readonly focusedFileRef: Dynamic; readonly value125: Dynamic; readonly value127: Dynamic; readonly value129: Dynamic; readonly value202: Dynamic; readonly value218: Dynamic; readonly value224: Dynamic; readonly value427: Dynamic; readonly value583: Dynamic; readonly value584: Dynamic; readonly value585: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value73: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        deps.value129((input2?: Dynamic): Dynamic => {
          if (input2.has(input) === (options == null)) return input2;
          let values: Dynamic = new Set(input2);
          options == null ? values.add(input) : values.delete(input);
          return values;
        });
        let current4: Dynamic = deps.value583.current,
          entry: Dynamic = current4.get(input);
        entry && clearTimeout(entry);
        if (options == null) {
          current4.delete(input);
          deps.value584.current.delete(input);
          return;
        }
        let callback15: Dynamic = (): Dynamic => {
          current4.delete(input);
          let value653: Dynamic = deps.value73.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === input,
          );
          if (!value653 || !value653.frameless) return;
          let value654: Dynamic =
            deps.value127.current.has(input) ||
            deps.value125.current === input ||
            deps.focusedFileRef.current === input;
          if (!deps.value224.current || !value654) {
            deps.value584.current.set(input, options);
            return;
          }
          deps.value584.current.delete(input);
          if (deps.value218.current || deps.value202.current || deps.value427.current) {
            current4.set(input, setTimeout(callback15, 300));
            return;
          }
          if (
            Math.abs(value653.w - options.w) <= 1 &&
            Math.abs(value653.h - options.h) <= 1
          )
            return;
          let value655: Dynamic = Date.now(),
            value656: Dynamic = (deps.value585.current.get(input) ?? []).filter(
              (input2?: Dynamic): Dynamic => value655 - input2 < 5e3,
            );
          if (value656.length >= 8) {
            current4.set(
              input,
              setTimeout(callback15, 5e3 - (value655 - value656[0])),
            );
            return;
          }
          deps.value585.current.set(input, [...value656, value655]);
          let value657: Dynamic = deps.value72(
            replaceDesignArtboards(
              deps.value73.current,
              deps.value73.current.artboards.map(
                (input2?: Dynamic): Dynamic =>
                  input2.file === input
                    ? {
                        ...input2,
                        w: options.w,
                        h: options.h,
                      }
                    : input2,
              ),
            ),
          );
          deps.value70.current = value657;
          deps.value73.current = value657;
          deps.value68(value657);
          getKvClient()
            .set(
              PlatformFileContentHandler_4(
                canvasMetadataFile,
              ),
              serializeCanvasMetadata(value657),
              {
                auto: true,
              },
            )
            .catch((): Dynamic => {});
        };
        current4.set(input, setTimeout(callback15, 400));
      }

/** 交互层（onManifestChange）拖动、缩放或旋转画板与画布图形时运行：预览期间只更新状态，提交时写回页面清单并记录移动、缩放、变换历史与播报。 */
export function commitInteractionLayerChange(deps: { readonly value143: Dynamic; readonly value169: Dynamic; readonly value413: Dynamic; readonly value67: Dynamic; readonly value68: Dynamic; readonly value70: Dynamic; readonly value72: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
                      options?: Dynamic,
                      context?: Dynamic): Dynamic {
                      let value653: Dynamic = replaceDesignPageContents(
                          deps.value73.current,
                          deps.value80.current,
                          input,
                        ),
                        value654: Dynamic = options
                          ? deps.value72(value653)
                          : value653;
                      if (!options) {
                        deps.value73.current = value654;
                        deps.value68(value654);
                        return;
                      }
                      let {
                          moved: value655,
                          resizedFrom: value656,
                          movedNotes: value657,
                          transformed: value658,
                        }: Dynamic = context ?? {},
                        callback15: Dynamic = (
                          input2?: Dynamic,
                          options2?: Dynamic,
                        ): Dynamic =>
                          Math.round(input2.x) !== Math.round(options2.x) ||
                          Math.round(input2.y) !== Math.round(options2.y),
                        value659: Dynamic = value654.artboards.flatMap(
                          (input2?: Dynamic): Dynamic => {
                            let value679: Dynamic = value655?.get(
                              input2.file,
                            );
                            return value679 && callback15(value679, input2)
                              ? [
                                  {
                                    file: input2.file,
                                    from: {
                                      x: value679.x,
                                      y: value679.y,
                                    },
                                    to: {
                                      x: input2.x,
                                      y: input2.y,
                                    },
                                  },
                                ]
                              : [];
                          },
                        ),
                        value660: Dynamic = (
                          value654.annotations ?? []
                        ).flatMap((input2?: Dynamic): Dynamic => {
                          let value679: Dynamic = value657?.get(input2.id);
                          return value679 && callback15(value679, input2)
                            ? [
                                {
                                  id: input2.id,
                                  from: {
                                    x: value679.x,
                                    y: value679.y,
                                  },
                                  to: {
                                    x: input2.x,
                                    y: input2.y,
                                  },
                                },
                              ]
                            : [];
                        }),
                        value661: Dynamic =
                          value660.length > 1 ||
                          (value660.length > 0 && value659.length > 0) ||
                          (value660.length > 0 &&
                            context?.bound !== undefined)
                            ? value660
                            : [],
                        value662: Dynamic =
                          context?.bound !== undefined
                            ? deps.value143.current.get(context.bound)
                            : undefined;
                      value662
                        ? value662({
                            moves: value659,
                            annMoves: value661,
                          })
                        : (value659.length > 0 || value661.length > 0) &&
                          deps.value413(
                            {
                              kind: "move",
                              moves: value659,
                              ...(value661.length > 0
                                ? {
                                    anns: value661,
                                  }
                                : {}),
                            },
                            new Set(),
                            undefined,
                            context?.bound,
                          );
                      let values: Dynamic = new Set(
                        value661.map(
                          (input2?: Dynamic): Dynamic => input2.id,
                        ),
                      );
                      if (value658) {
                        let callback21: Dynamic = (
                            input2?: Dynamic,
                            options2?: Dynamic,
                          ): Dynamic => {
                            let value681: Dynamic = Object.keys(
                              input2,
                            ).filter(
                              (input3?: Dynamic): Dynamic =>
                                value658.keys.has(input3) &&
                                input2[input3] !== options2[input3],
                            );
                            return value681.length === 0
                              ? null
                              : {
                                  from: Object.fromEntries(
                                    value681.map(
                                      (input3?: Dynamic): Dynamic => [
                                        input3,
                                        input2[input3],
                                      ],
                                    ),
                                  ),
                                  to: Object.fromEntries(
                                    value681.map(
                                      (input3?: Dynamic): Dynamic => [
                                        input3,
                                        options2[input3],
                                      ],
                                    ),
                                  ),
                                };
                          },
                          value679: Dynamic = value654.artboards.flatMap(
                            (input2?: Dynamic): Dynamic => {
                              let entry: Dynamic = value658.boards.get(
                                  input2.file,
                                ),
                                value681: Dynamic =
                                  entry &&
                                  callback21(
                                    artboardTransformSnapshot(
                                      entry,
                                    ),
                                    artboardTransformSnapshot(
                                      input2,
                                    ),
                                  );
                              return value681
                                ? [
                                    {
                                      file: input2.file,
                                      ...value681,
                                    },
                                  ]
                                : [];
                            },
                          ),
                          value680: Dynamic = (
                            value654.annotations ?? []
                          ).flatMap((input2?: Dynamic): Dynamic => {
                            let entry: Dynamic = value658.notes.get(
                                input2.id,
                              ),
                              value681: Dynamic =
                                entry &&
                                callback21(
                                  annotationTransformSnapshot(
                                    entry,
                                  ),
                                  annotationTransformSnapshot(
                                    input2,
                                  ),
                                );
                            return value681
                              ? [
                                  {
                                    id: input2.id,
                                    ...value681,
                                  },
                                ]
                              : [];
                          });
                        if (value679.length === 0 && value680.length === 0) {
                          deps.value68(value654);
                          return;
                        }
                        deps.value413(
                          {
                            kind: "transform",
                            label: value658.label,
                            boards: value679,
                            anns: value680,
                          },
                          new Set(),
                        );
                        for (let value681 of value658.notes.keys() as Dynamic)
                          values.add(value681);
                      }
                      let value663: Dynamic = value656,
                        value664: Dynamic = value663
                          ? value654.artboards.find(
                              (input2?: Dynamic): Dynamic =>
                                input2.file === value663.file &&
                                (Math.round(value663.w) !==
                                  Math.round(input2.w) ||
                                  Math.round(value663.h) !==
                                    Math.round(input2.h)),
                            )
                          : undefined;
                      value663 &&
                        value664 &&
                        deps.value413(
                          {
                            kind: "resize",
                            file: value664.file,
                            from: {
                              x: value663.x,
                              y: value663.y,
                              w: value663.w,
                              h: value663.h,
                            },
                            to: {
                              x: value664.x,
                              y: value664.y,
                              w: value664.w,
                              h: value664.h,
                            },
                          },
                          new Set(),
                        );
                      let value665: Dynamic =
                          (deps.value70.current ?? deps.value67).annotations ?? [],
                        value666: Dynamic = value654.annotations ?? [],
                        callback16: Dynamic = (input2?: Dynamic): Dynamic => {
                          for (let value679 of value666 as Dynamic) {
                            let value680: Dynamic = values.has(value679.id)
                              ? undefined
                              : value665.find(
                                  (input3?: Dynamic): Dynamic =>
                                    input3.id === value679.id,
                                );
                            if (
                              value680 &&
                              !isShapeAnnotation(value680) &&
                              !isShapeAnnotation(value679) &&
                              input2(value680, value679)
                            )
                              return [value680, value679];
                          }
                          return null;
                        },
                        callback17: Dynamic = (input2?: Dynamic): Dynamic => {
                          for (let value679 of value666 as Dynamic) {
                            let value680: Dynamic = values.has(value679.id)
                              ? undefined
                              : value665.find(
                                  (input3?: Dynamic): Dynamic =>
                                    input3.id === value679.id,
                                );
                            if (
                              value680 &&
                              isShapeAnnotation(value680) &&
                              isShapeAnnotation(value679) &&
                              input2(value680, value679)
                            )
                              return [value680, value679];
                          }
                          return null;
                        },
                        callback18: Dynamic = (
                          input2?: Dynamic,
                        ): Dynamic => ({
                          x: input2.x,
                          y: input2.y,
                          w: input2.w,
                          h: input2.h,
                          d: input2.d,
                        }),
                        value667: Dynamic = callback17(
                          (source?: Dynamic, source2?: Dynamic): Dynamic =>
                            source.kind === "pen" &&
                            source2.kind === "pen" &&
                            source.d !== source2.d,
                        );
                      value667 &&
                        value667[0].kind === "pen" &&
                        value667[1].kind === "pen" &&
                        deps.value413(
                          {
                            kind: "ann-path",
                            id: value667[1].id,
                            from: callback18(value667[0]),
                            to: callback18(value667[1]),
                          },
                          new Set(),
                        );
                      let callback19: Dynamic = (input2?: Dynamic): Dynamic =>
                          JSON.stringify(
                            Object.values(
                              annotationGeometry(input2),
                            ).map(Math.round as Dynamic),
                          ),
                        value668: Dynamic = callback17(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            callback19(input2) !== callback19(options2) &&
                            options2.id !== value667?.[1].id,
                        ),
                        value669: Dynamic = callback17(
                          (source?: Dynamic, source2?: Dynamic): Dynamic =>
                            source.kind === "image" &&
                            source2.kind === "image" &&
                            JSON.stringify(source.crop ?? null) !==
                              JSON.stringify(source2.crop ?? null),
                        ),
                        value670: Dynamic =
                          value669 !== null &&
                          value668 !== null &&
                          value668[1].id === value669[1].id;
                      value668 &&
                        !value670 &&
                        deps.value413(
                          {
                            kind: "ann-box",
                            id: value668[1].id,
                            from: annotationGeometry(
                              value668[0],
                            ),
                            to: annotationGeometry(value668[1]),
                          },
                          new Set(),
                        );
                      let callback20: Dynamic = (input2?: Dynamic): Dynamic =>
                          JSON.stringify(input2.css ?? null),
                        value671: Dynamic = callback17(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            (input2.color ?? "default") !==
                            (options2.color ?? "default"),
                        ),
                        value672: Dynamic = callback17(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            callback20(input2) !== callback20(options2),
                        );
                      if (value669) {
                        let [value679, value680]: Dynamic = value669;
                        deps.value413(
                          {
                            kind: "ann-crop",
                            id: value680.id,
                            from: value679.crop,
                            to: value680.crop,
                            ...(callback20(value679) !== callback20(value680)
                              ? {
                                  cssFrom: value679.css,
                                  cssTo: value680.css,
                                }
                              : {}),
                            ...(value670
                              ? {
                                  geomFrom: annotationGeometry(
                                    value679,
                                  ),
                                  geomTo: annotationGeometry(
                                    value680,
                                  ),
                                }
                              : {}),
                          },
                          new Set(),
                        );
                      } else
                        value671
                          ? deps.value413(
                              {
                                kind: "ann-color",
                                id: value671[1].id,
                                from: value671[0].color ?? "default",
                                to: value671[1].color ?? "default",
                                ...(value672
                                  ? {
                                      cssFrom: value671[0].css,
                                      cssTo: value671[1].css,
                                    }
                                  : {}),
                              },
                              new Set(),
                            )
                          : value672 &&
                            deps.value413(
                              {
                                kind: "ann-css",
                                id: value672[1].id,
                                from: value672[0].css,
                                to: value672[1].css,
                              },
                              new Set(),
                            );
                      let value673: Dynamic = callback16(
                          (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                            Math.round(input2.x) !== Math.round(options2.x) ||
                            Math.round(input2.y) !== Math.round(options2.y),
                        ),
                        value674: Dynamic =
                          PlatformFileContentHas(
                            value665,
                            value666,
                            new Set(
                              [...deps.value169].filter(
                                (input2?: Dynamic): Dynamic =>
                                  !values.has(input2),
                              ),
                            ),
                          ) ??
                          (value673 &&
                          Math.round(value673[0].w) !==
                            Math.round(value673[1].w)
                            ? value673
                            : null);
                      if (value674) {
                        let [value679, value680]: Dynamic = value674,
                          callback21: Dynamic = (input2?: Dynamic): Dynamic =>
                            Object.fromEntries(
                              ["x", "y", "w", "maxW", "maxH"]
                                .filter(
                                  (input3?: Dynamic): Dynamic =>
                                    value679[input3] !== value680[input3],
                                )
                                .map(
                                  (input3?: Dynamic): Dynamic => [
                                    input3,
                                    input2[input3],
                                  ],
                                ),
                            );
                        deps.value413(
                          {
                            kind: "transform",
                            get label() { return uiMessage("canvas.designCanvas.resize"); },
                            boards: [],
                            anns: [
                              {
                                id: value680.id,
                                from: callback21(value679),
                                to: callback21(value680),
                              },
                            ],
                          },
                          new Set(),
                        );
                      } else
                        value673 &&
                          deps.value413(
                            {
                              kind: "ann-move",
                              id: value673[1].id,
                              from: {
                                x: value673[0].x,
                                y: value673[0].y,
                              },
                              to: {
                                x: value673[1].x,
                                y: value673[1].y,
                              },
                            },
                            new Set(),
                          );
                      let value675: Dynamic = callback16(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                          Math.round(input2.w) !== Math.round(options2.w),
                      );
                      value675 &&
                        !value674 &&
                        deps.value413(
                          {
                            kind: "ann-resize",
                            id: value675[1].id,
                            from: value675[0].w,
                            to: value675[1].w,
                          },
                          new Set(),
                        );
                      let value676: Dynamic = callback16(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                          input2.text !== options2.text,
                      );
                      value676 &&
                        deps.value413(
                          {
                            kind: "ann-text",
                            id: value676[1].id,
                            from: value676[0].text,
                            to: value676[1].text,
                          },
                          new Set(),
                        );
                      let value677: Dynamic = callback16(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic => {
                          let [items, items2]: Dynamic = [
                            annotationTextStyle(input2),
                            annotationTextStyle(options2),
                          ];
                          return Object.keys(items).some(
                            (input3?: Dynamic): Dynamic =>
                              items[input3] !== items2[input3],
                          );
                        },
                      );
                      value677 &&
                        deps.value413(
                          {
                            kind: "ann-style",
                            id: value677[1].id,
                            from: annotationTextStyle(
                              value677[0],
                            ),
                            to: annotationTextStyle(value677[1]),
                            ...(value677[0].kind !== value677[1].kind &&
                            (value677[0].maxW !== value677[1].maxW ||
                              value677[0].maxH !== value677[1].maxH)
                              ? {
                                  caps: {
                                    from: {
                                      maxW: value677[0].maxW,
                                      maxH: value677[0].maxH,
                                    },
                                    to: {
                                      maxW: value677[1].maxW,
                                      maxH: value677[1].maxH,
                                    },
                                  },
                                }
                              : {}),
                          },
                          new Set(),
                        );
                      let value678: Dynamic = callback16(
                        (input2?: Dynamic, options2?: Dynamic): Dynamic =>
                          (input2.rotate ?? 0) !== (options2.rotate ?? 0),
                      );
                      value678 &&
                        deps.value413(
                          {
                            kind: "transform",
                            get label() { return uiMessage("canvas.designCanvas.rotate"); },
                            boards: [],
                            anns: [
                              {
                                id: value678[1].id,
                                from: {
                                  rotate: value678[0].rotate ?? 0,
                                },
                                to: {
                                  rotate: value678[1].rotate ?? 0,
                                },
                              },
                            ],
                          },
                          new Set(),
                        );
                      deps.value98(value654);
                    }
