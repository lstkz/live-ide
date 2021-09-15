import fs from 'fs';
import Path from 'path';
import md5 from 'md5';

export function removePackageVersion(name: string) {
  const idx = name.lastIndexOf('@');
  if (idx <= 0) {
    return name;
  }
  return name.substring(0, idx);
}

export function convertToEsmBundleName(name: string) {
  if (name[0] === '@') {
    return '@esm-bundle/' + name.substring(1).replace('/', '__');
  }
  return '@esm-bundle/' + name;
}

export function splitVersion(name: string) {
  const idx = name.lastIndexOf('@');
  if (idx <= 0) {
    return { name, version: '*' };
  }
  return { name: name.substring(0, idx), version: name.substring(idx + 1) };
}

export function findPackage(baseDir: string, lib: string) {
  let path = Path.join(baseDir, lib, 'package.json');
  if (!fs.existsSync(path)) {
    path = Path.join(baseDir, extractLibName(lib), 'package.json');
  }
  if (!fs.existsSync(path)) {
    throw new Error('Cannot find package.json for ' + lib);
  }
  return {
    pkgPath: path,
    pkg: JSON.parse(fs.readFileSync(path, 'utf8')),
  };
}

export function extractLibName(path: string) {
  const parts = path.includes('/node_modules/')
    ? path.split('/node_modules/')[1].split('/')
    : path.split('/');
  if (parts[0][0] === '@') {
    return parts.slice(0, 2).join('/');
  }
  return parts[0];
}

export function getHash(content: string) {
  return md5(content).substring(0, 10);
}
