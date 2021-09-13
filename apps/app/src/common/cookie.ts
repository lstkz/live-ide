export function createCookie(
  name: string,
  value: string,
  minutes?: number,
  domain?: string
) {
  let expires: string;
  if (minutes) {
    const date = new Date();
    date.setTime(date.getTime() + minutes * 60 * 1000);
    expires = '; expires=' + date.toUTCString();
  } else {
    expires = '';
  }
  domain = domain ? 'domain=' + domain + ';' : '';
  document.cookie = name + '=' + value + expires + ';' + domain + 'path=/';
}

export function readCookie(name: string) {
  return readCookieFromString(document.cookie, name);
}

export function readCookieFromString(
  cookie: string | undefined = '',
  name: string
) {
  const nameEQ = name + '=';
  const ca = cookie.split(';');
  for (let c of ca) {
    while (c.charAt(0) === ' ') {
      c = c.substring(1, c.length);
    }
    if (c.indexOf(nameEQ) === 0) {
      return c.substring(nameEQ.length, c.length);
    }
  }
  return null;
}

export function removeCookie(name: string) {
  createCookie(name, '', -1);
}
