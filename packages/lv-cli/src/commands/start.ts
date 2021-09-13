import { spawn } from 'child_process';
import program from 'commander';
import { validateApp, getSpawnOptions } from '../helper';

export function init() {
  program
    .command('start <app>')
    .option('-p, --prod', 'start in production mode')
    .action(async (app, { prod }) => {
      const isWorker = app === 'worker';
      const isApi = app === 'api';
      if (isWorker) {
        app = 'api';
      }
      validateApp(app);
      spawn(
        'yarn',
        [
          'run',
          prod
            ? isWorker
              ? 'start:worker'
              : isApi
              ? 'start:api'
              : 'start'
            : 'dev',
        ],
        {
          env: {
            ...process.env,
          },
          ...getSpawnOptions(app),
        }
      );
    });
}
