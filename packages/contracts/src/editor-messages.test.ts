import { describe, expect, it } from 'vitest';
import { readEditorMessage, readHostMessage, SAVE_FILE_MAX_BYTES, saveFileName } from './editor-messages.ts';

describe('导出文件的消息（editor:save-file）', () => {
  it('父窗口认 ArrayBuffer 与 Blob，别的内容、空文件名不认', () => {
    const data = new ArrayBuffer(4);
    expect(readEditorMessage({ type: 'editor:save-file', requestId: 'r1', filename: 'Landing.html', data })).toEqual({
      type: 'editor:save-file',
      requestId: 'r1',
      filename: 'Landing.html',
      data,
    });
    const blob = new Blob(['%PDF']);
    expect(readEditorMessage({ type: 'editor:save-file', requestId: 'r2', filename: 'Deck.pdf', data: blob })?.type).toBe('editor:save-file');
    expect(readEditorMessage({ type: 'editor:save-file', requestId: 'r3', filename: 'a.html', data: 'text' })).toBeNull();
    expect(readEditorMessage({ type: 'editor:save-file', requestId: 'r4', filename: 'a.html', data: new Uint8Array(4) })).toBeNull();
    expect(readEditorMessage({ type: 'editor:save-file', requestId: 'r5', filename: '  ', data })).toBeNull();
    expect(readEditorMessage({ type: 'editor:save-file', requestId: 'x'.repeat(101), filename: 'a.html', data })).toBeNull();
  });

  it('超过上限的文件不认', () => {
    const big = { byteLength: SAVE_FILE_MAX_BYTES + 1 };
    Object.setPrototypeOf(big, ArrayBuffer.prototype);
    expect(readEditorMessage({ type: 'editor:save-file', requestId: 'r1', filename: 'a.zip', data: big })).toBeNull();
  });

  it('编辑器只认三种结果', () => {
    for (const outcome of ['saved', 'declined', 'failed'] as const) {
      expect(readHostMessage({ type: 'editor:save-file-result', requestId: 'r1', outcome })).toEqual({ type: 'editor:save-file-result', requestId: 'r1', outcome });
    }
    expect(readHostMessage({ type: 'editor:save-file-result', requestId: 'r1', outcome: 'ok' })).toBeNull();
    expect(readHostMessage({ type: 'editor:save-file-result', requestId: 1, outcome: 'saved' })).toBeNull();
  });
});

describe('saveFileName', () => {
  it('去掉路径分隔符、保留字符与控制字符，扩展名要在允许的范围里', () => {
    expect(saveFileName('Landing page.html')).toBe('Landing page.html');
    expect(saveFileName('../../etc/passwd.html')).toBe('etc passwd.html');
    expect(saveFileName('a\\b:c*d?"e<f>g|h.PDF')).toBe('a b c d e f g h.PDF');
    expect(saveFileName('首页\u0007设计.png')).toBe('首页 设计.png');
    expect(saveFileName('  .hidden.zip  ')).toBe('hidden.zip');
    expect(saveFileName('design-html.zip')).toBe('design-html.zip');
  });

  it('没有扩展名、扩展名不认得、太长时返回 null', () => {
    expect(saveFileName('README')).toBeNull();
    expect(saveFileName('.html')).toBeNull();
    expect(saveFileName('run.exe')).toBeNull();
    expect(saveFileName('page.html.sh')).toBeNull();
    expect(saveFileName('x.constructor')).toBeNull();
    expect(saveFileName(`${'a'.repeat(260)}.html`)).toBeNull();
  });
});

describe('MineDesign 右侧面板的反馈消息', () => {
  it('编辑器认反馈草稿与发送状态，只保留约定字段', () => {
    const items = [{ id: 'a', n: 1, label: '工作台 › 按钮', text: '更醒目', extra: true }];
    expect(readHostMessage({ type: 'editor:feedback', items, status: '已复制反馈', canSend: true, busy: false })).toEqual({
      type: 'editor:feedback',
      items: [{ id: 'a', n: 1, label: '工作台 › 按钮', text: '更醒目' }],
      status: '已复制反馈',
      canSend: true,
      busy: false,
    });
    expect(readHostMessage({ type: 'editor:feedback', items: [{ id: 'a', n: 1, label: 'x', text: 'y'.repeat(4001) }], status: '', canSend: true, busy: false })).toBeNull();
    expect(readHostMessage({ type: 'editor:feedback', items: [], status: '', canSend: 'yes', busy: false })).toBeNull();
    expect(readHostMessage({ type: 'editor:set-panel', open: false })).toEqual({ type: 'editor:set-panel', open: false });
  });

  it('父窗口按动作核对字段：定位与删除要 id，复制与发送要补充说明', () => {
    expect(readEditorMessage({ type: 'editor:feedback-action', action: 'remove', id: 'a' })).toEqual({ type: 'editor:feedback-action', action: 'remove', id: 'a' });
    expect(readEditorMessage({ type: 'editor:feedback-action', action: 'send', message: '整体更紧凑' })).toEqual({
      type: 'editor:feedback-action',
      action: 'send',
      message: '整体更紧凑',
    });
    expect(readEditorMessage({ type: 'editor:feedback-action', action: 'send', id: 'a' })).toBeNull();
    expect(readEditorMessage({ type: 'editor:feedback-action', action: 'delete', id: 'a' })).toBeNull();
    expect(readEditorMessage({ type: 'editor:panel', open: true })).toEqual({ type: 'editor:panel', open: true });
    expect(readEditorMessage({ type: 'editor:panel', open: 1 })).toBeNull();
  });
});

describe('MineDesign 顶栏的视图消息', () => {
  const view = {
    scale: 0.26,
    minScale: 0.05,
    maxScale: 8,
    presets: [0.5, 1],
    toggles: [{ id: 'Layout guides', label: 'Layout guides', checked: false }],
    canUndo: true,
    canRedo: false,
    play: [{ label: 'Prototypes', items: [{ file: 'Login.dc.html', title: '登录' }] }],
  };
  it('父窗口认视图状态，比例必须为正数', () => {
    expect(readEditorMessage({ type: 'editor:view', ...view })).toEqual({ type: 'editor:view', ...view });
    expect(readEditorMessage({ type: 'editor:view', ...view, scale: 0 })).toBeNull();
    expect(readEditorMessage({ type: 'editor:view', ...view, play: [{ label: 'x', items: [{ file: 1 }] }] })).toBeNull();
  });
  it('编辑器按动作核对视图操作', () => {
    expect(readHostMessage({ type: 'editor:view-action', action: 'fit' })).toEqual({ type: 'editor:view-action', action: 'fit' });
    expect(readHostMessage({ type: 'editor:view-action', action: 'zoom', scale: 2 })).toEqual({ type: 'editor:view-action', action: 'zoom', scale: 2 });
    expect(readHostMessage({ type: 'editor:view-action', action: 'play', file: 'Login.dc.html' })).toEqual({ type: 'editor:view-action', action: 'play', file: 'Login.dc.html' });
    expect(readHostMessage({ type: 'editor:view-action', action: 'zoom', scale: -1 })).toBeNull();
    expect(readHostMessage({ type: 'editor:view-action', action: 'reload' })).toBeNull();
    expect(readHostMessage({ type: 'editor:locale', locale: 'en' })).toEqual({ type: 'editor:locale', locale: 'en' });
    expect(readHostMessage({ type: 'editor:locale', locale: 'fr' })).toBeNull();
  });
});
