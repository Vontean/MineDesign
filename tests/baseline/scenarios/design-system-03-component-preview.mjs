// 组件预览：等 Button 与 Badge 的预览真实渲染后取证。
export default {
  fixture: 'design-system',
  kind: 'design-system',
  async run(session) {
    await session.open();
    const editor = session.editor();
    await editor.getByTestId('ds-jump-components').click();
    await editor.getByTestId('ds-components').waitFor();
    // 预览在 iframe 内异步渲染，等到按钮与徽标文字出现
    const preview = name => editor.getByTestId(`ds-comp-preview-${name}`);
    await preview('Button').frameLocator('iframe').getByText('创建任务').waitFor();
    await preview('Badge').frameLocator('iframe').getByText('已完成').waitFor();
    await session.shot('previews');
  },
};
