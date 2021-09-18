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
    return null;
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

export function snake2Pascal(input: string) {
  const arr = input.split('-');
  for (let i = 0; i < arr.length; i++) {
    arr[i] = arr[i].slice(0, 1).toUpperCase() + arr[i].slice(1, arr[i].length);
  }
  return arr.join('');
}

export function readCommonJsPath(path: string) {
  for (const ext of ['', '.js']) {
    const targetPath = path + ext;
    if (fs.existsSync(targetPath) && fs.statSync(targetPath).isFile()) {
      return fs.readFileSync(targetPath, 'utf8');
    }
  }
  const pkgPath = Path.join(path, 'package.json');
  if (!fs.existsSync(pkgPath)) {
    throw new Error('Cannot resolve commonjs path ' + path);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  const entry = Path.join(path, pkg.main ?? 'index.js');
  return fs.readFileSync(entry, 'utf8');
}

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

export function ensureSuffix(str: string, suffix: string) {
  if (!str) {
    return null;
  }
  return str.endsWith(suffix) ? str : str + suffix;
}

export function getEntryTypes(pkg: any) {
  return ensureSuffix(pkg.types || pkg.typings, '.d.ts');
}

export function getDirectories(path: string) {
  return fs
    .readdirSync(path)
    .map(dir => Path.join(path, dir))
    .filter(dir => fs.statSync(dir).isDirectory())
    .map(dir => {
      return {
        name: Path.basename(dir),
        path: dir,
      };
    });
}

export function guessTypingEntry(pkgPath: string, pkg: any) {
  if (pkg.module) {
    const types = pkg.module.replace('.js', '.d.ts');
    if (fs.existsSync(Path.join(Path.dirname(pkgPath), types))) {
      return types;
    }
  }
  return null;
}
