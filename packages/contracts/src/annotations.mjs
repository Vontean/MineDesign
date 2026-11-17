// 批注（评论）的状态与转换：外壳、后端与编辑器面板共用这一处规则。
// 状态：draft 草稿 → sent 已发送 → resolved 已解决。旧数据没有 status，视为草稿。
// 所有函数不修改入参、返回新数组；时间由调用方传入（ISO 字符串）。

export const ANNOTATION_STATES = Object.freeze(['draft', 'sent', 'resolved']);

/** 补上默认状态；未知状态也按草稿处理。 */
export function normalizeAnnotation(note) {
  return ANNOTATION_STATES.includes(note?.status) ? { ...note } : { ...note, status: 'draft' };
}

export function normalizeAnnotations(notes) {
  return Array.isArray(notes) ? notes.map(normalizeAnnotation) : [];
}

/**
 * 改一条草稿或已发送评论的文字，目标不变。空文字、文字未变、已解决或找不到时原样返回。
 * 已发送的评论改过后回到草稿：去掉发送时间与来源版本，保存时按当前作品版本重新记录。
 */
export function editAnnotation(notes, id, text) {
  const value = typeof text === 'string' ? text.trim() : '';
  return normalizeAnnotations(notes).map(note => {
    if (note.id !== id || !value || note.status === 'resolved' || note.text === value) return note;
    if (note.status === 'draft') return { ...note, text: value };
    const { sentAt: _sentAt, sourceVersion: _sourceVersion, ...rest } = note;
    return { ...rest, text: value, status: 'draft' };
  });
}

/** 把一组草稿标为已发送；不是草稿或找不到的 id 忽略。 */
export function markAnnotationsSent(notes, ids, at) {
  const wanted = new Set(ids);
  return normalizeAnnotations(notes).map(note => wanted.has(note.id) && note.status === 'draft' ? { ...note, status: 'sent', sentAt: at } : note);
}

/** 把一组草稿或已发送评论标为已解决；已解决或找不到的 id 忽略。 */
export function markAnnotationsResolved(notes, ids, at) {
  const wanted = new Set(ids);
  return normalizeAnnotations(notes).map(note => wanted.has(note.id) && note.status !== 'resolved' ? { ...note, status: 'resolved', resolvedAt: at } : note);
}

/** 还没发送的评论：发送内容与过期判定只看它们。 */
export function draftAnnotations(notes) {
  return normalizeAnnotations(notes).filter(note => note.status === 'draft');
}

/** 列表与画布编号显示的评论：草稿与已发送，按原顺序。 */
export function visibleAnnotations(notes) {
  return normalizeAnnotations(notes).filter(note => note.status !== 'resolved');
}

/** 有草稿或补充说明时才能发送。 */
export function canSendFeedback(notes, message) {
  return draftAnnotations(notes).length > 0 || (typeof message === 'string' && message.trim() !== '');
}

/** 发送给 Agent（以及复制）的一轮反馈：只含草稿。 */
export function feedbackContent({ document, editor, annotations, message }) {
  return JSON.stringify({ kind: 'minedesign-feedback', document, editor, annotations: draftAnnotations(annotations), message }, null, 2);
}
