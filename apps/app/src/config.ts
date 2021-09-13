export const IS_SSR = typeof document === 'undefined';

export const API_URL = process.env.API_URL!;
export const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID!;
export const CDN_BASE_URL = process.env.CDN_BASE_URL!;
export const IFRAME_ORIGIN = process.env.IFRAME_ORIGIN!;

if (!API_URL) {
  throw new Error('API_URL is not set');
}

if (!GITHUB_CLIENT_ID) {
  throw new Error('GITHUB_CLIENT_ID is not set');
}

if (!CDN_BASE_URL) {
  throw new Error('CDN_BASE_URL is not set');
}

if (!IFRAME_ORIGIN) {
  throw new Error('IFRAME_ORIGIN is not set');
}

if (!process.env.BUGSNAG_KEY) {
  throw new Error('BUGSNAG_KEY is not set');
}
export const BUGSNAG_KEY =
  process.env.BUGSNAG_KEY === '-1' ? -1 : process.env.BUGSNAG_KEY;
