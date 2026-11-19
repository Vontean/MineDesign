import { useUiLocale } from '../ui-locale.ts';
import { uiMessage } from '@minedesign/contracts/ui-messages';
/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../runtime-types";
import { useViewportStore, ViewportScale } from "../canvas/viewport-store";
import { Button } from "../cds/button/button";
import { Icon } from "../cds/components/icon";
import { SelectionRing } from "../cds/components/selection-ring";
import { load_react_jsx_runtime } from "../dependencies";
import { announce } from "../editor/accessibility/announcer";
import { PickerRuntimeScriptTAppAccentConfig } from "../editor/picker/runtime-script";
import { SessionStrip, SessionStripButton, SessionStripDivider, SessionStripGroup } from "../editor/session-strip/session-strip";
import { ExportCancelled, react_Su } from "./host-registry";
import { imageCaptureScaleOptions } from "./paper-and-scale";
import { getArtboardCaptureMode } from "./warnings";
import { toModuleNamespace } from "../module-helpers";

var exportSupportsMultipleArtboards: Dynamic;
var exportSupportsScale: Dynamic;
var canvasExportMaxDurationMs: Dynamic;
var exportChosenCountLabel: Dynamic;
var jsx_gd: Dynamic;
var focusExportPickerToolbar: Dynamic;
var exportPickerAriaLabels: Dynamic;
var exportPickerChromeHeight: Dynamic;
function interactiveExportDeadline(
  startedAt?: Dynamic,
  now: Dynamic = Date.now(),
): Dynamic {
  return Math.max(now + 55e3, startedAt + 265e3);
}
function exportArtboardTitle(artboard?: Dynamic): Dynamic {
  return artboard.title ?? artboard.file.replace(/\.dc\.html$/, "");
}
function initialExportPickedFiles(
  format?: Dynamic,
  artboards?: Dynamic,
  focusedFile?: Dynamic,
  selectedFiles?: Dynamic,
  pageId?: Dynamic,
): Dynamic {
  if (focusedFile !== null && format === "pdf")
    return new Set(artboards.map((artboard?: Dynamic): Dynamic => artboard.file));
  let value: Dynamic =
    focusedFile === null
      ? undefined
      : artboards.find(
          (artboard?: Dynamic): Dynamic => artboard.file === focusedFile,
        );
  if (value) return new Set([value.file]);
  let initialSelection: Dynamic = artboards
    .filter((artboard?: Dynamic): Dynamic => selectedFiles.has(artboard.file))
    .map((artboard?: Dynamic): Dynamic => artboard.file);
  if (format === "pdf")
    return new Set(
      initialSelection.length > 0
        ? initialSelection
        : artboards.map((artboard?: Dynamic): Dynamic => artboard.file),
    );
  if (initialSelection.length > 0)
    return new Set(format === "png" && initialSelection.length > 1 ? [] : initialSelection);
  let defaultArtboard: Dynamic =
    (pageId === null
      ? undefined
      : artboards.find(
          (artboard?: Dynamic): Dynamic => artboard.file === pageId,
        )) ?? artboards[0];
  return new Set(defaultArtboard ? [defaultArtboard.file] : []);
}
function toggleExportPickedFile(
  format?: Dynamic,
  picked?: Dynamic,
  file?: Dynamic,
): Dynamic {
  if (!exportSupportsMultipleArtboards(format)) return new Set([file]);
  let values: Dynamic = new Set(picked);
  values.delete(file) || values.add(file);
  return values;
}
function pickedExportArtboards(
  artboards?: Dynamic,
  pickedFiles?: Dynamic,
): Dynamic {
  return artboards.filter(
    (artboard?: Dynamic): Dynamic => pickedFiles.has(artboard.file),
  );
}
function artboardSupportsExportScale(
  artboard?: Dynamic,
  scale?: Dynamic,
): Dynamic {
  return (
    scale === 1 ||
    artboard === undefined ||
    imageCaptureScaleOptions(artboard.w, artboard.h).some(
      (scaleOption?: Dynamic): Dynamic => scaleOption.scale === scale && scaleOption.fits,
    )
  );
}
function initialExportScale(artboards?: Dynamic, file?: Dynamic): Dynamic {
  return artboards.some(
    (artboard?: Dynamic): Dynamic =>
      artboard.file === file || !artboardSupportsExportScale(artboard, 2),
  )
    ? 1
    : 2;
}
function artboardNeedsScaledDownExport(artboard?: Dynamic): Dynamic {
  return !imageCaptureScaleOptions(artboard.w, artboard.h).some(
    (scaleOption?: Dynamic): Dynamic => scaleOption.fits && scaleOption.scale <= 2,
  );
}
function describeExportScaleOption(
  artboards?: Dynamic,
  scale?: Dynamic,
  captureOptions: Dynamic = {},
): Dynamic {
  let [value]: Dynamic = artboards;
  if (value === undefined)
    return {
      offered: true,
      get title() { return uiMessage("canvas.picker.exportAt", { value1: String(String(scale)) }); },
    };
  if (artboards.length > 1) {
    let unsupportedArtboard: Dynamic = artboards.find(
      (artboard?: Dynamic): Dynamic =>
        !artboardSupportsExportScale(artboard, scale),
    );
    if (unsupportedArtboard)
      return {
        offered: false,
        get title() { return "\u201C" + exportArtboardTitle(unsupportedArtboard) + "\u201D is too large to export at " + String(scale) + "\xD7"; },
      };
    let oversizedArtboard: Dynamic = artboards.find(artboardNeedsScaledDownExport);
    return oversizedArtboard
      ? {
          offered: true,
          get title() { return "\u201C" + exportArtboardTitle(oversizedArtboard) + "\u201D exports smaller than full size: it is over the capture limit"; },
        }
      : {
          offered: true,
          get title() { return "Export " + String(artboards.length) + " artboards at " + String(scale) + "\xD7"; },
        };
  }
  let singleArtboardScale: Dynamic = imageCaptureScaleOptions(
    value.w,
    value.h,
  ).find((scaleOption?: Dynamic): Dynamic => scaleOption.scale === scale);
  return singleArtboardScale?.fits
    ? {
        offered: true,
        get title() { return String(singleArtboardScale.outW) + getArtboardCaptureMode(value, captureOptions) === "full"
            ? " px wide, full length"
            : " \xD7 " + String(singleArtboardScale.outH) + " px"; },
      }
    : scale === 1
      ? {
          offered: true,
          get title() { return uiMessage("canvas.picker.exportsSmallerThanFullSizeThisArtboardIsOverTheCaptureLimit"); },
        }
      : {
          offered: false,
          get title() { return "This artboard is too large to export at " + String(scale) + "\xD7"; },
        };
}
function exportPickedArtboardsLabel(
  format?: Dynamic,
  picked?: Dynamic,
  total?: Dynamic,
): Dynamic {
  if (format === "png")
    return picked[0]
      ? "\u201C" + exportArtboardTitle(picked[0]) + "\u201D chosen"
      : "No artboard chosen";
  let length: Dynamic = picked.length;
  return length === 0
    ? "No artboards chosen"
    : length === total && total > 1
      ? "All " + String(total) + " artboards chosen"
      : exportChosenCountLabel(length, total) +
        (length < total ? " artboards chosen" : " artboard chosen");
}
function exportPickerInstructions(
  format?: Dynamic,
  pickedCount?: Dynamic,
  total?: Dynamic,
): Dynamic {
  return format === "png"
    ? {
        get hint() { return uiMessage("canvas.picker.chooseAnArtboardToExport"); },
        action: "Export PNG",
      }
    : format === "pngs"
      ? {
          get hint() { return uiMessage("canvas.picker.chooseArtboardsToExport"); },
          action:
            pickedCount > 1
              ? "Export " +
                exportChosenCountLabel(pickedCount, total) +
                " PNGs (.zip)"
              : pickedCount === 1 && total > 1
                ? "Export 1 of " + String(total) + " as PNG"
                : "Export PNG",
        }
      : {
          get hint() { return uiMessage("canvas.picker.chooseArtboardsToInclude"); },
          action:
            pickedCount === 0
              ? "Export PDF"
              : "Export " +
                exportChosenCountLabel(pickedCount, total) +
                " as PDF",
        };
}
function validExportSessionScale(
  session?: Dynamic,
  artboards?: Dynamic,
): Dynamic {
  return pickedExportArtboards(artboards, session.picked).every(
    (artboard?: Dynamic): Dynamic =>
      artboardSupportsExportScale(artboard, session.scale),
  )
    ? session.scale
    : 1;
}
function useExportPicker(pickerOptions?: Dynamic): Dynamic {
  let [value, setPickerState]: Dynamic = (0, react_Su.useState)(null),
    pickerStateRef: Dynamic = (0, react_Su.useRef)(null),
    currentPickerRef: Dynamic = (0, react_Su.useRef)(null),
    pickerOptionsRef: Dynamic = (0, react_Su.useRef)(pickerOptions);
  pickerOptionsRef.current = pickerOptions;
  let callback: Dynamic = (pickerState?: Dynamic): Dynamic => {
      pickerStateRef.current = pickerState;
      setPickerState(pickerState);
    },
    resetPickerState: Dynamic = (pickerState?: Dynamic): Dynamic => {
      let undoEnter: Dynamic = pickerState.undoEnter;
      pickerState.undoEnter = null;
      undoEnter?.();
      if (
        !pickerStateRef.current ||
        (callback(null), !(document as Dynamic).hasFocus())
      )
        return;
      let activeElement: Dynamic = (document as Dynamic).activeElement;
      if (
        !(
          activeElement === null ||
          activeElement === (document as Dynamic).body ||
          activeElement.closest("[data-artboard-pick]") !== null
        )
      )
        return;
      let focusWas: Dynamic = pickerState.focusWas,
        hasFocus: Dynamic =
          focusWas instanceof HTMLElement &&
          focusWas.isConnected &&
          focusWas !== (document as Dynamic).body &&
          focusWas.tagName !== "IFRAME",
        restoreFocus: Dynamic = (): Dynamic =>
          (pickerOptionsRef.current.homeFocus?.() ?? null)?.focus({
            preventScroll: true,
          });
      if (!hasFocus) return restoreFocus();
      let retryFocus: Dynamic = (attempts?: Dynamic): Dynamic => {
        focusWas.isConnected &&
          focusWas.focus({
            preventScroll: true,
          });
        if ((document as Dynamic).activeElement === focusWas) return;
        let activeElementNode: Dynamic = (document as Dynamic).activeElement;
        (activeElementNode !== null &&
          activeElementNode !== (document as Dynamic).body &&
          activeElementNode.closest("[data-artboard-pick]") === null) ||
          (attempts > 0
            ? requestAnimationFrame((): Dynamic => retryFocus(attempts - 1))
            : restoreFocus());
      };
      retryFocus(2);
    },
    finishExport: Dynamic = (0, react_Su.useCallback)((): Dynamic => {
      let current: Dynamic = currentPickerRef.current;
      currentPickerRef.current = null;
      current
        ? (clearTimeout(current.timer),
          current.offSignal(),
          resetPickerState(current))
        : pickerStateRef.current && callback(null);
    }, []),
    handleExportEvent: Dynamic = (0, react_Su.useCallback)(
      (event?: Dynamic): Dynamic => {
        try {
          pickerOptionsRef.current.onStage?.(event);
        } catch {}
      },
      [],
    ),
    cancelExport: Dynamic = (0, react_Su.useCallback)(
      (reason?: Dynamic): Dynamic => {
        let current: Dynamic = currentPickerRef.current,
          currentPicker: Dynamic = pickerStateRef.current;
        return !current || !currentPicker
          ? false
          : (currentPicker.busy
              ? (current.run.abort(new ExportCancelled()),
                resetPickerState(current),
                handleExportEvent("dropped"))
              : (current.reject(new ExportCancelled()),
                finishExport(),
                handleExportEvent(
                  reason === "leave"
                    ? "left"
                    : reason === "lapse"
                      ? "lapsed"
                      : "cancelled",
                )),
            true);
      },
      [finishExport, handleExportEvent],
    ),
    cancelPicker: Dynamic = (0, react_Su.useCallback)(
      (): Dynamic => cancelExport("cancel"),
      [cancelExport],
    ),
    leavePicker: Dynamic = (0, react_Su.useCallback)(
      (): Dynamic => cancelExport("leave"),
      [cancelExport],
    ),
    isPointerUp: Dynamic = (0, react_Su.useCallback)(
      (): Dynamic => currentPickerRef.current !== null || pickerStateRef.current !== null,
      [],
    ),
    chooseArtboard: Dynamic = (0, react_Su.useCallback)(
      (
        kind?: Dynamic,
        selection?: Dynamic,
        abortSignal?: Dynamic,
        maxDurationMs: Dynamic = canvasExportMaxDurationMs,
      ): Dynamic =>
        currentPickerRef.current
          ? Promise.reject(
              new Error("An export is already choosing artboards."),
            )
          : abortSignal.aborted
            ? Promise.reject(new ExportCancelled())
            : new Promise((resolve?: Dynamic, reject?: Dynamic): Dynamic => {
                let previousFocus: Dynamic = pickerOptionsRef.current.enter(),
                  onAbort: Dynamic = (): Dynamic => {
                    cancelExport("signal");
                  };
                abortSignal.addEventListener("abort", onAbort);
                let abortTimer: Dynamic = setTimeout((): Dynamic => {
                    pickerStateRef.current?.busy ||
                      (pickerOptionsRef.current.onLapse(), cancelExport("lapse"));
                  }, maxDurationMs),
                  activeElement: Dynamic = (document as Dynamic)
                    .activeElement;
                currentPickerRef.current = {
                  resolve: resolve,
                  reject: reject,
                  run: new AbortController(),
                  undoEnter: previousFocus,
                  focusWas: activeElement,
                  timer: abortTimer,
                  offSignal: (): Dynamic =>
                    abortSignal.removeEventListener("abort", onAbort),
                };
                callback({
                  kind: kind,
                  picked: selection.picked,
                  scale: selection.scale,
                  busy: false,
                });
                handleExportEvent("opened");
                let artboards: Dynamic = pickerOptionsRef.current.artboards,
                  { hint: instructionHint }: Dynamic = exportPickerInstructions(
                    kind,
                    selection.picked.size,
                    artboards.length,
                  ),
                  pickedArtboards: Dynamic = pickedExportArtboards(
                    artboards,
                    selection.picked,
                  );
                announce(
                  pickedArtboards.length > 0
                    ? instructionHint +
                        ". " +
                        exportPickedArtboardsLabel(
                          kind,
                          pickedArtboards,
                          artboards.length,
                        )
                    : instructionHint,
                );
              }),
      [cancelExport, handleExportEvent],
    ),
    updatePickerSelection: Dynamic = (0, react_Su.useCallback)(
      (source?: Dynamic): Dynamic => {
        let current: Dynamic = pickerStateRef.current;
        current && !current.busy && callback(source(current));
      },
      [],
    ),
    updatePickerScale: Dynamic = (0, react_Su.useCallback)(
      (selectedFiles?: Dynamic): Dynamic =>
        updatePickerSelection((source?: Dynamic): Dynamic => {
          let nextSelection: Dynamic = selectedFiles(source);
          if (
            nextSelection.size === source.picked.size &&
            [...nextSelection].every(
              (file?: Dynamic): Dynamic => source.picked.has(file),
            )
          )
            return source;
          let artboards: Dynamic = pickerOptionsRef.current.artboards;
          announce(
            exportPickedArtboardsLabel(
              source.kind,
              pickedExportArtboards(artboards, nextSelection),
              artboards.length,
            ),
          );
          return {
            ...source,
            picked: nextSelection,
          };
        }),
      [updatePickerSelection],
    ),
    pickFiles: Dynamic = (0, react_Su.useCallback)(
      (files?: Dynamic, toggleSingle: Dynamic = false): Dynamic =>
        updatePickerScale((source?: Dynamic): Dynamic => {
          let artboards: Dynamic = pickerOptionsRef.current.artboards,
            matchingFiles: Dynamic = [...files].filter(
              (file?: Dynamic): Dynamic =>
                artboards.some(
                  (candidate?: Dynamic): Dynamic => candidate.file === file,
                ),
            );
          return matchingFiles.length === 0
            ? source.picked
            : !exportSupportsMultipleArtboards(source.kind) ||
                (toggleSingle && matchingFiles.length === 1)
              ? toggleExportPickedFile(source.kind, source.picked, matchingFiles[0])
              : new Set([...source.picked, ...matchingFiles]);
        }),
      [updatePickerScale],
    ),
    setExportScale: Dynamic = (0, react_Su.useCallback)(
      (scale?: Dynamic): Dynamic =>
        updatePickerSelection(
          (previousState?: Dynamic): Dynamic => ({
            ...previousState,
            scale: scale,
          }),
        ),
      [updatePickerSelection],
    ),
    selectAllArtboards: Dynamic = (0, react_Su.useCallback)(
      (): Dynamic =>
        updatePickerScale(
          (source?: Dynamic): Dynamic =>
            exportSupportsMultipleArtboards(source.kind)
              ? new Set(
                  pickerOptionsRef.current.artboards.map(
                    (artboard?: Dynamic): Dynamic => artboard.file,
                  ),
                )
              : source.picked,
        ),
      [updatePickerScale],
    ),
    confirmExport: Dynamic = (0, react_Su.useCallback)((): Dynamic => {
      let current: Dynamic = currentPickerRef.current,
        currentSession: Dynamic = pickerStateRef.current;
      if (!current || !currentSession || currentSession.busy) return;
      let artboards: Dynamic = pickerOptionsRef.current.artboards,
        pickedArtboards: Dynamic = pickedExportArtboards(
          artboards,
          currentSession.picked,
        ).map((file?: Dynamic): Dynamic => file.file);
      pickedArtboards.length !== 0 &&
        (clearTimeout(current.timer),
        callback({
          ...currentSession,
          busy: true,
        }),
        handleExportEvent("chosen"),
        current.resolve({
          files: pickedArtboards,
          scale: validExportSessionScale(currentSession, artboards),
          signal: current.run.signal,
        }));
    }, [handleExportEvent]),
    hasSession: Dynamic = value !== null;
  (0, react_Su.useEffect)((): Dynamic => {
    if (!hasSession) return;
    let handleKeyDown: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.key !== "Escape" || event.defaultPrevented) return;
      let target: Dynamic = event.target;
      (target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)) ||
        (event.preventDefault(), cancelPicker());
    };
    (window as Dynamic).addEventListener("keydown", handleKeyDown);
    return (): Dynamic =>
      (window as Dynamic).removeEventListener("keydown", handleKeyDown);
  }, [hasSession, cancelPicker]);
  (0, react_Su.useEffect)(
    (): Dynamic => (): Dynamic => {
      let current: Dynamic = currentPickerRef.current;
      current &&
        ((currentPickerRef.current = null),
        clearTimeout(current.timer),
        current.offSignal(),
        current.run.abort(new ExportCancelled()),
        current.reject(new ExportCancelled()));
    },
    [],
  );
  return {
    session: value,
    choose: chooseArtboard,
    isUp: isPointerUp,
    end: finishExport,
    pick: pickFiles,
    setScale: setExportScale,
    selectAll: selectAllArtboards,
    confirm: confirmExport,
    cancel: cancelPicker,
    leave: leavePicker,
  };
}
function ExportPickerToolbar({
  picker: picker,
  artboards: artboards,
  rules: rules,
}: Dynamic): Dynamic {
  useUiLocale();
  let session: Dynamic = picker.session;
  if (!session) return null;
  let value: Dynamic = pickedExportArtboards(artboards, session.picked),
    instructions: Dynamic = exportPickerInstructions(
      session.kind,
      value.length,
      artboards.length,
    ),
    selectedScale: Dynamic = validExportSessionScale(session, artboards);
  return (
    <div
      ref={focusExportPickerToolbar}
      data-artboard-pick={""}
      className={
        "pointer-events-none absolute inset-x-0 top-3 z-40 flex justify-center"
      }
    >
      <SessionStrip
        tabIndex={-1}
        className={
          "pointer-events-auto outline-none [&_[data-mc-row]]:justify-center"
        }
        data-testid={"artboard-pick-bar"}
        aria-label={exportPickerAriaLabels[session.kind]}
        wrap={true}
        style={{
          overflow: "visible",
        }}
      >
        <span className={"px-2 text-xs text-fg-secondary"}>
          {instructions.hint}
        </span>
        <SessionStripDivider />
        {exportSupportsScale(session.kind) && (<SessionStripGroup role={"group"} aria-label={uiMessage("canvas.picker.scale")}>
            {[1, 2].map((scale?: Dynamic): Dynamic => {
              let { offered: isOffered, title: title }: Dynamic =
                describeExportScaleOption(value, scale, rules);
              return (
                <SessionStripButton
                  key={scale}
                  data-testid={"artboard-pick-scale-" + String(scale)}
                  aria-pressed={selectedScale === scale}
                  disabled={session.busy || !isOffered}
                  title={title}
                  onClick={(): Dynamic => picker.setScale(scale)}
                >
                  {(String(scale)) + ("\xD7")}
                </SessionStripButton>
              );
            })}
          </SessionStripGroup>)}
        {exportSupportsScale(session.kind) &&
          exportSupportsMultipleArtboards(session.kind) && (<SessionStripDivider />)}
        {exportSupportsMultipleArtboards(session.kind) && (<SessionStripButton
            data-testid={"artboard-pick-all"}
            className={
              "aria-disabled:opacity-disabled aria-disabled:[&_[data-cds-part=paint]]:bg-transparent!"
            }
            aria-disabled={
              session.busy || value.length === artboards.length || undefined
            }
            onClick={picker.selectAll}
          >
            {uiMessage("canvas.picker.selectAll")}
          </SessionStripButton>)}
        <SessionStripDivider />
        <SessionStripGroup>
          <SessionStripButton
            data-testid={"artboard-pick-cancel"}
            onClick={picker.cancel}
          >
            {uiMessage("canvas.picker.cancel")}
          </SessionStripButton>
          <Button
            variant={"primary"}
            data-testid={"artboard-pick-export"}
            disabled={value.length === 0}
            busy={session.busy}
            busyLabel={"Exporting\u2026"}
            onMouseDown={(event?: Dynamic): Dynamic => event.preventDefault()}
            onClick={picker.confirm}
          >
            {instructions.action}
          </Button>
        </SessionStripGroup>
      </SessionStrip>
    </div>
  );
}
function ExportArtboardPickTarget({
  artboard: artboard,
  picker: picker,
}: Dynamic): Dynamic {
  useUiLocale();
  let value: Dynamic = useViewportStore(),
    session: Dynamic = picker.session;
  if (!session) return null;
  let isPicked: Dynamic = session.picked.has(artboard.file);
  return (
    <button
      type={"button"}
      data-mega-chrome={"export-pick"}
      data-artboard-pick={""}
      data-testid={"artboard-pick-" + artboard.file}
      aria-pressed={isPicked}
      aria-label={
        (exportSupportsMultipleArtboards(session.kind) ? uiMessage("canvas.picker.include") : uiMessage("canvas.picker.choose")) + exportArtboardTitle(artboard) + '"'
      }
      aria-disabled={session.busy || undefined}
      className={
        "group pointer-events-auto absolute inset-0 block border-0 bg-transparent p-0 outline-none " +
        (session.busy ? "cursor-default" : "cursor-pointer")
      }
      style={PickerRuntimeScriptTAppAccentConfig}
      onMouseDown={(event?: Dynamic): Dynamic => event.preventDefault()}
      onClick={(): Dynamic => {
        session.busy || picker.pick([artboard.file], true);
      }}
    >
      {!isPicked && (<span
          aria-hidden={"true"}
          className={"absolute inset-0 bg-white/55"}
        />)}
      {isPicked && (<ViewportScale>
          {(scale?: Dynamic): Dynamic => (
            <SelectionRing
              frame={{
                x: 0,
                y: 0,
                w: artboard.w,
                h: artboard.h,
              }}
              scale={scale}
              grips={"none"}
            />
          )}
        </ViewportScale>)}
      <span
        ref={value.stamp}
        aria-hidden={"true"}
        className={"absolute left-0 top-0"}
        style={{
          transform: "scale(var(--mega-inv-scale))",
          transformOrigin: "left top",
        }}
      >
        <span
          data-testid={"artboard-pick-tick-" + artboard.file}
          className={
            "absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border-2 shadow-sm group-focus-visible:outline-hidden group-focus-visible:shadow-focus " +
            (isPicked
              ? "border-app-accent bg-app-accent text-app-accent-fg"
              : "border-border-strong bg-white text-transparent")
          }
        >
          <Icon
            name={"Check"}
            size={"sm"}
            className={isPicked ? undefined : "forced-colors:invisible"}
          />
        </span>
      </span>
    </button>
  );
}
export {
  artboardNeedsScaledDownExport,
  artboardSupportsExportScale,
  canvasExportMaxDurationMs,
  describeExportScaleOption,
  ExportArtboardPickTarget,
  exportArtboardTitle,
  exportChosenCountLabel,
  exportPickedArtboardsLabel,
  exportPickerAriaLabels,
  exportPickerChromeHeight,
  exportPickerInstructions,
  ExportPickerToolbar,
  exportSupportsMultipleArtboards,
  exportSupportsScale,
  focusExportPickerToolbar,
  initialExportPickedFiles,
  initialExportScale,
  interactiveExportDeadline,
  jsx_gd,
  pickedExportArtboards,
  toggleExportPickedFile,
  useExportPicker,
  validExportSessionScale,
};
export function installExportPicker(): () => void {
  return () => {
    exportSupportsMultipleArtboards = (format?: Dynamic): Dynamic =>
      format !== "png";
    exportSupportsScale = (format?: Dynamic): Dynamic => format !== "pdf";
    canvasExportMaxDurationMs = 2e5;
    exportChosenCountLabel = (count?: Dynamic, total?: Dynamic): Dynamic =>
      count > 0 && count < total
        ? String(count) + " of " + String(total)
        : String(count);
    jsx_gd = toModuleNamespace(
      load_react_jsx_runtime(),
      1,
    );
    focusExportPickerToolbar = (toolbar?: Dynamic): Dynamic =>
      toolbar?.querySelector('[role="toolbar"]')?.focus({
        preventScroll: true,
      });
    exportPickerAriaLabels = {
      png: "Export an artboard as PNG",
      pngs: "Export artboards as PNG",
      pdf: "Export artboards as PDF",
    };
    exportPickerChromeHeight = 48;
  };
}
