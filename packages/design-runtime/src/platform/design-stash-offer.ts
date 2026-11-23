import type { Dynamic } from '../runtime-types';

interface StashEdit {
  path: string;
  base: string | null;
}
interface CrashStash {
  at: number;
  edits: StashEdit[];
  [key: string]: unknown;
}
interface CrashStashOfferOptions {
  latestFileSha(path: string): string | null;
  canRestore(): boolean;
  show(offer: Dynamic): void;
  restore(stash: CrashStash): void;
  discard(): void;
}

/** 管理恢复提示，并在用户确认时重新检查远端版本。 */
export function createDesignStashOffer(options: CrashStashOfferOptions) {
  let current: CrashStash | undefined;
  let offeredChangedCount = 0;
  let restoreCount = 0;
  const answerListeners: (() => void)[] = [];

  function clear() {
    current = undefined;
    for (const listener of answerListeners.splice(0)) {
      try { listener(); } catch {}
    }
  }
  function offer() {
    const stash = current;
    if (stash === undefined) return;
    offeredChangedCount = stash.edits.filter(edit => edit.base !== options.latestFileSha(edit.path)).length;
    const prompt = {
      files: stash.edits.length,
      changedSince: offeredChangedCount,
      at: stash.at,
      restore,
      discard,
      whenAnswered: (listener: () => void) => { answerListeners.push(listener); },
    };
    try { options.show(prompt); } catch {}
  }
  function restore() {
    const stash = current;
    if (stash === undefined || !options.canRestore()) return;
    if (stash.edits.filter(edit => edit.base !== options.latestFileSha(edit.path)).length > offeredChangedCount) {
      offer();
      return;
    }
    clear();
    restoreCount += 1;
    options.restore(stash);
  }
  function discard() {
    if (current === undefined) return;
    clear();
    options.discard();
  }
  return {
    get current() { return current; },
    set current(stash: CrashStash | undefined) { current = stash; },
    offer,
    restore,
    discard,
    restoreCount: () => restoreCount,
  };
}
