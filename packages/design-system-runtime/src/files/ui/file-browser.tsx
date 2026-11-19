import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  BrowserEntryType,
  BrowserFileType,
  BrowserEntry,
  BrowserFolder,
  BrowserFile,
  BrowserRow,
  VirtualFileItem,
  VirtualFileStack,
  FilesBrowserProps,
  BrowserBreadcrumbProps,
  BrowserHeadingProps,
  BrowserRowProps,
  BrowserIconProps,
  BrowserPreviewProps,
  BrowserPreviewCardProps,
  BrowserImagePreviewProps,
  BrowserTextPreviewProps,
  BrowserDownloadButtonProps,
  FileBrowserSource,
  FileBrowserReads,
  FileDownloadSpec,
  DownloadData,
  HttpError,
  BrowserDownloadState,
} from "../../contracts/file-browser";
import { loadJsxNamespace } from "../../dependencies";
import { downloadsWithheld, get_DOWNLOADS_UNAVAILABLE_MESSAGE, hasDownloadCapability, normalizeDownloadName, saveThroughShell, useDownloadsWithheld } from "../../editor/download-permission";
import { fileMimeTypeFromPath, isRetryableFileReadAccessError, PROJECT_FILE_PREFIX, retryFileRead, stripFrameRuntimeBlock } from "../paths";
import { downloadMimeTypeFromName, FILE_BROWSER_KIND_LABELS, fileBrowserFolder, fileBrowserFolderLabel, fileBrowserMetadataText, fileBrowserNoPreviewReason, fileBrowserPreviewKind, flattenFileBrowserTree, folderFileCount, formatFileBrowserBytes, MAX_FILE_BROWSER_TEXT_BYTES, reactDomFilesBrowser, reactFilesBrowser, sanitizedFileName, stackVirtualFileRows, virtualFileRowScrollTop, visibleFileName, visibleVirtualFileRows } from "./file-tree";
import { isStoredBlobReference } from "../../media/assets";
import { toModuleNamespace } from "../../module-helpers";
import { Tooltip } from "../../ui/avatars";
import { Button } from "../../ui/buttons";
import { Icon } from "../../ui/interactions";
import { joinClassNames } from "../../ui/property-icons";
import { useMediaQuery } from "../../ui/select";

var jsxFilesBrowser: typeof import("react/jsx-runtime");
var FILE_BROWSER_ROW_HEIGHT: number;
var FILE_BROWSER_SELECTED_FORCED_COLORS_CLASS: string;
var FILE_BROWSER_SECTION_HEIGHT: number;
var FILE_BROWSER_ROW_ICON_SIZE: number;
var FILE_BROWSER_PREVIEW_WIDTH: number;
var FILE_BROWSER_PREVIEW_HEIGHT: number;
var FILE_BROWSER_OVERSCAN_PX: number;
var FILE_BROWSER_FALLBACK_VIEWPORT_HEIGHT: number;
var FILE_BROWSER_MOBILE_QUERY: string;
var FILE_BROWSER_NO_HOVER_QUERY: string;
var FILE_BROWSER_ICON_COLORS: Record<"surface" | "hover" | "line", string>;
var encodeFilePathPart: (path: string) => string;
var projectFileUrl: (path: string) => string;
var fileBrowserDefaultSource: (file: BrowserFile) => FileBrowserSource;
var fileCountLabel: (count: number, label: string) => string;
var parentFolderPath: (path: string) => string;
var fileBrowserEntryKey: (entry: BrowserEntry) => string;
var fileBrowserEntryEncoder: TextEncoder;
var fileBrowserEntryId: (path: string) => string;
var initialFileBrowserSelection: (
  folder: BrowserFolder,
  whyNot: (entry: BrowserEntry) => string | undefined,
) => string | null;
var FILE_BROWSER_ICON_GRADIENTS: Record<BrowserFileType, string>;
var FILE_BROWSER_ICON_SHADOW: string;
var MAX_DOWNLOAD_EXTENSION_LABEL_LENGTH: number;
var fileDownloadMimeMatchesName: (
  name: string,
  mime: string,
  expected?: string,
) => boolean;
var responseMimeType: (response: Response) => string;
var fileFetchHttpError: (status: number) => HttpError;
var fileFetchRetryDelays: (milliseconds: number) => number[];
var FILE_DOWNLOAD_MAX_RETRY_MS: number;
var FILE_BROWSER_PREVIEW_CARD_CLASS: string;
var fileBrowserPreviewCardStyle: (
  tall: boolean | undefined,
) => React.CSSProperties;
var FILE_BROWSER_LOAD_ERROR_TEXT: string;
var FILE_BROWSER_LOADING_TEXT: string;
function FilesBrowser({
  tree: tree,
  onClose: onClose,
  sourceOf = fileBrowserDefaultSource,
  retryMs = 0,
  fresh = false,
  downloadOf: downloadOf,
  typeOf: typeOf,
  whyNot: whyNot,
  openFile: openFile,
  preview: preview,
  htmlAsText: htmlAsText,
  kindLine: kindLine,
  tipOf: tipOf,
  footerOf: footerOf,
  rootLabel = "project",
  emptyText = uiMessage("design-system.fileBrowser.noFilesInThisProject"),
  reveal: reveal,
}: FilesBrowserProps) {
  useUiLocale();
  let [folderPath, setFolderPath] = reactFilesBrowser.useState(() =>
      reveal ? parentFolderPath(reveal.path) : "",
    ),
    validFolderPath =
      fileBrowserFolder(tree, folderPath) === null
        ? ""
        : folderPath,
    folder = fileBrowserFolder(tree, validFolderPath) ?? tree,
    [expandedFolders, setExpandedFolders] =
      reactFilesBrowser.useState(new Set<string>()),
    disabledReason = (source: BrowserEntry) =>
      source.kind === "file" ? whyNot?.(source) : undefined,
    [selectedKey, setSelectedKey] = reactFilesBrowser.useState(() =>
      reveal
        ? "file:" + reveal.path
        : initialFileBrowserSelection(tree, disabledReason),
    ),
    rows = reactFilesBrowser.useMemo(
      () => flattenFileBrowserTree(folder, expandedFolders),
      [folder, expandedFolders],
    ),
    empty = rows.length === 0,
    typesByEntry = reactFilesBrowser.useMemo(
      () =>
        new Map<string, BrowserEntryType>(
          rows.map((row: BrowserRow) => [
            fileBrowserEntryKey(row.entry),
            row.entry.kind === "folder"
              ? "folder"
              : (typeOf?.(row.entry) ?? row.entry.type),
          ]),
        ),
      [rows],
    ),
    mobile = useMediaQuery(FILE_BROWSER_MOBILE_QUERY),
    [showMobilePreview, setShowMobilePreview] =
      reactFilesBrowser.useState(() => mobile && reveal != null),
    withheldDownloads = useDownloadsWithheld(),
    treeRef = reactFilesBrowser.useRef<HTMLDivElement | null>(null),
    mobileBackRef =
      reactFilesBrowser.useRef<HTMLButtonElement | null>(null),
    selectedRowIndex = rows.findIndex(
      (row: BrowserRow) => fileBrowserEntryKey(row.entry) === selectedKey,
    ),
    selectedEntry = rows[selectedRowIndex]?.entry,
    mobilePreviewVisible =
      mobile && showMobilePreview && selectedEntry?.kind === "file",
    {
      items: virtualItems,
      heights: rowHeights,
      stack: virtualStack,
      itemOfRow: virtualRowIndices,
      sections: virtualSectionIndices,
    } = reactFilesBrowser.useMemo(() => {
      let items: VirtualFileItem[] = [],
        itemOffsets: number[] = [],
        sectionStarts: number[] = [];
      rows.forEach((row: BrowserRow, rowIndex: number) => {
        if (row.section !== undefined) {
          sectionStarts.push(
            items.push({
              kind: "section",
              label: row.section,
              first: row.first === true,
            }) - 1,
          );
        }
        itemOffsets.push(items.length);
        items.push({
          kind: "row",
          row: row,
          at: rowIndex,
        });
      });
      let value = items.map((source: VirtualFileItem) =>
        source.kind === "section"
          ? FILE_BROWSER_SECTION_HEIGHT
          : FILE_BROWSER_ROW_HEIGHT,
      );
      return {
        items: items,
        heights: value,
        stack: stackVirtualFileRows(value),
        itemOfRow: itemOffsets,
        sections: sectionStarts,
      };
    }, [rows]),
    [scrollTop, setScrollTop] = reactFilesBrowser.useState(0),
    [viewportHeight, setViewportHeight] =
      reactFilesBrowser.useState(0);
  reactFilesBrowser.useLayoutEffect(() => {
    let current = treeRef.current;
    if (current === null) {
      return;
    }
    let callback = () => setViewportHeight(current.clientHeight);
    callback();
    setScrollTop(current.scrollTop);
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    let observer = new ResizeObserver(callback);
    observer.observe(current);
    return () => observer.disconnect();
  }, [empty, mobilePreviewVisible]);
  let [firstVisibleItem, lastVisibleItem] = visibleVirtualFileRows(
      virtualStack,
      scrollTop,
      viewportHeight > 0
        ? viewportHeight
        : FILE_BROWSER_FALLBACK_VIEWPORT_HEIGHT,
      FILE_BROWSER_OVERSCAN_PX,
    ),
    visibleItemIndices: number[] = [];
  for (let value = firstVisibleItem; value < lastVisibleItem; value += 1) {
    visibleItemIndices.push(value);
  }
  let selectedVirtualItem = virtualRowIndices[selectedRowIndex];
  if (
    selectedVirtualItem !== undefined &&
    selectedVirtualItem < firstVisibleItem
  ) {
    visibleItemIndices.unshift(selectedVirtualItem);
  } else if (
    selectedVirtualItem !== undefined &&
    selectedVirtualItem >= lastVisibleItem
  ) {
    visibleItemIndices.push(selectedVirtualItem);
  }
  let pinnedSectionIndex = virtualSectionIndices
      .filter((rowIndex: number) => virtualStack.tops[rowIndex] <= scrollTop)
      .at(-1),
    pinnedSection =
      pinnedSectionIndex === undefined
        ? undefined
        : virtualItems[pinnedSectionIndex],
    scrollToRow = (rowIndex: number) => {
      let current = treeRef.current,
        value = virtualRowIndices[rowIndex];
      if (current === null || value === undefined) {
        return;
      }
      let targetScrollTop = virtualFileRowScrollTop(
        virtualStack,
        rowHeights,
        value,
        current.scrollTop,
        current.clientHeight > 0
          ? current.clientHeight
          : FILE_BROWSER_FALLBACK_VIEWPORT_HEIGHT,
        FILE_BROWSER_SECTION_HEIGHT,
      );
      current.scrollTop = targetScrollTop;
      setScrollTop(current.scrollTop);
    },
    listHasMountedRef = reactFilesBrowser.useRef(false);
  reactFilesBrowser.useEffect(() => {
    let activeElement = document.activeElement,
      value =
        activeElement instanceof HTMLElement &&
        (activeElement.isContentEditable ||
          ["INPUT", "TEXTAREA", "SELECT"].includes(activeElement.tagName)),
      isBodyActive = activeElement === null || activeElement === document.body;
    if (listHasMountedRef.current ? isBodyActive : !value) {
      treeRef.current?.focus({
        preventScroll: true,
      });
    }
    listHasMountedRef.current = true;
  }, [empty]);
  let enterFolder = (path: string) => {
      setFolderPath(path);
      setExpandedFolders(new Set());
      setSelectedKey(
        initialFileBrowserSelection(
          fileBrowserFolder(tree, path) ?? tree,
          disabledReason,
        ),
      );
      setShowMobilePreview(false);
      if (treeRef.current !== null) {
        treeRef.current.scrollTop = 0;
      }
      setScrollTop(0);
    },
    toggleFolder = (path: string) =>
      setExpandedFolders((expanded: Set<string>) => {
        let values = new Set(expanded);
        if (values.has(path)) {
          values.delete(path);
        } else {
          values.add(path);
        }
        return values;
      }),
    openEntry = (source: BrowserEntry) => {
      if (source.kind === "folder") {
        return enterFolder(source.path);
      }
      if (disabledReason(source) === undefined) {
        openFile?.(source)?.();
      }
    },
    selectEntry = (source: BrowserEntry) => {
      setSelectedKey(fileBrowserEntryKey(source));
      if (!mobile) {
        return setShowMobilePreview(false);
      }
      if (
        source.kind === "folder" ||
        (disabledReason(source) === undefined &&
          openFile?.(source) !== undefined)
      ) {
        openEntry(source);
      } else {
        setShowMobilePreview(true);
      }
    },
    backToTree = () => {
      reactDomFilesBrowser.flushSync(() =>
        setShowMobilePreview(false),
      );
      treeRef.current?.focus({
        preventScroll: true,
      });
    };
  reactFilesBrowser.useEffect(() => {
    if (mobilePreviewVisible) {
      mobileBackRef.current?.focus({
        preventScroll: true,
      });
    }
  }, [mobilePreviewVisible]);
  let mobilePreviewWasVisibleRef =
    reactFilesBrowser.useRef(mobilePreviewVisible);
  reactFilesBrowser.useLayoutEffect(() => {
    let current = treeRef.current,
      value = mobilePreviewWasVisibleRef.current && !mobilePreviewVisible;
    mobilePreviewWasVisibleRef.current = mobilePreviewVisible;
    if (!value || current === null) {
      return;
    }
    if (selectedRowIndex >= 0) {
      scrollToRow(selectedRowIndex);
    } else {
      setScrollTop(current.scrollTop);
    }
  }, [mobilePreviewVisible]);
  let pendingRevealRef = reactFilesBrowser.useRef(
    reveal ? "file:" + reveal.path : null,
  );
  reactFilesBrowser.useEffect(() => {
    if (reveal === undefined || reveal === null) {
      return;
    }
    setFolderPath(parentFolderPath(reveal.path));
    setExpandedFolders(new Set());
    setSelectedKey("file:" + reveal.path);
    setShowMobilePreview(mobile);
    pendingRevealRef.current = "file:" + reveal.path;
  }, [reveal?.path, reveal?.n]);
  reactFilesBrowser.useLayoutEffect(() => {
    if (
      pendingRevealRef.current === null ||
      pendingRevealRef.current !== selectedKey
    ) {
      return;
    }
    pendingRevealRef.current = null;
    if (selectedRowIndex >= 0) {
      scrollToRow(selectedRowIndex);
    } else {
      setSelectedKey(initialFileBrowserSelection(folder, disabledReason));
    }
  });
  reactFilesBrowser.useEffect(() => {
    if (selectedRowIndex < 0 && pendingRevealRef.current === null) {
      setSelectedKey(initialFileBrowserSelection(folder, disabledReason));
    }
  }, [tree]);
  let treeId = reactFilesBrowser.useId(),
    entryDomId = (source: BrowserEntry) =>
      treeId + "-" + source.kind + "-" + fileBrowserEntryId(source.path),
    handleTreeKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      let callback = (rowIndex: number) => {
        let value = Math.max(0, Math.min(rows.length - 1, rowIndex)),
          row = rows[value];
        if (!row) {
          return;
        }
        event.preventDefault();
        setSelectedKey(fileBrowserEntryKey(row.entry));
        if (!mobile) {
          setShowMobilePreview(false);
        }
        scrollToRow(value);
      };
      if (event.key === "ArrowDown") {
        callback(selectedRowIndex + 1);
      } else if (event.key === "ArrowUp") {
        callback(selectedRowIndex < 0 ? 0 : selectedRowIndex - 1);
      } else if (event.key === "Home") {
        callback(0);
      } else if (event.key === "End") {
        callback(rows.length - 1);
      } else if (
        selectedEntry &&
        (event.key === "Enter" || event.key === " ")
      ) {
        if ((event.preventDefault(), mobile)) {
          selectEntry(selectedEntry);
        } else {
          openEntry(selectedEntry);
        }
      } else if (
        selectedEntry?.kind === "folder" &&
        event.key === "ArrowRight"
      ) {
        if (expandedFolders.has(selectedEntry.path)) {
          callback(selectedRowIndex + 1);
        } else {
          event.preventDefault();
          toggleFolder(selectedEntry.path);
        }
      } else if (selectedEntry && event.key === "ArrowLeft") {
        if (
          selectedEntry.kind === "folder" &&
          expandedFolders.has(selectedEntry.path)
        ) {
          event.preventDefault();
          toggleFolder(selectedEntry.path);
        } else {
          let value = rows.findIndex(
            (row: BrowserRow) =>
              row.entry.kind === "folder" &&
              row.entry.path === parentFolderPath(selectedEntry.path) &&
              row.depth === (rows[selectedRowIndex]?.depth ?? 0) - 1,
          );
          if (value >= 0) {
            callback(value);
          }
        }
      } else if (event.key === "Backspace" && validFolderPath !== "") {
        event.preventDefault();
        enterFolder(parentFolderPath(validFolderPath));
      }
    },
    handlePreviewEscape = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Escape" || !mobilePreviewVisible) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      backToTree();
    },
    kindText = (source: BrowserEntry) => {
      let value = typesByEntry.get(fileBrowserEntryKey(source)) ?? "other";
      if (source.kind === "folder") {
        return (
          FILE_BROWSER_KIND_LABELS.folder +
          " · " +
          fileCountLabel(folderFileCount(source), "file")
        );
      }
      return (
        kindLine?.(source, FILE_BROWSER_KIND_LABELS[value]) ??
        FILE_BROWSER_KIND_LABELS[value]
      );
    },
    previewPanel =
      rows.length === 0 ? null : (
        <FileBrowserPreview
          entry={selectedEntry}
          type={
            selectedEntry
              ? (typesByEntry.get(fileBrowserEntryKey(selectedEntry)) ??
                "other")
              : "other"
          }
          kind={selectedEntry ? kindText(selectedEntry) : ""}
          tip={
            selectedEntry?.kind === "file"
              ? tipOf?.(selectedEntry, "card")
              : undefined
          }
          whyNot={selectedEntry ? disabledReason(selectedEntry) : undefined}
          big={mobilePreviewVisible}
          withheld={withheldDownloads}
          source={
            selectedEntry?.kind === "file"
              ? sourceOf(selectedEntry)
              : undefined
          }
          reads={{
            retryMs: retryMs,
            fresh: fresh,
          }}
          htmlAsText={htmlAsText === true}
          preview={preview}
          download={
            selectedEntry?.kind === "file"
              ? downloadOf?.(selectedEntry)
              : undefined
          }
          footer={
            selectedEntry?.kind === "file"
              ? footerOf?.(selectedEntry)
              : undefined
          }
          onOpen={
            selectedEntry === undefined
              ? undefined
              : selectedEntry.kind === "folder"
                ? () => openEntry(selectedEntry)
                : openFile?.(selectedEntry) !== undefined
                  ? () => openEntry(selectedEntry)
                  : undefined
          }
        />
      );
  return (
    <div
      data-testid={"files-browser"}
      className={
        "flex h-full min-h-0 w-full flex-col bg-surface-2 text-primary"
      }
      onKeyDown={handlePreviewEscape}
    >
      {[<div
          className={
            "flex shrink-0 items-center gap-1.5 border-b bg-surface-2 px-2.5 py-1.5"
          }
        >
          {[mobilePreviewVisible ? (
              <Button
                ref={mobileBackRef}
                variant={"ghost"}
                size={"sm"}
                icon={"ArrowLeft"}
                data-testid={"files-browser-back"}
                onClick={backToTree}
              >
                {uiMessage("design-system.fileBrowser.files")}
              </Button>
            ) : (
              <FileBrowserBreadcrumbs
                root={rootLabel}
                folder={validFolderPath}
                onEnter={enterFolder}
              />
            ), <span className={"flex-1"} />, <Tooltip
              content={"Close (Esc)"}
              side={"bottom"}
              hoverable={false}
            >
              <Button
                variant={"ghost"}
                size={"sm"}
                iconOnly={true}
                icon={"X"}
                aria-label={uiMessage("design-system.fileBrowser.closeTheFileBrowser")}
                data-testid={"files-browser-close"}
                onClick={onClose}
              />
            </Tooltip>]}
        </div>, <div className={"flex min-h-0 flex-1"}>
          {[rows.length === 0
              ? (() => {
                  const _Element = "div";
                  const _elementProps = {
                    "data-testid": "files-browser-empty",
                    className:
                      "flex flex-1 items-center justify-center px-6 text-center text-[13px] text-secondary",
                    children:
                      validFolderPath === ""
                        ? emptyText
                        : uiMessage("design-system.fileBrowser.thisFolderIsEmpty"),
                  };
                  const _elementKey = "empty";
                  return <_Element key={_elementKey} {..._elementProps} />;
                })()
              : (() => {
                  const ListElement = "div";
                  const listProps = {
                    ref: treeRef,
                    role: "tree",
                    get "aria-label"() { return uiMessage("design-system.fileBrowser.files"); },
                    "aria-activedescendant": selectedEntry
                      ? entryDomId(selectedEntry)
                      : undefined,
                    tabIndex: 0,
                    "data-testid": "files-browser-list",
                    className: joinClassNames(
                      "relative min-w-[200px] flex-[1_1_60%] overflow-auto outline-none focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-stronger focus-visible:ring-inset forced-colors:focus-visible:-outline-offset-2",
                      !mobile && "border-r",
                      mobilePreviewVisible && "hidden",
                    ),
                    onKeyDown: handleTreeKey,
                    onScroll: (scrollEvent: React.UIEvent<HTMLDivElement>) =>
                      setScrollTop(scrollEvent.currentTarget.scrollTop),
                    children: [
                      pinnedSection?.kind === "section" ? (
                        <div
                          role={"none"}
                          className={"sticky top-0 z-[1] h-0"}
                        >
                          <FileBrowserSectionHeading
                            label={pinnedSection.label}
                            first={true}
                            top={0}
                            pinned={true}
                          />
                        </div>
                      ) : null,
                      <div
                        role={"none"}
                        className={"relative"}
                        style={{
                          height: virtualStack.total,
                        }}
                      >
                        {visibleItemIndices.map((rowIndex: number) => {
                          let value = virtualItems[rowIndex];
                          if (value.kind === "section") {
                            return (() => {
                              const SectionHeading = FileBrowserSectionHeading;
                              const headingProps = {
                                label: value.label,
                                first: value.first,
                                top: virtualStack.tops[rowIndex],
                              };
                              const headingKey = "s:" + value.label;
                              return (
                                <SectionHeading
                                  key={headingKey}
                                  {...headingProps}
                                />
                              );
                            })();
                          } else {
                            return (() => {
                              const FileRow = FileBrowserRow;
                              const fileRowProps = {
                                id: entryDomId(value.row.entry),
                                row: value.row,
                                top: virtualStack.tops[rowIndex],
                                type:
                                  typesByEntry.get(
                                    fileBrowserEntryKey(value.row.entry),
                                  ) ?? "other",
                                kind: kindText(value.row.entry),
                                tip:
                                  value.row.entry.kind === "file"
                                    ? tipOf?.(value.row.entry, "row")
                                    : undefined,
                                selected:
                                  fileBrowserEntryKey(value.row.entry) ===
                                  selectedKey,
                                expanded:
                                  value.row.entry.kind === "folder" &&
                                  expandedFolders.has(value.row.entry.path),
                                dimmed: disabledReason(value.row.entry),
                                onSelect: () => selectEntry(value.row.entry),
                                onOpen: () => openEntry(value.row.entry),
                                onToggle: () =>
                                  toggleFolder(value.row.entry.path),
                              };
                              const fileRowKey = fileBrowserEntryKey(
                                value.row.entry,
                              );
                              return (
                                <FileRow
                                  key={fileRowKey}
                                  {...fileRowProps}
                                />
                              );
                            })();
                          }
                        })}
                      </div>,
                    ],
                  };
                  const listKey = "list";
                  return <ListElement key={listKey} {...listProps} />;
                })(), mobile && !mobilePreviewVisible ? null : previewPanel]}
        </div>]}
    </div>
  );
}
function FileBrowserBreadcrumbs({
  root: root,
  folder: folder,
  onEnter: onEnter,
}: BrowserBreadcrumbProps) {
  useUiLocale();
  let ref = reactFilesBrowser.useRef<HTMLElement | null>(null);
  reactFilesBrowser.useLayoutEffect(() => {
    if (ref.current !== null) {
      ref.current.scrollLeft = ref.current.scrollWidth;
    }
  }, [folder]);
  let items = [root, ...(folder === "" ? [] : folder.split("/"))];
  return (
    <nav
      ref={ref}
      aria-label={uiMessage("design-system.fileBrowser.folder")}
      className={
        "flex min-w-0 items-center gap-0.5 overflow-x-auto p-px [scrollbar-width:none]"
      }
    >
      {items.map((path: string, pathIndex: number) => {
        let value = pathIndex === items.length - 1;
        return (() => {
          const Fragment = reactFilesBrowser.Fragment;
          const breadcrumbProps = {
            children: [
              pathIndex > 0 ? (
                <span
                  aria-hidden={"true"}
                  className={"flex shrink-0 items-center text-disabled"}
                >
                  <Icon name={"CaretRight"} size={"xs"} />
                </span>
              ) : null,
              <button
                type={"button"}
                aria-current={value ? "location" : undefined}
                data-testid={"files-browser-crumb"}
                className={joinClassNames(
                  "shrink-0 whitespace-nowrap rounded-[4px] px-[5px] py-0.5 text-[11px] outline-none focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-stronger forced-colors:focus-visible:-outline-offset-1 pointer-coarse:min-h-10 pointer-coarse:min-w-10 pointer-coarse:px-2",
                  value
                    ? "cursor-default font-medium text-secondary"
                    : "cursor-pointer font-normal text-secondary hover:text-primary",
                )}
                onClick={() => {
                  if (!value) {
                    onEnter(items.slice(1, pathIndex + 1).join("/"));
                  }
                }}
              >
                {pathIndex === 0 ? (path) : (visibleFileName(
                      fileBrowserFolderLabel(path),
                    ))}
              </button>,
            ],
          };
          const breadcrumbKey = String(pathIndex) + "/" + path;
          return <Fragment key={breadcrumbKey} {...breadcrumbProps} />;
        })();
      })}
    </nav>
  );
}
function FileBrowserSectionHeading({
  label: label,
  first: first,
  top: top,
  pinned: pinned,
}: BrowserHeadingProps) {
  useUiLocale();
  return (
    <div
      aria-hidden={"true"}
      data-testid={
        pinned === true
          ? "files-browser-section-pinned"
          : "files-browser-section"
      }
      className={joinClassNames(
        "absolute inset-x-0 flex items-end gap-1.5 border-b bg-page px-3.5 pb-1.5 text-[10px] font-[650] [font-variation-settings:normal] tracking-[0.6px] text-secondary uppercase",
        !first && "border-t",
      )}
      style={{
        height: FILE_BROWSER_SECTION_HEIGHT,
        top: top,
      }}
    >
      {label}
    </div>
  );
}
function FileBrowserRow({
  id: id,
  row: row,
  top: top,
  type: type,
  kind: kind,
  tip: tip,
  selected: selected,
  expanded: expanded,
  dimmed: dimmed,
  onSelect: onSelect,
  onOpen: onOpen,
  onToggle: onToggle,
}: BrowserRowProps) {
  useUiLocale();
  let { entry: value, depth: depth } = row,
    displayName = visibleFileName(
      value.kind === "folder"
        ? fileBrowserFolderLabel(value.name)
        : value.name,
    ),
    metadataText =
      value.kind === "file"
        ? formatFileBrowserBytes(value.size)
        : "";
  return (
    <div
      id={id}
      role={"treeitem"}
      aria-level={depth + 1}
      aria-setsize={row.of}
      aria-posinset={row.pos}
      aria-selected={selected}
      aria-expanded={value.kind === "folder" ? expanded : undefined}
      aria-disabled={dimmed !== undefined ? true : undefined}
      data-testid={"files-browser-row"}
      data-path={value.path}
      title={
        (dimmed ?? tip) ?? (metadataText !== "" ? (((displayName) + (" · ")) + (metadataText)) : (displayName))
      }
      className={joinClassNames(
        "group absolute inset-x-0 flex cursor-default items-center gap-2 border-b-[0.5px] pr-3.5",
        selected
          ? "bg-fill-accent hover:bg-fill-accent forced-colors:bg-[color:Highlight] forced-colors:hover:bg-[color:Highlight] forced-colors:[&>span[aria-hidden=true]]:forced-color-adjust-none"
          : "bg-transparent hover:bg-fill-ghost-hover",
        dimmed !== undefined && "opacity-45 hover:bg-transparent",
      )}
      style={{
        top: top,
        height: FILE_BROWSER_ROW_HEIGHT,
        paddingLeft: 14 + depth * 20,
      }}
      onClick={onSelect}
      onDoubleClick={dimmed !== undefined ? undefined : onOpen}
    >
      {[value.kind === "folder" ? (
          <span
            aria-hidden={"true"}
            data-testid={"files-browser-caret"}
            className={joinClassNames(
              "relative flex w-3.5 cursor-default items-center justify-center before:absolute before:inset-[-10px] before:content-[''] pointer-coarse:before:inset-[-13px]",
              selected ? "text-on-accent" : "text-secondary",
              selected && FILE_BROWSER_SELECTED_FORCED_COLORS_CLASS,
            )}
            onClick={(clickEvent: React.MouseEvent<HTMLElement>) => {
              clickEvent.stopPropagation();
              onToggle();
            }}
            onDoubleClick={(clickEvent: React.MouseEvent<HTMLElement>) =>
              clickEvent.stopPropagation()
            }
          >
            <Icon
              name={expanded ? "CaretDown" : "CaretRight"}
              size={"xs"}
              className={"scale-75"}
            />
          </span>
        ) : (
          <span aria-hidden={"true"} className={"w-3.5 shrink-0"} />
        ), <FileBrowserIcon type={type} size={FILE_BROWSER_ROW_ICON_SIZE} />, <span className={"flex min-w-0 flex-1 flex-col justify-center"}>
          {[<span
              className={joinClassNames(
                "truncate text-xs font-medium",
                selected ? "text-on-accent" : "text-primary",
                selected && FILE_BROWSER_SELECTED_FORCED_COLORS_CLASS,
              )}
            >
              {displayName}
            </span>, <span
              className={joinClassNames(
                "mt-px min-h-[13px] truncate text-[10px]",
                selected ? "text-on-accent/60" : "text-secondary",
                selected && FILE_BROWSER_SELECTED_FORCED_COLORS_CLASS,
              )}
            >
              {kind}
            </span>]}
        </span>, <span
          className={joinClassNames(
            "w-20 shrink-0 text-right text-[11px]",
            selected ? "text-on-accent/50" : "text-secondary",
            selected && FILE_BROWSER_SELECTED_FORCED_COLORS_CLASS,
          )}
        >
          {metadataText}
        </span>]}
    </div>
  );
}
function FileBrowserIcon({ type: type, size: size }: BrowserIconProps) {
  useUiLocale();
  let state = {
      width: size,
      height: size,
    },
    value: React.ReactNode;
  if (type === "folder") {
    value = (
      <span
        style={{
          width: size,
          height: size * 0.7,
          background: FILE_BROWSER_ICON_COLORS.surface,
          border: "1px solid " + FILE_BROWSER_ICON_COLORS.line,
          borderRadius: 4,
          position: "relative",
          overflow: "hidden",
          boxShadow: FILE_BROWSER_ICON_SHADOW,
          display: "block",
        }}
      >
        {[<span
            style={{
              position: "absolute",
              top: -4,
              left: 4,
              width: 10,
              height: 5,
              background: FILE_BROWSER_ICON_COLORS.hover,
              borderRadius: "3px 3px 0 0",
              borderLeft: "1px solid " + FILE_BROWSER_ICON_COLORS.line,
              borderRight: "1px solid " + FILE_BROWSER_ICON_COLORS.line,
              borderTop: "1px solid " + FILE_BROWSER_ICON_COLORS.line,
            }}
          />, <span
            style={{
              position: "absolute",
              top: 5,
              left: 0,
              right: 0,
              bottom: 0,
              background: FILE_BROWSER_ICON_COLORS.hover,
              borderTop: "1px solid " + FILE_BROWSER_ICON_COLORS.line,
            }}
          />]}
      </span>
    );
  } else if (type === "deck") {
    let iconSize = Math.round(size * 0.72),
      strokeWidth = Math.max(2, Math.round(size * 0.09));
    value = (
      <span
        style={{
          position: "relative",
          width: size,
          height: iconSize,
          display: "block",
        }}
      >
        {[<span
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: size - strokeWidth,
              height: iconSize - strokeWidth,
              background: FILE_BROWSER_ICON_COLORS.surface,
              border: "1px solid " + FILE_BROWSER_ICON_COLORS.line,
              borderRadius: 3,
            }}
          />, <span
            style={{
              position: "absolute",
              bottom: 0,
              right: 0,
              width: size - strokeWidth,
              height: iconSize - strokeWidth,
              background: FILE_BROWSER_ICON_GRADIENTS.deck,
              border: "1px solid " + FILE_BROWSER_ICON_COLORS.line,
              borderRadius: 3,
              boxShadow: FILE_BROWSER_ICON_SHADOW,
              padding: 3,
              display: "block",
            }}
          >
            <span
              style={{
                display: "block",
                height: "28%",
                width: "45%",
                background: "rgba(0,0,0,0.16)",
                borderRadius: 1,
              }}
            />
          </span>]}
      </span>
    );
  } else {
    value = (
      <span
        style={{
          width: size * 0.75,
          height: size,
          background: FILE_BROWSER_ICON_GRADIENTS[type],
          borderRadius: 3,
          border: "1px solid " + FILE_BROWSER_ICON_COLORS.line,
          padding: 3,
          display: "flex",
          flexDirection: "column",
          position: "relative",
          boxShadow: FILE_BROWSER_ICON_SHADOW,
        }}
      >
        {[<span
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: 5,
              height: 5,
              background: "rgba(255,255,255,0.6)",
              borderBottomLeftRadius: 3,
              borderLeft: "0.5px solid " + FILE_BROWSER_ICON_COLORS.line,
              borderBottom: "0.5px solid " + FILE_BROWSER_ICON_COLORS.line,
            }}
          />, type === "image" ? (
            <span
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "rgba(11,11,11,0.2)",
              }}
            >
              <Icon
                name={"Image"}
                size={"xs"}
                className={"scale-[0.67]"}
              />
            </span>
          ) : (
            <span
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                paddingTop: 3,
                gap: 2,
              }}
            >
              {[<span
                  style={{
                    height: 1.5,
                    background: "rgba(0,0,0,0.12)",
                    borderRadius: 1,
                    width: "55%",
                  }}
                />, <span
                  style={{
                    height: 1,
                    background: "rgba(0,0,0,0.08)",
                    borderRadius: 1,
                    width: "80%",
                  }}
                />, <span
                  style={{
                    height: 1,
                    background: "rgba(0,0,0,0.08)",
                    borderRadius: 1,
                    width: "65%",
                  }}
                />]}
            </span>
          )]}
      </span>
    );
  }
  return (
    <span
      aria-hidden={"true"}
      className={"flex shrink-0 items-center justify-center"}
      style={state}
    >
      {value}
    </span>
  );
}
function FileBrowserPreview({
  entry: entry,
  type: type,
  kind: kind,
  tip: tip,
  whyNot: whyNot,
  big: big,
  withheld: withheld,
  source: source,
  reads: reads,
  htmlAsText: htmlAsText,
  preview: preview,
  download: download,
  footer: footer,
  onOpen: onOpen,
}: BrowserPreviewProps) {
  useUiLocale();
  let value = useMediaQuery(FILE_BROWSER_NO_HOVER_QUERY),
    previewClassName = joinClassNames(
      "flex flex-col items-center overflow-auto bg-page p-5",
      big ? "min-w-0 flex-1" : "min-w-[180px] flex-[0_0_40%]",
    );
  if (!entry) {
    return (
      <div data-testid={"files-browser-preview"} className={previewClassName}>
        <div
          className={
            "flex flex-1 items-center justify-center text-xs text-secondary"
          }
        >
          {uiMessage("design-system.fileBrowser.selectAFileToPreview")}
        </div>
      </div>
    );
  }
  let displayName = visibleFileName(
      entry.kind === "folder"
        ? fileBrowserFolderLabel(entry.name)
        : entry.name,
    ),
    canOpen = onOpen !== undefined && whyNot === undefined,
    metadataText = fileBrowserMetadataText(entry),
    previewSource =
      value &&
      entry.kind === "file" &&
      source !== undefined &&
      fileBrowserPreviewKind(entry, {
        htmlAsText: htmlAsText,
      }) === "none" &&
      preview?.(entry, 0) === undefined &&
      entry.kind === "file"
        ? (tip ??
          fileBrowserNoPreviewReason(entry, {
            htmlAsText: htmlAsText,
          }))
        : undefined;
  return (
    <div data-testid={"files-browser-preview"} className={previewClassName}>
      {[(() => {
          const PreviewCard = FileBrowserPreviewCard;
          const previewProps = {
            entry: entry,
            type: type,
            tip: whyNot ?? tip,
            tall: big,
            source: source,
            reads: reads,
            htmlAsText: htmlAsText,
            preview: preview,
            onOpen: canOpen ? onOpen : undefined,
          };
          const previewKey = entry.kind + ":" + entry.path;
          return <PreviewCard key={previewKey} {...previewProps} />;
        })(), <div
          className={"my-3 flex flex-wrap items-center justify-center gap-2"}
        >
          {[onOpen !== undefined || whyNot !== undefined ? (
              <Button
                variant={"secondary"}
                size={"sm"}
                icon={
                  entry.kind === "folder" ? "FolderOpen" : "ArrowOutSquare"
                }
                data-testid={"files-browser-open"}
                disabled={!canOpen}
                disabledReason={whyNot}
                onClick={onOpen}
              >
                {entry.kind === "folder" ? (uiMessage("design-system.fileBrowser.openFolder")) : (uiMessage("design-system.fileBrowser.open"))}
              </Button>
            ) : null, entry.kind === "file" &&
            download !== undefined &&
            source !== undefined
              ? (() => {
                  const DownloadButton = FileBrowserDownloadButton;
                  const downloadProps = {
                    file: entry,
                    from: download,
                    source: source,
                    reads: reads,
                    withheld: withheld,
                    noHover: value,
                  };
                  const downloadKey = "dl:" + entry.path;
                  return <DownloadButton key={downloadKey} {...downloadProps} />;
                })()
              : null, value && whyNot !== undefined ? (
              <div
                data-testid={"files-browser-open-note"}
                className={
                  "basis-full text-center text-[11px] leading-[1.4] text-secondary"
                }
              >
                {whyNot}
              </div>
            ) : null, value && whyNot === undefined && previewSource !== undefined ? (
              <div
                data-testid={"files-browser-preview-note"}
                className={
                  "basis-full text-center text-[11px] leading-[1.4] text-secondary"
                }
              >
                {previewSource}
              </div>
            ) : null]}
        </div>, <div
          className={
            "mb-1 text-center text-sm font-semibold break-words text-primary"
          }
        >
          {displayName}
        </div>, <div
          className={
            "mb-3.5 text-center text-[11px] leading-[1.4] text-secondary"
          }
        >
          {kind}
        </div>, metadataText === "" ? null : (
          <div className={"text-center text-[11px] text-secondary"}>
            {metadataText}
          </div>
        ), footer]}
    </div>
  );
}
function fileDownloadFailureMessage(name: string, code: string | undefined) {
  let cleanName = sanitizedFileName(name),
    dot = cleanName.lastIndexOf("."),
    extension =
      dot <= 0 || dot === cleanName.length - 1
        ? ""
        : cleanName.slice(dot).toLowerCase(),
    kindLabel =
      extension === ""
        ? uiMessage("design-system.fileBrowser.filesWithNoExtension")
        : extension.length > MAX_DOWNLOAD_EXTENSION_LABEL_LENGTH
          ? uiMessage("design-system.fileBrowser.filesOfThisKind")
          : uiMessage("design-system.fileBrowser.filesEndingIn") + extension;
  switch (code) {
    case "rejected_extension":
      return kindLabel + " can’t be downloaded here";
    case "extension_not_enabled":
      return kindLabel + " can’t be downloaded here yet";
    case "too_large":
      return uiMessage("design-system.fileBrowser.thisFileIsTooLarge");
    case "rate_limited":
      return uiMessage("design-system.fileBrowser.theSaveDidnTGo");
    default:
      return uiMessage("design-system.fileBrowser.theSaveDidnTGo2");
  }
}
function fileDownloadDisabledReason(name: string, withheld: boolean | undefined) {
  if (withheld === true) {
    return get_DOWNLOADS_UNAVAILABLE_MESSAGE();
  }
  if (
    hasDownloadCapability() &&
    !normalizeDownloadName(name)
  ) {
    return fileDownloadFailureMessage(name, "rejected_extension");
  }
  return;
}
function fetchFileWithRetries(
  url: string,
  retryMs: number,
  signal?: AbortSignal,
  fresh: boolean = false,
) {
  return retryFileRead(
    async (): Promise<Response> => {
      let value = await fetch(url, {
        credentials: "same-origin",
        ...(fresh
          ? {
              cache: "no-store",
            }
          : {}),
        ...(signal !== undefined
          ? {
              signal: signal,
            }
          : {}),
      });
      if (!value.ok) {
        throw fileFetchHttpError(value.status);
      }
      return value;
    },
    undefined,
    undefined,
    fileFetchRetryDelays(retryMs),
  );
}
function decodeFileDataUri(dataUri: string) {
  let match = /^data:([^;,]*)((?:;[^;,]*)*),/.exec(dataUri);
  if (match === null) {
    return null;
  }
  let payload = dataUri.slice(match[0].length);
  try {
    if (/;base64$/i.test(match[2] ?? "")) {
      return {
        bytes: Uint8Array.from(atob(payload), (byte: string) =>
          byte.charCodeAt(0),
        ),
        contentType: (match[1] ?? "").toLowerCase() || "text/plain",
      };
    }
    return {
      bytes: new TextEncoder().encode(decodeURIComponent(payload)),
      contentType: (match[1] ?? "").toLowerCase() || "text/plain",
    };
  } catch {
    return null;
  }
}
async function readFileBrowserDownload(
  name: string,
  source: FileBrowserSource,
  reads: FileBrowserReads,
  signal?: AbortSignal,
): Promise<DownloadData> {
  let mime =
    downloadMimeTypeFromName(name) ??
    fileMimeTypeFromPath(sanitizedFileName(name));
  if ("text" in source) {
    return {
      bytes: new TextEncoder().encode(source.text),
      contentType: mime ?? "text/plain",
    };
  }
  if ("dataUri" in source) {
    let value = decodeFileDataUri(source.dataUri);
    if (value === null) {
      throw Error("unreadable");
    }
    return {
      bytes: value.bytes,
      contentType: mime ?? value.contentType,
    };
  }
  let response = await fetchFileWithRetries(
    source.url,
    Math.min(reads.retryMs, FILE_DOWNLOAD_MAX_RETRY_MS),
    signal,
    reads.fresh,
  );
  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    contentType: responseMimeType(response),
  };
}
async function readArtifactBlobDownload(
  url: string,
  signal?: AbortSignal,
): Promise<DownloadData> {
  if (!isStoredBlobReference(url)) {
    throw Error(uiMessage("design-system.fileBrowser.notABlobOfThis"));
  }
  let response = await fetch(url, {
    credentials: "same-origin",
    signal: signal,
  });
  if (!response.ok) {
    throw fileFetchHttpError(response.status);
  }
  return {
    bytes: new Uint8Array(await response.arrayBuffer()),
    contentType: responseMimeType(response),
  };
}
function useFileBrowserDownload(
  file: BrowserFile,
  download: FileDownloadSpec,
  source: FileBrowserSource,
  reads: FileBrowserReads,
  withheld: boolean | undefined,
) {
  let [busy, setBusy] = reactFilesBrowser.useState(false),
    [note, setNote] = reactFilesBrowser.useState<string | null>(null),
    name = file.name,
    tip = fileDownloadDisabledReason(name, withheld),
    abortRef = reactFilesBrowser.useRef<AbortController | null>(null);
  reactFilesBrowser.useEffect(
    () => () => abortRef.current?.abort(),
    [],
  );
  return {
    tip: tip,
    note: note,
    busy: busy,
    run: () => {
      let value = (abortRef.current = new AbortController());
      (async (): Promise<void> => {
        setBusy(true);
        setNote(uiMessage("design-system.fileBrowser.readingThisFile"));
        try {
          if (!hasDownloadCapability()) {
            setNote(uiMessage("design-system.fileBrowser.downloadsArenTAvailableIn"));
            return;
          }
          let downloadResult = await downloadsWithheld();
          if (value.signal.aborted) {
            return;
          }
          if (downloadResult) {
            setNote(get_DOWNLOADS_UNAVAILABLE_MESSAGE());
            return;
          }
          let downloadData: DownloadData;
          try {
            downloadData =
              download.url === undefined
                ? await readFileBrowserDownload(
                    name,
                    source,
                    reads,
                    value.signal,
                  )
                : await readArtifactBlobDownload(download.url, value.signal);
          } catch (error: unknown) {
            if (value.signal.aborted) {
              return;
            }
            let errorStatus: unknown = (error as Partial<HttpError> | null)
              ?.status;
            setNote(
              errorStatus === 404 || errorStatus === 403 || errorStatus === 401
                ? uiMessage("design-system.fileBrowser.thisFileIsnTAvailable")
                : typeof errorStatus === "number" && errorStatus > 0
                  ? uiMessage("design-system.fileBrowser.couldnTDownloadThisFile") +
                    String(errorStatus) +
                    "). Try again"
                  : uiMessage("design-system.fileBrowser.couldnTDownloadThisFile2"),
            );
            return;
          }
          if (value.signal.aborted) {
            return;
          }
          setNote(null);
          if (
            !fileDownloadMimeMatchesName(
              name,
              downloadData.contentType,
              download.type,
            )
          ) {
            setNote(
              uiMessage("design-system.fileBrowser.thisIsnTTheKind"),
            );
            return;
          }
          let saveResult = await saveThroughShell(
            new Blob([downloadData.bytes], {
              type: downloadData.contentType,
            }),
            name,
          );
          if (value.signal.aborted) {
            return;
          }
          if (saveResult.outcome === "saved") {
            setNote(uiMessage("design-system.fileBrowser.saved") + visibleFileName(name));
          } else if (saveResult.outcome === "withheld") {
            setNote(get_DOWNLOADS_UNAVAILABLE_MESSAGE());
          } else if (saveResult.outcome === "unsupported") {
            setNote(
              saveResult.code === "no_shell_save"
                ? uiMessage("design-system.fileBrowser.downloadsArenTAvailableIn")
                : fileDownloadFailureMessage(name, saveResult.code),
            );
          }
        } catch {
          if (!value.signal.aborted) {
            setNote(uiMessage("design-system.fileBrowser.couldnTDownloadThisFile2"));
          }
        } finally {
          if (!value.signal.aborted) {
            setBusy(false);
          }
        }
      })();
    },
  };
}
function FileBrowserDownloadButton({
  file: file,
  from: from,
  source: source,
  reads: reads,
  withheld: withheld,
  noHover: noHover,
}: BrowserDownloadButtonProps) {
  useUiLocale();
  let value = useFileBrowserDownload(file, from, source, reads, withheld),
    note = value.note ?? (noHover ? (value.tip ?? null) : null);
  return (
    <jsxFilesBrowser.Fragment>
      {[<Button
          variant={"secondary"}
          size={"sm"}
          icon={"Download"}
          data-testid={"files-browser-download"}
          disabled={value.tip !== undefined || value.busy}
          disabledReason={value.tip}
          onClick={value.run}
        >
          {uiMessage("design-system.fileBrowser.download")}
        </Button>, <div
          role={"status"}
          data-testid={"files-browser-download-note"}
          className={joinClassNames(
            "basis-full text-center text-[11px] leading-[1.4] text-secondary",
            note === null && "sr-only",
          )}
        >
          {note ?? ("")}
        </div>]}
    </jsxFilesBrowser.Fragment>
  );
}
function useFilePreviewWidth(): [
  React.Dispatch<React.SetStateAction<HTMLDivElement | null>>,
  number,
] {
  let [value, containerWidth] =
      reactFilesBrowser.useState<HTMLDivElement | null>(null),
    [previewWidth, setPreviewWidth] = reactFilesBrowser.useState(0);
  reactFilesBrowser.useLayoutEffect(() => {
    if (value === null) {
      return;
    }
    setPreviewWidth(value.getBoundingClientRect().width);
    if (typeof ResizeObserver === "undefined") {
      return;
    }
    let observer = new ResizeObserver(() =>
      setPreviewWidth(value.getBoundingClientRect().width),
    );
    observer.observe(value);
    return () => observer.disconnect();
  }, [value]);
  return [containerWidth, previewWidth];
}
function FileBrowserPreviewCard({
  entry: entry,
  type: type,
  tip: tip,
  tall: tall,
  source: source,
  reads: reads,
  htmlAsText: htmlAsText,
  preview: preview,
  onOpen: onOpen,
}: BrowserPreviewCardProps) {
  useUiLocale();
  let [value, previewWidth] = useFilePreviewWidth(),
    previewElement =
      entry.kind === "file" && preview !== undefined
        ? preview(entry, previewWidth)
        : undefined;
  if (previewElement !== undefined) {
    return (
      <div
        ref={value}
        data-testid={"files-browser-card"}
        className={joinClassNames(
          FILE_BROWSER_PREVIEW_CARD_CLASS,
          onOpen && "cursor-pointer",
        )}
        style={fileBrowserPreviewCardStyle(false)}
        onClick={onOpen}
        title={onOpen ? (uiMessage("design-system.fileBrowser.clickToOpen")) : (undefined)}
      >
        {previewWidth > 0 ? (previewElement) : (null)}
      </div>
    );
  }
  let sourceKind =
    entry.kind === "file" && source !== undefined
      ? fileBrowserPreviewKind(entry, {
          htmlAsText: htmlAsText,
        })
      : "none";
  if (entry.kind === "file" && source !== undefined && sourceKind === "image") {
    return (
      <FileBrowserImagePreview
        file={entry}
        source={source}
        retryMs={reads.retryMs}
        tall={tall}
      />
    );
  }
  if (entry.kind === "file" && source !== undefined && sourceKind === "text") {
    return (
      <FileBrowserTextPreview source={source} reads={reads} tall={tall} />
    );
  }
  return (
    <div
      data-testid={"files-browser-card"}
      className={joinClassNames(
        FILE_BROWSER_PREVIEW_CARD_CLASS,
        onOpen && "cursor-pointer",
      )}
      style={fileBrowserPreviewCardStyle(false)}
      onClick={onOpen}
      title={
        onOpen ? (uiMessage("design-system.fileBrowser.clickToOpen")) : (tip ?? (entry.kind === "file" ? (fileBrowserNoPreviewReason(entry, {
                  htmlAsText: htmlAsText,
                })) : (undefined)))
      }
    >
      <FileBrowserIcon type={type} size={48} />
    </div>
  );
}
function FileBrowserImagePreview({
  file: file,
  source: source,
  retryMs: retryMs,
  tall: tall,
}: BrowserImagePreviewProps) {
  useUiLocale();
  let value = "url" in source ? source.url : null,
    textSource = "text" in source ? source.text : null,
    dataUriSource = "dataUri" in source ? source.dataUri : null,
    contentType = file.contentType ?? "image/svg+xml",
    memo = reactFilesBrowser.useMemo(() => {
      if (textSource === null) {
        return value ?? dataUriSource;
      }
      try {
        return (
          "data:" + contentType + ";charset=utf-8," + encodeURIComponent(textSource)
        );
      } catch {
        return null;
      }
    }, [value, textSource, dataUriSource, contentType]),
    [retryAttempt, setRetryIndex] = reactFilesBrowser.useState(0),
    [imageState, setImageState] = reactFilesBrowser.useState("drawing"),
    ref = reactFilesBrowser.useRef<AbortController | null>(null);
  reactFilesBrowser.useEffect(() => {
    setRetryIndex(0);
    setImageState("drawing");
    hasRetried.current = false;
    return () => ref.current?.abort();
  }, [memo]);
  let hasRetried = reactFilesBrowser.useRef(false),
    callback = () => {
      let retryDelay = fileFetchRetryDelays(retryMs)[retryAttempt];
      if (value === null || hasRetried.current || retryDelay === undefined) {
        return setImageState("failed");
      }
      let abortController = (ref.current = new AbortController());
      setImageState("waiting");
      fetch(value, {
        credentials: "same-origin",
        signal: abortController.signal,
      })
        .then((state: Response) => {
          state.body?.cancel().catch(() => {
            return;
          });
          if (abortController.signal.aborted) {
            return;
          }
          if (state.ok) {
            hasRetried.current = true;
          } else if (
            !isRetryableFileReadAccessError({
              status: state.status,
            })
          ) {
            throw Error(uiMessage("design-system.fileBrowser.willNotDraw"));
          }
          return new Promise((resolve: (value?: unknown) => void) =>
            setTimeout(resolve, state.ok ? 0 : retryDelay),
          );
        })
        .then(() => {
          if (!abortController.signal.aborted) {
            setRetryIndex((retryIndex: number) => retryIndex + 1);
            setImageState("drawing");
          }
        })
        .catch(() => {
          if (!abortController.signal.aborted) {
            setImageState("failed");
          }
        });
    };
  return (
    <div
      data-testid={"files-browser-card"}
      className={FILE_BROWSER_PREVIEW_CARD_CLASS}
      style={fileBrowserPreviewCardStyle(tall)}
    >
      {imageState === "failed" || memo === null ? (<div className={"text-xs text-secondary"}>
          {uiMessage("design-system.fileBrowser.couldnTLoadThisFile")}
        </div>) : (imageState === "waiting" ? (<div className={"text-xs text-secondary"}>
          {FILE_BROWSER_LOADING_TEXT}
        </div>) : ((() => {
          const _Element8 = "img";
          const _elementProps8 = {
            src: memo,
            alt: "",
            draggable: false,
            onError: callback,
            className:
              "pointer-events-none h-full w-full object-contain select-none",
          };
          const _elementKey8 = retryAttempt;
          return <_Element8 key={_elementKey8} {..._elementProps8} />;
        })()))}
    </div>
  );
}
function FileBrowserTextPreview({
  source: source,
  reads: reads,
  tall: tall,
}: BrowserTextPreviewProps) {
  useUiLocale();
  let { retryMs: value, fresh: retryMs } = reads,
    sourceUrl = "url" in source ? source.url : null,
    sourceText = "text" in source ? source.text : null,
    sourceDataUri = "dataUri" in source ? source.dataUri : null,
    memo = reactFilesBrowser.useMemo(() => {
      if (sourceText !== null) {
        return sourceText;
      }
      if (sourceDataUri === null) {
        return null;
      }
      let decodedData = decodeFileDataUri(sourceDataUri);
      if (decodedData === null) {
        return "failed";
      } else {
        return new TextDecoder("utf-8").decode(decodedData.bytes);
      }
    }, [sourceText, sourceDataUri]),
    [textPreview, setTextPreview] = reactFilesBrowser.useState<string | null>(
      null,
    );
  reactFilesBrowser.useEffect(() => {
    if (sourceUrl === null) {
      return;
    }
    let controller = new AbortController();
    setTextPreview(null);
    fetchFileWithRetries(sourceUrl, value, controller.signal, retryMs)
      .then(
        async (response: Response): Promise<string> =>
          responseMimeType(response) === "text/html"
            ? stripFrameRuntimeBlock(await response.text())
            : response.text(),
      )
      .then((text: string) => {
        if (!controller.signal.aborted) {
          setTextPreview(text);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setTextPreview("failed");
        }
      });
    return () => controller.abort();
  }, [sourceUrl, value, retryMs]);
  let displayText = sourceUrl === null ? memo : textPreview,
    textOverflowNotice =
      displayText === null || displayText === "failed"
        ? ""
        : displayText.length > MAX_FILE_BROWSER_TEXT_BYTES
          ? displayText.slice(0, MAX_FILE_BROWSER_TEXT_BYTES) +
            `
…`
          : displayText;
  return (
    <div
      data-testid={"files-browser-card"}
      className={
        "relative w-full overflow-hidden rounded-lg border bg-surface-2 shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06)]"
      }
      style={fileBrowserPreviewCardStyle(tall)}
    >
      {displayText === "failed" || displayText === null ? (<div
          className={
            "flex h-full items-center justify-center text-xs text-secondary"
          }
        >
          {displayText === null ? (FILE_BROWSER_LOADING_TEXT) : (uiMessage("design-system.fileBrowser.couldnTLoadThisFile"))}
        </div>) : (<pre
          data-testid={"files-browser-text"}
          className={joinClassNames(
            "m-0 h-full w-full overflow-auto p-3 font-mono leading-[1.45] whitespace-pre text-secondary",
            tall ? "text-[11px]" : "text-[10px]",
          )}
        >
          {textOverflowNotice}
        </pre>)}
    </div>
  );
}
function get_FILE_BROWSER_LOAD_ERROR_TEXT() {
  return uiMessage("design-system.fileBrowser.couldnTLoadThisFile");
}
export {
  decodeFileDataUri,
  encodeFilePathPart,
  fetchFileWithRetries,
  FILE_BROWSER_FALLBACK_VIEWPORT_HEIGHT,
  FILE_BROWSER_ICON_COLORS,
  FILE_BROWSER_ICON_GRADIENTS,
  FILE_BROWSER_ICON_SHADOW,
  get_FILE_BROWSER_LOAD_ERROR_TEXT,
  FILE_BROWSER_LOADING_TEXT,
  FILE_BROWSER_MOBILE_QUERY,
  FILE_BROWSER_NO_HOVER_QUERY,
  FILE_BROWSER_OVERSCAN_PX,
  FILE_BROWSER_PREVIEW_CARD_CLASS,
  FILE_BROWSER_PREVIEW_HEIGHT,
  FILE_BROWSER_PREVIEW_WIDTH,
  FILE_BROWSER_ROW_HEIGHT,
  FILE_BROWSER_ROW_ICON_SIZE,
  FILE_BROWSER_SECTION_HEIGHT,
  FILE_BROWSER_SELECTED_FORCED_COLORS_CLASS,
  FILE_DOWNLOAD_MAX_RETRY_MS,
  FileBrowserBreadcrumbs,
  fileBrowserDefaultSource,
  FileBrowserDownloadButton,
  fileBrowserEntryEncoder,
  fileBrowserEntryId,
  fileBrowserEntryKey,
  FileBrowserIcon,
  FileBrowserImagePreview,
  FileBrowserPreview,
  FileBrowserPreviewCard,
  fileBrowserPreviewCardStyle,
  FileBrowserRow,
  FileBrowserSectionHeading,
  FileBrowserTextPreview,
  fileCountLabel,
  fileDownloadDisabledReason,
  fileDownloadFailureMessage,
  fileDownloadMimeMatchesName,
  fileFetchHttpError,
  fileFetchRetryDelays,
  FilesBrowser,
  initialFileBrowserSelection,
  jsxFilesBrowser,
  MAX_DOWNLOAD_EXTENSION_LABEL_LENGTH,
  parentFolderPath,
  projectFileUrl,
  readArtifactBlobDownload,
  readFileBrowserDownload,
  responseMimeType,
  useFileBrowserDownload,
  useFilePreviewWidth,
};
export function installFilesUiFileBrowser(): () => void {
  return () => {
    jsxFilesBrowser = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    FILE_BROWSER_ROW_HEIGHT = 44;
    FILE_BROWSER_SELECTED_FORCED_COLORS_CLASS =
      "forced-colors:forced-color-adjust-none forced-colors:text-[color:HighlightText]";
    FILE_BROWSER_SECTION_HEIGHT = 32;
    FILE_BROWSER_ROW_ICON_SIZE = 28;
    FILE_BROWSER_PREVIEW_WIDTH = 1200;
    FILE_BROWSER_PREVIEW_HEIGHT = 800;
    FILE_BROWSER_OVERSCAN_PX = 5 * FILE_BROWSER_ROW_HEIGHT;
    FILE_BROWSER_FALLBACK_VIEWPORT_HEIGHT = 900;
    FILE_BROWSER_MOBILE_QUERY = "(max-width: 660px)";
    FILE_BROWSER_NO_HOVER_QUERY = "(hover: none)";
    FILE_BROWSER_ICON_COLORS = {
      surface: "var(--cds-surface-2)",
      hover: "var(--cds-fill-ghost-hover)",
      line: "var(--cds-border)",
    };
    encodeFilePathPart = (pathPart: string) => {
      try {
        return encodeURIComponent(pathPart);
      } catch {
        return encodeURIComponent(
          pathPart.replace(/[\uD800-\uDFFF]/g, String.fromCharCode(65533)),
        );
      }
    };
    projectFileUrl = (path: string) =>
      PROJECT_FILE_PREFIX +
      path.split("/").map(encodeFilePathPart).join("/");
    fileBrowserDefaultSource = (file: BrowserFile) => ({
      url: projectFileUrl(file.path),
    });
    fileCountLabel = (count: number, label: string) =>
      count.toLocaleString("en-US") + " " + label + (count === 1 ? "" : "s");
    parentFolderPath = (folderPath: string) =>
      folderPath.includes("/") ? folderPath.slice(0, folderPath.lastIndexOf("/")) : "";
    fileBrowserEntryKey = (source: BrowserEntry) =>
      source.kind + ":" + source.path;
    fileBrowserEntryEncoder = new TextEncoder();
    fileBrowserEntryId = (path: string) =>
      Array.from<number, string>(
        fileBrowserEntryEncoder.encode(path),
        (byte: number) => byte.toString(16).padStart(2, "0"),
      ).join("");
    initialFileBrowserSelection = (
      folder: BrowserFolder,
      entryKey: (entry: BrowserEntry) => string | undefined,
    ) => {
      let value = flattenFileBrowserTree(folder, new Set()).filter(
          (row: BrowserRow) => row.entry.kind === "file",
        ),
        fileRow =
          value.find(
            (row: BrowserRow) => entryKey(row.entry) === undefined,
          ) ?? value[0];
      if (fileRow) {
        return fileBrowserEntryKey(fileRow.entry);
      } else {
        return null;
      }
    };
    FILE_BROWSER_ICON_GRADIENTS = {
      html: "linear-gradient(135deg, #FDE8E0 0%, #F5D0C0 100%)",
      deck: "linear-gradient(135deg, #D8EEEA 0%, #C2E0D8 100%)",
      css: "linear-gradient(135deg, #DCEAF7 0%, #C8DAF0 100%)",
      jsx: "linear-gradient(135deg, #E0E8F0 0%, #D0D8E8 100%)",
      js: "linear-gradient(135deg, #FFF3D0 0%, #F0E4B8 100%)",
      image: "linear-gradient(135deg, #E0ECD8 0%, #D0DFC8 100%)",
      md: "linear-gradient(135deg, #EEEAF5 0%, #DED8EC 100%)",
      json: "linear-gradient(135deg, #F0EEE6 0%, #E5E2D8 100%)",
      other: "linear-gradient(135deg, #F0EEE6 0%, #E5E2D8 100%)",
    };
    FILE_BROWSER_ICON_SHADOW = "0 1px 2px rgba(0,0,0,0.04)";
    MAX_DOWNLOAD_EXTENSION_LABEL_LENGTH = 12;
    fileDownloadMimeMatchesName = (
      filePath: string,
      expectedMime: string,
      sourceMime?: string,
    ) => {
      let value = sourceMime ?? downloadMimeTypeFromName(filePath);
      if (value !== undefined) {
        return expectedMime === value;
      }
      let pathMime = fileMimeTypeFromPath(
        sanitizedFileName(filePath),
      );
      return (
        pathMime === undefined || expectedMime === pathMime || expectedMime === "text/plain"
      );
    };
    responseMimeType = (response: Response) =>
      (response.headers.get("content-type") ?? "")
        .split(";")[0]
        .trim()
        .toLowerCase();
    fileFetchHttpError = (status: number) =>
      Object.assign(Error("HTTP " + String(status)), {
        status: status,
      });
    fileFetchRetryDelays = (retryMs: number) => {
      let items: number[] = [];
      for (
        let index = 0, count = 150;
        index + count <= retryMs;
        index += count, count = Math.min(count * 2, 2000)
      ) {
        items.push(count);
      }
      return items;
    };
    FILE_DOWNLOAD_MAX_RETRY_MS = 4000;
    FILE_BROWSER_PREVIEW_CARD_CLASS =
      "relative flex w-full items-center justify-center overflow-hidden rounded-lg border bg-fill-control shadow-[0_4px_16px_rgba(0,0,0,0.1),0_1px_4px_rgba(0,0,0,0.06)]";
    fileBrowserPreviewCardStyle = (isCompact: boolean | undefined) =>
      isCompact
        ? {
            height: "52vh",
          }
        : {
            aspectRatio:
              String(FILE_BROWSER_PREVIEW_WIDTH) +
              " / " +
              String(FILE_BROWSER_PREVIEW_HEIGHT),
          };
    FILE_BROWSER_LOAD_ERROR_TEXT = "Couldn’t load this file";
    FILE_BROWSER_LOADING_TEXT = "Loading…";
  };
}
