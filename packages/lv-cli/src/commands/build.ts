import { spawn } from 'child_process';
import program from 'commander';
import { getMaybeStagePasswordEnv } from 'config';
import { validateApp, getSpawnOptions, cpToPromise } from '../helper';

export function build(app: string, { stage }: { stage?: boolean }) {
  validateApp(app);
  return cpToPromise(
    spawn('yarn', ['run', 'build'], {
      env: {
        ...process.env,
        ...getMaybeStagePasswordEnv(stage),
      },
      ...getSpawnOptions(app),
    })
  );
}

export function init() {
  program
    .command('build <app>')
    .option('--stage', 'use stage settings')
    .action(async (app, { stage }) => {
      validateApp(app);
      await build(app, { stage });
    });
}
