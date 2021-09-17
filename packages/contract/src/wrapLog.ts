import { serializeObject } from './serializeObject';
import { ContractConfig } from './types';
import { _serializeInput } from './_serializeInput';

export interface WrapLogOptions<T> {
  method: T;
  signature: string;
  paramNames: string[];
  removeOutput: boolean;
  config: ContractConfig;
}

export function wrapLog<T extends (...args: any[]) => any>(
  options: WrapLogOptions<T>
): T {
  const { method, signature, paramNames, removeOutput, config } = options;

  const logExit = (output: string) => {
    if (!config.debug) {
      return;
    }
    const formattedOutput = removeOutput
      ? '<removed>'
      : serializeObject(config, output);
    config.debugExit(signature, formattedOutput);
    return output;
  };

  const logEnter = (args: any) => {
    if (!config.debug) {
      return;
    }
    const formattedInput = _serializeInput(config, paramNames, args);
    config.debugEnter(signature, formattedInput);
  };

  return (async function logDecorator(...args: any[]) {
    logEnter(args);
    const result = await method(...args);
    logExit(result);
    return result;
  } as any) as T;
}
