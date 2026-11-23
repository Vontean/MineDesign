import { reactChromeTheme as React } from "../../editor/chrome/theme";
import { hasBlockingEditorOverlay } from "../../editor/text/typing-target";

type TriggerRef = ((element: HTMLElement | null) => void) | { current: HTMLElement | null };

export function useCanvasPageMenu() {
  const [menuOpen, setMenuOpen] = React.useState(false);
  const [filesOpen, setFilesOpen] = React.useState(false);
  const [openedByKeyboard, setOpenedByKeyboard] = React.useState(false);
  const filesOpenRef = React.useRef(false);
  filesOpenRef.current = filesOpen;

  const triggerRef: { current: HTMLElement | null } = React.useRef(null);
  const popoverTriggerRef: { current: TriggerRef | undefined } = React.useRef(undefined);
  const attachTrigger = React.useCallback((element: HTMLElement | null) => {
    triggerRef.current = element;
    const popoverRef = popoverTriggerRef.current;
    if (typeof popoverRef === "function") popoverRef(element);
    else if (popoverRef) popoverRef.current = element;
  }, []);

  const closeFiles = React.useCallback(() => {
    setFilesOpen(false);
    requestAnimationFrame(() => {
      if (document.activeElement === document.body || document.activeElement === null) {
        triggerRef.current?.focus({ preventScroll: true });
      }
    });
  }, []);

  React.useEffect(() => {
    if (!filesOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.defaultPrevented || hasBlockingEditorOverlay()) return;
      event.preventDefault();
      closeFiles();
    };
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [filesOpen, closeFiles]);

  return {
    menuOpen,
    setMenuOpen,
    openedByKeyboard,
    setOpenedByKeyboard,
    filesOpen,
    filesOpenRef,
    setFilesOpen,
    closeFiles,
    triggerRef,
    attachTrigger,
    forwardTriggerRef(ref: TriggerRef | undefined) {
      popoverTriggerRef.current = ref;
    },
  };
}
