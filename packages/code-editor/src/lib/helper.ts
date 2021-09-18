import * as R from 'remeda';
export function doFn<T>(fn: () => T): T {
  return fn();
}

export function compareLibs(list1: string[], list2: string[]) {
  return (
    R.difference(list1, list2).length + R.difference(list1, list2).length > 0
  );
}

export function getLibs(pkg: any) {
  if (!pkg.dependencies || typeof pkg.dependencies !== 'object') {
    return null;
  }
  const ret: string[] = [];
  for (const [key, value] of Object.entries(pkg.dependencies)) {
    if (typeof value !== 'string' || !value.trim()) {
      return null;
    }
    ret.push(key + '@' + value);
  }
  return ret;
}
