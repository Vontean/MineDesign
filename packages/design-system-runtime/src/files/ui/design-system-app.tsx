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
  ConfirmationState,
  TokenFlashTarget,
  SectionScroller,
  AssetRevealTarget,
  EditorExtraScale,
  SearchEntry,
  NavigationSearch,
  ApplicationSaveState,
  EditorAsset,
  EditorAssetGroup,
  EditorTypeGroup,
  ScalarScaleGroup,
  AssetIntakeOptions,
  ClaudeRequest,
  ClaudeDeliveryResult,
  RefusedUpload,
  ScalarTokenKind,
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
import { collectDownloadFiles, createStoredZip, downloadZipBaseName, extractDroppedFiles, MAX_DROPPED_FILES, readDownloadFileBytes, saveDownloadFile, unsupportedDownloadMessage } from "../../editor/asset-upload";
import { chooseClaudeDeliveryRoad, createClaudeDeliveryContextStore, deliverClaudeRequest } from "../../editor/claude-delivery";
import { artifactPageAddress, claudeDeliveryStatusMessage, githubStarterPrompt, ownerEmptySystemPrompt, ownerHandoffFilesPrompt, viewerEmptySystemPrompt, viewerGitHubSyncPrompt, viewerHandoffFilesPrompt } from "../../editor/claude-prompts";
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
import { googleFontStylesheetUrls, syncGoogleFontStylesheets } from "./google-font-stylesheets";
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
import { extraTokenScaleGroups, tokenScaleGroupId, tokenScaleGroupLabel, tokenScaleGroups, TokenScaleSections } from "../../editor/token-scales";
import { TypographySection, TypographySectionHeader } from "../../editor/typography";
import { existingFontUploadFiles, pickUploadFiles } from "../../editor/upload-pipeline";
import { assetGroupDisplayName, designSystemEditorView, emptyDesignSystemSections, extraTokenFamilySectionId, hasOnlyManifestFile, STARTER_SECTION_IDS, starterSectionState } from "../../editor/view-model";
import { BOOT_LIVE_NOTICE_MESSAGES, get_MIGRATED_READONLY_MESSAGE } from "../boot-decisions";
import { FILES_SECTION_ID, useDesignSystemFilesBrowser } from "./design-system-files";
import { useAssetIntakeQueue } from "./asset-intake-queue";
import { useWelcomeUpload } from "./welcome-upload";
import { useStorageReclaim } from "./storage-reclaim";
import { TOKEN_DEFAULTS, useTokenDialogFlow } from "./token-dialog";
import { useTokenEditors } from "./token-editing";
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
import { deleteTypographyGroup, renameAssetFile, renameTypographyGroup, replaceInlineFileWithPointer } from "../../model/asset-commands";
import { assessAssetReclamation, assetStorageUsageMessage, getAssetsCatalogState, inlineStorageFallbackMessage, missingAssetsMessage, refreshAssetsCatalog, resolveAssetsCapability, subscribeAssetsState } from "../../model/asset-store";
import { inferComponentPropControls } from "../../model/component-inference";
import { humanizeDocumentFilename } from "../../model/derive-system";
import { deleteDesignSystemFiles, fileFitsInlineBudgets, renameDesignSystemFile, sanitizeUploadFileName, setAdditionalDocument, setDesignSystemReadme } from "../../model/file-commands";
import { assetKindForPath, DESIGN_SYSTEM_PATHS, fileExtension, mimeTypeForPath, pathBasename, pathDirname } from "../../model/file-policy";
import { DESIGN_SYSTEM_INLINE_LIMITS, isUnboundedFileParsing } from "../../model/file-table";
import { deleteFontFace } from "../../model/font-component-commands";
import { isCiLastChange } from "../../model/last-change";
import { DOWNLOAD_INTERNAL_FAILURE, downloadHealthOutcome } from "../../model/publish";
import { uniqueStoredBlobCount } from "../../model/storage";
import { createDesignSystemCommands, DesignSystemStore } from "../../model/system-store";
import { getStoredSystemStatus, subscribeStoredSystemStatus } from "../../model/system-sync";
import { generateNamedTokensCss, isColorLiteral, resolveColorTokenValue, tokenNamesForFamily } from "../../model/tokens";
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
  fonts: { family: string }[],
  typeTokens: NormalizedTokens["type"],
) {
  const urls = googleFontStylesheetUrls(familyNames, fonts, typeTokens);
  const fingerprint = urls.join("|");
  (reactArtifactRoot as typeof React).useEffect(() => {
    syncGoogleFontStylesheets(urls);
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
    sectionTitle = (sectionId: string, defaultTitle: string) =>
      snapshot.sectionTitles[sectionId] ?? defaultTitle,
    sectionHead = (sectionId: string, defaultTitle: string) => ({
      title: sectionTitle(sectionId, defaultTitle),
      defaultTitle: defaultTitle,
      "data-testid": "ds-card-" + sectionId,
    }),
    { colorEdit, spacingEdit, radiusEdit, shadowEdit, typeEdit, componentEdit, extraScaleEdit } = useTokenEditors({
      editable, snapshot, viewRef, setConfirmation, focusTestId, announceUndoableChange,
      getTokenFlow: () => tokenFlow,
    }),
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
  let {
      freeing: freeingStorage,
      freeSpaceLabel: freeSpaceText,
      askFree: askFreeStorage,
    } = useStorageReclaim({
      editable,
      editor,
      applicationDocument,
      system,
      blobAnalysis,
      freeingBlobIdsRef,
      askConfirmation: setConfirmation,
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
    {
      uploadPanelOpen, uploadPanelActiveRef, uploadPanelVisibleRef, intakeFiles, intakeFilePaths,
      keptIntakeCount, refusedUploadNames, openUploadPanel, backFromUpload, addWelcomeFiles,
      removeWelcomeFile, createFromWelcomeFiles, recordIntakeOutcome, announceIntakeOutcome,
    } = useWelcomeUpload({
      editable, editor, applicationDocument, system, currentSection,
      filesSnapshot: snapshot.files, uploadOptionLabel, jumpToSection, askClaude, noticeWithAction,
      getAddFiles: () => addFiles,
      getFileHandoffAction: () => fileHandoffAction,
    }),
    showWelcome = starter.hint || uploadPanelOpen,
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
    addFiles = useAssetIntakeQueue({
      editable, editor, applicationDocument, system, intakeOptions, currentSectionRef,
      uploadPanelVisibleRef, getTokenDialog: () => tokenFlow.getDialog(),
      setIntakeBusy, setIntakeProgress, recordIntakeOutcome, announceIntakeOutcome, jumpToSection,
    }),
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
    tokenFlow = useTokenDialogFlow({
      editable,
      snapshot,
      view,
      valueThemes,
      defaultValueThemeId,
      flashToken,
      revealAsset,
    }),
    themeGrounds = reactArtifactRoot.useMemo(
      () => previewThemeGroundColors(snapshot.tokens, valueThemes),
      [snapshot.tokens, valueThemes],
    ),
    previewGround =
      needsGround && previewThemeId !== undefined
        ? themeGrounds[previewThemeId]?.well
        : undefined,
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
            add: (sectionId?: string) => tokenFlow.openTypeStyle(sectionId),
            addSet: () => tokenFlow.openTypeStyle(NEW_TOKEN_GROUP_SENTINEL),
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
            onClick={() => tokenFlow.openShadow()}
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
              tokenFlow.openScale(
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
                            refused: refusedUploadNames,
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
                          get title() { return uiMessage("design-system.designSystemApp.delete2", { subject: String(group.name), detail: String(group.styles.length > 0 ? (" and its " + String(group.styles.length) + group.styles.length === 1
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
                      add: tokenFlow.openShadow,
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
      addColor: () => tokenFlow.openColor(),
      addStyle: () => tokenFlow.openTypeStyle(),
      addShadow: () => tokenFlow.openShadow(),
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
                    : null, assetManager.overlay, assetGroupDialog, tokenFlow.dialog !== null ? (
                    <AddTokenDialog
                      req={tokenFlow.dialog.req}
                      onClose={tokenFlow.close}
                      onSubmit={tokenFlow.submit}
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
