import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type * as JsxRuntime from "react/jsx-runtime";
import type {
  ApplicationRuntime,
  ApplicationStore,
  ApplicationDocument,
  ApplicationCommands,
  FileEditHistory,
  ApplicationView,
  ArtifactDownloadOutcome,
  SectionRow,
  TokenDialogState,
  ConfirmationState,
  TokenFlashTarget,
  SectionScroller,
  AssetRevealTarget,
  EditorExtraScale,
  AddedToken,
  WelcomeIntakeSummary,
  IntakeQueueEntry,
  SearchEntry,
  NavigationSearch,
  ApplicationSaveState,
  EditorAsset,
  EditorAssetGroup,
  EditorTypeGroup,
  ScalarScaleGroup,
  AssetUploadSummary,
  AssetIntakeOptions,
  ClaudeRequest,
  ClaudeDeliveryResult,
  RefusedUpload,
  ColorEditActions,
  ScalarEditActions,
  ShadowEditActions,
  TypographyEditActions,
  ComponentEditActions,
  ScalarTokenKind,
  AddTokenKind,
  EditorFont,
  EditorComponent,
} from "../../contracts/application";
import type {
  ColorTheme,
  NormalizedTokens,
  ParsedDesignSystem,
  InferredPropControl,
} from "../../contracts";
import { loadJsxNamespace, loadReactNamespace } from "../../dependencies";
import { AddTokenDialog, NEW_TOKEN_GROUP_SENTINEL } from "../../editor/add-token-dialog";
import { AssetDetailsDialog, AssetDetailsPreview } from "../../editor/asset-details";
import { useAssetGroupEditor } from "../../editor/asset-group-editor";
import { AssetGroupsList, AssetTileThumbnail } from "../../editor/asset-groups";
import { FONT_FILE_ACCEPT, useBlobDataUrls } from "../../editor/asset-resources";
import { collectDownloadFiles, createStoredZip, downloadZipBaseName, extractDroppedFiles, isIgnoredUploadFile, MAX_DROPPED_FILES, readDownloadFileBytes, saveDownloadFile, unsupportedDownloadMessage, uploadedFileRelativePath } from "../../editor/asset-upload";
import { chooseClaudeDeliveryRoad, createClaudeDeliveryContextStore, deliverClaudeRequest } from "../../editor/claude-delivery";
import { artifactPageAddress, claudeDeliveryStatusMessage, githubStarterPrompt, ownerBuildFromFilesPrompt, ownerEmptySystemPrompt, ownerHandoffFilesPrompt, viewerBuildFromFilesPrompt, viewerEmptySystemPrompt, viewerGitHubSyncPrompt, viewerHandoffFilesPrompt } from "../../editor/claude-prompts";
import { ColorsSection, ColorsSectionHeader } from "../../editor/colors";
import { UNCOMMENTABLE_PROPS } from "../../editor/comment-anchors";
import { usePreviewStaticNotice } from "../../editor/component-preview";
import { ComponentsSection, editorFeatureFlags } from "../../editor/components";
import { ConfirmRemoveDialog } from "../../editor/confirm-remove";
import { SaveConflictBanners, useConflictedSections } from "../../editor/conflict-banners";
import { CoverPreview } from "../../editor/cover-preview";
import { DocumentSections, firstMarkdownTitle, replaceMarkdownTitle } from "../../editor/document-sections";
import { get_DOWNLOADS_UNAVAILABLE_MESSAGE } from "../../editor/download-permission";
import { performDesignSystemEdit } from "../../editor/edit-dispatch";
import { showEditorNotification, showEditorPromiseNotification } from "../../editor/editable-name";
import { EMPTY_SECTION_HINTS, EmptyEditorList, EmptySectionHint, SectionUsageNote } from "../../editor/empty-states";
import { createFileMutationBatch } from "../../editor/files-merge";
import { googleFontStylesheetUrl, knownWebFontFamily } from "../../editor/font-catalog";
import { useInlineFontFaces } from "../../editor/font-faces";
import { flushMarkdownCommitQueues } from "../../editor/markdown-commit";
import { MarkdownEditor } from "../../editor/markdown-editor";
import { ClaudeRequestButton, get_MIGRATION_EMPTY_PAGE_TITLE, MigrationCleanupBanner, migrationOpenedAnalyticsEvents, reportMigrationAnalytics, reportMigrationCleanupPressed, reportMigrationCleanupResult, useMigrationCleanupEnabled } from "../../editor/migration-banners";
import { NewAssetGroupDialog } from "../../editor/new-asset-group";
import { IndexRecoveryBanner, MigrationLeftOutBanner, PipelineChangeBanner, PipelineChangeSummary } from "../../editor/pipeline-banners";
import { usePublishedPreviewGeneration } from "../../editor/published-preview";
import { ReadmeArticle, removeTokenShortcutComments } from "../../editor/readme-article";
import { copyTextToClipboard } from "../../editor/row-context-menu";
import { SectionAddButton, SectionHeader, SectionSheet } from "../../editor/section-headers";
import { createEditorSectionNavigationActions, useEditorCardFlash, useEditorSectionNavigation } from "../../editor/section-navigation";
import { ShadowsSection } from "../../editor/shadows";
import { extraTokenScaleGroups, groupedTokenScale, tokenScaleGroupId, tokenScaleGroupLabel, tokenScaleGroups, TokenScaleSections } from "../../editor/token-scales";
import { TypographySection, TypographySectionHeader } from "../../editor/typography";
import { addedFilesSummary, commitUploadedAssetChange, countSuccessfulUploads, existingFontUploadFiles, mergeAssetUploadResults, pickUploadFiles, uploadAssetFiles, uploadedAssetFile, uploadedFilesBuildSummary, uploadResultSummary } from "../../editor/upload-pipeline";
import { assetGroupDisplayName, designSystemEditorView, emptyDesignSystemSections, extraTokenFamilySectionId, hasOnlyManifestFile, STARTER_SECTION_IDS, starterSectionState, tokenGroupRenamePairs } from "../../editor/view-model";
import { BOOT_LIVE_NOTICE_MESSAGES, get_MIGRATED_READONLY_MESSAGE } from "../boot-decisions";
import { FILES_SECTION_ID, useDesignSystemFilesBrowser } from "./design-system-files";
import { notificationsFocusRegion, useFocusRegions } from "./focus-regions";
import { claudeSendResultMessage } from "./handoff-runtime";
import { buildSectionSearchIndex } from "./navigation-search";
import { FloatingSectionNavigation, initialSectionFromHash, replaceSectionHash, SIDEBAR_MEDIA_QUERY, SidebarSectionNavigation } from "./navigation";
import { renderComponentPreview, useFileAvailability } from "./preview-availability";
import { createPreviewHead, preferLivePreviewUrls, previewStaticStatus, supportsLivePreviewUrls } from "./preview-head";
import { LazySection, useSectionScroller } from "./section-scroll";
import { isDarkThemeName, previewThemeDisabledReason, PreviewThemeMenu, resolvePreviewTheme, useHostThemeMode } from "./theme";
import { BrandUploadPanel, EmptyDesignSystem, HandoffNotice, IntakeProgressStatus, README_STARTER_TEXT, WELCOME_OPTIONS, WelcomeSheet } from "./welcome";
import { hostDrawsReadOnly, subscribeHostSaveChrome } from "../../host/frame-bridge";
import { addAssetFile, addColorToken, addScalarToken, addShadowToken, addTypographyGroup, addTypographyStyle, deleteAssetFile, deleteTypographyGroup, renameAssetFile, renameTypographyGroup, replaceInlineFileWithPointer, unusedTokenName } from "../../model/asset-commands";
import { assessAssetReclamation, assetStorageUsageMessage, deleteStoredAssets, excludePublishedAssets, getAssetsCatalogState, inlineStorageFallbackMessage, missingAssetsMessage, publishedPageBlobIds, RECLAIM_LIST_FAILED_MESSAGE, RECLAIM_NOTHING_UNUSED_MESSAGE, RECLAIM_RECONNECTING_MESSAGE, RECLAIM_SAVE_FIRST_MESSAGE, RECLAIM_SAVING_MESSAGE, RECLAIM_WINDOWED_COLLECTION_MESSAGE, reclaimAssetsButtonLabel, reclaimAssetsConfirmation, reclaimAssetsResultMessage, refreshAssetsCatalog, resolveAssetsCapability, subscribeAssetsState } from "../../model/asset-store";
import { commonTokenNamePrefix, inferComponentPropControls, PALETTE_GROUP_NAME, tokenGroupName, tokenHasGroupSuffix } from "../../model/component-inference";
import { humanizeDocumentFilename } from "../../model/derive-system";
import { deleteDesignSystemFiles, fileFitsInlineBudgets, renameDesignSystemFile, sanitizeUploadFileName, setAdditionalDocument, setDesignSystemReadme } from "../../model/file-commands";
import { assetKindForPath, DESIGN_SYSTEM_PATHS, fileExtension, mimeTypeForPath, pathBasename, pathDirname } from "../../model/file-policy";
import { DESIGN_SYSTEM_INLINE_LIMITS, isUnboundedFileParsing } from "../../model/file-table";
import { addFontFace, deleteFontFace, removeMissingFontReferences, setComponentGuidelines } from "../../model/font-component-commands";
import { isCiLastChange } from "../../model/last-change";
import { DOWNLOAD_INTERNAL_FAILURE, downloadHealthOutcome } from "../../model/publish";
import { uniqueStoredBlobCount } from "../../model/storage";
import { createDesignSystemCommands, DesignSystemStore } from "../../model/system-store";
import { getStoredSystemStatus, subscribeStoredSystemStatus } from "../../model/system-sync";
import { clearColorThemeOverride, deleteColorTokens, deleteToken, renameColorTokensAtomically, renameToken, setColorTokenUsage, setColorTokenValue, setScalarTokenValue, setShadowTokenValue, setTokenFamilyNote, setTokenUsage, setTypographyFontFamily, setTypographyProperty, setTypographyStyleUsage, validateNewFontFamily } from "../../model/token-commands";
import { conflictingTokenNames, generateNamedTokensCss, isColorLiteral, resolveColorTokenValue, tokenNamesForFamily } from "../../model/tokens";
import { toModuleNamespace } from "../../module-helpers";
import { artifactHealth } from "../../telemetry/health";
import { createAnnouncedHistory } from "../../ui/announced-history";
import { announceLiveMessage, LiveAnnouncer } from "../../ui/announcements";
import { ArtifactShell } from "../../ui/artifact-shell";
import { SaveStatusControl } from "../../ui/artifact-toolbar";
import { Badge } from "../../ui/badges";
import { Button } from "../../ui/buttons";
import { TooltipWrapper } from "../../ui/color/gradient-stops";
import { reactArtifactRoot } from "../../ui/disclosure";
import { FileDropOverlay, useFileDrop } from "../../ui/file-drop";
import { Callout } from "../../ui/icons";
import { TextLink } from "../../ui/links";
import { CdsRoot } from "../../ui/overlays";
import { useCoarsePointer, useMediaQuery } from "../../ui/select";
import { closeToast } from "../../ui/toasts";

var reactBootWarnings: typeof React;
var jsxDesignSystemApp: typeof JsxRuntime;
var CORE_DESIGN_SYSTEM_SECTIONS: SectionRow[];
var CONTENT_DESIGN_SYSTEM_SECTIONS: SectionRow[];
var BUILTIN_DESIGN_SYSTEM_SECTION_IDS: string[];
var isExtraTokenSection: (section: string) => boolean;
var isDesignSystemSection: (section: string) => boolean;
var initialDesignSystemSection: () => string;
var PENDING_DESIGN_SYSTEM_SECTIONS: SectionRow[];
var designSystemSections: (extra: EditorExtraScale[]) => SectionRow[];
var REVEAL_SECTION_BY_KIND: Record<AssetRevealTarget["kind"], string>;
var CLAUDE_COMMENT_SENT_MESSAGE: string;
var README_SIZE_EXCEEDED_MESSAGE: string;
var BACKGROUND_COLOR_TOKEN_PATTERNS: RegExp[];
var SURFACE_COLOR_TOKEN_PATTERNS: RegExp[];
function useBootWarnings(bootContext: unknown) {
  let warnedRef = reactBootWarnings.useRef(false);
  reactBootWarnings.useEffect(() => {
    if (bootContext === null || warnedRef.current) {
      return;
    }
    let value = migrationOpenedAnalyticsEvents(bootContext);
    if (value.length === 0) {
      return;
    }
    warnedRef.current = true;
    for (let warning of value) {
      reportMigrationAnalytics(warning);
    }
  });
}
function useGoogleFontStylesheets(
  familyNames: Record<string, string>,
  fonts: {
    family: string;
  }[],
  typeTokens: NormalizedTokens["type"],
) {
  let localFamilies = new Set(
      fonts.map((font) => font.family.toLowerCase()),
    ),
    urls = [
      ...new Set(
        Object.entries(familyNames).flatMap(([familyName, fontFamily]) => {
          let value = knownWebFontFamily(fontFamily);
          if (
            value === undefined ||
            localFamilies.has(fontFamily.toLowerCase())
          ) {
            return [];
          }
          let stylesheetUrl = googleFontStylesheetUrl(value),
            values = new Set(
              (/wght@([\d;]+)/.exec(stylesheetUrl)?.[1] ?? "400")
                .split(";")
                .map(Number),
            ),
            fontSources = [
              ...new Set(
                typeTokens.groups.flatMap((typeGroup) =>
                  typeGroup.styles
                    .filter(
                      (font) =>
                        (font.family !== ""
                          ? font.family
                          : typeGroup.family) === familyName,
                    )
                    .map((font) => parseInt(String(font.fontWeight), 10)),
                ),
              ),
            ]
              .filter(
                (weight) =>
                  weight >= 100 && weight <= 900 && !values.has(weight),
              )
              .sort((leftWeight, rightWeight) => leftWeight - rightWeight);
          return [
            stylesheetUrl,
            ...fontSources.map(
              (weight) =>
                "https://fonts.googleapis.com/css2?family=" +
                value.replace(/ +/g, "+") +
                ":wght@" +
                String(weight) +
                "&display=swap",
            ),
          ];
        }),
      ),
    ].sort(),
    fingerprint = urls.join("|");
  (reactArtifactRoot as typeof React).useEffect(() => {
    let entries = new Map(
      [
        ...document.querySelectorAll<HTMLLinkElement>(
          "link[data-ds-google-font]",
        ),
      ].map((link) => [link.href, link]),
    );
    for (let [value, link] of entries) {
      if (!urls.includes(value)) {
        link.remove();
      }
    }
    for (let value of urls) {
      if (entries.has(value)) {
        continue;
      }
      let existingLink = [
        ...document.head.querySelectorAll<HTMLLinkElement>(
          'link[rel="stylesheet"]',
        ),
      ].find((link) => link.href === value);
      if (existingLink !== undefined) {
        existingLink.dataset.dsGoogleFont = "1";
        continue;
      }
      let stylesheetLink = document.createElement("link");
      stylesheetLink.rel = "stylesheet";
      stylesheetLink.dataset.dsGoogleFont = "1";
      stylesheetLink.href = value;
      document.head.appendChild(stylesheetLink);
    }
  }, [fingerprint]);
}
function previewThemeGroundColors(
  tokens: NormalizedTokens,
  themes: ColorTheme[],
) {
  let findColor = (patterns: RegExp[], colorName: string) => {
      for (let value of patterns) {
        let token = tokens.color.tokens.find((candidate) =>
            value.test(candidate.name),
          ),
          tokenValue =
            token !== undefined
              ? resolveColorTokenValue(token, colorName, tokens)
              : undefined;
        if (tokenValue !== undefined && isColorLiteral(tokenValue)) {
          return tokenValue;
        }
      }
      return;
    },
    grounds: Record<
      string,
      {
        well: string;
        card: string;
      }
    > = {};
  for (let value of themes) {
    let isDarkTheme = isDarkThemeName(value.name);
    grounds[value.id] = {
      well:
        findColor(BACKGROUND_COLOR_TOKEN_PATTERNS, value.id) ??
        (isDarkTheme ? "#1f1e1d" : "#f0eee6"),
      card:
        findColor(SURFACE_COLOR_TOKEN_PATTERNS, value.id) ??
        (isDarkTheme ? "#30302e" : "#ffffff"),
    };
  }
  return grounds;
}
function artifactDownloadResultMessage(
  name: string,
  result: ArtifactDownloadOutcome,
  suffix = "",
): string {
  if (result.outcome === "declined") {
    return uiMessage("design-system.designSystemApp.downloadCancelled");
  }
  if (result.outcome === "withheld") {
    return get_DOWNLOADS_UNAVAILABLE_MESSAGE();
  }
  if (result.outcome === "refused" || result.outcome === "failed") {
    return unsupportedDownloadMessage(name, result.shell.code);
  }
  return uiMessage("design-system.designSystemApp.downloaded") + name + suffix;
}
function DesignSystemApp(): React.ReactElement {
  useUiLocale();
  let editHistory: FileEditHistory = reactArtifactRoot.useMemo(
      () => createFileMutationBatch(),
      [],
    ),
    documentOptions: FileEditHistory = reactArtifactRoot.useMemo(
      () => createAnnouncedHistory(editHistory),
      [editHistory],
    ),
    system: ApplicationStore = reactArtifactRoot.useMemo(
      () => new DesignSystemStore(),
      [],
    ),
    applicationDocument: ApplicationDocument = system.doc,
    editor: ApplicationCommands = reactArtifactRoot.useMemo(
      () =>
        createDesignSystemCommands(
          applicationDocument,
          documentOptions,
          editHistory,
        ),
      [applicationDocument, documentOptions, editHistory],
    ),
    flaggedSections: ReadonlySet<string> = useConflictedSections(
      applicationDocument,
    ),
    [, forceRender] = reactArtifactRoot.useState(0),
    restoreCountRef = reactArtifactRoot.useRef(0);
  reactArtifactRoot.useEffect(
    () =>
      applicationDocument.subscribe(() => {
        forceRender((count) => count + 1);
        if (applicationDocument.restoreCount() !== restoreCountRef.current) {
          restoreCountRef.current = applicationDocument.restoreCount();
          editor.undo.clear();
        }
      }),
    [applicationDocument, editor],
  );
  reactArtifactRoot.useEffect(
    () => system.subscribe(() => forceRender((count) => count + 1)),
    [system],
  );
  let hostMode = useHostThemeMode(),
    scrollerRef = (
      reactArtifactRoot as typeof React
    ).useRef<HTMLElement | null>(null),
    sectionRefs = (reactArtifactRoot as typeof React).useRef<
      Record<string, HTMLElement | null | undefined>
    >({}),
    floatingNavigationRef = (
      reactArtifactRoot as typeof React
    ).useRef<HTMLDivElement | null>(null),
    handoffNoticeRef = (
      reactArtifactRoot as typeof React
    ).useRef<HTMLDivElement | null>(null),
    stickyHeaderBottom = (): number | undefined => {
      let value = [floatingNavigationRef.current, handoffNoticeRef.current]
        .map((element) =>
          element === null ? undefined : element.getBoundingClientRect(),
        )
        .filter((rect) => rect !== undefined && rect.height > 0)
        .map((rect) => rect!.bottom);
      if (value.length === 0) {
        return undefined;
      } else {
        return Math.max(...value);
      }
    },
    wideLayout = useMediaQuery(SIDEBAR_MEDIA_QUERY),
    assetReveal = useEditorCardFlash(scrollerRef),
    snapshot: ParsedDesignSystem = system.getSnapshot(),
    themes: ColorTheme[] = snapshot.tokens.color.themes,
    [selectedThemeId, setSelectedThemeId] = (
      reactArtifactRoot as typeof React
    ).useState<string | null>(null),
    {
      hostThemeId: hostThemeId,
      hostThemeMode: hostThemeMode,
      previewThemeId: previewThemeId,
      stageMode: stageMode,
      needsGround: needsGround,
    } = resolvePreviewTheme(themes, hostMode, selectedThemeId),
    allFonts = reactArtifactRoot.useMemo(
      () => [...snapshot.fonts, ...snapshot.assetFonts],
      [snapshot.fonts, snapshot.assetFonts],
    ),
    blobFontAvailability = useBlobDataUrls(
      reactArtifactRoot.useMemo(
        () =>
          allFonts
            .filter((asset) => asset.store === "blob")
            .map((asset) => ({
              src: asset.src,
              type: mimeTypeForPath(asset.path),
              bytes: asset.bytes,
            })),
        [allFonts],
      ),
    );
  useInlineFontFaces(allFonts, blobFontAvailability);
  usePublishedPreviewGeneration(applicationDocument);
  useFileAvailability(
    reactArtifactRoot.useMemo(
      () =>
        preferLivePreviewUrls &&
        supportsLivePreviewUrls()
          ? []
          : snapshot.fonts
              .filter(
                (asset) =>
                  asset.referenced &&
                  !asset.missing &&
                  asset.store === "inline",
              )
              .map((asset) => ({
                path: asset.path,
                typePrefix: "font/",
                bytes: asset.bytes,
              })),
      [snapshot.fonts],
    ),
  );
  usePreviewStaticNotice();
  let readOnly = applicationDocument.readOnly();
  reactArtifactRoot.useEffect(() => {
    let value = system.bootReport.warnings.filter((warning) =>
      warning.includes(": carried as "),
    );
    if (value.length > 0) {
      console.warn(
        `[design-system] renamed in this system (their names are generated beside the page):
` +
          value.join(`
`),
      );
    }
    let dropped = system.bootReport.dropped;
    if (dropped.length === 0) {
      return;
    }
    console.warn(
      `[design-system] not kept from the published files:
` +
        dropped.join(`
`),
    );
    showEditorNotification(
      String(dropped.length) +
        (dropped.length === 1
          ? " file in this system couldn’t be kept: "
          : " files in this system couldn’t be kept — first: ") +
        (dropped[0] ?? "") +
        (dropped.length > 1 ? " (the console lists all)" : ""),
      12000,
    );
  }, [system]);
  let [, refreshLibraryState] = reactArtifactRoot.useState(0);
  reactArtifactRoot.useEffect(
    () =>
      subscribeAssetsState(() =>
        refreshLibraryState((count) => count + 1),
      ),
    [],
  );
  reactArtifactRoot.useEffect(() => {
    if (
      readOnly ||
      getAssetsCatalogState().state !== "unknown"
    ) {
      return;
    }
    resolveAssetsCapability().then((assets) =>
      assets === null ? undefined : refreshAssetsCatalog(assets),
    );
  }, [readOnly]);
  let [intakeProgress, setIntakeProgress] = (
      reactArtifactRoot as typeof React
    ).useState<string | null>(null),
    [intakeBusy, setIntakeBusy] = reactArtifactRoot.useState(false),
    freeingBlobIdsRef = reactArtifactRoot.useRef(new Set<string>()),
    intakeOptions: AssetIntakeOptions = reactArtifactRoot.useMemo(
      () => ({
        room: () =>
          isUnboundedFileParsing()
            ? Number.POSITIVE_INFINITY
            : DESIGN_SYSTEM_INLINE_LIMITS.total -
              system.getSnapshot().bytes.total.bytes,
        catalogue: () => system.getSnapshot().storage,
        freeing: () => freeingBlobIdsRef.current,
        onProgress: setIntakeProgress,
        onTierOff: (reason) =>
          showEditorNotification(
            inlineStorageFallbackMessage(reason),
          ),
      }),
      [system],
    ),
    editable: ApplicationCommands | undefined = readOnly ? undefined : editor;
  reactArtifactRoot.useEffect(() => {
    if (readOnly) {
      return;
    }
    let value: Promise<void> | null = null,
      callback = (
        filePath: string,
        fileContent: string,
        baseSha: string,
        uploadRecord: import("../../contracts").AssetUploadRecord,
      ) => {
        let previousContent = system.content();
        system.update(
          (content) =>
            replaceInlineFileWithPointer(
              content,
              filePath,
              fileContent,
              baseSha,
              uploadRecord,
            ),
          {
            auto: true,
          },
        );
        return system.content() !== previousContent;
      },
      notifyComplete = () => {
        value = null;
      };
    system.beforeSave = () =>
      document.visibilityState === "hidden"
        ? Promise.resolve()
        : (value ??= existingFontUploadFiles(
            system.content().files,
            intakeOptions,
            callback,
          ).then(notifyComplete, notifyComplete));
    return () => {
      system.beforeSave = null;
    };
  }, [system, intakeOptions, readOnly]);
  let view: ApplicationView = reactArtifactRoot.useMemo(
      () => designSystemEditorView(snapshot),
      [snapshot],
    ),
    viewRef = reactArtifactRoot.useRef(view);
  viewRef.current = view;
  let blobCatalogue = getAssetsCatalogState(),
    blobAnalysis = reactArtifactRoot.useMemo(
      () =>
        assessAssetReclamation(
          snapshot.files,
          freeingBlobIdsRef.current,
        ),
      [snapshot.files, blobCatalogue],
    ),
    storedBlobBytes =
      blobCatalogue.state === "listed"
        ? blobCatalogue.usage.bytes
        : snapshot.blobBytesUsed,
    emptySystem =
      hasOnlyManifestFile(snapshot.files) &&
      storedBlobBytes === 0,
    colorTokenNames = reactArtifactRoot.useMemo(
      () =>
        new Set(tokenNamesForFamily(snapshot.tokens, "color")),
      [snapshot.tokens],
    ),
    emptySections = reactArtifactRoot.useMemo(
      () =>
        emptySystem
          ? new Set(STARTER_SECTION_IDS)
          : emptyDesignSystemSections(view, {
              storedBytes: storedBlobBytes,
            }),
      [emptySystem, view, storedBlobBytes],
    ),
    editingOff =
      reactArtifactRoot.useSyncExternalStore(
        subscribeStoredSystemStatus,
        getStoredSystemStatus,
        getStoredSystemStatus,
      ).editingOff === true && editable === undefined,
    sections: SectionRow[] = reactArtifactRoot.useMemo(
      () =>
        editingOff
          ? designSystemSections(view.extras).filter(
              (section) => section.id === "readme",
            )
          : designSystemSections(view.extras),
      [view.extras, editingOff],
    ),
    handoffAvailable = useMigrationCleanupEnabled(),
    sectionsRef = reactArtifactRoot.useRef(sections);
  sectionsRef.current = sections;
  useGoogleFontStylesheets(
    view.familyNames,
    view.fonts,
    snapshot.tokens.type,
  );
  let sectionIds: string[] = reactArtifactRoot.useMemo(
      () => sections.map((section) => section.id),
      [sections],
    ),
    [initialSection] = reactArtifactRoot.useState(
      initialDesignSystemSection,
    ),
    sectionScroller: SectionScroller = useSectionScroller(
      sectionIds,
      stickyHeaderBottom,
      sectionRefs,
      initialSection,
    ),
    attachScroller = reactArtifactRoot.useCallback(
      (element: HTMLElement | null) => {
        scrollerRef.current = element;
        sectionScroller.attach(element);
      },
      [sectionScroller.attach],
    ),
    currentSection = sections.some(
      (section) => section.id === sectionScroller.current,
    )
      ? sectionScroller.current
      : "readme",
    currentSectionRef = reactArtifactRoot.useRef(currentSection);
  currentSectionRef.current = currentSection;
  let markSectionRef = reactArtifactRoot.useRef(sectionScroller.mark);
  markSectionRef.current = sectionScroller.mark;
  let revealController = reactArtifactRoot.useMemo(
      () =>
        createEditorSectionNavigationActions({
          sectionLabel: (sectionId) =>
            sectionsRef.current.find((section) => section.id === sectionId)?.label,
          show: (sectionId) => {
            if (isDesignSystemSection(sectionId)) {
              jumpToSectionRef.current(sectionId);
            }
          },
          mark: (sectionId) => {
            if (isDesignSystemSection(sectionId)) {
              markSectionRef.current(sectionId);
            }
          },
          sectionEl: (sectionId) => sectionRefs.current[sectionId],
          say: announceLiveMessage,
        }),
      [],
    ),
    textReveal = useEditorSectionNavigation({
      sections: sectionRefs,
      port: sectionScroller.port,
      ...revealController,
    }),
    jumpToSection = (sectionId: string) => {
      textReveal.release();
      if (sections.some((section) => section.id === sectionId)) {
        sectionScroller.jump(sectionId);
      }
    },
    jumpToSectionRef = reactArtifactRoot.useRef(jumpToSection);
  jumpToSectionRef.current = jumpToSection;
  let hashTimerRef = reactArtifactRoot.useRef(0);
  reactArtifactRoot.useEffect(() => {
    if (!sectionScroller.moved) {
      return;
    }
    window.clearTimeout(hashTimerRef.current);
    hashTimerRef.current = window.setTimeout(
      () => replaceSectionHash(currentSection),
      200,
    );
    return () => window.clearTimeout(hashTimerRef.current);
  }, [currentSection, sectionScroller.moved]);
  reactArtifactRoot.useEffect(() => {
    let callback = () => {
      let value = window.location.hash.slice(1);
      if (
        isDesignSystemSection(value) &&
        value !== currentSectionRef.current
      ) {
        jumpToSectionRef.current(value);
      }
    };
    window.addEventListener("hashchange", callback);
    return () => window.removeEventListener("hashchange", callback);
  }, []);
  let revealAsset = (
      source: import("../../contracts/application").AssetRevealTarget,
    ): void => {
      sectionScroller.want(REVEAL_SECTION_BY_KIND[source.kind]);
      assetReveal.reveal(source);
    },
    starter = reactArtifactRoot.useMemo(
      () =>
        starterSectionState(
          emptySections,
          editable !== undefined,
          view.assetGroups.length === 0,
          view.extras.length > 0,
        ),
      [emptySections, editable, view.assetGroups.length, view.extras.length],
    ),
    [confirmation, setConfirmation] = (
      reactArtifactRoot as typeof React
    ).useState<ConfirmationState | null>(null),
    undoAvailable = useCoarsePointer(),
    announceUndoableChange = (message: string) => {
      if (!undoAvailable) {
        return announceLiveMessage(message);
      }
      let callback = () => {
          return;
        },
        value = showEditorPromiseNotification(
          message,
          <Button
            size={"sm"}
            onClick={() => {
              callback();
              closeToast(value);
              editor.undo.undo();
            }}
          >
            {uiMessage("design-system.designSystemApp.undo")}
          </Button>,
        );
      callback = editor.undo.subscribe(() => {
        callback();
        closeToast(value);
      });
    },
    focusTestId = (testId: string) => {
      let value =
        scrollerRef.current?.querySelector<HTMLElement>(
          '[data-testid="' + testId + '"]',
        ) ?? null;
      if (value === null) {
        return;
      }
      value.focus({
        preventScroll: true,
      });
      value.scrollIntoView({
        block: "nearest",
        inline: "nearest",
      });
    },
    removeToken = (tokenKind: AddTokenKind) => (tokenName: string) => {
      if (
        editable?.exec(uiMessage("design-system.designSystemApp.remove") + tokenName, (deleteConfirmation) =>
          deleteToken(deleteConfirmation, tokenKind, tokenName),
        ) === true
      ) {
        announceUndoableChange(uiMessage("design-system.designSystemApp.removed") + tokenName);
      }
    },
    renameTokenFactory =
      (tokenKind: AddTokenKind) => (tokenName: string, newName: string) =>
        editable?.exec(uiMessage("design-system.designSystemApp.rename") + tokenName, (renameConfirmation) =>
          renameToken(renameConfirmation, tokenKind, tokenName, newName),
        ) ?? false,
    sectionTitle = (sectionId: string, defaultTitle: string) =>
      snapshot.sectionTitles[sectionId] ?? defaultTitle,
    sectionHead = (sectionId: string, defaultTitle: string) => ({
      title: sectionTitle(sectionId, defaultTitle),
      defaultTitle: defaultTitle,
      "data-testid": "ds-card-" + sectionId,
    }),
    colorEdit = reactArtifactRoot.useMemo<
      ColorEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              usage: (tokenName, usage) =>
                void editable.set("usage:color:" + tokenName, (nextUsage) =>
                  setColorTokenUsage(nextUsage, tokenName, usage),
                ),
              value: (tokenName, field, fallback) =>
                void editable.set(
                  "color:" + tokenName + ":" + field,
                  (nextValue) =>
                    setColorTokenValue(
                      nextValue,
                      tokenName,
                      field,
                      fallback,
                    ),
                ),
              clear: (tokenName, field) =>
                void editable.exec(
                  uiMessage("design-system.designSystemApp.clear") + tokenName + " " + field,
                  (nextValue) =>
                    clearColorThemeOverride(
                      nextValue,
                      tokenName,
                      field,
                    ),
                ),
              done: () => editable.seal(),
              remove: removeToken("color"),
              rename: renameTokenFactory("color"),
              addTo: (group) => showAddColor(group.name),
              addGroup: (isNewGroup) => showAddColor("", isNewGroup === true),
              removeGroup: (group) => {
                let value =
                    group.name === ""
                      ? PALETTE_GROUP_NAME
                      : group.name,
                  length = group.tokens.length;
                setConfirmation({
                  get title() { return uiMessage("design-system.designSystemApp.deleteAndIts", { value1: String(value), value2: String(String(length)), value3: String(length === 1 ? " color?" : " colors?") }); },
                  get confirmLabel() { return uiMessage("design-system.designSystemApp.delete"); },
                  body:
                    (length === 1
                      ? uiMessage("design-system.designSystemApp.itIs")
                      : uiMessage("design-system.designSystemApp.all") + String(length) + " are") +
                    " removed from tokens.json; colors in other groups that alias them keep their resolved values. Undo brings the group back.",
                  run: () => {
                    let tokenNames = (
                      viewRef.current.colorGroups.find(
                        (candidate) => candidate.name === group.name,
                      )?.tokens ?? []
                    ).map((tokenName) => tokenName.name);
                    if (
                      tokenNames.length > 0 &&
                      editable.exec(uiMessage("design-system.designSystemApp.removeGroup") + value, (groupRemovalConfirmation) =>
                        deleteColorTokens(groupRemovalConfirmation, tokenNames),
                      )
                    ) {
                      announceUndoableChange(uiMessage("design-system.designSystemApp.deleted") + value);
                    } else {
                      showEditorNotification(
                        value + " changed meanwhile. Nothing was deleted.",
                      );
                    }
                    requestAnimationFrame(() =>
                      focusTestId("ds-add-color-group"),
                    );
                  },
                });
              },
              renameGroup: (group, newName) => {
                let value = tokenGroupRenamePairs(
                  group.tokens.map((tokenName) => tokenName.name),
                  commonTokenNamePrefix(
                    tokenNamesForFamily(
                      snapshot.tokens,
                      "color",
                    ),
                  ),
                  group.name,
                  newName,
                );
                if (value.length === 0) {
                  return false;
                }
                return editable.exec(
                  uiMessage("design-system.designSystemApp.renameGroup") +
                    (group.name === "" ? "palette" : group.name),
                  (tokenName) =>
                    renameColorTokensAtomically(tokenName, value),
                );
              },
            },
      [editable, snapshot],
    ),
    scaleEdit = (
      scaleKind: ScalarTokenKind,
      noteLabel?: string,
    ): ScalarEditActions | undefined =>
      editable === undefined
        ? undefined
        : {
            value: (field, fieldValue) =>
              void editable.set(scaleKind + ":" + field, (nextValue) =>
                setScalarTokenValue(
                  nextValue,
                  scaleKind,
                  field,
                  fieldValue,
                ),
              ),
            done: () => editable.seal(),
            usage: (field, usage) =>
              void editable.set("usage:" + scaleKind + ":" + field, (nextUsage) =>
                setTokenUsage(nextUsage, scaleKind, field, usage),
              ),
            note: (noteValue) =>
              void editable.exec(
                uiMessage("design-system.designSystemApp.edit") + (noteLabel ?? scaleKind) + " note",
                (note) =>
                  setTokenFamilyNote(
                    note,
                    scaleKind,
                    noteValue,
                    noteLabel,
                  ),
              ),
            remove: removeToken(scaleKind),
            rename: renameTokenFactory(scaleKind),
          },
    spacingEdit = reactArtifactRoot.useMemo<
      ScalarEditActions | undefined
    >(() => scaleEdit("spacing"), [editable, snapshot]),
    radiusEdit = reactArtifactRoot.useMemo<
      ScalarEditActions | undefined
    >(() => scaleEdit("radius"), [editable, snapshot]),
    extraScaleEdit = (extraValue: string) => {
      let value = scaleEdit("extra", extraValue);
      if (value === undefined) {
        return undefined;
      } else {
        return {
          ...value,
          add: showAddScaleToken,
        };
      }
    },
    shadowEdit = reactArtifactRoot.useMemo<
      ShadowEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              value: (field, fieldValue, fallback) =>
                void editable.exec(
                  uiMessage("design-system.designSystemApp.edit") + field + " " + fieldValue,
                  (nextValue) =>
                    setShadowTokenValue(
                      nextValue,
                      field,
                      fieldValue,
                      fallback,
                    ),
                ),
              live: (field, shadowValue, fallback) =>
                void editable.set(
                  "shadow:" + field + ":" + shadowValue,
                  (nextValue) =>
                    setShadowTokenValue(
                      nextValue,
                      field,
                      shadowValue,
                      fallback,
                    ),
                ),
              done: () => editable.seal(),
              usage: (tokenName, usage) =>
                void editable.set("usage:shadow:" + tokenName, (nextUsage) =>
                  setTokenUsage(
                    nextUsage,
                    "shadow",
                    tokenName,
                    usage,
                  ),
                ),
              remove: removeToken("shadow"),
              rename: renameTokenFactory("shadow"),
            },
      [editable, snapshot],
    ),
    typeEdit = reactArtifactRoot.useMemo<
      TypographyEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              setField: (field, styleValue, fallback) =>
                void editable.set(
                  "style:" + field + ":" + styleValue,
                  (nextValue) =>
                    setTypographyProperty(
                      nextValue,
                      field,
                      styleValue,
                      fallback,
                    ),
                ),
              setFont: (fontFamily, fontWeight) => {
                let value = validateNewFontFamily(
                  fontWeight,
                  snapshot.tokens.type.families,
                );
                if (value !== null) {
                  showEditorNotification(value);
                  return;
                }
                editable.exec(uiMessage("design-system.designSystemApp.font") + fontFamily, (fontRemovalConfirmation) =>
                  setTypographyFontFamily(
                    fontRemovalConfirmation,
                    fontFamily,
                    fontWeight,
                  ),
                );
              },
              done: () => editable.seal(),
              setUsage: (fontFamily, usage) =>
                void editable.set("usage:style:" + fontFamily, (nextUsage) =>
                  setTypographyStyleUsage(
                    nextUsage,
                    fontFamily,
                    usage,
                  ),
                ),
              remove: removeToken("type"),
              rename: renameTokenFactory("type"),
              dropMissingFonts: () => {
                if (
                  editable.exec(uiMessage("design-system.designSystemApp.dropMissingFontReferences"), (missingFontConfirmation) =>
                    removeMissingFontReferences(missingFontConfirmation),
                  )
                ) {
                  announceLiveMessage(uiMessage("design-system.designSystemApp.referenceRemoved"));
                }
              },
            },
      [editable, snapshot],
    ),
    componentEdit = reactArtifactRoot.useMemo<
      ComponentEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              setGuidelines: (componentName, guidelines) =>
                void editable.set("guide:" + componentName, (nextGuidelines) =>
                  setComponentGuidelines(nextGuidelines, componentName, guidelines),
                ),
              done: () => editable.seal(),
            },
      [editable],
    ),
    componentProps = reactArtifactRoot.useMemo(() => {
      if (!editorFeatureFlags.componentProps) {
        return;
      }
      let entries = new Map<string, InferredPropControl[]>(),
        value = snapshot.bundle.dts.map((bundleFile) => bundleFile.text);
      return (component: EditorComponent) => {
        let entry = entries.get(component.name);
        if (entry !== undefined) {
          return entry;
        }
        let propControls = inferComponentPropControls(component.name, [
          component.types,
          ...value,
        ]);
        entries.set(component.name, propControls);
        return propControls;
      };
    }, [snapshot.bundle.dts]),
    componentStage = reactArtifactRoot.useMemo(
      () => ({
        namespace: snapshot.bundle.namespace ?? "",
        globals: snapshot.bundle.declared.flatMap((declaration) =>
          declaration.global !== undefined ? [declaration.global] : [],
        ),
      }),
      [snapshot.bundle.namespace, snapshot.bundle.declared],
    ),
    lastChange = snapshot.lastChange,
    removeFont =
      editable === undefined
        ? undefined
        : (font: Pick<EditorFont, "path">) => {
            if (
              editable.exec(uiMessage("design-system.designSystemApp.removeFont") + font.path, (fontRemovalConfirmation) =>
                deleteFontFace(fontRemovalConfirmation, font.path),
              )
            ) {
              announceUndoableChange(
                uiMessage("design-system.designSystemApp.removed") + font.path.replace(/^(?:fonts|assets)\//, ""),
              );
            }
          },
    [openAssetPath, setOpenAssetPath] = (
      reactArtifactRoot as typeof React
    ).useState<string | null>(null),
    openAsset = reactArtifactRoot.useMemo(
      () =>
        openAssetPath === null
          ? null
          : (view.assetGroups
              .flatMap((group) => group.assets)
              .find((asset) => asset.path === openAssetPath) ?? null),
      [openAssetPath, view.assetGroups],
    ),
    storageUsageText = assetStorageUsageMessage(blobCatalogue, {
      bytes: snapshot.blobBytesUsed,
      files: uniqueStoredBlobCount(snapshot.storage),
    }),
    missingBlobsNoticedRef = reactArtifactRoot.useRef(false);
  reactArtifactRoot.useEffect(() => {
    if (
      blobAnalysis === null ||
      blobAnalysis.missing.length === 0 ||
      missingBlobsNoticedRef.current
    ) {
      return;
    }
    missingBlobsNoticedRef.current = true;
    showEditorNotification(
      missingAssetsMessage(blobAnalysis.missing),
    );
  }, [blobAnalysis]);
  let [freeingStorage, setFreeingStorage] =
      reactArtifactRoot.useState(false),
    freeSpaceText =
      editable === undefined || freeingStorage || blobAnalysis === null
        ? ""
        : reclaimAssetsButtonLabel(
            blobAnalysis.reclaimableBytes,
            blobAnalysis.reclaimable.length,
            undefined,
            blobAnalysis.windowed,
          ),
    documentStillLoading = () =>
      "loadState" in applicationDocument && applicationDocument.saveState().status !== "ready",
    afterContentSaved = (afterSave: () => void) => {
      let callback = () =>
        documentStillLoading()
          ? showEditorNotification(
              RECLAIM_RECONNECTING_MESSAGE,
            )
          : afterSave();
      if (!applicationDocument.dirty()) {
        return callback();
      }
      if (applicationDocument.saveMode() !== "auto") {
        return showEditorNotification(
          RECLAIM_SAVE_FIRST_MESSAGE,
        );
      }
      if (system.holdAutosave) {
        return showEditorNotification(
          uiMessage("design-system.designSystemApp.addingYourFilesFirstTry"),
        );
      }
      applicationDocument.save().then(() => {
        if (!applicationDocument.dirty()) {
          return callback();
        }
        let value = applicationDocument.saveState();
        showEditorNotification(
          value.status === "error"
            ? uiMessage("design-system.designSystemApp.yourLatestChangesCouldNot") +
                (value.message ?? "")
            : RECLAIM_SAVING_MESSAGE,
        );
      });
    },
    freeStorage = () =>
      afterContentSaved(() => {
        let value = assessAssetReclamation(
          system.getSnapshot().files,
        );
        if (value?.windowed === true) {
          return showEditorNotification(
            RECLAIM_WINDOWED_COLLECTION_MESSAGE,
          );
        }
        if (value === null || value.reclaimable.length === 0) {
          return;
        }
        setFreeingStorage(true);
        publishedPageBlobIds()
          .then((reclaimResult) => {
            if (applicationDocument.dirty() || documentStillLoading()) {
              showEditorNotification(
                !applicationDocument.dirty()
                  ? RECLAIM_RECONNECTING_MESSAGE
                  : applicationDocument.saveMode() === "auto"
                    ? RECLAIM_SAVING_MESSAGE
                    : RECLAIM_SAVE_FIRST_MESSAGE,
              );
              return;
            }
            let reclaimAssessment = assessAssetReclamation(
              system.getSnapshot().files,
            );
            if (reclaimAssessment === null || reclaimAssessment.windowed) {
              showEditorNotification(
                reclaimAssessment === null
                  ? RECLAIM_LIST_FAILED_MESSAGE
                  : RECLAIM_WINDOWED_COLLECTION_MESSAGE,
              );
              return;
            }
            let values = new Set(
                reclaimAssessment.reclaimable.map((asset) => asset.id),
              ),
              reclaimableAssets = excludePublishedAssets(
                value.reclaimable.filter((asset) => values.has(asset.id)),
                reclaimResult,
              );
            if (reclaimableAssets.length === 0) {
              showEditorNotification(
                RECLAIM_NOTHING_UNUSED_MESSAGE,
              );
              return;
            }
            freeingBlobIdsRef.current = new Set(
              reclaimableAssets.map((asset) => asset.id),
            );
            return deleteStoredAssets(reclaimableAssets).then((deleteResult) => {
              if (deleteResult.freed.size > 0) {
                editor.undo.clear();
              }
              showEditorNotification(
                reclaimAssetsResultMessage(deleteResult),
              );
            });
          })
          .finally(() => {
            freeingBlobIdsRef.current = new Set();
            setFreeingStorage(false);
          });
      }),
    askFreeStorage = () =>
      afterContentSaved(() => {
        refreshAssetsCatalog().then(() => {
          let value = assessAssetReclamation(
            system.getSnapshot().files,
          );
          if (value === null || value.reclaimable.length === 0) {
            showEditorNotification(
              value === null
                ? RECLAIM_LIST_FAILED_MESSAGE
                : value.windowed
                  ? RECLAIM_WINDOWED_COLLECTION_MESSAGE
                  : RECLAIM_NOTHING_UNUSED_MESSAGE,
            );
            return;
          }
          setConfirmation({
            get title() { return uiMessage("design-system.designSystemApp.freeSpace"); },
            body: reclaimAssetsConfirmation(
              value.reclaimable.length,
              value.reclaimableBytes,
            ),
            get confirmLabel() { return uiMessage("design-system.designSystemApp.deletePermanently"); },
            run: freeStorage,
          });
        });
      }),
    downloadAsset = (asset: EditorAsset) => {
      readDownloadFileBytes(
        snapshot.files,
        asset.path,
        snapshot.storage,
      ).then((downloadData) => {
        if (downloadData === null) {
          artifactHealth.report(...DOWNLOAD_INTERNAL_FAILURE);
          showEditorNotification(
            uiMessage("design-system.designSystemApp.couldNotRead") + asset.name + " here",
          );
          return;
        }
        saveDownloadFile(
          asset.name,
          downloadData,
          asset.mime !== "" ? asset.mime : "application/octet-stream",
        ).then((healthOutcome) => {
          artifactHealth.report(
            ...downloadHealthOutcome(healthOutcome.shell)!,
          );
          if (
            healthOutcome.outcome === "withheld" ||
            healthOutcome.outcome === "refused" ||
            healthOutcome.outcome === "failed"
          ) {
            showEditorNotification(
              artifactDownloadResultMessage(asset.name, healthOutcome),
            );
          }
        });
      });
    },
    [handoffHost] = reactArtifactRoot.useState(() =>
      createClaudeDeliveryContextStore(),
    ),
    refreshHandoffHost = handoffHost.refresh;
  reactArtifactRoot.useEffect(() => {
    let callback = () => {
      if (document.visibilityState !== "hidden") {
        handoffHost.refresh();
      }
    };
    handoffHost.refresh();
    window.addEventListener("focus", callback);
    document.addEventListener("visibilitychange", callback);
    return () => {
      window.removeEventListener("focus", callback);
      document.removeEventListener("visibilitychange", callback);
    };
  }, [handoffHost]);
  let [handoffNotice, setHandoffNotice] = reactArtifactRoot.useState<{
      kind: "failed" | "suggested" | "copied";
      held: boolean;
      prompt: string;
    } | null>(null),
    [handoffBusy, setHandoffBusy] = reactArtifactRoot.useState(false),
    noticeWithAction = (
      message: string,
      actionLabel: string,
      action: () => void,
    ) => {
      let value = showEditorPromiseNotification(
        message,
        <Button
          size={"sm"}
          onClick={() => {
            closeToast(value);
            action();
          }}
        >
          {actionLabel}
        </Button>,
      );
    },
    copyHandoffPrompt = (prompt: string) =>
      void copyTextToClipboard(prompt).then((copiedText) =>
        copiedText
          ? showEditorNotification("Copied")
          : noticeWithAction(uiMessage("design-system.designSystemApp.copyFailed"), uiMessage("design-system.designSystemApp.copyIt"), () =>
              copyHandoffPrompt(prompt),
            ),
      ),
    askClaude = (
      request: ClaudeRequest,
      anchor?: Element | null,
      onComplete?: () => void,
    ) => {
      setHandoffNotice(null);
      setHandoffBusy(true);
      let value = handoffHost.current(),
        isDirty = applicationDocument.dirty(),
        deliveryRoad = chooseClaudeDeliveryRoad(request, value, isDirty);
      reportMigrationCleanupPressed(request, deliveryRoad);
      deliverClaudeRequest(request, anchor, value, isDirty)
        .then((source) => {
          reportMigrationCleanupResult(
            request,
            deliveryRoad,
            source.kind,
          );
          if (source.kind !== "staged") {
            refreshHandoffHost();
          }
          if (source.kind === "staged" && request.deliver === "send") {
            return;
          }
          if (source.kind === "unanswered" && onComplete !== undefined) {
            noticeWithAction(
              claudeSendResultMessage("unanswered"),
              // MineDesign: user-facing copy calls the agent "the agent", not Claude.
              uiMessage("design-system.designSystemApp.askTheAgent"),
              onComplete,
            );
            return;
          }
          if (source.kind === "staged" || source.kind === "unanswered") {
            showEditorNotification(
              claudeSendResultMessage(source.kind),
            );
            return;
          }
          if (source.kind === "sent") {
            showEditorNotification(uiMessage("design-system.designSystemApp.sentToTheAgentIt"));
            return;
          }
          setHandoffNotice({
            kind: source.kind,
            held: source.held === true,
            prompt: request.prompt,
          });
        })
        .finally(() => setHandoffBusy(false));
    },
    askGithub =
      editable === undefined
        ? undefined
        : (element: Element) =>
            askClaude(
              {
                get label() { return uiMessage("design-system.designSystemApp.syncFromGitHub"); },
                request: viewerGitHubSyncPrompt(
                  artifactPageAddress(),
                ),
                prompt: githubStarterPrompt(
                  artifactPageAddress(),
                ),
                deliver: "send",
              },
              element,
            ),
    connectorOptionLabel = WELCOME_OPTIONS.connect[0],
    uploadOptionLabel = WELCOME_OPTIONS.upload[0],
    askConnectors =
      editable === undefined
        ? undefined
        : (element: Element) =>
            askClaude(
              {
                label: connectorOptionLabel,
                request: viewerEmptySystemPrompt(
                  artifactPageAddress(),
                  connectorOptionLabel,
                ),
                prompt: ownerEmptySystemPrompt(
                  artifactPageAddress(),
                  connectorOptionLabel,
                ),
                deliver: "send",
              },
              element,
            ),
    [uploadPanelOpen, setUploadPanelOpen] =
      reactArtifactRoot.useState(false),
    uploadPanelActive = uploadPanelOpen,
    uploadPanelActiveRef = reactArtifactRoot.useRef(false);
  uploadPanelActiveRef.current = uploadPanelActive;
  let uploadPanelVisibleRef = reactArtifactRoot.useRef(false);
  uploadPanelVisibleRef.current =
    uploadPanelOpen && currentSection === "readme";
  let showWelcome = starter.hint || uploadPanelOpen,
    emptyIntakeSummary: WelcomeIntakeSummary = {
      refused: [],
      landTo: null,
    },
    [intakeSummary, setIntakeSummary] =
      reactArtifactRoot.useState(emptyIntakeSummary),
    [intakeFiles, setIntakeFiles] = reactArtifactRoot.useState<
      File[]
    >([]),
    intakeFilesRef = reactArtifactRoot.useRef<File[]>([]);
  intakeFilesRef.current = intakeFiles;
  let addWelcomeFiles = (welcomeFiles: File[]) => {
      let callback = (leftFile: File, rightFile: File) =>
          leftFile.name === rightFile.name &&
          leftFile.size === rightFile.size &&
          uploadedFileRelativePath(leftFile) ===
            uploadedFileRelativePath(rightFile),
        value = welcomeFiles.filter(
          (candidateFile, index) =>
            !intakeFilesRef.current.some((file) =>
              callback(file, candidateFile),
            ) &&
            welcomeFiles.findIndex((file) => callback(file, candidateFile)) === index,
        );
      if (
        value.length === 0 ||
        addFiles === undefined ||
        !addFiles(value, undefined, true)
      ) {
        return;
      }
      intakeFilesRef.current = [...intakeFilesRef.current, ...value];
      setIntakeFiles((files) => [...files, ...value]);
      setUploadPanelOpen(true);
    },
    clearWelcomeFiles = () => {
      setIntakeSummary(emptyIntakeSummary);
      setIntakeFiles([]);
      intakeFilesRef.current = [];
      setIntakeFilePaths(new Map());
    },
    closeUploadPanel = () => setUploadPanelOpen(false),
    openUploadPanel = () => setUploadPanelOpen(true),
    backFromUpload = () => {
      closeUploadPanel();
      if (intakeSummary.landTo !== null) {
        jumpToSection(intakeSummary.landTo);
      }
    },
    [intakeFilePaths, setIntakeFilePaths] =
      reactArtifactRoot.useState(new Map<File, string>()),
    keptIntakeCount = intakeFilePaths.size,
    previousFilesRef = reactArtifactRoot.useRef(snapshot.files);
  reactArtifactRoot.useEffect(() => {
    let current = previousFilesRef.current;
    previousFilesRef.current = snapshot.files;
    if (current === snapshot.files || intakeFilePaths.size === 0) {
      return;
    }
    let callback = (path: string) =>
        path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) ||
        path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir),
      values = new Set(intakeFilePaths.values()),
      value = Object.keys(snapshot.files).filter(
        (path) =>
          !Object.hasOwn(current, path) &&
          !values.has(path) &&
          callback(path),
      ),
      removedPaths = Object.keys(current).filter(
        (path) => !Object.hasOwn(snapshot.files, path) && callback(path),
      ),
      intakePaths = [...intakeFilePaths].filter(
        ([, path]) => !Object.hasOwn(snapshot.files, path),
      );
    if (intakePaths.length === 0) {
      return;
    }
    let entries = new Map(intakeFilePaths),
      items = [],
      baseName = (path: string) => path.slice(path.lastIndexOf("/") + 1),
      pathPrefix = (path: string) => path.slice(0, path.indexOf("/"));
    for (let [intakePath, existingPath] of intakePaths) {
      let matchingPaths = value.filter(
          (candidatePath) =>
            baseName(candidatePath) === baseName(existingPath) &&
            pathPrefix(candidatePath) === pathPrefix(existingPath),
        ),
        removedMatches = removedPaths.filter(
          (candidatePath) =>
            baseName(candidatePath) === baseName(existingPath) &&
            pathPrefix(candidatePath) === pathPrefix(existingPath),
        );
      if (matchingPaths.length === 1 && removedMatches.length === 1) {
        entries.set(intakePath, matchingPaths[0]);
        value.splice(value.indexOf(matchingPaths[0]), 1);
      } else {
        entries.delete(intakePath);
        items.push(intakePath);
      }
    }
    setIntakeFilePaths(entries);
    if (items.length > 0) {
      setIntakeFiles((paths) =>
        paths.filter((path) => !items.includes(path)),
      );
    }
  }, [snapshot.files, intakeFilePaths]);
  let recordIntakeOutcome = (
      uploadSummary: AssetUploadSummary,
      uploadedFiles: Map<File, string>,
    ) => {
      let value = countSuccessfulUploads(uploadSummary);
      setIntakeSummary((summary) => ({
        refused: [
          ...summary.refused,
          ...uploadSummary.refused.map((file) => file.name),
        ],
        landTo:
          value === 0
            ? summary.landTo
            : summary.landTo === "assets" ||
                Object.keys(uploadSummary.assets).length > 0
              ? "assets"
              : "type",
      }));
      if (uploadedFiles.size > 0) {
        setIntakeFilePaths((paths) => new Map([...paths, ...uploadedFiles]));
      }
    },
    removeWelcomeFile = (fileIndex: number) => {
      let value = intakeFiles[fileIndex];
      if (value === undefined || editable === undefined) {
        return;
      }
      let entry = intakeFilePaths.get(value),
        name = uploadedAssetFile(value).name,
        singleIntakeFile = intakeFiles.length === 1,
        callback = () => {
          setIntakeFiles((files) =>
            files.filter((file) => file !== value),
          );
          if (singleIntakeFile) {
            clearWelcomeFiles();
            closeUploadPanel();
          }
        };
      if (entry !== undefined) {
        let removeFile = (
          document: import("../../contracts").DesignSystemContent,
        ) =>
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
            setIntakeFilePaths((paths) => {
              let entries = new Map(paths);
              entries.delete(value);
              return entries;
            });
            callback();
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
        setIntakeSummary((summary) => {
          let items = [...summary.refused];
          items.splice(items.indexOf(name), 1);
          return {
            ...summary,
            refused: items,
          };
        });
      }
      callback();
    },
    renderAssetThumbnail = (thumbnail: import("../../contracts/editor-runtime").AssetThumbnail): React.ReactElement => (
      <AssetDetailsPreview
        asset={thumbnail}
        files={snapshot.files}
        storage={snapshot.storage}
        size={"tile"}
      />
    ),
    renderUploadThumbnail = (file: File): React.ReactElement => {
      let entry = intakeFilePaths.get(file),
        value = (entry === undefined
          ? undefined
          : view.assetGroups
              .flatMap((group) => group.assets)
              .find((asset) => asset.path === entry)) ?? {
          path: entry ?? "",
          group: "",
          name: file.name,
          mime: mimeTypeForPath(file.name),
          ext: fileExtension(file.name),
          kind:
            entry !== undefined &&
            entry.startsWith(DESIGN_SYSTEM_PATHS.fontsDir)
              ? "font"
              : assetKindForPath(file.name),
          bytes: file.size,
        };
      return (
        <AssetTileThumbnail
          a={value}
          renderThumb={renderAssetThumbnail}
        />
      );
    },
    createFromWelcomeFiles = (files: File[]) => {
      let value = files
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
        state: ClaudeRequest = {
          label: uploadOptionLabel,
          request: viewerBuildFromFilesPrompt(
            keptIntakeCount,
            artifactPageAddress(),
            uploadOptionLabel,
          ),
          prompt: ownerBuildFromFilesPrompt(
            value,
            artifactPageAddress(),
            uploadOptionLabel,
          ),
          deliver: "send",
        },
        callback = () => askClaude(state, null, callback);
      callback();
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
    handoffNote =
      handoffNotice === null ? null : (
        <HandoffNotice
          kind={handoffNotice.kind}
          held={handoffNotice.held}
          prompt={handoffNotice.prompt}
          onCopy={() => copyHandoffPrompt(handoffNotice.prompt)}
        />
      ),
    sendFileHandoff = (request: ClaudeRequest, afterCopy: () => void) => {
      deliverClaudeRequest(
        request,
        null,
        handoffHost.current(),
        applicationDocument.dirty(),
      ).then((source) => {
        if (source.kind !== "staged") {
          refreshHandoffHost();
        }
        if (source.kind === "staged") {
          showEditorNotification(
            claudeSendResultMessage("staged"),
          );
        } else if (source.kind === "unanswered") {
          noticeWithAction(
            claudeSendResultMessage("unanswered"),
            // MineDesign: user-facing copy calls the agent "the agent", not Claude.
            uiMessage("design-system.designSystemApp.askTheAgent"),
            afterCopy,
          );
        } else if (source.kind === "sent") {
          showEditorNotification(uiMessage("design-system.designSystemApp.sentToTheAgentIt"));
        } else if (source.kind === "failed") {
          noticeWithAction(
            claudeDeliveryStatusMessage(
              "failed",
              source.held === true,
            ),
            uiMessage("design-system.designSystemApp.copyIt"),
            () => copyHandoffPrompt(request.prompt),
          );
        } else {
          showEditorNotification(
            claudeDeliveryStatusMessage(
              source.kind,
              source.held === true,
            ),
          );
        }
      });
    },
    fileHandoffAction = (items: RefusedUpload[]) => {
      let callback = () => {
        let value =
          items.length === 1
            ? // MineDesign: user-facing copy calls the agent "the agent", not Claude.
              uiMessage("design-system.designSystemApp.askTheAgentAboutThis")
            : uiMessage("design-system.designSystemApp.askTheAgentAbout") + String(items.length) + " files";
        sendFileHandoff(
          {
            label: value,
            request: ownerHandoffFilesPrompt(
              items,
              artifactPageAddress(),
            ),
            prompt: viewerHandoffFilesPrompt(
              items,
              artifactPageAddress(),
            ),
          },
          callback,
        );
      };
      return callback;
    },
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
      let value = uploadResultSummary(summary, isQuiet, fromStart);
      if (value === null) {
        return;
      }
      if (value.handOff !== undefined) {
        noticeWithAction(
          value.text,
          // MineDesign: user-facing copy calls the agent "the agent", not Claude.
          uiMessage("design-system.designSystemApp.askTheAgent"),
          fileHandoffAction(value.handOff),
        );
      } else {
        showEditorNotification(value.text);
      }
    },
    assetManager = useAssetGroupEditor({
      groups: view.assetGroups,
      edit: editable,
      files: () => system.getSnapshot().files,
      scroller: scrollerRef,
      openAsset: setOpenAssetPath,
      downloadAsset: downloadAsset,
      askRemove: setConfirmation,
      removed: announceUndoableChange,
      reveal: revealAsset,
    }),
    INTAKE_QUEUE_WAIT_MS = 700,
    intakeRunningRef = reactArtifactRoot.useRef(false),
    intakeQueueRef = reactArtifactRoot.useRef<IntakeQueueEntry[]>([]),
    intakeSavingRef = reactArtifactRoot.useRef(false),
    addFiles =
      editable === undefined
        ? undefined
        : (items: File[], fileGroup?: string, fromStart = false) => {
            if (items.length === 0) {
              return false;
            }
            if (intakeSavingRef.current) {
              showEditorNotification(
                uiMessage("design-system.designSystemApp.savingWhatYouJustAdded"),
              );
              return false;
            }
            intakeQueueRef.current.push({
              files: items,
              group: fileGroup ?? null,
              fromStart: fromStart,
            });
            if (intakeRunningRef.current) {
              return true;
            }
            intakeRunningRef.current = true;
            setIntakeBusy(true);
            let current = currentSectionRef.current;
            system.holdAutosave = true;
            let hadExistingEdits = applicationDocument.dirty(),
              values = new Set(Object.keys(applicationDocument.content().files)),
              callback = (path: string) =>
                !values.has(path) &&
                (path.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) ||
                  path.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)),
              flag = false;
            (async (): Promise<AssetUploadSummary> => {
              let state: AssetUploadSummary = {
                fonts: 0,
                assets: {},
                blobs: 0,
                refused: [],
                warnings: [],
              };
              while (
                intakeQueueRef.current.length > 0 ||
                (await new Promise<boolean>((resolve) =>
                  setTimeout(
                    () => resolve(intakeQueueRef.current.length > 0),
                    INTAKE_QUEUE_WAIT_MS,
                  ),
                ))
              ) {
                if (intakeQueueRef.current.length === 0) {
                  continue;
                }
                let queuedUpload = intakeQueueRef.current.shift();
                if (queuedUpload === undefined) {
                  continue;
                }
                let group = queuedUpload.group,
                  entries = new Map<File, string>(),
                  commitUpload = (
                    file: File,
                    commit: () => import("../../contracts/application").UploadCommitResult,
                  ) => {
                    if (!queuedUpload.fromStart) {
                      return commit();
                    }
                    let queuedPaths = new Set(
                        Object.keys(applicationDocument.content().files),
                      ),
                      commitResult = commit(),
                      committedPath =
                        commitResult === true
                          ? Object.keys(applicationDocument.content().files).find(
                              (path) =>
                                !queuedPaths.has(path) && callback(path),
                            )
                          : undefined;
                    if (committedPath !== undefined) {
                      entries.set(file, committedPath);
                    }
                    return commitResult;
                  },
                  neverSaves = applicationDocument.neverSaves,
                  uploadResult = await uploadAssetFiles(
                    queuedUpload.files,
                    {
                      ...intakeOptions,
                      onProgress: (progress) => {
                        let queuedCount = intakeQueueRef.current.reduce(
                          (count, upload) =>
                            count + upload.files.length,
                          0,
                        );
                        setIntakeProgress(
                          progress === null
                            ? null
                            : progress +
                                (queuedCount > 0
                                  ? " · " + String(queuedCount) + " more queued"
                                  : ""),
                        );
                      },
                      font: (fontSource, commit) =>
                        commitUpload(commit, () =>
                          commitUploadedAssetChange(
                            (result) =>
                              editable.exec(
                                "add font " + fontSource.fileName,
                                result,
                              ),
                            (result) =>
                              addFontFace(result, fontSource),
                            neverSaves,
                          ),
                        ),
                      asset: (assetSource, commit) =>
                        commitUpload(commit, () =>
                          commitUploadedAssetChange(
                            (result) =>
                              editable.exec("add " + assetSource.fileName, result),
                            (result) =>
                              addAssetFile(result, assetSource),
                            neverSaves,
                          ),
                        ),
                    },
                    group ?? undefined,
                  );
                if (queuedUpload.fromStart) {
                  flag = true;
                  recordIntakeOutcome(uploadResult, entries);
                }
                state = mergeAssetUploadResults(state, uploadResult);
              }
              return state;
            })()
              .then(async (uploadResult): Promise<void> => {
                setIntakeProgress(null);
                if (countSuccessfulUploads(uploadResult) === 0) {
                  announceIntakeOutcome(uploadResult, false, flag);
                  return;
                }
                system.setNote(
                  flag
                    ? uploadedFilesBuildSummary(uploadResult)
                    : addedFilesSummary(uploadResult),
                  Object.fromEntries(
                    Object.entries(applicationDocument.content().files).filter(
                      ([path]) => callback(path),
                    ),
                  ),
                );
                let activeElement = document.activeElement,
                  hasFocusedTextInput =
                    activeElement instanceof HTMLElement &&
                    (activeElement.isContentEditable ||
                      /^(INPUT|TEXTAREA|SELECT)$/.test(
                        activeElement.tagName,
                      ));
                if (
                  currentSectionRef.current === current &&
                  tokenDialogRef.current === null &&
                  !uploadPanelVisibleRef.current &&
                  !hasFocusedTextInput
                ) {
                  jumpToSection(
                    Object.keys(uploadResult.assets).length === 0 && uploadResult.fonts > 0
                      ? "type"
                      : "assets",
                  );
                }
                let hasPendingManualEdits = hadExistingEdits && applicationDocument.saveMode() !== "auto";
                announceIntakeOutcome(uploadResult, !hasPendingManualEdits, flag);
                if (hasPendingManualEdits) {
                  return;
                }
                editor.seal();
                system.holdAutosave = false;
                setIntakeProgress("Saving…");
                intakeSavingRef.current = true;
                await applicationDocument.save();
                intakeSavingRef.current = false;
                setIntakeProgress(null);
                let intakeSaveState = applicationDocument.saveState();
                if (intakeSaveState.status === "error") {
                  showEditorNotification(
                    uiMessage("design-system.designSystemApp.theFilesAreInBut") +
                      intakeSaveState.message +
                      (applicationDocument.saveMode() === "auto"
                        ? ""
                        : " Press Save to retry."),
                  );
                }
              })
              .finally(() => {
                system.holdAutosave = false;
                intakeSavingRef.current = false;
                intakeRunningRef.current = false;
                setIntakeBusy(false);
              });
            return true;
          },
    uploadAssets =
      addFiles === undefined
        ? undefined
        : () => void pickUploadFiles().then(addFiles),
    uploadFonts =
      addFiles === undefined
        ? undefined
        : () =>
            void pickUploadFiles(
              false,
              FONT_FILE_ACCEPT,
            ).then(addFiles),
    [flashTarget, setFlashTarget] = (
      reactArtifactRoot as typeof React
    ).useState<TokenFlashTarget | null>(null),
    flashToken = (tokenName: string, shouldScroll = true, sectionId?: string) =>
      setFlashTarget({
        name: tokenName,
        scroll: shouldScroll,
        group: sectionId,
      });
  reactArtifactRoot.useEffect(() => {
    if (flashTarget === null) {
      return;
    }
    let current = scrollerRef.current,
      value = ["color", "style", "spacing", "corners", "family", "shadow"]
        .map(
          (tokenName) =>
            '[data-testid="ds-' + tokenName + "-" + flashTarget.name + '"]',
        )
        .join(", "),
      targetElement =
        current?.querySelector(value) ??
        (flashTarget.group !== undefined
          ? current?.querySelector(
              '[data-testid="ds-color-group-' + flashTarget.group + '"]',
            )
          : null);
    if (!(targetElement instanceof HTMLElement)) {
      return;
    }
    if (flashTarget.scroll && typeof targetElement.scrollIntoView === "function") {
      targetElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    targetElement.classList.add("ds-flash");
    let flashTimer = window.setTimeout(() => {
      targetElement.classList.remove("ds-flash");
      setFlashTarget(null);
    }, 1200);
    return () => {
      window.clearTimeout(flashTimer);
      targetElement.classList.remove("ds-flash");
    };
  }, [flashTarget]);
  let nextNumericTokenName = (
      inputName: string,
      existingNames: string[],
      fallbackName: string,
    ) => {
      if (inputName === "") {
        return fallbackName;
      }
      let value = existingNames
        .map((suffix) => /-(\d{1,4})$/.exec(suffix)?.[1])
        .filter((suffix) => suffix !== undefined);
      if (value.length === 0) {
        return inputName + "-2";
      }
      let suffixes = [
          ...new Set(value.map((suffix) => parseInt(suffix, 10))),
        ].sort((suffix, otherSuffix) => suffix - otherSuffix),
        nextSuffix =
          suffixes.length > 1
            ? Math.min(
                ...suffixes
                  .slice(1)
                  .map((suffix, index) => suffix - suffixes[index]),
              )
            : 100;
      return (
        inputName +
        "-" +
        String(suffixes.at(-1)! + nextSuffix).padStart(
          Math.max(...value.map((items) => items.length)),
          "0",
        )
      );
    },
    [tokenDialog, setTokenDialog] = (
      reactArtifactRoot as typeof React
    ).useState<TokenDialogState | null>(null),
    tokenDialogRef = reactArtifactRoot.useRef(tokenDialog);
  tokenDialogRef.current = tokenDialog;
  let valueThemes =
      themes.length > 0
        ? themes
        : [
            {
              id: "light",
              name: "Value",
            },
          ],
    defaultValueThemeId = valueThemes[0]?.id ?? "light",
    themeGrounds = reactArtifactRoot.useMemo(
      () => previewThemeGroundColors(snapshot.tokens, valueThemes),
      [snapshot.tokens, valueThemes],
    ),
    previewGround =
      needsGround && previewThemeId !== undefined
        ? themeGrounds[previewThemeId]?.well
        : undefined,
    addColorTokenFromSource = (source: AddedToken, namePrefix?: string) => {
      if (editable === undefined || source.kind !== "color") {
        return;
      }
      let value = source.values[defaultValueThemeId] ?? "#888888";
      if (
        editable.exec(
          source.newGroup ? uiMessage("design-system.designSystemApp.addColorGroup") : uiMessage("design-system.designSystemApp.addColor"),
          (candidateName) => {
            let tokenName = addColorToken(
              candidateName,
              source.name,
              value,
              namePrefix,
            );
            if (tokenName === candidateName) {
              return candidateName;
            }
            for (let [themeId, themeValue] of Object.entries(source.values)) {
              if (themeId !== defaultValueThemeId) {
                tokenName = setColorTokenValue(
                  tokenName,
                  source.name,
                  themeId,
                  themeValue,
                );
              }
            }
            if (source.usage !== "") {
              tokenName = setColorTokenUsage(
                tokenName,
                source.name,
                source.usage,
              );
            }
            return tokenName;
          },
        )
      ) {
        flashToken(
          source.name,
          true,
          source.group === "" ? undefined : source.group,
        );
      } else {
        showEditorNotification(
          uiMessage("design-system.designSystemApp.couldNotAdd") + source.name + ".",
        );
      }
    },
    showAddColor = (initialName = "", useSuggestedName = false) => {
      if (editable === undefined) {
        return;
      }
      let value = tokenNamesForFamily(snapshot.tokens, "color"),
        namePrefix = commonTokenNamePrefix(value),
        groups = view.colorGroups.map((group) => ({
          key: group.name,
          label:
            group.name === "" ? PALETTE_GROUP_NAME : group.name,
          seed:
            group.name === ""
              ? namePrefix
              : group.numeric === true
                ? unusedTokenName(
                    snapshot.tokens,
                    "color",
                    nextNumericTokenName(
                      namePrefix + group.name,
                      group.tokens.map((tokenName) => tokenName.name),
                      "color",
                    ),
                  )
                : namePrefix + group.name + "-",
        }));
      if (!groups.some((group) => group.key === "")) {
        groups.unshift({
          key: "",
          label: PALETTE_GROUP_NAME,
          seed: namePrefix,
        });
      }
      let nameSeed = useSuggestedName
          ? {
              key: NEW_TOKEN_GROUP_SENTINEL,
              label: "",
              seed: namePrefix,
            }
          : (groups.find((group) => group.key === initialName) ?? groups[0]),
        callback = (groupName: string) =>
          view.colorGroups
            .find((token) => token.name === groupName)
            ?.tokens.at(-1)?.name;
      setTokenDialog({
        req: {
          kind: "color",
          themes: valueThemes,
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, "color"),
          ),
          names: new Set(value),
          name: nameSeed.seed,
          value: "#888888",
          groups: groups,
          group: nameSeed.key,
          namespace: namePrefix,
          seedFor: (groupName) => namePrefix + groupName + "-",
          groupOf: (tokenName) =>
            tokenHasGroupSuffix(tokenName, namePrefix)
              ? tokenGroupName(tokenName, namePrefix)
              : "",
        },
        land: (source) => {
          if (source.kind === "color") {
            addColorTokenFromSource(source, callback(source.group));
          }
        },
      });
    },
    TOKEN_DEFAULTS: Record<
      ScalarTokenKind,
      {
        value: string;
        label: string;
      }
    > = {
      spacing: {
        value: "8px",
        get label() { return uiMessage("design-system.designSystemApp.spacingValue"); },
      },
      radius: {
        value: "4px",
        get label() { return uiMessage("design-system.designSystemApp.cornerRadius"); },
      },
      extra: {
        value: "1",
        get label() { return uiMessage("design-system.designSystemApp.token"); },
      },
    },
    commonNumericNameStem = (names: string[]): string => {
      let values = new Set(
          names.map((name) => /^(.*)-\d{1,4}$/.exec(name)?.[1] ?? null),
        ),
        [items] = [...values];
      if (values.size === 1 && items !== null && items !== undefined) {
        return items;
      } else {
        return "";
      }
    },
    newTokenNameSeed = (
      tokenKind: AddTokenKind,
      namePrefix: string,
      items: string[],
      nameSeed = "",
    ) => {
      let nameStem = namePrefix !== "" ? namePrefix : commonNumericNameStem(items);
      if (nameStem === "") {
        return nameSeed;
      }
      if (
        items.length > 0 &&
        items.every((name) => /-\d{1,4}$/.test(name))
      ) {
        return unusedTokenName(
          snapshot.tokens,
          tokenKind,
          nextNumericTokenName(nameStem, items, nameStem),
        );
      } else {
        return nameStem + "-";
      }
    },
    showAddScaleToken = (source: ScalarScaleGroup) => {
      if (editable === undefined) {
        return;
      }
      let kind = source.kind,
        value = source.family?.key,
        defaults = TOKEN_DEFAULTS[kind],
        tokens =
          (kind === "spacing"
            ? view.spacing
            : kind === "radius"
              ? view.corners
              : view.extras.find((extraGroup) => extraGroup.key === value)?.scale
          )?.tokens ?? [],
        namePrefix = commonTokenNamePrefix(
          tokens.map((token) => token.name),
        ),
        groups =
          kind === "spacing"
            ? groupedTokenScale(kind, tokens)
            : null,
        selectedGroup =
          groups === null
            ? undefined
            : groups.map((group) => ({
                key: group.name === "" ? "" : namePrefix + group.name,
                get label() { return group.name === "" ? (uiMessage("design-system.designSystemApp.spacing")) : (group.name); },
                seed: newTokenNameSeed(
                  kind,
                  group.name === "" ? "" : namePrefix + group.name,
                  group.tokens.map((token) => token.name),
                  namePrefix,
                ),
              })),
        selectedSource =
          selectedGroup?.find((token) => token.key === source.name) ?? selectedGroup?.[0],
        callback = (tokenName: string) =>
          tokenName === ""
            ? tokens.filter(
                (token) =>
                  !tokenHasGroupSuffix(token.name, namePrefix),
              )
            : tokens.filter((token) => token.name.startsWith(tokenName + "-"));
      setTokenDialog({
        req: {
          kind: kind,
          get label() { return value !== undefined ? ((value) + (" token")) : (defaults.label); },
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, kind),
          ),
          name:
            selectedSource !== undefined
              ? selectedSource.seed
              : newTokenNameSeed(
                  kind,
                  source.name,
                  source.tokens.map((token) => token.name),
                  namePrefix,
                ),
          value:
            source.tokens.at(-1)?.value ??
            tokens.at(-1)?.value ??
            defaults.value,
          ...(kind === "spacing"
            ? {
                namespace: namePrefix,
              }
            : {}),
          ...(selectedGroup !== undefined && selectedSource !== undefined
            ? {
                groups: selectedGroup,
                group: selectedSource.key,
                groupOf: (tokenName: string) =>
                  tokenHasGroupSuffix(tokenName, namePrefix)
                    ? namePrefix + tokenGroupName(tokenName, namePrefix)
                    : "",
              }
            : {}),
        },
        land: (tokenSource: AddedToken) => {
          if (tokenSource.kind !== kind) {
            return;
          }
          let nameSeed = (
            (tokenSource.group !== undefined
              ? callback(tokenSource.group).at(-1)
              : undefined) ??
            source.tokens.at(-1) ??
            tokens.at(-1)
          )?.name;
          if (
            editable.exec("add " + (value ?? kind), (candidateName) => {
              let tokenName = addScalarToken(
                candidateName,
                kind,
                tokenSource.name,
                tokenSource.value,
                nameSeed,
                value,
              );
              if (tokenName === candidateName || tokenSource.usage === "") {
                return tokenName;
              } else {
                return setTokenUsage(
                  tokenName,
                  kind,
                  tokenSource.name,
                  tokenSource.usage,
                );
              }
            })
          ) {
            flashToken(tokenSource.name);
          } else {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.couldNotAdd") + tokenSource.name + ".",
            );
          }
        },
      });
    },
    lastTypeSetRef = reactArtifactRoot.useRef<string | null>(null),
    showAddTypeStyle = (initialName?: string) => {
      if (editable === undefined) {
        return;
      }
      let value = view.typeGroups.map((group) => group.name),
        groupName =
          initialName ??
          (lastTypeSetRef.current !== null &&
          value.includes(lastTypeSetRef.current)
            ? lastTypeSetRef.current
            : (value.at(-1) ?? "")),
        selectedTypeGroup = view.typeGroups.find((group) => group.name === groupName),
        selectedStyle =
          selectedTypeGroup?.styles.at(-1) ?? view.typeGroups.at(-1)?.styles.at(-1),
        familyKey =
          selectedStyle?.familyKey ??
          selectedTypeGroup?.family ??
          Object.keys(view.families)[0] ??
          "",
        fontWeight =
          selectedStyle === undefined
            ? "400"
            : String(
                typeof selectedStyle.fontWeight === "number"
                  ? selectedStyle.fontWeight
                  : parseInt(String(selectedStyle.fontWeight), 10) || 400,
              );
      setTokenDialog({
        req: {
          kind: "type",
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, "type"),
          ),
          name: "",
          families: view.families,
          familyNames: view.familyNames,
          fontNames: [
            ...new Set(
              view.fonts
                .filter((font) => font.asset !== true)
                .map((font) => font.family),
            ),
          ],
          style: {
            family: familyKey,
            fontSize: selectedStyle?.fontSize ?? "16px",
            lineHeight: selectedStyle?.lineHeight ?? "1.5",
            fontWeight: fontWeight,
            fontStyle: selectedStyle?.fontStyle === "italic" ? "italic" : "normal",
            letterSpacing: selectedStyle?.letterSpacing ?? "0",
          },
          sets: value,
          set: groupName,
        },
        land: (source) => {
          if (source.kind !== "type") {
            return;
          }
          let groups = view.typeGroups
              .find((group) => group.name === source.set)
              ?.styles.at(-1)?.name,
            renameConfirmationResult = editable.exec(
              source.newSet ? "add type set" : "add type style",
              (group) => {
                let isNewGroup = source.newSet
                  ? addTypographyGroup(group, source.set)
                  : group;
                if (source.newSet && isNewGroup === group) {
                  return group;
                }
                let style = addTypographyStyle(
                  isNewGroup,
                  source.name,
                  groups,
                  source.set,
                );
                if (style === isNewGroup) {
                  return group;
                }
                style =
                  source.font !== undefined
                    ? setTypographyFontFamily(
                        style,
                        source.name,
                        source.font,
                      )
                    : setTypographyProperty(
                        style,
                        source.name,
                        "family",
                        source.style.family,
                      );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "fontSize",
                  source.style.fontSize,
                );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "lineHeight",
                  source.style.lineHeight,
                );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "fontWeight",
                  source.style.fontWeight,
                );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "fontStyle",
                  source.style.fontStyle,
                );
                style = setTypographyProperty(
                  style,
                  source.name,
                  "letterSpacing",
                  source.style.letterSpacing,
                );
                if (source.usage !== "") {
                  style = setTypographyStyleUsage(
                    style,
                    source.name,
                    source.usage,
                  );
                }
                return style;
              },
            );
          if (renameConfirmationResult) {
            lastTypeSetRef.current = source.set;
          }
          if (renameConfirmationResult && source.newSet) {
            revealAsset({
              kind: "type",
              key: source.set,
            });
          } else if (renameConfirmationResult) {
            flashToken(source.name);
          } else {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.couldNotAdd") + source.name + ".",
            );
          }
        },
      });
    },
    showAddShadow = () => {
      if (editable === undefined) {
        return;
      }
      let value = view.shadows.tokens.at(-1);
      setTokenDialog({
        req: {
          kind: "shadow",
          themes: valueThemes,
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, "shadow"),
          ),
          name: newTokenNameSeed(
            "shadow",
            "",
            view.shadows.tokens.map((token) => token.name),
          ),
          value:
            value?.value[defaultValueThemeId] ??
            "0 1px 2px rgba(0, 0, 0, 0.2)",
        },
        land: (source) => {
          if (source.kind !== "shadow") {
            return;
          }
          if (
            editable.exec("add shadow", (candidateName) => {
              let tokenName = addShadowToken(
                candidateName,
                source.name,
                source.values[defaultValueThemeId] ?? "",
              );
              if (tokenName === candidateName) {
                return candidateName;
              }
              for (let [themeId, themeValue] of Object.entries(source.values)) {
                if (themeId !== defaultValueThemeId) {
                  tokenName = setShadowTokenValue(
                    tokenName,
                    source.name,
                    themeId,
                    themeValue,
                  );
                }
              }
              if (source.usage !== "") {
                tokenName = setTokenUsage(
                  tokenName,
                  "shadow",
                  source.name,
                  source.usage,
                );
              }
              return tokenName;
            })
          ) {
            flashToken(source.name);
          } else {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.couldNotAdd") + source.name + ".",
            );
          }
        },
      });
    },
    announceDropLimit = (limit: number) =>
      showEditorNotification(
        String(limit) +
          " files left out — one drop takes up to " +
          String(MAX_DROPPED_FILES) +
          ". Drop the rest separately.",
      ),
    readDroppedFiles = (
      transfer: DataTransfer,
      onFiles: (files: File[]) => void,
    ) => {
      extractDroppedFiles(transfer).then(
        ({ files: files, leftOut: leftOut }) => {
          if (leftOut > 0) {
            announceDropLimit(leftOut);
          }
          if (files.length > 0) {
            onFiles(files);
          }
        },
      );
    },
    dropTarget = useFileDrop({
      disabled: addFiles === undefined,
      onFiles: (files, event) => {
        if (addFiles !== undefined) {
          readDroppedFiles(
            event.dataTransfer,
            uploadPanelActiveRef.current ? addWelcomeFiles : addFiles,
          );
        }
      },
    }),
    [exportBusy, setExportBusy] = reactArtifactRoot.useState(false),
    exportSystem = (format: "tokens" | "css" | "readme" | "zip") => {
      let value = system.getSnapshot();
      if (format === "tokens") {
        saveDownloadFile(
          "tokens.json",
          value.files[DESIGN_SYSTEM_PATHS.tokens] ??
            `{}
`,
          "application/json",
        ).then((result) =>
          showEditorNotification(
            artifactDownloadResultMessage("tokens.json", result),
          ),
        );
        return;
      }
      if (format === "css") {
        saveDownloadFile(
          "tokens.css",
          generateNamedTokensCss(value.tokens, value.title),
          "text/css",
        ).then((result) =>
          showEditorNotification(
            artifactDownloadResultMessage("tokens.css", result),
          ),
        );
        return;
      }
      if (format === "readme") {
        saveDownloadFile(
          "README.md",
          value.readme,
          "text/markdown",
        ).then((result) =>
          showEditorNotification(
            artifactDownloadResultMessage("README.md", result),
          ),
        );
        return;
      }
      setExportBusy(true);
      let archiveName = downloadZipBaseName(value.title) + ".zip";
      collectDownloadFiles(
        value.files,
        value.tokens,
        value.title,
        value.storage,
      )
        .then(
          async ({ entries: entries, skipped: skipped }): Promise<void> => {
            let saveResult = await saveDownloadFile(
              archiveName,
              createStoredZip(entries),
              "application/zip",
            );
            showEditorNotification(
              artifactDownloadResultMessage(
                archiveName,
                saveResult,
                " — " +
                  String(entries.length) +
                  " files" +
                  (skipped.length > 0
                    ? " (" +
                      String(skipped.length) +
                      " stored elsewhere are listed in manifest.json only)"
                    : ""),
              ),
            );
          },
        )
        .finally(() => setExportBusy(false));
    },
    typeEditWithActions =
      typeEdit === undefined
        ? undefined
        : {
            ...typeEdit,
            add: (sectionId?: string) => showAddTypeStyle(sectionId),
            addSet: () => showAddTypeStyle(NEW_TOKEN_GROUP_SENTINEL),
            uploadFont: uploadFonts,
          },
    [readmeTouched, setReadmeTouched] =
      reactArtifactRoot.useState(false),
    readmeTouchedRef = reactArtifactRoot.useRef(false),
    readmeSizeNoticeRef = reactArtifactRoot.useRef(false),
    readmeStarterWasShownRef = reactArtifactRoot.useRef(false),
    readmeEditorKeyRef = reactArtifactRoot.useRef(0),
    [readmeEditRetry, setReadmeEditRetry] =
      reactArtifactRoot.useState(0),
    markReadmeTouched = (touched: boolean) => {
      readmeTouchedRef.current = touched;
      setReadmeTouched(touched);
    },
    sectionIsEmptyOrStarter = (sectionId: string) =>
      starter.starter.has(sectionId) || emptySections.has(sectionId),
    starterSectionNote = (sectionId: string): string | undefined =>
      editable !== undefined && sectionIsEmptyOrStarter(sectionId)
        ? EMPTY_SECTION_HINTS[
            isExtraTokenSection(sectionId) ? "family" : sectionId
          ]
        : undefined,
    sectionHeaderActions = (sectionId: string): React.ReactNode => {
      if (editable === undefined) {
        return;
      }
      if (sectionId === "shadows") {
        return (
          <SectionAddButton
            label={uiMessage("design-system.designSystemApp.add")}
            what={"Add shadow"}
            onClick={() => showAddShadow()}
            data-testid={"ds-page-add-" + sectionId}
          />
        );
      }
      if (sectionId === "spacing" || sectionId === "corners") {
        let value: ScalarTokenKind =
          sectionId === "spacing" ? "spacing" : "radius";
        return (
          <SectionAddButton
            label={uiMessage("design-system.designSystemApp.add")}
            what={"Add " + TOKEN_DEFAULTS[value].label}
            onClick={() =>
              showAddScaleToken(
                tokenScaleGroups(
                  value,
                  value === "spacing" ? view.spacing : view.corners,
                )[0] ?? {
                  kind: value,
                  name: "",
                  tokens: [],
                },
              )
            }
            data-testid={"ds-page-add-" + sectionId}
          />
        );
      }
      if (sectionId === "assets") {
        if (addFiles === undefined) {
          return undefined;
        } else {
          return (
            <SectionAddButton
              label={uiMessage("design-system.designSystemApp.newSet")}
              onClick={showNewAssetGroup}
              data-testid={"ds-page-add-" + sectionId}
            />
          );
        }
      }
      if (isExtraTokenSection(sectionId)) {
        let value = view.extras.find(
            (group) =>
              extraTokenFamilySectionId(group.key) === sectionId,
          ),
          action =
            value === undefined
              ? undefined
              : extraTokenScaleGroups([value])[0],
          handler =
            value === undefined ? undefined : extraScaleEdit(value.key)?.add;
        if (action === undefined || handler === undefined) {
          return undefined;
        } else {
          return (
            <SectionAddButton
              label={uiMessage("design-system.designSystemApp.add")}
              what={"Add " + value!.title.toLowerCase() + " token"}
              onClick={() => handler(action)}
              data-testid={"ds-page-add-" + sectionId}
            />
          );
        }
      }
      return;
    },
    extraScaleHead = (scaleGroup: ScalarScaleGroup) => {
      let value = tokenScaleGroupId(scaleGroup),
        groupLabel = tokenScaleGroupLabel(scaleGroup);
      return {
        title: sectionTitle(value, groupLabel),
        defaultTitle: groupLabel,
        "data-testid": "ds-card-" + value,
      };
    },
    renderReadme = (): React.ReactElement => {
      let value =
          starter.hint &&
          !readmeTouched &&
          view.readme.trim() === "" &&
          editable !== undefined &&
          !readOnly,
        markdown = value
          ? README_STARTER_TEXT
          : removeTokenShortcutComments(view.readme);
      if (
        readmeStarterWasShownRef.current &&
        !value &&
        !readmeTouchedRef.current
      ) {
        readmeEditorKeyRef.current += 1;
      }
      readmeStarterWasShownRef.current = value;
      return (() => {
        const _Element = MarkdownEditor;
        const _elementProps = {
          markdown: markdown,
          readOnly: readOnly || editable === undefined,
          // MineDesign: user-facing copy calls the agent "the agent", not Claude.
          get placeholder() { return uiMessage("design-system.designSystemApp.writeTheBrandBookHereOrAskTheAgentTo"); },
          onMarkdown: (markdownContent: string) => {
            let current = readmeTouchedRef.current,
              flag = false,
              showSizeNotice = false;
            readmeTouchedRef.current = true;
            editable?.set("readme", (documentContent) => {
              if (
                value &&
                !current &&
                (
                  documentContent.files[DESIGN_SYSTEM_PATHS.readme] ?? ""
                ).trim() !== ""
              ) {
                flag = true;
                return documentContent;
              }
              showSizeNotice =
                markdownContent !==
                  (documentContent.files[DESIGN_SYSTEM_PATHS.readme] ?? "") &&
                markdownContent !== "" &&
                !fileFitsInlineBudgets(
                  documentContent,
                  DESIGN_SYSTEM_PATHS.readme,
                  markdownContent,
                );
              return setDesignSystemReadme(documentContent, markdownContent);
            });
            if (showSizeNotice && !readmeSizeNoticeRef.current) {
              showEditorNotification(
                README_SIZE_EXCEEDED_MESSAGE,
              );
            }
            readmeSizeNoticeRef.current = showSizeNotice;
            if (flag) {
              readmeTouchedRef.current = current;
              setReadmeEditRetry((retryCount) => retryCount + 1);
            } else {
              markReadmeTouched(true);
            }
          },
          onDone: () => editable?.seal(),
        };
        const _elementKey =
          "readme-" +
          String(readmeEditorKeyRef.current) +
          "-" +
          String(readmeEditRetry);
        return <_Element key={_elementKey} {..._elementProps} />;
      })();
    },
    renderSection = (sectionId: string): React.ReactNode => {
      if (isExtraTokenSection(sectionId)) {
        let value = view.extras.filter(
          (group) =>
            extraTokenFamilySectionId(group.key) === sectionId,
        );
        return (
          <TokenScaleSections
            groups={extraTokenScaleGroups(value)}
            editFor={(group: ScalarScaleGroup) =>
              extraScaleEdit(group.family?.key ?? "")
            }
            headFor={extraScaleHead}
          />
        );
      }
      switch (sectionId) {
        case "spacing":
          return (
            <TokenScaleSections
              groups={tokenScaleGroups("spacing", view.spacing)}
              editFor={() => spacingEdit}
            />
          );
        case "corners":
          return (
            <TokenScaleSections
              groups={tokenScaleGroups("radius", view.corners)}
              editFor={() => radiusEdit}
            />
          );
        case "readme":
          return (
            <jsxDesignSystemApp.Fragment>
              {[<SectionSheet>
                  {[snapshot.cover !== null ? (
                      <CoverPreview
                        cover={snapshot.cover}
                        head={createPreviewHead(
                          snapshot,
                          hostThemeMode,
                          hostThemeId,
                          false,
                        )}
                      />
                    ) : null, <ReadmeArticle>
                      {renderReadme()}
                    </ReadmeArticle>]}
                </SectionSheet>, showWelcome &&
                editable !== undefined &&
                addFiles !== undefined ? (
                  <WelcomeSheet
                    onGithub={askGithub}
                    onConnect={askConnectors}
                    onUpload={openUploadPanel}
                    busy={handoffBusy}
                    note={handoffNote}
                    panel={
                      uploadPanelOpen ? (
                        <BrandUploadPanel
                          files={intakeFiles}
                          onFiles={addWelcomeFiles}
                          onLeftOut={announceDropLimit}
                          intake={{
                            busy: intakeBusy,
                            kept: keptIntakeCount,
                            refused: intakeSummary.refused,
                            save:
                              intakeBusy ||
                              saveState.status === "ready" ||
                              saveState.status === "saved"
                                ? "clean"
                                : saveState.status === "error"
                                  ? "error"
                                  : saveState.status === "dirty" &&
                                      applicationDocument.saveMode() !== "auto"
                                    ? "hold"
                                    : saveState.status === "dirty" ||
                                        saveState.status === "saving" ||
                                        saveState.status === "cached"
                                      ? "saving"
                                      : "clean",
                          }}
                          handing={handoffBusy}
                          onRemove={removeWelcomeFile}
                          thumb={renderUploadThumbnail}
                          onCreate={() => createFromWelcomeFiles(intakeFiles)}
                          onBack={
                            intakeFiles.length === 0
                              ? backFromUpload
                              : undefined
                          }
                        />
                      ) : undefined
                    }
                  />
                ) : null, <DocumentSections
                  docs={view.docs}
                  edit={
                    editable === undefined
                      ? undefined
                      : {
                          setText: (path: string, text: string): void =>
                            void editable.set("doc:" + path, (documentContent) =>
                              setAdditionalDocument(
                                documentContent,
                                path,
                                text,
                              ),
                            ),
                          done: () => editable.seal(),
                        }
                  }
                  headFor={(document: ApplicationView["docs"][number]) => ({
                    title: document.title,
                    defaultTitle: document.title,
                    get placeholder() { return uiMessage("design-system.designSystemApp.eGVoiceAndTone"); },
                    "data-testid": "ds-card-guidance-" + document.path,
                    onRename:
                      editable === undefined
                        ? undefined
                        : (text: string) => {
                            let value = text.replace(/\s+/g, " ").trim();
                            if (value === "" || value === document.title) {
                              return;
                            }
                            if (
                              firstMarkdownTitle(
                                document.markdown,
                              ) !== null
                            ) {
                              editable.exec(
                                "rename " + document.path,
                                (line) =>
                                  setAdditionalDocument(
                                    line,
                                    document.path,
                                    replaceMarkdownTitle(
                                      document.markdown,
                                      value,
                                    ),
                                  ),
                              );
                              return;
                            }
                            let sanitizedName =
                                /\.[^.]+$/.exec(
                                  pathBasename(document.path),
                                )?.[0] ?? ".md",
                              uploadedName = sanitizeUploadFileName(
                                value,
                              ).replace(/\.(md|mdx)$/i, "");
                            if (uploadedName === "") {
                              return;
                            }
                            let targetPath =
                              (pathDirname(document.path) === ""
                                ? ""
                                : pathDirname(document.path) +
                                  "/") +
                              uploadedName +
                              sanitizedName;
                            if (targetPath === document.path) {
                              return;
                            }
                            if (Object.hasOwn(snapshot.files, targetPath)) {
                              showEditorNotification(
                                "There is already a " + targetPath,
                              );
                              return;
                            }
                            if (
                              !editable.exec(
                                "rename " + document.path,
                                (line) =>
                                  renameDesignSystemFile(
                                    line,
                                    document.path,
                                    targetPath,
                                  ),
                              )
                            ) {
                              showEditorNotification(
                                "Can’t rename it to " +
                                  targetPath +
                                  " — that name isn’t one a file here can take",
                              );
                              return;
                            }
                            return humanizeDocumentFilename(
                              targetPath,
                            );
                          },
                    onRemove:
                      editable === undefined
                        ? undefined
                        : () => {
                            if (
                              editable.exec(
                                "remove " + document.path,
                                (line) =>
                                  deleteDesignSystemFiles(
                                    line,
                                    [document.path],
                                  ),
                              )
                            ) {
                              announceUndoableChange(
                                "Deleted " + document.title,
                              );
                            }
                          },
                  })}
                />]}
            </jsxDesignSystemApp.Fragment>
          );
        case "colors":
          return (
            <ColorsSection
              themes={themes}
              groups={view.colorGroups}
              names={colorTokenNames}
              edit={colorEdit}
              askClaude={askClaude}
              busy={handoffBusy}
            />
          );
        case "type":
          return (
            <TypographySection
              groups={view.typeGroups}
              families={view.families}
              familyNames={view.familyNames}
              fonts={view.fonts}
              onRemoveFont={removeFont}
              edit={typeEditWithActions}
              headFor={(group: EditorTypeGroup) => ({
                title: group.name,
                defaultTitle: group.name,
                "data-testid": "ds-card-type-" + group.name,
                onRename:
                  editable === undefined
                    ? undefined
                    : (newName: string) => {
                        if (
                          newName !== "" &&
                          !editable.exec("rename " + group.name, (styleRenameConfirmation) =>
                            renameTypographyGroup(
                              styleRenameConfirmation,
                              group.name,
                              newName,
                            ),
                          )
                        ) {
                          showEditorNotification(
                            "There is already a set called " + newName,
                          );
                        }
                      },
                onRemove:
                  editable === undefined
                    ? undefined
                    : () =>
                        setConfirmation({
                          get title() { return uiMessage("design-system.designSystemApp.delete2", { value1: String(group.name), value2: String(group.styles.length > 0 ? (" and its " + String(group.styles.length) + group.styles.length === 1
                                  ? " style?"
                                  : " styles?") : ("?")) }); },
                          get confirmLabel() { return uiMessage("design-system.designSystemApp.delete"); },
                          body: "The set and every style in it leave tokens.json. Undo brings the set back.",
                          run: () => {
                            if (
                              !viewRef.current.typeGroups.some(
                                (style) => style.name === group.name,
                              )
                            ) {
                              showEditorNotification(
                                group.name +
                                  " changed meanwhile. Nothing was deleted.",
                              );
                            } else if (
                              editable.exec(
                                "remove " + group.name,
                                (style) =>
                                  deleteTypographyGroup(
                                    style,
                                    group.name,
                                  ),
                              )
                            ) {
                              announceUndoableChange(
                                "Deleted " + group.name,
                              );
                            }
                            requestAnimationFrame(() =>
                              focusTestId("ds-add-type-set"),
                            );
                          },
                        }),
              })}
            />
          );
        case "shadows":
          return (
            <ShadowsSection
              shadows={view.shadows}
              themes={valueThemes}
              grounds={themeGrounds}
              previewThemeId={hostThemeId}
              edit={
                shadowEdit === undefined
                  ? undefined
                  : {
                      ...shadowEdit,
                      add: showAddShadow,
                    }
              }
              head={sectionHead("shadow", "Shadows")}
            />
          );
        case "components": {
          let value = createPreviewHead(
            snapshot,
            stageMode,
            previewThemeId,
            true,
            previewGround,
          );
          return (
            <ComponentsSection
              components={view.components}
              mode={stageMode}
              renderPreview={(
                component: EditorComponent,
                previewOptions: {
                  height: number;
                },
                previewMode: import("../../contracts/preview").PreviewMode,
                propValues?: import("../../contracts/editor-runtime").ComponentPropValues,
              ) =>
                renderComponentPreview(
                  component,
                  previewOptions,
                  createPreviewHead(
                    snapshot,
                    previewMode,
                    previewThemeId,
                    true,
                    previewGround,
                  ),
                  propValues === undefined
                    ? undefined
                    : {
                        ...componentStage,
                        values: propValues,
                      },
                )
              }
              propsOf={componentProps}
              edit={componentEdit}
              head={sectionHead("components", "Components")}
              staticNote={value.staticReason}
              staticFiles={value.staticMissing}
            />
          );
        }
        case "assets":
          return (
            <AssetGroupsList
              groups={view.assetGroups}
              tiles={assetManager.tiles}
              reveal={assetSearchReveal}
              renderThumb={renderAssetThumbnail}
              onOpen={(asset: EditorAsset) => setOpenAssetPath(asset.path)}
              onUpload={
                addFiles === undefined
                  ? undefined
                  : (group: EditorAssetGroup) =>
                      void pickUploadFiles().then((files) =>
                        addFiles(files, group.name),
                      )
              }
              onDropFiles={
                addFiles === undefined
                  ? undefined
                  : (group: EditorAssetGroup, event: React.DragEvent) =>
                      readDroppedFiles(event.dataTransfer, (files) =>
                        addFiles(files, group.name),
                      )
              }
              onRename={
                editable === undefined
                  ? undefined
                  : (asset: EditorAsset, newPath: string) => {
                      let value =
                          /\.[A-Za-z0-9]{1,8}$/.exec(asset.name)?.[0] ?? "",
                        extension =
                          /\.(png|jpe?g|gif|webp|avif|svg|pdf|md|mdx|txt|json|woff2?|ttf|otf)$/i,
                        renamedPath =
                          value !== "" &&
                          !newPath.toLowerCase().endsWith(value.toLowerCase())
                            ? newPath.replace(extension, "") + value
                            : newPath,
                        callback = (
                          documentContent: import("../../contracts").DesignSystemContent,
                        ) =>
                          renameAssetFile(
                            documentContent,
                            asset.path,
                            renamedPath,
                          );
                      return performDesignSystemEdit(
                        editable,
                        callback,
                        () =>
                          editable.exec("rename " + asset.name, callback),
                        {
                          nameOf: () => asset.name,
                        },
                      );
                    }
              }
              headFor={(group: EditorAssetGroup) => {
                let value = "assets:" + group.name,
                  groupLabel = assetGroupDisplayName(group.name);
                return {
                  title: sectionTitle(value, groupLabel),
                  defaultTitle: groupLabel,
                  "data-testid": "ds-card-" + value,
                  ...assetManager.headFor(group),
                };
              }}
              footer={
                storageUsageText !== "" ? (
                  <span
                    className={"text-caption text-muted"}
                    data-testid={"ds-storage-used"}
                  >
                    {[storageUsageText, freeSpaceText !== "" ? (
                        <jsxDesignSystemApp.Fragment>
                          {[" ", <TextLink
                              onClick={askFreeStorage}
                              data-testid={"ds-free-space"}
                            >
                              {freeSpaceText}
                            </TextLink>]}
                        </jsxDesignSystemApp.Fragment>
                      ) : null, freeingStorage ? " Freeing…" : null]}
                  </span>
                ) : undefined
              }
            />
          );
      }
    },
    navigationRef = (
      reactArtifactRoot as typeof React
    ).useRef<HTMLElement | null>(null),
    focusRegions = useFocusRegions([
      {
        el: () => navigationRef.current,
        fallback: () =>
          navigationRef.current?.querySelector<HTMLElement>(
            '[aria-current="location"]',
          ) ?? null,
      },
      {
        el: () => sectionRefs.current[currentSectionRef.current] ?? null,
        home: true,
        landOnSelf: true,
      },
      notificationsFocusRegion(),
    ]),
    navigateAndHint = (sectionId: string) => {
      if (!isDesignSystemSection(sectionId)) {
        return;
      }
      jumpToSection(sectionId);
      let value = sections.find((section) => section.id === sectionId)?.label;
      if (
        value !== undefined &&
        navigationRef.current !== null &&
        navigationRef.current.contains(document.activeElement)
      ) {
        focusRegions.hint(value);
      }
    },
    searchIndex: SearchEntry[] = reactArtifactRoot.useMemo(
      () =>
        buildSectionSearchIndex(
          view,
          sections,
          snapshot.sectionTitles,
        ),
      [view, sections, snapshot.sectionTitles],
    ),
    filesBrowser = useDesignSystemFilesBrowser({
      doc: applicationDocument,
      snap: snapshot,
      sections: sections,
      jump: navigateAndHint,
      mayEdit: !readOnly,
    }),
    navigateOrOpenFiles = (sectionId: string) =>
      sectionId === FILES_SECTION_ID
        ? filesBrowser.show()
        : filesBrowser.leave(() => navigateAndHint(sectionId)),
    [assetSearchReveal, setAssetSearchReveal] =
      reactArtifactRoot.useState<string | null>(null),
    navigationSearch: NavigationSearch | undefined = emptySystem
      ? undefined
      : {
          index: searchIndex,
          tail: filesBrowser.searchEntries,
          onPick: (event: SearchEntry) => {
            if (
              event.section === FILES_SECTION_ID &&
              event.target !== undefined
            ) {
              return filesBrowser.show(event.target);
            }
            filesBrowser.close(false);
            if (
              event.target === undefined ||
              !isDesignSystemSection(event.section)
            ) {
              return;
            }
            sectionScroller.mark(event.section);
            assetManager.tiles.focus(null);
            setAssetSearchReveal(event.asset ?? null);
            textReveal.reveal({
              section: event.section,
              target: event.target,
              label: event.label,
            });
          },
        },
    showNavigation = !(emptySystem && editable === undefined),
    hasAutoSave = "loadState" in applicationDocument || applicationDocument.saveMode() === "auto",
    [saveState, setSaveState] =
      reactArtifactRoot.useState<ApplicationSaveState>(() =>
        applicationDocument.saveState(),
      );
  reactArtifactRoot.useEffect(() => {
    let value = applicationDocument.subscribeSave(setSaveState);
    setSaveState(applicationDocument.saveState());
    return value;
  }, [applicationDocument]);
  // MineDesign: 标注跳回一处（docs/design/canvas §10.6）：宿主的标注层（packages/design-system/src/editor/comment-targets.ts）
  // 派发 `minedesign:reveal-comment-target`，这里与搜索里选中一条走同一条路——索引里有这个目标就照它（素材另展开那一张），
  // 没有时按给的章节去等它出现
  let commentRevealRef = reactArtifactRoot.useRef({
    index: searchIndex,
    pick: navigationSearch?.onPick,
  });
  commentRevealRef.current = { index: searchIndex, pick: navigationSearch?.onPick };
  reactArtifactRoot.useEffect(() => {
    let callback = (event: Event): void => {
      let detail = (event as CustomEvent<unknown>).detail as {
          target?: unknown;
          section?: unknown;
          label?: unknown;
        } | null,
        { index, pick } = commentRevealRef.current;
      if (pick === undefined || typeof detail?.target !== "string") {
        return;
      }
      let target = detail.target,
        entry: SearchEntry | undefined =
          index.find((indexEntry) => indexEntry.target === target) ??
          (typeof detail.section === "string"
            ? {
                section: detail.section,
                label: typeof detail.label === "string" ? detail.label : target,
                words: [],
                target: target,
              }
            : undefined);
      if (entry !== undefined) {
        pick(entry);
      }
    };
    window.addEventListener("minedesign:reveal-comment-target", callback);
    return () =>
      window.removeEventListener("minedesign:reveal-comment-target", callback);
  }, []);
  let loaded = reactArtifactRoot.useSyncExternalStore(
      subscribeStoredSystemStatus,
      getStoredSystemStatus,
      getStoredSystemStatus,
    ).loaded,
    canEdit = editable !== undefined,
    liveUrls = supportsLivePreviewUrls(),
    previewsRunnable =
      previewStaticStatus(snapshot).staticReason === "";
  useBootWarnings(
    reactArtifactRoot.useMemo(
      () =>
        loaded && saveState.status !== "loading"
          ? {
              editingOff:
                saveState.message === get_MIGRATED_READONLY_MESSAGE(),
              editable: canEdit,
              content: liveUrls
                ? {
                    hasFiles: !emptySystem,
                    colorsEmpty: emptySections.has("colors"),
                    components: view.components,
                    previewsCantRun: !previewsRunnable,
                  }
                : null,
            }
          : null,
      [
        loaded,
        saveState,
        canEdit,
        liveUrls,
        emptySystem,
        emptySections,
        view.components,
        previewsRunnable,
      ],
    ),
  );
  let themeDisabledReason = previewThemeDisabledReason(
      themes.length,
      view.components,
      previewsRunnable,
    ),
    themeMenu = (
      <PreviewThemeMenu
        themes={themes}
        value={previewThemeId ?? ""}
        onChange={setSelectedThemeId}
        disabledWhy={themeDisabledReason}
      />
    ),
    toolbarIsShown = reactArtifactRoot.useSyncExternalStore(
      subscribeHostSaveChrome,
      hostDrawsReadOnly,
      () => false,
    ),
    showReadonlyChip =
      saveState.status === "readonly" &&
      saveState.message !== get_MIGRATED_READONLY_MESSAGE() &&
      !toolbarIsShown,
    saveControls = (
      <jsxDesignSystemApp.Fragment>
        {[hasAutoSave && editable !== undefined ? (
            <SaveStatusControl
              state={saveState}
              onRetry={() => {
                flushMarkdownCommitQueues();
                applicationDocument.save();
              }}
              tipSide={"top"}
            />
          ) : null, showReadonlyChip ? (
            <TooltipWrapper tip={(saveState.message) ?? (uiMessage("design-system.designSystemApp.readOnly"))}>
              <Badge
                icon={"Lock"}
                size={"sm"}
                role={"status"}
                data-testid={"ds-readonly-chip"}
              >
                {uiMessage("design-system.designSystemApp.readOnly")}
              </Badge>
            </TooltipWrapper>
          ) : null, !hasAutoSave &&
          editable !== undefined &&
          applicationDocument.saveMode() === "manual" ? (
            <TooltipWrapper
              tip={
                saveState.status === "error" ? ((saveState.message) ?? (uiMessage("design-system.designSystemApp.couldnTSaveTryAgain"))) : (saveState.status === "dirty" ? (uiMessage("design-system.designSystemApp.saveChanges")) : (uiMessage("design-system.designSystemApp.allChangesSaved")))
              }
            >
              <Button
                variant={
                  saveState.status === "dirty" || saveState.status === "error"
                    ? "primary"
                    : "secondary"
                }
                size={"sm"}
                disabled={
                  saveState.status !== "dirty" && saveState.status !== "error"
                }
                onClick={() => {
                  flushMarkdownCommitQueues();
                  applicationDocument.save();
                }}
                data-testid={"ds-save"}
              >
                {saveState.status === "saving" ? (uiMessage("design-system.designSystemApp.saving")) : (uiMessage("design-system.designSystemApp.save"))}
              </Button>
            </TooltipWrapper>
          ) : null]}
      </jsxDesignSystemApp.Fragment>
    ),
    showSaveControls =
      (hasAutoSave && editable !== undefined) ||
      showReadonlyChip ||
      (!hasAutoSave &&
        editable !== undefined &&
        applicationDocument.saveMode() === "manual"),
    navigationFooter = showSaveControls ? saveControls : undefined,
    pendingSections =
      editingOff &&
      handoffAvailable &&
      saveState.message === get_MIGRATED_READONLY_MESSAGE()
        ? {
            rows: PENDING_DESIGN_SYSTEM_SECTIONS,
            tip: get_MIGRATION_EMPTY_PAGE_TITLE(),
            panel: (section: SectionRow, onAsked: () => void) => (
              <ClaudeRequestButton
                label={section.label}
                ask={askClaude}
                busy={handoffBusy}
                onAsked={onAsked}
              />
            ),
          }
        : undefined,
    tokenDialogActions = {
      addColor: () => showAddColor(),
      addStyle: () => showAddTypeStyle(),
      addShadow: () => showAddShadow(),
      uploadFont: () => uploadFonts?.(),
      uploadAsset: () => uploadAssets?.(),
    },
    [assetGroupDialogOpen, setAssetGroupDialogOpen] =
      reactArtifactRoot.useState(false),
    showNewAssetGroup = () => {
      if (addFiles !== undefined) {
        setAssetGroupDialogOpen(true);
      }
    },
    assetGroupDialog =
      assetGroupDialogOpen && addFiles !== undefined ? (
        <NewAssetGroupDialog
          groups={view.assetGroups.map((group) => group.name)}
          onClose={() => setAssetGroupDialogOpen(false)}
          onLeftOut={announceDropLimit}
          onCreate={(targetPath: string, files: File[]) => {
            if (!addFiles(files, targetPath)) {
              return false;
            }
            setAssetGroupDialogOpen(false);
            revealAsset({
              kind: "assets",
              key: targetPath,
            });
            return true;
          }}
        />
      ) : null;
  return (
    <ArtifactShell
      doc={applicationDocument}
      undo={editor.undo}
      undoShortcuts={!filesBrowser.open}
      hideToolbar={true}
      toolbarQuietReadOnlyReason={get_MIGRATED_READONLY_MESSAGE()}
      leading={
        showNavigation && wideLayout ? (
          <SidebarSectionNavigation
            sections={sections}
            tail={filesBrowser.row && [filesBrowser.row]}
            current={
              filesBrowser.open ? FILES_SECTION_ID : currentSection
            }
            onJump={navigateOrOpenFiles}
            dropProps={dropTarget.targetProps}
            footer={navigationFooter}
            navRef={navigationRef}
            marks={flaggedSections}
            search={navigationSearch}
            pending={pendingSections}
          />
        ) : (
          <jsxDesignSystemApp.Fragment />
        )
      }
    >
      <CdsRoot density={"compact"} className={"contents"}>
        {[<div
            className={"relative h-full min-h-0"}
            data-testid={"ds-drop-target"}
            {...dropTarget.targetProps}
          >
            {[<div
                className={
                  "ds-main relative flex h-full min-h-0 flex-col gap-lg overflow-x-hidden overflow-y-auto scroll-smooth bg-bg-warm px-lg text-body text-primary motion-reduce:scroll-auto pointer-coarse:[--prop-row-h:40px] data-[covered]:invisible [&>:first-child]:mt-lg"
                }
                {...filesBrowser.covered}
                data-mode={hostMode}
                data-layout={wideLayout ? "sidebar" : "page"}
                data-file-drag={dropTarget.over ? "" : undefined}
                data-testid={"ds-main"}
                ref={attachScroller}
              >
                {[showNavigation && !wideLayout ? (
                    <FloatingSectionNavigation
                      pending={pendingSections}
                      navRef={navigationRef}
                      edgeRef={floatingNavigationRef}
                      port={sectionScroller.port}
                      sections={sections}
                      tail={filesBrowser.row && [filesBrowser.row]}
                      current={
                        filesBrowser.open
                          ? FILES_SECTION_ID
                          : currentSection
                      }
                      onJump={navigateOrOpenFiles}
                      status={showSaveControls ? saveControls : undefined}
                      marks={flaggedSections}
                      search={navigationSearch}
                    />
                  ) : null, saveState.status === "readonly" &&
                  saveState.message !== undefined &&
                  BOOT_LIVE_NOTICE_MESSAGES.has(saveState.message) ? (
                    <div {...UNCOMMENTABLE_PROPS}>
                      <Callout
                        variant={"neutral"}
                        role={"status"}
                        data-testid={"ds-move-status"}
                      >
                        {saveState.message}
                      </Callout>
                    </div>
                  ) : null, <SaveConflictBanners doc={applicationDocument} />, <MigrationCleanupBanner
                    ask={
                      editable === undefined &&
                      saveState.message !== get_MIGRATED_READONLY_MESSAGE()
                        ? undefined
                        : askClaude
                    }
                    busy={handoffBusy}
                  />, lastChange !== null &&
                  isCiLastChange(lastChange) &&
                  !readOnly
                    ? (() => {
                        const PipelineBannerElement = PipelineChangeBanner;
                        const pipelineBannerProps = {
                          change: lastChange,
                        };
                        const pipelineBannerKey = lastChange.at;
                        return (
                          <PipelineBannerElement key={pipelineBannerKey} {...pipelineBannerProps} />
                        );
                      })()
                    : null, <MigrationLeftOutBanner />, <IndexRecoveryBanner />, !showWelcome && handoffNote !== null ? (
                    <SectionUsageNote
                      note={handoffNote}
                      edgeRef={handoffNoticeRef}
                    />
                  ) : null, emptySystem && editable === undefined ? (
                    <EmptyDesignSystem />
                  ) : (
                    sections.map((section, sectionIndex) =>
                      (() => {
                        const SectionElement = "section";
                        const sectionProps = {
                          ref: (sectionElementRef: HTMLElement | null) => {
                            sectionRefs.current[section.id] = sectionElementRef;
                          },
                          tabIndex: -1,
                          className:
                            "ds-section flex flex-col gap-lg focus:outline-none",
                          "aria-label": section.label,
                          "data-current":
                            section.id === currentSection ? "" : undefined,
                          "data-testid": "ds-section-" + section.id,
                          children: (
                            <LazySection
                              root={sectionScroller.port}
                              eager={
                                sectionIndex < 2 ||
                                sectionScroller.wanted.has(section.id)
                              }
                              standIn={
                                <SectionSheet>
                                  <SectionHeader
                                    title={section.label}
                                  />
                                </SectionSheet>
                              }
                            >
                              {() =>
                                section.id === "colors" ? (
                                  <SectionSheet>
                                    {[<ColorsSectionHeader
                                        edit={colorEdit}
                                        note={starterSectionNote("colors")}
                                      />, sectionIsEmptyOrStarter("colors") ? (
                                        <EmptySectionHint
                                          kind={"colors"}
                                          readOnly={editable === undefined}
                                        />
                                      ) : (
                                        renderSection("colors")
                                      )]}
                                  </SectionSheet>
                                ) : section.id === "type" ? (
                                  <SectionSheet>
                                    {[<TypographySectionHeader
                                        edit={typeEditWithActions}
                                        note={starterSectionNote("type")}
                                      />, sectionIsEmptyOrStarter("type") ? (
                                        <EmptySectionHint
                                          kind={"type"}
                                          readOnly={editable === undefined}
                                        />
                                      ) : (
                                        renderSection("type")
                                      )]}
                                  </SectionSheet>
                                ) : section.id === "readme" ? (
                                  editable === undefined &&
                                  view.readme.trim() === "" &&
                                  view.docs.length === 0 ? (
                                    <SectionSheet>
                                      {[<SectionHeader
                                          title={section.label}
                                          pageId={section.id}
                                        />, <EmptyEditorList
                                          text={"Nothing here yet."}
                                        />]}
                                    </SectionSheet>
                                  ) : (
                                    renderSection("readme")
                                  )
                                ) : (
                                  <SectionSheet>
                                    {[<SectionHeader
                                        title={section.label}
                                        pageId={section.id}
                                        data-testid={
                                          "ds-page-head-" + section.id
                                        }
                                        actions={
                                          section.id === "components"
                                            ? themeMenu
                                            : sectionHeaderActions(section.id)
                                        }
                                        note={starterSectionNote(section.id)}
                                      />, sectionIsEmptyOrStarter(section.id) ? (
                                        <EmptySectionHint
                                          kind={
                                            isExtraTokenSection(section.id)
                                              ? "family"
                                              : section.id as import("../../contracts/token-editors").EmptySectionKind
                                          }
                                          readOnly={editable === undefined}
                                        />
                                      ) : isDesignSystemSection(section.id) ? (
                                        renderSection(section.id)
                                      ) : null]}
                                  </SectionSheet>
                                )
                              }
                            </LazySection>
                          ),
                        };
                        const sectionKey = section.id;
                        return (
                          <SectionElement key={sectionKey} {...sectionProps} />
                        );
                      })(),
                    )
                  ), intakeProgress !== null ? (
                    <IntakeProgressStatus
                      text={intakeProgress}
                      quiet={dropTarget.over}
                    />
                  ) : null, emptySystem ? null : (
                    <footer
                      className={"ds-page-footer px-xs"}
                      data-testid={"ds-page-footer"}
                      {...UNCOMMENTABLE_PROPS}
                    >
                      <PipelineChangeSummary change={lastChange} />
                    </footer>
                  ), openAsset !== null
                    ? (() => {
                        const AssetDialogElement = AssetDetailsDialog;
                        const assetDialogProps = {
                          asset: openAsset,
                          files: snapshot.files,
                          storage: snapshot.storage,
                          focusName: assetManager.renaming === openAsset.path,
                          onClose: () => {
                            setOpenAssetPath(null);
                            assetManager.clearRenaming();
                          },
                          onDownload: () => downloadAsset(openAsset),
                          onRemove:
                            editable === undefined
                              ? undefined
                              : () => {
                                  setOpenAssetPath(null);
                                  assetManager.clearRenaming();
                                  assetManager.remove([openAsset.path]);
                                },
                          onRename:
                            editable === undefined
                              ? undefined
                              : (assetPath: string) => {
                                  let value = openAsset,
                                    callback = (
                                      content: import("../../contracts").DesignSystemContent,
                                    ) =>
                                      renameAssetFile(
                                        content,
                                        value.path,
                                        assetPath,
                                      );
                                  return performDesignSystemEdit(
                                    editable,
                                    callback,
                                    () => {
                                      if (
                                        !editable.exec(
                                          "rename " + value.name,
                                          callback,
                                        )
                                      ) {
                                        return false;
                                      }
                                      setOpenAssetPath((openPath) =>
                                        openPath === value.path
                                          ? (pathDirname(
                                              value.path,
                                            ) === ""
                                              ? ""
                                              : pathDirname(
                                                  value.path,
                                                ) + "/") +
                                            sanitizeUploadFileName(
                                              assetPath,
                                            )
                                          : openPath,
                                      );
                                      return true;
                                    },
                                    {
                                      nameOf: () => value.name,
                                    },
                                  );
                                },
                        };
                        const assetDialogKey = openAsset.path;
                        return (
                          <AssetDialogElement key={assetDialogKey} {...assetDialogProps} />
                        );
                      })()
                    : null, assetManager.overlay, assetGroupDialog, tokenDialog !== null ? (
                    <AddTokenDialog
                      req={tokenDialog.req}
                      onClose={() => setTokenDialog(null)}
                      onSubmit={(token: AddedToken) => {
                        let land = tokenDialog.land;
                        setTokenDialog(null);
                        land(token);
                      }}
                    />
                  ) : null, confirmation !== null ? (
                    <ConfirmRemoveDialog
                      title={confirmation.title}
                      confirmLabel={confirmation.confirmLabel}
                      onCancel={() => setConfirmation(null)}
                      onConfirm={() => {
                        let run = confirmation.run;
                        setConfirmation(null);
                        run();
                      }}
                    >
                      {confirmation.body}
                    </ConfirmRemoveDialog>
                  ) : null]}
              </div>, filesBrowser.layer, <FileDropOverlay
                show={dropTarget.over}
                label={uiMessage("design-system.designSystemApp.dropToAddToThisDesignSystem")}
                hint={"Fonts, logos, images, reference files — folders too"}
              />]}
          </div>, <LiveAnnouncer />]}
      </CdsRoot>
    </ArtifactShell>
  );
}
function get_CLAUDE_COMMENT_SENT_MESSAGE() {
  return uiMessage("design-system.designSystemApp.sentToTheAgentIt");
}
export {
  artifactDownloadResultMessage,
  BACKGROUND_COLOR_TOKEN_PATTERNS,
  BUILTIN_DESIGN_SYSTEM_SECTION_IDS,
  get_CLAUDE_COMMENT_SENT_MESSAGE,
  CONTENT_DESIGN_SYSTEM_SECTIONS,
  CORE_DESIGN_SYSTEM_SECTIONS,
  DesignSystemApp,
  designSystemSections,
  initialDesignSystemSection,
  isDesignSystemSection,
  isExtraTokenSection,
  jsxDesignSystemApp,
  PENDING_DESIGN_SYSTEM_SECTIONS,
  previewThemeGroundColors,
  reactBootWarnings,
  README_SIZE_EXCEEDED_MESSAGE,
  REVEAL_SECTION_BY_KIND,
  SURFACE_COLOR_TOKEN_PATTERNS,
  useBootWarnings,
  useGoogleFontStylesheets,
};
export function installFilesUiDesignSystemApp(): () => void {
  return () => {
    reactBootWarnings = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxDesignSystemApp = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    CORE_DESIGN_SYSTEM_SECTIONS = [
      {
        id: "readme",
        get label() { return uiMessage("design-system.designSystemApp.overview"); },
      },
      {
        id: "colors",
        get label() { return uiMessage("design-system.designSystemApp.colors"); },
      },
      {
        id: "type",
        get label() { return uiMessage("design-system.designSystemApp.typography"); },
      },
      {
        id: "spacing",
        get label() { return uiMessage("design-system.designSystemApp.spacing"); },
      },
      {
        id: "corners",
        get label() { return uiMessage("design-system.designSystemApp.cornerRadius"); },
      },
      {
        id: "shadows",
        get label() { return uiMessage("design-system.designSystemApp.shadows"); },
      },
    ];
    CONTENT_DESIGN_SYSTEM_SECTIONS = [
      {
        id: "components",
        get label() { return uiMessage("design-system.designSystemApp.components"); },
      },
      {
        id: "assets",
        get label() { return uiMessage("design-system.designSystemApp.assets"); },
      },
    ];
    BUILTIN_DESIGN_SYSTEM_SECTION_IDS = [
      ...CORE_DESIGN_SYSTEM_SECTIONS,
      ...CONTENT_DESIGN_SYSTEM_SECTIONS,
    ].map((sectionId) => sectionId.id);
    isExtraTokenSection = (items) =>
      items.startsWith("family-") && items.length > 7;
    isDesignSystemSection = (sectionId) =>
      BUILTIN_DESIGN_SYSTEM_SECTION_IDS.includes(sectionId) ||
      isExtraTokenSection(sectionId);
    initialDesignSystemSection = () =>
      initialSectionFromHash(isDesignSystemSection, "readme");
    PENDING_DESIGN_SYSTEM_SECTIONS = [
      ...CORE_DESIGN_SYSTEM_SECTIONS,
      ...CONTENT_DESIGN_SYSTEM_SECTIONS,
    ].filter((section) => section.id !== "readme");
    designSystemSections = (extraGroups) => [
      ...CORE_DESIGN_SYSTEM_SECTIONS,
      ...extraGroups.map((extraGroup) => ({
        id: extraTokenFamilySectionId(extraGroup.key),
        label: extraGroup.title,
      })),
      ...CONTENT_DESIGN_SYSTEM_SECTIONS,
    ];
    REVEAL_SECTION_BY_KIND = {
      type: "type",
      assets: "assets",
      guidance: "readme",
    };
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    CLAUDE_COMMENT_SENT_MESSAGE =
      "Sent to the agent — it will reply in the comment thread";
    README_SIZE_EXCEEDED_MESSAGE =
      uiMessage("design-system.designSystemApp.thatIsMoreTextThan") +
      String(DESIGN_SYSTEM_INLINE_LIMITS.readme / 1024) +
      " KB), so it was not added. The text from before is unchanged.";
    BACKGROUND_COLOR_TOKEN_PATTERNS = [
      /^bg-?100$/,
      /^(background|bg|page|canvas|paper)$/,
      /^bg-?(base|page|default|primary)$/,
      /^(surface|bg)-?(1|base)$/,
    ];
    SURFACE_COLOR_TOKEN_PATTERNS = [
      /^bg-?0{1,3}$/,
      /^(surface|card|panel)$/,
      /^(surface|bg)-?(0|raised|card|elevated)$/,
      /^bg-?(card|raised|surface)$/,
    ];
  };
}
