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
