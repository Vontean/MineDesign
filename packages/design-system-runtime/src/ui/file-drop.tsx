import { uiMessage } from '@minedesign/contracts/ui-messages';
import { useUiLocale } from '../ui-locale.ts';
/** Restored application module; prepare first, initialize in original order. */
import type * as React from "react";
import type {
  ReactNamespace,
  JsxNamespace,
  FileDropOptions,
  FileDropHandlerOptions,
  FileDropOverlayProps,
} from "../contracts/composition";
import { loadJsxNamespace, loadReactNamespace } from "../dependencies";
import { toModuleNamespace } from "../module-helpers";
import { KitIcon } from "./property-icons";

var reactFileDropTarget: ReactNamespace;
var jsxFileDropTarget: JsxNamespace;
var jsxFileDropHints: JsxNamespace;
var reactFileDropUiFileDrop: ReactNamespace;
var jsxFileDropUiFileDrop: JsxNamespace;
var jsxFileDropContent: JsxNamespace;
var reactpC: ReactNamespace;
var jsxFileDropOverlay: JsxNamespace;
var FILE_DROP_RING_CLASS: string;
var FILE_DROP_FADE_CLASS: string;
var FILE_DROP_RING_ENTER_CLASS: string;
var FILE_DROP_LABEL_ENTER_CLASS: string;
var FILE_DROP_ICON_ENTER_CLASS: string;
function dataTransferHasFiles(
  dataTransfer: DataTransfer | null,
): dataTransfer is DataTransfer {
  return (
    dataTransfer !== null && Array.from(dataTransfer.types).includes("Files")
  );
}
function createFileDropHandlers(options: FileDropHandlerOptions) {
  let callback = (dragEvent: React.DragEvent<HTMLElement>) =>
    options.internal?.current !== true &&
    dataTransferHasFiles(dragEvent.dataTransfer);
  return {
    onDragEnter: (event: React.DragEvent<HTMLElement>) => {
      if (!callback(event)) {
        return;
      }
      event.preventDefault();
      if (options.disabled) {
        return;
      }
      options.depth.current += 1;
      options.setOver(true);
    },
    onDragOver: (event: React.DragEvent<HTMLElement>) => {
      if (!callback(event)) {
        return;
      }
      event.preventDefault();
      event.dataTransfer.dropEffect = options.disabled ? "none" : "copy";
      if (options.disabled) {
        return;
      }
      options.depth.current = Math.max(options.depth.current, 1);
      options.setOver(true);
    },
    onDragLeave: (dragEvent: React.DragEvent<HTMLElement>) => {
      if (!callback(dragEvent)) {
        return;
      }
      options.depth.current = Math.max(0, options.depth.current - 1);
      if (options.depth.current === 0) {
        options.setOver(false);
      }
    },
    onDrop: (event: React.DragEvent<HTMLElement>) => {
      if (!callback(event)) {
        return;
      }
      options.depth.current = 0;
      options.setOver(false);
      event.preventDefault();
      if (options.disabled) {
        return;
      }
      let value = Array.from(event.dataTransfer.files),
        acceptedFiles =
          options.accept === undefined ? value : value.filter(options.accept);
      if (options.accept !== undefined && acceptedFiles.length === 0) {
        return;
      }
      options.onFiles(acceptedFiles, event);
    },
  };
}
function installInternalFileDragTracking(
  target: Window,
  onDrop: () => void,
  internalDragRef: React.RefObject<boolean>,
) {
  let value = target,
    callback = () => {
      internalDragRef.current = true;
    },
    clearInternalDrag = () => {
      internalDragRef.current = false;
    },
    resetDrag = () => {
      internalDragRef.current = false;
      onDrop();
    },
    handleWindowDragLeave = (dragEvent: DragEvent) => {
      let leaveEvent = dragEvent,
        isWithinWindow =
          leaveEvent.clientX > 0 &&
          leaveEvent.clientY > 0 &&
          leaveEvent.clientX < value.innerWidth &&
          leaveEvent.clientY < value.innerHeight;
      if (leaveEvent.relatedTarget === null && !isWithinWindow) {
        resetDrag();
      }
    },
    suppressUnhandledFileDrop = (dragEvent: DragEvent) => {
      let fileDragEvent = dragEvent,
        dataTransfer = fileDragEvent.dataTransfer;
      if (
        internalDragRef.current ||
        fileDragEvent.defaultPrevented ||
        !dataTransferHasFiles(dataTransfer)
      ) {
        return;
      }
      fileDragEvent.preventDefault();
      if (fileDragEvent.type === "dragover") {
        dataTransfer.dropEffect = "none";
      }
    };
  target.addEventListener("dragstart", callback, true);
  target.addEventListener("dragend", clearInternalDrag, true);
  target.addEventListener("mousemove", clearInternalDrag, true);
  target.addEventListener("drop", onDrop, true);
  target.addEventListener("dragleave", handleWindowDragLeave, true);
  target.addEventListener("blur", resetDrag);
  target.addEventListener("dragover", suppressUnhandledFileDrop);
  target.addEventListener("drop", suppressUnhandledFileDrop);
  target.addEventListener("drop", clearInternalDrag);
  return () => {
    target.removeEventListener("dragstart", callback, true);
    target.removeEventListener("dragend", clearInternalDrag, true);
    target.removeEventListener("mousemove", clearInternalDrag, true);
    target.removeEventListener("drop", onDrop, true);
    target.removeEventListener("dragleave", handleWindowDragLeave, true);
    target.removeEventListener("blur", resetDrag);
    target.removeEventListener("dragover", suppressUnhandledFileDrop);
    target.removeEventListener("drop", suppressUnhandledFileDrop);
    target.removeEventListener("drop", clearInternalDrag);
  };
}
function useFileDrop(options: FileDropOptions) {
  let [value, setIsDragOver] = reactpC.useState(false),
    ref = reactpC.useRef(0),
    internalDragRef = reactpC.useRef(false);
  reactpC.useEffect(
    () =>
      installInternalFileDragTracking(
        window,
        () => {
          ref.current = 0;
          setIsDragOver(false);
        },
        internalDragRef,
      ),
    [],
  );
  reactpC.useEffect(() => {
    if (!options.disabled) {
      return;
    }
    ref.current = 0;
    setIsDragOver(false);
  }, [options.disabled]);
  let memo = reactpC.useMemo(
    () =>
      createFileDropHandlers({
        disabled: options.disabled,
        onFiles: options.onFiles,
        accept: options.accept,
        depth: ref,
        internal: internalDragRef,
        setOver: setIsDragOver,
      }),
    [options.disabled, options.onFiles, options.accept],
  );
  return {
    over: value,
    targetProps: memo,
  };
}
function FileDropOverlay({
  show: show,
  label: label,
  hint: hint,
}: FileDropOverlayProps) {
  useUiLocale();
  if (!show) {
    return null;
  }
  return (
    <div
      aria-hidden={"true"}
      data-testid={"drop-overlay"}
      className={"pointer-events-none absolute inset-0 z-10"}
    >
      {[<div
          className={`absolute inset-0 backdrop-blur-[12px] ${FILE_DROP_FADE_CLASS}`}
        />, <div
          className={`absolute inset-0 bg-page opacity-60 ${FILE_DROP_FADE_CLASS}`}
        />, <div
          className={`absolute inset-3.5 flex flex-col items-center justify-center gap-sm rounded-card px-lg text-center ${FILE_DROP_RING_CLASS} ${FILE_DROP_RING_ENTER_CLASS}`}
        >
          {[<div
              className={`absolute inset-0 rounded-[inherit] shadow-[inset_0_0_24px_0_color-mix(in_srgb,var(--cds-fill-accent)_20%,transparent)] ${FILE_DROP_LABEL_ENTER_CLASS}`}
            />, <div
              className={"flex items-end gap-md"}
              style={{
                color: "var(--cds-fill-accent)",
              }}
            >
              {[<span className={"-rotate-[14deg]"}>
                  <KitIcon
                    name={"Image"}
                    size={28}
                    className={FILE_DROP_ICON_ENTER_CLASS}
                    style={{
                      ["--rise-delay"]: "60ms",
                    }}
                  />
                </span>, <span className={"-translate-y-3"}>
                  <KitIcon
                    name={"Files"}
                    size={28}
                    className={FILE_DROP_ICON_ENTER_CLASS}
                  />
                </span>, <span className={"rotate-[14deg]"}>
                  <KitIcon
                    name={"Folder"}
                    size={28}
                    className={FILE_DROP_ICON_ENTER_CLASS}
                    style={{
                      ["--rise-delay"]: "120ms",
                    }}
                  />
                </span>]}
            </div>, <span className={"text-body font-medium text-accent"}>
              {label}
            </span>, hint !== undefined ? (
              <span className={"text-footnote text-secondary"}>{hint}</span>
            ) : null]}
        </div>]}
    </div>
  );
}
export {
  createFileDropHandlers,
  dataTransferHasFiles,
  FILE_DROP_FADE_CLASS,
  FILE_DROP_ICON_ENTER_CLASS,
  FILE_DROP_LABEL_ENTER_CLASS,
  FILE_DROP_RING_CLASS,
  FILE_DROP_RING_ENTER_CLASS,
  FileDropOverlay,
  installInternalFileDragTracking,
  jsxFileDropContent,
  jsxFileDropHints,
  jsxFileDropOverlay,
  jsxFileDropTarget,
  jsxFileDropUiFileDrop,
  reactFileDropTarget,
  reactFileDropUiFileDrop,
  reactpC,
  useFileDrop,
};
export function installUiFileDrop(): () => void {
  return () => {
    reactFileDropTarget = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxFileDropTarget = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    jsxFileDropHints = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactFileDropUiFileDrop = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxFileDropUiFileDrop = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    jsxFileDropContent = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    reactpC = toModuleNamespace(
      loadReactNamespace(),
      1,
    );
    jsxFileDropOverlay = toModuleNamespace(
      loadJsxNamespace(),
      1,
    );
    FILE_DROP_RING_CLASS = "shadow-[inset_0_0_0_2px_var(--cds-fill-accent)]";
    FILE_DROP_FADE_CLASS =
      "motion-safe:animate-[cds-fade-in_0.15s_cubic-bezier(0.215,0.61,0.355,1)]";
    FILE_DROP_RING_ENTER_CLASS =
      "motion-safe:animate-[mc-drop-ring-in_0.15s_cubic-bezier(0.215,0.61,0.355,1)]";
    FILE_DROP_LABEL_ENTER_CLASS =
      "motion-safe:animate-[cds-fade-in_0.2s_cubic-bezier(0.215,0.61,0.355,1)_0.08s_backwards]";
    FILE_DROP_ICON_ENTER_CLASS =
      "motion-safe:animate-[mc-drop-icon-rise_0.22s_cubic-bezier(0.215,0.61,0.355,1)_var(--rise-delay,0ms)_backwards]";
  };
}
