import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { annotationColor } from "../canvas/annotation-shape-style";
import { SegmentedControl } from "../cds/components/selection-points";
import { initializeCdsIndex } from "../cds/index";
import { load_react, load_react_jsx_runtime } from "../dependencies";
import { keyboardShortcutLabel } from "../editor/keyboard/shortcuts";
import { MediaPlaybackControlsQuerySelector, VideoPlayControl } from "../editor/media/playback-controls";
import { VideoMp4VideoWebmVideoQuicktimeMovValue } from "../editor/media/video-upload";
import { getNoteFormattingState, noteFormattingRefusal, NotesFormattingGetSelection, toggleNoteFormatting, toggleNoteList } from "../editor/notes/formatting";
import { NotesLinkEditingHandler, NotesLinkEditingHandler_2 } from "../editor/notes/link-editing";
import { NumericInput } from "../editor/properties/numeric-input";
import { PropertyOptionIcon } from "../editor/properties/tool-options";
import { CropValue } from "../editor/properties/tooltip";
import { SessionActionsPopover, SessionChoicePopup, SessionTypographyPopup } from "../editor/session-strip/popups";
import { SessionStripButton, SessionStripDivider, SessionStripGroup } from "../editor/session-strip/session-strip";
import { SessionArtboardStateEscape } from "../editor/session/artboard-state";
import { toModuleNamespace } from "../module-helpers";
import { annotationTextStyle, PlatformFileContentConstant_3, PlatformFileContentConstant_4, PlatformFileContentGrayRedOrangeValues, PlatformFileContentGrayRedOrangeValuesAlias, PlatformFileContentSMLConfig } from "../platform/file-content";
import { ImageQuickPanel } from "./quick-panel-bindings";

var react_RB: Dynamic;
var react_Nse: Dynamic;
var jsx_Dse: Dynamic;
var jsx_Eo: Dynamic;
var noteFontSizePresets: Dynamic;
function TextSelectionCount({
  base: base,
  words: words,
  chords = false,
  testid: testid,
}: Dynamic): Dynamic {
  useUiLocale();
  let [, value]: Dynamic = (0, react_Nse.useState)(0);
  (0, react_Nse.useEffect)((): Dynamic => {
    let callback2: Dynamic = (): Dynamic =>
      value((input?: Dynamic): Dynamic => input + 1);
    (document as Dynamic).addEventListener("selectionchange", callback2);
    (document as Dynamic).addEventListener("keyup", callback2);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("selectionchange", callback2);
      (document as Dynamic).removeEventListener("keyup", callback2);
    };
  }, []);
  let value2: Dynamic = getNoteFormattingState(document, base),
    callback: Dynamic = (
      input?: Dynamic,
      options?: Dynamic,
      context?: Dynamic,
      value3?: Dynamic,
      extra?: Dynamic,
    ): Dynamic => {
      let value4: Dynamic = noteFormattingRefusal(
        input,
        base,
        document,
        words,
      );
      return (
        <SessionStripButton
          data-testid={
            testid === undefined ? undefined : testid + "-" + input
          }
          title={
            (value4) || (chords ? ((((options) + (" (")) + (keyboardShortcutLabel(value3))) + (")")) : (options))
          }
          aria-label={options}
          aria-pressed={value4 === "" && extra}
          disabled={value4 !== ""}
          icon={context}
          onPointerDown={(event?: Dynamic): Dynamic => event.preventDefault()}
          onClick={(): Dynamic => {
            toggleNoteFormatting(input, base);
            value((input2?: Dynamic): Dynamic => input2 + 1);
          }}
        />
      );
    };
  return (
    <SessionStripGroup>
      {callback("bold", uiMessage("inspector.annotationQuickActions.bold"), "TextBold", "B", value2.allBold)}
      {callback("italic", uiMessage("inspector.annotationQuickActions.italic"), "TextItalics", "I", value2.allItalic)}
    </SessionStripGroup>
  );
}
function NoteTypographyQuickActions({
  spec: spec,
  onRestyle: onRestyle,
  typing = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = annotationTextStyle(spec),
    value2: Dynamic = [
      "default",
      ...PlatformFileContentGrayRedOrangeValues,
    ].map(
      (input?: Dynamic): Dynamic => ({
        name: input,
        color: NotesLinkEditingHandler_2(value.kind, input),
        get label() { return input === "default" ? (uiMessage("inspector.annotationQuickActions.defaultInk")) : (input[0].toUpperCase() + input.slice(1)); },
      }),
    ),
    value3: Dynamic = noteFontSizePresets.find(
      (input?: Dynamic): Dynamic => input.px === value.size,
    );
  return (
    <SessionStripGroup wrap={true}>
      <SessionTypographyPopup
        testid={"mega-note-style"}
        value={value3 ? String(value3.px) : null}
        chipText={value3?.label ?? String(value.size)}
        systemHeader={
          <div className={"mb-2"} data-testid={"mega-note-kind"}>
            <SegmentedControl
              aria-label={uiMessage("inspector.annotationQuickActions.noteStyle")}
              fullWidth={true}
              value={value.kind}
              onChange={(input?: Dynamic): Dynamic =>
                onRestyle({
                  kind: input,
                })
              }
              segments={["note", "title1"].map(
                (input?: Dynamic): Dynamic => ({
                  value: input,
                  get label() { return input === "note" ? ("Sticky") : (uiMessage("inspector.annotationQuickActions.title")); },
                  disabled: typing && input !== value.kind,
                  disabledReason: "Finish typing to change the note's kind",
                }),
              )}
            />
          </div>
        }
        options={noteFontSizePresets.map(
          (input?: Dynamic): Dynamic => ({
            value: String(input.px),
            text: input.label,
            label: (
              <span
                style={{
                  fontSize: Math.min(22, Math.max(12, input.px / 2.5)),
                  fontWeight: value.kind === "title1" ? 700 : undefined,
                }}
              >
                {input.label}
              </span>
            ),
            get hint() { return (String(input.px)) + ("px"); },
          }),
        )}
        onChange={(input?: Dynamic): Dynamic =>
          onRestyle({
            size: Number(input),
          })
        }
        custom={{
          body: (
            <NumericInput
              aria-label={uiMessage("inspector.annotationQuickActions.size")}
              unit={"px"}
              title={
                typing ? ("Finish typing to set a custom size") : ("Size (px)")
              }
              disabled={typing}
              value={value.size}
              min={PlatformFileContentConstant_3}
              max={PlatformFileContentConstant_4}
              onValue={(input?: Dynamic): Dynamic => {
                input !== undefined &&
                  onRestyle({
                    size: input,
                  });
              }}
            />
          ),
        }}
      />
      <SessionActionsPopover
        testid={"mega-note-color"}
        title={uiMessage("inspector.annotationQuickActions.ink")}
        paint={NotesLinkEditingHandler_2(
          value.kind,
          value.color,
        )}
        swatches={value2}
        value={value.color}
        onSwatch={(input?: Dynamic): Dynamic =>
          onRestyle({
            color: input,
          })
        }
        editsAreUndoSteps={!typing}
      />
    </SessionStripGroup>
  );
}
function NoteFillQuickActions({
  spec: spec,
  onRestyle: onRestyle,
  typing = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = annotationTextStyle(spec);
  if (value.kind !== "note") return null;
  let value2: Dynamic = [
    "default",
    ...PlatformFileContentGrayRedOrangeValuesAlias,
  ].map(
    (input?: Dynamic): Dynamic => ({
      name: input,
      color: NotesLinkEditingHandler(input),
      get label() { return input === "default" ? (uiMessage("inspector.annotationQuickActions.defaultYellow")) : (input[0].toUpperCase() + input.slice(1)); },
    }),
  );
  return (
    <jsx_Eo.Fragment>
      <SessionStripDivider />
      <SessionStripGroup>
        <SessionActionsPopover
          testid={"mega-note-fill"}
          title={uiMessage("inspector.annotationQuickActions.fill")}
          paint={NotesLinkEditingHandler(value.fill)}
          swatches={value2}
          value={value.fill}
          onSwatch={(input?: Dynamic): Dynamic =>
            onRestyle({
              fill: input,
            })
          }
          editsAreUndoSteps={!typing}
        />
      </SessionStripGroup>
    </jsx_Eo.Fragment>
  );
}
function NoteQuickActions({
  spec: spec,
  onRestyle: onRestyle,
  onDelete: onDelete,
  onComment: onComment,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = annotationTextStyle(spec),
    value2: Dynamic =
      typeof window !== "undefined" &&
      (window as Dynamic).matchMedia("(pointer: coarse)").matches;
  return (
    <jsx_Eo.Fragment>
      <NoteTypographyQuickActions spec={spec} onRestyle={onRestyle} />
      <SessionStripGroup>
        <SessionStripButton
          data-testid={"mega-note-bold"}
          title={uiMessage("inspector.annotationQuickActions.bold")}
          aria-label={uiMessage("inspector.annotationQuickActions.bold")}
          aria-pressed={value.bold}
          icon={"TextBold"}
          onClick={(): Dynamic =>
            onRestyle({
              bold: !value.bold,
            })
          }
        />
        <SessionStripButton
          data-testid={"mega-note-italic"}
          title={uiMessage("inspector.annotationQuickActions.italic")}
          aria-label={uiMessage("inspector.annotationQuickActions.italic")}
          aria-pressed={value.italic}
          icon={"TextItalics"}
          onClick={(): Dynamic =>
            onRestyle({
              italic: !value.italic,
            })
          }
        />
      </SessionStripGroup>
      <NoteFillQuickActions spec={spec} onRestyle={onRestyle} />
      {onComment != null && (<jsx_Eo.Fragment>
          <SessionStripDivider />
          <SessionStripGroup>
            <SessionStripButton
              data-testid={"mega-note-comment"}
              icon={"ChatAdd"}
              title={uiMessage("inspector.annotationQuickActions.commentOnThisNote")}
              aria-label={uiMessage("inspector.annotationQuickActions.comment")}
              onClick={(input?: Dynamic): Dynamic =>
                onComment(input.currentTarget)
              }
            />
          </SessionStripGroup>
        </jsx_Eo.Fragment>)}
      {value2 && (<jsx_Eo.Fragment>
          <SessionStripDivider />
          <SessionStripGroup>
            <SessionStripButton
              data-testid={"mega-note-delete"}
              title={uiMessage("inspector.annotationQuickActions.deleteNoteUndoRestoresIt")}
              aria-label={uiMessage("inspector.annotationQuickActions.delete")}
              icon={"Trash"}
              onClick={onDelete}
            />
          </SessionStripGroup>
        </jsx_Eo.Fragment>)}
    </jsx_Eo.Fragment>
  );
}
function EditingNoteQuickActions({
  spec: spec,
  onRestyle: onRestyle,
  onComment: onComment,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = annotationTextStyle(spec),
    [, value2]: Dynamic = (0, react_RB.useState)(0);
  (0, react_RB.useEffect)((): Dynamic => {
    let callback2: Dynamic = (): Dynamic =>
      value2((input?: Dynamic): Dynamic => input + 1);
    (document as Dynamic).addEventListener("selectionchange", callback2);
    (document as Dynamic).addEventListener("keyup", callback2);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("selectionchange", callback2);
      (document as Dynamic).removeEventListener("keyup", callback2);
    };
  }, []);
  let value3: Dynamic = getNoteFormattingState(document, value),
    callback: Dynamic =
      (input?: Dynamic): Dynamic =>
      (): Dynamic => {
        input();
        value2((input2?: Dynamic): Dynamic => input2 + 1);
      },
    value4: Dynamic = value3.ol ? "number" : value3.ul ? "bullet" : "none";
  return (
    <span
      data-note-typing-strip={""}
      style={{
        display: "contents",
      }}
      onKeyDown={(event?: Dynamic): Dynamic => {
        event.key === "Escape" &&
          (event.preventDefault(),
          NotesFormattingGetSelection());
      }}
    >
      <NoteTypographyQuickActions
        spec={spec}
        onRestyle={onRestyle}
        typing={true}
      />
      <TextSelectionCount base={value} testid={"mega-note-sel"} />
      <SessionStripDivider />
      <SessionStripGroup>
        <SessionChoicePopup
          testid={"mega-note-list"}
          title={
            uiMessage("inspector.annotationQuickActions.list", { value1: String(value4 === "none" ? (uiMessage("inspector.annotationQuickActions.none")) : (value4 === "bullet" ? (uiMessage("inspector.annotationQuickActions.bulletedList")) : (uiMessage("inspector.annotationQuickActions.numberedList")))) })
          }
          face={value4 === "number" ? "ListNumbered" : "ListBullet"}
          value={value4}
          options={[
            {
              value: "none",
              get label() { return uiMessage("inspector.annotationQuickActions.none"); },
              icon: "Prohibit",
            },
            {
              value: "bullet",
              get label() { return uiMessage("inspector.annotationQuickActions.bulletedList"); },
              icon: "ListBullet",
            },
            {
              value: "number",
              get label() { return uiMessage("inspector.annotationQuickActions.numberedList"); },
              icon: "ListNumbered",
            },
          ]}
          onChange={(input?: Dynamic): Dynamic =>
            callback((): Dynamic => {
              input === "none"
                ? value3.ul
                  ? toggleNoteList("ul")
                  : value3.ol && toggleNoteList("ol")
                : toggleNoteList(
                    input === "bullet" ? "ul" : "ol",
                  );
            })()
          }
        />
      </SessionStripGroup>
      <NoteFillQuickActions spec={spec} onRestyle={onRestyle} typing={true} />
      {onComment != null && (<jsx_Eo.Fragment>
          <SessionStripDivider />
          <SessionStripGroup>
            <SessionStripButton
              data-testid={"mega-note-comment"}
              icon={"ChatAdd"}
              title={uiMessage("inspector.annotationQuickActions.commentOnThisNote")}
              aria-label={uiMessage("inspector.annotationQuickActions.comment")}
              onPointerDown={(event?: Dynamic): Dynamic =>
                event.preventDefault()
              }
              onClick={(input?: Dynamic): Dynamic =>
                onComment(input.currentTarget)
              }
            />
          </SessionStripGroup>
        </jsx_Eo.Fragment>)}
    </span>
  );
}
function CanvasObjectQuickActions({
  spec: spec,
  onRecolor: onRecolor,
  onDelete: onDelete,
  onComment: onComment,
  cropping = false,
  onCrop: onCrop,
  cropReason: cropReason,
  clip: clip,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = (0, react_RB.useRef)([]);
  if (
    spec.kind === "image" &&
    spec.video !== undefined &&
    clip !== undefined
  ) {
    let state: Dynamic = {
        get: (input?: Dynamic): Dynamic => spec.css?.[input],
        set: (input?: Dynamic, options?: Dynamic): Dynamic => {
          value.current = input.map(
            ([input2, input3]: Dynamic): Dynamic => ({
              prop: input2,
              value: input3 ?? null,
            }),
          );
          clip.onCss(value.current, options);
        },
        settle: (): Dynamic => clip.onCss(value.current, false),
      },
      callback: Dynamic = (): Dynamic => {
        let value8: Dynamic = (document as Dynamic).createElement("input");
        value8.type = "file";
        value8.accept =
          VideoMp4VideoWebmVideoQuicktimeMovValue + ",image/*";
        value8.hidden = true;
        (document as Dynamic).body.appendChild(value8);
        value8.addEventListener("cancel", (): Dynamic => value8.remove());
        value8.onchange = (): Dynamic => {
          let value9: Dynamic = value8.files?.[0];
          value8.remove();
          value9 && clip.onReplace(value9);
        };
        value8.click();
      };
    return (
      <jsx_Eo.Fragment>
        <SessionStripGroup>
          <VideoPlayControl
            find={(): Dynamic =>
              (document as Dynamic).querySelector(
                SessionArtboardStateEscape(spec.id),
              )
            }
            whyAbsent={(): Dynamic =>
              MediaPlaybackControlsQuerySelector(spec.id)
            }
          />
        </SessionStripGroup>
        <ImageQuickPanel
          io={state}
          src={clip.src}
          ownAsset={true}
          onReplace={callback}
          replaceTitle={"Replace video"}
          onCrop={onCrop}
          cropping={cropping}
          cropReason={cropReason}
          noun={"video"}
        />
        <SessionStripDivider />
        <SessionStripGroup>
          {onComment != null && (<SessionStripButton
              data-testid={"mega-note-comment"}
              icon={"ChatAdd"}
              title={uiMessage("inspector.annotationQuickActions.commentOnThisVideo")}
              aria-label={uiMessage("inspector.annotationQuickActions.comment")}
              onClick={(input?: Dynamic): Dynamic =>
                onComment(input.currentTarget)
              }
            />)}
          {clip.onOpenProps && (<SessionStripButton
              data-testid={"mega-note-props"}
              icon={"DotsVertical"}
              title={uiMessage("inspector.annotationQuickActions.openThePropertiesPanel")}
              aria-label={uiMessage("inspector.annotationQuickActions.properties")}
              onClick={clip.onOpenProps}
            />)}
        </SessionStripGroup>
        {typeof window !== "undefined" &&
          (window as Dynamic).matchMedia("(pointer: coarse)").matches && (<jsx_Eo.Fragment>
              <SessionStripDivider />
              <SessionStripGroup>
                <SessionStripButton
                  data-testid={"mega-note-delete"}
                  title={uiMessage("inspector.annotationQuickActions.deleteVideoUndoRestoresIt")}
                  aria-label={uiMessage("inspector.annotationQuickActions.delete")}
                  icon={"Trash"}
                  onClick={onDelete}
                />
              </SessionStripGroup>
            </jsx_Eo.Fragment>)}
      </jsx_Eo.Fragment>
    );
  }
  let value2: Dynamic = spec.kind !== "rect" && spec.kind !== "oval",
    value3: Dynamic = spec.kind === "image",
    value4: Dynamic = spec.color ?? "default",
    value5: Dynamic = value2
      ? spec.css?.stroke
      : (spec.css?.background ?? spec.css?.["background-color"]),
    value6: Dynamic = [
      "default",
      ...PlatformFileContentGrayRedOrangeValues,
    ].map(
      (input?: Dynamic): Dynamic => ({
        name: input,
        color: annotationColor(spec.kind, input),
        get label() { return input === "default" ? (uiMessage("inspector.annotationQuickActions.defaultGray")) : (input[0].toUpperCase() + input.slice(1)); },
      }),
    ),
    value7: Dynamic =
      typeof window !== "undefined" &&
      (window as Dynamic).matchMedia("(pointer: coarse)").matches;
  return (
    <jsx_Eo.Fragment>
      {!value3 && (<SessionStripGroup>
          <SessionActionsPopover
            testid={"mega-shape-color"}
            title={value2 ? (uiMessage("inspector.annotationQuickActions.stroke")) : (uiMessage("inspector.annotationQuickActions.fill"))}
            paint={value5 ?? annotationColor(spec.kind, value4)}
            swatches={value6}
            value={value5 !== undefined ? null : value4}
            onSwatch={(input?: Dynamic): Dynamic =>
              onRecolor(input === "default" ? "default" : input)
            }
            editsAreUndoSteps={true}
          />
        </SessionStripGroup>)}
      {value3 && onCrop && (<SessionStripGroup>
          <SessionStripButton
            data-testid={"mega-picture-crop"}
            data-media-crop-keep={""}
            icon={<PropertyOptionIcon icon={CropValue} />}
            title={
              cropReason ?? (cropping ? (uiMessage("inspector.annotationQuickActions.doneCroppingOrPressEnter")) : (uiMessage("inspector.annotationQuickActions.cropOrDoubleClickThe")))
            }
            aria-label={uiMessage("inspector.annotationQuickActions.crop")}
            aria-pressed={cropping}
            onClick={onCrop}
            disabled={cropReason !== undefined}
          />
        </SessionStripGroup>)}
      {onComment != null && (<jsx_Eo.Fragment>
          {!value3 || onCrop && (<SessionStripDivider />)}
          <SessionStripGroup>
            <SessionStripButton
              data-testid={"mega-note-comment"}
              icon={"ChatAdd"}
              title={
                value3 ? (uiMessage("inspector.annotationQuickActions.commentOnThis", { value1: String(spec.kind === "image" && spec.video !== undefined ? (uiMessage("inspector.annotationQuickActions.video")) : (uiMessage("inspector.annotationQuickActions.picture"))) })) : (uiMessage("inspector.annotationQuickActions.commentOnThisShape"))
              }
              aria-label={uiMessage("inspector.annotationQuickActions.comment")}
              onClick={(input?: Dynamic): Dynamic =>
                onComment(input.currentTarget)
              }
            />
          </SessionStripGroup>
        </jsx_Eo.Fragment>)}
      {value7 && (<jsx_Eo.Fragment>
          {!value3 || onComment != null || onCrop && (<SessionStripDivider />)}
          <SessionStripGroup>
            <SessionStripButton
              data-testid={"mega-note-delete"}
              title={
                uiMessage("inspector.annotationQuickActions.undoRestoresIt", { value1: String(value3 ? (spec.kind === "image" && spec.video !== undefined ? (uiMessage("inspector.annotationQuickActions.deleteVideo")) : (uiMessage("inspector.annotationQuickActions.deletePicture"))) : (uiMessage("inspector.annotationQuickActions.deleteShape"))) })
              }
              aria-label={uiMessage("inspector.annotationQuickActions.delete")}
              icon={"Trash"}
              onClick={onDelete}
            />
          </SessionStripGroup>
        </jsx_Eo.Fragment>)}
    </jsx_Eo.Fragment>
  );
}
export {
  CanvasObjectQuickActions,
  EditingNoteQuickActions,
  jsx_Dse,
  jsx_Eo,
  NoteFillQuickActions,
  noteFontSizePresets,
  NoteQuickActions,
  NoteTypographyQuickActions,
  react_Nse,
  react_RB,
  TextSelectionCount,
};
export function installPropertiesAnnotationQuickActions(): () => void {
  return () => {
    react_RB = toModuleNamespace(load_react(), 1);
    initializeCdsIndex();
    react_Nse = toModuleNamespace(load_react(), 1);
    jsx_Dse = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    jsx_Eo = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    noteFontSizePresets = [
      {
        get label() { return uiMessage("inspector.annotationQuickActions.small"); },
        px: PlatformFileContentSMLConfig.s,
      },
      {
        get label() { return uiMessage("inspector.annotationQuickActions.medium"); },
        px: PlatformFileContentSMLConfig.m,
      },
      {
        get label() { return uiMessage("inspector.annotationQuickActions.large"); },
        px: PlatformFileContentSMLConfig.l,
      },
      {
        get label() { return uiMessage("inspector.annotationQuickActions.extraLarge"); },
        px: PlatformFileContentSMLConfig.xl,
      },
      {
        get label() { return uiMessage("inspector.annotationQuickActions.huge"); },
        px: PlatformFileContentSMLConfig.xxl,
      },
    ];
  };
}
