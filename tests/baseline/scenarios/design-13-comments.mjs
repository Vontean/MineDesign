// 评论：评论工具点元素与框选区域各留一条，在右侧「评论」标签里定位，再删除一条。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();

    await page.getByRole('button', { name: 'Show side panel' }).click();
    await session.settle();
    await editor.getByRole('button', { name: /^Comment/ }).click();
    await page.mouse.click(137, 380);
    await session.settle();
    await page.keyboard.type('标题再大一点');
    await page.keyboard.press('Enter');
    await session.shot('element-comment');

    // 拖出一块空白区域作为区域评论
    await page.mouse.move(100, 640);
    await page.mouse.down();
    await page.mouse.move(400, 740, { steps: 10 });
    await page.mouse.up();
    await session.settle();
    await page.keyboard.type('这里留白太多');
    await page.keyboard.press('Enter');
    await session.shot('region-comment');

    // 点列表里第二条定位，再悬停并点垃圾桶删除
    await editor.getByText('这里留白太多').last().click();
    await session.shot('located');
    await page.mouse.move(1280, 185);
    await page.mouse.click(1414, 171);
    await session.settle();
    await session.shot('deleted');
  },
};
