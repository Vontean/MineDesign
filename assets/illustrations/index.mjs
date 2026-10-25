import { Files, FileWarning } from 'lucide';
import { createDocumentStack } from './document-stack.mjs';

const illustrations = {
  'document-loading': () => createDocumentStack(Files),
  'document-unavailable': () => createDocumentStack(FileWarning),
  'document-empty': () => createDocumentStack(Files),
};

export function createIllustration(name) {
  if (!Object.hasOwn(illustrations, name)) throw new RangeError(`未知插画：${name}`);
  const illustration = illustrations[name]();
  illustration.dataset.illustration = name;
  return illustration;
}
