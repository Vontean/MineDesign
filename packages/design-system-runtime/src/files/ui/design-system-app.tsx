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
function useBootWarnings(context: unknown) {
  let warnedRef = reactBootWarnings.useRef(false);
  reactBootWarnings.useEffect(() => {
    if (context === null || warnedRef.current) {
      return;
    }
    let value = migrationOpenedAnalyticsEvents(context);
    if (value.length === 0) {
      return;
    }
    warnedRef.current = true;
    for (let value2 of value) {
      reportMigrationAnalytics(value2);
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
      fonts.map((input) => input.family.toLowerCase()),
    ),
    urls = [
      ...new Set(
        Object.entries(familyNames).flatMap(([input, input2]) => {
          let value = knownWebFontFamily(input2);
          if (
            value === undefined ||
            localFamilies.has(input2.toLowerCase())
          ) {
            return [];
          }
          let value2 = googleFontStylesheetUrl(value),
            values = new Set(
              (/wght@([\d;]+)/.exec(value2)?.[1] ?? "400")
                .split(";")
                .map(Number),
            ),
            value3 = [
              ...new Set(
                typeTokens.groups.flatMap((input3) =>
                  input3.styles
                    .filter(
                      (input4) =>
                        (input4.family !== ""
                          ? input4.family
                          : input3.family) === input,
                    )
                    .map((input4) => parseInt(String(input4.fontWeight), 10)),
                ),
              ),
            ]
              .filter(
                (input3) =>
                  input3 >= 100 && input3 <= 900 && !values.has(input3),
              )
              .sort((input3, options) => input3 - options);
          return [
            value2,
            ...value3.map(
              (input3) =>
                "https://fonts.googleapis.com/css2?family=" +
                value.replace(/ +/g, "+") +
                ":wght@" +
                String(input3) +
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
      ].map((input) => [input.href, input]),
    );
    for (let [value, value2] of entries) {
      if (!urls.includes(value)) {
        value2.remove();
      }
    }
    for (let value of urls) {
      if (entries.has(value)) {
        continue;
      }
      let value2 = [
        ...document.head.querySelectorAll<HTMLLinkElement>(
          'link[rel="stylesheet"]',
        ),
      ].find((input) => input.href === value);
      if (value2 !== undefined) {
        value2.dataset.dsGoogleFont = "1";
        continue;
      }
      let value3 = document.createElement("link");
      value3.rel = "stylesheet";
      value3.dataset.dsGoogleFont = "1";
      value3.href = value;
      document.head.appendChild(value3);
    }
  }, [fingerprint]);
}
function previewThemeGroundColors(
  tokens: NormalizedTokens,
  themes: ColorTheme[],
) {
  let findColor = (input: RegExp[], options: string) => {
      for (let value of input) {
        let value2 = tokens.color.tokens.find((input2) =>
            value.test(input2.name),
          ),
          value3 =
            value2 !== undefined
              ? resolveColorTokenValue(value2, options, tokens)
              : undefined;
        if (value3 !== undefined && isColorLiteral(value3)) {
          return value3;
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
    let value2 = isDarkThemeName(value.name);
    grounds[value.id] = {
      well:
        findColor(BACKGROUND_COLOR_TOKEN_PATTERNS, value.id) ??
        (value2 ? "#1f1e1d" : "#f0eee6"),
      card:
        findColor(SURFACE_COLOR_TOKEN_PATTERNS, value.id) ??
        (value2 ? "#30302e" : "#ffffff"),
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
  let runtime2: FileEditHistory = reactArtifactRoot.useMemo(
      () => createFileMutationBatch(),
      [],
    ),
    documentOptions: FileEditHistory = reactArtifactRoot.useMemo(
      () => createAnnouncedHistory(runtime2),
      [runtime2],
    ),
    system: ApplicationStore = reactArtifactRoot.useMemo(
      () => new DesignSystemStore(),
      [],
    ),
    document2: ApplicationDocument = system.doc,
    editor: ApplicationCommands = reactArtifactRoot.useMemo(
      () =>
        createDesignSystemCommands(
          document2,
          documentOptions,
          runtime2,
        ),
      [document2, documentOptions, runtime2],
    ),
    flaggedSections: ReadonlySet<string> = useConflictedSections(
      document2,
    ),
    [, forceRender] = reactArtifactRoot.useState(0),
    restoreCountRef = reactArtifactRoot.useRef(0);
  reactArtifactRoot.useEffect(
    () =>
      document2.subscribe(() => {
        forceRender((input) => input + 1);
        if (document2.restoreCount() !== restoreCountRef.current) {
          restoreCountRef.current = document2.restoreCount();
          editor.undo.clear();
        }
      }),
    [document2, editor],
  );
  reactArtifactRoot.useEffect(
    () => system.subscribe(() => forceRender((input) => input + 1)),
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
        .map((input) =>
          input === null ? undefined : input.getBoundingClientRect(),
        )
        .filter((input) => input !== undefined && input.height > 0)
        .map((input) => input!.bottom);
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
            .filter((input) => input.store === "blob")
            .map((input) => ({
              src: input.src,
              type: mimeTypeForPath(input.path),
              bytes: input.bytes,
            })),
        [allFonts],
      ),
    );
  useInlineFontFaces(allFonts, blobFontAvailability);
  usePublishedPreviewGeneration(document2);
  useFileAvailability(
    reactArtifactRoot.useMemo(
      () =>
        preferLivePreviewUrls &&
        supportsLivePreviewUrls()
          ? []
          : snapshot.fonts
              .filter(
                (input) =>
                  input.referenced &&
                  !input.missing &&
                  input.store === "inline",
              )
              .map((input) => ({
                path: input.path,
                typePrefix: "font/",
                bytes: input.bytes,
              })),
      [snapshot.fonts],
    ),
  );
  usePreviewStaticNotice();
  let readOnly = document2.readOnly();
  reactArtifactRoot.useEffect(() => {
    let value = system.bootReport.warnings.filter((input) =>
      input.includes(": carried as "),
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
        refreshLibraryState((input) => input + 1),
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
    resolveAssetsCapability().then((input) =>
      input === null ? undefined : refreshAssetsCatalog(input),
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
        onTierOff: (input) =>
          showEditorNotification(
            inlineStorageFallbackMessage(input),
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
        input: string,
        options: string,
        context: string,
        value2: import("../../contracts").AssetUploadRecord,
      ) => {
        let value3 = system.content();
        system.update(
          (input2) =>
            replaceInlineFileWithPointer(
              input2,
              input,
              options,
              context,
              value2,
            ),
          {
            auto: true,
          },
        );
        return system.content() !== value3;
      },
      callback2 = () => {
        value = null;
      };
    system.beforeSave = () =>
      document.visibilityState === "hidden"
        ? Promise.resolve()
        : (value ??= existingFontUploadFiles(
            system.content().files,
            intakeOptions,
            callback,
          ).then(callback2, callback2));
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
              (input) => input.id === "readme",
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
      () => sections.map((input) => input.id),
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
      (input: HTMLElement | null) => {
        scrollerRef.current = input;
        sectionScroller.attach(input);
      },
      [sectionScroller.attach],
    ),
    currentSection = sections.some(
      (input) => input.id === sectionScroller.current,
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
          sectionLabel: (input) =>
            sectionsRef.current.find((input2) => input2.id === input)?.label,
          show: (input) => {
            if (isDesignSystemSection(input)) {
              jumpToSectionRef.current(input);
            }
          },
          mark: (input) => {
            if (isDesignSystemSection(input)) {
              markSectionRef.current(input);
            }
          },
          sectionEl: (input) => sectionRefs.current[input],
          say: announceLiveMessage,
        }),
      [],
    ),
    textReveal = useEditorSectionNavigation({
      sections: sectionRefs,
      port: sectionScroller.port,
      ...revealController,
    }),
    jumpToSection = (input: string) => {
      textReveal.release();
      if (sections.some((input2) => input2.id === input)) {
        sectionScroller.jump(input);
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
    announceUndoableChange = (input: string) => {
      if (!undoAvailable) {
        return announceLiveMessage(input);
      }
      let callback = () => {
          return;
        },
        value = showEditorPromiseNotification(
          input,
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
    focusTestId = (input: string) => {
      let value =
        scrollerRef.current?.querySelector<HTMLElement>(
          '[data-testid="' + input + '"]',
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
    removeToken = (input: AddTokenKind) => (input2: string) => {
      if (
        editable?.exec(uiMessage("design-system.designSystemApp.remove") + input2, (input3) =>
          deleteToken(input3, input, input2),
        ) === true
      ) {
        announceUndoableChange(uiMessage("design-system.designSystemApp.removed") + input2);
      }
    },
    renameToken2 =
      (input: AddTokenKind) => (input2: string, options: string) =>
        editable?.exec(uiMessage("design-system.designSystemApp.rename") + input2, (input3) =>
          renameToken(input3, input, input2, options),
        ) ?? false,
    sectionTitle = (input: string, options: string) =>
      snapshot.sectionTitles[input] ?? options,
    sectionHead = (input: string, options: string) => ({
      title: sectionTitle(input, options),
      defaultTitle: options,
      "data-testid": "ds-card-" + input,
    }),
    colorEdit = reactArtifactRoot.useMemo<
      ColorEditActions | undefined
    >(
      () =>
        editable === undefined
          ? undefined
          : {
              usage: (input, options) =>
                void editable.set("usage:color:" + input, (input2) =>
                  setColorTokenUsage(input2, input, options),
                ),
              value: (input, options, context) =>
                void editable.set(
                  "color:" + input + ":" + options,
                  (input2) =>
                    setColorTokenValue(
                      input2,
                      input,
                      options,
                      context,
                    ),
                ),
              clear: (input, options) =>
                void editable.exec(
                  uiMessage("design-system.designSystemApp.clear") + input + " " + options,
                  (input2) =>
                    clearColorThemeOverride(
                      input2,
                      input,
                      options,
                    ),
                ),
              done: () => editable.seal(),
              remove: removeToken("color"),
              rename: renameToken2("color"),
              addTo: (input) => showAddColor(input.name),
              addGroup: (input) => showAddColor("", input === true),
              removeGroup: (input) => {
                let value =
                    input.name === ""
                      ? PALETTE_GROUP_NAME
                      : input.name,
                  length = input.tokens.length;
                setConfirmation({
                  get title() { return uiMessage("design-system.designSystemApp.deleteAndIts", { value1: String(value), value2: String(String(length)), value3: String(length === 1 ? " color?" : " colors?") }); },
                  get confirmLabel() { return uiMessage("design-system.designSystemApp.delete"); },
                  body:
                    (length === 1
                      ? uiMessage("design-system.designSystemApp.itIs")
                      : uiMessage("design-system.designSystemApp.all") + String(length) + " are") +
                    " removed from tokens.json; colors in other groups that alias them keep their resolved values. Undo brings the group back.",
                  run: () => {
                    let value2 = (
                      viewRef.current.colorGroups.find(
                        (input2) => input2.name === input.name,
                      )?.tokens ?? []
                    ).map((input2) => input2.name);
                    if (
                      value2.length > 0 &&
                      editable.exec(uiMessage("design-system.designSystemApp.removeGroup") + value, (input2) =>
                        deleteColorTokens(input2, value2),
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
              renameGroup: (input, options) => {
                let value = tokenGroupRenamePairs(
                  input.tokens.map((input2) => input2.name),
                  commonTokenNamePrefix(
                    tokenNamesForFamily(
                      snapshot.tokens,
                      "color",
                    ),
                  ),
                  input.name,
                  options,
                );
                if (value.length === 0) {
                  return false;
                }
                return editable.exec(
                  uiMessage("design-system.designSystemApp.renameGroup") +
                    (input.name === "" ? "palette" : input.name),
                  (input2) =>
                    renameColorTokensAtomically(input2, value),
                );
              },
            },
      [editable, snapshot],
    ),
    scaleEdit = (
      input: ScalarTokenKind,
      options?: string,
    ): ScalarEditActions | undefined =>
      editable === undefined
        ? undefined
        : {
            value: (input2, options2) =>
              void editable.set(input + ":" + input2, (input3) =>
                setScalarTokenValue(
                  input3,
                  input,
                  input2,
                  options2,
                ),
              ),
            done: () => editable.seal(),
            usage: (input2, options2) =>
              void editable.set("usage:" + input + ":" + input2, (input3) =>
                setTokenUsage(input3, input, input2, options2),
              ),
            note: (input2) =>
              void editable.exec(
                uiMessage("design-system.designSystemApp.edit") + (options ?? input) + " note",
                (input3) =>
                  setTokenFamilyNote(
                    input3,
                    input,
                    input2,
                    options,
                  ),
              ),
            remove: removeToken(input),
            rename: renameToken2(input),
          },
    spacingEdit = reactArtifactRoot.useMemo<
      ScalarEditActions | undefined
    >(() => scaleEdit("spacing"), [editable, snapshot]),
    radiusEdit = reactArtifactRoot.useMemo<
      ScalarEditActions | undefined
    >(() => scaleEdit("radius"), [editable, snapshot]),
    extraScaleEdit = (input: string) => {
      let value = scaleEdit("extra", input);
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
              value: (input, options, context) =>
                void editable.exec(
                  uiMessage("design-system.designSystemApp.edit") + input + " " + options,
                  (input2) =>
                    setShadowTokenValue(
                      input2,
                      input,
                      options,
                      context,
                    ),
                ),
              live: (input, options, context) =>
                void editable.set(
                  "shadow:" + input + ":" + options,
                  (input2) =>
                    setShadowTokenValue(
                      input2,
                      input,
                      options,
                      context,
                    ),
                ),
              done: () => editable.seal(),
              usage: (input, options) =>
                void editable.set("usage:shadow:" + input, (input2) =>
                  setTokenUsage(
                    input2,
                    "shadow",
                    input,
                    options,
                  ),
                ),
              remove: removeToken("shadow"),
              rename: renameToken2("shadow"),
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
              setField: (input, options, context) =>
                void editable.set(
                  "style:" + input + ":" + options,
                  (input2) =>
                    setTypographyProperty(
                      input2,
                      input,
                      options,
                      context,
                    ),
                ),
              setFont: (input, options) => {
                let value = validateNewFontFamily(
                  options,
                  snapshot.tokens.type.families,
                );
                if (value !== null) {
                  showEditorNotification(value);
                  return;
                }
                editable.exec(uiMessage("design-system.designSystemApp.font") + input, (input2) =>
                  setTypographyFontFamily(
                    input2,
                    input,
                    options,
                  ),
                );
              },
              done: () => editable.seal(),
              setUsage: (input, options) =>
                void editable.set("usage:style:" + input, (input2) =>
                  setTypographyStyleUsage(
                    input2,
                    input,
                    options,
                  ),
                ),
              remove: removeToken("type"),
              rename: renameToken2("type"),
              dropMissingFonts: () => {
                if (
                  editable.exec(uiMessage("design-system.designSystemApp.dropMissingFontReferences"), (input) =>
                    removeMissingFontReferences(input),
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
              setGuidelines: (input, options) =>
                void editable.set("guide:" + input, (input2) =>
                  setComponentGuidelines(input2, input, options),
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
        value = snapshot.bundle.dts.map((input) => input.text);
      return (input: EditorComponent) => {
        let entry = entries.get(input.name);
        if (entry !== undefined) {
          return entry;
        }
        let value2 = inferComponentPropControls(input.name, [
          input.types,
          ...value,
        ]);
        entries.set(input.name, value2);
        return value2;
      };
    }, [snapshot.bundle.dts]),
    componentStage = reactArtifactRoot.useMemo(
      () => ({
        namespace: snapshot.bundle.namespace ?? "",
        globals: snapshot.bundle.declared.flatMap((input) =>
          input.global !== undefined ? [input.global] : [],
        ),
      }),
      [snapshot.bundle.namespace, snapshot.bundle.declared],
    ),
    lastChange = snapshot.lastChange,
    removeFont =
      editable === undefined
        ? undefined
        : (input: Pick<EditorFont, "path">) => {
            if (
              editable.exec(uiMessage("design-system.designSystemApp.removeFont") + input.path, (input2) =>
                deleteFontFace(input2, input.path),
              )
            ) {
              announceUndoableChange(
                uiMessage("design-system.designSystemApp.removed") + input.path.replace(/^(?:fonts|assets)\//, ""),
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
              .flatMap((input) => input.assets)
              .find((input) => input.path === openAssetPath) ?? null),
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
      "loadState" in document2 && document2.saveState().status !== "ready",
    afterContentSaved = (input: () => void) => {
      let callback = () =>
        documentStillLoading()
          ? showEditorNotification(
              RECLAIM_RECONNECTING_MESSAGE,
            )
          : input();
      if (!document2.dirty()) {
        return callback();
      }
      if (document2.saveMode() !== "auto") {
        return showEditorNotification(
          RECLAIM_SAVE_FIRST_MESSAGE,
        );
      }
      if (system.holdAutosave) {
        return showEditorNotification(
          uiMessage("design-system.designSystemApp.addingYourFilesFirstTry"),
        );
      }
      document2.save().then(() => {
        if (!document2.dirty()) {
          return callback();
        }
        let value = document2.saveState();
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
          .then((input) => {
            if (document2.dirty() || documentStillLoading()) {
              showEditorNotification(
                !document2.dirty()
                  ? RECLAIM_RECONNECTING_MESSAGE
                  : document2.saveMode() === "auto"
                    ? RECLAIM_SAVING_MESSAGE
                    : RECLAIM_SAVE_FIRST_MESSAGE,
              );
              return;
            }
            let value2 = assessAssetReclamation(
              system.getSnapshot().files,
            );
            if (value2 === null || value2.windowed) {
              showEditorNotification(
                value2 === null
                  ? RECLAIM_LIST_FAILED_MESSAGE
                  : RECLAIM_WINDOWED_COLLECTION_MESSAGE,
              );
              return;
            }
            let values = new Set(
                value2.reclaimable.map((input2) => input2.id),
              ),
              value3 = excludePublishedAssets(
                value.reclaimable.filter((input2) => values.has(input2.id)),
                input,
              );
            if (value3.length === 0) {
              showEditorNotification(
                RECLAIM_NOTHING_UNUSED_MESSAGE,
              );
              return;
            }
            freeingBlobIdsRef.current = new Set(
              value3.map((input2) => input2.id),
            );
            return deleteStoredAssets(value3).then((input2) => {
              if (input2.freed.size > 0) {
                editor.undo.clear();
              }
              showEditorNotification(
                reclaimAssetsResultMessage(input2),
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
    downloadAsset = (input: EditorAsset) => {
      readDownloadFileBytes(
        snapshot.files,
        input.path,
        snapshot.storage,
      ).then((input2) => {
        if (input2 === null) {
          artifactHealth.report(...DOWNLOAD_INTERNAL_FAILURE);
          showEditorNotification(
            uiMessage("design-system.designSystemApp.couldNotRead") + input.name + " here",
          );
          return;
        }
        saveDownloadFile(
          input.name,
          input2,
          input.mime !== "" ? input.mime : "application/octet-stream",
        ).then((input3) => {
          artifactHealth.report(
            ...downloadHealthOutcome(input3.shell)!,
          );
          if (
            input3.outcome === "withheld" ||
            input3.outcome === "refused" ||
            input3.outcome === "failed"
          ) {
            showEditorNotification(
              artifactDownloadResultMessage(input.name, input3),
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
      input: string,
      options: string,
      context: () => void,
    ) => {
      let value = showEditorPromiseNotification(
        input,
        <Button
          size={"sm"}
          onClick={() => {
            closeToast(value);
            context();
          }}
        >
          {options}
        </Button>,
      );
    },
    copyHandoffPrompt = (input: string) =>
      void copyTextToClipboard(input).then((input2) =>
        input2
          ? showEditorNotification("Copied")
          : noticeWithAction(uiMessage("design-system.designSystemApp.copyFailed"), uiMessage("design-system.designSystemApp.copyIt"), () =>
              copyHandoffPrompt(input),
            ),
      ),
    askClaude = (
      input: ClaudeRequest,
      options?: Element | null,
      context?: () => void,
    ) => {
      setHandoffNotice(null);
      setHandoffBusy(true);
      let value = handoffHost.current(),
        value2 = document2.dirty(),
        value3 = chooseClaudeDeliveryRoad(input, value, value2);
      reportMigrationCleanupPressed(input, value3);
      deliverClaudeRequest(input, options, value, value2)
        .then((source) => {
          reportMigrationCleanupResult(
            input,
            value3,
            source.kind,
          );
          if (source.kind !== "staged") {
            refreshHandoffHost();
          }
          if (source.kind === "staged" && input.deliver === "send") {
            return;
          }
          if (source.kind === "unanswered" && context !== undefined) {
            noticeWithAction(
              claudeSendResultMessage("unanswered"),
              // MineDesign: user-facing copy calls the agent "the agent", not Claude.
              uiMessage("design-system.designSystemApp.askTheAgent"),
              context,
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
            prompt: input.prompt,
          });
        })
        .finally(() => setHandoffBusy(false));
    },
    askGithub =
      editable === undefined
        ? undefined
        : (input: Element) =>
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
              input,
            ),
    connectorOptionLabel = WELCOME_OPTIONS.connect[0],
    uploadOptionLabel = WELCOME_OPTIONS.upload[0],
    askConnectors =
      editable === undefined
        ? undefined
        : (input: Element) =>
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
              input,
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
  let addWelcomeFiles = (input: File[]) => {
      let callback = (input2: File, options: File) =>
          input2.name === options.name &&
          input2.size === options.size &&
          uploadedFileRelativePath(input2) ===
            uploadedFileRelativePath(options),
        value = input.filter(
          (input2, options) =>
            !intakeFilesRef.current.some((input3) =>
              callback(input3, input2),
            ) &&
            input.findIndex((input3) => callback(input3, input2)) === options,
        );
      if (
        value.length === 0 ||
        addFiles === undefined ||
        !addFiles(value, undefined, true)
      ) {
        return;
      }
      intakeFilesRef.current = [...intakeFilesRef.current, ...value];
      setIntakeFiles((input2) => [...input2, ...value]);
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
    let callback = (input: string) =>
        input.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) ||
        input.startsWith(DESIGN_SYSTEM_PATHS.assetsDir),
      values = new Set(intakeFilePaths.values()),
      value = Object.keys(snapshot.files).filter(
        (input) =>
          !Object.hasOwn(current, input) &&
          !values.has(input) &&
          callback(input),
      ),
      value2 = Object.keys(current).filter(
        (input) => !Object.hasOwn(snapshot.files, input) && callback(input),
      ),
      value3 = [...intakeFilePaths].filter(
        ([, input]) => !Object.hasOwn(snapshot.files, input),
      );
    if (value3.length === 0) {
      return;
    }
    let entries = new Map(intakeFilePaths),
      items = [],
      callback2 = (input: string) => input.slice(input.lastIndexOf("/") + 1),
      callback3 = (input: string) => input.slice(0, input.indexOf("/"));
    for (let [value4, value5] of value3) {
      let value6 = value.filter(
          (input) =>
            callback2(input) === callback2(value5) &&
            callback3(input) === callback3(value5),
        ),
        value7 = value2.filter(
          (input) =>
            callback2(input) === callback2(value5) &&
            callback3(input) === callback3(value5),
        );
      if (value6.length === 1 && value7.length === 1) {
        entries.set(value4, value6[0]);
        value.splice(value.indexOf(value6[0]), 1);
      } else {
        entries.delete(value4);
        items.push(value4);
      }
    }
    setIntakeFilePaths(entries);
    if (items.length > 0) {
      setIntakeFiles((input) =>
        input.filter((input2) => !items.includes(input2)),
      );
    }
  }, [snapshot.files, intakeFilePaths]);
  let recordIntakeOutcome = (
      input: AssetUploadSummary,
      options: Map<File, string>,
    ) => {
      let value = countSuccessfulUploads(input);
      setIntakeSummary((input2) => ({
        refused: [
          ...input2.refused,
          ...input.refused.map((input3) => input3.name),
        ],
        landTo:
          value === 0
            ? input2.landTo
            : input2.landTo === "assets" ||
                Object.keys(input.assets).length > 0
              ? "assets"
              : "type",
      }));
      if (options.size > 0) {
        setIntakeFilePaths((input2) => new Map([...input2, ...options]));
      }
    },
    removeWelcomeFile = (input: number) => {
      let value = intakeFiles[input];
      if (value === undefined || editable === undefined) {
        return;
      }
      let entry = intakeFilePaths.get(value),
        name = uploadedAssetFile(value).name,
        value2 = intakeFiles.length === 1,
        callback = () => {
          setIntakeFiles((input2) =>
            input2.filter((input3) => input3 !== value),
          );
          if (value2) {
            clearWelcomeFiles();
            closeUploadPanel();
          }
        };
      if (entry !== undefined) {
        let callback2 = (
          input2: import("../../contracts").DesignSystemContent,
        ) =>
          entry.startsWith(DESIGN_SYSTEM_PATHS.fontsDir)
            ? deleteFontFace(input2, entry)
            : deleteAssetFile(input2, entry);
        performDesignSystemEdit(
          editable,
          callback2,
          (input2) => {
            if (!editable.exec(uiMessage("design-system.designSystemApp.remove") + entry, callback2, input2)) {
              return false;
            }
            setIntakeFilePaths((input3) => {
              let entries = new Map(input3);
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
        setIntakeSummary((input2) => {
          let items = [...input2.refused];
          items.splice(items.indexOf(name), 1);
          return {
            ...input2,
            refused: items,
          };
        });
      }
      callback();
    },
    renderAssetThumbnail = (input: import("../../contracts/editor-runtime").AssetThumbnail): React.ReactElement => (
      <AssetDetailsPreview
        asset={input}
        files={snapshot.files}
        storage={snapshot.storage}
        size={"tile"}
      />
    ),
    renderUploadThumbnail = (input: File): React.ReactElement => {
      let entry = intakeFilePaths.get(input),
        value = (entry === undefined
          ? undefined
          : view.assetGroups
              .flatMap((input2) => input2.assets)
              .find((input2) => input2.path === entry)) ?? {
          path: entry ?? "",
          group: "",
          name: input.name,
          mime: mimeTypeForPath(input.name),
          ext: fileExtension(input.name),
          kind:
            entry !== undefined &&
            entry.startsWith(DESIGN_SYSTEM_PATHS.fontsDir)
              ? "font"
              : assetKindForPath(input.name),
          bytes: input.size,
        };
      return (
        <AssetTileThumbnail
          a={value}
          renderThumb={renderAssetThumbnail}
        />
      );
    },
    createFromWelcomeFiles = (input: File[]) => {
      let value = input
          .filter(
            (input2) =>
              !isIgnoredUploadFile(input2) &&
              !intakeSummary.refused.includes(
                uploadedAssetFile(input2).name,
              ),
          )
          .map((input2) => ({
            name: input2.name,
            bytes: input2.size,
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
      if (document2.dirty() && !system.holdAutosave) {
        editor.seal();
        document2.save().then(() => {
          let value2 = document2.saveState();
          if (value2.status === "error") {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.theFilesAreInBut") +
                (value2.message ?? "") +
                (document2.saveMode() === "auto"
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
    sendFileHandoff = (input: ClaudeRequest, options: () => void) => {
      deliverClaudeRequest(
        input,
        null,
        handoffHost.current(),
        document2.dirty(),
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
            options,
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
            () => copyHandoffPrompt(input.prompt),
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
      input: AssetUploadSummary,
      options: boolean,
      context = false,
    ) => {
      if (
        context &&
        uploadPanelVisibleRef.current &&
        options &&
        input.refused.length === 0 &&
        input.warnings.length === 0
      ) {
        return;
      }
      let value = uploadResultSummary(input, options, context);
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
        : (items: File[], options?: string, context = false) => {
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
              group: options ?? null,
              fromStart: context,
            });
            if (intakeRunningRef.current) {
              return true;
            }
            intakeRunningRef.current = true;
            setIntakeBusy(true);
            let current = currentSectionRef.current;
            system.holdAutosave = true;
            let value = document2.dirty(),
              values = new Set(Object.keys(document2.content().files)),
              callback = (input: string) =>
                !values.has(input) &&
                (input.startsWith(DESIGN_SYSTEM_PATHS.fontsDir) ||
                  input.startsWith(DESIGN_SYSTEM_PATHS.assetsDir)),
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
                (await new Promise<boolean>((input) =>
                  setTimeout(
                    () => input(intakeQueueRef.current.length > 0),
                    INTAKE_QUEUE_WAIT_MS,
                  ),
                ))
              ) {
                if (intakeQueueRef.current.length === 0) {
                  continue;
                }
                let value2 = intakeQueueRef.current.shift();
                if (value2 === undefined) {
                  continue;
                }
                let group = value2.group,
                  entries = new Map<File, string>(),
                  callback2 = (
                    input: File,
                    options2: () => import("../../contracts/application").UploadCommitResult,
                  ) => {
                    if (!value2.fromStart) {
                      return options2();
                    }
                    let values2 = new Set(
                        Object.keys(document2.content().files),
                      ),
                      value4 = options2(),
                      value5 =
                        value4 === true
                          ? Object.keys(document2.content().files).find(
                              (input2) =>
                                !values2.has(input2) && callback(input2),
                            )
                          : undefined;
                    if (value5 !== undefined) {
                      entries.set(input, value5);
                    }
                    return value4;
                  },
                  neverSaves = document2.neverSaves,
                  value3 = await uploadAssetFiles(
                    value2.files,
                    {
                      ...intakeOptions,
                      onProgress: (input) => {
                        let value4 = intakeQueueRef.current.reduce(
                          (input2, options2) =>
                            input2 + options2.files.length,
                          0,
                        );
                        setIntakeProgress(
                          input === null
                            ? null
                            : input +
                                (value4 > 0
                                  ? " · " + String(value4) + " more queued"
                                  : ""),
                        );
                      },
                      font: (input, options2) =>
                        callback2(options2, () =>
                          commitUploadedAssetChange(
                            (input2) =>
                              editable.exec(
                                "add font " + input.fileName,
                                input2,
                              ),
                            (input2) =>
                              addFontFace(input2, input),
                            neverSaves,
                          ),
                        ),
                      asset: (input, options2) =>
                        callback2(options2, () =>
                          commitUploadedAssetChange(
                            (input2) =>
                              editable.exec("add " + input.fileName, input2),
                            (input2) =>
                              addAssetFile(input2, input),
                            neverSaves,
                          ),
                        ),
                    },
                    group ?? undefined,
                  );
                if (value2.fromStart) {
                  flag = true;
                  recordIntakeOutcome(value3, entries);
                }
                state = mergeAssetUploadResults(state, value3);
              }
              return state;
            })()
              .then(async (input): Promise<void> => {
                setIntakeProgress(null);
                if (countSuccessfulUploads(input) === 0) {
                  announceIntakeOutcome(input, false, flag);
                  return;
                }
                system.setNote(
                  flag
                    ? uploadedFilesBuildSummary(input)
                    : addedFilesSummary(input),
                  Object.fromEntries(
                    Object.entries(document2.content().files).filter(
                      ([input2]) => callback(input2),
                    ),
                  ),
                );
                let activeElement = document.activeElement,
                  value2 =
                    activeElement instanceof HTMLElement &&
                    (activeElement.isContentEditable ||
                      /^(INPUT|TEXTAREA|SELECT)$/.test(
                        activeElement.tagName,
                      ));
                if (
                  currentSectionRef.current === current &&
                  tokenDialogRef.current === null &&
                  !uploadPanelVisibleRef.current &&
                  !value2
                ) {
                  jumpToSection(
                    Object.keys(input.assets).length === 0 && input.fonts > 0
                      ? "type"
                      : "assets",
                  );
                }
                let value3 = value && document2.saveMode() !== "auto";
                announceIntakeOutcome(input, !value3, flag);
                if (value3) {
                  return;
                }
                editor.seal();
                system.holdAutosave = false;
                setIntakeProgress("Saving…");
                intakeSavingRef.current = true;
                await document2.save();
                intakeSavingRef.current = false;
                setIntakeProgress(null);
                let value4 = document2.saveState();
                if (value4.status === "error") {
                  showEditorNotification(
                    uiMessage("design-system.designSystemApp.theFilesAreInBut") +
                      value4.message +
                      (document2.saveMode() === "auto"
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
    flashToken = (input: string, options = true, context?: string) =>
      setFlashTarget({
        name: input,
        scroll: options,
        group: context,
      });
  reactArtifactRoot.useEffect(() => {
    if (flashTarget === null) {
      return;
    }
    let current = scrollerRef.current,
      value = ["color", "style", "spacing", "corners", "family", "shadow"]
        .map(
          (input) =>
            '[data-testid="ds-' + input + "-" + flashTarget.name + '"]',
        )
        .join(", "),
      value2 =
        current?.querySelector(value) ??
        (flashTarget.group !== undefined
          ? current?.querySelector(
              '[data-testid="ds-color-group-' + flashTarget.group + '"]',
            )
          : null);
    if (!(value2 instanceof HTMLElement)) {
      return;
    }
    if (flashTarget.scroll && typeof value2.scrollIntoView === "function") {
      value2.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    value2.classList.add("ds-flash");
    let value3 = window.setTimeout(() => {
      value2.classList.remove("ds-flash");
      setFlashTarget(null);
    }, 1200);
    return () => {
      window.clearTimeout(value3);
      value2.classList.remove("ds-flash");
    };
  }, [flashTarget]);
  let nextNumericTokenName = (
      input: string,
      options: string[],
      context: string,
    ) => {
      if (input === "") {
        return context;
      }
      let value = options
        .map((input2) => /-(\d{1,4})$/.exec(input2)?.[1])
        .filter((input2) => input2 !== undefined);
      if (value.length === 0) {
        return input + "-2";
      }
      let value2 = [
          ...new Set(value.map((input2) => parseInt(input2, 10))),
        ].sort((input2, options2) => input2 - options2),
        value3 =
          value2.length > 1
            ? Math.min(
                ...value2
                  .slice(1)
                  .map((input2, options2) => input2 - value2[options2]),
              )
            : 100;
      return (
        input +
        "-" +
        String(value2.at(-1)! + value3).padStart(
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
    addColorToken2 = (source: AddedToken, options?: string) => {
      if (editable === undefined || source.kind !== "color") {
        return;
      }
      let value = source.values[defaultValueThemeId] ?? "#888888";
      if (
        editable.exec(
          source.newGroup ? uiMessage("design-system.designSystemApp.addColorGroup") : uiMessage("design-system.designSystemApp.addColor"),
          (input) => {
            let value2 = addColorToken(
              input,
              source.name,
              value,
              options,
            );
            if (value2 === input) {
              return input;
            }
            for (let [value3, value4] of Object.entries(source.values)) {
              if (value3 !== defaultValueThemeId) {
                value2 = setColorTokenValue(
                  value2,
                  source.name,
                  value3,
                  value4,
                );
              }
            }
            if (source.usage !== "") {
              value2 = setColorTokenUsage(
                value2,
                source.name,
                source.usage,
              );
            }
            return value2;
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
    showAddColor = (input = "", options = false) => {
      if (editable === undefined) {
        return;
      }
      let value = tokenNamesForFamily(snapshot.tokens, "color"),
        value2 = commonTokenNamePrefix(value),
        value3 = view.colorGroups.map((input2) => ({
          key: input2.name,
          label:
            input2.name === "" ? PALETTE_GROUP_NAME : input2.name,
          seed:
            input2.name === ""
              ? value2
              : input2.numeric === true
                ? unusedTokenName(
                    snapshot.tokens,
                    "color",
                    nextNumericTokenName(
                      value2 + input2.name,
                      input2.tokens.map((input3) => input3.name),
                      "color",
                    ),
                  )
                : value2 + input2.name + "-",
        }));
      if (!value3.some((input2) => input2.key === "")) {
        value3.unshift({
          key: "",
          label: PALETTE_GROUP_NAME,
          seed: value2,
        });
      }
      let value4 = options
          ? {
              key: NEW_TOKEN_GROUP_SENTINEL,
              label: "",
              seed: value2,
            }
          : (value3.find((input2) => input2.key === input) ?? value3[0]),
        callback = (input2: string) =>
          view.colorGroups
            .find((input3) => input3.name === input2)
            ?.tokens.at(-1)?.name;
      setTokenDialog({
        req: {
          kind: "color",
          themes: valueThemes,
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, "color"),
          ),
          names: new Set(value),
          name: value4.seed,
          value: "#888888",
          groups: value3,
          group: value4.key,
          namespace: value2,
          seedFor: (input2) => value2 + input2 + "-",
          groupOf: (input2) =>
            tokenHasGroupSuffix(input2, value2)
              ? tokenGroupName(input2, value2)
              : "",
        },
        land: (source) => {
          if (source.kind === "color") {
            addColorToken2(source, callback(source.group));
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
    commonNumericNameStem = (input: string[]): string => {
      let values = new Set(
          input.map((input2) => /^(.*)-\d{1,4}$/.exec(input2)?.[1] ?? null),
        ),
        [items] = [...values];
      if (values.size === 1 && items !== null && items !== undefined) {
        return items;
      } else {
        return "";
      }
    },
    newTokenNameSeed = (
      input: AddTokenKind,
      options: string,
      items: string[],
      value = "",
    ) => {
      let value2 = options !== "" ? options : commonNumericNameStem(items);
      if (value2 === "") {
        return value;
      }
      if (
        items.length > 0 &&
        items.every((input2) => /-\d{1,4}$/.test(input2))
      ) {
        return unusedTokenName(
          snapshot.tokens,
          input,
          nextNumericTokenName(value2, items, value2),
        );
      } else {
        return value2 + "-";
      }
    },
    showAddScaleToken = (source: ScalarScaleGroup) => {
      if (editable === undefined) {
        return;
      }
      let kind = source.kind,
        value = source.family?.key,
        value2 = TOKEN_DEFAULTS[kind],
        value3 =
          (kind === "spacing"
            ? view.spacing
            : kind === "radius"
              ? view.corners
              : view.extras.find((input) => input.key === value)?.scale
          )?.tokens ?? [],
        value4 = commonTokenNamePrefix(
          value3.map((input) => input.name),
        ),
        value5 =
          kind === "spacing"
            ? groupedTokenScale(kind, value3)
            : null,
        value6 =
          value5 === null
            ? undefined
            : value5.map((input) => ({
                key: input.name === "" ? "" : value4 + input.name,
                get label() { return input.name === "" ? (uiMessage("design-system.designSystemApp.spacing")) : (input.name); },
                seed: newTokenNameSeed(
                  kind,
                  input.name === "" ? "" : value4 + input.name,
                  input.tokens.map((input2) => input2.name),
                  value4,
                ),
              })),
        value7 =
          value6?.find((input) => input.key === source.name) ?? value6?.[0],
        callback = (input: string) =>
          input === ""
            ? value3.filter(
                (input2) =>
                  !tokenHasGroupSuffix(input2.name, value4),
              )
            : value3.filter((input2) => input2.name.startsWith(input + "-"));
      setTokenDialog({
        req: {
          kind: kind,
          get label() { return value !== undefined ? ((value) + (" token")) : (value2.label); },
          taken: new Set(
            conflictingTokenNames(snapshot.tokens, kind),
          ),
          name:
            value7 !== undefined
              ? value7.seed
              : newTokenNameSeed(
                  kind,
                  source.name,
                  source.tokens.map((input) => input.name),
                  value4,
                ),
          value:
            source.tokens.at(-1)?.value ??
            value3.at(-1)?.value ??
            value2.value,
          ...(kind === "spacing"
            ? {
                namespace: value4,
              }
            : {}),
          ...(value6 !== undefined && value7 !== undefined
            ? {
                groups: value6,
                group: value7.key,
                groupOf: (input: string) =>
                  tokenHasGroupSuffix(input, value4)
                    ? value4 + tokenGroupName(input, value4)
                    : "",
              }
            : {}),
        },
        land: (source2: AddedToken) => {
          if (source2.kind !== kind) {
            return;
          }
          let value8 = (
            (source2.group !== undefined
              ? callback(source2.group).at(-1)
              : undefined) ??
            source.tokens.at(-1) ??
            value3.at(-1)
          )?.name;
          if (
            editable.exec("add " + (value ?? kind), (input) => {
              let value9 = addScalarToken(
                input,
                kind,
                source2.name,
                source2.value,
                value8,
                value,
              );
              if (value9 === input || source2.usage === "") {
                return value9;
              } else {
                return setTokenUsage(
                  value9,
                  kind,
                  source2.name,
                  source2.usage,
                );
              }
            })
          ) {
            flashToken(source2.name);
          } else {
            showEditorNotification(
              uiMessage("design-system.designSystemApp.couldNotAdd") + source2.name + ".",
            );
          }
        },
      });
    },
    lastTypeSetRef = reactArtifactRoot.useRef<string | null>(null),
    showAddTypeStyle = (input?: string) => {
      if (editable === undefined) {
        return;
      }
      let value = view.typeGroups.map((input2) => input2.name),
        value2 =
          input ??
          (lastTypeSetRef.current !== null &&
          value.includes(lastTypeSetRef.current)
            ? lastTypeSetRef.current
            : (value.at(-1) ?? "")),
        value3 = view.typeGroups.find((input2) => input2.name === value2),
        value4 =
          value3?.styles.at(-1) ?? view.typeGroups.at(-1)?.styles.at(-1),
        value5 =
          value4?.familyKey ??
          value3?.family ??
          Object.keys(view.families)[0] ??
          "",
        value6 =
          value4 === undefined
            ? "400"
            : String(
                typeof value4.fontWeight === "number"
                  ? value4.fontWeight
                  : parseInt(String(value4.fontWeight), 10) || 400,
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
                .filter((input2) => input2.asset !== true)
                .map((input2) => input2.family),
            ),
          ],
          style: {
            family: value5,
            fontSize: value4?.fontSize ?? "16px",
            lineHeight: value4?.lineHeight ?? "1.5",
            fontWeight: value6,
            fontStyle: value4?.fontStyle === "italic" ? "italic" : "normal",
            letterSpacing: value4?.letterSpacing ?? "0",
          },
          sets: value,
          set: value2,
        },
        land: (source) => {
          if (source.kind !== "type") {
            return;
          }
          let value7 = view.typeGroups
              .find((input2) => input2.name === source.set)
              ?.styles.at(-1)?.name,
            value8 = editable.exec(
              source.newSet ? "add type set" : "add type style",
              (input2) => {
                let value9 = source.newSet
                  ? addTypographyGroup(input2, source.set)
                  : input2;
                if (source.newSet && value9 === input2) {
                  return input2;
                }
                let value10 = addTypographyStyle(
                  value9,
                  source.name,
                  value7,
                  source.set,
                );
                if (value10 === value9) {
                  return input2;
                }
                value10 =
                  source.font !== undefined
                    ? setTypographyFontFamily(
                        value10,
                        source.name,
                        source.font,
                      )
                    : setTypographyProperty(
                        value10,
                        source.name,
                        "family",
                        source.style.family,
                      );
                value10 = setTypographyProperty(
                  value10,
                  source.name,
                  "fontSize",
                  source.style.fontSize,
                );
                value10 = setTypographyProperty(
                  value10,
                  source.name,
                  "lineHeight",
                  source.style.lineHeight,
                );
                value10 = setTypographyProperty(
                  value10,
                  source.name,
                  "fontWeight",
                  source.style.fontWeight,
                );
                value10 = setTypographyProperty(
                  value10,
                  source.name,
                  "fontStyle",
                  source.style.fontStyle,
                );
                value10 = setTypographyProperty(
                  value10,
                  source.name,
                  "letterSpacing",
                  source.style.letterSpacing,
                );
                if (source.usage !== "") {
                  value10 = setTypographyStyleUsage(
                    value10,
                    source.name,
                    source.usage,
                  );
                }
                return value10;
              },
            );
          if (value8) {
            lastTypeSetRef.current = source.set;
          }
          if (value8 && source.newSet) {
            revealAsset({
              kind: "type",
              key: source.set,
            });
          } else if (value8) {
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
            view.shadows.tokens.map((input) => input.name),
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
            editable.exec("add shadow", (input) => {
              let value2 = addShadowToken(
                input,
                source.name,
                source.values[defaultValueThemeId] ?? "",
              );
              if (value2 === input) {
                return input;
              }
              for (let [value3, value4] of Object.entries(source.values)) {
                if (value3 !== defaultValueThemeId) {
                  value2 = setShadowTokenValue(
                    value2,
                    source.name,
                    value3,
                    value4,
                  );
                }
              }
              if (source.usage !== "") {
                value2 = setTokenUsage(
                  value2,
                  "shadow",
                  source.name,
                  source.usage,
                );
              }
              return value2;
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
    announceDropLimit = (input: number) =>
      showEditorNotification(
        String(input) +
          " files left out — one drop takes up to " +
          String(MAX_DROPPED_FILES) +
          ". Drop the rest separately.",
      ),
    readDroppedFiles = (
      input: DataTransfer,
      options: (files: File[]) => void,
    ) => {
      extractDroppedFiles(input).then(
        ({ files: files, leftOut: leftOut }) => {
          if (leftOut > 0) {
            announceDropLimit(leftOut);
          }
          if (files.length > 0) {
            options(files);
          }
        },
      );
    },
    dropTarget = useFileDrop({
      disabled: addFiles === undefined,
      onFiles: (input, options) => {
        if (addFiles !== undefined) {
          readDroppedFiles(
            options.dataTransfer,
            uploadPanelActiveRef.current ? addWelcomeFiles : addFiles,
          );
        }
      },
    }),
    [exportBusy, setExportBusy] = reactArtifactRoot.useState(false),
    exportSystem = (input: "tokens" | "css" | "readme" | "zip") => {
      let value = system.getSnapshot();
      if (input === "tokens") {
        saveDownloadFile(
          "tokens.json",
          value.files[DESIGN_SYSTEM_PATHS.tokens] ??
            `{}
`,
          "application/json",
        ).then((input2) =>
          showEditorNotification(
            artifactDownloadResultMessage("tokens.json", input2),
          ),
        );
        return;
      }
      if (input === "css") {
        saveDownloadFile(
          "tokens.css",
          generateNamedTokensCss(value.tokens, value.title),
          "text/css",
        ).then((input2) =>
          showEditorNotification(
            artifactDownloadResultMessage("tokens.css", input2),
          ),
        );
        return;
      }
      if (input === "readme") {
        saveDownloadFile(
          "README.md",
          value.readme,
          "text/markdown",
        ).then((input2) =>
          showEditorNotification(
            artifactDownloadResultMessage("README.md", input2),
          ),
        );
        return;
      }
      setExportBusy(true);
      let value2 = downloadZipBaseName(value.title) + ".zip";
      collectDownloadFiles(
        value.files,
        value.tokens,
        value.title,
        value.storage,
      )
        .then(
          async ({ entries: entries, skipped: skipped }): Promise<void> => {
            let value3 = await saveDownloadFile(
              value2,
              createStoredZip(entries),
              "application/zip",
            );
            showEditorNotification(
              artifactDownloadResultMessage(
                value2,
                value3,
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
            add: (input?: string) => showAddTypeStyle(input),
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
    markReadmeTouched = (input: boolean) => {
      readmeTouchedRef.current = input;
      setReadmeTouched(input);
    },
    sectionIsEmptyOrStarter = (input: string) =>
      starter.starter.has(input) || emptySections.has(input),
    starterSectionNote = (input: string): string | undefined =>
      editable !== undefined && sectionIsEmptyOrStarter(input)
        ? EMPTY_SECTION_HINTS[
            isExtraTokenSection(input) ? "family" : input
          ]
        : undefined,
    sectionHeaderActions = (input: string): React.ReactNode => {
      if (editable === undefined) {
        return;
      }
      if (input === "shadows") {
        return (
          <SectionAddButton
            label={uiMessage("design-system.designSystemApp.add")}
            what={"Add shadow"}
            onClick={() => showAddShadow()}
            data-testid={"ds-page-add-" + input}
          />
        );
      }
      if (input === "spacing" || input === "corners") {
        let value: ScalarTokenKind =
          input === "spacing" ? "spacing" : "radius";
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
            data-testid={"ds-page-add-" + input}
          />
        );
      }
      if (input === "assets") {
        if (addFiles === undefined) {
          return undefined;
        } else {
          return (
            <SectionAddButton
              label={uiMessage("design-system.designSystemApp.newSet")}
              onClick={showNewAssetGroup}
              data-testid={"ds-page-add-" + input}
            />
          );
        }
      }
      if (isExtraTokenSection(input)) {
        let value = view.extras.find(
            (input2) =>
              extraTokenFamilySectionId(input2.key) === input,
          ),
          value2 =
            value === undefined
              ? undefined
              : extraTokenScaleGroups([value])[0],
          value3 =
            value === undefined ? undefined : extraScaleEdit(value.key)?.add;
        if (value2 === undefined || value3 === undefined) {
          return undefined;
        } else {
          return (
            <SectionAddButton
              label={uiMessage("design-system.designSystemApp.add")}
              what={"Add " + value!.title.toLowerCase() + " token"}
              onClick={() => value3(value2)}
              data-testid={"ds-page-add-" + input}
            />
          );
        }
      }
      return;
    },
    extraScaleHead = (input: ScalarScaleGroup) => {
      let value = tokenScaleGroupId(input),
        value2 = tokenScaleGroupLabel(input);
      return {
        title: sectionTitle(value, value2),
        defaultTitle: value2,
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
        value2 = value
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
          markdown: value2,
          readOnly: readOnly || editable === undefined,
          // MineDesign: user-facing copy calls the agent "the agent", not Claude.
          get placeholder() { return uiMessage("design-system.designSystemApp.writeTheBrandBookHereOrAskTheAgentTo"); },
          onMarkdown: (input: string) => {
            let current = readmeTouchedRef.current,
              flag = false,
              flag2 = false;
            readmeTouchedRef.current = true;
            editable?.set("readme", (input2) => {
              if (
                value &&
                !current &&
                (
                  input2.files[DESIGN_SYSTEM_PATHS.readme] ?? ""
                ).trim() !== ""
              ) {
                flag = true;
                return input2;
              }
              flag2 =
                input !==
                  (input2.files[DESIGN_SYSTEM_PATHS.readme] ?? "") &&
                input !== "" &&
                !fileFitsInlineBudgets(
                  input2,
                  DESIGN_SYSTEM_PATHS.readme,
                  input,
                );
              return setDesignSystemReadme(input2, input);
            });
            if (flag2 && !readmeSizeNoticeRef.current) {
              showEditorNotification(
                README_SIZE_EXCEEDED_MESSAGE,
              );
            }
            readmeSizeNoticeRef.current = flag2;
            if (flag) {
              readmeTouchedRef.current = current;
              setReadmeEditRetry((input2) => input2 + 1);
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
    renderSection = (input: string): React.ReactNode => {
      if (isExtraTokenSection(input)) {
        let value = view.extras.filter(
          (input2) =>
            extraTokenFamilySectionId(input2.key) === input,
        );
        return (
          <TokenScaleSections
            groups={extraTokenScaleGroups(value)}
            editFor={(input2: ScalarScaleGroup) =>
              extraScaleEdit(input2.family?.key ?? "")
            }
            headFor={extraScaleHead}
          />
        );
      }
      switch (input) {
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
                                      document2.saveMode() !== "auto"
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
                          setText: (input2: string, options: string): void =>
                            void editable.set("doc:" + input2, (input3) =>
                              setAdditionalDocument(
                                input3,
                                input2,
                                options,
                              ),
                            ),
                          done: () => editable.seal(),
                        }
                  }
                  headFor={(input2: ApplicationView["docs"][number]) => ({
                    title: input2.title,
                    defaultTitle: input2.title,
                    get placeholder() { return uiMessage("design-system.designSystemApp.eGVoiceAndTone"); },
                    "data-testid": "ds-card-guidance-" + input2.path,
                    onRename:
                      editable === undefined
                        ? undefined
                        : (input3: string) => {
                            let value = input3.replace(/\s+/g, " ").trim();
                            if (value === "" || value === input2.title) {
                              return;
                            }
                            if (
                              firstMarkdownTitle(
                                input2.markdown,
                              ) !== null
                            ) {
                              editable.exec(
                                "rename " + input2.path,
                                (input4) =>
                                  setAdditionalDocument(
                                    input4,
                                    input2.path,
                                    replaceMarkdownTitle(
                                      input2.markdown,
                                      value,
                                    ),
                                  ),
                              );
                              return;
                            }
                            let value2 =
                                /\.[^.]+$/.exec(
                                  pathBasename(input2.path),
                                )?.[0] ?? ".md",
                              value3 = sanitizeUploadFileName(
                                value,
                              ).replace(/\.(md|mdx)$/i, "");
                            if (value3 === "") {
                              return;
                            }
                            let value4 =
                              (pathDirname(input2.path) === ""
                                ? ""
                                : pathDirname(input2.path) +
                                  "/") +
                              value3 +
                              value2;
                            if (value4 === input2.path) {
                              return;
                            }
                            if (Object.hasOwn(snapshot.files, value4)) {
                              showEditorNotification(
                                "There is already a " + value4,
                              );
                              return;
                            }
                            if (
                              !editable.exec(
                                "rename " + input2.path,
                                (input4) =>
                                  renameDesignSystemFile(
                                    input4,
                                    input2.path,
                                    value4,
                                  ),
                              )
                            ) {
                              showEditorNotification(
                                "Can’t rename it to " +
                                  value4 +
                                  " — that name isn’t one a file here can take",
                              );
                              return;
                            }
                            return humanizeDocumentFilename(
                              value4,
                            );
                          },
                    onRemove:
                      editable === undefined
                        ? undefined
                        : () => {
                            if (
                              editable.exec(
                                "remove " + input2.path,
                                (input3) =>
                                  deleteDesignSystemFiles(
                                    input3,
                                    [input2.path],
                                  ),
                              )
                            ) {
                              announceUndoableChange(
                                "Deleted " + input2.title,
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
              headFor={(input2: EditorTypeGroup) => ({
                title: input2.name,
                defaultTitle: input2.name,
                "data-testid": "ds-card-type-" + input2.name,
                onRename:
                  editable === undefined
                    ? undefined
                    : (input3: string) => {
                        if (
                          input3 !== "" &&
                          !editable.exec("rename " + input2.name, (input4) =>
                            renameTypographyGroup(
                              input4,
                              input2.name,
                              input3,
                            ),
                          )
                        ) {
                          showEditorNotification(
                            "There is already a set called " + input3,
                          );
                        }
                      },
                onRemove:
                  editable === undefined
                    ? undefined
                    : () =>
                        setConfirmation({
                          get title() { return uiMessage("design-system.designSystemApp.delete2", { value1: String(input2.name), value2: String(input2.styles.length > 0 ? (" and its " + String(input2.styles.length) + input2.styles.length === 1
                                  ? " style?"
                                  : " styles?") : ("?")) }); },
                          get confirmLabel() { return uiMessage("design-system.designSystemApp.delete"); },
                          body: "The set and every style in it leave tokens.json. Undo brings the set back.",
                          run: () => {
                            if (
                              !viewRef.current.typeGroups.some(
                                (input3) => input3.name === input2.name,
                              )
                            ) {
                              showEditorNotification(
                                input2.name +
                                  " changed meanwhile. Nothing was deleted.",
                              );
                            } else if (
                              editable.exec(
                                "remove " + input2.name,
                                (input3) =>
                                  deleteTypographyGroup(
                                    input3,
                                    input2.name,
                                  ),
                              )
                            ) {
                              announceUndoableChange(
                                "Deleted " + input2.name,
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
                input2: EditorComponent,
                options: {
                  height: number;
                },
                context: import("../../contracts/preview").PreviewMode,
                value2?: import("../../contracts/editor-runtime").ComponentPropValues,
              ) =>
                renderComponentPreview(
                  input2,
                  options,
                  createPreviewHead(
                    snapshot,
                    context,
                    previewThemeId,
                    true,
                    previewGround,
                  ),
                  value2 === undefined
                    ? undefined
                    : {
                        ...componentStage,
                        values: value2,
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
              onOpen={(input2: EditorAsset) => setOpenAssetPath(input2.path)}
              onUpload={
                addFiles === undefined
                  ? undefined
                  : (input2: EditorAssetGroup) =>
                      void pickUploadFiles().then((input3) =>
                        addFiles(input3, input2.name),
                      )
              }
              onDropFiles={
                addFiles === undefined
                  ? undefined
                  : (input2: EditorAssetGroup, options: React.DragEvent) =>
                      readDroppedFiles(options.dataTransfer, (input3) =>
                        addFiles(input3, input2.name),
                      )
              }
              onRename={
                editable === undefined
                  ? undefined
                  : (input2: EditorAsset, options: string) => {
                      let value =
                          /\.[A-Za-z0-9]{1,8}$/.exec(input2.name)?.[0] ?? "",
                        value2 =
                          /\.(png|jpe?g|gif|webp|avif|svg|pdf|md|mdx|txt|json|woff2?|ttf|otf)$/i,
                        value3 =
                          value !== "" &&
                          !options.toLowerCase().endsWith(value.toLowerCase())
                            ? options.replace(value2, "") + value
                            : options,
                        callback = (
                          input3: import("../../contracts").DesignSystemContent,
                        ) =>
                          renameAssetFile(
                            input3,
                            input2.path,
                            value3,
                          );
                      return performDesignSystemEdit(
                        editable,
                        callback,
                        () =>
                          editable.exec("rename " + input2.name, callback),
                        {
                          nameOf: () => input2.name,
                        },
                      );
                    }
              }
              headFor={(input2: EditorAssetGroup) => {
                let value = "assets:" + input2.name,
                  value2 = assetGroupDisplayName(input2.name);
                return {
                  title: sectionTitle(value, value2),
                  defaultTitle: value2,
                  "data-testid": "ds-card-" + value,
                  ...assetManager.headFor(input2),
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
    navigateAndHint = (input: string) => {
      if (!isDesignSystemSection(input)) {
        return;
      }
      jumpToSection(input);
      let value = sections.find((input2) => input2.id === input)?.label;
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
      doc: document2,
      snap: snapshot,
      sections: sections,
      jump: navigateAndHint,
      mayEdit: !readOnly,
    }),
    navigateOrOpenFiles = (input: string) =>
      input === FILES_SECTION_ID
        ? filesBrowser.show()
        : filesBrowser.leave(() => navigateAndHint(input)),
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
    hasAutoSave = "loadState" in document2 || document2.saveMode() === "auto",
    [saveState, setSaveState] =
      reactArtifactRoot.useState<ApplicationSaveState>(() =>
        document2.saveState(),
      );
  reactArtifactRoot.useEffect(() => {
    let value = document2.subscribeSave(setSaveState);
    setSaveState(document2.saveState());
    return value;
  }, [document2]);
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
          index.find((input) => input.target === target) ??
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
                document2.save();
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
          document2.saveMode() === "manual" ? (
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
                  document2.save();
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
        document2.saveMode() === "manual"),
    navigationFooter = showSaveControls ? saveControls : undefined,
    pendingSections =
      editingOff &&
      handoffAvailable &&
      saveState.message === get_MIGRATED_READONLY_MESSAGE()
        ? {
            rows: PENDING_DESIGN_SYSTEM_SECTIONS,
            tip: get_MIGRATION_EMPTY_PAGE_TITLE(),
            panel: (input: SectionRow, options: () => void) => (
              <ClaudeRequestButton
                label={input.label}
                ask={askClaude}
                busy={handoffBusy}
                onAsked={options}
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
          groups={view.assetGroups.map((input) => input.name)}
          onClose={() => setAssetGroupDialogOpen(false)}
          onLeftOut={announceDropLimit}
          onCreate={(input: string, options: File[]) => {
            if (!addFiles(options, input)) {
              return false;
            }
            setAssetGroupDialogOpen(false);
            revealAsset({
              kind: "assets",
              key: input,
            });
            return true;
          }}
        />
      ) : null;
  return (
    <ArtifactShell
      doc={document2}
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
                  ) : null, <SaveConflictBanners doc={document2} />, <MigrationCleanupBanner
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
                        const _Element2 = PipelineChangeBanner;
                        const _elementProps2 = {
                          change: lastChange,
                        };
                        const _elementKey2 = lastChange.at;
                        return (
                          <_Element2 key={_elementKey2} {..._elementProps2} />
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
                    sections.map((input, options) =>
                      (() => {
                        const _Element3 = "section";
                        const _elementProps3 = {
                          ref: (input2: HTMLElement | null) => {
                            sectionRefs.current[input.id] = input2;
                          },
                          tabIndex: -1,
                          className:
                            "ds-section flex flex-col gap-lg focus:outline-none",
                          "aria-label": input.label,
                          "data-current":
                            input.id === currentSection ? "" : undefined,
                          "data-testid": "ds-section-" + input.id,
                          children: (
                            <LazySection
                              root={sectionScroller.port}
                              eager={
                                options < 2 ||
                                sectionScroller.wanted.has(input.id)
                              }
                              standIn={
                                <SectionSheet>
                                  <SectionHeader
                                    title={input.label}
                                  />
                                </SectionSheet>
                              }
                            >
                              {() =>
                                input.id === "colors" ? (
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
                                ) : input.id === "type" ? (
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
                                ) : input.id === "readme" ? (
                                  editable === undefined &&
                                  view.readme.trim() === "" &&
                                  view.docs.length === 0 ? (
                                    <SectionSheet>
                                      {[<SectionHeader
                                          title={input.label}
                                          pageId={input.id}
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
                                        title={input.label}
                                        pageId={input.id}
                                        data-testid={
                                          "ds-page-head-" + input.id
                                        }
                                        actions={
                                          input.id === "components"
                                            ? themeMenu
                                            : sectionHeaderActions(input.id)
                                        }
                                        note={starterSectionNote(input.id)}
                                      />, sectionIsEmptyOrStarter(input.id) ? (
                                        <EmptySectionHint
                                          kind={
                                            isExtraTokenSection(input.id)
                                              ? "family"
                                              : input.id as import("../../contracts/token-editors").EmptySectionKind
                                          }
                                          readOnly={editable === undefined}
                                        />
                                      ) : isDesignSystemSection(input.id) ? (
                                        renderSection(input.id)
                                      ) : null]}
                                  </SectionSheet>
                                )
                              }
                            </LazySection>
                          ),
                        };
                        const _elementKey3 = input.id;
                        return (
                          <_Element3 key={_elementKey3} {..._elementProps3} />
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
                        const _Element4 = AssetDetailsDialog;
                        const _elementProps4 = {
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
                              : (input: string) => {
                                  let value = openAsset,
                                    callback = (
                                      input2: import("../../contracts").DesignSystemContent,
                                    ) =>
                                      renameAssetFile(
                                        input2,
                                        value.path,
                                        input,
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
                                      setOpenAssetPath((input2) =>
                                        input2 === value.path
                                          ? (pathDirname(
                                              value.path,
                                            ) === ""
                                              ? ""
                                              : pathDirname(
                                                  value.path,
                                                ) + "/") +
                                            sanitizeUploadFileName(
                                              input,
                                            )
                                          : input2,
                                      );
                                      return true;
                                    },
                                    {
                                      nameOf: () => value.name,
                                    },
                                  );
                                },
                        };
                        const _elementKey4 = openAsset.path;
                        return (
                          <_Element4 key={_elementKey4} {..._elementProps4} />
                        );
                      })()
                    : null, assetManager.overlay, assetGroupDialog, tokenDialog !== null ? (
                    <AddTokenDialog
                      req={tokenDialog.req}
                      onClose={() => setTokenDialog(null)}
                      onSubmit={(input: AddedToken) => {
                        let land = tokenDialog.land;
                        setTokenDialog(null);
                        land(input);
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
    ].map((input) => input.id);
    isExtraTokenSection = (items) =>
      items.startsWith("family-") && items.length > 7;
    isDesignSystemSection = (input) =>
      BUILTIN_DESIGN_SYSTEM_SECTION_IDS.includes(input) ||
      isExtraTokenSection(input);
    initialDesignSystemSection = () =>
      initialSectionFromHash(isDesignSystemSection, "readme");
    PENDING_DESIGN_SYSTEM_SECTIONS = [
      ...CORE_DESIGN_SYSTEM_SECTIONS,
      ...CONTENT_DESIGN_SYSTEM_SECTIONS,
    ].filter((input) => input.id !== "readme");
    designSystemSections = (input) => [
      ...CORE_DESIGN_SYSTEM_SECTIONS,
      ...input.map((input2) => ({
        id: extraTokenFamilySectionId(input2.key),
        label: input2.title,
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
