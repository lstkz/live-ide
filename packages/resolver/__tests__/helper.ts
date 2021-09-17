import Path from 'path';
import fs from 'fs';

export function writeFileMap(
  basedir: string,
  fileMap: Record<string, string | object>
) {
  Object.keys(fileMap).map(subPath => {
    const fullPath = Path.join(basedir, subPath);
    fs.mkdirSync(Path.dirname(fullPath), { recursive: true });
    const content = fileMap[subPath];
    fs.writeFileSync(
      fullPath,
      typeof content === 'string' ? content : JSON.stringify(content)
    );
  });
}
