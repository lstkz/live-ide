export type UrlOptions =
  | {
      name: 'login';
    }
  | {
      name: 'register';
    }
  | {
      name: 'reset-password';
    }
  | {
      name: 'home';
    }
  | {
      name: 'contact-us';
    }
  | {
      name: 'terms';
    }
  | {
      name: 'privacy';
    }
  | {
      name: 'pricing';
    }
  | {
      name: 'modules';
    }
  | {
      name: 'roadmap';
    }
  | {
      name: 'faq';
    }
  | {
      name: 'module';
      slug: string;
    }
  | {
      name: 'challenge';
      slug: string;
      solutionId?: string;
    }
  | {
      name: 'profile';
      username: string;
    }
  | {
      name: 'settings';
      sub?: 'account' | 'password' | 'notifications' | 'crypto';
    };

export function createUrl(options: UrlOptions) {
  switch (options.name) {
    case 'home':
      return '/modules';
    case 'module':
      return '/module/' + options.slug;
    case 'profile':
      return '/profile/' + options.username;
    case 'settings':
      return options.sub ? '/settings/' + options.sub : '/settings';
    case 'challenge': {
      let url = `/module/${options.slug}`;
      if (options.solutionId) {
        url += '?solutionId=' + options.solutionId;
      }
      return url;
    }
    default:
      return '/' + options.name;
  }
}

export function parseQueryString(qs: string | null | undefined) {
  return (qs || '')
    .replace(/^\?/, '')
    .split('&')
    .reduce((params, param) => {
      const [key, value] = param.split('=');
      if (key) {
        params[key] = value ? decodeURIComponent(value) : '';
      }
      return params;
    }, {} as Record<string, string>);
}

export function stringifyQueryString(
  params: Record<string, string | number>,
  noEncode = false
) {
  if (!params) {
    return '';
  }
  const keys = Object.keys(params).filter(key => key.length > 0);
  if (!keys.length) {
    return '';
  }
  return (
    '?' +
    keys
      .map(key => {
        if (params[key] == null) {
          return key;
        }
        const value = params[key].toString();
        return `${key}=${noEncode ? value : encodeURIComponent(value)}`;
      })
      .join('&')
  );
}
