import type { en } from './errors.en.ts';
export const zh = {
  "errors.operation_failed": "暂时无法完成此操作，重试。",
  "errors.unknown_editor": "不支持此编辑器类型。",
  "errors.invalid_document": "此文件夹中没有有效的设计稿或设计系统。检查文件后重新打开。",
  "errors.unknown_document": "此作品已关闭，重新打开后再试。",
  "errors.asset_invalid_group": "此素材组名称不可用，换一个名称。",
  "errors.asset_not_supported": "不支持此文件的格式或大小，选择符合要求的文件。",
  "errors.asset_too_large": "文件过大，选择较小的文件。",
  "errors.invalid_annotations": "无法保存这些评论。检查格式与长度后重试。",
  "errors.outside_workspace": "此文件不在已授权的工作区内，选择工作区中的文件。",
  "errors.request_too_large": "本次提交内容过多，减少内容后重试。",
  "errors.invalid_host": "此连接未获授权，重新打开 MineDesign。",
  "errors.invalid_origin": "此页面无法访问作品，在 MineDesign 中重新打开。",
  "errors.ENOENT": "找不到此文件或文件夹，检查位置后重新打开。",
  "errors.EACCES": "无法访问此文件，检查权限后重试。",
  "errors.conflict": "文件已在其他位置被修改。保留当前编辑，核对最新版本后再保存。"
} satisfies Record<keyof typeof en, string>;
