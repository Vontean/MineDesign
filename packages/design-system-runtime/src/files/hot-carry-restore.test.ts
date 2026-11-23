import { describe, expect, it, vi } from "vitest";

vi.mock("../editor/files-index", () => ({
  projectFilePath: (path: string) => `project/${path}`,
  relativeProjectFilePath: (path: string) => path.replace(/^project\//, ""),
  projectFilesForSave: (files: Record<string, string>) => new Map(Object.entries(files)),
  encodeFileIndexKey: (path: string) => path,
  restoreFilesFromIndex: () => ({ content: { files: {} } }),
}));
vi.mock("../editor/files-merge", () => ({ mergeFilesIndex: () => ({ index: {}, kept: [] }) }));
vi.mock("../editor/index-file-store", () => ({ mergeValuesEqual: () => true }));
vi.mock("./carry", () => ({
  FILE_CONFLICT_CHOICE_SUFFIX: "",
  fileBaseName: (path: string) => path.split("/").pop(),
  summarizeFileNames: (paths: string[]) => paths.join(", "),
  restoreDesignSystemView: () => [],
  readCarriedIndexEdit: () => undefined,
  readCarriedFileEdits: (carry: Record<string, unknown>, field = "mine") =>
    new Map(Object.entries((carry[field] as Record<string, { text: string }> | undefined) ?? {})),
}));
vi.mock("./index-conflicts", () => ({
  HOT_CARRY_PROTOCOL_FIELD: "books",
  describeIndexConflicts: () => [],
  indexAuthoredFieldsEqual: () => true,
  isGeneratedIndexField: () => false,
}));
vi.mock("./token-merge", () => ({ fileContentsSemanticallyEqual: (_p: string, a: string, b: string) => a === b, mergeSupportedFileThreeWays: () => null }));
vi.mock("../model/file-policy", () => ({ isTextFilePath: (path: string) => path.endsWith(".txt") }));
vi.mock("../model/asset-commands", () => ({ refreshManifest: (content: unknown) => content }));

import type * as M from "../contracts/design-system-document";
import { createHotCarryRestorer } from "./hot-carry-restore";

type Files = Record<string, string>;

function fixture(files: Files, restoreView: (carry: unknown) => string[] = () => []) {
  let content = { v: 2, files: Object.freeze({ ...files }) };
  const document = {
    loadState: () => "live",
    readOnly: () => false,
    bootFailure: () => undefined,
    subscribeLoad: () => () => undefined,
    title: () => "Test",
    content: () => content,
    index: () => ({ get: () => ({}) }),
    updateContent: vi.fn((update: (current: typeof content) => typeof content) => { content = update(content); }),
  };
  const withdraw = vi.fn();
  const emit = vi.fn();
  const notice = vi.fn();
  const consumeCarryStorage = vi.fn(() => ({ files: new Map() }));
  const flags = new Map<string, M.DocumentFlag>();
  const flaggedPaths = new Set<string>();
  const flushNow = vi.fn();
  const notifyFlags = vi.fn();
  const view = vi.fn(restoreView);
  const restorer = createHotCarryRestorer({
    document: document as unknown as M.BaseFilesDocument,
    queue: { withdraw },
    documentOptions: { restoreView: view, port: {} } as never,
    indexPath: "project/files.json",
    flags, flaggedPaths, noticedClashShas: new Map(), timers: { now: () => 100 },
    emit, notice, consumeCarryStorage,
    currentFileText: (path) => (typeof content.files[path] === "string" ? content.files[path] : null),
    liveSha: () => "live-sha",
    replaceFileText: (path, text) => { content = { ...content, files: Object.freeze({ ...content.files, [path]: text }) }; },
    flagClashingFile: vi.fn(), notifyFlags, flushNow,
  });
  const text = (path: string) => content.files[path];
  const settle = async () => { await Promise.resolve(); await Promise.resolve(); };
  return { restorer, flushNow, emit, notice, flags, flaggedPaths, withdraw, notifyFlags, document, view, text, settle, consumeCarryStorage };
}

describe("hot carry restore", () => {
  it("consumes the carry only once", async () => {
    const { restorer, view, settle } = fixture({ "a.txt": "saved" }, () => ["a.txt"]);
    const carry = { mine: { "a.txt": { text: "edit" } } };
    restorer.restore(carry);
    restorer.restore(carry);
    await settle();
    expect(view).toHaveBeenCalledTimes(1);
  });

  it("flags a pending edit as restored and keeps it out of the save queue", async () => {
    const { restorer, flags, flaggedPaths, withdraw, emit, text, notifyFlags, settle } = fixture({ "a.txt": "theirs" }, () => ["a.txt"]);
    restorer.restore({ mine: { "a.txt": { text: "mine" } } });
    await settle();
    expect(text("a.txt")).toBe("mine");
    expect(flags.get("a.txt")).toMatchObject({ why: "restored", theirsSha: "live-sha" });
    expect(flaggedPaths.has("a.txt")).toBe(true);
    expect(withdraw).toHaveBeenCalledWith("project/a.txt");
    expect(emit).toHaveBeenCalledWith("restored", { paths: ["project/a.txt"] });
    expect(notifyFlags).toHaveBeenCalledOnce();
  });

  it("announces a removal that was already saved when the remote update lands", async () => {
    const { restorer, emit, notice, settle } = fixture({ "gone.txt": "still here" });
    restorer.restore({ books: 1, unsavedNames: ["lost.txt"], removed: { "gone.txt": null } } as M.RawHotCarry);
    await settle();
    expect(emit).toHaveBeenCalledWith("restore-unremoved", { paths: ["project/gone.txt"] });
    const before = notice.mock.calls.length;
    restorer.announceLateRemovals([{ decision: "removed", path: "project/gone.txt" } as never]);
    expect(emit).toHaveBeenCalledWith("restore-landed-late", { paths: ["project/gone.txt"] });
    expect(notice.mock.calls.length).toBe(before + 1);
    // 提示只发一次
    restorer.announceLateRemovals([{ decision: "removed", path: "project/gone.txt" } as never]);
    expect(notice.mock.calls.length).toBe(before + 1);
  });

  it("stays silent when announcing without any restored removal", () => {
    const { restorer, emit, notice } = fixture({});
    restorer.announceLateRemovals([{ decision: "removed", path: "project/x.txt" } as never]);
    expect(emit).not.toHaveBeenCalled();
    expect(notice).not.toHaveBeenCalled();
  });

  it("has no side effects when nothing can be restored", async () => {
    const { restorer, emit, notice, flags, document, flushNow, settle } = fixture({ "a.txt": "saved" });
    restorer.restore(null);
    restorer.restore(undefined);
    restorer.restore({});
    await settle();
    expect(emit).not.toHaveBeenCalled();
    expect(notice).not.toHaveBeenCalled();
    expect(flags.size).toBe(0);
    expect(document.updateContent).not.toHaveBeenCalled();
    expect(flushNow).not.toHaveBeenCalled();
  });

  it("an empty call does not use up the one-time restore", async () => {
    const { restorer, flags, settle } = fixture({ "a.txt": "theirs" }, () => ["a.txt"]);
    restorer.restore(null);
    restorer.restore({ mine: { "a.txt": { text: "mine" } } });
    await settle();
    expect(flags.has("a.txt")).toBe(true);
  });
});
