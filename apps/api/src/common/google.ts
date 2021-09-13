import fetch from 'node-fetch';
import { getResponseBody } from './helper';

interface GoogleUser {
  email: string;
  email_verified: boolean;
}

export async function getEmail(accessToken: string) {
  const ret = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo`, {
    method: 'GET',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  }).then(res => getResponseBody<GoogleUser>('Get user', res));
  if (!ret.email_verified) {
    throw new Error('Your google account is not verified');
  }
  return ret.email;
}
