type ListenerFor<Target extends EventTarget, Events> = {
  [Type in keyof Events]: readonly [
    target: Target,
    type: Type,
    listener: (event: Events[Type]) => void,
    options?: AddEventListenerOptions | boolean,
  ];
}[keyof Events];

type PickerListener =
  | ListenerFor<Document, DocumentEventMap & { slidechange: Event }>
  | ListenerFor<Window, WindowEventMap>;

interface PickerLifecycleOptions {
  stylesheet: HTMLStyleElement;
  editorInput: readonly PickerListener[];
  editorTransfer: readonly PickerListener[];
  previewInput: readonly PickerListener[];
  observeSlides: EventListener;
  onWheel(event: WheelEvent): void;
  onPreviewMessage(event: MessageEvent): void;
  onContentMutation: MutationCallback;
  refreshChrome(): void;
  clearHover(): void;
  backdrop: { refresh(): void; connect(): void; disconnect(): void };
  chrome: { connect(): void; disconnect(clear: boolean): void };
  viewportGestures: { install(): void; remove(): void; updateTouchPolicy(): void };
  preview: { setPresence(active: boolean): void; reset(): void; fitInitialCanvas(): void };
  scrollbars: { mount(): void; unmount(): void; refresh(): void };
  replayPendingInput(): void;
  cancelHostTransfer(): void;
  cancelEditingGestures(): void;
  clearStylePatches(): void;
  clearEditingState(): void;
  clearPendingSelection(): void;
  clearPointerModes(): void;
  restoreAuthoredTemplate(): void;
}

function setListeners(listeners: readonly PickerListener[], listen: boolean) {
  for (const [target, type, listener, options] of listeners) {
    if (listen) target.addEventListener(type, listener as EventListener, options);
    else target.removeEventListener(type, listener as EventListener, options);
  }
}

export function createPickerLifecycle(options: PickerLifecycleOptions) {
  const { stylesheet, chrome, backdrop, viewportGestures, preview, scrollbars, refreshChrome } = options;
  let enabled = false;
  let ringsOnly = false;
  let resumeRings = false;
  let panZoomOnly = false;
  let contentObserver: MutationObserver | null = null;
  let refreshTimer: ReturnType<typeof setInterval> | undefined;

  const geometryListeners: PickerListener[] = [
    [document, "scroll", refreshChrome, true],
    [window, "resize", refreshChrome],
  ];
  const editGeometryListeners: PickerListener[] = [
    geometryListeners[0],
    [document, "slidechange", options.observeSlides, true],
    geometryListeners[1],
  ];
  const wheelOptions = { capture: true, passive: false };

  function observeContent() {
    contentObserver = new MutationObserver(options.onContentMutation);
    contentObserver.observe(document.body, {
      subtree: true, childList: true, attributes: true, characterData: true,
    });
    chrome.connect();
  }

  function disconnectContent() {
    contentObserver?.disconnect();
    contentObserver = null;
  }

  function enableRingsOnly() {
    if (enabled) {
      resumeRings = true;
      return;
    }
    if (ringsOnly) return;
    ringsOnly = true;
    observeContent();
    setListeners(geometryListeners, true);
    refreshChrome();
  }

  function disableRingsOnly() {
    resumeRings = false;
    if (!ringsOnly) return;
    ringsOnly = false;
    disconnectContent();
    chrome.disconnect(false);
    setListeners(geometryListeners, false);
    options.clearHover();
    refreshChrome();
  }

  function startViewportInput() {
    document.addEventListener("wheel", options.onWheel, wheelOptions);
    viewportGestures.install();
  }

  function stopPreviewInput() {
    document.removeEventListener("wheel", options.onWheel, true);
    viewportGestures.remove();
    setListeners(options.previewInput, false);
    window.removeEventListener("message", options.onPreviewMessage);
  }

  function mountScrollbars() {
    scrollbars.mount();
    scrollbars.refresh();
  }

  function enable() {
    if (enabled) return;
    if (ringsOnly) disableRingsOnly();
    enabled = true;
    backdrop.refresh();
    document.head.appendChild(stylesheet);
    document.body.setAttribute("data-dc-editor-on", "");
    setListeners(options.editorInput, true);
    startViewportInput();
    setListeners(options.editorTransfer, true);
    setListeners(editGeometryListeners, true);
    observeContent();
    backdrop.connect();
    mountScrollbars();
    refreshTimer = setInterval(() => {
      refreshChrome();
      scrollbars.refresh();
    }, 400);
    options.replayPendingInput();
  }

  function unmountPreview() {
    stylesheet.remove();
    scrollbars.unmount();
  }

  function disable(keepPreview?: boolean) {
    if (!keepPreview) {
      if (panZoomOnly) preview.setPresence(false);
      panZoomOnly = false;
    }
    options.cancelHostTransfer();

    if (!enabled) {
      options.clearPendingSelection();
      if (!keepPreview) {
        preview.reset();
        unmountPreview();
        stopPreviewInput();
      }
      return;
    }

    options.cancelEditingGestures();
    if (!keepPreview || !panZoomOnly) preview.reset();
    if (refreshTimer !== undefined) {
      clearInterval(refreshTimer);
      refreshTimer = undefined;
    }
    setListeners(editGeometryListeners, false);
    disconnectContent();
    backdrop.disconnect();
    chrome.disconnect(true);
    options.clearStylePatches();
    enabled = false;
    options.clearEditingState();

    const { body, documentElement } = document;
    body.removeAttribute("data-dc-editor-on");
    body.removeAttribute("data-dc-editor-tool");
    body.style.cursor = "";
    documentElement.style.removeProperty("--dc-editor-host-bg");
    documentElement.style.removeProperty("--dc-editor-host-vpad");
    if (!keepPreview) unmountPreview();

    setListeners(options.editorInput, false);
    options.clearPointerModes();
    if (!keepPreview) stopPreviewInput();
    setListeners(options.editorTransfer, false);
    options.restoreAuthoredTemplate();
    viewportGestures.updateTouchPolicy();
    if (resumeRings) {
      resumeRings = false;
      enableRingsOnly();
    }
  }

  function enablePanZoomOnly() {
    setListeners(options.previewInput, true);
    window.addEventListener("message", options.onPreviewMessage);
    if (enabled) {
      disable(true);
      return;
    }
    document.head.appendChild(stylesheet);
    startViewportInput();
    mountScrollbars();
  }

  function setPanZoomArmed(armed?: boolean) {
    if (!!armed === panZoomOnly) return;
    panZoomOnly = !!armed;
    preview.setPresence(panZoomOnly);
    if (armed) {
      window.addEventListener("message", options.onPreviewMessage);
      mountScrollbars();
      preview.fitInitialCanvas();
    } else {
      scrollbars.unmount();
      if (!enabled) preview.reset();
    }
  }

  return {
    get enabled() { return enabled; },
    get ringsOnly() { return ringsOnly; },
    get panZoomOnly() { return panZoomOnly; },
    enable,
    disable,
    enableRingsOnly,
    disableRingsOnly,
    enablePanZoomOnly,
    setPanZoomArmed,
  };
}
