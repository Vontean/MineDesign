import { useUiLocale } from '../../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { initializeNpm_usehooks_ts_p0, load_react } from "../../dependencies";
import { discardedCodeChangesAnnouncement, sourceLineErrorAnnouncement } from "../accessibility/announcements";
import { announce } from "../accessibility/announcer";
import { ChromeScrollbarLabel, FloatingScrollbar } from "../chrome/scrollbar";
import { CodePropertyCodeDiscardDelayMs as discardAnnouncementDelayMs, CodePropertyCodeResolvedValue, getSelectionCodeEntries, parseInspectorCode, selectionCodeText, serializeSelectionCode, useCodeErrorAnnouncement } from "./property-code";
import { reactInspectorAnnotation } from "../inspector/annotation";
import { ClassStyleTargets, findInspectorOutlineNode, isTextStyleProperty, sharedInheritedTextStyle } from "../inspector/class-targets";
import { toModuleNamespace } from "../../module-helpers";

var reactCodeInspectorCodePanel: Dynamic;
function InspectorCodePanel({
  selKey: selKey,
  tids: tids,
  model: model,
  modelSig = "",
  readOnly = false,
  textareaRef: textareaRef,
  outline: outline,
  onSelectTid: onSelectTid,
  onHoverTid: onHoverTid,
  onEdits: onEdits,
}: Dynamic): Dynamic {
  useUiLocale();
  let [codeText, setCodeText]: Dynamic = (0,
    reactInspectorAnnotation.useState)(
      (): Dynamic => selectionCodeText(model, tids),
    ),
    [inheritedGroups, setInheritedGroups]: Dynamic = (0,
    reactInspectorAnnotation.useState)([]),
    [codeError, setCodeError]: Dynamic = (0,
    reactInspectorAnnotation.useState)(null),
    textareaElementRef: Dynamic = (0, reactInspectorAnnotation.useRef)(null),
    setTextareaRef: Dynamic = (0, reactInspectorAnnotation.useCallback)(
      (element?: Dynamic): Dynamic => {
        textareaElementRef.current = element;
        typeof textareaRef == "function"
          ? textareaRef(element)
          : textareaRef && (textareaRef.current = element);
      },
      [textareaRef],
    ),
    appliedPropsRef: Dynamic = (0, reactInspectorAnnotation.useRef)(new Map()),
    isFocusedRef: Dynamic = (0, reactInspectorAnnotation.useRef)(false),
    hasPendingEditRef: Dynamic = (0, reactInspectorAnnotation.useRef)(false),
    resetFromModel: Dynamic = (0, reactInspectorAnnotation.useMemo)(
      (): Dynamic => (): Dynamic => {
        let selectionCode: Dynamic = getSelectionCodeEntries(
          model,
          tids,
        );
        appliedPropsRef.current = new Map(
          selectionCode.entries.map(
            (entry?: Dynamic): Dynamic => [entry.key, entry.value],
          ),
        );
        setCodeText(
          serializeSelectionCode(selectionCode.entries, selectionCode.mixed),
        );
        setInheritedGroups(sharedInheritedTextStyle(model, tids));
        setCodeError(null);
        hasPendingEditRef.current = false;
      },
      [model, tids],
    ),
    pendingAnnouncementRef: Dynamic = (0, reactInspectorAnnotation.useRef)(null),
    scheduleAnnouncement: Dynamic = (sentence?: Dynamic, delayMs?: Dynamic): Dynamic => {
      pendingAnnouncementRef.current &&
        (window as Dynamic).clearTimeout(pendingAnnouncementRef.current.timer);
      let timer: Dynamic = (window as Dynamic).setTimeout((): Dynamic => {
        pendingAnnouncementRef.current = null;
        announce(sentence);
      }, delayMs);
      pendingAnnouncementRef.current = {
        sentence: sentence,
        timer: timer,
      };
    },
    flushPendingAnnouncement: Dynamic = (0, reactInspectorAnnotation.useEffectEvent)(
      (): Dynamic => {
        pendingAnnouncementRef.current &&
          scheduleAnnouncement(
            pendingAnnouncementRef.current.sentence,
            CodePropertyCodeResolvedValue,
          );
      },
    );
  (0, reactInspectorAnnotation.useEffect)((): Dynamic => {
    resetFromModel();
    flushPendingAnnouncement();
  }, [selKey]);
  (0, reactInspectorAnnotation.useEffect)((): Dynamic => {
    isFocusedRef.current || resetFromModel();
  }, [modelSig, model]);
  let commitTimerRef: Dynamic = (0, reactInspectorAnnotation.useRef)(null);
  (0, reactInspectorAnnotation.useEffect)(
    (): Dynamic => (): Dynamic => {
      commitTimerRef.current != null &&
        (window as Dynamic).clearTimeout(commitTimerRef.current);
    },
    [],
  );
  let applyCode: Dynamic = (codeSource?: Dynamic, isLive?: Dynamic): Dynamic => {
      let parsed: Dynamic = parseInspectorCode(codeSource);
      if (!parsed.ok) {
        setCodeError({
          line: parsed.line,
          message: parsed.message,
        });
        return;
      }
      setCodeError(null);
      hasPendingEditRef.current = false;
      let items: Dynamic = [];
      for (let [property, propertyValue] of parsed.map as Dynamic)
        appliedPropsRef.current.get(property) !== propertyValue &&
          items.push({
            prop: property,
            value: propertyValue,
          });
      for (let property of appliedPropsRef.current.keys() as Dynamic)
        parsed.map.has(property) ||
          items.push({
            prop: property,
            value: null,
          });
      items.length !== 0 &&
        ((appliedPropsRef.current = parsed.map),
        onEdits(items, {
          live: isLive,
        }));
    },
    errorAnnouncement: Dynamic = codeError
      ? sourceLineErrorAnnouncement(codeError.line, codeError.message)
      : undefined,
    errorId: Dynamic = (0, reactInspectorAnnotation.useId)();
  useCodeErrorAnnouncement(errorAnnouncement, codeText);
  let handleCodeChange: Dynamic = (nextText?: Dynamic): Dynamic => {
      setCodeText(nextText);
      !readOnly &&
        ((hasPendingEditRef.current = true),
        commitTimerRef.current != null &&
          (window as Dynamic).clearTimeout(commitTimerRef.current),
        (commitTimerRef.current = (window as Dynamic).setTimeout(
          (): Dynamic => applyCode(nextText, true),
          220,
        )));
    },
    hasManyElements: Dynamic = tids.length > 1,
    subjectLabel: Dynamic = hasManyElements ? uiMessage("inspector.inspectorCodePanel.theseElements") : uiMessage("inspector.inspectorCodePanel.thisElement"),
    getLockReason: Dynamic = (property?: Dynamic, propertyValue?: Dynamic): Dynamic => {
      if (readOnly)
        return (
          (hasManyElements ? uiMessage("inspector.inspectorCodePanel.theseElementsAre") : uiMessage("inspector.inspectorCodePanel.thisElementIs")) +
          " read-only here."
        );
      if (isTextStyleProperty(property, propertyValue))
        return uiMessage("inspector.inspectorCodePanel.thisValueIsRelativeTo");
      if (/var\(|\{\{/i.test(propertyValue))
        return uiMessage("inspector.inspectorCodePanel.thisValueDependsOnWhere");
      let parsedCode: Dynamic = parseInspectorCode(codeText);
      if (!parsedCode.ok) return uiMessage("inspector.inspectorCodePanel.fixTheMarkedLineIn");
      if (parsedCode.map.has(property))
        return uiMessage("inspector.inspectorCodePanel.theFieldAlreadyHasA") + property + ".";
      if (!parseInspectorCode(property + ": " + propertyValue + ";").ok)
        return uiMessage("inspector.inspectorCodePanel.thisValueCanTBe");
    },
    inheritedPanelRef: Dynamic = (0, reactInspectorAnnotation.useRef)(null),
    focusIndexRef: Dynamic = (0, reactInspectorAnnotation.useRef)(null),
    lastSetAtRef: Dynamic = (0, reactInspectorAnnotation.useRef)(0),
    getSetButtons: Dynamic = (): Dynamic => [
      ...(inheritedPanelRef.current?.querySelectorAll(
        "[data-inherited-set]:not(:disabled)",
      ) ?? []),
    ],
    handleInheritedSet: Dynamic = (property?: Dynamic, propertyValue?: Dynamic): Dynamic => {
      if (getLockReason(property, propertyValue) !== undefined) return;
      let now: Dynamic = Date.now();
      if (now - lastSetAtRef.current < 400) return;
      lastSetAtRef.current = now;
      commitTimerRef.current != null &&
        (window as Dynamic).clearTimeout(commitTimerRef.current);
      let lines: Dynamic = codeText.split(`
`),
        atRuleIndex: Dynamic = lines.findIndex(
          (line?: Dynamic): Dynamic => line.trim().startsWith("@"),
        ),
        declarations: Dynamic = (atRuleIndex < 0 ? lines : lines.slice(0, atRuleIndex))
          .join(
            `
`,
          )
          .trimEnd(),
        atRuleText: Dynamic =
          atRuleIndex < 0
            ? ""
            : lines.slice(atRuleIndex).join(`
`);
      focusIndexRef.current = getSetButtons().findIndex(
        (button?: Dynamic): Dynamic =>
          button === (document as Dynamic).activeElement,
      );
      applyCode(
        [declarations, property + ": " + propertyValue + ";"].filter(
          (part?: Dynamic): Dynamic => part !== "",
        ).join(`
`) +
          (atRuleText === ""
            ? ""
            : `

` + atRuleText),
        false,
      );
      resetFromModel();
    };
  (0, reactInspectorAnnotation.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = focusIndexRef.current;
    focusIndexRef.current = null;
    if (current == null || current < 0) return;
    let buttons: Dynamic = getSetButtons();
    buttons[Math.min(current, buttons.length - 1)]?.focus();
  }, [inheritedGroups]);
  let scrollContainerRef: Dynamic = (0, reactInspectorAnnotation.useRef)(null),
    [containerWidth, setContainerWidth]: Dynamic = (0,
    reactInspectorAnnotation.useState)(0);
  (0, reactInspectorAnnotation.useEffect)((): Dynamic => {
    let current: Dynamic = scrollContainerRef.current;
    if (!current || typeof ResizeObserver === "undefined") return;
    let observer: Dynamic = new ResizeObserver(
      (): Dynamic => setContainerWidth(current.clientWidth),
    );
    observer.observe(current);
    return (): Dynamic => observer.disconnect();
  }, []);
  let supportsFieldSizing: Dynamic =
    typeof CSS !== "undefined" &&
    CSS.supports?.("field-sizing", "content") === true;
  (0, reactInspectorAnnotation.useLayoutEffect)((): Dynamic => {
    let current: Dynamic = textareaElementRef.current;
    if (!current || supportsFieldSizing) return;
    let scrollTop: Dynamic = scrollContainerRef.current?.scrollTop ?? 0;
    current.style.height = "auto";
    current.style.height = String(current.scrollHeight) + "px";
    scrollContainerRef.current && (scrollContainerRef.current.scrollTop = scrollTop);
  }, [codeText, containerWidth, supportsFieldSizing]);
  let outlineNode: Dynamic =
      tids.length === 1
        ? findInspectorOutlineNode(outline, tids[0])
        : null,
    tagName: Dynamic = tids.length === 1 ? model.tagName?.(tids[0]) : null,
    emptyHint: Dynamic = uiMessage("inspector.inspectorCodePanel.nothingSetOn") + subjectLabel;
  return (
    <div
      data-testid={"dc-code-pane"}
      className={"relative flex min-h-[10rem] flex-1 flex-col"}
    >
      <div
        ref={scrollContainerRef}
        className={
          "flex min-h-0 flex-1 flex-col overflow-y-auto bg-surface-2 " +
          ChromeScrollbarLabel
        }
        onMouseDown={(event?: Dynamic): Dynamic => {
          event.target !== event.currentTarget ||
            !textareaElementRef.current ||
            (event.preventDefault(),
            textareaElementRef.current.focus(),
            textareaElementRef.current.setSelectionRange(codeText.length, codeText.length));
        }}
      >
        {tagName && (<div
            data-testid={"dc-code-subject"}
            className={
              "truncate px-3.5 pt-2.5 font-mono text-[11px] text-muted select-none"
            }
          >
            {(("<") + (tagName)) + (">")}
            {outlineNode?.detail ? (<span className={"ml-2 font-sans"}>{outlineNode.detail}</span>) : (null)}
          </div>)}
        <textarea
          ref={setTextareaRef}
          data-testid={"dc-code-text"}
          value={codeText}
          readOnly={readOnly}
          spellCheck={false}
          autoCapitalize={"off"}
          autoCorrect={"off"}
          aria-label={uiMessage("inspector.inspectorCodePanel.cSSAndAttributes")}
          aria-invalid={codeError != null}
          aria-describedby={errorAnnouncement === undefined ? undefined : errorId}
          title={
            codeError ? (uiMessage("inspector.inspectorCodePanel.line", { line: String(String(codeError.line)), message: String(codeError.message) })) : (undefined)
          }
          onChange={(event?: Dynamic): Dynamic =>
            handleCodeChange(event.target.value)
          }
          onFocus={(): Dynamic => {
            isFocusedRef.current = true;
          }}
          onBlur={(): Dynamic => {
            isFocusedRef.current = false;
            commitTimerRef.current != null &&
              ((window as Dynamic).clearTimeout(commitTimerRef.current),
              (commitTimerRef.current = null));
            applyCode(codeText, false);
            let parsedCode: Dynamic = parseInspectorCode(codeText);
            !parsedCode.ok &&
              hasPendingEditRef.current &&
              scheduleAnnouncement(
                discardedCodeChangesAnnouncement(parsedCode.line),
                discardAnnouncementDelayMs,
              );
            resetFromModel();
          }}
          onKeyDown={(event?: Dynamic): Dynamic => {
            event.stopPropagation();
            event.key === "Escape" && event.currentTarget.blur();
          }}
          className={
            "block min-h-[6rem] w-full shrink-0 resize-none overflow-hidden border-0 bg-transparent px-3.5 py-3 [field-sizing:content] supports-[field-sizing:content]:min-h-[4.5rem] font-mono text-[11.5px] leading-[1.55] whitespace-pre-wrap [overflow-wrap:anywhere] text-primary outline-none [tab-size:2] " +
            (codeError ? "shadow-[inset_-3px_0_0_#b42318]" : "")
          }
          placeholder={
            tids.length === 0 ? (uiMessage("inspector.inspectorCodePanel.selectAnElementToSee")) : (readOnly ? ((emptyHint) + (".")) : (emptyHint +
                  ` yet.
Type  color: red;  to style ` + hasManyElements ? (uiMessage("inspector.inspectorCodePanel.them")) : ((uiMessage("inspector.inspectorCodePanel.it")) + ("."))))
          }
        />
        <div ref={inheritedPanelRef} className={"contents"}>
          <ClassStyleTargets
            groups={inheritedGroups}
            outline={outline}
            many={hasManyElements}
            lockFor={getLockReason}
            onSet={handleInheritedSet}
            onSelectTid={onSelectTid}
            onHoverTid={onHoverTid}
          />
        </div>
      </div>
      <FloatingScrollbar target={scrollContainerRef} />
      {errorAnnouncement !== undefined && (<span id={errorId} hidden={true}>
          {errorAnnouncement}
        </span>)}
    </div>
  );
}
export {
  InspectorCodePanel,
  reactCodeInspectorCodePanel,
};
export function installEditorCodeInspectorCodePanel(): () => void {
  return () => {
    initializeNpm_usehooks_ts_p0();
    reactCodeInspectorCodePanel = toModuleNamespace(
      load_react(),
      1,
    );
  };
}
