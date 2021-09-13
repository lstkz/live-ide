import { Handler } from '../types';

function wrapRoute(fn: Handler): Handler {
  return (req, res, next) => {
    try {
      const result = fn(req, res, next) as any;
      if (result && result.catch) {
        result.catch(next);
      }
    } catch (e) {
      next(e);
    }
  };
}

export function wrapExpress(obj: Handler | Handler[]) {
  if (Array.isArray(obj)) {
    return obj.map(wrapRoute);
  }
  return wrapRoute(obj);
}
