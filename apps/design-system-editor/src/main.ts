import '@minedesign/design-system-runtime/app.css';
import { createDesignSystemRuntime } from '@minedesign/design-system-runtime';
import { installDesignSystemEditorHost } from '@minedesign/editor-host/design-system';

// 先装宿主（globalThis.designSystemHost），再照原页面的入口启动运行时：运行时启动时就读宿主能力（docs/design/canvas §10.2、§10.3）。
// MineDesign：在 Codex 中以 srcdoc 装载，路由根由插件页给出（FORK.md）
installDesignSystemEditorHost({ base: (globalThis as { __MDN_FRAME__?: { base?: string } }).__MDN_FRAME__?.base });
createDesignSystemRuntime();
