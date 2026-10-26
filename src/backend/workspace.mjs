import { serviceError } from '@minedesign/contracts/service-errors';
import fs from 'node:fs/promises';
import path from 'node:path';

export async function inside(root, given) {
  const base = await fs.realpath(root);
  const target = await fs.realpath(path.resolve(base, given));
  const relative = path.relative(base, target);
  if (relative === '..' || relative.startsWith(`..${path.sep}`) || path.isAbsolute(relative)) throw serviceError('outside_workspace','路径超出本次授权工作区');
  return target;
}
