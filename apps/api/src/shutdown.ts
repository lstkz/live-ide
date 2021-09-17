import { getDuration } from './common/helper';
import { logger } from './common/logger';

const actions: Array<{ priority: number; action: () => Promise<any> }> = [];

export function addShownDownAction(
  priority: number,
  action: () => Promise<any>
) {
  actions.push({ priority, action });
}

export function setupGracefulShutdown() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }
  const signals = ['SIGTERM', 'SIGINT'];
  signals.forEach(signal => {
    process.on(signal, async () => {
      signals.forEach(s => process.removeAllListeners(s));
      logger.info(`received ${signal}: shuting down`);
      actions.sort((a, b) => b.priority - a.priority);
      setTimeout(() => {
        logger.info('Failed to graceful shutdown. Forcing exit.');
        process.exit(0);
      }, getDuration(3, 'm'));
      try {
        for (const { action } of actions) {
          await action();
        }
        logger.info('shutdown success');
        process.exit(0);
      } catch (e) {
        logger.error(e);
        logger.error('An error during graceful shutdown', e);
        process.exit(0);
      }
    });
  });
}
