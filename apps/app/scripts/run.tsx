import cp from 'child_process';
import Path from 'path';
import { AppConfig } from 'config/types';

export function runScript(
  config: AppConfig,
  cmd: string,
  nodeEnv: 'development' | 'production'
) {
  const p = cp.spawn(cmd, {
    shell: true,
    cwd: Path.join(__dirname, '..'),
    stdio: 'inherit' as const,
    env: {
      ...process.env,
      NODE_ENV: nodeEnv,
      ASSET_PREFIX: config.web.useCDN ? '/cdn/' : undefined,
      LV_PUBLIC_BUGSNAG_API_KEY: config.bugsnag.frontKey.toString(),
      LV_PUBLIC_GITHUB_CLIENT_ID: config.github.clientId,
      LV_PUBLIC_API_URL: config.apiBaseUrl,
      LV_PUBLIC_PROTECTED_BASE_URL: config.apiBaseUrl,
      LV_PUBLIC_CDN_BASE_URL: config.cdnBaseUrl,
      LV_PUBLIC_IFRAME_ORIGIN: config.iframe.origin,
      LV_PUBLIC_BUGSNAG_KEY: (config.bugsnag?.frontKey ?? -1).toString(),
    },
  });

  p.addListener('error', error => {
    console.error(error);
    process.exit(1);
  });

  p.addListener('exit', code => {
    process.exit(code ?? 0);
  });
}
