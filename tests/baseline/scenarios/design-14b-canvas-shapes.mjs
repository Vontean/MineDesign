// 画布图形：R 选矩形并拖出一个。已知缺陷：当前构建画出矩形后编辑器白屏（React error #31），
// 图形也没写入 canvas.json。基线如实记录这个现状，缺陷修复后本场景会不一致，需重新记录。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();

    await page.keyboard.press('r');
    await page.mouse.move(700, 90);
    await page.mouse.down();
    await page.mouse.move(860, 170, { steps: 10 });
    await page.mouse.up();
    await session.saved();
  },
};
