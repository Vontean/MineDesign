import { CanvasWorkingStateConstant_8 as holdWorkingValue } from "../working-state";
import { PlatformFileContentConstant_16 as minArtboardEdge } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { PlatformFileContentHandler_4 } from "../../platform/file-content";
import { PlatformFileContentLimit_6 as maxArtboardEdge } from "../../platform/file-content";
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
    let { w: viewportWidth, h: viewportHeight, top: topInset }: Dynamic = deps.value120(),
      state: Dynamic = {
        x: deps.value103.x,
        y: deps.value103.y + topInset / deps.value103.scale,
        w: viewportWidth / deps.value103.scale,
        h: (viewportHeight - topInset) / deps.value103.scale,
      },
      visibleFiles: Dynamic = deps.value347
        ? [deps.value347.file]
        : deps.value86.artboards
            .filter(
              (artboard?: Dynamic): Dynamic =>
                distanceBetweenRects(artboard, state) === 0,
            )
            .map((artboard?: Dynamic): Dynamic => artboard.file),
      selectedPaths: Dynamic = [],
      selectedElements: Dynamic = [],
      showSelection: Dynamic = !deps.value347 || (deps.flag && deps.value356);
    if (deps.selection.primary != null && showSelection) {
      let orderedKeys: Dynamic = [...deps.selection.elements.keys()].filter(
        (key?: Dynamic): Dynamic => key !== deps.selection.primary,
      );
      orderedKeys.push(deps.selection.primary);
      for (let selectedFile of orderedKeys as Dynamic) {
        let tids: Dynamic = deps.selection.elements.get(selectedFile)?.tids ?? [],
          encodedFile: Dynamic = encodeArtboardSelectionPath(
            selectedFile,
          );
        if (encodedFile !== null)
          for (let viewEntry of (deps.value177.current
            .get(selectedFile)
            ?.viewEntries(tids) ?? []) as Dynamic) {
            let elementPath: Dynamic = encodedFile + "#" + viewEntry.path;
            encodedElementPathPattern.test(elementPath) &&
              (selectedPaths.push(elementPath),
              selectedElements.push({
                id: elementPath,
                kind: viewEntry.kind,
                words: viewEntry.words,
              }));
          }
      }
    }
    let selectedBoardFiles: Dynamic = showSelection ? [...deps.value168, ...deps.value172] : [],
      publisher: Dynamic = deps.value365.current;
    if (publisher === null) return;
    let snapshot: Dynamic = {
        mode: deps.value347 ? "focused" : "canvas",
        page: deps.value79 === "" ? null : deps.value79,
        pageName: {
          text: deps.value79 === "" ? "" : deps.value81,
        },
        visibleArtboards: normalizeSelectedArtboardPaths(
          visibleFiles,
        ),
        selectedArtboards: normalizeSelectedArtboardPaths(
          selectedBoardFiles,
        ),
        ...getEmbeddedPresence(),
        dirty: deps.value375,
        selected: selectedPaths.slice(-20),
        selection: selectedElements.slice(-5).map(
          (source?: Dynamic): Dynamic => ({
            id: source.id,
            kind: source.kind,
            label: source.words(artboardTextSnapshotLimit),
          }),
        ),
      },
      errorEntries: Dynamic = deps.value266.flatMap((problem?: Dynamic): Dynamic => {
        let encodedName: Dynamic = encodeArtboardSelectionPath(
          problem.file,
        );
        return encodedName === null
          ? []
          : [
              {
                name: encodedName,
                first: problem.messages[0] ?? "",
              },
            ];
      }),
      firstError: Dynamic = errorEntries[0]?.first ?? "",
      erroredArtboards: Dynamic = serializeArtboardErrorContext(
        errorEntries.map((entry?: Dynamic): Dynamic => entry.name),
        firstError,
        snapshot,
      );
    publisher.report(
      erroredArtboards.length === 0
        ? snapshot
        : {
            ...snapshot,
            erroredArtboards: erroredArtboards,
            firstError: {
              text: firstError,
            },
          },
    );
  }

/** 文档或页面变化时计算（useMemo）：为 HostedEditor 提供画布接口，包括画板列表、分组、撤销重做、显示/聚焦、放置、重命名、新增、复制与删除。 */
export function buildHostedEditorCanvasApi(deps: { readonly doc: Dynamic; readonly supportsLoadState: Dynamic; readonly value155: Dynamic; readonly value156: Dynamic; readonly value202: Dynamic; readonly value274: Dynamic; readonly value383: Dynamic; readonly value396: Dynamic; readonly value405: Dynamic; readonly value406: Dynamic; readonly value409: Dynamic; readonly value410: Dynamic; readonly value432: Dynamic; readonly value440: Dynamic; readonly value447: Dynamic; readonly value450: Dynamic; readonly value451: Dynamic; readonly value452: Dynamic; readonly value453: Dynamic; readonly value73: Dynamic; readonly value80: Dynamic; readonly value98: Dynamic }): Dynamic {
      let waitUntil: Dynamic = async (
          condition?: Dynamic,
          timeoutMs: Dynamic = 5e3,
        ): Promise<Dynamic> => {
          let startedAt: Dynamic = Date.now();
          for (; !condition(); ) {
            if (Date.now() - startedAt > timeoutMs) return false;
            await new Promise(
              (resolve?: Dynamic): Dynamic => setTimeout(resolve, 40),
            );
          }
          return true;
        },
        currentPageBoards: Dynamic = (): Dynamic =>
          designPageContents(deps.value73.current, deps.value80.current)
            .artboards,
        clampBoardSize: Dynamic = (size?: Dynamic): Dynamic =>
          Math.min(
            maxArtboardEdge,
            Math.max(
              minArtboardEdge,
              Math.round(size),
            ),
          );
      return {
        boards: (): Dynamic =>
          currentPageBoards().map(
            (board?: Dynamic): Dynamic => ({
              file: board.file,
              x: board.x,
              y: board.y,
              w: board.w,
              h: board.h,
              title: board.title ?? board.file.replace(/\.dc\.html$/, ""),
            }),
          ),
        pageIs: (pageId?: Dynamic): Dynamic =>
          isCanvasPageMatch(
            pageId,
            deps.value80.current,
            deps.value73.current.pages?.[0]?.id ?? "",
          ),
        token: (): Dynamic => randomSessionToken(),
        group: (files?: Dynamic, bound?: Dynamic): Dynamic =>
          deps.value432.current?.group(
            files,
            bound !== undefined
              ? {
                  bound: bound,
                }
              : undefined,
          ) ?? null,
        hold: async (): Promise<Dynamic> => (
          await waitUntil(
            (): Dynamic =>
              deps.value155.current <= 0 &&
              !deps.value202.current &&
              !(deps.value432.current?.busy() ?? false),
          ),
          deps.value156(holdWorkingValue)
        ),
        undo: (): Dynamic => deps.value447.current?.undo(),
        redo: (): Dynamic => deps.value447.current?.redo(),
        mark: (): Dynamic => {
          let undoStack: Dynamic = deps.value405.current,
            lastEntry: Dynamic = undoStack[undoStack.length - 1];
          lastEntry !== undefined &&
            !deps.value453.has(lastEntry) &&
            deps.value453.set(lastEntry, deps.value453.next++);
          return (
            String(undoStack.length) +
            ":" +
            (lastEntry === undefined ? "" : String(deps.value453.get(lastEntry))) +
            "/" +
            String(deps.value406.current.length) +
            "|" +
            [...deps.value440.current]
              .filter(([, count]: Dynamic): Dynamic => count !== 0)
              .map(
                ([name, count]: Dynamic): Dynamic =>
                  name + "=" + String(count),
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
            (sum?: Dynamic, count?: Dynamic): Dynamic => sum + count,
            0,
          ),
        revealRect: (rect?: Dynamic): Dynamic => {
          deps.value383.current?.({
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h,
          });
        },
        reveal: (file?: Dynamic): Dynamic => {
          let artboard: Dynamic = deps.value73.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          );
          artboard !== undefined &&
            deps.value383.current?.({
              x: artboard.x,
              y: artboard.y,
              w: artboard.w,
              h: artboard.h,
            });
        },
        focus: (file?: Dynamic): Dynamic => {
          deps.value274.current(file);
        },
        place: (placements?: Dynamic, historyContext?: Dynamic): Dynamic => {
          let changes: Dynamic = [],
            updatedBoards: Dynamic = deps.value73.current.artboards.map(
              (board?: Dynamic): Dynamic => {
                let placement: Dynamic = placements.find(
                  (candidate?: Dynamic): Dynamic => candidate.file === board.file,
                );
                if (placement === undefined) return board;
                let state: Dynamic = {};
                placement.x !== undefined &&
                  Math.round(placement.x) !== Math.round(board.x) &&
                  (state.x = Math.round(placement.x));
                placement.y !== undefined &&
                  Math.round(placement.y) !== Math.round(board.y) &&
                  (state.y = Math.round(placement.y));
                placement.w !== undefined &&
                  board.frameless !== true &&
                  clampBoardSize(placement.w) !== Math.round(board.w) &&
                  (state.w = clampBoardSize(placement.w));
                placement.h !== undefined &&
                  board.frameless !== true &&
                  clampBoardSize(placement.h) !== Math.round(board.h) &&
                  (state.h = clampBoardSize(placement.h));
                let changedKeys: Dynamic = Object.keys(state);
                return changedKeys.length === 0
                  ? board
                  : (changes.push({
                      file: board.file,
                      from: Object.fromEntries(
                        changedKeys.map(
                          (key?: Dynamic): Dynamic => [
                            key,
                            board[key],
                          ],
                        ),
                      ),
                      to: state,
                    }),
                    {
                      ...board,
                      ...state,
                    });
              },
            );
          return changes.length === 0
            ? []
            : (deps.value396.current(
                {
                  kind: "transform",
                  get label() { return uiMessage("canvas.designCanvas.resize"); },
                  boards: changes,
                  anns: [],
                },
                new Set(),
                undefined,
                historyContext,
              ),
              deps.value98({
                artboards: updatedBoards,
              }),
              changes.map((change?: Dynamic): Dynamic => change.file));
        },
        rename: (
          file?: Dynamic,
          newTitle?: Dynamic,
          historyContext?: Dynamic,
        ): Dynamic => {
          let cleanTitle: Dynamic = PlatformFileContentSlice(
              newTitle,
            ),
            board: Dynamic = deps.value73.current.artboards.find(
              (item?: Dynamic): Dynamic => item.file === file,
            );
          if (cleanTitle === undefined || board === undefined) return false;
          let storedTitle: Dynamic =
            cleanTitle !== file.replace(/\.dc\.html$/, "")
              ? cleanTitle
              : undefined;
          return (board.title ?? undefined) === storedTitle
            ? false
            : (deps.value396.current(
                {
                  kind: "rename",
                  file: file,
                  from: board.title,
                  to: storedTitle,
                },
                new Set(),
                undefined,
                historyContext,
              ),
              deps.value98({
                artboards: deps.value73.current.artboards.map(
                  (item?: Dynamic): Dynamic => {
                    if (item.file !== file) return item;
                    let { title: oldTitle, ...boardWithoutTitle }: Dynamic = item;
                    return storedTitle !== undefined
                      ? {
                          ...boardWithoutTitle,
                          title: storedTitle,
                        }
                      : boardWithoutTitle;
                  },
                ),
              }),
              true);
        },
        add: async (newBoards?: Dynamic, historyContext?: Dynamic): Promise<Dynamic> => {
          let pageRulePattern: Dynamic =
              /^\/\*ask:page\*\/body\{(?:(?:background|color):(?:#[0-9a-fA-F]{3,8}|[a-z]{3,24}|(?:rgb|rgba|hsl|hsla)\([0-9.,%\s-]{1,60}(?:deg)?[0-9.,%\s-]{0,60}\))|font-family:(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})(?:,(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})){0,2})(?:;(?:(?:background|color):(?:#[0-9a-fA-F]{3,8}|[a-z]{3,24}|(?:rgb|rgba|hsl|hsla)\([0-9.,%\s-]{1,60}(?:deg)?[0-9.,%\s-]{0,60}\))|font-family:(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})(?:,(?:"[A-Za-z0-9 \-]{1,40}"|[a-z-]{1,12})){0,2})){0,2}\}\/\*ask:page-end\*\/$/i,
            state: Dynamic = {
              ...deps.doc.content().files,
            },
            allBoards: Dynamic = [...currentPageBoards()],
            createdEntries: Dynamic = [];
          for (let newBoard of newBoards as Dynamic) {
            let newFile: Dynamic = uniqueArtboardFile(
                state,
                "Artboard",
                deps.supportsLoadState,
              ),
              baseDocument: Dynamic = pageRulePattern.test(newBoard.pageRule ?? "")
                ? blankDcDocument().replace(
                    /[ \t]*<\/style>/,
                    (closingStyle?: Dynamic): Dynamic =>
                      newBoard.pageRule +
                      `
` +
                      closingStyle,
                  )
                : blankDcDocument(),
              source: Dynamic =
                newBoard.body.trim() === ""
                  ? baseDocument
                  : baseDocument.replace(
                      /[ \t]*<section class="stage"[^>]*><\/section>/,
                      (): Dynamic => newBoard.body,
                    );
            state[newFile] = source;
            let position: Dynamic =
                typeof newBoard.x == "number" &&
                typeof newBoard.y == "number" &&
                Number.isFinite(newBoard.x) &&
                Number.isFinite(newBoard.y)
                  ? {
                      x: newBoard.x,
                      y: newBoard.y,
                    }
                  : nextArtboardPlacementPoint(allBoards),
              boardSpec: Dynamic = {
                file: newFile,
                x: Math.round(position.x),
                y: Math.round(position.y),
                w: clampBoardSize(newBoard.w),
                h: clampBoardSize(newBoard.h),
                title:
                  PlatformFileContentSlice(newBoard.title) ??
                  nextArtboardTitle(allBoards),
                ...deps.value452.current(),
              };
            allBoards.push(boardSpec);
            createdEntries.push({
              file: newFile,
              src: source,
              spec: boardSpec,
            });
          }
          if (
            createdEntries.length === 0 ||
            Object.keys(deps.doc.content().files).length + createdEntries.length >
              PlatformFileContentFilesValue
          )
            return [];
          let savedFiles: Dynamic = new Set();
          try {
            for (let entry of createdEntries as Dynamic) {
              await getKvClient().set(
                PlatformFileContentHandler_4(entry.file),
                entry.src,
              );
              savedFiles.add(entry.file);
            }
          } catch {
            for (let savedFile of savedFiles as Dynamic)
              await getKvClient()
                .delete(PlatformFileContentHandler_4(savedFile))
                .catch((): Dynamic => false);
            return [];
          }
          deps.value98({
            artboards: [
              ...deps.value73.current.artboards.filter(
                (item?: Dynamic): Dynamic => !savedFiles.has(item.file),
              ),
              ...createdEntries.map((item?: Dynamic): Dynamic => item.spec),
            ],
          });
          deps.value396.current(
            {
              kind: "add",
              entries: createdEntries,
            },
            savedFiles,
            undefined,
            historyContext,
          );
          return createdEntries.map((item?: Dynamic): Dynamic => item.file);
        },
        duplicate: async (
          sources?: Dynamic,
          historyContext?: Dynamic,
          positions?: Dynamic,
        ): Promise<Dynamic> => {
          let existingFiles: Dynamic = new Set(
              deps.value73.current.artboards.map(
                (item?: Dynamic): Dynamic => item.file,
              ),
            ),
            boards: Dynamic = [...currentPageBoards()],
            copies: Dynamic = sources.flatMap(
              (
                { file: file, title: title }: Dynamic,
                index?: Dynamic,
              ): Dynamic => {
                let sourceBoard: Dynamic = boards.find(
                  (board?: Dynamic): Dynamic => board.file === file,
                );
                if (sourceBoard === undefined) return [];
                let requestedPosition: Dynamic = positions?.[index],
                  position: Dynamic =
                    requestedPosition !== undefined &&
                    Number.isFinite(requestedPosition.x) &&
                    Number.isFinite(requestedPosition.y)
                      ? {
                          x: Math.round(requestedPosition.x),
                          y: Math.round(requestedPosition.y),
                        }
                      : nextArtboardPlacementPoint(boards);
                boards.push({
                  ...sourceBoard,
                  file: file + "#copy",
                  x: position.x,
                  y: position.y,
                });
                return [
                  {
                    file: file,
                    x: position.x,
                    y: position.y,
                    title: title,
                  },
                ];
              },
            );
          return copies.length === 0
            ? []
            : (deps.value451.current(copies, [], historyContext),
              await waitUntil(
                (): Dynamic =>
                  deps.value73.current.artboards.length >=
                  existingFiles.size + copies.length,
              ),
              deps.value73.current.artboards
                .map((item?: Dynamic): Dynamic => item.file)
                .filter((file?: Dynamic): Dynamic => !existingFiles.has(file)));
        },
        remove: async (
          files?: Dynamic,
          historyContext?: Dynamic,
        ): Promise<Dynamic> => {
          let targets: Dynamic = new Set(
            files.filter(
              (file?: Dynamic): Dynamic =>
                deps.value73.current.artboards.some(
                  (board?: Dynamic): Dynamic => board.file === file,
                ),
            ),
          );
          return targets.size === 0 ||
            !deps.value450.current(targets, undefined, historyContext)
            ? 0
            : (await waitUntil(
                (): Dynamic =>
                  !deps.value73.current.artboards.some(
                    (board?: Dynamic): Dynamic => targets.has(board.file),
                  ),
              ),
              [...targets].filter(
                (file?: Dynamic): Dynamic =>
                  !deps.value73.current.artboards.some(
                    (board?: Dynamic): Dynamic => board.file === file,
                  ),
              ).length);
        },
      };
    }
