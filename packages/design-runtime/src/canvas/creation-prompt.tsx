import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { CanvasWorkingLabelAnimationLabel, ClaudeWorkingLabel } from "./working-label-animation";
import { Button } from "../cds/button/button";
import { initializeCdsIndex } from "../cds/index";
import { PeerBadge } from "../collaboration/peer-badge";
import { load_react_jsx_runtime } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { useClaudeActivity } from "../platform/claude-activity";
import { useHostDrawsClaudeTips } from "../platform/frame-host-bridge";

var designCreationTips: Dynamic;
var jsx_xu: Dynamic;
var AddArtboardPromptButton: Dynamic;
var CreationWorkingAnnouncement: Dynamic;
function designCreationTipIndex(elapsedMs?: Dynamic): Dynamic {
  return elapsedMs < 3e3
    ? -1
    : Math.floor((elapsedMs - 3e3) / 5e3) % designCreationTips.length;
}
function timeUntilNextDesignCreationTip(elapsedMs?: Dynamic): Dynamic {
  return elapsedMs < 3e3 ? 3e3 - elapsedMs : 5e3 - ((elapsedMs - 3e3) % 5e3);
}
function EmptyCanvasPrompt({
  sentence: sentence,
  onAdd: onAdd,
}: Dynamic): Dynamic {
  useUiLocale();
  return (
    <jsx_xu.Fragment>
      <p className={"m-0 text-[12.5px] text-secondary"}>{sentence}</p>
      {AddArtboardPromptButton(onAdd)}
    </jsx_xu.Fragment>
  );
}
function BusyCanvasPrompt({
  prompt: prompt,
  tucked = false,
  sentence: sentence,
  busy: busy,
  onAdd: onAdd,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, useClaudeActivity)() === "working";
  return (
    <ClaudeWorkingLabel
      working={value}
      busy={busy}
      tint={"violet"}
      idle={
        <p
          className={
            "m-0 text-[12.5px] text-secondary" + (prompt ? "" : " invisible")
          }
          aria-hidden={prompt ? undefined : true}
        >
          {sentence}
        </p>
      }
      action={prompt ? AddArtboardPromptButton(onAdd, tucked) : null}
    />
  );
}
function DesignCreationPrompt({
  tip: tip,
  card = false,
  prompt: prompt,
  tucked = false,
  sentence: sentence,
  busy: busy,
  onAdd: onAdd,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, useHostDrawsClaudeTips)(),
    value2: Dynamic = (
      <PeerBadge
        tint={"violet"}
        label={
          value ? ({
                kind: "name",
                // MineDesign: user-facing copy calls the agent "the agent", not Claude.
                text: "Agent",
              }) : ({
                kind: "words",
                text:
                  tip < 0
                    ? CanvasWorkingLabelAnimationLabel
                    : designCreationTips[tip],
                index: tip,
                shimmer: true,
                outMs: 80,
                inMs: 120,
              })
        }
      />
    );
  return card ? (
    <div
      data-testid={"dc-creation-tips"}
      className={"flex flex-col items-center gap-3"}
    >
      <div className={"relative"} aria-busy={busy ? true : undefined}>
        <div
          aria-hidden={"true"}
          className={"dc-creation-card aspect-[20/1]"}
        />
        <div
          aria-hidden={"true"}
          data-testid={"dc-creation-card"}
          className={"dc-creation-card aspect-[4/3] mc-claude-box"}
        />
        <div
          aria-hidden={"true"}
          className={
            "absolute inset-x-0 bottom-0 flex aspect-[4/3] items-center justify-center pb-12"
          }
        >
          {value2}
        </div>
      </div>
      {prompt ? (AddArtboardPromptButton(onAdd, true)) : (null)}
      <span className={"sr-only"}>
        {CanvasWorkingLabelAnimationLabel}
      </span>
    </div>
  ) : (
    <div
      data-testid={"dc-creation-tips"}
      className={"flex flex-col items-center gap-3"}
    >
      <div className={"relative"} aria-busy={busy ? true : undefined}>
        <p
          className={"invisible m-0 text-[12.5px] text-secondary"}
          aria-hidden={"true"}
        >
          {sentence}
        </p>
        <div
          className={
            "absolute inset-x-0 -bottom-3 flex items-center justify-center"
          }
          style={{
            height: "max(100% + 68px, 156px)",
          }}
          aria-hidden={"true"}
        >
          {value2}
        </div>
      </div>
      {prompt ? (AddArtboardPromptButton(onAdd, tucked)) : (null)}
      <span className={"sr-only"}>
        {CanvasWorkingLabelAnimationLabel}
      </span>
    </div>
  );
}
export {
  AddArtboardPromptButton,
  BusyCanvasPrompt,
  CreationWorkingAnnouncement,
  DesignCreationPrompt,
  designCreationTipIndex,
  designCreationTips,
  EmptyCanvasPrompt,
  jsx_xu,
  timeUntilNextDesignCreationTip,
};
export function installCanvasCreationPrompt(): () => void {
  return () => {
    (0, initializeCdsIndex)();
    designCreationTips = [
      "Double-click text to edit it.",
      // MineDesign: user-facing copy calls the agent "the agent", not Claude.
      uiMessage("canvas.creationPrompt.commentOnAnyPartAnd"),
      uiMessage("canvas.creationPrompt.invitePeopleToViewComment"),
      uiMessage("canvas.creationPrompt.useInACommentTo"),
      uiMessage("canvas.creationPrompt.dragInAPictureFrom"),
      uiMessage("canvas.creationPrompt.everyEditSavesAutomatically"),
      uiMessage("canvas.creationPrompt.peopleYouShareWithSee"),
      uiMessage("canvas.creationPrompt.dragAnArtboardByIts"),
      uiMessage("canvas.creationPrompt.selectAnyElementToComment"),
    ];
    jsx_xu = (0, toModuleNamespace)(
      (0, load_react_jsx_runtime)(),
      1,
    );
    AddArtboardPromptButton = (
      input?: Dynamic,
      options: Dynamic = false,
    ): Dynamic => (
      <span
        data-tucked={options || undefined}
        className={
          options ? "sr-only has-[:focus-visible]:not-sr-only" : "contents"
        }
      >
        <Button
          variant={"secondary"}
          className={"pointer-events-auto"}
          data-testid={"dc-empty-page-add"}
          onClick={input}
        >
          {uiMessage("canvas.creationPrompt.addAnArtboard")}
        </Button>
      </span>
    );
    CreationWorkingAnnouncement = (): Dynamic => (
      <span className={"sr-only"} data-testid={"dc-creation-working"}>
        {CanvasWorkingLabelAnimationLabel}
      </span>
    );
  };
}
