import type { ApplicationCommands, ApplicationDocument, ApplicationStore, AssetUploadSummary, ClaudeRequest, RefusedUpload, WelcomeIntakeSummary } from "../../contracts/application";
import type { DesignSystemContent } from "../../contracts";
import { uiMessage } from "@minedesign/contracts/ui-messages";
import { isIgnoredUploadFile, uploadedFileRelativePath } from "../../editor/asset-upload";
import { artifactPageAddress, ownerBuildFromFilesPrompt, viewerBuildFromFilesPrompt } from "../../editor/claude-prompts";
import { performDesignSystemEdit } from "../../editor/edit-dispatch";
import { showEditorNotification } from "../../editor/editable-name";
import { countSuccessfulUploads, uploadedAssetFile, uploadResultSummary } from "../../editor/upload-pipeline";
import { DESIGN_SYSTEM_PATHS } from "../../model/file-policy";
import { deleteAssetFile } from "../../model/asset-commands";
import { deleteFontFace } from "../../model/font-component-commands";
import { reactArtifactRoot as React } from "../../ui/disclosure";

interface WelcomeUploadOptions {
  editable: ApplicationCommands | undefined;
  editor: ApplicationCommands;
  applicationDocument: ApplicationDocument;
  system: ApplicationStore;
  currentSection: string;
  filesSnapshot: Readonly<Record<string, unknown>>;
  uploadOptionLabel: string;
  jumpToSection(section: string): void;
  askClaude(request: ClaudeRequest, anchor?: Element | null, onComplete?: () => void): void;
  noticeWithAction(message: string, actionLabel: string, action: () => void): void;
  /** 以下两项在调用处声明得更晚，渲染后才读取。 */
  getAddFiles(): ((items: File[], fileGroup?: string, fromStart?: boolean) => boolean) | undefined;
  getFileHandoffAction(): (items: RefusedUpload[]) => () => void;
}

const EMPTY_INTAKE_SUMMARY: WelcomeIntakeSummary = { refused: [], landTo: null };

/**
 * 欢迎面板的上传记录：已选文件、导入后落到的路径、被拒文件，以及导入结果播报与移除。
 * 导入队列本身仍由 useAssetIntakeQueue 负责，它通过 recordIntakeOutcome / announceIntakeOutcome 回写这里。
 */
export function useWelcomeUpload({ editable, editor, applicationDocument, system, currentSection,
  filesSnapshot, uploadOptionLabel, jumpToSection, askClaude, noticeWithAction,
  getAddFiles, getFileHandoffAction }: WelcomeUploadOptions) {
  const [uploadPanelOpen, setUploadPanelOpen] = React.useState(false),
    uploadPanelActiveRef = React.useRef(false);
  uploadPanelActiveRef.current = uploadPanelOpen;
  const uploadPanelVisibleRef = React.useRef(false);
  uploadPanelVisibleRef.current = uploadPanelOpen && currentSection === "readme";
  const [intakeSummary, setIntakeSummary] = React.useState(EMPTY_INTAKE_SUMMARY),
    [intakeFiles, setIntakeFiles] = React.useState<File[]>([]),
    intakeFilesRef = React.useRef<File[]>([]);
  intakeFilesRef.current = intakeFiles;
  const [intakeFilePaths, setIntakeFilePaths] = React.useState(new Map<File, string>()),
    previousFilesRef = React.useRef(filesSnapshot);
  // 外部编辑改了已导入文件的路径时，同步面板里的记录；找不到对应文件的条目从面板移除。
  React.useEffect(() => {
    let current = previousFilesRef.current;
    previousFilesRef.current = filesSnapshot;
    if (current === filesSnapshot || intakeFilePaths.size === 0) {
      return;
    }
    let isIntakePath = (path: string) =>
        path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) ||
        path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir),
      claimedPaths = new Set(intakeFilePaths.values()),
      addedPaths = Object.keys(filesSnapshot).filter(
        (path) =>
          !Object.hasOwn(current, path) &&
          !claimedPaths.has(path) &&
          isIntakePath(path),
      ),
      removedPaths = Object.keys(current).filter(
        (path) => !Object.hasOwn(filesSnapshot, path) && isIntakePath(path),
      ),
      missingEntries = [...intakeFilePaths].filter(
        ([, path]) => !Object.hasOwn(filesSnapshot, path),
      );
    if (missingEntries.length === 0) {
      return;
    }
    let entries = new Map(intakeFilePaths),
      droppedFiles: File[] = [],
      baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1),
      pathPrefix = (path: string) => path.slice(0, path.indexOf("/"));
    for (let [intakeFile, existingPath] of missingEntries) {
      let samePlace = (candidatePath: string) =>
          baseName(candidatePath) === baseName(existingPath) &&
          pathPrefix(candidatePath) === pathPrefix(existingPath),
        addedMatches = addedPaths.filter(samePlace),
        removedMatches = removedPaths.filter(samePlace);
      if (addedMatches.length === 1 && removedMatches.length === 1) {
        entries.set(intakeFile, addedMatches[0]);
        addedPaths.splice(addedPaths.indexOf(addedMatches[0]), 1);
      } else {
        entries.delete(intakeFile);
        droppedFiles.push(intakeFile);
      }
    }
    setIntakeFilePaths(entries);
    if (droppedFiles.length > 0) {
      setIntakeFiles((files: File[]) =>
        files.filter((file: File) => !droppedFiles.includes(file)),
      );
    }
  }, [filesSnapshot, intakeFilePaths]);

  const closeUploadPanel = () => setUploadPanelOpen(false),
    openUploadPanel = () => setUploadPanelOpen(true),
    clearWelcomeFiles = () => {
      setIntakeSummary(EMPTY_INTAKE_SUMMARY);
      setIntakeFiles([]);
      intakeFilesRef.current = [];
      setIntakeFilePaths(new Map());
    },
    // 拖入或选择的文件：去掉面板里已有的和本批内重复的，其余交给导入队列。
    addWelcomeFiles = (welcomeFiles: File[]) => {
      const addFiles = getAddFiles(),
        isSameFile = (leftFile: File, rightFile: File) =>
          leftFile.name === rightFile.name &&
          leftFile.size === rightFile.size &&
          uploadedFileRelativePath(leftFile) ===
            uploadedFileRelativePath(rightFile),
        newFiles = welcomeFiles.filter(
          (candidateFile, index) =>
            !intakeFilesRef.current.some((file: File) =>
              isSameFile(file, candidateFile),
            ) &&
            welcomeFiles.findIndex((file) => isSameFile(file, candidateFile)) === index,
        );
      if (
        newFiles.length === 0 ||
        addFiles === undefined ||
        !addFiles(newFiles, undefined, true)
      ) {
        return;
      }
      intakeFilesRef.current = [...intakeFilesRef.current, ...newFiles];
      setIntakeFiles((files: File[]) => [...files, ...newFiles]);
      setUploadPanelOpen(true);
    },
    backFromUpload = () => {
      closeUploadPanel();
      if (intakeSummary.landTo !== null) {
        jumpToSection(intakeSummary.landTo);
      }
    },
    // 导入队列每处理完一批（来自欢迎面板的）就记录被拒文件与落点。
    recordIntakeOutcome = (
      uploadSummary: AssetUploadSummary,
      uploadedFiles: Map<File, string>,
    ) => {
      let successCount = countSuccessfulUploads(uploadSummary);
      setIntakeSummary((summary: WelcomeIntakeSummary) => ({
        refused: [
          ...summary.refused,
          ...uploadSummary.refused.map((file: RefusedUpload) => file.name),
        ],
        landTo:
          successCount === 0
            ? summary.landTo
            : summary.landTo === "assets" ||
                Object.keys(uploadSummary.assets).length > 0
              ? "assets"
              : "type",
      }));
      if (uploadedFiles.size > 0) {
        setIntakeFilePaths((paths: Map<File, string>) => new Map([...paths, ...uploadedFiles]));
      }
    },
    removeWelcomeFile = (fileIndex: number) => {
      let removedFile = intakeFiles[fileIndex];
      if (removedFile === undefined || editable === undefined) {
        return;
      }
      let entry = intakeFilePaths.get(removedFile),
        name = uploadedAssetFile(removedFile).name,
        singleIntakeFile = intakeFiles.length === 1,
        dropFromPanel = () => {
          setIntakeFiles((files: File[]) =>
            files.filter((file: File) => file !== removedFile),
          );
          if (singleIntakeFile) {
            clearWelcomeFiles();
            closeUploadPanel();
          }
        };
      if (entry !== undefined) {
        let removeFile = (document: DesignSystemContent) =>
          entry.startsWith(DESIGN_SYSTEM_PATHS.fontsDir)
            ? deleteFontFace(document, entry)
            : deleteAssetFile(document, entry);
        performDesignSystemEdit(
          editable,
          removeFile,
          (removalChoice) => {
            if (!editable.exec(uiMessage("design-system.designSystemApp.remove") + entry, removeFile, removalChoice)) {
              return false;
            }
            setIntakeFilePaths((paths: Map<File, string>) => {
              let entries = new Map(paths);
              entries.delete(removedFile);
              return entries;
            });
            dropFromPanel();
            return true;
          },
          {
            nameOf: () => name,
          },
          "removal",
        );
        return;
      }
      if (intakeSummary.refused.includes(name)) {
        setIntakeSummary((summary: WelcomeIntakeSummary) => {
          let refusedNames = [...summary.refused];
          refusedNames.splice(refusedNames.indexOf(name), 1);
          return {
            ...summary,
            refused: refusedNames,
          };
        });
      }
      dropFromPanel();
    },
    createFromWelcomeFiles = (files: File[]) => {
      let keptFiles = files
          .filter(
            (file) =>
              !isIgnoredUploadFile(file) &&
              !intakeSummary.refused.includes(
                uploadedAssetFile(file).name,
              ),
          )
          .map((file) => ({
            name: file.name,
            bytes: file.size,
          })),
        request: ClaudeRequest = {
          label: uploadOptionLabel,
          request: viewerBuildFromFilesPrompt(
            intakeFilePaths.size,
            artifactPageAddress(),
            uploadOptionLabel,
          ),
          prompt: ownerBuildFromFilesPrompt(
            keptFiles,
            artifactPageAddress(),
            uploadOptionLabel,
          ),
          deliver: "send",
        },
        retry = () => askClaude(request, null, retry);
      retry();
      let landTo = intakeSummary.landTo;
      clearWelcomeFiles();
      if (applicationDocument.dirty() && !system.holdAutosave) {
        editor.seal();
        applicationDocument.save().then(() => {
          let saveStatus = applicationDocument.saveState();
          if (saveStatus.status === "error") {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.theFilesAreInBut") +
                (saveStatus.message ?? "") +
                (applicationDocument.saveMode() === "auto"
                  ? ""
                  : " Press Save to retry."),
            );
          }
        });
      }
      closeUploadPanel();
      if (landTo !== null) {
        jumpToSection(landTo);
      }
    },
    // 欢迎面板正在显示且结果平静时不再弹通知，面板自己会显示。
    announceIntakeOutcome = (
      summary: AssetUploadSummary,
      isQuiet: boolean,
      fromStart = false,
    ) => {
      if (
        fromStart &&
        uploadPanelVisibleRef.current &&
        isQuiet &&
        summary.refused.length === 0 &&
        summary.warnings.length === 0
      ) {
        return;
      }
      let resultText = uploadResultSummary(summary, isQuiet, fromStart);
      if (resultText === null) {
        return;
      }
      if (resultText.handOff !== undefined) {
        noticeWithAction(
          resultText.text,
          // MineDesign: user-facing copy calls the agent "the agent", not Claude.
          uiMessage("design-system.designSystemApp.askTheAgent"),
          getFileHandoffAction()(resultText.handOff),
        );
      } else {
        showEditorNotification(resultText.text);
      }
    };
  return {
    uploadPanelOpen, uploadPanelActiveRef, uploadPanelVisibleRef,
    intakeFiles, intakeFilePaths, keptIntakeCount: intakeFilePaths.size,
    refusedUploadNames: intakeSummary.refused,
    openUploadPanel, backFromUpload, addWelcomeFiles, removeWelcomeFile, createFromWelcomeFiles,
    recordIntakeOutcome, announceIntakeOutcome,
  };
}
