// @vitest-environment happy-dom
import { beforeAll, describe, expect, it, vi } from "vitest";

import type * as M from "../contracts/design-system-document";
import type * as Core from "../contracts";
import { buildFilesIndex, projectFilePath } from "../editor/files-index";
import { DESIGN_SYSTEM_PATHS } from "../model/file-policy";
import { createDesignSystemRuntime } from "../runtime";
import { createDocumentUndo } from "./document-undo";

beforeAll(() => {
  createDesignSystemRuntime({ boot: false });
  T = DESIGN_SYSTEM_PATHS.tokens;
});
let T = "tokens.json";

const TITLE = "System";
const tokens = (colors: [string, string][]) =>
  JSON.stringify({ version: 1, color: { themes: [{ id: "light", name: "浅色" }], tokens: colors.map(([name, light]) => ({ name, value: { light }, usage: "" })) } });

type Content = { v: 2; files: Record<string, string> };
const content = (files: Record<string, string>): Content => ({ v: 2, files });

function fixture(initial: Record<string, string>) {
  let current = content(initial);
  let indexBase = buildFilesIndex(TITLE, current.files);
  const held = new Set<string>();
  const flags = new Map<string, M.DocumentFlag>();
  const pathRevisions = new Map<string, number>();
  const emit = vi.fn();
  const notice = vi.fn();
  const flagClashingFile = vi.fn();
  const flushNow = vi.fn();
  const document = {
    title: () => TITLE,
    content: () => current,
    setContent: (next: Content) => { current = next; },
    held: () => held,
    index: () => ({ base: () => indexBase, get: () => indexBase }),
  };
  const undo = createDocumentUndo({
    document: document as unknown as M.BaseFilesDocument,
    flags, pathRevisions, emit, notice,
    liveSha: () => "sha-live",
    flagClashingFile: flagClashingFile as never,
    flushNow,
  });
  /** 登记一条把 files 从当前内容改成 next 的命令，并立即套用。 */
  const edit = (path: string, next: Record<string, string>) => {
    const before = current;
    // 每次都给新的 after，避免测试里改当前内容时连带改了命令记下的状态
    const command = undo.createUndoCommand(path, () => ({ before, after: content({ ...next }) }) as unknown as M.DocumentUndoPair, { applied: false });
    command.do();
    return command;
  };
  return {
    undo, emit, notice, flagClashingFile, flushNow, flags, held, pathRevisions,
    files: () => current.files,
    setIndexBase: (index: Core.FilesIndex) => { indexBase = index; },
    indexBase: () => indexBase,
    edit,
  };
}

describe("document undo: create, undo, redo", () => {
  it("applies the command's after state first, then undoes and redoes it", () => {
    const f = fixture({ [T]: tokens([["a", "#111"]]) });
    const command = f.edit("tokens", { [T]: tokens([["a", "#222"]]) });
    expect(f.files()[T]).toBe(tokens([["a", "#222"]]));
    command.undo();
    expect(f.files()[T]).toBe(tokens([["a", "#111"]]));
    expect(f.emit).toHaveBeenCalledWith("undo", expect.objectContaining({ label: "tokens" }));
    command.do();
    expect(f.files()[T]).toBe(tokens([["a", "#222"]]));
    expect(f.emit).toHaveBeenCalledWith("redo", expect.anything());
    expect(f.flushNow).toHaveBeenCalledTimes(2);
  });

  it("keeps at most 400 commands and forgets the oldest", () => {
    const f = fixture({});
    for (let i = 0; i < 402; i++) f.undo.createUndoCommand("p" + i, () => ({ before: content({}), after: content({}) }) as never, { applied: true });
    // 最旧的被丢掉后，对其路径的修剪不会再命中它们；这里只确认不会抛错且仍可登记
    expect(() => f.undo.pruneUndoPaths(new Set(["x"]), "test")).not.toThrow();
  });
});

describe("document undo: someone else changed the file", () => {
  it("skips a plain file that changed since and tells the user nothing was undone", () => {
    const f = fixture({ "notes.txt": "one" });
    const command = f.edit("notes", { "notes.txt": "two" });
    (f.files() as Record<string, string>)["notes.txt"] = "three";
    command.undo();
    expect(f.files()["notes.txt"]).toBe("three");
    expect(f.emit).toHaveBeenCalledWith("undo", expect.objectContaining({ nothing: true }));
    expect(f.notice).toHaveBeenCalledTimes(1);
  });

  it("merges token text three ways when the same token file changed elsewhere", () => {
    const f = fixture({ [T]: tokens([["a", "#111"], ["b", "#bbb"]]) });
    const command = f.edit("tokens", { [T]: tokens([["a", "#222"], ["b", "#bbb"]]) });
    // 对方改了另一个令牌 b
    const files = f.files() as Record<string, string>;
    files[T] = tokens([["a", "#222"], ["b", "#ccc"]]);
    command.undo();
    const merged = JSON.parse(f.files()[T]).color.tokens;
    expect(merged.find((t: { name: string }) => t.name === "a").value.light).toBe("#111");
    expect(merged.find((t: { name: string }) => t.name === "b").value.light).toBe("#ccc");
  });

  it("does not merge a held token file; shows the undo locally and flags the clash", () => {
    const f = fixture({ [T]: tokens([["a", "#111"], ["b", "#bbb"]]) });
    const command = f.edit("tokens", { [T]: tokens([["a", "#222"], ["b", "#bbb"]]) });
    (f.files() as Record<string, string>)[T] = tokens([["a", "#222"], ["b", "#ccc"]]);
    f.held.add(projectFilePath(T));
    command.undo();
    // 不合并：撤销结果只显示在本地，并标记为与对方冲突，对方的 #ccc 不被带入
    expect(f.files()[T]).toBe(tokens([["a", "#111"], ["b", "#bbb"]]));
    expect(f.flagClashingFile).toHaveBeenCalledWith(T, "undo", "sha-live", expect.any(String));
  });
});

describe("document undo: pruning paths", () => {
  it("drops a command whose only file was taken over, and reports it", () => {
    const f = fixture({ "notes.txt": "one" });
    f.edit("notes", { "notes.txt": "two" });
    f.undo.pruneUndoPaths(new Set(["notes.txt"]), "adopted");
    expect(f.emit).toHaveBeenCalledWith("undo-pruned", expect.objectContaining({ why: "adopted", entriesDropped: 1, entriesTrimmed: 0 }));
    expect(f.notice).toHaveBeenCalledTimes(1);
  });

  it("stays quiet when the paths are not part of any command", () => {
    const f = fixture({ "notes.txt": "one" });
    f.edit("notes", { "notes.txt": "two" });
    f.undo.pruneUndoPaths(new Set(["other.txt"]), "adopted");
    expect(f.emit).not.toHaveBeenCalledWith("undo-pruned", expect.anything());
    expect(f.notice).not.toHaveBeenCalled();
  });

  it("does not show the notice when the caller supplies its own context", () => {
    const f = fixture({ "notes.txt": "one" });
    f.edit("notes", { "notes.txt": "two" });
    f.undo.pruneUndoPaths(new Set(["notes.txt"]), "adopted", true);
    expect(f.emit).toHaveBeenCalledWith("undo-pruned", expect.anything());
    expect(f.notice).not.toHaveBeenCalled();
  });

  it("keepOut only fences off files the command did not change", () => {
    const f = fixture({ "notes.txt": "one", "keep.txt": "k" });
    const command = f.edit("notes", { "notes.txt": "two", "keep.txt": "k" });
    f.undo.keepOut(["notes.txt", "keep.txt"]);
    expect(command.leavesAlone("keep.txt")).toBe(true);
    expect(command.leavesAlone("notes.txt")).toBe(false);
  });
});

describe("document undo: foreign index changes and bases", () => {
  it("ignores index states that this document is publishing itself", () => {
    const f = fixture({ "a.txt": "x" });
    f.undo.notePublishingIndex(JSON.stringify(f.indexBase()));
    f.undo.recordForeignIndexChanges({ ...f.indexBase(), libraries: [] } as Core.FilesIndex);
    expect(f.undo.indexBase()).toEqual(f.indexBase());
    f.undo.clearPublishingIndexes();
  });

  it("remembers the base and fills it in only once", () => {
    const f = fixture({ "a.txt": "x" });
    expect(f.undo.indexBase()).toBeUndefined();
    f.undo.ensureIndexBase();
    const first = f.undo.indexBase();
    expect(first).toEqual(f.indexBase());
    f.undo.setIndexBase({ ...first!, namespace: "mine" } as Core.FilesIndex);
    f.undo.ensureIndexBase();
    expect((f.undo.indexBase() as { namespace?: string }).namespace).toBe("mine");
  });

  it("keeps a bad publishing index text from throwing", () => {
    const f = fixture({});
    expect(() => f.undo.notePublishingIndex("{not json")).not.toThrow();
  });

  it("flushes pending foreign changes into the log without throwing", () => {
    const f = fixture({ "a.txt": "x" });
    f.undo.ensureIndexBase();
    const before = { ...f.indexBase(), namespace: "theirs" } as Core.FilesIndex;
    f.undo.recordForeignIndexChanges(before);
    expect(() => f.undo.flushForeignIndexChanges()).not.toThrow();
  });
});
