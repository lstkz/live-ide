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
      PORT: String(config.iframe.port ?? 4010),
      PD_PUBLIC_PARENT_ORIGIN: config.iframe.parentOrigin.toString(), 
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
