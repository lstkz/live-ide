import { SchemaMap } from 'schema';
import {
  Contract,
  ContractMeta,
  ContractConfig,
  ContractOptions,
} from './types';
import { wrapValidate } from './wrapValidate';
import { wrapLog } from './wrapLog';
import { ContractError } from './ContractError';
import { _serializeInput } from './_serializeInput';

export const _createContract =
  (config: ContractConfig) => (signature: string) => {
    const contract = {} as any;
    let options: ContractOptions = {
      removeOutput: false,
    };
    let params: string[] = [];
    let schema: SchemaMap | null = null;

    const meta: ContractMeta<any> = {
      getSchema: () => schema,
      getParams: () => [...params],
      getSignature: () => signature,
    };

    contract.params = (...args: string[]) => {
      params = args;
      return contract;
    };

    contract.schema = (arg: any) => {
      schema = arg;
      return contract;
    };

    contract.returns = () => {
      return contract;
    };

    contract.config = (value: any) => {
      config = { ...config, ...value };
      return contract;
    };

    contract.options = (value: any) => {
      options = { ...options, ...value };
      return contract;
    };

    contract.fn = (fn: any) => {
      const wrappedFunction = async (...args: any[]) => {
        const withValidation = wrapValidate({
          keysSchema: schema,
          method: fn,
          paramNames: params,
        });

        const withLogging = wrapLog({
          signature,
          method: withValidation,
          paramNames: params,
          config,
          removeOutput: options.removeOutput,
        });
        try {
          return await withLogging(...args);
        } catch (e: any) {
          const input = _serializeInput(config, params, args);
          if (e instanceof ContractError) {
            e.entries.unshift({
              signature,
              input,
            });
            throw e;
          } else {
            if (process.env.NODE_ENV === 'test') {
              throw e;
            }
            throw new ContractError(e, [
              {
                signature,
                input,
              },
            ]);
          }
        }
      };

      const ret = Object.assign(wrappedFunction, meta) as any;
      return ret;
    };

    return contract as Contract;
  };
