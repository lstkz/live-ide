import { createCookie, readCookie, removeCookie } from 'src/common/cookie';

export const getAccessToken = () => {
  return readCookie('token');
};

export const setAccessToken = (token: string) => {
  createCookie('token', token);
};

export const clearAccessToken = () => {
  removeCookie('token');
};

export function saveAuthRedirect(authRedirect: string | null) {
  if (authRedirect) {
    sessionStorage.authRedirect = authRedirect;
  } else {
    delete sessionStorage.authRedirect;
  }
}

export function getAuthRedirect() {
  return sessionStorage.authRedirect;
}
