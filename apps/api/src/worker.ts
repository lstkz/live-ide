import { ampq } from './lib';
import { reportError } from './common/bugsnag';
import { getBindings } from './common/bindings';
import { logger } from './common/logger';
import { connect } from './db';
import { startSchedular } from './schedular';
import { setupGracefulShutdown } from './shutdown';

async function start() {
  await connect();
  getBindings('task').forEach(binding => {
    ampq.addTaskHandler({
      type: binding.type,
      onMessage: message => {
        return binding.handler(message.id, message.payload);
      },
    });
  });
  getBindings('event').forEach(binding => {
    ampq.addEventHandler({
      type: binding.type,
      onMessage: message => {
        return binding.handler(message.id, message.payload);
      },
    });
  });

  await ampq.connect(['publish', 'subscribe']);
  logger.info('Worker started');
  await startSchedular();
  logger.info('Schedular started');
}

start().catch(e => {
  reportError({
    error: e,
    source: 'worker',
    data: {
      info: 'Error when starting a worker',
    },
  });
  process.exit(1);
});

setupGracefulShutdown();
