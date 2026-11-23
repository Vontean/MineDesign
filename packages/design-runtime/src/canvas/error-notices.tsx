import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { clearDismissedArtboardErrors, errorMessagesMatch, retainMatchingDismissedErrors, setDismissedArtboardErrors, updateArtboardErrorMap } from "./artboard-errors";
import { useArtboardErrorReporting } from "./error-reporting";
import { embedMemoryPrefix } from "../platform/file-content";
import { claudeSendStatusMessage, getAvailableClaudeSendSession, react_sm } from "./claude-handoff";
import { artboardErrorsFallbackPrompt, sendArtboardErrorsToClaude } from "./error-prompt";
import { Button } from "../cds/button/button";
import { Icon } from "../cds/components/icon";
import { initializeCdsIndex } from "../cds/index";
import { MenuMenuAssignValue } from "../cds/menu/menu";
import { TooltipGroup } from "../cds/tooltip/tooltip";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { joinClassNames } from "../editor/chrome/overlay-state";
import { showEditorToast } from "../editor/chrome/pending-toasts";
import { SessionStripPopover } from "../editor/session-strip/popover";
import { toModuleNamespace } from "../module-helpers";
import { CdsIsland, initializePlatformCdsIsland } from "../platform/cds-island";

var jsx_sp: Dynamic;
var artboardErrorsUiLabels: Dynamic;
var claudeSendSessionRefreshIntervalMs: Dynamic;
var react_Xd: Dynamic;
var jsx_Ww: Dynamic;
var artboardErrorNoticeLabels: Dynamic;
var stopErrorNoticePropagation: Dynamic;
var ArtboardErrorNotice: Dynamic;
var artboardErrorChipElement: Dynamic;
var artboardErrorNoticeElement: Dynamic;
var elementContainsKeyboardFocus: Dynamic;
function ArtboardErrorsPopover({
  problems: problems,
  canvasTitle: canvasTitle,
  canEdit: canEdit,
  hosted: hosted,
  open: open,
  onOpenChange: onOpenChange,
}: Dynamic): Dynamic {
  useUiLocale();
  let canAskAgent: Dynamic = canEdit && !hosted,
    listId: Dynamic = (0, react_sm.useId)(),
    sendSessionRef: Dynamic = (0, react_sm.useRef)(null),
    refreshTokenRef: Dynamic = (0, react_sm.useRef)(0),
    refreshSendSession: Dynamic = (0, react_sm.useCallback)((): Dynamic => {
      let refreshToken: Dynamic = ++refreshTokenRef.current;
      getAvailableClaudeSendSession().then(
        (session?: Dynamic): Dynamic => {
          refreshToken === refreshTokenRef.current && (sendSessionRef.current = session);
        },
      );
    }, []);
  (0, react_sm.useEffect)((): Dynamic => {
    canAskAgent && refreshSendSession();
  }, [canAskAgent, refreshSendSession]);
  (0, react_sm.useEffect)((): Dynamic => {
    if (!canAskAgent || !open) return;
    refreshSendSession();
    let refreshTimer: Dynamic = setInterval(
      refreshSendSession,
      claudeSendSessionRefreshIntervalMs,
    );
    return (): Dynamic => clearInterval(refreshTimer);
  }, [canAskAgent, open, refreshSendSession]);
  let isMountedRef: Dynamic = (0, react_sm.useRef)(true);
  (0, react_sm.useEffect)(
    (): Dynamic => (
      (isMountedRef.current = true),
      (): Dynamic => {
        isMountedRef.current = false;
        refreshTokenRef.current++;
      }
    ),
    [],
  );
  let problemEntries: Dynamic = (0, react_sm.useMemo)(
      (): Dynamic =>
        problems.map(
          (problem?: Dynamic): Dynamic => ({
            file: problem.path,
            messages: problem.messages,
          }),
        ),
      [problems],
    ),
    problemsKey: Dynamic = (0, react_sm.useMemo)(
      (): Dynamic => JSON.stringify(problemEntries),
      [problemEntries],
    ),
    [fallbackState, setFallbackState]: Dynamic = (0, react_sm.useState)(null),
    fallbackPrompt: Dynamic = fallbackState?.key === problemsKey ? fallbackState.prompt : null,
    askAgent: Dynamic = (): Dynamic => {
      sendArtboardErrorsToClaude(
        problemEntries,
        sendSessionRef.current,
        canvasTitle,
      ).then((sendStatus?: Dynamic): Dynamic => {
        showEditorToast(
          claudeSendStatusMessage(sendStatus),
        );
        isMountedRef.current &&
          (setFallbackState(
            sendStatus === "failed"
              ? {
                  key: problemsKey,
                  prompt: artboardErrorsFallbackPrompt(
                    problemEntries,
                    canvasTitle,
                  ),
                }
              : null,
          ),
          sendStatus === "failed" && onOpenChange(true));
      });
    },
    errorCount: Dynamic = problems.reduce(
      (total?: Dynamic, problem?: Dynamic): Dynamic =>
        total + problem.messages.length,
      0,
    );
  return (
    <SessionStripPopover
      icon={"Warning"}
      label={artboardErrorsUiLabels.pill(errorCount)}
      tip={artboardErrorsUiLabels.pillTip(problems.length)}
      align={"end"}
      open={open}
      onOpenChange={onOpenChange}
      data-testid={"design-problems-pill"}
    >
      <MenuMenuAssignValue.Header
        className={"w-80 pb-2 pt-1.5 font-normal"}
      >
        <div
          className={"text-body font-medium text-primary"}
          data-testid={"design-problems-title"}
        >
          {artboardErrorsUiLabels.title}
        </div>
        <ul
          id={listId}
          className={
            "m-0 mt-1 flex max-h-64 list-none flex-col gap-1.5 overflow-y-auto p-0 whitespace-normal"
          }
          data-testid={"design-problems-list"}
        >
          {problems.map(
            (problem?: Dynamic): Dynamic =>
              (() => {
                const ItemTag = "li";
                const itemProps = {
                  children: [
                    <div className={"break-words text-body text-primary"}>
                      {problem.title}
                    </div>,
                    problem.messages.map(
                      (message?: Dynamic, index?: Dynamic): Dynamic => (
                        <div
                          key={index}
                          className={
                            "select-text break-words font-mono text-[11px] leading-snug text-secondary"
                          }
                        >
                          {message}
                        </div>
                      ),
                    ),
                  ],
                } as const;
                const itemKey = problem.file;
                return <ItemTag key={itemKey} {...itemProps} />;
              })(),
          )}
        </ul>
        {canEdit || hosted ? (null) : (<p className={"mt-2 whitespace-normal text-body text-secondary"}>
            {artboardErrorsUiLabels.viewOnly}
          </p>)}
        {fallbackPrompt !== null ? (<div
            className={"mt-2 flex flex-col gap-1"}
            data-testid={"design-problems-prompt"}
          >
            <p className={"text-xs text-secondary"}>
              {artboardErrorsUiLabels.paste}
            </p>
            <pre
              className={
                "max-h-32 select-text overflow-auto whitespace-pre-wrap break-words rounded-md bg-wash-1 p-2 text-[11px] leading-snug text-secondary"
              }
            >
              {fallbackPrompt}
            </pre>
          </div>) : (null)}
      </MenuMenuAssignValue.Header>
      {canAskAgent ? (<jsx_sp.Fragment>
          <MenuMenuAssignValue.Separator />
          <MenuMenuAssignValue.Item
            icon={"Chat"}
            aria-describedby={listId}
            data-testid={"design-problems-ask"}
            onClick={askAgent}
          >
            {artboardErrorsUiLabels.ask}
          </MenuMenuAssignValue.Item>
        </jsx_sp.Fragment>) : (null)}
    </SessionStripPopover>
  );
}
function useArtboardErrorNotices(
  problems?: Dynamic,
  problemEntries?: Dynamic,
  noticeOptions?: Dynamic,
): Dynamic {
  let [dismissedErrors, setDismissedErrors]: Dynamic = (0, react_Xd.useState)(
      (): Dynamic => new Map(),
    ),
    pendingFocusRef: Dynamic = (0, react_Xd.useRef)(null),
    dismissNotice: Dynamic = (0, react_Xd.useCallback)(
      (file?: Dynamic, messages?: Dynamic): Dynamic => {
        pendingFocusRef.current = elementContainsKeyboardFocus(
          artboardErrorNoticeElement(file),
        )
          ? {
              file: file,
              to: "chip",
            }
          : null;
        setDismissedErrors(
          (dismissed?: Dynamic): Dynamic =>
            setDismissedArtboardErrors(dismissed, file, messages),
        );
      },
      [],
    ),
    restoreNotice: Dynamic = (0, react_Xd.useCallback)(
      (file?: Dynamic): Dynamic => {
        pendingFocusRef.current = elementContainsKeyboardFocus(
          artboardErrorChipElement(file),
        )
          ? {
              file: file,
              to: "notice",
            }
          : null;
        setDismissedErrors(
          (dismissed?: Dynamic): Dynamic =>
            clearDismissedArtboardErrors(dismissed, file),
        );
      },
      [],
    );
  (0, react_Xd.useLayoutEffect)((): Dynamic => {
    let pendingFocus: Dynamic = pendingFocusRef.current;
    pendingFocusRef.current = null;
    if (
      !pendingFocus ||
      (document as Dynamic).activeElement !== (document as Dynamic).body
    )
      return;
    let focusTarget: Dynamic =
      pendingFocus.to === "chip"
        ? artboardErrorChipElement(pendingFocus.file)
        : artboardErrorNoticeElement(pendingFocus.file)?.querySelector("button");
    focusTarget instanceof HTMLElement &&
      focusTarget.focus({
        preventScroll: true,
      });
  }, [dismissedErrors]);
  let visibleChipProblems: Dynamic = (0, react_Xd.useMemo)(
      (): Dynamic =>
        retainMatchingDismissedErrors(problems, dismissedErrors),
      [problems, dismissedErrors],
    ),
    {
      canvasTitle: canvasTitle,
      canAsk: canAsk,
      large: large,
      onShowAll: onShowAll,
    }: Dynamic = noticeOptions;
  return {
    chipProblems: visibleChipProblems,
    notice: (file?: Dynamic): Dynamic => {
      let problem: Dynamic = problemEntries.find(
        (item?: Dynamic): Dynamic => item.file === file,
      );
      return problem === undefined ||
        errorMessagesMatch(
          dismissedErrors,
          file,
          problem.messages,
        ) ? null : (
        <ArtboardErrorNotice
          file={problem.file}
          path={problem.path}
          title={problem.title}
          messages={problem.messages}
          canvasTitle={canvasTitle}
          canAsk={canAsk}
          large={large}
          onDismiss={dismissNotice}
          onShowAll={onShowAll}
        />
      );
    },
    restore: restoreNotice,
  };
}
interface ArtboardProblem {
  file: string;
  path: string;
  title: string;
  messages: string[];
}

export function useCanvasArtboardProblems({
  artboards, editable, phoneCanvas,
}: {
  artboards: { file: string; title?: string | null }[];
  editable: boolean;
  phoneCanvas: boolean;
}) {
  const { useState, useCallback, useMemo } = react_Xd;
  const [messagesByFile, setMessagesByFile] = useState(() => new Map<string, string[]>());
  const [open, setOpen] = useState(false);
  const update = useCallback((file: string, messages: string[]) => {
    setMessagesByFile((previous: Map<string, string[]>) => updateArtboardErrorMap(previous, file, messages));
  }, []);
  const showAll = useCallback(() => setOpen(true), []);
  const problems: ArtboardProblem[] = useMemo(() => artboards.flatMap(({ file, title }) => {
    const messages = messagesByFile.get(file);
    return messages ? [{ file, path: file, title: title ?? file.replace(/\.dc\.html$/, ""), messages }] : [];
  }), [artboards, messagesByFile]);
  const hasProblems = problems.length > 0;
  const hosted = embedMemoryPrefix() !== "";
  const canvasTitle = document.title;
  useArtboardErrorReporting(hasProblems);
  const notices = useArtboardErrorNotices(messagesByFile, problems, {
    canvasTitle,
    canAsk: editable && !hosted,
    large: phoneCanvas,
    onShowAll: showAll,
  });
  if (!hasProblems && open) setOpen(false);

  const popover = hasProblems ? (
    <ArtboardErrorsPopover
      problems={problems}
      canvasTitle={canvasTitle}
      canEdit={editable}
      hosted={hosted}
      open={open}
      onOpenChange={setOpen}
    />
  ) : null;
  return { update, problems, popover, chips: notices.chipProblems, restore: notices.restore, notice: notices.notice };
}

export {
  artboardErrorChipElement,
  ArtboardErrorNotice,
  artboardErrorNoticeElement,
  artboardErrorNoticeLabels,
  ArtboardErrorsPopover,
  artboardErrorsUiLabels,
  claudeSendSessionRefreshIntervalMs,
  elementContainsKeyboardFocus,
  jsx_sp,
  jsx_Ww,
  react_Xd,
  stopErrorNoticePropagation,
  useArtboardErrorNotices,
};
export function installCanvasErrorNotices(): () => void {
  return () => {
    jsx_sp = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    artboardErrorsUiLabels = {
      pill: (count?: Dynamic): Dynamic =>
        count === 1 ? "1 error" : String(count) + " errors",
      pillTip: (count?: Dynamic): Dynamic =>
        count === 1
          ? uiMessage("canvas.errorNotices.showErrorsOn1Artboard")
          : uiMessage("canvas.errorNotices.showErrorsOn") + String(count) + " artboards",
      get title() { return uiMessage("canvas.errorNotices.artboardsWithErrors"); },
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      ask: "Ask the agent to fix",
      viewOnly: "Someone who can edit this canvas can ask the agent to fix them.",
      paste: "Copy this and paste it to the agent:",
    };
    claudeSendSessionRefreshIntervalMs = 1e4;
    react_Xd = toModuleNamespace(load_react(), 1);
    initializeCdsIndex();
    initializePlatformCdsIsland();
    jsx_Ww = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    artboardErrorNoticeLabels = {
      group: (artboardName?: Dynamic): Dynamic => uiMessage("canvas.errorNotices.errorsOnArtboard") + artboardName,
      list: "Show all artboards with errors",
      dismiss: (artboardName?: Dynamic): Dynamic =>
        uiMessage("canvas.errorNotices.dismissErrorNoticeOnArtboard") + artboardName,
      dismissTip: "Dismiss",
      refused: uiMessage("canvas.errorNotices.couldnTCopyThePrompt", { action: String(artboardErrorsUiLabels.ask), menu: String(artboardErrorsUiLabels.title) }),
    };
    stopErrorNoticePropagation = (event?: Dynamic): Dynamic =>
      event.stopPropagation();
    ArtboardErrorNotice = (0, react_Xd.memo)(function ({
      file: file,
      path: path,
      title: title,
      messages: messages,
      canvasTitle: canvasTitle,
      canAsk: canAsk,
      large: large,
      onDismiss: onDismiss,
      onShowAll: onShowAll,
    }: Dynamic): Dynamic {
      let sendSessionRef: Dynamic = (0, react_Xd.useRef)(null),
        refreshTokenRef: Dynamic = (0, react_Xd.useRef)(0),
        isMountedRef: Dynamic = (0, react_Xd.useRef)(true),
        isSendingRef: Dynamic = (0, react_Xd.useRef)(false),
        refreshSendSession: Dynamic = (0, react_Xd.useCallback)((): Dynamic => {
          let refreshToken: Dynamic = ++refreshTokenRef.current;
          getAvailableClaudeSendSession().then(
            (session?: Dynamic): Dynamic => {
              refreshToken === refreshTokenRef.current && (sendSessionRef.current = session);
            },
          );
        }, []);
      (0, react_Xd.useEffect)(
        (): Dynamic => (
          (isMountedRef.current = true),
          canAsk && refreshSendSession(),
          (): Dynamic => {
            isMountedRef.current = false;
            refreshTokenRef.current++;
          }
        ),
        [canAsk, refreshSendSession],
      );
      let askAgent: Dynamic = (): Dynamic => {
        if (isSendingRef.current) return;
        let sendPromise: Dynamic = sendArtboardErrorsToClaude(
          [
            {
              file: path,
              messages: messages,
            },
          ],
          sendSessionRef.current,
          canvasTitle,
        );
        isSendingRef.current = true;
        sendPromise
          .then((sendStatus?: Dynamic): Dynamic => {
            showEditorToast(
              sendStatus === "failed"
                ? artboardErrorNoticeLabels.refused
                : claudeSendStatusMessage(sendStatus),
            );
            isMountedRef.current &&
              (sendStatus === "failed"
                ? onShowAll()
                : sendStatus !== "staged" && refreshSendSession());
          })
          .finally((): Dynamic => {
            isSendingRef.current = false;
          });
      };
      return (
        <div
          data-mega-chrome={"problem-notice"}
          data-mega-notice={file}
          data-testid={"mega-artboard-notice-" + file}
          role={"group"}
          aria-label={artboardErrorNoticeLabels.group(title)}
          className={joinClassNames(
            "pointer-events-auto inline-flex max-w-full items-center rounded-card bg-surface-2 text-body text-primary shadow-panel-sm select-none",
            large ? "h-12 gap-0.5 px-1" : "h-[34px] gap-1 px-[5px]",
          )}
          onPointerDown={stopErrorNoticePropagation}
          onClick={stopErrorNoticePropagation}
          onDoubleClick={stopErrorNoticePropagation}
        >
          <CdsIsland density={"compact"} className={"contents"}>
            <TooltipGroup>
              <Button
                variant={"ghost"}
                size={"xxs"}
                iconOnly={true}
                data-testid={"mega-artboard-notice-sign-" + file}
                aria-label={artboardErrorNoticeLabels.list}
                tooltip={messages[0]}
                icon={<Icon name={"Warning"} size={"sm"} />}
                className={"shrink-0 text-danger"}
                onClick={onShowAll}
              />
              <span
                className={joinClassNames(
                  "whitespace-nowrap pr-1",
                  large
                    ? "@max-[19rem]/foot:hidden"
                    : "@max-[14rem]/foot:hidden",
                )}
              >
                {artboardErrorsUiLabels.pill(messages.length)}
              </span>
              {canAsk && (<Button
                  variant={"secondary"}
                  size={"xs"}
                  data-testid={"mega-artboard-notice-ask-" + file}
                  className={joinClassNames(
                    "shrink-0",
                    large
                      ? "px-3 @max-[15rem]/foot:hidden"
                      : "@max-[10.5rem]/foot:hidden",
                  )}
                  onPointerEnter={refreshSendSession}
                  onFocus={refreshSendSession}
                  onClick={askAgent}
                >
                  {artboardErrorsUiLabels.ask}
                </Button>)}
              <Button
                variant={"ghost"}
                size={"xxs"}
                iconOnly={true}
                data-testid={"mega-artboard-notice-dismiss-" + file}
                aria-label={artboardErrorNoticeLabels.dismiss(title)}
                tooltip={artboardErrorNoticeLabels.dismissTip}
                icon={<Icon name={"X"} size={"sm"} />}
                className={joinClassNames(
                  "shrink-0 text-secondary",
                  large
                    ? "@max-[5.75rem]/foot:hidden"
                    : "@max-[4rem]/foot:hidden",
                )}
                onClick={(): Dynamic => onDismiss(file, messages)}
              />
            </TooltipGroup>
          </CdsIsland>
        </div>
      );
    });
    artboardErrorChipElement = (file?: Dynamic): Dynamic =>
      [...(document as Dynamic).querySelectorAll("[data-mega-artboard]")]
        .find(
          (element?: Dynamic): Dynamic =>
            element.getAttribute("data-mega-artboard") === file,
        )
        ?.querySelector('[data-mega-chrome="problem"]');
    artboardErrorNoticeElement = (file?: Dynamic): Dynamic =>
      [...(document as Dynamic).querySelectorAll("[data-mega-notice]")].find(
        (element?: Dynamic): Dynamic =>
          element.getAttribute("data-mega-notice") === file,
      );
    elementContainsKeyboardFocus = (element?: Dynamic): Dynamic =>
      element?.contains((document as Dynamic).activeElement) === true;
  };
}
