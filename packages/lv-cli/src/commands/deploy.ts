import { spawn } from 'child_process';
import program from 'commander';
import { getSpawnOptions, cpToPromise } from '../helper';
import { getMaybeStagePasswordEnv } from 'config';

export function init() {
  program
    .command('deploy')
    .option('--stage', 'deploy to stage')
    .option('--prod', 'deploy to prod')
    .action(async ({ stage, prod }) => {
      if (!stage && !prod) {
        throw new Error('stage or prod must be defined');
      }
      await cpToPromise(
        spawn('pulumi', ['up', '-s', stage ? 'dev' : 'prod', '-y'], {
          env: {
            ...process.env,
            ...getMaybeStagePasswordEnv(stage),
          },
          ...getSpawnOptions('deploy'),
        })
      );
    });
}
