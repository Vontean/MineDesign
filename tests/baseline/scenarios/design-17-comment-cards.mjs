// 画布评论卡片：留两条位置相邻的评论，两张卡片都显示且不重叠；在卡片上编辑一条并保存；
// 用缩放菜单的开关隐藏全部卡片再显示；缩小到 25%（低于卡片的显示阈值）时只剩编号圆点。
const cardBoxes = editor => editor.evaluate(() =>
  [...document.querySelectorAll('[data-testid="mdn-comment-card"]')].map(card => {
    const { left, top, right, bottom } = card.getBoundingClientRect();
    return { left, top, right, bottom };
  }));

async function expectCards(editor, count) {
  const boxes = await cardBoxes(editor);
  if (boxes.length !== count) throw new Error(`应有 ${count} 张评论卡片，实际 ${boxes.length} 张`);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    if (a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom) throw new Error('评论卡片相互重叠');
  }
}

export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();

    await page.getByRole('button', { name: 'Show side panel' }).click();
    await session.settle();
    await editor.getByRole('button', { name: /^Comment/ }).click();
    // 标题与副标题上各留一条，两个目标点相距不到 60px
    await page.mouse.click(137, 380);
    await session.settle();
    await page.keyboard.type('标题再大一点');
    await page.keyboard.press('Enter');
    await session.settle();
    await page.mouse.click(180, 430);
    await session.settle();
    await page.keyboard.type('副标题与标题的间距收紧一些');
    await page.keyboard.press('Enter');
    await session.shot('two-cards');
    await expectCards(editor, 2);

    // 悬停第一张卡片，点铅笔就地编辑，Enter 保存
    const first = editor.getByTestId('mdn-comment-card').filter({ hasText: '标题再大一点' });
    await first.hover();
    await first.getByTestId('mdn-comment-card-edit').click();
    await page.keyboard.type('，字重也加粗');
    await page.keyboard.press('Enter');
    await session.settle();
    await session.shot('edited');
    await expectCards(editor, 2);

    // 缩放菜单里的「Comment cards」开关：隐藏后只剩编号圆点，再打开恢复
    await page.locator('#zoom').click();
    await page.getByRole('menuitemcheckbox', { name: 'Comment cards' }).click();
    await session.shot('hidden');
    await expectCards(editor, 0);
    await page.locator('#zoom').click();
    await page.getByRole('menuitemcheckbox', { name: 'Comment cards' }).click();
    await session.shot('shown');
    await expectCards(editor, 2);

    // 缩到 25%：卡片会挤成一团，只显示编号圆点
    await page.locator('#zoom').click();
    await page.getByRole('menuitemradio', { name: '25%' }).click();
    await session.shot('zoomed-out');
    await expectCards(editor, 0);
  },
};
