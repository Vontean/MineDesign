import { travelCommitTimeoutMs as holdWorkingValue } from "../working-state";
import { minEmbeddedArtboardDimension as minArtboardEdge } from "../../platform/file-content";
import { PlatformFileContentFilesValue } from "../../platform/file-content";
import { projectFileKey } from "../../platform/file-content";
import { maxCanvasItemDimension as maxArtboardEdge } from "../../platform/file-content";
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
import { nextArtboardPlacementPoint } from "../paste-placement";

/** 视口、页面、选择或错误变化时运行：汇总可见画板、选中元素的文字摘要与画板错误，通过上下文发布器上报给外壳。 */
export function reportDesignContextSnapshot(deps: { readonly selection: Dynamic; readonly camera: Dynamic; readonly measureViewport: Dynamic; readonly selectedFiles: Dynamic; readonly inUseFiles: Dynamic; readonly artboardEntries: Dynamic; readonly problems: Dynamic; readonly fullscreenView: Dynamic; readonly publisher: Dynamic; readonly dirty: Dynamic; readonly pageId: Dynamic; readonly pageTitle: Dynamic; readonly page: Dynamic }): Dynamic {
    let { w: viewportWidth, h: viewportHeight, top: topInset }: Dynamic = deps.measureViewport(),
      state: Dynamic = {
        x: deps.camera.x,
        y: deps.camera.y + topInset / deps.camera.scale,
        w: viewportWidth / deps.camera.scale,
        h: (viewportHeight - topInset) / deps.camera.scale,
      },
      visibleFiles: Dynamic = deps.fullscreenView
        ? [deps.fullscreenView.file]
        : deps.page.artboards
            .filter(
              (artboard?: Dynamic): Dynamic =>
                distanceBetweenRects(artboard, state) === 0,
            )
            .map((artboard?: Dynamic): Dynamic => artboard.file),
      selectedPaths: Dynamic = [],
      selectedElements: Dynamic = [],
      showSelection: Dynamic = !deps.fullscreenView;
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
          for (let viewEntry of (deps.artboardEntries.current
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
    let selectedBoardFiles: Dynamic = showSelection ? [...deps.selectedFiles, ...deps.inUseFiles] : [],
      publisher: Dynamic = deps.publisher.current;
    if (publisher === null) return;
    let snapshot: Dynamic = {
        mode: deps.fullscreenView ? "focused" : "canvas",
        page: deps.pageId === "" ? null : deps.pageId,
        pageName: {
          text: deps.pageId === "" ? "" : deps.pageTitle,
        },
        visibleArtboards: normalizeSelectedArtboardPaths(
          visibleFiles,
        ),
        selectedArtboards: normalizeSelectedArtboardPaths(
          selectedBoardFiles,
        ),
        ...getEmbeddedPresence(),
        dirty: deps.dirty,
        selected: selectedPaths.slice(-20),
        selection: selectedElements.slice(-5).map(
          (source?: Dynamic): Dynamic => ({
            id: source.id,
            kind: source.kind,
            label: source.words(artboardTextSnapshotLimit),
          }),
        ),
      },
      errorEntries: Dynamic = deps.problems.flatMap((problem?: Dynamic): Dynamic => {
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
interface HostedCanvasContext {
  readonly document: {
    readonly doc: Dynamic;
    readonly supportsLoadState: Dynamic;
    readonly manifest: Dynamic;
    readonly activePage: Dynamic;
    readonly persistManifest: Dynamic;
    readonly savePageSelection: Dynamic;
  };
  readonly session: {
    readonly pendingCommands: Dynamic;
    readonly holdCommand: Dynamic;
    readonly dropInProgress: Dynamic;
  };
  readonly artboards: {
    readonly focus: Dynamic;
    readonly revealBounds: Dynamic;
    readonly deleteBoards: Dynamic;
    readonly duplicateFiles: Dynamic;
  };
  readonly history: {
    readonly recordManifest: Dynamic;
    readonly inlineHistory: Dynamic;
    readonly canvasUndo: Dynamic;
    readonly mark: Dynamic;
    readonly depth: Dynamic;
  };
}

export function buildHostedEditorCanvasApi(deps: HostedCanvasContext): Dynamic {
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
          designPageContents(deps.document.manifest.current, deps.document.activePage.current)
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
            deps.document.activePage.current,
            deps.document.manifest.current.pages?.[0]?.id ?? "",
          ),
        token: (): Dynamic => randomSessionToken(),
        group: (files?: Dynamic, bound?: Dynamic): Dynamic =>
          deps.history.inlineHistory.current?.group(
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
              deps.session.pendingCommands.current <= 0 &&
              !deps.session.dropInProgress.current &&
              !(deps.history.inlineHistory.current?.busy() ?? false),
          ),
          deps.session.holdCommand(holdWorkingValue)
        ),
        undo: (): Dynamic => deps.history.canvasUndo.current?.undo(),
        redo: (): Dynamic => deps.history.canvasUndo.current?.redo(),
        mark: deps.history.mark,
        depth: deps.history.depth,
        revealRect: (rect?: Dynamic): Dynamic => {
          deps.artboards.revealBounds.current?.({
            x: rect.x,
            y: rect.y,
            w: rect.w,
            h: rect.h,
          });
        },
        reveal: (file?: Dynamic): Dynamic => {
          let artboard: Dynamic = deps.document.manifest.current.artboards.find(
            (item?: Dynamic): Dynamic => item.file === file,
          );
          artboard !== undefined &&
            deps.artboards.revealBounds.current?.({
              x: artboard.x,
              y: artboard.y,
              w: artboard.w,
              h: artboard.h,
            });
        },
        focus: (file?: Dynamic): Dynamic => {
          deps.artboards.focus.current(file);
        },
        place: (placements?: Dynamic, historyContext?: Dynamic): Dynamic => {
          let changes: Dynamic = [],
            updatedBoards: Dynamic = deps.document.manifest.current.artboards.map(
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
            : (deps.history.recordManifest.current(
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
              deps.document.persistManifest({
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
            board: Dynamic = deps.document.manifest.current.artboards.find(
              (item?: Dynamic): Dynamic => item.file === file,
            );
          if (cleanTitle === undefined || board === undefined) return false;
          let storedTitle: Dynamic =
            cleanTitle !== file.replace(/\.dc\.html$/, "")
              ? cleanTitle
              : undefined;
          return (board.title ?? undefined) === storedTitle
            ? false
            : (deps.history.recordManifest.current(
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
              deps.document.persistManifest({
                artboards: deps.document.manifest.current.artboards.map(
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
              ...deps.document.doc.content().files,
            },
            allBoards: Dynamic = [...currentPageBoards()],
            createdEntries: Dynamic = [];
          for (let newBoard of newBoards as Dynamic) {
            let newFile: Dynamic = uniqueArtboardFile(
                state,
                "Artboard",
                deps.document.supportsLoadState,
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
                ...deps.document.savePageSelection.current(),
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
            Object.keys(deps.document.doc.content().files).length + createdEntries.length >
              PlatformFileContentFilesValue
          )
            return [];
          let savedFiles: Dynamic = new Set();
          try {
            for (let entry of createdEntries as Dynamic) {
              await getKvClient().set(
                projectFileKey(entry.file),
                entry.src,
              );
              savedFiles.add(entry.file);
            }
          } catch {
            for (let savedFile of savedFiles as Dynamic)
              await getKvClient()
                .delete(projectFileKey(savedFile))
                .catch((): Dynamic => false);
            return [];
          }
          deps.document.persistManifest({
            artboards: [
              ...deps.document.manifest.current.artboards.filter(
                (item?: Dynamic): Dynamic => !savedFiles.has(item.file),
              ),
              ...createdEntries.map((item?: Dynamic): Dynamic => item.spec),
            ],
          });
          deps.history.recordManifest.current(
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
              deps.document.manifest.current.artboards.map(
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
            : (deps.artboards.duplicateFiles.current(copies, [], historyContext),
              await waitUntil(
                (): Dynamic =>
                  deps.document.manifest.current.artboards.length >=
                  existingFiles.size + copies.length,
              ),
              deps.document.manifest.current.artboards
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
                deps.document.manifest.current.artboards.some(
                  (board?: Dynamic): Dynamic => board.file === file,
                ),
            ),
          );
          return targets.size === 0 ||
            !deps.artboards.deleteBoards.current(targets, undefined, historyContext)
            ? 0
            : (await waitUntil(
                (): Dynamic =>
                  !deps.document.manifest.current.artboards.some(
                    (board?: Dynamic): Dynamic => targets.has(board.file),
                  ),
              ),
              [...targets].filter(
                (file?: Dynamic): Dynamic =>
                  !deps.document.manifest.current.artboards.some(
                    (board?: Dynamic): Dynamic => board.file === file,
                  ),
              ).length);
        },
      };
    }
