import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
import type * as React from "react";
import type * as Preview from "../../contracts/preview";
import type * as Model from "../../contracts";
/** Restored application module; prepare first, initialize in original order. */
import { loadJsxNamespace, loadReactNamespace } from "../../dependencies";
import { claudeDeliveryStatusMessage } from "../../editor/claude-prompts";
import { UNCOMMENTABLE_PROPS } from "../../editor/comment-anchors";
import { FileDropZone } from "../../editor/file-drop";
import { SectionSheet } from "../../editor/section-headers";
import { toModuleNamespace } from "../../module-helpers";
import { DisabledReasonTooltip } from "../../ui/avatars";
import { Button } from "../../ui/buttons";
import { Collapsible } from "../../ui/disclosure";
import { Icon } from "../../ui/interactions";
import { TextLink } from "../../ui/links";

var reactBrandUpload: typeof import("react");
var reactWelcome: typeof import("react");
var jsxWelcomeIcons: typeof import("react/jsx-runtime");
var WELCOME_ICON_PATHS: Record<"github", React.ReactElement>;
var jsxWelcome: typeof import("react/jsx-runtime");
var README_STARTER_TEXT: string;
var WELCOME_TYPE_REQUIRED_MESSAGE: string;
var WELCOME_OPTIONS: {
  github: [string, string];
  connect: [string, string, string];
  upload: [string, string, string];
};
var jsxBrandUpload: typeof import("react/jsx-runtime");
var BRAND_UPLOAD_TEXT: Preview.BrandUploadText;
var uploadedFileIdentityIds: WeakMap<File, number>;
var nextUploadedFileIdentityId: number;
function WelcomeIcon({
  name: name,
  size = 14,
  className: className,
}: Preview.WelcomeIconProps): React.ReactElement {
  useUiLocale();
  return (
    <svg
      viewBox={"0 0 16 16"}
      width={size}
      height={size}
      fill={"none"}
      stroke={"currentColor"}
      strokeWidth={"1.3"}
      strokeLinecap={"round"}
      strokeLinejoin={"round"}
      aria-hidden={"true"}
      className={className}
    >
      {WELCOME_ICON_PATHS[name]}
    </svg>
  );
}
function HandoffNotice({
  kind: kind,
  held: held,
  onCopy: onCopy,
  prompt: prompt,
}: Preview.HandoffNoticeProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      className={
        "ds-door-line flex flex-col gap-xs text-footnote text-secondary"
      }
      role={"status"}
      data-testid={"ds-handoff-note"}
    >
      {[<p>
          {kind === "failed" ? (<jsxWelcome.Fragment>
              {[claudeDeliveryStatusMessage("failed", held), " ", <TextLink
                  onClick={onCopy}
                  data-testid={"ds-handoff-copy"}
                >
                  {uiMessage("design-system.welcome.copyIt")}
                </TextLink>]}
            </jsxWelcome.Fragment>) : (claudeDeliveryStatusMessage(kind, held))}
        </p>, kind === "failed" && prompt !== undefined ? (
          <Collapsible.Root>
            {[<Collapsible.Trigger className={"w-fit text-secondary"}>
                {uiMessage("design-system.welcome.showTheRequest")}
              </Collapsible.Trigger>, <Collapsible.Panel keepMounted={true}>
                <pre
                  className={
                    "mt-xs max-h-48 overflow-auto rounded bg-surface-2 p-md font-mono text-caption whitespace-pre-wrap text-secondary select-all"
                  }
                  data-testid={"ds-handoff-prompt"}
                >
                  {prompt}
                </pre>
              </Collapsible.Panel>]}
          </Collapsible.Root>
        ) : null]}
    </div>
  );
}
function WelcomeSheet({
  onGithub: onGithub,
  onConnect: onConnect,
  onUpload: onUpload,
  busy: busy,
  note: note,
  panel: panel,
}: Preview.WelcomeSheetProps): React.ReactElement {
  useUiLocale();
  let ref = reactWelcome.useRef(false),
    optionsRef = reactWelcome.useRef<HTMLDivElement | null>(null);
  reactWelcome.useEffect(() => {
    if (panel === undefined && ref.current) {
      optionsRef.current
        ?.querySelector<HTMLElement>('[data-testid="ds-welcome-upload"]')
        ?.focus();
    }
    ref.current = panel !== undefined;
  }, [panel]);
  let sheetRef = reactWelcome.useRef<HTMLDivElement | null>(null),
    sheetPositionRef = reactWelcome.useRef<
      | {
          h: number;
          w: number;
        }
      | undefined
    >(undefined),
    [value, setOptionsOpen] = reactWelcome.useState(false);
  reactWelcome.useLayoutEffect(() => {
    if (panel === undefined && sheetRef.current !== null) {
      sheetPositionRef.current = {
        h: sheetRef.current.offsetHeight,
        w: sheetRef.current.offsetWidth,
      };
    }
  });
  let hasPanel = panel !== undefined;
  reactWelcome.useEffect(() => {
    setOptionsOpen(false);
    let current = sheetRef.current,
      previousPosition = sheetPositionRef.current;
    if (
      !hasPanel ||
      current === null ||
      previousPosition === undefined ||
      typeof ResizeObserver === "undefined"
    ) {
      return;
    }
    let observer = new ResizeObserver(() => {
      if (Math.abs(current.offsetWidth - previousPosition.w) > 1) {
        setOptionsOpen(true);
      }
    });
    observer.observe(current);
    return () => observer.disconnect();
  }, [hasPanel]);
  let callback = (
    testId: string,
    tone: string,
    content: React.ReactNode,
    label: string,
    extraLabel: string,
    onClick: ((trigger: HTMLButtonElement) => void) | undefined,
    allowWhenBusy: boolean = true,
  ) => {
    let disabledReason =
      onClick === undefined
        ? uiMessage("design-system.welcome.worksInADesignSystem")
        : allowWhenBusy && busy === true
          ? // MineDesign: user-facing copy calls the agent "the agent", not Claude.
            uiMessage("design-system.welcome.aRequestToTheAgent")
          : undefined;
    return (
      <DisabledReasonTooltip reason={disabledReason}>
        <button
          type={"button"}
          className={"ds-welcome-opt"}
          disabled={disabledReason !== undefined}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) =>
            onClick?.(event.currentTarget)
          }
          data-testid={testId}
        >
          {[<span
              className={"ds-welcome-icon ds-tone-" + tone}
              aria-hidden={"true"}
            >
              {content}
            </span>, <span className={"flex min-w-0 flex-col gap-0.5 text-left"}>
              {[<span className={"text-body font-medium text-primary"}>
                  {label}
                </span>, <span className={"text-body text-secondary"}>{extraLabel}</span>]}
            </span>]}
        </button>
      </DisabledReasonTooltip>
    );
  };
  return (
    <SectionSheet data-testid={"ds-welcome-sheet"}>
      <div
        ref={sheetRef}
        className={"ds-welcome flex flex-col gap-lg"}
        style={
          hasPanel && !value && sheetPositionRef.current !== undefined
            ? {
                minHeight: sheetPositionRef.current.h,
              }
            : undefined
        }
        data-testid={"ds-welcome"}
        {...UNCOMMENTABLE_PROPS}
      >
        {[panel ?? (
            <jsxWelcome.Fragment>
              {[<h2 className={"ds-welcome-title"}>
                  {uiMessage("design-system.welcome.notSureWhereToStart")}
                </h2>, <div className={"ds-welcome-options"} ref={optionsRef}>
                  {[callback(
                      "ds-welcome-github",
                      "green",
                      <WelcomeIcon name={"github"} size={20} />,
                      WELCOME_OPTIONS.github[0],
                      WELCOME_OPTIONS.github[1],
                      onGithub,
                    ), callback(
                      "ds-welcome-connect",
                      "clay",
                      <Icon
                        name={WELCOME_OPTIONS.connect[2]}
                        size={"md"}
                      />,
                      WELCOME_OPTIONS.connect[0],
                      WELCOME_OPTIONS.connect[1],
                      onConnect,
                    ), callback(
                      "ds-welcome-upload",
                      "blue",
                      <Icon
                        name={WELCOME_OPTIONS.upload[2]}
                        size={"md"}
                      />,
                      WELCOME_OPTIONS.upload[0],
                      WELCOME_OPTIONS.upload[1],
                      () => onUpload(),
                      false,
                    )]}
                </div>]}
            </jsxWelcome.Fragment>
          ), note]}
      </div>
    </SectionSheet>
  );
}
function EmptyDesignSystem(): React.ReactElement {
  useUiLocale();
  return (
    <SectionSheet>
      <div
        className={
          "ds-empty mx-auto flex max-w-md flex-col gap-sm px-lg py-16 text-center"
        }
        data-testid={"ds-empty"}
      >
        {[<h2 className={"ds-page-title"}>{uiMessage("design-system.welcome.justGettingStarted")}</h2>, <p className={"text-body text-secondary"}>
            {
              // MineDesign: user-facing copy calls the agent "the agent", not Claude.
              uiMessage("design-system.welcome.nothingHasBeenAddedTo")
            }
          </p>]}
      </div>
    </SectionSheet>
  );
}
function IntakeProgressDot(): React.ReactElement {
  useUiLocale();
  return (
    <span
      className={
        "ds-intake-dot size-2 shrink-0 animate-pulse rounded-full bg-fill-accent"
      }
      aria-hidden={"true"}
    />
  );
}
function IntakeProgressStatus({
  text: text,
  quiet = false,
}: Preview.IntakeProgressStatusProps): React.ReactElement {
  useUiLocale();
  return (
    <div
      className={
        "ds-intake-status sticky bottom-3 z-[3] mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-sm rounded-full bg-surface-panel px-lg py-sm text-footnote text-secondary shadow-panel" +
        (quiet ? " invisible" : "")
      }
      role={"status"}
      aria-live={"polite"}
      data-testid={"ds-intake-progress"}
      {...UNCOMMENTABLE_PROPS}
    >
      {[<IntakeProgressDot />, text]}
    </div>
  );
}
function brandUploadStatusText(intake: Preview.BrandUploadIntake): string {
  if (intake.busy) {
    return BRAND_UPLOAD_TEXT.adding;
  }
  if (intake.kept === 0) {
    return uiMessage("design-system.welcome.noneOfThemCouldBe");
  }
  let singular = intake.kept === 1;
  return (
    String(intake.kept) +
    (singular ? " file" : " files") +
    " added" +
    (intake.refused.length > 0
      ? " · " + String(intake.refused.length) + " couldn’t be kept"
      : "") +
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    ". Create the design system and the agent will draft from " +
    (singular ? uiMessage("design-system.welcome.thatFile") : "them") +
    "." +
    BRAND_UPLOAD_TEXT.save[intake.save]
  );
}
function uploadedFileIdentityId(file: File): number {
  let id = uploadedFileIdentityIds.get(file);
  if (id === undefined) {
    id = nextUploadedFileIdentityId++;
    uploadedFileIdentityIds.set(file, id);
  }
  return id;
}
function BrandUploadGrid({
  files: files,
  thumb: thumb,
  onRemove: onRemove,
  removeDisabledReason: removeDisabledReason,
  testid: testid,
}: Preview.BrandUploadGridProps): React.ReactElement {
  useUiLocale();
  return (
    <ul className={"ds-upload-grid"} data-testid={testid + "-files"}>
      {files.map((file, fileIndex) =>
        (() => {
          const _Element = "li";
          const _elementProps = {
            className: "ds-upload-tile",
            title: file.name,
            children: [
              thumb(file),
              <span
                className={
                  "w-full truncate text-center font-mono text-caption text-secondary"
                }
              >
                {file.name}
              </span>,
              <span className={"ds-upload-x"}>
                <DisabledReasonTooltip reason={removeDisabledReason}>
                  <Button
                    variant={"onContent"}
                    size={"sm"}
                    iconOnly={true}
                    icon={"X"}
                    aria-label={uiMessage("design-system.welcome.remove2", { value1: String(file.name) })}
                    tooltip={uiMessage("design-system.welcome.remove")}
                    disabled={removeDisabledReason !== undefined}
                    onClick={() => onRemove(fileIndex)}
                    data-testid={testid + "-remove-" + String(fileIndex)}
                  />
                </DisabledReasonTooltip>
              </span>,
            ],
          };
          const _elementKey = uploadedFileIdentityId(file);
          return <_Element key={_elementKey} {..._elementProps} />;
        })(),
      )}
    </ul>
  );
}
function BrandUploadPanel({
  files: files,
  onFiles: onFiles,
  onLeftOut: onLeftOut,
  onRemove: onRemove,
  thumb: thumb,
  intake: intake,
  handing: handing,
  onCreate: onCreate,
  onBack: onBack,
  "data-testid": dataTestid = "ds-upload",
}: Preview.BrandUploadPanelProps): React.ReactElement {
  useUiLocale();
  let value = BRAND_UPLOAD_TEXT,
    hasFiles = files.length > 0,
    pendingDrop = !hasFiles
      ? value.noFiles
      : intake.busy
        ? value.adding
        : intake.kept === 0
          ? value.noneKept
          : handing
            ? value.waiting
            : undefined,
    ref = reactBrandUpload.useRef<HTMLDivElement | null>(null),
    dropButtonRef = reactBrandUpload.useRef<HTMLButtonElement | null>(null),
    callback = () =>
      dropButtonRef.current?.focus({
        focusVisible: true,
      } as FocusOptions & {
        focusVisible: boolean;
      });
  reactBrandUpload.useEffect(() => {
    if (pendingDrop === undefined) {
      callback();
    } else {
      ref.current?.querySelector("button")?.focus();
    }
  }, []);
  let dropStateRef = reactBrandUpload.useRef(false);
  reactBrandUpload.useEffect(() => {
    let handleDragEvent = (event: Event) =>
        event.target instanceof Node &&
        (ref.current?.contains(event.target) ?? false),
      handlePointerDown = (event: Event) => {
        dropStateRef.current = !handleDragEvent(event);
      },
      handleFocusEvent = (event: Event) => {
        if (!handleDragEvent(event)) {
          dropStateRef.current = true;
        }
      },
      handleScrollEvent = () => {
        dropStateRef.current = true;
      },
      items: [string, EventListener][] = [
        ["pointerdown", handlePointerDown],
        ["focusin", handleFocusEvent],
        ["keydown", handleFocusEvent],
        ["scroll", handleScrollEvent],
        ["wheel", handleScrollEvent],
        ["touchmove", handleScrollEvent],
      ];
    for (let [eventType, listener] of items) {
      document.addEventListener(eventType, listener, true);
    }
    return () => {
      for (let [eventType, listener] of items) {
        document.removeEventListener(eventType, listener, true);
      }
    };
  }, []);
  let hadInitialPanel = reactBrandUpload.useRef(pendingDrop !== undefined);
  reactBrandUpload.useEffect(() => {
    let viewportBounds = ref.current?.getBoundingClientRect(),
      isVisible =
        viewportBounds !== undefined &&
        viewportBounds.bottom >= 0 &&
        viewportBounds.top < window.innerHeight;
    if (
      hadInitialPanel.current &&
      pendingDrop === undefined &&
      document.hasFocus() &&
      !dropStateRef.current &&
      isVisible
    ) {
      callback();
    }
    hadInitialPanel.current = pendingDrop !== undefined;
  }, [pendingDrop]);
  return (
    <div
      ref={ref}
      className={"flex min-h-0 flex-1 flex-col gap-md"}
      data-testid={dataTestid}
    >
      {[<div className={"flex items-center justify-between gap-md"}>
          {[<h2 className={"ds-welcome-title"}>{value.title}</h2>, onBack !== undefined ? (
              <span className={"text-footnote text-secondary"}>
                <TextLink
                  inheritColor={true}
                  icon={"ArrowLeft"}
                  iconPosition={"start"}
                  onClick={onBack}
                  data-testid={dataTestid + "-back"}
                >
                  {value.back}
                </TextLink>
              </span>
            ) : null]}
        </div>, <FileDropZone
          large={true}
          folder={true}
          line={value.line}
          hint={value.hint}
          onFiles={onFiles}
          onLeftOut={onLeftOut}
          testid={dataTestid}
        />, hasFiles ? (
          <BrandUploadGrid
            files={files}
            thumb={thumb}
            onRemove={onRemove}
            removeDisabledReason={intake.busy ? value.removeLater : undefined}
            testid={dataTestid}
          />
        ) : null, <div
          className={
            "flex flex-wrap items-center justify-between gap-md" +
            (hasFiles && !intake.busy ? " ds-upload-foot" : "")
          }
        >
          {[<p
              className={
                "flex min-h-6 items-center gap-sm text-footnote text-secondary"
              }
              role={"status"}
              aria-live={"polite"}
              data-testid={dataTestid + "-status"}
            >
              {[hasFiles && intake.busy ? <IntakeProgressDot /> : null, hasFiles ? brandUploadStatusText(intake) : ""]}
            </p>, <DisabledReasonTooltip reason={pendingDrop}>
              <Button
                ref={dropButtonRef}
                data-initial-focus={""}
                variant={"primary"}
                disabled={pendingDrop !== undefined}
                onClick={onCreate}
                data-testid={dataTestid + "-create"}
              >
                {value.create}
              </Button>
            </DisabledReasonTooltip>]}
        </div>]}
    </div>
  );
}
function get_WELCOME_TYPE_REQUIRED_MESSAGE() {
  return uiMessage("design-system.welcome.worksInADesignSystem");
}
export {
  BRAND_UPLOAD_TEXT,
  BrandUploadGrid,
  BrandUploadPanel,
  brandUploadStatusText,
  EmptyDesignSystem,
  HandoffNotice,
  IntakeProgressDot,
  IntakeProgressStatus,
  jsxBrandUpload,
  jsxWelcome,
  jsxWelcomeIcons,
  nextUploadedFileIdentityId,
  reactBrandUpload,
  reactWelcome,
  README_STARTER_TEXT,
  uploadedFileIdentityId,
  uploadedFileIdentityIds,
  WELCOME_ICON_PATHS,
  WELCOME_OPTIONS,
  get_WELCOME_TYPE_REQUIRED_MESSAGE,
  WelcomeIcon,
  WelcomeSheet,
};
export function installFilesUiWelcome(): () => void {
  return () => {
    reactBrandUpload = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    reactWelcome = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxWelcomeIcons = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    WELCOME_ICON_PATHS = {
      github: (
        <path
          d={
            "M8 1.8a6.3 6.3 0 0 0-2 12.3c.3.1.4-.1.4-.3v-1.1c-1.8.4-2.1-.8-2.1-.8-.3-.7-.7-.9-.7-.9-.6-.4 0-.4 0-.4.6 0 1 .6 1 .6.6 1 1.5.7 1.9.5.1-.4.2-.7.4-.9-1.4-.2-2.9-.7-2.9-3.1 0-.7.2-1.2.6-1.7-.1-.2-.3-.8.1-1.7 0 0 .5-.2 1.7.6a5.8 5.8 0 0 1 3.1 0c1.2-.8 1.7-.6 1.7-.6.4.9.1 1.5.1 1.7.4.5.6 1 .6 1.7 0 2.4-1.5 2.9-2.9 3.1.2.2.4.6.4 1.2v1.8c0 .2.1.4.4.3A6.3 6.3 0 0 0 8 1.8Z"
          }
          fill={"currentColor"}
          stroke={"none"}
        />
      ),
    };
    jsxWelcome = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    // MineDesign: user-facing copy calls the agent "the agent", not Claude.
    README_STARTER_TEXT = [
      "# Your design system…",
      "",
      uiMessage("design-system.welcome.thisPageIsYoursTo"),
      "",
      "## Principles",
      "",
      "- A short rule the whole system follows",
      "- Another one — keep each to a line",
      "",
      "## Using tokens",
      "",
      uiMessage("design-system.welcome.whichColoursTypeAndSpacing"),
      "",
      "## Using components",
      "",
      uiMessage("design-system.welcome.whereTheComponentsComeFrom"),
      "",
      "## Accessibility",
      "",
      uiMessage("design-system.welcome.whichTextAndBackgroundPairs"),
      "",
    ].join(`
`);
    WELCOME_TYPE_REQUIRED_MESSAGE =
      "Works in a design system made from the Design System type";
    WELCOME_OPTIONS = {
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      github: [
        uiMessage("design-system.welcome.syncFromGitHub"),
        uiMessage("design-system.welcome.pointTheAgentAtA"),
      ],
      connect: [
        uiMessage("design-system.welcome.buildFromConnectors"),
        uiMessage("design-system.welcome.theAgentBuildsFromYour"),
        "Connectors",
      ],
      upload: [
        uiMessage("design-system.welcome.uploadBrandFiles"),
        uiMessage("design-system.welcome.dropInLogosFontsGuidelines"),
        "FileUpload",
      ],
    };
    jsxBrandUpload = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    BRAND_UPLOAD_TEXT = {
      get title() { return uiMessage("design-system.welcome.uploadYourBrandSFiles"); },
      line: "Drop logos, fonts, brand guidelines and token files here",
      get hint() { return uiMessage("design-system.welcome.imagesFontFilesPDFsCSSOrJSONTokensScreenshotsAFolderKeepsItsNameAsAGroup"); },
      create: "Create design system",
      back: "Back",
      noFiles: "Drop or choose the brand’s files first",
      adding: "Adding them to the page…",
      noneKept: "The page couldn’t keep any of them — try other files",
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      waiting: uiMessage("design-system.welcome.aRequestToTheAgent"),
      removeLater: "You can remove it once the upload finishes",
      save: {
        clean: "",
        hold: " Not saved yet; creating saves the page first.",
        saving: " The page is still saving.",
        error: " The last save failed; creating tries it again.",
      },
    };
    uploadedFileIdentityIds = new WeakMap();
    nextUploadedFileIdentityId = 0;
  };
}
