import fetch from 'cross-fetch';
import fs from 'fs';
import Path from 'path';
import https from 'https';

const agent = new https.Agent({
  keepAlive: true,
});

const CACHE_DIR = Path.join(__dirname, '..', '..', '..', '..', '.npm-cache');

export async function fetchNpmTar(name: string, version: string) {
  const diskPath = Path.join(CACHE_DIR, `${name}@${version}`);
  if (!fs.existsSync(diskPath)) {
    const res = await fetch(
      `https://registry.npmjs.org/${name}/-/${name}-${version}.tgz`,
      {
        method: 'get',
        // @ts-ignore
        agent: agent,
      }
    );
    if (res.status !== 200) {
      throw new Error(
        `Failed to fetch ${name}@${version}. Status: ${res.status}.`
      );
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(diskPath, buffer);
  }
  return diskPath;
}
