import { describe, expect, it, vi } from 'vitest';
import { createDesignStashOffer } from './design-stash-offer';

describe('design crash stash offer', () => {
  it('reoffers when the remote version changes before restore', () => {
    const hashes = new Map([['a', 'v1'], ['b', 'v1']]);
    const prompts: any[] = [];
    const restore = vi.fn();
    const answered = vi.fn();
    let editable = true;
    const controller = createDesignStashOffer({
      latestFileSha: (path) => hashes.get(path) ?? null,
      canRestore: () => editable,
      show: (prompt) => prompts.push(prompt),
      restore,
      discard: vi.fn(),
    });
    const stash = { at: 10, edits: [{ path: 'a', base: 'v1' }, { path: 'b', base: 'v1' }] };
    controller.current = stash;
    controller.offer();
    prompts[0].whenAnswered(answered);
    hashes.set('b', 'v2');
    prompts[0].restore();
    expect(prompts.map((prompt) => prompt.changedSince)).toEqual([0, 1]);
    expect(controller.current).toBe(stash);
    expect(answered).not.toHaveBeenCalled();
    editable = false;
    prompts[1].restore();
    expect(restore).not.toHaveBeenCalled();
    editable = true;
    prompts[1].restore();
    expect(controller.current).toBeUndefined();
    expect(controller.restoreCount()).toBe(1);
    expect(answered).toHaveBeenCalledOnce();
    expect(restore).toHaveBeenCalledWith(stash);
  });

  it('answers before discarding and ignores a failing answer listener', () => {
    const order: string[] = [];
    let prompt: any;
    const controller = createDesignStashOffer({
      latestFileSha: () => null,
      canRestore: () => true,
      show: (value) => { prompt = value; },
      restore: vi.fn(),
      discard: () => { order.push('discard'); },
    });
    controller.current = { at: 20, edits: [] };
    controller.offer();
    prompt.whenAnswered(() => { throw new Error('listener failed'); });
    prompt.whenAnswered(() => { order.push('answered'); });
    prompt.discard();
    controller.discard();
    expect(order).toEqual(['answered', 'discard']);
    expect(controller.current).toBeUndefined();
  });
});
