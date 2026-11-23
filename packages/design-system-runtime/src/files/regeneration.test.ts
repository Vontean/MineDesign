import { describe, expect, it, vi } from "vitest";

vi.mock("../editor/files-index", () => ({
  damagedDerivedProjectPaths: (files: Record<string, string>) => Object.keys(files).filter((key) => files[key].includes("�") && key.startsWith("api/")).map((key) => `project/${key}`),
  isDerivedProjectPath: (path: string) => path.startsWith("project/api/"),
  relativeProjectFilePath: (path: string) => (path.startsWith("project/") ? path.slice(8) : undefined),
  validDerivedProjectFiles: (files: Record<string, string>) =>
    new Map(Object.entries(files).filter(([key, text]) => key.startsWith("api/") && !text.includes("�")).map(([key, text]) => [`project/${key}`, text])),
}));
vi.mock("../editor/index-file-store", () => ({ sha256Sync: (text: string) => `sha:${text}` }));
vi.mock("./carry", () => ({ summarizeFileNames: (names: readonly string[]) => names.join(",") }));
vi.mock("./design-system-port", () => ({ DAMAGED_FILE_REPLACEMENT_CHARACTER: "�" }));

import type * as Core from "../contracts";
import { createRegeneration } from "./regeneration";

function fixture(options: { generated?: boolean; edited?: boolean; files?: Record<string, string>; live?: Record<string, string | null>; owned?: Set<string> } = {}) {
  const timerCalls: { callback: () => void; delay: number; cleared: boolean }[] = [];
  const timers = {
    setTimeout: (callback: () => void, delay: number) => {
      timerCalls.push({ callback, delay, cleared: false });
      return (timerCalls.length - 1) as unknown as ReturnType<typeof setTimeout>;
    },
    clearTimeout: (id: ReturnType<typeof setTimeout>) => void (timerCalls[id as unknown as number].cleared = true),
    now: () => 0,
    random: () => 0,
  };
  let files: Core.FileTable = Object.freeze({ ...(options.files ?? {}) });
  const state = { readOnly: false, loadState: "live", dirty: 0, refreshOwed: false };
  const log: string[] = [];
  const markDirty = vi.fn((path: string, provider: () => unknown) => {
    state.dirty++;
    log.push(`dirty:${path}:${provider()}`);
  });
  const notice = vi.fn();
  const emit = vi.fn();
  const regeneration = createRegeneration({
    document: { readOnly: () => state.readOnly, loadState: () => state.loadState, content: () => ({ files }), title: () => "T" } as never,
    queue: { markDirty, state: () => ({ dirty: state.dirty }), commit: () => void (log.push("commit"), (state.dirty = 0)) } as never,
    port: { liveSha: (path: string) => options.live?.[path], knownListing: undefined } as never,
    timers,
    flags: new Map(),
    generated: options.generated ?? true,
    debounceMs: 300,
    ownership: {
      canGenerateFile: (path: string) => options.owned?.has(path) ?? true,
      refreshOwed: () => state.refreshOwed,
      clearRefreshOwed: () => void (state.refreshOwed = false),
      notifyPending: () => void log.push("notify"),
    },
    userEditedLocally: () => options.edited ?? true,
    notice,
    emit,
    ensureReactPreviewLibraries: () => void log.push("libs"),
    updateReadmeTail: () => void log.push("tail"),
    generateMissingReadme: () => void log.push("readme"),
  });
  return { regeneration, timerCalls, state, log, markDirty, notice, emit, setFiles: (next: Core.FileTable) => (files = Object.freeze({ ...next })) };
}

describe("regeneration", () => {
  it("没有生成开关、没有本地编辑或不在 live 状态时什么都不做", () => {
    expect(fixture({ generated: false }).regeneration.regenerate()).toEqual([]);
    expect(fixture({ edited: false }).regeneration.regenerate()).toEqual([]);
    const live = fixture();
    live.state.loadState = "loading";
    expect(live.regeneration.regenerate()).toEqual([]);
  });

  it("按顺序：预览库、派生文件标脏、README 尾部、缺失 README，再通知 generated", () => {
    const { regeneration, log, emit } = fixture({ files: { "api/a.md": "A" } });
    expect(regeneration.regenerate()).toEqual(["project/api/a.md"]);
    expect(log).toEqual(["libs", "dirty:project/api/a.md:A", "tail", "readme"]);
    expect(emit).toHaveBeenCalledWith("generated", { paths: ["project/api/a.md"] });
  });

  it("内容与标题都没变时短路；invalidate 之后重新检查", () => {
    const { regeneration, log } = fixture({ files: { "api/a.md": "A" } });
    regeneration.regenerate();
    log.length = 0;
    expect(regeneration.regenerate()).toEqual([]);
    expect(log).toEqual(["libs"]);
    regeneration.invalidate();
    regeneration.regenerate();
    // 已生成过相同文本：不再标脏，但 README 钩子仍执行
    expect(log).toEqual(["libs", "libs", "tail", "readme"]);
  });

  it("远端已是相同内容时只记下文本；没有所有权时跳过", () => {
    const same = fixture({ files: { "api/a.md": "A" }, live: { "project/api/a.md": "sha:A" } });
    expect(same.regeneration.regenerate()).toEqual([]);
    const foreign = fixture({ files: { "api/a.md": "A" }, owned: new Set() });
    expect(foreign.regeneration.regenerate()).toEqual([]);
    expect(foreign.markDirty).not.toHaveBeenCalled();
  });

  it("文本含替换字符时提示一次，且不写入", () => {
    const { regeneration, notice, markDirty } = fixture({ files: { "api/a.md": "bad�" } });
    regeneration.regenerate();
    regeneration.invalidate();
    regeneration.regenerate();
    expect(markDirty).not.toHaveBeenCalled();
    expect(notice).toHaveBeenCalledTimes(1);
    expect(notice.mock.calls[0][0]).toContain("api/a.md is not being updated");
  });

  it("源文件消失后，已生成的派生文件被标记删除", () => {
    const { regeneration, setFiles, log } = fixture({ files: { "api/a.md": "A" } });
    regeneration.regenerate();
    setFiles({});
    log.length = 0;
    expect(regeneration.regenerate()).toEqual(["project/api/a.md"]);
    expect(log[1]).toBe("dirty:project/api/a.md:null");
  });

  it("防抖：重复安排只保留最后一个，到点再生成并清空句柄", () => {
    const { regeneration, timerCalls, log } = fixture({ files: { "api/a.md": "A" } });
    regeneration.scheduleDebounced();
    regeneration.scheduleDebounced();
    expect(timerCalls.map((entry) => [entry.delay, entry.cleared])).toEqual([[300, true], [300, false]]);
    timerCalls[1].callback();
    expect(log).toContain("dirty:project/api/a.md:A");
  });

  it("重试：1 秒后欠的刷新清零，再生成有改动时提交并通知", () => {
    const { regeneration, timerCalls, log, state } = fixture({ files: { "api/a.md": "A" } });
    state.refreshOwed = true;
    regeneration.scheduleRetry();
    regeneration.scheduleRetry();
    expect(timerCalls).toHaveLength(1);
    expect(timerCalls[0].delay).toBe(1000);
    timerCalls[0].callback();
    expect(state.refreshOwed).toBe(false);
    expect(log.slice(-2)).toEqual(["commit", "notify"]);
  });

  it("重试一分钟内最多 3 次：超限且仍欠刷新时延后再试", () => {
    const { regeneration, timerCalls, state } = fixture({ files: { "api/a.md": "A" } });
    // 每次重试后队列都有待发内容，累计 3 次
    for (let index = 0; index < 3; index++) {
      state.dirty = 1;
      regeneration.scheduleRetry();
      timerCalls.at(-1)!.callback();
    }
    state.refreshOwed = true;
    regeneration.scheduleRetry();
    timerCalls.at(-1)!.callback();
    expect(timerCalls.at(-1)!.delay).toBe(60000 + 100);
    expect(state.refreshOwed).toBe(true);
  });

  it("cancelRetry 回收并清空句柄，之后可以重新安排", () => {
    const { regeneration, timerCalls } = fixture();
    regeneration.scheduleRetry();
    regeneration.cancelRetry();
    expect(timerCalls[0].cleared).toBe(true);
    regeneration.scheduleRetry();
    expect(timerCalls).toHaveLength(2);
  });

  it("dispose 先回收重试、再回收防抖", () => {
    const { regeneration, timerCalls } = fixture();
    regeneration.scheduleDebounced();
    regeneration.scheduleRetry();
    regeneration.dispose();
    expect(timerCalls.map((entry) => entry.cleared)).toEqual([true, true]);
  });
});
