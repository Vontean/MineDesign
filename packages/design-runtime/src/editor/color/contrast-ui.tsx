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
import { ColorContrastCopyLabel_10, ColorContrastCopyLabel_11, ColorContrastCopyLabel_9, detailedContrastSentence, OnValue, reactColorContrastCopy, readableShadeDescription, summarizedContrastSentence } from "./contrast-copy";
import { formatContrastRatio, formatSpokenContrastRatio, parseRgbaColor, worstContrastResult } from "./contrast";
import { toModuleNamespace } from "../../module-helpers";

var jsxColorContrastUi: Dynamic;
var withoutAlpha: Dynamic;
var contrastVerdictClassName: Dynamic;
function summarizeContrastResults(input?: Dynamic): Dynamic {
  let value: Dynamic = (0, worstContrastResult)(input),
    value2: Dynamic = input.filter(
      (input2?: Dynamic): Dynamic => input2 !== value,
    ),
    items: Dynamic = [
      value,
      ...value2.sort(
        (input2?: Dynamic, options?: Dynamic): Dynamic =>
          input2.ratio - options.ratio,
      ),
    ],
    state: Dynamic = {
      ratio: (0, formatSpokenContrastRatio)(value.ratio),
      ground: value.ground.label,
      passes: value.passes,
      min: (0, formatSpokenContrastRatio)(value.min),
      alsoPassing: value2.filter((input2?: Dynamic): Dynamic => input2.passes)
        .length,
    },
    value3: Dynamic = value2.filter(
      (input2?: Dynamic): Dynamic => !input2.passes,
    ),
    value4: Dynamic = (0, summarizedContrastSentence)({
      ...state,
      alsoFailing: value3.length,
    }),
    value5: Dynamic = value4.length - AccessibilityAnnouncerLimit;
  if (value5 > 0) {
    let value6: Dynamic = state.ground
      .slice(0, Math.max(1, state.ground.length - value5 - 1))
      .replace(/[\uD800-\uDBFF]$/, "");
    value4 = (0, summarizedContrastSentence)({
      ...state,
      ground: value6 + "\u2026",
      alsoFailing: value3.length,
    });
  }
  return {
    worst: value,
    title: items
      .map(
        (input2?: Dynamic): Dynamic =>
          (0, formatContrastRatio)(input2.ratio) +
          " " +
          OnValue +
          " " +
          input2.ground.label,
      )
      .join(" \xB7 "),
    sentence: (0, detailedContrastSentence)({
      ...state,
      alsoFailing: value3.map(
        (input2?: Dynamic): Dynamic => input2.ground.label,
      ),
    }),
    spoken: value4,
  };
}
function rgbaCssValue(input?: Dynamic): Dynamic {
  if (input === undefined) return;
  let callback: Dynamic = (input2?: Dynamic): Dynamic =>
    Math.round(input2 * 255);
  return (
    "rgb(" +
    String(callback(input.r)) +
    " " +
    String(callback(input.g)) +
    " " +
    String(callback(input.b)) +
    " / " +
    String(Math.round(input.a * 1e3) / 1e3) +
    ")"
  );
}
function ContrastMark({
  results: results,
  sentence = true,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = summarizeContrastResults(results),
    worst: Dynamic = value.worst;
  return (
    <span
      data-kit={"contrast-mark"}
      data-verdict={worst.passes ? "pass" : "fail"}
      title={value.title}
      aria-hidden={sentence ? undefined : true}
      className={(0, joinClassNames)(
        "inline-flex shrink-0 items-center gap-0.5 text-caption",
        contrastVerdictClassName(worst.passes),
        className,
      )}
    >
      <span aria-hidden={"true"} className={"flex items-center gap-0.5"}>
        <Icon name={worst.passes ? "Check" : "Warning"} size={"xs"} />
        <span className={"tabular-nums"}>
          {(0, formatContrastRatio)(worst.ratio)}
        </span>
      </span>
      {sentence ? (<span className={"sr-only"}>{value.sentence}</span>) : (null)}
    </span>
  );
}
function ContrastLockup({
  fg: fg2,
  results: results,
  className: className,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = summarizeContrastResults(results),
    worst: Dynamic = value.worst;
  return (
    <span
      data-kit={"contrast-lockup"}
      data-verdict={worst.passes ? "pass" : "fail"}
      aria-hidden={"true"}
      title={value.title}
      className={(0, joinClassNames)(
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
            withoutAlpha((0, parseRgbaColor)(worst.ground.css)),
          ),
          color: rgbaCssValue(
            typeof fg2 == "string" ? (0, parseRgbaColor)(fg2) : fg2,
          ),
        }}
      >
        <Icon name={"TextAa"} size={"xs"} />
      </span>
      <span className={worst.passes ? "text-primary" : "text-warning"}>
        {worst.passes ? (ColorContrastCopyLabel_9) : (ColorContrastCopyLabel_10)}
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
  let value: Dynamic = summarizeContrastResults(results),
    worst: Dynamic = value.worst;
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
          {value.sentence}
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
  let value: Dynamic = (0, reactColorContrastCopy.useId)(),
    value2: Dynamic = (0, reactColorContrastCopy.useRef)(false),
    value3: Dynamic = (0, reactColorContrastCopy.useRef)(null),
    value4: Dynamic = (0, reactColorContrastCopy.useCallback)(
      (input?: Dynamic): Dynamic => {
        value3.current = input;
        typeof rootRef == "function"
          ? rootRef(input)
          : rootRef && (rootRef.current = input);
      },
      [rootRef],
    ),
    value5: Dynamic = (0, reactColorContrastCopy.useRef)(false),
    value6: Dynamic = (0, reactColorContrastCopy.useRef)(held);
  value6.current = held;
  let value7: Dynamic = (0, reactColorContrastCopy.useRef)(
    onGoneFocused,
  );
  value7.current = onGoneFocused;
  (0, reactColorContrastCopy.useLayoutEffect)(
    (): Dynamic => (): Dynamic => {
      value5.current ||
        value6.current ||
        value3.current === null ||
        (value3.current.contains((document as Dynamic).activeElement) &&
          value7.current?.());
    },
    [],
  );
  return (
    <span
      ref={value4}
      data-kit={"contrast-fix"}
      data-shade={fix.css}
      aria-hidden={held ? true : undefined}
      className={(0, joinClassNames)(
        "inline-flex min-w-0 items-center",
        held && "invisible",
      )}
    >
      <Button
        variant={"secondary"}
        title={
          ((((((fix.css) + (" \xB7 ")) + ((0, formatContrastRatio)(fix.ratio))) + (" ")) + (OnValue)) + (" ")) + (fix.ground)
        }
        aria-describedby={value}
        disabled={held}
        onPointerDown={(input?: Dynamic): Dynamic => {
          value2.current = input.pointerType === "touch";
        }}
        onClick={(): Dynamic => {
          let current: Dynamic = value2.current;
          value2.current = false;
          value5.current = current;
          fix.onUse(current);
        }}
      >
        {ColorContrastCopyLabel_11}
      </Button>
      <span id={value} className={"sr-only"}>
        {(0, readableShadeDescription)({
          hex: fix.css,
          ratio: (0, formatSpokenContrastRatio)(fix.ratio),
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
    jsxColorContrastUi = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    withoutAlpha = (input?: Dynamic): Dynamic =>
      input === undefined
        ? undefined
        : {
            ...input,
            a: 1,
          };
    contrastVerdictClassName = (input?: Dynamic): Dynamic =>
      input ? "text-secondary" : "text-warning";
  };
}
