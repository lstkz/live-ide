import fetch from 'cross-fetch';
import https from 'https';

const agent = new https.Agent({
  keepAlive: true,
});

export interface BasicPackageInfo {
  name: string;
  version: string;
  dependencies: Record<string, string>;
}

export async function fetchPackage(name: string) {
  const res = await fetch(`https://cdn.jsdelivr.net/npm/${name}/package.json`, {
    method: 'get',
    // @ts-ignore
    agent: agent,
  });
  if (res.status !== 200) {
    throw new Error(`Failed to fetch ${name}. Status: ${res.status}.`);
  }
  const pkg: BasicPackageInfo = await res.json();
  if (!pkg.dependencies) {
    pkg.dependencies = {};
  }
  return pkg;
}
