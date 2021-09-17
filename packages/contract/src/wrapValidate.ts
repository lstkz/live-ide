import { S, validate, SchemaMap } from 'schema';
import { combineObject } from './combineObject';

export interface WrapValidateOptions<T> {
  keysSchema: SchemaMap | null;
  method: T;
  paramNames: string[];
}

export function wrapValidate<T extends (...args: any[]) => any>(
  options: WrapValidateOptions<T>
): T {
  const { keysSchema, method, paramNames } = options;

  return ((async (...args: any[]) => {
    const value = combineObject(paramNames, args);
    const normalized = validate(value, S.object().keys(keysSchema || {}));
    const newArgs: any[] = [];
    // V will normalize values
    // for example string number '1' to 1
    // if schema type is number
    paramNames.forEach(param => {
      newArgs.push(normalized[param]);
    });
    return method(...newArgs);
  }) as any) as T;
}
