import { config } from 'config';
import fetch from 'node-fetch';
import { getResponseBody } from './helper';

const BASE_URL = `https://api.github.com`;

function getHeaders(accessToken?: string) {
  const ret: Record<string, string> = {
    accept: 'application/json',
    'content-type': 'application/json',
  };
  if (accessToken) {
    ret.authorization = `token ${accessToken}`;
  }
  return ret;
}

export async function exchangeCode(code: string) {
  const res = await fetch(`https://github.com/login/oauth/access_token`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code,
    }),
  });
  const body = await getResponseBody('Exchange code', res);
  if (!body.access_token) {
    const msg = 'Exchange code failed: access_token missing in response';
    console.error(msg, {
      body,
    });
    throw new Error(msg);
  }
  return body.access_token;
}

interface SharedGithubData {
  id: number;
  name?: string;
  blog?: string;
  location?: string;
  country?: string;
  bio?: string;
  avatar_url?: string;
}

export interface GitHubUserData extends SharedGithubData {
  id: number;
  username: string;
  email: string;
}

interface GithubUser extends SharedGithubData {
  login: string;
}

interface GithubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
}

export async function getUserData(accessToken: string) {
  const [user, emails] = await Promise.all([
    fetch(`${BASE_URL}/user`, {
      method: 'GET',
      headers: getHeaders(accessToken),
    }).then(res => getResponseBody<GithubUser>('Get user', res)),
    fetch(`${BASE_URL}/user/emails`, {
      method: 'GET',
      headers: getHeaders(accessToken),
    }).then(res => getResponseBody<GithubEmail[]>('Get user emails', res)),
  ]);
  const userData: GitHubUserData = {
    ...user,
    username: user.login,
    email: '',
  };

  const email = emails.find(item => item.primary && item.verified);
  if (!email) {
    throw new Error(
      "Your github account doesn't have associated email address"
    );
  }

  userData.email = email.email;
  return userData;
}
