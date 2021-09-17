import { MethodEntry } from './types';

export class ContractError extends Error {
  constructor(public original: Error, public entries: MethodEntry[]) {
    super('ContractError: ' + original.message);
  }
}
