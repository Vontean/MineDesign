// 画板排布：拖动名称条移动画板，拖动右下角改尺寸；两次改动写回 canvas.json。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const drag = async (from, to) => {
      await page.mouse.move(from.x, from.y);
      await page.mouse.down();
      await page.mouse.move(to.x, to.y, { steps: 10 });
      await page.mouse.up();
    };

    // 「工作台」的名称条在 (70, 247)，向右下移动
    await drag({ x: 70, y: 247 }, { x: 170, y: 307 });
    await session.saved();
    await session.shot('moved');

    // 选中「项目详情」后拖它的右下角缩小
    await page.mouse.click(880, 247);
    await session.shot('detail-selected');
    await drag({ x: 1392, y: 767 }, { x: 1300, y: 700 });
    await session.saved();
    await session.shot('resized');
  },
};
