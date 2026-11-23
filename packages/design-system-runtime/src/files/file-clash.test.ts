import { beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("../editor/files-index", () => ({
  projectFilePath: (path: string) => `project/${path}`,
  isProjectContentPath: () => true,
  publishableFileMimeType: () => "application/json",
}));
vi.mock("./carry", () => ({
  FILE_CONFLICT_CHOICE_SUFFIX: " [choose]",
  fileBaseName: (path: string) => path.split("/").pop(),
  RECENT_PUBLISH_CLASH_NOTICE_MS: 1000,
  RECENT_PUBLISH_HEAL_WINDOW_MS: 3000,
}));
vi.mock("./paths", () => ({ retryFileRead: <T>(read: () => Promise<T>) => read() }));

import type * as M from "../contracts/design-system-document";
import { installEditorIndexFileStore } from "../editor/index-file-store";
import { DESIGN_SYSTEM_PATHS, installModelFilePolicy } from "../model/file-policy";
import { createFileClash } from "./file-clash";

beforeAll(() => {
  installModelFilePolicy()();
  installEditorIndexFileStore()();
  tokensPath = DESIGN_SYSTEM_PATHS.tokens;
});

let tokensPath = "tokens.json";
const tokens = (colors: [string, string][]) =>
  JSON.stringify({ version: 1, color: { themes: [{ id: "light", name: "浅色" }], tokens: colors.map(([name, light]) => ({ name, value: { light }, usage: "" })) } });

interface Options {
  clashPolicy?: "mine" | "theirs" | "ask";
  files?: Record<string, string>;
  liveShas?: Record<string, string | null>;
  readTexts?: Record<string, string>;
  busy?: boolean;
  remote?: Record<string, { text: string; sha256: string }>;
}

function fixture(options: Options = {}) {
  let files: Record<string, string> = { ...(options.files ?? {}) };
  const liveShas = { ...(options.liveShas ?? {}) };
  const held = new Set<string>();
  const document = {
    loadState: () => "live",
    held: () => held,
    content: () => ({ files }),
    releaseHold: (path: string) => void held.delete(path),
  };
  const queue = {
    withdraw: vi.fn(),
    flushNow: vi.fn(),
    state: () => ({}) as never,
    unsendable: () => new Set<string>(),
  };
  const timerCalls: { callback: () => void; delay: number }[] = [];
  const flags = new Map<string, M.DocumentFlag>();
  const flaggedPaths = new Set<string>();
  const noticedClashShas = new Map<string, string | null | undefined>();
  const readTexts = new Map(Object.entries(options.readTexts ?? {}));
  const readShas = new Map<string, string>();
  const recentPublishes = new Map<string, M.RecentPublish>();
  const emit = vi.fn();
  const notice = vi.fn();
  const notifyFlags = vi.fn();
  const markDirty = vi.fn();
  const clearCarriedFiles = vi.fn();
  const retokenUndo = vi.fn();
  const pruneUndoPaths = vi.fn();
  const keepOutOfUndo = vi.fn();
  const flushNow = vi.fn();
  const takeRemoteFile = vi.fn((path: string) => {
    // 取对方版本：对方已删除时本地文件也清掉
    if (liveShas[path] === null) delete files[path];
  });
  const replaceFileText = vi.fn((path: string, text: string) => { files = { ...files, [path]: text }; });
  let now = 10_000;
  const clash = createFileClash({
    document: document as unknown as M.BaseFilesDocument,
    queue: queue as never,
    port: {
      readText: async (path: string) => options.remote?.[path] ?? { text: "", sha256: "" },
      readBytes: async () => null,
    } as never,
    clashPolicy: options.clashPolicy ?? "mine",
    flags, flaggedPaths, noticedClashShas, readTexts, readShas, recentPublishes,
    timers: { now: () => now, setTimeout: ((callback: () => void, delay: number) => { timerCalls.push({ callback, delay }); return 0; }) as never },
    emit, notice, notifyFlags,
    isBusy: () => options.busy === true,
    isDisposed: () => false,
    liveSha: (path) => liveShas[path],
    currentFileText: (path) => (typeof files[path] === "string" ? files[path] : null),
    keepOutOfUndo, takeRemoteFile, replaceFileText,
    advancePathRevision: vi.fn(),
    clearCarriedFiles, retokenUndo, pruneUndoPaths, markDirty,
    fileValueProvider: (path) => () => files[path],
    flushNow,
  });
  return {
    clash, flags, flaggedPaths, noticedClashShas, readTexts, readShas, recentPublishes, emit, notice, notifyFlags,
    markDirty, clearCarriedFiles, retokenUndo, pruneUndoPaths, keepOutOfUndo, flushNow, takeRemoteFile, replaceFileText,
    queue, held, timerCalls, text: (path: string) => files[path], advanceTime: (ms: number) => { now += ms; },
  };
}

const settle = async () => { for (let i = 0; i < 6; i++) await Promise.resolve(); };

describe("file clash: flag, notice, release", () => {
  it("flags once, notifies once per sha, and keeps the file out of the save queue", () => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "mine" } });
    f.clash.flagClashingFile("a.txt", "edit", "sha-1");
    expect(f.flags.get("a.txt")).toMatchObject({ path: "a.txt", why: "edit", theirsSha: "sha-1" });
    expect(f.flaggedPaths.has("a.txt")).toBe(true);
    expect(f.queue.withdraw).toHaveBeenCalledWith("project/a.txt");
    expect(f.emit).toHaveBeenCalledWith("flag", { path: "project/a.txt", why: "edit", theirs: "sha-1" });
    expect(f.notice).toHaveBeenCalledTimes(1);
    expect(f.notice.mock.calls[0][0]).toContain("a.txt");
    expect(f.notifyFlags).toHaveBeenCalledTimes(1);
    // 同一个文件再次冲突：不重复提示，对方版本没变也不重复通知
    f.clash.flagClashingFile("a.txt", "edit", "sha-1");
    expect(f.notice).toHaveBeenCalledTimes(1);
    expect(f.notifyFlags).toHaveBeenCalledTimes(1);
    expect(f.emit.mock.calls.filter(([type]) => type === "flag")).toHaveLength(1);
    // 对方版本变了：更新标记并通知界面
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    expect(f.flags.get("a.txt")?.theirsSha).toBe("sha-2");
    expect(f.notifyFlags).toHaveBeenCalledTimes(2);
  });

  it("uses the deletion wording when the other side deleted the file", () => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "mine" } });
    f.clash.flagClashingFile("a.txt", "edit", null);
    expect(f.notice.mock.calls[0][0]).toContain("deleted");
  });

  it("prefers a custom detail message", () => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "mine" } });
    f.clash.flagClashingFile("a.txt", "edit", "s", "custom");
    expect(f.notice).toHaveBeenCalledWith("custom");
  });

  it("unflag releases the mark, the notice memory and the carried copy", () => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "mine" } });
    f.clash.flagClashingFile("a.txt", "edit", "s");
    f.clash.unflagFile("a.txt");
    expect(f.flags.has("a.txt")).toBe(false);
    expect(f.flaggedPaths.has("a.txt")).toBe(false);
    expect(f.noticedClashShas.has("a.txt")).toBe(false);
    expect(f.clearCarriedFiles).toHaveBeenCalledWith(["a.txt"]);
    expect(f.notifyFlags).toHaveBeenCalledTimes(2);
    f.clash.unflagFile("a.txt");
    expect(f.notifyFlags).toHaveBeenCalledTimes(2);
  });
});

describe("file clash: policy on an edit clash", () => {
  it("mine: keeps my text and republishes on top of theirs", () => {
    const f = fixture({ clashPolicy: "mine", files: { "a.txt": "mine" }, readTexts: { "project/a.txt": "base" } });
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    expect(f.flags.size).toBe(0);
    expect(f.retokenUndo).toHaveBeenCalledWith("a.txt");
    expect(f.markDirty).toHaveBeenCalledWith("project/a.txt", expect.any(Function), "sha-2");
    expect(f.emit).toHaveBeenCalledWith("clash-mine", { path: "project/a.txt", theirs: "sha-2" });
    expect(f.flushNow).toHaveBeenCalledOnce();
  });

  it("mine: waits to flush while the user is busy editing", () => {
    const f = fixture({ clashPolicy: "mine", busy: true, files: { "a.txt": "mine" }, readTexts: { "project/a.txt": "base" } });
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    expect(f.markDirty).toHaveBeenCalledOnce();
    expect(f.flushNow).not.toHaveBeenCalled();
  });

  it("mine: takes the remote file when my text was deleted and theirs exists", () => {
    const f = fixture({ clashPolicy: "mine", files: {}, readTexts: {} });
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    expect(f.takeRemoteFile).toHaveBeenCalledWith("a.txt");
    expect(f.markDirty).not.toHaveBeenCalled();
  });

  it("mine: nothing of mine to keep when the text equals what was read", () => {
    const f = fixture({ clashPolicy: "mine", files: { "a.txt": "same" }, readTexts: { "project/a.txt": "same" }, liveShas: { "a.txt": "sha-2" } });
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    expect(f.emit).toHaveBeenCalledWith("clash-nothing-mine", { path: "project/a.txt", theirs: "sha-2" });
    expect(f.markDirty).not.toHaveBeenCalled();
    expect(f.flags.size).toBe(0);
  });

  it("theirs: reverts to the remote version and says so", () => {
    const f = fixture({ clashPolicy: "theirs", files: { "a.txt": "mine" }, readTexts: { "project/a.txt": "base" }, liveShas: { "a.txt": "sha-2" } });
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    expect(f.emit).toHaveBeenCalledWith("conflict-reverted", { path: "project/a.txt", theirs: "sha-2" });
    expect(f.takeRemoteFile).toHaveBeenCalledWith("a.txt");
    expect(f.keepOutOfUndo).toHaveBeenCalledWith("a.txt");
    expect(f.flags.size).toBe(0);
  });

  it("theirs: does not revert a file restored from a stash; it is flagged instead", () => {
    const f = fixture({ clashPolicy: "theirs", files: { "a.txt": "mine" }, readTexts: { "project/a.txt": "base" } });
    f.clash.markRestoredStash("a.txt");
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    expect(f.flags.has("a.txt")).toBe(true);
    expect(f.takeRemoteFile).not.toHaveBeenCalled();
    f.clash.forgetRestoredStash("a.txt");
  });

  it("ask: always flags and never auto-resolves", () => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "mine" }, readTexts: { "project/a.txt": "mine" } });
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    expect(f.flags.has("a.txt")).toBe(true);
    expect(f.markDirty).not.toHaveBeenCalled();
    expect(f.takeRemoteFile).not.toHaveBeenCalled();
  });
});

describe("file clash: resolve or flag", () => {
  it("flags an ordinary file right away", () => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "mine" } });
    f.clash.resolveOrFlagClash("a.txt", "edit", "sha-2");
    expect(f.flags.has("a.txt")).toBe(true);
    expect(f.clash.mergingTokenPaths.size).toBe(0);
  });

  it("flags a token file when the other side deleted it", () => {
    const f = fixture({ clashPolicy: "ask", files: { [tokensPath]: tokens([["a", "#111"]]) } });
    f.clash.resolveOrFlagClash(tokensPath, "edit", null);
    expect(f.flags.has(tokensPath)).toBe(true);
  });

  it("merges a token file when both sides changed different tokens", async () => {
    const base = tokens([["a", "#111"], ["b", "#222"]]);
    const mine = tokens([["a", "#aaa"], ["b", "#222"]]);
    const theirs = tokens([["a", "#111"], ["b", "#bbb"]]);
    const abs = `project/${tokensPath}`;
    const f = fixture({ clashPolicy: "ask", files: { [tokensPath]: mine }, readTexts: { [abs]: base }, remote: { [abs]: { text: theirs, sha256: "sha-t" } } });
    f.clash.resolveOrFlagClash(tokensPath, "edit", "sha-t");
    // 合并期间路径被占用，保存队列不应发送
    expect(f.clash.mergingTokenPaths.has(tokensPath)).toBe(true);
    expect(f.notifyFlags).toHaveBeenCalledTimes(1);
    await settle();
    expect(f.clash.mergingTokenPaths.size).toBe(0);
    expect(f.flags.size).toBe(0);
    const merged = JSON.parse(f.text(tokensPath));
    expect(merged.color.tokens.map((token: { value: { light: string } }) => token.value.light)).toEqual(["#aaa", "#bbb"]);
    expect(f.markDirty).toHaveBeenCalledWith(abs, expect.any(Function), "sha-t");
    expect(f.emit).toHaveBeenCalledWith("merged", { path: abs, theirs: "sha-t", wrote: true, why: "edit" });
    expect(f.flushNow).toHaveBeenCalledOnce();
  });

  it("flags with the token names when both sides changed the same token (ask)", async () => {
    const base = tokens([["a", "#111"]]);
    const abs = `project/${tokensPath}`;
    const f = fixture({
      clashPolicy: "ask",
      files: { [tokensPath]: tokens([["a", "#aaa"]]) },
      readTexts: { [abs]: base },
      remote: { [abs]: { text: tokens([["a", "#bbb"]]), sha256: "sha-t" } },
    });
    f.clash.resolveOrFlagClash(tokensPath, "edit", "sha-t");
    await settle();
    expect(f.flags.get(tokensPath)).toMatchObject({ why: "edit", theirsSha: "sha-t" });
    expect(f.flags.get(tokensPath)?.clash).toBeTruthy();
    expect(f.clash.mergingTokenPaths.size).toBe(0);
    expect(f.markDirty).not.toHaveBeenCalled();
  });

  it("mine policy settles a same-token conflict in my favour", async () => {
    const base = tokens([["a", "#111"]]);
    const abs = `project/${tokensPath}`;
    const f = fixture({
      clashPolicy: "mine",
      files: { [tokensPath]: tokens([["a", "#aaa"]]) },
      readTexts: { [abs]: base },
      remote: { [abs]: { text: tokens([["a", "#bbb"]]), sha256: "sha-t" } },
    });
    f.clash.resolveOrFlagClash(tokensPath, "edit", "sha-t");
    await settle();
    expect(f.flags.size).toBe(0);
    expect(JSON.parse(f.text(tokensPath)).color.tokens[0].value.light).toBe("#aaa");
  });
});

describe("file clash: simultaneous publish", () => {
  const publish = (f: ReturnType<typeof fixture>, path: string, text: string, base: string) =>
    f.recentPublishes.set(path, { at: 10_000, text, base, sha: "mine-sha" });

  it("restores my other token edits and records the heal for the next publish", () => {
    const base = tokens([["a", "#111"], ["b", "#222"]]);
    const published = tokens([["a", "#aaa"], ["b", "#222"]]);
    // 我发布了 a，对方同时发布了 b 并先落地，当前内容缺我的 a
    const nowText = tokens([["a", "#111"], ["b", "#bbb"]]);
    const f = fixture({ clashPolicy: "ask", files: { [tokensPath]: nowText } });
    publish(f, tokensPath, published, base);
    f.clash.healSimultaneousPublish(tokensPath, "their-sha");
    expect(f.emit).toHaveBeenCalledWith("healed", expect.objectContaining({ theirs: "their-sha" }));
    expect(f.flushNow).toHaveBeenCalledOnce();
    expect(f.recentPublishes.has(tokensPath)).toBe(false);
    expect(f.clash.consumeRecentHeal(tokensPath)).toBe(true);
    expect(f.clash.consumeRecentHeal(tokensPath)).toBe(false);
  });

  it("ignores a publish outside the heal window or without a base", () => {
    const f = fixture({ clashPolicy: "ask", files: { [tokensPath]: "x" } });
    publish(f, tokensPath, "y", "z");
    f.advanceTime(5000);
    f.clash.healSimultaneousPublish(tokensPath, "their-sha");
    expect(f.emit).not.toHaveBeenCalled();
    const g = fixture({ clashPolicy: "ask", files: { "a.txt": "x" } });
    g.recentPublishes.set("a.txt", { at: 10_000, text: "y", sha: "s" });
    g.clash.healSimultaneousPublish("a.txt", "their-sha");
    expect(g.emit).not.toHaveBeenCalled();
  });

  it("puts my lines back and flags the file when their version dropped them (ask)", () => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "base\nmine-line" } });
    publish(f, "a.txt", "base\nmine-line", "base");
    // 当前内容在发布后被对方覆盖成 base（我的行丢失）
    f.replaceFileText("a.txt", "base");
    f.replaceFileText.mockClear();
    f.clash.healSimultaneousPublish("a.txt", "their-sha");
    expect(f.emit).toHaveBeenCalledWith("overwritten", { path: "project/a.txt", theirs: "their-sha" });
    expect(f.replaceFileText).toHaveBeenCalledWith("a.txt", "base\nmine-line");
    expect(f.flags.get("a.txt")).toMatchObject({ why: "overwritten" });
  });

  it("mine policy never flags a non-token overwrite", () => {
    const f = fixture({ clashPolicy: "mine", files: { "a.txt": "base" } });
    publish(f, "a.txt", "base\nmine-line", "base");
    f.clash.healSimultaneousPublish("a.txt", "their-sha");
    expect(f.emit).not.toHaveBeenCalled();
    expect(f.flags.size).toBe(0);
  });
});

describe("file clash: user choice", () => {
  const flagged = (options: Options = {}) => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "mine" }, liveShas: { "a.txt": "live-sha" }, ...options });
    f.clash.flagClashingFile("a.txt", "edit", "sha-2");
    f.emit.mockClear();
    f.queue.withdraw.mockClear();
    return f;
  };

  it("ignores a choice for a path that is not flagged", () => {
    const f = fixture({ clashPolicy: "ask", files: { "a.txt": "mine" } });
    f.clash.resolveFlagged("a.txt", "mine");
    expect(f.emit).not.toHaveBeenCalled();
    expect(f.markDirty).not.toHaveBeenCalled();
  });

  it("theirs: drops my text, prunes undo, and takes the remote file", () => {
    const f = flagged();
    f.clash.resolveFlagged("a.txt", "theirs");
    expect(f.emit).toHaveBeenCalledWith("flag-resolved", { path: "project/a.txt", choice: "theirs" });
    expect(f.flags.has("a.txt")).toBe(false);
    expect(f.pruneUndoPaths).toHaveBeenCalledWith(new Set(["a.txt"]), expect.any(String));
    expect(f.takeRemoteFile).toHaveBeenCalledWith("a.txt");
    expect(f.markDirty).not.toHaveBeenCalled();
  });

  it("mine: releases the hold and republishes on top of the live version", () => {
    const f = flagged();
    f.held.add("project/a.txt");
    f.clash.resolveFlagged("a.txt", "mine");
    expect(f.held.has("project/a.txt")).toBe(false);
    expect(f.flags.has("a.txt")).toBe(false);
    expect(f.retokenUndo).toHaveBeenCalledWith("a.txt");
    expect(f.markDirty).toHaveBeenCalledWith("project/a.txt", expect.any(Function), "live-sha");
    expect(f.flushNow).toHaveBeenCalledOnce();
  });

  it("copy: keeps mine under a free name and gives the original name theirs", () => {
    const f = flagged();
    f.clash.resolveFlagged("a.txt", "copy");
    const copyCall = f.replaceFileText.mock.calls.find(([path]) => path !== "a.txt");
    expect(copyCall?.[1]).toBe("mine");
    expect(f.emit).toHaveBeenCalledWith("flag-resolved", expect.objectContaining({ choice: "copy", copy: `project/${copyCall?.[0]}` }));
    expect(f.flags.has("a.txt")).toBe(false);
    expect(f.takeRemoteFile).toHaveBeenCalledWith("a.txt");
    expect(f.flushNow).toHaveBeenCalledOnce();
  });
});
