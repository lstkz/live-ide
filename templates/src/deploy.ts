import { APIClient } from 'shared';
import Path from 'path';
import fs from 'fs';

const token = process.env.LV_ADMIN_TOKEN;
const url = process.env.LV_API_URL || 'http://localhost:3001';
if (!token) {
  throw new Error('LV_ADMIN_TOKEN is not set');
}

export const api = new APIClient(url, () => token);

export function walk(dir: string) {
  const results: string[] = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = Path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results.push(...walk(file));
    } else {
      results.push(file);
    }
  });
  return results;
}

function _getFileMap(name: string) {
  const base = Path.join(__dirname, '..', name);
  return walk(base).map(path => {
    const relative = Path.relative(base, path);
    return {
      name: Path.basename(relative),
      directory: Path.dirname(relative),
      content: fs.readFileSync(path, 'utf8'),
    };
  });
}

async function start() {
  await api.template_createTemplate({
    id: 'react-ts',
    name: 'React (Typescript)',
    files: _getFileMap('react-ts'),
  });
  await api.template_createTemplate({
    id: 'react-js',
    name: 'React',
    files: _getFileMap('react-js'),
  });
}

void start();
