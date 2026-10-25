import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './service.mjs';
export const VERSION=JSON.parse(readFileSync(path.join(ROOT,'package.json'),'utf8')).version;
export const APP_URI=`ui://minedesign/${VERSION}/editor.html`;
const icon=name=>`data:image/svg+xml;base64,${readFileSync(path.join(ROOT,'assets/brand',name)).toString('base64')}`;
export const BRAND_ICONS=[{src:icon('minedesign-icon.svg'),mimeType:'image/svg+xml',sizes:['24x24']},...['light','dark'].map(theme=>({src:icon(`minedesign-icon-${theme}.svg`),mimeType:'image/svg+xml',sizes:['24x24'],theme}))];
export const BRAND_STATES={default:icon('minedesign-icon.svg'),selected:icon('minedesign-icon-selected.svg')};
