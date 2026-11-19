import type * as React from "react";
import type * as Editor from "../contracts/editor-runtime";
import type * as Model from "../contracts";
import type * as Application from "../contracts/application";
/** Restored application module; prepare first, initialize in original order. */

var PREVIEW_POOL_IDLE_TTL_MS: number;
var PreviewFramePool: new (
  maxLive?: number,
  now?: () => number,
) => Editor.PreviewFramePool;
var sharedPreviewFramePool: Editor.PreviewFramePool | null;
function getPreviewFramePool(): Editor.PreviewFramePool {
  if (sharedPreviewFramePool === null) {
    sharedPreviewFramePool = new PreviewFramePool();
  }
  return sharedPreviewFramePool;
}
export {
  getPreviewFramePool,
  PREVIEW_POOL_IDLE_TTL_MS,
  PreviewFramePool,
  sharedPreviewFramePool,
};
export function installEditorPreviewPool(): () => void {
  return () => {
    PREVIEW_POOL_IDLE_TTL_MS = 6000;
    PreviewFramePool = class PreviewFramePool {
      maxLive: number;
      now: () => number;
      entries = new Map<string, Editor.PreviewPoolEntry>();
      queue: string[] = [];
      listeners = new Set<() => void>();
      clock = 0;
      constructor(
        maxLive: number = 8,
        now: () => number = (): number => Date.now(),
      ) {
        this.maxLive = maxLive;
        this.now = now;
      }
      phase(ownerId: string): Editor.PreviewPoolPhase {
        return this.entries.get(ownerId)?.phase ?? "idle";
      }
      subscribe(listener: () => void) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
      }
      snapshot(): Editor.PreviewPoolSnapshot {
        let items: string[] = [],
          value: string | null = null;
        for (let [ownerId, entry] of this.entries) {
          if (entry.phase === "live") {
            items.push(ownerId);
          }
          if (entry.booting) {
            value = ownerId;
          }
        }
        return {
          live: items,
          queued: [...this.queue],
          booting: value,
        };
      }
      visible(ownerId: string, isVisible: boolean): void {
        let value = this.entry(ownerId);
        if (
          value.visible === isVisible &&
          (isVisible ? value.phase !== "idle" : true)
        ) {
          if (isVisible) {
            value.lastVisible = ++this.clock;
          }
          return;
        }
        value.visible = isVisible;
        if (isVisible) {
          value.lastVisible = ++this.clock;
          if (value.phase === "idle") {
            value.phase = "queued";
            this.queue.push(ownerId);
          }
        } else if (value.phase === "queued") {
          value.phase = "idle";
          let queueIndex = this.queue.indexOf(ownerId);
          if (queueIndex >= 0) {
            this.queue.splice(queueIndex, 1);
          }
        }
        this.pump();
      }
      booted(ownerId: string): void {
        let entry = this.entries.get(ownerId);
        if (entry === undefined || !entry.booting) {
          return;
        }
        entry.booting = false;
        this.pump();
      }
      remove(ownerId: string): void {
        if (this.entries.get(ownerId) === undefined) {
          return;
        }
        this.entries.delete(ownerId);
        let value = this.queue.indexOf(ownerId);
        if (value >= 0) {
          this.queue.splice(value, 1);
        }
        this.pump();
      }
      tick(): void {
        let value = this.now(),
          flag: boolean = false;
        for (let entry of this.entries.values()) {
          if (entry.booting && value - entry.bootStartedAt >= 6000) {
            entry.booting = false;
            flag = true;
          }
        }
        if (flag) {
          this.pump();
        }
      }
      entry(ownerId: string): Editor.PreviewPoolEntry {
        let entry = this.entries.get(ownerId);
        if (entry === undefined) {
          entry = {
            phase: "idle",
            visible: false,
            lastVisible: 0,
            booting: false,
            bootStartedAt: 0,
          };
          this.entries.set(ownerId, entry);
        }
        return entry;
      }
      liveCount(): number {
        let index: number = 0;
        for (let value of this.entries.values()) {
          if (value.phase === "live") {
            index++;
          }
        }
        return index;
      }
      anyBooting(): boolean {
        for (let value of this.entries.values()) {
          if (value.booting) {
            return true;
          }
        }
        return false;
      }
      pump(): void {
        for (;;) {
          while (
            this.queue.length > 0 &&
            this.entries.get(this.queue[0])?.phase !== "queued"
          ) {
            this.queue.shift();
          }
          if (this.queue.length === 0 || this.anyBooting()) {
            break;
          }
          if (this.liveCount() >= this.maxLive && !this.evictOne()) {
            break;
          }
          let value = this.queue.shift()!,
            entry = this.entries.get(value)!;
          entry.phase = "live";
          entry.booting = true;
          entry.bootStartedAt = this.now();
        }
        for (let value of this.listeners) {
          value();
        }
      }
      evictOne(): boolean {
        let value: string | null = null,
          oldestTimestamp = 1 / 0;
        for (let [ownerId, poolEntry] of this.entries) {
          if (
            poolEntry.phase === "live" &&
            !poolEntry.visible &&
            !poolEntry.booting &&
            poolEntry.lastVisible < oldestTimestamp
          ) {
            oldestTimestamp = poolEntry.lastVisible;
            value = ownerId;
          }
        }
        if (value === null) {
          return false;
        }
        let entry = this.entries.get(value)!;
        entry.phase = "idle";
        entry.booting = false;
        return true;
      }
    };
    sharedPreviewFramePool = null;
  };
}
