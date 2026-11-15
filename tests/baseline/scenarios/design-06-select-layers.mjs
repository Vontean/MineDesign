// 选中与层级定位：画板名称条选中画板，Enter 进入下一层、Tab 同层切换、Esc 返回上层，图层面板点选，画布上直接点选。
export default {
  fixture: 'design',
  async run(session) {
    const { page } = session;
    await session.open();
    const editor = session.editor();
    const key = async (...keys) => { for (const k of keys) await page.keyboard.press(k); };

    await page.getByRole('button', { name: 'Show side panel' }).click();
    await page.mouse.click(70, 247);
    await session.shot('artboard-selected');

    // 进入画板选中第一个元素，再 Tab 到同层第四个（Section）
    await key('Enter', 'Tab', 'Tab', 'Tab');
    await session.shot('tab-to-section');

    // 进入 Section 到第一张卡片，Tab 到第二张
    await key('Enter', 'Tab');
    await session.shot('second-card');

    await key('Escape');
    await session.shot('back-to-section');
    await key('Escape', 'Escape');
    await session.shot('back-to-artboard');

    await editor.getByTestId('dc-outline').getByLabel(/^Heading, /).click();
    await session.shot('layer-heading');

    // 画布上直接点选「项目详情」的说明文字
    await page.mouse.click(980, 430);
    await session.shot('canvas-click');
  },
};
