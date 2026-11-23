/** Restored application module; prepare first, initialize in original order. */
import {
  type Dynamic,
} from "../../runtime-types";
import { PickerHiddenTagsPattern } from "./hidden-tags";
import { buildPickerRuntimeScript } from "./runtime-script";

var PickerBridgePattern: Dynamic;
var PickerBridgeHandler: Dynamic;
var PickerBridgeStringify: Dynamic;
var PickerBridgeJoin: Dynamic;
var PickerBridgeLimit: Dynamic;
var PickerBridgeTagPattern: Dynamic;
var PickerBridgeConstant: Dynamic;
var PickerBridgeFingerprintPattern: Dynamic;
var PickerBridgeBoldItalicUnderlineSet: Dynamic;
var PickerBridgeLabel: Dynamic;
var PickerBridgeInspectTimeoutMs: Dynamic;
function isPickerInstalled(webContents?: Dynamic): Dynamic {
  return webContents.executeJavaScript("!!window.__dcEditorPicker", 5e3).then(
    (result?: Dynamic): Dynamic => result === true,
    (): Dynamic => false,
  );
}
function installPicker(webContents?: Dynamic, theme?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(buildPickerRuntimeScript());
  theme && setPickerTheme(webContents, theme);
}
function setPickerTheme(webContents?: Dynamic, theme?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setAppTheme && window.__dcEditorPicker.setAppTheme(${JSON.stringify(theme)})`,
  );
}
function enablePicker(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.enable()",
  );
}
function disablePicker(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.disable()",
  );
}
function enablePickerPanZoom(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.enablePanZoomOnly()",
  );
}
function setPickerInteractive(webContents?: Dynamic, mode?: Dynamic): Dynamic {
  let value: Dynamic =
    mode === "scroll" || mode === "play"
      ? "'" + mode + "'"
      : mode
        ? "true"
        : "false";
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setHostPanZoom && window.__dcEditorPicker.setHostPanZoom(${value})`,
  );
}
function setPickerHostScale(webContents?: Dynamic, scale?: Dynamic): Dynamic {
  let value: Dynamic = Number(scale);
  !isFinite(value) ||
    value <= 0 ||
    webContents.executeJavaScriptUnchecked(
      `window.__dcEditorPicker && window.__dcEditorPicker.setHostScale && window.__dcEditorPicker.setHostScale(${value})`,
    );
}
function resizePickerSelection(webContents?: Dynamic, resizeOptions?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.resizeWith && window.__dcEditorPicker.resizeWith(${JSON.stringify(resizeOptions)})`,
  );
}
function pickerGesturePhase(webContents?: Dynamic, source?: Dynamic): Dynamic {
  let callback: Dynamic = (numericValue?: Dynamic): Dynamic =>
      String(Number.isFinite(numericValue) ? numericValue : 0),
    value: Dynamic =
      source.phase === "start"
        ? (source.kind === "endpoint"
            ? source.which === 1
              ? "1"
              : "0"
            : JSON.stringify(
                source.kind === "resize" ? source.dir : source.corner,
              )) +
          "," +
          callback(source.x) +
          "," +
          callback(source.y)
        : source.phase === "move"
          ? callback(source.x) +
            "," +
            callback(source.y) +
            (source.shift ? ",true" : ",false")
          : source.commit
            ? "true"
            : "false",
    methodName: Dynamic =
      source.kind + source.phase[0].toUpperCase() + source.phase.slice(1);
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.${methodName} && window.__dcEditorPicker.${methodName}(${value})`,
  );
}
function pickerPenPreview(
  webContents?: Dynamic,
  token?: Dynamic,
  items?: Dynamic,
): Dynamic {
  (items !== null && items.length > 1e5) ||
    webContents.executeJavaScriptUnchecked(
      `window.__dcEditorPicker && window.__dcEditorPicker.penPreview && window.__dcEditorPicker.penPreview(${String(Math.trunc(token))},${items === null ? "null" : JSON.stringify(items)})`,
    );
}
function pickerVectorPreview(
  webContents?: Dynamic,
  token?: Dynamic,
  bounds?: Dynamic,
  items?: Dynamic,
): Dynamic {
  if (items.length > 1e5) return;
  let callback: Dynamic = (numericValue?: Dynamic): Dynamic =>
    String(Number.isFinite(numericValue) ? Math.round(numericValue * 100) / 100 : 0);
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.penCommit && window.__dcEditorPicker.penCommit(${String(Math.trunc(token))},${callback(bounds.x)},${callback(bounds.y)},${callback(bounds.w)},${callback(bounds.h)},${JSON.stringify(items)})`,
  );
}
function pickerContextMenuAt(
  webContents?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
): Dynamic {
  let callback: Dynamic = (numericValue?: Dynamic): Dynamic =>
    String(Number.isFinite(numericValue) ? numericValue : 0);
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.contextMenuAt && window.__dcEditorPicker.contextMenuAt(" +
      callback(clientX) +
      "," +
      callback(clientY) +
      ")",
  );
}
function pickerContextMenuBySelection(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.contextMenuBySelection && window.__dcEditorPicker.contextMenuBySelection()",
  );
}
function pickerDragModifiers(
  webContents?: Dynamic,
  altKey?: Dynamic,
  ctrlKey?: Dynamic,
  metaKey?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.dragModifiers && window.__dcEditorPicker.dragModifiers(" +
      [altKey, ctrlKey, metaKey]
        .map((isHeld?: Dynamic): Dynamic => String(isHeld === true))
        .join(",") +
      ")",
  );
}
function cancelPickerDrag(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.cancelDrag && window.__dcEditorPicker.cancelDrag()",
  );
}
function cancelPickerBox(webContents?: Dynamic, gestureToken?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.cancelBox && window.__dcEditorPicker.cancelBox(${JSON.stringify(gestureToken)})`,
  );
}
function armPickerByClick(
  webContents?: Dynamic,
  armedTool?: Dynamic,
  armedOptions?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.armedByClick && window.__dcEditorPicker.armedByClick(${JSON.stringify(armedTool)},${JSON.stringify(armedOptions)})`,
  );
}
function finishExitedPickerDrag(
  webContents?: Dynamic,
  mode?: Dynamic,
  dragId?: Dynamic,
  shouldCommit?: Dynamic,
): Dynamic {
  if (!/^[0-9a-f]{16}$/.test(dragId)) return;
  let methodName: Dynamic =
    mode === "exit"
      ? "exitDrag"
      : mode === "finish"
        ? "finishExitedDrag"
        : "abortDrag";
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker." +
      methodName +
      " && window.__dcEditorPicker." +
      methodName +
      "('" +
      dragId +
      "'," +
      (shouldCommit ? "true" : "false") +
      ")",
  );
}
async function beginPickerMove(
  webContents?: Dynamic,
  moveId?: Dynamic,
  tid?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
  modifiers?: Dynamic,
): Promise<Dynamic> {
  if (
    !PickerBridgePattern.test(moveId) ||
    !Number.isInteger(tid) ||
    tid < 0
  )
    return null;
  try {
    return await webContents.executeJavaScript(
      "window.__dcEditorPicker && window.__dcEditorPicker.moveStart ? window.__dcEditorPicker.moveStart(" +
        PickerBridgeJoin(moveId, tid, clientX, clientY, modifiers) +
        ") : null",
      4e3,
    );
  } catch {
    return null;
  }
}
function updatePickerMove(
  webContents?: Dynamic,
  moveId?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
  modifiers?: Dynamic,
): Dynamic {
  PickerBridgePattern.test(moveId) &&
    webContents.executeJavaScriptUnchecked(
      "window.__dcEditorPicker && window.__dcEditorPicker.moveMove && window.__dcEditorPicker.moveMove(" +
        PickerBridgeJoin(moveId, null, clientX, clientY, modifiers) +
        ")",
    );
}
async function finishPickerMove(
  webContents?: Dynamic,
  moveId?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
  modifiers?: Dynamic,
): Promise<Dynamic> {
  if (!PickerBridgePattern.test(moveId)) return null;
  try {
    return await webContents.executeJavaScript(
      "window.__dcEditorPicker && window.__dcEditorPicker.moveEnd ? window.__dcEditorPicker.moveEnd(" +
        PickerBridgeJoin(moveId, null, clientX, clientY, modifiers) +
        ") : null",
      4e3,
    );
  } catch {
    return null;
  }
}
function cancelPickerMove(webContents?: Dynamic, moveId?: Dynamic): Dynamic {
  PickerBridgePattern.test(moveId) &&
    webContents.executeJavaScriptUnchecked(
      "window.__dcEditorPicker && window.__dcEditorPicker.moveCancel && window.__dcEditorPicker.moveCancel('" +
        moveId +
        "')",
    );
}
function pickerMoveHold(
  webContents?: Dynamic,
  moveId?: Dynamic,
  action?: Dynamic,
): Dynamic {
  return !PickerBridgePattern.test(moveId) ||
    (action !== "open" && action !== "close")
    ? Promise.resolve(false)
    : webContents
        .executeJavaScript(
          "window.__dcEditorPicker && window.__dcEditorPicker.moveHost ? window.__dcEditorPicker.moveHost('" +
            moveId +
            "', '" +
            action +
            "') : false",
          1e4,
        )
        .then(
          (item?: Dynamic): Dynamic => item === true,
          (): Dynamic => false,
        );
}
function exitPickerMove(webContents?: Dynamic, moveId?: Dynamic): Dynamic {
  PickerBridgePattern.test(moveId) &&
    webContents.executeJavaScriptUnchecked(
      "window.__dcEditorPicker && window.__dcEditorPicker.moveExit && window.__dcEditorPicker.moveExit('" +
        moveId +
        "')",
    );
}
function returnPickerMove(webContents?: Dynamic, moveId?: Dynamic): Dynamic {
  PickerBridgePattern.test(moveId) &&
    webContents.executeJavaScriptUnchecked(
      "window.__dcEditorPicker && window.__dcEditorPicker.moveReturn && window.__dcEditorPicker.moveReturn('" +
        moveId +
        "')",
    );
}
function touchPickerMove(webContents?: Dynamic, moveId?: Dynamic): Dynamic {
  PickerBridgePattern.test(moveId) &&
    webContents.executeJavaScriptUnchecked(
      "window.__dcEditorPicker && window.__dcEditorPicker.moveTouch && window.__dcEditorPicker.moveTouch('" +
        moveId +
        "')",
    );
}
async function planPickerDrop(
  webContents?: Dynamic,
  moveId?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
  dragItems?: Dynamic,
  flowMode?: Dynamic,
): Promise<Dynamic> {
  if (
    !PickerBridgePattern.test(moveId) ||
    !Number.isFinite(clientX) ||
    !Number.isFinite(clientY)
  )
    return null;
  let sanitizedItems: Dynamic = dragItems
    .filter(
      (item?: Dynamic): Dynamic =>
        Number.isInteger(item.tid) &&
        /^[a-z][a-z0-9-]{0,63}$/.test(item.tag) &&
        [item.w, item.h, item.dx, item.dy].every(Number.isFinite),
    )
    .map(
      (item?: Dynamic): Dynamic => ({
        tid: item.tid,
        tag: item.tag,
        w: item.w,
        h: item.h,
        dx: item.dx,
        dy: item.dy,
      }),
    );
  if (sanitizedItems.length === 0) return null;
  try {
    return await webContents.executeJavaScript(
      "window.__dcEditorPicker && window.__dcEditorPicker.dropPlanAt ? window.__dcEditorPicker.dropPlanAt('" +
        moveId +
        "'," +
        JSON.stringify(clientX) +
        "," +
        JSON.stringify(clientY) +
        "," +
        JSON.stringify(sanitizedItems) +
        "," +
        JSON.stringify(flowMode === "keep" ? "keep" : "flow") +
        ") : null",
      1500,
    );
  } catch {
    return null;
  }
}
function clearPickerDropPlan(
  webContents?: Dynamic,
  moveId?: Dynamic,
  isFinal: Dynamic = false,
): Dynamic {
  PickerBridgePattern.test(moveId) &&
    webContents.executeJavaScriptUnchecked(
      "window.__dcEditorPicker && window.__dcEditorPicker.dropPlanClear && window.__dcEditorPicker.dropPlanClear('" +
        moveId +
        "'," +
        (isFinal ? "true" : "false") +
        ")",
    );
}
function settlePickerMove(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.moveSettle && window.__dcEditorPicker.moveSettle()",
  );
}
function repostPickerChrome(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.repostChrome && window.__dcEditorPicker.repostChrome()",
  );
}
function setPickerPanZoomArmed(webContents?: Dynamic, isArmed?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setPanZoomArmed(${isArmed ? "true" : "false"})`,
  );
}
function setPickerReadOnly(webContents?: Dynamic, isReadOnly?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setReadOnly && window.__dcEditorPicker.setReadOnly(${isReadOnly ? "true" : "false"})`,
  );
}
function setPickerMeasure(webContents?: Dynamic, isEnabled?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setMeasure && window.__dcEditorPicker.setMeasure(${isEnabled ? "true" : "false"})`,
  );
}
function setPickerDeepSelection(webContents?: Dynamic, isDeep?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setDeep && window.__dcEditorPicker.setDeep(${isDeep ? "true" : "false"})`,
  );
}
function setPickerRingsOnly(webContents?: Dynamic, isEnabled?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.${isEnabled ? "enableRingsOnly" : "disableRingsOnly"} && window.__dcEditorPicker.${isEnabled ? "enableRingsOnly" : "disableRingsOnly"}()`,
  );
}
function setPickerHiddenTags(webContents?: Dynamic, tagNames?: Dynamic): Dynamic {
  let value: Dynamic = JSON.stringify(
    tagNames
      .filter(
        (tagName?: Dynamic): Dynamic =>
          PickerHiddenTagsPattern.test(tagName),
      )
      .slice(0, 32),
  );
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setBusyDrops && window.__dcEditorPicker.setBusyDrops(${value})`,
  );
}
async function pickAtPoint(
  webContents?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
  mode: Dynamic = "plain",
  templateTids: Dynamic = [],
  textTids: Dynamic = [],
): Promise<Dynamic> {
  try {
    let rawResult: Dynamic = await webContents.executeJavaScript(
      `window.__dcEditorPicker && window.__dcEditorPicker.pickAt ? window.__dcEditorPicker.pickAt(${JSON.stringify(clientX)},${JSON.stringify(clientY)},${JSON.stringify(mode)},${JSON.stringify(templateTids.filter((tid?: Dynamic): Dynamic => Number.isInteger(tid)))},${JSON.stringify(textTids.filter((tid?: Dynamic): Dynamic => Number.isInteger(tid)))}) : null`,
      4e3,
    );
    if (rawResult == null || typeof rawResult != "object") return null;
    if (rawResult.empty === true)
      return {
        empty: true,
      };
    let callback: Dynamic = (numericValue?: Dynamic): Dynamic =>
        typeof numericValue == "number" &&
        Number.isFinite(numericValue) &&
        Math.abs(numericValue) < 1e6
          ? numericValue
          : null,
      sanitizePickedElement: Dynamic = (picked?: Dynamic): Dynamic => {
        if (picked == null || typeof picked != "object") return null;
        let tid: Dynamic = Number(picked.tid);
        if (
          !Number.isInteger(tid) ||
          tid < 0 ||
          tid > 1e6 ||
          typeof picked.tag != "string" ||
          !/^[a-z][a-z0-9-]{0,63}$/.test(picked.tag)
        )
          return null;
        let x: Dynamic = callback(picked.rect?.x),
          y: Dynamic = callback(picked.rect?.y),
          width: Dynamic = callback(picked.rect?.w),
          height: Dynamic = callback(picked.rect?.h);
        return {
          tid: tid,
          tag: picked.tag,
          rect:
            x != null &&
            y != null &&
            width != null &&
            height != null
              ? {
                  x: x,
                  y: y,
                  w: width,
                  h: height,
                }
              : null,
        };
      },
      pickedElement: Dynamic = sanitizePickedElement(rawResult);
    if (!pickedElement) return null;
    let textElement: Dynamic = sanitizePickedElement(rawResult.text),
      textTarget: Dynamic =
        textElement && textElement.rect
          ? {
              tid: textElement.tid,
              tag: textElement.tag,
              rect: textElement.rect,
            }
          : null;
    return {
      tid: pickedElement.tid,
      tag: pickedElement.tag,
      rect: pickedElement.rect ?? {
        x: 0,
        y: 0,
        w: 0,
        h: 0,
      },
      root: rawResult.root === true,
      page: rawResult.root === true && rawResult.page === true,
      text: textTarget,
    };
  } catch {
    return null;
  }
}
async function pickInBox(
  webContents?: Dynamic,
  box?: Dynamic,
  rootName?: Dynamic,
): Promise<Dynamic> {
  try {
    let value: Dynamic = [box.x0, box.y0, box.x1, box.y1]
        .map((coordinate?: Dynamic): Dynamic => JSON.stringify(Number(coordinate)))
        .join(","),
      rawResults: Dynamic = await webContents.executeJavaScript(
        `window.__dcEditorPicker && window.__dcEditorPicker.pickIn ? window.__dcEditorPicker.pickIn(${value},${JSON.stringify(rootName)}) : []`,
        4e3,
      );
    if (!Array.isArray(rawResults)) return null;
    let items: Dynamic = [];
    for (let entry of rawResults.slice(0, 512) as Dynamic) {
      if (entry == null || typeof entry != "object") continue;
      let tid: Dynamic = Number(entry.tid),
        tag: Dynamic = entry.tag;
      !Number.isInteger(tid) ||
        tid < 0 ||
        tid > 1e6 ||
        typeof tag != "string" ||
        !/^[a-z][a-z0-9-]{0,63}$/.test(tag) ||
        items.push({
          tid: tid,
          tag: tag,
        });
    }
    return items;
  } catch {
    return null;
  }
}
function normalizePickerRect(rect?: Dynamic): Dynamic {
  let value: Dynamic = rect;
  if (!value || typeof value != "object") return null;
  let callback: Dynamic = (numericValue?: Dynamic): Dynamic =>
      typeof numericValue == "number" &&
      Number.isFinite(numericValue) &&
      Math.abs(numericValue) < 1e6
        ? numericValue
        : null,
    x: Dynamic = callback(value.x),
    y: Dynamic = callback(value.y),
    width: Dynamic = callback(value.w),
    height: Dynamic = callback(value.h);
  return x != null &&
    y != null &&
    width != null &&
    height != null &&
    width >= 0 &&
    height >= 0
    ? {
        x: x,
        y: y,
        w: width,
        h: height,
      }
    : null;
}
function normalizeCommentAnchor(anchor?: Dynamic): Dynamic {
  let value: Dynamic = anchor;
  if (!value || typeof value != "object") return null;
  let path: Dynamic =
    typeof value.path == "string" &&
    value.path !== "" &&
    value.path.length <= PickerBridgeLimit
      ? value.path
      : value.path == null
        ? null
        : undefined;
  if (path === undefined) return null;
  let rect: Dynamic = normalizePickerRect(value.rect);
  if (!rect) return null;
  let callback: Dynamic = (fraction?: Dynamic): Dynamic =>
      typeof fraction == "number" && Number.isFinite(fraction)
        ? Math.min(1, Math.max(0, fraction))
        : 0.5,
    tid: Dynamic =
      typeof value.tid == "number" &&
      Number.isInteger(value.tid) &&
      value.tid >= 0 &&
      value.tid < 1e6
        ? value.tid
        : null,
    tag: Dynamic =
      typeof value.tag == "string" && PickerBridgeTagPattern.test(value.tag)
        ? value.tag
        : null,
    text: Dynamic =
      (typeof value.text == "string" &&
        value.text
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, PickerBridgeConstant)) ||
      null,
    fingerprint: Dynamic =
      tid != null &&
      typeof value.fp == "string" &&
      PickerBridgeFingerprintPattern.test(value.fp)
        ? value.fp
        : null;
  return {
    path: path,
    tid: tid,
    fp: fingerprint,
    rect: rect,
    fx: callback(value.fx),
    fy: callback(value.fy),
    tag: tag,
    text: text,
    page: normalizePickerRect(value.page),
  };
}
async function pickerCommentAt(
  webContents?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
  timeoutMs: Dynamic = 3e3,
): Promise<Dynamic> {
  try {
    return normalizeCommentAnchor(
      await webContents.executeJavaScript(
        `window.__dcEditorPicker && window.__dcEditorPicker.commentAt ? window.__dcEditorPicker.commentAt(${JSON.stringify(clientX)},${JSON.stringify(clientY)}) : null`,
        timeoutMs,
      ),
    );
  } catch {
    return null;
  }
}
async function pickerCommentIn(
  webContents?: Dynamic,
  left?: Dynamic,
  top?: Dynamic,
  right?: Dynamic,
  bottom?: Dynamic,
  timeoutMs: Dynamic = 3e3,
): Promise<Dynamic> {
  try {
    let rawResult: Dynamic = await webContents.executeJavaScript(
      `window.__dcEditorPicker && window.__dcEditorPicker.commentIn ? window.__dcEditorPicker.commentIn(${JSON.stringify(left)},${JSON.stringify(top)},${JSON.stringify(right)},${JSON.stringify(bottom)}) : null`,
      timeoutMs,
    );
    if (!rawResult || typeof rawResult != "object") return null;
    let items: Dynamic = [];
    if (Array.isArray(rawResult.covered))
      for (let coveredEntry of rawResult.covered.slice(0, 16) as Dynamic) {
        let rect: Dynamic = normalizePickerRect(coveredEntry?.rect),
          tid: Dynamic =
            typeof coveredEntry?.tid == "number" &&
            Number.isInteger(coveredEntry.tid) &&
            coveredEntry.tid >= 0 &&
            coveredEntry.tid < 1e6
              ? coveredEntry.tid
              : null,
          tag: Dynamic =
            typeof coveredEntry?.tag == "string" &&
            PickerBridgeTagPattern.test(coveredEntry.tag)
              ? coveredEntry.tag
              : null;
        rect &&
          tid != null &&
          tag != null &&
          items.push({
            tid: tid,
            tag: tag,
            rect: rect,
          });
      }
    let total: Dynamic =
      typeof rawResult.total == "number" && Number.isInteger(rawResult.total)
        ? Math.max(items.length, Math.min(1e4, rawResult.total))
        : items.length;
    return {
      enclosing:
        rawResult.enclosing == null
          ? null
          : normalizeCommentAnchor(rawResult.enclosing),
      covered: items,
      total: total,
    };
  } catch {
    return null;
  }
}
async function pickerCommentFor(
  webContents?: Dynamic,
  tid?: Dynamic,
  rootName?: Dynamic,
): Promise<Dynamic> {
  try {
    return normalizeCommentAnchor(
      await webContents.executeJavaScript(
        `window.__dcEditorPicker && window.__dcEditorPicker.commentFor ? window.__dcEditorPicker.commentFor(${JSON.stringify(tid)},${JSON.stringify(rootName)}) : null`,
        4e3,
      ),
    );
  } catch {
    return null;
  }
}
async function pickerCommentRects(
  webContents?: Dynamic,
  anchors?: Dynamic,
): Promise<Dynamic> {
  try {
    let value: Dynamic = await webContents.executeJavaScript(
      `window.__dcEditorPicker && window.__dcEditorPicker.commentRects ? window.__dcEditorPicker.commentRects(${JSON.stringify(anchors.slice(0, 256))}) : null`,
      3e3,
    );
    return Array.isArray(value)
      ? anchors.map(
          (anchor?: Dynamic, index?: Dynamic): Dynamic =>
            normalizePickerRect(value[index]),
        )
      : null;
  } catch {
    return null;
  }
}
async function pickerPeerRects(
  webContents?: Dynamic,
  tids?: Dynamic,
  isActiveFile: Dynamic = false,
): Promise<Dynamic> {
  let value: Dynamic = tids.slice(0, 64);
  try {
    let rawRects: Dynamic = await webContents.executeJavaScript(
      `window.__dcEditorPicker && window.__dcEditorPicker.peerRects ? window.__dcEditorPicker.peerRects(${JSON.stringify(value)}, ${isActiveFile ? "true" : "false"}) : null`,
      3e3,
    );
    if (!Array.isArray(rawRects)) return null;
    let rectsByTid: Dynamic = value.map((): Dynamic => []);
    for (let entry of rawRects.slice(0, 256) as Dynamic) {
      let tidIndex: Dynamic = typeof entry?.i == "number" ? entry.i : -1,
        rect: Dynamic = normalizePickerRect(entry);
      rect &&
        Number.isInteger(tidIndex) &&
        tidIndex >= 0 &&
        tidIndex < rectsByTid.length &&
        rectsByTid[tidIndex].push(rect);
    }
    return rectsByTid;
  } catch {
    return null;
  }
}
function repaintPickerSelection(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.repaintSelected && window.__dcEditorPicker.repaintSelected()",
  );
}
function setPickerSelection(
  webContents?: Dynamic,
  tids?: Dynamic,
  rootName?: Dynamic,
  anchorTid?: Dynamic,
  sessionEpoch?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.select(${JSON.stringify(tids)},${JSON.stringify(rootName)},${JSON.stringify(anchorTid ?? null)},${Number.isSafeInteger(sessionEpoch) ? String(sessionEpoch) : "null"})`,
  );
}
function pickerHoverAt(
  webContents?: Dynamic,
  point?: Dynamic,
  templateTids: Dynamic = [],
  isPassthrough: Dynamic = false,
  textTids: Dynamic = [],
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    point
      ? `window.__dcEditorPicker && window.__dcEditorPicker.hoverAt && window.__dcEditorPicker.hoverAt(${Number(point.x)},${Number(point.y)},${JSON.stringify(templateTids.filter((tid?: Dynamic): Dynamic => Number.isInteger(tid)))},${isPassthrough ? "true" : "false"},${JSON.stringify(textTids.filter((tid?: Dynamic): Dynamic => Number.isInteger(tid)))})`
      : "window.__dcEditorPicker && window.__dcEditorPicker.hover(null,null)",
  );
}
function pickerHover(
  webContents?: Dynamic,
  tid?: Dynamic,
  rootName?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.hover(${JSON.stringify(tid)},${JSON.stringify(rootName)})`,
  );
}
function setPickerDirectiveMap(
  webContents?: Dynamic,
  directiveMap?: Dynamic,
  rootName?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setDirectiveMap && window.__dcEditorPicker.setDirectiveMap(${JSON.stringify(directiveMap)},${JSON.stringify(rootName)})`,
  );
}
function formatPickerText(
  webContents?: Dynamic,
  format?: Dynamic,
  textValue?: Dynamic,
): Dynamic {
  PickerBridgeBoldItalicUnderlineSet.has(format) &&
    ((textValue !== undefined && !Number.isInteger(textValue)) ||
      webContents.executeJavaScriptUnchecked(
        `window.__dcEditorPicker && window.__dcEditorPicker.format && window.__dcEditorPicker.format(${JSON.stringify(format)}${textValue === undefined ? "" : "," + String(textValue)})`,
      ));
}
function setPickerTool(webContents?: Dynamic, tool?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setTool(${JSON.stringify(tool === "vector" ? "select" : tool)}, ${tool === "vector" ? "true" : "false"})`,
  );
}
function setPickerOverlayHidden(webContents?: Dynamic, isHidden?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setOverlayHidden(${isHidden ? "true" : "false"})`,
  );
}
function patchPickerStyle(
  webContents?: Dynamic,
  rootName?: Dynamic,
  tids?: Dynamic,
  styles?: Dynamic,
  styleOptions?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.patchStyle(${JSON.stringify(rootName)},${JSON.stringify(tids)},${JSON.stringify(styles)},${JSON.stringify(styleOptions ?? null)})`,
  );
}
function holdPickerStyle(
  webContents?: Dynamic,
  rootName?: Dynamic,
  tids?: Dynamic,
  styles?: Dynamic,
  styleOptions?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.holdStyle && window.__dcEditorPicker.holdStyle(${JSON.stringify(rootName)},${JSON.stringify(tids)},${JSON.stringify(styles)},${JSON.stringify(styleOptions)})`,
  );
}
function unpatchPickerStyle(
  webContents?: Dynamic,
  rootName?: Dynamic,
  tids?: Dynamic,
  propNames?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.unpatchStyle && window.__dcEditorPicker.unpatchStyle(${JSON.stringify(rootName)},${JSON.stringify(tids)},${JSON.stringify(propNames)})`,
  );
}
function setPickerScrubbing(webContents?: Dynamic, isScrubbing?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setScrubbing && window.__dcEditorPicker.setScrubbing(${isScrubbing ? "true" : "false"})`,
  );
}
function setPickerTextEditable(
  webContents?: Dynamic,
  editables?: Dynamic,
  rootName?: Dynamic,
  textValues?: Dynamic,
  editState?: Dynamic,
  importTexts?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.setTextEditable(${JSON.stringify(editables)},${JSON.stringify(rootName)},${JSON.stringify(textValues ?? [])},${JSON.stringify(editState ?? {})},${JSON.stringify(importTexts ?? [])})`,
  );
}
async function getPickerFirstTextFont(webContents?: Dynamic): Promise<Dynamic> {
  try {
    return (
      (await webContents.executeJavaScript(
        "window.__dcEditorPicker && window.__dcEditorPicker.firstTextFont ? window.__dcEditorPicker.firstTextFont() : null",
        2e3,
      )) || null
    );
  } catch {
    return null;
  }
}
function startPickerTextEdit(
  webContents?: Dynamic,
  tid?: Dynamic,
  rootName?: Dynamic,
  mode: Dynamic = "all",
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.startTextEdit(${JSON.stringify(tid)},${JSON.stringify(rootName)},${JSON.stringify(mode)})`,
  );
}
function beginPickerTextPlacing(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.textPlacing && window.__dcEditorPicker.textPlacing()",
  );
}
function notePickerTextInsert(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.noteTextInsert && window.__dcEditorPicker.noteTextInsert()",
  );
}
function startPickerInsertedTextEdit(
  webContents?: Dynamic,
  tid?: Dynamic,
  rootName?: Dynamic,
  typedText?: Dynamic,
  untilTimestamp?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.startInsertedTextEdit && window.__dcEditorPicker.startInsertedTextEdit(${JSON.stringify(tid)},${JSON.stringify(rootName)},${JSON.stringify(typedText)},${String(Math.round(untilTimestamp))})`,
  );
}
function pickerHeldTextKey(webContents?: Dynamic, key?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.heldTextKey && window.__dcEditorPicker.heldTextKey(${JSON.stringify(key)})`,
  );
}
function dropPickerInsertedTextEdit(
  webContents?: Dynamic,
  shouldKeep?: Dynamic,
): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.dropInsertedTextEdit && window.__dcEditorPicker.dropInsertedTextEdit(${shouldKeep ? "true" : "false"})`,
  );
}
function repostPickerTextEditState(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.repostTextEditState && window.__dcEditorPicker.repostTextEditState()",
  );
}
function startPickerTextEditAt(
  webContents?: Dynamic,
  clientX?: Dynamic,
  clientY?: Dynamic,
  tid?: Dynamic,
  rootName?: Dynamic,
): Dynamic {
  !Number.isFinite(clientX) ||
    !Number.isFinite(clientY) ||
    webContents.executeJavaScriptUnchecked(
      `window.__dcEditorPicker && window.__dcEditorPicker.startTextEditAt && window.__dcEditorPicker.startTextEditAt(${String(clientX)},${String(clientY)},${JSON.stringify(tid)},${JSON.stringify(rootName)})`,
    );
}
function applyPickerLink(webContents?: Dynamic, link?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    `window.__dcEditorPicker && window.__dcEditorPicker.applyLink && window.__dcEditorPicker.applyLink(${JSON.stringify(link)})`,
  );
}
function clearPickerPart(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.clearPart && window.__dcEditorPicker.clearPart()",
  );
}
function dropPickerLeftCopy(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.dropLeftCopy && window.__dcEditorPicker.dropLeftCopy()",
  );
}
function cancelPickerLinkEdit(webContents?: Dynamic): Dynamic {
  webContents.executeJavaScriptUnchecked(
    "window.__dcEditorPicker && window.__dcEditorPicker.cancelLinkEdit && window.__dcEditorPicker.cancelLinkEdit()",
  );
}
async function verifyPickerSelection(
  webContents?: Dynamic,
  tids?: Dynamic,
  rootName?: Dynamic,
  expectedState?: Dynamic,
): Promise<Dynamic> {
  try {
    return (
      (await webContents.executeJavaScript(
        `window.__dcEditorPicker ? window.__dcEditorPicker.verify(${JSON.stringify(tids)},${JSON.stringify(rootName)},${JSON.stringify(expectedState)}) : null`,
        4e3,
      )) ?? null
    );
  } catch {
    return null;
  }
}
async function finishPickerEdit(webContents?: Dynamic): Promise<Dynamic> {
  try {
    let value: Dynamic = await webContents.executeJavaScript(
      "window.__dcEditorPicker && window.__dcEditorPicker.finishEdit ? window.__dcEditorPicker.finishEdit() : null",
      2e3,
    );
    return typeof value == "object" ? value : null;
  } catch {
    return null;
  }
}
async function inspectPickerSelection(
  webContents?: Dynamic,
  tids?: Dynamic,
  rootName?: Dynamic,
  properties?: Dynamic,
  flags?: Dynamic,
): Promise<Dynamic> {
  let inspectExpression: Dynamic = `window.__dcEditorPicker ? window.__dcEditorPicker.inspect(${JSON.stringify(tids)},${JSON.stringify(rootName)},${JSON.stringify(properties)},${flags?.srgb ? "true" : "false"},${flags?.unpinned ? "true" : "false"},${flags?.ground ? "true" : "false"},${flags?.pose ? "true" : "false"}) : null`,
    script: Dynamic = flags?.afterPaint
      ? `new Promise(function(r){var d=false,go=function(){if(!d){d=true;r(${inspectExpression})}};requestAnimationFrame(function(){requestAnimationFrame(go)});setTimeout(go,250)})`
      : inspectExpression;
  try {
    return (
      (await webContents.executeJavaScript(script, PickerBridgeInspectTimeoutMs)) ?? null
    );
  } catch {
    return null;
  }
}
export {
  applyPickerLink,
  armPickerByClick,
  beginPickerMove,
  beginPickerTextPlacing,
  cancelPickerBox,
  cancelPickerDrag,
  cancelPickerLinkEdit,
  cancelPickerMove,
  clearPickerDropPlan,
  clearPickerPart,
  disablePicker,
  dropPickerInsertedTextEdit,
  dropPickerLeftCopy,
  enablePicker,
  enablePickerPanZoom,
  exitPickerMove,
  finishExitedPickerDrag,
  finishPickerEdit,
  finishPickerMove,
  formatPickerText,
  getPickerFirstTextFont,
  holdPickerStyle,
  inspectPickerSelection,
  installPicker,
  isPickerInstalled,
  normalizeCommentAnchor,
  normalizePickerRect,
  notePickerTextInsert,
  patchPickerStyle,
  pickAtPoint,
  PickerBridgeBoldItalicUnderlineSet,
  PickerBridgeConstant,
  PickerBridgeInspectTimeoutMs,
  PickerBridgeHandler,
  PickerBridgeJoin,
  PickerBridgeLabel,
  PickerBridgeLimit,
  PickerBridgePattern,
  PickerBridgeTagPattern,
  PickerBridgeFingerprintPattern,
  PickerBridgeStringify,
  pickerCommentAt,
  pickerCommentFor,
  pickerCommentIn,
  pickerCommentRects,
  pickerContextMenuAt,
  pickerContextMenuBySelection,
  pickerDragModifiers,
  pickerGesturePhase,
  pickerHeldTextKey,
  pickerHover,
  pickerHoverAt,
  pickerMoveHold,
  pickerPeerRects,
  pickerPenPreview,
  pickerVectorPreview,
  pickInBox,
  planPickerDrop,
  repaintPickerSelection,
  repostPickerChrome,
  repostPickerTextEditState,
  resizePickerSelection,
  returnPickerMove,
  setPickerDeepSelection,
  setPickerDirectiveMap,
  setPickerHiddenTags,
  setPickerHostScale,
  setPickerInteractive,
  setPickerMeasure,
  setPickerOverlayHidden,
  setPickerPanZoomArmed,
  setPickerReadOnly,
  setPickerRingsOnly,
  setPickerScrubbing,
  setPickerSelection,
  setPickerTextEditable,
  setPickerTheme,
  setPickerTool,
  settlePickerMove,
  startPickerInsertedTextEdit,
  startPickerTextEdit,
  startPickerTextEditAt,
  touchPickerMove,
  unpatchPickerStyle,
  updatePickerMove,
  verifyPickerSelection,
};
export function installEditorPickerBridge(): () => void {
  return () => {
    PickerBridgePattern = /^[0-9a-f]{16}$/;
    PickerBridgeHandler = (numericValue?: Dynamic): Dynamic =>
      numericValue != null && Number.isFinite(numericValue) ? String(numericValue) : "null";
    PickerBridgeStringify = (modifiers?: Dynamic): Dynamic =>
      JSON.stringify({
        alt: modifiers.alt === true,
        ctrl: modifiers.ctrl === true,
        meta: modifiers.meta === true,
        shift: modifiers.shift === true,
      });
    PickerBridgeJoin = (
      id?: Dynamic,
      tid?: Dynamic,
      clientX?: Dynamic,
      clientY?: Dynamic,
      modifiers?: Dynamic,
    ): Dynamic =>
      [
        "'" + id + "'",
        ...(tid == null ? [] : [String(tid)]),
        PickerBridgeHandler(clientX),
        PickerBridgeHandler(clientY),
        PickerBridgeStringify(modifiers),
      ].join(",");
    PickerBridgeLimit = 500;
    PickerBridgeTagPattern = /^[a-z][a-z0-9-]{0,30}$/;
    PickerBridgeConstant = 120;
    PickerBridgeFingerprintPattern = /^x[0-9a-z]{7}$/;
    PickerBridgeBoldItalicUnderlineSet = new Set([
      "bold",
      "italic",
      "underline",
      "ul",
      "ol",
      "link",
    ]);
    PickerBridgeLabel =
      "window.__dcEditorPicker&&window.__dcEditorPicker.afterPush&&window.__dcEditorPicker.afterPush()";
    PickerBridgeInspectTimeoutMs = 4e3;
  };
}
