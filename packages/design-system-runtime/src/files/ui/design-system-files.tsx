import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  FileHomeContext,
  FileHome,
  FileBrowserSource,
  DesignFilesDocument,
  DesignFilesBrowserProps,
  DesignFilesLayerProps,
  FileContentSections,
  BrowserListingEntry,
  BrowserEntry,
  BrowserFile,
  DesignFilesSection,
  FileListingState,
  BrowserReveal,
  ExternalFileListing,
  ListingUncertainty,
} from "../../contracts/file-browser";
import { loadJsxNamespace } from "../../dependencies";
import { addressedProjectFileUrl } from "../../editor/addressed-files";
import { UNCOMMENTABLE_PROPS } from "../../editor/comment-anchors";
import { filesLeftOutOfMigration, publishableFileMimeType } from "../../editor/files-index";
import { fetchFileWithRetries, FilesBrowser, projectFileUrl } from "./file-browser";
import { buildFileBrowserTree, isHiddenBrowserPath, projectListingFiles, reactDesignSystemFiles, reactDomDesignSystemFiles, visibleFileName } from "./file-tree";
import { blobRelativeUrlModelFilePolicy, COMPONENT_FILENAMES, COVER_COMPONENT_NAME, DESIGN_SYSTEM_PATHS, isGeneratedSystemPath, isHeldFilePointer, isTextFilePath, storagePointerForFile } from "../../model/file-policy";
import { classifyDesignSystemFile } from "../../model/file-table";
import { toModuleNamespace } from "../../module-helpers";
import { Button } from "../../ui/buttons";
import { hasOpenOverlay } from "../../ui/property-focus";

var DESIGN_SYSTEM_COVER_PREVIEW_PATH: string;
var FILE_SECTION_BY_CONTENT_KIND: FileContentSections;
var jsxDesignSystemFiles: typeof import("react/jsx-runtime");
var FILES_SECTION_ID: string;
var FILES_SECTION_LABEL: string;
var FILES_LISTING_URL: string;
var FILES_BROWSER_READ_RETRY_MS: number;
var FILES_LISTING_LAZY_START_MS: number;
var FILES_LISTING_CONTENT_REFRESH_MS: number;
var FILES_LISTING_NARROWED_RETRY_DELAYS_MS: number[];
var EMPTY_BROWSER_FILE_LIST: BrowserListingEntry[];
var heldBrowserFileByteSize: (path: string, content: string) => number;
var FILES_BROWSER_NOTE_CLASS: string;
var FILES_LISTING_UNCERTAIN_MESSAGES: Record<ListingUncertainty, string>;
var FILES_LISTING_EMPTY_MESSAGES: Record<"failed" | "narrowed", string>;
var FILES_BROWSER_CONFLICT_REASON: string;
var flaggedDesignSystemFiles: (doc: DesignFilesDocument) => Set<string>;
var designSystemDocumentIsReadonly: (doc: DesignFilesDocument) => boolean;
function designSystemFileHome(
  path: string,
  pageContext: FileHomeContext,
): FileHome {
  let sectionHome: (section: string) => FileHome = (sectionId: string) =>
    pageContext.listsSection?.(sectionId) === false
      ? {
          at: "nowhere",
        }
      : {
          at: "section",
          id: sectionId,
        };
  if (pageContext.leftOut.has(path)) {
    return {
      at: "nowhere",
    };
  }
  if (!pageContext.held(path)) {
    if (
      isGeneratedSystemPath(path) ||
      path === DESIGN_SYSTEM_PATHS.manifest
    ) {
      return {
        at: "written",
      };
    } else {
      return {
        at: "nowhere",
      };
    }
  }
  let kind: import("../../contracts").FileKind = classifyDesignSystemFile(path);
  if (kind === "manifest") {
    return {
      at: "written",
    };
  }
  if (
    path === DESIGN_SYSTEM_COVER_PREVIEW_PATH &&
    pageContext.bareCover === true
  ) {
    return sectionHome("readme");
  }
  if (
    kind === "dts" &&
    !path.startsWith(DESIGN_SYSTEM_PATHS.componentsDir)
  ) {
    return {
      at: "nowhere",
    };
  }
  let section = FILE_SECTION_BY_CONTENT_KIND[kind];
  if (section === undefined) {
    return {
      at: "nowhere",
    };
  } else {
    return sectionHome(section);
  }
}
function heldFileBrowserSource(path: string, content: string | undefined) {
  if (content === undefined) {
    return {
      url: projectFileUrl(path),
    };
  }
  let reference = storagePointerForFile(path, content);
  if (reference !== null) {
    return {
      url:
        reference.store === "blob"
          ? blobRelativeUrlModelFilePolicy(reference.id)
          : ((reference.rel === "" &&
            isHeldFilePointer(path, content)
              ? addressedProjectFileUrl(path)
              : undefined) ??
            projectFileUrl(
              reference.rel === "" ? path : reference.rel,
            )),
    };
  }
  if (!isTextFilePath(path) && content.startsWith("data:")) {
    return {
      dataUri: content,
    };
  } else {
    return {
      text: content,
    };
  }
}
function useDesignSystemFilesBrowser({
  doc: doc,
  snap: snap,
  sections: sections,
  jump: jump,
  mayEdit: mayEdit,
}: DesignFilesBrowserProps) {
  const uiLocale = useUiLocale();
  let {
      files: files,
      otherFiles: otherFiles,
      docsLeftOut: docsLeftOut,
      components: components,
    } = snap,
    usesFilePort = "flagged" in doc,
    [listing, setListing] =
      reactDesignSystemFiles.useState<FileListingState>(null),
    [open, setOpen] = reactDesignSystemFiles.useState(false),
    [reveal, setReveal] =
      reactDesignSystemFiles.useState<BrowserReveal | null>(null),
    restoreFocusRef =
      reactDesignSystemFiles.useRef<HTMLElement | null>(null),
    abortRef = reactDesignSystemFiles.useRef<AbortController | null>(
      null,
    ),
    retryTimerRef = reactDesignSystemFiles.useRef<
      ReturnType<typeof setTimeout> | undefined
    >(undefined),
    mayEditRef = reactDesignSystemFiles.useRef(mayEdit);
  mayEditRef.current = mayEdit;
  let openRef = reactDesignSystemFiles.useRef(false),
    retryOwedRef = reactDesignSystemFiles.useRef(false),
    refreshListing = reactDesignSystemFiles.useCallback(
      (isRetryable: boolean) => {
        let callback = (attempt: number) => {
          clearTimeout(retryTimerRef.current);
          abortRef.current?.abort();
          retryOwedRef.current = false;
          let value = (abortRef.current = new AbortController()),
            retryListing = () => {
              if (openRef.current) {
                retryOwedRef.current = true;
                return;
              }
              let retryDelay = FILES_LISTING_NARROWED_RETRY_DELAYS_MS[attempt];
              if (retryDelay !== undefined) {
                retryTimerRef.current = setTimeout(
                  () => callback(attempt + 1),
                  retryDelay,
                );
              }
            };
          fetchFileWithRetries(
            FILES_LISTING_URL,
            attempt === 0 ? FILES_BROWSER_READ_RETRY_MS : 0,
            value.signal,
            isRetryable || attempt > 0,
          )
            .then((response: Response) => response.json())
            .then((listingResponse: ExternalFileListing | null) => {
              if (value.signal.aborted) {
                return;
              }
              if (
                listingResponse === null ||
                typeof listingResponse !== "object" ||
                listingResponse.files === null ||
                typeof listingResponse.files !== "object" ||
                Array.isArray(listingResponse.files)
              ) {
                throw Error(uiMessage("design-system.designSystemFiles.notAListing"));
              }
              let isNarrowed = listingResponse.narrowed === true;
              setListing({
                files: projectListingFiles(
                  listingResponse.files,
                  "design_system",
                ),
                narrowed: isNarrowed,
              });
              if (isNarrowed && mayEditRef.current) {
                retryListing();
              }
            })
            .catch(() => {
              if (value.signal.aborted) {
                return;
              }
              let current = openRef.current;
              setListing((currentListing: FileListingState) =>
                current ? "failed" : (currentListing ?? "failed"),
              );
              retryListing();
            });
        };
        callback(0);
      },
      [],
    );
  reactDesignSystemFiles.useEffect(() => {
    if (!usesFilePort) {
      return;
    }
    let value = setTimeout(() => {
      if (abortRef.current === null) {
        refreshListing(false);
      }
    }, FILES_LISTING_LAZY_START_MS);
    return () => {
      clearTimeout(value);
      clearTimeout(retryTimerRef.current);
      abortRef.current?.abort();
    };
  }, [usesFilePort, refreshListing]);
  let lastListedFilesRef = reactDesignSystemFiles.useRef(files);
  reactDesignSystemFiles.useEffect(() => {
    if (!open || lastListedFilesRef.current === files) {
      return;
    }
    let value = setTimeout(() => {
      lastListedFilesRef.current = files;
      refreshListing(true);
    }, FILES_LISTING_CONTENT_REFRESH_MS);
    return () => clearTimeout(value);
  }, [open, files, refreshListing]);
  let everHeldPathsRef = reactDesignSystemFiles.useRef<{
    of: import("../../contracts").FileTable | null;
    paths: Set<string>;
  }>({
    of: null,
    paths: new Set(),
  });
  if (everHeldPathsRef.current.of !== files) {
    everHeldPathsRef.current.of = files;
    for (let value of Object.keys(files)) {
      everHeldPathsRef.current.paths.add(value);
    }
  }
  let pageContext = reactDesignSystemFiles.useMemo(
      () => ({
        held: (filePath: string) => Object.hasOwn(files, filePath),
        leftOut: new Set([...otherFiles, ...docsLeftOut]),
        bareCover: !components.some(
          (component: import("../../contracts").ParsedComponent) =>
            component.name === COVER_COMPONENT_NAME,
        ),
        listsSection: (sectionId: string) =>
          sections.some((section: DesignFilesSection) => section.id === sectionId),
      }),
      [files, otherFiles, docsLeftOut, components, sections],
    ),
    listedFiles =
      listing === null || listing === "failed"
        ? EMPTY_BROWSER_FILE_LIST
        : listing.files,
    browserPaths = reactDesignSystemFiles.useMemo(() => {
      let value = listedFiles
          .map((entry: BrowserListingEntry) => entry.path)
          .filter(
            (path: string) =>
              Object.hasOwn(files, path) ||
              !everHeldPathsRef.current.paths.has(path),
          ),
        values = new Set(value);
      for (let filePath of Object.keys(files)) {
        if (
          !values.has(filePath) &&
          !isHiddenBrowserPath(filePath)
        ) {
          value.push(filePath);
        }
      }
      return value;
    }, [listedFiles, files]),
    unshownPaths = reactDesignSystemFiles.useMemo(
      () =>
        browserPaths.filter(
          (path: string) =>
            !path.startsWith(DESIGN_SYSTEM_PATHS.archivedDir) &&
            designSystemFileHome(path, pageContext).at === "nowhere",
        ),
      [browserPaths, pageContext],
    ),
    show = reactDesignSystemFiles.useCallback(
      (path?: string) => {
        if (!usesFilePort) {
          return;
        }
        restoreFocusRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        if (path !== undefined) {
          setReveal((previousReveal: BrowserReveal | null) => ({
            path: path,
            n: (previousReveal?.n ?? 0) + 1,
          }));
        }
        setOpen(true);
        openRef.current = true;
        setListing((previousListing: FileListingState) =>
          previousListing === "failed" ? null : previousListing,
        );
        lastListedFilesRef.current = files;
        refreshListing(true);
      },
      [usesFilePort, files, refreshListing],
    ),
    closeInternal = reactDesignSystemFiles.useCallback(
      (isOpen: boolean) => {
        if (!open) {
          return;
        }
        reactDomDesignSystemFiles.flushSync(() => {
          setOpen(false);
          setReveal(null);
        });
        openRef.current = false;
        if (
          listing === null ||
          listing === "failed" ||
          retryOwedRef.current
        ) {
          refreshListing(false);
        }
        let current = restoreFocusRef.current;
        restoreFocusRef.current = null;
        if (isOpen && current !== null && current.isConnected) {
          current.focus({
            preventScroll: true,
          });
        }
      },
      [open, listing, refreshListing],
    ),
    close = reactDesignSystemFiles.useCallback(
      (shouldNotify: boolean = true) => closeInternal(shouldNotify),
      [closeInternal],
    ),
    leave = reactDesignSystemFiles.useCallback(
      (afterClose: () => void) => {
        closeInternal(false);
        afterClose();
      },
      [closeInternal],
    );
  reactDesignSystemFiles.useEffect(() => {
    if (!open) {
      return;
    }
    let callback = (event: KeyboardEvent) => {
      let target = event.target;
      if (
        event.key !== "Escape" ||
        event.defaultPrevented ||
        hasOpenOverlay() ||
        (target instanceof HTMLElement &&
          (target.isContentEditable ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)))
      ) {
        return;
      }
      event.preventDefault();
      close();
    };
    window.addEventListener("keydown", callback);
    return () => window.removeEventListener("keydown", callback);
  }, [open, close]);
  reactDesignSystemFiles.useEffect(() => {
    if (!open) {
      return;
    }
    let callback = (event: DragEvent) => {
        if (
          event.dataTransfer == null ||
          !Array.from(event.dataTransfer.types).includes("Files")
        ) {
          return;
        }
        event.preventDefault();
        event.stopImmediatePropagation();
        event.dataTransfer.dropEffect = "none";
      },
      items: ("dragenter" | "dragover" | "drop")[] = [
        "dragenter",
        "dragover",
        "drop",
      ];
    for (let value of items) {
      window.addEventListener(value, callback, true);
    }
    return () => {
      for (let value of items) {
        window.removeEventListener(value, callback, true);
      }
    };
  }, [open]);
  let layer = !open ? null : (
      <DesignSystemFilesLayer
        files={files}
        doc={doc}
        page={pageContext}
        sections={sections}
        listed={listedFiles}
        paths={browserPaths}
        reveal={reveal}
        unsure={
          listing === null
            ? "listing"
            : listing === "failed"
              ? "failed"
              : listing.narrowed
                ? "narrowed"
                : null
        }
        retry={() => {
          setListing(null);
          refreshListing(true);
        }}
        onClose={() => close()}
        goTo={(path: string) => leave(() => jump(path))}
      />
    ),
    searchEntries = reactDesignSystemFiles.useMemo(
      () =>
        !usesFilePort || unshownPaths.length === 0
          ? []
          : [
              {
                section: FILES_SECTION_ID,
                label: uiMessage("design-system.fileBrowser.files"),
                words: [],
              },
              ...unshownPaths.map((path: string) => ({
                section: FILES_SECTION_ID,
                label: visibleFileName(
                  path.slice(path.lastIndexOf("/") + 1),
                ),
                words: [visibleFileName(path)],
                target: path,
              })),
            ],
      [usesFilePort, unshownPaths, uiLocale],
    ),
    fileCount = browserPaths.length;
  return {
    row: usesFilePort
      ? {
          id: FILES_SECTION_ID,
          label: uiMessage("design-system.fileBrowser.files"),
          count: fileCount,
          countLabel:
            uiMessage(fileCount===1 ? "design-system.designSystemFiles.filesOne" : "design-system.designSystemFiles.filesMany", {count:fileCount}),
        }
      : undefined,
    open: open && usesFilePort,
    show: show,
    close: close,
    leave: leave,
    layer: layer,
    covered:
      open && usesFilePort
        ? {
            inert: true,
            "data-covered": "",
          }
        : {},
    searchEntries: searchEntries,
  };
}
function DesignSystemFilesLayer({
  files: files,
  doc: doc,
  page: page,
  sections: sections,
  listed: listed,
  paths: paths,
  reveal: reveal,
  unsure: unsure,
  retry: retry,
  onClose: onClose,
  goTo: goTo,
}: DesignFilesLayerProps) {
  useUiLocale();
  let memo = reactDesignSystemFiles.useMemo(() => {
      let entries = new Map<string, BrowserListingEntry>(
        listed.map((entry: BrowserListingEntry) => [entry.path, entry]),
      );
      return buildFileBrowserTree(
        paths.map((path: string) => {
          let currentFileContent = Object.hasOwn(files, path) ? files[path] : undefined,
            entry = entries.get(path);
          if (
            entry !== undefined ||
            currentFileContent === undefined ||
            storagePointerForFile(path, currentFileContent) !== null
          ) {
            return (
              entry ?? {
                path: path,
              }
            );
          }
          let contentType = publishableFileMimeType(path, currentFileContent);
          return {
            path: path,
            size: heldBrowserFileByteSize(path, currentFileContent),
            ...(contentType !== null
              ? {
                  contentType: contentType,
                }
              : {}),
          };
        }),
      );
    }, [listed, paths, files]),
    [value, setFlagged] = reactDesignSystemFiles.useState(() =>
      flaggedDesignSystemFiles(doc),
    );
  reactDesignSystemFiles.useEffect(() => {
    setFlagged(flaggedDesignSystemFiles(doc));
    return doc.subscribeFlagged?.(() =>
      setFlagged(flaggedDesignSystemFiles(doc)),
    );
  }, [doc]);
  let conflictPaths = reactDesignSystemFiles.useMemo(() => {
      let entries: Map<string, string> = new Map(
        filesLeftOutOfMigration(files)
          .filter(
            (conflict: { path: string; reason: string }) =>
              !isHeldFilePointer(
                conflict.path,
                files[conflict.path] ?? "",
              ),
          )
          .map((conflict: { path: string; reason: string }) => [
            conflict.path,
            conflict.reason,
          ]),
      );
      for (let filePath of value) {
        entries.set(filePath, FILES_BROWSER_CONFLICT_REASON);
      }
      return entries;
    }, [files, value]),
    callback = (browserFile: BrowserFile) => {
      let fileHome = designSystemFileHome(browserFile.path, page);
      if (fileHome.at === "section") {
        return sections.find(
          (section: DesignFilesSection) => section.id === fileHome.id,
        );
      } else {
        return undefined;
      }
    },
    isConflict =
      designSystemDocumentIsReadonly(doc) &&
      listed.some(
        (entry: BrowserListingEntry) =>
          entry.path === DESIGN_SYSTEM_PATHS.manifest,
      ),
    fileContent = (browserFile: BrowserFile) =>
      Object.hasOwn(files, browserFile.path) &&
      !(isConflict && browserFile.path === DESIGN_SYSTEM_PATHS.manifest)
        ? files[browserFile.path]
        : undefined;
  return (
    <div
      className={"absolute inset-0 flex flex-col bg-surface-2"}
      data-testid={"ds-files-layer"}
      {...UNCOMMENTABLE_PROPS}
    >
      {[unsure === null ? null : (
          <div
            role={"status"}
            data-testid={"ds-files-unsure"}
            className={
              "flex shrink-0 items-center justify-center gap-2 border-b px-3 py-1.5 text-xs text-secondary"
            }
          >
            {[FILES_LISTING_UNCERTAIN_MESSAGES[unsure], unsure === "failed" ? (
                <Button
                  variant={"ghost"}
                  size={"sm"}
                  data-testid={"ds-files-retry"}
                  onClick={retry}
                >
                  {uiMessage("design-system.designSystemFiles.tryAgain")}
                </Button>
              ) : null]}
          </div>
        ), <div className={"min-h-0 flex-1"}>
          <FilesBrowser
            tree={memo}
            onClose={onClose}
            rootLabel={uiMessage("design-system.fileBrowser.files")}
            sourceOf={(browserFile: BrowserFile) =>
              heldFileBrowserSource(browserFile.path, fileContent(browserFile))
            }
            retryMs={FILES_BROWSER_READ_RETRY_MS}
            fresh={true}
            reveal={reveal}
            htmlAsText={true}
            emptyText={
              unsure === "listing" ? ("") : (unsure !== null ? (FILES_LISTING_EMPTY_MESSAGES[unsure]) : (uiMessage("design-system.designSystemFiles.thisDesignSystemHasNo")))
            }
            downloadOf={() => ({})}
            kindLine={(browserFile: BrowserFile, kind: string) => {
              let fileHome = designSystemFileHome(browserFile.path, page),
                kindDescription =
                  fileHome.at === "written"
                    ? " · Generated by this page on every save"
                    : fileHome.at === "section"
                      ? " · Shown in " +
                        (callback(browserFile)?.label ?? "a section of the page")
                      : "";
              return (
                kind +
                kindDescription +
                (conflictPaths.has(browserFile.path) ? " · Not saved" : "")
              );
            }}
            footerOf={(browserFile: BrowserFile) => {
              let fileHome = callback(browserFile),
                footer =
                  fileHome === undefined ? null : (
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      icon={"ArrowRight"}
                      className={"mt-3"}
                      data-testid={"ds-files-home"}
                      onClick={() => goTo(fileHome.id)}
                    >
                      {uiMessage("design-system.designSystemFiles.goTo", {label:fileHome.label})}
                    </Button>
                  ),
                entry = conflictPaths.get(browserFile.path);
              if (entry !== undefined) {
                return (
                  <jsxDesignSystemFiles.Fragment>
                    {[<p
                        data-testid={"ds-files-note"}
                        className={FILES_BROWSER_NOTE_CLASS}
                      >
                        {uiMessage("design-system.designSystemFiles.notSaved", {file:entry})}
                      </p>, footer]}
                  </jsxDesignSystemFiles.Fragment>
                );
              }
              if (footer !== null) {
                return footer;
              }
              if (
                designSystemFileHome(browserFile.path, page).at === "written" &&
                fileContent(browserFile) === undefined
              ) {
                return (
                  <p
                    data-testid={"ds-files-note"}
                    className={FILES_BROWSER_NOTE_CLASS}
                  >
                    {
                      uiMessage("design-system.designSystemFiles.olderCopy")
                    }
                  </p>
                );
              }
              return null;
            }}
          />
        </div>]}
    </div>
  );
}
function get_FILES_SECTION_LABEL() {
  return uiMessage("design-system.fileBrowser.files");
}
function get_FILES_BROWSER_CONFLICT_REASON() {
  return uiMessage("design-system.designSystemFiles.someoneElseSavedANewer");
}
export {
  DESIGN_SYSTEM_COVER_PREVIEW_PATH,
  designSystemDocumentIsReadonly,
  designSystemFileHome,
  DesignSystemFilesLayer,
  EMPTY_BROWSER_FILE_LIST,
  FILE_SECTION_BY_CONTENT_KIND,
  get_FILES_BROWSER_CONFLICT_REASON,
  FILES_BROWSER_NOTE_CLASS,
  FILES_BROWSER_READ_RETRY_MS,
  FILES_LISTING_CONTENT_REFRESH_MS,
  FILES_LISTING_EMPTY_MESSAGES,
  FILES_LISTING_LAZY_START_MS,
  FILES_LISTING_NARROWED_RETRY_DELAYS_MS,
  FILES_LISTING_UNCERTAIN_MESSAGES,
  FILES_LISTING_URL,
  FILES_SECTION_ID,
  get_FILES_SECTION_LABEL,
  flaggedDesignSystemFiles,
  heldBrowserFileByteSize,
  heldFileBrowserSource,
  jsxDesignSystemFiles,
  useDesignSystemFilesBrowser,
};
export function installFilesUiDesignSystemFiles(): () => void {
  return () => {
    DESIGN_SYSTEM_COVER_PREVIEW_PATH =
      DESIGN_SYSTEM_PATHS.componentsDir +
      COVER_COMPONENT_NAME +
      "/" +
      COMPONENT_FILENAMES.preview;
    FILE_SECTION_BY_CONTENT_KIND = {
      readme: "readme",
      doc: "readme",
      tokens: "colors",
      font: "type",
      asset: "assets",
      bundleJs: "components",
      bundleCss: "components",
      dts: "components",
      preview: "components",
      componentReadme: "components",
      componentLib: "components",
    };
    jsxDesignSystemFiles = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    FILES_SECTION_ID = "files";
    FILES_SECTION_LABEL = "Files";
    FILES_LISTING_URL = "_files.json";
    FILES_BROWSER_READ_RETRY_MS = 18000;
    FILES_LISTING_LAZY_START_MS = 1500;
    FILES_LISTING_CONTENT_REFRESH_MS = 600;
    FILES_LISTING_NARROWED_RETRY_DELAYS_MS = [4000, 12000, 36000];
    EMPTY_BROWSER_FILE_LIST = [];
    heldBrowserFileByteSize = (filePath: string, items: string) => {
      let value = isTextFilePath(filePath)
        ? null
        : /^data:[^,]*;base64,/i.exec(items);
      if (value === null) {
        return new TextEncoder().encode(items).length;
      } else {
        return Math.floor(((items.length - value[0].length) * 3) / 4);
      }
    };
    FILES_BROWSER_NOTE_CLASS =
      "mt-3 max-w-[36ch] text-center text-[11px] leading-[1.4] text-secondary";
    FILES_LISTING_UNCERTAIN_MESSAGES = {
      get listing() { return uiMessage("design-system.designSystemFiles.listing"); },
      get failed() { return uiMessage("design-system.designSystemFiles.listingFailed"); },
      get narrowed() { return uiMessage("design-system.designSystemFiles.listingNarrowed"); },
    };
    FILES_LISTING_EMPTY_MESSAGES = {
      get failed() { return uiMessage("design-system.designSystemFiles.emptyFailed"); },
      get narrowed() { return uiMessage("design-system.designSystemFiles.emptyNarrowed"); },
    };
    FILES_BROWSER_CONFLICT_REASON =
      "someone else saved a newer version, and this tab has changes of its own that are not saved";
    flaggedDesignSystemFiles = (document: DesignFilesDocument) =>
      new Set(document.flagged?.() ?? []);
    designSystemDocumentIsReadonly = (document: DesignFilesDocument) =>
      document.readOnly?.() === true;
  };
}
