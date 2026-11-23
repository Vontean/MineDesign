import { describe, expect, it, vi } from "vitest";

vi.mock("../editor/files-index", () => ({
  projectFilePath: (path: string) => `project/${path}`,
  relativeProjectFilePath: (path: string) => path.replace(/^project\//, ""),
  projectFilesForSave: (files: Record<string, string>) =>
    new Map(Object.entries(files).map(([path, text]) => [`project/${path}`, text])),
}));
vi.mock("../editor/index-file-store", () => ({ mergeValuesEqual: (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b) }));
vi.mock("../model/file-policy", () => ({ isTextFilePath: (path: string) => path.endsWith(".txt"), isHeldFilePointer: () => false }));
vi.mock("./carry", () => ({ HOT_CARRY_MAX_INLINE_CHARS: 8, snapshotDesignSystemView: () => ({ v: 1 }) }));
vi.mock("./index-conflicts", () => ({ HOT_CARRY_PROTOCOL_FIELD: "books", indexWithoutTitleAndDocs: (index: unknown) => index }));
vi.mock("./token-merge", () => ({ isTokenFilePath: () => false }));

import { snapshotHotCarry } from "./hot-carry-snapshot";

function fixture(text: string, saved: string) {
  const handoff = vi.fn();
  const stash = vi.fn();
  const context = {
    document: {
      loadState: () => "live", readOnly: () => false,
      content: () => ({ files: { "note.txt": text } }),
      index: () => ({ base: () => ({}), get: () => ({}) }),
      queue: () => ({ state: () => ({}), conflicted: () => new Set(), unsendable: () => new Set(), stashHandedOff: handoff }),
    },
    documentOptions: {}, flags: new Map(), flaggedPaths: new Set(),
    readTexts: new Map([["project/note.txt", saved]]), readShas: new Map([["project/note.txt", "sha"]]),
    preReadBases: new Map(), materializedFingerprints: new Map(),
    textIsLocallyHeld: () => false, textFingerprint: (value: string) => value,
    stashOversizedCarry: stash,
  } as unknown as Parameters<typeof snapshotHotCarry>[0];
  return { context, handoff, stash };
}

describe("hot carry snapshot", () => {
  it("leaves a clean document without a save handoff", () => {
    const { context, handoff, stash } = fixture("same", "same");
    expect(snapshotHotCarry(context)).toEqual({ v: 1 });
    expect(handoff).not.toHaveBeenCalled();
    expect(stash).not.toHaveBeenCalled();
  });
  it("carries a pending edit inline and hands off its queue", () => {
    const { context, handoff } = fixture("edit", "old");
    expect(snapshotHotCarry(context)).toMatchObject({ books: 1, unsavedNames: ["note.txt"], unsaved: { "note.txt": { text: "edit", base: "sha" } } });
    expect(handoff).toHaveBeenCalledOnce();
  });
  it("stashes oversized edits without handing off the queue", () => {
    const { context, handoff, stash } = fixture("long edit", "old");
    expect(snapshotHotCarry(context)).toMatchObject({ unsavedNames: ["note.txt"], unsaved: {} });
    expect(stash).toHaveBeenCalledWith({ "note.txt": { text: "long edit", base: "sha" } }, undefined);
    expect(handoff).not.toHaveBeenCalled();
  });
});
