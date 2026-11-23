import { beforeAll, describe, expect, it } from 'vitest';
import { installPlatformDatabaseAdapter } from './database-adapter';
import { installPlatformDocumentValues } from './document-values';
import { installPlatformEditCount } from './edit-count';
import { createLiveDocument, installPlatformLiveDocument } from './live-document';

beforeAll(() => {
  installPlatformDocumentValues()();
  installPlatformLiveDocument()();
  installPlatformEditCount()();
  installPlatformDatabaseAdapter()();
});

type Change = { type: 'added' | 'modified' | 'removed'; path: string; data?: Record<string, unknown> };
interface Subscription {
  collection: string;
  onSnapshot(changes: Change[], info: { fromCache: boolean; hasPendingWrites: boolean }): void;
  onError(error: unknown): void;
}

/** 两个文档的最小编解码：meta 存标题，body 存内容。 */
const codec = {
  collections: ['docs'],
  metaPath: 'docs/meta',
  compose(documents: Map<string, Record<string, unknown>>) {
    const meta = documents.get('docs/meta'), body = documents.get('docs/body');
    return {
      title: meta?.title,
      content: body?.text ?? '',
      comments: [],
      carry: undefined,
      dangling: [] as string[],
    };
  },
  decompose(state: { title: string; content: string }) {
    return [
      ['docs/meta', { title: state.title }],
      ['docs/body', { text: state.content }],
    ] as [string, Record<string, unknown>][];
  },
};

function setup() {
  const queue: { run: () => void; at: number; id: number }[] = [];
  let clock = 0, nextId = 1;
  const timers = {
    setTimeout: (run: () => void, delay: number) => {
      const id = nextId++;
      queue.push({ run, at: clock + delay, id });
      return id;
    },
    clearTimeout: (id: number) => {
      const index = queue.findIndex(entry => entry.id === id);
      if (index >= 0) queue.splice(index, 1);
    },
    now: () => clock,
    random: () => 0,
    frame: undefined,
  };
  const subscriptions: Subscription[] = [];
  const writes: { verb: string; path: string; body?: unknown }[] = [];
  const database = {
    subscribe(collection: string, onSnapshot: Subscription['onSnapshot'], onError: Subscription['onError']) {
      subscriptions.push({ collection, onSnapshot, onError });
      return () => {};
    },
    set: async (path: string, body: unknown) => { writes.push({ verb: 'set', path, body }); },
    update: async (path: string, body: unknown) => { writes.push({ verb: 'update', path, body }); },
    del: async (path: string) => { writes.push({ verb: 'del', path }); },
  };
  const doc = createLiveDocument({
    codec, db: database, timers, canWrite: true,
    defaultTitle: 'Untitled', initialContent: '',
    parseContent: (raw: unknown) => raw,
    onStoreUnavailable: () => {},
  });
  const advance = async (ms: number) => {
    const target = clock + ms;
    for (;;) {
      queue.sort((left, right) => left.at - right.at);
      const next = queue[0];
      if (next === undefined || next.at > target) break;
      queue.shift();
      clock = Math.max(clock, next.at);
      next.run();
      await Promise.resolve();
    }
    clock = target;
    await Promise.resolve();
  };
  const deliver = async (changes: Change[], info = { fromCache: false, hasPendingWrites: false }) => {
    subscriptions[0].onSnapshot(changes, info);
    await Promise.resolve();
    await Promise.resolve();
  };
  return { doc, advance, deliver, writes, subscriptions, queue };
}

const initial: Change[] = [
  { type: 'added', path: 'docs/meta', data: { title: 'Hello' } },
  { type: 'added', path: 'docs/body', data: { text: 'one' } },
];

describe('createLiveDocument 的对外行为', () => {
  it('首个服务端快照前处于加载中，快照到达后显示内容', async () => {
    const { doc, deliver } = setup();
    expect(doc.loadState()).toBe('loading');
    expect(doc.saveState().status).toBe('loading');
    await deliver(initial);
    expect(doc.loadState()).toBe('live');
    expect(doc.title()).toBe('Hello');
    expect(doc.content()).toBe('one');
    expect(doc.saveState().status).toBe('ready');
    expect(doc.dirty()).toBe(false);
  });

  it('本地编辑先显示待同步，防抖结束后发送补丁，确认后回到已同步', async () => {
    const { doc, advance, deliver, writes } = setup();
    await deliver(initial);
    const states: string[] = [];
    doc.subscribeSave((state: { status: string }) => states.push(state.status));
    doc.setContent('two');
    expect(doc.dirty()).toBe(true);
    expect(doc.saveState().message).toBe('1 change waiting to sync.');
    await advance(200);
    expect(writes).toHaveLength(0);
    await advance(200);
    expect(writes).toEqual([{ verb: 'update', path: 'docs/body', body: { text: 'two' } }]);
    await advance(0);
    expect(doc.dirty()).toBe(false);
    expect(states[0]).toBe('dirty');
    expect(states).toContain('saving');
  });

  it('连续编辑合并为一次写入', async () => {
    const { doc, advance, deliver, writes } = setup();
    await deliver(initial);
    doc.setContent('a');
    await advance(100);
    doc.setContent('ab');
    await advance(100);
    doc.setContent('abc');
    await advance(500);
    expect(writes).toEqual([{ verb: 'update', path: 'docs/body', body: { text: 'abc' } }]);
  });

  it('远端更新在没有本地改动时直接生效，并通知内容订阅者标记为远端', async () => {
    const { doc, deliver } = setup();
    await deliver(initial);
    const events: unknown[] = [];
    doc.subscribe((meta: unknown) => events.push(meta));
    await deliver([{ type: 'modified', path: 'docs/body', data: { text: 'remote' } }]);
    expect(doc.content()).toBe('remote');
    expect(events).toContainEqual({ remote: true });
  });

  it('存储报错：已显示过内容时转为只读，保留当前内容', async () => {
    const { doc, deliver, subscriptions } = setup();
    await deliver(initial);
    subscriptions[0].onError({ code: 'revoked', message: 'no' });
    await Promise.resolve();
    expect(doc.readOnly()).toBe(true);
    expect(doc.saveState().status).toBe('readonly');
    expect(doc.content()).toBe('one');
  });

  it('释放后不再发送写入，且写入定时器被清除', async () => {
    const { doc, advance, deliver, writes, queue } = setup();
    await deliver(initial);
    doc.setContent('x');
    await advance(0);
    expect(queue.length).toBeGreaterThan(0);
    doc.dispose();
    expect(queue.filter(entry => entry.at >= 350)).toHaveLength(0);
    await advance(2000);
    expect(writes).toHaveLength(0);
  });
});
