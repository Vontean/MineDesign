import { uiMessage } from '@minedesign/contracts/ui-messages';
import type { Dynamic } from '../runtime-types';

const canvasTargetKey = "<canvas>";
const readPointerModifiers = (event: Dynamic) => ({ alt: false, ctrl: event.ctrlKey, meta: event.metaKey, shift: event.shiftKey });
const isPointerAltPressed = (event: Dynamic) => event.altKey;
const placementModeForModifiers = (mods: Dynamic) => mods.ctrl ? "keep" : "flow";
const isPrimaryModifierPressed = (event: Dynamic) => event.metaKey || event.ctrlKey;
export const releaseGuardMs = 5e3;
export const travelCommitTimeoutMs = 3e4;

function randomSessionToken(): Dynamic {
  return Array.from(
    crypto.getRandomValues(new Uint8Array(8)),
    (byte?: Dynamic): Dynamic => byte.toString(16).padStart(2, "0"),
  ).join("");
}
function pointerDelta(point?: Dynamic, origin?: Dynamic): Dynamic {
  return {
    x: point.x - origin.x,
    y: point.y - origin.y,
  };
}
function createElementMoveSessions(host?: Dynamic): Dynamic {
  let activeMove: Dynamic = null,
    closeTarget: Dynamic = (move?: Dynamic, target?: Dynamic): Dynamic => {
      if (!target.pure || target.canvas) return;
      let closePromise: Dynamic = (target.opened ?? Promise.resolve(true))
        .then(
          (): Dynamic =>
            host.handle(target.file)?.moveHost(move.key, "close"),
        )
        .catch((): Dynamic => false);
      move.closing.set(target.file, closePromise);
    },
    cancelMove: Dynamic = (event?: Dynamic): Dynamic => {
      let target: Dynamic = event.target;
      target &&
        (host.handle(target.file)?.dropPlanClear(event.key),
        closeTarget(event, target),
        (event.target = null));
      for (let [file, fileState] of event.files as Dynamic)
        fileState.started && host.handle(file)?.moveCancel(event.key);
      event.live &&
        !event.canvasCommitted &&
        (event.canvas.files.size > 0 || event.canvas.notes.size > 0) &&
        host.canvas.cancel(event.key, event.pointerId);
      event.committed = true;
      releasedMove === event && (releasedMove = null);
      finishMove(event);
    },
    finishMove: Dynamic = (explicitMove?: Dynamic): Dynamic => {
      let move: Dynamic = explicitMove ?? activeMove;
      if (!move) return;
      let isActive: Dynamic = activeMove === move;
      isActive && (activeMove = null);
      move.done = true;
      move.off();
      clearInterval(move.keepalive);
      for (let fileState of move.files.values() as Dynamic)
        fileState.raf && cancelAnimationFrame(fileState.raf);
      host.showGhost(null);
      if (!!isActive) {
        host.setGestureSource("set-move", false);
        host.setHeldCover(null);
        try {
          move.captureEl?.releasePointerCapture(move.pointerId);
        } catch {}
      }
    },
    cancelActive: Dynamic = (): Dynamic => {
      !activeMove || activeMove.releasing || cancelMove(activeMove);
    },
    startFileMoves: Dynamic = async (move?: Dynamic): Promise<Dynamic> => {
      let pressPoint: Dynamic = host.canvasPoint(
        move.press.clientX,
        move.press.clientY,
      );
      await Promise.all(
        [...move.files].map(
          async ([file, fileState]: Dynamic): Promise<Dynamic> => {
            let fileHandle: Dynamic = host.handle(file),
              origin: Dynamic = host.origin(file),
              isLeader: Dynamic =
                "file" in move.leader && move.leader.file === file,
              leaderTid: Dynamic =
                isLeader && "tid" in move.leader
                  ? move.leader.tid
                  : fileState.tids[0];
            if (
              !fileHandle ||
              !origin ||
              !fileHandle.isReady() ||
              leaderTid === undefined
            ) {
              move.dropped.push(file);
              return;
            }
            let grabOffset: Dynamic = isLeader
                ? pointerDelta(pressPoint, origin)
                : null,
              startResult: Dynamic = await fileHandle
                .moveStart(
                  move.key,
                  leaderTid,
                  grabOffset,
                  move.last.mods,
                  fileState.tids,
                )
                .catch((): Dynamic => null);
            if (!startResult) {
              move.dropped.push(file);
              return;
            }
            if (move.done) {
              fileHandle.moveCancel(move.key);
              return;
            }
            if (!isLeader && startResult.tids.length < fileState.tids.length) {
              fileHandle.moveCancel(move.key);
              move.dropped.push(file);
              return;
            }
            fileState.started = true;
            fileState.tids = startResult.tids;
            fileState.members = startResult.members ?? [];
            fileState.anchor = grabOffset ?? {
              x: startResult.rect.x + startResult.rect.w / 2,
              y: startResult.rect.y + startResult.rect.h / 2,
            };
            updateMove(move);
          },
        ),
      );
    },
    updateTarget: Dynamic = (event?: Dynamic): Dynamic => {
      let hit: Dynamic = host.targetAt(
        event.last.clientX,
        event.last.clientY,
      );
      event.blockedTarget = hit?.blocked ? hit.file : null;
      let allowedHit: Dynamic = hit?.blocked ? null : hit,
        nextTarget: Dynamic = allowedHit
          ? event.files.get(allowedHit.file)?.started
            ? {
                file: allowedHit.file,
                pure: false,
              }
            : {
                file: allowedHit.file,
                pure: true,
              }
          : !hit && event.files.size > 0 && host.piecesAllowed()
            ? {
                file: canvasTargetKey,
                pure: true,
                canvas: true,
              }
            : null,
        target: Dynamic = event.target;
      target &&
        (!nextTarget || nextTarget.file !== target.file) &&
        (target.canvas || host.handle(target.file)?.dropPlanClear(event.key),
        closeTarget(event, target),
        (event.dropPlan = null));
      if (nextTarget && (!target || target.file !== nextTarget.file)) {
        let openPromise: Dynamic =
          nextTarget.pure && !nextTarget.canvas
            ? (event.closing.get(nextTarget.file) ?? Promise.resolve()).then(
                (): Dynamic =>
                  host.handle(nextTarget.file)?.moveHost(event.key, "open") ??
                  false,
              )
            : null;
        event.target = {
          ...nextTarget,
          opened: openPromise,
        };
      } else nextTarget || (event.target = null);
      let pointerPoint: Dynamic = host.canvasPoint(
          event.last.clientX,
          event.last.clientY,
        ),
        pressPoint: Dynamic = host.canvasPoint(
          event.press.clientX,
          event.press.clientY,
        );
      for (let [file, fileState] of event.files as Dynamic) {
        if (!fileState.started) continue;
        let isOutsideSource: Dynamic = (): Dynamic => {
            let origin: Dynamic = host.origin(file),
              bounds: Dynamic = host.bounds(file);
            if (!origin || !bounds) return true;
            let isInBounds: Dynamic = (
              x?: Dynamic,
              y?: Dynamic,
            ): Dynamic =>
              x >= bounds.x &&
              y >= bounds.y &&
              x <= bounds.x + bounds.w &&
              y <= bounds.y + bounds.h;
            return fileState.members.some((member?: Dynamic): Dynamic => {
              let centerX: Dynamic =
                  origin.x + member.rect.x + member.rect.w / 2,
                centerY: Dynamic =
                  origin.y + member.rect.y + member.rect.h / 2;
              return (
                isInBounds(centerX, centerY) &&
                !isInBounds(
                  centerX + (pointerPoint.x - pressPoint.x),
                  centerY + (pointerPoint.y - pressPoint.y),
                )
              );
            });
          },
          shouldTravel: Dynamic =
            nextTarget != null &&
            (nextTarget.canvas
              ? event.last.alt || isOutsideSource()
              : nextTarget.file !== file || event.last.alt);
        shouldTravel && !fileState.travelling
          ? ((fileState.travelling = true),
            host.handle(file)?.moveExit(event.key))
          : !shouldTravel &&
            fileState.travelling &&
            ((fileState.travelling = false),
            host.handle(file)?.moveReturn(event.key));
      }
    },
    collectTravellers: Dynamic = (move?: Dynamic): Dynamic => {
      let pressPoint: Dynamic = host.canvasPoint(
          move.press.clientX,
          move.press.clientY,
        ),
        items: Dynamic = [],
        memberMap: Dynamic = [];
      for (let [file, fileState] of move.files as Dynamic) {
        if (!fileState.travelling) continue;
        let origin: Dynamic = host.origin(file);
        if (origin)
          for (let member of fileState.members as Dynamic) {
            let length: Dynamic = items.length;
            items.push({
              tid: length,
              tag: member.tag,
              w: member.rect.w,
              h: member.rect.h,
              dx: origin.x + member.rect.x - pressPoint.x,
              dy: origin.y + member.rect.y - pressPoint.y,
            });
            memberMap.push({
              file: file,
              tid: member.tid,
              index: length,
            });
          }
      }
      return {
        members: items,
        map: memberMap,
      };
    },
    planDrop: Dynamic = (
      event?: Dynamic,
      isForced: Dynamic = false,
    ): Dynamic => {
      let target: Dynamic = event.target;
      if (!target || target.canvas) return null;
      if (event.planInFlight) {
        event.planPending = true;
        return event.planInFlight;
      }
      let { members: members, map: memberMap }: Dynamic = collectTravellers(event);
      if (members.length === 0) return null;
      let origin: Dynamic = host.origin(target.file),
        targetHandle: Dynamic = host.handle(target.file);
      if (!origin || !targetHandle) return null;
      let state: Dynamic = {
          clientX: event.last.clientX,
          clientY: event.last.clientY,
        },
        mode: Dynamic = placementModeForModifiers(event.last.mods),
        isAlt: Dynamic = event.last.alt,
        grabOffset: Dynamic = pointerDelta(
          host.canvasPoint(state.clientX, state.clientY),
          origin,
        );
      event.planInFlight = (target.opened ?? Promise.resolve(true))
        .then(
          (isOpened?: Dynamic): Dynamic =>
            isOpened
              ? targetHandle.dropPlanAt(event.key, grabOffset, members, mode)
              : null,
        )
        .then((plan?: Dynamic): Dynamic => {
          event.target?.file === target.file &&
            (event.dropPlan = plan
              ? {
                  file: target.file,
                  plan: plan,
                  members: memberMap,
                  at: state,
                  mode: mode,
                  alt: isAlt,
                }
              : null);
        })
        .catch((): Dynamic => {
          event.target?.file === target.file && (event.dropPlan = null);
        })
        .finally((): Dynamic => {
          event.planInFlight = null;
          event.planPending &&
            !event.done &&
            !isForced &&
            !event.releasing &&
            ((event.planPending = false), planDrop(event));
        });
      return event.planInFlight;
    },
    updateMove: Dynamic = (event?: Dynamic): Dynamic => {
      if (event.done) return;
      updateTarget(event);
      let pointer: Dynamic = host.canvasPoint(
          event.last.clientX,
          event.last.clientY,
        ),
        press: Dynamic = host.canvasPoint(
          event.press.clientX,
          event.press.clientY,
        );
      for (let [file, fileState] of event.files as Dynamic) {
        if (!fileState.started || !fileState.anchor) continue;
        if (fileState.travelling) {
          host.handle(file)?.moveTouch(event.key);
          continue;
        }
        let state: Dynamic = {
          x: fileState.anchor.x + (pointer.x - press.x),
          y: fileState.anchor.y + (pointer.y - press.y),
        };
        fileState.pending = {
          ...state,
          mods: event.last.mods,
        };
        !fileState.raf &&
          (fileState.raf = requestAnimationFrame((): Dynamic => {
            fileState.raf = 0;
            let pending: Dynamic = fileState.pending;
            fileState.pending = null;
            !(!pending || event.done) &&
              host.handle(file)?.moveMove(
                event.key,
                {
                  x: pending.x,
                  y: pending.y,
                },
                pending.mods,
              );
          }));
      }
      if (event.target) {
        let target: Dynamic = event.target;
        target.pure &&
          (target.opened ?? Promise.resolve(true)).then(
            (isOpened?: Dynamic): Dynamic => {
              isOpened &&
                event.target === target &&
                !event.done &&
                host.handle(target.file)?.moveTouch(event.key);
            },
          );
        planDrop(event);
        let { members: members }: Dynamic = collectTravellers(event);
        if (members.length === 0) host.showGhost(null);
        else if (
          placementModeForModifiers(event.last.mods) === "keep" ||
          event.target?.canvas
        )
          host.showGhost(
            members.map(
              (member?: Dynamic): Dynamic => ({
                x: pointer.x + member.dx,
                y: pointer.y + member.dy,
                w: member.w,
                h: member.h,
              }),
            ),
          );
        else {
          let y: Dynamic = pointer.y;
          host.showGhost(
            members.map((member?: Dynamic): Dynamic => {
              let state: Dynamic = {
                x: pointer.x - member.w / 2,
                y: y,
                w: member.w,
                h: member.h,
              };
              y += member.h + 8;
              return state;
            }),
          );
        }
      } else host.showGhost(null);
    },
    startMove: Dynamic = (move?: Dynamic): Dynamic => {
      if (!(move.live || move.done)) {
        move.live = true;
        if (move.canvas.files.size > 0 || move.canvas.notes.size > 0) {
          let firstCanvasItem: Dynamic = (): Dynamic => {
              let [files]: Dynamic = move.canvas.files,
                [notes]: Dynamic = move.canvas.notes;
              return files !== undefined
                ? {
                    file: files,
                  }
                : {
                    note: notes,
                  };
            },
            leader: Dynamic =
              "canvas" in move.leader
                ? move.leader.canvas
                : "file" in move.leader
                  ? {
                      file: move.leader.file,
                    }
                  : firstCanvasItem();
          host.canvas.start(
            move.key,
            move.pointerId,
            leader,
            move.canvas,
            move.press.clientX,
            move.press.clientY,
          );
        }
        move.starting = (move.armWait ?? Promise.resolve(true)).then(
          async (isArmed?: Dynamic): Promise<Dynamic> => {
            if (!move.done) {
              if (!isArmed) {
                cancelMove(move);
                return;
              }
              await startFileMoves(move);
            }
          },
        );
        move.keepalive = (window as Dynamic).setInterval((): Dynamic => {
          move.done || updateMove(move);
        }, 2e4);
      }
    },
    commitMove: Dynamic = async (): Promise<Dynamic> => {
      if (!activeMove) return;
      let move: Dynamic = activeMove;
      if (!move.live) {
        let stillAction: Dynamic = move.stillAction;
        finishMove();
        stillAction?.();
        return;
      }
      move.releasing = true;
      releasedMove = move;
      releasedAt = Date.now();
      let releasedStamp: Dynamic = releasedAt;
      move.offPointer();
      host.showGhost(null);
      if (host.readOnly()) {
        cancelMove(move);
        return;
      }
      let hasCanvasItems: Dynamic =
          move.canvas.files.size > 0 || move.canvas.notes.size > 0,
        isCanvasTravel: Dynamic =
          move.target?.canvas === true &&
          [...move.files.values()].some(
            (fileState?: Dynamic): Dynamic =>
              fileState.started && fileState.travelling,
          ),
        updateCanvasDrop: Dynamic = (): Dynamic =>
          hasCanvasItems
            ? host.canvas.update(
                move.key,
                move.pointerId,
                move.last.clientX,
                move.last.clientY,
                move.last.free,
                true,
                move.key,
                move.last.alt,
              )
            : true,
        canvasDropOk: Dynamic = isCanvasTravel || move.last.alt ? true : updateCanvasDrop();
      move.canvasCommitted = true;
      move.blockedTarget &&
        move.files.size > 0 &&
        !move.last.alt &&
        host.say(
          uiMessage("canvas.workingState.thatArtboardIsPlayingStop"),
        );
      await move.starting;
      if (move.done) return;
      let pointer: Dynamic = host.canvasPoint(
          move.last.clientX,
          move.last.clientY,
        ),
        press: Dynamic = host.canvasPoint(
          move.press.clientX,
          move.press.clientY,
        ),
        entries: Dynamic = new Map(),
        items: Dynamic = [],
        target: Dynamic = move.target;
      if (target && !target.canvas) {
        let awaitWithTimeout: Dynamic = (promise?: Dynamic): Dynamic =>
          promise
            ? Promise.race([
                promise,
                new Promise(
                  (resolve?: Dynamic): Dynamic => setTimeout(resolve, 1500),
                ),
              ])
            : Promise.resolve();
        await awaitWithTimeout(move.planInFlight);
        let dropPlan: Dynamic = move.dropPlan;
        (!dropPlan ||
          dropPlan.file !== target.file ||
          dropPlan.at.clientX !== move.last.clientX ||
          dropPlan.at.clientY !== move.last.clientY ||
          dropPlan.mode !== placementModeForModifiers(move.last.mods) ||
          dropPlan.alt !== move.last.alt) &&
          ((move.planPending = false),
          await awaitWithTimeout(planDrop(move, true)));
      }
      let currentPlan: Dynamic =
          target &&
          move.dropPlan &&
          move.dropPlan.file === target.file &&
          move.dropPlan.at.clientX === move.last.clientX &&
          move.dropPlan.at.clientY === move.last.clientY &&
          move.dropPlan.mode === placementModeForModifiers(move.last.mods) &&
          move.dropPlan.alt === move.last.alt
            ? move.dropPlan
            : null,
        travelPlan: Dynamic = null;
      if (target && currentPlan) {
        let travellerMap: Dynamic = new Map();
        for (let member of currentPlan.members as Dynamic) {
          if (!move.files.get(member.file)?.travelling) continue;
          let indices: Dynamic = travellerMap.get(member.file) ?? [];
          indices.push({
            tid: member.tid,
            index: member.index,
          });
          travellerMap.set(member.file, indices);
        }
        travellerMap.size > 0 &&
          (travelPlan = {
            target: target.file,
            pureTarget: target.pure,
            plan: currentPlan.plan,
            travellers: [...travellerMap].map(
              ([file, members]: Dynamic): Dynamic => ({
                file: file,
                members: members,
              }),
            ),
            endHome: (file?: Dynamic): Dynamic =>
              host.handle(file)?.moveCancel(move.key),
            ...(move.last.alt
              ? {
                  copy: true,
                }
              : {}),
          });
      } else if (target?.canvas && isCanvasTravel) {
        let { members: canvasMembers, map: canvasMap }: Dynamic = collectTravellers(move),
          travellerMap: Dynamic = new Map();
        for (let entry of canvasMap as Dynamic) {
          let indices: Dynamic = travellerMap.get(entry.file) ?? [];
          indices.push({
            tid: entry.tid,
            index: entry.index,
          });
          travellerMap.set(entry.file, indices);
        }
        travelPlan = {
          target: canvasTargetKey,
          pureTarget: true,
          plan: {
            container: null,
            landing: [],
            refused: [],
          },
          travellers: [...travellerMap].map(
            ([file, members]: Dynamic): Dynamic => ({
              file: file,
              members: members,
            }),
          ),
          pieces: canvasMap.map((entry?: Dynamic): Dynamic => {
            let member: Dynamic = canvasMembers[entry.index];
            return {
              file: entry.file,
              tid: entry.tid,
              index: entry.index,
              box: {
                x: pointer.x + member.dx,
                y: pointer.y + member.dy,
                w: member.w,
                h: member.h,
              },
            };
          }),
          endHome: (file?: Dynamic): Dynamic =>
            host.handle(file)?.moveCancel(move.key),
          ...(move.last.alt
            ? {
                copy: true,
              }
            : {}),
        };
      }
      let isNothingDropped: Dynamic = move.last.alt && !travelPlan;
      if (isNothingDropped) {
        hasCanvasItems && host.canvas.cancel(move.key, move.pointerId);
        for (let [file, fileState] of move.files as Dynamic)
          fileState.started &&
            (fileState.raf &&
              (cancelAnimationFrame(fileState.raf), (fileState.raf = 0)),
            host.handle(file)?.moveCancel(move.key));
        let hint: Dynamic = move.blockedTarget
          ? uiMessage("canvas.workingState.thatArtboardIsPlaying")
          : target && !target.canvas
            ? uiMessage("canvas.workingState.thatArtboardDidNotAnswer")
            : target
              ? uiMessage("canvas.workingState.nothingCouldTravelTryAgain")
              : host.piecesAllowed()
                ? uiMessage("canvas.workingState.releaseOverAnArtboardOr")
                : uiMessage("canvas.workingState.releaseOverAnArtboard");
        host.say(uiMessage("canvas.workingState.nothingCopied") + hint);
        target &&
          !target.canvas &&
          (host.handle(target.file)?.dropPlanClear(move.key),
          closeTarget(move, target));
        for (let file of move.files.keys() as Dynamic)
          host.handle(file)?.moveSettle();
        finishMove(move);
        move.committed = true;
        move.offKeys();
        releasedMove === move && (releasedMove = null);
        return;
      } else move.last.alt && !isCanvasTravel && (canvasDropOk = updateCanvasDrop());
      await Promise.all(
        [...move.files].map(
          async ([file, fileState]: Dynamic): Promise<Dynamic> => {
            if (!fileState.started || !fileState.anchor) return;
            let handle: Dynamic = host.handle(file);
            if (!handle) return;
            fileState.raf &&
              (cancelAnimationFrame(fileState.raf), (fileState.raf = 0));
            if (fileState.travelling) {
              if (
                travelPlan &&
                travelPlan.travellers.some(
                  (traveller?: Dynamic): Dynamic => traveller.file === file,
                )
              )
                return;
              handle.moveCancel(move.key);
              items.push(file);
              return;
            }
            let state: Dynamic = {
                x: fileState.anchor.x + (pointer.x - press.x),
                y: fileState.anchor.y + (pointer.y - press.y),
              },
              endResult: Dynamic = await Promise.race([
                handle
                  .moveEnd(move.key, state, move.last.mods, fileState.tids)
                  .catch((): Dynamic => null),
                new Promise(
                  (resolve?: Dynamic): Dynamic =>
                    setTimeout((): Dynamic => resolve(null), 1500),
                ),
              ]);
            endResult
              ? entries.set(file, [endResult])
              : (handle.moveCancel(move.key), items.push(file));
          },
        ),
      );
      finishMove(move);
      let markCommitted: Dynamic = (): Dynamic => {
          move.committed ||
            ((move.committed = true),
            move.offKeys(),
            releasedMove === move && (releasedMove = null));
        },
        timeoutId: Dynamic = setTimeout(
          markCommitted,
          travelPlan
            ? travelCommitTimeoutMs
            : Math.max(0, releaseGuardMs - (Date.now() - releasedAt)),
        ),
        didLandOnTarget: Dynamic = false;
      try {
        let commitResult: Dynamic = await host.commit({
          token: move.key,
          releasedAt: releasedStamp,
          plans: entries,
          unanswered: [...items, ...move.dropped],
          canvasMoved: hasCanvasItems && !isNothingDropped,
          canvasDropped: hasCanvasItems && !isNothingDropped && !canvasDropOk,
          copy: move.last.alt,
          canvas: isCanvasTravel ? updateCanvasDrop : (): Dynamic => {},
          travel: travelPlan,
        });
        didLandOnTarget =
          !!travelPlan &&
          !!commitResult &&
          !!commitResult.written &&
          commitResult.written.includes(travelPlan.target);
      } finally {
        clearTimeout(timeoutId);
        markCommitted();
        target &&
          !target.canvas &&
          (didLandOnTarget && travelPlan && target.file === travelPlan.target
            ? (host.handle(target.file)?.dropPlanClear(move.key, true),
              setTimeout((): Dynamic => closeTarget(move, target), 150))
            : (host.handle(target.file)?.dropPlanClear(move.key),
              closeTarget(move, target)));
      }
    },
    stopListening: Dynamic = null,
    releasedMove: Dynamic = null,
    releasedAt: Dynamic = 0;
  return {
    active: (): Dynamic => activeMove !== null,
    begin(gesture: Dynamic): Dynamic {
      if (
        releasedMove &&
        !releasedMove.committed &&
        Date.now() - releasedAt < releaseGuardMs
      )
        return false;
      activeMove && cancelActive();
      stopListening?.();
      stopListening = null;
      let moveKey: Dynamic = randomSessionToken(),
        entries: Dynamic = new Map();
      for (let [file, tids] of gesture.files as Dynamic)
        tids.length > 0 &&
          entries.set(file, {
            tids: [...tids],
            started: false,
            anchor: null,
            pending: null,
            raf: 0,
            members: [],
            travelling: false,
          });
      let handlePointerMove: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
          if (
            !(!activeMove || pointerEvent.pointerId !== activeMove.pointerId) &&
            ((activeMove.last = {
              clientX: pointerEvent.clientX,
              clientY: pointerEvent.clientY,
              mods: readPointerModifiers(pointerEvent),
              free: isPrimaryModifierPressed(pointerEvent),
              alt: isPointerAltPressed(pointerEvent),
            }),
            !(
              !activeMove.live &&
              Math.hypot(
                pointerEvent.clientX - activeMove.press.clientX,
                pointerEvent.clientY - activeMove.press.clientY,
              ) < host.slopPx
            ))
          ) {
            if (host.readOnly()) {
              cancelActive();
              return;
            }
            startMove(activeMove);
            (activeMove.canvas.files.size > 0 || activeMove.canvas.notes.size > 0) &&
              host.canvas.update(
                activeMove.key,
                activeMove.pointerId,
                pointerEvent.clientX,
                pointerEvent.clientY,
                isPrimaryModifierPressed(pointerEvent),
                false,
                undefined,
                isPointerAltPressed(pointerEvent),
              );
            updateMove(activeMove);
          }
        },
        handlePointerUp: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
          if (!activeMove || pointerEvent.pointerId !== activeMove.pointerId) return;
          let previousAlt: Dynamic = activeMove.last.alt;
          activeMove.last = {
            clientX: pointerEvent.clientX,
            clientY: pointerEvent.clientY,
            mods: readPointerModifiers(pointerEvent),
            free: isPrimaryModifierPressed(pointerEvent),
            alt: isPointerAltPressed(pointerEvent),
          };
          activeMove.live && activeMove.last.alt !== previousAlt && updateTarget(activeMove);
          commitMove();
        },
        handlePointerCancel: Dynamic = (pointerEvent?: Dynamic): Dynamic => {
          !activeMove || pointerEvent.pointerId !== activeMove.pointerId || cancelActive();
        },
        handleBlur: Dynamic = (): Dynamic => {
          isEscapeHeld = false;
          cancelActive();
          stopKeyListeners();
        },
        isEscapeHeld: Dynamic = false,
        isCutShortcut: Dynamic = (event?: Dynamic): Dynamic =>
          (event.metaKey || event.ctrlKey) &&
          !event.shiftKey &&
          event.key.toLowerCase() === "x",
        handleKey: Dynamic = (event?: Dynamic): Dynamic => {
          if (moveSession.releasing && !moveSession.committed) {
            (event.key === "Escape" ||
              event.key === "Delete" ||
              event.key === "Backspace" ||
              isCutShortcut(event) ||
              ((event.metaKey || event.ctrlKey) &&
                (event.key === "z" ||
                  event.key === "Z" ||
                  event.key === "y"))) &&
              (event.preventDefault(),
              event.stopImmediatePropagation(),
              event.key === "Escape" && (isEscapeHeld = event.type === "keydown"));
            return;
          }
          if (event.key === "Escape" && event.type === "keyup") {
            isEscapeHeld = false;
            activeMove || stopKeyListeners();
            return;
          }
          if (event.key === "Escape" && event.type === "keydown" && isEscapeHeld) {
            event.preventDefault();
            event.stopImmediatePropagation();
            return;
          }
          if (activeMove) {
            if (event.key === "Escape" && event.type === "keydown") {
              event.preventDefault();
              event.stopImmediatePropagation();
              isEscapeHeld = true;
              cancelActive();
              return;
            }
            if (
              activeMove.live &&
              (event.key === "Delete" ||
                event.key === "Backspace" ||
                isCutShortcut(event))
            ) {
              event.preventDefault();
              event.stopImmediatePropagation();
              return;
            }
            activeMove.live &&
              !event.repeat &&
              (event.key === "Meta" ||
                event.key === "Control" ||
                event.key === "Alt" ||
                event.key === "Shift") &&
              ((activeMove.last = {
                ...activeMove.last,
                mods: readPointerModifiers(event),
                free: isPrimaryModifierPressed(event),
                alt: isPointerAltPressed(event),
              }),
              (activeMove.canvas.files.size > 0 || activeMove.canvas.notes.size > 0) &&
                host.canvas.update(
                  activeMove.key,
                  activeMove.pointerId,
                  activeMove.last.clientX,
                  activeMove.last.clientY,
                  isPrimaryModifierPressed(event),
                  false,
                  undefined,
                  isPointerAltPressed(event),
                ),
              updateMove(activeMove));
          }
        },
        stopKeyListeners: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener(
            "keydown",
            handleKey,
            true,
          );
          (window as Dynamic).removeEventListener("keyup", handleKey, true);
          stopListening === stopKeyListeners && (stopListening = null);
        };
      (window as Dynamic).addEventListener("pointermove", handlePointerMove);
      (window as Dynamic).addEventListener("pointerup", handlePointerUp);
      (window as Dynamic).addEventListener("pointercancel", handlePointerCancel);
      (window as Dynamic).addEventListener("blur", handleBlur);
      (window as Dynamic).addEventListener("keydown", handleKey, true);
      (window as Dynamic).addEventListener("keyup", handleKey, true);
      let pressPoint: Dynamic = {
          clientX: gesture.clientX,
          clientY: gesture.clientY,
        },
        stopPointerListeners: Dynamic = (): Dynamic => {
          (window as Dynamic).removeEventListener("pointermove", handlePointerMove);
          (window as Dynamic).removeEventListener("pointerup", handlePointerUp);
          (window as Dynamic).removeEventListener(
            "pointercancel",
            handlePointerCancel,
          );
          (window as Dynamic).removeEventListener("blur", handleBlur);
        },
        moveSession: Dynamic = {
          key: moveKey,
          pointerId: gesture.pointerId,
          captureEl: gesture.captureEl,
          press: pressPoint,
          last: {
            clientX: gesture.from?.clientX ?? gesture.clientX,
            clientY: gesture.from?.clientY ?? gesture.clientY,
            mods: {
              alt: false,
              ctrl: false,
              meta: false,
              shift: false,
            },
            free: false,
            alt: false,
          },
          leader: gesture.leader,
          files: entries,
          canvas: gesture.canvas,
          live: false,
          starting: null,
          keepalive: 0,
          dropped: [],
          armWait: gesture.armWait,
          stillAction: gesture.stillAction,
          heldCover: gesture.heldCover,
          done: false,
          releasing: false,
          canvasCommitted: false,
          committed: false,
          offPointer: stopPointerListeners,
          offKeys: (): Dynamic => {
            isEscapeHeld ? (stopListening = stopKeyListeners) : stopKeyListeners();
          },
          target: null,
          blockedTarget: null,
          dropPlan: null,
          closing: new Map(),
          planInFlight: null,
          planPending: false,
          off: (): Dynamic => {
            stopPointerListeners();
            (moveSession.releasing && !moveSession.committed) || moveSession.offKeys();
          },
        };
      activeMove = moveSession;
      host.claimKeyboard();
      host.setGestureSource("set-move", true);
      host.setHeldCover(gesture.heldCover);
      try {
        gesture.captureEl?.setPointerCapture(gesture.pointerId);
      } catch {}
      gesture.from &&
        Math.hypot(
          gesture.from.clientX - gesture.clientX,
          gesture.from.clientY - gesture.clientY,
        ) >= host.slopPx &&
        (startMove(activeMove),
        (activeMove.canvas.files.size > 0 || activeMove.canvas.notes.size > 0) &&
          host.canvas.update(
            activeMove.key,
            activeMove.pointerId,
            activeMove.last.clientX,
            activeMove.last.clientY,
            false,
            false,
          ),
        updateMove(activeMove));
      return true;
    },
  };
}

export { createElementMoveSessions, pointerDelta, randomSessionToken };

