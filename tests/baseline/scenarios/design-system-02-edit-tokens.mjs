// token 修改：改一个颜色（取色器里输入十六进制）、一个间距、一个圆角；等保存完成后文件已写回。
export default {
  fixture: 'design-system',
  kind: 'design-system',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();

    await editor.getByTestId('ds-jump-colors').click();
    await session.settle();
    await editor.getByTestId('ds-hex-accent-light').click();
    const hex = editor.getByRole('dialog').getByRole('textbox').first();
    await hex.fill('#1F6F5F');
    await page.keyboard.press('Enter');
    await page.keyboard.press('Escape');
    await session.saved();
    await session.shot('color');

    await editor.getByTestId('ds-jump-spacing').click();
    await session.settle();
    await editor.getByLabel('space-4 value').fill('18');
    await page.keyboard.press('Enter');
    await session.saved();

    await editor.getByTestId('ds-jump-corners').click();
    await session.settle();
    await editor.getByLabel('radius-md value').fill('10');
    await page.keyboard.press('Enter');
    await session.saved();
    await session.shot('spacing-radius');
  },
};
