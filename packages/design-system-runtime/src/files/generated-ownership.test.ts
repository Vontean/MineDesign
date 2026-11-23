import { describe, expect, it, vi } from "vitest";

vi.mock("@minedesign/contracts/ui-messages", () => ({ uiMessage: (key: string) => key }));
vi.mock("../editor/files-index", () => ({
  relativeProjectFilePath: (path: string) => (path.startsWith("project/") ? path.slice(8) : undefined),
}));
vi.mock("../editor/migration-banners", () => ({
  MIGRATION_ANALYTICS_EVENTS: { foreignFilesNoticed: "foreign" },
  reportMigrationAnalytics: vi.fn(),
}));
vi.mock("../model/file-policy", () => ({
  DESIGN_SYSTEM_PATHS: { manifest: "manifest.json", readme: "README.md" },
  hasGeneratedSystemHeader: (_path: string, text: string) => text.startsWith("GEN"),
}));
vi.mock("../model/file-table", () => ({ DESIGN_SYSTEM_MANIFEST_VERSION: 3 }));
vi.mock("./carry", () => ({ summarizeFileNames: (names: readonly string[]) => names.join(",") }));
vi.mock("./paths", () => ({ retryFileRead: <T>(read: () => Promise<T>) => read() }));

import type * as M from "../contracts/design-system-document";
import { createGeneratedOwnership } from "./generated-ownership";

const encode = (text: string) => ({ bytes: new TextEncoder().encode(text) });

function fixture(options: { peek?: (path: string) => Promise<{ bytes: Uint8Array }>; liveSha?: Record<string, string | null> } = {}) {
  const timerCalls: { id: number; callback: () => void; delay: number; cleared: boolean }[] = [];
  const timers = {
    setTimeout: (callback: () => void, delay: number) => {
      const entry = { id: timerCalls.length, callback, delay, cleared: false };
      timerCalls.push(entry);
      return entry.id as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout: (id: ReturnType<typeof setTimeout>) => {
      timerCalls[id as unknown as number].cleared = true;
    },
    now: () => 0,
    random: () => 0,
  };
  const calls: string[] = [];
  let dirty = 1;
  let disposed = false;
  const subscriber = vi.fn();
  const notice = vi.fn();
  const ownership = createGeneratedOwnership({
    port: { liveSha: (path: string) => options.liveSha?.[path], peekBytes: options.peek } as never,
    timers,
    queue: {
      state: () => ({ dirty }) as never,
      commit: () => void calls.push("commit"),
    },
    saveSubscribers: new Set([subscriber]),
    notice,
    isDisposed: () => disposed,
    saveState: () => ({ status: "ready" }) as M.DocumentSaveState,
    regenerate: () => (calls.push("regenerate"), []),
    invalidateGeneratedFiles: () => void calls.push("invalidate"),
    scheduleGeneratedRetry: () => void calls.push("scheduleRetry"),
    cancelGeneratedRetry: () => void calls.push("cancelRetry"),
  });
  return { ownership, timerCalls, calls, subscriber, notice, setDirty: (value: number) => (dirty = value), dispose: () => (disposed = true) };
}

const flush = async () => {
  for (let index = 0; index < 8; index++) await Promise.resolve();
};

describe("generated ownership", () => {
  it("远端不存在的文件可以直接生成，不探测", () => {
    const { ownership } = fixture({ liveSha: { "project/api/a.md": null } });
    expect(ownership.canGenerateFile("project/api/a.md", "write")).toBe(true);
  });

  it("探测期间先返回 false，确认是本编辑器生成后放行，并欠一次刷新", async () => {
    const { ownership, calls, subscriber } = fixture({ peek: async () => encode("GEN header") });
    expect(ownership.canGenerateFile("project/api/a.md", "write")).toBe(false);
    expect(ownership.workPending()).toBe(true);
    expect(subscriber).toHaveBeenCalledTimes(1);
    await flush();
    expect(ownership.canGenerateFile("project/api/a.md", "write")).toBe(true);
    // 探测结束：先作废缓存，再安排重试；欠刷新直到重试或 settle 清掉
    expect(calls).toEqual(["invalidate", "scheduleRetry"]);
    expect(ownership.refreshOwed()).toBe(true);
    expect(ownership.workPending()).toBe(true);
    ownership.clearRefreshOwed();
    expect(ownership.workPending()).toBe(false);
  });

  it("别人写的文件记为外来：通知一次，永远不放行", async () => {
    const { ownership, notice } = fixture({ peek: async () => encode("handwritten") });
    ownership.canGenerateFile("project/api/a.md", "write");
    await flush();
    expect(notice).toHaveBeenCalledTimes(1);
    expect(notice.mock.calls[0][0]).toContain("api/a.md in this system was not made by this editor");
    expect(ownership.canGenerateFile("project/api/a.md", "write")).toBe(false);
    expect(notice).toHaveBeenCalledTimes(1);
  });

  it("没有 peekBytes 能力时直接记为外来", async () => {
    const { ownership, notice } = fixture();
    expect(ownership.canGenerateFile("project/api/a.md", "remove")).toBe(false);
    await flush();
    expect(notice.mock.calls[0][0]).toContain("is left as it is.");
  });

  it("远端 not_found 且本地没有版本时视为自己的文件", async () => {
    const { ownership } = fixture({ peek: async () => Promise.reject({ code: "not_found" }) });
    ownership.canGenerateFile("project/api/a.md", "write");
    await flush();
    expect(ownership.isOurs("project/api/a.md")).toBe(true);
  });

  it("读取失败时安排重试，定时器按固定顺序重新再生成并提交", async () => {
    const { ownership, timerCalls, calls, setDirty } = fixture({ peek: async () => Promise.reject({ code: "io" }) });
    ownership.canGenerateFile("project/api/a.md", "write");
    await flush();
    // 探测超时定时器已回收，剩下重试定时器
    const retry = timerCalls.find((entry) => entry.delay === 2000 && !entry.cleared)!;
    expect(retry).toBeDefined();
    expect(ownership.workPending()).toBe(true);
    calls.length = 0;
    retry.callback();
    expect(calls).toEqual(["invalidate", "regenerate", "commit"]);
    setDirty(0);
    expect(ownership.workPending()).toBe(false);
  });

  it("重试次数用完后只提示一次；用户再次编辑后重新计数", async () => {
    const { ownership, timerCalls, notice } = fixture({ peek: async () => Promise.reject({ code: "io" }) });
    const run = async () => {
      ownership.canGenerateFile("project/api/a.md", "write");
      await flush();
      const pending = timerCalls.filter((entry) => !entry.cleared && entry.delay >= 2000 && entry.delay !== 1e4).at(-1)!;
      pending.callback();
    };
    for (let attempt = 0; attempt < 6; attempt++) await run();
    expect(notice).not.toHaveBeenCalled();
    await run();
    await run();
    expect(notice).toHaveBeenCalledTimes(1);
    ownership.resetRetryBudget();
    await run();
    expect(timerCalls.at(-1)!.delay).toBe(2000);
  });

  it("settleProbes 补做一次再生成：先取消重试，再作废、再生成、提交", async () => {
    const { ownership, calls } = fixture({ peek: async () => encode("GEN") });
    ownership.canGenerateFile("project/api/a.md", "write");
    calls.length = 0;
    await ownership.settleProbes();
    expect(calls.slice(0, 4)).toEqual(["invalidate", "scheduleRetry", "cancelRetry", "invalidate"]);
    expect(calls.slice(4)).toEqual(["regenerate", "commit"]);
    expect(ownership.refreshOwed()).toBe(false);
  });

  it("dispose 只回收重试定时器；销毁后不再有待办", async () => {
    const { ownership, timerCalls, dispose } = fixture({ peek: async () => Promise.reject({ code: "io" }) });
    ownership.canGenerateFile("project/api/a.md", "write");
    await flush();
    const retry = timerCalls.find((entry) => entry.delay === 2000 && !entry.cleared)!;
    dispose();
    ownership.dispose();
    expect(retry.cleared).toBe(true);
    expect(ownership.workPending()).toBe(false);
  });

  it("forget 与 markOurs 维护所有权表", () => {
    const { ownership } = fixture();
    ownership.markOurs("project/api/a.md");
    expect(ownership.isOurs("project/api/a.md")).toBe(true);
    ownership.forget("project/api/a.md");
    expect(ownership.isOurs("project/api/a.md")).toBe(false);
  });
});
