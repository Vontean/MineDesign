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
import { NotesLinkEditingHandler, resolveAnnotationTextColor } from "../editor/notes/link-editing";
import { NumericInput } from "../editor/properties/numeric-input";
import { PropertyOptionIcon } from "../editor/properties/tool-options";
import { CropValue } from "../editor/properties/tooltip";
import { SessionActionsPopover, SessionChoicePopup, SessionTypographyPopup } from "../editor/session-strip/popups";
import { SessionStripButton, SessionStripDivider, SessionStripGroup } from "../editor/session-strip/session-strip";
import { SessionArtboardStateEscape } from "../editor/session/artboard-state";
import { toModuleNamespace } from "../module-helpers";
import { annotationTextStyle, minAnnotationFontSize as minNoteFontSize, maxAnnotationFontSize as maxNoteFontSize, PlatformFileContentGrayRedOrangeValues, PlatformFileContentGrayRedOrangeValuesAlias, PlatformFileContentSMLConfig } from "../platform/file-content";
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
  let [, setSelectionTick]: Dynamic = (0, react_Nse.useState)(0);
  (0, react_Nse.useEffect)((): Dynamic => {
    let refreshSelection: Dynamic = (): Dynamic =>
      setSelectionTick((tick?: Dynamic): Dynamic => tick + 1);
    (document as Dynamic).addEventListener("selectionchange", refreshSelection);
    (document as Dynamic).addEventListener("keyup", refreshSelection);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("selectionchange", refreshSelection);
      (document as Dynamic).removeEventListener("keyup", refreshSelection);
    };
  }, []);
  let formattingState: Dynamic = getNoteFormattingState(document, base),
    renderFormatButton: Dynamic = (
      format?: Dynamic,
      label?: Dynamic,
      iconName?: Dynamic,
      shortcutKey?: Dynamic,
      isActive?: Dynamic,
    ): Dynamic => {
      let formattingRefusal: Dynamic = noteFormattingRefusal(
        format,
        base,
        document,
        words,
      );
      return (
        <SessionStripButton
          data-testid={
            testid === undefined ? undefined : testid + "-" + format
          }
          title={
            (formattingRefusal) || (chords ? ((((label) + (" (")) + (keyboardShortcutLabel(shortcutKey))) + (")")) : (label))
          }
          aria-label={label}
          aria-pressed={formattingRefusal === "" && isActive}
          disabled={formattingRefusal !== ""}
          icon={iconName}
          onPointerDown={(event?: Dynamic): Dynamic => event.preventDefault()}
          onClick={(): Dynamic => {
            toggleNoteFormatting(format, base);
            setSelectionTick((tick?: Dynamic): Dynamic => tick + 1);
          }}
        />
      );
    };
  return (
    <SessionStripGroup>
      {renderFormatButton("bold", uiMessage("inspector.annotationQuickActions.bold"), "TextBold", "B", formattingState.allBold)}
      {renderFormatButton("italic", uiMessage("inspector.annotationQuickActions.italic"), "TextItalics", "I", formattingState.allItalic)}
    </SessionStripGroup>
  );
}
function NoteTypographyQuickActions({
  spec: spec,
  onRestyle: onRestyle,
  typing = false,
}: Dynamic): Dynamic {
  useUiLocale();
  let textStyle: Dynamic = annotationTextStyle(spec),
    inkSwatches: Dynamic = [
      "default",
      ...PlatformFileContentGrayRedOrangeValues,
    ].map(
      (inkName?: Dynamic): Dynamic => ({
        name: inkName,
        color: resolveAnnotationTextColor(textStyle.kind, inkName),
        get label() { return inkName === "default" ? (uiMessage("inspector.annotationQuickActions.defaultInk")) : (inkName[0].toUpperCase() + inkName.slice(1)); },
      }),
    ),
    sizePreset: Dynamic = noteFontSizePresets.find(
      (preset?: Dynamic): Dynamic => preset.px === textStyle.size,
    );
  return (
    <SessionStripGroup wrap={true}>
      <SessionTypographyPopup
        testid={"mega-note-style"}
        value={sizePreset ? String(sizePreset.px) : null}
        chipText={sizePreset?.label ?? String(textStyle.size)}
        systemHeader={
          <div className={"mb-2"} data-testid={"mega-note-kind"}>
            <SegmentedControl
              aria-label={uiMessage("inspector.annotationQuickActions.noteStyle")}
              fullWidth={true}
              value={textStyle.kind}
              onChange={(noteKind?: Dynamic): Dynamic =>
                onRestyle({
                  kind: noteKind,
                })
              }
              segments={["note", "title1"].map(
                (noteKind?: Dynamic): Dynamic => ({
                  value: noteKind,
                  get label() { return noteKind === "note" ? ("Sticky") : (uiMessage("inspector.annotationQuickActions.title")); },
                  disabled: typing && noteKind !== textStyle.kind,
                  disabledReason: "Finish typing to change the note's kind",
                }),
              )}
            />
          </div>
        }
        options={noteFontSizePresets.map(
          (preset?: Dynamic): Dynamic => ({
            value: String(preset.px),
            text: preset.label,
            label: (
              <span
                style={{
                  fontSize: Math.min(22, Math.max(12, preset.px / 2.5)),
                  fontWeight: textStyle.kind === "title1" ? 700 : undefined,
                }}
              >
                {preset.label}
              </span>
            ),
            get hint() { return (String(preset.px)) + ("px"); },
          }),
        )}
        onChange={(sizeText?: Dynamic): Dynamic =>
          onRestyle({
            size: Number(sizeText),
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
              value={textStyle.size}
              min={minNoteFontSize}
              max={maxNoteFontSize}
              onValue={(customSize?: Dynamic): Dynamic => {
                customSize !== undefined &&
                  onRestyle({
                    size: customSize,
                  });
              }}
            />
          ),
        }}
      />
      <SessionActionsPopover
        testid={"mega-note-color"}
        title={uiMessage("inspector.annotationQuickActions.ink")}
        paint={resolveAnnotationTextColor(
          textStyle.kind,
          textStyle.color,
        )}
        swatches={inkSwatches}
        value={textStyle.color}
        onSwatch={(inkName?: Dynamic): Dynamic =>
          onRestyle({
            color: inkName,
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
  let textStyle: Dynamic = annotationTextStyle(spec);
  if (textStyle.kind !== "note") return null;
  let fillSwatches: Dynamic = [
    "default",
    ...PlatformFileContentGrayRedOrangeValuesAlias,
  ].map(
    (fillName?: Dynamic): Dynamic => ({
      name: fillName,
      color: NotesLinkEditingHandler(fillName),
      get label() { return fillName === "default" ? (uiMessage("inspector.annotationQuickActions.defaultYellow")) : (fillName[0].toUpperCase() + fillName.slice(1)); },
    }),
  );
  return (
    <jsx_Eo.Fragment>
      <SessionStripDivider />
      <SessionStripGroup>
        <SessionActionsPopover
          testid={"mega-note-fill"}
          title={uiMessage("inspector.annotationQuickActions.fill")}
          paint={NotesLinkEditingHandler(textStyle.fill)}
          swatches={fillSwatches}
          value={textStyle.fill}
          onSwatch={(fillName?: Dynamic): Dynamic =>
            onRestyle({
              fill: fillName,
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
  let textStyle: Dynamic = annotationTextStyle(spec),
    isCoarsePointer: Dynamic =
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
          aria-pressed={textStyle.bold}
          icon={"TextBold"}
          onClick={(): Dynamic =>
            onRestyle({
              bold: !textStyle.bold,
            })
          }
        />
        <SessionStripButton
          data-testid={"mega-note-italic"}
          title={uiMessage("inspector.annotationQuickActions.italic")}
          aria-label={uiMessage("inspector.annotationQuickActions.italic")}
          aria-pressed={textStyle.italic}
          icon={"TextItalics"}
          onClick={(): Dynamic =>
            onRestyle({
              italic: !textStyle.italic,
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
              onClick={(event?: Dynamic): Dynamic =>
                onComment(event.currentTarget)
              }
            />
          </SessionStripGroup>
        </jsx_Eo.Fragment>)}
      {isCoarsePointer && (<jsx_Eo.Fragment>
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
  let textStyle: Dynamic = annotationTextStyle(spec),
    [, setSelectionTick]: Dynamic = (0, react_RB.useState)(0);
  (0, react_RB.useEffect)((): Dynamic => {
    let refreshSelection: Dynamic = (): Dynamic =>
      setSelectionTick((tick?: Dynamic): Dynamic => tick + 1);
    (document as Dynamic).addEventListener("selectionchange", refreshSelection);
    (document as Dynamic).addEventListener("keyup", refreshSelection);
    return (): Dynamic => {
      (document as Dynamic).removeEventListener("selectionchange", refreshSelection);
      (document as Dynamic).removeEventListener("keyup", refreshSelection);
    };
  }, []);
  let formattingState: Dynamic = getNoteFormattingState(document, textStyle),
    withRefresh: Dynamic =
      (action?: Dynamic): Dynamic =>
      (): Dynamic => {
        action();
        setSelectionTick((tick?: Dynamic): Dynamic => tick + 1);
      },
    listKind: Dynamic = formattingState.ol ? "number" : formattingState.ul ? "bullet" : "none";
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
      <TextSelectionCount base={textStyle} testid={"mega-note-sel"} />
      <SessionStripDivider />
      <SessionStripGroup>
        <SessionChoicePopup
          testid={"mega-note-list"}
          title={
            uiMessage("inspector.annotationQuickActions.list", { listKind: String(listKind === "none" ? (uiMessage("inspector.annotationQuickActions.none")) : (listKind === "bullet" ? (uiMessage("inspector.annotationQuickActions.bulletedList")) : (uiMessage("inspector.annotationQuickActions.numberedList")))) })
          }
          face={listKind === "number" ? "ListNumbered" : "ListBullet"}
          value={listKind}
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
          onChange={(listChoice?: Dynamic): Dynamic =>
            withRefresh((): Dynamic => {
              listChoice === "none"
                ? formattingState.ul
                  ? toggleNoteList("ul")
                  : formattingState.ol && toggleNoteList("ol")
                : toggleNoteList(
                    listChoice === "bullet" ? "ul" : "ol",
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
              onClick={(event?: Dynamic): Dynamic =>
                onComment(event.currentTarget)
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
  let clipCssRef: Dynamic = (0, react_RB.useRef)([]);
  if (
    spec.kind === "image" &&
    spec.video !== undefined &&
    clip !== undefined
  ) {
    let clipCssIo: Dynamic = {
        get: (prop?: Dynamic): Dynamic => spec.css?.[prop],
        set: (cssEntries?: Dynamic, isLive?: Dynamic): Dynamic => {
          clipCssRef.current = cssEntries.map(
            ([propName, cssValue]: Dynamic): Dynamic => ({
              prop: propName,
              value: cssValue ?? null,
            }),
          );
          clip.onCss(clipCssRef.current, isLive);
        },
        settle: (): Dynamic => clip.onCss(clipCssRef.current, false),
      },
      pickReplacementFile: Dynamic = (): Dynamic => {
        let fileInput: Dynamic = (document as Dynamic).createElement("input");
        fileInput.type = "file";
        fileInput.accept =
          VideoMp4VideoWebmVideoQuicktimeMovValue + ",image/*";
        fileInput.hidden = true;
        (document as Dynamic).body.appendChild(fileInput);
        fileInput.addEventListener("cancel", (): Dynamic => fileInput.remove());
        fileInput.onchange = (): Dynamic => {
          let pickedFile: Dynamic = fileInput.files?.[0];
          fileInput.remove();
          pickedFile && clip.onReplace(pickedFile);
        };
        fileInput.click();
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
          io={clipCssIo}
          src={clip.src}
          ownAsset={true}
          onReplace={pickReplacementFile}
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
              onClick={(event?: Dynamic): Dynamic =>
                onComment(event.currentTarget)
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
  let usesStroke: Dynamic = spec.kind !== "rect" && spec.kind !== "oval",
    isImage: Dynamic = spec.kind === "image",
    colorName: Dynamic = spec.color ?? "default",
    customPaint: Dynamic = usesStroke
      ? spec.css?.stroke
      : (spec.css?.background ?? spec.css?.["background-color"]),
    colorSwatches: Dynamic = [
      "default",
      ...PlatformFileContentGrayRedOrangeValues,
    ].map(
      (swatchName?: Dynamic): Dynamic => ({
        name: swatchName,
        color: annotationColor(spec.kind, swatchName),
        get label() { return swatchName === "default" ? (uiMessage("inspector.annotationQuickActions.defaultGray")) : (swatchName[0].toUpperCase() + swatchName.slice(1)); },
      }),
    ),
    isCoarsePointer: Dynamic =
      typeof window !== "undefined" &&
      (window as Dynamic).matchMedia("(pointer: coarse)").matches;
  return (
    <jsx_Eo.Fragment>
      {!isImage && (<SessionStripGroup>
          <SessionActionsPopover
            testid={"mega-shape-color"}
            title={usesStroke ? (uiMessage("inspector.annotationQuickActions.stroke")) : (uiMessage("inspector.annotationQuickActions.fill"))}
            paint={customPaint ?? annotationColor(spec.kind, colorName)}
            swatches={colorSwatches}
            value={customPaint !== undefined ? null : colorName}
            onSwatch={(swatchName?: Dynamic): Dynamic =>
              onRecolor(swatchName === "default" ? "default" : swatchName)
            }
            editsAreUndoSteps={true}
          />
        </SessionStripGroup>)}
      {isImage && onCrop && (<SessionStripGroup>
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
          {!isImage || onCrop && (<SessionStripDivider />)}
          <SessionStripGroup>
            <SessionStripButton
              data-testid={"mega-note-comment"}
              icon={"ChatAdd"}
              title={
                isImage ? (uiMessage("inspector.annotationQuickActions.commentOnThis", { mediaKind: String(spec.kind === "image" && spec.video !== undefined ? (uiMessage("inspector.annotationQuickActions.video")) : (uiMessage("inspector.annotationQuickActions.picture"))) })) : (uiMessage("inspector.annotationQuickActions.commentOnThisShape"))
              }
              aria-label={uiMessage("inspector.annotationQuickActions.comment")}
              onClick={(event?: Dynamic): Dynamic =>
                onComment(event.currentTarget)
              }
            />
          </SessionStripGroup>
        </jsx_Eo.Fragment>)}
      {isCoarsePointer && (<jsx_Eo.Fragment>
          {!isImage || onComment != null || onCrop && (<SessionStripDivider />)}
          <SessionStripGroup>
            <SessionStripButton
              data-testid={"mega-note-delete"}
              title={
                uiMessage("inspector.annotationQuickActions.undoRestoresIt", { action: String(isImage ? (spec.kind === "image" && spec.video !== undefined ? (uiMessage("inspector.annotationQuickActions.deleteVideo")) : (uiMessage("inspector.annotationQuickActions.deletePicture"))) : (uiMessage("inspector.annotationQuickActions.deleteShape"))) })
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
