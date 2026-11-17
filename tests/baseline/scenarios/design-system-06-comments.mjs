// 评论：开启评论，选中一个条目写评论，在反馈侧栏点回目标，编辑并保存，再删除。
export default {
  fixture: 'design-system',
  kind: 'design-system',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();

    await page.getByRole('button', { name: 'Comment', exact: true }).click();
    await editor.getByTestId('ds-jump-spacing').click();
    await session.settle();
    // 评论模式下条目上盖着透明层，用真实指针点它的中心
    const box = await editor.getByTestId('ds-spacing-name-space-4').boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await session.settle();
    await page.keyboard.type('这一档间距偏小');
    await page.keyboard.press('Enter');
    await session.shot('commented');

    await editor.getByTestId('ds-jump-readme').click();
    await session.settle();
    await page.getByText('Token “space-4”').click();
    await session.settle();
    await session.shot('located');

    // 悬停时出现的编辑按钮：进入编辑，键盘补充文字后 Enter 保存
    await page.getByRole('button', { name: 'Edit comment 1' }).click({ force: true });
    await page.keyboard.type('，改成 6px');
    await session.shot('editing');
    await page.keyboard.press('Enter');
    await session.settle();
    await session.shot('edited');

    await page.getByRole('button', { name: 'Delete comment 1' }).click({ force: true });
    await session.settle();
    await session.shot('deleted');
  },
};
