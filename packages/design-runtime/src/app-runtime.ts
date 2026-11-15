import { installDependencies } from "./dependencies";
import { installModuleHelpers } from "./module-helpers";
import { installCdsPlatformFeatureLoader } from "./cds/platform/feature-loader";
import { installCdsHooksLayoutEffect } from "./cds/hooks/layout-effect";
import { installCdsThemeExperimentalTheme } from "./cds/theme/experimental-theme";
import { installCdsThemeClassNames } from "./cds/theme/class-names";
import { installCdsPlatformRuntime } from "./cds/platform/runtime";
import { installCdsLinks } from "./cds/links";
import { installCdsDomOwnerWindow } from "./cds/dom/owner-window";
import { installCdsDomInputObservation } from "./cds/dom/input-observation";
import { installCdsOverlaysAndroidCloseWatcher } from "./cds/overlays/android-close-watcher";
import { installCdsSheetsGesturePhysics } from "./cds/sheets/gesture-physics";
import { installCdsSheetsLayout } from "./cds/sheets/layout";
import { installCdsHooksMediaQuery } from "./cds/hooks/media-query";
import { installCdsHooksStableCallback } from "./cds/hooks/stable-callback";
import { installCdsSheetsKeyboardViewport } from "./cds/sheets/keyboard-viewport";
import { installCdsSheetsPresentation } from "./cds/sheets/presentation";
import { installCdsOverlaysImperativeHandle } from "./cds/overlays/imperative-handle";
import { installCdsDomInert } from "./cds/dom/inert";
import { installCdsSheetsPopupStack } from "./cds/sheets/popup-stack";
import { installCdsPlatformReducedMotion } from "./cds/platform/reduced-motion";
import { installCdsSheetsStyles } from "./cds/sheets/styles";
import { installCdsSheetsChrome } from "./cds/sheets/chrome";
import { installCdsOverlaysLayers } from "./cds/overlays/layers";
import { installCdsDomRefComposition } from "./cds/dom/ref-composition";
import { installCdsPlatformRootFontSize } from "./cds/platform/root-font-size";
import { installCdsComponentsIcon } from "./cds/components/icon";
import { installCdsThemeSurfaces } from "./cds/theme/surfaces";
import { installCdsMenuConfiguration } from "./cds/menu/configuration";
import { installCdsSheetsScrollArea } from "./cds/sheets/scroll-area";
import { installCdsMenuPopup } from "./cds/menu/popup";
import { installCdsMenuPassiveOpenGate } from "./cds/menu/passive-open-gate";
import { installCdsMenuItemStyles } from "./cds/menu/item-styles";
import { installCdsSheetsMenuPopup } from "./cds/sheets/menu-popup";
import { installCdsSheetsLazyLoader } from "./cds/sheets/lazy-loader";
import { installCdsThemeRoot } from "./cds/theme/root";
import { installCdsThemeTokens } from "./cds/theme/tokens";
import { installCdsDomSelectionPrevention } from "./cds/dom/selection-prevention";
import { installCdsEditorSelectionGeometry } from "./cds/editor/selection-geometry";
import { installCdsEditorAlignmentGuides } from "./cds/editor/alignment-guides";
import { installCdsComponentsShortcut } from "./cds/components/shortcut";
import { installCdsComponentsShrinkWrap } from "./cds/components/shrink-wrap";
import { installCdsTooltipTrigger } from "./cds/tooltip/trigger";
import { installCdsTooltipDisabledReason } from "./cds/tooltip/disabled-reason";
import { installCdsTooltipStyles } from "./cds/tooltip/styles";
import { installCdsTooltipTooltip } from "./cds/tooltip/tooltip";
import { installCdsComponentsCollapsible } from "./cds/components/collapsible";
import { installCdsComponentsSpinner } from "./cds/components/spinner";
import { installCdsTooltipDeferredProvider } from "./cds/tooltip/deferred-provider";
import { installCdsButtonContext } from "./cds/button/context";
import { installCdsButtonButton } from "./cds/button/button";
import { installCdsComponentsSkeleton } from "./cds/components/skeleton";
import { installCdsComponentsSurface } from "./cds/components/surface";
import { installCdsComponentsCheckbox } from "./cds/components/checkbox";
import { installCdsFieldContext } from "./cds/field/context";
import { installCdsComponentsTextInput } from "./cds/components/text-input";
import { installCdsOverlaysBackdrop } from "./cds/overlays/backdrop";
import { installCdsMenuMenu } from "./cds/menu/menu";
import { installCdsPopoverPopover } from "./cds/popover/popover";
import { installCdsComponentsTextArea } from "./cds/components/text-area";
import { installCdsComponentsBadge } from "./cds/components/badge";
import { installCdsComponentsCounter } from "./cds/components/counter";
import { installCdsComponentsTextLink } from "./cds/components/text-link";
import { installCdsDialogDialog } from "./cds/dialog/dialog";
import { installCdsButtonGroup } from "./cds/button/group";
import { installCdsComboboxCombobox } from "./cds/combobox/combobox";
import { installCdsSwitchContext } from "./cds/switch/context";
import { installCdsComponentsSwitch } from "./cds/components/switch";
import { installCdsComponentsRadioGroup } from "./cds/components/radio-group";
import { installCdsComponentsSelectionPoints } from "./cds/components/selection-points";
import { installCdsComponentsSelectionRing } from "./cds/components/selection-ring";
import { installCdsComponentsNumberInput } from "./cds/components/number-input";
import { installCdsTabsTabs } from "./cds/tabs/tabs";
import { installCdsToastToast } from "./cds/toast/toast";
import { installCdsFieldField } from "./cds/field/field";
import { installCdsIndex } from "./cds/index";
import { installPlatformTheme } from "./platform/theme";
import { installPlatformCdsIsland } from "./platform/cds-island";
import { installEditorAttributeValidation } from "./editor/attribute-validation";
import { installEditorInspectorContext } from "./editor/inspector/context";
import { installEditorInspectorLinkPopover } from "./editor/inspector/link-popover";
import { installPlatformHotReload } from "./platform/hot-reload";
import { installPlatformReactRuntime } from "./platform/react-runtime";
import { installEditorChromeTheme } from "./editor/chrome/theme";
import { installEditorChromeOverlayState } from "./editor/chrome/overlay-state";
import { installEditorChromeFocus } from "./editor/chrome/focus";
import { installEditorChromePopover } from "./editor/chrome/popover";
import { installEditorChromeMenuItem } from "./editor/chrome/menu-item";
import { installEditorChromeContextMenu } from "./editor/chrome/context-menu";
import { installEditorChromeToast } from "./editor/chrome/toast";
import { installPlatformHostCapabilities } from "./platform/host-capabilities";
import { installPlatformPublish } from "./platform/publish";
import { installPlatformDocumentTheme } from "./platform/document-theme";
import { installPlatformDocumentCompilation } from "./platform/document-compilation";
import { installPlatformComments } from "./platform/comments";
import { installPlatformEmulator } from "./platform/emulator";
import { installPlatformImageProcessing } from "./platform/image-processing";
import { installPlatformImageUpload } from "./platform/image-upload";
import { installPlatformBlobCache } from "./platform/blob-cache";
import { installPlatformEditCount } from "./platform/edit-count";
import { installPlatformDatabaseDocumentStore } from "./platform/database-document-store";
import { installPlatformDatabaseRuntime } from "./platform/database-runtime";
import { installPlatformUserCapabilities } from "./platform/user-capabilities";
import { installPlatformDocumentStash } from "./platform/document-stash";
import { installPlatformDocumentStore } from "./platform/document-store";
import { installPlatformProjectPaths } from "./platform/project-paths";
import { installPlatformSha256 } from "./platform/sha256";
import { installPlatformFileContent } from "./platform/file-content";
import { installPlatformCssSanitization } from "./platform/css-sanitization";
import { installPlatformLinkNavigation } from "./platform/link-navigation";
import { installPlatformRateLimiter } from "./platform/rate-limiter";
import { installExportDomSnapshot } from "./export/dom-snapshot";
import { installExportDownloads } from "./export/downloads";
import { installExportSettlement } from "./export/settlement";
import { installExportFileNames } from "./export/file-names";
import { installExportReadingOrder } from "./export/reading-order";
import { installExportCaptureStyle } from "./export/capture-style";
import { installExportAnimationSnapshot } from "./export/animation-snapshot";
import { installExportCaptureTextMetrics } from "./export/capture-text-metrics";
import { installExportCaptureSelection } from "./export/capture-selection";
import { installExportCaptureText } from "./export/capture-text";
import { installExportCaptureLayout } from "./export/capture-layout";
import { installExportCaptureFlow } from "./export/capture-flow";
import { installExportCapturePagination } from "./export/capture-pagination";
import { installExportCaptureFonts } from "./export/capture-fonts";
import { installExportCaptureAssets } from "./export/capture-assets";
import { installExportCaptureRuntime } from "./export/capture-runtime";
import { installExportCaptureScript } from "./export/capture-script";
import { installPreviewEvaluation } from "./preview/evaluation";
import { installEditorAccessibilityAnnouncer } from "./editor/accessibility/announcer";
import { installEditorColorContrast } from "./editor/color/contrast";
import { installEditorColorOklch } from "./editor/color/oklch";
import { installEditorColorContrastCopy } from "./editor/color/contrast-copy";
import { installEditorColorContrastUi } from "./editor/color/contrast-ui";
import { installEditorColorPickerPrimitives } from "./editor/color/picker-primitives";
import { installEditorColorPicker } from "./editor/color/picker";
import { installEditorInspectorComputedData } from "./editor/inspector/computed-data";
import { installEditorTypographyCensusStore } from "./editor/typography/census-store";
import { installCanvasViewportMemory } from "./canvas/viewport-memory";
import { installPlatformHealthAndAnalytics } from "./platform/health-and-analytics";
import { installExportPdfJpeg } from "./export/pdf/jpeg";
import { installExportPdfLossless } from "./export/pdf/lossless";
import { installExportPdfWinansi } from "./export/pdf/winansi";
import { installExportPdfUnicodeFont } from "./export/pdf/unicode-font";
import { installExportPdfTextEncoding } from "./export/pdf/text-encoding";
import { installExportPdfTextOperators } from "./export/pdf/text-operators";
import { installExportPdfFigureOperators } from "./export/pdf/figure-operators";
import { installExportPdfLinkAnnotations } from "./export/pdf/link-annotations";
import { installExportPdfLanguage } from "./export/pdf/language";
import { installExportPdfStructure } from "./export/pdf/structure";
import { installExportPdfOutline } from "./export/pdf/outline";
import { installExportPdfDocument } from "./export/pdf/document";
import { installExportAnalytics } from "./export/analytics";
import { installExportOutcomes } from "./export/outcomes";
import { installExportPaperAndScale } from "./export/paper-and-scale";
import { installExportWarnings } from "./export/warnings";
import { installExportDelivery } from "./export/delivery";
import { installExportCaptureViewport } from "./export/capture-viewport";
import { installExportCaptureWarnings } from "./export/capture-warnings";
import { installExportImage } from "./export/image";
import { installExportPdfCapture } from "./export/pdf/capture";
import { installPlatformDocumentValues } from "./platform/document-values";
import { installPlatformCommentDocuments } from "./platform/comment-documents";
import { installDesignSystemPaths } from "./design-system/paths";
import { installDesignSystemInstalledSystems } from "./design-system/installed-systems";
import { installPlatformFileReferences } from "./platform/file-references";
import { installDesignSystemPublishedFiles } from "./design-system/published-files";
import { installDesignSystemFileOverlay } from "./design-system/file-overlay";
import { installPlatformExternalFiles } from "./platform/external-files";
import { installDesignSystemTypeDeclarations } from "./design-system/type-declarations";
import { installDesignSystemTokenParsing } from "./design-system/token-parsing";
import { installDesignSystemTypographyParsing } from "./design-system/typography-parsing";
import { installDesignSystemStore } from "./design-system/store";
import { installPlatformDesignSource } from "./platform/design-source";
import { installPlatformStorageMigration } from "./platform/storage-migration";
import { installEditorChromePendingToasts } from "./editor/chrome/pending-toasts";
import { installPlatformReopenAnnouncement } from "./platform/reopen-announcement";
import { installPlatformAccessRetry } from "./platform/access-retry";
import { installPlatformFilesHotReload } from "./platform/files-hot-reload";
import { installPlatformMigrationState } from "./platform/migration-state";
import { installPlatformMigrationInput } from "./platform/migration-input";
import { installPlatformTombstoneActions } from "./platform/tombstone-actions";
import { installPlatformDesignDocumentAdapter } from "./platform/design-document-adapter";
import { installPlatformIdleScheduler } from "./platform/idle-scheduler";
import { installEditorChromeSaveStatus } from "./editor/chrome/save-status";
import { installEditorSelectionHost } from "./editor/selection/host";
import { installPlatformSaveEvents } from "./platform/save-events";
import { installCollaborationPeerCursors } from "./collaboration/peer-cursors";
import { installCollaborationPresenceComposer } from "./collaboration/presence-composer";
import { installCollaborationPeerSelections } from "./collaboration/peer-selections";
import { installEditorTemplateExpressions } from "./editor/template-expressions";
import { installEditorHtmlTagNormalization } from "./editor/html/tag-normalization";
import { installEditorTypographyFontCatalog } from "./editor/typography/font-catalog";
import { installEditorCssDeclarations } from "./editor/css/declarations";
import { installEditorCssRules } from "./editor/css/rules";
import { installEditorCssInheritance } from "./editor/css/inheritance";
import { installEditorCssValues } from "./editor/css/values";
import { installEditorTypographyFontFamily } from "./editor/typography/font-family";
import { installEditorCssTransforms } from "./editor/css/transforms";
import { installEditorCssShorthand } from "./editor/css/shorthand";
import { installEditorCssGrid } from "./editor/css/grid";
import { installEditorInspectorPropertySchema } from "./editor/inspector/property-schema";
import { installEditorSvgArrows } from "./editor/svg/arrows";
import { installEditorComponentsImports } from "./editor/components/imports";
import { installEditorComponentsProps } from "./editor/components/props";
import { installEditorComponentsTextEdits } from "./editor/components/text-edits";
import { installEditorHtmlAuthoring } from "./editor/html/authoring";
import { installEditorModelDomText } from "./editor/model/dom-text";
import { installEditorModelLabels } from "./editor/model/labels";
import { installEditorModelDcEditorModel } from "./editor/model/dc-editor-model";
import { installEditorModelDirectives } from "./editor/model/directives";
import { installEditorHtmlEscaping } from "./editor/html/escaping";
import { installEditorTypographyFontVariants } from "./editor/typography/font-variants";
import { installEditorSvgArrowProperties } from "./editor/svg/arrow-properties";
import { installEditorInspectorStyleMetadata } from "./editor/inspector/style-metadata";
import { installEditorInspectorElement } from "./editor/inspector/element";
import { installEditorInspectorSelection } from "./editor/inspector/selection";
import { installEditorTypographyCensus } from "./editor/typography/census";
import { installEditorHtmlDcDocument } from "./editor/html/dc-document";
import { installEditorHtmlDcProps } from "./editor/html/dc-props";
import { installEditorUndoHistory } from "./editor/undo/history";
import { installEditorSelectionCanvasSelection } from "./editor/selection/canvas-selection";
import { installEditorSelectionActions } from "./editor/selection/actions";
import { installEditorLayoutInsets } from "./editor/layout/insets";
import { installEditorClipboardHtmlSanitization } from "./editor/clipboard/html-sanitization";
import { installEditorClipboardLayoutSnapshots } from "./editor/clipboard/layout-snapshots";
import { installEditorLayoutFrozenStyle } from "./editor/layout/frozen-style";
import { installEditorSelectionElementOrder } from "./editor/selection/element-order";
import { installEditorClipboardTemplateFlattening } from "./editor/clipboard/template-flattening";
import { installEditorInsertTargets } from "./editor/insert/targets";
import { installEditorUndoElements } from "./editor/undo/elements";
import { installEditorCssEditValidation } from "./editor/css/edit-validation";
import { installEditorPickerHiddenTags } from "./editor/picker/hidden-tags";
import { installEditorGeometrySnapping } from "./editor/geometry/snapping";
import { installEditorGeometryResize } from "./editor/geometry/resize";
import { installEditorGeometryRotation } from "./editor/geometry/rotation";
import { installEditorGeometryPen } from "./editor/geometry/pen";
import { installEditorSvgDrawing } from "./editor/svg/drawing";
import { installEditorPickerRuntimeScript } from "./editor/picker/runtime-script";
import { installEditorPickerBridge } from "./editor/picker/bridge";
import { installEditorPickerInspection } from "./editor/picker/inspection";
import { installCanvasPreviewMounting } from "./canvas/preview-mounting";
import { installCanvasViewportStore } from "./canvas/viewport-store";
import { installCollaborationSelectionPaths } from "./collaboration/selection-paths";
import { installEditorSessionErrors } from "./editor/session/errors";
import { installCanvasDesktopRefresh } from "./canvas/desktop-refresh";
import { installEditorTypographyGoogleFonts } from "./editor/typography/google-fonts";
import { installCanvasPreviewNavigation } from "./canvas/preview-navigation";
import { installPreviewRuntimeLoading } from "./preview/runtime-loading";
import { installPreviewAssetRewriting } from "./preview/asset-rewriting";
import { installPreviewHtmlScanner } from "./preview/html-scanner";
import { installPreviewCssRewriting } from "./preview/css-rewriting";
import { installPreviewDependencyInjection } from "./preview/dependency-injection";
import { installPreviewBlobPaths } from "./preview/blob-paths";
import { installPreviewComponentImports } from "./preview/component-imports";
import { installPreviewDependencyGraph } from "./preview/dependency-graph";
import { installPreviewBuildDocument } from "./preview/build-document";
import { installPreviewModuleCache } from "./preview/module-cache";
import { installPlatformFeatureFlags } from "./platform/feature-flags";
import { installPreviewAddressedArtboards } from "./preview/addressed-artboards";
import { installPreviewProjectRoot } from "./preview/project-root";
import { installEditorClipboardNative } from "./editor/clipboard/native";
import { installEditorClipboardState } from "./editor/clipboard/state";
import { installEditorKeyboardShortcuts } from "./editor/keyboard/shortcuts";
import { installEditorLinksNavigation } from "./editor/links/navigation";
import { installEditorNotesInlineMarkdown } from "./editor/notes/inline-markdown";
import { installEditorNotesBlocks } from "./editor/notes/blocks";
import { installEditorNotesDom } from "./editor/notes/dom";
import { installEditorNotesFormatting } from "./editor/notes/formatting";
import { installEditorStyleSchemaNodeTypes } from "./editor/style-schema/node-types";
import { installEditorStyleSchemaValues } from "./editor/style-schema/values";
import { installEditorStyleSchemaValidation } from "./editor/style-schema/validation";
import { installEditorStyleSchemaColorAndFont } from "./editor/style-schema/color-and-font";
import { installEditorStyleSchemaShadow } from "./editor/style-schema/shadow";
import { installEditorStyleSchemaGradient } from "./editor/style-schema/gradient";
import { installEditorStyleSchemaStructuredValues } from "./editor/style-schema/structured-values";
import { installEditorStyleSchemaCss } from "./editor/style-schema/css";
import { installEditorClipboardImageValidation } from "./editor/clipboard/image-validation";
import { installEditorClipboardArtboards } from "./editor/clipboard/artboards";
import { installEditorClipboardAnnotations } from "./editor/clipboard/annotations";
import { installEditorClipboardAssets } from "./editor/clipboard/assets";
import { installEditorClipboardPictures } from "./editor/clipboard/pictures";
import { installEditorClipboardPastePlanning } from "./editor/clipboard/paste-planning";
import { installEditorClipboardFileTransfer } from "./editor/clipboard/file-transfer";
import { installExportDeliveryUi } from "./export/delivery-ui";
import { installEditorClipboardTrustDialog } from "./editor/clipboard/trust-dialog";
import { installExportPdfOrchestration } from "./export/pdf/orchestration";
import { installEditorKeyboardEditActions } from "./editor/keyboard/edit-actions";
import { installEditorChromeScrollbar } from "./editor/chrome/scrollbar";
import { installEditorChromeToolIcons } from "./editor/chrome/tool-icons";
import { installEditorKeyboardFind } from "./editor/keyboard/find";
import { installEditorKeyboardPaste } from "./editor/keyboard/paste";
import { installEditorInspectorModes } from "./editor/inspector/modes";
import { installEditorOutlineGlyphs } from "./editor/outline/glyphs";
import { installEditorOutlineRename } from "./editor/outline/rename";
import { installEditorOutlineTree } from "./editor/outline/tree";
import { installEditorOutlineDcOutline } from "./editor/outline/dc-outline";
import { installEditorOutlineNativeMenu } from "./editor/outline/native-menu";
import { installEditorOutlineAnnotations } from "./editor/outline/annotations";
import { installEditorEventsRuntime } from "./editor/events/runtime";
import { installEditorModelFileEchoes } from "./editor/model/file-echoes";
import { installEditorModelPendingProps } from "./editor/model/pending-props";
import { installEditorModelPublishing } from "./editor/model/publishing";
import { installEditorModelThreeWayMerge } from "./editor/model/three-way-merge";
import { installEditorModelHistoryRebase } from "./editor/model/history-rebase";
import { installEditorModelModelState } from "./editor/model/model-state";
import { installEditorModelUseDcModel } from "./editor/model/use-dc-model";
import { installEditorComponentsPropCache } from "./editor/components/prop-cache";
import { installEditorComponentsPropValidation } from "./editor/components/prop-validation";
import { installEditorComponentsUseDcProps } from "./editor/components/use-dc-props";
import { installEditorTextDeferredInput } from "./editor/text/deferred-input";
import { installEditorTextTypingTarget } from "./editor/text/typing-target";
import { installEditorInsertFileDrops } from "./editor/insert/file-drops";
import { installEditorClipboardHtmlPlacement } from "./editor/clipboard/html-placement";
import { installEditorMediaCropGeometry } from "./editor/media/crop-geometry";
import { installEditorInsertElementKinds } from "./editor/insert/element-kinds";
import { installEditorInsertDropTargets } from "./editor/insert/drop-targets";
import { installEditorMediaVideoUpload } from "./editor/media/video-upload";
import { installCanvasWorkingLabelAnimation } from "./canvas/working-label-animation";
import { installPlatformClaudeActivity } from "./platform/claude-activity";
import { installCanvasWorkingState } from "./canvas/working-state";
import { installEditorAccessibilityAnnouncements } from "./editor/accessibility/announcements";
import { installEditorClipboardWorkingFiles } from "./editor/clipboard/working-files";
import { installEditorClipboardPngCopy } from "./editor/clipboard/png-copy";
import { installEditorClipboardSvgCopy } from "./editor/clipboard/svg-copy";
import { installEditorVectorToolState } from "./editor/vector/tool-state";
import { installCanvasPanZoom } from "./canvas/pan-zoom";
import { installCanvasFocus } from "./canvas/focus";
import { installCanvasArtboardResize } from "./canvas/artboard-resize";
import { installEditorNotesAutoformat } from "./editor/notes/autoformat";
import { installEditorNotesLinkEditing } from "./editor/notes/link-editing";
import { installCanvasNote } from "./canvas/note";
import { installCanvasMeasurements } from "./canvas/measurements";
import { installPlatformFrameHostBridge } from "./platform/frame-host-bridge";
import { installEditorToolbarPrimitives } from "./editor/toolbar/primitives";
import { installEditorToolbarLayout } from "./editor/toolbar/layout";
import { installEditorToolbarSaveStatus } from "./editor/toolbar/save-status";
import { installEditorToolbarScroller } from "./editor/toolbar/scroller";
import { installEditorToolbarPublishControls } from "./editor/toolbar/publish-controls";
import { installEditorToolbarToolbar } from "./editor/toolbar/toolbar";
import { installCanvasPendingArtboards } from "./canvas/pending-artboards";
import { installCanvasPictureDropGhost } from "./canvas/picture-drop-ghost";
import { installEditorHooksLatestCallback } from "./editor/hooks/latest-callback";
import { installEditorVectorPathEditing } from "./editor/vector/path-editing";
import { installEditorVectorUseVectorEditor } from "./editor/vector/use-vector-editor";
import { installEditorVectorPathControls } from "./editor/vector/path-controls";
import { installEditorVectorPathParsing } from "./editor/vector/path-parsing";
import { installEditorVectorPathEditor } from "./editor/vector/path-editor";
import { installEditorVectorAnnotationPenEditor } from "./editor/vector/annotation-pen-editor";
import { installEditorVectorElementPenEditor } from "./editor/vector/element-pen-editor";
import { installEditorMediaVideoPlayback } from "./editor/media/video-playback";
import { installEditorSvgLayout } from "./editor/svg/layout";
import { installEditorGeometryFlipElements } from "./editor/geometry/flip-elements";
import { installEditorGeometryFlipAnnotations } from "./editor/geometry/flip-annotations";
import { installCanvasImageDecodeScheduler } from "./canvas/image-decode-scheduler";
import { installCanvasAnnotationShapeStyle } from "./canvas/annotation-shape-style";
import { installCanvasShape } from "./canvas/shape";
import { installEditorHooksAlternateCursor } from "./editor/hooks/alternate-cursor";
import { installEditorSvgArrowEditing } from "./editor/svg/arrow-editing";
import { installEditorHooksElementAndDismissal } from "./editor/hooks/element-and-dismissal";
import { installEditorCodeScriptLiterals } from "./editor/code/script-literals";
import { installEditorCodeDesignColorTokens } from "./editor/code/design-color-tokens";
import { installEditorChromeUnsavedEditsDialog } from "./editor/chrome/unsaved-edits-dialog";
import { installEditorFeedbackAttachments } from "./editor/feedback/attachments";
import { installEditorCodeUnifiedDiff } from "./editor/code/unified-diff";
import { installEditorInspectorContextPart2 } from "./editor/inspector/context-part-2";
import { installEditorPropertiesPrimitives } from "./editor/properties/primitives";
import { installEditorPropertiesRow } from "./editor/properties/row";
import { installEditorPropertiesSection } from "./editor/properties/section";
import { installEditorPropertiesTooltip } from "./editor/properties/tooltip";
import { installEditorPropertiesToolOptions } from "./editor/properties/tool-options";
import { installEditorPropertiesNumericScrubber } from "./editor/properties/numeric-scrubber";
import { installEditorPropertiesNumericInput } from "./editor/properties/numeric-input";
import { installEditorPropertiesPickerSearch } from "./editor/properties/picker-search";
import { installEditorPropertiesSelect } from "./editor/properties/select";
import { installEditorPropertiesGradientEditor } from "./editor/properties/gradient-editor";
import { installEditorPropertiesColorSwatches } from "./editor/properties/color-swatches";
import { installEditorPropertiesColorPicker } from "./editor/properties/color-picker";
import { installEditorPropertiesRows } from "./editor/properties/rows";
import { installEditorComponentsPropEditors } from "./editor/components/prop-editors";
import { installEditorComponentsPropsPanel } from "./editor/components/props-panel";
import { installEditorChromeRoot } from "./editor/chrome/root";
import { installEditorChromePanelShell } from "./editor/chrome/panel-shell";
import { installEditorChromePanelWidth } from "./editor/chrome/panel-width";
import { installEditorChromeResizeGrip } from "./editor/chrome/resize-grip";
import { installEditorChromePanelClose } from "./editor/chrome/panel-close";
import { installEditorPropertiesSegments } from "./editor/properties/segments";
import { installEditorPropertiesSides } from "./editor/properties/sides";
import { installEditorMediaCropEditor } from "./editor/media/crop-editor";
import { installEditorSessionStripPointerState } from "./editor/session-strip/pointer-state";
import { installEditorSessionStripSessionStrip } from "./editor/session-strip/session-strip";
import { installEditorSessionStripReveal } from "./editor/session-strip/reveal";
import { installEditorChromeLoading } from "./editor/chrome/loading";
import { installCollaborationPeerBadge } from "./collaboration/peer-badge";
import { installEditorSessionStripPopover } from "./editor/session-strip/popover";
import { installEditorPropertiesEffectPopup } from "./editor/properties/effect-popup";
import { installEditorPropertiesStyleBag } from "./editor/properties/style-bag";
import { installEditorPropertiesEffectsSection } from "./editor/properties/effects-section";
import { installEditorPropertiesShadowEffects } from "./editor/properties/shadow-effects";
import { installEditorPropertiesLiveScrub } from "./editor/properties/live-scrub";
import { installEditorPropertiesCssEffects } from "./editor/properties/css-effects";
import { installEditorPropertiesDropShadowEditor } from "./editor/properties/drop-shadow-editor";
import { installEditorPropertiesTokenColorPicker } from "./editor/properties/token-color-picker";
import { installEditorPropertiesAssetPicker } from "./editor/properties/asset-picker";
import { installEditorCssGradients } from "./editor/css/gradients";
import { installEditorPropertiesBackgroundEditor } from "./editor/properties/background-editor";
import { installEditorPropertiesShadowRow } from "./editor/properties/shadow-row";
import { installEditorPropertiesSizingRow } from "./editor/properties/sizing-row";
import { installEditorPropertiesInheritedField } from "./editor/properties/inherited-field";
import { installEditorPropertiesCssNumberRow } from "./editor/properties/css-number-row";
import { installEditorPropertiesGridRow } from "./editor/properties/grid-row";
import { installEditorPropertiesCssValueRow } from "./editor/properties/css-value-row";
import { installEditorPropertiesFontWeightRow } from "./editor/properties/font-weight-row";
import { installEditorPropertiesTransformRow } from "./editor/properties/transform-row";
import { installEditorPropertiesAlignmentRow } from "./editor/properties/alignment-row";
import { installEditorPropertiesFontFamilyRow } from "./editor/properties/font-family-row";
import { installEditorPropertiesColorRow } from "./editor/properties/color-row";
import { installEditorPropertiesInspectorField } from "./editor/properties/inspector-field";
import { installEditorComponentsAttributePropsPanel } from "./editor/components/attribute-props-panel";
import { installEditorComponentsTypeInference } from "./editor/components/type-inference";
import { installEditorComponentsDeclarationResolver } from "./editor/components/declaration-resolver";
import { installEditorComponentsTypeInferenceWorker } from "./editor/components/type-inference-worker";
import { installEditorComponentsInferredMetadata } from "./editor/components/inferred-metadata";
import { installEditorMediaObjectCrop } from "./editor/media/object-crop";
import { installEditorSessionElementState } from "./editor/session/element-state";
import { installEditorSessionArtboardState } from "./editor/session/artboard-state";
import { installEditorMediaPlaybackControls } from "./editor/media/playback-controls";
import { installEditorPropertiesBoxLayout } from "./editor/properties/box-layout";
import { installEditorPropertiesLayoutSection } from "./editor/properties/layout-section";
import { installEditorPropertiesAppearanceSection } from "./editor/properties/appearance-section";
import { installEditorInspectorAnnotation } from "./editor/inspector/annotation";
import { installEditorInspectorClassTargets } from "./editor/inspector/class-targets";
import { installEditorCodePropertyCode } from "./editor/code/property-code";
import { installEditorCodeInspectorCodePanel } from "./editor/code/inspector-code-panel";
import { installEditorChromeInspectorSheet } from "./editor/chrome/inspector-sheet";
import { installEditorInspectorArtboardGuides } from "./editor/inspector/artboard-guides";
import { installEditorInspectorArtboardRadius } from "./editor/inspector/artboard-radius";
import { installEditorSessionStripPopups } from "./editor/session-strip/popups";
import { installEditorSessionStripText } from "./editor/session-strip/text";
import { installEditorSessionStripSelectionActions } from "./editor/session-strip/selection-actions";
import { installEditorTypographySpacing } from "./editor/typography/spacing";
import { installEditorTypographyStyleSelect } from "./editor/typography/style-select";
import { installEditorTextListState } from "./editor/text/list-state";
import { installEditorTypographyMetrics } from "./editor/typography/metrics";
import { installEditorTypographySessionModel } from "./editor/typography/session-model";
import { installEditorSessionTouchAndHistory } from "./editor/session/touch-and-history";
import { installEditorInspectorPopoverPosition } from "./editor/inspector/popover-position";
import { installEditorInspectorColorPick } from "./editor/inspector/color-pick";
import { installEditorSessionTypingQuiet } from "./editor/session/typing-quiet";
import { installEditorModelSelectionRelocation } from "./editor/model/selection-relocation";
import { installEditorTextPlaceholder } from "./editor/text/placeholder";
import { installEditorModelAdoption } from "./editor/model/adoption";
import { installEditorLayoutGroupCapture } from "./editor/layout/group-capture";
import { installEditorLayoutGrouping } from "./editor/layout/grouping";
import { installEditorLayoutUngrouping } from "./editor/layout/ungrouping";
import { installEditorSelectionTreeNavigation } from "./editor/selection/tree-navigation";
import { installEditorSelectionNudge } from "./editor/selection/nudge";
import { installEditorSelectionStacking } from "./editor/selection/stacking";
import { installEditorComponentsDetach } from "./editor/components/detach";
import { installEditorInsertImageTransfer } from "./editor/insert/image-transfer";
import { installEditorMediaImageReplacement } from "./editor/media/image-replacement";
import { installEditorLayoutMoveElements } from "./editor/layout/move-elements";
import { installEditorInspectorEditor } from "./editor/inspector/editor";
import { installEditorInspectorArtboard } from "./editor/inspector/artboard";
import { installEditorInspectorHelp } from "./editor/inspector/help";
import { installEditorChromeToolSelector } from "./editor/chrome/tool-selector";
import { installEditorTools } from "./editor/tools";
import { installEditorPropertiesPanel } from "./editor/properties-panel";
import { installEditorSession } from "./editor/session";
import { installCanvasArtboardFocus } from "./canvas/artboard-focus";
import { installCanvasArtboardTweaks } from "./canvas/artboard-tweaks";
import { installCanvasSelectionChrome } from "./canvas/selection-chrome";
import { installPropertiesQuickPanels } from "./properties/quick-panels";
import { installPropertiesQuickPanelBindings } from "./properties/quick-panel-bindings";
import { installAssetsImagePreviews } from "./assets/image-previews";
import { installEditorHistoryOwnership } from "./editor/history-ownership";
import { installEditorPrimaryModifier } from "./editor/primary-modifier";
import { installCanvasFrameEnvironment } from "./canvas/frame-environment";
import { installGeometryInsertionTransform } from "./geometry/insertion-transform";
import { installCommentsAnchorCodec } from "./comments/anchor-codec";
import { installCommentsHostController } from "./comments/host-controller";
import { installCommentsFeedbackPanel } from "./comments/feedback-panel";
import { installCommentsPageSurfaces } from "./comments/page-surfaces";
import { installCanvasFrameReadiness } from "./canvas/frame-readiness";
import { installCanvasContextPublisher } from "./canvas/context-publisher";
import { installCanvasArtboardErrors } from "./canvas/artboard-errors";
import { installCanvasContentSnapshots } from "./canvas/content-snapshots";
import { installCanvasBootScheduler } from "./canvas/boot-scheduler";
import { installCanvasCompilationCache } from "./canvas/compilation-cache";
import { installCanvasArtboardFrame } from "./canvas/artboard-frame";
import { installCanvasLayoutGuides } from "./canvas/layout-guides";
import { installCommentsAreaDrawing } from "./comments/area-drawing";
import { installCommentsPointer } from "./comments/pointer";
import { installCanvasPageOperations } from "./canvas/page-operations";
import { installCanvasSpacePan } from "./canvas/space-pan";
import { installCanvasKeyboardActivation } from "./canvas/keyboard-activation";
import { installCommentsCanvasController } from "./comments/canvas-controller";
import { installCanvasDeferredClick } from "./canvas/deferred-click";
import { installGeometrySelectionTransform } from "./geometry/selection-transform";
import { installPropertiesSelectionQuickActions } from "./properties/selection-quick-actions";
import { installPropertiesAnnotationQuickActions } from "./properties/annotation-quick-actions";
import { installCanvasHeaderTheme } from "./canvas/header-theme";
import { installCanvasPastePlacement } from "./canvas/paste-placement";
import { installCanvasQuickActionKeys } from "./canvas/quick-action-keys";
import { installExportArtboardMenu } from "./export/artboard-menu";
import { installCanvasInteractionGeometry } from "./canvas/interaction-geometry";
import { installCanvasFocusOverlay } from "./canvas/focus-overlay";
import { installCanvasPlacementGhost } from "./canvas/placement-ghost";
import { installCanvasHitTesting } from "./canvas/hit-testing";
import { installGeometryCanvasSnapping } from "./geometry/canvas-snapping";
import { installCanvasInteractionLayer } from "./canvas/interaction-layer";
import { installCanvasChrome } from "./canvas/chrome";
import { installCanvasCreationPrompt } from "./canvas/creation-prompt";
import { installCanvasCreationProgress } from "./canvas/creation-progress";
import { installExportStoredZip } from "./export/stored-zip";
import { installExportUploadedAssets } from "./export/uploaded-assets";
import { installExportReadme } from "./export/readme";
import { installExportStandaloneBootstrap } from "./export/standalone-bootstrap";
import { installExportStandaloneHtml } from "./export/standalone-html";
import { installExportCssAssets } from "./export/css-assets";
import { installExportCompressionIntegrity } from "./export/compression-integrity";
import { installExportAssetResolver } from "./export/asset-resolver";
import { installExportFontUsage } from "./export/font-usage";
import { installExportStaticArtboard } from "./export/static-artboard";
import { installExportHtmlProducer } from "./export/html-producer";
import { installCanvasClaudeHandoff } from "./canvas/claude-handoff";
import { installCanvasErrorPrompt } from "./canvas/error-prompt";
import { installCanvasErrorNotices } from "./canvas/error-notices";
import { installCanvasErrorReporting } from "./canvas/error-reporting";
import { installFindBar } from "./find/bar";
import { installFindController } from "./find/controller";
import { installFindTextRanges } from "./find/text-ranges";
import { installFindHighlights } from "./find/highlights";
import { installCanvasPlaceLink } from "./canvas/place-link";
import { installCanvasNavigation } from "./canvas/navigation";
import { installCanvasDialogs } from "./canvas/dialogs";
import { installCanvasZoom } from "./canvas/zoom";
import { installExportCapture } from "./export/capture";
import { installExportHostRegistry } from "./export/host-registry";
import { installExportPicker } from "./export/picker";
import { installCanvasEmptyNotice } from "./canvas/empty-notice";
import { installCanvasKeyboardFocus } from "./canvas/keyboard-focus";
import { installFindScrollReveal } from "./find/scroll-reveal";
import { installFindCanvasAdapter } from "./find/canvas-adapter";
import { installCanvasKeyRouting } from "./canvas/key-routing";
import { installFindNavigationOrigin } from "./find/navigation-origin";
import { installCanvasKeyboardNavigation } from "./canvas/keyboard-navigation";
import { installCanvasPhoneVisibility } from "./canvas/phone-visibility";
import { installCanvasManifestHistory } from "./canvas/manifest-history";
import { installAssetsImagePlacement } from "./assets/image-placement";
import { installCanvasDesignCanvas } from "./canvas/design-canvas";
import { installCanvasLoadState } from "./canvas/load-state";
import { installApplicationDocumentRoot } from "./application/document-root";
import { installApplicationDesignCover } from "./application/design-cover";
import { installPlatformFilesFallback } from "./platform/files-fallback";
import { installPlatformDesignMetrics } from "./platform/design-metrics";
import { installPlatformWriteAccess } from "./platform/write-access";
import { installPlatformDatabaseAdapter } from "./platform/database-adapter";
import { installPlatformSyncHealth } from "./platform/sync-health";
import { installPlatformLiveDocument } from "./platform/live-document";
import { installPlatformThumbnail } from "./platform/thumbnail";
import { installApplicationBootstrap } from "./application/bootstrap";
import { installPlatformIndexMerge } from "./platform/index-merge";
import { installPlatformIndexState } from "./platform/index-state";
import { installPlatformBootReader } from "./platform/boot-reader";
import { installPlatformFilesPublisher } from "./platform/files-publisher";
import { installPlatformCrashStash } from "./platform/crash-stash";
import { installPlatformSaveNotices } from "./platform/save-notices";
import { installPlatformHotDebugger } from "./platform/hot-debugger";
import { installPlatformSnapshotDatabase } from "./platform/snapshot-database";
import { installPlatformDesignFilesPort } from "./platform/design-files-port";
import { installPlatformDesignIndex } from "./platform/design-index";
import { installPlatformFilesDesignDocument } from "./platform/files-design-document";
import { installPlatformDatabaseCodec } from "./platform/database-codec";
import { installPlatformDatabaseConversion } from "./platform/database-conversion";
import { installApplicationDesignBootstrap } from "./application/design-bootstrap";
import { installFastEditSamplingCapability } from "./fast-edit/sampling-capability";
import { installFastEditSandbox } from "./fast-edit/sandbox";
import { installFastEditSandboxAdapter } from "./fast-edit/sandbox-adapter";
import { installFastEditDraftPreviews } from "./fast-edit/draft-previews";
import { installFastEditDraftChannel } from "./fast-edit/draft-channel";
import { installFastEditDebugStore } from "./fast-edit/debug-store";
import { installFastEditDebugPanel } from "./fast-edit/debug-panel";
import { installFastEditTemplateValidation } from "./fast-edit/template-validation";
import { installFastEditStaticPreview } from "./fast-edit/static-preview";
import { installFastEditOutcomeMetrics } from "./fast-edit/outcome-metrics";
import { installFastEditArtboardOperations } from "./fast-edit/artboard-operations";
import { installFastEditUntrustedContent } from "./fast-edit/untrusted-content";
import { installFastEditHistory } from "./fast-edit/history";
import { installFastEditPromptContext } from "./fast-edit/prompt-context";
import { installFastEditJournal } from "./fast-edit/journal";
import { installFastEditWriteScheduler } from "./fast-edit/write-scheduler";
import { installFastEditPageStyle } from "./fast-edit/page-style";
import { installFastEditStatementParser } from "./fast-edit/statement-parser";
import { installFastEditCanvasSpaces } from "./fast-edit/canvas-spaces";
import { installFastEditDomProbes } from "./fast-edit/dom-probes";
import { installFastEditSession } from "./fast-edit/session";
import { installFastEditElementTargets } from "./fast-edit/element-targets";
import { installFastEditRequest } from "./fast-edit/request";
import { installFastEditApplication } from "./fast-edit/application";
import { installFastEditController } from "./fast-edit/controller";
import { installFastEditComposer } from "./fast-edit/composer";
import { installFastEditSystemPrompts } from "./fast-edit/system-prompts";
import { installFastEditBootstrap } from "./fast-edit/bootstrap";
import { installApplicationMain } from "./application/main";

/** Preserve hoisting, live bindings, and initialization order from the shipped IIFE. */
export function createDesignRuntime(
  options: { boot?: boolean } = {},
): void {
  installDependencies();
  const initializers = [
    installModuleHelpers(),
    installCdsPlatformFeatureLoader(),
    installCdsHooksLayoutEffect(),
    installCdsThemeExperimentalTheme(),
    installCdsThemeClassNames(),
    installCdsPlatformRuntime(),
    installCdsLinks(),
    installCdsDomOwnerWindow(),
    installCdsDomInputObservation(),
    installCdsOverlaysAndroidCloseWatcher(),
    installCdsSheetsGesturePhysics(),
    installCdsSheetsLayout(),
    installCdsHooksMediaQuery(),
    installCdsHooksStableCallback(),
    installCdsSheetsKeyboardViewport(),
    installCdsSheetsPresentation(),
    installCdsOverlaysImperativeHandle(),
    installCdsDomInert(),
    installCdsSheetsPopupStack(),
    installCdsPlatformReducedMotion(),
    installCdsSheetsStyles(),
    installCdsSheetsChrome(),
    installCdsOverlaysLayers(),
    installCdsDomRefComposition(),
    installCdsPlatformRootFontSize(),
    installCdsComponentsIcon(),
    installCdsThemeSurfaces(),
    installCdsMenuConfiguration(),
    installCdsSheetsScrollArea(),
    installCdsMenuPopup(),
    installCdsMenuPassiveOpenGate(),
    installCdsMenuItemStyles(),
    installCdsSheetsMenuPopup(),
    installCdsSheetsLazyLoader(),
    installCdsThemeRoot(),
    installCdsThemeTokens(),
    installCdsDomSelectionPrevention(),
    installCdsEditorSelectionGeometry(),
    installCdsEditorAlignmentGuides(),
    installCdsComponentsShortcut(),
    installCdsComponentsShrinkWrap(),
    installCdsTooltipTrigger(),
    installCdsTooltipDisabledReason(),
    installCdsTooltipStyles(),
    installCdsTooltipTooltip(),
    installCdsComponentsCollapsible(),
    installCdsComponentsSpinner(),
    installCdsTooltipDeferredProvider(),
    installCdsButtonContext(),
    installCdsButtonButton(),
    installCdsComponentsSkeleton(),
    installCdsComponentsSurface(),
    installCdsComponentsCheckbox(),
    installCdsFieldContext(),
    installCdsComponentsTextInput(),
    installCdsOverlaysBackdrop(),
    installCdsMenuMenu(),
    installCdsPopoverPopover(),
    installCdsComponentsTextArea(),
    installCdsComponentsBadge(),
    installCdsComponentsCounter(),
    installCdsComponentsTextLink(),
    installCdsDialogDialog(),
    installCdsButtonGroup(),
    installCdsComboboxCombobox(),
    installCdsSwitchContext(),
    installCdsComponentsSwitch(),
    installCdsComponentsRadioGroup(),
    installCdsComponentsSelectionPoints(),
    installCdsComponentsSelectionRing(),
    installCdsComponentsNumberInput(),
    installCdsTabsTabs(),
    installCdsToastToast(),
    installCdsFieldField(),
    installCdsIndex(),
    installPlatformTheme(),
    installPlatformCdsIsland(),
    installEditorAttributeValidation(),
    installEditorInspectorContext(),
    installEditorInspectorLinkPopover(),
    installPlatformHotReload(),
    installPlatformReactRuntime(),
    installEditorChromeTheme(),
    installEditorChromeOverlayState(),
    installEditorChromeFocus(),
    installEditorChromePopover(),
    installEditorChromeMenuItem(),
    installEditorChromeContextMenu(),
    installEditorChromeToast(),
    installPlatformHostCapabilities(),
    installPlatformPublish(),
    installPlatformDocumentTheme(),
    installPlatformDocumentCompilation(),
    installPlatformComments(),
    installPlatformEmulator(),
    installPlatformImageProcessing(),
    installPlatformImageUpload(),
    installPlatformBlobCache(),
    installPlatformEditCount(),
    installPlatformDatabaseDocumentStore(),
    installPlatformDatabaseRuntime(),
    installPlatformUserCapabilities(),
    installPlatformDocumentStash(),
    installPlatformDocumentStore(),
    installPlatformProjectPaths(),
    installPlatformSha256(),
    installPlatformFileContent(),
    installPlatformCssSanitization(),
    installPlatformLinkNavigation(),
    installPlatformRateLimiter(),
    installExportDomSnapshot(),
    installExportDownloads(),
    installExportSettlement(),
    installExportFileNames(),
    installExportReadingOrder(),
    installExportCaptureStyle(),
    installExportAnimationSnapshot(),
    installExportCaptureTextMetrics(),
    installExportCaptureSelection(),
    installExportCaptureText(),
    installExportCaptureLayout(),
    installExportCaptureFlow(),
    installExportCapturePagination(),
    installExportCaptureFonts(),
    installExportCaptureAssets(),
    installExportCaptureRuntime(),
    installExportCaptureScript(),
    installPreviewEvaluation(),
    installEditorAccessibilityAnnouncer(),
    installEditorColorContrast(),
    installEditorColorOklch(),
    installEditorColorContrastCopy(),
    installEditorColorContrastUi(),
    installEditorColorPickerPrimitives(),
    installEditorColorPicker(),
    installEditorInspectorComputedData(),
    installEditorTypographyCensusStore(),
    installCanvasViewportMemory(),
    installPlatformHealthAndAnalytics(),
    installExportPdfJpeg(),
    installExportPdfLossless(),
    installExportPdfWinansi(),
    installExportPdfUnicodeFont(),
    installExportPdfTextEncoding(),
    installExportPdfTextOperators(),
    installExportPdfFigureOperators(),
    installExportPdfLinkAnnotations(),
    installExportPdfLanguage(),
    installExportPdfStructure(),
    installExportPdfOutline(),
    installExportPdfDocument(),
    installExportAnalytics(),
    installExportOutcomes(),
    installExportPaperAndScale(),
    installExportWarnings(),
    installExportDelivery(),
    installExportCaptureViewport(),
    installExportCaptureWarnings(),
    installExportImage(),
    installExportPdfCapture(),
    installPlatformDocumentValues(),
    installPlatformCommentDocuments(),
    installDesignSystemPaths(),
    installDesignSystemInstalledSystems(),
    installPlatformFileReferences(),
    installDesignSystemPublishedFiles(),
    installDesignSystemFileOverlay(),
    installPlatformExternalFiles(),
    installDesignSystemTypeDeclarations(),
    installDesignSystemTokenParsing(),
    installDesignSystemTypographyParsing(),
    installDesignSystemStore(),
    installPlatformDesignSource(),
    installPlatformStorageMigration(),
    installEditorChromePendingToasts(),
    installPlatformReopenAnnouncement(),
    installPlatformAccessRetry(),
    installPlatformFilesHotReload(),
    installPlatformMigrationState(),
    installPlatformMigrationInput(),
    installPlatformTombstoneActions(),
    installPlatformDesignDocumentAdapter(),
    installPlatformIdleScheduler(),
    installEditorChromeSaveStatus(),
    installEditorSelectionHost(),
    installPlatformSaveEvents(),
    installCollaborationPeerCursors(),
    installCollaborationPresenceComposer(),
    installCollaborationPeerSelections(),
    installEditorTemplateExpressions(),
    installEditorHtmlTagNormalization(),
    installEditorTypographyFontCatalog(),
    installEditorCssDeclarations(),
    installEditorCssRules(),
    installEditorCssInheritance(),
    installEditorCssValues(),
    installEditorTypographyFontFamily(),
    installEditorCssTransforms(),
    installEditorCssShorthand(),
    installEditorCssGrid(),
    installEditorInspectorPropertySchema(),
    installEditorSvgArrows(),
    installEditorComponentsImports(),
    installEditorComponentsProps(),
    installEditorComponentsTextEdits(),
    installEditorHtmlAuthoring(),
    installEditorModelDomText(),
    installEditorModelLabels(),
    installEditorModelDcEditorModel(),
    installEditorModelDirectives(),
    installEditorHtmlEscaping(),
    installEditorTypographyFontVariants(),
    installEditorSvgArrowProperties(),
    installEditorInspectorStyleMetadata(),
    installEditorInspectorElement(),
    installEditorInspectorSelection(),
    installEditorTypographyCensus(),
    installEditorHtmlDcDocument(),
    installEditorHtmlDcProps(),
    installEditorUndoHistory(),
    installEditorSelectionCanvasSelection(),
    installEditorSelectionActions(),
    installEditorLayoutInsets(),
    installEditorClipboardHtmlSanitization(),
    installEditorClipboardLayoutSnapshots(),
    installEditorLayoutFrozenStyle(),
    installEditorSelectionElementOrder(),
    installEditorClipboardTemplateFlattening(),
    installEditorInsertTargets(),
    installEditorUndoElements(),
    installEditorCssEditValidation(),
    installEditorPickerHiddenTags(),
    installEditorGeometrySnapping(),
    installEditorGeometryResize(),
    installEditorGeometryRotation(),
    installEditorGeometryPen(),
    installEditorSvgDrawing(),
    installEditorPickerRuntimeScript(),
    installEditorPickerBridge(),
    installEditorPickerInspection(),
    installCanvasPreviewMounting(),
    installCanvasViewportStore(),
    installCollaborationSelectionPaths(),
    installEditorSessionErrors(),
    installCanvasDesktopRefresh(),
    installEditorTypographyGoogleFonts(),
    installCanvasPreviewNavigation(),
    installPreviewRuntimeLoading(),
    installPreviewAssetRewriting(),
    installPreviewHtmlScanner(),
    installPreviewCssRewriting(),
    installPreviewDependencyInjection(),
    installPreviewBlobPaths(),
    installPreviewComponentImports(),
    installPreviewDependencyGraph(),
    installPreviewBuildDocument(),
    installPreviewModuleCache(),
    installPlatformFeatureFlags(),
    installPreviewAddressedArtboards(),
    installPreviewProjectRoot(),
    installEditorClipboardNative(),
    installEditorClipboardState(),
    installEditorKeyboardShortcuts(),
    installEditorLinksNavigation(),
    installEditorNotesInlineMarkdown(),
    installEditorNotesBlocks(),
    installEditorNotesDom(),
    installEditorNotesFormatting(),
    installEditorStyleSchemaNodeTypes(),
    installEditorStyleSchemaValues(),
    installEditorStyleSchemaValidation(),
    installEditorStyleSchemaColorAndFont(),
    installEditorStyleSchemaShadow(),
    installEditorStyleSchemaGradient(),
    installEditorStyleSchemaStructuredValues(),
    installEditorStyleSchemaCss(),
    installEditorClipboardImageValidation(),
    installEditorClipboardArtboards(),
    installEditorClipboardAnnotations(),
    installEditorClipboardAssets(),
    installEditorClipboardPictures(),
    installEditorClipboardPastePlanning(),
    installEditorClipboardFileTransfer(),
    installExportDeliveryUi(),
    installEditorClipboardTrustDialog(),
    installExportPdfOrchestration(),
    installEditorKeyboardEditActions(),
    installEditorChromeScrollbar(),
    installEditorChromeToolIcons(),
    installEditorKeyboardFind(),
    installEditorKeyboardPaste(),
    installEditorInspectorModes(),
    installEditorOutlineGlyphs(),
    installEditorOutlineRename(),
    installEditorOutlineTree(),
    installEditorOutlineDcOutline(),
    installEditorOutlineNativeMenu(),
    installEditorOutlineAnnotations(),
    installEditorEventsRuntime(),
    installEditorModelFileEchoes(),
    installEditorModelPendingProps(),
    installEditorModelPublishing(),
    installEditorModelThreeWayMerge(),
    installEditorModelHistoryRebase(),
    installEditorModelModelState(),
    installEditorModelUseDcModel(),
    installEditorComponentsPropCache(),
    installEditorComponentsPropValidation(),
    installEditorComponentsUseDcProps(),
    installEditorTextDeferredInput(),
    installEditorTextTypingTarget(),
    installEditorInsertFileDrops(),
    installEditorClipboardHtmlPlacement(),
    installEditorMediaCropGeometry(),
    installEditorInsertElementKinds(),
    installEditorInsertDropTargets(),
    installEditorMediaVideoUpload(),
    installCanvasWorkingLabelAnimation(),
    installPlatformClaudeActivity(),
    installCanvasWorkingState(),
    installEditorAccessibilityAnnouncements(),
    installEditorClipboardWorkingFiles(),
    installEditorClipboardPngCopy(),
    installEditorClipboardSvgCopy(),
    installEditorVectorToolState(),
    installCanvasPanZoom(),
    installCanvasFocus(),
    installCanvasArtboardResize(),
    installEditorNotesAutoformat(),
    installEditorNotesLinkEditing(),
    installCanvasNote(),
    installCanvasMeasurements(),
    installPlatformFrameHostBridge(),
    installEditorToolbarPrimitives(),
    installEditorToolbarLayout(),
    installEditorToolbarSaveStatus(),
    installEditorToolbarScroller(),
    installEditorToolbarPublishControls(),
    installEditorToolbarToolbar(),
    installCanvasPendingArtboards(),
    installCanvasPictureDropGhost(),
    installEditorHooksLatestCallback(),
    installEditorVectorPathEditing(),
    installEditorVectorUseVectorEditor(),
    installEditorVectorPathControls(),
    installEditorVectorPathParsing(),
    installEditorVectorPathEditor(),
    installEditorVectorAnnotationPenEditor(),
    installEditorVectorElementPenEditor(),
    installEditorMediaVideoPlayback(),
    installEditorSvgLayout(),
    installEditorGeometryFlipElements(),
    installEditorGeometryFlipAnnotations(),
    installCanvasImageDecodeScheduler(),
    installCanvasAnnotationShapeStyle(),
    installCanvasShape(),
    installEditorHooksAlternateCursor(),
    installEditorSvgArrowEditing(),
    installEditorHooksElementAndDismissal(),
    installEditorCodeScriptLiterals(),
    installEditorCodeDesignColorTokens(),
    installEditorChromeUnsavedEditsDialog(),
    installEditorFeedbackAttachments(),
    installEditorCodeUnifiedDiff(),
    installEditorInspectorContextPart2(),
    installEditorPropertiesPrimitives(),
    installEditorPropertiesRow(),
    installEditorPropertiesSection(),
    installEditorPropertiesTooltip(),
    installEditorPropertiesToolOptions(),
    installEditorPropertiesNumericScrubber(),
    installEditorPropertiesNumericInput(),
    installEditorPropertiesPickerSearch(),
    installEditorPropertiesSelect(),
    installEditorPropertiesGradientEditor(),
    installEditorPropertiesColorSwatches(),
    installEditorPropertiesColorPicker(),
    installEditorPropertiesRows(),
    installEditorComponentsPropEditors(),
    installEditorComponentsPropsPanel(),
    installEditorChromeRoot(),
    installEditorChromePanelShell(),
    installEditorChromePanelWidth(),
    installEditorChromeResizeGrip(),
    installEditorChromePanelClose(),
    installEditorPropertiesSegments(),
    installEditorPropertiesSides(),
    installEditorMediaCropEditor(),
    installEditorSessionStripPointerState(),
    installEditorSessionStripSessionStrip(),
    installEditorSessionStripReveal(),
    installEditorChromeLoading(),
    installCollaborationPeerBadge(),
    installEditorSessionStripPopover(),
    installEditorPropertiesEffectPopup(),
    installEditorPropertiesStyleBag(),
    installEditorPropertiesEffectsSection(),
    installEditorPropertiesShadowEffects(),
    installEditorPropertiesLiveScrub(),
    installEditorPropertiesCssEffects(),
    installEditorPropertiesDropShadowEditor(),
    installEditorPropertiesTokenColorPicker(),
    installEditorPropertiesAssetPicker(),
    installEditorCssGradients(),
    installEditorPropertiesBackgroundEditor(),
    installEditorPropertiesShadowRow(),
    installEditorPropertiesSizingRow(),
    installEditorPropertiesInheritedField(),
    installEditorPropertiesCssNumberRow(),
    installEditorPropertiesGridRow(),
    installEditorPropertiesCssValueRow(),
    installEditorPropertiesFontWeightRow(),
    installEditorPropertiesTransformRow(),
    installEditorPropertiesAlignmentRow(),
    installEditorPropertiesFontFamilyRow(),
    installEditorPropertiesColorRow(),
    installEditorPropertiesInspectorField(),
    installEditorComponentsAttributePropsPanel(),
    installEditorComponentsTypeInference(),
    installEditorComponentsDeclarationResolver(),
    installEditorComponentsTypeInferenceWorker(),
    installEditorComponentsInferredMetadata(),
    installEditorMediaObjectCrop(),
    installEditorSessionElementState(),
    installEditorSessionArtboardState(),
    installEditorMediaPlaybackControls(),
    installEditorPropertiesBoxLayout(),
    installEditorPropertiesLayoutSection(),
    installEditorPropertiesAppearanceSection(),
    installEditorInspectorAnnotation(),
    installEditorInspectorClassTargets(),
    installEditorCodePropertyCode(),
    installEditorCodeInspectorCodePanel(),
    installEditorChromeInspectorSheet(),
    installEditorInspectorArtboardGuides(),
    installEditorInspectorArtboardRadius(),
    installEditorSessionStripPopups(),
    installEditorSessionStripText(),
    installEditorSessionStripSelectionActions(),
    installEditorTypographySpacing(),
    installEditorTypographyStyleSelect(),
    installEditorTextListState(),
    installEditorTypographyMetrics(),
    installEditorTypographySessionModel(),
    installEditorSessionTouchAndHistory(),
    installEditorInspectorPopoverPosition(),
    installEditorInspectorColorPick(),
    installEditorSessionTypingQuiet(),
    installEditorModelSelectionRelocation(),
    installEditorTextPlaceholder(),
    installEditorModelAdoption(),
    installEditorLayoutGroupCapture(),
    installEditorLayoutGrouping(),
    installEditorLayoutUngrouping(),
    installEditorSelectionTreeNavigation(),
    installEditorSelectionNudge(),
    installEditorSelectionStacking(),
    installEditorComponentsDetach(),
    installEditorInsertImageTransfer(),
    installEditorMediaImageReplacement(),
    installEditorLayoutMoveElements(),
    installEditorInspectorEditor(),
    installEditorInspectorArtboard(),
    installEditorInspectorHelp(),
    installEditorChromeToolSelector(),
    installEditorTools(),
    installEditorPropertiesPanel(),
    installEditorSession(),
    installCanvasArtboardFocus(),
    installCanvasArtboardTweaks(),
    installCanvasSelectionChrome(),
    installPropertiesQuickPanels(),
    installPropertiesQuickPanelBindings(),
    installAssetsImagePreviews(),
    installEditorHistoryOwnership(),
    installEditorPrimaryModifier(),
    installCanvasFrameEnvironment(),
    installGeometryInsertionTransform(),
    installCommentsAnchorCodec(),
    installCommentsHostController(),
    installCommentsFeedbackPanel(),
    installCommentsPageSurfaces(),
    installCanvasFrameReadiness(),
    installCanvasContextPublisher(),
    installCanvasArtboardErrors(),
    installCanvasContentSnapshots(),
    installCanvasBootScheduler(),
    installCanvasCompilationCache(),
    installCanvasArtboardFrame(),
    installCanvasLayoutGuides(),
    installCommentsAreaDrawing(),
    installCommentsPointer(),
    installCanvasPageOperations(),
    installCanvasSpacePan(),
    installCanvasKeyboardActivation(),
    installCommentsCanvasController(),
    installCanvasDeferredClick(),
    installGeometrySelectionTransform(),
    installPropertiesSelectionQuickActions(),
    installPropertiesAnnotationQuickActions(),
    installCanvasHeaderTheme(),
    installCanvasPastePlacement(),
    installCanvasQuickActionKeys(),
    installExportArtboardMenu(),
    installCanvasInteractionGeometry(),
    installCanvasFocusOverlay(),
    installCanvasPlacementGhost(),
    installCanvasHitTesting(),
    installGeometryCanvasSnapping(),
    installCanvasInteractionLayer(),
    installCanvasChrome(),
    installCanvasCreationPrompt(),
    installCanvasCreationProgress(),
    installExportStoredZip(),
    installExportUploadedAssets(),
    installExportReadme(),
    installExportStandaloneBootstrap(),
    installExportStandaloneHtml(),
    installExportCssAssets(),
    installExportCompressionIntegrity(),
    installExportAssetResolver(),
    installExportFontUsage(),
    installExportStaticArtboard(),
    installExportHtmlProducer(),
    installCanvasClaudeHandoff(),
    installCanvasErrorPrompt(),
    installCanvasErrorNotices(),
    installCanvasErrorReporting(),
    installFindBar(),
    installFindController(),
    installFindTextRanges(),
    installFindHighlights(),
    installCanvasPlaceLink(),
    installCanvasNavigation(),
    installCanvasDialogs(),
    installCanvasZoom(),
    installExportCapture(),
    installExportHostRegistry(),
    installExportPicker(),
    installCanvasEmptyNotice(),
    installCanvasKeyboardFocus(),
    installFindScrollReveal(),
    installFindCanvasAdapter(),
    installCanvasKeyRouting(),
    installFindNavigationOrigin(),
    installCanvasKeyboardNavigation(),
    installCanvasPhoneVisibility(),
    installCanvasManifestHistory(),
    installAssetsImagePlacement(),
    installCanvasDesignCanvas(),
    installCanvasLoadState(),
    installApplicationDocumentRoot(),
    installApplicationDesignCover(),
    installPlatformFilesFallback(),
    installPlatformDesignMetrics(),
    installPlatformWriteAccess(),
    installPlatformDatabaseAdapter(),
    installPlatformSyncHealth(),
    installPlatformLiveDocument(),
    installPlatformThumbnail(),
    installApplicationBootstrap(),
    installPlatformIndexMerge(),
    installPlatformIndexState(),
    installPlatformBootReader(),
    installPlatformFilesPublisher(),
    installPlatformCrashStash(),
    installPlatformSaveNotices(),
    installPlatformHotDebugger(),
    installPlatformSnapshotDatabase(),
    installPlatformDesignFilesPort(),
    installPlatformDesignIndex(),
    installPlatformFilesDesignDocument(),
    installPlatformDatabaseCodec(),
    installPlatformDatabaseConversion(),
    installApplicationDesignBootstrap(),
    installFastEditSamplingCapability(),
    installFastEditSandbox(),
    installFastEditSandboxAdapter(),
    installFastEditDraftPreviews(),
    installFastEditDraftChannel(),
    installFastEditDebugStore(),
    installFastEditDebugPanel(),
    installFastEditTemplateValidation(),
    installFastEditStaticPreview(),
    installFastEditOutcomeMetrics(),
    installFastEditArtboardOperations(),
    installFastEditUntrustedContent(),
    installFastEditHistory(),
    installFastEditPromptContext(),
    installFastEditJournal(),
    installFastEditWriteScheduler(),
    installFastEditPageStyle(),
    installFastEditStatementParser(),
    installFastEditCanvasSpaces(),
    installFastEditDomProbes(),
    installFastEditSession(),
    installFastEditElementTargets(),
    installFastEditRequest(),
    installFastEditApplication(),
    installFastEditController(),
    installFastEditComposer(),
    installFastEditSystemPrompts(),
    installFastEditBootstrap(),
    installApplicationMain(),
  ];
  for (let index = 0; index < initializers.length; index++) {
    if (options.boot === false && index === initializers.length - 1) continue;
    initializers[index]!();
  }
}
