import { AsyncLocalStorage } from 'async_hooks';
import { ClientSession } from 'mongodb';

export const dbSessionStorage = new AsyncLocalStorage<ClientSession>();
