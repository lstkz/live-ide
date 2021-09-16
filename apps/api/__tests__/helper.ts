import { ContractMeta } from 'contract';
import { ObjectID } from 'mongodb2';
import { Convert } from 'schema';
import loadRoutes from '../src/common/loadRoutes';
import { connect, disconnect, getAllCollection } from '../src/db';
import { Handler } from '../src/types';

export async function initDb() {
  await connect();
}

export async function resetDb() {
  await Promise.all(
    getAllCollection().map(collection => collection.deleteMany({}))
  );
}

export function getId(nr: number) {
  return ObjectID.createFromHexString(nr.toString().padStart(24, '0'));
}

export function getUUID(nr: number) {
  return `00000000-0000-4000-8000-` + nr.toString().padStart(12, '0');
}

export function setupDb() {
  expect.addSnapshotSerializer({
    print: () => '<Random ObjectID>',
    test: val => {
      let hex = '';
      if (val instanceof ObjectID) {
        hex = val.toHexString();
      } else if (typeof val === 'string' && /^[a-f0-9]{24}$/.test(val)) {
        hex = val;
      }
      return !!hex && !hex.startsWith('0'.repeat(12));
    },
  });

  beforeAll(initDb);
  beforeEach(resetDb);
  afterAll(() => {
    return disconnect(true);
  });
}

export function getTokenOptions(token: string) {
  return {
    req: {
      headers: {
        authorization: token,
      },
    },
  };
}

type ExtractParams<T> = T extends ContractMeta<infer S>
  ? Omit<
      Convert<{
        [P in keyof S]: Convert<S[P]>;
      }>,
      'user'
    >
  : never;

let routeMap: Record<string, Handler[]> = null!;

export function execContract<
  T extends ((...args: any[]) => any) & ContractMeta<any>
>(contract: T, params: ExtractParams<T>, accessToken?: string): ReturnType<T> {
  if (!routeMap) {
    routeMap = {};
    loadRoutes({
      post(url: string, handlers: Handler[]) {
        const signature = url.substr(1);
        routeMap[signature] = handlers;
      },
    } as any);
  }
  const handlers = routeMap[contract.getSignature()];
  if (!handlers) {
    throw new Error('Signature not found: ' + contract.getSignature());
  }
  return new Promise<any>((resolve, reject) => {
    const req: any = {
      body: params,
      headers: {},
      header(str: string) {
        if (str === 'authorization') {
          return accessToken;
        }
        return undefined;
      },
    };
    const res: any = {
      json: resolve,
      send: resolve,
    };
    let i = 0;
    const processNext = (err?: any) => {
      if (err) {
        reject(err);
        return;
      }
      const handler = handlers[i];
      if (!handler) {
        reject(new Error('No next handler'));
        return;
      }
      i++;
      handler(req, res, processNext);
    };
    processNext();
  }) as any;
}
