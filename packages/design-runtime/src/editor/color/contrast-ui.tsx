import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { Button } from "../../cds/button/button";
import { Icon } from "../../cds/components/icon";
import { load_react_jsx_runtime } from "../../dependencies";
import { AccessibilityAnnouncerLimit } from "../accessibility/announcer";
import { joinClassNames } from "../chrome/overlay-state";
import { ColorContrastCopyLabel_10 as poorContrastLabel, ColorContrastCopyLabel_11 as readableShadeLabel, ColorContrastCopyLabel_9 as goodContrastLabel, detailedContrastSentence, OnValue, reactColorContrastCopy, readableShadeDescription, summarizedContrastSentence } from "./contrast-copy";
import { formatContrastRatio, formatSpokenContrastRatio, parseRgbaColor, worstContrastResult } from "./contrast";
import { toModuleNamespace } from "../../module-helpers";

var jsxColorContrastUi: Dynamic;
var withoutAlpha: Dynamic;
var contrastVerdictClassName: Dynamic;
function summarizeContrastResults(results?: Dynamic): Dynamic {
  let worst: Dynamic = worstContrastResult(results),
    others: Dynamic = results.filter(
      (result?: Dynamic): Dynamic => result !== worst,
    ),
    ordered: Dynamic = [
      worst,
      ...others.sort(
        (result?: Dynamic, otherResult?: Dynamic): Dynamic =>
          result.ratio - otherResult.ratio,
      ),
    ],
    state: Dynamic = {
      ratio: formatSpokenContrastRatio(worst.ratio),
      ground: worst.ground.label,
      passes: worst.passes,
      min: formatSpokenContrastRatio(worst.min),
      alsoPassing: others.filter((result?: Dynamic): Dynamic => result.passes)
        .length,
    },
    failing: Dynamic = others.filter(
      (result?: Dynamic): Dynamic => !result.passes,
    ),
    spoken: Dynamic = summarizedContrastSentence({
      ...state,
      alsoFailing: failing.length,
    }),
    overflow: Dynamic = spoken.length - AccessibilityAnnouncerLimit;
  if (overflow > 0) {
    let truncatedGround: Dynamic = state.ground
      .slice(0, Math.max(1, state.ground.length - overflow - 1))
      .replace(/[\uD800-\uDBFF]$/, "");
    spoken = summarizedContrastSentence({
      ...state,
      ground: truncatedGround + "\u2026",
      alsoFailing: failing.length,
    });
  }
  return {
    worst: worst,
    title: ordered
      .map(
        (result?: Dynamic): Dynamic =>
          formatContrastRatio(result.ratio) +
          " " +
          OnValue +
          " " +
          result.ground.label,
      )
      .join(" \xB7 "),
    sentence: detailedContrastSentence({
      ...state,
      alsoFailing: failing.map(
        (result?: Dynamic): Dynamic => result.ground.label,
      ),
    }),
    spoken: spoken,
  };
}
function rgbaCssValue(rgba?: Dynamic): Dynamic {
  if (rgba === undefined) return;
  let callback: Dynamic = (channel?: Dynamic): Dynamic =>
    Math.round(channel * 255);
  return (
    "rgb(" +
    String(callback(rgba.r)) +
    " " +
    String(callback(rgba.g)) +
    " " +
    String(callback(rgba.b)) +
    " / " +
    String(Math.round(rgba.a * 1e3) / 1e3) +
    ")"
  );
}
function ContrastMark({
  results: results,
  sentence = true,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let summary: Dynamic = summarizeContrastResults(results),
    worst: Dynamic = summary.worst;
  return (
    <span
      data-kit={"contrast-mark"}
      data-verdict={worst.passes ? "pass" : "fail"}
      title={summary.title}
      aria-hidden={sentence ? undefined : true}
      className={joinClassNames(
        "inline-flex shrink-0 items-center gap-0.5 text-caption",
        contrastVerdictClassName(worst.passes),
        className,
      )}
    >
      <span aria-hidden={"true"} className={"flex items-center gap-0.5"}>
        <Icon name={worst.passes ? "Check" : "Warning"} size={"xs"} />
        <span className={"tabular-nums"}>
          {formatContrastRatio(worst.ratio)}
        </span>
      </span>
      {sentence ? (<span className={"sr-only"}>{summary.sentence}</span>) : (null)}
    </span>
  );
}
function ContrastLockup({
  fg: fg2,
  results: results,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let summary: Dynamic = summarizeContrastResults(results),
    worst: Dynamic = summary.worst;
  return (
    <span
      data-kit={"contrast-lockup"}
      data-verdict={worst.passes ? "pass" : "fail"}
      aria-hidden={"true"}
      title={summary.title}
      className={joinClassNames(
        "inline-flex min-w-0 items-center gap-1.5 text-caption leading-4",
        className,
      )}
    >
      <span
        data-kit={"contrast-swatch"}
        className={
          "inline-flex size-4 shrink-0 items-center justify-center rounded-[4px] shadow-card-ring"
        }
        style={{
          backgroundColor: rgbaCssValue(
            withoutAlpha(parseRgbaColor(worst.ground.css)),
          ),
          color: rgbaCssValue(
            typeof fg2 == "string" ? parseRgbaColor(fg2) : fg2,
          ),
        }}
      >
        <Icon name={"TextAa"} size={"xs"} />
      </span>
      <span className={worst.passes ? "text-primary" : "text-warning"}>
        {worst.passes ? (goodContrastLabel) : (poorContrastLabel)}
      </span>
    </span>
  );
}
function ContrastAdvice({
  fg: fg2,
  results: results,
  sentenceId: sentenceId,
  fix: fix,
  fixHeld = false,
  fixRef: fixRef,
  onFixGoneFocused: onFixGoneFocused,
}: Dynamic): Dynamic {
  useUiLocale();
  let summary: Dynamic = summarizeContrastResults(results),
    worst: Dynamic = summary.worst;
  return (
    <div
      className={
        "mt-1.5 flex min-h-4 min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
      }
    >
      <span
        data-kit={"contrast-readout"}
        data-verdict={worst.passes ? "pass" : "fail"}
        className={"inline-flex min-w-0 items-center"}
      >
        <ContrastLockup fg={fg2} results={results} />
        <span id={sentenceId} className={"sr-only"}>
          {summary.sentence}
        </span>
      </span>
      {fix !== undefined ? (<ReadableShadeButton
          fix={fix}
          held={fixHeld}
          rootRef={fixRef}
          onGoneFocused={onFixGoneFocused}
        />) : (null)}
    </div>
  );
}
function ReadableShadeButton({
  fix: fix,
  held = false,
  rootRef: rootRef,
  onGoneFocused: onGoneFocused,
}: Dynamic): Dynamic {
  useUiLocale();
  let descriptionId: Dynamic = (0, reactColorContrastCopy.useId)(),
    isTouchRef: Dynamic = (0, reactColorContrastCopy.useRef)(false),
    rootElementRef: Dynamic = (0, reactColorContrastCopy.useRef)(null),
    setRootRef: Dynamic = (0, reactColorContrastCopy.useCallback)(
      (element?: Dynamic): Dynamic => {
        rootElementRef.current = element;
        typeof rootRef == "function"
          ? rootRef(element)
          : rootRef && (rootRef.current = element);
      },
      [rootRef],
    ),
    wasClickedRef: Dynamic = (0, reactColorContrastCopy.useRef)(false),
    heldRef: Dynamic = (0, reactColorContrastCopy.useRef)(held);
  heldRef.current = held;
  let onGoneFocusedRef: Dynamic = (0, reactColorContrastCopy.useRef)(
    onGoneFocused,
  );
  onGoneFocusedRef.current = onGoneFocused;
  (0, reactColorContrastCopy.useLayoutEffect)(
    (): Dynamic => (): Dynamic => {
      wasClickedRef.current ||
        heldRef.current ||
        rootElementRef.current === null ||
        (rootElementRef.current.contains((document as Dynamic).activeElement) &&
          onGoneFocusedRef.current?.());
    },
    [],
  );
  return (
    <span
      ref={setRootRef}
      data-kit={"contrast-fix"}
      data-shade={fix.css}
      aria-hidden={held ? true : undefined}
      className={joinClassNames(
        "inline-flex min-w-0 items-center",
        held && "invisible",
      )}
    >
      <Button
        variant={"secondary"}
        title={
          ((((((fix.css) + (" \xB7 ")) + (formatContrastRatio(fix.ratio))) + (" ")) + (OnValue)) + (" ")) + (fix.ground)
        }
        aria-describedby={descriptionId}
        disabled={held}
        onPointerDown={(event?: Dynamic): Dynamic => {
          isTouchRef.current = event.pointerType === "touch";
        }}
        onClick={(): Dynamic => {
          let current: Dynamic = isTouchRef.current;
          isTouchRef.current = false;
          wasClickedRef.current = current;
          fix.onUse(current);
        }}
      >
        {readableShadeLabel}
      </Button>
      <span id={descriptionId} className={"sr-only"}>
        {readableShadeDescription({
          hex: fix.css,
          ratio: formatSpokenContrastRatio(fix.ratio),
          ground: fix.ground,
        })}
      </span>
    </span>
  );
}
export {
  ContrastAdvice,
  ContrastLockup,
  ContrastMark,
  contrastVerdictClassName,
  jsxColorContrastUi,
  ReadableShadeButton,
  rgbaCssValue,
  summarizeContrastResults,
  withoutAlpha,
};
export function installEditorColorContrastUi(): () => void {
  return () => {
    jsxColorContrastUi = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    withoutAlpha = (rgba?: Dynamic): Dynamic =>
      rgba === undefined
        ? undefined
        : {
            ...rgba,
            a: 1,
          };
    contrastVerdictClassName = (passes?: Dynamic): Dynamic =>
      passes ? "text-secondary" : "text-warning";
  };
}
