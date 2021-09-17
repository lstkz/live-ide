import fetch from 'cross-fetch';
import https from 'https';

const agent = new https.Agent({
  keepAlive: true,
});

export interface BasicPackageInfo {
  name: string;
  version: string;
  module: string;
  dependencies: Record<string, string>;
  exports?: Record<string, string>;
}

export async function fetchPackage(name: string) {
  const url = `https://cdn.jsdelivr.net/npm/${name}/package.json`;
  const res = await fetch(url, {
    method: 'get',
    // @ts-ignore
    agent: agent,
  });
  if (res.status !== 200) {
    throw new Error(`Failed to fetch "${url}". Status: ${res.status}.`);
  }
  const pkg: BasicPackageInfo = await res.json();
  if (!pkg.dependencies) {
    pkg.dependencies = {};
  }
  return pkg;
}
