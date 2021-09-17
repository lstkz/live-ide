export function combineObject(params: string[], arr: any[]): object {
  const ret: any = {};
  arr.forEach((arg, i) => {
    ret[params[i]] = arg;
  });
  return ret;
}
