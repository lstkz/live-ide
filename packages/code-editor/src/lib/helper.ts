export function doFn<T>(fn: () => T): T {
  return fn();
}
