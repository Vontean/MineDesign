import { createElement } from 'lucide';

// 插画构图归此模块管理，调用方只决定语义与放置位置。
export function createDocumentStack(icon) {
  const illustration = document.createElement('span');
  illustration.className = 'mdn-illustration mdn-document-stack';
  illustration.setAttribute('aria-hidden', 'true');
  illustration.append(createElement(icon));
  return illustration;
}
