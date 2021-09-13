import fetch from 'cross-fetch';

// IMPORTS
import { User } from './types';
// IMPORTS END

export class APIClient {
  constructor(
    private baseUrl: string,
    public getToken: () => string | null,
    private agent?: any
  ) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  hasToken() {
    return this.getToken() != null;
  }

  // SIGNATURES

  user_getMe(): Promise<User> {
    return this.call('user.getMe', {});
  }
  user_logout(): Promise<void> {
    return this.call('user.logout', {});
  }
  // SIGNATURES END
  private async call(name: string, params: any): Promise<any> {
    const token = this.getToken();
    const headers: any = {
      'content-type': 'application/json',
    };
    if (token) {
      headers['authorization'] = token;
    }

    const res = await fetch(`${this.baseUrl}/rpc/${name}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(params),
      // @ts-ignore
      agent: this.agent,
    });
    const body = await res.json();
    if (res.status !== 200) {
      const err: any = new Error(body.error || 'Failed to call API');
      err.res = res;
      err.body = body;
      throw err;
    }
    return body;
  }
}
