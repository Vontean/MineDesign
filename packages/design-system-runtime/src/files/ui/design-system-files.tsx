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
  context: FileHomeContext,
): FileHome {
  let sectionHome: (section: string) => FileHome = (input: string) =>
    context.listsSection?.(input) === false
      ? {
          at: "nowhere",
        }
      : {
          at: "section",
          id: input,
        };
  if (context.leftOut.has(path)) {
    return {
      at: "nowhere",
    };
  }
  if (!context.held(path)) {
    if (
      (0, isGeneratedSystemPath)(path) ||
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
  let kind: import("../../contracts").FileKind = (0,
  classifyDesignSystemFile)(path);
  if (kind === "manifest") {
    return {
      at: "written",
    };
  }
  if (
    path === DESIGN_SYSTEM_COVER_PREVIEW_PATH &&
    context.bareCover === true
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
      url: (0, projectFileUrl)(path),
    };
  }
  let reference = (0, storagePointerForFile)(path, content);
  if (reference !== null) {
    return {
      url:
        reference.store === "blob"
          ? (0, blobRelativeUrlModelFilePolicy)(reference.id)
          : ((reference.rel === "" &&
            (0, isHeldFilePointer)(path, content)
              ? (0, addressedProjectFileUrl)(path)
              : undefined) ??
            (0, projectFileUrl)(
              reference.rel === "" ? path : reference.rel,
            )),
    };
  }
  if (!(0, isTextFilePath)(path) && content.startsWith("data:")) {
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
      (input: boolean) => {
        let callback = (input2: number) => {
          clearTimeout(retryTimerRef.current);
          abortRef.current?.abort();
          retryOwedRef.current = false;
          let value = (abortRef.current = new AbortController()),
            callback2 = () => {
              if (openRef.current) {
                retryOwedRef.current = true;
                return;
              }
              let value2 = FILES_LISTING_NARROWED_RETRY_DELAYS_MS[input2];
              if (value2 !== undefined) {
                retryTimerRef.current = setTimeout(
                  () => callback(input2 + 1),
                  value2,
                );
              }
            };
          (0, fetchFileWithRetries)(
            FILES_LISTING_URL,
            input2 === 0 ? FILES_BROWSER_READ_RETRY_MS : 0,
            value.signal,
            input || input2 > 0,
          )
            .then((input3: Response) => input3.json())
            .then((input3: ExternalFileListing | null) => {
              if (value.signal.aborted) {
                return;
              }
              if (
                input3 === null ||
                typeof input3 !== "object" ||
                input3.files === null ||
                typeof input3.files !== "object" ||
                Array.isArray(input3.files)
              ) {
                throw Error(uiMessage("design-system.designSystemFiles.notAListing"));
              }
              let value2 = input3.narrowed === true;
              setListing({
                files: (0, projectListingFiles)(
                  input3.files,
                  "design_system",
                ),
                narrowed: value2,
              });
              if (value2 && mayEditRef.current) {
                callback2();
              }
            })
            .catch(() => {
              if (value.signal.aborted) {
                return;
              }
              let current = openRef.current;
              setListing((input3: FileListingState) =>
                current ? "failed" : (input3 ?? "failed"),
              );
              callback2();
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
        held: (input: string) => Object.hasOwn(files, input),
        leftOut: new Set([...otherFiles, ...docsLeftOut]),
        bareCover: !components.some(
          (input: import("../../contracts").ParsedComponent) =>
            input.name === COVER_COMPONENT_NAME,
        ),
        listsSection: (input: string) =>
          sections.some((input2: DesignFilesSection) => input2.id === input),
      }),
      [files, otherFiles, docsLeftOut, components, sections],
    ),
    listedFiles =
      listing === null || listing === "failed"
        ? EMPTY_BROWSER_FILE_LIST
        : listing.files,
    browserPaths = reactDesignSystemFiles.useMemo(() => {
      let value = listedFiles
          .map((input: BrowserListingEntry) => input.path)
          .filter(
            (input: string) =>
              Object.hasOwn(files, input) ||
              !everHeldPathsRef.current.paths.has(input),
          ),
        values = new Set(value);
      for (let value2 of Object.keys(files)) {
        if (
          !values.has(value2) &&
          !(0, isHiddenBrowserPath)(value2)
        ) {
          value.push(value2);
        }
      }
      return value;
    }, [listedFiles, files]),
    unshownPaths = reactDesignSystemFiles.useMemo(
      () =>
        browserPaths.filter(
          (input: string) =>
            !input.startsWith(DESIGN_SYSTEM_PATHS.archivedDir) &&
            designSystemFileHome(input, pageContext).at === "nowhere",
        ),
      [browserPaths, pageContext],
    ),
    show = reactDesignSystemFiles.useCallback(
      (input?: string) => {
        if (!usesFilePort) {
          return;
        }
        restoreFocusRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        if (input !== undefined) {
          setReveal((input2: BrowserReveal | null) => ({
            path: input,
            n: (input2?.n ?? 0) + 1,
          }));
        }
        setOpen(true);
        openRef.current = true;
        setListing((input2: FileListingState) =>
          input2 === "failed" ? null : input2,
        );
        lastListedFilesRef.current = files;
        refreshListing(true);
      },
      [usesFilePort, files, refreshListing],
    ),
    closeInternal = reactDesignSystemFiles.useCallback(
      (input: boolean) => {
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
        if (input && current !== null && current.isConnected) {
          current.focus({
            preventScroll: true,
          });
        }
      },
      [open, listing, refreshListing],
    ),
    close = reactDesignSystemFiles.useCallback(
      (input: boolean = true) => closeInternal(input),
      [closeInternal],
    ),
    leave = reactDesignSystemFiles.useCallback(
      (input: () => void) => {
        closeInternal(false);
        input();
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
        (0, hasOpenOverlay)() ||
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
        goTo={(input: string) => leave(() => jump(input))}
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
              ...unshownPaths.map((input: string) => ({
                section: FILES_SECTION_ID,
                label: (0, visibleFileName)(
                  input.slice(input.lastIndexOf("/") + 1),
                ),
                words: [(0, visibleFileName)(input)],
                target: input,
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
        listed.map((input: BrowserListingEntry) => [input.path, input]),
      );
      return (0, buildFileBrowserTree)(
        paths.map((input: string) => {
          let value4 = Object.hasOwn(files, input) ? files[input] : undefined,
            entry = entries.get(input);
          if (
            entry !== undefined ||
            value4 === undefined ||
            (0, storagePointerForFile)(input, value4) !== null
          ) {
            return (
              entry ?? {
                path: input,
              }
            );
          }
          let value5 = (0, publishableFileMimeType)(input, value4);
          return {
            path: input,
            size: heldBrowserFileByteSize(input, value4),
            ...(value5 !== null
              ? {
                  contentType: value5,
                }
              : {}),
          };
        }),
      );
    }, [listed, paths, files]),
    [value, value2] = reactDesignSystemFiles.useState(() =>
      flaggedDesignSystemFiles(doc),
    );
  reactDesignSystemFiles.useEffect(() => {
    value2(flaggedDesignSystemFiles(doc));
    return doc.subscribeFlagged?.(() =>
      value2(flaggedDesignSystemFiles(doc)),
    );
  }, [doc]);
  let memo2 = reactDesignSystemFiles.useMemo(() => {
      let entries: Map<string, string> = new Map(
        (0, filesLeftOutOfMigration)(files)
          .filter(
            (input: { path: string; reason: string }) =>
              !(0, isHeldFilePointer)(
                input.path,
                files[input.path] ?? "",
              ),
          )
          .map((input: { path: string; reason: string }) => [
            input.path,
            input.reason,
          ]),
      );
      for (let value4 of value) {
        entries.set(value4, FILES_BROWSER_CONFLICT_REASON);
      }
      return entries;
    }, [files, value]),
    callback = (input: BrowserFile) => {
      let value4 = designSystemFileHome(input.path, page);
      if (value4.at === "section") {
        return sections.find(
          (input2: DesignFilesSection) => input2.id === value4.id,
        );
      } else {
        return undefined;
      }
    },
    value3 =
      designSystemDocumentIsReadonly(doc) &&
      listed.some(
        (input: BrowserListingEntry) =>
          input.path === DESIGN_SYSTEM_PATHS.manifest,
      ),
    callback2 = (input: BrowserFile) =>
      Object.hasOwn(files, input.path) &&
      !(value3 && input.path === DESIGN_SYSTEM_PATHS.manifest)
        ? files[input.path]
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
            sourceOf={(input: BrowserFile) =>
              heldFileBrowserSource(input.path, callback2(input))
            }
            retryMs={FILES_BROWSER_READ_RETRY_MS}
            fresh={true}
            reveal={reveal}
            htmlAsText={true}
            emptyText={
              unsure === "listing" ? ("") : (unsure !== null ? (FILES_LISTING_EMPTY_MESSAGES[unsure]) : (uiMessage("design-system.designSystemFiles.thisDesignSystemHasNo")))
            }
            downloadOf={() => ({})}
            kindLine={(input: BrowserFile, options: string) => {
              let value4 = designSystemFileHome(input.path, page),
                value5 =
                  value4.at === "written"
                    ? " · Generated by this page on every save"
                    : value4.at === "section"
                      ? " · Shown in " +
                        (callback(input)?.label ?? "a section of the page")
                      : "";
              return (
                options +
                value5 +
                (memo2.has(input.path) ? " · Not saved" : "")
              );
            }}
            footerOf={(input: BrowserFile) => {
              let value4 = callback(input),
                value5 =
                  value4 === undefined ? null : (
                    <Button
                      variant={"ghost"}
                      size={"sm"}
                      icon={"ArrowRight"}
                      className={"mt-3"}
                      data-testid={"ds-files-home"}
                      onClick={() => goTo(value4.id)}
                    >
                      {uiMessage("design-system.designSystemFiles.goTo", {label:value4.label})}
                    </Button>
                  ),
                entry = memo2.get(input.path);
              if (entry !== undefined) {
                return (
                  <jsxDesignSystemFiles.Fragment>
                    {[<p
                        data-testid={"ds-files-note"}
                        className={FILES_BROWSER_NOTE_CLASS}
                      >
                        {uiMessage("design-system.designSystemFiles.notSaved", {file:entry})}
                      </p>, value5]}
                  </jsxDesignSystemFiles.Fragment>
                );
              }
              if (value5 !== null) {
                return value5;
              }
              if (
                designSystemFileHome(input.path, page).at === "written" &&
                callback2(input) === undefined
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
    jsxDesignSystemFiles = (0, toModuleNamespace)(
      (0, loadJsxNamespace)(),
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
    heldBrowserFileByteSize = (input: string, items: string) => {
      let value = (0, isTextFilePath)(input)
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
    flaggedDesignSystemFiles = (input: DesignFilesDocument) =>
      new Set(input.flagged?.() ?? []);
    designSystemDocumentIsReadonly = (input: DesignFilesDocument) =>
      input.readOnly?.() === true;
  };
}
