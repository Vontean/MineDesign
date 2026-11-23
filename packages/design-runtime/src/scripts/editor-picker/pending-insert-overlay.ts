interface PendingOverlay {
  node: Element;
  stampCount: number;
  timer: ReturnType<typeof setTimeout>;
}

export function createPendingInsertOverlays(repaintSelection: () => void) {
  let observer: MutationObserver | null = null;
  let entries: PendingOverlay[] = [];
  const stampCount = () => document.querySelectorAll("[data-dc-tpl]").length;

  function remove(entry: PendingOverlay) {
    clearTimeout(entry.timer);
    try { entry.node.remove(); } catch {}
  }

  function reconcile() {
    if (!observer) return;
    const count = stampCount();
    const retained: PendingOverlay[] = [];
    let removed = false;
    for (const entry of entries) {
      if (!entry.node.isConnected) {
        clearTimeout(entry.timer);
      } else if (count > entry.stampCount) {
        remove(entry);
      } else {
        entry.stampCount = count;
        retained.push(entry);
        continue;
      }
      removed = true;
    }
    if (removed) repaintSelection();
    if (!retained.length) {
      observer.disconnect();
      observer = null;
    }
    entries = retained;
  }

  function watch(node: Element) {
    if (!observer) {
      observer = new MutationObserver(reconcile);
      observer.observe(document.body, { childList: true, subtree: true });
    }
    const entry: PendingOverlay = {
      node,
      stampCount: stampCount(),
      timer: setTimeout(() => {
        remove(entry);
        reconcile();
      }, 800),
    };
    entries.push(entry);
  }

  function cancel() {
    observer?.disconnect();
    observer = null;
    entries.forEach(remove);
    entries = [];
  }

  return { watch, cancel, get active() { return observer !== null; } };
}
