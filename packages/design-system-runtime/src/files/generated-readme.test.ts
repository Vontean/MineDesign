import { describe, expect, it, vi } from "vitest";

vi.mock("@minedesign/contracts/ui-messages", () => ({ uiMessage: () => "Design System" }));
vi.mock("../editor/files-index", () => ({ PROJECT_FILE_PREFIXEditorFilesIndex: "project/" }));
vi.mock("../editor/index-file-store", () => ({ sha256Sync: (text: string) => `sha:${text}` }));
vi.mock("../model/documentation", () => ({ generatedConsumptionReadme: () => "TAIL" }));
vi.mock("../model/file-policy", () => ({ DESIGN_SYSTEM_PATHS: { readme: "README.md" } }));
vi.mock("../model/stored-file-codec", () => ({
  generatedReadmeTail: (tail: string) => tail,
  mergeReadmeWithGeneratedTail: (readme: string, tail: string) => `${readme}|${tail}`,
}));
vi.mock("./paths", () => ({ fileContentContainsRuntimeMarkers: (text: string) => text.includes("RUNTIME") }));

import type * as M from "../contracts/design-system-document";
import { createGeneratedReadme } from "./generated-readme";

const README = "project/README.md";

function fixture(options: { files?: Record<string, string>; live?: Record<string, string | null | undefined>; held?: Record<string, string>; readTexts?: Record<string, string>; readShas?: Record<string, string>; remote?: string | null; clashPolicy?: "mine" | "theirs" | "ask" } = {}) {
  const timerCalls: { callback: () => void; delay: number; cleared: boolean }[] = [];
  let now = 0;
  const timers = {
    setTimeout: (callback: () => void, delay: number) => (timerCalls.push({ callback, delay, cleared: false }), (timerCalls.length - 1) as unknown as ReturnType<typeof setTimeout>),
    clearTimeout: (id: ReturnType<typeof setTimeout>) => void (timerCalls[id as unknown as number].cleared = true),
    now: () => now,
    random: () => 0,
  };
  let files: Record<string, string> = { ...(options.files ?? {}) };
  const live = { ...(options.live ?? {}) };
  const queue = { markDirty: vi.fn(), withdraw: vi.fn(), commit: vi.fn() };
  const regeneration = { regenerate: vi.fn((): string[] => ["x"]), invalidate: vi.fn(), scheduleRetry: vi.fn() };
  const emit = vi.fn();
  const refresh = vi.fn();
  const flags = new Map<string, M.DocumentFlag>();
  const readTexts = new Map(Object.entries(options.readTexts ?? {}));
  const readShas = new Map(Object.entries(options.readShas ?? {}));
  const readme = createGeneratedReadme({
    document: { title: () => "  My   System ", content: () => ({ files }), readOnly: () => false, loadState: () => "live" } as never,
    queue,
    port: {
      liveSha: (path: string) => live[path],
      heldSha: (path: string) => options.held?.[path],
      readText: async () => {
        if (options.remote === null) throw Error("offline");
        return { text: options.remote ?? "remote" };
      },
    } as never,
    timers,
    flags,
    mergingTokenPaths: new Set(),
    readTexts,
    readShas,
    generated: true,
    clashPolicy: options.clashPolicy ?? "mine",
    projectReadmePath: README,
    regeneration,
    emit,
    currentFileText: (path) => (typeof files[path] === "string" ? files[path] : null),
    fileValueProvider: (path) => () => files[path],
    refreshUnchangedLocalFile: refresh,
  });
  return { readme, queue, regeneration, emit, refresh, timerCalls, live, setFiles: (next: Record<string, string>) => (files = next), advance: (ms: number) => (now += ms), readTexts, readShas };
}

describe("generated readme", () => {
  it("wire 把生成尾部并到 README 后", () => {
    expect(fixture().readme.wire("# A\n")).toBe("# A\n|TAIL");
  });

  describe("缺失 README", () => {
    it("远端没有 README 时按标题生成并标脏（基线为 null）", () => {
      const { readme, queue } = fixture({ live: { [README]: null } });
      const changed: string[] = [];
      readme.generateMissingReadme({}, changed);
      expect(queue.markDirty).toHaveBeenCalledTimes(1);
      const [path, provider, base] = queue.markDirty.mock.calls[0];
      expect([path, provider(), base]).toEqual([README, "# My System\n", null]);
      expect(changed).toEqual([README]);
    });

    it("README 已存在时什么都不做", () => {
      const { readme, queue } = fixture({ live: { [README]: null } });
      readme.generateMissingReadme({ "README.md": "x" }, []);
      expect(queue.markDirty).not.toHaveBeenCalled();
    });

    it("远端已有别人的 README 时不覆盖", () => {
      const { readme, queue } = fixture({ live: { [README]: "sha:other" } });
      readme.generateMissingReadme({}, []);
      expect(queue.markDirty).not.toHaveBeenCalled();
    });

    it("冲突两次后停手：不再生成", () => {
      const { readme, queue, live } = fixture({ live: { [README]: null } });
      const generate = () => readme.generateMissingReadme({}, []);
      const conflict = (): void => {
        generate();
        expect(readme.noteReadmePublish({ ok: false, code: "conflict", paths: [README] })).toBe(true);
      };
      conflict();
      conflict();
      queue.markDirty.mockClear();
      live[README] = null;
      generate();
      expect(queue.markDirty).not.toHaveBeenCalled();
    });
  });

  describe("保存回调钩子", () => {
    it("发布成功后记下文本与 sha，非默认标题时安排一次再生成（1 秒定时器）", () => {
      const { readme, live, timerCalls, regeneration, queue } = fixture({ live: { [README]: null } });
      readme.generateMissingReadme({}, []);
      live[README] = "sha1";
      expect(readme.noteReadmePublish({ ok: true, paths: [README], texts: { [README]: "# My System\n" } })).toBe(true);
      expect(timerCalls).toHaveLength(0);
      // 用户改过标题再发布：与默认标题不同，才需要补一次再生成
      readme.generateMissingReadme({}, []);
      expect(readme.noteReadmePublish({ ok: true, paths: [README], texts: { [README]: "# My System\n" } })).toBe(true);
      readme.scheduleRegeneration();
      expect(timerCalls).toHaveLength(1);
      expect(timerCalls[0].delay).toBe(1000);
      timerCalls[0].callback();
      expect(regeneration.invalidate).toHaveBeenCalled();
      expect(queue.commit).toHaveBeenCalledTimes(1);
    });

    it("一分钟内最多安排 10 次，计时器未触发时不重复安排", () => {
      const { readme, timerCalls } = fixture();
      readme.scheduleRegeneration();
      readme.scheduleRegeneration();
      expect(timerCalls).toHaveLength(1);
      for (let index = 0; index < 12; index++) {
        timerCalls.at(-1)!.callback();
        readme.scheduleRegeneration();
      }
      expect(timerCalls.length).toBeLessThanOrEqual(10);
    });

    it("不是我们生成的 README 发布时，返回 false", () => {
      const { readme } = fixture();
      expect(readme.noteReadmePublish({ ok: true, paths: ["project/api/a.md"] })).toBe(false);
    });
  });

  describe("尾部过期", () => {
    const base = { files: { "README.md": "# A\n" }, readTexts: { [README]: "# A\n" }, readShas: { [README]: "sha0" }, live: { [README]: "sha0" } };

    it("README 已发布且尾部不同：标脏并追加到变更列表，同一尾部只写一次", () => {
      const { readme, queue } = fixture(base);
      const items: string[] = ["api/a.md"];
      readme.updateReadmeTail({ "README.md": "# A\n" }, items);
      expect(items).toEqual(["api/a.md", README]);
      expect(queue.markDirty).toHaveBeenCalledTimes(1);
      readme.updateReadmeTail({ "README.md": "# A\n" }, items);
      expect(queue.markDirty).toHaveBeenCalledTimes(1);
    });

    it("没有其他变更、或本地文本与已读不同时不动", () => {
      const noItems = fixture(base);
      noItems.readme.updateReadmeTail({ "README.md": "# A\n" }, []);
      // 没有别的派生文件变更时，不单独改 README
      expect(noItems.queue.markDirty).not.toHaveBeenCalled();
      const edited = fixture(base);
      edited.readme.updateReadmeTail({ "README.md": "# B\n" }, ["x"]);
      expect(edited.queue.markDirty).not.toHaveBeenCalled();
    });

    it("尾部冲突：撤回、作废缓存、按 mine 策略刷新并安排重试；发布成功后不再按尾部处理", () => {
      const { readme, queue, regeneration, refresh, emit } = fixture(base);
      readme.updateReadmeTail({ "README.md": "# A\n" }, ["x"]);
      expect(readme.handleTailConflict({ path: README, theirsSha: "sha9" } as never)).toBe(true);
      expect(queue.withdraw).toHaveBeenCalledWith(README);
      expect(regeneration.invalidate).toHaveBeenCalled();
      expect(emit).toHaveBeenCalledWith("generated-behind", { path: README });
      expect(refresh).toHaveBeenCalledWith("README.md", README, "sha9");
      expect(regeneration.scheduleRetry).toHaveBeenCalled();
      // 已处理过：同一冲突不会再被当作尾部冲突
      expect(readme.handleTailConflict({ path: README, theirsSha: "sha9" } as never)).toBe(false);
    });

    it("尾部已发布后冲突按普通文件处理；ask 策略不自动刷新", () => {
      const published = fixture(base);
      published.readme.updateReadmeTail({ "README.md": "# A\n" }, ["x"]);
      published.readme.markTailPublished();
      expect(published.readme.handleTailConflict({ path: README, theirsSha: "s" } as never)).toBe(false);
      const ask = fixture({ ...base, clashPolicy: "ask" });
      ask.readme.updateReadmeTail({ "README.md": "# A\n" }, ["x"]);
      expect(ask.readme.handleTailConflict({ path: README, theirsSha: "s" } as never)).toBe(true);
      expect(ask.refresh).not.toHaveBeenCalled();
    });

    it("writeReadmeTail：远端尚无尾部才写入并通知", async () => {
      const ok = fixture({ ...base, remote: "# A\n" });
      expect(await ok.readme.writeReadmeTail()).toBe(true);
      expect(ok.emit).toHaveBeenCalledWith("generated", { paths: [README] });
      const done = fixture({ ...base, remote: "# A\n## Consuming this system" });
      expect(await done.readme.writeReadmeTail()).toBe(false);
      const offline = fixture({ ...base, remote: null });
      expect(await offline.readme.writeReadmeTail()).toBe(false);
      expect(offline.queue.markDirty).not.toHaveBeenCalled();
    });
  });

  it("dispose 回收 README 再生成计时器", () => {
    const { readme, timerCalls } = fixture();
    readme.scheduleRegeneration();
    readme.dispose();
    expect(timerCalls[0].cleared).toBe(true);
  });
});
