import { convertTheme } from 'monaco-vscode-textmate-theme-converter';
import vsCodeTheme from '../../../packages/code-editor/src/themes/dark-theme-new.json';
import fs from 'fs';
import path from 'path';

const converted = convertTheme(vsCodeTheme as any);
fs.writeFileSync(
  path.join(
    __dirname,
    '../../../packages/code-editor/src/themes/new-theme.json'
  ),
  JSON.stringify(converted, null, 2)
);
