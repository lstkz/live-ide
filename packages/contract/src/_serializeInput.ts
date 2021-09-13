import { ContractConfig } from './types';
import { serializeObject } from './serializeObject';
import { combineObject } from './combineObject';

export function _serializeInput(
  config: ContractConfig,
  paramNames: string[],
  args: any[]
) {
  return paramNames.length
    ? serializeObject(config, combineObject(paramNames, args))
    : '{ }';
}
