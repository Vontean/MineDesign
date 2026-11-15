// 属性编辑：画布上双击改文字、浮动工具栏改颜色与加粗，再经属性面板改宽度与文字颜色；每步写回 Main.dc.html。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();
    const panel = editor.getByTestId('dc-edit-side-panel');

    // 画布上双击「工作台」主标题进入文字编辑，整段替换
    await page.mouse.click(137, 380);
    await page.mouse.dblclick(137, 380);
    await page.keyboard.press('ControlOrMeta+a');
    await page.keyboard.type('设计工作台');
    await page.keyboard.press('Escape');
    await session.saved();
    await session.shot('canvas-text');

    // 选中说明段落，用浮动工具栏改颜色并加粗（浮动工具栏只在侧栏关闭时出现）
    await page.mouse.click(137, 430);
    await editor.getByTestId('mega-text-color').click();
    await editor.getByTestId('mega-text-color-#0d0d0d').click();
    await editor.getByTestId('mega-text-bold').click();
    await session.saved();
    await session.shot('toolbar-color-bold');

    await page.getByRole('button', { name: 'Show side panel' }).click();
    await page.mouse.click(137, 380);
    await session.shot('panel-heading');

    await panel.getByLabel('Width', { exact: true }).fill('600');
    await page.keyboard.press('Enter');
    await session.saved();
    await session.shot('panel-width');

    await editor.getByTestId('dc-color-color').click();
    await editor.getByTestId('dc-fill-popover').getByRole('button', { name: '#666666' }).click();
    await page.keyboard.press('Escape');
    await session.saved();
    await session.shot('panel-color');
  },
};
