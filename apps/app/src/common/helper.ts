import { GetServerSideProps, NextPageContext } from 'next';
import { APIClient } from 'shared';
import * as R from 'remeda';
import { API_URL, CDN_BASE_URL } from 'src/config';
import { readCookieFromString } from './cookie';

export class UnreachableCaseError extends Error {
  constructor(val: never) {
    super(
      `Unreachable case: ${typeof val === 'string' ? val : JSON.stringify(val)}`
    );
  }
}

export const createGetServerSideProps: <T>(
  fn: GetServerSideProps<T>
) => GetServerSideProps<T> = fn => async context => {
  try {
    return await fn(context);
  } catch (e: any) {
    if (e.res?.status === 401) {
      context.res.setHeader(
        'Set-Cookie',
        'token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      );
      return {
        redirect: {
          destination: '/login',
          permanent: false,
        },
      };
    }
    throw e;
  }
};

export function doFn<T>(fn: () => T): T {
  return fn();
}

export function safeAssign<T>(obj: T, values: Partial<T>) {
  return Object.assign(obj, values);
}

export function safeExtend<T, U>(obj: T, values: U): T & U {
  return Object.assign(obj, values);
}

export function safeKeys<T>(obj: T): Array<keyof T> {
  return Object.keys(obj) as any;
}

export function getErrorMessage(e: any) {
  if (e?.status === 0) {
    return 'Cannot connect to API';
  }
  const message = e?.response?.error || e.message;
  return message.replace('ContractError: ', '');
}

export function getAvatarUrl(avatarId: string, size: 80 | 280) {
  return CDN_BASE_URL + `/avatars/${avatarId}-${size}x${size}.png`;
}

export function getCDNUrl(s3Key: string) {
  return CDN_BASE_URL + s3Key.replace(/^cdn/, '');
}

export function createSSRClient<
  T extends {
    req?: NextPageContext['req'];
  }
>(ctx: T) {
  const token = readCookieFromString(
    ctx?.req?.headers['cookie'] ?? '',
    'token'
  );
  return new APIClient(API_URL, () => token);
}

export function getDifficulties<
  T extends {
    difficulty: string;
  }
>(items: T[]) {
  const ret = R.pipe(
    items,
    R.map(x => x.difficulty),
    R.uniq()
  );
  const order = ['beginner', 'easy', 'medium', 'hard', 'expert', 'various'];
  ret.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  return ret;
}

export function formatTotalTime(minutes: number) {
  if (minutes < 60) {
    return minutes + 'm';
  }
  return Math.ceil(minutes / 60) + 'h';
}
