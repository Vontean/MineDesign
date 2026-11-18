import { CanvasWorkingStateConstant_8 } from "../working-state";
import { PlatformFileContentConstant_17 } from "../../platform/file-content";
import { PlatformFileContentConstant_18 } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentLimit_6 } from "../../platform/file-content";
import { PreviewBuildDocumentResolvedValue_3 } from "../../preview/build-document";
import { buildDcDocument } from "../../editor/clipboard/html-placement";
import { buildPreviewDocument } from "../../preview/build-document";
import { canFreezeSinglePaste } from "../../editor/insert/drop-targets";
import { collectProjectDependencyFiles } from "../../preview/dependency-graph";
import { createLinkedFileScript } from "../../preview/module-cache";
import { emptyCanvasSelection } from "../../editor/selection/canvas-selection";
import { filterSelectedAnnotations } from "../../editor/selection/canvas-selection";
import { filterSelectedArtboards } from "../../editor/selection/canvas-selection";
import { getKvClient } from "../../platform/file-content";
import { keyboardShortcutLabel } from "../../editor/keyboard/shortcuts";
import { mergeDesignSystemFileOverlay } from "../../design-system/file-overlay";
import { normalizeProjectBlobPaths } from "../../preview/blob-paths";
import { pastedElementGeometry } from "../../editor/insert/drop-targets";
import { pastedRootElementCount } from "../../editor/insert/drop-targets";
import { positionPastedHtml } from "../../editor/clipboard/html-placement";
import { randomSessionToken } from "../working-state";
import { replaceSelectedElements } from "../../editor/selection/canvas-selection";
import { runtimeModuleBlobs } from "../../preview/module-cache";
import { runtimeModuleUrls } from "../../preview/module-cache";
import { selectionFromArtboards } from "../../editor/selection/canvas-selection";
import { selectionFromBoards } from "../../editor/selection/canvas-selection";
import { selectionFromElements } from "../../editor/selection/canvas-selection";
import { setCanvasElementSelection } from "../../editor/selection/canvas-selection";
import { type Dynamic } from "../../runtime-types";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { uniqueArtboardFile } from "../../platform/file-content";
import { uniqueElementArtboardTitle } from "../../platform/file-content";
import { dragGhostFilename, emptyCanvasSelectionFiles } from "../design-canvas";

/** 跨画板拖动携带 pieces（元素被拖出到空白画布）时运行：把拖出的元素生成为新画板或画布图形，处理复制/移动、只读与中断，返回写入与被拒结果。 */
export async function commitPieceDragOntoCanvas(deps: { readonly abandonSelectionGesture: Dynamic; readonly callback2: Dynamic; readonly callback3: Dynamic; readonly doc: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly supportsLoadState: Dynamic; readonly value127: Dynamic; readonly value141: Dynamic; readonly value142: Dynamic; readonly value143: Dynamic; readonly value144: Dynamic; readonly value153: Dynamic; readonly value177: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value224: Dynamic; readonly value396: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value98: Dynamic }, input?: Dynamic): Promise<Dynamic> {
      let { token: value653, travel: value654 }: Dynamic = input,
        current4: Dynamic = deps.selectionRef.current,
        value655: Dynamic = value654?.pieces ?? [],
        items: Dynamic = [...input.unanswered],
        callback15: Dynamic = (): Dynamic => {
          for (let value662 of input.plans.keys() as Dynamic) {
            let entry: Dynamic = deps.value177.current.get(value662);
            entry?.moveCancel(value653);
            entry?.moveSettle();
          }
        },
        callback16: Dynamic = (): Dynamic => (
          callback15(),
          {
            written: [],
            refused: items,
            selection: current4,
          }
        ),
        callback17: Dynamic = async (input2?: Dynamic): Promise<Dynamic> => {
          let value662: Dynamic =
              input.copy && input.canvasMoved
                ? deps.value144(value653)
                : Promise.resolve(),
            value663: Dynamic = input.canvas();
          for (let value664 of (value654?.travellers ?? []) as Dynamic)
            value654?.endHome(value664.file, false);
          await value662;
          deps.value448.current(
            value663 === false
              ? uiMessage("canvas.designCanvas.nothing") +
                  (input.copy ? "copied" : "moved") +
                  " \u2014 the drag was interrupted; try it again."
              : input2,
          );
          input.copy &&
            input.canvasMoved &&
            (deps.value142.current.has(value653)
              ? Promise.resolve()
              : deps.value144(value653)
            ).then((): Dynamic => {
              let entry: Dynamic = deps.value142.current.get(value653);
              deps.value142.current.delete(value653);
              entry &&
                (entry.files.size > 0 || entry.notes.size > 0) &&
                deps.setSelection(
                  selectionFromBoards({
                    files: entry.files,
                    notes: entry.notes,
                  }),
                );
            });
          return callback16();
        };
      if (!value654 || value655.length === 0)
        return callback17(
          uiMessage("canvas.designCanvas.nothing") + (input.copy ? "copied" : "moved") + ".",
        );
      callback15();
      let files: Dynamic = deps.doc.content().files;
      if (
        Object.keys(files).length + value655.length >
        PlatformFileContentFilesValue
      )
        return callback17(
          (input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") + (input.copy ? "copied" : "moved") + "; "
            : "") +
            uiMessage("canvas.designCanvas.couldnTMakeNewArtboards") +
            String(PlatformFileContentFilesValue) +
            "-file limit; delete something first",
        );
      let state: Dynamic = {
          moves: [],
          annMoves: [],
        },
        items2: Dynamic = [],
        callback18: Dynamic = (): Dynamic => {},
        promise: Dynamic = new Promise((input2?: Dynamic): Dynamic => {
          callback18 = input2;
        });
      deps.value143.current.set(value653, (input2?: Dynamic): Dynamic => {
        state = input2;
      });
      deps.value141.current.set(value653, (source?: Dynamic): Dynamic => {
        source.kind === "add"
          ? items2.push({
              entries: source.entries,
              anns: source.anns ?? [],
            })
          : source.kind === "ann-add" &&
            items2.push({
              entries: [],
              anns: [source.spec],
            });
        callback18();
      });
      let value656: Dynamic = input.canvasMoved
          ? deps.value144(value653)
          : Promise.resolve(),
        value657: Dynamic;
      try {
        value657 = input.canvas();
      } finally {
        deps.value143.current.delete(value653);
      }
      value654.copy &&
        input.canvasMoved &&
        (await Promise.race([
          promise,
          value656,
          new Promise((input2?: Dynamic): Dynamic => setTimeout(input2, 2e3)),
        ]));
      deps.value141.current.delete(value653);
      deps.value142.current.delete(value653);
      let state2: Dynamic = {
        entries: items2.flatMap(
          (input2?: Dynamic): Dynamic => input2.entries,
        ),
        anns: items2.flatMap((input2?: Dynamic): Dynamic => input2.anns),
      };
      if (input.canvasMoved && value657 === false) {
        for (let value662 of value654.travellers as Dynamic)
          value654.endHome(value662.file, false);
        deps.value448.current(
          uiMessage("canvas.designCanvas.nothing") +
            (value654.copy ? "copied" : "moved") +
            " \u2014 the drag was interrupted; try it again.",
        );
        return callback16();
      }
      let callback19: Dynamic = (): Dynamic => {
        (state.moves.length > 0 || state.annMoves.length > 0) &&
          deps.value396.current(
            {
              kind: "move",
              moves: state.moves,
              ...(state.annMoves.length > 0
                ? {
                    anns: state.annMoves,
                  }
                : {}),
            },
            new Set(),
            undefined,
            value653,
          );
        (state2.entries.length > 0 || state2.anns.length > 0) &&
          deps.value396.current(
            {
              kind: "add",
              entries: state2.entries,
              ...(state2.anns.length > 0
                ? {
                    anns: state2.anns,
                  }
                : {}),
            },
            new Set(
              state2.entries.map((input2?: Dynamic): Dynamic => input2.file),
            ),
            undefined,
            value653,
          );
      };
      if (
        Object.keys(deps.doc.content().files).length + value655.length >
        PlatformFileContentFilesValue
      ) {
        callback19();
        for (let value662 of value654.travellers as Dynamic)
          value654.endHome(value662.file, false);
        deps.value448.current(
          (input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") + (value654.copy ? "copied" : "moved") + "; "
            : "") +
            uiMessage("canvas.designCanvas.couldnTMakeNewArtboards") +
            String(PlatformFileContentFilesValue) +
            "-file limit; delete something first",
        );
        return callback16();
      }
      let items3: Dynamic = [],
        entries: Dynamic = new Map(),
        state3: Dynamic = {
          files: {
            ...deps.doc.content().files,
            ...Object.fromEntries(
              state2.entries.map(
                (input2?: Dynamic): Dynamic => [input2.file, input2.src],
              ),
            ),
          },
          artboards: [
            ...deps.value73.current.artboards,
            ...state2.entries.map((input2?: Dynamic): Dynamic => input2.spec),
          ],
        };
      try {
        for (let value662 of value655 as Dynamic) {
          let entry: Dynamic = deps.value177.current.get(value662.file);
          if (!entry || (await entry.travellerHtml(value662.tid)) === null)
            continue;
          let value663: Dynamic = entry.serializeSelection([value662.tid], {
            lift: {
              ew: value662.box.w,
              ox: 0,
              oy: 0,
            },
          });
          if (!value663) continue;
          await entry.flushPending();
          let value664: Dynamic =
              (await getKvClient().get(
                PlatformFileContentHandler_4(value662.file),
              )) ??
              files[value662.file] ??
              "",
            value665: Dynamic = uniqueArtboardFile(
              state3.files,
              "Piece",
              deps.supportsLoadState,
            ),
            value666: Dynamic = buildDcDocument(
              value663,
              typeof value664 == "string" ? value664 : "",
            ),
            value667: Dynamic = entry.describeTids([value662.tid])[0],
            value668: Dynamic = value667
              ? value667.tag.charAt(0).toUpperCase() + value667.tag.slice(1)
              : "Piece",
            state4: Dynamic = {
              file: value665,
              x: Math.max(
                -PlatformFileContentConstant_18,
                Math.min(
                  PlatformFileContentConstant_18,
                  Math.round(value662.box.x),
                ),
              ),
              y: Math.max(
                -PlatformFileContentConstant_18,
                Math.min(
                  PlatformFileContentConstant_18,
                  Math.round(value662.box.y),
                ),
              ),
              w: Math.min(
                PlatformFileContentLimit_6,
                Math.max(
                  PlatformFileContentConstant_17,
                  value662.box.w,
                ),
              ),
              h: Math.min(
                PlatformFileContentLimit_6,
                Math.max(
                  PlatformFileContentConstant_17,
                  value662.box.h,
                ),
              ),
              title: uniqueElementArtboardTitle(
                value668,
                state3.artboards,
              ),
              frameless: true,
              ...deps.callback3(),
            };
          state3.files[value665] = value666;
          state3.artboards.push(state4);
          items3.push({
            file: value665,
            src: value666,
            spec: state4,
            home: value662.file,
            tid: value662.tid,
          });
          entries.set(value662.file, [
            ...(entries.get(value662.file) ?? []),
            value662.tid,
          ]);
        }
      } catch (value662: Dynamic) {
        callback19();
        for (let value663 of value654.travellers as Dynamic)
          value654.endHome(value663.file, false);
        console.error("set pieces:", value662);
        deps.value448.current(
          input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
                (value654.copy ? "copied" : "moved") +
                "; the elements could not be lifted and stayed."
            : uiMessage("canvas.designCanvas.nothing") +
                (value654.copy ? "copied" : "moved") +
                " \u2014 the elements could not be lifted.",
        );
        return callback16();
      }
      if (items3.length === 0) {
        callback19();
        for (let value662 of value654.travellers as Dynamic)
          value654.endHome(value662.file, false);
        deps.value448.current(
          (input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
              (value654.copy ? "copied" : "moved") +
              "; the elements stayed \u2014 "
            : uiMessage("canvas.designCanvas.nothing") +
              (value654.copy ? "copied" : "moved") +
              " \u2014 ") +
            "repeated, nested or locked elements stay with their artboard.",
        );
        return callback16();
      }
      if (!deps.value224.current) {
        callback19();
        for (let value662 of value654.travellers as Dynamic)
          value654.endHome(value662.file, false);
        deps.value448.current(
          (input.canvasMoved
            ? uiMessage("canvas.designCanvas.theRest") +
              (value654.copy ? "copied" : "moved") +
              "; the elements stayed \u2014 "
            : uiMessage("canvas.designCanvas.nothing") +
              (value654.copy ? "copied" : "moved") +
              " \u2014 ") + uiMessage("canvas.designCanvas.theCanvasIsReadOnly"),
        );
        return callback16();
      }
      let items4: Dynamic = [
        ...items3.map(
          ({ file: file, src: src, spec: spec }: Dynamic): Dynamic => ({
            file: file,
            src: src,
            spec: spec,
          }),
        ),
        ...state2.entries,
      ];
      deps.value396.current(
        {
          kind: "add",
          entries: items4,
          ...(state2.anns.length > 0
            ? {
                anns: state2.anns,
              }
            : {}),
          ...(state.moves.length > 0
            ? {
                moves: state.moves,
              }
            : {}),
          ...(state.annMoves.length > 0
            ? {
                annMoves: state.annMoves,
              }
            : {}),
        },
        new Set(items4.map((input2?: Dynamic): Dynamic => input2.file)),
        undefined,
        value653,
      );
      try {
        for (let value662 of items3 as Dynamic) {
          await getKvClient().set(
            PlatformFileContentHandler_4(value662.file),
            value662.src,
          );
          deps.value127.current.set(value662.file, Date.now());
        }
      } catch (value662: Dynamic) {
        for (let value663 of value654.travellers as Dynamic)
          value654.endHome(value663.file, false);
        console.error("set pieces:", value662);
        deps.value448.current(
          uiMessage("canvas.designCanvas.couldnTFinishTheDrop") +
            keyboardShortcutLabel("Z") +
            " takes back what was made.",
        );
        return callback16();
      }
      deps.value98({
        artboards: [
          ...deps.value73.current.artboards.filter(
            (input2?: Dynamic): Dynamic =>
              !items3.some(
                (input3?: Dynamic): Dynamic => input3.file === input2.file,
              ),
          ),
          ...items3.map((input2?: Dynamic): Dynamic => input2.spec),
        ],
      });
      let items5: Dynamic = [...entries.keys()];
      callback15();
      let value658: Dynamic = value654.copy
          ? undefined
          : deps.value432.current?.group(items5, {
              bound: value653,
              atomic: true,
            }),
        items6: Dynamic = [...items],
        items7: Dynamic = [],
        entries2: Dynamic = new Map();
      await Promise.all(
        items5.map(async (input2?: Dynamic): Promise<Dynamic> => {
          if (value654.copy) {
            value654.endHome(input2, false);
            return;
          }
          let entry: Dynamic = deps.value177.current.get(input2),
            value662: Dynamic = entries.get(input2) ?? [],
            value663: Dynamic = (
              current4.elements.get(input2)?.tids ?? []
            ).filter(
              (input3?: Dynamic): Dynamic => !value662.includes(input3),
            ),
            value664: Dynamic = entry
              ? await entry
                  .removeTravelled(value662, value663)
                  .catch((): Dynamic => "failed")
              : "failed";
          value658?.settled(input2);
          typeof value664 == "string"
            ? items6.push(input2)
            : (items7.push(input2), entries2.set(input2, value664.kept));
          value654.endHome(input2, typeof value664 != "string");
        }),
      );
      value658?.end();
      for (let value662 of value654.travellers as Dynamic)
        items5.includes(value662.file) ||
          value654.endHome(value662.file, false);
      for (let value662 of items7 as Dynamic)
        deps.value153.current.set(value662, Date.now());
      let value659: Dynamic = items5.filter(
          (input2?: Dynamic): Dynamic => items6.includes(input2),
        ),
        entries3: Dynamic = new Map();
      for (let value662 of value655 as Dynamic)
        items3.some(
          (input2?: Dynamic): Dynamic =>
            input2.home === value662.file && input2.tid === value662.tid,
        ) ||
          entries3.set(value662.file, [
            ...(entries3.get(value662.file) ?? []),
            value662.tid,
          ]);
      let callback20: Dynamic = (items8?: Dynamic): Dynamic =>
        items8.length === 1
          ? items8[0]
          : items8.slice(0, -1).join(", ") +
            " and " +
            items8[items8.length - 1];
      if (value659.length > 0) {
        let value662: Dynamic = value659.map(deps.callback2);
        deps.value448.current(
          uiMessage("canvas.designCanvas.movedOntoTheCanvasBut") +
            callback20(value662) +
            " kept what was dragged, so it is now in both places. Check " +
            (value662.length === 1 ? uiMessage("canvas.designCanvas.thatArtboard") : uiMessage("canvas.designCanvas.thoseArtboards")) +
            ".",
        );
      } else
        entries3.size > 0
          ? deps.value189(
              (value654.copy ? "Copied" : "Moved") +
                " " +
                String(items3.length) +
                (items3.length === 1 ? " element" : " elements") +
                " onto the canvas. The rest stayed in " +
                callback20([...entries3.keys()].map(deps.callback2)) +
                " \u2014 repeated, nested or locked elements stay with their artboard.",
            )
          : deps.value189(
              (value654.copy ? "Copied" : "Moved") +
                (items3.length === 1
                  ? ""
                  : " " + String(items3.length) + " elements") +
                " onto the canvas",
            );
      deps.abandonSelectionGesture();
      let entries4: Dynamic = new Map();
      if (!value654.copy) {
        for (let [value662, value663] of current4.elements as Dynamic)
          items5.includes(value662) || entries4.set(value662, value663);
        for (let value662 of items5 as Dynamic) {
          let entry: Dynamic = current4.elements.get(value662);
          if (!entry) continue;
          let value663: Dynamic = items7.includes(value662)
            ? (entries2.get(value662) ?? [])
            : null;
          value663 === null
            ? entries4.set(value662, entry)
            : value663.length > 0 &&
              entries4.set(value662, {
                ...entry,
                tids: value663,
                rect: null,
                count: value663.length,
              });
        }
      }
      let current5: Dynamic = deps.focusedFileRef.current;
      (current5 == null ||
        entries4.get(current5) !== current4.elements.get(current5)) &&
        deps.value62();
      let value660: Dynamic = replaceSelectedElements(
        selectionFromArtboards(
          new Set(items3.map((input2?: Dynamic): Dynamic => input2.file)),
        ),
        entries4,
        null,
      );
      deps.setSelection(value660);
      for (let value662 of [
        ...new Set([
          ...items5,
          ...items,
          ...value654.travellers.map(
            (input2?: Dynamic): Dynamic => input2.file,
          ),
        ]),
      ] as Dynamic)
        deps.value177.current.get(value662)?.moveSettle();
      (window as Dynamic).setTimeout((): Dynamic => {
        for (let value662 of new Set([
          ...items7,
          ...entries4.keys(),
        ]) as Dynamic) {
          let value663: Dynamic = entries4.get(value662)?.tids ?? null;
          value662 === deps.focusedFileRef.current
            ? deps.setShownFrameSelection(value662, value663)
            : deps.value177.current
                .get(value662)
                ?.setShownSelection(
                  value663,
                  value663 ? deps.value19(value662) : null,
                );
        }
      }, 80);
      let value661: Dynamic = items.filter(
        (input2?: Dynamic): Dynamic =>
          !items5.includes(input2) && current4.elements.has(input2),
      );
      value661.length > 0 &&
        value659.length === 0 &&
        entries3.size === 0 &&
        deps.value448.current(
          uiMessage("canvas.designCanvas.nothingMovedInside") +
            callback20(value661.map(deps.callback2)) +
            "; the rest " +
            (value654.copy ? "copied" : "moved") +
            ".",
        );
      return {
        written: items7,
        refused: items6,
        selection: value660,
      };
    }

/** 元素拖动松手后的提交：把元素移动或复制到目标画板（landTravellers/moveElements），失败时回滚并合并历史，返回写入与被拒结果；含 pieces 时转交 commitPieceDragOntoCanvas。 */
export async function commitElementMoveAcrossArtboards(deps: { readonly applyCanvasSelection: Dynamic; readonly callback2: Dynamic; readonly callback4: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setShownFrameSelection: Dynamic; readonly value142: Dynamic; readonly value144: Dynamic; readonly value153: Dynamic; readonly value177: Dynamic; readonly value19: Dynamic; readonly value25: Dynamic; readonly value432: Dynamic; readonly value448: Dynamic }, input?: Dynamic): Promise<Dynamic> {
      let {
        token: value653,
        plans: value654,
        unanswered: value655,
        travel: value656,
      }: Dynamic = input;
      if (value656?.pieces) return deps.callback4(input);
      input.canvas();
      let items: Dynamic = [...value654.keys()],
        current4: Dynamic = deps.selectionRef.current,
        current5: Dynamic = deps.focusedFileRef.current,
        items2: Dynamic = [...value655],
        entries: Dynamic = new Map(current4.elements),
        items3: Dynamic = [],
        primary: Dynamic = current4.primary,
        items4: Dynamic = [];
      if (value656) {
        let target: Dynamic = value656.target,
          value660: Dynamic = value656.travellers
            .filter((input2?: Dynamic): Dynamic => !input2.external)
            .map((input2?: Dynamic): Dynamic => input2.file),
          value661: Dynamic = items.filter(
            (input2?: Dynamic): Dynamic =>
              input2 !== target && !value660.includes(input2),
          ),
          items6: Dynamic = [],
          entries2: Dynamic = new Map();
        for (let value665 of value656.travellers as Dynamic) {
          let entry: Dynamic = deps.value177.current.get(value665.file),
            items7: Dynamic = [];
          for (let value666 of value665.members as Dynamic) {
            let value667: Dynamic = value656.plan.landing.find(
                (input2?: Dynamic): Dynamic => input2.tid === value666.index,
              ),
              value668: Dynamic = value667
                ? (value666.html ??
                  (entry
                    ? await entry
                        .travellerHtml(value666.tid)
                        .catch((): Dynamic => null)
                    : null))
                : null;
            value667 && value668
              ? items6.push({
                  file: value665.file,
                  tid: value666.tid,
                  html: value668,
                  landing: value667,
                })
              : items7.push(value666.tid);
          }
          entries2.set(value665.file, items7);
        }
        let value662: Dynamic = value656.copy === true,
          value663: Dynamic = value662
            ? [target, ...value661]
            : [...new Set([target, ...value660, ...value661])],
          value664: Dynamic = deps.value432.current?.group(
            value663,
            value662
              ? {
                  bound: value653,
                }
              : {
                  bound: value653,
                  atomic: true,
                  holder: target,
                  waiting: value660.filter(
                    (input2?: Dynamic): Dynamic => input2 !== target,
                  ),
                },
          );
        try {
          current5 != null &&
            value663.includes(current5) &&
            (deps.value25.current = current5);
          let entry: Dynamic = deps.value177.current.get(target),
            value665: Dynamic =
              value662 && value660.includes(target)
                ? []
                : (current4.elements.get(target)?.tids ?? []),
            value666: Dynamic = await (
              entry?.landTravellers(
                items6.map(
                  ({ html: html, landing: landing }: Dynamic): Dynamic => ({
                    key: landing.tid,
                    html: html,
                    landing: landing,
                  }),
                ),
                value654.get(target) ?? [],
                value665,
              ) ?? Promise.resolve("failed")
            ).catch((): Dynamic => "failed");
          value664?.settled(target);
          let entries3: Dynamic = new Map(),
            items7: Dynamic = [],
            items8: Dynamic = [],
            callback15: Dynamic = async (): Promise<Dynamic> => {
              for (let value672 of [...items8].reverse() as Dynamic) {
                let entry2: Dynamic = deps.value177.current.get(value672),
                  value673: Dynamic = entry2
                    ? (value664?.discard(value672) ?? null)
                    : null;
                if (!entry2 || !value673) return false;
                if (
                  !(await entry2
                    .applyHistory(deps.value19(value672), "undo")
                    .catch((): Dynamic => false))
                ) {
                  value673();
                  return false;
                }
                entry2.dropRedo();
                items8.pop();
                items4.push(value672);
                items3 = items3.filter(
                  (input2?: Dynamic): Dynamic => input2 !== value672,
                );
                let entry3: Dynamic = current4.elements.get(value672);
                entry3
                  ? entries.set(value672, entry3)
                  : entries.delete(value672);
              }
              return true;
            };
          if (value666 === "failed") {
            items2.push(target);
            target === current5 &&
              deps.value25.current === current5 &&
              (deps.value25.current = null);
            for (let value672 of value656.travellers as Dynamic)
              entries2.set(
                value672.file,
                value672.members.map(
                  (input2?: Dynamic): Dynamic => input2.tid,
                ),
              );
          } else {
            for (let value672 of items6 as Dynamic) {
              let entry2: Dynamic = value666.landed.get(value672.landing.tid);
              if (!entry2 || entry2.length === 0) {
                entries2.get(value672.file)?.push(value672.tid);
                continue;
              }
              let value673: Dynamic = entries3.get(value672.file) ?? [];
              value673.push(value672.tid);
              entries3.set(value672.file, value673);
              items7.push(...entry2);
            }
            let stayers: Dynamic = value666.stayers;
            stayers && typeof stayers == "object"
              ? items7.push(...stayers.newTids)
              : (stayers === "refused" && items2.push(target),
                items7.push(...(value666.stayersOwn ?? value665)));
            (items7.length > 0 || entries3.size > 0) && items3.push(target);
            if (entries3.size > 0) {
              let value672: Dynamic = items2.indexOf(target);
              value672 >= 0 && items2.splice(value672, 1);
            }
            entries3.size > 0 && items8.push(target);
          }
          let value667: Dynamic = await Promise.all(
            value661.map(
              (input2?: Dynamic): Dynamic =>
                (
                  deps.value177.current
                    .get(input2)
                    ?.moveElements(value654.get(input2) ?? []) ??
                  Promise.resolve("failed")
                )
                  .catch((): Dynamic => "failed")
                  .finally((): Dynamic => value664?.settled(input2)),
            ),
          );
          value661.forEach((input2?: Dynamic, options?: Dynamic): Dynamic => {
            let value672: Dynamic = value667[options],
              entry2: Dynamic = current4.elements.get(input2);
            if (typeof value672 == "string" || !entry2) {
              (value672 === "refused" || value672 === "failed") &&
                items2.push(input2);
              input2 === current5 &&
                deps.value25.current === current5 &&
                (deps.value25.current = null);
              return;
            }
            entries.set(input2, {
              ...entry2,
              tids: value672.newTids,
              rect: null,
              count: value672.newTids.length,
            });
            items3.push(input2);
          });
          let value668: Dynamic = deps.callback2,
            callback16: Dynamic = (items11?: Dynamic): Dynamic =>
              items11.length <= 1
                ? (items11[0] ?? "")
                : items11.slice(0, -1).join(", ") +
                  " and " +
                  items11[items11.length - 1],
            items9: Dynamic = [],
            items10: Dynamic = [],
            value669: Dynamic = null;
          for (let value672 of value656.travellers as Dynamic) {
            if (value672.external) continue;
            if (value662) {
              value656.endHome(value672.file, false);
              value672.file !== target &&
                (entries3.get(value672.file)?.length ?? 0) > 0 &&
                entries.delete(value672.file);
              continue;
            }
            let entry2: Dynamic = deps.value177.current.get(value672.file),
              value673: Dynamic = entries3.get(value672.file) ?? [],
              value674: Dynamic = (
                current4.elements.get(value672.file)?.tids ?? []
              ).filter(
                (input2?: Dynamic): Dynamic => !value673.includes(input2),
              ),
              value675: Dynamic = value674,
              flag2: Dynamic = false;
            if (value669 != null) {
              value675 = current4.elements.get(value672.file)?.tids ?? [];
              value669.how === "partial" &&
                value673.length > 0 &&
                items9.push(value672.file);
            } else if (value673.length > 0) {
              value664?.admit(value672.file);
              let value676: Dynamic = entry2
                ? await entry2
                    .removeTravelled(value673, value674)
                    .catch((): Dynamic => "failed")
                : "failed";
              typeof value676 == "string"
                ? (value664?.settled(value672.file),
                  (value675 =
                    current4.elements.get(value672.file)?.tids ?? []),
                  (value669 = {
                    at: value672.file,
                    how: (await callback15()) ? "reverted" : "partial",
                  }),
                  value669.how === "partial" &&
                    items9.push(...items4, value672.file))
                : ((value675 = value676.kept),
                  (flag2 = true),
                  items3.push(value672.file),
                  items8.push(value672.file));
            } else items10.push(value672.file);
            value672.file === current5 &&
              !flag2 &&
              deps.value25.current === current5 &&
              (deps.value25.current = null);
            value664?.settled(value672.file);
            value656.endHome(value672.file, flag2);
            let entry3: Dynamic = current4.elements.get(value672.file);
            value675.length === 0
              ? entries.delete(value672.file)
              : entry3 &&
                entries.set(value672.file, {
                  ...entry3,
                  tids: value675,
                  rect: null,
                  count: value675.length,
                });
          }
          let value670: Dynamic = value660.filter(
              (input2?: Dynamic): Dynamic =>
                !items10.includes(input2) &&
                (entries2.get(input2)?.length ?? 0) > 0,
            ),
            value671: Dynamic = value662 ? "copy" : "move";
          value669?.how === "reverted"
            ? deps.value448.current(
                uiMessage("canvas.designCanvas.couldnT") +
                  value671 +
                  " to " +
                  value668(target) +
                  ". " +
                  value668(value669.at) +
                  " kept what was dragged, so the copies in " +
                  value668(target) +
                  " were removed.",
              )
            : items9.length > 0
              ? deps.value448.current(
                  uiMessage("canvas.designCanvas.theMoveLandedIn") +
                    value668(target) +
                    " but could not leave " +
                    callback16(items9.map(value668)) +
                    (items9.length > 1
                      ? ". Check those artboards."
                      : ". Check both artboards."),
                )
              : items10.length > 0 && value666 !== "failed"
                ? deps.value448.current(
                    uiMessage("canvas.designCanvas.nowhereToLandIn") +
                      value668(target) +
                      " for " +
                      callback16(items10.map(value668)) +
                      "'s selection; " +
                      (value662 ? uiMessage("canvas.designCanvas.nothingOfItWasCopied") : uiMessage("canvas.designCanvas.itStayed")),
                  )
                : value670.length > 0 &&
                  deps.value448.current(
                    uiMessage("canvas.designCanvas.partOf") +
                      callback16(value670.map(value668)) +
                      "'s selection could not land in " +
                      value668(target) +
                      (value662
                        ? "; that part was not copied."
                        : "; that part stayed where it was."),
                  );
          items9 = [];
          if (items7.length > 0 && value669?.how !== "reverted") {
            let entry2: Dynamic = current4.elements.get(target);
            entries.set(
              target,
              entry2
                ? {
                    ...entry2,
                    tids: items7,
                    rect: null,
                    count: items7.length,
                  }
                : {
                    name: deps.value19(target),
                    tids: items7,
                    rect: null,
                    count: items7.length,
                  },
            );
            primary = target;
          }
          if (value669?.how !== "reverted")
            for (let value672 of [target, ...value660] as Dynamic)
              deps.value153.current.set(value672, Date.now());
        } finally {
          value664?.end();
        }
      } else {
        let value660: Dynamic =
          items.length > 0
            ? deps.value432.current?.group(items, {
                bound: value653,
              })
            : undefined;
        current5 != null &&
          items.includes(current5) &&
          (deps.value25.current = current5);
        let value661: Dynamic = await Promise.all(
          items.map(
            (input2?: Dynamic): Dynamic =>
              (
                deps.value177.current
                  .get(input2)
                  ?.moveElements(value654.get(input2) ?? []) ??
                Promise.resolve("failed")
              )
                .catch((): Dynamic => "failed")
                .finally((): Dynamic => value660?.settled(input2)),
          ),
        );
        value660?.end();
        items.forEach((input2?: Dynamic, options?: Dynamic): Dynamic => {
          let value662: Dynamic = value661[options],
            entry: Dynamic = current4.elements.get(input2);
          if (typeof value662 == "string" || !entry) {
            (value662 === "refused" || value662 === "failed") &&
              items2.push(input2);
            input2 === current5 &&
              deps.value25.current === current5 &&
              (deps.value25.current = null);
            return;
          }
          entries.set(input2, {
            ...entry,
            tids: value662.newTids,
            rect: null,
            count: value662.newTids.length,
          });
        });
        items3 = items.filter(
          (input2?: Dynamic, options?: Dynamic): Dynamic =>
            typeof value661[options] != "string",
        );
      }
      input.canvasDropped &&
        deps.value448.current(
          uiMessage("canvas.designCanvas.theArtboardsAndNotesIn") +
            (input.copy ? "copy" : "move") +
            " \u2014 the drag was interrupted; try it again.",
        );
      let value657: Dynamic = current4;
      if (input.copy && input.canvasMoved && !input.canvasDropped) {
        deps.value142.current.has(value653) || (await deps.value144(value653));
        let entry: Dynamic = deps.value142.current.get(value653);
        deps.value142.current.delete(value653);
        value657 = entry
          ? selectionFromBoards({
              files: entry.files,
              notes: entry.notes,
            })
          : selectionFromBoards({
              files: emptyCanvasSelectionFiles,
              notes: emptyCanvasSelectionFiles,
            });
      } else
        input.copy &&
          (value657 = selectionFromBoards({
            files: emptyCanvasSelectionFiles,
            notes: emptyCanvasSelectionFiles,
          }));
      let value658: Dynamic = replaceSelectedElements(
        value657,
        entries,
        primary,
      );
      deps.applyCanvasSelection(value658);
      let value659: Dynamic = value658,
        items5: Dynamic = [
          ...new Set([
            ...items,
            ...(value656
              ? [
                  value656.target,
                  ...value656.travellers.map(
                    (input2?: Dynamic): Dynamic => input2.file,
                  ),
                ]
              : []),
          ]),
        ];
      for (let value660 of items5 as Dynamic)
        !items3.includes(value660) &&
          !items4.includes(value660) &&
          deps.value177.current.get(value660)?.moveSettle();
      for (let value660 of value655 as Dynamic)
        deps.value177.current.get(value660)?.moveSettle();
      (window as Dynamic).setTimeout((): Dynamic => {
        for (let value660 of [
          ...new Set([...items3, ...items4]),
        ] as Dynamic) {
          let value661: Dynamic =
            deps.selectionRef.current.elements.get(value660)?.tids ?? null;
          value660 === deps.focusedFileRef.current
            ? deps.setShownFrameSelection(value660, value661)
            : deps.value177.current
                .get(value660)
                ?.setShownSelection(
                  value661,
                  value661 ? deps.value19(value660) : null,
                );
          deps.value177.current.get(value660)?.moveSettle();
        }
      }, 80);
      if (items2.length > 0) {
        let value660: Dynamic = items2.map(deps.callback2),
          value661: Dynamic =
            value660.length === 1
              ? value660[0]
              : value660.slice(0, -1).join(", ") +
                " and " +
                value660[value660.length - 1],
          value662: Dynamic = items3.length === 0;
        deps.value448.current(
          value662 && !input.canvasMoved
            ? uiMessage("canvas.designCanvas.nothingMoved")
            : value662
              ? uiMessage("canvas.designCanvas.theRestMovedNothingMoved") + value661 + "."
              : uiMessage("canvas.designCanvas.nothingMovedInside") + value661 + "; the rest moved.",
        );
      }
      return {
        written: items3,
        refused: items2,
        selection: value659,
      };
    }

/** 开始拖出元素时运行：把选中元素序列化成独立的 dc 文档并构建预览 srcdoc，作为拖动中跟随指针的幽灵预览。 */
export function buildDragGhostPreview(deps: { readonly assets: Dynamic; readonly doc: Dynamic; readonly value177: Dynamic; readonly value195: Dynamic; readonly value196: Dynamic }, input?: Dynamic): Dynamic {
        if (!input.box || deps.value196.current?.key === input.key) return;
        deps.value196.current = {
          key: input.key,
          ghost: null,
        };
        let entry: Dynamic = deps.value177.current.get(input.file),
          box: Dynamic = input.box;
        if (entry)
          try {
            entry
              .renderDefaults()
              .then((input2?: Dynamic): Dynamic => {
                if (deps.value196.current?.key !== input.key) return;
                let value653: Dynamic = entry.serializeSelection(input.tids, {
                  bakeProps: true,
                  lift: box,
                  vals: input2,
                });
                if (!value653 || value653.length > 2e5) return;
                let files: Dynamic = deps.doc.content().files,
                  state: Dynamic = {
                    ...mergeDesignSystemFileOverlay(files),
                    [dragGhostFilename]: buildDcDocument(
                      value653,
                      files[input.file] ?? "",
                      {
                        logic: false,
                      },
                    ),
                  },
                  value654: Dynamic = normalizeProjectBlobPaths(
                    collectProjectDependencyFiles(
                      state,
                      dragGhostFilename,
                    ),
                  ),
                  { doc: value655, parts: value656 }: Dynamic = buildPreviewDocument(
                    value654,
                    dragGhostFilename,
                    deps.assets,
                    new Set(),
                    {
                      frameless: true,
                      fileUrlFor: createLinkedFileScript,
                    },
                  ),
                  value657: Dynamic =
                    Object.keys(value656).length > 0
                      ? {
                          srcdoc: PreviewBuildDocumentResolvedValue_3,
                          boot: {
                            doc: value655,
                            parts: runtimeModuleBlobs(value656),
                            urls: runtimeModuleUrls(value656),
                          },
                        }
                      : {
                          srcdoc: value655,
                          boot: null,
                        };
                deps.value196.current.ghost = value657;
                deps.value195(
                  (input3?: Dynamic): Dynamic =>
                    input3 && {
                      ...input3,
                      ghost: value657,
                    },
                );
              })
              .catch((): Dynamic => {});
          } catch {}
      }

/** 画布对象悬停在目标画板上时运行：在目标画板中计算落点计划（dropPlanAt）并显示插入预览，请求进行中时只保留最新坐标排队。 */
export function requestDropPlanPreview(deps: { readonly value177: Dynamic; readonly value203: Dynamic; readonly value206: Dynamic; readonly value87: Dynamic }, event?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra?: Dynamic): Dynamic {
        if (event.inFlight) {
          event.pending = {
            cx: context,
            cy: value653,
            mode: extra,
          };
          return;
        }
        let html: Dynamic = event.html,
          member: Dynamic = event.member;
        if (!html || !member) return;
        let entry: Dynamic = deps.value177.current.get(options.file),
          value654: Dynamic = deps.value87.current.artboards.find(
            (input?: Dynamic): Dynamic => input.file === options.file,
          );
        if (!entry || !value654) return;
        let entry2: Dynamic = event.laidOut.get(options.file);
        entry2 ||
          ((entry2 = entry.isFreeCanvas(html).then(
            (input?: Dynamic): Dynamic => !input,
            (): Dynamic => false,
          )),
          event.laidOut.set(options.file, entry2));
        event.inFlight = Promise.all([options.opened, entry2])
          .then(
            ([input, input2]: Dynamic): Dynamic =>
              input && input2
                ? entry.dropPlanAt(
                    event.token,
                    {
                      x: context - value654.x,
                      y: value653 - value654.y,
                    },
                    [member],
                    extra,
                  )
                : null,
          )
          .then(
            (input?: Dynamic): Dynamic => {
              event.target === options &&
                (!input ||
                  !input.landing.some(
                    (input2?: Dynamic): Dynamic => input2.tid === 0,
                  )) &&
                entry.dropPlanClear(event.token);
            },
            (): Dynamic => {},
          )
          .finally((): Dynamic => {
            event.inFlight = null;
            let pending: Dynamic = event.pending;
            event.pending = null;
            pending &&
              event.target &&
              deps.value203.current === event &&
              deps.value206(
                event,
                event.target,
                pending.cx,
                pending.cy,
                pending.mode,
              );
          });
      }

/** 把画布对象（说明、图形或无框画板）拖过其他画板时运行：建立拖动会话、打开目标画板的移动宿主，并刷新落点预览。 */
export function trackObjectHoverOverArtboard(deps: { readonly value177: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value204: Dynamic; readonly value206: Dynamic; readonly value211: Dynamic; readonly value271: Dynamic; readonly value345: Dynamic }, event?: Dynamic): Dynamic {
        let current4: Dynamic = deps.value203.current;
        current4 &&
          current4.gestureKey !== event.key &&
          (deps.value204(), (current4 = null));
        let value653: Dynamic = deps.value202.current || deps.value345.current;
        if (!current4) {
          if (!event.target || value653) return;
          let state: Dynamic = {
              ew: event.at.w,
              eh: event.at.h,
              ox: 0,
              oy: 0,
              gx: event.point.x - event.at.x,
              gy: event.point.y - event.at.y,
            },
            state2: Dynamic = {
              gestureKey: event.key,
              token: randomSessionToken(),
              html: null,
              member: null,
              laidOut: new Map(),
              target: null,
              closing: new Map(),
              inFlight: null,
              pending: null,
            };
          deps.value203.current = state2;
          current4 = state2;
          deps.value211(event.object)
            .then((input?: Dynamic): Dynamic => {
              deps.value203.current === state2 &&
                ((state2.html = input),
                (state2.member = input
                  ? pastedElementGeometry(input, state)
                  : null));
            })
            .catch((): Dynamic => {});
        }
        let value654: Dynamic =
          event.target &&
          !value653 &&
          event.target !== deps.value271.current &&
          event.target !== ("file" in event.object ? event.object.file : null)
            ? event.target
            : null;
        current4.target && current4.target.file !== value654 && deps.value204();
        if (!!value654) {
          if (!current4.target) {
            let entry: Dynamic = deps.value177.current.get(value654),
              value655: Dynamic = current4;
            current4.target = {
              file: value654,
              opened: (current4.closing.get(value654) ?? Promise.resolve())
                .then(
                  (): Dynamic =>
                    entry?.moveHost(value655.token, "open") ?? false,
                )
                .catch((): Dynamic => false),
            };
          }
          deps.value206(
            current4,
            current4.target,
            event.point.x,
            event.point.y,
            event.ctrl ? "keep" : "flow",
          );
        }
      }

/** 画布对象在某画板上松手时运行（onDropObjectInto）：把说明、图片或无框画板内容作为元素插入目标画板，处理超时、只读与失败提示。 */
export function dropCanvasObjectIntoArtboard(deps: { readonly callback2: Dynamic; readonly callback7: Dynamic; readonly focusedFileRef: Dynamic; readonly selectionRef: Dynamic; readonly setSelection: Dynamic; readonly setShownFrameSelection: Dynamic; readonly showToast: Dynamic; readonly value144: Dynamic; readonly value155: Dynamic; readonly value157: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value204: Dynamic; readonly value213: Dynamic; readonly value271: Dynamic; readonly value276: Dynamic; readonly value345: Dynamic; readonly value432: Dynamic; readonly value459: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic }, input?: Dynamic): Dynamic {
        let {
          target: value653,
          point: value654,
          at: value655,
          ctrl: value656,
        }: Dynamic = input;
        if (deps.value345.current || value653 === deps.value271.current) return false;
        let value657: Dynamic = deps.value87.current.artboards.find(
            (input2?: Dynamic): Dynamic => input2.file === value653,
          ),
          entry: Dynamic = deps.value177.current.get(value653);
        if (
          !value657 ||
          value657.frameless ||
          !entry ||
          deps.value202.current ||
          deps.value155.current > 0
        )
          return false;
        let value658: Dynamic, value659: Dynamic, value660: Dynamic;
        if ("note" in input.object) {
          let value663: Dynamic = (deps.value73.current.annotations ?? []).find(
            (input2?: Dynamic): Dynamic => input2.id === input.object.note,
          );
          if (!value663) return false;
          let value664: Dynamic = deps.callback7(value663);
          if (!value664) return false;
          value658 = async (): Promise<Dynamic> => value664;
          value659 = {
            files: new Set(),
            notes: new Set([value663.id]),
          };
          value660 = value663.kind === "image" ? "image" : "note";
        } else {
          let file: Dynamic = input.object.file,
            entry2: Dynamic = deps.value177.current.get(file);
          if (
            !entry2 ||
            !deps.value73.current.artboards.find(
              (input2?: Dynamic): Dynamic => input2.file === file,
            )?.frameless
          )
            return false;
          value658 = (): Dynamic => entry2.pieceContent();
          value659 = {
            files: new Set([file]),
            notes: new Set(),
          };
          value660 = "piece";
        }
        let value661: Dynamic =
            deps.value203.current?.gestureKey === input.key
              ? deps.value203.current
              : null,
          value662: Dynamic =
            !!value661?.target && value661.target.file === value653;
        value661 && !value662 && deps.value204();
        deps.value203.current = null;
        deps.value202.current = true;
        (async (): Promise<Dynamic> => {
          try {
            let value663: Dynamic =
                (value661?.html ?? null) || (await value658()),
              value664: Dynamic = value663
                ? pastedRootElementCount(value663)
                : 0;
            if (!value663 || value664 !== 1) {
              value662 &&
                value661?.target &&
                value661.target.opened.then(
                  (): Dynamic => entry.moveHost(value661.token, "close"),
                );
              deps.value188(
                value663
                  ? uiMessage("canvas.designCanvas.nothingMovedThisPieceHolds") +
                      String(value664) +
                      " elements; a piece with one element can join an artboard."
                  : uiMessage("canvas.designCanvas.nothingMovedThis") +
                      value660 +
                      " has nothing that can go into an artboard.",
              );
              return;
            }
            let value665: Dynamic = value654.x - value657.x,
              value666: Dynamic = value654.y - value657.y,
              state: Dynamic = {
                ew: value655.w,
                eh: value655.h,
                ox: 0,
                oy: 0,
                gx: value654.x - value655.x,
                gy: value654.y - value655.y,
              },
              value667: Dynamic =
                value662 && value661
                  ? value661.token
                  : randomSessionToken(),
              flag2: Dynamic = false,
              flag3: Dynamic = false,
              value668: Dynamic = null,
              value669: Dynamic = pastedElementGeometry(
                value663,
                state,
              );
            if (
              value669 &&
              canFreezeSinglePaste(
                false,
                [0],
                value663,
                false,
              ) &&
              canFreezeSinglePaste(
                false,
                [0],
                value663,
                await entry.isFreeCanvas(value663),
              )
            ) {
              let value674: Dynamic = Date.now() + 1500,
                value675: Dynamic = Symbol(uiMessage("canvas.designCanvas.timedOut")),
                callback15: Dynamic = (input2?: Dynamic): Dynamic => {
                  let index: Dynamic = 0,
                    promise: Dynamic = new Promise(
                      (input3?: Dynamic): Dynamic => {
                        index = (window as Dynamic).setTimeout(
                          (): Dynamic => input3(value675),
                          Math.max(0, value674 - Date.now()),
                        );
                      },
                    );
                  return Promise.race([
                    input2.catch((): Dynamic => value675),
                    promise,
                  ]).finally(
                    (): Dynamic => (window as Dynamic).clearTimeout(index),
                  );
                };
              try {
                let value676: Dynamic = await callback15(
                    value662 && value661?.target
                      ? value661.target.opened
                      : (
                          value661?.closing.get(value653) ?? Promise.resolve()
                        ).then(
                          (): Dynamic => entry.moveHost(value667, "open"),
                        ),
                  ),
                  value677: Dynamic =
                    value676 === true
                      ? await callback15(
                          entry.dropPlanAt(
                            value667,
                            {
                              x: value665,
                              y: value666,
                            },
                            [value669],
                            value656 ? "keep" : "flow",
                          ),
                        )
                      : value676;
                if (value677 === value675) {
                  deps.value188(
                    uiMessage("canvas.designCanvas.nothingMoved2") +
                      deps.callback2(value653) +
                      " did not answer; try the drag again.",
                  );
                  return;
                }
                let value678: Dynamic = value677
                  ? (value677.landing.find(
                      (input2?: Dynamic): Dynamic => input2.tid === 0,
                    ) ?? null)
                  : null;
                if (value677 && value678) {
                  flag3 = true;
                  let value679: Dynamic = await deps.value157({
                    token: value667,
                    plans: new Map(),
                    unanswered: [],
                    canvasMoved: false,
                    copy: false,
                    canvas: (): Dynamic => {},
                    travel: {
                      target: value653,
                      pureTarget: true,
                      plan: value677,
                      travellers: [
                        {
                          file: "<canvas>",
                          external: true,
                          members: [
                            {
                              tid: 0,
                              index: 0,
                              html: value663,
                            },
                          ],
                        },
                      ],
                      endHome: (): Dynamic => {},
                    },
                  });
                  flag2 = value679.written.includes(value653);
                  flag2 &&
                    ((value668 = value679.selection),
                    entry.dropPlanClear(value667, true));
                }
              } finally {
                let callback16: Dynamic = (): Dynamic => {
                  entry.dropPlanClear(value667);
                  entry.moveHost(value667, "close");
                };
                flag2
                  ? (window as Dynamic).setTimeout(callback16, 150)
                  : callback16();
              }
            }
            if (!flag2 && flag3) return;
            let value670: Dynamic = null;
            if (!flag2) {
              let value674: Dynamic = deps.value432.current?.group([value653], {
                bound: value667,
              });
              try {
                let value675: Dynamic = await entry.insertHtml(
                  positionPastedHtml(value663, {
                    ew: state.ew,
                    ox: value665 - state.gx,
                    oy: value666 - state.gy,
                  }),
                  "root-end",
                );
                flag2 = value675.length > 0;
                flag2 &&
                  ((value670 = value675),
                  entry.setShownSelection(value675, deps.value19(value653)));
              } finally {
                value674?.settled(value653);
                value674?.end();
                if (value662 && value661?.target) {
                  let target: Dynamic = value661.target;
                  entry.dropPlanClear(value661.token);
                  target.opened
                    .then(
                      (): Dynamic => entry.moveHost(value661.token, "close"),
                    )
                    .catch((): Dynamic => false);
                }
              }
            }
            if (!flag2) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotMoveNothingChanged"));
              return;
            }
            deps.value276.current = {
              file: value653,
              at: Date.now(),
            };
            let value671: Dynamic = value670
                ? selectionFromElements(value653, {
                    name: deps.value19(value653),
                    tids: value670,
                    rect: null,
                    count: value670.length,
                  })
                : (value668 ?? deps.selectionRef.current),
              value672: Dynamic = filterSelectedAnnotations(
                filterSelectedArtboards(
                  value671,
                  (input2?: Dynamic): Dynamic => !value659.files.has(input2),
                ),
                (input2?: Dynamic): Dynamic => !value659.notes.has(input2),
              ),
              value673: Dynamic =
                value659.files.size > 0 ? deps.value144(value667) : null;
            if (!deps.value459.current(value659, value667)) {
              await deps.value213(value653, value667, value660);
              deps.value188(
                uiMessage("canvas.designCanvas.nothingMovedThe") +
                  value660 +
                  " could not leave the canvas.",
              );
              return;
            }
            deps.value189(uiMessage("canvas.designCanvas.movedInto") + deps.callback2(value653));
            if (value673) {
              deps.value155.current++;
              try {
                await value673;
              } finally {
                deps.value155.current--;
              }
            }
            deps.setSelection(value672);
            (window as Dynamic).setTimeout((): Dynamic => {
              deps.setSelection(value672);
              let value674: Dynamic =
                value672.elements.get(value653)?.tids ?? null;
              value653 === deps.focusedFileRef.current
                ? deps.setShownFrameSelection(value653, value674)
                : entry.setShownSelection(
                    value674,
                    value674 ? deps.value19(value653) : null,
                  );
            }, 160);
          } catch (value663: Dynamic) {
            deps.showToast(
              uiMessage("canvas.designCanvas.couldnTFinishTheDrop2") + String(value663),
              "error",
            );
            if (value662 && value661?.target) {
              let target: Dynamic = value661.target;
              entry.dropPlanClear(value661.token);
              target.opened
                .then((): Dynamic => entry.moveHost(value661.token, "close"))
                .catch((): Dynamic => false);
            }
          } finally {
            deps.value202.current = false;
          }
        })();
        return true;
      }

/** 从聚焦画板拖出的元素松手时运行：落在空白处则新建画板，落在另一画板则移动或复制进去，失败时回滚并提示。 */
export function dropElementDragAtCanvasPoint(deps: { readonly abandonSelectionGesture: Dynamic; readonly callback2: Dynamic; readonly callback3: Dynamic; readonly doc: Dynamic; readonly setSelection: Dynamic; readonly showToast: Dynamic; readonly supportsLoadState: Dynamic; readonly value125: Dynamic; readonly value127: Dynamic; readonly value155: Dynamic; readonly value156: Dynamic; readonly value157: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value189: Dynamic; readonly value19: Dynamic; readonly value202: Dynamic; readonly value203: Dynamic; readonly value271: Dynamic; readonly value276: Dynamic; readonly value345: Dynamic; readonly value396: Dynamic; readonly value432: Dynamic; readonly value62: Dynamic; readonly value73: Dynamic; readonly value87: Dynamic; readonly value98: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic): Dynamic {
        let value654: Dynamic =
          deps.value203.current?.gestureKey === input.key
            ? deps.value203.current
            : null;
        deps.value203.current = null;
        let callback15: Dynamic = (input2?: Dynamic): Dynamic => {
          let value656: Dynamic = value654?.target;
          if (!value654 || !value656 || value656.file === input2) return;
          let entry3: Dynamic = deps.value177.current.get(value656.file);
          entry3?.dropPlanClear(value654.token);
          value654.closing.set(
            value656.file,
            value656.opened
              .then((): Dynamic => entry3?.moveHost(value654.token, "close"))
              .catch((): Dynamic => false),
          );
          value654.target = null;
        };
        if (deps.value345.current) {
          callback15();
          deps.value188(
            uiMessage("canvas.designCanvas.nothingMovedOnlyThisArtboard"),
          );
          return;
        }
        let value655: Dynamic = [...deps.value87.current.artboards]
          .reverse()
          .find(
            (input2?: Dynamic): Dynamic =>
              !(input2.frameless && input2.file !== deps.value125.current) &&
              options >= input2.x &&
              options <= input2.x + input2.w &&
              context >= input2.y &&
              context <= input2.y + input2.h,
          );
        callback15(value655?.file);
        if (value655 != null && value655.file === deps.value271.current) {
          callback15();
          deps.value188(
            uiMessage("canvas.designCanvas.nothingMovedThatArtboardIs"),
          );
          return;
        }
        if (!value655) {
          let entry3: Dynamic = deps.value177.current.get(input.file);
          if (!entry3 || deps.value202.current || deps.value155.current > 0) return;
          deps.value202.current = true;
          let value656: Dynamic;
          (async (): Promise<Dynamic> => {
            try {
              let value657: Dynamic = input.box ?? {
                  w: 320,
                  h: 200,
                  ew: 320,
                  eh: 200,
                  ox: 0,
                  oy: 0,
                  gx: 160,
                  gy: 100,
                },
                value658: Dynamic = entry3.serializeSelection(input.tids, {
                  lift: value657,
                });
              if (!value658) {
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedRepeatedOrRoot"),
                );
                return;
              }
              let files: Dynamic = deps.doc.content().files;
              if (
                Object.keys(files).length >=
                PlatformFileContentFilesValue
              ) {
                deps.showToast(
                  uiMessage("canvas.designCanvas.couldnTMakeANew") +
                    String(PlatformFileContentFilesValue) +
                    "-file limit; delete something first",
                  "error",
                );
                return;
              }
              await entry3.flushPending();
              let value659: Dynamic =
                  (await getKvClient().get(
                    PlatformFileContentHandler_4(input.file),
                  )) ??
                  files[input.file] ??
                  "",
                value660: Dynamic = uniqueArtboardFile(
                  files,
                  "Piece",
                  deps.supportsLoadState,
                ),
                value661: Dynamic = buildDcDocument(
                  value658,
                  typeof value659 == "string" ? value659 : "",
                );
              await getKvClient().set(
                PlatformFileContentHandler_4(value660),
                value661,
              );
              deps.value127.current.set(value660, Date.now());
              let state: Dynamic = {
                  file: value660,
                  x: Math.round(options - value657.gx),
                  y: Math.round(context - value657.gy),
                  w: Math.min(
                    PlatformFileContentLimit_6,
                    Math.max(
                      PlatformFileContentConstant_17,
                      value657.w,
                    ),
                  ),
                  h: Math.min(
                    PlatformFileContentLimit_6,
                    Math.max(
                      PlatformFileContentConstant_17,
                      value657.h,
                    ),
                  ),
                  title: uniqueElementArtboardTitle(
                    input.label,
                    deps.value73.current.artboards,
                  ),
                  frameless: true,
                  ...deps.callback3(),
                },
                value662: Dynamic = value653
                  ? undefined
                  : randomSessionToken();
              value653 ||
                (value656 = deps.value156(CanvasWorkingStateConstant_8));
              deps.value396.current(
                {
                  kind: "add",
                  entries: [
                    {
                      file: value660,
                      src: value661,
                      spec: state,
                    },
                  ],
                },
                new Set([value660]),
                undefined,
                value662,
              );
              deps.value98({
                artboards: [
                  ...deps.value73.current.artboards.filter(
                    (input2?: Dynamic): Dynamic => input2.file !== value660,
                  ),
                  state,
                ],
              });
              if (!value653) {
                let value663: Dynamic = deps.value432.current?.group(
                    [input.file],
                    {
                      bound: value662,
                      atomic: true,
                    },
                  ),
                  flag2: Dynamic = false;
                try {
                  flag2 = await entry3.removeSelection(input.tids);
                } finally {
                  value663?.end();
                }
                if (!flag2) {
                  deps.value188(
                    uiMessage("canvas.designCanvas.copiedOntoTheCanvasThe"),
                  );
                  return;
                }
              }
              deps.value189((value653 ? "Copied" : "Moved") + " onto the canvas");
              deps.abandonSelectionGesture();
              deps.value62();
              deps.setSelection(
                selectionFromArtboards(new Set([value660])),
              );
            } catch (value657: Dynamic) {
              deps.showToast(
                uiMessage("canvas.designCanvas.couldnTFinishTheDrop2") + String(value657),
                "error",
              );
            } finally {
              value656?.();
              deps.value202.current = false;
            }
          })();
          return;
        }
        if (value655.file === input.file) {
          deps.value188(
            uiMessage("canvas.designCanvas.releasedOverTheSameArtboard"),
          );
          return;
        }
        let entry: Dynamic = deps.value177.current.get(input.file),
          entry2: Dynamic = deps.value177.current.get(value655.file);
        if (!entry || !entry2 || deps.value202.current || deps.value155.current > 0) {
          callback15();
          return;
        }
        deps.value202.current = true;
        (async (): Promise<Dynamic> => {
          let value656: Dynamic = value654?.target?.file === value655.file,
            value657: Dynamic,
            value658: Dynamic;
          try {
            let value659: Dynamic = entry.serializeSelection(input.tids, {
              bakeProps: true,
              vals: await entry.renderDefaults(),
            });
            if (!value659) {
              deps.value188(
                uiMessage("canvas.designCanvas.nothingMovedRepeatedOrRoot"),
              );
              return;
            }
            let box: Dynamic = input.box,
              value660: Dynamic = options - value655.x,
              value661: Dynamic = context - value655.y,
              value662: Dynamic = box
                ? pastedElementGeometry(value659, box)
                : null,
              flag2: Dynamic = false;
            if (
              value662 &&
              canFreezeSinglePaste(
                value653,
                input.tids,
                value659,
                false,
              ) &&
              canFreezeSinglePaste(
                value653,
                input.tids,
                value659,
                await entry2.isFreeCanvas(value659),
              )
            ) {
              let value665: Dynamic =
                value656 && value654
                  ? value654.token
                  : randomSessionToken();
              value656 = false;
              let value666: Dynamic = Date.now() + 1500,
                value667: Dynamic = Symbol(uiMessage("canvas.designCanvas.timedOut")),
                callback16: Dynamic = (input2?: Dynamic): Dynamic => {
                  let index: Dynamic = 0,
                    promise: Dynamic = new Promise(
                      (input3?: Dynamic): Dynamic => {
                        index = (window as Dynamic).setTimeout(
                          (): Dynamic => input3(value667),
                          Math.max(0, value666 - Date.now()),
                        );
                      },
                    );
                  return Promise.race([
                    input2.catch((): Dynamic => value667),
                    promise,
                  ]).finally(
                    (): Dynamic => (window as Dynamic).clearTimeout(index),
                  );
                },
                flag3: Dynamic = false;
              try {
                let value668: Dynamic = await callback16(
                    (
                      value654?.closing.get(value655.file) ??
                      Promise.resolve()
                    ).then((): Dynamic => entry2.moveHost(value665, "open")),
                  ),
                  value669: Dynamic =
                    value668 === true
                      ? await callback16(
                          entry2.dropPlanAt(
                            value665,
                            {
                              x: value660,
                              y: value661,
                            },
                            [value662],
                            input.ctrl ? "keep" : "flow",
                          ),
                        )
                      : value668;
                if (value669 === value667) {
                  deps.value188(
                    uiMessage("canvas.designCanvas.nothingMoved2") +
                      deps.callback2(value655.file) +
                      " did not answer; try the drag again.",
                  );
                  return;
                }
                let value670: Dynamic = value669
                  ? (value669.landing.find(
                      (input2?: Dynamic): Dynamic => input2.tid === 0,
                    ) ?? null)
                  : null;
                flag2 = !value670;
                if (value669 && value670) {
                  let value671: Dynamic = await deps.value157({
                    token: value665,
                    plans: new Map(),
                    unanswered: [],
                    canvasMoved: false,
                    copy: false,
                    canvas: (): Dynamic => {},
                    travel: {
                      target: value655.file,
                      pureTarget: true,
                      plan: value669,
                      travellers: [
                        {
                          file: input.file,
                          members: [
                            {
                              tid: input.tids[0],
                              index: 0,
                            },
                          ],
                        },
                      ],
                      endHome: (): Dynamic => {},
                    },
                  });
                  deps.value276.current = {
                    file: value655.file,
                    at: Date.now(),
                  };
                  flag3 = value671.written.includes(value655.file);
                  flag3 && entry2.dropPlanClear(value665, true);
                  flag3 &&
                    value671.written.includes(input.file) &&
                    deps.value189(uiMessage("canvas.designCanvas.movedTo") + deps.callback2(value655.file));
                  return;
                }
              } finally {
                let callback17: Dynamic = (): Dynamic => {
                  entry2.dropPlanClear(value665);
                  entry2.moveHost(value665, "close");
                };
                flag3
                  ? (window as Dynamic).setTimeout(callback17, 150)
                  : callback17();
              }
            }
            let value663: Dynamic = box
              ? {
                  ew: box.ew,
                  ox: value660 - box.gx + box.ox,
                  oy: value661 - box.gy + box.oy,
                }
              : {
                  ox: value660,
                  oy: value661,
                };
            value653 ||
              ((value657 = deps.value432.current?.group(
                [value655.file, input.file],
                {
                  atomic: true,
                  holder: value655.file,
                  waiting: [input.file],
                },
              )),
              (value658 = deps.value156(CanvasWorkingStateConstant_8)));
            let value664: Dynamic = flag2
              ? await entry2.insertHtml(
                  positionPastedHtml(value659, value663),
                  "root-end",
                )
              : await entry2.insertHtml(value659, "root-end", value663);
            deps.value276.current = {
              file: value655.file,
              at: Date.now(),
            };
            if (value664.length === 0) {
              deps.value188(uiMessage("canvas.designCanvas.couldNotMoveNothingChanged"));
              return;
            }
            if (value653)
              deps.value189(
                uiMessage("canvas.designCanvas.copiedTo") + value655.file.replace(/\.dc\.html$/, ""),
              );
            else {
              value657?.admit(input.file);
              if (!(await entry.removeSelection(input.tids))) {
                value657?.end();
                let value665: Dynamic =
                    value657?.discard(value655.file) ?? null,
                  value666: Dynamic = value665
                    ? await entry2
                        .applyHistory(deps.value19(value655.file), "undo")
                        .catch((): Dynamic => false)
                    : false;
                value665 && !value666 && value665();
                value666 && entry2.dropRedo();
                deps.value188(
                  value666
                    ? uiMessage("canvas.designCanvas.couldNotMoveReverted")
                    : uiMessage("canvas.designCanvas.moveFailedHalfwayCheckBoth"),
                );
                return;
              }
              deps.value189(uiMessage("canvas.designCanvas.movedTo") + deps.callback2(value655.file));
            }
            deps.abandonSelectionGesture();
            deps.setSelection(
              setCanvasElementSelection(
                emptyCanvasSelection,
                value655.file,
                {
                  name: deps.value19(value655.file),
                  tids: value664,
                  rect: null,
                  count: value664.length,
                },
                false,
              ),
            );
            entry2.setShownSelection(value664, deps.value19(value655.file));
          } finally {
            value657?.end();
            value658?.();
            if (value656 && value654) {
              entry2.dropPlanClear(value654.token);
              let target: Dynamic = value654.target;
              value654.closing.set(
                value655.file,
                (target?.opened ?? Promise.resolve(true))
                  .then(
                    (): Dynamic => entry2.moveHost(value654.token, "close"),
                  )
                  .catch((): Dynamic => false),
              );
            }
            deps.value202.current = false;
          }
        })();
      }

/** 画板 iframe 上报元素拖动事件（arm/move/exit/finish/cancel）时运行：维护拖出会话状态，松手时调用 dropElementDragAtCanvasPoint。 */
export function handleFrameElementDragEvent(deps: { readonly focusedFileRef: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value193: Dynamic; readonly value195: Dynamic; readonly value197: Dynamic; readonly value198: Dynamic; readonly value200: Dynamic; readonly value201: Dynamic; readonly value205: Dynamic; readonly value207: Dynamic; readonly value208: Dynamic; readonly value209: Dynamic; readonly value210: Dynamic; readonly value215: Dynamic; readonly value216: Dynamic; readonly value217: Dynamic; readonly value218: Dynamic; readonly value67: Dynamic }, input?: Dynamic, options?: Dynamic): Dynamic {
        let current4: Dynamic = deps.value193.current;
        if (options.type === "arm") {
          if (
            input !== deps.focusedFileRef.current ||
            deps.value218.current ||
            (current4 &&
              current4.file === input &&
              current4.key !== options.key &&
              deps.value208(),
            deps.value209(),
            !options.tids)
          )
            return;
          let value657: Dynamic = deps.value217(input, options.tids);
          if (!value657) return;
          deps.value216.current = {
            key: options.key,
            file: input,
            tids: value657.tids,
            alt: options.alt,
            box: options.box,
            label: value657.label,
          };
          deps.value198(deps.value216.current);
          deps.value205(deps.value216.current);
          deps.value200(input);
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value209, 6e4);
          return;
        }
        if (options.type === "disarm") {
          let current5: Dynamic = deps.value216.current;
          current5 &&
            current5.file === input &&
            current5.key === options.key &&
            deps.value209();
          current4 && current4.file === input && current4.key === options.key
            ? (current4.pendingDrop &&
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedTheArtboardEnded"),
                ),
              deps.value208())
            : !current4 && !deps.value216.current && deps.value200(null);
          return;
        }
        if (options.type === "exit") {
          if (input !== deps.focusedFileRef.current) return;
          if (current4) {
            if (current4.file === input) {
              if (current4.key !== options.key) return;
              current4.echoed = true;
              let pendingDrop: Dynamic = current4.pendingDrop;
              if (!pendingDrop) {
                deps.value198(current4);
                return;
              }
              deps.value208(true);
              deps.value177.current.get(input)?.hostDrag("finish", current4.key);
              deps.value215(
                current4,
                pendingDrop.cx,
                pendingDrop.cy,
                pendingDrop.alt,
              );
              return;
            }
            deps.value208();
          }
          if (deps.value218.current) return;
          let value657: Dynamic = deps.value217(input, options.tids);
          if (!value657) return;
          deps.value193.current = {
            key: options.key,
            file: input,
            tids: value657.tids,
            alt: options.alt,
            ctrl: false,
            box: options.box,
            label: value657.label,
            moves: [],
            latched: false,
            startedAt: Date.now(),
            echoed: true,
            pendingDrop: null,
          };
          deps.value198(deps.value193.current);
          deps.value200(input);
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value210, 3e4);
          return;
        }
        if (
          !current4 ||
          current4.key !== options.key ||
          current4.file !== input
        )
          return;
        if (options.type === "cancel") {
          deps.value208();
          return;
        }
        let value653: Dynamic = deps.value67.artboards.find(
          (input2?: Dynamic): Dynamic => input2.file === input,
        );
        if (!value653) return;
        let value654: Dynamic = value653.x + options.x,
          value655: Dynamic = value653.y + options.y;
        if (current4.pendingDrop) return;
        if (options.type === "move") {
          let value657: Dynamic = Date.now();
          for (
            current4.moves.push(value657);
            current4.moves.length > 0 &&
            (current4.moves[0] < value657 - 1e3 ||
              current4.moves.length > 240);

          )
            current4.moves.shift();
          current4.moves.length > 120 && (current4.latched = true);
          deps.value201.current && clearTimeout(deps.value201.current);
          deps.value201.current = setTimeout(deps.value210, 3e4);
          current4.latched ||
            deps.value195(deps.value197(current4, value654, value655, options.alt));
          current4.ctrl = options.ctrl;
          deps.value207(current4, value654, value655, options.alt);
          return;
        }
        let value656: Dynamic = current4.moves.length > 0;
        deps.value208(value656);
        value656 &&
          ((current4.ctrl = options.ctrl),
          deps.value215(current4, value654, value655, options.alt));
      }

/** 外壳侧指针接管元素拖动后运行（onHostDrag：stale/move/exit/cancel/finish）：更新拖出会话与幽灵位置，松手时提交落点。 */
export function handleHostElementDragEvent(deps: { readonly focusedFileRef: Dynamic; readonly value177: Dynamic; readonly value188: Dynamic; readonly value193: Dynamic; readonly value195: Dynamic; readonly value197: Dynamic; readonly value201: Dynamic; readonly value207: Dynamic; readonly value208: Dynamic; readonly value209: Dynamic; readonly value210: Dynamic; readonly value215: Dynamic; readonly value216: Dynamic }, input?: Dynamic,
        options?: Dynamic,
        context?: Dynamic,
        value653?: Dynamic,
        extra: Dynamic = false): Dynamic {
        let current4: Dynamic = deps.value193.current,
          current5: Dynamic = deps.value216.current,
          value654: Dynamic = current4 ?? current5,
          value655: Dynamic = value654
            ? deps.value177.current.get(value654.file)
            : undefined;
        if (!current4?.pendingDrop) {
          if (input === "stale") {
            deps.value210();
            return;
          }
          if (input === "move") {
            if (!current4) {
              if (!current5 || current5.file !== deps.focusedFileRef.current)
                return;
              current4 = {
                ...current5,
                alt: value653,
                ctrl: extra,
                moves: [],
                latched: false,
                startedAt: Date.now(),
                echoed: false,
                pendingDrop: null,
              };
              deps.value193.current = current4;
              value655?.hostDrag("exit", current5.key, value653);
            }
            current4.moves.push(Date.now());
            current4.moves.length > 240 && current4.moves.shift();
            deps.value201.current && clearTimeout(deps.value201.current);
            deps.value201.current = setTimeout(deps.value210, 3e4);
            deps.value195(deps.value197(current4, options, context, value653));
            current4.ctrl = extra;
            deps.value207(current4, options, context, value653);
            return;
          }
          deps.value209();
          if (!current4) {
            current5 && value655?.hostDrag("cancel", current5.key);
            return;
          }
          current4.ctrl = extra;
          if (input === "cancel" || current4.moves.length === 0) {
            deps.value208();
            value655?.hostDrag("cancel", current4.key);
            return;
          }
          if (!current4.echoed) {
            current4.pendingDrop = {
              cx: options,
              cy: context,
              alt: value653,
            };
            deps.value195(null);
            deps.value201.current && clearTimeout(deps.value201.current);
            deps.value201.current = setTimeout((): Dynamic => {
              deps.value193.current?.pendingDrop &&
                deps.value188(
                  uiMessage("canvas.designCanvas.nothingMovedTheArtboardDid"),
                );
              deps.value210();
            }, 1500);
            return;
          }
          deps.value208(true);
          value655?.hostDrag("finish", current4.key);
          deps.value215(current4, options, context, value653);
        }
      }
