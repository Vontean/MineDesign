// 画布说明：便签工具在画板上方放一张便签并输入文字，写入 canvas.json 的 notes。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();

    await page.mouse.click(694, 862);
    await page.mouse.click(300, 120);
    await session.settle();
    await page.keyboard.type('便签内容');
    await page.keyboard.press('Escape');
    await session.saved();
    await session.shot('note');
  },
};
