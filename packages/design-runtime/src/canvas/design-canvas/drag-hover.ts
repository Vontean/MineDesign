import type { Dynamic } from '../../runtime-types';
import { pastedElementGeometry } from '../../editor/insert/drop-targets';
import { randomSessionToken } from '../working-state';

/** 画布对象悬停在目标画板上时运行：在目标画板中计算落点计划（dropPlanAt）并显示插入预览，请求进行中时只保留最新坐标排队。 */
export function requestDropPlanPreview(deps: { readonly artboardEntries: Dynamic; readonly hoverSession: Dynamic; readonly requestPreview: Dynamic; readonly pageContents: Dynamic }, event?: Dynamic,
  target?: Dynamic,
  pointX?: Dynamic,
  pointY?: Dynamic,
  placementMode?: Dynamic): Dynamic {
  if (event.inFlight) {
    event.pending = {
      cx: pointX,
      cy: pointY,
      mode: placementMode,
    };
    return;
  }
  let html: Dynamic = event.html,
    member: Dynamic = event.member;
  if (!html || !member) return;
  let entry: Dynamic = deps.artboardEntries.current.get(target.file),
    artboard: Dynamic = deps.pageContents.current.artboards.find(
      (candidate?: Dynamic): Dynamic => candidate.file === target.file,
    );
  if (!entry || !artboard) return;
  let isLaidOutPromise: Dynamic = event.laidOut.get(target.file);
  isLaidOutPromise ||
    ((isLaidOutPromise = entry.isFreeCanvas(html).then(
      (isFree?: Dynamic): Dynamic => !isFree,
      (): Dynamic => false,
    )),
    event.laidOut.set(target.file, isLaidOutPromise));
  event.inFlight = Promise.all([target.opened, isLaidOutPromise])
    .then(
      ([isOpened, isLaidOut]: Dynamic): Dynamic =>
        isOpened && isLaidOut
          ? entry.dropPlanAt(
              event.token,
              {
                x: pointX - artboard.x,
                y: pointY - artboard.y,
              },
              [member],
              placementMode,
            )
          : null,
    )
    .then(
      (plan?: Dynamic): Dynamic => {
        event.target === target &&
          (!plan ||
            !plan.landing.some(
              (landingItem?: Dynamic): Dynamic => landingItem.tid === 0,
            )) &&
          entry.dropPlanClear(event.token);
      },
      (): Dynamic => {},
    )
    .finally((): Dynamic => {
      event.inFlight = null;
      let pending: Dynamic = event.pending;
      event.pending = null;
      pending &&
        event.target &&
        deps.hoverSession.current === event &&
        deps.requestPreview(
          event,
          event.target,
          pending.cx,
          pending.cy,
          pending.mode,
        );
    });
}

/** 把画布对象（说明、图形或无框画板）拖过其他画板时运行：建立拖动会话、打开目标画板的移动宿主，并刷新落点预览。 */
export function trackObjectHoverOverArtboard(deps: { readonly artboardEntries: Dynamic; readonly dropInProgress: Dynamic; readonly hoverSession: Dynamic; readonly closeHoverTarget: Dynamic; readonly requestPreview: Dynamic; readonly readObjectHtml: Dynamic; readonly playingFile: Dynamic; readonly fullscreenActive: Dynamic }, event?: Dynamic): Dynamic {
  let session: Dynamic = deps.hoverSession.current;
  session &&
    session.gestureKey !== event.key &&
    (deps.closeHoverTarget(), (session = null));
  let isOtherGestureActive: Dynamic = deps.dropInProgress.current || deps.fullscreenActive.current;
  if (!session) {
    if (!event.target || isOtherGestureActive) return;
    let state: Dynamic = {
        ew: event.at.w,
        eh: event.at.h,
        ox: 0,
        oy: 0,
        gx: event.point.x - event.at.x,
        gy: event.point.y - event.at.y,
      },
      newSession: Dynamic = {
        gestureKey: event.key,
        token: randomSessionToken(),
        html: null,
        member: null,
        laidOut: new Map(),
        target: null,
        closing: new Map(),
        inFlight: null,
        pending: null,
      };
    deps.hoverSession.current = newSession;
    session = newSession;
    deps.readObjectHtml(event.object)
      .then((objectHtml?: Dynamic): Dynamic => {
        deps.hoverSession.current === newSession &&
          ((newSession.html = objectHtml),
          (newSession.member = objectHtml
            ? pastedElementGeometry(objectHtml, state)
            : null));
      })
      .catch((): Dynamic => {});
  }
  let hoverTarget: Dynamic =
    event.target &&
    !isOtherGestureActive &&
    event.target !== deps.playingFile.current &&
    event.target !== ("file" in event.object ? event.object.file : null)
      ? event.target
      : null;
  session.target && session.target.file !== hoverTarget && deps.closeHoverTarget();
  if (!!hoverTarget) {
    if (!session.target) {
      let entry: Dynamic = deps.artboardEntries.current.get(hoverTarget),
        sessionAtOpen: Dynamic = session;
      session.target = {
        file: hoverTarget,
        opened: (session.closing.get(hoverTarget) ?? Promise.resolve())
          .then(
            (): Dynamic =>
              entry?.moveHost(sessionAtOpen.token, "open") ?? false,
          )
          .catch((): Dynamic => false),
      };
    }
    deps.requestPreview(
      session,
      session.target,
      event.point.x,
      event.point.y,
      event.ctrl ? "keep" : "flow",
    );
  }
}

