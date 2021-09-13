import { ContractConfig } from './types';
import { _createContract } from './_createContract';

const defaultConfig: ContractConfig = {
  removeFields: ['password', 'token', 'accessToken'],
  debug: true,
  depth: 4,
  maxArrayLength: 30,
  debugEnter: (signature, formattedInput) => {
    // tslint:disable-next-line:no-console
    console.log(`ENTER ${signature}:`, formattedInput);
  },
  debugExit: (signature, formattedOutput) => {
    // tslint:disable-next-line:no-console
    console.log(`EXIT ${signature}:`, formattedOutput);
  },
};

export function initialize(config: Partial<ContractConfig> = {}) {
  return {
    createContract: _createContract({
      ...defaultConfig,
      ...config,
    }),
  };
}
